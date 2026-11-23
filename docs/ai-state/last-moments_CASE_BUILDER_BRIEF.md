# last-moments case builder brief (cases 2-21, 2026-11-23)

You build ONE case of "Most Disturbing Last Moment Footage Ever Recorded" as one HyperFrames part, same look as case 1.
root = `C:\Users\ayush\Videos\CLAUDE\render farm video` (Git Bash paths: `/c/Users/ayush/Videos/CLAUDE/render farm video`).
engine = `root/styleguide/gx-admixdd/hf-engine`. NN = your case number, two digits (02..21).

## Done =
1. `engine/cases/lm_caseNN.mjs` written with `cases/lm_lib.mjs` (read its header comment: it is the API).
2. `cd engine && node build.mjs lm_caseNN` exits 0, and `npx hyperframes check parts/lm_caseNN` passes.
3. Snapshots looked at: `npx hyperframes snapshot parts/lm_caseNN -o root/case-work/lm_scratch/cNN_snap --no-end --at <12-20 times>`,
   then Read `contact-sheet.jpg`. Fix anything wrong (black frames, text off picture, wrong subject, unblurred private face).
4. Notes `root/productions/last-moments/edit/notes/cNN.md` (what each media file is + licence, open problems). Short.
5. Final reply to the lead: 5 lines max (end time s, shot count, sources used, problems left).

## Inputs
- Timeline: `cd root && python -I productions/last-moments/build/case_skeleton.py NN` -> `productions/last-moments/edit/skel/cNN.json`
  (vo files + starts, raws with part times, VO spans, end, words file per VO). If it says "missing ...wav", the narration is
  still being cleaned (another process): do the media work first, then run it again (check every few minutes with
  `ls productions/last-moments/vo/cut | grep cNN`).
- Narration words with times: the `words` json per VO (`{"words":[{"w","start","end"}]}`, seconds from that VO's start;
  part time = VO start + word start). Use a tiny python to print them as lines "t  word", don't read the json raw.
- Script for your case: `C:\Users\ayush\Downloads\Most Disturbing Last Moment Footage Ever Recorded cut sheet.md`,
  section `## CASE NN` (grep -n '^## CASE' to find line ranges; read only your section). It has the raw cues, notes, licence hints.
- Source videos (already conformed, 60 fps): `engine/media/last-moments/<TAG>.mp4`. 1-fps contact sheet with time labels:
  `root/productions/last-moments/sources/_sheets/<TAG>.jpg` (Read it to find b-roll moments). If your TAG has no
  media file yet: `python -I productions/last-moments/build/conform_local.py <TAG>` (if sources/dl/<TAG>.mp4 exists).
- Reference: `engine/cases/lm_case01a.mjs` shows the look in use (grep, don't read whole). Owner rules: section "Rules" below.

## Building the table
- All times are PART seconds. Title screen 0-5.5 s is automatic. Raw cues come from the skeleton (`raws` array, pass it as is,
  you may add `credit: 'FOOTAGE: ...'`, `mos` face boxes, `bri`). Your `shots` must tile every remaining second
  (5.5 -> first raw a, raw b -> next raw a, ..., last raw b -> end). The lib throws if there is a gap or overlap.
- Shot length 3-7 s (never < 3 s except to meet a raw edge exactly; lib rejects < 1.5 s). Cut on sentence / clause
  boundaries from the word times. Picture must match what the narration says at that moment.
- Before the first raw of the case, and wherever the narration describes the footage, show that footage (H.clip / H.frz
  on the described moment, H.stamp on a burned-in date/time stamp the narration reads out).
- Variety: real source footage (b-roll from the same source videos, outside the cue windows the notes forbid) >
  real photos of the named places/things (Commons) > maps > real article pages when the narration cites an outlet /
  reporter / document > text cards (H.card, dates and numbers) > stock (last resort, ILLUSTRATIVE label is automatic).
- Text: one text device at a time. Places = H.place (centred). Name labels = H.label, max 2 per case, plain, inside
  picture. Dates = H.date. Typewriter only on the title screen (automatic).
- Every photo, clip window and article is used ONCE in the whole video. Put your files in `media/last-moments/cNN/`
  (case-local names) so nothing collides with other cases. Do not reuse case 1 media.

## Getting media (scripts only; never use WebFetch / WebSearch tools)
- Commons photos: `python -I productions/last-moments/build/commons_search.py search case-work/lm_scratch/cNN <tag> "<query>"`
  -> Read `<tag>.jpg` sheet, pick, then `... get case-work/lm_scratch/cNN <tag> <index> cNN/<name>.jpg` (prints the credit
  text; pass it as the photo credit). Wikimedia throttles: one request at a time, few searches (max ~12 per case).
- Satellite map: `python -I productions/last-moments/build/eox_map.py <lat> <lon> <zoom> cNN/map_<name>.jpg name=lat,lon`
  (prints pin pixels). Credit 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)'. Use H.map or H.photo on it.
- Article page: add `{"id": "<id>", "url": "...", "highlight": ["exact sentence on the page"], "blur_words": []}` to
  `productions/last-moments/edit/assets.json` under `cases.cNN.pages` (python json edit, keep others; create the case
  key if missing), then `python tools/autoedit/assets/gh_assets.py "page|cNN|<id>|productions/last-moments/edit|productions/last-moments"`,
  then `python -I productions/last-moments/build/art_crop.py cNN_<id> cNN_<name> "OUTLET" "DATE"` and use H.art('cNN_<name>', t).
  Read the crop jpg to check it. If capture fails twice, skip the article (use a card with the quote + outlet instead).
- Extra footage from YouTube (only when needed, e.g. a locked source): `python -m yt_dlp --no-update "ytsearch5:<query>" --flat-playlist --print "%(id)s | %(title)s | %(duration)s"`,
  download with `python -m yt_dlp --no-update -f "bv*[height<=1080]+ba/b" -o "productions/last-moments/sources/dl/<NEWTAG>.%(ext)s" <url>`
  (merge to mp4), then conform_local.py <NEWTAG>. One download at a time. Note the channel in your notes (credit it).
- Stock (rare): Pexels video page id -> skip unless nothing else fits.

## Rules (owner, all confirmed; master handoff section 4)
- Glitch only on the intro warning (not in cases). No zoom gimmicks, no VHS/static, no stamps/tape, no cyan, no iceberg.
- CCTV stamp highlight = H.stamp (clean even red pill around the stamp text, inside the picture).
- Narration cites a source -> show that real article (byline/outlet visible, key line marked by the marker).
- Faces of victims and private people blurred (photos: `mos: [[x,y,w,h]]` in 1920x1080 cover-box px; clips:
  `mos: [{ r: [x,y,w,h] }]` or `{ keys: [[srcSec,x,y,w,h],...] }` in SOURCE px). Public officials, police, journalists: no blur.
  Follow every blur / mute / HARD OUT note in the cut sheet cues exactly; never show the death, a body, or the moment of harm.
- Stock: free licence only, ILLUSTRATIVE label (automatic), as little as possible. Never B&W stock.
- Mix is automatic (narration 100 %, music 75 %, SFX 60 %, raw sound levelled; `mute: true` raws get room tone).
- Every clip >= 3 s. No flat black plates, no plain text on flat colour: cards sit on blurred real photos/footage (H.bgP / H.bgV).

## Machine rules
- Never read `engine/media/` recursively, `parts/`, or big files whole. grep / sed -n ranges. Bound all output.
- Do not edit `cases/lm_lib.mjs`, `devices/*`, other cases, or `build.mjs`. If the lib blocks you, say so in the final reply
  and work around it in your case file.
- Do not render (`npx hyperframes render`) - the lead renders. Snapshots are fine.
- No `$(...)` inside long command lines; put logic in small .py files under `case-work/lm_scratch/cNN/`.
- Never print keys or .env files.

## Context budget (builders ran out of context, 2026-11-23)
- Write `cases/lm_caseNN.mjs` EARLY: first version as soon as the skeleton exists, using source b-roll (H.clip/H.frz), cards,
  maps and photos you already have; build + check it. Then improve shot by shot. A built file beats a perfect plan.
- Save `edit/notes/cNN.md` at each milestone (what is done, what is next) so a fresh agent can continue.
- Look at photos on contact sheets (search sheets, snapshot sheets), not one by one at full size. Max ~12 searches.
- Keep tool output short (head/tail, grep). Never cat whole json/word files; print only what you need.
- Face tracking: simple static boxes or 2-4 keyframes are enough; do not build tracking tools.
