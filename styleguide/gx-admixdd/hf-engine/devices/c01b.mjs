// Case 1 devices, part b (ports of C1Devices.tsx): Vid, CaseCard, SplitLens, TypedTag, Credit, RawCaptions + C1CAP (c1Captions.ts).
// Contract: see devices/shared.mjs header. Part a (C1Map, Page, Restack, FreezeBWPush) = c01a.mjs; index = c01.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { Vignette } from './shared.mjs';
const AF = 'af';
const CURSOR = '#A51F20'; // tokens C.cursor
const BLACK = '#050607'; // tokens C.black
const HERE = path.dirname(fileURLToPath(import.meta.url));
const MEDIA = path.resolve(HERE, '..', 'media', 'case1'); // Vid = staticFile('case1/<src>.mp4')
const durs = {};
const mediaDur = (src) => (durs[src] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(MEDIA, src + '.mp4')]).toString().trim());

/** Vid (VidP): graded clip, muted; raw = linear base + rate*t (Move 'none'), else eased Move (rate 0.015); desat window; sky; vignette. */
export const Vid = {
  name: 'Vid',
  html: (p, ctx) => {
    const { src, trim = 0, speed = 1, base = 1.0, rate, origin, pos, desat, bw, vig = 0.45, filter, sky = 0, raw = false, mv = 'push', deg } = p;
    const flt0 = [filter ?? 'contrast(1.05)', bw ? 'grayscale(1) contrast(1.12)' : ''].join(' ');
    const tf = `${pos ? `translate(${pos[0]}%, ${pos[1]}%) ` : ''}scale(${base})`;
    const dyn = raw || desat;
    const dp = { base, rate: rate ?? 0.012, raw, pos, desat, filter: filter ?? 'contrast(1.05)', bw: !!bw };
    // OffthreadVideo past the clip end shows its last frame: hold it (Clip hold = still) when the window runs past the media.
    const end = Math.round(trim * 60) / 60 + (ctx.win[1] * speed) / 60, md = ctx.win[1] > ctx.win[0] ? mediaDur(src) : Infinity;
    const hold = end > md + 1e-6 ? md - 1 / 60 : undefined;
    const inner = `<div class="${AF}" ${dyn ? ctx.dev('Vid', dp) : ''} style="transform:${tf};transform-origin:${origin ?? '50% 50%'};filter:${flt0}">${ctx.node({ d: 'Clip', p: { src, trim, speed, hold } })}</div>`;
    const mvN = { d: 'Move', p: { kind: raw ? 'none' : mv, rate: rate ?? 0.015, deg, origin }, k: [{ raw: inner }] };
    const skyD = sky > 0 ? `<div class="${AF}" style="background:linear-gradient(180deg, rgba(0,0,0,${sky}) 0%, rgba(0,0,0,${(sky * 0.55).toFixed(3)}) 28%, rgba(0,0,0,0) 62%)"></div>` : '';
    return `<div class="${AF}" style="overflow:hidden;background-color:${BLACK}">${ctx.node(mvN)}${skyD}${vig > 0 ? Vignette.html({ k: vig }) : ''}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, s = p.raw ? p.base + p.rate * t : p.base;
    var ds = p.desat ? G.ease(t, [p.desat[0], p.desat[0] + 0.25, p.desat[1] - 0.25, p.desat[1]], [1, 0.12, 0.12, 1]) : 1;
    el.style.transform = (p.pos ? 'translate(' + p.pos[0] + '%, ' + p.pos[1] + '%) ' : '') + 'scale(' + s + ')';
    el.style.filter = p.filter + ' ' + (p.bw ? 'grayscale(1) contrast(1.12)' : ds < 1 ? 'saturate(' + ds.toFixed(3) + ')' : '');
  },
};

/** split_lens: road panel centred, then slides left while the cabin panel slides in from the right at cabinAt (0.6 s eased). */
export const SplitLens = {
  name: 'SplitLens',
  html: (p, ctx) => {
    const { road, cabin, cabinAt } = p;
    const W = 930, H = 523, top = (1080 - H) / 2;
    const [w0, w1] = ctx.win;
    const c0 = Math.max(w0, Math.ceil(cabinAt * 60 - 1e-9));
    const panel = (v, x, o, win) => `<div style="position:absolute;left:${x}px;top:${top}px;width:${W}px;height:${H}px;overflow:hidden;opacity:${o};box-shadow:0 0 0 2px rgba(239,250,247,0.18), 0 10px 40px rgba(0,0,0,0.7)"><div style="width:1920px;height:1080px;transform:scale(${W / 1920});transform-origin:0 0">${ctx.node({ d: 'Vid', p: { ...v, vig: 0.3 } }, win)}</div></div>`;
    const body = `<div class="${AF}" ${ctx.dev('SplitLens', { cabinAt, W })}>${panel(road, (1920 - W) / 2, 1)}${c0 < w1 ? panel(cabin, 1920, 0, [c0, w1]) : ''}</div>`;
    return `<div class="${AF}" style="background-color:#06090a;overflow:hidden">${ctx.node({ d: 'Move', p: { kind: 'push', rate: 0.006 }, k: [{ raw: body }] })}${Vignette.html({ k: 0.5 })}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, k = G.ease(t, [p.cabinAt, p.cabinAt + 0.6], [0, 1]), W = p.W;
    el.children[0].style.left = G.interpolate(k, [0, 1], [(1920 - W) / 2, 20]) + 'px';
    var c = el.children[1];
    if (!c) return;
    c.style.display = t >= p.cabinAt ? '' : 'none';
    c.style.left = G.interpolate(k, [0, 1], [1920, 1920 - W - 20]) + 'px';
    c.style.opacity = k;
  },
};

// ---------- CaseCard ----------
const FACE = "font-family:'Courier Prime';font-weight:700;color:#EFFAF7;line-height:1;white-space:pre;text-shadow:0 4px 14px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.6), -2px 0 rgba(255,40,40,0.35), 2px 0 rgba(40,140,255,0.35)";
const curSpan = (h = '0.78em') => `<span style="display:inline-block;width:0.55em;height:${h};background-color:${CURSOR};margin-left:0.05em;vertical-align:-0.08em"></span>`;
const BERG = 'v6_berg_level.png';
/** Copies hf-engine/media/intro/v6_berg_level.png into parts/<id>/assets/c01b/ (build.mjs only junctions the case media folder). */
function bergSrc() {
  const id = process.argv[2];
  const src = path.resolve(HERE, '..', 'media', 'intro', BERG);
  if (id && !process.argv.includes('--no-assets') && fs.existsSync(path.resolve(HERE, '..', 'cases', `${id}.mjs`))) {
    const dir = path.resolve(HERE, '..', 'parts', id, 'assets', 'c01b');
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(path.join(dir, BERG))) fs.copyFileSync(src, path.join(dir, BERG));
  }
  return `assets/c01b/${BERG}`;
}
/** One copy of the card scene (berg plate, gradient, vignette, two scrambled lines, grain). Rendered by CardScene. */
const cardScene = (p, ctx) => {
  const gid = ctx.id('ccg');
  return `<div class="${AF}" ${ctx.dev('CardScene', p)} style="background-color:#000;overflow:hidden">`
    + `<div class="${AF}" style="opacity:0"><img src="${bergSrc()}" alt="" style="width:100%;height:100%;object-fit:cover;transform-origin:50% 96%;filter:brightness(0.82) saturate(0.9)">`
    + `<div class="${AF}" style="background:linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.35) 100%)"></div>${Vignette.html({ k: 0.55 })}</div>`
    + `<div class="${AF}" style="display:flex;justify-content:center;align-items:center;flex-direction:column;gap:34px">`
    + `<div style="${FACE};font-size:132px"><span></span>${curSpan()}<span style="visibility:hidden"></span></div>`
    + `<div style="${FACE};font-size:58px;letter-spacing:0.04em;opacity:0.94"><span></span><span style="visibility:hidden"></span></div></div>`
    + `<div class="${AF}" style="pointer-events:none;opacity:0.09;mix-blend-mode:overlay"><svg width="100%" height="100%"><filter id="${gid}"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="0"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${gid})"/></svg></div></div>`;
};
export const CardScene = {
  name: 'CardScene',
  html: cardScene,
  render: function (el, f, p, G) {
    var t = f / 60, u = t - p.black, bd = Math.max(0.1, p.dur - p.black), q = Math.floor(t * 30);
    var GLY = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789#%&*/';
    function scr(text, tt, land, seed) {
      var t0 = land - 0.32, out = '';
      if (tt < t0) return '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ') { out += ' '; continue; }
        var lockAt = t0 + 0.32 * (i / Math.max(1, text.length - 1)) * 0.6 + 0.12;
        out += tt >= Math.min(land, lockAt + 0.2) ? ch : GLY[Math.floor(G.random(seed + i + Math.floor(tt * 30)) * GLY.length)];
      }
      return out;
    }
    var plate = el.children[0], txt = el.children[1];
    plate.style.opacity = G.ease(u, [0, 0.5], [0, 1]);
    plate.children[0].style.transform = 'scale(' + 1.9 * (1 + 0.012 * bd * G.drift(u / bd)) + ')';
    txt.style.transform = 'translateX(' + (G.random('ccj' + q) - 0.5) * 1.6 + 'px)';
    var a = scr(p.l1, u, p.land1, 'cc1'), b = scr(p.l2, u, p.land2, 'cc2');
    var L1 = txt.children[0].children, L2 = txt.children[1].children;
    L1[0].textContent = a; L1[1].style.display = a.length > 0 && a !== p.l1 ? 'inline-block' : 'none'; L1[2].textContent = p.l1.slice(a.length);
    L2[0].textContent = b; L2[1].textContent = p.l2.slice(b.length);
    el.querySelector('feTurbulence').setAttribute('seed', String(Math.floor(f / 4) % 97));
  },
};
/** CASE card: black until `black`, then the scene; last 7 frames = 6 band copies shifted by seed + ghost clip (screen 0.25) + RGB slabs. */
export const CaseCard = {
  name: 'CaseCard',
  html: (p, ctx) => {
    const { dur, black, l1, l2, land1, land2, ghost } = p;
    const sp = { dur, black, l1, l2, land1, land2 };
    const [w0, w1] = ctx.win;
    const b0 = Math.max(w0, Math.ceil((dur - 7 / 60) * 60 - 1e-9));
    const bands = Array.from({ length: 6 }, (_, k) => {
      const top = k * (100 / 6);
      return `<div class="${AF}" style="clip-path:inset(${top}% 0 ${100 - top - 100 / 6}% 0)">${cardScene(sp, ctx)}</div>`;
    }).join('');
    const ghostD = b0 < w1 ? `<div class="${AF}" style="opacity:0.25;mix-blend-mode:screen">${ctx.node({ d: 'Vid', p: { ...ghost, vig: 0 } }, [b0, w1])}</div>` : '<div></div>';
    const slab = `<div class="${AF}" style="mix-blend-mode:screen">${['#11a334', '#2338d0', '#a4209f', '#1aa6c9', '#11a334'].map((c) => `<div style="position:absolute;width:108%;background-color:${c};opacity:0.75"></div>`).join('')}</div>`;
    return `<div class="${AF}" ${ctx.dev('CaseCard', { dur, black })}><div class="${AF}" style="background-color:#000"></div>${cardScene(sp, ctx)}<div class="${AF}" style="background-color:#000">${bands}${ghostD}${slab}</div></div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, c = el.children, burst = t >= p.dur - 7 / 60;
    c[0].style.display = t < p.black ? '' : 'none';
    c[1].style.display = t >= p.black && !burst ? '' : 'none';
    c[2].style.display = t >= p.black && burst ? '' : 'none';
    if (!(t >= p.black && burst)) return;
    var st = Math.floor((t - (p.dur - 7 / 60)) * 30), bz = c[2].children;
    for (var k = 0; k < 6; k++) bz[k].style.transform = 'translateX(' + (G.random('cb' + st + k) - 0.5) * 160 + 'px)';
    var q = Math.floor(t * 30), sl = bz[7].children;
    for (var j = 0; j < 5; j++) {
      var s = sl[j].style;
      s.left = (G.random('ccl' + j + q) - 0.5) * 2 * 6 + '%';
      s.top = G.random('cct' + q + j) * 88 + '%';
      s.height = 3 + G.random('cch' + q + j) * 9 + '%';
    }
  },
};

/** Typed tag: bottom-left (or `top`), Courier Prime caps typed at 24 cps, red cursor on the last line, blur-fade at `out`. Local t. */
export const TypedTag = {
  name: 'TypedTag',
  html: (p, ctx) => {
    const { lines, out = 1e9, top } = p;
    const face = "font-family:'Courier Prime';font-weight:700;color:#EFFAF7;white-space:pre;text-shadow:0 0 6px rgba(239,250,247,0.3), 0 3px 10px rgba(0,0,0,0.8)";
    const rows = lines.map((l, i) => `<div style="${face};font-size:${l.size ?? (i === 0 ? 62 : 40)}px;line-height:1.12;display:none"><span></span>${curSpan()}<span style="visibility:hidden"></span></div>`).join('');
    const pos = top !== undefined ? `top:${top}px` : 'bottom:110px';
    return `<div ${ctx.dev('TypedTag', { lines: lines.map((l) => [l.text, l.at]), out })} style="position:absolute;left:96px;${pos};background-color:rgba(0,0,0,0.55);padding:12px 24px 14px;display:none">${rows}</div>`;
  },
  render: function (el, f, p, G) {
    var t = f / 60, L = p.lines;
    if (t < L[0][1]) { el.style.display = 'none'; return; }
    var fo = G.ease(t, [p.out, p.out + 0.3], [1, 0]), last = 0;
    for (var i = 0; i < L.length; i++) if (t >= L[i][1]) last = i;
    el.style.display = '';
    el.style.opacity = fo;
    el.style.filter = fo < 1 ? 'blur(' + (1 - fo) * 8 + 'px)' : '';
    for (var j = 0; j < L.length; j++) {
      var d = el.children[j], tx = L[j][0];
      if (t < L[j][1]) { d.style.display = 'none'; continue; }
      var n = Math.min(tx.length, Math.floor((t - L[j][1]) * 24) + 1);
      var on = j === last && (n < tx.length || Math.floor(t * 2.5) % 2 === 0);
      d.style.display = '';
      d.children[0].textContent = tx.slice(0, n);
      d.children[1].style.display = j === last ? 'inline-block' : 'none';
      d.children[1].style.visibility = on ? 'visible' : 'hidden';
      d.children[2].textContent = tx.slice(n);
    }
  },
};

/** Source credit: Share Tech Mono 30 px, eased 0 -> 0.88 -> 0 over [from, to]; corner tl / br. */
export const Credit = {
  name: 'Credit',
  html: (p, ctx) => {
    const { text, from = 0, to = 1e9, corner = 'tl' } = p;
    const pos = corner === 'tl' ? 'left:60px;top:48px' : 'right:60px;bottom:40px';
    return `<div ${ctx.dev('Credit', { from, to })} style="position:absolute;${pos};display:none;font-family:'Share Tech Mono';font-size:30px;color:#E8E8E8;letter-spacing:0.02em;text-shadow:0 0 4px #000, 0 2px 6px rgba(0,0,0,0.9)">${ctx.esc(text)}</div>`;
  },
  render: function (el, f, p, G) {
    var o = G.ease(f / 60, [p.from, p.from + 0.25, p.to - 0.25, p.to], [0, 0.88, 0.88, 0]);
    el.style.display = o > 0 ? '' : 'none';
    el.style.opacity = o;
  },
};

/** Raw speech captions from C1CAP[raw] (clip seconds); shown while t + clipAt in [a, b + 0.15). No fade. */
export const RawCaptions = {
  name: 'RawCaptions',
  html: (p, ctx) => {
    const L = C1CAP[p.raw] ?? [];
    const rows = L.map((l) => `<div style="position:absolute;left:160px;right:160px;bottom:92px;text-align:center;display:none;font-family:'Archivo';font-weight:600;font-size:50px;line-height:1.18;color:#F4F7F7;text-shadow:0 0 3px #000, 0 0 3px #000, 0 2px 8px rgba(0,0,0,0.95)"><span style="background-color:rgba(0,0,0,0.42);padding:4px 16px;box-decoration-break:clone;-webkit-box-decoration-break:clone">${ctx.esc(l[2])}</span></div>`).join('');
    return `<div ${ctx.dev('RawCaptions', { clipAt: p.clipAt ?? 0, L: L.map((l) => [l[0], l[1]]) })}>${rows}</div>`;
  },
  render: function (el, f, p) {
    var t = f / 60 + p.clipAt, hit = -1;
    for (var i = 0; i < p.L.length; i++) if (t >= p.L[i][0] && t < p.L[i][1] + 0.15) { hit = i; break; }
    for (var j = 0; j < el.children.length; j++) el.children[j].style.display = j === hit ? 'block' : 'none';
  },
};

export default [Vid, SplitLens, CardScene, CaseCard, TypedTag, Credit, RawCaptions];

// c1Captions.ts (generated from productions/gx-dashcam20/build/case1_captions.json): clip seconds [a, b, text]; bleeps as —.
export const C1CAP = {
  "raw_R1": [[0.58,1.52,"This is me."],[1.78,3.48,"— Christ."],[6.38,9.2,"Hey, don't do this. —"],[10,11.28,"Let's go, bro. Let's go."],[12.8,13.74,"Watch me go now."]],
  "raw_R2": [[0.44,1.7,"God, keep it going,"],[2.36,3.86,"'cause it's Good Friday."],[4.52,6.34,"And you know what? You — talk."],[6.34,8.14,"Get rid of all the coppers."],[8.68,10.36,"Let's go! Let's go!"],[11.18,12.38,"— enriched!"],[13.26,13.96,"I'm Jesus."],[14.52,15.86,"I'm descendants of God."]],
  "raw_R3": [[0.06,0.92,"Because ultimately,"],[1.78,3.4,"he'll give her an ultimatum."],[3.92,5.04,"Either listen to Gavin..."],[5.94,7.88,"or I, you're gonna go to hell."],[8.38,10.8,"They'll disown you, and so will I."],[11.3,12.12,"But they're glamorous."]],
  "raw_R4": [[0.06,1.2,"They're rightful ones."],[1.64,3.08,"That is meant to be."],[3.7,4.44,"Watch this."],[5.2,6.54,"Watch me go."],[7.24,8.98,"You —"],[9.34,10.26,"Watch this now."],[10.74,11.78,"I'm getting stronger"],[11.82,14.62,"and stronger by the second."]],
  "raw_R5": [],
  "raw_R6": [],
  "raw_R7": [[0.22,0.88,"Air priority."],[2.18,3.04,"Drive, drive, drive."]],
};
