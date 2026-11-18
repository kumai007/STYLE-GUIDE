/* WebGL layer of the board (PixiJS 8). Draws every node as a few particles and every link in cached chunks,
   so 100,000 clips cost a handful of draw calls. The DOM keeps the editable cards near the screen (NEAR mode).
   Uses app.js helpers at call time: nodeW, nodeH, mediaH, HEAD, TYPE_C, edgePts, thumbKey. */
(function (root) {
  const DOT_Z = 0.05;        // below this zoom a node is one dot in its mean colour
  const LINK_Z = 0.05;       // below this zoom the derived (video -> clip) links are hidden
  const CELL = 4096;         // link chunk size in world px
  const BUILD_MS = 6;        // link chunk rebuild budget per frame
  const GHOST_MAX = 2000, LIVE_MAX = 4000, SEL_MAX = 5000;
  const BUCKET = 2048;        // particles per container: a change re-uploads only its bucket, not all 100k
  const C_BODY = 0x2c2c2c, C_LINK = 0x6b7480, C_USER = 0xa78bfa, C_SEL = 0x0d99ff;
  const HEADC = { video: 0x2b5ca8, clip: 0x1f7a52, shot: 0x8a4fd1, point: 0xa0662a };
  const STATIC = { position: false, vertex: false, rotation: false, uvs: false, color: false };

  let app = null, world, L, W1 = 1, hooks, raf = 0, thumbT = 0;
  const view = { x: 0, y: 0, z: 1 };
  const parts = new Map();     // node id -> {b, h, d, t, key, page}
  const keyNodes = new Map();  // thumb key -> Set(node id)
  const thumbLs = [];          // one bucketed layer per atlas page
  let LB, LH, LD;              // bucketed layers: bodies, heads, dots
  const chunks = new Map();    // "d:cx,cy" / "u:cx,cy" -> {g, ids: Set, box, dirty, user}
  const eCell = new Map();     // edge id -> chunk key
  const touched = new Set();   // particle containers to re-upload
  const dead = new Map();      // particle container -> Set(particles) to remove
  let excluded = null, drag = null, selN = [], selE = null, nodeLayers = true;

  const P = () => root.PIXI;
  const hex = (s) => parseInt(String(s || "#888888").slice(1), 16);
  const typeColor = (t) => hex((root.TYPE_C || {})[t] || TYPE_C[t]);
  const mkPC = (texture) => new (P().ParticleContainer)({ texture, dynamicProperties: STATIC });
  function part(texture, x, y, w, h, tint) {
    const f = texture.frame;
    return new (P().Particle)({ texture, x, y, scaleX: w / f.width, scaleY: h / f.height, tint });
  }
  const mkLayer = (box, texture) => ({ box, texture, pcs: [] });
  function put(l, p) {          // into the first bucket with room (reuses holes left by removals)
    let pc = l.pcs.find((c) => c.particleChildren.length < BUCKET);
    if (!pc) { pc = mkPC(l.texture); l.pcs.push(pc); l.box.addChild(pc); }
    pc.particleChildren.push(p); p._pc = pc; touched.add(pc);
  }
  function kill(p) { const pc = p && p._pc; if (!pc) return; let s = dead.get(pc); if (!s) dead.set(pc, (s = new Set())); s.add(p); p._pc = null; }
  function settle() {           // drop removed particles in one pass per container, then re-upload what changed
    for (const [pc, s] of dead) { const a = pc.particleChildren; let j = 0; for (let i = 0; i < a.length; i++) if (!s.has(a[i])) a[j++] = a[i]; a.length = j; touched.add(pc); }
    dead.clear();
    for (const pc of touched) if (pc) pc.update();
    touched.clear();
  }
  function thumbL(page) {
    let l = thumbLs[page];
    if (!l) { const box = new (P().Container)(); L.thumbs.addChild(box); l = thumbLs[page] = mkLayer(box, new (P().Texture)({ source: Thumbs.pageSource(page) })); }
    return l;
  }

  // ---------- nodes ----------
  function refreshMedia(id, p, n) {
    const g = p.key ? Thumbs.get(p.key) : null, tex = g && g.tex;
    const dc = g && g.c != null ? g.c : typeColor(n.type);
    if (p.dc !== dc) { p.dc = dc; p.d.tint = dc; touched.add(p.d._pc); }
    const mh = mediaH(n);
    if (p.t && (!tex || p.t.texture !== tex || !(mh > 0))) { kill(p.t); p.t = null; p.page = -1; }
    if (tex && mh > 0) {
      if (!p.t) { p.t = part(tex, n.x, n.y + HEAD, nodeW(n), mh, 0xffffff); p.page = g.page; put(thumbL(g.page), p.t); }
      else {
        const x = n.x, y = n.y + HEAD, sx = nodeW(n) / tex.frame.width, sy = mh / tex.frame.height;
        if (p.t.x !== x || p.t.y !== y || p.t.scaleX !== sx || p.t.scaleY !== sy) { p.t.x = x; p.t.y = y; p.t.scaleX = sx; p.t.scaleY = sy; touched.add(p.t._pc); }
      }
      if (drag && drag.hidden && drag.ids.has(id) && p.t.alpha !== 0) { p.t.alpha = 0; touched.add(p.t._pc); }
    }
  }
  function setKey(id, p, key) {
    if (p.key === key) return;
    if (p.key) { const s = keyNodes.get(p.key); if (s) { s.delete(id); if (!s.size) keyNodes.delete(p.key); } }
    p.key = key;
    if (key) { let s = keyNodes.get(key); if (!s) keyNodes.set(key, (s = new Set())); s.add(id); }
  }
  function addNode(n) {
    const W = P().Texture.WHITE, w = nodeW(n), h = nodeH(n);
    const p = { b: part(W, n.x, n.y, w, h, C_BODY), h: part(W, n.x, n.y, w, HEAD, HEADC[n.type] || 0x555555),
      d: part(W, n.x, n.y, w, h, typeColor(n.type)), t: null, key: null, page: -1 };
    put(LB, p.b); put(LH, p.h); put(LD, p.d);
    parts.set(n.id, p); setKey(n.id, p, thumbKey(n)); refreshMedia(n.id, p, n);
  }
  function placeNode(n, p) {
    const sx = nodeW(n) / W1, sy = nodeH(n) / W1;
    if (p.b.x === n.x && p.b.y === n.y && p.b.scaleX === sx && p.b.scaleY === sy) return;   // unchanged: no re-upload
    p.b.x = p.h.x = p.d.x = n.x; p.b.y = p.h.y = p.d.y = n.y;
    p.b.scaleX = p.h.scaleX = p.d.scaleX = sx; p.b.scaleY = p.d.scaleY = sy; p.h.scaleY = HEAD / W1;
    touched.add(p.b._pc); touched.add(p.h._pc); touched.add(p.d._pc);
  }
  function removeNode(id) {
    const p = parts.get(id); if (!p) return;
    kill(p.b); kill(p.h); kill(p.d); if (p.t) kill(p.t);
    setKey(id, p, null); parts.delete(id);
  }
  function updateNodes(ids) {
    const es = new Set();
    for (const id of ids) {
      const n = hooks.node(id), p = parts.get(id);
      if (!n) { removeNode(id); continue; }
      if (!p) addNode(n);
      else { placeNode(n, p); setKey(id, p, thumbKey(n)); refreshMedia(id, p, n); }
      for (const e of hooks.adj(id)) es.add(e);
    }
    settle(); if (es.size) edgesChanged(es); else drawSel();
    want(); schedule();
  }

  // ---------- links: grouped by the grid cell of their target node, one cached Graphics per group ----------
  function chunkKey(e) { const b = hooks.node(e.to); return b ? `${e.kind === "user" ? "u" : "d"}:${Math.floor(b.x / CELL)},${Math.floor(b.y / CELL)}` : null; }
  function boxOf(p) { return [Math.min(p[0], p[4]), Math.min(p[1], p[7]), Math.max(p[6], p[2]), Math.max(p[1], p[7])]; }
  function grow(c, b) { if (!c.box) c.box = b.slice(); else { c.box[0] = Math.min(c.box[0], b[0]); c.box[1] = Math.min(c.box[1], b[1]); c.box[2] = Math.max(c.box[2], b[2]); c.box[3] = Math.max(c.box[3], b[3]); } }
  function addEdge(e) {
    const k = chunkKey(e); if (!k) return;
    let c = chunks.get(k);
    if (!c) {
      const g = new (P().Graphics)(); g.context.batchMode = "no-batch";
      c = { g, ids: new Set(), box: null, dirty: true, user: k[0] === "u" };
      (c.user ? L.user : L.links).addChild(g); chunks.set(k, c);
    }
    c.ids.add(e.id); c.dirty = true; eCell.set(e.id, k);
    const p = edgePts(e); if (p) grow(c, boxOf(p));
  }
  function dropEdge(id) { const k = eCell.get(id), c = k && chunks.get(k); if (c) { c.ids.delete(id); c.dirty = true; } eCell.delete(id); }
  function edgesChanged(ids) {
    for (const id of ids) { dropEdge(id); const e = hooks.edge(id); if (e) addEdge(e); }
    drawSel(); schedule();
  }
  function curve(g, p) {
    const [x1, y1, c1x, c1y, c2x, c2y, x2, y2] = p;
    g.moveTo(x1, y1);
    for (let i = 1; i <= 12; i++) {
      const t = i / 12, u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t;
      g.lineTo(a * x1 + b * c1x + c * c2x + d * x2, a * y1 + b * c1y + c * c2y + d * y2);
    }
  }
  function build(k, c) {
    const g = c.g; g.clear(); c.box = null; let any = false;
    for (const id of c.ids) {
      if (excluded && excluded.has(id)) continue;
      const e = hooks.edge(id), p = e && edgePts(e); if (!p) continue;
      curve(g, p); grow(c, boxOf(p)); any = true;
    }
    if (any) g.stroke({ width: 1, color: c.user ? C_USER : C_LINK, alpha: c.user ? 1 : 0.8, pixelLine: true });
    c.dirty = false;
    if (!c.ids.size) { g.destroy(); chunks.delete(k); }
  }
  // per frame: show the chunks that meet the screen, rebuild dirty ones within the time budget
  function linkPass(until) {
    const [a, b, c, d] = viewRect(), showD = view.z >= LINK_Z; let more = false;
    for (const [k, ch] of chunks) {
      const on = (ch.user || showD) && (!ch.box || (ch.box[0] <= c && ch.box[2] >= a && ch.box[1] <= d && ch.box[3] >= b));
      if (on && ch.dirty) { if (performance.now() < until) build(k, ch); else more = true; }
      if (chunks.has(k)) ch.g.visible = on;
    }
    return more;
  }

  // ---------- selection, drag ----------
  function drawSel() {
    if (!L) return;
    const g = L.selG; g.clear();
    let k = 0, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    const many = selN.length > SEL_MAX;   // past SEL_MAX one box around them all
    for (const id of selN) {
      const n = hooks.node(id); if (!n) continue; k++;
      const w = nodeW(n), h = nodeH(n);
      if (!many) { g.rect(n.x, n.y, w, h); continue; }
      if (n.x < x0) x0 = n.x; if (n.y < y0) y0 = n.y; if (n.x + w > x1) x1 = n.x + w; if (n.y + h > y1) y1 = n.y + h;
    }
    if (many && k) g.rect(x0, y0, x1 - x0, y1 - y0);
    if (k) g.fill({ color: C_SEL, alpha: 0.18 }).stroke({ width: 1, color: C_SEL, pixelLine: true });
    const e = selE && hooks.edge(selE), p = e && edgePts(e);
    if (p) { curve(g, p); g.stroke({ width: 1, color: C_SEL, pixelLine: true }); }
  }
  function setSelection(ids, eid) { selN = [...ids]; selE = eid || null; drawSel(); schedule(); }
  function hideParts(ids, a) {
    for (const id of ids) {
      const p = parts.get(id); if (!p) continue;
      p.b.alpha = p.h.alpha = p.d.alpha = a; touched.add(p.b._pc); touched.add(p.h._pc); touched.add(p.d._pc);
      if (p.t) { p.t.alpha = a; touched.add(p.t._pc); }
    }
    settle();
  }
  function dragStart(ids) {
    const ns = ids.map(hooks.node).filter(Boolean), edges = new Set();
    for (const n of ns) for (const e of hooks.adj(n.id)) edges.add(e);
    drag = { ids: new Set(ns.map((n) => n.id)), edges, hidden: nodeLayers && ns.length <= GHOST_MAX, live: edges.size <= LIVE_MAX };
    const g = L.ghost; g.clear(); g.position.set(0, 0);
    if (drag.hidden) {
      for (const n of ns) g.rect(n.x, n.y, nodeW(n), nodeH(n));
      g.fill({ color: C_BODY, alpha: 0.9 });
      for (const n of ns) g.rect(n.x, n.y, nodeW(n), HEAD);
      g.fill({ color: 0x1f7a52 });
      hideParts(drag.ids, 0);
    } else if (nodeLayers) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of ns) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + nodeW(n)); y1 = Math.max(y1, n.y + nodeH(n)); }
      g.rect(x0, y0, x1 - x0, y1 - y0).fill({ color: C_SEL, alpha: 0.1 }).stroke({ width: 1, color: C_SEL, pixelLine: true });
    }
    if (drag.live) { excluded = edges; for (const id of edges) { const c = chunks.get(eCell.get(id)); if (c) c.dirty = true; } }
    schedule();
  }
  function dragMove(dx, dy) {
    if (!drag) return;
    L.ghost.position.set(dx, dy); L.selG.position.set(dx, dy);
    const g = L.live; g.clear();
    if (drag.live && drag.edges.size) {
      let user = false;
      for (const id of drag.edges) { const e = hooks.edge(id), p = e && edgePts(e); if (!p) continue; if (e.kind === "user") { user = true; continue; } curve(g, p); }
      g.stroke({ width: 1, color: C_LINK, pixelLine: true });
      if (user) { for (const id of drag.edges) { const e = hooks.edge(id), p = e && e.kind === "user" && edgePts(e); if (p) curve(g, p); } g.stroke({ width: 1, color: C_USER, pixelLine: true }); }
    }
    schedule();
  }
  function dragEnd() {
    if (!drag) return;
    const d = drag; drag = null; excluded = null;
    L.ghost.clear(); L.ghost.position.set(0, 0); L.live.clear(); L.selG.position.set(0, 0);
    if (d.hidden) hideParts(d.ids, 1);
    updateNodes([...d.ids]);           // new positions; their links move to their new chunks
  }

  // ---------- view, thumbnails, frames ----------
  function viewRect() {
    const w = app ? app.screen.width : 0, h = app ? app.screen.height : 0;
    return [-view.x / view.z, -view.y / view.z, (w - view.x) / view.z, (h - view.y) / view.z];
  }
  function layers() {
    const far = view.z < DOT_Z;
    L.dots.visible = nodeLayers && far;
    L.bodies.visible = L.heads.visible = L.thumbs.visible = nodeLayers && !far;
  }
  function setView(x, y, z) {
    view.x = x; view.y = y; view.z = z;
    world.position.set(x, y); world.scale.set(z); layers(); want(); schedule();
  }
  function setNodeLayers(on) { if (nodeLayers === on) return; nodeLayers = on; layers(); want(); schedule(); }
  // the thumbnails of what is on screen, asked for once the view settles
  function want() {
    clearTimeout(thumbT);
    thumbT = setTimeout(() => {
      if (!nodeLayers) return Thumbs.want([], false);
      const [a, b, c, d] = viewRect(), keys = new Set();
      hooks.each(a, b, c, d, (id) => { const p = parts.get(id); if (p && p.key) keys.add(p.key); });
      Thumbs.want([...keys], view.z < DOT_Z);
    }, 150);
  }
  function onThumbs(keys) {
    for (const k of keys) for (const id of keyNodes.get(k) || []) { const p = parts.get(id), n = hooks.node(id); if (p && n) refreshMedia(id, p, n); }
    settle(); schedule();
  }
  function render() {
    raf = 0; if (!app) return;
    Thumbs.flush();
    const more = linkPass(performance.now() + BUILD_MS);
    app.renderer.render(app.stage);
    if (more) schedule();
  }
  function schedule() { if (!raf && app) raf = requestAnimationFrame(render); }

  function rebuild(nodes, edges) {
    for (const l of [LB, LH, LD, ...thumbLs.filter(Boolean)]) for (const pc of l.pcs) { pc.particleChildren.length = 0; touched.add(pc); }
    parts.clear(); keyNodes.clear(); dead.clear();
    for (const c of chunks.values()) c.g.destroy();
    chunks.clear(); eCell.clear();
    for (const n of nodes) addNode(n);
    for (const e of edges) addEdge(e);
    settle(); drawSel(); want(); schedule();
  }
  // the arrays were replaced or resized (delete, undo of a delete, a new clip): add what is new, drop what is gone
  function reconcile(nodes, edges) {
    const ids = new Set(), eids = new Set();
    for (const n of nodes) { ids.add(n.id); if (!parts.has(n.id)) addNode(n); }
    for (const id of [...parts.keys()]) if (!ids.has(id)) removeNode(id);
    for (const e of edges) { eids.add(e.id); if (!eCell.has(e.id)) addEdge(e); }
    for (const id of [...eCell.keys()]) if (!eids.has(id)) dropEdge(id);
    settle(); drawSel(); want(); schedule();
  }

  async function init(canvas, h) {
    const PX = P(); if (!PX) throw new Error("PixiJS did not load");
    hooks = h;
    const a = new PX.Application();
    await a.init({ canvas, autoStart: false, antialias: false, backgroundAlpha: 0, preference: "webgl",
      resolution: Math.min(2, root.devicePixelRatio || 1), autoDensity: true,
      width: canvas.parentElement.clientWidth || 300, height: canvas.parentElement.clientHeight || 150 });
    if (a.renderer.name !== "webgl" && a.renderer.name !== "webgpu") { a.destroy(); throw new Error(`no GPU renderer (${a.renderer.name})`); }
    app = a; W1 = PX.Texture.WHITE.frame.width;
    world = new PX.Container({ isRenderGroup: true }); app.stage.addChild(world);
    L = { links: new PX.Container(), user: new PX.Container(), bodies: new PX.Container(), heads: new PX.Container(),
      thumbs: new PX.Container(), dots: new PX.Container(), live: new PX.Graphics(), ghost: new PX.Graphics(), selG: new PX.Graphics() };
    LB = mkLayer(L.bodies, PX.Texture.WHITE); LH = mkLayer(L.heads, PX.Texture.WHITE); LD = mkLayer(L.dots, PX.Texture.WHITE);
    world.addChild(L.links, L.user, L.bodies, L.heads, L.thumbs, L.dots, L.live, L.ghost, L.selG);
    const host = canvas.parentElement;
    new ResizeObserver(() => { app.renderer.resize(host.clientWidth, host.clientHeight); want(); render(); }).observe(host);
    Thumbs.onLoad(onThumbs);
    layers();
  }
  const stats = () => ({ nodes: parts.size, edges: eCell.size, chunks: chunks.size, visibleChunks: [...chunks.values()].filter((c) => c.g.visible).length,
    renderer: app && app.renderer.name, thumbs: Thumbs.stats(), buckets: LB ? LB.pcs.length + LH.pcs.length + LD.pcs.length + thumbLs.reduce((a, l) => a + (l ? l.pcs.length : 0), 0) : 0 });

  root.Scene = { init, setView, rebuild, reconcile, updateNodes, edgesChanged, setSelection, dragStart, dragMove, dragEnd,
    setNodeLayers, render, schedule, stats, viewRect, DOT_Z, get app() { return app; } };
})(typeof window !== "undefined" ? window : globalThis);
