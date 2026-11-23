// lm_case04 - "The record-breaking rope on Jalan Sudirman" (Makassar). MKS source is only 7.5 s usable (HARD OUT 7.5), so shots are
// CCTV freeze frames (extracted jpgs c04/mks_f*.jpg, faces mosaicked), Commons photos, satellite maps and cards on blurred photos.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H, MED } from './lm_lib.mjs';

const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c04.json', import.meta.url), 'utf8'));
const LOG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../productions/last-moments/assets/MEDIA_LOG_c02_21.tsv');
const credits = {};
if (fs.existsSync(LOG)) for (const l of fs.readFileSync(LOG, 'utf8').split('\n')) { const c = l.split('\t'); if (c.length >= 6) credits[c[0]] = c[5].trim(); }
// photo helpers: missing file -> fallback (so the table always builds); credit from the media log
const FB = 'c04/losari_sign.jpg';
const used = [];
const pic = (rel) => { used.push(rel); return fs.existsSync(path.join(MED, rel)) ? rel : (console.warn('MISSING photo ' + rel), FB); };
const cr = (rel) => credits[rel] || 'PHOTO: WIKIMEDIA COMMONS';
const photo = (i, rel, o = {}) => H.photo(i, pic(rel), cr(rel), o);
const bg = (i, rel, bri) => H.bgP(i, pic(rel), bri);
const bgv = (i, t, bri) => H.bgV(i, 'MKS', t, bri);
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', CCTV = 'FOOTAGE: MAKASSAR CITY CCTV VIA YOUTUBE';

// CCTV head boxes (2026-11-23), in the 1920x942 frame px of c04/mks_f*.jpg, one list per freeze frame (people move, so per frame).
// Every list = fixed people + moving people of that frame + the BANDICAM watermark box. Photo shots: cover box 1920x1080 of the 1920x942 frame.
const WM = [790, 0, 345, 42];
const FIX = [[30, 440, 125, 105], [240, 395, 110, 110], [255, 510, 125, 115], [105, 685, 125, 115], [0, 760, 90, 110], [320, 760, 120, 110], [430, 800, 110, 100],
  [420, 155, 170, 85], [455, 255, 85, 80], [770, 195, 90, 75], [1590, 605, 90, 85], [1110, 0, 95, 70], [1200, 0, 85, 60]];
const FR = {
  '0.0': [[1355, 170, 85, 75], [890, 10, 80, 80], [925, 40, 80, 80], [1040, 0, 90, 80], [640, 435, 150, 150], [815, 500, 100, 100], [880, 570, 110, 110], [1360, 430, 110, 110], [1495, 395, 115, 115]],
  '1.5': [[1425, 165, 85, 80], [885, 15, 85, 85], [965, 40, 85, 80], [1040, 0, 90, 70], [755, 440, 100, 100], [845, 480, 100, 100], [580, 525, 110, 110], [890, 570, 110, 110], [1360, 430, 110, 120], [1495, 395, 115, 115]],
  '3.0': [[1580, 160, 100, 90], [880, 45, 90, 90], [985, 80, 90, 90], [990, 0, 80, 60], [620, 520, 110, 110], [830, 465, 100, 100], [910, 455, 100, 100], [890, 575, 110, 110], [1380, 480, 110, 120], [1495, 395, 115, 115]],
  '4.5': [[1590, 150, 100, 90], [925, 85, 100, 100], [1040, 115, 100, 100], [960, 0, 70, 70], [0, 0, 130, 150], [600, 540, 110, 110], [765, 490, 110, 110], [890, 555, 100, 100], [1010, 500, 110, 110], [1360, 560, 100, 100], [1490, 410, 115, 115], [255, 580, 155, 130]],
  '6.0': [[1590, 150, 100, 90], [1100, 150, 260, 200], [600, 510, 510, 150], [1380, 600, 110, 110], [1450, 420, 115, 115], [255, 580, 155, 130]],
  '7.2': [[1590, 150, 100, 90], [1225, 215, 100, 100], [1310, 225, 100, 100], [610, 525, 110, 110], [745, 480, 110, 110], [885, 555, 100, 100], [1005, 570, 110, 110], [1390, 640, 110, 100], [1405, 430, 110, 115], [260, 580, 150, 130], [200, 0, 110, 50]],
};
// photo: 1920x942 frame -> cover box 1920x1080 (x1.1465, x offset -141)
const toPhoto = ([x, y, w, h]) => [Math.round(1.1465 * x - 141), Math.round(1.1465 * y), Math.round(1.1465 * w), Math.round(1.1465 * h)];
const MOS_FR = (t) => [...FIX, ...FR[t], WM].map(toPhoto);
const frame = (i, t, o = {}) => H.photo(i, `c04/mks_f${t}.jpg`, CCTV, { mos: MOS_FR(t), bri: 0.95, ...o });
// raw video (source 640x314 = /3): moving people as keyframe tracks (source seconds), the rest static unions
const sr = (b) => b.map((v) => Math.round(v / 3));
const tr = (list) => ({ keys: list.map(([t, ...b]) => [t, ...sr(b)]) });
const RAW_FIX = [...FIX, WM].map((b) => ({ r: sr(b) }));
const MOS_RAW1 = [...RAW_FIX, { r: sr([580, 435, 440, 225]) }, { r: sr([1360, 430, 110, 120]) }, { r: sr([1495, 395, 115, 115]) },
  tr([[0, 1355, 170, 85, 75], [1.5, 1425, 165, 85, 80], [3.0, 1580, 160, 100, 90], [4, 1590, 155, 100, 90]]),
  tr([[0, 890, 10, 80, 80], [1.5, 885, 15, 85, 85], [3.0, 880, 45, 90, 90], [4, 900, 60, 95, 95]]),
  tr([[0, 925, 40, 80, 80], [1.5, 965, 40, 85, 80], [3.0, 985, 80, 90, 90], [4, 1010, 95, 95, 95]]),
  tr([[0, 1040, 0, 90, 80], [1.5, 1040, 0, 90, 70], [3.0, 990, 0, 80, 60], [4, 975, 0, 75, 65]])];
const MOS_RAW2 = [...RAW_FIX, { r: sr([600, 480, 515, 200]) }, { r: sr([1590, 150, 100, 90]) },
  tr([[4.5, 1360, 560, 100, 100], [7.2, 1390, 640, 110, 100]]),
  tr([[4.5, 1490, 410, 115, 115], [7.2, 1405, 430, 110, 115]]),
  tr([[4.5, 925, 85, 100, 100], [6.0, 1090, 150, 100, 100], [7.2, 1225, 215, 100, 100]]),
  tr([[4.5, 1040, 115, 100, 100], [6.0, 1180, 170, 100, 100], [7.2, 1310, 225, 100, 100]]),
  { r: sr([255, 510, 155, 200]) }, { r: sr([0, 0, 130, 150]) }];

const raws = S.raws.map((r, k) => ({ ...r, mute: true, mos: k === 0 ? MOS_RAW1 : MOS_RAW2, credit: CCTV }));

const shots = [
  // ---- before raw 1 (5.5 - 90.83)
  [5.5, 13.04, 'S01 women by divider', (i) => frame(i, '0.0')],
  [13.04, 16.22, 'S02 man with envelope', (i) => frame(i, '3.0')],
  [16.22, 21.48, 'S03 Sudirman', (i) => [...photo(i, 'c04/sudirman_cfd.jpg', { pos: '50% 38%' }), H.place(16.6, 'JALAN JENDERAL SUDIRMAN', 'MAKASSAR')]],
  [21.48, 26.78, 'S04 map Sulawesi', (i) => H.map(i, 'c04/map_z11.jpg', MAPC, [{ x: 960, y: 560, label: 'MAKASSAR', sub: 'SULAWESI, INDONESIA', at: 22.2 }])],
  [26.78, 30.36, 'S05 date', (i) => H.card(26.9, bg(i, 'c04/losari_dawn.jpg'), 'SUNDAY', ['18 DECEMBER 2022'], cr('c04/losari_dawn.jpg'))],
  [30.36, 33.44, 'S06 Masyita', (i) => [...photo(i, 'c04/losari_sunday.jpg'), H.label(30.6, 'MASYITA', 'ON THAT STRETCH OF ROAD')]],
  [33.44, 40.34, 'S07 rope laid', (i) => H.card(33.7, bg(i, 'c04/tarik_tambang.jpg'), '06:00', ['ROPE LAID DOWN THE AVENUE', '1,540 METRES'], cr('c04/tarik_tambang.jpg'))],
  [40.34, 45.78, 'S08 Hasanuddin', (i) => [...photo(i, 'c04/unhas_rektorat.jpg'), H.place(40.7, 'HASANUDDIN UNIVERSITY', 'ALUMNI ASSOCIATION')]],
  [45.78, 50.52, 'S09 MURI', (i) => H.card(46.0, bg(i, 'c04/unhas_tugu.jpg'), 'MURI, INDONESIAN RECORD MUSEUM', ['RECORD ATTEMPT', 'MOST PEOPLE IN A TUG OF WAR'], cr('c04/unhas_tugu.jpg'))],
  [50.52, 54.5, 'S10 new board', (i) => photo(i, 'c04/fort_rotterdam.jpg')],
  [54.5, 58.64, 'S11 mayor', (i) => [...photo(i, 'c04/pomanto.png', { pos: '50% 18%' }), H.label(54.8, 'DANNY POMANTO', 'MAYOR OF MAKASSAR')]],
  [58.64, 63.6, 'S12 5000', (i) => H.card(58.9, bg(i, 'c04/unhas_lake.jpg', 0.45), 'AROUND', ['5,000 PEOPLE', 'WHITE AND RED SHIRTS'], cr('c04/unhas_lake.jpg'))],
  [63.6, 68.38, 'S13 teams', (i) => H.card(63.8, bg(i, 'c04/unhas_pkm.jpg'), 'TEAM A  |  TEAM B', ['2,500 ON EACH SIDE'], cr('c04/unhas_pkm.jpg'))],
  [68.38, 72.64, 'S14 age', (i) => [...photo(i, 'c04/losari_pantai.jpg'), H.date(68.6, 'MASYITA, AGE 43')]],
  [72.64, 79.0, 'S15 witness', (i) => H.card(72.9, bg(i, 'c04/unhas_med.jpg', 0.45), 'DETIKSULSEL', ['WITNESS IKRAM SAPUTRA', 'MORNING JOG AT A NEARBY FIELD'], cr('c04/unhas_med.jpg'))],
  [79.0, 83.0, 'S16 map street', (i) => H.map(i, 'c04/map_z14.jpg', MAPC, [{ x: 960, y: 540, label: 'JALAN SUDIRMAN', sub: 'CAMERA: BATU P SELATAN', at: 79.5 }])],
  [83.0, 86.62, 'S17 camera view', (i) => frame(i, '4.5')],
  [86.62, 90.83, 'S18 women left', (i) => frame(i, '1.5', { over: [H.spot(87.0, 400, 600, 330)] })],
  // ---- between raws (94.83 - 114.925)
  [94.83, 99.61, 'S19 up the road', (i) => frame(i, '6.0', { pos: '50% 0%' })],
  [99.61, 105.05, 'S20 megaphone', (i) => H.card(99.8, bg(i, 'c04/unhas_fib.jpg', 0.45), 'ORGANISER', ['USED A MEGAPHONE', 'NOT TO STAND ON THE RIGHT SIDE OF THE ROPE'], cr('c04/unhas_fib.jpg'))],
  [105.05, 110.5, 'S21 rope length', (i) => H.card(105.3, bg(i, 'c04/fort2.jpg', 0.45), 'THE ROPE', ['1,540 METRES', 'A LITTLE UNDER A MILE'], cr('c04/fort2.jpg'))],
  [110.5, 114.925, 'S22 man walks', (i) => frame(i, '3.0', { over: [H.spot(111.0, 1130, 640, 330)] })],
  // ---- after raw 2 (117.925 - 220.675); never the whip / fall / aftermath
  [117.925, 123.02, 'S23 recording', (i) => [...frame(i, '7.2'), H.dip(0, 14)]],
  [123.02, 129.5, 'S24 map', (i) => H.map(i, 'c04/map_z14.jpg', MAPC, [{ x: 960, y: 540, label: 'JALAN SUDIRMAN', sub: 'SUNDAY 18 DECEMBER 2022', at: 123.5 }])],
  [129.5, 134.63, 'S25 quiet', (i) => photo(i, 'c04/losari_beach.jpg', { bri: 0.6 })],
  [134.63, 141.26, 'S26 injury', (i) => H.card(134.9, bg(i, 'c04/unhas_bld.jpg', 0.4), 'MASYITA, 43', ['DIED OF A SERIOUS HEAD INJURY', 'SEVERAL OTHERS HURT'], cr('c04/unhas_bld.jpg'))],
  [141.26, 148.75, 'S27 snapped?', (i) => H.card(141.5, bg(i, 'c04/fort3.jpg', 0.4), 'DID THE ROPE BREAK?', ['SOME OUTLETS: IT SNAPPED', 'ORGANISER: IT DID NOT'], cr('c04/fort3.jpg'))],
  [148.75, 156.53, 'S28 Kompas', (i) => H.card(149.0, bg(i, 'c04/fort4.jpg', 0.4), 'KOMPAS TV', ['ORGANISER: THE WOMEN WERE', '"HOLDING THE ROPE WHILE TAKING SELFIES"'], cr('c04/fort4.jpg'))],
  [156.53, 162.16, 'S29 spread online', (i) => frame(i, '4.5', { pos: '50% 50%' })],
  [162.16, 166.45, 'S30 police', (i) => [bgv(i, 6.6, 0.5), H.place(162.5, 'MAKASSAR POLICE')]],
  [166.45, 171.72, 'S31 20 Dec', (i) => H.card(166.7, bgv(i, 0.4, 0.4), '20 DECEMBER', ['25 WITNESSES QUESTIONED', 'CRIMINAL INVESTIGATION OPENED'], CCTV)],
  [171.72, 176.79, 'S32 Antara', (i) => [bgv(i, 0.8, 0.5), H.place(172.0, 'ANTARA', 'NATIONAL NEWS AGENCY')]],
  [176.79, 184.27, 'S33 24 Dec', (i) => H.card(177.0, bgv(i, 1.0, 0.4), '24 DECEMBER', ['EVENT COMMITTEE CHAIR NAMED A SUSPECT', 'NEGLIGENCE  |  NOT DETAINED'], CCTV)],
  [184.27, 190.62, 'S34 AKBP', (i) => H.card(184.5, bgv(i, 1.8, 0.4), 'DETIKSULSEL', ['AKBP RHEONALD SIMANJUNTAK', 'MAKASSAR CITY POLICE'], CCTV)],
  [190.62, 194.19, 'S35 restorative', (i) => H.card(190.8, bgv(i, 2.6, 0.4), 'RESTORATIVE JUSTICE', ['A SETTLEMENT UNDER INDONESIAN LAW'], CCTV)],
  [194.19, 200.97, 'S36 case review', (i) => [bgv(i, 3.0, 0.5), H.place(194.5, 'CASE REVIEW', 'FAMILY AND SUSPECT ONLY')]],
  [200.97, 205.77, 'S37 24 Jan', (i) => H.card(201.2, bgv(i, 3.4, 0.4), '24 JANUARY 2023', ['KOMPOL LANDO'], CCTV)],
  [205.77, 210.39, 'S38 Medcom', (i) => H.card(206.0, bgv(i, 4.2, 0.4), 'MEDCOM', ['HAVE THE TWO SIDES SETTLED?'], CCTV)],
  [210.39, 215.06, 'S39 yes already', (i) => H.card(210.5, bgv(i, 5.0, 0.4), 'KOMPOL LANDO', ['"YES, ALREADY."'], CCTV)],
  [215.06, 220.675, 'S40 SP3', (i) => [...H.card(215.3, bgv(i, 5.8, 0.35), 'SP3', ['INVESTIGATION ENDED', 'NO ONE WAS CONVICTED'], CCTV), H.dip(0, 24)]],
];

{ const cnt = {}; for (const u of used) cnt[u] = (cnt[u] || 0) + 1; const d = Object.entries(cnt).filter(([, v]) => v > 1); if (d.length) console.warn('REPEATED', JSON.stringify(d)); }
export default makeCase({ id: 'lm_case04', num: 4, title: S.name, plate: ['c04/losari_sign.jpg', cr('c04/losari_sign.jpg')], vo: S.vo, raws, shots, end: S.end });
