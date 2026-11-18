# Algrow voice API: what we learned

Taken from building and live-testing the voice stage of case_video_workflow (`cvw/voice.py`, tests/test_voice.py, Oct 2026).

## The real API contract
- Base URL: `https://api.algrow.online`. Auth: `Authorization: Bearer <ALGO_API_KEY>`.
- Docs: algrow.online/docs/api/text-to-speech (the docs site returned HTTP 500 at times; the shapes below come from real probe jobs).
- `GET /api/credits`: checks a key and shows credits. Free, so use it as the first test of any new key.
- `GET /api/voices/{provider}` (e.g. `stealth`) returns `{"voices": [{"name", "voice_id", "language", "is_cloned", ...}]}`.
- `POST /api/generate-simple` takes **multipart form** fields (not JSON): `script`, `voice_id`, `provider=stealth`, optional `stealth_model` (default `1.5`) and `custom_title`. It returns `{"job_id"}`.
- `GET /api/job-status/{job_id}`: poll every 2–3 s until `status` is `completed` or `failed`.
  - `completed` returns `audio_url` (an mp3 on a permanent CDN) and `transcript_url` (a **word-level SRT**, free on Stealth).
  - `failed` returns `error` / `error_code`.
- HTTP errors: 401 = bad or inactive key, 402 = out of credits, 403 = your plan doesn't allow that provider or model, 429 = busy (retry), 500 = server error (retry).

## Mistakes we hit and the rules they gave us
1. **It is NOT OpenAI-compatible.** Every early call returned 401 because `.env` `ALGO_API_BASE_URL` pointed at `api.openai.com` and the code POSTed to `/audio/speech`. Rule: the client uses its own constant `https://api.algrow.online` and never reads `ALGO_API_BASE_URL`. (In the main project, that variable is left as it is by user decision.)
2. **An unknown voice id is accepted and only fails later.** The job is queued and then fails with "Voice not found", after you've waited for it. Rule: resolve the voice through `/api/voices/{provider}` before submitting, by exact id first and then by name (any case). An ambiguous name is an error, so pass the id instead.
3. **Never send the key to the CDN.** Download `audio_url` and `transcript_url` without the Authorization header.
4. **Never log the key or response bodies.** Errors name only the HTTP status and what it means. A failed job's error text has the key masked.
5. **Long scripts:** cut them at sentence ends (≤ 3500 chars per chunk), synthesise each chunk, then join them into one 48 kHz mono wav. Shift each chunk's SRT word times by the running duration so the timings stay continuous. If any chunk has no SRT, mark the whole result's words as missing (the pod transcribes it with faster-whisper instead).
6. **Retries:** retry connection errors, 429 and 5xx with exponential backoff, and honour `Retry-After` (capped at 60 s). Any other 4xx fails straight away, because retrying a 401/402/403 only wastes time.
7. **Use one requests.Session per thread** when generating in parallel (a Session isn't thread-safe).
8. **Cache by (text, provider, model, voice)** so a rerun doesn't pay for the same line twice.
9. **The old key was invalid.** The user supplied a new one (Ultimate plan, about 3.93 M Stealth characters at the time).

## Measured
- vo_026 (110 characters) took **4.9 s** from submit to completed. It produced a 5.38 s mp3 and a 72-line word SRT (see `examples/`).

## User decisions
- Provider: **Stealth**. Current voice: **"Horror Channel Tokyo"** = `default-pd4i7bs8z6-qjsqmqbjlxg__horror_channel_tokyo`.
- **The voice is chosen per video.** Ask which voice to use for each new video and don't assume the last one. `.env` `ALGO_TTS_VOICE` is only the default; `--voice` overrides it.
- `.env` is private: never print it, upload it or commit it.
