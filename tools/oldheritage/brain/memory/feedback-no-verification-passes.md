---
name: feedback-no-verification-passes
description: "Owner rejects extra verification/QA rounds — do the work, spot-check, move on"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1240a462-7f52-4055-aeb3-fcd24a49ac51
  modified: 2026-10-22T05:28:09.287Z
---

Don't run extra verification or cross-check passes unless asked; do the task and report briefly.

**Why:** owner said "fuck the verification pls" after a VO-vs-script cross-check, and the pack's OWNER_TASTE log records "checking same thing 100 times is wasting usage". They value speed and frugal usage.
**How to apply:** one spot-check at most (e.g. a 12-frame stills sheet per case), fix only what's clearly broken, keep status replies to short lists. Related: [[user-channel-404-thread]].
