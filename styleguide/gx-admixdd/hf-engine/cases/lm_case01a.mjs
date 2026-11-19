// lm_case01a - case 1 PART A of "Most Disturbing Last Moment Footage" (devices lm.mjs + lm_c01b.mjs + lm_c01a.mjs). 60 fps, 185.85 s.
// Shot table = docs/ai-state/last-moments_case01a_HANDOFF.md (S01-S40). VO p01a 0.50, p01b 43.80, p01c 95.57, p02 139.30.
// Raws: HPK 133.95-138.98 (src 0-5.03) and HCR 182.10-185.85 (src 0-3.75), VO paused, own room tone, music -6 dB.
// Owner bar: every graphic on real footage/photo (grain, falloff, eased 3-D Cam), lit type; one text device at a time.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { counterTicks } from '../devices/lm_mg.mjs';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix: VO -29.2 LUFS I (avg of 4), peak max -1.9. Music = VO -10 (-39.2, levelled lane), -6 dB under raws, -12 dB in the dip.
// SFX v2 (owner 2026-11-19 "good SFX but a little lower than music"; docs/ai-state/last-moments_sfx_HANDOFF.md): one Epidemic family per
// device; each SFX max momentary = music target (tgtG) over its loud span - 3 dB, typing stream -6, CCTV hum under raws ~-48 LUFS I.
// Table = [dur s, I, max M (short files padded), true peak, peak-at s (-1 = loud at the end)] by ffmpeg ebur128.
const VO_PK = -1.9, MUS_T = -39.2;
const SFX = { lm_boom: [4.183, -21.7, -17.7, -11.6, 0.176], lm_whoosh: [1.549, -19.3, -16.3, -2.4, 0.469], lm_brush: [0.775, -19.8, -17.5, -3.1, 0.03],
  lm_paper: [0.785, -19.9, -19.6, -2.9, 0.039], lm_settle: [0.396, -70, -23.2, -0.5, 0.033], lm_marker: [0.525, -14.4, -14.2, -3.0, 0.139],
  lm_key: [0.11, -70, -25.6, -4.6, 0.016], lm_click: [0.365, -70, -22.2, -1.0, 0.223], riser_dark: [5.91, -23.0, -16.7, -10.6, -1], tick_soft: [0.321, -29.9, -29.9, -10.5, 0.01], lm_hum: [12, -32.7, -31.4, -19.0, 0] };
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const sfx = (name, at, off = -3, len) => {
  const [d0, , M, , pk] = SFX[name], d = len ?? d0, a0 = pk < 0 ? at + d - 1.5 : at + Math.max(0, pk - 0.05);
  let m = 99; for (let u = 0; u <= (pk < 0 ? 1.5 : Math.min(1.0, d)) + 1e-6; u += 0.05) m = Math.min(m, tgtG(a0 + u));
  const g = db(m + off - M), fo = name === 'lm_boom' ? 0.8 : 0.03;
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at: +at.toFixed(3), to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.015, g], [+(d - fo - 0.02).toFixed(3), g], [+(d - 0.03).toFixed(3), 0]] };
};
// TitleType typing (lm_pro: char j of line i lands at at + (tot_i + j + 1) / cps, lines +4 gap): a key on every 2nd char (spaces skipped);
// a stream of cps/2 keys/s reads 10log10(0.4 cps / 2) dB over one key's padded M -> stream max M = music - 6
const typing = (at, lines, cps = 22) => { const ts = []; let tot = 0;
  for (const t of lines) { for (let j = 0; j < t.length; j += 2) { const k = t[j] === ' ' ? j + 1 : j; if (k < t.length) ts.push(+(at + (tot + k + 1) / cps).toFixed(3)); } tot += t.length + 4; }
  return ts.map((tm) => { const g = db(tgtG(tm) - 6 - (SFX.lm_key[2] + 10 * Math.log10(0.4 * cps / 2)));
    return { src: 'lm_key', id: `key_${Math.round(tm * 1000)}`, file: 'sfx/lm_key.wav', at: tm, to: +(tm + 0.09).toFixed(3), lane: [[0, 0], [0.005, g], [0.07, g], [0.085, 0]] }; });
};
// device events (part s). LowerThird ink wipe -> brush (S06 28.43 skipped: dip boom 28.30); Article3D in -> paper slide at the cut + settle
// +0.45 (S36 settle skipped: marker 0.22 s later); marker wipe (f0, f0+26) -> marker, start -0.03; StampRing punch-in + map pushes -> whoosh,
// peak (0.469) on the move; booms: dip end + raw cuts (peak 0.176 on the cut); risers land on the raw cuts.
const BRUSH = [1.54];
const ARTS = [[43.80, 70, true], [73.54, 50, true]]; // v5: S36 article -> Parallax photo
// v4 click SFX at each text fade-in (part s): places, dates, cards (TYPED key stream removed: typing only on title screens)
const CLICKS = [6.24, 28.2 + 44 / 60, 32.62 + 10 / 60, 50.0, 57.94 + 8 / 60, 66.26, 77.62, 90.98, 103.3, 106.40, 109.9, 116.5, 120.5, 124.81,
  138.98 + 84 / 60, 163.06 + 30 / 60, 163.06 + 143 / 60, 163.06 + 192 / 60, 168.3, 172.3, 178.42 + 84 / 60]; // v5: S30/S39 data pop, S35 pins
const WHOOSH = [19.56 + 0.33 - 0.469, 130.87 + 0.5 + 0.33 - 0.469, 138.98 + 46 / 60 - 0.469, 158.50 + (150 - 21) / 60 - 0.469, 163.06 + 30 / 60 - 0.469, 178.42 + 46 / 60 - 0.469];
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
// CCTV room tone under raws: Epidemic hotel-corridor electrical hum (-32.7 LUFS I) at -48.2 LUFS I (= raw music bed -3)
const room = (a, b) => ({ src: 'lm_hum', id: `room_${Math.round(a * 100)}`, file: 'sfx/lm_hum.wav', at: a, to: b, lane: [[0, 0], [0.05, db(-48.2 + 32.7)], [b - a - 0.08, db(-48.2 + 32.7)], [b - a, 0]] });

// ---- picture helpers. i = shot index (varies the 3-D drift); frame numbers shot-local @60.
const MET = 'FOOTAGE: METROPOLITAN POLICE';
const PH = {
  hans_crescent_harrods_side: "DANIEL X. O'NEIL / CC BY 2.0", valley_anglesey_station: 'NEIL THEASBY / CC BY-SA 2.0',
  valley_anglesey_church: 'PETER WOOD / CC BY-SA 2.0', bangor_university: 'TILMAN2007 / CC BY-SA 4.0',
  manchester_university: 'CITYSUITESIMAGES / CC BY 2.0', st_catharines_cambridge: 'JUKKA AMINOFF / CC BY-SA 4.0',
  prestbury_village: 'MICHAEL DIBB / CC BY-SA 2.0', sis_building_vauxhall: 'COLIN SMITH / CC BY-SA 2.0',
  sis_building_vauxhall_b: 'RICHARD COOKE / CC BY-SA 2.0', brompton_road_knightsbridge: 'LEWIS CLARKE / CC BY-SA 2.0',
  hans_crescent_geograph: 'LEWIS CLARKE / CC BY-SA 2.0', hans_crescent_sign: 'ELL BROWN / CC BY-SA 2.0',
  harrods_night: 'EDITOR5807 / CC BY 3.0', sloane_street: 'LEWIS CLARKE / CC BY-SA 2.0',
  gchq_aerial: 'ADRIAN PINGSTONE / PUBLIC DOMAIN', cheltenham_promenade: 'STEVE DANIELS / CC BY-SA 2.0', harrods_brompton_road: 'EDWARDX / CC BY-SA 3.0',
  holland_park_station: 'RC1959 / CC0', alderney_street: 'CHRIS WHIPPET / CC BY-SA 2.0',
};
// faces of private people in photos (1920x1080 cover-box px, before the camera)
const MOS = {
  brompton_road_knightsbridge: [[60, 585, 85, 95], [140, 555, 115, 125], [450, 585, 80, 90], [605, 595, 90, 100], [690, 595, 150, 80]],
  hans_crescent_geograph: [[50, 380, 105, 115], [250, 365, 160, 95], [490, 375, 100, 110], [595, 410, 90, 100], [775, 375, 110, 120],
    [915, 395, 100, 75], [1080, 425, 105, 115], [1335, 395, 100, 75], [1725, 390, 80, 75], [1825, 380, 80, 80], [525, 690, 180, 330]],
};
const DRIFT = [
  { ry: [-1.2, 1.2], tx: [-18, 18] }, { ry: [1.0, -1.0], ty: [12, -12] }, { rx: [1.0, -0.6], tx: [16, -16] },
  { ry: [-0.8, 0.9], ty: [-12, 12] }, { rx: [-0.8, 0.8], tx: [-14, 20] }, { ry: [1.3, -0.4], tx: [20, -10] },
];
const cam = (i, s, css, ...k) => n('Cam', { s, ...DRIFT[i % DRIFT.length], css }, ...k);
const vid = (name, t, o = {}) => n('_V', { src: name.length <= 3 ? name : `c01a/${name}`, trim: t, speed: o.speed ?? 1, fit: 'cover', pos: o.pos });
// stock b-roll: same colour grade as raws (owner 2026-11-19: never B&W) + ILLUSTRATIVE
const foot = (i, name, t, o = {}) => {
  const s = o.s ?? [1.06, 1.12];
  return [
    n('Grade', { sat: 0.55, bri: o.bri ?? 1.0, con: 1.1 }, cam(i, s, o.css, vid(name, t, o))),
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
// v5 (owner 2026-11-19 "less stock, more MG"): 2.5-D Parallax photo (lm_mg), alternates with plain photo()
const PAR = [{ ry: [-3, 3], rx: [1, -1] }, { ry: [2.5, -2.5], rx: [-1, 1], tx: [14, -14] }, { ry: [-2, 3], rx: [-0.8, 0.8] }];
const par = (i, file, o = {}) => [
  n('Grade', { sat: o.sat ?? 0.48, bri: o.bri ?? 0.9, con: 1.08 }, n('Parallax', { src: `c01a/${file}.jpg`, pos: o.pos, mos: o.mos ?? MOS[file], ...PAR[i % PAR.length], ...(o.s ? { s: o.s } : {}) })),
  n('Credit', { text: `PHOTO: ${PH[file]}`, place: o.cp || 'tr' }), ...(o.over || []),
];
// blurred backdrops for title cards
const bgV = (i, name, t, bri = 0.7) => n('Grade', { sat: 0.55, bri, con: 1.08 }, cam(i, [1.1, 1.18], 'filter:blur(12px)', vid(name, t)));
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
// v2 (owner 2026-11-19, lm_pro kit): name/place tags = LowerThird (ink brush bar), dates/cards = TitleType (VCR typed),
// camera stamps = StampRing (ring on the burned-in stamp, clamped to the picture, punch-in), articles = Article3D.
const tag = (L, at, name, role, pin = true, o = {}) => n('LowerThird', { at, name, role, pin, hold: Math.max(60, L - at - 48 - 24 - 6), ...o });
const td = (at, text, o = {}) => n('TextFade', { at, lines: [text], pos: 'tl', ...o });
// v4 (owner 2026-11-19): LowerThird only for Gareth Williams; places = PlaceText (VCR caps on the footage, no box); dates = TextFade
// top-left (Abyssal ref spot), cards = TitleType mode 'fade'; every text in gets one click SFX (lm_click), no typing keys in this part.
const place = (at, text, sub, o = {}) => n('PlaceText', { at, text, sub, ...o });
// real article crops (build/c01a_articles.py): {img, iw, ih, bands, src, date}; marker starts at f0, 2nd line 26 f later
const ART = JSON.parse(fs.readFileSync(path.join(MED, 'pages', 'c01a_articles.json'), 'utf8'));
const art = (k, f0, bg, o = {}) => n('Article3D', { ...ART[k], bands: ART[k].bands.map((b, j) => [...b, f0 + 26 * j]), ...o }, bg);
// contain picture area of a 640x480 raw on the 1920x1080 stage, and its burned-in stamp boxes (source px x 2.25, +240 x)
const PIC = [240, 0, 1440, 1080];
// HCR stamp sits 6 src px above the picture bottom: h 24 (ring radius 28 around the stamp centre y 1048.5) + rect bottom +15 so the
// kit's 12 px clamp margin does not push the ring up through the digits; the ring stroke still ends at y 1077 (< 1080, in picture).
const STAMP = { HCR: { x: 243, y: 1037, w: 484, h: 24, rect: [240, 0, 1440, 1095] }, HPK: { x: 1093, y: 918, w: 406, h: 40, rect: PIC } };
const MAP = { z12: 'c01a/map_z12.jpg', z14: 'c01a/map_z14.jpg', off: [-5376, -3072, 4] };
const TL = (a, b, c) => [{ date: '11 AUG 2010', label: 'HOME FROM THE US', at: a }, { date: '14 AUG', label: b ? 'SATURDAY - A WET AFTERNOON' : 'HOLLAND PARK', at: b ?? 9999 }, { date: '15 AUG', label: 'HANS CRESCENT', at: c ?? 9999 }];
const DOCS = () => [{ ...ART.cctv, at: 10 }, { ...ART.profile, at: 150 }];
const CCTV = { HPK: { CAM: 'HOLLAND PARK', DATE: '14 AUG 2010', TIME: '14:59' }, HCR: { CAM: 'HANS CRESCENT', DATE: '15 AUG 2010', TIME: '14:27:26' } };
const cctvData = (k) => Object.entries(CCTV[k]);

// shot table: [start, end, name, (i, L = len f, A = part s -> local f) => nodes]
const T = [
  // p01a (0.50-43.88)
  [0, 4.16, 'S01 HCR freeze man', (i, L, A) => frz('HCR', 114, { bri: 0.78 }, { s: [1.0, 1.08], o: '42% 30%' }, [met('tr'), tag(L, A(1.54), 'GARETH WILLIAMS', 'CODEBREAKER', false, { pos: 'c' })])],
  [4.16, 10.40, 'S02 hans crescent harrods', (i, L, A) => par(i, 'hans_crescent_harrods_side', { bri: 0.78, over: [place(A(6.24), 'HANS CRESCENT', 'KNIGHTSBRIDGE, LONDON')] })],
  [10.40, 17.96, 'S03 HCR walk', (i) => live(i, 'HCR', 0, 0.5, { bri: 0.75 }, [met('tr')])],
  [17.96, 24.64, 'S04 HCR stamp zoom', (i, L, A) => [n('StampRing', { ...STAMP.HCR, at: A(19.56), zoom: 1.7, zin: 50 }, ...frz('HCR', 224, { bri: 0.78 }, { s: [1, 1] }))]],
  [24.64, 28.10, 'S05 HCR empty doorway', (i, L) => frz('HCR', 222, { bri: 0.74, mono: true }, { s: [1.0, 1.05], o: '50% 40%' }, [n('Dip', { outN: 16 })])],
  [28.10, 32.62, 'S06 valley station', (i, L, A) => [...photo(i, 'valley_anglesey_station', { bri: 0.65, over: [place(A(28.2) + 44, 'VALLEY', 'ANGLESEY, WALES')] }), n('Dip', { inN: 14 })]],
  [32.62, 37.34, 'S07 valley church', (i, L, A) => par(i, 'valley_anglesey_church', { bri: 0.6, over: [td(A(32.62) + 10, '26 SEPTEMBER 1978')] })],
  [37.34, 43.80, 'S08 bangor', (i, L, A) => photo(i, 'bangor_university', { bri: 0.6 })],
  // p01b (43.80-95.56)
  [43.80, 49.78, 'S09 article profile', (i) => [art('profile', 70, bgV(i, 'snowdonia_a', 1, 0.6))]], // full-bleed page: no backdrop label (QA 2026-11-19)
  [49.78, 54.22, 'S10 manchester', (i, L, A) => par(i, 'manchester_university', { bri: 0.75, over: [place(A(50.0), 'UNIVERSITY OF MANCHESTER')] })],
  [54.22, 57.94, 'S11 st catharines', (i) => photo(i, 'st_catharines_cambridge', { over: [n('SpotC01', { cx: 960, cy: 500, r: 460, at: 20, hold: 150 })] })],
  [57.94, 63.80, 'S12 card 2001 GCHQ', (i) => [bgP(i, 'gchq_aerial', 0.42), n('TitleType', { mode: 'fade', kick: '2001', lines: ['GCHQ', 'CHELTENHAM'] })]], // v5: real GCHQ photo backdrop (was stock CCTV camera)
  [63.80, 68.74, 'S13 prestbury', (i, L, A) => par(i, 'prestbury_village', { bri: 0.78, pos: '30% 60%', over: [place(A(66.26), 'PRESTBURY', 'CHELTENHAM')] })],
  [68.74, 73.54, 'S14 cyclist road', (i) => foot(i, 'cyclist_drone_road', 2, { bri: 0.9 })],
  [73.54, 77.40, 'S15 article secondment', (i) => [art('secondment', 50, bgP(i, 'sis_building_vauxhall_b', 0.6), { ry: [10, 2] })]],
  [77.40, 80.52, 'S16 SIS', (i, L, A) => par(i, 'sis_building_vauxhall', { bri: 0.66, over: [place(A(77.62), 'SIS BUILDING', 'VAUXHALL, LONDON')] })],
  [80.52, 84.42, 'S17 SIS b', (i) => photo(i, 'sis_building_vauxhall_b', { over: [n('SpotC01', { cx: 960, cy: 520, r: 420, at: 20, hold: 150 })] })],
  [84.42, 90.78, 'S18 rain street a', (i) => foot(i, 'london_rain_street_a', 0.5)],
  [90.78, 95.57, 'S19 rain window', (i, L, A) => foot(i, 'rain_window_night', 12, { bri: 2.6, s: [1.04, 1.1], over: [td(A(90.98), 'SUMMER 2010')] })], // v4: cover full frame (was narrow vertical strip)
  // p01c (95.57-133.77)
  [95.57, 101.93, 'S20 rain street b', (i) => foot(i, 'london_rain_street_b', 42)],
  [101.93, 105.47, 'S21 GCHQ', (i, L, A) => par(i, 'gchq_aerial', { bri: 0.72, over: [place(A(103.3), 'GCHQ', 'CHELTENHAM')] })], // v5: VO "back to GCHQ"
  [105.47, 108.93, 'S22 cheltenham', (i, L, A) => photo(i, 'cheltenham_promenade', { bri: 0.62, over: [td(A(106.40), '3 SEPTEMBER 2010')] })], // v5: was drone stock
  [108.93, 113.65, 'S23 timeline home from US', (i, L, A) => [n('Timeline', { nodes: TL(A(109.9)) }, bgP(i, 'holland_park_station', 0.45))]], // v5: was stock card
  [113.65, 119.21, 'S24 brompton road', (i, L, A) => par(i, 'harrods_brompton_road', { bri: 0.7, over: [place(A(116.5), 'KNIGHTSBRIDGE', 'LONDON')] })], // v5: was regent st stock
  [119.21, 122.31, 'S25 timeline 14 aug', (i, L, A) => [n('Timeline', { nodes: TL(-60, A(120.5)) }, n('Grade', { mono: true, bri: 0.8, con: 1.08 }, cam(i, [1.12, 1.2], 'filter:blur(10px)', n('Frz', { src: 'HPK', n: 150, fit: 'cover' })))), met('tl')]],
  [122.31, 127.60, 'S26 HPK freeze', (i, L, A) => frz('HPK', 0, { bri: 1.05 }, { s: [1.04, 1.1], o: '50% 100%' }, [met('tr'), place(A(124.81), 'HOLLAND PARK STATION', 'CENTRAL LINE, LONDON', { x: 284, y: 64 })])],
  [127.60, 130.87, 'S27 HPK cone', (i) => frz('HPK', 0, { bri: 1.05 }, { s: [1.0, 1.04], o: '38% 85%' }, [n('SpotC01', { cx: 724, cy: 922, r: 240, at: 18, hold: 120 })])],
  [130.87, 133.95, 'S28 HPK stamp zoom', (i) => [n('StampRing', { ...STAMP.HPK, at: 30, zoom: 1.7, zin: 50 }, ...frz('HPK', 0, { bri: 1.1 }, { s: [1, 1] }))]],
  [133.95, 138.98, 'S29 HPK raw', (i) => live(i, 'HPK', 0, 1, { bri: 1.05 }, [met('tl')])],
  // p02 (139.30-182.08)
  [138.98, 144.60, 'S30 HPK analyse', (i) => [n('CCTVAnalyse', { src: 'HPK', n: 104, box: [900, 360, 210, 380], data: cctvData('HPK'), tag: 'GARETH WILLIAMS', dpos: 'tr', g: { sat: 0, bri: 1.0, con: 1.1 } }), n('Grade', { vig: 0.55, grain: 0.07 }), met('tl')]], // v5: was SpotC01 replay
  [144.60, 150.02, 'S31 HPK freeze end', (i) => frz('HPK', 270, { bri: 1.05, mono: true }, { s: [1.0, 1.08], o: '60% 50%' })],
  [150.02, 154.40, 'S32 harrods night', (i) => par(i, 'harrods_night', { bri: 0.82 })],
  [154.40, 158.50, 'S33 counter 20 days', (i, L, A) => [n('Counter', { to: 20, unit: 'DAYS', label: 'UNTIL HE WAS DUE TO LEAVE LONDON', at: A(155.2), dur: 80 }, bgP(i, 'sloane_street', 0.5))]], // v5: VO "less than three weeks"
  [158.50, 163.06, 'S34 doc stack', (i) => [n('DocStack', { docs: DOCS() }, bgP(i, 'brompton_road_knightsbridge', 0.5))]], // v5: was wet pavement stock
  [163.06, 167.80, 'S35 route map', (i) => [n('Grade', { sat: 1, con: 1.05, bri: 1, vig: 0.55, grain: 0.07 }, n('RouteMap', {
    ...MAP,
    keys: [[0, 1800, 1220, 0.9, 18], [60, 1700, 1180, 1.25, 10], [284, 1830, 1240, 1.4, 8]],
    pins: [{ x: 1439.9, y: 1047.3, label: 'HOLLAND PARK', time: '14 AUG - 14:59', at: 24 }, { x: 1950.2, y: 1212.0, label: 'HANS CRESCENT', time: '15 AUG - 14:27', at: 137 },
      { x: 2158, y: 1388, label: 'PIMLICO', time: 'ALDERNEY ST - HIS FLAT', at: 186 }],
  })), n('Credit', { text: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', place: 'br', hold: 200 })]],
  [167.80, 172.00, 'S36 brompton road', (i, L, A) => par(i, 'brompton_road_knightsbridge', { bri: 0.66, over: [place(A(168.3), 'BROMPTON ROAD', 'KNIGHTSBRIDGE')] })], // v5: was Article3D
  [172.00, 175.20, 'S37 hans crescent', (i, L, A) => photo(i, 'hans_crescent_geograph', { bri: 0.6, over: [td(A(172.3), '15 AUGUST, 14:27')] })],
  [175.20, 178.42, 'S38 hans crescent sign', (i) => par(i, 'hans_crescent_sign', { bri: 0.62 })],
  [178.42, 182.10, 'S39 HCR analyse', (i) => [n('CCTVAnalyse', { src: 'HCR', n: 70, box: [650, 10, 240, 370], o: [770, 150], zoom: 1.4, data: cctvData('HCR'), tag: 'GARETH WILLIAMS', tagAt: 'b', dpos: 'tl', g: { sat: 0.55, bri: 0.85, con: 1.1 } }), n('Grade', { vig: 0.55, grain: 0.07 }), met('br')]],
  [182.10, 185.85, 'S40 HCR raw', (i) => live(i, 'HCR', 0, 1, { bri: 0.75 }, [met('tr')])],
];

export default {
  id: 'lm_case01a',
  media: 'last-moments',
  end: 185.85,
  plain: true,
  vo: { starts: [0.50, 43.80, 95.57, 139.30], lens: [43.38, 51.76, 38.20, 42.78], file: (i) => ['vo/c01a_p01a.wav', 'vo/c01a_p01b.wav', 'vo/c01a_p01c.wav', 'vo/c01a_p02.wav'][i], tail: 0 },
  devices: ['shared', 'lm', 'lm_c01b', 'lm_c01a', 'lm_pro', 'lm_mg'],
  fonts: ['Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'VCROSDMono-latin.woff2'],
  shots: T.map(([c, to, name, fn], i) => {
    const L = Math.round((to - c) * 60), A = (t) => Math.round((t - c) * 60);
    return { name, c, to, k: 'hard', n: 0, el: () => fn(i, L, A) };
  }),
  audio: [
    { src: 'mus_a', id: 'mus_a1', file: 'music/es_dark_days.mp3', at: 0, to: 108, trim: 5.07, lane: musLane('music/es_dark_days.mp3', 5.07, 108, tgtAt(0), 0.05, 6, ptsAt(0)) },
    { src: 'mus_b', id: 'mus_b', file: 'music/es_tarmac_radiation.mp3', at: 102, to: 156.5, trim: 61.1, lane: musLane('music/es_tarmac_radiation.mp3', 61.1, 54.5, tgtAt(102), 6, 6, ptsAt(102)) },
    { src: 'mus_a', id: 'mus_a2', file: 'music/es_dark_days.mp3', at: 150.5, to: 185.85, lane: musLane('music/es_dark_days.mp3', 0, 35.35, tgtAt(150.5), 6, 1.5, ptsAt(150.5)) },
    room(...RAWS[0]), room(...RAWS[1]),
    ...BRUSH.map((t) => sfx('lm_brush', t)),
    ...ARTS.flatMap(([c, f0, st]) => [sfx('lm_paper', c), ...(st ? [sfx('lm_settle', c + 0.45)] : []), sfx('lm_marker', c + f0 / 60 - 0.03), sfx('lm_marker', c + (f0 + 26) / 60 - 0.03)]),
    ...CLICKS.map((t) => sfx('lm_click', t - 0.15)), // peak 0.223 s in the file -> lands ~0.07 s into the 0.5 s fade
    ...WHOOSH.map((t) => sfx('lm_whoosh', t)),
    sfx('lm_paper', 158.50), ...[10, 150].flatMap((a) => [0, 26].map((d) => sfx('lm_marker', 158.50 + (a + 12 + d) / 60 - 0.03))), // S34 DocStack
    ...counterTicks(154.40 + Math.round((155.2 - 154.40) * 60) / 60, 0, 20, 80).map((t) => sfx('tick_soft', t, -8)), // S33 Counter
    sfx('lm_boom', 28.30), // dip into S06 (peak 28.48, music back)
    sfx('riser_dark', 133.95 - 5.91),
    sfx('lm_boom', 133.95 - 0.17),
    sfx('riser_dark', 182.10 - 5.91),
    sfx('lm_boom', 182.10 - 0.17, -3, 3.9),
  ],
};
