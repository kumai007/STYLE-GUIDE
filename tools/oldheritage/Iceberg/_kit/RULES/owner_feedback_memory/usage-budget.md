---
name: usage-budget
description: "WM_GHOST used most of the owner's weekly Max limit (96%) via 17 parallel agents; keep agent fan-out lean"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 86ae7d80-6282-4338-93a2-44b9a1ee0f54
  modified: 2026-10-20T22:39:51.671Z
---

On 2026-10-21 the owner asked whether I had used their Claude usage from 40% to 100%. The WM_GHOST build ran for about 12 h with 17 background agents (200k–480k tokens each) and left the weekly limit at 96%.

**Why:** the owner pays the usage and noticed the burn.

**How to apply:**
- Use fewer agents, each with bigger batches.
- Use a cheaper model for mechanical work: downloads, grading, QC runs.
- Lock the case-1 template before fanning out.
- Keep reviews targeted.
- Check get_usage before launching a batch, and tell the owner the cost.

Related: [[wm-ghost-project]], [[interrupt-kills-builders]].
