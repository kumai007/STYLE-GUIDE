# v3 edit decision list (fixes owner notes on v2). S = C1 sequence time - 193.4467. tin/tout: cut | dis | dip; x = in-transition placement: c (centred, default) | late (blend starts at the boundary, inside the incoming clip) | early (blend ends at the boundary, inside the outgoing clip)
# kinds: raw (own audio + captions), src (B-roll, picture only), photo/map/page (treated), card4 (PROJECT title card as is)
# mot: ("push", rate/s) or ("drift",). slow: playback speed (minterpolate). Every shot moves (rule 15).
H = 18
SC = "C:/Users/ayush/AppData/Local/Temp/claude/fcdd256515fb2464/f4411206-bb71-412c-9ce4-79480641c5c2/scratchpad"
STILL = "C:/Users/ayush/Videos/CLAUDE/PROJECT/RL-EDIT/camping8/stills/still_photo.png"
PHOTOS = {  # path, crop box (16:9), licence note
    "marks": (STILL, None, "project still (C1 source frame)"),
    "marks_close": (STILL, (480, 240, 1680, 915), "project still (C1 source frame)"),
    "tanuki": (SC + "/photo_tanuki_b/tanuki.jpg", (0, 303, 2627, 1781),
               "https://commons.wikimedia.org/wiki/File:Nyctereutes_procyonoides_viverrinus.jpg CC BY-SA 4.0 Alpsdake"),
    "raccoon": (SC + "/photo_raccoon/raccoon.jpg", (840, 627, 4240, 2539),
                "https://commons.wikimedia.org/wiki/File:Raccoon_climbing_in_tree.jpg public domain, David Menke / USFWS"),
}
CARD4 = "C:/Users/ayush/Videos/CLAUDE/PROJECT/graphics/hyperframes/out/camping8/v3/card4-c2.mp4"

CARDS = {
    "ken_r1": dict(author="@kenyama · 14 likes", av="ken",
                   t="I was scared because I thought it was [just standing there the whole time]."),
    "sculptor": dict(author="@user-sculptor88", av="sculptor",
                     t="First comment… Wouldn’t it be easier to check if you turned off the lights inside?"),
    "ken_r4": dict(author="@kenyama", av="ken",
                   t="Right — I realized that partway through. But I was scared that if I turned it off to see better, there’d be [a face stuck to the window]."),
    "matsui": dict(author="@松井佑太-y1t · 4 likes", av="matsui", t="[Definitely a raccoon’s doing.]"),
    "ken_sept": dict(author="@kenyama · reply to @vow5206 · Sept 2021", av="ken",
                     t="Including the handprints, [the raccoon theory is becoming the most likely]."),
    "gajumaru": dict(author="@我寿丸 · June 2021", av="gajumaru", t="What on earth was it?"),
    "ken_june": dict(author="@kenyama · June 2021", av="ken",
                     t="The raccoon theory seems to be strong. But [could it reach the pop-up]…? And the sound like [human footsteps]??? It’s a mystery."),
}

CR_T = (1280, 720, 320, 0)    # top 2/3: drops the source's burned-in subtitles
CR_W = (1440, 810, 240, 0)
CR_M = (1152, 648, 384, 0)    # marks footage: drops burned text at 75-100 % height

import edl2 as _v2
_RAW = {s["id"]: dict(s) for s in _v2.SHOTS if s["kind"] == "raw"}   # raws: exact a/b/ss/aud/caps as v2 (mix2.wav reused)
def raw(i, **kw):
    d = dict(_RAW[i]); d.update(kw); return d
CR_R = (1056, 594, 300, 150)   # canvas roof take A: avoids red katakana top-right and bottom subs
CR_RB = (1152, 648, 384, 0)    # canvas roof take B (top 60 %)
CR_WIN = (1152, 648, 384, 250) # dark window from inside, between katakana and subs

SHOTS = [
 raw("01"),
 # old 02 (14.7 s slowed roof) -> 4 real-speed shots of the canvas roof / dark window (cut sheet VO-C1-05)
 dict(id="02a", a=12.092, b=15.80, kind="src", src="C1", ss=268.75, crop=CR_R, tin="dis", tout="dis", mot=("push", 0.025, 10, 0)),
 dict(id="02b", a=15.80, b=19.45, kind="src", src="C1", ss=286.05, crop=CR_RB, tin="dis", tout="dis", mot=("push", 0.03, 0, -10)),
 dict(id="02c", a=19.45, b=23.10, kind="src", src="C1", ss=273.60, crop=(960, 540, 560, 120), tin="dis", tout="dis", mot=("push", 0.025, -12, 0)),
 dict(id="02d", a=23.10, b=26.807, kind="src", src="C1", ss=254.0, crop=CR_WIN, tin="dis", tout="dis", mot=("push", 0.03)),
 raw("03"),
 dict(id="04a", a=43.9905, b=48.60, kind="src", src="C1", ss=8.20, slow=0.58, tin="dis", x="early", tout="dis", mot=("push", 0.02)),
 dict(id="04b", a=48.60, b=52.60, kind="src", src="C1", ss=167.6, crop=CR_W, tin="dis", tout="dis", mot=("push", 0.03, -30, 0)),
 dict(id="04c", a=52.60, b=57.35, kind="src", src="C1", ss=143.9, crop=CR_W, tin="dis", tout="dis", mot=("push", 0.03, 20, 0)),
 dict(id="04d", a=57.35, b=60.774, kind="src", src="C1", ss=364.80, slow=0.8, tin="dis", tout="dis", mot=("push", 0.035)),
 raw("12"),
 dict(id="13", a=85.265, b=89.269, kind="src", src="C1", ss=462.8, crop=(1632, 918, 144, 0), tin="dis", tout="dis", mot=("push", 0.03)),
 raw("14", x="late"),
 dict(id="15", a=99.65, b=102.649, kind="src", src="C1", ss=618.188, crop=CR_T, tin="dip", tout="dis", mot=("push", 0.03)),
 raw("16", x="late"),
 dict(id="17", a=117.964, b=120.85, kind="photo", img="marks", tin="dis", x="early", tout="dis", mot=("push", 0.03)),
 dict(id="18", a=120.85, b=124.40, kind="photo", img="tanuki", tin="dis", tout="dis", mot=("push", 0.03, 10, -4)),
 dict(id="19", a=124.40, b=127.90, kind="photo", img="raccoon", lvl=96, tin="dis", tout="dis", mot=("push", 0.03, -8, 4)),
 dict(id="20", a=127.90, b=131.50, kind="src", src="C1", ss=637.1, crop=CR_M, tin="dis", tout="dis", mot=("push", 0.03, 16, 0)),
 dict(id="21", a=131.50, b=135.30, kind="src", src="C1", ss=642.0, crop=(960, 540, 560, 40), tin="dis", tout="dis", mot=("push", 0.025, -16, 0)),
 # old 21 (7.8 s photo) -> marks footage + the marks photo (cut sheet VO-C1-09: end on the photo of the marks)
 dict(id="22", a=135.30, b=139.10, kind="src", src="C1", ss=646.95, slow=0.75, crop=(1152, 648, 96, 0), tin="dis", tout="dis", mot=("push", 0.025, 12, 0)),
 dict(id="23", a=139.10, b=142.90, kind="photo", img="marks_close", tin="dis", tout="dis", mot=("push", 0.025, -12, 4)),
 dict(id="24", a=142.90, b=148.02, kind="src", src="C1", ss=293.324, slow=0.54, crop=CR_T, grade="eq=gamma=0.78:saturation=0.85",
      tin="dis", tout="dip", mot=("push", 0.02, 0, -12)),
 dict(id="25", a=148.02, b=152.13, kind="map", ss=2.0, tin="dip", tout="dis", mot=("push", 0.03)),
 dict(id="26", a=152.13, b=155.73, kind="src", src="C2", ss=486.0, tin="dis", tout="dip", mot=("push", 0.03)),
 dict(id="27", a=155.73, b=159.033, kind="card4", tin="dip", tout="dip"),
 dict(id="28", a=159.033, b=163.10, kind="page", hl_at=161.41, lift_to=78, tin="dip", tout="dis"),
 dict(id="29", a=163.10, b=166.35, kind="src", src="C2", ss=816.0, stamp=("LOCH LOMOND", "SCOTLAND"), tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="30", a=166.35, b=169.60, kind="src", src="C2", ss=74.36, slow=0.58, tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="31", a=169.60, b=173.00, kind="src", src="C2", ss=219.0, tin="dis", tout="cut", mot=("push", 0.03)),
 raw("33"),
]

def _handles():
    for i, s in enumerate(SHOTS):
        x = s.get("x", "c")
        s["hh"] = 0 if s["tin"] == "cut" else {"c": H, "late": 0, "early": 2 * H}[x]
        nx = SHOTS[i + 1] if i + 1 < len(SHOTS) else None
        xn = nx.get("x", "c") if nx else "c"
        s["th"] = 0 if s["tout"] == "cut" else {"c": H, "late": 2 * H, "early": 0}[xn]
_handles()
CARD4_SRC = CARD4
CARD4 = SC + "/farrell_sample/v3/card4-c2_blur.mp4"   # same card, background blurred (note 4)

# overlays (final pass). enter/exit 18 f eased. ent: "up" (floats up from the bottom) | "pan" (slow 3D pan in); alternate.
# shot = real YouTube comment screenshot key(s) (yt_capture3/<key>.png); card keys = fallback own card
EVENTS = [
 dict(kind="shot", keys=["ken_r1"], t0=24.25, t1=26.80, hl=[(0, 24.60)], ent="up"),
 dict(kind="shot", keys=["toru"], t0=44.45, t1=51.28, hl=[(0, 48.01)], ent="pan", yaw=(-9, -6), pitch=(5, 3.5)),
 dict(kind="shot", keys=["sculptor", "ken_r4"], t0=51.36, t1=59.95, morph=53.04, hl=[(1, 58.65)], ent="up"),
 dict(kind="shot", keys=["matsui"], t0=122.70, t1=125.70, hl=[(0, 124.71)], ent="pan", yaw=(-12, -9), pitch=(5, 4)),
 dict(kind="shot", keys=["ken_sept"], t0=127.55, t1=130.75, hl=[(0, 129.45)], ent="up"),
 dict(kind="shot", keys=["gajumaru", "ken_june"], t0=135.30, t1=142.85, morph=136.23, hl=[(1, 137.24)], ent="pan", yaw=(-10, -7), pitch=(5, 3.5)),
]
VO = _v2.VO
DIP = _v2.DIP
