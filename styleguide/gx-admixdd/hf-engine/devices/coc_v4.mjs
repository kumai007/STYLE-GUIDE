// coc_v4.mjs - v4 intro devices (owner 2026-11-17: iceberg like Abyssal Detective, no raw at the start, pro footage-wall MG on
// "Twenty-eight moments", realistic texture, narration-precise, eased). Render fns are serialised: use only (el, f, p, G, S).
// Wall = 28 graded footage tiles (live <video> windows + freezes) on a textured backdrop, eased cascade + one 2-D camera.
// BergX = berg.jpg plane, teal-grey grade, waterline shimmer, drifting fog, eased camera; BTitle = Abyssal-style blur/scale-settle title.
import { tiltWrap } from './coc.mjs';
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;
export const GRADE = 'sepia(0.06) saturate(1.4) contrast(1.22) brightness(0.96)'; // channel grade (deep blacks, sat ~0.3); cool shadows = COOL layer
export const COOL = 'background:#03070C;mix-blend-mode:screen';
const TS = 'text-shadow:0 0 22px rgba(200,198,194,0.18),0 2px 18px rgba(0,0,0,0.7),0 1px 2px rgba(0,0,0,0.8)';

// ---------------------------------------------------------------- footage wall
/** cover-place a source crop [x,y,cw,ch,SW,SH] in a w x h box -> CSS for the media element. */
function place(crop, w, h) {
  const [x, y, cw, ch, SW, SH] = crop;
  const sc = Math.max(w / cw, h / ch);
  return { sc, css: `inset:auto;left:${px((w - cw * sc) / 2 - x * sc)};top:${px((h - ch * sc) / 2 - y * sc)};width:${px(SW * sc)};height:${px(SH * sc)}` };
}
/** one tile: q = { src, t, still (native frame) | undefined = live video, crop, face [[x,y,rx,ry]] source px, x, y, w, h, at } */
function tileHtml(q, ctx) {
  const pl = place(q.crop, q.w, q.h);
  const img = q.still !== undefined ? ctx.still(q.src, q.still) : null;
  const med = (extra = '') => img
    ? `<img src="${img}" alt="" style="position:absolute;${pl.css};${extra}">`
    : ctx.video({ src: q.src, trim: q.t, fit: 'fill', style: `${pl.css};${extra}` });
  const face = (q.face || []).map(([fx, fy, rx, ry]) => {
    const [x0, y0, cw, ch] = q.crop;
    const ox = (q.w - cw * pl.sc) / 2 - x0 * pl.sc, oy = (q.h - ch * pl.sc) / 2 - y0 * pl.sc;
    const l = ox + (fx - rx) * pl.sc, t = oy + (fy - ry) * pl.sc;
    return `<div style="position:absolute;left:${px(l)};top:${px(t)};width:${px(2 * rx * pl.sc)};height:${px(2 * ry * pl.sc)};border-radius:50%;overflow:hidden;-webkit-mask-image:radial-gradient(ellipse at center,#000 60%,transparent 78%)"><div style="position:absolute;left:${px(-l)};top:${px(-t)};width:${px(q.w)};height:${px(q.h)}">${med('filter:blur(9px)')}</div></div>`;
  }).join('');
  return `<div ${ctx.dev('WTile', { at: q.at, ent: q.ent, cx: q.x + q.w / 2, cy: q.y + q.h / 2 })} style="position:absolute;left:${px(q.x)};top:${px(q.y)};width:${px(q.w)};height:${px(q.h)};opacity:0">
<div style="position:absolute;inset:0;box-shadow:0 22px 48px rgba(0,0,0,0.72),0 4px 10px rgba(0,0,0,0.6)"></div>
<div class="tb" style="position:absolute;inset:0;overflow:hidden;background:#07080A">
<div style="position:absolute;inset:0;filter:${GRADE}">${med()}${face}</div>
<div style="position:absolute;inset:0;${COOL}"></div>
<div style="position:absolute;inset:0;box-shadow:inset 0 0 70px 6px rgba(0,0,0,0.62)"></div>
<div style="position:absolute;inset:0;background:linear-gradient(118deg,rgba(255,255,255,0.09) 0%,rgba(255,255,255,0.02) 34%,rgba(255,255,255,0) 52%)"></div></div>
<div style="position:absolute;inset:0;border:1.5px solid rgba(200,198,194,0.24);box-shadow:inset 0 1px 0 rgba(255,255,255,0.10)"></div></div>`;
}
/** fog layer (screen space): white-alpha fractal noise 2x frame wide, drifts sp px/f. p = { sp, op, freq:[fx,fy], seed, mask (css gradient) } */
function fogHtml(p, ctx) {
  const id = ctx.id('fg');
  return `<div ${ctx.dev('Fog', { sp: p.sp })} style="position:absolute;left:0;top:0;width:${2 * W}px;height:${H}px;opacity:${p.op};mix-blend-mode:screen;${p.mask ? `-webkit-mask-image:${p.mask};` : ''}pointer-events:none"><svg width="${2 * W}" height="${H}" style="position:absolute;inset:0"><filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${p.freq[0]} ${p.freq[1]}" numOctaves="4" seed="${p.seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0.86 0 0 0 0 0.85 0 0 0 0 0.83 1.6 0 0 0 -0.55"/></filter><rect width="${2 * W}" height="${H}" filter="url(#${id})"/></svg></div>`;
}
export const Fog = {
  name: 'Fog',
  render: function (el, f, p) { el.style.transform = 'translateX(' + (-p.sp * f).toFixed(2) + 'px)'; },
};

/** Wall: p = { cols, rows, tw, th, gap, brick (odd-row offset), tiles:[{src,t,still,crop,face}], cam:[[f,cx,cy,z],...], origin:[x,y],
 *  at0 (f first tile), stag (f), sweep:[f0,f1] }. Tiles enter in order of distance from `origin` (eased cascade). */
export const Wall = {
  name: 'Wall',
  html: (p, ctx) => {
    const { cols, rows, tw, th, gap, brick } = p;
    const PW = cols * (tw + gap) - gap + brick, PH = rows * (th + gap) - gap;
    const pos = p.tiles.map((q, i) => ({ ...q, x: (i % cols) * (tw + gap) + (Math.floor(i / cols) % 2) * brick, y: Math.floor(i / cols) * (th + gap), w: tw, h: th }));
    const ord = pos.map((q, i) => [Math.hypot(q.x + tw / 2 - p.origin[0], (q.y + th / 2 - p.origin[1]) * 1.4), i]).sort((a, b) => a[0] - b[0]);
    ord.forEach(([, i], r) => { pos[i].at = Math.round(p.at0 + r * p.stag); pos[i].ent = p.ent; });
    const bid = ctx.id('bk');
    const back = `<div class="bk" style="position:absolute;left:-400px;top:-300px;width:${W + 800}px;height:${H + 600}px;background:radial-gradient(ellipse 55% 50% at 50% 46%,#1D1F22 0%,#0E0F11 55%,#050607 100%)">
<svg width="${W + 800}" height="${H + 600}" style="position:absolute;inset:0;mix-blend-mode:soft-light;opacity:0.7"><filter id="${bid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="5" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer></filter><rect width="${W + 800}" height="${H + 600}" filter="url(#${bid})"/></svg></div>`;
    const sweep = `<div class="sw" style="position:absolute;top:-200px;left:0;width:900px;height:${PH + 400}px;background:linear-gradient(100deg,rgba(255,255,255,0) 0%,rgba(232,229,224,0.55) 50%,rgba(255,255,255,0) 100%);mix-blend-mode:screen;opacity:0.075;pointer-events:none"></div>`;
    const plane = `<div ${ctx.dev('WCam', { cam: p.cam, path: p.path, zoom: p.zoom, sweep: p.sweep, PW })} style="position:absolute;left:0;top:0;width:${PW}px;height:${PH}px;transform-origin:0 0">
${pos.map((q) => tileHtml(q, ctx)).join('\n')}${sweep}</div>`;
    const haze = ''; // v10 owner 2026-11-17: "remove this white overlay" (fog haze off)
    // v7: 3-D parallax: the tile plane is tilted (6 deg Y, 5 deg X) and settles exactly flat (scale 1) by the dive's last key, so the
    // match-cut into the tile video stays exact; the flat backdrop behind gives the depth.
    const K = p.zoom || p.cam, tEnd = K.length > 1 ? K[K.length - 2][0] : 0;
    const tilt = p.tilt === undefined ? { a: [1.10, 5, -6, 0, 0], b: [1.0, 0, 0, 0, 0], t1: tEnd } : p.tilt;
    return `<div class="${AF}" style="overflow:hidden;background:#050607">${back}${tiltWrap(ctx, tilt, plane)}${haze}
<div class="${AF}" style="background:radial-gradient(ellipse 70% 68% at 50% 50%,rgba(0,0,0,0) 36%,rgba(0,0,0,0.72) 100%);pointer-events:none"></div></div>`;
  },
};
/** WCam: zoom-to-point camera over keys [f, cx, cy, z] (plane px), eased E = (0.35,0,0.25,1); z geometric, the next key's centre
 *  travels linearly in screen space (no swing). Motion blur <= 3 px at peak speed only; backdrop parallax 0.12; light sweep. */
export const WCam = {
  name: 'WCam',
  render: function (el, f, p, G) {
    var E = G.bezier(0.35, 0, 0.25, 1), K = p.cam;
    var at = function (t) {
      if (t <= K[0][0]) return [K[0][1], K[0][2], K[0][3]];
      for (var i = 0; i < K.length - 1; i++) {
        var a = K[i], b = K[i + 1];
        if (t < b[0]) {
          var k = E((t - a[0]) / (b[0] - a[0])), z = a[3] * Math.pow(b[3] / a[3], k);
          var sx = 960 + (b[1] - a[1]) * a[3], sy = 540 + (b[2] - a[2]) * a[3];
          var px_ = sx + (960 - sx) * k, py_ = sy + (540 - sy) * k;
          return [b[1] - (px_ - 960) / z, b[2] - (py_ - 540) / z, z];
        }
      }
      var l = K[K.length - 1];
      return [l[1], l[2], l[3]];
    }
    // v8 (owner: wall start jerky): one continuous pan along a quadratic curve p.path.P (one ease over p.path.f) with its own
    // log-zoom keys p.zoom [[f, z, ez]] overlapping it, so the camera never stops dead between moves (no stepping).
    if (p.path) {
      var PP = p.path.P, PF = p.path.f, pz = p.path.ez || [0.35, 0, 0.25, 1], EP = G.bezier(pz[0], pz[1], pz[2], pz[3]), Z = p.zoom;
      at = function (t) {
        var u = EP(Math.min(1, Math.max(0, (t - PF[0]) / (PF[1] - PF[0])))), v = 1 - u;
        var x = v * v * PP[0][0] + 2 * u * v * PP[1][0] + u * u * PP[2][0], y = v * v * PP[0][1] + 2 * u * v * PP[1][1] + u * u * PP[2][1];
        var z = Z[Z.length - 1][1];
        if (t <= Z[0][0]) z = Z[0][1];
        else for (var i = 0; i < Z.length - 1; i++) {
          var a = Z[i], b = Z[i + 1];
          if (t < b[0]) { var e = a[2] || [0.42, 0, 0.58, 1], k = G.bezier(e[0], e[1], e[2], e[3])((t - a[0]) / (b[0] - a[0])); z = a[1] * Math.pow(b[1] / a[1], k); break; }
        }
        return [x, y, z];
      };
    }
    var c = at(f), c2 = at(f + 1);
    el.__c = c;
    el.style.transform = 'translate(' + (960 - c[0] * c[2]).toFixed(2) + 'px,' + (540 - c[1] * c[2]).toFixed(2) + 'px) scale(' + c[2].toFixed(5) + ')';
    var sp = Math.hypot((c2[0] - c[0]) * c[2], (c2[1] - c[1]) * c[2]) + Math.abs(Math.log(c2[2] / c[2])) * 1100;
    var bl = Math.min(3, Math.max(0, (sp - 10) * 0.09));
    el.style.filter = bl > 0.2 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
    var bk = el.parentNode.querySelector('.bk') || el.parentNode.parentNode.querySelector('.bk'); // v7: plane sits in a tilt wrapper
    if (bk) bk.style.transform = 'translate(' + (-(c[0] - 1900) * c[2] * 0.12).toFixed(2) + 'px,' + (-(c[1] - 600) * c[2] * 0.12).toFixed(2) + 'px)';
    var sw = el.querySelector('.sw');
    if (sw && p.sweep) sw.style.transform = 'translateX(' + G.ease(f, p.sweep, [-1100, p.PW + 200], E).toFixed(1) + 'px) skewX(-12deg)';
  },
};
/** WTile: eased entry (34 f, E: opacity, scale 1.07 -> 1, blur 10 -> 0, rise 26 px) + depth of field from screen position.
 *  v8 p.ent (f): longer, softer entry (sym ease, scale 1.035 -> 1, blur 6 -> 0, rise 14 px) so overlapping entries never pop. */
export const WTile = {
  name: 'WTile',
  render: function (el, f, p, G) {
    var v8 = !!p.ent, E = v8 ? G.bezier(0.42, 0, 0.58, 1) : G.bezier(0.35, 0, 0.25, 1), k = G.ease(f, [p.at, p.at + (p.ent || 34)], [0, 1], E);
    var c = el.parentNode.__c || [960, 540, 1];
    var sx = 960 + (p.cx - c[0]) * c[2], sy = 540 + (p.cy - c[1]) * c[2];
    var d = Math.hypot((sx - 960) / 1150, (sy - 540) / 720);
    var bl = (1 - k) * (v8 ? 6 : 10) + Math.min(3.2, Math.max(0, d - 0.55) * 4.5), sc = v8 ? 0.035 : 0.07;
    el.style.opacity = k.toFixed(3);
    el.style.transform = 'translateY(' + ((1 - k) * (v8 ? 14 : 26)).toFixed(2) + 'px) scale(' + (1 + sc - sc * k).toFixed(4) + ')';
    el.style.filter = bl > 0.25 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
  },
};

// ---------------------------------------------------------------- iceberg
/** BergX: berg.jpg plane (1920 wide), realistic: teal-grey grade + deep blacks under the waterline, waterline shimmer (displaced copy +
 *  glint), two fog layers drifting opposite ways, vignette. p = { img, iw, ih, wl (row), cam:[[f,row,scale],...] (row at frame centre),
 *  ez:[4 bezier], dark:[b0,b1] brightness over the move, fade:{in,out} }. Kids (title) sit above the fog. */
export const BergX = {
  name: 'BergX',
  html: (p, ctx, node) => {
    const hh = Math.round((p.ih * W) / p.iw), wl = Math.round((p.wl * W) / p.iw);
    const sid = ctx.id('sh');
    const shim = `<svg ${ctx.dev('Shim', {})} width="${W}" height="180" style="filter:grayscale(0.2) contrast(1.38) brightness(0.96);position:absolute;left:0;top:${wl - 30}px;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 30px,#000 110px,transparent 180px)"><filter id="${sid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.11" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="7" xChannelSelector="R" yChannelSelector="G"/></filter><image href="${p.img}" x="0" y="${-(wl - 30)}" width="${W}" height="${hh}" preserveAspectRatio="none" filter="url(#${sid})"/></svg>`;
    const glint = `<div class="gl" style="position:absolute;left:0;top:${wl - 3}px;width:${W}px;height:6px;background:linear-gradient(90deg,rgba(220,228,236,0) 2%,rgba(228,236,244,0.6) 38%,rgba(228,236,244,0.28) 62%,rgba(220,228,236,0) 96%);filter:blur(1.6px);mix-blend-mode:screen"></div>
<div style="position:absolute;left:0;top:${wl - 60}px;width:${W}px;height:120px;background:radial-gradient(ellipse 60% 50% at 50% 50%,rgba(190,188,184,0.10),rgba(0,0,0,0) 70%);mix-blend-mode:screen"></div>`;
    const deep = `<div style="position:absolute;left:0;top:${wl + 60}px;width:${W}px;height:${hh - wl - 60}px;background:linear-gradient(to bottom,rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 30%,rgba(0,0,0,0.62) 70%,rgba(0,0,0,0.8) 100%)"></div>`;
    const plane = `<div ${ctx.dev('BergCam', { cam: p.cam, ez: p.ez, dark: p.dark, ih: hh, zoom: p.zoom })} style="position:absolute;left:0;top:0;width:${W}px;height:${hh}px;transform-origin:0 0">
<img src="${p.img}" alt="" style="position:absolute;left:0;top:0;width:${W}px;height:${hh}px;filter:grayscale(0.2) contrast(1.38) brightness(0.96)">
<div style="position:absolute;inset:0;background:#2F6EA8;mix-blend-mode:color;opacity:0.62"></div>
${shim}${glint}${deep}</div>`;
    const fog = ''; // v10 owner 2026-11-17: "remove this white overlay" (both drifting fog layers off)
    const vig = `<div class="${AF}" style="background:radial-gradient(ellipse 72% 72% at 50% 46%,rgba(0,0,0,0) 34%,rgba(0,0,0,0.74) 100%)"></div>`;
    const fade = p.fade ? ctx.dev('Fade3', p.fade) : '';
    // v7: 3-D parallax: berg plane pitched (p.tilt, default 7 -> 1.5 deg X) while BergCam glides; fog and title stay flat above it.
    const tilt = p.tilt === undefined ? { a: [1.08, 7, 0, 0, 0], b: [1.05, 1.5, 0, 0, 0] } : p.tilt;
    return `<div class="${AF}" ${fade} style="overflow:hidden;background:#020304${p.fade ? ';opacity:0' : ''}">${tiltWrap(ctx, tilt, plane)}${fog}${vig}${ctx.kids(node)}</div>`;
  },
};
/** BergCam: keys [f, row, scale] eased by p.ez (default E); brightness ramps p.dark over the move; motion blur at peak speed. */
export const BergCam = {
  name: 'BergCam',
  render: function (el, f, p, G) {
    var z = p.ez || [0.35, 0, 0.25, 1], E = G.bezier(z[0], z[1], z[2], z[3]), K = p.cam;
    function at(t) {
      if (t <= K[0][0]) return [K[0][1], K[0][2], 0];
      for (var i = 0; i < K.length - 1; i++) {
        var a = K[i], b = K[i + 1];
        if (t < b[0]) { var k = E((t - a[0]) / (b[0] - a[0])); return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, (i + k) / (K.length - 1)]; }
      }
      var l = K[K.length - 1];
      return [l[1], l[2], 1];
    }
    var c = at(f), c2 = at(f + 1), s = c[1];
    // v8 p.zoom = [f0, f1, s0, s1]: one slow constant zoom over the whole shot, independent of the row move (owner: berg only zooms in)
    if (p.zoom) { var zq = p.zoom, zk = Math.min(1, Math.max(0, (f - zq[0]) / (zq[1] - zq[0]))); s = zq[2] + (zq[3] - zq[2]) * zk; }
    el.style.transform = 'translate(' + ((1920 - 1920 * s) / 2).toFixed(2) + 'px,' + (540 - c[0] * s).toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';
    var sp = Math.abs(c2[0] - c[0]) * s, bl = Math.min(3.5, Math.max(0, (sp - 9) * 0.12));
    var dk = p.dark ? p.dark[0] + (p.dark[1] - p.dark[0]) * c[2] : 1;
    el.style.filter = 'brightness(' + dk.toFixed(3) + ')' + (bl > 0.2 ? ' blur(' + bl.toFixed(2) + 'px)' : '');
  },
};
/** Shim: waterline ripple (smooth: baseFrequency and displacement breathe on sines of frame time) + glint flicker. */
export const Shim = {
  name: 'Shim',
  render: function (el, f) {
    var t = f / 60;
    el.querySelector('feTurbulence').setAttribute('baseFrequency', '0.004 ' + (0.11 + 0.014 * Math.sin(t * 2.1)).toFixed(4));
    el.querySelector('feDisplacementMap').setAttribute('scale', (6 + 2.5 * Math.sin(t * 3.3 + 1)).toFixed(2));
    var g = el.parentNode.querySelector('.gl');
    if (g) g.style.opacity = (0.75 + 0.25 * Math.sin(t * 4.7)).toFixed(3);
  },
};
/** BTitle v8 p.soft = [fadeIn f0, f1] (+ p.softOut [f0, f1]): whole block (lines + rule) fades in/out as one, no blur, scale or
 *  tracking move (owner 2026-11-17: "no animation in there"). Otherwise: */
/** BTitle: Abyssal-style clean title entry: per line eased blur 16 -> 0, scale 1.10 -> 1, tracking +0.22em -> settle, opacity 0 -> 1
 *  (40 f, E, no bounce); hairline rule grows from the centre; block out = eased blur-up + fade (p.out, 24 f).
 *  p = { lines:[{t, size, top, color, track, weight, at}], rule:{top, w, at}, out }. */
export const BTitle = {
  name: 'BTitle',
  html: (p, ctx) => {
    // v8: the Tex grain/lift overlay (screen/overlay blend, see coc_v3 Tex) sits above every shot by design -> allow that layering
    const lines = p.lines.map((l) => `<div class="bl"${p.soft ? ' data-layout-allow-occlusion' : ''} style="position:absolute;left:0;right:0;top:${px(l.top)};text-align:center;white-space:nowrap;font-family:Archivo;font-weight:${l.weight || 800};font-stretch:100%;font-size:${l.size}px;line-height:1.1;letter-spacing:${l.track}em;color:${l.color};${l.shadow || TS};opacity:0">${ctx.esc(l.t)}</div>`).join('');
    const rule = p.rule ? `<div class="br" style="position:absolute;left:${px(960 - p.rule.w / 2)};top:${px(p.rule.top)};width:${px(p.rule.w)};height:1.5px;background:linear-gradient(90deg,rgba(200,200,200,0),rgba(200,200,200,0.75) 20%,rgba(200,200,200,0.75) 80%,rgba(200,200,200,0));transform:scaleX(0)"></div>` : '';
    // v8 p.back = { top, h }: soft dark pool behind the block so it reads over the water
    const back = p.back ? `<div style="position:absolute;left:260px;width:1400px;top:${px(p.back.top)};height:${px(p.back.h)};background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(0,4,8,0.55) 0%,rgba(0,4,8,0.28) 55%,rgba(0,0,0,0) 100%)"></div>` : '';
    return `<div class="${AF}" ${ctx.dev('BTitle', { lines: p.lines.map((l) => ({ at: l.at, track: l.track })), rule: p.rule && { at: p.rule.at }, out: p.out, soft: p.soft, softOut: p.softOut })} style="pointer-events:none${p.soft ? ';opacity:0' : ''}">${back}${lines}${rule}</div>`;
  },
  render: function (el, f, p, G) {
    var E = G.bezier(0.35, 0, 0.25, 1), ls = el.querySelectorAll('.bl');
    if (p.soft) {
      var so = G.ease(f, p.soft, [0, 1], G.bezier(0.42, 0, 0.58, 1)) * (p.softOut ? G.ease(f, p.softOut, [1, 0], G.bezier(0.42, 0, 0.58, 1)) : 1);
      el.style.opacity = so.toFixed(3);
      for (var j = 0; j < ls.length; j++) ls[j].style.opacity = '1';
      var rr = el.querySelector('.br'); if (rr) rr.style.transform = 'none';
      return;
    }
    var o = p.out != null ? G.ease(f, [p.out, p.out + 24], [0, 1], E) : 0;
    for (var i = 0; i < ls.length; i++) {
      var q = p.lines[i], k = G.ease(f, [q.at, q.at + 40], [0, 1], E);
      var bl = (1 - k) * 16 + o * 10;
      ls[i].style.opacity = (G.ease(f, [q.at, q.at + 26], [0, 1], E) * (1 - o)).toFixed(3);
      ls[i].style.filter = bl > 0.2 ? 'blur(' + bl.toFixed(2) + 'px)' : 'none';
      ls[i].style.transform = 'scale(' + (1.1 - 0.1 * k + 0.03 * o).toFixed(4) + ')';
      ls[i].style.letterSpacing = (q.track + 0.22 * (1 - k)).toFixed(4) + 'em';
    }
    var r = el.querySelector('.br');
    if (r) { var kr = G.ease(f, [p.rule.at, p.rule.at + 44], [0, 1], E); r.style.transform = 'scaleX(' + kr.toFixed(4) + ')'; r.style.opacity = (1 - o).toFixed(3); }
  },
};

export default [Wall, WCam, WTile, Fog, BergX, BergCam, Shim, BTitle];
