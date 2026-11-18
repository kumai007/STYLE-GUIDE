#!/usr/bin/env python3
"""make_transitions.py <VID> [NN ...] [--force] [--dry] [--small]

Renders the Disturbing-Dose-style case transition (datamosh glitch -> big glossy red case number on the incoming case's
footage, _engine/src/dev/CaseNumberTransition.tsx, measurements in _ref/DisturbingDose/STYLE.md) for each case of a
countdown video:  <video>/build/CASEnn/out/<KEY>_T.mp4   (KEY = DCnn / INnn, number = nn).
_tools/assemble.sh puts <KEY>_T.mp4 right before <KEY>.mp4 when it exists.

Per case (only once that case's master out/<KEY>.mp4 exists):
  outgoing = last frame of the piece before it (CASE nn-1 master; CASE00 intro for case 01) - optional
  incoming = the case's first footage shot after its title: the first `src={X} from={t}` video in _engine/src/cases/<KEY>.tsx
             (X resolved through the file's string constants, e.g. M = GR + "main.mp4"), else graded/main.mp4 at 0, else the
             largest graded/*.mp4. Override: build/CASEnn/transition.json {"src": "graded/foo.mp4", "from": 12.3}.
  Re-renders when the case master, the previous master or the override is newer than <KEY>_T.mp4 (or --force).
Renders take a slot in C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/render_slots (3 slots shared with render_case.sh), concurrency 4, 75 frames each;
--small skips the slot queue and renders at concurrency 2 (a 2.5 s clip, light enough to run beside the case renders).
Only DC and IN (the iceberg video AM uses level entries, not numbers).
"""
import json, os, re, subprocess, sys, time, shutil

I = "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg"
E = f"{I}/_engine"
VIDS = {"DC": "05_Dashcam", "IN": "07_Incidents"}
SLOTS = "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/scratch/render_slots"


def sh(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f],
                                capture_output=True, text=True).stdout.strip() or 0)


def resolve_consts(code):
    """string constants like  C = "case/", GR = C + "graded/", M = GR + "main.mp4"  ->  {name: value}"""
    env = {}
    for _ in range(3):
        for name, expr in re.findall(r'\b([A-Za-z_]\w*)\s*=\s*((?:[A-Za-z_]\w*|"[^"\n]*")(?:\s*\+\s*(?:[A-Za-z_]\w*|"[^"\n]*"))*)\s*[,;]', code):
            parts = [p.strip() for p in expr.split("+")]
            vals = []
            for p in parts:
                if p.startswith('"'):
                    vals.append(p[1:-1])
                elif p in env:
                    vals.append(env[p])
                else:
                    vals = None
                    break
            if vals is not None:
                env[name] = "".join(vals)
    return env


def incoming(vid, nn, key, cdir):
    ov = f"{cdir}/transition.json"
    if os.path.exists(ov):
        j = json.load(open(ov))
        return os.path.join(cdir, j["src"]), float(j.get("from", 0)), "transition.json"
    code_f = f"{E}/src/cases/{key}.tsx"
    if os.path.exists(code_f):
        code = open(code_f).read()
        env = resolve_consts(code)
        for m in re.finditer(r'src=\{\s*([^}]+?)\s*\}[^>]*?\b(?:from|startFrom)=\{\s*(?:F\()?\s*([\d.]+)\s*\)?\s*\}', code):
            expr, t = m.group(1), float(m.group(2))
            parts = [p.strip() for p in expr.split("+")]
            try:
                path = "".join(p[1:-1] if p.startswith('"') else env[p] for p in parts)
            except KeyError:
                continue
            if not path.endswith(".mp4") or not path.startswith("case/"):
                continue
            f = os.path.join(cdir, path[len("case/"):])
            if os.path.exists(f):
                return f, t, f"{key}.tsx first video shot"
    g = f"{cdir}/graded/main.mp4"
    if os.path.exists(g):
        return g, 0.0, "graded/main.mp4"
    vids = [os.path.join(cdir, "graded", x) for x in os.listdir(f"{cdir}/graded")] if os.path.isdir(f"{cdir}/graded") else []
    vids = [v for v in vids if v.endswith(".mp4")]
    if vids:
        return max(vids, key=os.path.getsize), 0.0, "largest graded mp4"
    return None, 0.0, "none"


def take_slot():
    os.makedirs(SLOTS, exist_ok=True)
    while True:
        if not os.path.exists("/tmp/iceberg_pause"):
            for s in (1, 2, 3):
                try:
                    os.mkdir(f"{SLOTS}/s{s}")
                    return f"{SLOTS}/s{s}"
                except FileExistsError:
                    pass
        time.sleep(15)


def make(vid, nn, force=False, dry=False, small=False):
    D = f"{I}/{VIDS[vid]}"
    key = f"{vid}{nn:02d}"
    cdir = f"{D}/build/CASE{nn:02d}"
    master = f"{cdir}/out/{key}.mp4"
    out = f"{cdir}/out/{key}_T.mp4"
    if not os.path.exists(master):
        return f"{key}: no master yet, skipped"
    prev = f"{D}/build/CASE{nn - 1:02d}/out/{vid}{nn - 1:02d}.mp4"
    prev = prev if os.path.exists(prev) else None
    src, t0, why = incoming(vid, nn, key, cdir)
    if not src:
        return f"{key}: no footage found, skipped"
    deps = [master] + ([prev] if prev else []) + ([f"{cdir}/transition.json"] if os.path.exists(f"{cdir}/transition.json") else [])
    if not force and os.path.exists(out) and all(os.path.getmtime(out) > os.path.getmtime(d) for d in deps):
        return f"{key}: up to date"
    t0 = max(0.0, min(t0, dur(src) - 3.0))
    msg = f"{key}: number {nn}, in = {os.path.relpath(src, D)} @ {t0:.2f}s ({why}), out frame = {os.path.relpath(prev, D) if prev else 'none'}"
    if dry:
        return msg + "  [dry]"
    # job public dir: the shared font/SFX + this case's 3 s of footage, its mosh frames and the outgoing frame
    P = f"{E}/pubs/_T/{key}"
    shutil.rmtree(P, ignore_errors=True)
    os.makedirs(f"{P}/job/m")
    shutil.copytree(f"{E}/public/case_t", f"{P}/t")  # Windows: copy, no symlink
    sh(["ffmpeg", "-v", "error", "-y", "-ss", f"{t0:.3f}", "-i", src, "-t", "3.2", "-an", "-vf",
        "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p",
        "-c:v", "libx264", "-crf", "12", "-preset", "fast", f"{P}/job/in.mp4"])
    sh(["ffmpeg", "-v", "error", "-y", "-i", f"{P}/job/in.mp4", "-frames:v", "14", "-vf", "scale=960:540", "-q:v", "2",
        "-start_number", "0", f"{P}/job/m/in_%03d.jpg"])
    props = {"number": nn, "src": "job/in.mp4", "from": 0, "moshDir": "job/m", "moshN": 14, "sfx": "t/case_t.wav",
             "font": "t/ArialRoundedBold.ttf", "seed": 7 + nn * 13}
    if prev:
        sh(["ffmpeg", "-v", "error", "-y", "-sseof", "-0.25", "-i", prev, "-update", "1", "-q:v", "2", f"{P}/job/out.png"])
        props["outFrame"] = "job/out.png"
    raw = f"{cdir}/out/{key}_T_raw.mp4"
    slot = None if small else take_slot()
    try:
        sh([f"{E}/node_modules/.bin/remotion" + (".cmd" if os.name == "nt" else ""), "render", "src/entries/CaseT.tsx", "CaseT", raw, f"--public-dir={P}",
            f"--props={json.dumps(props)}", "--gl=angle", f"--concurrency={2 if small else 4}", "--crf=16", "--log=error",
            "--timeout=300000"], cwd=E, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    finally:
        if slot:
            os.rmdir(slot)
    # same audio format as the masters (render_case: AAC 44.1 kHz 256k); picture copied
    sh(["ffmpeg", "-v", "error", "-y", "-i", raw, "-c:v", "copy", "-c:a", "aac", "-ar", "44100", "-b:a", "256k", out])
    os.remove(raw)
    json.dump({"number": nn, "in": src, "from": t0, "why": why, "out_frame_from": prev, "made": time.ctime()},
              open(f"{cdir}/out/{key}_T.json", "w"), indent=1)
    return msg + f"  -> {os.path.relpath(out, D)}"


def main():
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    force, dry, small = "--force" in sys.argv, "--dry" in sys.argv, "--small" in sys.argv
    if not a or a[0] not in VIDS:
        print(__doc__)
        sys.exit(1)
    vid = a[0]
    D = f"{I}/{VIDS[vid]}/build"
    nns = [int(x) for x in a[1:]] or sorted(int(d[4:]) for d in os.listdir(D) if re.fullmatch(r"CASE\d\d", d) and d not in ("CASE00", "CASE99"))
    for nn in nns:
        try:
            print(make(vid, nn, force, dry, small), flush=True)
        except subprocess.CalledProcessError as e:
            print(f"{vid}{nn:02d}: FAILED {e}", flush=True)


if __name__ == "__main__":
    main()
