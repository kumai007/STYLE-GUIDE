# last-moments build agent 1: handoff (2026-11-18, stopped on the context budget)

Task: brief = lead's "build lm.mjs + lm_intro" (see `last-moments_HANDOFF.md` RUNNING line). Read list done; key facts are below so the
next agent does NOT need to re-read SUMMARY/rule book in full (read SUMMARY section c for the recipe numbers only).

## Done
- VO cleaned: `productions/last-moments/build/vo_intro_clean.py` -> `productions/last-moments/vo/cut/c00_p01.wav` (47.450 s, was
  49.12) + `c00_p01.words.json` (Whisper words on the new timeline, fillers dropped). 5 filler cuts at RMS minima (source s):
  [0,0.16] [10.96,11.42] [23.00,23.40] [30.91,31.14] [44.56,44.98]; 21 pauses >= 0.15 s gated to true silence (80 ms tail,
  50 ms before next word, 15 ms ramps). Level untouched: -28.5 LUFS I, peak -3.1 dBFS (only ~+2 dB of headroom: master pass later).
  Not Whisper-re-verified (Whisper = GitHub only): queue `tools/case-farm/task.sh` check, or listen at the 5 joins.
- Frame tool: `productions/last-moments/build/framesheet.py OUT.jpg COLS SRCDIR label:TAG:t ...`. Scan 1:
  `productions/last-moments/edit/qa/scan1.jpg` (HPK, HCR, LIP x3 windows, CGF).

## Clean VO word onsets (s in c00_p01.wav; part time = 2.70 + t if VO starts at 2.70)
(v3 2026-11-19: VO re-cut, every time below +0.025 s, VO now starts at part 2.90; see last-moments_intro_v2_HANDOFF.md "v3")
final 0.16 | In 2.88 | A 5.82 dive 5.98 | a 6.76 stream | a 8.06 vlog | a 8.96 walk..doorway 10.10 | Nobody 11.00 | anything 13.28 |
But 14.22 | because 17.64 | it's 20.24 .. them 21.86 | Some 22.64 | Some 24.60 | and 26.08 some .. security 27.16 .. time 29.26 |
a 29.93 dive..Blue Hole | a 31.73 fan line Orlando | a 33.43 cabin..plane | a 36.11 hotel lobby Michigan | a 37.87 fuel station Kent |
Every 39.39 .. moment 40.81 | And 41.65 .. next 42.63 | today 43.61 | 21 44.81 | darker 46.29 | go 46.99 (ends ~47.3)

## Shot plan (decided; clean-VO t; part = +2.70)
Warning 0-2.60 (c1, glitch c12 out at the end) -> raws, hard cuts, Grade c20, slow eased push 1.00->1.04, credit c11 per shot:
| # | t | VO | src window (s) | note |
|---|---|---|---|---|
| 1 | -0.10-5.82 | Final footage .. ordinary video there is | HPK 0.0-5.03 @0.85 | crop top tape line (scale ~1.04); Met Police credit |
| 2 | 5.82-8.96 | A dive, a stream sign-off, a vlog | LIP ~0:55-1:20 or 0:00-0:25 | LIP 8-11 s is busy pink close-up: prefer 60-63 (fins, sunlit) |
| 3 | 8.96-14.22 | a walk past a shop doorway. Nobody filming .. | HCR 0.0-3.68 @0.70 | Met Police credit |
| 4 | 14.22-17.64 | But in other ways .. internet | CGF ~19.5-22.9 (selfie) | 720x720: blur-fill/pillar; fan (right woman) face MOSAIC |
| 5 | 17.64-22.64 | because for every person .. last time anyone saw them | LIP 174-179 (open blue, bubbles, diver) | safe, well before the sink |
| 6 | 22.64-26.08 | Some .. filmed themselves. Some .. friend's phone caught | CRV 3:15-3:40 plane prep (SCRUB) | crop "CRAVE LIFE" text |
| 7 | 26.08-29.93 | and some .. security camera nobody was watching | WED 120.6-124.45 (gate cam) | crop top 80% (y 0-288 of 360-scale = top 80%) |
| 8 | 29.93-31.73 | a dive into the Blue Hole | LIP 0:00-0:25 window, another span | |
| 9 | 31.73-33.43 | a fan line in Orlando | CGF 35-55 (line) | fan faces mosaic |
| 10 | 33.43-36.11 | a cabin porch in Alaska seen from a plane | CRV 348-351 (5:48 cabin enters) | |
| 11 | 36.11-37.87 | a hotel lobby in Michigan | RAD 75-77 (front desk) or 1-3 (canopy, no faces) | 486x360; clerks' faces mosaic |
| 12 | 37.87-43.61 | a fuel station in Kent. Every clip stops .. next. | WED 84.02-87.87 @0.67 | crop top 80%; keep native timestamp |
Then: ledger c3 at 46.31 (today) 7 s -> 53.31; dip 0.5 s; ledger return (scale 1.6 to row 01, amber band) 2 s; dip 0.5 s;
CASE 01 card ("THE CODEBREAKER WHO WALKED OUT OF FRAME", plate = dark blurred HCR still) 5 s; hard cut. Part end ~61.1 s.
Ledger rows may step text colour #E8E4DC -> #B8B3AA by row 21 ("darker as we go"), all sharp.
OPEN conflict for the lead: shots 8-11 are 1.7-2.7 s (place words 1.7 s apart). Kept per owner rule 42 (one clip per idea in the
fast intro) + owner SOP H#10 (intro changes 1.5-4 s); rule 29 / brief ">= 3 s" would need merging two places into one clip.

## Frames seen (scan1)
HPK: CAM 1 stamp, thin white tape line top, man in red mid-frame at 2.5 s: fine. HCR: CH 1 stamp, man in red at 1.9: fine.
LIP 8-11: pink close-up of regulator/mask, busy; LIP 60-62 fins in sunlit water (ok); LIP 174-179 open blue, bubbles, small diver (good).
CGF 19.5-23 selfie: Christina left, fan (private) right, face clear -> mosaic needed; CGF 35-50 line: fans' faces clear -> mosaic.
Not yet scanned: CRV (200-224, 348-352), RAD (1-3, 75-77), WED (84-88, 120.6-124.5) first/mid/last.

## Not done (next agent, in order)
1. Scan CRV/RAD/WED windows with framesheet.py; pick final spans; static mosaic boxes for CGF/RAD faces (c15, 24 px).
2. Media root `styleguide/gx-admixdd/hf-engine/media/last-moments/` (create; hardlink conf/*.mp4, vo/cut/c00_p01.wav as vo/c00.wav).
3. Fonts woff2 latin into `hf-engine/fonts/`: Anton, Oswald (var), Bebas Neue, IBM Plex Mono 600/700 (500 exists), Source Serif 4.
   build.mjs fontFace(): today every `IBMPlexMono*` maps to weight 500 and unknown families fall back to Share Tech Mono -> add
   branches (Anton, Oswald 200-700, BebasNeue, SourceSerif4 var) and parse Plex weight from the file name (500 file stays 500).
   Note build.mjs always builds Film html; `plain: true` keeps the gx v6film filter and Film layer off (set it).
4. Epidemic Sound (ToolSearch "epidemic"): dark drone bed, low boom, glitch click, soft tick, riser, low-passed static bed (warning).
   Levels (c21, rules 49/51/54/57/62): VO 1.0 (top), music ~-10 dB re VO (use coc_intro musLane levelling), SFX ~-14 dB, ticks -22,
   whole mix fade-in 1.5 s (music/SFX lanes; VO never faded), title music 2 s fade-in when CASE 01 shows, music -12 dB in dips.
5. `hf-engine/devices/lm.mjs` (all devices per brief, frames @60 = 2x SUMMARY) + `hf-engine/cases/lm_intro.mjs` (structure from
   coc_intro.mjs: n(), musLane, sfx gain helper; media 'last-moments').
6. `node build.mjs lm_intro`, `npx hyperframes@0.9.56 check --json` in parts/lm_intro; stills sheet
   `productions/last-moments/edit/qa/lm_intro_sheet.jpg` (YAVG 52-58); loudness estimate.
Licence: RAD (Kalamazoo County release) + WED (police film): use with credit, still "needs owner OK".

## Agent 2 progress (2026-11-18)
Lead decisions: rule 29 wins (>= 3 s); place list = 2-up 50/50 split conveyor (each new place slides in from the right 36 f,
older panels shift left; each panel >= 3 s; Kent expands to full frame on "Every clip"). plain:true + own Grade. RAD/WED need owner OK.
- STEP 1 DONE (scans `edit/qa/scan2-4*.jpg`, grids `grid_*.jpg`, tool `build/gridsheet.py`). Final spans (source s):
  HPK 0-5.03 @0.85 | LIP 60-63.14 | HCR 0-3.68 @0.70 | CGF 19.5-22.92 (fan box src x330-600 y100-420) | LIP 174-179 |
  CRV 195.5-198.94 (packing, no face; crop CRAVE LIFE bottom-left) | WED 121.8-125.65 (120.6 has a dissolve; 127.5 fades;
  burned yellow doc captions at bottom: crop top 82 %) | split: LIP 140 (P0), CGF 9.0-14.0 (P1; fan box x460-700 y100-360),
  CRV 351-356 (P2 cabin), RAD 75-78.95 (P3; RAD 0-4 has a PLAYER play button = unusable; red label top-left: crop top;
  faces clerk [80,22,52,48] woman [195,22,52,60] src px), WED 84.02-87.87 @0.67 (P4 Kent, crop top 82 %).
- STEP 2 DONE: media root `hf-engine/media/last-moments/` (hardlinks: 7 conf mp4 + vo/c00.wav; dirs music/ sfx/).
- STEP 3 DONE: fonts Anton, Oswald-var, BebasNeue, IBMPlexMono-600/700, SourceSerif4-var in hf-engine/fonts; build.mjs
  fontFace: Plex weight from file name + 4 new families (backup of old build.mjs in agent scratch only).
- STEP 4 DONE (Epidemic Sound, files in `media/last-moments/`; file loudness I LUFS):
  music/es_tarmac_radiation.mp3 (Ethan Sloan, horror drone, 115.7 s, -9.6) = intro bed from 0 s;
  music/es_dark_days.mp3 (Martin Klem, supernatural drone, 115.9 s, -14.4) = title bed (2 s fade-in when CASE 01 text shows,
  crossfade from the intro bed ~6 s; music never gaps, -12 dB in dips); sfx/boom_low.wav (3.50 s, -24.4) CASE 01 card;
  sfx/glitch_click.wav (0.53 s, -22.2) warning glitch-out; sfx/tick_soft.wav (0.32 s, too short for I: use peak) ledger amber
  band, -22 re VO; sfx/riser_dark.wav (5.91 s, -23.0) into the ledger (end on 46.31); sfx/static_lp.wav (6 s cut from ES TV static
  02 @10 s, lowpass 4 kHz, -32.4) warning bed 0-2.6 s. VO c00.wav = -28.5 LUFS I. Targets: music lane = VO -10 = -38.5 LUFS
  short-term (use coc_intro musLane on the file), SFX g = min(-42.5 - I, music target - 1 - M) (coc sfx() helper), tick -50.5,
  static bed ~VO +3 LU (-25.5, owner rule 14 "lower if harsh"), mix (music/SFX lanes) fade-in 1.5 s from 0; VO never faded.

## Timeline for lm_intro (PART seconds; VO c00.wav at 2.70 -> part = 2.70 + clean-VO t). All decided, build exactly this:
| part s | shot | source (s) | layout / devices |
|---|---|---|---|
| 0-2.60 | Warning c1 | - | glitch c12 out 2.47-2.60 (click at 2.47) |
| 2.60-8.52 | HPK | 0-5.03 @0.85 | scale 1.04 origin bottom (crop tape line); Credit "FOOTAGE: METROPOLITAN POLICE" |
| 8.52-11.66 | LIP fins | 60-63.14 | 1620x1080 cover |
| 11.66-16.92 | HCR | 0-3.68 @0.70 | Credit Met Police |
| 16.92-20.34 | CGF selfie | 19.5-22.92 | Vertical-like square 1080 fg + blur bg; Mosaic src box [330,100,270,320] (720 px src) |
| 20.34-25.34 | LIP blue | 174-179 | |
| 25.34-28.78 | CRV packing | 195.5-198.94 | scale 1.08 origin 80% 10% (crop CRAVE LIFE bottom-left) |
| 28.78-32.63 | WED gate | 121.8-125.65 | scale 1.22 origin top (crop burned captions; keep native timestamp); credit "FOOTAGE: POLICE RELEASE (via documentary)" |
| 32.63-46.31 | Split2 conveyor | P0 LIP 140 (32.63-34.70), P1 CGF 9.0 (34.43-37.30, fan Mosaic [460,100,240,260]), P2 CRV 351 (36.13-39.10, pos 40%), P3 RAD 75 (38.81-40.80, scale 1.1 origin bottom; Mosaic [80,22,52,48] + [195,22,52,60] on 486x360), P4 WED 84.02 @0.67 (40.57-46.31, crop top 82 %) | each move 36 f eased (sym bezier), at 34.43/36.13/38.81/40.57: panels shift one slot left, new panel enters from right; 42.09 P4 expands 960->1920 while P3 exits |
| 46.31-53.31 | Ledger c3 | 21 rows | scale 1.00->1.08 sine.inOut whole shot, rows stagger 6 f, last 16 f dip down |
| 53.31-55.81 | Ledger return | | 14 f up from black, scale 1.08->1.6 on row 01 (48 f power3.inOut), amber band 36 f + tick, hold, 16 f dip |
| 55.81-61.11 | CASE 01 card c4+c5 | HCR still (blur 18, brightness 0.32, sat 0.3) | 14 f up; "CASE 01" in f14-62; hairline f62-98; name wipe f98-134 "THE CODEBREAKER WHO WALKED OUT OF FRAME" (2 lines); boom at in; title bed 2 s fade-in; hard cut at end |
Grade c20 overlay on all footage shots (saturate .55, contrast 1.12, brightness .96, vignette, grain 6 % static) - check YAVG 52-58.
Mosaic implementation: duplicate <video> (same timing) clipped to the box with an SVG pixelate filter (feFlood 1px at 12,12 /
feComposite 24x24 / feTile / feComposite in SourceGraphic / feMorphology dilate 12) - verify it pixelates in a snapshot.
Runtime note: lib/gx.js render() calls devs[name] for EVERY [data-dev] element -> every device using ctx.dev() needs render().

## Remaining (agent 3): STEP 5 lm.mjs, 6 lm_intro.mjs, 7 build + check, 8 stills sheet, 9 loudness estimate (see brief).
Open: rule 16 (victim faces covered) vs lead (only private faces mosaicked): HPK/HCR man, Christina (CGF), CRV vlogger, LIP diver
are unmasked -> lead/owner to confirm. RAD + WED need owner OK. CGF is all close-ups: every span has a private fan face.

## Agent 3 progress (2026-11-18)
- Rule 16 now = victim faces too (lead brief). CGF face tracks (src px, keyframed every ~0.4-0.55 s) read from
  scratch strips; written into cases/lm_intro.mjs (CG_A for 19.5-22.92, CG_B for 9.0-13.98, both women). Ledger titles = short
  caps from the cut-sheet headings (in lm.mjs LEDGER). Conveyor re-timed (P0 full frame 32.63, compresses to L at 34.43; every
  panel >= 3.9 s on screen).
- STEP 5 DONE: `hf-engine/devices/lm.mjs` (API block at top): Grade, LClip (+fill, push, Mosaic via duplicate video + SVG pixelate
  24 px, clip-path path() keyed boxes), Vertical, Split2/Panel (keyed x/w), Warning, GlitchCut, Dip, Ledger (LEDGER titles), CaseCard,
  Credit, TypedDate, PlaceTag, NameTag, Page, RedCircle, Spotlight, Subs. TypedDate/PlaceTag/NameTag/Page/RedCircle/Spotlight/Subs
  are NOT exercised by lm_intro (untested visually).
- STEP 6 DONE: `hf-engine/cases/lm_intro.mjs` (61.11 s, 12 shots, audio lanes: static bed +6.9 dB, glitch -7.6 dB (peak -14 re VO),
  music levelled to -38.5 with -12 dB dips, title bed 56.04 2 s in, riser 40.40 (helper -22.8 dB), tick 54.34 (-14.6 dB, peak), boom 56.04 (-18.1 dB)).
- STEP 7 DONE: build exit 0, no MEDIA WINDOW PROBLEMS; check: 0 errors, 24 warnings (18 line_unread on ledger rows, 2 duplicate
  media = mosaic copies by design, file size, heavy overlays, first frame dark warning card, credit 24 px < 28 px floor).
- STEP 8 DONE: sheet `productions/last-moments/edit/qa/lm_intro_sheet.jpg` (17 stills). QA 1 fix: per-shot Grade brightness (footage
  was YAVG 68-118). Now stills YAVG: warn 30, HPK 61, LIP 69, HCR 67, CGF 37/34, LIP 65, CRV 74, WED 65, split 64/56/77, Kent 69,
  ledger 36/32, card 52 -> mean of 17 = 54 (target 52-58). Mosaic verified: CGF both women (shot + split P1), RAD clerk + woman.
  Judged unreadable (no mosaic): HPK/HCR man (CCTV ~10 px face), LIP divers (masks), CRV packer (face out of frame), WED gate/Kent (no people seen).
- STEP 9 (estimate, not measured): mix I ~ -28.0 LUFS (VO -28.5 + music -38.5; music-only tail gated out), TP ~ -2.5 dBTP.
  Intro target ~-20 LUFS -> master pass needs ~+8 dB with a limiter (VO peak -3.1 dBFS).
- Open: credit top-right overlaps burned-in CCTV text on HPK (CAM 1 / police stamp); WED gate timestamp cut at the left by scale 1.22;
  LIP shots carry a large burned-in camcorder date (native); RAD + WED need owner OK; ledger glitch copies duplicate filter ids (grain
  missing for 8 f, harmless); no full render, no listen test.
