# Algrow voice workflow

Standalone Algrow (Stealth) text-to-speech: text → mp3 + 48 kHz wav + word-level SRT. One Python file, with your key already in `.env`.

## Folder
| Path | What |
|---|---|
| `algrow_voice.py` | Client + CLI (credits, voices, say, file, batch) |
| `.env` | **Private.** Your ALGO_API_KEY, default voice, provider. Don't share or commit it. |
| `.env.example` | Blank copy for a new machine |
| `LEARNINGS.md` | API contract, pitfalls, rules, user decisions |
| `templates/` | `narration_template.txt`, `batch_template.csv`, `run_examples.ps1` |
| `examples/` | A real output (vo_026: mp3, wav, word SRT) |
| `tests/test_algrow_voice.py` | Offline tests (no network, no credits used) |

## Setup
```bash
pip install -r requirements.txt
```
You also need ffmpeg on PATH.

## Use
```bash
python algrow_voice.py credits
```
```bash
python algrow_voice.py voices
```
```bash
python algrow_voice.py say "The driver was never seen again." -o out/test_line
```
```bash
python algrow_voice.py --voice "Horror Channel Tokyo" file templates/narration_template.txt -o out/narration
```
```bash
python algrow_voice.py batch templates/batch_template.csv -o out/batch --workers 3
```
Each output gives `NAME.wav`, `NAME.mp3`, `NAME.srt` (word timings), `NAME.words.json` and `NAME.json` (cache info).
A rerun with the same text and voice is a free cache hit. Delete the files to force a new generation.

Pick the voice for each video with `--voice NAME|ID`. Without it, `.env` ALGO_TTS_VOICE is used.

## Test
```bash
python tests/test_algrow_voice.py
```
