# V3 BRIEF: Disasters Vol 2, intro + case 1 (lead, 2026-10-26). Every v3 agent reads ALL of this first.

## Situation
- **Owner verdict on v2** (`build/disasters2_intro_c01_v2_phone_fix.mp4`): rejected. Their words:
  - "didn't analyse what the iceberg means / how the keyframes move"; "angle super bad";
  - "Claude AI-slop templates";
  - "map style very bad"; "screenshots very bad (highlight bad, dim not removed when the highlight moves)";
  - "iceberg not high-quality 3D"; "add CC";
  - "intro clips mid, just slow push-aways"; "case 1 needs more detailing / backstory motion scenes, not screenshots every second";
  - "rough cuts, 1-frame glitches, sudden zooms".
- **Binding iceberg grammar:** `ICEBERG_SPEC_ABYSSAL.md` (lead's frame study of Abyssal Detective).
- **Owner's rules:** `D:/404 Rendrer/OWNER_TASTE.md` (incl. the 2026-10-25/26 log at the bottom). Disturbing niche: dark, tense, premium, at Disturbing Dose / Abyssal craft level. A NEW channel identity, not the old 404/Waterpark look and not the 24-tile title wall.
- **Inspect references CAREFULLY.** The owner keeps saying we didn't. Read the existing profiles/teardowns first; don't re-measure what's documented. Look at real frames for your area before designing. Every device names the reference + timecode it adapts.

## References already on disk (do NOT download anything)
- **Abyssal Detective** (iceberg format): `D:/404 Rendrer/refs/abyssal/` (CCTV Iceberg Vol 4, Explosion Disasters) + `Waterpark/study/abyssal_chinese_iceberg/STUDY.md`.
- **LEMMiNO:** `D:/EncountersEditor_v5.7/refstudy/refs_gx/lemmino/` (D.B. Cooper, Kennedy, Jack the Ripper, Kryptos, Stars, Bygone) + `D:/EncountersEditor_v5.7/GX channels/MASTER_TEMPLATES/_ref/lemmino/` (f/scan/seq).
- **Fern:** `D:/titlecut/refs/fern/` (videos + FERN_VISUAL_PROFILE.md + analysis/), `D:/titlecut/refs/docs3d/teardown/fern/` (TEARDOWN.md, devices/, timelines), `D:/titlecut/editstyles/fern/`, `MASTER_TEMPLATES/_ref/fern/`, `D:/404 Rendrer/refs/fern/` (Smartest Killer, Japan's Chernobyl).
- **Parallel Pipes** (the king of screenshot presentation): `D:/404 Rendrer/refs/parallelpipes/`.
- **Disturbing Dose:** `D:/404 Rendrer/refs/dd/`. **Visual Venture:** `refs/vv_coldcases/` + `Waterpark/study/visualventure_tv/`. **Farrell / Nocturn:** `D:/EncountersEditor_v5.7/refstudy/fullstudy/`, `D:/404 Rendrer/Smoothness_Guide/`.
- **Per-category frame folders:** `D:/Fern ki mkc/` (dd, far*, fern, lem*, noc*, nexpo, vv, hn*, horrors).
- **Existing master templates:** `D:/EncountersEditor_v5.7/GX channels/MASTER_TEMPLATES/` + `D:/404 Rendrer/TemplateLibrary` (CATALOGUE.md). Reuse what's good; don't ship generic "AI" layouts.

## Project
- **Folder:** `D:/404 Rendrer/Disasters2/`.
  - Remotion: `remotion/` (src/d2; library synced from TemplateLibrary with `node tools/sync.mjs --to "D:/404 Rendrer/Disasters2/remotion"`).
  - VO and timeline: `vo/vo_tight.wav`, `timeline_tight.json`, `vo_words_tight.json` (gap-free, 45:12.8).
  - Clips: `picks/CLIP_PICKS.md`.
  - SFX: `sfx_n2/` (real recordings + SFX.md).
  - Art: `art/` (Blender `iceberg.blend` + src).
  - Assets: `iceberg/algrow 2/videos before disasters [ vol 2 ]/` (sources, raws, pages, places.json, transcripts).
- **Defaults:** 11Alive helicopter = option B (5 short windows, bug cropped); no Morbi Reuters CCTV in the hook; no Esri imagery (NAIP / Sentinel only); no agency clips.
- **Code rules:**
  - eased in/out everywhere;
  - min-duration asserts (no device cut off or half-played);
  - the pacing linter;
  - NO 1-frame flashes, jumps or accidental zooms at cuts (add a cut-point check);
  - glitches are designed multi-frame effects.
- **Library first:** new or changed templates go in `TemplateLibrary/src/templates/<family>` FIRST, then sync.
- **Machine:** AMD RX 9070 XT + Ultra 7 265K, 32 GB.
  - Blender: `D:/blender/blender.exe -b` (Cycles HIP works).
  - Remotion: `--gl=angle`, at most 2 renders at once machine-wide. Coordinate: only render stills/short tests; the final render is done ONCE by the integrator.
  - Encode with h264_amf cqp 16/18 + `format=yuv420p`.
  - TEMP on D:.

## File ownership (no two agents edit the same files)
| Agent | Owns |
|---|---|
| ICEBERG | `art/`, `TemplateLibrary/src/templates/iceberg/`, `remotion/src/d2/ice/` |
| MAPS | `maps3d/`, `TemplateLibrary/src/templates/n2map/`, `remotion/src/d2/maps/` |
| PAGES | `TemplateLibrary/src/templates/n2page/`, `remotion/src/d2/pages/` |
| LOOK | `grade/` (channel LUT + per-shot grade), `TemplateLibrary/src/templates/n2fx/` (transitions/glitch/cut tools + the cut-point checker), `remotion/src/d2/intro/` (the intro edit) |
| CASE1 | `remotion/src/d2/c01/` (case 1 edit + backstory scenes), `scenes3d/` |

Each agent delivers working, exported components + 2–4 test stills + a ≤10 s test clip of its device, in its own folder under `Disasters2/v3_tests/<agent>/`. Then it reports to the lead ("main") in ≤6 lines with the component API (props) so the integrator can wire it.
