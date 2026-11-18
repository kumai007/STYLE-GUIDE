# scan rendered shot segments (with handles, before blending) for source cuts; relative test catches soft cuts
import sys, subprocess, numpy as np, importlib, os
from common import FPS
edl = importlib.import_module(sys.argv[1]); SEG = sys.argv[2]; H = edl.H
for s in edl.SHOTS:
    p = f"{SEG}/{s['id']}.mp4"
    if s["kind"] == "card4" or not os.path.exists(p): continue
    raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-vf","scale=96:54,format=gray","-f","rawvideo","-"],capture_output=True).stdout
    a = np.frombuffer(raw,np.uint8).reshape(-1,54,96).astype(np.float32); n = len(a)
    d = np.abs(np.diff(a,axis=0)).mean((1,2))
    hits = []
    for i in range(len(d)):
        nb = np.concatenate([d[max(0,i-6):i], d[i+1:i+7]]); m = np.median(nb) if len(nb) else 0
        if d[i] > max(5.0, 3.0*m + 2.0):
            j = i + 1  # first frame of new shot
            bi = s["tin"] != "cut" and j < 2*H; bo = s["tout"] != "cut" and j >= n - 2*H
            hits.append(f"{'IN' if bi else 'OUT' if bo else 'body'}@{j}({d[i]:.0f}/{m:.1f})")
    bad = [h for h in hits if not h.startswith("body")]
    print(f'{s["id"]:>4} {s["kind"]:5} n={n:4} {"BAD " if bad else ""}{" ".join(hits)}')
