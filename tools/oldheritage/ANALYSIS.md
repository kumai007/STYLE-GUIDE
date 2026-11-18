# Old Heritage / Iceberg toolkit: analysis (2026-11-14)

Source: `C:\Users\ayush\Downloads\coctool\OldHeritage_Tool` (copied here unchanged, then patched for Windows; see "Windows fixes").
It is a full kit for the **Old Heritage Files** YouTube channel ("caught on camera" countdowns + real-world icebergs).
It is NOT one of the 3 styles (Farrell, Nocturn, Abyssal). It has its own rules and its own Remotion engine.

## What is in it (697 MB, 2,321 files)
| Part | What it is |
|---|---|
| `CLAUDE.md`, `README_SETUP.md` | Read order for Claude; new-PC setup steps |
| `brain/memory/` | 20 owner notes. `*iceberg*`, `youtube-cookies`, `finals-delivery` = binding for OHF. `404-thread`, `lost-games`, `disturbing-games`, `shot-density`, `ss-variety`, `no-padding`, `intro-style` = other channel (404 thread) |
| `Iceberg/CLAUDE.md`, `Iceberg/HANDOFF.md` | Channel style + full history (newest at end, 14 Nov) |
| `Iceberg/_kit/` | `CASE_BUILD_GUIDE.md` (OWNER RULE sections at the end win), `OH_CASE_BRIEF.md`, `RULES/`, `oldheritage/TASTE.md` (outline/script method) |
| `Iceberg/_ref/` | Disturbing Dose number-transition study, owner's intro study |
| `Iceberg/_engine/` | Remotion 4.0.532 + React 19. 183 case files, 471 one-off devices (`src/dev/`, logged in `REGISTRY.md`), 26 template groups in `src/lib/templates` (a generated copy of `K/TemplateLibrary`, do not edit). `public/` 533 MB: fonts, music, SFX, iceberg plates, VO |
| `Iceberg/_tools/` | Pipeline scripts (below) |
| `Iceberg/01_…10_*` | One folder per video: outline, script, VO, footage links, per-case NOTES |

## Video status
| VID | Video | State |
|---|---|---|
| ND, TP, TOR | Natural Disasters, Theme Park, Tornado | Built earlier; media gone (not in kit) |
| WP | Workplace | DONE (51:07) |
| DC | Dashcam | DONE (40:21 re-cut) |
| IN | Incidents | DONE (43:55); IN20 needs a description link |
| AM | Amusement Iceberg | DONE (34:00); AM00 end card says "LEVEL 1" (open) |
| BD | Before Disasters | NOT BUILT. Outline, script, VO (20), links ready |
| ZO | Zoo | NOT BUILT. Outline, script, VO (14), links ready |
| FF | Fast Food Iceberg | NOT STARTED. VO only (25 mp3; LEVEL1/2/5 missing). No outline, script or footage |

No footage, graded media or renders are in the kit. Old cases re-render only after re-download from the URLs in NOTES/LINKS.

## Format and top rules (owner rules; they override other docs)
1. Countdown case = big red number transition (2.5 s, Disturbing Dose style), then straight to the first VO line over footage. No title card. No raw before the first VO line.
2. Raws only at the incident moment. Main raw 10–25 s, others ≥6 s, 2–5 per case, ≥6 s VO between raws. Never in history/explanation.
3. One story: no VO split mid-sentence, no device reprise, case ends on the last VO line.
4. No raw in intros. Intro = VO over footage + 3-D motion. Per-title intro: IN none, AM own OHF intro, FF Lancestey-style, BD none (DD style), ZO yapmaster-style.
5. Devices fit the niche, vary per case (no reuse within ±3 cases), no shared page templates, Inset max once per case.
6. Real article screenshots (`capture_page.py`), new treatment each time, red only on the key phrase. No text that repeats the VO.
7. Audio: VO = Algrow/Stealth "Obscure Collab", model 2.0, temp 2.0, rate 1.05, one job per case. Music ~10 LU under VO. Real SFX only. Master −16 LUFS. Every raw through `rawclean.py`. Bleep swearing.
8. Footage only from small personal channels. Never agency (Storyful, Newsflare, Jukin, ViralHog, Reuters, AFP, AP), TV or big creators. Chrome cookies allowed, ≥15 s between downloads.
9. Blur gore, injuries, bodies, nudity. No flaggable words on screen.
10. Finals: full quality, named by title, in an `OldHeritage_Finals` folder. Short reports, no long QA passes.

## Pipeline (run `.sh` in Git Bash)
1. `research/outline.md` → `python _tools/oh_links.py <video>` → `footage/LINKS.csv`
2. `script/script.md` → `python _tools/oh_split.py <video>` → `vo/text/`
3. VO by hand in Algrow (no script) → `vo/raw/CASEnn.mp3 + .srt`
4. `_tools/oh_fetch.sh <video>` (yt-dlp + Chrome cookies)
5. Grade `_tools/grade/grade_case.py --house`, `srccuts.py`, `rawclean.py` (needs `.audvenv`)
6. `_tools/newcase.sh <VID> <NN>` → write `_engine/src/cases/<KEY>.tsx`
7. `_tools/render_case.sh <KEY>` (still: `--still <sec> out.png`)
8. Countdowns: `python _tools/open_on_vo.py`, `python _tools/make_transitions.py <VID>`
9. `_tools/assemble.sh <VID>` → `<video>/build/<VID>_FULL.mp4`

## Clashes and stale docs (use the left side)
- `_kit/oldheritage/EDIT_RULES.md` and `_kit/RULES/OWNER_RULES.md` describe the **404 thread** channel (Music 8–10 only, raws 2–8 s, Bebas fonts, no grain). OHF uses Music 1/3/4/5, raws 10–25 s, Elite/ArchivoBlk, grain/VHS. **Iceberg/CLAUDE.md + CASE_BUILD_GUIDE owner rules win.**
- `CASE_BUILD_GUIDE §3` still says "TitleCard first": replaced by rule 1 above.
- Music: rule 22 (Music 2, ES Cursed Tunnel) vs guide (Music 1/3/4/5). Ask owner if it matters.
- `_kit/RULES/owner_memory/` copies of two notes are older than `brain/memory/`. `brain/memory` wins.
- HANDOFF Mac notes (idle_guard, `/tmp/iceberg_pause`, render slots on Mac) are obsolete here.
- Old Windows paths (`D:/404 Rendrer`, `C:/Users/avent/...`) = K (main knowledge base).

## Windows fixes done here
- `setup_paths.py` run: Mac paths → this folder (22 files).
- Shell scripts use the no-space short path `C:/Users/ayush/Videos/CLAUDE/STYLEG~1/...` (the space in "STYLE guide" broke them).
- `newcase.sh`: symlinks → Windows junctions (no admin needed; tested, re-run safe, target kept).
- `render_pending.sh` `stat -f` → `stat -c`; `oh_fetch.sh` `md5` → `md5sum`; `oh_retry.sh` `sed -i ''` → `sed -i`.
- `make_transitions.py`: copies `case_t` instead of a symlink; uses `remotion.cmd`.
- `raw_extend.py`: Windows venv path. `rawclean.py`: uses CUDA if present.
- Originals kept as `*.bak-mac` next to each file.
- Installed: `_engine/node_modules` (359 packages), `_tools/.venv` (numpy, pillow). Remotion bundle test: OK (`CaseT` composition found).

## Not done / known gaps
- `_tools/.audvenv` INSTALLED 2026-11-14: torch 2.11.0+cu128 (GPU: RTX A2000, CUDA on), Demucs, AST, librosa, opencv-python, websocket-client. Run: `Iceberg/_tools/.audvenv/Scripts/python.exe Iceberg/_tools/rawclean.py <clip> <out.wav>`. Test: 10 s voice+music mix, music removed in 7 of 10 s, 88 s first run (includes model download). The "symlinks / Developer Mode" warning is harmless (model cache copies files).
- `requirements.txt` misses `opencv-python` (raw_extend) and `websocket-client` (capture_page). Both are installed in `.audvenv`.
- **3-D = Three.js, not Blender (owner 2026-11-14).** Installed `@remotion/three`, `three@0.180`, `@react-three/fiber@9`.
  `_engine/src/dev/Map3D.tsx` + `_engine/src/entries/MAP3D.tsx` rebuild blender_map.py (same case.json: camera keys, imagery grade + feather,
  states/counties lines, county fill, glowing red track reveal, dashed travel line, place dots/rings/labels). Render:
  `bash Iceberg/_tools/render_map3d.sh <case.json> <out dir> <shot...> [--still <frame>]` (`render_maps.sh` now calls it).
  Tested on the Fairdale case.json: stills OK, M2_rochelle 4.8 s rendered in ~14 s. Imagery/geojson files are not in the kit, so the test
  showed track, line, labels and camera only. No real bloom pass (glow = wider faint copies).
- **Per-case public dirs are now hard-link trees** (`_tools/pubsync.sh`, sources in `pubs/<KEY>/.src`). Reason: Remotion fails with EPERM
  when a public dir holds symlinks/junctions on Windows. `newcase.sh` writes `.src`; `render_case.sh` and `raw_extend.py` refresh it.
- Blender is not installed and not needed. `blender_map.py`, `blender_run.sh` are kept as history.
- `idle_guard.sh`, `blender_run.sh` are Mac-only. Not patched.
- `oh_fetch.sh` Chrome cookies can fail on Windows Chrome 127+ (cookie encryption). Fallback: a `cookies.txt` export.
- `render_pending.sh` / `oh_retry.sh` / `dd_fetch.sh` loop forever. Stop them by hand.
- `apply_cutout.py` renames `DUR` → breaks `render_pending.sh` stub check.
- No full case render tested (no footage in the kit).
