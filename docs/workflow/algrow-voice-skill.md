---
name: algrow-voice
description: "Generate narration with Algrow (Stealth) TTS: script in, 48 kHz mono WAV + mp3 + word-level SRT out, ready for Premiere. Use to generate, voice, synthesise or re-record narration, a VO line or a voiceover from a script, to list or pick Algrow voices, or to check Algrow credits."
---

# Algrow voice (TTS)

Tool: `tools/algrow-voice/algrow_voice.py` (under `C:\Users\ayush\Videos\CLAUDE\PROJECT`).
API contract, pitfalls and decisions: `tools/algrow-voice/LEARNINGS.md` - grep it, don't read it whole.
Key lives in `.env` next to the script (`ALGO_API_KEY`, `ALGO_TTS_VOICE`, `ALGO_TTS_PROVIDER`). **Never print, cat, upload or commit `.env`.**

## Commands (run from `tools/algrow-voice/`)
```
python algrow_voice.py credits                       # free key check
python algrow_voice.py voices                        # name + voice_id list
python algrow_voice.py --voice "NAME|ID" say "line" -o <dir>/<stem>
python algrow_voice.py --voice "NAME|ID" file script.txt -o <dir>/<stem>   # '#' lines ignored
python algrow_voice.py --voice "NAME|ID" batch lines.csv -o <dir> --workers 3  # id,text[,voice]
```
Each output stem gives `.wav` (48 kHz mono pcm16), `.mp3`, `.srt` (word-level), `.words.json`, `.json` (cache info).
Same text + voice = free cache hit; delete the outputs to force a new take. Long scripts are chunked at sentence ends (<=3500 chars) and joined with continuous word times.

## Rules
1. **Ask which voice for every new video.** `.env` ALGO_TTS_VOICE is only a default; pass `--voice` explicitly. Ambiguous name -> use the voice_id.
2. **Write output into its final home before importing** (e.g. the video's `RL-EDIT/<video>/narration/`), never `out/` - Premiere stores absolute paths and moving later takes it offline.
3. **Place the `.wav`, never the `.mp3`** - Premiere reads mp3s ~0.9% long (memory: conform narration mp3 to WAV).
4. **Verify the take:** compare `.words.json` text against the script sent; a chunk with no SRT marks words missing -> transcribe that file with faster-whisper (PowerShell launch) instead.
5. The `.srt` word times replace the faster-whisper narration pass in raw-editor/sequence-editor, but the cut rule still holds: push edges out to real silence, never cut on the word boundary.
5a. After placing, the rest of the audio and any captions follow `audio-and-captions` (narration captions there are PROPOSED - ask first).
6. Errors: 401 bad key, 402 out of credits, 403 plan/provider not allowed - don't retry those; 429/5xx retry automatically.
7. Run `credits` before a big batch and report the characters it will cost (= script length).

Tests (offline, no credits): `python tests/test_algrow_voice.py`.
