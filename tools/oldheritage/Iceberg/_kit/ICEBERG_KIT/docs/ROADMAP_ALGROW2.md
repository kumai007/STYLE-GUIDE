# ROADMAP: finish the 3 algrow-2 videos (lead, 2026-10-26)

Approved style: `Disasters2/LOCKED_SYSTEM_V4.md` (intro + case 1 v4). All 3 videos are the SAME new channel, so they use the same system, the iceberg identity and the same rules. Each video gets its own iceberg chart (its own case names) and its own title card.

## Videos
| Video | Project | Assets | Cases |
|---|---|---|---|
| Disasters Vol 2 | `D:/404 Rendrer/Disasters2/` (intro + c01 DONE, v4) | `iceberg/algrow 2/videos before disasters [ vol 2 ]/` | 24 (c01 done) + outro |
| CCTV Vol 1 | `D:/404 Rendrer/CCTV1/` (new) | `iceberg/algrow 2/CCTV INCIDENTS [ VOL 1 ]/` | 25 + outro (c01 [AD] source x-8vPuMLcqo missing: build c01 from what exists, or flag) |
| CCTV Vol 2 | `D:/404 Rendrer/CCTV2/` (new) | `iceberg/algrow 2/CCTV INCIDENTS [ VOL 2 ]/` | 25 + cold open + outro |

VO for all three is in `iceberg/algrow 2/_voice/` ("new" voice, final). Owner decisions are in `iceberg/algrow 2/HANDOFF.md` (Disasters: already applied).

## Pipeline per video
1. **Setup** (CCTV only; Disasters is done):
   - Copy the Disasters2 Remotion project skeleton (src/d2 → src/<id>, the libs, grade, tools), keeping it compiling.
   - VO: the full read is as-is. Apply any HANDOFF owner decisions, and cut nothing else.
   - Case order: the best real-sound case first; non-fatal first, fatal last.
   - Gap-free timeline with `runtime_tight.py` (Disasters2/tools): raws only where the real sound matters.
   - Iceberg data (levels + names) → chart. Intro (same recipe as the Disasters v4 intro: warning card, hook cut on VO beats with no one hurt, the charted berg on the "levels" line, the chart, the Level 1 card).
   - Send main a phone preview of intro + case 1 for the owner. Keep building; don't wait.
2. **Cases:** per case, the recipe in LOCKED_SYSTEM_V4.md. Plan in `maps/map_cNN.md` (one table: VO words → shot/device), then build, lint, cutcheck, and render the case as its own chunk.
3. **Render side by side:** every heavy render goes through `bash "D:/404 Rendrer/_shared_tools/render_slot.sh" <cmd>` (at most 2 at once, machine-wide). Render each case as a chunk when it's done (picture-only ProRes or h264 cqp 16 intra-ish), so cases from different agents render side by side.
4. **Assemble per video:** concat the chunks frame-exact; the mix (mix_v3.py pattern) for the whole video; master −16 LUFS / ≤ −1 dBTP, full→limited range; check VO sync at 10 points; full cutcheck; 4K upscale (4 parallel hevc_amf); chapters.txt; CC .srt from the word timings.
   - Deliver to `D:/404 Rendrer/iceberg/algrow 2/_FINAL/<video>/`.
   - Move temp files to `_TO_DELETE`.

## Budget (credits)
- Maps (Blender, about 36 min each): at most ~1 per 3 cases.
- 3D reconstructions: 2–4 per video.
- No reference re-study, no frame-reviewer, one still-sheet look per case, one render per case. Fix and splice instead of re-rendering whole cases.
