---
name: feedback-templates-from-refs
description: Owner called invented template reel "mid": new templates must polish the measured library and vary along measured reference axes
metadata:
  type: feedback
---
2026-10-31: my lost-media "templates v2" (film strip, mosaic, light table, corridor dates — invented) were called "very mid, u did not check references".
Owner's reference roles: **Farrell = screenshots, fern / LEMMiNO = 3-D, Visual Venture = 3-D animations**, MagnatesMedia (51fWzJ-A5w4, fNh_GyRbJDA) for overall craft.
Goal: "50000 varieties off 500 templates, keep highest quality" = improve existing templates, not invent new devices.

**Why:** invented devices look generic; the library (GX channels/MASTER_TEMPLATES, 289 ref-vs-ours sheets, STYLE.md measurements) already matches the refs.
**How to apply:** start from MASTER_TEMPLATES families + their STYLE/VARIATIONS docs; add variety as measured axes + per-video identity (src/core/vary.ts, craft.tsx); show ours-vs-ref before the owner. Related: [[feedback-measure-refs]], [[feedback-no-invented-devices]], [[lostmedia-404thread]].

2026-10-31 round 2: owner: highlights "very bad and unreadable", fern/LEMMiNO/Magnates templates "not perfectly polished".
Fix that worked for SS: OCR glyph boxes (`tools_lib/phrase_box.py`, RapidOCR, cached .ocr.json, number-word + fuzzy match) and Farrell's off-monitor macro (`src/core/farrellSS.tsx`: 3-D tilt, focus band, RGB fringe, screen texture, blends that keep type crisp, greyscale copy for coloured-type highlights). Proof: `_tmp_vary/ss_demo.mp4`. Still to polish: fern/LEMMiNO 3-D, VV animation, Magnates identity layering, Depth25D portraits.

2026-10-31 round 3 (owner: "SS good, do 3D"): 3-D = real Blender 5.2 scenes (D:/blender/blender.exe, EEVEE ≈0.45 s/frame), CC0 Poly Haven props/HDRIs/textures in `D:/404 Rendrer/_assets3d/ph` (fetch_ph.py, needs a User-Agent). Templates `MASTER_TEMPLATES/tools_lib/blender/fern_desk.py` (evidence among real-text paper piles, lamp pool / blinds gobo / top spot) and `crt_room.py` (footage on Television_01, tube area light + camera-side key; brand covered). Played via `BlenderShot` + `Grade` (fern = 2.35 letterbox). Lessons: fern is low-key + barely-moving camera; EEVEE emission does not light a room (add a matching area light); write job lists with "\n" not CRLF.
