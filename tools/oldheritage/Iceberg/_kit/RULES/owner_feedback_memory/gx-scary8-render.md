---
name: GX SCARY8 render gotchas
description: Remotion render failures on the shared SCARY8 machine (No frame found, delayRender timeout, ENOSPC) and the fixes that worked for v5
type: project
---
SCARY8 (8 GX videos built in parallel, 2026-10-22). Render failures seen while building v5 (E5 TAPE):
- "Compositor error: No frame found at position …" on prep.py outputs (h264_amf LUT fallback / x264 with B-frames). Fix: re-encode every prepared clip with libx264 -g 15 -bf 0 -r 30 (scratchpad norm.sh). VFR sources (TRE, ML1, ML2, WB2, KEN, LX4, LX5, ST1/ST2) need prep "conf": "fps=30" or their timing compresses.
- delayRender 28 s timeouts under load: render with --timeout 240000, concurrency 3 (tools/render.sh has neither; use a private wrapper).
- ENOSPC: every render bundle copies the whole shared remotion/public (~20 GB). Render with --public-dir pointing at a hard-linked slim copy (cp -al public/gx/vN) + fonts/sfx/dash/hn/vignette.
**How to apply:** for any GX/SCARY8 render, use the slim public dir + no-B-frame clips from the start.

- **2026-10-31 C: filled with 286 GB:** every `npx remotion render src/...` copies the whole public/ (29 GB in OUTLINES5) into %TEMP% on C:, and 314 such bundles piled up. Always render from ONE prebuilt bundle (`npx remotion bundle src/prod/index.ts --out-dir D:/rbundle/prod`, then `remotion render D:/rbundle/prod …`) with TEMP=TMP=D:/rtmp, and rebundle only after new assets. The old C: temp bundles (remotion-*) are the owner's call to clear.
- **"No frame found at position" on downloaded clips:** normalize every clip to cfr 30, -bf 0 -g 15 (GPU: h264_amf -rc cqp -qp_i 18 -qp_p 20); see OUTLINES5/tools/normalize_clips.sh.
- Remotion `--gl=angle` (GPU) was SLOWER than swangle on the RX 9070 XT (310 s vs 196 s): keep software; use the GPU for Blender and AMF encodes.
