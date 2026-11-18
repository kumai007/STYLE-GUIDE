// TEMPLATE ONLY (2026-11-18): coc2h-vol1 data is deleted; PROD/media paths below are dead. Copy the structure into a new case.
// coc_case09 - Case 9 "The ute in the floodwater" (dashcam, Heales Road, Sharon QLD, February 2018) of coc2h-vol1.
// House look = case 1 v11 (CASE_BRIEF.md), structure copied from coc_case06: berg card (BergX) + centred white title, v8 grade +
// eased 3-D camera on all footage, full-frame real pages (Paper, 5 PaperMv moves) with red #E0282A marks on the spoken words, print
// boards / freeze prints of real frames, raws with own sound + RSub + gentle 3-D push (CFoot raw), AbyGrade over the whole part, music8.
// One source (ADR = the driver's own upload, YouTube AyDeeRox, 70.6 s). Its burned-in date stamp (wrong clock "2014", top-left) is
// cropped out of all footage and clone-patched out of every still. Only 70 s of source: b-roll reuses it (slowed replays, freezes,
// boards, pages). Timing: narration/raw words.json (= the wavs in media/coc2h/vo); every shot starts on its anchor phrase.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { paperFrame } from '../devices/coc_v3.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(HERE, '..', 'media'), 'coc2h');
const PROD = 'C:/Users/ayush/Videos/CLAUDE/render farm video/productions/coc2h-vol1';
const r2 = (x) => Math.round(x * 100) / 100;
const LOG = [];
const SRC = 'c09/ADR', SW = 1906, SH = 1080, FPS = 359 / 12, SDUR = 70.59;
const CROP = [38, 48, 1831, 1030, SW, SH]; // 16:9 window below the date stamp (source x 14-356, y 16-42)
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

// ---------------------------------------------------------------- VO
const VOIDS = ['vo_047', 'vo_048', 'vo_049', 'vo_050', 'vo_051'];
const norm = (w) => String(w).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9']/g, '');
const VO = {};
for (const id of VOIDS) {
  const rel = `vo/${id}.wav`, wav = path.join(MED, rel), wj = path.join(PROD, 'narration', 'raw', `${id}.words.json`);
  if (!fs.existsSync(wav) || !fs.existsSync(wj)) throw new Error(`${id}: wav or words.json missing`);
  const words = JSON.parse(fs.readFileSync(wj, 'utf8')).words.map((w) => ({ w: norm(w.w), raw: String(w.w), t0: w.start, t1: w.end }));
  VO[id] = { id, words, len: dur(wav), rel };
}
function anchorT(id, phrase, from = 0) { // VO-local onset of the first match of `phrase` at word index >= from
  const W = VO[id].words, ph = phrase.split(/\s+/).map(norm);
  for (let i = from; i < W.length; i++) if (ph.every((p, k) => W[i + k] && W[i + k].w === p)) return { i, t: W[i].t0 };
  throw new Error(`${id}: anchor "${phrase}" not found`);
}

// ---------------------------------------------------------------- raws (source s; ADR_words.json, farm Whisper medium.en)
// job.json cue_40..43. Source 0-10.34 = the other caller's voice (never used). Subs: hand-checked Whisper lines, profanity bleeped
// (mute + 1 kHz tone) and written with a dash. Picture tail runs under the next VO (ducked -24 dB); cut = source s after which the
// raw sound is muted (next raw's words / the driver's last line at 65.92).
const RAWS = {
  vo_047: { id: 'R1 cue_40', a: 10.4, b: 22.45, tail: 0.6, cut: 22.5, bleep: [[19.84, 20.52]], subs: [
    [13.32, 14.0, 'Wow.'], [15.14, 15.62, 'Whoa.'], [19.16, 20.52, 'Oh, f—.']] },
  vo_048: { id: 'R2 cue_41', a: 22.5, b: 37.8, tail: 0.6, cut: 37.8, bleep: [[24.58, 25.02], [32.38, 33.06], [34.48, 34.9], [37.4, 37.76]], subs: [
    [22.58, 27.04, "Ah, yeah, I've just f—ing crashed into a river, dude."],
    [32.38, 36.68, "F— my car is just f—ing gone, dude. I'm in a river."], [36.68, 37.76, "I'm f—ed."]] },
  vo_049: { id: 'R3 cue_42', a: 37.8, b: 50.0, tail: 0.6, bleep: [[39.95, 40.5], [45.86, 46.54]], subs: [
    [39.5, 40.5, "I'm f—ed."], [45.86, 48.54, "F— the water's coming into my car."], [48.54, 49.9, 'See ya.']] },
  vo_050: { id: 'R4 cue_43', a: 50.0, b: 65.85, tail: 1.2, cut: 65.88, bleep: [], subs: [] }, // river noise only
};
// raw loudness: integrated LUFS of each window -> gain to -29 LUFS (just under the VO ref -28.3, playbook: within +-3 LU)
const lufs = (a, b) => { const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-ss', String(a), '-t', String(b - a), '-i', path.join(MED, `${SRC}.mp4`), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8' }).stderr; const m = [...e.matchAll(/I:\s+(-?[\d.]+) LUFS/g)]; return m.length ? +m[m.length - 1][1] : -20; };

// ---------------------------------------------------------------- shot plan: [anchor phrase, spec] per VO
// f = graded footage from source t (sp = playback speed, slowed replays), fz = freeze print, pg = page (mk = [first, last] spoken
// word of the marked phrase), bd = print board, place = place line. Source: 0-12 wet road, ~12 sign, ~16 flooded dip, 18-21 wave
// over the glass, 22-37 swept sideways toward the trees, 37-41 trunk dead ahead, ~41 notice slides onto the dash, 41-70 pinned.
const PLAN = {
  vo_047: [
    ['heales road is a narrow', { pg: 'P6', mk: ['heales', 'road'], alt: { f: 0.5 } }],
    ['a rural spot about', { f: 0.5, place: 'SHARON, QUEENSLAND' }],
    ['the burnett river forms', { bd: { hero: 64.0, items: [2.0, 30.0, 45.0, 6.0] } }],
    ['the whole district had', { f: 5.0, sp: 0.6 }],
    ['a man from sydney', { fz: 2.0 }],
    ['the ute is white', { f: 6.0 }],
    ['it was about three', { f: 3.0, sp: 0.7 }],
    ['and he was chatting', { bd: { hero: 8.0, items: [2.0, 0.5, 12.5, 6.0] } }],
    ["we can't give you", { f: 7.0, sp: 0.6 }],
    ['when the papers caught', { fz: 4.0 }],
    ['the date stamp in', { f: 0.0, sp: 0.35 }],
    ['the road is wet', { f: 2.5, join: true }], // runs straight into R1 (source 10.4)
  ],
  vo_048: [
    ['nobody had told him', { fz: 15.5 }],
    ['and the water was hidden', { f: 13.5, sp: 0.6 }],
    ['a farmer whose land', { bd: { hero: 16.5, items: [12.5, 19.5, 2.0, 30.0] } }],
    ['adrian came over the ridge', { f: 15.0, sp: 0.7 }],
    ['around eighty kilometres', { f: 4.0 }],
    ['it was still far', { fz: 17.5 }],
    ['when the wave clears', { f: 19.5, sp: 0.6 }],
    ['the current has it', { bd: { hero: 28.0, items: [24.0, 33.0, 35.0, 19.0] } }],
    ['the call is still connected', { fz: 21.0 }],
  ],
  vo_049: [
    ['his car was moving', { f: 26.0, sp: 0.7 }],
    ['in the description under', { bd: { hero: 40.5, items: [37.5, 33.0, 45.0, 28.0] } }],
    ['as the trunk comes up', { fz: 35.5 }],
  ],
  vo_050: [
    ['once the ute was pinned', { f: 42.0, sp: 0.8 }],
    ['adrian got himself out', { pg: 'P1', mk: ['got', 'roof'], alt: { fz: 44.0 } }],
    ['behind him the dashcam', { bd: { hero: 55.0, items: [45.0, 62.0, 41.5, 66.0] } }],
  ],
  vo_051: [
    ['he stayed up there', { f: 52.0, sp: 0.6 }],
    ['until a swiftwater rescue', { fz: 60.0 }],
    ['there was no helicopter', { f: 66.9, sp: 0.6 }],
    ['the farmer told him', { pg: 'P3', mk: ['every', 'river'], alt: { fz: 58.0 } }],
    ['the following wednesday', { pg: 'P4', mk: ['following', 'off'], alt: { fz: 63.0 } }],
    ['the clip itself spread', { bd: { hero: 19.0, items: [41.5, 55.0, 12.5, 30.0] } }],
    ['but the earliest copy', { f: 1.0, sp: 0.8 }],
    ['speaking to the abc', { f: 45.0, sp: 0.7 }],
    ['because if you let', { pg: 'P2', mk: ['if', 'there'], alt: { fz: 52.0 } }],
    ["the state's emergency services", { f: 7.5, sp: 0.8 }],
    ["if it's flooded", { pg: 'P5', mk: ['if', 'it'], alt: { f: 68.0, sp: 0.6 }, end: 1 }],
  ],
};

// ---------------------------------------------------------------- timeline
const CARD = 4.97, VO0 = 3.33; // case 1: VO (spoken title) starts 3.33 s into the berg card, card ends 4.97
const O = {}, RAWAT = {};
{
  let t = VO0;
  for (const id of VOIDS) {
    O[id] = r2(t);
    t += VO[id].len;
    const R = RAWS[id];
    if (R) { RAWAT[id] = r2(t + 0.35); t = RAWAT[id] + (R.b - R.a); }
    else t += 0.8;
  }
}
const lastVO = VOIDS[VOIDS.length - 1], END = r2(O[lastVO] + VO[lastVO].len + 3.0);

// ---------------------------------------------------------------- pages (E/media/coc2h/c09/pages[/art]); missing -> alt spec
const PGD = path.join(MED, 'c09', 'pages');
const pngWH = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const xywh = (b) => (b && b.length === 4 ? [b[0], b[1], b[0] + b[2], b[1] + b[3]] : undefined);
function pageInfo(id) {
  const aj = path.join(PGD, 'art', `${id}.json`), A = fs.existsSync(aj) ? JSON.parse(fs.readFileSync(aj, 'utf8')) : null;
  const png = path.join(PGD, A ? 'art' : '', `${id}.png`), js = path.join(PGD, `${id}.json`);
  if (!fs.existsSync(png) || !fs.existsSync(js)) return null;
  const J = JSON.parse(fs.readFileSync(js, 'utf8'));
  const lines0 = Array.isArray(J.lines) && J.lines.length ? J.lines : null;
  if (!lines0) { LOG.push(`${id} has no lines -> alt`); return null; }
  const sh = (b) => (b && A ? [b[0], b[1] + A.dy, b[2], b[3] + A.dy] : b);
  const [iw, ih] = pngWH(png);
  // private boxes: keep every box that reaches below the art cut T (P1's driver photo starts above T), clipped to T
  const names = (J.private_names_bboxes || []).map(xywh).filter((b) => b && (!A || b[3] > A.T)).map((b) => (A ? [b[0], Math.max(b[1], A.T), b[2], b[3]] : b)).map(sh);
  return { id, png, J, iw, ih, A, lines: lines0.map(sh), key: sh(xywh(J.key_bbox)), names, rel: `assets/media/c09/pages/${A ? 'art/' : ''}${id}.png` };
}
function mosaic(png, n, s) {
  const x = Math.max(0, Math.round(n[0] - 6)), y = Math.max(0, Math.round(n[1] - 6)), w = Math.round(n[2] - n[0] + 12), h = Math.round(n[3] - n[1] + 12), b = 24 / s;
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-vf', `crop=${w}:${h}:${x}:${y},scale=${Math.max(1, Math.round(w / b))}:${Math.max(1, Math.round(h / b))}:flags=area,scale=${w}:${h}:flags=neighbor`, '-f', 'image2pipe', '-vcodec', 'png', '-']);
  return { x, y, w, h, src: `data:image/png;base64,${buf.toString('base64')}` };
}
function markFor(id, c, to, mk) { // mk = [first spoken word, last spoken word] of the phrase the page line says
  const W0 = VO[id].words.map((w) => ({ ...w, T0: w.t0 + O[id], T1: w.t1 + O[id] })).filter((w) => w.T0 >= c - 0.6 && w.T0 < to);
  const a = W0.find((w) => w.w === norm(mk[0])), b = a && W0.find((w) => w.T0 >= a.T0 && w.w === norm(mk[1]));
  if (!a || !b) { LOG.push(`WARN ${id} MARK MISS ${mk}`); return null; }
  return { at: Math.max(4, Math.round((a.T0 - 0.2 - c) * 60)), n: Math.round(Math.min(5, Math.max(1.0, b.T1 - a.T0)) * 60) };
}
let pgV = 4; // PaperMv mode cycle

// ---------------------------------------------------------------- freezes, boards (case 1 SBoard templates)
// stills: native frame, date stamp clone-patched with the sky band right under it
const STILLD = path.join(HERE, '..', 'parts', 'coc_case09', 'assets', 'stills');
fs.mkdirSync(path.join(STILLD, 'c09'), { recursive: true });
const preStill = (n) => { const out = path.join(STILLD, `${SRC}_${n}.png`); if (!fs.existsSync(out)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', (n / FPS).toFixed(4), '-i', path.join(MED, `${SRC}.mp4`), '-frames:v', '1', '-vf', 'split[a][b];[b]crop=380:50:0:50[s];[a][s]overlay=0:0', out]); };
const fz = (t) => { const n = Math.round(t * FPS); preStill(n); return { key: `R_${t}`, ar: SW / SH, p: { still: [SRC, n] } }; };
const FZT = [2.0, 6.0, 9.0, 12.5, 16.8, 19.0, 21.5, 26.0, 30.0, 34.0, 38.5, 41.5, 45.0, 52.0, 58.0, 63.0, 68.0];
const FZ = FZT.map(fz);
const BW = 5400, BH = 3200;
const SLOTS = [[1250, 850], [2700, 780], [4150, 900], [1950, 1620], [3450, 1650], [1300, 2380], [2700, 2420], [4100, 2330]];
function rnd(seed) { let h = 7; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0; return () => { h = (Math.imul(h, 1103515245) + 12345) | 0; return ((h >>> 0) % 10000) / 10000; }; }
const place = (item, cx, cy, hgt, rot, extra = {}) => { const w = (hgt - 18) * item.ar + 18; return { ...item.p, x: r2(cx - w / 2), y: r2(cy - hgt / 2), w: r2(w), h: hgt, rot: r2(rot), seed: item.key, ...extra }; };
const TPL = [
  { n: 'glide R', hs: [4, 2], cam: (h) => [[0, h[0] - 1500, h[1] + 40, 0.82], [18, h[0] - 1500, h[1] + 40, 0.82], [210, h[0], h[1], 0.82]], drift: [6, 0, 0.003] },
  { n: 'hero lift + push', hs: [3, 4], cam: (h, L) => [[0, h[0], h[1], 0.74], [L, h[0], h[1], 0.8]], lift: 30, drift: [0, 0, 0.002] },
  { n: 'pull-out', hs: [3, 6], cam: (h) => [[0, h[0], h[1], 1.5], [200, h[0], h[1], 0.86]], drift: [0, 0, 0.003] },
  { n: 'glide down', hs: [6, 5], cam: (h) => [[0, h[0] + 60, h[1] - 1450, 0.8], [18, h[0] + 60, h[1] - 1450, 0.8], [210, h[0], h[1], 0.8]], drift: [0, 5, 0.003] },
  { n: 'slide-in', hs: [3, 1], cam: (h, L) => [[0, h[0] - 120, h[1] + 30, 0.84], [L, h[0] + 80, h[1], 0.86]], slide: { at: 10, n: 100, dx: 900, dy: -140, r0: 9, ry: -9 }, drift: [0, 0, 0.002] },
  { n: 'diagonal', hs: [7, 6], cam: (h) => [[0, h[0] - 1350, h[1] - 1000, 0.8], [18, h[0] - 1350, h[1] - 1000, 0.8], [210, h[0], h[1], 0.84]], drift: [4, 3, 0.003] },
];
let bdI = 2;
function boardShot(name, L, o) {
  const T = TPL[bdI % TPL.length], hs = T.hs[Math.floor(bdI / TPL.length) % T.hs.length], R = rnd(name);
  bdI++;
  const H = fz(o.hero), own = (o.items || []).map(fz), pool = FZ.filter((q) => q.key !== H.key && !own.some((x) => x.key === q.key));
  let j = Math.floor(R() * pool.length);
  const prints = [];
  SLOTS.forEach(([x, y], s) => {
    if (s === hs) return;
    const q = own.length ? own.shift() : pool[j++ % pool.length], sg = R() < 0.5 ? -1 : 1;
    prints.push(place(q, x + (R() - 0.5) * 160, y + (R() - 0.5) * 120, Math.round(520 + R() * 80), sg * (6 + R() * 6), s % 3 === 1 ? { par: 0.03 } : {}));
  });
  const hx = SLOTS[hs], hr = (R() < 0.5 ? -1 : 1) * (2 + R() * 2);
  const extra = T.lift ? { lift: T.lift } : T.slide ? { hero: true, slide: { ...T.slide, dx: T.slide.dx * (hx[0] > 2700 ? -1 : 1) } } : { hero: true };
  prints.push(place(H, hx[0], hx[1], 680, hr, { ...extra, par: 0.06 }));
  LOG.push(`${name} BOARD ${T.n} hero ${o.hero}`);
  return { d: 'SBoard', p: { bw: BW, bh: BH, prints, cam: T.cam(hx, L), drift: T.drift } };
}

// ---------------------------------------------------------------- footage moves (case 1 v7 cycle)
const MOVES = [
  { a: [1.12, 0, -5, -1.5, 0], b: [1.17, 0, 1, 1.5, 0] },
  { a: [1.17, 4, 0, 0, 1.2], b: [1.10, -1, 0, 0, -1.2], ez: 'sym' },
  { a: [1.12, 0, 5, 1.5, 0], b: [1.17, 0, -1, -1.5, 0] },
  { a: [1.11, -4, 0, 0, -1.2], b: [1.17, 1, 0, 0, 1.2], ez: 'sym' },
  { a: [1.17, 3, -4, -1.2, 1.0], b: [1.11, 0, 1, 1.2, -0.6] },
  { a: [1.13, -3, 4, 1.2, -1.0], b: [1.17, 0, -1, -1.2, 0.6], ez: 'sym' },
];
let mvI = 2;
function srcT(t, need, name) { // keep [t, t + need] inside the source
  if (t + need + 0.1 <= SDUR) return t;
  const t2 = r2(Math.max(0, SDUR - need - 0.1));
  LOG.push(`${name}: footage ${t} -> ${t2} (source end)`);
  return t2;
}

// ---------------------------------------------------------------- build shots
const shots = [], audio = [], overlays = [];
const TSH = 'text-shadow:0 3px 6px rgba(0,0,0,0.85),0 6px 22px rgba(0,0,0,0.6)', CT = 460;
const firstCut = r2(O.vo_047 + anchorT('vo_047', PLAN.vo_047[0][0]).t - 0.05);
const cardTo = Math.max(CARD, firstCut);
{
  const cardF = Math.round(cardTo * 60);
  const title = { d: 'BTitle', p: { soft: [60, 102], back: { top: CT - 70, h: 300 }, lines: [
    { t: 'CASE 09', size: 30, top: CT, color: '#FFFFFF', track: 0.3, weight: 700, shadow: TSH },
    { t: 'THE UTE IN THE FLOODWATER', size: 62, top: CT + 44, color: '#FFFFFF', track: 0.03, shadow: TSH },
    { t: 'SHARON, QUEENSLAND · FEBRUARY 2018', size: 30, top: CT + 128, color: '#FFFFFF', track: 0.1, weight: 600, shadow: TSH },
  ] } };
  const berg = { d: 'BergX', p: { img: 'assets/media/berg.jpg', iw: 1920, ih: 4118, wl: 1191, cam: [[0, 1000, 1.0]], zoom: [0, cardF, 1.0, 1.06], dark: [1.0, 1.0],
    tilt: { a: [1.06, 4, 0, 0, 0], b: [1.06, 2.5, 0, 0, 0] }, fade: { in: [0, 30] } }, k: [title] };
  shots.push({ name: 'card', c: 0, to: cardTo, k: 'hard', n: 0, el: () => [{ d: 'Black' }, berg] });
}

const endFade = (nodes, c) => [{ d: 'Fade3', p: { out: [Math.round((END - c) * 60) - 48, Math.round((END - c) * 60)] }, k: nodes }];
function specNodes(sp, name, c, to) {
  sp = { ...sp };
  const L = Math.round((to - c) * 60);
  if (sp.pg) {
    const P = pageInfo(sp.pg);
    if (P && P.key) {
      const p = { img: P.rel, iw: P.iw, ih: P.ih, key: P.key, lines: P.lines, hold: false, mark: markFor(sp.vo, c, to, sp.mk),
        top: P.A ? [P.A.hx0, 20, P.A.hx1, P.A.hh] : undefined, headFit: !!P.A, v: pgV++ };
      p.mz = P.names.map((b) => mosaic(P.png, b, paperFrame(p).s));
      LOG.push(`${name} PAGE ${sp.pg}${p.mz.length ? ` (${p.mz.length} mosaics)` : ''}${p.mark ? ` mark at ${(c + p.mark.at / 60).toFixed(2)}` : ''}`);
      const nodes = [{ d: 'Paper', p }];
      return { nodes: sp.end ? endFade(nodes, c) : nodes, page: 1 };
    }
    LOG.push(`WARN ${name} page ${sp.pg} missing -> alt`);
    return specNodes({ ...sp.alt, vo: sp.vo, end: sp.end }, name, c, to);
  }
  if (sp.bd) return { nodes: [boardShot(name, L + 24, sp.bd)] };
  if (sp.fz !== undefined) {
    // plays ~75 f, then dissolves into a B&W print of that frame (case 1 SFz)
    const at = 75, t = srcT(sp.fz, at / 60 + 0.3, name), n = Math.round((t + at / 60) * FPS);
    preStill(n);
    return { nodes: [{ d: 'SFz', p: { src: SRC, n, sw: SW, sh: SH, at, rot: (bdI + mvI) % 2 ? 1.4 : -1.6,
      video: { d: 'CFoot', p: { src: SRC, t, crop: CROP, mode: 'cover', mv: { a: [1.10, 0, -3, -1, 0], b: [1.13, 0, -1.5, 0, 0], ez: 'sym' } } } } }] };
  }
  // footage (sp = speed; join = ends exactly where the next raw starts in the source)
  const spd = sp.sp || 1, need = (to - c) * spd;
  const t = sp.join ? r2(RAWS[sp.vo].a - need) : srcT(sp.f, need + (sp.end ? 0 : 0.3), name);
  const ft = { d: 'CFoot', p: { src: SRC, t, ...(spd !== 1 ? { speed: spd } : {}), crop: CROP, mode: 'cover', mv: MOVES[mvI++ % MOVES.length] } };
  const nodes = sp.end ? endFade([ft], c) : [ft];
  if (sp.place) nodes.push({ d: 'WTitle', p: { lines: [{ t: sp.place, size: 34, top: 900, track: 0.06 }], left: 96, at: 20, out: L - 60 } });
  LOG.push(`${name} src ${t}-${r2(t + need)}${spd !== 1 ? ` x${spd}` : ''}`);
  return { nodes };
}

let pageSec = 0, prevK = 'hard';
let cur = cardTo; // start of the next non-raw shot
const DUCK = [];
for (const id of VOIDS) {
  const plan = PLAN[id];
  let from = 0;
  const cuts = plan.map(([ph]) => { const a = anchorT(id, ph, from); from = a.i + 1; return { t: r2(O[id] + a.t - 0.05), i: a.i }; });
  const R = RAWS[id], stretchEnd = R ? RAWAT[id] : END;
  plan.forEach(([ph, sp], j) => {
    const c = j === 0 ? cur : cuts[j].t, to = j + 1 < plan.length ? cuts[j + 1].t : r2(stretchEnd);
    if (to - c < 3.0 - 1e-6) LOG.push(`WARN ${id} "${ph}" only ${(to - c).toFixed(2)} s`);
    const prevW = VO[id].words[cuts[j].i - 1];
    const beat = !prevW || /[.,;:!?]["”']?$/.test(prevW.raw);
    let k = j === 0 ? (shots.length === 1 ? 'dissolve' : shots[shots.length - 1].raw ? 'hard' : prevK === 'hard' ? 'dissolve' : 'hard')
      : !beat ? (prevK === 'dissolve' ? 'hard' : 'dissolve') : prevK === 'hard' ? 'dissolve' : 'hard';
    prevK = k;
    const name = `${id.slice(3)}.${j + 1} ${ph}`;
    const out = specNodes({ ...sp, vo: id }, name, c, to);
    if (out.page) pageSec += to - c;
    shots.push({ name, c, to, k, n: k === 'dissolve' ? 24 : 0, el: () => out.nodes });
  });
  if (!R) { cur = r2(stretchEnd); continue; }
  // raw: hard cut in; picture runs `tail` s under the next VO (ducked -24 dB, muted after R.cut); gentle 3-D push (CFoot raw)
  const c = RAWAT[id], nxt = VOIDS[VOIDS.indexOf(id) + 1], nv = O[nxt];
  const to = r2(nv + R.tail);
  const srcEnd = R.a + (to - c);
  if (srcEnd > SDUR - 0.05) throw new Error(`${R.id} runs past the source end`);
  const loc = (s) => Math.round((s - R.a) * 60);
  const cues = R.subs.map(([a, b, tx]) => [tx, loc(a), loc(Math.max(b, a + 1.0))]);
  const L = Math.round((to - c) * 60);
  const el = [{ d: 'CFoot', p: { src: SRC, t: R.a, crop: CROP, mode: 'cover', raw: true } }];
  if (cues.length) el.push({ d: 'RSub', p: { cues } });
  el.push({ d: 'Crd1', p: { text: 'YouTube: AyDeeRox', at: 12, hold: Math.min(170, L - 18) } });
  shots.push({ name: `${R.id} RAW`, c, to, k: 'hard', n: 0, raw: true, el: () => el });
  prevK = 'hard';
  // raw sound: -29 LUFS, bleeps muted (+ 1 kHz tone), duck to -24 dB under the next VO, muted after R.cut, 0.1 s fade at the end
  const g = +Math.pow(10, (-29 - lufs(R.a, R.b)) / 20).toFixed(4), dk = r2(nv - c), len = r2(to - c), gd = +(g * 0.063).toFixed(4);
  let pts = [[0, 0], [0.08, g]];
  for (const [b0, b1] of R.bleep) { const u0 = r2(b0 - R.a), u1 = r2(b1 - R.a); pts.push([u0 - 0.03, g], [u0, 0], [u1, 0], [u1 + 0.03, g]); }
  if (dk < len) pts.push([dk - 0.05, g], [dk + 0.25, gd]);
  pts.push([len - 0.1, dk < len ? gd : g], [len, 0]);
  pts.sort((x, y) => x[0] - y[0]);
  if (R.cut !== undefined && R.cut - R.a < len) {
    const uc = r2(R.cut - R.a), gl = uc > dk + 0.25 ? gd : uc > dk ? g : (pts.filter((q) => q[0] <= uc - 0.06).pop() || [0, g])[1];
    pts = [...pts.filter((q) => q[0] < uc - 0.06), [r2(uc - 0.06), gl], [uc, 0], [len, 0]];
  }
  audio.push({ id: `raw_${VOIDS.indexOf(id) + 1}`, src: SRC, file: `${SRC}.mp4`, at: c, to, trim: R.a, lane: pts });
  for (const [b0, b1] of R.bleep) {
    const at = r2(c + b0 - R.a), L2 = r2(b1 - b0 + 0.02), gb = +(g * 1.6).toFixed(4);
    audio.push({ id: `bleep_${Math.round(at * 100)}`, src: 'bleep', file: 'c09/bleep.wav', at, to: r2(at + L2), trim: 0, lane: [[0, 0], [0.02, gb], [L2 - 0.02, gb], [L2, 0]] });
  }
  DUCK.push([c, Math.min(nv, to)]);
  LOG.push(`${R.id} ${c}-${to} src ${R.a}-${r2(srcEnd)} gain ${g}`);
  cur = to;
}
shots[shots.length - 1].to = END;

// ---------------------------------------------------------------- SFX (card only, case 1 code: SFX = VO ref -14 LU)
const SFXL = { sting_1: -27.6, whoosh_1: -23.1, subhit_1: -20.2 };
function sfx(name, at) {
  const g = +Math.pow(10, (-42.3 - SFXL[name]) / 20).toFixed(4), L = r2(dur(path.join(MED, 'sfx', `${name}.wav`)) - 0.02);
  audio.push({ id: `sfx_${name}_${Math.round(at * 100)}`, src: `sfx_${name}`, file: `sfx/${name}.wav`, at: r2(at), to: r2(at + L), trim: 0, lane: [[0, g], [Math.max(0.02, L - 0.05), g], [L, 0]] });
}
sfx('sting_1', 0.02); sfx('whoosh_1', 0.95); sfx('subhit_1', 1.68);

// ---------------------------------------------------------------- Tex texture over non-raw stretches (case 1)
{
  let st = null;
  for (let i = 0; i <= shots.length; i++) {
    const sh = shots[i];
    if (sh && !sh.raw) { if (!st) st = sh; continue; }
    if (!st) continue;
    const a = r2(st.c - st.n / 120), b = sh ? r2(sh.c) : END, Lf = Math.round(b * 60) - Math.round(a * 60), p = {};
    if (st.c === 0) p.fi = [60, 90]; else if (st.k === 'dissolve') p.fi = [0, st.n];
    if (!sh) p.fo = [Lf - 48, Lf];
    overlays.push({ name: `tex ${st.name}`, at: a, to: b, el: () => ({ d: 'Tex', p }) });
    st = null;
  }
}

// ---------------------------------------------------------------- music: case 9 -> music8 from 133 s (brief: bed NN mod 3, offset
// NN*37 mod 200), then music9 from 120 s when music8 runs out; levelled with case 1 musLane (VO ref -11 LU = -39.3, -3 LU under raws)
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
};
function musLane(file, trim, len, tgt, fin, fout, extra = []) {
  const S = stS(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  const stp = Math.max(0.5, Math.ceil((len / 470) * 10) / 10); // build.mjs: <= 512 lane points
  for (let u = 0; u < len; u += stp) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-36, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}
const duckAmt = (t) => Math.max(0, ...DUCK.map(([a, b]) => Math.min(1, (t - a) / 0.5, (b - t) / 0.5)));
const MUS = (at) => (u) => -39.3 - 3 * duckAmt(at + u);
const DX = (at) => DUCK.flatMap(([a, b]) => [a, a + 0.5, b - 0.5, b].map((t) => t - at));
{
  const M1 = 'music/music8.mp3', T1 = 133, L1 = Math.min(END, r2(dur(path.join(MED, M1)) - T1 - 0.5));
  audio.push({ id: 'mus1', src: 'mus1', file: M1, at: 0, to: L1, trim: T1, lane: musLane(M1, T1, L1, MUS(0), 0.3, L1 < END ? 3 : 2, DX(0)) });
  if (L1 < END) {
    const M2 = 'music/music9.mp3', T2 = 120, at = r2(L1 - 3), L2 = r2(END - at);
    audio.push({ id: 'mus2', src: 'mus2', file: M2, at, to: END, trim: T2, lane: musLane(M2, T2, L2, MUS(at), 3, 2, DX(at)) });
  }
}
overlays.push({ name: 'abyss grade + soft crt (v9)', at: 0, to: END, el: () => ({ d: 'AbyGrade', p: {}, k: [] }) });
LOG.push(`END ${END} s, pages ${pageSec.toFixed(1)} s = ${((pageSec / END) * 100).toFixed(1)} %`);
if (process.argv.includes('--log')) console.log(LOG.join('\n') + '\n' + shots.map((s) => `${s.name} | ${s.c}-${s.to} (${r2(s.to - s.c)}) ${s.k}`).join('\n'));

export default {
  id: 'coc_case09',
  media: 'coc2h',
  end: END,
  tseed: 'coc9t',
  plain: true,
  vo: { starts: VOIDS.map((id) => O[id]), lens: VOIDS.map((id) => VO[id].len), file: (i) => VO[VOIDS[i]].rel, tail: 0 },
  devices: ['shared', 'coc', 'coc_c01', 'coc_v3', 'coc_c01v3', 'coc_c01v4', 'coc_v4', 'coc_v9'],
  fonts: ['Archivo-var-latin.woff2', 'CourierPrime-700-latin.woff2', 'IBMPlexMono-500-latin.woff2'],
  shots,
  overlays,
  audio,
};
