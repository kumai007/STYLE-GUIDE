# How one case is built (the Trauma v5 standard, 2026-11-01)

Owner rules: OWNER_RULES.md (all 30). This file is the procedure. Model case: Most_Disturbing_Flash_Games s007 (Trauma),
spec at V5_flash_games/007_trauma/research/spec.json — read it before writing yours.

## 1. Know the narration
`D:/rtmp/cases_bak_1101/<video>/sNNN.json` → beats[] with `id`, `at`, `sec`, `say`. Every beat id you don't put in the spec gets
filled automatically — so put EVERY spoken beat (all ids except the lead `b00`) in the spec.

## 2. Log the footage, moment by moment
For each clip in `cases/<video>/assets_sNNN.json` (`clips[].src` under
`D:/EncountersEditor_v5.7/GX channels/MASTER_TEMPLATES/public/`), make contact sheets and LOOK at them:
`ffmpeg -i <clip> -vf "fps=1/4,scale=240:-2,drawtext=text='%{pts\:hms}':x=2:y=2:fontsize=14:fontcolor=yellow:box=1:boxcolor=black,tile=10x7" sheet_%02d.png`
(use fps=1 on short stretches to pin exact seconds). Write down where each event the narration mentions happens. Note what to avoid:
menus / "BUY" screens / title screens (unless the line is about them), streamer facecams, watermarks, YouTube UI, white flash frames.
If a clip has a facecam or banner, give the shot a `"crop": [x, y, w, h]` (source pixels) that keeps only the game.
Never use `-ss` before `-i` when reading sheet timestamps (pts restart at 0).

## 3. Research everything that is not gameplay
Launch page (where/when it came out: Newgrounds/Kongregate/Steam/official site/dev blog, web.archive.org ok), creator photos
(real, face visible; crop out channel logos), and for every out-of-game claim (development, inspirations, release, reviews, awards,
quotes, sales) the article/blog/interview/review page that states it. Capture with
`python "D:/404 Rendrer/LOSTMEDIA/tools/capture_page.py" jobs.json` (read its docstring). Save under
`V5_flash_games/<case folder>/research/pages/` (png + json) and `research/images/`. Never bypass bot checks, Cloudflare or logins;
skip blocked sites. No agency/stock watermarked photos. Look at every capture; drop cookie walls / error pages.

## 4. Write research/spec.json — one entry per beat id
- gameplay line → `{"t": "rawFullFrame", "src": "c_xxxx.mp4", "clip": <second the shot starts>}` (add `"crop"` if needed;
  `"footageWindow"` only for title cards / UI the line is about). Each moment once: two shots of one clip ≥5 s apart.
- `"pin": true` only for scenes that are bright on purpose (white hospital rooms); otherwise the tool slides the start ≤8 s to dodge
  in-game flashes.
- sourced fact → `{"t": "proofPage", "page": ["<capture>.png", "<exact proving text as on the page, ≥15 chars where possible>"], "tuple": {"variant": "marker|select|underline", "cam": "tiltL|flat|tiltR|rise"}}`
  — vary variant and cam, never the same pair twice in a row.
- creator mentioned → `{"t": "ddPhotoNameBar" | "farPeoplePortraitInset" | "farPeopleNamesOnPhoto" | "nocTextNameSuper", "photo": "<file in research/images>", "name": "…"}`
  (PortraitInset also needs `"src"`/`"clip"` for the background). Rotate the four.
- a painting / another game / a real photo → `{"t": "depth25d" | "vvVVBlurFill", "image": "<file>"}`
- an explainer ONLY where nothing real exists and it explains a relation (timeline, cause→effect, comparison, number):
  `{"t": "vvScene", "vv": {...}}` — see Trauma b10s/b70s/b71. Glyphs: person personRaise runner tv flame drop x check question exclaim
  arrow plus equals phone car house cross cloud bolt clock skull speech sun rain gate lock letter hands rock wave. ≤2 per case.
- `"hold"` = the shot before runs on; a picture may stay ≤6 s in total.
Gameplay only plays when the line is about the game. The opener (first 1–2 lines) is the launch page.

## 5. Apply, render, audit (orchestrator)
`python tools/apply_spec.py <video> <n> <spec>` → improve_case → clamp → render_list.sh → 1-fps sheets, flash/pop scan, look at every frame.

## Audit lessons (cases 8–11)
- VV labels ≤14 characters (longer ones get cut off on screen). Glyph must picture the label (question for a theory, not rock).
- Dark-theme pages (Kongregate descriptions, TASVideos) render unreadable: use a light page or another source.
- A page appears in at most 2 separate runs per case (rule 12); consecutive highlights on one page count as one run.
- No usernames of runners/commenters in a highlighted line.

## Detailing (owner 2026-11-02) — the approved model is now Coma: V5_flash_games/008_coma/research/spec.json
- Callouts, RARELY (≤4 per case, ≥40 s apart, only when the line names something the viewer could miss):
  `{"t": "footageMark", "src": ..., "clip": <sec>, "pin": true, "marks": [{"x": 0-1, "y": 0-1, "r": 0.05-0.1, "label": "Real name", "at": <frame in shot>}], "tuple": {"variant": "ring|freeze"}}`
  x/y = fraction of the SOURCE frame at the mark time — extract that exact frame and look. If the game camera pans, use "freeze".
- VV acted scenes (2–4 per case) for story actions nobody filmed or a relation: `{"t": "vvAct", "vv": {"act": "walkTo|approach|fall|take|vanish|wait|split",
  "a": {"glyph": "person", "colour": "green", "label": "PETE"}, "b": {...}, "prop": {...}}, "src": ..., "clip": <bg sec>}` — each a different act.
- Creator: ONE person entry per case (first mention), with `"role"` and `"facts"`: 3 short REAL sourced facts (works + years). Later mentions = gameplay or a page.
- No placeholders, no invented documents, no fake UI.
- Run tools/vary_spec.py after writing the spec (it rotates looks and enforces these caps).
