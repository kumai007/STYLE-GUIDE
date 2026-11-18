# Farm fix 2026-11-17: PLAN_TOO_LARGE (6.31 GiB) on render chunks 0, 1, 2, 11, 12

## Cause
- Render jobs fetch big media (> 25 MB) straight from Drive `gdrive:_cloud-jobs/coc2h-vol1/<part>/hf/assets/media` (farm/render.sh, files.txt). Small files come from the pack; actions/cache only holds the HyperFrames CLI. Neither was involved.
- Drive still held the 60 fps clips uploaded by run 8 (tag 163807, step 3 took 642 s): coc_intro LSV.mp4 5.59 GB, SOA 846 MB, SN72 594 MB, SWFA 430 MB, plus 12 other changed clips (some in coc_case01). Drive mtime 11:05 UTC = the 60 fps files.
- Runs 9 and 11 (44074846897, 44077475693) sent nothing big (step 3 took ~30 s): for run 9 the local clips were still 60 fps; for run 11 the originals were restored after its step 3 had run. A restore by copy keeps the source file's mtime, so the local 17:18 time does not show when the restore happened.
- So the chunk planDir counted the 6.77 GB of stale 60 fps source media (`sourceMediaBytes 6767028208`, fileCount 54) against the 2 GiB cap.

## Fix
- Re-ran farm.sh's own step-3 sync for this project only (`rclone sync <project> gdrive:_cloud-jobs/coc2h-vol1 --filter-from farm/sync-filter.txt`): 17 clips replaced, coc_intro media on Drive now 1.27 GiB; `rclone check` matches local (only an ignored __pycache__ .pyc differs).
- No farm code change; no cache, pack or other project touched.
- Rule: after swapping source clips, start the next farm run only after the swap is fully done; farm.sh step 3 then sends them (size differs).

## Result (run 12 = 44080365806, tag 173801)
- All 200 render chunks + 2 sounds succeeded on GitHub (no PLAN_TOO_LARGE). The PC preview download missed 10 chunks (one left as .partial), so farm.sh stopped at step 7; fetched them from Drive (`rclone copy --size-only`, 200/200 match), ran farm/join.sh by hand (JOIN_OK frames=28570), then master_loudness.sh and purged the run temp folder.
- Final: case-work/renders/coc2h-vol1_coc_intro_coc_case01_farm_2026-11-17_17-52-36_m16.mp4 (I -16.2 LUFS, TP -2.3 dBTP).
