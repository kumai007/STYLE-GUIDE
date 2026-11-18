#!/usr/bin/env python3
"""Farrell style guide UI on http://localhost:8767.

    python styleguide/server.py [--port 8767] [--no-browser]

Stdlib only. Binds 127.0.0.1. One guide per run (--guide farrell|nocturn|abyssal). Writes only styleguide/<slug>/<slug>.json,
its history/, its <SLUG>_STYLE_GUIDE.md and uploads in its media/ (plus poster jpgs through the board server's cache). Reads the board json, never writes it.
The Update button runs `claude -p` (Sonnet, read-only tools) in a background thread, one run at a time.
"""
import argparse, json, os, re, shutil, subprocess, sys, threading, time, uuid, webbrowser
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parent
PROJ = ROOT.parent
sys.path.insert(0, str(ROOT)); sys.path.insert(0, str(PROJ / "tools" / "ref-annotator"))
import model as M
import serve as B          # media_path, poster, the ranged-file handler

STATIC = {"/": ("index.html", "text/html; charset=utf-8"), "/app.css": ("app.css", "text/css; charset=utf-8"),
          "/app.js": ("app.js", "text/javascript; charset=utf-8")}
MAX_BODY = 5 << 20
MAX_UPLOAD = 1 << 30           # 1 GB per screenshot or video
CTYPE = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp", "gif": "image/gif",
         "mp4": "video/mp4", "mov": "video/quicktime", "webm": "video/webm", "m4v": "video/mp4"}
CT_EXT = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif",
          "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm"}
FRAMES, MAX_IMAGES = 4, 16      # frames taken from each video; images sent to one Learn run


class Busy(Exception):
    pass


def font_file():
    dirs = [Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts",
            Path(os.environ.get("LOCALAPPDATA", "")) / "Microsoft" / "Windows" / "Fonts"]
    for d in dirs:
        hits = sorted(d.glob("VCR*.ttf")) if d.is_dir() else []
        if hits: return hits[0]
    return None


def extract_json(text):
    """The answer object from Claude's text: plain JSON, a ```json fence, or the outermost {...}."""
    text = (text or "").strip()
    tries = [text]
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    if m: tries.append(m.group(1))
    if "{" in text: tries.append(text[text.index("{"): text.rindex("}") + 1])
    for t in tries:
        try:
            o = json.loads(t)
        except ValueError:
            continue
        if isinstance(o, dict) and isinstance(o.get("ops"), list):
            return o
    raise ValueError("Claude's answer had no JSON with an ops list: " + text[:200])


def claude_argv():
    cmd = os.environ.get("STYLEGUIDE_CLAUDE_CMD", "claude")
    if cmd.endswith(".py"): return [sys.executable, cmd]
    exe = shutil.which(cmd)
    if not exe: raise RuntimeError(f"'{cmd}' not found on PATH")
    return [exe, "-p", "--model", "sonnet", "--output-format", "json", "--tools", "Read", "Grep", "Glob",
            "--strict-mcp-config", "--no-session-persistence", "--setting-sources", "project"]


def run_claude(prompt, timeout):
    p = subprocess.Popen(claude_argv(), cwd=PROJ, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                         text=True, encoding="utf-8", errors="replace")
    try:
        out, err = p.communicate(prompt, timeout=timeout)
    except subprocess.TimeoutExpired:
        if os.name == "nt":       # claude.cmd starts node under cmd.exe: kill the whole tree
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
        p.kill()
        try: p.communicate(timeout=5)
        except Exception: pass
        raise RuntimeError(f"timed out after {timeout} s")
    if p.returncode:
        try:
            why = str(json.loads(out).get("result") or "")   # the CLI puts its reason in the JSON, not on stderr
        except (ValueError, AttributeError):
            why = ""
        why = why or (err.strip().splitlines() or [out.strip()[:200]])[-1]
        if "authenticate" in why.lower() or "login" in why.lower():
            why += " - run `claude auth login` in a terminal, then press Update again"
        raise RuntimeError(f"claude exited {p.returncode}: {why[:400]}")
    try:
        o = json.loads(out)
    except ValueError:
        return out
    if isinstance(o, dict):
        if o.get("is_error"): raise RuntimeError("claude error: " + str(o.get("result"))[:300])
        return o.get("result", "")
    return out


class App:
    def __init__(self, data_dir, md_path, board_path, slug="farrell"):
        self.slug = slug
        self.dir = Path(data_dir); self.file = self.dir / f"{slug}.json"; self.hist = self.dir / "history"
        self.media = self.dir / "media"
        self.md, self.board = Path(md_path), Path(board_path)
        self.lock = threading.Lock(); self.running = None; self.clips, self.board_mt = {}, None
        if not self.file.exists():
            M.save(M.empty_guide(), self.file, self.hist, self.md)
        g = M.load(self.file); stale = False
        for u in g["updates"]:
            if u.get("status") == "running":
                u.update(status="failed", error="server restarted during the run"); stale = True
        if stale: M.save(g, self.file, self.hist, self.md)

    def guide(self):
        return M.load(self.file)

    def _save(self, g):
        M.save(g, self.file, self.hist, self.md); return g

    def save_client(self, g):
        with self.lock:
            cur = self.guide()
            if g.get("rev") != cur["rev"]:
                raise B.Stale(f"the guide changed (rev {cur['rev']}); reload and try again")
            g["updates"] = cur["updates"]          # the update log is the server's
            return self._save(g)

    def promote(self, lid, to, cat_id=None):
        with self.lock:
            return self._save(M.promote(self.guide(), lid, to, cat_id))

    # ------------------------------------------------------------ clips on the board
    def clip(self, cid):
        mt = self.board.stat().st_mtime if self.board.exists() else None
        if mt != self.board_mt:
            nodes = json.loads(self.board.read_text(encoding="utf-8")).get("nodes", []) if mt else []
            self.clips = {n["id"]: n for n in nodes if "sf_in" in n and "src" in n}; self.board_mt = mt
        n = self.clips.get(cid)
        if not n: return None
        return {k: n.get(k) for k in ("id", "src", "fps", "sf_in", "sf_out", "title", "note", "tags")} | {"prod": n["src"].split("/")[0]}

    def clip_list(self):
        """Every clip on the board, for the form's picker."""
        self.clip("")
        return [{"id": n["id"], "label": clip_label(n), "title": n.get("title") or "",
                 "note": (n.get("note") or "")[:200], "tags": n.get("tags") or [], "src": n["src"], "prod": n["src"].split("/")[0],
                 "sf_in": n["sf_in"], "sf_out": n["sf_out"]} for n in self.clips.values()]

    # ------------------------------------------------------------ uploads
    def save_upload(self, src, n, name, ctype):
        """Stream n bytes from src into media/<16 hex>.<ext>. The type comes from the name, else the content type."""
        name = re.sub(r"[\x00-\x1f]", "", Path(name.replace("\\", "/")).name)[:120]
        ext = name.rsplit(".", 1)[-1].lower() if "." in name else ""
        if ext not in CTYPE: ext = CT_EXT.get(ctype.split(";")[0].strip(), "")
        if not ext: raise ValueError("only images (png, jpg, webp, gif) and videos (mp4, mov, webm, m4v) can be added")
        if n <= 0: raise ValueError("the file is empty")
        self.media.mkdir(parents=True, exist_ok=True)
        f = f"{uuid.uuid4().hex[:16]}.{ext}"; tmp = self.media / ("~" + f); left = n
        try:
            with open(tmp, "wb") as o:
                while left:
                    b = src.read(min(left, 1 << 20))
                    if not b: break
                    o.write(b); left -= len(b)
            if left: raise ValueError("the upload was cut short")
            os.replace(tmp, self.media / f)
        finally:
            if tmp.exists(): tmp.unlink()
        return {"file": f, "kind": M.media_kind(f), "name": name or f}

    # ------------------------------------------------------------ Learn: what Claude looks at
    def _grab(self, vp, times, out):
        """jpg frames at the given seconds of a video, cached in out/. Frames ffmpeg can't make are skipped."""
        out.mkdir(parents=True, exist_ok=True); got = []
        for i, t in enumerate(times):
            f = out / f"{i}.jpg"
            if not f.exists():
                tmp = out / f"~{i}.jpg"
                subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-ss", f"{max(0.0, t):.3f}", "-i", str(vp), "-frames:v", "1",
                                "-vf", "scale='min(960,iw)':-2", "-q:v", "3", "-f", "image2", str(tmp)], capture_output=True)
                if tmp.exists() and tmp.stat().st_size: os.replace(tmp, f)
            if f.exists(): got.append(f)
        return got

    def learn_images(self, item):
        """[(absolute path, description)] for an item's screenshots and frames of its uploaded videos and board clips."""
        out, fr = [], self.media / "frames"
        for m in item.get("media", []):
            p = self.media / m["file"]; name = m.get("name") or m["file"]
            if not p.is_file(): continue
            if m["kind"] == "image": out.append((p, f'screenshot "{name}"')); continue
            try:
                d = B.probe(p)["duration"]
                fs = self._grab(p, [d * (i + 0.5) / FRAMES for i in range(FRAMES)], fr / p.stem)
            except Exception:
                continue
            out += [(f, f'frame {i + 1} of {len(fs)} from uploaded video "{name}"') for i, f in enumerate(fs)]
        for e in item.get("evidence", []):
            try:
                vp = B.media_path(e.get("src") or self.clip(e["clip"])["src"]); i = B.probe(vp)
                a, b = e["sf_in"], e["sf_out"]
                times = [(a + (b - a) * (k + 0.5) / FRAMES + 0.5) * i["fps_den"] / i["fps_num"] for k in range(FRAMES)]
                fs = self._grab(vp, times, fr / f"clip-{e['clip']}-{a}-{b}")
            except Exception:
                continue
            out += [(f, f"frame {k + 1} of {len(fs)} from board clip {e.get('label') or e['clip']}") for k, f in enumerate(fs)]
        return [(p.resolve(), d) for p, d in out[:MAX_IMAGES]]

    def _item(self, g, iid):
        for c in g["categories"]:
            for r in c["rules"]:
                if r["id"] == iid: return "rule", c, r
        b = next((x for x in g["rulebook"] if x["id"] == iid), None)
        if b: return "rule book entry", None, b
        x = M.find_graphic(g, iid)
        return ("motion graphic", M.GFX_SECTION, x) if x else None

    def learn_note(self, iid):
        g = self.guide(); f = self._item(g, iid)
        if not f: raise ValueError(f"{iid} is no longer in the guide")
        kind, c, r = f; imgs = self.learn_images(r)
        if not imgs: raise ValueError("none of this item's screenshots or videos could be read")
        gfx = kind == "motion graphic"
        where = ("Section: MOTION GRAPHICS (which graphic to use in which situation)" if gfx
                 else f"Category: {c['name']} ({c['id']})" if c else "Section: RULE BOOK (the rules every edit must follow)")
        op = "edit_graphic" if gfx else "edit_rule" if c else "edit_rulebook"
        extra = [f"{n}: {r.get(k) or '(none)'}" for k, n in (("use", "Use when"), ("why", "Why"), ("avoid", "Not when"), ("kind", "Kind"),
                                                          ("situation", "Situation"), ("fit", f"Fits {self.slug.title()}"))] if gfx else []
        return "\n".join([
            "LEARN FROM THIS EXAMPLE",
            "The user attached examples (screenshots, frames of videos, frames of board clips) to one item of the guide and asked you to learn from them.",
            f"Item: {kind} {r['id']}", where, f"Title: {r.get('title') or '(none)'}", f"Text: {r['text']}", *extra, "Examples:"]
            + [f"- IMAGE: {p}  ({d})" for p, d in imgs] + [
            "Do this:",
            "1. Open EVERY image above with the Read tool and look closely: colour, contrast, grain, framing, type, motion cues.",
            f"2. Refine this item with {op} on id {r['id']}: keep what the user meant, make the text say exactly what the examples show "
            "(numbers where you can see them), and set a short \"title\" naming it. This counts as the user asking for the edit, "
            "even for a rule marked user or a rule book entry."
            + (" For a motion graphic, \"text\" says how it looks and how to build it (motion, timing, colour, type), "
               "\"use\" says in which situations to use it (what the narration or story is doing), \"why\" what it does for the viewer, "
               "\"avoid\" when not to, \"situation\" one of: " + "; ".join(M.SITUATIONS) + ", \"fit\" yes / adapt: <change> / no: <rule broken>." if gfx else ""),
            "3. Edit, add or remove other rules only where these examples clearly contradict or sharpen them.",
            "4. Put the lesson in \"learning\" and say in \"summary\" what you saw in the examples."])

    def start_learn(self, iid):
        f = self._item(self.guide(), iid)
        if not f: raise ValueError(f"no rule {iid}")
        r = f[2]
        if not r.get("media") and not r.get("evidence"): raise ValueError("add a screenshot, video or board clip to this rule first")
        return self.start_update("Learn from: " + (r.get("title") or r["text"])[:60], learn=iid)

    # ------------------------------------------------------------ Update run + undo
    def start_update(self, note, learn=None):
        note = (note or "").strip()
        if not note: raise ValueError("write a note first")
        with self.lock:
            if self.running: raise Busy("an update is already running")
            g = self.guide()
            u = {"id": M.new_id("u"), "date": time.strftime("%Y-%m-%d %H:%M"), "note": note, "status": "running",
                 "summary": "", "changes": [], "error": ""}
            g["updates"].append(u); self._save(g); self.running = u["id"]
        threading.Thread(target=self._run, args=(u["id"], note, learn), daemon=True).start()
        return u

    def _set_update(self, g, uid, **kw):
        next(x for x in g["updates"] if x["id"] == uid).update(kw)

    def _run(self, uid, note, learn=None):
        try:
            own = self.dir / "update_prompt.md"                   # each guide has its own prompt; the shared one is the fallback
            tpl = (own if own.exists() else ROOT / "farrell" / "update_prompt.md").read_text(encoding="utf-8")
            full = self.learn_note(learn) if learn else note        # video frames are cut here, off the request thread
            g = self.guide(); view = {k: g.get(k, M.empty_guide()[k]) for k in M.CONTENT}
            fill = {"note": full, "guide": json.dumps(view, ensure_ascii=False, indent=1)}
            prompt = re.sub(r"\{(note|guide)\}", lambda m: fill[m.group(1)], tpl)     # one pass: a note can't inject {guide}
            ans = extract_json(run_claude(prompt, int(os.environ.get("STYLEGUIDE_TIMEOUT", "600"))))
            with self.lock:
                g = self.guide(); snap = {k: g.get(k, M.empty_guide()[k]) for k in M.CONTENT}
                g2, changes = M.apply_ops(g, ans["ops"])
                if str(ans.get("learning", "")).strip():
                    g2["learnings"].append({"id": M.new_id("l"), "date": M.today(), "text": str(ans["learning"]).strip(),
                                            "status": "open", "target": "", "note": note, "update": uid})
                self.hist.mkdir(parents=True, exist_ok=True)
                M._write(self.hist / f"before-{uid}.json", json.dumps(snap, ensure_ascii=False))
                self._set_update(g2, uid, status="done", summary=str(ans.get("summary", ""))[:1000], changes=changes)
                self._save(g2)
        except Exception as e:
            with self.lock:
                g = self.guide(); self._set_update(g, uid, status="failed", error=f"{e}"[:500]); self._save(g)
        finally:
            self.running = None

    def update(self, uid):
        return next((x for x in self.guide()["updates"] if x["id"] == uid), None)

    def undo(self, uid):
        with self.lock:
            g = self.guide(); done = [x for x in g["updates"] if x["status"] == "done"]
            if not done or done[-1]["id"] != uid: raise B.Stale("only the newest finished update can be undone")
            snap = self.hist / f"before-{uid}.json"
            if not snap.exists(): raise ValueError("no snapshot for that update")
            g.update(json.loads(snap.read_text(encoding="utf-8"))); self._set_update(g, uid, status="undone")
            return self._save(g)


class H(B.H):
    server_version = "farrell-styleguide/1"
    app = None

    def _local(self):
        host = (self.headers.get("Host") or "").split(":")[0]
        org = self.headers.get("Origin")
        return host in ("127.0.0.1", "localhost") and (not org or re.match(r"^http://(127\.0\.0\.1|localhost)(:\d+)?$", org))

    def fail(self, e):
        if isinstance(e, Busy): return self.send_json({"error": str(e)}, 409)
        if isinstance(e, (ValueError, M.OpError, KeyError)): return self.send_json({"error": str(e)}, 400)
        return super().fail(e)

    def do_GET(self):
        path, q = self.route(); a = self.app
        if not self._local(): return self.send_json({"error": "local only"}, 403)
        try:
            if path in STATIC:
                name, ctype = STATIC[path]; return self.send_file(ROOT / name, ctype)
            if path == "/api/ping": return self.send_json({"app": f"{a.slug}-styleguide", "guide": a.slug, "running": a.running})
            if path == "/api/guide": return self.send_json(a.guide())
            if path == "/api/clips": return self.send_json(a.clip_list())
            if path.startswith("/media/"):
                f = path[len("/media/"):]
                if not M.media_kind(f) or not (a.media / f).is_file(): return self.send_json({"error": "no such file"}, 404)
                return self.send_file(a.media / f, CTYPE[f.rsplit(".", 1)[1]], ranged=True)
            if path == "/api/update":
                u = a.update(q.get("id", "")); return self.send_json(u) if u else self.send_json({"error": "no such update"}, 404)
            if path == "/font/vcr.ttf":
                f = font_file(); return self.send_file(f, "font/ttf") if f else self.send_json({"error": "VCR font not installed"}, 404)
            if path in ("/api/clip", "/poster", "/video"):
                c = a.clip(q.get("clip") or q.get("id") or "")
                if not c: return self.send_json({"error": "clip not on the board"}, 404)
                if path == "/api/clip": return self.send_json(c)
                vp = B.media_path(c["src"])
                if path == "/video": return self.send_file(vp, "video/mp4", ranged=True)
                return self.send_file(B.poster(vp, (c["sf_in"] + c["sf_out"]) // 2), "image/jpeg")
            self.send_json({"error": "not found"}, 404)
        except Exception as e:
            self.fail(e)

    def do_POST(self):
        path, _ = self.route(); a = self.app
        if path == "/api/media": return self.upload()
        if not self._local() or "application/json" not in (self.headers.get("Content-Type") or ""):
            return self.send_json({"error": "local JSON only"}, 403)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > MAX_BODY: return self.send_json({"error": "too big"}, 413)
            body = json.loads(self.rfile.read(n) or b"{}")
            if not isinstance(body, dict): raise ValueError("expected a JSON object")
            if path == "/api/guide": return self.send_json(a.save_client(body))
            if path == "/api/promote": return self.send_json(a.promote(body["id"], body["to"], body.get("cat")))
            if path == "/api/update": return self.send_json(a.start_update(body.get("note")))
            if path == "/api/undo": return self.send_json(a.undo(body["id"]))
            if path == "/api/learn": return self.send_json(a.start_learn(body.get("id") or ""))
            self.send_json({"error": "not found"}, 404)
        except Exception as e:
            self.fail(e)


    def upload(self):
        """Raw file body (image/*, video/* or octet-stream); the original name in the X-Name header, URL-encoded."""
        ct = (self.headers.get("Content-Type") or "").lower()
        if not self._local() or not ct.startswith(("image/", "video/", "application/octet-stream")):
            return self.send_json({"error": "local file upload only"}, 403)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n > MAX_UPLOAD: return self.send_json({"error": "file is over 1 GB"}, 413)
            self.send_json(self.app.save_upload(self.rfile, n, unquote(self.headers.get("X-Name") or ""), ct))
        except Exception as e:
            self.fail(e)


def clip_label(n):
    """'v03 · <title>', else the note's first line, else the clip id."""
    note = (n.get("note") or "").strip().splitlines()
    name = (n.get("title") or "").strip() or (note[0].strip() if note else "") or n["id"]
    return f"v{n['src'][8:10]} · {name}"[:60]


GUIDES = {"farrell": 8767, "nocturn": 8768, "abyssal": 8769}   # guide folder name -> default port


def make_server(port, app):
    h = type("Handler", (H,), {"app": app})
    return ThreadingHTTPServer(("127.0.0.1", port), h)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--port", type=int, default=0); ap.add_argument("--no-browser", action="store_true")
    ap.add_argument("--guide", choices=GUIDES, default="farrell", help="which channel's guide to serve")
    a = ap.parse_args(); port = a.port or GUIDES[a.guide]
    d = ROOT / a.guide                         # everything of one guide lives in its own folder
    app = App(d, d / f"{a.guide.upper()}_STYLE_GUIDE.md", B.BOARDS / f"{a.guide}.json", a.guide)
    srv = make_server(port, app); url = f"http://localhost:{port}"
    print(f"{a.guide.title()} style guide on {url}  (Ctrl+C to stop)", flush=True)
    if not a.no_browser: threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try: srv.serve_forever()
    except KeyboardInterrupt: pass


if __name__ == "__main__":
    main()
