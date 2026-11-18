"use strict";
// focus.js - the big player for video/clip nodes and the viewer for screenshot nodes.
// Frames are counted at the video's own fps; a clip's local frame k is source frame sf_in + k.
// A clip has no file of its own: the player plays its SOURCE video, offset by F.off = sf_in, and the
// timeline is zoomed to the clip's in/out. F.lo..F.hi = local frames the timeline may reach (the
// whole parent), so frames outside the clip are seen live while extending it.
const F = { node: null, kind: null, info: null, src: null, off: 0, lo: 0, hi: 0, in: null, view: [0, 1], media: null, drag: null };
const fvid = document.getElementById("fvid"), fimg = document.getElementById("fimg");
const ovl = document.getElementById("overlay");

const fframeT = (n) => n * F.info.fps_den / F.info.fps_num;
const fframeAt = (t) => Math.max(F.lo, Math.min(F.hi, Math.floor(t * F.info.fps + 1e-4)));
const vt = () => fvid.currentTime - F.off * F.info.fps_den / F.info.fps_num;   // local time (0 = clip in)
const fcur = () => fframeAt(vt());
const inClip = (f) => f >= 0 && f <= F.info.nb_frames - 1;
function seekFrame(n) { n = Math.max(F.lo, Math.min(F.hi, n)); fvid.currentTime = (F.off + n + 0.5) / F.info.fps; }
// local range of the open node from its numbers (called on open, after a trim and after undo)
function syncRange() {
  const n = F.node, s = F.src; if (!n || F.kind !== "video" || !s) return;
  const old = F.off, clip = n.type === "clip";
  F.off = clip ? n.sf_in : 0;
  const len = clip ? n.sf_out - n.sf_in + 1 : s.nb_frames;
  F.info = clip ? { ...s, nb_frames: len, duration: len * s.fps_den / s.fps_num } : s;
  const P = clip ? byId(n.parent) : null, last = P ? parentLast(P) : null;
  F.lo = Math.max(-F.off, clip ? -n.pf_in : 0);
  F.hi = Math.min(s.nb_frames - 1 - F.off, clip && last != null ? last - n.pf_in : s.nb_frames - 1);
  if (old != null && old !== F.off) {           // same source time stays under the playhead
    const sh = (old - F.off) * s.fps_den / s.fps_num; F.view = clampView(F.view[0] + sh, F.view[1] - F.view[0]);
  }
}
function clipView() {                            // the clip with some context either side
  const d = F.info.duration; if (F.node.type !== "clip") return tlBounds();
  const pad = Math.max(1, d * 0.35); return clampView(-pad, d + 2 * pad);
}
function outsideMsg() { setStatus("that frame is outside this clip - extend the clip to it first (drag the blue bar's end or press [ / ])", "err"); }
function fstep(df) { if (!fvid.paused) fvid.pause(); seekFrame(fcur() + df); }
function ftoggle() { fvid.paused ? fvid.play() : fvid.pause(); }
const kidsOf = (id) => kids(id);
const shotAt = (k) => kids(F.node.id).find((x) => x.type === "shot" && x.pf === k);

async function mediaInfo(rel) {
  if (!S.infos[rel]) S.infos[rel] = await api(`/api/info?v=${encodeURIComponent(rel)}`);
  return S.infos[rel];
}

async function openFocus(n, atFrame) {
  if (!n) return;
  if (n.type === "point") { const p = byId(n.parent); if (p) return openFocus(p, n.pf); return; }
  fvid.pause(); F.node = n; F.in = null; F.kind = n.type === "shot" ? "shot" : "video";
  setDrawTool(null); selectOnly(n.id);
  $("focus").hidden = false; $("fmsg").hidden = true;
  const isVid = F.kind === "video";
  $("transport").hidden = !isVid; $("tlwrap").hidden = !isVid;
  fvid.hidden = !isVid; fimg.hidden = isVid;
  renderCrumb();
  if (!isVid) {
    D.host = shotHost;
    if (n.status === "pending" || !n.image) { fmsg("grabbing frame…"); waitReady(n, atFrame); }
    fimg.onload = () => { layoutOverlay(ovl, $("fstage"), fimg.naturalWidth, fimg.naturalHeight); shotHost.redraw(); };
    fimg.src = `/img?p=${encodeURIComponent(n.image)}&_=${n.ver || 0}`;
    drawToolsEnabled(true); $("fhint").textContent = "draw with P G A B E T R · V pick/move · Delete removes a drawing · Esc board";
    return;
  }
  D.host = videoHost;
  let src; try { src = await mediaInfo(n.src); } catch (e) { fmsg("cannot open: " + e.message); return; }
  if (F.node !== n) return;
  F.src = src; F.off = null; syncRange(); F.view = clipView();
  const url = `/video?v=${encodeURIComponent(n.src)}`, at = atFrame ?? n.last ?? 0;
  const go = () => { layoutOverlay(ovl, $("fstage"), F.info.width, F.info.height); seekFrame(at); tlRender(); videoHost.redraw(); };
  if (F.media === n.src && fvid.getAttribute("src") === url && fvid.readyState >= 1) go();   // same source: no reload
  else { F.media = n.src; fvid.onloadedmetadata = go; fvid.src = url; }
  $("fhint").textContent = n.type === "clip"
    ? "Space play · ←/→ frame · Shift ±1s · I / O move this clip's in / out to the playhead · Shift+I then Shift+O new clip inside · drag bar ends · M point · S shot · Esc board"
    : "Space play · ←/→ frame · Shift ±1s · I then O new clip · [ ] move a selected clip's in/out · drag bar ends · M point · S shot · Esc board";
  drawToolsEnabled(true); tlRender(); videoHost.redraw();
}
function waitReady(n, atFrame) {
  const t = setInterval(() => {
    if (F.node !== n) return clearInterval(t);
    if (n.status === "ready" || n.status === "error") { clearInterval(t); openFocus(n, atFrame); }
    else fmsg(n.type === "clip" ? `cutting clip… ${n.pct || 0}%` : "grabbing frame…");
  }, 400);
}
function fmsg(t) { $("fmsg").hidden = false; $("fmsg").textContent = t; }
function closeFocus() {
  if (F.node && F.kind === "video" && F.info) F.node.last = fcur();
  fvid.pause(); fvid.removeAttribute("src"); fvid.load(); fimg.removeAttribute("src");
  $("focus").hidden = true; F.node = null; F.info = null; F.src = null; F.media = null; D.host = null; setDrawTool(null); drawToolsEnabled(false);
  ovl.innerHTML = ""; renderAll();
}
function drawToolsEnabled(on) {
  const ok = on && F.node && (F.kind === "shot" || fvid.paused);
  $("drawtools").classList.toggle("off", !ok);
}
function renderCrumb() {
  const c = $("fcrumb"); c.innerHTML = "";
  const chain = []; for (let x = F.node; x; x = byId(x.parent)) chain.unshift(x);
  chain.forEach((x, i) => {
    if (i) c.append(" › ");
    const a = document.createElement(i === chain.length - 1 ? "b" : "a");
    a.textContent = nodeName(x); if (i < chain.length - 1) a.onclick = () => openFocus(x);
    c.append(a);
  });
  const t = timesText(F.node); if (t) c.append(Object.assign(document.createElement("span"), { className: "muted", textContent: "   " + t }));
}

// ---------- marking (I / O / M / S) ----------
function setIn() { const f = fcur(); if (!inClip(f)) return outsideMsg(); F.in = f; tlRender(); }
function setOut() {
  const f = fcur(); if (!inClip(f)) return outsideMsg();
  const a = F.in == null ? f : F.in;
  F.in = null; tlRender();
  if (a === f) { setStatus("in and out are the same frame: move first, or use M for a point", "err"); return; }
  createClip(F.node, Math.min(a, f), Math.max(a, f));
  tlRender();
}
function commitEnter() { if (F.in != null) setOut(); }
// [ / ] : move the in / out of an existing clip to the playhead: a clip selected on this timeline,
// else the open clip itself (park the playhead outside it to extend, inside to shorten).
function trimKey(side) {
  if (!fvid.paused) fvid.pause();
  const f = fcur(), sel = S.sel.size === 1 && byId([...S.sel][0]);
  let n, a;
  if (sel && sel.type === "clip" && sel.parent === F.node.id) { n = sel; a = f; }
  else if (F.node.type === "clip") { n = F.node; a = n.pf_in + f; }
  else return setStatus("select a clip bar on the timeline first (click it), then [ sets its in, ] its out", "err");
  if (side === "in" ? a >= n.pf_out : a <= n.pf_in)
    return setStatus(`${side} must stay ${side === "in" ? "before the out" : "after the in"} (f${n.pf_in}–f${n.pf_out} in its parent)`, "err");
  retrimClip(n, side === "in" ? a : n.pf_in, side === "in" ? n.pf_out : a);
}
// I / O with a clip open: move that clip's own in / out to the playhead, Premiere-style. Parked on the grey
// (outside the clip) it extends the clip; past the other end the clip shrinks to 2 frames there (the shortest
// clip the board keeps). Shift+I / Shift+O still make a new clip inside it.
function clipKey(side) {
  if (!fvid.paused) fvid.pause();
  const n = F.node, f = n.pf_in + fcur(), last = parentLast(byId(n.parent)) ?? Infinity;
  let a = n.pf_in, b = n.pf_out;
  if (side === "in") { a = f; if (a >= b) b = a + 1; } else { b = f; if (b <= a) a = b - 1; }
  if (b > last) { b = last; a = Math.min(a, last - 1); }
  if (a < 0) { a = 0; b = Math.max(b, 1); }
  if (a === n.pf_in && b === n.pf_out) return setStatus(`this clip's ${side} is already on this frame`, "ok");
  retrimClip(n, a, b);
}
const clipOpen = () => F.node && F.node.type === "clip";
const keyIn = (shift) => clipOpen() && !shift ? clipKey("in") : setIn();
const keyOut = (shift) => clipOpen() && !shift ? clipKey("out") : setOut();
function setPoint() { const f = fcur(); if (!inClip(f)) return outsideMsg(); createPoint(F.node, f); tlRender(); }
function screenshot() { if (!fvid.paused) fvid.pause(); const f = fcur(); if (!inClip(f)) return outsideMsg(); seekFrame(f);
  const s = shotAt(f); if (s) { selectOnly(s.id); renderAll(); setStatus("a screenshot of this frame already exists", "ok"); return; }
  createShot(F.node, f); tlRender(); }

// ---------- drawing hosts ----------
const videoHost = {
  ready: () => F.kind === "video" && !!F.info && fvid.paused && inClip(fcur()),
  size: () => [F.info.width, F.info.height],
  shapes() { const s = shotAt(fcur()); return s ? s.shapes : null; },
  edit(fn, first) { const s = shotAt(fcur()); if (!s) return; if (first) snap([s.id], true); fn(s.shapes); touchNode(s, true); this.redraw(); },
  add(shape) { const f = fcur(); let s = shotAt(f); const id = s ? s.id : newId("s"); snap([id], !!s); if (!s) s = createShot(F.node, f, true, id);
    s.shapes.push(shape); touchNode(s); this.redraw(); queueFlatten(s); },
  done() { const s = shotAt(fcur()); if (s) { touchNode(s); queueFlatten(s); } },
  redraw() {
    if (!F.info || F.kind !== "video") return;
    layoutOverlay(ovl, $("fstage"), F.info.width, F.info.height);
    const s = fvid.paused ? shotAt(fcur()) : null;
    renderOverlay(ovl, s ? s.shapes : [], F.info.width, F.info.height, D.sel, D.cur);
  },
};
const shotHost = {
  ready: () => F.kind === "shot" && F.node && F.node.status !== "pending",
  size: () => F.node.size || [fimg.naturalWidth, fimg.naturalHeight],
  shapes: () => F.node.shapes,
  edit(fn, first) { if (first) snap([F.node.id], true); fn(F.node.shapes); touchNode(F.node, true); this.redraw(); },
  add(shape) { snap([F.node.id], true); F.node.shapes.push(shape); touchNode(F.node); this.redraw(); queueFlatten(F.node); },
  done() { touchNode(F.node); queueFlatten(F.node); },
  redraw() {
    if (F.kind !== "shot" || !F.node) return;
    const [W, H] = this.size(); if (!W) return;
    layoutOverlay(ovl, $("fstage"), W, H);
    renderOverlay(ovl, F.node.shapes, W, H, D.sel, D.cur);
  },
};
ovl.addEventListener("pointerdown", (e) => {
  if (F.kind === "video" && !fvid.paused) { fvid.pause(); return; }
  overlayDown(e);
});
function deleteShape() {
  const h = D.host; if (!h || D.sel < 0 || !h.shapes() || !h.shapes()[D.sel]) return false;
  const i = D.sel; h.edit((a) => a.splice(i, 1), true); D.sel = -1; h.done(); h.redraw(); renderPanel(); return true;
}

// ---------- transport ----------
fvid.addEventListener("pause", () => { if (F.info) seekFrame(fcur()); drawToolsEnabled(true); videoHost.redraw(); });
fvid.addEventListener("play", () => { if (F.info) F.loop = inClip(fcur()); $("playbtn").textContent = "❚❚"; drawToolsEnabled(true); videoHost.redraw(); });
fvid.addEventListener("pause", () => $("playbtn").textContent = "▶");
fvid.addEventListener("seeked", () => videoHost.redraw());
$("rate").onchange = (e) => fvid.playbackRate = +e.target.value;
let lastClockF = -1;
function ftick() {
  if (F.info && F.kind === "video") {
    const f = fcur(), n = F.node;
    if (f !== lastClockF) {
      lastClockF = f;
      const sf = srcFrame(n, f);
      $("clock").textContent = `${f < 0 ? "−" : ""}${tc(fframeT(Math.abs(f)))} · f ${f}/${F.info.nb_frames - 1}` +
        (n.type === "clip" ? `   source ${tc(sf * F.info.fps_den / F.info.fps_num)} f ${sf}${inClip(f) ? "" : "  (outside this clip)"}` : "");
      if (fvid.paused) videoHost.redraw();
    }
    const t = vt();
    if (!fvid.paused && n.type === "clip") {     // a clip loops its own range; started outside, it stops at the far edge
      if (F.loop && t >= F.info.duration) seekFrame(0);
      else if (fcur() >= F.hi) fvid.pause();
    }
    if (!fvid.paused && (t > F.view[1] || t < F.view[0])) {
      const w = F.view[1] - F.view[0]; F.view = clampView(t - w * 0.1, w); tlRender();
    }
    $("playhead").style.left = `${xOf(t) - 1}px`;
    $("inout").textContent = F.drag ? F.drag.text : F.in != null ? `in f${F.in} (${tc(fframeT(F.in))}) - press O` : "";
  }
  requestAnimationFrame(ftick);
}
requestAnimationFrame(ftick);
// frame-exact clip loop: the rAF check above reads currentTime, which can let one frame of the next clip show
if (fvid.requestVideoFrameCallback) {
  const vfc = (_, m) => {
    const n = F.node;
    if (F.info && F.kind === "video" && n && n.type === "clip" && F.loop && !fvid.paused) {
      const f = Math.floor(m.mediaTime * F.info.fps + 1e-4) - F.off;
      if (f >= F.info.nb_frames - 1) seekFrame(0);
    }
    fvid.requestVideoFrameCallback(vfc);
  };
  fvid.requestVideoFrameCallback(vfc);
}

// ---------- timeline (child ranges coloured by tag) ----------
function tlBounds() { return [fframeT(F.lo), fframeT(F.hi + 1)]; }   // a clip: its whole parent
function clampView(a, w) {
  const [lo, hi] = tlBounds();
  w = Math.max(Math.min(w, hi - lo), 20 / F.info.fps);
  a = Math.max(lo, Math.min(a, hi - w)); return [a, a + w];
}
const tlW = () => $("tl").clientWidth;
const xOf = (t) => (t - F.view[0]) / (F.view[1] - F.view[0]) * tlW();
const tOf = (x) => F.view[0] + x / tlW() * (F.view[1] - F.view[0]);
function tlRender() {
  if (!F.info || F.kind !== "video") return;
  const W = tlW(), span = F.view[1] - F.view[0];
  const R = $("ruler"); R.innerHTML = "";
  const steps = [1 / F.info.fps, 0.1, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200];
  const st = steps.find((s) => s / span * W >= 70) || 1200;
  for (let t = Math.ceil(F.view[0] / st) * st; t <= F.view[1]; t += st) {
    const d = document.createElement("div"); d.className = "tick"; d.style.left = `${xOf(t)}px`;
    const u = Math.abs(t) < 1e-9 ? 0 : Math.abs(t);
    d.textContent = (t < -1e-9 ? "−" : "") + (st < 1 ? tc(u).slice(3) : tc(u).slice(0, 8)); R.appendChild(d);
  }
  const Ln = $("lanes"); Ln.innerHTML = ""; const ends = [];
  const me = F.node.type === "clip" ? F.node : null;
  if (me) {
    const dr = F.drag && F.drag.id === me.id ? F.drag : null;
    const a = dr ? dr.a - me.pf_in : 0, b = dr ? dr.b - me.pf_in : me.pf_out - me.pf_in;
    for (const [t0, t1] of [[F.view[0], 0], [F.info.duration, F.view[1]]]) if (t1 > t0) {
      const o = document.createElement("div"); o.className = "outside";
      Object.assign(o.style, { left: `${xOf(t0)}px`, width: `${xOf(t1) - xOf(t0)}px` });
      o.title = "outside this clip (plays from the source): drag the clip's in/out handle here to extend it"; Ln.appendChild(o);
    }
    const d = document.createElement("div"); d.className = "mk self" + (dr ? " drag" : "");
    const x0 = xOf(fframeT(a)), x1 = Math.max(xOf(fframeT(b + 1)), x0 + 3);
    Object.assign(d.style, { left: `${x0}px`, width: `${x1 - x0}px`, top: "0px" });
    d.textContent = "this clip - drag either end to change its in / out";
    d.title = `${nodeName(me)}  ${timesText(me)}`;
    for (const side of ["in", "out"]) {
      const h = document.createElement("div"); h.className = `hd ${side}`;
      h.title = `drag to move this clip's ${side} point (outward = longer, inward = shorter)`;
      h.onmousedown = (e) => trimDrag(e, me, side, true); d.appendChild(h);
    }
    Ln.appendChild(d); ends.push(W + 99);
  }
  const kids = kidsOf(F.node.id).sort((a, b) => (a.pf_in ?? a.pf) - (b.pf_in ?? b.pf));
  for (const k of kids) {
    const dr = F.drag && F.drag.id === k.id ? F.drag : null;
    const a = fframeT(dr ? dr.a : k.pf_in ?? k.pf), b = k.type === "clip" ? fframeT((dr ? dr.b : k.pf_out) + 1) : null;
    const x0 = xOf(a), x1 = b != null ? Math.max(xOf(b), x0 + 3) : x0 + 5;
    if (x1 < -10 || x0 > W + 10) continue;
    let lane = ends.findIndex((e) => e < x0 - 2); if (lane < 0) { lane = ends.length; ends.push(0); }
    ends[lane] = x1 + 4;
    const d = document.createElement("div");
    d.className = "mk" + (k.type === "point" ? " pt" : k.type === "shot" ? " shot" : "") + (S.sel.has(k.id) ? " sel" : "");
    d.style.background = k.tags && k.tags.length ? tagColor(k.tags[0]) : TYPE_C[k.type];
    Object.assign(d.style, { left: `${x0}px`, top: `${lane * 15}px` });
    if (b != null) d.style.width = `${x1 - x0}px`;
    d.title = `${nodeName(k)}  ${timesText(k)}\n${(k.tags || []).join(", ")}\n${k.note || ""}`;
    d.onmousedown = (e) => { e.stopPropagation(); if (!fvid.paused) fvid.pause(); seekFrame(k.pf_in ?? k.pf); selectOnly(k.id); renderAll(); };
    d.ondblclick = (e) => { e.stopPropagation(); openFocus(k); };
    if (k.type === "clip") for (const side of ["in", "out"]) {
      const h = document.createElement("div"); h.className = `hd ${side}`;
      h.title = `drag to move the ${side} point (extend or shorten)`;
      h.onmousedown = (e) => trimDrag(e, k, side); h.ondblclick = (e) => e.stopPropagation(); d.appendChild(h);
    }
    if (dr) d.classList.add("drag");
    Ln.appendChild(d);
  }
  $("tl").style.height = `${18 + Math.max(2, ends.length + 1) * 15}px`;
  const dz = $("draftzone");
  if (F.in != null) {
    const a = xOf(fframeT(F.in)), b = xOf(vt());
    Object.assign(dz.style, { display: "block", left: `${Math.min(a, b) - 1}px`, width: `${Math.abs(b - a)}px` });
  } else dz.style.display = "none";
  const [blo, bhi] = tlBounds();
  $("zlabel").textContent = span >= bhi - blo - 1e-3 ? "whole video" : `${span.toFixed(span < 10 ? 2 : 0)} s shown`;
}
function trimDrag(e, k, side, self) {
  e.stopPropagation(); e.preventDefault(); if (!fvid.paused) fvid.pause();
  if (!self) { selectOnly(k.id); renderAll(); }
  const rect = $("tl").getBoundingClientRect(), [lo, hi] = self ? tlBounds() : [0, F.info.duration];
  const off = self ? k.pf_in : 0;                       // parent frame = off + timeline frame
  const last = self ? off + Math.round(hi * F.info.fps) - 1 : F.info.nb_frames - 1, first = self ? off + Math.round(lo * F.info.fps) : 0;
  F.drag = { id: k.id, a: k.pf_in, b: k.pf_out, text: "" };
  const mv = (ev) => {
    const fr = off + Math.round(Math.max(lo, Math.min(hi, tOf(ev.clientX - rect.left))) * F.info.fps);
    if (side === "in") F.drag.a = Math.max(first, Math.min(F.drag.b - 1, fr));
    else F.drag.b = Math.min(last, Math.max(F.drag.a + 1, fr - 1));
    seekFrame((side === "in" ? F.drag.a : F.drag.b) - off);
    const n = F.drag.b - F.drag.a + 1, d = (side === "in" ? k.pf_in - F.drag.a : F.drag.b - k.pf_out);
    const sf = k.sf_in + (side === "in" ? F.drag.a : F.drag.b) - k.pf_in;
    F.drag.text = `${side} → source f${sf} · ${n} frames (${fframeT(n).toFixed(2)} s) · ${d >= 0 ? "+" : ""}${d} f ${d >= 0 ? "longer" : "shorter"}` +
      " - release to apply";
    tlRender();
  };
  const up = () => {
    removeEventListener("mousemove", mv); removeEventListener("mouseup", up);
    const { a, b } = F.drag; F.drag = null;
    if (!retrimClip(k, a, b)) tlRender();
  };
  addEventListener("mousemove", mv); addEventListener("mouseup", up); mv(e);
}
function tlZoom(f, at) {
  const span = F.view[1] - F.view[0], t = at ?? vt(), r = (t - F.view[0]) / span;
  const w = span * f; F.view = clampView(t - r * w, w); tlRender();
}
$("tl").addEventListener("wheel", (e) => { e.preventDefault(); if (!F.info) return;
  const rect = $("tl").getBoundingClientRect(); tlZoom(e.deltaY > 0 ? 1.25 : 0.8, tOf(e.clientX - rect.left)); }, { passive: false });
$("tl").addEventListener("mousedown", (e) => {
  if (!F.info) return;
  const rect = $("tl").getBoundingClientRect();
  const go = (ev) => seekFrame(fframeAt(tOf(ev.clientX - rect.left)));
  if (!fvid.paused) fvid.pause(); go(e);
  const mv = (ev) => { go(ev); if (F.in != null) tlRender(); };
  const up = () => { removeEventListener("mousemove", mv); removeEventListener("mouseup", up); };
  addEventListener("mousemove", mv); addEventListener("mouseup", up);
});
$("zin").onclick = () => tlZoom(0.5); $("zout").onclick = () => tlZoom(2);
$("zfit").onclick = () => { F.view = clipView(); tlRender(); };
$("fclose").onclick = closeFocus;
addEventListener("resize", () => { if (F.node) { tlRender(); D.host && D.host.redraw(); } });
const FACT = { back1s: () => fstep(-Math.round(F.info.fps)), back1f: () => fstep(-1), play: ftoggle,
  fwd1f: () => fstep(1), fwd1s: () => fstep(Math.round(F.info.fps)), in: () => keyIn(false), out: () => keyOut(false), point: setPoint, shot: screenshot };
document.querySelectorAll("[data-act]").forEach((b) => b.onclick = () => { if (F.info) FACT[b.dataset.act](); b.blur(); });

const DRAWKEY = { v: "move", p: "pen", g: "hl", a: "arrow", b: "box", e: "circle", t: "text", r: "ruler" };
function focusKey(e) {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (k === "Escape") { e.preventDefault(); closeFocus(); return true; }
  if ((k === "Delete" || k === "Backspace") && deleteShape()) { e.preventDefault(); return true; }
  if (DRAWKEY[k] && !$("drawtools").classList.contains("off") && !e.shiftKey) {
    e.preventDefault(); setDrawTool(D.tool === DRAWKEY[k] ? null : DRAWKEY[k]); return true;
  }
  if (/^[1-9]$/.test(e.key)) { e.preventDefault(); const n = panelNode(); if (n) toggleTag(n, PRESETS[+e.key - 1][0]); return true; }
  if (F.kind !== "video" || !F.info) return false;
  const fps = Math.round(F.info.fps);
  const fn = { " ": ftoggle, ArrowLeft: () => fstep(e.shiftKey ? -fps : -1), ArrowRight: () => fstep(e.shiftKey ? fps : 1),
    i: () => keyIn(e.shiftKey), o: () => keyOut(e.shiftKey), m: setPoint, s: screenshot, Enter: commitEnter, "[": () => trimKey("in"), "]": () => trimKey("out") }[k];
  if (fn) { e.preventDefault(); fn(); return true; }
  return false;
}
