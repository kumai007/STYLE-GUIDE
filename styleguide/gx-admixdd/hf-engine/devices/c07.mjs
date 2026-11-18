// Case 7 devices (ports of C7Devices.tsx): Vid7 (Vid + Punch), Tri7 (SL 3-panel), Split7 (IN-2), StampPush, Title7 (GT glitch title, 2 timed lines), Page7.
// Credit / TypedTag come from c01b.mjs (by name). Contract: see devices/shared.mjs header.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607'; // tokens C.black
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = process.env.GX_ENGINE_PUBLIC ? path.join(process.env.GX_ENGINE_PUBLIC, 'case07') : path.resolve(HERE, '..', 'media', 'case07');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
// grade lift on the Clip itself (precut stats were dull)
const LIFT = { hpf: 'brightness(1.3) saturate(1.6)', hpc: 'brightness(1.38) saturate(1.3)' };

/** Clip + LIFT in a filter wrapper; OffthreadVideo past the clip end shows its last frame -> hold it. */
const liftClip = (ctx, { src, trim = 0, speed = 1 }, win) => {
  const w = win ?? ctx.win;
  const end = Math.round(trim * 60) / 60 + (w[1] * speed) / 60;
  const hold = w[1] > w[0] && end > mediaDur(src) + 1e-6 ? mediaDur(src) - 1 / 60 : undefined;
  return `<div class="${AF}" style="filter:${LIFT[src]}">${ctx.node({ d: 'Clip', p: { src, trim, speed, hold } }, win)}</div>`;
};
/** Origin that frames source point (px, py) at scale s, window kept above the burned stamp (y < 985). */
const ctr = (px, py, s) => {
  const w = 1920 / s, h = 1080 / s;
  const lx = Math.min(1920 - w, Math.max(0, px - w / 2)), ly = Math.min(985 - h, Math.max(0, py - h / 2));
  return `${((lx * s) / (s - 1) / 1920) * 100}% ${((ly * s) / (s - 1) / 1080) * 100}%`;
};

/** Vid7: graded master, muted, eased push (scale base + rate*ez*dur). pu = {at, s, s1} -> Punch (slowed punch-in on a source point). */
export const Vid7 = {
  name: 'Vid7',
  html: (p, ctx) => {
    const { src = 'hpf', trim = 0, speed = 1, base = 1.1, rate = 0.012, origin = '50% 0%', vig = 0.4, filter, pu } = p;
    const org = pu ? ctr(pu.at[0], pu.at[1], pu.s1 ?? pu.s) : origin;
    const dyn = pu || rate;
    const inner = `<div class="${AF}" ${dyn ? ctx.dev('Vid7', { base, rate, pu: pu ? { s: pu.s, s1: pu.s1 ?? 0 } : null }) : ''} style="transform:scale(${pu ? pu.s : base});transform-origin:${org};filter:${filter ?? 'contrast(1.05)'}">${liftClip(ctx, { src, trim, speed })}</div>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${inner}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = S.dur, dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ez = G.interpolate(t, [0, Math.max(0.1, dur)], [0, 1], cl), sc;
    if (p.pu) sc = p.pu.s1 ? G.interpolate(t, [0, dur], [p.pu.s, p.pu.s1], cl) : p.pu.s + 0.016 * dur * ez;
    else sc = p.base + p.rate * ez * dur;
    el.style.transform = 'scale(' + sc + ')';
  },
};

/** SL 3-panel: road centre (W 1018) + same clip stretched / dark / blurred behind; raw = no push. */
export const Tri7 = {
  name: 'Tri7',
  html: (p, ctx) => {
    const { src = 'hpf', trim = 0, speed = 1, raw } = p;
    const W = 1018, cn = { src, trim, speed };
    return `<div class="${AF}" style="background-color:#050708;overflow:hidden">
<div class="${AF}" style="transform:scale(1.25);filter:blur(26px) brightness(0.32) saturate(0.7)">${liftClip(ctx, cn)}</div>
<div style="position:absolute;left:${(1920 - W) / 2}px;top:0;width:${W}px;height:1080px;overflow:hidden;box-shadow:0 0 40px rgba(0,0,0,0.85)"><div ${raw ? '' : ctx.dev('Tri7', {})} style="position:absolute;left:${(W - 1920 * 1.1) / 2}px;top:0;width:${1920 * 1.1}px;height:${1080 * 1.1}px;transform:scale(1);transform-origin:50% 30%">${liftClip(ctx, cn)}</div></div>
${Vignette.html({ k: 0.35 })}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = S.dur, dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var ez = G.interpolate(t, [0, Math.max(0.1, dur)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive });
    el.style.transform = 'scale(' + (1 + 0.01 * ez * dur) + ')';
  },
};

/** IN-2 2-up split: road full frame, at `at` it lands left (x 24, y 272, 928x522) and the cabin slides in right (0.5 s, E.settle). */
export const Split7 = {
  name: 'Split7',
  html: (p, ctx) => {
    const { a, b, at } = p;
    const [w0, w1] = ctx.win;
    const c0 = Math.max(w0, Math.floor(at * 60));
    const panel = (n, win, css) => `<div style="position:absolute;overflow:hidden;${css}">${ctx.node({ d: 'Vid7', p: { ...n, vig: 0.3 } }, win)}</div>`;
    const bd = c0 < w1 ? panel(b, [c0, w1], 'left:1920px;top:272px;width:928px;height:522px;opacity:0;display:none') : '';
    return `<div class="${AF}" ${ctx.dev('Split7', { at })} style="background-color:#050708">${panel(a, undefined, 'left:0;top:0;width:1920px;height:1080px')}${bd}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, st = el._st || (el._st = G.bezier(0.16, 1, 0.3, 1));
    var q = G.interpolate(t, [p.at, p.at + 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: st });
    var A = el.children[0], B = el.children[1];
    A.style.left = (24 * q) + 'px'; A.style.top = (272 * q) + 'px';
    A.style.width = (1920 + (928 - 1920) * q) + 'px'; A.style.height = (1080 + (522 - 1080) * q) + 'px';
    if (B) {
      B.style.display = q > 0 ? '' : 'none';
      B.style.left = (1920 + (968 - 1920) * q) + 'px';
      B.style.opacity = q;
    }
  },
};

/** Stamp push: still of hpf at source second `at`, scale 1 -> z (E.dive over the whole shot) towards the date stamp; yellow box drawn at boxAt (0.35 s, E.settle). */
export const StampPush = {
  name: 'StampPush',
  html: (p, ctx) => {
    const { at, z, ox, oy, box, boxAt } = p;
    const img = ctx.still('hpf', Math.round(at * 60));
    const [x0, y0, x1, y1] = box;
    const P = { z, boxAt, w: x1 - x0 + 16 };
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}"><div class="${AF}" ${ctx.dev('StampPush', P)} style="transform-origin:${(ox / 1920) * 100}% ${(oy / 1080) * 100}%;filter:contrast(1.05)"><div class="${AF}" style="filter:${LIFT.hpf}"><img src="${img}" style="position:absolute;inset:0;width:100%;height:100%" alt=""></div><div style="position:absolute;left:${x0 - 8}px;top:${y0 - 6}px;width:0px;height:${y1 - y0 + 12}px;border:3px solid rgba(255,222,0,0.95);box-shadow:0 0 10px rgba(255,222,0,0.5);box-sizing:content-box;display:none"></div></div>${Vignette.html({ k: 0.35 })}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = S.dur, dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1)), st = el._st || (el._st = G.bezier(0.16, 1, 0.3, 1));
    var s = G.interpolate(t, [0, dur], [1, p.z], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive });
    var q = G.interpolate(t, [p.boxAt, p.boxAt + 0.35], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: st });
    el.style.transform = 'scale(' + s + ')';
    var b = el.children[1];
    b.style.display = q > 0 ? 'block' : 'none';
    b.style.width = p.w * q + 'px';
  },
};

/** GT glitch-in title: 2 lines (Archivo 600/800) on their own cues at1/at2 (s), cyan glitch envelope (linear in 6 f / out 7 f at `out`). Local frame of the shot. */
export const Title7 = {
  name: 'Title7',
  html: (p, ctx) => {
    const face = (size, w) => `font-family:'Archivo';font-weight:${w};font-size:${size}px;line-height:1.05;letter-spacing:0.04em;white-space:nowrap;text-align:center`;
    const line = (txt, size, w) => `<div style="position:relative;display:none"><div style="${face(size, w)};position:absolute;inset:0;color:rgba(255,40,80,0.75);mix-blend-mode:screen;display:none">${ctx.esc(txt)}</div><div style="${face(size, w)};position:absolute;inset:0;color:rgba(57,240,251,0.8);display:none">${ctx.esc(txt)}</div><div style="${face(size, w)};color:#39F0FB;text-shadow:0 0 18px rgba(57,240,251,0.45), 0 4px 16px rgba(0,0,0,0.9)">${ctx.esc(txt)}</div></div>`;
    return `<div class="${AF}" ${ctx.dev('Title7', { at1: p.at1, at2: p.at2, out: p.out })} style="justify-content:center;align-items:center"><div style="display:flex;flex-direction:column;align-items:center;gap:10px;min-height:230px">${line(p.l1, 70, 600)}${line(p.l2, 112, 800)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var F = function (s) { return Math.round(s * 60); };
    var outF = F(p.out) - 7, box = el.children[0], at = [F(p.at1), F(p.at2)], seeds = ['c7t1', 'c7t2'];
    el.style.backgroundColor = f >= at[0] && f < outF + 7 ? 'rgba(0,0,0,0.35)' : '';
    for (var i = 0; i < 2; i++) {
      var d = box.children[i], ff = f - at[i], of = outF - at[i], seed = seeds[i], inN = 6;
      if (ff < 0 || ff >= of + 7) { d.style.display = 'none'; continue; }
      d.style.display = '';
      var g = ff < inN ? 1 - ff / inN : ff >= of ? (ff - of + 1) / 7 : 0;
      var q = Math.floor(ff / 2), dx = g * 60 * (G.random(seed + 'x' + q) - 0.5);
      var cut = g > 0 ? 18 + 60 * G.random(seed + 'c' + q) : 0;
      d.style.opacity = g > 0 && G.random(seed + 'o' + ff) < 0.18 * g ? 0 : 1;
      var red = d.children[0], cy = d.children[1], main = d.children[2];
      red.style.display = g > 0 ? '' : 'none'; cy.style.display = g > 0 ? '' : 'none';
      red.style.transform = 'translateX(' + (dx + 14 * g) + 'px)';
      cy.style.transform = 'translateX(' + (dx - 14 * g) + 'px)';
      cy.style.clipPath = 'inset(' + cut + '% 0 ' + Math.max(0, 70 - cut) + '% 0)';
      main.style.transform = 'translateX(' + dx * 0.4 + 'px)';
    }
  },
};

/** Page7: page png under camera cam [t, cx, cy, zoom] (E.dive), pop +9 % over 0.35 s (E.settle), drift 3.5 % eased over the shot, yellow multiply marks [x0, x1, at, d] (E.settle wipe), credit br. */
export const Page7 = {
  name: 'Page7',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit } = p;
    const mk = marks.map((m) => { const [x0, y0, x1, y1] = m.b; return `<div style="position:absolute;left:${x0 - 6}px;top:${y0 - 3}px;width:0px;height:${y1 - y0 + 6}px;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px;display:none"></div>`; }).join('');
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><img src="assets/media/page_${src}_full.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    const P = { h, cam, marks: marks.map((m) => [m.b[0], m.b[2], m.at, m.d ?? 0.35]) };
    return `<div class="${AF}" ${ctx.dev('Page7', P)} style="background-color:#0b0d0e;overflow:hidden">${pg}<div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, cam = p.cam, h = p.h, dur = S.dur, pg = el.children[0];
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1)), st = el._st || (el._st = G.bezier(0.16, 1, 0.3, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive }, cs = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: st };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (1 + 0.09 * (1 - G.interpolate(t, [0, 0.35], [0, 1], cs))) * (1 + 0.035 * G.interpolate(t, [0, Math.max(0.1, dur)], [0, 1], cl));
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1];
      var q = G.interpolate(t, [m[2], m[2] + m[3]], [0, 1], cs);
      if (q <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.width = (m[1] - m[0] + 12) * q + 'px';
    }
  },
};

export default [Vid7, Tri7, Split7, StampPush, Title7, Page7];
