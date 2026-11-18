// TEMPLATE ONLY (2026-11-18): coc2h-vol1 data is deleted; PROD/media paths below are dead. Copy the structure into a new case.
// coc_case08 - Case 8 "The last customer at Common Grounds" (police-released 4-channel CCTV, Anchorage AK, 1 February 2012) of coc2h-vol1.
// Copied from coc_case06 (house look = case 1 v11): berg card + centred white title, v8 grade + eased 3-D camera on all footage,
// full-frame real pages (Paper, 5 PaperMv moves) with red #E0282A marks on the spoken words, print boards / freeze prints of real
// frames, raws with the gentle 3-D push, AbyGrade over the whole part. One source (CGS, 1280x592, 6 fps, 2x2 grid in black pillars,
// SILENT): raws get synthetic room tone only and no music; b-roll is cropped per grid square (positions measured by code).
// Timing: VO words.json (narration/raw); every shot starts on the onset of its anchor phrase.
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
const SRC = 'c08/CGS', SW = 1280, SH = 592, FPS = 6, SDUR = 685.75;
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
// grid squares (source px): top row = inside cameras (dark after the lights go off ~123 s), bottom row = outside lot cameras.
// Left/right channel order by position only (never shown as text).
const CAM = {
  CH1: [[200, 4, 438, 292, SW, SH], 'cover'], CH2: [[640, 4, 438, 292, SW, SH], 'cover'],
  CH3: [[200, 298, 438, 292, SW, SH], 'cover'], CH4: [[640, 298, 438, 292, SW, SH], 'cover'],
  GRID: [[198, 0, 884, 592, SW, SH], 'fit'], IN: [[198, 0, 884, 296, SW, SH], 'cover'],
};

// ---------------------------------------------------------------- VO
const VOIDS = ['vo_042', 'vo_043', 'vo_044', 'vo_045', 'vo_046'];
const norm = (w) => String(w).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9']/g, '');
const VO = {};
for (const id of VOIDS) {
  const rel = `vo/${id}.wav`, wav = path.join(MED, rel), wj = path.join(PROD, 'narration', 'raw', `${id}.words.json`);
  if (!fs.existsSync(wav) || !fs.existsSync(wj)) throw new Error(`${id}: wav or words.json missing`);
  const words = JSON.parse(fs.readFileSync(wj, 'utf8')).words.map((w) => ({ w: norm(w.w), raw: String(w.w), t0: w.start, t1: w.end }));
  VO[id] = { id, words, len: dur(wav), has: true, rel };
}
function anchorT(id, phrase, from = 0) { // VO-local onset of the first match of `phrase` at word index >= from
  const W = VO[id].words, ph = phrase.split(/\s+/).map(norm);
  for (let i = from; i < W.length; i++) if (ph.every((p, k) => W[i + k] && W[i + k].w === p)) return { i, t: W[i].t0 };
  throw new Error(`${id}: anchor "${phrase}" not found`);
}

// ---------------------------------------------------------------- raws (job.json cue_36..39; source silent -> room tone, no music)
const RAWS = {
  vo_042: { id: 'R1 cue_36', a: 80.0, b: 102.0, tail: 0, cam: 'GRID' }, // tail 0: cue_37 continues from 102
  vo_043: { id: 'R2 cue_37', a: 102.0, b: 124.6, tail: 1.2, cam: 'GRID' }, // lights go off ~123
  vo_044: { id: 'R3 cue_38', a: 596.0, b: 616.0, tail: 1.2, cam: 'CH3' }, // outside camera, movement at ~598
  vo_045: { id: 'R4 cue_39', a: 80.0, b: 95.0, tail: 1.2, cam: 'IN' }, // the two inside cameras, stand still lit
};

// ---------------------------------------------------------------- shot plan: [anchor phrase, spec] per VO
// f = graded footage from source t, cam = grid square (CAM), fz = freeze print, pg = page (mk = [first, last] spoken word to mark),
// bd = print board (hero/items = [t, cam] or t), place = place line.
const PLAN = {
  vo_042: [
    ['on the 1st of february', { f: 2.0, cam: 'GRID', place: 'TUDOR ROAD · ANCHORAGE, ALASKA' }],
    ['it was called common grounds', { pg: 'P2', mk: ['common', 'grounds'], alt: { f: 12.0, cam: 'CH4' } }],
    ['her full name was', { bd: { hero: [30.0, 'CH1'], items: [[8.0, 'CH2'], [45.0, 'GRID'], [60.0, 'CH1']] } }],
    ['the hut had a', { f: 40.0, cam: 'GRID' }],
    ['all four fed one screen', { fz: 50.0, cam: 'GRID' }],
    ['what we know about the next', { f: 56.0, cam: 'CH2' }],
    ['for most of the first part', { f: 62.0, cam: 'CH1' }],
    ["then there's someone at the", { f: 70.0, cam: 'CH3' }],
    ['on the inside cameras samantha', { f: 75.0, cam: 'CH1' }],
  ],
  vo_043: [
    ['according to the account police', { pg: 'P1', mk: ['walked', 'window'], alt: { f: 64.0, cam: 'CH2' } }],
    ['he was thirty-four', { pg: 'P3', mk: ['born', 'utah'], alt: { f: 30.0, cam: 'CH3' } }],
    ['he served in the us army', { bd: { hero: [15.0, 'CH3'], items: [[36.0, 'CH4'], [52.0, 'CH2'], [68.0, 'GRID']] } }],
    ['he started his own business', { pg: 'P4', mk: ['started', 'construction'], alt: { f: 44.0, cam: 'CH4' } }],
    ['nobody in anchorage had', { f: 140.0, cam: 'CH3' }],
    ['police said that while he stood', { f: 0.5, cam: 'CH2' }],
    ["the camera doesn't show", { f: 30.0, cam: 'GRID' }],
  ],
  vo_044: [
    ['for roughly the next eight', { f: 200.0, cam: 'GRID' }],
    ['police said that in that time', { f: 300.0, cam: 'CH3' }],
    ["we don't know exactly", { fz: 400.0, cam: 'GRID' }],
    ['the outside camera on channel three', { f: 560.0, cam: 'CH3' }],
  ],
  vo_045: [
    ['after that the grid stays', { f: 640.0, cam: 'GRID' }],
    ['keyes drove her to a shed', { f: 450.0, cam: 'CH3' }],
    ['the next day he left', { bd: { hero: [26.0, 'GRID'], items: [[330.0, 'CH3'], [520.0, 'CH4'], [180.0, 'CH1']] } }],
    ["before he went he'd sent", { f: 250.0, cam: 'CH4' }],
    ['her family and friends searched', { f: 350.0, cam: 'CH3' }],
    ['all that time the police', { f: 33.0, cam: 'CH1' }],
    ['on the 24th according', { pg: 'P5', mk: ['ransom', 'note'], alt: { f: 480.0, cam: 'CH3' } }],
    ['some of the ransom money', { fz: 20.0, cam: 'GRID' }],
    ['keyes went to cash machines', { bd: { hero: [66.0, 'CH4'], items: [[24.0, 'CH3'], [48.0, 'CH1'], [4.0, 'GRID']] } }],
    ['a cash machine camera caught', { f: 280.0, cam: 'CH4' }],
    ['two days later the card', { f: 520.0, cam: 'CH3' }],
    ['on the morning of the 13th', { pg: 'P6', mk: ['cotton', 'texas'], alt: { f: 160.0, cam: 'CH3' } }],
    ['the officers saw cash', { f: 2.0, cam: 'CH1' }],
    ['the driver told them', { bd: { hero: [56.0, 'CH2'], items: [[14.0, 'CH4'], [40.0, 'CH3'], [72.0, 'CH1']] } }],
    ['he was sent back to alaska', { f: 15.0, cam: 'GRID' }],
    ['on the 2nd of april divers', { pg: 'P7', mk: ['matanuska', 'lake'], alt: { f: 230.0, cam: 'CH3' } }],
    ['fbi special agent jolene', { pg: 'P8', mk: ['caches', 'buried'], alt: { f: 270.0, cam: 'CH4' } }],
    ['one of them was hidden', { f: 380.0, cam: 'CH4' }],
    ['that was the home of bill', { pg: 'P9', mk: ['bill', 'currier'], alt: { f: 410.0, cam: 'CH3' } }],
    ["for samantha's family", { fz: 50.0, cam: 'CH1' }],
    ['these are the shots police', { f: 10.0, cam: 'GRID' }],
  ],
  vo_046: [
    ['here is what we know', { f: 25.0, cam: 'GRID' }],
    ['the man who took her confessed', { bd: { hero: [42.0, 'CH1'], items: [[600.0, 'CH3'], [20.0, 'CH4'], [62.0, 'CH2']] } }],
    ['three of the deaths', { f: 420.0, cam: 'CH3' }],
    ['he told investigators', { f: 35.0, cam: 'CH2' }],
    ['on the 23rd of may', { bd: { hero: [10.0, 'GRID'], items: [[440.0, 'CH3'], [58.0, 'CH1'], [28.0, 'CH4']] } }],
    ['his trial was set', { f: 330.0, cam: 'CH4' }],
    ['that december keyes took', { pg: 'P10', mk: ['took', 'cell'], alt: { f: 360.0, cam: 'CH3' } }],
    ['within days anchorage police', { pg: 'P2', mk: ['police', 'released'], alt: { f: 5.0, cam: 'GRID' } }],
    ["the gun isn't clearly", { f: 72.0, cam: 'CH1' }],
    ['everything between the lights', { f: 470.0, cam: 'CH3' }],
    ['much of what he told', { fz: 130.0, cam: 'GRID' }],
    ['what has never been answered', { f: 250.0, cam: 'CH3' }],
    ['the curriers were never', { bd: { hero: [37.0, 'CH3'], items: [[650.0, 'CH4'], [12.0, 'CH1'], [54.0, 'GRID']] } }],
    ["even the curriers' case", { f: 600.0, cam: 'CH4' }],
    ['the fbi believes', { bd: { hero: [18.0, 'CH2'], items: [[460.0, 'CH3'], [66.0, 'CH1'], [34.0, 'CH4']] } }],
    ['it released twelve drawings', { pg: 'P11', mk: ['twelve', 'drawings'], alt: { f: 540.0, cam: 'CH3' } }],
    ["if that's true", { f: 660.0, cam: 'CH3' }],
    ['samantha koenig is the one', { f: 45.0, cam: 'GRID', end: 1 }],
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

// ---------------------------------------------------------------- pages (E/media/coc2h/c08/pages[/art]); missing -> alt spec
const PGD = path.join(MED, 'c08', 'pages');
const pngWH = (f) => { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const xywh = (b) => (b && b.length === 4 ? [b[0], b[1], b[0] + b[2], b[1] + b[3]] : undefined);
const LINES = {};
function pageInfo(id) {
  const aj = path.join(PGD, 'art', `${id}.json`), A = fs.existsSync(aj) ? JSON.parse(fs.readFileSync(aj, 'utf8')) : null;
  const png = path.join(PGD, A ? 'art' : '', `${id}.png`), js = path.join(PGD, `${id}.json`);
  if (!fs.existsSync(png) || !fs.existsSync(js)) return null;
  const J = JSON.parse(fs.readFileSync(js, 'utf8'));
  const lines0 = LINES[id] || (Array.isArray(J.lines) && J.lines.length ? J.lines : null);
  if (!lines0) { LOG.push(`${id} has no lines -> alt`); return null; }
  const sh = (b) => (b && A ? [b[0], b[1] + A.dy, b[2], b[3] + A.dy] : b);
  const [iw, ih] = pngWH(png);
  const names = (J.private_names_bboxes || []).map(xywh).filter((b) => b && (!A || b[3] > A.T)).map((b) => (A ? [b[0], Math.max(b[1], A.T), b[2], b[3]] : b)).map(sh);
  return { id, png, J, iw, ih, A, lines: lines0.map(sh), key: sh(xywh(J.key_bbox)), names, rel: `assets/media/c08/pages/${A ? 'art/' : ''}${id}.png` };
}
function mosaic(png, n, s) {
  const x = Math.max(0, Math.round(n[0] - 6)), y = Math.max(0, Math.round(n[1] - 6)), w = Math.round(n[2] - n[0] + 12), h = Math.round(n[3] - n[1] + 12), b = 24 / s;
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', png, '-vf', `crop=${w}:${h}:${x}:${y},scale=${Math.max(1, Math.round(w / b))}:${Math.max(1, Math.round(h / b))}:flags=area,scale=${w}:${h}:flags=neighbor`, '-f', 'image2pipe', '-vcodec', 'png', '-']);
  return { x, y, w, h, src: `data:image/png;base64,${buf.toString('base64')}` };
}
function markFor(id, c, to, ks, mk) {
  const W0 = VO[id].words.map((w) => ({ ...w, T0: w.t0 + O[id], T1: w.t1 + O[id] })).filter((w) => w.T0 >= c - 0.6 && w.T0 < to);
  if (mk) {
    const a = W0.find((w) => w.w === norm(mk[0])), b = a && W0.find((w) => w.T0 >= a.T0 && w.w === norm(mk[1]));
    if (!a || !b) { LOG.push(`${id} MARK MISS ${mk}`); return null; }
    return { at: Math.max(4, Math.round((a.T0 - 0.2 - c) * 60)), n: Math.round(Math.min(5, Math.max(1.0, b.T1 - a.T0)) * 60) };
  }
  const K = String(ks || '').split(/\s+/).map(norm).filter(Boolean);
  let best = null;
  for (let i = 0; i < W0.length; i++) for (let j = 0; j < K.length; j++) {
    let k = 0; while (i + k < W0.length && j + k < K.length && W0[i + k].w === K[j + k]) k++;
    if (k >= 3 && (!best || k > best[1])) best = [i, k];
  }
  if (!best) { LOG.push(`${id} page mark: no VO run in key sentence -> no marker`); return null; }
  const a = W0[best[0]], b = W0[best[0] + best[1] - 1];
  return { at: Math.max(4, Math.round((a.T0 - 0.2 - c) * 60)), n: Math.round(Math.min(5, Math.max(1.0, b.T1 - a.T0)) * 60) };
}
let pgV = 3; // PaperMv mode cycle

// ---------------------------------------------------------------- freezes, boards (case 1 SBoard templates); stills cropped per square
const STILLD = path.join(HERE, '..', 'parts', 'coc_case08', 'assets', 'stills');
fs.mkdirSync(path.join(STILLD, 'c08'), { recursive: true });
const stSrc = (cam) => `${SRC}${cam}`; // pseudo source id -> assets/stills/c08/CGS<cam>_<n>.png (pre-made here, build skips existing)
const preStill = (n, cam) => {
  const out = path.join(STILLD, `${stSrc(cam)}_${n}.png`), [x, y, w, h] = CAM[cam][0];
  if (!fs.existsSync(out)) execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', (n / FPS).toFixed(4), '-i', path.join(MED, `${SRC}.mp4`), '-frames:v', '1', '-vf', `crop=${w}:${h}:${x}:${y},scale=${w * 2}:${h * 2}:flags=lanczos`, out]);
};
const fz = (q) => { const [t, cam] = Array.isArray(q) ? q : [q, 'GRID'], n = Math.round(t * FPS), c = CAM[cam][0]; preStill(n, cam); return { key: `R_${cam}_${t}`, ar: c[2] / c[3], p: { still: [stSrc(cam), n] } }; };
const FZT = [[5, 'CH1'], [12, 'CH2'], [20, 'CH3'], [28, 'CH4'], [35, 'GRID'], [42, 'CH2'], [50, 'CH1'], [58, 'CH3'], [66, 'GRID'], [74, 'CH4'], [300, 'CH3'], [450, 'CH3'], [560, 'CH4'], [640, 'CH3']];
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
let bdI = 1;
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
// b-roll segments: lit stand before the man arrives (0-79.5), dark stand (125-595.5), after cue_38 (617.5-end); raw windows excluded.
// pick(t, len) keeps t inside its own segment when that square/time is unused, else the nearest less-reused start in the same segment.
const SEG = [[0, 79.5], [125, 595.5], [617.5, SDUR - 0.3]];
const USED = [];
function pick(t, len, name, cam) {
  const sg = SEG.find(([a, b]) => t >= a - 1e-6 && t <= b) || SEG.reduce((m, s) => (Math.min(Math.abs(t - s[0]), Math.abs(t - s[1])) < Math.min(Math.abs(t - m[0]), Math.abs(t - m[1])) ? s : m));
  if (len > sg[1] - sg[0]) { LOG.push(`WARN ${name} ${len.toFixed(1)} s longer than its segment`); return sg[0]; }
  const ov = (u) => USED.filter((x) => x[0] === cam).reduce((m, [, x, y]) => m + Math.max(0, Math.min(y, u + len) - Math.max(x, u)), 0);
  const c0 = Math.min(Math.max(t, sg[0]), sg[1] - len);
  let best = [Math.abs(c0 - t) + 20 * ov(c0), c0];
  for (let u = sg[0]; u <= sg[1] - len + 1e-6; u += 0.5) { const cst = Math.abs(u - t) + 20 * ov(u); if (cst < best[0]) best = [cst, u]; }
  const t2 = r2(best[1]);
  if (Math.abs(t2 - t) > 0.01) LOG.push(`${name}: footage ${cam} ${t} -> ${t2} (segment / reuse)`);
  USED.push([cam, t2, t2 + len]);
  return t2;
}

// ---------------------------------------------------------------- build shots
const shots = [], audio = [], overlays = [];
const TSH = 'text-shadow:0 3px 6px rgba(0,0,0,0.85),0 6px 22px rgba(0,0,0,0.6)', CT = 460;
const firstCut = r2(O.vo_042 + anchorT('vo_042', PLAN.vo_042[0][0]).t - 0.05);
const cardTo = Math.max(CARD, firstCut);
{
  const cardF = Math.round(cardTo * 60);
  const title = { d: 'BTitle', p: { soft: [60, 102], back: { top: CT - 70, h: 300 }, lines: [
    { t: 'CASE 08', size: 30, top: CT, color: '#FFFFFF', track: 0.3, weight: 700, shadow: TSH },
    { t: 'THE LAST CUSTOMER AT COMMON GROUNDS', size: 62, top: CT + 44, color: '#FFFFFF', track: 0.03, shadow: TSH },
    { t: 'ANCHORAGE, ALASKA · FEBRUARY 2012', size: 30, top: CT + 128, color: '#FFFFFF', track: 0.1, weight: 600, shadow: TSH },
  ] } };
  const berg = { d: 'BergX', p: { img: 'assets/media/berg.jpg', iw: 1920, ih: 4118, wl: 1191, cam: [[0, 1000, 1.0]], zoom: [0, cardF, 1.0, 1.06], dark: [1.0, 1.0],
    tilt: { a: [1.06, 4, 0, 0, 0], b: [1.06, 2.5, 0, 0, 0] }, fade: { in: [0, 30] } }, k: [title] };
  shots.push({ name: 'card', c: 0, to: cardTo, k: 'hard', n: 0, el: () => [{ d: 'Black' }, berg] });
}

function specNodes(sp, name, c, to) {
  sp = { ...sp };
  const L = Math.round((to - c) * 60);
  if (sp.pg) {
    const P = pageInfo(sp.pg);
    if (P && P.key) {
      const p = { img: P.rel, iw: P.iw, ih: P.ih, key: P.key, lines: P.lines, hold: false, mark: markFor(sp.vo, c, to, P.J.key_sentence, sp.mk),
        top: P.A ? [P.A.hx0, 20, P.A.hx1, P.A.hh] : undefined, headFit: !!P.A, v: pgV++ };
      p.mz = P.names.map((b) => mosaic(P.png, b, paperFrame(p).s));
      LOG.push(`${name} PAGE ${sp.pg}${p.mz.length ? ` (${p.mz.length} mosaics)` : ''}${p.mark ? ` mark at ${(c + p.mark.at / 60).toFixed(2)}` : ''}`);
      return { nodes: [{ d: 'Paper', p }], page: 1 };
    }
    LOG.push(`${name} page ${sp.pg} missing -> alt`);
    return specNodes({ ...sp.alt, vo: sp.vo }, name, c, to);
  }
  if (sp.bd) return { nodes: [boardShot(name, L + 24, sp.bd)] };
  const cam = sp.cam || 'GRID', [crop, mode] = CAM[cam];
  if (sp.fz !== undefined) {
    // plays ~75 f, then dissolves into a B&W print of that frame (case 1 SFz)
    const at = 75; sp = { ...sp, fz: pick(sp.fz, at / 60 + 0.3, name, cam) };
    const n = Math.round((sp.fz + at / 60) * FPS);
    preStill(n, cam);
    return { nodes: [{ d: 'SFz', p: { src: stSrc(cam), n, sw: crop[2], sh: crop[3], at, rot: (bdI + mvI) % 2 ? 1.4 : -1.6,
      video: { d: 'CFoot', p: { src: SRC, t: sp.fz, crop, mode, mv: { a: [1.10, 0, -3, -1, 0], b: [1.13, 0, -1.5, 0, 0], ez: 'sym' } } } } }] };
  }
  // footage
  const t = pick(sp.f, to - c + (sp.end ? 0 : 0.4), name, cam);
  if (t + (to - c) + 0.3 > SDUR) LOG.push(`WARN ${name} footage runs past the source end`);
  const ft = { d: 'CFoot', p: { src: SRC, t, crop, mode, mv: MOVES[mvI++ % MOVES.length] } };
  const nodes = [sp.end ? { d: 'Fade3', p: { out: [Math.round((END - c) * 60) - 48, Math.round((END - c) * 60)] }, k: [ft] } : ft];
  if (sp.place) nodes.push({ d: 'WTitle', p: { lines: [{ t: sp.place, size: 34, top: 900, track: 0.06 }], left: 96, at: 20, out: L - 60 } });
  return { nodes };
}

// room tone (synthetic brown noise, 30 s) under the silent raws: gain .045 (~ -50 LUFS), 0.3 s fades, chained (0.3 s overlap) past 30 s
const RT = 'c08/roomtone.wav', RTL = dur(path.join(MED, RT)), RTG = 0.045;
function roomTone(k, c, to) {
  let at = c, i = 0;
  while (at < to - 0.05) {
    const trim = r2(((k * 7 + i * 11) % 10) * 0.9), L = r2(Math.min(to - at, RTL - trim - 0.1));
    audio.push({ id: `rt_${k}_${i}`, src: `rt_${k}_${i}`, file: RT, at: r2(at), to: r2(at + L), trim, lane: [[0, 0], [0.3, RTG], [r2(L - 0.3), RTG], [L, 0]] });
    at = r2(at + L - 0.3); i++;
    if (at + 0.6 >= to) break;
  }
}

let pageSec = 0, prevK = 'hard', prevPg = null;
let cur = cardTo;
const DUCK = [];
for (const id of VOIDS) {
  const plan = PLAN[id];
  let from = 0;
  const cuts = plan.map(([ph]) => { const a = anchorT(id, ph, from); from = a.i + 1; return { t: r2(O[id] + a.t - 0.05), i: a.i }; });
  const R = RAWS[id], stretchEnd = R ? RAWAT[id] : END;
  plan.forEach(([ph, sp], j) => {
    const c = j === 0 ? cur : cuts[j].t, to = j + 1 < plan.length ? cuts[j + 1].t : r2(stretchEnd);
    if (to - c < 3.0 - 1e-6) LOG.push(`WARN ${id} "${ph}" only ${(to - c).toFixed(2)} s`);
    if (sp.pg && sp.pg === prevPg) LOG.push(`WARN ${id} "${ph}" same page ${sp.pg} as the previous shot`);
    prevPg = sp.pg || null;
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
  // raw: hard cut in; picture runs `tail` s under the next VO; silent source -> room tone only, music out
  const c = RAWAT[id], nxt = VOIDS[VOIDS.indexOf(id) + 1], nv = O[nxt];
  const to = r2(nv + R.tail), srcEnd = R.a + (to - c);
  if (srcEnd > SDUR - 0.05) throw new Error(`${R.id} runs past the source end`);
  const [crop, mode] = CAM[R.cam], L = Math.round((to - c) * 60);
  shots.push({ name: `${R.id} RAW`, c, to, k: 'hard', n: 0, raw: true, el: () => [
    { d: 'CFoot', p: { src: SRC, t: R.a, crop, mode, raw: true } },
    { d: 'Crd1', p: { text: 'Footage: Anchorage Police Department', at: 12, hold: Math.min(170, L - 18) } }] });
  prevK = 'hard'; prevPg = null;
  roomTone(VOIDS.indexOf(id) + 1, c, r2(Math.min(to, nv + 0.3)));
  DUCK.push([c, Math.min(nv, to)]);
  LOG.push(`${R.id} ${c}-${to} src ${R.a}-${r2(srcEnd)} ${R.cam}`);
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

// ---------------------------------------------------------------- music: case 8 -> music10 from 96 s (brief: bed NN mod 3, offset NN*37 mod 200),
// then music8 from 70 s, then music9 from 40 s as each runs out; case 1 musLane (VO ref -11 LU = -39.3). Silent raws: music OUT (0.5 s ramps).
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
};
const duckAmt = (t) => Math.max(0, ...DUCK.map(([a, b]) => Math.min(1, (t - a) / 0.5, (b - t) / 0.5)));
function musLane(file, trim, len, at, fin, fout, extra = []) {
  const S = stS(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  const stp = Math.max(0.5, Math.ceil((len / 470) * 10) / 10); // build.mjs: <= 512 lane points
  for (let u = 0; u < len; u += stp) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * (1 - duckAmt(at + u)) * Math.pow(10, Math.max(-36, Math.min(12, -39.3 - lvl(trim + u))) / 20)).toFixed(4)]);
}
const DX = (at) => DUCK.flatMap(([a, b]) => [a, a + 0.5, b - 0.5, b].map((t) => t - at));
{
  const BEDS = [['music/music10.mp3', 96], ['music/music8.mp3', 70], ['music/music9.mp3', 40]];
  let at = 0;
  for (let i = 0; i < BEDS.length && at < END - 1; i++) {
    const [M, T] = BEDS[i], to = Math.min(END, r2(at + dur(path.join(MED, M)) - T - 0.5)), L = r2(to - at), last = to >= END;
    audio.push({ id: `mus${i + 1}`, src: `mus${i + 1}`, file: M, at, to, trim: T, lane: musLane(M, T, L, at, i ? 3 : 0.3, last ? 2 : 3, DX(at)) });
    LOG.push(`mus${i + 1} ${M} trim ${T} ${at}-${to}`);
    if (last) break;
    at = r2(to - 3);
  }
}
overlays.push({ name: 'abyss grade + soft crt (v9)', at: 0, to: END, el: () => ({ d: 'AbyGrade', p: {}, k: [] }) });
LOG.push(`END ${END} s, pages ${pageSec.toFixed(1)} s = ${((pageSec / END) * 100).toFixed(1)} %`);
if (process.argv.includes('--log')) console.log(LOG.join('\n') + '\n' + shots.map((s) => `${s.name} | ${s.c}-${s.to} (${r2(s.to - s.c)}) ${s.k}`).join('\n'));

export default {
  id: 'coc_case08',
  media: 'coc2h',
  end: END,
  tseed: 'coc8t',
  plain: true,
  vo: { starts: VOIDS.map((id) => O[id]), lens: VOIDS.map((id) => VO[id].len), file: (i) => VO[VOIDS[i]].rel, tail: 0 },
  devices: ['shared', 'coc', 'coc_c01', 'coc_v3', 'coc_c01v3', 'coc_c01v4', 'coc_v4', 'coc_v9'],
  fonts: ['Archivo-var-latin.woff2', 'CourierPrime-700-latin.woff2', 'IBMPlexMono-500-latin.woff2'],
  shots,
  overlays,
  audio,
};
