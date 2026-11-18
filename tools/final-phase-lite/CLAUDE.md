# Final Phase Lite: notes for Claude Code

This folder is Final Phase Lite, a free window for videos made with Claude Code or OpenCode. Someone downloaded it and opened it
here, most likely to install it.

## When the user asks to install it ("install this for me", "set this up")

1. Run `node install.mjs` in this folder. It checks the computer (Node 20+, Claude Code or OpenCode, FFmpeg, npx) and adds the
   `final-phase-lite` skill to Claude Code. It changes nothing else: no settings, no other files.
2. Tell the user what it found, in plain words. If something is missing, give the exact fix it printed. FFmpeg is only
   needed to render; watching and sending notes work without it.
3. Then tell them how to use it: open Claude Code in any folder where they make a video and say
   "open Final Phase Lite". It opens in the browser.

There is nothing to `npm install`: it has no dependencies.

## To remove it

`node install.mjs --remove` takes the skill out of Claude Code. Then the folder can be deleted.

## If they want to try it right away

Start it on a video folder in the background: `node server.mjs "<that folder>"`. If they don't have a video yet, offer
to make a short HyperFrames one with them first (`npx hyperframes init`), then open it.

## Changing the tool itself

- `server.mjs`: the local server (127.0.0.1 only). It serves the window and the project's files, follows the AI's
  session to show progress and cost, and sends notes from the window.
- `lib/agents/claude.mjs`: Claude Code (`claude -p`, its session logs in ~/.claude/projects, plan limits).
- `lib/agents/opencode.mjs`: OpenCode (`opencode run`, its sessions in ~/.local/share/opencode/opencode.db read with
  node:sqlite, its models and prices from `opencode models --verbose`).
- `lib/transcript.mjs`: turns those logs into steps. Both formats are the tools' own and may change; anything unknown
  is skipped.
- `public/`: the window (plain HTML, CSS and JavaScript, no build step).
- `npm test` runs the checks.
