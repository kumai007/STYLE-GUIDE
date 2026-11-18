"""post.py PROD [--from FRAME] [--end FRAME] [--dry]

Turns the spec files in 01_reference/deconstruct/spec*.py into claude clips on the board (via the API, rev-guarded).
A spec file holds  C = [[start_frame, CAT, mg, "title", "note", "why"], ...]  using the category constants below.
Each clip runs from its start to the next start - 1 (the last one to --end, default the video's last frame).
--from/--end limit a post to one range, so two agents can each work on part of one video without touching the other's clips.
Safe to re-run: clips are matched by start frame and only claude nodes of this video are touched.
A claude node the user edited since the last post (tracked in posted.json) is left alone and reported."""
import argparse, glob, hashlib, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from common import CATS, workdir, load_cfg, fps, mutate, is_claude, words, quote, new_id, now_iso

NS = dict(zip("R P C M T L G U X O".split(), ["raw-footage", "page-3d", "comments", "map", "title-card", "layout",
                                              "glitch", "ui-typing", "text-card", "other"]))
ap = argparse.ArgumentParser(); ap.add_argument("prod"); ap.add_argument("--from", dest="frm", type=int); ap.add_argument("--end", type=int); ap.add_argument("--dry", action="store_true")
ap.add_argument("--col0", type=int, default=0, help="first layout column for new nodes (split agents: B uses 20)")
A = ap.parse_args(); WD = workdir(A.prod); cfg = load_cfg(A.prod); FPS = fps(cfg); VID = cfg["video_id"]
END = A.end if A.end is not None else cfg["N"] - 1
FROM = A.frm if A.frm is not None else cfg["start"]

spec = []
for f in sorted(glob.glob(str(WD / "spec*.py"))):
    g = dict(NS); exec(compile(Path(f).read_text(encoding="utf-8"), f, "exec"), g)
    spec += [list(c) + [Path(f).name] for c in g["C"]]
spec.sort(key=lambda c: c[0])
err = []
starts = [c[0] for c in spec]
if len(set(starts)) != len(starts): err.append(f"duplicate starts {sorted({s for s in starts if starts.count(s) > 1})}")
for c in spec:
    if len(c) != 7: err.append(f"{c[-1]}: entry at {c[0]} needs 6 fields"); continue
    if c[1] not in CATS: err.append(f"{c[-1]}: bad category {c[1]!r} at {c[0]}")
    if c[1] == "raw-footage" and c[2]: err.append(f"{c[-1]}: raw-footage marked motion graphic at {c[0]}")
    if not all(str(x).strip() for x in c[3:6]): err.append(f"{c[-1]}: empty title/note/why at {c[0]}")
spec = [c for c in spec if FROM <= c[0] <= END]
if not spec or spec[0][0] != FROM: err.append(f"first clip in range starts at {spec[0][0] if spec else None}, expected {FROM}")
if err: raise SystemExit("spec problems:\n  " + "\n  ".join(err))
W = words(cfg)
want = {}
for i, c in enumerate(spec):
    a = c[0]; e = min((spec[i + 1][0] - 1) if i + 1 < len(spec) else END, END)
    q = quote(W, a / FPS, (e + 1) / FPS)
    want[a] = dict(sf_in=a, sf_out=e, pf_in=a, pf_out=e, title=c[3], note=c[4],
                   purpose=(f'VO: "{q}" ' if q else "No narration here. ") + c[5],
                   tags=(["motion graphic"] if c[2] else []) + ["claude", c[1]], _i=i)

KEYS = ["sf_in", "sf_out", "pf_in", "pf_out", "title", "note", "purpose", "tags"]
def h(n): return hashlib.sha1(json.dumps([n.get(k) for k in KEYS], ensure_ascii=False).encode()).hexdigest()
PJ = WD / "posted.json"; posted = json.loads(PJ.read_text()) if PJ.exists() else {}
report = {}

def apply(b):
    L = cfg["layout"]; nodes = b["nodes"]
    mine = {n["sf_in"]: n for n in nodes if n["type"] == "clip" and n.get("parent") == VID and is_claude(n)}
    add = upd = dele = 0; kept = []
    for a, w in want.items():
        n = mine.get(a)
        if n is None:
            i = A.col0 * L["per"] + w["_i"]; nid = new_id("c"); t = now_iso()
            nodes.append({"id": nid, "parent": VID, "src": cfg["src"], "fps": cfg["fps"], **{k: w[k] for k in KEYS},
                          "created": t, "updated": t, "type": "clip", "status": "ready", "size": cfg["size"],
                          "x": L["x0"] + (i // L["per"]) * L["colw"], "y": L["y0"] + (i % L["per"]) * L["rowh"], "ver": 1})
            b["edges"].append({"id": new_id("e"), "from": VID, "to": nid, "kind": "derived"}); add += 1
        elif h(n) != h(w):
            if n["id"] in posted and posted[n["id"]] != h(n): kept.append(a); continue      # user edited it
            n.update({k: w[k] for k in KEYS}); n["updated"] = now_iso(); upd += 1
    gone = [n for a, n in mine.items() if a not in want and FROM <= a <= END]
    for n in gone:
        if n["id"] in posted and posted[n["id"]] != h(n): kept.append(n["sf_in"]); continue
        nodes.remove(n); b["edges"] = [e for e in b["edges"] if e["to"] != n["id"] and e["from"] != n["id"]]; dele += 1
    report.update(add=add, update=upd, delete=dele, kept_user_edits=kept)
    if A.dry or not (add or upd or dele): return None
    return report

mutate(cfg, apply)
from common import get_board
b = get_board(cfg)
if not A.dry:                                  # merge: another agent may own another range of this video
    posted = json.loads(PJ.read_text()) if PJ.exists() else {}
    ids = {n["id"] for n in b["nodes"]}
    posted = {k: v for k, v in posted.items() if k in ids}
    posted.update({n["id"]: h(n) for n in b["nodes"] if n["type"] == "clip" and n.get("parent") == VID
                   and is_claude(n) and FROM <= n["sf_in"] <= END})
    PJ.write_text(json.dumps(posted), encoding="utf-8")
print(f"{A.prod}: {len(want)} clips in spec (frames {FROM}..{END}); {report}; board rev {b['rev']}"
      + (" (dry run, nothing written)" if A.dry else ""))
