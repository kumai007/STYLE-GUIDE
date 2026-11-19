# last-moments intro v2 (Warning2 / Descent / DescentReturn / CaseCard2) handoff (2026-11-18)

Task: owner rejected intro graphics as "AI slop". Rebuild warning, 21-case list, list return/zoom, CASE 01 card in new
`hf-engine/devices/lm_v2.mjs`; swap names only in `cases/lm_intro.mjs`. Step 0 of case01a handoff = DONE (21:16).

## Ref study notes (ONL/UC8/UIN b10)
- Warning: photographic subject centred, red word + white line over it; refs use static/snow (banned for us).
- List: berg photo backdrop, ~7 white hairline rules = bands; names small white; deeper rows show ghost blurred names
  underneath; static camera in refs (we add slow eased tilt).
- Level card: huge word over photo, then zoom-through (camera flies past the word, it blurs huge), title over a zoomed plate.

## Media
- `media/last-moments/stills/descent_stairwell.jpg` (2560x1724, crop+mono grade) from Commons HABS "Looking down stairwell -
  Tacoma Rhodes Tower" (Public domain, HABS/LoC wa0139). Spiral stairwell with hanging lights = THE DESCENT motif.
- `media/last-moments/stills/warn_hcr_door.jpg` = HCR frame 2 cropped y62-422 (drops CH 1 + timestamp), blur 2.2, mono.

## Status (21:45)
- DONE: `devices/lm_v2.mjs` (Warning2, Descent, DescentReturn, CaseCard2; API block at top). `cases/lm_intro.mjs` swapped
  (devices + 'lm_v2'; L00 GlitchCut(Warning2), L09 Descent, L10 DescentReturn, L11 CaseCard2); backup of the old case:
  scratch `v2/lm_intro.bak.mjs` (old devices still in lm.mjs, revert = swap names back). Times unchanged.
- Build exit 0; `check --json` ok, 0 errors (6 lint warnings: duplicate img discovery from GlitchCut slice copies).
- Round 2: rotateX -30->-18 (end -11), perspective 2000 (round 1 read as italic on outer columns), deeper bottom darkening.
- QA sheet: `productions/last-moments/edit/qa/lm_intro_v2_sheet.jpg` (left ours 1.0/2.56/47.6/50.5/54.2/55.4/56.6/59.5 s,
  right refs ONL/UC8/UIN).
- MEDIA_LOG rows added.
- Abyssal guide Learnings: NOT saved. model.save() refuses: 8 existing learnings have a bad status (l-3b155a80, l-6d1a4645,
  l-e0589b2b, l-ab422dd7, l-868d5015, l-66df188f, l-3a653a5c, l-b5e8465f): pre-existing data, not touched. Note to add (status
  'open', date 2026-11-18): "2026-11-18 owner: intro warning card, case list and list zoom looked like AI slop (flat black,
  plain mono text, flat grid, flat yellow box). Fix: photographic textured backdrop with depth, text integrated with
  light/texture, layered bands with depth blur, 3-D eased camera moves, no flat highlight boxes."

## Polish pass (2026-11-18, lead fixes 1-4)
- Warning2: body lines Plex Mono 500 40px caps, tracking .14em, rgba(232,228,220,.9), dark shadow, no texture filter
  (tops 648/708); red glow copy blur 22 / .6 so the WARNING edge stays crisp.
- Descent deck: names 52px max, auto-fit `fs=min(52, 1000/len)` (long names ~43px, no column collisions), columns
  330/960/1590 (pitch 630), numbers 26px; hairlines 3px .85 + glow .35; bg brightness .6, top gradient .05 (band 1 lit).
  Descent focus blur: 0 within +-0.6 band of focus (`max(0,dd-.6)*1.4`, cap 5.5; no per-band base blur).
- DescentReturn unchanged: red hairline + sweep land under case 01 at 55.4/55.7 s (checked).
- CaseCard2 label: Plex Mono 600 28px, .3em, off-white .82 + dark shadow, top 372.
- Build exit 0; check ok, 0 errors (6 known lint warnings). Sheet overwritten: ours only, 2 cols, 1.0/2.56/47.6/50.5/
  54.2/55.4/56.6/59.5 s. Mid-descent 48.6-52.5 s: band in focus sharp, +-1 band readable. Backup of pre-pass device:
  scratch `v2/lm_v2.r2.bak.mjs`.

## Open (next round)
- Pre-existing: at 54.2 s (return rising) entry 01 alone is blurred while bands 1 entries 02/03 are sharp; cause not found.
- Right/left columns still lean slightly (perspective of rotateX), e.g. "SIGN-OFF", "RADISSON LOBBY".
- List still darker/smaller than refs: refs' hairlines are brighter/thicker and the backdrop has a lit upper area. Try band
  names 46-48 px, hairline 3 px .8, bg brightness .5->.6 at top.
- Bands 5-7 blurred at 47.6 s by design (focus follows the camera; each band sharp ~1 s as it passes, +-1 band readable).
  Confirm in a live preview (`tools/case-build/preview.sh lm_intro`) that every name reads.
- CASE card small "CASE 01" mono label over the name is faint; plate = HCR (subject visible, as v1).
- Return push uses getBoundingClientRect (pure per frame); verify on the farm render that the push lands on case 01.

## v3 owner-notes pass (2026-11-19, in progress)
- FONT DONE: `hf-engine/fonts/VCROSDMono-latin.woff2` (VCR OSD Mono 1.001, dafont free; woff2 from the ttf). build.mjs
  fontFace(): file prefix `VCROSDMono` -> family `'VCR OSD Mono'` weight 400. Use: add 'VCROSDMono-latin.woff2' to the case `fonts`.
- v3 DONE (2026-11-19). Part = 59.04 s (was 61.11). `node build.mjs lm_intro` exit 0; check ok, 0 errors (6 lint + 2 craft
  warnings). Sheet `productions/last-moments/edit/qa/lm_intro_v3_sheet.jpg` (25 frames, VO word on each). Backups (scratch
  `v3/`): lm_intro.v2.bak.mjs, lm_v2.v2.bak.mjs, old cut wav + words + vo_intro_clean.py.
- VO re-cut: `build/vo_intro_clean.py` CUTS[0] (0,0.16)->(0,0.135) + 30 ms ramp on the first segment (/f/ of "Final" starts at
  raw 0.16 and was cut hard there). New `vo/cut/c00_p01.wav` 47.475 s (media `vo/c00.wav` hardlink = same bytes; RE-UPLOAD to
  Drive for the farm). All clean word times = old + 0.025. Other 4 cuts checked by 10 ms RMS: all in silence, no hard onsets;
  gating removed nothing above -52 dB. Not Whisper-re-verified on the new file (words.json = remapped raw Whisper).
- Timeline (VO at 2.90; part t = 2.90 + clean t = old part t + 0.225): warning 0-2.60 (GlitchOut2 last 10 f) | HPK 2.60-8.105 |
  conveyor A 8.105-17.145 (LIP 60 dive full; CGF 19.5 @0.9 "stream sign-off" 9.685; CRV 195.5 @0.85 head cropped "vlog" 10.985;
  HCR "shop doorway" 12.80, full 14.30 + Met credit) | RAD 75 17.145-20.565 (masks, credit "FOOTAGE: KALAMAZOO COUNTY RELEASE"
  = my wording, confirm) | LIP 174 20.565-25.565 | conveyor B 25.565-32.855 (CRV 236 @0.4 "filmed themselves"; CGF 9.0 CG_B
  "friend's phone" 27.40; WED gate "security camera" 29.005, full 30.90 + credit) | conveyor C 32.855-46.535 (as before, P1 now
  CGF 19.5 @0.68 CG_A) | Descent 46.535-53.535 (dip out) | TitleType 53.535-59.04 (dip in). DescentReturn/CaseCard2 unused (kept).
- Audio: static bed drops 9 dB at 2.40-2.50 then fades to 0 at 2.87 (0.44 s); glitch_click at 2.42 peak = VO peak -9 dB;
  music from 0 (1.5 s fade-in, unchanged); riser 40.625; boom + title music at 53.765; 23 key ticks (tick_soft, VO peak -20) on
  every 2nd typed char; old ledger tick removed. Audio was checked by numbers only, NOT listened to in a render/preview.
- Open: CRV 236 beyond source 237.6 shows the vlogger's face (do not raise the speed); HCR in the 2-up panel shows the doorway
  only (man enters when it goes full); CGF selfie now appears twice (conveyor A + C); intro is 2.07 s shorter (any part that
  assumed 61.11 s must use 59.04).

## v4 conveyor A/B replacement (2026-11-19, done)
- Owner: "sliding used 3 times; the ending one is good; first two do something different, the way Abyssal Detective does". C unchanged.
- Refs (latest5 b10 hooks): hard full-frame cuts, ONL 21.9 posterised glitch-in, ONL 25.5 clip boxed over blurred fill, punch-ins on the
  same clip (ONL 35.4, UIN 23.6, UC8 27.2), ghost dissolves (UIN/UC8), SB2 25.2 static 2-up split. No slides anywhere.
- New devices (lm_v2.mjs): GCam (dark stage + punch-in), GBox (clip box, hard on/off, 6 f luma slice-glitch per frame in g, dim, full).
- A 8.105-17.145: split re-lays out on each word with a glitch cut: LIP full -> halves (+CGF 9.685) -> thirds (+CRV 10.985) -> 2x2
  (+HCR 12.80) -> 10 f punch-in on the doorway cell 14.30. CGF speed 0.9 -> 0.72 (stays inside CG_A keys). CRV scale 1.6 (no head).
- B 25.565-32.855: CRV full; "friend's phone" 27.40 CGF square box 780 px (right) glitches in, CRV dims (0.5 + 2 px blur);
  "security camera" 29.005 frame glitch-cuts to WED, box stays; box glitches out 30.90; credit moved to bl 214.
- SFX: whooshes for A/B moves removed; new `sfx/lm_glitch_s.wav` (lm_glitch first 0.17 s, fade 0.09-0.17; I -28.9, max M -26.2
  padded, TP -17.8) on all 6 glitch cuts at music -3; one whoosh (music -4) on the punch-in (peak on its mid, start 13.914).
- Build exit 0; check ok, 0 errors (7 lint warnings: +1 duplicate-media from slice copies; 2 craft, old). Sheet
  `productions/last-moments/edit/qa/lm_intro_v4_sheet.jpg`. Backups: scratch `v4/` lm_intro.v3.bak.mjs, lm_v2.v3.bak.mjs.
- Open: LIP third (11-12.8) shows mostly water (diver leaves frame in source); audio checked by numbers only; lm_glitch_s needs
  Drive upload for the farm.
