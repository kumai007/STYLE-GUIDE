// TEMPLATE ONLY (2026-11-18): coc2h-vol1 data is deleted; PROD/media paths below are dead. Copy the structure into a new case.
// coc_case05 - Case 5 "Seven bags on a gravel bar" (Limitless Outdoors, Alaska, 2022 season) of coc2h-vol1. House look = case 1 v11
// (berg card, v8 grade + eased 3-D camera on footage, raws with gentle 3-D push, AbyGrade CRT + vignette over the whole part).
// One source: LO = the hunters' own upload (https://www.youtube.com/watch?v=7dROgAIao3k), media/coc2h/c05/LO.mp4 (1920x1080 29.97).
// No news article exists for this story (searched 2026-11-17) -> footage only, no pages, no invented graphics.
// Timeline: card 0-4.97 -> VO24 -> R21 -> VO25 -> R22 -> VO26 -> R23 -> VO27 -> R24 -> VO28 -> R25 -> VO29 -> R26 -> VO30 -> end.
// VO: real wav + words when present (media/coc2h/vo/vo_0NN.wav, narration/cut/vo_0NN.words.json), else estimated at 3.3 words/s
// (case 1 measured 3.2-3.6) and cut points spread by word index. Re-run `node build.mjs coc_case05` when the VO lands: all timing follows.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(HERE, '..', 'media'), 'coc2h');
const PROD = 'C:/Users/ayush/Videos/CLAUDE/render farm video/productions/coc2h-vol1';
const r2 = (x) => Math.round(x * 100) / 100;
const SRC = 'c05/LO', SDUR = 1499.29;
const LOG = [];

// ---- VO (job.json blocks kind 'vo', case_05)
const JOB = JSON.parse(fs.readFileSync(path.join(PROD, 'job.json'), 'utf8'));
const VOT = Object.fromEntries(JOB.blocks.filter((b) => b.kind === 'vo' && b.case_id === 'case_05').map((b) => [b.id, b.text]));
const VOS = ['vo_024', 'vo_025', 'vo_026', 'vo_027', 'vo_028', 'vo_029', 'vo_030'];
const norm = (s) => String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]/g, '');
const ffdur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const HAVE = Object.fromEntries(VOS.map((v) => [v, fs.existsSync(path.join(MED, 'vo', `${v}.wav`))]));
const VOREAL = VOS.every((v) => HAVE[v]);
const WPS = 3.3;
function voInfo(v) {
  const toks = VOT[v].split(/\s+/).filter((w) => norm(w));
  const wj = path.join(PROD, 'narration', 'cut', `${v}.words.json`);
  if (HAVE[v]) {
    const len = ffdur(path.join(MED, 'vo', `${v}.wav`));
    if (fs.existsSync(wj)) return { len, real: 2, words: JSON.parse(fs.readFileSync(wj, 'utf8')).words.map((w) => ({ w: norm(w.w), t0: w.start, t1: w.end })) };
    // placed wav = the uncut take (same length as narration/raw): its own word times apply
    const rw0 = path.join(PROD, 'narration', 'raw', `${v}.wav`), rj0 = path.join(PROD, 'narration', 'raw', `${v}.words.json`);
    if (fs.existsSync(rw0) && fs.existsSync(rj0) && Math.abs(ffdur(rw0) - len) < 0.03) return { len, real: 2, words: JSON.parse(fs.readFileSync(rj0, 'utf8')).words.map((w) => ({ w: norm(w.w), t0: w.start, t1: w.end })) };
    return { len, real: 1, words: toks.map((w, i) => ({ w: norm(w), t0: (i / toks.length) * len, t1: ((i + 1) / toks.length) * len })) };
  }
  // recorded take not yet cut/placed: time from narration/raw (wav + words); the dead-air cut later shortens it ~3 % and a rebuild re-times
  const rw = path.join(PROD, 'narration', 'raw', `${v}.wav`), rj = path.join(PROD, 'narration', 'raw', `${v}.words.json`);
  if (fs.existsSync(rw) && fs.existsSync(rj)) return { len: r2(ffdur(rw)), real: 3, words: JSON.parse(fs.readFileSync(rj, 'utf8')).words.map((w) => ({ w: norm(w.w), t0: w.start, t1: w.end })) };
  const len = r2(toks.length / WPS);
  return { len, real: 0, words: toks.map((w, i) => ({ w: norm(w), t0: i / WPS, t1: (i + 1) / WPS })) };
}
const VI = Object.fromEntries(VOS.map((v) => [v, voInfo(v)]));
// phrase start (s from VO start): first word run matching the anchor tokens
function at(v, phrase) {
  const W = VI[v].words, P = phrase.split(/\s+/).map(norm);
  for (let i = 0; i + P.length <= W.length; i++) if (P.every((p, k) => W[i + k].w === p)) return W[i].t0;
  throw new Error(`${v}: anchor "${phrase}" not found`);
}

// ---- shot plan: per VO block [anchor phrase, LO source in (s), opts]; then the raw cue after it (job.json cue_21..26).
// Source times picked from 1-12 s contact sheets of LO (scratch c05/s1, s2, r21-r26). opts: crop = top 78 % (their burned-in subtitles),
// credit = Crd1 'Footage: Limitless Outdoors'. Crops checked by code (scratch subdet.py: white text + dark edge in the bottom band;
// real subs score 15-67, clean 0-8): burned-in subs only at 807-809, 825-834, 873-878, 1205-1207 -> those shots/raws cropped.
const TOP78 = [211, 0, 1498, 842, 1920, 1080];
const PLAN = [
  { vo: 'vo_024', shots: [
    ['on a willow-lined river', 135.4], // mountains + river wide (card covers the first words)
    ['two hunters named', 30.0], // hunter with pack by the river
    ['they run a hunting', 470.0, { credit: 1 }], // Justin talking in the raft
    ['and theyve never said', 190.0], // valley wide, no landmark named
    ['colton shot a big bull', 547.6], // the bull in the willows (their cutaway)
    ['they broke it down', 696.0], // bagging meat on the tundra
    ['and laid it all out', 96.0], // the bags + antlers on the gravel bar
    ['to float that much', 121.8], // the camo raft pack
    ['so they left the bags', 216.0], // camo pack walking away
    ['on the way back', 736.0], // the drainage from the high spot
  ], raw: { id: 'cue_21', t: 727.0, len: 6.0, crop: TOP78 } },
  { vo: 'vo_025', shots: [
    ['justin said they saw', 14.6], // the brown bear over the meat bags
    ['they could walk away', 792.0], // hunter with the raft pack looking down the valley
    ['they went down', 276.0], // willow brush
    ['once they dropped', 490.0], // Justin talking in the raft
    ['so they kept talking', 840.0], // walking into the willows
    ['one of them had', 228.0], // camo raft pack close
  ], raw: { id: 'cue_22', t: 753.0, len: 14.0, crop: TOP78 } },
  { vo: 'vo_026', shots: [
    ['this is the first time', 780.0], // bear head far in the willows
    ['a few metres away', 864.0], // bear head above the willows (it moves: no ring, a fixed mark would miss it)
    ['one of them talks', 872.6, { crop: TOP78 }], // hunter with the pack (their subtitles cropped off)
    ['that was the plan', 248.0], // camo pack walking on
  ], raw: { id: 'cue_23', t: 807.0, len: 14.5, crop: TOP78, // source cuts at 806.9 and 821.6
    au: [[819.55, 821.3, 0.575]], // job notes: original audio only for the 13:40 line, else muted (VO 26 already quotes 'There he is'); g = VO -27.7 LUFS
    subs: [["We don't want any problems, bud.", 819.3, 821.45]] } },
  { vo: 'vo_027', shots: [
    ['we just want to get', 826.5, { crop: TOP78 }], // the hunter talking to it (their subtitle cropped off)
    ['the head dropped', 1080.0], // bear head in the willows
    ['then the bear walked', 1020.0], // bear moving through the brush
  ], raw: { id: 'cue_24', t: 937.0, len: 18.0, au: [[937.0, 942.9, 0.89]], subs: [["Don't you dare.", 940.4, 942.6]] } },
  { vo: 'vo_028', shots: [
    ['those are not', 108.0], // Justin by the bags on the gravel bar
    ['justin later said', 324.0], // Justin talking (winter)
    ['in his words', 1012.0], // hunter at the creek, the bags far off
    ['it went back into', 998.0], // bear in the brush
  ], raw: { id: 'cue_25', t: 983.0, len: 12.0 } },
  { vo: 'vo_029', shots: [
    ['this heres an arctic', 1092.0, { crop: TOP78 }], // hunter with the pack at the creek
    ['the bear didnt leave', 1068.0], // the creek
    ['while one man stood', 1200.4, { crop: TOP78 }], // the man at the creek edge
    ['nothing like pumping', 1231.0], // raft + meat on the bank
    ['up close justin said', 956.3], // the bear close by the bags
  ], raw: { id: 'cue_26', t: 1210.1, len: 10.2, crop: TOP78 } }, // source cut at 1220.6
  { vo: 'vo_030', shots: [
    ['they loaded every quarter', 1248.0], // floating out, antlers on the bow
    ['and floated out', 1300.0], // fast water
    ['brown bears often', 7.6], // brown bear in the grass
    ['this one ended', 1344.0], // floating on
    ['the bear kept', 1266.0], // raft with the antlers
    ['theres no official record', 1356.0], // wide lake
    ['the first part of the trip', 576.0], // Justin in the raft
    ['it has been watched', 1482.0], // valley at dusk
  ] },
];
// LO source cuts (frame-diff detector 2026-11-17 + eye checks); a non-raw shot must not run over one (window + 0.45 s dissolve room)
const CUTS = [27.2, 37.5, 44.3, 47.4, 49.5, 52.3, 55.0, 57.3, 63.6, 70.9, 80.3, 86.3, 91.8, 118.1, 121.5, 135.2, 144.7, 148.0, 152.8, 156.6, 161.2,
  166.2, 172.1, 177.2, 204.6, 263.5, 315.3, 348.3, 352.2, 369.6, 370.8, 390.6, 405.8, 435.0, 440.6, 449.4, 453.4, 457.4, 466.6, 481.4, 484.2,
  505.2, 509.1, 547.1, 556.4, 661.1, 693.3, 715.8, 721.9, 751.3, 772.9, 798.2, 803.9, 806.9, 821.6, 834.5, 838.5, 871.3, 955.6, 960.8, 1009.0,
  1034.7, 1146.5, 1200.2, 1209.9, 1220.6, 1226.6, 1230.7, 1239.3, 1246.7, 1264.1, 1276.8, 1281.3, 1286.7, 1291.7, 1296.3, 1309.9, 1331.8, 1355.0,
  1380.3, 1383.4, 1387.8, 1392.2, 1399.1, 1414.8, 1431.0, 1439.9, 1443.5, 1446.3, 1449.3, 1454.1, 1459.6, 1464.8, 1468.8, 1477.8, 1481.2, 1488.7, 1493.0];

// ---- timing: card 0-4.97 (case 1), VO24 at 3.33 under the card end (case 1 VO2 at 3.33); raw 0.25 s after its VO; next VO 0.8 s
// before the raw ends (raw picture tail under the VO, raw sound already down).
const CARD = 4.97, MINS = 3.0, TAILV = 0.8;
const VO0 = {}; const RAWS = [];
let t = 3.33;
for (const B of PLAN) {
  VO0[B.vo] = r2(t);
  t += VI[B.vo].len;
  if (B.raw) { // next VO waits until raw speech is over + 0.35 s (VO and clip speech never overlap)
    const c = r2(t + 0.25), spk = Math.max(0, ...(B.raw.au || []).map(([, b]) => b - B.raw.t + 0.35));
    RAWS.push({ ...B.raw, c, to: r2(c + B.raw.len), after: B.vo }); t = c + Math.max(B.raw.len - TAILV, spk);
  }
}
const lastVo = VOS[VOS.length - 1], END = r2(VO0[lastVo] + VI[lastVo].len + 2.5);

// ---- shots (c, to in part s). Non-raw >= 3 s: an anchor that would make a shot < 3 s is dropped (the shot before runs on).
const shots = [], audio = [], overlays = [];
const SH = 'text-shadow:0 3px 6px rgba(0,0,0,0.85),0 6px 22px rgba(0,0,0,0.6)';
const CT = 460;
{
  const cardF = Math.round(CARD * 60);
  const title = { d: 'BTitle', p: { soft: [60, 102], back: { top: CT - 70, h: 300 }, lines: [
    { t: 'CASE 05', size: 30, top: CT, color: '#FFFFFF', track: 0.3, weight: 700, shadow: SH },
    { t: 'SEVEN BAGS ON A GRAVEL BAR', size: 62, top: CT + 44, color: '#FFFFFF', track: 0.03, shadow: SH },
    { t: 'ALASKA · 2022', size: 30, top: CT + 128, color: '#FFFFFF', track: 0.1, weight: 600, shadow: SH },
  ] } };
  const berg = { d: 'BergX', p: { img: 'assets/media/berg.jpg', iw: 1920, ih: 4118, wl: 1191, cam: [[0, 1000, 1.0]], zoom: [0, cardF, 1.0, 1.06], dark: [1.0, 1.0],
    tilt: { a: [1.06, 4, 0, 0, 0], b: [1.06, 2.5, 0, 0, 0] }, fade: { in: [0, 30] } }, k: [title] };
  shots.push({ name: 'card', c: 0, to: CARD, k: 'hard', n: 0, el: () => [{ d: 'Black' }, berg] });
}
// eased 3-D camera moves (case 1 MOVES), cycled
const MOVES = [
  { a: [1.12, 0, -5, -1.5, 0], b: [1.17, 0, 1, 1.5, 0] },
  { a: [1.17, 4, 0, 0, 1.2], b: [1.10, -1, 0, 0, -1.2], ez: 'sym' },
  { a: [1.12, 0, 5, 1.5, 0], b: [1.17, 0, -1, -1.5, 0] },
  { a: [1.11, -4, 0, 0, -1.2], b: [1.17, 1, 0, 0, 1.2], ez: 'sym' },
  { a: [1.17, 3, -4, -1.2, 1.0], b: [1.11, 0, 1, 1.2, -0.6] },
  { a: [1.13, -3, 4, 1.2, -1.0], b: [1.17, 0, -1, -1.2, 0.6], ez: 'sym' },
];
let mvI = 0;
const crd = (len) => ({ d: 'Crd1', p: { text: 'Footage: Limitless Outdoors', at: 12, hold: Math.min(170, Math.round(len * 60) - 18) } });

const segs = [];
for (const B of PLAN) {
  const v0 = VO0[B.vo], raw = RAWS.find((r) => r.after === B.vo);
  const blockEnd = raw ? raw.c : END;
  let list = B.shots.map(([ph, src, o = {}]) => ({ ph, src, o, c: r2(Math.max(v0 + at(B.vo, ph) - 0.05, segs.length ? 0 : CARD)) }));
  if (segs.length === 0) list[0].c = CARD; // first shot starts at the card end
  else list[0].c = segs[segs.length - 1].to; // butt-joined to the raw before (no gap when the VO waits for raw speech)
  // a shot under MINS: delay the next cut to MINS if the next shot still keeps MINS (cut lands a little into the next phrase),
  // else drop the next anchor (this shot runs on); a short last shot is dropped (the one before runs to the block end)
  for (let i = 0; i < list.length; i++) {
    const nx = list[i + 1] ? list[i + 1].c : blockEnd;
    if (nx - list[i].c >= MINS || list.length < 2) continue;
    if (list[i + 1]) {
      const nn = list[i + 2] ? list[i + 2].c : blockEnd;
      if (nn - (list[i].c + MINS) >= MINS) { LOG.push(`${B.vo} delay "${list[i + 1].ph}" by ${(list[i].c + MINS - nx).toFixed(2)} s`); list[i + 1].c = r2(list[i].c + MINS); continue; }
      LOG.push(`${B.vo} drop "${list[i + 1].ph}" (shot "${list[i].ph}" would be ${(nx - list[i].c).toFixed(2)} s)`); list.splice(i + 1, 1); i--; continue;
    }
    LOG.push(`${B.vo} drop "${list[i].ph}" (last shot ${(nx - list[i].c).toFixed(2)} s)`); list.splice(i, 1); break;
  }
  list.forEach((s, i) => segs.push({ ...s, to: r2(list[i + 1] ? list[i + 1].c : blockEnd), vo: B.vo, first: i === 0 }));
  if (raw) segs.push({ raw, c: raw.c, to: raw.to });
}
// transitions: card -> first shot 24 f dissolve; inside a VO block hard cut on the phrase start alternating with 24 f dissolves;
// raw enters by a hard cut on the VO end; the shot after a raw dissolves 24 f out of the raw tail.
let alt = 0;
segs.forEach((s, i) => {
  const prev = segs[i - 1];
  if (i === 0) { s.k = 'dissolve'; s.n = 24; return; }
  if (s.raw) { s.k = 'hard'; s.n = 0; return; }
  if (prev && prev.raw) { s.k = 'dissolve'; s.n = 24; alt = 0; return; }
  s.k = alt++ % 2 ? 'dissolve' : 'hard'; s.n = s.k === 'dissolve' ? 24 : 0;
});
segs.forEach((s, i) => {
  const L = s.to - s.c;
  if (s.raw) {
    const R = s.raw, nodes = [{ d: 'CFoot', p: { src: SRC, t: R.t, crop: R.crop || [0, 0, 1920, 1080, 1920, 1080], mode: 'cover', raw: true } }, crd(L)];
    if (R.subs) nodes.push({ d: 'RSub', p: { cues: R.subs.map(([tx, a, b]) => [tx, Math.round((a - R.t) * 60), Math.round((b - R.t) * 60)]) } });
    shots.push({ name: `${R.id} RAW LO ${R.t}`, c: s.c, to: s.to, k: s.k, n: s.n, raw: true, el: () => nodes });
    // raw sound only for the spoken lines (job.json notes: original audio muted otherwise); 0.12 s ramps
    for (const [a, b, g] of R.au || []) {
      const at0 = r2(s.c + (a - R.t)), len = r2(b - a);
      audio.push({ id: `raw_${R.id}_${Math.round(a * 10)}`, src: SRC, at: at0, to: r2(at0 + len), trim: a, lane: [[0, 0], [0.12, g], [len - 0.12, g], [len, 0]] });
    }
    return;
  }
  const o = s.o;
  const mv = MOVES[mvI++ % MOVES.length];
  const last = i === segs.length - 1;
  if (s.src + L + 0.5 > SDUR) throw new Error(`${s.ph}: source runs past LO end`);
  { // keep the shot inside its source segment: slide the in-point earlier when it would run over the next cut (VO re-timing safe)
    const nxt = CUTS.find((u) => u > s.src + 0.05), prv = [...CUTS].reverse().find((u) => u <= s.src + 0.05) ?? 0;
    if (nxt && s.src + L + 0.45 > nxt) { const ns = r2(Math.max(prv + 0.25, nxt - L - 0.45)); LOG.push(`slide ${s.vo} "${s.ph}" LO ${s.src} -> ${ns}`); s.src = ns; }
    if (nxt && s.src + L + 0.45 > nxt) LOG.push(`CROSS ${s.vo} "${s.ph}" LO ${s.src}-${(s.src + L + 0.45).toFixed(2)} over cut ${nxt} (segment too short)`);
  }
  const ft = [{ d: 'CFoot', p: { src: SRC, t: s.src, crop: o.crop || [0, 0, 1920, 1080, 1920, 1080], mode: 'cover', mv } }];
  const Lf = Math.round(L * 60);
  const ex = [];
  if (o.credit) ex.push(crd(L));
  shots.push({ name: `${s.vo} "${s.ph}" LO ${s.src}`, c: s.c, to: s.to, k: s.k, n: s.n, el: () => [...(last ? [{ d: 'Fade3', p: { out: [Lf - 48, Lf] }, k: ft }] : ft), ...ex] });
});
shots[shots.length - 1].to = END;

// ---- SFX: card only (case 1 set; SFX = VO ref -14 LU = -42.3 LUFS)
const SFXL = { sting_1: -27.6, whoosh_1: -23.1, subhit_1: -20.2 };
function sfx(name, at, maxLen = 99) {
  const g = +Math.pow(10, (-42.3 - SFXL[name]) / 20).toFixed(4), L = r2(Math.min(maxLen, ffdur(path.join(MED, 'sfx', `${name}.wav`)) - 0.02));
  audio.push({ id: `sfx_${name}_${Math.round(at * 100)}`, src: `sfx_${name}`, file: `sfx/${name}.wav`, at: r2(at), to: r2(at + L), trim: 0, lane: [[0, g], [Math.max(0.02, L - 0.05), g], [L, 0]] });
}
sfx('sting_1', 0.02); sfx('whoosh_1', 0.95); sfx('subhit_1', 1.68);

// ---- Tex master texture over every non-raw stretch (case 1)
{
  let st = null;
  for (let i = 0; i <= shots.length; i++) {
    const sh = shots[i];
    if (sh && !sh.raw) { if (!st) st = sh; continue; }
    if (!st) continue;
    const a = r2(st.c - st.n / 120), b = sh ? r2(sh.c + sh.n / 120) : END, Lf = Math.round(b * 60) - Math.round(a * 60);
    const p = {};
    if (st.c === 0) p.fi = [60, 90]; else if (st.k === 'dissolve') p.fi = [0, st.n];
    if (sh && sh.k === 'dissolve') p.fo = [Lf - sh.n, Lf]; else if (!sh) p.fo = [Lf - 48, Lf];
    overlays.push({ name: `tex ${st.name}`, at: a, to: b, el: () => ({ d: 'Tex', p }) });
    st = null;
  }
}

// ---- music: case 5 -> bed 5 mod 3 = 2 = music10, start offset (5*37) mod 200 = 185 s; music10 is 300.9 s long, so it runs 185-300
// then crossfades (3 s) into music10 from 0. Levelled like case 1: VO ref -39.3 LUFS short-term target, -3 LU more under raws.
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
};
const SC = {};
function musLane(file, trim, len, tgt, fin, fout, extra = []) {
  const S = (SC[file] ||= stS(file)), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  for (let u = 0; u < len; u += 0.5) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-36, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}
const VOW = VOS.map((v) => [VO0[v], VO0[v] + VI[v].len]);
const DUCK = shots.filter((s) => s.raw).flatMap((s) => {
  let iv = [[s.c, s.to]];
  for (const [a, b] of VOW) iv = iv.flatMap(([x, y]) => (b <= x || a >= y ? [[x, y]] : [[x, a], [b, y]].filter(([p, q]) => q - p > 0.05)));
  return iv;
});
const duckAmt = (t) => Math.max(0, ...DUCK.map(([a, b]) => Math.min(1, (t - a) / 0.5, (b - t) / 0.5)));
const MUS = (at) => (u) => -39.3 - 3 * duckAmt(at + u);
const DX = (at) => DUCK.flatMap(([a, b]) => [a, a + 0.5, b - 0.5, b].map((t) => t - at));
{
  const M10 = 300.94, OFF = 185, L1 = r2(Math.min(END, M10 - OFF - 0.1));
  audio.push({ id: 'mus1', src: 'mus1', file: 'music/music10.mp3', at: 0, to: L1, trim: OFF, lane: musLane('music/music10.mp3', OFF, L1, MUS(0), 0.3, END > L1 ? 3 : 2, DX(0)) });
  if (END > L1) {
    const a2 = r2(L1 - 3), L2 = r2(END - a2);
    audio.push({ id: 'mus2', src: 'mus2', file: 'music/music10.mp3', at: a2, to: END, trim: 0, lane: musLane('music/music10.mp3', 0, L2, MUS(a2), 3, 2, DX(a2)) });
  }
}
overlays.push({ name: 'abyss grade + soft crt (v9)', at: 0, to: END, el: () => ({ d: 'AbyGrade', p: {}, k: [] }) });

LOG.push(`VO ${VOS.map((v) => `${v}:${['est', 'wav', 'wav+words', 'rawtake'][VI[v].real]} ${VI[v].len.toFixed(2)}s@${VO0[v]}`).join(' ')}`);
if (process.argv.includes('--log')) console.log(LOG.join('\n') + '\n' + shots.map((s) => `${s.name} ${s.c}-${s.to} (${(s.to - s.c).toFixed(2)}) ${s.k}${s.n || ''}`).join('\n') + `\nEND ${END}`);

const VOU = VOS.filter((v) => HAVE[v]); // only VO files that exist are placed (until the VO lands the part has no narration track)
export default {
  id: 'coc_case05',
  media: 'coc2h',
  end: END,
  tseed: 'coc5t',
  plain: true,
  vo: { starts: VOU.map((v) => VO0[v]), lens: VOU.map((v) => VI[v].len), file: (i) => `vo/${VOU[i]}.wav`, tail: 0 },
  devices: ['shared', 'coc', 'coc_c01', 'coc_v3', 'coc_c01v3', 'coc_c01v4', 'coc_v4', 'coc_v9'],
  fonts: ['Archivo-var-latin.woff2', 'CourierPrime-700-latin.woff2'],
  shots,
  overlays,
  audio,
  voReal: VOREAL,
};
