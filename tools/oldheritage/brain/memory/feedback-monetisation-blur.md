---
name: feedback-monetisation-blur
description: Owner's monetisation rule — blur nudity and extreme violence (gore, carcasses, kill footage); blood alone is fine
metadata:
  type: feedback
---

Owner on 2026-10-24, after seeing an IHNMAIMS hanging-carcass frame: "can we have stuff blur like this… not blood, it's fine, but nudity, too much
violent of course".

**Why:** keep the video monetisation-friendly without censoring ordinary horror imagery.

**How to apply:**
- Before delivery, scan the finished master at 1 fps on contact sheets.
- Blur nudity, gore and kill footage, violent on-screen text (subtitles describing killings, self-harm phrases) and profanity headlines.
- Do it post-render, on segments, with tools/censor.py: full-frame gaussian for pictures, region blur for text. Keep the uncensored originals.
- Leave plain blood alone.
- Suggest manual mid-roll points at case bridges.

Related: [[feedback-brand-safety-text]], [[feedback-no-padding-templates]].
