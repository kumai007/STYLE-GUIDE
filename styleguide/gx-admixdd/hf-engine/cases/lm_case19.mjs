// lm_case19 - Markeis McGlockton outside the Circle A (Clearwater, Florida). Source PCSO = Pinellas County Sheriff's Office press briefing (room recording).
// PCSOC.mp4 = keyframed crop (960x630) of PCSO src 414-514.05 around the projected CH13 picture; file t = src - 414. NOTHING after src 514 (HARD OUT 8:34) exists in it.
// Podium b-roll uses PCSO src 0..330 only. Times = part seconds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H, n, MED } from './lm_lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const SKEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'productions', 'last-moments', 'edit', 'skel', 'c19.json'), 'utf8'));
const SC = "FOOTAGE: PINELLAS COUNTY SHERIFF'S OFFICE";
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const has = (f) => fs.existsSync(path.join(MED, f));
const CR = { hosp: 'PHOTO: WALTER FROM TAMPA/ST PETERSBURG, FLORIDA / CC BY 2.0', plate: 'PHOTO: CHAD SPARKES FROM KISSIMMEE, FLORIDA / CC BY 2.0' };
try { Object.assign(CR, JSON.parse(fs.readFileSync(path.join(MED, 'c19', 'credits.json'), 'utf8'))); } catch {}

// raws: tag PCSOC, t = skeleton src t - 414. Raw 3 (src 476-502 = file 62-88): soften the customers (woman in pink, man in white), keys in file px.
const bx = (cx, cy, s = 120) => [cx - s / 2, cy - s / 2, s, s];
const RAWS = SKEL.raws.map((r) => ({ tag: 'PCSOC', a: r.a, b: r.b, t: r.t - 414, mute: true, credit: SC }));
RAWS[2].mos = [
  { keys: [[62, ...bx(-400, -400, 150)], [65.6, ...bx(-400, -400, 150)], [66, ...bx(390, 300, 150)], [67.5, ...bx(662, 322, 150)], [68, ...bx(645, 293, 150)], [69, ...bx(855, 200, 150)], [72, ...bx(848, 200, 150)], [81, ...bx(480, 218)], [84, ...bx(420, 225)], [87, ...bx(225, 352)], [88.5, ...bx(200, 370)]] },
  { keys: [[62, ...bx(-400, -400)], [70.6, ...bx(-400, -400)], [71, ...bx(640, 180)], [72, ...bx(640, 180)], [75, ...bx(510, 265)], [78, ...bx(130, 355)], [81, ...bx(90, 335)], [88.5, ...bx(75, 345)]] },
];
const rawStarts = RAWS.map((r) => r.a);

const plan = [];
const S = (start, name, fn) => plan.push([start, name, fn]);
const card = (kick, lines, bg) => (i, s, L) => H.card(s, bg(i, L), kick, lines);
const bc = (t) => (i, L = 8) => H.bgV(i, 'PCSOC', Math.max(0, Math.min(t, 99.5 - L)));   // blurred CCTV backdrop (file t)
const bs = (t) => (i, L = 8) => H.bgV(i, 'PCSO', Math.max(0, Math.min(t, 330 - L)));    // blurred podium backdrop (src t)
const bhosp = (i) => H.bgP(i, 'c19/hospital.jpg');
const bplate = (i) => H.bgP(i, 'c19/plate.jpg');
const bcourt = has('c19/court.jpg') ? (i) => H.bgP(i, 'c19/court.jpg') : bs(150);
let sc = 2; // podium cursor (src s), each window used once
const sher = (L, o = {}) => (i) => { const t = sc; sc += L + 0.5; if (t + L > 330) throw new Error('podium out'); return H.clip(i, 'PCSO', t, { credit: SC, ...o }); };
const frz = (t, o = {}) => (i) => H.frz(i, 'PCSOC', t, { credit: SC, ...o });

// ---- A: intro to the first raw
S(5.5, 'S01 first frame', (i, s, L) => [...H.frz(i, 'PCSOC', 1.0, { credit: SC }), H.date(s + 0.8, 'THURSDAY 19 JULY 2018')]);
S(10.8, 'S02 CH13 lot', (i, s, L) => H.clip(i, 'PCSOC', 53, { credit: SC }));
S(16.6, 'S03 CH13 slow', (i, s, L) => H.clip(i, 'PCSOC', 58.8, { credit: SC, speed: 0.48 }));
S(23.1, 'S04 McGlockton', card('THE MAN IN THE DARK T-SHIRT', ['MARKEIS MCGLOCKTON, 28'], bc(4)));
S(28.6, 'S05 Clearwater map', (i) => H.map(i, 'c19/map_clw.jpg', MAPC, [{ x: 960, y: 540, label: 'CLEARWATER, FLORIDA', sub: 'PINELLAS COUNTY', at: 30.0 }]));
S(34.91, 'S06 born', card('BORN IN CLEARWATER', ['MARCH 1990'], bplate));
S(40.83, 'S07 7-Eleven', card('NIGHT CLERK AT A 7-ELEVEN', ['DAYS AT HOME WITH THE CHILDREN'], bc(30)));
S(44.85, 'S08 Jacobs', card('BRITANY JACOBS', ['TOGETHER SINCE 2009', 'CERTIFIED NURSING ASSISTANT'], bc(8)));
S(51.91, 'S09 children', has('c19/chrysler.jpg')
  ? (i) => H.photo(i, 'c19/chrysler.jpg', CR.chry ?? 'PHOTO: COMMONS', { over: [H.place(52.6, 'THREE YOUNG CHILDREN', 'THE FAMILY CAR: A 2016 CHRYSLER 200')] })
  : card('THREE YOUNG CHILDREN', ['THE FAMILY DRIVES A', '2016 CHRYSLER 200'], bc(14)));
S(58.5, 'S10 Sunset Point', (i) => H.map(i, 'c19/map_sunset.jpg', MAPC, [{ x: 960, y: 540, label: 'SUNSET POINT ROAD', sub: 'CIRCLE A FOOD STORE, UNINCORPORATED PINELLAS COUNTY', at: 59.2 }]));
S(66.33, 'S11 eldest inside', card('THE ELDEST GOES INSIDE', ['HIS PARTNER WAITS IN THE CAR', 'WITH THE TWO YOUNGEST'], bc(20)));
S(72.0, 'S12 disabled space', card('PARKED IN THE DISABLED SPACE', ['NO PLACARD IN THE CAR'], bc(24)));
S(77.09, 'S13 sheriff', sher(5.1));
S(82.17, 'S14 podium', sher(4.0));
S(86.17, 'S14b podium', sher(5.65, { speed: 1 }));
S(91.82, 'S15 stamp 03:28', (i, s) => H.stamp(s, 'PCSOC', 18, { x: 640, y: 22, w: 450, h: 105 }));
S(96.84, 'S16 Tampa Bay Times', card('TAMPA BAY TIMES', ['PUTS THE SHOOTING AT', 'ABOUT HALF PAST THREE'], bc(36)));
// raw 1 103.05-127.05
// ---- B
S(127.05, 'S20 Drejka', (i, s) => [...H.frz(i, 'PCSOC', 31, { credit: SC }), H.label(s + 0.5, 'MICHAEL DREJKA', 'THE MAN FROM THE SUV')]);
S(131.71, 'S21 born', card('BORN 5 AUGUST 1970', ['AGE 47'], bc(6)));
S(135.59, 'S22 Delaware', card('GREW UP IN DELAWARE', ['HIS FATHER A STATE TROOPER', 'IN PINELLAS COUNTY SINCE 2010'], bs(120)));
S(141.33, 'S23 tree trimmer', card('A TREE TRIMMER, NOW RETIRED', ['HELD A CONCEALED CARRY LICENCE'], bc(44)));
S(148.0, 'S24 Salous', card('ABDALLA "ALI" SALOUS', ['OWNER OF THE CIRCLE A', 'FOR ABOUT TWENTY YEARS'], bs(200)));
S(155.5, 'S25 energy drinks', card('A DAILY CUSTOMER', ['ENERGY DRINKS, ALMOST EVERY DAY'], bc(16)));
S(160.1, 'S26 4Runner', frz(12));
S(166.8, 'S27 case record', card('THE CASE RECORD', ['HE WALKS AROUND THE FAMILY\'S CAR', 'LOOKING FOR A PLACARD'], bc(28)));
S(171.04, 'S28 storefront', frz(28));
S(176.5, 'S29 car edge', frz(40, { s: [1.0, 1.04] }));
// raw 2 181.86-208.86
// ---- C
S(208.86, 'S30 gap frame', frz(55));
S(215.5, 'S31 only witnesses', card('WHAT WAS SAID AT THAT WINDOW', ['COMES ONLY FROM THE PEOPLE', 'WHO WERE THERE'], bs(80)));
S(219.53, 'S32 court record', card('THE COURT RECORD', ['DREJKA STARTED THE ARGUMENT'], bc(46)));
S(225.49, 'S33 Kelly', card('RICKY KELLY, TANKER-TRUCK DRIVER', ['PARKED IN THE SAME SPOT MONTHS EARLIER'], bs(30)));
S(230.84, 'S34 Kelly said', card('KELLY SAID', ['DREJKA THREATENED TO SHOOT HIM', 'AND THE OWNER STEPPED IN'], bc(10)));
S(236.42, 'S35 incidents', card('FOUR EARLIER ROAD INCIDENTS', ['2012 TO 2018: NAMED AS THE AGGRESSOR', 'HE DENIED THE ALLEGATIONS'], bs(160)));
S(244.83, 'S36 behind him', card('BEHIND HIM', ['THE LOT GOES ABOUT ITS AFTERNOON'], bc(58)));
S(251.53, 'S37 customers', card('THE CUSTOMERS', ['HAD NOTHING TO DO WITH IT', 'THEIR FACES ARE SOFTENED'], bs(240)));
// raw 3 256.44-282.44
// ---- D
S(282.44, 'S40 inside', card('INSIDE THE STORE', ['WITH HIS SON'], bc(62)));
S(286.89, 'S41 customer tells', card('A CUSTOMER TELLS HIM', ['SOMEONE IS SHOUTING', 'AT HIS GIRLFRIEND OUTSIDE'], bs(100)));
S(290.73, 'S42 door', frz(78));
S(296.58, 'S43 end of footage', card('THE SHERIFF\'S FOOTAGE', ['STOPS HERE'], bc(90)));
// raw 4 300.095-312.095  (HARD OUT src 514)
// ---- E: aftermath, no footage of the event
S(312.095, 'S50 stay away', card('HIS PARTNER SAID HE TOLD DREJKA', ['"STAY AWAY FROM MY GIRL"'], bc(95)));
S(319.42, 'S51 fell', card('DREJKA FELL TO THE PAVEMENT', [], bs(130)));
S(323.21, 'S52 three seconds', card('ABOUT THREE SECONDS LATER', ['STILL ON THE GROUND, DREJKA', 'DREW A PISTOL'], bc(98)));
S(328.41, 'S53 one shot', card('DREJKA FIRED ONCE', ['MCGLOCKTON HAD STEPPED BACK', 'AND BEGUN TO TURN'], bs(140)));
S(333.41, 'S54 ran inside', card('HE RAN BACK INSIDE', ['TO WHERE HIS SON WAS'], bc(97)));
S(337.95, 'S55 paramedics', card('PARAMEDICS', ['ABOUT 19 MINUTES AFTER THE SHOT'], bs(170)));
S(341.12, 'S56 Morton Plant', (i) => H.photo(i, 'c19/hospital.jpg', CR.hosp, { over: [H.place(341.8, 'MORTON PLANT HOSPITAL', 'CLEARWATER, FLORIDA')] }));
S(346.2, 'S57 4:04', card('4:04 PM', ['HE DIES AT THE HOSPITAL'], bhosp));
S(350.39, 'S58 Gualtieri', (i, s) => [...sher(5.5)(i), H.label(s + 0.5, 'SHERIFF BOB GUALTIERI', 'PINELLAS COUNTY')]);
S(355.9, 'S59 stand your ground', card('STAND-YOUR-GROUND LAW', ['NO DUTY TO RETREAT', 'IF YOU FEAR GREAT HARM'], bs(210)));
S(363.15, 'S60 quote', card('SHERIFF GUALTIERI', ['"JUST BECAUSE YOU CAN,', 'DOESN\'T MEAN YOU SHOULD"'], bs(250)));
S(367.07, 'S61 six hours', card('SIX HOURS WITH DETECTIVES', ['HE SAID HE FEARED BEING HURT'], bc(94)));
S(372.5, 'S62 stayed still', card('HE SAID HE WOULD NOT HAVE FIRED', ['IF MCGLOCKTON HAD STAYED STILL', 'OR BACKED AWAY'], bs(60)));
S(378.45, 'S63 re-enacted', sher(3.6));
S(382.03, 'S64 1 August', card('1 AUGUST 2018', ['THE CASE GOES TO', 'STATE ATTORNEY BERNIE MCCABE'], bcourt));
S(385.8, 'S65 10 August', card('10 AUGUST', ['A DETECTIVE RECOMMENDS', 'MANSLAUGHTER'], bc(92)));
S(389.22, 'S66 13 August', card('13 AUGUST 2018', ['ONE COUNT OF MANSLAUGHTER'], bcourt));
S(393.5, 'S67 announced', card('THE NEXT DAY', ['THE STATE ATTORNEY\'S OFFICE', 'ANNOUNCES THE CHARGE'], bs(20)));
S(397.75, 'S68 retellings', card('SOME RETELLINGS SAY', ['HE ESCAPED A MURDER CHARGE'], bc(96)));
S(400.96, 'S69 in fact', card('IN FACT', ['NO CHARGE FOR ALMOST FOUR WEEKS', 'THEN MANSLAUGHTER'], bs(280)));
S(408.62, 'S70 not guilty', card('HE PLEADS NOT GUILTY', ['17 AUGUST 2018'], bcourt));
S(412.0, 'S71 children', card('THREE YOUNG CHILDREN', ['A FOURTH ANNOUNCED BEFORE', 'THE END OF THE YEAR'], bc(99)));
S(417.52, 'S72 trial', has('c19/court.jpg')
  ? (i) => H.photo(i, 'c19/court.jpg', CR.court ?? 'PHOTO: COMMONS', { over: [H.date(417.9, 'THE TRIAL, AUGUST 2019')] })
  : card('THE TRIAL', ['AUGUST 2019'], bs(30)));
S(423.24, 'S73 jurors', card('THE SIX JURORS', ['PLAYED THE STORE VIDEO', 'MANY TIMES'], bc(97)));
S(427.06, 'S74 question', card('THE QUESTION BEFORE THEM', ['A MAN ALREADY ON THE GROUND,', 'FACING SOMEONE BACKING AWAY:', 'THE RIGHT TO FIRE?'], bs(300)));
S(434.0, 'S75 jury note', card('A NOTE FROM THE JURY', ['CONFUSED BY FLORIDA\'S', 'SELF-DEFENSE LAW'], bcourt));
S(439.04, 'S76 verdict', card('23 AUGUST 2019', ['GUILTY OF MANSLAUGHTER', 'WITH A FIREARM'], bc(98)));
S(446.32, 'S77 sentenced', card('10 OCTOBER 2019', ['SENTENCED TO 20 YEARS', 'OUT OF A POSSIBLE 30'], bs(15)));
S(453.0, 'S78 Bulone', card('JUDGE JOSEPH BULONE', ['CITES HIS COOPERATION AND', 'NO PRIOR CONVICTIONS'], bcourt));
S(457.6, 'S79 wannabe', card('"WANNABE COP AND TOUGH GUY"', [], bs(110)));
S(461.58, 'S80 mother', card('MONICA MOORE-ROBINSON', ['"BECAUSE OF YOU, MICHAEL DREJKA,', 'MY SON IS NOW A MEMORY"'], bc(95)));
S(469.4, 'S81 appeal', has('c19/dca.jpg')
  ? (i) => H.photo(i, 'c19/dca.jpg', CR.dca ?? 'PHOTO: COMMONS', { over: [H.date(469.8, 'DECEMBER 2021')] })
  : card('DECEMBER 2021', ['SECOND DISTRICT COURT OF APPEAL', 'UPHOLDS THE CONVICTION AND SENTENCE'], bs(170)));

const shots = plan.map(([s, name, fn], k) => {
  const nxt = plan[k + 1]?.[0] ?? SKEL.end;
  const ra = rawStarts.find((a) => a > s + 0.01);
  const e = Math.min(nxt, ra ?? 1e9);
  return [s, +e.toFixed(3), name, (i) => fn(i, s, e - s)];
});

export default makeCase({
  id: 'lm_case19', num: 19, title: 'MARKEIS MCGLOCKTON OUTSIDE THE CIRCLE A',
  plate: ['c19/plate.jpg', CR.plate],
  vo: SKEL.vo, raws: RAWS, shots, end: SKEL.end,
});
