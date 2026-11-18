# Ref board at 100,000 clips - implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** the ref board stays smooth (pan, zoom, select, drag) with ~100,000 clips; clips show a still picture (never play on hover); double-click still opens the player.

**Architecture:** a WebGL layer (PixiJS 8.22.0, vendored) draws every node, thumbnail, dot and link; DOM cards exist only when zoomed in and only for on-screen nodes. A uniform grid answers "what is here" for culling, hit tests and marquee. Big boards (> 3,000 nodes) save and undo only what changed; small boards (farrell) keep today's proven full-board save and undo.

**Tech Stack:** vanilla JS (no build), PixiJS 8.22.0 global `PIXI`, Python 3.12 stdlib server, ffmpeg, node `--test` for grid.js.

**Spec:** `docs/superpowers/specs/2026-11-08-board-scale-design.md` (approved 2026-11-08).

**Execution:** Native (the user asked for the process to run without further questions; tasks share `app.js` interfaces tightly). No git in this folder: no commit steps. Rollback = restore the files listed under Rollback.

## Global Constraints

- Server binds 127.0.0.1 only; nothing loads from the internet at run time (`vendor/pixi.min.js` is served locally).
- Never write to source mp4s (hard links into PROJECT). Never hand-edit `productions/_boards/farrell.json`.
- Board json file format unchanged (styleguide/ and tools/deconstruct/ read farrell.json).
- `productions/_boards/stress.json` carries `"sync": false`; the server never mirrors it into any annotations.json.
- UI text set via `textContent`, never innerHTML with board data.
- Thresholds: `BIG = 3000` nodes (patch save + id undo + incremental render above it); FAR when z < 0.3 or > 450 nodes on screen; NEAR re-entered at <= 350; dots when z < 0.05; ZMIN 0.002 with WebGL (0.05 without).
- Targets (spec): load <= 5 s; FAR frame <= 8 ms; NEAR re-cull <= 10 ms at z 1; hit test <= 1 ms; drag move of 1,000 nodes <= 4 ms; selection change <= 5 ms; heap < 1.5 GB; undo of a 1,000-node move < 1 MB.

## Spec amendments (found while reading the code)

1. **ZMIN 0.05 -> 0.002.** At 0.05 a 100k board can never fit on screen (clip 320 px x 0.05 = 16 px). Without WebGL ZMIN stays 0.05.
2. **Small boards keep the full save and full undo.** Patch save and id-undo run only above 3,000 nodes, so the real farrell board keeps the save path that is known to work.
3. **Undo records node ids only.** `snap(nodeIds)` stores each node's json plus every link touching it; restore also removes links touching those nodes that did not exist before. That covers new links (connect, new clip) and link edits without passing link ids. Moves use a compact `snapPos(ids)` ([id, x, y] each).
4. **Thumbnails are always 64x36** (`scale=64:36`): a 9:16 source is squashed into the tile and stretched back by the card rect, so proportions stay right.
5. **Colour-only thumb requests** (`"colors": true`) for dot mode, so a zoomed-out 100k view does not download 100k jpgs.
6. **Patch body limit 256 MB** (a Ctrl+A move of 100k nodes upserts them all); other POSTs keep 40 MB.
7. **`/api/rev` uses an mtime cache** (today it parses the whole file every 4 s; at 100k that is ~1 s of CPU each time).
8. **`sync_annotations` reads boards through an mtime cache and skips `"sync": false` boards** (peeks the first 256 bytes before parsing).
9. **Patch writes keep a `.bak` at most once a minute** (today every write copies a `.bak`; at 95 MB every 2 s that is wasted disk).
10. **Without WebGL** the board keeps today's (Task C) DOM + SVG renderer, culled through the grid; boards above 3,000 nodes open read-only.

## Review Focus

1. A board edited in two tabs, one patching while the other loads: the loader must get the patched state (GET flushes pending writes first) - test `test_get_after_patch_sees_change`.
2. The server stopped (Ctrl+C) within 2 s of an edit: the edit must be on disk - test `test_flush_all_writes_pending`.
3. Undo after creating a clip on a big board: the clip and its derived link both disappear, redo brings both back - browser check in Task 11.
4. A clip whose poster cannot be made (bad frame): the board keeps the plain card colour, no endless retry storm (retry every 5 s, only while on screen) - test `test_thumbs_miss_then_hit`.
5. Dragging a card when zoomed far out (FAR mode, no DOM cards): the card is hit by the grid and moves; double-click opens the player - browser check in Task 11.

## Files

| File | Change |
|---|---|
| `tools/ref-annotator/grid.js` | new: uniform grid (classic script, `module.exports` guard for node tests) |
| `tools/ref-annotator/thumbs.js` | new: thumbnail batch requests + atlas pages |
| `tools/ref-annotator/scene.js` | new: Pixi scene (bodies, headers, thumbs, dots, link chunks, selection, drag ghost) |
| `tools/ref-annotator/app.js` | indexes, modes, card pool, hit tests, id undo, patch save, hover video removed |
| `tools/ref-annotator/focus.js` | `kidsOf`/`shotAt` via the parent index; `snap` callers pass ids |
| `tools/ref-annotator/index.html`, `app.css` | `canvas#gl`, script tags, hover video css removed |
| `tools/ref-annotator/serve.py` | thumbs endpoint + workers, patch save + cache + flush, rev cache, sync skip, STATIC entries |
| `tools/ref-annotator/tests/test_serve.py` | thumbs + patch tests |
| `tools/ref-annotator/tests/grid.test.mjs` | grid tests (node --test) |
| `tools/ref-annotator/tests/make_stress_board.py` | writes `productions/_boards/stress.json` |
| `tools/ref-annotator/README.md`, `CLAUDE.md` | how it works, lesson |

---

### Task 1: No video on hover

**Files:** Modify `app.js` (makeNodeEl hover listeners, `startHover`/`stopHover`, the `stopHover()` call in the pointerdown handler), `app.css` (`.media video` rule).

- [ ] Remove the two `.media` `mouseenter`/`mouseleave` listeners in `makeNodeEl`, delete `startHover`/`stopHover`, remove their callers, and drop `video` from the `.media img, .media video` selector.
- [ ] Check: `grep -n "startHover\|stopHover" app.js focus.js` prints nothing; in the browser hovering a clip shows its poster and no `<video>` appears inside `#nodes`.

### Task 2: Grid + indexes

**Files:** Create `grid.js`, `tests/grid.test.mjs`. Modify `app.js` (`kids`, `place`, marquee, `fitTo`), `focus.js` (`kidsOf`, `shotAt`), `index.html` (script tag before app.js), `serve.py` STATIC.

**Interfaces (produces):**
- `new Grid(rectOf, cell = 2048)`; `rectOf(id) -> {x, y, w, h} | null`.
- `grid.insert(id)`, `grid.remove(id)`, `grid.clear()`, `grid.query(x0, y0, x1, y1) -> id[]` (exact overlap), `grid.count(x0, y0, x1, y1, limit) -> n` (stops at `limit`), `grid.hit(x, y) -> id[]`.
- app.js `IX = { grid, egrid, kids: Map<parentId, id[]>, adj: Map<nodeId, Set<edgeId>>, eById: Map }`, `reindex()` (full, <= 50 ms at 100k), `ixMove(ids)` (re-insert nodes and their links).
- `kids(id) -> node[]` via `IX.kids`; `edgesOf(id) -> edge[]` via `IX.adj`.

- [ ] **Step 1: failing test** `tests/grid.test.mjs`

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { Grid } = createRequire(import.meta.url)("../grid.js");

const rects = new Map();
const g = () => new Grid((id) => rects.get(id));
test("query returns only overlapping ids, across cells and negative coords", () => {
  rects.clear(); const G = g();
  rects.set("a", { x: 0, y: 0, w: 100, h: 100 }); rects.set("b", { x: 5000, y: 5000, w: 10, h: 10 });
  rects.set("c", { x: -3000, y: -10, w: 6000, h: 20 });
  for (const k of rects.keys()) G.insert(k);
  assert.deepEqual(G.query(50, 50, 60, 60).sort(), ["a", "c"].sort().filter((k) => k !== "c" || true).sort().filter((k) => k === "a"));
  assert.deepEqual(G.query(-2900, -5, -2800, 5), ["c"]);
  assert.deepEqual(G.query(4990, 4990, 5001, 5001), ["b"]);
});
test("remove and re-insert after a move", () => {
  rects.clear(); const G = g(); rects.set("a", { x: 0, y: 0, w: 10, h: 10 }); G.insert("a");
  rects.set("a", { x: 9000, y: 0, w: 10, h: 10 }); G.insert("a");
  assert.deepEqual(G.query(0, 0, 20, 20), []); assert.deepEqual(G.query(9000, 0, 9005, 5), ["a"]);
  G.remove("a"); assert.deepEqual(G.query(9000, 0, 9005, 5), []);
});
test("huge rects go to the big set and are still found", () => {
  rects.clear(); const G = g(); rects.set("w", { x: -1e6, y: -1e6, w: 2e6, h: 2e6 }); G.insert("w");
  assert.deepEqual(G.query(10, 10, 11, 11), ["w"]); assert.equal(G.cells.size, 0);
});
test("count stops at limit; hit finds a point", () => {
  rects.clear(); const G = g();
  for (let i = 0; i < 1000; i++) { rects.set("n" + i, { x: (i % 40) * 50, y: Math.floor(i / 40) * 50, w: 40, h: 40 }); G.insert("n" + i); }
  assert.equal(G.count(0, 0, 1e5, 1e5, 451), 451);
  assert.deepEqual(G.hit(55, 5), ["n1"]); assert.deepEqual(G.hit(45, 5), []);
});
test("100k inserts + a screen query are fast", () => {
  rects.clear(); const G = g(); const t = performance.now();
  for (let i = 0; i < 100000; i++) { rects.set("n" + i, { x: (i % 300) * 360, y: Math.floor(i / 300) * 290, w: 320, h: 250 }); G.insert("n" + i); }
  const t1 = performance.now(); const q = G.query(0, 0, 1920, 1080); const t2 = performance.now();
  assert.ok(t1 - t < 400, `insert ${t1 - t} ms`); assert.ok(t2 - t1 < 2, `query ${t2 - t1} ms`); assert.ok(q.length > 0);
});
```
(Fix the first assertion while writing: expected `["a"]` - `c` spans y -10..10 and does not reach y 50.)

- [ ] **Step 2:** `cd tools/ref-annotator && node --test tests/grid.test.mjs` -> FAIL (cannot find `../grid.js`).
- [ ] **Step 3: implement** `grid.js`

```js
"use strict";
// grid.js - uniform spatial grid: which nodes / links overlap a world rect, without looping over all of them.
(function (root) {
  const OFF = 32768, BIG = 1024;
  const key = (i, j) => (i + OFF) * 65536 + (j + OFF);
  class Grid {
    constructor(rectOf, cell = 2048) { this.rectOf = rectOf; this.cell = cell; this.clear(); }
    clear() { this.cells = new Map(); this.where = new Map(); this.big = new Set(); }
    span(r) { const c = this.cell; return [Math.floor(r.x / c), Math.floor(r.y / c), Math.floor((r.x + r.w) / c), Math.floor((r.y + r.h) / c)]; }
    insert(id) {
      this.remove(id); const r = this.rectOf(id); if (!r) return;
      const [i0, j0, i1, j1] = this.span(r);
      if ((i1 - i0 + 1) * (j1 - j0 + 1) > BIG) { this.big.add(id); this.where.set(id, null); return; }
      const ks = [];
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const k = key(i, j); let s = this.cells.get(k); if (!s) this.cells.set(k, (s = new Set())); s.add(id); ks.push(k);
      }
      this.where.set(id, ks);
    }
    remove(id) {
      if (!this.where.has(id)) return; const ks = this.where.get(id); this.where.delete(id);
      if (!ks) { this.big.delete(id); return; }
      for (const k of ks) { const s = this.cells.get(k); if (s && s.delete(id) && !s.size) this.cells.delete(k); }
    }
    // calls fn(id) once for every id whose rect overlaps [x0,x1]x[y0,y1]; fn returning true stops the walk
    each(x0, y0, x1, y1, fn) {
      const seen = new Set(), test = (id) => {
        if (seen.has(id)) return false; seen.add(id); const r = this.rectOf(id);
        return r && r.x < x1 && r.x + r.w > x0 && r.y < y1 && r.y + r.h > y0 ? fn(id) === true : false;
      };
      for (const id of this.big) if (test(id)) return;
      const [i0, j0, i1, j1] = this.span({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      if ((i1 - i0 + 1) * (j1 - j0 + 1) > this.cells.size) {   // rect covers more cells than exist: walk the cells instead
        for (const [k, s] of this.cells) {
          const i = Math.floor(k / 65536) - OFF, j = (k % 65536) - OFF;
          if (i < i0 || i > i1 || j < j0 || j > j1) continue;
          for (const id of s) if (test(id)) return;
        }
        return;
      }
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const s = this.cells.get(key(i, j)); if (s) for (const id of s) if (test(id)) return;
      }
    }
    query(x0, y0, x1, y1) { const out = []; this.each(x0, y0, x1, y1, (id) => { out.push(id); }); return out; }
    count(x0, y0, x1, y1, limit) { let n = 0; this.each(x0, y0, x1, y1, () => ++n >= limit); return n; }
    hit(x, y) { return this.query(x, y, x + 1e-6, y + 1e-6); }
  }
  root.Grid = Grid;
  if (typeof module !== "undefined") module.exports = { Grid };
})(typeof window !== "undefined" ? window : globalThis);
```

- [ ] **Step 4:** `node --test tests/grid.test.mjs` -> 5 pass.
- [ ] **Step 5: indexes in app.js.** Add after `nodeH`:

```js
const BIG = 3000;
const IX = { grid: null, egrid: null, kids: new Map(), adj: new Map(), eById: new Map(), ver: null };
const nodeRect = (id) => { const n = byId(id); return n ? { x: n.x, y: n.y, w: nodeW(n), h: nodeH(n) } : null; };
const edgeRect = (id) => { const e = IX.eById.get(id), p = e && edgePts(e); if (!p) return null;
  const x0 = Math.min(p[0], p[4]), x1 = Math.max(p[6], p[2]), y0 = Math.min(p[1], p[7]), y1 = Math.max(p[1], p[7]);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 + 1 }; };
function reindex() {
  const b = S.board; IX.grid = new Grid(nodeRect); IX.egrid = new Grid(edgeRect);
  IX.kids = new Map(); IX.adj = new Map(); IX.eById = new Map();
  for (const n of b.nodes) { IX.grid.insert(n.id); if (n.parent) { const a = IX.kids.get(n.parent); a ? a.push(n.id) : IX.kids.set(n.parent, [n.id]); } }
  for (const e of b.edges) { IX.eById.set(e.id, e); for (const k of [e.from, e.to]) { let s = IX.adj.get(k); if (!s) IX.adj.set(k, (s = new Set())); s.add(e.id); } IX.egrid.insert(e.id); }
  IX.ver = [b.nodes, b.edges, b.nodes.length, b.edges.length];
}
const ixStale = () => !IX.ver || IX.ver[0] !== S.board.nodes || IX.ver[1] !== S.board.edges || IX.ver[2] !== S.board.nodes.length || IX.ver[3] !== S.board.edges.length;
function ix() { if (ixStale()) reindex(); return IX; }
function ixMove(ids) { const I = ix(); for (const id of ids) { I.grid.insert(id); for (const eid of I.adj.get(id) || []) I.egrid.insert(eid); } }
const kids = (id) => (ix().kids.get(id) || []).map(byId).filter((n) => n && n.parent === id);
const edgesOf = (id) => [...(ix().adj.get(id) || [])].map((k) => IX.eById.get(k)).filter(Boolean);
```
`ix()` rebuilds lazily when the arrays were replaced or their length changed (adds/deletes), so callers need no bookkeeping beyond `ixMove` after position changes. Changing a node's `parent` in place without changing length does not happen in the code (checked: only creators set `parent`).
- [ ] **Step 6:** replace linear loops: `place` (grid query of the candidate rect + gap), marquee (`ix().grid.query`), `retrimClip`/`deleteSel` use `kids` (already), panel `mine` links use `edgesOf(n.id)`, `startConnect` duplicate check uses `edgesOf(fromId)`, `editEdgeLabel`/`deleteSel`/panel edge lookups use `ix().eById.get(id)`; focus.js `kidsOf = kids`, `shotAt = (k) => kids(F.node.id).find((x) => x.type === "shot" && x.pf === k)`. After every position change (drag drop, place, retrim layout) call `ixMove(ids)`.
- [ ] **Step 7:** farrell in the browser: marquee, new clip placement, retrim, delete subtree behave as before; `node --test` still passes.

### Task 3: Server thumbnails

**Files:** Modify `serve.py` (new `thumb()`, `thumb_img()`, `thumbs_batch()`, `THQ` worker queue, `send_bytes`, POST `/api/thumbs`). Test `tests/test_serve.py` class `Thumbs`.

**Interfaces (produces):** `POST /api/thumbs` body `{"keys": [{"v": src, "f": frame|null} | {"img": path, "ver": n}], "colors": bool}` (<= 256 keys) -> `application/octet-stream`: 4-byte big-endian header length, JSON header `[{"k": i, "off": n, "len": n, "c": [r, g, b]} | {"k": i, "c": [r, g, b]} | {"k": i, "miss": true}]`, then jpg bytes (no bytes when `colors`). Thumb files: `<ann_dir>/thumbs/<poster stem>.jpg` + `.rgb` (3 bytes); shot thumbs `<image dir>/thumbs/<stem>_v<ver>.jpg/.rgb`.

- [ ] **Step 1: failing tests** (append to `test_serve.py`; reuse the `demo` source made by `Poster.setUpClass`, so move that source creation to module level `make_source()` called by both classes):

```python
def post(url, body):
    r = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(r, timeout=60) as resp:
        return resp.status, resp.read()

def unpack(raw):
    n = int.from_bytes(raw[:4], "big"); head = json.loads(raw[4:4 + n]); return head, raw[4 + n:]

@unittest.skipUnless(shutil.which("ffmpeg"), "needs ffmpeg")
class Thumbs(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        make_source(); cls.srv = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.url = f"http://127.0.0.1:{cls.srv.server_address[1]}/api/thumbs"
    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.srv.server_close()

    def test_thumbs_miss_then_hit(self):
        key = {"v": "demo/01_reference/source/a.mp4", "f": 7}
        code, raw = post(self.url, {"keys": [key]}); head, _ = unpack(raw)
        self.assertEqual(code, 200); self.assertEqual(head[0]["k"], 0)
        for _ in range(100):                      # the miss is made in the background
            head, data = unpack(post(self.url, {"keys": [key]})[1])
            if not head[0].get("miss"): break
            time.sleep(0.1)
        h = head[0]; jpg = data[h["off"]:h["off"] + h["len"]]
        self.assertTrue(jpg.startswith(b"\xff\xd8")); self.assertEqual(len(h["c"]), 3)

    def test_colors_only_sends_no_bytes(self):
        key = {"v": "demo/01_reference/source/a.mp4", "f": 3}
        for _ in range(100):
            head, data = unpack(post(self.url, {"keys": [key], "colors": True})[1])
            if not head[0].get("miss"): break
            time.sleep(0.1)
        self.assertIn("c", head[0]); self.assertNotIn("len", head[0]); self.assertEqual(data, b"")

    def test_bad_key_is_a_miss_not_a_crash(self):
        head, _ = unpack(post(self.url, {"keys": [{"v": "../etc/passwd", "f": 1}, {"v": "nope/x.mp4", "f": 1}]})[1])
        self.assertTrue(all(h.get("miss") for h in head)); self.assertEqual([h["k"] for h in head], [0, 1])

    def test_too_many_keys_refused(self):
        with self.assertRaises(urllib.error.HTTPError) as e:
            post(self.url, {"keys": [{"v": "a", "f": 1}] * 257})
        self.assertEqual(e.exception.code, 400)
```
- [ ] **Step 2:** `python -m unittest discover -s tests` -> the 4 new tests FAIL (404).
- [ ] **Step 3: implement** in `serve.py` after `poster()`:

```python
THQ = queue.Queue(); THQ_SEEN = set(); THQ_LOCK = threading.Lock()

def _thumb_from(img, out):
    """64x36 jpg + 3-byte mean colour from one ffmpeg run. Returns (jpg_path, rgb_path)."""
    rgb = out.with_suffix(".rgb")
    if out.exists() and rgb.exists() and out.stat().st_mtime >= img.stat().st_mtime:
        return out, rgb
    out.parent.mkdir(parents=True, exist_ok=True)
    tj, tr = out.with_name("~" + out.name), rgb.with_name("~" + rgb.name)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-y", "-i", str(img), "-filter_complex",
                        "[0]scale=64:36,split[a][b];[b]scale=1:1[c]", "-map", "[a]", "-q:v", "5", "-f", "image2", str(tj),
                        "-map", "[c]", "-f", "rawvideo", "-pix_fmt", "rgb24", str(tr)], capture_output=True, text=True)
    if r.returncode or not tj.exists() or not tr.exists() or tr.stat().st_size != 3:
        raise RuntimeError("thumb failed: " + (r.stderr.strip().splitlines() or ["?"])[-1][:200])
    os.replace(tr, rgb); os.replace(tj, out)
    return out, rgb

def thumb_paths(k):
    """Where the thumb for key k lives (no work done). Raises on a bad key."""
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
            if not isinstance(k, dict): raise ValueError
            src, out = thumb_paths(k); rgb = out.with_suffix(".rgb")
            if not (out.is_file() and rgb.is_file() and out.stat().st_mtime >= src.stat().st_mtime):
                sk = json.dumps(k, sort_keys=True)
                with THQ_LOCK:
                    if sk not in THQ_SEEN: THQ_SEEN.add(sk); THQ.put(k)
                head.append({"k": i, "miss": True}); continue
            h = {"k": i, "c": list(rgb.read_bytes()[:3])}
            if not body.get("colors"):
                b = out.read_bytes(); h.update(off=off, len=len(b)); blobs.append(b); off += len(b)
            head.append(h)
        except Exception:
            head.append({"k": i, "miss": True})
    hj = json.dumps(head).encode()
    return len(hj).to_bytes(4, "big") + hj + b"".join(blobs)
```
`import queue` at the top. Handler: `send_bytes(self, data, ctype)` (200, Content-Type, Content-Length, `Cache-Control: no-store`); in `do_POST`: `if path == "/api/thumbs": return self.send_bytes(thumbs_batch(body), "application/octet-stream")`. A `ValueError` must map to 400 in `fail()` (check `fail`; add the mapping if it is missing).
- [ ] **Step 4:** tests pass (6 total so far); old Poster tests still pass.

### Task 4: Server patch save

**Files:** Modify `serve.py` (`BCACHE`, `REVC`, `board_cached`, `patch_board`, `flush_board`, `flush_all`, `board_rev`, `save_board`, `sync_annotations` read cache + skip, `write_atomic(bak=)`, GET `/api/board` + `/api/rev`, POST `/api/board/patch`, body limit, `main` flush). Test class `Patch`.

**Interfaces (produces):** `POST /api/board/patch?b=<name>` body `{"rev": n, "upsert": {"nodes": [...], "edges": [...]}, "del": {"nodes": [ids], "edges": [ids]}, "view": {...}}` -> `{"ok": true, "rev": n}`; 409 `stale board` when rev differs. Writes reach disk within 2 s, on GET of that board, on a full POST and on shutdown.

- [ ] **Step 1: failing tests**

```python
class Patch(unittest.TestCase):
    """Saving a 100k-clip board must not re-send and re-write 95 MB per edit: a patch carries only what changed."""
    @classmethod
    def setUpClass(cls):
        (Path(TMP.name) / "_boards").mkdir(exist_ok=True)
        cls.srv = B.ThreadingHTTPServer(("127.0.0.1", 0), B.H)
        threading.Thread(target=cls.srv.serve_forever, daemon=True).start()
        cls.base = f"http://127.0.0.1:{cls.srv.server_address[1]}"
    @classmethod
    def tearDownClass(cls):
        cls.srv.shutdown(); cls.srv.server_close()

    def setUp(self):
        self.name = "p" + uuid.uuid4().hex[:8]
        b = {"sync": False, "rev": 1, "nodes": [{"id": "n1", "type": "point", "x": 0, "y": 0}, {"id": "n2", "type": "point", "x": 9, "y": 9}],
             "edges": [{"id": "e1", "from": "n1", "to": "n2", "kind": "user"}], "view": {"x": 0, "y": 0, "z": 1}}
        B.board_file(self.name).write_text(json.dumps(b), encoding="utf-8")
    def get(self, p):
        with urllib.request.urlopen(self.base + p, timeout=30) as r: return json.loads(r.read())
    def patch(self, body):
        return json.loads(post(f"{self.base}/api/board/patch?b={self.name}", body)[1])
    def disk(self):
        return json.loads(B.board_file(self.name).read_text(encoding="utf-8"))

    def test_upsert_delete_and_rev(self):
        r = self.patch({"rev": 1, "upsert": {"nodes": [{"id": "n3", "type": "point", "x": 1, "y": 1}, {"id": "n1", "type": "point", "x": 5, "y": 5, "note": "hi"}]},
                        "del": {"nodes": ["n2"], "edges": ["e1"]}})
        self.assertEqual(r["rev"], 2); B.flush_all(); d = self.disk()
        self.assertEqual(sorted(n["id"] for n in d["nodes"]), ["n1", "n3"]); self.assertEqual(d["edges"], [])
        self.assertEqual(next(n for n in d["nodes"] if n["id"] == "n1")["note"], "hi"); self.assertEqual(d["rev"], 2)

    def test_stale_rev_is_409(self):
        with self.assertRaises(urllib.error.HTTPError) as e:
            post(f"{self.base}/api/board/patch?b={self.name}", {"rev": 7, "upsert": {"nodes": []}})
        self.assertEqual(e.exception.code, 409)

    def test_rev_and_get_after_patch_see_change(self):
        self.patch({"rev": 1, "view": {"x": 3, "y": 4, "z": 0.5}})
        self.assertEqual(self.get(f"/api/rev?b={self.name}")["rev"], 2)       # before the 2 s flush
        self.assertEqual(self.get(f"/api/board?b={self.name}")["view"]["z"], 0.5)

    def test_outside_write_is_picked_up(self):
        self.patch({"rev": 1, "view": {"x": 1, "y": 1, "z": 1}}); B.flush_all()
        d = self.disk(); d["rev"] = 9; d["nodes"].append({"id": "n9", "type": "point", "x": 0, "y": 0})
        time.sleep(0.05); B.board_file(self.name).write_text(json.dumps(d), encoding="utf-8")
        r = self.patch({"rev": 9, "upsert": {"nodes": [{"id": "n8", "type": "point", "x": 0, "y": 0}]}}); B.flush_all()
        self.assertEqual(r["rev"], 10); self.assertTrue({"n8", "n9"} <= {n["id"] for n in self.disk()["nodes"]})

    def test_full_post_after_patch(self):
        self.patch({"rev": 1, "view": {"x": 1, "y": 1, "z": 1}})
        b = self.get(f"/api/board?b={self.name}"); b["nodes"].append({"id": "n7", "type": "point", "x": 0, "y": 0})
        r = json.loads(post(f"{self.base}/api/board?b={self.name}", b)[1]); self.assertEqual(r["rev"], 3)
        self.assertIn("n7", {n["id"] for n in self.disk()["nodes"]})

    def test_flush_all_writes_pending(self):
        self.patch({"rev": 1, "upsert": {"nodes": [{"id": "n5", "type": "point", "x": 0, "y": 0}]}})
        self.assertNotIn("n5", {n["id"] for n in self.disk()["nodes"]}); B.flush_all()
        self.assertIn("n5", {n["id"] for n in self.disk()["nodes"]})

    def test_bad_id_refused(self):
        with self.assertRaises(urllib.error.HTTPError) as e:
            post(f"{self.base}/api/board/patch?b={self.name}", {"rev": 1, "upsert": {"nodes": [{"id": "../x"}]}})
        self.assertIn(e.exception.code, (400, 403))

    def test_sync_false_board_is_not_mirrored(self):
        self.assertTrue(B.board_skipped(B.board_file(self.name)))
```
(`import json, time, uuid` at the top.)
- [ ] **Step 2:** tests FAIL (404 / missing attrs).
- [ ] **Step 3: implement**

```python
BCACHE = {}        # board name -> {"b": board, "mtime": ns, "ix": {id: i}, "eix": {id: i}, "pending": bool, "t": Timer|None, "slugs": set}
REVC = {}          # board file -> (mtime_ns, rev)
READC = {}         # board file -> (mtime_ns, board) for sync_annotations
LAST_BAK = {}

def _mtime(f):
    try: return f.stat().st_mtime_ns
    except OSError: return None

def board_skipped(f):
    """Boards with "sync": false (the stress board) are never mirrored into annotations.json."""
    try:
        with open(f, "rb") as fh: head = fh.read(256)
    except OSError:
        return True
    return re.search(rb'"sync"\s*:\s*false', head) is not None

def _cache(name):                       # call under LOCK
    f = board_file(name); m = _mtime(f); c = BCACHE.get(name)
    if c and (c["pending"] or c["mtime"] == m):
        return c
    if m is None: raise Refused("no such board")
    b = json.loads(f.read_text(encoding="utf-8")); b.setdefault("nodes", []); b.setdefault("edges", [])
    c = {"b": b, "mtime": m, "ix": None, "eix": None, "pending": False, "t": None, "slugs": set()}
    BCACHE[name] = c; return c

def _validate_node(n):
    check_id(n.get("id"))
    for k in ("src", "file", "image", "flat"):
        if n.get(k):
            if k == "src": source_path(n[k])
            elif k == "file": _rel_parts(n[k])
            else: image_path(n[k], must_exist=False)

def patch_board(name, p):
    if not isinstance(p, dict): raise ValueError("patch must be an object")
    up, de = p.get("upsert") or {}, p.get("del") or {}
    un, ue, dn, dE = up.get("nodes") or [], up.get("edges") or [], de.get("nodes") or [], de.get("edges") or []
    for n in un:
        if not isinstance(n, dict): raise ValueError("node must be an object")
        _validate_node(n)
    for e in ue:
        if not isinstance(e, dict): raise ValueError("edge must be an object")
        check_id(e.get("id"))
    with LOCK:
        c = _cache(name); b = c["b"]
        if p.get("rev") != b.get("rev"):
            raise Stale(f"stale board: you have rev {p.get('rev')}, server has rev {b.get('rev')} - reload")
        if c["ix"] is None or len(c["ix"]) != len(b["nodes"]): c["ix"] = {n["id"]: i for i, n in enumerate(b["nodes"])}
        if c["eix"] is None or len(c["eix"]) != len(b["edges"]): c["eix"] = {e["id"]: i for i, e in enumerate(b["edges"])}
        for n in un:
            i = c["ix"].get(n["id"])
            if i is None: c["ix"][n["id"]] = len(b["nodes"]); b["nodes"].append(n)
            else: c["slugs"].add(_slug(b["nodes"][i])); b["nodes"][i] = n
            c["slugs"].add(_slug(n))
        for e in ue:
            i = c["eix"].get(e["id"])
            if i is None: c["eix"][e["id"]] = len(b["edges"]); b["edges"].append(e)
            else: b["edges"][i] = e
        if dn:
            gone = set(dn); c["slugs"].update(_slug(n) for n in b["nodes"] if n["id"] in gone)
            b["nodes"] = [n for n in b["nodes"] if n["id"] not in gone]; c["ix"] = None
        if dE:
            gone = set(dE); b["edges"] = [e for e in b["edges"] if e["id"] not in gone]; c["eix"] = None
        if isinstance(p.get("view"), dict): b["view"] = p["view"]
        b["rev"] = (b.get("rev") or 0) + 1; b["saved"] = time.strftime("%Y-%m-%dT%H:%M:%S")
        c["pending"] = True
        if not c["t"]:
            c["t"] = threading.Timer(2.0, flush_board, [name]); c["t"].daemon = True; c["t"].start()
        return {"ok": True, "rev": b["rev"], "saved": b["saved"], "nodes": len(b["nodes"])}

def _slug(n):
    s = n.get("src") if isinstance(n, dict) else None
    return s.split("/")[0] if isinstance(s, str) else None

def flush_board(name):
    with LOCK:
        c = BCACHE.get(name)
        if not c: return
        if c["t"]: c["t"].cancel(); c["t"] = None
        if not c["pending"]: return
        b = c["b"]; f = board_file(name); now = time.time()
        bak = now - LAST_BAK.get(name, 0) > 60
        if bak: LAST_BAK[name] = now
        write_atomic(f, json.dumps(b, indent=1 if len(b["nodes"]) <= 5000 else None, ensure_ascii=False), bak=bak)
        c["mtime"] = _mtime(f); c["pending"] = False
        slugs = sorted(s for s in c["slugs"] if s); c["slugs"] = set()
        if slugs and b.get("sync") is not False: sync_annotations(slugs)

def flush_all():
    for name in list(BCACHE): flush_board(name)
```
- `write_atomic(f, data, bak=True)`: copy the `.bak` only when `bak`.
- `board_rev(bf)`: if a cache entry for `bf.stem` is pending return its rev; else `m = _mtime(bf)`; return `REVC[bf][1]` when its mtime matches; else parse, store, return.
- `save_board`: call `flush_board(name)` before taking `LOCK`, and `BCACHE.pop(name, None)` after the write (inside LOCK).
- GET `/api/board`: `flush_board(name)` first. POST body limit: 256 MB for `/api/board/patch`, 40 MB otherwise. `do_POST` route `/api/board/patch` -> `patch_board(q.get("b", ""), body)`. `main()`: `finally: flush_all()`.
- `sync_annotations`: loop `for f in sorted(BOARDS.glob("*.json"))`: `if board_skipped(f): continue`; read through `READC` (mtime-keyed).
- [ ] **Step 4:** all server tests pass; styleguide tests still 41 OK.

### Task 5: Client undo by ids + patch save

**Files:** Modify `app.js` (`snap`, `snapPos`, `restore`, `undo`, `redo`, `mark`, `saveNow`, pagehide beacon, `touchNode`, every `snap()` caller), `focus.js` (snap callers).

**Interfaces (produces):**
- `snap(nodeIds)`: board <= BIG -> today's full-JSON step (ids ignored); else step `{k: "ids", nodes: Map id->json|null, edges: Map id->json, eset: Set}` capturing each node and every link touching it. Always calls `mark(nodeIds)` and records ids for redo.
- `snapPos(ids)`: big boards: step `{k: "pos", p: [[id, x, y], ...]}`; small: same as `snap`.
- `mark(nodeIds, edgeIds = [])`: adds to `D_N`/`D_E` (save) and `R_N` (render). `markDel(nodeIds, edgeIds)`.
- `saveNow()`: nodes <= BIG -> full POST (unchanged); else patch from `D_N`/`D_E`/`DEL_N`/`DEL_E` + `viewDirty`.

- [ ] Restore of an `ids` step: capture the redo step for the same node ids (current json + touching links) first; then for each node id: json null -> remove node; else replace or add. Links: remove every current link touching those node ids whose id is not in the step's `eset`; write back every recorded link. Mark all touched ids (deleted ones via `markDel`). `pos` step: swap x/y with current, `ixMove`.
- [ ] Callers (ids each passes):
  - `retrimClip`: `[n.id, ...kids(n.id).map(k => k.id)]`
  - `createClip`/`createShot`/`createPoint`: generate the new id first, `snap([id, parent.id])`, create with that id (add an optional `id` param to the creators; focus.js shot `add` calls `snap([newShotId, F.node.id])` and passes the id)
  - `addVideo`: `snap([id])`
  - node drag: `snapPos([...movingIds])`
  - `startConnect` new link: `snap([fromId, to])`; `editEdgeLabel` and panel label input: `snap([ed.from, ed.to])`; edge delete (key and panel ✕): `snap([ed.from, ed.to])`
  - `doDelete`: `snap([...ids])` (ids = subtree)
  - `toggleTag`, tag keys 1-9: selected ids; `bindField`: `[n.id]`; shapes ✕ and focus.js shape edit/add: `[node.id]`
- [ ] `touchNode(n)` calls `mark([n.id])`. Explicit marks: `grabShot` result, `ensureAssets` status fix, fps fill in `loadBoard` (mark all filled), `queueFlatten` result, `retrimClip` layout.
- [ ] Beacon on pagehide: big boards send the pending patch to `/api/board/patch`; small boards unchanged.
- [ ] Check: farrell edit -> full POST as before (Network shows `/api/board`); stress edit -> `/api/board/patch` with only the changed node.

### Task 6: Pixi scene + thumbnails (FAR mode)

**Files:** Create `scene.js`, `thumbs.js`. Modify `index.html` (`<canvas id="gl">` first child of `#viewport`; scripts `vendor/pixi.min.js`, `grid.js`, `thumbs.js`, `scene.js` before app.js), `app.css` (`#gl {position:absolute; inset:0; pointer-events:none}`), `serve.py` STATIC (`/vendor/pixi.min.js`, `/grid.js`, `/thumbs.js`, `/scene.js` as `text/javascript; charset=utf-8`), `app.js` (`ZMIN` let, `applyView`, `renderAll`, `renderSel`).

**Interfaces (produces):**
- `GL` (global) = `null` until `await Scene.init(canvas)` resolves; then `Scene` methods:
  - `Scene.setView(x, y, z)` (sets the transform, schedules a render),
  - `Scene.rebuild(nodes, edges)` (all particles + link chunks; <= 300 ms at 100k),
  - `Scene.updateNodes(ids)` (particles of those nodes: rect, tint, thumb),
  - `Scene.edgesChanged(ids)` (dirty their chunks),
  - `Scene.setSelection(nodeIds, edgeId)`,
  - `Scene.dragStart(ids)` / `Scene.dragMove(dx, dy)` / `Scene.dragEnd()`,
  - `Scene.setNodeLayers(on)` (false in NEAR),
  - `Scene.render()` (sync, for timing).
- `Thumbs.want(keys)` (on-screen keys, colours only when `dots`), `Thumbs.get(key) -> {tex, page, c} | null`, `Thumbs.onLoad(fn(keys))`.
- `thumbKey(n)`: clip `v|<mid frame>`, video `v|`, shot `img|<path>|<ver>`, point null (same frames as `posterKey`).

- [ ] **Step 1:** verify the PIXI 8.22.0 names used here exist in the bundle (done for `ParticleContainer`, `Particle`, `addParticle`, `removeParticles`, `particleChildren`, `dynamicProperties`, `isRenderGroup`, `pixelLine`, `Texture.WHITE`, `CanvasSource`, `autoStart`). Check `Texture.WHITE.width` at runtime and scale particles by `w / Texture.WHITE.width`.
- [ ] **Step 2: scene.js.** One `PIXI.Application` (`autoStart: false`, `antialias: false`, `backgroundAlpha: 0`, `resizeTo: viewport`, `preference: "webgl"`); `scene` Container `isRenderGroup: true`; children in order: `links` (Container of chunk Graphics), `bodies`, `heads`, `thumbs` (one ParticleContainer per atlas page), `dots`, `liveLinks` (Graphics), `ghost` (Container of Sprites), `selG` (Graphics). Every ParticleContainer uses `dynamicProperties: {position: false, vertex: false, rotation: false, uvs: false, color: false}` and `update()` after changes. Particle per node: body (`Texture.WHITE`, card rect, tint `0x16181d`), head (rect `HEAD` tall, tint = type colour), thumb (media rect, atlas sub-texture), dot (card rect, tint = average colour or type colour). Node -> particle refs in `Map<id, {b, h, t, d}>`.
- [ ] **Step 3: link chunks.** Each link belongs to the grid cell of its `to` node; chunk = `{g: Graphics, ids: Set, box, dirty}`. Build: per link 12 sampled bezier points (`moveTo`/`lineTo`), `stroke({width: 1, color, alpha, pixelLine: true})`; derived links in grey `0x5b6270`, user links `0xf59e0b`. On each render: chunk visible = box intersects view; derived-chunk Graphics hidden below z 0.05; dirty visible chunks rebuilt (max 8 per frame, the rest next frame). Separate Graphics per chunk for derived and user links.
- [ ] **Step 4: thumbs.js.** Batch queue (<= 256 keys, <= 2 in flight), `fetch` POST `/api/thumbs`, parse header, `createImageBitmap(blob.slice(off, off + len))`, draw into the current page canvas (2048x2048, 32 cols x 56 rows of 64x36), `PIXI.Texture` sub-frames over one `CanvasSource` per page, `source.update()` once per frame when drawn. 8 pages max: when full, clear the least-recently-wanted page (its keys forgotten; `onLoad` lists them so the scene drops those particles). Misses retried every 5 s while still wanted.
- [ ] **Step 5: app.js wiring.** `boot()`: `try { await Scene.init($("gl")); GL = Scene; ZMIN = 0.002 } catch (e) { setStatus("WebGL unavailable - using the simple board" + ..., "err") }`. `applyView()`: `GL && GL.setView(v.x, v.y, v.z)`; mode check (Task 8). `renderAll()`: `GL ? (full or incremental by R_N) : today's path`. `renderSel()`: `GL.setSelection(...)` + card classes + panel; minimap layer not redrawn.
- [ ] **Step 6: check** on stress (after Task 10 exists) with the pane hidden: time `Scene.render()` at fit-all, z 0.05 and z 0.2 (<= 8 ms each).

### Task 7: Hit testing, marquee, connect, double-click (FAR)

**Files:** Modify `app.js` pointer handlers.

**Interfaces (produces):** `hitNode(wx, wy) -> id | null` (topmost = last in `S.board.nodes` order among `grid.hit`), `hitEdge(wx, wy) -> id | null` (egrid candidates in a 6-screen-px box, distance to 16-point sampled bezier <= 6 / z).

- [ ] pointerdown: node = DOM `.node` target when cards are shown, else `hitNode`; port drag only from DOM ports (NEAR). Edge select = `hitEdge` in both modes when GL (SVG `path.hit` only without GL). Marquee uses `ix().grid.query`. dblclick: node via the same rule -> `openFocus`; edge -> `editEdgeLabel`. `startConnect` target under the pointer: DOM `.node` else `hitNode`.
- [ ] Drag (GL): `snapPos`, `Scene.dragStart(ids)`; each move updates node x/y in the model (cheap loop), DOM cards if shown, `Scene.dragMove(dx, dy)`; drop: `ixMove(ids)`, `mark(ids)`, `Scene.dragEnd()`, `Scene.updateNodes(ids)`, links touching moved nodes marked dirty. > 2,000 moving nodes: ghost is one bbox rectangle.
- [ ] Check (stress): `hitNode` and `hitEdge` <= 1 ms; 1,000-node drag move <= 4 ms per step (timed synchronously).

### Task 8: NEAR mode cards and modes

**Files:** Modify `app.js` (`cull`, `renderNodes`, card pool, link labels, mode switch), `app.css` (`.elabel`).

- [ ] Mode per `applyView`: `near = z >= 0.3 && grid.count(screen rect, 451) <= (wasNear ? 450 : 350)`. FAR: return all cards to the pool (hidden), `Scene.setNodeLayers(true)`. NEAR: `Scene.setNodeLayers(false)`; cards for `grid.query(screen + half a screen margin)`: entering ids take a pooled card (`makeNodeEl` only when empty, pool cap 450), `updateNodeEl`; leaving ids return theirs. `els` = the shown cards map (callers already use `els.get(id)` optionally).
- [ ] Link labels in NEAR: absolutely positioned `<span class="elabel">` in `#world` for on-screen links with text (derived: `edgeLabel(child)`, user: `e.label`), pooled, cap 500, `textContent` only.
- [ ] Without GL: today's renderer (all cards, SVG links, culled by `shown`) with `cull` iterating `grid.query` instead of all nodes.
- [ ] Check (stress, z 1): re-cull <= 10 ms; farrell at z 0.5 shows cards, labels, posters as before.

### Task 9: Fallback and big-board read-only

- [ ] No GL and `nodes > BIG`: status "This board needs WebGL (N nodes) - opened read-only", saves and edits disabled (`S.readonly`; `scheduleSave` and `snap` no-ops, pointer edits ignored, pan/zoom work).
- [ ] Check: force `GL = null` via `?nogl=1` URL flag: farrell works as Task C; stress opens read-only.

### Task 10: Stress board

**Files:** Create `tests/make_stress_board.py`.

- [ ] Script: read `productions/_boards/farrell.json` (read only), take its 5 video nodes and the clip `(src, sf_in, sf_out, pf_in, pf_out, fps, size)` tuples; write `productions/_boards/stress.json` with `"sync": false` as the first key, the 5 videos side by side (x step 40,000), 20,000 clips per video in a 100-column block to the right of its video (cell 360 x 290), cycling the farrell clip ranges (so thumbnails exist), one derived link per clip, 1,000 user links between random nearby clips (fixed seed), `rev: 1`, view fit-all-ish. `--count N` (default 100000). Refuses to write to `farrell.json`.
- [ ] Run: `python tests/make_stress_board.py` -> prints node/edge counts and the file size.

### Task 11: Measure and regression-check

- [ ] stress (`?b=stress`), timed synchronously in the pane: load time, `Scene.render()` at fit-all / z 0.05 / z 0.2, NEAR re-cull at z 1, `hitNode`/`hitEdge`, 1,000-node drag step, selection change, heap (`performance.memory`), undo of a 1,000-node move (step size via JSON length), undo of a new clip + its link (both gone, redo brings both).
- [ ] farrell regression: select, marquee, drag, link, edge select + label, minimap, double-click player, panel, undo/redo, shots draw/grab, no console errors, saves are full POSTs.
- [ ] Server: `python -m unittest discover -s tests` (board) and styleguide `python -m unittest discover -s tests` (41) pass; `node --test tests/grid.test.mjs` passes.

### Task 12: Docs

- [ ] README: modes, thumbnails, patch save, stress board, `?nogl=1`, limits. CLAUDE.md lesson: symptom (board could not go past ~4,000 clips) / cause (every node a DOM element, full-board undo and save) / rule (WebGL layer + grid + patch save above 3,000 nodes) / test (grid tests, Patch + Thumbs server tests, stress board timings).

## Rollback

Copy back `app.js`, `app.css`, `serve.py`, `index.html`, `focus.js`, `tests/test_serve.py` from `scratchpad/board-backup2/` (made before Task 1), delete `grid.js`, `scene.js`, `thumbs.js`, `tests/grid.test.mjs`, `tests/make_stress_board.py`, `productions/_boards/stress.json` and the `thumbs/` folders under each production's `01_reference/annotations/`.
