# Style guide review (egm) — 2026-11-08

Reviewed `FARRELL_STYLE_GUIDE.md` rev 2 with four egm reviewers (structural, style, comprehension, zoom-out). Fixes went into `styleguide/seed.json` (and one legend line in `model.py` `render_md`), loaded as rev 3.

## Fixed
- **Transitions contradiction** (all four): rule 9 said "dip to black between sections", §9 said VHS for chapters and dip only before a date. Now one mapping in rule 9 and §9: crossfade inside a montage, dip to black between sections (new date, place or time), VHS for a chapter change, glitch when something breaks. "Cross dissolve" renamed "crossfade" everywhere.
- **"Hard cut" in the transitions list** (zoom-out): rule 3 now says a straight cut is not a transition; four transitions allowed; light leak counts as a crossfade.
- **Rule 8 unclear** (all four): pre-roll defined (audio starts 2.0 s before the picture cut, clamped to source head, ends with the picture; from the raw-editor skill), fade scaling written as `fade × (clip length / 9.18) × 0.98`.
- **Undefined terms** (comprehension): guide header now defines treated shot, raw footage, "(set by you)" and the v01–v05 labels; §8 defines a block; §11 defines LUFS; vignette ratio replaced by "edges N% darker".
- **Rule 2 vs captured pages** (zoom-out): VCR applies to text you add; captured pages keep their fonts.
- **Uncheckable rules 1 and 6** (style): rule 1 names what "made to feel wrong" means (glitched, desaturated, distorted); rule 6 gives the brightness target (70–90 of 255) and says to pick the 3–5 textures before the first edit and list them in the edit notes.
- **Number clashes**: title holds 2–4 s in §8 and §10; vignette 10–35% in both §4 summary and rule; "one accent colour" → two accents; "about" dropped from targets; LUFS range written low to high.
- **Duplicates**: user bullets that restate a rule-book line now point to it ("(rule 4)"); cold open kept only in §12; §2 "key moment" rule now about picture, sound stays in §11. Rules 47 (was 48).
- **§8 empty-black rule** now matches its evidence clip (text on black is allowed, empty black is not).

## Not changed (owner can decide)
- Loudness and music-gap tolerances (±1 LU, ±2 dB suggested by the style reviewer) — not set; the guide gives single targets.
- Moving all reference numbers to an appendix (zoom-out) — kept in summaries, one target per rule.
- Two v03 silhouette clips share a title, so the evidence label reads the same twice; they are different clips.
