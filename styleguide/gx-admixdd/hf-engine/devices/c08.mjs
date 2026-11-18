// Case 8 devices (ports of C08Devices.tsx): Vid8 (Vid/Ins), TitleC08, SoArm, RawCaps8, Page8, RawAudio (raw UBA sound under the raws). Credit = c01b.mjs, TapeTear = c03.mjs (by name).
// Contract: see devices/shared.mjs header. The per-shot move kind (C08Mv) is injected as p.mv by cases/case08.mjs.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = process.env.GX_ENGINE_PUBLIC ? path.join(process.env.GX_ENGINE_PUBLIC, 'case08') : path.resolve(HERE, '..', 'media', 'case08');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
const clipNode = (ctx, { src, trim = 0, speed = 1 }) => {
  const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60;
  const hold = ctx.win[1] > ctx.win[0] && end > mediaDur(src) + 1e-6 ? mediaDur(src) - 1 / 60 : undefined;
  return { d: 'Clip', p: { src, trim, speed, hold } };
};
// passenger face ellipse keys [UBR s, src x, src y, rx, ry] (c08Keys.ts)
export const C08_KEYS = [[0.0, 429.0, 335.0, 131.2, 164.0], [0.5, 430.0, 332.7, 134.4, 168.0], [1.0, 431.3, 328.7, 137.6, 172.0], [1.5, 436.7, 320.7, 140.8, 176.0], [2.0, 444.3, 318.3, 141.3, 176.7], [2.5, 448.0, 318.7, 144.0, 180.0], [3.0, 450.0, 320.7, 146.1, 182.7], [3.5, 445.3, 325.3, 148.3, 185.3], [4.0, 444.7, 328.7, 146.1, 182.7], [4.5, 443.3, 334.7, 142.9, 178.7], [5.0, 446.3, 337.0, 141.3, 176.7], [5.5, 447.0, 339.7, 141.3, 176.7], [6.0, 442.3, 347.7, 141.3, 176.7], [6.5, 434.3, 354.3, 140.3, 175.3], [7.0, 430.7, 359.3, 141.9, 177.3], [7.5, 427.3, 356.0, 141.9, 177.3], [8.0, 429.0, 352.3, 142.4, 178.0], [8.5, 429.7, 353.7, 142.4, 178.0], [9.0, 434.3, 361.0, 143.5, 179.3], [9.5, 436.0, 366.0, 144.0, 180.0], [10.0, 467.0, 360.0, 145.0, 175.0], [10.5, 517.0, 378.0, 165.0, 200.0], [10.6, 517.0, 375.0, 165.0, 205.0], [10.7, 490.0, 392.0, 170.0, 210.0], [10.8, 690.0, 470.0, 195.0, 230.0], [10.9, 627.0, 440.0, 200.0, 240.0], [11.0, 630.0, 385.0, 205.0, 245.0], [11.1, 570.0, 340.0, 215.0, 260.0], [11.2, 395.0, 240.0, 215.0, 250.0], [11.3, 405.0, 285.0, 215.0, 255.0], [11.5, 420.0, 320.0, 215.0, 260.0], [11.7, 465.0, 360.0, 215.0, 260.0], [11.9, 490.0, 330.0, 215.0, 260.0], [12.1, 480.0, 300.0, 215.0, 255.0], [12.4, 505.0, 300.0, 215.0, 255.0], [12.7, 510.0, 305.0, 210.0, 250.0], [13.0, 440.0, 285.0, 175.0, 210.0], [14.0, 427.0, 373.0, 185.0, 210.0], [15.0, 320.0, 300.0, 180.0, 215.0], [16.0, 320.0, 347.0, 180.0, 215.0], [17.0, 400.0, 213.0, 180.0, 215.0], [18.0, 427.0, 190.0, 175.0, 210.0], [18.5, 512.0, 304.0, 165.0, 195.0], [19.0, 640.0, 304.0, 140.0, 160.0], [20.0, 625.0, 290.0, 140.0, 160.0], [21.0, 608.0, 304.0, 140.0, 160.0], [22.0, 608.0, 245.0, 140.0, 160.0], [23.0, 608.0, 250.0, 140.0, 160.0], [23.5, 608.0, 304.0, 140.0, 160.0], [24.5, 608.0, 352.0, 140.0, 160.0], [26.0, 608.0, 352.0, 140.0, 160.0], [27.5, 608.0, 336.0, 140.0, 160.0], [28.5, 608.0, 336.0, 140.0, 160.0], [29.0, 650.0, 395.0, 140.0, 160.0], [30.0, 640.0, 410.0, 145.0, 165.0], [30.5, 500.0, 370.0, 240.0, 220.0], [31.0, 416.0, 352.0, 210.0, 220.0], [31.5, 304.0, 320.0, 175.0, 210.0], [32.0, 250.0, 340.0, 195.0, 225.0], [33.0, 480.0, 360.0, 175.0, 205.0], [34.0, 400.0, 267.0, 165.0, 195.0], [35.0, 340.0, 340.0, 185.0, 225.0], [35.5, 464.0, 555.0, 200.0, 200.0], [36.0, 512.0, 590.0, 205.0, 225.0], [37.0, 630.0, 580.0, 225.0, 205.0], [37.5, 672.0, 520.0, 215.0, 205.0], [37.8, 740.0, 380.0, 230.0, 260.0], [38.0, 790.0, 250.0, 175.0, 205.0], [38.5, 740.0, 300.0, 190.0, 230.0], [39.0, 720.0, 195.0, 155.0, 185.0], [40.0, 747.0, 240.0, 155.0, 185.0], [41.0, 720.0, 267.0, 155.0, 185.0], [42.0, 773.0, 293.0, 155.0, 185.0], [43.0, 747.0, 293.0, 155.0, 185.0], [44.0, 747.0, 293.0, 155.0, 185.0], [45.0, 720.0, 293.0, 155.0, 185.0], [46.0, 800.0, 347.0, 160.0, 190.0], [47.0, 720.0, 373.0, 160.0, 190.0], [48.0, 720.0, 373.0, 160.0, 190.0]];

/** Vid8 (Vid/Ins): graded ubr clip, muted. raw = linear base + rate*t; else eased move by p.mv (injected per shot; ec forces push; tilt = 2.5 deg panel turn + 0.4x push).
 *  EC = soft ring + light dot on the passenger face, tracked through the scale (keys C08_KEYS). */
export const Vid8 = {
  name: 'Vid8',
  html: (p, ctx) => {
    const { src = 'ubr_full', trim = 0, speed = 1, base = 1.0, rate = 0.012, origin, vig = 0.4, filter, ec, raw, mv = 'push' } = p;
    const cn = clipNode(ctx, { src, trim, speed });
    const ring = ec ? `<div style="position:absolute;border-radius:50%;border:3px solid rgba(240,244,246,0.75);box-shadow:0 0 14px rgba(255,255,255,0.45), inset 0 0 14px rgba(255,255,255,0.25)"></div><div style="position:absolute;width:18px;height:18px;border-radius:50%;background-color:#FFFFFF;box-shadow:0 0 12px 4px rgba(255,255,255,0.8)"></div>` : '';
    const dp = { trim, speed, base, rate, origin: origin ?? '50% 50%', ec: !!ec, raw: !!raw, mv, keys: ec ? C08_KEYS : undefined };
    return `<div class="${AF}" ${ctx.dev('Vid8', dp)} style="overflow:hidden;background-color:${BLACK}"><div class="${AF}"><div class="${AF}" style="transform-origin:${origin ?? '50% 50%'};filter:${filter ?? 'contrast(1.05)'}">${ctx.node(cn)}</div></div>${ring}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, dur = Math.max(0.1, S.dur), pp = t / dur;
    var kind = p.ec ? 'push' : p.mv, tilt = !p.raw && kind.indexOf('tilt') === 0, q = G.drift(pp);
    var s = p.raw ? p.base + p.rate * t : kind === 'none' ? p.base : kind === 'pull' ? p.base + p.rate * dur * (1 - q) : p.base + p.rate * dur * q * (tilt ? 0.4 : 1);
    var wrap = el.children[0];
    wrap.style.transform = tilt ? G.moveCss(kind, pp, dur, { deg: 2.5, rate: 0 }) : '';
    wrap.children[0].style.transform = 'scale(' + s.toFixed(5) + ')';
    if (!p.ec) return;
    var u = p.trim + p.speed * t, K = p.keys, k = K[K.length - 1];
    if (u <= K[0][0]) k = K[0];
    else for (var i = 1; i < K.length; i++) if (u <= K[i][0]) { var a = K[i - 1], b = K[i], w = (u - a[0]) / (b[0] - a[0]); k = a.map(function (v, j) { return v + (b[j] - v) * w; }); break; }
    var o = p.origin.split(' ').map(function (v) { return parseFloat(v) / 100; }), ox = o[0], oy = o[1];
    var X = 960 * 2 * ox + ((k[1] - 31) * 1.5764 - 1920 * ox) * s, Y = 1080 * oy + (k[2] * 1.5743 - 1080 * oy) * s;
    var RX = k[3] * 1.5764 * s * 1.08, RY = k[4] * 1.5743 * s * 1.08;
    var ring = el.children[1], dot = el.children[2];
    ring.style.left = (X - RX) + 'px'; ring.style.top = (Y - RY) + 'px'; ring.style.width = (RX * 2) + 'px'; ring.style.height = (RY * 2) + 'px';
    dot.style.left = (X + RX * 0.62 - 9) + 'px'; dot.style.top = (Y - RY * 0.78 - 9) + 'px'; dot.style.opacity = 0.75 + 0.25 * Math.sin(u * 5);
  },
};

/** CO-b title: FB-h blurred freeze + VT323 white pixel caps, eased glitch-in (RGB split, 14 f), slow push. */
export const TitleC08 = {
  name: 'TitleC08',
  html: (p, ctx) => {
    const { l1, l2, freeze, black = 0 } = p;
    const line = (txt, size) => `<div style="display:none;font-family:'VT323';font-size:${size}px;line-height:1;letter-spacing:0.06em;color:#F6F8F8;white-space:nowrap">${ctx.esc(txt)}</div>`;
    return `<div class="${AF}" ${ctx.dev('TitleC08', { black })} style="background-color:${BLACK};overflow:hidden"><div class="${AF}" style="opacity:0"><img src="assets/media/${freeze}.png" style="width:100%;height:100%;filter:blur(10px) brightness(0.6) saturate(0.85)" alt="">${Vignette.html({ k: 0.5 })}</div><div class="${AF}" style="align-items:center;justify-content:center;gap:22px;top:-40px">${line(l1, 150)}${line(l2, 92)}</div></div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, black = p.black, dur = S.dur, u = Math.max(0, t - black);
    var bg = el.children[0];
    bg.style.opacity = G.ease(t, [black, black + 0.5], [0, 1]);
    bg.children[0].style.transform = 'scale(' + (1.06 + 0.04 * G.drift(u / Math.max(0.5, dur - black))).toFixed(5) + ')';
    var L = [[0.15, 'c8a'], [0.55, 'c8b']];
    for (var i = 0; i < 2; i++) {
      var d = el.children[1].children[i], g = f - Math.round((black + L[i][0]) * 60);
      if (g < 0) { d.style.display = 'none'; continue; }
      var e = G.EASE(Math.min(1, g / 14)), j = 1 - e;
      var dx = (G.random(L[i][1] + 'x') - 0.5) * 60 * Math.sin(Math.PI * e);
      var sh = j > 0 ? (12 * j) + 'px 0 0 rgba(255,40,60,0.75), ' + (-12 * j) + 'px 0 0 rgba(69,253,252,0.75), ' : '';
      d.style.display = 'block';
      d.style.opacity = e;
      d.style.transform = 'translateX(' + dx.toFixed(2) + 'px)';
      d.style.textShadow = sh + '0 0 18px rgba(0,0,0,0.9), 0 4px 10px rgba(0,0,0,0.9)';
    }
  },
};

/** SO: cyan-white solarise following Castro's sleeve (feathered mask png); live then freezes at freezeAt (s) with the solarise fading in. */
export const SoArm = {
  name: 'SoArm',
  html: (p, ctx) => {
    const { trim, freezeAt, dur, mask, base = 1.0, origin = '50% 50%' } = p;
    const at = Math.round(freezeAt * 60), fid = ctx.id('sol');
    const live = () => ctx.node({ d: 'Clip', p: { src: 'ubr_full', trim } }, [ctx.win[0], Math.min(ctx.win[1], at)]);
    const body = () => `${live()}<img class="st" src="${ctx.still('ubr_full', Math.round(trim * 60) + at)}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:none" alt="">`;
    const m = `url(assets/media/${mask}.png)`;
    return `<div class="${AF}" ${ctx.dev('SoArm', { at, dur, base })} style="overflow:hidden;background-color:${BLACK}"><svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.245 0.822 0.083 0 0  0.245 0.822 0.083 0 0  0.245 0.822 0.083 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0 0.12 0.58 0.92 0.62"/><feFuncG type="table" tableValues="0 0.26 0.88 1 0.80"/><feFuncB type="table" tableValues="0 0.36 0.96 1 0.86"/></feComponentTransfer></filter></svg><div class="${AF}" style="transform-origin:${origin}"><div class="${AF}" style="filter:contrast(1.05)">${body()}</div><div class="${AF}" style="opacity:0;-webkit-mask-image:${m};mask-image:${m};-webkit-mask-size:100% 100%;mask-size:100% 100%;filter:url(#${fid})">${body()}</div></div>${Vignette.html({ k: 0.42 })}</div>`;
  },
  render: function (el, f, p, G) {
    var at = p.at, w = el.children[1];
    w.style.transform = 'scale(' + (p.base * (1 + 0.015 * p.dur * G.drift(f / 60 / Math.max(0.1, p.dur)))) + ')';
    w.children[1].style.opacity = G.ease(f, [at - 12, at], [0, 1]) * G.ease(f, [at, Math.round(p.dur * 60)], [1, 0.9]);
    var st = el.querySelectorAll('img.st');
    for (var i = 0; i < st.length; i++) st[i].style.display = f >= at ? 'block' : 'none';
  },
};

/** Raw speech captions (UBR time, bleeps as a dash). clipAt = UBR time at frame 0; shown while t in [a, b + 0.15). No fade. */
export const C08CAP = [
  [2.30, 3.55, 'Gotta let go of my hand, bro.'],
  [3.60, 5.00, 'I think so.'],
  [6.30, 7.10, 'Where we at?'],
  [7.50, 8.40, "We're heading downtown."],
  [8.90, 10.20, "We're going South Side."],
  [13.70, 16.00, 'What the \u2014 man?'],
  [24.80, 25.95, 'You gotta let go, man.'],
  [25.98, 27.60, 'No, we \u2026 go crazy.'],
  [37.60, 39.40, 'I love you\u2026'],
  [45.60, 47.30, "We're not gonna die, man, but you gotta let go."],
];
export const RawCaps8 = {
  name: 'RawCaps8',
  html: (p, ctx) => `<div ${ctx.dev('RawCaps8', { clipAt: p.clipAt, L: C08CAP.map((l) => [l[0], l[1]]) })}>${C08CAP.map((l) =>
    `<div style="position:absolute;left:160px;right:160px;bottom:92px;text-align:center;display:none;font-family:'Archivo';font-weight:600;font-size:50px;line-height:1.18;color:#F4F7F7;text-shadow:0 0 3px #000, 0 0 3px #000, 0 2px 8px rgba(0,0,0,0.95)"><span style="background-color:rgba(0,0,0,0.42);padding:4px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone">${ctx.esc(l[2])}</span></div>`).join('')}</div>`,
  render: function (el, f, p) {
    var t = f / 60 + p.clipAt, hit = -1;
    for (var i = 0; i < p.L.length; i++) if (t >= p.L[i][0] && t < p.L[i][1] + 0.15) { hit = i; break; }
    for (var j = 0; j < el.children.length; j++) el.children[j].style.display = j === hit ? 'block' : 'none';
  },
};

/** Page8: page png (1920 x h) under camera cam [t, cx, cy, zoom] (EASE) + pop + move (p.mv injected) + yellow multiply marker sweeps (marks {b, at, d}); teal multiply, credit br. */
export const Page8 = {
  name: 'Page8',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit, mv = 'push' } = p;
    const mk = marks.map(() => `<div style="position:absolute;display:none;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px"></div>`).join('');
    const pg = `<div style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><img src="assets/media/${src}.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    return `<div class="${AF}" ${ctx.dev('Page8', { h, cam, marks, mv })} style="background-color:#0b0d0e;overflow:hidden"><div class="${AF}">${pg}</div><div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, cam = p.cam, h = p.h, dur = Math.max(0.1, S.dur), kind = p.mv, tilt = kind.indexOf('tilt') === 0;
    var wrap = el.children[0], pg = wrap.children[0];
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var q = G.drift(t / dur);
    var zm = kind === 'none' ? 1 : kind === 'pull' ? 1 + 0.005 * dur * (1 - q) : 1 + (tilt ? 0.002 : 0.005) * dur * q;
    var z = seg(3) * (1 + 0.09 * (1 - G.ease(t, [0, 0.35], [0, 1]))) * zm;
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    wrap.style.transform = tilt ? G.moveCss(kind, t / dur, dur, { deg: 2.5, rate: 0 }) : '';
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1], pr = G.ease(t, [m.at, m.at + (m.d || 0.45)], [0, 1]);
      if (pr <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.left = (m.b[0] - 6) + 'px'; d.style.top = (m.b[1] - 3) + 'px';
      d.style.width = ((m.b[2] - m.b[0] + 12) * pr) + 'px'; d.style.height = (m.b[3] - m.b[1] + 6) + 'px';
    }
  },
};

/** Raw UBA sound (ubr_audio.wav) under a raw: volume lane [0,6,len-9,len] -> [0,1,1,0] (Case08.tsx RawAudio). Lives in the overlay window (len frames). p = { at, trim, track }. */
export const RawAudio = {
  name: 'RawAudio',
  html: (p, ctx) => {
    const len = ctx.shot.len, pts = [[0, 0], [6, 1], [len - 9, 1], [len, 0]];
    const lane = JSON.stringify({ version: 1, lanes: [{ target: 'volume', points: pts.map(([f, v]) => ({ t: +(f / 60).toFixed(6), v })) }] });
    return `<audio id="ra${p.track}" class="clip" src="assets/media/ubr_audio.wav" data-start="${(Math.round(p.at * 60) / 60).toFixed(6)}" data-duration="${(len / 60).toFixed(6)}" data-media-start="${(Math.round(p.trim * 60) / 60).toFixed(6)}" data-track-index="${p.track}" data-volume="1" data-automation="${ctx.esc(lane)}"></audio>`;
  },
};

export default [Vid8, TitleC08, SoArm, RawCaps8, Page8, RawAudio];
