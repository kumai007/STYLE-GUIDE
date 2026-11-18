// lm_case01a - case 1 PART A of "Most Disturbing Last Moment Footage" (devices lm.mjs + lm_c01b.mjs + lm_c01a.mjs). 60 fps, 185.85 s.
// Shot table = docs/ai-state/last-moments_case01a_HANDOFF.md (S01-S40). VO p01a 0.50, p01b 43.80, p01c 95.57, p02 139.30.
// Raws: HPK 133.95-138.98 (src 0-5.03) and HCR 182.10-185.85 (src 0-3.75), VO paused, own room tone, music -6 dB.
// Owner bar: every graphic on real footage/photo (grain, falloff, eased 3-D Cam), lit type; one text device at a time.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix: VO -29.2 LUFS I (avg of 4), peak max -1.9. Music = VO -10 (-39.2, levelled lane), -6 dB under raws, -12 dB in the dip;
// SFX = VO -14 (-43.2) capped at music -1 by max momentary; tick -22 re VO peak; room tone on raws at -12.6 dB (~-48 LUFS).
const VO_PK = -1.9, MUS_T = -39.2, SFX_T = -43.2;
const SFX = { boom_low: [3.5, -24.4, -20.7, -3.0], riser_dark: [5.91, -23.0, -16.7, -10.6], tick_soft: [0.32, -70, -120, -10.5] };
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const sfx = (name, at, gdB, len) => {
  const [d0, L, M] = SFX[name], d = len ?? d0, g = db(gdB ?? Math.min(SFX_T - L, MUS_T - 1 - M));
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at, to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.02, g], [d - 0.1, g], [d - 0.03, 0]] };
};
const tick = (at) => sfx('tick_soft', at, VO_PK - 22 - SFX.tick_soft[3]);
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
const RAWS = [[133.95, 138.98], [182.10, 185.85]], DIP = [27.83, 28.33];
const cl = (x) => Math.max(0, Math.min(1, x));
const tgtG = (t) => {
  let r = 0; for (const [a, b] of RAWS) r = Math.max(r, cl(Math.min((t - a + 0.3) / 0.3, (b + 0.3 - t) / 0.3)));
  return MUS_T - 6 * r - 12 * cl(Math.min((t - DIP[0] + 0.1) / 0.1, (DIP[1] + 0.1 - t) / 0.1));
};
const tgtAt = (at) => (u) => tgtG(at + u);
const ptsAt = (at) => [...RAWS.flatMap(([a, b]) => [a - 0.3, a, b, b + 0.3]), DIP[0] - 0.1, DIP[0], DIP[1], DIP[1] + 0.1].map((t) => t - at);
const room = (a, b) => ({ src: 'roomtone', id: `room_${Math.round(a * 100)}`, file: 'sfx/roomtone_lp.wav', at: a, to: b, lane: [[0, 0], [0.05, db(-12.6)], [b - a - 0.08, db(-12.6)], [b - a, 0]] });

// ---- picture helpers. i = shot index (varies the 3-D drift); frame numbers shot-local @60.
const MET = 'FOOTAGE: METROPOLITAN POLICE';
const PH = {
  hans_crescent_harrods_side: "DANIEL X. O'NEIL / CC BY 2.0", valley_anglesey_station: 'NEIL THEASBY / CC BY-SA 2.0',
  valley_anglesey_church: 'PETER WOOD / CC BY-SA 2.0', bangor_university: 'TILMAN2007 / CC BY-SA 4.0',
  manchester_university: 'CITYSUITESIMAGES / CC BY 2.0', st_catharines_cambridge: 'JUKKA AMINOFF / CC BY-SA 4.0',
  prestbury_village: 'MICHAEL DIBB / CC BY-SA 2.0', sis_building_vauxhall: 'COLIN SMITH / CC BY-SA 2.0',
  sis_building_vauxhall_b: 'RICHARD COOKE / CC BY-SA 2.0', brompton_road_knightsbridge: 'LEWIS CLARKE / CC BY-SA 2.0',
  hans_crescent_geograph: 'LEWIS CLARKE / CC BY-SA 2.0', hans_crescent_sign: 'ELL BROWN / CC BY-SA 2.0',
};
// faces of private people in photos (1920x1080 cover-box px, before the camera)
const MOS = {};
const DRIFT = [
  { ry: [-1.2, 1.2], tx: [-18, 18] }, { ry: [1.0, -1.0], ty: [12, -12] }, { rx: [1.0, -0.6], tx: [16, -16] },
  { ry: [-0.8, 0.9], ty: [-12, 12] }, { rx: [-0.8, 0.8], tx: [-14, 20] }, { ry: [1.3, -0.4], tx: [20, -10] },
];
const cam = (i, s, css, ...k) => n('Cam', { s, ...DRIFT[i % DRIFT.length], css }, ...k);
const vid = (name, t, o = {}) => n('_V', { src: name.length <= 3 ? name : `c01a/${name}`, trim: t, speed: o.speed ?? 1, fit: 'cover', pos: o.pos });
// stock b-roll: mono grade + ILLUSTRATIVE
const foot = (i, name, t, o = {}) => {
  const s = o.s ?? [1.06, 1.12];
  return [
    n('Grade', { mono: true, bri: o.bri ?? 1.0, con: 1.1 }, cam(i, s, o.css, vid(name, t, o))),
    ...(o.inCam ? [cam(i, s, '', ...o.inCam)] : []),
    n('Lbl', { text: 'ILLUSTRATIVE', at: o.lbl || 'bl' }), ...(o.over || []),
  ];
};
const photo = (i, file, o = {}) => {
  const s = o.s ?? [1.05, 1.13], src = `c01a/${file}.jpg`, mos = o.mos ?? MOS[file];
  return [
    n('Grade', { sat: 0.42, bri: o.bri ?? 0.92, con: 1.08 }, cam(i, s, o.css, n('Img', { src, pos: o.pos }), ...(mos ? [n('MosImg', { src, pos: o.pos, boxes: mos })] : []))),
    ...(o.inCam ? [cam(i, s, '', ...o.inCam)] : []),
    n('Credit', { text: `PHOTO: ${PH[file]}`, place: o.cp || 'tr' }), ...(o.over || []),
  ];
};
// blurred backdrops for title cards
const bgV = (i, name, t, bri = 0.7) => n('Grade', { mono: true, bri, con: 1.08 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', vid(name, t)));
const bgP = (i, file, bri = 0.62, pos) => n('Grade', { sat: 0.3, bri, con: 1.05 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', n('Img', { src: `c01a/${file}.jpg`, pos })));
// raw freeze frame (640x480): contain over its own blurred cover copy; camP = Cam props of the sharp layer
const frz = (src, nf, o, camP, extra = []) => [
  n('Grade', { mono: !!o.mono, bri: o.bri, con: 1.1 },
    n('Cam', { s: [1.2, 1.2], css: 'filter:blur(40px) brightness(.45)' }, n('Frz', { src, n: nf, fit: 'cover' })),
    n('Cam', camP, n('Frz', { src, n: nf }))),
  ...extra,
];
// live raw clip (contain + blurred fill)
const live = (i, src, t, speed, o, extra = []) => [
  n('Grade', { mono: !!o.mono, bri: o.bri, con: 1.1 }, cam(i, [1.0, 1.04], '', n('LClip', { src, t, speed, sw: 640, sh: 480, fit: 'contain', fill: true, push: [1, 1.03] }))),
  ...extra,
];
const met = (place = 'tr') => n('Credit', { text: MET, place });
// Tag hold so its 24 f out ends 6 f before the cut
const tag = (L, at, name, role, pin = true) => n('Tag', { at, name, role, pin, hold: Math.max(60, L - at - 48 - 24 - 6) });
const td = (at, text) => n('TypedDate', { at, text });
const MAP = { z12: 'c01a/map_z12.jpg', z14: 'c01a/map_z14.jpg', off: [-5376, -3072, 4] };

// shot table: [start, end, name, (i, L = len f, A = part s -> local f) => nodes]
const T = [
  // p01a (0.50-43.88)
  [0, 4.16, 'S01 HCR freeze man', (i, L, A) => frz('HCR', 114, { bri: 0.85 }, { s: [1.0, 1.08], o: '42% 30%' }, [met('tr'), tag(L, A(1.54), 'GARETH WILLIAMS', 'CODEBREAKER', false)])],
  [4.16, 10.40, 'S02 hans crescent harrods', (i, L, A) => photo(i, 'hans_crescent_harrods_side', { over: [tag(L, A(6.24), 'HANS CRESCENT', 'KNIGHTSBRIDGE, LONDON')] })],
  [10.40, 17.96, 'S03 HCR walk', (i) => live(i, 'HCR', 0, 0.5, { bri: 0.85 }, [met('tr')])],
  [17.96, 24.64, 'S04 HCR stamp zoom', (i, L, A) => frz('HCR', 224, { bri: 0.85 }, { s: [1, 2], tx: [0, 556], ty: [0, -562], a: 0, b: 84 },
    [n('RedCircle', { cx: 560, cy: 990, rx: 520, ry: 62, at: A(19.56) }), td(A(21.54), '15 AUGUST 2010')])],
  [24.64, 28.10, 'S05 HCR empty doorway', (i, L) => frz('HCR', 222, { bri: 0.8, mono: true }, { s: [1.0, 1.05], o: '50% 40%' }, [n('Dip', { outN: 16 })])],
  [28.10, 32.62, 'S06 valley station', (i, L, A) => [...photo(i, 'valley_anglesey_station', { over: [tag(L, A(28.2) + 14, 'VALLEY', 'ANGLESEY, WALES')] }), n('Dip', { inN: 14 })]],
  [32.62, 37.34, 'S07 valley church', (i, L, A) => photo(i, 'valley_anglesey_church', { over: [td(A(32.62) + 10, '26 SEPTEMBER 1978')] })],
  [37.34, 43.80, 'S08 bangor', (i, L, A) => photo(i, 'bangor_university', { inCam: [n('RedCircle', { cx: 960, cy: 470, rx: 380, ry: 250, at: A(42.6) - 60 })] })],
  // p01b (43.80-95.56)
  [43.80, 49.78, 'S09 snowdonia', (i) => foot(i, 'snowdonia_a', 1)],
  [49.78, 54.22, 'S10 manchester', (i, L, A) => photo(i, 'manchester_university', { over: [tag(L, A(49.9) + 6, 'UNIVERSITY OF MANCHESTER', 'MANCHESTER')] })],
  [54.22, 57.94, 'S11 st catharines', (i) => photo(i, 'st_catharines_cambridge', { over: [n('Spotlight', { cx: 960, cy: 500, r: 460, at: 20, hold: 150 })] })],
  [57.94, 63.80, 'S12 card 2001 GCHQ', (i) => [bgP(i, 'prestbury_village', 0.6), n('TCard', { kick: '2001', lines: ['GCHQ', 'CHELTENHAM'] })]],
  [63.80, 68.74, 'S13 prestbury', (i, L, A) => photo(i, 'prestbury_village', { s: [1.15, 1.22], pos: '30% 60%', over: [tag(L, A(66.26), 'PRESTBURY', 'CHELTENHAM')] })],
  [68.74, 73.54, 'S14 cyclist road', (i) => foot(i, 'cyclist_drone_road', 2)],
  [73.54, 77.40, 'S15 rain street b', (i, L, A) => foot(i, 'london_rain_street_b', 34, { over: [td(A(74.22), 'SPRING 2009')] })],
  [77.40, 80.52, 'S16 SIS', (i, L, A) => photo(i, 'sis_building_vauxhall', { over: [tag(L, A(77.62), 'SIS BUILDING', 'VAUXHALL, LONDON')] })],
  [80.52, 84.42, 'S17 SIS b', (i) => photo(i, 'sis_building_vauxhall_b', { over: [n('Spotlight', { cx: 960, cy: 520, r: 420, at: 20, hold: 150 })] })],
  [84.42, 90.78, 'S18 rain street a', (i) => foot(i, 'london_rain_street_a', 0.5)],
  [90.78, 95.57, 'S19 rain window', (i, L, A) => [n('Grade', { mono: true, bri: 1.0, con: 1.1 }, cam(i, [1.0, 1.05], '', n('Vertical', { src: 'c01a/rain_window_night', t: 12, sw: 1080, sh: 1920, fw: 608, fh: 1080 }))),
    n('Lbl', { text: 'ILLUSTRATIVE', at: 'bl' }), td(A(90.98), 'SUMMER 2010')]],
  // p01c (95.57-133.77)
  [95.57, 101.93, 'S20 rain street b', (i) => foot(i, 'london_rain_street_b', 42)],
  [101.93, 105.47, 'S21 SIS tight', (i, L, A) => photo(i, 'sis_building_vauxhall', { s: [1.32, 1.4], inCam: [n('RedCircle', { cx: 960, cy: 500, rx: 330, ry: 220, at: 40 })] })],
  [105.47, 108.93, 'S22 prestbury b', (i, L, A) => photo(i, 'prestbury_village', { s: [1.2, 1.26], pos: '70% 40%', over: [td(A(106.40), '3 SEPTEMBER 2010')] })],
  [108.93, 113.65, 'S23 card home from US', (i) => [bgV(i, 'wet_pavement_night', 20), n('Lbl', { text: 'ILLUSTRATIVE', at: 'bl' }), n('TCard', { kick: '11 AUGUST 2010', lines: ['HOME FROM THE US'] })]],
  [113.65, 119.21, 'S24 regent street', (i, L, A) => foot(i, 'regent_street_rain_night', 4, { lbl: 'tl', over: [tag(L, A(115.67), 'WEST END', 'LONDON')] })],
  [119.21, 122.31, 'S25 rain street a', (i, L, A) => foot(i, 'london_rain_street_a', 3.9, { over: [td(A(120.21) - 30, 'SATURDAY 14 AUGUST 2010')] })],
  [122.31, 127.60, 'S26 HPK freeze', (i, L, A) => frz('HPK', 0, { bri: 0.85 }, { s: [1.04, 1.1], o: '50% 100%' }, [met('tl'), n('Cam', { ty: [-150, -150] }, tag(L, A(124.81), 'HOLLAND PARK STATION', 'CENTRAL LINE, LONDON'))])],
  [127.60, 130.87, 'S27 HPK cone', (i) => frz('HPK', 0, { bri: 0.85 }, { s: [1.0, 1.04], o: '38% 85%' }, [n('Spotlight', { cx: 724, cy: 922, r: 240, at: 18, hold: 120 })])],
  [130.87, 133.95, 'S28 HPK stamp zoom', (i) => frz('HPK', 0, { bri: 0.85 }, { s: [1, 2], tx: [0, -524], ty: [0, -428], a: 0, b: 54 }, [n('RedCircle', { cx: 1111, cy: 900, rx: 450, ry: 62, at: 60 })])],
  [133.95, 138.98, 'S29 HPK raw', (i) => live(i, 'HPK', 0, 1, { bri: 0.85 }, [met('tl')])],
  // p02 (139.30-182.08)
  [138.98, 144.60, 'S30 HPK replay', (i) => live(i, 'HPK', 1.5, 0.45, { bri: 0.85, mono: true }, [met('tl'), n('Spotlight', { cx: 1005, cy: 540, r: 300, at: 30, hold: 200 })])],
  [144.60, 150.02, 'S31 HPK freeze end', (i) => frz('HPK', 270, { bri: 0.85, mono: true }, { s: [1.0, 1.08], o: '60% 50%' })],
  [150.02, 154.40, 'S32 regent street', (i) => foot(i, 'regent_street_rain_night', 20)],
  [154.40, 158.50, 'S33 rain street b', (i) => foot(i, 'london_rain_street_b', 58)],
  [158.50, 163.06, 'S34 wet pavement', (i) => foot(i, 'wet_pavement_night', 30)],
  [163.06, 167.80, 'S35 map', (i) => [n('Grade', { sat: 1, con: 1.05, bri: 1, vig: 0.55, grain: 0.07 }, n('MapC01', {
    ...MAP,
    keys: [[0, 1695, 1130, 0.18, 16], [130, 1440, 1047, 1.15, 10], [165, 1460, 1060, 1.17, 10], [240, 1950, 1212, 1.25, 8], [284, 1960, 1215, 1.3, 7]],
    pins: [{ x: 1439.9, y: 1047.3, at: 96, lat: 112, label: 'HOLLAND PARK \u00b7 14 AUG' }, { x: 1950.2, y: 1212.0, at: 222, lat: 232, label: 'KNIGHTSBRIDGE \u00b7 15 AUG' }],
  })), n('Credit', { text: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', place: 'br', hold: 200 })]],
  [167.80, 171.10, 'S36 brompton road', (i, L, A) => photo(i, 'brompton_road_knightsbridge', { over: [tag(L, A(168.32), 'BROMPTON ROAD', 'KNIGHTSBRIDGE')] })],
  [171.10, 175.20, 'S37 hans crescent', (i, L, A) => photo(i, 'hans_crescent_geograph', { over: [td(A(172.06), '15 AUGUST, 14:27')] })],
  [175.20, 178.42, 'S38 hans crescent sign', (i) => photo(i, 'hans_crescent_sign')],
  [178.42, 182.10, 'S39 HCR entry', (i) => frz('HCR', 0, { bri: 0.85 }, { s: [1.0, 1.06], o: '70% 20%' }, [met('tr'), n('Spotlight', { cx: 1150, cy: 170, r: 330, at: 24, hold: 120 })])],
  [182.10, 185.85, 'S40 HCR raw', (i) => live(i, 'HCR', 0, 1, { bri: 0.85 }, [met('tr')])],
];
const TD_AT = [21.54, 32.62 + 10 / 60, 74.22, 90.98, 106.40, 120.21 - 0.5, 172.06];

export default {
  id: 'lm_case01a',
  media: 'last-moments',
  end: 185.85,
  plain: true,
  vo: { starts: [0.50, 43.80, 95.57, 139.30], lens: [43.38, 51.76, 38.20, 42.78], file: (i) => ['vo/c01a_p01a.wav', 'vo/c01a_p01b.wav', 'vo/c01a_p01c.wav', 'vo/c01a_p02.wav'][i], tail: 0 },
  devices: ['shared', 'lm', 'lm_c01b', 'lm_c01a'],
  fonts: ['Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2'],
  shots: T.map(([c, to, name, fn], i) => {
    const L = Math.round((to - c) * 60), A = (t) => Math.round((t - c) * 60);
    return { name, c, to, k: 'hard', n: 0, el: () => fn(i, L, A) };
  }),
  audio: [
    { src: 'mus_a', id: 'mus_a1', file: 'music/es_dark_days.mp3', at: 0, to: 108, trim: 5.07, lane: musLane('music/es_dark_days.mp3', 5.07, 108, tgtAt(0), 0.05, 6, ptsAt(0)) },
    { src: 'mus_b', id: 'mus_b', file: 'music/es_tarmac_radiation.mp3', at: 102, to: 156.5, trim: 61.1, lane: musLane('music/es_tarmac_radiation.mp3', 61.1, 54.5, tgtAt(102), 6, 6, ptsAt(102)) },
    { src: 'mus_a', id: 'mus_a2', file: 'music/es_dark_days.mp3', at: 150.5, to: 185.85, lane: musLane('music/es_dark_days.mp3', 0, 35.35, tgtAt(150.5), 6, 1.5, ptsAt(150.5)) },
    room(...RAWS[0]), room(...RAWS[1]),
    sfx('riser_dark', 133.95 - 5.91),
    sfx('boom_low', 133.95, SFX_T - SFX.boom_low[1]),
    sfx('boom_low', 182.10, SFX_T - SFX.boom_low[1], 3.4),
    ...TD_AT.map(tick),
  ],
};
