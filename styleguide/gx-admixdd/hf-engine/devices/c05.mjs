// Case 5 devices (ports of C05Devices.tsx): V5, Hold, Spot, Duo, CC2Title, Stakes, Page5, Map5. Credit = c01b.mjs (use by name).
// Contract: see devices/shared.mjs header.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const BLACK = '#050607'; // tokens C.black
const CYAN = '#45FDFC', CYAN_GLOW = 'rgba(69,253,252,0.60)', CURSOR = '#A51F20', TITLE_WHITE = '#F2F6FF';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = process.env.GX_ENGINE_PUBLIC ? path.join(process.env.GX_ENGINE_PUBLIC, 'case05') : path.resolve(HERE, '..', 'media', 'case05');
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());

/** Clip node; OffthreadVideo past the clip end shows its last frame: hold it when the window runs past the media. */
const clipNode = (ctx, { src, trim = 0, speed = 1 }) => {
  const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60;
  const hold = ctx.win[1] > ctx.win[0] && end > mediaDur(src) + 1e-6 ? mediaDur(src) - 1 / 60 : undefined;
  return { d: 'Clip', p: { src, trim, speed, hold } };
};

/** Strip: blurred copy of the same picture in a masked window over the date/time strip (bottom right). */
const strip = (inner) => {
  const m = 'linear-gradient(to right, transparent 0, #000 70px), linear-gradient(to bottom, transparent 0, #000 30px)';
  return `<div style="position:absolute;left:900px;top:900px;width:1020px;height:180px;overflow:hidden;-webkit-mask-image:${m};mask-image:${m};-webkit-mask-composite:source-in;mask-composite:intersect"><div style="position:absolute;left:-900px;top:-900px;width:1920px;height:1080px;filter:blur(18px)">${inner}</div></div>`;
};

/** V5: graded clip (muted). raw = untouched; else eased whole-shot Move (rate 0.012, deg 2) + strip blur. fade = faded insert. */
export const V5 = {
  name: 'V5',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 1, base = 1.0, rate = 0.012, origin, filter, vig = 0.45, fade, mv = 'push', deg = 2, raw, strip: stripOn = true } = p;
    const flt = filter ?? (fade ? 'saturate(0.35) brightness(0.86) contrast(1.06)' : src === 'ch_D' ? 'brightness(1.3) contrast(1.12) saturate(1.25)' : src.startsWith('ch_') ? 'brightness(1.08) contrast(1.16) saturate(1.3)' : 'contrast(1.05)');
    const cn = clipNode(ctx, { src, trim, speed });
    let body;
    if (raw) body = `<div class="${AF}" style="filter:${flt}">${ctx.node(cn)}</div>`;
    else {
      const pic = `<div class="${AF}" style="${base !== 1 ? `transform:scale(${base});` : ''}transform-origin:${origin ?? '50% 50%'}">${ctx.node(cn)}${stripOn ? strip(ctx.node(cn)) : ''}</div>`;
      body = ctx.node({ d: 'Move', p: { kind: mv, rate, deg, origin }, k: [{ raw: `<div class="${AF}" style="filter:${flt}">${pic}</div>` }] });
    }
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${body}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
};

/** Hold: one frame (still png or a clip frame) held under camera keys [t, originX %, originY %, scale] (E.dive) + eased drift; bw->colour, crush. */
export const Hold = {
  name: 'Hold',
  html: (p, ctx) => {
    const { src, at = 0, png, cam, bwTo, crush, dr = 0.005, strip: stripOn } = p;
    const img = png ? `assets/media/${src}.png` : ctx.still(src, Math.round(at * 60));
    const pic = `<img src="${img}" style="position:absolute;inset:0;width:100%;height:100%" alt="">`;
    const P = { cam, bwTo, crush, dr };
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}"><div class="${AF}" ${ctx.dev('Hold', P)}>${pic}${stripOn ? strip(pic) : ''}</div>${Vignette.html({ k: 0.45 })}</div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, cam = p.cam, dur = Math.max(0.1, S.dur);
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var ip = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var g = p.bwTo != null ? G.ease(t, [p.bwTo - 0.6, p.bwTo], [1, 0]) : 0;
    var b = p.crush ? G.ease(t, [p.crush[0], p.crush[1]], [0.4, 1]) : 1;
    el.style.transformOrigin = ip(1) + '% ' + ip(2) + '%';
    el.style.transform = 'scale(' + (ip(3) * (1 + p.dr * dur * G.drift(t / dur))).toFixed(5) + ')';
    el.style.filter = 'grayscale(' + g.toFixed(3) + ') brightness(' + b.toFixed(3) + ') contrast(' + (1.05 + (1 - b) * 0.2).toFixed(3) + ')';
  },
};

/** SP-b dark-torch spotlight: V5 + radial dark + screen glow following path [t, x, y] (E.dive). */
export const Spot = {
  name: 'Spot',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Spot', { path: p.path, on: p.on ?? 0.5 })}>${ctx.node({ d: 'V5', p: p.v })}<div class="${AF}"></div><div class="${AF}" style="mix-blend-mode:screen"></div></div>`,
  render: function (el, f, p, G) {
    var t = f / 60, path = p.path;
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = path.map(function (k) { return k[0]; });
    var ip = function (i) { return G.interpolate(t, ts, path.map(function (k) { return k[i]; }), cl); };
    var k = G.ease(t, [0, p.on], [0, 1]), x = ip(1), y = ip(2), r = 230;
    el.children[1].style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(0,0,0,0) ' + r + 'px, rgba(2,4,5,' + (0.8 * k).toFixed(3) + ') ' + r * 1.75 + 'px)';
    el.children[2].style.background = 'radial-gradient(circle at ' + x + 'px ' + y + 'px, rgba(255,246,226,' + (0.07 * k).toFixed(3) + ') 0px, rgba(0,0,0,0) ' + r + 'px)';
  },
};

/** DU cyan duotone: grey V5 (no vignette) x #45E8F0 multiply, #04181C screen, vignette 0.5. */
export const Duo = {
  name: 'Duo',
  html: (p, ctx) => `<div class="${AF}">${ctx.node({ d: 'V5', p: { ...p.v, vig: 0, filter: 'grayscale(1) contrast(1.35) brightness(1.08)' } })}<div class="${AF}" style="background-color:#45E8F0;mix-blend-mode:multiply"></div><div class="${AF}" style="background-color:#04181C;mix-blend-mode:screen"></div>${Vignette.html({ k: 0.5 })}</div>`,
};

/** CC2 shard-build title (white face): each line assembles from 7 vertical shards (seeds c05a / c05b). Local t of the overlay/shot. */
const SHARDS = 7;
export const CC2Title = {
  name: 'CC2Title',
  html: (p, ctx) => {
    const line = (text, size, weight) => `<div style="position:relative;height:${size * 1.12}px;width:100%">${Array.from({ length: SHARDS }, () => `<div style="position:absolute;inset:0;display:none"><div style="text-align:center;font-family:'Archivo';font-weight:${weight};font-size:${size}px;line-height:1.12;letter-spacing:0.04em;color:${TITLE_WHITE}">${ctx.esc(text)}</div></div>`).join('')}</div>`;
    return `<div class="${AF}" ${ctx.dev('CC2Title', { land1: p.land1, land2: p.land2, out: p.out })} style="justify-content:center;align-items:center"><div style="width:1440px;display:flex;flex-direction:column;align-items:center;gap:18px">${line(p.l1, 48, 600)}${line(p.l2, 66, 800)}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, N = 7;
    el.style.opacity = G.ease(t, [p.out - 0.3, p.out], [1, 0]);
    var L = [[el.children[0].children[0], p.land1, 'c05a'], [el.children[0].children[1], p.land2, 'c05b']];
    for (var l = 0; l < 2; l++) {
      var ln = L[l][0], land = L[l][1], seed = L[l][2];
      for (var i = 0; i < N; i++) {
        var sh = ln.children[i];
        var a = (i / N) * 100, b = ((i + 1) / N) * 100;
        var sk = 3 * (G.random(seed + 'k' + i) - 0.5);
        var st = land - 0.42 + 0.05 * i * G.random(seed + 'd' + i);
        var pp = G.ease(t, [st, st + 0.42], [0, 1]);
        if (pp <= 0) { sh.style.display = 'none'; continue; }
        var dx = (G.random(seed + 'x' + i) - 0.5) * 220 * (1 - pp), dy = (G.random(seed + 'y' + i) - 0.5) * 140 * (1 - pp), rot = (G.random(seed + 'r' + i) - 0.5) * 14 * (1 - pp);
        sh.style.display = 'block';
        sh.style.clipPath = 'polygon(' + (a + sk) + '% 0, ' + (b + sk) + '% 0, ' + (b - sk) + '% 100%, ' + (a - sk) + '% 100%)';
        sh.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) rotate(' + rot + 'deg)';
        sh.style.opacity = Math.min(1, pp * 1.6);
        sh.children[0].style.textShadow = '0 0 18px rgba(186,254,255,' + (0.35 * pp).toFixed(2) + '), 0 3px 10px rgba(0,0,0,0.9)';
      }
    }
  },
};

/** SW stakes text wipe: 16 f wipe in (left -> right), cyan leading edge, hold, 12 f wipe out. VT323 132 px at top 690. */
export const Stakes = {
  name: 'Stakes',
  html: (p, ctx) => `<div ${ctx.dev('Stakes', p)} style="position:absolute;left:0;right:0;top:690px;display:none;justify-content:center"><div style="position:relative;padding:6px 44px 2px;background-color:rgba(0,0,0,0.62)"><div style="font-family:'VT323';font-size:132px;line-height:1;color:#F4F7F7;letter-spacing:0.04em;text-shadow:0 0 10px rgba(186,254,255,0.35)">${ctx.esc(p.text)}</div><div style="position:absolute;top:0;bottom:0;left:0;width:10px;margin-left:-10px;background-color:${CYAN};box-shadow:0 0 16px ${CYAN_GLOW}"></div></div></div>`,
  render: function (el, f, p, G) {
    var t = f / 60;
    if (t < p.at || t > p.out) { el.style.display = 'none'; return; }
    var pin = G.ease(t, [p.at, p.at + 16 / 60], [0, 100]), pout = G.ease(t, [p.out - 12 / 60, p.out], [0, 100]);
    var box = el.children[0], edge = box.children[1];
    el.style.display = 'flex';
    box.style.clipPath = 'inset(0 ' + (100 - pin) + '% 0 ' + pout + '%)';
    edge.style.display = pin < 100 ? '' : 'none';
    edge.style.left = pin + '%';
  },
};

/** Page5: page png (1920 x h) under camera cam [t, cx, cy, zoom] (E.dive), pop +9 % over 0.35 s, drift 0.004*dur, optional 3-D turn mv, teal multiply, credit br. */
export const Page5 = {
  name: 'Page5',
  html: (p, ctx) => {
    const { src, h, cam, credit, off = 0, mv, deg = 1.5 } = p;
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.94) contrast(1.22) saturate(0.88)"><img src="assets/media/page_${src}_full.png" style="width:1920px;height:${h}px" alt=""></div>`;
    return `<div class="${AF}" ${ctx.dev('Page5', { h, cam, off, mv, deg })} style="background-color:#0b0d0e;overflow:hidden"><div class="${AF}">${pg}</div><div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G, S) {
    var tl = f / 60, t = tl + p.off, cam = p.cam, h = p.h, dur = Math.max(0.1, S.dur);
    var wrap = el.children[0], pg = wrap.children[0];
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (1 + 0.09 * (1 - G.ease(tl, [0, 0.35], [0, 1]))) * (1 + 0.004 * dur * G.drift(tl / dur));
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    wrap.style.transform = p.mv ? G.moveCss(p.mv, tl / dur, dur, { rate: 0, deg: p.deg }) : '';
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
  },
};

// ---------- MD map dive: EOX plates in one Web-Mercator space, cyan pins, typed callouts ----------
const LL = { lufkin: [31.3382, -94.7291], zavalla: [31.1574, -94.4246], route: [31.2478, -94.5768] };
const W14 = 256 * 2 ** 14;
const wx = (lon) => ((lon + 180) / 360) * W14;
const wy = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * W14; };
const WP = Object.fromEntries(Object.entries(LL).map(([k, [lat, lon]]) => [k, [wx(lon), wy(lat)]]));
const PLATES = [
  ['route_z10', 'route', 10], ['route_z11', 'route', 11], ['route_z12', 'route', 12],
  ['lufkin_z13', 'lufkin', 13], ['zavalla_z13', 'zavalla', 13], ['lufkin_z14', 'lufkin', 14], ['zavalla_z14', 'zavalla', 14],
];

/** Map5: cam [t, place, zoom] (E.dive) + eased drift 0.025*dur; pins {at, t, l1, l2, side, labelAt}. */
export const Map5 = {
  name: 'Map5',
  html: (p, ctx) => {
    const { cam, pins } = p;
    const soft = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 80%, transparent 100%)';
    const plates = PLATES.map(([n], i) => `<img src="assets/media/v6_map_map_${n}.png" style="position:absolute;display:none${i ? `;-webkit-mask-image:${soft};mask-image:${soft}` : ''}" alt="">`).join('');
    const face = `font-family:'Courier Prime';font-weight:700;color:#EFFAF7;white-space:pre;text-shadow:0 0 6px rgba(239,250,247,0.35)`;
    const cur = `<span style="display:none;width:0.55em;height:0.78em;background-color:${CURSOR};margin-left:0.05em;vertical-align:-0.08em"></span>`;
    const row = (txt, st) => `<div style="${face};${st}"><span></span>${cur}<span style="visibility:hidden">${ctx.esc(txt)}</span></div>`;
    const pinHtml = pins.map((q) => {
      const l2 = q.l2 ?? '', l1 = q.l1 ?? '';
      const svg = `<svg width="1920" height="1080" style="position:absolute;inset:0"><circle r="10" fill="none" stroke="${CYAN}" stroke-width="2"></circle><g><circle r="10" fill="${CYAN}" stroke="#031014" stroke-width="4"></circle><circle r="3" fill="#031014"></circle></g>${l2 ? `<line stroke="${CYAN}" stroke-width="2" style="display:none"></line>` : ''}</svg>`;
      const lab = l2 ? `<div style="position:absolute;display:none;background-color:rgba(0,0,0,0.6);padding:10px 20px 10px">${row(l2, 'font-size:56px;line-height:1.05')}${l1 ? row(l1, 'font-size:36px;line-height:1.15;opacity:0.92') : ''}</div>` : '';
      return `<div class="${AF}" style="display:none">${svg}${lab}</div>`;
    }).join('');
    const P = {
      cam: cam.map(([t, k, z]) => [t, WP[k][0], WP[k][1], z]),
      plates: PLATES.map(([, k, z]) => [WP[k][0], WP[k][1], z]),
      pins: pins.map((q) => ({ x: WP[q.at][0], y: WP[q.at][1], t: q.t, la: q.labelAt ?? q.t, dir: (q.side ?? 'right') === 'right' ? 1 : -1, l1: q.l1 ?? '', l2: q.l2 ?? '' })),
    };
    return `<div class="${AF}" ${ctx.dev('Map5', P)} style="background-color:#000;overflow:hidden"><div class="${AF}" style="filter:saturate(0.6) contrast(1.12) brightness(0.82)">${plates}</div><div class="${AF}" style="background-color:rgba(10,60,70,0.34);mix-blend-mode:multiply"></div><div class="${AF}" style="background-color:rgba(20,90,100,0.10);mix-blend-mode:screen"></div>${Vignette.html({ k: 0.5 })}<div class="${AF}">${pinHtml}</div><div style="position:absolute;right:28px;bottom:18px;font-family:'Share Tech Mono';font-size:18px;color:rgba(232,232,232,0.7)">Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016)</div></div>`;
  },
  render: function (el, f, p, G, S) {
    var t = f / 60, cam = p.cam;
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var ip = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var dur = Math.max(0.1, S.dur);
    var z = ip(3) + 0.025 * dur * G.drift(t / dur);
    var X = ip(1), Y = ip(2), k14 = Math.pow(2, z - 14);
    var pl = el.children[0];
    for (var i = 0; i < p.plates.length; i++) {
      var q = p.plates[i], im = pl.children[i];
      if (q[2] > z + 1.6) { im.style.display = 'none'; continue; }
      var s = Math.pow(2, z - q[2]), cx = 960 + (q[0] - X) * k14, cy = 540 + (q[1] - Y) * k14;
      im.style.display = 'block';
      im.style.left = cx - 960 * s + 'px'; im.style.top = cy - 540 * s + 'px';
      im.style.width = 1920 * s + 'px'; im.style.height = 1080 * s + 'px';
    }
    var pw = el.children[4];
    for (var j = 0; j < p.pins.length; j++) {
      var P = p.pins[j], w = pw.children[j];
      if (t < P.t) { w.style.display = 'none'; continue; }
      w.style.display = 'block';
      var x = 960 + (P.x - X) * k14, y = 540 + (P.y - Y) * k14, u = t - P.t;
      var pinS = G.ease(u, [0, 10 / 60], [1.5, 1]), ring = G.EASE(((u * 60) % 24) / 24);
      var sv = w.children[0], rc = sv.children[0];
      rc.setAttribute('cx', x); rc.setAttribute('cy', y); rc.setAttribute('r', 10 + ring * 26); rc.setAttribute('opacity', (1 - ring) * 0.65);
      sv.children[1].setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + pinS + ')');
      if (!P.l2) continue;
      var v = t - P.la, dir = P.dir, lead = G.ease(v, [0, 4 / 60], [0, 1]);
      var lx = x + dir * 150, ly = y - 110, ln = sv.children[2];
      if (v >= 0) {
        ln.style.display = '';
        ln.setAttribute('x1', x + dir * 10); ln.setAttribute('y1', y - 8);
        ln.setAttribute('x2', x + dir * 10 + (lx - x - dir * 10) * lead); ln.setAttribute('y2', y - 8 + (ly - y + 8) * lead);
      } else ln.style.display = 'none';
      var lab = w.children[1];
      if (v < 4 / 60) { lab.style.display = 'none'; continue; }
      lab.style.display = 'block';
      lab.style.top = ly - 88 + 'px';
      if (dir > 0) { lab.style.left = lx + 'px'; lab.style.right = ''; lab.style.textAlign = 'left'; }
      else { lab.style.right = 1920 - lx + 'px'; lab.style.left = ''; lab.style.textAlign = 'right'; }
      var typed = Math.floor(v * 60 * 2) + 2;
      var tA = Math.min(P.l2.length, typed), tB = Math.max(0, Math.min(P.l1.length, typed - P.l2.length));
      var on = tB < P.l1.length || Math.floor(v * 2.5) % 2 === 0;
      var r1 = lab.children[0];
      r1.children[0].textContent = P.l2.slice(0, tA); r1.children[2].textContent = P.l2.slice(tA);
      r1.children[1].style.display = tA < P.l2.length ? 'inline-block' : 'none';
      r1.children[1].style.visibility = 'visible';
      if (P.l1) {
        var r2 = lab.children[1];
        r2.children[0].textContent = P.l1.slice(0, tB); r2.children[2].textContent = P.l1.slice(tB);
        r2.children[1].style.display = tA >= P.l2.length ? 'inline-block' : 'none';
        r2.children[1].style.visibility = on ? 'visible' : 'hidden';
      }
    }
  },
};

export default [V5, Hold, Spot, Duo, CC2Title, Stakes, Page5, Map5];
