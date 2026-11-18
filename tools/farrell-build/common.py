import os, subprocess, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

W = "C:/Users/ayush/Videos/CLAUDE/render farm video/productions/winter-camping-encounters/05_render/work"  # was old scratchpad (2026-11-10, case1 render)
P = "C:/Users/ayush/Videos/CLAUDE/PROJECT"
R = P + "/RL-EDIT/camping8"
C1 = R + "/sources/C1_kencamp_2997.mp4"
C1V = R + "/sources/C1_kencamp_2997_v.mp4"
C2 = R + "/sources/C2_utw.mp4"
C2V = R + "/sources/C2_utw_v.mp4"
PROPS = P + "/graphics/hyperframes/props/camping8"
VCR = os.path.expandvars("%LOCALAPPDATA%/Microsoft/Windows/Fonts/VCR_OSD_MONO_1.001[1].ttf")  # was W + "/vcr.ttf"
CJK = "C:/Windows/Fonts/YuGothM.ttc"
FPS = 30000 / 1001
SW, SH = 1920, 1080
RED = (200, 16, 32)

def fr(s):
    return int(round(s * FPS))

_fc = {}
def font(size, cjk=False):
    k = (size, cjk)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(CJK if cjk else VCR, size)
    return _fc[k]

def clean(t):
    return (t.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')
             .replace("\u2026", "...").replace("\u2014", "-").replace(" \u00b7 ", "  -  ").replace("\u00b7", "-")
             .replace("\U0001f4a7", "").replace("\U0001f602", "").replace("  ", " ").replace("-  ", "-  "))

def is_cjk(ch):
    return ord(ch) > 0x2E80

def draw_mixed(d, xy, text, size, fill):
    """VCR OSD Mono; CJK glyphs only fall back to Yu Gothic (VCR has none)."""
    x, y = xy
    for ch in text:
        f = font(size, is_cjk(ch))
        dy = -int(size * 0.1) if is_cjk(ch) else 0
        d.text((x, y + dy), ch, font=f, fill=fill)
        x += f.getlength(ch)
    return x

def mixed_len(text, size):
    return sum(font(size, is_cjk(c)).getlength(c) for c in text)

def grain_tex(w, h, amt=10, seed=1, dust=40):
    """static grain + dust/scratches, returned as signed float array (h,w) to add to luma"""
    rng = np.random.default_rng(seed)
    g = rng.normal(0, amt, (h, w)).astype(np.float32)
    im = Image.new("L", (w, h), 128)
    d = ImageDraw.Draw(im)
    for _ in range(dust):
        x, y = rng.integers(0, w), rng.integers(0, h)
        r = rng.integers(1, 4)
        d.ellipse((x - r, y - r, x + r, y + r), fill=int(rng.choice([60, 200])))
    for _ in range(max(1, dust // 12)):
        x = rng.integers(0, w); y0 = rng.integers(0, h // 2); L = rng.integers(h // 6, h // 2)
        d.line((x, y0, x + rng.integers(-6, 7), y0 + L), fill=int(rng.choice([90, 175])), width=1)
    g += (np.asarray(im, np.float32) - 128) * 0.6
    return g

def add_tex(img, tex):
    a = np.asarray(img.convert("RGB"), np.float32)
    a += tex[: a.shape[0], : a.shape[1], None]
    out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if img.mode == "RGBA":
        out.putalpha(img.getchannel("A"))
    return out

def desat(img, keep=0.18):
    g = ImageOps.grayscale(img.convert("RGB")).convert("RGB")
    out = Image.blend(g, img.convert("RGB"), keep)
    if img.mode == "RGBA":
        out.putalpha(img.getchannel("A"))
    return out

_vig = {}
def vignette(arr, edge=0.75):
    """multiply: edges `edge`x (25% darker)"""
    if edge not in _vig:
        y, x = np.mgrid[0:SH, 0:SW].astype(np.float32)
        r = np.sqrt(((x - SW / 2) / (SW / 2)) ** 2 + ((y - SH / 2) / (SH / 2)) ** 2) / math.sqrt(2)
        m = 1 - (1 - edge) * np.clip((r - 0.35) / 0.65, 0, 1) ** 1.6
        _vig[edge] = m[..., None]
    return arr * _vig[edge]

def persp_coeffs(dst, src):
    """coeffs mapping output(dst quad) -> input(src quad) for Image.PERSPECTIVE"""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); B.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); B.append(v)
    return np.linalg.solve(np.array(A, float), np.array(B, float)).tolist()

def project(sw, sh, anchor, screen, scale, yaw, pitch, f=2200.0):
    """sheet (sw x sh) point `anchor` placed at `screen`, rotated yaw/pitch deg; returns screen quad"""
    ax, ay = anchor
    cy_, sy_ = math.cos(math.radians(yaw)), math.sin(math.radians(yaw))
    cx_, sx_ = math.cos(math.radians(pitch)), math.sin(math.radians(pitch))
    out = []
    for (x, y) in [(0, 0), (sw, 0), (sw, sh), (0, sh)]:
        X, Y, Z = (x - ax) * scale, (y - ay) * scale, 0.0
        X, Z = X * cy_ + Z * sy_, -X * sy_ + Z * cy_
        Y, Z = Y * cx_ - Z * sx_, Y * sx_ + Z * cx_
        k = f / (f + Z)
        out.append((screen[0] + X * k, screen[1] + Y * k))
    return out

def warp(sheet, quad):
    sw, sh = sheet.size
    c = persp_coeffs(quad, [(0, 0), (sw, 0), (sw, sh), (0, sh)])
    return sheet.transform((SW, SH), Image.PERSPECTIVE, c, Image.BICUBIC)

class Enc:
    def __init__(self, path, crf=12):
        self.path = path; self.n = 0
        if os.environ.get("PV") is not None:
            self.p = None; return
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{SW}x{SH}",
                                   "-r", "30000/1001", "-i", "-", "-c:v", "h264_nvenc", "-preset", "p5", "-tune", "hq", "-rc", "vbr", "-b:v", "0", "-cq", str(crf),
                                   "-pix_fmt", "yuv420p", path], stdin=subprocess.PIPE)
        self.n = 0
    def put(self, img):
        pv = os.environ.get("PV")
        if pv is not None:
            if self.n == int(pv):
                a = img if not isinstance(img, np.ndarray) else Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
                a.convert("RGB").save(self.path + ".png"); raise StopIteration
            self.n += 1; return
        if isinstance(img, np.ndarray):
            img = np.clip(img, 0, 255).astype(np.uint8)
            self.p.stdin.write(img.tobytes())
        else:
            self.p.stdin.write(img.convert("RGB").tobytes())
        self.n += 1
    def close(self):
        if self.p is None: return
        self.p.stdin.close(); r = self.p.wait()
        assert r == 0, "encode failed"

def level_to(img, target):
    """gamma so the median luma lands on target (0-255)"""
    a = np.asarray(img.convert("RGB"), np.float32)
    med = float(np.median(a.mean(axis=2))) + 1e-3
    g = math.log(target / 255) / math.log(min(med, 254) / 255)
    out = Image.fromarray(np.clip(255 * (a / 255) ** g, 0, 255).astype(np.uint8))
    if img.mode == "RGBA": out.putalpha(img.getchannel("A"))
    return out
