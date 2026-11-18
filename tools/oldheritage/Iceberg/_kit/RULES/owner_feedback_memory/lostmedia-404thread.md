---
name: lostmedia-404thread
description: "404 thread '2 Hours of Lost Media To Fall Asleep To' (started 2026-10-30): 36 cases, intro+case 1 first; folder, voice, style, code base"
metadata:
  node_type: memory
  type: project
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-30T16:40:25.486Z
---

Owner (Ekam, channel **404 thread**, NOT Warrior Mind) 2026-10-30: a history/lost-media documentary, "Parallel Pipes + 3D + Nexpo style", also LEMMiNO / fern. Deep documentary, VO-only (no raw-audio clips). Perfect the intro + case 1 first, then case by case.

- Root: `D:/404 Rendrer/LOSTMEDIA/` — script `_in/script.txt` (from Google Doc 1_mlWESBXxd6DqjGac6UOfxBiV0xb78lUtKhjqYYuEXg, ~22.5k words, 36 cases in 8 chapters), VO `vo/raw/lm_<id>.mp3` + `vo/<id>.words.json` (tools/whisper_words.py), jobs in vo/jobs.txt.
- Voice: Algrow stealth **Obscure Collab** `default-pd4i7bs8z6-qjsqmqbjlxg__obscure_collab`, model 2.0, temperature 2, rate 1.05, natural pauses (not tightened).
- Owner's channel brain: `_in/brain_zip/404_BRAIN/` (from Drive zip): CLAUDE.md, LESSONS_LOST_GAMES_2.md, memory/, docs/lost_games_2/STYLE.md. Code base = SS_3D_LIBRARY (Space camera, 52 SS treatments, three.js scenes, IntroV2, C01v2) copied into `remotion/` (deps installed). Music 8/9/10 only (others are Epidemic).
- Parallel Pipes measured (study/pp/): real Wikipedia/article pages, title lifted off the page into a white box on black, photos centred on black, macro onto a document phrase with highlight then isolated, posts centred.

- Build (2026-10-30): `remotion/src/lm/` (kit.tsx PhotoSpace/TitleBox/Still, Intro.tsx, C01.tsx, Root LM-INTRO/LM-C01/LM-HEAD), entry `src/lm/index.ts`; bundle to `_tmp/bundle` (TEMP=D:), stills via `tools/stills.mjs`, sound via `tools/mix_head.py` (ffmpeg, not Remotion audio). Assets + provenance: `assets/c01/ASSETS.md`, `assets/intro/ASSETS.md`. Page highlight boxes: `tools/box.py <json> "<phrase>"`.
- 2026-10-30 owner approved v4 head (intro+c01, build/head_v4.mp4) → "do whole 2hr+ video, more Farrell/LEMMiNO/fern motion, perfection, careful usage, fast (use full PC: 20 cores/32 GB/RX 9070 XT)". Cases 2–36 run on the beat engine `src/lm/engine.tsx` (JSON beats in `src/lm/cases/<id>.json`, schema + agent rules `CASE_SCHEMA.md`, validator `tools/check_case.py`, index `tools/gen_cases.py`, renders `tools/render_cases.sh <ids>` → build/cases/). Order/chapters: `ORDER.json`. 5 sonnet case agents (7 cases each) + 1 voicing agent launched.
- **Delivered 2026-10-30 22:09:** `LOSTMEDIA/FINAL/2 Hours of Lost Media To Fall Asleep To.mp4` 2:00:03, −16.0 LUFS, TP −1.3, + chapters.txt; assembled by `tools/assemble_full.py` (per-segment audio + concat; adelay/aloop over 2 h crashed ffmpeg on memory). Renders: `tools/render_pool.sh LANES CONC ids` (3×7 on this PC), preflight `tools/prep_cases.py` (crop x,y,w,h fix, tall-capture windows, dup merge). Owner chose to KEEP the c32 "45 ft wide" line (2026-10-30). Open flags: Content-ID risk clips c09 Doors video, c12 Weird Al, c14 Jeopardy, c15 Turn-On, c29 BBC film; chapter-5-ish cases (e.g. c19) page-heavy.
- Script fact flag: the Backrooms photo was the thread's OP image, not "one reply" (VO c01 ~19.7 s).

- **2026-10-31 cleanup:** build junk (21 GB) staged in `D:/EncountersEditor_v5.7/_TO_DELETE/LM_after_delivery` (same folder as WM junk). Kept: FINAL, build/cases/*.mp4, chapters, head_v4, asm/intro+c01+master.wav.
- **Templates v2 (2026-10-31, owner: avoid YouTube "templated/reused" flag):** `src/lm/v2.tsx` = 7 new treatments (LightTable, FilmStrip, Mosaic, Dossier, DepthSplit, Corridor, WallScreen, AnglePage) + photo moves orbit/diag/rise + title/chapter/transition styles + LOOKS A–D. Ledger `D:/404 Rendrer/_TEMPLATE_LEDGER.json` (LM 2h = look A); `tools/pick_look.py` picks the next. Reel: LM-REEL-V2 → build/reelv2/reel_v2.mp4. Owner rejected it as 'mid' (invented, not ref-based) → replaced by MASTER_TEMPLATES VARY system ([[feedback-templates-from-refs]]).

Related: [[feedback-measure-refs]], [[feedback-no-invented-devices]], [[owner-quality-bar]].
