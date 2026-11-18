# Theme Park audit pass, 3 Nov 2026 (one edit + ONE render per case)
Project: C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg. Read first: the end of `_kit/CASE_BUILD_GUIDE.md` (owner rules), `_engine/src/dev/REGISTRY.md`,
your case's code `_engine/src/cases/<KEY>.tsx` and `02_Theme_Park/build/CASEnn/NOTES.md`. Code is the source of truth; masters get replaced.

## Owner rules applied in this pass
1. RAWS (VO paused, clip with its own sound) ONLY at incident moments: build-up, the moment, people reacting, immediate aftermath.
   Never during explanation (background, history, precautions, stats, investigation). No near-duplicate raws. 2-5 per case.
   Kept raws keep the length rule: main raw 10-25 s, others >= 6 s (IN CODE: splices in old masters are lost on re-render).
   Removed raws: the VO runs straight on (one take) over silent footage.
   Tool for removals: `_engine/src/lib/core/cutOut.tsx` + `python3 _tools/apply_cutout.py <KEY> "a-b,a-b" "note"` drops whole
   timeline windows (original seconds) from the finished comp. Use it only on a raw's VO-SILENT window (check the VO part table:
   previous part's end .. next part's start; for "lead-in line + RAW" shots cut only the part after the line). Keep the removed raw in
   the music duck list (hides the music jump). Or recode the timeline by hand if that reads better. Example: cases/TP24.tsx (end of file).
2. Template reuse banned: replace each listed shared/reused device with a NEW device built for that case's document or moment (torn
   newspaper, fax printing, phone screen, TV news bulletin, hand-annotated report, 3-D paper stack, ride-control panel, ...). Channel
   style (white frames, RedLabel, Elite/ArchivoBlk type, film look). No device used in two cases anywhere in the three videos: check
   REGISTRY.md and append `<KEY> | <Name> | dev/<KEY>_<Name>.tsx | what it shows`.
3. INSET framing (framed clip over a blurred copy of the same footage + RedLabel) at most ONCE per case. Elsewhere: full-frame footage,
   or a framing built for the moment (split screen, phone frame, slow push, 3-D card turn, map pull-out).
4. No blurry scanned document page with one sentence in a white highlight bar. Every document moment = a sharp designed device:
   legible type (set the real text yourself if the scan is soft), key line revealed with motion, source credited small.
5. Existing rules still hold: VO never split mid-sentence, >= ~6 s VO between raws, each device once, case ends on last line + short hold.

## Check, render, finish
- Stills: `_tools/render_case.sh <KEY> --still <sec> C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/<KEY>_<sec>.png` (ignore the version-mismatch banner).
  Check every new device and every raw join.
- Full render ONCE, in the background (run_in_background, wait for the notification; no sleep loops): `_tools/render_case.sh <KEY> [allow]`.
  3 machine-wide slots shared with other agents; it may wait. `_tools/render_pending.sh` also auto-renders any case whose code is newer
  than its master after 15 idle min: finish your edits in one go, then start your render promptly. If the log
  `_tools/render_pending.log` shows it already rendered your final code, use that master instead of rendering again.
- cutcheck: 0 flags outside designed transition windows (re-run `python3 _tools/cutcheck.py out/<KEY>_raw.mp4 --allow ...` if needed;
  fix real JUMP/FLASH/STUB and re-render).
- 1 fps contact sheet of the whole case, read it once: `ffmpeg -i out/<KEY>.mp4 -vf "fps=1,scale=240:-1,tile=10x10" sheet_%d.jpg`.
- Add a dated line to the case NOTES.md (what changed). Report <= 120 words: raws before -> after (lengths), devices replaced, cutcheck, duration.
