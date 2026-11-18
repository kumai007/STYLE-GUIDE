// Case 12 devices (ports of C12Devices.tsx): SL3 3-panel, TitleCOb pixel caps, ThrR threshold replay, SmearIn green block smear.
// Contract: see devices/shared.mjs header.
import { Vignette } from './shared.mjs';
const AF = 'af';

/** SL 3-panel: sharp centre (1.08 overscan), stretched dark sides, whole layout tilts (rate 0.012). 3 muted video copies. */
export const SL3 = {
  name: 'SL3',
  html: (p, ctx) => {
    const { src, trim, speed, deg = 2.5, dir = 'L' } = p;
    const W = 980;
    const side = (left) => `<div style="position:absolute;top:0;height:1080px;width:${(1920 - W) / 2 - 8}px;left:${left ? 0 : (1920 + W) / 2 + 8}px;overflow:hidden"><div style="position:absolute;inset:0;transform:scaleX(1.9);transform-origin:${left ? '100% 50%' : '0% 50%'};filter:brightness(0.72) saturate(0.85) blur(1.5px)">${ctx.node({ d: 'Clip', p: { src, trim, speed } })}</div></div>`;
    const centre = `<div style="position:absolute;left:${(1920 - W) / 2}px;top:0;width:${W}px;height:1080px;overflow:hidden;box-shadow:0 0 40px rgba(0,0,0,0.85)"><div style="position:absolute;left:${(W - 1920 * 1.08) / 2}px;top:0;width:${1920 * 1.08}px;height:${1080 * 1.08}px;filter:contrast(1.05)">${ctx.node({ d: 'Clip', p: { src, trim, speed } })}</div></div>`;
    const mv = { d: 'Move', p: { kind: dir === 'L' ? 'tiltL' : 'tiltR', deg, rate: 0.012 }, k: [{ raw: `<div class="${AF}">${side(true)}${side(false)}${centre}</div>` }] };
    return `<div class="${AF}" style="overflow:hidden;background-color:#040606">${ctx.node(mv)}${Vignette.html({ k: 0.35 })}</div>`;
  },
};

/** CO-b title: VT323 white caps, eased jitter-in per line (seeds c12a/c12b), eased fade-out at `out`. Local frame f of the overlay. */
export const TitleCOb = {
  name: 'TitleCOb',
  html: (p, ctx) => {
    const line = (txt, size) => `<div style="display:none;font-family:'VT323';font-size:${size}px;line-height:1;letter-spacing:0.06em;color:#F6F8F8">${ctx.esc(txt)}</div>`;
    return `<div class="${AF}" ${ctx.dev('TitleCOb', p)} style="align-items:center;justify-content:center;gap:22px;top:-30px"><div class="${AF}" style="background:radial-gradient(900px 300px at 50% 47%, rgba(0,0,0,0.55), rgba(0,0,0,0) 100%)"></div>${line(p.l1, 150)}${line(p.l2, 96)}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60;
    el.style.opacity = G.ease(t, [p.out - 0.3, p.out], [1, 0]);
    var L = [[el.children[1], p.at1, 'c12a'], [el.children[2], p.at2, 'c12b']];
    for (var i = 0; i < 2; i++) {
      var d = L[i][0], g = f - Math.round(L[i][1] * 60);
      if (g < 0) { d.style.display = 'none'; continue; }
      var j = 1 - G.EASE(Math.min(1, g / 16));
      var dx = (G.random(L[i][2] + 'x' + Math.floor(g / 2)) - 0.5) * 40 * j;
      var sh = j > 0.01 ? 10 * j + 'px 0 0 rgba(255,40,60,0.7), ' + -10 * j + 'px 0 0 rgba(69,253,252,0.7), ' : '';
      d.style.display = 'block';
      d.style.opacity = G.ease(g, [0, 8], [0, 1]);
      d.style.transform = 'translateX(' + dx.toFixed(1) + 'px)';
      d.style.textShadow = sh + '0 0 18px rgba(0,0,0,0.9), 0 4px 10px rgba(0,0,0,0.9)';
    }
  },
};

/** TH-r: grey -> gamma -> 4-level red/white/black table, blur 1px, eased push. */
export const ThrR = {
  name: 'ThrR',
  html: (p, ctx) => {
    const { src, trim, speed = 0.5, to = 1.1, origin = '50% 45%' } = p;
    const svg = `<svg width="0" height="0" style="position:absolute"><filter id="c12thr" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="gamma" amplitude="1.25" exponent="0.7" offset="0.02"/><feFuncG type="gamma" amplitude="1.25" exponent="0.7" offset="0.02"/><feFuncB type="gamma" amplitude="1.25" exponent="0.7" offset="0.02"/></feComponentTransfer><feComponentTransfer><feFuncR type="discrete" tableValues="0.03 0.62 0.93 1"/><feFuncG type="discrete" tableValues="0.02 0.05 0.42 0.97"/><feFuncB type="discrete" tableValues="0.02 0.05 0.40 0.95"/></feComponentTransfer></filter></svg>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:#000">${svg}${ctx.node({ d: 'Frame', p: { to, origin, vig: 0.4, filter: 'blur(1px) url(#c12thr)' }, k: [{ d: 'Clip', p: { src, trim, speed } }] })}</div>`;
  },
};

/** DM-g SmearIn: for the first `len` s, 9 horizontal band copies of the children shifted by seeded dx + green multiply/screen;
 *  then the children. Copies are timed: bands [0, N) frames, main [N, end). */
export const SmearIn = {
  name: 'SmearIn',
  html: (p, ctx, node) => {
    const len = p.len ?? 0.4, N = 9, nf = Math.ceil(len * 60);
    const [w0, w1] = ctx.win;
    const bands = Array.from({ length: N }, (_, i) => {
      const top = i * (100 / N);
      return `<div class="${AF}" style="clip-path:inset(${top}% 0 ${100 - top - 100 / N}% 0)">${ctx.kids(node, [w0, Math.min(w1, nf)])}</div>`;
    }).join('');
    return `<div class="${AF}" ${ctx.dev('SmearIn', { len, seed: p.seed, N })}><div class="${AF}" style="background-color:#050607">${bands}<div class="${AF}" style="background-color:#24E07A;mix-blend-mode:multiply"></div><div class="${AF}" style="background-color:#2BFF88;mix-blend-mode:screen"></div></div><div class="${AF}">${ctx.kids(node, [Math.max(w0, nf), w1])}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, sm = el.children[0], main = el.children[1];
    if (t >= p.len) { sm.style.display = 'none'; main.style.display = ''; return; }
    sm.style.display = ''; main.style.display = 'none';
    var k = 1 - G.EASE(Math.min(1, t / p.len)), st = Math.floor(t * 30);
    for (var i = 0; i < p.N; i++) {
      var dx = (G.random(p.seed + st + i) - 0.5) * 260 * k;
      sm.children[i].style.transform = 'translateX(' + dx.toFixed(1) + 'px) scale(1.08)';
    }
    sm.children[p.N].style.opacity = 0.55 * k;
    sm.children[p.N + 1].style.opacity = 0.18 * k;
  },
};

export default [SL3, TitleCOb, ThrR, SmearIn];
