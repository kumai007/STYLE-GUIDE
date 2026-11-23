// lm_case18 - "Antti Pendikainen's last upload" (Finland). Source ANTTI = his own jet-ski upload (YouTube vSwxXPKV0jA), 114.8 s, conformed 60 fps.
// ANTTI window map (src s): raws 0-12, 13-34, 54-74, 81-106. FORBIDDEN 106+ (his end title). Free b-roll: 34-54, 74-81, 12-13. Freezes may use any frame < 106.
// Notes: productions/last-moments/edit/notes/c18.md. Photos fall back to EOX maps / cards when a file is missing (has()).
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, n, MED } from './lm_lib.mjs';

const EOX = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const has = (f) => fs.existsSync(path.join(MED, 'c18', f));
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
const clip = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.clip(i, 'ANTTI', t, o), ...extra()]);
const frz = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.frz(i, 'ANTTI', t, o), ...extra()]);
const photo = (a, b, name, src, credit, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, credit, o), ...extra()]);
const cardP = (a, b, name, src, kick, lines, credit) => add(a, b, name, (i) => H.card(a + 0.3, H.bgP(i, src), kick, lines, credit));
const cardV = (a, b, name, t, kick, lines) => add(a, b, name, (i) => H.card(a + 0.3, H.bgV(i, 'ANTTI', t), kick, lines));
const map = (a, b, name, src, pins = [], extra = () => []) => add(a, b, name, (i) => [...H.map(i, src, EOX, pins), ...extra()]);
const CR = JSON.parse(fs.existsSync(path.join(MED, 'c18', 'credits.json')) ? fs.readFileSync(path.join(MED, 'c18', 'credits.json'), 'utf8') : '{}');
const pc = (k) => CR[k] || 'PHOTO: WIKIMEDIA COMMONS';
// photo with fallback: ph(a,b,name,key,photoOpts,extra, fallbackFn)
const ph = (a, b, name, key, o, extra, fb) => (has(key + '.jpg') ? photo(a, b, name, 'c18/' + key + '.jpg', pc(key), o, extra) : fb());

// ---- A: p01 (5.5 - 82.74)
frz(5.5, 10.0, 'A01 drone straight down', 11.0);
clip(10.0, 14.08, 'A02 river pine forest', 36);
clip(14.08, 17.54, 'A03 white line', 41);
frz(17.54, 21.9, 'A04 orange jacket', 17.5);
frz(21.9, 25.5, 'A05 posted', 21.0, {}, () => [H.date(22.2, '18 MAY 2019')]);
cardV(25.5, 29.42, 'A06 eight days later', 80, 'EIGHT DAYS LATER', ['A MOTORBIKE RACE']);
ph(29.42, 35.72, 'A07 nilsia', 'nilsia', { bri: 0.9 }, () => [H.place(29.8, 'NILSIÄ', 'EASTERN FINLAND'), H.date(32.8, 'BORN 1990')],
  () => map(29.42, 35.72, 'A07 nilsia', 'c18/map_nilsia.jpg', [{ x: 960, y: 540, label: 'NILSIÄ', sub: 'EASTERN FINLAND', at: 29.8 }], () => [H.date(32.8, 'BORN 1990')]));
cardV(35.72, 40.16, 'A08 career of stunts', 53, 'BY HIS MID-TWENTIES', ['A CAREER OF STUNTS']);
ph(40.16, 47.0, 'A09 hyvinkaa', 'hyv', { bri: 0.9 }, () => [H.date(40.5, 'JULY 2015'), H.place(44.0, 'HYVINKÄÄ', 'ABOUT 4 KM UP')],
  () => map(40.16, 47.0, 'A09 hyvinkaa', 'c18/map_hyv.jpg', [{ x: 960, y: 540, label: 'HYVINKÄÄ', sub: 'SOUTHERN FINLAND', at: 44.0 }], () => [H.date(40.5, 'JULY 2015')]));
ph(47.0, 53.86, 'A10 balloon skydiver', 'balloon', { bri: 0.9 }, () => [],
  () => cardV(47.0, 53.86, 'A10 balloon skydiver', 37, 'NO PARACHUTE', ['A SKYDIVER WHO HAD ONE', 'CAUGHT HIM IN FREE FALL']));
cardV(53.86, 58.7, 'A11 mtv', 45, 'MTV UUTISET REPORTED', ['SPECIAL EQUIPMENT BUILT FOR IT']);
ph(58.7, 61.7, 'A12 tunnel', 'tunnel', { bri: 0.9 }, () => [],
  () => cardV(58.7, 61.7, 'A12 tunnel', 49, 'WIND-TUNNEL TRAINING', ['MATCHED FALL SPEEDS']));
cardV(61.7, 68.2, 'A13 views', 39, 'SKYDIVING WITHOUT PARACHUTE', ['HIS OWN UPLOAD', 'ABOUT 43.7 MILLION VIEWS']);
cardV(68.2, 71.8, 'A14 quote1', 46, 'TO THE BROADCASTER', ['"I WANTED TO DO SOMETHING', 'MANY HAVEN\'T DONE"']);
cardV(71.8, 75.4, 'A15 quote2', 52, 'AND THEN', ['"I COULD DO THE SAME TOMORROW"']);
frz(75.4, 79.6, 'A16 dark river', 37.0);
frz(79.6, 82.74, 'A17 title cards', 7.0);

// ---- B: p02 (94.74 - 116.75)
map(94.74, 99.2, 'B01 finland', 'c18/map_fi.jpg', [], () => [H.place(97.6, 'FINLAND', 'LOCATION UNKNOWN')]);
frz(99.2, 103.5, 'B02 once in a year', 4.0);
cardV(103.5, 108.6, 'B03 description', 42, 'HIS DESCRIPTION', ['"ONCE IN A YEAR THIS RIVER', 'GETS FLOODED SO BAD THAT IT', 'IS POSSIBLE TO RIDE IT', 'WITH A JET SKI."']);
frz(108.6, 113.2, 'B04 handlebars', 12.5);
frz(113.2, 116.75, 'B05 chase birches', 14.8);

// ---- C: p03 (137.75 - 173.395)
cardV(137.75, 143.0, 'C01 2016', 21, '2016', ['WITH HIS STUNT PARTNER', 'SAKU LEHTINEN']);
ph(143.0, 149.5, 'C02 torni', 'torni', { bri: 0.9 }, () => [H.place(145.3, 'TORNI HOTEL', 'TAMPERE · 88 METRES')],
  () => map(143.0, 149.5, 'C02 torni', 'c18/map_tam.jpg', [{ x: 960, y: 540, label: 'TORNI HOTEL', sub: 'TAMPERE · 88 METRES', at: 145.3 }]));
cardV(149.5, 153.4, 'C03 cliff', 56, 'A MOTOCROSS BIKE OFF A CLIFF', ['ABOUT 40 METRES']);
cardV(153.4, 158.3, 'C04 channel', 65, 'ON HIS CHANNEL', ['A SNOWMOBILE BASE JUMP', 'A SKI BASE JUMP', 'PULLED BY A SNOWMOBILE']);
cardV(158.3, 162.5, 'C05 balloons', 60, 'FIRST DATE UNDER 50 BALLOONS', ['ALSO ON HIS CHANNEL']);
cardV(162.5, 166.9, 'C06 subs', 63, 'SUBSCRIBERS', ['85,000 WHILE HE WAS ALIVE', 'TODAY CLOSE TO 90,000']);
clip(166.9, 173.395, 'C07 handlebar again', 47);

// ---- D: p04 (193.395 - 213.74)
map(193.395, 198.5, 'D01 2013', 'c18/map_fi.jpg', [{ x: 950, y: 628, label: 'VESIVEHMAA', sub: 'ASIKKALA', at: 196.9 }], () => [H.date(193.8, '2013')]);
ph(198.5, 203.3, 'D02 vesivehmaa', 'ves', { bri: 0.9 }, () => [H.place(198.9, 'VESIVEHMAA', 'ASIKKALA, SOUTHERN FINLAND')],
  () => map(198.5, 203.3, 'D02 vesivehmaa', 'c18/map_ves.jpg', [{ x: 960, y: 540, label: 'VESIVEHMAA', sub: 'ASIKKALA', at: 198.9 }]));
cardV(203.3, 209.6, 'D03 lehtinen quote', 70, 'SAKU LEHTINEN TO MTV UUTISET', ['"ANALYSING AND MINIMISING RISK', 'WAS A BIG PART OF EVERY SINGLE', 'THING ANTTI DID."']);
clip(209.6, 213.74, 'D04 bridge', 74);

// ---- E: p05 (238.74 - 334.795)
cardV(238.74, 244.0, 'E01 sunday', 80, 'SUNDAY 26 MAY 2019', ['EIGHT DAYS AFTER THE UPLOAD']);
ph(244.0, 251.0, 'E02 vesivehmaa race', 'enduro', { bri: 0.9 }, () => [H.place(244.4, 'VESIVEHMAA', 'FIM CROSS COUNTRY EUROPEAN CUP')],
  () => cardV(244.0, 251.0, 'E02 vesivehmaa race', 44.5, 'FIM CROSS COUNTRY EUROPEAN CUP', ['ROUND ONE', 'BACK AT VESIVEHMAA']));
cardV(251.0, 257.5, 'E03 three hours', 48, 'THREE HOURS OFF-ROAD', ['ON FOREST TRACKS']);
cardV(257.5, 262.0, 'E04 not national', 51, 'NOT A NATIONAL RACE', ['ROUND ONE OF AN', 'INTERNATIONAL SERIES', 'RUN UNDER FIM EUROPE']);
frz(262.0, 268.2, 'E05 forest', 103.0);
cardV(268.2, 272.4, 'E06 sml', 81, 'FINNISH MOTORCYCLE FEDERATION', ['SUOMEN MOOTTORILIITTO']);
cardV(272.4, 276.1, 'E07 confirmed', 82, 'CONFIRMED IT WAS HIM', ['THE RACE WEEKEND WAS STOPPED']);
cardV(276.1, 280.2, 'E08 commission', 83, 'THE ORGANISER', ['SET UP AN INVESTIGATION', 'COMMISSION']);
cardV(280.2, 284.0, 'E09 no fault', 41, 'NO TECHNICAL FAULT', ['WITH THE MOTORBIKE', 'NO CRIMINAL CASE']);
cardV(284.0, 290.3, 'E10 fim europe', 43, 'FIM EUROPE STATEMENT', ['MARTIN DE GRAAFF', 'ACTING PRESIDENT']);
cardV(290.3, 293.6, 'E11 unfair', 46.5, 'MARTIN DE GRAAFF, FIM EUROPE', ['"IT\'S UNFAIR TO HAVE LOST', 'PENDIKAINEN IN FATAL ACCIDENT"']);
cardV(293.6, 299.6, 'E12 dream', 50, 'SAKU LEHTINEN TO MTV UUTISET', ['"ANTTI LIVED PRETTY MUCH', 'HIS DREAM"']);
cardV(299.6, 305.0, 'E13 birth year', 36, 'ONLY HIS BIRTH YEAR IS REPORTED', ['1990', 'SO HE WAS 28 OR 29']);
frz(305.0, 311.0, 'E14 memorial', 44.0, {}, () => [H.date(305.4, '23 JUNE 2019')]);
cardV(311.0, 316.0, 'E15 opens', 38, 'THE MEMORIAL VIDEO OPENS', ['"IF YOU DO WHAT YOU LOVE,', 'YOU HAVE ALREADY WON."']);
cardV(316.0, 321.5, 'E16 cliff quote', 45, 'AFTER THE CLIFF JUMP', ['"NO ONE HAS EVER DONE THAT', 'OR EVER WILL."']);
cardV(321.5, 327.0, 'E17 last on channel', 42.5, 'THE MEMORIAL IS THE LAST VIDEO ON THE CHANNEL', ['NO FOOTAGE OF THE CRASH', 'HAS EVER BEEN MADE PUBLIC']);
frz(327.0, 331.0, 'E18 jet ski', 25.0);
frz(331.0, 334.795, 'E19 last upload', 43.0);

export default makeCase({
  id: 'lm_case18', num: 18, title: "ANTTI PENDIKAINEN'S LAST UPLOAD",
  plate: has('flood.jpg') ? ['c18/flood.jpg', pc('flood')] : ['c18/plate.jpg', 'FOOTAGE: ANTTI PENDIKAINEN (YOUTUBE)'],
  vo: [["vo/c18_p01.wav", 6.0], ["vo/c18_p02.wav", 95.24], ["vo/c18_p03.wav", 138.25], ["vo/c18_p04.wav", 193.895], ["vo/c18_p05.wav", 239.24]],
  raws: [{"tag": "ANTTI", "a": 82.74, "b": 94.74, "t": 0.0, "mute": true, "credit": "FOOTAGE: ANTTI PENDIKAINEN (YOUTUBE)"}, {"tag": "ANTTI", "a": 116.75, "b": 137.75, "t": 13.0, "mute": true}, {"tag": "ANTTI", "a": 173.395, "b": 193.395, "t": 54.0, "mute": true}, {"tag": "ANTTI", "a": 213.74, "b": 238.74, "t": 81.0, "mute": true}],
  shots: SH, end: 334.795,
});
