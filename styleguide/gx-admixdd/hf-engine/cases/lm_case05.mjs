// lm_case05 - "The man on the porch, seen from the air" (Hatcher Pass, Alaska). Source CRV = Crave Life / Dmitry Kudryn, 1920x1080, no audio.
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c05.md
import { makeCase, H } from './lm_lib.mjs';

const CR = 'FOOTAGE: CRAVE LIFE / DMITRY KUDRYN';
const WM = [{ r: [20, 1012, 310, 56] }]; // "CRAVE LIFE" watermark, source px
const R = (s, t, m = false, credit) => ({ tag: 'CRV', a: s[0], b: s[1], t, mute: m, ...(credit ? { credit } : {}), mos: WM });
// b-roll pools of CRV source seconds (outside the raw windows 120-145, 204-229, 270-295, 348-360, 369-375, 406-430 and the intro moments 195.5 / 236)
const POOL = {
  FLY: [297, 346], AFT: [376, 405], LATE: [431, 519], TAKE: [241, 269], SUN: [526, 545], SUN2: [520, 525.8], LAND: [547, 590], LAND2: [591.5, 600], SHOP: [146, 165], OFF: [172, 192],
  HEAD: [49, 60], HEAD2: [62, 73], HEAD3: [93, 101], HANG: [229.3, 235], OUT: [602, 650], GRO: [31.0, 34.6], FLY2: [361, 368.5], BG1: [4, 12.5], BG2: [18.5, 30], BG4: [74, 86], BG5: [100.5, 118],
};
const cur = Object.fromEntries(Object.entries(POOL).map(([k, v]) => [k, v[0]]));
const take = (name, dur, fall = ['FLY', 'AFT', 'LATE', 'TAKE', 'SUN', 'LAND', 'FLY2', 'OFF', 'SHOP']) => {
  for (const nm of [name, ...fall]) { if (cur[nm] + dur <= POOL[nm][1] + 0.01) { const t = +cur[nm].toFixed(2); cur[nm] += dur + 0.4; return t; } }
  throw new Error(`pool ${name} exhausted at dur ${dur}`);
};
let k = 0;
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
// b-roll clip shot from a pool
const clip = (a, b, pool, o = {}, extra = () => []) => { const t = take(pool, b - a); k++;
  add(a, b, `B${k} ${pool}`, (i) => [...H.clip(i, 'CRV', t, { mos: WM, credit: k % 6 === 1 ? CR : undefined, ...o }), ...extra()]); };
const still = (a, b, name, t, o = {}) => add(a, b, name, (i) => H.clip(i, 'CRV', t, { mos: WM, speed: 0.02, ...o }));
const photo = (a, b, name, src, credit, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, credit, o), ...extra()]);
const card = (a, b, name, pool, kick, lines, o = {}) => { const t = take(pool, b - a, ['OUT', 'BG5', 'BG2', 'BG4', 'BG1', 'LATE', 'AFT', 'LAND', 'SUN', 'TAKE', 'FLY', 'OFF', 'SHOP']);
  add(a, b, name, (i) => H.card(a + 0.3, H.bgV(i, 'CRV', t), kick, lines)); };

// ---- A: 5.5 - 168.67 (VO p01)
clip(5.5, 12.5, 'FLY', {}, () => [H.place(6.6, 'HATCHER PASS', 'ALASKA')]);
clip(12.5, 16.3, 'FLY'); clip(16.3, 20.2, 'FLY');
clip(20.2, 24.5, 'FLY'); clip(24.5, 28.8, 'FLY');
photo(28.8, 35.5, 'A06 road', 'c05/plate.jpg', 'PHOTO: SHIRLEY BINN FROM BONSALL, SAN DIEGO / CC BY 2.0', { pos: 'center' }, () => [H.date(29.3, '18 AUGUST 2018')]);
photo(35.5, 39.2, 'A07 winter', 'c05/hatch_winter2.jpg', 'PHOTO: SHIRLEY BINN FROM BONSALL, SAN DIEGO / CC BY 2.0');
clip(39.2, 43.4, 'FLY');
card(43.4, 49.6, 'A09 no rifle', 'OUT', 'WHAT HE DID NOT TAKE', ['NO RIFLE', 'NO BEAR SPRAY']);
card(49.6, 59.0, 'A10 born', 'OUT', 'VLADIMIR PETROVICH KOSTENKO, 41', ['BORN IN ZELENOKUMSK, RUSSIA', 'ONE OF 14 CHILDREN']);
photo(59.0, 65.5, 'A11 walla', 'c05/wallawalla.jpg', 'PHOTO: JASON W LACEY / CC0', {}, () => [H.place(59.6, 'WALLA WALLA', 'WASHINGTON'), H.date(62.5, '1999')]);
clip(65.5, 69.7, 'LATE');
photo(69.7, 73.5, 'A13 2011', 'c05/talk_range.jpg', 'PHOTO: FRANK K. FROM ANCHORAGE, ALASKA, USA / CC BY 2.0', {}, () => [H.date(70.2, '2011')]);
clip(73.5, 77.0, 'LATE');
card(77.0, 83.6, 'A15 not like', 'OUT', 'HIS SISTER, ALLA', ['"NOT LIKE ANYBODY', 'I\'VE EVER MET"']);
photo(83.6, 89.9, 'A16 alaska', 'c05/talk2.jpg', 'PHOTO: FRANK K. FROM ANCHORAGE, ALASKA, USA / CC BY 2.0', {}, () => [H.date(84.2, '2018')]);
add(89.9, 95.7, 'A17 map', (i) => H.map(i, 'c05/map_hatcher.jpg', 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', [
  { x: 927, y: 646, label: 'WASILLA', at: 93.4 }, { x: 998, y: 494, label: 'HATCHER PASS', at: 94.6 }]));
add(95.7, 102.0, 'A18 kudryn', (i) => [...H.clip(i, 'CRV', take('HEAD', 6.3), { mos: WM }), H.label(96.6, 'DMITRY KUDRYN', 'FAMILY FRIEND, WASILLA')]);
clip(102.0, 105.6, 'FLY'); clip(105.6, 109.2, 'FLY');
card(109.2, 113.3, 'A21 nowhere', 'OUT', 'KUDRYN TO THE ANCHORAGE DAILY NEWS', ['"IT\'S TRULY IN THE', 'MIDDLE OF NOWHERE"']);
clip(113.3, 119.5, 'LATE');
card(119.5, 126.3, 'A23 squirrel', 'OUT', 'HIS LAST TEXTS', ['"THIS PLACE IS AMAZING,', 'ESPECIALLY WITHOUT THE SQUIRREL"']);
clip(126.3, 131.6, 'TAKE');
clip(131.6, 136.3, 'SHOP'); clip(136.3, 141.2, 'SHOP');
card(141.2, 149.2, 'A27 last text', 'OUT', '30 SEPTEMBER 2018', ['THE LAST TEXT', 'HE NEVER CAME OUT']);
add(149.2, 156.0, 'A28 filmed', (i) => H.clip(i, 'CRV', take('HEAD2', 6.8), { mos: WM }));
add(156.0, 161.3, 'A29 posted', (i) => [...H.clip(i, 'CRV', take('HEAD3', 5.3), { mos: WM }), H.date(156.5, '10 JANUARY 2019')]);
clip(161.3, 165.2, 'HEAD2', {}, () => []);
clip(165.2, 168.67, 'SHOP');

// ---- B: 193.67 - 216.18 (VO p02)
clip(193.67, 198.6, 'OFF'); clip(198.6, 202.1, 'GRO');
clip(202.1, 206.6, 'HANG', {}, () => [H.date(202.6, '3 NOVEMBER 2018')]);
clip(206.6, 211.4, 'TAKE', {}, () => [H.place(207.0, 'BIRCHWOOD AIRPORT', 'NORTH OF ANCHORAGE')]);
clip(211.4, 216.18, 'TAKE');
// ---- C: 241.18 - 258.11 (VO p03)
clip(241.18, 245.0, 'TAKE'); clip(245.0, 248.9, 'TAKE'); clip(248.9, 252.3, 'TAKE'); clip(252.3, 258.11, 'FLY');
// ---- D: 283.11 - 297.035 (VO p04)
clip(283.11, 287.6, 'FLY'); clip(287.6, 292.0, 'FLY'); clip(292.0, 297.035, 'FLY');
// ---- E: 309.035 - 327.72 (VO p05)
still(309.035, 316.0, 'E1 spot', 355.0, { credit: CR }); still(316.0, 321.5, 'E2 face', 356.8); clip(321.5, 327.72, 'FLY');
// ---- F: 333.72 - 345.555 (VO p06)
clip(333.72, 337.9, 'AFT'); clip(337.9, 342.1, 'AFT'); still(342.1, 345.555, 'F3 porch', 357.2);
// ---- G: 369.555 - 522.565 (VO p07)
card(369.555, 378.6, 'G1 gestures', 'FLY2', 'KUDRYN, ON THE MAN\'S GESTURES', ['"I\'M OUT OF HERE, I\'M GOING', 'TO BE WALKING OUT SOON"']);
photo(378.6, 382.6, 'G2 quake', 'c05/quake_glenn.jpg', 'PHOTO: ALASKA DOT&PF / CC BY 2.0', {}, () => [H.date(379.1, '30 NOVEMBER 2018')]);
photo(382.6, 386.7, 'G3 quake2', 'c05/quake_mirror.jpg', 'PHOTO: ALASKA DOT&PF / CC BY 2.0', {}, () => []);
clip(386.7, 392.0, 'AFT', {}, () => [H.date(387.2, '3 DECEMBER 2018')]);
add(392.0, 398.5, 'G5 medred', () => H.art('c05_medred', 394.0));
card(398.5, 406.3, 'G6 hawaii', 'OUT', '17 DECEMBER 2018', ['AIRLINE RECORDS SHOW A', 'VLADIMIR KOSTENKO FLYING TO HAWAII']);
clip(406.3, 412.0, 'LATE');
card(412.0, 419.1, 'G8 portland', 'OUT', 'MAY 2019', ['PORTLAND AIRPORT:', 'A DIFFERENT, OLDER MAN']);
clip(419.1, 423.8, 'LATE', {}, () => [H.date(419.6, '23 DECEMBER 2018')]);
clip(423.8, 428.0, 'LATE'); clip(428.0, 431.5, 'LATE'); clip(431.5, 436.1, 'LATE');
clip(436.1, 442.5, 'LATE', {}, () => [H.date(436.6, '26 DECEMBER 2018')]);
card(442.5, 449.4, 'G13 inside', 'OUT', 'INSIDE THE CABIN', ['FIREWOOD, CANNED FOOD, BLANKETS', 'CLOTHES, GEAR, A PROPANE TANK']);
card(449.4, 457.3, 'G14 wood', 'OUT', 'NO NOTE', ['ONLY A PIECE OF WOOD:', '"FRANKINCENSE AROMA, DO NOT BURN"']);
clip(457.3, 464.6, 'LATE', {}, () => [H.date(457.8, '28 DECEMBER 2018')]);
clip(464.6, 470.8, 'LATE');
add(470.8, 479.2, 'G17 marsh', (i) => [...H.clip(i, 'CRV', take('LATE', 8.4), { mos: WM }), H.label(473.0, 'KEN MARSH', 'ALASKA STATE TROOPERS SPOKESMAN')]);
clip(479.2, 483.0, 'LATE'); clip(483.0, 486.5, 'LATE');
card(486.5, 495.0, 'G20 mercy', 'OUT', 'KUDRYN TO THE ANCHORAGE DAILY NEWS', ['"NEVER UNDERESTIMATE NATURE.', 'IT HAS ABSOLUTELY NO MERCY."']);
card(495.0, 501.5, 'G21 missing', 'OUT', 'ALASKA STATE TROOPERS', ['STILL LISTED AS MISSING', 'THE CASE IS STILL OPEN']);
add(501.5, 511.8, 'G22 charley', () => H.art('c05_charley', 504.5));
clip(511.8, 516.5, 'SUN2'); clip(516.5, 522.565, 'LAND2', {}, () => [H.dip(0, 40)]);

export default makeCase({
  id: 'lm_case05', num: 5, title: 'THE MAN ON THE PORCH, SEEN FROM THE AIR',
  plate: ['c05/plate.jpg', 'PHOTO: SHIRLEY BINN FROM BONSALL, SAN DIEGO / CC BY 2.0'],
  vo: [['vo/c05_p01.wav', 6.0], ['vo/c05_p02.wav', 194.17], ['vo/c05_p03.wav', 241.68], ['vo/c05_p04.wav', 283.61], ['vo/c05_p05.wav', 309.535], ['vo/c05_p06.wav', 334.22], ['vo/c05_p07.wav', 370.055]],
  raws: [R([168.67, 193.67], 120, true, CR), R([216.18, 241.18], 204, true), R([258.11, 283.11], 270), R([297.035, 309.035], 348), R([327.72, 333.72], 369), R([345.555, 369.555], 406, true)],
  shots: SH, end: 522.565,
});
