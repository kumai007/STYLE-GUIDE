# Automated video pipeline: topic → MP4 (Mac port of the Windows "brain")

Source material: brain export (`BRAIN_EXPORT_2026-11-10.zip`). The Windows paths below (`D:/...`) are where the originals lived; the brain copy has the same relative layout.

The port is built on the **LG100 "Farrell" case kit** (`EncountersEditor_v5.7/GX channels/MASTER_TEMPLATES/src/lg100`). It is the only template in the brain where one **JSON spec per case** turns into a finished, animated segment with **no hand-written TSX**: `casegen.tsx` reads the spec and builds the shots. The iceberg kit (`404_Rendrer/ICEBERG_KIT`) looks better, but every case there is hand-coded TSX (`cc1/cases/c06.ts`) plus Blender shots, so it can't be automated as it stands.

---

## 0. Layout on this Mac

```
video/
  PIPELINE.md                 this file
  test_render.mp4             toolchain proof (13.8 s, 1080p30 h264 + AAC, music gate FAIL 0)
  remotion/                   Remotion 4.0.532 project (npm install done)
    package.json, tsconfig.json, remotion.config.ts
    src/index.ts, src/Root.tsx    NEW generic root: one composition "Case", props = the case spec
    src/lg100/kit.tsx mg.tsx mg2.tsx casegen.tsx world.json   copied 1:1 from MASTER_TEMPLATES/src/lg100
    src/lg100/cases/c003.example.json                         real LG100 spec (default props)
    public/fonts/             VCR_OSD_MONO, Montserrat, Inter, Archivo, JetBrains Mono (+ OFL licenses), from the zip
    public/lg100/foot/        footage (test_a/test_b.mp4 = ffmpeg testsrc placeholders)
    public/lg100/test/        images (photo.jpg placeholder)
  tools/
    vo_kokoro.py              VO: text → 48 kHz mono WAV (local Kokoro; stands in for Algrow)
    words.py                  word timings: WAV → [[word,start,end]] (mlx-whisper; port of tx.py)
    mix_case.py               per-case mix: VO + bed + synth accents from the spec (port of mix_seg.py)
    music_gate.py             copied 1:1 from 404_Rendrer/_shared_tools (music never louder than the VO)
    render_case.sh            spec + VO (+ music) → finished case MP4 (render → mix → gate --fix → mux)
  work/                       scratch (test spec, VO, words, temp renders)
```

---

## 1. How the Windows pipeline works, stage by stage (LG100 = the reference run)

| # | Stage | Windows implementation | Files |
|---|---|---|---|
| 1 | Topic → outline | Done by hand or by Claude: an outline docx plus a VO-only script. There is no tool for this. | `ICEBERG_PLAYBOOK.md` §1 |
| 2 | Script | One `script.txt`. Each case starts with a header line `CASE NN — TITLE`, and the narration body follows. | `LostGames100/script/script.txt` |
| 3 | **VO** | **Algrow MCP connector**: `generate_tts`, `provider="stealth"`, voice **Obscure Collab** (`default-pd4i7bs8z6-qjsqmqbjlxg__obscure_collab`), stealth_model 2.0, temperature 2.0, speaking_rate 1.05. It needs no API key, only the authorised Algrow connector (credits: 2.0 costs 2x). It returns MP3 plus a word-level SRT. LG100 was voiced as 2 long MP3s (`vo_raw/Case 1 to 65.mp3`, `Case 66 to 100.mp3`). **ElevenLabs is not used** (Remotion's `@remotion/elevenlabs` package exists, but nothing calls it). | `claude_memory/reference_algrow_tts.md` |
| 4 | Word timings | `tools/tx.py`: faster-whisper small.en int8 on CPU, giving `[[word,start,end]]`. Silences come from ffmpeg `silencedetect` (giving `p1.sil.txt`). | `LostGames100/tools/tx.py`, `vo/p1.words.json` |
| 5 | Split per case | `find_titles.py` finds each spoken "Case N, Title" (`vo/titles.json`). `cut_titles.py` cuts those titles out inside real silences (−55/−48/−42 dB runs) with 20 ms crossfades, giving `vo/LG100_full_vo.wav`, `full_map.json` and `case_bounds.json` ({case: [m0, m1]} seconds in the full VO). `verify_joins.py` re-transcribes ±3.5 s around every join. A brief per case is `cases/cNNN_brief.json` = {n, title, script, m0, m1, vo_dur, local_vo_start: 3.615, comp_dur, words (case-relative)}. | `LostGames100/tools/*`, `cases/c002_brief.json` |
| 6 | Footage | yt-dlp, one at a time behind a global lock, a 20 s gap after each download, `--cookies cookies.txt --js-runtimes node -f "bv*[height<=1080]+ba/b" --download-sections *HH:MM:SS-HH:MM:SS --write-info-json`. Search: `yt-dlp --flat-playlist --print "%(id)s | %(duration_string)s | %(channel)s | %(title)s" "ytsearch6:QUERY"`. `foot.sh` transcodes to 1080p30, no audio, `-crf 15 -g 15`, into `public/lg100/foot/cNNN_name.mp4`. Pages: `cap.py` (headless Chrome CDP, Wayback fallback). Red-highlight boxes: `phrase_box.py` (RapidOCR). Cutouts: `cutout.py`. Contact sheets: `sheet.sh`. Agency clips (ViralHog/Jukin/Storyful/Newsflare…) are rejected via `.info.json`. | `LostGames100/tools/dlq.sh foot.sh cap.py phrase_box.py`, `claude_memory/reference_ytdlp_download.md`, `cases/AGENT_BRIEF.md` |
| 7 | **Case spec** | A Claude agent per batch of cases reads the brief, researches, downloads and writes `src/lg100/cases/cNNN.json` (schema in §3). `gen_index.py` validates that assets exist and writes `cases/index.ts`. Preview stills: `stills_lg.mjs`. | `cases/AGENT_BRIEF.md` (the full spec doc), `MASTER_TEMPLATES/src/lg100/cases/c003.json` |
| 8 | Remotion | `src/lg100/main.tsx` registers one composition per spec, `lgCNNN`, with duration `(3.615 + vo_dur + 1.985) × 30`. `casegen.tsx` maps the spec to shots: case card 0–3.45 s, shot *i* covering `[3.615+t0, 3.615+t1_next]`, the last shot running to the end plus the tail, and soft dissolves (`x` frames) via `kit.tsx` `Timeline`. The grade is an SVG feComponentTransfer curve plus vignette and grain (`Look`), with no LUT. | `casegen.tsx`, `kit.tsx`, `mg.tsx`, `mg2.tsx`, `main.tsx` |
| 9 | Render | `tools/rq.sh N…`: `npx remotion render src/lg100/main.tsx lgCNNN out.mp4 --public-dir=<hard-linked bundle> --codec=h264 --crf=14 --gl=angle --concurrency=3 --timeout=240000 --muted`. | `LostGames100/tools/rq.sh`, `sync_pub.py` |
| 10 | Mix | `mix_seg.py N` writes one WAV per case: VO at +8.6 dB placed at 3.615 s; a bed rotating over Music 8/9/10 at −16.5 dB, ducked 4.5 dB under speech; synthesized boom/blip accents on spec events (card, `big`, `map`, `status`, yearline marks, red lineage nodes). | `LostGames100/tools/mix_seg.py` |
| 11 | Assemble | `assemble.py` concats the segments by stream copy, pads/trims each audio to its video's frame count, applies `loudnorm I=-16 TP=-1.5`, runs **`music_gate.py --fix`** (mandatory: "music never louder than the VO"), then muxes (h264_amf cqp 16/18 on the AMD GPU, AAC 320k). | `LostGames100/tools/assemble.py`, `_shared_tools/music_gate.py` |
| 12 | QA | `Video-QA-System`: `MISTAKES.md` (the rules), `VARIETY_LEDGER.json`, a frame-reviewer agent, and tools `qc_grade` / `qc_smooth` / `qc_audio`, plus `_shared_tools/microcut.py` (detects 1-frame flashes). The owner's newest rule is "no exhaustive QA": one still sheet per case, and a VO sync check at about 10 points. | `Video-QA-System/README.md`, `ICEBERG_KIT/ICEBERG_MASTER_GUIDE.md` §4–5 |

### Generic vs. hardcoded
- **Generic and reused as is:** `casegen.tsx` (spec → shots), `kit.tsx` (Foot/Photo/Page/Obj/Lbl/Big/Ring/Panel/Look/Timeline), `mg.tsx` CaseCard/StatusBoard/Reel, `mg2.tsx` Lineage/MapFocus/Years/YearLine (`world.json` = Natural Earth), `music_gate.py`, the mix logic, `tx.py`, `foot.sh`, `sheet.sh`, `phrase_box.py`, `cutout.py`.
- **Hardcoded to LG100 or Windows:**
  - every `D:/` and `C:/Users/avent` path;
  - `L()` resolves to `public/lg100/` (kept: treat `lg100` as the "assets root" name);
  - `main.tsx` + `shots.tsx` + `clips.ts` + `titles.ts` (hand-built intro, case 1 and case 2, LG100 footage);
  - `cut_titles.py` OVR table (per-case manual fixes);
  - `mix_seg.py` constants (`case_bounds`, case 100 end);
  - h264_amf and `--gl=angle` (AMD-specific);
  - Chrome path in `cap.py`;
  - the "Lost Registry" copy in the components ("WHAT'S STILL AROUND", status words FOUND/PARTIAL/LOST/MISSING/PLAYABLE, "CASE NN").
- **Maturity:**
  1. **Iceberg kit** (CCTV1/CCTV2/Disasters2): approved, 3 × 45-min videos shipped. It is the most polished but bespoke (per-case TSX + Blender), so it isn't automatable without big work.
  2. **LG100 Farrell kit**: v3, approved for intro + cases 1–3; 100 specs exist. It is the most automatable.
  3. **Encounters/Waterpark `MASTER_TEMPLATES/src/templates`** (TemplateLibrary families with props-driven variants): a good device library for later, but not a timeline engine.

---

## 2. Automated pipeline (target), stage by stage

All times are seconds. Video is 1920×1080 at 30 fps. Audio is 48 kHz.

| # | Stage | Input → output | Command on this Mac |
|---|---|---|---|
| 1 | Outline | topic → `outline.json` `{title, cases:[{n,title,angle,facts[]}]}` | LLM step (Claude) |
| 2 | Script | outline → `script.txt`, with header lines `CASE NN — TITLE` (headers are **not** voiced) and narration bodies | LLM step |
| 3 | VO, **per case** (avoids the whole title-cut stage) | `cases/cNNN.txt` → `vo/cNNN.wav` (48 kHz mono) | Algrow (Windows quality): `generate_tts` stealth "Obscure Collab" 2.0/2.0/1.05. Local fallback: `.venv/bin/python video/tools/vo_kokoro.py cNNN.txt vo/cNNN.wav am_michael 1.0` |
| 4 | Word timings | `vo/cNNN.wav` → `vo/cNNN.words.json` `[[word,start,end],…]`; `vo_dur` = last word end + 0.2 | `.venv/bin/python video/tools/words.py vo/cNNN.wav vo/cNNN.words.json` (or use Algrow's word SRT directly) |
| 5 | Brief | text + words → `cNNN_brief.json` `{n,title,script,vo_dur,words}` (same shape as LG100's) | small script (to write) |
| 6 | Footage | brief → `public/lg100/foot/cNNN_*.mp4`, `public/lg100/cNNN/*.png`, plus `sources/cNNN/sources.txt` | `yt-dlp` (needs `brew install yt-dlp` + cookies.txt + node, run serially) → `ffmpeg … -an -vf scale…,fps=30 -c:v libx264 -crf 15 -g 15` (the `foot.sh` recipe) |
| 7 | Spec | brief + assets → `specs/cNNN.json` (§3) | LLM agent following `LostGames100/cases/AGENT_BRIEF.md`; validate that every `src`/`bg`/`card.src` exists under `public/lg100` (port `gen_index.py`) |
| 8–10 | Render + mix + gate | spec + VO (+ music) → `out/cNNN.mp4` | `video/tools/render_case.sh specs/cNNN.json vo/cNNN.wav out/cNNN.mp4 [music.mp3]` |
| 11 | Assemble | `out/c*.mp4` → `final.mp4` | `ffmpeg -f concat -safe 0 -i list.txt -c copy` on video. For audio, concat the per-case pre-master WAVs, then `loudnorm I=-16:TP=-1.5`, then `music_gate.py full.wav full_vo.wav --fix fixed.wav`, then mux (port `assemble.py`; on the Mac use `-c:v h264_videotoolbox` or libx264 instead of h264_amf) |
| 12 | QA | `final.mp4` → contact sheets, a music_gate report, a sync check | `ffmpeg -ss T -frames:v 1` sheets; `music_gate.py`; port `microcut.py` |

Raw render command (what `render_case.sh` runs):
```
cd "/Users/ekam/thumbnail maker/video/remotion"
npx remotion render src/index.ts Case out.mp4 --props=/abs/path/cNNN.json --codec=h264 --crf=16 --muted --concurrency=6
npx remotion studio src/index.ts          # live preview (edit props in the sidebar)
```
Measured: the 13.8 s test case (414 frames) renders in about 11–14 s on this Mac.

---

## 3. Case-spec JSON schema (props of composition `Case`)

Authoritative docs: `brain/404_Rendrer/LostGames100/cases/AGENT_BRIEF.md` ("Spec schema"). The renderer is `video/remotion/src/lg100/casegen.tsx` (`Spec`/`Shot`/`Over` types). Real example: `video/remotion/src/lg100/cases/c003.example.json`. Test example: `video/work/test_case.json`.

```jsonc
{
  "n": 3,                                   // case number → "CASE 03" panel
  "title": "GEIST FORCE",                   // caps, VCR title panel
  "meta": "Dreamcast  ·  Sega of America  ·  1999",
  "vo_dur": 88.42,                          // case VO length (s)
  "card": { "src": "foot/geist.mp4", "from": 82 },   // or {"src":"cNNN/x.jpg","img":true}; "o":[x%,y%]
  "nocard": false, "tail": 1.985,           // optional
  "shots": [                                // contiguous: t0[0]=0, t0[i]=t1[i-1], last t1=vo_dur; all times = case-VO seconds
    { "t0": 0.0, "t1": 6.9, "k": "foot", "src": "foot/geist.mp4", "from": 24.5, "z": [1.02, 1.1] },
    { "t0": 6.9, "t1": 17.2, "k": "lineage", "zoom": [[0,1.06],[10,1.0]],
      "nodes": [{"id":"soa","x":560,"y":330,"t":"Sega of America","at":7.6},
                {"id":"gf","x":960,"y":720,"t":"Geist Force","sub":"target: December 1999","at":8.4,"red":true}],
      "edges": [{"a":"soa","b":"gf","at":8.2,"red":true}] },
    { "t0": 30.6, "t1": 43.0, "k": "yearline", "marks": [{"at":32.8,"y":"1998","t":"Edge"},{"at":40.9,"y":"SEP 1999","t":"Dreamcast US launch","red":true}] },
    { "t0": 52.2, "t1": 58.3, "k": "foot", "src": "foot/geist.mp4", "from": 248.0, "z": [1.05,1.1], "bright": 0.45,
      "big": { "text": "GEIST", "at": 54.0, "size": 230 } }
  ],
  "status": [["April 1999 prototypes", "PLAYABLE"], ["The finished game", "LOST"]],   // FOUND|PARTIAL|LOST|MISSING|PLAYABLE
  "status_at": 84.5
}
```
Shot kinds `k`:
- `foot`: `src`, `from`, `z`, `o`, `bright`, `rate`.
- `photo`: `src`, `W`, `H`, `z`, `o`, `plate`, `ph`.
- `page`: `src`, `W`, `H`, `v0` [cx,cy,viewW], `v1`, `mark` {`b`,`at`,`dk`}, `dark`.
- `obj`: `src` (transparent PNG), `W`, `H`, `w`, `y`.
- `big`: `bg`, `from`, plus overlay `big`.
- `years`: `bg`, `steps` [[at,"1999"],…].
- `yearline`: `marks` [{at,y,t,red?}].
- `map`: `iso` [ISO3], `at`, `label`, `sub`, `pulse`.
- `lineage`: `nodes`, `edges`, `zoom`.
- `reel`: `clips` [[src,from]…].

Overlays on foot/photo/page/big/obj:
- `lbl` {text, sub?, at, out?, y?, size?}
- `ring` {x, y, r, at, label}
- `big` {text, at, sub?, red?, size?}
- `panel` {lines[], at}
- `dim`

Paths are relative to `public/lg100/`. Images must be ≤ 16,000 px on each side.

Style limits (owner rules, enforce in the spec linter):
- shots 2.5–7 s;
- ≤ 2 `lbl`, ≤ 1 `big`, ≤ 1 red mark per page;
- ≥ 2 motion-graphic shots;
- no source range reused within a case.

---

## 4. What's missing on the Mac

- **TTS:** Algrow is an MCP connector (no key in the brain). The house voice "Obscure Collab" exists only on Algrow; it's reachable here only if that connector is enabled in the session (`generate_tts` / `get_tts_job_status` are present among this session's deferred tools). Kokoro (local, free) works now but is not the channel voice. ElevenLabs is not used.
- **Music:** "Music 8/9/10" (`D:/404 Rendrer/Background Music/`) are **not** in the brain (all mp3/wav were excluded), so there is no bed library on the Mac. `render_case.sh` works without music (accents only).
- **Real SFX:** `ICEBERG_KIT/shared_public/sfx*`, `sfx_n2_kit` audio was excluded. LG100 uses synthesized booms/blips, so nothing is blocked.
- **Footage:** none (by design). It needs `yt-dlp` (`brew install yt-dlp`), a `cookies.txt` exported by the owner, and node as the JS runtime. Downloads must stay serial.
- **Tools still to port:**
  - `cap.py` (Chrome path, `websocket-client`);
  - `phrase_box.py` (`rapidocr_onnxruntime`);
  - `cutout.py`;
  - `gen_index.py` → a spec linter;
  - `assemble.py` (replace h264_amf);
  - `microcut.py`;
  - a brief builder (stage 5).
- **LUT:** LG100 uses an in-code SVG grade, so no LUT is needed. The iceberg grade (`ICEBERG_KIT/projects/Disasters2/grade/channel.cube`) can be pulled from the zip if that look is wanted.

## 5. Risks

1. **Spec authoring is the hard part.** Research, finding clean, licence-safe footage, and timing shots to word anchors were done by Claude agents with heavy owner feedback. Full automation will produce weaker picks without contact-sheet review.
2. **yt-dlp:** bot flags if downloads run in parallel; agency-licensed clips (check `.info.json`); cookies needed; competitor footage is banned.
3. **Voice mismatch:** Kokoro ≠ Obscure Collab. Swapping TTS changes pacing, so shots must always be timed from word timings, never from estimates.
4. **Style drift:** the owner rejected LG100 v1/v2. The text kit is tuned to "Farrell minimal" with LG100-specific copy (status board). A different niche needs new copy and a new CaseCard.
5. **Remotion licence:** Remotion is free only for individuals and companies with ≤ 3 people; above that a company licence is needed.
6. **Performance/limits:** images over 16k px fail to decode. Long cases with many `OffthreadVideo` sources need `--timeout=240000`. Keep `-g 15` short-GOP footage for fast seeking.
7. **mlx-whisper** occasionally merges or splits numbers ("1999," vs "nineteen ninety-nine"). Match words to the script before anchoring `at` times.
