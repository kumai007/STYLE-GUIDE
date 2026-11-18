# v5 = v4 shots unchanged (asm4.mp4 reused) + overlay/caption timing fixed by rulecheck.py:
#  comment enter/exit/morph motion moved out of every crossfade; captions >= 5/6 s (extend, else merge with next);
#  raw 14 caption ended at its speech (+ reading time) instead of holding 9.4 s over silence.
from edl4 import *          # noqa
import edl4 as _e4
from common import FPS
MINCAP = 5 / 6 + 0.005
ONSCREEN_CAPS = {"16"}      # captions that translate on-screen text (no speech): may stay while the text shows

for s in SHOTS:
    caps = [list(c) for c in s.get("caps", [])]
    if s["id"] == "14": caps[0][1] = 91.65
    out = []
    i = 0
    while i < len(caps):
        a, b, t = caps[i]
        if b - a < MINCAP:
            lim = (caps[i + 1][0] - 0.10) if i + 1 < len(caps) else s["b"] - 0.08
            if a + MINCAP <= lim: b = a + MINCAP + 0.06 if a + MINCAP + 0.06 <= lim else a + MINCAP
            elif i + 1 < len(caps):          # no room: merge with the next line
                b, t = caps[i + 1][1], t + "\n" + caps[i + 1][2]; i += 1
        out.append((a, round(b, 3), t)); i += 1
    if "caps" in s: s["caps"] = out

for e in EVENTS:
    k = e["keys"]
    if k == ["toru"]: e.update(t1=50.80)
    if k == ["sculptor", "ken_r4"]: e.update(t0=50.85, t1=60.10)
    if k == ["ken_sept"]: e.update(t0=126.95, t1=132.05)
    if k == ["gajumaru", "ken_june"]: e.update(morph=136.10, t1=144.00)
