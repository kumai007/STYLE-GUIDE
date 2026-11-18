# Cut checker (owner v3 #8: "1-frame glitches and sudden zoom-ins that feel carelessly cut"). Read-only, runs on a finished render.
#   python tools/cutcheck.py <video.mp4> [--allow a-b,a-b ...]   (allow = designed glitch windows in seconds)
# Decodes 160x90 grey frames and flags:
#   FLASH  a single frame whose mean luma jumps away from BOTH neighbours (>= 22/255) while the neighbours agree (<= 8)
#   ODD    a single frame that differs strongly from both neighbours while the neighbours match each other (stray frame at a cut)
#   STUB   a shot shorter than 3 frames (two hard cuts within 2 frames) outside the allowed designed windows
#   JUMP   a sudden zoom/position jump: a large inter-frame change inside a shot that is not a cut (half-frame diff >> both neighbours)
# Exit 1 when anything is flagged outside the allowed windows.
import subprocess, sys, numpy as np
src = sys.argv[1]
allow = []
if "--allow" in sys.argv:
    for w in sys.argv[sys.argv.index("--allow") + 1].split(","):
        a, b = w.split("-"); allow.append((float(a), float(b)))
W, H = 160, 90
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
n = len(fr); L = fr.mean((1, 2)); D = np.r_[0, np.abs(np.diff(fr, axis=0)).mean((1, 2))]   # D[i] = change from i-1 to i
ok = lambda i: any(a - 0.1 <= i / 30 <= b + 0.1 for a, b in allow)
flags = []
for i in range(1, n - 1):
    if ok(i): continue
    l0, l1, l2 = L[i - 1], L[i], L[i + 1]
    if abs(l1 - l0) >= 22 and abs(l1 - l2) >= 22 and np.sign(l1 - l0) == np.sign(l1 - l2) and abs(l0 - l2) <= 8: flags.append((i, "FLASH", l1 - l0))
    d02 = np.abs(fr[i + 1] - fr[i - 1]).mean()
    if D[i] > 28 and D[i + 1] > 28 and d02 < 0.35 * min(D[i], D[i + 1]): flags.append((i, "ODD", D[i]))
cuts = [i for i in range(1, n) if D[i] > 30]
for a, b in zip(cuts, cuts[1:]):
    if b - a < 3 and not ok(a): flags.append((a, "STUB", b - a))
for i in range(2, n - 2):
    if ok(i) or D[i] > 30: continue
    if D[i] > 12 and D[i] > 4 * max(D[i - 1], D[i + 1], 1.5): flags.append((i, "JUMP", D[i]))
print(f"{src}: {n} frames, {len(cuts)} cuts, {len(flags)} flags")
for i, k, v in flags: print(f"  {k:5s} f{i} ({i / 30:.2f} s) {v:.1f}")
sys.exit(1 if flags else 0)
