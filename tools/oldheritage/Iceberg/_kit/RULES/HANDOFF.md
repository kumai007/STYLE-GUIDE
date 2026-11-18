# OUTLINES5 handoff (2026-11-01 ~04:20). The 5 videos for the 404 thread channel, built in the APPROVED v3 style

Memory: `o5-approved-style.md` (the rules) and `feedback-o5-autoassembly-rejected.md` (what failed).
Approved reference: `build/2_Hours_of_Internet_Horrors/s016_mix.mp4` (Jellyfish UAP v3, phone copy `phone_s016_v3.mp4`).

## Pipeline per video (all scripts in `tools/`; MT = MASTER_TEMPLATES)
1. Clip maps: `clipmaps/<c_name>.json` (brief `CLIPMAP_BRIEF.md`).
   - Japan: auto-cropped with OCR (`auto_crop.py V1_japan`), blank ranges dropped.
   - Do NOT run auto_crop on games: it would crop out in-game text.
2. `python tools/shotlist.py catalog <vid> [secs]`: the catalogue includes `usable_parts` from the clip maps.
3. Editor agents (sonnet) per `EDITOR_BRIEF.md` write `shots_sNNN.json` beat by beat.
   - The prompt template is the one used for the IH re-edits: footage only where it's shown, vv explainers and diagrams for explanations, no repeated clip moments, pages only on proving lines.
4. `python tools/shotlist.py apply <vid> [secs]`. It handles: snapping to clip maps and their crops, smart titles, page-run limit 2, explainer-run limit 2, hold breaking, and openers reset.
5. Plan:
   ```
   cd MT && node tools_lib/plan_video.cjs "<cases dir>" "<title>" <mix> --theme .. --ledger D:/404 Rendrer/OUTLINES5/plan/ledger_CHANNEL_404.json --allow <palette> --merge --identity <grade> --commit
   ```
   Then verify every shot's template is inside the palette, and that there are 0 cross-case clips.
   Then `python tools/clamp_clips.py <vid>` (shots running past a clip end cause "No frame found").
6. Before rendering: `bash tools/x264_all.sh` (seek-safe re-encode of new clips, mirrored to the bundle), then `python tools/sync_bundle.py`.
   - Rebundle only after code changes:
     ```
     cd MT && TEMP=D:/rtmp npx remotion bundle src/prod/index.ts --out-dir D:/rbundle/prod_new
     ```
     then replace `D:/rbundle/prod`.
7. Render: `bash tools/render_list.sh <vid> 8 s001 s003 …` (two streams), with logs in `tools/render_*.log`.
8. Frame-check every case with an ffmpeg tile sheet. Phone copies must be ≤30 MB (libx264 ~430k, 1280 wide).
9. `python tools/assemble_video.py <vid> "<title>"` → `FINAL/<vid>/<title>.mp4` + `chapters.txt`.

## Palettes and grades (variation across the channel)
- **IH** (disturbing, `--identity nocturn`): caseOpen, footageWindow, rawFullFrame, frameCompare, farrellSS, vvDiagram, vvScene, depth25d, vvVVBlurFill, farGrindrPinBoard, nocTextUnblurDate, farInfoFocusDate, farCCTVTranslateDim, lemminoRouteMap
- **Japan** (disturbing, theme police,crime,japan,forest, `--identity vv`): the IH set + fernGridWarRoom + farPeopleRegionPin (maps)
- **Flash** (disturbing, theme flash,games,internet, `--identity farrell`): caseOpen, retroFrame, footageWindow, rawFullFrame, frameCompare, farrellSS, vvScene, vvDiagram, shotScatter, depth25d, farInfoFocusDate
- **Lost Games sleep** (lostmedia, `--identity lemmino`) and **100 Lost Games** (lostmedia, `--identity fern`): caseOpen, retroFrame, footageWindow, frameCompare, farrellSS, printScan, shotScatter, vvScene, vvDiagram, depth25d, lemminoRouteMap, farInfoFocusDate

## State at handoff
- **IH:** all 19 sections re-edited and applied; planned and committed to the ledger.
  - Mix: vv 29%, pages 22%, footage 31%, diagrams 9%.
  - Rendering in 2 streams (`render_ih_a.log` / `render_ih_b.log`). s000 FAILED with a 404 on a new clip.
  - Fix in progress: `x264_all.sh` + `sync_bundle.py` (background). After it, re-run render_list for the FAILed sections.
  - s016 is the approved render: keep it.
- **Japan:** clip maps done, auto-cropped and cleaned.
  - Next: catalog all sections, then 4 editors (Japan rule: appeal posters as-is, no distressed-relative close-ups), then apply, plan, render.
- **Flash:** clip maps done (jumpscare times in `what`).
  - Next: catalog, then 3 editors (games: footage in story order inside usable_parts, avoid gore/jumpscare times), then apply, plan, render.
- **Lost Games sleep:** `build_cases.py` running (log `tools/build_lgs.txt`), then 100 Lost Games.
  - Then: clip maps (games brief), catalog, editors, apply, plan, render.
- **Disk:** clear `D:/rtmp/remotion-*` and stale bundles when space gets low. Never stage whole bundles in `_TO_DELETE`.

## UPDATE 2026-11-01 08:00: rulebook pipeline (supersedes steps 5-7 above)
The owner rejected IH case 1 as templated. All rules are in `OWNER_RULES.md` and are enforced in code.
- After `shotlist.py apply <vid>`:
  ```
  bash tools/pipeline.sh <vid> "<title>" <mix> <theme> <palette> <identity> <accent>
  ```
  The steps: `lead_fix` → plan (fresh ledger entry) → `split_beats` (word-boundary cuts) → `vary_case` → clamp → `dedupe_frames` → `vary` → clamp → `dedupe` → clamp.
  - `vary_case`: VV form/backdrop/camera rotation, calendar cap, SS rotation, replay detailing, pacing cuts, b-roll for long pages, VV share cap.
  - `dedupe_frames`: thumbnail look-alike check, still/page repeat cap, glyph cap, sparse diagrams to hold, treatment swap.
- VV explainers render with `core/vvScene2.tsx`.
- Render: `bash tools/render_all.sh <vid>…` (3 parallel, logs in `tools/rlogs`).
- Accents: IH cyan, Japan yellow, Flash red, LGS orange. Grades: nocturn, vv, farrell, lemmino.
- Japan clip ranges were OCR-rechecked (`auto_crop.py V1_japan --recheck`, min window 32%). Backup of the old maps: `D:/rtmp/clipmaps_bak_0801`.
