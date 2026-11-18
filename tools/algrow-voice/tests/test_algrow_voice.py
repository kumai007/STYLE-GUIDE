"""Offline tests for algrow_voice.py: a fake HTTP session plays the Algrow API. No network, no credits.
Run: python tests/test_algrow_voice.py   (needs ffmpeg on PATH)"""
import sys, tempfile
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from algrow_voice import ALGROW_BASE, AlgrowVoice, TTSError, chunk_text, parse_srt, words_to_srt

KEY = "fake-key-for-tests"
VID = "default-abc__horror_channel_tokyo"
ENV = {"ALGO_API_KEY": KEY, "ALGO_TTS_VOICE": "horror channel tokyo", "ALGO_TTS_PROVIDER": "stealth",
       "ALGO_API_BASE_URL": "https://api.openai.com/v1"}          # must be ignored
VOICES = {"voices": [{"name": "Horror Channel Tokyo", "voice_id": VID}, {"name": "Twin", "voice_id": "t1"},
                     {"name": "twin", "voice_id": "t2"}]}
SRT = "1\n00:00:00,250 --> 00:00:00,720\nThe\n\n2\n00:00:00,720 --> 00:00:00,980\nlake.\n\n"
MP3 = (ROOT / "examples" / "vo_026.mp3").read_bytes()


class Resp:
    def __init__(self, code, data=None, content=b"", headers=None):
        self.status_code, self._data, self.content, self.headers = code, data, content, headers or {}
    def json(self):
        if self._data is None: raise ValueError
        return self._data


class FakeSession:
    def __init__(self, status_seq=("processing", "completed"), fail_first=0, voices=VOICES):
        self.calls, self.status_seq, self.fail_first, self.voices, self.polls = [], list(status_seq), fail_first, voices, 0
    def _log(self, m, url, headers, kw):
        self.calls.append((m, url, dict(headers or {}), kw))
    def get(self, url, headers=None, timeout=None, **kw):
        self._log("get", url, headers, kw)
        if url.startswith("https://cdn."):
            assert "Authorization" not in (headers or {}), "key sent to CDN"
            return Resp(200, content=MP3 if url.endswith(".mp3") else SRT.encode())
        assert url.startswith(ALGROW_BASE) and headers["Authorization"] == f"Bearer {KEY}", url
        if self.fail_first: self.fail_first -= 1; return Resp(503, {}, headers={"Retry-After": "1"})
        if "/api/voices/" in url: return Resp(200, self.voices)
        if "/api/credits" in url: return Resp(200, {"credits": 123})
        if "/api/job-status/" in url:
            st = self.status_seq[min(self.polls, len(self.status_seq) - 1)]; self.polls += 1
            if st == "failed": return Resp(200, {"status": "failed", "error": f"Voice not found {KEY}"})
            return Resp(200, {"status": st, "audio_url": "https://cdn.x/a.mp3", "transcript_url": "https://cdn.x/a.srt"})
        return Resp(404, {})
    def post(self, url, headers=None, timeout=None, **kw):
        self._log("post", url, headers, kw)
        assert url == ALGROW_BASE + "/api/generate-simple"
        f = kw["files"]
        assert f["voice_id"] == (None, VID) and f["provider"] == (None, "stealth") and f["stealth_model"] == (None, "1.5")
        return Resp(200, {"job_id": "job_123"})


nosleep = lambda s: None

# 1. chunking + SRT
text = "The van stopped at the edge of the lake. Nobody saw the driver again! Was it the same night? Police never said."
for limit in (40, 60, 200):
    cs = chunk_text(text, limit)
    assert all(len(c) <= limit for c in cs) and " ".join(cs).split() == text.split(), cs
assert chunk_text(text, 60)[0] == "The van stopped at the edge of the lake."
assert chunk_text("  \n ", 50) == []
assert parse_srt(SRT) == [{"w": "The", "start": 0.25, "end": 0.72}, {"w": "lake.", "start": 0.72, "end": 0.98}]
assert parse_srt("﻿" + SRT.replace("\n", "\r\n")) == parse_srt(SRT)
assert parse_srt(words_to_srt(parse_srt(SRT))) == parse_srt(SRT)

# 2. voice resolution: name (any case) -> id; ambiguous / missing -> error; repr hides key
s = FakeSession(); v = AlgrowVoice({}, env=ENV, session=s, sleep=nosleep)
assert v.resolve_voice() == VID and KEY not in repr(v)
for bad in ("twin", "nobody"):
    try: AlgrowVoice({"voice": bad}, env=ENV, session=FakeSession(), sleep=nosleep).resolve_voice(); raise AssertionError(bad)
    except TTSError as e: assert KEY not in str(e)
assert v.credits() == {"credits": 123}

# 3. full generate: 3 chunks -> wav + mp3 + srt + words, word times offset by chunk 1 duration; cache hit on rerun
with tempfile.TemporaryDirectory() as d:
    s = FakeSession(status_seq=("processing", "completed"))
    v = AlgrowVoice({"max_chars": 60}, env=ENV, session=s, sleep=nosleep)
    out = Path(d) / "line"
    r = v.generate(text, out, "line")
    assert not r["cached"] and r["chunks"] == 3 and r["words"], r
    for ext in (".wav", ".mp3", ".srt", ".words.json", ".json"): assert out.with_suffix(ext).is_file(), ext
    import json; words = json.loads(out.with_suffix(".words.json").read_text())["words"]
    assert len(words) == 6 and words[2]["start"] > 5.0 and words[4]["start"] > 10.0, words          # chunk 2 shifted by ~5.38 s
    assert not any(p.name.startswith(".") for p in Path(d).iterdir()), "temp files left"
    posts = sum(1 for c in s.calls if c[0] == "post")
    assert v.generate(text, out, "line")["cached"] and sum(1 for c in s.calls if c[0] == "post") == posts
    assert all("openai" not in c[1] for c in s.calls)

# 4. failed job -> error with key masked; 5xx retried then succeeds; 401 not retried
try: AlgrowVoice({}, env=ENV, session=FakeSession(status_seq=("failed",)), sleep=nosleep).synth("hi"); raise AssertionError
except TTSError as e: assert "Voice not found" in str(e) and KEY not in str(e)
s = FakeSession(fail_first=2); assert AlgrowVoice({}, env=ENV, session=s, sleep=nosleep).resolve_voice() == VID
class Deny(FakeSession):
    def get(self, url, headers=None, timeout=None, **kw): self._log("get", url, headers, kw); return Resp(401, {})
s = Deny()
try: AlgrowVoice({}, env=ENV, session=s, sleep=nosleep).resolve_voice(); raise AssertionError
except TTSError as e: assert "401" in str(e) and len(s.calls) == 1
try: AlgrowVoice({}, env={}, session=FakeSession(), sleep=nosleep).credits(); raise AssertionError
except TTSError as e: assert "ALGO_API_KEY" in str(e)

print("test_algrow_voice: all passed")
