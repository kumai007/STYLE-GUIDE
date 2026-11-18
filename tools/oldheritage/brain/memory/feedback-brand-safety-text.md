---
name: feedback-brand-safety-text
description: "No YouTube-flaggable words (sexual terms, slurs, self-harm, attacker names) may be readable on screen, even inside quoted pages"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1240a462-7f52-4055-aeb3-fcd24a49ac51
  modified: 2026-10-23T04:54:48.815Z
---

The owner saw "pornographic videos" / "child pornography" readable on a news page in the Guy Game case and said "words like that would seriously cause troubles for me".

**Why:** on-screen text counts for YouTube monetisation and limited ads, even when it's only inside a captured article.

**How to apply:**
- Never put such words in our own typography.
- Frame page reads to avoid them.
- OCR every page/screenshot image and blur the flagged words automatically. In the Lost Games pipeline that's `tools/ocr` + `tools/redact_scan.py` → `remotion/src/lg/data/redact.json`, applied by `Space.tsx` `Redact`.
- Images drawn outside page planes need the same treatment.
- The word list covers sexual terms, slurs, self-harm, "underage", and the Christchurch attacker's name.

Related: [[feedback-shot-density]], [[project-lost-games-part2]].
