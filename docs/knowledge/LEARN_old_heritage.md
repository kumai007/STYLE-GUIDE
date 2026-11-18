# Learnings: Old Heritage / Iceberg channel

> **Status: notes, not rules.** Rank below the style rule book, SOPs and playbook; master SOP §2.4 bans override any
> device named here. Loudness: the SOP target (-16 LUFS, <= -1.5 dBTP) wins over any number below. Source paths
> `(src: ...)` are pre-deletion paths: look them up under `docs/knowledge/notes/<same path>` (PC only, not synced).


Root = `tools/oldheritage` (5.5 GB). Facts checked: `Iceberg/_engine` (Remotion) NO LONGER EXISTS (removed 2026-11-16); `Iceberg/media` (533 MB) is the old `_engine/public`.
Episode folders 01-05, 07, 09 hold ONLY notes (NOTES.md, transition.json, INDEX/LINKS.csv, outline, script, vo/text): 0.3-0.5 MB each, no footage/renders.

## 1. KIT (keep)
| path | size | note |
|---|---|---|
| `ANALYSIS.md`, `CLAUDE.md`, `README_SETUP.md`, `setup_paths.py` | ~14 KB | README_SETUP/setup_paths are Mac->Win setup of a now-dead Remotion pipeline; stale (could be dropped) |
| `brain/memory/` | 96 KB | 21 owner notes. OHF-binding: iceberg-*, 3d-threejs, finals-delivery, youtube-cookies, intro-style, brand-safety-text, monetisation-blur, no-verification-passes. Other channel (404 thread / Lost Games / Disturbing Games): project-*, user-channel-404-thread, shot-density, ss-variety-craft, no-padding-templates |
| `Iceberg/CLAUDE.md`, `HANDOFF.md` | 160 lines | channel style + full history |
| `Iceberg/_kit/` | 5.7 MB | CASE_BUILD_GUIDE.md (owner rules at end win), OH_CASE_BRIEF.md, TP_AUDIT_BRIEF_3NOV.md, README.md, RULES/ 5.2 MB (OWNER_RULES, CASE_METHOD, owner_memory, ref pngs), ICEBERG_KIT 140 KB, gold_cases 48 KB, oldheritage/ 292 KB (TASTE, EDIT_RULES 364 lines, QA_RULES, DESIGN_RULES, PIPELINE, playbooks/) |
| `Iceberg/_ref/` | 20 MB | DisturbingDose/STYLE.md + frames (9.9 MB, measured transition spec), IntroRef/INTRO_REF.md + keys (1.1 MB), CaseTransition_demo.mp4 7.5 MB (demo, optional), CaseTransition_vs_DD.png 1.2 MB, OI_case_openers.jpg |
| `Iceberg/_tools/` scripts + `grade/` | ~1.1 MB | grade_case.py + look.py + channel.cube (house grade); srccuts.py, cutcheck.py, rawclean.py, capture_page.py, oh_links.py, oh_split.py, oh_fetch.sh, oh_retry.sh, dd_fetch.sh, vo_*.py, VO_AGENT_BRIEF.md, raw_extend.py, open_on_vo.py, make_transitions.py, assemble.sh |
| `Iceberg/media/fonts` | 4.2 MB | Elite=SpecialElite, ArchivoBlk (Archivo var), D-DIN(+Condensed), Montserrat, Inter, VCR_OSD_MONO, Bebas, etc. |
| `Iceberg/media/music` | 74 MB | Epidemic ambient Music 1-10 + 3 ES tracks |
| `Iceberg/media/sfx_n2` (58 MB) + `sfx` (6.1 MB) | 64 MB | real SFX (`sfx_n2/real`: wind, rain, impacts, metal, booms, car engines), glitch/whoosh/title_hit/case_lift |
| `Iceberg/media/ice3`, `ic3`, `ic` | 27 + 7.1 + 3.5 MB | iceberg plates / chart / push stills (AM level entries, intros) |
| `Iceberg/media/n2fx` | 2.8 MB | grain PNGs |
| `Iceberg/media/case_t` | 524 KB | ArialRoundedBold.ttf + case_t.wav (number-transition sound + font) |
| `Iceberg/media/vignette.png` | 104 KB | |

## 2. RESIDUE (candidates to delete)
| path | size | why |
|---|---|---|
| `Iceberg/_tools/.audvenv` | 4.8 GB (torch alone 4.1 GB) | regenerable (pip install -r requirements.txt + opencv-python websocket-client); needed only by rawclean.py (Demucs+AST music removal). Heavy steps run on GitHub farm now, never on the laptop |
| `Iceberg/_tools/.venv` | 64 MB | numpy+pillow, regenerable |
| `Iceberg/media/vo` | 222 MB | 156 per-block wavs of Tornado/old case VO (CASE01_01.wav ...) |
| `Iceberg/media/vor` | 58 MB | 57 files = old case VO takes CASEnn.mp3+.srt (Tornado) |
| `Iceberg/media/n2` | 73 MB | case media of TOR02/c22 (c02_*.mp4, ktvu.png, naip_c02.jpg, vo_test.wav) |
| `Iceberg/media/c1` (72 KB), `c2` (0), `kit` (0) | tiny | old build dirs, empty / Fairdale notes |
| `Iceberg/scratch/`, root `scratch/` | 0 | empty |
| `Iceberg/_tools/*.bak-mac`? | not found | none present |
| Episode notes folders 01_Natural_Disasters 305K, 02_Theme_Park 496K, 03_Tornado 396K, 04_Workplace 437K, 05_Dashcam 422K, 07_Incidents 490K, 09_Amusement_Iceberg 455K | 3.0 MB total | delivered; only NOTES.md (device lists, sources, credits URLs), transition.json, INDEX/LINKS.csv, outline, cut sheet, VO text. Value = credits/sources + this learnings list; safe to archive as one zip after extraction |
| Mac/Remotion/Blender-only tools: `blender_map.py` 16K, `blender_run.sh`, `idle_guard.sh`, `render_pending.sh`, `render_case.sh`, `newcase.sh`, `pubsync.sh`, `render_map3d.sh`, `render_maps.sh`, `apply_cutout.py`, `raw_probe.mjs` | ~100 KB | all drive the deleted `_engine` (Remotion); dead. History only |

Tool path references (all broken now): every `.sh/.py` that mentions a path uses `~/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg` or `.../STYLE guide/...` (old folder name; now `render farm video`) and `_engine/` (assemble.sh, dd_fetch.sh, newcase.sh, oh_retry.sh, pubsync.sh, render_case.sh, render_map3d.sh, render_pending.sh, apply_cutout.py, blender_map.py, make_transitions.py, open_on_vo.py, raw_extend.py, raw_probe.mjs). grep counts of `_engine`: newcase 2, pubsync 1, render_case 1, render_map3d 1, render_pending 2, apply_cutout 1, make_transitions 3, open_on_vo 1, raw_extend 1, raw_probe 3. Still path-light/usable: grade/grade_case.py, srccuts.py, cutcheck.py, rawclean.py (venv), capture_page.py, oh_links.py, oh_split.py, oh_fetch.sh (path in 1 line), vo_*.py. setup_paths.py rewrites /Users/ekam/Downloads/Iceberg paths (obsolete).
Not referenced by tools: brain/, _ref/, _kit/ (docs only).

## 3. LEARNINGS (not in ANALYSIS.md / CLAUDE.md / docs/workflow / GENERIC_RULES unless noted "extends")
Process / owner feedback
- Owner on DC01 v1 (13 Nov): re-typed court card + heavy red highlight "sloppy"; fix = real captured page as a tilted printed sheet / torn clippings, one key sentence brought forward, rest fades; key line only red. Date bars/weather alerts/names of minors left out of the capture. (src: 05_Dashcam/build/CASE01/NOTES.md)
- Owner 13 Nov on DD/DC style: "references type high quality, NOT Claude-AI looking"; no invented flashy templates, restraint. (src: _kit/OH_CASE_BRIEF.md)
- Owner 4 Nov on WP01 PourClock: clip small beside a red time bar "did not stand towards niche"; devices must work ON the footage (replay+push, freeze+punch-in, synced second angle, spotlight), footage ~80 % of picture; never time bars/clocks/gauges/HUD/charts beside a clip. (src: _kit/RULES/owner_memory/feedback-iceberg-niche-devices.md)
- Owner 3 Nov on TP19: "one word then raw, then stopped, weird": never split VO mid-sentence, raws only at sentence ends, >=6 s full thought between raws, no device reprise at the end, case ends on last VO line + short hold. (src: _kit/CASE_BUILD_GUIDE.md end)
- Owner 3 Nov on TOR18: a splice that took the only raw from 3 s to 6 s was rejected ("why tf stupid 3 second shit still there"); every case needs a main raw 10-25 s even if that footage appears elsewhere; use 0.5x replay or second angle when the clip runs out; check raw lengths before showing owner. (src: brain/memory/feedback-iceberg-longer-raws.md)
- Owner 3 Nov on ND01/ND02: raws only at incident moments; applied as audit removing raws 12->6, 15->4 etc.; near-duplicate raws ("town still under water" x6) removed; test = read the VO line before a raw: if it explains instead of pointing at what happens, cut raw and merge VO. (src: 01_Natural_Disasters/build/CASE*/NOTES.md, HANDOFF.md)
- Owner 3 Nov: intros need NO raw; map/pin and fast-montage intros rejected "too fast, unsmooth"; slow eased 3-D clip field approved; check smoothness with per-frame motion strip not stills. Three intros must not share one rig (TOR corridor, ND ring, TP ferris wheel; then WP PortYard). (src: HANDOFF.md, _kit/CASE_BUILD_GUIDE.md)
- Owner 14 Nov on DC/IN: number transition then VO starts; "why with raw, 2 diff intros" -> no title card, no raw before first VO line; a cold-open raw goes after first VO paragraph; untrimmed master kept as `<KEY>_titled.mp4`. (src: HANDOFF.md)
- Owner 14 Nov intro = his own OHF intro (mwYeratelA0): ~10-17 s VO montage of 4:3/portrait panels over a blurred copy, 'Viewer discretion is highly advised' plate, black red-condensed 'CASE 01' (D-DIN Condensed Bold ~210 px #F00505, typed on) + name/place, white flash. Used for DC00 and AM00 (AM00 card says LEVEL 1; one-line change). (src: 05_Dashcam/build/CASE00/NOTES.md, 09_Amusement_Iceberg/build/CASE00/NOTES.md, _ref/IntroRef/INTRO_REF.md)
- Owner (4 Nov) hates lag: renders/Blender nice 20, <=2-3 builders, one Blender at a time, no GPU on his Mac; 'do case less' -> one builder; (Mac-era, obsolete, but pattern = ask resource budget before parallel builds). (src: HANDOFF.md)
- Owner 14 Nov: no phone copies, deliver full-quality finals into `OldHeritage_Finals` named by title. (extends SOP? already in ANALYSIS rule 10)
- Owner 2 Nov "zip for u to stop fucking the video": a self-invented prototype (6 Blender maps, long holds, red rings, own page device) was rejected; build only from approved kit recipe; copy gold cases c06/c07 first. (src: brain/memory/feedback-iceberg-kit-rules.md)
- Owner 13 Nov: "if image exists on google we can have it" = real web photos allowed where informative (no TV/agency watermark, no mugshots). (src: brain/memory/feedback-iceberg-real-screenshots.md)
- Owner asleep batch rule (13 Nov): decide alone for ship/crowd clips with nothing visible - no "raw"; "Decided alone (owner asleep)" cases are logged in NOTES for review. (src: 09_Amusement_Iceberg/build/*/NOTES.md)

Audio / sound
- Silent source clips (VSP release, Pinellas, many CCTV): no clip sound; build a low real bed (engine, rain, wind) from `sfx_n2/real` and time impacts/metal/boom/horn to what the picture does (e.g. DC01 engine bed; DC17 impact_3+metal at t 8.8). (src: 05_Dashcam/build/CASE01/NOTES.md, 07_Incidents/build/CASE*/NOTES.md)
- A clip whose soundtrack is an added music bed (rawclean finds music for all 45 s, Demucs vocals carry no speech): treat as silent footage, use real beds. (src: 07_Incidents/build/CASE*/NOTES.md)
- Music level recipe: ambient file measures ~-12 LUFS; set bed so ~10 LU under VO: Music 5 -13 dB, Music 3 -19 dB, Music 4 -21.5 / -23.5 dB, Music 1 -14 dB; hold 40 % under silent raws instead of cutting so silent windows don't drop out; intro music -19 dB up ~2.6 dB on case card. (src: 05_Dashcam/build/CASE01,00, 09_Amusement_Iceberg/build/CASE00/NOTES.md)
- Measured section levels in a master (RMS): VO -19.5..-20.6 dB, RAW1 -22.4, RAW2 -24.6, police radio -18.6 (screaming lowered -5 dB in IN20). A master that loudnorm leaves at -17.3 LUFS integrated was accepted. (src: 05_Dashcam/build/CASE01/NOTES.md, 07_Incidents/build/CASE20/NOTES.md)
- Screaming/profanity near the contact moment: end the raw BEFORE contact (cut at ~143 s of a 2:22 clip); aftermath = silent sky/grass only. (src: 09_Amusement_Iceberg/build/CASE*/NOTES.md)
- Number-transition sound: sub hit 20-120 Hz ~0.25 s on the cut + digital crackle 8-16 kHz; VO silent 0.3-0.7 s before, back 0.1-0.15 s after; music bed changes at each case. (src: _ref/DisturbingDose/STYLE.md)
- VO takes: INTRO/LEVELn can sit INSIDE case mp3s (FF: INTRO+LEVEL1 prepended in CASE01, LEVEL2 inside CASE05, LEVEL5 inside CASE17; BD: OUTRO appended to CASE20) - see `vo/raw/MERGED.txt`; level calls ("Level two.") open cases 07/13/18/25 in WP: start VO AFTER the call, levels built separately. (src: 10_Fast_Food_Iceberg/vo/raw/MERGED.txt, 04_Workplace/WP_CASE_BRIEF.md)

Footage / grade / cutcheck
- House grade normalisation crushes bright/sunny/back-lit clips and stills to storm-dark: use `grade_case.py --house --nonorm` (look only), add gamma/brightness lift (1.12-1.2, +gamma after LUT) for dim interiors; dusk-dim last seconds lifted 1.12. (src: 04_Workplace/build/*/NOTES.md, 05_Dashcam/build/CASE0*/NOTES.md)
- cutcheck false positives to expect: 14 fps sources played at 30 fps (each frame held 2-3x) give hundreds of STUB/JUMP, whip-pan helmet cams, low-bitrate frame-dropping reposts, 3-D drives with moving gantries, fire flicker, handheld pans; judge on contact sheet, don't "fix" source motion; real flags -> 10-frame blur-dip at hard reframes of the same dashcam (DC01: 7 JUMPs -> 7 blur-dips). (src: 05_Dashcam/build/CASE00,01/NOTES.md, 07_Incidents/build/CASE20/NOTES.md, 09_Amusement_Iceberg/build/*)
- Clip with one-frame exposure flash (source 734.56 s): cutcheck FLASH, drop the shot. 1 frame black on render from decode miss under load: re-render that frame as still and splice, then re-master. Remotion `delayRender` default 28 s too short for a 1 GB source under load (240 s used). (src: 05_Dashcam/build/CASE00/NOTES.md, 01_Natural_Disasters/build/CASE07/NOTES.md)
- Slow-mo only from a motion-interpolated 60 fps copy (IN20 `slow60.mp4`); a half-speed replay that stutters gets replaced; 0.65x teaser showed JUMPs, could use interpolated file. (src: 07_Incidents/build/CASE20/NOTES.md)
- Corrupt download (bad NAL units): re-fetch, a section with cookies (`ce-AviEAAFw`); partial copies removed. Bot check hits many small channels; plain yt-dlp retry after the block lifted often works without cookies (retry job fetched 21:08/21:20). (src: 07_Incidents/build/CASE*/NOTES.md)
- Always crop/delogo: corner bug (CSB x1622 y872 210x106), officer-name stamp cropped by 16:9 top crop (480x270), date stamp off by zoom 1.12, LiveLeak bar cropped, TOGUARD watermark delogo'd, plates blurred (convertible 6-33.8 s, sedan 21-28.6 s). (src: 05_Dashcam/build/CASE0*/NOTES.md, 07_Incidents/build/CASE*/NOTES.md)
- Vertical phone clips: sharp full-height clip over its blurred copy (VCam / Tall / QueueView panel); multi-camera vertical strips rebuilt from panels (PanelSplit) and toured as VO names each. (src: 05_Dashcam, 07_Incidents, 09_Amusement_Iceberg NOTES)
- Teasers for the next case use 3.4-5 s silent clips under a RedLabel place · year, cropped to hide stamps. (src: 05_Dashcam/build/CASE01,18/NOTES.md)
- One 30-37 s silent clip carrying a whole case: VO between raws uses deliberate replays/held frames; first 46 s of VO on Commons photos; single raw only (don't invent others). (src: 09_Amusement_Iceberg/build/CASE0*/NOTES.md)
- When only one camera exists (DC01): 7 reframes of the same dashcam separated by blur-dips and varied scale + aerial/town photo/courthouse/devices; never fake an angle. (src: 05_Dashcam/build/CASE01/NOTES.md)
- Wikimedia fetch: rate limit "Too many requests" -> don't loop; one request had account email in User-Agent by mistake: use generic UA. Wayback capture (e.g. sixflags.com day after crash) is a valid source. (src: 03_Tornado/build/CASE*/NOTES.md, 09_Amusement_Iceberg/build/CASE*/NOTES.md)
- Tools hit bot walls: VTDigger headless Chrome bot check, Caledonian "Too Many Requests", FEMA PDF, DA report PDF, Halifax Courier, My Modern Met: do not bypass; use another captured source and say so. WCAX wording vs VTDigger wording differed -> keep only the first sentence at full strength. (src: 05_Dashcam/build/CASE01/NOTES.md)
- Facts hygiene: never "tried to kill" when attempted-murder was dropped (convicted aggravated assault); minors/relatives not named; "Nothing says texting caused the crash" - picture follows "the camera shows"; attribute claims (Dreamscape CEO account) rather than assert. (src: 05_Dashcam/build/CASE01,05/NOTES.md, 07_Incidents/build/CASE*/NOTES.md)
- Credits: every Commons photo carries author + licence in NOTES (CC BY / BY-SA need a description credit; PD ok); creators who ask for a link + note before publishing (IN20 climber) -> flag open to owner; description credits list per case. (src: NOTES.md in 05/07/09 build)
- Image-viewer/Read hook timed out for hours (14 Nov ~22:37-06:00): builders verified stills numerically (exposure/contrast, macOS Vision OCR/faces/scene labels). Worth one eye pass on night shots after; add tool-unavailable fallback to pipeline lessons. (src: HANDOFF.md, 07_Incidents/build/CASE25/NOTES.md)

Devices / format
- Device registry discipline: one dev file per device, REGISTRY.md line `<KEY> | <Name> | file | what it shows`; no device reuse within +-3 cases or across videos; assertN2/assertIC throw if a device is shorter than entry + readable hold + exit (a 2.8 s name tag needed >=89 f). (src: _kit/CASE_BUILD_GUIDE.md, _kit/OH_CASE_BRIEF.md)
- Device examples that passed owner: ArmKeep (grey-out everything except the arm, colour back on "keep your eye on..."), DropShaft (frozen frame + plumb line), HullTilt (frozen frame, dashed true vertical vs mast), BladeLevel, SecondLunge (freeze on first lunge then half-speed second attack), StampFold (hold frame, push into camera's own date stamp, fold onto Sentinel-2 map at GPS), SwayTrace (lamp tracked per frame, data in DC17_lamp.ts), PressClip/PressProof (printed/torn real page). (src: 05_Dashcam/build/CASE01,17/NOTES.md, 07_Incidents/build/CASE*/NOTES.md)
- Raw windows joined: one main raw built from 3 source windows (27 s + 12 s + 6 s) joined by blur-dips (IN case) is accepted as "one raw block". (src: 07_Incidents/build/CASE*/NOTES.md)
- Raw "VO lead-in then raw": RAW 1 should start on the words that point at it ("keep your eye on the long orange arm") rather than merging raws; 5 s VO between two raws kept because it points at the main raw (conflict with >=6 s rule was explicit). (src: 05_Dashcam/build/CASE01/NOTES.md)
- Disturbing Dose transition spec (measured): 0.30 s datamosh glitch, hard cut, number assembles through blocks 0.13-0.50 s, hold 0.5-1.77 s, fade 1.77-2.4 s; number 20 % of frame height, centre (51 %,47 %) or top-right corner; pure red (255,20-30,20-30), glossy-sticker bevel, soft drop shadow, red bloom 350x300 px; place/date line white heavy sans typed in, last word red; footage ~60/83 s is the dashcam itself; callouts = red arc/circle, thin red arrow, tick marks, red-box name tags; replay slow + pushed in. Implemented here as 2.5 s CaseNumberTransition. (src: _ref/DisturbingDose/STYLE.md)
- Outro cases: IN25 ends on the video's own outro line with EndRecede (right half dark for end screen); DC99 30.3 s: one calm shot per clause, hard cuts, dimmed final shot for end screen, fade to black, music outlasts VO. (src: 07_Incidents/build/CASE25/NOTES.md, 05_Dashcam/build/CASE99/NOTES.md)
- Level/ice-berg format (AM, FF): AM_LevelEntry (level n + name from dev/AM_levels.ts) opens the first case of each level; levels 1-5; 5 levels list in BD? no. WP: 5 levels, level 2 has 5 cases, level 4 has 6; levels built separately WPL1-5. Kings Island flagged on the "milked" exclusion register (owner to decide, AM18). (src: 04_Workplace/WP_PLAN.md, 09_Amusement_Iceberg/build/CASE18/NOTES.md)

Measured numbers
- Delivered: ND_FULL 61:42 (after audit; was 76:41), TP_FULL 56:11 (was 62:01), TOR_FULL 60:50 (was 71:30), WP 51:07 (35 pieces, 28 cases, target 50:00 +-1), DC 40:21 (re-cut; 41:41 before), IN 43:55 (45:48 before), AM 34:00 (22 pieces). Raw audit cut ~10-15 min per video. (src: HANDOFF.md)
- Length budget: case ~= its VO + 19 s (title ~4 s + raws ~15 s); countdown cases 1:45-2:45; DC01 169.1 s (title 4, VO 127.6, raws 36.9); WP cases 79-145 s. (src: 04_Workplace/WP_PLAN.md, _kit/OH_CASE_BRIEF.md)
- Render rates: 13.8 s test case ~11-14 s; map3d 4.8 s shot ~14 s; Blender map ~36 min each (budget 1 per 3 cases); 203 GB of media trashed after upload on 4 Nov (media is regenerable from URLs in NOTES). (src: HANDOFF.md, ANALYSIS.md)
- Footage counts: 176 links for 6 videos (oh_links.py); BD 20 links, ZO 13 links. (src: 06/08 footage/LINKS.csv, HANDOFF.md)

## 4. UNBUILT episodes (keep or delete)
| ep | content present | size |
|---|---|---|
| 06_Before_Disasters (BD) | research/outline.md 168 KB (20 cases, frame-matched sources S1-S16, tiers GREEN/AMBER/RED, handle-with-care); script/script.md 32 KB (20 cases + OUTRO); footage/LINKS.csv 20 rows (16 KB); vo/text CASE01-16 (+); vo/raw CASE01-20 .mp3+.srt + MERGED.txt (OUTRO appended to CASE20). NO footage, NO build. | 41 MB total (VO mp3 ~40 MB) |
| 08_Zoo (ZO) | research/outline.md 132 KB (12 cases + cold-open note, Bronx dropped RED); script/script.md 32 KB (INTRO, CASE01-12, OUTRO); footage/LINKS.csv 13 rows; vo/text 15 files; vo/raw INTRO, CASE01-12, OUTRO (.mp3+.srt). NO footage, NO build. | 38 MB (VO ~37 MB) |
| 10_Fast_Food_Iceberg (FF) | ONLY vo/raw: CASE01-22 (.mp3+.srt), LEVEL3, LEVEL4, OUTRO, MERGED.txt (INTRO+LEVEL1 inside CASE01, LEVEL2 inside CASE05, LEVEL5 inside CASE17). NO outline, script, links, footage, vo/text. (ANALYSIS says LEVEL1/2/5 "missing": they are merged inside case takes; 25 mp3 files incl. levels) | 40 MB |
Total 06+08+10 = 119 MB (118 MB vo). Outline+script (text) of BD/ZO = ~330 KB: worth keeping even if VO is dropped (the outlines carry licence tiers). Algrow VO is regenerable only by paying/regenerating (Stealth Obscure Collab, model 2.0, temp 2.0, rate 1.05, one job per case), so VO mp3s have real cost-to-recreate value; footage for these would be re-downloaded from LINKS.csv (bot check applies).
