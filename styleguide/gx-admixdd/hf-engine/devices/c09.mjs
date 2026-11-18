// Case 9 devices (ports of C09Devices.tsx): Vid9, Opener9, Ring9, BlobHit9, Page9, Map9. Credit = c01b.mjs, Stakes = c05.mjs (use by name).
// Contract: see devices/shared.mjs header. Whole-shot motion kind (Remotion Mv9 context = MV[shotIndex % 8]) arrives as p.mv, set by cases/case09.mjs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607'; // tokens C.black
const CYAN = '#45FDFC', CYAN_GLOW = 'rgba(69,253,252,0.60)';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = process.env.GX_ENGINE_PUBLIC ? path.join(process.env.GX_ENGINE_PUBLIC, 'case09') : path.resolve(HERE, '..', 'media', 'case09');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());

/** Inner (Vid9): freeze -> extracted still; else clip, held (still) when the window runs past the media (OffthreadVideo shows its last frame). */
const innerNode = (ctx, { src, trim = 0, speed = 1, freeze }) => {
  if (freeze !== undefined) return { raw: `<img src="${ctx.still(src, Math.round(freeze * 60))}" style="position:absolute;inset:0;width:100%;height:100%" alt="">` };
  const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60;
  const hold = ctx.win[1] > ctx.win[0] && end > mediaDur(src) + 1e-6 ? mediaDur(src) - 1 / 60 : undefined;
  return { d: 'Clip', p: { src, trim, speed, hold } };
};

/** Vid9: graded master, muted. raw = static scale(base); else Move (kind = mv, origin -> push, tilt deg <= 3) + scale(base); desat = insert look; pb = black-bar pillarbox. */
export const Vid9 = {
  name: 'Vid9',
  html: (p, ctx) => {
    const { base = 1.0, rate = 0.012, origin, desat, vig = 0.45, pb, raw, deg = 3, mv = 'push' } = p;
    const kind = raw ? 'none' : origin && mv !== 'pull' ? 'push' : mv;
    const flt = desat ? 'contrast(1.06) saturate(0.22) brightness(0.94)' : 'contrast(1.05)';
    const inner = `<div class="${AF}" style="transform:scale(${base});transform-origin:${origin ?? '50% 50%'};filter:${flt}">${ctx.node(innerNode(ctx, p))}</div>`;
    const pic = kind === 'none' ? inner : ctx.node({ d: 'Move', p: { kind, rate, deg: Math.min(3, deg), origin }, k: [{ raw: inner }] });
    const body = pb
      ? `<div style="position:absolute;top:0;bottom:0;left:${(100 - pb) / 2}%;width:${pb}%;overflow:hidden"><div style="position:absolute;top:0;height:100%;width:${10000 / pb}%;left:${(-(100 - pb) / 2 * 100) / pb}%">${pic}</div></div>`
      : pic;
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${body}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
};

/** SW opener: 2-line VT323 wipe (16 f, cyan leading edge) over a Vid9 bg, 0.7 s fade out. Local t = shot t. */
export const Opener9 = {
  name: 'Opener9',
  html: (p, ctx) => {
    const line = (txt, size) => `<div style="position:relative;align-self:center;padding:4px 36px 0;background-color:rgba(0,0,0,0.6);clip-path:inset(0 100% 0 0)"><div style="font-family:'VT323';font-size:${size}px;line-height:1;color:#F4F7F7;letter-spacing:0.04em;text-shadow:0 0 10px rgba(186,254,255,0.35);white-space:nowrap">${ctx.esc(txt)}</div><div style="position:absolute;top:0;bottom:0;left:0;width:10px;margin-left:-10px;background-color:${CYAN};box-shadow:0 0 16px ${CYAN_GLOW};display:none"></div></div>`;
    return `<div class="${AF}">${ctx.node({ d: 'Vid9', p: { ...p.bg, mv: p.mv } })}<div class="${AF}" style="background-color:rgba(0,0,0,0.18)"></div><div ${ctx.dev('Opener9', { at: p.at, out: p.out })} style="position:absolute;left:0;right:0;top:560px;display:flex;flex-direction:column;gap:18px">${line(p.l1, 70)}${line(p.l2, 112)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60;
    el.style.opacity = G.ease(t, [p.out - 0.7, p.out], [1, 0]);
    for (var i = 0; i < 2; i++) {
      var a = p.at + (i ? 0.45 : 0), pp = G.ease(t, [a, a + 16 / 60], [0, 100]), ln = el.children[i], edge = ln.children[1];
      ln.style.clipPath = 'inset(0 ' + (100 - pp) + '% 0 0)';
      edge.style.display = pp > 0 && pp < 100 ? '' : 'none';
      edge.style.left = pp + '%';
    }
  },
};

/** ER: cyan tracked ring on a Vid9 (push). path [t, x %, y %, r px] Catmull-Rom; 6 f draw, 0.15 s fade at off. */
export const Ring9 = {
  name: 'Ring9',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Ring9', { path: p.path, on: p.on, off: p.off })}>${ctx.node({ d: 'Vid9', p: { ...p.v, mv: 'push' } })}<svg width="1920" height="1080" style="position:absolute;inset:0;display:none"><circle fill="none" stroke="${CYAN}" stroke-width="5" style="filter:drop-shadow(0 0 8px ${CYAN_GLOW})"></circle></svg></div>`,
  render: function (el, f, p, G) {
    var t = f / 60, path = p.path, n = path.length - 1, svg = el.children[1];
    if (t < p.on || t > p.off) { svg.style.display = 'none'; return; }
    var k = function (i) {
      if (t <= path[0][0]) return path[0][i];
      if (t >= path[n][0]) return path[n][i];
      var j = 0;
      while (j < n - 1 && t > path[j + 1][0]) j++;
      var u = (t - path[j][0]) / (path[j + 1][0] - path[j][0]);
      var p0 = path[Math.max(0, j - 1)][i], p1 = path[j][i], p2 = path[j + 1][i], p3 = path[Math.min(n, j + 2)][i];
      return 0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
    };
    var draw = G.ease(t, [p.on, p.on + 6 / 60], [0, 1]), o = G.ease(t, [p.off - 0.15, p.off], [1, 0]);
    var r = k(3), C2 = 2 * Math.PI * r, cx = (k(1) / 100) * 1920, cy = (k(2) / 100) * 1080, c = svg.children[0];
    svg.style.display = 'block'; svg.style.opacity = o;
    c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r);
    c.setAttribute('stroke-dasharray', C2 * draw + ' ' + C2);
    c.setAttribute('transform', 'rotate(-90 ' + cx + ' ' + cy + ')');
  },
};

/** DM-b blob hit: in the TSX the blob layer is an empty fragment (only an unused threshold filter), so it renders just Vid9 (push). */
export const BlobHit9 = {
  name: 'BlobHit9',
  html: (p, ctx) => `<div class="${AF}">${ctx.node({ d: 'Vid9', p: { ...p.v, mv: 'push' } })}</div>`,
};

/** Page9: page png under camera cam [t, cx, cy, zoom] (E.dive) + eased push/pull (0.005/s) or <=3 deg tilt from mv; yellow multiply marks (wipe 0.45 s); teal multiply; credit br. */
export const Page9 = {
  name: 'Page9',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit, off = 0, mv = 'push' } = p;
    const mk = marks.map((m) => `<div style="position:absolute;left:${m.b[0] - 6}px;top:${m.b[1] - 3}px;width:0;height:${m.b[3] - m.b[1] + 6}px;display:none;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px"></div>`).join('');
    const pg = `<div style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><img src="assets/media/page_${src}_full.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    const P = { h, cam, off, mv, marks: marks.map((m) => ({ b: m.b, at: m.at, d: m.d })) };
    return `<div class="${AF}" ${ctx.dev('Page9', P)} style="background-color:#0b0d0e;overflow:hidden"><div class="${AF}" style="transform-origin:50% 50%">${pg}</div><div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var tl = f / 60, t = tl + p.off, cam = p.cam, h = p.h, dur = Math.max(0.1, S.dur), q = tl / dur, PR = 0.005;
    var wrap = el.children[0], pg = wrap.children[0], kind = p.mv, tilt = kind.indexOf('tilt') === 0;
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (kind === 'pull' ? 1 + PR * dur * (1 - G.drift(q)) : kind === 'push' ? 1 + PR * dur * G.drift(q) : 1);
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    wrap.style.transform = tilt ? G.moveCss(kind, q, dur, { rate: PR, deg: 3 }) : '';
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1], pp = G.ease(t, [m.at, m.at + (m.d == null ? 0.45 : m.d)], [0, 1]);
      if (pp <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.width = (m.b[2] - m.b[0] + 12) * pp + 'px';
    }
  },
};

/** AA / Map9: satellite plate, eased push (z0 -> z1, drift), white dot + typed callout per place; credit br. */
export const Map9 = {
  name: 'Map9',
  html: (p, ctx) => {
    const { plate, z0, z1, origin, calls } = p;
    const [ox, oy] = origin;
    const cl = calls.map((c) => {
      const left = c.side === 'left';
      return `<div style="position:absolute;display:none"><div style="position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:9px;background-color:#F4F7F7;box-shadow:0 0 0 3px rgba(0,0,0,0.55), 0 0 14px rgba(255,255,255,0.6)"></div><div style="position:absolute;top:-2px;height:3px;width:0;background-color:#F4F7F7;box-shadow:0 0 4px #000"></div><div style="position:absolute;top:-34px;white-space:nowrap;${left ? 'right:100px' : 'left:100px'};font-family:'Share Tech Mono';color:#F4F7F7;text-shadow:0 0 4px #000, 0 2px 8px rgba(0,0,0,0.95)"><div style="font-size:58px;letter-spacing:0.05em;line-height:1.05"></div>${c.sub ? `<div style="font-size:34px;opacity:0.85;text-align:${left ? 'right' : 'left'};display:none">${ctx.esc(c.sub)}</div>` : ''}</div></div>`;
    }).join('');
    return `<div class="${AF}" ${ctx.dev('Map9', { z0, z1, ox, oy, calls: calls.map((c) => ({ x: c.x, y: c.y, at: c.at, text: c.text, left: c.side === 'left' })) })} style="background-color:${BLACK};overflow:hidden"><div class="${AF}" style="transform-origin:${ox}px ${oy}px;filter:brightness(0.82) contrast(1.08) saturate(0.85)"><img src="assets/media/v6_map_${plate}.png" style="width:1920px;height:1080px" alt=""></div>${Vignette.html({ k: 0.5 })}<div class="${AF}" style="pointer-events:none">${cl}</div>${ctx.node({ d: 'Credit', p: { text: 'Map: EOX Sentinel-2 cloudless (CC BY 4.0)', corner: 'br' } })}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = Math.max(0.1, S.dur);
    var z = p.z0 + (p.z1 - p.z0) * Math.min(1, dur / 6) * G.drift(t / dur);
    el.children[0].style.transform = 'scale(' + z + ')';
    var cw = el.children[2];
    for (var i = 0; i < p.calls.length; i++) {
      var c = p.calls[i], w = cw.children[i];
      if (t < c.at) { w.style.display = 'none'; continue; }
      var x = p.ox + (c.x - p.ox) * z, y = p.oy + (c.y - p.oy) * z, pr = G.ease(t, [c.at, c.at + 0.25], [0, 1]);
      var n = Math.floor(G.interpolate(t, [c.at + 0.1, c.at + 0.1 + c.text.length / 22], [0, c.text.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
      w.style.display = 'block'; w.style.left = x + 'px'; w.style.top = y + 'px';
      w.children[0].style.transform = 'scale(' + pr + ')';
      w.children[1].style.width = 70 * pr + 'px';
      w.children[1].style.left = (c.left ? -16 - 70 * pr : 16) + 'px';
      var lab = w.children[2];
      lab.children[0].textContent = c.text.slice(0, n);
      if (lab.children[1]) lab.children[1].style.display = n >= c.text.length ? '' : 'none';
    }
  },
};

export default [Vid9, Opener9, Ring9, BlobHit9, Page9, Map9];
