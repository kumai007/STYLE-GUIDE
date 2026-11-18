"""Detect a source's own hard cuts (PEAK_V5 zero-flash rule) so shot windows start >= 3 f after a cut and never cross one.
usage: python srccuts.py <video> [a b] [--crop crop=w:h:x:y]   -> prints cut times (source s) with strength
       python srccuts.py --graded <cc1g name>                   -> cuts in the graded clip's own seconds (from = clip s; x4 files /4)
"""
import subprocess, sys, json, os
import numpy as np

CUT = 12.0


def cuts(path, a=None, b=None, crop=None):
    vf = (crop + "," if crop else "") + "scale=96:54,format=gray"
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", str(a)] if a is not None else []) + (["-to", str(b)] if b is not None else []) + ["-i", path, "-vf", vf, "-f", "rawvideo", "-"]
    if a is not None:  # -ss before -i with -to after: -to is relative to the seek in ffmpeg>=5 only when copyts; use -t
        cmd = ["ffmpeg", "-v", "error", "-ss", str(a), "-i", path] + (["-t", str(b - a)] if b is not None else []) + ["-vf", vf, "-f", "rawvideo", "-"]
    fps = eval(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", path], capture_output=True, text=True).stdout.strip())
    raw = subprocess.run(cmd, capture_output=True).stdout
    d = np.frombuffer(raw, np.uint8).reshape(-1, 54, 96).astype(np.float32)
    df = np.abs(np.diff(d, axis=0)).mean((1, 2))
    out = []
    for i in range(1, len(df) - 1):
        if df[i] > CUT and df[i] > 2.2 * max(df[i - 1], df[i + 1], 1.0):
            out.append(((a or 0) + (i + 1) / fps, float(df[i])))
    return out, fps


if __name__ == "__main__":
    args = sys.argv[1:]
    if args[0] == "--graded":
        p = os.path.join(os.path.dirname(__file__), "..", "remotion", "public", "cc1g", args[1] + ".mp4")
        c, fps = cuts(p)
        x4 = "_x4" in args[1]
        for t, s in c:
            print(f"{t / (4 if x4 else 1):8.3f}  {s:6.1f}")
        sys.exit(0)
    crop = None
    if "--crop" in args:
        i = args.index("--crop"); crop = args[i + 1]; args = args[:i] + args[i + 2:]
    a = float(args[1]) if len(args) > 1 else None
    b = float(args[2]) if len(args) > 2 else None
    c, fps = cuts(args[0], a, b, crop)
    print(f"fps {fps:.3f}")
    for t, s in c:
        print(f"{t:8.3f}  {s:6.1f}")
