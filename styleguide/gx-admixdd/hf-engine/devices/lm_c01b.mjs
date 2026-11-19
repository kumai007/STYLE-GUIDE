// lm_c01b.mjs - case 1 part B devices (last-moments channel). 60 fps frames. Owner feedback 2026-11-18: no flat plates / flat boxes /
// plain text on flat colour: every graphic sits on real footage or a photo (blur layer, grain, vignette), eased 3-D camera, lit type.
// API (p = props; f = shot-local frame):
//  Cam {s:[a,b], tx:[a,b], ty:[a,b], rx:[a,b], ry:[a,b], per=1800, a=0, b=len, o, css}  wrapper: eased (sine.inOut) 3-D camera move
//      over frames [a,b]; css = extra style (blur/brightness for backdrops). Kids inside.
//  Img {src, pos='50% 50%', fit='cover'}  static photo (src relative to the media root, e.g. 'photos/x.jpg').
//  Win {a, b}  wrapper: visible only for shot frames [a, b).
//  Lbl {text, at='bl'|'tl', size=22}  small static label (ILLUSTRATIVE / REPLAY) with a red dot.
//  TCard {kick, lines:[..], at=8}  typed kicker (Plex Mono) + red rule + Oswald lines that resolve from blur; lit, on a soft
//      light-falloff scrim (no box). Put it over a backdrop (Cam with footage/photo). Out 24 f at the end of the shot.
//  Tag {name, role, at=0, hold=200, pin}  lower third without a box: bottom gradient scrim, red rule draws, Bebas name wipes in
//      from blur, role typed in Plex Mono. pin = place marker (PlaceTag look).
//  PageC {img, iw, ih, bands:[[x,y,w,h,f0]], W=1500, H=800}  article page on its backdrop (kids): lit paper (light falloff),
//      soft drop shadow, focus pull, eased 3-D camera (rotateX 9->2, rotateY -7->-2, scale .94->1.05), textured marker bands L->R 44 f.
//  QuoteC {lines:[..], attr, at=0}  premium quote: words resolve one by one (blur -> sharp, rise), warm lit Source Serif 4 type,
//      faint red opening mark, attribution typed. Parallax drift opposite to the backdrop.
import { Article3D } from './lm_pro.mjs';
const AF = 'af';
const C = { tx: '#E8E4DC', dim: '#9A968E', red: '#9E1F1C', amb: '#E3A21A' };
const MONO = "'IBM Plex Mono',monospace", OSW = "'Oswald',sans-serif", SERIF = "'Source Serif 4',serif";
const LIT = 'text-shadow:0 0 28px rgba(255,236,206,.18),0 3px 10px rgba(0,0,0,.85),0 14px 40px rgba(0,0,0,.6)';
const E = 'var c=function(x){return Math.max(0,Math.min(1,x))},io=function(x){return -(Math.cos(Math.PI*x)-1)/2},o2=function(x){return 1-(1-x)*(1-x)},o3=function(x){return 1-Math.pow(1-x,3)};';

export const Cam = {
  name: 'Cam',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Cam', { s: p.s, tx: p.tx, ty: p.ty, rx: p.rx, ry: p.ry, per: p.per ?? 1800, a: p.a ?? 0, b: p.b })} style="transform-origin:${p.o || '50% 50%'};${p.css || ''}">${ctx.kids(node)}</div>`,
  render: function (el, f, p, G, S) {
    var b = p.b || S.len, u = Math.max(0, Math.min(1, (f - p.a) / Math.max(1, b - p.a))), k = -(Math.cos(Math.PI * u) - 1) / 2;
    var L = function (v, d) { return v ? v[0] + (v[1] - v[0]) * k : d; };
    el.style.transform = 'perspective(' + p.per + 'px) translate3d(' + L(p.tx, 0).toFixed(2) + 'px,' + L(p.ty, 0).toFixed(2) + 'px,0) rotateX(' + L(p.rx, 0).toFixed(3) + 'deg) rotateY(' + L(p.ry, 0).toFixed(3) + 'deg) scale(' + L(p.s, 1).toFixed(5) + ')';
  },
};
export const Img = {
  name: 'Img',
  html: (p) => `<img class="${AF}" src="assets/media/${p.src}" alt="" style="object-fit:${p.fit || 'cover'};object-position:${p.pos || '50% 50%'}">`,
};
export const Win = {
  name: 'Win',
  html: (p, ctx, node) => `<div class="${AF}" ${ctx.dev('Win', { a: p.a ?? 0, b: p.b ?? 1e9 })} style="opacity:0">${ctx.kids(node)}</div>`,
  render: function (el, f, p) { el.style.opacity = f >= p.a && f < p.b ? 1 : 0; },
};
export const Lbl = {
  name: 'Lbl',
  html: (p, ctx) => {
    const pos = p.at === 'tl' ? 'left:96px;top:58px' : 'left:96px;bottom:58px';
    return `<div style="position:absolute;${pos};display:flex;align-items:center;gap:14px;font:600 ${p.size ?? 22}px/1 ${MONO};letter-spacing:0.18em;color:${C.tx};opacity:.82;text-shadow:0 1px 6px rgba(0,0,0,.9)"><i style="width:10px;height:10px;border-radius:50%;background:${C.red};box-shadow:0 0 10px rgba(158,31,28,.9)"></i>${ctx.esc(p.text)}</div>`;
  },
};
const scrim = (k = 0.5) => `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 62% 46% at 50% 50%, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.55}) 55%, rgba(0,0,0,0) 100%)"></div>`;

export const TCard = {
  name: 'TCard',
  html: (p, ctx) => {
    const lines = (p.lines || []).map((l, i) => `<div data-l="${i}" style="font:500 ${p.size ?? 84}px/1.12 ${OSW};letter-spacing:0.06em;text-transform:uppercase;color:${C.tx};${LIT};opacity:0;white-space:nowrap">${ctx.esc(l)}</div>`).join('');
    return `${scrim(0.55)}<div ${ctx.dev('TCard', { at: p.at ?? 8, kick: String(p.kick || '').toUpperCase(), n: (p.lines || []).length })} style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:6px">`
      + `<div data-k style="font:600 30px/1 ${MONO};letter-spacing:0.2em;color:${C.dim};text-shadow:0 2px 8px rgba(0,0,0,.9);white-space:pre;min-height:30px"><span></span><i style="display:inline-block;width:14px;height:26px;background:${C.red};vertical-align:-3px;margin-left:6px"></i></div>`
      + `<div data-r style="width:220px;height:3px;margin:22px 0 26px;background:linear-gradient(90deg,rgba(158,31,28,0),${C.red} 20%,${C.red} 80%,rgba(158,31,28,0));transform:scaleX(0);box-shadow:0 0 12px rgba(158,31,28,.6)"></div>${lines}</div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, k=el.querySelector('[data-k]'), n=Math.max(0,Math.min(p.kick.length,Math.floor(g*0.6)));
    k.firstChild.textContent=g<0?'':p.kick.slice(0,n); k.lastChild.style.opacity=g<0?0:(Math.floor(g/15)%2?0:1);
    var t0=p.kick.length/0.6+6; el.querySelector('[data-r]').style.transform='scaleX('+io(c((g-t0)/24)).toFixed(4)+')';
    var out=c((f-(S.len-24))/24), L=el.querySelectorAll('[data-l]');
    for(var i=0;i<L.length;i++){var u=o3(c((g-t0-14-i*16)/30));L[i].style.opacity=(u*(1-out)).toFixed(4);L[i].style.filter='blur('+(10*(1-u)+6*out).toFixed(2)+'px)';L[i].style.transform='translateY('+(18*(1-u)).toFixed(2)+'px)';L[i].style.letterSpacing=(0.06+0.08*(1-u)).toFixed(4)+'em';}
    el.style.opacity=(1-out).toFixed(4);`),
};

export const Tag = {
  name: 'Tag',
  html: (p, ctx) => {
    const pin = p.pin ? `<i style="display:inline-block;width:26px;height:36px;margin-right:22px;background:${C.red};clip-path:polygon(50% 100%,0 40%,0 25%,25% 0,75% 0,100% 25%,100% 40%);filter:drop-shadow(0 3px 6px rgba(0,0,0,.8))"></i>` : '';
    return `<div ${ctx.dev('Tag', { at: p.at ?? 0, hold: p.hold ?? 200, role: String(p.role || '').toUpperCase() })} style="position:absolute;left:0;right:0;bottom:0;height:420px;opacity:0">`
      + `<div class="${AF}" style="background:linear-gradient(0deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.45) 45%,rgba(0,0,0,0) 100%)"></div>`
      + `<div data-r style="position:absolute;left:120px;top:208px;width:120px;height:4px;background:${C.red};transform:scaleX(0);transform-origin:0 50%;box-shadow:0 0 12px rgba(158,31,28,.7)"></div>`
      + `<div data-n style="position:absolute;left:120px;top:232px;display:flex;align-items:center;font:400 ${p.size ?? 104}px/1 'Bebas Neue',sans-serif;letter-spacing:0.035em;color:${C.tx};${LIT};white-space:nowrap">${pin}${ctx.esc(p.name)}</div>`
      + `<div data-o style="position:absolute;left:124px;top:${232 + (p.size ?? 104) + 14}px;font:500 28px/1 ${MONO};letter-spacing:0.16em;color:${C.dim};text-shadow:0 2px 8px rgba(0,0,0,.9);white-space:pre"></div></div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, out=c((g-48-p.hold)/24); el.style.opacity=(g<0?0:1-out).toFixed(4);
    el.querySelector('[data-r]').style.transform='scaleX('+io(c(g/22)).toFixed(4)+')';
    var u=o3(c((g-10)/30)), nm=el.querySelector('[data-n]'); nm.style.clipPath='inset(-40px '+(100*(1-u)).toFixed(2)+'% -40px -40px)'; nm.style.filter='blur('+(8*(1-u)).toFixed(2)+'px)';
    nm.style.transform='translateX('+(-24*(1-u)+6*c(g/(48+p.hold))).toFixed(2)+'px)';
    el.querySelector('[data-o]').textContent=p.role.slice(0,Math.max(0,Math.floor((g-34)*0.8)));`),
};

export const PageC = {
  name: 'PageC',
  html: (p, ctx, node) => {
    const sc = Math.min((p.W ?? 1500) / p.iw, (p.H ?? 800) / p.ih), w = p.iw * sc, h = p.ih * sc;
    const bands = (p.bands || []).map(([x, y, bw, bh, f0]) => `<i data-f0="${f0}" style="position:absolute;left:${(x - 6) * sc}px;top:${y * sc}px;width:${(bw + 12) * sc}px;height:${bh * sc}px;display:block;mix-blend-mode:multiply;border-radius:5px 11px 6px 9px;transform:scaleX(0) rotate(-0.25deg);transform-origin:0 50%;background:linear-gradient(180deg,rgba(227,162,26,0) 0%,rgba(227,162,26,.78) 14%,rgba(232,170,30,.9) 52%,rgba(222,156,24,.8) 86%,rgba(227,162,26,0) 100%);filter:blur(.7px)"></i>`).join('');
    return `${ctx.kids(node)}<div class="${AF}" style="perspective:2000px;perspective-origin:50% 45%"><div ${ctx.dev('PageC', {})} style="position:absolute;left:${(1920 - w) / 2}px;top:${(1080 - h) / 2}px;width:${w}px;height:${h}px;transform-style:preserve-3d;box-shadow:0 50px 90px rgba(0,0,0,.65),0 10px 24px rgba(0,0,0,.55)">`
      + `<img src="assets/media/${p.img}" alt="" style="position:absolute;inset:0;width:100%;height:100%;display:block;filter:contrast(1.04) brightness(.93) sepia(.08)">${bands}`
      + `<div style="position:absolute;inset:0;pointer-events:none;background:linear-gradient(118deg,rgba(255,246,228,.16) 0%,rgba(255,255,255,0) 38%,rgba(0,0,0,.18) 72%,rgba(0,0,0,.42) 100%)"></div>`
      + `<div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 80% 90% at 40% 35%,rgba(0,0,0,0) 55%,rgba(0,0,0,.35) 100%)"></div></div></div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var u=o3(c(f/54)), k=io(c(f/S.len));
    el.style.transform='translateY('+(140*(1-u)).toFixed(2)+'px) rotateX('+(9-7*k).toFixed(3)+'deg) rotateY('+(-7+5*k).toFixed(3)+'deg) scale('+(0.94+0.11*k).toFixed(5)+')';
    el.style.filter='blur('+(5*(1-o2(c(f/34)))).toFixed(2)+'px)';
    var b=el.querySelectorAll('i');for(var i=0;i<b.length;i++){var q=io(c((f-+b[i].dataset.f0)/44));b[i].style.transform='scaleX('+q.toFixed(4)+') rotate(-0.25deg)';}`),
};

export const QuoteC = {
  name: 'QuoteC',
  html: (p, ctx) => {
    let i = 0;
    const lines = (p.lines || []).map((l) => `<div style="white-space:nowrap">${l.split(' ').map((w) => `<span data-w="${i++}" style="display:inline-block;opacity:0;margin:0 0.13em">${ctx.esc(w)}</span>`).join('')}</div>`).join('');
    return `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 55% 40% at 50% 48%,rgba(255,226,180,.10) 0%,rgba(255,226,180,0) 70%)"></div>${scrim(0.42)}`
      + `<div ${ctx.dev('QuoteC', { at: p.at ?? 0, n: i, attr: String(p.attr || '').toUpperCase() })} style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center">`
      + `<div data-q style="font:300 260px/0.6 ${SERIF};color:${C.red};opacity:0;text-shadow:0 0 30px rgba(158,31,28,.5);height:120px">&#8220;</div>`
      + `<div style="font:400 ${p.size ?? 96}px/1.18 ${SERIF};color:#EFE7D8;text-shadow:0 0 36px rgba(255,228,186,.32),0 0 8px rgba(255,236,206,.18),0 4px 14px rgba(0,0,0,.85),0 18px 50px rgba(0,0,0,.6)">${lines}</div>`
      + `<div data-r style="width:160px;height:2px;margin:44px auto 26px;background:${C.red};transform:scaleX(0);box-shadow:0 0 10px rgba(158,31,28,.7)"></div>`
      + `<div data-a style="font:500 28px/1 ${MONO};letter-spacing:0.2em;color:${C.dim};text-shadow:0 2px 8px rgba(0,0,0,.9);white-space:pre;min-height:28px"></div></div>`;
  },
  render: new Function('el', 'f', 'p', 'G', 'S', E + `
    var g=f-p.at, W=el.querySelectorAll('[data-w]');
    el.querySelector('[data-q]').style.opacity=(0.55*io(c(g/30))).toFixed(4);
    for(var i=0;i<W.length;i++){var u=o3(c((g-8-i*9)/30));W[i].style.opacity=u.toFixed(4);W[i].style.filter='blur('+(12*(1-u)).toFixed(2)+'px)';W[i].style.transform='translateY('+(22*(1-u)).toFixed(2)+'px)';}
    var t1=8+p.n*9+24; el.querySelector('[data-r]').style.transform='scaleX('+io(c((g-t1)/24)).toFixed(4)+')';
    el.querySelector('[data-a]').textContent=p.attr.slice(0,Math.max(0,Math.floor((g-t1-16)*0.8)));
    el.style.transform='translateY(-50%) translateX('+(10-20*io(c(f/S.len))).toFixed(2)+'px)';
    var out=c((f-(S.len-30))/30); el.style.opacity=(1-out).toFixed(4);`),
};

// Article3H {same props as lm_pro Article3D}  v5b (lead 2026-11-19): Article3D marks max 2 bands; this marks up to 3 (whole key
//      sentence). Renders Article3D for bands 0-1, then splices band 2's marker svg (built by a 2nd Article3D call with the same
//      scale, its filter id renamed to the 1st call's) into the page. Animation = Article3D's own render (all svg[data-f0]).
export const Article3H = {
  name: 'Article3H',
  html: (p, ctx, node) => {
    const bs = p.bands || [], h = Article3D.html({ ...p, bands: bs.slice(0, 2) }, ctx, node);
    if (bs.length < 3) return h;
    const id0 = h.match(/url\(#(lp\d+)R\)/)?.[1];
    const big = bs[0][2] >= bs[1][2] ? bs[0] : bs[1]; // keep the widest band in the 2nd call so both calls get the same scale
    const h2 = Article3D.html({ ...p, bands: [bs[2], big] }, ctx, node), id2 = h2.match(/url\(#(lp\d+)R\)/)?.[1];
    const m = h2.match(/<svg data-f0=[\s\S]*?<\/svg>/);
    if (!m || !id0 || !id2) return h;
    const band = m[0].split(`#${id2}`).join(`#${id0}`);
    const at = h.indexOf('<img data-dof');
    return h.slice(0, at) + band + h.slice(at);
  },
};
export default [Cam, Img, Win, Lbl, TCard, Tag, PageC, QuoteC, Article3H];
