// lm_lib.mjs - shared builder for last-moments cases 2-21 (2026-11-23). Same look + mix as case 1 (lm_case01a/b), table-driven.
// A case file = import { makeCase, H } from './lm_lib.mjs'; export default makeCase({...}). ALL TIMES = PART SECONDS (absolute).
//
// makeCase({
//   id: 'lm_case02', num: 2, title: 'THE CAMERA THAT KEPT ROLLING INTO THE BLUE HOLE',
//   plate: ['c02/plate.jpg', 'PHOTO: NAME / CC BY-SA 2.0'],      // title-screen still (real photo of the place), credit text
//   vo: [['vo/c02_p01.wav', 6.0], ...],                            // narration files (media-relative) + start s; lengths = ffprobe
//   raws: [{ tag: 'LIP', a: 160.2, b: 185.2, t: 0, mute: true, credit: 'FOOTAGE: ...' }],  // RAW cues (V-R-V-R), picture made for you
//   shots: [[start, end, 'S01 name', (i) => nodes], ...],          // everything that is NOT a raw cue; [start,end) must tile 0..end
//   end: 400.0, music: 0..5 (track set index, optional) })
// Title screen 0..TITLE (5.5 s) is added for you: shots start at TITLE.
//
// Helpers H.* (i = shot index for the camera drift; every text helper adds its click SFX by itself):
//   H.photo(i, 'c02/x.jpg', 'PHOTO: AUTHOR / LICENCE', { bri, pos, mos:[[x,y,w,h]], over:[...] })   still, slow 3-D drift
//   H.par(i, file, credit, o)            2.5-D parallax still (alternate with photo)
//   H.foot(i, 'broll/x', t, o)           stock clip (ILLUSTRATIVE label, graded like raws). file without .mp4
//   H.clip(i, 'TAG', t, o)               raw source footage as b-roll (contain + blurred fill if not 16:9). o: { speed, bri, mono, credit, mos }
//   H.frz(i, 'TAG', t, o)                freeze frame of a raw at source second t
//   H.place(t, 'TEXT', 'SUB')            centred place text, fades in at part second t
//   H.label(t, 'NAME', 'ROLE')           name label, bottom-left inside picture (max 2 per case)
//   H.date(t, 'TEXT')                    top-left date text
//   H.card(t0, bgNode, 'KICK', ['LINE 1', 'LINE 2'], credit)   fade text card over a blurred photo/clip (bgP / bgV)
//   H.bgP(i, file), H.bgV(i, 'TAG' | 'broll/x', t)             blurred backdrops for cards
//   H.art('c02_key', markT)              real article (pages/<key>.jpg + pages/<case>_articles.json via build/art_crop.py); marker at markT
//   H.stamp(t, 'TAG', srcT, { x, y, w, h, rect })              red pill ring on a burned-in camera stamp (freeze), punch-in
//   H.spot(t, cx, cy, r)                 soft spotlight circle
//   H.map(i, 'c02/map.jpg', credit, pins)  blurred/dark map still with pins [{x,y,label,at:t}] (use a real map image)
//   H.dip(inN, outN)                     dip to black frames at the shot start / end
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
export const n = (d, p = {}, ...k) => ({ d, p, k });
export const TITLE = 5.5;
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const cl = (x) => Math.max(0, Math.min(1, x));
const probeCache = {};
const probe = (rel) => probeCache[rel] ??= JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', path.join(MED, rel)]).toString());
export const dur = (rel) => +probe(rel).format.duration;
const dims = (rel) => { const v = probe(rel).streams.find((s) => s.codec_type === 'video'); return [v.width, v.height]; };
const hasAudio = (rel) => probe(rel).streams.some((s) => s.codec_type === 'audio');

// ---- SFX table (case 1): [dur s, I, max M, true peak, peak-at s (-1 = loud at the end)]
const SFX = { lm_boom: [4.183, -21.7, -17.7, -11.6, 0.176], lm_whoosh: [1.549, -19.3, -16.3, -2.4, 0.469], lm_paper: [0.785, -19.9, -19.6, -2.9, 0.039],
  lm_settle: [0.396, -70, -23.2, -0.5, 0.033], lm_marker: [0.525, -14.4, -14.2, -3.0, 0.139], lm_key: [0.11, -70, -25.6, -4.6, 0.016],
  lm_click: [0.365, -70, -22.2, -1.0, 0.223], riser_dark: [5.91, -23.0, -16.7, -10.6, -1], lm_hum: [12, -32.7, -31.4, -19.0, 0] };
const VO_LUFS = -29.2, MUS_T = VO_LUFS - 10, RAW_T = VO_LUFS - 0.5;
// music sets (Epidemic Sound, channel licence): [file, loop start s]; set k = case % sets
export const MUSIC = [['music/es_dark_days.mp3', 'music/es_tarmac_radiation.mp3']];
const extraMusic = path.join(MED, 'music', 'sets.json');
if (fs.existsSync(extraMusic)) for (const s of JSON.parse(fs.readFileSync(extraMusic, 'utf8'))) MUSIC.push(s);

const lufsCache = {};
const shortTerm = (rel) => lufsCache[rel] ??= (() => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, rel), '-map', '0:a:0', '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
})();
// integrated-ish level of [a, b) source seconds from the 0.1 s short-term series (power mean, gated at -60)
const spanLufs = (rel, a, b) => { const S = shortTerm(rel); let p = 0, k = 0;
  for (let i = Math.round(a * 10) + 29; i < Math.min(S.length, Math.round(b * 10) + 1); i++) if (S[i] > -60) { p += Math.pow(10, S[i] / 10); k++; }
  return k ? 10 * Math.log10(p / k) : -70; };

function musLane(file, trim, len, tgt, fin, fout, extra) {
  const S = shortTerm(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  for (let u = 0; u < len; u += 1) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-24, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}

// ---- per-case recording context (helpers log SFX events at part seconds while the table is evaluated once)
let CUR = { c: 0 }, EV = [];
const loc = (t) => Math.max(0, Math.round((t - CUR.c) * 60));
const ev = (name, at, off) => EV.push([name, at, off]);

const DRIFT = [{ ry: [-1.2, 1.2], tx: [-18, 18] }, { ry: [1.0, -1.0], ty: [12, -12] }, { rx: [1.0, -0.6], tx: [16, -16] },
  { ry: [-0.8, 0.9], ty: [-12, 12] }, { rx: [-0.8, 0.8], tx: [-14, 20] }, { ry: [1.3, -0.4], tx: [20, -10] }];
const PAR = [{ ry: [-3, 3], rx: [1, -1] }, { ry: [2.5, -2.5], rx: [-1, 1], tx: [14, -14] }, { ry: [-2, 3], rx: [-0.8, 0.8] }];
const cam = (i, s, css, ...k) => n('Cam', { s, ...DRIFT[i % DRIFT.length], css }, ...k);
const cred = (text, place = 'tr') => (text ? [n('Credit', { text, place, inset: 96 })] : []);
const isRaw = (src) => /^[A-Z0-9]+$/.test(src);

export const H = {
  photo: (i, src, credit, o = {}) => [
    n('Grade', { sat: o.sat ?? 0.42, bri: o.bri ?? 0.85, con: 1.08 }, cam(i, o.s ?? [1.05, 1.13], o.css, n('Img', { src, pos: o.pos }), ...(o.mos ? [n('MosImg', { src, pos: o.pos, boxes: o.mos })] : []))),
    ...cred(credit, o.cp), ...(o.over || [])],
  par: (i, src, credit, o = {}) => [
    n('Grade', { sat: o.sat ?? 0.48, bri: o.bri ?? 0.85, con: 1.08 }, n('Parallax', { src, pos: o.pos, mos: o.mos, ...PAR[i % PAR.length], ...(o.s ? { s: o.s } : {}) })),
    ...cred(credit, o.cp), ...(o.over || [])],
  foot: (i, src, t, o = {}) => [
    n('Grade', { sat: 0.55, bri: o.bri ?? 0.95, con: 1.1 }, cam(i, o.s ?? [1.06, 1.12], o.css, n('_V', { src, trim: t, speed: o.speed ?? 1, fit: 'cover', pos: o.pos }))),
    n('Lbl', { text: 'ILLUSTRATIVE', at: 'bl' }), ...(o.over || [])],
  clip: (i, tag, t, o = {}) => {
    const [sw, sh] = dims(`${tag}.mp4`), wide = Math.abs(sw / sh - 16 / 9) < 0.08;
    return [n('Grade', { mono: !!o.mono, bri: o.bri ?? 0.95, con: 1.1, sat: o.sat },
      cam(i, o.s ?? [1.0, 1.04], '', n('LClip', { src: tag, t, speed: o.speed ?? 1, sw, sh, fit: wide ? 'cover' : 'contain', fill: !wide, push: [1, 1.03] })),
      ...(o.mos ? [n('Mosaic', { boxes: o.mos })] : [])),
    ...cred(o.credit, o.cp), ...(o.over || [])];
  },
  frz: (i, tag, t, o = {}) => [
    n('Grade', { mono: !!o.mono, bri: o.bri ?? 0.95, con: 1.1 },
      n('Cam', { s: [1.2, 1.2], css: 'filter:blur(40px) brightness(.45)' }, n('Frz', { src: tag, n: Math.round(t * 60), fit: 'cover' })),
      n('Cam', { s: o.s ?? [1.0, 1.06], o: o.o }, n('Frz', { src: tag, n: Math.round(t * 60) }))),
    ...cred(o.credit, o.cp), ...(o.over || [])],
  place: (t, text, sub, o = {}) => { ev('lm_click', t - 0.15); return n('PlaceText', { at: loc(t), text, sub, pos: 'c', ...o }); },
  label: (t, name, role, o = {}) => { ev('lm_click', t - 0.15); return n('PlaceText', { at: loc(t), text: name, sub: role, pos: 'bl', left: o.left ?? 140, ...o }); },
  date: (t, text, o = {}) => { ev('lm_click', t - 0.15); return n('TextFade', { at: loc(t), lines: [text], pos: 'tl', ...o }); },
  card: (t, bg, kick, lines, credit) => { ev('lm_click', t + 0.2); return [bg, n('TitleType', { mode: 'fade', kick, lines }), ...cred(credit)]; },
  bgP: (i, src, bri = 0.5) => n('Grade', { sat: 0.3, bri, con: 1.05 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', n('Img', { src }))),
  bgV: (i, src, t, bri = 0.55) => n('Grade', { sat: 0.5, bri, con: 1.08 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', isRaw(src)
    ? n('LClip', { src, t, speed: 1, sw: dims(`${src}.mp4`)[0], sh: dims(`${src}.mp4`)[1], fit: 'cover' }) : n('_V', { src, trim: t, speed: 1, fit: 'cover' }))),
  art: (key, markT, o = {}) => {
    const cs = key.split('_')[0], J = JSON.parse(fs.readFileSync(path.join(MED, 'pages', `${cs}_articles.json`), 'utf8'))[key];
    if (!J) throw new Error(`article ${key} missing`);
    const f0 = loc(markT ?? CUR.c + 1.2);
    ev('lm_paper', CUR.c); ev('lm_settle', CUR.c + 0.45);
    J.bands.forEach((b, j) => ev('lm_marker', CUR.c + (f0 + 26 * j) / 60 - 0.03));
    return [n('Article3D', { ...J, bands: J.bands.map((b, j) => [...b, f0 + 26 * j]), key: o.key ?? 1000, ...o })];
  },
  stamp: (t, tag, srcT, box, o = {}) => { ev('lm_whoosh', t + 0.33 - 0.469);
    return [n('StampRing', { ...box, at: loc(t), zoom: o.zoom ?? 1.6, zin: 50 }, ...H.frz(0, tag, srcT, { s: [1, 1], bri: o.bri }))]; },
  spot: (t, cx, cy, r, hold = 150) => n('SpotC01', { cx, cy, r, at: loc(t), hold }),
  map: (i, src, credit, pins = []) => { pins.forEach((p) => ev('lm_click', p.at - 0.15));
    return [n('Grade', { sat: 0.6, bri: 0.8, con: 1.08, vig: 0.6, grain: 0.07 }, cam(i, [1.04, 1.12], '', n('Img', { src }))),
      ...pins.map((p) => n('PlaceText', { at: loc(p.at), text: p.label, sub: p.sub, x: p.x, y: p.y, size: 34 })), ...cred(credit, 'br')]; },
  dip: (inN = 0, outN = 0) => { if (inN) ev('lm_boom', CUR.c - 0.17, -6); return n('Dip', { inN, outN }); },
};

// ---- title typing ticks (as lm_intro): char k lands at frame fb + ceil((k + 1) / rate)
function titleTicks(a, b, fa, fb, rate) {
  const out = [];
  for (const [txt, f0] of [[a, fa], [b, fb]]) for (let k = 0; k < txt.length; k += 2) {
    if (txt[k] === ' ' && k + 1 < txt.length) k += 1;
    out.push(+((f0 + Math.ceil((k + 1) / rate)) / 60).toFixed(3));
  }
  return out;
}

export function makeCase(C) {
  const end = C.end, TY = { a: `CASE ${C.num}`, b: C.title.toUpperCase(), fa: 24, fb: 62, rate: Math.min(0.6, Math.max(0.3, C.title.length / 120)) };
  const RAWS = C.raws.map((r) => ({ ...r, snd: !r.mute && hasAudio(`${r.tag}.mp4`) }));
  EV = [];
  // shot table: title + given shots + raw shots, sorted; must tile [0, end)
  const rows = [[0, TITLE, 'S00 title', () => [n('CaseTitle', { ...TY, plate: { img: C.plate[0] } }), ...cred(C.plate[1]), n('Dip', { inN: 14 })]],
    ...C.shots, ...RAWS.map((r, j) => [r.a, r.b, `R${j + 1} ${r.tag} raw`, (i) => H.clip(i, r.tag, r.t, { bri: r.bri, credit: r.credit, mos: r.mos, speed: r.speed })])]
    .sort((x, y) => x[0] - y[0]);
  const bad = [];
  rows.forEach((r, j) => { const nx = rows[j + 1]; if (nx && Math.abs(nx[0] - r[1]) > 0.02) bad.push(`${r[2]} ends ${r[1]} but next starts ${nx[0]}`); if (r[1] - r[0] < 1.5 && !/raw/.test(r[2])) bad.push(`${r[2]} shorter than 1.5 s`); });
  if (Math.abs(rows[rows.length - 1][1] - end) > 0.02) bad.push(`last shot ends ${rows[rows.length - 1][1]} != end ${end}`);
  if (bad.length) throw new Error(`${C.id} table: ${bad.join('; ')}`);
  const built = rows.map(([c, to, name, fn], i) => { CUR = { c }; const L = Math.round((to - c) * 60); return { c, to, name, nodes: fn(i, L, (t) => Math.round((t - c) * 60)) }; });

  // ---- mix: music target dips under raws with sound (-6 dB) and after the title (riser/boom handled below)
  const tgt = (t) => { let r = 0; for (const x of RAWS) if (x.snd) r = Math.max(r, cl(Math.min((t - x.a + 0.3) / 0.3, (x.b + 0.3 - t) / 0.3))); return MUS_T - 6 * r; };
  const pts = RAWS.flatMap((x) => [x.a - 0.3, x.a, x.b, x.b + 0.3]);
  const set = MUSIC[(C.music ?? C.num) % MUSIC.length];
  const mus = []; let at = 0, k = 0;
  while (at < end - 1) { // alternate the set's tracks, 6 s crossfades
    const file = set[k % set.length], d = dur(file) - 1, len = Math.min(d, end - at), to = at + len;
    const tg = (u) => tgt(at + u);
    mus.push({ src: `mus_${k}`, id: `mus_${k}`, file, at: +at.toFixed(3), to: +to.toFixed(3), trim: 0, lane: musLane(file, 0, len, tg, at ? 6 : 0.05, to >= end - 0.01 ? 2 : 6, pts.map((t) => t - at)) });
    at = to - 6; k++; if (to >= end - 0.01) break;
  }
  const sfx = (name, t, off = -3) => {
    const [d, , M, , pk] = SFX[name], a0 = pk < 0 ? t + d - 1.5 : t + Math.max(0, pk - 0.05);
    let m = 99; for (let u = 0; u <= (pk < 0 ? 1.5 : Math.min(1.0, d)) + 1e-6; u += 0.05) m = Math.min(m, tgt(a0 + u));
    const g = db(m + off - M), fo = name === 'lm_boom' ? 0.8 : 0.03;
    return { src: name, id: `sfx_${name}_${Math.round(t * 1000)}`, file: `sfx/${name}.wav`, at: +Math.max(0, t).toFixed(3), to: +(Math.max(0, t) + d - 0.02).toFixed(3), lane: [[0, 0], [0.015, g], [+(d - fo - 0.02).toFixed(3), g], [+(d - 0.03).toFixed(3), 0]] };
  };
  const keys = titleTicks(TY.a, TY.b, TY.fa, TY.fb, TY.rate).filter((t) => t < TITLE - 0.2).map((t) => {
    const g = db(MUS_T - 6 - (SFX.lm_key[2] + 10 * Math.log10(0.4 * TY.rate * 30)));
    return { src: 'lm_key', id: `key_${Math.round(t * 1000)}`, file: 'sfx/lm_key.wav', at: t, to: +(t + 0.09).toFixed(3), lane: [[0, 0], [0.005, g], [0.07, g], [0.085, 0]] };
  });
  // raw sound: levelled to the VO (RAW_T), 0.3 s fades; muted raws get a low room tone instead
  const rawAu = RAWS.map((r, j) => {
    if (!r.snd) return { src: 'lm_hum', id: `room_${j}`, file: 'sfx/lm_hum.wav', at: r.a, to: Math.min(r.b, r.a + 11.9), lane: [[0, 0], [0.05, db(-48.2 + 32.7) * 0.6], [Math.min(r.b - r.a, 11.9) - 0.08, db(-48.2 + 32.7) * 0.6], [Math.min(r.b - r.a, 11.9), 0]] };
    const len = r.b - r.a, sp = r.speed ?? 1, g = db(Math.max(-12, Math.min(12, (r.gain ?? 0) + RAW_T - spanLufs(`${r.tag}.mp4`, r.t, r.t + len * sp))));
    return { src: r.tag, id: `raw_${j}`, file: `${r.tag}.mp4`, at: r.a, to: r.b, trim: r.t, lane: [[0, 0], [0.3, g], [+(len - 0.3).toFixed(3), g], [+len.toFixed(3), 0]] };
  });
  const evAu = EV.filter(([nm, t]) => t >= 0 && t < end - 0.3).map(([nm, t, off]) => sfx(nm, t, off ?? -3));
  const rawCut = RAWS.flatMap((r) => (r.a > TITLE + 1 ? [sfx('lm_boom', r.a - 0.17, -4)] : []));
  const MIX = { mus: 0.75, sfx: 0.6 };
  const audio = [...mus, ...rawAu, ...keys, ...evAu, ...rawCut].map((a) => {
    const kk = String(a.src).startsWith('mus') ? MIX.mus : String(a.file || '').startsWith('sfx/') ? MIX.sfx : 1;
    return kk === 1 ? a : { ...a, lane: a.lane.map(([t, g]) => [t, +(g * kk).toFixed(4)]) };
  });
  const vo = C.vo.map(([f, s]) => [f, s, dur(f)]);
  vo.forEach(([f, s, l]) => { if (s + l > end + 0.01) throw new Error(`${f} runs past end`); });
  return {
    id: C.id, media: 'last-moments', end, plain: true,
    vo: { starts: vo.map((v) => v[1]), lens: vo.map((v) => +(v[2] - 0.005).toFixed(3)), file: (i) => vo[i][0], tail: 0 },
    devices: ['shared', 'lm', 'lm_c01b', 'lm_c01a', 'lm_pro', 'lm_mg', 'lm_cases'],
    fonts: ['Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'VCROSDMono-latin.woff2'],
    shots: built.map((s) => ({ name: s.name, c: s.c, to: s.to, k: 'hard', n: 0, el: () => s.nodes })),
    audio,
  };
}
