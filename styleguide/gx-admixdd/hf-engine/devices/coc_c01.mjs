// coc_c01.mjs - case-1 overrides for coc.mjs (owned by the intro agent). Crd1 = coc Crd at 30 px (check type floor 28 px).
// CPageZ = page_marker (v3: superseded by coc_v3 Paper; kept for old callers): full-frame white page, no flash, 0.9 s ease-out zoom onto the key sentence, 6 px blur outside it,
// per-line #E0282A .55 multiply sweep (word-timed), then +0.4 %/s push. Spt1 = lighter spotlight that lifts the subject.
const AF = 'af';
const W = 1920, H = 1080;
const px = (v) => `${(+v).toFixed(2)}px`;

export const Crd1 = {
  name: 'Crd1',
  html: (p, ctx) => `<div ${ctx.dev('Fade', { in: [p.at, p.at + 12], out: [p.at + p.hold - 12, p.at + p.hold] })} style="position:absolute;right:2.6%;bottom:4.2%;font-family:'Courier Prime';font-weight:700;font-size:30px;letter-spacing:0.04em;color:rgba(232,232,232,0.85);text-shadow:0 2px 3px rgba(0,0,0,0.8);opacity:0">${ctx.esc(p.text)}</div>`,
};

/** CPageZ p = { img, iw, ih (page px), key [x0,y0,x1,y1], lines [[x0,y0,x1,y1]], names [[x0,y0,x1,y1]], z (target scale),
 *  mz [{x,y,w,h,src}] (baked 24 px mosaics of private names), hold (start already landed: eased re-frame), mark {at, n} (frames) | 'full' | null, flash, clipB (page y; below = white). */
export const CPageZ = {
  name: 'CPageZ',
  html: (p, ctx) => {
    const k = p.key, kx = (k[0] + k[2]) / 2, ky = (k[1] + k[3]) / 2, pad = 14;
    const clip = p.clipB ? `clip-path:inset(0 0 ${px(p.ih - p.clipB)} 0);` : '';
    const img = (st) => `<img src="${p.img}" alt="" style="position:absolute;left:0;top:0;width:${px(p.iw)};height:${px(p.ih)};${clip}${st}">`;
    const sharp = `<div style="position:absolute;left:0;top:0;width:${px(p.iw)};height:${px(p.ih)};clip-path:inset(${px(k[1] - pad)} ${px(p.iw - k[2] - pad * 2)} ${px(p.ih - k[3] - pad)} ${px(k[0] - pad * 2)})">${img('')}</div>`;
    const names = (p.mz || []).map((m) => `<img src="${m.src}" alt="" style="position:absolute;left:${px(m.x)};top:${px(m.y)};width:${px(m.w)};height:${px(m.h)}">`).join('');
    const tot = (p.lines || []).reduce((a, l) => a + (l[2] - l[0]), 0) || 1;
    let acc = 0;
    const marks = p.mark ? (p.lines || []).map((l) => {
      const f0 = acc / tot, f1 = (acc += l[2] - l[0]) / tot;
      const m = p.mark === 'full' ? { at: -2, n: 1, f0: 0, f1: 0.001 } : { at: p.mark.at, n: p.mark.n, f0, f1 };
      return `<div ${ctx.dev('MarkL', m)} style="position:absolute;left:${px(l[0] - 8)};top:${px(l[1] - 7)};width:${px(l[2] - l[0] + 16)};height:${px(l[3] - l[1] + 14)};background:#E0282A;opacity:0.55;mix-blend-mode:multiply;transform-origin:0 50%;transform:scaleX(0)"></div>`;
    }).join('') : '';
    const pc = [p.iw / 2, Math.min(p.ih, p.clipB || p.ih) / 2];
    const zp = { z: p.z, kx, ky, cx: kx + (pc[0] - kx) * 0.35, cy: ky + (pc[1] - ky) * 0.35, hold: !!p.hold };
    const page = `<div ${ctx.dev('PgZ', zp)} style="position:absolute;left:0;top:0;width:${px(p.iw)};height:${px(p.ih)};transform-origin:0 0;isolation:isolate">${img('filter:blur(6px)')}${sharp}${names}${marks}</div>`;
    return `<div class="${AF}" style="overflow:hidden;background:#fff">${page}</div>`;
  },
};
export const PgZ = {
  name: 'PgZ',
  html: () => '',
  render: function (el, f, p, G) {
    var e = G.bezier(0.16, 1, 0.3, 1), k = p.hold ? 1 : G.ease(f, [0, 54], [0, 1], e);
    var z0 = p.z * 0.8, z = (z0 + (p.z - z0) * k) * (1 + 0.004 * Math.max(0, f - (p.hold ? 0 : 54)) / 60);
    var cx = p.cx + (p.kx - p.cx) * k, cy = p.cy + (p.ky - p.cy) * k;
    el.style.transform = 'translate(' + (960 - cx * z).toFixed(2) + 'px,' + (540 - cy * z).toFixed(2) + 'px) scale(' + z.toFixed(5) + ')';
  },
};
/** MarkL: one line of the sweep; the whole sweep runs f in [at, at+n], this line owns the fraction [f0, f1] (by line width). */
export const MarkL = {
  name: 'MarkL',
  html: () => '',
  render: function (el, f, p) {
    var u = (f - p.at) / Math.max(1, p.n), v = Math.min(1, Math.max(0, (u - p.f0) / Math.max(1e-4, p.f1 - p.f0)));
    el.style.transform = 'scaleX(' + v.toFixed(4) + ')';
  },
};

/** Spt1: spotlight that keeps the subject readable: surround x0.6 (~10% luma on dark CCTV), subject lifted via backdrop brightness. */
export const Spt1 = {
  name: 'Spt1',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Spt', p)} style="opacity:0"><div class="${AF}" style="backdrop-filter:brightness(${p.lift || 1.8}) contrast(1.06);-webkit-mask-image:radial-gradient(circle ${p.r}px at ${p.cx}px ${p.cy}px,#000 55%,transparent 100%);mask-image:radial-gradient(circle ${p.r}px at ${p.cx}px ${p.cy}px,#000 55%,transparent 100%)"></div><div class="${AF}" style="background:radial-gradient(circle ${p.r}px at ${p.cx}px ${p.cy}px,rgba(0,0,0,0) 66%,rgba(5,6,7,0.6) 100%)"></div></div>`,
};
export default [Crd1, CPageZ, PgZ, MarkL, Spt1];
