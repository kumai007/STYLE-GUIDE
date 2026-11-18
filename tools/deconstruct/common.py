"""Shared helpers for the reference-deconstruction kit (see .claude/skills/ref-deconstruct/SKILL.md)."""
import json, time, urllib.request, urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]          # the render farm video folder
PROD = ROOT / "productions"
CATS = ["page-3d", "comments", "raw-footage", "title-card", "map", "layout", "glitch", "ui-typing", "text-card", "other"]


def workdir(prod):
    return PROD / prod / "01_reference" / "deconstruct"


def load_cfg(prod):
    return json.loads((workdir(prod) / "config.json").read_text(encoding="utf-8"))


def fps(cfg):
    return cfg["fps"][0] / cfg["fps"][1]


def api_url(cfg, path="board"):
    return f"http://127.0.0.1:{cfg['port']}/api/{path}?b={cfg['board']}"


def get_json(url):
    with urllib.request.urlopen(url) as r:
        return json.load(r)


def get_board(cfg):
    return get_json(api_url(cfg))


def mutate(cfg, fn, tries=6):
    """GET the board, let fn edit it in place (fn returns a summary, or None for 'nothing to do'), POST it.
    The server refuses a stale rev with 409; then we re-GET and re-apply fn. Never writes the json file."""
    for _ in range(tries):
        b = get_board(cfg)
        summary = fn(b)
        if summary is None:
            return None, b
        req = urllib.request.Request(api_url(cfg), data=json.dumps(b, ensure_ascii=False).encode("utf-8"),
                                     headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req) as r:
                res = json.load(r)
            return summary, res
        except urllib.error.HTTPError as e:
            if e.code != 409:
                raise SystemExit(f"POST failed: HTTP {e.code} {e.read()[:300]!r}")
            time.sleep(0.5)
    raise SystemExit("POST kept hitting 409 (board busy); try again")


NODE_W = {"video": 420, "clip": 320, "shot": 280, "point": 240}   # same as ref-annotator app.js
def box(n):
    """x0, y0, x1, y1 of a node as the board draws it (app.js nodeW/nodeH)."""
    w = NODE_W.get(n["type"], 300); sz = n.get("size") or [16, 9]
    h = 26 + (0 if n["type"] == "point" else round(w * sz[1] / sz[0])) + 44 + 2
    return n.get("x", 0), n.get("y", 0), n.get("x", 0) + w, n.get("y", 0) + h

def band(b, vid, count, per=12, colw=400, rowh=300, gap=100):
    """The video-1 layout: columns of `per` clips in time order, starting right of the video node (and right of the
    owner's own clips of that video), top-aligned with the video. Returns (layout, list of nodes it would overlap)."""
    v = next(n for n in b["nodes"] if n["id"] == vid)
    owner = [n for n in b["nodes"] if n.get("parent") == vid and not is_claude(n)]
    x0 = max(box(n)[2] for n in [v] + owner) + gap; y0 = v["y"]
    L = {"x0": x0, "y0": y0, "per": per, "colw": colw, "rowh": rowh}
    cols = max(1, -(-count // per))
    X1, Y1 = x0 + (cols - 1) * colw + NODE_W["clip"], y0 + (min(count, per) - 1) * rowh + 252
    hit = [n for n in b["nodes"] if n.get("parent") != vid and n["id"] != vid
           and (lambda a: a[0] < X1 + 30 and a[2] > x0 - 30 and a[1] < Y1 + 30 and a[3] > y0 - 30)(box(n))]
    return L, hit

def is_claude(n):
    return "claude" in (n.get("tags") or [])


def words(cfg):
    p = PROD / cfg["prod"] / "01_reference" / "audio" / "words_full.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else []


def quote(W, t0, t1, n=9):
    w = [x[0] for x in W if t0 <= x[1] < t1]
    return (" ".join(w[:n]) + (" ..." if len(w) > n else "")) if w else ""


def ts(sec):
    return f"{int(sec // 60):02d}:{sec % 60:05.2f}"


def now_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime())


def new_id(prefix):
    import os
    return f"{prefix}{int(time.time() * 1000):x}{os.urandom(2).hex()}"
