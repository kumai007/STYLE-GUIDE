---
name: feedback-ae-camera-over-blender
description: "Owner 2026-10-31 — Blender 3-D is optional; prefer After-Effects-style 3-D camera motion (Remotion 2.5D) because it's faster"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-31T12:44:15.025Z
---

Blender sets are "not so important": use one only where it truly fits. The default for depth and motion is After-Effects-style 3-D camera work in Remotion: pages flown in 3-D, Depth25D parallax, tilt/DOF, camera moves.

**Why:** it's faster to render and the owner likes that style as much. Blender cost hours per video for little gain.

**How to apply:** keep the Blender adapters gated behind a prep render (`render` payload field), off by default in production. Spend variation effort on Remotion 3-D camera templates. Related: [[director-anti-template]], [[feedback-smooth-lit-camera]].
