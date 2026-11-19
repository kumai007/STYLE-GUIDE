// lm_pro.mjs - shared PRO kit for the last-moments channel (owner 2026-11-19: "AI slop" -> hand-made print/ink look, refs = Abyssal
// Detective latest5: black brush name tags with distressed condensed caps, article crops with uneven yellow marker, VCR typed dates).
// 60 fps frames; f = shot-local frame. Case: devices [...,'lm_pro'], fonts need BebasNeue, IBMPlexMono-600, (VCR OSD Mono file when added).
// API
//  LowerThird {name, role, at=0, hold=200, pos='l'|'c'|'r', size=92, pin=false, y=118}
//      v4: clean dark brush bar (soft edge, light grain), clean Bebas caps, role in Plex Mono on a small dark strip, -1 deg, straight
//      clip wipe in 24 f / off 16 f. Max 1-2 per case (key people only); places -> PlaceText. pin = red place mark.
//  Article3D {img, iw, ih, bands:[[x,y,w,h,f0]], src, date, focus:[x,y], key=1190, tilt=3.5}
//      FULL-BLEED real page crop: always covers the whole frame (cover x1.15, tilt <= 3.5 deg easing flat, clamped push toward the
//      key line, key line ~key px wide where the crop allows), paper grain, far-edge focus blur, hand-drawn amber marker (uneven ink,
//      L->R from frame f0, max 2 bands), source + date ink strip in the corner away from the key line. Kids are ignored.
//  StampRing {x, y, w, h, at=0, hold=1e9, rect=[0,0,1920,1080], zoom=1.3, dim=.55, zin=40}
//      wrapper (kids = the footage). x,y,w,h = burned-in timestamp box in screen px; rect = visible picture area. Hand-drawn red
//      ring (1.1 turns, doubled stroke) draws ON the stamp, surround dims, punch-in toward the stamp. Ring box is clamped into rect
//      and the zoom origin snaps to the nearest picture edge, so nothing ever leaves the picture.
//  TextFade {kick, lines:[..], at=8, pos='c'|'l'|'tl', size=78 (tl 56), hold=f|null (null = to shot end -20), font='vcr'|'mono', x,y (tl)}
//      v4 non-title text: lines fade in 30 f eased + 8 px rise (6 f stagger), out 18 f; 'c'/'l' = card over a soft scrim, 'tl' = date
//      top-left x100 y62 like the Abyssal refs (no scrim). Pair with a click SFX (case side). TitleType {mode:'fade'} = TextFade.
//  PlaceText {text, sub, at=0, hold=f|null, pos='bl'|'br'|'tl'|'tr' or x,y (top-left px), size=50, font='vcr'|'mono'}
//      v4 plain place name on the footage: VCR caps 50 px, soft shadow, no bar/box, optional Plex sub line; fade 30 f + 8 px rise, out 18 f.
//  TitleType {kick, lines:[..], at=8, size=78, cps=22, align='c'|'l'}  (title screens only)
//      text card typed in 'VCR OSD Mono' (fallback VT323 / Share Tech Mono): type-on with block cursor, slight tape fringe, soft
//      scrim. Always put it over a footage/photo backdrop (never flat black). Out 20 f at the end of the shot.
const AF = 'af';
const C = { tx: '#ECE8DF', ink: '#0A0A0B', paper: '#D8D1C0', red: '#B3231F', amb: '#F2B90A' };
const MONO = "'IBM Plex Mono',monospace", VCR = "'VCR OSD Mono','VT323','Share Tech Mono',monospace";
const E = 'var c=function(x){return Math.max(0,Math.min(1,x))},io=function(x){return -(Math.cos(Math.PI*x)-1)/2},o3=function(x){return 1-Math.pow(1-x,3)},bk=function(x){var s=1.9;x=x-1;return 1+(s+1)*x*x*x+s*x*x};';
let UID = 0;
const rng = (seed) => { let a = seed >>> 0 || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const hash = (s) => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const F = (x) => +x.toFixed(1);
// filters: R = ragged ink edge, T = eroded letterpress type, G = paper grain
const defs = (id, seed) => `<svg width="0" height="0" style="position:absolute"><defs>`
  + `<filter id="${id}R" x="-5%" y="-25%" width="110%" height="150%"><feTurbulence type="fractalNoise" baseFrequency="0.035 0.11" numOctaves="2" seed="${seed % 97}"/><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>`
  + `<filter id="${id}T" x="-3%" y="-8%" width="106%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed % 89}" result="n"/><feColorMatrix in="n" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 11 0 0 0 -3.5" result="m"/>`
  + `<feTurbulence type="fractalNoise" baseFrequency="0.05 0.09" numOctaves="2" seed="${seed % 83}" result="n2"/><feColorMatrix in="n2" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 14 0 0 0 -4.4" result="m2"/>`
  + `<feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="d"/><feComposite in="d" in2="m" operator="in" result="e"/><feComposite in="e" in2="m2" operator="in"/></filter>`
  + `<filter id="${id}G" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="${seed % 71}"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .27 0 0 0 0 .22 0 0 0 .5 0"/></filter></defs></svg>`;
// ragged brush bar polygon in a w x h box (dry-brush fingers on the right end, nicks along the edges)
function brush(w, h, r, fingers = 7) {
  const P = []; const st = 13;
  for (let x = 0; x <= w; x += st) P.push([x, (r() < 0.12 ? r() * h * 0.13 : r() * h * 0.05) + (x < 30 ? (30 - x) * 0.12 : 0)]);
  for (let k = 0; k < fingers; k++) { const y0 = (h * k) / fingers, y1 = (h * (k + 1)) / fingers, e = w + (r() < 0.5 ? r() * h * 0.55 : -r() * h * 0.2); P.push([e, y0 + 2], [e + r() * 8, y1 - 2], [w - h * 0.12 - r() * 10, y1]); }
  for (let x = w; x >= 0; x -= st) P.push([x, h - (r() < 0.12 ? r() * h * 0.14 : r() * h * 0.05)]);
  for (let k = 0; k < 4; k++) P.push([-r() * 10 + (k % 2) * 7, h * (1 - (k + 0.5) / 4)]);
  return 'M' + P.map(([x, y]) => `${F(x)} ${F(y)}`).join('L') + 'Z';
}

// v4 (owner 2026-11-19 "too much texture"): clean dark brush bar (soft low-amplitude edge, 3 short dry-brush fingers), clean Bebas
// caps (no distress), very light grain on the bar only, straight clip wipe in (power2.out 24 f) / wipe off L->R (16 f), -1 deg.
function bar(w, h, r) {
  const P = [], st = 22;
  for (let x = 0; x <= w; x += st) P.push([x, r() * h * 0.03 + (x < 22 ? (22 - x) * 0.22 : 0)]);
  for (let k = 0; k < 3; k++) { const y0 = (h * k) / 3, y1 = (h * (k + 1)) / 3, e = w + h * 0.1 + r() * h * 0.16; P.push([e, y0 + h * 0.07], [e - h * 0.04, y1 - h * 0.05], [w + h * 0.02, y1]); }
  for (let x = w; x >= 0; x -= st) P.push([x, h - r() * h * 0.03 - (x < 22 ? (22 - x) * 0.22 : 0)]);
  P.push([-5, h * 0.68], [-7, h * 0.34]);
  return 'M' + P.map(([x, y]) => `${F(x)} ${F(y)}`).join('L') + 'Z';
}
const cdefs = (id, seed) => `<svg width="0" height="0" style="position:absolute"><defs>`
  + `<filter id="${id}S" x="-3%" y="-10%" width="106%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.07" numOctaves="1" seed="${seed % 97}"/><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>`
  + `<filter id="${id}G" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed % 71}"/><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .48 0 0 0 0 .44 0 0 0 .55 0"/></filter></defs></svg>`;
export const LowerThird = {
  name: 'LowerThird',
  html: (p, ctx) => {
    const id = `lp${++UID}`, r = rng(hash(p.name + '|' + p.role)), size = p.size ?? 92, name = String(p.name || '').toUpperCase(), role = String(p.role || '').toUpperCase();
    const tw = name.length * size * 0.4 + (p.pin ? 44 : 0), bw = tw + 104, bh = Math.round(size * 1.2), rw = role.length * 15.6 + 48, rh = 40, W = Math.ceil(bw + bh * 0.3 + 16);
    const pos = p.pos === 'c' ? `left:50%;margin-left:${F(-bw / 2)}px` : p.pos === 'r' ? 'right:120px' : 'left:112px';
    const bp = bar(bw, bh, r), rp = role ? bar(rw, rh, r) : '';
    const pin = p.pin ? `<i style="display:inline-block;width:20px;height:28px;margin-right:18px;background:${C.red};clip-path:polygon(50% 100%,4% 40%,4% 20%,24% 0,76% 0,96% 20%,96% 40%)"></i>` : '';
    return `${cdefs(id, hash(name))}<div ${ctx.dev('LowerThird', { at: p.at ?? 0, hold: p.hold ?? 200 })} style="position:absolute;${pos};bottom:${p.y ?? 118}px;width:${W}px;transform:rotate(-1deg);transform-origin:10% 60%;opacity:0;filter:drop-shadow(0 8px 18px rgba(0,0,0,.45))">`
      + `<div style="position:relative;width:${F(bw)}px;height:${bh}px">`
      + `<svg viewBox="-10 -6 ${W + 10} ${bh + 12}" style="position:absolute;left:-10px;top:-6px;width:${W + 10}px;height:${bh + 12}px;overflow:visible"><clipPath id="${id}C"><path d="${bp}"/></clipPath>`
      + `<path d="${bp}" fill="${C.ink}" fill-opacity=".9" filter="url(#${id}S)"/><rect x="-10" y="-6" width="${W + 10}" height="${bh + 12}" filter="url(#${id}G)" clip-path="url(#${id}C)" opacity=".16"/></svg>`
      + `<div data-n style="position:absolute;left:52px;top:0;height:${bh}px;display:flex;align-items:center;white-space:nowrap;font:400 ${size}px/1 'Bebas Neue',sans-serif;letter-spacing:0.04em;color:${C.tx};padding-top:${F(size * 0.07)}px">${pin}${ctx.esc(name)}</div></div>`
      + (role ? `<div data-o style="position:relative;margin:-4px 0 0 40px;width:${F(rw)}px;height:${rh}px">`
        + `<svg viewBox="-6 -4 ${F(rw + rh * 0.3 + 12)} ${rh + 8}" style="position:absolute;left:-6px;top:-4px;width:${F(rw + rh * 0.3 + 12)}px;height:${rh + 8}px;overflow:visible"><path d="${rp}" fill="${C.ink}" fill-opacity=".82" filter="url(#${id}S)"/></svg>`
        + `<div style="position:absolute;left:22px;top:0;height:${rh}px;display:flex;align-items:center;white-space:nowrap;font:500 21px/1 ${MONO};letter-spacing:0.15em;color:#CFC9BC">${ctx.esc(role)}</div></div>` : '')
      + `</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, xo=g-(36+p.hold), out=c(xo/16); if(g<0||out>=1){el.style.opacity=0;return;} el.style.opacity=1;
    var p2=function(x){return 1-(1-x)*(1-x)}, u=p2(c(g/24)), wo=io(out);
    el.style.clipPath='inset(-60px '+(100*(1-u)).toFixed(2)+'% -60px '+(-4+104*wo).toFixed(2)+'%)';
    var n=el.querySelector('[data-n]'), un=o3(c((g-10)/18)); n.style.opacity=un.toFixed(3); n.style.transform='translateX('+(-14*(1-un)).toFixed(2)+'px)';
    var o=el.querySelector('[data-o]'); if(o){var uo=o3(c((g-16)/18)); o.style.opacity=uo.toFixed(3); o.style.transform='translateX('+(-10*(1-uo)).toFixed(2)+'px)';}`),
};

// uneven marker stroke over a w x h band (px): wobbly body + a second darker overlap pass
function marker(w, h, r) {
  const top = [], bot = [], n = Math.max(6, Math.round(w / 46));
  const ph = r() * 6, a = h * 0.06;
  for (let i = 0; i <= n; i++) { const x = (w * i) / n, s = Math.sin(i * 0.9 + ph); top.push([x, h * 0.1 + a * s + (r() - 0.5) * a]); bot.push([x, h * 0.93 + a * s * 0.6 + (r() - 0.5) * a * 1.4]); }
  const q = (P) => P.map(([x, y]) => `${F(x)} ${F(y)}`).join('L');
  const body = `M${F(-h * 0.14)} ${F(h * 0.2)}L${q(top)}L${F(w + h * 0.2)} ${F(h * 0.3)}L${F(w + h * 0.1)} ${F(h * 0.86)}L${q(bot.reverse())}L${F(-h * 0.22)} ${F(h * 0.8)}Z`;
  const x0 = w * (0.08 + r() * 0.2), x1 = w * (0.55 + r() * 0.3);
  const over = `M${F(x0)} ${F(h * 0.3)}L${F(x1)} ${F(h * 0.24)}L${F(x1 + 18)} ${F(h * 0.74)}L${F(x0 - 12)} ${F(h * 0.8)}Z M${F(-h * 0.1)} ${F(h * 0.25)}L${F(h * 0.5)} ${F(h * 0.2)}L${F(h * 0.42)} ${F(h * 0.84)}L${F(-h * 0.16)} ${F(h * 0.78)}Z`;
  return [body, over];
}

export const Article3D = {
  name: 'Article3D',
  // FULL-BLEED (owner 2026-11-19 "article should cover the whole video"): the page always covers the frame; tilt <= 3.5 deg; the
  // push toward the key line is clamped so no page edge / backdrop ever shows. Kids (old backdrop) are not rendered.
  html: (p, ctx) => {
    const id = `lp${++UID}`, r = rng(hash(p.img)), bs = (p.bands || []).slice(0, 2);
    const bwMax = Math.max(1, ...bs.map((b) => b[2])), cover = Math.max(1920 / p.iw, 1080 / p.ih);
    const S0 = cover * 1.15, S1 = Math.max(S0 * 1.04, Math.min(S0 * 1.3, (p.key ?? 1190) / bwMax)), sc = S1, w = p.iw * sc, h = p.ih * sc;
    const b0 = bs[0], fx = p.focus || (b0 ? [b0[0] + b0[2] / 2, b0[1] + b0[3] * (bs.length > 1 ? 1 : 0.5)] : [p.iw / 2, p.ih / 2]);
    const src = `assets/media/${p.img}`, top = (fx[1] / p.ih) > 0.72, dg = (fx[1] / p.ih) < 0.4 ? 0 : 180; // depth blur on the far side of the key line
    const bands = bs.map(([x, y, bw, bh, f0]) => { const W = bw * sc, H = bh * sc, [body, over] = marker(W, H, r);
      return `<svg data-f0="${f0}" data-w="${Math.round(W)}" viewBox="${F(-H * 0.4)} ${F(-H * 0.2)} ${F(W + H * 0.8)} ${F(H * 1.4)}" style="position:absolute;left:${F(x * sc - H * 0.4)}px;top:${F(y * sc - H * 0.2)}px;width:${F(W + H * 0.8)}px;height:${F(H * 1.4)}px;mix-blend-mode:multiply;transform:rotate(${F((r() - 0.5) * 0.7)}deg);clip-path:inset(0 100% 0 0)"><g filter="url(#${id}R)"><path d="${body}" fill="${C.amb}" opacity=".86"/><path d="${over}" fill="#E09A00" opacity=".4"/></g></svg>`; }).join('');
    const tag = [p.src, p.date].filter(Boolean).map((t) => ctx.esc(String(t).toUpperCase()));
    const tw = tag.join('  /  ').length * 15.4 + 56;
    return `${defs(id, hash(p.img))}<div class="${AF}" ${ctx.dev('Article3D', { t: p.tilt ?? 3.5, k0: S0 / S1, w, h, dx: (p.iw / 2 - fx[0]) * sc, dy: (p.ih / 2 - fx[1]) * sc })} style="perspective:1900px;perspective-origin:50% 45%;background:#cfc8b8;overflow:hidden">`
      + `<div data-pg style="position:absolute;left:${F((1920 - w) / 2)}px;top:${F((1080 - h) / 2)}px;width:${F(w)}px;height:${F(h)}px;transform-origin:50% 50%;background:#e9e3d6">`
      + `<img src="${src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;display:block;filter:contrast(1.08) brightness(.74) sepia(.14)">`
      + `<svg style="position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:multiply;opacity:.5"><rect width="100%" height="100%" filter="url(#${id}G)"/></svg>${bands}`
      + `<img data-dof src="${src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;display:block;filter:blur(6px) brightness(.7) sepia(.14);-webkit-mask-image:linear-gradient(${dg}deg,#000 0%,rgba(0,0,0,.55) 14%,transparent 34%);mask-image:linear-gradient(${dg}deg,#000 0%,rgba(0,0,0,.55) 14%,transparent 34%)"></div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(112deg,rgba(255,244,222,.16) 0%,rgba(255,255,255,0) 34%,rgba(0,0,0,.10) 68%,rgba(0,0,0,.34) 100%)"></div>`
      + `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 78% 74% at 50% 50%,rgba(0,0,0,0) 52%,rgba(14,9,3,.66) 100%),linear-gradient(${top ? 180 : 0}deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 20%)"></div>`
      + (tag.length ? `<div data-tg style="position:absolute;left:0;right:0;bottom:0;height:30px;opacity:0;background:linear-gradient(90deg,rgba(6,6,6,.94) 0%,rgba(6,6,6,.88) 55%,rgba(6,6,6,.55) 100%);box-shadow:0 -1px 0 rgba(232,160,0,.35)">`
        + `<div style="position:absolute;left:44px;top:0;height:30px;display:flex;align-items:center;white-space:pre;font:600 16px/1 ${MONO};letter-spacing:0.16em;color:${C.tx}">${tag[0]}${tag[1] ? `<span style="color:${C.amb}">  /  </span>${tag[1]}` : ''}</div></div>`: '')
      + `</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var pg=el.querySelector('[data-pg]'), u=o3(c(f/40)), k=io(c(f/S.len)), s=(p.k0+(1-p.k0)*k)*(1+0.035*(1-u));
    var mx=Math.max(0,(p.w*s-1920)/2-1920*0.062), my=Math.max(0,(p.h*s-1080)/2-1080*0.062), q=0.25+0.75*k;
    var tx=Math.max(-mx,Math.min(mx,p.dx*s*q)), ty=Math.max(-my,Math.min(my,p.dy*s*q));
    pg.style.transform='translate3d('+tx.toFixed(2)+'px,'+ty.toFixed(2)+'px,0) rotateX('+(p.t*(1-0.75*k)).toFixed(3)+'deg) rotateY('+(-p.t*(1-0.7*k)).toFixed(3)+'deg) scale('+s.toFixed(5)+')';
    pg.style.filter=u<1?'blur('+(4*(1-u)).toFixed(2)+'px)':'none';
    el.querySelector('[data-dof]').style.opacity=(1-0.7*k).toFixed(3);
    var b=pg.querySelectorAll('svg[data-f0]');for(var i=0;i<b.length;i++){var d=Math.max(26,+b[i].dataset.w/26), z=io(c((f-+b[i].dataset.f0)/d));b[i].style.clipPath='inset(0 '+(100*(1-z)).toFixed(2)+'% 0 0)';}
    var t=el.querySelector('[data-tg]'); if(t){var ut=o3(c((f-30)/22)); t.style.opacity=ut>0?1:0; t.style.clipPath='inset(-30% '+(100*(1-ut)).toFixed(2)+'% -30% -5%)';}`),
};

export const StampRing = {
  name: 'StampRing',
  html: (p, ctx, node) => {
    const id = `lp${++UID}`, r = rng(hash([p.x, p.y, p.w, p.h].join()));
    const [RX, RY, RW, RH] = p.rect || [0, 0, 1920, 1080], m = 12;
    let px = Math.max(26, p.w * 0.13), py = Math.max(22, p.h * 0.55);
    let bw = Math.min(p.w + 2 * px, RW - 2 * m), bh = Math.min(p.h + 2 * py, RH - 2 * m);
    // stamp at the picture's bottom/top edge: keep the ring around the text (no vertical clamp), scale about the stamp and lift the
    // picture by the overflow during the zoom (lift>0 only then; earlier calls unchanged)
    const Z = p.zoom ?? 1.3, sc0 = p.y + p.h / 2, edge = (sc0 + bh / 2 > RY + RH - m) || (sc0 - bh / 2 < RY + m);
    if (edge) { py = Math.max(16, p.h * 0.4); bh = p.h + 2 * py; }
    const lift = edge ? (sc0 + (bh / 2 + 8) * Z > RY + RH - m ? sc0 + (bh / 2 + 8) * Z - (RY + RH - m) : -Math.max(0, RY + m - (sc0 - (bh / 2 + 8) * Z))) : 0;
    const bx = Math.max(RX + m, Math.min(RX + RW - m - bw, p.x + p.w / 2 - bw / 2)), by = edge ? sc0 - bh / 2 : Math.max(RY + m, Math.min(RY + RH - m - bh, p.y + p.h / 2 - bh / 2));
    const cx = bx + bw / 2, cy = by + bh / 2, a = bw / 2 - 6, b = bh / 2 - 6, ph = r() * 6.28;
    const ring = (k, turns) => { const P = []; for (let i = 0; i <= 72; i++) { const u = i / 72, t = -2.5 + u * 6.283 * turns, w = 1 - 0.07 * k + 0.035 * Math.sin(3 * t + ph + k) + 0.06 * u * (1 - k); P.push(`${F(cx + a * w * Math.cos(t))} ${F(cy + b * w * Math.sin(t) * (1 - 0.05 * k))}`); } return 'M' + P.join('L'); };
    const u = (cx - RX) / RW, v = (cy - RY) / RH, sx = u < 0.3 ? 0 : u > 0.7 ? 1 : u, sy = v < 0.3 ? 0 : v > 0.7 ? 1 : v;
    return `<div class="${AF}" ${ctx.dev('StampRing', { at: p.at ?? 0, hold: p.hold ?? 1e9, zoom: p.zoom ?? 1.3, zin: p.zin ?? 40, lift: F(lift) })} style="transform-origin:${F(RX + RW * sx)}px ${F(edge ? sc0 : RY + RH * sy)}px">${ctx.kids(node)}`
      + `<div data-d class="${AF}" style="pointer-events:none;opacity:0;background:radial-gradient(ellipse ${F(a * 1.9)}px ${F(b * 2.6)}px at ${F(cx)}px ${F(cy)}px,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 52%,rgba(0,0,0,${p.dim ?? 0.55}) 100%)"></div>`
      + `<svg class="${AF}" viewBox="0 0 1920 1080" style="pointer-events:none;overflow:hidden"><defs><filter id="${id}R" filterUnits="userSpaceOnUse" x="${F(bx - 4)}" y="${F(by - 4)}" width="${F(bw + 8)}" height="${F(bh + 8)}"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="${hash(id) % 90}"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
      + `<g filter="url(#${id}R)" fill="none" stroke="${C.red}" stroke-linecap="round" stroke-linejoin="round" style="filter:url(#${id}R) drop-shadow(0 0 5px rgba(0,0,0,.8))"><path data-r d="${ring(0, 1.12)}" stroke-width="7" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path data-r d="${ring(1, 0.8)}" stroke-width="3" opacity=".75" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></g></svg></div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, out=c((g-p.hold)/14), on=g>=0?1-out:0, z=bk(c(g/p.zin))*(1-io(out));
    el.style.transform=g<0?'none':'translateY('+(-(+p.lift||0)*z).toFixed(2)+'px) scale('+(1+(p.zoom-1)*z+0.03*c(g/Math.max(1,S.len-p.at))).toFixed(5)+')';
    el.querySelector('[data-d]').style.opacity=(io(c(g/24))*(1-out)).toFixed(4);
    var R=el.querySelectorAll('[data-r]'); R[0].setAttribute('stroke-dashoffset',(1-io(c((g-10)/26))).toFixed(4)); R[1].setAttribute('stroke-dashoffset',(1-io(c((g-30)/20))).toFixed(4));
    R[0].parentNode.style.opacity=on.toFixed(3);`),
};

export const TitleType = {
  name: 'TitleType',
  html: (p, ctx) => {
    if (p.mode === 'fade') return TextFade.html(p, ctx); // v4: non-title text fades (TextFade), type-on stays for title screens
    const kick = String(p.kick || '').toUpperCase(), lines = (p.lines || []).map((l) => String(l).toUpperCase()), size = p.size ?? 78, al = p.align === 'l';
    const fr = 'text-shadow:-2px 0 0 rgba(255,60,50,.34),2px 0 0 rgba(60,200,255,.28),0 0 22px rgba(236,232,223,.28),0 4px 14px rgba(0,0,0,.9)';
    const row = (t, i, st) => `<div data-l="${i}" style="${st};white-space:pre"><span></span><i style="display:inline-block;width:.6em;height:.78em;background:currentColor;vertical-align:-.04em;opacity:0;box-shadow:0 0 14px rgba(236,232,223,.5)"></i><span style="visibility:hidden"></span></div>`;
    return `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 66% 50% at ${al ? '34%' : '50%'} 50%,rgba(0,0,0,.62) 0%,rgba(0,0,0,.36) 55%,rgba(0,0,0,0) 100%)"></div>`
      + `<div ${ctx.dev('TitleType', { at: p.at ?? 8, cps: p.cps ?? 22, T: [kick, ...lines], k: kick ? 1 : 0 })} style="position:absolute;left:${al ? '130px' : 0};right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:${al ? 'flex-start' : 'center'};gap:${F(size * 0.2)}px;font-family:${VCR};color:${C.tx}">`
      + (kick ? row(kick, 0, `font-size:${F(size * 0.42)}px;line-height:1;letter-spacing:0.14em;color:${C.amb};text-shadow:0 0 16px rgba(242,185,10,.35),0 3px 10px rgba(0,0,0,.9);margin-bottom:${F(size * 0.18)}px`) : '<div data-l="0" style="display:none"><span></span><i></i><span></span></div>')
      + lines.map((l, i) => row(l, i + 1, `font-size:${size}px;line-height:1.05;letter-spacing:0.05em;${fr}`)).join('') + `</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, n=Math.floor(Math.max(0,g)*p.cps/60), L=el.querySelectorAll('[data-l]'), tot=0, act=-1, i;
    for(i=0;i<p.T.length;i++){ if(n>=tot&&(n<tot+p.T[i].length+4||i===p.T.length-1)&&act<0) act=i; tot+=p.T[i].length+4; }
    tot=0; for(i=0;i<L.length;i++){ var t=p.T[i], m=Math.max(0,Math.min(t.length,n-tot)); tot+=t.length+4;
      L[i].firstChild.textContent=g<0?'':t.slice(0,m); L[i].lastChild.textContent=g<0?t:(t.slice(m+1)+(m<t.length?' ':''));
      var cur=L[i].children[1]; cur.style.opacity=(g>=0&&i===act&&(m<t.length||Math.floor(g/16)%2===0))?1:0; }
    var out=c((f-(S.len-20))/20); el.style.opacity=(1-out).toFixed(4); el.style.filter=out>0?'blur('+(5*out).toFixed(2)+'px)':'none';`),
};

// v4 (owner 2026-11-19): typewriter type-on ONLY for title screens; every other text = TextFade (eased fade + 8 px rise) + click SFX.
const SH = 'text-shadow:0 2px 6px rgba(0,0,0,.8),0 0 20px rgba(0,0,0,.45)';
const fadeR = (stag) => new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, end=p.hold!=null?p.at+30+p.hold:S.len-20, out=c((f-end)/18), L=el.querySelectorAll('[data-l]');
    if(g<0||out>=1){el.style.opacity=0;return;} el.style.opacity=(1-io(out)).toFixed(4);
    for(var i=0;i<L.length;i++){var u=io(c((g-i*${stag})/30)); L[i].style.opacity=u.toFixed(4); L[i].style.transform='translateY('+(8*(1-u)).toFixed(2)+'px)';}`);
export const TextFade = {
  name: 'TextFade',
  html: (p, ctx) => {
    const kick = String(p.kick || '').toUpperCase(), lines = (p.lines || []).map((l) => String(l).toUpperCase()), pos = p.pos || (p.align === 'l' ? 'l' : 'c');
    const size = p.size ?? (pos === 'tl' ? 56 : 78), ff = p.font === 'mono' ? MONO : VCR, al = pos !== 'c';
    const dv = ctx.dev('TextFade', { at: p.at ?? 8, hold: p.hold ?? null });
    const rows = (kick ? `<div data-l style="font-size:${F(size * 0.5)}px;line-height:1;letter-spacing:0.14em;color:${C.amb};margin-bottom:${F(size * 0.12)}px;${SH}">${ctx.esc(kick)}</div>` : '')
      + lines.map((l) => `<div data-l style="font-size:${size}px;line-height:1.08;letter-spacing:0.06em;white-space:pre;${SH}">${ctx.esc(l)}</div>`).join('');
    if (pos === 'tl') return `<div ${dv} style="position:absolute;left:${p.x ?? 100}px;top:${p.y ?? 62}px;display:flex;flex-direction:column;align-items:flex-start;font-family:${ff};color:${C.tx};opacity:0">${rows}</div>`;
    return `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 66% 50% at ${al ? '34%' : '50%'} 50%,rgba(0,0,0,.58) 0%,rgba(0,0,0,.32) 55%,rgba(0,0,0,0) 100%)"></div>`
      + `<div ${dv} style="position:absolute;left:${al ? '130px' : 0};right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:${al ? 'flex-start' : 'center'};gap:${F(size * 0.16)}px;font-family:${ff};color:${C.tx};opacity:0">${rows}</div>`;
  },
  render: fadeR(6),
};
export const PlaceText = {
  name: 'PlaceText',
  html: (p, ctx) => {
    const size = p.size ?? 50, ff = p.font === 'mono' ? MONO : VCR, pos = p.pos || 'bl', t = String(p.text || '').toUpperCase(), sub = String(p.sub || '').toUpperCase();
    const xy = p.x != null ? `left:${p.x}px;top:${p.y}px` : `${pos[1] === 'r' ? 'right:96px' : 'left:96px'};${pos[0] === 't' ? 'top:70px' : `bottom:${p.y ?? 84}px`}`;
    return `<div ${ctx.dev('PlaceText', { at: p.at ?? 0, hold: p.hold ?? null })} style="position:absolute;${xy};display:flex;flex-direction:column;align-items:${pos[1] === 'r' ? 'flex-end' : 'flex-start'};gap:8px;font-family:${ff};color:${C.tx};opacity:0">`
      + `<div data-l style="font-size:${size}px;line-height:1;letter-spacing:0.06em;white-space:nowrap;text-shadow:0 0 3px rgba(0,0,0,.75),0 2px 4px rgba(0,0,0,.85),0 0 18px rgba(0,0,0,.6)">${ctx.esc(t)}</div>`
      + (sub ? `<div data-l style="font:500 ${F(size * 0.52)}px/1 ${MONO};letter-spacing:0.14em;color:#CFC9BC;white-space:nowrap;text-shadow:0 0 3px rgba(0,0,0,.8),0 2px 4px rgba(0,0,0,.85),0 0 14px rgba(0,0,0,.55)">${ctx.esc(sub)}</div>` : '') + `</div>`;
  },
  render: fadeR(8),
};

export default [LowerThird, Article3D, StampRing, TitleType, TextFade, PlaceText];
