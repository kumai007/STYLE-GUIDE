// lm_case09 - "Teleka Patrick at the Radisson" (Kalamazoo). RAD = hotel CCTV release, 486x360, silent. All times = part seconds (cut narration).
// RAD source map (s): 1-15.5 entrance canopy | 16-41.5 parking+drive | 42-560 lobby desk | 560-570 doors | 572-588 doors | 588-636 entrance + van. Intro uses ~596 (avoid).
// Photos come from c09/photos.json {key: [file, credit]} (filled from Commons); missing key -> a card on a blurred backdrop.
import fs from 'node:fs';
import { makeCase, H, MED } from './lm_lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c09.json', import.meta.url), 'utf8'));
const PJ = path => { try { return JSON.parse(fs.readFileSync(`${MED}/c09/photos.json`, 'utf8')); } catch { return {}; } };
const PH = PJ();
const CR = { rad: 'FOOTAGE: RADISSON PLAZA HOTEL SURVEILLANCE VIDEO, RELEASED BY KALAMAZOO COUNTY INVESTIGATORS', map: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)' };
// clerk faces blurred in lobby footage (source px); keyed raw: parking first, lobby from ~42 s
const CL = [{ r: [40, 0, 150, 110] }];
const CLK = (a) => [{ keys: [[a, -300, -300, 10, 10], [41.6, -300, -300, 10, 10], [42.3, 40, 0, 150, 110], [a + 40, 40, 0, 150, 110]] }];
const raws = S.raws.map((r, j) => {
  const o = { ...r, credit: j === 0 ? CR.rad : undefined };
  if (j === 1) { o.t = 36; o.mos = CLK(36); } // parking 36-42 then desk
  if (j === 2 || j === 3 || j === 4) o.mos = CL;
  if (j === 5) o.mos = CL; // lobby 555-559 then doors
  return o;
});
const STAMP = { x: 245, y: 2, w: 710, h: 44 };
// stamp over LIVE lobby footage (clerk face blurred; the lib's freeze has no blur): same ring, children swapped for a blurred clip
const stampLive = (t, srcT, box) => { const r = H.stamp(t, 'RAD', srcT, box); r[0].k = H.clip(0, 'RAD', srcT, { mos: [{ r: [0, 0, 170, 110] }] }); return r; };
const bgR = (i, t, bri) => H.bgV(i, 'RAD', t, bri ?? 0.5);
const cardR = (t, i, bt, kick, lines) => H.card(t, bgR(i, bt), kick, lines);
// photo key -> real photo if present; else card on a blurred RAD backdrop. fb = [kick, lines, bgSrcT]
const ph = (i, key, t, fb, o = {}) => PH[key] ? H.photo(i, PH[key][0], PH[key][1], { bri: 0.8, ...o }) : cardR(t, i, fb[2], fb[0], fb[1]);
const mp = (i, key, label, sub, t, cr = CR.map, y) => H.map(i, `c09/${key}`, cr, [{ x: 960, y: y ?? 560, label, sub, size: 34, at: t }]);

const shots = [
  // ---- p01 (6.0 - 156.7): ends at the first raw
  [5.5, 10.0, 'S01 end of the recording', (i) => H.clip(i, 'RAD', 620.1, {})],
  [10.0, 13.6, 'S02 kalamazoo', (i) => mp(i, 'map_kzoo.jpg', 'KALAMAZOO', 'MICHIGAN', 10.3)],
  [13.6, 18.1, 'S03 radisson', (i) => ph(i, 'rad', 13.8, ['THE RADISSON PLAZA HOTEL', ['DOWNTOWN KALAMAZOO'], 60])],
  [18.1, 23.7, 'S04 inside at the desk', (i) => H.clip(i, 'RAD', 60, { mos: CL })],
  [23.7, 27.6, 'S05 last thing recorded', (i) => H.clip(i, 'RAD', 625, {})],
  [27.6, 33.2, 'S06 date', (i) => cardR(27.9, i, 160, 'THURSDAY', ['5 DECEMBER 2013'])],
  [33.2, 36.6, 'S07 borgess', (i) => ph(i, 'borg', 33.4, ['BORGESS MEDICAL CENTER', ['KALAMAZOO · RESIDENCY'], 62])],
  [36.6, 41.0, 'S08 wmu', (i) => ph(i, 'wmu', 36.8, ['WESTERN MICHIGAN UNIVERSITY', ['MEDICAL SCHOOL PROGRAMME'], 64])],
  [41.0, 45.1, 'S09 age 30', (i) => cardR(41.2, i, 63, 'AGE 30', ['RAISED IN NEW YORK'])],
  [45.1, 50.7, 'S10 loma linda', (i) => ph(i, 'llu', 45.3, ['LOMA LINDA UNIVERSITY', ['MD AND PHD IN BIOCHEMISTRY'], 66])],
  [50.7, 55.6, 'S11 on paper', (i) => cardR(50.9, i, 67, 'ON PAPER', ['EVERYTHING WAS GOING RIGHT'])],
  [55.6, 60.6, 'S12 tweets', (i) => cardR(55.8, i, 68, 'FROM SPRING 2013', ['THOUSANDS OF TWEETS', 'TO A MAN SHE NEVER NAMED'])],
  [60.6, 64.0, 'S13 sapp', (i) => ph(i, 'sapp', 60.8, ['MARVIN SAPP', ['GOSPEL SINGER AND PASTOR'], 69])],
  [64.0, 68.3, 'S14 church grand rapids', (i) => mp(i, 'map_grandrapids.jpg', 'GRAND RAPIDS', 'LIGHTHOUSE FULL LIFE CENTER CHURCH', 64.3)],
  [68.3, 74.2, 'S15 protection order', (i) => cardR(68.5, i, 150, 'SEPTEMBER 17, 2013', ['A JUDGE GRANTS MARVIN SAPP', 'A PROTECTION ORDER'])],
  [74.2, 79.0, 'S16 filing', (i) => cardR(74.4, i, 152, 'IN HIS FILING', ['SHE CLAIMED TO BE HIS WIFE'])],
  [79.0, 83.0, 'S17 home children', (i) => cardR(79.2, i, 154, 'SHE HAD BEEN TO HIS HOME', ['AND CONTACTED HIS CHILDREN'])],
  [83.0, 86.5, 'S18 400 pages', (i) => cardR(83.2, i, 156, 'AT LEAST', ['400 PAGES OF MESSAGES'])],
  [86.5, 90.8, 'S19 youtube account', (i) => cardR(86.7, i, 158, 'EARLY NOVEMBER · YOUTUBE', ['"SANDRA3000CASSIE"'])],
  [90.8, 96.8, 'S20 breakfast for two', (i) => ph(i, 'kdt', 91.0, ['ONE VIDEO SHOWS', ['BREAKFAST MADE FOR TWO'], 109])],
  [96.8, 102.7, 'S21 former husband', (i) => cardR(97.0, i, 112, 'THE KALAMAZOO GAZETTE', ['HER FORMER HUSBAND HAD', 'FEARED FOR HER SAFETY'])],
  [102.7, 107.9, 'S22 testimony', (i) => cardR(102.9, i, 115, 'NOVEMBER 27', ['TESTIMONY AT MOUNT ZION', 'BAPTIST CHURCH, KALAMAZOO'])],
  [107.9, 112.3, 'S23 thanksgiving', (i) => H.clip(i, 'RAD', 155, { mos: CL })],
  [112.3, 116.1, 'S24 evaluations', (i) => cardR(112.5, i, 120, 'DECEMBER 3', ['STRONG EVALUATIONS', 'AT THE MEDICAL SCHOOL'])],
  [116.1, 120.8, 'S25 abstract', (i) => cardR(116.3, i, 125, 'DECEMBER 4', ['AN ABSTRACT FOR THE AMERICAN', 'PSYCHIATRIC ASSOCIATION'])],
  [120.8, 127.0, 'S26 lecture call', (i) => ph(i, 'wmu2', 121.0, ['THE GAZETTE TIMELINE', ['A PHONE CALL DURING A LECTURE'], 128])],
  [127.0, 131.7, 'S27 thursday', (i) => cardR(127.2, i, 130, 'THURSDAY 5 DECEMBER', ['HER LAST KNOWN TWEET:', 'AUTO-DELETE SWITCHED ON'])],
  [131.7, 138.1, 'S28 chicago colleagues', (i) => ph(i, 'kdt2', 131.9, ['SHE TOLD COLLEAGUES', ['SHE WAS GOING TO CHICAGO'], 135])],
  [138.1, 143.5, 'S29 money and ride', (i) => ph(i, 'borg2', 138.3, ['HER PURSE AND PHONE', ['LEFT AT THE HOSPITAL'], 138])],
  [143.5, 147.5, 'S30 dropped off', (i) => ph(i, 'rad2', 143.7, ['DROPPED OFF AT THE RADISSON', ['ABOUT 7:30 PM'], 140])],
  [147.5, 153.0, 'S31 stamps in red', (i) => H.stamp(147.9, 'RAD', 12, STAMP)],
  [153.0, 157.065, 'S32 first camera', (i) => [...H.frz(i, 'RAD', 1.0, {}), H.place(153.3, '7:34 PM', 'ENTRANCE CANOPY CAMERA')]],
  // ---- p02 (181.6 - 191.2): gap before raw 2
  [181.065, 186.3, 'S33 drive camera', (i) => [...H.clip(i, 'RAD', 25.5, {}), H.place(181.6, 'DRIVE AND PARKING CAMERA', '7:34 PM')]],
  [186.3, 191.575, 'S34 suv and van', (i) => H.clip(i, 'RAD', 30.8, {})],
  // ---- p03 (215.1 - 228.1)
  [214.575, 220.0, 'S35 front desk camera', (i) => H.clip(i, 'RAD', 108, { mos: CL })],
  [220.0, 224.4, 'S36 teleka at counter', (i) => [...H.clip(i, 'RAD', 113.4, { mos: CL }), H.label(220.4, 'DR. TELEKA PATRICK', 'GUEST SIDE OF THE COUNTER')]],
  [224.4, 228.11, 'S37 room cash', (i) => H.clip(i, 'RAD', 119, { mos: CL })],
  // ---- p04 (258.6 - 269.2)
  [258.11, 263.7, 'S38 not enough money', (i) => H.clip(i, 'RAD', 125, { mos: CL })],
  [263.7, 269.505, 'S39 clerks carry on', (i) => H.clip(i, 'RAD', 140, { mos: CL })],
  // ---- p05 (300.0 - 315.8)
  [299.505, 304.2, 'S40 stamp 7:34', (i) => H.stamp(299.8, 'RAD', 38, { ...STAMP, w: 590 })],
  [304.2, 309.7, 'S41 fifteen minutes', (i) => cardR(304.4, i, 148, '15 MINUTES AT A HOTEL DESK', ['NO ROOM', 'NO PURSE, NO PHONE'])],
  [309.7, 316.115, 'S42 stamp 7:49', (i) => stampLive(310.0, 538, { ...STAMP, w: 680 })],
  // ---- p06 (341.6 - 351.9): glass doors, empty
  [341.115, 346.5, 'S43 glass doors', (i) => H.clip(i, 'RAD', 571, {})],
  [346.5, 352.265, 'S44 doors too small', (i) => H.clip(i, 'RAD', 578, {})],
  // ---- p07 (367.8 - 376.3)
  [367.265, 372.0, 'S45 courtesy van', (i) => cardR(367.5, i, 590, 'THE HOTEL\'S COURTESY VAN', ['AGREED TO TAKE HER', 'BACK TO HER CAR AT BORGESS'])],
  [372.0, 376.635, 'S46 van waiting', (i) => H.clip(i, 'RAD', 589, {})],
  // ---- p08 (402.3 - 543.7)
  [401.635, 405.2, 'S47 van dropped her', (i) => H.clip(i, 'RAD', 629.2, {})],
  [405.2, 410.6, 'S48 investigator', (i) => cardR(405.4, i, 628, 'HER FAMILY\'S PRIVATE INVESTIGATOR', ['THE DRIVER SAW HER DUCKING', 'BETWEEN PARKED CARS'])],
  [410.6, 415.6, 'S49 1002', (i) => cardR(410.8, i, 160, '10:02 THAT NIGHT', ['INDIANA STATE POLICE GET A CALL', 'ABOUT AN ERRATIC DRIVER'])],
  [415.6, 420.6, 'S50 i94 westbound', (i) => ph(i, 'i94', 415.8, ['WESTBOUND ON I-94', ['NEAR PORTAGE, INDIANA'], 162])],
  [420.6, 424.3, 'S51 portage', (i) => mp(i, 'map_portage.jpg', 'PORTAGE, INDIANA', 'ABOUT 100 MILES FROM THE HOSPITAL', 420.9)],
  [424.3, 430.8, 'S52 lexus', (i) => ph(i, 'lex', 424.5, ['10:20 PM', ['A TROOPER FINDS A GOLD', '1997 LEXUS ES300'], 164])],
  [430.8, 434.0, 'S53 ditch', (i) => ph(i, 'i94b', 431.0, ['EMPTY IN A DITCH', ['NORTH SIDE OF THE INTERSTATE'], 166])],
  [434.0, 441.1, 'S54 inside the car', (i) => cardR(434.2, i, 170, 'INSIDE THE CAR', ['HER CLOTHES AND HER WALLET', 'LICENCE, CARDS, A LITTLE CASH', 'HER KEYS WERE GONE'])],
  [441.1, 445.0, 'S55 next morning', (i) => cardR(441.3, i, 172, 'FRIDAY MORNING', ['SHE DOESN\'T TURN UP FOR WORK', 'REPORTED MISSING'])],
  [445.0, 449.4, 'S56 towed', (i) => cardR(445.2, i, 175, 'IN INDIANA', ['THE CAR IS TOWED AND IMPOUNDED'])],
  [449.4, 453.4, 'S57 december 10', (i) => cardR(449.6, i, 178, 'DECEMBER 10', ['THE CAR IS LINKED TO HER'])],
  [453.4, 459.7, 'S58 tracking dog', (i) => cardR(453.6, i, 180, 'DECEMBER 12', ['A TRACKING DOG FOLLOWS HER SCENT', 'TO THE EDGE OF THE HIGHWAY'])],
  [459.7, 465.5, 'S59 vigil', (i) => cardR(459.9, i, 183, 'DECEMBER 16', ['MORE THAN 50 PEOPLE AT A', 'PRAYER VIGIL IN PARCHMENT, MICHIGAN'])],
  [465.5, 471.9, 'S60 video released', (i) => H.clip(i, 'RAD', 196, { mos: CL })],
  [471.9, 478.5, 'S61 sheriff jan', (i) => cardR(472.1, i, 186, 'JANUARY 2014', ['KALAMAZOO COUNTY SHERIFF', 'RICHARD FULLER'])],
  [478.5, 482.3, 'S62 on her own', (i) => H.clip(i, 'RAD', 205, { mos: CL })],
  [482.3, 486.1, 'S63 we do not know', (i) => cardR(482.5, i, 190, 'SHERIFF FULLER', ['"WHAT HAPPENED AFTER HER CAR', 'WENT OFF THE ROAD, WE DO NOT KNOW."'])],
  [486.1, 491.0, 'S64 lake charles', (i) => H.card(486.1, H.bgP(i, 'c09/map_portage.jpg', 0.45), 'THE FBI AND INDIANA STATE POLICE', ['SONAR SEARCH OF LAKE CHARLES', 'A ONE-ACRE POND BESIDE THE ROAD'], CR.map)],
  [491.0, 495.1, 'S65 nothing', (i) => ph(i, 'pond', 491.2, ['THEY FOUND NOTHING', [''], 195])],
  [495.1, 500.2, 'S66 april 1', (i) => cardR(495.3, i, 200, 'APRIL 1', ['ABOUT 50 OFFICIALS RETURN', 'THE POND IS STILL FROZEN'])],
  [500.2, 505.5, 'S67 april 6', (i) => cardR(500.4, i, 210, 'SUNDAY 6 APRIL 2014', ['A FISHERMAN SEES', 'SOMETHING IN THE WATER'])],
  [505.5, 510.7, 'S68 four months', (i) => cardR(505.7, i, 215, 'FOUR MONTHS TO THE DAY', ['AFTER SHE WAS REPORTED MISSING'])],
  [510.7, 515.4, 'S69 pockets', (i) => cardR(510.9, i, 220, 'IN HER POCKETS', ['THE CAR KEYS', '$100 IN CASH AND A PAGER'])],
  [515.4, 519.1, 'S70 april 9', (i) => cardR(515.6, i, 225, 'APRIL 9', ['THE PORTER COUNTY CORONER', 'IDENTIFIES HER'])],
  [519.1, 522.1, 'S71 drowning', (i) => cardR(519.3, i, 230, 'NO SIGN OF TRAUMA', ['CAUSE OF DEATH: DROWNING'])],
  [522.1, 526.5, 'S72 second autopsy', (i) => cardR(522.3, i, 235, 'HER FAMILY ASKED FOR', ['A SECOND AUTOPSY'])],
  [526.5, 532.6, 'S73 no foul play', (i) => cardR(526.7, i, 240, 'SHERIFF FULLER', ['NO SIGN OF FOUL PLAY', '"AN INNOCENT VICTIM OF AN', 'APPARENT STALKING"'])],
  [532.6, 537.5, 'S74 closed', (i) => cardR(532.8, i, 245, 'SHERIFF FULLER', ['"SHORT OF ANYTHING BIG, THIS', 'INVESTIGATION WILL BE CLOSED."'])],
  [537.5, 541.8, 'S75 possible accident', (i) => cardR(537.7, i, 250, 'A POSSIBLE ACCIDENTAL DROWNING', ['NO FINAL RULING WAS EVER REPORTED'])],
  [541.8, 545.16, 'S76 end', (i) => [...H.clip(i, 'RAD', 626.5, {}), H.dip(0, 40)]],
];

export default makeCase({
  id: 'lm_case09', num: 9, title: 'TELEKA PATRICK AT THE RADISSON',
  plate: PH.plate || ['c09/map_kzoo.jpg', CR.map],
  vo: S.vo, raws, shots, end: S.end,
});
