// lm_case15 - "Fatty Goes To Africa": the livestream walk (Indra Chowk, Kathmandu). Source FAT -> media FATC.mp4 = FAT cropped to the stream (crop 540x720 at x372, no LIVE badge / R.I.P inset), trimmed to src 0-44.2 s (NOTHING after 0:44 exists on disk).
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c15.md
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, n, MED } from './lm_lib.mjs';

const EOX = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const has = (rel) => fs.existsSync(path.join(MED, rel));
const FT = 'FATC';
// ---- blur boxes, SOURCE px (540x720). Keys = [srcSec, x, y, w, h]; zero box = off.
const Z = (t) => [t, 0, 0, 0, 0];
const MOS = [
  // lead QC 2026-11-23 (true source frames): companion face 8.15-9.4, left man 8.5-9.9, mask woman 30.9-31.7, mask woman centre 36.9-37.7
  { keys: [Z(8.1), [8.15, 80, 0, 300, 320], [8.45, 150, 0, 330, 340], [8.6, 200, 0, 340, 340], [8.9, 280, 0, 260, 340], [9.2, 380, 0, 160, 380], [9.45, 420, 0, 120, 380], Z(9.55)] },
  { keys: [Z(8.45), [8.5, 10, 150, 170, 180], [8.9, 30, 120, 170, 180], [9.2, 50, 120, 150, 180], [9.6, 90, 60, 220, 170], [9.9, 90, 60, 220, 170], Z(10.0)] },
  { keys: [Z(30.85), [30.9, 0, 240, 150, 230], [31.7, 0, 240, 160, 230], Z(31.8)] },
  { keys: [Z(36.8), [36.9, 120, 120, 110, 110], [37.3, 100, 110, 100, 110], [37.7, 60, 140, 110, 120], Z(37.85)] },
  // hoodie walker / second companion head (profile faces)
  { keys: [Z(10.9), [11.0, 20, 110, 190, 230], [11.6, 20, 110, 190, 230], Z(11.7), Z(13.6), [13.8, 170, 110, 170, 170], [14.0, 170, 110, 170, 170], [15.5, 170, 70, 150, 160], [17.0, 170, 60, 140, 150], [18.5, 160, 60, 150, 150], [19.0, 20, 30, 170, 170],
    [20.0, 0, 30, 150, 150], [21.5, 10, 0, 140, 170], [23.0, 180, 30, 190, 200], [24.5, 10, 20, 170, 190], [26.0, 130, 60, 160, 180], [27.5, 0, 110, 140, 190], [29.0, 220, 160, 160, 190], Z(30.0), Z(32.9),
    [33.0, 100, 130, 150, 180], [33.8, 100, 130, 150, 180], Z(34.5), Z(35.9), [36.5, 200, 0, 130, 90], [38.0, 190, 10, 140, 150], [39.5, 90, 0, 140, 110], [41.0, 270, 0, 230, 230], [42.5, 380, 0, 160, 170], [44.2, 380, 0, 160, 170]] },
  // companion in the black jacket (near right): laughing face 12-13, profile 31.5-33.2
  { keys: [Z(10.9), [11.0, 390, 440, 150, 260], [11.3, 350, 300, 190, 300], [11.6, 330, 230, 210, 300], [12.0, 200, 110, 300, 340], [12.5, 200, 130, 290, 300], [13.2, 360, 60, 180, 260], [14.0, 430, 0, 110, 220], [14.5, 430, 0, 110, 220], Z(14.6), Z(31.0), [31.5, 330, 0, 210, 250], [32.0, 210, 20, 170, 230], [32.7, 260, 20, 180, 230], [33.2, 380, 0, 160, 200], Z(33.5), Z(38.4), [38.6, 360, 0, 180, 300], [39.2, 360, 0, 180, 300], Z(39.4), Z(40.9), [41.0, 400, 0, 140, 200], [44.2, 400, 0, 140, 200]] },
  // Nepali bystanders
  { keys: [Z(3.7), [3.8, 0, 540, 130, 150], [8.0, 0, 540, 130, 150], Z(8.1)] },
  { keys: [Z(4.4), [4.5, 400, 570, 110, 130], [8.0, 400, 570, 110, 130], Z(8.1)] },
  { keys: [Z(6.4), [6.5, 220, 480, 130, 200], [8.5, 220, 480, 130, 200], Z(8.6)] },
  { keys: [Z(13.4), [13.5, 0, 160, 110, 120], [16.5, 0, 160, 110, 120], [16.6, 60, 170, 100, 110], [18.0, 60, 170, 100, 110], Z(18.1)] },
  { keys: [Z(29.9), [30.0, 225, 250, 110, 120], [30.5, 70, 220, 90, 120], [31.2, 70, 220, 90, 120], Z(31.3), Z(34.4), [34.5, 410, 140, 90, 100], [36.0, 410, 140, 90, 100], Z(36.1), Z(37.7), [37.8, 0, 150, 100, 130], [39.3, 0, 150, 100, 130], Z(39.4)] },
];
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
// near-still of the stream (speed 0.02) so the source never plays under a card; blurred where faces are
const still = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.clip(i, FT, t, { speed: 0.02, mos: MOS, ...o }), ...extra()]);
const photo = (a, b, name, src, credit, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, credit, o), ...extra()]);
const map = (a, b, name, src, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, EOX, { bri: 0.8, cp: 'br' }), ...extra()]);
const bgv = (i, t, bri = 0.5) => n('Grade', { sat: 0.5, bri, con: 1.08 }, n('Cam', { s: [1.1, 1.18], ry: [-1, 1], tx: [-14, 14], css: 'filter:blur(16px)' }, n('LClip', { src: FT, t, speed: 0.02, sw: 540, sh: 720, fit: 'cover' })));
const cardV = (a, b, name, t, kick, lines) => add(a, b, name, (i) => H.card(a + 0.3, bgv(i, t), kick, lines));
const cardP = (a, b, name, src, kick, lines, credit) => add(a, b, name, (i) => H.card(a + 0.3, H.bgP(i, src), kick, lines, credit));
// card on a Commons photo if it exists, else on a map/stream backdrop
const PH = (f) => (has(f) ? f : null);

// ---- A: 5.5 - 87.7 (VO p01)
still(5.5, 10.0, 'A01 lane', 31.0, {}, () => [H.place(6.3, 'KATHMANDU', 'NEPAL')]);
still(10.0, 13.0, 'A02 hoodie ahead', 18.0);
still(13.0, 17.4, 'A03 crowd thins', 30.5);
cardV(17.4, 22.0, 'A04 douyin', 20.0, 'ON DOUYIN, THE CHINESE', ['VERSION OF TIKTOK']);
cardV(22.0, 26.3, 'A05 account', 24.5, 'HIS ACCOUNT', ['"FATTY GOES TO AFRICA"']);
cardV(26.3, 31.0, 'A06 nypost', 36.5, 'ACCORDING TO THE NEW YORK POST', ['CLOSE TO 5 MILLION', 'FOLLOWERS']);
cardP(31.0, 33.9, 'A07 abroad', 'c15/map_nepal.jpg', 'STREET FOOD AND EVERYDAY LIFE', ['ABROAD, MOSTLY IN AFRICA'], EOX);
still(33.9, 39.4, 'A08 chatting', 22.5);
still(39.4, 44.5, 'A09 phone out front', 7.5);
cardV(44.5, 49.2, 'A10 police name', 39.0, 'NEPAL POLICE NAMED HIM', ['GAN SOUJIONG, 29']);
add(49.2, 52.3, 'A11 december', (i) => [...H.photo(i, 'c15/map_nepal.jpg', EOX, { bri: 0.8, cp: 'br' }), H.date(49.5, 'DECEMBER 2022'), H.place(50.4, 'NEPAL')]);
cardP(52.3, 58.9, 'A12 feng', 'c15/map_valley.jpg', 'ANOTHER CHINESE MAN LIVED THERE', ['FENG ZHENGYUNG, 37', 'ONLINE: "AYUN"'], EOX);
cardV(58.9, 64.2, 'A13 debts', 26.0, 'CHINESE AUTHORITIES IN NEPAL', ['CONFIRMED AN EARLIER', 'CONFLICT OVER DEBTS']);
still(64.2, 68.0, 'A14 sunday', 36.0, {}, () => [H.date(64.5, 'SUNDAY 4 DECEMBER 2022')]);
add(68.0, 71.1, 'A15 indra chowk', (i) => [...H.photo(i, 'c15/map_chowk.jpg', EOX, { bri: 0.85, cp: 'br' }), H.place(68.4, 'INDRA CHOWK', 'KATHMANDU')]);
add(71.1, 75.1, 'A16 old market', (i) => H.map(i, 'c15/map_valley.jpg', EOX, [{ x: 960, y: 540, label: 'INDRA CHOWK', at: 71.8 }]));
still(75.1, 80.3, 'A17 crossroads', 14.5);
map(80.3, 84.0, 'A18 durbar', 'c15/map_chowk.jpg', () => [H.place(80.7, 'DURBAR SQUARE', 'A SHORT WALK')]);
still(84.0, 87.7, 'A19 selfie then street', 4.8);

// ---- B: 98.7 - 113.875 (VO p02)
still(98.7, 103.5, 'B01 joking', 9.5);
cardV(103.5, 107.0, 'B02 tease', 22.0, 'ONE OF THEM TEASES', ['"FATTY, GET MARRIED"']);
still(107.0, 110.5, 'B03 friends', 19.0);
still(110.5, 113.875, 'B04 pointing hand', 7.0);

// ---- C: 130.875 - 145.44 (VO p03)
still(130.875, 134.5, 'C01 any stream', 22.5);
still(134.5, 138.5, 'C02 step ahead', 36.5);
still(138.5, 142.0, 'C03 shoppers pass', 35.0);
still(142.0, 145.44, 'C04 thin out', 39.5);

// ---- D: 161.44 - 245.445 (VO p04); no footage after src 0:44, nothing shown of the attack
still(161.44, 165.6, 'D01 seconds later', 43.2);
add(165.6, 170.2, 'D02 black', (i) => [...H.clip(i, FT, 43.9, { speed: 0.02, mos: MOS, bri: 0.6 }), H.dip(0, 40)]);
cardV(170.2, 174.5, 'D03 first reports', 30.0, 'THE FIRST REPORTS IN NEPAL', ['A FIGHT BETWEEN THREE', 'CHINESE NATIONALS']);
cardV(174.5, 179.5, 'D04 mainali', 39.0, 'SUPERINTENDENT DINESH RAJ MAINALI', ['TOLD THE HIMALAYAN TIMES', 'ONE OF THE THREE ATTACKED']);
cardV(179.5, 184.0, 'D05 police say', 20.0, 'POLICE SAY THE ATTACKER WAS FENG', ['GAN AND HIS FRIEND', 'WERE BOTH INJURED']);
cardP(184.0, 188.5, 'D06 new road', 'c15/map_chowk.jpg', 'LOCAL POLICE POST', ['NEW ROAD, KATHMANDU'], EOX);
cardP(188.5, 193.0, 'D07 trauma', 'c15/map_valley.jpg', 'BOTH MEN TAKEN TO', ['THE NATIONAL TRAUMA CENTRE'], EOX);
cardV(193.0, 198.5, 'D08 friend', 25.0, 'HIS FRIEND, 32', ['CRITICAL CONDITION', 'LATER REPORTED TO HAVE SURVIVED']);
cardV(198.5, 203.5, 'D09 died', 33.0, 'THAT EVENING', ['GAN DIED IN HOSPITAL']);
cardP(203.5, 208.0, 'D10 arrest', 'c15/map_nepal.jpg', 'FENG WAS ARRESTED THE SAME DAY', ['MOTIVE: AFTER THE', 'INVESTIGATION'], EOX);
cardV(208.0, 213.5, 'D11 netease', 28.5, 'ACCORDING TO NETEASE', ['FENG CLAIMED GAN', 'TREATED HIM BADLY']);
cardV(213.5, 220.2, 'D12 yuan', 15.0, 'MORE THAN 9,000 YUAN', ['TAKEN TO BUY A PHONE']);
cardV(220.2, 224.5, 'D13 unverified', 41.5, 'NONE OF THESE CLAIMS', ['HAS BEEN VERIFIED']);
cardV(224.5, 230.0, 'D14 wont show', 38.0, 'OTHER VIDEO FILMED AFTER', ['THE ATTACK EXISTS', 'WE WILL NOT SHOW IT']);
cardV(230.0, 234.5, 'D15 weibo', 10.0, 'CLIPS SPREAD ACROSS', ['WEIBO, THEN YOUTUBE', 'OFTEN WITH WRONG NAMES']);
cardP(234.5, 239.5, 'D16 held', 'c15/map_valley.jpg', 'FENG ARRESTED', ['AND HELD IN NEPAL'], EOX);
cardV(239.5, 245.445, 'D17 no verdict', 17.0, 'NO TRIAL, VERDICT OR SENTENCE FOUND', ['UP TO NOVEMBER 2026']);

export default makeCase({
  id: 'lm_case15', num: 15, title: '"FATTY GOES TO AFRICA": THE LIVESTREAM WALK',
  plate: ['c15/map_chowk.jpg', EOX],
  vo: [['vo/c15_p01.wav', 6.0], ['vo/c15_p02.wav', 99.2], ['vo/c15_p03.wav', 131.375], ['vo/c15_p04.wav', 161.94]],
  raws: [
    { tag: FT, a: 87.7, b: 98.7, t: 0.3, mute: true, credit: 'FOOTAGE: LIVESTREAM REPOST (DOUYIN)', mos: MOS },
    { tag: FT, a: 113.875, b: 130.875, t: 11.0, mute: true, mos: MOS },
    { tag: FT, a: 145.44, b: 161.44, t: 28.0, mute: true, mos: MOS },
  ],
  shots: SH, end: 245.445,
});
