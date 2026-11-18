# Case agent brief (one agent = one case file, <= 5 min)

You write ONE file: `<edit>/cases/{CID}.json` for case {CASE} "{TITLE}". Format: `tools/autoedit/schema.md`
(beats table) and `edit_schema.json`. Do not read anything else; do not render; do not touch other case files.

## Inputs (pasted below by the lead)
1. Cut-sheet section for {CASE}: story beats, raws to play (source windows), devices allowed for this case.
2. Media log for sources {SRCS}: per source, timed rows (what is on screen, cuts, privacy flags, best moments).
3. VO takes {TAKES}: numbered word lists (`index start sentence word`) from `compile.py <edit> --words <take>`.
4. House-style row for this case: opener type, devices (max 1 page, 1 map), framing per source, music bed.
5. Already-used devices/openers in other cases (avoid: no device in > 2 cases, no repeated opener).

## How to write it
- `flow` in story order: `vo` (beats), `raw` (source audio, captions in seconds from raw `in`), optional `hold`.
- Each VO beat after the first gets `w` = index of the word where the picture should change (cut lands 0.15 s
  before it) and `say` = those words. Change picture on meaning (new noun / place / action), every 3-8 s.
- Every beat >= 3 s (count words: about 2.5 words/s; the voice runs ~3.2 words/s). Give every beat a source window
  at least as long as its words take: the compiler never crawls at 0.5x; a short window grows to the next source cut
  and then lint flags any overlap with your other windows (2026-11-16 test). Picture ends where VO ends; the last beat fills to the end.
- `src`/`in`/`out` from the media log; never cross a source cut, never reuse a window used earlier in this case
  (slow replays only via `hold` or speed <= 0.5). Before a raw, end the beat with `"fit": "end", "out": <raw in>`.
- Date on the first case shot (`"date": true`). Text (page/map) on screen >= 3.5 s. Captions only on raws.
- Pages/maps: use only the ids listed for {CID} in `<edit>/assets.json` (<= 1 page + 1 map per case):
  `"page": {"id": "{CID}_<id>", "hl": <highlight index>}`, `"map": {"id": "{CID}_<id>"}`. Never invent a page or map;
  if none is listed, use none (lint fails a beat whose asset or highlight boxes are missing).
- Privacy-flagged windows: add `cabin`/`haar` or make sure keys.json has runs there (lint tells you).
- No banned looks (typewriter, tilt 3-D pages, tier cards, phone motif, berg, glitch, stamps, tape/VHS, cyan).

## Done = lint passes
`python -X utf8 tools/autoedit/lint.py <edit> --case {CID}` -> fix every line it prints for {CID}, re-run until
it prints nothing for {CID} (PASS or only other cases' issues). Reply with one line: `{CID} PASS, N beats, M s`.
