---
name: wm-p25-project
description: "P25 \"25 Paranormal Moments Caught On Camera\" (WM_25), delivered 2026-10-17 05:11, 2:00:39; awaiting owner review"
metadata:
  node_type: memory
  type: project
  originSessionId: abf55149-6d54-4365-8529-f95a6d18868e
  modified: 2026-10-16T23:41:56.026Z
---

WM_25 was delivered on 2026-10-17 to `D:/Warrior Mind/FINAL VIDEO/` (that folder name is SINGULAR, not "FINAL VIDEOS"). Files: the mp4 (14.9 GB), the .srt and the chapters file. Measured 2:00:39, −16.0 LUFS, TP −1.7. It is waiting on the owner's review.

**How the deliverable is built:**
- Fixes and cleanup:
  - Owner fixes come from `docs/P25_FIX_PLAN.md`.
  - Every case has the old WM forest-plate card at 4.5 s.
  - 404 Remotion templates are copied into `renders/remotion_src/<k>/` with a `variant` prop.
  - Old caches are staged in `D:/EncountersEditor_v5.7/_TO_DELETE/P25_cache_live/`, where the owner has to Shift+Delete them.
- Assembly:
  - Copy each verified PREVIEW to `_FINAL`, intro and dividers included: `--assemble-only` won't promote anything.
  - Then run `tools/render_video.py P25 --assemble-only --out "D:/Warrior Mind/FINAL VIDEO"`.

**Lessons:**
- 404 template default props leak demo content: invented quotes, pointers, a Taiwan map (M102).
- On CLIP shots the EDL z/c keys are ignored, so use `motion` (M103).
- A caption overlapping a CLIP crashes render_v4 (M108).

Related: [[wm-pol50-project]], [[owner-quality-bar]], [[interrupt-kills-builders]].

**Update (2026-10-17 06:43):** re-delivered at 2:00:25 with the owner-approved intro. Intro rules: VO over real case clips with motion; no raw cold open; no printed narration text; title is the forest-plate handwritten card. The next-video kit, with all rules and components, is at `D:/EncountersEditor_v5.7/_NEXT_VIDEO_KIT/00_READ_ME_FIRST.md`. Start new videos from it.
