// coc_v9.mjs - v9 global finish (owner 2026-11-17: "do the color grading like abyss detective ... add a soft CRT effect").
// AbyGrade = one top layer over the whole part:
//  grade (refs/abyssal_detective/STUDY.md 3, version A3 "colour photos on navy"): faded colour (backdrop contrast .88, sat .82,
//  light sepia), highlights rolled by a warm paper multiply (#E4E0D8 -> whites ~210), blacks lifted to navy by a #121D3C screen
//  (-> blacks ~#141F3E, the ref corner colour), navy vignette rgba(10,18,40,.55).
//  soft CRT: 4 px triangle-wave scanlines (no hard lines, so no moire when scaled to 720p), inner tube shade, one faint rolling
//  bright band (7.5 s period), 1 % luma flicker. All subtle: it must read as a texture, never as a VHS/glitch effect.
const AF = 'af';
export const AbyGrade = {
  name: 'AbyGrade',
  // v10 (owner 2026-11-17 "add good CRT"): real CRT look, still clean: (1) backdrop SVG: R shifted +1.5 px, B -1.5 px (colour fringe
  // on edges), soft bloom on highlights only; (2) 3 px scanlines; (3) faint RGB aperture grille; (4) rounded dark tube corners +
  // inner shade; (5) vignette (owner v9d); (6) faint rolling band + 1 % flicker. No grade change.
  html: (p, ctx) => {
    const id = ctx.id('crt');
    return `<div class="${AF}" ${ctx.dev('AbyGrade', p)} data-layout-allow-occlusion style="pointer-events:none">
<svg width="0" height="0" style="position:absolute"><filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%">
<feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="r"/><feOffset in="r" dx="1.5" dy="0" result="ro"/>
<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0" result="g"/>
<feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0" result="b"/><feOffset in="b" dx="-1.5" dy="0" result="bo"/>
<feBlend in="ro" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="bo" mode="screen" result="rgb"/>
<feGaussianBlur in="rgb" stdDeviation="7" result="bl"/><feComponentTransfer in="bl" result="hi"><feFuncR type="table" tableValues="0 0 0.02 0.22"/><feFuncG type="table" tableValues="0 0 0.02 0.22"/><feFuncB type="table" tableValues="0 0 0.02 0.22"/></feComponentTransfer>
<feBlend in="rgb" in2="hi" mode="screen"/></filter></svg>
<div class="${AF}" style="backdrop-filter:url(#${id});-webkit-backdrop-filter:url(#${id})"></div>
<div class="${AF}" style="background:repeating-linear-gradient(to bottom,rgba(0,0,0,0.16) 0px,rgba(0,0,0,0.16) 1px,rgba(0,0,0,0) 1px,rgba(0,0,0,0) 3px)"></div>
<div class="${AF}" style="background:repeating-linear-gradient(to right,rgba(255,60,60,0.035) 0px,rgba(255,60,60,0.035) 1px,rgba(60,255,60,0.035) 1px,rgba(60,255,60,0.035) 2px,rgba(60,60,255,0.035) 2px,rgba(60,60,255,0.035) 3px);mix-blend-mode:overlay"></div>
<div class="${AF}" style="background:radial-gradient(ellipse 75% 75% at 50% 50%,rgba(0,0,0,0) 45%,rgba(0,0,0,0.5) 100%)"></div>
<div class="${AF}" style="border-radius:42px;box-shadow:0 0 0 80px #000,inset 0 0 140px 18px rgba(0,0,0,0.35)"></div>
<div class="band" style="position:absolute;left:0;width:1920px;top:0;height:200px;background:linear-gradient(to bottom,rgba(255,255,255,0),rgba(220,226,240,0.05) 50%,rgba(255,255,255,0));mix-blend-mode:screen"></div>
<div class="fl ${AF}" style="background:#C8D0E0;mix-blend-mode:screen;opacity:0.01"></div>
</div>`;
  },
  render: function (el, f) {
    var t = f / 60, b = el.querySelector('.band'), l = el.querySelector('.fl');
    if (b) b.style.transform = 'translateY(' + ((((t / 7.5) % 1) * 1300) - 220).toFixed(1) + 'px)';
    if (l) l.style.opacity = (0.01 + 0.006 * Math.sin(t * 47) * Math.sin(t * 3.1)).toFixed(4);
  },
};
export default [AbyGrade];
