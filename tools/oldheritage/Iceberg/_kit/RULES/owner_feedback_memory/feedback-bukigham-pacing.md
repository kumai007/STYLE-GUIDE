---
name: feedback-bukigham-pacing
description: Owner rules after Bukigham pilot r2: Nocturn is THE model, intro first (no raw cold open), channel page SS per case, visuals for off-footage info, fast pacing with TTS pauses cut, easing on every animation
metadata:
  type: feedback
---
Owner on pilot r2 (2026-10-23): "pacing, clips, everything is imperfect; so slow; you didn't cut the AI voice; no easing on animations; no channel SS; no raw-only part at start — just intro with perfect animation; when out-of-box info is talked add out-of-box stuff; Nocturn is the prime example for this niche, others are 2nd-hand for showing info/blogs."
**Why:** measured "Nocturn opens on raw" was applied literally; TTS VO had ~3.5 min of pauses per 20 min; linear motion; generic footage under off-footage narration.
**How to apply:** tighten TTS VO first (tools/tighten_vo.py, pauses → 0.3 s, saves ~1.5 min/20 min); start with an animated intro; every case opens with the creator's real channel/video page capture; every off-footage fact gets a page/map/stock/graphic; picture change ~2–4 s under VO; trim raws to strongest seconds; ease every move. Owner rules override measured reference behaviour when they conflict. Related: [[feedback-measure-refs]] [[bukigham-project]] [[owner-quality-bar]]

**Also (owner, after r3):** "we have 500+ templates — reverse-engineer and adapt them; what are you doing" → always start a device from `GX channels/MASTER_TEMPLATES` (TEMPLATES.md, _sheets/, Nocturn families nocPages/nocMotion/nocText/nocEvidence first) and adapt; build from scratch only when nothing fits. Page/channel SS must be glitch-free and silky (frame-step every entry/exit).

**Owner on r5:** runtime = ~20 min AI voice + **22+ min raw** (raw is the backbone; give creators time to speak, follow cut-sheet RAW blocks); type reveals slow + hold ≥2 s; intro ends with a creative shrink into case 1; no plain quote text on a blurred face; picture change every 2–3 s so nobody is bored; be cost-efficient (lean agents, no polling).

**Owner on first full cases (effort):** "doesn't look like the most-effort video — needs 3D motion, animation, styles, effort of 1000 editors"; no music under raws (raw's own sound only); never re-zoom the same shot to fill VO. → BRIEF_EFFORT.md: ≥2 designed motion shots per VO minute (2.5D parallax via depth maps, 3D page fly-through, kinetic line, infographics, stock, boards), ≥1 Blender reconstruction per case (style/RECON_QUEUE.md), each source window used once.
