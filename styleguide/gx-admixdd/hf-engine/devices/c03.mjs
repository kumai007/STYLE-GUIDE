// Case 03 devices (ports of C03Devices.tsx): Vid3, Still3, Page3, PRTitle, Spot, ThrW, TapeTear. Credit comes from c01b (by name).
// Contract: see devices/shared.mjs header. Media dir = hf-engine/media/case03 (junctioned as assets/media).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(HERE, '..', 'media', 'case03');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
const fr = (s) => Math.round(s * 60);

/** Vid3 (C1 Vid on case03): graded muted clip; raw = linear scale base + rate*t (Move none), else eased Move (rate default 0.012);
 *  hold = seconds the still png is shown before the clip starts (clip window starts at the hold frame). */
export const Vid3 = {
  name: 'Vid3',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 1, base = 1.0, rate = 0.012, origin, filter, vig = 0.45, sky = 0, hold = 0, still, raw = false, mv = 'push', deg = 2.5 } = p;
    const hf = fr(hold), hasHold = hold > 0 && !!still;
    let vid, img = '';
    if (hasHold) {
      vid = ctx.node({ d: 'Clip', p: { src, trim: (Math.round(trim * 60) - hf * speed) / 60, speed } }, [hf, ctx.win[1]]);
      img = `<img src="assets/media/${still}.png" style="position:absolute;inset:0;width:100%;height:100%" alt="">`;
    } else {
      const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60, md = ctx.win[1] > ctx.win[0] ? mediaDur(src) : Infinity;
      vid = ctx.node({ d: 'Clip', p: { src, trim, speed, hold: end > md + 1e-6 ? md - 1 / 60 : undefined } });
    }
    const dyn = raw || hasHold;
    const inner = `<div class="${AF}" ${dyn ? ctx.dev('Vid3', { raw, base, rate, hf: hasHold ? hf : 0 }) : ''} style="transform:scale(${base});transform-origin:${origin ?? '50% 50%'};filter:${filter ?? 'contrast(1.05)'}">${img}${vid}</div>`;
    const mvN = { d: 'Move', p: { kind: raw ? 'none' : mv, rate, deg: Math.min(3, deg), origin }, k: [{ raw: inner }] };
    const skyD = sky > 0 ? `<div class="${AF}" style="background:linear-gradient(180deg, rgba(0,0,0,${sky}) 0%, rgba(0,0,0,0) 55%)"></div>` : '';
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node(mvN)}${skyD}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p) {
    if (p.raw) el.style.transform = 'scale(' + (p.base + p.rate * (f / 60)) + ')';
    if (p.hf) el.children[0].style.display = f < p.hf ? 'block' : 'none';
  },
};

/** Still3: held png with an eased Move toward origin. */
export const Still3 = {
  name: 'Still3',
  html: (p, ctx) => {
    const { src, base = 1, rate = 0.03, origin = '50% 50%', filter = 'contrast(1.05)', mv = 'push', deg = 2.5 } = p;
    const inner = `<img src="assets/media/${src}.png" style="width:100%;height:100%;transform:scale(${base});transform-origin:${origin};filter:${filter}" alt="">`;
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node({ d: 'Move', p: { kind: mv, rate, deg: Math.min(3, deg), origin }, k: [{ raw: inner }] })}${Vignette.html({ k: 0.45 })}</div>`;
  },
};

/** Page3 (C1 Page on case03 pngs): cam [t, cx, cy, zoom] (E.dive), pop +9 % eased over 0.35 s, whole-shot Move, yellow multiply marks (0.45 s wipe). */
export const Page3 = {
  name: 'Page3',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit, off = 0, mv = 'push', rate = 0.005, deg = 2.5 } = p;
    const mk = marks.map((m) => { const [x0, y0, x1, y1] = m.b; return `<div style="position:absolute;left:${x0 - 6}px;top:${y0 - 3}px;width:0px;height:${y1 - y0 + 6}px;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px;display:none"></div>`; }).join('');
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><img src="assets/media/${src}.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    const P = { h, cam, marks: marks.map((m) => [m.b[0], m.b[2], m.at]), off };
    return `<div class="${AF}" ${ctx.dev('Page3', P)} style="background-color:#0b0d0e;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: mv, rate, deg: Math.min(3, deg) }, k: [{ raw: pg }] })}<div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G) {
    var tl = f / 60, t = tl + p.off, cam = p.cam, h = p.h;
    var pg = el._pg || (el._pg = el.querySelector('.pg'));
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (1 + 0.09 * (1 - G.ease(tl, [0, 0.35], [0, 1])));
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1];
      var q = G.ease(t, [m[2], m[2] + 0.45], [0, 1]);
      if (q <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.width = (m[1] - m[0] + 12) * q + 'px';
    }
  },
};

/** PR opener: black lead (until `black`), blurred freeze + ghosted blast peak, chrome 2-line caps title, grain. */
export const PRTitle = {
  name: 'PRTitle',
  html: (p, ctx) => {
    const { l1, l2, freeze, ghost } = p;
    const chrome = 'font-family:\'Archivo\';font-weight:800;line-height:1;white-space:pre;text-transform:uppercase;color:transparent;-webkit-background-clip:text;background-clip:text;filter:drop-shadow(0 3px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(0,0,0,0.9))';
    const gid = ctx.id('c03gr');
    return `<div class="${AF}" ${ctx.dev('PRTitle', { black: p.black })} style="background-color:#000;overflow:hidden">
<div class="${AF}" style="display:none"><img src="assets/media/${freeze}.png" style="width:100%;height:100%;filter:blur(12px) brightness(0.62) saturate(0.8)" alt=""><img src="assets/media/${ghost}.png" style="position:absolute;inset:0;width:100%;height:100%;opacity:0.3;mix-blend-mode:screen;filter:blur(16px)" alt="">${Vignette.html({ k: 0.6 })}</div>
<div class="${AF}" style="display:none;justify-content:center;align-items:center;gap:26px"><div style="${chrome};font-size:64px">${ctx.esc(l1)}</div><div style="${chrome};font-size:98px;letter-spacing:0.02em">${ctx.esc(l2)}</div></div>
<div class="${AF}" style="display:none;pointer-events:none;opacity:0.08;mix-blend-mode:overlay"><svg width="100%" height="100%"><filter id="${gid}"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="0"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${gid})"/></svg></div></div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, c = el.children, on = t >= p.black;
    for (var i = 0; i < 3; i++) c[i].style.display = on ? '' : 'none';
    if (!on) return;
    var u = t - p.black, ud = Math.max(0.5, S.dur - p.black), k = ud * G.drift(u / ud);
    c[0].style.opacity = G.ease(u, [0, 0.6], [0, 1]);
    c[0].children[0].style.transform = 'scale(' + (1.06 + 0.01 * k) + ')';
    c[0].children[1].style.transform = 'scale(' + (1.1 + 0.015 * k) + ')';
    var ty = function (d) { return G.ease(u, [d, d + 0.55], [0, 1]); };
    var sheen = G.ease(u, [0.3, 1.9], [-40, 140]);
    var bg = 'linear-gradient(100deg, rgba(255,255,255,0) ' + (sheen - 12) + '%, rgba(255,255,255,0.85) ' + sheen + '%, rgba(255,255,255,0) ' + (sheen + 12) + '%), linear-gradient(180deg, #FAFCFD 0%, #D9E0E4 36%, #7E888E 50%, #C9D1D5 62%, #F2F5F6 78%, #A3ACB1 100%)';
    var a = c[1].children[0], b = c[1].children[1];
    a.style.backgroundImage = bg; b.style.backgroundImage = bg;
    a.style.letterSpacing = (0.42 - 0.12 * ty(0.2)) + 'em'; a.style.opacity = ty(0.2);
    b.style.opacity = ty(0.55); b.style.transform = 'translateY(' + (1 - ty(0.55)) * 18 + 'px)';
    c[2].querySelector('feTurbulence').setAttribute('seed', String(Math.floor(f / 2) % 97));
  },
};

/** Soft spotlight: dims outside a soft ellipse. cam [t, x, y, r] (screen px, E.dive); fade-in from `from`. */
export const Spot = {
  name: 'Spot',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Spot', { cam: p.cam, from: p.from ?? 0.4, dim: p.dim ?? 0.74 })}></div>`,
  render: function (el, f, p, G) {
    var t = f / 60, cam = p.cam, dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var ts = cam.map(function (k) { return k[0]; });
    var g = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive }) : cam[0][i]; };
    var a = G.ease(t, [p.from, p.from + 0.6], [0, p.dim]), r = g(3);
    el.style.background = 'radial-gradient(ellipse ' + r + 'px ' + r * 0.8 + 'px at ' + g(1) + 'px ' + g(2) + 'px, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 36%, rgba(0,0,0,' + a.toFixed(3) + ') 100%)';
  },
};

/** ThrW: luminance posterised to 4 grey/white levels (c03thrw), blur 1.4 px, push. */
export const ThrW = {
  name: 'ThrW',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 0.5, base = 1.08, rate = 0.03, origin = '50% 45%' } = p;
    const lv = '0.06 0.34 0.66 0.97', fid = ctx.id('c03thrw');
    const svg = `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="discrete" tableValues="${lv}"/><feFuncG type="discrete" tableValues="${lv}"/><feFuncB type="discrete" tableValues="${lv}"/></feComponentTransfer></filter></svg>`;
    const inner = `<div class="${AF}" style="transform:scale(${base});transform-origin:${origin};filter:blur(1.4px) brightness(0.8) contrast(1.1) url(#${fid})">${ctx.node({ d: 'Clip', p: { src, trim, speed } })}</div>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:#000">${svg}${ctx.node({ d: 'Move', p: { kind: 'push', rate, origin }, k: [{ raw: inner }] })}${Vignette.html({ k: 0.35 })}</div>`;
  },
};

/** 8-f tape tracking tear: 9 bands, each shows A or B (B when random('tt'+k) < p), eased slip, scan bar. k = [A, B]; both copies per band. */
export const TapeTear = {
  name: 'TapeTear',
  html: (p, ctx, node) => {
    const bands = 9, n = p.n ?? 8;
    const [a, b] = node.k;
    const band = (k) => {
      const top = (k * 100) / bands;
      return `<div class="${AF}" style="clip-path:inset(${top}% 0 ${100 - top - 100 / bands}% 0)"><div class="${AF}">${ctx.node(a)}</div><div class="${AF}" style="display:none">${ctx.node(b)}</div></div>`;
    };
    return `<div class="${AF}" ${ctx.dev('TapeTear', { n, bands })} style="background-color:#000;overflow:hidden">${Array.from({ length: bands }, (_, k) => band(k)).join('')}<div class="${AF}" style="height:10px;background-color:rgba(230,236,238,0.35);filter:blur(3px)"></div></div>`;
  },
  render: function (el, f, p, G) {
    var pr = (f + 1) / p.n;
    for (var k = 0; k < p.bands; k++) {
      var d = el.children[k], useB = G.random('tt' + k) < pr;
      d.children[0].style.display = useB ? 'none' : '';
      d.children[1].style.display = useB ? '' : 'none';
      d.style.transform = 'translateX(' + ((G.random('tx' + k) - 0.5) * 220 * Math.sin(Math.PI * G.EASE(Math.min(1, pr)))) + 'px)';
    }
    var bar = el.children[p.bands];
    bar.style.top = G.ease(pr, [0, 1], [10, 90]).toFixed(1) + '%';
    bar.style.bottom = 'auto';
  },
};

export default [Vid3, Still3, Page3, PRTitle, Spot, ThrW, TapeTear];
