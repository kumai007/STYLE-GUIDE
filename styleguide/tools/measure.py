#!/usr/bin/env python3
"""Measure the Farrell references so the style guide can quote numbers, not impressions.

    python styleguide/tools/measure.py farrell-01-internet-archive [farrell-02-... ...] [--step 2]

Writes styleguide/farrell/measure/<prod>.json. It only reads the source mp4s and the board; ffmpeg gets argument lists.
- picture: a frame every --step s at 160x90, tagged raw / treated by the claude clip covering it on the board
- sound: EBU R128 loudness (I, LRA) of the mix and, if present, of the separated voice / music stems
- voice: words per minute and pauses from audio/words_full.json
- edit: clip categories, lengths, clips per minute, motion-graphic share, frequent title words
"""
import argparse, collections, json, re, subprocess, sys
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
PROD = ROOT / "productions"
OUT = ROOT / "styleguide" / "farrell" / "measure"
RAW = {"raw-footage", "raw"}
NOT_CAT = {"claude", "motion graphic", "MGI", "whole-film study", "owner"}
STOP = set("the a an of to and in on for with is it this that over from at by as be are was his her their its into out up "
           "page 3d shot frame clip card text title black white red over under".split())
W, H = 160, 90


# ---------------------------------------------------------------- per-frame metrics (pure, tested)
def luma(rgb):
    rgb = rgb.astype(np.float32); return rgb[..., 0] * .299 + rgb[..., 1] * .587 + rgb[..., 2] * .114


def frame_metrics(rgb):
    y = luma(rgb); f = rgb.astype(np.float32); mx, mn = f.max(-1), f.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    h, w = y.shape; bh, bw = max(1, h // 10), max(1, w // 10)
    centre = y[h // 4: 3 * h // 4, w // 4: 3 * w // 4].mean()
    edge = np.concatenate([y[:bh].ravel(), y[-bh:].ravel(), y[:, :bw].ravel(), y[:, -bw:].ravel()]).mean()
    pad = np.pad(y, 1, mode="edge")
    blur = sum(pad[i:i + h, j:j + w] for i in range(3) for j in range(3)) / 9
    return {"luma": float(y.mean()), "p10": float(np.percentile(y, 10)), "p90": float(np.percentile(y, 90)),
            "contrast": float(y.std()), "sat": float(sat.mean() * 100),
            "tint_rb": float((f[..., 0] - f[..., 2]).mean()), "tint_g": float((f[..., 1] - (f[..., 0] + f[..., 2]) / 2).mean()),
            "vignette": float(edge / centre) if centre > 4 else None, "grain": float((y - blur).std()),
            "dark": bool(y.mean() < 40), "black": bool(y.mean() < 8)}


def summarise(ms):
    if not ms: return {"frames": 0}
    out = {"frames": len(ms)}
    for k in ("luma", "p10", "p90", "contrast", "sat", "tint_rb", "tint_g", "vignette", "grain"):
        v = [m[k] for m in ms if m[k] is not None]
        if v: out[k] = round(float(np.median(v)), 2)
    out["luma_p10_p90"] = [round(float(np.percentile([m["luma"] for m in ms], q)), 1) for q in (10, 90)]
    out["dark_share"] = round(sum(m["dark"] for m in ms) / len(ms), 3)
    out["black_share"] = round(sum(m["black"] for m in ms) / len(ms), 3)
    return out


def category(tags):
    return next((t for t in tags if t not in NOT_CAT), "untagged")


# ---------------------------------------------------------------- media
def ffprobe(src):
    j = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                   "stream=r_frame_rate:format=duration", "-of", "json", str(src)],
                                  capture_output=True, text=True, check=True).stdout)
    n, d = (int(x) for x in j["streams"][0]["r_frame_rate"].split("/"))
    return n / d, float(j["format"]["duration"])


def frames(src, step):
    p = subprocess.Popen(["ffmpeg", "-hide_banner", "-nostdin", "-loglevel", "error", "-i", str(src), "-an",
                          "-vf", f"fps=1/{step},scale={W}:{H}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                         stdout=subprocess.PIPE)
    n = W * H * 3; i = 0
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield i * step, np.frombuffer(b, np.uint8).reshape(H, W, 3); i += 1
    p.wait()


def loudness(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-nostats", "-i", str(path), "-vn", "-af", "ebur128", "-f", "null", "-"],
                       capture_output=True, text=True, errors="replace")
    s = r.stderr[r.stderr.rfind("Summary:"):]
    g = lambda k: (lambda m: float(m.group(1)) if m else None)(re.search(k + r":\s+(-?[\d.]+)", s))
    return {"I_lufs": g("I"), "LRA_lu": g("LRA")}


# ---------------------------------------------------------------- per production
def measure(prod, board, step, do_frames=True, do_audio=True):
    pdir = PROD / prod; src = next((pdir / "01_reference" / "source").glob("*.mp4"))
    fps, dur = ffprobe(src)
    clips = sorted((n for n in board["nodes"] if "sf_in" in n and n.get("src", "").startswith(prod + "/") and "claude" in n.get("tags", [])),
                   key=lambda n: n["sf_in"])
    out = {"prod": prod, "src": src.name, "fps": round(fps, 3), "duration_s": round(dur, 1)}

    # edit
    by = collections.defaultdict(list); mg = 0
    for c in clips:
        d = (c["sf_out"] - c["sf_in"] + 1) / fps; by[category(c["tags"])].append((d, c.get("title", ""))); mg += "motion graphic" in c["tags"]
    lens = [(c["sf_out"] - c["sf_in"] + 1) / fps for c in clips]; tot = sum(lens) or 1
    words = lambda ts: [w for w, _ in collections.Counter(x for t in ts for x in re.findall(r"[a-z]{3,}", t.lower()) if x not in STOP).most_common(8)]
    out["edit"] = {"clips": len(clips), "clips_per_min": round(len(clips) / (dur / 60), 2),
                   "clip_len_s": {q: round(float(np.percentile(lens, p)), 1) for q, p in (("p10", 10), ("median", 50), ("p90", 90))} if lens else {},
                   "motion_graphic_share": round(mg / max(1, len(clips)), 3),
                   "categories": {k: {"clips": len(v), "time_share": round(sum(d for d, _ in v) / tot, 3),
                                      "median_s": round(float(np.median([d for d, _ in v])), 1), "title_words": words([t for _, t in v])}
                                  for k, v in sorted(by.items(), key=lambda kv: -sum(d for d, _ in kv[1]))}}

    # voice
    wf = pdir / "01_reference" / "audio" / "words_full.json"
    if wf.exists():
        w = json.loads(wf.read_text(encoding="utf-8")); gaps = [b[1] - a[2] for a, b in zip(w, w[1:])]
        span = (w[-1][2] - w[0][1]) / 60 if w else 1; long = [g for g in gaps if g >= 0.6]
        out["voice"] = {"words": len(w), "wpm": round(len(w) / span, 1), "pauses_ge_0_6s_per_min": round(len(long) / span, 1),
                        "pause_median_s": round(float(np.median(long)), 2) if long else None,
                        "pauses_ge_2s": sum(g >= 2 for g in gaps)}

    if do_audio:
        a = pdir / "01_reference" / "audio"; out["sound"] = {"mix": loudness(src)}
        for stem in ("Vocals", "Instrumental"):
            f = a / f"full_{stem}.flac"
            if f.exists(): out["sound"][stem.lower()] = loudness(f)
        v, m = out["sound"].get("vocals", {}).get("I_lufs"), out["sound"].get("instrumental", {}).get("I_lufs")
        if v is not None and m is not None: out["sound"]["music_under_voice_db"] = round(v - m, 1)

    if do_frames:
        spans = [((c["sf_in"]) / fps, (c["sf_out"] + 1) / fps, category(c["tags"])) for c in clips]
        grp = collections.defaultdict(list); k = 0
        for t, rgb in frames(src, step):
            while k < len(spans) and spans[k][1] <= t: k += 1
            cat = next((s[2] for s in spans[k:k + 3] if s[0] <= t < s[1]), "untagged")
            m = frame_metrics(rgb); grp["all"].append(m); grp["raw" if cat in RAW else "untagged" if cat == "untagged" else "treated"].append(m)
            grp["cat:" + cat].append(m)
        out["picture"] = {g: summarise(v) for g, v in sorted(grp.items())}
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("prods", nargs="+"); ap.add_argument("--step", type=float, default=2.0)
    ap.add_argument("--no-frames", action="store_true"); ap.add_argument("--no-audio", action="store_true")
    a = ap.parse_args(); board = json.loads((PROD / "_boards" / "farrell.json").read_text(encoding="utf-8")); OUT.mkdir(exist_ok=True)
    for p in a.prods:
        r = measure(p, board, a.step, not a.no_frames, not a.no_audio)
        (OUT / f"{p}.json").write_text(json.dumps(r, indent=1), encoding="utf-8")
        pic = r.get("picture", {}).get("all", {})
        print(f"{p}: {r['edit']['clips']} clips, luma {pic.get('luma')}, contrast {pic.get('contrast')}, sat {pic.get('sat')}, "
              f"vignette {pic.get('vignette')}, mix {r.get('sound', {}).get('mix')}, wpm {r.get('voice', {}).get('wpm')}", flush=True)


if __name__ == "__main__":
    main()
