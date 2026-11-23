// lm_case07 - case 7 "The booth at Woody's Tavern" (Moab, Utah; WDY). Table-driven with lm_lib.mjs. All times = PART seconds.
// Media in media/last-moments/c07 (Commons photos; credits in c07/credits.json), WDY usable window src 0:43-1:21 = the 4 raw cues.
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, MED } from './lm_lib.mjs';

const CR = JSON.parse(fs.readFileSync(path.join(MED, 'c07', 'credits.json'), 'utf8'));
const F = (k) => `c07/${k}.jpg`;
const FOOT = "FOOTAGE: WOODY'S TAVERN SECURITY FOOTAGE";
// photo shot: ph(a, b, name, key, [text fns], opts)
const ph = (a, b, name, key, extra = [], o = {}) => [a, b, name, (i) => [...H.photo(i, F(key), CR[key], o), ...extra.map((f) => f())]];
// text card on a blurred photo backdrop (backdrops cycle through the photo pool)
const BG = ['dg1', 'dg2', 'dg3', 'dg4', 'dg5', 'dg6', 'uranium', 'crossing', 'doubleo', 'viewpoint', 'hwy191', 'cold', 'dalton', 'hiser1', 'hiser2', 'hiser3', 'desert_dreams', 'sunset'];
let bgi = 0;
const card = (a, b, name, kick, lines, bg) => { const k = bg ?? BG[bgi++ % BG.length]; return [a, b, name, (i) => H.card(a + 0.2, H.bgP(i, F(k)), kick, lines, CR[k])]; };
const frz = (a, b, name, t, o = {}) => [a, b, name, (i) => H.frz(i, 'WDY', t, { credit: FOOT, ...o })];
const BOX62 = { x: 110, y: 905, w: 890, h: 130, rect: [94, 50, 1768, 994] };
const BOX78 = { x: 110, y: 890, w: 890, h: 105, rect: [94, 50, 1768, 994] };

const S = [
  // ---- intro: the footage first (freezes of the burned-in picture), then Moab
  frz(5.5, 12.0, 'S01 booth freeze', 70),
  frz(12.0, 16.3, 'S02 leaning in', 48),
  [16.3, 22.9, 'S03 clock stamp', (i) => H.stamp(16.6, 'WDY', 62, BOX62)],
  ph(22.9, 28.6, 'S04 Moab', 'main_street', [() => H.place(23.3, 'MOAB, UTAH', 'EASTERN UTAH')]),
  ph(28.6, 32.6, 'S05 married', 'cooper', [() => H.date(28.9, '20 APRIL 2021')]),
  ph(32.6, 37.0, 'S06 Kylen', 'jailhouse', [() => H.label(32.9, 'KYLEN SCHULTE', 'AGE 24 / BORN IN VAIL, COLORADO')]),
  ph(37.0, 41.9, 'S07 co-op', 'redrock', [() => H.place(37.4, 'MOONFLOWER COMMUNITY CO-OP', 'KYLEN WORKED HERE AS A CASHIER')]),
  ph(41.9, 46.0, 'S08 Crystal', 'zax', [() => H.label(42.2, 'CRYSTAL TURNER', 'ALSO CRYSTAL BECK / AGE 38 / BORN IN HOT SPRINGS, ARKANSAS')]),
  card(46.0, 49.5, 'S09 McDonalds', 'SHE WORKED AT', ["THE TOWN'S McDONALD'S"]),
  card(49.5, 52.7, 'S10 married four months', 'MARRIED 20 APRIL 2021', ['LESS THAN FOUR MONTHS', 'BEFORE THAT BAR']),
  card(52.7, 57.0, 'S11 van', 'THEIR HOME ON WHEELS', ['A VAN CONVERTED', 'INTO A CAMPER']),
  card(57.0, 63.4, 'S12 aunt', "KYLEN'S AUNT, BRIDGET CALVERT", ['THEY THOUGHT OF THE LAND', 'AROUND MOAB AS HOME']),
  ph(63.4, 69.8, 'S13 La Sal', 'aspens', [() => H.place(63.9, 'LA SAL MOUNTAINS', 'ABOVE MOAB')], { pos: '50% 50%' }),
  card(69.8, 74.0, 'S14 rabbit', "KYLEN'S PET RABBIT", ['RUTH']),
  ph(74.0, 78.6, 'S15 12 Aug', 'loop_road', [() => H.date(74.3, '12 AUGUST 2021')]),
  ph(78.6, 83.3, 'S16 creep', 'tuk'),
  card(83.3, 86.9, 'S17 weirdo', 'A FAMILY MEMBER LATER SAID', ['"A WEIRDO CAMPING NEAR THEM"', '"THAT WAS FREAKING THEM OUT"']),
  ph(86.9, 90.5, 'S18 mountains', 'mell'),
  card(90.5, 97.2, 'S19 come looking', 'ON THE 13TH THEY TOLD FRIENDS', ['"IF WE DON\'T SHOW UP FOR WORK,', 'COME LOOKING FOR US."']),
  ph(97.2, 103.3, 'S20 Woodys', 'beyond', [() => H.place(97.6, "WOODY'S TAVERN", 'MAIN STREET, MOAB')]),
  frz(103.3, 108.9, 'S21 footage starts', 66),
  ph(108.9, 114.1, 'S22 phone', 'payphone'),
  card(114.1, 118.2, 'S23 handed over', 'AUGUST 2021', ["WOODY'S GAVE THE FOOTAGE", 'TO POLICE AND REPORTERS']),
  frz(118.2, 121.8, 'S24 seen since', 53),
  frz(121.8, 125.75, 'S25 booth middle', 44),
  // ---- raw 1 125.75-138.75
  ph(138.75, 143.3, 'S26 nothing wrong', 'hiser1'),
  card(143.3, 147.0, 'S27 Kayla', 'FRIEND KAYLA BORZA', ['TOLD THE DAILY BEAST']),
  card(147.0, 152.4, 'S28 Kayla quote', 'KAYLA BORZA, THE DAILY BEAST', ['"ALL THEY SAID WAS THERE WAS A CREEP', 'STAYING NEXT TO THEM. AND THAT WAS IT."']),
  ph(152.4, 156.5, 'S29 aunt again', 'hiser2'),
  ph(156.5, 160.2, 'S30 back to camp', 'cold'),
  frz(160.2, 163.135, 'S31 clock ticking', 61),
  // ---- raw 2 163.135-170.135
  card(170.135, 175.0, 'S32 manager', 'THE BAR MANAGER THAT NIGHT', ['ARIELLE BECK']),
  card(175.0, 180.0, 'S33 CrimeOnline', 'ACCORDING TO CRIMEONLINE', ["SHE DIDN'T SEE THEM TALKING", 'TO ANYONE ELSE BEFORE THEY LEFT']),
  [180.0, 184.85, 'S34 stamp 19:02', (i) => H.stamp(180.3, 'WDY', 78, BOX78)],
  // ---- raw 3 184.85-190.85
  ph(190.85, 196.8, 'S35 three hours', 'hwy191', [() => H.place(191.2, 'ABOUT THREE HOURS', "WOODY'S TAVERN / LAST KNOWN SIGHTING")]),
  ph(196.8, 201.5, 'S36 strange crossing', 'hiser3'),
  ph(201.5, 205.2, 'S37 12 Aug', 'desert_dreams', [() => H.date(201.8, '12 AUGUST 2021')]),
  ph(205.2, 208.6, 'S38 co-op', 'north_main', [() => H.place(205.5, 'MOONFLOWER COMMUNITY CO-OP', 'MOAB')]),
  card(208.6, 212.0, 'S39 Petito stop', 'MOAB POLICE STOP', ['GABBY PETITO AND', 'BRIAN LAUNDRIE']),
  ph(212.0, 215.8, 'S40 seen around the world', 'crossing'),
  card(215.8, 222.5, 'S41 national news', 'A FEW WEEKS LATER', ["PETITO'S CASE BECOMES", 'NATIONAL NEWS']),
  card(222.5, 227.795, 'S42 ruled out', 'LAW ENFORCEMENT', ['RULED OUT ANY CONNECTION']),
  // ---- raw 4 227.795-239.795
  ph(239.795, 246.5, 'S43 left around nine', 'doubleo', [() => H.date(240.1, '13 AUGUST / ABOUT 9 PM')]),
  [246.5, 250.2, 'S44 nobody followed', (i) => H.map(i, F('map_moab'), 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)')],
  [250.2, 256.8, 'S45 South Mesa', (i) => H.map(i, F('map_camp'), 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', [{ x: 960, y: 540, label: 'SOUTH MESA AREA', sub: 'LA SAL LOOP ROAD / APPROXIMATE', at: 251.2 }])],
  ph(256.8, 261.2, 'S46 Saturday', 'viewpoint', [() => H.date(257.1, '14 AUGUST 2021 / SATURDAY')]),
  card(261.2, 267.1, 'S47 missed work', 'MISSED WORK', ['15 AUGUST / CRYSTAL', '16 AUGUST / BOTH OF THEM']),
  ph(267.1, 270.9, 'S48 social media', 'dalton'),
  card(270.9, 276.4, 'S49 father', "KYLEN'S FATHER, IN MONTANA", ['"A CREEPER DUDE', 'NEAR THEIR CAMP"']),
  ph(276.4, 282.1, 'S50 drove up', 'dg1'),
  ph(282.1, 286.0, 'S51 18 Aug', 'dg2', [() => H.date(282.4, '18 AUGUST 2021')]),
  ph(286.0, 289.9, 'S52 camp found', 'dg3'),
  card(289.9, 294.0, 'S53 shot dead', 'LA SAL MOUNTAINS', ['BOTH WOMEN HAD', 'BEEN SHOT DEAD']),
  ph(294.0, 300.6, 'S54 scene', 'dg4'),
  card(300.6, 305.0, 'S55 camper', '1987 FORD ECONOLINE', ['TOWED FROM A PARKING LOT', 'IN TOWN']),
  ph(305.0, 310.4, 'S56 warrant', 'dg5'),
  card(310.4, 316.5, 'S57 no danger', "19 AUGUST / GRAND COUNTY SHERIFF'S OFFICE", ['"NO CURRENT DANGER', 'TO THE PUBLIC"']),
  ph(316.5, 319.9, 'S58 tourist trade', 'dg6'),
  card(319.9, 323.4, 'S59 Cindy', 'CINDY SUE HUNTER', ['"HOW ARE WE SAFE IF YOU', 'HAVE A DOUBLE HOMICIDE?"']),
  card(323.4, 328.5, 'S60 cell tower', 'SEPTEMBER 2021', ['CELL TOWER WARRANT', 'JIMMY KEEN FLATS']),
  ph(328.5, 334.2, 'S61 two miles', 'sunset'),
  card(334.2, 340.1, 'S62 Jan 2022', 'JANUARY 2022', ['PERSON OF INTEREST NAMED', 'A MONTH LATER: CLEARED']),
  ph(340.1, 344.5, 'S63 PI audio', 'uranium'),
  card(344.5, 349.5, 'S64 March', 'MARCH 2022', ['GUNSHOT AUDIO EXISTS', 'AUTHORITIES CONFIRM IT']),
  ph(349.5, 353.5, 'S65 May briefing', 'dg13'),
];
// (continued below: late section built from a second list so the file stays readable)
const S2 = [
  card(353.5, 358.0, 'S66 named', 'MAY 2022 / NINE MONTHS LATER', ["GRAND COUNTY SHERIFF'S OFFICE", 'NAMES ADAM PINKUSIEWICZ']),
  ph(358.0, 362.0, 'S67 McDonalds', 'dg7'),
  card(362.0, 366.5, 'S68 shifts', 'HE WORKED AT', ["THE SAME McDONALD'S", 'ON DIFFERENT SHIFTS']),
  ph(366.5, 371.2, 'S69 never went back', 'dg8'),
  card(371.2, 378.0, 'S70 Iowa', 'AFTER THE 14TH OF AUGUST', ['HE LEFT MOAB FOR IOWA', 'HE DIED A MONTH LATER']),
  ph(378.0, 381.8, 'S71 told partner', 'dg9'),
  card(381.8, 385.9, 'S72 investigators said', 'INVESTIGATORS SAID', ['HE TOLD HIS PARTNER', 'HE COMMITTED THE MURDERS']),
  ph(385.9, 391.3, 'S73 thin evidence', 'dg10'),
  ph(391.3, 395.4, 'S74 cremated', 'dg11'),
  card(395.4, 400.5, 'S75 never charged', 'NEVER CHARGED', ['NO COURT EVER', 'HEARD THE CASE']),
  card(400.5, 406.5, 'S76 closed', 'INVESTIGATION CLOSED', ['IT CAN BE REOPENED', 'THE MOTIVE IS STILL UNKNOWN']),
  ph(406.5, 410.5, 'S77 aunt', 'dg12'),
  card(410.5, 414.1, 'S78 closure', "KYLEN'S AUNT", ["WITHOUT A CHARGE, IT DIDN'T", 'FEEL LIKE CLOSURE']),
  ph(414.1, 417.56, 'S79 sunflower candle', 'sunflowers'),
];

// the skeleton gives vo + raws (pass as is)
const SK = JSON.parse(fs.readFileSync(path.resolve(MED, '..', '..', '..', '..', '..', 'productions', 'last-moments', 'edit', 'skel', 'c07.json'), 'utf8'));
const raws = SK.raws.map((r) => ({ ...r, credit: FOOT }));

export default makeCase({
  id: 'lm_case07', num: 7, title: "THE BOOTH AT WOODY'S TAVERN",
  plate: [F('downtown'), CR.downtown],
  vo: SK.vo, raws,
  shots: [...S, ...S2],
  end: SK.end,
});
