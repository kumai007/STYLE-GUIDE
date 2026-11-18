---
name: feedback-patch-not-restart
description: "When the owner asks for changes mid-build, patch only what they named; never cancel/restart the whole build or kill running agents"
metadata:
  node_type: memory
  type: feedback
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-22T01:42:38.449Z
---

Owner (2026-10-22, GX SCARY8): "keep doing builds for all of it but when I tell changes, instead of cancelling whole, change what needs to be changed."

**Why:** earlier, rejected tool calls/interrupts killed every running helper and work restarted from zero; the owner hates losing progress.
**How to apply:** on a change request, edit only the named template/case/span, re-render only that span (splice), keep all other agents and renders running. Never relaunch a whole video for a local note. Related: [[interrupt-kills-builders]], [[gx-scary8-project]].
