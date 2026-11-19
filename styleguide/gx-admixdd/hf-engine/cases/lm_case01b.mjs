// lm_case01b - case 1 PART B of "Most Disturbing Last Moment Footage" (devices lm.mjs + lm_c01b.mjs). 60 fps, 309.0 s.
// Shot table = docs/ai-state/last-moments_case01b_HANDOFF.md. VO c01b_p03 at 0, c01b_p04 at 142.40; HCR replay 132.70-142.20.
// Owner bar: every graphic on real footage/photo (blur, grain, vignette), eased 3-D Cam, lit type; one text device at a time.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { counterTicks } from '../devices/lm_mg.mjs';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix: VO -28.8 LUFS I (p03) / -29.1 (p04). Music = VO -10 (-38.8), +6 dB swell in the replay (VO paused), -12 dB in the dip;
// SFX = VO -14 (-42.8) capped at music -1 by max momentary. Lanes copied from lm_intro (levelled music lane).
const MUS_T = -38.8;
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
};
function musLane(file, trim, len, tgt, fin, fout, extra = []) {
  const S = stS(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  for (let u = 0; u < len; u += 0.5) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-24, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}
// dip 132.43-132.93 (-12 dB, 0.1 s ramps); swell +6 dB 132.93-142.20 (0.5 s up, 1.0 s down, ends as p04 VO starts 142.40)
const DIP = [132.43, 132.93], SW = [132.93, 142.2];
const cl = (x) => Math.max(0, Math.min(1, x));
const tgtG = (t) => MUS_T + 6 * cl(Math.min((t - SW[0]) / 0.5, (SW[1] - t) / 1.0)) - 12 * cl(Math.min((t - DIP[0] + 0.1) / 0.1, (DIP[1] + 0.1 - t) / 0.1));
const tgtAt = (at) => (u) => tgtG(at + u);
const ptsAt = (at) => [DIP[0] - 0.1, DIP[0], DIP[1], DIP[1] + 0.1, SW[0] + 0.5, SW[1] - 1, SW[1]].map((t) => t - at);

// SFX helpers copied from lm_case01a (docs/ai-state/last-moments_sfx_HANDOFF.md): each SFX max M = music target - 3 dB, typing -6
const SFX = { lm_boom: [4.183, -21.7, -17.7, -11.6, 0.176], lm_whoosh: [1.549, -19.3, -16.3, -2.4, 0.469], lm_brush: [0.775, -19.8, -17.5, -3.1, 0.03],
  lm_paper: [0.785, -19.9, -19.6, -2.9, 0.039], lm_settle: [0.396, -70, -23.2, -0.5, 0.033], lm_marker: [0.525, -14.4, -14.2, -3.0, 0.139],
  lm_key: [0.11, -70, -25.6, -4.6, 0.016], lm_click: [0.365, -70, -22.2, -1.0, 0.223], riser_dark: [5.91, -23.0, -16.7, -10.6, -1], lm_hum: [12, -32.7, -31.4, -19.0, 0],
  tick_soft: [0.32, -70, -31.5, -10.5, 0.02] }; // v5: tick M estimated (0.32 s file, too short for ebur128 M; peak -10.5)
const sfx = (name, at, off = -3, len) => {
  const [d0, , M, , pk] = SFX[name], d = len ?? d0, a0 = pk < 0 ? at + d - 1.5 : at + Math.max(0, pk - 0.05);
  let m = 99; for (let u = 0; u <= (pk < 0 ? 1.5 : Math.min(1.0, d)) + 1e-6; u += 0.05) m = Math.min(m, tgtG(a0 + u));
  const g = db(m + off - M), fo = name === 'lm_boom' ? 0.8 : 0.03;
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at: +at.toFixed(3), to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.015, g], [+(d - fo - 0.02).toFixed(3), g], [+(d - 0.03).toFixed(3), 0]] };
};
// ---- picture helpers. i = shot index (varies the 3-D camera drift); all frame numbers shot-local @60.
const MET = 'FOOTAGE: METROPOLITAN POLICE';
const PH = {
  hans_crescent_harrods_side: "DANIEL X. O'NEIL / CC BY 2.0", brompton_road_knightsbridge: 'LEWIS CLARKE / CC BY-SA 2.0', c01b_brompton_mos: 'LEWIS CLARKE / CC BY-SA 2.0', hans_crescent_sign: 'ELL BROWN / CC BY-SA 2.0',
  hans_crescent_geograph: 'LEWIS CLARKE / CC BY-SA 2.0', sloane_street: 'LEWIS CLARKE / CC BY-SA 2.0',
  sis_building_vauxhall: 'COLIN SMITH / CC BY-SA 2.0', sis_building_vauxhall_b: 'RICHARD COOKE / CC BY-SA 2.0',
  valley_anglesey_church: 'PETER WOOD / CC BY-SA 2.0', westminster_coroners_court: 'THE WUB / CC BY-SA 4.0',
  valley_anglesey_station: 'NEIL THEASBY / CC BY-SA 2.0', geo_alderney_st: 'DAVID HOWARD / CC BY-SA 2.0', geo_pimlico_corner: 'IAN CAPPER / CC BY-SA 2.0',
  geo_coroners_court: 'THOMAS NUGENT / CC BY-SA 2.0', geo_coroners_engraving: 'CHRISTINE MATTHEWS / CC BY-SA 2.0', geo_sis_bridge: 'N CHADWICK / CC BY-SA 2.0',
};
const DRIFT = [
  { ry: [-1.2, 1.2], tx: [-18, 18] }, { ry: [1.0, -1.0], ty: [12, -12] }, { rx: [1.0, -0.6], tx: [16, -16] },
  { ry: [-0.8, 0.9], ty: [-12, 12] }, { rx: [-0.8, 0.8], tx: [-14, 20] }, { ry: [1.3, -0.4], tx: [20, -10] },
];
const cam = (i, s, css, ...k) => n('Cam', { s, ...DRIFT[i % DRIFT.length], css }, ...k);
const BR = { pad_gate: 'padlock_gate_chain_illustrative', pad_red: 'padlock_red_rail_illustrative' };
// QA 1: per-source brightness (stills YAVG at bri 1: hallway 8, rain window 6-17, empty hallway 16, gate padlock 22-27, rest 52-86)
const SB = { dark_empty_hallway: 3.0, rain_window_night: 3.0, empty_hallway: 2.4, pad_gate: 1.9, pad_red: 1.0, london_rain_street_a: 1.05, regent_street_rain_night: 1.05, snowdonia_a: 0.8 };
const vid = (name, t, o = {}) => n('_V', { src: name.length <= 3 ? name : `broll/${BR[name] || name}`, trim: t, speed: o.speed ?? 1, fit: 'cover', pos: o.pos });
// Pexels b-roll: same colour grade as raws (owner 2026-11-19: never B&W) + ILLUSTRATIVE; o.inCam = overlays that ride the camera (RedCircle), outside the mono grade
const foot = (i, name, t, o = {}) => {
  const s = o.s ?? [1.06, 1.12];
  return [
    n('Grade', { sat: 0.55, bri: (o.bri ?? 1.0) * (SB[name] ?? 1), con: o.con ?? (SB[name] > 1.5 ? 1.0 : 1.1), vig: o.vig }, cam(i, s, o.css, vid(name, t, o))),
    ...(o.inCam ? [cam(i, s, '', ...o.inCam)] : []),
    n('Lbl', { text: 'ILLUSTRATIVE', at: o.lbl || 'bl' }), ...(o.over || []),
  ];
};
const photo = (i, file, o = {}) => [
  n('Grade', { sat: 0.3, bri: o.bri ?? 0.6, con: 1.06, vig: 0.72 }, cam(i, o.s ?? [1.05, 1.13], o.css, n('Img', { src: `photos/${file}.jpg`, pos: o.pos }))),
  n('Credit', { text: `PHOTO: ${PH[file]}`, place: o.cp || 'tr' }), ...(o.over || []),
];
// blurred backdrop for title cards / quote / page
const bgV = (i, name, t, bri = 0.8) => n('Grade', { sat: 0.55, bri: bri * (SB[name] ?? 1), con: 1.0 }, cam(i, [1.1, 1.18], 'filter:blur(10px)', vid(name, t)));
const bgP = (i, file, bri = 0.5, pos) => n('Grade', { sat: 0.3, bri, con: 1.05 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', n('Img', { src: `photos/${file}.jpg`, pos })));
// HCR last frame (640x480): contain over its own blurred fill
const hcrStill = (bri, s, extra = []) => [
  n('Grade', { sat: 0.55, bri, con: 1.1 },
    n('Cam', { s: [1.2, 1.2], css: 'filter:blur(40px) brightness(.4)' }, n('Img', { src: 'stills/c01b_hcr_last.jpg' })),
    n('Cam', { s, o: '50% 60%' }, n('Img', { src: 'stills/c01b_hcr_last.jpg', fit: 'contain' }))),
  ...extra,
];
const raw = (src, t, bri, place) => [
  n('Grade', { bri, con: 1.1 }, cam(1, [1.0, 1.04], '', n('LClip', { src, t, sw: 640, sh: 480, fit: 'contain', fill: true, push: [1, 1.03] }))),
  n('Credit', { text: MET, place, inset: 296 }), // v6: inside the 4:3 picture
];
// ---- v2 (owner 2026-11-19): pro kit (lm_pro), real articles full-bleed, no stock file more than 2x (new nb_* clips), SFX as part A.
const rj = (f) => { try { return JSON.parse(fs.readFileSync(path.join(MED, f), 'utf8')); } catch { return {}; } };
const NM = rj('c01b_new_media.json'), ART = rj('pages/c01b_articles.json');
for (const [k, v] of Object.entries(NM)) if (v.type === 'video' && v.yavg) SB[k] = +Math.max(0.42, Math.min(2.4, 62 / v.yavg)).toFixed(2);
const EV = { brush: [], click: [], art: [], whoosh: [], tick: [], marker: [] }; // SFX events (part s), filled while the shot table is written
const tcard = (bg, kick, lines, c, to) => {
  const tot = [kick, ...lines].reduce((a, t) => a + t.length + 4, 0), cps = Math.max(22, Math.ceil(tot / (to - c - 1.5)));
  EV.click.push(c + 8 / 60); // v4: fade mode + click (typewriter only on title screens)
  return [bg, n('TitleType', { mode: 'fade', kick, lines, cps })];
};
// v4 plain text on the footage (owner 2026-11-19): place / name = PlaceText, date = TextFade top-left; each with a click; ~3 s hold
// v6 (owner 2026-11-19 "less lower thirds; write the place in the centre"): places + minor names centred (pos 'c'); the one corner
// name label in this part = DCI Jacqueline Sebire (case 1 total: Gareth Williams + Sebire)
const place = (L, at, text, c, o = {}) => { EV.click.push(c + at / 60); return n('PlaceText', { text, at, hold: Math.min(170, L - at - 30), pos: 'c', ...o }); };
const dateT = (L, at, text, c) => { EV.click.push(c + at / 60); return n('TextFade', { lines: [text], pos: 'tl', at, hold: Math.min(150, L - at - 26) }); };
const tag = (L, at, name, role, pin, c, pos) => { EV.brush.push(c + at / 60); return n('LowerThird', { at, name, role, pin, pos, hold: Math.max(60, L - at - 48 - 16 - 6) }); };
// real article (pages/c01b_articles.json, written by productions/last-moments/build/c01b_articles.py); fb = stock fallback if the page is missing
const art = (k, c, f0, fb) => { const a = ART[k]; if (!a) return fb;
  EV.art.push([c, f0, a.bands.length]);
  return [n('Article3D', { img: a.img, iw: a.iw, ih: a.ih, src: a.src, date: a.date, bands: a.bands.map((b, j) => [...b, f0 + 28 * j]) })]; };

// ---- v5 (owner 2026-11-19: "too much stock", "more motion graphics"): lm_mg devices on real photos/pages, stock 61 % -> ~22 %
const par = (i, file, o = {}) => [
  n('Grade', { sat: 0.3, bri: o.bri ?? 0.62, con: 1.06, vig: 0.72 }, n('Parallax', { src: `photos/${file}.jpg`, pos: o.pos, s: o.s, ry: DRIFT[i % DRIFT.length].ry ? [-3, 3] : [3, -3] })),
  n('Credit', { text: `PHOTO: ${PH[file]}`, place: o.cp || 'tr' }), ...(o.over || []),
];
const TLN = [['16 AUG 2010', 'BELIEVED DEAD'], ['23 AUG 2010', 'FOUND IN HIS FLAT'], ['6 SEP 2010', 'POLICE APPEAL'], ['2 MAY 2012', 'INQUEST VERDICT'],
  ['NOV 2013', 'MET REVIEW'], ['OCT 2015', 'KGB CLAIM'], ['NOV 2023', 'FORENSIC REPORT']];
// timeline grows: nodes 0..k-1 already lit, node k lights at local frame at (its VO word)
// v5b (lead): Timeline at most 3x; pre = {node: frame} lights earlier nodes inside this shot (camera dollies node to node)
const tline = (i, k, at, c, bgFile, pre = {}) => { EV.click.push(c + at / 60, ...Object.values(pre).map((f) => c + f / 60)); EV.whoosh.push(c + (at - 36) / 60 - 0.25);
  return [n('Timeline', { nodes: TLN.slice(0, k + 1).map(([date, label], j) => ({ date, label, at: j === k ? at : pre[j] ?? -120 })) }, bgP(i, bgFile, 0.42))]; };
const counter = (i, c, o, bgFile) => { EV.tick.push(...counterTicks(c + (o.at ?? 10) / 60, o.from ?? 0, o.to, o.dur ?? 80, 0.12)); EV.click.push(c + ((o.at ?? 10) + (o.dur ?? 80)) / 60 + 0.1);
  return [n('Counter', o, bgP(i, bgFile, 0.42))]; };
const art5 = (k, c, f0) => { const a = ART[k]; EV.art.push([c, f0, a.bands.length]);
  return [n('Article3H', { img: a.img, iw: a.iw, ih: a.ih, src: a.src, date: a.date, bands: a.bands.map((b, j) => [...b, f0 + 28 * j]) })]; };
const INQ = { img: 'pages/c01b_inquest_crop.jpg', iw: 1250, ih: 730, bands: [[99, 388, 968, 52], [87, 448, 314, 52]], src: 'RTE NEWS', date: '2 MAY 2012' };

// shot table: [start, end, name, (i, L = len f, A = part s -> local f) => nodes]. Stock use count per file <= 2 (different trim + zoom).
const T = [
  // p03 (0-132.70)
  [0, 5.40, 'B00 harrods side', (i) => photo(i, 'hans_crescent_harrods_side')],
  [5.40, 10.00, 'B01 brompton road', (i) => photo(i, 'c01b_brompton_mos', { s: [1.04, 1.14] })],
  [10.00, 15.90, 'B02 sloane street', (i, L, A) => photo(i, 'sloane_street', { over: [place(L, A(11.2), 'SLOANE STREET', 10, { sub: 'KNIGHTSBRIDGE' })] })],
  [15.90, 20.40, 'B03 HCR last frame', (i) => hcrStill(0.72, [1.0, 1.06], [n('Credit', { text: MET })])],
  [20.40, 24.00, 'B04 route map', (i) => { EV.click.push(20.4 + 20 / 60, 20.4 + 150 / 60); return [n('Grade', { sat: 1, con: 1.05, bri: 1, vig: 0.55, grain: 0.07 }, n('RouteMap', { z12: 'c01a/map_z12.jpg', z14: 'c01a/map_z14.jpg', off: [-5376, -3072, 4],
    pins: [{ x: 1950.2, y: 1212.0, label: 'KNIGHTSBRIDGE', time: '15 AUG · LAST SEEN', at: 20 }, { x: 2165.8, y: 1387.9, label: 'PIMLICO', time: 'HIS FLAT', at: 150 }] })),
    n('Credit', { text: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', place: 'br' })]; }],
  [24.00, 28.70, 'B05 counter week', (i) => counter(i, 24.0, { to: 7, unit: 'DAYS', label: 'NO ONE CHECKED ON HIM', at: 20, dur: 110 }, 'geo_pimlico_corner')],
  [28.70, 31.90, 'B06 SIS', (i) => photo(i, 'sis_building_vauxhall')],
  [31.90, 36.00, 'B07 timeline 23 aug', (i) => tline(i, 1, 38, 31.9, 'hans_crescent_geograph')],
  [36.00, 41.00, 'B08 alderney st', (i, L, A) => par(i, 'geo_alderney_st', { over: [place(L, A(39.4), '36 ALDERNEY STREET', 36, { sub: 'PIMLICO' })] })],
  [41.00, 46.60, 'B09 article 2010', (i) => art('c01b2', 41, 50, foot(i, 'nb_holdall_bag', 10))],
  [46.60, 50.10, 'B10 phone sim', (i) => foot(i, 'nb_phone_sim', 9, { s: [1.14, 1.2] })],
  [50.10, 54.30, 'B11 pimlico windows', (i) => photo(i, 'geo_pimlico_corner', { pos: '30% 32%', s: [1.22, 1.3] })],
  [54.30, 60.10, 'B12 padlock gate', (i, L, A) => foot(i, 'pad_gate', 0, { inCam: [n('RedCircle', { cx: 972, cy: 565, rx: 120, ry: 105, at: A(57.9) })] })],
  [60.10, 63.80, 'B13 card the key', (i) => tcard(bgP(i, 'geo_pimlico_corner', 0.45), 'INSIDE THE BAG', ['THE KEY TO THE PADLOCK'], 60.1, 63.8)],
  [63.80, 67.70, 'B14 forensic lab', (i) => foot(i, 'nb_forensic_lab', 6, { s: [1.2, 1.28], bri: 0.72, con: 1.2, vig: 0.8 })],
  [67.70, 73.40, 'B15 coroners engraving', (i) => par(i, 'geo_coroners_engraving')],
  [73.40, 78.40, 'B16 padlock red', (i, L, A) => foot(i, 'pad_red', 0, { pos: '50% 59%', inCam: [n('RedCircle', { cx: 625, cy: 668, rx: 182, ry: 192, at: A(74.3) })] })],
  [78.40, 85.80, 'B17 card forensics', (i) => tcard(bgP(i, 'geo_coroners_court', 0.42), 'POST MORTEM / FORENSICS', ['NO FINGERPRINTS', 'NO GLOVES'], 78.4, 85.8)],
  [85.80, 90.80, 'B19 date appeal', (i, L, A) => photo(i, 'brompton_road_knightsbridge', { s: [1.08, 1.16], over: [dateT(L, A(86.58), '6 SEPTEMBER 2010', 85.8)] })],
  [90.80, 94.20, 'B20 HPK raw', () => raw('HPK', 0, 0.85, 'tl')],
  [94.20, 97.70, 'B21 HCR raw', () => raw('HCR', 0, 0.7, 'tr')],
  [97.70, 104.90, 'B22 article appeal', () => art5('c01b5', 97.7, 66)],
  [104.90, 114.30, 'B24 pimlico sebire', (i, L, A) => par(i, 'geo_pimlico_corner', { over: [place(L, A(105.9), 'JACQUELINE SEBIRE', 104.9, { sub: 'DETECTIVE CHIEF INSPECTOR, MET', pos: 'bl' })] })],
  [114.30, 118.50, 'B26 forensic lab', (i) => foot(i, 'nb_forensic_lab', 0, { s: [1.16, 1.22], bri: 0.85 })],
  [118.50, 123.40, 'B27 code screen', (i) => foot(i, 'nb_code_screen', 3)],
  [123.40, 128.40, 'B28 holdall', (i) => foot(i, 'nb_holdall_bag', 2)],
  [128.40, 132.70, 'B29 hans crescent', (i) => [...photo(i, 'hans_crescent_sign'), n('Dip', { outN: 16 })]],
  // replay (VO paused): StampRing on the burned-in HCR stamp (screen box 243,1029 484x40; picture rect 240..1680), ring outside the mono grade
  [132.70, 139.20, 'B30 REPLAY', () => [
    n('StampRing', { x: 222, y: 1029, w: 526, h: 40, rect: [150, 0, 1620, 1080], at: 70, zoom: 1.32, zin: 46 },
      n('Grade', { mono: true, bri: 0.78, con: 1.12 },
        n('LClip', { src: 'HCR', t: 0, speed: 0.5, sw: 640, sh: 480, fit: 'contain', fill: true, until: 390, push: [1, 1] }))),
    n('Lbl', { text: 'REPLAY', at: 'tl' }), n('Credit', { text: MET, hold: 360 }), n('Dip', { inN: 14 }),
  ]],
  [139.20, 142.20, 'B30b CCTV analyse', () => { EV.click.push(139.2 + 76 / 60); return [n('CCTVAnalyse', { src: 'HCR', n: 195, box: [270, 420, 390, 420], at: 16, zin: 60, tag: 'LAST SEEN', dpos: 'tr', g: { sat: 0.55, bri: 0.85, con: 1.1 },
    data: [['CAM', 'CH 1'], ['DATE', '15 AUG 2010'], ['TIME', '14:27:28'], ['LOC', 'HANS CRESCENT']] }), n('Grade', { vig: 0.75 }), n('Credit', { text: MET, place: 'bl' })]; }],
  // p04 (142.40-)
  [142.20, 145.60, 'B31 coroners court', (i, L, A) => photo(i, 'westminster_coroners_court', { pos: '35% 50%', s: [1.14, 1.2], over: [place(L, A(142.6), "WESTMINSTER CORONER'S COURT", 142.2, { sub: 'INQUEST, 2012' })] })],
  [145.60, 150.40, 'B32 court engraving', (i) => photo(i, 'geo_coroners_engraving', { s: [1.12, 1.2], pos: '50% 35%' })],
  [150.40, 155.60, 'B33 SIS bridge', (i) => par(i, 'geo_sis_bridge')],
  [155.60, 160.40, 'B34 counter 400', (i) => counter(i, 155.6, { to: 400, label: 'ATTEMPTS · TWO EXPERTS', at: 30, dur: 90 }, 'westminster_coroners_court')],
  [160.40, 164.80, 'B35 card two experts', (i) => tcard(bgP(i, 'sis_building_vauxhall_b', 0.42), 'AN IDENTICAL BAG', ['NEITHER GOT IN'], 160.4, 164.8)],
  [164.80, 170.40, 'B36 court parallax', (i) => par(i, 'geo_coroners_court')],
  [170.40, 174.00, 'B37 empty hallway', (i) => foot(i, 'empty_hallway', 4)],
  [174.00, 177.40, 'B38 counter minutes', (i) => counter(i, 174.0, { to: 3, unit: 'MIN', label: 'CO2: TWO OR THREE MINUTES', at: 96, dur: 60 }, 'westminster_coroners_court')],
  [177.40, 180.40, 'B39 timeline verdict', (i) => tline(i, 3, 38, 177.4, 'geo_coroners_engraving')],
  [180.40, 183.60, 'B40 court wilcox', (i, L, A) => photo(i, 'geo_coroners_court', { pos: '50% 40%', s: [1.12, 1.2], over: [place(L, A(180.6), 'DR FIONA WILCOX', 180.4, { sub: 'CORONER' })] })],
  [183.60, 189.80, 'B41 inquest page', () => { EV.art.push([183.6, 34, 2]); return [n('Article3D', { img: 'pages/c01b_inquest_crop.jpg', iw: 1250, ih: 730, src: 'RTE NEWS', date: '2 MAY 2012', bands: [[99, 388, 968, 52, 34], [87, 448, 314, 52, 78]] })]; }],
  [189.80, 194.00, 'B42 padlock gate', (i) => foot(i, 'pad_gate', 7, { s: [1.16, 1.22] })],
  [194.00, 201.60, 'B43 article verdict', () => art5('c01b6', 194.0, 40)],
  [201.60, 205.40, 'B45 newspapers', (i) => foot(i, 'nb_newspapers', 5, { s: [1.16, 1.22] })],
  [205.40, 209.40, 'B46 coroners court', (i) => photo(i, 'westminster_coroners_court', { pos: '70% 50%', s: [1.12, 1.2] })],
  [209.40, 213.60, 'B47 counter sticks', (i) => counter(i, 209.4, { to: 9, unit: 'MEMORY STICKS', label: 'AT HIS MI6 OFFICE', at: 14, dur: 70 }, 'sis_building_vauxhall')],
  [213.60, 217.40, 'B48 SIS b', (i) => photo(i, 'sis_building_vauxhall_b')],
  [217.40, 220.60, 'B49 usb close', (i) => foot(i, 'nb_usb_sticks', 9, { s: [1.2, 1.28] })],
  [220.60, 224.60, 'B50 date met', (i, L, A) => par(i, 'hans_crescent_geograph', { over: [dateT(L, A(220.98), 'NOVEMBER 2013', 220.6)] })],
  [224.60, 228.60, 'B51 article 2013', (i) => art('c01b3', 224.6, 40, foot(i, 'nb_cyclist_hills', 0))],
  [228.60, 233.60, 'B52 SIS hewitt', (i, L, A) => photo(i, 'sis_building_vauxhall', { pos: '60% 50%', s: [1.14, 1.2], over: [place(L, A(229.0), 'MARTIN HEWITT', 228.6, { sub: 'DEPUTY ASSISTANT COMMISSIONER, MET' })] })],
  [233.60, 237.60, 'B53 card accident', (i) => tcard(bgP(i, 'geo_alderney_st', 0.42), 'THE MET, 2013', ['LOCKED HIMSELF IN', 'BY ACCIDENT'], 233.6, 237.6)],
  [237.60, 241.60, 'B54 valley church', (i) => photo(i, 'valley_anglesey_church')],
  [241.60, 245.60, 'B55 thames', (i) => foot(i, 'nb_thames_night', 9, { s: [1.2, 1.28] })],
  [245.60, 249.60, 'B56 date 2015', (i, L, A) => photo(i, 'sis_building_vauxhall_b', { pos: '30% 50%', s: [1.14, 1.22], over: [dateT(L, A(247.94), 'OCTOBER 2015', 245.6)] })],
  [249.60, 254.60, 'B57 article karpichkov', () => art5('c01b7', 249.6, 40)],
  [254.60, 258.00, 'B58 moscow karpichkov', (i, L, A) => foot(i, 'nb_moscow', 8, { s: [1.24, 1.32], lbl: 'tl', over: [place(L, A(254.8), 'BORIS KARPICHKOV', 254.6, { sub: 'FORMER KGB OFFICER' })] })],
  [258.00, 261.60, 'B59 code screen', (i) => foot(i, 'nb_code_screen', 9, { s: [1.2, 1.28] })],
  [261.60, 265.40, 'B60 documents', (i) => foot(i, 'nb_documents_desk', 6, { s: [1.16, 1.22], bri: 0.8 })],
  [265.40, 270.40, 'B61 london rain a', (i) => foot(i, 'london_rain_street_a', 2, { s: [1.18, 1.26] })],
  [270.40, 275.00, 'B62 timeline 2023', (i) => tline(i, 6, 179, 270.4, 'geo_pimlico_corner', { 5: 70 })],
  [275.00, 282.20, 'B64 article 2024', () => art5('c01b4', 275.0, 150)],
  [282.20, 287.00, 'B65 valley station', (i) => par(i, 'valley_anglesey_station', { cp: 'br' })],
  [287.00, 291.60, 'B66 valley church', (i, L, A) => photo(i, 'valley_anglesey_church', { pos: '40% 55%', s: [1.14, 1.22], cp: 'br', over: [dateT(L, A(287.1), '26 SEPTEMBER 2010', 287), place(L, A(288.4), 'VALLEY, ANGLESEY', 287)] })],
  [291.60, 295.40, 'B67 SIS sawers', (i, L, A) => par(i, 'geo_sis_bridge', { over: [place(L, A(292.8), 'SIR JOHN SAWERS', 291.6, { sub: 'HEAD OF MI6' })] })],
  [295.40, 300.40, 'B68 quote headstone', (i) => [
    n('Grade', { sat: 0.3, bri: 0.6, con: 1.06 }, cam(i, [1.06, 1.16], 'filter:blur(3px) sepia(.3)', n('Img', { src: 'photos/valley_anglesey_church.jpg' }))),
    n('QuoteC', { lines: ['Free to run', 'in the mountains.'], attr: 'HIS HEADSTONE, VALLEY', at: 98 }),
  ]],
  [300.40, 309.00, 'B69 docstack', () => { EV.whoosh.push(300.4 + 40 / 60 - 0.5, 300.4 + 330 / 60 - 0.5); EV.marker.push(300.4 + 52 / 60, 300.4 + 78 / 60, 300.4 + 342 / 60);
    return [n('DocStack', { docs: [{ ...INQ, at: 40 }, { ...ART.c01b3, at: 330 }] }, ...hcrStill(0.4, [1.0, 1.06])), n('Dip', { outN: 30 })]; }],
];
const SHOTS = T.map(([c, to, name, fn], i) => {
  const L = Math.round((to - c) * 60), A = (t) => Math.round((t - c) * 60), el = fn(i, L, A);
  return { name, c, to, k: 'hard', n: 0, el: () => el };
});
// SFX list: device events -> part-A families; no two SFX starts within 0.3 s (typing keys exempt, they are a stream)
const FX = [
  ...EV.brush.map((t) => sfx('lm_brush', t)), ...EV.click.map((t) => sfx('lm_click', t - 0.15)),
  ...EV.art.flatMap(([c, f0, nb]) => [sfx('lm_paper', c), sfx('lm_marker', c + f0 / 60 - 0.03), ...(nb > 1 ? [sfx('lm_marker', c + (f0 + (c === 183.6 ? 44 : 28)) / 60 - 0.03)] : []), ...(nb > 2 ? [sfx('lm_marker', c + (f0 + 56) / 60 - 0.03)] : [])]),
  ...EV.whoosh.map((t) => sfx('lm_whoosh', t)), ...EV.marker.map((t) => sfx('lm_marker', t - 0.03)), ...EV.tick.map((t) => sfx('tick_soft', t, -8)),
  sfx('lm_whoosh', 132.70 - 0.47), sfx('riser_dark', 178.25), sfx('lm_boom', 184.16 - 0.17),
].sort((a, b) => a.at - b.at).filter(((last) => (e) => { if (e.src === 'tick_soft') return true; const ok = e.at - last >= 0.3; if (ok) last = e.at; return ok; })(-9));

// v6 mix (owner 2026-11-19 "narration 100 %, music 75 %, SFX 60 %, all the SFX"): gains on top of the levelled mix above
// (music -2.5 dB, every sfx/ file -4.4 dB; VO and raw footage sound unchanged)
const MIX = { mus: 0.75, sfx: 0.6 };
const mixScale = (A) => A.map((a) => { const k = String(a.src).startsWith('mus') ? MIX.mus : String(a.file || '').startsWith('sfx/') ? MIX.sfx : 1;
  return k === 1 ? a : { ...a, lane: a.lane.map(([t, g]) => [t, +(g * k).toFixed(4)]) }; });

export default {
  id: 'lm_case01b',
  media: 'last-moments',
  end: 309.0,
  plain: true,
  vo: { starts: [0, 142.40], lens: [132.86, 165.84], file: (i) => ['vo/c01b_p03.wav', 'vo/c01b_p04.wav'][i], tail: 0 },
  devices: ['shared', 'lm', 'lm_c01a', 'lm_c01b', 'lm_pro', 'lm_mg'],
  fonts: ['Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'SourceSerif4-var-latin.woff2', 'VCROSDMono-latin.woff2'],
  shots: SHOTS,
  audio: mixScale([
    { src: 'mus_a', id: 'mus_a1', file: 'music/es_dark_days.mp3', at: 0, to: 115.9, lane: musLane('music/es_dark_days.mp3', 0, 115.9, tgtAt(0), 1.5, 5.9, ptsAt(0)) },
    { src: 'mus_b', id: 'mus_b', file: 'music/es_tarmac_radiation.mp3', at: 110, to: 225.6, lane: musLane('music/es_tarmac_radiation.mp3', 0, 115.6, tgtAt(110), 6, 5.6, ptsAt(110)) },
    { src: 'mus_a', id: 'mus_a2', file: 'music/es_dark_days.mp3', at: 220, to: 309, trim: 10, lane: musLane('music/es_dark_days.mp3', 10, 89, tgtAt(220), 5.6, 1.5) },
    ...FX, // v4: no lm_key ticks (no title screens in part B)
  ]),
};
