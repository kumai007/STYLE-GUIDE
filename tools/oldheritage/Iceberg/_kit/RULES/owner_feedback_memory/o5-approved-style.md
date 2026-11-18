---
name: o5-approved-style
description: Owner APPROVED Jellyfish UAP v3 (2026-11-01) as the style for all OUTLINES5 videos; the rules + per-video variation that produced it
metadata:
  node_type: memory
  type: project
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-31T22:01:21.549Z
---

Approved build: `D:/404 Rendrer/OUTLINES5/build/2_Hours_of_Internet_Horrors/s016_mix.mp4` (v3). Owner: "it's good if you keep such thing + variations + remember what I told you to correct". The lost-media look was also good, but fern was used where it didn't fit.

Rules that made it pass (all binding, every case):
1. **Footage only where it shows what is said.**
   - Explanations get Visual Venture `vv` pictogram explainers (pair, split or equation; real-name labels only) or `diagram`s (route, level, lights, calendar, orbit, watch).
   - Never the same clip moment twice in a case.
2. **Clip maps (`OUTLINES5/clipmaps/<clip>.json`).**
   - Only the parts of a clip that belong to the case: no news anchors, promos, channel intros or reporter stand-ups.
   - A crop removes news chrome, and a speaker is zoomed into their own window.
3. **Nocturn backbone.**
   - One grade per video, shots merged into long holds, and clips skip their first 6 s.
   - Pages run at most 2 in a row, then cut back to footage.
4. **Farrell SS only on the line that proves a claim.**
5. **Case open:** the case's main footage with its title in serif, smart-cased (UAP stays UAP). Never number cards.
6. **Never on screen:**
   - Typed narration; fake quotes (song titles or fragments); fake posts, messages or profiles.
   - File names; names or places over unrelated material.
   - Face mosaics; mixed colour tints.
   - 68 QA-rejected templates (`src/prod/qa_rejected.json`).
7. **Material never carries across cases.** An opener uses its own case's main clip.
8. **fern 3D or Blender** only where nothing else can show or explain the moment. The desk/"book" set is disliked.

Pipeline:
- `shotlist.py catalog` (clips with their usable parts)
- editor agent following `OUTLINES5/EDITOR_BRIEF.md`
- `shotlist.py apply`
- `plan_video.cjs --allow <palette> --merge` with the channel ledger
- `render_list.sh`, which renders from the D:/rbundle/prod bundle, TEMP=D:/rtmp

Variation: each video gets its own grade, palette and signature devices from the ledger.

Housekeeping: clear D:/rtmp remotion-* temp folders and old bundles regularly, since D: filled up twice. Related: [[feedback-o5-autoassembly-rejected]], [[director-anti-template]].

**Live state / next steps:** `D:/404 Rendrer/OUTLINES5/HANDOFF.md`. Read it first after any context reset.

**Hold-break (2026-11-01 05:00):** `shotlist.py` used to break long holds by re-showing the same photo 5-7 times per case, which is ugly. It now uses, in order: the beat's own capped explainer (`_x`), then a fresh clip moment, then a still that has been shown at most twice. Otherwise the hold stays.
- The explainer run cap is 3.
- Check repeats only on picture beats: vv/diagram beats also carry an `image` key that is not rendered.
