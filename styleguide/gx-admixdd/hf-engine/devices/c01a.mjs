// Case 1 devices, part A (ports of C1Devices.tsx): C1Map, Page, Restack, FreezeBWPush. Part B = c01b.mjs; index = c01.mjs.
// Contract: see devices/shared.mjs header. Vid and Credit (c01b) are used by name through ctx.node().
import { Vignette } from './shared.mjs';
const AF = 'af';
const CYAN = '#45FDFC', CURSOR = '#A51F20'; // tokens C.cyan, C.cursor

/** freeze_bw + push: frame `at` of a clip held B/W (Vid bw, mv none, vig 0.45), tiltUp deg 3 at rate*2.5. */
export const FreezeBWPush = {
  name: 'FreezeBWPush',
  html: (p, ctx) => {
    const { src, at, rate = 0.015 } = p;
    const img = ctx.still(src, Math.round(at * 60));
    const vid = `<div class="${AF}" style="overflow:hidden;background-color:#050607"><div class="${AF}" style="transform:scale(1);transform-origin:50% 50%;filter:contrast(1.05) grayscale(1) contrast(1.12)"><img src="${img}" style="width:100%;height:100%" alt=""></div>${Vignette.html({ k: 0.45 })}</div>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:#000">${ctx.node({ d: 'Move', p: { kind: 'tiltUp', deg: 3, rate: rate * 2.5 }, k: [{ raw: vid }] })}</div>`;
  },
};

/** Restack: road (top 538 px, src offset -430) over cabin (top 542, offset -271), 4 px black seam; road dims to 0.4 at dimAt. */
export const Restack = {
  name: 'Restack',
  html: (p, ctx) => {
    const { road, cabin, dimAt = 1e9 } = p;
    const half = (v, y, off) => `<div style="position:absolute;left:0;top:${y}px;width:1920px;height:538px;overflow:hidden"><div style="position:absolute;left:0;top:${off}px;width:1920px;height:1080px">${ctx.node({ d: 'Vid', p: { ...v, vig: 0.25 } })}</div></div>`;
    return `<div class="${AF}" ${ctx.dev('Restack', { dimAt })} style="background-color:#000">${half(road, 0, -430)}${half(cabin, 542, -271)}<div style="position:absolute;left:0;right:0;top:538px;height:4px;background-color:#000"></div>${Vignette.html({ k: 0.4 })}</div>`;
  },
  render: function (el, f, p, G) {
    var d = G.ease(f / 60, [p.dimAt, p.dimAt + 0.3], [1, 0.4]);
    el.children[0].style.filter = d < 1 ? 'brightness(' + d + ')' : '';
  },
};

/** Page: document png (1920 x h) under a keyframed camera cam [t, cx, cy, zoom] (E.dive), pop +9 % eased 0.6 s,
 *  whole-shot Move mv, yellow multiply highlight marks {b:[x0,y0,x1,y1], at, d} wiping in; credit bottom-right. off = page-time offset. */
export const Page = {
  name: 'Page',
  html: (p, ctx) => {
    const { src, h, cam, marks = [], credit, pop = true, off = 0, mv = 'push', rate = 0.005, deg = 2.5 } = p;
    const mk = marks.map((m) => { const [x0, y0, x1, y1] = m.b; return `<div style="position:absolute;left:${x0 - 6}px;top:${y0 - 3}px;width:0px;height:${y1 - y0 + 6}px;background-color:rgba(255,222,0,0.92);mix-blend-mode:multiply;border-radius:3px;display:none"></div>`; }).join('');
    const pg = `<div class="pg" style="position:absolute;left:0;top:0;width:1920px;height:${h}px;transform-origin:0 0;filter:brightness(0.9) contrast(1.06) saturate(0.88)"><img src="assets/media/${src}.png" style="width:1920px;height:${h}px" alt="">${mk}</div>`;
    const P = { h, cam, marks: marks.map((m) => [m.b[0], m.b[2], m.at, m.d ?? 0.55]), pop, off };
    return `<div class="${AF}" ${ctx.dev('Page', P)} style="background-color:#0b0d0e;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: mv, rate, deg }, k: [{ raw: pg }] })}<div class="${AF}" style="background-color:rgba(14,58,68,0.10);mix-blend-mode:multiply"></div>${Vignette.html({ k: 0.42 })}${credit ? ctx.node({ d: 'Credit', p: { text: credit, corner: 'br' } }) : ''}</div>`;
  },
  render: function (el, f, p, G) {
    var tl = f / 60, t = tl + p.off, cam = p.cam, h = p.h;
    var pg = el._pg || (el._pg = el.querySelector('.pg'));
    var dive = el._dv || (el._dv = G.bezier(0.5, 0, 0.2, 1));
    var cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: dive };
    var ts = cam.map(function (k) { return k[0]; });
    var seg = function (i) { return cam.length > 1 ? G.interpolate(t, ts, cam.map(function (k) { return k[i]; }), cl) : cam[0][i]; };
    var z = seg(3) * (p.pop ? 1 + 0.09 * (1 - G.ease(tl, [0, 0.6], [0, 1])) : 1);
    var hw = 960 / z, hh = 540 / z;
    var cx = Math.min(1920 - hw, Math.max(hw, seg(1)));
    var cy = Math.min(h - hh, Math.max(hh, seg(2)));
    pg.style.transform = 'translate(' + (960 - cx * z) + 'px, ' + (540 - cy * z) + 'px) scale(' + z + ')';
    for (var i = 0; i < p.marks.length; i++) {
      var m = p.marks[i], d = pg.children[i + 1];
      var q = G.ease(t, [m[2], m[2] + m[3]], [0, 1]);
      if (q <= 0) { d.style.display = 'none'; continue; }
      d.style.display = 'block';
      d.style.width = (m[1] - m[0] + 12) * q + 'px';
    }
  },
};

// ---------- map: EOX plates in one Web-Mercator space (z14 world px), cyan pins, typed labels ----------
const LL = {
  route: [53.1585, -1.2654], tibshelf: [53.1428, -1.3424], worcester: [53.1741, -1.1883], skegby: [53.1431, -1.2571],
  mwood: [53.1654, -1.1919], mansfield: [53.1444, -1.1964],
};
const W14 = 256 * 2 ** 14;
const wx = (lon) => ((lon + 180) / 360) * W14;
const wy = (lat) => { const r = (lat * Math.PI) / 180; return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * W14; };
const WP = Object.fromEntries(Object.entries(LL).map(([k, [lat, lon]]) => [k, [wx(lon), wy(lat)]]));
const PLATES = [
  ['map_route_z10', 'route', 10], ['map_route_z11', 'route', 11], ['map_route_z12', 'route', 12], ['map_route_z13', 'route', 13],
  ['map_tibshelf_z13', 'tibshelf', 13], ['map_worcester_z13', 'worcester', 13], ['map_tibshelf_z14', 'tibshelf', 14], ['map_worcester_z14', 'worcester', 14],
];

/** C1Map: cam [t, place, zoom] (E.dive) + eased drift 0.025*dur; pins {at, t, l1, l2, side, labelAt}; dimAt: plates dim + 4 px blur. */
export const C1Map = {
  name: 'C1Map',
  html: (p, ctx) => {
    const { cam, pins, dimAt = 1e9 } = p;
    const soft = 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 80%, transparent 100%)';
    const plates = PLATES.map(([n], i) => `<img src="assets/media/${n}.png" style="position:absolute;display:none${i ? `;-webkit-mask-image:${soft};mask-image:${soft}` : ''}" alt="">`).join('');
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
      cam: cam.map(([t, k, z]) => [t, WP[k][0], WP[k][1], z]), dimAt,
      plates: PLATES.map(([, k, z]) => [WP[k][0], WP[k][1], z]),
      pins: pins.map((q) => ({ x: WP[q.at][0], y: WP[q.at][1], t: q.t, la: q.labelAt ?? q.t, dir: (q.side ?? 'right') === 'right' ? 1 : -1, l1: q.l1 ?? '', l2: q.l2 ?? '' })),
    };
    return `<div class="${AF}" ${ctx.dev('C1Map', P)} style="background-color:#000;overflow:hidden"><div class="${AF}">${plates}</div><div class="${AF}" style="background-color:rgba(10,60,70,0.34);mix-blend-mode:multiply"></div><div class="${AF}" style="background-color:rgba(20,90,100,0.10);mix-blend-mode:screen"></div>${Vignette.html({ k: 0.5 })}<div class="${AF}">${pinHtml}</div><div style="position:absolute;right:28px;bottom:18px;font-family:'Share Tech Mono';font-size:18px;color:rgba(232,232,232,0.7)">Sentinel-2 cloudless – s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016)</div></div>`;
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
    var dim = G.ease(t, [p.dimAt, p.dimAt + 0.5], [0, 1]);
    var pl = el.children[0];
    pl.style.filter = 'saturate(' + (0.6 - 0.3 * dim) + ') contrast(1.12) brightness(' + 0.82 * (1 - 0.58 * dim) + ') ' + (dim > 0.01 ? 'blur(' + (dim * 4).toFixed(2) + 'px)' : '');
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
      var pinS = G.ease(u, [0, 10 / 60], [1.5, 1]), ring = ((u * 60) % 24) / 24;
      var sv = w.children[0], rc = sv.children[0];
      rc.setAttribute('cx', x); rc.setAttribute('cy', y); rc.setAttribute('r', 10 + ring * 26); rc.setAttribute('opacity', (1 - ring) * 0.65);
      sv.children[1].setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + pinS + ')');
      if (!P.l2) continue;
      var v = t - P.la, dir = P.dir, lead = G.ease(v, [0, 8 / 60], [0, 1]);
      var lx = x + dir * 150, ly = y - 110, ln = sv.children[2];
      if (v >= 0) {
        ln.style.display = '';
        ln.setAttribute('x1', x + dir * 10); ln.setAttribute('y1', y - 8);
        ln.setAttribute('x2', x + dir * 10 + (lx - x - dir * 10) * lead); ln.setAttribute('y2', y - 8 + (ly - y + 8) * lead);
      } else ln.style.display = 'none';
      var lab = w.children[1];
      if (v < 8 / 60) { lab.style.display = 'none'; continue; }
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

export default [C1Map, Page, Restack, FreezeBWPush];
