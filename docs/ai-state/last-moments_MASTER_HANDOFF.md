# last-moments MASTER HANDOFF (2026-11-19) - read this first

One file to continue this project from any account or session. Newer than every other `last-moments_*` handoff.
Older detail: `last-moments_HANDOFF.md`, `last-moments_v6_HANDOFF.md` (+ "v7 done"), `last-moments_v7_media_HANDOFF.md`.

## 1. Job
Video "Most Disturbing Last Moment Footage Ever Recorded" (21 cases), new horror channel. Style = Abyssal Detective (latest 5 videos)
+ our own look. First deliverable = intro + case 1, shown as a LIVE preview in Final Phase Lite (no render). After the owner says OK:
one full render on GitHub (farm). Then cases 2-21 the same way.

## 2. Where things are (root = `C:\Users\ayush\Videos\CLAUDE\render farm video`)
- Script: `C:\Users\ayush\Downloads\Most Disturbing Last Moment Footage Ever Recorded cut sheet.md` (+ `... VO only.md`).
- Engine: `styleguide/gx-admixdd/hf-engine` (HyperFrames, 60 fps). Parts: `lm_intro` (59.04 s), `lm_case01a` (185.85 s),
  `lm_case01b` (309 s). Source = `cases/<id>.mjs`; `parts/<id>/` is generated (never edit). Media = `hf-engine/media/last-moments/`.
- Devices: `devices/lm.mjs` (base, Grade, Credit `inset`), `lm_v2.mjs` (Warning2, GlitchOut2, TitleType, FloatBg/FloatCard),
  `lm_pro.mjs` (Article3D, StampRing = clean pill, PlaceText pos 'c', TextFade), `lm_mg.mjs` (Timeline, Counter, RouteMap,
  CCTVAnalyse, DocStack, Parallax), `lm_c01a.mjs`, `lm_c01b.mjs`.
- Production folder: `productions/last-moments/` (sources `sources/conf/*.mp4`, VO `vo/`, pages `assets/pages/`,
  licences `assets/MEDIA_LOG.md`, build scripts `build/`, QA sheets `edit/qa/`).
- Refs study: `productions/_abyssal-ref/latest5/SUMMARY.md` (+ `<id>/CATALOG.md`).
- Owner taste notes: memory file `_topic-abyssal-edit-feedback.md` (copy of the rules is in section 4 below).

## 3. Commands (run in `styleguide/gx-admixdd/hf-engine`, Git Bash)
- Build a part: `node build.mjs lm_case01b` (must exit 0). Check: `npx hyperframes check parts/lm_case01b` (0 errors).
- Frames: `npx hyperframes snapshot parts/<id> -o <dir> --no-end --at 12.5,40.0` then view `<dir>/contact-sheet.jpg`.
- Live preview: `bash tools/case-build/preview.sh lm_intro,lm_case01a,lm_case01b --no-open --port 4848` (from root;
  `.claude/launch.json` config "last-moments-preview"). Window = Final Phase Lite, reloads by itself after a build.
- Repeat scan: `node productions/last-moments/build/repeat_scan.mjs styleguide/gx-admixdd/hf-engine lm_intro lm_case01a lm_case01b`
  (from root; must say "visible repeats: 0").
- Real article page capture (PC): `python tools/autoedit/assets/gh_assets.py "page|<cid>|<id>|productions/last-moments/edit|productions/last-moments"`
  after adding the page to `productions/last-moments/edit/assets.json`.
- Voice: Algrow voice "new" (`tools/algrow-voice/algrow_voice.py`, id default-pd4i7bs8z6-qjsqmqbjlxg__new-9fcmr,
  `--temperature 2 --speaking-rate 1`). Key is in `tools/algrow-voice/.env` - never print it.
- Render (only after owner OK): GitHub farm, `tools/case-farm/` (see its README), `bash tools/autoedit/run_all.sh ...`.

## 4. Owner rules for this video (all confirmed)
- Glitch transition ONLY on the warning exit (with glitch SFX). Montage of "different clips" = clips floating up over a blurred
  background, smooth, then dip to black; second list = plain hard cuts.
- ONE title screen per case: "CASE N" + title below, typewriter, VCR OSD Mono font. Typewriter only on title screens; all other
  text fades in with a click SFX.
- Name labels max 2 per case, plain text, always inside the picture. Places + minor names = centred text.
- CCTV stamp highlight = clean even red pill/oval hugging the text, never rough, never off the picture.
- Narration cites a source -> show that real article (byline visible, key line marked). Articles cover the whole frame.
- No photo / clip / article used twice in the video. Stock: free licence only, ILLUSTRATIVE label, colour grade like the raws
  (never B&W), as little as possible; prefer motion graphics and real photos (Geograph CC BY-SA 2.0, Commons, Pexels).
- Mix: narration 100 %, music 75 %, all SFX 60 % (`mixScale()` in each case file, on top of the levelled mix). No abrupt cuts.
- Faces of victims / private people blurred (Mosaic). Met Police CCTV allowed with "FOOTAGE: METROPOLITAN POLICE" credit.
- Intro must match the narration word for word. No zoom onto case 01 in the case list.
- Owner works hands-off: finish end to end, check frames yourself, report in plain short English.

## 5. State now (2026-11-19, all 3 parts build + check 0 errors, repeat scan 0)
- Intro v5: warning glitch only; floating cards (dive, stream, vlog) + dip to HCR doorway; hard cuts CRV / CGF / WED; conveyor C
  unchanged; title plate = `c01a/thames_night.jpg`.
- Case 1 v6/v7: labels/places fixed, pill rings, Duncan Campbell article (The Register 3 May 2012, S18/S19), 36 shots got new
  Geograph photos / cards (list in `last-moments_v7_media_HANDOFF.md`), stock 01a ~6 %, 01b ~19 %.
- Backups: `*.bak_v5/v6/v7` next to the case and device files.

## 6. Open / next
1. Owner must OK: (a) the RAD (Kalamazoo County release) and WED (Kent police documentary) clips used in the intro; (b) the
   preview, then the full render.
2. After OK: full render on GitHub farm; then measure loudness (true peak may reach -0.3 dBTP: add a limiter) and send.
3. Upload new media to the private Drive (farm needs it): `sfx/lm_glitch_s.wav`, `vo/c00.wav`, all new `photos/*` and
   `c01a/gchq_entrance.jpg`, `c01a/thames_night.jpg`, `pages/c01a_reg1.jpg`, `pages/c01a_reg2.jpg`.
4. Final Phase Lite notes chat needs the owner's CLI login: `tools/final-phase-lite/login_clean.ps1` (owner step).
5. `styleguide/abyssal/abyssal.json` Learnings update is blocked by 8 invalid statuses - fix the statuses, then save the rules above.
6. Small: two 2010-13 shots use photos of the 2016+ New Scotland Yard (B19, B52); some Geograph photos are only 640 px.
7. Then cases 2-21 (21 cases total): same pipeline, same rules, VO per case, sources downloaded on the PC (YouTube blocks GitHub).

## 7. Notes for a new account
- This folder (text/code only) syncs every 15 min to the public GitHub repo `kumai007/STYLE-GUIDE`. Media (video, photos, VO, SFX)
  is NOT in git: it lives on this PC and the private Drive. A different PC needs that media first.
- Main knowledge base K = `C:\Users\ayush\Downloads\404_Rendrer_KNOWLEDGE\404 Rendrer` (tools, SFX, QA). Read the project
  `CLAUDE.md` rule order before work. Never print `.env` files or keys.

## 8. Render done (2026-11-22, on this PC: GitHub farm account DeZAYU hidden by GitHub, dispatch HTTP 500)
- Local render: `case-work/renders/lm/render_all.sh` (npx hyperframes render per part; 520 / 1165 / 1729 s), concat -c copy,
  `tools/case-build/master_loudness.sh` -> -16.1 LUFS, TP -1.8 dBTP. No silence > 2 s, QC sheet OK.
- Deliverable: `case-work/renders/lm/last_moments_intro_case1_master.mp4` (553.9 s, 1080p60, 644 MB);
  phone copy `..._phone.mp4` (720p30, 28.7 MiB).
- Next: cases 2-21 (not built). Farm is down: render locally the same way until GitHub restores DeZAYU.

## 9. Cases 2-21 in progress (2026-11-23, all on this PC; owner: "do all the video")
- VO: all 98 lines made (`vo/lines_c02_21.csv`, ids cNN_pMM, outro c99_p01) -> `build/vo_prep_rest.py` (faster-whisper + filler cut) -> `vo/cut/`.
- Sources: `build/conform_local.py` (sources/dl -> media + `sources/_sheets/<TAG>.jpg`). Age-locked on YouTube (need sign-in): NCH (c10),
  EMH (c13), AGH (c17) - builders look for public copies (AGH: NDTV f1kR-ohxJYY).
- Template: `hf-engine/cases/lm_lib.mjs` (makeCase + H helpers, auto title screen, mix 100/75/60, raws) + `devices/lm_cases.mjs` (CaseTitle).
  Music sets: `media/last-moments/music/sets.json` (8 Epidemic tracks). Timeline: `build/case_skeleton.py NN` -> `edit/skel/cNN.json`.
  Media tools: `build/commons_search.py`, `build/eox_map.py`, `build/art_crop.py`.
- Builders: one agent per case, brief `docs/ai-state/last-moments_CASE_BUILDER_BRIEF.md`; notes in `productions/last-moments/edit/notes/cNN.md`.
- Render: `case-work/renders/lm/render_queue.sh` (append part ids to queue.txt; touch queue.done to finish). Then concat all parts +
  master_loudness + phone copy.

### Lead notes 2026-11-23 (RTX + QC)
- Renders: `case-work/renders/lm/render_queue_gpu.sh` (queue_gpu.txt, --gpu NVENC; Chrome on the RTX via Windows GPU preference). Old CPU queue stopped after lm_case02.
- QC TODO before the final join: snapshots seek late, so every keyed-blur raw (c03 fan, c19 customers, c20 raw 1, c11, others) must be checked on frames from the RENDERED part mp4.
- c20 raw 1 blur keys re-measured by lead on true frames (`case-work/lm_scratch/c20/fix_mos1.py`).

### Lead QC 2026-11-23 (c09)
- c09 raw 1 + S32 freeze started at RAD 1.0: web-player play button, cursor and seek bar visible (source 1-3.6). Now RAD 3.8 (`if (j === 0) o.t = 3.8`). Backup `lm_case09.mjs.bak_lead`. Re-render queued; old render `lm_case09.v1.mp4` (delete after the new one passes).
- c03, c12, c14 passed QC from rendered parts.
- c15: companion face unblurred at part 95.95 (src 8.15-9.45), plus left man 8.5-9.9, mask woman 30.9-31.7 and 36.9-37.7: 4 new MOS tracks (backup `lm_case15.mjs.bak_lead`), checked with red-outline `check_keys.py`. Re-render queued; old `lm_case15.v1.mp4`.
- c17: static blur boxes too small for the phone-filmed source (son face clear at part 92.2 / 126.3): widened to son [490,80,250,320], red [240,0,250,300], checked on AGH 0.3-13.5. Raw 1 showed the web player bar (AGH 2.6-3.8): now t 3.85, speed 0.63. Backup `lm_case17.mjs.bak_lead`. Re-render queued; old `lm_case17.v1.mp4`.
- c09 and c15 re-renders passed (full-size frame check for c15).
- c19 (lead QC 2026-11-23): render 1 failed QC (woman in pink unblurred file 63.9-65.6 and at raw 4 start 88-90; cyan web-player seek bar at file 2.0-3.1 and 6.7-7.9 in raw 1). Fixed: raw 3 keys re-done on true frames, raw 4 box added, raw 1 split (file 3.3-6.6 + 8.0-26.0, speed 0.887). Check 0 errors. Backup cases/lm_case19.mjs.bak_lead; old render lm_case19.v1.mp4 (delete after the re-render passes).
- c19 re-render PASSED (both customers blurred, no player bar); v1 deleted.
- c20 (lead QC 2026-11-24): raws OK (pump bystanders blurred, plates too small; raws 2-4 = Matthew, subject, no cue). B-roll A05 (part 27.9-31.2, TWR src 243.5-247.4) showed a readable BC plate: keyed plate boxes added (backup cases/lm_case20.mjs.bak_lead), check 0 errors, re-render queued (old render lm_case20.v1.mp4). Other footage shots: front views only (no BC front plates).
- c11 (lead QC 2026-11-24): render 1 failed (plate band y 150-650 missed a scooter plate at y ~650-930 in raw 5 and car plates at the bottom corners). Band for raws 3-6 + POV b-roll is now { r:[0,120,1920,830] } + bottom corners { r:[0,950,560,130] }, { r:[1360,950,560,130] } (only the gauges stay clear). Backup cases/lm_case11.mjs.bak_lead; check 0 errors; re-render queued (old lm_case11.v1.mp4).
- Final join: case-work/renders/lm/final_join.py (join with NVENC re-encode because parts mix High/Main profiles, then master_loudness, then phone teaser < 30 MiB).
- c20 re-render PASSED (plates pixelated 28-31 s); v1 deleted.
- 2026-11-24 c11 v2 render (24361 fr, 7395 s, try 3). QC: raws + POV b-roll blurred, BUT S03 freeze (part 16.5-19.7) unblurred: `H.frz` ignores `mos` (lm_lib). Fixed in the render only: ffmpeg pixelate (//24) of y 60-940 + bottom corners on frames 990-1181, NVENC cq16 -> `lm_case11.mp4`; unpatched render kept as `lm_case11.v2_nofrzblur.mp4`. If c11 is ever rebuilt: replace S03 `H.frz` with a still + mos or redo this patch.
