// Case 02 devices (ports of C2Devices.tsx): Vid2, Ins2, FreezeSpot, Inset2, Duo2, Title2 (shard title), Page2 (PW orange-box page), Map2 (AA map).
// Credit and TypedTag are the C1 devices (devices/c01b.mjs, listed in the case's `devices`). Contract: see devices/shared.mjs header.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607'; // tokens C.black
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(HERE, '..', 'media', 'case2'); // vid() = staticFile('case2/<src>.mp4')
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
const ARCH = "font-family:'Archivo'";

/** Vid2: graded clip; raw = linear base + rate*t (Move none), else eased Move (rate, deg 2.5); sky gradient; vignette. */
export const Vid2 = {
  name: 'Vid2',
  html: (p, ctx) => {
    const { src = 'tkr', trim = 0, speed = 1, base = 1.0, rate = 0.012, origin, vig = 0.4, filter, sky = 0.32, raw = false, mv = 'push', deg = 2.5 } = p;
    const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60, md = ctx.win[1] > ctx.win[0] ? mediaDur(src) : Infinity;
    const hold = end > md + 1e-6 ? md - 1 / 60 : undefined; // OffthreadVideo past the end shows the last frame
    const inner = `<div class="${AF}" ${raw ? ctx.dev('Vid2', { base, rate }) : ''} style="transform:scale(${base});transform-origin:${origin ?? '50% 50%'};filter:${filter ?? 'contrast(1.06) saturate(1.05)'}">${ctx.node({ d: 'Clip', p: { src, trim, speed, hold } })}</div>`;
    const mvN = { d: 'Move', p: { kind: raw ? 'none' : mv, rate, deg, origin }, k: [{ raw: inner }] };
    const skyD = sky > 0 ? `<div class="${AF}" style="background:linear-gradient(180deg, rgba(4,8,10,${sky}) 0%, rgba(4,8,10,${sky * 0.45}) 22%, rgba(0,0,0,0) 42%)"></div>` : '';
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node(mvN)}${skyD}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p) { el.style.transform = 'scale(' + (p.base + p.rate * (f / 60)) + ')'; },
};

/** Ins2: footage insert between pages: slowed, desaturated, slow push. */
export const Ins2 = {
  name: 'Ins2',
  html: (p, ctx) => {
    const { trim, speed = 0.5, base = 1.3, origin = '50% 60%', mv = 'push' } = p;
    return ctx.node({ d: 'Vid2', p: { trim, speed, base, rate: 0.025, origin, mv, filter: 'contrast(1.08) saturate(0.35) brightness(0.96)' } });
  },
};

/** FreezeSpot: frame `at` of tkr held (still), Move, radial dim around the subject (eases in 0.2-1.2 s), top haze, vignette. */
export const FreezeSpot = {
  name: 'FreezeSpot',
  html: (p, ctx) => {
    const { at, base = 1.1, rate = 0.03, origin = '50% 60%', cx = '50%', cy = '60%', w = 46, h = 60, dim = 0.55, desat, mv = 'push' } = p;
    const img = ctx.still('tkr', Math.round(at * 60));
    const inner = `<div class="${AF}" style="transform:scale(${base});transform-origin:${origin};filter:${desat ? 'contrast(1.08) saturate(0.35)' : 'contrast(1.06)'}"><img src="${img}" style="width:100%;height:100%;display:block" alt=""></div>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node({ d: 'Move', p: { kind: mv, rate, deg: 2.5, origin }, k: [{ raw: inner }] })}<div class="${AF}" ${ctx.dev('FreezeSpot', { w, h, cx, cy, dim })}></div><div class="${AF}" style="background:linear-gradient(180deg, rgba(4,8,10,0.3) 0%, rgba(0,0,0,0) 40%)"></div>${Vignette.html({ k: 0.4 })}</div>`;
  },
  render: function (el, f, p, G) {
    var k = G.ease(f / 60, [0.2, 1.2], [0, 1]);
    el.style.background = 'radial-gradient(ellipse ' + p.w / 2 + '% ' + p.h / 2 + '% at ' + p.cx + ' ' + p.cy + ', rgba(0,0,0,0) 0%, rgba(0,0,0,0) 50%, rgba(0,0,0,' + (p.dim * k).toFixed(3) + ') 100%)';
  },
};

/** IN: 55 % inset of a held (speed 0.15) frame over its own blurred, darkened copy; perspective tilt + push. */
export const Inset2 = {
  name: 'Inset2',
  html: (p, ctx) => {
    const { at, speed = 0.15 } = p;
    const bg = `<div class="${AF}" style="transform:scale(1.12);filter:blur(26px) brightness(0.5) saturate(0.8)">${ctx.node({ d: 'Clip', p: { src: 'tkr', trim: at, speed } })}</div>`;
    const box = `<div style="position:absolute;left:22.5%;top:22.5%;width:55%;height:55%;box-shadow:0 18px 60px rgba(0,0,0,0.75);outline:3px solid rgba(236,242,242,0.85);overflow:hidden"><div class="${AF}" style="transform:scale(1.25);transform-origin:45% 70%">${ctx.node({ d: 'Clip', p: { src: 'tkr', trim: at, speed } })}</div></div>`;
    return `<div class="${AF}" ${ctx.dev('Inset2', {})} style="overflow:hidden;background-color:#000">${ctx.node({ d: 'Move', p: { kind: 'pull', rate: 0.012 }, k: [{ raw: bg }] })}${box}${Vignette.html({ k: 0.35 })}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = Math.max(0.1, S.dur), q = G.drift(t / dur);
    var pop = G.ease(t, [0, 0.4], [0.94, 1]);
    el.children[1].style.transform = 'perspective(1800px) rotateY(' + ((2 * q - 1) * 2.5).toFixed(4) + 'deg) scale(' + (pop * (1 + 0.012 * dur * q)).toFixed(5) + ')';
  },
};

/** DU: cyan duotone replay (hard-in, eased R/B split over 8 f, push-in). */
export const Duo2 = {
  name: 'Duo2',
  html: (p, ctx) => {
    const { trim, speed = 0.5, origin = '52% 68%', base = 1.12 } = p;
    const defs = `<svg width="0" height="0" style="position:absolute"><filter id="c2duo" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0.30 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.01 0.04 0.20 0.62 0.88"/><feFuncG type="table" tableValues="0.03 0.16 0.62 0.96 1"/><feFuncB type="table" tableValues="0.06 0.24 0.68 0.97 1"/></feComponentTransfer></filter></svg>`;
    const inner = `<div class="${AF} duo" style="transform:scale(${base});transform-origin:${origin};filter:url(#c2duo) contrast(1.12)">${ctx.node({ d: 'Clip', p: { src: 'tkr', trim, speed } })}</div>`;
    return `<div class="${AF}" ${ctx.dev('Duo2', {})} style="overflow:hidden;background-color:${BLACK}">${defs}${ctx.node({ d: 'Move', p: { kind: 'push', rate: 0.03, origin }, k: [{ raw: inner }] })}${Vignette.html({ k: 0.45 })}</div>`;
  },
  render: function (el, f, p, G) {
    var sp = G.ease(f, [0, 8], [12, 0]);
    var d = el._duo || (el._duo = el.querySelector('.duo'));
    var split = sp > 0.05 ? ' drop-shadow(' + sp.toFixed(2) + 'px 0 0 rgba(255,40,60,0.75)) drop-shadow(' + (-sp).toFixed(2) + 'px 0 0 rgba(69,253,252,0.75))' : '';
    d.style.filter = 'url(#c2duo) contrast(1.12)' + split;
  },
};

// ---- P3: two-tone shard title (4 shards per line) over a blurred 20 % ghost of the collapse
const SHARDS = [[0, 34], [26, 61], [53, 82], [74, 100]];
export const Title2 = {
  name: 'Title2',
  html: (p, ctx) => {
    const { l1, l2a, l2b, at1, at2 } = p;
    const WHITE = '#F2F6FF', CY = '#6CFCFC';
    const line = (parts) => `<div style="${ARCH};font-weight:800;font-stretch:125%;font-size:59px;letter-spacing:0.04em;line-height:1;white-space:pre;text-shadow:0 0 18px rgba(0,0,0,0.85), 0 3px 8px rgba(0,0,0,0.9)">${parts.map(([t, c]) => `<span style="color:${c}">${ctx.esc(t)}</span>`).join('')}</div>`;
    const sk = 8;
    const shard = (parts) => `<div style="position:relative;display:none"><div style="visibility:hidden">${line(parts)}</div>${SHARDS.map(([a, b]) => `<div style="position:absolute;inset:0;clip-path:polygon(${a + sk}% 0%, ${b + sk}% 0%, ${b - sk}% 100%, ${a - sk}% 100%)">${line(parts)}</div>`).join('')}</div>`;
    const ghost = `<div class="${AF}" style="opacity:0.2;filter:blur(10px) brightness(0.8)">${ctx.node({ d: 'Vid2', p: { trim: 7.0, speed: 0.35, base: 1.15, rate: 0.02, origin: '50% 68%', vig: 0 } })}</div>`;
    const col = `<div class="${AF}" ${ctx.dev('Title2', { at: [at1, at2], seed: ['c2t1', 'c2t2'], N: SHARDS.length })} style="align-items:center;top:34%;gap:22px;transform-origin:50% 12%">${shard([[l1, WHITE]])}${shard([[l2a, WHITE], [l2b, CY]])}</div>`;
    return `<div class="${AF}" style="background-color:${BLACK}">${ghost}${col}</div>`;
  },
  render: function (el, f, p, G, S) {
    var q = G.drift(f / S.len);
    el.style.transform = 'scale(' + (1 + 0.035 * q).toFixed(5) + ')';
    for (var l = 0; l < 2; l++) {
      var w = el.children[l], g = f - Math.round(p.at[l] * 60);
      if (g < 0) { w.style.display = 'none'; continue; }
      w.style.display = 'inline-block';
      for (var i = 0; i < p.N; i++) {
        var d = Math.round(G.random(p.seed[l] + 'd' + i) * 6);
        var pr = G.interpolate(g, [d, d + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE });
        var dx = (G.random(p.seed[l] + 'x' + i) - 0.5) * 260 * (1 - pr), dy = (G.random(p.seed[l] + 'y' + i) - 0.5) * 40 * (1 - pr);
        var s = w.children[i + 1];
        s.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        s.style.opacity = Math.min(1, pr * 1.6);
        s.style.filter = pr < 1 ? 'drop-shadow(' + (1 - pr) * 10 + 'px 0 0 rgba(255,40,60,0.7)) drop-shadow(' + -(1 - pr) * 10 + 'px 0 0 rgba(69,253,252,0.7))' : '';
      }
    }
  },
};

/** PW: page png (1920x1080), cam [t,cx,cy,zoom] keyframes (E.dive), rest blurred + darkened, hide boxes blurred harder, orange rounded boxes on the quote lines. */
export const Page2 = {
  name: 'Page2',
  html: (p, ctx) => {
    const { src, cam, pw = [], credit, blurAt, hide = [], mv = 'none' } = p;
    const h = 1080, k = blurAt != null || pw.length || hide.length ? 1 : 0;
    const img = `<img src="assets/media/pg_${src}.png" style="width:1920px;height:${h}px;display:block" alt="">`;
    const blur = `<div style="position:absolute;inset:0;${k > 0 ? `filter:blur(${(5.5 * k).toFixed(2)}px) brightness(${(1 - 0.5 * k).toFixed(3)}) saturate(${(1 - 0.6 * k).toFixed(3)})` : ''}">${img}</div>`;
    const hid = k > 0 ? hide.map(([x0, y0, x1, y1]) => `<div style="position:absolute;inset:0;clip-path:inset(${y0}px ${1920 - x1}px ${h - y1}px ${x0}px);filter:blur(${(22 * k).toFixed(2)}px) brightness(${(1 - 0.55 * k).toFixed(3)}) saturate(${(1 - 0.8 * k).toFixed(3)})">${img}</div>`).join('') : '';
    const marks = pw.map((m) => {
      const [x0, y0, x1, y1] = m.b;
      return `<div style="position:absolute;left:${x0 - 8}px;top:${y0 - 5}px;width:${x1 - x0 + 16}px;height:${y1 - y0 + 10}px;overflow:hidden;display:none"><div style="position:absolute;left:${-(x0 - 8)}px;top:${-(y0 - 5)}px;width:1920px;height:${h}px">${img}</div></div><div style="position:absolute;left:${x0 - 10}px;top:${y0 - 7}px;width:0px;height:${y1 - y0 + 14}px;border:3px solid #F1580A;border-radius:7px;box-shadow:0 0 10px rgba(241,88,10,0.45);display:none"></div>`;
    }).join('');
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.92) contrast(1.06) saturate(0.88)">${blur}${hid}${marks}</div>`;
    const P = { cam, h, hn: k > 0 ? hide.length : 0, marks: pw.map((m) => [m.b[0], m.b[2], m.at, m.d ?? 0.45]) };
    return `<div class="${AF}" ${ctx.dev('Page2', P)} style="background-color:#0b0d0e;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: mv, deg: 2.2, rate: 0.004 }, k: [{ raw: pg }] })}<div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = Math.max(0.1, S.dur), cam = p.cam, h = p.h;
    var pg = el._pg || (el._pg = el.querySelector('.pg'));
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (1 + 0.09 * (1 - G.ease(t, [0, 0.35], [0, 1]))) * (1 + 0.006 * dur * G.drift(t / dur));
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    var o = 1 + p.hn;
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], c = pg.children[o + 2 * i], b = pg.children[o + 2 * i + 1];
      var q = G.ease(t, [m[2], m[2] + m[3]], [0, 1]);
      if (q <= 0) { c.style.display = 'none'; b.style.display = 'none'; continue; }
      c.style.display = 'block'; b.style.display = 'block';
      c.style.opacity = Math.min(1, q * 2);
      b.style.width = (m[1] - m[0] + 20) * q + 'px';
    }
  },
};

// ---- AA: real map (EOX s2cloudless z12/z13/z14 plates, centre = TKRS / Mountbatten Rd junction) + white callouts
const MAP_PTS = { TKRS: [0, 6], MTB: [-27, -14], KATONG: [55, -85], ECPARK: [110, 17], ECP: [16, 49] };
export const Map2 = {
  name: 'Map2',
  html: (p, ctx) => {
    const { z, dur, calls } = p;
    const plates = [12, 13, 14].map((L) => `<img src="assets/media/v6_map_katong_z${L}.png" style="position:absolute;left:0;top:0;width:1920px;height:1080px;display:none" alt="">`).join('');
    const C = calls.map((c) => ({ ox: MAP_PTS[c.p][0], oy: MAP_PTS[c.p][1], dx: c.dx, dy: c.dy, at: c.at }));
    const svg = calls.map(() => `<g opacity="0"><line stroke="#F4F6F6" stroke-width="2.5"/><circle r="9" fill="none" stroke="#F4F6F6" stroke-width="3"/><circle r="3" fill="#F4F6F6"/></g>`).join('');
    const labels = calls.map((c) => `<div style="position:absolute;display:none;background-color:#F4F6F6;color:#111517;${ARCH};font-weight:800;font-size:34px;letter-spacing:0.06em;padding:6px 16px 7px;white-space:pre;box-shadow:0 6px 20px rgba(0,0,0,0.55)">${ctx.esc(c.label)}</div>`).join('');
    return `<div class="${AF}" ${ctx.dev('Map2', { z, dur, C })} style="background-color:#0a1012;overflow:hidden"><div class="${AF}" style="filter:brightness(0.9) contrast(1.08) saturate(0.85)">${plates}</div>${Vignette.html({ k: 0.45 })}<svg width="1920" height="1080" style="position:absolute;inset:0">${svg}<g transform="translate(1800,120)" opacity="0.9"><polygon points="0,-34 11,6 0,0 -11,6" fill="#F4F6F6"/><text x="0" y="36" fill="#F4F6F6" style="${ARCH}" font-weight="800" font-size="30" text-anchor="middle">N</text></g></svg>${labels}<div style="position:absolute;right:60px;bottom:40px;${ARCH};font-size:22px;color:rgba(232,232,232,0.75);text-shadow:0 0 4px #000">Sentinel-2 cloudless 2016 by EOX (CC BY 4.0)</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60;
    var Z = p.z[0] + (p.z[1] - p.z[0]) * G.drift(t / p.dur);
    var lv = Math.min(14, Math.max(12, Math.floor(Z + 0.0001)));
    var nxt = lv < 14 ? G.ease(Z - lv, [0.55, 0.95], [0, 1]) : 0;
    var S = Math.pow(2, Z - 14);
    var im = el.children[0].children;
    for (var L = 12; L <= 14; L++) {
      var e = im[L - 12], o = L === lv ? 1 : L === lv + 1 && nxt > 0 ? nxt : 0;
      if (o <= 0) { e.style.display = 'none'; continue; }
      var s = Math.pow(2, Z - L);
      e.style.display = '';
      e.style.left = 960 - 960 * s + 'px'; e.style.top = 540 - 540 * s + 'px';
      e.style.width = 1920 * s + 'px'; e.style.height = 1080 * s + 'px';
      e.style.opacity = o;
    }
    var gs = el.children[2].children;
    for (var i = 0; i < p.C.length; i++) {
      var c = p.C[i], g = gs[i];
      var q = G.ease(t, [c.at, c.at + 0.35], [0, 1]);
      var x = 960 + c.ox * S, y = 540 + c.oy * S;
      g.setAttribute('opacity', q);
      g.style.display = q > 0 ? '' : 'none';
      var ln = g.children[0];
      ln.setAttribute('x1', x); ln.setAttribute('y1', y); ln.setAttribute('x2', x + c.dx * q); ln.setAttribute('y2', y + c.dy * q);
      for (var k = 1; k <= 2; k++) { g.children[k].setAttribute('cx', x); g.children[k].setAttribute('cy', y); }
      var lb = el.children[3 + i], pl = G.ease(t, [c.at + 0.2, c.at + 0.5], [0, 1]);
      if (pl <= 0) { lb.style.display = 'none'; continue; }
      var lx = x + c.dx, ly = y + c.dy;
      lb.style.display = ''; lb.style.opacity = pl; lb.style.top = ly - 26 + 'px';
      if (c.dx < 0) { lb.style.right = 1920 - lx + 'px'; lb.style.left = ''; } else { lb.style.left = lx + 'px'; lb.style.right = ''; }
    }
  },
};

export default [Vid2, Ins2, FreezeSpot, Inset2, Duo2, Title2, Page2, Map2];
