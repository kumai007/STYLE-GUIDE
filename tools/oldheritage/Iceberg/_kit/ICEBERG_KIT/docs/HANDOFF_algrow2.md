# HANDOFF — algrow 2: three 404-channel iceberg videos (assets ready to edit)

Built 2026-10-25. Any session can start editing from here. Read this file, then the style docs in §4.

| folder | video | cases / raw cues | VO (in `_voice/`) |
|---|---|---|---|
| `CCTV INCIDENTS [ VOL 1 ]` | 25 Most Disturbing CCTV Incidents Ever Caught on Camera (Vol. 1) | 25 / 78 | `CCTV_vol1_VO.mp3` 44:30 + `.srt` |
| `CCTV INCIDENTS [ VOL 2 ]` | … CCTV Incidents (Vol. 2) | 25 + cold open / 88 | `CCTV_vol2_VO.mp3` 42:10 + `.srt` |
| `videos before disasters [ vol 2 ]` | 25 Most Disturbing Videos Before Disasters … (Vol. 2) | 25 + cold open / 97 | `disasters_vol2_VO.mp3` 43:52 + `.srt` |

Live counts (sources, raws, failures): see each folder's `NEED_FROM_OWNER.md` and re-run `bash _tools/prep_new.sh` (§5).

## 1. Voice
- Algrow Stealth voice **"new"** = `default-pd4i7bs8z6-qjsqmqbjlxg__new-9fcmr`, model **2.0**, temperature **2**, speaking_rate **1**. (Differs from the older 404 "Obscure Collab"/1.05 setting in the cheat sheet: use "new" for these three.)
- Sample: `_voice/voice_sample_new.mp3`. **Owner CONFIRMED the voice (2026-10-25)**, and the full VOs are final: `_voice/*_VO.mp3` + word-level `.srt` (job ids in `_voice/VO_JOBS.md`). Lock edit timing to them.
- Vol 1 has no VO-only file: its VO text was extracted from the cut sheet into `CCTV INCIDENTS [ VOL 1 ]/VO_only_extracted.md`.
- Runtime: VOs are ~42–45 min; the house target is 50 min → `_shared_tools/runtime_plan.py` → `runtime_fix.py` → `vo_with_gaps.py` (ICEBERG_PLAYBOOK §4) opens raw slots at the VO pauses.

## 2. Folder layout (per video; mirrors Dashcam/AmusementPark)
```
<video>/
  *cut sheet.md            owner's V-R-V-R cut sheet (links, raw in/outs, notes, ⚠ SCRUB). Use as hints only (playbook §1).
  *VO only.md              VO text (Vol 2 + Disasters); Vol 1: VO_only_extracted.md
  cases_map.json           THE index: per case (c01..c25, cold_open, intro, L1..L7 level cards, outro): number, level, title,
                           location, tags -> YouTube id/url; seq = VO paragraphs and RAW cues in order. Each raw cue:
                           id (cNN_n), tag, yt, source, start/end (sheet), chosen_start/end + scrub_note (SCRUB cues),
                           quote / visual, notes, raw_file, raw_src_in, raw_in/raw_out (cue inside the raw file), transcript.
  scrub_choices.json       the chosen times for every ⚠ SCRUB cue, with how each was found (Whisper line or contact sheet).
  sources/<yt>.mp4 + .info.json   downloads (1080p max). *.err = failing (see NEED_FROM_OWNER.md).
  raws/<id>.mp4            each RAW cue window +1 s handles, CFR 30, GOP 15, no B-frames, h264_amf cqp 18/20, AAC 48k, native res.
                           The cue itself = raw_in..raw_out seconds in the file. Not graded (grade in the edit: neutral grade.cube).
  raws/_scrub/<id>.jpg     1 fps contact sheets (labels = source seconds) used to pick the SCRUB beats.
  transcripts/<id>.json/.srt   faster-whisper small, word times relative to the raw file; non-English speech has
                           `en` (Whisper translate) and the .srt is English. The cut sheet's own English rendering is in
                           cases_map quote. transcripts/_src/<yt>.json = source-time Whisper of every cue window (+-4 s, SCRUB +-25 s).
  uploaders.json           per source: title, channel, channel_url, handle, subs, upload_date, views, duration, description, flags.
  LICENSING.md             agency/licensing lines, reuse threats, cut-sheet watermark/logo/caption notes, missing metadata.
  pages/cNN/shots/<name>.png + .json   fact pages (news / official / Wikipedia), 2x DPR 1280 css, JSON = highlight boxes
                           (+focus/yaw/pitch for the page device). yt_<TAG>.png = the creator's own YouTube watch page
                           (sidebar/comments removed, boxes on channel name + title). pages/PAGES.md = table + usability notes.
  places.json              [{case, name, lat, lon, precision, source}] for map shots (satellite: NAIP US / Sentinel-2 abroad).
  NEED_FROM_OWNER.md       failing downloads + owner decisions.
```
Shared: `_tools/` (scripts below), `_voice/`, `dl_all.sh` (original downloader).

## 3. Open items / flags (details in each folder's NEED_FROM_OWNER.md and LICENSING.md)
- **Agency clips (house rule: none):** Disasters c01 [NAH]+[NAX] = Storyful (both copies of the clinic crash), c03 [HOU] = Newsflare-managed, c24 [CNN] CNN licensing line, c20 [STL] StreamTime "duplication strictly prohibited" (sheet already says clear rights first). KBS (c25) all-rights line. Vol 1 c17 [LG] is CC-BY 3.0 (credit "LG").
- **SCRUB picks that need a frame-check before use** (scrub_note says so): Vol 2 c09_2 (elephant: hard stop before it lies down), c25_3 (explosion at 6 s), c22_4; Vol 1 c06_2, c09_2, c13_2; Disasters c09_2 break-up frame, c20_1/c20_3 Dali light flickers (not visible at sheet scale), c23_2 (figure behind Abby not resolvable).
- Vol 2 c07_3: the quote "slow down" is not in the 75 s upload (full-source Whisper) — chosen window uses "I can't remember"; needs another copy for the line.
- Pages: Vol 1 c01 has no page (creator unknown); weak/partly cases listed in each pages/PAGES.md; blocked sites were never bypassed.
- Not done (out of scope here): grading, 50-min runtime slots, beat maps, music/SFX, renders.

## 4. Style (404 channel = Waterpark look; NOT the Warrior Mind look)
Read before editing, in this order: `D:/404 Rendrer/ICEBERG_PLAYBOOK.md` (process), `D:/404 Rendrer/OWNER_TASTE.md` (owner rules, wins conflicts), `D:/404 Rendrer/CHANNEL_STYLE.md` (+ frames in `D:/404 Rendrer/refs/channel_style/`), `D:/EncountersEditor_v5.7/_DESIGN_SYSTEM_CHEATSHEET.md` (404 column), `D:/404 Rendrer/TEMPLATE_UPGRADES.md`, `Video-QA-System/MISTAKES.md`.
Reference builds: `D:/404 Rendrer/iceberg/AMUSEMENT_PARK_FULL.mp4`, `DASHCAM_FULL.mp4`; projects `D:/404 Rendrer/AmusementPark`, `D:/404 Rendrer/Dashcam` (same asset layout); DD refs `D:/404 Rendrer/refs/dd/`.
Key rules: footage-led under VO; raws 2–8 s only where the real sound is the moment, subtitled (use transcripts/); no text restating the VO; ≤1 device/10 s; Remotion 30 fps 1920x1080 via `TemplateLibrary` (`node tools/sync.mjs --to <proj>/remotion`, editor kit A or B, theme WATERPARK); no handwritten fonts; Music 8/9/10; no-contact rule (cut before contact, blur injured/dead faces, mosaic injuries); −16 LUFS, TP ≤ −1; deliver to `D:/404 Rendrer/iceberg`.

## 5. Tools (`_tools/`, Python = `D:/EncountersEditor_v5.7/WM_POL50/.venv`, run with `-I -X utf8`)
- `bash _tools/prep_new.sh` — picks up newly downloaded sources in all three videos: Whisper windows + scrub sheets → cut raws + transcripts → uploaders/LICENSING → YouTube watch pages → NEED_FROM_OWNER. Resumable; heavy steps one at a time.
- `build_map.py <folder>` (re)parse cut sheet → cases_map.json (keeps chosen/raw fields). `scrub.py list|apply <folder>` pending SCRUB cues with Whisper context / apply scrub_choices.json. `cut_raws.py <folder> [--force]`. `asr_windows.py`, `info_scan.py`, `yt_pages.py`, `make_need.py`, `retry_failed.sh` (cookie retry; don't run while another downloader is active).
- Page capture tool: `D:/404 Rendrer/Dashcam/tools/capture_page2.py <url> pages/cNN <name> --phrase "…" [--js …] [--reject "Reject all"]` (one Chrome at a time: shared profile).

## 6. Next steps to edit (per video)
1. Owner: confirm the voice sample; answer NEED_FROM_OWNER items (missing clips, agency cases).
2. Case order (best real-sound case first) → `vo/case_order.json`; runtime to 50 min (playbook §4) → `vo/vo_50min.wav`, `timeline_50min.json`, `vo_words_50min.json`.
3. New Remotion project folder per video (copy an editor kit; Vol 1 and Vol 2 should use different kits/siblings so they don't look templated side by side).
4. Per case: beat map `maps/map_cNN_v2.md` from cases_map.json (VO paragraphs + raw slots), pages/ and places.json; grade raws (`Waterpark/study/grade/apply_grade.py`) into `remotion/public/`.
5. Gate before rendering (playbook §7: audit_devices, PACING_AUDIT, still sheet, side-by-side vs refs, frame-reviewer agent).

## OWNER DECISIONS 2026-10-25 · "videos before disasters [ vol 2 ]" (binding)
Licensing rule: avoid agency/licensed clips (see that folder's LICENSING.md).
1. **DROP case 01 (vet clinic crash, "Are the dogs okay").** Both of its clips are Storyful-managed (cUHB1GmW1IE, Fb-yMIMBkJo), so there's nothing clean to cover it.
   - Old case 02 (Cobb Parkway plane) becomes **CASE 1**. Renumber everything after it.
   - VO: cut the case 01 narration out of `_voice/disasters_vol2_VO.mp3`, from **00:00:56.89** ("Noah's Ark Companion…") to **00:02:24.45** (just before "A dashcam is rolling…"). Use the word `.srt` for exact edges and keep a natural 0.3 s pause.
   - Level 1 intro line (just before 00:00:56.89): "Everyone in this first level walked away…". It still works without case 01.
2. **MOVE case 03 (Houston fire, "Swinging down one floor") to the LAST position**, after the final case and before the outro. Its main clip HOU (Cg9PWSHL4Vg, Karen Hill) is Newsflare-managed. Cover as much of it as possible with the clean CBS clip (5owguoRcx0E), and keep the HOU raws minimal.
   - VO segment to move: **00:03:38.09** ("Karen Jones was at work…") to **00:05:13.84** (just before "A tiny white plume…"). Place it before the outro line at **00:43:27.76** ("That's all twenty five…").
   - Its narration says nothing about levels, so it stands on its own at the end.
3. **Cases 20 (Baltimore bridge), 24 (Sewol) and 25 (Muan) stay where they are** (already at the end).
   - **24:** drop the CNN clip (KisLJY2OM3g) and use the JTBC clips (9wbL3mlmhnU, mOqeTGjKMDs).
   - **20:** main StreamTime Live cam (mULzspJZuf8, copyright line). Lean on WBAL-TV (XeAEXNrdxBs) and keep the StreamTime raws short.
   - **25:** KBS (Tk5hjgyY6tk, -H-RTn7htcU, copyright lines). Lean on the local channel clip (uzBjF9spnzg) and keep the KBS raws short.
4. **COUNT CHANGE:** with case 01 dropped, the video has **24 cases**, but the VO says "twenty five" in three places:
   - 00:00:18.78 "Twenty five more videos, seven levels down."
   - 00:00:27.11 "These are twenty five more times…"
   - 00:43:27.76 "That's all twenty five."

   **Re-voice those 3 lines** with "twenty four" using the same voice settings (§1). Generate them as one short Algrow job and splice them in on the word edges. No other VO needs regenerating.
