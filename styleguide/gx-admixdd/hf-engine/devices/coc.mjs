// coc.mjs - devices for the coc2h video (Abyssal look + Chilling Scares calm cards). Every move is eased in AND out (owner rule);
// nothing static except raws. Render fns are serialised: use only (el, f, p, G, S). Sizes in px at 1920x1080.
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;

// ---- SVG looks (ids unique per use): grade-free looks for replays / look swaps
const LOOKS = {
  // v3: no threshold / red / cyan looks. Keys kept for old callers; all map to neutral B&W (levels 28-217).
  thr: '<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="linear" slope="0.78" intercept="0.11"/><feFuncG type="linear" slope="0.78" intercept="0.11"/><feFuncB type="linear" slope="0.78" intercept="0.11"/></feComponentTransfer>',
  red: '<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="linear" slope="0.78" intercept="0.11"/><feFuncG type="linear" slope="0.78" intercept="0.11"/><feFuncB type="linear" slope="0.78" intercept="0.11"/></feComponentTransfer>',
  // grey duotone #0A0B0C -> #C8C8C8
  duo: '<feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0.3 0.59 0.11 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.04 0.78"/><feFuncG type="table" tableValues="0.043 0.78"/><feFuncB type="table" tableValues="0.047 0.78"/></feComponentTransfer>',
};
const CSSLOOK = {
  grade: 'sepia(0.08) saturate(1.3) contrast(1.22) brightness(0.96)', // v6 filmic grade: natural colour (sat ~+45%), light cool cast, deep blacks, deep blacks (texture = Tex overlay)
  v4: 'sepia(0.06) saturate(1.4) contrast(1.22) brightness(0.96)', // v6 channel grade: natural colour (sat ~+45%), light cool cast (p.cool = faint slate black lift)
  v4warm: 'sepia(0.5) saturate(1.0) contrast(1.22) brightness(0.96)', // v6: v4 for blue-cast sources (daylight dashcam sky)
  bw: 'grayscale(1) contrast(0.86) brightness(1.04)',
  none: '',
};
function lookFilter(look, ctx) {
  if (!look || look === 'none') return { css: '', defs: '' };
  if (CSSLOOK[look] !== undefined) return { css: CSSLOOK[look], defs: '' };
  const id = ctx.id('lk');
  return { css: `url(#${id})`, defs: `<svg width="0" height="0" style="position:absolute"><filter id="${id}" color-interpolation-filters="sRGB">${LOOKS[look]}</filter></svg>` };
}

/** Mv: eased whole-shot camera. p.a/p.b = [scale, rotX, rotY, tx%, ty%]; v7: rotX/rotY are real 3-D (perspective p.pp px, default
 *  1800) when non-zero, else the old 2-D transform. p.r = [deg0, deg1] small 2-D rotate; p.ez = io (E 0.35,0,0.25,1) | sym (0.42,0,0.58,1)
 *  | out | in; p.t0/p.t1 = move window (local f); p.o = origin. Footage moves are cover-checked (scale covers the rotation). */
export const Mv = {
  name: 'Mv',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Mv', p)} style="transform-origin:${p.o || '50% 50%'}">${ctx.kids(node)}</div>`,
  render: function (el, f, p, G, S) {
    var e = p.ez === 'out' ? G.bezier(0.22, 1, 0.36, 1) : p.ez === 'in' ? G.bezier(0.5, 0, 0.75, 0.3) : p.ez === 'sym' ? G.bezier(0.42, 0, 0.58, 1) : G.bezier(0.35, 0, 0.25, 1);
    var t0 = p.t0 || 0, t1 = p.t1 || S.len - 1;
    var k = e(Math.min(1, Math.max(0, (f - t0) / Math.max(1, t1 - t0))));
    var v = p.a.map(function (x, i) { return x + (p.b[i] - x) * k; });
    var r = p.r ? p.r[0] + (p.r[1] - p.r[0]) * k : 0;
    var d3 = p.a[1] || p.a[2] || p.b[1] || p.b[2];
    el.style.transform = (d3 ? 'perspective(' + (p.pp || 1800) + 'px) ' : '') + 'translate(' + v[3].toFixed(3) + '%,' + v[4].toFixed(3) + '%) '
      + (d3 ? 'rotateX(' + v[1].toFixed(4) + 'deg) rotateY(' + v[2].toFixed(4) + 'deg) ' : '') + 'rotate(' + r.toFixed(3) + 'deg) scale(' + v[0].toFixed(5) + ')';
  },
};
/** tiltWrap: v7 3-D parallax camera around a board/plane layer (full-frame Mv, the plane eases toward flat while its own cam glides).
 *  t = { a, b, ez, t1, pp } Mv params. Returns html wrapping `inner`. */
export const tiltWrap = (ctx, t, inner) => (t ? `<div class="${AF}" ${ctx.dev('Mv', { ez: 'sym', ...t })} style="transform-origin:50% 50%">${inner}</div>` : inner);

/** box(): place a source crop [x,y,w,h,SW,SH] in the frame. mode cover | fit (scale k) -> {L,T,rw,rh,sc}. */
function box(crop, mode, k = 1) {
  const [x, y, w, h] = crop;
  const sc = (mode === 'cover' ? Math.max(W / w, H / h) : Math.min(W / w, H / h)) * k;
  return { sc, rw: w * sc, rh: h * sc, L: (W - w * sc) / 2, T: (H - h * sc) / 2 };
}
function media(ctx, p, b, { vol = 0, filter = '', still } = {}) {
  const [x, y, , , SW, SH] = p.crop;
  const st = `inset:auto;left:${px(-x * b.sc)};top:${px(-y * b.sc)};width:${px(SW * b.sc)};height:${px(SH * b.sc)};${filter ? `filter:${filter};` : ''}`;
  if (still) return `<img src="${still}" alt="" style="position:absolute;${st}">`;
  return ctx.video({ src: p.src, trim: p.t, speed: p.speed || 1, vol, fit: 'fill', style: st });
}

/** CFoot: footage. p = { src, t, speed, crop, mode cover|fit|inset, look, raw, vol, face:[[x,y,rx,ry]] (source px), freeze (native frame),
 *  mv:{a,b,ez}, ramp (exposure ramp last 8 f), vig }. Raws: no grade, no motion. Low-res / non-16:9 = centred + blur-fill (never bars). */
export const CFoot = {
  name: 'CFoot',
  html: (p, ctx) => {
    const mode = p.mode || 'cover';
    const b = box(p.crop, mode === 'inset' ? 'fit' : mode, mode === 'inset' ? 0.86 : 1);
    const still = p.freeze !== undefined ? ctx.still(p.src, p.freeze) : undefined;
    const lk = lookFilter(p.raw ? 'none' : p.look || 'grade', ctx);
    let bg = '';
    if (b.rw < W - 2 || b.rh < H - 2) {
      const bb = box(p.crop, 'cover');
      bg = `<div class="${AF}" ${p.raw ? '' : ctx.dev('Mv', { a: [1.12, 0, 0, -1.2, 0], b: [1.16, 0, 0, 1.2, 0] })} style="overflow:hidden"><div style="position:absolute;left:${px(bb.L)};top:${px(bb.T)};width:${px(bb.rw)};height:${px(bb.rh)};overflow:hidden;filter:blur(38px) brightness(0.4) ${p.raw ? 'saturate(1.1)' : 'saturate(0.85)'}">${media(ctx, p, bb, { still })}</div></div>`;
    }
    const face = (p.face || []).map(([fx, fy, rx, ry]) => {
      const l = fx - rx, t = fy - ry;
      return `<div style="position:absolute;left:${px(l * b.sc)};top:${px(t * b.sc)};width:${px(2 * rx * b.sc)};height:${px(2 * ry * b.sc)};border-radius:50%;overflow:hidden;-webkit-mask-image:radial-gradient(ellipse at center,#000 62%,transparent 80%)"><div style="position:absolute;left:${px(-l * b.sc)};top:${px(-t * b.sc)};width:${px(b.rw)};height:${px(b.rh)}">${media(ctx, { ...p }, { ...b }, { filter: 'blur(20px)', still })}</div></div>`;
    }).join('');
    const shadow = mode === 'inset' ? 'box-shadow:0 14px 44px rgba(0,0,0,0.8);' : '';
    const fg = `<div style="position:absolute;left:${px(b.L)};top:${px(b.T)};width:${px(b.rw)};height:${px(b.rh)};overflow:hidden;${shadow}">${media(ctx, p, b, { vol: p.vol || 0, still })}${face}</div>`;
    const tint = p.cool && !p.raw ? '<div class="'+AF+'" style="background:#03070C;mix-blend-mode:screen"></div>' : ''; // v6: light slate lift, ~half of v4 navy #0b1826
    const body = `<div class="${AF}" style="${lk.css ? `filter:${lk.css}` : ''}">${fg}${tint}</div>`;
    // v9 (owner 2026-11-17: 3-D pan/zoom over the whole video): raws get a slow, gentle 3-D push too (scale >= 1.04 hides the edges)
    const RAWMV = [{ a: [1.04, 0, 1.6, 0, 0], b: [1.08, 0, -1.2, 0, 0] }, { a: [1.04, 1.4, 0, 0, 0], b: [1.08, -1.0, 0, 0, 0] }][Math.round(+p.t || 0) % 2];
    const mv = ctx.node({ d: 'Mv', p: p.mv || (p.raw ? RAWMV : { a: [1, 0, 0, 0, 0], b: [1.06, 0, 0, 0, 0] }), k: [{ raw: body }] });
    const vig = p.raw ? '' : `<div class="${AF}" style="background:radial-gradient(ellipse 72% 70% at 50% 50%,rgba(0,0,0,0) 38%,rgba(0,0,0,${p.vig ?? 0.32}) 100%)"></div>`;
    const ramp = ''; // v3: no exposure ramps (p.ramp ignored)
    return `<div class="${AF}" style="overflow:hidden;background-color:#050607">${lk.defs}${bg}${mv}${vig}${ramp}</div>`;
  },
};
export const Ramp = {
  name: 'Ramp',
  html: () => '',
  render: function (el) { el.style.opacity = '0'; }, // v3: retired (no flash looks); kept for old callers
};
/** Flash: retired in v3 (no flashes). Export kept; renders nothing. */
export const Flash = {
  name: 'Flash',
  html: () => '',
  render: function (el) { el.style.opacity = '0'; },
};

/** Fade: eased opacity in/out of a group. p = { in:[f0,f1], out:[f0,f1] } (local frames). */
export const Fade = {
  name: 'Fade',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Fade', p)} style="opacity:0">${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) {
    var e = G.bezier(0.42, 0, 0.58, 1), o = 1;
    if (p.in) o = Math.min(o, G.ease(f, p.in, [0, 1], e));
    if (p.out) o = Math.min(o, G.ease(f, p.out, [1, 0], e));
    el.style.opacity = o.toFixed(3);
  },
};

/** Scr: v3 = plain eased word-by-word fade (no scramble, no RGB fringe). p = { text, at (f), stag (f, ignored), cyc, seed, style };
 *  words 12 f apart, 18 f eased fades. Export and params kept for old callers. */
export const Scr = {
  name: 'Scr',
  html: (p, ctx) => `<div ${ctx.dev('Scr', { at: p.at || 0 })} style="${p.style}">${p.text.split(' ').map((w) => `<span class="w" style="opacity:0">${ctx.esc(w)}</span>`).join(' ')}</div>`,
  render: function (el, f, p, G) {
    var ws = el.querySelectorAll('.w'), e = G.bezier(0.42, 0, 0.58, 1);
    for (var i = 0; i < ws.length; i++) ws[i].style.opacity = G.ease(f, [p.at + i * 12, p.at + i * 12 + 18], [0, 1], e).toFixed(3);
  },
};

/** Berg: tall berg still. p = { img, iw, ih, wl (waterline 0..1 of ih), a:[y0 (0..1 centre), s0], b:[y1, s1], ez, fadeIn (f), dark:[0..1 at start, end], blur:[px0,px1] }. */
export const Berg = {
  name: 'Berg',
  html: (p, ctx) => `<div class="${AF}" style="overflow:hidden;background:#050607">${tiltWrap(ctx, p.tilt === undefined ? { a: [1.08, 7, 0, 0, 0], b: [1.05, 1.5, 0, 0, 0] } : p.tilt, `<div ${ctx.dev('Berg', p)} style="position:absolute;left:0;top:0;width:${W}px;height:${(p.ih * W) / p.iw}px;transform-origin:50% 0;background:url(${p.img}) center/100% 100% no-repeat"></div>`)}<div class="${AF}" style="background:radial-gradient(ellipse 72% 70% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,0.55) 100%)"></div></div>`,
  render: function (el, f, p, G, S) {
    var e = p.ez === 'dive' ? G.bezier(0.5, 0, 0.2, 1) : G.bezier(0.42, 0, 0.58, 1), k = e(Math.min(1, f / Math.max(1, S.len - 1)));
    var hh = p.ih * 1920 / p.iw, y = p.a[0] + (p.b[0] - p.a[0]) * k, s = p.a[1] + (p.b[1] - p.a[1]) * k;
    var ty = 540 - y * hh * s, rx = (p.rx || [0, 0]);
    var fi = p.fadeIn ? G.ease(f, [p.fadeAt || 0, (p.fadeAt || 0) + p.fadeIn], [0, 1], G.bezier(0.3, 0.6, 0.4, 1)) : 1;
    var dk = p.dark ? p.dark[0] + (p.dark[1] - p.dark[0]) * k : 1, bl = p.blur ? p.blur[0] + (p.blur[1] - p.blur[0]) * k : 0;
    el.style.transform = 'translate(' + ((1920 - 1920 * s) / 2).toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(5) + ')'; // v3: 2-D (p.rx ignored)
    el.style.opacity = fi.toFixed(3);
    el.style.filter = 'grayscale(0.1) contrast(1.3) brightness(' + dk.toFixed(3) + ')' + (bl > 0.05 ? ' blur(' + bl.toFixed(2) + 'px)' : '');
  },
};

/** Num: case number (Special Elite) fade + drift up 1.5% H + dive out (scale 1.5, opacity 0). p = { text, in, drift:[f0,f1], out:[f0,f1] }. */
export const Num = {
  name: 'Num',
  html: (p, ctx) => `<div class="${AF}" style="align-items:center;justify-content:center"><div ${ctx.dev('Num', p)} style="font-family:'Special Elite';font-size:216px;letter-spacing:0.04em;color:#F2F2F2;text-shadow:0 3px 6px rgba(0,0,0,0.67);opacity:0">${ctx.esc(p.text)}</div></div>`,
  render: function (el, f, p, G) {
    var o = Math.min(G.ease(f, p.in, [0, 1], G.bezier(0.42, 0, 0.58, 1)), G.ease(f, p.out, [1, 0], G.bezier(0.55, 0, 1, 0.45)));
    var y = G.ease(f, p.drift, [0, -16.2], G.bezier(0.22, 1, 0.36, 1)), s = G.ease(f, p.out, [1, 1.5], G.bezier(0.55, 0, 1, 0.45));
    el.style.opacity = o.toFixed(3);
    el.style.transform = 'translateY(' + y.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
    el.style.filter = f > p.out[0] ? 'blur(' + ((f - p.out[0]) * 0.8).toFixed(1) + 'px)' : 'none';
  },
};

/** Lbl: v3 place label = word-by-word grey caps (Archivo 800 34 px #C8C8C8, lower left), words 12 f apart, 18 f linear fades,
 *  block out 36 f ending at hold. p = { l1, l2, at (f), hold (f) }. Never restates the VO. */
export const Lbl = {
  name: 'Lbl',
  html: (p, ctx) => {
    const ln = (t, top) => `<div style="position:absolute;left:96px;top:${top}px;white-space:nowrap;font-size:34px;line-height:1.1;letter-spacing:0.04em;text-transform:uppercase;font-family:Archivo;font-weight:800;font-stretch:100%;color:#C8C8C8;text-shadow:0 2px 14px rgba(0,0,0,0.55),0 1px 2px rgba(0,0,0,0.6)">${t.split(' ').map((w) => `<span class="w" style="opacity:0">${ctx.esc(w)}</span>`).join(' ')}</div>`;
    return `<div class="af" ${ctx.dev('Lbl', { at: p.at || 0, hold: p.hold })} style="pointer-events:none">${ln(p.l1, p.l2 ? 868 : 900)}${p.l2 ? ln(p.l2, 914) : ''}</div>`;
  },
  render: function (el, f, p, G) {
    var L = function (x) { return x; }, ws = el.querySelectorAll('.w'), end = p.at + p.hold;
    var blk = G.ease(f, [end - 36, end], [1, 0], L);
    for (var i = 0; i < ws.length; i++) ws[i].style.opacity = (G.ease(f, [p.at + i * 12, p.at + i * 12 + 18], [0, 1], L) * blk).toFixed(3);
  },
};

/** Typ: v3 date count-in (no typewriter, no cursor): characters left to right 6 f apart, 12 f fades, Archivo 800 60 px #E8E8E8
 *  lower-left third; block out 36 f after hold. p = { text, at, hold }. */
export const Typ = {
  name: 'Typ',
  html: (p, ctx) => `<div ${ctx.dev('Typ', { at: p.at || 0, hold: p.hold || 120 })} style="position:absolute;left:154px;top:690px;white-space:pre;font-family:Archivo;font-weight:800;font-stretch:100%;font-size:60px;letter-spacing:0.03em;color:#E8E8E8;text-shadow:0 2px 14px rgba(0,0,0,0.55),0 1px 2px rgba(0,0,0,0.6)">${[...p.text.toUpperCase()].map((c) => `<span class="c" style="opacity:0">${ctx.esc(c)}</span>`).join('')}</div>`,
  render: function (el, f, p, G) {
    var L = function (x) { return x; }, cs = el.querySelectorAll('.c'), n = cs.length, end = p.at + n * 6 + p.hold;
    var blk = G.ease(f, [end, end + 36], [1, 0], L);
    for (var i = 0; i < n; i++) cs[i].style.opacity = (G.ease(f, [p.at + i * 6, p.at + i * 6 + 12], [0, 1], L) * blk).toFixed(3);
  },
};

/** Rng: red look-here ellipse (#E0282A + soft red glow, owner rule 2026-11-17) D9c (6 f draw, grows 6%, fades 6 f). p = { cx, cy, rx, ry (frame px), at, hold }. */
export const Rng = {
  name: 'Rng',
  html: (p, ctx) => `<svg ${ctx.dev('Rng', p)} width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible;opacity:0"><ellipse cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" fill="none" stroke="#E0282A" stroke-width="4" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" style="filter:drop-shadow(0 0 10px rgba(224,40,42,0.55));transform-origin:${p.cx}px ${p.cy}px"/></svg>`,
  render: function (el, f, p, G) {
    var t = f - p.at, e = G.bezier(0.42, 0, 0.58, 1), c = el.firstChild;
    el.style.opacity = (t < 0 ? 0 : G.ease(t, [p.hold - 6, p.hold], [1, 0], e)).toFixed(3);
    c.setAttribute('stroke-dashoffset', G.ease(t, [0, 8], [100, 0], G.bezier(0.16, 1, 0.3, 1)).toFixed(2));
    c.style.transform = 'scale(' + G.ease(t, [0, p.hold], [1, 1.06], e).toFixed(4) + ')';
  },
};

/** Spt: spotlight D9a (darken outside a soft circle, 12 f in/out). p = { cx, cy, r, at, hold }. */
export const Spt = {
  name: 'Spt',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Spt', p)} style="opacity:0;background:radial-gradient(circle ${p.r}px at ${p.cx}px ${p.cy}px,rgba(0,0,0,0) 62%,rgba(5,6,7,0.88) 100%)"></div>`,
  render: function (el, f, p, G) {
    var t = f - p.at, e = G.bezier(0.16, 1, 0.3, 1);
    el.style.opacity = Math.min(G.ease(t, [0, 12], [0, 1], e), G.ease(t, [p.hold - 12, p.hold], [1, 0], G.bezier(0.42, 0, 0.58, 1))).toFixed(3);
  },
};

/** Crd: credit, small bottom-right, eased fade. Tag: orange name tag D5. */
export const Crd = {
  name: 'Crd',
  html: (p, ctx) => `<div ${ctx.dev('Fade', { in: [p.at, p.at + 12], out: [p.at + p.hold - 12, p.at + p.hold] })} style="position:absolute;right:2.6%;bottom:4.2%;font-family:'Courier Prime';font-weight:700;font-size:26px;letter-spacing:0.04em;color:rgba(232,232,232,0.82);text-shadow:0 2px 3px rgba(0,0,0,0.8);opacity:0">${ctx.esc(p.text)}</div>`,
};
export const Tag = {
  name: 'Tag',
  // v3: no orange box; grey caps text, lower centre, eased fade. p = { l1, l2, at, hold }.
  html: (p, ctx) => `<div class="af" style="align-items:center;justify-content:flex-end;padding-bottom:7%"><div ${ctx.dev('Tag', p)} style="font-size:40px;letter-spacing:0.04em;text-transform:uppercase;text-align:center;opacity:0;font-family:Archivo;font-weight:800;font-stretch:100%;color:#C8C8C8;text-shadow:0 2px 14px rgba(0,0,0,0.55),0 1px 2px rgba(0,0,0,0.6)">${ctx.esc(p.l1)}${p.l2 ? `<div style="font-size:28px;letter-spacing:0.1em">${ctx.esc(p.l2)}</div>` : ''}</div></div>`,
  render: function (el, f, p, G) {
    var t = f - p.at, L = function (x) { return x; };
    el.style.opacity = Math.min(G.ease(t, [0, 18], [0, 1], L), G.ease(t, [p.hold, p.hold + 36], [1, 0], L)).toFixed(3);
  },
};

/** CPage: real page screenshot as a card on a darkened blurred copy of itself (Chilling Scares) - pop +9% settle 45 f, then
 *  +0.4 %/s, small 2-D rotate eased; marker #E0282A .55 multiply on key [x0,y0,x1,y1] (page px) growing L->R; names blurred.
 *  p = { img, iw, ih, key, focus (page y to centre), names:[[x0,y0,x1,y1]], mark (bool), markAt (f), flash, rot }. */
export const CPage = {
  name: 'CPage',
  html: (p, ctx) => {
    const cw = Math.min(1180, p.iw), sc = cw / p.iw, ch = p.ih * sc;
    const fy = p.focus ?? (p.key ? (p.key[1] + p.key[3]) / 2 : p.ih / 2);
    const top = Math.min(80, Math.max(H - 80 - ch, 540 - fy * sc));
    const blurName = (b) => `<div style="position:absolute;left:${px(b[0] * sc - 4)};top:${px(b[1] * sc - 4)};width:${px((b[2] - b[0]) * sc + 8)};height:${px((b[3] - b[1]) * sc + 8)};overflow:hidden"><img src="${p.img}" alt="" style="position:absolute;left:${px(-b[0] * sc + 4)};top:${px(-b[1] * sc + 4)};width:${px(cw)};height:${px(ch)};filter:blur(9px)"></div>`;
    const k = p.key, mark = p.mark && k ? `<div ${ctx.dev('Mark', { at: p.markAt ?? 24, n: Math.max(30, Math.round(((k[2] - k[0]) * sc) / (0.15 * W) * 60)) })} style="position:absolute;left:${px(k[0] * sc - 6)};top:${px(k[1] * sc - 4)};width:${px((k[2] - k[0]) * sc + 12)};height:${px(Math.max(36, (k[3] - k[1]) * sc + 8))};background:#E0282A;opacity:0.55;mix-blend-mode:multiply;transform-origin:0 50%;transform:scaleX(0)"></div>` : '';
    const card = `<div style="position:absolute;left:${px((W - cw) / 2)};top:${px(top)};width:${px(cw)};height:${px(ch)};box-shadow:0 22px 70px rgba(0,0,0,0.85);background:#fff"><img src="${p.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%">${(p.names || []).map(blurName).join('')}${mark}</div>`;
    const mv = ctx.node({ d: 'PgMv', p: { rot: p.rot ?? 4, top: (540 - top) / H }, k: [{ raw: card }] });
    const bg = ctx.node({ d: 'Mv', p: { a: [1.18, 0, 0, 0, 0], b: [1.24, 0, 0, 0, -1] }, k: [{ raw: `<div class="${AF}" style="background:url(${p.img}) center/cover;filter:blur(26px) brightness(0.32) saturate(0.4)"></div>` }] });
    return `<div class="${AF}" style="overflow:hidden;background:#050607">${bg}${mv}<div class="${AF}" style="background:radial-gradient(ellipse 75% 72% at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.5) 100%)"></div></div>`;
  },
};
export const PgMv = {
  name: 'PgMv',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('PgMv', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G, S) {
    var pop = G.ease(f, [0, 45], [0.92, 1.0], G.bezier(0.16, 1, 0.3, 1)), slow = G.ease(f, [0, S.len], [0, S.dur * 0.004], G.bezier(0.42, 0, 0.58, 1));
    var r = G.ease(f, [0, S.len], [p.rot * 0.3, -p.rot * 0.1], G.bezier(0.35, 0, 0.25, 1));
    el.style.transformOrigin = '50% ' + (p.top * 100 + 50).toFixed(1) + '%';
    el.style.transform = 'rotate(' + r.toFixed(3) + 'deg) scale(' + (pop + slow).toFixed(5) + ')'; // v3: 2-D only
  },
};
export const Mark = {
  name: 'Mark',
  html: () => '',
  render: function (el, f, p, G) { el.style.transform = 'scaleX(' + G.ease(f, [p.at, p.at + p.n], [0, 1], G.bezier(0.4, 0, 0.2, 1)).toFixed(4) + ')'; },
};

/** CMap: flat satellite plate (v3): pull-out 1.25 -> 1 over 150 f toward the target, red pins + red leader (owner rule 2026-11-17) + grey caps labels
 *  (L->R wipe), then +0.4 %/s. p = { img, iw, ih, tx, ty (target px), pins:[{x,y,l,at}] }. */
export const CMap = {
  name: 'CMap',
  html: (p, ctx) => {
    const b = box([0, 0, p.iw, p.ih, p.iw, p.ih], 'cover');
    const P = (x, y) => [b.L + x * b.sc, b.T + y * b.sc];
    const pins = p.pins.map((q, i) => {
      const [x, y] = P(q.x, q.y), right = x < W * 0.62, lx = right ? x + 150 : x - 150, ly = y - 90 - i * 10;
      return `<div ${ctx.dev('Pin', { at: q.at })} style="position:absolute;inset:0;opacity:0"><div style="position:absolute;left:${px(x - 7)};top:${px(y - 7)};width:14px;height:14px;border-radius:50%;background:#E0282A;box-shadow:0 0 0 2px rgba(0,0,0,0.45),0 0 10px rgba(224,40,42,0.55)"></div><svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><line class="ld" x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="#E0282A" stroke-width="2.5" style="filter:drop-shadow(0 0 10px rgba(224,40,42,0.55))" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/></svg><div class="lb" style="position:absolute;${right ? `left:${px(lx)}` : `right:${px(W - lx)}`};top:${px(ly - 24)};font-size:34px;letter-spacing:0.06em;text-transform:uppercase;padding:2px 4px;white-space:nowrap;clip-path:inset(0 100% 0 0);font-family:Archivo;font-weight:800;font-stretch:100%;color:#C8C8C8;text-shadow:0 2px 14px rgba(0,0,0,0.55),0 1px 2px rgba(0,0,0,0.6)">${ctx.esc(q.l)}</div></div>`;
    }).join('');
    const plate = `<div style="position:absolute;left:${px(b.L)};top:${px(b.T)};width:${px(b.rw)};height:${px(b.rh)};background:url(${p.img}) center/100% 100%;filter:grayscale(0.45) contrast(1.24) brightness(0.86)"></div>${pins}`;
    const [ox, oy] = P(p.tx, p.ty);
    return `<div class="${AF}" style="overflow:hidden;background:#050607"><div class="${AF}" ${ctx.dev('MapMv', { ox: (ox / W) * 100, oy: (oy / H) * 100 })}>${plate}</div><div class="${AF}" style="background:radial-gradient(ellipse 72% 70% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,0.54) 100%)"></div></div>`;
  },
};
export const MapMv = {
  name: 'MapMv',
  html: () => '',
  // v7: 3-D parallax glide: map plane tilted 5 deg in X (top away) settles flat while it zooms 1.15 -> 1.03, eased over the whole shot
  // (0.42,0,0.58,1); scale covers the tilt (cover-checked). Pins/labels ride the plane.
  render: function (el, f, p, G, S) {
    var k = G.ease(f, [0, Math.max(1, S.len - 1)], [0, 1], G.bezier(0.42, 0, 0.58, 1)), s = 1.15 - 0.12 * k, rx = 5 * (1 - k), ry = -2 + 2 * k; // v7b: gentler so the pin labels stay in frame
    el.style.transformOrigin = p.ox.toFixed(2) + '% ' + p.oy.toFixed(2) + '%';
    el.style.transform = 'perspective(1800px) rotateX(' + rx.toFixed(4) + 'deg) rotateY(' + ry.toFixed(4) + 'deg) scale(' + s.toFixed(5) + ')';
  },
};
export const Pin = {
  name: 'Pin',
  html: () => '',
  render: function (el, f, p, G) {
    var t = f - p.at;
    el.style.opacity = G.ease(t, [0, 6], [0, 1], G.bezier(0.42, 0, 0.58, 1)).toFixed(3);
    el.querySelector('.ld').setAttribute('stroke-dashoffset', G.ease(t, [4, 20], [100, 0], G.bezier(0.4, 0, 0.2, 1)).toFixed(2));
    el.querySelector('.lb').style.clipPath = 'inset(0 ' + G.ease(t, [18, 28], [100, 0], G.bezier(0.42, 0, 0.58, 1)).toFixed(2) + '% 0 0)';
  },
};

/** RSub: raw subtitles D6 (IBM Plex Mono 500, 3.7% H, subWhite, labelShadow + 0 0 2px #000, no box, centred, baseline 92% H,
 *  max width 70% W). Hard on/off with the speech. p = { cues: [[text, at (f), to (f)], ...] } (frames relative to the shot). */
export const RSub = {
  name: 'RSub',
  html: (p, ctx) => `<div ${ctx.dev('RSub', p)} style="position:absolute;left:15%;right:15%;bottom:${px(H * 0.08 - 40 * 0.22)};text-align:center;font-family:'IBM Plex Mono';font-weight:500;font-size:40px;line-height:1.15;color:#F2F2F2;text-shadow:0 2px 3px rgba(0,0,0,0.75),0 0 2px #000;opacity:0"></div>`,
  render: function (el, f, p) {
    var c = null;
    for (var i = 0; i < p.cues.length; i++) if (f >= p.cues[i][1] && f < p.cues[i][2]) c = p.cues[i];
    el.style.opacity = c ? '1' : '0';
    el.textContent = c ? c[0] : '';
  },
};

export default [Mv, CFoot, Ramp, Flash, Fade, Scr, Berg, Num, Lbl, Typ, Rng, Spt, Crd, Tag, CPage, PgMv, Mark, CMap, MapMv, Pin, RSub];
