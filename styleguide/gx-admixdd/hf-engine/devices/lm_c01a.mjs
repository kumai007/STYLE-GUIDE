// lm_c01a.mjs - case 1 part A devices (last-moments channel). 60 fps frames. Use with 'lm' + 'lm_c01b' (Cam, Img, Lbl, Tag, TCard).
// API (p = props; f = shot-local frame):
//  Frz {src, n, fit='contain', pos}  freeze frame of a raw clip (source frame n @60, ffmpeg-extracted at build).
//  MosImg {src, pos, fit='cover', boxes:[[x,y,w,h]]}  pixelated copy of a photo (24 px blocks) clipped to boxes (1920x1080 px of
//      the cover box, before any camera). Put it in the same Cam as the Img (faces of private people).
//  MapC01 {z12, z14, off:[x,y,k], keys:[[f,cx,cy,s,rx]], pins:[{x,y,at,label,lat}], fx}  live dark map: z12 layer (k x scale,
//      top-left off) under the z14 frame (z14 fades in with zoom), eased (sine.inOut) camera between keys (log zoom), 3-D tilt rx,
//      red pins drop in at `at` with a pulse ring, label typed from `lat` on a red leader; older labels dim when a newer one types.
const AF = 'af';
const C = { tx: '#E8E4DC', dim: '#9A968E', red: '#9E1F1C' };
const MONO = "'IBM Plex Mono',monospace";
const LIT = 'text-shadow:0 0 22px rgba(255,236,206,.22),0 2px 6px rgba(0,0,0,.95),0 10px 30px rgba(0,0,0,.7)';

export const Frz = {
  name: 'Frz',
  html: (p, ctx) => `<img class="${AF}" src="${ctx.still(p.src, p.n)}" alt="" style="object-fit:${p.fit || 'contain'};object-position:${p.pos || '50% 50%'}">`,
};

export const MosImg = {
  name: 'MosImg',
  html: (p, ctx) => {
    const fid = ctx.id('pm'), d = (p.boxes || []).map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h${-w}Z`).join('');
    return `<svg width="0" height="0" style="position:absolute"><filter id="${fid}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feFlood x="11" y="11" width="2" height="2"/><feComposite width="24" height="24"/><feTile result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/><feMorphology operator="dilate" radius="12"/></filter></svg>`
      + `<div class="${AF}" style="clip-path:path('${d || 'M0 0Z'}')"><img class="${AF}" src="assets/media/${p.src}" alt="" style="object-fit:${p.fit || 'cover'};object-position:${p.pos || '50% 50%'};filter:url(#${fid})"></div>`;
  },
};

export const MapC01 = {
  name: 'MapC01',
  html: (p, ctx) => {
    const [ox, oy, k] = p.off, W = 3840, H = 2304, fx = p.fx || 'brightness(1.75) contrast(1.3) saturate(.6)';
    const pins = (p.pins || []).map((q, i) => `<div data-pin="${i}" style="position:absolute;left:${q.x}px;top:${q.y}px;width:0;height:0">`
      + `<div data-s style="position:absolute;left:0;top:0;width:0;height:0">`
      + `<i data-ring style="position:absolute;left:-60px;top:-60px;width:120px;height:120px;border-radius:50%;border:3px solid ${C.red};box-shadow:0 0 18px rgba(158,31,28,.8);opacity:0"></i>`
      + `<i style="position:absolute;left:-7px;top:-7px;width:14px;height:14px;border-radius:50%;background:rgba(0,0,0,.6);filter:blur(3px)"></i>`
      + `<i data-drop style="position:absolute;left:-17px;top:-48px;width:34px;height:48px;background:linear-gradient(160deg,#C9332E,${C.red} 55%,#5E1110);clip-path:polygon(50% 100%,0 40%,0 25%,25% 0,75% 0,100% 25%,100% 40%);filter:drop-shadow(0 4px 6px rgba(0,0,0,.9));opacity:0"></i>`
      + `<i data-lead style="position:absolute;left:26px;top:-26px;width:70px;height:3px;background:${C.red};transform:scaleX(0);transform-origin:0 50%;box-shadow:0 0 10px rgba(158,31,28,.7)"></i>`
      + `<b data-lab style="position:absolute;left:108px;top:-46px;font:600 38px/1 ${MONO};letter-spacing:0.14em;color:${C.tx};${LIT};white-space:pre"></b>`
      + `</div></div>`).join('');
    return `<div class="${AF}" style="background:#0B0B0C;overflow:hidden"><div data-tilt class="${AF}" style="transform-origin:50% 60%">`
      + `<div data-cam style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform-origin:0 0">`
      + `<img src="assets/media/${p.z12}" alt="" style="position:absolute;left:${ox}px;top:${oy}px;width:${W * k}px;height:${H * k}px;filter:${fx}">`
      + `<img data-z14 src="assets/media/${p.z14}" alt="" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;filter:${fx};opacity:0">`
      + `${pins}</div></div>`
      + `<div class="${AF}" style="pointer-events:none;mix-blend-mode:screen;background:radial-gradient(ellipse 48% 42% at 52% 50%,rgba(255,232,200,.10),rgba(255,232,200,0) 100%)"></div>`
      + `<div class="${AF}" style="pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0) 28%,rgba(0,0,0,0) 72%,rgba(0,0,0,.6))"></div></div>`
      + `<div ${ctx.dev('MapC01', { keys: p.keys, pins: (p.pins || []).map((q) => ({ at: q.at, lat: q.lat, label: q.label })) })} style="display:none"></div>`;
  },
  render: function (el, f, p) {
    var root = el.previousSibling, cam = root.querySelector('[data-cam]'), tilt = root.querySelector('[data-tilt]'), K = p.keys;
    var c = function (x) { return Math.max(0, Math.min(1, x)); }, io = function (x) { return -(Math.cos(Math.PI * x) - 1) / 2; };
    var a = K[0], b = K[0];
    for (var i = 0; i < K.length; i++) { if (K[i][0] <= f) a = K[i]; if (K[i][0] >= f) { b = K[i]; break; } b = K[i]; }
    var u = b[0] > a[0] ? io(c((f - a[0]) / (b[0] - a[0]))) : 0;
    var cx = a[1] + (b[1] - a[1]) * u, cy = a[2] + (b[2] - a[2]) * u, s = Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * u), rx = a[4] + (b[4] - a[4]) * u;
    tilt.style.transform = 'perspective(1700px) rotateX(' + rx.toFixed(3) + 'deg) rotateZ(' + (-0.6 + 0.004 * f).toFixed(3) + 'deg)';
    cam.style.transform = 'translate(' + (960 - cx * s).toFixed(2) + 'px,' + (560 - cy * s).toFixed(2) + 'px) scale(' + s.toFixed(5) + ')';
    root.querySelector('[data-z14]').style.opacity = c((s - 0.3) / 0.35).toFixed(3);
    var P = root.querySelectorAll('[data-pin]'), last = -1;
    for (var j = 0; j < p.pins.length; j++) if (f >= p.pins[j].lat) last = j;
    for (var j2 = 0; j2 < P.length; j2++) {
      var q = p.pins[j2], g = f - q.at, e = c(g / 18), sc = P[j2].querySelector('[data-s]');
      sc.style.transform = 'scale(' + (1 / s).toFixed(5) + ')';
      var dr = sc.querySelector('[data-drop]'); dr.style.opacity = e.toFixed(3); dr.style.transform = 'translateY(' + (-46 * (1 - e) * (1 - e)).toFixed(2) + 'px)';
      var rg = sc.querySelector('[data-ring]'), ph = g < 14 ? -1 : ((g - 14) % 70) / 70;
      rg.style.opacity = ph < 0 ? 0 : (0.9 * (1 - ph)).toFixed(3); rg.style.transform = 'scale(' + (ph < 0 ? 0 : 0.2 + 1.3 * ph).toFixed(3) + ')';
      var gl = f - q.lat; sc.querySelector('[data-lead]').style.transform = 'scaleX(' + io(c(gl / 14)).toFixed(4) + ')';
      var lab = sc.querySelector('[data-lab]'); lab.textContent = gl < 12 ? '' : q.label.slice(0, Math.floor((gl - 12) * 0.8));
      lab.style.opacity = j2 === last || last < 0 ? 1 : 0.45;
    }
  },
};

export default [Frz, MosImg, MapC01];
