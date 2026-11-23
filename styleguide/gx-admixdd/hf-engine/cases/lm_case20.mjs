// lm_case20 - "Toyota World Runners' last upload" (Vancouver Island + Trout Lake BC). Source TWR = Toyota World Runners YouTube film (59 min, 1920x1080).
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c20.md
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, MED } from './lm_lib.mjs';

const CR = 'FOOTAGE: TOYOTA WORLD RUNNERS';
const MAPCR = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
// Commons photos: filled in by the builder after `commons_search.py get`; if the file is missing the shot falls back to footage
const PH = {
  purcell: ['c20/purcell.jpg', ''], kaslo: ['c20/kaslo.jpg', ''], nakusp: ['c20/nakusp.jpg', ''], fj40: ['c20/fj40.jpg', ''], chinook: ['c20/chinook.jpg', ''], plate: ['c20/plate.jpg', ''],
};
try { Object.assign(PH, JSON.parse(fs.readFileSync(path.join(MED, 'c20', 'credits.json'), 'utf8'))); } catch { /* none yet */ }
const have = (k) => PH[k][1] && fs.existsSync(path.join(MED, PH[k][0]));

// b-roll pools (TWR source seconds). Raw cue windows 2101-2160 and the end card from 3443 are never used; QR segment near 1200 avoided; no faces.
const BLUE = [3180, 3300, 2940, 3060, 3120, 2880, 3000, 3360, 1380, 1320, 1260, 540, 660, 1140, 480, 2700];
const ROCK = [5, 125, 245, 305, 365, 605, 785, 845, 905, 965, 1085, 1445, 2405, 2525, 2585, 2645, 2765, 2825, 1745, 1865, 1925, 1985, 2160 + 5, 1040];
let bi = 0, ri = 0;
const nb = () => { const t = (bi < BLUE.length ? BLUE[bi] : BLUE[bi % BLUE.length] + 22) - 1; bi++; return t; };
const nr = () => { const t = (ri < ROCK.length ? ROCK[ri] : ROCK[ri % ROCK.length] + 22) - 1; ri++; return t; };

const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
let kc = 0;
const clipT = (a, b, name, t, o = {}, extra = () => []) => { kc++; add(a, b, name, (i) => [...H.clip(i, 'TWR', t, { credit: kc % 7 === 1 ? CR : undefined, ...o }), ...extra()]); };
const blue = (a, b, name, o, extra) => clipT(a, b, name, nb(), o, extra);
const rock = (a, b, name, o, extra) => clipT(a, b, name, nr(), o, extra);
const card = (a, b, name, kick, lines, pool = nr) => { const t = pool(); add(a, b, name, (i) => H.card(a + 0.3, H.bgV(i, 'TWR', t), kick, lines)); };
const photo = (a, b, name, key, o = {}, extra = () => [], fb = nr) => {
  if (have(key)) add(a, b, name, (i) => [...H.photo(i, PH[key][0], PH[key][1], o), ...extra()]);
  else { const t = fb(); add(a, b, name, (i) => [...H.clip(i, 'TWR', t, {}), ...extra()]); }
};

// ---- A: 5.5 - 113.735 (VO p01)
blue(5.5, 12.0, 'A01 blue pickup', {}, () => [H.place(9.7, 'VANCOUVER ISLAND', 'BRITISH COLUMBIA')]);
blue(12.0, 16.4, 'A02 cb radio');
blue(16.4, 22.1, 'A03 posted', {}, () => [H.date(19.4, '1 AUGUST 2025')]);
card(22.1, 27.9, 'A04 2020', 'IN 2020', ['TOYOTA WORLD RUNNERS', 'OVERLAND JOURNEYS IN OLD TOYOTAS']);
clipT(27.9, 31.2, 'A05 old toyotas', 244);
add(31.2, 35.2, 'A06 map nanaimo', (i) => H.map(i, 'c20/map_nanaimo.jpg', MAPCR, [{ x: 1047, y: 638, label: 'NANAIMO', at: 31.8 }, { x: 858, y: 451, label: 'LANTZVILLE', at: 33.5 }]));
photo(35.2, 39.4, 'A07 fj40', 'fj40', {}, () => [], () => 304);
photo(39.4, 42.4, 'A08 chinook', 'chinook', {}, () => [], () => 1744);
card(42.4, 46.6, 'A09 100 days', 'THE CHINOOK', ['WORLD\'S FIRST LAND CRUISER CHINOOK', 'BUILT IN 100 DAYS']);
add(46.6, 53.2, 'A10 map americas', (i) => H.map(i, 'c20/map_americas.jpg', MAPCR, [{ x: 693, y: 243, label: 'VANCOUVER ISLAND', at: 47.6 }, { x: 1040, y: 803, label: 'ARGENTINA', at: 49.6 }]));
card(53.2, 58.6, 'A11 greatest', '17 MONTHS, 17 COUNTRIES', ['THE GREATEST ROAD TRIP ON EARTH', 'POSTED 20 DECEMBER 2024']);
blue(58.6, 62.2, 'A12 views', {}, () => [H.date(58.9, '2.3 MILLION VIEWS')]);
rock(62.2, 65.8, 'A13 build', {}, () => [H.date(62.8, 'SEPTEMBER 2024')]);
rock(65.8, 69.2, 'A14 build views', {}, () => [H.date(66.2, '3.5 MILLION VIEWS')]);
card(69.2, 73.5, 'A15 subs', 'SUMMER 2025', ['200,000 SUBSCRIBERS']);
blue(73.5, 77.0, 'A16 today', {}, () => [H.date(73.9, 'ABOUT 238,000 TODAY')]);
rock(77.0, 81.3, 'A17 home again');
card(81.3, 86.0, 'A18 rust', 'THEIR WORDS', ['"THE 50 YEARS OF RUST HIDING', 'UNDER THE SURFACE"']);
rock(86.0, 89.8, 'A19 fourth episode', {}, () => [H.date(87.5, '25 JULY 2025')]);
blue(89.8, 93.6, 'A20 last upload');
rock(93.6, 97.3, 'A21 west coast', {}, () => [H.place(94.6, 'WEST COAST', 'VANCOUVER ISLAND')]);
card(97.3, 103.9, 'A22 opening line', 'THE FILM OPENS', ['"WE\'RE OUT HERE ON THE WEST COAST', 'OF VANCOUVER ISLAND, PUTTING OUR TRUCKS', 'THROUGH THE ULTIMATE STRESS TEST"']);
clipT(103.9, 109.5, 'A23 nate tacoma', 1864, {}, () => [H.label(104.5, 'DIRT LIFESTYLE NATE', 'FELLOW CREATOR')]);
rock(109.5, 113.735, 'A24 tip to tip');

// ---- B: 117.735 - 135.145 (VO p02)
rock(117.735, 122.2, 'B01 rock crawling');
clipT(122.2, 126.6, 'B02 gold panning river', 1984);
clipT(126.6, 131.0, 'B03 beach camps', 2164);
blue(131.0, 135.145, 'B04 back on the road');

// ---- C: 150.145 - 181.16 (VO p03)
card(150.145, 157.0, 'C01 twenty seconds', 'MATTHEW, TO NATE ON THE RADIO', ['"WHAT\'S BEEN 20 SECONDS FOR THE VIEWERS', 'HAS BEEN TWO WEEKS FOR US"']);
blue(157.0, 161.2, 'C02 chatting');
blue(161.2, 166.4, 'C03 go matt');
blue(166.4, 170.9, 'C04 last climb');
card(170.9, 174.4, 'C05 closing 1', 'THE CLOSING WORDS', ['"IT WASN\'T PERFECT,', 'BUT IT SURE WAS FULFILLING."']);
card(174.4, 181.16, 'C06 closing 2', 'THE CLOSING WORDS', ['"THIS WON\'T BE THE LAST TIME YOU SEE', 'THESE TWO TRUCKS TOGETHER."']);

// ---- D: 199.16 - 204.49 (VO p04)
clipT(199.16, 204.49, 'D01 beach camp', 2224);

// ---- E: 212.49 - 370.77 (VO p05)
clipT(212.49, 218.4, 'E01 evening road', 1551, {}, () => [H.date(215.0, 'THURSDAY, 7 AUGUST 2025')]);
card(218.4, 222.0, 'E02 ages', '7 AUGUST 2025', ['MATTHEW YEOMANS, 32', 'STACEY TOUROUT, 30']);
add(222.0, 227.4, 'E03 map trout lake', (i) => H.map(i, 'c20/map_trout.jpg', MAPCR, [{ x: 905, y: 454, label: 'TROUT LAKE', sub: 'BRITISH COLUMBIA', at: 223.4 }]));
photo(227.4, 232.8, 'E04 purcell', 'purcell', {}, () => [H.place(228.0, 'PURCELL MOUNTAINS', 'WEST KOOTENAY')], () => nr());
card(232.8, 239.0, 'E05 instagram', '31 JULY 2025', ['LAST INSTAGRAM POST', 'SEVEN DAYS BEFORE']);
blue(239.0, 243.6, 'E06 youtube six days', {}, () => [H.date(240.4, '1 AUGUST 2025')]);
rock(243.6, 247.6, 'E07 rig');
card(247.6, 254.6, 'E08 jennings-bates', 'MARK JENNINGS-BATES, SEARCH AND RESCUE MANAGER', ['"A CHALLENGING DRIVE"', 'AT ABOUT 7,000 FEET']);
rock(254.6, 258.6, 'E09 beyond control');
rock(258.6, 262.9, 'E10 rcmp rolled');
card(262.9, 267.3, 'E11 distance', 'THE DISTANCE', ['REPORTS DO NOT AGREE.', 'IT IS LEFT OUT HERE.']);
clipT(267.3, 272.0, 'E12 nothing filmed', 1558.5);
rock(272.0, 275.0, 'E13 911');
photo(275.0, 281.4, 'E14 kaslo', 'kaslo', {}, () => [H.place(276.4, 'KASLO', 'KOOTENAY LAKE')], () => nr());
rock(281.4, 287.6, 'E15 teams struggle');
card(287.6, 291.7, 'E16 wildfires', 'AUGUST 2025', ['WILDFIRES BURNING', 'IN THE REGION']);
photo(291.7, 296.0, 'E17 nakusp', 'nakusp', {}, () => [H.place(292.4, 'NAKUSP', 'ARROW LAKES')], () => nr());
clipT(296.0, 300.6, 'E18 daylight', 1564.5);
card(300.6, 305.2, 'E19 complexity', 'KASLO SEARCH AND RESCUE', ['"THE REMOTE ACCESS, HIGH ALTITUDE,', 'AND LIMITED DAYLIGHT ALL ADDED COMPLEXITY"']);
rock(305.2, 309.2, 'E20 scene');
add(309.2, 315.6, 'E21 map region', (i) => H.map(i, 'c20/map_region.jpg', MAPCR, [{ x: 778, y: 460, label: 'NAKUSP', sub: 'ARROW LAKES HOSPITAL', at: 310.2 }, { x: 1102, y: 645, label: 'KASLO', at: 312.6 }]));
rock(315.6, 319.2, 'E22 counselling');
card(319.2, 322.9, 'E23 rcmp', 'RCMP', ['ACKNOWLEDGED THE CRASH', 'NEARLY A WEEK LATER']);
rock(322.9, 329.5, 'E24 story till now');
card(329.5, 336.0, 'E25 colleen 1', 'STACEY\'S MOTHER, COLLEEN, FOR BOTH FAMILIES', ['"WITH UNIMAGINABLE HEARTACHE, THE FAMILIES', 'OF MATTHEW PETER YEOMANS AND', 'STACEY TOUROUT WOULD LIKE TO ADVISE"']);
card(336.0, 343.0, 'E26 colleen 2', 'STACEY\'S MOTHER, COLLEEN', ['"...THAT WE LOST THEM BOTH TRAGICALLY."', '"THEY ARE TOGETHER FOREVER."']);
rock(343.0, 348.2, 'E27 plaque', {}, () => [H.date(343.8, '30 AUGUST 2025')]);
card(348.2, 352.4, 'E28 mountain took', 'THE PLAQUE', ['"THE MOUNTAIN TOOK THE LIVES', 'OF MATTHEW AND STACEY"']);
rock(352.4, 356.6, 'E29 video of that day', {}, () => [H.date(352.9, '8 SEPTEMBER 2025')]);
card(356.6, 361.0, 'E30 title', 'THE VIDEO', ['"WHEN THE MOUNTAIN CALLS"']);
rock(361.0, 364.8, 'E31 january', {}, () => [H.date(361.4, 'JANUARY 2026')]);
add(364.8, 370.77, 'E32 coroners', (i) => [...H.card(365.1, H.bgV(i, 'TWR', nr()), 'BC CORONERS SERVICE', ['INVESTIGATING', 'NO FINDINGS PUBLISHED']), H.dip(0, 40)]);

// raw 1 blur (source px; keys = source seconds): bystanders + driver at the pump (plates are tiny at this size, covered by the truck boxes)
const MOS1 = [
  { keys: [[2101.0, 1750, 340, 160, 400], [2102.5, 1750, 340, 160, 400], [2103.0, 1200, 470, 150, 210], [2105.0, 1150, 530, 150, 200]] },
  { keys: [[2101.0, 960, 340, 220, 340], [2102.5, 960, 340, 220, 340], [2103.0, 860, 630, 180, 220], [2105.0, 820, 630, 180, 220]] },
];
const RAW = (a, b, t, o = {}) => ({ tag: 'TWR', a, b, t, mute: true, ...o });

export default makeCase({
  id: 'lm_case20', num: 20, title: 'TOYOTA WORLD RUNNERS\' LAST UPLOAD',
  plate: have('plate') ? PH.plate : ['c20/map_region.jpg', MAPCR],
  vo: [['vo/c20_p01.wav', 6.0], ['vo/c20_p02.wav', 118.235], ['vo/c20_p03.wav', 150.645], ['vo/c20_p04.wav', 199.66], ['vo/c20_p05.wav', 212.99]],
  raws: [RAW(113.735, 117.735, 2101, { credit: CR, mos: MOS1 }), RAW(135.145, 150.145, 2116), RAW(181.16, 199.16, 2131), RAW(204.49, 212.49, 2152)],
  shots: SH, end: 370.77,
});
