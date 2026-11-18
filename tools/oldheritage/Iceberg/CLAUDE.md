# Iceberg — caught-on-camera iceberg videos

This is a SEPARATE niche from the 404 thread channel: lessons learned here go in this folder, never into 404's notes.

## READ FIRST (owner, 2 Nov 2026: "zip for u to stop fucking the video")
The owner's own rulebook and the APPROVED system are in `_kit/`. They override anything below that disagrees.
1. `_kit/ICEBERG_KIT/ICEBERG_MASTER_GUIDE.md`: the iceberg system, the case recipe, NEVER AGAIN, process and credits.
2. `_kit/RULES/OWNER_RULES.md` (rules 1–30), `_kit/RULES/CASE_METHOD.md`, `_kit/RULES/owner_feedback_memory/*.md`
   (most important: feedback-variations-first, feedback-no-invented-devices, feedback-smooth-lit-camera, feedback-ae-camera-over-blender).
3. `_kit/ICEBERG_KIT/docs/PEAK_V5.md` + `LOCKED_SYSTEM_V4.md`: the bar and the recipe. Gold cases: `_kit/gold_cases/c06.ts`, `c07.ts`
   (CCTV1, "awesom case, make peak cases like this") with `case.tsx` / `code.tsx` (how a case is data).
The rest of the kit (template library, assets, gold projects) is in `~/Downloads/404_KIT_2026-11-02.zip`.

## The recipe as built here (Tornado #1 Fairdale v2 = `_engine/src/TorC01v2.tsx`)
- EntryCard_AB (ice3 plates) → DateCard_IC3 once on the spoken date → footage-led shots of 2–5 s cut on the VO words
  (Shot_FX eased push + punches, FilmLook_FX, channel grade via `_tools/grade/grade_case.py` = the kit's grade.py + look.py).
- 2–3 Blender shots per case at most (place / mechanism / aftermath); everything else is Remotion code from the library
  (`_engine/src/lib`, copied from the kit: ChipLift_N2P pages ≤ 2 per case, ClockSweep_D, LineMap_D, TiltPhoto_D, HudBracket…).
- Raws 2–8 s only where the real sound IS the moment; VO gaps cut (0.45 s between blocks).
- ZERO FLASH: `_tools/srccuts.py <clip>` before choosing windows (start ≥ 0.7 s after a source cut, never cross one);
  `_tools/cutcheck.py <render>` after. Same clip moment never twice; consecutive shots of one clip ≥ 8 s apart in the source.
- No red circles, no text restating the VO, no dark side bars (bright blurred copy), music per rule 22
  (Music 2, Music 5, ES Cursed Tunnel, ES Something in the Basement; one per case), real SFX (`sfx_n2`), −16 LUFS.
- Pilot (intro + case 1) → owner approves → build everything; full-mix phone previews ≤ 29 MB, AAC 44.1k.

## Layout
One folder per video: `01_Natural_Disasters`, `02_Theme_Park`, `03_Tornado`, `04_Workplace`; inside each `script/` (cut sheet + VO),
`footage/` (every kept clip per case + `INDEX.csv`), `research/` (outline), `vo/` (blocks), `build/CASEnn/` (assets, graded, maps, out).
Tools in `_tools/`; Remotion in `_engine/` (node_modules linked from 404's remotion; `public/c1` → the case build folder).

## Voice
Stealth "Obscure Collab" (voice_id `default-pd4i7bs8z6-qjsqmqbjlxg__obscure_collab`), stealth_model "2.0", temperature 2.0,
speaking_rate 1.05. One TTS job per case (one long job loses breaks and tone): `vo/raw/<JOB>.mp3` + `.srt`. All 4 videos are generated.
In the edit use the case's raw take CONTINUOUSLY (natural pauses) and split it only where a kept raw sits (owner 2 Nov: "the voice is
cut very weirdly" when the split + trimmed `vo/blocks/` files were re-joined). The blocks are only for finding line times.

## Channel style = the owner's reference (2 Nov: "download occult inquisitor ... for style analysation then make")
Reference: `_ref/OI_dashcam_disasters_EDJojKcP7Qk.mp4` (Occult Inquisitor). Measured: footage is ~80 % of the picture and runs long,
key moments replayed (slow-mo / zoom); raws 2-5 s and only where the sound IS the moment, set up by the VO; cuts mostly hard;
graphics only: iceberg chart (intro), case TitleCard (cold iceberg peak + distressed serif), RedLabel (red box, heavy black caps:
place / name / date), Inset (white-framed photo or zoom over a blurred copy), Aerial (real aerial + white box + RedLabel), digital
glitch between sections. Built in `_engine/src/brand.tsx`; reference case `_engine/src/TorC01v5.tsx`.
Owner bans: generic ffmpeg/Claude templates (my REC opener, date stamp, pinned card, line map are gone), non-ambient music
(use Epidemic ambient: Music 1 / 3 / 4 / 5), raws with nothing happening, VO overlapping a raw (raw fades out, then VO).
Climax raws may run long and uncut (Fairdale: 20 s of the house being hit), then replay the moment slow under the next VO line.
Owner on v5 (2 Nov): countdown videos (Tornado, etc.) are NOT icebergs: no iceberg title card; the case title sits on the case's own
footage. Never any raw/clip sound under the VO. Music must be clearly audible (~10 LU under the VO; ambient beds are quiet files).
Colour-correct every still/aerial so it matches the footage (`grade_case.py --house --nonorm`). Be creative with places: mark what
the VO counts on a real aerial (Fairdale: each wiped-out lot marked as "thirteen homes" is spoken). No shot just because a place is
named (the Genoa aerial was pointless). Check stills for watermarks (Panoramic2 had "@gensiniwx": dropped).

## Owner notes on the Fairdale pilot (2 Nov)
- Keep this style (kit recipe) and develop it to its best.
- Remove burned-in watermarks/credits on footage (e.g. "© Clarence Schultz"): delogo before the grade, or frame them out.
- Caught on camera: the footage must be the main element. Footage on every line that any clip can show; maps/pages/photos only
  where nothing filmed exists. Look for more personal-channel clips of the same event (other angles, aftermath, drone) before
  falling back to stills.

## Viewer rules (real comments on a competitor's caught-on-camera video)
"no footage, just animations", "talking about the van but showing an SUV", "so the burning truck was a death?":
footage is the case; picture = words at that moment; the outcome is said and shown plainly.

## Tools
- 3-D: Three.js only (owner 14 Nov 2026). `_tools/render_map3d.sh` (= `render_maps.sh`) renders the case.json map shots below with `_engine/src/dev/Map3D.tsx`.
- (old) `_tools/blender_map.py` + `render_maps.sh`: Blender 3-D maps from public-domain imagery (USGS NAIP, NASA Blue Marble),
  states/counties, the NWS track, flat labels (config: `build/CASEnn/assets/map/case.json`). Use for ≤ 3 shots per case.
- `_tools/capture_page.py` (run with `_tools/.venv/bin/python`): real source pages + phrase boxes (`--scroll-to`, `--js`).
- Public-domain sources: weather.gov event pages (damage photos, track maps, timelines), mesonet.agron.iastate.edu (warning texts).

## Case 2 (Joplin, `_engine/src/TorC02.tsx`) — vary the devices per case (owner 2 Nov: "dont keep using same templates")
Same grammar (TitleCard, RedLabel, Aerial, glitch/blur-dip), but each case gets devices built for ITS beats, added to `brand.tsx`:
- `TimeRuler`: warning -> touchdown on a minute ruler over darkened footage (a lead time that is spoken).
- `ScarTrace`: white line traced along a damage path on a satellite image (NASA ASTER / Earth Observatory).
- `ThenNow`: wipe between aligned aerials of the same ground (NOAA post-storm imagery vs NAIP today).
Case 1 used MarkMap (counted homes) + Inset + Blender track; do not reuse a device in back-to-back cases unless the beat needs it.
Silent CCTV climax: let it run (20 s) with real SFX timed to what the picture does, then slow replay under the next VO line.
Two windows of the same camera back to back = jump cut: always a blur-dip or reframe between them (cutcheck flags it).
NOAA NGS post-storm imagery: `https://geodesy.noaa.gov/storm_archive/storms/<storm>/imagery/<date>/{z}/{x}/{y}.png` (TMS, y flipped).

**Also read** `_kit/RULES/owner_memory/*.md` (the owner's Iceberg rules from chat) at the start of every session.
