# v6 = v5 shots (asm4.mp4 reused) + owner review 4: overlay + its footage = one shot.
#  next comment slides up while the old one leaves (blur held, no plain flash); threads shown extended from the start
#  (morph before t0 -> already grown, reply translation in the strip); a comment on screen at a crossfade fades out
#  with its shot (xout = fade window), or fades in with it (xin). Plain footage next to an overlay: 0 s or >= 3 s.
from edl5 import *          # noqa
from common import FPS
def win(sid):
    s = next(x for x in SHOTS if x["id"] == sid)
    return (round(s["a"] - s["hh"] / FPS, 4), round(s["a"] + (2 * H - s["hh"]) / FPS, 4))
for e in EVENTS:
    k = e["keys"]
    if k == ["toru"]: e.update(t0=win("04a")[0], xin=win("04a"), t1=51.30)
    if k == ["sculptor", "ken_r4"]: e.update(t0=50.70, morph=40.70, t1=win("12")[1], xout=win("12"))
    if k == ["matsui"]: e.update(t0=122.45, t1=127.45)
    if k == ["ken_sept"]: e.update(t0=126.85, t1=133.95)
    if k == ["gajumaru", "ken_june"]: e.update(t0=133.35, morph=123.35, t1=win("24")[1], xout=win("24"))
