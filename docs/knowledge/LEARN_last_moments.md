# LEARN: last-moments (finalized 2026-11-27)

"Most Disturbing Last Moment Footage Ever Recorded": intro + 21 cases + outro, 2:17:47, 1080p60, Abyssal look, gx/HyperFrames.
Final: `finals/last-moments/` (FULL = hard link of `Downloads\last_moments_FULL.mp4`, -16.4 LUFS, TP -1.5 dBTP, 496,025 frames).
Media, builds and refs deleted 2026-11-27. Raw notes: `notes/productions/last-moments/` (handoffs, case notes, build scripts). Source: `docs/ai-state/last-moments_MASTER_HANDOFF.md`.

## Owner rules confirmed on this video (all styles unless the style says otherwise)
- Glitch transition only on the warning exit (with glitch SFX). Montage = clips floating up over a blurred bg, then dip to black.
- One title screen per case ("CASE N" + title, typewriter, VCR OSD Mono). Typewriter only there; other text fades in + click SFX.
- Name labels max 2 per case, plain, inside the picture. Places / minor names = centred text.
- CCTV stamp highlight = clean even red pill hugging the text, never rough, never off the picture.
- Narration cites a source -> show the real article (byline visible, key line marked), full frame.
- No photo / clip / article used twice. Stock: free licence, ILLUSTRATIVE label, graded like the raws (never B&W), minimum use.
- Mix: narration 100 %, music 75 %, SFX 60 % (`mixScale()` on top of the levelled mix). No abrupt cuts.
- Blur faces of victims / private people (Mosaic). Police CCTV allowed with "FOOTAGE: <agency>" credit.
- Intro text must match the narration word for word.

## Pipeline lessons
- Template that scaled to 20 cases: `cases/lm_lib.mjs` (makeCase + helpers, auto title, mix, raws) + `build/case_skeleton.py NN`
  (VO starts + raw cues -> `edit/skel/cNN.json`) + one builder agent per case with `docs/ai-state/last-moments_CASE_BUILDER_BRIEF.md`.
- GitHub farm was down (account hidden, dispatch HTTP 500): whole video rendered locally, GPU queue
  `case-work/renders/lm/render_queue_gpu.sh` (NVENC, Chrome on the RTX). Measured CPU: intro 59 s -> 520 s, c01a 186 s -> 1165 s,
  c01b 309 s -> 1729 s (5.6-8.8x real time); c11 v2 24,361 frames -> 7,395 s.
- QC privacy blur on frames from the RENDERED part mp4, not snapshots (snapshots seek late). Failures found that way: c09/c17/c19
  web-player bars in raws, c15/c17/c19 unblurred faces, c11/c20 readable plates. Check keyed boxes with a red-outline script.
- `H.frz` (freeze) ignores `mos`: a freeze of a blurred raw shows the face. Use a still + mos instead (c11 was patched in ffmpeg).
- Parts mix High/Main H.264 profiles: join with a re-encode per part (one-run join crashed at 1:51), then master loudness.
- Age-locked YouTube sources need sign-in: find public copies (news re-uploads) or download on the PC.
- Final extras: `docs/knowledge/notes/productions/last-moments/productions/last-moments/build/make_final_extras.py` (copy; inputs were deleted) makes chapters + .srt from part durations + `<audio>` VO tags
  in `parts/<id>/index.html` + VO word jsons (drift vs final: 0.04 s over 2:17). Reuse it for the next gx video.
- Phone parts: 640x360 30p, 10-min segments, ~350 kb/s (< 30 MiB each), one NVENC pass with `-f segment`.

## Open at finalize
- Owner OK for RAD (Kalamazoo County release) and WED (Kent police documentary) clips was never recorded.
- c21: convicted man visible unblurred in prosecutor footage (allowed: public court material); victim never shown.
- Rules above are in `styleguide/abyssal/abyssal.json` as open learnings (rev 48); promote them to the rule book when next in Abyssal.
