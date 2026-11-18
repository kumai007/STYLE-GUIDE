# scan a rendered file at every transition window of an EDL: flag diff spikes (source cut inside the fade)
import sys, subprocess, numpy as np, importlib
from common import FPS
edl = importlib.import_module(sys.argv[1]); f = sys.argv[2]
raw = subprocess.run(["ffmpeg","-v","error","-i",f,"-vf","scale=96:54,format=gray","-f","rawvideo","-"],capture_output=True).stdout
a = np.frombuffer(raw,np.uint8).reshape(-1,54,96).astype(np.float32)
d = np.abs(np.diff(a,axis=0)).mean((1,2))  # d[i] = change from frame i to i+1
S = edl.SHOTS; H = edl.H
for i in range(len(S)-1):
    s, n = S[i], S[i+1]
    if s["tout"] == "cut": continue
    B = round(s["b"]*FPS); x = n.get("x","c")
    w0 = B - {"c":H,"late":0,"early":2*H}[x]; w1 = w0 + 2*H
    seg = d[max(0,w0-6):w1+6]; core = d[w0:w1]
    ref = np.median(np.concatenate([d[max(0,w0-30):w0], d[w1:w1+30]])) + 0.3
    k = int(np.argmax(core)); pk = float(core[k])
    flag = "BAD" if pk > max(6, 4*ref, 2.5*np.median(core)+2) else ""
    print(f'{s["id"]:>4}->{n["id"]:<4} {s["tout"]:3} {x:5} win {w0/FPS:7.2f}-{w1/FPS:7.2f} peak {pk:5.1f} @f{k:2d} ({(w0+k)/FPS:7.2f}s) med {np.median(core):4.1f} ref {ref:4.1f} {flag}')
