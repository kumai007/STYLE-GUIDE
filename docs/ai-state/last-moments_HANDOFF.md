# last-moments (2026-11-18) handoff

Objective: "Most Disturbing Last Moment Footage Ever Recorded" (21 cases). First deliverable = intro + case 1 as a LIVE preview in
Final Phase Lite (`bash tools/case-build/preview.sh <intro_id>,<case1_id>`), no render. Then one full render on GitHub after owner OK.
Script: `C:\Users\ayush\Downloads\Most Disturbing Last Moment Footage Ever Recorded cut sheet.md` (+ VO only.md).

Owner decisions: new channel; refs = Abyssal Detective (@AbyssalDetective) latest 5; base style = `styleguide/abyssal/` but SOP 2.4
banned devices get new designs (this video is the pilot); "make your own style", professional horror editor, good MGs.
Voice: Algrow "new" id default-pd4i7bs8z6-qjsqmqbjlxg__new-9fcmr, --temperature 2 --speaking-rate 1 (key renewed 2026-11-18).
Met Police CCTV releases allowed with source credit. PC downloads allowed (YouTube blocks GitHub runners); heavy work on GitHub.
Open: RAD (Kalamazoo County release) + WED (police film) are other police releases: confirm with owner (intro uses them).

State:
- VO takes `productions/last-moments/vo/raw/`: c00_p01 (intro 49 s), c01_p01a/b/c (split: long take dropped words), c01_p02,
  c01_p03, c01_p04 (re-made). All Whisper-checked (`*.whisper.json`): all words present; "yeah" fillers to cut (abyssal rule 13).
  Dropped takes in `vo/raw/_drop1`, `_drop2` (do not use).
- Sources: PC downloads `sources/dl/{HPK,HCR,LIP,CGF,CRV,RAD,WED}.mp4`; 60 fps conform on GitHub -> `sources/conf/`.
- Assets (agent): `assets/pages/c01_inquest_page.png` (RTE 2012), `assets/maps/c01_hans_crescent/`, 15 photos, 11 Pexels B-roll,
  `assets/MEDIA_LOG.md`. 10 Commons photos failed (429): rerun `build/commons_get.py` with `build/commons_picks2.tsv`.
- Ref study: 5 refs at 1080p in `productions/_abyssal-ref/latest5/<id>/src/full.mp4`; agent runs deep study on GitHub ->
  `CATALOG.md` per ref + `SUMMARY.md` (device recipes, banned-device replacements).
- DONE: sources conformed (`sources/conf/*.mp4`, 60 fps). Ref study done: `productions/_abyssal-ref/latest5/SUMMARY.md`
  (lead decisions on 6 open Qs at its top) + `<id>/CATALOG.md`.
- RUNNING: build agent 1 = `hf-engine/devices/lm.mjs` (all channel devices) + `cases/lm_intro.mjs` + QA sheet
  `productions/last-moments/edit/qa/lm_intro_sheet.jpg`. NEXT after it: agent 2 = `cases/lm_case01.mjs` (8 min VO, raws HPK/HCR,
  page, map, photos, B-roll; retry 10 failed Commons photos), then `bash tools/case-build/preview.sh lm_intro,lm_case01`.
Original plan: build devices (new channel look, `hf-engine/devices/lm.mjs`) + `cases/lm_intro.mjs`, `cases/lm_case01.mjs`
(media root `hf-engine/media/last-moments`), node build.mjs, hyperframes check, preview.sh.
