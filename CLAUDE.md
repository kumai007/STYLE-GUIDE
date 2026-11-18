# render farm video

Purpose: build the editing style guides (**Farrell**, **Nocturn**, **Abyssal**) and edit + render videos in those styles.
One folder since 2026-11-18 (was `STYLE guide` + `GITHUB`; zip backups in Drive `AI/zip render knowledge/`).

## Folder layout
- `CLAUDE.md`, `docs/` (workflow, SOPs, `ai-state/` handoffs), `styleguide/` (style rule books, gx HyperFrames engine), `tools/` (pipeline).
- `productions/<project>/`: one folder per video project (+ `_*-ref` study folders, farrell/nocturn `01_reference` studies).
- `case-work/`: farm work folder (staged farm projects, `renders/` samples, `_task/`, `_style/` sync state). Not synced.
- `finals/<project>/`: finished deliverables (MP4, .srt, chapters, credits, `phone/`). `finals/FINALS.md` lists every project.
- `archive/`: old one-off extras, reference only.
- `docs/knowledge/`: all learnings from every past project (finalized 2026-11-18; their media/builds deleted). Read its README before a new video.

## Rule order (summary of the owner rules below, 2026-11-14/15)
Playbook > master SOP v2.0 > `docs/workflow/SOP.md` > K > `GENERIC_RULES.md` > style rule book. The style guide sets the
look only (channel profile). K and the OHF kit give tools and pipelines only, never looks.

## MAIN KNOWLEDGE BASE (owner rule 2026-11-13; wins over this folder's docs)
- `C:\Users\ayush\Downloads\404_Rendrer_KNOWLEDGE\404 Rendrer` (= `K`) is the main knowledge base for making videos. It is not a style.
- Every video: first read `K/CLAUDE.md`, `K/OWNER_TASTE.md`, `K/CHANNEL_STYLE.md`, `K/TEMPLATE_UPGRADES.md`, `K/CLAUDE_HANDOVER/memory/MEMORY.md` (+ files it lists), `K/CLAUDE_HANDOVER/SESSION_LEARNINGS.md`. Use K for tools, SFX, music, QA and pipelines (its Remotion `K/TemplateLibrary/` is reference only: Remotion was removed here 2026-11-16; build with HyperFrames / `tools/autoedit`). Clashes: see Rule order above; ask only if unclear.
- K paths from the old PC (`D:\404 Rendrer`, `C:\Users\avent\...`) = K. Never read K recursively (3.4 GB); skip `.cache`, `node_modules`, `pages`, media.
- Reading and using K is allowed.

## Owner SOP (added 2026-11-14; newest owner rules; general, applies everywhere)
- The SOP applies to every video: every style (Farrell, Nocturn, Abyssal, combined) and the Old Heritage / Iceberg kit. Always load it with the chosen style.
- The chosen style's guide sets the look (palette, fonts, devices); it replaces SOP section 4 only. Every other SOP rule (briefing, licence, privacy, pacing, text, audio, feedback decoder, checklist) always applies.
- `docs/workflow/SOP.md`: briefing, licence/privacy rules, editing/audio rules, feedback decoder, send checklist. Read it before every video.
- SOP wins over K and this folder on look, rules and checks. K stays the source for tools and pipelines. The SOP bans the 404 Thread look (case cards, stamps, tape/VHS, red seams, caps cinematic lines).
- Clashes with older rules: `styleguide/_shared/GENERIC_RULES.md` section H.

## Master SOP v2.0 = general rules for EVERY style (owner rule 2026-11-14)
- All styles (Farrell, Nocturn, Abyssal, combined) are caught-on-camera styles. So `docs/workflow/CAUGHT_ON_CAMERA_MASTER_SOP.md` applies to every video in every style. Read it A–Z before every video, with `docs/workflow/SOP.md`.
- Order: master SOP v2.0 > `docs/workflow/SOP.md` > K > `GENERIC_RULES.md` > style rule book. Exception: the chosen style's guide sets the look (palette, fonts, devices, title, grade) = the master SOP's channel profile (§3, §8).
- Pipelines (K, OHF kit) give workflow and tools only, never looks (master SOP §2.4).
- **SOP §2.4 ban wins over the style look (owner 2026-11-14).** Farrell: no sentence-case Farrell type, tilted 3-D pages, tier cards, phone motif. Abyssal: no berg level graphic, typewriter level cards, cyan palette, ice-cyan glitch titles (iceberg format may stay). Replace them with new devices from the refs. Top rule in both rule books.
- Its paths are Mac paths (`~/Documents/ALL PIPELINES/…`). On this PC, resolve them once (K = 404 Rendrer above) and note them here.
- Brief with no channel named → ask one question: "Which channel is this for, and is it a new one?"

## Caught-on-camera playbook (owner paste 2026-11-15)
- `docs/workflow/CAUGHT_ON_CAMERA_PLAYBOOK.md`: newest owner rules for every caught-on-camera video (never invent graphics, stills vs refs before render, per-case house-style table, raw rules, licence, sound, QC). Read it with the master SOP v2.0 before every video; where they differ, the playbook (newer) wins.

## Make a video (pipeline, 2026-11-18)
- Lead steps: `tools/autoedit/LEAD_RUNBOOK.md`. Compile to QC in one command: `bash tools/autoedit/run_all.sh <production> <edit> [sample <parts>|full] [--no-stills]` (`sample` = fallback only)
  (paths relative to this folder). Farm parts need `build/farm_entry.py` + a byte-identical copy of `tools/case-farm/farm/farm_contract.py`.
- Samples (intro + case 1) are live previews, not renders (owner 2026-11-18): `bash tools/case-build/preview.sh <part,part>`
  (Final Phase Lite, `tools/final-phase-lite/`). After the owner approves them there: one full render on GitHub.

## Long videos (2026-11-18)
- 2 h compilations: follow `docs/workflow/FAST_LONG_VIDEO.md` (time budget, fact check before recording, lean builders, farm
  limits). Before render: `python tools/case-build/lint_cases.py <cases dir> --fix`.

## Old Heritage / Iceberg kit (added 2026-11-14)
- `tools/oldheritage/` = the Old Heritage Files channel kit (own rules; its Remotion engine was removed 2026-11-16, media now in `Iceberg/media`, source in `Videos\CLAUDE\LEARNINGS`). Not a style. Read `tools/oldheritage/ANALYSIS.md` first, then its `CLAUDE.md`. Load only for Old Heritage / Iceberg videos.

## GX engine (2026-11-16)
- gx engine = HyperFrames at `styleguide/gx-admixdd/hf-engine`, media in `hf-engine/media`. Remotion removed 2026-11-16; old source archive at `Videos\CLAUDE\LEARNINGS`.

## Pick the style first (owner rule 2026-11-12)
- Each style lives in its own folder: `styleguide/<style>/` (`farrell`, `nocturn`, `abyssal`). Source: `<style>.json`; readable copy: `<STYLE>_STYLE_GUIDE.md`.
- "Video in <style>" → load only `styleguide/<style>/`. Never read the other style's folder or files. Never read the whole repo.
- "Combine <A> and <B>" → load both style folders, nothing else. Use A's rule book as the base; take B's rules where they make the video better. If two rules clash, ask the owner which wins.
- No style named → ask which style before reading any guide.
- **Generic rules (owner rule 2026-11-12):** every style also follows `styleguide/_shared/GENERIC_RULES.md` (audio cuts, clips ≥3 s, SFX/music levels, smooth flow; taken from Farrell). Always load it with the chosen style. The style's own rule book wins only where it says so.
- Every style guide keeps a feedback loop: owner notes → that style's json (rule book + Learnings) the same day; the next build reads them first.

## Load nothing at chat start (owner rule 2026-11-11)
- At the start of a chat, read no files from this folder. Answer from the chat alone.
- Read folder files only when the task is video editing, or making or updating the style guide.
- For that work, read `docs/workflow/WORKFLOW.md` first (steps, case threads, editing rules). Then only the files the step needs.

## Always
- **Renders are split** (owner rule 2026-11-13; repos 2026-11-16): every render splits over GitHub machines with `tools/case-farm/` (at most 180 jobs at once: `farm.local.json` cap 180; render chunks = cap - parts - 1) (repo PUBLIC `DeZAYU/case-farm`, account kumai007, media on private Drive). Heavy steps (Whisper, pre-cut encodes, face tracking, renders) run ONLY on GitHub, never on the laptop (owner 2026-11-16; exceptions: map clips, `tools/autoedit/assets/make_maps_pc.py`; the live preview `tools/case-build/preview.sh`, owner 2026-11-18); `tools/case-farm/task.sh` for scripts. `DeZAYU/render-farm` and the old `tools/cloud-render/` render scripts are deleted. This folder (text/code only) syncs every 15 min to PUBLIC `kumai007/STYLE-GUIDE` (task RenderFarmSync, `tools/cloud-render/sync_farm.py`). Work folder = `case-work/` in this folder. See `tools/case-farm/README.md`.
- **Stay inside this folder** (plus the main knowledge folder above). Do not read, learn from or search `../PROJECT` or anything else outside it until the owner says so in chat.
- **No Premiere Pro, no After Effects** here (denied in `.claude/settings.json`). Do not use Premiere-based skills.
- **Ref board: OFF** (owner, 2026-11-11). Do not run or edit it. If a task needs it, tell the owner and wait. Its notes: `CLAUDE.archive.md`.
- Never print keys (`tools/algrow-voice/.env`, env var `EPIDEMIC_SOUND_API_KEY`).
- Be concise. Mechanical work (rename, format, summarize, scrape) → Haiku sub-agent. Never suggest /compact as a cost saver.
