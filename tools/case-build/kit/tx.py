"""Transcribe media files with faster-whisper on CUDA, word timestamps.
usage: python tx.py MODEL OUT_DIR file[@start-end] ...   (start/end seconds; offset kept in output times)
Writes OUT_DIR/<stem>[_start].json = [{"s","e","w"}...] and a .txt of segments with times."""
import json, os, subprocess, sys, tempfile
from pathlib import Path

for p in os.environ.get("PATH", "").split(os.pathsep):
    if "nvidia" in p.lower() and os.path.isdir(p):
        os.add_dll_directory(p)
from faster_whisper import WhisperModel

model_name, out_dir, items = sys.argv[1], Path(sys.argv[2]), sys.argv[3:]
out_dir.mkdir(parents=True, exist_ok=True)
m = WhisperModel(model_name, device="cuda", compute_type="float16")
tmp = Path(tempfile.mkdtemp())
for it in items:
    path, rng = (it.split("@") + [None])[:2]
    src = Path(path)
    off = 0.0
    wav = tmp / (src.stem + ".wav")
    cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-y"]
    if rng:
        a, b = map(float, rng.split("-"))
        off = a
        cmd += ["-ss", str(a), "-to", str(b)]
    cmd += ["-i", str(src), "-ac", "1", "-ar", "16000", str(wav)]
    subprocess.run(cmd, check=True)
    segs, _ = m.transcribe(str(wav), language="en", word_timestamps=True, vad_filter=bool(os.environ.get("VAD")), vad_parameters={"min_silence_duration_ms": 300} if os.environ.get("VAD") else None, beam_size=5)
    words, lines = [], []
    for s in segs:
        lines.append(f"[{s.start + off:8.2f}-{s.end + off:8.2f}] {s.text.strip()}")
        for w in s.words or []:
            words.append({"s": round(w.start + off, 3), "e": round(min(w.end, w.start + 3) + off, 3), "w": w.word.strip()})
    tag = src.stem + (f"_{int(off)}" if rng else "")
    (out_dir / f"{tag}.json").write_text(json.dumps(words), encoding="utf-8")
    (out_dir / f"{tag}.txt").write_text("\n".join(lines), encoding="utf-8")
    print(f"{tag}: {len(words)} words", flush=True)
