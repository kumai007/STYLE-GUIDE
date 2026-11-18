# Farrell video workflow (this folder only)

> **Past-project learnings (2026-11-18):** read `docs/knowledge/README.md` (routing table) before a new video.

> **Main knowledge base (owner rule 2026-11-13):** `C:\Users\ayush\Downloads\404_Rendrer_KNOWLEDGE\404 Rendrer`. Read its docs first (list in `CLAUDE.md`). If it clashes with this file, it wins.

> **Owner SOP (2026-11-14):** `docs/workflow/SOP.md` = how the owner briefs, licence rules, editing/audio rules, feedback decoder, send checklist. Read it before every video. Its clashes with older rules: `styleguide/_shared/GENERIC_RULES.md` section H.

Copied from PROJECT on 2026-11-10. No Premiere Pro, no After Effects. Render = ffmpeg (`tools/farrell-build/`).
`V` = the video's work folder: `productions/<video>/`.

## Inputs from the owner
1. **Cut sheet** (order of the edit): `## INTRO`, `## CASE 01 · NAME · place`, `[TAG] <url>` sources, narration paragraphs,
   `▶ RAW · [TAG] start–end · "quote" · ~Ns · flags`, `## OUTRO`. Format details: `docs/workflow/case-video-ref/rules.md`.
2. **Voiceover sheet** (the script).
3. **Voice name** for this video (ask every time; never reuse the last one).

## Owner choices (2026-11-10)
- Storyboard = private web page (Artifact), one row per shot with a still frame.
- Voice gaps = normal `vo_gapcut.py` 0.40 s.

## Steps
1. Parse: `python -I tools/case-build/cutsheet.py summary SHEET.md`, then `parse SHEET.md --vo VO.md -o V/job.json`,
   then `vo-csv SHEET.md -o V/vo_lines.csv`.
2. Voice (Algrow, key in `tools/algrow-voice/.env`, never print it): from `tools/algrow-voice/`:
   `python algrow_voice.py credits`, then `python algrow_voice.py --voice "NAME" batch V/vo_lines.csv -o V/narration/raw --workers 3`.
   Check every take (listen + word SRT).
3. Cut the voice gaps: `python -I tools/case-build/vo_gapcut.py V/narration/raw -o V/narration/cut`
   (pauses over 0.40 s → 0.40 s, head 0.10 s, tail 0.20 s, −45 dBFS; shifts the SRTs). `vo_tighten.py` = tighter cut, only if asked.
4. Download sources: `python -I tools/case-build/fetch_sources.py V/job.json -o V/sources --dry-run`, then without
   `--dry-run`. One at a time, never parallel. Bot check (exit 3) → wait 5 min, rerun.
5. **Storyboard for CASE 1 only.** One row per shot: no., timecode, length, picture + frame, VO line, raw quote,
   overlays, SFX, transition, reason. Check it against `styleguide/<style>/<style>.json (only the chosen style; both if combining)` and `case-video-ref/user-lessons.md`.
   Show it. Change it until the owner approves. Render nothing before that.
6. Render CASE 1 with `tools/farrell-build/` (`rulecheck.py` must say OK first). Owner reviews, notes go into
   `styleguide/<style>/<style>.json` the same day. Repeat until approved.
7. Only when the owner says so: full video, all cases, with SFX and music from Epidemic Sound (MCP `epidemic-sound`,
   key = user env var `EPIDEMIC_SOUND_API_KEY`). Mix: narration loudest, music 12–15 dB under, SFX under music.
8. QC the render against every rule-book line.

## Render phase: split (owner rule 2026-11-13)
- Render all parts on GitHub machines with `tools/case-farm/` (owner 2026-11-16: public repo `DeZAYU/case-farm`, Enterprise, at most 180 jobs at once (`farm.local.json` cap; render chunks = cap - parts - 1); work folder `case-work/` inside this folder; media on private Drive). The laptop is backup only and joins the parts. `DeZAYU/render-farm` is deleted.
- Tool: `tools/case-farm/` (README, `farm.sh` header). Each part needs `build/farm_entry.py` (contract: `farm/farm_contract.py`). Steps: `bash tools/case-farm/farm.sh sample <project> <part,part>` (preview), then `bash tools/case-farm/farm.sh full <project>`.
- Heavy file-only steps (Whisper, pre-cut encodes, face `track`, renders) run ONLY on GitHub (owner 2026-11-16: never on the laptop, any size): `bash tools/case-farm/task.sh` (README "Tasks"; old C:\ scripts need `--os windows`) and `farm.sh`. Never send a case's `face` step (it overwrites hand keys).
- Before the render: scan every played source span, tails included, for source cuts (no leaked frames).

## Case threads (owner choice 2026-11-11, saves tokens)
- Main chat = coordinator. Steps 1–4 (parse, voice, gap cut, download) run once there.
- Each case gets its **own fresh chat** (never a fork; a fork copies the whole history).
- Only **2–3 case chats render at a time** (PC limit). When one finishes, the main chat opens the next case as a new chat.
- Do not open all case chats early. A chat idle for more than ~1 hour loses its cache and costs more to wake.
- Waiting is free. No polling loops; run renders in the background and wait for the finish notice.
- Case chats share data only through files: `V/job.json`, `V/narration/cut/`, `V/sources/`, `styleguide/<style>/<style>.json`.
  Each case writes its storyboard and render to `V/cases/caseNN/`.
- Each case storyboard still needs owner approval before it renders.
- Merge: the main chat joins the finished `V/cases/caseNN/` renders from disk. It does not read the case chats.

## Editing rules (moved from CLAUDE.md 2026-11-11, verbatim)
- Farrell render kit (ffmpeg, no Premiere): `tools/farrell-build/` (README). Run `rulecheck.py <edl>` before every render.
- Style guide editor: `Open Style Guide.cmd` → http://localhost:8767 (`styleguide/`, README there). `styleguide/farrell/farrell.json` is the source; `styleguide/farrell/FARRELL_STYLE_GUIDE.md` is generated from it, never hand-edit. Follow its rule book on every Farrell edit.
- Nocturn guide: `Open Nocturn Style Guide.cmd` → http://localhost:8768. Source `styleguide/nocturn/nocturn.json`. Which guide to load: see "Pick the style first" in `CLAUDE.md`.
- Abyssal Detective guide: `Open Abyssal Style Guide.cmd` → http://localhost:8769. Source `styleguide/abyssal/abyssal.json`. Study notes: `docs/knowledge/notes/productions/_abyssal-ref/ABYSSAL_STYLE_NOTES.md`.
- Workflow: `docs/workflow/WORKFLOW.md`. Cut sheet + VO sheet + voice name → Algrow voice (`tools/algrow-voice/`) → gap cut (`tools/case-build/vo_gapcut.py`) → download sources → **CASE 1 storyboard, approved before any render** → CASE 1 render → full video with Epidemic Sound SFX/music only when told.
- Keys: Algrow in `tools/algrow-voice/.env`; Epidemic Sound in user env var `EPIDEMIC_SOUND_API_KEY`. Never print them.
- Many cases: one fresh chat per case, 2–3 rendering at a time. See WORKFLOW.md "Case threads".
- Keep naration clips at least 3 seconds; never cut to a new shot while a crossfade is still fading the previous clip.
- Feedback loop: every owner note on a render goes into that style's `styleguide/<style>/<style>.json` (rule book + Learnings) the same day, using `model.apply_ops` + `model.save`. Before each build read the rule book and the PROJECT cut sheet; after each render check it against every rule-book line.
