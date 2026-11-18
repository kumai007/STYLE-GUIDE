"""Plan an INTRO teaser or an OUTRO as build/<intro|outro>/plan.json in case_premiere's format.
usage: python -I section_plan.py VIDEO_DIR intro VO_ID
       python -I section_plan.py VIDEO_DIR outro VO_ID "TAG@clause first word index" ...   e.g. JFX@0 BLT@17 SPL@27 URB@37
intro: one shot per case, the loudest window of that case's raw cues (cover cues and --skip ids left out), in case order,
       picture only, cut evenly across the narration (rules.md 1.1). Title text goes on afterwards.
outro: one shot per clause group; each TAG's shot is the measured shot nearest that source's first cue that sits outside
       every used range and every cue (closers: calmest such shot). Picture runs to VO end + TAIL."""
import json, subprocess, sys
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from case_plan import vo_words  # noqa: E402

FR = 1001 / 30000
ROOT = Path(__file__).resolve().parents[2]
VO_AT, TAIL, WIN = 0.5, 1.0, 2.2


def fr(t): return round(t / FR) * FR


def src(V, tag): return V / "sources" / ("FEF_v2.mp4" if tag == "FEF" and (V / "sources" / "FEF_v2.mp4").exists() else f"{tag}.mp4")


def meas(V, tag): return json.load(open(V / "qa" / "measure" / f"{tag}.json", encoding="utf-8"))


def rel(p): return str(Path(p).resolve().relative_to(ROOT))


def cue_ranges(V, job):
    """{case_id: [(tag, in, out)]} raw picture ranges: plan.json when built, else the cut sheet window."""
    out, skip = {}, set(sys.argv[sys.argv.index("--skip") + 1].split(",")) if "--skip" in sys.argv else set()
    for c in job["cases"]:
        pp = V / "build" / c["id"] / "plan.json"
        if pp.exists():
            rs = [(i["tag"], i["in"], i["out"]) for i in json.load(open(pp, encoding="utf-8"))["items"]
                  if i["kind"] == "raw" and not i.get("cover") and i["id"] not in skip]
        else:
            rs = [(b["tag"], b["start"], b["end"]) for b in job["blocks"]
                  if b["kind"] == "raw" and b["case_id"] == c["id"] and not b["flags"].get("cover") and b["id"] not in skip]
        out[c["id"]] = rs
    return out


def loudest(V, tag, a, b, m):
    """best WIN-second window inside [a+0.5, b-0.5] by RMS that sits in one visible measured shot."""
    pcm = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-ss", f"{a}", "-t", f"{b - a}", "-i", str(src(V, tag)),
                          "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32)
    best = []
    for t in np.arange(0.5, (b - a) - 0.5 - WIN, 0.2):
        seg = x[int(t * 8000):int((t + WIN) * 8000)]
        if len(seg): best.append((float(np.sqrt((seg ** 2).mean())), a + t))
    floor = m["probe"].get("black_floor", 16)
    for rms, t in sorted(best, reverse=True):
        sh = next((s for s in m["shots"] if s["start"] <= t and s["end"] >= t + WIN), None)
        if sh and sh["luma_mean"] - floor >= 12: return t, rms
    return None, 0


def free_shot(V, tag, near, need, job, calm=False):
    m = meas(V, tag)
    busy = [(b["start"], b["end"]) for b in job["blocks"] if b["kind"] == "raw" and b["tag"] == tag]
    for pp in (V / "build").glob("*/plan.json"):
        p = json.load(open(pp, encoding="utf-8"))
        busy += [tuple(r) for r in p.get("used_ranges", [])] + [(i["in"], i["out"]) for i in p["items"] if i.get("tag") == tag]
    floor = m["probe"].get("black_floor", 16)
    ok = []
    for s in m["shots"]:
        a, b = max(s["start"], 15.0) + 0.3, s["end"] - 0.3
        if b - a < need or s["luma_mean"] - floor < 15 or s.get("flags"): continue
        for x0, x1 in sorted(busy):  # slide the window past anything used
            if x0 < a + need and x1 > a: a = x1 + 0.3
        if b - a >= need and not any(x0 < a + need and x1 > a for x0, x1 in busy):
            ok.append((s["motion_mean"] if calm else abs(a - near), round(a, 3), m["probe"]["fps"]))
    if not ok: raise SystemExit(f"no free {need:.1f}s shot in {tag}")
    return sorted(ok)[0][1:]


def main():
    V, sec, vid = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
    job = json.load(open(V / "job.json", encoding="utf-8"))
    vo = V / "narration" / "tight" / f"{vid}_t.wav"
    vdur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(vo)],
                                capture_output=True, text=True).stdout)
    items = [{"kind": "vo", "id": vid, "track": "A2", "file": rel(vo), "in": 0.0, "out": round(vdur, 4),
              "start": VO_AT, "end": round(VO_AT + vdur, 4)}]
    if sec == "intro":
        end = fr(VO_AT + vdur + 0.3)
        picks = []
        for cid, rs in cue_ranges(V, job).items():
            cand = [(loudest(V, t, a, b, meas(V, t)), t) for t, a, b in rs]
            (t0, rms), tag = max(cand, key=lambda c: c[0][1])
            if t0 is None: raise SystemExit(f"{cid}: no visible loud window")
            picks.append((tag, t0))
        n = len(picks)
        for k, (tag, t0) in enumerate(picks):
            a, b = fr(k * end / n), fr((k + 1) * end / n)
            items.append({"kind": "broll", "track": "V1", "tag": tag, "file": rel(src(V, tag)), "src_fps": meas(V, tag)["probe"]["fps"],
                          "in": round(t0, 4), "out": round(t0 + b - a, 4), "start": round(a, 4), "end": round(b, 4)})
    else:
        w = vo_words(V, vid)
        groups = [(g.split("@")[0], int(g.split("@")[1])) for g in sys.argv[4:] if "@" in g]
        end = fr(VO_AT + vdur + TAIL)
        for k, (tag, wi) in enumerate(groups):
            a = 0.0 if k == 0 else fr(VO_AT + w[wi]["s"])
            b = end if k == len(groups) - 1 else fr(VO_AT + w[groups[k + 1][1]]["s"])
            near = min((x["start"] for x in job["blocks"] if x["kind"] == "raw" and x["tag"] == tag), default=0)
            t0, fps = free_shot(V, tag, near, b - a + 0.5, job, calm=(k == len(groups) - 1))
            items.append({"kind": "broll", "track": "V1", "tag": tag, "file": rel(src(V, tag)), "src_fps": fps,
                          "in": t0, "out": round(t0 + b - a, 4), "start": round(a, 4), "end": round(b, 4),
                          "text": " ".join(x["w"] for x in w[wi:(groups[k + 1][1] if k + 1 < len(groups) else len(w))])})
    B = V / "build" / sec; B.mkdir(parents=True, exist_ok=True)
    plan = {"case": sec, "number": 0, "name": sec.upper(), "prefix": sec, "cues": [], "items": items, "srt": None,
            "duration": round(max(i["end"] for i in items), 4)}
    json.dump(plan, open(B / "plan.json", "w", encoding="utf-8"), indent=1)
    for i in items: print(i["kind"], i.get("tag", ""), f"{i['start']:.2f}-{i['end']:.2f}", "in", i["in"], i.get("text", "")[:70])


if __name__ == "__main__":
    main()
