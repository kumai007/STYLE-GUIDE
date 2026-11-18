# Style guide editor (Farrell and Nocturn)

`Open Style Guide.cmd` (or `python styleguide/server.py`) → http://localhost:8767

## Two guides
Each channel has its own folder with everything it owns: `farrell/` and `nocturn/` (`<slug>.json` source, `<SLUG>_STYLE_GUIDE.md` generated, `history/`, `media/`, `update_prompt.md`; Farrell also has `measure/` and `seed.json`). The app code here is shared.
- Farrell: `Open Style Guide.cmd` or `python styleguide/server.py --guide farrell` → http://localhost:8767
- Nocturn: `Open Nocturn Style Guide.cmd` or `python styleguide/server.py --guide nocturn` → http://localhost:8768

- **Guide**: the 12 categories. Click any rule or summary to edit its text: Enter saves, Esc cancels. `×` deletes. A thumbnail plays its reference clip; playback stops at the clip's last frame.
- **+ rule / ✎**: opens the in-page form. It has a title, a "what it is" box, and examples: drop or browse screenshots and videos (png/jpg/webp/gif/mp4/mov/webm, up to 1 GB), paste one with Ctrl+V, or pick clips from the Farrell board. `Save` stores the rule. `Save & learn` stores it, then runs Claude on the examples.
- **Learn** (on any rule with examples): Claude looks at the screenshots, 4 frames from each video and 4 frames from each board clip. It rewrites the rule and gives it a title, sharpens related rules and logs a learning. Undo works like an Update. It needs the CLI logged in (see below).
- **Motion graphics**: every graphic Farrell uses. Each one has *Use it when*, *Not when*, *Looks like* (how to build it), a kind (board tag) and example clips. Type a situation in the search box ("the VO names a city") to see which graphic fits; the best match is gold. Click a field to edit it. `+ graphic` / `✎` open the same form with the extra boxes. **Learn** and **Update** can change graphics too (ops `add_graphic`, `edit_graphic`, `delete_graphic`, `set_graphics_summary`). The .md gets a "which one, when" table. First content: `tools/seed_graphics.py` (runs once; skips if graphics exist).
- **Rule book**: fixed rules that every edit must follow. It uses the same form, with the same examples and Learn.
- **Learnings**: what each Update taught. `→ Guide` / `→ Rule book` promotes one.
- **Updates**: the log of Update runs. Undo works on the newest finished run.
- **Note + Update**: runs `claude -p` (Sonnet, read-only tools, about 1–3 min). It edits the guide from your note and logs a learning. It needs the standalone Claude CLI to be logged in (`claude auth status`); if the run fails with an authentication error, run `claude auth login` once in a terminal.

Files:
- `farrell/farrell.json` is the source of truth. `farrell/FARRELL_STYLE_GUIDE.md` is regenerated on every save, so don't edit the .md by hand.
- `history/` holds the last 20 saves (`revNNNNN-*.json`) and each Update's `before-*.json` snapshot.
- `update_prompt.md` is the prompt the Update and Learn buttons send.
- `media/` holds your uploaded screenshots and videos. `media/frames/` holds frames cut for Learn; they are cached, so delete them freely.
- `measure/*.json` holds the numbers measured from the 5 references, made by `tools/measure.py`.
- `seed.json` is the first content. `tools/load_seed.py` loads it.

Restore an old save: stop the server, copy `history/revNNNNN-*.json` over `farrell.json`, start it again.

Tests: `cd styleguide && python -m unittest discover -s tests`. They use a fake Claude, so they run offline.

Env: `STYLEGUIDE_CLAUDE_CMD` (default `claude`), `STYLEGUIDE_TIMEOUT` (seconds, default 600).
