# Farrell Style Guide Implementation Plan

> Execution: native (the user asked for the whole process without stopping), TDD per task, one whole-build review at the end.

**Goal:** A local style-guide app (port 8767) whose data file writes `FARRELL_STYLE_GUIDE.md`, filled with first content from the 5 references.
**Architecture:** stdlib Python server plus a model module with no HTTP; the UI is plain JS. The media helpers are imported from `tools/ref-annotator/serve.py`. The Update button runs `claude -p` in a thread.
**Tech:** Python 3.12 stdlib, numpy and PIL (measurement only), ffmpeg, Claude Code CLI 2.1.293.
**Spec:** `docs/superpowers/specs/2026-11-08-farrell-style-guide-design.md`

## Global constraints
- Bind 127.0.0.1:8767 only. Never write to source mp4s. Never write the board json.
- The 12 category ids, in this order: overall-aesthetic, mood-emotion, color-palette, lighting, camera-angles,
  camera-movement, shot-composition, editing-rhythm, transitions, typography, music-sound, storytelling.
- History keeps 20 backups. An Update run times out after 600 s. Only one run at a time.
- **Decision (deviation from the spec):** `--json-schema` is not used. `claude` is a `.cmd` shim on Windows, and cmd
  mangles quoted JSON arguments. So the prompt goes in through stdin, the ops schema is described in the prompt, and
  the server validates strictly.
- `--setting-sources project` keeps the user's global hooks (the model router) out of headless runs.

## Review focus (each pinned by a test in its task)
1. A stale rev from a second tab → 409, nothing written (Task 2).
2. Claude returns prose around the JSON, or code fences → the JSON is extracted. Junk → failed, guide unchanged (Task 3).
3. An op names an unknown id, or deletes a whole category → rejected, guide unchanged (Task 1).
4. An evidence clip id that no longer exists on the board → the clip endpoint returns 404, and the UI shows a placeholder, not a crash (Task 2).
5. A server restart while a run is "running" → that run is marked failed ("server restarted") on load (Task 3).

---

### Task 1: model.py
Files: `styleguide/model.py`, `styleguide/tests/test_model.py`.
Produces:
- `CATS` (a list of (id, name))
- `empty_guide()`
- `validate(g) -> list[str]`
- `apply_ops(g, ops) -> (g2, changes:list[str])`, which raises `OpError`
- `promote(g, lid, to, cat=None) -> g2`
- `render_md(g) -> str`
- `load(path)`
- `save(g, path, hist_dir, md_path, keep=20) -> backup_name`

Ops:
- add_rule {cat, text, source?, evidence?}
- edit_rule {id, text}
- delete_rule {id}
- set_summary {cat, text}
- add_rulebook {text}
- edit_rulebook {id, text}
- delete_rulebook {id}
- add_evidence {id, clip, prod, src, sf_in, sf_out, label}
- remove_evidence {id, clip}

Tests:
- validate: ok, wrong categories, duplicate id, empty text, bad source, sf_in > sf_out
- each op works
- an unknown op or id raises
- promote to the guide and to the rule book
- the Markdown order is rule book → categories → open learnings, with "(set by you)" on user rules
- save keeps exactly 20 backups

### Task 2: server.py core
Files: `styleguide/server.py`, `styleguide/tests/test_server.py`.
- Endpoints:
  - GET/POST `/api/guide`, with the rev guard → 409
  - `/api/clip?id=`, `/poster?clip=`, `/video?clip=` (ranged)
  - `/font/vcr.ttf`
  - static files
- Clips are looked up in `productions/_boards/farrell.json`. The lookup is re-read when the file's mtime changes.
- `make_server(port, data_dir, md_path, board_path)` so tests can use a temp dir and port 0.

Tests:
- get, then save, then the Markdown file exists
- a stale rev → 409
- an unknown clip → 404
- a real clip id → 200 with fps and frames
- index.html is served

### Task 3: Update run + undo
Files:
- `styleguide/update_prompt.md`
- `styleguide/server.py`: `/api/update` POST/GET, `/api/undo`
- tests with a fake CLI: `styleguide/tests/fake_claude.py`, driven by env `FAKE_MODE`: ok / junk / fenced / sleep / badop

Details:
- The env `STYLEGUIDE_CLAUDE_CMD` is a `.py` path, run with `sys.executable`. Otherwise `shutil.which()` is used.
- The learning from Claude is added as an open learning; its text is the learning plus the note.

Tests:
- ok → done, rev+1, learning added
- fenced → done
- junk → failed, guide unchanged
- badop → failed
- a second POST while running → 409
- the timeout → failed (the timeout is overridden through the env `STYLEGUIDE_TIMEOUT`)
- undo restores the old rev's content
- after a restart, a stale running run → failed

### Task 4: UI
Files: `styleguide/index.html`, `app.css`, `app.js`.
- Tabs: Guide / Rule book / Learnings / Updates.
- Editing: contenteditable on click; Enter saves, Esc cancels.
- Thumbnails come from `/poster`. Clicking one opens an overlay player that stops at sf_out with `requestVideoFrameCallback`.
- A bottom bar with the note box and Update; the run is polled every 2 s while it runs.
- Check in the in-app browser: edit a rule, then see the Markdown change; play a clip; no console errors.

### Task 5: Launcher + wiring
- `Open Style Guide.cmd`
- a `.claude/launch.json` entry `farrell-styleguide`
- one pointer line in the project CLAUDE.md
- `styleguide/README.md` (a short one)

### Task 6: Measurement
File: `styleguide/tools/measure.py PROD... ` → `styleguide/measure/<prod>.json`.

What it measures:
- Frames every 2 s at 160x90 (via ffmpeg), each tagged by the board clip category that covers its time.
- For each of raw / treated / all:
  - luma mean and p10/p90
  - contrast std
  - saturation
  - Lab-ish tint (R−B, G−avg)
  - vignette ratio (centre/edge luma)
  - grain (hf std)
  - dark share
- ebur128 integrated loudness and LRA.
- words per minute and pauses ≥ 0.6 s from words_full.json.
- Board clip stats: category time shares, clip length median/p10/p90, clips per minute, mg share, top title words per category.

Test: the metric functions on synthetic arrays (a flat frame has vignette 1.0 and grain about 0; a dark frame is counted dark).

### Task 7: First content
- `styleguide/tools/find_clips.py` (category/keyword → clip ids with labels) to choose evidence.
- The authored content in `styleguide/seed.json`, loaded with `styleguide/tools/load_seed.py`, which validates, then saves through the model.
- Rule book seeded from the user's fixed choices plus the raw-audio fade rule.

### Task 8: Review + finish
- egm reviewers (structural, style, comprehension, zoom-out) on `FARRELL_STYLE_GUIDE.md`.
- Apply their fixes, and save a note in `docs/superpowers/specs/2026-11-08-style-guide-review.md`.
- Run the full test suite and a final browser check. One real Update run with a small, reversible note, then undo it.
