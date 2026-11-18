"""strip.py PROD FRAME_IN FRAME_OUT [COLS=6] [ROWS=4]  - one image tiling evenly spaced frames of a range, each
labelled with its frame number. Use it to look closer at a unit (camera move, treatment change, where a title starts).
Writes 01_reference/deconstruct/cache/strip_IN_OUT.jpg and prints the path. Reads the video only."""
import subprocess, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from common import PROD, workdir, load_cfg

prod, a, e = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6; rows = int(sys.argv[5]) if len(sys.argv) > 5 else 4
cfg = load_cfg(prod); FPS = cfg["fps"][0] / cfg["fps"][1]; n = cols * rows
step = max(1, (e - a) // max(1, n - 1)); frames = list(range(a, e + 1, step))[:n]
sel = "+".join(f"eq(n\\,{f - a})" for f in frames)
out = workdir(prod) / "cache" / f"strip_{a}_{e}.jpg"
# after select, drawtext's n counts the kept frames (0..), so each label is switched on for its own index
labels = ",".join(f"drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='{f}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black:enable='eq(n\\,{i})'" for i, f in enumerate(frames))
vf = f"select='{sel}',setpts=N/TB,scale=320:-2,{labels},tile={cols}x{rows}"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a / FPS:.4f}", "-i", str(PROD / cfg["src"]), "-an", "-vf", vf,
                "-frames:v", "1", str(out)], check=True)
print(out)
