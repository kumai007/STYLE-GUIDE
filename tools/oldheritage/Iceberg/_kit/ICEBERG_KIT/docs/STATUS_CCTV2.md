# STATUS: CCTV2 = "25 Most Disturbing CCTV Incidents Ever Caught on Camera (Vol. 2)" (algrow-2 channel, LOCKED_SYSTEM_V4)
Assets: `D:/404 Rendrer/iceberg/algrow 2/CCTV INCIDENTS [ VOL 2 ]/` · VO: `../_voice/CCTV_vol2_VO.mp3` + word `.srt` (final, read as-is: no HANDOFF owner decision applies to Vol 2).

## Setup (2026-10-26, setup agent)
- **Skeleton:** copied from Disasters2: `remotion/` (package/config/tsconfig, `src/lib` = synced TemplateLibrary copy, `src/cc2/b/rules.ts`, `tools/lint_plan.mjs`; node_modules = junction to Dashcam), `grade/` (grade.py + look.py + channel.cube), `tools/` (cutcheck, sheet, srtwords, edge_check, master_v3 pattern), `build/mix/mix_pattern_d2v3.py`. `npx tsc` passes for every setup file.
- **VO + clock:** `vo/orig.wav` (48k) + `vo/vo_words.json` (8214 words from the srt). `tools/runtime_cc2.py` (port of runtime_tight.py) -> `vo/vo_tight.wav`, `vo/timeline_tight.json`, `vo/vo_words_tight.json`, `vo/case_order.json`. **Gap-free clock 45:05.1 (2705.11 s)** (was 44:57.8; +4.2 s after 447 s for raw c05_4, +3.1 s after 665 s for raw c07_2: both VO lines say "Listen to the audio here."; old timeline in `_TO_DELETE/`). Warning 2.6 s, opener (entry card) 3.8 s, level card 3.0 s (level-first cases: level slot then opener, push between), end screen 12 s, 9 raws (39.1 s): c05_4, c06_4, c07_2 (f-word bleeped 14.55-15.20 src), c07_3, c12_1, c12_2, c12_4, c20_2, c22_4 (KEEP table in the tool, with subtitles). Other 81 cues = footage under the VO (`dropped_cues`).
- **Case order = VO order** (level lines are woven into the case paragraphs; the VO already runs non-fatal -> fatal). Levels: 1 Creepy c01-c04 · 2 Crowds and roads c05-c08 · 3 Things that shouldn't hurt you c09-c12 · 4 They meant it c13-c16 · 5 The last good frame c17-c19 · 6 They filmed it themselves c20-c22 · 7 Whole places wiped out c23-c25.
- **Data modules (generated, `python tools/gen_ts.py`):** `remotion/src/cc2/data/cc2_levels.ts` (CC2_LEVELS, chart names), `remotion/src/cc2/data/timeline.ts` (BLOCKS / SLOTS, absolute s).
- **Grade:** `grade/grade.py` (per-source normalisation group + channel look) -> `remotion/public/cc2g/` (intro + c01 shots). Agent B uses its own `grade_b.py` -> `public/cc2b/`.
- **Iceberg variation (vs Disasters2 / CCTV Vol 1):** same berg + wide/chart plates (identity), but NEW 3/4 orbiting close-ups and arcing level dollies: `art/src/build_berg3_cc2.py` (yaw per shot, reuses Disasters2's SDF) + `comp_berg3_cc2.py` -> `public/ice3b/`; plates object `src/cc2/ice/plates.ts` (PLATES_CC2, ENTRIES_CC2, entryOf). Use `plates={PLATES_CC2}` on every LevelCard_AB / EntryCard_AB.
- Other variation: hook chart: fast tilt DOWN on "Seven levels" then a pull-back to the whole berg on "starting with the mildest" (D2: one slow tilt down), whip out sideways (lead: depth always = down); page preset EmberLens_N2P (dark) in c01 (D2 used ChipLift).

## Intro + case 1
- Code: `src/cc2/intro/{plan.ts,Intro.tsx}`, `src/cc2/c01/{plan.ts,Case1.tsx}`, `src/cc2/main/IntroC01.tsx` (comp `CC2-IntroC01`, 0-127.75 s). Mix: `build/mix/mix_cc2.py` (data-driven engine) + `build/mix/cues_intro_c01.json`.
- **Hook windows (do NOT reuse in the cases):** DYVrn3r0xko 34.8-38.8 · 7ylPAk6NrPk 52.0-57.2 · IYbOFJO8zj0 0.3-4.7 · y6K6gT8ekeY 0.2-3.4, 38.0-39.8 · d2UijVXedS0 33.2-35.4 · J3RP22E3IcI 1.0-2.8, 18.6-20.2 · 5vBunHeWNIE 68-71.5, 84-86.2 · XKpUSxoQo8o 13.0-14.8 · wKyXv3TUkwQ 45-47 · -MiKxRxQzuE 17.4-21.2 · _eVts3G7JvY 0.3-1.5 · UunbBDYDIJY 0.3-1.6 · j1Q9hV-J6vs 15.4-18.2 · KfAkdozzpEE 58-59.7, 63.0-64.8.

## Frame-checks (HANDOFF §3 SCRUB picks)
- c09_2, c25_3, c22_4: owned by agent B (cases 9-25); see its DENY windows in `src/cc2/caseb/core.ts`.
- c07_3: "slow down" is not in the upload; the raw uses "Explain what you're doing there." / "I can't remember." (32.5-36.2).

## Intro + case 1: DONE v1 (sent to main, 2026-10-26)
- `build/cctv2_intro_c01_v1.mp4` (2:07.75, -16.0 LUFS / -1.2 dBTP, AMF cqp 16/18, cutcheck 0 flags, VO sync -30/-5/0 ms) + `_phone.mp4` (26.8 MB) + `_sheet.jpg`.
- Render: `bash render_slot.sh bash tools/render.sh CC2-IntroC01 build/_raw_intro_c01.mp4`, then `tools/master_cc2.py raw mix out 0`. Mix: `build/mix/mix_cc2.py out.wav 0 127.75 build/mix/cues_intro_c01.json`.

## Cases 2-8 (setup agent)
- Engine: `src/cc2/casea/{core.ts,CaseA.tsx,pagesA.tsx}` (pattern = agent B's caseb, own pools/opener timing), pools `grade/grade_a.py` -> `public/cc2a/` (KDKA IE CAM HLN TELA TELB ECHO GBN GANT MORRO SBT SBTP TELG TELH INDI ELMA ELMW FORO), DENY windows in core.ts.
- Plans `src/cc2/c02..c08/plan.ts`, exported as `CASES_A` from `src/cc2/cases_a.ts`; chunk comps `CC2-c02..c08` (`src/cc2/main/ChunkA.tsx`, window = [openA, caseEnd]) -> `build/chunks/cNN.mov` (`tools/render_chunks.sh`).
- Cues: `node remotion/tools/cues_a.mjs` -> `build/mix/cues_cases_a.json` (music bed per case, opener SFX, page/raw blurDips, raw clips with bleep).
- Pages (one each, presets varied): c02 PageLight (CBS Pittsburgh), c03 DeskSheet (CBS), c04 EmberLens (SWNS), c05 SelectStrip (Sky Sports 134), c07 PageLight (road.cc), c08 EmberLens (Noticias Caracol); c06 none. Maps 0, 3D 0 (budget unused: no case needed one).
- Owner checks: c05_4 audio by ear (crowd/shouts, Whisper finds no words); c07_2 bleep placement; c19 "Listen to the radio here." has no clean radio in KAAL1/KAAL2 (agent B).

## FINAL (2026-10-26, builder): PEAK gold recipe, assembled
- All 25 cases + intro + outro rendered as chunks (build/chunks, microcut 0 each; whole-video microcut 0). <= 3 Blender shots per case (c09 musth/views, c14 cabin/chase/court, c18 sim -> n2dev code devices).
- c01 rebuilt: scenes3d/build_c01.py (shop / aisle / nudge) + HUD bracket, FreezeReplay, BuildOnWords. Intro flashes fixed (aisle/kitchen2 lengths, crate fade from black).
- CaseB: blended slow-mo (rate < 0.95) + plan `overs` (RadioHud over raw c19_2). BuildOnWords labels wrap per column (lib).
- Assembly: tools/assemble_cc2.py (check|mix|master|remux|microcut|sync|upscale|extras|deliver). Master -15.9 LUFS / -2.0 dBTP, 81233 frames, VO sync 10 pts within +-70 ms.
- Tools: tools/chunk.sh, tools/autoq.sh, tools/ready3d.py, scenes3d/lane.sh.
