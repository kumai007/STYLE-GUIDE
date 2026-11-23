// lm_case17 - "Ishrat at the police-station desk" (Aligarh). AGH = Amar Ujala news copy of the station CCTV (original age-locked),
// cropped to the CCTV pane, silent, ONLY frames before the pistol handover (source 0-14 s). Son + man in red blurred everywhere.
import fs from 'node:fs';
import { makeCase, H } from './lm_lib.mjs';
const S = JSON.parse(fs.readFileSync(new URL('../../../../productions/last-moments/edit/skel/c17.json', import.meta.url), 'utf8'));
const CR = { map: 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)', agh: 'FOOTAGE: CCTV VIA AMAR UJALA' };
const MOS = [{ r: [490, 80, 250, 320] }, { r: [240, 0, 250, 300] }];   // son, man in red (AGH px 1024x768); lead QC 2026-11-23: widened, the phone-filmed source shifts and zooms (2.3 s, 7.05 s)
// lead QC 2026-11-23: AGH 2.6-3.8 shows the web player's control bar, so raw 1 plays 3.85-7.0 slowed to fill its 5 s (cue: slow down to fill)
const RAWS = S.raws.map((r, j) => ({ ...r, credit: CR.agh, mos: MOS, ...(j === 0 ? { t: 3.85, speed: 0.63 } : {}) }));
// slow footage (near-freeze, still blurred) so the same window can fill a few seconds with mos
const slow = (i, t, o = {}) => H.clip(i, 'AGH', t, { speed: 0.08, credit: CR.agh, mos: MOS, ...o });
const bgv = (i, t, bri) => H.bgV(i, 'AGH', t, bri);
const bgp = (i, f, bri) => H.bgP(i, `c17/${f}`, bri);
const M = ['map_aligarh.jpg', 'map_upar_kot.jpg', 'map_up.jpg'];
const card = (t, i, f, kick, lines, bri) => H.card(t, bgp(i, M[f], bri), kick, lines, CR.map);
const cardv = (t, i, vt, kick, lines) => H.card(t, bgv(i, vt, 0.5), kick, lines, CR.agh);

const shots = [
  [5.5, 12.5, 'S01 final frame', (i) => slow(i, 0.2)],
  [12.5, 16.0, 'S02 clock', (i) => cardv(13.0, i, 0.4, 'ON-SCREEN CLOCK', ['2:45 PM'])],
  [16.0, 19.0, 'S03 khaki at back', (i) => slow(i, 12.4)],
  [19.0, 24.0, 'S04 name', (i) => cardv(19.2, i, 0.8, 'HER NAME', ['ISHRAT'])],
  [24.0, 27.8, 'S05 surname', (i) => cardv(24.2, i, 1.2, 'REPORTS DIFFER', ['NIGAR  ·  JAHAN', 'AGE GIVEN TWO WAYS'])],
  [27.8, 33.0, 'S06 aligarh', (i) => H.map(i, 'c17/map_aligarh.jpg', CR.map, [{ x: 960, y: 540, label: 'ALIGARH', sub: 'UTTAR PRADESH · INDIA', at: 28.6 }])],
  [33.0, 36.9, 'S07 husband', (i) => card(33.2, i, 0, 'HER HUSBAND', ['SHAKEEL KHAN', 'LOCKSMITH'], 0.45)],
  [36.9, 43.8, 'S08 umrah', (i) => H.photo(i, 'c17/kaaba.jpg', 'PHOTO: ADLI WAHID / CC BY-SA 4.0', { bri: 0.8, over: [H.place(37.6, 'UMRAH', 'DECEMBER 2023 · PILGRIMAGE TO MECCA')] })],
  [43.8, 48.5, 'S09 verification', (i) => card(44.0, i, 2, 'IN INDIA', ['A PASSPORT NEEDS A', 'POLICE VERIFICATION FIRST'], 0.45)],
  [48.5, 53.0, 'S10 date', (i) => card(48.7, i, 1, 'FRIDAY', ['8 DECEMBER 2023', 'AFTERNOON'], 0.5)],
  [53.0, 57.5, 'S11 upar kot', (i) => H.map(i, 'c17/map_upar_kot.jpg', CR.map, [{ x: 960, y: 540, label: 'UPAR KOT', sub: 'KOTWALI NAGAR POLICE STATION', at: 54.0 }])],
  [57.5, 60.6, 'S12 son', (i) => card(57.7, i, 0, 'HER SON', ['A PRIVATE PERSON', 'UNNAMED HERE'])],
  [60.6, 66.3, 'S13 records office', (i) => slow(i, 12.8, { over: [H.place(61.4, 'RECORDS OFFICE', 'POLICE COMPUTER RECORDS')] })],
  [66.3, 71.4, 'S14 cctns', (i) => card(66.5, i, 2, 'POLICE COMPUTER RECORDS', ['CCTNS'])],
  [71.4, 76.8, 'S15 high corner', (i) => slow(i, 0.6)],
  [76.8, 81.2, 'S16 soft', (i) => slow(i, 1.0)],
  [81.2, 85.9, 'S17 menu', (i) => card(81.4, i, 1, 'RECORDER MENU', ['DECEMBER 2023 CALENDAR', 'CROPPED AWAY'])],
  [85.9, 91.92, 'S18 shawl', (i) => slow(i, 1.8)],
  // ---- RAW 1 91.92-96.92 ----
  [96.92, 100.7, 'S19 khaki', (i) => slow(i, 12.2, { over: [H.label(97.6, 'SUB-INSPECTOR MANOJ SHARMA', 'BHUJPURA POLICE OUTPOST')] })],
  [100.7, 103.9, 'S20 bhujpura', (i) => card(100.9, i, 2, 'BHUJPURA', ['POLICE OUTPOST'])],
  [103.9, 108.3, 'S21 time', (i) => card(104.1, i, 1, 'TIME GIVEN IN REPORTS', ['2:30 PM TO 2:50 PM'], 0.5)],
  [108.3, 111.6, 'S22 clock', (i) => card(108.5, i, 1, 'RECORDER CLOCK', ['2:45'], 0.4)],
  [111.6, 117.8, 'S23 ordinary', (i) => slow(i, 0.3)],
  [117.8, 123.2, 'S24 man in red', (i) => slow(i, 13.2)],
  [123.2, 126.265, 'S25 holds', (i) => slow(i, 13.5)],
  // ---- RAW 2 126.265-131.265 (HARD OUT source 0:12) ----
  [131.265, 137.0, 'S26 we stop', (i) => slow(i, 11.9, { speed: 0.02 })],
  [137.0, 140.8, 'S27 checking', (i) => card(137.2, i, 0, 'SHARMA', ['CHECKING THE PISTOL', 'A FEW FEET FROM HER'], 0.45)],
  [140.8, 146.3, 'S28 observer', (i) => card(141.0, i, 1, 'THE OBSERVER POST', ['MAGAZINE FULL', 'CHAMBER THOUGHT EMPTY'], 0.45)],
  [146.3, 150.3, 'S29 hit', (i) => card(146.5, i, 2, 'ISHRAT', ['HIT IN THE HEAD'], 0.4)],
  [150.3, 156.0, 'S30 hospital', (i) => H.photo(i, 'c17/jnmc.jpg', 'PHOTO: KHANSHAHAB06 / CC BY-SA 4.0', { bri: 0.8, over: [H.place(150.8, 'JAWAHARLAL NEHRU MEDICAL COLLEGE', 'ALIGARH MUSLIM UNIVERSITY')] })],
  [156.0, 160.7, 'S31 sharma gone', (i) => card(156.2, i, 1, 'SHARMA', ['LEFT THE STATION', 'COULD NOT BE FOUND'], 0.45)],
  [160.7, 167.5, 'S32 video', (i) => card(160.9, i, 2, 'THE STATION VIDEO', ['FILMED OFF THE MONITOR', 'SPREAD WITHIN HOURS'], 0.45)],
  [167.5, 174.0, 'S33 market', (i) => H.map(i, 'c17/map_upar_kot.jpg', CR.map, [{ x: 960, y: 540, label: 'UPAR KOT', sub: 'MARKET CLOSED', at: 168.5 }])],
  [174.0, 180.9, 'S34 scuffle', (i) => card(174.2, i, 0, 'NEAR THE STATION', ['A SCUFFLE', 'A MAN IN A RED T-SHIRT'], 0.4)],
  [180.9, 186.8, 'S35 police', (i) => card(181.1, i, 2, 'POLICE SAID', ['SUSPECT IN ANOTHER CASE', 'NOT YET QUESTIONED'], 0.45)],
  [186.8, 191.4, 'S36 report', (i) => card(187.0, i, 1, 'HER SON FILED', ['A POLICE REPORT', 'ATTEMPT TO MURDER'], 0.4)],
  [191.4, 196.4, 'S37 surgery', (i) => H.photo(i, 'c17/jnmc2.jpg', 'PHOTO: KHANSHAHAB06 / CC BY-SA 4.0', { bri: 0.75, over: [H.date(191.8, 'TUESDAY 12 DECEMBER 2023')] })],
  [196.4, 201.0, 'S38 died', (i) => card(196.6, i, 2, 'WEDNESDAY 13 DECEMBER', ['SHE PASSED AWAY', 'FIVE DAYS AFTER THE SHOT'], 0.4)],
  [201.0, 206.4, 'S39 ssp', (i) => card(201.2, i, 1, 'KALANIDHI NAITHANI', ['SENIOR SUPERINTENDENT', 'ORDERED A POST-MORTEM'], 0.45)],
  [206.4, 212.7, 'S40 statement', (i) => card(206.6, i, 0, 'HIS STATEMENT', ['"THE WOMAN INJURED BY THE', "SUB-INSPECTOR'S BULLET", 'HAD SUCCUMBED TO HER INJURIES"'], 0.4)],
  [212.7, 216.4, 'S41 accident', (i) => card(212.9, i, 2, 'POLICE: AN ACCIDENT', ['HER FAMILY DISPUTES THAT'], 0.4)],
  [216.4, 221.0, 'S42 jagran', (i) => card(216.6, i, 1, 'DAINIK JAGRAN', ['"SHE WAS GETTING', 'CALLS FOR MONEY."'], 0.45)],
  [221.0, 226.4, 'S43 alleged', (i) => card(221.2, i, 0, 'HER SON ALLEGED', ['HARASSMENT OVER THE VERIFICATION', 'AN ARGUMENT BEFORE THE SHOT'], 0.4)],
  [226.4, 230.5, 'S44 suspended', (i) => card(226.6, i, 2, 'SHARMA', ['SUSPENDED AT ONCE', 'NON-BAILABLE WARRANT'], 0.45)],
  [230.5, 235.4, 'S45 reward', (i) => card(230.7, i, 0, 'REWARD', ['20,000 RUPEES'], 0.45)],
  [235.4, 240.4, 'S46 arrest', (i) => card(235.6, i, 1, 'SATURDAY 16 DECEMBER', ['ARRESTED AFTER', 'EIGHT DAYS ON THE RUN'], 0.4)],
  [240.4, 246.5, 'S47 quote', (i) => card(240.6, i, 2, 'THE SENIOR SUPERINTENDENT', ['"SI MANOJ SHARMA WAS ARRESTED', 'IN THE BANNADEVI POLICE AREA TODAY."'], 0.4)],
  [246.5, 250.7, 'S48 custody', (i) => card(246.7, i, 0, 'JUDICIAL CUSTODY', ['SHARMA'], 0.45)],
  [250.7, 254.6, 'S49 clerk', (i) => card(250.9, i, 1, 'THE CLERK', ['ARRESTED', 'FOR NEGLIGENCE'], 0.45)],
  [254.6, 258.4, 'S50 no charge', (i) => card(254.8, i, 2, 'NO LATER CHARGE', ['REPORTED AGAINST EITHER MAN'], 0.4)],
  [258.4, S.end, 'S51 no verdict', (i) => card(258.6, i, 0, 'NO TRIAL OR VERDICT', ['FOUND SINCE'], 0.4)],
];
export default makeCase({ id: 'lm_case17', num: 17, title: S.name.toUpperCase(), plate: ['c17/map_aligarh.jpg', CR.map], vo: S.vo, raws: RAWS, shots, end: S.end });
