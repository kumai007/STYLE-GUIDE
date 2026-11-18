# Fast long video (2 h compilation in 3-4 h)

Learned from coc2h-vol1 (145 min, intro + 28 cases + outro, 2026-11-16..18). Measured times: `docs/knowledge/coc2h-vol1_TIMELINE.md`.
This file is about speed only. Look and rules stay in the SOPs, the playbook and the style guide.

## Target time budget (wall clock, owner away)
| Step | Budget | How |
|---|---|---|
| 1. Script + sources + **fact check** | 45 min | Sources are fetched one at a time (`tools/case-build/fetch_sources.py`). Every VO fact is checked against a real page **before** recording. |
| 2. Narration | 15 min | One Algrow batch, `--workers 4` (147 lines took 11 min, measured). |
| 3. Reference look | 0 min | Reuse the last approved house look (template `hf-engine/cases/coc_case09.mjs`; coc2h case 1 v11 look). Vol 1 spent 883 min on 11 sample rounds (15 farm runs): new looks only when the owner asks, and judge them on stills, not full renders. |
| 4. Case builds | 60-90 min | All cases at once, background agents (see below). |
| 5. Lint + build all | 10 min | `python tools/case-build/lint_cases.py <cases> --fix`, then build + check every part. |
| 6. Farm render | 50-60 min | After the owner approved the live preview: `bash tools/autoedit/run_all.sh <production> <edit> full` (see Farm). Sync each finished part to Drive during step 4 (the 30-part upload took 17.5 min). |
| 7. Master + QC + send | 20 min | `tools/case-build/master_loudness.sh`, farm recovery kit `tools/case-build/recovery/`, `python tools/case-build/qc_full.py <master> <parts> <farm project>`. |

## 1. Fact check before recording (cost 7 re-records in vol 1)
- Builders found 7 wrong VO facts after recording (quote given to the wrong person, wrong cub count, wrong outlet,
  unproven date, picture described wrongly). Each one cost a re-record + rebuild.
- Before recording: for each case, one cheap agent (model haiku/sonnet) checks every name, quote, date, number and outlet in the
  VO against the pages it will show. It writes `VO_FIX: vo_NNN | old | new` lines. Apply them, then record once.
- Late fixes: `python tools/case-build/vo_fixline.py <production> vo_NNN "<old>" "<new>" --engine-vo <engine>/media/<prod>/vo`.

## 4. Case builders (most lost time in vol 1: ~12 context-limit restarts)
- One background agent per case (Agent tool, not new chat sessions; chats stall on Allow prompts). Up to ~14 at once.
- Work order (copy into the brief): (1) read brief + own job.json blocks via a tiny .py; (2) link sources; (3) hand ALL page
  capture to one haiku agent and do not web-search yourself; (4) write `cases/<id>.mjs` EARLY from the `coc_case09.mjs` template structure
  (grep, never read big files whole), build, check; (5) refine; save `cNN.md` at each milestone.
- A builder that stops at its context limit: stop it (TaskStop) and start a fresh "continue from cNN.md" agent. Do not resume
  the old one: it overflows again.
- Builders never fetch web pages with the WebFetch/WebSearch tools: those raise an Allow prompt that stalled the whole session
  overnight (~7 h) while the owner was away. Pages come only from scripts (Playwright/requests in a .py).
- Shell rule: no `$(...)` or shell variables built inside a command line (Allow prompt). Logic goes in .py/.sh files.
- Face blur: GitHub face detection (case 12 `track/run_face.sh` pattern), then a timed blur device.

## 6. Farm (tools/case-farm, commit 7b02e24)
- Render jobs run ~1.4-2.0 frames/s. The render job timeout is now 120 min (30 min cancelled 111 of 188 jobs).
  `prep.py` warns when a chunk may pass the timeout.
- `"window_media": true` for every part (`tools/case-build/farm_parts.py` sets it). Plan-dir guard is raised to 6 GiB on the
  runner (`raise_plan_cap`); heavy windows needed 2.0-2.3 GiB at any chunk length.
- Many parts: the run gets a short local name; 1-chunk parts get one sound piece (both broke the PC side in vol 1).
- Never start a second watcher/finish script on the same preview folder: two rclone copies into one folder corrupted 7 pieces.
  `TaskStop` does not kill grandchild processes: check `rclone.exe` processes before restarting.
- Before the join, check every piece's frame count (`ffprobe -count_packets`) against the plan.

## Sample = live preview, not a render (owner 2026-11-18)
- Intro + case 1 sample: `bash tools/case-build/preview.sh <intro_id>,<case1_id>` (builds in ~7 s). Start it in the background
  on the PC (it runs until stopped); give the owner the URL it prints (default http://127.0.0.1:4848, next free port if busy; tool in `tools/final-phase-lite/`). Owner scrubs, circles a spot, types the change; the Claude the window starts
  edits `cases/<id>.mjs`, rebuilds, the window reloads. No farm run per change. Never press the window's Render button:
  renders run only on GitHub. The preview is the one allowed local step (build + frame snapshots are light).
- Stills-first rule = this preview (scrub every device vs its reference still). "Approved" = the owner says so in chat.
- When intro + case 1 are approved in the window: build all cases, then ONE full render on GitHub:
  `bash tools/autoedit/run_all.sh <production> <edit> full`. The farm sample below is only a fallback (final sound mix + loudness check).
- The preview plays the part's own audio, not the farm premix/master. Loudness is checked on the GitHub render.

## 10-min farm sample speed (fallback; 2026-11-18, intro + case 8 = 594 s of video)
- One command: `bash tools/case-build/sample_fast.sh <farm project> <part,part>` (build 5 s, then the farm;
  `hyperframes check` runs at the same time and prints CHECK_OK / CHECK_FAILED at the end).
- Measured, build start to MP4 on the PC (same 2 parts, real GitHub runs):

| Test | Time | What changed |
|---|---|---|
| 1 | 7.6 min (farm only) | sound-only mix, mini project, window mode on |
| 2 | 8.9 min (check 2.5 min first) | hidden clips -> empty divs (45 s wait gone) |
| 4 | 6.7 min | job files from GitHub caches, not Drive; cost split |
| 7 | 5.5 min | cap 180 (real limit), smoothing, early sound mix |
| 8 | **4.8 min** | trim +-0.25 s, smoothing fits short parts |

- Test 8 breakdown: Drive sync 22 s, start 5 s, GitHub queue + list job 53 s, render 190 s (slowest job 189 s,
  median 118 s), join 4 s. Picture: same as before (SSIM vs approved video equal or better at every spot).
- The first run of a NEW part has no speed file yet: expect ~5.5 min; from the 2nd run on it is balanced.
- Not in the 5-min budget: writing new case code, sources, narration (agent work).

## QC notes
- `qc_full.py`: length vs parts, first VO line of every part (cross-correlation, ms), black/freeze list. Intended blacks
  (hard-out raws) are listed in the case notes.

## Before / after (coc2h-vol1)
| | Before (measured) | After (estimate, this file) |
|---|---|---|
| First request -> final master | 37 h 27 min wall | 3.5-4 h |
| Sample rounds | 883 min (11 rounds, 15 farm runs) | 0 (reuse look) |
| Unattended stall (Allow prompt) | 392 min | 0 (no WebFetch/`$(...)` in unattended work) |
| Farm (run 16 + fix runs) | 146 min cloud + 17.5 min upload + 50 min join/master | ~50 min |
| VO re-records after build | 7 | 0-1 (fact check before recording) |
| Builder context restarts | 11 | 0-3 (lean work order) |
