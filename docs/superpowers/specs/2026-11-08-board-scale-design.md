# Ref board at 100,000 clips — design

Date: 2026-11-08. Board: `tools/ref-annotator` (vanilla JS, no build, local only, 127.0.0.1).

## Goal

The board stays smooth (pan, zoom, select, drag) with up to ~100,000 clips and their links, on an
ordinary laptop in Chrome/Edge. Today it holds ~800 clips (`farrell`, 787 nodes, 782 edges, 757 KB json).

## What the user asked for (decisions)

- Hovering a clip or video shows only its picture. Nothing plays on the board.
- Double-click opens the existing player (`openFocus`), unchanged.
- Target: up to ~100,000 clips per board.
- Zoomed out, each clip still shows a tiny picture; when a clip is only a few pixels wide it becomes
  a dot in its picture's average colour.
- Approach: PixiJS (WebGL) for drawing, vendored as one local file. Chosen over hand-written Canvas2D.

## Why the current board cannot reach 100k (measured / researched)

- Every node is a live DOM element (~17 elements each). Page-element boards top out at ~1,000-4,000
  cards (React Flow, tldraw cap 4,000, Kinopio). WebGL boards reach 60k+ (Atlassian whiteboards,
  dev.to "thousands of cards" write-up: PixiJS ~60k smooth; PixiJS 8 official: 200k sprites at 60 fps).
- Undo `snap()` stringifies the whole board, up to 200 copies: ~95 MB each at 100k clips.
- Every save posts the whole board json (~95 MB at 100k).
- `renderAll`, `cull`, `renderEdges`, `kids()` and several panel functions loop over every node.

## Library

- `tools/ref-annotator/vendor/pixi.min.js`, pixi.js **8.22.0** (2026-10-01), MIT, 840,663 bytes,
  from `https://cdn.jsdelivr.net/npm/pixi.js@8.22.0/dist/pixi.min.js`,
  sha256 (base64) `BtnvmCPnQ1GHkwg8KW2AHnUtsSjLH1Gfur434SWVZ+o=` (checked after download).
  Loaded by a `<script>` tag from the local server; nothing loads from the internet at run time.
  `vendor/README.md` records version, source, hash, licence.
- No canvas-renderer fallback is assumed: if WebGL is unavailable the board shows a status-line
  error and keeps the old DOM path for boards under 3,000 nodes (see Fallback).

## Architecture

```
#vp (viewport)
 ├─ <canvas id="gl">        Pixi: every node body / thumbnail / dot, every link, selection, drag ghost
 ├─ #world (DOM, CSS transform, above the canvas)
 │    └─ cards: full DOM cards, only in NEAR mode, only for on-screen nodes (pooled, ≤ 450)
 │    └─ link labels: DOM spans, NEAR mode only, on-screen only (≤ 500)
 └─ minimap, panel, focus player (unchanged)
```

### 1. Spatial index (`grid.js`)

- Uniform grid, cell 2048 world px. `Map<cellKey, Set<id>>` for nodes and for links (a link is put in
  every cell its bounding box covers; long links are few: video→clip curves within one video's area).
- `query(rect) → ids`, `insert / move / remove`, rebuilt in one pass on load (< 50 ms at 100k).
- Replaces the linear loops in `cull`, `renderEdges`, marquee and hit testing.
- Parent→children index replaces `kids()` linear filter.

### 2. Two modes

- **FAR**: zoom < 0.3, or more than 450 nodes on screen. Pixi only. No DOM cards.
- **NEAR**: zoom ≥ 0.3 and ≤ 450 nodes on screen. DOM cards for on-screen nodes (+ half a screen
  margin), on top of the Pixi canvas. Switch back to FAR above 450 (hysteresis: enter NEAR at ≤ 350).
- The mode is recomputed on each view change (one grid query, < 1 ms).

### 3. Pixi scene (FAR and NEAR)

- `app = new PIXI.Application()` with `autoStart: false`; render only when dirty, once per rAF.
- `scene` container (render group) holds the view transform (x, y, z). Pan/zoom = change one transform.
- Node layer, three `ParticleContainer`s (static properties; GPU draws all of them each frame,
  JS does not touch them on pan/zoom):
  - `bodies`: one particle per node: white 1×1 texture scaled to the card rect, tinted by type
    (video/clip/shot/point colours from app.css) — plus one header-strip particle.
  - `thumbs[page]`: one particle per node that has a thumbnail, per atlas page (one container per
    page because a ParticleContainer uses one texture source).
  - DOT state (card < 16 screen px wide): thumbs hidden, body tinted with the clip's average colour.
- Links: `Graphics`, built per grid cell ("chunk") that is on screen, cached, rebuilt only when a link
  in it changes or when zoom has changed by ×2 since the build (line width stays ~1.5 screen px).
  Below zoom 0.05 derived video→clip links are not drawn (user links always are).
- Selection: one small `Graphics` of outlines for selected nodes/link (rebuilt on selection change).
- Drag: moved nodes' particles are hidden; a `dragGhost` container of plain Sprites draws them at the
  pointer; on drop, particles are updated once (`update()`), ghost cleared.
- Pixi's own event system is off (`eventMode: 'none'`): all hit testing is ours (section 5).

### 4. Thumbnails and colours

- Server: `thumb(src, frame)` = 64 px wide jpg made from the poster
  (`ffmpeg -i poster.jpg -vf scale=64:-2 -q:v 5`), cached in `ann_dir/thumbs/`, ~2 KB each.
  Average colour = mean RGB of the thumb (ffmpeg `scale=1:1` to raw rgb24), cached with the thumb
  in `thumbs/<name>.rgb` (3 bytes).
- `POST /api/thumbs` body `{"keys": [{"v": src, "f": frame}, ...]}` (≤ 256, video nodes use f=null):
  response `application/octet-stream`: 4-byte big-endian header length, then a JSON header
  `[{"k": i, "off": n, "len": n, "c": [r,g,b]} | {"k": i, "miss": true}]`, then the jpg bytes.
  Misses are queued for background generation (2 worker threads, poster first if missing).
- Client: missing thumbnails for on-screen nodes are requested in batches of 256 (max 2 requests in
  flight), `createImageBitmap(blob.slice(...))` (decodes off the main thread), packed into 2048×2048
  atlas page canvases (64×36 tiles, 1,792 per page). Max 8 pages (≈128 MB); least-recently-seen
  page is cleared and refilled. Nodes with misses retry every 5 s while on screen.
- Until its thumbnail arrives a clip shows its body colour (per source video).
- Shots (`/img`) use the same path with key `{"img": path, "ver": n}`.

### 5. Hit testing and pointer

- Pointer → world point → `grid.query` of a 1-px rect → topmost node in draw order containing it.
- Links: candidates from the grid within 6 screen px; distance to the bezier sampled at 16 points.
- Marquee: `grid.query(rect)` then exact rect test.
- Hover: no video. `startHover`/`stopHover` and the `.media` mouseenter/leave listeners are removed.
- Double-click: same as today → `openFocus(node)`.

### 6. NEAR mode DOM cards

- `cards = Map<id, el>`; a pool of free card elements is reused (`makeNodeEl` only when the pool is
  empty). On re-cull: cards leaving the area return to the pool, entering ones take one from it.
- Card content and behaviour (title, chips, notes, ports, poster img, selection class) as today.
- Link labels: DOM spans for on-screen links with a label, NEAR mode only.

### 7. Saving: changes only

- Client keeps `dirtyNodes`, `dirtyEdges`, `deletedNodes`, `deletedEdges` (ids) and `viewDirty`.
- `POST /api/board/patch?b=<name>` body
  `{"rev": n, "upsert": {"nodes": [...], "edges": [...]}, "del": {"nodes": [ids], "edges": [ids]}, "view": {...}}`.
  Server keeps the parsed board in memory (reloaded if the file's mtime changed), applies the patch,
  bumps `rev`, writes the file atomically (tmp + replace) at most every 2 s from one writer thread,
  and on shutdown. Response `{"rev": n}`.
- File format unchanged, so `styleguide/` and `tools/deconstruct/` keep reading `farrell.json`.
- The full-board `POST /api/board` stays for new boards and for compatibility.
- Unload beacon sends the pending patch.

### 8. Undo: changes only

- `snap(ids)` records, for the given node ids plus their links, the json of each object before the
  change (`null` if it did not exist). Undo writes those back (and records the after-state for redo).
- Every `snap()` caller is changed to pass the ids it is about to change (selection, moving set,
  new/deleted ids, the edited node). Memory per step ~ size of what changed.

### 9. Fallback

- No WebGL (Pixi init throws): status line says so; boards ≤ 3,000 nodes use the current DOM renderer
  (kept as `render-dom` path); larger boards open read-only with a message.

## Testing

- `tools/ref-annotator/tests/make_stress_board.py`: writes `productions/_boards/stress.json` with
  100,000 clips over the existing five sources, laid out in rows under each video, reusing the 782
  existing clip frames (so thumbnails exist) plus 1,000 user links. Never touches `farrell.json`.
- Server tests (`tests/test_serve.py`): thumbs batch format and hit/miss; patch upsert/delete;
  patch after an outside file change keeps both; writes are atomic and coalesced; full-board POST
  still works.
- Browser checks on `stress` (timed synchronously; real fps needs the pane visible):
  - load ≤ 5 s; FAR render ≤ 8 ms at fit-all, z 0.05, z 0.2; NEAR re-cull ≤ 10 ms at z 1;
  - hit test ≤ 1 ms; drag of 1,000 nodes: each move ≤ 4 ms; selection change ≤ 5 ms;
  - JS heap after load < 1.5 GB; undo of a 1,000-node move works and costs < 1 MB.
- Browser checks on `farrell`: same features as today (select, marquee, drag, link, edge select,
  minimap, double-click player, panel, undo/redo, shots draw/grab), no console errors.

## Out of scope

- Splitting the board json into several files (load of a ~95 MB json is accepted: ~1-2 s).
- Pre-generating thumbnails for 100k new clips takes time (≈0.25 s of ffmpeg per poster; hours for
  100k); they appear progressively while the board stays usable.
- The PROJECT copy (port 8765) is not changed.

## Risks

- Pixi API details (ParticleContainer / Particle, render groups, Graphics stroke options) are checked
  against the vendored 8.22.0 file before use, not assumed.
- Text in FAR mode: none (unreadable at that size anyway).
- GPU memory on weak laptops: atlas pages capped at 8; lower the cap if Pixi reports context loss.
