// coc_c06.mjs - case 6 (Ring doorbell) only. CRaw6 = coc.mjs CFoot raw path (fit + blur fill, no grade, gentle 3-D push) plus TIMED
// soft blur patches over the uploader's app UI (white pause icon at frame centre, volume slider): p.hide = [[x, y, rx, ry, f0, f1], ...]
// (source px, shot-local frames); [.., dx, dy] = clone offset (patch shows the picture dx/dy source px away, blurred 7 px). The patch rides inside the camera move, eases in/out over 4 f.
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;
function box(crop) {
  const [, , w, h] = crop, sc = Math.min(W / w, H / h);
  return { sc, rw: w * sc, rh: h * sc, L: (W - w * sc) / 2, T: (H - h * sc) / 2 };
}
function cbox(crop) {
  const [, , w, h] = crop, sc = Math.max(W / w, H / h);
  return { sc, rw: w * sc, rh: h * sc, L: (W - w * sc) / 2, T: (H - h * sc) / 2 };
}
function media(ctx, p, b, filter = '') {
  const [x, y, , , SW, SH] = p.crop;
  const st = `inset:auto;left:${px(-x * b.sc)};top:${px(-y * b.sc)};width:${px(SW * b.sc)};height:${px(SH * b.sc)};${filter ? `filter:${filter};` : ''}`;
  return ctx.video({ src: p.src, trim: p.t, fit: 'fill', style: st });
}
export const CRaw6 = {
  name: 'CRaw6',
  html: (p, ctx) => {
    const b = box(p.crop), bb = cbox(p.crop);
    const bg = `<div class="${AF}" style="overflow:hidden"><div style="position:absolute;left:${px(bb.L)};top:${px(bb.T)};width:${px(bb.rw)};height:${px(bb.rh)};overflow:hidden;filter:blur(38px) brightness(0.4) saturate(1.1)">${media(ctx, p, bb)}</div></div>`;
    const hide = (p.hide || []).map(([fx, fy, rx, ry, f0, f1, dx = 0, dy = 70]) => {
      const l = fx - rx, t = fy - ry;
      const patch = `<div style="position:absolute;left:${px(l * b.sc)};top:${px(t * b.sc)};width:${px(2 * rx * b.sc)};height:${px(2 * ry * b.sc)};border-radius:50%;overflow:hidden;-webkit-mask-image:radial-gradient(ellipse at center,#000 55%,transparent 78%)"><div style="position:absolute;left:${px(-(l + dx) * b.sc)};top:${px(-(t + dy) * b.sc)};width:${px(b.rw)};height:${px(b.rh)}">${media(ctx, p, b, 'blur(7px)')}</div></div>`;
      return ctx.node({ d: 'Fade', p: { in: [f0 - 2, f0 + 2], out: [f1 - 2, f1 + 2] }, k: [{ raw: patch }] });
    }).join('');
    const fg = `<div style="position:absolute;left:${px(b.L)};top:${px(b.T)};width:${px(b.rw)};height:${px(b.rh)};overflow:hidden">${media(ctx, p, b)}<div style="position:absolute;inset:0">${hide}</div></div>`;
    const mv = ctx.node({ d: 'Mv', p: p.mv || { a: [1.04, 0, 1.6, 0, 0], b: [1.08, 0, -1.2, 0, 0] }, k: [{ raw: `<div class="${AF}">${fg}</div>` }] });
    return `<div class="${AF}" style="overflow:hidden;background-color:#050607">${bg}${mv}</div>`;
  },
};
export default [CRaw6];
