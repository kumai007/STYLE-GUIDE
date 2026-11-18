# Learnings: finished videos, part 1 (van, winter, gx-dashcam20/s10/t10, abyssal-01)

> **Status: notes, not rules.** Rank below the style rule book, SOPs and playbook; master SOP §2.4 bans override any
> device named here. Loudness: the SOP target (-16 LUFS, <= -1.5 dBTP) wins over any number below. Source paths
> `(src: ...)` are pre-deletion paths: look them up under `docs/knowledge/notes/<same path>` (PC only, not synced).

Legend: only items with 0-1 grep hits in kept knowledge are listed. Owner rules for gx (RULES_LOG, mix, easing, motion, stills-first, Abyssal look) are ALREADY saved in styleguide/gx-admixdd/RULES_LOG.md + memory topics; not repeated.

## Owner feedback
- (gx owner feedback fully covered by styleguide/gx-admixdd/RULES_LOG.md; nothing new from productions/gx-dashcam20)
- Owner asked (2026-11-16) to measure where edit time goes: 24 sessions 10-16 Nov = 10,529 min span; Claude direct work 12% (~24% with subagents, est.), scripts/renders ~25%, owner wait+idle ~50%; foreground whisper/precut/face cmds only ~106/99/7 min; several "2 h" subagent commands were probably permission prompts or PC sleep (src: docs/ai-state/HANDOFF-github-farm-2026-11-16.md)
- Open owner decisions left unresolved at merge (do not change without owner): SOP true peak <= -1.5 vs join.sh -1.05 / qc.py -1.0; typewriter date vs ban; SOP 2.5 s shot vs lint 3 s; music 15-25 vs 15-20 dB under VO; public Actions logs show project names (src: docs/ai-state/render-farm-video-merge-handoff.md)

## Editing
- Cut-sheet raw times can be wrong: winter RAW-C3-01 real time 1170.3-1177.1 vs cut sheet 19:39 (~9 s late); verify raw windows on frames/ASR, not the sheet (src: docs/ai-state/case2_render_handoff.md, case3_render_handoff.md)
- When the source creator cut sits inside a dip/handle, end the raw before it (RAW-C2-04 ends 627.04, not 627.86) (src: docs/ai-state/case2_render_handoff.md)
- Chapters.txt time = first narration line of each case minus ~3.3 s (card length); cues.md section offsets go stale after re-versioning (src: docs/ai-state/finalize_survey.md)

## Audio
- Farrell-era bed numbers measured on winter/van: bed -31 LUFS under VO (~15 dB), -46 under raw dialogue, -26 on cards/graphics; 0.5 s smoothing; section fade-in 1.5 s / out 2.5 s; cues = different sections of one track with 6 s equal-power crossfades, new cue per case card + key moments, min 75 s apart, max 7 per case, (track,start) never reused; adjacent cases never share a track; only 3 tracks (ES2_Margin, ES2_Kerofled, ES2_Still in Blues) for 7 cases (src: docs/ai-state/audio_pass_handoff.md, van_audio_handoff.md)
- Van SFX = one soft whoosh (-32 LUFS) on each case card/title, no hits/booms/braams (no jumpscare SFX) (src: docs/ai-state/van_audio_handoff.md)
- Master fallback: loudnorm linear fell back on LRA 21 (I -16.72, TP -0.85); fix = static gain + alimiter 0.80 iterated to target (src: docs/ai-state/audio_pass_handoff.md)
- AAC true-peak overshoot (-0.97) -> retry limiter ceiling 1 dB lower until TP passes (generic rule 27 has it; van used <= -1.05) (src: docs/ai-state/van_audio_handoff.md)
- Mute bug: profanity mute envelope built with np.ones (5 ms ramps only) so words were NOT muted; QC the mute points by reading level at each mute time (should be room tone, -40..-45 dBFS vs stem -52); fixed with np.zeros + audio-only remux of existing chunks (no video re-encode) (src: docs/ai-state/case3_render_handoff.md)
- gx narration take is very dynamic (-28 LUFS, -2 dBFS peaks): limiter needed up to 11 dB GR to reach -16; with GR <= 4 dB only -21.7 LUFS reached; question to owner (loud+limited vs untouched) was left open; intro mixed with VO untouched at -21.9 LUFS (src: docs/ai-state/gx-dashcam20.md)
- gx full join audio: case mixes are pre-master ~-27.5 LUFS; premix +12.29 dB then limiter; join un-gains by 12.29 dB, concatenates all, ONE master bus (gain + alimiter at 192 kHz) to -16 LUFS / <= -1.5 dBTP; result -16.10 LUFS / -1.70 dBTP AAC; 20 ms declicks only where both sides have sound and no VO within 0.1 s (src: productions/gx-dashcam20/build/FULL_JOIN_HANDOFF.md)
- "Clear-order" gate for the master: median music-under-VO >= 7 LU and p5 not down more than 1 LU (shift_max over a 3 s window is an artifact: 2-2.6 LU on c19/c20) (src: productions/gx-dashcam20/build/FULL_JOIN_HANDOFF.md)

## Captions + delivery
- SRT method used for finals: Whisper small.en on the final mp4 audio (segment timestamps; word-level ran ~2x realtime on a CPU-contended PC), split into <= 2 x 42-char cues with char-proportional timing, starts snapped forward to voice-energy onset; expect captions ~0.2 s early typically, up to ~0.8 s; SRT duplicates burned-in raw captions so mention it (src: docs/ai-state/finalize_survey.md)
- Phone previews: 360p, 10-min parts, each < 30 MB (van 8 parts, winter 6, all < 30 MB); winter part01/02 seam repeated ~2 s (src: docs/ai-state/finalize_handoff.md)
- Caption box <= ~1050 px wide, wrap to max 3 lines, bottom y=1000 grows up; captions live only in the final overlay pass (changing shot dict "caps" or gfx file mtimes busts the segment cache and re-renders everything); ASR splits "2 a.m." across events -> check first caption of a case (src: docs/ai-state/captions_loc_c12_handoff.md)
- Burned-in creator subs detection: bottom-band scan at 10 fps + stills; keep creator subs, caption nothing over them (src: docs/ai-state/captions_loc_c12_handoff.md)
- gx deliverables set: master 1080p60 AAC 320k, share 720p30 (1.3 GB), preview 540p30 (458 MB), teaser 25 MB (intro 15 s + 8 s per case); phone copy needs ~17.4 GB free; QC counted 319,526 frames at 60 fps = 88.8 min (src: productions/gx-dashcam20/archive/2026-11-15_session/VIDEO_NOTES.md)

## Licence + privacy
- Licence triage used on gx: police-release reposts = AMBER OK; clip with "for licensing contact" line from the filmer = GREEN own upload; "Crime Control News"-style news repost channels = doubtful, out of intro; fair-use disclaimer only = OK (src: docs/ai-state/gx-dashcam20.md)
- CC-BY sources need a credit line in description/credits: Exploring With Owen (winter, 2 sources), Tanuki photo CC BY-SA (CAMPING-8 sample), berg still CC BY-SA 4.0 (gx); Exploring With Bear had no info.json -> credit unverified; music artist names were never recorded (titles only) (src: docs/ai-state/finalize_handoff.md, finalize_survey.md, gx-dashcam20.md)

## Pipeline + farm
- Concat of parts: PPS can differ even when SPS/time base match (CRF16 vs CRF20 parts): stream-copy concat then decodes with wrong PPS. Fix = re-encode only the odd part with the farm's exact x264 options (from SEI), verified by SPS/PPS equality + PSNR (41 dB) on 120 frames; keep the rest stream copy (src: productions/gx-dashcam20/build/FULL_JOIN_HANDOFF.md)
- Farm render parts: render MUTED, CRF 20 (not 16: disk + download); 28-100 shards per case; check frame count = composition frames + 3-frame spot check vs stills sheet; ~142 min total GitHub time for 20 cases; 4-9 min render but ~30 min download per case from 60-100 part files (join on GitHub, download 1 file) (src: productions/gx-dashcam20/build/FULL_VIDEO_BRIEF.md, ERRORS_AND_MISTAKES.md)
- Farm run failed because VO wavs were missing in the case's public dir (404); add an asset-list check before every farm run (src: ERRORS_AND_MISTAKES.md #12, FULL_VIDEO_BRIEF.md)
- Join stage design that worked: stages partqc -> audio -> video -> qc -> derive(share, phone only if C: stays >= 10 GB) -> files; consume-mode deletes parts only after QC PASS and only with an owner env flag; never run two partqc/wait jobs at once (src: productions/gx-dashcam20/build/FULL_JOIN_HANDOFF.md)
- ffprobe nb_frames prints a trailing comma ("7112,") which broke a frame counter; strip it (src: productions/gx-dashcam20/build/FULL_JOIN_HANDOFF.md)
- Watchdog loop guards used overnight: max 4 agents per case/job (then mark BLOCKED), same error twice -> change approach, render max 2 restarts, no progress in 60 min -> stop and start one successor, delete the cron when all done/BLOCKED; each check is cheap (grep status lines, df -h) (src: productions/gx-dashcam20/build/WATCHDOG.md)
- Case-farm "task" job measured (2026-11-16): fixed overhead ~60-75 s per run (PC plan 4-6, Drive step 14-20, dispatch 4, queue 3-4 (17 for 3 machines), setup 10-23, fetch 4-10, results 6-7); cloud wins for long/parallel items (Whisper ROTA 0-235 s: cloud 77 s vs laptop 167 s; 3-machine split of 180 s: 93 s wall vs 48 s unsplit laptop); a single short encode/track is slower than the 16-core laptop (case11 encode 177-230 s vs 104 s); venv cache saves only ~6 s on Windows (src: docs/ai-state/case-farm-tasks-handoff.md)
- Whisper on GitHub: pip pins faster-whisper 1.0.3, ctranslate2 4.8.1, av 12.3.0, tokenizers 0.23.1, onnxruntime 1.28.0, numpy 2.5.3, requests 2.34.2, huggingface_hub 1.26.1 (faster-whisper imports requests undeclared); split speech 60 s per machine gave 99.5% text match, 0.019 s mean start diff; near-silent audio hallucinates differently so it is no correctness test (src: docs/ai-state/case-farm-tasks-handoff.md)
- Farm-task bugs found by real tests (all fixed with regression tests): bash escapes inside [...] regex are literal; place/run must create cwd root when all inputs live outside it; os.replace fails across drives (WinError 17) on a Windows runner (checkout D:, PC paths C:); du under-reports on Windows (report fetched MB from file sizes) (src: docs/ai-state/case-farm-tasks-handoff.md)
- Full farm-abyssal 52 jobs: 613 s wall; Drive upload 961 MB took 348 s once vs 16-21 s normally = that runner/Drive, not code; farm.yml now logs DELIVER_RETRIES (src: docs/ai-state/HANDOFF-github-farm-2026-11-16.md)
- Windows backup zips: zip of STYLE guide (77,422 files 40.8 GB) and GITHUB (18,110 files, 20.9 GB) to Drive; junctions are NOT followed (listed in _JUNCTIONS_NOT_FOLLOWED.txt); folders with junctions must be unlinked with cmd rmdir before deleting; folders held by idle Claude sessions' cwd stay locked until app restart (src: docs/ai-state/render-farm-video-merge-handoff.md)
- Two jobs started together (RenderFarmSync + CaseFarmStyleSync) raced on the rclone token refresh; run alone (src: docs/ai-state/render-farm-video-merge-handoff.md)
- CI symlink tests skip on Windows; default chunk border is 0.25 s not 1 s (src: docs/ai-state/render-farm-video-merge-handoff.md)
- Never write .py/.edl files with PowerShell Set-Content (BOM + mojibake); use Bash/Python (src: docs/ai-state/case1_render_handoff.md)
- GPU NVENC has few encoder sessions shared by all agents: max 2 parallel ffmpeg encodes per agent, retry a shot that fails with an encoder/session error (src: docs/ai-state/van_case_brief.md; partly in FARRELL guide rule 49)
- Hung Whisper window (>30 min CPU loop, could not kill): redo that window as a separate run and merge (src: docs/ai-state/case3_render_handoff.md)
- Hard-linked finals (~/Downloads copy + 05_render copy, link count 2): deleting one frees no space (src: docs/ai-state/finalize_survey.md)
- ZeroDivisionError in Ev.env lin() on zero-length xin/xout window: treat zero window as a step (src: docs/ai-state/van_full_plan.md)
- PC specs for planning: 16 threads, 32 GB RAM, RTX A2000 (NVENC h264_nvenc ok), Remotion --concurrency 12, --gl=angle (src: docs/ai-state/gx-dashcam20.md, WATCHDOG.md)
- Agent briefs: agents stop ~150k context; save status line after each step so a fresh agent continues from the handoff; common.py pointed at the winter W folder so van scripts had to override W (src: docs/ai-state/van_case_brief.md)

## Mistakes (root causes) not in pipeline-lessons
- Concat stretched every case 5.86x: head part tb 1/15360 vs 1/90000 (in lessons) AND PPS mismatch (above)
- 1322-2069 remotion-*assets* temp folders = 43.5 GB (in lessons). Fix detail: delete with PowerShell -like (not -Filter), older than 20 min
- c16 fix agent's cleanup deleted part of %TEMP% (in lessons as TEMP RULE)

## More learnings (gx-dashcam-s10, gx-dashcam-t10; checked by grep, 0-1 hits in kept knowledge)
### Editing
- Algrow voice measured 3.67 words/s (not ~2.6): size scripts at 3.67 w/s (1,408 words = 442.8 s VO for a 10-min sample); close remaining gaps at raw edges, never by padding pauses (src: productions/gx-dashcam-s10/DECISIONS.md A2-1)
- Short-source case (61 s of footage): fill with graded freezes/crops/speeds + page + map, never loop a window (src: DECISIONS.md A2)
- Case openers must differ (cabin close, map first, tight road crop, wide still); slowed replays only where the moment is real (C02 bus hold, C04 blast hold), other cases normal-speed punch-in (src: DECISIONS.md B8)
- Anchor-driven shots can come out < 3 s (34-41 f): extend from the neighbouring same-source shot instead of touching VO (src: productions/gx-dashcam-s10/STATUS.md B4/B8)
- Compiler slowing short clips to half speed made sluggish shots; playing more of the clip cut slowed shots 39 -> 5 (src: productions/gx-dashcam-t10/TIMING_REPORT.md bug 5)
- Crops of dashcam footage must keep bottom edge <= ~0.86-0.88 of height so a burned vendor strip (BLACKVUE) never shows; SPX is 4:3 pillarboxed in 16:9 -> read with crop (960,720,160,0); DJI overlay crop 1776x999 @72,0 (src: DECISIONS.md B8, STATUS.md B1)
- Hand-key blur runs (2) on top of Haar for crowd faces; Haar is best effort (misses + false blobs); verify per frame (src: STATUS.md B4/B8)
### Audio
- VO takes with spiky peaks (premix +10 dBTP) need ~19 clip-gain regions before the limiter; master -16.1 LUFS / -1.8 dBTP; bed 17-17.5 LU under VO; longest < -50 dB run 0.4 s; raws -17 LUFS (C02-R2 -23); raw tail ramps to ~-24 LUFS-eq under next VO; 5 f fades; bleeps = 1 kHz tone at keyed times (src: STATUS.md B5)
- Place a music track so its silent break does not land on a replay hold (end-aligned 39.4 s put the break on the C04 hold) (src: STATUS.md B5)
- Whisper hallucinates "Thanks for watching." in trailing silence (c02_02 at 0.43 s); diff takes vs script, only number/spelling forms differ (src: STATUS.md A2 3)
- Only 2 new Epidemic SFX via MCP (low boom on card starts, soft whoosh on dips) for a 10-min sample (src: DECISIONS.md B3)
### Captions + delivery
- Unsure raw speech: run farm Whisper twice (different spans), caption only words both passes agree on ("them/him" disagreed -> dropped); leave a name out (src: STATUS.md B5 1)
- Fonts for farm repo: use OFL fonts (Bebas Neue titles, JetBrains Mono captions/small text); Consolas/Lucida not copied into public repo for licence; banned look = typewriter Courier captions (src: DECISIONS.md B1)
### Licence + privacy
- Page capture method: headless Edge/Playwright at 1920 css px, 2x, DOM getClientRects per word -> exact highlight boxes in png px (words.json), no Wayback needed; blur unrelated faces, thumbnails, recommended column, comments, avatars, ads, donate banners, promo rows with soft gaussian sigma 10-30; keep the unblurred raw in assets/pages/_raw and never use it; keep a BLUR_LOG per page (src: productions/gx-dashcam-s10/assets/pages/BLUR_LOG.md, STATUS.md D 1-2)
- Age-restriction check table per case (window / sensitive item / handling), verdict LOW when no injury, no gore, swears bleeped (src: productions/gx-dashcam-s10/qa/AGE_CHECK.md)
- Unsourced facts from old VO (distances, vehicle models, dates, "about an hour") dropped; say "a Friday night in December 2025"; no names of unverified claims, police chief's name left out (src: DECISIONS.md A4, STATUS.md B5)
- Blur boxes are OUTPUT pixels, not source pixels: Romania/MTPD plate+faces were visible because keys were in the wrong frame; always verify blur on the rendered frame (src: productions/gx-dashcam-t10/TIMING_REPORT.md)
### Pipeline + farm (t10 fast-pipeline test, measured)
- 10-min video from scratch: scripts 2:51 (5 agents), clip-cut scan 1:26 + face scan ~1:30 (GitHub 5 machines), voice 18 clips 37+7 s, Whisper 18 machines 1:28, edit 6 agents 3:26, rule check+compile ~1 s, stills 6 machines 3:23, farm render 85 chunks 5:06, QC+phone ~4 min; edit+code ~5:10 (goal < 10 min met); clean-run estimate ~22 min; real wall ~85 min because 9 bugs found (src: productions/gx-dashcam-t10/TIMING_REPORT.md)
- Bugs and root causes: farm render/sound jobs died silently when no build file used Windows fonts; render machines have no voice WAVs -> sample timeline reads saved vo_dur.json; sound job needs TIMELINE_PLAN.md synced; unpinned OpenCV/Whisper broke on GitHub (pin); wrong music file names only failed on the farm (rule checker now checks files exist); stale timeline sent to farm (staging always recompiles first); rule checker crashed while other agents were still writing (skip unwritten cases); agent shell lines caused "Allow?" pop-ups (agents may run only 2 exact commands) (src: TIMING_REPORT.md)
- Pages+map tiles on GitHub 4 machines 155 s; map clips on PC: 481 s on one core -> 141 s on 14 processes; render with map clips 12.9 min (5.8 min was one-time Drive clean-up of old tiles); staged files 3,710 tiles -> 48 clips; phone copy 2.9 min, 28.5 MiB (src: TIMING_REPORT.md update 13:58)
- Parallel map parts joined with stream copy started 1 frame late in players; parts now lossless and joined with one encode; test tools/autoedit/tests/test_map_segments.py (src: TIMING_REPORT.md)
- Agents start ~2 s apart, so 48 agents need ~1.6 min just to start (src: TIMING_REPORT.md) [agent cap 20 itself already in memory]
- Farm sync note: sync the project to farm dir with hardlinks for sources/music + copy farm_contract.py; farm plan check = frames = range, framemd5 match (src: productions/gx-dashcam-s10/STATUS.md B2/B3/B6)
- EOX Sentinel-2 tiles cached z5-14 11x7 block; map_eox zoom must be <= cached zoom; no z12+ tiles for some places (c03) -> zooms (8,11); parent-tile fill + CLAHE grade + pin at 40% fixed black maps (src: STATUS.md B4/B7/D3)
- Pexels-licence free stock (no attribution required) logged per file with page URL + creator in free_sources.md (src: case-work/abyssal-01/sources/free_sources.md)

## KEEP AS-IS (reusable, check before delete)
- productions/gx-dashcam-t10/TIMING_REPORT.md + TIMING.json: measured pipeline times and bug list (but content above is now captured; keep only if the owner wants raw numbers).
- productions/gx-dashcam-s10/build/{kit.py,timeline.py,build.py,audio.py,farm_entry.py,sync_farm.py,qc_render.py} and build/tools/{d_pages.py,d_maps.py,d_blur.py}: working reference implementation of a farm-ready gx timeline (layout for tools/autoedit engine was regenerated from the "best production build" via tools/autoedit/regen_engine.py <production>/build -- CHECK which production regen_engine.py defaults to before deleting s10/t10; do not delete the one it reads).
- productions/gx-dashcam-s10/qa/AGE_CHECK.md and assets/pages/BLUR_LOG.md: templates (table format) for the privacy/age check.
- productions/gx-dashcam-s10/assets/pages/*_words.json format: only as example of page highlight boxes (schema is in tools/autoedit/schema.md already).
- case-work/_style/ (cache.json, config.json, current.json, projects/coc2h-vol1.json, style_sync.py, sync.log): STATE for the CaseFarmStyleSync scheduled task (tools/case-farm/farm/style_sync.py state_dir defaults to <root>/case-work/_style). Deleting resets the sync cache (full re-sync) -> keep or expect a one-time re-sync.
- case-work/renders/farm-abyssal_intro_case01_farm_2026-11-16_07-45-08.mp4 (+ abyssal-01/renders): sample render output only, not needed by tools.
- case-work/abyssal-01 text (cutsheet.md, vo.md, credits.txt, shotlist_v4.md, sources/free_sources.md): project source text for the Abyssal case 01; learnings only, delete after the learnings above are filed.
- docs/ai-state/coc2h-vol1_TIMELINE.md: excluded from scope (kept).

## DEPENDENCIES (paths pointing INTO productions/ or case-work/)
- tools/ and hf-engine/{build.mjs,lib,devices}: NO references to productions/van-camping-encounters, winter-camping-encounters, gx-dashcam20, gx-dashcam-s10 or gx-dashcam-t10 (rg over tools + hf-engine returned only the tools/cloud-render/guide mirror, which is a generated git clone copy of this folder, not a dependency).
- Generic dependency on the folder case-work/ (work folder, auto-created: FARM_WORK env or <root>/case-work): tools/case-farm/farm.sh (renders -> case-work/renders), task.sh, farm/task.py, tasks/whisper.py (case-work/_task/whisper/...), tools/autoedit/run_all.sh (WORK=$ROOT/case-work), tools/case-farm/farm/style_sync.py (state case-work/_style). Safe to delete the project subfolders (abyssal-01, renders); keep or recreate case-work/ and case-work/_style/. coc2h-vol1 is out of scope.
- Docs only (text mentions, not code): tools/autoedit/LEAD_RUNBOOK.md (case-work/farm-<slug>), CASE_AGENT_PROMPT_TEMPLATE.md; tools/autoedit/regen_engine.py takes "<best production>/build" as an argument (check which production was last used: likely a gx-dashcam-* build) -- not path-hardcoded in the files grepped.
- styleguide/gx-admixdd/hf-engine/v8_stills/FPS60.md mentions case-work paths (text only).
