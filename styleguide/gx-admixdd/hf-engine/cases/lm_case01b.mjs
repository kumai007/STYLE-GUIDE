// lm_case01b - case 1 PART B of "Most Disturbing Last Moment Footage" (devices lm.mjs + lm_c01b.mjs). 60 fps, 309.0 s.
// Shot table = docs/ai-state/last-moments_case01b_HANDOFF.md. VO c01b_p03 at 0, c01b_p04 at 142.40; HCR replay 132.70-142.20.
// Owner bar: every graphic on real footage/photo (blur, grain, vignette), eased 3-D Cam, lit type; one text device at a time.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix: VO -28.8 LUFS I (p03) / -29.1 (p04). Music = VO -10 (-38.8), +6 dB swell in the replay (VO paused), -12 dB in the dip;
// SFX = VO -14 (-42.8) capped at music -1 by max momentary. Lanes copied from lm_intro (levelled music lane).
const MUS_T = -38.8, SFX_T = -42.8;
const SFX = { boom_low: [3.5, -24.4, -20.7, -3.0], riser_dark: [5.91, -23.0, -16.7, -10.6] };
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const sfx = (name, at, gdB, len) => {
  const [d0, L, M] = SFX[name], d = len ?? d0, g = db(gdB ?? Math.min(SFX_T - L, MUS_T - 1 - M));
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at, to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.02, g], [d - 0.1, g], [d - 0.03, 0]] };
};
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

// ---- picture helpers. i = shot index (varies the 3-D camera drift); all frame numbers shot-local @60.
const MET = 'FOOTAGE: METROPOLITAN POLICE';
const PH = {
  hans_crescent_harrods_side: "DANIEL X. O'NEIL / CC BY 2.0", brompton_road_knightsbridge: 'LEWIS CLARKE / CC BY-SA 2.0',
  hans_crescent_geograph: 'LEWIS CLARKE / CC BY-SA 2.0', sloane_street: 'LEWIS CLARKE / CC BY-SA 2.0',
  sis_building_vauxhall: 'COLIN SMITH / CC BY-SA 2.0', sis_building_vauxhall_b: 'RICHARD COOKE / CC BY-SA 2.0',
  valley_anglesey_church: 'PETER WOOD / CC BY-SA 2.0', westminster_coroners_court: 'THE WUB / CC BY-SA 4.0',
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
// Pexels b-roll: mono grade + ILLUSTRATIVE; o.inCam = overlays that ride the camera (RedCircle), outside the mono grade
const foot = (i, name, t, o = {}) => {
  const s = o.s ?? [1.06, 1.12];
  return [
    n('Grade', { mono: true, bri: (o.bri ?? 1.0) * (SB[name] ?? 1), con: SB[name] > 1.5 ? 1.0 : 1.1 }, cam(i, s, o.css, vid(name, t, o))),
    ...(o.inCam ? [cam(i, s, '', ...o.inCam)] : []),
    n('Lbl', { text: 'ILLUSTRATIVE', at: o.lbl || 'bl' }), ...(o.over || []),
  ];
};
const photo = (i, file, o = {}) => [
  n('Grade', { sat: 0.3, bri: o.bri ?? 0.6, con: 1.06, vig: 0.72 }, cam(i, o.s ?? [1.05, 1.13], o.css, n('Img', { src: `photos/${file}.jpg`, pos: o.pos }))),
  n('Credit', { text: `PHOTO: ${PH[file]}`, place: o.cp || 'tr' }), ...(o.over || []),
];
// blurred backdrop for title cards / quote / page
const bgV = (i, name, t, bri = 0.8) => n('Grade', { mono: true, bri: bri * (SB[name] ?? 1), con: 1.0 }, cam(i, [1.1, 1.18], 'filter:blur(10px)', vid(name, t)));
const bgP = (i, file, bri = 0.5, pos) => n('Grade', { sat: 0.3, bri, con: 1.05 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', n('Img', { src: `photos/${file}.jpg`, pos })));
const tcard = (bg, kick, lines) => [bg, n('TCard', { kick, lines })];
// HCR last frame (640x480): contain over its own blurred fill
const hcrStill = (bri, s, extra = []) => [
  n('Grade', { mono: true, bri, con: 1.1 },
    n('Cam', { s: [1.2, 1.2], css: 'filter:blur(40px) brightness(.4)' }, n('Img', { src: 'stills/c01b_hcr_last.jpg' })),
    n('Cam', { s, o: '50% 60%' }, n('Img', { src: 'stills/c01b_hcr_last.jpg', fit: 'contain' }))),
  ...extra,
];
const raw = (src, t, bri, place) => [
  n('Grade', { bri, con: 1.1 }, cam(1, [1.0, 1.04], '', n('LClip', { src, t, sw: 640, sh: 480, fit: 'contain', fill: true, push: [1, 1.03] }))),
  n('Credit', { text: MET, place }),
];
// Tag hold so the out (24 f) ends 6 f before the cut
const tag = (L, at, name, role, pin) => n('Tag', { at, name, role, pin, hold: Math.max(60, L - at - 48 - 24 - 6) });

// shot table: [start, end, name, (i, L = len f, A = part s -> local f) => nodes]
const T = [
  // p03 (0-132.70)
  [0, 5.40, 'B00 harrods side', (i) => photo(i, 'hans_crescent_harrods_side')],
  [5.40, 10.00, 'B01 brompton road', (i) => photo(i, 'brompton_road_knightsbridge', { s: [1.04, 1.14] })],
  [10.00, 15.90, 'B02 sloane street', (i, L, A) => photo(i, 'sloane_street', { over: [tag(L, A(10.6), 'SLOANE STREET', 'KNIGHTSBRIDGE, 2.30 PM', true)] })],
  [15.90, 20.40, 'B03 HCR last frame', (i) => hcrStill(0.72, [1.0, 1.06], [n('Credit', { text: MET })])],
  [20.40, 24.00, 'B04 dark hallway', (i) => foot(i, 'dark_empty_hallway', 0)],
  [24.00, 28.70, 'B05 rain window', (i, L, A) => foot(i, 'rain_window_night', 0, { lbl: 'tl', over: [tag(L, A(24.2), 'PIMLICO', 'HIS FLAT', true)] })], // 'Pimlico' lands at 23.0, 1 s before the cut: tag on the next shot
  [28.70, 31.90, 'B06 SIS', (i) => photo(i, 'sis_building_vauxhall')],
  [31.90, 36.00, 'B07 wet pavement', (i, L, A) => foot(i, 'wet_pavement_night', 2, { over: [n('TypedDate', { text: '23 AUGUST 2010', at: A(32.4) })] })],
  [36.00, 41.00, 'B08 card alderney', (i) => tcard(bgV(i, 'london_rain_street_b', 20), '36 ALDERNEY STREET, PIMLICO', ['TOP-FLOOR FLAT', 'A GOVERNMENT FLAT'])],
  [41.00, 46.60, 'B09 dark hallway slow', (i) => foot(i, 'dark_empty_hallway', 4, { s: [1.06, 1.1] })],
  [46.60, 50.10, 'B10 card on the bed', (i) => tcard(bgV(i, 'empty_hallway', 0), 'ON THE BED', ['HIS PHONE', 'SEVERAL SIM CARDS'])],
  [50.10, 54.30, 'B11 empty hallway', (i) => foot(i, 'empty_hallway', 4)],
  [54.30, 60.10, 'B12 padlock gate', (i, L, A) => foot(i, 'pad_gate', 0, { inCam: [n('RedCircle', { cx: 972, cy: 565, rx: 120, ry: 105, at: A(57.9) })] })],
  [60.10, 63.80, 'B13 card the key', (i) => tcard(bgV(i, 'pad_gate', 8), 'INSIDE THE BAG', ['THE KEY TO THE PADLOCK'])],
  [63.80, 67.70, 'B14 dark hallway push', (i) => foot(i, 'dark_empty_hallway', 0.5, { s: [1.1, 1.2] })],
  [67.70, 73.40, 'B15 coroners court', (i) => photo(i, 'westminster_coroners_court')],
  [73.40, 78.40, 'B16 padlock red', (i, L, A) => foot(i, 'pad_red', 0, { pos: '50% 59%', inCam: [n('RedCircle', { cx: 625, cy: 668, rx: 182, ry: 192, at: A(74.3) })] })],
  [78.40, 82.20, 'B17 card forensics', (i) => tcard(bgV(i, 'wet_pavement_night', 20), 'POST MORTEM / FORENSICS', ['NO FINGERPRINTS', 'NO GLOVES'])],
  [82.20, 85.80, 'B18 rain window', (i) => foot(i, 'rain_window_night', 15)],
  [85.80, 90.80, 'B19 london rain b', (i, L, A) => foot(i, 'london_rain_street_b', 10, { over: [n('TypedDate', { text: '6 SEPTEMBER 2010', at: A(86.4) })] })],
  [90.80, 94.20, 'B20 HPK raw', () => raw('HPK', 0, 0.85, 'tl')],
  [94.20, 97.70, 'B21 HCR raw', () => raw('HCR', 0, 0.7, 'tr')],
  [97.70, 101.40, 'B22 london rain a', (i) => foot(i, 'london_rain_street_a', 0)],
  [101.40, 104.90, 'B23 card june', (i) => tcard(bgV(i, 'regent_street_rain_night', 5), 'JUNE OR JULY 2010', ['A MAN AND A WOMAN', 'LET IN LATE ONE EVENING'])],
  [104.90, 110.90, 'B24 london rain b', (i, L, A) => foot(i, 'london_rain_street_b', 30, { lbl: 'tl', over: [tag(L, A(105.1), 'JACQUELINE SEBIRE', 'DETECTIVE CHIEF INSPECTOR, MET')] })],
  [110.90, 114.30, 'B25 wet pavement', (i) => foot(i, 'wet_pavement_night', 12)],
  [114.30, 118.50, 'B26 card DNA', (i) => tcard(bgV(i, 'dark_empty_hallway', 5), 'DNA ON HIS HAND', ["A FORENSIC SCIENTIST'S"])],
  [118.50, 123.40, 'B27 rain window', (i) => foot(i, 'rain_window_night', 22)],
  [123.40, 128.40, 'B28 padlock gate', (i) => foot(i, 'pad_gate', 7)],
  [128.40, 132.70, 'B29 hans crescent', (i) => [...photo(i, 'hans_crescent_geograph'), n('Dip', { outN: 16 })]],
  // replay (VO paused)
  [132.70, 142.20, 'B30 REPLAY', () => [
    n('Grade', { mono: true, bri: 0.78, con: 1.12 }, n('Cam', { s: [1.0, 1.15], o: '50% 60%' },
      n('LClip', { src: 'HCR', t: 0, speed: 0.5, sw: 640, sh: 480, fit: 'contain', fill: true, until: 450, push: [1, 1] }),
      n('Win', { a: 450, b: 570 },
        n('Cam', { s: [1.2, 1.2], css: 'filter:blur(40px) brightness(.4)' }, n('Img', { src: 'stills/c01b_hcr_last.jpg' })),
        n('Img', { src: 'stills/c01b_hcr_last.jpg', fit: 'contain' })))),
    n('Lbl', { text: 'REPLAY', at: 'tl' }), n('Credit', { text: MET, hold: 420 }), n('Dip', { inN: 14 }),
  ]],
  // p04 (142.40-)
  [142.20, 145.60, 'B31 coroners court', (i, L, A) => photo(i, 'westminster_coroners_court', { pos: '35% 50%', over: [tag(L, A(142.6), "WESTMINSTER CORONER'S COURT", 'INQUEST, 2012', true)] })],
  [145.60, 150.40, 'B32 card PII', (i) => tcard(bgP(i, 'sis_building_vauxhall_b'), 'SIGNED BY THE FOREIGN SECRETARY', ['PUBLIC INTEREST', 'IMMUNITY CERTIFICATE'])],
  [150.40, 155.60, 'B33 SIS b', (i) => photo(i, 'sis_building_vauxhall_b')],
  [155.60, 160.40, 'B34 padlock gate', (i) => foot(i, 'pad_gate', 2)],
  [160.40, 164.80, 'B35 card two experts', (i) => tcard(bgV(i, 'pad_red', 1), 'TWO EXPERTS', ['ABOUT 400 ATTEMPTS', 'NEITHER GOT IN'])],
  [164.80, 170.40, 'B36 coroners court', (i, L, A) => photo(i, 'westminster_coroners_court', { pos: '70% 40%', s: [1.12, 1.2], over: [tag(L, A(165.9), 'RICHARD SHEPHERD', 'PATHOLOGIST')] })],
  [170.40, 174.00, 'B37 empty hallway', (i) => foot(i, 'empty_hallway', 0)],
  [174.00, 177.40, 'B38 card CO2', (i) => tcard(bgV(i, 'rain_window_night', 10), 'CARBON DIOXIDE', ['TWO TO THREE MINUTES'])],
  [177.40, 180.40, 'B39 wet pavement', (i, L, A) => foot(i, 'wet_pavement_night', 25, { over: [n('TypedDate', { text: '2 MAY 2012', at: A(177.9) })] })],
  [180.40, 183.60, 'B40 coroners court', (i, L, A) => photo(i, 'westminster_coroners_court', { pos: '55% 60%', over: [tag(L, A(180.6), 'FIONA WILCOX', 'CORONER')] })],
  [183.60, 189.80, 'B41 inquest page', (i) => [
    n('PageC', { img: 'pages/c01b_inquest_crop.jpg', iw: 1250, ih: 730, W: 1320, H: 700, bands: [[99, 388, 968, 52, 34], [87, 448, 314, 52, 78]] }, bgP(i, 'westminster_coroners_court', 0.5)),
    n('Credit', { text: 'SOURCE: RTE NEWS, 2 MAY 2012', place: 'br', hold: 300 }),
  ]],
  [189.80, 194.00, 'B42 padlock red', (i) => foot(i, 'pad_red', 2.3, { pos: '50% 62%' })],
  [194.00, 198.00, 'B43 rain window', (i) => foot(i, 'rain_window_night', 5)],
  [198.00, 201.60, 'B44 london rain b', (i) => foot(i, 'london_rain_street_b', 40)],
  [201.60, 205.40, 'B45 card leaks', (i) => tcard(bgV(i, 'regent_street_rain_night', 15), 'THE CORONER ON THE PRESS LEAKS', ['AN ATTEMPT TO', 'MANIPULATE THE MEDIA?'])],
  [205.40, 209.40, 'B46 SIS b', (i) => photo(i, 'sis_building_vauxhall_b', { pos: '30% 50%' })],
  [209.40, 213.60, 'B47 card memory sticks', (i) => tcard(bgP(i, 'sis_building_vauxhall'), 'AT HIS MI6 OFFICE', ['NINE MEMORY STICKS', 'NEVER PASSED ON'])],
  [213.60, 217.40, 'B48 SIS', (i) => photo(i, 'sis_building_vauxhall', { pos: '60% 50%' })],
  [217.40, 220.60, 'B49 wet pavement', (i) => foot(i, 'wet_pavement_night', 30)],
  [220.60, 224.60, 'B50 regent street', (i, L, A) => foot(i, 'regent_street_rain_night', 10, { over: [n('TypedDate', { text: 'NOVEMBER 2013', at: A(221.0) })] })],
  [224.60, 228.60, 'B51 london rain a', (i) => foot(i, 'london_rain_street_a', 3)],
  [228.60, 233.60, 'B52 london rain b', (i, L, A) => foot(i, 'london_rain_street_b', 50, { lbl: 'tl', over: [tag(L, A(230.7), 'MARTIN HEWITT', 'DEPUTY ASSISTANT COMMISSIONER, MET')] })],
  [233.60, 237.60, 'B53 card accident', (i) => tcard(bgV(i, 'pad_gate', 3), 'THE MET, 2013', ['LOCKED HIMSELF IN', 'BY ACCIDENT'])],
  [237.60, 241.60, 'B54 valley church', (i) => photo(i, 'valley_anglesey_church')],
  [241.60, 245.60, 'B55 SIS b', (i) => photo(i, 'sis_building_vauxhall_b', { pos: '70% 50%', s: [1.12, 1.2] })],
  [245.60, 249.60, 'B56 wet pavement', (i) => foot(i, 'wet_pavement_night', 33.3)],
  [249.60, 254.60, 'B57 london rain b', (i, L, A) => foot(i, 'london_rain_street_b', 60, { lbl: 'tl', over: [tag(L, A(251.0), 'BORIS KARPICHKOV', 'FORMER KGB OFFICER')] })],
  [254.60, 258.00, 'B58 dark hallway', (i) => foot(i, 'dark_empty_hallway', 6)],
  [258.00, 261.60, 'B59 rain window', (i) => foot(i, 'rain_window_night', 26)],
  [261.60, 265.40, 'B60 card claim', (i) => tcard(bgV(i, 'empty_hallway', 2), 'HIS CLAIM ALONE', ['NO EVIDENCE', 'HAS EVER BACKED IT'])],
  [265.40, 270.40, 'B61 regent street', (i) => foot(i, 'regent_street_rain_night', 20)],
  [270.40, 275.00, 'B62 wet pavement', (i, L, A) => foot(i, 'wet_pavement_night', 21, { over: [n('TypedDate', { text: 'NOVEMBER 2023', at: A(273.4) })] })],
  [275.00, 278.60, 'B63 card review', (i) => tcard(bgV(i, 'regent_street_rain_night', 30), 'MET REVIEW, 2024', ['NO NEW DNA', 'NO ONE ELSE THERE'])],
  [278.60, 282.20, 'B64 padlock red', (i) => foot(i, 'pad_red', 2, { pos: '50% 59%' })],
  [282.20, 287.00, 'B65 snowdonia', (i) => foot(i, 'snowdonia_a', 0, { bri: 0.95 })],
  // TypedDate (not a Tag): the next shot carries a Tag, never the same device twice in a row
  [287.00, 291.60, 'B66 valley church', (i, L, A) => photo(i, 'valley_anglesey_church', { pos: '40% 55%', s: [1.12, 1.2], over: [n('TypedDate', { text: 'VALLEY, ANGLESEY - 26 SEPTEMBER 2010', at: A(287.3) })] })],
  [291.60, 295.40, 'B67 SIS sawers', (i, L, A) => photo(i, 'sis_building_vauxhall', { over: [tag(L, A(292.8), 'SIR JOHN SAWERS', 'HEAD OF MI6')] })],
  [295.40, 300.40, 'B68 quote headstone', (i) => [
    n('Grade', { sat: 0.3, bri: 0.78, con: 1.06 }, cam(i, [1.06, 1.16], 'filter:blur(3px) sepia(.3)', vid('snowdonia_a', 5))),
    n('QuoteC', { lines: ['Free to run', 'in the mountains.'], attr: 'HIS HEADSTONE, VALLEY', at: 98 }),
  ]],
  [300.40, 309.00, 'B69 end HCR', () => [...hcrStill(0.5, [1.0, 1.08]), n('Dip', { outN: 30 })]],
];

export default {
  id: 'lm_case01b',
  media: 'last-moments',
  end: 309.0,
  plain: true,
  vo: { starts: [0, 142.40], lens: [132.86, 165.84], file: (i) => ['vo/c01b_p03.wav', 'vo/c01b_p04.wav'][i], tail: 0 },
  devices: ['shared', 'lm', 'lm_c01b'],
  fonts: ['Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'SourceSerif4-var-latin.woff2'],
  shots: T.map(([c, to, name, fn], i) => {
    const L = Math.round((to - c) * 60), A = (t) => Math.round((t - c) * 60);
    return { name, c, to, k: 'hard', n: 0, el: () => fn(i, L, A) };
  }),
  audio: [
    { src: 'mus_a', id: 'mus_a1', file: 'music/es_dark_days.mp3', at: 0, to: 115.9, lane: musLane('music/es_dark_days.mp3', 0, 115.9, tgtAt(0), 1.5, 5.9, ptsAt(0)) },
    { src: 'mus_b', id: 'mus_b', file: 'music/es_tarmac_radiation.mp3', at: 110, to: 225.6, lane: musLane('music/es_tarmac_radiation.mp3', 0, 115.6, tgtAt(110), 6, 5.6, ptsAt(110)) },
    { src: 'mus_a', id: 'mus_a2', file: 'music/es_dark_days.mp3', at: 220, to: 309, trim: 10, lane: musLane('music/es_dark_days.mp3', 10, 89, tgtAt(220), 5.6, 1.5) },
    sfx('riser_dark', 178.25),
    sfx('boom_low', 184.16, SFX_T - SFX.boom_low[1]),
  ],
};
