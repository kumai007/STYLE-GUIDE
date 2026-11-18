---
name: wm-27oct-v3-rebuild
description: "WM_27OCT v3 (2026-10-29) — first 40 min replaced by 9 owner-picked cases at 45:55 VO:raw, ~2:09 target; state, order, files"
metadata:
  node_type: memory
  type: project
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-30T06:28:59.769Z
---

Owner (2026-10-29): first 40 min drives AVD, so replace thin-raw cases; target VO:raw 45:55, ~2h; raw per case has no 3-min cap.

- New cases in `D:/Warrior Mind/WM_27OCT/new9/` (src, transcripts, cuts/, scripts/ — LOCKED script = WM_27OCT_New_Cases_Script_v5.md, owner-edited). Knife case (BlackWing "provoking", fishing-line self-debunk) dropped; Biltmore lamp video is Jukin-licensed, never used.
- VO: Algrow stealth "gx horror" `default-pd4i7bs8z6-qjsqmqbjlxg__gx_horror`, model 1.5, rate 1.1; jobs in new9/vo/jobs.txt; plan ids intro2, n01-n08, n10 in vo/tight.
- Order (card #): 1 n04 Biltmore, 2 n07, 3 n10, 4 n05, 5 n03, 6 n08, 7 c04, 8 c09, 9 c13, 10 c14, 11 n01, 12 c15, 13 c16, 14 c17, 15 c18, 16 c19, 17 c20, 18 n02, 19 c21 … 27 c29, 28 n06 camp, close. Removed: c01-03, c05-08, c10-12. Gonjiam/iamerrol placed to keep c16→c17, c19→c20, c22→c23, c25→c26 "our next clip" transitions adjacent.
- Kept cases renumbered via `tools/splice_card.sh` (re-render only the 4.5 s card, stream-copy the rest; plan.py backups in work/plan_bak_v3). c09's "next one" teaser trimmed (words.json + plan.py) → full re-render c09_v5.
- Intro card "25" and close "Twenty-five videos" though there are 28 cases — owner chose KEEP 25 (2026-10-30); don't change.
- Builders brief: new9/BUILD_BRIEF.md (4 builders A-D).

Related: [[wm-27oct-research]], [[feedback-wm27-pilot]], [[usage-budget]].

**Delivered 2026-10-30 04:20:** FINAL VIDEO/Warrior Mind - Disturbing Videos People Never Meant To Make.mp4, 2:01:27, -16.1 LUFS, TP -1.6, black only at 4 card hand-overs (~1-1.3 s). Parts list work/parts_v3.txt, assembler tools/assemble_v3.sh (PARTS env). Old v2 final in _TO_DELETE/WM27_final_v2. New cases have channel-page openers, Farrell description pages, MapSat; builder device files remotion/src/wm/cases/c101/c103/c104/c105.tsx (registry only loads c<number>.tsx).

**Uploaded by owner 2026-10-30.** Cleanup: 565 superseded build files (79 GB) + WM_27OCT/_tmp (38 GB) moved to _TO_DELETE/WM27_after_upload. build/ now holds only the 30 final parts in work/parts_v3.txt (+ _video/_master/_qa, so splices stay possible).
