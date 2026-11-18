---
name: project-disturbing-games-compilation
description: "Oct 2026 compilation \"Most Disturbing Video Games Ever Made\" — 3 channel videos (Indie, Flash, China iceberg) re-cut into 37 numbered cases; folder compilation/"
metadata:
  type: project
---

Started 2026-10-23. Owner doc 17_r6FNLo-UXS3kmwo6TcHUKKJuHiz4EBYlXhVYy3dgU lists 3 of the channel's own videos: MJmUD2StTCY (indie, 12 cases), 5ZPSD-9NXXw (flash, 5 games), aSDagK2bml4 (China iceberg, 20 games, different AI voice → always LAST). Owner said "there is no korean, js 3 games and china last".

Folder `/Users/ekam/Downloads/404 thread/compilation/`: `edl.json` (order, in/out, CTAs), `tools/build_case.py` (head/body/tail parts, videotoolbox, separate audio pass), `remotion/` (CaseTitle, Cta, Hook, ChinaOpen, EndCard), `gfx/` overlays, `cases/NN.mp4`, `README.md`.

Delivered 2026-10-23 (2:08:41, ~/Downloads/Most Disturbing Video Games Ever Made - Compilation.mp4). Project cleaned to 40 MB (junk moved to Trash); **`compilation/README.md` PLAYBOOK = the approved compilation style + workflow — read it first for the next compilation.**

**Why:** reusable pipeline for future compilations of channel videos.
**How to apply:** YouTube auto-captions are seconds off — use whisper windows + RMS envelope for cuts. VP9 decode/VT encode ≈3× realtime per process; run 5 in parallel; only blur/overlay the head and tail seconds. Related: [[user-channel-404-thread]].
