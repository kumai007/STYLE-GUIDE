// lm_case16 - "Brad Gobright's last climb" (El Potrero Chico, Mexico). Source GOB = friend's upload, 1920x1080 60 fps, 277 s, silent (raws mute).
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c16.md
// GOB window map (src s): raws 0-20, 97-125, 130-158, 220-250, 265-276. FORBIDDEN 250-265 (filmer's face). Free b-roll: 20-97, 125-130, 158-220.
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, n, MED } from './lm_lib.mjs';

const EOX = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const FT = 'FOOTAGE: FRIEND OF BRAD GOBRIGHT (YOUTUBE)';
const has = (f) => fs.existsSync(path.join(MED, 'c16', f));
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
const clip = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.clip(i, 'GOB', t, o), ...extra()]);
const frz = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.frz(i, 'GOB', t, o), ...extra()]);
const photo = (a, b, name, src, credit, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, credit, o), ...extra()]);
const cardP = (a, b, name, src, kick, lines, credit) => add(a, b, name, (i) => H.card(a + 0.3, H.bgP(i, src, /map/.test(src) ? 0.85 : 0.5), kick, lines, credit));
const cardV = (a, b, name, t, kick, lines) => add(a, b, name, (i) => H.card(a + 0.3, H.bgV(i, 'GOB', t, 0.72), kick, lines));
const map = (a, b, name, src, pins = [], extra = () => []) => add(a, b, name, (i) => [...H.map(i, src, EOX, pins), ...extra()]);
// photo credits (filled when downloaded)
const CR = JSON.parse(fs.existsSync(path.join(MED, 'c16', 'credits.json')) ? fs.readFileSync(path.join(MED, 'c16', 'credits.json'), 'utf8') : '{}');
const pc = (k) => CR[k] || 'PHOTO: WIKIMEDIA COMMONS';

// ---- A: p01 (5.5 - 131.74)
frz(5.5, 9.5, 'A01 last clear look', 266.2);
clip(9.5, 13.5, 'A02 canyon', 29, {}, () => [H.place(10.0, 'NORTHERN MEXICO')]);
frz(13.5, 17.5, 'A03 pack', 270.0);
clip(17.5, 23.3, 'A04 limestone', 160);
map(23.3, 27.6, 'A05 orange county', 'c16/map_us.jpg', [{ x: 680, y: 618, label: 'ORANGE COUNTY', sub: 'CALIFORNIA', at: 23.8 }]);
cardP(27.6, 31.76, 'A06 born', 'c16/map_us.jpg', 'BRADFORD GOBRIGHT', ['BORN 16 JUNE 1988', 'CLIMBING AT SIX'], EOX);
clip(31.76, 36.4, 'A07 dropped out', 36, {}, () => [H.date(33.2, '2009')]);
clip(36.4, 40.4, 'A08 odd jobs', 41);
cardV(40.4, 46.6, 'A09 civic', 46.5, 'THE REST OF THE YEAR', ['A HONDA CIVIC', 'ON THE WEST COAST']);
cardV(46.6, 53.0, 'A10 rock and ice', 54, 'ROCK AND ICE, QUOTED BY THE ASSOCIATED PRESS', ['"ONE OF THE MOST ACCOMPLISHED', 'FREE SOLO CLIMBERS IN THE WORLD"']);
clip(53.0, 58.32, 'A11 record', 60.5, {});
if (has('elcap.jpg')) photo(58.32, 64.6, 'A12 heart route', 'c16/elcap.jpg', pc('elcap'), { bri: 0.85 }, () => [H.place(58.7, 'EL CAPITAN', 'YOSEMITE, CALIFORNIA'), H.date(62.2, '2015')]);
else map(58.32, 64.6, 'A12 heart route', 'c16/map_elcap.jpg', [{ x: 960, y: 540, label: 'EL CAPITAN', sub: 'YOSEMITE', at: 58.7 }], () => [H.date(62.2, '2015')]);
if (has('eldo.jpg')) photo(64.6, 69.4, 'A13 eldorado', 'c16/eldo.jpg', pc('eldo'), { bri: 0.85 }, () => [H.place(65.0, 'ELDORADO CANYON', 'COLORADO')]);
else map(64.6, 69.4, 'A13 eldorado', 'c16/map_us.jpg', [{ x: 965, y: 441, label: 'ELDORADO CANYON', sub: 'COLORADO', at: 65.0 }]);
cardP(69.4, 73.76, 'A14 free solo', 'c16/map_us.jpg', 'FIRST FREE SOLO, NOVEMBER 2015', ['HAIRSTYLES AND ATTITUDES', 'NO ROPE, NO PROTECTION'], EOX);
map(73.76, 77.8, 'A15 el cap 2016', 'c16/map_elcap.jpg', [], () => [H.date(74.3, '2016')]);
cardP(77.8, 81.9, 'A16 three routes', 'c16/map_elcap.jpg', 'THREE EL CAPITAN ROUTES IN 24 HOURS', ['ZODIAC', 'THE NOSE', 'LURKING FEAR'], EOX);
cardP(81.9, 86.6, 'A17 nose record', 'c16/map_elcap.jpg', 'OCTOBER 2017 · THE NOSE', ['SPEED RECORD', '2:19:44'], EOX);
clip(86.6, 90.93, 'A18 b-roll', 66, {});
clip(90.93, 94.41, 'A19 under two hours', 76, {});
cardV(94.41, 99.44, 'A20 safety third', 80, 'SAFETY THIRD · 27 MINUTES', ['REEL ROCK, 2017']);
cardP(99.44, 104.8, 'A21 1:58', 'c16/map_elcap.jpg', 'HONNOLD AND CALDWELL, THE NOSE', ['1:58:07'], EOX);
clip(104.8, 110.11, 'A22 reel rock', 84, {});
cardP(110.11, 118.43, 'A23 el nino', 'c16/map_elcap.jpg', 'JUNE 2019 · WITH ALEX HONNOLD', ['EL NIÑO, EL CAPITAN', 'ABOUT 14½ HOURS'], EOX);
cardP(118.43, 124.9, 'A24 golden gate', 'c16/map_elcap.jpg', 'THE LAST OF THREE EL CAP ROUTES', ['GOLDEN GATE', 'ONE PUSH · 16½ HOURS'], EOX);
clip(124.9, 131.74, 'A25 straight down', 21, {}, () => [H.spot(128.5, 810, 650, 130)]);

// ---- B: p02 (151.74 - 198.42)
map(151.74, 157.0, 'B01 hidalgo', 'c16/map_nl.jpg', [{ x: 992, y: 493, label: 'HIDALGO', sub: 'NUEVO LEÓN', at: 152.6 }], () => [H.date(155.4, 'LATE NOVEMBER 2019')]);
map(157.0, 162.8, 'B02 potrero', 'c16/map_potrero.jpg', [{ x: 960, y: 540, label: 'EL POTRERO CHICO', sub: 'SIERRA DEL FRAILE', at: 157.6 }]);
if (has('potrero_walk.jpg')) photo(162.8, 167.6, 'B03 fins', 'c16/potrero_walk.jpg', pc('potrero_walk'), { bri: 0.85, pos: '50% 0%' });
else clip(162.8, 167.6, 'B03 fins', 166, {});
cardP(167.6, 173.9, 'B04 limestone', has('potrero_chico.jpg') ? 'c16/potrero_chico.jpg' : 'c16/map_potrero.jpg', '200 MILLION YEARS OLD', ['LIMESTONE PUSHED UPRIGHT', 'BY A SALT DOME'], has('potrero_chico.jpg') ? pc('potrero_chico') : EOX);
clip(173.9, 177.4, 'B05 spires', 171, {}, () => [H.place(174.3, 'SPIRES ABOUT 2,000 FT')]);
cardV(177.4, 180.5, 'B06 space boyz', 200, 'THE FRIEND\'S UPLOAD NAMES THE ROUTE', ['SPACE BOYZ']);
clip(180.5, 186.3, 'B07 road campground', 90);
clip(186.3, 190.2, 'B08 pans', 125);
clip(190.2, 194.3, 'B09 eye', 168, {}, () => [H.spot(191.0, 960, 530, 120)]);
clip(194.3, 198.42, 'B10 level', 176);

// ---- C: p03 (226.42 - 251.865)
cardP(226.42, 231.6, 'C01 honnold', 'c16/map_elcap.jpg', 'ALEX HONNOLD, TO THE ASSOCIATED PRESS', ['"WAS JUST INTERESTED', 'IN THE WORLD"'], EOX);
clip(231.6, 236.6, 'C02 books', 196);
cardV(236.6, 243.5, 'C03 crossley', 203, 'SAMUEL CROSSLEY, PHOTOGRAPHER OF SAFETY THIRD', ['"BRAD WAS BRAD,', 'THAT WAS THE BEAUTY OF IT"']);
cardP(243.5, 247.5, 'C04 week after', 'c16/map_us.jpg', 'SPOKEN TO THE AP', ['IN THE WEEK AFTER', 'THE ACCIDENT'], EOX);
clip(247.5, 251.865, 'C05 ledge cactus', 210);

// ---- D: p04 (279.865 - 325.855)
if (has('potrero_walk.jpg')) photo(279.865, 285.5, 'D01 sendero', 'c16/potrero_walk.jpg', pc('potrero_walk'), { bri: 0.85, pos: '50% 0%' }, () => [H.date(280.4, 'WEDNESDAY 27 NOVEMBER 2019')]);
else map(279.865, 285.5, 'D01 sendero', 'c16/map_potrero.jpg', [], () => [H.date(280.4, 'WEDNESDAY 27 NOVEMBER 2019')]);
cardP(285.5, 290.7, 'D02 route', 'c16/map_potrero.jpg', 'EL SENDERO LUMINOSO', ['15 PITCHES', 'ABOUT 1,750 FEET'], EOX);
cardP(290.7, 297.3, 'D03 grade', 'c16/map_potrero.jpg', 'GRADED 5.12+', ['FREE SOLOED BY HONNOLD', 'IN 2014, JUST OVER 3 HOURS'], EOX);
map(297.3, 304.97, 'D04 jacobson', 'c16/map_us.jpg', [{ x: 810, y: 625, label: 'AIDAN JACOBSON, 26', sub: 'PHOENIX, ARIZONA', at: 298.2 }]);
cardV(304.97, 311.85, 'D05 aac', 168, 'AMERICAN ALPINE CLUB ACCIDENT REPORT', ['EVERY PITCH FIRST TRY,', 'NO FALL']);
cardV(311.85, 318.0, 'D06 onsight', 190, 'WHAT CLIMBERS CALL', ['AN ONSIGHT']);
cardV(318.0, 321.62, 'D07 outside', 184, 'JACOBSON\'S OWN ACCOUNT TO', ['OUTSIDE MAGAZINE']);
clip(321.62, 325.855, 'D08 belay', 215.5);

// ---- E: p05 (355.855 - 417.56)
cardP(355.855, 363.2, 'E01 simul', 'c16/map_potrero.jpg', 'THE WAY DOWN', ['SIMUL-RAPPEL', 'ABOUT 1,500 FEET'], EOX);
cardV(363.2, 371.4, 'E02 rope', 100.0 + 70, 'ONE 80-METRE ROPE', ['THROUGH THE ANCHOR', 'ONE STRAND EACH']);
cardP(371.4, 378.4, 'E03 fast', 'c16/map_potrero.jpg', 'FAST, BUT ONLY IF', ['BOTH STRANDS REACH', 'THE NEXT STOP'], EOX);
cardV(378.4, 385.4, 'E04 pitch five', 178, 'MID-AFTERNOON, ABOVE THE LEDGE ON PITCH FIVE', ['TWO SHORT RAPPELS']);
cardV(385.4, 391.4, 'E05 middle mark', 212, 'THE ROPE WAS NOT PULLED TO ITS MIDDLE MARK', ['ONE END ON THE LEDGE']);
cardV(391.4, 396.7, 'E06 bushes', 214, 'GOBRIGHT\'S END', ['TANGLED IN BUSHES BELOW']);
cardV(396.7, 402.5, 'E07 no knot', 216, 'NEITHER END HAD', ['A STOPPER KNOT']);
cardV(402.5, 410.1, 'E08 flakes', 160.0, 'THE REPORT: PROBABLY A CHOICE', ['FLAKES, BUSHES AND CACTI', 'SNAG A KNOTTED ROPE']);
cardV(410.1, 414.29, 'E09 same trip', 218, 'THE FRIEND NEVER SAID WHICH DAY', ['ONLY: THE SAME TRIP']);
cardV(414.29, 417.56, 'E10 short cut', 205, 'AFTER A SHORT CUT', ['THE CLOSE SHOT AGAIN']);

// ---- F: p06 (428.56 - 502.96)
cardV(428.56, 434.9, 'F01 too short', 165, 'HIS STRAND WAS TOO SHORT', ['THE BUSHES HID IT']);
cardV(434.9, 440.6, 'F02 jacobson dropped', 186, 'JACOBSON DROPPED TOO', ['THROUGH BUSHES, ONTO THE LEDGE']);
cardV(440.6, 446.12, 'F03 rope came down', 199, 'THE ROPE PULLED THROUGH THE ANCHOR', ['AND CAME DOWN AFTER HIM']);
cardV(446.12, 452.08, 'F04 lucky', 206, 'AMERICAN ALPINE CLUB', ['"EXTREMELY LUCKY"']);
cardV(452.08, 455.22, 'F05 went past', 208, 'GOBRIGHT WENT PAST THE LEDGE', ['HE DID NOT SURVIVE']);
cardV(455.22, 462.78, 'F06 ankle', 192, 'JACOBSON: AN INJURED ANKLE', ['HELPED BY OTHER CLIMBERS', 'NUEVO LEÓN CIVIL DEFENCE']);
cardV(462.78, 467.3, 'F07 number', 172, 'HOW FAR HE FELL', ['REPORTS DISAGREE']);
cardP(467.3, 472.3, 'F08 recovered', 'c16/map_potrero.jpg', 'RECOVERED THE NEXT DAY', ['THURSDAY 28 NOVEMBER 2019', 'NO CRIMINAL CASE'], EOX);
cardV(472.3, 480.58, 'F09 retellings', 174, 'RETELLINGS ONLINE SAY A ROPE FAILED', ['NO ACCOUNT SAYS SO', 'THE ROPE SIMPLY RAN OUT']);
cardV(480.58, 491.7, 'F10 stopper knots', 182, 'AMERICAN ALPINE CLUB REPORT, 2020', ['"IT\'S VERY UNLIKELY THIS FATAL', 'ACCIDENT WOULD HAVE OCCURRED"', 'WITH STOPPER KNOTS']);
add(491.7, 502.96, 'F11 friend posted', (i) => H.card(492.0, H.bgV(i, 'GOB', 150.0, 0.45), '15 DECEMBER 2019', ['"THE LAST VIDEO I TOOK OF', 'BRAD GOBRIGHT IN MEXICO."']));

export default makeCase({
  id: 'lm_case16', num: 16, title: "BRAD GOBRIGHT'S LAST CLIMB",
  plate: has('potrero_chico.jpg') ? ['c16/potrero_chico.jpg', pc('potrero_chico')] : ['c16/potrero_walk.jpg', pc('potrero_walk')],
  vo: [["vo/c16_p01.wav", 6.0], ["vo/c16_p02.wav", 152.24], ["vo/c16_p03.wav", 226.92], ["vo/c16_p04.wav", 280.365], ["vo/c16_p05.wav", 356.355], ["vo/c16_p06.wav", 429.06]],
  raws: [{"tag": "GOB", "a": 131.74, "b": 151.74, "t": 0.0, "mute": true, "credit": "FOOTAGE: FRIEND OF BRAD GOBRIGHT (YOUTUBE)"}, {"tag": "GOB", "a": 198.42, "b": 226.42, "t": 97.0, "mute": true}, {"tag": "GOB", "a": 251.865, "b": 279.865, "t": 130.0, "mute": true}, {"tag": "GOB", "a": 325.855, "b": 355.855, "t": 220.0, "mute": true}, {"tag": "GOB", "a": 417.56, "b": 428.56, "t": 265.0, "mute": true}],
  shots: SH, end: 502.96,
});
