// lm_v2.mjs - intro v2 devices for "last moment footage" (2026-11-18, owner: v1 intro cards = "AI slop").
// Craft from the Abyssal refs (photographic lit backdrop, text sitting IN the image, layered bands with depth blur, eased
// camera), own motif THE DESCENT (public-domain HABS stairwell photo) + own palette. No berg/typewriter/cyan/VHS/static/stamps.
// 60 fps; f = shot-local frame. Load after 'lm' (uses its _V video device). Images: assets/media/stills/*.jpg.
// API:
//  Warning2 {}  c1 v2: HCR doorway still (dark, grained, slow push) + red WARNING (Anton, eroded texture, red bleed, flicker-on
//        f6-46) between hairlines (f14-56) + 2 Plex Mono lines (f34-80). Wrap in GlitchCut for the exit.
//  Descent {rows=LEDGER}  c3 v2: 21 cases on 7 translucent bands in a 3-D plane (rotateX) over the stairwell; camera dollies
//        down (sine, whole shot), focus follows the camera (each band sharp as it passes), deeper bands dimmer; dust + grain.
//  DescentReturn {rows}  camera rises to band 1 (f0-72, quint) and pushes into case 01 (f50-120); red hairline f60-96 (tick
//        at f62), light sweep f68-116, other rows fall into blur. Use with Dip {inN:14,outN:16}.
//  GlitchOut2 {n=10, seed}  v3 wrapper: visible glitch-out on the last n frames (see the device). Use instead of lm GlitchCut.
//  TitleType {a, b, plate, fa, fb, rate}  v3: the ONE title screen (CASE 1 + typed case title, VCR OSD Mono). Replaces
//        DescentReturn + CaseCard2 in lm_intro (both kept below, unused).
//  CaseCard2 {no, name:[l1,l2], plate:{src,t,speed}}  c4/c5 v2: graded plate + stairwell texture, CASE NN in f14-62,
//        zoom-through f150-178, name f170-216, red hairline f186-228.
import { LEDGER } from './lm.mjs';

const AF = 'af';
const MONO = "'IBM Plex Mono',monospace", OSW = "'Oswald',sans-serif", ANT = "'Anton',sans-serif";
const STAIR = 'assets/media/stills/descent_stairwell.jpg', DOOR = 'assets/media/stills/warn_hcr_door.jpg';
const lcg = (s) => () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
const grain = (ctx, k, freq = 0.8) => {
  const id = ctx.id('g2');
  return `<svg class="${AF} gr2" width="1920" height="1080" style="pointer-events:none;mix-blend-mode:overlay;opacity:${k * 2}"><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
};
// erosion texture for type: alpha *= clamp(a - b*noise) (worn print, not a font effect)
const texDef = (id, seed, a = 2.7, b = 3.1, freq = 0.72) => `<svg width="0" height="0" style="position:absolute"><filter id="${id}" x="-10%" y="-40%" width="120%" height="180%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -${b} 0 0 0 ${a}"/><feComposite in="SourceGraphic" operator="in"/></filter></svg>`;
const vig = (k, from = 40) => `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 72% 72% at 50% 48%, rgba(0,0,0,0) ${from}%, rgba(0,0,0,${k}) 100%)"></div>`;
const topLight = (k = 0.14, y = -6) => `<div class="${AF}" style="pointer-events:none;mix-blend-mode:screen;background:radial-gradient(ellipse 62% 55% at 50% ${y}%, rgba(255,246,232,${k}) 0%, rgba(255,246,232,0) 72%)"></div>`;
const dust = (ctx, devName, n, seed) => {
  const r = lcg(seed); let h = '';
  for (let i = 0; i < n; i++) {
    const s = 1.2 + r() * 3.2, a = 0.07 + r() * 0.3, b = r() < 0.4 ? 0 : r() * 2.4;
    h += `<i data-x="${(r() * 1920).toFixed(0)}" data-y="${(r() * 1200).toFixed(0)}" data-v="${(0.25 + r() * 1.1).toFixed(3)}" data-ph="${(r() * 6.28).toFixed(2)}" style="position:absolute;left:0;top:0;width:${s.toFixed(1)}px;height:${s.toFixed(1)}px;border-radius:50%;background:rgba(232,228,220,${a.toFixed(2)});filter:blur(${b.toFixed(1)}px)"></i>`;
  }
  return `<div class="${AF} dust" ${ctx.dev(devName, { part: 'dust' })} style="pointer-events:none">${h}</div>`;
};

// ---------------------------------------------------------------- Warning2
export const Warning2 = {
  name: 'Warning2',
  html: (p, ctx) => {
    const tx = ctx.id('wtx');
    const word = (extra) => `<div style="position:absolute;left:0;right:0;top:404px;text-align:center;font:400 178px/1 ${ANT};letter-spacing:0.16em;padding-left:0.16em;${extra}">WARNING</div>`;
    const mono = (t, top, cls) => `<div class="${cls}" style="position:absolute;left:0;right:0;top:${top}px;text-align:center;font:500 40px/1 ${MONO};letter-spacing:0.14em;padding-left:0.14em;color:rgba(232,228,220,.9);text-shadow:0 2px 12px rgba(0,0,0,.8),0 1px 2px rgba(0,0,0,.95)">${t}</div>`;
    return `<div class="${AF}" style="background:#040404"></div>`
      + `<div class="${AF}" ${ctx.dev('Warning2', { part: 'bg' })} style="overflow:hidden"><img src="${DOOR}" style="position:absolute;left:-96px;top:-54px;width:2112px;height:1188px;transform-origin:56% 44%;filter:brightness(.36) contrast(1.12)"></div>`
      + topLight(0.07, 20) + vig(0.86, 26)
      + texDef(tx, 4, 2.6, 2.9, 0.62)
      + `<div class="${AF}" ${ctx.dev('Warning2', { part: 'tx' })}>`
      + `<div class="pool ${AF}" style="mix-blend-mode:screen;background:radial-gradient(ellipse 40% 24% at 50% 46%, rgba(158,31,28,.34) 0%, rgba(158,31,28,0) 72%);opacity:0"></div>`
      + `<i class="ru" style="position:absolute;left:560px;width:800px;top:382px;height:2px;background:linear-gradient(90deg,rgba(232,228,220,0),rgba(232,228,220,.62) 20%,rgba(232,228,220,.62) 80%,rgba(232,228,220,0));transform:scaleX(0)"></i>`
      + `<i class="ru" style="position:absolute;left:560px;width:800px;top:612px;height:2px;background:linear-gradient(90deg,rgba(232,228,220,0),rgba(232,228,220,.62) 20%,rgba(232,228,220,.62) 80%,rgba(232,228,220,0));transform:scaleX(0)"></i>`
      + `<div class="wd" style="position:absolute;inset:0;opacity:0">`
      + word(`color:#B3241F;filter:blur(22px);opacity:.6`)
      + word(`background:linear-gradient(180deg,#C8352C 0%,#9E1F1C 55%,#6E1512 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:url(#${tx})`)
      + `</div>`
      + mono('THIS VIDEO CONTAINS REAL FOOTAGE OF FINAL MOMENTS.', 648, 'ml') + mono('VIEWER DISCRETION IS ADVISED.', 708, 'ml')
      + `</div>` + grain(ctx, 0.085);
  },
  render: function (el, f, p, G, S) {
    var c = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    if (p.part === 'bg') {
      var u = c(f / S.len), k = -(Math.cos(Math.PI * u) - 1) / 2;
      el.firstChild.style.transform = 'translateX(' + (-14 * k).toFixed(2) + 'px) scale(' + (1 + 0.065 * k).toFixed(5) + ')';
      return;
    }
    // flicker-on (a failing lamp, no static): keys [f, level]
    var K = [[0, 0], [6, 0], [10, 0.55], [13, 0.06], [18, 0.82], [21, 0.22], [27, 1], [32, 0.62], [40, 1]], lv = 1;
    if (f < 40) { for (var i = 1; i < K.length; i++) if (f <= K[i][0]) { lv = K[i - 1][1] + (K[i][1] - K[i - 1][1]) * (f - K[i - 1][0]) / (K[i][0] - K[i - 1][0]); break; } }
    else lv = 0.95 + 0.05 * Math.cos(f / 23);
    var s = c((f - 6) / 42), es = 1 - Math.pow(1 - s, 3);
    var wd = el.querySelector('.wd'); wd.style.opacity = lv.toFixed(3);
    wd.style.transform = 'scale(' + (1.05 - 0.05 * es).toFixed(5) + ')'; wd.style.filter = 'blur(' + (3.5 * (1 - es)).toFixed(2) + 'px)';
    el.querySelector('.pool').style.opacity = (lv * (0.75 + 0.25 * es)).toFixed(3);
    var ru = el.querySelectorAll('.ru'), r = c((f - 14) / 42), er = r >= 1 ? 1 : 1 - Math.pow(2, -10 * r);
    for (var j = 0; j < ru.length; j++) ru[j].style.transform = 'scaleX(' + er.toFixed(4) + ')';
    var ml = el.querySelectorAll('.ml');
    for (var m = 0; m < ml.length; m++) { var a = c((f - 34 - m * 8) / 38), e = 1 - (1 - a) * (1 - a); ml[m].style.opacity = e.toFixed(3); ml[m].style.transform = 'translateY(' + (8 * (1 - e)).toFixed(2) + 'px)'; }
    var t = el.parentNode.querySelector('.gr2 feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 2) % 60));
  },
};

// ---------------------------------------------------------------- Descent / DescentReturn (shared markup)
const BAND0 = 210, PITCH = 150;
const deckHtml = (p, ctx, devName) => {
  const rows = p.rows || LEDGER, tex = ctx.id('dtx');
  let bands = '';
  for (let b = 0; b < 7; b++) {
    const r = lcg(31 + b * 7), depth = b / 6;
    const col = ['#ECE8E0', '#E2DED6', '#D6D2CA', '#CAC6BE', '#BDB9B1', '#B0ACA4', '#A39F98'][b];
    let ents = '';
    for (let j = 0; j < 3; j++) {
      const i = b * 3 + j; if (i >= rows.length) break;
      const cx = 330 + j * 630 + Math.round((r() - 0.5) * 30), fs = Math.min(52, Math.round(1000 / rows[i].length)), ty = 44 + Math.round((r() - 0.5) * 18), ls = (0.05 + depth * 0.03 * r()).toFixed(3);
      ents += `<div class="en" style="position:absolute;left:${cx - 315}px;width:630px;top:${ty}px;text-align:center;white-space:nowrap">`
        + `<span style="font:600 26px/1 ${MONO};color:#B22A24;letter-spacing:.06em;margin-right:12px;vertical-align:9px;text-shadow:0 0 10px rgba(158,31,28,.75)">${String(i + 1).padStart(2, '0')}</span>`
        + `<span class="nm" style="position:relative;display:inline-block;font:500 ${fs}px/1.1 ${OSW};letter-spacing:${ls}em;color:${col};text-shadow:0 0 16px rgba(232,228,220,.2),0 2px 3px rgba(0,0,0,.9)">${ctx.esc(rows[i])}`
        + `<s class="sw" style="position:absolute;left:0;top:0;right:0;bottom:0;text-decoration:none;background:linear-gradient(100deg,rgba(255,248,236,0) 42%,rgba(255,248,236,.95) 50%,rgba(255,248,236,0) 58%);background-size:300% 100%;background-position:120% 0;-webkit-background-clip:text;background-clip:text;color:transparent;opacity:0">${ctx.esc(rows[i])}</s>`
        + `<u class="sel" style="position:absolute;left:-6px;right:-6px;bottom:-12px;height:3px;background:#9E1F1C;box-shadow:0 0 12px rgba(158,31,28,.9),0 0 3px rgba(200,60,50,.8);transform:scaleX(0);transform-origin:0 50%"></u></span></div>`;
    }
    bands += `<div class="bd" style="position:absolute;left:0;right:0;top:${BAND0 + b * PITCH}px;height:${PITCH}px;filter:url(#${tex})">`
      + `<i style="position:absolute;left:0;right:0;top:2px;bottom:0;background:linear-gradient(180deg,rgba(18,18,20,.62) 0%,rgba(10,10,11,.3) 60%,rgba(10,10,11,0) 100%)"></i>`
      + `<i class="hl" style="position:absolute;left:110px;right:110px;top:0;height:3px;background:linear-gradient(90deg,rgba(232,228,220,0),rgba(232,228,220,.85) 16%,rgba(232,228,220,.85) 84%,rgba(232,228,220,0));box-shadow:0 0 14px rgba(232,228,220,.35)"></i>${ents}</div>`;
  }
  const head = `<div class="hd" style="position:absolute;left:0;right:0;top:56px;text-align:center;filter:url(#${tex})">`
    + `<div style="font:600 50px/1 ${OSW};letter-spacing:.44em;padding-left:.44em;color:#E2DED6;text-shadow:0 0 22px rgba(232,228,220,.25),0 2px 4px rgba(0,0,0,.85)">21 CASES</div>`
    + `<div style="margin-top:18px;font:500 18px/1 ${MONO};letter-spacing:.34em;padding-left:.34em;color:#9A968E">LAST KNOWN FOOTAGE &#183; IN ORDER OF DESCENT</div></div>`;
  return `<div class="${AF}" style="background:#030303"></div>${texDef(tex, 21, 2.9, 2.6, 0.8)}`
    + `<div class="${AF}" ${ctx.dev(devName, { part: 'all' })}>`
    + `<div class="${AF}" style="overflow:hidden"><img class="bgi" src="${STAIR}" style="position:absolute;left:-220px;top:-120px;width:2360px;height:1589px;transform-origin:57% 80%;filter:brightness(.6) contrast(1.18)"></div>`
    + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.05) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,.45) 68%,rgba(0,0,0,.82) 100%)"></div>`
    + `<div class="cam ${AF}" style="perspective:2000px;perspective-origin:960px 520px"><div class="dk" style="position:absolute;left:0;top:0;width:1920px;height:1300px;transform-origin:50% 0">${head}${bands}</div></div>`
    + `</div>` + dust(ctx, devName, 56, devName === 'Descent' ? 5 : 6) + topLight(0.15) + vig(0.8, 34) + grain(ctx, 0.075);
};
// camera state k (0 = top of the list, 1 = deep): deck transform + bg transform + focus band, written inline in both renders.

export const Descent = {
  name: 'Descent',
  html: (p, ctx) => deckHtml(p, ctx, 'Descent'),
  render: function (el, f, p, G, S) {
    var c = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, sio = function (u) { return -(Math.cos(Math.PI * u) - 1) / 2; };
    if (p.part === 'dust') {
      var d = el.children;
      for (var q = 0; q < d.length; q++) { var ds = d[q].dataset, y = ((+ds.y - (+ds.v) * (f + 60)) % 1200 + 1200) % 1200 - 60, x = +ds.x + 12 * Math.sin(f * 0.012 + (+ds.ph)); d[q].style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; }
      var t = el.parentNode.querySelector('.gr2 feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 2) % 60));
      return;
    }
    var L = S.len, k = sio(c(f / (L - 8)));
    var dk = el.querySelector('.dk'), bg = el.querySelector('.bgi');
    dk.style.transform = 'translateY(' + (150 - 520 * k).toFixed(2) + 'px) translateZ(' + (50 * k).toFixed(2) + 'px) rotateX(' + (-18 + 7 * k).toFixed(3) + 'deg)';
    bg.style.transform = 'translateY(' + (-250 * k).toFixed(2) + 'px) scale(' + (1.02 + 0.12 * k).toFixed(5) + ') rotate(' + (-4 * k).toFixed(3) + 'deg)';
    var fi = 6 * sio(c((f - 30) / (L - 70)));
    var hd = el.querySelector('.hd'), h = c(f / 40), eh = 1 - Math.pow(1 - h, 3);
    hd.style.opacity = (eh * (1 - 0.5 * c(fi / 2))).toFixed(3); hd.style.transform = 'translateY(' + (12 * (1 - eh)).toFixed(2) + 'px)';
    var bd = el.querySelectorAll('.bd');
    for (var b = 0; b < bd.length; b++) {
      var a = c((f - 12 - b * 9) / 42), e = 1 - Math.pow(1 - a, 3), dd = Math.abs(b - fi);
      var bl = Math.min(5.5, Math.max(0, dd - 0.6) * 1.4) + 8 * (1 - e);
      bd[b].style.opacity = (e * (1 - b * 0.06) * (1 - 0.3 * Math.min(1, dd / 3))).toFixed(3);
      bd[b].style.filter = bd[b].style.filter.replace(/ ?blur\([^)]*\)/, '') + ' blur(' + bl.toFixed(2) + 'px)';
      bd[b].querySelector('.hl').style.transform = 'scaleX(' + e.toFixed(4) + ')';
      var en = bd[b].querySelectorAll('.en');
      for (var j = 0; j < en.length; j++) { var a2 = c((f - 16 - b * 9 - j * 4) / 40), e2 = 1 - Math.pow(1 - a2, 3); en[j].style.opacity = e2.toFixed(3); en[j].style.transform = 'translateY(' + (16 * (1 - e2)).toFixed(2) + 'px)'; }
    }
  },
};

export const DescentReturn = {
  name: 'DescentReturn',
  html: (p, ctx) => deckHtml(p, ctx, 'DescentReturn'),
  render: function (el, f, p, G, S) {
    var c = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, sio = function (u) { return -(Math.cos(Math.PI * u) - 1) / 2; };
    var cio = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
    if (p.part === 'dust') {
      var d = el.children;
      for (var q = 0; q < d.length; q++) { var ds = d[q].dataset, y = ((+ds.y + (+ds.v) * 2.2 * f) % 1200 + 1200) % 1200 - 60, x = +ds.x + 12 * Math.sin(f * 0.012 + (+ds.ph)); d[q].style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; }
      var t = el.parentNode.querySelector('.gr2 feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 2) % 60));
      return;
    }
    var r = c(f / 72), er = r < 0.5 ? 16 * Math.pow(r, 5) : 1 - Math.pow(-2 * r + 2, 5) / 2, k = 1 - er, mb = 3.2 * Math.sin(Math.PI * r);
    var dk = el.querySelector('.dk'), bg = el.querySelector('.bgi'), cam = el.querySelector('.cam');
    dk.style.transform = 'translateY(' + (150 - 520 * k).toFixed(2) + 'px) translateZ(' + (50 * k).toFixed(2) + 'px) rotateX(' + (-18 + 7 * k).toFixed(3) + 'deg)';
    bg.style.transform = 'translateY(' + (-250 * k).toFixed(2) + 'px) scale(' + (1.02 + 0.12 * k).toFixed(5) + ') rotate(' + (-4 * k).toFixed(3) + 'deg)';
    var fi = 6 * k, s = c((f - 58) / 50), es = sio(s);
    el.querySelector('.hd').style.opacity = ((1 - 0.5 * c(fi / 2)) * (1 - es)).toFixed(3);
    var bd = el.querySelectorAll('.bd');
    for (var b = 0; b < bd.length; b++) {
      var dd = Math.abs(b - fi), bl = Math.min(5.5, dd * 1.2) + b * 0.12 + mb + (b > 0 ? 7 * es : 0);
      bd[b].style.opacity = ((1 - b * 0.06) * (1 - 0.3 * Math.min(1, dd / 3)) * (b > 0 ? 1 - 0.6 * es : 1)).toFixed(3);
      bd[b].style.filter = bd[b].style.filter.replace(/ ?blur\([^)]*\)/, '') + ' blur(' + bl.toFixed(2) + 'px)';
      if (b === 0) { var en = bd[0].querySelectorAll('.en'); for (var j = 1; j < en.length; j++) { en[j].style.filter = 'blur(' + (7 * es).toFixed(2) + 'px)'; en[j].style.opacity = (1 - 0.6 * es).toFixed(3); } }
    }
    // push into case 01 (target read from the DOM without the push, so it follows the 3-D projection exactly)
    var pq = c((f - 50) / 70), ep = cio(pq), nm = bd[0].querySelector('.nm');
    cam.style.transform = 'none';
    var r0 = el.getBoundingClientRect(), K = r0.width / 1920 || 1, rn = nm.getBoundingClientRect();
    var cx = (rn.left + rn.width / 2 - r0.left) / K, cy = (rn.top + rn.height / 2 - r0.top) / K;
    cam.style.transformOrigin = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
    cam.style.transform = 'translate(' + ((960 - cx) * ep).toFixed(2) + 'px,' + ((520 - cy) * ep).toFixed(2) + 'px) scale(' + (1 + 0.95 * ep).toFixed(5) + ')';
    var sl = c((f - 60) / 36);
    nm.querySelector('.sel').style.transform = 'scaleX(' + cio(sl).toFixed(4) + ')';
    var w = c((f - 68) / 48), sw = nm.querySelector('.sw');
    sw.style.opacity = (w > 0 && w < 1 ? 1 : 0); sw.style.backgroundPosition = (120 - 140 * sio(w)).toFixed(2) + '% 0';
    nm.style.color = es > 0 ? '#F6F2EA' : ''; nm.style.textShadow = '0 0 ' + (16 + 10 * es).toFixed(1) + 'px rgba(232,228,220,' + (0.2 + 0.2 * es).toFixed(3) + '),0 2px 3px rgba(0,0,0,.9)';
  },
};

// ---------------------------------------------------------------- CaseCard2
export const CaseCard2 = {
  name: 'CaseCard2',
  html: (p, ctx) => {
    const pl = p.plate, tx = ctx.id('ctx'), tn = ctx.id('ctn');
    const vid = ctx.node({ d: '_V', p: { src: pl.src, trim: pl.t, speed: pl.speed ?? 0.25, fit: 'cover' } }, ctx.win);
    const no = (extra) => `<div style="position:absolute;left:0;right:0;top:318px;text-align:center;font:400 214px/1 ${ANT};letter-spacing:0.07em;padding-left:0.07em;${extra}">CASE ${ctx.esc(p.no)}</div>`;
    const fill = `background:linear-gradient(180deg,#F4F0E8 0%,#DCD7CE 55%,#A9A49B 100%);-webkit-background-clip:text;background-clip:text;color:transparent`;
    const name = (p.name || []).map((l, i) => `<div style="position:absolute;left:0;right:0;top:${436 + i * 90}px;text-align:center;font:500 68px/1.1 ${OSW};letter-spacing:0.15em;padding-left:0.15em;${fill};filter:url(#${tn})">${ctx.esc(l)}</div>`
      + `<div style="position:absolute;left:0;right:0;top:${436 + i * 90}px;text-align:center;font:500 68px/1.1 ${OSW};letter-spacing:0.15em;padding-left:0.15em;color:rgba(232,228,220,.5);filter:blur(16px);z-index:-1">${ctx.esc(l)}</div>`).join('');
    return `<div class="${AF}" style="background:#040404"></div>${texDef(tx, 13, 2.7, 2.9, 0.55)}${texDef(tn, 17, 3.0, 3.0, 0.8)}`
      + `<div class="${AF}" ${ctx.dev('CaseCard2', { part: 'plate' })} style="overflow:hidden"><div class="${AF}" style="filter:blur(2.5px) brightness(.4) contrast(1.15) saturate(.12)">${vid}</div>`
      + `<img src="${STAIR}" style="position:absolute;left:-120px;top:-80px;width:2160px;height:1240px;object-fit:cover;mix-blend-mode:screen;opacity:.2;filter:brightness(.55) contrast(1.3) blur(1px)"></div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.45) 100%)"></div>`
      + topLight(0.12, 8) + vig(0.84, 30)
      + `<div class="${AF}" ${ctx.dev('CaseCard2', { part: 'no' })} style="opacity:0;transform-origin:960px 430px">`
      + `<div class="${AF}" style="mix-blend-mode:screen;background:radial-gradient(ellipse 30% 16% at 50% 62%, rgba(158,31,28,.28), rgba(158,31,28,0) 75%)"></div>`
      + no('color:rgba(232,228,220,.42);filter:blur(24px)') + no(`${fill};filter:url(#${tx})`) + `</div>`
      + `<div class="${AF}" ${ctx.dev('CaseCard2', { part: 'nm' })} style="opacity:0">`
      + `<div class="lb" style="position:absolute;left:0;right:0;top:372px;text-align:center;font:600 28px/1 ${MONO};letter-spacing:.3em;padding-left:.3em;color:rgba(232,228,220,.82);text-shadow:0 2px 10px rgba(0,0,0,.85),0 1px 2px rgba(0,0,0,.9)">CASE ${ctx.esc(p.no)}</div>`
      + `<div class="nmw ${AF}" style="isolation:isolate">${name}</div>`
      + `<i class="hr" style="position:absolute;left:700px;width:520px;top:${436 + (p.name || []).length * 90 + 18}px;height:2px;background:#9E1F1C;box-shadow:0 0 12px rgba(158,31,28,.9);transform:scaleX(0)"></i></div>`
      + grain(ctx, 0.07);
  },
  render: function (el, f, p, G, S) {
    var c = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; }, sio = function (u) { return -(Math.cos(Math.PI * u) - 1) / 2; };
    var eo = function (u) { return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); }, cio = function (u) { return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
    var z = c((f - 150) / 28), ez = z * z * z;
    if (p.part === 'plate') {
      var k = sio(c(f / S.len)), zz = cio(c((f - 146) / 40));
      el.style.transform = 'translate(' + (3 * Math.sin(f / 95)).toFixed(2) + 'px,' + (2 * Math.cos(f / 120)).toFixed(2) + 'px) scale(' + (1.03 + 0.07 * k + 0.07 * zz).toFixed(5) + ')';
      return;
    }
    if (p.part === 'no') {
      var a = c((f - 14) / 48), e = eo(a), hold = sio(c((f - 62) / 88));
      el.style.opacity = (e * (1 - z * z)).toFixed(3);
      el.style.transform = 'scale(' + ((1.1 - 0.1 * e + 0.035 * hold) * (1 + 3.4 * ez)).toFixed(5) + ')';
      el.style.filter = 'blur(' + (12 * (1 - e) + 26 * ez).toFixed(2) + 'px)';
      var ws = el.children; for (var w = 1; w < ws.length; w++) { ws[w].style.letterSpacing = (0.07 + 0.14 * (1 - e)).toFixed(4) + 'em'; ws[w].style.paddingLeft = ws[w].style.letterSpacing; }
      var t = el.parentNode.querySelector('.gr2 feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 3) % 40));
      return;
    }
    var n = c((f - 170) / 46), en = eo(n), nw = el.querySelector('.nmw');
    el.style.opacity = (n > 0 ? 1 : 0);
    nw.style.opacity = en.toFixed(3); nw.style.filter = 'blur(' + (10 * (1 - en)).toFixed(2) + 'px)'; nw.style.transform = 'translateY(' + (10 * (1 - en)).toFixed(2) + 'px) scale(' + (1.06 - 0.06 * en + 0.02 * sio(c((f - 216) / 100))).toFixed(5) + ')';
    nw.style.transformOrigin = '960px 500px';
    var lb = c((f - 182) / 38); el.querySelector('.lb').style.opacity = (1 - Math.pow(1 - lb, 3)).toFixed(3);
    el.querySelector('.hr').style.transform = 'scaleX(' + cio(c((f - 186) / 42)).toFixed(4) + ')';
  },
};

// ---------------------------------------------------------------- GlitchOut2 (v3, owner 2026-11-19: old glitch-out was invisible)
// Wrap a card: the last n frames (10 @60) = 12 uneven slices thrown sideways (up to +-320 px, some dropped = dark gaps, some
// stretched), brightness pop on glitch f0-1 and f5, vertical jump, 3 white luma tear bars, near-black last frame. Mono-ish, no
// colour split, no snow.
const GCUT = [0, 7, 16, 22, 33, 41, 48, 56, 67, 74, 85, 92, 100];
export const GlitchOut2 = {
  name: 'GlitchOut2',
  html: (p, ctx, node) => {
    const kids = ctx.kids(node), sl = [];
    const uq = (i) => kids.replace(/id="([^"]+)"/g, `id="$1_h${i}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_h${i})`);
    for (let i = 0; i < 12; i++) sl.push(`<div class="${AF}" style="display:none;clip-path:inset(${GCUT[i]}% 0 ${100 - GCUT[i + 1]}% 0)">${uq(i)}</div>`);
    const bars = [0, 1, 2].map(() => `<i style="position:absolute;left:-200px;width:2320px;top:0;height:10px;background:rgb(236,234,228);mix-blend-mode:screen;display:none"></i>`).join('');
    return `<div class="${AF}" style="background:#000"></div><div class="${AF}" ${ctx.dev('GlitchOut2', { n: p.n ?? 10, seed: p.seed || 'lmg2' })}><div class="${AF}">${kids}</div>${sl.join('')}${bars}<div class="${AF}" style="background:#000;opacity:0;pointer-events:none"></div></div>`;
  },
  render: function (el, f, p, G, S) {
    var g = f - (S.len - p.n), on = g >= 0, c = el.children, N = c.length - 5, st = Math.floor(g / 2);
    c[0].style.display = on ? 'none' : '';
    var pop = g < 2 ? 2.7 : g === 5 ? 2.1 : g >= p.n - 2 ? 0.7 : 1.35;
    el.style.filter = on ? 'saturate(.35) contrast(1.25) brightness(' + pop + ')' : '';
    el.style.transform = on ? 'translateY(' + ((G.random(p.seed + 'y' + st) - 0.5) * 44).toFixed(1) + 'px)' : '';
    var amp = 0.45 + 0.55 * Math.sin(Math.PI * (g + 1) / (p.n + 1));
    for (var i = 1; i <= N; i++) {
      var s = c[i];
      if (!on) { s.style.display = 'none'; continue; }
      var r = G.random(p.seed + i + '_' + st), r2 = G.random(p.seed + 'k' + i + '_' + st);
      s.style.display = r2 < 0.13 ? 'none' : '';
      var d = (r - 0.5) * 640 * amp * (r2 > 0.8 ? 0.12 : 1);
      s.style.transform = 'translateX(' + d.toFixed(1) + 'px)' + (r2 > 0.62 && r2 < 0.8 ? ' scaleX(1.3)' : '');
    }
    for (var b = 0; b < 3; b++) {
      var t = c[N + 1 + b], q = G.random(p.seed + 'b' + b + '_' + g);
      t.style.display = on && q < 0.75 ? '' : 'none';
      if (on) { t.style.top = (G.random(p.seed + 't' + b + '_' + g) * 1050).toFixed(0) + 'px'; t.style.height = (3 + 38 * G.random(p.seed + 'h' + b + '_' + g)).toFixed(0) + 'px'; t.style.opacity = (0.22 + 0.5 * q).toFixed(2); }
    }
    c[c.length - 1].style.opacity = !on ? 0 : g === p.n - 1 ? 0.72 : g === 3 ? 0.4 : 0;
  },
};

// ---------------------------------------------------------------- TitleType (v3, owner 2026-11-19: ONE title screen)
// {a:'CASE 1', b:'THE ...', plate:{src,t,speed}, fa=24, fb=62, rate=0.3}  photographic plate (as CaseCard2) + "CASE 1" and BELOW it
// the case title, both typed on in steps (rate chars/frame @60 = 0.6 char/frame @30) in VCR OSD Mono with a block cursor; red
// hairline after the last char. No fly-through. Char k of b lands at frame fb + ceil((k+1)/rate) (key ticks in the case file).
export const TitleType = {
  name: 'TitleType',
  html: (p, ctx) => {
    const pl = p.plate, VCR = "'VCR OSD Mono',monospace", a = p.a || 'CASE 1', b = p.b || '';
    const vid = ctx.node({ d: '_V', p: { src: pl.src, trim: pl.t, speed: pl.speed ?? 0.25, fit: 'cover' } }, ctx.win);
    const line = (top, fs, ls) => `<div class="tl" style="position:absolute;left:0;right:0;top:${top}px;text-align:center;white-space:pre;font:400 ${fs}px/1 ${VCR};letter-spacing:${ls}em;color:#ECE8E0;text-shadow:0 0 20px rgba(232,228,220,.3),0 2px 4px rgba(0,0,0,.9)"><span class="ty"></span><span style="position:relative;display:inline-block;width:0;height:1em"><i class="cu" style="position:absolute;left:.03em;bottom:.06em;width:.5em;height:.78em;background:#ECE8E0;box-shadow:0 0 16px rgba(232,228,220,.5);display:none"></i></span><span class="re" style="visibility:hidden"></span></div>`;
    return `<div class="${AF}" style="background:#040404"></div>`
      + `<div class="${AF}" ${ctx.dev('TitleType', { part: 'plate' })} style="overflow:hidden"><div class="${AF}" style="filter:blur(2.5px) brightness(.4) contrast(1.15) saturate(.12)">${vid}</div>`
      + `<img src="${STAIR}" style="position:absolute;left:-120px;top:-80px;width:2160px;height:1240px;object-fit:cover;mix-blend-mode:screen;opacity:.2;filter:brightness(.55) contrast(1.3) blur(1px)"></div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.45) 100%)"></div>`
      + topLight(0.12, 8) + vig(0.84, 30)
      + `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 52% 26% at 50% 49%, rgba(0,0,0,.5), rgba(0,0,0,0) 78%)"></div>`
      + `<div class="${AF}" ${ctx.dev('TitleType', { part: 'tx', a, b, fa: p.fa ?? 24, fb: p.fb ?? 62, rate: p.rate ?? 0.3 })}>`
      + line(360, 156, 0.08) + line(562, 64, 0.05)
      + `<i class="hr" style="position:absolute;left:660px;width:600px;top:668px;height:2px;background:#9E1F1C;box-shadow:0 0 12px rgba(158,31,28,.9);transform:scaleX(0)"></i></div>`
      + grain(ctx, 0.07);
  },
  render: function (el, f, p, G, S) {
    var c = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    if (p.part === 'plate') {
      var k = -(Math.cos(Math.PI * c(f / S.len)) - 1) / 2;
      el.style.transform = 'translate(' + (3 * Math.sin(f / 95)).toFixed(2) + 'px,' + (2 * Math.cos(f / 120)).toFixed(2) + 'px) scale(' + (1.03 + 0.07 * k).toFixed(5) + ')';
      var t = el.parentNode.querySelector('.gr2 feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 3) % 40));
      return;
    }
    var L = el.querySelectorAll('.tl'), T = [p.a, p.b], F0 = [p.fa, p.fb], blink = Math.floor(f / 18) % 2 === 0, done = 0;
    for (var i = 0; i < 2; i++) {
      var n = Math.max(0, Math.min(T[i].length, Math.floor((f - F0[i]) * p.rate)));
      L[i].querySelector('.ty').textContent = T[i].slice(0, n); L[i].querySelector('.re').textContent = T[i].slice(n);
      var typing = n > 0 && n < T[i].length, mine = i === 0 ? f >= 6 && f < p.fb - 6 : f >= p.fb - 6;
      L[i].querySelector('.cu').style.display = mine && (typing || blink) ? '' : 'none';
      if (i === 1 && n >= T[i].length) done = F0[i] + Math.ceil(T[i].length / p.rate);
    }
    var h = done ? c((f - done - 6) / 40) : 0;
    el.querySelector('.hr').style.transform = 'scaleX(' + (h < 0.5 ? 4 * h * h * h : 1 - Math.pow(-2 * h + 2, 3) / 2).toFixed(4) + ')';
  },
};

export default [Warning2, Descent, DescentReturn, CaseCard2, GlitchOut2, TitleType];
