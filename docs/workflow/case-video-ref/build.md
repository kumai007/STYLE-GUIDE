# Build path: cut sheet + script -> assembled Premiere sequence

Tools: `C:\Users\ayush\Videos\CLAUDE\PROJECT\tools\case-build\` (run with `python -I`). `V` = the video's final home,
e.g. `PROJECT\RL-EDIT\<video>\` (Premiere stores absolute paths: write files where they will stay, before importing).

## 1. Parse the sheet (free)
```
python -I tools/case-build/cutsheet.py summary SHEET.md            # cases, tags, cues, VO chars (= Algrow cost)
python -I tools/case-build/cutsheet.py parse SHEET.md --vo VO.md -o V/job.json
python -I tools/case-build/cutsheet.py vo-csv SHEET.md -o V/vo_lines.csv
```
The tag -> URL map is the sheet's own `[TAG] <url>` lines. A parse error names the line; fix the sheet, not the parser.

## 2. Voice (skill `algrow-voice`; key in `tools/algrow-voice/.env`, never print it)
Ask which voice. `python algrow_voice.py credits`, then from `tools/algrow-voice/`:
`python algrow_voice.py --voice "NAME|ID" batch V/vo_lines.csv -o V/narration/raw --workers 3`
One WAV + word SRT per VO paragraph (`vo_001` ...). Verify every take (memory *Verify every narration take*).

## 3. Cut the gaps
`python -I tools/case-build/vo_gapcut.py V/narration/raw -o V/narration/cut`
Pauses over 0.40 s -> 0.40 s, head 0.10 s, tail 0.20 s, threshold -45 dBFS (all flags). Writes 48 kHz WAV, the shifted
`.srt` / `.words.json`, and `.cut.json` (before/after, first word time). Own-voice mp3s go through it too: the output is
WAV (memory *Conform narration mp3 to WAV*).

## 4. Download the sources (sequential only)
```
python -I tools/case-build/fetch_sources.py V/job.json -o V/sources --dry-run   # always first
python -I tools/case-build/fetch_sources.py V/job.json -o V/sources              # whole videos, 45 s apart
```
Updates yt-dlp first, H.264/AAC first, transcodes anything else, refuses <720p, skips TikTok (geo-blocked; VPN then
`--allow-tiktok`). Exit 3 = bot check: wait ~5 min, rerun (present files are skipped). `--sections [--cues cue_07]`
fetches cue ranges only (HLS route). Writes `V/sources/fetch.json`. Then ffprobe-check, transcribe every source and
scan it whole for burned-in cards (memories *yt-dlp*, *Source carries burned-in cards*, *Pillarbox breaks measurement*).

## 5. Lay out the timeline (free)
`python -I tools/case-build/layout.py V/job.json --vo-dir V/narration/cut --src-dir V/sources -o V/timeline.json [--cases 1-2]`
Card slots 4.5 s, series title 4 s, first word 0.45 s after a card, raw picture on the VO end with 1 s sound pre-roll,
next VO 0.65 s after a cue (all flags). VO spans are the B-roll holes. Cue in/out are SHEET times: scrub them first.

## 6. Premiere (all calls via `node tools/pp-call/pp-multi.mjs '[...]'` from PROJECT; mutations never in parallel)
The Code tab's `premiere-pro` MCP may be the dead server (memory *Desktop config clobbered -> pp-call*).
1. `ping` / `get_project_info` - the right project is open.
2. `create_bin {name}` then `import_media {file_paths:[V\narration\cut, V\sources], target_bin}`.
3. `get_bin_contents {bin_id, recursive:true}` -> save the output to `V/ids.txt` (ids are matched by mediaPath;
   never compute ids, memory *Imported-folder ids*). Check `pixelAspectRatio` 1 on every item.
4. `create_sequence {name}` -> `set_active_sequence {sequence_id}` -> `set_sequence_frame_rate {frame_rate:29.97002997003}`
   -> `set_sequence_resolution {width:1920,height:1080}`; read ticksPerFrame back = 8475667200 (memory *create_sequence timebase*).
5. `python -I tools/case-build/layout.py ... --ids V/ids.txt --calls V/calls.json --sequence-id <id>` then
   `node tools/pp-call/pp-multi.mjs @V/calls.json --max 1500`. It pins the sequence, places all narration first
   (A2, `stop_on_error:false` - audio-only places always false-error), then each raw cue as set_item_in_out video +
   audio (pre-roll) + add_to_timeline on V1/A1, then reads both tracks back.
6. Read back: every narration clip present once; `startSeconds` match timeline.json; every A1 clip END = next V1 START
   (memories *Picture + leading audio*, *batch_ops place params*, *Place out = frame formula*, *Gap edges must be measured*).
7. Then per rules.md: raw-cue edges and level envelope (`raw-editor`), B-roll into the VO holes picture-only
   (`sequence-editor`, `aspect-fill`; memory *B-roll over narration is silent*), cards from graphics/templates into the
   card slots picture-only with an empty `audio_track_index` (templates.md; memory *Placing rendered graphics*),
   series title and captions in Premiere's own text, transitions, levels, then QC (`tools/case-qc/`, `eye.py`).

8. **Precision and sound pass** (`tools/case-build/precision/`, README there): `live.sh` -> `audit.py` -> `layout2.py` /
   `pick2.py` / `sliver.py` / `hold.py` until SHORT, GAP and OFFCUT are 0; then `music.py` and `sfx.py` (only when asked),
   a range render, `sfxchk2.py`, `eye.py watch --ask` on the render. Run on Winter Encounters, 2026-10-22.

Nothing here was run end to end on a real video yet (2026-10-20): steps 1, 3, 4 (`--dry-run`) and 5 were tested on the
source pipeline's fixtures; step 2 made one 6.26 s line; step 6 is documented, not executed.
