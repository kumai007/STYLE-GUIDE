// coc_v3.mjs - v3 documentary print-board devices (refs/abyssal_detective/STUDY.md sections 2, 3, 6). v7: boards/prints get a 3-D camera (Paper stays 2-D),
// no cyan, no glitch/flash/bounce. Camera curve E = cubic-bezier(0.35,0,0.25,1). Render fns are serialised: use only (el, f, p, G, S).
import { tiltWrap } from './coc.mjs';
const AF = 'af';
// v7 board tilts (3-D parallax camera, cover-checked at 1800 px): plane 6-7 deg in X or Y easing to ~1 deg while the Cam glides/zooms.
// Cycled in build order so no two boards in a row tilt the same way. Board p.tilt overrides (false = flat).
const TILTS = [
  { a: [1.09, 0, 7, 0, 0], b: [1.03, 0, 1, 0, 0] },
  { a: [1.09, 6, 0, 0, 0], b: [1.03, 1, 0, 0, 0] },
  { a: [1.09, 0, -7, 0, 0], b: [1.03, 0, -1, 0, 0] },
  { a: [1.09, -6, 0, 0, 0], b: [1.03, -1, 0, 0, 0] },
  { a: [1.10, 4, -5, 0, 0], b: [1.03, 0.5, -0.5, 0, 0] },
];
let tiltI = 0;
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;
export const GREY = '#C8C8C8', AMBER = '#C89A3C', NAVY = '#1E2126', MARKER = '#E0282A';
const TXT_SHADOW = 'text-shadow:0 2px 14px rgba(0,0,0,0.55),0 1px 2px rgba(0,0,0,0.6)';

/** Tex: master texture layer (overlay window over every non-raw stretch). Grain = feTurbulence re-seeded every 2 f (overlay ~.07),
 *  lifted blacks (screen #141518 -> black ~20), soft vignette (corner/centre ~0.6). p = { fi:[f0,f1], fo:[f0,f1] } opacity ramps. */
export const Tex = {
  name: 'Tex',
  html: (p, ctx) => {
    const id = ctx.id('gr');
    return `<div class="${AF}" ${ctx.dev('Tex', p)} style="pointer-events:none;opacity:0">
<div class="${AF}" style="background:#05070A;mix-blend-mode:screen"></div>
<div class="${AF}" style="background:radial-gradient(ellipse 78% 78% at 50% 48%,rgba(0,0,0,0) 34%,rgba(0,0,0,0.46) 100%)"></div>
<div class="${AF}" style="opacity:0.055;mix-blend-mode:overlay"><svg width="${W}" height="${H}" style="position:absolute;inset:0"><filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="0" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="2.6" intercept="-0.8"/><feFuncG type="linear" slope="2.6" intercept="-0.8"/><feFuncB type="linear" slope="2.6" intercept="-0.8"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="${W}" height="${H}" filter="url(#${id})"/></svg></div></div>`;
  },
  render: function (el, f, p, G, S) {
    var L = function (x) { return x; }, o = 1;
    if (p.fi) o = Math.min(o, G.ease(f, p.fi, [0, 1], L));
    if (p.fo) o = Math.min(o, G.ease(f, p.fo, [1, 0], L));
    // v8 (SMOOTH.md fix 1): wrapper never fractional (a fractional opacity isolates the screen/overlay layers into a near-black
    // sheet that pops when it reaches 1); fade the three layers instead. Fix 4: grain re-seeded every frame at 0.055.
    var c = el.children;
    el.style.opacity = o > 0 ? '1' : '0';
    c[0].style.opacity = o.toFixed(3);
    c[1].style.opacity = o.toFixed(3);
    c[2].style.opacity = (0.055 * o).toFixed(4);
    el.querySelector('feTurbulence').setAttribute('seed', String(S.frame % 97));
  },
};

// ---------------------------------------------------------------- print board
/** one print (photo / footage freeze / page crop). q = { img, x, y, w, h (board px, outer incl. rim), rot (deg), hero, paper (colour page),
 *  still [src, native frame] (instead of img), ox, oy, ow, oh (crop inside the image, image px) + iw, ih, lift (f), slide {at, dx, dy, r0}, seed } */
export function printHtml(q0, ctx) {
  const q = Array.isArray(q0.still) ? { ...q0, img: ctx.still(q0.still[0], q0.still[1]) } : q0; // still: [src, native frame] -> extracted freeze
  const rim = 9, iw = q.w - 2 * rim, ih = q.h - 2 * rim;
  let img;
  if (q.ow) {
    const s = iw / q.ow;
    img = `<img src="${q.img}" alt="" style="position:absolute;left:${px(-q.ox * s)};top:${px(-q.oy * s)};width:${px(q.iw * s)};height:${px(q.ih * s)}">`;
  } else img = `<img src="${q.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`;
  const tone = q.paper ? 'sepia(0.18) contrast(0.95) brightness(0.93)' : 'grayscale(0.4) saturate(1.1) contrast(0.95) brightness(1.02)';
  const hairs = [0, 1, 2].map((k) => {
    const r = (s) => { let h = 0; const t = `${q.seed || q.img}${k}${s}`; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return ((h >>> 0) % 1000) / 1000; };
    const x0 = r('a') * iw, y0 = r('b') * ih, l = 40 + r('c') * 160, a = (r('d') - 0.5) * 1.2;
    return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${(x0 + Math.cos(a) * l).toFixed(1)}" y2="${(y0 + Math.sin(a) * l).toFixed(1)}" stroke="#fff" stroke-width="${(0.6 + r('e')).toFixed(2)}" opacity="${(0.12 + r('f') * 0.12).toFixed(2)}"/>`;
  }).join('');
  const lift = q.lift !== undefined || q.slide ? ctx.dev('Prt', { hero: !!q.hero, lift: q.lift, slide: q.slide, rot: q.rot || 0 }) : '';
  const back = q.hero ? 0 : 1;
  return `<div ${lift} ${q.par ? `data-par="${q.par}"` : ''} style="position:absolute;left:${px(q.x)};top:${px(q.y)};width:${px(q.w)};height:${px(q.h)};transform:rotate(${(q.rot || 0).toFixed(2)}deg)">
<div class="sh" style="position:absolute;inset:0;box-shadow:0 0 28px 6px rgba(0,0,0,0.45),0 10px 30px rgba(0,0,0,0.35)"></div>
<div style="position:absolute;inset:0;background:#D2D0CF"></div>
<div style="position:absolute;left:${rim}px;top:${rim}px;width:${px(iw)};height:${px(ih)};overflow:hidden;background:#222">
<div class="im" style="position:absolute;inset:0;filter:${tone} brightness(${back ? 0.55 : 1})">${img}</div>
<div class="nv" style="position:absolute;inset:0;background:#212429;mix-blend-mode:multiply;opacity:${back ? 0.55 : 0}"></div>
<div style="position:absolute;inset:0;box-shadow:inset 0 0 45px 10px rgba(6,7,9,0.75)"></div>
<svg width="${px(iw)}" height="${px(ih)}" style="position:absolute;inset:0;mix-blend-mode:screen">${hairs}</svg></div></div>`;
}
/** Board: a dark board (navy #182838 or charcoal) of prints, one eased 2-D camera. p = { bw, bh, bg, prints[], cam:[[f, cx, cy, z], ...],
 *  drift:[dx px/s, dy px/s, dz /s] (always on, holds < 1 %/s), fade:{in:[f0,f1], out:[f0,f1]} }. */
export const Board = {
  name: 'Board',
  html: (p, ctx) => {
    const id = ctx.id('bd');
    const bg = p.bg || NAVY;
    const tex = `<svg width="${p.bw}" height="${p.bh}" style="position:absolute;inset:0"><filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0035 0.006" numOctaves="3" seed="7"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="${p.bw}" height="${p.bh}" filter="url(#${id})"/></svg>`;
    const board = `<div ${ctx.dev('Cam', { cam: p.cam, drift: p.drift || [0, 0, 0.004] })} style="position:absolute;left:0;top:0;width:${p.bw}px;height:${p.bh}px;transform-origin:0 0;background:${bg}">
<div style="position:absolute;inset:0;mix-blend-mode:soft-light;opacity:0.55">${tex}</div>
${p.prints.map((q) => printHtml(q, ctx)).join('\n')}</div>`;
    const fade = p.fade ? ctx.dev('Fade3', p.fade) : '';
    const tilt = p.tilt === undefined ? TILTS[tiltI++ % TILTS.length] : p.tilt;
    return `<div class="${AF}" ${fade} style="overflow:hidden;background:#0A0B0D">${tiltWrap(ctx, tilt, board)}<div class="${AF}" style="background:radial-gradient(ellipse 75% 75% at 50% 50%,rgba(0,0,0,0) 40%,rgba(0,0,0,0.62) 100%)"></div></div>`;
  },
};
/** Cam: board camera. Between keyframes eased with E = (0.35,0,0.25,1); a constant slow drift on top; soft blur only at peak speed. */
export const Cam = {
  name: 'Cam',
  render: function (el, f, p, G, S) {
    var E = G.bezier(0.35, 0, 0.25, 1), K = p.cam, c = K[0], i, x = c[1], y = c[2], z = c[3], sp = 0;
    for (i = 0; i < K.length - 1; i++) {
      var a = K[i], b = K[i + 1];
      if (f >= a[0] && f < b[0]) {
        var u = (f - a[0]) / (b[0] - a[0]), k = E(u), k2 = E(Math.min(1, u + 1 / (b[0] - a[0])));
        x = a[1] + (b[1] - a[1]) * k; y = a[2] + (b[2] - a[2]) * k; z = a[3] + (b[3] - a[3]) * k;
        sp = Math.hypot((b[1] - a[1]) * (k2 - k), (b[2] - a[2]) * (k2 - k)) * z;
        break;
      }
      if (f >= b[0]) { x = b[1]; y = b[2]; z = b[3]; }
    }
    // v8: drift eased over the whole shot (S curve, same distance as the old constant drift), no straight linear creep
    var d = p.drift, n = S && S.len ? S.len : 600, t = (n / 60) * G.bezier(0.42, 0, 0.58, 1)(Math.min(1, Math.max(0, f / Math.max(1, n - 1))));
    x += d[0] * t; y += d[1] * t; z *= 1 + d[2] * t;
    // v8 soft parallax: prints marked data-par=k ride k x the camera travel on top of the board (they read as lying above it)
    var P = el.querySelectorAll('[data-par]'), j;
    for (j = 0; j < P.length; j++) { var k3 = +P[j].getAttribute('data-par'); P[j].style.translate = (-(x - c[1]) * k3).toFixed(2) + 'px ' + (-(y - c[2]) * k3).toFixed(2) + 'px'; }
    el.style.transform = 'translate(' + (960 - x * z).toFixed(2) + 'px,' + (540 - y * z).toFixed(2) + 'px) scale(' + z.toFixed(5) + ')';
    var bl = Math.min(2.5, Math.max(0, (sp - 8) * 0.12));
    el.style.filter = bl > 0.15 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
  },
};
/** Prt: print slide-in with settle (54 f, E, no bounce; shadow 0 -> .45 over 24 f) and hero lift (36 f, S: brightness .55 -> 1, navy
 *  multiply .55 -> 0, scale 1 -> 1.03). p = { hero, lift (f), slide {at, dx, dy, r0}, rot }. */
export const Prt = {
  name: 'Prt',
  render: function (el, f, p, G) {
    var E = G.bezier(0.35, 0, 0.25, 1), Sc = G.bezier(0.25, 0.1, 0.25, 1), tx = 0, ty = 0, r = p.rot, sc = 1, sh = 1;
    var ry = 0;
    if (p.slide) {
      // v8: duration n (default 54 f) on a long-settle curve; optional 3-D yaw ry -> 0 (print lands flat on the board)
      var q = G.ease(f, [p.slide.at, p.slide.at + (p.slide.n || 54)], [0, 1], p.slide.n ? G.bezier(0.25, 0.1, 0.15, 1) : E);
      tx = p.slide.dx * (1 - q); ty = p.slide.dy * (1 - q); r = p.slide.r0 + (p.rot - p.slide.r0) * q; ry = (p.slide.ry || 0) * (1 - q);
      sh = G.ease(f, [p.slide.at, p.slide.at + 30], [0, 1], G.bezier(0.42, 0, 0.58, 1));
      el.style.opacity = f < p.slide.at ? '0' : '1';
    }
    if (p.lift !== undefined && p.lift !== null && !p.hero) {
      var l = G.ease(f, [p.lift, p.lift + 36], [0, 1], Sc);
      sc = 1 + 0.03 * l;
      el.querySelector('.im').style.filter = 'grayscale(0.4) saturate(1.1) contrast(0.95) brightness(' + (0.56 + 0.47 * l).toFixed(3) + ')';
      el.querySelector('.nv').style.opacity = (0.55 * (1 - l)).toFixed(3);
    }
    el.querySelector('.sh').style.opacity = sh.toFixed(3);
    el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)' + (ry ? ' perspective(1600px) rotateY(' + ry.toFixed(3) + 'deg)' : '') + ' rotate(' + r.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')';
  },
};
/** Fade3: group opacity. p = { in:[f0,f1], out:[f0,f1] } linear (dissolve/dip style). */
export const Fade3 = {
  name: 'Fade3',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Fade3', p)} style="opacity:0">${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) {
    var L = function (x) { return x; }, o = 1;
    if (p.in) o = Math.min(o, G.ease(f, p.in, [0, 1], L));
    if (p.out) o = Math.min(o, G.ease(f, p.out, [1, 0], L));
    el.style.opacity = o.toFixed(3);
  },
};

// ---------------------------------------------------------------- type
/** WTitle: word-by-word title in light grey (Archivo 800, normal width). Words 12 f apart, 18 f linear fades, block out 36 f.
 *  p = { lines:[{t, size, top, color, track, weight}], at, gap, out (f, block fade start), left (px, else centred), align }. */
export const WTitle = {
  name: 'WTitle',
  html: (p, ctx) => {
    const lines = p.lines.map((l) => `<div style="position:absolute;${p.left !== undefined ? `left:${px(p.left)};text-align:left` : 'left:0;right:0;text-align:center'};top:${px(l.top)};white-space:nowrap;font-family:Archivo;font-weight:${l.weight || 800};font-stretch:100%;font-size:${l.size}px;line-height:1.1;letter-spacing:${l.track ?? 0.02}em;color:${l.color || GREY};${TXT_SHADOW}">${l.t.split(' ').map((w) => `<span class="w" style="opacity:0">${ctx.esc(w)}</span>`).join(' ')}</div>`).join('');
    return `<div class="${AF}" ${ctx.dev('WTitle', { at: p.at || 0, gap: p.gap || 12, fd: p.fd || 18, out: p.out, outN: p.outN || 36 })} style="pointer-events:none">${lines}</div>`;
  },
  render: function (el, f, p, G) {
    var L = function (x) { return x; }, ws = el.querySelectorAll('.w');
    var blk = p.out !== undefined && p.out !== null ? G.ease(f, [p.out, p.out + p.outN], [1, 0], L) : 1;
    for (var i = 0; i < ws.length; i++) ws[i].style.opacity = (G.ease(f, [p.at + i * p.gap, p.at + i * p.gap + p.fd], [0, 1], L) * blk).toFixed(3);
  },
};
/** Count: date / number count-in, characters left to right (gap f apart, 12 f fades), #E8E8E8; block out 36 f. p = { text, at, gap, hold,
 *  left, top, size }. */
export const Count = {
  name: 'Count',
  html: (p, ctx) => `<div ${ctx.dev('Count', { at: p.at, gap: p.gap || 6, hold: p.hold })} style="position:absolute;left:${px(p.left ?? 154)};top:${px(p.top ?? 690)};white-space:pre;font-family:Archivo;font-weight:800;font-stretch:100%;font-size:${p.size || 60}px;letter-spacing:0.03em;color:#E8E8E8;${TXT_SHADOW}">${[...p.text].map((c) => `<span class="c" style="opacity:0">${ctx.esc(c)}</span>`).join('')}</div>`,
  render: function (el, f, p, G) {
    var L = function (x) { return x; }, cs = el.querySelectorAll('.c'), j = 0, n = cs.length;
    var end = p.at + n * p.gap + p.hold, blk = G.ease(f, [end, end + 36], [1, 0], L);
    for (var i = 0; i < n; i++) { cs[i].style.opacity = (G.ease(f, [p.at + j * p.gap, p.at + j * p.gap + 12], [0, 1], L) * blk).toFixed(3); if (cs[i].textContent !== ' ') j++; }
  },
};

// ---------------------------------------------------------------- paper page card
/** paperCrop: Paper's page window (page px) + scale. Default = key lines centred, width lx0-70..lx1+70 (>= 900), s <= 1.18, card <= 880 px.
 *  p.top = [x0, y0, x1, y1] of the rows above the key (page top + headline): taken in full (wider + from the top) when the key still fits
 *  with 24 px below it and its line height stays >= 36 px (or >= the default if that is already below); else only the top edge; else default. */
export function paperCrop(p) {
  const L = p.lines, lx0 = Math.min(...L.map((l) => l[0])), lx1 = Math.max(...L.map((l) => l[2]));
  const ly0 = Math.min(...L.map((l) => l[1])), ly1 = Math.max(...L.map((l) => l[3])), hMin = Math.min(...L.map((l) => l[3] - l[1]));
  const pageH = p.clipB || p.ih;
  const fit = (x0, x1, top) => {
    const s = Math.min(1.18, 1540 / (x1 - x0)), chMax = 880 / s;
    if (top != null) return ly1 + 24 - top > chMax ? null : { x0, x1, y0: top, y1: Math.min(pageH, top + chMax), s };
    let y0 = Math.max(0, (ly0 + ly1) / 2 - chMax / 2); const y1 = Math.min(pageH, y0 + chMax);
    y0 = Math.max(0, y1 - chMax);
    return { x0, x1, y0, y1, s };
  };
  const x0 = Math.max(0, lx0 - 70), x1 = Math.min(p.iw, Math.max(lx1 + 70, x0 + 900)), d = fit(x0, x1, null);
  const T = p.top;
  if (T) {
    const ty = Math.max(0, T[1] - 20), sMin = Math.min(36 / hMin, d.s);
    const a = fit(Math.max(0, Math.min(x0, T[0] - 50)), Math.min(p.iw, Math.max(x1, T[2] + 50)), ty);
    if (a && a.s >= sMin) return a;
    // v9 headFit: real headline above the key -> shrink (not below 0.85 x sMin) so headline + key lines both fit the card
    if (p.headFit) {
      const hx0 = Math.max(0, Math.min(x0, T[0] - 50)), hx1 = Math.min(p.iw, Math.max(x1, T[2] + 50)), need = ly1 + 24 - ty;
      const s2 = Math.min(1.18, 1540 / (hx1 - hx0), 880 / need);
      if (s2 >= sMin * 0.85) return { x0: hx0, x1: hx1, y0: ty, y1: Math.min(pageH, ty + need), s: s2 };
    }
    const b = fit(x0, x1, ty);
    if (b) return b;
  }
  return d;
}
/** v9 paperFrame (owner 2026-11-17 "articles cover the whole video, not like a photo frame"): paperCrop's region widened to 16:9
 *  and scaled to fill 1920x1080 (text scale 0.85..1.5); the page sheet runs M = 15 % past each frame edge so 3-D moves reveal
 *  more page, never an edge. Returns Paper's crop (x0, y0 = page px at the sheet's top-left, s, cw, ch, sheet left/top in frame). */
export function paperFrame(p) {
  const c = paperCrop(p), M = 0.15;
  let w = (c.x1 - c.x0) * 1.16, h = (c.y1 - c.y0) * 1.16; // title-safe margin so moves never push text off frame
  if (w / h > W / H) h = (w * H) / W; else w = (h * W) / H;
  let s = W / w;
  if (s > 1.5) { s = 1.5; w = W / s; h = H / s; }
  if (s < 0.85) { s = 0.85; w = W / s; h = H / s; }
  const cx = (c.x0 + c.x1) / 2, rx0 = Math.max(Math.min(cx - w / 2, p.iw - w), Math.min(0, cx - w / 2));
  const ry0 = p.headFit && p.top ? c.y0 - h * 0.07 : (c.y0 + c.y1) / 2 - h / 2;
  return { x0: rx0 - (M * W) / s, y0: ry0 - (M * H) / s, s, cw: W * (1 + 2 * M), ch: H * (1 + 2 * M), left: -M * W, top: -M * H };
}
/** Paper: real captured page as a paper card on a darkened blurred copy. Lands 0.91 -> 1.0 in 105 f (E) then +0.3 %/s; marker #E0282A .55
 *  multiply sweeps the key lines on the spoken words; text outside the key softened (blur 3 px). p = { img, iw, ih, key, lines, mz,
 *  hold (already landed: eased 2-D re-frame), mark {at, n} | 'full' | null, rot, clipB, top (see paperCrop) }. Blurred layers are grey. */
export const Paper = {
  name: 'Paper',
  html: (p, ctx) => {
    const k = p.key, lx0 = Math.min(...p.lines.map((l) => l[0])), lx1 = Math.max(...p.lines.map((l) => l[2]));
    const ly0 = Math.min(...p.lines.map((l) => l[1])), ly1 = Math.max(...p.lines.map((l) => l[3]));
    const { x0, y0, s, cw, ch, left: cl, top: ct } = paperFrame(p); // v9: full-frame sheet
    const kc = [((lx0 + lx1) / 2 - x0) * s, ((ly0 + ly1) / 2 - y0) * s];
    const pad = 16;
    const img = (st) => `<img src="${p.img}" alt="" style="position:absolute;left:${px(-x0 * s)};top:${px(-y0 * s)};width:${px(p.iw * s)};height:${px(p.ih * s)};${st}">`;
    const sharp = `<div style="position:absolute;left:${px((lx0 - x0) * s - pad)};top:${px((ly0 - y0) * s - pad)};width:${px((lx1 - lx0) * s + 2 * pad)};height:${px((ly1 - ly0) * s + 2 * pad)};overflow:hidden"><div style="position:absolute;left:${px(-(lx0 - x0) * s + pad)};top:${px(-(ly0 - y0) * s + pad)};width:${px(cw)};height:${px(ch)}">${img('')}</div></div>`;
    const names = (p.mz || []).map((m) => `<img src="${m.src}" alt="" style="position:absolute;left:${px((m.x - x0) * s)};top:${px((m.y - y0) * s)};width:${px(m.w * s)};height:${px(m.h * s)}">`).join('');
    const ML = p.markLines || p.lines; // v8: marker may cover only part of the shown lines (C05: the name phrase)
    const tot = ML.reduce((a, l) => a + (l[2] - l[0]), 0) || 1;
    let acc = 0;
    const marks = p.mark ? ML.map((l) => {
      const f0 = acc / tot, f1 = (acc += l[2] - l[0]) / tot;
      const m = p.mark === 'full' ? { at: -2, n: 1, f0: 0, f1: 0.001 } : { at: p.mark.at, n: p.mark.n, f0, f1 };
      return `<div ${ctx.dev('MarkW', m)} style="position:absolute;left:${px((l[0] - x0) * s - 8)};top:${px((l[1] - y0) * s - 6)};width:${px((l[2] - l[0]) * s + 16)};height:${px((l[3] - l[1]) * s + 12)};background:${MARKER};opacity:0.55;mix-blend-mode:multiply;transform-origin:0 50%;transform:scaleX(0)"></div>`;
    }).join('') : '';
    const nid = ctx.id('pn');
    const paperTex = `<svg width="${px(cw)}" height="${px(ch)}" style="position:absolute;inset:0;mix-blend-mode:multiply;opacity:0.10"><filter id="${nid}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="3"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#${nid})"/></svg>`;
    const card = `<div style="position:absolute;left:${px(cl)};top:${px(ct)};width:${px(cw)};height:${px(ch)};background:#fff;overflow:hidden;isolation:isolate">
${img('filter:blur(1.2px) grayscale(1);opacity:0.88')}${sharp}${names}
${p.clipB ? `<div style="position:absolute;left:0;right:0;bottom:0;top:${px((p.clipB - y0) * s)};background:#fff"></div>` : ''}<div style="position:absolute;inset:0;background:#E8E6DE;mix-blend-mode:multiply"></div>${paperTex}${marks}
<div style="position:absolute;inset:0;box-shadow:inset 0 0 70px rgba(70,60,40,0.22)"></div></div>`;
    const ox = cl + kc[0], oy = ct + kc[1];
    const mv = `<div class="${AF}" ${ctx.dev('PaperMv', { hold: !!p.hold, rot: p.rot ?? 0, ox: (ox / W) * 100, oy: (oy / H) * 100, dy: p.hold ? 26 : 0, v: p.v, ty0: 150 })}>${card}</div>`;
    const bg = `<div class="${AF}" ${ctx.dev('PaperMv', { bg: true, hold: !!p.hold, rot: 0, ox: 50, oy: 50, dy: 0, v: p.v })}><div class="${AF}" style="background:url(${p.img}) center/cover;filter:blur(40px) brightness(0.3) grayscale(1);transform:scale(1.15)"></div></div>`;
    return `<div class="${AF}" style="overflow:hidden;background:#0D0E10">${bg}${mv}<div class="${AF}" style="background:radial-gradient(ellipse 75% 72% at 50% 50%,rgba(0,0,0,0) 50%,rgba(0,0,0,0.5) 100%)"></div></div>`;
  },
};
export const PaperMv = {
  name: 'PaperMv',
  // v9 (owner 2026-11-17 "articles also have different animation like 3D pan, zoomed in, zoomed out"): 5 moves cycled by p.v so
  // no two pages in a row move alike, each eased over the whole shot (never stops): 0 tilt-settle (v8 pose -> flat -> past flat),
  // 1 zoom in to the key line, 2 3-D side pan, 3 zoom out from the key line (reveals the page + headline), 4 pan down headline -> key.
  render: function (el, f, p, G, S) {
    var E = G.bezier(0.35, 0, 0.25, 1), len = Math.max(60, (S && S.len) || 300);
    var K = G.bezier(0.42, 0, 0.58, 1)(Math.min(1, Math.max(0, f / (len - 1))));
    var mode = p.v === undefined || p.v === null ? 0 : p.v % 5, a = p.hold ? 0.5 : 1;
    var sc = 1, rx = 0, ry = 0, tx = 0, ty = p.dy ? G.ease(f, [0, 192], [p.dy, 0], E) : 0;
    if (mode === 0) {
      var V = [[0, 5, 46, 0], [4.5, 0, 0, 40], [0, -5, -46, 0], [-3.5, 3.5, 30, -28], [3, -4, -34, 30]], v = V[Math.floor(p.v / 5) % V.length];
      var k = G.ease(f, [0, 600], [0, 1], G.bezier(0.3, 0.05, 0.2, 1)), w = 1 - 1.35 * k;
      sc = (p.hold ? 1 : G.ease(f, [0, 105], [0.91, 1.0], E)) * (1 + 0.008 * f / 60);
      rx = v[0] * a * w; ry = v[1] * a * w; tx = v[2] * a * w; ty += v[3] * a * w;
    } else if (mode === 1) { sc = 0.94 + 0.14 * K; rx = 2.5 * a * (1 - K); }
    else if (mode === 2) { tx = 90 * a * (1 - 2 * K); ry = 4 * a * (1 - 2 * K); sc = 1.0 + 0.03 * K; }
    else if (mode === 3) { sc = 1.13 - 0.15 * K; ry = -3 * a * K; rx = 1.5 * a * K; }
    else { ty += (p.ty0 || 200) * a * (1 - K); rx = 5 * a * (1 - K) - 1.5 * a * K; sc = 1.05 - 0.03 * K; }
    if (p.bg) { tx *= -0.35; ty *= -0.35; rx = 0; ry = 0; sc = 1 + 0.003 * f / 60; }
    el.style.transformOrigin = p.ox.toFixed(2) + '% ' + p.oy.toFixed(2) + '%';
    el.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px)' + (rx || ry ? ' perspective(1800px) rotateX(' + rx.toFixed(4) + 'deg) rotateY(' + ry.toFixed(4) + 'deg)' : '') + ' rotate(' + p.rot.toFixed(3) + 'deg) scale(' + sc.toFixed(5) + ')';
  },
};
/** MarkW: one marker line; the sweep runs f in [at, at+n] (linear), this line owns [f0, f1] of it (by line width). */
export const MarkW = {
  name: 'MarkW',
  render: function (el, f, p) {
    var u = (f - p.at) / Math.max(1, p.n), v = Math.min(1, Math.max(0, (u - p.f0) / Math.max(1e-4, p.f1 - p.f0)));
    el.style.transform = 'scaleX(' + v.toFixed(4) + ')';
  },
};

// ---------------------------------------------------------------- B&W freeze print
/** FzPrint: footage plays to the freeze frame, then 24 f dissolve into the same frame as a B&W print (rim, burn, shadow) at 80 % on a
 *  darkened blurred copy; push +0.4 %/s. p = { still (url | [src, native frame]), sw, sh (still px), foot (CFoot params of the playing footage) | video (html) | none, at (f of the
 *  dissolve), rot }. */
export const FzPrint = {
  name: 'FzPrint',
  html: (p0, ctx) => {
    const p = Array.isArray(p0.still) ? { ...p0, still: ctx.still(p0.still[0], p0.still[1]) } : p0;
    const ar = p.sw / p.sh, ph = Math.min(H * 0.78, (W * 0.74) / ar), pw = ph * ar;
    const q = { img: p.still, x: (W - pw - 18) / 2, y: (H - ph - 18) / 2, w: pw + 18, h: ph + 18, rot: p.rot ?? -1.6, hero: true, seed: p.still };
    const back = `<div class="${AF}" style="background:url(${p.still}) center/cover;filter:blur(40px) brightness(0.35) saturate(0.6) grayscale(0.6);transform:scale(1.15)"></div>`;
    const print = `<div class="${AF}" ${ctx.dev('FzMv', { ry: (p.rot ?? -1.6) > 0 ? -6 : 6 })}>${printHtml(q, ctx)}</div>`;
    const freeze = `<div class="${AF}" ${ctx.dev('Fade3', { in: [p.at, p.at + 24] })} style="opacity:0;background:#0B0C0E">${back}${print}</div>`;
    return `<div class="${AF}" style="overflow:hidden;background:#050607">${p.foot ? ctx.node({ d: 'CFoot', p: p.foot }) : p.video || ''}${freeze}</div>`;
  },
};
// v7: the print floats in 3-D: lands from 1.04 while its plane turns from p.ry (default 6) deg toward ~1 deg over the shot (S curve),
// slight X pitch, slow push; the blurred copy behind stays flat (parallax).
export const FzMv = {
  name: 'FzMv',
  render: function (el, f, p, G, S) {
    var E = G.bezier(0.35, 0, 0.25, 1), k = G.ease(f, [0, Math.max(1, S.len - 1)], [0, 1], G.bezier(0.42, 0, 0.58, 1)), ry = p.ry === undefined ? 6 : p.ry;
    var s = G.ease(f, [0, 40], [1.04, 1.0], E) * (1 + 0.004 * f / 60);
    var tx = (ry > 0 ? 1 : -1) * 22 * (1 - k);
    el.style.transform = 'translateX(' + tx.toFixed(2) + 'px) perspective(1800px) rotateX(' + (2.5 - 2 * k).toFixed(4) + 'deg) rotateY(' + (ry * (1 - 0.85 * k)).toFixed(4) + 'deg) scale(' + s.toFixed(5) + ')';
  },
};

/** Black: plain black (dip / black beat). */
export const Black = { name: 'Black', html: () => `<div class="${AF}" style="background:#000"></div>` };

export default [Tex, Board, Cam, Prt, Fade3, WTitle, Count, Paper, PaperMv, MarkW, FzPrint, FzMv, Black];
