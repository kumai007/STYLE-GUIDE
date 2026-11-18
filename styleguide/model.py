"""The style guide's data: load, validate, apply operations, promote learnings, render Markdown, save with backups.
No HTTP here, so it can be tested on its own. <slug>/<slug>.json is the source of truth; <SLUG>_STYLE_GUIDE.md beside it is rendered from it."""
import copy, json, os, re, time, uuid
from pathlib import Path

CATS = [("overall-aesthetic", "Overall aesthetic"), ("mood-emotion", "Mood and emotion"), ("color-palette", "Color palette"),
        ("lighting", "Lighting"), ("camera-angles", "Camera angles"), ("camera-movement", "Camera movement"),
        ("shot-composition", "Shot composition"), ("editing-rhythm", "Editing rhythm"), ("transitions", "Transitions"),
        ("typography", "Typography"), ("music-sound", "Music and sound"), ("storytelling", "Storytelling")]
CAT_IDS = [c[0] for c in CATS]
SOURCES = ("user", "refs")
LEARN_STATUS = ("open", "guide", "rulebook")
IMG_EXT, VID_EXT = ("png", "jpg", "jpeg", "webp", "gif"), ("mp4", "mov", "webm", "m4v")
CONTENT = ("categories", "rulebook", "graphics", "graphics_summary", "learnings")   # what Update sees, edits and undoes
GFX_TEXT = ("use", "why", "avoid", "kind", "situation", "fit")                       # a motion graphic's extra text fields
SITUATIONS = ("Show the real page, post or document", "Read a quote, comment or message", "Name a place or move to a new place",
              "Give a date or time", "Introduce a person or account", "Show a video in its context (platform, CCTV, phone, file)",
              "Point at a detail", "Stress a number, fact or outcome", "Compare or show many things", "Open a section or chapter",
              "Something breaks, goes wrong or feels uncanny", "Credit, warn or disclose", "Hide or censor something",
              "Move between shots")                                                  # "narration does X" groups for graphics
MEDIA_RE = re.compile(r"^[0-9a-f]{16}\.(" + "|".join(IMG_EXT + VID_EXT) + r")$")   # uploads live in styleguide/<slug>/media/


class OpError(ValueError):
    pass


def today():
    return time.strftime("%Y-%m-%d")


def new_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:8]}"


def empty_guide():
    return {"version": 1, "rev": 0, "saved": "", "categories": [{"id": i, "name": n, "summary": "", "rules": []} for i, n in CATS],
            "rulebook": [], "graphics": [], "graphics_summary": "", "learnings": [], "updates": []}


def cat(g, cid):
    return next((c for c in g["categories"] if c["id"] == cid), None)


def find_rule(g, rid):
    for c in g["categories"]:
        for r in c["rules"]:
            if r["id"] == rid:
                return c, r
    return None


def find_graphic(g, gid):
    return next((x for x in g.get("graphics", []) if x["id"] == gid), None)


GFX_SECTION = {"name": "Motion graphics"}     # stands in for a category in change messages


def _txt(x):
    return isinstance(x, str) and x.strip() != ""


def media_kind(file):
    """'image' / 'video' for a valid upload file name, else None."""
    m = MEDIA_RE.match(file) if isinstance(file, str) else None
    return None if not m else ("image" if m.group(1) in IMG_EXT else "video")


def _check_item(r, who, e):
    """Text, optional title, board-clip evidence and uploaded media of a rule or rule-book entry."""
    if not _txt(r.get("text")): e.append(f"{who}: empty text")
    if "title" in r and not isinstance(r["title"], str): e.append(f"{who}: title must be text")
    for ev in r.get("evidence", []):
        if not isinstance(ev, dict): e.append(f"{who}: bad evidence"); continue
        if not (isinstance(ev.get("sf_in"), int) and isinstance(ev.get("sf_out"), int) and 0 <= ev["sf_in"] <= ev["sf_out"]):
            e.append(f"{who}: evidence {ev.get('clip')} has bad frames")
        if not _txt(ev.get("clip")): e.append(f"{who}: evidence without clip id")
    for m in r.get("media", []):
        if not isinstance(m, dict) or media_kind(m.get("file")) is None or m.get("kind") != media_kind(m.get("file")):
            e.append(f"{who}: bad media {m!r:.80}")


def validate(g):
    """Problems as a list of strings; [] means valid."""
    e = []
    if [c.get("id") for c in g.get("categories", [])] != CAT_IDS:
        e.append("categories must be exactly the 12 fixed ones, in order")
    ids = []
    for c in g.get("categories", []):
        for r in c.get("rules", []):
            ids.append(r.get("id")); _check_item(r, f"rule {r.get('id')}", e)
            if r.get("source") not in SOURCES: e.append(f"rule {r.get('id')}: source must be user or refs")
    for b in g.get("rulebook", []):
        ids.append(b.get("id")); _check_item(b, f"rule book {b.get('id')}", e)
    if not isinstance(g.get("graphics", []), list): e.append("graphics must be a list")
    for x in g.get("graphics", []) if isinstance(g.get("graphics", []), list) else []:
        ids.append(x.get("id")); who = f"graphic {x.get('id')}"; _check_item(x, who, e)
        if not _txt(x.get("title")): e.append(f"{who}: needs a title")
        if any(k in x and not isinstance(x[k], str) for k in GFX_TEXT): e.append(f"{who}: {', '.join(GFX_TEXT)} must be text")
        if x.get("source") not in SOURCES: e.append(f"{who}: source must be user or refs")
    if not isinstance(g.get("graphics_summary", ""), str): e.append("graphics_summary must be text")
    for l in g.get("learnings", []):
        ids.append(l.get("id"))
        if not _txt(l.get("text")): e.append(f"learning {l.get('id')}: empty text")
        if l.get("status") not in LEARN_STATUS: e.append(f"learning {l.get('id')}: bad status")
    if any(not _txt(i) for i in ids): e.append("every item needs an id")
    dup = sorted({i for i in ids if ids.count(i) > 1 and i})
    if dup: e.append(f"duplicate ids: {dup}")
    return e


def _need(op, *keys):
    for k in keys:
        if k not in op: raise OpError(f"{op.get('op')}: missing {k}")


def _title(r, op):
    """An op's optional "title" (a short name for the rule). An empty string clears it."""
    if "title" in op:
        if not isinstance(op["title"], str): raise OpError(f"{op.get('op')}: title must be text")
        t = op["title"].strip()
        if t: r["title"] = t[:80]
        else: r.pop("title", None)
    return r


def apply_ops(g, ops):
    """Apply ops to a copy. Returns (new guide, list of human-readable changes). Raises OpError; g is never modified."""
    g = copy.deepcopy(g); ch = []
    for op in ops:
        k = op.get("op")
        if k == "add_rule":
            _need(op, "cat", "text"); c = cat(g, op["cat"])
            if not c: raise OpError(f"add_rule: no category {op['cat']}")
            if not _txt(op["text"]): raise OpError("add_rule: empty text")
            r = {"id": new_id("r"), "text": op["text"].strip(), "source": op.get("source", "refs"), "evidence": list(op.get("evidence", []))}
            _title(r, op)
            c["rules"].append(r); ch.append(f"{c['name']}: added \"{r['text']}\"")
        elif k in ("edit_rule", "delete_rule", "add_evidence", "remove_evidence"):
            _need(op, "id"); f = find_rule(g, op["id"])
            if not f and k in ("add_evidence", "remove_evidence") and find_graphic(g, op["id"]):
                f = (GFX_SECTION, find_graphic(g, op["id"]))
            if not f: raise OpError(f"{k}: no rule {op['id']}")
            c, r = f
            if k == "edit_rule":
                _need(op, "text")
                if not _txt(op["text"]): raise OpError("edit_rule: empty text")
                ch.append(f"{c['name']}: \"{r['text']}\" -> \"{op['text'].strip()}\""); r["text"] = op["text"].strip(); _title(r, op)
            elif k == "delete_rule":
                c["rules"].remove(r); ch.append(f"{c['name']}: removed \"{r['text']}\"")
            elif k == "add_evidence":
                _need(op, "clip", "sf_in", "sf_out")
                r.setdefault("evidence", []).append({x: op.get(x, "") for x in ("clip", "prod", "src", "sf_in", "sf_out", "label")})
                ch.append(f"{c['name']}: evidence {op.get('label') or op['clip']} added")
            else:
                n = len(r.get("evidence", [])); r["evidence"] = [e for e in r.get("evidence", []) if e["clip"] != op.get("clip")]
                if len(r["evidence"]) == n: raise OpError(f"remove_evidence: rule {op['id']} has no clip {op.get('clip')}")
                ch.append(f"{c['name']}: evidence {op.get('clip')} removed")
        elif k == "set_summary":
            _need(op, "cat", "text"); c = cat(g, op["cat"])
            if not c: raise OpError(f"set_summary: no category {op['cat']}")
            c["summary"] = op["text"].strip(); ch.append(f"{c['name']}: summary updated")
        elif k == "add_rulebook":
            _need(op, "text")
            if not _txt(op["text"]): raise OpError("add_rulebook: empty text")
            g["rulebook"].append(_title({"id": new_id("b"), "text": op["text"].strip(), "since": today(), "from": op.get("from", "update")}, op))
            ch.append(f"RULE BOOK: added \"{op['text'].strip()}\"")
        elif k in ("edit_rulebook", "delete_rulebook"):
            _need(op, "id"); b = next((x for x in g["rulebook"] if x["id"] == op["id"]), None)
            if not b: raise OpError(f"{k}: no rule book entry {op['id']}")
            if k == "edit_rulebook":
                _need(op, "text")
                if not _txt(op["text"]): raise OpError("edit_rulebook: empty text")
                ch.append(f"RULE BOOK: \"{b['text']}\" -> \"{op['text'].strip()}\""); b["text"] = op["text"].strip(); _title(b, op)
            else:
                g["rulebook"].remove(b); ch.append(f"RULE BOOK: removed \"{b['text']}\"")
        elif k == "add_graphic":
            _need(op, "title", "text", "use")
            if not (_txt(op["title"]) and _txt(op["text"])): raise OpError("add_graphic: empty title or text")
            x = {"id": new_id("g"), "title": op["title"].strip()[:80], "text": op["text"].strip(),
                 "source": op.get("source", "refs") if op.get("source") in SOURCES else "refs", "evidence": list(op.get("evidence", []))}
            _gfx_text(x, op); g.setdefault("graphics", []).append(x); ch.append(f"Motion graphics: added \"{x['title']}\"")
        elif k in ("edit_graphic", "delete_graphic"):
            _need(op, "id"); x = find_graphic(g, op["id"])
            if not x: raise OpError(f"{k}: no graphic {op['id']}")
            if k == "delete_graphic":
                g["graphics"].remove(x); ch.append(f"Motion graphics: removed \"{x['title']}\""); continue
            if "text" in op:
                if not _txt(op["text"]): raise OpError("edit_graphic: empty text")
                x["text"] = op["text"].strip()
            if "title" in op:
                if not _txt(op["title"]): raise OpError("edit_graphic: empty title")
                x["title"] = op["title"].strip()[:80]
            _gfx_text(x, op); ch.append(f"Motion graphics: edited \"{x['title']}\"")
        elif k == "set_graphics_summary":
            _need(op, "text"); g["graphics_summary"] = str(op["text"]).strip(); ch.append("Motion graphics: summary updated")
        else:
            raise OpError(f"unknown op {k!r}")
    return g, ch


def _gfx_text(x, op):
    """Copy a graphic op's optional GFX_TEXT fields. An empty string clears every field except use."""
    for f in GFX_TEXT:
        if f not in op: continue
        if not isinstance(op[f], str): raise OpError(f"{op.get('op')}: {f} must be text")
        v = op[f].strip()
        if v or f == "use": x[f] = v
        else: x.pop(f, None)


def promote(g, lid, to, cat_id=None):
    g = copy.deepcopy(g); l = next((x for x in g["learnings"] if x["id"] == lid), None)
    if not l: raise OpError(f"no learning {lid}")
    if l["status"] != "open": raise OpError(f"learning {lid} is already promoted")
    if to == "guide":
        c = cat(g, cat_id)
        if not c: raise OpError(f"no category {cat_id}")
        r = {"id": new_id("r"), "text": l["text"], "source": "user", "evidence": []}; c["rules"].append(r); l["target"] = r["id"]
    elif to == "rulebook":
        b = {"id": new_id("b"), "text": l["text"], "since": today(), "from": f"learning:{lid}"}; g["rulebook"].append(b); l["target"] = b["id"]
    else:
        raise OpError(f"promote to {to!r}?")
    l["status"] = to
    return g


def _head(r):
    t = (r.get("title") or "").strip()
    return f"**{t}**: {r['text']}" if t else r["text"]


def _refs(r):
    ev = "; ".join(e.get("label") or e["clip"] for e in r.get("evidence", []))
    md = ", ".join(f"[{(m.get('name') or m['file']).replace(']', '')}](media/{m['file']})" for m in r.get("media", []))
    return (f" — see {ev}" if ev else "") + (f" — examples: {md}" if md else "")


FARRELL_META = {
    "name": "Farrell", "slug": "farrell", "port": 8767,
    "intro": ["Horror documentary style, learned from the 5 Farrell references.",
              "Follow it top to bottom on every Farrell edit. The rule book comes first and is never skipped."],
    "legend": "How to read it: *(set by you)* marks the channel owner's own rules; the rest are learned from the references. Both are binding. "
              "\"see vNN · title\" names an example clip on the Farrell board (v01 Internet Archive, v02 YouTube Kids, v03 TV news, "
              "v04 Russian internet, v05 Arabic internet). A *treated* (graphic) shot is anything built in the edit: pages, photos, titles, maps. "
              "*Raw footage* is source video kept as it is; it gets no added texture, vignette or desaturation."}


def meta(g):
    """Which channel this guide is for. Old files have no "meta" and are the Farrell guide."""
    return {**FARRELL_META, **(g.get("meta") or {})}


def render_md(g):
    m = meta(g); intro = list(m["intro"])
    intro[0] = f"{intro[0]} Rev {g.get('rev', 0)}, saved {g.get('saved', '')}."
    L = [f"<!-- GENERATED from styleguide/{m['slug']}/{m['slug']}.json by styleguide/model.py. Do not edit by hand: edit at http://localhost:{m['port']} -->",
         f"# {m['name']} Style Guide", ""] + intro + ["", m["legend"], "",
         "## Rule book (never break these)", ""]
    L += [f"{i}. {_head(b)}{_refs(b)}" for i, b in enumerate(g["rulebook"], 1)] or ["(empty)"]
    for i, c in enumerate(g["categories"], 1):
        L += ["", f"## {i}. {c['name']}", ""]
        if c.get("summary"): L += [c["summary"], ""]
        for r in c["rules"]:
            L.append(f"- {_head(r)}" + (" *(set by you)*" if r["source"] == "user" else "") + _refs(r))
        if not c["rules"]: L.append("- (no rules yet)")
    L += render_graphics_md(g)
    op = [l for l in g["learnings"] if l["status"] == "open"]
    L += ["", "## Open learnings", ""] + ([f"- {l['date']}: {l['text']}" for l in op] or ["(none)"])
    return "\n".join(L) + "\n"


def _cell(t):
    return " ".join(str(t or "").split()).replace("|", "/") or "-"


def render_graphics_md(g):
    gs = g.get("graphics", [])
    L = ["", "## Motion graphics (which one, when)", ""]
    if g.get("graphics_summary"): L += [g["graphics_summary"], ""]
    if not gs: return L + ["(no motion graphics yet)"]
    gs = sorted_graphics(gs)
    if any(x.get("situation") for x in gs):
        nm = meta(g)["name"]
        L += ["### Which graphic for which moment", "",
              f"Find what the narration is doing. Pick the first graphic that fits. \"no\" = does not fit {nm}, do not use it.", "",
              f"| Narration does | Graphic | Use it when | Why | Not when | Fits {nm} |", "|---|---|---|---|---|---|"]
        prev = None
        for x in gs:
            s = x.get("situation") or "Other"
            L.append(f"| {_cell(s) if s != prev else ''} | {_cell(x['title'])} | {_cell(x.get('use'))} | {_cell(x.get('why'))} "
                     f"| {_cell(x.get('avoid'))} | {_cell(x.get('fit'))} |"); prev = s
    else:
        L += ["| Graphic | Use it when | Not when |", "|---|---|---|"]
        L += [f"| {_cell(x['title'])} | {_cell(x.get('use'))} | {_cell(x.get('avoid'))} |" for x in gs]
    L += ["", "### What each graphic looks like", ""]
    for x in gs:
        kind = f" ({x['kind']})" if x.get("kind") else ""
        L.append(f"- **{x['title']}**{kind}: {x['text']}" + (" *(set by you)*" if x.get("source") == "user" else "") + _refs(x))
    return L


def fit_rank(x):
    """0 = fits, 1 = fits with a change, 2 = does not fit, 3 = not judged."""
    f = (x.get("fit") or "").strip().lower()
    return 0 if f == "yes" else 1 if f.startswith("adapt") else 2 if f.startswith("no") else 3


def sorted_graphics(gs):
    """Group by situation (fixed order, unknown last); inside a group: fits first, then the owner's own, then the guide order."""
    pos = {x["id"]: i for i, x in enumerate(gs)}
    so = lambda x: SITUATIONS.index(x["situation"]) if x.get("situation") in SITUATIONS else len(SITUATIONS)
    return sorted(gs, key=lambda x: (so(x), fit_rank(x), x.get("source") != "user", pos[x["id"]]))


def load(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))


def _write(path, text):
    path = Path(path); tmp = path.with_name("~" + path.name)
    tmp.write_text(text, encoding="utf-8"); os.replace(tmp, path)


def save(g, path, hist_dir, md_path, keep=20):
    """Validate, back up the current file, write g with rev+1, render the Markdown. Returns the backup name ('' if none)."""
    err = validate(g)
    if err: raise OpError("; ".join(err))
    path, hist_dir = Path(path), Path(hist_dir); hist_dir.mkdir(parents=True, exist_ok=True); bk = ""
    if path.exists():
        old = load(path); bk = f"rev{old.get('rev', 0):05d}-{time.strftime('%Y%m%d-%H%M%S')}.json"
        _write(hist_dir / bk, json.dumps(old, ensure_ascii=False, indent=1))
        for f in sorted(hist_dir.glob("rev*.json"))[:-keep]: f.unlink()
        g["rev"] = old.get("rev", 0) + 1
    else:
        g["rev"] = g.get("rev", 0) + 1
    g["saved"] = time.strftime("%Y-%m-%dT%H:%M:%S")
    _write(path, json.dumps(g, ensure_ascii=False, indent=1))
    _write(md_path, render_md(g))
    return bk
