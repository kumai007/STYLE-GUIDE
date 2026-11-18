# CHANNEL LOOK (algrow-2 "disturbing iceberg" channel) — LOOK agent, Disasters2 v3, 2026-10-26.
# The look is a pure function on display-referred RGB 0..1, baked into 3D LUTs (.cube, 33^3, ffmpeg lut3d tetrahedral):
#   grade/channel.cube        = the look alone (apply to already-normalised material, or anywhere a single LUT is wanted)
#   grade/shots/<name>.cube   = look(normalise_shot(x)), written by grade.py per clip (normalisation constant over the whole clip: no flicker)
#
# Targets measured from the references (grade/study/ref_stats.json; 47/45/43/42 footage frames, cards skipped):
#   Abyssal  p2 5   p50 37  p98 167  sat .33  vig .48   (crushed toe, rolled-off highlights, cold)
#   DD       p2 2   p50 65  p98 196  sat .25  vig .23   (desaturated, heavy CRT vignette)
#   Fern     p2 9   p50 55  p98 194  sat .33  vig .60   shadows teal (R-Y -3.3, B-Y +3.1), highlights warm (R-Y +1.9, B-Y -5.7)
#   LEMMiNO  p2 15  p50 28  p98 225  sat .05            (near-monochrome, lifted black; the extreme end)
# Channel target after look + FilmLook_FX vignette: p2 ~4-6, p50 ~45-55, p98 ~185-200 (soft shoulder, no clipped skies),
# sat ~.24-.28, teal-cyan shadows, neutral-to-warm highlights, skin hues protected (no green/teal faces), greens pulled to teal,
# reds kept deep (not orange). Grain + vignette are NOT baked (they live in Remotion: FilmLook_FX, so punch-ins never scale them).
import numpy as np

# ---------------------------------------------------------------- tone curve (luma), monotone cubic through the points below
_TX = np.array([0.0, 0.05, 0.15, 0.30, 0.45, 0.60, 0.75, 0.88, 1.0])
_TY = np.array([0.010, 0.022, 0.075, 0.175, 0.300, 0.440, 0.600, 0.720, 0.790])
def _pchip(x, xs, ys):
    h = np.diff(xs); d = np.diff(ys) / h
    m = np.zeros_like(ys)
    for k in range(1, len(xs) - 1):
        if d[k - 1] * d[k] > 0:
            w1, w2 = 2 * h[k] + h[k - 1], h[k] + 2 * h[k - 1]
            m[k] = (w1 + w2) / (w1 / d[k - 1] + w2 / d[k])
    m[0], m[-1] = d[0], d[-1]
    x = np.clip(x, xs[0], xs[-1]); i = np.clip(np.searchsorted(xs, x) - 1, 0, len(xs) - 2)
    t = (x - xs[i]) / h[i]
    h00, h10, h01, h11 = 2 * t**3 - 3 * t**2 + 1, t**3 - 2 * t**2 + t, -2 * t**3 + 3 * t**2, t**3 - t**2
    return h00 * ys[i] + h10 * h[i] * m[i] + h01 * ys[i + 1] + h11 * h[i] * m[i + 1]
tone = lambda y: _pchip(y, _TX, _TY)
sstep = lambda a, b, x: (lambda u: u * u * (3 - 2 * u))(np.clip((x - a) / (b - a), 0, 1))
LUMA = np.array([0.2126, 0.7152, 0.0722])

def hue_sat(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1); c = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.where(c < 1e-6, 0, np.where(mx == r, ((g - b) / np.maximum(c, 1e-6)) % 6, np.where(mx == g, (b - r) / np.maximum(c, 1e-6) + 2, (r - g) / np.maximum(c, 1e-6) + 4))) * 60
    return h, np.where(mx > 1e-6, c / np.maximum(mx, 1e-6), 0)

def look(rgb, strength=1.0):
    """rgb (...,3) in 0..1 -> graded rgb. strength 0..1 blends with the input (1 = full channel look)."""
    x = np.clip(rgb, 0, 1)
    h, s = hue_sat(x)
    # skin mask: hue 5-48 deg, moderate saturation, not too dark (faces keep warmth; no teal on skin)
    skin = sstep(0, 8, h) * (1 - sstep(40, 52, h)) * sstep(0.10, 0.2, s) * (1 - sstep(0.62, 0.8, s)) * sstep(0.12, 0.25, (x @ LUMA))
    green = sstep(65, 85, h) * (1 - sstep(150, 175, h)) * sstep(0.08, 0.2, s)
    blue = sstep(185, 200, h) * (1 - sstep(250, 270, h)) * sstep(0.10, 0.25, s)  # skies / dashcam blue: calmed + pulled to cyan-steel
    Y = x @ LUMA
    Yt = tone(Y)
    # luma-preserving tone (70 %) + per-channel tone (30 %: natural highlight desat)
    ratio = np.where(Y > 1e-4, Yt / np.maximum(Y, 1e-4), 0)[..., None]
    t = 0.7 * np.clip(x * ratio, 0, 1.2) + 0.3 * tone(x)
    Y2 = t @ LUMA
    chroma = t - Y2[..., None]
    # greens -> teal: rotate the chroma vector of green pixels a little toward blue, and calm them
    gw = green[..., None]
    chroma = chroma * (1 - 0.18 * gw) + gw * np.stack([-0.25 * chroma[..., 1], 0 * chroma[..., 1], 0.30 * np.abs(chroma[..., 1])], -1) * 0.35
    bw = blue[..., None]
    chroma = chroma * (1 - bw) + bw * (chroma * 0.62 + np.stack([chroma[..., 0] * 0.0, 0.18 * np.abs(chroma[..., 2]), chroma[..., 2] * 0.0], -1))
    # saturation: global .62, less in highlights and deep shadows, skin protected (faces stay alive)
    sat = 0.62 * (1 - 0.30 * sstep(0.55, 0.85, Y2)) * (1 - 0.25 * (1 - sstep(0.02, 0.10, Y2)))
    sat = sat * (1 + 0.30 * skin)
    out = Y2[..., None] + chroma * sat[..., None]
    # split tone: teal-cyan shadows (not on skin), slightly warm-neutral highlights
    sh = ((1 - sstep(0.0, 0.55, Y2)) ** 1.6 * (1 - 0.85 * skin))[..., None]
    hi = sstep(0.55, 1.0, Y2)[..., None]
    out = out + sh * np.array([-0.020, 0.006, 0.020]) + hi * np.array([0.010, 0.002, -0.012])
    out = np.clip(out, 0, 1)
    return x + (out - x) * strength

def write_cube(path, fn, n=33, title="algrow2 channel look"):
    g = np.linspace(0, 1, n)
    b, gg, r = np.meshgrid(g, g, g, indexing="ij")  # .cube order: red fastest
    rgb = np.stack([r, gg, b], -1).reshape(-1, 3)
    out = fn(rgb)
    with open(path, "w", newline="\n") as f:
        f.write(f'TITLE "{title}"\nLUT_3D_SIZE {n}\nDOMAIN_MIN 0 0 0\nDOMAIN_MAX 1 1 1\n')
        for v in out: f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")

if __name__ == "__main__":
    import os
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "channel.cube")
    write_cube(p, look); print("wrote", p)
