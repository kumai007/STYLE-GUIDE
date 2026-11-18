# HANDOFF: state of the Iceberg build (2 Nov 2026, ~19:40). Read this first in a new session.

Owner: Ekam (aventadortg). Ordered: build the FULL Tornado (03), Natural Disasters (01) and Theme Park (02) videos overnight.
Workplace (04) not started. All rules: `Iceberg/CLAUDE.md` + `_kit/CASE_BUILD_GUIDE.md` (the agents' brief) + memory files
(`feedback-iceberg-*`, `project-iceberg-separate`). Do NOT touch the 404 project.

## Owner rules added tonight (all in CASE_BUILD_GUIDE.md)
- Style fixed (TitleCard on own footage, RedLabel, white-box Aerial, glitch/blur-dip, footage-first, Epidemic ambient Music 1/3/4/5
  ~10 LU under VO). Devices MUST vary per case: new device per case, no reuse within ±3 cases, Blender/3-D/Visual-Venture ok.
  Registry: `_engine/src/dev/REGISTRY.md`. VO:raw ratio as built is approved.
- Raws follow the cut sheet's ▶ RAW cues (position + order), trim only dead air.
- EVERY raw's audio through `_tools/rawclean.py` (venv `_tools/.audvenv`; AST music detection + Demucs, keeps voices/impacts) —
  never the clip's own track (copyright music). Blur injured/bodies/nudity in raws.
- Download permission: case footage from small personal channels only; never TV/agency/big creators/competitors.

## Pipeline (per case KEY = TOR07 / ND12 / TP03; 00 = intro, 99 = outro)
- `_tools/newcase.sh <VID> <NN>` → build/CASEnn, isolated public dir `_engine/pubs/<KEY>`, code `_engine/src/cases/<KEY>.tsx`,
  entry `_engine/src/entries/<KEY>.tsx`.
- `_tools/render_case.sh <KEY> [allow]` → queued (3 slots, C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/render_slots), cutcheck, master −16 LUFS,
  `out/<KEY>.mp4` + `<KEY>_phone.mp4`. `--still <sec> out.png` for a check frame.
- `_tools/render_pending.sh` runs under nohup (survives Claude): renders any case whose code is newer than its master and
  hasn't been edited for 15 min. Log `_tools/render_pending.log`. Check: `pgrep -fl render_pending`; restart with
  `nohup _tools/render_pending.sh >/dev/null 2>&1 &`.
- `_tools/assemble.sh TOR|ND|TP` → `<video>/build/<VID>_FULL.mp4` (00, cases in order, 99; lists missing).

## Status at handoff (masters in build/CASEnn/out/<KEY>.mp4)
Done AFTER the music-clean rule (final): TOR 00 03 12 13 14 23 24 99 · ND 04 10 16 99 · TP 02 04 12 15
Done BEFORE it (need raw audio swapped to rawclean + re-render; agents were doing this): TOR 01 02 09 10 15 18 19 25 ·
ND 08 13 14 18 · TP 01 07 10 11  (TOR01 Fairdale = `src/TorC01v5.tsx`, TOR02 Joplin = `src/cases/TOR02.tsx`; port TOR01 to
cases/ layout to re-render.)
In progress (code + grades exist, check each case's NOTES.md / code): TOR 04-08 11 16 17 20 21 22 · ND 00 01-03 05-07 09 11 12 15
17 19 · TP 03 05 06 08 09 13 14.
NOT STARTED (no agent ever ran): TP 16 17 18 19 20 21 22 23 24 25 + TP00 intro + TP99 outro.

## How to continue in a new session
1. `pgrep -fl "render_pending|remotion"` — renders may still be going. Re-run the status loop:
   `for c in */build/CASE*/out; do ls $c/*.mp4; done` vs this list.
2. Spawn case agents (general-purpose, ≤ 20 at once) with the brief: "read `_kit/CASE_BUILD_GUIDE.md` and follow it; your cases:
   <VID> <NN…>; check the disk for what's done; finish the rest; the owner expects finished, unique, non-templated cases."
   Priorities: (a) in-progress cases above, (b) pre-music-clean re-renders, (c) TP 16-25 + intro/outro.
3. When a video's pieces all exist: `_tools/assemble.sh <VID>`, phone copy ≤ 30 MB, send to owner.

## Memory notes (added 02 Nov 20:14)
The owner's Iceberg rules learned in chat are copied to `_kit/RULES/owner_memory/*.md` (originals in the 404-thread project memory). A session started from another folder won't auto-load them, so read them first.

## Longer raws without re-rendering (3 Nov): `_tools/raw_extend.py <KEY> [--dry]` (run with `_tools/.venv/bin/python`)
Splices a longer stretch of the same source clip into a finished master at each raw < 6 s (→ 8 s) and the main raw if < 10 s (→ 14 s); same clip on, then a 0.5× replay of the key moment if the clip runs out; same framing/grade/grain, rawcleaned sound, bed fades ≥ 0.3 s, −16 LUFS, cutcheck, phone copy; backup `out/<KEY>_pre_extend.mp4` (always the input), log `out/<KEY>_extend.json`. Usage + options at the top of the script.
Done 3 Nov: TOR15 (raw 4.6→8.9 s), TOR18 (raw 3→8 s), TOR19 (main 8.3→14 s); TOR01/06/07/14/17/22 checked: nothing short. ND00 (5.6→14 s), ND04 done. Re-run `--dry` after any case re-render; check stills in `C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/raw_extend/<KEY>/`.

## DONE 3 Nov 2026 ~04:20: all three videos delivered
- Full masters: `03_Tornado/build/TOR_FULL.mp4` (71:30), `01_Natural_Disasters/build/ND_FULL.mp4` (76:41), `02_Theme_Park/build/TP_FULL.mp4` (62:01),
  each with a `_FULL_phone.mp4` (540p). Picture and sound in sync (checked), −16 LUFS.
- Owner rules applied to every case: long raws (main 10–25 s, others ≥ 6 s; older cases spliced with `_tools/raw_extend.py`), the VO never split
  mid-sentence, each device once, cases end on the last line. TP20 is the owner-approved reference case.
- `_tools/assemble.sh` was rewritten: per-piece timebase normalise plus audio cut to each piece's exact video length (no drift).
  Never run two copies of it on the same video at once (they share a temp dir).
- Known: TOR06 and ND04 have dark stretches that are real footage (inside a house at night, fires at night). TP17 uses a clip from a small
  channel that reposts a rider's TikTok. TP18 needs still-photo credits in the description. Workplace (04) not started.

## 3 Nov 2026: intros rebuilt with no raw (owner: "no raw in intro, just VO with 3D motion or clip")
TOR00, ND00, TP00 recoded from the case code (not the spliced ND00 master): VO continuous over silent case footage under the music, title +
glitch/blur-dip kept. Old cold-open code: `_engine/_bak_intro_raw/`. Rule added to CASE_BUILD_GUIDE.md and feedback-iceberg-longer-raws.md.
Then (owner: "looks pretty good", wants 3-D motion showing many cases) each intro got one 3-D device: TOR00 PinSweep (US map pins),
ND00 GlobeRun (globe + case cards), TP00 CaseWall (25-card wall); TOR "A few were there on purpose" = STORM CHASERS (Greenfield chase car),
"Most of them weren't" = the Ocala semi. Card frames: `build/CASE00/graded/cards/`. Lead assembles the FULL videos (not done here).

## 3 Nov 2026 ~08:30: intros final approach = 3-D clip field (owner approved TOR00: "ok looks good")
TOR00/ND00/TP00 rebuilt on `dev/TOR00_ClipField.tsx` + `dev/ClipFieldKit.ts` (map/globe/wall versions dropped, code in `_engine/_bak_intro_raw/`).
The TOR00 the owner saw = `03_Tornado/build/CASE00/out/TOR00_v4_0717.mp4`; current TOR00.mp4 is the same design with slower, smoother moves.
`remotion.config.ts` now sets a 180 s delayRender timeout (heavy 3-D frames on a busy machine). Lead assembles the FULL videos.

## 3 Nov 2026: ND raw audit (owner: raws ONLY at incident moments) + new document devices
Rule in CASE_BUILD_GUIDE.md (end). Re-cut and re-rendered (raws before → after): ND01 12→6, ND02 6→5, ND04 15→4, ND05 8→3, ND07 12→4, ND09 10→4,
ND10 12→2, ND11 7→4, ND12 8→4, ND13 9→4, ND15 9→4, ND16 5→3, ND17 10→3; ND14 re-rendered for its device only. Passed untouched: ND03 06 08 18 19.
Shared page templates replaced by case devices: ND01 WarningFax, ND14 DrumTrace, ND15 AdvisoryTerminal (REGISTRY.md). Insets ≤ 1 per case
(ND01 marker, ND04 Kamaishi, ND10 Chikyu now full-frame pushes). Cutcheck: remaining flags are source motion inside shots (ND01 10 fps
camera, phone/handheld raws, fire flicker, slow replays) or dark-to-dark hard cuts (ND07 103.8 s, ND15 12.9 s). ND_FULL NOT yet re-assembled:
run `_tools/assemble.sh ND` once ND00 (other agent) is done.

## 3 Nov 2026 (~10:00): Theme Park raw audit (owner rule: raws only at incident moments) + template purge
Re-rendered: TP02 03 04 05 06 07 08 10 12 13 14 15 18 19 20(insets only) 22 24 25, plus TP09/TP11 (new devices only). Untouched: TP01 16 17 21 23.
Removals use `_engine/src/lib/core/cutOut.tsx` (+ `_tools/apply_cutout.py`): drops VO-silent raw windows, VO runs on as one take.
New devices: TP03 BoomHours, TP04 RopeZoom, TP07 ArticlePhone + DuskDeck, TP09 ArmStop, TP11 WordFlip, TP20 SplitPair + RailView (REGISTRY.md).
TP13/TP15 raw lengths now in code (splices replaced). Re-run `_tools/assemble.sh TP` to rebuild TP_FULL.

## FINAL 3 Nov 2026 ~09:55: all three re-delivered after the audit
- TOR_FULL 60:50, ND_FULL 61:42, TP_FULL 56:11 (+ _phone), synced, −16 LUFS.
- Applied everywhere: 3-D clip-field intros (owner-approved TOR00 style; the map version was rejected); raws only at incident moments, never during
  explanation; no shared page/screenshot template reused (new per-case devices); inset-over-blur at most once per case; sharp document devices.
- Rules are in _kit/CASE_BUILD_GUIDE.md (end) and _kit/RULES/owner_memory/*.md. Workplace (04) not started.

## 3 Nov 2026 — intros made distinct
Owner: the three intros used the same 3-D rig. Kept voice, clips, labels and timing; new motion for ND00 (RingField: turning ring of
clips, opens top-down) and TP00 (WheelField: ferris wheel of clip gondolas). TOR00 unchanged (approved). ND and TP re-assembled.
Old intro code: _engine/_bak_intro_raw/*_clipfield.tsx.bak.

## 4 Nov 2026 — Workplace (WP) build in progress
Owner approved WP01 v2 ("it looks good tbh") and asked for all cases + Blender. Plan: 04_Workplace/WP_PLAN.md (50 min, cases 12 + 23
dropped). Every builder gets 04_Workplace/WP_CASE_BRIEF.md. Builders run in pairs (one fresh Opus agent per 2 cases).
Started: 02+03, 04+05, 06+07, 08+09, intro/levels/outro (WP00, WPL1-5, WP99, assemble.sh level insert).
Queue: 10+11, 13+14, 15+16, 17+18, 19+20, 21+22, 24+25, 26+27, 28+29, 30. Then `_tools/assemble.sh WP`, check ≈ 50 min, deliver.
- Done: WP02 (100.8 s), WP03 (95.4 s). Neither has a Blender shot yet (brief now requires ≥1) -> add one each + WP01 at the end. Started 10+11.
- 4 Nov: owner's Mac lagged (swap full). render_case.sh: 1 slot, concurrency 3, OffthreadVideo cache 1.5 GB; Blender only via _tools/blender_run.sh (lock, 4 threads). Keep ≤ 3 builder agents at once.
- Done: WP00 intro 'PortYard' (24.7 s), WPL1-5, WP99 outro (23.5 s, 'Thirty incidents.' cut). assemble.sh inserts levels. WP04 done.
- Done: WP08 (105.5 s, 3 Blender), WP09 (103.7 s, 2 Blender). WP09 vent-and-burn line has no footage (smoke crop).
- Done: WP04 (79.2 s), WP05 (95.8 s). Started 13+14.
- Done: WP10 (87.3 s), WP11 (103.5 s). Started 15+16.
- Done: WP06 (89.0 s), WP07 (123.3 s). Started 17+18.
- 4 Nov (2nd RAM complaint): renders + Blender now nice 20, render concurrency 2, Blender 2 threads; max 2 builder agents from now.
- 4 Nov: owner lagging again (GPU ~76%: renders use --gl=angle + Blender Metal). ALL builds PAUSED via /tmp/iceberg_pause (running jobs SIGSTOPped). Resume: rm /tmp/iceberg_pause and kill -CONT the stopped Blender/remotion/chrome-headless/ffmpeg pids.
- 4 Nov: owner 'do the work but dont fuck my mac': RESUMED. Renders now --gl=swangle (CPU, no GPU) at nice 20, concurrency 2; Blender nice 20, 2 threads, one at a time. Pause switch: touch /tmp/iceberg_pause.
- 4 Nov: owner 'do case less': ONE builder at a time now. Stopped agents 15+16 and 17+18 mid-build (their files in build/CASE15-18 + src/cases; a fresh agent continues from NOTES.md). Blender forced to --cycles-device CPU. Queue: 15+16, 17+18, 19..30 (minus 23), then Blender adds for WP01-03, assemble.
- 4 Nov (owner: 'I have to be able to write, watch YT'): _tools/idle_guard.sh runs (nohup, log /tmp/iceberg_guard.log): freezes ALL heavy build processes while the owner is active (input < 4 min) or media plays; runs them only when the Mac is idle. Restart it after a reboot: nohup _tools/idle_guard.sh > /tmp/iceberg_guard.log 2>&1 &. Off: touch /tmp/iceberg_guard_off. One builder agent at a time.
- 4 Nov: owner 'js run it, stop idle': idle_guard OFF; work runs continuously (still nice 20, CPU-only renders, 1 Blender).
- 4 Nov 08:40: owner wants it faster: render concurrency 6 (still swangle CPU, nice 20), Blender 6 threads, 3 builders.
- Done: WP15 (102.5 s), WP16 (106.3 s). Started 19+20.
- Done: WP13 (127.3 s), WP14 (122.5 s; crane Blender looks basic). Started 21+22.
- Done: WP17 (114.5 s), WP18 (124.0 s). Started 24+25. Remaining after: 26+27, 28+29, 30, Blender adds WP01-03, assemble.
- Done: WP19 (131.3 s), WP20 (89.3 s). Killed stray WP19 re-render. Started 26+27.
- Killed old _tools/render_pending.sh daemon (was queuing duplicate WP renders without allow windows). Builders render their own cases; don't restart it during WP.
- Done: WP24 (111.8 s), WP25 (87.3 s). Started 28+29. Remaining after: 30, Blender adds WP01-03, assemble.
- Done: WP26 (128.8 s), WP27 (119.5 s). Started 30. Remaining: Blender adds WP01-03, assemble.
- Done: WP21 (109.2 s), WP22 (91.0 s). Started Blender adds WP01-03. Remaining: 28,29,30 builders running; then assemble.
- Done: WP30 (144.9 s). Waiting: 28+29 builder, Blender adds WP01-03. Then assemble.
- Done: Blender adds WP01 (80.3 s), WP02 (100.8 s), WP03 (95.4 s). Waiting only on 28+29, then assemble.
- DELIVERED: WP_FULL.mp4 51:07 (35 pieces), copied to ~/Downloads/Workplace_Incidents_FULL.mp4. Phone copy sent.

## Cleanup 4 Nov (owner uploaded all 4 videos)
- Moved 203 GB of media (renders, raws, Blender frames, footage) from 0*/build and 0*/footage to ~/.Trash/Iceberg_media_2026-11-04.
- KEPT: _kit (rules, owner_memory, CASE_BUILD_GUIDE), _engine (all templates/devices/intros, REGISTRY.md), _tools, _ref, every
  NOTES.md / SOURCES.csv (credits) / plans / briefs / scripts / research / VO, Blender .py/.blend. Finals stay in ~/Downloads/*_FULL.mp4.
- A case can't be re-rendered without re-downloading its raws (URLs are in NOTES.md / SOURCES.csv).

## 13 Nov 2026 — NEW: six Old Heritage Files videos (owner: "gather all assets, give one case and intro", ~40 min each with raws)
Source: ~/Downloads/Ekam's Thumb Installer (team).zip (extracted ~/Downloads/ThumbTeam_extract). Six APPROVED outlines + scripts (approved 13 Nov
14:05): 05_Dashcam (DC, 20), 06_Before_Disasters (BD, 20), 07_Incidents (IN, 25), 08_Zoo (ZO, 12), 09_Amusement_Iceberg (AM, 20, levels),
10_Fast_Food_Iceberg (FF, 21, levels). Each folder: research/outline.md (cases, facts, handle-with-care, footage table with in/out + tier),
script/script.md (VO only, no raw cues → raws at incident moments per the guide), vo/text/<PIECE>.txt (oh_split.py), vo/raw (Stealth VO).
Their method/taste docs: _kit/oldheritage/ (playbooks/caught-on-camera.md, TASTE.md, EDIT_RULES/QA_RULES/DESIGN_RULES/PIPELINE).
- Footage: _tools/oh_links.py → footage/LINKS.csv (176 links); _tools/oh_fetch.sh (nohup, all six) → footage/cNN/ (yt ≤1080p + info.json,
  Commons files, other pages as .html), log footage/fetch.log.
- newcase.sh / assemble.sh know DC BD IN ZO AM FF. Review pieces in build: DC00 intro + DC01 (agents), VO for all pieces (agent).
- 13 Nov night: owner approved direction after DC01 v2 + AM01; build 3 videos tonight: DC, AM, IN (BD, ZO, FF later). Title styles: only the brand
  TitleCard (A) or the typewriter strike (B); case transitions to be redesigned later (owner liked Disturbing Dose's glitch + big red number).
  Brief for builders: _kit/OH_CASE_BRIEF.md. Builders: DC 02-04/05-07/08-10/11-13/14-16/17-20 + DC00/99; AM 02-04/05-07/08-10/11-13/14-16/17-20
  + AM00/99. IN (25 cases, no intro: owner's pick "open cold"; OUTRO inside CASE25) waits for footage: YouTube bot-checks this IP since ~19:50;
  _tools/oh_retry.sh retries failed downloads every 30 min (no cookies/bypass). render_case.sh: 3 slots, --gl=angle, concurrency 8 (owner asleep).
- Disturbing Dose (owner: 'peak detailing, makes it perfecto'): _tools/dd_fetch.sh (nohup) pulls 6 of his videos to _ref/DisturbingDose once YouTube's bot check clears; then analyse transitions (glitch + big red number), explanation devices, labels, sound, and write _ref/DisturbingDose/STYLE.md for the case-transition redesign and all builders.
- 20:10: owner OK'd his Chrome cookies ('use my cookies'): oh_fetch.sh / dd_fetch.sh use --cookies-from-browser chrome (cookies.txt from Oct is expired; keep it). DD videos downloaded. Running: 12 case builders DC/AM, DC00/99 + AM00/99, DD study + CaseNumberTransition + make_transitions.py + assemble.sh insert (agent), IN 01-05/06-10/11-15/16-20/21-25. When all masters exist: make_transitions.py DC/IN, assemble.sh DC/AM/IN, phone copies, deliver.

## 13 Nov 2026: case-number transitions for the countdown videos (DC, IN) — Disturbing Dose style
Measured in `_ref/DisturbingDose/STYLE.md` (+ `frames/`). Component `_engine/src/dev/CaseNumberTransition.tsx` (entry `entries/CaseT.tsx`,
assets `_engine/public/case_t/`). `_tools/make_transitions.py DC|IN [NN…] [--small] [--force] [--dry]` renders `build/CASEnn/out/<KEY>_T.mp4`
(2.5 s: datamosh from the previous piece's last frame → big glossy red nn on the case's first footage shot) once the case master exists,
re-rendering when that master or the previous one is newer. `assemble.sh` inserts `<KEY>_T.mp4` before each case. Run it for DC and IN
before assembling them. Not for AM (level entries). Demo: `_ref/CaseTransition_demo.mp4`; DC01_T.mp4 already made.
- 14 Nov ~02:10: the Read tool (image viewer) times out since ~22:37 (PreToolUse hook: host unreachable), so builders render without looking at frames. Every case rendered after that needs an eye pass when it works: contact sheets via ffmpeg tile. Done so far incl.: AM05 (1:16), AM06 (1:34), AM07 (1:38): no raws (incidents never filmed), new personal clips for AM05/06 downloaded but not cut in.
- 14 Nov ~06:00: owner approved the case-number transition ('this looks good'). Intros: match his own OHF intro mwYeratelA0 (notes _ref/IntroRef/INTRO_REF.md): portrait-panel montage over blurred copy + glitch, 'Viewer discretion is highly advised' card, black 'CASE 01' red condensed card. Agent rebuilding DC00 + AM00 (old versions backed up as *_nightroad / *_berg). Session restarted ~05:45: 12 builders resumed. Image viewer works again.
- 14 Nov ~14:00: DELIVERED 3 videos: AM_FULL (34:00, 22 pieces), DC_FULL (41:41, intro + 20 cases each with CaseNumberTransition + outro), IN_FULL (45:48, 25 cases + 25 transitions, cold open, outro in IN25). Phone parts *_FULL_phone_partN.mp4 (≤ 30 MB each). Open for owner: IN20 climber asks for a description link + note before publishing; credits per case NOTES.md; AM18 Kings Island is on the 'milked' list; AM00 end card says LEVEL 1 (title is a one-line change). Remaining videos: BD, ZO, FF (VO + most footage ready).
- 14 Nov ~15:00: owner 'disturbing dose has number and start with VO, why with raw, 2 diff intros' -> every DC/IN case now opens number -> first VO line: _tools/open_on_vo.py trimmed the title card (and IN01's 12.5 s cold-open raw) off the masters (untrimmed = out/<KEY>_titled.mp4), transitions re-made from build/CASEnn/transition.json (media/_t_in.mp4 leads into the first VO shot). Re-assembled + copied to OldHeritage_Finals: IN 43:55, DC 40:21. No phone copies.
