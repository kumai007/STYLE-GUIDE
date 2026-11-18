"""raw_extend.py: lengthen short raws IN a finished master, without re-rendering the case in Remotion (owner 2 Nov: "raws are 3 s
flashes, not entertaining"; rule in _kit/CASE_BUILD_GUIDE.md, end: main raw 10-25 s, secondary 6-12 s, nothing under ~5 s).

usage:  _tools/.venv/bin/python _tools/raw_extend.py <KEY> [options]        (KEY = TOR15 / ND08 / TP17)
  --dry              list the raws and the plan (lengths, source room, limits), change nothing
  --min S            extend raws shorter than S s (default 6.0) to --sec S2 (default 8.0)
  --main-min S       also extend the case's main raw (its longest) when shorter than S (default 10.0) to --main S2 (default 14.0)
  --only i,j         only these raw numbers (as --dry prints them)
  --target i:S       force raw i to S s total
  --blur i:x0,y0,x1,y1[:t0-t1]  gaussian-blur a box (output px, times = seconds into raw i's extension) - injured people/bodies/nudity
  --force            run even if the case code is newer than its master (the master is then probably stale)
Output: build/CASEnn/out/<KEY>.mp4 (replaced, -16 LUFS), <KEY>_phone.mp4, backup <KEY>_pre_extend.mp4 (made once, always the input,
so a re-run starts from the original), <KEY>_extend.json (what was done), check stills in C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/raw_extend/<KEY>/.

How: _tools/raw_probe.mjs mounts the case's Comp with a mock remotion and lists every video/audio with absolute master times. A raw =
an audio that is not VO/music/SFX (the case's rawclean _clean.wav). For each raw to extend, the splice point c = 1.0 s before the raw's
end: the master runs to c, then an extension continues the SAME source clip from the exact source time shown at c (6-frame aligned
crossfade), then the master resumes at the raw's old end (the rest is untouched, just later). The extension footage is framed like
the master (scale/offset measured by ECC on master frames vs source frames, drift continued gently), colour/vignette matched (smoothed
master/source ratio map), grain added to the master's level; a blur-dip into the next shot is reproduced when the master has one.
Source room stops at: the clip's next own cut (srccuts.py, -0.3 s), black/frozen footage, 0.5 s before the clip ends (footage used
again later in the case is no reason to stop). When the clip runs out before the target, a 0.5x slow replay of the key moment
(the window with the most motion, framing 6 % tighter, blur-dip in, slowed clean sound -3 dB) fills the rest. Sound = the case's rawcleaned audio
(sliced from the _clean.wav when it covers the extension, else rawclean.py on the clip's own audio window, found by correlation),
gain matched to the master; the master's bed fades out (0.3 s) into the insert and back in (0.3 s) after it. Then -16 LUFS
(two-pass loudnorm), cutcheck (flags only allowed at the splices or where the old master already had them), phone copy.
Check the stills (and blur anything graphic the extension shows) before sending.
"""
import sys, os, json, subprocess, shutil, math, re, glob, tempfile
import numpy as np, cv2

I = "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg"; E = I + "/_engine"; T = I + "/_tools"
VIDS = {"TOR": "03_Tornado", "ND": "01_Natural_Disasters", "TP": "02_Theme_Park", "WP": "04_Workplace"}
FPS = 30; SR = 44100; W, H = 1920, 1080; XF = 6  # video crossfade frames at the splice-in
sys.path.insert(0, T)
from srccuts import cuts as src_cuts  # noqa: E402

def run(cmd, **k):
    r = subprocess.run(cmd, capture_output=True, **k)
    if r.returncode: raise RuntimeError(f"{cmd[0]} failed: {r.stderr[-800:]!r}")
    return r.stdout

def dur(p): return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).decode().strip())
def has_audio(p): return b"audio" in run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", p])

def frame_at(p, t, w=None, h=None):
    vf = [f"scale={w}:{h}"] if w else []
    out = run(["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.4f}", "-i", p, "-frames:v", "1"] + (["-vf", ",".join(vf)] if vf else []) + ["-f", "image2pipe", "-vcodec", "png", "-"])
    return cv2.imdecode(np.frombuffer(out, np.uint8), cv2.IMREAD_COLOR)

def audio(p, a=None, d=None, mono=False):
    cmd = ["ffmpeg", "-v", "error"] + (["-ss", f"{a:.4f}"] if a is not None else []) + ["-i", p] + (["-t", f"{d:.4f}"] if d else []) + \
          ["-vn", "-ac", "1" if mono else "2", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(run(cmd), np.float32)
    return x if mono else x.reshape(-1, 2)

def write_wav(path, x):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-c:a", "pcm_f32le", path], stdin=subprocess.PIPE)
    p.communicate(np.ascontiguousarray(x, np.float32).tobytes())

# ------------------------------------------------------------------ case data
def probe(key):
    out = subprocess.run(["node", T + "/raw_probe.mjs", key], capture_output=True, text=True)
    if out.returncode: raise RuntimeError("raw_probe failed: " + out.stderr[-600:])
    d = json.loads(out.stdout.strip().splitlines()[-1])
    if d["err"]: print("  probe warning:", d["err"][:200])
    return d

def is_bed(src):
    s = src.lower()
    return any(x in s for x in ("/vor/", "/vo/", "music", "sfx", "bleep", "/intro"))

def find_raws(d, pub):
    V = [r for r in d["rec"] if r["kind"] == "video" and r["end"] < 1e8]
    A = [r for r in d["rec"] if r["kind"] == "audio" and not is_bed(r["src"]) and r["end"] < 1e8]
    raws = []
    for au in sorted(A, key=lambda r: r["off"]):
        a, b = au["off"] / FPS, au["end"] / FPS
        best = None
        for v in V:
            ov = min(b, v["end"] / FPS) - max(a, v["off"] / FPS)
            if ov > 0.5 and (best is None or ov > best[0] + 1e-6): best = (ov, v)
        if not best: continue
        v = best[1]
        raws.append(dict(a=a, b=b, vend=v["end"] / FPS, voff=v["off"] / FPS, vsf=v["startFrom"] / FPS, rate=v["rate"], vsrc=pub + v["src"],
                         asrc=pub + au["src"], asf=au["startFrom"] / FPS, vkey=(v["src"], v["off"], v["startFrom"])))
    # merge duplicates (same audio window recorded twice)
    out = []
    for r in raws:
        if out and abs(out[-1]["a"] - r["a"]) < 0.05 and out[-1]["asrc"] == r["asrc"]: continue
        out.append(r)
    uses = {}
    for v in V:
        p = pub + v["src"]; s0 = v["startFrom"] / FPS
        uses.setdefault(p, []).append((v["off"], s0, s0 + (v["end"] - v["off"]) / FPS * v["rate"]))
    vo = sorted(r["off"] / FPS for r in d["rec"] if r["kind"] == "audio" and ("/vor/" in r["src"] or "/vo/" in r["src"]))
    return out, uses, vo

def src_t(r, t): return r["vsf"] + (t - r["voff"]) * r["rate"]

# ------------------------------------------------------------------ source room
_cut_cache = {}
def room(r, uses, c_src, want_end):
    """last usable source second after c_src (<= want_end) and why it stops"""
    p = r["vsrc"]; D = dur(p); lim, why = min(want_end, D - 0.5), ("wanted" if want_end < D - 0.5 else "clip end")
    # (lead, 3 Nov: footage reappearing later in the case is NOT a reason to stop)
    key = (p, round(c_src, 2))
    if key not in _cut_cache:
        cs, _ = src_cuts(p, max(0, c_src - 0.2), min(D, c_src + 40)); _cut_cache[key] = [t for t, s in cs]
    for t in _cut_cache[key]:
        if t > c_src + 0.05 and t - 0.3 < lim: lim, why = t - 0.3, f"source cut {t:.2f}"; break
    if lim > c_src + 0.5:  # dead footage: black or frozen
        o = subprocess.run(["ffmpeg", "-v", "info", "-ss", f"{c_src:.3f}", "-i", p, "-t", f"{lim - c_src:.3f}", "-vf",
                            "blackdetect=d=0.4:pix_th=0.06,freezedetect=n=0.003:d=1.5", "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
        for m in re.finditer(r"(black_start|freeze_start):\s*([\d.]+)", o):
            t = c_src + float(m.group(2))
            if t > c_src + 0.3 and t - 0.2 < lim: lim, why = t - 0.2, m.group(1).replace("_start", "")
    return lim, why

# ------------------------------------------------------------------ framing / colour calibration
SM = 3  # calibration at 640x360

def ecc_fit(master, src):
    """affine M (2x3) mapping source px -> master px (full res), and the correlation"""
    mg = cv2.cvtColor(cv2.resize(master, (W // SM, H // SM), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
    sg = cv2.cvtColor(src, cv2.COLOR_BGR2GRAY).astype(np.float32)
    h, w = sg.shape; best = (None, -1)
    for mode in ("cover", "contain"):
        for z in ((1.0, 1.04, 1.1, 1.2) if mode == "cover" else (1.0,)):
            k = (max if mode == "cover" else min)(W / w, H / h) * z / SM
            # warp: master_small -> source
            warp = np.array([[1 / k, 0, w / 2 - (W / SM / 2) / k], [0, 1 / k, h / 2 - (H / SM / 2) / k]], np.float32)
            # template = the part of the master the source covers (in contain mode the rest is the blurred fill)
            x0 = max(0, int(W / SM / 2 - w * k / 2) + 4); x1 = min(mg.shape[1], int(W / SM / 2 + w * k / 2) - 4)
            y0 = max(0, int(H / SM / 2 - h * k / 2) + 4); y1 = min(mg.shape[0], int(H / SM / 2 + h * k / 2) - 4)
            o = np.array([x0, y0], np.float32); wc = warp.copy(); wc[:, 2] += wc[:, :2] @ o
            try:
                cc, wp = cv2.findTransformECC(np.ascontiguousarray(mg[y0:y1, x0:x1]), sg, wc, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-6), None, 5)
            except cv2.error:
                continue
            wp = wp.copy(); wp[:, 2] -= wp[:, :2] @ o
            if cc > best[1]: best = (wp, cc)
    wp, cc = best
    if wp is None: return None, -1
    A = np.vstack([wp, [0, 0, 1]]); Minv = np.linalg.inv(A)[:2]  # source -> master_small
    Minv[:, :] *= SM
    return Minv, cc

def covers(M, w, h):
    pts = np.array([[0, 0], [w, 0], [0, h], [w, h]], np.float32)
    q = pts @ M[:, :2].T + M[:, 2]
    return q[:, 0].min() <= 4 and q[:, 0].max() >= W - 4 and q[:, 1].min() <= 4 and q[:, 1].max() >= H - 4

def naive(src, M, fill):
    h, w = src.shape[:2]
    if fill:
        k = max(W / w, H / h) * 1.25
        bg = cv2.resize(src, (int(w * k), int(h * k)), interpolation=cv2.INTER_LINEAR)
        y0 = (bg.shape[0] - H) // 2; x0 = (bg.shape[1] - W) // 2; bg = bg[y0:y0 + H, x0:x0 + W]
        bg = cv2.GaussianBlur(bg, (0, 0), 30).astype(np.float32) * 0.86
        g = bg.mean(2, keepdims=True); bg = g + (bg - g) * 0.92
        fg = cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT).astype(np.float32)
        m = cv2.warpAffine(np.full((h, w), 255, np.uint8), M, (W, H), flags=cv2.INTER_LINEAR).astype(np.float32)[..., None] / 255
        return fg * m + bg * (1 - m)
    return cv2.warpAffine(src, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32)

def lowres(x): return cv2.GaussianBlur(cv2.resize(x, (240, 135), interpolation=cv2.INTER_AREA), (0, 0), 3)

def calibrate(r, master_p, c):
    """framing at master time c and its drift per second, fill flag, colour ratio map, grain level"""
    src = r["vsrc"]; ts = [t for t in (c - 1.6, c - 1.0, c - 0.5, c) if t >= r["a"] + 0.35] or [c]
    fits = []
    for t in ts:
        m = frame_at(master_p, t); s = frame_at(src, src_t(r, t))
        M, cc = ecc_fit(m, s); fits.append((t, M, cc, m, s))
    good = [f for f in fits if f[2] > 0.55]
    if not good: raise RuntimeError(f"raw at {r['a']:.1f}: footage does not match the master (ECC {max(f[2] for f in fits):.2f}); wrong source or stale master")
    tc, Mc = good[-1][0], good[-1][1]
    vel = np.zeros((2, 3))
    if len(good) >= 2 and good[-1][0] - good[0][0] >= 0.9:
        vel = (good[-1][1] - good[0][1]) / (good[-1][0] - good[0][0])
        if abs(vel[0, 0]) / abs(Mc[0, 0]) > 0.03: vel = np.zeros((2, 3))  # implausible drift (punch inside the window): hold
    h, w = good[-1][4].shape[:2]
    fill = not covers(Mc, w, h)
    ratios, gm, gn = [], [], []
    for t, M, cc, m, s in good:
        n = naive(s, M, fill); mf = m.astype(np.float32)
        ratios.append(np.clip((lowres(mf) + 6) / (lowres(n) + 6), 0.35, 2.2))
        gm.append((mf - cv2.GaussianBlur(mf, (0, 0), 1.2)).std()); gn.append((n - cv2.GaussianBlur(n, (0, 0), 1.2)).std())
    R = cv2.GaussianBlur(np.median(np.stack(ratios), 0), (0, 0), 2)
    grain = math.sqrt(max(0.0, float(np.median(gm)) ** 2 - float(np.median(gn)) ** 2))
    return dict(M=Mc, t=tc, vel=vel, fill=fill, R=cv2.resize(R, (W, H), interpolation=cv2.INTER_CUBIC), grain=min(grain, 6.0),
                ecc=[round(f[2], 3) for f in fits])

def sharp(img): return cv2.Laplacian(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.CV_32F).var()

# ------------------------------------------------------------------ extension picture
def render_ext(r, cal, c, n, out, blur_end, blurs, s0=None, rate=None, replay=False, blur_start=False):
    src = r["vsrc"]; s0 = src_t(r, c) if s0 is None else s0; rate = r["rate"] if rate is None else rate
    probe_fps = eval(run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", src]).decode().strip())
    h, w = frame_at(src, s0).shape[:2]
    rd = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", f"{s0:.4f}", "-i", src, "-t", f"{n / FPS * rate + 1:.3f}", "-an", "-vf",
                           ("mpdecimate=hi=200:lo=100:frac=0.5," if rate < 0.99 else "") + f"setpts=(PTS-STARTPTS)/{rate}," + (f"minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" if rate < 0.99 else f"fps={FPS}:round=near"), "-f", "rawvideo", "-pix_fmt", "bgr24", "-"], stdout=subprocess.PIPE)
    wr = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                           "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-pix_fmt", "yuv420p", out], stdin=subprocess.PIPE)
    M0, vel, R = cal["M"], cal["vel"], cal["R"]
    t0 = c - cal["t"]; T_ext = n / FPS + t0; scale0 = abs(M0[0, 0])
    # continue the master's drift at the same speed, easing to a stop by the end, never more than 4 % extra scale
    Te = T_ext if abs(vel[0, 0]) * T_ext / 2 <= 0.04 * scale0 else 0.08 * scale0 / abs(vel[0, 0])
    rng = np.random.default_rng(7); last = None
    for k in range(n):
        buf = rd.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            if last is None: raise RuntimeError("no source frames")
            s = last
        else:
            s = np.frombuffer(buf, np.uint8).reshape(h, w, 3); last = s
        tau = t0 + k / FPS  # seconds after the calibration frame
        u = (tau - tau * tau / (2 * Te)) if tau < Te else Te / 2  # eased: velocity -> 0
        M = M0 + vel * u
        if replay:  # slow replay: held framing, 6 % tighter about the centre (reads as a replay, not a continuation)
            z = 1.06; M = M0.copy(); M[:, :2] *= z; M[:, 2] = M0[:, 2] * z + np.array([W / 2, H / 2]) * (1 - z)
        img = naive(s, M, cal["fill"]) * R
        if cal["grain"] > 0.3:
            g = rng.normal(0, cal["grain"], (H // 2, W // 2)).astype(np.float32)
            img += cv2.resize(g, (W, H), interpolation=cv2.INTER_LINEAR)[..., None] * 1.4
        for (x0, y0, x1, y1, ta, tb) in blurs:
            if ta <= k / FPS <= tb:
                roi = img[y0:y1, x0:x1]; img[y0:y1, x0:x1] = cv2.GaussianBlur(roi, (0, 0), max(8, (x1 - x0) / 12))
        if blur_start and k < 6:  # blur-dip in (out of the previous part)
            e = math.sin(math.pi / 2 * (6 - k) / 6)
            img = cv2.GaussianBlur(img, (0, 0), max(0.1, 16 * e)) * (1 - 0.25 * e)
        if blur_end and k >= n - 5:  # blur-dip into the next shot (Transitions_FX blurDip: 16 px, -25 % at the cut)
            e = math.sin(math.pi / 2 * (k - (n - 6)) / 6)
            img = cv2.GaussianBlur(img, (0, 0), max(0.1, 16 * e)) * (1 - 0.25 * e)
        wr.stdin.write(np.clip(img, 0, 255).astype(np.uint8).tobytes())
    rd.kill(); wr.stdin.close(); wr.wait()

def key_moment(src, a, b, rs):
    """start of the rs-second window in source [a, b] with the most picture change (the key moment)"""
    # never across one of the source's own cuts: pick inside the cut-free stretches (0.3 s clear of each cut)
    cs_, _ = src_cuts(src, max(0, a - 0.1), b + 0.1)
    edges = [a] + [t for t, _ in cs_ if a < t < b] + [b]
    segs = [(x + (0.3 if i else 0), y - (0.3 if j < len(edges) - 2 else 0)) for i, (x, y) in enumerate(zip(edges, edges[1:])) for j in [i]]
    segs = [(x, y) for x, y in segs if y - x > 0.8]
    if not segs: return None
    best = None
    for x, y in segs:
        r_ = min(rs, y - x)
        raw = run(["ffmpeg", "-v", "error", "-ss", f"{x:.3f}", "-i", src, "-t", f"{y - x:.3f}", "-vf", "fps=10,scale=96:54,format=gray", "-f", "rawvideo", "-"])
        f = np.frombuffer(raw, np.uint8).reshape(-1, 54, 96).astype(np.float32)
        if len(f) < 3: continue
        d = np.abs(np.diff(f, axis=0)).mean((1, 2))
        k = max(1, min(len(d), int(r_ * 10))); cv = np.convolve(np.minimum(d, 20), np.ones(k), "valid")
        # whip pans (frame change > 20 at 10 fps) read as cuts once slowed: windows holding one score far lower
        mx = np.array([d[i:i + k].max() for i in range(len(cv))])
        if (mx <= 20).any(): i0 = int(np.argmax(np.where(mx <= 20, cv, -1))); sc = 1000 + float(cv[i0])
        else: i0 = int(np.argmin(mx)); sc = -float(mx[i0])  # all shaky: the calmest window
        sc *= (r_ / rs) if sc > 0 else 1  # prefer full-length windows
        w0 = x + i0 / 10
        if best is None or sc > best[0]: best = (sc, w0, r_)
    return None if best is None else (best[1], best[2])

def audio_file_tempo(a, b):
    run(["ffmpeg", "-v", "error", "-y", "-i", a, "-af", "atempo=0.5", "-ar", str(SR), "-ac", "2", b])
    return audio(b).copy()

# ------------------------------------------------------------------ extension sound
def xcorr_offset(ref, sig):
    """lag (samples) such that sig[lag:lag+len(ref)] ~ ref, and normalised peak"""
    nfft = 1 << int(math.ceil(math.log2(len(ref) + len(sig))))
    c = np.fft.irfft(np.fft.rfft(sig, nfft) * np.conj(np.fft.rfft(ref, nfft)), nfft)[:len(sig) - len(ref) + 1]
    i = int(np.argmax(c))
    e = np.sqrt(np.convolve(sig ** 2, np.ones(len(ref)), "valid")[i] * (ref ** 2).sum()) + 1e-9
    return i, float(c[i] / e)

def ext_audio(r, case_dir, c, n, tmp, log):
    """clean sound for source [src_t(c) - 2, src_t(c) + n/FPS*rate]; returns (stereo array starting at src_t(c) - 2, how)"""
    s0 = src_t(r, c); L = n / FPS * r["rate"]
    tau0 = r["asf"] + (c - r["a"])  # clean-file time at master c
    pre = min(2.0, tau0)
    cd = dur(r["asrc"])
    if tau0 + L + 0.05 <= cd:
        return audio(r["asrc"], tau0 - pre, pre + L), pre, "sliced " + os.path.basename(r["asrc"])
    # find the clip's own audio (aligned with the clean file) and run rawclean on the new window
    ref = audio(r["asrc"], max(0, tau0 - 3), min(3, tau0), mono=True)
    if len(ref) < SR * 0.8: ref = audio(r["asrc"], 0, min(3, cd), mono=True); ref_tau = 0.0
    else: ref_tau = max(0, tau0 - 3)
    best = None
    cands = [p for p in glob.glob(case_dir + "/media/*") + glob.glob(case_dir + "/graded/*") if p.rsplit(".", 1)[-1] in ("mp4", "m4a", "wav", "mov", "mkv", "webm", "aac", "mp3")
             and "_clean" not in p and has_audio(p) and dur(p) > 20]
    ds = 8  # correlate at 5.5 kHz
    for p in cands:
        x = audio(p, mono=True)[::ds]; rr = ref[::ds]
        if len(x) <= len(rr): continue
        lag, pk = xcorr_offset(rr, x)
        if best is None or pk > best[0]: best = (pk, p, lag * ds / SR)
    if not best or best[0] < 0.35: raise RuntimeError(f"raw at {r['a']:.1f}: clean audio ends at {cd:.1f} s and no source audio matches it (best {best and round(best[0], 2)})")
    pk, p, at = best  # clean time ref_tau  <->  p time `at`
    a_src = at + (tau0 - pre - ref_tau)
    win = f"{tmp}/win_{r['a']:.1f}.wav"; cln = f"{tmp}/win_{r['a']:.1f}_clean.wav"
    write_wav(win, audio(p, max(0, a_src), pre + L + 0.5))
    o = subprocess.run([T + ("/.audvenv/Scripts/python.exe" if os.name == "nt" else "/.audvenv/bin/python"), T + "/rawclean.py", win, cln], capture_output=True, text=True)
    if o.returncode: raise RuntimeError("rawclean failed: " + o.stderr[-400:])
    log.append(f"rawclean {os.path.basename(p)} {a_src:.2f}+{pre + L:.1f}: {o.stdout.strip()[-160:]}")
    x = audio(cln)
    if a_src < 0: x = np.vstack([np.zeros((int(-a_src * SR), 2), np.float32), x])
    return x, pre, f"rawclean({os.path.basename(p)} @{a_src:.2f}, corr {pk:.2f})"

# ------------------------------------------------------------------ main
def main():
    args = sys.argv[1:]
    if not args or args[0].startswith("-"): print(__doc__); sys.exit(1)
    key = args[0]; opt = lambda k, d=None: args[args.index(k) + 1] if k in args else d
    m = re.match(r"([A-Z]+)(\d+)", key); vid = VIDS[m.group(1)]; nn = m.group(2)
    case_dir = f"{I}/{vid}/build/CASE{nn}"; outd = case_dir + "/out"
    master, backup = f"{outd}/{key}.mp4", f"{outd}/{key}_pre_extend.mp4"
    code = f"{E}/src/cases/{key}.tsx"
    src_master = backup if os.path.exists(backup) else master
    if not os.path.exists(src_master): print(f"{key}: no master"); sys.exit(2)
    if os.path.exists(code) and os.path.getmtime(code) > os.path.getmtime(src_master) and "--force" not in args:
        print(f"{key}: code is newer than the master (still rendering / stale): skipped"); sys.exit(3)
    pub = f"{E}/pubs/{key}"
    subprocess.run(["bash", T + "/pubsync.sh", key])  # Windows: refresh the hard-link public dir
    d = probe(key)
    raws, uses, vo = find_raws(d, pub)
    mdur = dur(src_master)
    if d.get("dur") and abs(d["dur"] / FPS - mdur) > 0.2:
        print(f"{key}: master is {mdur:.1f} s but the code says {d['dur'] / FPS:.1f} s: stale master"); sys.exit(3) if "--force" not in args else None
    MIN, SEC = float(opt("--min", 6.0)), float(opt("--sec", 8.0)); MMIN, MAIN = float(opt("--main-min", 10.0)), float(opt("--main", 14.0))
    only = [int(x) for x in opt("--only", "").split(",") if x]
    forced = {int(t.split(":")[0]): float(t.split(":")[1]) for t in [args[i + 1] for i, a in enumerate(args) if a == "--target"]}
    blurs = {}
    for i, a in enumerate(args):
        if a == "--blur":
            p = args[i + 1].split(":"); box = [int(v) for v in p[1].split(",")]; tt = [float(v) for v in p[2].split("-")] if len(p) > 2 else [0, 1e9]
            blurs.setdefault(int(p[0]), []).append((*box, *tt))
    lens = [r["b"] - r["a"] for r in raws]
    main_i = int(np.argmax(lens)) if raws else -1
    plan = []
    print(f"{key}: master {mdur:.1f} s, {len(raws)} raws")
    for i, r in enumerate(raws):
        L = r["b"] - r["a"]
        want = forced.get(i) or (MAIN if i == main_i and L < MMIN else SEC if L < MIN else None)
        if only and i not in only: want = None
        b_f = round(min(r["b"], r["vend"]) * FPS); c_f = b_f - FPS
        if want and c_f < round(r["a"] * FPS) + 20: c_f = round(r["a"] * FPS) + 20
        c = c_f / FPS
        line = f"  raw {i}: {r['a']:6.2f}-{r['b']:6.2f} ({L:4.1f} s) {os.path.basename(r['vsrc'])} src {src_t(r, r['a']):.2f}-{src_t(r, r['b']):.2f} {os.path.basename(r['asrc'])}" + (" MAIN" if i == main_i else "")
        if want and want > L + 0.5:
            cs = src_t(r, c); lim, why = room(r, uses, cs, cs + (want - (c - r["a"])) * r["rate"])
            n = max(12, int((lim - cs) / r["rate"] * FPS))
            new = (c - r["a"]) + n / FPS; rep = None
            if new < want - 0.3:  # the clip runs out: 0.5x slow replay of the key moment (most motion) seen so far
                need = max(3.0, want - new); rs = min(4.0, need / 2)
                km = key_moment(r["vsrc"], src_t(r, r["a"]) + 0.2, lim, rs)
                if km is not None: rep = (km[0], km[1], int(km[1] * 2 * FPS)); new += rep[2] / FPS
            line += f"  -> {new:.1f} s (forward stops: {why}" + (f"; + 0.5x replay of src {rep[0]:.1f}-{rep[0] + rep[1]:.1f}" if rep else "") + ")"
            plan.append(dict(i=i, r=r, c_f=c_f, b_f=b_f, n_fwd=n, rep=rep, n=n + (rep[2] if rep else 0), new=new, why=why, main=i == main_i))
        print(line)
    if "--dry" in args or not plan:
        if not plan: print(f"{key}: nothing to extend")
        return
    if not os.path.exists(backup): shutil.copy2(master, backup); print("  backup", backup)
    src_master = backup
    tmp = tempfile.mkdtemp(prefix=f"rawext_{key}_", dir="C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch" if os.path.isdir("C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch") else None)
    chk = f"C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/raw_extend/{key}"; os.makedirs(chk, exist_ok=True)
    log = []
    M_audio = audio(src_master)
    for p in plan:
        r, c = p["r"], p["c_f"] / FPS
        p["cal"] = cal = calibrate(r, src_master, c)
        nb = frame_at(src_master, p["b_f"] / FPS); nb2 = frame_at(src_master, p["b_f"] / FPS + 0.45)
        p["blur_end"] = bool(sharp(nb) < 0.45 * sharp(nb2))
        p["ext"] = f"{tmp}/ext_{p['i']}.mp4"
        rep = p["rep"]
        if not rep:
            render_ext(r, cal, c, p["n"], p["ext"], p["blur_end"], blurs.get(p["i"], []))
        else:
            fa, fb = f"{tmp}/fwd_{p['i']}.mp4", f"{tmp}/rep_{p['i']}.mp4"
            render_ext(r, cal, c, p["n_fwd"], fa, True, blurs.get(p["i"], []))
            render_ext(r, cal, c, rep[2], fb, p["blur_end"], blurs.get(p["i"], []), s0=rep[0], rate=0.5 * r["rate"], replay=True, blur_start=True)
            open(f"{tmp}/cat.txt", "w").write(f"file '{fa}'\nfile '{fb}'\n")
            run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", f"{tmp}/cat.txt", "-c", "copy", p["ext"]])
        x, pre, how = ext_audio(r, case_dir, c, p["n_fwd"], tmp, log)
        # gain + fine offset against the master over the seconds before c (the raw's own sound, past its fade-in)
        sl = max(0.3, min(1.6, pre - 0.1, c - r["a"] - 0.3)); slack = pre - sl  # x[slack*SR] is master time c - sl
        seg = M_audio[int((c - sl) * SR):int(c * SR)].mean(1)
        lag, pk = xcorr_offset(seg, x[:int(pre * SR) + 2205].mean(1))
        if abs(lag / SR - slack) > 0.06 or pk < 0.3: lag = int(slack * SR)
        al = x[lag:lag + len(seg)].mean(1)
        g = float((seg * al).sum() / ((al * al).sum() + 1e-12)) if pk > 0.3 else float(np.sqrt((seg ** 2).mean() / ((al ** 2).mean() + 1e-12)))
        g = float(np.clip(g, 0.05, 8))
        p["aud"] = x[lag + len(seg):] * g
        if rep:  # forward sound, then the replay window's clean sound slowed 0.5x (pitch kept), -3 dB, 0.15 s joins
            nf = int(p["n_fwd"] / FPS * SR); fwd = p["aud"][:nf].copy()
            if len(fwd) < nf: fwd = np.vstack([fwd, np.zeros((nf - len(fwd), 2), np.float32)])
            cw = r["voff"] + (rep[0] - r["vsf"]) / r["rate"]  # master-equivalent time of the replay window
            y, ypre, _ = ext_audio(r, case_dir, cw, int(rep[1] / r["rate"] * FPS) + 3, tmp, log)
            y = y[int(ypre * SR):int((ypre + rep[1]) * SR)]
            write_wav(f"{tmp}/repa.wav", y)
            y = audio_file_tempo(f"{tmp}/repa.wav", f"{tmp}/repb.wav") * g * 10 ** (-3 / 20)
            k = int(0.15 * SR); fwd[-k:] *= np.linspace(1, 0, k)[:, None]; y[:k] *= np.linspace(0, 1, k)[:, None]
            p["aud"] = np.vstack([fwd, y])
        p["how"] = f"{how}, gain {20 * math.log10(g):+.1f} dB, corr {pk:.2f}, lag {(lag / SR - slack) * 1000:+.0f} ms"
        print(f"  raw {p['i']}: ext {p['n'] / FPS:.1f} s, ECC {cal['ecc']}, fill {cal['fill']}, grain {cal['grain']:.1f}, blur-dip {p['blur_end']}; {p['how']}")
    # ---- audio timeline
    fo, fi = int(0.3 * SR), int(0.3 * SR)
    parts, cur, shift = [], 0, 0.0
    vo_near = lambda t: any(abs(v - t) < 0.15 for v in vo)
    for p in plan:
        c_s, b_s, n_s = int(p["c_f"] / FPS * SR), int(p["b_f"] / FPS * SR), int(p["n"] / FPS * SR)
        head = M_audio[cur:c_s + fo].copy()
        if cur > 0:  # fade the master back in after the previous insert
            k = int(0.12 * SR) if vo_near(cur / SR) else fi; head[:k] *= np.linspace(0, 1, k)[:, None]
        head[-fo:] *= np.linspace(1, 0, fo)[:, None]
        ext = p["aud"][:n_s].copy()
        if len(ext) < n_s: ext = np.vstack([ext, np.zeros((n_s - len(ext), 2), np.float32)])
        ext[:fo] *= np.linspace(0, 1, fo)[:, None]; ext[-int(0.45 * SR):] *= np.linspace(1, 0, int(0.45 * SR))[:, None]
        if parts: parts[-1] = parts[-1]
        parts.append(("head", head)); parts.append(("ext", ext))
        p["out_c"] = p["c_f"] / FPS + shift; p["out_end"] = p["out_c"] + p["n"] / FPS
        shift += p["n"] / FPS - (p["b_f"] - p["c_f"]) / FPS
        cur = b_s
    tail = M_audio[cur:].copy(); k = int(0.12 * SR) if vo_near(cur / SR) else fi; tail[:k] *= np.linspace(0, 1, k)[:, None]
    # overlap-add: each head overlaps its ext by fo samples
    out = np.zeros((0, 2), np.float32)
    for kind, x in parts:
        if kind == "ext":
            out[-fo:] += x[:fo]; out = np.vstack([out, x[fo:]])
        else:
            out = np.vstack([out, x])
    out = np.vstack([out, tail])
    write_wav(f"{tmp}/mix.wav", out)
    # ---- video timeline (filter graph)
    inputs = ["-i", src_master] + sum([["-i", p["ext"]] for p in plan], [])
    nseg = len(plan) + 1
    fg = [f"[0:v]settb=AVTB,fps={FPS},format=yuv420p,split={nseg}" + "".join(f"[m{j}]" for j in range(nseg))]
    cur_f, last, out_len = 0, None, 0
    for j, p in enumerate(plan):
        fg.append(f"[m{j}]trim=start_frame={cur_f}:end_frame={p['c_f'] + XF},setpts=PTS-STARTPTS,settb=1/{FPS}[h{j}]")
        if last is None: hj = f"h{j}"; hl = p["c_f"] + XF - cur_f
        else:
            fg.append(f"[{last}][h{j}]concat=n=2:v=1:a=0,settb=1/{FPS}[k{j}]"); hj = f"k{j}"; hl = out_len + p["c_f"] + XF - cur_f
        fg.append(f"[{j + 1}:v]fps={FPS},format=yuv420p,setpts=PTS-STARTPTS,settb=1/{FPS}[e{j}]")
        off = (hl - XF) / FPS
        fg.append(f"[{hj}][e{j}]xfade=transition=fade:duration={XF / FPS:.4f}:offset={off:.4f}[x{j}]")
        last = f"x{j}"; out_len = hl - XF + p["n"]; cur_f = p["b_f"]
    fg.append(f"[m{nseg - 1}]trim=start_frame={cur_f},setpts=PTS-STARTPTS,settb=1/{FPS}[t]"); fg.append(f"[{last}][t]concat=n=2:v=1:a=0[v]")
    # ---- loudness (two-pass, -16 LUFS like render_case.sh)
    meas = subprocess.run(["ffmpeg", "-v", "info", "-i", f"{tmp}/mix.wav", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    js = json.loads(meas[meas.rindex("{"):meas.rindex("}") + 1])
    ln = (f"loudnorm=I=-16:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:measured_LRA={js['input_lra']}"
          f":measured_thresh={js['input_thresh']}:offset={js['target_offset']}:linear=true")
    new = f"{tmp}/{key}.mp4"
    run(["ffmpeg", "-v", "error", "-y"] + inputs + ["-i", f"{tmp}/mix.wav", "-filter_complex", ";".join(fg), "-map", "[v]", "-map", f"{len(plan) + 1}:a",
         "-af", ln, "-ar", str(SR), "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", new])
    nd = dur(new); expect = mdur + shift
    if abs(nd - expect) > 0.15: raise RuntimeError(f"length {nd:.2f} != expected {expect:.2f}")
    # ---- cutcheck: only the splices may add flags
    def flags(p):
        o = subprocess.run(["python3", T + "/cutcheck.py", p], capture_output=True, text=True).stdout
        return [(int(m.group(2)), m.group(1)) for m in re.finditer(r"(\w+)\s+f(\d+)", o)], o.splitlines()[0] if o else ""
    old_f, _ = flags(src_master); new_f, head = flags(new)
    def to_old(f):  # output frame -> old master frame (None inside an insert)
        t = f / FPS
        acc = 0.0
        for p in plan:
            if t < p["out_c"]: return round((t - acc) * FPS)
            if t < p["out_end"] + 0.4: return None
            acc += p["n"] / FPS - (p["b_f"] - p["c_f"]) / FPS
        return round((t - acc) * FPS)
    bad = []
    for f, kd in new_f:
        o = to_old(f)
        near_splice = any(abs(f / FPS - p["out_c"]) < 0.5 or abs(f / FPS - p["out_end"]) < 0.5
                          or (p["rep"] and abs(f / FPS - (p["out_c"] + p["n_fwd"] / FPS)) < 0.5) for p in plan)  # + the blur-dip into the replay
        if near_splice: continue
        if o is None or not any(abs(o - of) <= 2 for of, _ in old_f): bad.append((f, kd))
    print(f"  cutcheck: {head}; new flags outside the splices: {len(bad)} {bad[:6]}")
    if bad and "--keep-going" not in args: raise RuntimeError(f"cutcheck: new flags {bad[:6]} (output in {new})")
    # ---- install
    shutil.move(new, master)
    run(["ffmpeg", "-y", "-v", "error", "-i", master, "-vf", "scale=1280:-2", "-c:v", "libx264", "-b:v", "1350k", "-maxrate", "1600k", "-bufsize", "3000k",
         "-preset", "medium", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", f"{outd}/{key}_phone.mp4"])
    # ---- check stills (1:1 PNG) around each splice
    for p in plan:
        for lab, t in (("in-0.2", p["out_c"] - 0.2), ("in+0.3", p["out_c"] + 0.3), ("mid", (p["out_c"] + p["out_end"]) / 2),
                       ("end-0.3", p["out_end"] - 0.3), ("out+0.1", p["out_end"] + 0.1), ("out+0.6", p["out_end"] + 0.6)):
            cv2.imwrite(f"{chk}/r{p['i']}_{lab}.png", frame_at(master, t))
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{p['out_c'] - 1:.2f}", "-i", master, "-t", f"{p['out_end'] - p['out_c'] + 2:.2f}",
             "-vf", f"fps={24 / (p['out_end'] - p['out_c'] + 2):.4f},scale=384:-1,tile=6x4", "-frames:v", "1", f"{chk}/r{p['i']}_sheet.jpg"])
    lv = subprocess.run(["ffmpeg", "-v", "info", "-i", master, "-af", "loudnorm=I=-16:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    lj = json.loads(lv[lv.rindex("{"):lv.rindex("}") + 1])
    rep = dict(key=key, old_len=round(mdur, 2), new_len=round(nd, 2), lufs=lj["input_i"], tp=lj["input_tp"], log=log,
               raws=[dict(raw=p["i"], master_at=round(p["r"]["a"], 2), old=round(p["r"]["b"] - p["r"]["a"], 2), new=round(p["new"], 2), main=p["main"],
                          out_at=round(p["out_c"] - (p["c_f"] / FPS - p["r"]["a"]), 2), splice_in=round(p["out_c"], 2), splice_out=round(p["out_end"], 2),
                          stops=p["why"], sound=p["how"], ecc=p["cal"]["ecc"], fill=p["cal"]["fill"], blur_dip=p["blur_end"]) for p in plan])
    json.dump(rep, open(f"{outd}/{key}_extend.json", "w"), indent=1, default=str)
    print(f"{key}: {mdur:.1f} -> {nd:.1f} s, {lj['input_i']} LUFS, TP {lj['input_tp']}; stills in {chk}")
    shutil.rmtree(tmp, ignore_errors=True)

if __name__ == "__main__":
    main()
