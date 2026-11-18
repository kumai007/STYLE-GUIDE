# Generate the voice-over for one Iceberg video

You are given one video folder `V` (e.g. `C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/01_Natural_Disasters`) and a title prefix `P` (e.g. `W01`).
`V/vo/blocks.json` is a list of TTS jobs: `{"job": "CASE03", "items": [{"sec","n","text"}, ...]}`.

For EVERY job in blocks.json whose `V/vo/raw/<job>.mp3` does not exist yet:

1. Get the exact text: `python3 -I -c "import json,sys;J=json.load(open(sys.argv[1]));print('\n\n'.join(i['text'] for i in next(j for j in J if j['job']==sys.argv[2])['items']))" V/vo/blocks.json <job>`
   Paste it into the tool VERBATIM: no edits, no fixes, no summarising. Blocks are separated by one blank line.
2. Call `mcp__68166698-ced9-4d35-80ed-68acfe5a4cc8__generate_tts` (load it first with ToolSearch
   `select:mcp__68166698-ced9-4d35-80ed-68acfe5a4cc8__generate_tts,mcp__68166698-ced9-4d35-80ed-68acfe5a4cc8__get_tts_job_status`) with exactly:
   provider "stealth", voice_id "default-pd4i7bs8z6-qjsqmqbjlxg__obscure_collab", voice_name "Obscure Collab",
   stealth_model "2.0", temperature 2.0, speaking_rate 1.05, custom_title "<P>_<job>_s2", script = the text.
   You may submit several jobs in one message (up to ~5 at a time).
3. Poll `get_tts_job_status` with the job_id until it is completed (don't sleep with Bash; just call it again after other submissions).
   Download: `curl -sfL -o V/vo/raw/<job>.mp3 "<audio_url>"` and the same for `<transcript_url>` → `V/vo/raw/<job>.srt`.
4. Split: `cd V/vo && python3 -I ../../_tools/vo_split.py blocks.json <job> raw/<job>.mp3 raw/<job>.srt blocks`
   It prints one line per block. The number of lines must equal the number of items in that job.

If a job fails, retry it once. Do not regenerate jobs that already have raw/<job>.mp3.

When all jobs are done:
- `cd V/vo && python3 -I ../../_tools/vo_preview.py blocks.json blocks FULL_preview.mp3 $(python3 -I -c "import json;print(' '.join(j['job'] for j in json.load(open('blocks.json'))))")`
- Check: number of files in V/vo/blocks equals the total number of items in blocks.json.

Report in ≤ 6 lines: jobs done, block count vs expected, preview duration, any failures. Don't touch other video folders.
