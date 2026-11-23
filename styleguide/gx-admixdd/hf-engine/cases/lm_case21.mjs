// lm_case21 - case 21 "Donasia Holloway's Snapchat" (SOL14 = 14th Circuit Solicitor's Office video). Builder file (2026-11-23).
import fs from 'node:fs';
import path from 'node:path';
import { makeCase, H, n, MED } from './lm_lib.mjs';
const has = (f) => fs.existsSync(path.join(MED, f));
const SOL = "FOOTAGE: 14TH CIRCUIT SOLICITOR'S OFFICE (SOUTH CAROLINA)";
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const plate = has('c21/plate.jpg') ? ['c21/plate.jpg', 'PHOTO: BEAUFORTTIGER / CC BY-SA 4.0'] : ['c21/map_forest.jpg', MAPC];
// vertical snap panel of SOL14 (x 126-688 of 1920, full height) centred on a blurred copy; hides the solicitor's enlarged caption + arrow
const CL = 'clip-path:inset(0px 1232px 0px 126px)';
const sw = 1920, sh = 1080;
const vp = (i, t, o = {}) => {
  const body = (extra) => (o.frz ? n('Frz', { src: 'SOL14', n: Math.round(t * 60), fit: 'cover' }) : n('LClip', { src: 'SOL14', t, speed: o.speed ?? 1, sw, sh, fit: 'cover', push: [1, 1], ...extra }));
  return [n('Grade', { bri: o.bri ?? 0.95, con: 1.1 },
    n('Cam', { s: [1, 1], tx: [553, 553] }, n('Cam', { s: [3.45, 3.45], o: '407px 540px', css: 'filter:blur(38px) brightness(.4) saturate(.6)' }, n('Cam', { s: [1, 1], css: CL }, body()))),
    n('Cam', { s: [1.0, 1.035], tx: [553, 553] }, n('Cam', { s: [1, 1], css: CL + ';box-shadow:0 0 60px #000' }, body()))),
    n('Credit', { text: SOL, place: 'tr', inset: 96 })];
};
const clipS = (i, t, o = {}) => H.clip(i, 'SOL14', t, { credit: o.credit ?? SOL, ...o });
const Q = (t, bg, kick, lines, cr) => H.card(t, bg, kick, lines, cr);

const part = makeCase({
  id: 'lm_case21', num: 21, title: "DONASIA HOLLOWAY'S SNAPCHAT",
  plate,
  vo: [['vo/c21_p01.wav', 6.0], ['vo/c21_p02.wav', 112.165], ['vo/c21_p03.wav', 144.145], ['vo/c21_p04.wav', 170.515], ['vo/c21_p05.wav', 200.905]],
  raws: [
    { tag: 'SOL14', a: 103.665, b: 111.665, t: 15.5, mute: true, credit: SOL },
    { tag: 'SOL14', a: 137.645, b: 143.645, t: 44.5, mute: true, credit: SOL },
    { tag: 'SOL14', a: 167.015, b: 170.015, t: 62.5, mute: true, credit: SOL },
    { tag: 'SOL14', a: 188.405, b: 200.405, t: 67.6, mute: true, credit: SOL },
  ],
  end: 338.04,
  shots: [
    // ---- A: 5.5 - 103.665
    [5.5, 11.4, 'S01 snap panel', (i) => vp(i, 73.0, { speed: 0.6 })],
    [11.4, 18.7, 'S02 snap freeze', (i) => vp(i, 69.4, { frz: true })],
    [18.7, 25.4, 'S03 name card', (i) => Q(19.0, H.bgP(i, 'c21/map_sc.jpg', 0.45), 'THE VICTIM', ['DONASIA ALEXUS HOLLOWAY', 'AGE 22'], MAPC)],
    [25.4, 32.1, 'S04 walterboro map', (i) => H.map(i, 'c21/map_sc.jpg', MAPC, [{ x: 948, y: 604, label: 'WALTERBORO, SOUTH CAROLINA', at: 25.9 }])],
    [32.1, 37.9, 'S05 jan 2021 card', (i) => Q(32.5, H.bgV(i, 'SOL14', 96), 'JANUARY 2021', ['RELATIONSHIP ENDED', 'JUSTIN COLE CARROLL'], SOL)],
    [37.9, 44.0, 'S06 solicitor', (i) => H.photo(i, 'c21/cityhall.jpg', 'PHOTO: CSPIRES16 / CC BY-SA 4.0')],
    [44.0, 49.2, 'S07 charge', (i) => Q(44.4, H.bgV(i, 'SOL14', 97), 'THE CHARGE', ['DOMESTIC ASSAULT', 'NO-CONTACT ORDER'], SOL)],
    [49.2, 55.5, 'S08 record', (i) => Q(49.6, H.bgV(i, 'SOL14', 98), '2016', ['FIRST-DEGREE ASSAULT', 'AND BATTERY', 'CHARLESTON'], SOL)],
    [55.5, 62.1, 'S09 probation', (i) => Q(55.9, H.bgV(i, 'SOL14', 99), 'PROBATION REVOKED', ['SERVED THREE YEARS', 'RELEASED 2020'], SOL)],
    [62.1, 69.7, 'S10 released', (i) => Q(62.5, H.bgV(i, 'SOL14', 97.5), '2020', ['RELEASED', 'SHORTLY BEFORE THEY MET'], SOL)],
    [69.7, 75.1, 'S11 bail', (i) => Q(70.0, H.bgV(i, 'SOL14', 100), 'MAY 2021', ['OUT ON BAIL', 'DOMESTIC VIOLENCE CHARGE'], SOL)],
    [75.1, 81.4, 'S12 night 22 may', (i) => [...H.photo(i, 'c21/bank.jpg', 'PHOTO: P. HUGHES / CC BY 4.0'), H.date(75.6, 'SATURDAY, 22 MAY 2021')]],
    [81.4, 88.8, 'S13 forest circle', (i) => [...H.map(i, 'c21/map_forest.jpg', MAPC, []), H.place(81.9, 'FOREST POINT APARTMENTS')]],
    [88.8, 95.0, 'S14 turn in', (i) => clipS(i, 106.0, { speed: 0.55, bri: 0.9 })],
    [95.0, 103.665, 'S15 cameras', (i) => clipS(i, 109.5, { speed: 0.55, bri: 0.9 })],
    // ---- B: 111.665 - 137.645
    [111.665, 118.0, 'S16 lexus', (i) => clipS(i, 95.0, { speed: 0.55 })],
    [118.0, 123.1, 'S17 lexus2', (i) => clipS(i, 98.5, { speed: 0.6 })],
    [123.1, 130.0, 'S18 phone', (i) => clipS(i, 168.0, { speed: 0.9 })],
    [130.0, 137.645, 'S19 cam05', (i) => Q(130.4, H.bgV(i, 'SOL14', 41.0), 'CAMERA05', ['A MAN ON FOOT'], SOL)],
    // ---- C: 143.645 - 167.015
    [143.645, 148.2, 'S20 name', (i) => Q(144.0, H.bgP(i, 'c21/plate.jpg', 0.5), 'HER NAME', ['DONASIA'], 'PHOTO: BEAUFORTTIGER / CC BY-SA 4.0')],
    [148.2, 154.5, 'S21 prosecutor', (i) => clipS(i, 201.0, { speed: 0.9, bri: 0.9 })],
    [154.5, 160.8, 'S22 time', (i) => Q(154.8, H.bgV(i, 'SOL14', 15.5), 'THE TIMESTAMPS', ['TRUCK 22:05', 'MAN ON FOOT 20 SECONDS LATER'], SOL)],
    [160.8, 167.015, 'S23 later', (i) => Q(161.2, H.bgV(i, 'SOL14', 17.0), '22:08', ['SAME CAMERA, TWO AND', 'A HALF MINUTES ON'], SOL)],
    // ---- D: 170.015 - 188.405
    [170.015, 173.7, 'S24 filmed', (i) => vp(i, 74.0, { speed: 0.5 })],
    [173.7, 181.4, 'S25 snapchat', (i) => Q(174.1, H.bgV(i, 'SOL14', 176), 'POSTED TO SNAPCHAT', ['ATLANTA BLACK STAR:', 'RECORDING LIVE'], SOL)],
    [181.4, 188.405, 'S26 upright', (i) => vp(i, 70.0, { frz: true })],
    // ---- E: 200.405 - 338.04
    [200.405, 207.5, 'S27 caption', (i) => Q(200.9, H.bgV(i, 'SOL14', 177), 'HER CAPTION', ['FOLLOWED ME TO MY APT', 'AND I SAW HIM BEHIND ME', '& LOCKED MYSELF IN THE CAR.'], SOL)],
    [207.5, 213.5, 'S28 caption2', (i) => Q(207.9, H.bgV(i, 'SOL14', 178), 'HER CAPTION', ['I HAVE ASKED HIM', 'MULTIPLE TIMES TO LEAVE ME ALONE'], SOL)],
    [213.5, 220.3, 'S29 seven minutes', (i) => clipS(i, 181.8, { speed: 0.5 })],
    [220.3, 226.4, 'S30 holes', (i) => clipS(i, 102.0, { speed: 0.6 })],
    [226.4, 230.0, 'S31 lexus', (i) => clipS(i, 100.0, { speed: 0.5 })],
    [230.0, 238.0, 'S32 sergeant', (i) => Q(230.4, H.bgV(i, 'SOL14', 124), 'SERGEANT TAVARA EDWARDS', ['"WHILE EN ROUTE, OFFICERS', 'WERE ADVISED THAT THERE WAS', 'AN UNKNOWN SUBJECT RUNNING', 'FROM THE 300-BUILDING."'], SOL)],
    [238.0, 241.1, 'S33 witnesses', (i) => clipS(i, 126.0, { speed: 0.9 })],
    [241.1, 246.5, 'S34 coroner', (i) => Q(241.5, H.bgV(i, 'SOL14', 129), 'COLLETON COUNTY CORONER', ['RICHARD HARVEY'], SOL)],
    [246.5, 253.3, 'S35 stop', (i) => clipS(i, 135.0, { speed: 0.9 })],
    [253.3, 257.2, 'S36 interview', (i) => clipS(i, 158.0, { speed: 0.8 })],
    [257.2, 261.4, 'S37 wiped', (i) => clipS(i, 141.0, { speed: 0.9 })],
    [261.4, 266.7, 'S38 residue', (i) => Q(261.8, H.bgV(i, 'SOL14', 99.0), 'STATE INVESTIGATORS', ['GUNSHOT RESIDUE', 'ON HIS RIGHT HAND', 'NO WEAPON FOUND'], SOL)],
    [266.7, 273.9, 'S39 phone opened', (i) => clipS(i, 176.0, { speed: 0.8 })],
    [273.9, 281.0, 'S40 arrest', (i) => clipS(i, 185.2, { speed: 0.7, cp: 'br' })],
    [281.0, 286.1, 'S41 trial', (i) => Q(281.4, H.bgV(i, 'SOL14', 262), 'APRIL 2024', ['THREE DAYS OF TRIAL'], SOL)],
    [286.1, 293.7, 'S42 swanson', (i) => clipS(i, 276.0, { speed: 0.9, bri: 0.9 })],
    [293.7, 299.9, 'S43 24', (i) => clipS(i, 264.0, { speed: 0.9 })],
    [299.9, 305.1, 'S44 verdict', (i) => Q(300.3, H.bgV(i, 'SOL14', 266), '24 APRIL 2024', ['GUILTY OF MURDER', 'SENTENCED TO 60 YEARS'], SOL)],
    [305.1, 309.5, 'S45 nocontact', (i) => clipS(i, 270.0, { speed: 0.8 })],
    [309.5, 314.2, 'S46 posted', (i) => clipS(i, 328.0, { speed: 0.8 })],
    [314.2, 320.1, 'S47 dashcam', (i) => clipS(i, 145.5, { speed: 0.85 })],
    [320.1, 322.4, 'S48 hotline', (i) => clipS(i, 321.0, { speed: 0.9, bri: 0.9 })],
    [322.4, 331.8, 'S49 mother', (i) => Q(322.8, H.bgV(i, 'SOL14', 98), 'SHAMEKA HOLLOWAY, TO WCSC', ['"WE HAVE A LIFE SENTENCE', 'OF HEARTACHE AND PAIN THAT WE', 'WILL CARRY FOR THE REST', 'OF OUR LIVES."'], SOL)],
    [331.8, 338.04, 'S50 end', (i) => Q(332.2, H.bgV(i, 'SOL14', 100), 'HER MOTHER', ['"IF HE WOULD HAVE STAYED', 'IN JAIL, OUR DAUGHTER', 'WOULD HAVE BEEN HERE TODAY."'], SOL)],
  ],
});
// raw 4 = vertical snap panel only (cut sheet: crop to x 56-306 of 854; lib clip has no crop, so swap the shot picture here)
const r4 = part.shots.find((s) => s.name === 'R4 SOL14 raw');
r4.el = () => vp(3, 67.6);
export default part;
