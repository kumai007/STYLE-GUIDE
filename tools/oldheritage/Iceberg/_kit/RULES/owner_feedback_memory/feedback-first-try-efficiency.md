---
name: feedback-first-try-efficiency
description: "Owner — 2h videos must be built right the first time; no repeated stills/review rounds, batch many cases per pass"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-24T13:14:33.820Z
---

Owner (WM_NEXT, 2026-10-24): "re-reading rounds drain credits… perfect the video within the first try itself… do many cases together."

**Why:** stills/review loops (4 rounds on one pilot) burn usage; on a 2-hour video that multiplies by ~25 cases.
**How to apply:** pilot once → write a reusable recipe/component API → build remaining cases in big batches straight from the recipe; at most ONE stills check per batch and one QA pass per render; render review cuts at half resolution. Related: [[usage-budget]], [[feedback-patch-not-restart]].
