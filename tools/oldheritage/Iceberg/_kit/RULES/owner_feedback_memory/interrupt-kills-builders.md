---
name: interrupt-kills-builders
description: "Owner interrupting/rejecting a tool call stops ALL background builder agents; verify they're alive after any interrupt"
metadata:
  node_type: memory
  type: feedback
  originSessionId: abf55149-6d54-4365-8529-f95a6d18868e
  modified: 2026-10-16T21:02:02.438Z
---

When the owner interrupts a turn or rejects a tool call, every background subagent (builders) gets stopped too. On 2026-10-17 this left P25 idle about 40 min while I assumed the builders were working; the owner noticed and asked "are u not using full potential".

**Why:** the owner expects renders to keep running at full CPU, and they spot idle time.

**How to apply:** after any interrupt or rejected tool, run ListAgents and check CPU/ffmpeg before saying work is in progress. If the builders are gone, relaunch them with "resume from state" briefs that point at what's already on disk. Related: [[wm-pol50-project]], [[owner-quality-bar]].
