// Case 6 devices (ports of C6Devices.tsx): Vid6, Ins6, SoSpot6, Title6, Torch6, Page6. Credit / TypedTag = c01b.mjs (use by name).
// Contract: see devices/shared.mjs header. Footage in hf-engine/media/case06 (lou_full / lou_pb mp4, page pngs).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = process.env.GX_ENGINE_PUBLIC ? path.join(process.env.GX_ENGINE_PUBLIC, 'case06') : path.resolve(HERE, '..', 'media', 'case06');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());
export const LOU_CREDIT = 'Louisville Metro Police release · YouTube: Rollcall2go';

/** Vid6: graded lou_full / lou_pb clip (muted). raw = linear drift base + rate*t (untouched); else eased Move (rate/base) + static scale. */
export const Vid6 = {
  name: 'Vid6',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 1, base = 1.0, rate = 0.012, origin, vig = 0.4, filter, raw = false, mv = 'push', deg } = p;
    const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60, md = ctx.win[1] > ctx.win[0] ? mediaDur(src) : Infinity;
    const hold = end > md + 1e-6 ? md - 1 / 60 : undefined;
    const flt = filter ?? 'contrast(1.05)';
    const inner = `<div class="${AF}" ${raw ? ctx.dev('Vid6', { base, rate }) : ''} style="transform:scale(${base});transform-origin:${origin ?? '50% 50%'};filter:${flt}">${ctx.node({ d: 'Clip', p: { src, trim, speed, hold } })}</div>`;
    const mvN = { d: 'Move', p: { kind: raw ? 'none' : mv, rate: rate / base, deg, origin }, k: [{ raw: inner }] };
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node(mvN)}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p) { el.style.transform = 'scale(' + (p.base + p.rate * (f / 60)) + ')'; },
};

/** Ins6: slowed lou_pb insert (punched in so the cut-off clock leaves the frame). */
export const Ins6 = {
  name: 'Ins6',
  html: (p, ctx) => {
    const { trim, speed = 0.5, base = 1.35, origin = '51% 72%', mv } = p;
    return ctx.node({ d: 'Vid6', p: { src: 'lou_pb', trim, speed, base, rate: 0.025, origin, mv, filter: 'contrast(1.08) saturate(0.9)' } });
  },
};

/** SO-b: solarise (cyan-white rim) in a soft ellipse; live video until freezeAt, then the frozen frame (Clip hold = still). */
export const SoSpot6 = {
  name: 'SoSpot6',
  html: (p, ctx) => {
    const { src, trim, freezeAt, cx, cy, rx, ry, base = 1.0, origin = '50% 50%' } = p;
    const at = Math.round(freezeAt * 60), fid = ctx.id('c6sol');
    const body = () => ctx.node({ d: 'Clip', p: { src, trim, speed: 1, hold: trim + (at + 0.01) / 60 } });
    const defs = `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.55 1.6 0.25 0 0  0.55 1.6 0.25 0 0  0.55 1.6 0.25 0 0  0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues="0 0.10 0.62 0.92 0.35 0"/><feFuncG type="table" tableValues="0 0.22 0.92 1 0.42 0"/><feFuncB type="table" tableValues="0 0.35 1 1 0.48 0.02"/></feComponentTransfer></filter></svg>`;
    const scene = `<div class="${AF}" style="transform:scale(${base});transform-origin:${origin}"><div class="${AF}" style="filter:contrast(1.05)">${body()}</div><div class="${AF}" ${ctx.dev('SoSpot6', { at, dur: ctx.dur, rx, ry, cx, cy })} style="opacity:0;filter:url(#${fid})">${body()}</div></div>`;
    const mv = ctx.node({ d: 'Move', p: { kind: 'push', rate: 0.015, origin }, k: [{ raw: scene }] });
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${defs}${mv}${Vignette.html({ k: 0.42 })}</div>`;
  },
  render: function (el, f, p, G) {
    var c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE };
    var mix = G.interpolate(f, [p.at - 12, p.at], [0, 1], c);
    var shrink = G.interpolate(f, [p.at, Math.round(p.dur * 60)], [1, 0.92], c);
    var mask = 'radial-gradient(ellipse ' + p.rx * shrink + '% ' + p.ry * shrink + '% at ' + p.cx + ' ' + p.cy + ', #000 70%, transparent 100%)';
    el.style.opacity = mix;
    el.style.webkitMaskImage = mask;
    el.style.maskImage = mask;
  },
};

/** P3 two-tone shard title (white, last word cyan) over SO-b footage; 4 skewed x-band shards per line, 18 f build. Seeds c6t1 / c6t2. */
const SHARDS = [[-20, 34], [26, 61], [53, 82], [74, 120]];
const LINE_CSS = "font-family:'Archivo';font-weight:800;font-stretch:125%;letter-spacing:0.04em;line-height:1;white-space:pre;text-shadow:0 0 18px rgba(0,0,0,0.85), 0 3px 8px rgba(0,0,0,0.9)";
export const Title6 = {
  name: 'Title6',
  html: (p, ctx) => {
    const so = ctx.node({ d: 'SoSpot6', p: { src: 'lou_full', trim: 0.1, freezeAt: 0.45, cx: '55.6%', cy: '68%', rx: 11, ry: 12, base: 1.5, origin: '55% 72%' } });
    const line = (parts, size) => {
      const ln = `<div style="${LINE_CSS};font-size:${size}px">${parts.map(([text, color]) => `<span style="color:${color}">${ctx.esc(text)}</span>`).join('')}</div>`;
      return `<div style="position:relative;display:inline-block"><div style="visibility:hidden">${ln}</div>${SHARDS.map(() => `<div style="position:absolute;inset:0;display:none">${ln}</div>`).join('')}</div>`;
    };
    return `<div class="${AF}">${so}<div class="${AF}" style="background:linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 55%)"></div><div class="${AF}" ${ctx.dev('Title6', {})} style="align-items:center;top:28%;gap:26px;display:flex;flex-direction:column">${line([[p.l1, '#F2F6FF']], 50)}${line([[p.l2a, '#F2F6FF'], [p.l2b, '#6CFCFC']], 62)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: G.EASE };
    var B = [[-20, 34], [26, 61], [53, 82], [74, 120]], L = [[0.1, 'c6t1'], [0.32, 'c6t2']];
    for (var l = 0; l < 2; l++) {
      var ln = el.children[l], ff = f - Math.round(L[l][0] * 60), seed = L[l][1];
      for (var i = 0; i < 4; i++) {
        var sh = ln.children[i + 1];
        if (ff < 0) { sh.style.display = 'none'; continue; }
        var d = Math.round(G.random(seed + 'd' + i) * 6);
        var pp = G.interpolate(ff, [d, d + 12], [0, 1], c);
        var dx = (G.random(seed + 'x' + i) - 0.5) * 260 * (1 - pp), dy = (G.random(seed + 'y' + i) - 0.5) * 40 * (1 - pp);
        var a = B[i][0], b = B[i][1], sk = 8;
        sh.style.display = '';
        sh.style.clipPath = 'polygon(' + (a + sk) + '% 0%, ' + (b + sk) + '% 0%, ' + (b - sk) + '% 100%, ' + (a - sk) + '% 100%)';
        sh.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
        sh.style.opacity = Math.min(1, pp * 1.6);
        sh.style.filter = pp < 1 ? 'drop-shadow(' + (1 - pp) * 10 + 'px 0 0 rgba(255,40,60,0.7)) drop-shadow(' + -(1 - pp) * 10 + 'px 0 0 rgba(69,253,252,0.7))' : '';
      }
    }
  },
};

/** SP-b dark torch: Vid6 + radial dark (0.86 * k) + faint screen glow on (cx, cy); k eases in over [on, on + 0.5]. */
export const Torch6 = {
  name: 'Torch6',
  html: (p, ctx) => {
    const { cx, cy, on, w = 18, h = 35, ...v } = p;
    return `<div class="${AF}" ${ctx.dev('Torch6', { cx, cy, on, w, h })}>${ctx.node({ d: 'Vid6', p: v })}<div class="${AF}"></div><div class="${AF}" style="mix-blend-mode:screen"></div></div>`;
  },
  render: function (el, f, p, G) {
    var k = G.ease(f / 60, [p.on, p.on + 0.5], [0, 1]), g = 'ellipse ' + p.w / 2 + '% ' + p.h / 2 + '% at ' + p.cx + ' ' + p.cy;
    el.children[1].style.background = 'radial-gradient(' + g + ', rgba(0,0,0,0) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,' + (0.86 * k).toFixed(3) + ') 100%)';
    el.children[2].style.background = 'radial-gradient(' + g + ', rgba(255,255,255,' + (0.07 * k).toFixed(3) + ') 0%, rgba(255,255,255,0) 60%)';
  },
};

/** Page6: page png (1920 x h, optional cut rows) under camera cam [t, cx, cy, zoom] (E.dive), pop 9 % over 0.6 s, Move (rate 0.005, deg 2.5),
 *  yellow multiply marks, PW orange boxes over a blurred page, teal multiply, vignette, credit br. Coords in ORIGINAL page space (cut applied here). */
export const Page6 = {
  name: 'Page6',
  html: (p, ctx) => {
    const { src, h: h0, cam: cam0, marks: marks0 = [], pw: pw0 = [], credit, pop = true, off = 0, cut, mv = 'push', rate = 0.005, deg = 2.5 } = p;
    const dyc = cut ? cut[1] - cut[0] : 0, my = (y) => (cut && y >= cut[1] ? y - dyc : y), h = h0 - dyc;
    const mb = (m) => ({ ...m, b: [m.b[0], my(m.b[1]), m.b[2], my(m.b[3])] });
    const cam = cam0.map((k) => [k[0], k[1], my(k[2]), k[3]]), marks = marks0.map(mb), pw = pw0.map(mb);
    const url = `assets/media/${src}.png`;
    const img = () => !cut ? `<img src="${url}" style="display:block;width:1920px;height:${h0}px" alt="">`
      : `<div style="position:relative;width:1920px;height:${h}px;overflow:hidden"><div style="position:absolute;left:0;top:0;width:1920px;height:${cut[0]}px;overflow:hidden"><img src="${url}" style="display:block;width:1920px;height:${h0}px" alt=""></div><div style="position:absolute;left:0;top:${cut[0]}px;width:1920px;height:${h0 - cut[1]}px;overflow:hidden"><img src="${url}" style="position:absolute;left:0;top:${-cut[1]}px;width:1920px;height:${h0}px" alt=""></div></div>`;
    const pwH = pw.map((m) => { const [x0, y0, x1, y1] = m.b; return `<div style="display:none"><div style="position:absolute;left:${x0 - 8}px;top:${y0 - 5}px;width:${x1 - x0 + 16}px;height:${y1 - y0 + 10}px;overflow:hidden"><div style="position:absolute;left:${-(x0 - 8)}px;top:${-(y0 - 5)}px;width:1920px;height:${h}px">${img()}</div></div><div style="position:absolute;box-sizing:content-box;left:${x0 - 10}px;top:${y0 - 7}px;width:0;height:${y1 - y0 + 14}px;border:3px solid #F1580A;border-radius:7px;box-shadow:0 0 10px rgba(241,88,10,0.45)"></div></div>`; }).join('');
    const mkH = marks.map((m) => { const [x0, y0, , y1] = m.b; return `<div style="position:absolute;display:none;left:${x0 - 6}px;top:${y0 - 3}px;width:0;height:${y1 - y0 + 6}px;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px"></div>`; }).join('');
    const P = { h, cam, marks, pw, pop, off, mv, rate, deg };
    return `<div class="${AF}" style="background-color:#0b0d0e;overflow:hidden"><div class="${AF}" ${ctx.dev('Page6', P)}><div style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><div style="position:absolute;inset:0">${img()}</div>${pwH}${mkH}</div></div><div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var tl = f / 60, t = tl + p.off, cam = p.cam, h = p.h, dur = Math.max(0.1, S.dur), pg = el.children[0];
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (p.pop ? 1 + 0.09 * (1 - G.ease(tl, [0, 0.6], [0, 1])) : 1);
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1))), cy = Math.min(h - hh, Math.max(hh, seg(2)));
    el.style.transform = G.moveCss(p.mv, tl / dur, dur, { rate: p.rate, deg: p.deg });
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    var pwK = p.pw.length ? G.ease(t, [p.pw[0].at, p.pw[0].at + 0.4], [0, 1]) : 0;
    pg.children[0].style.filter = pwK > 0 ? 'blur(' + (2.6 * pwK).toFixed(2) + 'px) brightness(' + (1 - 0.35 * pwK).toFixed(3) + ')' : '';
    var np = p.pw.length, i, m, q, b;
    for (i = 0; i < np; i++) {
      m = p.pw[i]; b = m.b; q = G.ease(t, [m.at, m.at + (m.d == null ? 0.45 : m.d)], [0, 1]);
      var w = pg.children[1 + i];
      w.style.display = q > 0 ? '' : 'none';
      if (q > 0) w.children[1].style.width = (b[2] - b[0] + 20) * q + 'px';
    }
    for (i = 0; i < p.marks.length; i++) {
      m = p.marks[i]; b = m.b; q = G.ease(t, [m.at, m.at + (m.d == null ? 0.45 : m.d)], [0, 1]);
      var e = pg.children[1 + np + i];
      e.style.display = q > 0 ? '' : 'none';
      if (q > 0) e.style.width = (b[2] - b[0] + 12) * q + 'px';
    }
  },
};

export default [Vid6, Ins6, SoSpot6, Title6, Torch6, Page6];
