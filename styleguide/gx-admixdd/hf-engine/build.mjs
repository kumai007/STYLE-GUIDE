// build.mjs - gx case table -> standalone HyperFrames project.  Usage: node build.mjs case12 [--no-assets]
// Writes parts/<id>/{index.html, hyperframes.json, meta.json, assets/{fonts,stills,media->hf-engine/media/<media>}}.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const GX = createRequire(import.meta.url)('./lib/gx.js');
const ENGINE_PUBLIC = process.env.GX_ENGINE_PUBLIC || path.resolve(HERE, 'media'); // env: scratch copies of hf-engine
const id = process.argv[2] || 'case12';
const noAssets = process.argv.includes('--no-assets');
const CASE = (await import(pathToFileURL(path.join(HERE, 'cases', `${id}.mjs`)))).default;
const DEV = {};
for (const m of ['shared', ...CASE.devices.filter((d) => d !== 'shared')]) {
  for (const d of (await import(pathToFileURL(path.join(HERE, 'devices', `${m}.mjs`)))).default) DEV[d.name] = d;
}
const OUT = path.join(HERE, 'parts', id);
const ASSETS = path.join(OUT, 'assets');
const F = GX.F, TOTAL = F(CASE.end);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---- shot windows (Case*.tsx C*_SHOTS / Intro TIMELINE): start = F(c) - floor(n/2); end = F(to) + ceil(next.n/2) if next is not hard/slab.
// Out-transition (V7Trans outK/outN): s.outK/s.outN, or s.dipOut (Case1: 'dip' over dipOut f), or CASE.outFromNext (Intro: outK = next k).
const shots = CASE.shots.map((s, i) => {
  const nx = CASE.shots[i + 1];
  const nxSoft = nx && nx.k !== 'hard' && nx.k !== 'slab';
  const start = Math.max(0, F(s.c) - Math.floor(s.n / 2));
  const end = Math.min(F(s.to) + Math.ceil((nxSoft ? nx.n : 0) / 2), TOTAL);
  let outK = s.outK, outN = s.outN ?? 0;
  if (!outK && s.dipOut) { outK = 'dip'; outN = s.dipOut; }
  if (!outK && CASE.outFromNext && nxSoft) { outK = nx.k; outN = nx.n; }
  return { ...s, i, start, end, len: end - start, outK, outN };
});
// V7Trans seed per shot: Case1 `c1t${i}`, Case12 `c12t${i}`, Intro `tr${i}` (CASE.tseed overrides).
const TSEED = CASE.tseed ?? (/^case(\d+)/.test(id) ? `c${+id.match(/^case(\d+)/)[1]}t` : 'tr');
const TKINDS = new Set(['hard', 'dissolve', 'glitch', 'push', 'dip', 'slab']);

// ---- media durations (ffprobe) for the window check
const durCache = {};
const mediaDur = (rel) => durCache[rel] ??= +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(ENGINE_PUBLIC, CASE.media, rel)]).toString().trim();
const problems = [];
const stills = [];
let track = 1, uid = 0;

function makeCtx(shot, win) {
  const ctx = {
    shot, win, dur: shot.len / 60, esc,
    id: (p = 'e') => `${p}${++uid}`,
    dev: (name, p) => `data-dev="${name}" data-p="${esc(JSON.stringify(p))}"`,
    node: (nd, w) => renderNode(nd, w ? makeCtx(shot, w) : ctx),
    kids: (nd, w) => (nd.k || []).map((k) => renderNode(k, w ? makeCtx(shot, w) : ctx)).join(''),
    /** <video> for local window [w0, w1) of the shot; Remotion time = (round(trim*60) + f*speed)/60. */
    // fit/pos: object-fit / object-position override (default contain, as OffthreadVideo letterboxes); style: extra inline CSS.
    video: ({ src, trim = 0, speed = 1, vol = 0, maxFrame = Infinity, fit, pos, style }) => {
      const w0 = win[0], w1 = Math.min(win[1], maxFrame + 1);
      if (w1 <= w0) return '';
      const ms = (Math.round(trim * 60) + w0 * speed) / 60, d = (w1 - w0) / 60;
      const srcEnd = ms + d * speed, md = mediaDur(`${src}.mp4`);
      if (srcEnd > md + 1e-6) problems.push(`${shot.name}: ${src} needs ${srcEnd.toFixed(3)} s > ${md} s`);
      const audio = vol > 0 ? `data-has-audio="true" data-volume="${vol}"` : 'muted';
      return `<video id="${ctx.id('v')}" class="clip vid" src="assets/media/${src}.mp4" data-start="${((shot.start + w0) / 60).toFixed(6)}" data-duration="${d.toFixed(6)}" data-media-start="${ms.toFixed(6)}"${speed !== 1 ? ` data-playback-rate="${speed}"` : ''} data-track-index="${track++}" ${audio}${fit || pos || style ? ` style="${fit ? `object-fit:${fit};` : ''}${pos ? `object-position:${pos};` : ''}${style || ''}"` : ''} playsinline></video>`;
    },
    /** freeze still: source frame index (60 fps) -> assets/stills/<src>_<n>.png (extracted at build). */
    still: (src, n) => { const f = `${src}_${Math.round(n)}.png`; stills.push({ src, n: Math.round(n), f }); return `assets/stills/${f}`; },
  };
  return ctx;
}
function renderNode(nd, ctx) {
  if (Array.isArray(nd)) return nd.map((x) => renderNode(x, ctx)).join('');
  if (nd.raw !== undefined) return nd.raw;
  const d = DEV[nd.d];
  if (!d) throw new Error(`unknown device ${nd.d}`);
  return d.html(nd.p || {}, ctx, nd);
}

// ---- body
let body = '';
for (const s of shots) {
  const ctx = makeCtx(s, [0, s.len]);
  // V7Trans <Trans>: body (SlabIn for k 'slab') -> outK wrapper (push/dip) -> inK wrapper (dissolve/glitch/push). Same nesting as the TSX.
  if (!TKINDS.has(s.k)) throw new Error(`unknown transition ${s.k} (shot ${s.name})`);
  const wrap = (d, p, el) => ({ d, p, k: Array.isArray(el) ? el : [el] });
  let el = s.el(s.len / 60);
  if (s.k === 'slab') el = wrap('SlabIn', {}, el);
  if (s.outK === 'push') el = wrap('PushOut', { n: s.outN, len: s.len }, el);
  if (s.outK === 'dip') el = wrap('DipOut', { n: s.outN, len: s.len }, el);
  if (s.k === 'dissolve') el = wrap('Dissolve', { n: s.n }, el);
  if (s.k === 'glitch') el = wrap('GlitchIn', { n: s.n, seed: `${TSEED}${s.i}` }, el);
  if (s.k === 'push') el = wrap('PushIn', { n: s.n }, el);
  body += `<div class="af" data-shot="${esc(s.name)}" data-s="${s.start}" data-e="${s.end}">${renderNode(el, ctx)}</div>\n`;
}
for (const o of CASE.overlays || []) {
  const s = { name: o.name, start: F(o.at), end: F(o.at) + Math.max(1, F(o.to) - F(o.at)) };
  s.len = s.end - s.start;
  body += `<div class="af" data-shot="${esc(o.name)}" data-s="${s.start}" data-e="${s.end}">${renderNode(o.el(), makeCtx(s, [0, s.len]))}</div>\n`;
}
const film = { name: 'film', start: 0, end: TOTAL, len: TOTAL };
const filmHtml = `<div class="af" data-shot="film" data-s="0" data-e="${TOTAL}">${DEV.Film.html({}, makeCtx(film, [0, TOTAL]))}</div>`;
let audio = '';
CASE.vo.starts.forEach((v, i) => {
  audio += `<audio id="vo${i + 1}" class="clip" src="assets/media/${CASE.vo.file(i)}" data-start="${(F(v) / 60).toFixed(6)}" data-duration="${((F(CASE.vo.lens[i]) + CASE.vo.tail) / 60).toFixed(6)}" data-track-index="${track++}" data-volume="1"></audio>\n`;
});

// raw-sound tracks (Case1 AU): Remotion volume(f) -> HF volume lane (per-frame values, collinear points dropped = exact breakpoints).
// lvl = interpolate(t, [up, up+r, down-r, down], [0, g, g, g*DB24], clamp) * interpolate(t, [to-r, to], [1, 0], clamp); t = at + f/60.
for (const a of CASE.audio || []) {
  const n = F(a.to) - F(a.at), r = 5 / 60, cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
  const vol = (f) => { const t = a.at + f / 60; return GX.interpolate(t, [a.up, a.up + r, a.down - r, a.down], [0, a.g, a.g, a.g * 0.063], cl) * GX.interpolate(t, [a.to - r, a.to], [1, 0], cl); };
  const pts = [];
  // a.lane = [[t (s from clip start), v], ...] overrides the raw envelope (music beds); a.file = media file (default <src>.mp4).
  if (a.lane) a.lane.forEach(([t, v]) => pts.push({ f: Math.round(t * 60), v }));
  else for (let f = 0; f < n; f++) {
    const v = +vol(f).toFixed(6);
    if (pts.length >= 2) { const p1 = pts[pts.length - 1], p0 = pts[pts.length - 2]; if (Math.abs((p1.v - p0.v) * (f - p1.f) - (v - p1.v) * (p1.f - p0.f)) < 1e-9) pts.pop(); }
    pts.push({ f, v });
  }
  if (pts.length > 512) throw new Error(`audio ${a.src}: ${pts.length} lane points > 512`);
  const lane = JSON.stringify({ version: 1, lanes: [{ target: 'volume', points: pts.map((p) => ({ t: +(p.f / 60).toFixed(6), v: p.v })) }] });
  const ms = a.trim ? F(a.trim) / 60 : 0;
  const afile = a.file ?? `${a.src}.mp4`;
  if (ms + n / 60 > mediaDur(afile) + 1e-6) problems.push(`audio ${a.src}: needs ${(ms + n / 60).toFixed(3)} s > ${mediaDur(afile)} s`);
  audio += `<audio id="${a.id || `au_${a.src}`}" class="clip" src="assets/media/${afile}" data-start="${(F(a.at) / 60).toFixed(6)}" data-duration="${(n / 60).toFixed(6)}" data-media-start="${ms.toFixed(6)}" data-track-index="${track++}" data-volume="1" data-automation="${esc(lane)}"></audio>
`;
}

const fontFace = (f) => {
  if (f.startsWith('Archivo')) return `@font-face{font-family:'Archivo';src:url(assets/fonts/${f}) format('woff2');font-weight:100 900;font-stretch:62% 125%}`;
  if (f.startsWith('IBMPlexMono')) return `@font-face{font-family:'IBM Plex Mono';src:url(assets/fonts/${f}) format('woff2');font-weight:500}`;
  const fam = f.startsWith('VT323') ? 'VT323' : f.startsWith('SpecialElite') ? 'Special Elite' : f.startsWith('CourierPrime') ? 'Courier Prime' : f.startsWith('Michroma') ? 'Michroma' : 'Share Tech Mono';
  return `@font-face{font-family:'${fam}';src:url(assets/fonts/${f}) format('woff2');font-weight:${f.includes('700') ? 700 : 400}}`;
};
const renders = Object.values(DEV).filter((d) => d.render).map((d) => `GX.devs[${JSON.stringify(d.name)}] = ${d.render.toString()};`).join('\n');
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<!-- GENERATED by hf-engine/build.mjs from cases/${id}.mjs - edit the case table / devices, then rebuild. -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
${CASE.fonts.map(fontFace).join('\n')}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#050607}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background-color:#050607}
.af{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100%;display:flex;flex-direction:column}
.vid{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block}
</style></head><body>
<div id="root" data-composition-id="main" data-fps="60" data-start="0" data-duration="${(TOTAL / 60).toFixed(6)}" data-width="1920" data-height="1080">
${DEV.Film && (await import(pathToFileURL(path.join(HERE, 'devices', 'shared.mjs')))).FILM_DEFS}
<div class="af" id="shots"${CASE.plain ? '' : ' style="filter:url(#v6film)"'}>
${body}</div>
${CASE.plain ? '' : filmHtml}
${audio}</div>
<script>
${fs.readFileSync(path.join(HERE, 'lib', 'gx.js'), 'utf8')}
${renders}
(function () {
  var DUR = ${(TOTAL / 60).toFixed(6)}, tl = gsap.timeline({ paused: true }), o = { t: 0 };
  tl.to(o, { t: DUR, duration: DUR, ease: 'none', onUpdate: function () { GX.render(tl.time()); } }, 0);
  window.addEventListener('hf-seek', function (e) { GX.render(e.detail.time); });
  window.__timelines = window.__timelines || {};
  window.__timelines["main"] = tl;
  GX.render(0);
})();
</script></body></html>
`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'index.html'), html);
if (!fs.existsSync(path.join(OUT, 'hyperframes.json'))) fs.writeFileSync(path.join(OUT, 'hyperframes.json'), JSON.stringify({ paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: false }, authoringSkill: 'hyperframes' }, null, 2));
if (!fs.existsSync(path.join(OUT, 'meta.json'))) fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ id, name: id }, null, 2));
if (!noAssets) {
  fs.mkdirSync(path.join(ASSETS, 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(ASSETS, 'stills'), { recursive: true });
  for (const f of CASE.fonts) fs.copyFileSync(path.join(HERE, 'fonts', f), path.join(ASSETS, 'fonts', f));
  const link = path.join(ASSETS, 'media');
  if (!fs.existsSync(link)) execFileSync('cmd', ['/c', 'mklink', '/J', link, path.join(ENGINE_PUBLIC, CASE.media)]);
  for (const s of stills) {
    const out = path.join(ASSETS, 'stills', s.f);
    if (!fs.existsSync(out)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(ENGINE_PUBLIC, CASE.media, `${s.src}.mp4`), '-vf', `select=eq(n\\,${s.n})`, '-frames:v', '1', out]);
  }
}
console.log(`${id}: ${shots.length} shots, ${track - 1} timed media, ${TOTAL} frames, ${stills.length} stills -> ${path.relative(HERE, OUT)}/index.html`);
if (problems.length) { console.log('MEDIA WINDOW PROBLEMS:\n' + problems.join('\n')); process.exitCode = 2; }
