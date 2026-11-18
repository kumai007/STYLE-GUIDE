// coc_c10.mjs - case 10 (PCV, SS613 Brindisi) only. CRaw10 = coc_c06 CRaw6 raw path (fit + blur fill, no grade, gentle 3-D push)
// with a tag-free crop (p.crop = [x, y, w, h, SW, SH], source px) plus MOVING plate blurs: p.plates = [[[f, x, y, rx, ry], ...], ...]
// (shot-local frames, source px centre + radii). Each plate track is a soft ellipse of the same picture blurred 16 px, linearly
// keyframed (PBlur render), visible from its first to its last key (3 f fades). Patches ride inside the camera move.
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;
const box = (crop, f) => { const [, , w, h] = crop, sc = f(W / w, H / h); return { sc, rw: w * sc, rh: h * sc, L: (W - w * sc) / 2, T: (H - h * sc) / 2 }; };
function media(ctx, p, b, filter = '') {
  const [x, y, , , SW, SH] = p.crop;
  const st = `inset:auto;left:${px(-x * b.sc)};top:${px(-y * b.sc)};width:${px(SW * b.sc)};height:${px(SH * b.sc)};${filter ? `filter:${filter};` : ''}`;
  return ctx.video({ src: p.src, trim: p.t, fit: 'fill', style: st });
}
export const PBlur = {
  name: 'PBlur',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('PBlur', p)} style="opacity:0"><div style="position:absolute;border-radius:50%;overflow:hidden;-webkit-mask-image:radial-gradient(ellipse at center,#000 58%,transparent 80%);mask-image:radial-gradient(ellipse at center,#000 58%,transparent 80%)"><div style="position:absolute">${ctx.kids(node)}</div></div></div>`,
  render: function (el, f, p) {
    var K = p.k, n = K.length, a = K[0], b = K[n - 1], o = 0, i, u, v = [0, 0, 0, 0];
    if (f >= a[0] - 3 && f <= b[0] + 3) o = Math.min(1, (f - (a[0] - 3)) / 3, ((b[0] + 3) - f) / 3);
    el.style.opacity = Math.max(0, o).toFixed(3);
    if (o <= 0) return;
    if (f <= a[0]) v = a.slice(1); else if (f >= b[0]) v = b.slice(1);
    else for (i = 0; i < n - 1; i++) if (f >= K[i][0] && f <= K[i + 1][0]) { u = (f - K[i][0]) / Math.max(1, K[i + 1][0] - K[i][0]); v = [1, 2, 3, 4].map(function (j) { return K[i][j] + (K[i + 1][j] - K[i][j]) * u; }); break; }
    var s = p.sc, l = (v[0] - v[2] - p.cx) * s, t = (v[1] - v[3] - p.cy) * s, pa = el.firstChild, inn = pa.firstChild;
    pa.style.left = l.toFixed(2) + 'px'; pa.style.top = t.toFixed(2) + 'px';
    pa.style.width = (2 * v[2] * s).toFixed(2) + 'px'; pa.style.height = (2 * v[3] * s).toFixed(2) + 'px';
    inn.style.left = (-l).toFixed(2) + 'px'; inn.style.top = (-t).toFixed(2) + 'px';
  },
};
export const CRaw10 = {
  name: 'CRaw10',
  html: (p, ctx) => {
    const b = box(p.crop, Math.min), bb = box(p.crop, Math.max);
    const bg = `<div class="${AF}" style="overflow:hidden"><div style="position:absolute;left:${px(bb.L)};top:${px(bb.T)};width:${px(bb.rw)};height:${px(bb.rh)};overflow:hidden;filter:blur(38px) brightness(0.4) saturate(1.1)">${media(ctx, p, bb)}</div></div>`;
    const plates = (p.plates || []).map((k) => ctx.node({ d: 'PBlur', p: { k, sc: b.sc, cx: p.crop[0], cy: p.crop[1] },
      k: [{ raw: `<div style="position:relative;width:${px(b.rw)};height:${px(b.rh)}">${media(ctx, p, b, 'blur(16px) saturate(0.9)')}</div>` }] })).join('');
    const fg = `<div style="position:absolute;left:${px(b.L)};top:${px(b.T)};width:${px(b.rw)};height:${px(b.rh)};overflow:hidden">${media(ctx, p, b)}<div style="position:absolute;inset:0">${plates}</div></div>`;
    const mv = ctx.node({ d: 'Mv', p: p.mv || { a: [1.04, 0, 1.6, 0, 0], b: [1.08, 0, -1.2, 0, 0] }, k: [{ raw: `<div class="${AF}">${fg}</div>` }] });
    return `<div class="${AF}" style="overflow:hidden;background-color:#050607">${bg}${mv}</div>`;
  },
};
export default [PBlur, CRaw10];
