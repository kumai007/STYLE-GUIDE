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
- DONE: intro part `hf-engine/parts/lm_intro` (61.1 s, check 0 errors, sheet `edit/qa/lm_intro_sheet.jpg` looked OK by lead).
- 2026-11-18 LATE: ALL 3 PARTS BUILT, check 0 errors: lm_intro v2 (owner rejected v1 as "AI slop"; redesign in
  `devices/lm_v2.mjs`: Warning2 on HCR doorway, Descent stairwell list, DescentReturn red hairline, CaseCard2), lm_case01a
  (185.9 s, 40 shots, map MapC01), lm_case01b (309 s, 70 shots). Sheets in `productions/last-moments/edit/qa/`.
  Preview: Claude Browser config "last-moments-preview" (.claude/launch.json, port 4848) = preview.sh lm_intro,lm_case01a,lm_case01b.
  WAITING: owner watches in Final Phase Lite and sends notes. Known: intro 54.2 s case-01 name blurs briefly; case 1 B-roll
  repeats (rain window, wet street, SIS, padlock ~5-6x each: Commons 429 blocked 10 photos); p01a 35.82-36.18 filler cut
  needs a listen; RAD/WED licence needs owner OK; abyssal.json Learnings save blocked by 8 invalid statuses (note in
  memory + intro_v2 handoff). After OK: full render on GitHub (run_all.sh / farm).
- OLD: case 1 split in 2 parts: `lm_case01a` (VO p01a-c + p02, HPK + HCR raws, map; also intro fixes + Commons retry;
  state `docs/ai-state/last-moments_case01a_HANDOFF.md`) and `lm_case01b` (VO p03 + p04, HCR half-speed replay, inquest page;
  state `..._case01b_HANDOFF.md`). Then: `bash tools/case-build/preview.sh lm_intro,lm_case01a,lm_case01b`.
- OLD: build agent 1 = `hf-engine/devices/lm.mjs` (all channel devices) + `cases/lm_intro.mjs` + QA sheet
  `productions/last-moments/edit/qa/lm_intro_sheet.jpg`. NEXT after it: agent 2 = `cases/lm_case01.mjs` (8 min VO, raws HPK/HCR,
  page, map, photos, B-roll; retry 10 failed Commons photos), then `bash tools/case-build/preview.sh lm_intro,lm_case01`.
Original plan: build devices (new channel look, `hf-engine/devices/lm.mjs`) + `cases/lm_intro.mjs`, `cases/lm_case01.mjs`
(media root `hf-engine/media/last-moments`), node build.mjs, hyperframes check, preview.sh.
- 2026-11-19 owner notes on preview 1 (saved in memory _topic-abyssal-edit-feedback.md): visible warning glitch + no abrupt
  audio/clipped first word; intro narration-precise; no zoom on case 01; ONE title screen (CASE 1 + title below, typewriter,
  VCR OSD Mono font); pro lower third; CCTV date ring on the stamp; no repeated stock; real articles in 3-D.
  RUNNING 3 agents: intro fix (lm_intro.mjs, lm_v2.mjs, font; sheet qa/lm_intro_v3_sheet.jpg), pro kit `devices/lm_pro.mjs`
  + part B rework (qa/lm_case01b_v2_sheet.jpg), part A rework (qa/lm_case01a_v2_sheet.jpg). Then lead checks sheets; preview
  reloads by itself (server "last-moments-preview", port 4848).
- Final Phase Lite local fixes: claude.exe path, clean env for child claude, drawing tools. Owner's CLI is signed out:
  `tools/final-phase-lite/login_clean.ps1` signs in (owner must do it); until then notes are fixed in the main chat.
- 2026-11-19 intro v5: glitch only on the warning. A = FloatBg/FloatCard rise montage (LIP 60, CGF 9.0, CRV 195.5) + dip to HCR
  full frame; B = hard cuts CRV 236 / CGF 19.5 / WED 121.8. No repeats: conveyor C CGF 11.4 @0.46, RAD 596 (entrance);
  title plate = still c01a/harrods_night.jpg. Backups: cases/lm_intro.mjs.bak_v4, devices/lm_v2.mjs.bak_v4float. Check 0 errors.
