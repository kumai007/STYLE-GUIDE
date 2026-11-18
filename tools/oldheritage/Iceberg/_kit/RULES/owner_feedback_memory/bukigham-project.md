---
name: bukigham-project
description: Bukigham channel — 2 benchmark camping-horror videos (VAN 8 cases, CAMP 6 cases); root D:/EncountersEditor_v5.7/channels/bukigham; started 2026-10-23
metadata:
  type: project
---
Owner request 2026-10-23: two benchmark videos for channel "Bukigham" from Drive folders (VO mp3 + VO_ONLY; VAN also has CUT_SHEET; CAMP has none). Root `D:/EncountersEditor_v5.7/channels/bukigham/` (owner said "Encounters → channels → bukigham"). Everything an agent needs is in `BUKIGHAM_BRIEF.md` (identity, banned slop list, pipeline, hardware). VO: VAN 10.7 min, CAMP 14.2 min → 40-min goal only via real raw footage. Tools copied from SCARY8 and repointed (comps VAN-*/CAMP-*, media public/bk/<van|camp>/, queue in _tmp/). Phase A agents: van gather, camp research+cut sheet, identity kit (kit_bk.tsx, style/STYLE.md), Blender night-map + reconstruction kit.
Related: [[gx-scary8-project]] [[gx-scary8-render]] [[owner-quality-bar]] [[feedback-patch-not-restart]]

**State 2026-10-23 19:15:** both videos DELIVERED to channels/bukigham/FINAL/ (Van 47:33, Camp 56:52, 1080p + _preview720). Tools: tools/assemble_bk.sh van|camp, tools/popcheck.py (no-arg glitch finder), tools/final_chain.sh. Gotchas: requeue.sh spans on the same case collide (splice race) — use ONE span per case or a full render; worker marks a full job done if an old master exists, so rm the master before requeue; ffmpeg concat needs D:/ paths not /d/. Sound library: public/bk/shared/sfx2 (210 Pixabay SFX) + music2 (15 beds), catalogs. Device variety cap + raw detailing rules in BRIEF_EFFORT.md.
