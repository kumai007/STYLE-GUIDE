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

## Open (next round)
- List still darker/smaller than refs: refs' hairlines are brighter/thicker and the backdrop has a lit upper area. Try band
  names 46-48 px, hairline 3 px .8, bg brightness .5->.6 at top.
- Bands 5-7 blurred at 47.6 s by design (focus follows the camera; each band sharp ~1 s as it passes, +-1 band readable).
  Confirm in a live preview (`tools/case-build/preview.sh lm_intro`) that every name reads.
- CASE card small "CASE 01" mono label over the name is faint; plate = HCR (subject visible, as v1).
- Return push uses getBoundingClientRect (pure per frame); verify on the farm render that the push lands on case 01.
