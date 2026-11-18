// Intro devices (ports of engine/src/devices/V8Devices.tsx as used by Intro.tsx; V5 Grain, V6 DeepWater, Motion Move).
// Contract: see devices/shared.mjs header. render() is serialised: use only its args (G = GX, S = shot info).
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { Vignette } from './shared.mjs';

const AF = 'af';
const GX = createRequire(import.meta.url)('../lib/gx.js');
const MEDIA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'media', 'intro');
const CURSOR = '#A51F20'; // tokens C.cursor
const BLACK = '#050607'; // tokens C.black
const jit = (q, seed, amp) => (GX.random(`${seed}${q}`) - 0.5) * 2 * amp;
const svg0 = (body) => `<svg width="0" height="0" style="position:absolute">${body}</svg>`;
const MASK = (g) => `-webkit-mask-image:${g};mask-image:${g}`;

/** first frame f with f/60 >= x (Remotion `t >= x` with t = f/60). */
export const ff = (x) => { let f = Math.max(0, Math.floor(x * 60) - 1); while (f / 60 < x) f++; return f; };

const nFrames = {};
const frames = (src) => (nFrames[src] ??= Math.round(60 * +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, `${src}.mp4`)]).toString().trim()));

/** OffthreadVideo (muted) at local frames of ctx.win; media frame at local f = round(trim*60) + (f - off)*speed.
 *  Past the clip end Remotion shows the last frame -> shared Clip still (shown for f > last). */
const vid = (ctx, { src, trim = 0, speed = 1, off = 0 }) => {
  const N = frames(src), t0 = Math.round(trim * 60) - off * speed;
  const last = Math.floor((N - 1 - t0) / speed);
  let out = ctx.video({ src, trim: t0 / 60, speed, maxFrame: last });
  if (ctx.win[1] - 1 > last) out += `<img ${ctx.dev('Clip', { last })} src="${ctx.still(src, N - 1)}" style="position:absolute;inset:0;width:100%;height:100%;display:none" alt="">`;
  return out;
};

// ---------- LooksV8Defs (only the filters a node uses; unique ids so a hidden shot never owns a live def) ----------
const LOOK = {
  pink: (id) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.15 0.25 0.10 0 0.01  0.06 0.78 0.06 0 0  0.22 0.12 0.92 0 0.01  0 0 0 1 0"/><feComponentTransfer><feFuncR type="gamma" amplitude="1.3" exponent="1.15" offset="-0.02"/><feFuncG type="gamma" amplitude="1.1" exponent="1.35" offset="-0.02"/><feFuncB type="gamma" amplitude="1.2" exponent="1.2" offset="-0.02"/></feComponentTransfer></filter>`,
  thr: (id) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0.03 0.5 0.93 1 1"/><feFuncG type="table" tableValues="0.02 0.2 0.52 0.84 0.97"/><feFuncB type="table" tableValues="0.01 0.03 0.06 0.2 0.66"/></feComponentTransfer></filter>`,
  hl: (id) => `<filter id="${id}" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="table" tableValues="0 0.25 0.5 0.7 0.82"/><feFuncG type="table" tableValues="0 0.25 0.5 0.7 0.82"/><feFuncB type="table" tableValues="0 0.25 0.5 0.71 0.84"/></feComponentTransfer></filter>`,
  blue: (id) => `<filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0 0.06 0.3 0.62 0.85"/><feFuncG type="table" tableValues="0.02 0.2 0.55 0.85 0.97"/><feFuncB type="table" tableValues="0.05 0.3 0.68 0.92 1"/></feComponentTransfer></filter>`,
};
const lookOf = (look, ctx) => {
  if (look === 'pink') { const id = ctx.id('pk'); return { svg: svg0(LOOK.pink(id)), lf: `url(#${id})` }; }
  if (look === 'thr') { const id = ctx.id('th'); return { svg: svg0(LOOK.thr(id)), lf: `url(#${id}) contrast(1.08)` }; }
  if (look === 'day') { const id = ctx.id('hl'); return { svg: svg0(LOOK.hl(id)), lf: `contrast(1.1) saturate(1.12) url(#${id})` }; }
  if (look === 'punch') return { svg: '', lf: 'contrast(1.16) saturate(1.12)' };
  if (look === 'red') return { svg: '', lf: 'contrast(1.2) saturate(1.3)' };
  return { svg: '', lf: undefined };
};

/** V5 Grain: overlay fractal noise, seed = floor(useF/2) % 97 with useF = frame/2 (shot-local, minus `off`). */
const grainHtml = (ctx, o, off = 0) => {
  const id = ctx.id('gr');
  return `<div class="${AF}" ${ctx.dev('Grain8', { off })} style="pointer-events:none;opacity:${o};mix-blend-mode:overlay"><svg width="100%" height="100%"><filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="0"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${id})"/></svg></div>`;
};
export const Grain8 = {
  name: 'Grain8',
  html: (p, ctx) => grainHtml(ctx, p.o ?? 0.09, p.off ?? 0),
  render: function (el, f, p) { el.querySelector('feTurbulence').setAttribute('seed', String(Math.floor(((f - p.off) * 30) / 60 / 2) % 97)); },
};

/** Motion Move with explicit dur and a time offset `off` (SeqShift). */
export const M8 = {
  name: 'M8',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('M8', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p, G) { el.style.transform = G.moveCss(p.kind, (f - p.off) / 60 / p.dur, p.dur, { rate: p.rate, deg: p.deg }); },
};

/** Show children only for shot-local frames [a, b). */
export const Win = {
  name: 'Win',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Win', p)}>${ctx.kids(node)}</div>`,
  render: function (el, f, p) { el.style.display = f >= p.a && f < p.b ? '' : 'none'; },
};

/** FootV8: eased move, ref look, optional bloom copy, vignette, grain (blurs/sol not used by the intro). */
export const F8 = {
  name: 'F8',
  html: (p, ctx) => {
    const { src, dur = ctx.dur, rate = 0.012, base = 1, origin, look = 'none', trim = 0, speed = 1, vig = 0.5, grain = 0, bloom = 0, pos, mv = 'push', deg, off = 0 } = p;
    const tr = `${pos ? `translate(${pos[0]}%, ${pos[1]}%) ` : ''}scale(${base})`;
    const o = origin ?? '50% 50%';
    const L = lookOf(look, ctx);
    let inner = `<div class="${AF}" style="transform:${tr};transform-origin:${o}${L.lf ? `;filter:${L.lf}` : ''}">${vid(ctx, { src, trim, speed, off })}</div>`;
    if (bloom > 0) inner += `<div class="${AF}" style="filter:blur(10px) ${L.lf ?? ''};opacity:${bloom};mix-blend-mode:screen;transform:${tr};transform-origin:${o}">${vid(ctx, { src, trim, speed, off })}</div>`;
    const mvP = { kind: mv, rate, deg, dur: Math.max(0.1, dur), off };
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${L.svg}<div class="${AF}" ${ctx.dev('M8', mvP)} style="transform-origin:${mv.startsWith('tilt') ? '50% 50%' : o}">${inner}</div>${vig > 0 ? Vignette.html({ k: vig }) : ''}${grain > 0 ? grainHtml(ctx, grain, off) : ''}</div>`;
  },
};

/** HUR: natural fireball (punch) until `swap` s, then the threshold replay (0.5x, thr look, bloom) from SeqShift(round(swap*60)). */
export const Hur = {
  name: 'Hur',
  html: (p, ctx) => {
    const S = Math.round(p.swap * 60), A = ff(p.swap), [w0, w1] = ctx.win, dur = ctx.dur;
    const nat = ctx.node({ d: 'F8', p: { src: p.nat, dur: p.swap, rate: 0.02, look: 'punch', vig: 0.45 } }, [w0, Math.min(w1, A)]);
    const thr = ctx.node({ d: 'F8', p: { src: p.thr, dur: dur - p.swap, rate: 0.03, speed: 0.5, look: 'thr', vig: 0.55, bloom: 0.35, off: S } }, [Math.max(w0, A), w1]);
    return `<div class="${AF}"><div class="${AF}" ${ctx.dev('Win', { a: 0, b: A })}>${nat}</div><div class="${AF}" ${ctx.dev('Win', { a: A, b: 1e9 })}>${thr}</div></div>`;
  },
};

/** SPX: natural block, red mono flash [redFrom, redTo) s, exposure ramp (E.exitIn) into it, eased push 0.025/s at 45% 40%. */
export const Spx = {
  name: 'Spx',
  html: (p, ctx) => {
    const a = ff(p.redFrom), b = ff(p.redTo), [w0, w1] = ctx.win;
    const redV = ctx.node({ d: 'VidN', p: { src: p.red } }, [Math.max(w0, a), Math.min(w1, b)]);
    return `<div class="${AF}" ${ctx.dev('Spx', { a, b, rf: p.redFrom })} style="overflow:hidden;background-color:${BLACK}"><div class="${AF}" style="transform-origin:45% 40%"><div class="${AF}">${vid(ctx, { src: p.nat })}</div><div class="${AF}" style="display:none">${redV}</div></div>${Vignette.html({ k: 0.45 })}${Vignette.html({ k: 0.6 })}${grainHtml(ctx, 0.12)}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, red = f >= p.a && f < p.b, c = el.children;
    var b = G.interpolate(t, [p.rf - 0.14, p.rf], [1, 1.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.bezier(0.55, 0, 1, 0.45) });
    var dur = Math.max(0.1, S.dur), s = 1 + 0.025 * dur * G.drift(t / dur);
    c[0].style.transform = 'scale(' + s + ')';
    c[0].style.filter = red ? 'contrast(1.25)' : 'contrast(1.14) saturate(1.1) brightness(' + (t < p.rf ? b : 1) + ')';
    c[0].children[0].style.display = red ? 'none' : '';
    c[0].children[1].style.display = red ? '' : 'none';
    c[1].style.display = red ? 'none' : '';
    c[2].style.display = red ? '' : 'none';
    c[3].style.display = red ? 'none' : '';
  },
};

/** Bare muted video (with last-frame hold) for ctx.win. */
export const VidN = { name: 'VidN', html: (p, ctx) => vid(ctx, p) };

/** LocV8: centred VT323 caps typed at 20 chars/s from `at` s, red block cursor while typing. */
export const Loc = {
  name: 'Loc',
  html: (p, ctx) => `<div ${ctx.dev('Loc', { at: p.at, text: p.text })} style="display:none;position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-family:'VT323';font-size:128px;line-height:1;letter-spacing:0.02em;color:#F2F2F2;white-space:pre;-webkit-text-stroke:2.5px #F2F2F2;text-shadow:3px 0 #000, -3px 0 #000, 0 3px #000, 0 -3px #000, 3px 3px #000, -3px 3px #000, 3px -3px #000, -3px -3px #000, -4px 0 rgba(255,40,40,0.45), 4px 0 rgba(60,150,255,0.45), 0 4px 10px rgba(0,0,0,0.8)"><span></span><span style="visibility:hidden"></span><span style="display:inline-block;width:0.4em;height:0.62em;background-color:${CURSOR};margin-left:0.06em;vertical-align:-0.02em"></span></div>`,
  render: function (el, f, p) {
    var t = f / 60;
    if (t < p.at) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    var L = p.text.length, n = Math.min(L, Math.floor((t - p.at) * 20) + 1), on = n < L || Math.floor((t - p.at) * 2.5) % 2 === 0;
    el.children[0].textContent = p.text.slice(0, n);
    el.children[1].textContent = p.text.slice(n);
    el.children[2].style.visibility = on && n < L ? 'visible' : 'hidden';
  },
};

/** RGB slab burst (ref rgb_slab_burst): 5 screen-blended bars, new state every 2 f (q = floor(t*30), t = shot-local s).
 *  p.n: shown only for f < n (SlabIn hard cut, n = 6). */
const SLAB_COLS = ['#11a334', '#2338d0', '#a4209f', '#1aa6c9'];
export const RgbSlab = {
  name: 'RgbSlab',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('RgbSlab', p)} style="mix-blend-mode:screen">${[0, 1, 2, 3, 4].map((k) => `<div style="position:absolute;width:108%;background-color:${SLAB_COLS[k % 4]};opacity:0.75"></div>`).join('')}</div>`,
  render: function (el, f, p, G) {
    if (p.n && f >= p.n) { el.style.display = 'none'; return; }
    el.style.display = '';
    var t = f / 60, q = Math.floor(t * 30), R = G.random, s = p.seed;
    for (var k = 0; k < 5; k++) {
      var d = el.children[k];
      d.style.left = (R(s + 'l' + k + q) - 0.5) * 2 * 6 + '%';
      d.style.top = R(s + 't' + q + k) * 88 + '%';
      d.style.height = 3 + R(s + 'h' + q + k) * 9 + '%';
    }
  },
};

/** RoadOutV8: footage until burstAt, then 8 torn row copies thinning out + RgbSlab 'ro' (burst into black). */
export const RoadOut = {
  name: 'RoadOut',
  html: (p, ctx) => {
    const { src, burstAt, look = 'thr' } = p, dur = ctx.dur, b0 = ff(burstAt), [w0, w1] = ctx.win;
    const pre = ctx.node({ d: 'F8', p: { src, dur, rate: 0.025, look, vig: 0.55, bloom: look === 'thr' ? 0.35 : 0 } }, [w0, Math.min(w1, b0)]);
    const pw = [Math.max(w0, b0), w1];
    const bands = Array.from({ length: 8 }, (_, k) => `<div class="${AF}" style="clip-path:inset(${k * 12.5}% 0 ${100 - (k + 1) * 12.5}% 0)">${ctx.node({ d: 'F8', p: { src, dur, rate: 0.025, look, vig: 0 } }, pw)}</div>`).join('');
    return `<div class="${AF}" ${ctx.dev('RoadOut', { b0, burstAt, dur })} style="background-color:#000"><div class="${AF}">${pre}</div><div class="${AF}" style="display:none">${bands}${ctx.node({ d: 'RgbSlab', p: { seed: 'ro' } }, pw)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, b = t >= p.burstAt, c = el.children;
    c[0].style.display = b ? 'none' : '';
    c[1].style.display = b ? '' : 'none';
    if (!b) return;
    var pp = G.interpolate(t, [p.burstAt, p.dur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), q = Math.floor(t * 30), R = G.random;
    for (var k = 0; k < 8; k++) {
      var d = c[1].children[k], show = R('ro' + q + k) > pp * 0.85;
      d.style.display = show ? '' : 'none';
      d.style.transform = 'translateX(' + (R('rx' + k + q) - 0.5) * 2 * 80 + 'px)';
    }
  },
};

// ---------- WARNING (0-4.10): red blob + "VIEWERS DISCRETION IS ADVISED", tear at 2.3, blue slab field + "DISTURBING FOOTAGE" ----------
const WARN_FS = 76, WARN_LS = 0.105, SLAB_FS = 150, SLAB_LS = 0.0;

const blobHtml = (ctx) => {
  const bd = ctx.id('bd'), sm = ctx.id('sm'), bk = ctx.id('bk');
  const img = `<img src="assets/media/v8_redberg.png" style="position:absolute;left:0;top:0;width:1920px;height:1080px;filter:url(#${bd}) saturate(1.15) hue-rotate(-16deg) contrast(1.75) brightness(0.88)" alt="">`;
  const rows = [0, 1, 2, 3, 4, 5, 6].map((k) => `<div class="${AF}" style="clip-path:inset(${8 + k * 5}% 0 ${100 - 8 - (k + 1) * 5}% 0)">${img}</div>`).join('');
  const speckle = `<div class="${AF}" style="clip-path:inset(8% 27% 60% 27%);mix-blend-mode:multiply;opacity:0.85"><svg width="100%" height="100%"><filter id="${bk}"><feTurbulence type="fractalNoise" baseFrequency="0.35 0.6" numOctaves="2" seed="0"/><feColorMatrix type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.02  0 0 0 0 0.02  0 0 0 -2.2 1.6"/></filter><rect width="100%" height="100%" fill="#fff" filter="url(#${bk})"/></svg></div>`;
  const g = 'linear-gradient(180deg, #000 0%, rgba(0,0,0,0.75) 55%, transparent 100%)';
  const smear = `<div style="position:absolute;left:35.5%;width:29%;top:48%;height:49%;overflow:hidden;${MASK(g)}">${Array.from({ length: 12 }, (_, k) => `<div style="position:absolute;left:0;right:0;top:${k * 8.4}%;height:8.4%;overflow:hidden"><div style="position:absolute;left:-55%;width:210%;top:${-k * 100}%;height:1190%;filter:url(#${sm})"><img src="assets/media/v6b_redblob.png" style="width:100%;height:100%;transform:scaleY(-1.2);opacity:0.9" alt=""></div></div>`).join('')}</div>`;
  const defs = svg0(`<filter id="${bd}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="3" seed="0" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="14" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="${sm}" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="16 1.5"/><feColorMatrix type="matrix" values="1.6 0.2 0 0 0  0.05 0.08 0 0 0  0 0.02 0.05 0 0  0 0 0 1 0"/></filter>`);
  return `<div class="${AF}" ${ctx.dev('Blob', {})} style="opacity:0">${defs}${rows}${speckle}${smear}<div class="${AF}" style="background-image:repeating-linear-gradient(0deg, rgba(0,0,0,0.42) 0 2px, transparent 2px 4px)"></div></div>`;
};
export const Blob = {
  name: 'Blob',
  render: function (el, f, p, G) {
    var t = f / 60, q = Math.floor(t * 20), R = G.random, c = el.children;
    el.style.opacity = G.interpolate(t, [0.1, 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE }) * (q % 9 === 4 ? 0.8 : 1);
    var tb = el.querySelectorAll('feTurbulence');
    tb[0].setAttribute('seed', String(q % 23));
    tb[1].setAttribute('seed', String(q % 23));
    for (var k = 0; k < 7; k++) c[1 + k].style.transform = 'translateX(' + (R('bl' + k + q) - 0.5) * 2 * (k === 4 ? 10 : 3) + 'px)';
    var sm = c[9].children;
    for (k = 0; k < 12; k++) sm[k].style.transform = 'translateX(' + (R('sm' + k + q) - 0.5) * 2 * 22 + 'px)';
  },
};

const warnLine = `<div style="position:absolute;left:0;right:0;top:49.6%;transform:translate(0px, -50%);text-align:center;font-family:'Share Tech Mono';font-size:${WARN_FS}px;letter-spacing:${WARN_LS}em;white-space:pre;color:#C9CDCD;line-height:1;padding-left:${WARN_LS}em;text-shadow:-1.5px 0 rgba(255,40,40,0.35), 1.5px 0 rgba(60,150,255,0.35), 0 0 6px rgba(255,255,255,0.12)">VIEWERS <span style="color:#D8201C;text-shadow:0 0 6px rgba(255,30,20,0.45)">DISCRETION</span> IS ADVISED</div>`;

/** SlabField (ref blue_slice_glitch): 22 torn strips of the picture (blue look), tear noise, pixel noise, cyan bars, scanlines, text. */
const slabHtml = (ctx, still, text) => {
  const blue = ctx.id('blue'), tn = ctx.id('tn'), tt = ctx.id('tt'), pn = ctx.id('pn');
  const strips = Array.from({ length: 22 }, (_, k) => { const top = k * 3.4, h = 3.4; return `<div class="${AF}" style="clip-path:inset(${top}% 0 ${100 - top - h}% 0)"><img src="${still}" style="width:100%;height:100%;transform:scale(1.15)" alt=""></div>`; }).join('');
  const g1 = 'linear-gradient(180deg, #000 0%, #000 42%, transparent 60%)', g2 = 'linear-gradient(180deg, #000 0%, #000 38%, transparent 46%)';
  const n1 = `<div class="${AF}" style="mix-blend-mode:overlay;opacity:0.85;${MASK(g1)}"><svg width="100%" height="100%"><filter id="${tn}"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.55" numOctaves="2" seed="0"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${tn})"/></svg></div>`;
  const n2 = `<div class="${AF}" style="mix-blend-mode:hard-light;opacity:0.6;${MASK(g2)}"><svg width="100%" height="100%"><filter id="${tt}"><feTurbulence type="turbulence" baseFrequency="0.0015 0.9" numOctaves="3" seed="0"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="discrete" tableValues="0.1 0.35 0.5 0.8"/><feFuncG type="discrete" tableValues="0.12 0.4 0.55 0.85"/><feFuncB type="discrete" tableValues="0.15 0.45 0.6 0.9"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#${tt})"/></svg></div>`;
  const pix = `<div class="${AF}" style="mix-blend-mode:screen"><svg width="100%" height="100%"><filter id="${pn}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="0"/><feComponentTransfer><feFuncA type="discrete" tableValues="0 0 0 1"/></feComponentTransfer></filter><rect width="100%" height="100%" fill="rgba(170,230,255,0.32)" filter="url(#${pn})"/></svg></div>`;
  const cyan = `<div style="position:absolute;left:0%;right:4%;top:27.5%;height:2.4%;background-color:#3AA6EA;opacity:0.85"></div>`;
  const bars = Array.from({ length: 9 }, (_, k) => `<div style="position:absolute;background-color:${k % 3 === 0 ? '#3FB4FF' : '#1C7FD8'};opacity:0.95"></div>`).join('');
  const blk = `<div style="position:absolute;left:0;width:4%;top:6%;height:30%;background-color:#000"></div>`;
  const scan = `<div class="${AF}" style="background-image:repeating-linear-gradient(0deg, rgba(0,0,0,0.3) 0 2px, transparent 2px 4px)"></div>`;
  const tx = text ? `<div style="position:absolute;left:0;right:0;top:50%;transform:translate(0px, -50%);text-align:center;font-family:'Share Tech Mono';font-size:${SLAB_FS}px;letter-spacing:${SLAB_LS}em;padding-left:${SLAB_LS}em;line-height:1;white-space:pre;color:#DDF8FF;-webkit-text-stroke:2px #CFF4FF;text-shadow:-3px 0 rgba(255,60,120,0.35), 3px 0 rgba(60,220,255,0.6), 0 0 10px rgba(120,225,255,0.95), 0 0 26px rgba(60,190,255,0.9), 0 0 60px rgba(40,150,255,0.6)">DISTURBING FOOTAGE</div>` : '';
  return `<div class="${AF}" ${ctx.dev('Slab', { text, blue })} style="background-color:#02070d;overflow:hidden">${svg0(LOOK.blue(blue))}${strips}${n1}${n2}${pix}${cyan}${bars}${blk}${scan}${tx}</div>`;
};
export const Slab = {
  name: 'Slab',
  render: function (el, f, p, G) {
    var t = f / 60, q = Math.floor(t * 20), R = G.random, c = el.children, k;
    for (k = 0; k < 22; k++) {
      var top = k * 3.4, amp = top < 40 ? (k % 2 ? 160 : 70) : k % 3 === 1 ? 110 : 30;
      var off = (R('sx' + k + q) - 0.5) * 2 * amp, dark = R('sd' + q + k) < 0.2, band = top < 40 ? 1.05 : top < 70 ? 0.3 : 0.18;
      c[1 + k].style.transform = 'translateX(' + off + 'px)';
      c[1 + k].style.filter = 'url(#' + p.blue + ') contrast(1.15) brightness(' + (dark ? 0.45 : 1) * band + ')';
    }
    c[23].querySelector('feTurbulence').setAttribute('seed', String(q % 17));
    c[24].querySelector('feTurbulence').setAttribute('seed', String((q * 7) % 17));
    c[25].querySelector('feTurbulence').setAttribute('seed', String(q % 50));
    c[26].style.right = 4 + (R('tb' + q) - 0.5) * 2 * 3 + '%';
    for (k = 0; k < 9; k++) {
      var b = c[27 + k];
      b.style.top = 75 + k * 2.8 + '%';
      b.style.height = 1.2 + R('bh' + q + k) * 1.8 + '%';
      b.style.left = (R('bl' + q + k) < 0.5 ? 0 : R('bL' + q + k) * 40) + '%';
      b.style.right = R('br' + q + k) * 30 + '%';
    }
    if (p.text) {
      var tx = c[38];
      tx.style.display = t < 3.85 + 0.05 ? '' : 'none';
      tx.style.transform = 'translate(' + (R('dt' + q) - 0.5) * 2 * 4 + 'px, -50%)';
    }
  },
};

/** WarningV8: black < 0.1 s; warning (blob + line) < T_TEAR; + 7 growing slab-field tear bands < T_SLAB; then the slab field.
 *  pic = RUS at trimBefore 120: every visible frame is past the clip end -> the clip's last frame (still). */
export const Warn = {
  name: 'Warn',
  html: (p, ctx) => {
    const N = frames(p.pic), still = ctx.still(p.pic, N - 1);
    if (120 + 2.3 * 60 < N) throw new Error('Warn: picture no longer past the clip end; port the moving strips');
    const bands = Array.from({ length: 7 }, () => `<div class="${AF}">${slabHtml(ctx, still, false)}</div>`).join('');
    const warn = `<div class="${AF}" style="background-color:#020202">${blobHtml(ctx)}${warnLine}</div>`;
    return `<div class="${AF}" ${ctx.dev('Warn', {})}><div class="${AF}" style="background-color:#000"></div><div class="${AF}" style="display:none">${warn}<div class="${AF}">${bands}</div></div><div class="${AF}" style="display:none">${slabHtml(ctx, still, true)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, c = el.children, R = G.random, k;
    c[0].style.display = t < 0.1 ? '' : 'none';
    c[1].style.display = t >= 0.1 && t < 2.5 ? '' : 'none';
    c[2].style.display = t >= 2.5 ? '' : 'none';
    if (t < 0.1 || t >= 2.5) return;
    var q15 = Math.floor(t * 15);
    c[1].children[0].children[1].style.transform = 'translate(' + (R('wl' + q15) - 0.5) * 2 * 1.5 + 'px, -50%)';
    var tear = c[1].children[1];
    tear.style.display = t >= 2.3 ? '' : 'none';
    if (t < 2.3) return;
    var q = Math.floor(t * 30), pp = (t - 2.3) / (2.5 - 2.3);
    for (k = 0; k < 7; k++) {
      var top = R('tr' + q + k) * 92, h = 3 + R('th' + q + k) * (6 + 14 * pp), b = tear.children[k];
      b.style.clipPath = 'inset(' + top + '% 0 ' + Math.max(0, 100 - top - h) + '% 0)';
      b.style.transform = 'translateX(' + (R('to' + k + q) - 0.5) * 2 * 70 + 'px)';
    }
  },
};

// ---------- CASE LIST: 20 names, 10 bands x 2 (long left, short right), 9 white rules with RGB fringe, over DeepWater ----------
const NAMES20 = ['“I’m Jesus”', 'The road that swallowed a car', 'The Sun Prairie blast', 'Armed men on a back road', 'The Prisoner Who Took the Wheel', 'The Voice in the Trunk', 'Red Light on 87th Street', 'I Love You, Brother', 'Five Seconds on Myrtle Drive', 'The Cruiser That Stopped the Gunman', 'Half a Bus Over the River', 'The 3 a.m. Uber Ride', 'The Dead Wire That Wasn’t', 'The Runaway 809A', 'The Truck That Came Through the Living Room', 'The checkpoint in the pines', 'Headlights in the wrong lane', 'Into the woods', 'Bumped and shaken down', 'The roadside grab'];
const PAIRS = (() => {
  const s = [...NAMES20].sort((a, b) => b.length - a.length);
  const out = [];
  for (let i = 0; i < 10; i++) out.push([s[i], s[19 - i]]);
  return out.sort((a, b) => GX.random(`pp${a[0]}`) - GX.random(`pp${b[0]}`));
})();
export const DW = {
  name: 'DW',
  render: function (el, f) { el.setAttribute('x', String(-40 + ((f * 30) / 60) * 0.6)); },
};
export const List = {
  name: 'List',
  html: (p, ctx) => {
    const dw = ctx.id('dw');
    const deep = `<div class="${AF}" style="background-color:#06171c"><svg width="100%" height="100%" style="position:absolute;inset:0"><filter id="${dw}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.0032 0.006" numOctaves="4" seed="11"/><feColorMatrix type="matrix" values="0.04 0 0 0 0.01  0.16 0 0 0 0.05  0.22 0 0 0 0.07  0 0 0 0 1"/></filter><rect ${ctx.dev('DW', {})} x="-40" y="-30" width="2100" height="1200" filter="url(#${dw})"/></svg>${Vignette.html({ k: 0.55 })}</div>`;
    const face = `position:absolute;font-family:'Courier Prime';font-weight:700;font-size:46px;line-height:1;color:#F4F7F7;white-space:pre;text-shadow:0 2px 3px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.7), -1px 0 rgba(255,40,40,0.4), 1px 0 rgba(40,140,255,0.4);display:none`;
    const rules = Array.from({ length: 9 }, (_, k) => `<div style="position:absolute;left:0;right:0;top:${(k + 1) * 10}%;height:3px;background-color:#FFFFFF;box-shadow:0 -2px 0 rgba(255,40,40,0.6), 0 2px 0 rgba(40,120,255,0.6), 0 0 6px rgba(255,255,255,0.35)"></div>`).join('');
    const names = PAIRS.map(([a, b], i) => `<div style="${face};left:3%;top:${i * 10 + 5}%">${ctx.esc(a)}</div><div style="${face};right:3%;top:${i * 10 + 5}%">${ctx.esc(b)}</div>`).join('');
    const ap = PAIRS.map((_, i) => (1 + Math.floor(GX.random(`a8${i}`) * 9)) / 30);
    const list = `<div class="${AF}" ${ctx.dev('List', { ap })}>${rules}${names}</div>`;
    return `<div class="${AF}" style="background-color:${BLACK};overflow:hidden">${deep}${ctx.node({ d: 'Move', p: { kind: 'tiltUp', deg: 2.5, rate: 0.012 }, k: [{ raw: list }] })}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, q = Math.floor(t * 30), R = G.random, c = el.children;
    var sk = t >= 1.33 && t < 1.47 ? [3, -4, 2.5, -2][Math.min(3, Math.floor((t - 1.33) * 30))] : 0;
    el.style.transform = 'skewX(' + sk + 'deg) translateX(' + sk * 3 + 'px)';
    for (var i = 0; i < 10; i++) {
      var a = c[9 + 2 * i], b = c[10 + 2 * i], on = t >= p.ap[i];
      a.style.display = b.style.display = on ? 'block' : 'none';
      if (!on) continue;
      a.style.transform = 'translate(' + (R('na' + i + q) - 0.5) * 2 * 0.6 + 'px, -50%)';
      b.style.transform = 'translate(' + (R('nb' + i + q) - 0.5) * 2 * 0.6 + 'px, -50%)';
    }
  },
};

// ---------- TITLE: typewriter (Special Elite) over the berg, eased push, rough displacement, grain ----------
export const Title = {
  name: 'Title',
  html: (p, ctx) => {
    const rough = ctx.id('rough');
    const face = (fs, sw) => `font-family:'Special Elite';font-size:${fs}px;line-height:1;white-space:pre;color:#FFFFFF;-webkit-text-stroke:${sw}px #FFFFFF;text-shadow:0 0 6px rgba(255,255,255,0.35), 0 4px 12px rgba(0,0,0,0.6)`;
    const cur = `<span style="display:none;width:0.5em;height:0.72em;background-color:${CURSOR};margin-left:0.04em;vertical-align:-0.02em"></span>`;
    const line = (fs, sw, extra) => `<div style="${face(fs, sw)}${extra}"><span></span>${cur}<span style="visibility:hidden"></span></div>`;
    return `<div class="${AF}" ${ctx.dev('Title', { dur: ctx.dur, l1: p.l1, l2: p.l2 })} style="background-color:#000;overflow:hidden;opacity:0">`
      + `<img src="assets/media/v6_berg_level.png" style="width:100%;height:100%;object-fit:cover;transform-origin:50% 33%" alt="">${Vignette.html({ k: 0.35 })}`
      + svg0(`<filter id="${rough}" x="-2%" y="-10%" width="104%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="0" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter>`)
      + `<div style="position:absolute;left:0;right:0;top:29%;text-align:center;filter:url(#${rough})">${line(96, 2, '')}${line(196, 4, ';margin-top:0.12em')}</div>${grainHtml(ctx, 0.08)}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, c = el.children, l1 = p.l1, l2 = p.l2;
    el.style.opacity = G.interpolate(t, [0, 0.17], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE });
    var push = 1 + 0.012 * p.dur * G.drift(t / p.dur);
    c[0].style.transform = 'translateY(-3%) scale(' + 1.18 * push + ')';
    var all = l1.length + l2.length, typed = Math.max(0, Math.min(all, Math.floor((t - 0.2) * 22)));
    var n1 = Math.min(l1.length, typed), n2 = Math.max(0, typed - l1.length), on = typed < all || Math.floor(t * 2.5) % 2 === 0;
    var q = Math.floor(t * 15);
    c[2].querySelector('feTurbulence').setAttribute('seed', String(q % 7));
    var tx = c[3];
    tx.style.transform = 'translateX(' + (G.random('ti' + q) - 0.5) * 2 * 0.8 + 'px)';
    var A = tx.children[0].children, B = tx.children[1].children;
    A[0].textContent = l1.slice(0, n1); A[2].textContent = l1.slice(n1);
    B[0].textContent = l2.slice(0, n2); B[2].textContent = l2.slice(n2);
    A[1].style.display = n1 < l1.length ? 'inline-block' : 'none';
    B[1].style.display = n1 >= l1.length ? 'inline-block' : 'none';
    A[1].style.visibility = B[1].style.visibility = on ? 'visible' : 'hidden';
  },
};

export default [Grain8, M8, Win, F8, Hur, Spx, VidN, Loc, RgbSlab, RoadOut, Blob, Slab, Warn, DW, List, Title];
