# STATUS: CCTV1 = "25 Most Disturbing CCTV Incidents Ever Caught on Camera (Vol. 1)" (algrow-2 channel, LOCKED_SYSTEM_V4)

Assets: `D:/404 Rendrer/iceberg/algrow 2/CCTV INCIDENTS [ VOL 1 ]/`. VO: `../_voice/CCTV_vol1_VO.mp3` + word `.srt`.
Split: this agent (cases A) = setup, intro, level 1 (c02, c03, c04, c01), L2, c05-c08. The other agent (cases B) = L3-L7, c09-c25, outro, assembly.

## Setup (done)
- **Project:** `remotion/` (Disasters2 skeleton: `src/lib` = TemplateLibrary copy; `src/cc1` = d2's b/, ice/, intro/ ported; node_modules = junction to Dashcam's).
  - One composition: `CC1-Full` (the whole video, picture only).
  - `src/cc1/Full.tsx` wraps everything in ONE `Transitions_FX`.
  - `kit/case.tsx` = the v4 case recipe as data:
    - `makeCase` (EntryCard_AB, plus the LevelCard push for the first case of a level; DateCard_IC3; shots through Shot_FX + FilmLook_FX; RawSub_N2; cues);
    - `makeLevel` (LevelCard_AB holding on the wide berg, no push).
  - Lints run at import:
    - frame-exact gap-free shots;
    - the same source window ≤ 2× per case;
    - the n2fx cut lint;
    - device pacing (`b/rules` lintPlan);
    - ramps inside their x4 files;
    - timeline tiling.
- **Grade:**
  - `grade/grade.py` = the Disasters2 per-source normalisation + `channel.cube`;
  - shot registries `grade/shots_a.py` (mine) and `shots_b.py` (other agent), output to `public/cc1g`;
  - baked blur boxes are supported (`blur:`).
- **Tools:**
  - `tools/vo_words.py` (srt → words);
  - `tools/vo_surgery.py`;
  - `tools/runtime_tight.py`;
  - `tools/gen_data.py` (timeline + chart data → TS);
  - `remotion/tools/lint_plan.mjs`, `remotion/tools/dump_cues.mjs` (→ `build/spans.json`, `build/mix/cues_*.json`), `remotion/tools/ramp_calc.mjs`;
  - `tools/render_chunk.sh <id>` (through `_shared_tools/render_slot.sh`; → `build/chunks/<id>.mov`, frame-count checked);
  - `tools/mix.py <a> <b> <out>` (port of mix_v3: Music 8/9/10, VO −17 LU bed, +6 dB in gaps, sfx_n2, underwater bed, −16 LUFS / limiter);
  - `tools/preview.py <name> <ids…>` (concat → mix → AMF master → phone ≤ 29 MB → sheet → Whisper VO-sync check);
  - `tools/cutcheck.py` (copied).
- **Timeline:** `vo/vo_tight.wav`, `timeline_tight.json`, `vo_words_tight.json`.
  - Total **46:47.5**.
  - Kept raws: c21_1 (the RV loudspeaker "If you can hear this message, evacuate now") and c21_3 (the blast). Every other cue is a news package with a reporter's voice, or silent CCTV → footage under the VO.
- **Iceberg:** `src/cc1/data/levels.ts` (7 levels, 25 names in timeline order) → `ChartIntro_IC3`, `EntryCard_AB`, `LevelCard_AB` (ice3 plates).

## VO surgery + order (lead-approved 2026-10-26; see vo/surgery.json)
- c01 [AD] has **no clean source**. Its only copy (x-8vPuMLcqo) is Abyssal Detective's compilation, our style reference and a competitor (house rule: never reuse). The partial download is NOT used anywhere.
  - So **c02 Putney opens** level 1 (the strongest non-fatal case). No level-1 case has real sound: they are all silent CCTV or news packages. The only real-sound case is c21 (level 6, fatal).
  - c01 moves to the **end of level 1** (new numbers: 1 c02, 2 c03, 3 c04, 4 c01, then 5 c05 onward, unchanged).
- Cuts, on true speech edges with 8 ms fades:
  - the intro clause ", with a home camera that broke at the worst possible moment" (−3.14 s);
  - the word "first" in "This first camera" (−0.23 s).
- The timeline shifted: every block from L2 onward is **3.37 s earlier**. The cases-B agent was told and re-resolved.

## Built (cases A)
| block | span (s) | built from | flags |
|---|---|---|---|
| intro | 0-38.345 | warning, hook on VO beats (BEI walkway, driveway RECONSTRUCTION, Aricell wisp → dark, mall, tills/car parks/lobbies/front doors), chart on "We're starting at the shallow end", black, Level 1 card (no push), level line (empty car park, viaduct) | nobody hurt in any hook frame |
| c02 Putney (1) | 38.345-155.28 | Met release C13 (BBC 1080p + neighbournet copies), side-window close-up, Met appeal still, Fox News page | VO says "pavement to the **left**", but the footage shows it on the right (camera C13). BBC's slowed replay is not used (its circle); our own 0.3x replay. |
| c03 Goiania (2) | 155.28-232.57 | Sou Mais + Record Goias copies, the visit home | **no-contact:** the picture holds the last frame before the wheel reaches him (SMN 6.95 s), then a glitch to the aftermath on "hits" |
| c04 Zhongshan (3) | 232.57-308.95 | traffic camera off a monitor (x4 ramps), police photos, Sohu/Nandu page | vehicles only |
| c01 driveway (4) | 308.95-389.15 | **LINE-ART RECONSTRUCTION** (`recon/DrivewayRecon.tsx`: driveway, robed faceless figure, block break-up, closer frame; spirit box; CleanDiagram explainer), tagged RECONSTRUCTION | **OWNER:** send the original clip (creator "M Vegas Style", not findable) to swap in footage |
| L2 | 389.15-399.655 | Level 2 card (no push) + level line on lawn/mall/coffee window/escalator | |
| c05 Gurugram (5) | 399.655-462.43 | India TV frame edge (rain), the clean CCTV still inside The Quint's article (the strike frame), **LINE-ART RECONSTRUCTION** of the lawn/tree/men/strike (`recon/LawnRecon.tsx`), Quint page | **OWNER:** India TV covers the lawn with its own green spotlight ellipse + circle (banned) → reconstruction. A clean copy of the clip would replace it. |
| c06 Shanghai (6) | 462.43-528.27 | SET + CTi copies (inset crops), CNN page | **no-contact:** stops before the leg is pulled in; no hospital-bed or Jingzhou footage |
| c07 Jakarta (7) | 528.27-592.91 | ANTV + The Star phone-of-monitor copies, CBS page | **no-contact:** nothing after The Star 18.8 s; "dropped" = The Star's dark monitor frame |
| c08 Auburn (8) | 592.91-719.94 | FOX 13 release + court update, Auburn Reporter page | |

- Budget used by cases A:
  - maps 0/3 (none needed yet; London/Jakarta are candidates if the owner wants one);
  - 3D 0/1 (the two reconstructions are 2D line art);
  - pages: 1 in each of c02, c04, c05, c06, c07, c08.

## Previews
- **v1 sent:** `build/cctv1_intro_c01_phone.mp4` (25.9 MB; master `cctv1_intro_c01.mp4`, −16.0 LUFS / −1.2 dBTP, VO sync −30 / +3 / −33 ms).
- **v2 (in progress):** `build/cctv1_intro_c01_v2_phone.mp4`. The 4:3 Met footage is re-framed to fill the frame (v1 showed it on a blurred fill that read as dark side bars).
- Chunks: `build/chunks/{intro,c02,c03,c04,c01,L2,c05,c06,c07,c08}.mov` (picture only).

## Notes for assembly (cases-B agent)
- Mix cues: `node remotion/tools/dump_cues.mjs` → `build/mix/cues_{intro,cases_a,cases_b}.json`. Each block carries its own `music` segment (Music 8/9/10), `sfx` and `beds`.
- Grade group "bei" was re-normalised after the intro clips were cut. A re-grade of `i_walk` / `i_lobby` would change the intro slightly: the intro chunk is already rendered with the earlier LUT, so leave it.

## FINAL (2026-10-26 21:52)
- Delivered to `iceberg/algrow 2/_FINAL/CCTV vol 1/`:
  - 1080p + 4K (hevc_amf);
  - .en.srt, chapters.txt, preview_5min.mp4;
  - qa_* files.
- Length 46:47.5. Master -16.2 LUFS / -1.8 dBTP (4x-oversampled limiter + AAC).
- Microcut on the whole video: 0 flash frames. VO sync at 10 points: within ±60 ms.
- cutcheck.py still lists 158 flags, mostly JUMP flags on handheld / dashcam footage motion in c23/c24, plus stubs on static pages. These are not flash frames.
- Blender: each case uses 3 or fewer renders. Everything else is Remotion code (`kit/code.tsx` + n2dev).
- The plan lint asserts source cuts (`tools/gcuts.py` on the graded clips = the gate's own detector), ramp bounds and x4 extents.
