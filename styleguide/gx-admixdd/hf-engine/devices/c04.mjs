// Case 04 devices (ports of C04Devices.tsx): V4, Push4, Page4, GTTitle, Split2, NameTagB, RawCap4. Credit/TypedTag come from c01b (by name).
// Contract: see devices/shared.mjs header. Media dir = hf-engine/media/case04 (junctioned as assets/media).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(HERE, '..', 'media', 'case04');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
const fr = (s) => Math.round(s * 60);
// c04Captions.ts C04CAP: clip seconds [a, b, text]; bleeps as the dash.
const C04CAP = {"raw_R1": [[3.46, 5.54, "The car behind us is kind of scaring me"], [5.54, 7.04, "how fast they're going. I know,"], [13.94, 16.24, "It's not scaring me. It's scaring me because"], [16.24, 18.12, "what if they're speeding up on us to rob"], [18.12, 19.02, "us or something?"], [21.08, 22.2, "I don't know."]], "raw_R2": [[0.78, 1.4, "probably just"], [1.56, 2.94, "this road a lot of times."], [8.62, 9.52, "have guns"]], "raw_R5": [[1.78, 2.68, "Come on,"], [3.32, 4.22, "please. No,"], [4.46, 5.36, "problem, no problem."], [5.58, 6.48, "to pass out."], [6.68, 8.18, "Logan, don't, don't. It's okay, it's okay,"], [8.22, 9.94, "it's okay. No problem, no problem, okay?"], [13.38, 15.06, "You will, you will. Can we go?"]], "raw_R6": [[18.89, 19.79, "your name?"], [20.19, 21.23, "What's your name?"], [27.01, 27.91, "Please don't kill us"], [29.45, 29.97, "It's bigger."]], "raw_R3": [[0.38, 4.22, "please please please please Please what!"], [8.58, 9.48, "Please what!"], [16.24, 17.46, "Please, please, please."], [21.62, 22.52, "You will,"], [23.44, 24.34, "Don't do"]], "raw_R4": [[1.85, 2.75, "Come on,"], [3.39, 4.29, "please. No,"], [4.53, 5.43, "problem, no problem."], [5.65, 6.55, "to pass out."], [6.75, 8.25, "Logan, don't, don't. It's okay, it's okay,"], [8.29, 10.01, "it's okay. No problem, no problem, okay?"], [13.45, 15.13, "You will, you will. Can we go?"]]};

/** V4: graded case clip. Non-raw: eased Move (mv, rate 0.013) inside an optional static scale base; sound = raw with its own audio (vol 1, no move). */
export const V4 = {
  name: 'V4',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 1, base = 1.0, rate = 0.013, origin, filter, vig = 0.45, fade, sound, mv = 'push', deg } = p;
    const flt = filter ?? (fade ? 'saturate(0.35) brightness(0.86) contrast(1.06)' : 'contrast(1.05)');
    const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60, md = ctx.win[1] > ctx.win[0] ? mediaDur(src) : Infinity;
    const vid = ctx.node({ d: 'Clip', p: { src, trim, speed, vol: sound ? 1 : 0, hold: end > md + 1e-6 ? md - 1 / 60 : undefined } });
    const inner = `<div class="${AF}" style="filter:${flt}">${vid}</div>`;
    const mvN = { d: 'Move', p: { kind: sound ? 'none' : mv, rate, deg, origin }, k: [{ raw: inner }] };
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}"><div class="${AF}" style="${base !== 1 ? `transform:scale(${base});` : ''}transform-origin:${origin ?? '50% 50%'}">${ctx.node(mvN)}</div>${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
};

/** Push4: live clip with camera keyframes [t, originX %, originY %, scale] (E.dive). */
export const Push4 = {
  name: 'Push4',
  html: (p, ctx) => `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}"><div class="${AF}" ${ctx.dev('Push4', { cam: p.cam })} style="filter:contrast(1.05)">${ctx.node({ d: 'Clip', p: { src: p.src, trim: p.trim ?? 0 } })}</div>${Vignette.html({ k: 0.4 })}</div>`,
  render: function (el, f, p, G) {
    var t = f / 60, cam = p.cam, dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var ts = cam.map(function (k) { return k[0]; });
    var ip = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive }) : cam[0][i]; };
    el.style.transform = 'scale(' + ip(3) + ')';
    el.style.transformOrigin = ip(1) + '% ' + ip(2) + '%';
  },
};

/** Page4: page png (case04/page_<src>_full.png) under camera [t, cx, cy, zoom] (E.dive), Move on the page layer (rate 0.005, deg 2), marker sweep 0.45 s. */
export const Page4 = {
  name: 'Page4',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit, dark, mv = 'push', deg = 2 } = p;
    const mk = marks.map((m) => `<div style="position:absolute;left:${m.b[0] - 4}px;top:${m.b[1] - 2}px;width:0px;height:${m.b[3] - m.b[1] + 4}px;background-color:${dark ? 'rgba(251,148,4,0.42)' : 'rgba(255,214,10,0.55)'};mix-blend-mode:${dark ? 'screen' : 'multiply'};display:none"></div>`).join('');
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:${dark ? 'brightness(1.45) contrast(0.96)' : 'brightness(0.9) contrast(1.06) saturate(0.88)'}"><img src="assets/media/page_${src}_full.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    const P = { h, cam, marks: marks.map((m) => [m.b[0], m.b[2], m.at]) };
    return `<div class="${AF}" ${ctx.dev('Page4', P)} style="background-color:#0b0d0e;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: mv, rate: 0.005, deg }, k: [{ raw: pg }] })}<div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, cam = p.cam, h = p.h;
    var pg = el._pg || (el._pg = el.querySelector('.pg'));
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive }) : cam[0][i]; };
    var z = seg(3), hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1];
      var q = G.ease(t, [m[2], m[2] + 0.45], [0, 1]);
      if (q <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.width = (m[1] - m[0] + 8) * q + 'px';
    }
  },
};

/** GT glitch-in title: 2 lines (Archivo 600/800), red/white split glitch envelope in/out, drift scale. Local frame of the shot. */
export const GTTitle = {
  name: 'GTTitle',
  html: (p, ctx) => {
    const face = (size, w) => `font-family:'Archivo';font-weight:${w};font-size:${size}px;line-height:1.05;letter-spacing:0.04em;white-space:nowrap;text-align:center`;
    const line = (txt, size, w) => `<div style="position:relative"><div style="${face(size, w)};position:absolute;inset:0;color:rgba(255,40,80,0.75);mix-blend-mode:screen;display:none">${ctx.esc(txt)}</div><div style="${face(size, w)};position:absolute;inset:0;color:rgba(242,245,246,0.8);display:none">${ctx.esc(txt)}</div><div style="${face(size, w)};color:#F2F5F6;text-shadow:0 0 18px rgba(242,245,246,0.28), 0 4px 16px rgba(0,0,0,0.9)">${ctx.esc(txt)}</div></div>`;
    return `<div class="${AF}" ${ctx.dev('GTTitle', { out: p.out })} style="justify-content:center;align-items:center;background-color:rgba(0,0,0,0.35)"><div style="display:flex;flex-direction:column;align-items:center;gap:10px">${line(p.l1, 70, 600)}${line(p.l2, 124, 800)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var outF = Math.round(p.out * 60) - 7, box = el.children[0];
    box.style.transform = 'scale(' + (1 + 0.03 * G.drift(f / Math.max(1, Math.round(p.out * 60)))).toFixed(5) + ')';
    var cfg = [[box.children[0], Math.max(0, f), outF, 'gt1'], [box.children[1], Math.max(0, f - 4), outF - 4, 'gt2']];
    for (var i = 0; i < 2; i++) {
      var d = cfg[i][0], ff = cfg[i][1], of = cfg[i][2], seed = cfg[i][3], inN = 6;
      if (ff >= of + 7) { d.style.display = 'none'; continue; }
      d.style.display = '';
      var g = ff < inN ? 1 - G.EASE(ff / inN) : ff >= of ? G.EASE(Math.min(1, (ff - of + 1) / 7)) : 0;
      var q = Math.floor(ff / 2), dx = g * 60 * (G.random(seed + 'x' + q) - 0.5);
      var cut = g > 0 ? 18 + 60 * G.random(seed + 'c' + q) : 0;
      d.style.opacity = g > 0 && G.random(seed + 'o' + ff) < 0.18 * g ? 0 : 1;
      var red = d.children[0], wh = d.children[1], main = d.children[2];
      red.style.display = g > 0 ? '' : 'none'; wh.style.display = g > 0 ? '' : 'none';
      red.style.transform = 'translateX(' + (dx + 14 * g) + 'px)';
      wh.style.transform = 'translateX(' + (dx - 14 * g) + 'px)';
      wh.style.clipPath = 'inset(' + cut + '% 0 ' + Math.max(0, 70 - cut) + '% 0)';
      main.style.transform = 'translateX(' + dx * 0.4 + 'px)';
    }
  },
};

/** Split2 (IN-2): road | cabin halves (700 / 1214 px, 6 px seam), each cover-cropped (object-position pos) with its own eased Move. */
export const Split2 = {
  name: 'Split2',
  html: (p, ctx) => {
    const half = (v, i) => {
      const inner = `<div class="${AF} c04cov" style="--op:${v.pos ?? '50% 50%'}">${ctx.node({ d: 'Clip', p: { src: v.src, trim: v.trim ?? 0 } })}</div>`;
      return `<div style="position:absolute;left:${i === 0 ? 0 : 706}px;top:0;width:${i === 0 ? 700 : 1214}px;height:1080px;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: v.mv ?? (i === 0 ? 'push' : 'pull'), rate: v.rate ?? 0.014, deg: v.deg }, k: [{ raw: inner }] })}</div>`;
    };
    return `<div class="${AF}" style="background-color:#050708"><style>.c04cov .vid{object-fit:cover;object-position:var(--op)}</style>${half(p.a, 0)}${half(p.b, 1)}</div>`;
  },
};

/** NT-b wide 2-name tag: orange label, Courier Prime caps, grows 0.55 s from the centre, fades out 0.25 s before `out`. */
export const NameTagB = {
  name: 'NameTagB',
  html: (p, ctx) => `<div ${ctx.dev('NameTagB', { at: p.at, out: p.out })} style="position:absolute;left:0;right:0;top:${p.top ?? 900}px;justify-content:center;display:none"><div style="background-color:#FB9404;padding:10px 34px 8px"><div style="font-family:'Courier Prime';font-weight:700;font-size:58px;color:#0A0A0A;letter-spacing:0.03em;white-space:nowrap">${ctx.esc(p.text)}</div></div></div>`,
  render: function (el, f, p, G) {
    var t = f / 60;
    if (t < p.at || t > p.out) { el.style.display = 'none'; return; }
    var g = G.ease(t, [p.at, p.at + 0.55], [0, 1]);
    el.style.display = 'flex';
    el.style.opacity = G.ease(t, [p.out - 0.25, p.out], [1, 0]);
    el.children[0].style.clipPath = 'inset(0 ' + (1 - g) * 50 + '% 0 ' + (1 - g) * 50 + '%)';
  },
};

/** RawCap4: raw speech captions from C04CAP[raw]; shown while f/60 + clipAt in [a, b + 0.15); first match wins. */
export const RawCap4 = {
  name: 'RawCap4',
  html: (p, ctx) => {
    const L = C04CAP[p.raw] ?? [];
    const rows = L.map((l) => `<div style="position:absolute;left:160px;right:160px;bottom:92px;text-align:center;display:none;font-family:'Archivo';font-weight:600;font-size:50px;line-height:1.18;color:#F4F7F7;text-shadow:0 0 3px #000, 0 0 3px #000, 0 2px 8px rgba(0,0,0,0.95)"><span style="background-color:rgba(0,0,0,0.42);padding:4px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone">${ctx.esc(l[2])}</span></div>`).join('');
    return `<div ${ctx.dev('RawCap4', { clipAt: p.clipAt ?? 0, L: L.map((l) => [l[0], l[1]]) })}>${rows}</div>`;
  },
  render: function (el, f, p) {
    var t = f / 60 + p.clipAt, hit = -1;
    for (var i = 0; i < p.L.length; i++) if (t >= p.L[i][0] && t < p.L[i][1] + 0.15) { hit = i; break; }
    for (var j = 0; j < el.children.length; j++) el.children[j].style.display = j === hit ? 'block' : 'none';
  },
};

export default [V4, Push4, Page4, GTTitle, Split2, NameTagB, RawCap4];
