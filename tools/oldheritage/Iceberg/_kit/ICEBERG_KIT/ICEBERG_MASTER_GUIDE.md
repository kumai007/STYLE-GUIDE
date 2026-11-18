# ICEBERG MASTER GUIDE: read this FIRST before making any iceberg video (any account)

The owner approved this system on 2026-10-26: CCTV Vol 1 c06/c07 ("awesom case, make peak cases like this"). Three 45-min videos were shipped with it. This file holds every rule the owner gave, every mistake made, and where all the reusable code lives. Read it fully before building. Details are in `docs/`.

## 1. What's in this kit
| Path | What |
|---|---|
| `D:/404 Rendrer/TemplateLibrary/src/templates/` | THE device library. `iceberg/` (ChartIntro_AB, LevelCard_AB, EntryCard_AB, GlitchIn_AB), `n2map/` (TerrainMap_N2M), `n2page/` (ChipLift_N2P), `n2fx/` (Transitions_FX, Shot_FX, FilmLook_FX, cutcheck), `n2dev/` (35 devices: HudBracket, DimBracket, DataBox, RadioHud, EngravedDate, LoupeGlide, RadarRings, Flashback, MapPull, CrtWindow, Highlighter, FilmInset, LineMap, ArchivePush, TiltPhoto, WireHit, Datamosh, FreezeReplay, SpeakerBox, BuildOnWords, CountUp, IconGrid, RollUp, RecedeNumber, ClockSweep, YearScroll, RulerTicker, DayStrip, Cutaway, ExplodedPart, ScaleCompare, StructureSection, PostCard, CommentStack, WatchPage). Props + "use when" are in `CATALOGUE.md`. Showreel: `TemplateLibrary/n2dev_showreel_phone.mp4`. Sync into a project with `node tools/sync.mjs --to <proj>/remotion`. Render n2dev standalone via `src/n2dev_entry.tsx` (the main Root fails on old ids). |
| `projects/Disasters2/` | The cleanest full project (approved intro + c01): `remotion/src/d2` (ice/, intro/, c01/, maps/, pages/, v3/MainV3.tsx), `tools/` (runtime_tight.py = gap-free VO timeline, vo_restore25.py), `grade/` (channel.cube + grade.py), `art/` (iceberg.blend, iceberg_cine.blend, iceberg_chart.blend + shot jsons), `scenes3d/` (Blender case kits), `maps3d/` (night-terrain pipeline: ca_area.py → DEM/OSM → build_terrain.py). |
| `projects/CCTV1/` | The GOLD case code: `remotion/src/cc1/cases/c06.ts`, `c07.ts` (the approved recipe), `kit/`, `scenes3d/kit3d.py` (EEVEE setup, the `N2_FAST` env profile), `tools/` (render_chunk.sh, case_preview.sh, preview.py = full-mix phone preview with sync check, mix.py, assemble). |
| `projects/CCTV2/` | Same family; `tools/assemble_cc2.py` = the full final assembly (concat, mix, master, 4K, chapters, srt). |
| `projects/*/case_plans/` | Example per-case plans (VO words → shot/device tables). |
| `shared_public/` | Remotion public assets reused by all: fonts, iceberg plates (ic, ic3, ice3), n2map tiles, n2fx, real SFX (sfx, sfx_n2), vignette. Copy into `<proj>/remotion/public/`. |
| `sfx_n2_kit/` | Real-recording SFX kit + SFX.md gains. |
| `D:/404 Rendrer/_shared_tools/` | `render_slot.sh` (adaptive render scheduler + glitch gate), `loadprobe.py` (CPU/RAM/GPU probe), `microcut.py` (flash-frame detector). |
| `docs/` | PEAK_V5.md (the final bar), LOCKED_SYSTEM_V4.md (recipe + NEVER-AGAIN), ICEBERG_SPEC_ABYSSAL.md (what the iceberg means), NEW_CHANNEL_STYLE.md, REVERSE_ENGINEERING.md, ROADMAP_ALGROW2.md, the STATUS files. |
| `D:/404 Rendrer/OWNER_TASTE.md` | The living owner log. Read it. Append after every owner message. |

## 2. The iceberg (the owner rejected 2 versions for getting this wrong)
- The iceberg is a DEPTH METAPHOR (Abyssal Detective). The camera's position on ONE photoreal berg = depth:
  - L1–2: above the water, on the tip.
  - L3: at the waterline.
  - L4+: underwater, darker each level.
- **Chart:** ONCE, in the intro, on the VO "levels" line. It's always charted (bars + typewriter names, deeper names blurred). NEVER a bare berg without its chart.
- **Level card:** black → WIDE berg → typewriter "Level N" on the waterline → it HOLDS. NO zoom/push before a case starts. The push happens at the case start, into the EntryCard.
- **Entry card:** black → depth close-up → ice-cyan glitch-type title → glitch cut into the footage.
- **Date card** once per case (typewriter, year in colour); a tiny name tag the first time a person is named.
- **Hook direction:** tilt DOWN (depth). Never up.

## 3. The case recipe (APPROVED)
1. **Every VO line SHOWS what it says.** Real footage first. Where footage can't show it, a crafted piece.
2. **At most 2–3 short Blender shots per case** (3–5 s each): the place, the mechanism, the aftermath. Owner: "2-3 is fine, use code under Remotion to make motions, not everything is Blender."
3. **All other motion is Remotion code:** n2dev devices, animated diagrams (Cutaway, ExplodedPart), timelines (DayStrip), counters, tracked FreezeReplay, line maps, HUD brackets. Never the same device twice in a row. ≥ 3 s of footage between devices. Every device eased, word-anchored, with its own real SFX.
4. **Footage:** graded (grade.py + channel.cube), smooth sub-pixel push, FilmLook. Raws 2–8 s only where the real sound IS the moment, subtitled. Replays only where the VO describes it.
5. **Pages:** rare, Parallel Pipes chip-lift, readable, the active phrase fully undimmed, one smooth camera direction.
6. **Maps:** Blender night terrain only if a 1-frame test is ≤ 15 s and ≤ 4 GB RAM. Else LineMap_D / MapPull_D.
7. **Sound:** real SFX only (never synthetic); Music 8/9/10; a bed change per case/level; VO gaps cut; master -16 LUFS / ≤ -1 dBTP.
8. **Example menu** (VO type → visual): PEAK_V5.md "Example menu" + the "Non-Blender devices" tables.

## 4. NEVER AGAIN (every owner correction)
**Text and look**
- No text restating the VO.
- No glowing title over footage.
- No 24-tile wall.
- No caption boxes or lower-third slop.
- No handwritten fonts.
- No red look-here circles, broadcaster discs or boxes. A source circle stays ONLY if the VO names it.
- No two-panel photos.
- No dark side bars: vertical clips sit on a BRIGHT blurred copy.

**Footage**
- No agency clips: Storyful, Newsflare, Jukin, ViralHog, Viral DRM, Reuters/AFP-credited.
- No TV b-roll with anchors. Police/government releases are OK with the bug cropped.
- No competitor footage, EVER (e.g. an Abyssal Detective copy).
- No Esri imagery.
- No blur on people who aren't hurt. Blur injured/dead faces in every frame.
- No-contact: cut before human impact.
- No clip reused between the intro and a case. No muddy night shots or slow push-aways in hooks.

**Craft**
- **No 1-frame glitches, flashes, tears or sudden zooms.** THE #1 recurring failure. The owner: "that's something your coding reflects".
  - **Cause:** news-copy sources carry the previous shot's tail and their own cuts. A window at `from: 0`, or one crossing a source cut, flashes 2–12 frames.
  - **Prevention is in CODE:** detect source cuts once per source (cache them). The plan lint asserts every window starts ≥ 3 frames after a source cut and never crosses one. `render_slot.sh` runs `microcut.py` on every chunk/preview/final and FAILS the job (rc 97 + .FLASH.txt).
  - Odd-fps sources use blended conversion. Slow-mo blends frames (no repeats). Designed glitches are ≥ 6 frames per state and monotonic (Datamosh: B never reverts to A).

**VO, timing and process**
- Keep the original VO. Never re-voice (e.g. "twenty five" stays even if 24 cases).
- VO sync is verified (≤ ±70 ms at 10 points).
- Follow the playbook rules (case order, reconstruction when there's no clean clip) WITHOUT asking the owner. The rules are in the docs.

## 5. Process and credits (the owner got very angry about waste)
- **Order:** build the intro + case 1 → the owner approves → build EVERYTHING. The owner checks the first 2–3 cases only, then wants FINALS, with no periodic previews.
- **Work case by case to DONE** (3D → chunk → microcut 0 → next). At most 2 cases in flight. NEVER render 3D far ahead. (The failure: 3 hours of 3D for many cases, 0 cases finished.)
- **Benchmark before planning 3D.** EEVEE with raytracing + volumetrics ran ~14 s/frame with 6 Blender jobs sharing the GPU (a 4 s shot ≈ 30–60 min). A 22 GB terrain map at 5 min/frame starved the whole machine. Test 1 frame first.
- **Machine:** AMD RX 9070 XT + Ultra 7 265K, 32 GB.
  - GPU: Blender. Encode with h264_amf cqp 16/18 / hevc_amf. NEVER nvenc or qvbr.
  - CPU: Remotion `--gl=angle`, `--concurrency 6-8`.
  - Always use `render_slot.sh` (classes cpu / gpu / enc, caps 4 / 3 / 3, gated by the live load probe). Pass the OUTPUT path as a visible arg so the glitch gate runs.
- **When agents are stopped, kill their queued render_slot waiters and Blender jobs.** Orphans kept running for hours and stole the machine.
- **No exhaustive QA:** no frame-reviewer agents, one still sheet per case, fix + splice only the changed range (never re-render a whole case/video for a local fix).
- **Few agents:** 1 builder per video, no helper sub-agents. Short reports. Don't relay every progress ping to the owner.
- **Previews:** always the FULL mix (raws + SFX + music + VO), phone h264 ≤ 29 MB, AAC 44.1k default audio. Never VO-only.
- **Finals:** `_FINAL/<video>/` + a copy in `C:/Users/avent/Downloads/<video>/`: 4K hevc_amf + 1080p, .srt, chapters.txt. Move temp files to `_TO_DELETE`.
- **Downloads** need owner permission. yt-dlp: `--cookies C:/Users/avent/Downloads/cookies.txt --js-runtimes node`, one at a time. KEEP cookies.txt. Never bypass bot checks or cookie walls.
