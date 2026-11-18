# v2 edit decision list, sample seconds S (S = C1 sequence time - 193.4467). tin/tout: cut | dis | dip
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

SHOTS = [
 dict(id="01", a=0.000, b=12.092, kind="raw", src="C1", ss=316.0692, tin="cut", tout="dis", lift=1.15, aud=(0.0, 12.092), mot=("drift",),
      caps=[(0.46, 1.10, "And the pop-up..."), (2.15, 3.55, "...went 'boom'. It just went boom again!"),
            (7.94, 9.99, "Huh? I can't hear it walking away."), (11.16, 11.87, "It's standing there.")]),
 dict(id="02", a=12.092, b=26.807, kind="src", src="C1", ss=285.70, slow=0.5, crop=CR_T, tin="dis", tout="dis", mot=("drift",)),
 dict(id="03", a=26.807, b=43.9905, kind="raw", src="C1", ss=333.9670, tin="dis", tout="dis", lift=1.2, aud=(25.807, 43.99), mot=("drift",),
      caps=[(27.47, 29.33, "Good thing we had that one shut."), (30.60, 32.74, "I'd like to shut the others too, but..."),
            (33.41, 35.69, "Opening the mesh is the scary part."), (37.54, 38.62, "At least it's locked."),
            (40.45, 40.95, "What do we do?"), (41.42, 43.47, "At least the camera's rolling... but are we okay?")]),
 dict(id="04a", a=43.9905, b=50.80, kind="src", src="C1", ss=7.768, slow=0.58, tin="dis", tout="dis", mot=("push", 0.02)),
 dict(id="04b", a=50.80, b=54.29, kind="src", src="C1", ss=167.6, crop=CR_W, tin="dis", tout="dis", mot=("push", 0.03, -30, 0)),
 dict(id="04c", a=54.29, b=57.90, kind="src", src="C1", ss=143.9, crop=CR_W, tin="dis", tout="dis", mot=("push", 0.03, 20, 0)),
 dict(id="04d", a=57.90, b=60.774, kind="src", src="C1", ss=364.9, tin="dis", tout="dis", mot=("push", 0.035)),
 dict(id="12", a=60.774, b=85.265, kind="raw", src="C1", ss=426.6929, tin="dis", tout="dis", aud=(59.774, 85.265), mot=("drift",),
      caps=[(61.38, 64.03, "So a moth just happened to fly\ninto it right then?"),
            (65.19, 68.56, "A boar's out there, and right then,\nseparately, a moth shows up?"),
            (69.73, 70.43, "A big moth?"), (70.79, 71.98, "Was it a moth, though? But..."),
            (72.76, 75.53, "There was a huge one, remember?\nAround dusk."), (75.72, 78.76, "Yeah, but I was looking this way, so..."),
            (79.58, 80.04, "It went boom."), (80.90, 82.80, "Huh? Did it shake here?"), (83.00, 83.29, "It shook."),
            (83.61, 84.89, "Would a moth hit that hard?")]),
 dict(id="13a", a=85.265, b=87.40, kind="src", src="C1", ss=462.8, crop=(1632, 918, 144, 0), tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="13b", a=87.40, b=89.269, kind="src", src="C1", ss=172.25, crop=CR_W, tin="dis", tout="dis", mot=("push", 0.03, 0, -10)),
 dict(id="14", a=89.269, b=99.65, kind="raw", src="C1", ss=509.9761, tin="dis", tout="dip", lift=1.0, aud=(88.60, 97.577), mot=("drift",),
      caps=[(89.643, 99.05, "Checking with a light.")]),
 dict(id="15", a=99.65, b=102.649, kind="src", src="C1", ss=618.188, crop=CR_T, tin="dip", tout="dis", mot=("push", 0.03)),
 dict(id="16", a=102.649, b=117.964, kind="raw", src="C1", ss=621.1872, tin="dis", tout="dis", aud=(102.36, 117.964), mot=("drift",),
      caps=[(102.649, 109.53, "Handprints, left between the entrance\nand the passenger seat..."),
            (109.53, 117.14, "Presumably, the culprit was a tanuki.")]),
 dict(id="17a", a=117.964, b=119.30, kind="photo", img="marks", tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="17b", a=119.30, b=122.70, kind="photo", img="tanuki", tin="dis", tout="dis", mot=("push", 0.03, 10, -4)),
 dict(id="18a", a=122.70, b=124.70, kind="src", src="C1", ss=637.0, crop=CR_M, tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="18b", a=124.70, b=127.40, kind="photo", img="raccoon", lvl=96, tin="dis", tout="dis", mot=("push", 0.03, -8, 4)),
 dict(id="19", a=127.40, b=130.66, kind="src", src="C1", ss=640.2, crop=(1152, 648, 96, 0), tin="dis", tout="dis", mot=("push", 0.03, 16, 0)),
 dict(id="20", a=130.66, b=135.14, kind="src", src="C1", ss=644.6, crop=(960, 540, 560, 40), tin="dis", tout="dis", mot=("push", 0.025, -16, 0)),
 dict(id="21", a=135.14, b=142.90, kind="photo", img="marks_close", tin="dis", tout="dis", mot=("push", 0.02, -12, 4)),
 dict(id="22", a=142.90, b=148.02, kind="src", src="C1", ss=293.324, slow=0.54, crop=CR_T, grade="eq=gamma=0.78:saturation=0.85",
      tin="dis", tout="dip", mot=("push", 0.02, 0, -12)),
 dict(id="25", a=148.02, b=152.13, kind="map", ss=2.0, tin="dip", tout="dis", mot=("push", 0.03)),
 dict(id="26", a=152.13, b=155.73, kind="src", src="C2", ss=486.0, tin="dis", tout="dip", mot=("push", 0.03)),
 dict(id="27", a=155.73, b=159.033, kind="card4", tin="dip", tout="dip"),
 dict(id="28", a=159.033, b=163.10, kind="page", hl_at=161.41, lift_to=78, tin="dip", tout="dis"),
 dict(id="29", a=163.10, b=165.38, kind="src", src="C2", ss=816.0, stamp=("LOCH LOMOND", "SCOTLAND"), tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="30", a=165.38, b=167.26, kind="src", src="C2", ss=74.0, tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="31", a=167.26, b=169.82, kind="src", src="C2", ss=197.0, tin="dis", tout="dis", mot=("push", 0.03)),
 dict(id="32", a=169.82, b=173.00, kind="src", src="C2", ss=221.0, tin="dis", tout="cut", mot=("push", 0.03)),
 dict(id="33", a=173.00, b=180.02, kind="raw", src="C2", ss=80.0, tin="cut", tout="cut", aud=(172.90, 180.0), mot=("drift",),
      caps=[(173.42, 175.09, "Welcome back to Under The Weather\nthis week,"),
            (175.10, 178.67, "live and direct from Loch Lomond\nand the Trossachs National Park.")]),
]

# overlays over footage (final pass). times in S. enter/exit 18 frames eased; morph 15 frames eased
EVENTS = [
 dict(kind="card", keys=["ken_r1"], t0=24.25, t1=26.80, hl=[(0, 0, 24.60)], yaw=(-11, -8), pitch=(5, 3.5)),
 dict(kind="page", t0=44.45, t1=51.28, scroll=(45.05, 47.60), hl=48.01, tr=48.01, yaw=(-9, -6), pitch=(5, 3.5)),
 dict(kind="card", keys=["sculptor", "ken_r4"], t0=51.36, t1=59.95, morph=53.04, hl=[(1, 0, 58.65)], yaw=(10, 7), pitch=(-4, -3)),
 dict(kind="card", keys=["matsui"], t0=122.75, t1=125.75, hl=[(0, 0, 124.71)], yaw=(-12, -9), pitch=(5, 4)),
 dict(kind="card", keys=["ken_sept"], t0=127.40, t1=130.70, hl=[(0, 0, 129.45)], yaw=(11, 8), pitch=(-4, -3)),
 dict(kind="card", keys=["gajumaru", "ken_june"], t0=135.30, t1=142.85, morph=136.23, hl=[(1, 0, 137.24), (1, 1, 141.83)],
      yaw=(-10, -7), pitch=(5, 3.5)),
]

VO = [("vo_c1_05", 12.3923), ("vo_c1_06", 44.2908), ("vo_c1_07", 85.5654), ("vo_c1_08", 97.8777),
      ("vo_c1_09", 118.2647), ("vo_c1_10", 144.524), ("vo_c2_01", 160.23)]
DIP = 155.73  # case change (bed crossfade)
