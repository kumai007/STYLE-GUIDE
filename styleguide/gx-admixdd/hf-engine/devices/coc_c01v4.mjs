// coc_c01v4.mjs - case-1 v4 helpers (owned by the case-1 agent): the berg case card's fog + grade wrapper. 2-D only, no cyan, no
// glitch/flash. Render fns are serialised: use only (el, f, p, G, S).
import { printHtml } from './coc_v3.mjs';
const AF = 'af';

/** Grade: wraps kids in one CSS filter (berg card: pulls the berg's teal toward neutral grey). p = { filter }. */
export const Grade = {
  name: 'Grade',
  html: (p, ctx, node) => `<div class="${AF}" style="filter:${p.filter || 'none'}">${ctx.kids(node)}</div>`,
};

/** Fog: low drifting mist bands (soft radial blobs, screen blend), eased drift over the shot, opacity ramp.
 *  p = { o (peak opacity), top (px, band centre), dx (px drift over the shot), in:[f0,f1] }. */
export const Fog = {
  name: 'Fog',
  html: (p, ctx) => {
    const top = p.top ?? 600;
    const band = (i, y, h, a) => `<div style="position:absolute;left:-400px;top:${y - h / 2}px;width:2720px;height:${h}px;mix-blend-mode:screen;background:
radial-gradient(ellipse 22% 50% at ${18 + i * 9}% 50%,rgba(120,123,126,${a}) 0%,rgba(120,123,126,0) 70%),
radial-gradient(ellipse 26% 42% at ${55 - i * 7}% 46%,rgba(120,123,126,${a * 0.8}) 0%,rgba(120,123,126,0) 70%),
radial-gradient(ellipse 20% 55% at ${84 - i * 4}% 54%,rgba(120,123,126,${a * 0.9}) 0%,rgba(120,123,126,0) 70%);filter:blur(28px)"></div>`;
    return `<div class="${AF}" ${ctx.dev('Fog', { o: p.o ?? 0.6, dx: p.dx ?? 140, in: p.in || [0, 1] })} style="pointer-events:none;overflow:hidden;opacity:0">
${band(0, top - 60, 300, 0.20)}${band(1, top + 80, 380, 0.16)}${band(2, top + 240, 320, 0.12)}</div>`;
  },
  render: function (el, f, p, G, S) {
    var E = G.bezier(0.42, 0, 0.58, 1), k = E(Math.min(1, f / Math.max(1, S.len - 1))), L = el.children, i;
    for (i = 0; i < L.length; i++) L[i].style.transform = 'translate(' + ((i % 2 ? -1 : 1) * p.dx * (1 + i * 0.35) * k).toFixed(2) + 'px,0)';
    el.style.opacity = (p.o * G.ease(f, p.in, [0, 1], G.bezier(0.3, 0.6, 0.4, 1))).toFixed(3);
  },
};

/** Slide: eased translate of its kids. p = { at, n (f), x: [x0, x1] px, y: [y0, y1] px }; long-settle curve, no overshoot. */
export const Slide = {
  name: 'Slide',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Slide', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) {
    var E = G.bezier(0.45, 0, 0.2, 1), x = G.ease(f, [p.at, p.at + p.n], p.x || [0, 0], E), y = G.ease(f, [p.at, p.at + p.n], p.y || [0, 0], E);
    el.style.transform = 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)';
  },
};

/** PanCard (v8, owner item 8): the original clip pans left -> right (eased 3-D Mv inside CFoot), then a grey card pushes in from the
 *  left carrying the clip off to the right (one continuous left -> right motion), and ONE print of the clip's freeze slides in after it
 *  with a long settle and a 3-D yaw easing flat; slow push after. p = { foot (CFoot params), at (f), n (f, push), still [src, n],
 *  ow, oh, ox, iw, ih (crop of the still), rot }. */
export const PanCard = {
  name: 'PanCard',
  html: (p, ctx) => {
    const W = 1920, H = 1080, ph = 640, pw = Math.round((ph - 18) * (p.ow / p.oh) + 18);
    const q = { img: ctx.still(p.still[0], p.still[1]), ox: p.ox || 0, oy: 0, ow: p.ow, oh: p.oh, iw: p.iw, ih: p.ih, x: (W - pw) / 2, y: (H - ph) / 2 - 10, w: pw, h: ph,
      rot: p.rot ?? 1.6, hero: true, seed: p.still.join('_'), slide: { at: p.at + 10, n: 110, dx: -1300, dy: 40, r0: -5, ry: 10 } };
    const nid = ctx.id('pc');
    const grey = `<div class="${AF}" style="background:radial-gradient(ellipse 70% 70% at 50% 46%,#8B8E92 0%,#6C6F73 62%,#4E5154 100%)"></div>
<div class="${AF}" style="mix-blend-mode:multiply;opacity:0.22"><svg width="${W}" height="${H}" style="position:absolute;inset:0"><filter id="${nid}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="3" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="${W}" height="${H}" filter="url(#${nid})"/></svg></div>`;
    const print = `<div class="${AF}" ${ctx.dev('Mv', { a: [1, 0, 0, 0, 0], b: [1.035, 0, 0, 0, 0], ez: 'sym', t0: p.at + 60 })}>${printHtml(q, ctx)}</div>`;
    const foot = ctx.node({ d: 'Slide', p: { at: p.at, n: p.n, x: [0, W] }, k: [{ d: 'CFoot', p: p.foot }] });
    const card = ctx.node({ d: 'Slide', p: { at: p.at, n: p.n, x: [-W, 0] }, k: [] }).replace('></div>', `>${grey}${print}<div class="${AF}" style="box-shadow:inset 0 0 160px rgba(0,0,0,0.45)"></div></div>`);
    return `<div class="${AF}" style="overflow:hidden;background:#000">${foot}${card}</div>`;
  },
};

export default [Grade, Fog, Slide, PanCard];
