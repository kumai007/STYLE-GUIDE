// lm.mjs - "last moment footage" channel devices (new channel look, 2026-11-18). 60 fps: every frame number here is @60
// (= SUMMARY latest5 (c) recipes @30 x 2). Palette: bg #0B0B0C, panel #1A1A1C, text #E8E4DC, dim #9A968E, red #9E1F1C,
// amber #E3A21A. Fonts: Anton (case no.), Oswald (names, ledger), Bebas Neue (name tag), IBM Plex Mono 500/600/700 (small
// text), Source Serif 4 (page quotes). Banned: cyan, typewriter, berg, VHS/tape/stamps, PRESENTS. Use with CASE.plain = true.
// API (p = props; f = shot-local frame; len = shot length in frames; source boxes in SOURCE px; times in s unless "f"):
//  Grade {sat=.55,con=1.12,bri=.96,vig=.62,grain=.06,mono}  wrapper (c20): grade on kids + vignette + static grain. mono = sat 0.
//  LClip {src,t,speed=1,sw,sh,W=1920,H=1080,fit='cover',pos,scale=1,origin,push=[1,1.04],fill,from=0,mos}  footage; video
//        starts at shot frame `from` with source time t; slow eased push; fill = blurred cover copy behind (4:3 / contain);
//        mos = [{r:[x,y,w,h]} | {keys:[[srcT,x,y,w,h],...]}] -> Mosaic on a duplicate video (24 px blocks, c15).
//  Vertical {src,t,speed,sw,sh,fw=1080,fh=1080,mos}  c17: fg fw x fh centred + same clip blurred (40) behind.
//  Split2 {} wrapper on #0B0B0C; Panel {keys:[[f,x,w],...], clip:{LClip props, W=960}}  conveyor panel: x/width keyed,
//        moves between key pairs sym-eased (bezier .42,0,.58,1); hidden outside [first key, last key].
//  Warning {}  c1 card (animated grain, WARNING / VIEWER DISCRETION IS ADVISED), in 36 f power2.out.
//  GlitchCut {n=6,seed}  wrapper (intro/shock only): last n f = 8 slice copies offset 16-40 px, sat 0, bright 1.2. Static kids only.
//  Dip {inN=0,outN=0}  overlay: black 1->0 over the first inN f, 0->1 over the last outN f (sine.inOut). Std = 16 down / 14 up.
//  Ledger {rows=LEDGER, ret}  c3 3x7 case grid, zoom 1.00->1.08, rows stagger 6 f; ret: 14 f in, 48 f zoom to row 01 (1.6),
//        amber band 36 f, other rows dim.
//  CaseCard {no:'01', name:[l1,l2], plate:{src,t,speed,sw,sh}}  c4+c5: blurred plate, CASE NN f14-62, hairline f62-98, name f98-134.
//  Credit {text, at=12, hold=240, place='tr'|'br'|'bl'|'tl'}  c11 28 px "FOOTAGE: ...".  TypedDate {text, at=0} c8.  PlaceTag {text, at=0} c9.
//  NameTag {text, at=0, x=960} c10.  Page {img, iw, ih, bands:[[x,y,w,h,f0]]} c13 flat page, amber marker bands.
//  RedCircle {cx,cy,rx,ry,at=0} c18.  Spotlight {cx,cy,r=260,at=0,hold=165} c16.  Subs {lines:[[f0,f1,text,spk]]} c2 (raw speech).
const AF = 'af';
const C = { bg: '#0B0B0C', panel: '#1A1A1C', tx: '#E8E4DC', dim: '#9A968E', red: '#9E1F1C', amb: '#E3A21A' };
const MONO = "'IBM Plex Mono',monospace", OSW = "'Oswald',sans-serif";
export const LEDGER = ['THE CODEBREAKER', 'THE BLUE HOLE CAMERA', 'THE LAST MEET-AND-GREET', 'THE ROPE ON SUDIRMAN', 'THE PORCH FROM THE AIR',
  'THE LAST SIGN-OFF', "THE BOOTH AT WOODY'S", 'THE LAPLAND VIDEO', 'THE RADISSON LOBBY', 'THE STREETLIGHT', 'THE LAST RIDE VIDEO',
  'THE FUEL STOP', 'THE LAST UPLOAD', 'THE MALL DOOR', 'THE LIVESTREAM WALK', 'THE LAST CLIMB', 'THE STATION DESK',
  'THE FINNISH UPLOAD', 'OUTSIDE THE CIRCLE A', 'THE WORLD RUNNERS', 'THE SNAPCHAT'];
const grainSvg = (id, seed, k, freq = 0.85) => `<svg class="${AF}" width="1920" height="1080" style="pointer-events:none;mix-blend-mode:overlay;opacity:${k * 2}"><filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${id})"/></svg>`;
const vig = (k, from = 52) => `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) ${from}%, rgba(0,0,0,${k}) 100%)"></div>`;
// source px -> element px for object-fit cover/contain in a W x H box
const fitMap = (W, H, sw, sh, fit = 'cover', pos = '50% 50%') => {
  const s = fit === 'contain' ? Math.min(W / sw, H / sh) : Math.max(W / sw, H / sh);
  const [px, py] = pos.split(' ').map((v) => parseFloat(v) / 100);
  return { s, ox: (W - sw * s) * px, oy: (H - sh * s) * py };
};

export const Grade = {
  name: 'Grade',
  html: (p, ctx, node) => {
    const sat = p.mono ? 0 : p.sat ?? 0.55;
    return `<div class="${AF}" style="filter:saturate(${sat}) contrast(${p.con ?? 1.12}) brightness(${p.bri ?? 0.96})">${ctx.kids(node)}</div>${vig(p.vig ?? 0.62)}${grainSvg(ctx.id('gr'), (uidSeed(ctx) % 97) + 1, p.grain ?? 0.06)}`;
  },
};
const uidSeed = (ctx) => +ctx.id('s').slice(1);

/** Mosaic: duplicate video (same timing/fit) pixelated by an SVG filter, clipped to tracked boxes (clip-path path()). */
const mosaicHtml = (ctx, v, W, H, sw, sh, fit, pos, mos, from) => {
  const m = fitMap(W, H, sw, sh, fit, pos), speed = v.speed || 1;
  const fr = (T) => Math.round(from + ((T - v.t) / speed) * 60); // source time -> shot-local frame
  const boxes = mos.map((b) => (b.r ? [[0, ...b.r]] : b.keys.map(([T, ...r]) => [fr(T), ...r])).map(([f, x, y, w, h]) => [f, +(m.ox + x * m.s).toFixed(1), +(m.oy + y * m.s).toFixed(1), +(w * m.s).toFixed(1), +(h * m.s).toFixed(1)]));
  const fid = ctx.id('px');
  return `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feFlood x="11" y="11" width="2" height="2"/><feComposite width="24" height="24"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="12"/></filter></svg>`
    + `<div class="${AF}" ${ctx.dev('Mosaic', { boxes })} style="clip-path:path('M0 0Z')">${ctx.video({ ...v, fit, pos, style: `filter:url(#${fid})` })}</div>`;
};
export const Mosaic = {
  name: 'Mosaic',
  html: () => '',
  render: function (el, f, p) {
    var d = '';
    for (var i = 0; i < p.boxes.length; i++) {
      var k = p.boxes[i], a = k[0], b = k[0];
      for (var j = 0; j < k.length; j++) { if (k[j][0] <= f) a = k[j]; if (k[j][0] >= f) { b = k[j]; break; } b = k[j]; }
      var u = b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 0, r = [];
      for (var q = 1; q < 5; q++) r.push(a[q] + (b[q] - a[q]) * Math.max(0, Math.min(1, u)));
      d += 'M' + r[0] + ' ' + r[1] + 'h' + r[2] + 'v' + r[3] + 'h' + -r[2] + 'Z';
    }
    el.style.clipPath = "path('" + d + "')";
  },
};

export const LClip = {
  name: 'LClip',
  html: (p, ctx) => {
    const { W = 1920, H = 1080, fit = 'cover', pos = '50% 50%', from = 0, speed = 1 } = p;
    const win = [from, p.until ?? ctx.win[1]];
    const v = { src: p.src, trim: p.t - (from / 60) * speed, speed, t: p.t };
    const c2 = { ...ctx, video: (o) => makeVid(ctx, o, win) };
    const fill = p.fill ? `<div class="${AF}" style="filter:blur(40px) brightness(0.35) saturate(0.5);transform:scale(1.15)">${makeVid(ctx, { ...v, fit: 'cover' }, win)}</div>` : '';
    const main = makeVid(ctx, { ...v, fit, pos }, win);
    const mos = p.mos?.length ? mosaicHtml(c2, v, W, H, p.sw, p.sh, fit, pos, p.mos, from) : '';
    return `${fill}<div class="${AF}" ${ctx.dev('LClip', { s: p.scale ?? 1, push: p.push ?? [1, 1.04], from, until: win[1] })} style="transform-origin:${p.origin || '50% 50%'}">${main}${mos}</div>`;
  },
  render: function (el, f, p, G, S) {
    var e = p.until || S.len, u = Math.max(0, Math.min(1, (f - p.from) / Math.max(1, e - p.from)));
    var k = -(Math.cos(Math.PI * u) - 1) / 2;
    el.style.transform = 'scale(' + (p.s * (p.push[0] + (p.push[1] - p.push[0]) * k)).toFixed(5) + ')';
  },
};
// video for window [w0,w1) of the shot with Remotion-style trim (= source time at shot frame 0)
const makeVid = (ctx, o, win) => ctx.node({ d: '_V', p: o }, win);
export const _V = { name: '_V', html: (p, ctx) => ctx.video({ src: p.src, trim: p.trim, speed: p.speed, fit: p.fit, pos: p.pos, style: p.style }) };

export const Vertical = {
  name: 'Vertical',
  html: (p, ctx) => {
    const fw = p.fw ?? 1080, fh = p.fh ?? 1080, speed = p.speed ?? 1;
    const v = { src: p.src, trim: p.t, speed, t: p.t };
    const bg = `<div class="${AF}" style="filter:blur(40px) brightness(0.35) saturate(0.5);transform:scale(1.2)">${makeVid(ctx, { ...v, fit: 'cover' }, ctx.win)}</div>`;
    const mos = p.mos?.length ? mosaicHtml(ctx, v, fw, fh, p.sw, p.sh, 'cover', '50% 50%', p.mos, 0) : '';
    return `${bg}<div ${ctx.dev('LClip', { s: 1, push: [1, 1.03], from: 0 })} style="position:absolute;left:${(1920 - fw) / 2}px;top:${(1080 - fh) / 2}px;width:${fw}px;height:${fh}px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.6)">${makeVid(ctx, { ...v, fit: 'cover' }, ctx.win)}${mos}</div>`;
  },
};

export const Split2 = { name: 'Split2', html: (p, ctx, node) => `<div class="${AF}" style="background:${C.bg}">${ctx.kids(node)}</div>` };
export const Panel = {
  name: 'Panel',
  html: (p, ctx) => {
    const k = p.keys, from = k[0][0], until = k[k.length - 1][0];
    return `<div ${ctx.dev('Panel', { keys: k })} style="position:absolute;top:0;height:1080px;left:${k[0][1]}px;width:${k[0][2]}px;overflow:hidden;border-left:4px solid ${C.bg};border-right:4px solid ${C.bg}">${LClip.html({ W: 952, ...p.clip, from, until }, ctx)}</div>`;
  },
  render: function (el, f, p) {
    var k = p.keys, on = f >= k[0][0] && f < k[k.length - 1][0];
    el.style.display = on ? '' : 'none';
    if (!on) return;
    var a = k[0], b = k[0];
    for (var i = 0; i < k.length; i++) { if (k[i][0] <= f) a = k[i]; if (k[i][0] > f) { b = k[i]; break; } b = k[i]; }
    var u = b[0] > a[0] ? (f - a[0]) / (b[0] - a[0]) : 0, e = 3 * u * u - 2 * u * u * u; // symmetric ease (smoothstep ~ bezier .42,0,.58,1)
    el.style.left = (a[1] + (b[1] - a[1]) * e).toFixed(2) + 'px';
    el.style.width = (a[2] + (b[2] - a[2]) * e).toFixed(2) + 'px';
  },
};

export const Warning = {
  name: 'Warning',
  html: (p, ctx) => {
    const t = (txt, size, w, ls, col, base) => `<div style="position:absolute;left:0;right:0;top:${base - Math.round(size * 0.86)}px;font:${w} ${size}px/1 ${MONO};letter-spacing:${ls}em;padding-left:${ls}em;text-align:center;color:${col}">${txt}</div>`;
    return `<div class="${AF}" style="background:radial-gradient(ellipse 70% 70% at 50% 50%, ${C.panel} 0%, ${C.bg} 75%)"></div>${vig(0.6, 40)}`
      + `<div class="${AF}" ${ctx.dev('Warning', {})}>${t('WARNING', 76, 700, 0.24, C.red, 491)}${t('VIEWER DISCRETION IS ADVISED', 72, 600, 0.12, C.tx, 602)}</div>${grainSvg(ctx.id('wg'), 3, 0.08)}`;
  },
  render: function (el, f) {
    var u = Math.max(0, Math.min(1, f / 36)), e = 1 - (1 - u) * (1 - u);
    el.style.opacity = e; el.style.filter = 'blur(' + (6 * (1 - e)).toFixed(2) + 'px)';
    var t = el.parentNode.querySelector('feTurbulence'); if (t) t.setAttribute('seed', 1 + (Math.floor(f / 2) % 50));
  },
};

export const GlitchCut = {
  name: 'GlitchCut',
  html: (p, ctx, node) => {
    const kids = ctx.kids(node), sl = [];
    // each slice copy gets its own element/filter ids (duplicate SVG filter ids made the grain drop out on the glitch frames)
    const uq = (i) => kids.replace(/id="([^"]+)"/g, `id="$1_g${i}"`).replace(/url\(#([^)]+)\)/g, `url(#$1_g${i})`);
    for (let i = 0; i < 8; i++) sl.push(`<div class="${AF}" style="display:none;clip-path:inset(${(i * 12.5).toFixed(2)}% 0 ${(100 - (i + 1) * 12.5).toFixed(2)}% 0)">${uq(i)}</div>`);
    return `<div class="${AF}" ${ctx.dev('GlitchCut', { n: p.n ?? 6, seed: p.seed || 'lmg' })}><div class="${AF}">${kids}</div>${sl.join('')}</div>`;
  },
  render: function (el, f, p, G, S) {
    var on = f >= S.len - p.n, c = el.children;
    c[0].style.display = on ? 'none' : '';
    el.style.filter = on ? 'saturate(0) brightness(1.2)' : '';
    for (var i = 1; i < c.length; i++) {
      c[i].style.display = on ? '' : 'none';
      if (on) { var r = G.random(p.seed + i + '_' + Math.floor(f / 2)), d = (16 + 24 * r) * (G.random(p.seed + 'd' + i + f) < 0.5 ? -1 : 1); c[i].style.transform = 'translateX(' + d.toFixed(1) + 'px)'; }
    }
  },
};

export const Dip = {
  name: 'Dip',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Dip', { i: p.inN || 0, o: p.outN || 0 })} style="background:#000;opacity:0;pointer-events:none"></div>`,
  render: function (el, f, p, G, S) {
    var a = p.i ? 1 - Math.min(1, f / p.i) : 0, b = p.o ? Math.max(0, Math.min(1, (f - (S.len - p.o)) / p.o)) : 0, x = Math.max(a, b);
    el.style.opacity = (-(Math.cos(Math.PI * x) - 1) / 2).toFixed(4);
  },
};

const hex = (a, b, u) => '#' + [0, 2, 4].map((i) => Math.round(parseInt(a.substr(1 + i, 2), 16) * (1 - u) + parseInt(b.substr(1 + i, 2), 16) * u).toString(16).padStart(2, '0')).join('');
export const Ledger = {
  name: 'Ledger',
  html: (p, ctx) => {
    const rows = (p.rows || LEDGER).map((nm, i) => {
      const x = 160 + Math.floor(i / 7) * 570, y = 260 + (i % 7) * 100, col = hex(C.tx, '#B8B3AA', i / 20);
      return `<div class="lr" style="position:absolute;left:${x}px;top:${y}px;width:520px;height:72px;display:flex;align-items:baseline;gap:22px;border-bottom:1px solid #2A2A2C;padding-top:14px">`
        + `<span class="no" style="font:600 30px/1 ${MONO};color:${C.red}">${String(i + 1).padStart(2, '0')}</span>`
        + `<span class="nm" style="position:relative;font:500 34px/1 ${OSW};letter-spacing:0.04em;color:${col};white-space:nowrap"><i style="position:absolute;left:-10px;right:-10px;top:-8px;bottom:-8px;background:${C.amb};transform:scaleX(0);transform-origin:0 50%;display:block"></i><b style="position:relative;font-weight:500">${ctx.esc(nm)}</b></span></div>`;
    }).join('');
    return `<div class="${AF}" style="background:radial-gradient(ellipse 80% 80% at 50% 45%, ${C.panel} 0%, ${C.bg} 70%)"></div>`
      + `<div class="${AF}" ${ctx.dev('Ledger', { ret: !!p.ret })} style="transform-origin:${p.ret ? '420px 296px' : '960px 540px'}">`
      + `<div style="position:absolute;left:0;right:0;top:112px;text-align:center;font:600 44px/1 ${OSW};letter-spacing:0.3em;padding-left:0.3em;color:${C.dim}">21 CASES</div>${rows}</div>${vig(0.55)}${grainSvg(ctx.id('lg'), 7, 0.05)}`;
  },
  render: function (el, f, p, G, S) {
    var rows = el.querySelectorAll('.lr'), c = function (x) { return Math.max(0, Math.min(1, x)); };
    if (!p.ret) {
      var u = c(f / S.len), k = -(Math.cos(Math.PI * u) - 1) / 2;
      el.style.transform = 'scale(' + (1 + 0.08 * k).toFixed(5) + ')';
      for (var i = 0; i < rows.length; i++) { var r = c((f - 12 - i * 6) / 36), e = 1 - (1 - r) * (1 - r); rows[i].style.opacity = e; rows[i].style.transform = 'translateY(' + (10 * (1 - e)).toFixed(2) + 'px)'; }
      return;
    }
    var z = c((f - 14) / 48), e3 = z < 0.5 ? 4 * z * z * z : 1 - Math.pow(-2 * z + 2, 3) / 2;
    el.style.transform = 'translate(' + (540 * e3).toFixed(2) + 'px,' + (244 * e3).toFixed(2) + 'px) scale(' + (1.08 + 0.52 * e3).toFixed(5) + ')';
    for (var j = 1; j < rows.length; j++) rows[j].style.opacity = (1 - 0.65 * e3).toFixed(3);
    var b = c((f - 62) / 36), eb = -(Math.cos(Math.PI * b) - 1) / 2, band = rows[0].querySelector('i');
    band.style.transform = 'scaleX(' + eb.toFixed(4) + ')';
    rows[0].querySelector('b').style.color = eb > 0.55 ? '#0B0B0C' : '';
  },
};

export const CaseCard = {
  name: 'CaseCard',
  html: (p, ctx) => {
    const pl = p.plate, v = { src: pl.src, trim: pl.t, speed: pl.speed ?? 0.25 };
    const name = (p.name || []).map((l, i) => `<div style="position:absolute;left:0;right:0;top:${610 - 62 + i * 92}px;text-align:center;font:500 72px/1 ${OSW};letter-spacing:0.14em;padding-left:0.14em;color:${C.tx};text-shadow:0 3px 14px rgba(0,0,0,.6)">${ctx.esc(l)}</div>`).join('');
    return `<div class="${AF}" style="background:${C.bg}"></div><div class="${AF}" ${ctx.dev('CaseCard', { part: 'plate' })} style="filter:blur(18px) brightness(0.32) saturate(0.3)">${makeVid(ctx, { ...v, fit: 'cover' }, ctx.win)}</div>${vig(0.65, 40)}`
      + `<div class="${AF}" ${ctx.dev('CaseCard', { part: 'no' })} style="opacity:0"><div style="position:absolute;left:0;right:0;top:${420 - 104}px;text-align:center;font:400 200px/1 'Anton',sans-serif;letter-spacing:0.08em;padding-left:0.08em;color:${C.tx};text-shadow:0 4px 18px rgba(0,0,0,.6)">CASE ${ctx.esc(p.no)}</div></div>`
      + `<div ${ctx.dev('CaseCard', { part: 'rule' })} style="position:absolute;left:750px;top:519px;width:420px;height:2px;background:${C.red};transform:scaleX(0)"></div>`
      + `<div class="${AF}" ${ctx.dev('CaseCard', { part: 'name' })} style="clip-path:inset(0 100% 0 0)">${name}</div>${grainSvg(ctx.id('cg'), 11, 0.06)}`;
  },
  render: function (el, f, p, G, S) {
    var c = function (x) { return Math.max(0, Math.min(1, x)); };
    if (p.part === 'plate') { var u = c(f / S.len), k = -(Math.cos(Math.PI * u) - 1) / 2; el.style.transform = 'translate(' + (2 * Math.sin(f / 60 * Math.PI)).toFixed(2) + 'px,' + (2 * Math.cos(f / 60 * Math.PI * 0.8)).toFixed(2) + 'px) scale(' + (1 + 0.04 * k).toFixed(5) + ')'; return; }
    if (p.part === 'no') { var a = c((f - 14) / 48), e = 1 - (1 - a) * (1 - a), t = el.firstChild; el.style.opacity = e; t.style.transform = 'translateY(' + (14 * (1 - e)).toFixed(2) + 'px)'; t.style.letterSpacing = (0.08 + 0.12 * (1 - e)).toFixed(4) + 'em'; t.style.paddingLeft = t.style.letterSpacing; return; }
    if (p.part === 'rule') { var r = c((f - 62) / 36), e3 = r < 0.5 ? 4 * r * r * r : 1 - Math.pow(-2 * r + 2, 3) / 2; el.style.transform = 'scaleX(' + e3.toFixed(4) + ')'; return; }
    var n = c((f - 98) / 36), en = 1 - (1 - n) * (1 - n);
    el.style.clipPath = 'inset(0 ' + (100 * (1 - en)).toFixed(2) + '% 0 0)'; el.style.filter = 'blur(' + (6 * (1 - en)).toFixed(2) + 'px)';
  },
};

// in/hold/out text devices: render p = {at, i (in f), h (hold f), o (out f)} -> opacity / wipe progress
const ioRender = function (el, f, p) {
  var c = function (x) { return Math.max(0, Math.min(1, x)); }, a = c((f - p.at) / p.i), e = 1 - (1 - a) * (1 - a), b = c((f - p.at - p.i - p.h) / p.o);
  var v = e * (1 - b * b); el.style.opacity = v.toFixed(4);
  if (p.wipe) el.style.clipPath = 'inset(0 ' + (100 * (1 - e)).toFixed(2) + '% 0 0)';
  if (p.dy) el.style.transform = 'translateY(' + (p.dy * (1 - e)).toFixed(2) + 'px)';
};
export const Credit = {
  name: 'Credit',
  // place: 'tr' (default, right 96 / top 50) | 'br' (bottom-right, clear of burned-in top CCTV stamps) | 'bl' | 'tl'
  html: (p, ctx) => `<div ${ctx.dev('Credit', { at: p.at ?? 12, i: 36, h: p.hold ?? 240, o: 30 })} style="position:absolute;${({ tr: 'right:96px;top:50px', br: 'right:96px;bottom:52px', bl: 'left:96px;bottom:52px', tl: 'left:96px;top:50px' })[p.place || 'tr']};font:500 28px/1 ${MONO};letter-spacing:0.12em;text-transform:uppercase;color:${C.tx};opacity:0;padding:7px 12px 6px;background:rgba(11,11,12,.55);text-shadow:0 1px 4px rgba(0,0,0,.8)">${ctx.esc(p.text)}</div>`,
  render: ioRender,
};
export const PlaceTag = {
  name: 'PlaceTag',
  html: (p, ctx) => `<div ${ctx.dev('PlaceTag', { at: p.at ?? 0, i: 36, h: 132, o: 36, wipe: 1 })} style="position:absolute;left:88px;top:966px;height:60px;padding:0 36px 0 52px;background:rgba(11,11,12,.62);display:flex;align-items:center;opacity:0"><i style="position:absolute;left:16px;top:15px;width:22px;height:30px;background:${C.red};clip-path:polygon(50% 100%,0 40%,0 25%,25% 0,75% 0,100% 25%,100% 40%)"></i><span style="font:600 56px/1 ${OSW};color:${C.tx};text-transform:uppercase">${ctx.esc(p.text)}</span></div>`,
  render: ioRender,
};
export const NameTag = {
  name: 'NameTag',
  html: (p, ctx) => `<div ${ctx.dev('NameTag', { at: p.at ?? 0, i: 48, h: 180, o: 30, wipe: 1 })} style="position:absolute;left:${p.x ?? 960}px;top:900px;height:140px;transform:translateX(-50%);padding:0 80px;background:rgba(11,11,12,.92);clip-path:polygon(1% 4%,99% 0,100% 96%,0 100%);display:flex;align-items:center;opacity:0"><span style="font:400 92px/1 'Bebas Neue',sans-serif;letter-spacing:0.04em;color:${C.tx};white-space:nowrap">${ctx.esc(p.text)}</span></div>`,
  render: function (el, f, p) {
    var c = function (x) { return Math.max(0, Math.min(1, x)); }, a = c((f - p.at) / p.i), e = 1 - (1 - a) * (1 - a), b = c((f - p.at - p.i - p.h) / p.o);
    el.style.opacity = (a > 0 ? 1 - b : 0).toFixed(3); el.style.clipPath = 'polygon(1% 4%,' + (1 + 98 * e).toFixed(2) + '% 0,' + (1 + 99 * e).toFixed(2) + '% 96%,0 100%)';
  },
};
export const TypedDate = {
  name: 'TypedDate',
  html: (p, ctx) => `<div ${ctx.dev('TypedDate', { at: p.at ?? 0, text: String(p.text).toUpperCase() })} style="position:absolute;left:100px;top:72px;font:500 56px/1 ${MONO};letter-spacing:0.08em;color:${C.tx};text-shadow:0 2px 6px rgba(0,0,0,.7);white-space:pre"><span></span><i style="display:inline-block;width:24px;height:44px;background:${C.red};vertical-align:-4px;margin-left:6px"></i></div>`,
  render: function (el, f, p) {
    var g = f - p.at, n = Math.max(0, Math.min(p.text.length, Math.floor(g * 0.3))), tEnd = p.text.length / 0.3 + 120;
    el.firstChild.textContent = g < 0 ? '' : p.text.slice(0, n);
    el.lastChild.style.opacity = g < 0 ? 0 : Math.floor(g / 30) % 2 ? 0 : 1;
    var o = Math.max(0, Math.min(1, (g - tEnd) / 36)); el.style.opacity = (1 - o * o).toFixed(3);
  },
};
export const Page = {
  name: 'Page',
  html: (p, ctx) => {
    const sc = Math.min(1700 / p.iw, 900 / p.ih), w = p.iw * sc, h = p.ih * sc;
    const bands = (p.bands || []).map(([x, y, bw, bh, f0]) => `<i data-f0="${f0}" style="position:absolute;left:${x * sc}px;top:${y * sc}px;width:${bw * sc}px;height:${bh * sc}px;background:${C.amb};opacity:.85;mix-blend-mode:multiply;border-radius:2px;transform:scaleX(0);transform-origin:0 50%;display:block"></i>`).join('');
    return `<div class="${AF}" style="background:${C.bg}"></div><div ${ctx.dev('Page', {})} style="position:absolute;left:${(1920 - w) / 2}px;top:${(1080 - h) / 2}px;width:${w}px;height:${h}px;box-shadow:3px 3px 0 #000"><img src="${p.img}" style="width:100%;height:100%;display:block" alt="">${bands}</div>${vig(0.5)}`;
  },
  render: function (el, f) {
    var u = Math.max(0, Math.min(1, f / 90)), e = 1 - Math.pow(1 - u, 3);
    el.style.transform = 'translateY(' + (151 * (1 - e)).toFixed(2) + 'px) scale(' + (1 + 0.06 * Math.min(1, f / 600)).toFixed(5) + ')';
    var b = el.querySelectorAll('i');
    for (var i = 0; i < b.length; i++) { var k = Math.max(0, Math.min(1, (f - +b[i].dataset.f0) / 44)); b[i].style.transform = 'scaleX(' + (-(Math.cos(Math.PI * k) - 1) / 2).toFixed(4) + ')'; }
  },
};
export const RedCircle = {
  name: 'RedCircle',
  html: (p, ctx) => `<svg class="${AF}" width="1920" height="1080" style="pointer-events:none"><ellipse ${ctx.dev('RedCircle', { at: p.at ?? 0 })} cx="${p.cx}" cy="${p.cy}" rx="${p.rx}" ry="${p.ry}" fill="none" stroke="${C.red}" stroke-width="6" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100" transform="rotate(-120 ${p.cx} ${p.cy})"/></svg>`,
  render: function (el, f, p) { var u = Math.max(0, Math.min(1, (f - p.at) / 48)), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; el.setAttribute('stroke-dashoffset', (100 * (1 - e)).toFixed(2)); },
};
export const Spotlight = {
  name: 'Spotlight',
  html: (p, ctx) => `<div class="${AF}" ${ctx.dev('Spotlight', { at: p.at ?? 0, hold: p.hold ?? 165 })} style="pointer-events:none;opacity:0;background:radial-gradient(circle ${p.r ?? 260}px at ${p.cx}px ${p.cy}px, rgba(0,0,0,0) 55%, rgba(0,0,0,.8) 100%)"></div>`,
  render: function (el, f, p) { var c = function (x) { return Math.max(0, Math.min(1, x)); }, io = function (x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }; el.style.opacity = (io(c((f - p.at) / 36)) * (1 - io(c((f - p.at - 36 - p.hold) / 36)))).toFixed(4); },
};
export const Subs = {
  name: 'Subs',
  html: (p, ctx) => `<div ${ctx.dev('Subs', { lines: p.lines })} style="position:absolute;left:0;right:0;top:972px;text-align:center"><span style="font:600 54px/1 ${MONO};text-transform:uppercase;color:${C.tx};-webkit-text-stroke:8px #000;paint-order:stroke fill;padding:14px 22px"></span></div>`,
  render: function (el, f, p) {
    var s = el.firstChild, L = null;
    for (var i = 0; i < p.lines.length; i++) if (f >= p.lines[i][0] && f < p.lines[i][1]) L = p.lines[i];
    s.textContent = L ? L[2] : ''; s.style.color = L && L[3] ? '#E3A21A' : '#E8E4DC';
    s.style.opacity = L ? Math.min(1, (f - L[0]) / 6, (L[1] - f) / 6) : 0;
  },
};

export default [Grade, Mosaic, LClip, _V, Vertical, Split2, Panel, Warning, GlitchCut, Dip, Ledger, CaseCard, Credit, PlaceTag, NameTag, TypedDate, Page, RedCircle, Spotlight, Subs];
