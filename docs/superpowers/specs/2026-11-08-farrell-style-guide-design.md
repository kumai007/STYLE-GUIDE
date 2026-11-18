# Farrell style guide + local style-guide UI — design

Date: 2026-11-08. Status: approved in chat (approach 1), spec awaiting user review.

## Goal
One editable style guide for horror videos in the Farrell style, which Claude follows top to bottom on every edit.
The user sets rules and corrects Claude over time. Three parts are kept apart:
- **Guide**: 12 categories of rules.
- **Rule book**: fixed rules Claude may never skip.
- **Learnings**: a dated log of corrections, each of which can be promoted into the guide or the rule book.

A minimal local page shows all of it, lets the user edit anything, and has a note box with an **Update** button that
runs Claude to apply the note.

## User decisions (fixed input)
- Categories, in this order: Overall aesthetic, Mood and emotion, Color palette, Lighting, Camera angles,
  Camera movement, Shot composition, Editing rhythm, Transitions, Typography, Music and sound, Storytelling.
- Mood: horror. Font: VCR (VCR OSD Mono). Transitions: only crossfade, dip to black, VHS, glitch.
- Shot size: mostly medium, sometimes close-up or extreme close-up, by situation. Raw footage is kept as it is.
- Camera movement: pan, zoom, tracking, 3D, wide angle, sometimes distorted.
- Composition: mainly central. Look: contrasty, vintage texture; 3–5 texture types, which the user updates over time.
- Raw audio fades in and out as in the raw-editor skill.
- Everything else (grade, vignette, lighting, pacing, animation, sound design) is learned from the 5 references.
- Update button: runs Claude now. Evidence: clip thumbnails. Learnings: log + promote. "EGC" = the egm reviewer agents.

## Architecture
New folder `styleguide/` in the project root:

| File | Job |
|---|---|
| `styleguide/farrell.json` | Source of truth. Only the server writes it. |
| `styleguide/history/` | A backup of `farrell.json` before every save; the newest 20 are kept. |
| `styleguide/server.py` | stdlib HTTP server on 127.0.0.1:8767: API, static files, media, Markdown render, Update runs. |
| `styleguide/model.py` | Load, validate, apply operations, render Markdown. No HTTP, so it can be unit-tested. |
| `styleguide/update_prompt.md` | The fixed instruction for the Update run. |
| `styleguide/index.html`, `app.js`, `app.css` | The UI. Plain JS, no build step. |
| `styleguide/tests/test_model.py`, `test_server.py` | unittest. |
| `Open Style Guide.cmd` | Starts the server and opens the page (like `Open Farrell Board.cmd`). |

Output: `FARRELL_STYLE_GUIDE.md` in the project root. It is rewritten from `farrell.json` on every save.
Its first line says it is generated and must be edited in the UI.

Media is reused, not copied: the server imports `media_path`, `poster` and `probe` from
`tools/ref-annotator/serve.py` (its `main` is guarded). It reads `productions/_boards/farrell.json` read-only
to resolve evidence clips. The source mp4s are only read, never written.
The board server does not need to be running for the style-guide page to work.

## Data model (`farrell.json`)
```json
{
  "version": 1, "rev": 12, "saved": "ISO time",
  "categories": [
    {"id": "overall-aesthetic", "name": "Overall aesthetic", "summary": "1-3 sentences",
     "rules": [{"id": "r-...", "text": "the rule", "source": "user|refs",
                "evidence": [{"clip": "<board clip id>", "prod": "farrell-03-tv-news",
                              "src": "<board src>", "sf_in": 1200, "sf_out": 1499, "label": "v3 00:40"}]}]}
  ],
  "rulebook": [{"id": "b-...", "text": "...", "since": "date", "from": "user|learning:<id>"}],
  "learnings": [{"id": "l-...", "date": "date", "text": "...", "status": "open|guide|rulebook", "target": "rule or rulebook id"}],
  "updates": [{"id": "u-...", "date": "...", "note": "...", "status": "running|done|failed|undone",
               "summary": "...", "error": "...", "backup": "history file name"}]
}
```
Validation (`model.validate`) runs before every save. It requires:
- exactly the 12 category ids, in order
- unique ids
- non-empty text
- `source` in {user, refs}
- evidence frames with `sf_in <= sf_out`
- `rev` matching the client's rev (409 if stale, as on the board)

A failed check means nothing is written.

## Generated Markdown (`FARRELL_STYLE_GUIDE.md`)
The sections, in order:
1. **Rule book**: numbered; "never break these".
2. **The 12 categories**: each with a summary, then its rules. A user-set rule is marked "(set by you)". Evidence
   appears as `v3 00:40–00:50`.
3. **Open learnings.**

Every Farrell edit reads this file top to bottom. The project `CLAUDE.md` gets one pointer line saying so.

## UI (minimal, dark)
- **Header**: "FARRELL STYLE GUIDE" in VCR OSD Mono. The font is served from `C:\Windows\Fonts\VCR_OSD_MONO_1.001[1].ttf`; if it is
  missing, monospace is used. Tabs: Guide / Rule book / Learnings / Updates.
- **Guide tab**:
  - The 12 categories down the left side; the selected one on the right, with its summary and its rules.
  - Click any text to edit it. Enter or blur saves; Esc cancels.
  - "+ rule" and delete (with confirm) on each rule.
  - Each rule shows up to 3 evidence thumbnails, served from `/poster`. Clicking one plays the clip in a small
    overlay from its in frame, and stops at its out frame using `requestVideoFrameCallback` (the board's
    overshoot lesson).
- **Rule book tab**: the same editing. Delete asks for confirmation.
- **Learnings tab**: each learning has "→ Guide" (pick a category) and "→ Rule book". Promoting one creates the
  rule and sets the learning's status and target.
- **Updates tab**:
  - Each update shows its note, status, summary and error.
  - The newest finished update has "Undo", which restores its backup.
- **Bottom bar on every tab**:
  - the note textarea
  - the **Update** button
  - the last run's status (running time / done / failed with reason)

  The button is disabled while a run is going.
- **Saving**: every save posts to the API. After a 409 the page reloads and says so.

## API
| Method + path | Does |
|---|---|
| `GET /api/guide` | The current json. |
| `POST /api/guide` | Full save (rev-guarded): validate, back up, write, render the Markdown. |
| `POST /api/update` `{note}` | Starts an Update run. Returns 409 if one is already running. |
| `GET /api/update?id=` | Status of a run. |
| `POST /api/undo` `{id}` | Restores the backup taken before that update. |
| `GET /poster?clip=` | The middle-frame thumbnail of a board clip. |
| `GET /video?clip=` | The source mp4, ranged. |
| `GET /api/clip?id=` | A clip's src, fps, in/out frames, title and note. |
| `GET /font/vcr.ttf` | The VCR font. |

## Update run
1. The server saves the note as an update with status "running", then backs up the current json.
2. It starts `claude -p` with:
   - `--model sonnet`
   - `--output-format json`
   - `--json-schema <ops schema>`
   - `--tools Read Grep Glob`
   - `--strict-mcp-config`
   - `--no-session-persistence`
   - cwd = the project root

   The prompt is `update_prompt.md`, plus the current guide json, plus the note.

   Claude may read the references:
   - `productions/*/01_reference/DECONSTRUCTION_claude.md`
   - the deconstruct specs
   - the board json

   It returns:
   ```json
   {"summary": "...", "learning": "one-line learning from the note",
    "ops": [{"op": "add_rule|edit_rule|delete_rule|set_summary|add_rulebook|edit_rulebook|delete_rulebook|add_evidence|remove_evidence", ...}]}
   ```
3. The server applies the ops to a copy, then:
   - adds the learning
   - validates the result
   - saves it and renders the Markdown
   - marks the update "done" with the summary, which lists every rule-book change separately
4. **Failure** (CLI error, timeout after 10 min, bad JSON, unknown op or id, failed validation): nothing changes,
   and the update becomes "failed" with the reason.
5. **One run at a time.** The CLI command comes from env `STYLEGUIDE_CLAUDE_CMD`, default `claude`, so tests can
   use a fake.

## First content (written in this session, not by the Update button)
Built from the 5 deconstructed references, and stored as `refs` rules with evidence:
- **Category stats** from the board's claude clips: share of time per category, clip length (median and p10/p90),
  clips per minute, how much is treated vs raw, and how motion-graphic devices are used.
- **Measured colour.** For each video, frames sampled every 2 s: brightness, contrast, saturation, tint,
  vignette ratio, grain, and the share of dark frames.
  - Treated (motion-graphic) clips and raw-footage clips are measured separately.
  - The script lives in `styleguide/tools/measure.py`.
  - It writes `styleguide/measure/*.json`, small summary files only.
- **Measured sound** per video:
  - integrated loudness and range
  - music bed level under the voice
  - words per minute and pauses, from `words_full.json`
- **Reading the clips**: notes and titles per category, read to pick out repeated devices (page 3D tilt with push,
  date tags, title boxes, TV-frame inserts, glitch hits, VHS framing) and the textures used.
- **The user's fixed decisions** become `user` rules, and are also seeded into the rule book.
- **raw-editor's raw-audio fade rule** goes into "Music and sound" and the rule book.

Afterwards the egm reviewers (structural, style, comprehension, zoom-out) review the generated Markdown. Their
fixes go in, and a short review note is kept in `docs/superpowers/specs/`.

## Testing
- **`test_model.py`**:
  - validation passes and fails as specified
  - each op kind, plus unknown ids rejected
  - promoting a learning
  - Markdown render order and markers
  - history keeps exactly 20 backups
- **`test_server.py`** (server on a free port, temp data dir):
  - GET and POST guide, including the 409 on a stale rev
  - an Update run with a fake Claude command (good ops / bad JSON / timeout)
  - one run at a time
  - Undo
  - `/api/clip` for a real board clip id
- **Manual check in the in-app browser**:
  - edit a rule, then see the Markdown change
  - play an evidence clip and confirm it stops at its out frame
  - one real Update run with a small note

## Out of scope
- Syncing to PROJECT.
- Several guides; the format allows a second file later.
- Authentication: the server binds to 127.0.0.1 only.
- Editing the board from this UI.

## Risks
- **An Update run costs usage.** Sonnet keeps it low; the model is one constant in `server.py`.
- **Claude may change too much.** Ops are small and listed in the summary, rule-book changes are called out, and
  Undo is one click.
- **The VCR font file moves or is renamed.** The server looks for `VCR*.ttf` in `C:\Windows\Fonts` and the user font
  folder, and falls back to monospace.
