---
name: feedback-smooth-lit-camera
description: "404 thread lost media v1: owner saw keyframe jerks, wanted a breath before case 1, more varied lit treatments (fern/LEMMiNO/Farrell lighting)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-30T13:08:57.252Z
---

Owner on lost-media intro+case1 v1 (2026-10-30): "good but at some point very rough in movements and keyframes, a very weird jerk… not perfection"; "when case 1 starts give it space"; "more case reels, better lighting, perfection, fern/LEMMiNO and Farrell".

**Why:** per-segment eased camera keys (hold → move → hold) change speed abruptly at each key; flat-lit pages read as screenshots, not cinematography; the same Snap device was used 6× in one case.

**How to apply:**
- Never hand Space raw per-segment keys: use `SSpace` / `smooth()` in `LOSTMEDIA/remotion/src/lm/kit.tsx` (one monotone cubic through all keys, sampled per frame). Ken Burns stills move at constant speed after a soft start, never stopping inside their layer.
- Every page/photo shot gets the `Lit` light pool (hot-spot + falloff + cool/warm cast, slow drift).
- Prefer the lit 3-D library treatments that render clean (CRT3D, Desk3D, Monitor3D, Tilt, PageMacro) and keep any one treatment ≤2 per case.
- Give each case's title ~1.8 s before its narration starts.

- Owner same day: "don't use SFX of these fucking microwave, people thought their PC was about to blow up" (the electric/fluorescent hum) and "magnifying glass is very useless". So: no hum/drone/buzz beds, only high-quality SFX where truly needed (lost media head now has one shutter only); no SSLoupe; no Snap punch-ins in a sleep video — use `PageMacro` (slow lit push onto the line).
- Library 3-D scenes Laptop3D, Frame3D and Phone3D flashed single black frames (and Frame3D's light beam flickers): don't use them, or scan renders for 1-frame dark dips (signalstats YAVG) before sending.

Related: [[lostmedia-404thread]], [[feedback-ss-variety-craft]], [[owner-quality-bar]].
