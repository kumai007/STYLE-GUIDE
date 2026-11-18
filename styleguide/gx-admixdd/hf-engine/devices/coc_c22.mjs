// coc_c22.mjs - case 22 (NP river video) only; copy of coc_c12.mjs (case 12, DONE) with renamed devices. CFoot22 = coc.mjs CFoot (cover | fit + blur fill, v8 grade unless raw,
// vignette unless raw, eased 3-D Mv) plus a TRACKED face blur: p.fk = [[f, cx, cy, rx, ry, (cx, cy, rx, ry)...], ...] (shot-local
// output frames, source px; from media/coc2h/c22/track/NP.mask.json). One blurred copy of the video sits over the picture inside
// the camera move; FMask22 sets its mask per frame to soft ellipses on the nearest keyframe (|df| <= 3), hidden otherwise.
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;
const GRADE = 'sepia(0.08) saturate(1.3) contrast(1.22) brightness(0.96)'; // = coc.mjs CSSLOOK.grade (v8)
function box(crop, mode) {
  const [, , w, h] = crop, sc = mode === 'cover' ? Math.max(W / w, H / h) : Math.min(W / w, H / h);
  return { sc, rw: w * sc, rh: h * sc, L: (W - w * sc) / 2, T: (H - h * sc) / 2 };
}
function media(ctx, p, b, filter = '', vol = 0) {
  const [x, y, , , SW, SH] = p.crop;
  const st = `inset:auto;left:${px(-x * b.sc)};top:${px(-y * b.sc)};width:${px(SW * b.sc)};height:${px(SH * b.sc)};${filter ? `filter:${filter};` : ''}`;
  return ctx.video({ src: p.src, trim: p.t, speed: 1, vol, fit: 'fill', style: st });
}
export const CFoot22 = {
  name: 'CFoot22',
  html: (p, ctx) => {
    const mode = p.mode || 'cover', b = box(p.crop, mode);
    let bg = '';
    if (b.rw < W - 2 || b.rh < H - 2) {
      const bb = box(p.crop, 'cover');
      bg = `<div class="${AF}" ${p.raw ? '' : ctx.dev('Mv', { a: [1.12, 0, 0, -1.2, 0], b: [1.16, 0, 0, 1.2, 0] })} style="overflow:hidden"><div style="position:absolute;left:${px(bb.L)};top:${px(bb.T)};width:${px(bb.rw)};height:${px(bb.rh)};overflow:hidden;filter:blur(38px) brightness(0.4) ${p.raw ? 'saturate(1.1)' : 'saturate(0.85)'}">${media(ctx, p, bb)}</div></div>`;
    }
    const fk = p.fk && p.fk.length ? `<div ${ctx.dev('FMask22', { k: p.fk, x: p.crop[0], y: p.crop[1], s: +b.sc.toFixed(5) })} style="position:absolute;inset:0;overflow:hidden;opacity:0">${media(ctx, p, b, 'blur(30px)')}</div>` : '';
    const fg = `<div style="position:absolute;left:${px(b.L)};top:${px(b.T)};width:${px(b.rw)};height:${px(b.rh)};overflow:hidden">${media(ctx, p, b, '', p.vol || 0)}${fk}</div>`;
    const body = `<div class="${AF}" style="${p.raw ? '' : `filter:${GRADE}`}">${fg}</div>`;
    const RAWMV = [{ a: [1.04, 0, 1.6, 0, 0], b: [1.08, 0, -1.2, 0, 0] }, { a: [1.04, 1.4, 0, 0, 0], b: [1.08, -1.0, 0, 0, 0] }][Math.round(+p.t || 0) % 2];
    const mv = ctx.node({ d: 'Mv', p: p.mv || (p.raw ? RAWMV : { a: [1, 0, 0, 0, 0], b: [1.06, 0, 0, 0, 0] }), k: [{ raw: body }] });
    const vig = p.raw ? '' : `<div class="${AF}" style="background:radial-gradient(ellipse 72% 70% at 50% 50%,rgba(0,0,0,0) 38%,rgba(0,0,0,${p.vig ?? 0.32}) 100%)"></div>`;
    return `<div class="${AF}" style="overflow:hidden;background-color:#050607">${bg}${mv}${vig}</div>`;
  },
};
export const FMask22 = {
  name: 'FMask22',
  render: function (el, f, p) {
    var k = p.k, lo = 0, hi = k.length - 1;
    while (lo < hi) { var m = (lo + hi) >> 1; if (k[m][0] < f) lo = m + 1; else hi = m; }
    var best = k[lo];
    if (lo > 0 && Math.abs(k[lo - 1][0] - f) < Math.abs(best[0] - f)) best = k[lo - 1];
    if (!best || Math.abs(best[0] - f) > 3) { el.style.opacity = '0'; return; }
    var g = [];
    for (var i = 1; i + 3 < best.length + 1; i += 4) {
      var cx = (best[i] - p.x) * p.s, cy = (best[i + 1] - p.y) * p.s, rx = best[i + 2] * p.s, ry = best[i + 3] * p.s;
      g.push('radial-gradient(ellipse ' + rx.toFixed(1) + 'px ' + ry.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px,#000 72%,rgba(0,0,0,0) 100%)');
    }
    var mi = g.join(',');
    el.style.webkitMaskImage = mi; el.style.maskImage = mi;
    el.style.webkitMaskRepeat = 'no-repeat'; el.style.maskRepeat = 'no-repeat';
    el.style.opacity = '1';
  },
};
export default [CFoot22, FMask22];
