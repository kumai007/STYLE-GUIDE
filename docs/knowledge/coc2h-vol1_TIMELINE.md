# coc2h-vol1 production timeline (145.4 min, intro + 28 cases + outro)
Times are local IST (UTC+5:30). M = MEASURED (a file/transcript/GitHub timestamp), E = ESTIMATE. Sources: session JSONL timestamps, `case-work/coc2h-vol1/farm_run*.log`, `finish*.log`, `full_start/end.txt`, `gh api` job stats, file mtimes, CASE_QUEUE.md.
Wall total: first transcript 11-16 20:27 -> final master 11-18 09:53:44 = **37 h 27 min (M)**. Master mtime in Downloads 09:52:58 (M).

## 1. Research, script, sources, storyboard, first render (11-16)
| Step | Start | End | Wall | Blocked / waited | Source |
|---|---|---|---|---|---|
| Parent chat -> "New caught-on-camera video" session | 20:27 | 20:38 | 11 min | owner "my pipeline", "open a new session" | M transcript |
| VO + script md handed over, sheets/job.json built | 21:18 | 21:21 | 3 min | | M file mtime |
| Sources batch 1 (12 of 37 videos) | 21:21 | 21:32 | 11 min | **YouTube bot check stopped it**, 22 not attempted; rerun only next day | M fetch*.log |
| Narration vo_001-008 | 21:27 | 21:27 | <1 min | | M raw mtimes |
| Storyboard / intro look, 3 owner "can't see it / make it like the ref" rounds | 21:54 | 23:13 | 79 min | owner feedback 21:55, 22:12, 22:38 | M transcript |
| Plan to first farm render (run 1) | 20:27 | 23:17 | **170 min** | | M |

## 2. Intro + case 1 rounds v1..v11 (owner feedback -> render -> send)
Farm step times from each `farm_run*.log` (upload step / all chunks in). Send times from assistant "sent" messages where found, else render end.
| Round | Run (tag start) | Upload | Render ALL_IN | Sent | Owner feedback that triggered it | Cycle |
|---|---|---|---|---|---|---|
| v1 | run1 11-16 23:17 (fail, 28 jobs) then run2 23:42 | 155 s / 29 s | 449 s | 11-16 23:51 | storyboard rounds above | M |
| v2 | run3 11-17 06:32 (1 job retried) | 31 s | 568 s | 06:44 | trigger not logged (E: v1 feedback); .pack folder fix session 6cb68fb5 ran 23:59-06:32 | M |
| v3 | run4 08:03 | 62 s | 511 s | 08:19 | pin ref link 07:02 (cycle 07:00 -> 08:19 = 79 min) | M |
| v4 | run5 09:59 | 56 s | 359 s | 10:12 | 08:58 "iceberg only, no raw", 09:22 grade, 09:41 colour, 09:59-10:29 | 74 min M |
| v5 | run6 10:38 | 31 s | 382 s | 10:46 | 10:13 "3D pan zoom", "music 75/SFX 60", 10:27 "iceberg blue" | M |
| v6 | run7 10:54 | 30 s | 352 s | 11:02 | "OK, render" 10:29 | M |
| v7/v8 | runs 8-12 (16:38-17:54) | 638 s (run8) | run12 823 s w/ missing chunks | ~17:54 | 11:19 "jerky"; 15:43 "centre fade"; 16:10 "OK, render" | **104 min** M; v7 vs v8 split unknown (E) |
| v9 | run13 19:38 | 203 s | 774 s | 19:57 | 18:14 title frame, 19:02-19:07 article 3D pan, 19:37 "Yes, render" | 103 min M |
| v10 | run14 20:52 | 339 s | 677 s | 21:12 | 20:09 grade/music/CRT, 20:37-20:44 vignette, 20:52 "Yes, render" | 63 min M |
| v11 | run15 21:26 | 38 s | 459 s | 21:43 | 21:15 music/overlay, 21:25 "Yes, render" | 28 min M |
- Totals: 11 rounds, 15 farm runs, 11 sends. Span run1 -> v11 sent = 22 h 26 min wall (M); 11-17 07:00 -> 21:43 = 883 min, of which 327 min are session gaps >20 min (222 min 12:01-15:43, owner away E) -> ~556 min active (E).
- Render wall per round is 6-13 min (M); upload 30-640 s; the rest of each cycle is owner think-time plus builder edits (E, not logged separately).
- Runs 8-12 (60 fps detour): 16:10 "OK, render" -> 17:54 sent = 104 min (M). Cause per FARM_FIX.md: 60 fps re-encode uploaded (8: 5.6 GB LSV), then owner 17:18 "dont make it 60 fps"; stale 60 fps files stayed on Drive -> PLAN_TOO_LARGE 6.31 GiB on jobs 0,1,2,11,12 in runs 8, 9, 11; run 10 rclone list failed; run 12 ok after Drive resync. Builder context handoff 17:55 (E: related).

## 3. Sources + narration for cases 2-28 (11-17)
| Step | Start | End | Wall | Blocked | Source |
|---|---|---|---|---|---|
| Owner "do all cases" / "go, no review" | 21:28 | 21:40 | 12 min | Algrow key file missing; owner "Key added, start" 21:28, "Saved it, retry" 21:29 | M transcript |
| Sources batch 2 (25 videos, serial yt-dlp) | 21:31 | 22:06 | 35 min | RIN2 age-locked, skipped | M fetch*.log mtimes |
| Narration vo_009-155 (147 lines) | 22:05 | 22:16 | 11 min | wait for key; 3 later re-records (vo_044/051/073/081/109/143/152) E ~1-3 min each | M voice_rest.log + csv mtimes |

## 4. Case builds 02-28 + outro (builder + capture agents)
Cases 02-06 = own sessions (start 21:36): c02 -> 22:47, c03 -> 22:50, c04 -> 22:25, c05 -> 06:04 (stalled from 22:27), c06 -> 06:19 (stalled from 22:16). Rest = background agents in main session. "Build" = builder agent start..last continuation end; Cap = page-capture agent minutes; Cont = context-limit continuation agents (M agent files). Case 01 built earlier (v1-v11).
| Case: build start-end (Cap min / Cont) | Case: build start-end (Cap / Cont) |
|---|---|
| 07 22:05-22:50 (35 / 0) | 08 22:05-23:00 (36 / 1) |
| 09 22:05-22:42 (11 / 1) | 10 22:05-23:02 (37 / 1) |
| 11 22:05-23:02 (39 / 0) | 12 22:05-22:33 (none / 1) |
| 13 22:05-23:08 (48 / 0) | 14 22:05-**06:05** (44 / 1, stalled 22:56) |
| 15 22:05-22:50 (none / 1) | 16 22:29-23:00 (11 / 0) |
| 17 22:29-22:52 (18 / 0) | 18 22:36-23:08 (14 / 0, 7 pages by main) |
| 19 22:44-23:09 (8 / 0) | 20 22:50-**06:12** (cap 22:53-06:06, stalled) |
| 21 22:50-23:20 (13 / 0) | 22 22:51-23:34 (1 / 1, face blur) |
| 23 22:51-23:15 (19 / 0) | 24 22:52-23:17 (10 / 0) |
| 25 23:05-23:40 (14 / 1) | 26 23:05-23:32 (9 / 0) |
| 27 23:05-23:22 (8 / 0) | 28 23:05-23:31 (19 / 0) |
| outro 23:05-23:11 (6 min) | take-overs c03, c05, c06 22:10-22:29 (3 agents) |
- Builders ran 5 sessions + 9 agents in parallel (cap 9); 26 builds done by 23:40 = 95 min wall from 22:05 start (M). Per-build agent wall 6-63 min, median ~30 min (M).
- Context-limit handoffs: 8 "Continue" agents (c08, 09, 10, 12, 14, 15, 22, 25) + 3 take-overs = 11 (M agent files; notes say ~10). Cost per handoff not logged: E ~5-10 min each of builder wall (E).
- Page capture: 19 capture agents (excl. stalled c20), 394 agent-min total (M), 1-48 min each, ran parallel to builds; finished 3-30 min after builder start (M).
- Late fixes by main between builds: VO fixes vo_035/044/051/073/081/109/143/152, blur sweep (c02,03,04,11,13,16), 7+10 pages composed by main for c18, c23 (E: ~30-60 min total, not separately timestamped).

## 5. The overnight stall (11-17 -> 11-18)
| Item | Start | End | Wall | What blocked | Source |
|---|---|---|---|---|---|
| Owner AFK ("don't ask, do it") | 22:03 | - | | owner left | M transcript |
| c06 session idle | 22:16 | 06:13 | 477 min | Allow prompt (E: WebFetch) | M gap |
| c05 session idle | 22:27 | 06:01 | 454 min | same | M gap |
| c14 continuation / c20 builder+capture | 22:56 / 22:50 | 06:05 / 06:12 | ~430 min | same | M agent files |
| Main session idle | 23:40 | 06:01 | 381 min | cases 20/14 agents waiting | M gap |
| Watchdog message "stopped on an Allow prompt for WebFetch, owner cannot click" | 06:02 | | | | M |
- Critical-path loss = last non-stalled case done 23:40 -> last stalled case done 06:12 = **392 min (6 h 32 min), M timestamps**; cause "Allow prompt for WebFetch" is the watchdog's wording (M), not seen directly.
- All 30 parts built + checked 06:25 (CASE_QUEUE), full render started 06:20:22 (full_start.txt).

## 6. Full farm run 16 (06:20 -> 09:54) and its failure modes
| Step | Start | End | Wall | What blocked / failed | Source |
|---|---|---|---|---|---|
| Plan 188 chunks / 30 parts | 06:20:22 | 06:20:36 | 14 s | | M log |
| Drive upload ("Send changed files") | 06:20:36 | 06:38:04 | **1048 s** | 30 parts of media, serial rclone | M log |
| PC side died at mkdir (30 part names, path too long) | 06:38 | 06:38 | | cloud run kept going; prep.py fixed, resume16.sh 06:38:33 | M log/mtime |
| Cloud run 44213397772 (188 chunks, 30 audio) | 06:37 | 07:54 | 77 min | **111 render jobs CANCELLED at 30.3 min job timeout**, 19 PLAN_TOO_LARGE (2.55 GiB > 2 GiB, 3.5 min), 58 ok (median 27.7 min) | M gh api |
| Diagnose + build fix plan (watchdog 07:28, make_fix_plan.py 07:33) | 07:28 | 07:34 | ~6 min after msg | main session waiting at 06:38-07:28 (50 min gap) | M |
| fix1 run 44220542778 (57 sub-chunks <=960 f) | 07:34 | 08:02 | 28 min | 9 still PLAN_TOO_LARGE; 48 ok median 13.3 min | M gh api |
| rest1 44224866691 (240 pieces <=1080 f) | 08:09 | 08:36 | 27 min | 238 ok (median 12.6 min), 2 PLAN_TOO_LARGE | M |
| rest2 44224925897 (141 pieces) | 08:10 | 08:46 | 36 min | 139 ok (median 10.7), 2 fail; last jobs ~16 min | M |
| rest3 44226043951 | 08:19 | 08:34 | 15 min | 2 ok, 2 fail (same 4 windows) | M |
| Patch farm_entry.py (HF cap 2->6 GiB) c03+c22, rest4/rest5 | 08:53 | 09:03 | 10 min | 5.8 + 9.0 min runs; main session idle 08:19-08:52 (33 min) | M |
| finish_all (download+splice 188/188) | ~08:54 | ~09:17 | ~23 min | duplicate finish_all killed (rclone collision) | M log mtime |
| First join | 09:17 | 09:19 | 2 min | **JOIN_FAILED** frames 522375 != 523461 (resync error) | M finish_all.log |
| join_only (mux 52 s) -> 9.26 GB joined | 09:19:32 | 09:28 | 9 min | | M mtime |
| Master loudness (3 tries: -16.2 LUFS, TP -1.8) + move to Downloads | 09:28 | 09:53:44 | 26 min | first two tries over/under true-peak | M log + full_end.txt |
- Render wave sizing: job speed 1.4-2.0 fps incl setup (notes, M); chunks of ~2700 f needed ~28-30 min = the cap; chunks <=480-1080 f ran 10-17 min. 188 chunks was ~3x too few (notes).
- Cloud time 06:37 -> 09:03 = 146 min (M); a right-sized single wave would take ~17 min (max job in rest runs, M) -> ~130 min lost (E, assumes no PLAN_TOO_LARGE).

## 7. Top 8 time sinks (rank by minutes; sinks 1 and 3-5 do not overlap, #1 contains the 222-min idle)
| # | Sink | Minutes | M / E |
|---|---|---|---|
| 1 | Intro + case 1 sample rounds v3-v11 (owner feedback loops; 15 farm runs) | 883 wall (~556 active) | M span, active E |
| 2 | Overnight Allow-prompt stall (c05, c06, c14, c20 + main idle) | 392 | M |
| 3 | First request -> first farm render (script, storyboard, intro look) | 170 | M |
| 4 | Run 16 cloud: chunk sizing, 111 timeouts, PLAN_TOO_LARGE x4 rounds (06:37 -> 09:03) | 146 (130 avoidable) | M / E |
| 5 | 60 fps detour, runs 8-12 failing on stale Drive media (16:10 -> 17:54) | 104 | M |
| 6 | After cloud: splice, failed join, join_only, 3-try loudness (09:03 -> 09:53) | 50 | M |
| 7 | Serial source download, 25 videos (+ bot-check stop on day 1) | 35 | M |
| 8 | Run 16 Drive upload (30 parts) | 17.5 | M |
Next: 11 context handoffs (E ~55-110 agent-min), 394 agent-min page capture (parallel), narration 11 min, case builds 95 min wall for 26 cases.
