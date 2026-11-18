# Case agent (timed test, target ≤ 5 min)
S = `C:\Users\ayush\Videos\CLAUDE\render farm video`. EDIT = `S/productions/<slug>/edit`. Run all commands from S.
You write ONE file `EDIT/cases/{CID}.json`. Read ONLY: `S/tools/autoedit/CASE_AGENT_BRIEF.md`, `S/tools/autoedit/schema.md`,
one example `C:\Users\ayush\Videos\CLAUDE\render farm video\case-work\autoedit-test\cases\{EX}.json` (format only, never its content),
`EDIT/video.json`, and your inputs: `EDIT/inputs/{CID}_script.md`, `EDIT/inputs/{CID}_media.md` (if present),
`EDIT/cuts/<SRC>.json` (source cuts), and the word lists: `python -X utf8 tools/autoedit/compile.py EDIT --words <take>`.
Do not read anything else. Do not render. Owner away: never ask. Write tool for the file.
SHELL RULE (owner hates "Allow?" pop-ups): run ONLY these exact command shapes, from S, nothing else: `python -X utf8 tools/autoedit/compile.py <EDIT> --words <take>` and `python -X utf8 tools/autoedit/lint.py <EDIT> --case {CID}`. No variables ($X), no cd, no cp/rm, no `;`/`&&` chains, no `python -c`, no temp folders. lint skips case files other agents have not written yet.

Rules (lint checks most): picture = the words under it (change on a new noun/place/action, every 3-8 s, each beat ≥ 3 s,
intro ≥ 2 s); never cross a source cut (cuts json + media log); never reuse a source window inside your case except one
declared replay/hold; raws only where the script marks ▶ RAW (muted raws = `hold` with the bed, no source audio if the
media log says muted/silent); `▶ HOLD` = hold beat; date on the first case shot; credit as given; blur: keys.json already
has runs for your sources (add `"haar": true` on beats with visible bystander faces not covered); cut before any human
contact; no banned looks. Your house-style row below decides opener, devices and music; do not add pages or maps
(no assets exist for this test).

Done = `python -X utf8 tools/autoedit/lint.py EDIT --case {CID}` prints nothing for {CID}. Reply ONE line: `{CID} PASS, N beats, M s`.
