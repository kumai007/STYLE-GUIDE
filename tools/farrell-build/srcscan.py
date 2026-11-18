# find source cuts (relative test, as segscan) in a source range, then list clean ss values for a shot
# python srcscan.py <edl> <shot id> [span s]
import sys, subprocess, numpy as np, importlib
from common import FPS, C1V, C2V
edl = importlib.import_module(sys.argv[1]); sid = sys.argv[2]; span = float(sys.argv[3]) if len(sys.argv) > 3 else 10
s = next(x for x in edl.SHOTS if x["id"] == sid)
src = {"C1": C1V, "C2": C2V}[s["src"]]; sp = s.get("slow") or 1.0
n = round((s["b"] - s["a"]) * FPS) + s["hh"] + s["th"]
L = n / FPS * sp; pre = s["hh"] / FPS * sp
t0 = max(0, s["ss"] - span); t1 = s["ss"] + span + L
raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{t1 - t0:.3f}", "-i", src, "-vf", "fps=30000/1001,scale=96:54,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.uint8).reshape(-1, 54, 96).astype(np.float32)
d = np.abs(np.diff(a, axis=0)).mean((1, 2)); cuts = []
for i in range(len(d)):
    nb = np.concatenate([d[max(0, i - 6):i], d[i + 1:i + 7]]); m = np.median(nb)
    if d[i] > max(5.0, 3.0 * m + 2.0): cuts.append(t0 + (i + 1) / FPS)
print(sid, "ss", s["ss"], "sp", sp, "n", n, "needs", round(L, 2), "s of source")
print("cuts:", " ".join(f"{c:.2f}" for c in cuts))
ok = []
for k in range(int(-span * 20), int(span * 20) + 1):
    ss = round(s["ss"] + k / 20, 2); w0 = ss - pre - 3 / FPS; w1 = ss - pre + L + 3 / FPS
    if w0 >= t0 and w1 <= t1 and not any(w0 <= c <= w1 for c in cuts): ok.append(ss)
# group into runs
runs = []; 
for v in ok:
    if runs and abs(v - runs[-1][1] - 0.05) < 1e-6: runs[-1][1] = v
    else: runs.append([v, v])
print("clean ss runs:", " ".join(f"{r[0]:.2f}-{r[1]:.2f}" for r in runs))
