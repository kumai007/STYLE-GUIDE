---
name: feedback-3d-threejs
description: "3-D shots: use the Node.js 3-D library (Three.js in Remotion), never Blender (owner, 14 Nov 2026)"
metadata:
  type: feedback
---

Owner, 14 Nov 2026: "use node js 3d library for 3D". Every 3-D shot (maps, flights, mechanism, scale) is Three.js inside Remotion
(`@remotion/three` + `three` + `@react-three/fiber`, installed in `Iceberg/_engine`). No Blender.

**Why:** Blender is not on the Windows PC; Three.js renders in the same Remotion pipeline (fast: a 4.8 s map shot renders in ~14 s).

**How to apply:** maps → `Iceberg/_tools/render_map3d.sh <case.json> <out dir> <shot...> [--still <frame>]` (same case.json schema as the old
blender_map.py; code `Iceberg/_engine/src/dev/Map3D.tsx`). Other 3-D → a per-case device with `<ThreeCanvas>` in `_engine/src/dev/`.
Per-case public dirs are hard-link trees (`_tools/pubsync.sh`), because Remotion cannot copy links on Windows.
