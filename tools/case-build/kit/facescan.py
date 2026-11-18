"""Per-second face/no-face index of a video. usage: facescan.py VIDEO OUT.json [from] [to]
Prints no-face runs >= 2.5 s (B-roll windows)."""
import cv2, json, subprocess, sys
import numpy as np
v, out = sys.argv[1], sys.argv[2]
a = float(sys.argv[3]) if len(sys.argv) > 3 else 0; b = float(sys.argv[4]) if len(sys.argv) > 4 else None
W, H = 320, 180
cmd = ["ffmpeg", "-hide_banner", "-v", "error", "-ss", str(a)] + (["-to", str(b)] if b else []) + ["-copyts", "-i", v,
       "-vf", f"fps=2,scale={W}:{H},format=gray", "-f", "rawvideo", "-"]
p = subprocess.Popen(cmd, stdout=subprocess.PIPE)
d = cv2.data.haarcascades
fr = cv2.CascadeClassifier(d + "haarcascade_frontalface_default.xml"); pr = cv2.CascadeClassifier(d + "haarcascade_profileface.xml")
rows = []; i = 0
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H: break
    g = np.frombuffer(buf, np.uint8).reshape(H, W); t = a + i / 2; i += 1
    eq = cv2.equalizeHist(g); k = dict(scaleFactor=1.1, minNeighbors=5, minSize=(28, 28))
    f = len(fr.detectMultiScale(eq, **k)) + len(pr.detectMultiScale(eq, **k)) + len(pr.detectMultiScale(cv2.flip(eq, 1), **k))
    rows.append({"t": round(t, 1), "face": int(f > 0), "luma": round(float(g.mean()), 1)})
json.dump(rows, open(out, "w"))
# smooth: a no-face run tolerates single-sample face hits
runs = []; s = None; miss = 0
for j, r in enumerate(rows):
    if not r["face"]:
        if s is None: s = j
        miss = 0
    else:
        miss += 1
        if s is not None and miss > 1:
            e = j - miss
            if (rows[e]["t"] - rows[s]["t"]) >= 2.5: runs.append((rows[s]["t"], rows[e]["t"], round(np.mean([x["luma"] for x in rows[s:e+1]]), 0)))
            s = None
if s is not None: runs.append((rows[s]["t"], rows[-1]["t"], 0))
print(len(rows), "samples;", sum(r["face"] for r in rows), "with face")
print(" ".join(f"{x}-{y}(L{l:.0f})" for x, y, l in runs))
