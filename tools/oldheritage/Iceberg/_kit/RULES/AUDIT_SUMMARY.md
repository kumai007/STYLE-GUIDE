# OUTLINES5 audit — 2026-11-01 (77 rendered sections, 4 videos)

Verdict: **all four videos rejected. No section is shippable.**

| Video | Sections audited | Missing (render failed) | Severity range | Closest to OK |
|---|---|---|---|---|
| Internet Horrors | 15 | s001–s003, s011 | 4–10 | s010 I Love Bees, s016 Jellyfish, s017 Boards of Canada |
| Flash Games | 25 | — | 5–10 | s023 The Day, s021, s022, s015, s008 |
| Japan Iceberg | 18 | s002, s004, s007, s008, s011, s013, s015, s016 | 5–10 | s021 Akira, s018 Misaki, s019 |
| Lost Games Sleep | 19 | s001, s008, s018 | 4–9 | s017 Fireteam Rogue, s016, s020 |

## What is wrong, everywhere
1. **Frozen pictures.** HOLD fills 25–88 % of each case (Japan 34 % of runtime; Matsumura 2.5 min blank grey; Kimie 84 %).
2. **Icon cards as filler.** Hundreds per video (Flash 448, Japan 260, Lost Games 474). ~12 glyphs relabelled with nouns (envelope = passport/books/newspaper, fence = police/prison/Shadowgate), the same card 3–7× in a row, empty half-drawn pills.
3. **One clip per case.** Most cases cut a single walkthrough/news package 30–60×; same moment repeated up to 349 pairs.
4. **Pictures don't match words / wrong people.** Zhemao (a woman) as a bearded cartoon; Tiphaine caption on her sister; Macron over unrelated lines; "LIAM ROBERTSON BALLOUZ"; 1915 Treasury receipt for a pizza-box receipt; Emily Short card while other critics are named; climaxes shown as cards; spoilers early.
5. **Unfiltered screens.** Wikipedia footnotes / references / See also, news anchors and chrome, streamer facecams, watermarks (IGN, Bandicam, NORTEMARK, G4MESTUBE), timecodes, an ad banner, burned subtitles.
6. **Harms.** "DATE OF DEATH → KEIKO" (living mother); private usernames and a YouTuber's birthdate on screen; "YOU" crossed out during a police appeal; face mosaics.
7. **Broken renders.** Dead clips as blank blue/black frames, black date cards, red frames, ~40 black frames in Lost Games alone.

## Root cause
The editing was done by an automatic planner plus "variety" scripts. They enforced counts, not meaning, and filled every gap with a HOLD or an icon card. Nothing checked that a picture fits its sentence, and I rendered everything without reviewing a single finished section.

## Fix (rebuild, not patch)
1. **Material first.** Per case: ≥4 distinct clips, a photo of every named person/place/object, the actual items narrated (sticker, letter, receipt, cartridge). Thin cases flagged before editing.
2. **Sentence-by-sentence shot plan by an editor**, not the planner: each line gets the picture it describes; climaxes get footage.
3. **Icon cards ≤3 per case**, only for a real relation (cause→effect, compare, number). No name cards, no noun labels.
4. **HOLD ≤4 s and only on the same subject.**
5. **Screen QA before render.** OCR rejects footnotes, reference lists, watermarks, usernames, timecodes, ads; dead-clip and black-frame check per shot.
6. **Full-frame footage by default**, lighter vignette, one grade.
7. **Pilot one case, I review every frame, then you see it.** Only then roll out.
