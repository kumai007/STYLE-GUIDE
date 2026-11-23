// lm_case03 - The last meet-and-greet (Orlando, source CGF). Built with lm_lib; times = part seconds.
// p04 is shifted +1.0 s (2 s of silence after raw 3); raw 3 is cut at source 54.5 (part 266.79). Own audio of the raws is added after makeCase.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H, MED } from './lm_lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const SKEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'productions', 'last-moments', 'edit', 'skel', 'c03.json'), 'utf8'));
// lead 2026-11-23: +60/+45 px margin (fan profile showed beside the box at part 247 s)
const FAN = JSON.parse(fs.readFileSync(path.join(MED, 'c03', 'mos_fan.json'), 'utf8')).map(([t, x, y, w, h]) => [t, Math.max(0, x - 60), Math.max(0, y - 45), Math.min(720 - Math.max(0, x - 60), w + 120), h + 90]);
const BYST = [[35, 0, 0, 230, 220], [36, 60, 0, 200, 200], [37.5, 80, 10, 200, 200], [39.1, 80, 10, 200, 200], [39.3, 0, 0, 1, 1]];
// lead 2026-11-23: woman at the right edge, raw 3 source 33-37.5 (profile showed unblurred at part 247 s)
const RW = [[33, 540, 0, 180, 360], [37.5, 540, 0, 180, 360], [37.6, 0, 0, 1, 1]];
// lead QC 2026-11-23 on true CGF frames (rendered part showed these uncovered): man in grey tee top-left, fan close-up profile
const MAN3 = [[36.9, 0, 0, 1, 1], [37.0, 130, 0, 170, 160], [37.4, 130, 0, 170, 160], [37.8, 50, 0, 170, 170], [38.3, 0, 40, 150, 190], [38.7, 0, 40, 130, 190], [38.8, 0, 0, 1, 1]];
const FIX3 = [[50.6, 0, 0, 1, 1], [50.65, 250, 90, 360, 420], [51.0, 180, 90, 450, 520], [51.2, 90, 90, 550, 600], [51.3, 0, 100, 620, 620], [51.4, 0, 150, 560, 570], [51.6, 0, 250, 440, 470], [51.9, 0, 250, 400, 470], [52.0, 0, 0, 1, 1]];
const END = +(SKEL.end + 1.0).toFixed(3);
const VO = SKEL.vo.map(([f, s], k) => [f, k === 3 ? +(s + 1.0).toFixed(3) : s]);
const RAWS = SKEL.raws.map((r, j) => ({ tag: r.tag, a: r.a, b: j === 2 ? +(r.a + 21.5).toFixed(3) : r.b, t: r.t, mute: true,
  mos: j === 2 ? [{ keys: FAN }, { keys: BYST }, { keys: RW }, { keys: MAN3 }, { keys: FIX3 }] : [{ keys: FAN }], credit: j === 0 ? 'FOOTAGE: FAN PHONE VIDEO, THE PLAZA LIVE, 10 JUNE 2016' : undefined }));
const RAWB = RAWS[2].b; // 266.79

const P = (k) => `c03/${k}.jpg`;
const has = (k) => fs.existsSync(path.join(MED, P(k)));
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const HIG = 'PHOTO: JUSTIN HIGUCHI FROM LOS ANGELES, CA, USA / CC BY 2.0';
const CR = { cg_a: HIG, cg_b: HIG, cg_c: HIG, plaza_live: 'PHOTO: JERRICASCHWARTZ / CC BY-SA 3.0', stars_dance: 'PHOTO: LISA BJORHEIM / CC BY-SA 2.0',
  voice_levine: 'PHOTO: MINGLE MEDIA TV / CC BY-SA 2.0', sheeran: 'PHOTO: DREW DE F FAWKES / CC BY 2.0', wojcicki: 'PHOTO: ANTHONY QUINTANO FROM MOUNT LAUREL, UNITED STATES / CC BY 2.0',
  e3_2016: 'PHOTO: TOFUPROD / CC BY-SA 2.0', ormc: 'PHOTO: VOA / PUBLIC DOMAIN', amway: 'PHOTO: MICHAEL RIVERA / CC BY-SA 4.0', pulse_memorial: 'PHOTO: DANNEL MALLOY / CC BY 2.0',
  medford: 'PHOTO: MR. MATT / CC BY 4.0', orlando_eola: 'PHOTO: DOCTORDOTDJ / CC BY-SA 4.0', map_orlando: MAPC, map_fl: MAPC, map_nj: MAPC };
const bgk = (k, fb = 'cg_a') => (has(k) ? k : fb);

const plan = [];
const S = (start, name, fn) => plan.push([start, name, fn]);
// card on a blurred real photo
const cd = (bg, kick, lines, fb) => (i, s) => { const k = bgk(bg, fb); return H.card(s, H.bgP(i, P(k)), kick, lines, CR[k]); };
const ph = (k, o = {}) => (i) => H.photo(i, P(k), CR[k], o);
// real photo when downloaded, else a card on a fallback photo
const phOr = (k, o, kick, lines, fb = 'cg_b') => (i, s) => (has(k) ? H.photo(i, P(k), CR[k], o(s)) : H.card(s, H.bgP(i, P(fb)), kick, lines, CR[fb]));
const clip = (t, sp, extra = {}) => (i) => H.clip(i, 'CGF', t, { speed: sp, mos: [{ keys: FAN }], ...extra });

// ---------- p01 (6.0 - 164.3)
S(5.5, 'S01 corridor', clip(43.0, 0.6));
S(11.84, 'S02 lamp + exit sign', clip(25.0, 0.7));
S(18.77, 'S03 smiling turn', clip(51.5, 0.7));
S(22.36, 'S04 Orlando map', (i) => [...H.map(i, P('map_orlando'), MAPC, [{ x: 960, y: 540, label: 'ORLANDO, FLORIDA', sub: 'THE PLAZA LIVE', at: 25.5 }]), H.date(23.0, 'FRIDAY 10 JUNE 2016')]);
S(27.36, 'S05 webcam at home', cd('cg_b', 'SEVEN YEARS EARLIER', ['A WEBCAM, A PIANO', 'HOME IN NEW JERSEY']));
S(34.30, 'S06 born Marlton', (i) => H.map(i, P('map_nj'), MAPC, [{ x: 944, y: 529, label: 'MARLTON, NEW JERSEY', sub: 'BORN 12 MARCH 1994', at: 38.9 }]));
S(40.76, 'S07 ZeldaXLove64', cd('cg_a', 'YOUTUBE, 2009', ['ZELDAXLOVE64']));
S(46.73, 'S08 first cover', cd('cg_b', 'FIRST COVER', ['A HANNAH MONTANA SONG', '"DON\'T WANNA BE TORN"']));
S(50.05, 'S09 Party in the USA', ph('cg_c', { pos: '50% 35%' }));
S(55.95, 'S10 2011 second to Gomez', cd('cg_a', '2011', ['SECOND IN A YOUTUBE COMPETITION', 'BEHIND SELENA GOMEZ']));
S(60.53, 'S11 manager', cd('cg_b', 'MANAGER', ['MANDY TEEFEY', 'SELENA GOMEZ\'S MOTHER']));
S(64.47, 'S12 EP Find Me', cd('cg_c', 'EP "FIND ME"', ['DEBUTED AT NO. 35', 'ON THE BILLBOARD 200']));
S(70.56, 'S13 million subscribers', (i) => H.photo(i, P('cg_a'), CR.cg_a, { pos: '40% 40%', over: [H.date(75.0, 'AUGUST 2013')] }));
S(77.20, 'S14 Stars Dance Tour', ph('stars_dance', { pos: '50% 40%' }));
S(81.70, 'S15 Voice blind auditions', (i) => H.photo(i, P('voice_levine'), CR.voice_levine, { pos: '50% 35%', over: [H.date(82.0, '24 FEBRUARY 2014')] }));
S(87.05, 'S16 four chairs', cd('voice_levine', 'THE VOICE, SEASON 6', ['ALL FOUR COACHES TURNED']));
S(91.28, 'S17 coaches', cd('cg_c', 'THE COACHES SAID', ['USHER: "A BABY CELINE DION"', 'SHAKIRA: "OUT OF THIS WORLD"']));
S(97.62, 'S18 Team Adam', cd('voice_levine', 'TEAM ADAM LEVINE', ['"POTENTIAL TO BE A HUGE STAR"']));
S(102.41, 'S19 finale Sheeran', ph('sheeran', { pos: '50% 45%' }));
S(106.00, 'S20 third place', cd('sheeran', 'THE VOICE, SEASON 6', ['THIRD PLACE', 'BEHIND JOSH KAUFMAN AND JAKE WORTHINGTON']));
S(109.27, 'S21 off stage', ph('cg_b', { pos: '45% 30%' }));
S(116.25, 'S22 222 Records', cd('sheeran', '222 RECORDS', ['ADAM LEVINE\'S OWN LABEL']));
S(120.91, 'S23 Island Records', cd('cg_a', 'ISLAND RECORDS', ['SIGNED, THEN DROPPED']));
S(124.72, 'S24 March 2015', cd('cg_c', 'MARCH 2015', ['DROPPED BY THE LABEL', 'BACK TO RELEASING ON HER OWN']));
S(128.97, 'S25 Side A', cd('cg_b', 'SIDE A', ['EP, FEBRUARY 2016']));
S(133.05, 'S26 summer tour', ph('cg_a', { pos: '60% 40%' }));
S(140.09, 'S27 Plaza Live', (i) => H.photo(i, P('plaza_live'), CR.plaza_live, { pos: '50% 50%', over: [H.place(141.0, 'THE PLAZA LIVE', 'ORLANDO, FLORIDA')] }));
S(144.21, 'S28 set finished', cd('plaza_live', 'SET FINISHED', ['ABOUT 10 P.M.', 'ACCORDING TO ORLANDO POLICE']));
S(148.44, 'S29 meet and greet', ph('cg_c', { pos: '50% 60%' }));
S(154.04, 'S30 merch table', cd('cg_b', 'THE MERCH TABLE', ['HER BROTHER MARCUS', 'WORKING NEARBY']));
S(157.59, 'S31 one fan filming', cd('plaza_live', 'ONE FAN IN THE LINE', ['FILMING ON A PHONE', 'THE CLIP OPENS ON A HUG']));
// ---------- raw 1 164.615 - 182.615
S(182.615, 'S32 drove three hours', cd('cg_a', 'THE FAN', ['DROVE ABOUT THREE HOURS', 'TO BE THERE']));
S(186.72, 'S33 filmer never identified', cd('plaza_live', 'THE FILMER', ['NEVER IDENTIFIED', 'NAME NEVER MADE PUBLIC']));
S(191.86, 'S34 shared online', cd('cg_b', 'AFTER THAT NIGHT', ['THE VIDEO WAS SHARED ONLINE', 'PICKED UP BY NEWS PROGRAMS']));
S(198.84, 'S35 like thousands', ph('cg_c', { pos: '50% 30%' }));
S(205.00, 'S36 few more things', cd('cg_a', 'BEFORE SHE MOVES ON', ['A FEW MORE THINGS']));
S(210.83, 'S37 signs, selfie', ph('cg_b', { pos: '50% 50%' }));
S(215.41, 'S38 then a poster', cd('cg_c', 'THEN A POSTER', ['SIGNED FOR THE FAN']));
// ---------- raw 2 218.84 - 232.84
S(232.84, 'S39 line keeps moving', cd('plaza_live', 'THE LINE KEEPS MOVING', ['FORWARD, A LITTLE AT A TIME']));
S(237.66, 'S40 one more hug', ph('cg_b', { pos: '55% 35%' }));
S(241.5, 'S41 next person', cd('cg_c', 'ONE MORE HUG', ['THEN THE NEXT PERSON']));
// ---------- raw 3 245.29 - RAWB (source 54.5)
S(RAWB, 'S42 silence', (i) => [...H.frz(i, 'CGF', 54.0), H.dip(0, 20)]);
// ---------- p04 (268.79 - 497.3)
S(268.79, 'S43 St Petersburg', (i) => H.map(i, P('map_fl'), MAPC, [{ x: 873, y: 595, label: 'ST. PETERSBURG, FLORIDA', sub: 'A 27-YEAR-OLD MAN', at: 271.6 }, { x: 1332, y: 276, label: 'ORLANDO', at: 274.0 }]));
S(274.88, 'S44 armed', cd('orlando_eola', 'HE ARRIVED BY TAXI', ['TWO HANDGUNS, BOUGHT LEGALLY', 'TWO SPARE MAGAZINES', 'A LARGE HUNTING KNIFE'], 'cg_c'));
S(281.60, 'S45 no metal detectors', cd('plaza_live', 'NO METAL DETECTORS', ['NOBODY PATTED DOWN AT THE DOOR']));
S(286.54, 'S46 AP 120 inside', cd('map_orlando', 'ASSOCIATED PRESS', ['ABOUT 120 PEOPLE', 'STILL INSIDE THE BUILDING']));
S(291.86, 'S47 police infatuation', cd('map_orlando', 'ORLANDO POLICE', ['"UNHEALTHY AND UNREALISTIC INFATUATION"']));
S(297.06, 'S48 appearance', cd('map_fl', 'HIS APPEARANCE', ['WEIGHT LOSS, HAIR TRANSPLANTS,', 'TEETH WHITENING, EYE SURGERY']));
S(303.94, 'S49 no arrest record', cd('map_fl', 'NO ARREST RECORD', ['IN HIS HOME COUNTY']));
S(309.34, 'S50 Best Buy', cd('map_orlando', 'WORKED PART-TIME', ['AT A BEST BUY STORE', 'NO PUBLIC LINK TO HER BEFORE THAT NIGHT']));
S(314.78, 'S51 Chief Mina', cd('plaza_live', 'POLICE CHIEF JOHN MINA', ['"WE BELIEVE HE CAME HERE', 'TO COMMIT THIS CRIME"']));
S(320.60, 'S52 detectives', cd('map_orlando', 'DETECTIVES', ['PHONE AND SOCIAL MEDIA SEARCHED', 'NO KNOWN HISTORY OF STALKING']));
S(327.42, 'S53 front of the line', cd('plaza_live', '10:24 P.M.', ['HE REACHED THE FRONT OF THE LINE']));
S(331.30, 'S54 venue', ph('plaza_live', { pos: '62% 35%' }));
S(334.72, 'S55 Marcus', cd('cg_b', 'MARCUS GRIMMIE', ['THREW HIMSELF AT THE GUNMAN']));
S(340.51, 'S56 very heroic', cd('cg_c', 'CHIEF MINA', ['"VERY HEROIC ACTIONS"', 'BY MARCUS GRIMMIE']));
S(344.48, 'S57 did not survive', cd('map_orlando', 'THE GUNMAN', ['BROKE FREE IN THE STRUGGLE', 'DID NOT SURVIVE']));
S(349.90, 'S58 name', cd('map_fl', 'THE GUNMAN', ['KEVIN JAMES LOIBL']));
S(355.75, 'S59 ORMC', phOr('ormc', (s) => ({ pos: '50% 50%', over: [H.place(356.0, 'ORLANDO REGIONAL MEDICAL CENTER')] }), 'HOSPITAL', ['ORLANDO REGIONAL', 'MEDICAL CENTER'], 'cg_a'));
S(359.91, 'S60 age 22', cd('cg_c', '10 JUNE 2016', ['CHRISTINA GRIMMIE DIED', 'BEFORE 11 P.M. AGE 22']));
S(364.17, 'S61 events suspended', cd('plaza_live', 'THE VENUE', ['ALL EVENTS SUSPENDED', 'UNTIL FURTHER NOTICE']));
S(369.07, 'S62 Amway', phOr('amway', (s) => ({ pos: '50% 50%', over: [H.place(369.4, 'AMWAY CENTER', 'SELENA GOMEZ, THAT NIGHT')] }), 'AMWAY CENTER', ['SELENA GOMEZ DEDICATED', 'A PERFORMANCE TO HER'], 'stars_dance'));
S(375.01, 'S63 Pulse', phOr('pulse_memorial', (s) => ({ pos: '50% 50%', over: [H.place(379.4, 'PULSE NIGHTCLUB', 'ORLANDO')] }), 'LESS THAN 30 HOURS LATER', ['49 PEOPLE KILLED', 'AT PULSE NIGHTCLUB'], 'map_orlando'));
S(382.08, 'S64 funeral', cd('voice_levine', 'ADAM LEVINE PAID FOR THE FUNERAL', ['THE VOICE: "A BEAUTIFUL SOUL"']));
S(389.75, 'S65 Wojcicki', (i) => H.photo(i, P('wojcicki'), CR.wojcicki, { pos: '50% 40%', over: [H.label(390.1, 'SUSAN WOJCICKI', 'CEO OF YOUTUBE')] }));
S(394.94, 'S66 tributes', cd('sheeran', 'DEDICATED PERFORMANCES', ['JUSTIN BIEBER', 'ARIANA GRANDE', 'DEMI LOVATO']));
S(401.16, 'S67 burial', cd('map_nj', 'BURIED PRIVATELY', ['BERLIN CEMETERY, NEW JERSEY', '16 JUNE 2016']));
S(406.16, 'S68 Medford', phOr('medford', (s) => ({ pos: '50% 50%', over: [H.place(406.4, 'MEDFORD, NEW JERSEY', 'PUBLIC MEMORIAL')] }), 'MEDFORD, NEW JERSEY', ['THOUSANDS AT A PUBLIC MEMORIAL'], 'map_nj'));
S(409.83, 'S69 fundraiser', cd('cg_c', 'FUNDRAISER', ['GOAL: $4,000', 'RAISED OVER $170,000 IN TWO DAYS']));
S(417.06, 'S70 Billboard letter', cd('cg_b', 'BILLBOARD, 23 JUNE', ['OPEN LETTER CALLING FOR', 'UNIVERSAL BACKGROUND CHECKS']));
S(422.60, 'S71 nearly 200', cd('cg_a', 'SIGNED BY NEARLY 200', ['PEOPLE FROM THE MUSIC INDUSTRY']));
S(425.89, 'S72 VidCon', cd('cg_c', 'VIDCON', ['ADDED METAL DETECTORS', 'BANNED INFORMAL MEET-AND-GREETS']));
S(430.34, 'S73 E3', phOr('e3_2016', (s) => ({ pos: '50% 50%', over: [H.place(430.6, 'E3 2016')] }), 'E3 GAMES SHOW', ['NINTENDO\'S REGGIE FILS-AIME', 'OFFERED CONDOLENCES'], 'cg_a'));
S(435.74, 'S74 Zelda petition', cd('e3_2016', 'ZELDA PETITION', ['70,000+ SIGNATURES', 'A CHARACTER NAMED AFTER HER'], 'cg_c'));
S(442.72, 'S75 Teen Choice', cd('cg_b', 'TEEN CHOICE, 2016', ['CHOICE WEB STAR: MUSIC']));
S(448.87, 'S76 broadcast', cd('cg_a', 'THE BROADCAST', ['FANS CRITICIZED IT FOR NOT', 'MENTIONING HER']));
S(452.14, 'S77 Matchbreaker', cd('cg_c', 'THE MATCHBREAKER', ['HER ONLY FILM', 'OCTOBER 2016']));
S(458.45, 'S78 wrongful death suit', cd('cg_b', 'DECEMBER 2016', ['FAMILY FILES A WRONGFUL', 'DEATH LAWSUIT']));
S(463.03, 'S79 defendants', cd('plaza_live', 'THE DEFENDANTS', ['AEG LIVE', 'THE VENUE\'S FOUNDATION', 'THE SECURITY COMPANY']));
S(470.07, 'S80 first suit dismissed', cd('cg_a', 'FIRST SUIT', ['DISMISSED IN 2017', 'THE FAMILY REFILED']));
S(474.23, 'S81 April 2018', cd('cg_c', 'APRIL 2018', ['A JUDGE ALLOWED IT TO GO AHEAD']));
S(478.25, 'S82 dropped', cd('cg_b', '3 DECEMBER 2019', ['THE FAMILY VOLUNTARILY', 'DROPPED THE SUIT']));
S(482.45, 'S83 foundation', (i) => H.photo(i, P('cg_c'), CR.cg_c, { pos: '50% 25%', over: [H.place(482.8, 'CHRISTINA GRIMMIE FOUNDATION', 'FEBRUARY 2017')] }));
S(489.12, 'S84 music since', cd('cg_a', 'HER MUSIC SINCE', ['SIDE B: APRIL 2017', 'ALL IS VANITY: JUNE 2017']));
S(496.0, 'S85 last', (i) => [...H.photo(i, P('cg_b'), CR.cg_b, { pos: '45% 30%' }), H.dip(0, 60)]);

const rawStarts = RAWS.map((r) => r.a).sort((x, y) => x - y);
const shots = plan.map(([s, name, fn], k) => {
  const nxt = plan[k + 1]?.[0] ?? END;
  const ra = rawStarts.find((a) => a > s + 0.01);
  const e = Math.min(nxt, ra ?? 1e9);
  return [s, +e.toFixed(3), name, (i) => fn(i, s, e - s)];
});

const C = makeCase({
  id: 'lm_case03', num: 3, title: SKEL.name.toUpperCase(),
  plate: [P('plaza_live'), CR.plaza_live],
  vo: VO, raws: RAWS, shots, end: END,
});
// own audio of the raws: R1 src 0-3 s, R3 src 35-39.8 s (levelled to the narration), rest stays silent (room tone only)
const own = (id, at, len, trim, g) => ({ src: 'CGF', id, file: 'CGF.mp4', at, to: +(at + len).toFixed(3), trim, lane: [[0, 0], [0.3, g], [+(len - 0.3).toFixed(3), g], [len, 0]] });
const wins = [own('raw_own1', RAWS[0].a, 3, 0, 0.6427), own('raw_own3', +(RAWS[2].a + 2.0).toFixed(3), 4.8, 35, 0.7499)];
C.audio.push(...wins);
// duck the music bed under those windows
for (const a of C.audio) if (String(a.src).startsWith('mus')) a.lane = a.lane.map(([u, g]) => { const t = a.at + u; return [u, wins.some((w) => t >= w.at && t <= w.to) ? +(g * 0.5).toFixed(4) : g]; });
export default C;
