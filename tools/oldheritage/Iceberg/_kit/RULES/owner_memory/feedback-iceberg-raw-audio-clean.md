---
name: feedback-iceberg-raw-audio-clean
description: Owner 2 Nov 2026 — strip background music from every raw's audio (copyright risk), blur raws that are too graphic, follow the cut sheet's raw cues
metadata:
  type: feedback
---

Owner on TP01 preview: "did u follow cut raw shit, also make sure u remove bg music of raw … might be copyright music + raw etc be blurred if its too much".

**Why:** fair/arcade/car clips carry music that triggers Content ID; graphic raws hurt monetisation.
**How to apply:** run every raw's audio through `Iceberg/_tools/rawclean.py` (AST music detector + Demucs: voices + impacts kept where
music plays; venv `_tools/.audvenv`), use the cleaned wav, never the clip's own track. Keep raws at the cut sheet's ▶ RAW positions,
trim only dead air. Blur injured people / bodies / nudity in raws (object only). Related: [[feedback-iceberg-variety-full-power]].
