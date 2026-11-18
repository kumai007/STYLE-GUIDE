// Shared gx devices (ports of Motion.tsx, V4 Vignette, V6 FilmDefs/FilmLayer, V7Trans dissolve/dip/push/glitch, V8 RgbSlab + Intro SlabIn, C12 Clip/Raw/Frame/Foot/Ins/RawCaps/FadeOut).
// Device = { name, html(p, ctx, node), render?: function (el, f, p, G, S) }.
//   html: static markup (string). ctx.dev(name, p) gives the data-dev attrs that make the runtime call `render` on that element.
//   render: called every frame while the shot is on; f = local frame of the shot, S = { len, dur, frame (global) }, G = GX (lib/gx.js).
//   render is serialised with Function.toString() into the page: write it as `function (...) {}` and use ONLY its arguments.
export const BED = 0.063; // raw bed under VO = -24 dB
const AF = 'af'; // AbsoluteFill class (see build.mjs CSS)

export const Vignette = {
  name: 'Vignette',
  html: (p) => `<div class="${AF}" style="background:radial-gradient(ellipse 72% 70% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,${p.k ?? 0.42}) 100%);pointer-events:none"></div>`,
};

/** Clip: <video> timed to ctx.win; hold = Remotion <Freeze> past the last usable frame -> extracted still <img>. */
export const Clip = {
  name: 'Clip',
  html: (p, ctx) => {
    const { trim = 0, speed = 1, hold } = p;
    const last = hold !== undefined ? Math.floor(((hold - trim) * 60) / speed) : Infinity;
    let out = ctx.video({ ...p, maxFrame: last });
    if (hold !== undefined) {
      const src = ctx.still(p.src, Math.round(trim * 60) + last * speed);
      out += `<img ${ctx.dev('Clip', { last })} src="${src}" style="position:absolute;inset:0;width:100%;height:100%;display:none" alt="">`;
    }
    return out;
  },
  render: function (el, f, p) { el.style.display = f > p.last ? 'block' : 'none'; },
};

/** Move (Motion.tsx): whole-shot eased move; p = { kind, rate, deg, origin }. */
export const Move = {
  name: 'Move',
  html: (p, ctx, node) => {
    const tilt = p.kind.startsWith('tilt');
    return `<div class="${AF}" ${ctx.dev('Move', p)} style="transform-origin:${tilt ? '50% 50%' : p.origin ?? '50% 50%'}">${ctx.kids(node)}</div>`;
  },
  render: function (el, f, p, G, S) {
    var dur = Math.max(0.1, S.dur);
    el.style.transform = G.moveCss(p.kind, f / 60 / dur, dur, { rate: p.rate, deg: p.deg });
  },
};

/** Frame (C12Devices): overflow hidden, black, Move + filter + vignette. p = { mv, to, deg, origin, filter, vig }. */
export const Frame = {
  name: 'Frame',
  html: (p, ctx, node) => {
    const { mv = 'push', to = 1.06, deg, origin, filter, vig = 0.4 } = p;
    const rate = Math.max(0.002, (to - 1) / Math.max(0.1, ctx.dur));
    const inner = { d: 'Move', p: { kind: mv, rate, deg, origin }, k: [{ raw: `<div class="${AF}"${filter ? ` style="filter:${filter}"` : ''}>${ctx.kids(node)}</div>` }] };
    return `<div class="${AF}" style="overflow:hidden;background-color:#050607">${ctx.node(inner)}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
};

const footNode = (p, filter) => {
  const { src, trim, speed, vol, hold, ...m } = p;
  return { d: 'Frame', p: { filter, ...m }, k: [{ d: 'Clip', p: { src, trim, speed, vol, hold } }] };
};
export const Foot = { name: 'Foot', html: (p, ctx) => ctx.node(footNode(p, 'contrast(1.05) saturate(1.05)')) };
export const Ins = { name: 'Ins', html: (p, ctx) => ctx.node(footNode({ vig: 0.55, ...p, filter: 'contrast(1.04) saturate(0.45) brightness(0.86)' }, 'contrast(1.04) saturate(0.45) brightness(0.86)')) };

/** Raw: untouched clip at full level + children (captions). */
export const Raw = {
  name: 'Raw',
  html: (p, ctx, node) => `<div class="${AF}" style="background-color:#050607">${ctx.node({ d: 'Clip', p: { src: p.src, trim: p.trim, vol: 1 } })}${ctx.kids(node)}</div>`,
};

/** RawCaps: one div per caption [at, to, text] (s of the shot); eased fade 0.12 s. */
export const RawCaps = {
  name: 'RawCaps',
  html: (p, ctx) => `<div ${ctx.dev('RawCaps', p)}>${p.caps.map(([, , text]) =>
    `<div style="position:absolute;left:160px;right:160px;bottom:92px;text-align:center;display:none;font-family:'Archivo';font-weight:600;font-size:50px;line-height:1.18;color:#F4F7F7;text-shadow:0 0 3px #000, 0 0 3px #000, 0 2px 8px rgba(0,0,0,0.95)"><span style="background-color:rgba(0,0,0,0.42);padding:4px 16px">${ctx.esc(text)}</span></div>`).join('')}</div>`,
  render: function (el, f, p, G) {
    var t = f / 60, hit = -1;
    for (var i = 0; i < p.caps.length; i++) if (t >= p.caps[i][0] && t < p.caps[i][1]) { hit = i; break; }
    for (var j = 0; j < el.children.length; j++) {
      var d = el.children[j];
      if (j !== hit) { d.style.display = 'none'; continue; }
      var a = p.caps[j][0], b = p.caps[j][1];
      d.style.display = 'block';
      d.style.opacity = G.ease(t, [a, a + 0.12], [0, 1]) * G.ease(t, [b - 0.12, b], [1, 0]);
    }
  },
};

/** FadeOut: black over the last `len` s of the shot (dur = shot length s). */
export const FadeOut = {
  name: 'FadeOut',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('FadeOut', p)} style="background-color:#000;opacity:0"></div>`,
  render: function (el, f, p, G) { el.style.opacity = G.ease(f / 60, [p.dur - p.len, p.dur], [0, 1]); },
};

/** V7Trans DissolveIn: eased opacity over n frames from the shot start. */
export const Dissolve = {
  name: 'Dissolve',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Dissolve', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) { el.style.opacity = G.interpolate(f, [0, p.n], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE }); },
};

/** V7Trans DipOut / PushOut / PushIn: p = { n, len } (len = shot length in frames). Eased, clamped, 1:1 with V7Trans.tsx. */
export const DipOut = {
  name: 'DipOut',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('DipOut', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) { el.style.opacity = G.interpolate(f, [p.len - p.n, p.len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE }); },
};
export const PushOut = {
  name: 'PushOut',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('PushOut', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) {
    var q = G.interpolate(f, [p.len - p.n, p.len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE });
    el.style.transform = q <= 0 ? '' : 'scale(' + (1 + 0.06 * q) + ')';
    el.style.filter = q <= 0 ? '' : 'blur(' + (10 * q).toFixed(2) + 'px)';
  },
};
export const PushIn = {
  name: 'PushIn',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('PushIn', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) {
    if (f >= p.n) { el.style.opacity = ''; el.style.transform = ''; el.style.filter = ''; return; }
    var c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE };
    var q = G.interpolate(f, [0, p.n], [0, 1], c), o = G.interpolate(f, [0, p.n * 0.6], [0, 1], c);
    el.style.opacity = o; el.style.transform = 'scale(' + (1.08 - 0.08 * q) + ')'; el.style.filter = 'blur(' + (10 * (1 - q)).toFixed(2) + 'px)';
  },
};

/** V7Trans GlitchIn: p = { n, seed }. Main copy (the shot, all frames) + 8 band copies whose media is timed only to [0, n)
 *  + 3 tear lines + scanlines. Steps held 2 f; same seeds/maths as V7Trans.tsx. */
const GBF = ['brightness(0.5) saturate(0.4)', 'saturate(1.8) contrast(1.25) brightness(0.9)', 'hue-rotate(-25deg) saturate(1.5) brightness(0.8)'];
export const GlitchIn = {
  name: 'GlitchIn',
  html: (p, ctx, node) => {
    const w = [0, Math.min(p.n, ctx.win[1])];
    let h = `<div class="${AF}" ${ctx.dev('GlitchIn', p)}><div class="${AF}">${ctx.kids(node)}</div>`;
    for (let k = 0; k < 8; k++) h += `<div class="${AF}" style="display:none;filter:${GBF[k % 3]}">${ctx.kids(node, w)}</div>`;
    for (let k = 0; k < 3; k++) h += `<div style="display:none;position:absolute;left:0;right:0;height:2px;background-color:${k === 1 ? 'rgba(251,148,4,0.55)' : 'rgba(255,10,10,0.5)'}"></div>`;
    return h + `<div class="${AF}" style="display:none;background-image:repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, transparent 2px 4px)"></div></div>`;
  },
  render: function (el, f, p, G) {
    var c = el.children, n = p.n, s = p.seed, R = G.random, i;
    if (f >= n) {
      c[0].style.display = ''; c[0].style.opacity = ''; c[0].style.transform = '';
      for (i = 1; i < c.length; i++) c[i].style.display = 'none';
      return;
    }
    var st = Math.floor(f / 2), q = (f + 1) / n;
    var full = R(s + 'o' + st) < 0.25 + 0.7 * q ? 0.35 + 0.6 * q : 0, split = Math.round(14 * (1 - q)) + 2;
    c[0].style.display = full > 0 ? '' : 'none'; c[0].style.opacity = full; c[0].style.transform = 'translateX(' + split + 'px)';
    for (var k = 0; k < 8; k++) {
      var top = R(s + 't' + st + k) * 94, h = 2 + R(s + 'h' + st + k) * (5 + 16 * q);
      var off = (R(s + 'x' + st + k) - 0.5) * 2 * (40 + 140 * (1 - q)), show = R(s + 's' + st + k) < 0.4 + 0.6 * q;
      var b = c[1 + k];
      b.style.display = show ? '' : 'none';
      b.style.clipPath = 'inset(' + top + '% 0 ' + Math.max(0, 100 - top - h) + '% 0)';
      b.style.transform = 'translateX(' + off + 'px)';
      if (k < 3) { var l = c[9 + k]; l.style.display = show ? '' : 'none'; l.style.top = top + '%'; l.style.transform = 'translateX(' + off * 0.5 + 'px)'; }
    }
    c[12].style.display = ''; c[12].style.opacity = 1 - q;
  },
};

/** V8 RgbSlab: 5 screen-blended colour slabs, steps every 2 f (q = floor(t*30)); p = { seed }, t = f/60 (+ p.t0 s). */
const slabHtml = (name, p, ctx) => `<div class="${AF}" ${ctx.dev(name, p)} style="mix-blend-mode:screen">${['#11a334', '#2338d0', '#a4209f', '#1aa6c9', '#11a334'].map((c) => `<div style="position:absolute;width:108%;background-color:${c};opacity:0.75"></div>`).join('')}</div>`;
export const RgbSlab = {
  name: 'RgbSlab',
  html: (p, ctx) => slabHtml('RgbSlab', p, ctx),
  render: function (el, f, p, G) {
    var q = Math.floor((f / 60 + (p.t0 || 0)) * 30), s = p.seed, R = G.random;
    el.style.display = p.until == null || f < p.until ? '' : 'none';
    for (var k = 0; k < 5; k++) {
      var d = el.children[k];
      d.style.left = (R(s + 'l' + k + q) - 0.5) * 2 * 6 + '%';
      d.style.top = R(s + 't' + q + k) * 88 + '%';
      d.style.height = 3 + R(s + 'h' + q + k) * 9 + '%';
    }
  },
};
/** Intro SlabIn (k 'slab'): hard cut + 6-f RgbSlab burst (seed 'si') over the incoming picture. Own device name so a case
 *  module that defines its own 'RgbSlab' (devices/intro.mjs) cannot swap the render function under it. */
export const SlabIn = {
  name: 'SlabIn',
  html: (p, ctx, node) => `<div class="${AF}">${ctx.kids(node)}${slabHtml('SlabIn', { seed: 'si', until: 6 }, ctx)}</div>`,
  render: RgbSlab.render,
};

/** V6 FilmDefs: the v6film chroma-fringe + halation filter (applied to the shot container). */
export const FILM_DEFS = `<svg width="0" height="0" style="position:absolute"><filter id="v6film" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/><feOffset in="r" dx="-1.5" result="ro"/>
<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g"/>
<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b"/><feOffset in="b" dx="1.5" result="bo"/>
<feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen" result="rgb"/>
<feComponentTransfer in="rgb" result="hi"><feFuncR type="linear" slope="4" intercept="-3"/><feFuncG type="linear" slope="4" intercept="-3"/><feFuncB type="linear" slope="4" intercept="-3"/></feComponentTransfer>
<feGaussianBlur in="hi" stdDeviation="7" result="bl"/><feComposite in="rgb" in2="bl" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0"/></filter></svg>`;

/** V6 FilmLayer: grain (feTurbulence seed = frame % 113), dust (<=12 paths), hair, scratch, edge gradient. Global frame. */
export const Film = {
  name: 'Film',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Film', {})} style="pointer-events:none">
<div class="${AF}" style="opacity:0.2;mix-blend-mode:overlay"><svg width="100%" height="100%"><filter id="flg" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="0"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2.4" intercept="-0.7"/><feFuncG type="linear" slope="2.4" intercept="-0.7"/><feFuncB type="linear" slope="2.4" intercept="-0.7"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#flg)"/></svg></div>
<svg width="1920" height="1080" style="position:absolute;inset:0">${'<path stroke-linecap="round" fill="none" d="M0 0"/>'.repeat(12)}<path stroke="#111" stroke-width="1.4" fill="none" opacity="0.55" d="M0 0"/><line x1="0" y1="0" x2="0" y2="1080" stroke="#cfcfc6" stroke-width="1" opacity="0.22"/></svg>
<div class="${AF}" style="background:radial-gradient(ellipse 78% 78% at 50% 50%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.16) 100%)"></div></div>`,
  render: function (el, f, p, G, S) {
    var R = G.random, fr = S.frame, fq = Math.floor(fr / 2);
    el.querySelector('feTurbulence').setAttribute('seed', String(fr % 113));
    var svg = el.children[1], paths = svg.querySelectorAll('path'), n = 4 + Math.floor(R('dn' + fq) * 9);
    for (var k = 0; k < 12; k++) {
      var e = paths[k];
      if (k >= n) { e.style.display = 'none'; continue; }
      var x = R('dx' + fq + k) * 1920, y = R('dy' + fq + k) * 1080, r = 0.8 + Math.pow(R('dr' + fq + k), 3) * 4.5;
      var dark = R('dk' + fq + k) < 0.65, a = 0.35 + R('da' + fq + k) * 0.5;
      var a1 = R('dq' + fq + k) * 6.28, a2 = a1 + (R('dw' + fq + k) - 0.5) * 2.2, l = 2 + r * 1.6;
      e.style.display = '';
      e.setAttribute('d', 'M ' + x + ' ' + y + ' l ' + Math.cos(a1) * l + ' ' + Math.sin(a1) * l + ' l ' + Math.cos(a2) * l * 0.8 + ' ' + Math.sin(a2) * l * 0.8);
      e.setAttribute('stroke', dark ? '#050505' : '#d8d8d0');
      e.setAttribute('stroke-width', String(0.7 + r * 0.25));
      e.setAttribute('opacity', String(a));
    }
    var hair = paths[12];
    if (R('hr' + fq) < 0.22) {
      var hx = R('hx' + fq) * 1700 + 100, hy = R('hy' + fq) * 900 + 90, hl = 30 + R('hl' + fq) * 70;
      hair.style.display = '';
      hair.setAttribute('d', 'M ' + hx + ' ' + hy + ' q ' + hl * 0.4 + ' ' + -hl * 0.5 + ' ' + hl + ' ' + -hl * 0.15 + ' t ' + hl * 0.6 + ' ' + hl * 0.4);
    } else hair.style.display = 'none';
    var q3 = Math.floor(fq / 3), line = svg.querySelector('line');
    var sc = R('sc' + q3) < 0.18 ? 80 + R('sx' + q3) * 1760 : -1;
    line.style.display = sc > 0 ? '' : 'none';
    if (sc > 0) { line.setAttribute('x1', String(sc)); line.setAttribute('x2', String(sc + 6)); }
  },
};

export default [Vignette, Clip, Move, Frame, Foot, Ins, Raw, RawCaps, FadeOut, Dissolve, DipOut, PushOut, PushIn, GlitchIn, RgbSlab, SlabIn, Film];
