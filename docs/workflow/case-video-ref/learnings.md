# Learnings, review pass and feedback loop

## What the 6 source videos taught (2026-10-14 to 2026-10-19)
The videos: Van Camping (Juan), the 10-minute test, Kyle Ward (twice), 8 Disturbing Van Camping, 8 Disturbing Van Life.
- **Reuse slips through.** A frame review found one 51 s shot shown four times in a single cut. Check the "nothing
  shown twice" rule (rules.md 3.2) across the whole job, not per case.
- **Ultra-short shots were the most common complaint.** That is why the floor (now 4-5 s, 2026-10-25) and the shared shot for sentences
  under 3 s exist. The 2-5 s cap from the master prompt was dropped on purpose.
- **The bed sat too loud three times** before it settled: -24/-20, then -27/-22, then -32/-27 LUFS (case/intro).
  Start at the final values.
- **The intro booms and riser were never checked in a real render.** Listen before trusting them.
- **Pre-roll was set to 1 s** by the user ("one second overlap"), not the master prompt's 0.5 s and not 2 s.
- **Black and warning cards inside raw cues.** Trim the wordless head and tail. Black left inside keeps its own sound
  and captions. The red audio-wave plate is gone.
- **The review pass moved to the first 3 minutes** (user 2026-10-19; before that it covered cases 1-2). Show that
  section first, and only then do every case.
- Every check that ran on case 1 has to run on every case. The edge clipping and narration mismatches showed up later
  in the film.

## Measured targets (Encounter Studio, from the reference channels)
These are the targets rules.md uses: VO to raw 0.5-0.8 s; raw in 0.2-0.5 s before the first word, tail 0.3-0.8 s;
first raw 10-27 s into a case; stills held at least 1 s + words/3 with a drift of at least 0.16 %/s; flashes at most
0.4/min; case end fades over 1.2-1.8 s followed by 0.4 s of black; card black 0.4-0.8 s; mean luma 64-91.

## Review checklist (run on the first 3 minutes, then on every case)
1. `python tools/video-eye/eye.py measure <render> --from A --to B`: cut times, black, frozen, flash, silent,
   loudness. Fix anything it flags before you look at a single frame.
2. `python -I tools/case-qc/qc_smooth.py <render> --ss A --t N`: stutter, cadence breaks, stray inserts (1-3 frames of
   another picture at a cut), dead holds, undeclared freezes, jumps. A verdict of CHECK means look at those
   timestamps. Reports go to `%TEMP%\case-qc\reports` (override with `QA_SCRATCH`).
3. `python -I tools/case-qc/qc_fps.py <render or conformed source> --expect-fps 29.97`: frame count, timestamp gaps,
   audio length. Use `--expect-fps 30` for 30 fps sequences. A 29.97 stream fails a 30 check.
4. `eye.py sheet` to see what is in the shots. Read the one sheet it prints.
5. By eye or ear, things no tool catches:
   - the picture matches the clause, on the word;
   - no talking face over a cover;
   - no creator text;
   - nothing shown twice;
   - captions only on raw cues;
   - bleeps cover the whole word;
   - clicks and pops (listen).
6. `eye.py watch <render> --review` on the reviewed section before calling it done. Run `recall` first; you get 20
   watches a day.

## Feedback loop (whenever the user asks for a change)
1. Before changing anything, ask: why must it change? Is the old behaviour still wanted anywhere? What exactly should
   improve? Is this for this video only, or for every future video?
2. Make the change. Show it. Ask "is it right now?"
3. Write a lasting rule into the project memory or into this skill's `rules.md`, in this form:
   `- rule | why | instead of | improve | check`. A one-video rule goes in the video's handoff, not here.
4. Every correction also goes into `user-lessons.md` the same turn (a broken lesson gets `(repeat N)`). A reference
   video studied frame by frame adds its rows to `narration-picture.md`. Both are read before the next storyboard.

## Graphics QC lessons (CAMPING-8 v2, 2026-11-07)
- Check an alpha .mov by extracting a PNG (`-pix_fmt rgba`) and compositing in PIL; ffmpeg overlay over a lavfi colour gave blank frames twice | check the PNG's alpha bbox, not the sheet
- `glob` on Windows returns `\` paths: a `.replace('/p_', ...)` silently misses, and the sheet shows stale files | build output names from `os.path.basename`
- `hf-c8-render.mjs` verifies frame count only, never `__c8need`: size D from the props builder
- `FX.split` letters must sit in one no-wrap span per word, or a line breaks mid-word ("CORN/ER") | check every theory/side-by-side row on the sheet
- A source's own blurry footage (camera fall replay) reads as a grey blob in a framed still | pick the sharpest frame that shows the place or object the clause names
- yt-dlp comment `_time_text` can carry "(edited)": assert dates per comment, not by pattern
- Windows ffmpeg needs `C:/...` paths, not `/c/...`; pp-multi `--max 0` for full JSON; get_track_info gives no in-points
