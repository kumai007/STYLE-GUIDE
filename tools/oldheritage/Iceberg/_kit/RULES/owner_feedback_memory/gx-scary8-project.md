---
name: gx-scary8-project
description: GX channels SCARY8 — 8 scary videos being built by 8 builder agents; template library MASTER_TEMPLATES (284 hn templates); state + paths as of 2026-10-22 midday
metadata:
  node_type: memory
  type: project
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-22T05:04:55.802Z
---

New channel work (2026-10-22): 8 videos from Drive folder "Scary Videos Niche". Root `D:/EncountersEditor_v5.7/GX channels/SCARY8/`. Final titles = Drive folder names. Editors E1–E8 per `GX_EDITORS.md` (V1 Nocturn, V2 DD, V3 VV, V4 Farrell, V5 Tape, V6 Forensic, V7 Feed, V8 Archive).

- Voice: Algrow Stealth "new" (`default-pd4i7bs8z6-qjsqmqbjlxg__new-9fcmr`), Stealth 2.0, temperature 2, rate 1 — approved. VO plans `vo/vN/plan.json`; 59 contradicting sentences in c04+ rewritten + regenerated (`vo/vN/VO_FIXES.md`, `fix/`, `plan_orig.json` backup).
- Builders follow `BRIEF_BUILDER.md` (Nocturn measured handovers: raw 0.42 s after VO, VO back 0.8 s, pre-lap 3 s; one sentence = one picture; no invented text) + OWNER FEEDBACK 1 (no stray frames at cuts, crop app UI, no "#"/number gap, steady framing under VO, no black >1 s). Owner approved intros (V2, V3, V6). Each builder does all cases with footage then outro, writes `cases/vN/BUILD_DONE.md`; previews `build/vN/*_preview720.mp4`.
- Assets per video in `cases/vN/` (GATHER.md, raws.json, clips.json, broll via Pixabay key in tools/.pixabay_key). 13 cases have no footage (Reddit blocked from PC incl. VPN + Chrome extension; region-locked TikToks; private PAC) — owner checklist artifact https://claude.ai/artifact/VPnnL9wgKXpdER8msDx7Bj ; V1 c14 doll link is wrong video.
- Templates: `GX channels/MASTER_TEMPLATES/` (Remotion; `TEMPLATES.md` catalogue via `tools_lib/master_catalogue.py`; 26 families src/hn; legacy/ archive; INDEX.md). Template building STOPPED by owner. Export zip `D:/GX_EXPORT/GX_TEMPLATE_PACK.zip` (templates+music+sfx+pipeline+docs) — owner wants it on D: root.
- Rendering: GPU `--gl=angle` (7× faster). Remotion Freeze bug: use `<Freeze frame={0}><Media startFrom={N}>`.
- Owner rules: patch don't restart ([[feedback-patch-not-restart]]); interrupts/rejects kill agents ([[interrupt-kills-builders]]); kill only orphaned PIDs of finished agents; be credit-efficient ([[usage-budget]]).
- 2026-10-22 PC hang: 16 builders ran ~20 render/stills jobs at once (32 GB RAM full). Fix: tools/render.sh = 2 global mkdir slots, conc 4, temp C:/GX_RTEMP; BRIEF_BUILDER "MACHINE LIMIT". Max ~2 renders + few agents on this PC. D: was 97% full; D:\_titlecut_junk moved to C:\D_OFFLOAD (owner will delete later).
- 2026-10-22 evening: pipeline = detached `tools/queue_worker.sh` ×3 (queue `_tmp/queue.txt`, log `_tmp/queue.log`; `tools/requeue.sh COMP [FROM-TO]`), detached `tools/assemble.sh loop` → `SCARY8/FINAL/<Drive title>.mp4` + `FINAL/previews/`. render.sh: 3 slots, per-render hard-link public + temp under C:/GX_RTEMP (deleted on exit), 90-min watchdog, x264 superfast. All clips GOP-15 normalised (tools/normalize_gop.sh). kit2 ramp() volumes quantised 0.5 dB (ffmpeg expression overflow). Restyle (slop → reference look) applied to all 8 kits; V4 title removed (owner). V4 delivered 24:17 (under 30 min min). Skipped: V7 c04, V8 c05. Owner asleep, wants all 8 in FINAL by morning.
- 2026-10-22 20:42: ALL 8 DELIVERED to `SCARY8/FINAL/<Drive title>.mp4` (+ previews/): 22.9–27.5 min each — every one under owner's 30-min minimum (40 target); open item for owner. Render fixes that mattered: offthreadvideo cache 1.2 GB + 2 video threads (intermittent "No frame found"), negative startFrom clamped (lib/core/media.tsx, kit2 Mix), per-render temp on C deleted on exit (C filled to 5 GB once), assembler needs D:/ paths for ffmpeg concat.
