#!/usr/bin/env python3
"""ref-annotator board - an infinite canvas of reference videos, cut clips and screenshots.

    python tools/ref-annotator/serve.py [--port 8765] [--no-browser]

Stdlib only + ffmpeg/ffprobe. Binds 127.0.0.1. Reads only productions/*/01_reference/source/*.mp4
and productions/*/01_reference/annotations/{clips,frames,posters}/, writes only under
productions/<slug>/01_reference/annotations/ and productions/_boards/. ffmpeg gets argument
lists, never a shell.
"""
import argparse, base64, json, os, queue, re, shutil, subprocess, sys, threading, time, urllib.request
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

HERE = Path(__file__).resolve().parent
PROJECT = Path(os.environ.get("PVS_PROJECT", HERE.parent.parent))
PROD = Path(os.environ.get("PVS_ROOT", PROJECT / "productions")).resolve()
BOARDS = PROD / "_boards"
TAGS_FILE = HERE / "custom_tags.json"
STATIC = {"/": ("index.html", "text/html; charset=utf-8"),
          "/app.css": ("app.css", "text/css; charset=utf-8")}
for _js in ("common.js", "app.js", "focus.js", "draw.js", "grid.js", "thumbs.js", "scene.js", "vendor/pixi.min.js"):
    STATIC["/" + _js] = (_js, "text/javascript; charset=utf-8")
ID_RE = re.compile(r"^[A-Za-z0-9_-]{1,64}$")
BOARD_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{0,40}$")
LOCK = threading.Lock()            # board + annotations writes
INFO, JOBS, PLOCK = {}, {}, {}
CUTS = threading.Semaphore(2)      # at most two ffmpeg cuts at once
DEFAULT_BOARD = "farrell"


class Refused(Exception):
    pass


class Stale(Exception):
    """A save based on an older copy of the board than the one on disk (HTTP 409)."""


# ---------------------------------------------------------------- paths (the guard)
def _rel_parts(rel):
    if not rel or "\x00" in rel or not isinstance(rel, str):
        raise Refused("no path")
    p = (PROD / rel).resolve()
    try:
        parts = p.relative_to(PROD).parts
    except ValueError:
        raise Refused("outside productions/")
    if not parts or parts[0].startswith("_"):
        raise Refused("not a production")
    return p, parts


def source_path(rel):
    """'<slug>/01_reference/source/<name>.mp4' -> Path, else Refused."""
    p, parts = _rel_parts(rel)
    if len(parts) != 4 or parts[1:3] != ("01_reference", "source") or p.suffix.lower() != ".mp4":
        raise Refused("not a reference source mp4")
    if not p.is_file():
        raise Refused("no such video")
    return p


def media_path(rel):
    """A source mp4 or a cut clip mp4 (<slug>/01_reference/annotations/clips/<id>.mp4)."""
    p, parts = _rel_parts(rel)
    if len(parts) == 5 and parts[1:4] == ("01_reference", "annotations", "clips") \
            and p.suffix.lower() == ".mp4":
        if not p.is_file():
            raise Refused("no such clip")
        return p
    return source_path(rel)


def image_path(rel, must_exist=True):
    p, parts = _rel_parts(rel)
    if len(parts) != 5 or parts[1:3] != ("01_reference", "annotations") \
            or parts[3] not in ("frames", "posters") or p.suffix.lower() not in (".jpg", ".png"):
        raise Refused("not an annotation image")
    if must_exist and not p.is_file():
        raise Refused("no such image")
    return p


def rel(p):
    return str(Path(p).resolve().relative_to(PROD)).replace("\\", "/")


def is_clip(p):
    return p.parent.name == "clips"


def prod_dir(p):
    return p.parents[3] if is_clip(p) else p.parents[2]   # productions/<slug>


def ann_dir(p):
    return prod_dir(p) / "01_reference" / "annotations"


def ann_file(vp):
    """annotations.json; annotations_<stem>.json only if the production has several sources."""
    many = len(list(vp.parent.glob("*.mp4"))) > 1
    return ann_dir(vp) / (f"annotations_{vp.stem}.json" if many else "annotations.json")


def check_id(i):
    if not isinstance(i, str) or not ID_RE.match(i):
        raise Refused("bad id")
    return i


# ---------------------------------------------------------------- media
def probe(vp):
    key = (str(vp), vp.stat().st_mtime)
    if key in INFO:
        return INFO[key]
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "stream=codec_type,r_frame_rate,avg_frame_rate,width,height,duration,"
                          "nb_frames,start_time:format=duration", "-of", "json", str(vp)],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    s = next(x for x in j["streams"] if x.get("codec_type") == "video")
    num, den = (int(x) for x in (s.get("r_frame_rate") or s["avg_frame_rate"]).split("/"))
    dur = float(s.get("duration") or j["format"]["duration"])
    INFO[key] = {"fps": num / den, "fps_num": num, "fps_den": den, "duration": dur,
                 "width": int(s["width"]), "height": int(s["height"]),
                 "start_time": float(s.get("start_time") or 0),
                 "audio": any(x.get("codec_type") == "audio" for x in j["streams"]),
                 "nb_frames": int(s["nb_frames"]) if s.get("nb_frames") else round(dur * num / den)}
    return INFO[key]


def clip_meta(cp):
    f = cp.with_suffix(".json")
    if not f.is_file():
        raise Refused("clip has no sidecar")
    return json.loads(f.read_text(encoding="utf-8"))


def to_source(p, frame):
    """(media path, local frame) -> (source path, source frame). Clips map through their sidecar."""
    frame = int(frame)
    if not is_clip(p):
        return p, frame
    m = clip_meta(p)
    n = m["sf_out"] - m["sf_in"] + 1
    if not 0 <= frame < n:
        raise ValueError(f"frame {frame} outside clip (0..{n - 1})")
    return source_path(m["src"]), m["sf_in"] + frame


def ftime(i, n):
    return n * i["fps_den"] / i["fps_num"]


def grab(vp, frame, name=None, direct=False):
    """Exact frame at full resolution. A clip maps to its ORIGINAL source frame unless direct.
    Input-seek half a frame before N's pts: accurate seek keeps the first frame with pts >= target,
    which is N; showinfo confirms."""
    src, sf = (vp, int(frame)) if direct else to_source(vp, frame)
    i = probe(src)
    sf = max(0, min(sf, i["nb_frames"] - 1))
    t = ftime(i, sf)
    ss = max(0.0, t - 0.5 / i["fps"])
    d = ann_dir(vp) / "frames"; d.mkdir(parents=True, exist_ok=True)
    name = f"{check_id(name)}.jpg" if name else f"{t:08.3f}.jpg"
    out = d / name; tmp = d / ("~" + name)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{ss:.6f}", "-copyts",
                        "-i", str(src), "-frames:v", "1", "-vf", "showinfo", "-q:v", "2",
                        "-f", "image2", str(tmp)], capture_output=True, text=True)
    if r.returncode or not tmp.exists():
        raise RuntimeError("ffmpeg failed: " + (r.stderr.strip().splitlines() or ["?"])[-1][:300])
    os.replace(tmp, out)
    m = re.search(r"pts_time:\s*([\d.]+)", r.stderr)
    pts = float(m.group(1)) if m else None
    got = round((pts - i["start_time"]) * i["fps"]) if pts is not None else None
    return {"file": name, "path": rel(out), "src": rel(src), "frame": int(frame), "sf": sf,
            "t": round(t, 6), "pts": pts, "frame_grabbed": got, "exact": got == sf,
            "w": i["width"], "h": i["height"]}


def poster(vp, frame=None):
    """Small cached poster jpg: the middle frame of a clip, ~5% into a source, or source frame `frame`
    (a clip node is just a range on its source, so its poster is one source frame)."""
    d = ann_dir(vp) / "posters"; d.mkdir(parents=True, exist_ok=True)
    tag = f"_f{frame}" if frame is not None else ""
    out = d / (("clipmid_" if is_clip(vp) else "src_") + vp.stem + tag + ".jpg")
    with PLOCK.setdefault(str(out), threading.Lock()):
        if out.exists() and out.stat().st_mtime >= vp.stat().st_mtime:
            return out
        i = probe(vp)
        t = i["duration"] * 0.5 if is_clip(vp) else min(30.0, i["duration"] * 0.05)
        if frame is not None:
            t = (max(0, min(i["nb_frames"] - 1, frame)) + 0.5) * i["fps_den"] / i["fps_num"]
        tmp = d / ("~" + out.name)
        r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{t:.3f}", "-i", str(vp),
                            "-frames:v", "1", "-vf", "scale=480:-2", "-q:v", "4", "-f", "image2", str(tmp)],
                           capture_output=True, text=True)
        if r.returncode or not tmp.exists():
            raise RuntimeError("poster failed: " + (r.stderr.strip().splitlines() or ["?"])[-1][:200])
        os.replace(tmp, out)
    return out


# ---------------------------------------------------------------- thumbnails (64x36 jpg + mean colour, for the WebGL board)
THQ = queue.Queue(); THQ_SEEN = set(); THQ_LOCK = threading.Lock()


def _thumb_from(img, out):
    """64x36 jpg + 3-byte mean colour from one ffmpeg run. Returns (jpg_path, rgb_path)."""
    rgb = out.with_suffix(".rgb")
    if out.exists() and rgb.exists() and out.stat().st_mtime >= img.stat().st_mtime:
        return out, rgb
    out.parent.mkdir(parents=True, exist_ok=True)
    tj, tr = out.with_name("~" + out.name), rgb.with_name("~" + rgb.name)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(img), "-filter_complex",
                        "[0]scale=64:36:flags=area,split[a][b];[b]scale=1:1:flags=area[c]",
                        "-map", "[a]", "-q:v", "5", "-f", "image2", str(tj),
                        "-map", "[c]", "-f", "rawvideo", "-pix_fmt", "rgb24", str(tr)], capture_output=True, text=True)
    if r.returncode or not tj.exists() or not tr.exists() or tr.stat().st_size != 3:
        raise RuntimeError("thumb failed: " + (r.stderr.strip().splitlines() or ["?"])[-1][:200])
    os.replace(tr, rgb); os.replace(tj, out)
    return out, rgb


def thumb_paths(k):
    """(source file, thumb jpg path) for key k; no work done. Raises on a bad key."""
    if "img" in k:
        p = image_path(k["img"]); ver = int(k.get("ver") or 0)
        return p, p.parent / "thumbs" / f"{p.stem}_v{ver}.jpg"
    vp = media_path(k.get("v")); f = k.get("f")
    f = int(f) if f is not None else None
    tag = f"_f{f}" if f is not None else ""
    return vp, ann_dir(vp) / "thumbs" / (("clipmid_" if is_clip(vp) else "src_") + vp.stem + tag + ".jpg")


def make_thumb(k):
    src, out = thumb_paths(k)
    img = src if "img" in k else poster(src, int(k["f"]) if k.get("f") is not None else None)
    return _thumb_from(img, out)


def _thumb_worker():
    while True:
        k = THQ.get()
        try:
            make_thumb(k)
        except Exception:
            pass                                   # stays a miss; the client retries while it is on screen
        finally:
            with THQ_LOCK:
                THQ_SEEN.discard(json.dumps(k, sort_keys=True))


for _ in range(2):
    threading.Thread(target=_thumb_worker, daemon=True).start()


def thumbs_batch(body):
    keys = body.get("keys") if isinstance(body, dict) else None
    if not isinstance(keys, list) or len(keys) > 256:
        raise ValueError("keys: list of at most 256")
    head, blobs, off = [], [], 0
    for i, k in enumerate(keys):
        try:
            if not isinstance(k, dict):
                raise ValueError("key must be an object")
            src, out = thumb_paths(k); rgb = out.with_suffix(".rgb")
            if not (out.is_file() and rgb.is_file() and out.stat().st_mtime >= src.stat().st_mtime):
                sk = json.dumps(k, sort_keys=True)
                with THQ_LOCK:
                    if sk not in THQ_SEEN:
                        THQ_SEEN.add(sk); THQ.put(k)
                head.append({"k": i, "miss": True}); continue
            h = {"k": i, "c": list(rgb.read_bytes()[:3])}
            if not body.get("colors"):
                b = out.read_bytes(); h.update(off=off, len=len(b)); blobs.append(b); off += len(b)
            head.append(h)
        except Exception:
            head.append({"k": i, "miss": True})
    hj = json.dumps(head).encode()
    return len(hj).to_bytes(4, "big") + hj + b"".join(blobs)


def start_cut(vp, fin, fout, cid):
    """Cut local frames fin..fout (inclusive) of a source OR clip into clips/<cid>.mp4. Always cuts
    from the ORIGINAL source (one generation, exact mapping). Returns the job dict at once."""
    check_id(cid)
    src, sf_in = to_source(vp, min(int(fin), int(fout)))
    _, sf_out = to_source(vp, max(int(fin), int(fout)))
    i = probe(src)
    sf_out = min(sf_out, i["nb_frames"] - 1)
    if sf_out < sf_in:
        raise ValueError("empty range")
    out_dir = ann_dir(src) / "clips"; out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{cid}.mp4"
    meta = {"id": cid, "src": rel(src), "sf_in": sf_in, "sf_out": sf_out, "frames": sf_out - sf_in + 1,
            "fps_num": i["fps_num"], "fps_den": i["fps_den"],
            "src_t_in": round(ftime(i, sf_in), 6), "src_t_out": round(ftime(i, sf_out + 1), 6),
            "duration": round(ftime(i, sf_out - sf_in + 1), 6), "file": rel(out)}
    with LOCK:
        j = JOBS.get(cid)
        if j and j["status"] in ("queued", "running"):
            return j
        side = out.with_suffix(".json")
        if out.is_file() and side.is_file():
            old = json.loads(side.read_text(encoding="utf-8"))
            if (old.get("src"), old.get("sf_in"), old.get("sf_out")) == (meta["src"], sf_in, sf_out):
                JOBS[cid] = dict(meta, status="done", pct=100)
                return JOBS[cid]
        JOBS[cid] = j = dict(meta, status="queued", pct=0)
    threading.Thread(target=_cut, args=(src, i, out, j), daemon=True).start()
    return j


def _cut(src, i, out, j):
    with CUTS:
        j["status"] = "running"
        n = j["frames"]; fps = i["fps"]
        ss = max(0.0, ftime(i, j["sf_in"]) - 0.5 / fps)
        half = ftime(i, j["sf_in"]) - ss
        tmp = out.with_name("~" + out.name)
        args = ["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{ss:.6f}", "-i", str(src),
                "-map", "0:v:0", "-frames:v", str(n), "-vf", "setpts=PTS-STARTPTS",
                "-fps_mode", "cfr", "-r", f"{i['fps_num']}/{i['fps_den']}",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p"]
        if i["audio"]:
            args += ["-map", "0:a:0?", "-af",
                     f"atrim=start={half:.6f}:duration={n / fps:.6f},asetpts=PTS-STARTPTS",
                     "-c:a", "aac", "-b:a", "192k"]
        args += ["-movflags", "+faststart", "-progress", "pipe:1", "-nostats", "-f", "mp4", str(tmp)]
        try:
            pr = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            err = []
            t = threading.Thread(target=lambda: err.extend(pr.stderr.readlines()), daemon=True); t.start()
            for line in pr.stdout:
                if line.startswith("frame="):
                    try:
                        j["pct"] = min(99, round(100 * int(line[6:]) / n))
                    except ValueError:
                        pass
            pr.wait(); t.join(2)
            if pr.returncode or not tmp.exists():
                raise RuntimeError("ffmpeg: " + ("".join(err).strip().splitlines() or ["?"])[-1][:300])
            got = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_packets",
                                  "-show_entries", "stream=nb_read_packets", "-of", "csv=p=0", str(tmp)],
                                 capture_output=True, text=True).stdout.strip()
            j["frames_written"] = int(got) if got.isdigit() else None
            os.replace(tmp, out)
            side = {k: j[k] for k in ("id", "src", "sf_in", "sf_out", "frames", "fps_num", "fps_den",
                                      "src_t_in", "src_t_out", "duration", "file", "frames_written")}
            side["created"] = time.strftime("%Y-%m-%dT%H:%M:%S")
            write_atomic(out.with_suffix(".json"), json.dumps(side, indent=1))
            j["status"], j["pct"] = "done", 100
        except Exception as e:
            j["status"], j["error"] = "error", f"{type(e).__name__}: {e}"


def trash(paths):
    """Move derived files (clip mp4+json, frame jpg/png) to annotations/trash/. Never a source."""
    moved = []
    for r in paths:
        try:
            p = media_path(r) if r.endswith(".mp4") else image_path(r)
        except Refused:
            continue
        if not is_clip(p) and p.suffix == ".mp4":
            continue                                  # sources are never touched
        td = ann_dir(p) / "trash"; td.mkdir(exist_ok=True)
        for f in (p, p.with_suffix(".json") if is_clip(p) else None):
            if f and f.is_file():
                dst = td / f"{time.strftime('%Y%m%d-%H%M%S')}_{f.name}"
                os.replace(f, dst); moved.append(rel(dst))
    return moved


def save_png(jpg_rel, data_url):
    jp = image_path(jpg_rel, must_exist=False)
    if jp.parent.name != "frames":
        raise Refused("flattened png goes beside a frame")
    head, _, b64 = data_url.partition(",")
    if head != "data:image/png;base64":
        raise ValueError("expected a png data url")
    raw = base64.b64decode(b64)
    if raw[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError("not a png")
    out = jp.with_suffix(".png"); tmp = out.with_name("~" + out.name)
    tmp.write_bytes(raw); os.replace(tmp, out)
    return {"path": rel(out), "bytes": len(raw)}


# ---------------------------------------------------------------- storage
def write_atomic(f, data, bak=True):
    f.parent.mkdir(parents=True, exist_ok=True)
    tmp = f.with_suffix(f.suffix + ".tmp")
    tmp.write_text(data, encoding="utf-8")
    if bak and f.exists():
        shutil.copy2(f, f.with_suffix(f.suffix + ".bak"))
    os.replace(tmp, f)


def list_videos():
    out = []
    for p in sorted(PROD.glob("*/01_reference/source/*.mp4")):
        if p.parts[-4].startswith("_"):
            continue
        out.append({"v": rel(p), "slug": p.parts[-4], "name": p.name, "mb": round(p.stat().st_size / 1e6, 1)})
    return out


def board_file(name):
    if not isinstance(name, str) or not BOARD_RE.match(name):
        raise Refused("bad board name (a-z 0-9 _ -)")
    return BOARDS / f"{name}.json"


def new_id(prefix):
    return f"{prefix}{int(time.time() * 1000):x}{os.urandom(2).hex()}"


def video_node(v, x, y):
    return {"id": new_id("v"), "type": "video", "src": v, "x": x, "y": y, "parent": None,
            "title": v.split("/")[0], "tags": [], "note": "", "purpose": "",
            "created": time.strftime("%Y-%m-%dT%H:%M:%S")}


def default_board():
    vids = [v["v"] for v in list_videos() if v["slug"].startswith("farrell-")]
    nodes = [video_node(v, 0, i * 560) for i, v in enumerate(vids)]
    return {"name": DEFAULT_BOARD, "version": 2, "nodes": nodes, "edges": [],
            "view": {"x": 80, "y": 60, "z": 0.45}}


def migrate(board):
    """Old per-mark annotations.json (no 'board' on the marks) -> cards on this board. Runs once:
    the board save rewrites annotations.json in the synced format. A copy is kept first."""
    changed = False
    for vn in [n for n in board["nodes"] if n.get("type") == "video"]:
        try:
            vp = source_path(vn["src"])
        except Refused:
            continue
        f = ann_file(vp)
        if not f.is_file():
            continue
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            continue
        done = {n.get("migrated_from") for n in board["nodes"] if n.get("src") == vn["src"]}
        old = [m for m in d.get("marks", []) if "board" not in m and m.get("id") not in done]
        if not old or d.get("synced"):
            continue
        keep = f.with_name(f.stem + ".premigration.json")
        if not keep.exists():
            shutil.copy2(f, keep)
        i = probe(vp); slug = vn["src"].split("/")[0]; fps = [i["fps_num"], i["fps_den"]]
        for m in old:
            base = {"tags": m.get("tags") or [], "note": m.get("note") or "",
                    "purpose": m.get("purpose") or "", "src": vn["src"], "fps": fps,
                    "created": m.get("created"), "updated": m.get("updated"),
                    "migrated_from": m.get("id")}
            fin = int(m.get("frame_in") or 0)
            if m.get("frame_out") is not None:
                c = dict(base, id=new_id("c"), type="clip", parent=vn["id"], sf_in=fin,
                         sf_out=int(m["frame_out"]), pf_in=fin, pf_out=int(m["frame_out"]),
                         status="pending")
                c["file"] = f"{slug}/01_reference/annotations/clips/{c['id']}.mp4"
                board["nodes"].append(c); host = c
                kind_holder = None
            else:
                host = vn; kind_holder = base
            if m.get("screenshot"):
                sf = int(m.get("screenshot_frame") if m.get("screenshot_frame") is not None else fin)
                s = dict(kind_holder or {"tags": [], "note": "", "purpose": "", "src": vn["src"],
                                         "fps": fps, "created": m.get("created"),
                                         "updated": m.get("updated"), "migrated_from": m.get("id")},
                         id=new_id("s"), type="shot", parent=host["id"], sf=sf,
                         pf=sf - (host.get("sf_in") or 0) if host is not vn else sf,
                         image=f"{slug}/{m['screenshot']}", flat=None,
                         size=m.get("frame_size") or [i["width"], i["height"]], shapes=[])
                if not (0 <= s["pf"] <= (host.get("sf_out", 10**9) - host.get("sf_in", 0))):
                    s["parent"], s["pf"] = vn["id"], sf
                b = m.get("box")
                if b:
                    s["shapes"].append({"k": "box", "p": [[b["x"], b["y"]], [b["x"] + b["w"], b["y"] + b["h"]]],
                                        "c": "#ff3b30", "w": 0.004})
                board["nodes"].append(s)
            elif kind_holder is not None:
                board["nodes"].append(dict(base, id=new_id("p"), type="point", parent=vn["id"],
                                           sf=fin, pf=fin))
        changed = True
    return changed


def place_children(board):
    """Give migrated nodes without x/y a spot right of their parent."""
    byid = {n["id"]: n for n in board["nodes"]}
    for n in board["nodes"]:
        if "x" in n:
            continue
        p = byid.get(n.get("parent")) or {"x": 0, "y": 0}
        x, y = p.get("x", 0) + 520, p.get("y", 0)
        while any(abs(o.get("x", -1e9) - x) < 320 and abs(o.get("y", -1e9) - y) < 260
                  for o in board["nodes"] if o is not n and "x" in o):
            y += 280
        n["x"], n["y"] = x, y
        if n.get("parent"):
            board["edges"].append({"id": new_id("e"), "from": n["parent"], "to": n["id"], "kind": "derived"})


def load_board(name):
    f = board_file(name)
    if f.is_file():
        b = json.loads(f.read_text(encoding="utf-8"))
    elif name == DEFAULT_BOARD:
        b = default_board()
    else:
        raise Refused("no such board")
    b.setdefault("nodes", []); b.setdefault("edges", [])
    if migrate(b) or not f.is_file():
        place_children(b)
        save_board(name, b, check=False)
    return b


def board_rev(bf):
    """Current rev: an unwritten patch wins; otherwise the file's, cached by mtime (a 95 MB board is not re-parsed every poll)."""
    c = BCACHE.get(bf.stem)
    if c and c["pending"]:
        return c["b"].get("rev")
    m = _mtime(bf)
    if m is None:
        return None
    hit = REVC.get(bf)
    if hit and hit[0] == m:
        return hit[1]
    try:
        rev = json.loads(bf.read_text(encoding="utf-8")).get("rev")
    except ValueError:
        rev = None
    REVC[bf] = (m, rev)
    return rev


# ---- patch saves: a 100k-clip board is kept parsed in memory; a patch carries only what changed
BCACHE = {}        # board name -> {"b", "mtime", "ix", "eix", "pending", "t", "slugs"}
REVC = {}          # board file -> (mtime_ns, rev)
READC = {}         # board file -> (mtime_ns, board) for sync_annotations
LAST_BAK = {}


def _mtime(f):
    try:
        return f.stat().st_mtime_ns
    except OSError:
        return None


def board_skipped(f):
    """Boards with "sync": false near the top (the stress board) are never mirrored into annotations.json."""
    try:
        with open(f, "rb") as fh:
            head = fh.read(256)
    except OSError:
        return True
    return re.search(rb'"sync"\s*:\s*false', head) is not None


def _cache(name):                       # call under LOCK
    f = board_file(name); m = _mtime(f); c = BCACHE.get(name)
    if c and (c["pending"] or c["mtime"] == m):
        return c
    if m is None:
        raise Refused("no such board")
    b = json.loads(f.read_text(encoding="utf-8")); b.setdefault("nodes", []); b.setdefault("edges", [])
    c = {"b": b, "mtime": m, "ix": None, "eix": None, "pending": False, "t": None, "slugs": set()}
    BCACHE[name] = c
    return c


def _slug(n):
    s = n.get("src") if isinstance(n, dict) else None
    return s.split("/")[0] if isinstance(s, str) else None


def patch_board(name, p):
    if not isinstance(p, dict):
        raise ValueError("patch must be an object")
    up, de = p.get("upsert") or {}, p.get("del") or {}
    if not isinstance(up, dict) or not isinstance(de, dict):
        raise ValueError("upsert/del must be objects")
    un, ue, dn, dE = up.get("nodes") or [], up.get("edges") or [], de.get("nodes") or [], de.get("edges") or []
    if not all(isinstance(x, list) for x in (un, ue, dn, dE)):
        raise ValueError("upsert/del members must be lists")
    seen = set()                         # source_path probes the disk: check each distinct path once
    for n in un:
        if not isinstance(n, dict):
            raise ValueError("node must be an object")
        check_id(n.get("id"))
        for k in ("src", "file", "image", "flat"):
            v = n.get(k)
            if not v or (k, v) in seen:
                continue
            seen.add((k, v))
            if k == "src":
                source_path(v)
            elif k == "file":
                _rel_parts(v)
            else:
                image_path(v, must_exist=False)
    for e in ue:
        if not isinstance(e, dict):
            raise ValueError("edge must be an object")
        check_id(e.get("id"))
    for i in dn + dE:
        check_id(i)
    with LOCK:
        c = _cache(name); b = c["b"]
        if p.get("rev") != b.get("rev"):
            raise Stale(f"stale board: you have rev {p.get('rev')}, server has rev {b.get('rev')} - reload")
        if c["ix"] is None or len(c["ix"]) != len(b["nodes"]):
            c["ix"] = {n["id"]: i for i, n in enumerate(b["nodes"])}
        if c["eix"] is None or len(c["eix"]) != len(b["edges"]):
            c["eix"] = {e["id"]: i for i, e in enumerate(b["edges"])}
        for n in un:
            i = c["ix"].get(n["id"])
            if i is None:
                c["ix"][n["id"]] = len(b["nodes"]); b["nodes"].append(n)
            else:
                c["slugs"].add(_slug(b["nodes"][i])); b["nodes"][i] = n
            c["slugs"].add(_slug(n))
        for e in ue:
            i = c["eix"].get(e["id"])
            if i is None:
                c["eix"][e["id"]] = len(b["edges"]); b["edges"].append(e)
            else:
                b["edges"][i] = e
        if dn:
            gone = set(dn); c["slugs"].update(_slug(n) for n in b["nodes"] if n["id"] in gone)
            b["nodes"] = [n for n in b["nodes"] if n["id"] not in gone]; c["ix"] = None
        if dE:
            gone = set(dE); b["edges"] = [e for e in b["edges"] if e["id"] not in gone]; c["eix"] = None
        if isinstance(p.get("view"), dict):
            b["view"] = p["view"]
        b["rev"] = (b.get("rev") or 0) + 1; b["saved"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        c["pending"] = True
        if not c["t"]:
            c["t"] = threading.Timer(2.0, flush_board, [name]); c["t"].daemon = True; c["t"].start()
        return {"ok": True, "rev": b["rev"], "saved": b["saved"], "nodes": len(b["nodes"])}


def flush_board(name):
    """Write a board's pending patches to disk (Timer, GET, full save, shutdown)."""
    with LOCK:
        c = BCACHE.get(name)
        if not c:
            return
        if c["t"]:
            c["t"].cancel(); c["t"] = None
        if not c["pending"]:
            return
        b = c["b"]; f = board_file(name); now = time.time()
        bak = now - LAST_BAK.get(name, 0) > 60
        if bak:
            LAST_BAK[name] = now
        write_atomic(f, json.dumps(b, indent=1 if len(b["nodes"]) <= 5000 else None, ensure_ascii=False), bak=bak)
        c["mtime"] = _mtime(f); c["pending"] = False
        slugs = sorted(s for s in c["slugs"] if s); c["slugs"] = set()
        if slugs and b.get("sync") is not False:
            sync_annotations(slugs)


def flush_all():
    for name in list(BCACHE):
        try:
            flush_board(name)
        except Exception as e:                          # one bad board must not stop the others being written
            print(f"flush {name} failed: {e}", file=sys.stderr, flush=True)


def save_board(name, b, check=True):
    """rev guards against clobbering: every save bumps it, and a save must carry the rev it was
    loaded at. A stale tab (or a script that wrote the board meanwhile) gets 409 and reloads."""
    if not isinstance(b, dict) or not isinstance(b.get("nodes"), list) or not isinstance(b.get("edges"), list):
        raise ValueError("body must be {nodes:[...], edges:[...]}")
    for n in b["nodes"]:
        check_id(n.get("id"))
        for k in ("src", "file", "image", "flat"):
            if n.get(k):
                if k == "src":
                    source_path(n[k])
                elif k == "file":
                    _rel_parts(n[k])
                else:
                    image_path(n[k], must_exist=False)
    reload = migrate(b)
    if reload:
        place_children(b)
    b["name"] = name; b["version"] = 2; b["saved"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    flush_board(name)
    with LOCK:
        bf = board_file(name)
        cur = board_rev(bf)
        if check and cur is not None and b.get("rev") != cur:
            raise Stale(f"stale board: you have rev {b.get('rev')}, disk has rev {cur} - reload")
        b["rev"] = (cur or 0) + 1
        try:   # productions that just lost their last node on this board must be re-synced too
            prev = json.loads(bf.read_text(encoding="utf-8")).get("nodes", []) if bf.is_file() else []
        except ValueError:
            prev = []
        write_atomic(bf, json.dumps(b, indent=1 if len(b["nodes"]) <= 5000 else None, ensure_ascii=False))
        BCACHE.pop(name, None)
        slugs = sorted({n["src"].split("/")[0] for n in b["nodes"] + prev
                        if isinstance(n, dict) and isinstance(n.get("src"), str)})
        synced = sync_annotations(slugs)
    return {"ok": True, "rev": b["rev"], "nodes": len(b["nodes"]), "edges": len(b["edges"]), "saved": b["saved"],
            "synced": synced, "reload": reload}


# ---- per-production annotations.json, rebuilt from every board (pvs.py notes reads it)
def shape_summary(s, size):
    W, H = size or (1920, 1080)
    k = s.get("k"); p = s.get("p") or []
    f3 = lambda v: f"{v:.3f}"
    if k in ("box", "circle", "ruler", "arrow") and len(p) >= 2:
        (x0, y0), (x1, y1) = p[0], p[1]
        if k == "ruler" or k == "arrow":
            dx, dy = (x1 - x0) * W, (y1 - y0) * H
            L = (dx * dx + dy * dy) ** 0.5
            if k == "arrow":
                return f"arrow {f3(x0)},{f3(y0)} -> {f3(x1)},{f3(y1)}"
            axis = f"{L / H * 100:.1f}% H" if abs(dy) >= abs(dx) else f"{L / W * 100:.1f}% W"
            return f"ruler {axis} ({L:.0f}px = {L / H * 100:.1f}% H / {L / W * 100:.1f}% W)"
        x, y, w, h = min(x0, x1), min(y0, y1), abs(x1 - x0), abs(y1 - y0)
        return (f"{k} at x,y,w,h {f3(x)},{f3(y)},{f3(w)},{f3(h)}"
                f" = {round(x * W)},{round(y * H)} {round(w * W)}x{round(h * H)}px")
    if k == "text" and p:
        return f"text \"{s.get('text', '')}\" at {f3(p[0][0])},{f3(p[0][1])}"
    if k in ("pen", "hl") and p:
        xs, ys = [q[0] for q in p], [q[1] for q in p]
        return (f"{'highlighter' if k == 'hl' else 'pen'} stroke over x,y,w,h {f3(min(xs))},{f3(min(ys))},"
                f"{f3(max(xs) - min(xs))},{f3(max(ys) - min(ys))}")
    return k or "?"


def prod_rel(r):
    """'<slug>/01_reference/...' -> '01_reference/...' (old schema: relative to the production)."""
    return r.split("/", 1)[1] if r and "/" in r else None


def marks_for(vp_rel, i, boards):
    marks, vnotes = [], []
    for bname, b in boards:
        byid = {n["id"]: n for n in b["nodes"]}
        links = {}
        for e in b["edges"]:
            if e.get("kind") == "user":
                for a, z in ((e["from"], e["to"]), (e["to"], e["from"])):
                    o = byid.get(z)
                    if o:
                        links.setdefault(a, []).append({"to": z, "type": o.get("type"), "src": o.get("src"),
                                                        "title": o.get("title") or "", "label": e.get("label") or ""})
        for n in b["nodes"]:
            if n.get("src") != vp_rel:
                continue
            if n.get("type") == "video":
                if n.get("note") or n.get("purpose") or n.get("tags") or links.get(n["id"]):
                    vnotes.append({"board": bname, "id": n["id"], "tags": n.get("tags") or [],
                                   "note": n.get("note") or "", "purpose": n.get("purpose") or "",
                                   "links": links.get(n["id"], [])})
                continue
            chain, cur = [], byid.get(n.get("parent"))
            while cur:
                chain.insert(0, {"id": cur["id"], "type": cur.get("type"), "title": cur.get("title") or "",
                                 "sf_in": cur.get("sf_in"), "sf_out": cur.get("sf_out")})
                cur = byid.get(cur.get("parent"))
            par = byid.get(n.get("parent")) or {}
            t = n.get("type")
            if t == "clip":
                fi, fo = n["sf_in"], n["sf_out"]
                t_in, t_out = ftime(i, fi), ftime(i, fo + 1)
                lfi, lfo = n.get("pf_in"), n.get("pf_out")
            else:
                fi, fo = n.get("sf"), None
                t_in, t_out = ftime(i, fi or 0), None
                lfi, lfo = n.get("pf"), None
            pfps = i
            m = {"id": n["id"], "kind": t, "board": bname, "parent": n.get("parent"),
                 "parent_type": par.get("type"), "chain": chain, "title": n.get("title") or "",
                 "t_in": round(t_in, 6), "t_out": round(t_out, 6) if t_out is not None else None,
                 "frame_in": fi, "frame_out": fo,
                 "local_frame_in": lfi, "local_frame_out": lfo,
                 "local_in": round(ftime(pfps, lfi), 6) if lfi is not None else None,
                 "local_out": round(ftime(pfps, lfo + 1), 6) if lfo is not None else None,
                 "tags": n.get("tags") or [], "note": n.get("note") or "", "purpose": n.get("purpose") or "",
                 "clip": prod_rel(n.get("file")) if t == "clip" else None,
                 "screenshot": prod_rel(n.get("image")), "flat": prod_rel(n.get("flat")),
                 "frame_size": n.get("size"),
                 "drawings": [shape_summary(s, n.get("size")) for s in n.get("shapes") or []],
                 "shapes": n.get("shapes") or [],
                 "box": None, "links": links.get(n["id"], []),
                 "created": n.get("created"), "updated": n.get("updated")}
            bx = next((s for s in n.get("shapes") or [] if s.get("k") == "box"), None)
            if bx:
                (x0, y0), (x1, y1) = bx["p"][:2]; W, H = n.get("size") or (i["width"], i["height"])
                x, y, w, h = min(x0, x1), min(y0, y1), abs(x1 - x0), abs(y1 - y0)
                m["box"] = {"x": round(x, 4), "y": round(y, 4), "w": round(w, 4), "h": round(h, 4),
                            "px": {"x": round(x * W), "y": round(y * H), "w": round(w * W), "h": round(h * H),
                                   "frame_w": W, "frame_h": H}}
            marks.append(m)
    marks.sort(key=lambda m: (m["t_in"], len(m["chain"])))
    return marks, vnotes


def sync_annotations(slugs):
    boards = []
    for f in sorted(BOARDS.glob("*.json")):
        if board_skipped(f):
            continue
        m = _mtime(f); hit = READC.get(f)
        if hit and hit[0] == m:
            boards.append((f.stem, hit[1])); continue
        try:
            b = json.loads(f.read_text(encoding="utf-8"))
        except ValueError:
            continue
        READC[f] = (m, b); boards.append((f.stem, b))
    done = []
    for slug in slugs:
        if not re.fullmatch(r"[A-Za-z0-9][\w.-]*", slug) or not (PROD / slug).is_dir():
            continue
        for vp in sorted((PROD / slug / "01_reference" / "source").glob("*.mp4")):
            i = probe(vp); vr = rel(vp)
            marks, vnotes = marks_for(vr, i, boards)
            f = ann_file(vp)
            if not f.is_file() and not marks and not vnotes:
                continue
            if f.is_file():
                try:
                    old = json.loads(f.read_text(encoding="utf-8"))
                except ValueError:
                    old = {}
                if any("board" not in m for m in old.get("marks", [])) and not old.get("synced"):
                    keep = f.with_name(f.stem + ".premigration.json")
                    if not keep.exists():
                        shutil.copy2(f, keep)
                if old.get("marks") == marks and old.get("video_notes") == vnotes:
                    continue
            doc = {"video": "productions/" + vr, "fps": i["fps"], "duration": i["duration"],
                   "synced": True, "written_by": "ref-annotator board (productions/_boards/*.json)",
                   "saved": time.strftime("%Y-%m-%dT%H:%M:%S"), "video_notes": vnotes, "marks": marks}
            write_atomic(f, json.dumps(doc, indent=1, ensure_ascii=False))
            done.append(rel(f))
    return done


# ---------------------------------------------------------------- http
class H(BaseHTTPRequestHandler):
    server_version = "ref-annotator/2"

    def log_message(self, fmt, *args):
        pass

    def send_json(self, obj, code=200):
        b = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers(); self.wfile.write(b)

    def send_bytes(self, data, ctype):
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers(); self.wfile.write(data)

    def send_file(self, p, ctype, ranged=False, cache="no-cache"):
        st = p.stat(); size = st.st_size; start, end = 0, size - 1; code = 200
        etag = f'"{st.st_mtime_ns:x}-{size:x}"'          # lets the browser revalidate with a 304, no body
        if etag in (self.headers.get("If-None-Match") or ""):
            self.send_response(304); self.send_header("ETag", etag); self.send_header("Cache-Control", cache)
            self.end_headers(); return
        rng = self.headers.get("Range") if ranged else None
        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)$", rng.strip())
            if not m or (not m.group(1) and not m.group(2)):
                self.send_response(416); self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers(); return
            if m.group(1):
                start = int(m.group(1)); end = int(m.group(2)) if m.group(2) else size - 1
            else:
                start = max(0, size - int(m.group(2)))
            end = min(end, size - 1)
            if start > end:
                self.send_response(416); self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers(); return
            code = 206
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(end - start + 1))
        if code == 206:
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("ETag", etag)
        self.send_header("Cache-Control", cache)
        self.end_headers()
        if self.command == "HEAD":
            return
        try:
            with open(p, "rb") as fh:
                fh.seek(start); left = end - start + 1
                while left > 0:
                    chunk = fh.read(min(1 << 20, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk); left -= len(chunk)
        except (ConnectionResetError, ConnectionAbortedError, BrokenPipeError):
            pass

    def route(self):
        u = urlparse(self.path)
        return u.path, {k: v[0] for k, v in parse_qs(u.query).items()}

    def do_HEAD(self):
        self.do_GET()

    def fail(self, e):
        if isinstance(e, Refused):
            return self.send_json({"error": f"refused: {e}"}, 403)
        if isinstance(e, Stale):
            return self.send_json({"error": str(e), "stale": True}, 409)
        if isinstance(e, ValueError):
            return self.send_json({"error": f"bad request: {e}"}, 400)
        self.send_json({"error": f"{type(e).__name__}: {e}"}, 500)

    def do_GET(self):
        path, q = self.route()
        try:
            if path in STATIC:
                name, ctype = STATIC[path]
                return self.send_file(HERE / name, ctype)
            if path == "/api/ping":
                return self.send_json({"app": "ref-annotator", "version": 2})
            if path == "/api/videos":
                return self.send_json(list_videos())
            if path == "/api/tags":
                return self.send_json(json.loads(TAGS_FILE.read_text(encoding="utf-8"))
                                      if TAGS_FILE.exists() else [])
            if path == "/api/boards":
                BOARDS.mkdir(exist_ok=True)
                names = sorted({f.stem for f in BOARDS.glob("*.json")} | {DEFAULT_BOARD})
                return self.send_json(names)
            if path == "/api/board":
                name = q.get("b", DEFAULT_BOARD)
                if BOARD_RE.match(name or ""):
                    flush_board(name)
                return self.send_json(load_board(name))
            if path == "/api/rev":
                return self.send_json({"rev": board_rev(board_file(q.get("b", "")))})
            if path == "/api/job":
                j = JOBS.get(check_id(q.get("id")))
                return self.send_json(j or {"status": "unknown"})
            if path == "/video":
                return self.send_file(media_path(q.get("v")), "video/mp4", ranged=True)
            if path == "/api/info":
                p = media_path(q.get("v")); i = dict(probe(p))
                if is_clip(p):
                    i["clip"] = clip_meta(p)
                return self.send_json(i)
            if path == "/poster":
                f = q.get("f")
                # a poster is fixed by its source + frame (the URL), so the browser may reuse it for a day
                return self.send_file(poster(media_path(q.get("v")), int(f) if f and f.isdigit() else None), "image/jpeg",
                                      cache="max-age=86400")
            if path == "/img":
                p = image_path(q.get("p"))
                return self.send_file(p, "image/png" if p.suffix == ".png" else "image/jpeg")
            self.send_json({"error": "not found"}, 404)
        except Exception as e:
            self.fail(e)

    def do_POST(self):
        path, q = self.route()
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > (256_000_000 if path == "/api/board/patch" else 40_000_000):
                return self.send_json({"error": "body too large"}, 413)
            body = json.loads(self.rfile.read(n) or b"null")
            if path == "/api/tags":
                tags = sorted({str(t).strip()[:40] for t in body if str(t).strip()})
                with LOCK:
                    write_atomic(TAGS_FILE, json.dumps(tags, indent=1, ensure_ascii=False))
                return self.send_json(tags)
            if path == "/api/board/patch":
                return self.send_json(patch_board(q.get("b", ""), body))
            if path == "/api/thumbs":
                return self.send_bytes(thumbs_batch(body), "application/octet-stream")
            if path == "/api/board":
                return self.send_json(save_board(q.get("b", ""), body))
            if path == "/api/cut":
                return self.send_json(start_cut(media_path(body.get("v")), body["frame_in"],
                                                body["frame_out"], body["id"]))
            if path == "/api/grab":
                return self.send_json(grab(media_path(body.get("v")), body["frame"], body.get("id"),
                                           bool(body.get("direct"))))
            if path == "/api/flat":
                return self.send_json(save_png(body.get("jpg"), body.get("png", "")))
            if path == "/api/trash":
                return self.send_json({"moved": trash([str(x) for x in body.get("paths", [])])})
            self.send_json({"error": "not found"}, 404)
        except Exception as e:
            self.fail(e)


def already_running(port):
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/api/ping", timeout=1) as r:
            return json.loads(r.read()).get("app") == "ref-annotator"
    except Exception:
        return False


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8765)
    ap.add_argument("--no-browser", action="store_true")
    a = ap.parse_args()
    if already_running(a.port):
        url = f"http://localhost:{a.port}"
        print(f"already running: {url}")
        if not a.no_browser:
            webbrowser.open(url)
        return
    srv = None
    for port in range(a.port, a.port + 20):
        try:
            srv = ThreadingHTTPServer(("127.0.0.1", port), H); break
        except OSError:
            continue
    if not srv:
        sys.exit(f"no free port in {a.port}-{a.port + 19}")
    srv.daemon_threads = True
    BOARDS.mkdir(exist_ok=True)
    url = f"http://localhost:{srv.server_address[1]}"
    print(f"ref-annotator board: {url}   (productions: {PROD})   Ctrl+C to stop", flush=True)
    if not a.no_browser:
        webbrowser.open(url)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        flush_all()


if __name__ == "__main__":
    main()
