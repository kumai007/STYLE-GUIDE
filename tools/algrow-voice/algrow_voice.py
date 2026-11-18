"""Algrow voice generation (async Stealth TTS at https://api.algrow.online) - standalone, one file.

Flow per chunk: POST /api/generate-simple (multipart: script, voice_id, provider, stealth_model, custom_title) -> job_id;
poll GET /api/job-status/{id} until completed|failed -> audio_url (mp3) + transcript_url (word-level SRT, free on
Stealth). Both URLs are on Algrow's CDN and are fetched WITHOUT the key. Long text is cut at sentence ends into chunks,
each chunk is synthesised, then all are joined into one 48 kHz mono wav (+ the merged mp3, SRT and words.json).

Usage (reads .env next to this file):
  python algrow_voice.py credits
  python algrow_voice.py voices [--provider stealth]
  python algrow_voice.py say "Text to speak" -o out/my_line [--voice NAME|ID]
  python algrow_voice.py file templates/narration_template.txt -o out/narration [--voice NAME|ID]
  python algrow_voice.py batch templates/batch_template.csv -o out [--workers 3]

Errors name the HTTP status only: the key and response bodies never reach a message or log.
Needs: Python 3.9+, `requests`, and ffmpeg on PATH (for wav conversion / joining chunks)."""
from __future__ import annotations
import argparse, csv, hashlib, json, os, re, subprocess, sys, threading, time, uuid, wave
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
ALGROW_BASE = "https://api.algrow.online"
_SENTENCE_END = re.compile(r"[.!?…][\"'”’)\]]*(?=\s)")
_SRT_TIME = re.compile(r"(\d+):(\d\d):(\d\d)[,.](\d{1,3})\s*-->\s*(\d+):(\d\d):(\d\d)[,.](\d{1,3})")
_HTTP_MEANING = {401: "invalid or inactive key (ALGO_API_KEY)", 402: "no credits left on the Algrow plan",
                 403: "the Algrow plan does not allow this provider/model", 404: "not found"}


class TTSError(RuntimeError):
    pass


# ---------------------------------------------------------------- helpers
def load_env(path: Path = HERE / ".env") -> dict:
    """KEY=VALUE lines from .env, overridden by the real environment. Never printed."""
    env = {}
    if path.is_file():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            m = re.match(r"\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", line)
            if m and not line.lstrip().startswith("#"):
                env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    env.update({k: v for k, v in os.environ.items() if k.startswith("ALGO_")})
    return env


def ffmpeg(args: list, label: str, cwd: Path | None = None) -> None:
    p = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *map(str, args)],
                       capture_output=True, text=True, encoding="utf-8", errors="replace", cwd=cwd)
    if p.returncode != 0:
        raise TTSError(f"{label} failed (exit {p.returncode}): {(p.stderr or p.stdout)[-800:]}")


def cache_key(obj) -> str:
    return hashlib.sha256(json.dumps(obj, sort_keys=True, separators=(",", ":")).encode("utf-8")).hexdigest()


def write_json(path: Path, value) -> None:
    tmp = path.with_name(f".{path.name}.{uuid.uuid4().hex}")
    tmp.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def chunk_text(text: str, limit: int) -> list:
    """Split into chunks of at most `limit` chars: at the last sentence end, else the last space, else a hard cut."""
    rest, out = " ".join(str(text).split()), []
    while len(rest) > limit:
        window = rest[:limit + 1]
        ends = [m.end() for m in _SENTENCE_END.finditer(window) if m.end() <= limit]
        cut = ends[-1] if ends else (window.rfind(" ") if window.rfind(" ") > 0 else limit)
        out.append(rest[:cut].strip()); rest = rest[cut:].strip()
    return out + ([rest] if rest else [])


def parse_srt(text: str) -> list:
    """Word-level SRT -> [{"w", "start", "end"}] (seconds)."""
    words = []
    for block in re.split(r"\r?\n\s*\r?\n", str(text).lstrip("﻿")):
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        for i, line in enumerate(lines):
            m = _SRT_TIME.search(line)
            if not m: continue
            g = [int(x) for x in m.groups()]
            t = lambda h, mi, s, ms, d: h * 3600 + mi * 60 + s + ms / 10 ** d
            w = " ".join(lines[i + 1:])
            if w:
                words.append({"w": w, "start": round(t(*g[0:4], len(m.group(4))), 3), "end": round(t(*g[4:8], len(m.group(8))), 3)})
            break
    return words


def words_to_srt(words: list) -> str:
    def ts(s):
        ms = int(round(s * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); sec, ms = divmod(ms, 1000)
        return f"{h:02d}:{m:02d}:{sec:02d},{ms:03d}"
    return "".join(f"{i}\n{ts(w['start'])} --> {ts(w['end'])}\n{w['w']}\n\n" for i, w in enumerate(words, 1))


# ---------------------------------------------------------------- client
class AlgrowVoice:
    def __init__(self, cfg: dict | None = None, env=None, session=None, sleep=time.sleep):
        cfg, env = cfg or {}, (load_env() if env is None else env)
        self._key = env.get("ALGO_API_KEY", "")
        self.base = str(cfg.get("base_url") or ALGROW_BASE).rstrip("/")      # NOT ALGO_API_BASE_URL (see LEARNINGS.md)
        self.provider = str(cfg.get("provider") or env.get("ALGO_TTS_PROVIDER") or "stealth")
        self.model = str(cfg.get("stealth_model") or env.get("ALGO_TTS_STEALTH_MODEL") or "1.5")
        self.voice_spec = str(cfg.get("voice") or env.get("ALGO_TTS_VOICE") or "").strip()
        # Stealth only: temperature = the UI's "Expressiveness" (0-2, API default 1.1), speaking_rate = "Speaking rate".
        self.temperature = cfg.get("temperature"); self.speaking_rate = cfg.get("speaking_rate")
        extra = "".join(f":{k}={v}" for k, v in (("t", self.temperature), ("r", self.speaking_rate)) if v is not None)
        self.name = f"algrow:{self.provider}:{self.model}:{self.voice_spec}{extra}"
        self.max_chars = int(cfg.get("max_chars") or 3500)
        self.retries = int(cfg.get("retries", 3))
        self.backoff = float(cfg.get("backoff") or 2.0)
        self.poll = float(cfg.get("poll_seconds") or 2.5)
        self.job_timeout = float(cfg.get("job_timeout") or 900)
        self._session, self._local, self._sleep = session, threading.local(), sleep
        self._voice_lock, self._voice_id = threading.Lock(), None

    def __repr__(self) -> str:  # never the key
        return f"AlgrowVoice({self.name})"

    def _sess(self):
        if self._session is not None: return self._session
        if not hasattr(self._local, "s"):          # requests.Session is not thread-safe: one per worker thread
            import requests
            self._local.s = requests.Session()
        return self._local.s

    def _call(self, method: str, url: str, label: str, auth: bool = True, **kw):
        """HTTP with retries on connection errors, 429 and 5xx (backoff, Retry-After). Other 4xx raise at once."""
        if auth and not self._key:
            raise TTSError("ALGO_API_KEY is not set (put it in .env next to algrow_voice.py)")
        headers = {"Authorization": f"Bearer {self._key}"} if auth else {}
        err = "no attempt"
        for attempt in range(self.retries + 1):
            delay = self.backoff * 2 ** attempt
            try:
                resp = getattr(self._sess(), method)(url, headers=headers, timeout=(15, 300), **kw)
            except OSError as e:                     # requests' Timeout/ConnectionError are OSError subclasses
                err = type(e).__name__
            else:
                code = int(resp.status_code)
                if 200 <= code < 300: return resp
                if code == 429 or code >= 500:
                    err = f"HTTP {code}"
                    ra = str((getattr(resp, "headers", None) or {}).get("Retry-After", ""))
                    if ra.isdigit(): delay = max(delay, min(float(ra), 60.0))
                else:
                    raise TTSError(f"Algrow {label}: HTTP {code} ({_HTTP_MEANING.get(code, 'not retried')})")
            if attempt < self.retries: self._sleep(delay)
        raise TTSError(f"Algrow {label}: gave up after {self.retries + 1} attempts ({err})")

    def _json(self, resp, label: str) -> dict:
        try: d = resp.json()
        except ValueError: d = None
        if not isinstance(d, dict): raise TTSError(f"Algrow {label}: reply is not a JSON object")
        return d

    def credits(self) -> dict:
        return self._json(self._call("get", f"{self.base}/api/credits", "credits"), "credits")

    def voices(self) -> list:
        label = f"voices/{self.provider}"
        return self._json(self._call("get", f"{self.base}/api/voices/{self.provider}", label), label).get("voices") or []

    def resolve_voice(self) -> str:
        """The voice_id for the configured voice (an id or a name, any case); fetched once per client.
        Checked up front because the API queues an unknown voice id and only fails the job later."""
        with self._voice_lock:
            if self._voice_id: return self._voice_id
            if not self.voice_spec:
                raise TTSError("no Algrow voice: pass --voice NAME|ID or set ALGO_TTS_VOICE in .env")
            voices = self.voices()
            ids = [v.get("voice_id") for v in voices if v.get("voice_id") == self.voice_spec]
            if not ids:
                ids = [v.get("voice_id") for v in voices if str(v.get("name", "")).casefold() == self.voice_spec.casefold()]
            if not ids:
                raise TTSError(f"Algrow voice {self.voice_spec!r} not found among {len(voices)} {self.provider} voices")
            if len(ids) > 1:
                raise TTSError(f"Algrow voice name {self.voice_spec!r} is ambiguous ({', '.join(map(str, ids))}): pass the voice_id")
            self._voice_id = str(ids[0])
            return self._voice_id

    def synth(self, text: str, label: str = "tts") -> tuple:
        """One chunk -> (mp3 bytes, SRT text or None)."""
        form = {"script": (None, text), "voice_id": (None, self.resolve_voice()), "provider": (None, self.provider),
                "stealth_model": (None, self.model), "custom_title": (None, label[:80])}
        if self.temperature is not None: form["temperature"] = (None, str(self.temperature))
        if self.speaking_rate is not None: form["speaking_rate"] = (None, str(self.speaking_rate))
        jid = str(self._json(self._call("post", f"{self.base}/api/generate-simple", label, files=form), label).get("job_id") or "")
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", jid): raise TTSError(f"Algrow {label}: no job_id in the reply")
        waited = 0.0
        while True:
            st = self._json(self._call("get", f"{self.base}/api/job-status/{jid}", label), label)
            status = str(st.get("status") or "")
            if status == "completed": break
            if status == "failed":
                why = str(st.get("error") or st.get("error_code") or "no reason given").replace(self._key or "\0", "***")[:200]
                raise TTSError(f"Algrow {label}: job failed: {why}")
            if waited >= self.job_timeout:
                raise TTSError(f"Algrow {label}: job timed out after {self.job_timeout:.0f} s (status {status or 'unknown'})")
            self._sleep(self.poll); waited += self.poll
        audio = str(st.get("audio_url") or "")
        if not audio.startswith(("https://", "http://")): raise TTSError(f"Algrow {label}: completed without an audio_url")
        mp3 = self._call("get", audio, label + " audio", auth=False).content   # CDN: never send the key there
        if not mp3: raise TTSError(f"Algrow {label}: empty audio file")
        srt, turl = None, str(st.get("transcript_url") or "")
        if turl.startswith(("https://", "http://")):
            try: srt = self._call("get", turl, label + " transcript", auth=False).content.decode("utf-8", "replace")
            except TTSError: srt = None                # timings are optional
        return mp3, srt

    def generate(self, text: str, out_stem: Path, label: str = "tts") -> dict:
        """Text of any length -> out_stem.wav (48 kHz mono), .mp3, .srt (word-level) and .words.json.
        Cached: the same text + voice + model is not paid for twice (delete the files to force a redo)."""
        out_stem = Path(out_stem); out_dir = out_stem.parent; out_dir.mkdir(parents=True, exist_ok=True)
        wav, meta = out_stem.with_suffix(".wav"), out_stem.with_suffix(".json")
        key = cache_key({"text": " ".join(str(text).split()), "voice": self.name})
        try:
            if wav.is_file() and json.loads(meta.read_text(encoding="utf-8")).get("key") == key:
                return {**json.loads(meta.read_text(encoding="utf-8")), "cached": True}
        except (OSError, ValueError):
            pass
        chunks = chunk_text(text, self.max_chars)
        if not chunks: raise TTSError(f"{label}: empty text")
        tag, temps, words, offset = uuid.uuid4().hex, [], [], 0.0
        tmp_wav = out_dir / f".{out_stem.name}.{tag}.wav"
        try:
            for i, c in enumerate(chunks, 1):
                mp3, srt = self.synth(c, f"{label} {i}/{len(chunks)}")
                p = out_dir / f".{out_stem.name}.{tag}.{i:03d}.mp3"; p.write_bytes(mp3); temps.append(p)
                w = out_dir / f".{out_stem.name}.{tag}.{i:03d}.wav"; temps.append(w)
                ffmpeg(["-i", p.name, "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", w.name], f"wav {label} {i}", cwd=out_dir)
                got = parse_srt(srt) if srt else []
                if words is not None and got:
                    words += [{"w": x["w"], "start": round(x["start"] + offset, 3), "end": round(x["end"] + offset, 3)} for x in got]
                else:
                    words = None                       # one chunk without timings: no reliable word list
                with wave.open(str(w), "rb") as f: offset += f.getnframes() / f.getframerate()
            wavs = [t for t in temps if t.suffix == ".wav"]
            ins = [x for t in wavs for x in ("-i", t.name)]
            fc = "".join(f"[{i}:a]" for i in range(len(wavs))) + f"concat=n={len(wavs)}:v=0:a=1[a]"
            ffmpeg([*ins, "-filter_complex", fc, "-map", "[a]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s16le", tmp_wav.name],
                   f"join {label}", cwd=out_dir)
            os.replace(tmp_wav, wav)
            ffmpeg(["-i", wav.name, "-c:a", "libmp3lame", "-q:a", "2", out_stem.with_suffix(".mp3").name], f"mp3 {label}", cwd=out_dir)
            if words:
                out_stem.with_suffix(".srt").write_text(words_to_srt(words), encoding="utf-8")
            write_json(out_stem.with_suffix(".words.json"), {"words": words})
            with wave.open(str(wav), "rb") as f: duration = f.getnframes() / f.getframerate()
            info = {"key": key, "voice": self.name, "chunks": len(chunks), "chars": len(" ".join(text.split())),
                    "duration": round(duration, 3), "wav": wav.name, "words": bool(words)}
            write_json(meta, info)
            return {**info, "cached": False}
        finally:
            for t in temps: t.unlink(missing_ok=True)
            tmp_wav.unlink(missing_ok=True)


# ---------------------------------------------------------------- CLI
def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Algrow voice generation (Stealth TTS)")
    ap.add_argument("--voice", help="voice name or voice_id (default: .env ALGO_TTS_VOICE)")
    ap.add_argument("--provider", help="default: .env ALGO_TTS_PROVIDER or stealth")
    ap.add_argument("--model", help="stealth_model (default 1.5)")
    ap.add_argument("--max-chars", type=int, default=3500, help="chunk size limit")
    ap.add_argument("--temperature", type=float, help="Stealth expressiveness (UI 'Expressiveness', 0-2; API default 1.1)")
    ap.add_argument("--speaking-rate", type=float, help="Stealth speaking rate multiplier (default 1.0)")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("credits", help="check the key and remaining credits (free)")
    sub.add_parser("voices", help="list voices for the provider")
    s = sub.add_parser("say", help="speak a text given on the command line"); s.add_argument("text"); s.add_argument("-o", "--out", required=True)
    f = sub.add_parser("file", help="speak a .txt file (lines starting with # are ignored)"); f.add_argument("path"); f.add_argument("-o", "--out", required=True)
    b = sub.add_parser("batch", help="CSV with columns id,text[,voice] -> one file set per row")
    b.add_argument("path"); b.add_argument("-o", "--out", required=True); b.add_argument("--workers", type=int, default=3)
    a = ap.parse_args(argv)
    cfg = {"voice": a.voice, "provider": a.provider, "stealth_model": a.model, "max_chars": a.max_chars,
           "temperature": a.temperature, "speaking_rate": a.speaking_rate}
    try:
        if a.cmd == "credits":
            print(json.dumps(AlgrowVoice(cfg).credits(), indent=2)); return 0
        if a.cmd == "voices":
            for v in AlgrowVoice(cfg).voices():
                print(f"{v.get('name', '')!s:40}  {v.get('voice_id', '')}")
            return 0
        if a.cmd in ("say", "file"):
            text = a.text if a.cmd == "say" else "\n".join(
                l for l in Path(a.path).read_text(encoding="utf-8-sig").splitlines() if not l.lstrip().startswith("#"))
            r = AlgrowVoice(cfg).generate(text, Path(a.out), Path(a.out).name)
            print(f"{'cached' if r['cached'] else 'made'}: {Path(a.out).with_suffix('.wav')}  {r['duration']} s  {r['chunks']} chunk(s)  words={r['words']}")
            return 0
        if a.cmd == "batch":
            rows = list(csv.DictReader(Path(a.path).open(encoding="utf-8-sig", newline="")))
            clients = {}
            def one(row):
                vid = (row.get("voice") or "").strip() or a.voice
                c = clients.setdefault(vid, AlgrowVoice({**cfg, "voice": vid}))
                rid = re.sub(r"[^A-Za-z0-9_.-]", "_", row["id"].strip())
                return rid, c.generate(row["text"], Path(a.out) / rid, rid)
            for row in rows:                 # resolve every voice once, up front, before paying for any job
                vid = (row.get("voice") or "").strip() or a.voice
                clients.setdefault(vid, AlgrowVoice({**cfg, "voice": vid})).resolve_voice()
            fails = 0
            with ThreadPoolExecutor(max_workers=max(1, a.workers)) as ex:
                for row, fut in [(r, ex.submit(one, r)) for r in rows]:
                    try:
                        rid, r = fut.result(); print(f"{'cached' if r['cached'] else 'made'}: {rid}  {r['duration']} s")
                    except Exception as e:  # report each row, keep going
                        fails += 1; print(f"FAILED {row.get('id')}: {e}", file=sys.stderr)
            print(f"{len(rows) - fails}/{len(rows)} done")
            return 1 if fails else 0
    except TTSError as e:
        print(f"error: {e}", file=sys.stderr); return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
