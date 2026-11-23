// lm_case08 - "Storm De Beul's last video" (Swedish Lapland). STRM = his own upload, no speech. Table-driven via lm_lib.
// Times below were taken from skeleton v1 (OLD starts); A(k,t) shifts them if the cut narration changes the VO starts.
import fs from 'node:fs';
import { makeCase, H } from './lm_lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c08.json', import.meta.url), 'utf8'));
const OLD = [6.0, 136.07, 173.44, 204.05, 241.72, 270.645, 314.08];
const A = (k, t) => +(t + (S.vo[k][1] - OLD[k])).toFixed(3);
const CR = { map: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', strm: 'FOOTAGE: STORM OUTDOORSY (STORM DE BEUL)' };
const RAWS = S.raws.map((r) => ({ ...r, credit: CR.strm }));
// seg(gapStart, gapEnd, k, [[absTime(of VO k, skeleton v1), name, fn], ...]) ; first shot starts at the gap start
const seg = (g0, g1, k, items) => items.map(([t, name, fn], j) => [j ? A(k, t) : g0, j + 1 < items.length ? A(k, items[j + 1][0]) : g1, name, fn]);
const g = (j) => [j ? S.raws[j - 1].b : 5.5, j < S.raws.length ? S.raws[j].a : S.end];
const bgv = (i, t, bri) => H.bgV(i, 'STRM', t, bri);
const card = (t, i, bt, kick, lines, bri) => H.card(t, bgv(i, bt, bri), kick, lines);
const T = (k, t) => A(k, t);

const shots = [
  ...seg(...g(0), 0, [
    [6.0, 'S01 walk in', (i) => H.clip(i, 'STRM', 15, { credit: CR.strm })],
    [11.66, 'S02 pines close', (i) => H.clip(i, 'STRM', 25, {})],
    [16.87, 'S03 upload date', (i) => card(T(0, 17.1), i, 50, 'UPLOADED', ['WEDNESDAY 23 OCTOBER 2024'], 0.5)],
    [20.97, 'S04 last thing', (i) => H.clip(i, 'STRM', 50, {})],
    [24.18, 'S05 flanders', (i) => H.map(i, 'c08/map_flanders.jpg', CR.map, [{ x: 960, y: 560, label: 'GERAARDSBERGEN', sub: 'FLANDERS · BELGIUM', size: 34, at: T(0, 24.5) }])],
    [28.17, 'S06 town print', (i) => H.photo(i, 'c08/geraardsbergen_print.jpg', 'LITHOGRAPH: DE PEELLAERT / PUBLIC DOMAIN', { bri: 0.8 })],
    [34.25, 'S07 north', (i) => H.photo(i, 'c08/map_sweden.jpg', CR.map, {})],
    [39.45, 'S08 sweden bike', (i) => H.photo(i, 'c08/muddus_bark.jpg', 'PHOTO: LAPONIATJUOTTJUDUS (LAPONIA MANAGEMENT) / CC BY-SA 4.0', { over: [H.place(T(0, 39.8), 'SWEDEN', 'ABOUT 6,000 KM BY BIKE')] })],
    [43.02, 'S09 dad quote', (i) => card(T(0, 43.3), i, 104, 'TO HIS FATHER', ['"IT TOOK ME A LONG TIME', 'TO KNOW WHAT I WANTED."'])],
    [47.98, 'S10 grandma', (i) => H.clip(i, 'STRM', 137, {})],
    [51.95, 'S11 few people', (i) => card(T(0, 52.2), i, 232, 'TO HIS GRANDMOTHER', ['"VERY FEW PEOPLE', 'AND A LOT OF NATURE."'])],
    [56.6, 'S12 channel', (i) => H.clip(i, 'STRM', 8, { over: [H.date(T(0, 57), 'STORM OUTDOORSY · 3 AUGUST 2024')] })],
    [60.78, 'S13 never spoke', (i) => H.clip(i, 'STRM', 96, {})],
    [67.06, 'S14 wind fire', (i) => H.clip(i, 'STRM', 250, {})],
    [72.33, 'S15 jack london', (i) => card(T(0, 72.6), i, 283, 'CHANNEL PAGE', ["READING JACK LONDON'S", 'STORIES OF THE NORTH'])],
    [75.85, 'S16 short trips', (i) => H.clip(i, 'STRM', 124, {})],
    [79.99, 'S17 no shelter', (i) => H.clip(i, 'STRM', 516, {})],
    [85.86, 'S18 fourteen', (i) => H.clip(i, 'STRM', 288, {})],
    [90.2, 'S19 titles', (i) => card(T(0, 90.5), i, 72, '14 VIDEOS', ['"2 DAYS BACKPACKING IN THE', 'DARK FOREST OF MUDDUS"'], 0.5)],
    [95.11, 'S20 fourteenth', (i) => card(T(0, 95.4), i, 300, 'VIDEO 14', ['"CAMPING IN THE FOREST', '- NO SHELTER"'])],
    [98.72, 'S21 asmr', (i) => H.clip(i, 'STRM', 304, {})],
    [102.7, 'S22 potatoes', (i) => H.clip(i, 'STRM', 366, {})],
    [107.03, 'S23 ice', (i) => H.clip(i, 'STRM', 0, {})],
    [111.59, 'S24 tilt up', (i) => H.clip(i, 'STRM', 38, {})],
  ]),
  ...seg(...g(1), 1, [
    [136.07, 'S25 stones', (i) => H.clip(i, 'STRM', 145, {})],
    [140.95, 'S26 runtime', (i) => card(T(1, 141.2), i, 108, 'RUNTIME 10:51', ['NOT ONE SPOKEN WORD'], 0.5)],
  ]),
  ...seg(...g(2), 2, [
    [173.44, 'S27 no tarp', (i) => H.clip(i, 'STRM', 218, {})],
    [177.61, 'S28 potatoes coals', (i) => H.clip(i, 'STRM', 380, {})],
  ]),
  ...seg(...g(3), 3, [
    [204.05, 'S29 long way', (i) => H.clip(i, 'STRM', 132, {})],
    [207.39, 'S30 few people', (i) => H.photo(i, 'c08/muddus_path.jpg', 'PHOTO: LAPONIATJUOTTJUDUS (LAPONIA MANAGEMENT) / CC BY-SA 4.0', {})],
    [210.73, 'S31 dark', (i) => H.clip(i, 'STRM', 401, { bri: 1.15 })],
  ]),
  ...seg(...g(4), 4, [
    [241.72, 'S32 rain', (i) => H.clip(i, 'STRM', 455, { bri: 1.25 })],
    [246.97, 'S33 grey morning', (i) => H.clip(i, 'STRM', 497, {})],
  ]),
  ...seg(...g(5), 5, [
    [270.77, 'S34 packs up', (i) => H.clip(i, 'STRM', 592, {})],
    [276.87, 'S35 just walks', (i) => H.clip(i, 'STRM', 599, {})],
  ]),
  ...seg(...g(6), 6, [
    [314.08, 'S36 jokkmokk', (i) => H.map(i, 'c08/map_jokkmokk.jpg', CR.map, [{ x: 960, y: 560, label: 'JOKKMOKK', sub: 'SWEDISH LAPLAND', at: T(6, 314.6) }])],
    [319.46, 'S37 14 km', (i) => H.photo(i, 'c08/jok_winter.jpg', 'PHOTO: ARJOOPY / CC BY-SA 4.0', { over: [H.date(T(6, 322.2), 'NIGHT OF 29 OCTOBER 2024')] })],
    [325.32, 'S38 wind', (i) => card(T(6, 325.6), i, 410, 'WIND', ['ABOUT 120 KM/H'])],
    [328.66, 'S39 air', (i) => card(T(6, 329), i, 455, 'AIR', ['-6 C', 'FELT COLDER THAN -18 C'])],
    [334.36, 'S40 gusts', (i) => H.photo(i, 'c08/muddus_winter.jpg', 'PHOTO: JONBITT / CC0', { bri: 0.8 })],
    [340.5, 'S41 never released', (i) => card(T(6, 340.8), i, 498, 'THAT VIDEO', ['HAS NEVER BEEN RELEASED'])],
    [344.52, 'S42 grandma text', (i) => card(T(6, 344.8), i, 500, 'TO HIS GRANDMOTHER', ['"IT\'S SNOWING HEAVILY HERE.', 'BUT DON\'T WORRY, I\'LL SURVIVE."'])],
    [351.03, 'S43 sos date', (i) => H.photo(i, 'c08/jok_storgatan.jpg', 'PHOTO: MIKAPR65 / CC BY-SA 4.0', { bri: 0.75, over: [H.date(T(6, 351.3), 'WEDNESDAY 30 OCTOBER')] })],
    [357.25, 'S44 sos', (i) => card(T(6, 357.5), i, 462, 'SOS ALARM', ['HE SAID HE WAS HURT', 'AND ASKED FOR HELP'], 0.7)],
    [363.07, 'S45 silent', (i) => H.clip(i, 'STRM', 448, { bri: 1.25 })],
    [367.9, 'S46 aw139', (i) => H.photo(i, 'c08/aw139.jpg', 'PHOTO: NIELS JOHANNES / CC BY-SA 4.0', { over: [H.place(T(6, 368.3), 'AW139', 'CANNOT FLY ABOVE ABOUT 93 KM/H')] })],
    [374.61, 'S47 no visibility', (i) => card(T(6, 374.9), i, 500, 'ON THE GROUND', ['VISIBILITY NEARLY ZERO'])],
    [380.67, 'S48 takeoff', (i) => H.clip(i, 'STRM', 508, {})],
    [384.23, 'S49 found', (i) => card(T(6, 384.5), i, 498, '10:45', ['THE CREW FINDS HIM', 'ABOUT 2 KM FROM HIS CAMP'])],
    [388.67, 'S50 shelter', (i) => H.clip(i, 'STRM', 560, {})],
    [394.13, 'S51 papers', (i) => card(T(6, 394.4), i, 45, 'COVERAGE', ['BELGIUM · SWEDEN', 'GERMANY · CZECH REPUBLIC'], 0.5)],
    [399.29, 'S52 age 22', (i) => card(T(6, 399.6), i, 134, 'STORM DE BEUL, 22', ['HYPOTHERMIA', 'AN ACCIDENT, NO CHARGES'], 0.5)],
    [405.37, 'S53 camera', (i) => card(T(6, 405.7), i, 190, 'HIS CAMERA', ['STILL OUT IN THE SNOW'], 0.5)],
    [411.47, 'S54 no report', (i) => H.clip(i, 'STRM', 512, {})],
    [417.29, 'S55 parents', (i) => card(T(6, 417.6), i, 262, 'HIS PARENTS', ['KEPT THE CHANNEL ONLINE', 'AS A WARNING'])],
    [424.19, 'S56 views', (i) => card(T(6, 424.5), i, 513, 'HIS LAST VIDEO', ['316,000+ VIEWS'])],
  ]),
];
export default makeCase({ id: 'lm_case08', num: 8, title: S.name, plate: ['c08/muddus_park.jpg', 'PHOTO: JONOMORPH / CC BY-SA 4.0'], vo: S.vo, raws: RAWS, shots, end: S.end });
