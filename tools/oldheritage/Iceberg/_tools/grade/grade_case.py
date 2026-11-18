"""Channel grade for one case (port of the kit's grade/grade.py: per-source normalisation + look.py + saturation trim, one LUT per source).
usage: grade_case.py <out dir> <name>=<src file> [...]   -> <out>/<name>.mp4 (graded, no audio) + <out>/luts/<name>.cube
Night material stays night (median lifted at most ~0.07); a source never changes colour between its windows (one LUT per file)."""
import subprocess, sys, os, json
import numpy as np
G = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, G)
from look import look, write_cube, LUMA
MW, MH = 480, 270

def frames(p, n=24):
    if p.lower().endswith((".jpg", ".jpeg", ".png")):
        r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vf", f"scale={MW}:{MH}", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
        return np.frombuffer(r, np.uint8).reshape(-1, MH, MW, 3).astype(np.float32) / 255
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-vf", f"fps={n}/{d:.3f},scale={MW}:{MH}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    return np.frombuffer(r, np.uint8).reshape(-1, MH, MW, 3).astype(np.float32) / 255

def norm_params(fr):
    px = fr.reshape(-1, 3); Y = px @ LUMA
    lo, hi = np.percentile(Y, 0.5), np.percentile(Y, 99.5)
    gain = min(1.8, (0.955 - 0.012) / max(hi - lo, 1e-3)); off = max(0.012 - lo * gain, -0.12)
    z = np.clip(px * gain + off, 0, 1); Yz = z @ LUMA; mx, mn = z.max(1), z.min(1)
    neutral = (Yz > 0.15) & (Yz < 0.8) & ((mx - mn) < 0.12)
    if neutral.sum() < 500: neutral = (Yz > 0.15) & (Yz < 0.8)
    m = z[neutral].mean(0) if neutral.sum() else np.ones(3); cast = np.clip(m.mean() / np.maximum(m, 1e-3), 0.90, 1.10)
    z = np.clip(z * cast, 0, 1); med = np.median(z @ LUMA)
    target = max(0.25, min(0.36, med + 0.07))
    gamma = float(np.clip(np.log(target) / np.log(max(med, 1e-3)), 0.72, 1.6))
    return dict(gain=float(gain), off=float(off), cast=[float(c) for c in cast], gamma=gamma)
def normalise(rgb, p): return np.clip(np.clip(rgb * p["gain"] + p["off"], 0, 1) * np.array(p["cast"]), 0, 1) ** p["gamma"]
def sat_trim(rgb, k): Y = (rgb @ LUMA)[..., None]; return np.clip(Y + (rgb - Y) * k, 0, 1)

def house(rgb):
    """ICEBERG channel look (its own, not algrow-2's channel.cube): neutral, contrasty, cool shadows / warm-neutral highlights, sat 0.9."""
    x = np.clip(rgb, 0, 1)
    Y = x @ LUMA
    # filmic S-curve on luma (toe + shoulder), applied as a ratio so hue holds
    c = np.clip(0.5 + (Y - 0.5) * 1.18, 0, 1); c = c * c * (3 - 2 * c) * 0.35 + c * 0.65
    x = np.clip(x * (c / np.maximum(Y, 1e-4))[..., None], 0, 1)
    Y2 = (x @ LUMA)[..., None]
    sh = np.clip(1 - Y2 * 2.2, 0, 1); hi = np.clip(Y2 * 1.6 - 0.6, 0, 1)
    x = x + sh * np.array([-0.012, 0.0, 0.016]) + hi * np.array([0.014, 0.006, -0.008])
    Y3 = (x @ LUMA)[..., None]
    x = Y3 + (x - Y3) * 0.9
    return np.clip(x * 0.985 + 0.008, 0, 1)  # a hair of lift in the blacks, never pure 0

HOUSE = "--house" in sys.argv
NONORM = "--nonorm" in sys.argv  # stills: the look only (normalising aerials/photos with sky washed them out)
args = [a for a in sys.argv[1:] if a not in ("--house", "--nonorm")]
if HOUSE: look = house
out = args[0]; os.makedirs(out + "/luts", exist_ok=True)
for arg in args[1:]:
    name, src = arg.split("=", 1)
    fr = frames(src); p = norm_params(fr)
    if NONORM: p.update(gain=1.0, off=0.0, cast=[1.0, 1.0, 1.0], gamma=1.0)
    o = look(normalise(fr[:: max(1, len(fr) // 6)], p)); mx, mn = o.max(-1), o.min(-1)
    so = float(np.where(mx > .004, (mx - mn) / np.maximum(mx, .004), 0).mean()); p["sat_k"] = float(np.clip(0.29 / max(so, 1e-3), 0.7, 1.0))
    cube = f"{out}/luts/{name}.cube"
    write_cube(cube, lambda x: sat_trim(look(normalise(x, p)), p["sat_k"]), title=name)
    img = src.lower().endswith((".jpg", ".jpeg", ".png"))
    dst = f"{out}/{name}" + (".jpg" if img else ".mp4")
    vf = f"lut3d=file='{cube}':interp=tetrahedral" + ("" if img else ",format=yuv420p")
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", vf] + (["-q:v", "2"] if img else ["-an", "-c:v", "libx264", "-crf", "14", "-g", "15", "-bf", "0"]) + [dst]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(name, "ok" if r.returncode == 0 else r.stderr[-300:], json.dumps({k: (round(v, 3) if isinstance(v, float) else v) for k, v in p.items()}))
