# Old Heritage Files: case brief (13 Nov 2026 night build: Dashcam DC, Amusement Iceberg AM, Incidents IN)

Owner's goal: three finished ~40-min videos by morning. Quality bar = the two reviewed cases DC01 (_engine/src/cases/DC01.tsx) and
AM01 (cases/AM01.tsx, with dev/AM_LevelEntry.tsx); read the one for your video and its dev files before building. Read also:
_kit/CASE_BUILD_GUIDE.md (all; the OWNER RULE sections at the end win), _kit/RULES/owner_memory/*.md, Iceberg/CLAUDE.md.

## Per case
- Setup: `_tools/newcase.sh <VID> <NN>`. Facts, handle-with-care (wording limits, blur notes, trims) and footage notes with in/out
  times: `<video>/research/outline.md` section "### N.". Footage already downloaded: `<video>/footage/cNN/` (if a file is missing
  because of YouTube's bot check: the owner approved his Chrome cookies on 13 Nov — `yt-dlp --cookies-from-browser chrome` is allowed; pace downloads).
- VO: `<video>/vo/raw/CASENN.mp3` + `.srt` (one take; check `vo/raw/MERGED.txt`: some takes also contain a level line, the intro or the
  outro). Never split mid-sentence.
- Raws only at the incident moments (main 10–25 s, others ≥ 6 s); raw audio through `_tools/rawclean.py`; bleep/mute swearing;
  blur what the outline says (plates, faces, injured people).
- **Countdown videos (DC, IN; owner 14 Nov 2026)**: a case opens number -> VO: the CaseNumberTransition (`<KEY>_T.mp4`) is the only intro, then the case starts straight on its first VO line over footage. No title card, no raw before the first VO line (a cold-open raw goes after the first VO paragraph). Built masters were trimmed by `_tools/open_on_vo.py` (untrimmed kept as `out/<KEY>_titled.mp4`; transition lead-in = `build/CASEnn/transition.json` -> `media/_t_in.mp4`); new countdown cases: build without the title Sequence and start the VO at 0.
- Title: the brand TitleCard (style A) or the typewriter strike (style B, letters struck one by one, place · year line under it).
  Nothing else for titles. Case-to-case transitions are being designed separately: use the current glitch/blur-dip.
- Owner's taste (13 Nov): "references type high quality", NOT "Claude AI" looking. No invented flashy templates; restraint. Red
  emphasis only on the one phrase that matters. Documents/news = the REAL page captured (`_tools/capture_page.py`) shown cleanly
  (paper sheet with depth, one key line brought forward), never re-typed text on a blurred frame. Real photos from the web may be used
  where they add information (no TV/agency watermark, no mugshots). Footage first, kept big; raw is important.
- Iceberg (AM): the first case of each level opens with `AM_LevelEntry` (level n + name from dev/AM_levels.ts) before the title.
- Length: VO + raws, ~1:45–2:45 per case so each video lands ~40 min. Don't pad.

## Efficiency (the owner's account has limits; many builders run at once)
- One contact sheet per clip, ~6–8 stills per case at the key beats, one full render. No exhaustive QA passes.
- Renders only via `_tools/render_case.sh` (3 slots machine-wide; wait your turn, run it in the background). 3-D: at most one
  short shot per case, Three.js only (`_tools/render_map3d.sh` or a `<ThreeCanvas>` device), never Blender; skip it if it isn't clearly better.
- Finish each case completely (cutcheck clean, `NOTES.md`, REGISTRY.md line per new device) before the next.
- Final reply: one line per case: KEY, duration, raws, cutcheck, anything missing.
