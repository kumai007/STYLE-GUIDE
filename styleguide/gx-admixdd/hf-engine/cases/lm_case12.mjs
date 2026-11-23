// lm_case12 - The fuel stop and the farm gate (Alexandra Morgan; Cranbrook, Kent to Westfield, East Sussex). Source WED = Kent+Sussex police film
// (burned-in subtitles: every WED clip/freeze is cropped to the top 80 % by scale 1.25 + top origin). Times = part seconds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H, n } from './lm_lib.mjs';

const SKEL = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'productions', 'last-moments', 'edit', 'skel', 'c12.json'), 'utf8'));
const WEDC = 'FOOTAGE: KENT AND SUSSEX POLICE (OPERATION WEDMORE FILM)';
const RAWS = SKEL.raws.map((r) => ({ tag: r.tag, a: r.a, b: r.b, t: r.t, mute: true, credit: WEDC }));
const C = (s) => `PHOTO: ${s} / CC BY-SA 2.0`;
const CR = { sis: C('N CHADWICK'), cran: C('OAST HOUSE ARCHIVE'), west: C('N CHADWICK'), westch: C('JULIAN P GUFFOGG'), stl: C('JANET RICHARDSON'),
  hast: C('OAST HOUSE ARCHIVE'), hove: C('PAUL GILLETT'), sev: C('DS PUGH'), bright: C('SIMON CAREY') };
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const P = (k) => `c12/${k}.jpg`;

// ---- WED: crop away the burned-in subtitles (top 80 %). CCTV raws keep the top-left stamp (origin 0 0), interviews crop centre-top.
const oClip = H.clip, oFrz = H.frz;
const org = (t) => ((t >= 83.5 && t < 93) || (t >= 119.5 && t < 128) ? '0% 0%' : '50% 0%');
const FORBID = [[0, 16.5], [160, 166.5], [170, 176.5], [222, 230], [234, 242], [132, 136.5]]; // bodycam / flames / mugshot
const used = [];
H.clip = (i, tag, t, o = {}) => {
  if (tag !== 'WED') return oClip(i, tag, t, o);
  const len = o.len ?? 0;
  for (const [a, b] of FORBID) if (t < b && t + len > a) throw new Error(`WED ${t} hits forbidden ${a}-${b}`);
  return [n('Grade', { bri: o.bri ?? 0.95, con: 1.1 },
    n('Cam', { s: o.s ?? [1.0, 1.04] }, n('LClip', { src: 'WED', t, speed: o.speed ?? 1, sw: 1920, sh: 1080, fit: 'cover', scale: 1.25, origin: o.origin ?? org(t), push: [1, 1.03], mos: o.mos }))),
  n('Credit', { text: o.credit ?? WEDC, place: 'tr', inset: 96 }), ...(o.over || [])];
};
H.frz = (i, tag, t, o = {}) => (tag === 'WED' ? oFrz(i, tag, t, { ...o, s: [1.25, 1.25], o: '0% 0%', credit: o.credit ?? WEDC, cp: 'br' }) : oFrz(i, tag, t, o));
const wed = (t, o = {}) => (i, s, L) => {
  const sp = o.speed ?? 1, w = [t, t + L * sp];
  for (const [a, b] of used) if (w[0] < b - 0.2 && w[1] > a + 0.2) throw new Error(`WED window ${w} reuses ${a}-${b}`);
  used.push(w);
  return H.clip(i, 'WED', t, { ...o, len: L * sp });
};

const plan = [];
const S = (start, name, fn) => plan.push([start, name, fn]);
const card = (kick, lines, bg, credit) => (i, s) => H.card(s, bg(i), kick, lines, credit);
const bgp = (k) => (i) => H.bgP(i, P(k));
const bgv = (t) => (i) => H.bgV(i, 'WED', t);
const ph = (k, o = {}) => (i) => H.photo(i, P(k), CR[k], o);

S(5.5, 'S01 white Mini', wed(80.2, { speed: 0.7 }));
S(10.6, 'S02 East Sussex', (i) => H.map(i, P('map_westfield'), MAPC, [{ x: 960, y: 540, label: 'WESTFIELD', sub: 'EAST SUSSEX', at: 11.2 }]));
S(15.8, 'S03 gate stamp 07:58', (i, s) => H.stamp(s, 'WED', 120.8, { x: 40, y: 24, w: 950, h: 62 }));
S(21.9, 'S04 summer 2021', card('IT BEGAN IN', ['SUMMER 2021'], bgv(40)));
S(25.0, 'S05 Sissinghurst', ph('sis', { over: [H.place(25.4, 'SISSINGHURST, KENT', 'NEAR CRANBROOK')] }));
S(30.1, 'S06 senior officer', wed(36.0));
S(35.7, 'S07 Alex photo', wed(28.4, { mos: [{ r: [690, 0, 640, 1000] }] }));
S(40.4, 'S08 St Leonards', ph('stl', { over: [H.date(40.7, '8 JUNE 2021')] }));
S(46.4, 'S09 first meeting', card('THE FIRST MEETING', ['8 JUNE 2021', 'AT HER HOME'], bgv(48)));
S(52.2, 'S10 Little Bridge Farm', ph('west', { over: [H.place(52.8, 'LITTLE BRIDGE FARM', 'WESTFIELD, NORTH OF HASTINGS')] }));
S(58.3, 'S11 seven meetings', card('SEVEN MORE MEETINGS', ['AUGUST AND SEPTEMBER'], bgv(52)));
S(61.5, 'S12 Brown 41', card('MARK BROWN, 41', ['A REMOTE FARM', 'OUTSIDE HASTINGS'], bgv(60)));
S(66.4, 'S13 WhatsApp offer', card('23 OCTOBER 2021', ['WHATSAPP OFFER OF UP TO', '100,000 POUNDS'], bgv(64)));
S(73.6, 'S14 Kent Online', card('KENT ONLINE', ['WEBCAM WORK AT A HOTEL', 'IN BRIGHTON'], bgp('bright')));
S(78.0, 'S15 too good to be true', card('DUNCAN ATKINSON KC, PROSECUTOR', ['"SIMPLY TOO GOOD TO BE TRUE"'], bgv(56)));
S(85.1, 'S16 spa trip', card('SATURDAY 13 NOVEMBER', ['SHE TELLS HER PARENTS SHE IS', 'GOING ON A SPA TRIP TO YORK'], bgv(44)));
S(89.4, 'S17 York map', (i) => H.map(i, P('map_south'), MAPC, [{ x: 889, y: 229, label: 'YORK', sub: 'WHERE SHE SAID SHE WAS GOING', at: 89.9 }]));
S(93.8, 'S18 nobody knew', card('BEFORE SHE LEFT', ['SHE DID SOMETHING', 'NOBODY KNEW'], bgv(68)));
S(96.8, 'S19 rollerblade box', wed(328.0, { speed: 0.6 }));
S(104.2, 'S20 second note pin', wed(360.0));
S(109.3, 'S21 SIM search', card('SUNDAY 14 NOVEMBER 2021', ['SHE SEARCHES ONLINE: CAN A PHONE', 'WITHOUT A SIM BE TRACKED?'], bgv(72)));
S(114.8, 'S22 Cranbrook forecourt', ph('cran', { over: [H.place(115.2, 'CRANBROOK, KENT')] }));
// raw 1 121.03-125.03
S(125.03, 'S23 clock 07:27', (i, s) => H.stamp(s, 'WED', 87.9, { x: 25, y: 58, w: 750, h: 40 }));
S(129.0, 'S24 PA timeline', card('PRESS ASSOCIATION TRIAL TIMELINE', ['ABOUT TWENTY PAST SEVEN'], bgv(76)));
S(134.0, 'S25 Operation Wedmore', card('OPERATION WEDMORE', ['A FILM BY KENT AND SUSSEX POLICE'], bgv(80)));
S(141.7, 'S26 ordinary', (i) => H.frz(i, 'WED', 85.3));
S(146.9, 'S27 shop stamp 07:30', (i, s) => H.stamp(s, 'WED', 89.0, { x: 35, y: 60, w: 740, h: 42 }));
// raw 2 151.755-155.755
S(155.755, 'S28 18 miles', (i) => H.map(i, P('map_route'), MAPC, [{ x: 938, y: 428, label: 'CRANBROOK', at: 156.6 }, { x: 962, y: 647, label: 'WESTFIELD', sub: 'ABOUT 18 MILES', at: 158.8 }]));
S(162.2, 'S29 last contact', ph('westch', { over: [H.place(162.6, 'MOMENTS BEFORE THE FARM')] }));
S(166.2, 'S30 farm camera', wed(112.0));
S(170.0, 'S31 track went nowhere', card('THE SENIOR OFFICER', ['A TRACK THAT "DIDN\'T APPEAR', 'TO GO ANYWHERE"'], bgv(86)));
S(174.3, 'S32 gold Jaguar', (i) => H.frz(i, 'WED', 120.8, { s: [1.3, 1.34] }));
// raw 3 179.195-185.195
S(185.195, 'S33 prosecution case', card('THE PROSECUTION CASE', ['BROWN MURDERED HER', 'AT THE FARM THAT DAY'], bgv(92)));
S(190.2, 'S34 Mini home after midnight', wed(100.0, { speed: 0.55 }));
S(196.9, 'S35 still alive', card('THE PROSECUTION SUGGESTED', ['HE WAS MAKING IT LOOK AS IF', 'SHE WAS STILL ALIVE'], bgv(96)));
S(202.6, 'S36 Sevenoaks skip', ph('sev', { over: [H.place(203.0, 'SEVENOAKS, KENT', 'A BUILDING SITE SKIP')] }));
S(208.7, 'S37 Tuesday farm', card('TUESDAY 16 NOVEMBER', ['BACK AT THE FARM', 'FOR ABOUT FOUR HOURS'], bgv(104)));
S(213.8, 'S38 Wed missing', card('WEDNESDAY 17 NOVEMBER', ['ALEX DOES NOT COME HOME', 'HER MOTHER REPORTS HER MISSING'], bgv(110)));
S(219.5, 'S39 move a car', card('WEDNESDAY EVENING', ['BROWN GETS A FRIEND', 'TO HELP HIM MOVE A CAR'], bgv(116)));
S(224.0, 'S40 Holmhurst Lane', ph('hast', { over: [H.place(224.4, 'HOLMHURST LANE', 'ST LEONARDS-ON-SEA')] }));
S(228.7, 'S41 police start', wed(56.0));
S(232.5, 'S42 car would lead us', wed(95.6, { speed: 0.65 }));
S(238.6, 'S43 camera by camera', wed(104.0, { speed: 0.55 }));
S(245.3, 'S44 23 Nov', card('23 NOVEMBER 2021', ['FOOTAGE FOUND', 'NINE DAYS AFTER SHE DROVE IN'], bgv(124)));
S(249.8, 'S45 never saw her come off', wed(148.0));
S(257.9, 'S46 quarter to nine', card('BROWN TELLS OFFICERS', ['SHE LEFT THE FARM', 'AT ABOUT 08:45'], bgv(140)));
S(264.1, 'S47 phone DNA', wed(136.8));
S(270.1, 'S48 next day boss', card('THE NEXT DAY', ['HE TELLS HIS BOSS', 'HE FACES A CHARGE'], bgv(144)));
S(274.7, 'S49 car key', card('LATER', ['HER CAR KEY', 'IN A CRISP PACKET IN A DIGGER'], bgv(152)));
S(281.5, 'S50 oil drum bag', wed(196.0, { speed: 0.85 }));
S(290.6, 'S51 human bone', wed(252.0));
S(297.1, 'S52 arrested 25 Nov', card('25 NOVEMBER 2021', ['BROWN ARRESTED, "NO COMMENT"', 'CHARGED THREE DAYS LATER'], bgv(156)));
S(304.1, 'S53 rollerblade note', wed(349.0));
S(311.9, 'S54 farm aerial', (i, s, L) => wed(446.0, { speed: 0.9, over: [H.place(312.3, 'LITTLE BRIDGE FARM')] })(i, s, L));
S(314.0, 'S55 trail', wed(400.0));
S(318.7, 'S56 hidden phone', wed(368.0));
S(323.4, 'S57 Leah prescriptions', wed(414.0));
S(328.4, 'S58 Leah photo', wed(424.0, { speed: 0.5, mos: [{ r: [600, 0, 740, 1000] }] }));
S(332.8, 'S59 bank account', wed(468.0));
S(339.0, 'S60 Kent to Sussex', wed(407.0));
S(344.2, 'S61 8 Dec', card('8 DECEMBER 2021', ['LEAH WARE', 'BECOMES A HOMICIDE INQUIRY'], bgv(164)));
S(348.6, 'S62 Jan 2022', card('JANUARY 2022', ['BROWN ARRESTED ON SUSPICION', 'OF LEAH WARE\'S MURDER'], bgv(168)));
S(354.1, 'S63 Hove Crown Court', ph('hove', { over: [H.place(354.5, 'HOVE CROWN COURT', 'TRIAL OPENS OCTOBER 2022')] }));
S(358.1, 'S64 denied', card('BROWN DENIED BOTH MURDERS', ['HE SAID LEAH WAS STILL ALIVE'], bgv(172)));
S(361.6, 'S65 how would I prove', card('HE CLAIMED AN ACCIDENT', ['"HOW WOULD I PROVE SHE', 'HAD AN ACCIDENT?"'], bgv(180)));
S(368.4, 'S66 jury', card('THE JURY', ['TEN MEN AND TWO WOMEN'], bgv(184)));
S(373.7, 'S67 convicted', card('1 DECEMBER 2022', ['CONVICTED OF BOTH MURDERS'], bgv(188)));
S(378.5, 'S68 deliberation', card('SIX-WEEK TRIAL', ['ABOUT 11 HOURS OF DELIBERATION'], bgv(192)));
S(382.7, 'S69 Leah never found', card('LEAH WARE', ['HAS NEVER BEEN FOUND'], bgv(220)));
S(387.3, 'S70 sentencing', card('13 JANUARY 2023', ['MR JUSTICE HILLIARD SENTENCES', 'HIM IN HIS ABSENCE'], bgv(200)));
S(391.0, 'S71 life', card('LIFE IMPRISONMENT', ['MINIMUM 49 YEARS', 'LESS 380 DAYS ON REMAND'], bgv(204)));
S(396.0, 'S72 conscience', card('THE JUDGE SAID', ['HIS CONSCIENCE IS UNTROUBLED', 'BY WHAT HE HAS DONE'], bgv(212)));
S(401.7, 'S73 Alex tribute', wed(380.0, { speed: 0.5, mos: [{ r: [600, 0, 740, 1000] }] }));
S(406.1, 'S74 family tribute', card('LEAH\'S FAMILY', ['"WITHOUT HER, THE TRUTH MAY NOT', 'HAVE BEEN UNCOVERED AS QUICKLY"'], bgv(216)));

const rawStarts = RAWS.map((r) => r.a).sort((x, y) => x - y);
const shots = plan.map(([s, name, fn], k) => {
  const nxt = plan[k + 1]?.[0] ?? SKEL.end;
  const ra = rawStarts.find((a) => a > s + 0.01);
  const e = Math.min(nxt, ra ?? 1e9);
  return [s, +e.toFixed(3), name, (i) => fn(i, s, e - s)];
});

export default makeCase({
  id: 'lm_case12', num: 12, title: 'THE FUEL STOP AND THE FARM GATE',
  plate: [P('cran'), CR.cran],
  vo: SKEL.vo, raws: RAWS, shots, end: SKEL.end,
});
