// lm_case13 - Emily Hartridge's last upload (Battersea, London). EMH raw is age-locked: raws [] and the two raw windows are
// covered with EMHET (Entertainment Tonight news excerpt of her attic video, ET bug visible). Table-driven via lm_lib.
import fs from 'node:fs';
import { makeCase, H } from './lm_lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c13.json', import.meta.url), 'utf8'));
const FC = 'FOOTAGE: EMILY HARTRIDGE (YOUTUBE) VIA ENTERTAINMENT TONIGHT';
const MP = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const PH = (a) => `PHOTO: ${a} / CC BY-SA 2.0`;
const ETS = [1, 2.5, 4, 5.5, 63.3, 64.5, 72.5, 74, 75.5, 77, 78.5, 80, 81];
const near = (t) => { const w = t < 30 ? ETS.slice(0, 4) : ETS.slice(6); return w.reduce((a, b) => (Math.abs(b - t) < Math.abs(a - t) ? b : a)); };
const bv = (i, t, bri) => H.bgP(i, `c13/et_${near(t >= 60 && t < 72 ? 64.5 : t)}.jpg`, bri ?? 0.5);
const cv = (t, i, bt, kick, lines, bri) => H.card(t, bv(i, bt, bri ?? 0.5), kick, lines);
const cp = (t, i, f, kick, lines, bri) => H.card(t, H.bgP(i, `c13/${f}.jpg`, bri ?? 0.5), kick, lines);
const ph = (f, a, o) => (i) => H.photo(i, `c13/${f}.jpg`, PH(a), o);
const shots = [
  [5.5, 9.9, 'S01 attic', (i) => H.frz(i, 'EMHET', 63.3, { credit: FC })],
  [9.9, 14.3, 'S02 sloped ceiling', (i) => H.frz(i, 'EMHET', 64.6, {})],
  [14.3, 18.34, 'S03 print', (i) => cv(14.5, i, 63.3, 'THE PRINT BEHIND HER', ['"ALWAYS BE KIND"'], 0.45)],
  [18.34, 24.3, 'S04 fingers', (i) => H.frz(i, 'EMHET', 6.5, {})],
  [24.3, 28.56, 'S05 hambledon', (i) => H.photo(i, 'c13/3873798.jpg', PH('PETER FACEY'), { over: [H.place(26.8, 'HAMBLEDON', 'HAMPSHIRE · BORN 25 MAY 1984')] })],
  [28.56, 32.58, 'S06 2012', (i) => cp(28.8, i, '3874295', '2012', ['THE FORMAT:', '"10 REASONS WHY"'])],
  [32.58, 40.44, 'S07 huffpost', (i) => cv(32.8, i, 2, 'HUFFPOST UK', ['"EVERYTHING IN THE WORLD CAN BE', 'EXPLAINED WITH 10 REASONS."'])],
  [40.44, 45.36, 'S08 weekly', (i) => cv(40.7, i, 73, 'EVERY WEEK', ['10 QUICK, CHEEKY REASONS'])],
  [45.36, 51.82, 'S09 subjects', (i) => cv(45.6, i, 78, 'THE SUBJECTS', ['RELATIONSHIPS · DATING', 'GENDER · MODERN LIFE'])],
  [51.82, 58.52, 'S10 personal', (i) => cv(52.1, i, 5, 'LATER, MORE PERSONAL', ['MENTAL HEALTH', 'FREEZING HER EGGS'])],
  [58.52, 64.14, 'S11 channel4', (i) => cp(58.8, i, '2994706', 'CHANNEL 4', ['HER OWN SERIES', 'ABOUT TURNING THIRTY'])],
  [64.14, 71.32, 'S12 2019', (i) => cv(64.4, i, 80, 'BY 2019', ['340,000+ SUBSCRIBERS', '100 MILLION+ VIEWS'])],
  [71.32, 77.1, 'S13 birthday', (i) => H.photo(i, 'c13/3417859.jpg', PH('DAVID P HOWARD'), { over: [H.date(71.6, 'MAY 2019 · SHE TURNS 35')] })],
  [77.1, 82.18, 'S14 scooters', (i) => cv(77.4, i, 7, 'HER BIRTHDAY', ['TWO SCOOTERS,', 'ONE ELECTRIC'])],
  [82.18, 86.34, 'S15 battersea map', (i) => H.map(i, 'c13/map_battersea.jpg', MP, [{ x: 960, y: 529, label: 'BATTERSEA', sub: 'SOUTH LONDON', size: 34, at: 82.5 }])],
  [86.34, 90.8, 'S16a illegal', (i) => cv(86.6, i, 74, 'AT THE TIME', ['PRIVATE E-SCOOTERS WERE', 'ILLEGAL ON PUBLIC ROADS'])],
  [90.8, 94.42, 'S16b pavements', ph('5627306', 'BEN BROOKSBANK')],
  [94.42, 101.12, 'S17 plan', (i) => cp(94.7, i, '5627289', 'ACCORDING TO HUFFPOST UK', ['MOVE IN TOGETHER', 'FRIDAY 12 JULY'])],
  [101.12, 105.6, 'S18 early', (i) => cv(101.4, i, 81, 'HE MOVES IN', ['FOUR DAYS EARLY'])],
  [105.6, 110.0, 'S19 four nights', (i) => cv(105.9, i, 3, 'HIS WORDS', ['"FOUR NIGHTS LIVING WITH EMILY,', 'WHICH I\'LL CHERISH FOREVER."'])],
  [110.0, 114.24, 'S20 monday', (i) => H.frz(i, 'EMHET', 80, { over: [H.date(110.3, 'MONDAY 8 JULY 2019')] })],
  [114.24, 120.04, 'S21 title', (i) => cv(114.5, i, 78.5, 'HER NEW VIDEO', ['"10 REASONS TO GET', 'A YOUNGER BOYFRIEND"'])],
  [120.04, 126.06, 'S22 seven years', (i) => cv(120.3, i, 62.8, 'SEVEN YEARS OF THE SAME FORMAT', ['10 REASONS, COUNTED OFF', 'ONE AT A TIME'])],
  [126.06, 130.69, 'S23 minute and half', (i) => H.frz(i, 'EMHET', 6.0, { over: [H.date(126.4, 'ABOUT 1:30 IN')] })],
  [130.69, 135.5, 'S24 emh a', (i) => H.clip(i, 'EMHET', 0, { credit: FC })],
  [135.5, 140.69, 'S25 emh b', (i) => H.clip(i, 'EMHET', 72, { credit: FC })],
  [140.69, 147.22, 'S26 four days', (i) => cv(140.9, i, 4, 'POSTED', ['FOUR DAYS BEFORE THE CRASH'])],
  [147.22, 150.69, 'S27 views', (i) => cv(147.4, i, 75.5, 'VIEWS', ['ABOUT 844,000'])],
  [150.69, 154.31, 'S28 scooters', (i) => cv(150.9, i, 76.5, 'REPORTS SAY', ['SHE RECEIVES THE TWO SCOOTERS'])],
  [154.31, 158.25, 'S29 electric', ph('1821850', 'JOHN SALMON')],
  [158.25, 163.0, 'S30 age-restricted', (i) => cv(158.5, i, 81.5, 'AGE-RESTRICTED', ['ONLY HER TO-CAMERA PARTS', 'ARE SHOWN'])],
  [163.0, 167.925, 'S31 one finger', (i) => H.frz(i, 'EMHET', 5.4, {})],
  [167.925, 171.9, 'S32 emh c', (i) => H.clip(i, 'EMHET', 3.4, { credit: FC })],
  [171.9, 176.925, 'S33 emh d', (i) => H.clip(i, 'EMHET', 77.2, { credit: FC })],
  [176.925, 181.81, 'S34 friday', (i) => H.photo(i, 'c13/2324151.jpg', PH('THOMAS NUGENT'), { over: [H.date(177.4, 'FRIDAY 12 JULY 2019')] })],
  [181.81, 188.49, 'S35 move-in day', (i) => cp(182.1, i, '3993030', 'MOVE-IN DAY', ['THE DAY HE WAS FIRST', 'DUE TO MOVE IN'])],
  [188.49, 191.77, 'S36 824', (i) => cp(188.7, i, '5627306', '8.24 AM', ['SHE TEXTS HIM A JOKE'])],
  [191.77, 195.06, 'S37 text', (i) => cp(192.0, i, '2753798', 'HER MESSAGE', ['"LESS OF THE EARLY-MORNING', 'KISSES ON THE LIPS?"'])],
  [195.06, 198.71, 'S38 last message', (i) => cv(195.3, i, 77.5, 'HER LAST MESSAGE TO HIM', ['SENT AT 8.24 AM'])],
  [198.71, 204.34, 'S39 clinic', ph('5627289', 'BEN BROOKSBANK')],
  [204.34, 209.8, 'S40 queens circus', (i) => H.photo(i, 'c13/2994902.jpg', PH('PAUL GILLETT'), { over: [H.place(206.0, 'QUEEN\'S CIRCUS', 'BATTERSEA · SOUTH OF CHELSEA BRIDGE')] })],
  [209.8, 215.59, 'S41 map', (i) => H.map(i, 'c13/map_qc.jpg', MP, [{ x: 1075, y: 215, label: 'CHELSEA BRIDGE', size: 30, at: 210.0 }, { x: 1040, y: 800, label: 'QUEEN\'S CIRCUS', sub: 'LESS THAN HALF A MILE FROM HOME', size: 30, at: 212.6 }])],
  [215.59, 222.27, 'S42 hatch', (i) => H.photo(i, 'c13/1261245.jpg', PH('PAUL FARMER'), { over: [H.place(215.9, 'QUEENSTOWN ROAD', 'DAILY MAIL REPORT OF THE INQUEST')] })],
  [222.27, 228.72, 'S43 quiet', ph('7539265', 'DS PUGH')],
  [228.72, 235.94, 'S44 rebuilt', (i) => cp(229.0, i, '2753798', '2015', ['LONDON\'S FIRST ROUNDABOUT', 'SEPARATING CYCLISTS FROM TRAFFIC'])],
  [235.94, 242.85, 'S45 cs8', (i) => cp(236.2, i, '2324151', 'CYCLE SUPERHIGHWAY 8', ['JULY 2018: A CYCLIST DIED HERE', 'IN A COLLISION WITH A BIN LORRY'])],
  [242.85, 247.54, 'S46 midmorning', (i) => cp(243.1, i, '3993030', 'BY MID-MORNING', ['NO ONE HAD HEARD FROM HER'])],
  [247.54, 252.84, 'S47 aeroplane', (i) => cp(247.8, i, '3417859', 'AEROPLANE MODE', ['SHE USUALLY KEPT HER', 'PHONE ON IT'])],
  [252.84, 256.25, 'S48 calls', (i) => cp(253.1, i, '1261245', 'HE CALLS', ['THE CLINIC · HER FAMILY', 'THE HOSPITALS · THE POLICE'])],
  [256.25, 260.56, 'S49 roads closed', ph('2994706', 'PAUL GILLETT')],
  [260.56, 265.19, 'S50 davina', (i) => cv(260.8, i, 83, 'TRIBUTES', ['TV PRESENTER', 'DAVINA MCCALL'])],
  [265.19, 269.0, 'S51 next day', (i) => cv(265.4, i, 2.5, 'THE NEXT DAY', ['HER FAMILY POSTS', 'ON HER INSTAGRAM'])],
  [269.0, 273.56, 'S52 special', (i) => cv(269.2, i, 66, 'THE POST', ['SHE WAS A', '"VERY SPECIAL PERSON"'])],
  [273.56, 277.87, 'S53 horrible', (i) => cv(273.8, i, 72.5, 'THE POST BEGAN', ['"THIS IS A HORRIBLE THING', 'TO HAVE TO SAY OVER INSTAGRAM."'])],
  [277.87, 281.52, 'S54 boyfriend', (i) => cv(278.1, i, 79, 'HER BOYFRIEND', ['"THE MOST BEAUTIFUL PERSON', 'I\'VE EVER MET"'])],
  [281.52, 287.41, 'S55 charity', (i) => cp(281.8, i, '3874295', 'HER SISTER CHARLOTTE', ['THE FAMILY HOPES TO SET UP', 'A CHARITY IN HER NAME'])],
  [287.41, 291.11, 'S56 hole', (i) => cp(287.6, i, '3873798', 'HER SISTER CHARLOTTE', ['"A BIT OF AN', 'EMILY-SHAPED HOLE NOW."'])],
  [291.11, 296.61, 'S57 worldwide', (i) => cp(291.4, i, '2994902', 'REPORTED AROUND THE WORLD', ['CNN · THE GUARDIAN', 'THE TIMES (OBITUARY)'])],
  [296.61, 302.38, 'S58 first', (i) => cp(296.9, i, '1821850', 'BELIEVED TO BE', ['THE UK\'S FIRST E-SCOOTER', 'COLLISION DEATH'])],
  [302.38, 306.49, 'S59 minister', (i) => cp(302.6, i, '7539265', 'WITHIN DAYS', ['TRANSPORT MINISTER', 'MICHAEL ELLIS MEETS RETAILERS'])],
  [306.49, 309.55, 'S60 firms', (i) => cp(306.7, i, '4163828', 'AND HIRE FIRMS', ['HALFORDS · LIME · BIRD'])],
  [309.55, 315.25, 'S61 reminder', (i) => cp(309.8, i, '5627289', 'THE REMINDER', ['PRIVATE E-SCOOTERS ARE AGAINST', 'THE LAW ON ROADS AND PAVEMENTS'])],
  [315.25, 320.17, 'S62 court', (i) => H.photo(i, 'c13/4895267.jpg', PH('CHRISTINE MATTHEWS'), { over: [H.place(315.5, 'WESTMINSTER CORONER\'S COURT', 'INQUEST · SEPTEMBER 2020')] })],
  [320.17, 324.75, 'S63 coroner', (i) => cp(320.4, i, '4895267', 'SENIOR CORONER FIONA WILCOX', ['ACCIDENTAL DEATH'])],
  [324.75, 330.86, 'S64 finding', (i) => cp(325.0, i, '1261245', 'THE FINDING', ['"UNSUITABLY DRIVEN, TOO FAST', 'AND WITH AN UNDERINFLATED TYRE"'])],
  [330.86, 336.0, 'S65 control', (i) => cp(331.1, i, '5627306', 'THE CAUSE', ['SHE LOST CONTROL', 'HER BOYFRIEND BLAMES NO ONE'])],
  [336.0, 340.36, 'S66 trials', (i) => cp(336.3, i, '2994706', 'BY THEN', ['RENTAL E-SCOOTER TRIALS', 'HAD BEGUN'])],
  [340.36, 345.54, 'S67 barred', (i) => cp(340.6, i, '7539265', 'PRIVATE E-SCOOTERS', ['STILL BARRED FROM', 'PUBLIC ROADS'])],
  [345.54, S.end, 'S68 never again', (i) => H.frz(i, 'EMHET', 81.2, { over: [H.date(345.8, 'LAST UPLOAD · 8 JULY 2019')] })],
];
export default makeCase({ id: 'lm_case13', num: 13, title: S.name, plate: ['c13/4163828.jpg', PH('PETER MCDERMOTT')], vo: S.vo, raws: [], shots, end: S.end });
