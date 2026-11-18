"use strict";
// draw.js - vector drawings stored in frame-normalised 0-1 coordinates.
// Shape: {k: pen|hl|arrow|box|circle|text|ruler, p: [[x,y],...], c: colour, w: stroke (fraction of H),
//         text?, s?: text size (fraction of H)}. SVG overlay for editing; canvas for the flattened png.
const DRAW_COLORS = ["#ff3b30", "#ffd60a", "#30d158", "#0a84ff", "#bf5af2", "#ffffff", "#111111"];
const DSTYLE = { pen: 0.004, hl: 0.03, arrow: 0.005, box: 0.004, circle: 0.004, ruler: 0.003 };
const HL_ALPHA = 0.38, TEXT_SIZE = 0.045;
const D = { tool: null, color: DRAW_COLORS[0], sel: -1, cur: null, host: null };

function rulerInfo(s, W, H) {
  const [[x0, y0], [x1, y1]] = s.p, dx = (x1 - x0) * W, dy = (y1 - y0) * H, L = Math.hypot(dx, dy);
  const pctH = L / H * 100, pctW = L / W * 100;
  return { L, pctH, pctW, label: Math.abs(dy) >= Math.abs(dx) ? `${pctH.toFixed(1)}% H` : `${pctW.toFixed(1)}% W` };
}
function shapeLabel(s, W, H) {
  const f = (v) => v.toFixed(3), p = s.p;
  if (s.k === "ruler") { const r = rulerInfo(s, W, H);
    return `ruler ${r.label} (${r.L.toFixed(0)}px = ${r.pctH.toFixed(1)}% H / ${r.pctW.toFixed(1)}% W)`; }
  if (s.k === "arrow") return `arrow ${f(p[0][0])},${f(p[0][1])} → ${f(p[1][0])},${f(p[1][1])}`;
  if (s.k === "box" || s.k === "circle") {
    const x = Math.min(p[0][0], p[1][0]), y = Math.min(p[0][1], p[1][1]);
    const w = Math.abs(p[1][0] - p[0][0]), h = Math.abs(p[1][1] - p[0][1]);
    return `${s.k} at x,y,w,h ${f(x)},${f(y)},${f(w)},${f(h)} = ${Math.round(x * W)},${Math.round(y * H)} ${Math.round(w * W)}x${Math.round(h * H)}px`;
  }
  if (s.k === "text") return `text "${s.text}" at ${f(p[0][0])},${f(p[0][1])}`;
  return `${s.k === "hl" ? "highlighter" : "pen"} stroke (${p.length} pts)`;
}
function arrowHead(x0, y0, x1, y1, sw, H) {
  const a = Math.atan2(y1 - y0, x1 - x0), L = Math.max(sw * 4.5, H * 0.022);
  const p = (d) => [x1 - L * Math.cos(a + d), y1 - L * Math.sin(a + d)];
  return [[x1, y1], p(0.45), p(-0.45)];
}
function rulerTicks(x0, y0, x1, y1, H) {
  const a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2, t = H * 0.012, c = Math.cos(a) * t, s = Math.sin(a) * t;
  return [[x0 - c, y0 - s, x0 + c, y0 + s], [x1 - c, y1 - s, x1 + c, y1 + s]];
}
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function shapeSVG(s, W, H, i, sel) {
  const P = s.p.map(([x, y]) => [x * W, y * H]), sw = (s.w || DSTYLE[s.k] || 0.004) * H, c = s.c || "#ff3b30";
  const st = `stroke="${c}" stroke-width="${sw.toFixed(2)}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const hit = (inner) => inner.replace(/stroke="[^"]*" stroke-width="[^"]*"/, `stroke="transparent" stroke-width="${Math.max(sw, H * 0.02)}"`);
  let g = "";
  if (s.k === "pen" || s.k === "hl") {
    const pts = P.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ");
    const el = `<polyline points="${pts}" ${st}${s.k === "hl" ? ` stroke-opacity="${HL_ALPHA}"` : ""}/>`;
    g = el + hit(el);
  } else if (s.k === "arrow" && P.length > 1) {
    const [[x0, y0], [x1, y1]] = P, h = arrowHead(x0, y0, x1, y1, sw, H);
    const el = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" ${st}/>`;
    g = el + `<polygon points="${h.map((q) => q.join(",")).join(" ")}" fill="${c}"/>` + hit(el);
  } else if (s.k === "box" && P.length > 1) {
    const [[x0, y0], [x1, y1]] = P;
    const el = `<rect x="${Math.min(x0, x1)}" y="${Math.min(y0, y1)}" width="${Math.abs(x1 - x0)}" height="${Math.abs(y1 - y0)}" ${st}/>`;
    g = el + hit(el);
  } else if (s.k === "circle" && P.length > 1) {
    const [[x0, y0], [x1, y1]] = P;
    const el = `<ellipse cx="${(x0 + x1) / 2}" cy="${(y0 + y1) / 2}" rx="${Math.abs(x1 - x0) / 2}" ry="${Math.abs(y1 - y0) / 2}" ${st}/>`;
    g = el + hit(el);
  } else if (s.k === "text") {
    const fs = (s.s || TEXT_SIZE) * H;
    g = `<text x="${P[0][0]}" y="${P[0][1]}" font-size="${fs}" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="${c}" paint-order="stroke" stroke="#000" stroke-width="${fs * 0.12}">${esc(s.text || "")}</text>`;
  } else if (s.k === "ruler" && P.length > 1) {
    const [[x0, y0], [x1, y1]] = P, r = rulerInfo(s, W, H), fs = H * 0.028;
    const el = `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" ${st}/>`;
    g = el + rulerTicks(x0, y0, x1, y1, H).map(([a, b, c2, d]) =>
      `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d}" ${st}/>`).join("") + hit(el) +
      `<text class="rl" x="${(x0 + x1) / 2 + fs * 0.4}" y="${(y0 + y1) / 2 - fs * 0.4}" font-size="${fs}" font-weight="700" font-family="system-ui,Segoe UI,sans-serif" fill="${c}" paint-order="stroke" stroke="#000" stroke-width="${fs * 0.18}">${r.label}</text>`;
  }
  return `<g class="sh${sel ? " shsel" : ""}" data-i="${i}">${g}</g>`;
}
function renderOverlay(svg, shapes, W, H, sel, extra) {
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.innerHTML = (shapes || []).map((s, i) => shapeSVG(s, W, H, i, i === sel)).join("") +
    (extra ? shapeSVG(extra, W, H, -1, false) : "");
}

function drawShapesCanvas(ctx, shapes, W, H) {
  for (const s of shapes) {
    const P = s.p.map(([x, y]) => [x * W, y * H]), sw = (s.w || DSTYLE[s.k] || 0.004) * H, c = s.c || "#ff3b30";
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = sw; ctx.lineCap = "round"; ctx.lineJoin = "round";
    const line = (a, b, x, y) => { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(x, y); ctx.stroke(); };
    if (s.k === "pen" || s.k === "hl") {
      if (s.k === "hl") ctx.globalAlpha = HL_ALPHA;
      ctx.beginPath(); P.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    } else if (s.k === "arrow" && P.length > 1) {
      const [[x0, y0], [x1, y1]] = P; line(x0, y0, x1, y1);
      const h = arrowHead(x0, y0, x1, y1, sw, H);
      ctx.beginPath(); h.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill();
    } else if (s.k === "box" && P.length > 1) {
      const [[x0, y0], [x1, y1]] = P; ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    } else if (s.k === "circle" && P.length > 1) {
      const [[x0, y0], [x1, y1]] = P; ctx.beginPath();
      ctx.ellipse((x0 + x1) / 2, (y0 + y1) / 2, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (s.k === "text" || s.k === "ruler") {
      let x, y, txt, fs;
      if (s.k === "text") { fs = (s.s || TEXT_SIZE) * H; [x, y] = P[0]; txt = s.text || ""; }
      else {
        const [[x0, y0], [x1, y1]] = P; line(x0, y0, x1, y1);
        rulerTicks(x0, y0, x1, y1, H).forEach(([a, b, c2, d]) => line(a, b, c2, d));
        fs = H * 0.028; x = (x0 + x1) / 2 + fs * 0.4; y = (y0 + y1) / 2 - fs * 0.4; txt = rulerInfo(s, W, H).label;
      }
      ctx.font = `700 ${fs}px system-ui, Segoe UI, sans-serif`; ctx.lineWidth = fs * (s.k === "text" ? 0.12 : 0.18);
      ctx.strokeStyle = "#000"; ctx.strokeText(txt, x, y); ctx.fillText(txt, x, y);
    }
    ctx.restore();
  }
}

// Fit the overlay exactly over the displayed picture (object-fit: contain).
function layoutOverlay(svg, box, mw, mh) {
  const bw = box.clientWidth, bh = box.clientHeight, s = Math.min(bw / mw, bh / mh);
  const w = mw * s, h = mh * s;
  Object.assign(svg.style, { left: `${(bw - w) / 2}px`, top: `${(bh - h) / 2}px`, width: `${w}px`, height: `${h}px` });
}

function setDrawTool(t) {
  D.tool = t; D.sel = -1;
  document.querySelectorAll("[data-draw]").forEach((b) => b.classList.toggle("on", b.dataset.draw === t));
  const ov = document.getElementById("overlay");
  ov.classList.toggle("drawing", !!t && t !== "move"); ov.classList.toggle("picking", t === "move");
  if (D.host) D.host.redraw();
}
function initSwatches() {
  const box = document.getElementById("swatches");
  for (const c of DRAW_COLORS) {
    const s = document.createElement("span"); s.style.background = c; s.title = c;
    s.onclick = () => { D.color = c; box.querySelectorAll("span").forEach((x) => x.classList.toggle("on", x === s));
      const sh = D.host && D.host.shapes(); if (sh && D.sel >= 0 && sh[D.sel]) D.host.edit((a) => { a[D.sel].c = c; }); };
    if (c === D.color) s.classList.add("on");
    box.appendChild(s);
  }
  document.querySelectorAll("[data-draw]").forEach((b) => b.onclick = () => setDrawTool(D.tool === b.dataset.draw ? null : b.dataset.draw));
}

// host = {size() -> [W,H], shapes() -> array|null, edit(fn(shapes)), redraw(), ready() -> bool}
function overlayDown(e) {
  const H0 = D.host; if (!H0 || !H0.ready() || e.button !== 0) return;
  const ov = e.currentTarget, r = ov.getBoundingClientRect();
  const pt = (ev) => [+Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)).toFixed(5),
    +Math.max(0, Math.min(1, (ev.clientY - r.top) / r.height)).toFixed(5)];
  e.preventDefault(); e.stopPropagation();
  const p0 = pt(e);
  if (!D.tool || D.tool === "move") {
    const g = e.target.closest && e.target.closest(".sh");
    D.sel = g ? +g.dataset.i : -1; H0.redraw(); if (window.renderPanel) renderPanel();
    if (D.sel < 0) return;
    let moved = false, last = p0;
    const mv = (ev) => { const q = pt(ev), dx = q[0] - last[0], dy = q[1] - last[1]; last = q;
      H0.edit((a) => { a[D.sel].p = a[D.sel].p.map(([x, y]) => [+(x + dx).toFixed(5), +(y + dy).toFixed(5)]); }, !moved);
      moved = true; };
    const up = () => { removeEventListener("pointermove", mv); removeEventListener("pointerup", up); if (moved) H0.done(); };
    addEventListener("pointermove", mv); addEventListener("pointerup", up);
    return;
  }
  if (D.tool === "text") { openTextInput(ov, e, p0); return; }
  const [W, H] = H0.size();
  D.cur = { k: D.tool, p: [p0, p0], c: D.color, w: DSTYLE[D.tool] };
  if (D.tool === "pen" || D.tool === "hl") D.cur.p = [p0];
  const mv = (ev) => {
    let q = pt(ev);
    if (D.cur.k === "pen" || D.cur.k === "hl") {
      const l = D.cur.p[D.cur.p.length - 1]; if (Math.hypot((q[0] - l[0]) * W, (q[1] - l[1]) * H) >= 2) D.cur.p.push(q);
    } else {
      if (ev.shiftKey && (D.cur.k === "ruler" || D.cur.k === "arrow")) {   // shift = lock to an axis
        Math.abs((q[0] - p0[0]) * W) >= Math.abs((q[1] - p0[1]) * H) ? (q = [q[0], p0[1]]) : (q = [p0[0], q[1]]);
      }
      D.cur.p[1] = q;
    }
    H0.redraw();
  };
  const up = () => {
    removeEventListener("pointermove", mv); removeEventListener("pointerup", up);
    const s = D.cur; D.cur = null;
    const big = s.p.length > 1 && Math.hypot((s.p[s.p.length - 1][0] - s.p[0][0]) * W, (s.p[s.p.length - 1][1] - s.p[0][1]) * H) >= 4;
    if (big || ((s.k === "pen" || s.k === "hl") && s.p.length > 2)) H0.add(s); else H0.redraw();
  };
  addEventListener("pointermove", mv); addEventListener("pointerup", up);
}
function openTextInput(ov, e, p0) {
  const stage = ov.parentElement, sr = stage.getBoundingClientRect();
  const inp = document.createElement("input"); inp.id = "textin"; inp.placeholder = "label, Enter";
  Object.assign(inp.style, { left: `${e.clientX - sr.left}px`, top: `${e.clientY - sr.top - 14}px`, color: D.color });
  stage.appendChild(inp); setTimeout(() => inp.focus(), 0);
  let done = false;
  const fin = (ok) => { if (done) return; done = true; const t = inp.value.trim(); inp.remove();
    if (ok && t) D.host.add({ k: "text", p: [p0], c: D.color, s: TEXT_SIZE, text: t.slice(0, 200) }); };
  inp.onkeydown = (ev) => { ev.stopPropagation();
    if (ev.key === "Enter") { ev.preventDefault(); fin(true); } else if (ev.key === "Escape") { ev.preventDefault(); fin(false); } };
  inp.onblur = () => fin(true);
}

async function loadImg(src) {
  return new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error("image load failed")); i.src = src; });
}
// Flattened png beside the jpg: the frame + every shape, at full resolution.
async function flattenShot(n) {
  if (!n.image || n.status === "pending") return;
  const img = await loadImg(`/img?p=${encodeURIComponent(n.image)}&_=${n.ver || 0}`);
  const W = img.naturalWidth, H = img.naturalHeight, c = document.createElement("canvas");
  c.width = W; c.height = H; const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0);
  drawShapesCanvas(ctx, n.shapes || [], W, H);
  const r = await api("/api/flat", { jpg: n.image, png: c.toDataURL("image/png") });
  n.flat = r.path; n.fver = Date.now();
  return r;
}
