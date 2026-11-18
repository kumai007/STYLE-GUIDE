# v6: edl6 (review 4) - xin/xout fade with the shot crossfade, handoff holds the blur, extended threads.
# v4 final pass (from final3: edl4, asm4; stamp kept clear of fades; morph reply revealed by a soft edge, strips overlap):
# v3 final pass: asm3.mp4 + real YouTube comment screenshots (yt_capture3) + VCR translation strip + captions + loch stamp -> x264 + mix2.wav
# Events (edl3.EVENTS, kind "shot"): screenshot(s) cropped to content on one dark panel, translation strip under it.
#  ent "up": floats up from below the bottom edge (ease-out cubic 22 f + fade); ent "pan": slow 3D pan/tilt in (24 f).
#  exit 18 f eased fade + small lift; held: slow push 0.8 %/s + drift (pan: yaw/pitch travel). One fitted scale per event (safe margin 96/64).
#  threads: parent first, at `morph` the panel grows (w+h, ease in-out 20 f), the reply slides up under it and fades in, parent dims; group recentres.
#  highlight: red screen-blend wipe (14 f, left->right) on the main comment's manifest box, 0.25 s before edl hl; strip words wipe in sync.
#  footage behind: keeps playing, Gaussian blur ~20 px + x0.55, eased with the event envelope.
# python final3.py                -> full render to OUT
# python final3.py frames f1,f2,.. dir   -> test frames (accurate seek) as PNGs
import sys, os, re, math, json, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFilter
import cv2
from common import *
import edl6 as edl
from seg3 import ease, TEX

OUT = "C:/Users/ayush/Videos/CLAUDE/render farm video/finals/farrell-camping-8/CAMPING-8_3-6min_farrell_v6.mp4"
ASM = W + "/asm4.mp4"
YT3 = W + "/yt_capture3"
MAN = {m["key"]: m for m in json.load(open(YT3 + "/manifest.json", encoding="utf-8"))}
MX, MY = 96, 64            # safe margin
EIN_UP, EIN_PAN, EOUT = 22, 24, 18   # frames
MORPH = 20 / FPS
HLF = 14                   # highlight wipe frames
HL_LEAD = 0.25             # highlight starts this long before the edl time
HL_FADE = 10               # frames: previous box fades as the next starts
SMAX = 1.7                 # largest screenshot scale (JP glyphs ~48 px)
STRIP_PX = 38              # strip text size on screen
PUSH = 0.008               # 0.8 %/s (guide: push <= 0.8 %/s on cards)
DRIFT = 4.0                # px/s vertical drift, centred on the event middle
PADX, PADY, GAP, IND = 34, 26, 10, 44
PTRIM = 68                 # parent action row height (2x px)
BG = (15, 15, 15)
TEXT = {"toru": "With it this bright inside, I feel like they'd be [completely visible from outside]..."}
EXTRA_HL = {"ken_june": [(1, 141.58)]}   # (box index, start s): "human footsteps" at 141.83
LOG = {}

def eout(x):
    x = min(1.0, max(0.0, x)); return 1 - (1 - x) ** 3

def tokens(t):
    t = clean(t); out = []; hl = -1; n = 0; prev_sp = True
    for part in re.split(r"(\[|\])", t):
        if part == "[": hl = n; continue
        if part == "]": hl = -1; n += 1; continue
        if not part: continue
        ws = part.split(" ")
        for j, w in enumerate(ws):
            if w: out.append((w, hl, j == 0 and bool(out) and not prev_sp))
        prev_sp = part.endswith(" ")
    return out

def shot_crop(key, trim=0):
    """crop the ~2600 px capture to its content (avatar + text + action row) + right margin; desaturate a little (rule 1).
    trim: px cut from the bottom (a thread parent loses its like/reply row so the reply sits right under its text)"""
    im = Image.open(f"{YT3}/{key}.png").convert("RGB")
    if trim: im = im.crop((0, 0, im.size[0], im.size[1] - trim))
    a = np.asarray(im).astype(int)
    m = np.abs(a - np.array(BG)).sum(2) > 30
    xmax = int(np.nonzero(m.any(0))[0].max())
    im = im.crop((0, 0, min(im.size[0], xmax + 1 + 20), im.size[1]))
    return np.asarray(desat(im, 0.45), np.float32)

def screen_red(a, x0, y0, x1, y1, k=1.0):
    """screen-blend red into a[y0:y1, x0:x1] with strength k: white text stays white"""
    x0, y0 = max(0, int(round(x0))), max(0, int(round(y0))); x1, y1 = min(a.shape[1], int(round(x1))), min(a.shape[0], int(round(y1)))
    if x1 <= x0 or y1 <= y0 or k <= 0.001: return
    reg = a[y0:y1, x0:x1, :3]
    scr = 255 - (255 - reg) * (255 - np.array(RED, np.float32)) / 255
    a[y0:y1, x0:x1, :3] = reg + (scr - reg) * k

class Strip:
    """VCR translation text wrapped to width w; bracket boxes for the highlight"""
    def __init__(self, text, w, fs):
        self.fs = fs; lh = int(fs * 1.38); pad = int(fs * 0.85)
        x0 = pad; maxw = w - 2 * pad; sp = font(fs).getlength(" ")
        words = []; x = x0; y = pad
        for wd, hl, glue in tokens(text):
            wl = font(fs).getlength(wd)
            if glue: x -= sp
            if x + wl > x0 + maxw and not glue: x = x0; y += lh
            words.append((x, y, wd, hl)); x += wl + sp
        self.h = y + lh + int(fs * 0.95) + pad
        self.w = w; self.words = words; self.note_y = y + lh + int(fs * 0.15)
        boxes = {}
        for (x, y, wd, hl) in words:
            if hl < 0: continue
            wl = font(fs).getlength(wd); L = boxes.setdefault(hl, {})
            r = L.setdefault(y, [x - 6, y - int(fs * 0.22), x + wl + 6, y + fs + int(fs * 0.12)]); r[2] = x + wl + 6
        self.boxes = {k: [v[y] for y in sorted(v)] for k, v in boxes.items()}
        L = Image.new("RGBA", (w, self.h), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
        for (x, y, wd, hl) in words: d.text((x, y), wd, font=font(fs), fill=(255, 255, 255, 255))
        d.text((x0, self.note_y), "Translated from Japanese", font=font(int(fs * 0.62)), fill=(125, 125, 125, 255))
        self.text = np.asarray(L, np.float32)

def wipe(rs, k):
    """rects of a multi-line box revealed left->right by fraction k of total width"""
    tot = sum(r[2] - r[0] for r in rs) * k; out = []
    for r in rs:
        wv = min(tot, r[2] - r[0]); tot -= wv
        if wv > 0.5: out.append((r[0], r[1], r[0] + wv, r[3]))
    return out

class Shot:
    def __init__(self, ev):
        self.ev = ev; keys = ev["keys"]
        self.thread = len(keys) == 2
        self.parent = None
        if not self.thread and "parent_" + keys[0] in MAN:       # ken_r1: dimmed parent (@nishuiii) above, static
            self.parent = "parent_" + keys[0]
        self.keys = ([self.parent] if self.parent else []) + keys
        self.img = [shot_crop(k, PTRIM if (i == 0 and len(self.keys) == 2) else 0) for i, k in enumerate(self.keys)]
        self.main = len(self.keys) - 1 if (self.thread or self.parent) else 0   # highlighted / translated comment index
        # panel layout: comment 0 at (PADX, PADY); comment 1 indented under it
        h0, w0 = self.img[0].shape[:2]
        self.pos = [(PADX, PADY)]
        self.P0 = (w0 + 2 * PADX, h0 + 2 * PADY)
        if len(self.img) == 2:
            h1, w1 = self.img[1].shape[:2]
            self.pos.append((PADX + IND, PADY + h0 + GAP))
            self.P1 = (max(self.P0[0], PADX + IND + w1 + PADX), PADY + h0 + GAP + h1 + PADY)
        else:
            self.P1 = self.P0
        self.morph = ev.get("morph")
        # highlights: (comment index, box index, start)
        self.hls = [(ki + (1 if self.parent else 0), 0, t - HL_LEAD) for ki, t in ev.get("hl", [])]
        for bi, t in EXTRA_HL.get(keys[-1], []): self.hls.append((len(self.keys) - 1, bi, t))
        self.hls.sort(key=lambda h: h[2])
        self.hlbox = {}
        for ci, bi, _ in self.hls:
            r = MAN[self.keys[ci]]["box"][bi]["rects"]
            self.hlbox[(ci, bi)] = [(q["x"] - 8, q["y"] - 5, q["x"] + q["w"] + 8, q["y"] + q["h"] + 5) for q in r]
        self.t0, self.t1 = ev["t0"], ev["t1"]
        self.xin, self.xout = ev.get("xin"), ev.get("xout")   # fade in / out with the shot's crossfade (no motion)
        self.hold_in = self.hold_out = False                   # handoff: blur stays full while comments swap
        self.tex = TEX[100:100 + self.P1[1], 200:200 + self.P1[0]] * 0.55
        self.ent = ev["ent"]
        # strip texts: thread -> parent text before the morph, reply after; else main comment
        def txt(k): return TEXT.get(k) or edl.CARDS[k]["t"]
        # fit: two scales (S0 parent alone, S1 whole thread; equal for single comments); strip sized for each; 3 rounds
        self.S0 = self.S1 = 1.0
        for _ in range(3):
            f0s, f1s = max(18, int(round(STRIP_PX / self.S0))), max(18, int(round(STRIP_PX / self.S1)))
            if self.thread:
                self.strips = [Strip(txt(keys[0]), self.P0[0], f0s), Strip(txt(keys[1]), self.P1[0], f1s)]
            else:
                self.strips = [Strip(txt(keys[0]), self.P1[0], f1s)]
            self.fit()
        ext = self.extent()
        self.bbox = [round(v) for v in ext]
        assert ext[0] >= MX - 0.5 and ext[1] >= MY - 0.5 and ext[2] <= SW - MX + 0.5 and ext[3] <= SH - MY + 0.5, (keys, ext)
        LOG[f"{keys[-1]}@{self.t0}"] = dict(S0=round(self.S0, 3), S1=round(self.S1, 3), strip_px=round(f1s * self.S1),
                                             jp_glyph_px=[round(28 * self.S0), round(28 * self.S1)], panel=self.P1, bbox=self.bbox)

    # ---- geometry ----
    def m(self, T):
        if not self.thread: return 1.0
        return ease((T - self.morph) / MORPH)

    def dims(self, T):
        m = self.m(T)
        pw = self.P0[0] + (self.P1[0] - self.P0[0]) * m; ph = self.P0[1] + (self.P1[1] - self.P0[1]) * m
        sh = self.strips[0].h if len(self.strips) == 1 else self.strips[0].h + (self.strips[1].h - self.strips[0].h) * m
        return pw, ph, sh

    def size(self, T):
        pw, ph, sh = self.dims(T)
        return pw, ph + 18 + sh

    def env(self, T):
        """alpha, entry progress, exit progress"""
        a, ei, eo, _ = self.env4(T); return a, ei, eo

    def env4(self, T):
        """alpha, entry motion, exit motion, blur weight"""
        f = (T - self.t0) * FPS
        lin = lambda w: min(1.0, max(0.0, (T - w[0]) / (w[1] - w[0])))
        if self.xin: ei = 1.0; ai = lin(self.xin)
        else:
            ei = eout(f / EIN_UP) if self.ent == "up" else ease(f / EIN_PAN)
            ai = ease(f / EIN_UP) if self.ent == "up" else ei
        if self.xout: eo = 1.0; ao = 1 - lin(self.xout)
        else: eo = ease((self.t1 - T) * FPS / EOUT); ao = eo
        return min(ai, ao), ei, eo, min(1.0 if self.hold_in else ai, 1.0 if self.hold_out else ao)

    def base(self, T):
        return self.S0 + (self.S1 - self.S0) * self.m(T)

    def _proj(self, T, sc, entry):
        ev = self.ev; _, ei, eo = self.env(T)
        sw, sh = self.size(T)
        sc = sc * (1 + min(PUSH, 0.03 / (self.t1 - self.t0)) * (T - self.t0)) * (0.96 + 0.04 * eo)
        if self.ent == "pan":
            u = ease((T - self.t0) / (self.t1 - self.t0))
            yaw = ev["yaw"][0] + (ev["yaw"][1] - ev["yaw"][0]) * u + (7 * (1 - ei) if entry else 0)
            pit = ev["pitch"][0] + (ev["pitch"][1] - ev["pitch"][0]) * u
            if entry: sc *= 0.93 + 0.07 * ei
        else:
            yaw = pit = 0.0
        q = project(sw, sh, (sw / 2, sh / 2), (960, 540), sc, yaw, pit)
        xs = [p[0] for p in q]; ys = [p[1] for p in q]
        q = [(x + 960 - (min(xs) + max(xs)) / 2, y + 540 - (min(ys) + max(ys)) / 2) for x, y in q]
        off = -DRIFT * ((T - self.t0) - (self.t1 - self.t0) / 2) - 26 * (1 - eo)
        hw = (max(xs) - min(xs)) / 2; hh = (max(ys) - min(ys)) / 2
        r = min((960 - MX) / hw, (540 - MY - abs(off)) / hh)     # >= 1: fits the safe margin
        return q, off, r, ei

    def quad(self, T, S=None, entry=True):
        b = self.base(T) if S is None else S
        q, off, r, ei = self._proj(T, b, entry)
        if r < 1 and S is None and not (entry and self.ent == "up" and (T - self.t0) * FPS < EIN_UP):
            q, off, r2, ei = self._proj(T, b * r * 0.998, entry)   # morph frames only: never leave the margin
        q = [(x, y + off) for x, y in q]
        if entry and self.ent == "up":
            top = min(p[1] for p in q)
            q = [(x, y + (1 - ei) * (SH - top)) for x, y in q]    # from: top edge of the group at the bottom of the frame
        return q

    def frames(self):
        f0 = fr(self.t0); f1 = fr(self.t1)
        return [f for f in range(f0, f1 + 1) if self.t0 <= f / FPS <= self.t1]

    def fit(self):
        """largest S0 (frames before the morph) / S1 (from the morph on) that keep held + exit frames inside the margin"""
        for which in ("S0", "S1") if self.thread else ("S1",):
            S = SMAX
            for _ in range(4):
                rs = [self._proj(f / FPS, S, False)[2] for f in self.frames()
                      if not self.thread or ((f / FPS < self.morph) == (which == "S0"))]
                if not rs: break                     # extended thread: no frames before the morph
                S = min(SMAX, S * min(rs) * 0.995) if min(rs) < 1 else S
            setattr(self, which, S)
        if not self.thread: self.S0 = self.S1

    def extent(self):
        ext = [9e9, 9e9, -9e9, -9e9]
        for f in self.frames():
            T = f / FPS
            if self.ent == "up" and (T - self.t0) * FPS < EIN_UP: continue   # the float-up starts below the frame by design
            q = self.quad(T)
            ext = [min(ext[0], min(p[0] for p in q)), min(ext[1], min(p[1] for p in q)),
                   max(ext[2], max(p[0] for p in q)), max(ext[3], max(p[1] for p in q))]
        return ext

    def active(self, T): return self.t0 <= T <= self.t1

    # ---- content ----
    def hl_state(self, T):
        """[(ci, bi, wipe k, strength)] one box at a time"""
        out = []
        for i, (ci, bi, t) in enumerate(self.hls):
            if T < t: continue
            k = ease((T - t) * FPS / HLF); s = 1.0
            if i + 1 < len(self.hls) and T >= self.hls[i + 1][2]:
                s = 1 - ease((T - self.hls[i + 1][2]) * FPS / HL_FADE)
            if s > 0.001: out.append((ci, bi, k, s))
        return out

    def sheet(self, T):
        m = self.m(T); pw, ph, shh = self.dims(T)
        PW, PH = self.P1
        pan = np.zeros((PH, PW, 3), np.float32) + np.array(BG, np.float32)
        hs = self.hl_state(T)
        for ci, (img, (x, y)) in enumerate(zip(self.img, self.pos)):
            h, w = img.shape[:2]; a = img.copy()
            for (c, bi, k, s) in hs:
                if c == ci:
                    for r in wipe(self.hlbox[(c, bi)], k): screen_red(a, *r, k=s)
            if len(self.img) == 2 and ci == 0:
                dim = 1 - 0.38 * m if self.thread else 0.55
                a = BG + (a - BG) * dim
            al = 1.0
            if ci == 1 and self.thread:
                ra = ease((T - self.morph - 0.1) / 0.5); al = ra
                y = y + 70 * (1 - ease((T - self.morph) / (MORPH + 0.15)))
            if al <= 0.001: continue
            y = int(round(y)); y1 = min(PH, y + h); hh = y1 - y
            if hh <= 0: continue
            if ci == 1 and self.thread:
                rows = np.arange(y, y1, dtype=np.float32)
                cols = np.arange(x, x + w, dtype=np.float32)
                al = al * np.clip((ph - 24 - rows) / 48, 0, 1)[:, None, None] * np.clip((pw - 24 - cols) / 48, 0, 1)[None, :, None]
            reg = pan[y:y1, x:x + w]
            pan[y:y1, x:x + w] = reg * (1 - al) + a[:hh] * al
        pan += self.tex[..., None]
        pwi, phi = int(round(pw)), int(round(ph))
        pan = np.clip(pan[:phi, :pwi], 0, 255).astype(np.uint8)
        P = Image.fromarray(pan).convert("RGBA")
        mk = Image.new("L", (pwi, phi), 0); ImageDraw.Draw(mk).rounded_rectangle((0, 0, pwi - 1, phi - 1), 22, fill=246)
        P.putalpha(mk)
        ImageDraw.Draw(P).rounded_rectangle((0, 0, pwi - 1, phi - 1), 22, outline=(64, 64, 64, 255), width=2)
        # strip
        shi = int(round(shh))
        st = np.zeros((shi, pwi, 4), np.float32); st[..., :3] = 12; st[..., 3] = 242
        st[..., :3] += TEX[700:700 + shi, 300:300 + pwi, None] * 0.5
        lays = [(self.strips[0], 1.0)] if len(self.strips) == 1 else \
               [(self.strips[0], 1 - ease(m / 0.6)), (self.strips[1], ease((m - 0.45) / 0.5))]
        for si, (S_, al) in enumerate(lays):
            if al <= 0.001: continue
            ci = len(self.keys) - 1 if (si == 1 or len(self.strips) == 1) else 0
            for (c, bi, k, s) in hs:
                if c == ci and bi in S_.boxes:
                    for r in wipe(S_.boxes[bi], k):
                        x0, y0, x1, y1 = [int(round(v)) for v in r]
                        x1 = min(x1, pwi); y1 = min(y1, shi)
                        if x1 > x0 and y1 > y0: st[y0:y1, x0:x1, :3] = st[y0:y1, x0:x1, :3] * (1 - s * al) + np.array(RED, np.float32) * s * al
            tx = S_.text[:shi, :pwi]; h_, w_ = tx.shape[:2]
            ta = tx[..., 3:4] / 255 * al
            if len(self.strips) == 2:   # soft edges while the strip grows (no hard crop line)
                ta = ta * np.clip((pwi - 16 - np.arange(w_, dtype=np.float32)) / 48, 0, 1)[None, :, None]                         * np.clip((shi - 6 - np.arange(h_, dtype=np.float32)) / 20, 0, 1)[:, None, None]
            st[:h_, :w_, :3] = st[:h_, :w_, :3] * (1 - ta) + tx[..., :3] * ta
        stm = Image.new("L", (pwi, shi), 0); ImageDraw.Draw(stm).rounded_rectangle((0, 0, pwi - 1, shi - 1), 18, fill=255)
        st[..., 3] *= np.asarray(stm, np.float32) / 255
        Sim = Image.fromarray(np.clip(st, 0, 255).astype(np.uint8), "RGBA")
        ImageDraw.Draw(Sim).rounded_rectangle((0, 0, pwi - 1, shi - 1), 18, outline=(52, 52, 52, 255), width=2)
        sw, sh = self.size(T)
        out = Image.new("RGBA", (int(round(sw)), int(round(sh))), (0, 0, 0, 0))
        out.alpha_composite(P, (0, 0)); out.alpha_composite(Sim, (0, phi + 18))
        return out

    def render(self, T):
        a, _, _, bk = self.env4(T)
        sheet = self.sheet(T)
        q = self.quad(T)
        sw, sh = sheet.size
        c = persp_coeffs(q, [(0, 0), (sw, 0), (sw, sh), (0, sh)])
        img = sheet.transform((SW, SH), Image.PERSPECTIVE, c, Image.BICUBIC)
        return np.asarray(img, np.float32), a, bk

EVENTS = sorted([Shot(e) for e in edl.EVENTS], key=lambda e: e.t0)
for p_, n_ in zip(EVENTS, EVENTS[1:]):
    if n_.t0 < p_.t1: p_.hold_out = n_.hold_in = True

def composite(frame, layers):
    """footage keeps playing behind: Gaussian blur ~20 px + x0.55 eased by the envelope; soft shadow; then the sheet"""
    k = max(b for _, _, b in layers)
    if k > 0.001:
        small = cv2.resize(frame, (480, 270), interpolation=cv2.INTER_AREA)
        small = cv2.GaussianBlur(small, (0, 0), 5.0)          # 5 px at 1/4 res = ~20 px at full res
        bl = cv2.resize(small, (SW, SH), interpolation=cv2.INTER_LINEAR)
        frame = frame * (1 - k) + bl * (0.55 * k)
    for rgba, a, _ in layers:
        al = rgba[..., 3:4] / 255 * a
        sa = cv2.resize(al[..., 0], (480, 270), interpolation=cv2.INTER_AREA)
        sa = cv2.GaussianBlur(sa, (0, 0), 5.0)
        sh = cv2.resize(sa, (SW, SH), interpolation=cv2.INTER_LINEAR)[..., None]
        sh = np.roll(sh, 16, axis=0)
        frame = frame * (1 - 0.6 * sh)
        frame = frame * (1 - al) + rgba[..., :3] * al
    return frame

# ---------------- captions + stamp (as final2: caps from raw shots, stamp from the stamped shot a+0.10 .. b-0.10) ----------------
def box_png(lines, size, pad=(16, 10), lh=1.25):
    wmax = max(mixed_len(l, size) for l in lines)
    w = int(wmax + 2 * pad[0]); h = int(len(lines) * size * lh + 2 * pad[1])
    im = Image.new("RGBA", (w, h), (0, 0, 0, 255)); d = ImageDraw.Draw(im)
    for i, l in enumerate(lines):
        draw_mixed(d, ((w - mixed_len(l, size)) / 2, pad[1] + i * size * lh + size * 0.08), l, size, (255, 255, 255, 255))
    return im

CAPS = []
for s in edl.SHOTS:
    for (a, b, t) in s.get("caps", []):
        im = box_png(clean(t).split("\n"), 40); w, h = im.size
        CAPS.append((fr(a), fr(b), np.asarray(im, np.float32), (SW - w) // 2, 1000 - h))

def stamp_png(big, small):
    im = Image.new("RGBA", (SW, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    fb, fs = font(96), font(36); wb, ws = fb.getlength(big), fs.getlength(small)
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); ds = ImageDraw.Draw(sh)
    for dd, fill in ((ds, (0, 0, 0, 170)), (d, None)):
        dd.text(((SW - wb) / 2, 60), big, font=fb, fill=fill or (0xED, 0xED, 0xED, 255))
        dd.text(((SW - ws) / 2, 180), small, font=fs, fill=fill or (0xBD, 0xBD, 0xBD, 255))
    return np.asarray(Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)), im), np.float32)
STAMPS = [(s["a"] + (0 if s["tin"] == "cut" else 2 * edl.H - s["hh"]) / FPS + 0.10,
           s["b"] - (0 if s["tout"] == "cut" else 2 * edl.H - s["th"]) / FPS - 0.10, stamp_png(*s["stamp"])) for s in edl.SHOTS if s.get("stamp")]

def paste(frame, rgba, x, y, a=1.0):
    h, w = rgba.shape[:2]
    al = rgba[..., 3:4] / 255 * a
    reg = frame[y:y + h, x:x + w]
    frame[y:y + h, x:x + w] = reg * (1 - al) + rgba[..., :3] * al

def process(f, b):
    T = f / FPS
    evs = [e for e in EVENTS if e.active(T)]
    caps = [c for c in CAPS if c[0] <= f < c[1]]
    sts = [(st, ease((T - a) / 0.35) * ease((b_ - T) / 0.35)) for a, b_, st in STAMPS if a <= T <= b_]
    if not (evs or caps or sts): return b
    fa = np.frombuffer(b, np.uint8).reshape(SH, SW, 3).astype(np.float32)
    if evs: fa = composite(fa, [e.render(T) for e in evs])
    for st, al in sts: paste(fa, st, 0, SH - 300 - 70, al)
    for c in caps: paste(fa, c[2], c[3], c[4])
    return np.clip(fa + 0.5, 0, 255).astype(np.uint8).tobytes()

def grab(f):
    return subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{f / FPS:.5f}", "-i", ASM, "-frames:v", "1", "-f", "rawvideo",
                           "-pix_fmt", "rgb24", "-"], capture_output=True).stdout

def main():
    print(json.dumps(LOG), flush=True)
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", ASM, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    N = 5395
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{SW}x{SH}", "-r", "30000/1001",
                            "-i", "-", "-i", W + "/mix2.wav", "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-preset", "slow",
                            "-crf", "14", "-pix_fmt", "yuv420p", "-r", "30000/1001", "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
                            "-movflags", "+faststart", OUT], stdin=subprocess.PIPE)
    for f in range(N):
        b = dec.stdout.read(SW * SH * 3)
        if len(b) < SW * SH * 3: print("short at", f); break
        enc.stdin.write(process(f, b))
        if f % 600 == 0: print("frame", f, flush=True)
    dec.stdout.close(); dec.kill()
    enc.stdin.close(); assert enc.wait() == 0
    print("done", OUT)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "frames":   # python final3.py frames f1,f2 dir
        os.makedirs(sys.argv[3], exist_ok=True)
        print(json.dumps(LOG, indent=0))
        for f in [int(x) for x in sys.argv[2].split(",")]:
            Image.frombytes("RGB", (SW, SH), process(f, grab(f))).save(f"{sys.argv[3]}/f{f:05d}.png")
    else:
        main()
