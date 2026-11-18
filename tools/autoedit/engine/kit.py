"""gx-dashcam-s10 channel kit (Abyssal look, SOP §2.4-safe). numpy + PIL + cv2 + ffmpeg pipes, no Remotion.
All devices are pure functions of (frame, local frame index f, params) -> new uint8 HxWx3 frame, so farm chunks are
deterministic. Motion is eased (smootherstep / quint / sine); every entry >= 18 f. No cyan, no typewriter faces,
no berg, no glitch, no moving grain, no CRT/VHS, no underlines, no word-list boxes.
Fonts: build/fonts/BebasNeue-Regular.ttf (card titles), build/fonts/JetBrainsMono-wght.ttf @700 (all small mono caps).
Sources are untrusted media: only decoded by ffmpeg/PIL, never executed."""
import math, os, subprocess, random
import numpy as np
import cv2
from PIL import Image, ImageDraw, ImageFont

W, H, FPS = 1920, 1080, 30
HERE = os.path.dirname(os.path.abspath(__file__))
_FONTS = next((d for d in (os.environ.get('AUTOEDIT_FONTS'), os.path.join(HERE, 'fonts'),
                           os.path.join(os.environ.get('AUTOEDIT_MEDIA', ''), 'build', 'fonts')) if d and os.path.isdir(d)),
              os.path.join(HERE, 'fonts'))   # fonts are not in the public repo: farm part build/fonts or env
F_TITLE = os.path.join(_FONTS, 'BebasNeue-Regular.ttf')
F_MONO = os.path.join(_FONTS, 'JetBrainsMono-wght.ttf')
ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', '30']

# palette (no cyan anywhere)
OFFWHITE = (242, 240, 236)
RED = (216, 49, 43)          # cursor, pin, accents
AMBER = (232, 160, 48)       # page marker (ref 2d2735 band #DC9B29)
ORANGE = (234, 84, 22)       # name box (ref #EC4A0A)
YELLOW = (244, 224, 77)      # second speaker in captions
INK = (12, 10, 8)

# ---------------------------------------------------------------- easing
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))
def smootherstep(t): t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10)
def quint_io(t): t = clamp(t); return 16 * t ** 5 if t < 0.5 else 1 - (-2 * t + 2) ** 5 / 2
def quint_out(t): t = clamp(t); return 1 - (1 - t) ** 5
def sine_io(t): t = clamp(t); return 0.5 - 0.5 * math.cos(math.pi * t)
def prog(f, f0, n, ease=smootherstep): return ease((f - f0) / max(1, n))
def lerp(a, b, t): return a + (b - a) * t


# ---------------------------------------------------------------- fonts / text
_fc = {}
def font(path, px, wght=700):
    k = (path, int(px), wght)
    if k not in _fc:
        f = ImageFont.truetype(path, int(px))
        if 'wght' in os.path.basename(path):
            try: f.set_variation_by_axes([wght])
            except Exception: pass
        _fc[k] = f
    return _fc[k]


def text_rgba(text, fnt, fill=OFFWHITE, track=0.0, stroke=0, stroke_fill=(0, 0, 0, 210), pad=None):
    """Tight RGBA PIL image of one text line with letter tracking (px). Returns (img, baseline_y_in_img)."""
    pad = pad if pad is not None else stroke + 4
    d0 = ImageDraw.Draw(Image.new('L', (1, 1)))
    ws = [d0.textlength(c, font=fnt) for c in text]
    tw = sum(ws) + track * max(0, len(text) - 1)
    asc, desc = fnt.getmetrics()
    im = Image.new('RGBA', (int(math.ceil(tw)) + 2 * pad, asc + desc + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(im); x = pad
    for c, w in zip(text, ws):
        d.text((x, pad), c, font=fnt, fill=fill + (255,) if len(fill) == 3 else fill, stroke_width=stroke, stroke_fill=stroke_fill)
        x += w + track
    return im, pad + asc


def over(a, rgba, x, y, alpha=1.0):
    """Composite RGBA (PIL or np) onto uint8/float frame a at integer top-left (x, y). Returns float32 frame."""
    a = a.astype(np.float32) if a.dtype != np.float32 else a.copy()
    o = np.asarray(rgba, np.float32)
    h, w = o.shape[:2]; x, y = int(round(x)), int(round(y))
    x0, y0, x1, y1 = max(0, x), max(0, y), min(a.shape[1], x + w), min(a.shape[0], y + h)
    if x1 <= x0 or y1 <= y0 or alpha <= 0: return a
    o = o[y0 - y:y1 - y, x0 - x:x1 - x]
    al = o[..., 3:4] / 255 * alpha
    a[y0:y1, x0:x1] = a[y0:y1, x0:x1] * (1 - al) + o[..., :3] * al
    return a


def u8(a): return np.clip(a, 0, 255).astype(np.uint8)


# ---------------------------------------------------------------- video io
def _vf(mode, fps, crop=None):
    conform = f'fps={fps}' if fps else 'null'
    if crop: conform += ',crop=%d:%d:%d:%d' % tuple(crop)        # source-px pre-crop (w, h, x, y): pillarbox / overlays
    if mode == 'blurfill':   # vertical / small sources: sharp fit over an enlarged blurred copy
        return (f'{conform},split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},'
                f'boxblur=40:2,eq=brightness=-0.08[bg];[b]scale={W}:{H}:force_original_aspect_ratio=decrease[fg];'
                f'[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1,format=rgb24')
    return f'{conform},scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},setsar=1,format=rgb24'


def read_frames(src, ss, dur, mode='cover', fps=FPS, crop=None):
    """Yield exactly round(dur*30) RGB uint8 frames from src at ss, conformed to 30 fps CFR (fps filter, no
    minterpolate), scaled cover (crop) or blurfill to 1920x1080. Pads with the last frame if the source runs short."""
    n = round(dur * FPS)
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ss:.3f}', '-t', f'{dur + 0.5:.3f}', '-i', src, '-an',
           '-filter_complex' if mode == 'blurfill' else '-vf', _vf(mode, fps, crop), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
    last = np.zeros((H, W, 3), np.uint8)
    try:
        for _ in range(n):
            b = p.stdout.read(W * H * 3)
            if len(b) == W * H * 3: last = np.frombuffer(b, np.uint8).reshape(H, W, 3)
            yield last
    finally:
        p.kill(); p.wait()


def read_frame(src, t, mode='cover', crop=None):
    return next(read_frames(src, t, 1 / FPS, mode, crop=crop))


def write_frames(path, frames, enc=ENC):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', *enc, str(path)], stdin=subprocess.PIPE)
    n = 0
    for f in frames: p.stdin.write(np.ascontiguousarray(u8(f)).tobytes()); n += 1
    p.stdin.close()
    if p.wait(): raise RuntimeError(f'encode failed {path}')
    return n


# ---------------------------------------------------------------- grade
_YY, _XX = np.mgrid[0:H, 0:W].astype(np.float32)
_R = np.hypot((_XX - W / 2) / (W / 2), (_YY - H / 2) / (H / 2))
del _YY, _XX


def vignette(strength=0.45, start=0.42):
    """Smooth radial gain map (1 at centre, 1-strength at the corners)."""
    return (1 - strength * smootherstep_arr(np.clip((_R - start) / (1.414 - start), 0, 1)))[..., None].astype(np.float32)


def smootherstep_arr(t): return t * t * t * (t * (t * 6 - 15) + 10)


VIG = vignette(0.45)
TINTS = {None: (1.0, 1.0, 1.0), 'red': (1.22, 0.80, 0.76), 'sepia': (1.12, 0.98, 0.78), 'amber': (1.15, 1.0, 0.70), 'bw': None}


def shot_gamma(frames, target=0.27):
    """One exposure gamma per shot (stable, no flicker): maps the shot's mean luma (after black pin) to ~target
    (ref YAVG 52-73 -> 0.20-0.29 before vignette). Bounded 0.6..2.0. Pass the result to grade(gamma=...)."""
    m = float(np.mean([cv2.resize(f, (W // 8, H // 8), interpolation=cv2.INTER_AREA).astype(np.float32).mean() / 255 for f in frames]))
    m = clamp((m - 0.03) / 0.95, 0.02, 0.98)
    return clamp(math.log(target) / math.log(m), 0.6, 2.0)


def grade(a, tint=None, sat=0.36, lift=1.0, vig=VIG, halation=0.10, gamma=None):
    """Abyssal body grade: black pin, gentle S-curve, low saturation, cool shadows / warm highlights, soft warm halation,
    vignette. Static (no grain, no noise). tint: None | 'red' | 'sepia' | 'amber' | 'bw' (no teal/cyan: SOP 2.4).
    Targets (ref measures): mean luma ~55-70, p5 ~4, p95 ~190, low sat; details stay readable."""
    f = a.astype(np.float32) / 255
    f = np.clip((f - 0.03) / 0.95, 0, 1) * lift                          # black pin
    if gamma is None: gamma = shot_gamma([a])
    f = np.clip(f, 0, 1) ** np.float32(gamma)                            # per-shot exposure toward ref luma
    f = np.where(f > 0.66, 0.66 + (f - 0.66) * 0.50, f)                  # highlight shoulder (p95 ~190)
    s = f * f * (3 - 2 * f); f = f * 0.55 + s * 0.45                     # soft S-curve
    g = (f * np.float32((0.299, 0.587, 0.114))).sum(2, keepdims=True)
    if tint == 'bw': f = np.repeat(g, 3, 2)
    else:
        f = g + (f - g) * sat
        if TINTS.get(tint) and tint: f = g + (f - g) * 0.6 + g * (np.float32(TINTS[tint]) - 1) * 0.55
    sh = np.clip(1 - g * 2.2, 0, 1)                                      # cool shadows (blue-grey, not cyan)
    hi = np.clip((g - 0.55) * 2.2, 0, 1)                                 # warm highlights
    f = f + sh * np.float32((-0.010, -0.002, 0.016)) + hi * np.float32((0.025, 0.010, -0.020))
    if halation:
        small = cv2.resize(np.clip((f - 0.62) * 2.6, 0, 1), (W // 8, H // 8), interpolation=cv2.INTER_AREA)
        small = cv2.GaussianBlur(small, (0, 0), 6)
        f = f + cv2.resize(small, (W, H), interpolation=cv2.INTER_LINEAR) * np.float32((1.0, 0.72, 0.5)) * halation
    if vig is not None: f = f * vig
    return u8(f * 255)


# ---------------------------------------------------------------- censor
class KeyBoxes:
    """Keyframed boxes [(t_sec, (x0,y0,x1,y1)), ...] in output px (1920x1080), eased (smootherstep) between keys."""
    def __init__(self, keys): self.k = sorted(keys, key=lambda k: k[0])

    def at(self, t):
        k = self.k
        if t <= k[0][0]: return k[0][1]
        if t >= k[-1][0]: return k[-1][1]
        for (t0, b0), (t1, b1) in zip(k, k[1:]):
            if t0 <= t <= t1:
                e = smootherstep((t - t0) / max(1e-6, t1 - t0))
                return tuple(lerp(p, q, e) for p, q in zip(b0, b1))


def soft_blur(a, box, sigma=None, feather=0.22):
    """Soft gaussian blur inside box with a feathered elliptical edge (faces, plates, overlays)."""
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    bw, bh = max(2, x1 - x0), max(2, y1 - y0)
    m = int(max(bw, bh) * feather) + 4
    X0, Y0, X1, Y1 = max(0, x0 - m), max(0, y0 - m), min(W, x1 + m), min(H, y1 + m)
    reg = a[Y0:Y1, X0:X1].astype(np.float32)
    sg = sigma or max(6.0, min(bw, bh) / 5)
    bl = cv2.GaussianBlur(reg, (0, 0), sg)
    mk = np.zeros(reg.shape[:2], np.float32)
    cv2.rectangle(mk, (x0 - X0, y0 - Y0), (x1 - X0, y1 - Y0), 1.0, -1)
    mk = cv2.GaussianBlur(mk, (0, 0), m / 2.5)[..., None]
    mk = np.clip(mk * 1.6, 0, 1)
    out = a.astype(np.float32).copy()
    out[Y0:Y1, X0:X1] = reg * (1 - mk) + bl * mk
    return out


def mosaic(a, box, cell=None):
    """Square pixel blocks (ref cells 3-4 % of frame width) inside box."""
    x0, y0, x1, y1 = [int(round(v)) for v in box]
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 - x0 < 2 or y1 - y0 < 2: return a
    c = int(cell or W * 0.035)
    out = a.copy(); reg = out[y0:y1, x0:x1]
    sm = cv2.resize(reg, (max(1, (x1 - x0) // c), max(1, (y1 - y0) // c)), interpolation=cv2.INTER_AREA)
    out[y0:y1, x0:x1] = cv2.resize(sm, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
    return out


# ---------------------------------------------------------------- camera / transitions
def camera(a, s=1.0, cx=0.5, cy=0.5, dx=0.0, dy=0.0):
    """Sub-pixel zoom s around (cx, cy) (0-1 of frame) + px offset; edges reflect (never black)."""
    cw, ch = W / s, H / s
    x0 = min(max(cx * W - cw / 2 + dx, 0), W - cw); y0 = min(max(cy * H - ch / 2 + dy, 0), H - ch)
    M = np.float32([[1 / s, 0, x0], [0, 1 / s, y0]])
    return cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_CUBIC | cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)


def push(a, f, nf, rate=0.015, cx=0.5, cy=0.5, ease=sine_io, drift=(0.0, 0.0)):
    """Footage push-in (rule: 1-2 %/s) eased over the clip, optional slow px drift (dx, dy over the clip)."""
    t = ease(f / max(1, nf - 1)); s = 1 + rate * (nf / FPS) * t
    return camera(a, s, cx, cy, drift[0] * t, drift[1] * t)


def dip(a, f, nf, down=8, up=7, mode='out'):
    """15 f dip to black (8 down, 7 up, eased). mode 'out' = last `down` frames of a shot, 'in' = first `up` frames."""
    if mode == 'out': k = (nf - 1 - f) / down if f >= nf - down else 1.0
    else: k = f / up if f < up else 1.0
    return a.astype(np.float32) * smootherstep(k)


def crossfade(a, b, k):
    """Eased crossfade a->b, k in 0..1 (15 f default per rule 55)."""
    e = smootherstep(k); return a.astype(np.float32) * (1 - e) + b.astype(np.float32) * e


# ---------------------------------------------------------------- small mono devices
def _cursor_block(fnt):
    asc, desc = fnt.getmetrics(); return int(fnt.size * 0.58), int(asc * 0.98)


def typed_date(a, f, text, where='corner', rate=0.6, alpha=1.0, blink=True):
    """Typed date, mono bold caps with dark edge, red block cursor after the last typed char.
    where='corner': small top-left (cap ~3 % H, x 4.5 %, y 7 %). where='center': big centred (cap ~9.5 % H, y 49 %)."""
    text = text.upper()
    px = H * (0.040 if where == 'corner' else 0.125)
    fnt = font(F_MONO, px, 800)
    n = min(len(text), int(max(0, f) * rate))
    shown = text[:n]
    full, base = text_rgba(text, fnt, OFFWHITE, track=px * 0.04, stroke=max(2, int(px * 0.05)))
    im, _ = text_rgba(shown, fnt, OFFWHITE, track=px * 0.04, stroke=max(2, int(px * 0.05))) if shown else (None, 0)
    if where == 'corner': x, y = W * 0.045, H * 0.065
    else: x, y = (W - full.width) / 2, H * 0.49 - full.height / 2
    out = a.astype(np.float32)
    if im is not None: out = over(out, im, x, y, alpha)
    cw, ch = _cursor_block(fnt)
    done = n >= len(text)
    on = (not done) or (not blink) or ((f - len(text) / rate) // 15) % 2 == 0
    if on:
        cx = x + (im.width - 4 - max(2, int(px * 0.05)) if im is not None else 4) + px * 0.06
        blk = np.zeros((ch, cw, 4), np.uint8); blk[...] = RED + (235,)
        out = over(out, blk, cx, y + base - ch + 2, alpha)
    return out


def source_credit(a, text, alpha=1.0):
    """Tiny white mono caps bottom-left ('YOUTUBE: NAME' / 'POLICE RELEASE: DEPT'), static, ~1.8 % H."""
    fnt = font(F_MONO, H * 0.027, 700)
    im, _ = text_rgba(text.upper(), fnt, (236, 234, 230), track=H * 0.027 * 0.06, stroke=2, stroke_fill=(0, 0, 0, 170))
    return over(a, im, W * 0.022, H * 0.962 - im.height / 2, alpha * 0.92)


_SAFE_SH = None
def safety_note(a, alpha=1.0):
    """'VISUALS ALTERED FOR VISUAL SAFETY' bottom-right edge (ref: y 97-99 %, bold small caps) on a soft dark blob."""
    global _SAFE_SH
    fnt = font(F_MONO, H * 0.027, 800)
    im, _ = text_rgba('VISUALS ALTERED FOR VISUAL SAFETY', fnt, (244, 244, 242), track=1, stroke=1, stroke_fill=(0, 0, 0, 180))
    if _SAFE_SH is None:
        m = np.zeros((H, W), np.float32)
        cv2.ellipse(m, (int(W - im.width / 2 - 20), H - 18), (int(im.width * 0.62), 46), 0, 0, 360, 0.55, -1)
        _SAFE_SH = cv2.GaussianBlur(m, (0, 0), 24)[..., None]
    out = a.astype(np.float32) * (1 - _SAFE_SH * alpha)
    return over(out, im, W - im.width - W * 0.012, H * 0.979 - im.height / 2, alpha)


def caption(a, text, speaker=0, alpha=1.0, bracket=False, y=None):
    """Raw-speech caption: one line, mono bold, white (speaker 0) or yellow (speaker 1), dark outline, no box,
    bottom-centre (cap ~3 % H, y ~94 %). Bleeps are passed in as '—'. Hard swap per line (caller sets alpha 1/0)."""
    px = H * 0.047
    fnt = font(F_MONO, px, 700)
    col = YELLOW if speaker else (246, 244, 240)
    words, lines = text.split(), ['']
    for w_ in words:                                       # wrap at ~58 % width (max 2 lines)
        t = (lines[-1] + ' ' + w_).strip()
        if ImageDraw.Draw(Image.new('L', (1, 1))).textlength(t, font=fnt) > W * 0.62 and lines[-1]: lines.append(w_)
        else: lines[-1] = t
    if len(lines) == 2:                                    # balance 2 lines (no orphan word)
        best = min(range(1, len(words)), key=lambda i: abs(len(' '.join(words[:i])) - len(' '.join(words[i:]))))
        lines = [' '.join(words[:best]), ' '.join(words[best:])]
    out = a.astype(np.float32)
    yb = H * (y if y else (0.955 if bracket else 0.935))           # raise y (e.g. 0.86) over burned-in timestamps
    for i, ln in enumerate(reversed(lines)):
        im, _ = text_rgba(ln, fnt, col, stroke=3, stroke_fill=(0, 0, 0, 230))
        out = over(out, im, (W - im.width) / 2, yb - im.height / 2 - i * px * 1.3, alpha)
    return out


def _rough_poly(x0, y0, bw, bh, seed=7, amp=2.5):
    r = random.Random(seed); P = []
    for i in range(0, int(bw) + 1, 22): P.append((x0 + i, y0 + r.uniform(-amp, amp * 0.6)))
    for i in range(0, int(bh) + 1, 12): P.append((x0 + bw + r.uniform(-amp * 0.6, amp), y0 + i))
    for i in range(int(bw), -1, -22): P.append((x0 + i, y0 + bh + r.uniform(-amp * 0.6, amp)))
    for i in range(int(bh), -1, -12): P.append((x0 + r.uniform(-amp, amp * 0.6), y0 + i))
    return P


def name_box(a, f, text, y=0.845, alpha=1.0, rate=0.6):
    """Orange name box (ref: 37 % w x ~9.5 % H, centred, y 80-89 %), black mono bold mixed case.
    In: orange line grows L->R (18 f, smootherstep), box opens to full height (10 f), text types `rate` chars/f."""
    fnt = font(F_MONO, H * 0.042, 800)
    tw = ImageDraw.Draw(Image.new('L', (1, 1))).textlength(text, font=fnt)
    bw, bh = max(W * 0.37, tw + W * 0.05), H * 0.092
    x0, cy = (W - bw) / 2, H * y
    g = prog(f, 0, 18); o = prog(f, 14, 10)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if g > 0 and o <= 0:
        d.rectangle((x0, cy - 3, x0 + bw * g, cy + 3), fill=ORANGE + (255,))
    if o > 0:
        h = max(6, bh * o); y0 = cy - h / 2
        poly = _rough_poly(x0, y0, bw, h)
        d.polygon([(px + 5, py + 5) for px, py in poly], fill=(0, 0, 0, 140))
        d.polygon(poly, fill=ORANGE + (255,), outline=(70, 24, 0, 255))
        n = int(max(0, f - 24) * rate)
        if n > 0 and o >= 1: d.text((W / 2 - tw / 2, cy), text[:n], font=fnt, fill=INK + (255,), anchor='lm')
    return over(a, im, 0, 0, alpha)


# ---------------------------------------------------------------- CASE title card
def _grunge(seed, shape):
    rng = np.random.default_rng(seed)
    blot = cv2.resize((rng.random((shape[0] // 6, shape[1] // 6)) * 255).astype(np.uint8), (shape[1], shape[0]))
    blot = cv2.GaussianBlur(blot, (0, 0), 2.2)
    speck = rng.random(shape) > 0.965
    return (np.where(blot > 205, 0.62, 1.0) * np.where(speck, 0.55, 1.0)).astype(np.float32)


def title_plate(still):
    """Dark plate from the case's own footage still: heavy blur, near-mono, very dark, strong vignette."""
    p = cv2.GaussianBlur(still.astype(np.float32), (0, 0), 18)
    g = p.mean(2, keepdims=True); p = g + (p - g) * 0.18
    return p * 0.30 * vignette(0.70, 0.25)


def title_card(f, nf, num, name, plate=None, seed=11):
    """CASE title card (new design): dark footage-plate, small red 'CASE 01' line in tracked Bebas, case name in big
    textured off-white Bebas (block ~50 % w, centred y ~50 %). Lines rise out of their baselines with a soft blur
    (24 f, staggered 8 f), very slow gentle shake (smooth 2-3 px), eased push-in 1.00->1.05 over the card, soft
    blur+fade exit over the last 15 f, fade from black over the first 12 f. No typewriter, no cyan, no berg."""
    base = plate if plate is not None else np.full((H, W, 3), 10, np.float32) * vignette(0.6, 0.2)
    key = (num, name, seed)
    if _TC.get('k') != key:
        lines = []
        f1 = font(F_TITLE, H * 0.072)
        im1, _ = text_rgba(f'CASE {num:02d}' if isinstance(num, int) else str(num), f1, RED, track=H * 0.072 * 0.32)
        sz = H * 0.165
        while True:
            f2 = font(F_TITLE, sz); im2, _ = text_rgba(name.upper(), f2, OFFWHITE, track=sz * 0.035)
            if im2.width <= W * 0.62 or sz < H * 0.06: break
            sz *= 0.94
        gr = _grunge(seed, (im2.height, im2.width))
        a2 = np.asarray(im2, np.float32); a2[..., 3] *= gr
        lines = [(np.asarray(im1, np.float32), H * 0.395, 0), (a2, H * 0.52, 8)]
        _TC.update(k=key, lines=lines)
    lines = _TC['lines']
    fr = base.astype(np.float32).copy()
    exit_k = prog(f, nf - 15, 15, quint_io)
    for arr, cy, st in lines:
        k = prog(f, 10 + st, 24, quint_out)
        if k <= 0: continue
        h_ = arr.shape[0]; rise = (1 - k) * h_ * 0.45
        sig = 6 * (1 - k) + 5 * exit_k
        lay = arr.copy()
        if sig > 0.4: lay = cv2.GaussianBlur(lay, (0, 0), sig)
        # baseline mask: text emerges from its own baseline (clip below the line's box)
        clip = np.ones((h_, 1, 1), np.float32)
        lim = int(h_ - rise)
        clip[max(0, lim):] = 0
        lay[..., 3:4] *= clip if k < 1 else 1
        fr = over(fr, lay, (W - arr.shape[1]) / 2, cy - h_ / 2 + rise, k * (1 - exit_k))
    s = 1.0 + 0.05 * smootherstep(f / max(1, nf - 1))
    t = f / FPS
    dx = 2.4 * math.sin(2 * math.pi * 0.31 * t) + 1.1 * math.sin(2 * math.pi * 0.73 * t + 1.3)
    dy = 1.8 * math.cos(2 * math.pi * 0.27 * t + 0.4) + 0.9 * math.sin(2 * math.pi * 0.61 * t)
    fr = camera(fr, s, 0.5, 0.5, dx, dy)
    fr = fr * smootherstep(f / 12) * (1 - 0.85 * exit_k)
    return fr
_TC = {}


# ---------------------------------------------------------------- page highlight (Abyssal rule 66)
_COLC = {}
def _text_column(pg, kx0, kx1, ky, band=160, gap=140):
    """x-extent (page px) of the text column holding the key line: dark-ink columns in rows ky+-band, contiguous
    (gaps < gap px) span that contains the key line. B7 fix for pages cut off at the left edge."""
    k = (id(pg), int(kx0), int(kx1), int(ky))
    if k in _COLC: return _COLC[k]
    y0, y1 = int(max(0, ky - band)), int(min(pg.shape[0], ky + band))
    ink = (pg[y0:y1].mean(2) < 110).mean(0) > 0.004
    xs = np.flatnonzero(ink)
    a, b = int(kx0), int(kx1)
    if len(xs):
        left = xs[xs < a][::-1]
        for x in left:
            if a - x < gap: a = int(x)
            else: break
        for x in xs[xs > b]:
            if x - b < gap: b = int(x)
            else: break
    _COLC[k] = (a, b)
    return a, b


def page_highlight(page, f, nf, lines, key=None, start=48, sec_per_line=0.75, push=(1.0, 1.06), drift=0.14):
    """Real page (PIL/np RGB, page px). lines = up to 2 boxes (x0,y0,x1,y1) in page px of the key line(s)
    (from research/cNN_pages/boxes.json, measured on the actual words). Page shown flat full-frame with the key line
    at ~62 % of frame width; lands by hard cut, drifts up `drift`*H over 1.5 s (quint out) to a hold, slow push
    push[0]->push[1] (sine) centred on the key line. Amber marker band wipes LEFT->RIGHT from `start` f as one pen
    stroke (sine ease, ~0.75 s per full line), rough top/bottom ink edge, ~2 px corners, black ink shadow down-right
    that is thick at the moving pen edge; multiply blend so the text stays readable. No dimming of the page."""
    pg = np.asarray(page, np.float32)
    lines = lines[:2]
    kx0 = min(b[0] for b in lines); kx1 = max(b[2] for b in lines)
    ky = (min(b[1] for b in lines) + max(b[3] for b in lines)) / 2
    widths = [b[2] - b[0] for b in lines]
    full = max(widths)
    total = sum(widths)
    dur = max(18, sec_per_line * FPS * total / max(full, 1))
    p = sine_io((f - start) / dur) if f >= start else 0.0
    band = np.ones_like(pg); shadow = np.zeros(pg.shape[:2], np.float32)
    if p > 0:
        rng = np.random.default_rng(5)
        done = p * total; acc = 0
        for (x0, y0, x1, y1), w_ in zip(lines, widths):
            seg = clamp((done - acc) / w_); acc += w_
            if seg <= 0: break
            hh = (y1 - y0); pad = hh * 0.22
            bx0, bx1 = int(x0 - hh * 0.15), int(x0 - hh * 0.15 + (x1 - x0 + hh * 0.3) * seg)
            by0, by1 = int(y0 - pad), int(y1 + pad * 0.7)
            m = np.zeros(pg.shape[:2], np.float32)
            xs = np.arange(bx0, max(bx0 + 1, bx1))
            top = by0 + rng.normal(0, 0.9, len(xs)).cumsum().clip(-2, 2)   # rough ink edge
            bot = by1 + rng.normal(0, 0.9, len(xs)).cumsum().clip(-2, 2)
            for i, x in enumerate(xs):
                if 0 <= x < m.shape[1]: m[int(max(0, top[i])):int(min(m.shape[0], bot[i])), x] = 1
            m = cv2.GaussianBlur(m, (0, 0), 0.8)
            band = band * (1 - m[..., None]) + m[..., None] * (np.float32(AMBER) / 255)
            off = max(2, int(hh * 0.10))
            sm = np.roll(np.roll(m, off, 0), off, 1) * (1 - m)
            head = np.clip(1 - (bx1 - np.arange(pg.shape[1], dtype=np.float32)) / (hh * 1.5), 0.25, 1)[None, :]
            shadow = np.maximum(shadow, sm * head)
    pg2 = pg * band * (1 - 0.55 * shadow[..., None])
    # camera (B7): the whole text column around the key line sits inside the frame (no cut-off words at the edges),
    # key line text >= 36 px tall; slow push centred on the key line, clamped so the key line never leaves the frame.
    cx0, cx1 = _text_column(pg, kx0, kx1, ky)
    hh = max(b[3] - b[1] for b in lines)
    sc0 = max(W * 0.86 / max(1, cx1 - cx0), 40.0 / max(1, hh))
    sc0 = min(sc0, (W - 120) / max(1, kx1 - kx0))                      # key line always fully inside
    zp = lerp(push[0], push[1], sine_io(f / max(1, nf - 1)))
    sc = sc0 * zp
    dyf = drift * H * (1 - quint_out(f / 45))
    kxc = (kx0 + kx1) / 2
    cxp = (cx0 + cx1) / 2 if (cx1 - cx0) * sc <= W * 0.94 else kxc     # column fits -> centre it, else centre the key line
    cxp = lerp(cxp, kxc, sine_io(f / max(1, nf - 1)) * 0.5)            # push drifts toward the key line
    tx = W / 2 - cxp * sc
    tx = max(tx, 60 - kx0 * sc); tx = min(tx, W - 60 - kx1 * sc)       # clamp: key line inside 60 px margins
    M = np.float32([[sc, 0, tx], [0, sc, H * 0.5 - ky * sc + dyf]])
    out = cv2.warpAffine(pg2, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(250, 250, 248))
    return out * vignette(0.18, 0.55)


# ---------------------------------------------------------------- EOX satellite map (MAP_SPEC)
def _merc(lat, lon, z):
    n = 256 * 2 ** z; s = math.sin(math.radians(lat))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


_MAPC = {}
def _plate(tile_dir, z, lat, lon, sx=5, sy=3):
    """Mosaic of cached EOX tiles (files '{z}_{x}_{y}.jpg') around the target at zoom z, (2sx+1)x(2sy+1) tiles; missing tiles stay near-black."""
    k = (tile_dir, z, round(lat, 5), round(lon, 5), sx, sy)
    if k in _MAPC: return _MAPC[k]
    cx, cy = _merc(lat, lon, z); tx, ty = int(cx // 256), int(cy // 256)
    nx, ny = 2 * sx + 1, 2 * sy + 1; im = np.full((ny * 256, nx * 256, 3), 8, np.float32); have = 0
    for j in range(ny):
        for i in range(nx):
            X, Y = (tx - sx + i) % 2 ** z, ty - sy + j
            p = os.path.join(tile_dir, f'{z}_{X}_{Y}.jpg')
            if os.path.exists(p):
                im[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = np.asarray(Image.open(p).convert('RGB'), np.float32); have += 1
            else:                                                        # B7: fill from a cached parent tile (up to 4 levels)
                for up in range(1, 5):
                    q = os.path.join(tile_dir, f'{z - up}_{X >> up}_{Y >> up}.jpg')
                    if os.path.exists(q):
                        n = 2 ** up; c = 256 // n; ox_, oy_ = (X % n) * c, (Y % n) * c
                        par = np.asarray(Image.open(q).convert('RGB'))[oy_:oy_ + c, ox_:ox_ + c]
                        im[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = cv2.resize(par, (256, 256), interpolation=cv2.INTER_CUBIC)
                        break
    origin = ((tx - sx) * 256, (ty - sy) * 256)
    _MAPC[k] = (im, origin, have)
    return _MAPC[k]


_MAP_GAIN = []


def _map_gain():
    """Constant map grade gain (H, W, 3): light around the target x vignette(0.45, 0.40) x cool cast (1, .98, 1.02)."""
    if not _MAP_GAIN:
        lit = (0.38 + 0.72 * np.exp(-(_R ** 2) / 0.30))[..., None]
        _MAP_GAIN.append((lit * vignette(0.45, 0.40) * np.float32((1.0, 0.98, 1.02))).astype(np.float32))
    return _MAP_GAIN[0]


def map_eox(f, nf, tile_dir, lat, lon, label, zooms=(10, 14), pin_at=None, label_rate=0.6, credit=True):
    """EOX Sentinel-2 cloudless map (CC BY 4.0; never Esri): eased push from zoom zooms[0] to zooms[1]
    (log-space, smootherstep over 75 % of the shot, then 1.5 % creep), dark Abyssal map grade lit only around the
    target, red glowing pin (18 f eased drop + one pulse ring every 1.2 s), white mono caps label typed with a red
    block cursor 16 px right of the pin, tiny imagery credit bottom-left. Uses cached tiles only (no download)."""
    zs = [z for z in range(zooms[0], zooms[1] + 1) if any(n.startswith(f'{z}_') for n in os.listdir(tile_dir))]
    k = smootherstep(f / max(1, nf * 0.62))
    zc = lerp(zooms[0], zooms[1], k) + 0.02 * max(0, f - nf * 0.62) / FPS
    zt = min([z for z in zs if z >= zc - 0.35] or [zs[-1]])           # B7: sharper tiles (sc 0.64..1.27); 15x9 plate covers the frame
    im, (ox, oy), _ = _plate(tile_dir, zt, lat, lon, 7, 4)
    sc = 2 ** (zc - zt)
    px_, py_ = _merc(lat, lon, zt); px_ -= ox; py_ -= oy
    M = np.float32([[sc, 0, W / 2 - px_ * sc], [0, sc, H / 2 - py_ * sc]])
    fr = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_AREA if sc < 1 else cv2.INTER_CUBIC,
                        borderMode=cv2.BORDER_CONSTANT, borderValue=(6, 7, 9))
    # B7 map grade (Abyssal map refs): stretch the dull EOX plate (p2..p98) + local contrast so land, roads and
    # rivers read, keep some earth colour, dark falloff away from the target, light only around the pin.
    lo_, hi_ = np.percentile(fr[::8, ::8], (2, 98))
    fr = np.clip((fr - lo_) / max(1.0, hi_ - lo_), 0, 1) * 255
    lab = cv2.cvtColor(u8(fr), cv2.COLOR_RGB2LAB)
    lab[..., 0] = cv2.createCLAHE(2.2, (8, 8)).apply(lab[..., 0])
    fr = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB).astype(np.float32)
    fr = fr + 0.6 * (fr - cv2.GaussianBlur(fr, (0, 0), 2.0))           # unsharp: roads / field edges
    g = fr.mean(2, keepdims=True); fr = g + (fr - g) * 0.55
    fr = 255 * (np.clip(fr, 0, 255) / 255) ** 1.15
    fr = fr * _map_gain()                     # lit-around-target x vignette x faint cool cast (not cyan); constant
    pf = (pin_at if pin_at is not None else int(nf * 0.40))
    out = fr
    if f >= pf:
        e = quint_out((f - pf) / 18); r = 9 + 3 * math.sin(math.pi * clamp((f - pf) / 18))
        # glow + ring drawn in a 384 px box around the pin, not the full frame (2026-11-16 speed-up; glow sigma <= 24 px
        # and ring radius <= 92 px, so the box edge is > 5 sigma away: same picture, ~2x faster map frames)
        c = (W // 2, H // 2); RB = 192; cr = (RB, RB)
        lay = np.zeros((2 * RB, 2 * RB, 4), np.float32)
        for rr, al in ((40, 0.15), (20, 0.35), (8, 0.6)):
            g_ = np.zeros((2 * RB, 2 * RB), np.float32); cv2.circle(g_, cr, int(rr * e) + 1, 1.0, -1)
            g_ = cv2.GaussianBlur(g_, (0, 0), rr * 0.6) * al
            lay[..., :3] = lay[..., :3] * (1 - g_[..., None]) + np.float32(RED) * g_[..., None]; lay[..., 3] = np.maximum(lay[..., 3], g_ * 255)
        out = over(out, lay, c[0] - RB, c[1] - RB, e)
        ph = ((f - pf) % 36) / 36
        if f - pf >= 18:
            ring = np.zeros((2 * RB, 2 * RB, 4), np.float32)
            cv2.circle(ring, cr, int(18 + 72 * quint_out(ph)), (*RED, 255 * 0.8 * (1 - ph)), 2, cv2.LINE_AA)
            out = over(out, ring, c[0] - RB, c[1] - RB, 1.0)
        dot = np.zeros((60, 60, 4), np.float32)
        cv2.circle(dot, (30, 30), int(r) + 2, (255, 255, 255, 255), -1, cv2.LINE_AA)
        cv2.circle(dot, (30, 30), int(r), (*RED, 255), -1, cv2.LINE_AA)
        out = over(out, dot, c[0] - 30, c[1] - 30, e)
        lf = f - pf - 10
        if lf > 0:
            fnt = font(F_MONO, 46, 800); txt = label.upper(); n = min(len(txt), int(lf * label_rate))
            if n:
                im_, base = text_rgba(txt[:n], fnt, OFFWHITE, track=3, stroke=2)
                out = over(out, im_, c[0] + 16 + 14, c[1] - base + 16)
                if n < len(txt) or ((lf - len(txt) / label_rate) // 15) % 2 == 0:
                    cw, ch = _cursor_block(fnt); blk = np.zeros((ch, cw, 4), np.float32); blk[...] = (*RED, 235)
                    out = over(out, blk, c[0] + 30 + im_.width - 4, c[1] - base + 16 + base - ch + 2)
    if credit:
        out = source_credit(out, 'SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', 0.8)
    return out


# ---------------------------------------------------------------- intro case-name list
def case_list(f, nf, names, plate=None):
    """Intro list of the case names (no count, no numbers box, no card, no scroll): names centred in one column,
    mono bold caps ~3.4 % H, rows 7.5 % H apart, each row rises 14 px + fades in over 18 f (staggered 9 f), whole
    frame on a slow eased zoom-in 1.00->1.08 (smootherstep over nf), no shake. Dark plate (blurred footage or black)."""
    base = plate if plate is not None else np.full((H, W, 3), 8, np.float32)
    fnt = font(F_MONO, H * 0.046, 800)
    fr = base.astype(np.float32).copy()
    n = len(names); y0 = H / 2 - (n - 1) * H * 0.075 / 2
    for i, nm in enumerate(names):
        k = prog(f, 6 + i * 9, 18, quint_out)
        if k <= 0: continue
        im, _ = text_rgba(nm.upper(), fnt, OFFWHITE, track=H * 0.046 * 0.10, stroke=2, stroke_fill=(0, 0, 0, 160))
        fr = over(fr, im, (W - im.width) / 2, y0 + i * H * 0.075 - im.height / 2 + 14 * (1 - k), k)
    s = 1.0 + 0.08 * smootherstep(f / max(1, nf - 1))
    return camera(fr, s) * smootherstep(f / 8)


# ---------------------------------------------------------------- outro end hold
def end_hold(last, f, nf, text='THANKS FOR WATCHING'):
    """Outro: last footage frame dims to 30 % and softens (eased 30 f) under a centred mono caps line (ref: 46 % w,
    5 % H, y ~12.5 %) that fades in over 18 f; whole frame fades to black over the last 30 f."""
    k = prog(f, 0, 30)
    bg = last.astype(np.float32)
    if k > 0: bg = cv2.GaussianBlur(bg, (0, 0), 1 + 6 * k)
    bg = bg * (1 - 0.70 * k)
    fnt = font(F_MONO, H * 0.058, 800)
    im, _ = text_rgba(text.upper(), fnt, OFFWHITE, track=H * 0.058 * 0.12, stroke=2)
    out = over(bg, im, (W - im.width) / 2, H * 0.125 - im.height / 2, prog(f, 12, 18, quint_out))
    return out * (1 - prog(f, nf - 30, 30))
