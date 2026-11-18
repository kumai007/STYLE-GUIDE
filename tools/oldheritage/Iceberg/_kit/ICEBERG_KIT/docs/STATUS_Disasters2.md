# STATUS — Disasters2 = "25 Most Disturbing Videos Before Disasters Ever Caught on Camera (Vol. 2)" (now 24 cases)
Assets: `D:/404 Rendrer/iceberg/algrow 2/videos before disasters [ vol 2 ]/` (cases_map.json, raws, transcripts, pages, places, sources). VO: `../_voice/disasters_vol2_VO.mp3`.

## Kit choice (2026-10-25)
**Editor B** (`TemplateLibrary/src/editors/B`: kit/kit2/kit3 + TitleWall_B), copied to `remotion/src/d2/b/`. Why: the case-1 material is dashcam + aerial (B = DD Dashcam freeze-punch / replays / satellite snap maps, built for exactly this), and B's Shot already carries the per-source censor registry. The two CCTV videos take kit A / siblings.
Library changes (made in TemplateLibrary first, then copied): `TitleWallB` gained `flips` (tiles turn over to live clips on the spoken words); new `editors/B/LevelCard.tsx` (LevelCard_B). AP/Dashcam had no level cards, so the level card follows the iceberg motion study (refs/iceberg/ICEBERG_MOTION.md §1) in channel type.

## VO surgery (owner decisions 2026-10-25) — `tools/vo_surgery.py`, `vo/surgery.json`
- Case 01 (56.88-144.45) cut; Houston (218.15-313.96) moved before the outro; the 3 "twenty five" lines re-voiced ("twenty four") in ONE Algrow job c51a8ffe (voice "new", Stealth 2.0, temp 2, rate 1; +1.09 dB to match), spliced on true speech onsets with the original pauses kept. Lines 1+2 were re-voiced as one continuous take (18.8-32.9) for natural prosody.
- Splice edges checked with faster-whisper: all 7 clean ("up. | 24 more videos", "wrong. | This is Volume 2", "other way. | A dashcam", "pilot. | A tiny white plume", "report. | Karen Jones", "lost. | That's all 24.", "24. | Most of these").
- VO after surgery 42:24.6 -> runtime 50:30.1 (`tools/runtime_d2.py` = port of runtime_plan/runtime_fix/vo_with_gaps to the cases_map layout): 24 openers x 1.5 s, 7 level slots x 2 s, title 4 s, end screen 12 s, 86 raw slots (avg 4.13 s + 0.6 s air), 7 beats (cold-open cues -> 1 s picture beats since the intro has no raw audio; case 1's 3 cues -> 3 s beats, no clean sound). `vo/vo_50min.wav`, `timeline_50min.json`, `vo_words_50min.json`, `RUNTIME_PLAN.md`.
- New numbering: 1 Cobb Pkwy (old c02), 2 Kyrgyzstan (c04), ... 23 Muan (c25), 24 Houston (c03).

## TIGHT timeline (2026-10-25, owner: "cut the VO gaps") = the new edit clock, **45:12.8 (2712.8 s)**
- **Tool:** `tools/runtime_tight.py` → `vo/vo_tight.wav`, `vo/timeline_tight.json`, `vo/vo_words_tight.json`.
- **What changed:** no padding to 50 min and no silent picture beats (the intro and case-1 beats are gone). Only 19 raws whose real sound is the moment remain (107 s in total, 2–8 s each, at natural VO pauses, with subtitles plus source in/out in the json). The other 74 cues play as footage under the VO.
- **Structural slots:** opener 1.0 s, level 1.5 s, title 3.0 s, end screen 12 s.
- **Timings:**
  - intro title 45.80–48.80;
  - L1 48.96;
  - case 1 61.175–135.755;
  - case 2 starts at 135.755.
- The 50-min files stay for reference only.
- Clip picks for the intro and case 1: `picks/CLIP_PICKS.md` (+ thumbnails).

## Done
- Intro + Level 1 + Case 1: `remotion/src/d2/Main.tsx` (comp D2-Main, 0-150.755 s), device times in `remotion/src/d2/plan.ts`. Beat map `maps/map_c01_v2.md`, `qa/PACING_AUDIT.md`, still sheets `qa/sheet_3s_v1.jpg`, `qa/sheet_fix_v2.jpg`.
- **Preview v1 (sent to the owner):** `build/disasters2_intro_c01.mp4` (1080p master, 2:30.8, -16.1 LUFS / -1.5 dBTP, AMF cqp 16/16 g120 per M-109, full->limited; VO sync -1 ms at 8 points by cross-correlation) + `build/disasters2_intro_c01_phone.mp4` (19.8 MB, 720p, AMF vbr_peak 900k).
- **After preview v1 (code only, NOT yet re-rendered; waiting for the owner's corrections):** rules in code (`b/rules.ts` DEV_MIN + assertDev + lintPlan, `<Dev>` wrapper, `plan.ts`, `npm run lint:plan`, render.sh refuses to render a failing plan); linter re-timing (map 76.0-80.7, page 97.1-102.4); 11Alive circled cut shortened to where the circle holds the plane (the pale disc looked like an artifact); dip at 133.9 removed (dark frame); title-wall tiles brighter (library), level-card plate brighter; page marker fixed to "clipping a powerline".
- Blender: `D:/blender` (5.2) and `.blend` recon templates exist only for the Bukigham channel (night reconstructions); nothing to use in case 1 (real footage covers it). Candidates for cases with no footage.
- Not yet mined (owner "use everything"): `D:/EncountersEditor_v5.7/refstudy/fullstudy` (Farrell/Nocturn measurements), `_NEXT_VIDEO_KIT`, `_HANDOFF_MEMORY`, `D:/Encounters_KEEP/device_library_and_rules/DEVICE_CATALOGUE.md` (Jean Verdell device catalogue). Next pass: adapt their devices/motions into channel tokens for cases 2+.

## OWNER DECISIONS needed
1. **Case 1's aerial (`-RMD5cSZUOg`, 11Alive helicopter)** is station-shot TV footage (house rule bans station b-roll), but the VO names it ("From the news helicopter you can see...") and the cut sheet chose it. Used (bug cropped). Keep or replace?
2. **On-screen title says "24 MOST DISTURBING"** to match the re-voiced VO. The YouTube title still says 25.
3. **Houston (now case 24) and Baltimore/Muan**: the owner's lean-on-clean-clip notes are logged for those cases.
4. The Key Bridge hook shot is the StreamTime cam via the WBAL broadcast (the owner said to lean on WBAL; 4.4 s + the shrinking tile).
5. 11Alive's own pale highlight circle (the VO says "with the plane circled") is kept for 1.5 s; replace with our own ring on the clean dashcam if the owner prefers.
6. Case 1 has no raw-sound moments (all 11Alive clips carry anchor narration), so its 3 pauses are picture beats.

## Next
- Owner notes on the preview -> fix -> case 2 (Kyrgyzstan avalanche, own sound) onward. Tiles for the wall: `tools/tiles.py` + `maps/tiles_override.json` (people-free / no victim-face frames).

## PHASE 1 — NEW channel style (2026-10-25, after the owner REJECTED v1) — waiting for owner approval
- Identity: `NEW_CHANNEL_STYLE.md` (icy blue -> abyss navy, ONE accent beacon amber #FFB23F; Archivo ExtraCondensed + Archivo tracked labels + JetBrains Mono; cold grade; real SFX kit `sfx_n2/`).
- Templates (library first, synced): `TemplateLibrary/src/templates/iceberg/` (IcebergChart_IC: data-driven chart, beats reveal/level/case, sink with motion blur, LEVEL fly-through, case name lifts off its band; rules_ic.ts asserts) + `templates/n2/n2.tsx` (DateType_N2, PageRise_N2, SonarMap_N2, RawSub_N2, NameTag_N2, DepthCut_N2/DepthCutWrap, Shot/ColdGrade). Fonts Archivo + JetBrains Mono added to core/type.tsx. Chart data `iceberg/d2_levels.ts` (24 cases, Houston last in L7).
- Art: default plate = Blender render (Disasters2/art) adapted to 16:9 by `TemplateLibrary/tools/plate_from_tall.py` -> `public/ic/berg_blender.jpg/.json`; fallback procedural plate `tools/iceberg_art.py`.
- Project: `remotion/src/n2style/Style.tsx` (comps N2-MotionTest, SF-All + scene comps), registered in `src/d2/Root.tsx`.
- Output: `style_frames/` 12 stills + `sheet.jpg`, `motion_test_1080p.mp4`, `motion_test_phone.mp4` (25.0 s, 3.8 MB, -16.2 LUFS / -1.4 dBTP, VO sync 5 ms constant).
- VO-gap re-plan and clip picks: owned by the timeline agent (`picks/CLIP_PICKS.md`, `vo/timeline_tight.json`).
- Not done yet: library thumbnails/CATALOGUE for the IC/N2 variants (`node tools/render.mjs auto iceberg|n2`), cases 1+ rebuild (after approval).

## v2 (2026-10-25 night, owner asleep): intro + case 1 rebuilt from the measured Abyssal iceberg
- **Measurements:** `REVERSE_ENGINEERING.md` (iceberg-only, per the owner). Covers Abyssal CCTV Vol 4 + Explosion Disasters (sheets in `refs/abyssal_v4/`) and the Chinese study; Farrell / Nocturn / VV specs reused.
- **Art:** the berg was re-rendered FOR 16:9, with no stretch (`art/src/build_iceberg.py --chart` + `comp.py --chart`, 3840x2160). Output: `public/ic/berg_chart.jpg` = `PLATE_CHART`.
- **Library** (then synced):
  - `IcebergChart_IC`:
    - beats `reveal{quick}`, `title`, `cam`;
    - names 58 px in staggered columns, auto-fit;
    - deeper levels frosted;
    - bands dimmed only to about 60 %;
    - the level landing is capped so no name is ever cut off;
    - no ghost behind the lifted title.
  - `SonarMap_N2` stage 2 (second framing plus an approach line).
  - `PageRise_N2` motion "burst" (VV §6).
  - The rules gained `SonarMap2_N2`, `PageBurst_N2`, `Chart_IC` and `DateType_N2` timings.
- **Project:**
  - comp `D2-V2` = `src/d2/Main2.tsx`;
  - plan `src/d2/plan_v2.ts` (lints at bundle; `lint_plan.mjs` now defaults to it);
  - clips cut by `tools/prep_v2.py` into `public/d2v2`;
  - master by `tools/master_v2.py`.
- **Defaults taken:**
  - 11Alive aerial option B (5 windows, bug cropped).
  - The Morbi Reuters CCTV is OUT of the hook; it is replaced by the News Nation strip (strap and arrow cropped, heads softened).
  - sfx_n2 only.
  - No raws.
  - The pilot name tag was dropped, because the VO says it.
- **Output:**
  - `build/disasters2_intro_c01_v2.mp4`: 2:15.8, -16.1 LUFS / -1.5 dBTP, AMF cqp 16/16 g120, full->limited.
  - `build/disasters2_intro_c01_v2_phone.mp4`: 19.9 MB.
  - `build/disasters2_intro_c01_v2_sheet.jpg`.
  - VO sync (Whisper, 3 windows): median -40 / -5 / -45 ms.
- **Known minor issue:** the map stage 1 reads dark in the cold duotone.
