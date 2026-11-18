# Final Phase Lite

A free window for the videos you make with Claude Code or OpenCode.

When an AI edits a video, you usually can't see anything until it renders, you don't know if it's stuck, and fixing
one small thing means describing it in text and rendering everything again. Final Phase Lite fixes those three things:

1. **See what Claude is doing.** Every step as it happens ("Writing captions.html", "Rendering the final video"), with
   a clock, Claude's own plan as a checklist, and a warning when nothing has happened for a few minutes, so you know
   when it's stuck instead of waiting in the dark.
2. **See the video without rendering.** It plays your HyperFrames video straight from its files. Scrub, step frame by
   frame, see each scene on the timeline. When Claude saves a change, the preview reloads by itself, on the same
   moment.
3. **Circle it and say what to change.** Pause anywhere, draw a circle around the thing on the frame (or just click
   it), and type "make this bigger" or "add a whoosh here". The AI gets the exact second, a picture of that frame with
   your circle on it, and which part of the video is inside the circle (the title, the caption…), so it fixes the
   right thing. Your circle stays on the frame while it works, and you watch the change land in it. You render once,
   at the end.

And it shows **what it costs**: the tokens and dollars of each chat and each note, and how much of your Claude plan's
limit you've used, so you see your credits going before they run out.

It runs on your computer, with your own Claude Code subscription, or with **OpenCode and its free models: no account,
no API key, $0**.

## Edit for free with OpenCode

[OpenCode](https://opencode.ai) is an open-source coding agent like Claude Code. It comes with free models that need
no account. In the window's chat, pick **AI: OpenCode** and a model marked **FREE**: every note then costs $0, and the
cost box shows it. Models marked "sees pictures" also look at the frame you paused on; the others get the exact second.
Any paid model you've connected to OpenCode shows its price next to its name.

## Edit with a model on your own computer (Ollama)

[Ollama](https://ollama.com) runs open models on your own computer: free, private, no internet needed. Small models
(a 9B like `qwen3.5:9b`) aren't great at finding things in a video project on their own, and that's exactly what
Final Phase Lite does for them: when you circle something, the note tells the model which element it is and the exact
lines in the code that make it, style it and animate it. The model only has to change those lines.

1. Install [OpenCode](https://opencode.ai) and [Ollama](https://ollama.com), and pull a model that can use tools:
   `ollama pull qwen3.5:9b` (or a bigger one if your computer has the memory).
2. **In Ollama's settings, set Context length to 32k or more.** Ollama starts at 4k on most laptops, and OpenCode's
   instructions alone are about 11k, so with 4k the model never sees what it's supposed to do. The window warns you if
   it's still too small.
3. In the window, pick **AI: OpenCode** and your Ollama model (marked **LOCAL · FREE**). The window connects OpenCode
   to Ollama by itself; nothing in your settings is changed.

For local models the window leaves the list of every installed skill out of OpenCode's instructions (that list can be
20,000 tokens), so each answer starts much faster.

Tested on an Apple M5 MacBook with 16 GB of memory: circling "Episode 1" and typing "make this red", Qwen 3.5 9B made
the change in about 20 seconds, at $0. Expect small models to be good at precise changes you point at, and much less
good at big ones ("add a new scene"). For those, use Claude Code or a bigger model.

## Install

1. Download it: on this page, **Code → Download ZIP**, then unzip it. Or in a terminal:
   `git clone https://github.com/Jadouminou/final-phase-lite.git`
2. Open the folder in Claude Code.
3. Say: **install this for me**

Claude checks your computer (Node 20+, Claude Code or OpenCode, FFmpeg) and adds the `final-phase-lite` skill. You never type a
command. To take it out again: "remove Final Phase Lite" (it runs `node install.mjs --remove`).

## Use it

Open Claude Code in the folder where you make a video and say **open Final Phase Lite**. It opens in your browser.

- Start an edit in the terminal like you always do, in Claude Code or OpenCode: the window follows that session by
  itself.
- Or type straight into the window's chat: it starts a session in that folder with the AI and model picked above the
  chat.
- While Claude works, you can keep adding notes: they go in as soon as it's done.
- **Render** asks Claude to render the final video. New renders appear in the window by themselves.

Keys: Space plays or pauses, ← and → step one frame, Shift + ← / → jumps a second. Click the video to pause it;
once paused, drag on it to circle something. Clicking a note in the chat brings back its moment and its circle.

Without the skill: `node server.mjs "<your video folder>"` (add `--port 5000` to change the port, `--no-open` to not
open the browser).

## Good to know

- **What plays live:** HyperFrames videos (an `index.html` with `data-composition-id`), which is what most Claude Code
  video skills make. Anything else shows its latest render (`.mp4`, `.mov`, `.webm`) instead.
- **Your notes** are kept in `.final-phase-lite/` inside your video folder (with their pictures). That folder keeps
  itself out of git.
- **Sessions from the terminal:** a note sent from the window continues that conversation as a copy, so your terminal
  session is left as it was.
- **What it costs:** OpenCode reports the price of every step, so its dollars are exact. Claude Code on a plan shows
  tokens and your limit (the share used and when it resets, updated each time you send a note); the dollar figure on
  each note is what it would cost at API prices, but it's included in your plan.
- **Permissions:** notes from the window run `claude -p` (or `opencode run`) in your video folder. Nobody is there to
  answer a permission question, so Claude may read, write and edit files and run commands, and anything else is
  refused; OpenCode runs with `--auto`, which approves its questions except anything you've denied. Your own rules
  still apply.
- **Privacy:** it only listens on your own computer (127.0.0.1), only serves files from your video folder, and never
  touches your logins. It reads Claude Code's session logs in `~/.claude/projects` and OpenCode's sessions in
  `~/.local/share/opencode` (read-only) to show the steps.
- **OpenCode's steps live** need Node 22.5 or newer. On older Node they appear once each answer is done.
- **Ollama:** the window looks for it at `http://127.0.0.1:11434` (or `OLLAMA_HOST`). If you've already set Ollama up
  in OpenCode yourself, your own setup is used as it is.
- Tested on a Mac with Claude Code 2.1 and OpenCode 1.19. It's written to work on Windows and Linux too, but that
  hasn't been tried yet.

## What Final Phase adds

This is the free version. [Final Phase](https://finalphase.tech) is the full app: it installs on your Mac, has 20
editing styles you pick with a click, faceless videos, script writing, a time estimate before every edit, and editing
by hand (click anything in the video to move it or change its colour).

## Why it's free

To give something back.

## License

MIT, see [LICENSE](LICENSE). Free to use, change and share.

## Credits

The live preview uses the HyperFrames runtime (Apache-2.0, HeyGen and the HyperFrames contributors), see
`vendor/hyperframes/NOTICE.md` and its licence in `vendor/hyperframes/LICENSE`.
