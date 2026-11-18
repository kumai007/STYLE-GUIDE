"""Shorten long silences in narration audio and shift its word timings to match.

Every silence longer than --max-gap is cut down to --max-gap (half kept on each side, so the cut sits in the middle of
the pause, never on a word edge). Leading silence is trimmed to --head and trailing silence to --tail. Output is a
48 kHz pcm16 WAV (stereo kept; mono becomes dual-mono at -3 dB per side, same LUFS,
because a mono WAV plays LEFT ONLY on Premiere's stereo tracks and relinking never fixes the item's mapping). A sibling .srt and/or .words.json (algrow-voice output) is remapped onto the new
timeline, and a .cut.json records the before/after durations, the kept segments and the first/last word times.

Usage:
    python vo_gapcut.py IN.wav -o OUT_STEM                    # one file -> OUT_STEM.wav/.srt/.words.json/.cut.json
    python vo_gapcut.py DIR_OR_FILES... -o OUT_DIR            # many -> OUT_DIR/<stem>.wav ...
    options: --max-gap 0.40 --head 0.10 --tail 0.20 --thresh -45 (dBFS) --srt X.srt --words X.words.json
Never overwrites its input. Needs ffmpeg on PATH (any input format is decoded through it) and numpy.
"""
from __future__ import annotations
import argparse, json, re, subprocess, sys, wave
from pathlib import Path

import numpy as np

SR, WIN = 48000, 0.010          # analysis window 10 ms
_SRT_T = re.compile(r"(\d+):(\d\d):(\d\d)[,.](\d{1,3})")


def decode(path: Path) -> np.ndarray:
    """Any audio -> float32 (n, ch) at 48 kHz via ffmpeg."""
    ch = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels",
                             "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True).stdout.strip() or 1)
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-i", str(path), "-vn", "-ac", str(ch), "-ar", str(SR),
                          "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return (np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.0).reshape(-1, ch)


def silent_runs(x: np.ndarray, thresh_db: float) -> list:
    """[(start_s, end_s)] of runs where every 10 ms window's RMS (loudest channel) is under thresh_db."""
    hop = int(SR * WIN); n = len(x) // hop
    if n == 0: return []
    frames = x[: n * hop].reshape(n, hop, x.shape[1])
    rms = np.sqrt(np.mean(frames ** 2, axis=1)).max(axis=1)
    quiet = 20 * np.log10(np.maximum(rms, 1e-9)) < thresh_db
    runs, i = [], 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            runs.append((i * WIN, min(j * WIN, len(x) / SR))); i = j
        else: i += 1
    if runs and runs[-1][1] >= (n * hop) / SR - 1e-9: runs[-1] = (runs[-1][0], len(x) / SR)   # tail remainder
    return runs


def keep_segments(total: float, runs: list, max_gap: float, head: float, tail: float) -> list:
    """Source spans to keep, in order."""
    cuts = []                                            # (a, b) spans to drop
    for a, b in runs:
        if a <= 1e-9 and b >= total - 1e-9: return [(0.0, min(total, head + tail))]   # all silence
        if a <= 1e-9:
            if b > head: cuts.append((0.0, b - head))
        elif b >= total - 1e-9:
            if b - a > tail: cuts.append((a + tail, total))
        elif b - a > max_gap:
            half = max_gap / 2
            cuts.append((a + half, b - half))
    keep, t = [], 0.0
    for a, b in cuts:
        if a > t: keep.append((t, a))
        t = b
    if t < total: keep.append((t, total))
    return keep


def make_map(keep: list):
    offs, o = [], 0.0
    for a, b in keep: offs.append(o); o += b - a
    def f(t: float) -> float:
        for (a, b), off in zip(keep, offs):
            if t < a: return off                     # inside a dropped span -> its join point
            if t <= b: return off + (t - a)
        return o
    return f, o


def fmt_srt(t: float) -> str:
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def remap_srt(text: str, f) -> str:
    def one(m):
        t = int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3)) + int(m.group(4).ljust(3, "0")) / 1000
        return fmt_srt(f(t))
    return _SRT_T.sub(one, text)


def write_wav(path: Path, y: np.ndarray) -> None:
    if y.shape[1] == 1: y = np.repeat(y * 0.70711, 2, axis=1)
    pcm = (np.clip(y, -1, 1 - 1 / 32768) * 32768).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(y.shape[1]); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


def process(src: Path, stem: Path, a, srt: Path | None = None, words: Path | None = None) -> dict:
    srt = srt or (src.with_suffix(".srt") if src.with_suffix(".srt").exists() else None)
    words = words or (src.with_name(src.stem + ".words.json") if src.with_name(src.stem + ".words.json").exists() else None)
    out_wav = stem.with_suffix(".wav")
    if out_wav.resolve() == src.resolve(): raise SystemExit(f"refusing to overwrite the input {src}")
    x = decode(src); total = len(x) / SR
    keep = keep_segments(total, silent_runs(x, a.thresh), a.max_gap, a.head, a.tail)
    y = np.concatenate([x[int(round(s * SR)): int(round(e * SR))] for s, e in keep]) if keep else x[:0]
    stem.parent.mkdir(parents=True, exist_ok=True)
    write_wav(out_wav, y)
    f, new_total = make_map(keep)
    rep = {"input": str(src), "output": str(out_wav), "before_s": round(total, 3), "after_s": round(len(y) / SR, 3),
           "removed_s": round(total - len(y) / SR, 3), "max_gap": a.max_gap, "head": a.head, "tail": a.tail,
           "thresh_db": a.thresh, "keep": [[round(s, 3), round(e, 3)] for s, e in keep]}
    if srt:
        stem.with_suffix(".srt").write_text(remap_srt(srt.read_text(encoding="utf-8-sig"), f), encoding="utf-8")
    if words:
        d = json.loads(words.read_text(encoding="utf-8"))
        ws = d["words"] if isinstance(d, dict) else d
        for w in ws:
            w["start"], w["end"] = round(f(w["start"]), 3), round(f(w["end"]), 3)
        stem.with_name(stem.name + ".words.json").write_text(json.dumps(d, indent=1, ensure_ascii=False), encoding="utf-8")
        if ws: rep["first_word_s"], rep["last_word_end_s"] = ws[0]["start"], ws[-1]["end"]
    stem.with_name(stem.name + ".cut.json").write_text(json.dumps(rep, indent=1), encoding="utf-8")
    return rep


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Shorten long narration silences; remap the word SRT.")
    ap.add_argument("inputs", nargs="+", help="audio files or directories (directories: every *.wav, not *.cut/*.gap)")
    ap.add_argument("-o", "--out", required=True, help="output stem (one input) or directory (several)")
    ap.add_argument("--max-gap", type=float, default=0.40, help="longest pause kept inside the narration, s (default 0.40)")
    ap.add_argument("--head", type=float, default=0.10, help="silence kept before the first word, s (default 0.10)")
    ap.add_argument("--tail", type=float, default=0.20, help="silence kept after the last word, s (default 0.20)")
    ap.add_argument("--thresh", type=float, default=-45.0, help="silence threshold, dBFS RMS (default -45)")
    ap.add_argument("--srt"); ap.add_argument("--words")
    a = ap.parse_args(argv)
    files = []
    for p in map(Path, a.inputs):
        files += sorted(p.glob("*.wav")) if p.is_dir() else [p]
    if not files: print("no input audio", file=sys.stderr); return 2
    many = len(files) > 1 or Path(a.out).is_dir()
    tb = ta = 0.0
    for src in files:
        stem = Path(a.out) / src.stem if many else Path(a.out)
        if stem.suffix.lower() == ".wav": stem = stem.with_suffix("")
        r = process(src, stem, a, Path(a.srt) if a.srt and not many else None, Path(a.words) if a.words and not many else None)
        tb += r["before_s"]; ta += r["after_s"]
        print(f"{src.name}: {r['before_s']:.2f}s -> {r['after_s']:.2f}s (-{r['removed_s']:.2f}s, {len(r['keep'])} segments)")
    if many: print(f"total {len(files)} files: {tb:.2f}s -> {ta:.2f}s (-{tb - ta:.2f}s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
