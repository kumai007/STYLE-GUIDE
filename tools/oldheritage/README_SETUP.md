# Old Heritage Files / Iceberg toolkit — set up on a new PC

This is the exact tool that built Tornado, Natural Disasters, Theme Park, Workplace, Dashcam, Incidents and the Amusement Parks Iceberg:
the Remotion engine (brand look, ~300 case devices, intros, level entries, the Disturbing-Dose number transition), every script in
`_tools`, all of the owner's rules, the approved reference cases, the style studies, and Claude's memory of every note you gave.
Not included: downloaded footage, graded media and renders (they are re-downloaded from the URLs in each outline / NOTES.md).

## 1. Install (once)
- **Node.js 20+** and npm.  **Python 3.12.**  **ffmpeg + ffprobe** on PATH.  **yt-dlp** (`pip install yt-dlp`).
- **Git for Windows** (gives Git Bash: the `.sh` tools run in it). On a Mac they run as is.
- Optional: **Blender 5.x** (3-D shots), **Claude Code** (the brain, see 3).
- Unzip anywhere, then in a terminal in this folder:
  ```
  python setup_paths.py
  cd Iceberg/_engine && npm install
  cd ../_tools && python -m venv .audvenv && .audvenv/Scripts/pip install -r requirements.txt   (Mac: .audvenv/bin/pip)
  python -m venv .venv && .venv/Scripts/pip install numpy pillow
  ```
  (`.audvenv` is used by rawclean.py: music removal from raws with an AudioSet classifier + Demucs; first run downloads the models.)
- Fonts, music beds (Epidemic ambient Music 1–10, ES tracks), SFX and iceberg plates are already in `_engine/public`.

## 2. How a video is built (same pipeline as here)
1. Outline + VO-only script per video (`<video>/research/outline.md`, `script/script.md`) → `python _tools/oh_split.py <video>` → per-case text.
2. VO: Algrow / Stealth "Obscure Collab", stealth_model 2.0, temperature 2.0, speaking_rate 1.05, one job per case → `<video>/vo/raw/CASEnn.mp3 + .srt`.
   (Before Disasters, Zoo and Fast Food VO is already in here.)
3. Footage: `python _tools/oh_links.py <video>` → `footage/LINKS.csv`; `_tools/oh_fetch.sh <video>` downloads (uses Chrome cookies, owner-approved).
4. Each case: `_tools/newcase.sh <VID> <NN>` → code in `_engine/src/cases/<KEY>.tsx` (builders follow `_kit/OH_CASE_BRIEF.md` +
   `_kit/CASE_BUILD_GUIDE.md`), stills `_tools/render_case.sh <KEY> --still <s> out.png`, render `_tools/render_case.sh <KEY>` (cutcheck,
   −16 LUFS master). Raw audio through `_tools/rawclean.py`.
5. Countdown videos: `python _tools/open_on_vo.py` (case opens on its first VO line) + `python _tools/make_transitions.py <VID>` (big red
   number). Then `_tools/assemble.sh <VID>` → `<video>/build/<VID>_FULL.mp4`.
VID keys: TOR ND TP WP DC BD IN ZO AM FF (folders 01_…10_).

## 3. The brain
Open Claude Code in the `Iceberg` folder. It reads `CLAUDE.md` there automatically; this package's root `CLAUDE.md` tells it to read the
memory notes in `brain/memory/` (every rule and correction you gave), `HANDOFF.md` (full history, what each decision was), the guides in
`_kit/`, and the reference studies in `_ref/`. Copy `brain/memory/*.md` into Claude's memory folder for the project too if you want them
loaded every session (Claude Code: `~/.claude/projects/<project>/memory/`).

## Windows notes
- Run `.sh` tools from Git Bash. `render_case.sh` uses Remotion `--gl=angle` (works on Windows GPUs).
- Mac-only bits: `md5` in oh_fetch.sh (Git Bash has `md5sum`: replace if a page download fails), `stat -f` in render_pending.sh.
- Per-case public folders (`_engine/pubs/<KEY>`) are symlinks; on Windows enable Developer Mode (or run Git Bash as admin) so `ln -s` works,
  or `export MSYS=winsymlinks:nativestrict` before running newcase.sh.
