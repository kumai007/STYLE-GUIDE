"""print 100ms RMS dBFS for source windows: rms.py file a-b [a-b ...]"""
import subprocess, sys, numpy as np
f = sys.argv[1]
for rng in sys.argv[2:]:
    a, b = map(float, rng.split("-"))
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(a), "-to", str(b), "-i", f, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768
    n = 1600; k = len(x) // n
    db = 20 * np.log10(np.sqrt((x[:k * n].reshape(k, n) ** 2).mean(1)) + 1e-9)
    print(f"{rng}: " + " ".join(f"{d:.0f}" for d in db))
