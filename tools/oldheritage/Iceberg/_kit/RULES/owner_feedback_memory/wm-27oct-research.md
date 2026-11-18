---
name: wm-27oct-research
description: WM_27OCT 35-case research pack (2026-10-27), with 16 repeats of earlier videos; TikTok now downloads with yt-dlp --impersonate chrome
metadata:
  type: project
---
WM_27OCT is at `D:/EncountersEditor_v5.7/WM_27OCT`. It was built from owner doc 18DvCtkZ… (35 cases, S-numbers).

**Contents:**
- `links.tsv` (case 13 has a 13b CCTV clip), `cases/NN.md`, `cases/00_RANKED_SUMMARY.md` and `repeats.txt`.
- In Downloads: the docx "Warrior Mind - 27OCT 35 Case Breakdown (for script)" and the folder "Warrior Mind - 27OCT 35 Cases Pack", with clips named by rank.

**Repeats and drops:**
- 12 cases are confirmed used in WM_NEXT "Scariest Encounters": 04, 10, 16, 20, 22, 23, 25, 26, 27, 29, 30, 31.
- 4 more show up in the GHOST/WM_25 files (06, 07, 15, 17); whether they were actually used is unconfirmed.
- Suggested drops: 02 (robot vacuum) and 09 (fungus hoax).

**Downloading:** TikTok works from this PC as of 2026-10-27 with `yt-dlp --impersonate chrome`. Reddit needs `Downloads/cookies (2).txt` plus impersonate. Doc links come from `export?format=html` hrefs, because the txt export drops them.

Related: [[wm-20oct-research]], [[case-source-picks]], [[usage-budget]].

**Round 2 (2026-10-27/28):** owner doc 1UjFqOLj (the 300-case research doc). The FINAL selection is in Downloads, "Warrior Mind - 27OCT FINAL Selection (for script).docx" plus its Pack: 10 Tier A and 9 Tier B cases. Built in `WM_27OCT/FINAL` and `doc2/`.

**Lesson:** the 300-doc's 230 unlinked TikToks are almost unfindable by web search; finders got 3 out of 75. Ask the owner for links instead.

**Round 3 (benchmark CSV of 840 cases):**
- Final v2: "Warrior Mind - 27OCT FINAL Selection v2" docx plus Pack in Downloads, 16 Tier A and 14 Tier B. Built in `WM_27OCT/FINAL2` (`bmap.txt` maps case 41+ to B-ids in `bench/`).
- Lesson: the benchmark list's pitches oversell, and 1 of the 30 was Sora AI (B249).
- Best new find: B150, the rocking chair.

**Build (2026-10-27):** INTRO + C01 v2 at `D:/Warrior Mind/WM_27OCT/build/intro_c01_v2.mp4`; recipe for cases 02–29 = `WM_27OCT/CASE_RECIPE.md` (kit27.py, per-case folders, auto-registered `src/wm/cases/cNN.tsx`). Owner v1 critique: no kid blur, no decorative Blender sets (Blender only to explain), raws must include the moment the VO sets up, intro card "25", explanation devices (clip bar, damped/driven graph, floor plan, swing) were good.

**Build state 2026-10-28:** full video assembled → `D:/Warrior Mind/FINAL VIDEO/Warrior Mind - Disturbing Videos People Never Meant To Make.mp4` (1:25:48, -16.0 LUFS, TP -1.7) + `_chapters.txt`. Assembler `D:/Warrior Mind/WM_27OCT/tools/assemble.sh`. Gotcha: intro_c01 render has 1/15360 timescale vs 1/90000 elsewhere → stream-copy concat breaks (black 18 min); remux with `-video_track_timescale 90000` first. Open owner calls: 2h vs 1:25 length, close says "Twenty-nine", c13/c18/c26/c27 VO-vs-footage lines, c20 face blur.
**2026-10-28 v2:** owner wanted 2h, settled on 1:35 target; raw-extension pass (only changed cases re-rendered) + 8 VO sections re-voiced → re-assembled 1:30:54, -16.0 LUFS, TP -1.6. Sources exhausted (35.9 min total footage). Old VO in vo/raw_v1, vo/src_v1. assemble.sh now remuxes all parts to 90000 timescale.
**2026-10-28 v3 (VO-cut fix):** owner flagged VO cut mid-sentence around raws. Cause: make_words.py spread multi-word SRT blocks evenly (±1 s). Fix: tools/align_words.py (faster-whisper word times, misses keep old time+offset) + kit27 seg ends after voice decays (0.12 s fade), 0.45 s beat + reverse_swell into raws, kit27.tidy() (short shots/jumps/overruns). Also kit27 never refreshed remotion/public/vo copies after re-voice (c03/c04/c08/c13 had old VO) — now mtime-checked. All parts re-rendered, re-assembled 1:30:53, -16.1 LUFS, TP -2.0. LAN download: node scratchpad/serve.js on 192.168.29.198:8765 (node already firewall-allowed).
