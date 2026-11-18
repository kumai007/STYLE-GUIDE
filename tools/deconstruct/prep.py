"""prep.py PROD [--board farrell] [--port 8766] [--start FRAME] [--model medium.en]

Gets one reference video ready for deconstruction. Reads the video only, never writes to it.
  1. finds (or adds) the video node on the board
  2. start frame = 1 + the last frame of the owner's own clips on that video (0 if none)
  3. reserves a layout band below everything on the board (and below other prepped videos)
  4. per-frame metrics (64x36 gray), cut list, cut-to-cut units
  5. word-level transcript (faster-whisper on GPU) if audio/words_full.json is missing
  6. start/mid/end thumbnails per unit, contact sheets (8 units each) and units.txt (unit + narration)
Re-running skips steps whose output exists. Work files: 01_reference/deconstruct/ (cache/ is disposable)."""
import argparse, glob, json, subprocess, sys
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).parent))
from common import PROD, workdir, get_json, mutate, is_claude, new_id, now_iso, ts, words

ap = argparse.ArgumentParser()
ap.add_argument("prod"); ap.add_argument("--board", default="farrell"); ap.add_argument("--port", type=int, default=8766)
ap.add_argument("--start", type=int); ap.add_argument("--model", default="medium.en")
A = ap.parse_args()
WD = workdir(A.prod); CACHE = WD / "cache"; (CACHE / "fr").mkdir(parents=True, exist_ok=True); (WD / "sheets").mkdir(exist_ok=True)
mp4 = sorted((PROD / A.prod / "01_reference" / "source").glob("*.mp4"))
if len(mp4) != 1: raise SystemExit(f"expected one mp4 in {A.prod}/01_reference/source, found {len(mp4)}")
VID = mp4[0]; SRC = VID.relative_to(PROD).as_posix()
cfg = json.loads((WD / "config.json").read_text(encoding="utf-8")) if (WD / "config.json").exists() else {}
cfg.update(prod=A.prod, board=A.board, port=A.port, src=SRC)
info = get_json(f"http://127.0.0.1:{A.port}/api/info?v={SRC}")
cfg["fps"] = [info["fps_num"], info["fps_den"]]; FPS = info["fps_num"] / info["fps_den"]

# 1. video node
def ensure_video(b):
    if any(n["type"] == "video" and n.get("src") == SRC for n in b["nodes"]): return None
    ys = [n.get("y", 0) for n in b["nodes"]] or [0]; xs = [n.get("x", 0) for n in b["nodes"]] or [0]
    b["nodes"].append({"id": new_id("v"), "type": "video", "src": SRC, "parent": None, "title": A.prod, "tags": [], "note": "",
                       "purpose": "", "fps": cfg["fps"], "size": [info["width"], info["height"]], "duration": info["duration"],
                       "created": now_iso(), "updated": now_iso(), "x": min(xs), "y": max(ys) + 900})
    return "added video node"
s, _ = mutate(cfg, ensure_video)
if s: print(s)
b = get_json(f"http://127.0.0.1:{A.port}/api/board?b={A.board}")
vnode = next(n for n in b["nodes"] if n["type"] == "video" and n.get("src") == SRC)
cfg["video_id"] = vnode["id"]; cfg["size"] = vnode.get("size") or [info["width"], info["height"]]

# 2. start frame
owner = [n for n in b["nodes"] if n["type"] == "clip" and n.get("parent") == vnode["id"] and not is_claude(n) and "MGI" not in (n.get("tags") or [])]
cfg["start"] = A.start if A.start is not None else cfg.get("start", (max(n["sf_out"] for n in owner) + 1) if owner else 0)

# 3. layout band (kept once chosen, so the user can move nodes freely afterwards)
if "layout" not in cfg:
    bottom = max(n.get("y", 0) for n in b["nodes"])
    for f in glob.glob(str(PROD / "*" / "01_reference" / "deconstruct" / "config.json")):
        o = json.loads(Path(f).read_text(encoding="utf-8"))
        if o.get("prod") != A.prod and "layout" in o and o.get("board") == A.board:
            bottom = max(bottom, o["layout"]["y0"] + o["layout"]["per"] * o["layout"]["rowh"])
    cfg["layout"] = {"x0": min(n.get("x", 0) for n in b["nodes"]), "y0": bottom + 900, "per": 12, "colw": 400, "rowh": 300}
(WD / "config.json").write_text(json.dumps(cfg, indent=1), encoding="utf-8")   # early, so a parallel prep sees this band
if not (WD / "baseline.json").exists():      # pre-existing non-claude nodes, to prove we never touched them
    (WD / "baseline.json").write_text(json.dumps([n for n in b["nodes"] if not is_claude(n)], ensure_ascii=False), encoding="utf-8")

# 4. metrics + cuts + units
MET = CACHE / "metrics.npz"
if not MET.exists():
    W, H = 64, 36; sz = W * H
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(VID), "-an", "-vf", f"scale={W}:{H}:flags=area,format=gray",
                          "-f", "rawvideo", "-"], stdout=subprocess.PIPE, bufsize=sz * 256)
    prev = None; mad = []; luma = []
    while True:
        buf = p.stdout.read(sz)
        if len(buf) < sz: break
        f = np.frombuffer(buf, np.uint8).astype(np.int16); luma.append(f.mean())
        mad.append(0.0 if prev is None else float(np.abs(f - prev).mean())); prev = f
    p.wait(); np.savez(MET, mad=np.array(mad, np.float32), luma=np.array(luma, np.float32))
d = np.load(MET); mad, lu = d["mad"], d["luma"]; N = len(mad); cfg["N"] = N
S = cfg["start"]
cuts = [S]
for i in range(S + 1, N):
    m = float(np.median(np.r_[mad[max(0, i - 8):i], mad[i + 1:i + 9]]))
    if mad[i] > 18 and mad[i] > 4 * m + 8:
        if i - cuts[-1] < 3:
            if mad[i] > mad[cuts[-1]] and cuts[-1] != S: cuts[-1] = i
            continue
        cuts.append(i)
seg = PROD / A.prod / "01_reference" / "autoclass" / "segments.json"
if seg.exists():                              # earlier auto-classification boundaries help find soft cuts
    for x in json.loads(seg.read_text(encoding="utf-8"))["segments"]:
        f = x["frame_in"]
        if f > S and not any(abs(f - k) <= 2 for k in cuts): cuts.append(f)
cuts = sorted(set(cuts))
units = [[cuts[i], (cuts[i + 1] - 1) if i + 1 < len(cuts) else N - 1] for i in range(len(cuts))]
black = []; i = S
while i < N:
    if lu[i] < 6:
        j = i
        while j < N and lu[j] < 6: j += 1
        if j - i >= 3: black.append([i, j - 1])
        i = j
    else: i += 1
json.dump({"units": units, "black": black}, open(WD / "units.json", "w"))

# 5. transcript
WF = PROD / A.prod / "01_reference" / "audio" / "words_full.json"
if not WF.exists():
    import os, time
    LOCK = PROD / "_whisper.lock"                      # one transcription at a time (4 GB GPU); delete if a crash leaves it
    while True:
        try: os.mkdir(LOCK); break
        except FileExistsError: time.sleep(5)
    try:
      try:                                             # pip's nvidia-cublas/cudnn wheels are not on the DLL path by default
          import nvidia
          for d in Path(list(nvidia.__path__)[0]).glob("*/bin"): os.add_dll_directory(str(d)); os.environ["PATH"] = f"{d};{os.environ['PATH']}"
      except ImportError: pass
      from faster_whisper import WhisperModel
      try: model = WhisperModel(A.model, device="cuda", compute_type="int8_float16")
      except Exception as e: print("GPU whisper failed, using CPU:", e); model = WhisperModel(A.model, device="cpu", compute_type="int8")
      segs, _ = model.transcribe(str(VID), word_timestamps=True, vad_filter=True, beam_size=5)
      out = [[w.word.strip(), round(w.start, 2), round(w.end, 2)] for s_ in segs for w in (s_.words or []) if w.word.strip()]
      del model
    finally: os.rmdir(LOCK)
    WF.parent.mkdir(exist_ok=True); WF.write_text(json.dumps(out, ensure_ascii=False), encoding="utf-8")
    print("transcribed", len(out), "words")
Wd = words(cfg)

# 6. thumbnails, sheets, units.txt
def picks(a, e):
    L = e - a; return [a + min(2, L // 4), (a + e) // 2, e - min(2, L // 4)]
need = sorted({f for a, e in units for f in picks(a, e)})
FR = CACHE / "fr"; missing = [f for f in need if not (FR / f"{f}.jpg").exists()]
if missing:
    from PIL import Image
    TW, TH = 352, 198; sz = TW * TH * 3; want = set(missing); mx = max(missing)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", str(VID), "-an", "-vf", f"scale={TW}:{TH}", "-pix_fmt", "rgb24",
                          "-f", "rawvideo", "-"], stdout=subprocess.PIPE, bufsize=sz * 8)
    n = 0
    while n <= mx:
        buf = p.stdout.read(sz)
        if len(buf) < sz: break
        if n in want: Image.frombuffer("RGB", (TW, TH), buf).save(FR / f"{n}.jpg", quality=85)
        n += 1
    p.kill()
from PIL import Image, ImageDraw, ImageFont
try: font = ImageFont.truetype("arial.ttf", 20)
except Exception: font = ImageFont.load_default()
TW, TH, R, LW = 352, 198, 8, 150
for old in (WD / "sheets").glob("s*.jpg"): old.unlink()
for k in range(0, len(units), R):
    img = Image.new("RGB", (LW + 3 * TW + 8, R * (TH + 4)), (40, 40, 40)); dr = ImageDraw.Draw(img)
    for r, (a, e) in enumerate(units[k:k + R]):
        y = r * (TH + 4)
        dr.text((4, y + 4), f"#{k + r}\nf{a}\n{ts(a / FPS)}\n{(e + 1 - a) / FPS:.1f}s", fill=(255, 255, 0), font=font)
        for c, f in enumerate(picks(a, e)):
            img.paste(Image.open(FR / f"{f}.jpg"), (LW + c * (TW + 4), y))
    img.save(WD / "sheets" / f"s{k // R:02d}.jpg", quality=80)
with open(WD / "units.txt", "w", encoding="utf-8") as fh:
    for i, (a, e) in enumerate(units):
        t0, t1 = a / FPS, (e + 1) / FPS
        w = " ".join(x[0] for x in Wd if t0 <= x[1] < t1)
        fh.write(f"#{i} f{a}-{e} {ts(t0)}-{ts(t1)} ({t1 - t0:.1f}s) mad={mad[a]:.0f}: {w[:240]}\n")
(WD / "config.json").write_text(json.dumps(cfg, indent=1), encoding="utf-8")
print(f"{A.prod}: video {cfg['video_id']} fps {FPS:.3f} frames {N} start {S} units {len(units)} sheets {(len(units) + R - 1) // R} "
      f"black runs {len(black)} words {len(Wd)} layout {cfg['layout']}")
