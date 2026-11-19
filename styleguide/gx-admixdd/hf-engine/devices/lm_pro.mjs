// lm_pro.mjs - shared PRO kit for the last-moments channel (owner 2026-11-19: "AI slop" -> hand-made print/ink look, refs = Abyssal
// Detective latest5: black brush name tags with distressed condensed caps, article crops with uneven yellow marker, VCR typed dates).
// 60 fps frames; f = shot-local frame. Case: devices [...,'lm_pro'], fonts need BebasNeue, IBMPlexMono-600, (VCR OSD Mono file when added).
// API
//  LowerThird {name, role, at=0, hold=200, pos='l'|'c'|'r', size=92, pin=false, y=118}
//      hand-inked black brush bar (ragged SVG + displacement) wipes on L->R behind a ragged mask, distressed Bebas caps (eroded by a
//      noise mask), role in Plex Mono on a smaller torn paper strip, -1.5 deg, overshoot settle, wipe-off exit. pin = red place mark.
//  Article3D {img, iw, ih, bands:[[x,y,w,h,f0]], src, date, focus:[x,y], W=1480, H=820, rx=[11,2], ry=[-12,-2], s=[.9,1.1]}
//      wrapper (kids = backdrop). Real page crop as a physical sheet: perspective tilt easing flat, layered paper shadow, grain,
//      far-edge depth-of-field blur, camera push toward focus (img px; default = first band), hand-drawn amber marker (uneven ink,
//      wipes L->R from frame f0, max 2 bands), source + date on an ink strip (mono). Bake face mosaics into the img.
//  StampRing {x, y, w, h, at=0, hold=1e9, rect=[0,0,1920,1080], zoom=1.3, dim=.55, zin=40}
//      wrapper (kids = the footage). x,y,w,h = burned-in timestamp box in screen px; rect = visible picture area. Hand-drawn red
//      ring (1.1 turns, doubled stroke) draws ON the stamp, surround dims, punch-in toward the stamp. Ring box is clamped into rect
//      and the zoom origin snaps to the nearest picture edge, so nothing ever leaves the picture.
//  TitleType {kick, lines:[..], at=8, size=78, cps=22, align='c'|'l'}
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

export const LowerThird = {
  name: 'LowerThird',
  html: (p, ctx) => {
    const id = `lp${++UID}`, r = rng(hash(p.name + '|' + p.role)), size = p.size ?? 92, name = String(p.name || '').toUpperCase(), role = String(p.role || '').toUpperCase();
    const tw = name.length * size * 0.415 + (p.pin ? 46 : 0), bw = tw + 110, bh = size * 1.22, rw = role.length * 17.6 + 52, rh = 44;
    const pos = p.pos === 'c' ? `left:50%;margin-left:${-bw / 2}px` : p.pos === 'r' ? 'right:120px' : 'left:112px';
    const spl = Array.from({ length: 7 }, () => `<circle cx="${F(bw + 14 + r() * 70)}" cy="${F(r() * bh)}" r="${F(1 + r() * 3.2)}"/>`).join('');
    const pin = p.pin ? `<i style="display:inline-block;width:22px;height:30px;margin-right:20px;background:${C.red};clip-path:polygon(50% 100%,2% 42%,0 22%,22% 0,80% 2%,100% 26%,96% 44%)"></i>` : '';
    return `${defs(id, hash(name))}<div ${ctx.dev('LowerThird', { at: p.at ?? 0, hold: p.hold ?? 200 })} style="position:absolute;${pos};bottom:${p.y ?? 118}px;transform-origin:8% 60%;opacity:0;filter:drop-shadow(0 10px 22px rgba(0,0,0,.55))">`
      + `<div data-b style="position:relative;width:${F(bw)}px;height:${F(bh)}px">`
      + `<svg viewBox="-14 -14 ${F(bw + 110)} ${F(bh + 28)}" style="position:absolute;left:-14px;top:-14px;width:${F(bw + 110)}px;height:${F(bh + 28)}px;overflow:visible"><g filter="url(#${id}R)" fill="${C.ink}"><path d="${brush(bw, bh, r)}"/>${spl}</g>`
      + `<path data-u d="M${F(26 + r() * 10)} ${F(bh + 6)}C${F(bw * 0.2)} ${F(bh + 1 + r() * 5)},${F(bw * 0.38)} ${F(bh + 11)},${F(bw * 0.52 + r() * 30)} ${F(bh + 4 + r() * 4)}" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" filter="url(#${id}R)"/></svg>`
      + `<div data-n style="position:absolute;left:52px;top:0;height:${F(bh)}px;display:flex;align-items:center;white-space:nowrap;font:400 ${size}px/1 'Bebas Neue',sans-serif;letter-spacing:0.045em;color:${C.tx};padding-top:${F(size * 0.07)}px;filter:url(#${id}T)">${pin}${ctx.esc(name)}</div></div>`
      + (role ? `<div data-o style="position:relative;margin:-9px 0 0 ${F(38 + r() * 26)}px;width:${F(rw)}px;height:${rh}px;transform:rotate(${F(0.6 + r() * 0.9)}deg)">`
        + `<svg viewBox="-8 -8 ${F(rw + 40)} ${rh + 16}" style="position:absolute;left:-8px;top:-8px;width:${F(rw + 40)}px;height:${rh + 16}px"><path d="${brush(rw, rh, r, 3)}" fill="${C.paper}" filter="url(#${id}R)"/></svg>`
        + `<div style="position:absolute;left:24px;top:0;height:${rh}px;display:flex;align-items:center;white-space:nowrap;font:600 24px/1 ${MONO};letter-spacing:0.13em;color:#151413;filter:url(#${id}T)">${ctx.esc(role)}</div></div>` : '')
      + `</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, T=30, xo=g-(T+18+p.hold), out=c(xo/16); if(g<0||out>=1){el.style.opacity=0;return;} el.style.opacity=1;
    var u=o3(c(g/T)), s=bk(c(g/(T+14)));
    var J=[0,5,-3,6,-4,3,0], edge=function(q,off){var a=[];for(var i=0;i<J.length;i++){a.push((q*118-9+J[i]*(q<1?1:0)+off).toFixed(2)+'% '+(i*100/(J.length-1)*1.6-30).toFixed(1)+'%');}return a;};
    var L=(out*118-9), R=edge(u,0), pts=[L.toFixed(2)+'% -30%'].concat(R).concat([L.toFixed(2)+'% 130%']);
    var b=el.querySelector('[data-b]'); b.style.clipPath=out>0||u<1?'polygon('+pts.join(',')+')':'none';
    el.style.transform='rotate('+(-1.5-1.6*(1-s)).toFixed(3)+'deg) translate('+(-26*(1-s)).toFixed(2)+'px,'+(7*(1-s)).toFixed(2)+'px) scale('+(1.035-0.035*s).toFixed(4)+')';
    var n=el.querySelector('[data-n]'), un=o3(c((g-9)/24)); n.style.clipPath='inset(-20% '+(100*(1-un)).toFixed(2)+'% -20% -5%)';
    el.querySelector('[data-u]').setAttribute('stroke-dashoffset',(1-io(c((g-T+4)/20))).toFixed(4));
    var o=el.querySelector('[data-o]'); if(o){var uo=o3(c((g-T+6)/20)); o.style.clipPath='inset(-30% '+(100*(1-uo)*(1-out)+100*out*0).toFixed(2)+'% -30% '+(110*out-5).toFixed(2)+'%)'; o.style.opacity=uo>0?1:0;}`),
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
  html: (p, ctx, node) => {
    const id = `lp${++UID}`, r = rng(hash(p.img)), sc = Math.min((p.W ?? 1480) / p.iw, (p.H ?? 820) / p.ih), w = p.iw * sc, h = p.ih * sc;
    const b0 = (p.bands || [])[0], fx = p.focus || (b0 ? [b0[0] + b0[2] / 2, b0[1] + b0[3] / 2] : [p.iw / 2, p.ih / 2]);
    const ox = fx[0] * sc, oy = fx[1] * sc, src = `assets/media/${p.img}`;
    const bands = (p.bands || []).slice(0, 2).map(([x, y, bw, bh, f0]) => { const W = bw * sc, H = bh * sc, [body, over] = marker(W, H, r);
      return `<svg data-f0="${f0}" data-w="${Math.round(W)}" viewBox="${F(-H * 0.4)} ${F(-H * 0.2)} ${F(W + H * 0.8)} ${F(H * 1.4)}" style="position:absolute;left:${F(x * sc - H * 0.4)}px;top:${F(y * sc - H * 0.2)}px;width:${F(W + H * 0.8)}px;height:${F(H * 1.4)}px;mix-blend-mode:multiply;transform:rotate(${F((r() - 0.5) * 0.7)}deg);clip-path:inset(0 100% 0 0)"><g filter="url(#${id}R)"><path d="${body}" fill="${C.amb}" opacity=".86"/><path d="${over}" fill="#E09A00" opacity=".4"/></g></svg>`; }).join('');
    const tag = [p.src, p.date].filter(Boolean).map((t) => ctx.esc(String(t).toUpperCase()));
    const tw = tag.join('  /  ').length * 15.4 + 56;
    return `${ctx.kids(node)}${defs(id, hash(p.img))}<div class="${AF}" ${ctx.dev('Article3D', { rx: p.rx || [11, 2], ry: p.ry || [-12, -2], s: p.s || [0.9, 1.1], cx: 960 - ((1920 - w) / 2 + ox), cy: 540 - ((1080 - h) / 2 + oy) })} style="perspective:1700px;perspective-origin:50% 42%">`
      + `<div data-pg style="position:absolute;left:${F((1920 - w) / 2)}px;top:${F((1080 - h) / 2)}px;width:${F(w)}px;height:${F(h)}px;transform-origin:${F(ox)}px ${F(oy)}px;background:#e9e3d6;box-shadow:0 2px 3px rgba(0,0,0,.5),0 18px 30px rgba(0,0,0,.5),0 70px 120px rgba(0,0,0,.6)">`
      + `<img src="${src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;display:block;filter:contrast(1.05) brightness(.95) sepia(.12)">`
      + `<svg style="position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:multiply;opacity:.55"><rect width="100%" height="100%" filter="url(#${id}G)"/></svg>${bands}`
      + `<img data-dof src="${src}" alt="" style="position:absolute;inset:0;width:100%;height:100%;display:block;filter:blur(7px) brightness(.9) sepia(.12);-webkit-mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.6) 16%,transparent 40%);mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.6) 16%,transparent 40%)">`
      + `<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(112deg,rgba(255,244,222,.2) 0%,rgba(255,255,255,0) 36%,rgba(0,0,0,.14) 70%,rgba(0,0,0,.4) 100%)"></div>`
      + `<div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 60px rgba(60,40,10,.22),inset 0 -2px 0 rgba(0,0,0,.25)"></div></div>`
      + (tag.length ? `<div data-tg style="position:absolute;left:104px;bottom:74px;width:${F(tw)}px;height:46px;transform:rotate(-1.2deg);opacity:0;filter:drop-shadow(0 6px 14px rgba(0,0,0,.6))"><svg viewBox="-8 -8 ${F(tw + 40)} 62" style="position:absolute;left:-8px;top:-8px;width:${F(tw + 40)}px;height:62px"><path d="${brush(tw, 46, r, 3)}" fill="${C.ink}" filter="url(#${id}R)"/></svg>`
        + `<div style="position:absolute;left:26px;top:0;height:46px;display:flex;align-items:center;white-space:pre;font:600 22px/1 ${MONO};letter-spacing:0.12em;color:${C.tx};filter:url(#${id}T)">${tag[0]}${tag[1] ? `<span style="color:${C.amb}">  /  </span>${tag[1]}` : ''}</div></div>` : '')
      + `</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var pg=el.querySelector('[data-pg]'), u=bk(c(f/46)), k=io(c(f/S.len)), L=function(v){return v[0]+(v[1]-v[0])*k;}, out=c((f-(S.len-10))/10);
    pg.style.transform='translate3d('+(p.cx*0.55*k).toFixed(2)+'px,'+(p.cy*0.55*k+170*(1-u)).toFixed(2)+'px,0) rotateX('+(L(p.rx)+8*(1-u)).toFixed(3)+'deg) rotateY('+L(p.ry).toFixed(3)+'deg) rotateZ('+(-1.4+1.0*k).toFixed(3)+'deg) scale('+L(p.s).toFixed(5)+')';
    pg.style.opacity=c(f/8).toFixed(3);
    el.querySelector('[data-dof]').style.opacity=(1-0.75*k).toFixed(3);
    var b=pg.querySelectorAll('svg[data-f0]');for(var i=0;i<b.length;i++){var d=Math.max(26,+b[i].dataset.w/24), q=io(c((f-+b[i].dataset.f0)/d));b[i].style.clipPath='inset(0 '+(100*(1-q)).toFixed(2)+'% 0 0)';}
    var t=el.querySelector('[data-tg]'); if(t){var ut=o3(c((f-30)/22)); t.style.opacity=ut>0?1:0; t.style.clipPath='inset(-30% '+(100*(1-ut)).toFixed(2)+'% -30% -5%)';}`),
};

export const StampRing = {
  name: 'StampRing',
  html: (p, ctx, node) => {
    const id = `lp${++UID}`, r = rng(hash([p.x, p.y, p.w, p.h].join()));
    const [RX, RY, RW, RH] = p.rect || [0, 0, 1920, 1080], m = 12;
    let px = Math.max(26, p.w * 0.13), py = Math.max(22, p.h * 0.55);
    let bw = Math.min(p.w + 2 * px, RW - 2 * m), bh = Math.min(p.h + 2 * py, RH - 2 * m);
    const bx = Math.max(RX + m, Math.min(RX + RW - m - bw, p.x + p.w / 2 - bw / 2)), by = Math.max(RY + m, Math.min(RY + RH - m - bh, p.y + p.h / 2 - bh / 2));
    const cx = bx + bw / 2, cy = by + bh / 2, a = bw / 2 - 6, b = bh / 2 - 6, ph = r() * 6.28;
    const ring = (k, turns) => { const P = []; for (let i = 0; i <= 72; i++) { const u = i / 72, t = -2.5 + u * 6.283 * turns, w = 1 - 0.07 * k + 0.035 * Math.sin(3 * t + ph + k) + 0.06 * u * (1 - k); P.push(`${F(cx + a * w * Math.cos(t))} ${F(cy + b * w * Math.sin(t) * (1 - 0.05 * k))}`); } return 'M' + P.join('L'); };
    const u = (cx - RX) / RW, v = (cy - RY) / RH, sx = u < 0.3 ? 0 : u > 0.7 ? 1 : u, sy = v < 0.3 ? 0 : v > 0.7 ? 1 : v;
    return `<div class="${AF}" ${ctx.dev('StampRing', { at: p.at ?? 0, hold: p.hold ?? 1e9, zoom: p.zoom ?? 1.3, zin: p.zin ?? 40 })} style="transform-origin:${F(RX + RW * sx)}px ${F(RY + RH * sy)}px">${ctx.kids(node)}`
      + `<div data-d class="${AF}" style="pointer-events:none;opacity:0;background:radial-gradient(ellipse ${F(a * 1.9)}px ${F(b * 2.6)}px at ${F(cx)}px ${F(cy)}px,rgba(0,0,0,0) 0%,rgba(0,0,0,0) 52%,rgba(0,0,0,${p.dim ?? 0.55}) 100%)"></div>`
      + `<svg class="${AF}" viewBox="0 0 1920 1080" style="pointer-events:none;overflow:hidden"><defs><filter id="${id}R" filterUnits="userSpaceOnUse" x="${F(bx - 4)}" y="${F(by - 4)}" width="${F(bw + 8)}" height="${F(bh + 8)}"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="${hash(id) % 90}"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
      + `<g filter="url(#${id}R)" fill="none" stroke="${C.red}" stroke-linecap="round" stroke-linejoin="round" style="filter:url(#${id}R) drop-shadow(0 0 5px rgba(0,0,0,.8))"><path data-r d="${ring(0, 1.12)}" stroke-width="7" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><path data-r d="${ring(1, 0.8)}" stroke-width="3" opacity=".75" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></g></svg></div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, out=c((g-p.hold)/14), on=g>=0?1-out:0, z=bk(c(g/p.zin))*(1-io(out));
    el.style.transform=g<0?'none':'scale('+(1+(p.zoom-1)*z+0.03*c(g/Math.max(1,S.len-p.at))).toFixed(5)+')';
    el.querySelector('[data-d]').style.opacity=(io(c(g/24))*(1-out)).toFixed(4);
    var R=el.querySelectorAll('[data-r]'); R[0].setAttribute('stroke-dashoffset',(1-io(c((g-10)/26))).toFixed(4)); R[1].setAttribute('stroke-dashoffset',(1-io(c((g-30)/20))).toFixed(4));
    R[0].parentNode.style.opacity=on.toFixed(3);`),
};

export const TitleType = {
  name: 'TitleType',
  html: (p, ctx) => {
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

export default [LowerThird, Article3D, StampRing, TitleType];
