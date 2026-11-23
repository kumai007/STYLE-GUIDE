// lm_case11 - "Bolt's last ride video" (M-4 Don, Moscow). BLT = Moto Nexus review (1920x1080, plates + riders in POV -> mos boxes).
// Source map (src s): 90-120 bike, 570 buttons, 750-870 tank, 900-930 gauges, 1050-1180 bags/hands, 1290-1850 POV traffic. Raws at 330,660,1310,1400,1560,1815.
import fs from 'node:fs';
import { makeCase, H } from './lm_lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c11.json', import.meta.url), 'utf8'));
const CR = { blt: 'FOOTAGE: MOTO NEXUS (BOLT)', map: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)' };
const PL = { mos: [{ r: [380, 380, 1160, 300] }] }; // plates + riders band for POV b-roll (refine per shot)
const RAWS = S.raws.map((r, j) => ({ ...r, credit: CR.blt, ...(j >= 2 ? { mos: [{ r: [380, 380, 1160, 300] }] } : {}) }));
const bgv = (i, t, bri) => H.bgV(i, 'BLT', t, bri);
const card = (t, i, bt, kick, lines, bri) => H.card(t, bgv(i, bt, bri), kick, lines);
const pov = (t, o = {}) => (i) => H.clip(i, 'BLT', t, { ...PL, ...o });
const shots = [
  // ---- g0 5.5 - 64.86
  [5.5, 11.4, 'S01 final stretch', pov(1590, { credit: CR.blt })],
  [11.4, 16.5, 'S02 traffic packed', pov(1655)],
  [16.5, 19.7, 'S03 footage stops', (i) => H.frz(i, 'BLT', 1596, { ...PL })],
  [19.7, 24.9, 'S04 ufa', (i) => H.map(i, 'c11/map_ufa.jpg', CR.map, [{ x: 960, y: 540, label: 'UFA', sub: 'BASHKORTOSTAN · RUSSIA', at: 22.3 }])],
  [24.9, 28.0, 'S05 moto nexus', (i) => card(25.2, i, 126, 'YOUTUBE CHANNEL', ['MOTO NEXUS', 'STARTED 2010'], 0.5)],
  [28.0, 33.5, 'S06 reviewed bikes', (i) => H.clip(i, 'BLT', 90, {})],
  [33.5, 38.7, 'S07 service centre', (i) => H.clip(i, 'BLT', 1056, {})],
  [38.7, 43.8, 'S08 subscribers', (i) => card(39.0, i, 748, 'SUBSCRIBERS', ['MORE THAN 280,000', 'BY SUMMER 2019'], 0.5)],
  [43.8, 46.8, 'S09 moscow', (i) => H.map(i, 'c11/map_moscow.jpg', CR.map, [{ x: 960, y: 540, label: 'MOSCOW', at: 44.1 }])],
  [46.8, 52.5, 'S10 ivanov', (i) => H.clip(i, 'BLT', 904, { over: [H.label(49.4, 'ANDREY IVANOV', 'MOTOMOSCOW COMMUNITY')] })],
  [52.5, 58.2, 'S11 makes a show', (i) => card(52.8, i, 1236, 'ANDREY IVANOV', ['REAL LIFE: "KIND AND OPEN"', 'ON CAMERA: "A MAN WHO MAKES A SHOW"'], 0.5)],
  [58.2, 64.86, 'S12 railway bridge', (i) => H.clip(i, 'BLT', 150, {})],
  // ---- g1 74.86 - 121.605
  [74.86, 78.1, 'S13 chieftain', (i) => H.clip(i, 'BLT', 96, {})],
  [78.1, 83.6, 'S14 buy this or harley', (i) => card(78.4, i, 572, 'THE WHOLE VIDEO', ['BUY THIS ONE,', 'OR A HARLEY AFTER ALL?'], 0.5)],
  [83.6, 88.7, 'S15 runtime', (i) => H.clip(i, 'BLT', 1232, { over: [H.date(83.9, 'RUNTIME 31 MINUTES')] })],
  [88.7, 94.2, 'S16 nobody owes', (i) => card(89.0, i, 1262, 'IRINA SKATKOVA TO 360', ['"ON THE ROAD NOBODY', 'OWES ANYONE ANYTHING."'], 0.5)],
  [94.2, 99.3, 'S17 danger', pov(1440)],
  [99.3, 104.4, 'S18 no protection', (i) => card(99.6, i, 862, 'RODE WITHOUT PROTECTION', ['ON PURPOSE'], 0.5)],
  [104.4, 109.9, 'S19 armour out', (i) => H.clip(i, 'BLT', 1142, {})],
  [109.9, 115.2, 'S20 minor crash', (i) => card(110.2, i, 1182, 'STARHIT', ['A MINOR CRASH A MONTH BEFORE', 'HE BLAMED THE ROAD'], 0.5)],
  [115.2, 118.4, 'S21 trousers', (i) => card(115.4, i, 1176, 'ON CAMERA', ['MORE UPSET ABOUT HIS TROUSERS', 'THAN ABOUT THE BIKE'], 0.5)],
  [118.4, 121.605, 'S22 back in saddle', (i) => H.clip(i, 'BLT', 640, {})],
  // ---- g2 131.605 - 155.185
  [131.605, 137.8, 'S23 not filmed date', (i) => H.clip(i, 'BLT', 1861, {})],
  [137.8, 143.4, 'S24 went up', (i) => card(138.1, i, 1192, 'UPLOADED', ['SUNDAY 9 JUNE 2019', '12:00 MOSCOW TIME'], 0.5)],
  [143.4, 148.9, 'S25 description', (i) => card(143.7, i, 1256, 'DESCRIPTION', ['SHOP LINKS · SPONSOR LINKS', 'A MUSIC CREDIT'], 0.5)],
  [148.9, 155.185, 'S26 helmet cam', pov(1285)],
  // ---- g3 180.185 - 199.065
  [180.185, 187.2, 'S27 filtering', pov(1345)],
  [187.2, 192.8, 'S28 rush hour', (i) => card(187.5, i, 1432, 'IN HIS WORDS', ['"WE\'RE FILMING AT RUSH HOUR,', 'SO THE TRAFFIC IS VERY DENSE"'], 0.5)],
  [192.8, 199.065, 'S29 every gap', pov(1700)],
  // ---- g4 224.065 - 247.715
  [224.065, 229.9, 'S30 hour before', (i) => card(224.4, i, 1356, 'HIS FRIENDS SAY', ['THE REVIEW WENT LIVE', 'ABOUT AN HOUR BEFORE HE DIED'], 0.5)],
  [229.9, 235.6, 'S31 instagram', (i) => card(230.2, i, 1596, 'LAST INSTAGRAM POST', ['A FEW SECONDS OF HIM RIDING', 'WITH HIS FEET UP'], 0.5)],
  [235.6, 240.8, 'S32 not typical', pov(1745)],
  [240.8, 247.715, 'S33 filmed long before', (i) => card(241.1, i, 1612, 'ANDREY IVANOV', ['FILMED LONG BEFORE,', 'ON A DIFFERENT ROAD'], 0.5)],
  // ---- g5 272.715 - 294.065
  [272.715, 279.1, 'S34 took risks', pov(1520)],
  [279.1, 284.3, 'S35 out loud', (i) => card(279.4, i, 1212, 'ON HIS OWN CHANNEL', ['RIDING WITHOUT PROTECTION', 'WAS A CHOICE HE MADE OUT LOUD'], 0.5)],
  [284.3, 289.8, 'S36 experienced', (i) => card(284.6, i, 1236.5, 'ANDREY IVANOV', ['"A VERY EXPERIENCED RIDER"'], 0.5)],
  [289.8, 294.065, 'S37 gap to gap', pov(1770)],
  // ---- g6 319.065 - 406.015
  [319.065, 325.1, 'S38 an hour after', (i) => H.map(i, 'c11/map_russia.jpg', CR.map, [{ x: 960, y: 540, label: 'MOSCOW', at: 319.6 }])],
  [325.1, 330.2, 'S39 federal highway', (i) => H.map(i, 'c11/map_moscow.jpg', CR.map, [{ x: 1011, y: 759, label: 'DOMODEDOVO', sub: 'M-4 "DON" SOUTH', at: 327.6 }])],
  [330.2, 335.5, 'S40 km 68', (i) => H.map(i, 'c11/map_m4.jpg', CR.map, [{ x: 1004, y: 643, label: 'KM 68-69', sub: 'M-4 "DON"', at: 330.5 }])],
  [335.5, 340.7, 'S41 reports disagree', (i) => card(335.8, i, 1660, 'THE REPORTS', ['DO NOT AGREE ON WHAT IT WAS'], 0.5)],
  [340.7, 346.7, 'S42 fiat', (i) => card(341.0, i, 1666, 'THE REPORTS', ['POLICE (STARHIT): "A FIAT CAR"', 'TRAFFIC POLICE (360): "A FIAT TRUCK"'], 0.5)],
  [346.7, 351.9, 'S43 gazelle', (i) => card(347.0, i, 1672, 'REGIONAL TV', ['"A GAZELLE VAN"', 'IVANOV: PARKED OR MOVING, NOT CLEAR'], 0.5)],
  [351.9, 357.2, 'S44 145', (i) => card(352.2, i, 1678, 'SPEEDOMETER', ['FROZE AT 145 KM/H', 'ABOUT 90 MPH'], 0.5)],
  [357.2, 362.6, 'S45 33', (i) => card(357.5, i, 1088, 'AGE 33', ['POLICE RELEASED ONLY:', 'A MAN BORN IN 1985'], 0.5)],
  [362.6, 368.5, 'S46 motomoscow', (i) => card(362.9, i, 1126, 'MOTOMOSCOW', ['CONFIRMED IT WAS BOLT', 'AND SENT CONDOLENCES'], 0.5)],
  [368.5, 374.2, 'S47 fort garage', (i) => card(368.8, i, 1146, 'FORT GARAGE (STARHIT)', ['"A LEGENDARY PERSON"'], 0.5)],
  [374.2, 379.7, 'S48 next day', (i) => card(374.5, i, 1172, 'THE NEXT DAY', ['THE FEET-UP CLIP SPREAD,', 'HEADLINES BLAMED A STUNT'], 0.5)],
  [379.7, 385.6, 'S49 kp', (i) => card(380.0, i, 1620, 'KOMSOMOLSKAYA PRAVDA', ['EYEWITNESSES: HE WAS RIDING', 'THAT WAY AT THE TIME'], 0.5)],
  [385.6, 390.0, 'S50 police account', (i) => card(385.9, i, 1688, 'THE POLICE ACCOUNT', ['DOES NOT SAY SO', 'HIS FRIENDS DISPUTE IT'], 0.5)],
  [390.0, 393.9, 'S51 ufa rider', (i) => H.map(i, 'c11/map_ufa.jpg', CR.map, [{ x: 960, y: 540, label: 'UFA', sub: 'FAST MOSCOW HIGHWAYS STILL NEW', at: 390.3 }])],
  [393.9, 400.0, 'S52 no case', (i) => card(394.2, i, 1696, 'NO CRIMINAL CASE REPORTED', ['HIS TEAM KEPT UPLOADING TO MOTO NEXUS', 'UNTIL THE END OF 2019'], 0.5)],
  [400.0, 406.015, 'S53 memorial', (i) => H.clip(i, 'BLT', 1866, {})],
];
export default makeCase({
  id: 'lm_case11', num: 11, title: "BOLT'S LAST RIDE VIDEO",
  plate: ['c11/plate.jpg', 'PHOTO: PENDING'],
  vo: S.vo, raws: RAWS, shots, end: S.end,
});
