"use strict";
// app.js - the infinite board: world layer (CSS transform) with DOM nodes + an SVG edge layer.
// Board file: productions/_boards/<name>.json. Every change autosaves; the server mirrors each
// production's nodes into its 01_reference/annotations/annotations.json for pvs.py notes.
const PRESETS = [
  ["motion graphic", "#f76b15"], ["transition", "#3e63dd"], ["camera move", "#30a46c"],
  ["text/type", "#ffe629"], ["SFX", "#e93d82"], ["music", "#8e4ec6"],
  ["grade/look", "#12a594"], ["pacing/cut", "#e5484d"], ["composition", "#a18072"]];
const PRESET_C = Object.fromEntries(PRESETS);
const TYPE_C = { video: "#3b82f6", clip: "#22c55e", shot: "#a855f7", point: "#f59e0b" };
const NODE_W = { video: 420, clip: 320, shot: 280, point: 240 };
let ZMIN = 0.05; const ZMAX = 8, HEAD = 26, FOOT = 44;
const S = { name: null, board: null, sel: new Set(), selEdge: null, tool: "select", infos: {}, videos: [],
  custom: [], dragging: false };
const vp = $("viewport"), world = $("world"), nodesEl = $("nodes"), edgesEl = $("edges");
const els = new Map();
// WebGL layer (scene.js) draws every node and link; the DOM keeps editable cards only near the screen (NEAR mode).
// GL stays null on the simple DOM board (?nogl=1, or no GPU).
let GL = null, near = true, glArr = null, glFull = true, glErr = "";
const NOGL = new URLSearchParams(location.search).has("nogl");
const POOL = [], CARD_MAX = 450, LABEL_MAX = 500, labelEls = new Map();
const pooled = () => !!GL || big();
let undoS = [], redoS = [], spaceDown = false;

// ---------- model helpers ----------
// id -> index into S.board.nodes; checked on every hit and rebuilt when stale, so adds/removes need no bookkeeping
let idIx = new Map(), idArr = null, idLen = -1;
const idRebuild = (a) => { idArr = a; idLen = a.length; idIx = new Map(a.map((n, k) => [n.id, k])); };
function byId(id) {
  const a = S.board && S.board.nodes; if (!a) return undefined;
  if (idArr !== a || idLen !== a.length) idRebuild(a);
  let i = idIx.get(id);
  if (i !== undefined && a[i]?.id !== id) { idRebuild(a); i = idIx.get(id); }
  return i === undefined ? undefined : a[i];
}
const slugOf = (src) => src.split("/")[0];
const nowIso = () => new Date().toISOString();
const newId = (p) => p + Date.now().toString(16) + Math.random().toString(16).slice(2, 6);
const fpsOf = (n) => (n.fps ? n.fps[0] / n.fps[1] : 30000 / 1001);
const fT = (n, k) => (k == null ? null : n.fps ? k * n.fps[1] / n.fps[0] : k / fpsOf(n));
function srcFrame(n, k) { return n.type === "video" ? k : n.type === "clip" ? n.sf_in + k : n.sf; }
function tagColor(t) {
  if (PRESET_C[t]) return PRESET_C[t];
  let h = 0; for (const c of t) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `hsl(${h % 360} 65% 62%)`;
}
function nodeName(n) {
  if (n.title) return n.title;
  if (n.type === "video") return slugOf(n.src);
  if (n.type === "clip") return `clip ${ts(fT(n, n.sf_in))}`;
  return `${n.type} ${ts(fT(n, n.sf))}`;
}
function timesText(n) {
  if (n.type === "video") return n.duration ? `${ts(n.duration)} · ${fpsOf(n).toFixed(3)} fps` : "";
  if (n.type === "clip") return `src ${ts(fT(n, n.sf_in))}–${ts(fT(n, n.sf_out + 1))} (${fT(n, n.sf_out - n.sf_in + 1).toFixed(2)}s)`;
  return `src ${ts(fT(n, n.sf))} f${n.sf}`;
}
function edgeLabel(child) {
  if (child.type === "clip") return `${ts(fT(child, child.pf_in))}–${ts(fT(child, child.pf_out + 1))}`;
  if (child.type === "shot") return `▣ ${ts(fT(child, child.pf))}`;
  return `● ${ts(fT(child, child.pf))}`;
}
const nodeW = (n) => NODE_W[n.type] || 300;
function mediaH(n) {
  if (n.type === "point") return 0;
  const sz = n.size || [16, 9];
  return Math.round(nodeW(n) * sz[1] / sz[0]);
}
const nodeH = (n) => HEAD + mediaH(n) + FOOT + 2;
const BIG = 3000;
// indexes: a grid answers "what is here", maps answer "children of" / "links of"; rebuilt lazily when the arrays change
const IX = { grid: null, egrid: null, ugrid: null, kids: new Map(), adj: new Map(), eById: new Map(), ver: null };
const nodeRect = (id) => { const n = byId(id); return n ? { x: n.x, y: n.y, w: nodeW(n), h: nodeH(n) } : null; };
const edgeRect = (id) => { const e = IX.eById.get(id), p = e && edgePts(e); if (!p) return null;
  const x0 = Math.min(p[0], p[4]), x1 = Math.max(p[6], p[2]), y0 = Math.min(p[1], p[7]), y1 = Math.max(p[1], p[7]);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 + 1 }; };
// a link's curve as small padded boxes, so the link grid files it only in the cells it passes through
function edgeParts(id) {
  const e = IX.eById.get(id), p = e && edgePts(e); if (!p) return null;
  const M = Math.abs(p[6] - p[0]) + Math.abs(p[7] - p[1]), n = Math.min(64, Math.max(4, Math.ceil(M / 1500)));
  const pad = 24 + 2 * M / (n * n), out = [];   // >= how far the curve strays from a chord: |B''|/(8n^2), |B''| <= 15M even for backward links
  let px = p[0], py = p[1];
  for (let i = 1; i <= n; i++) {
    const t = i / n, u = 1 - t, A = u * u * u, B = 3 * u * u * t, C = 3 * u * t * t, E = t * t * t;
    const x = A * p[0] + B * p[2] + C * p[4] + E * p[6], y = A * p[1] + B * p[3] + C * p[5] + E * p[7];
    out.push({ x: Math.min(px, x) - pad, y: Math.min(py, y) - pad, w: Math.abs(x - px) + 2 * pad, h: Math.abs(y - py) + 2 * pad });
    px = x; py = y;
  }
  return out;
}
// every link goes in egrid; user links also in ugrid, so a click can prefer them without walking thousands of derived links
function eInsert(e) { if (!e) return; IX.egrid.insert(e.id); if (e.kind === "user") IX.ugrid.insert(e.id); }
function reindex() {
  const b = S.board; IX.grid = new Grid(nodeRect); IX.egrid = new Grid(edgeRect, 2048, edgeParts); IX.ugrid = new Grid(edgeRect, 2048, edgeParts);
  IX.kids = new Map(); IX.adj = new Map(); IX.eById = new Map();
  for (const n of b.nodes) { IX.grid.insert(n.id); if (n.parent) { const a = IX.kids.get(n.parent); a ? a.push(n.id) : IX.kids.set(n.parent, [n.id]); } }
  for (const e of b.edges) { IX.eById.set(e.id, e); for (const k of [e.from, e.to]) { let s = IX.adj.get(k); if (!s) IX.adj.set(k, (s = new Set())); s.add(e.id); } }
  for (const e of b.edges) eInsert(e);
  IX.ver = [b.nodes, b.edges, b.nodes.length, b.edges.length];
}
const ixStale = () => !IX.ver || IX.ver[0] !== S.board.nodes || IX.ver[1] !== S.board.edges || IX.ver[2] !== S.board.nodes.length || IX.ver[3] !== S.board.edges.length;
function ix() { if (ixStale()) reindex(); return IX; }
const ixDirty = () => { IX.ver = null; };
// after a push: keep the indexes current instead of a full rebuild (~250 ms at 100k nodes)
function ixAdd(nodes, edges) {
  const b = S.board, V = IX.ver;
  if (!V || V[0] !== b.nodes || V[1] !== b.edges || V[2] + nodes.length !== b.nodes.length || V[3] + edges.length !== b.edges.length) return;
  if (idArr === b.nodes && idLen + nodes.length === b.nodes.length) { nodes.forEach((n, k) => idIx.set(n.id, idLen + k)); idLen = b.nodes.length; }
  for (const n of nodes) { IX.grid.insert(n.id); if (n.parent) { const a = IX.kids.get(n.parent); a ? a.push(n.id) : IX.kids.set(n.parent, [n.id]); } }
  for (const e of edges) { IX.eById.set(e.id, e); for (const k of [e.from, e.to]) { let s = IX.adj.get(k); if (!s) IX.adj.set(k, (s = new Set())); s.add(e.id); } eInsert(e); }
  V[2] = b.nodes.length; V[3] = b.edges.length;
}
function ixMove(ids) { const I = ix(); for (const id of ids) { I.grid.insert(id); for (const eid of I.adj.get(id) || []) eInsert(I.eById.get(eid)); } }
const kids = (id) => (ix().kids.get(id) || []).map(byId).filter((n) => n && n.parent === id);
const edgesOf = (id) => [...(ix().adj.get(id) || [])].map((k) => IX.eById.get(k)).filter(Boolean);

// ---------- undo ----------
// Boards up to BIG nodes: a step is the whole board as JSON. Bigger boards: a step holds only the nodes about to change
// (their JSON, or null when the node does not exist yet) and, unless nodesOnly, every link touching them; a move holds
// positions. Callers pass the ids they are about to change; snap also marks them for the next (patch) save.
const big = () => !!S.board && S.board.nodes.length > BIG;
const cur = () => JSON.stringify({ nodes: S.board.nodes, edges: S.board.edges });
function pushUndo(st) { undoS.push(st); if (undoS.length > 200) undoS.shift(); redoS.length = 0; }
function idsStep(ids, nodesOnly) {
  const nodes = new Map(), edges = nodesOnly ? null : new Map();
  for (const id of ids) { const n = byId(id); nodes.set(id, n ? JSON.stringify(n) : null); if (edges) for (const e of edgesOf(id)) edges.set(e.id, JSON.stringify(e)); }
  return { k: "ids", nodes, edges };
}
function snap(ids = [], nodesOnly = false) {
  if (S.readonly) return;
  ids = [...new Set(ids)].filter(Boolean);
  if (!big()) { pushUndo(cur()); mark(ids); return; }
  const st = idsStep(ids, nodesOnly); pushUndo(st); mark(ids, st.edges ? st.edges.keys() : null);
}
function snapPos(ids) {
  if (S.readonly) return;
  if (!big()) return snap(ids);
  const p = []; for (const id of ids) { const n = byId(id); if (n) p.push([id, n.x, n.y]); }
  pushUndo({ k: "pos", p }); mark(ids);
}
function restoreIds(st) {
  const b = S.board, ids = [...st.nodes.keys()], inv = idsStep(ids, !st.edges), gone = new Set(), adds = [];
  for (const [id, j] of st.nodes) {
    const n = byId(id);
    if (j == null) { if (n) gone.add(id); continue; }
    const o = JSON.parse(j);
    if (n) b.nodes[idIx.get(id)] = o; else adds.push(o);
  }
  for (const o of adds) b.nodes.push(o);
  if (gone.size) b.nodes = b.nodes.filter((n) => !gone.has(n.id));
  if (st.edges) {   // the links touching these nodes become exactly the recorded ones
    const touch = new Set(ids), have = new Set(), out = [];
    for (const e of b.edges) {
      const j = st.edges.get(e.id);
      if (j) { out.push(JSON.parse(j)); have.add(e.id); } else if (!touch.has(e.from) && !touch.has(e.to)) out.push(e);
    }
    for (const [id, j] of st.edges) if (!have.has(id)) out.push(JSON.parse(j));
    b.edges = out;
    mark(ids, [...inv.edges.keys(), ...st.edges.keys()]);
  } else mark(ids);
  ixDirty();
  return inv;
}
function restorePos(st) {
  const inv = { k: "pos", p: [] }, ids = [];
  for (const [id, x, y] of st.p) { const n = byId(id); if (!n) continue; inv.p.push([id, n.x, n.y]); n.x = x; n.y = y; ids.push(id); }
  mark(ids); ixMove(ids); return inv;
}
function applyStep(st) {   // returns the step that reverses it
  let inv;
  if (typeof st === "string") {
    inv = cur(); const o = JSON.parse(st); S.board.nodes = o.nodes; S.board.edges = o.edges;
    if (big()) { fullNext = true; glFull = true; }   // a whole-board step on a big board: the next save sends the whole board
  } else inv = st.k === "pos" ? restorePos(st) : restoreIds(st);
  S.sel = new Set([...S.sel].filter((id) => byId(id))); S.selEdge = null;
  if (F.node) { const f = byId(F.node.id); if (!f) closeFocus(); else { F.node = f; D.sel = -1; syncRange(); D.host && D.host.redraw(); tlRender(); renderCrumb(); } }
  $("panel")._id = null; renderAll(); scheduleSave(); ensureAssets();
  return inv;
}
function undo() { if (!undoS.length) return setStatus("nothing to undo"); redoS.push(applyStep(undoS.pop())); setStatus("undone", "ok"); }
function redo() { if (!redoS.length) return setStatus("nothing to redo"); undoS.push(applyStep(redoS.pop())); setStatus("redone", "ok"); }

// ---------- persistence ----------
// Boards up to BIG nodes save whole. Bigger boards send a patch: the nodes / links marked since the last save
// (sent as they are now, or as deleted when gone) plus the view.
let saveT = null, dirty = false, saving = false;
let D_N = new Set(), D_E = new Set(), viewDirty = false, fullNext = false;
const R_N = new Set(), R_E = new Set();   // nodes / links whose drawing must be refreshed (read by the WebGL scene)
function mark(nids, eids) {
  if (nids) for (const i of nids) { D_N.add(i); R_N.add(i); }
  if (eids) for (const i of eids) { D_E.add(i); R_E.add(i); }
}
function buildPatch() {
  const I = ix(), up = { nodes: [], edges: [] }, del = { nodes: [], edges: [] }, es = new Set(D_E);
  for (const id of D_N) { const n = byId(id); n ? up.nodes.push(n) : del.nodes.push(id); for (const k of I.adj.get(id) || []) es.add(k); }
  for (const id of es) { const e = I.eById.get(id); e ? up.edges.push(e) : del.edges.push(id); }
  const p = { rev: S.board.rev, upsert: up, del };
  if (viewDirty) p.view = S.board.view;
  return p;
}
function scheduleSave(ms = 400) { if (S.readonly) return; dirty = true; setStatus("unsaved…"); clearTimeout(saveT); saveT = setTimeout(saveNow, ms); }
async function saveNow() {
  clearTimeout(saveT);
  if (!dirty || !S.board) return;
  if (S.readonly) { dirty = false; return; }
  if (saving) { saveT = setTimeout(saveNow, 200); return; }
  dirty = false; saving = true;
  const patch = big() && !fullNext, sent = [D_N, D_E, viewDirty];
  try {
    let r;
    if (patch) {
      const p = buildPatch(); D_N = new Set(); D_E = new Set(); viewDirty = false;
      if (!p.view && !p.upsert.nodes.length && !p.upsert.edges.length && !p.del.nodes.length && !p.del.edges.length) { setStatus("saved", "ok"); return; }
      r = await api(`/api/board/patch?b=${enc(S.name)}`, p);
    } else {
      D_N = new Set(); D_E = new Set(); viewDirty = false; fullNext = false;
      r = await api(`/api/board?b=${enc(S.name)}`, S.board);
    }
    if (r.rev != null) S.board.rev = r.rev;
    setStatus(`saved ${r.saved.slice(11)} · ${r.nodes} nodes`, "ok");
    if (r.reload) await loadBoard(S.name, true);
  } catch (e) {
    if (/^stale board/.test(e.message)) {   // the board was written elsewhere (another tab, Claude)
      saving = false; dirty = false; await loadBoard(S.name, true);
      setStatus("board changed outside this tab - reloaded; redo your last edit if it is missing", "err");
      return;
    }
    if (patch) { for (const i of sent[0]) D_N.add(i); for (const i of sent[1]) D_E.add(i); viewDirty = viewDirty || sent[2]; }
    else if (big()) fullNext = true;
    dirty = true; setStatus("SAVE FAILED: " + e.message, "err");
  }
  finally { saving = false; }
}
// pick up outside writes while idle, so this tab never saves over them
async function checkRev() {
  if (!S.board || dirty || saving || F.node || typing() || S.dragging) return;
  try {
    const r = await api(`/api/rev?b=${enc(S.name)}`);
    if (r.rev != null && r.rev !== S.board.rev && !dirty && !saving) {
      await loadBoard(S.name, true); setStatus(`board updated outside this tab - reloaded (rev ${r.rev})`, "ok");
    }
  } catch { /* server down: the next save reports it */ }
}
setInterval(checkRev, 4000);
addEventListener("focus", checkRev);
addEventListener("pagehide", () => {
  if (!dirty || !S.board || S.readonly) return;
  const [url, body] = big() && !fullNext ? ["/api/board/patch", buildPatch()] : ["/api/board", S.board];
  navigator.sendBeacon(`${url}?b=${enc(S.name)}`, new Blob([JSON.stringify(body)], { type: "application/json" }));
});
function touchNode(n, quiet) {
  n.updated = nowIso(); mark([n.id]); scheduleSave();
  const el = els.get(n.id); if (el) updateNodeEl(el, n);
  if (GL) GL.updateNodes([n.id]);
  if (!quiet) renderPanel();
}

// ---------- assets: frames made by the server (a clip is only a range on its source: no file) ----------
const inflight = new Set(), retried = new Set(), flatT = {};
function ensureAssets() {
  const ch = [];
  for (const n of S.board.nodes) {
    if (n.type === "clip" && n.status !== "ready") { n.status = "ready"; delete n.err; delete n.pct; ch.push(n.id); }
    if (n.type === "shot" && n.status === "pending") grabShot(n.id);
  }
  if (ch.length) mark(ch);
}
// ---------- change the in / out of a clip that already exists ----------
// a, b are frames in the PARENT (same space as pf_in/pf_out). Only the numbers change: nothing is cut.
function parentLast(P) {
  if (P.type === "clip") return P.sf_out - P.sf_in;
  const i = S.infos[P.src]; return i ? i.nb_frames - 1 : P.duration ? Math.floor(P.duration * fpsOf(P)) - 1 : null;
}
function retrimClip(n, a, b) {
  const P = n && n.type === "clip" && byId(n.parent); if (!P) return false;
  a = Math.round(a); b = Math.round(b); if (a > b) [a, b] = [b, a];
  const last = parentLast(P); a = Math.max(0, a); if (last != null) b = Math.min(last, b);
  if (a === n.pf_in && b === n.pf_out) return false;
  if (a >= b) { setStatus("in and out would be the same frame", "err"); return false; }
  const sfIn = srcFrame(P, a), sfOut = srcFrame(P, b);
  const out = kids(n.id).filter((k) => k.type === "clip" ? k.sf_in < sfIn || k.sf_out > sfOut : k.sf < sfIn || k.sf > sfOut);
  if (out.length) {
    setStatus(`can't trim there: ${out.map(nodeName).join(", ")} (made inside this clip) would fall outside it. Move or delete ${out.length > 1 ? "them" : "it"} first.`, "err");
    return false;
  }
  snap([n.id, ...kids(n.id).map((k) => k.id)], true);
  // an old cut file (if any) no longer matches the range, so the node stops pointing at it
  Object.assign(n, { pf_in: a, pf_out: b, sf_in: sfIn, sf_out: sfOut, status: "ready" });
  delete n.err; delete n.pct; delete n.file; delete n.cut; delete n.frames_written;
  for (const k of kids(n.id)) {
    if (k.type === "clip") { k.pf_in = k.sf_in - sfIn; k.pf_out = k.sf_out - sfIn; } else k.pf = k.sf - sfIn;
  }
  touchNode(n); renderAll();
  if (F.node === n) { syncRange(); tlRender(); renderCrumb(); }
  setStatus(`${nodeName(n)}: source f${sfIn}–f${sfOut} (${sfOut - sfIn + 1} frames, ${ts(fT(n, sfOut - sfIn + 1))}) · Ctrl+Z undoes`, "ok");
  return true;
}
async function grabShot(id) {
  if (inflight.has(id)) return; inflight.add(id);
  try {
    let n = byId(id); if (!n) return;
    n.status = "pending";
    const r = await api("/api/grab", { v: n.src, frame: n.sf, id });
    n = byId(id); if (!n) return;
    Object.assign(n, { image: r.path, size: [r.w, r.h], status: "ready", exact: r.exact, ver: (n.ver || 0) + 1 });
    if (!r.exact) setStatus(`WARNING: asked frame ${n.sf}, ffmpeg returned ${r.frame_grabbed}`, "err");
    else setStatus(`frame ${r.sf} grabbed (${r.w}x${r.h})`, "ok");
    if (n.shapes && n.shapes.length) queueFlatten(n);
    mark([id]); scheduleSave(); renderAll();
    if (F.node === n) openFocus(n);
  } catch (e) { const n = byId(id); if (n) { n.status = "error"; n.err = e.message; mark([id]); } setStatus("GRAB FAILED: " + e.message, "err"); renderAll(); }
  finally { inflight.delete(id); }
}
function queueFlatten(n) {
  const id = n.id; clearTimeout(flatT[id]);
  flatT[id] = setTimeout(async () => {
    const x = byId(id); if (!x) return;
    if (x.status === "pending") return queueFlatten(x);
    try { await flattenShot(x); mark([id]); scheduleSave(); const el = els.get(id); if (el) updateNodeEl(el, x); if (GL) GL.updateNodes([id]); }
    catch (e) { setStatus("PNG EXPORT FAILED: " + e.message, "err"); }
  }, 600);
}

// ---------- creating nodes ----------
function base(P, prefix, id) {
  return { id: id || newId(prefix), parent: P.id, src: P.src, fps: P.fps, tags: [], note: "", purpose: "", title: "",
    created: nowIso(), updated: nowIso() };
}
function place(n, P) {
  const w = nodeW(n), h = nodeH(n), gap = 30;
  let x = P.x + nodeW(P) + 110, y = P.y;
  for (let i = 0; i < 2000; i++) {
    let hit = null;
    for (const id of ix().grid.query(x - gap, y - gap, x + w + gap, y + h + gap)) { const o = byId(id); if (o && o !== n && (!hit || o.y > hit.y)) hit = o; }
    if (!hit) break; y = hit.y + nodeH(hit) + gap;
  }
  n.x = Math.round(x); n.y = Math.round(y);
}
function addChild(P, n) {
  place(n, P); const e = { id: newId("e"), from: P.id, to: n.id, kind: "derived" };
  S.board.nodes.push(n); S.board.edges.push(e); ixAdd([n], [e]); mark([n.id], [e.id]);
  selectOnly(n.id); renderAll(); scheduleSave();
}
function sizeOf(P) { const i = S.infos[P.src]; return i ? [i.width, i.height] : (P.size || [1920, 1080]); }
function createClip(P, a, b) {
  const id = newId("c"); snap([id]);
  const n = Object.assign(base(P, "c", id), { type: "clip", sf_in: srcFrame(P, a), sf_out: srcFrame(P, b), pf_in: a, pf_out: b,
    status: "ready", size: sizeOf(P) });
  addChild(P, n);
  setStatus(`clip: ${b - a + 1} frames (${ts(fT(P, a))}–${ts(fT(P, b + 1))}), a range on the source - no file made`, "ok");
  return n;
}
function createShot(P, k, nosnap, id) {
  id = id || newId("s"); if (!nosnap) snap([id]);
  const n = Object.assign(base(P, "s", id), { type: "shot", sf: srcFrame(P, k), pf: k, flat: null, shapes: [],
    size: sizeOf(P), status: "pending" });
  n.image = `${slugOf(P.src)}/01_reference/annotations/frames/${n.id}.jpg`;
  addChild(P, n); grabShot(n.id);
  return n;
}
function createPoint(P, k) {
  const id = newId("p"); snap([id]);
  const n = Object.assign(base(P, "p", id), { type: "point", sf: srcFrame(P, k), pf: k });
  addChild(P, n); setStatus(`point at ${ts(fT(P, k))}: write the note in the side panel`, "ok");
  return n;
}
async function addVideo(v) {
  let info; try { info = await mediaInfo(v); } catch (e) { return setStatus(e.message, "err"); }
  const id = newId("v"); snap([id]);
  const r = vp.getBoundingClientRect(), z = S.board.view.z;
  const n = { id, type: "video", src: v, parent: null, title: slugOf(v), tags: [], note: "", purpose: "",
    fps: [info.fps_num, info.fps_den], size: [info.width, info.height], duration: info.duration, created: nowIso(), updated: nowIso() };
  const cx = (r.width / 2 - S.board.view.x) / z - nodeW(n) / 2, cy = (r.height / 2 - S.board.view.y) / z - nodeH(n) / 2;
  place(n, { x: cx - nodeW(n) - 110, y: cy, type: "video" });
  S.board.nodes.push(n); ixAdd([n], []); mark([id]); selectOnly(n.id); renderAll(); scheduleSave(); refreshAddVid();
}

// ---------- view (pan / zoom) ----------
function applyView() {
  const v = S.board.view;
  world.style.transform = `translate(${v.x}px, ${v.y}px) scale(${v.z})`;
  let g = 24 * v.z; while (g < 12) g *= 4; while (g > 96) g /= 4;
  vp.style.backgroundSize = `${g}px ${g}px`; vp.style.backgroundPosition = `${v.x}px ${v.y}px`;
  $("zoomlabel").textContent = `${Math.round(v.z * 100)}%`;
  world.classList.toggle("lod", v.z < LOD_Z);
  if (GL) GL.setView(v.x, v.y, v.z);
  cull(); renderMinimap();
}
let viewT = null, viewRaf = 0;
// wheel / pan events can fire many times per frame: the view state changes at once, the DOM once per frame
function viewChanged() {
  if (!viewRaf) viewRaf = requestAnimationFrame(() => { viewRaf = 0; applyView(); });
  clearTimeout(viewT); viewT = setTimeout(() => { if (S.readonly) return; viewDirty = true; dirty = true; saveNow(); }, 800);
}

// ---------- culling: only nodes near the screen are in the layout, and only they load posters ----------
const LOD_Z = 0.3;    // below this zoom node text and link labels are hidden
const FAR_Z = 0.1;    // below this zoom posters are hidden (a clip poster would be under 32 px wide)
let shown = null;     // world rect [x0, y0, x1, y1] the DOM is culled to: the screen plus half a screen each side
function viewRect() {
  const r = vp.getBoundingClientRect(), v = S.board.view;
  return [-v.x / v.z, -v.y / v.z, (r.width - v.x) / v.z, (r.height - v.y) / v.z];
}
function cull(force) {
  if (!S.board) return;
  if (pooled()) return cullPool(force);
  const [a, b, c, d] = viewRect(), w = c - a, h = d - b, far = S.board.view.z < FAR_Z, lod = S.board.view.z < LOD_Z;
  // still inside the culled rect and it is not far bigger than the screen (zoomed in a lot): nothing to do
  if (!force && shown && shown.far === far && shown.lod === lod && a >= shown[0] && b >= shown[1] && c <= shown[2] && d <= shown[3]
      && (shown[2] - shown[0]) * (shown[3] - shown[1]) < 9 * w * h) return;
  shown = Object.assign([a - w / 2, b - h / 2, c + w / 2, d + h / 2], { far, lod });
  world.classList.toggle("far", far);
  for (const n of S.board.nodes) { const el = els.get(n.id); if (el) showNode(el, n); }
  renderEdges();
}
// WebGL board: NEAR (few nodes on screen, zoom >= LOD_Z) keeps a pooled DOM card per node near the screen;
// FAR has no cards at all, WebGL draws everything. Without WebGL a big board is read-only and capped at 900 cards.
function cullPool(force) {
  const z = S.board.view.z, [a, b, c, d] = viewRect(), w = c - a, h = d - b, far = z < FAR_Z, lod = z < LOD_Z, I = ix();
  if (GL) {
    const nn = z >= LOD_Z && I.grid.count(a, b, c, d, CARD_MAX + 1) <= (near ? CARD_MAX : 350);   // 350..450: no flicker at the edge
    if (nn !== near) { near = nn; GL.setNodeLayers(!near); force = true; }
  }
  if (!force && shown && shown.far === far && shown.lod === lod && shown.near === near && a >= shown[0] && b >= shown[1] && c <= shown[2] && d <= shown[3]
      && (shown[2] - shown[0]) * (shown[3] - shown[1]) < 9 * w * h) return;
  world.classList.toggle("far", far);
  if (GL && !near) {
    for (const id of [...els.keys()]) freeCard(id);
    shown = Object.assign([a, b, c, d], { far, lod, near });
    renderLabels(); return;
  }
  const keep = new Set(); let capped = false;
  const add = (id) => { keep.add(id); if (keep.size >= 900) { capped = true; return true; } };
  I.grid.each(a, b, c, d, add);
  const m = [a - w / 2, b - h / 2, c + w / 2, d + h / 2];
  if (!capped) I.grid.each(m[0], m[1], m[2], m[3], add);
  shown = Object.assign(capped ? [a, b, c, d] : m, { far, lod, near });
  for (const id of [...els.keys()]) if (!keep.has(id)) freeCard(id);
  for (const id of keep) { const n = byId(id); if (!n) continue; const el = els.get(id); if (el) showNode(el, n); else cardFor(n); }
  renderEdges();
}
function freeCard(id) {
  const el = els.get(id); if (!el) return;
  el.classList.add("off"); el.classList.remove("sel"); els.delete(id); POOL.push(el);
}
function cardFor(n) {
  let el = POOL.pop();
  if (el) {
    el.dataset.id = n.id; el.className = `node t-${n.type}`; el._img = null;
    const c = el._c || {}; if (c[".media"]) c[".media"]._key = null; if (c[".chips"]) c[".chips"]._k = null;
  } else { el = makeNodeEl(n); nodesEl.append(el); }
  els.set(n.id, el); updateNodeEl(el, n); return el;
}
// hit tests for the WebGL board (no DOM element under the pointer when zoomed out)
function hitNode(wx, wy) {
  let best = null, bi = -1;
  for (const id of ix().grid.hit(wx, wy)) { if (!byId(id)) continue; const i = idIx.get(id); if (i > bi) { bi = i; best = id; } }
  return best;
}
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
  const t = l ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l)) : 0;
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}
// 17-point polyline per link, kept until its end points move (the curve depends only on them)
const polyCache = new Map();
function edgePoly(e) {
  const p = edgePts(e); if (!p) return null;
  const c = polyCache.get(e.id);
  if (c && c[0] === p[0] && c[1] === p[1] && c[32] === p[6] && c[33] === p[7]) return c;
  const out = new Float64Array(34);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, u = 1 - t, A = u * u * u, B = 3 * u * u * t, C = 3 * u * t * t, E = t * t * t;
    out[2 * i] = A * p[0] + B * p[2] + C * p[4] + E * p[6]; out[2 * i + 1] = A * p[1] + B * p[3] + C * p[5] + E * p[7];
  }
  if (polyCache.size > 20000) polyCache.clear();   // ~7 MB at most
  polyCache.set(e.id, out); return out;
}
function hitEdge(wx, wy) {
  const z = S.board.view.z, r = 6 / z, I = ix(); let best = null, bd = r;
  const test = (id) => {
    const e = I.eById.get(id), q = e && edgePoly(e); if (!q) return;
    for (let i = 2; i < 34; i += 2) {
      const ax = q[i - 2], ay = q[i - 1], bx = q[i], by = q[i + 1];
      if (wx < Math.min(ax, bx) - bd || wx > Math.max(ax, bx) + bd || wy < Math.min(ay, by) - bd || wy > Math.max(ay, by) + bd) continue;
      const dd = segDist(wx, wy, ax, ay, bx, by); if (dd < bd) { bd = dd; best = id; }
    }
  };
  I.ugrid.each(wx - r, wy - r, wx + r, wy + r, test);
  if ((best && bd < 1 / z) || z < 0.05) return best;   // user links are drawn on top: within a screen pixel they win
  I.egrid.each(wx - r, wy - r, wx + r, wy + r, (id) => {
    if (I.eById.get(id)?.kind === "user") return;
    test(id); return bd < 0.5 / z;   // within half a screen pixel nothing can look closer: stop (a video can have 20k links)
  });
  return best;
}
const inShown = (x0, y0, x1, y1) => !shown || (x0 < shown[2] && x1 > shown[0] && y0 < shown[3] && y1 > shown[1]);
function showNode(el, n) {
  const on = inShown(n.x, n.y, n.x + nodeW(n), n.y + nodeH(n));
  el.classList.toggle("off", !on);
  const img = el._img; if (on && img && !shown?.far && !img.getAttribute("src")) img.src = img.dataset.src;
}
function toWorld(cx, cy) { const r = vp.getBoundingClientRect(), v = S.board.view; return [(cx - r.left - v.x) / v.z, (cy - r.top - v.y) / v.z]; }
function zoomAt(cx, cy, f) {
  const v = S.board.view, r = vp.getBoundingClientRect(), z = Math.max(ZMIN, Math.min(ZMAX, v.z * f));
  const [wx, wy] = toWorld(cx, cy);
  v.x = cx - r.left - wx * z; v.y = cy - r.top - wy * z; v.z = z; viewChanged();
}
function fitTo(list) {
  if (!list.length) return;
  const r = vp.getBoundingClientRect(), pad = 60;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;   // loops: a spread of 100k args overflows the stack
  for (const n of list) { x0 = Math.min(x0, n.x); y0 = Math.min(y0, n.y); x1 = Math.max(x1, n.x + nodeW(n)); y1 = Math.max(y1, n.y + nodeH(n)); }
  const z = Math.max(ZMIN, Math.min(ZMAX, 2, Math.min((r.width - pad * 2) / (x1 - x0), (r.height - pad * 2) / (y1 - y0))));
  Object.assign(S.board.view, { z, x: r.width / 2 - (x0 + x1) / 2 * z, y: r.height / 2 - (y0 + y1) / 2 * z });
  viewChanged();
}
const fitAll = () => fitTo(S.board.nodes);
const fitSel = () => { const l = [...S.sel].map(byId).filter(Boolean); fitTo(l.length ? l : S.board.nodes); };

vp.addEventListener("wheel", (e) => {
  e.preventDefault();
  let dx = e.deltaX, dy = e.deltaY; if (e.deltaMode === 1) { dx *= 16; dy *= 16; }
  if (e.ctrlKey || e.metaKey) { zoomAt(e.clientX, e.clientY, Math.exp(-Math.max(-60, Math.min(60, dy)) * 0.004)); return; }
  if (e.shiftKey && !dx) { dx = dy; dy = 0; }
  S.board.view.x -= dx; S.board.view.y -= dy; viewChanged();
}, { passive: false });

// ---------- rendering ----------
function posterKey(n) {
  if (n.type === "video") return `/poster?v=${enc(n.src)}`;
  if (n.type === "clip") return `/poster?v=${enc(n.src)}&f=${Math.round((n.sf_in + n.sf_out) / 2)}`;
  if (n.type === "shot") return n.image && n.status !== "pending" && n.status !== "error"
    ? `/img?p=${enc(n.flat || n.image)}&_=${n.fver || n.ver || 0}` : null;
  return null;
}
// key of a node's 64x36 thumbnail for the WebGL atlas (thumbs.js); null = no picture
function thumbKey(n) {
  if (n.type === "video") return `v|${n.src}|`;
  if (n.type === "clip") return `v|${n.src}|${Math.round((n.sf_in + n.sf_out) / 2)}`;
  if (n.type === "shot") return n.image && n.status !== "pending" && n.status !== "error" ? `img|${n.flat || n.image}|${n.fver || n.ver || 0}` : null;
  return null;
}
function makeNodeEl(n) {
  const el = document.createElement("div"); el.className = `node t-${n.type}`; el.dataset.id = n.id;
  el.innerHTML = `<div class="nh"><span class="ty"></span><span class="nt"></span><span class="tm"></span></div>` +
    `<div class="media"></div><div class="nf"><div class="chips"></div><div class="nn"></div></div>` +
    `<div class="port in"></div><div class="port out" title="Drag to link this to another node"></div>`;
  return el;
}
function updateNodeEl(el, n) {
  Object.assign(el.style, { left: `${n.x}px`, top: `${n.y}px`, width: `${nodeW(n)}px` });
  el.classList.toggle("sel", S.sel.has(n.id));
  const c = el._c || (el._c = {}), q = (s) => c[s] || (c[s] = el.querySelector(s));
  q(".ty").textContent = n.type === "shot" ? "SHOT" : n.type.toUpperCase();
  q(".nt").textContent = nodeName(n);
  q(".tm").textContent = n.type === "clip" ? `${fT(n, n.sf_out - n.sf_in + 1).toFixed(2)}s` :
    n.type === "video" ? (n.duration ? ts(n.duration).replace(/\.\d+$/, "") : "") : `f${n.sf}`;
  const m = q(".media"); m.style.height = `${mediaH(n)}px`; m.style.display = n.type === "point" ? "none" : "";
  const key = `${posterKey(n)}|${n.status}|${n.type === "clip" && n.status !== "ready" ? n.pct || 0 : ""}`;
  if (m._key !== key) {
    m._key = key; m.replaceChildren(); el._img = null;
    const url = posterKey(n);
    if (url) {   // src is set by showNode once the node is near the screen
      const img = document.createElement("img"); img.draggable = false; img.dataset.src = url; img.alt = ""; img.decoding = "async";
      el._img = img;
      img.onerror = () => { const x = byId(n.id); if (!x || retried.has(x.id)) return; retried.add(x.id);
        if (x.type === "shot") grabShot(x.id); };
      m.prepend(img);
    } else if (n.type !== "point") {
      const s = document.createElement("div");
      if (n.status === "error") { s.className = "ph err"; s.textContent = "failed: " + (n.err || "?"); }
      else { s.className = "spin"; s.textContent = n.type === "clip" ? `cutting ${n.pct || 0}%` : "grabbing…"; }
      m.append(s);
      if (n.type === "clip" && n.status !== "error") {
        const p = document.createElement("div"); p.className = "prog"; p.style.width = `${n.pct || 0}%`; m.append(p);
      }
    }
  }
  const ch = q(".chips"), tk = (n.tags || []).join("\n");
  if (ch._k !== tk) {   // rebuilt only when the tags change
    ch._k = tk; ch.innerHTML = "";
    for (const t of n.tags || []) { const s = document.createElement("span"); s.className = "chip"; s.style.setProperty("--c", tagColor(t)); s.textContent = t; ch.append(s); }
  }
  const shapes = (n.shapes || []).length;
  q(".nn").textContent = (n.note || n.purpose || "").split("\n")[0] ||
    (n.type === "point" ? `● ${timesText(n)} (add a note)` : shapes ? `${shapes} drawing${shapes > 1 ? "s" : ""}` : "");
  showNode(el, n);
}
function renderNodes() {
  const ids = new Set(S.board.nodes.map((n) => n.id));
  for (const [id, el] of els) if (!ids.has(id)) { el.remove(); els.delete(id); }
  for (const n of S.board.nodes) {
    let el = els.get(n.id);
    if (!el) { el = makeNodeEl(n); els.set(n.id, el); nodesEl.append(el); }
    updateNodeEl(el, n);
  }
}
function edgePts(e) {
  const a = byId(e.from), b = byId(e.to); if (!a || !b) return null;
  const x1 = a.x + nodeW(a), y1 = a.y + nodeH(a) / 2, x2 = b.x, y2 = b.y + nodeH(b) / 2;
  const d = Math.max(60, Math.abs(x2 - x1) / 2);
  return [x1, y1, x1 + d, y1, x2 - d, y2, x2, y2, b];
}
function edgeGeom(e) {
  const p = edgePts(e); if (!p) return null;
  const [x1, y1, c1x, c1y, c2x, c2y, x2, y2, b] = p;
  return { b, d: `M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`,
    mx: (x1 + 3 * c1x + 3 * c2x + x2) / 8, my: (y1 + 3 * c1y + 3 * c2y + y2) / 8,
    box: [Math.min(x1, c2x), Math.min(y1, y2), Math.max(x2, c1x), Math.max(y1, y2)] };   // the curve stays inside its control points
}
let edgeEls = new Map();   // edge id -> its <path>/<text> elements, so a drag moves only the edges it touches
function renderEdges() {
  if (GL) return renderLabels();   // WebGL draws the links; the DOM only their labels
  let h = ""; const labels = S.board.view.z >= LOD_Z;   // labels are unreadable when zoomed out
  for (const e of big() ? edgesNear() : S.board.edges) {
    const g = edgeGeom(e); if (!g || !inShown(...g.box)) continue;
    const user = e.kind === "user", sel = S.selEdge === e.id;
    h += `<path class="hit" data-e="${e.id}" d="${g.d}"/><path class="e${user ? " user" : ""}${sel ? " sel" : ""}" data-e="${e.id}" d="${g.d}"/>`;
    const lab = user ? e.label || "" : edgeLabel(g.b);
    if (lab && labels) h += `<text class="${user ? "user" : ""}" data-e="${e.id}" x="${g.mx}" y="${g.my - 6}" text-anchor="middle">${esc(lab)}</text>`;
  }
  edgesEl.innerHTML = h; edgeEls = new Map();
  for (const x of edgesEl.querySelectorAll("[data-e]")) { const k = x.dataset.e; if (!edgeEls.has(k)) edgeEls.set(k, []); edgeEls.get(k).push(x); }
}
function edgesNear() {   // the links in the culled rect (big board without WebGL), at most 3000
  const out = [], I = ix(); if (!shown) return out;
  I.egrid.each(shown[0], shown[1], shown[2], shown[3], (id) => { const e = I.eById.get(id); if (e) out.push(e); return out.length >= 3000; });
  return out;
}
function renderLabels() {   // WebGL board: link labels as DOM text (textContent), only in NEAR mode
  const box = $("elabels"); box.replaceChildren(); labelEls.clear();
  if (!near || !shown || S.board.view.z < LOD_Z) return;
  const I = ix(), frag = document.createDocumentFragment();
  I.egrid.each(shown[0], shown[1], shown[2], shown[3], (id) => {
    const e = I.eById.get(id), g = e && edgeGeom(e); if (!g) return;
    if (g.mx < shown[0] || g.mx > shown[2] || g.my < shown[1] || g.my > shown[3]) return;   // label off screen
    const user = e.kind === "user", lab = user ? e.label || "" : edgeLabel(g.b); if (!lab) return;
    const d = document.createElement("div"); d.className = user ? "elabel user" : "elabel"; d.textContent = lab;
    d.style.left = `${g.mx}px`; d.style.top = `${g.my - 6}px`; frag.append(d); labelEls.set(id, d);
    return labelEls.size >= LABEL_MAX;
  });
  box.append(frag);
}
function moveEdges(ids) {
  let list = S.board.edges;
  if (pooled()) { const I = ix(), k = new Set(); for (const id of ids) for (const x of I.adj.get(id) || []) k.add(x); list = [...k].map((x) => I.eById.get(x)).filter(Boolean); }
  for (const e of list) {
    if (!ids.has(e.from) && !ids.has(e.to)) continue;
    const xs = edgeEls.get(e.id), lb = labelEls.get(e.id); if (!xs && !lb) continue;
    const g = edgeGeom(e); if (!g) continue;
    if (lb) { lb.style.left = `${g.mx}px`; lb.style.top = `${g.my - 6}px`; }
    if (xs) for (const x of xs) if (x.tagName === "text") { x.setAttribute("x", g.mx); x.setAttribute("y", g.my - 6); } else x.setAttribute("d", g.d);
  }
}
// hand the model's changes to the WebGL scene: small boards are rebuilt, big ones get only what was marked
function glSync() {
  const b = S.board;
  if (!big()) GL.rebuild(b.nodes, b.edges);
  else {
    const arrs = [b.nodes, b.edges, b.nodes.length, b.edges.length];
    if (glFull || !glArr) GL.rebuild(b.nodes, b.edges);
    else {
      if (arrs.some((x, i) => x !== glArr[i])) GL.reconcile(b.nodes, b.edges);
      if (R_N.size) GL.updateNodes([...R_N]);
      if (R_E.size) GL.edgesChanged(R_E);
    }
    glArr = arrs;
  }
  glFull = false; R_N.clear(); R_E.clear(); GL.setSelection(S.sel, S.selEdge);
}
function renderAll() {
  if (!S.board) return;
  if (GL) glSync();
  if (pooled()) { for (const [id, el] of [...els]) { const n = byId(id); if (n) updateNodeEl(el, n); else freeCard(id); } cull(true); }
  else { renderNodes(); renderEdges(); }
  renderMinimap(true); renderPanel();
  if (F.node && F.kind === "video") tlRender();
  $("undo").disabled = !undoS.length; $("redo").disabled = !redoS.length;
}
function renderSel() {
  for (const [id, el] of els) el.classList.toggle("sel", S.sel.has(id));
  for (const [k, xs] of edgeEls) for (const x of xs) if (x.classList.contains("e")) x.classList.toggle("sel", k === S.selEdge);
  if (GL) GL.setSelection(S.sel, S.selEdge);
  renderPanel(); renderMinimap(true);
}
function selectOnly(id) { S.sel = new Set(id ? [id] : []); S.selEdge = null; }

// ---------- minimap ----------
// The nodes are drawn once into `mm.layer` (on renderAll / select / move); a pan or zoom only redraws the view box.
const mm = { layer: document.createElement("canvas"), key: "", job: 0, run: 0 };
// node layer: one pass for the bounds, one writing pixels straight into a buffer (100k fillRect calls took ~50 ms).
// Big boards build it in slices of about MM_MS between frames and keep showing the old layer meanwhile.
const MM_MS = 4;
function mmBuild(W, H) {
  const nodes = S.board.nodes, key = `${S.name}|${W}x${H}`, run = ++mm.run, sel = S.sel.size ? S.sel : null;
  clearTimeout(mm.job);
  const b = [Infinity, Infinity, -Infinity, -Infinity], cols = {};
  let i = 0, pass = 0, f = null, img = null, px = null;
  const colOf = (t, a) => { const k = t + a; if (cols[k] == null) { const h = parseInt((TYPE_C[t] || "#888888").slice(1), 16);
    cols[k] = ((a << 24) | ((h & 255) << 16) | (h & 0xff00) | (h >> 16)) >>> 0; } return cols[k]; };   // little-endian RGBA
  const step = (ms) => {
    const t0 = performance.now(); let end = 0;
    const more = () => { if (i >= nodes.length) return false; if (i < end) return true;
      if (performance.now() - t0 > ms) return false; end = Math.min(nodes.length, i + 1024); return true; };
    if (pass === 0) {
      for (; more(); i++) { const o = nodes[i], w = nodeW(o); if (o.x < b[0]) b[0] = o.x; if (o.y < b[1]) b[1] = o.y;
        if (o.x + w > b[2]) b[2] = o.x + w; if (o.y + nodeH(o) > b[3]) b[3] = o.y + nodeH(o); }
      if (i < nodes.length) return false;
      if (!nodes.length) { b[0] = b[1] = 0; b[2] = b[3] = 1; }
      f = mmFit(b[0], b[1], b[2], b[3], W, H); img = new ImageData(W, H); px = new Uint32Array(img.data.buffer); pass = 1; i = 0; return false;
    }
    for (; more(); i++) {
      const o = nodes[i], v = colOf(o.type, sel && sel.has(o.id) ? 255 : 179);
      const xa = f.ox + (o.x - f.x0) * f.s, ya = f.oy + (o.y - f.y0) * f.s;
      const x0p = Math.max(0, Math.round(xa)), x1p = Math.min(W, Math.round(xa + Math.max(2, nodeW(o) * f.s)));
      const y0p = Math.max(0, Math.round(ya)), y1p = Math.min(H, Math.round(ya + Math.max(2, nodeH(o) * f.s)));
      for (let y = y0p; y < y1p; y++) px.fill(v, y * W + x0p, y * W + x1p);
    }
    if (i < nodes.length) return false;
    const L = mm.layer; L.width = W; L.height = H; L.getContext("2d").putImageData(img, 0, 0);
    mm.nb = b; mm.lf = f; mm.key = key; return true;
  };
  if (!big() || !mm.nb || mm.key !== key) { step(Infinity); step(Infinity); return; }
  const tick = () => { if (run !== mm.run) return;
    if (S.board.nodes !== nodes) return mmBuild(W, H);
    if (step(MM_MS)) renderMinimap(); else mm.job = setTimeout(tick, 0); };
  mm.job = setTimeout(tick, 0);
}
function mmFit(x0, y0, x1, y1, W, H) {
  const pad = 40; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  const s = Math.min(W / (x1 - x0), H / (y1 - y0));
  return { s, x0, y0, ox: (W - (x1 - x0) * s) / 2, oy: (H - (y1 - y0) * s) / 2 };
}
function renderMinimap(nodesChanged) {
  const c = $("minimap"), ctx = c.getContext("2d"), W = c.width, H = c.height; ctx.clearRect(0, 0, W, H);
  if (!S.board) return;
  const r = vp.getBoundingClientRect(), v = S.board.view;
  const view = [-v.x / v.z, -v.y / v.z, r.width / v.z, r.height / v.z];
  if (nodesChanged || mm.key !== `${S.name}|${W}x${H}` || !mm.nb) mmBuild(W, H);
  if (!mm.nb) return;
  const [a, b, x1, y1] = mm.nb;   // fit the nodes and the view box; the node layer is scaled into place when they differ
  const m = mmFit(Math.min(a, view[0]), Math.min(b, view[1]), Math.max(x1, view[0] + view[2]), Math.max(y1, view[3] + view[1]), W, H), f = mm.lf;
  c._m = m;
  const k = m.s / f.s;
  ctx.drawImage(mm.layer, m.ox + (f.x0 - m.x0) * m.s - f.ox * k, m.oy + (f.y0 - m.y0) * m.s - f.oy * k, W * k, H * k);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 1;
  ctx.strokeRect(m.ox + (view[0] - m.x0) * m.s, m.oy + (view[1] - m.y0) * m.s, view[2] * m.s, view[3] * m.s);
}
$("minimap").addEventListener("pointerdown", (e) => {
  e.stopPropagation(); e.preventDefault();
  const c = $("minimap");
  const go = (ev) => {
    const m = c._m, rr = c.getBoundingClientRect(); if (!m) return;
    const wx = (ev.clientX - rr.left - m.ox) / m.s + m.x0, wy = (ev.clientY - rr.top - m.oy) / m.s + m.y0;
    const r = vp.getBoundingClientRect(), v = S.board.view;
    v.x = r.width / 2 - wx * v.z; v.y = r.height / 2 - wy * v.z; viewChanged();
  };
  go(e);
  const up = () => { removeEventListener("pointermove", go); removeEventListener("pointerup", up); };
  addEventListener("pointermove", go); addEventListener("pointerup", up);
});

// ---------- pointer: select, move, marquee, pan, connect ----------
function setTool(t) {
  S.tool = t; document.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === t));
  vp.classList.toggle("hand", t === "hand"); vp.classList.toggle("connect", t === "connect");
}
document.querySelectorAll("[data-tool]").forEach((b) => b.onclick = () => setTool(b.dataset.tool));
function drag(onMove, onUp) {
  const mv = (e) => onMove(e), up = (e) => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); S.dragging = false; onUp && onUp(e); };
  S.dragging = true; addEventListener("pointermove", mv); addEventListener("pointerup", up);
}
vp.addEventListener("pointerdown", (e) => {
  if (e.target.closest("#minimap")) return;
  const nodeEl = e.target.closest(".node"), port = e.target.closest(".port.out");
  if (e.button === 1 || (e.button === 0 && (spaceDown || S.tool === "hand"))) {
    e.preventDefault(); let lx = e.clientX, ly = e.clientY; vp.classList.add("panning");
    return drag((ev) => { S.board.view.x += ev.clientX - lx; S.board.view.y += ev.clientY - ly; lx = ev.clientX; ly = ev.clientY; viewChanged(); },
      () => vp.classList.remove("panning"));
  }
  if (e.button !== 0) return;
  if (document.activeElement && document.activeElement !== document.body) document.activeElement.blur();
  const [hx, hy] = toWorld(e.clientX, e.clientY);
  const id = nodeEl ? nodeEl.dataset.id : GL ? hitNode(hx, hy) : null;
  if (id && ((nodeEl && port) || S.tool === "connect")) { e.preventDefault(); return startConnect(id, e); }
  if (id) {
    e.preventDefault();
    if (e.shiftKey) { S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); } else if (!S.sel.has(id)) selectOnly(id);
    S.selEdge = null; renderSel();
    const [sx, sy] = toWorld(e.clientX, e.clientY), sx0 = e.clientX, sy0 = e.clientY;
    const moving = [...S.sel].map(byId).filter(Boolean).map((n) => [n, n.x, n.y]), movingIds = new Set(moving.map(([n]) => n.id));
    let moved = false;
    return drag((ev) => {
      if (S.readonly || (!moved && Math.hypot(ev.clientX - sx0, ev.clientY - sy0) < 3)) return;
      if (!moved) { snapPos([...movingIds]); moved = true; if (GL) GL.dragStart([...movingIds]); }
      const [wx, wy] = toWorld(ev.clientX, ev.clientY), dx = Math.round(wx - sx), dy = Math.round(wy - sy);
      for (const [n, ox, oy] of moving) { n.x = Math.round(ox + wx - sx); n.y = Math.round(oy + wy - sy); const el = els.get(n.id);
        if (el) { el.style.left = `${n.x}px`; el.style.top = `${n.y}px`; } }
      if (GL) GL.dragMove(dx, dy);
      moveEdges(movingIds);
    }, () => { if (moved) { ixMove(movingIds); if (GL) GL.dragEnd(); scheduleSave(); cull(true); renderMinimap(true); $("undo").disabled = false; } else if (!e.shiftKey) { selectOnly(id); renderSel(); } });
  }
  const hitId = GL ? hitEdge(hx, hy) : e.target.closest("path.hit")?.dataset.e;
  if (hitId) { S.selEdge = hitId; S.sel.clear(); renderSel(); return; }
  // marquee
  e.preventDefault();
  const r = vp.getBoundingClientRect(), mq = $("marquee"), keep = e.shiftKey ? new Set(S.sel) : new Set();
  const [ax, ay] = toWorld(e.clientX, e.clientY), sx0 = e.clientX, sy0 = e.clientY;
  if (!e.shiftKey) { S.sel.clear(); S.selEdge = null; renderSel(); }
  drag((ev) => {
    const x = Math.min(sx0, ev.clientX) - r.left, y = Math.min(sy0, ev.clientY) - r.top;
    Object.assign(mq.style, { left: `${x}px`, top: `${y}px`, width: `${Math.abs(ev.clientX - sx0)}px`, height: `${Math.abs(ev.clientY - sy0)}px` });
    mq.hidden = false;
    const [bx, by] = toWorld(ev.clientX, ev.clientY), X0 = Math.min(ax, bx), X1 = Math.max(ax, bx), Y0 = Math.min(ay, by), Y1 = Math.max(ay, by);
    S.sel = new Set(keep);
    for (const id of ix().grid.query(X0, Y0, X1, Y1)) S.sel.add(id);
    for (const [id, el] of els) el.classList.toggle("sel", S.sel.has(id));
    if (GL) GL.setSelection(S.sel, null);
  }, () => { mq.hidden = true; renderSel(); });
});
vp.addEventListener("dblclick", (e) => {
  const el = e.target.closest(".node"), [wx, wy] = toWorld(e.clientX, e.clientY);
  const id = el ? el.dataset.id : GL ? hitNode(wx, wy) : null;
  if (id) { e.preventDefault(); openFocus(byId(id)); return; }
  const eid = GL ? hitEdge(wx, wy) : e.target.closest("path.hit")?.dataset.e; if (eid) editEdgeLabel(eid);
});
function startConnect(fromId, e) {
  if (S.readonly) return setStatus("read-only board", "err");
  const a = byId(fromId), tp = $("tempedge").querySelector("path"), r = vp.getBoundingClientRect(), v = S.board.view;
  const x1 = (a.x + nodeW(a)) * v.z + v.x, y1 = (a.y + nodeH(a) / 2) * v.z + v.y;
  drag((ev) => {
    const x2 = ev.clientX - r.left, y2 = ev.clientY - r.top, d = Math.max(40, Math.abs(x2 - x1) / 2);
    tp.setAttribute("d", `M${x1},${y1} C${x1 + d},${y1} ${x2 - d},${y2} ${x2},${y2}`);
  }, (ev) => {
    tp.setAttribute("d", "");
    const t = document.elementFromPoint(ev.clientX, ev.clientY), tel = t && t.closest(".node"), [wx, wy] = toWorld(ev.clientX, ev.clientY);
    const to = tel ? tel.dataset.id : GL ? hitNode(wx, wy) : null;
    if (!to || to === fromId) return;
    if (edgesOf(fromId).some((x) => (x.from === fromId && x.to === to) || (x.from === to && x.to === fromId)))
      return setStatus("those two are already linked");
    snap([fromId, to]); const ed = { id: newId("e"), from: fromId, to, kind: "user", label: "" };
    S.board.edges.push(ed); ixAdd([], [ed]); mark(null, [ed.id]); S.selEdge = ed.id; S.sel.clear(); renderAll(); scheduleSave();
    setStatus("link added: double-click it (or use the side panel) to label it", "ok");
  });
}
function editEdgeLabel(eid) {
  if (S.readonly) return setStatus("read-only board", "err");
  const ed = ix().eById.get(eid); if (!ed || ed.kind !== "user") return;
  const t = prompt("Label for this link", ed.label || ""); if (t == null) return;
  snap([ed.from, ed.to]); mark(null, [ed.id]); ed.label = t.trim().slice(0, 120); renderAll(); scheduleSave();
}

// ---------- delete ----------
function dialog(text, buttons) {
  $("dlgtext").textContent = text; const b = $("dlgbtns"); b.innerHTML = "";
  for (const [label, fn, cls] of buttons.filter(Boolean)) {
    const x = document.createElement("button"); x.textContent = label; if (cls) x.className = cls;
    x.onclick = () => { $("dialog").hidden = true; fn && fn(); }; b.append(x);
  }
  $("dialog").hidden = false; b.lastChild && b.firstChild.focus();
}
function deleteSel() {
  if (S.readonly) return setStatus("read-only board", "err");
  if (S.selEdge) {
    const ed = ix().eById.get(S.selEdge); if (!ed) return;
    if (ed.kind !== "user") return setStatus("a clip/screenshot line goes with its node: delete the node instead", "err");
    snap([ed.from, ed.to]); S.board.edges = S.board.edges.filter((x) => x !== ed); S.selEdge = null; renderAll(); scheduleSave(); return;
  }
  if (!S.sel.size) return;
  const ids = new Set(); const add = (id) => { if (ids.has(id)) return; ids.add(id); kids(id).forEach((k) => add(k.id)); };
  S.sel.forEach(add);
  const gone = [...ids].map(byId).filter(Boolean), extra = ids.size - S.sel.size;
  const files = gone.flatMap((n) => n.type === "clip" ? [n.file].filter(Boolean) : n.type === "shot" ? [n.image, n.flat].filter(Boolean) : []);
  dialog(`Remove ${ids.size} node${ids.size > 1 ? "s" : ""} from the board${extra ? ` (including ${extra} clip/screenshot/point${extra > 1 ? "s" : ""} made from them)` : ""}?` +
    (files.length ? ` ${files.length} file${files.length > 1 ? "s were" : " was"} made for them (cut clips / frames). Source videos are never touched.` : ""), [
    ["Remove from board", () => doDelete(ids, []), "primary"],
    files.length && ["Remove + move files to annotations/trash", () => doDelete(ids, files), "danger"],
    ["Cancel", null]]);
}
function doDelete(ids, files) {
  snap([...ids]);
  S.board.nodes = S.board.nodes.filter((n) => !ids.has(n.id));
  S.board.edges = S.board.edges.filter((e) => !ids.has(e.from) && !ids.has(e.to));
  S.sel.clear(); if (F.node && ids.has(F.node.id)) closeFocus();
  renderAll(); scheduleSave(); refreshAddVid();
  if (files.length) api("/api/trash", { paths: files }).then((r) => setStatus(`removed; ${r.moved.length} files moved to annotations/trash/`, "ok"))
    .catch((e) => setStatus("TRASH FAILED: " + e.message, "err"));
  else setStatus(`removed ${ids.size} node(s) (Ctrl+Z brings them back)`, "ok");
}

// ---------- side panel ----------
// node and link counts for the board summary; counted again only when the arrays or their lengths change
let countsKey = null, counts = null;
function boardCounts() {
  const b = S.board, k = countsKey;
  if (k && k[0] === b.nodes && k[1] === b.edges && k[2] === b.nodes.length && k[3] === b.edges.length) return counts;
  const c = { links: 0 }; for (const x of b.nodes) c[x.type] = (c[x.type] || 0) + 1;
  for (const e of b.edges) if (e.kind === "user") c.links++;
  countsKey = [b.nodes, b.edges, b.nodes.length, b.edges.length]; return counts = c;
}
function panelNode() { return S.sel.size === 1 ? byId([...S.sel][0]) : null; }
function toggleTag(n, t) {
  if (S.readonly) return setStatus("read-only board", "err");
  snap([n.id], true); n.tags = n.tags || []; const i = n.tags.indexOf(t); i < 0 ? n.tags.push(t) : n.tags.splice(i, 1);
  touchNode(n); if (F.node) tlRender();
}
let fieldSnap = false;
function bindField(el, n, key) {
  el.value = n[key] || "";
  el.onfocus = () => { fieldSnap = false; };
  el.oninput = () => { if (!fieldSnap) { snap([n.id], true); fieldSnap = true; } n[key] = el.value; touchNode(n, true); if (key === "title") renderEdges(); };
}
function rel(label, n) {
  const a = document.createElement("span"); a.className = "lnk";
  a.textContent = `${label}${n.type} · ${nodeName(n)} · ${timesText(n)}`;
  a.onclick = () => { selectOnly(n.id); renderSel(); if (!F.node) fitTo([n]); }; a.ondblclick = () => openFocus(n);
  return a;
}
function renderPanel() {
  const P = $("panel");
  if (!S.board) return;
  if (S.selEdge) {
    const ed = ix().eById.get(S.selEdge); if (!ed) return;
    P._id = "edge"; const a = byId(ed.from), b = byId(ed.to);
    P.innerHTML = `<h2>${ed.kind === "user" ? "Your link" : "Derived line"}</h2><div id="p-rel"></div>` +
      (ed.kind === "user" ? `<label>Label</label><input type="text" id="p-elabel" maxlength="120"><div class="row" style="margin-top:8px"><button id="p-edel" class="danger">Delete link</button></div>` :
        `<p class="muted">Made when the clip/screenshot was cut. It goes away with the node.</p>`);
    $("p-rel").append(rel("from ", a), rel("to ", b));
    if (ed.kind === "user") { const i = $("p-elabel"); i.value = ed.label || "";
      i.onfocus = () => { fieldSnap = false; }; i.oninput = () => { if (!fieldSnap) { snap([ed.from, ed.to]); fieldSnap = true; } mark(null, [ed.id]); ed.label = i.value; renderEdges(); scheduleSave(); };
      $("p-edel").onclick = deleteSel; }
    return;
  }
  const n = panelNode();
  if (!n) {
    P._id = null;
    const c = S.sel.size > 1 ? null : boardCounts();
    P.innerHTML = S.sel.size > 1 ? `<h2>${S.sel.size} selected</h2><p class="muted">Drag to move them together. 1–9 toggles a tag on all of them.</p><button id="p-mdel" class="danger">Delete…</button>` :
      `<h2>Board “${esc(S.name)}”</h2><p class="muted">${c.video || 0} videos · ${c.clip || 0} clips · ${c.shot || 0} screenshots · ${c.point || 0} points · ${c.links} links of yours</p>
      <p>Click a node to see its notes here. Double-click (or Enter) opens it: a video gets the full player with I / O / M / S, a screenshot gets the drawing tools.</p>
      <p class="muted">Press ? for every key.</p>`;
    if ($("p-mdel")) $("p-mdel").onclick = deleteSel;
    return;
  }
  if (P._id !== n.id) {
    P._id = n.id;
    P.innerHTML = `<div class="row"><span class="ty chip" style="--c:${TYPE_C[n.type]}">${n.type.toUpperCase()}</span><h2 class="grow" id="p-name"></h2>
      <button id="p-open" title="Enter">Open ⏎</button><button id="p-del" class="danger" title="Delete">Delete</button></div>
      <label>Title <span class="muted">(optional)</span></label><input type="text" id="p-title" maxlength="80">
      <h4>Times</h4><div class="kv" id="p-times"></div>${n.type === "clip" ? `
      <h4>In / out <span class="muted">— source frames; extend or shorten (numbers only, Ctrl+Z undoes)</span></h4>
      <div class="row trim"><span>in f</span><input type="number" id="p-sfin" step="1" min="0"><span>out f</span><input type="number" id="p-sfout" step="1" min="0">
      <button id="p-trim" title="Enter in either box">Apply</button></div>
      <p class="muted small">Or in the player: drag either end of the clip's bar, or select the bar and press [ / ] at the playhead.</p>` : ""}
      <label>Note <span class="muted">— what it is, how it's built</span></label><textarea id="p-note" rows="7"></textarea>
      <label>Why it's used <span class="muted">— purpose / why it works</span></label><textarea id="p-purpose" rows="4"></textarea>
      <h4>Tags <span class="muted">(1–9)</span></h4><div id="tags"></div>
      <input type="text" id="newtag" placeholder="custom tag + Enter (remembered)" maxlength="40" style="margin-top:6px">
      <div id="p-draw"></div><h4>Made from</h4><div id="p-par"></div><h4>Made here</h4><div id="p-kids"></div>
      <h4>Your links</h4><div id="p-links"></div>`;
    bindField($("p-title"), n, "title"); bindField($("p-note"), n, "note"); bindField($("p-purpose"), n, "purpose");
    $("p-open").onclick = () => openFocus(n); $("p-del").onclick = deleteSel;
    if (n.type === "clip") {
      const go = () => { const i = Math.round(+$("p-sfin").value), o = Math.round(+$("p-sfout").value);
        if (!Number.isFinite(i) || !Number.isFinite(o) || o <= i) return setStatus("out must be after in", "err");
        if (!retrimClip(n, n.pf_in + (i - n.sf_in), n.pf_in + (o - n.sf_in))) renderPanel(); };
      $("p-trim").onclick = go;
      for (const id of ["p-sfin", "p-sfout"]) $(id).onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); go(); $(id).blur(); } };
    }
    $("newtag").onkeydown = async (e) => {
      if (e.key !== "Enter") return; e.preventDefault(); e.stopPropagation();
      const t = e.target.value.trim().slice(0, 40); if (!t) return; e.target.value = "";
      if (!(n.tags || []).includes(t)) toggleTag(n, t);
      if (!PRESET_C[t] && !S.custom.includes(t)) {
        S.custom.push(t);
        try { S.custom = await api("/api/tags", S.custom); } catch (err) { setStatus("TAG SAVE FAILED: " + err.message, "err"); }
        renderPanel();
      }
    };
  } else {
    if (document.activeElement !== $("p-note")) $("p-note").value = n.note || "";
    if (document.activeElement !== $("p-purpose")) $("p-purpose").value = n.purpose || "";
    if (document.activeElement !== $("p-title")) $("p-title").value = n.title || "";
  }
  $("p-name").textContent = nodeName(n);
  if (n.type === "clip") for (const [id, v] of [["p-sfin", n.sf_in], ["p-sfout", n.sf_out]])
    if (document.activeElement !== $(id)) $(id).value = v;
  // times
  const kv = []; const fpsN = fpsOf(n);
  if (n.type === "video") kv.push(["length", n.duration ? tc(n.duration) : "?"], ["fps", fpsN.toFixed(3)], ["file", n.src]);
  else if (n.type === "clip") {
    kv.push(["source", `${tc(fT(n, n.sf_in))} → ${tc(fT(n, n.sf_out + 1))}`], ["src frames", `f${n.sf_in}–f${n.sf_out} (${n.sf_out - n.sf_in + 1} frames, ${fT(n, n.sf_out - n.sf_in + 1).toFixed(3)} s)`],
      ["in parent", `${tc(fT(n, n.pf_in))} → ${tc(fT(n, n.pf_out + 1))} (f${n.pf_in}–f${n.pf_out})`],
      ["file", n.file || "none - plays this range of the source"]);
    if (n.err) kv.push(["error", n.err]);
  } else {
    kv.push(["source", `${tc(fT(n, n.sf))} · f${n.sf}`], ["in parent", `${tc(fT(n, n.pf))} · f${n.pf}`]);
    if (n.type === "shot") kv.push(["frame", `${n.image}${n.exact === false ? " (NOT exact)" : ""}`], ["png", n.flat || "— (made when you draw)"]);
  }
  $("p-times").innerHTML = kv.map(([k, v]) => `<b>${k}</b><code>${esc(String(v))}</code>`).join("");
  // tags
  const box = $("tags"); box.innerHTML = "";
  const all = [...PRESETS.map((p) => p[0]), ...S.custom.filter((t) => !PRESET_C[t])];
  for (const t of new Set([...all, ...(n.tags || [])])) {
    const b = document.createElement("button"); b.className = "tag" + ((n.tags || []).includes(t) ? " on" : "");
    b.style.setProperty("--c", tagColor(t)); b.textContent = t;
    const pi = PRESETS.findIndex((p) => p[0] === t);
    if (pi >= 0) { const s = document.createElement("sup"); s.textContent = pi + 1; b.append(s); }
    if (pi < 0 && S.custom.includes(t)) {
      const x = document.createElement("span"); x.className = "x"; x.textContent = "×"; x.title = "Forget this custom tag";
      x.onclick = async (e) => { e.stopPropagation(); S.custom = S.custom.filter((y) => y !== t);
        try { S.custom = await api("/api/tags", S.custom); } catch (err) { setStatus(err.message, "err"); } renderPanel(); };
      b.append(x);
    }
    b.onclick = () => toggleTag(n, t); box.append(b);
  }
  // drawings
  const dr = $("p-draw"); dr.innerHTML = "";
  if (n.type === "shot") {
    const [W, H] = n.size || [1920, 1080];
    dr.innerHTML = `<h4>Drawings (${(n.shapes || []).length})</h4>`;
    (n.shapes || []).forEach((s, i) => {
      const row = document.createElement("div"); row.className = "shp";
      row.innerHTML = `<i style="color:${s.c}">■</i><span>${esc(shapeLabel(s, W, H))}</span>`;
      const x = document.createElement("button"); x.textContent = "✕"; x.title = "Delete this drawing";
      x.onclick = () => { snap([n.id], true); n.shapes.splice(i, 1); touchNode(n); queueFlatten(n); if (F.node === n) shotHost.redraw(); };
      row.append(x); dr.append(row);
    });
    if (!(n.shapes || []).length) dr.append(Object.assign(document.createElement("p"), { className: "muted", textContent: "Open it (Enter) to draw: pen, highlighter, arrow, box, circle, text, ruler." }));
  }
  // relations
  const par = $("p-par"); par.innerHTML = "";
  const chain = []; for (let x = byId(n.parent); x; x = byId(x.parent)) chain.unshift(x);
  chain.forEach((x, i) => par.append(rel("↑".repeat(chain.length - i) + " ", x)));
  if (!chain.length) par.innerHTML = `<span class="muted">— (a main video)</span>`;
  const kd = $("p-kids"); kd.innerHTML = "";
  const ks = kids(n.id).sort((a, b) => (a.pf_in ?? a.pf) - (b.pf_in ?? b.pf));
  ks.forEach((k) => kd.append(rel("↓ ", k)));
  if (!ks.length) kd.innerHTML = `<span class="muted">nothing yet${n.type === "video" || n.type === "clip" ? " — open it and press I/O, M or S" : ""}</span>`;
  const lk = $("p-links"); lk.innerHTML = "";
  const mine = edgesOf(n.id).filter((e) => e.kind === "user");
  for (const e of mine) {
    const o = byId(e.from === n.id ? e.to : e.from); if (!o) continue;
    const row = document.createElement("div"); row.className = "shp";
    const l = rel(e.label ? `“${e.label}” ↔ ` : "↔ ", o); l.style.flex = "1"; row.append(l);
    const x = document.createElement("button"); x.textContent = "✕"; x.title = "Delete link";
    x.onclick = () => { snap([e.from, e.to]); S.board.edges = S.board.edges.filter((y) => y !== e); renderAll(); scheduleSave(); };
    row.append(x); lk.append(row);
  }
  if (!mine.length) lk.innerHTML = `<span class="muted">drag from the ● on a node's right edge to another node</span>`;
}

// ---------- boards ----------
async function loadBoards() {
  const names = await api("/api/boards"); const p = $("boardpick"); p.innerHTML = "";
  for (const b of names) { const o = document.createElement("option"); o.value = o.textContent = b; p.append(o); }
  return names;
}
function refreshAddVid() {
  const s = $("addvid"); s.innerHTML = `<option value="">+ Add video…</option>`;
  const on = new Set(S.board.nodes.filter((n) => n.type === "video").map((n) => n.src));
  for (const v of S.videos) {
    const o = document.createElement("option"); o.value = v.v;
    o.textContent = `${on.has(v.v) ? "✓ " : ""}${v.slug} / ${v.name} (${v.mb} MB)`; s.append(o);
  }
}
async function loadBoard(name, keepView) {
  if (!keepView) await saveNow();
  if (F.node) closeFocus();
  const view = keepView && S.board ? S.board.view : null;
  S.name = name; S.board = await api(`/api/board?b=${enc(name)}`);
  S.board.view = view || S.board.view || { x: 80, y: 60, z: 0.5 };
  undoS = []; redoS = [];   // history from before a disk load would undo straight over the newer board
  D_N = new Set(); D_E = new Set(); R_N.clear(); R_E.clear(); viewDirty = false; fullNext = false;
  S.sel.clear(); S.selEdge = null; for (const el of els.values()) el.remove(); els.clear(); $("panel")._id = null;
  for (const el of POOL) el.remove(); POOL.length = 0; $("elabels").replaceChildren(); labelEls.clear();
  shown = null; near = true; glFull = true; glArr = null; if (GL) GL.setNodeLayers(false);
  S.readonly = !GL && S.board.nodes.length > BIG;   // without WebGL a big board can only be looked at
  $("boardpick").value = name; history.replaceState(null, "", "?b=" + enc(name)); localStorage.setItem("rb.board", name);
  const changed = [];
  await Promise.all(S.board.nodes.filter((n) => n.type === "video" && (!n.fps || !n.duration)).map(async (n) => {
    try { const i = await mediaInfo(n.src); Object.assign(n, { fps: [i.fps_num, i.fps_den], size: [i.width, i.height], duration: i.duration }); changed.push(n.id); }
    catch (e) { setStatus(`${n.src}: ${e.message}`, "err"); }
  }));
  for (const n of S.board.nodes) if (n.type !== "video" && !n.fps) { let r = n; while (r && r.type !== "video") r = byId(r.parent); if (r && r.fps) { n.fps = r.fps; changed.push(n.id); } }
  applyView(); renderAll(); refreshAddVid(); ensureAssets();
  if (changed.length) { mark(changed); scheduleSave(); }
  if (S.readonly) setStatus(`This board needs WebGL (${S.board.nodes.length} nodes) - opened read-only`, "err");
  else if (glErr) setStatus(glErr, "err");
  else setStatus(`board “${name}” · ${S.board.nodes.length} nodes`, "ok");
}
$("boardpick").onchange = (e) => loadBoard(e.target.value).catch((err) => setStatus(err.message, "err"));
$("newboard").onclick = async () => {
  const t = prompt("New board name (lower-case letters, digits, - or _)", ""); if (!t) return;
  const name = t.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+/, "").slice(0, 40);
  if (!name) return;
  try {
    const names = await api("/api/boards");
    if (!names.includes(name)) await api(`/api/board?b=${enc(name)}`, { nodes: [], edges: [], view: { x: 100, y: 100, z: 0.6 } });
    await loadBoards(); await loadBoard(name);
    setStatus(`board “${name}” ready: add videos with “+ Add video…”`, "ok");
  } catch (e) { setStatus(e.message, "err"); }
};
$("addvid").onchange = (e) => { const v = e.target.value; e.target.value = ""; e.target.blur(); if (v) addVideo(v); };
$("undo").onclick = undo; $("redo").onclick = redo; $("fit").onclick = fitAll; $("zsel").onclick = fitSel;
$("helpbtn").onclick = () => $("help").hidden = false; $("helpclose").onclick = () => $("help").hidden = true;

// ---------- keys ----------
addEventListener("keydown", (e) => {
  if (!S.board) return;
  if (!$("dialog").hidden) { if (e.key === "Escape") { e.preventDefault(); $("dialog").hidden = true; } return; }
  if (!$("help").hidden) { if (e.key === "Escape" || e.key === "?") { e.preventDefault(); $("help").hidden = true; } return; }
  if (typing()) { if (e.key === "Escape") document.activeElement.blur(); return; }
  if (e.ctrlKey || e.metaKey) {
    const k = e.key.toLowerCase();
    if (k === "z") { e.preventDefault(); e.shiftKey ? redo() : undo(); }
    else if (k === "y") { e.preventDefault(); redo(); }
    else if (k === "a" && !F.node) { e.preventDefault(); S.sel = new Set(S.board.nodes.map((n) => n.id)); renderSel(); }
    return;
  }
  if (e.altKey) return;
  if (F.node) { focusKey(e); return; }
  if (e.shiftKey && e.code === "Digit1") { e.preventDefault(); return fitAll(); }
  if (e.shiftKey && e.code === "Digit2") { e.preventDefault(); return fitSel(); }
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === " ") { e.preventDefault(); if (!spaceDown) { spaceDown = true; vp.classList.add("panning"); } return; }
  if (k === "?") { $("help").hidden = false; return; }
  const fn = { v: () => setTool("select"), h: () => setTool("hand"), c: () => setTool("connect"),
    Delete: deleteSel, Backspace: deleteSel, Escape: () => { selectOnly(null); renderSel(); },
    Enter: () => { const n = panelNode(); if (n) openFocus(n); } }[k];
  if (fn) { e.preventDefault(); fn(); return; }
  if (/^[1-9]$/.test(e.key) && S.sel.size && !S.readonly) {
    e.preventDefault(); const t = PRESETS[+e.key - 1][0]; const sel = S.board.nodes.filter((n) => S.sel.has(n.id));
    const on = !sel.every((n) => (n.tags || []).includes(t)); snap(sel.map((n) => n.id), true);
    for (const n of sel) { n.tags = (n.tags || []).filter((x) => x !== t); if (on) n.tags.push(t); n.updated = nowIso(); }
    renderAll(); scheduleSave();
  }
});
addEventListener("keyup", (e) => { if (e.key === " ") { spaceDown = false; vp.classList.remove("panning"); } });
addEventListener("blur", () => { spaceDown = false; vp.classList.remove("panning"); });
addEventListener("resize", () => { cull(); renderMinimap(true); });

// ---------- boot ----------
(async () => {
  initSwatches(); drawToolsEnabled(false);
  try { S.custom = await api("/api/tags"); } catch { S.custom = []; }
  if (!NOGL) try {
    await Scene.init($("gl"), { node: byId, edge: (id) => S.board && ix().eById.get(id), adj: (id) => (S.board && ix().adj.get(id)) || [],
      each: (a, b, c, d, fn) => S.board && ix().grid.each(a, b, c, d, fn) });
    GL = Scene; ZMIN = 0.002;
  } catch (e) { glErr = "WebGL unavailable - using the simple board: " + e.message; console.warn(e); }
  try {
    S.videos = await api("/api/videos");
    const names = await loadBoards();
    const want = new URLSearchParams(location.search).get("b") || localStorage.getItem("rb.board") || "farrell";
    await loadBoard(names.includes(want) ? want : "farrell");
  } catch (e) { setStatus("LOAD FAILED: " + e.message, "err"); }
})();
