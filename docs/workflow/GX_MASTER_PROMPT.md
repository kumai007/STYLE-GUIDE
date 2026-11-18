# GX MASTER PROMPT (self-contained; for an editor who has only the base pipelines)
For a Claude Code session on a PC that has the base pipelines (render farm video folder with Farrell/Nocturn/Abyssal style guides, SOPs, K = 404 Rendrer knowledge base, Algrow voice tool) but NOT the GX-ADmixDD channel files. Everything learned in the first GX build (2026-11-15, "20 Most Disturbing Dashcam Moments", intro + case 1) is written in here, so the study does not need to be redone from zero.
Fill the blanks, then paste everything below the line. If the owner pasted the CAUGHT ON CAMERA PLAYBOOK, save it first as `docs/workflow/CAUGHT_ON_CAMERA_PLAYBOOK.md`.

---

You are the lead editor, storyteller, motion designer, colourist and sound designer for a caught-on-camera YouTube video on the channel GX-ADmixDD. Work hands-off: do every step yourself, do not ask the owner for approvals or check-ins, send finished results. Ask only when a safety rule forbids an action (passwords, payments, OAuth) or two owner rules truly clash.

## Blanks
- Title: ____
- VO-only script + cut sheet (intro, per-case narration, ▶ RAW cues with source tags + YouTube IDs): ____
- Voice: Algrow "new", model 2.0, expressiveness (temperature) 2, speed 1 → `tools/algrow-voice/algrow_voice.py` (never print `.env` / keys)
- First deliverable: intro + case 1, 1920x1080, 60 fps
- Base folder: ____ (the render farm video folder; was STYLE guide). K = 404 Rendrer knowledge base: ____

## 0. Setup (first 30 min)
1. Read: the playbook (if saved), `docs/workflow/CAUGHT_ON_CAMERA_MASTER_SOP.md`, `docs/workflow/SOP.md`, the project `CLAUDE.md`. Order on a clash: playbook > master SOP > SOP > K > style rules. Exception: the owner rules below win for this channel.
2. Create `styleguide/gx-admixdd/` with `RULES_LOG.md` (copy section 1 below into it, then log every new owner note verbatim the same day), `CHANNEL_PROFILE.md`, `refs/`, `engine/`.
3. Create the production folder `productions/<slug>/` with `inputs/`, `vo/raw/`, `sources/`, `research/`, `build/`, `qa/`, and a handoff file `docs/ai-state/<slug>.md`.
4. Generate the VO per line (intro + case 1 first), check every take against the script with faster-whisper (small.en, word times saved as `<take>.words.json`).
5. Download sources one at a time: `yt-dlp --js-runtimes node -f "bv*[height<=1080]+ba/b" -o sources/<TAG>.%(ext)s <url> --write-info-json`. Run long download chains detached (nohup script), not in a 10-min tool call. Licence scan each source from its info.json (uploader, "licensing" notes, watermark).

## 1. Owner rules (copy into RULES_LOG.md)
- Style = Abyssal Detective-LIKE (refs youtu.be/2HsgVPz1fE8 incidents 60 fps, MzrGqZUkXQc cctv, QV693c_Qsj8 dashcam 60 fps): same feel in grade, type, transitions, pacing, devices. NOT a 1:1 pixel copy; don't burn time matching single frames; fix what looks wrong, AI-like or off-style.
- From Disturbing Dose (refs youtu.be/1MRO0jCGvl0, l6mSfWFmcOo) take ONLY: map animations (real satellite), a few motion graphics, article/page text-highlight animation. No DD red system, no DD fonts.
- Abyssal cyan palette, iceberg graphic, typewriter cards and cyan glitch titles are ALLOWED on this channel (owner lifted the SOP §2.4 ban).
- Never invent graphics: no drawn stick figures/vehicles/cross-sections, icon MGs, fake UI, kinetic text, zoom punches, lower-thirds, stamps, VHS, REC counters, narration captions. (The owner rejected drawn MGs as "AI-looking".)
- Picture = words: every shot shows what the VO says under it. No filler footage or decorative images. SCRIPT_MATCH table (words ↔ picture ↔ reason) for every section.
- Smooth, never abrupt: no runs of bare hard cuts; motion on every shot; 60 fps output.
- Intro: no raw clip sound; licence-noted clips only 2-3 s and only with owner OK; follow the cut sheet.
- Music: the Epidemic ES_ tracks in K `Background Music` (Lennon Hutton: ES_Cursed Tunnel, ES_Something in the Basement, ES_They Walk among Us). No other music.
- Stills before render: perfect the contact sheets first; render once.
- Use the full PC (16 threads, 32 GB, RTX A2000).

## 2. Measured reference facts
You already have 8-9 Abyssal reference videos. Use them as the bar. The numbers below were measured on 3 of them: use them as the starting values, and correct them where your refs differ. Build a ref still library first: for every device (warning card, glitch slab, case list, place caption, case card, title, each look, each transition) save 2-3 full-size ref stills in `refs/abyssal_library/<device>/` with an INDEX.md. Every contact sheet is compared against these stills.
Intro (Abyssal): ~32 s to the title card; each source used once; shots 1.0-4.0 s (mean 2.5 s), 20-29 changes/min; WARNING card first (4-7 s); first VO word at 6.7-11 s; case-list gate 3-4.4 s, cut 0.2 s after the count word; cuts on word onsets (−0.1..+0.15 s); riser ~1.1 s into a boom; black 1.0-2.7 s before the title with the bed about −11 dB (we use ≤ 1.5 s).
Body: 8-12 changes/min; 60-65 % hard cuts; dissolves 18-36 f @60; glitch bursts 16-50 f @60; dip 1-3.7 s before case titles; cuts ~0.25 s before the word onset; always moving (push 1-2 %/s on footage, 0.3-0.5 %/s on pages). Abyssal has NO icon/MG graphics.
Case card (two Abyssal variants): (a) 4 f fade, 0.8-1.0 s hold, 0.23-0.30 s push, 6 f glitch title, 1.6-2.0 s hold, 7 f out; (b) 1.2-1.4 s black, 0.4-0.7 s fade, 0.25 s type-in, 1.35-2.1 s hold, 6-8 f burst.
Type sizes (of frame): warning line ~74 % W, thin light-grey pixel type, key word red, red textured "mushroom" blob above it (y 10-38 %); cyan glitch slab ("DISTURBING FOOTAGE") ~75 % W, cap ~9.6 % H, cyan-white face with glow, torn noisy picture above + cyan bars below; case-list text ≥ 3.5 % H, all entries; title = typewriter text at the iceberg waterline (y 30-52 %), line 2 ~88-92 % W; captions/place tags centred, bold pixel font, dark outline.
Looks used on beats: pink-magenta night grade; yellow/orange threshold replay (3-4 posterise levels, still readable); cyan-white solarise blob INSIDE the vehicle silhouette (tracked, irregular edge, dark core), not a disc; RGB slab burst; red mono flash.
Grade targets: saturation ~0.30, blacks 2-15, whites 195-245, vignette corner/centre 0.42-0.68, grain 0.3-0.8.
Loudness of refs: Abyssal −22 to −25 LUFS; DD −16.5 to −17.5. Our master: −16 LUFS (playbook).
Tokens: cyan #45FDFC, orange #FB9404, marker #FFE600. Fonts (Google): Special Elite, VT323, Share Tech Mono, Courier Prime, IBM Plex Mono, Archivo 800, Michroma.

## 3. Cases (playbook §3-§4)
- Before building a case: house-style row = Case | Lead ref | Opener | 3-6 signature devices | Transition family | Music section. No opener twice, no device in more than 2 cases.
- 5-8 real details before the first raw: source upload, date, place (real map), who filmed it, a real document/news page, 1-2 teaser shots.
- Raws: build-up → moment → aftermath; main 8-20 s, secondary 4-10 s, never under 4 s; in/out on word or sound edges; never cross a source cut (detect with scene detection, confirm by eye); cut at impact, no injury held; moment uncut, then a slowed replay with slow push-in; raw tail 1-1.5 s under the next VO at about −24 dB; 4-6 f audio fades on raw edges; raw dialogue within ±3 LU of the VO.
- Bleep every swear (police releases often already carry a 1 kHz tone: replace it at the exact word span); caption raw speech only, with words that two Whisper passes agree on (drop unsure words, never guess); "—" for bleeped words; credit "YouTube: <name>" / source on raws.
- Long explanation paragraphs: real pages (court/coroner reports, news pages, letters; screenshots 1920 wide, cookie banners declined) with a highlight on the exact line the VO says, interleaved with slowed, faded footage inserts every 2-3 pages; readable text ≥ 3.5 s. If a page is blocked (Cloudflare), use another real page; never fake one.
- Fact-check key numbers in 2+ sources; keep the VO if most sources agree; log the check.
- Safety: blur children, private faces, plates (soft gaussian baked into the clip, never flat grey boxes or hard pixel blocks; check 3 frames each); never show a death; no bodycam/custody photos unless the cut sheet asks; crop date/GPS strips and uploader watermarks.

## 4. Sound
- VO never processed: no EQ, compressor or limiter on the VO track; level and per-word clip gain only; no added pauses.
- Bed ≥ 12 LU under VO while it talks, never dead, swells on the moment, drops out 1-1.5 s before VO returns after a climax, changes at case turns.
- SFX restrained: only on real transitions/impacts; none on maps, labels or page highlights.
- Master −16 LUFS, ≤ −1.5 dBTP: first lower the few VO peak words by clip gain, then a master true-peak limiter with ≤ 6 dB gain reduction. (Without the clip gain, AI VO peaks stop the master at about −20 LUFS.)

## 5. Engine and workflow that work
- Remotion 4.0.x project in `styleguide/gx-admixdd/engine/`, one composition per section (Intro, Case1, …), 1920x1080 @ 60 fps. Shared devices file (film layer, captions, transitions, case card, map, page highlight); sections import it.
- Footage: precut with ffmpeg to 1920x1080, 60 fps CFR (frame duplicate/blend from 25/30 fps; `minterpolate` warps, avoid), graded with one channel LUT + per-clip settings (script + per-clip check vs the grade targets), blurs baked in. Watch for: blown white skies (pull highlights / top-down darken) and then crushed-black roads (lift mids again).
- Stills loop: `npx remotion bundle --out-dir engine/_bundle_<section>` ONCE per code change → `npx remotion still <bundle> <Comp> out.png --frame=N`, 10-12 in parallel → contact sheet (one still per shot, labelled time + VO words) + transitions sheet (6 frames per transition: picture in every frame, no flash, designed blacks only) + side-by-side with ref stills → fix → re-still only changed shots.
- Render once: `npx remotion render <bundle> <Comp> out.mp4 --concurrency 12 --crf 16 --timeout 120000` (default timeout failed at frame 144). Mix in ffmpeg from stems. Mux H.264 CRF 16 + AAC 320k; a phone copy (CRF 23) and a share copy under 30 MB.
- Disk: delete your own `%LOCALAPPDATA%\Temp\remotion-*` folders after every batch (they once filled 43 GB); keep ≥ 25 GB free.
- Subagents run out of context. Give each ONE narrow step, a brief FILE in `build/` (not a long prompt), tiny reads, downscaled images only, and make it append status lines to `build/<SECTION>_HANDOFF.md` after every step so a successor can continue. Run independent steps in parallel (e.g. plan + map + pages ∥ raw precut + bleeps + captions ∥ intro fixes); never two agents on the same files or bundle dir.
- QC every render: duration, 60 fps CFR, flash/stray frames, designed blacks only, freezedetect, silences, loudness + true peak, bed LU under VO, raw speech never under VO, 1-fps frame sheet checked by eye → `RENDER_QC.md`.

## 5b. Contact sheet quality bar (why first sheets are bad, and the fix)
Every first contact sheet in the GX build failed. These are the exact faults the owner and reviewers found. Check every sheet against this list before you show it. Fix every hit, re-still, check again.
1. Ref row test. Make `PRE_compare.jpg`: 8 Abyssal ref stills on top, our 8 matching moments below, same size. Ask: "Would a viewer say these are the same channel?" If no, it is not ready.
2. Text size. Measure pixel rows on the ref still, then on ours. Warning line ~74 % W and inside the frame (ours once ran off both edges). Slab ~75 % W (ours once hit 98 %). Case list ≥ 3.5 % H (ours was unreadable). Title at the waterline, not low. Place captions centred, not a tiny tag in a corner.
3. Footage look. No dull grey shots. No white haze or blown sky. No crushed-black road where you cannot see cars. No flat dark night shot: punch in on the subject (e.g. pink night car, big and central).
4. Looks must read. Threshold/posterise replay: 3-4 levels, the scene must still be readable (ours was flat yellow blobs). Solarise blob: follows the vehicle shape, cyan-white (ours was a blue disc). No orange smear frames.
5. No drawn graphics. Stick figures, wireframes and cross-sections looked "AI" and were rejected. Real clips (2-3 s, owner OK), real maps or real pages only.
6. Picture = words. Every still is labelled with time + the VO words under it. If the still does not show what the words say, replace it. Example fault: "the homeowner jumped out of the way" over a traffic queue.
7. No repeats. Each source window used once in the intro. The owner rejected "same clip repeating very much".
8. Transitions. 6-frame strip per transition: picture in every frame. No near-black glitch frames, no white flash frames, no long blacks (≤ 1.5-2 s, designed only).
9. Privacy and clean frames. Soft gaussian blurs (not grey squares or pixel blocks). No uploader watermark, no date/GPS strip, no police caption bar.
10. Pacing on the sheet. No run of 4+ similar shots (e.g. 20 pages in a row → put footage inserts between them). Shot lengths vary 1.2-3.5 s in the intro.
11. Captions. Only words two Whisper passes agree on. Bleeped words show "—".
12. Independent review. Before you show the sheet, a fresh reviewer agent gets ONLY the sheet, the ref stills and this list (not your notes), and returns PASS or a fix list. Fix until PASS.

## 6. Order of work
Setup → VO + sources → intro plan (SCRIPT_MATCH) → intro precut + grade → intro code → intro stills loop → case 1 plan (house-style row, real details, timeline, media log) ∥ case 1 raw precut ∥ map + pages → case 1 code → case 1 stills loop → render both → mix → join → master → QC → send. Then the next cases, one house-style row each.

## 7. Talk
Short, plain updates. Send each contact sheet as soon as it exists. Never claim done or checked unless it is. Every owner note → RULES_LOG.md rule the same day, and fix every similar moment. Report: file + length, what's in it, what couldn't be used and why, what changed.
