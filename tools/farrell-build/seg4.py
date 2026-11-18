# v4 shot renderer + assembly (edl4, seg4/, asm4.mp4; even eased dip instead of ffmpeg fadeblack; unchanged shots copied from seg3). Footage: ffmpeg decode (crop/scale, optional slow-mo minterpolate) -> PIL push/drift -> x264.
# Treated (photo/map/page): desat + level + grain/dust + VHS noise/tracking line + vignette + push.
import sys, os, math, subprocess, numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from multiprocessing import Pool
from PIL import Image, ImageFilter
from common import *
import edl4 as edl
import edl3 as _old
import shutil

SEG = W + "/seg4"
TEX = grain_tex(2400, 1600, amt=9, seed=7, dust=70)

def shot_frames(s):
    f0 = fr(s["a"]) - s["hh"]
    f1 = fr(s["b"]) + s["th"]
    return f0, f1

def ease(x):
    x = min(1.0, max(0.0, x))
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2

def push_img(im, s, dx=0.0, dy=0.0):
    cx, cy = im.size[0] / 2 + dx, im.size[1] / 2 + dy
    return im.transform((SW, SH), Image.AFFINE, (1 / s, 0, cx - SW / 2 / s, 0, 1 / s, cy - SH / 2 / s), Image.BICUBIC)

def motion(s, i, n):
    t = i / FPS; u = i / max(1, n - 1); m = s.get("mot", ("push", 0.03))
    if m[0] == "drift":  # slow lateral drift + gentle creep in (raw keeps its colour)
        sg = -1 if (sum(map(ord, s["id"])) % 2) else 1
        return 1.05 + 0.05 * u, sg * 40 * (2 * u - 1), 6 * (2 * u - 1)
    rate = m[1]; dx = m[2] if len(m) > 2 else 0; dy = m[3] if len(m) > 3 else 0
    return 1.02 + rate * t, dx * u, dy * u

def treat(img, i, edge=0.74):
    """treated-shot textures: film grain + dust/scratches (boiling), VHS noise + tracking line, vignette"""
    a = np.asarray(img.convert("RGB"), np.float32)
    rng = np.random.default_rng(1000 + i)
    ox, oy = int(rng.integers(0, 480)), int(rng.integers(0, 520))
    a += TEX[oy:oy + SH, ox:ox + SW, None]
    y = (i * 7) % 1300 - 110
    if 0 <= y < SH - 44:
        a[y:y + 3] += 22; a[y + 3:y + 44] += 6 + rng.normal(0, 6, (41, SW, 1)).astype(np.float32)
    return vignette(a, edge)

def reader(s, n):
    src = {"C1": C1V, "C2": C2V}[s["src"]]
    f0, _ = shot_frames(s); pre = (fr(s["a"]) - f0) / FPS
    vf = []
    if s.get("crop"): c = s["crop"]; vf.append(f"crop={c[0]}:{c[1]}:{c[2]}:{c[3]}")
    sp = s.get("slow")
    if sp:
        ss = s["ss"] - pre * sp; dur = n / FPS * sp + 0.6
        vf += ["scale=1280:720:flags=lanczos", f"setpts=(PTS-STARTPTS)/{sp}",
               "minterpolate=fps=30000/1001:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1", "scale=1920:1080:flags=lanczos"]
    else:
        ss = s["ss"] - pre; dur = n / FPS + 0.6
        vf += ["scale=1920:1080:flags=lanczos", "fps=30000/1001"]
    if s.get("lift") and s["lift"] != 1.0: vf.append(f"eq=gamma={s['lift']}")
    if s.get("grade"): vf.append(s["grade"])
    vf += ["setsar=1", "format=rgb24"]
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{ss:.4f}", "-t", f"{dur:.4f}", "-i", src, "-vf", ",".join(vf),
           "-frames:v", str(n), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    return subprocess.Popen(cmd, stdout=subprocess.PIPE)

def render_footage(s, out):
    f0, f1 = shot_frames(s); n = f1 - f0
    p = reader(s, n); enc = Enc(out); last = None; got = 0
    for i in range(n):
        b = p.stdout.read(SW * SH * 3)
        if len(b) == SW * SH * 3:
            last = Image.frombytes("RGB", (SW, SH), b); got += 1
        sc, dx, dy = motion(s, i, n)
        enc.put(push_img(last, sc, dx, dy))
    p.stdout.close(); p.wait(); enc.close()
    return got, n

def render_photo(s, out):
    path, box, _ = edl.PHOTOS[s["img"]]
    im = Image.open(path).convert("RGB")
    if box: im = im.crop(box)
    im = im.resize((SW, SH), Image.LANCZOS)
    im = level_to(desat(im, 0.2), s.get("lvl", 86))
    f0, f1 = shot_frames(s); n = f1 - f0; enc = Enc(out)
    for i in range(n):
        sc, dx, dy = motion(s, i, n)
        enc.put(treat(push_img(im, sc, dx, dy), f0 + i))
    enc.close(); return n, n

def render_map(s, out):
    f0, f1 = shot_frames(s); n = f1 - f0
    src = P + "/graphics/hyperframes/out/camping8/v2/sat-lomond.mp4"
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(s["ss"]), "-i", src, "-vf", "fps=30000/1001", "-frames:v", str(n),
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    k = len(raw) // (SW * SH * 3); enc = Enc(out); g = None
    for i in range(n):
        j = min(i, k - 1)
        a = np.frombuffer(raw[j * SW * SH * 3:(j + 1) * SW * SH * 3], np.uint8).reshape(SH, SW, 3).astype(np.float32)
        if g is None:
            med = float(np.median(a.mean(2))) + 1e-3
            g = math.log(80 / 255) / math.log(min(med, 254) / 255)
        im = Image.fromarray(np.clip(255 * (a / 255) ** g, 0, 255).astype(np.uint8))
        im = desat(im, 0.45)
        sc, dx, dy = motion(s, i, n)
        enc.put(treat(push_img(im, sc, dx, dy), f0 + i))
    enc.close(); return k, n

def render_page(s, out):
    pg = Image.open(P + "/graphics/hyperframes/assets/camping8/channels/c2_ch.png").convert("RGB").crop((760, 0, 3560, 1700))
    k = 0.7; pg = pg.resize((int(2800 * k), int(1700 * k)), Image.LANCZOS)
    pg = desat(pg, 0.2)
    # dark-theme page lifted toward the treated band (rule 6) with a gamma, white text stays white
    a = np.asarray(pg, np.float32); med = float(np.median(a.mean(2))) + 1e-3
    g = math.log(s.get("lift_to", 62) / 255) / math.log(min(med, 254) / 255)
    pg = Image.fromarray(np.clip(255 * (a / 255) ** g, 0, 255).astype(np.uint8)).convert("RGBA")
    sw, sh = pg.size
    box = [int(v * k) for v in (1228 - 760 - 14, 566, 1848 - 760 + 14, 650)]
    base = np.asarray(pg, np.float32)
    bg = level_to(pg.convert("RGB").resize((SW, SH)).filter(ImageFilter.GaussianBlur(24)), 80)
    f0, f1 = shot_frames(s); n = f1 - f0; enc = Enc(out)
    for i in range(n):
        t = i / FPS; T = (f0 + i) / FPS; u = ease(i / max(1, n - 1))
        sheet = pg
        if T >= s["hl_at"]:
            kk = ease((T - s["hl_at"]) * FPS / 14.0)
            x0 = box[0]; x1 = int(box[0] + (box[2] - box[0]) * kk)
            if x1 > x0:
                aa = base.copy(); reg = aa[box[1]:box[3], x0:x1, :3]
                aa[box[1]:box[3], x0:x1, :3] = 255 - (255 - reg) * (255 - np.array(RED, np.float32)) / 255  # screen
                sheet = Image.fromarray(aa.astype(np.uint8))
        sc = 1.08 * (1 + 0.04 * t)
        quad = project(sw, sh, (sw * 0.36, sh * 0.40), (900 - 20 * u, 520), sc, -16 + 4 * u, 9 - 2 * u)
        frame = bg.convert("RGBA"); frame.alpha_composite(warp(sheet, quad))
        enc.put(treat(frame.convert("RGB"), f0 + i, 0.72))
    enc.close(); return n, n

RN = {"raw": render_footage, "src": render_footage, "photo": render_photo, "map": render_map, "page": render_page}

KEYS = ("a", "b", "hh", "th", "ss", "crop", "slow", "kind", "src", "img", "mot", "grade", "lvl", "stamp", "hl_at", "lift_to")
OLD = {o["id"]: o for o in _old.SHOTS}
def job(s):
    out = f"{SEG}/{s['id']}.mp4"
    o = OLD.get(s["id"])
    if o and all(o.get(k) == s.get(k) for k in KEYS) and os.path.exists(f"{W}/seg3/{s['id']}.mp4"):
        shutil.copyfile(f"{W}/seg3/{s['id']}.mp4", out); return s["id"], "copied"
    try:
        r = RN[s["kind"]](s, out)
    except StopIteration:
        r = None
    return s["id"], r

def card4_path():
    return edl.CARD4 if os.path.exists(edl.CARD4) else edl.CARD4_SRC

def seg_path(s):
    return card4_path() if s["kind"] == "card4" else f"{SEG}/{s['id']}.mp4"

def assemble():
    inputs = []; fc = []
    for i, s in enumerate(edl.SHOTS):
        inputs += ["-i", seg_path(s)]
        fc.append(f"[{i}:v]setpts=PTS-STARTPTS,settb=1001/30000,setsar=1,format=yuv420p[s{i}]")
    cur = "s0"; f0, f1 = shot_frames(edl.SHOTS[0]); L = f1 - f0
    for i in range(1, len(edl.SHOTS)):
        s = edl.SHOTS[i]; g0, g1 = shot_frames(s); n = g1 - g0; o = f"c{i}"
        if s["tin"] == "cut":
            fc.append(f"[{cur}][s{i}]concat=n=2:v=1:a=0,settb=1001/30000[{o}]"); L += n
        else:
            off = (L - 2 * edl.H) / FPS
            if s["tin"] == "dis":
                tr = "transition=fade"
            else:  # even dip: A eases to black over the first half, B eases in over the second (P runs 1 -> 0)
                # no st()/ld(): xfade runs the expression on several threads that share those registers (gave stray bright rows)
                K = "if(eq(PLANE,0),16,128)"
                tr = (f"transition=custom:expr='if(gt(P,0.5),{K}+(A-{K})*(2*P-1)*(2*P-1)*(5-4*P),"
                      f"{K}+(B-{K})*(1-2*P)*(1-2*P)*(1+4*P))'")
            fc.append(f"[{cur}][s{i}]xfade={tr}:duration={2 * edl.H / FPS:.6f}:offset={off:.6f}[{o}]")
            L += n - 2 * edl.H
        cur = o
    print("card4:", card4_path()); print("expected frames", L, "target", fr(180.02), flush=True)
    r = subprocess.run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-filter_complex", ";".join(fc), "-map", f"[{cur}]",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "12", "-pix_fmt", "yuv420p", "-r", "30000/1001", W + "/asm4.mp4"],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stderr[-1500:]

if __name__ == "__main__":
    os.makedirs(SEG, exist_ok=True)
    if sys.argv[1:2] == ["asm"]:
        assemble(); sys.exit()
    ids = sys.argv[1:]
    # slow-mo shots first (longest), then the rest
    js = [s for s in edl.SHOTS if s["kind"] in RN and (not ids or s["id"] in ids)]
    js.sort(key=lambda s: (not s.get("slow"), -(s["b"] - s["a"])))
    with Pool(4) as p:
        for r in p.imap_unordered(job, js): print("done", r, flush=True)
