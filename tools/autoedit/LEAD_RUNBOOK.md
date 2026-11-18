# Lead runbook: 90-min caught-on-camera video, edit + code < 10 min wall time
Past-project learnings: `docs/knowledge/README.md` (read its routing table first).

Paths: `A` = `tools/autoedit`, `PROD` = `productions/<slug>` (media: `sources/<SRC>.mp4`, `vo/raw/<take>.wav`,
`assets/{pages,maps,music,sfx}`, `build/fonts`), `EDIT` = `PROD/edit`. All heavy compute runs on GitHub.


Agent cap (measured 2026-11-16): the app runs at most 20 subagents at once (CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS).
~/.claude/settings.json env now sets 64 (backup settings.json.bak_subagents_*); it applies to NEW sessions only.
If a launch says 'Concurrent subagent limit reached', start the rest as earlier agents finish (waves).

## Before the clock (once media + VO exist)
0. Early upload, started the moment clip downloads begin (background): `python -X utf8 A/upload_early.py PROD FARM`
   (FARM = `case-work/farm-<slug>`, the same dir stage_farm uses). Sends each finished clip to the farm's Drive
   path; farm.sh then skips them (1 GB = ~10 min, hidden behind scripts/edit). Touch `PROD/sources/.downloads_done`
   when downloads end; it exits after the last clip. Log `PROD/upload_early.log`.
1. `python -X utf8 A/prep_github.py PROD EDIT` -> one task.sh run: Whisper words for all takes, scene cuts and face
   boxes for all sources, all machines in parallel. Results: `vo/raw/*.words.json`, `EDIT/cuts/`, `EDIT/faces/`.
1b. Pages + maps: write `EDIT/assets.json` from the case script agents' notes (or let each script agent write its
   case's part): per case <= 1 news page {url, exact highlight sentences, blur_words = private names} + <= 1 map
   {lat, lon, label, zooms}. Run `python -X utf8 A/assets/prep_assets.py PROD EDIT` (one machine per item, parallel,
   ~minutes; can run alongside step 1) -> `assets/pages/`, `assets/maps/`, keys.json `pages`, `EDIT/qa/ASSETS_CHECK.jpg`.
   Look at the sheet downscaled; a "highlight not on page" line -> copy the exact sentence from `<name>_text.txt`,
   re-run with `--only <cid>`. Format: `A/schema.md` "assets.json".
2. Write `EDIT/video.json` (order c00 intro .. cNN outro, sources framing, music per case, target_s, sfx) and
   `EDIT/keys.json` (blur runs from `faces/` + hand fixes, freeze stills, privacy flags; `pages` come from 1b).
   Pass each case agent its assets.json ids (input 4, house-style row).
3. Per case prepare the brief inputs: cut-sheet section, media log rows, `compile.py EDIT --words <take>` output,
   house-style row (opener + devices so no device is in > 2 cases and openers differ).

## The 10 minutes
4. (t=0) Launch ALL case agents in ONE message (one Agent call per case file, intro and outro included, run in
   background). Prompt = `A/CASE_AGENT_BRIEF.md` with {CID} {CASE} {TITLE} {SRCS} {TAKES} filled + the inputs.
5. (t~5) As each finishes: `python -X utf8 A/lint.py EDIT` (whole video: cross-case openers/devices, total length).
   Cross-case fixes -> SendMessage to that case agent with the lint lines (it re-lints its case).
6. (t~7) FIRST the intro + case 1 live preview (below) until the owner writes "approved" in chat; THEN
   `bash A/run_all.sh PROD EDIT full` -> map clips on the PC -> lint -> stills on GitHub (contact sheet per
   case in `EDIT/qa/`) -> stage farm (`case-work/farm-<slug>`) -> farm render with audio premix + master -> QC.
   Step order by hand: compile -> `python -X utf8 A/assets/make_maps_pc.py EDIT` (PC; owner 2026-11-16: maps are the
   one PC render, the farm only pastes the clips; fresh clips skip) -> lint -> `A/stage_farm.py PROD EDIT FARM`
   (stages clips, no tiles; stops if a clip is missing/stale) -> `tools/case-farm/farm.sh`.
   Change the map style = edit `kit.map_eox`, run make_maps_pc.py (style hash marks every clip stale), re-render.
   Check contact sheets vs refs before the full render (stills-first rule). Sample of intro + case 1 = live preview,
   no render: `bash tools/case-build/preview.sh <intro_id>,<case1_id>` (Final Phase Lite; hf-engine `cases/<id>.mjs` only,
   autoedit JSON cases have no live preview yet: use stills). After owner OK: the `full` command above.

## Rules the tools enforce (never re-review by eye what lint checks)
Shot >= 3 s (intro 2 s), no source-cut crossing, no window reuse in cases, <= 1 page + 1 map per case, text >= 3.5 s,
captions only on raws, blur for flagged windows, banned looks, total length, distinct openers, device in <= 2 cases.
Eyes only for: taste on contact sheets, captions wording, privacy misses haar did not catch.

## Engine upkeep
`engine/` is generated (2026-11-18: no production build is left, so `engine/` is now the source of truth; regen only from a new production): `python -B -X utf8 A/regen_engine.py <best production>/build` (exact-text patches; fails
loudly if that renderer changed shape; prints leftover case-specific lines). Legacy hand-written timelines convert
with `A/convert_legacy.py` (see its header).
