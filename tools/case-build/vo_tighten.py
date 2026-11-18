"""Tighten narration pauses the way Phantom does (measured on Lucas vo_002, 2026-10-25: 13 cuts reproduced).
usage: python -I vo_tighten.py IN.wav OUT.wav [--json CUTS.json] [--use CUTS.json]
  (OUT may be omitted with --json for a dry run; --use bakes exactly the cuts in that file, e.g. after dropping one
  that would cut raw audio sharing the timeline)
Rule (fitted: 9 of 13 cut points exact, the rest 1 frame): a pause is a run below -40 dBFS (10 ms RMS) lasting >= 0.15 s.
Keep 0.05 s of air after the speech and 0.08 s before the next, and remove the middle in whole frames of 29.97 fps (relative to the file start), so the timeline stays on the frame grid.
Head and tail silence are left alone. Joins get 4 ms fades (cuts sit in silence, this only kills DC clicks).
Writes the removed source ranges [[a, b], ...] (seconds) to --json so the picture can be retimed to match."""
import json, subprocess, sys
import numpy as np

TH, MIN_RUN, PAD_A, PAD_B, FR, HOP = -40.0, 0.15, 0.05, 0.08, 1001 / 30000, 0.01
a = sys.argv[1:]; opt = lambda k: a[a.index(k) + 1] if k in a else None; js, use = opt("--json"), opt("--use")
pos = [x for i, x in enumerate(a) if not x.startswith("--") and (i == 0 or not a[i - 1].startswith("--"))]
src = pos[0]; dst = pos[1] if len(pos) > 1 else None
info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=sample_rate,channels", "-of", "json", src],
                                 capture_output=True, text=True).stdout)["streams"][0]
sr, ch = int(info["sample_rate"]), int(info["channels"])
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-f", "f32le", "-"],   # ffmpeg's downmix:
                                capture_output=True).stdout, np.float32)                                 # the fit used it
hop = int(sr * HOP); n = len(x) // hop
db = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
q = db < TH; cuts = []; i = 0
while i < n:
    if not q[i]: i += 1; continue
    j = i
    while j < n and q[j]: j += 1
    s, e = i * HOP, j * HOP
    if e - s >= MIN_RUN and i > 0 and j < n:                      # interior pauses only
        fa = int(np.ceil((s + PAD_A) / FR)); fb = int(np.floor((e - PAD_B) / FR))
        if fb > fa: cuts.append([round(fa * FR, 6), round(fb * FR, 6)])
    i = j
dur = len(x) / sr  # mono samples
if use: cuts = json.load(open(use))["cuts"]
print(f"{src}: {len(cuts)} cuts, removed {sum(b - a for a, b in cuts):.3f} s of {dur:.3f}")
if js: json.dump({"src": src, "dur": dur, "cuts": cuts}, open(js, "w"), indent=0)
if dst:
    keep, t = [], 0.0
    for c0, c1 in cuts: keep.append((t, c0)); t = c1
    keep.append((t, dur)); f = 0.004
    parts = [f"[0:a]atrim={k0:.6f}:{k1:.6f},asetpts=PTS-STARTPTS,afade=t=in:d={f},afade=t=out:st={k1 - k0 - f:.6f}:d={f}[k{i}]"
             for i, (k0, k1) in enumerate(keep)]
    fc = ";".join(parts) + ";" + "".join(f"[k{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[o]"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src, "-filter_complex", fc, "-map", "[o]",
                        "-c:a", "pcm_s24le" if "s24" in subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=sample_fmt,bits_per_raw_sample,codec_name", "-of", "csv=p=0", src], capture_output=True, text=True).stdout else "pcm_s16le",
                        "-ar", str(sr), dst])
    sys.exit(r.returncode)
