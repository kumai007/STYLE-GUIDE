// lm_mg.mjs - v5 motion-graphics kit for the last-moments channel (owner 2026-11-19: "too much stock", "more motion graphics").
// Re-usable for every case. 60 fps; f = shot-local frame. Case devices: [...,'lm_c01a','lm_pro','lm_mg'] (Parallax mosaic uses MosImg
// from lm_c01a). Fonts: VCROSDMono, IBMPlexMono-500. Every move eased (sine/cubic/back), never linear. Pair each text pop with a
// click SFX, camera moves with a whoosh, counters with ticks (case side; helper counterTicks below).
// Devices that hold their own picture take g = {sat=.55, bri=.9, con=1.1} (grade on the picture only, overlays stay clean); add an
// empty n('Grade', {...}) AFTER them for vignette + grain. Backdrop devices (Timeline, Counter, DocStack) take the backdrop as kids
// (e.g. a blurred graded photo Cam) - never flat black.
// API
//  Parallax {src, pos, fit='cover', mos:[[x,y,w,h]], s:[1.04,1.12], ry:[-3,3], rx:[1,-1], tx:[a,b], z=140, a=0, b=len}
//      2.5-D photo: sharp photo (soft feathered edge) floats z px in front of a blurred enlarged copy; eased 3-D camera orbit/push.
//      Wrap in Grade like any photo. mos = face mosaic boxes (cover-box px).
//  RouteMap {z12, z14, off:[x,y,k], fx, pins:[{x,y,label,time,at,side='r'}], keys:[[f,cx,cy,s,rx]] (optional: auto), tilt=10, bend=.16}
//      dark map (z12 under z14 frame, MapC01 base), red route line draws pin->pin (segment ends at the next pin's `at`), pins pop
//      (back ease) with a pulse ring, VCR label + Plex time line pop beside each pin (older labels dim), eased 3-D tilt/push.
//  Timeline {nodes:[{date,label,at}], at=0, sp=560, ry=-16, y=540}  kids = backdrop. Horizontal dated line in 3-D; the camera
//      dollies to each node as it lights at `at` (its VO word); latest lit node red + pulse, earlier lit nodes white, unlit dim.
//  Counter {to, from=0, unit, label, at=10, dur=80, size=220, pos='c'|'l'}  kids = backdrop. Big VCR number counts (cubic out),
//      unit beside it, red rule draws, label fades in; out 18 f at shot end. Ticks: counterTicks(t0_s, from, to, dur).
//  CCTVAnalyse {src, n, box:[x,y,w,h], zoom=1.6, at=16, zin=60, rect=[240,0,1440,1080], sw=640, sh=480, data:[[k,v],..],
//      dpos='tr'|'tl'|'br'|'bl', tag='SUBJECT', g}  freeze of a raw (contain over its blurred fill), eased punch-in toward the box
//      (origin clamped so the picture always fills the frame), corner brackets lock on (+ tag), VCR data readout, faint scan lines
//      and one slow scan sweep (not VHS static). box in stage px of the unzoomed contain picture.
//  DocStack {docs:[{img,iw,ih,bands:[[x,y,w,h]],src,date,at}], W=1380, dx=780, dy=-36, dz=-950}  kids = backdrop. Real article
//      crops as paper cards stacked in depth; the camera flies from one card to the next (arrives at doc.at, move 42 f), passed
//      cards fade, far cards dim + blur; amber marker draws over each card's bands (12 f after arrival, 26 f apart).
const AF = 'af';
const C = { tx: '#ECE8DF', dim: '#A29E95', red: '#B3231F', red2: '#D2392F', amb: 'rgba(242,185,10,.42)' };
const MONO = "'IBM Plex Mono',monospace", VCR = "'VCR OSD Mono','VT323','Share Tech Mono',monospace";
const SH = 'text-shadow:0 0 3px rgba(0,0,0,.75),0 2px 4px rgba(0,0,0,.85),0 0 18px rgba(0,0,0,.6)';
const E = 'var c=function(x){return Math.max(0,Math.min(1,x))},io=function(x){return -(Math.cos(Math.PI*x)-1)/2},o3=function(x){return 1-Math.pow(1-x,3)},q3=function(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2},bk=function(x){var s=1.7;x=x-1;return 1+(s+1)*x*x*x+s*x*x};';
const R = (body) => new Function('el', 'f', 'p', 'G', 'S', E + body);
const gf = (g = {}) => `saturate(${g.sat ?? 0.55}) contrast(${g.con ?? 1.1}) brightness(${g.bri ?? 0.9})`;
const M = (s) => `assets/media/${s}`;

// ticks for a Counter: seconds where the shown integer changes (cubic-out), thinned to >= gap s apart (case adds the SFX)
export const counterTicks = (t0, from, to, dur, gap = 0.1) => {
  const out = []; let last = from, lt = -9;
  for (let k = 1; k <= dur; k++) { const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k / dur, 3))); const t = t0 + k / 60;
    if (v !== last && t - lt >= gap) { out.push(+t.toFixed(3)); lt = t; } last = v; }
  return out;
};

export const Parallax = {
  name: 'Parallax',
  html: (p, ctx) => {
    const fit = p.fit || 'cover', pos = p.pos || '50% 50%', z = p.z ?? 140;
    const mos = p.mos ? ctx.node({ d: 'MosImg', p: { src: p.src, pos, fit, boxes: p.mos } }) : '';
    return `<div class="${AF}" ${ctx.dev('Parallax', { s: p.s || [1.04, 1.12], ry: p.ry || [-3, 3], rx: p.rx || [1, -1], tx: p.tx || [0, 0], a: p.a ?? 0, b: p.b ?? null, z })} style="overflow:hidden;perspective:1500px;background:#0B0B0C">`
      + `<div data-w class="${AF}" style="transform-style:preserve-3d">`
      + `<div class="${AF}" style="transform:translateZ(-${z * 2}px) scale(${(1.5 + z / 700).toFixed(3)})"><img class="${AF}" src="${M(p.src)}" alt="" style="object-fit:cover;object-position:${pos};filter:blur(22px) brightness(.62)"></div>`
      + `<div data-fg class="${AF}" style="transform:translateZ(${z}px);-webkit-mask-image:radial-gradient(ellipse 72% 74% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 72% 74% at 50% 50%,#000 70%,transparent 100%)">`
      + `<img class="${AF}" src="${M(p.src)}" alt="" style="object-fit:${fit};object-position:${pos}">${mos}</div></div></div>`;
  },
  render: R(`var b=p.b||S.len,u=io(c((f-p.a)/Math.max(1,b-p.a))),L=function(v){return v[0]+(v[1]-v[0])*u};
    var w=el.querySelector('[data-w]'),fg=el.querySelector('[data-fg]'),k=1500/(1500-p.z);
    w.style.transform='translate3d('+L(p.tx).toFixed(2)+'px,0,0) rotateY('+L(p.ry).toFixed(3)+'deg) rotateX('+L(p.rx).toFixed(3)+'deg)';
    fg.style.transform='translateZ('+p.z+'px) scale('+(L(p.s)/k).toFixed(5)+')';`),
};

export const RouteMap = {
  name: 'RouteMap',
  html: (p, ctx) => {
    const [ox, oy, k] = p.off, W = 3840, H = 2304, fx = p.fx || 'brightness(2.3) contrast(1.35) saturate(.6)', P = p.pins || [], bend = p.bend ?? 0.16, tilt = p.tilt ?? 10;
    const segs = P.slice(1).map((b, j) => { const a = P[j], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, sg = j % 2 ? -1 : 1;
      return `M${a.x} ${a.y}Q${(mx - dy * bend * sg).toFixed(1)} ${(my + dx * bend * sg).toFixed(1)} ${b.x} ${b.y}`; });
    const path = (d, j, st) => `<path data-seg="${j}" d="${d}" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100" fill="none" stroke-linecap="round" ${st}/>`;
    const svg = `<svg style="position:absolute;left:0;top:0;overflow:visible" width="${W}" height="${H}">`
      + segs.map((d, j) => path(d, j, `data-gl stroke="rgba(210,57,47,.45)" style="filter:blur(6px)"`) + path(d, j, `data-ln stroke="${C.red2}"`)).join('') + `</svg>`;
    const pins = P.map((q, i) => { const r = q.side === 'l';
      return `<div data-pin="${i}" style="position:absolute;left:${q.x}px;top:${q.y}px;width:0;height:0"><div data-s style="position:absolute;left:0;top:0;width:0;height:0">`
      + `<i data-ring style="position:absolute;left:-46px;top:-46px;width:92px;height:92px;border-radius:50%;border:3px solid ${C.red2};opacity:0"></i>`
      + `<i data-dot style="position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;background:${C.red2};border:4px solid #EDE6DA;box-shadow:0 0 16px rgba(210,57,47,.9),0 3px 8px rgba(0,0,0,.9);opacity:0"></i>`
      + `<div data-lab style="position:absolute;${r ? 'right:34px' : 'left:34px'};top:-30px;display:flex;flex-direction:column;align-items:${r ? 'flex-end' : 'flex-start'};gap:6px;opacity:0;transform-origin:${r ? '100%' : '0'} 50%">`
      + `<b style="font:400 40px/1 ${VCR};letter-spacing:.06em;color:${C.tx};white-space:nowrap;${SH}">${ctx.esc(String(q.label || '').toUpperCase())}</b>`
      + (q.time ? `<b style="font:500 24px/1 ${MONO};letter-spacing:.14em;color:#CFC9BC;white-space:nowrap;${SH}">${ctx.esc(String(q.time).toUpperCase())}</b>` : '')
      + `</div></div></div>`; }).join('');
    let keys = p.keys;
    if (!keys) { // auto camera: overview of all pins, eased push + drift toward each pin as it lands
      const xs = P.map((q) => q.x), ys = P.map((q) => q.y), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, s0 = Math.max(0.25, Math.min(1.6, 1200 / Math.max(1, x1 - x0), 560 / Math.max(1, y1 - y0)));
      keys = [[0, cx, cy, s0 * 0.72, tilt + 10], ...P.map((q, i) => [q.at + 30, cx * 0.7 + q.x * 0.3, cy * 0.7 + q.y * 0.3, s0 * (0.92 + 0.05 * i), tilt])];
    }
    return `<div class="${AF}" style="background:#0B0B0C;overflow:hidden"><div data-tilt class="${AF}" style="transform-origin:50% 60%">`
      + `<div data-cam style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0">`
      + `<img src="${M(p.z12)}" alt="" style="position:absolute;left:${ox}px;top:${oy}px;width:${W * k}px;height:${H * k}px;filter:${fx}">`
      + `<img data-z14 src="${M(p.z14)}" alt="" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;filter:${fx};opacity:0">`
      + `${svg}${pins}</div></div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 72%,rgba(0,0,0,.6))"></div></div>`
      + `<div ${ctx.dev('RouteMap', { keys, pins: P.map((q) => ({ at: q.at })) })} style="display:none"></div>`;
  },
  render: R(`var root=el.previousSibling,cam=root.querySelector('[data-cam]'),tilt=root.querySelector('[data-tilt]'),K=p.keys,a=K[0],b=K[0];
    for(var i=0;i<K.length;i++){if(K[i][0]<=f)a=K[i];if(K[i][0]>=f){b=K[i];break;}b=K[i];}
    var u=b[0]>a[0]?io(c((f-a[0])/(b[0]-a[0]))):0,cx=a[1]+(b[1]-a[1])*u,cy=a[2]+(b[2]-a[2])*u,s=Math.exp(Math.log(a[3])+(Math.log(b[3])-Math.log(a[3]))*u)*(1+0.00025*f),rx=a[4]+(b[4]-a[4])*u;
    tilt.style.transform='perspective(1700px) rotateX('+rx.toFixed(3)+'deg) rotateZ('+(-0.8+0.005*f).toFixed(3)+'deg)';
    cam.style.transform='translate('+(960-cx*s).toFixed(2)+'px,'+(560-cy*s).toFixed(2)+'px) scale('+s.toFixed(5)+')';
    root.querySelector('[data-z14]').style.opacity=c((s-0.3)/0.35).toFixed(3);
    var P=p.pins,last=-1;for(var j=0;j<P.length;j++)if(f>=P[j].at+6)last=j;
    var sg=root.querySelectorAll('[data-seg]');
    for(var k=0;k<sg.length;k++){var n=+sg[k].getAttribute('data-seg'),f0=P[n].at+14,f1=P[n+1].at,v=q3(c((f-f0)/Math.max(1,f1-f0)));
      sg[k].setAttribute('stroke-dashoffset',(100*(1-v)).toFixed(2));sg[k].setAttribute('stroke-width',((sg[k].hasAttribute('data-gl')?16:6)/s).toFixed(2));}
    var D=root.querySelectorAll('[data-pin]');
    for(var j2=0;j2<D.length;j2++){var g=f-P[j2].at,sc=D[j2].querySelector('[data-s]');sc.style.transform='scale('+(1/s).toFixed(5)+')';
      var e=c(g/16),dt=sc.querySelector('[data-dot]');dt.style.opacity=e.toFixed(3);dt.style.transform='scale('+(g<0?0:bk(e)).toFixed(4)+')';
      var rg=sc.querySelector('[data-ring]'),ph=g<10?-1:((g-10)%64)/64;rg.style.opacity=ph<0?0:(0.85*(1-ph)).toFixed(3);rg.style.transform='scale('+(ph<0?0:0.3+1.2*ph).toFixed(3)+')';
      var lb=sc.querySelector('[data-lab]'),le=c((g-6)/18);lb.style.opacity=((j2===last||last<0?1:0.5)*le).toFixed(3);lb.style.transform='translateY('+(10*(1-o3(le))).toFixed(2)+'px) scale('+(0.86+0.14*bk(le)).toFixed(4)+')';}`),
};

export const Timeline = {
  name: 'Timeline',
  html: (p, ctx, node) => {
    const N = (p.nodes || []).length, sp = p.sp ?? 560, x0 = 400, len = x0 * 2 + sp * (N - 1), y = p.y ?? 540;
    const ticks = Array.from({ length: Math.floor(len / (sp / 4)) + 1 }, (_, i) => `<i style="position:absolute;left:${(i * sp) / 4}px;top:-8px;width:2px;height:16px;background:rgba(236,232,223,.28)"></i>`).join('');
    const nodes = (p.nodes || []).map((q, i) => `<div data-n="${i}" style="position:absolute;left:${x0 + i * sp}px;top:0;width:0;height:0">`
      + `<i data-ring style="position:absolute;left:-40px;top:-40px;width:80px;height:80px;border-radius:50%;border:3px solid ${C.red2};opacity:0"></i>`
      + `<i data-dot style="position:absolute;left:-15px;top:-15px;width:30px;height:30px;border-radius:50%;box-sizing:border-box;border:4px solid rgba(236,232,223,.4);background:rgba(11,11,12,.6)"></i>`
      + `<div data-tx style="position:absolute;left:-300px;width:600px;top:-112px;text-align:center;opacity:.32"><b style="display:block;font:400 54px/1 ${VCR};letter-spacing:.06em;color:${C.tx};${SH}">${ctx.esc(String(q.date).toUpperCase())}</b></div>`
      + `<div data-tx2 style="position:absolute;left:-300px;width:600px;top:46px;text-align:center;opacity:0"><b style="font:500 26px/1.25 ${MONO};letter-spacing:.14em;color:#D6D0C4;${SH}">${ctx.esc(String(q.label || '').toUpperCase())}</b></div></div>`).join('');
    return `<div class="${AF}">${ctx.kids(node)}</div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.5) 35%,rgba(0,0,0,.5) 65%,rgba(0,0,0,.15))"></div>`
      + `<div class="${AF}" ${ctx.dev('Timeline', { nodes: (p.nodes || []).map((q) => q.at), at: p.at ?? 0, sp, x0, len, ry: p.ry ?? -16 })} style="perspective:1500px;overflow:hidden">`
      + `<div data-w style="position:absolute;left:0;top:${y}px;width:${len}px;height:0;transform-origin:0 0">`
      + `<div data-base style="position:absolute;left:0;top:-2px;width:${len}px;height:4px;background:rgba(236,232,223,.38);transform-origin:0 50%;box-shadow:0 0 10px rgba(0,0,0,.8)">${ticks}</div>`
      + `<div data-lit style="position:absolute;left:0;top:-3px;width:${len}px;height:6px;background:linear-gradient(90deg,rgba(236,232,223,.0),${C.tx} 20%,${C.tx} 85%,${C.red2});transform-origin:0 50%;transform:scaleX(0);box-shadow:0 0 14px rgba(255,236,206,.35)"></div>`
      + `${nodes}</div></div>`;
  },
  render: R(`var A=p.nodes,w=el.querySelector('[data-w]'),cur=-1,cx=p.x0-260;
    for(var i=0;i<A.length;i++){var v=io(c((f-(A[i]-36))/42));cx+= (i===0?(p.x0-(p.x0-260))*v:p.sp*v);if(f>=A[i])cur=i;}
    var ry=p.ry+5*io(c(f/Math.max(1,S.len)));
    w.style.transform='translate3d('+(960-cx).toFixed(2)+'px,0,0) rotateY('+ry.toFixed(3)+'deg)';w.style.transformOrigin=cx.toFixed(1)+'px 0';
    el.querySelector('[data-base]').style.transform='scaleX('+q3(c((f-p.at)/40)).toFixed(4)+')';
    el.querySelector('[data-lit]').style.transform='scaleX('+(cur<0?0:Math.min(cx,p.x0+cur*p.sp)/p.len).toFixed(4)+')';
    var out=1-io(c((f-(S.len-18))/18));el.style.opacity=(io(c((f-p.at)/20))*out).toFixed(4);
    var Nn=el.querySelectorAll('[data-n]');
    for(var j=0;j<Nn.length;j++){var g=f-A[j],e=c(g/20),dt=Nn[j].querySelector('[data-dot]'),rg=Nn[j].querySelector('[data-ring]'),isC=j===cur;
      dt.style.background=g<0?'rgba(11,11,12,.6)':(isC?'${C.red2}':'${C.tx}');dt.style.borderColor=g<0?'rgba(236,232,223,.4)':'#EDE6DA';
      dt.style.transform='scale('+(g<0?1:(isC?0.8+0.4*bk(e):1)).toFixed(4)+')';dt.style.boxShadow=isC&&g>=0?'0 0 22px rgba(210,57,47,.95)':'none';
      var ph=!isC||g<8?-1:((g-8)%66)/66;rg.style.opacity=ph<0?0:(0.8*(1-ph)).toFixed(3);rg.style.transform='scale('+(ph<0?0:0.35+1.1*ph).toFixed(3)+')';
      var t1=Nn[j].querySelector('[data-tx]'),t2=Nn[j].querySelector('[data-tx2]');
      t1.style.opacity=(g<0?0.32:0.32+0.68*io(e)*(isC?1:0.75)).toFixed(3);t1.style.transform='translateY('+(g<0?0:-8*io(e)).toFixed(2)+'px)';
      t2.style.opacity=(g<0?0:io(c((g-6)/24))*(isC?1:0.6)).toFixed(3);t2.style.transform='translateY('+(g<0?8:8*(1-io(c((g-6)/24)))).toFixed(2)+'px)';}`),
};

export const Counter = {
  name: 'Counter',
  html: (p, ctx, node) => {
    const size = p.size ?? 220, l = p.pos === 'l';
    return `<div class="${AF}">${ctx.kids(node)}</div>`
      + `<div class="${AF}" style="pointer-events:none;background:radial-gradient(ellipse 55% 50% at ${l ? '30%' : '50%'} 50%,rgba(0,0,0,.55),rgba(0,0,0,0) 100%)"></div>`
      + `<div class="${AF}" ${ctx.dev('Counter', { from: p.from ?? 0, to: p.to, at: p.at ?? 10, dur: p.dur ?? 80 })} style="display:flex;flex-direction:column;justify-content:center;align-items:${l ? 'flex-start' : 'center'};${l ? 'padding-left:150px;' : ''}opacity:0">`
      + `<div style="display:flex;align-items:baseline;gap:28px;font-family:${VCR};color:${C.tx};${SH}"><b data-v style="font-weight:400;font-size:${size}px;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:.02em">${p.from ?? 0}</b>`
      + (p.unit ? `<b style="font-weight:400;font-size:${Math.round(size * 0.36)}px;line-height:1;letter-spacing:.08em">${ctx.esc(String(p.unit).toUpperCase())}</b>` : '') + `</div>`
      + `<i data-rule style="display:block;width:${Math.round(size * 2.4)}px;height:5px;margin:22px 0 24px;background:${C.red2};box-shadow:0 0 12px rgba(210,57,47,.6);transform:scaleX(0);transform-origin:${l ? '0' : '50%'} 50%"></i>`
      + `<b data-lb style="font:500 30px/1.3 ${MONO};letter-spacing:.16em;color:#D6D0C4;text-align:${l ? 'left' : 'center'};${SH};opacity:0">${ctx.esc(String(p.label || '').toUpperCase())}</b></div>`;
  },
  render: R(`var g=f-p.at,u=c(g/p.dur),v=Math.round(p.from+(p.to-p.from)*o3(u)),out=1-io(c((f-(S.len-18))/18)),e=io(c(g/22));
    el.style.opacity=(g<0?0:e*out).toFixed(4);el.style.transform='scale('+(1.06-0.06*o3(c(g/40))+0.012*io(c(f/S.len))).toFixed(5)+')';
    el.querySelector('[data-v]').textContent=String(v);
    el.querySelector('[data-rule]').style.transform='scaleX('+q3(c((g-10)/40)).toFixed(4)+')';
    var lb=el.querySelector('[data-lb]'),le=io(c((g-p.dur*0.55)/26));lb.style.opacity=le.toFixed(4);lb.style.transform='translateY('+(8*(1-le)).toFixed(2)+'px)';`),
};

export const CCTVAnalyse = {
  name: 'CCTVAnalyse',
  html: (p, ctx) => {
    const [bx, by, bw, bh] = p.box, z = p.zoom ?? 1.6, [rx, ry, rw, rh] = p.rect || [240, 0, 1440, 1080], st = ctx.still(p.src, p.n);
    const cl = (v, lo, hi) => (lo > hi ? (lo + hi) / 2 : Math.max(lo, Math.min(hi, v)));
    const [qx, qy] = p.o || [bx + bw / 2, by + bh / 2]; // o = zoom focus override (e.g. box top so the tag stays on screen)
    const ox = cl(qx,(rx * z) / (z - 1), ((rx + rw) * z - 1920) / (z - 1)), oy = cl(qy, (ry * z) / (z - 1), ((ry + rh) * z - 1080) / (z - 1));
    const corner = (k) => { const t = k < 2, l = k % 2 === 0;
      return `<i data-k="${k}" style="position:absolute;${t ? 'top' : 'bottom'}:0;${l ? 'left' : 'right'}:0;width:34px;height:34px;border:0 solid ${C.red2};border-${t ? 'top' : 'bottom'}-width:4px;border-${l ? 'left' : 'right'}-width:4px;filter:drop-shadow(0 0 5px rgba(210,57,47,.8)) drop-shadow(0 1px 2px #000)"></i>`; };
    const dp = p.dpos || 'tr', dpos = `${dp[1] === 'r' ? 'right:96px' : 'left:96px'};${dp[0] === 't' ? 'top:64px' : 'bottom:72px'}`;
    const data = (p.data || []).map(([k, v]) => `<div data-d style="display:flex;gap:18px;opacity:0"><span style="color:#B9B3A7;min-width:96px">${ctx.esc(String(k).toUpperCase())}</span><span>${ctx.esc(String(v).toUpperCase())}</span></div>`).join('');
    return `<div class="${AF}" style="overflow:hidden;background:#0B0B0C">`
      + `<div data-z class="${AF}" style="transform-origin:${ox.toFixed(1)}px ${oy.toFixed(1)}px">`
      + `<img class="${AF}" src="${st}" alt="" style="object-fit:cover;filter:blur(40px) brightness(.42) ${gf(p.g)};transform:scale(1.2)">`
      + `<img class="${AF}" src="${st}" alt="" style="object-fit:contain;filter:${gf(p.g)}">`
      + `<div data-box style="position:absolute;left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px;opacity:0">${[0, 1, 2, 3].map(corner).join('')}`
      + `<i data-xh style="position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border:2px solid rgba(236,232,223,.7);border-radius:50%"></i>`
      + `<b data-tag style="position:absolute;left:0;bottom:100%;margin-bottom:12px;font:400 26px/1 ${VCR};letter-spacing:.1em;color:${C.tx};background:rgba(150,26,22,.85);padding:5px 10px 4px;white-space:nowrap;transform-origin:0 100%">${ctx.esc(String(p.tag ?? 'SUBJECT').toUpperCase())}</b></div></div>`
      + `<div class="${AF}" style="pointer-events:none;opacity:.5;background:repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 1px,rgba(0,0,0,0) 1px 4px)"></div>`
      + `<div data-sw style="position:absolute;left:0;top:0;width:1920px;height:180px;pointer-events:none;background:linear-gradient(180deg,rgba(220,235,255,0),rgba(220,235,255,.07) 80%,rgba(240,248,255,.16) 98%,rgba(220,235,255,0));opacity:0"></div>`
      + `<div style="position:absolute;${dpos};display:flex;flex-direction:column;gap:12px;font:400 32px/1 ${VCR};letter-spacing:.06em;color:${C.tx};${SH}">${data}</div></div>`
      + `<div ${ctx.dev('CCTVAnalyse', { z, at: p.at ?? 16, zin: p.zin ?? 60 })} style="display:none"></div>`;
  },
  render: R(`var root=el.previousSibling,g=f-p.at,zu=q3(c(g/p.zin)),s=1+(p.z-1)*zu+0.0003*Math.max(0,g-p.zin);
    root.querySelector('[data-z]').style.transform='scale('+s.toFixed(5)+')';
    var lk=g-p.zin*0.7,e=o3(c(lk/22)),bx=root.querySelector('[data-box]');bx.style.opacity=(lk<0?0:Math.min(1,e*1.4)).toFixed(3);
    var K=bx.querySelectorAll('[data-k]'),d=40*(1-e);
    for(var i=0;i<K.length;i++){var sx=i%2===0?-d:d,sy=i<2?-d:d;K[i].style.transform='translate('+sx.toFixed(2)+'px,'+sy.toFixed(2)+'px) scale('+(1/s).toFixed(4)+')';K[i].style.transformOrigin=(i%2===0?'0':'100%')+' '+(i<2?'0':'100%');}
    var bl=lk>22&&lk<52?(Math.floor((lk-22)/7)%2?0.35:1):1;bx.querySelector('[data-xh]').style.opacity=(e*bl).toFixed(3);
    var tg=bx.querySelector('[data-tag]'),te=io(c((lk-16)/18));tg.style.opacity=te.toFixed(3);tg.style.transform='scale('+(1/s).toFixed(4)+') translateY('+(6*(1-te)).toFixed(2)+'px)';
    var D=root.querySelectorAll('[data-d]');for(var j=0;j<D.length;j++){var de=io(c((lk-26-j*8)/24));D[j].style.opacity=de.toFixed(3);D[j].style.transform='translateY('+(8*(1-de)).toFixed(2)+'px)';}
    var sw=root.querySelector('[data-sw]'),sp=((f-p.at)%170)/170;sw.style.opacity=f<p.at?0:(0.9*Math.sin(Math.PI*sp)).toFixed(3);sw.style.transform='translateY('+(-180+1260*io(sp)).toFixed(1)+'px)';`),
};

export const DocStack = {
  name: 'DocStack',
  html: (p, ctx, node) => {
    const W = p.W ?? 1380, dx = p.dx ?? 780, dy = p.dy ?? -36, dz = p.dz ?? -950, D = p.docs || [];
    const cards = D.map((d, j) => { const k = W / d.iw, H = Math.round(d.ih * k);
      const bands = (d.bands || []).slice(0, 2).map(([x, y, w, h], b) => `<i data-b="${b}" style="position:absolute;left:${(x * k - 6).toFixed(1)}px;top:${(y * k + h * k * 0.08).toFixed(1)}px;width:${(w * k + 12).toFixed(1)}px;height:${(h * k * 0.84).toFixed(1)}px;background:${C.amb};mix-blend-mode:multiply;border-radius:7px 16px 9px 13px;clip-path:inset(0 100% 0 0)"></i>`).join('');
      return `<div data-c="${j}" style="position:absolute;left:${960 - W / 2 + j * dx}px;top:${540 - H / 2 + j * dy}px;width:${W}px;height:${H}px;transform:translateZ(${j * dz}px) rotateY(${j % 2 ? 7 : -5}deg) rotateZ(${j % 2 ? 1.1 : -0.9}deg);box-shadow:0 30px 70px rgba(0,0,0,.75),0 4px 14px rgba(0,0,0,.6)">`
        + `<img src="${M(d.img)}" alt="" style="position:absolute;left:0;top:0;width:100%;height:100%;filter:sepia(.12) contrast(1.05) brightness(.96)">${bands}`
        + `<div style="position:absolute;left:0;bottom:-46px;font:400 26px/1 ${VCR};letter-spacing:.08em;color:${C.tx};${SH}">${ctx.esc(`${d.src || ''}${d.date ? ' · ' + d.date : ''}`.toUpperCase())}</div></div>`; }).join('');
    return `<div class="${AF}">${ctx.kids(node)}</div>`
      + `<div class="${AF}" ${ctx.dev('DocStack', { at: D.map((d) => d.at ?? 0), dx, dy, dz })} style="perspective:1800px;overflow:hidden">`
      + `<div data-w class="${AF}" style="transform-style:preserve-3d">${cards}</div></div>`;
  },
  render: R(`var A=p.at,cam=0;for(var i=1;i<A.length;i++)cam+=io(c((f-(A[i]-42))/42));
    var g0=f-A[0],ent=o3(c(g0/36)),orb=io(c(f/Math.max(1,S.len)));
    el.querySelector('[data-w]').style.transform='translate3d('+(-cam*p.dx).toFixed(2)+'px,'+(-cam*p.dy+60*(1-ent)).toFixed(2)+'px,'+(-cam*p.dz+(-200*(1-ent))+40*orb).toFixed(2)+'px) rotateY('+(2-3*orb).toFixed(3)+'deg)';
    el.style.opacity=(io(c(g0/20))*(1-io(c((f-(S.len-16))/16)))).toFixed(4);
    var Cs=el.querySelectorAll('[data-c]');
    for(var j=0;j<Cs.length;j++){var d=j-cam;Cs[j].style.opacity=(d<0?c(1+d*2.6):1).toFixed(3);
      Cs[j].style.filter='brightness('+(1-0.38*Math.min(Math.max(d,0),2)).toFixed(3)+') blur('+(2.2*Math.min(Math.max(d,0),2)).toFixed(2)+'px)';
      var B=Cs[j].querySelectorAll('[data-b]');for(var b=0;b<B.length;b++){var u=q3(c((f-(A[j]+12+26*b))/32));B[b].style.clipPath='inset(0 '+(100*(1-u)).toFixed(2)+'% 0 0)';}}`),
};

export default [Parallax, RouteMap, Timeline, Counter, CCTVAnalyse, DocStack];
