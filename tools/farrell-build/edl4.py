# v4 EDL (owner review 3): narration shots >= 3 s alone (outside fades); 0:24 comment removed; comments >= 3.5 s;
# v4b: srcscan.py picked cut-free ss for 02d/22/26/29 and slow 0.7 for 04d (all fades clear of source cuts and burned-in graphic pops).
# source cuts found by segscan moved out of fades (26 subtitle crop, 29 ss, 31 ss). Raw shots unchanged (mix2.wav reused).
import copy
import edl3 as _e3
from edl3 import H, SC, STILL, PHOTOS, CARDS, CARD4, CARD4_SRC, CR_T, CR_W, CR_M, VO, DIP
_S = {s["id"]: {k: v for k, v in s.items() if k not in ("hh", "th")} for s in copy.deepcopy(_e3.SHOTS)}
def sh(i, **kw):
    d = dict(_S[i]); d.update(kw); return d
SHOTS = [
 sh("01"),
 sh("02a", b=16.95),
 sh("02b", a=16.95, b=21.85),
 sh("02d", a=21.85, ss=252.30),                                   # 02c dropped
 sh("03"),
 sh("04a", b=47.74),
 sh("04b", a=47.74, b=52.09),
 sh("04c", a=52.09, b=56.44),
 sh("04d", a=56.44, slow=0.7),
 sh("12"), sh("13"), sh("14"),
 sh("15", x="early"),                                  # dip fully inside raw 14's tail -> 15 alone 3.0 s
 sh("16"),
 sh("18", a=117.964, b=123.90, x="early"),             # 17 (marks photo) dropped: tanuki on "tanuki"
 sh("19", a=123.90, b=128.20),
 sh("20", a=128.20, b=132.70),
 sh("22", a=132.70, b=137.40, ss=645.90),                         # 21 dropped
 sh("23", a=137.40, b=142.70),
 sh("24", a=142.70, b=147.92),
 sh("25", a=147.92, b=151.52, x="early"),
 sh("26", a=151.52, crop=CR_W, ss=484.80),                        # crop drops the burned-in subtitle that popped in the fade
 sh("27"),
 sh("28", b=163.25),
 sh("29", a=163.25, b=167.45, ss=819.85),               # source camera change at 818.84 now after the shot
 sh("31", a=167.45, ss=219.7),                         # 30 (permit sign) dropped; jump cut at ~219.03 now before the shot
 sh("33"),
]
def _handles():
    for i, s in enumerate(SHOTS):
        x = s.get("x", "c")
        s["hh"] = 0 if s["tin"] == "cut" else {"c": H, "late": 0, "early": 2 * H}[x]
        nx = SHOTS[i + 1] if i + 1 < len(SHOTS) else None
        xn = nx.get("x", "c") if nx else "c"
        s["th"] = 0 if s["tout"] == "cut" else {"c": H, "late": 2 * H, "early": 0}[xn]
_handles()
EVENTS = [dict(e) for e in _e3.EVENTS if e["keys"] != ["ken_r1"]]
for e in EVENTS:
    if e["keys"] == ["matsui"]: e.update(t0=122.55, t1=126.20)
    if e["keys"] == ["ken_sept"]: e.update(t0=127.40, t1=131.10)
