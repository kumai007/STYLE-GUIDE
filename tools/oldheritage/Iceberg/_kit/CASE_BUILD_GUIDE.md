# Iceberg channel: case build guide (for case agents)

You build finished cases for a caught-on-camera countdown video. The owner approved two Tornado cases (Fairdale, Joplin) as the
bar. Each case is one isolated Remotion composition rendered to a mastered mp4; the videos are then concatenated
(intro + cases + outro). Work alone in your own files; other agents are building other cases at the same time.

## 1. Read first (in this order, briefly)
1. `C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/CLAUDE.md`: channel style, owner notes, bans. This is binding.
2. Reference cases: `_engine/src/TorC01v5.tsx` (Fairdale: long climax raw, slow replay, MarkMap of counted homes, pages)
   and `_engine/src/cases/TOR02.tsx` (Joplin, already in the per-case layout you will use: TimeRuler, ScarTrace, ThenNow).
3. `_engine/src/brand.tsx`: the channel components (TitleCard, RedLabel, Inset, Aerial, MarkMap, TimeRuler, ScarTrace, ThenNow).
   Read-only: never edit brand.tsx or another case's files.
4. Your case in the video's cut sheet (`<video>/script/* cut sheet.md`, `## CASE nn` section): the VO lines and the ▶ RAW cues
   (tag, source timecodes, what is on screen). Footage files: `<video>/footage/INDEX.csv` (folder numbers do NOT match the
   script's case numbers; match by title/place/URL ids). The VO take: `<video>/vo/raw/CASEnn.mp3` + `.srt` (word timings).

## 2. Setup
`C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/_tools/newcase.sh <VID> <NN>`  (VID: TOR = 03_Tornado, ND = 01_Natural_Disasters, TP = 02_Theme_Park)
creates `build/CASEnn/{assets,media,graded,shots,maps,out}`, an isolated public dir `_engine/pubs/<KEY>` and your code file
`_engine/src/cases/<KEY>.tsx` (KEY = e.g. TOR07). In code, static paths are: `case/graded/x.mp4`, `vor/CASEnn.mp3`,
`sfx_n2/...`, `sfx_n2/real/...`, `music/Music 3.mp3`. Imports from a case file: `../brand`, `../lib/...`, `../dev/<Device>`.
Export exactly `export const DUR = <frames>;` and `export const Comp: React.FC`.

## 3. The edit (what the owner approved)
- **Countdown videos (DC, IN; owner 14 Nov 2026)**: a case opens number -> VO: the CaseNumberTransition (`<KEY>_T.mp4`) is the only intro, then the case starts straight on its first VO line over footage. No title card, no raw before the first VO line (a cold-open raw goes after the first VO paragraph). Built masters were trimmed by `_tools/open_on_vo.py` (untrimmed kept as `out/<KEY>_titled.mp4`; transition lead-in = `build/CASEnn/transition.json` -> `media/_t_in.mp4`); new countdown cases: build without the title Sequence and start the VO at 0.
- **Order**: TitleCard (≈4 s, case title on the case's own darkened frame, no iceberg) → footage-led shots cut on the VO words →
  raws where the cut sheet puts them → the outcome said AND shown plainly.
- **VO**: one continuous take (`vor/CASEnn.mp3`). Drop the leading count word ("Third,", "Number four.", etc.) with `startFrom`
  (find it in the .srt). Split the take ONLY where a raw plays (Sequence + startFrom per part). Never trim inside sentences.
- **Raws**: follow the cut sheet's ▶ RAW cues (they set the VO:raw ratio the owner likes), but trim dead air: keep the part
  where the sound/picture IS the moment (2–30 s). Clip audio plays ONLY inside raw windows and fades to 0 before the VO
  returns; no clip sound under the VO ever. A climax raw may run long uncut, then replay the key moment in slow motion
  (0.5×, a reframed zoom) under the next VO line. Silent footage (CCTV) → real SFX timed to what the picture does.
- **Footage first** (caught on camera): footage on every line any clip can show; stills/maps/graphics only where nothing filmed
  exists or where a device adds real information (place, time, count, scale, path, before/after). Picture = the words
  at that moment (viewer comment: "talking about the van but showing an SUV").
- Shots 2–5 s under VO (longer for strong footage), eased push (Shot_FX s0→s1), reframes; same source moment never twice
  except the deliberate replay; two windows of the same camera back to back need a blur-dip or a strong reframe.
- **Music**: Epidemic ambient only, `music/Music 1.mp3`, `Music 3`, `Music 4`, `Music 5` (vary across cases; start at different
  offsets). ≈10 LU under the VO: Music 5 ≈ −13 dB, Music 3 ≈ −19 dB, 1/4 measure and match. Fade out under raws with strong
  sound, back after. **SFX**: real recordings in `sfx_n2/real` (wind, rain, impacts, metal, booms, static) + subtle
  whoosh/glitch on designed transitions only.
- **Transitions**: `Transitions_FX` cuts: hard cuts mostly; `glitch` after the title card and between sections; `blurDip` on
  same-camera joins / time jumps; `whip`, `zoomHit` sparingly. Vary them per case.

## 4. Style is fixed, devices must vary (owner: "variations in templates are super important … unique, not templated")
Fixed channel look: TitleCard (distressed serif "Elite"), RedLabel (#E3141B box, black heavy "ArchivoBlk" caps: place / name /
date), white 4–6 px frames/boxes, the house grade, footage-first. No other fonts or colour schemes. No red circles/arrows,
no text that restates the VO, no pull-quote/number/date filler cards, no fake UI, no AI images.

Every case needs at least one device designed for THAT case's beat, and different from the neighbouring cases. Put each new
device in its own file `_engine/src/dev/<KEY>_<Name>.tsx` (never edit others' dev files; you may import them, but do not reuse a
device that a case within 3 positions of yours uses). Before choosing, read `_engine/src/dev/REGISTRY.md`; after building,
append one line: `<KEY> | <Name> | file | what it shows`. Mix approaches across your cases:
- **Remotion 2.5-D / 3-D motion** (Farrell / Visual Venture feel): photo planes tilted in perspective with parallax, depth
  layers cut from a still, camera fly-throughs of stacked evidence, push-through frames, a footage frame that folds into a
  map, split-screen angle sync (two cameras of the same moment side by side, synced), freeze frame + white bracket zoom
  into a detail, vertical phone clip in a clean phone frame over its blurred copy, CRT/monitor for CCTV, scale comparisons
  (ride height vs. a known building), measured distance on a real aerial, path traces, before/after wipes, counted marks.
- **3-D = Three.js, not Blender (owner, 14 Nov 2026: "use node js 3d library for 3D").** Every 3-D shot is Three.js inside Remotion (`@remotion/three`, `three`, `@react-three/fiber`). Maps: `_tools/render_map3d.sh <case.json> <out dir> <shot...> [--still <frame>]` (same case.json as the old blender_map.py; code `_engine/src/dev/Map3D.tsx`). Other 3-D shots (mechanism, scale, flights): build them as a per-case device with `<ThreeCanvas>` in `_engine/src/dev/`. Blender lines below are history.
- (old) **Blender 5.2** (`blender`, `_tools/blender_map.py` + `render_maps.sh` for 3-D terrain maps from NAIP /
  Blue Marble; or your own bpy script): 3-D maps, flights from region to site, simple simulations of a mechanism that is not
  the crucial footage (a ride's cable/arm, a hail stone's size, a wave's run-up profile, wind field, a pier's layout).
  At most 1–2 Blender shots per case; render at 1920×1080 30 fps, Eevee, keep each under ~6 s and ~10 min of render.
- **The kit library** `_engine/src/lib/templates/*` (map: SatelliteMapBox, MeasureOnSat, RouteMap, PinDrop3D, SitePlanTrace;
  diagram: ScaleCompare, ElevationDrop, Cutaway3D, MeasureOnPhoto, MechanismLoop; footage: AngleSync, CrtTv, PhonePanel,
  PipCam, Replay, RiderCamTakeover; photo: KenBurnsParallax, PushThroughFrame, TiltPhoto, FilmStrip; stat: ClockSweep,
  StuckClock, CompareBars; timeline: RulerTicker, DayStrip; n2page ChipLift_N2P for real document pages ≤ 1 per case).
  Read a template before using it; re-skin to the channel look (white frames, RedLabel, Elite/ArchivoBlk) if it differs.
Public-domain sources for stills/data: weather.gov event pages, mesonet.agron.iastate.edu (warning texts), USGS NAIP
(ImageServer exportImage; flaky → retry), NASA GIBS / Earth Observatory, NOAA NGS post-storm imagery
(`https://geodesy.noaa.gov/storm_archive/storms/<storm>/imagery/<date>/{z}/{x}/{y}.png`), Copernicus EMS maps, USGS earthquake /
volcano pages, Wikimedia Commons files with a free licence. Grade every still with `grade_case.py --house --nonorm`.

## 5. Footage and downloads
- Kept clips are in `<video>/footage/<folder>/` (main + extras). Look before you cut: contact sheets
  (`ffmpeg -i clip -vf "fps=1/2,scale=320:-1,tile=6x5" sheet.jpg`, then Read the image), and `python3 _tools/srccuts.py clip`
  for the source's own cuts (start ≥ 0.7 s after a cut, never cross one). Lightning/flash frames count as cuts.
- You MAY download more clips of YOUR case's event (other angles, aftermath, drone) with `yt-dlp` without asking, ONLY from
  small personal channels. Never: TV/news packages with anchors or station bugs, agency/licensing (Storyful, Newsflare, Jukin,
  ViralHog, Reuters, AFP, AP), big creators, competitor compilations (Occult Inquisitor, Abyssal Detective…). Never use or
  delete `cookies.txt`, never bypass bot checks. Save under the case's footage folder `more/`, ≤ 1080p.
- Check every clip for burned-in watermarks/credits/text/added music: `delogo` before grading or frame it out; drop if not.
- Grade: `python3 _tools/grade/grade_case.py <build>/graded --house name=<src> ...` (stills: add `--nonorm`). Trim long
  sources to the windows you need first (ffmpeg -ss/-t into `media/`) to keep grading fast. Vertical clips: grade as is.
- Brand safety: no flaggable words on screen; blur nudity / extreme violence / bodies (object only); blood is OK.

## 5b. Raw audio and blur (owner, 2 Nov night: "remove bg music of raw … might be copyright music + raw be blurred if it's too much")
- EVERY raw's audio goes through `_tools/.audvenv/bin/python C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/_tools/rawclean.py <clip or its audio> <build>/media/<name>_clean.wav`
  (detects music per second; where music plays it keeps only voices + impacts, elsewhere the original sound). Use the _clean.wav
  as the raw's audio, never the clip's own track. Add `--force` if you can still hear music (fair rides, arcades, cars with radio).
- Raws follow the cut sheet's ▶ RAW cues in place and order; trim only dead air (the owner checks this).
- Blur anything too much for monetisation in raws as well as stills: injured people, bodies, nudity (gaussian over the object only,
  e.g. ffmpeg boxblur on a crop overlay before grading, or a blurred rect in Remotion). Blood alone is fine.

## 6. Check, render, finish
- Stills (fast, no queue): `_tools/render_case.sh <KEY> --still <sec> C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/<KEY>_<sec>.png` → Read it.
  Check ≥ 8 stills across the case including every device, label and the outcome; fix what is wrong.
- Full render (queued, 3 slots machine-wide, may wait): `_tools/render_case.sh <KEY> <allow>` where allow = designed transition
  windows `a-b,a-b` (±0.3 s around each glitch/blurDip, plus any raw with real flashes). It runs cutcheck, masters to −16
  LUFS and writes `build/CASEnn/out/<KEY>.mp4` + `<KEY>_phone.mp4`. Cutcheck must show 0 flags outside allowed windows; a
  JUMP/FLASH/ODD/STUB → fix the window or add a blur-dip and re-render. Run it in the background and wait for it.
- Write `build/CASEnn/NOTES.md`: devices used, sources (with URLs), downloads, anything you could not solve.
- Report back in ≤ 10 lines per case: duration, cutcheck result, devices, anything the owner should know.

Owner standards are high: no generic templates, no pointless place shots, nothing templated across cases. If footage for a beat
is genuinely missing, build a device that shows real information instead of padding.

## OWNER RULE (2 Nov 2026, on TP17): raws long enough to SHOW the incident
"raw is too less in between… people want to know what happens… they don't wanna watch just 3 seconds, it's not entertaining."
- Fewer raw inserts, but long ones. The main incident raw plays the event through: build-up → moment → aftermath,
  typically 10–25 s, with the VO pausing or ducked under it. Secondary raws run 6–12 s.
- No raw shorter than ~5 s unless it's an impact cut inside a longer raw. Don't chop one clip into many 3 s flashes.
- If the footage is short, slow it down (0.5× replay) or replay the key moment from a second angle rather than cutting away.

## OWNER RULE (3 Nov 2026, on TP19): the cut must read as one story, not a loop
"did u check 1 min to 1:30, like one word then raw, and after 2 min shit stopped… weird, super fucked."
1. Never split the VO mid-sentence. Raws go ONLY at sentence/paragraph ends (check the .srt word timings). Never leave a lone
   word or short phrase between two raws: every VO stretch between raws is a full thought (≥ ~6 s). Merge or move raws if not.
2. Each device appears ONCE; no recycled/reprised device at the end (reads as a loop). The case ends on the VO's last line plus
   a short hold, not on extra raw/device padding. If the VO ends before the picture, cut the picture.
3. Vary the footage between raws: never the same angle/clip 5+ shots in a row; long runs of one source read as stalled.
Before the full render: lay the VO transcript against the timeline (where each raw starts/ends vs the words) and look at a
1 fps contact sheet of the whole case; fix anything that reads weird.

## OWNER RULE (3 Nov 2026, on the intros): no raw in the intro
"no raw in intro, just VO with 3D motion or clip, whatever works".
- The intro (case 00) has NO raw inserts: never a stretch where the VO pauses and a clip plays with its own sound (no cold open on a
  clip's sound, no spliced/extended raw; `raw_extend.py` must not touch a 00 case).
- The intro VO runs continuously over footage from the video's cases (silent or under the music, cut on the words), short 3-D motion
  (Blender or Remotion 2.5-D, kept short) or channel devices. Keep the grammar: title card, glitch/blur-dip, Epidemic music under the VO.
- Vary the shots, each device once, end on the last line plus a short hold. Built this way: TOR00, ND00, TP00 (old cold-open code in
  `_engine/_bak_intro_raw/`).

## OWNER RULE (3 Nov 2026, on ND01 / ND02): raws ONLY at incident moments (refines the long-raw rule)
"we talk non-incident, Japanese precautions etc, so raw too much… feels you just pushed it in for no reason" (ND01 ~7:20); "VO then raw" (ND02 ~2:03).
- A raw (VO paused, the clip's own sound) goes ONLY where the story IS the incident: the build-up, the moment itself, people reacting,
  the immediate aftermath. Never after or inside explanation: background, history, how-it-works, precautions, statistics, the warning
  system, the investigation. Those stretches run the VO straight on over SILENT footage (and devices).
- No near-duplicate raws ("the town still under water" ×6, the same deck/street again): one raw per distinct beat.
- Typically 2–5 raws per case. They keep the long-raw rule: main 10–25 s, others ≥ 6 s, VO split only at sentence ends, ≥ ~6 s of VO
  between raws.
- Test before rendering: read the VO line before each raw. If it explains instead of pointing at what happens next, cut the raw and merge
  the two VO parts.
- Applied 3 Nov to ND01 02 04 05 07 09 10 11 12 13 15 16 17 (ND03 06 08 14 18 19 already passed).

## OWNER RULE (3 Nov 2026): no shared page templates, Inset once per case, sharp documents
- "The blog screenshot is a template used many times… make new templates": never ChipLift_N2P / PageLight_N2P / DeskSheet_N2P (lib n2page).
  Every document moment gets its own device built for that document (fax printing, terminal bulletin, seismograph strip, torn paper…),
  registered in `_engine/src/dev/REGISTRY.md`, never reused in another case of any video.
- No blurry scanned page with a highlight bar: legible sharp type (re-set the document's own words), the key line revealed with motion,
  the source credited small.
- The brand Inset (framed clip over its blurred copy + RedLabel) at most ONCE per case; elsewhere full frame with a slow push, or a
  framing built for the moment.
- 3 Nov, later: the owner rejected map/pin and fast montage intros ("too fast, unsmooth asf") and APPROVED the 3-D clip field
  ("ok looks good"): `_engine/src/dev/TOR00_ClipField.tsx` + `ClipFieldKit.ts` — real case clips on 3-D planes at depth, a monotone
  (no-overshoot) eased camera path to one hero clip per VO beat (~70 % of frame, ≥ 0.8 s moves), red place · year label per hero, DOF,
  light falloff, CameraMotionBlur 4 samples, grain, blur-dip into the title. Check smoothness with a per-frame motion strip, not just stills.

## OWNER RULE (4 Nov 2026): devices must fit the niche; Workplace length budget
- WP01's clip-beside-a-red-time-bar device was rejected: "did not stand towards niche". Devices work ON the footage and keep it big
  (replay + push, freeze + punch-in, synced second angle, before/after, spotlight). No time bars/clocks/gauges/HUD/data panels beside
  a small clip. See _kit/RULES/owner_memory/feedback-iceberg-niche-devices.md.
- Workplace: read 04_Workplace/WP_PLAN.md (50-min target, dropped cases, per-case length budget).
