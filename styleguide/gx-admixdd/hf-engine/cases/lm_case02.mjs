// lm_case02 - The camera that kept rolling into the Blue Hole (Dahab). Built with lm_lib; times = part seconds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H } from './lm_lib.mjs';

const SKEL = JSON.parse(fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..', 'productions', 'last-moments', 'edit', 'skel', 'c02.json'), 'utf8'));
const RAWS = SKEL.raws.map((r, j) => ({ tag: r.tag, a: r.a, b: r.b, t: r.t, mute: r.mute, credit: j === 0 ? 'FOOTAGE: YURI LIPSKI TAPE (2000) / UPLOAD BY ELENA KONSTANTINOU' : undefined }));
const C = (s) => `PHOTO: ${s}`;
const CR = { aerial: C('MIZOWNA / CC BY 4.0'), saddle: C('TIM SHEERMAN-CHASE / CC BY 2.0'), memorials: C('D T G / CC BY 3.0'), memorial2: C('ALEXEY KOMAROV / CC BY-SA 4.0'),
  road: C('ALEXEY KOMAROV / CC BY-SA 4.0'), freedivers: C('TIM SHEERMAN-CHASE / CC BY 2.0'), bluehole2: C('MOHAMED KAMAL 1984 / CC BY-SA 4.0'), bh2005: C('NOWIC (ASSUMED) / PUBLIC DOMAIN'),
  freedivers2: C('TIM SHEERMAN-CHASE / CC BY 2.0'), techdiver: C('RYLAND.CAIRNS / CC0'), cylinders: C('PETER SOUTHWOOD / CC BY-SA 4.0'), divecomputer: C('TONYRANDINE / CC BY-SA 4.0'),
  regulator: C('PETER SOUTHWOOD / CC BY-SA 4.0'), handycam: C('NABUKODINOSAURE / CC BY-SA 4.0'), bells: C('TIM SHEERMAN-CHASE / CC BY 2.0'), masbat: C('JORGE LESCAR / CC BY 2.0'),
  checkpoint: C('WUSEL007 / CC BY-SA 3.0'), egdiver: C('WIKIMEDIA COMMONS / CC BY-SA 4.0'), bluehole1: C('MOHAMED KAMAL 1984 / CC BY-SA 4.0') };
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const P = (k) => `c02/${k}.jpg`;

// LIP b-roll ledger: windows (source s) must stay inside 0..185, outside the raw cues, and not overlap each other
const used = [];
const lipOK = (t, len) => {
  const a = t, b = t + len;
  if (b > 185.01) throw new Error(`LIP b-roll ${a}-${b} beyond 3:05`);
  for (const r of RAWS) if (a < r.t + (r.b - r.a) - 0.01 && b > r.t + 0.01) throw new Error(`LIP b-roll ${a}-${b} overlaps raw ${r.t}`);
  for (const [x, y] of used) if (a < y - 0.3 && b > x + 0.3) throw new Error(`LIP b-roll ${a}-${b} reuses ${x}-${y}`);
  used.push([a, b]);
};
const lip = (t, len, o) => (i) => { lipOK(t, len); return H.clip(i, 'LIP', t, o); };

// plan: [start, name, fn(i, start, len)]; a shot ends where the next plan row or the next raw cue starts
const plan = [];
const S = (start, name, fn) => plan.push([start, name, fn]);
const card = (kick, lines, bg, credit) => (i, s) => H.card(s, bg(i), kick, lines, credit);
const bgp = (k) => (i) => H.bgP(i, P(k));
const bgv = (t) => (i) => H.bgV(i, 'LIP', t);
const ph = (k, o = {}) => (i) => H.photo(i, P(k), CR[k], o);
const pr = (k, o = {}) => (i) => H.par(i, P(k), CR[k], o);
const lipLen = (t, o) => (i, s, L) => { lipOK(t, L); return H.clip(i, 'LIP', t, o); };

S(5.5, 'S01 recording ends deeper', lipLen(160.2));
S(9.5, 'S02 open blue water', lipLen(169.3));
S(14.0, 'S03 date stamp', (i, s) => H.stamp(s, 'LIP', 166.5, { x: 930, y: 735, w: 520, h: 150 }));
S(20.9, 'S04 nobody else / Lipski', (i, s, L) => [...(lipOK(151.5, L), H.clip(i, 'LIP', 151.5, { over: [H.label(24.1, 'YURI LIPSKI', 'DIVER, 22')] }))]);
S(26.1, 'S05 Sinai coast map', (i) => H.map(i, P('map_aqaba'), MAPC, [{ x: 937, y: 469, label: 'DAHAB, SINAI COAST', sub: 'EGYPT', at: 26.5 }]));
S(33.4, 'S06 circle of blue', ph('aerial', { pos: '50% 42%', over: [H.place(33.7, 'THE BLUE HOLE')] }));
S(39.1, 'S07 bottom just over 100 m', card('THE BOTTOM', ['JUST OVER 100 M DOWN'], bgp('bluehole2'), CR.bluehole2));
S(42.56, 'S08 the Saddle', ph('saddle', { over: [H.place(43.0, 'THE SADDLE', '6 TO 7 METRES')] }));
S(47.5, 'S09 the Arch', card('THE ARCH', ['CEILING AT ABOUT 55 M', 'RUNS 26 M'], bgp('techdiver'), CR.techdiver));
S(55.1, 'S10 looks under 10 m', ph('freedivers'));
S(59.6, 'S11 currents push inwards', lipLen(114.2));
S(63.8, 'S12 entrance hard to find', lipLen(129.6));
S(69.4, 'S13 seabed 120 m then 1 km', card('BEYOND THE ARCH', ['AROUND 120 M', 'THEN OVER A KILOMETRE'], bgv(110)));
S(75.7, 'S14 recreational limit 40 m', pr('freedivers2'));
S(79.8, 'S15 technical divers', ph('techdiver', { pos: '50% 40%' }));
S(83.8, 'S16 trimix tanks', ph('cylinders', { pos: '50% 55%' }));
S(87.4, 'S17 divers cemetery', ph('bh2005'));
S(94.4, 'S18 2012 Tarek Omar', (i) => H.photo(i, P('road'), CR.road, { over: [H.date(94.6, '2012')] }));
S(98.5, 'S19 130 deaths', card('ESTIMATE, 2012', ['MORE THAN 130 DEATHS', 'IN THE PREVIOUS 15 YEARS'], bgp('masbat'), CR.masbat));
S(102.4, 'S20 no reliable count', lipLen(118.2));
S(106.0, 'S21 14 plaques', ph('memorials'));
S(111.4, 'S22 James Smith plaque', ph('memorial2', { pos: '30% 55%' }));
S(118.6, 'S23 drawn people for a long time', lipLen(110.0));
S(122.4, 'S24 1968 first scuba dive', card('1968', ['FIRST MODERN SCUBA DIVE INSIDE', 'ISRAELI GROUP LED BY ALEX SHELL'], bgp('saddle'), CR.saddle));
S(128.2, 'S25 tech 60 for the Arch', ph('bells', { pos: '50% 45%' }));
S(134.4, 'S26 Lipski 22 April 2000', lipLen(135.6, { over: [] }));
S(141.0, 'S27 warned twice', card('WARNED TWICE', ['TAREK OMAR TOLD HIM NOT TO'], bgp('road'), CR.road));
S(145.0, 'S28 went in alone, one tank', (i, s, L) => (lipOK(146.4, L), H.clip(i, 'LIP', 146.4, { over: [H.date(145.2, '28 APRIL 2000')] })));
S(150.0, 'S29 video camera running', ph('handycam', { pos: '50% 50%' }));
S(153.47, 'S30 tape opens on reef wall', lipLen(142.2));
// ---- after raw 1 (157.735-182.735)
S(182.735, 'S31 camera rated 75 m', ph('regulator'));
S(187.7, 'S32 camcorder clock', (i, s) => H.stamp(s, 'LIP', 168.4, { x: 930, y: 735, w: 520, h: 150 }));
S(192.04, 'S33 diving alone', lipLen(156.7));
S(195.71, 'S34 first minutes like any reef dive', pr('saddle', { pos: '50% 70%' }));
S(200.49, 'S35 colours shift', card('RED LIGHT GOES FIRST', ['WATER ABSORBS IT QUICKLY'], bgv(160)));
// ---- after raw 2 (208.455-238.455)
S(238.455, 'S36 up to here', ph('bells', { pos: '50% 70%' }));
S(242.6, 'S37 same water as everyone', lipLen(126.0));
S(246.3, 'S38 light comes back, fish', ph('freedivers', { pos: '50% 70%' }));
// ---- after raw 3 (253.6-278.6)
S(278.6, 'S39 no single moment', card('THE DIVE', ['NO SINGLE MOMENT', 'WHERE IT WENT WRONG'], bgv(163)));
S(285.6, 'S40 narcosis', ph('regulator', { pos: '50% 50%' }));
S(291.5, 'S41 confusion and panic', card('NITROGEN NARCOSIS', ['CONFUSION AND PANIC'], bgp('freedivers'), CR.freedivers));
S(296.9, 'S42 hallucinations', card('AT ITS WORST', ['HALLUCINATIONS'], bgp('masbat'), CR.masbat));
S(299.99, 'S43 helium, decompression stops', ph('divecomputer'));
S(306.43, 'S44 one tank of air', ph('cylinders', { pos: '50% 20%' }));
S(311.57, 'S45 wall, hazy water', card('THE DESCENT', ['DOWN THE WALL, THROUGH HAZY OPEN WATER'], bgv(126.5)));
// ---- after raw 4 (315.895-345.895)
S(345.895, 'S46 wall slides away', lipLen(121.8));
S(349.6, 'S47 last other person', lipLen(164.6));
S(353.4, 'S48 only blue', (i, s, L) => H.frz(i, 'LIP', 168.8));
// ---- after raw 5 (357.085-368.085)
S(368.085, 'S49 that is where we stop', card('THAT IS WHERE WE STOP', ['THE TAPE KEPT ROLLING'], bgv(171.0)));
S(374.0, 'S50 seabed 5.5 minutes', card('ON THE TAPE', ['SEABED AFTER ABOUT 5 MIN 30 S'], bgp('bluehole2'), CR.bluehole2));
S(379.4, 'S51 115 m', card('DEPTH', ['ABOUT 115 M', 'ACCOUNTS: 111 M OR 300 FT'], bgp('aerial'), CR.aerial));
S(389.0, 'S52 nobody can be sure', card('NO ONE CAN BE SURE', ['OF THE EXACT FIGURE'], bgp('memorials'), CR.memorials));
S(396.0, 'S53 Guardian', (i) => H.art('c02_guardian_a', 396.8));
S(402.9, 'S54 next day, mother, Omar', ph('masbat', { pos: '50% 50%' }));
S(410.0, 'S55 camera past 75 m rating', card('RATED TO 75 METRES', ['THE CAMERA STILL WORKED'], bgp('divecomputer'), CR.divecomputer));
S(414.4, 'S56 Dive Mysteries', card('DIVE MYSTERIES', ['REPORTED BY MONTY HALLS'], bgp('regulator'), CR.regulator));
S(420.0, 'S57 2008 Konstantinou', (i) => H.photo(i, P('freedivers2'), CR.freedivers2, { over: [H.place(424.4, 'ELENA KONSTANTINOU', 'DAHAB DIVE INSTRUCTOR AND FILMMAKER')] }));
S(430.0, 'S58 10 million views', card('VIEWED', ['MORE THAN 10 MILLION TIMES'], bgv(158)));
S(433.8, 'S59 2004 documentary', card('RUSSIAN TV DOCUMENTARY', ['2004'], bgp('bh2005'), CR.bh2005));
S(438.1, 'S60 2023 Deepest Breath', card('THE DEEPEST BREATH', ['2023 DOCUMENTARY'], bgp('saddle'), CR.saddle));
S(442.62, 'S61 none of what comes after', (i, s) => H.frz(i, 'LIP', 172.6));
S(449.4, 'S62 would have flooded it', card('TAREK OMAR', ['HE WOULD HAVE FLOODED IT'], bgp('bells'), CR.bells));
S(453.9, 'S63 his mom has it now', card('TAREK OMAR', ['"THE THING THAT REALLY UPSET AND SADDENED ME', 'ABOUT IT WAS THAT HIS MOM HAS IT NOW"'], bgp('road'), CR.road));
S(458.7, 'S64 no inquiry', card('OFFICIAL RECORD', ['NO INQUIRY OR CHARGES'], bgp('bh2005'), CR.bh2005));
S(462.78, 'S65 policeman posted', ph('checkpoint'));

const rawStarts = RAWS.map((r) => r.a).sort((x, y) => x - y);
const shots = plan.map(([s, name, fn], k) => {
  const nxt = plan[k + 1]?.[0] ?? SKEL.end;
  const ra = rawStarts.find((a) => a > s + 0.01);
  const e = Math.min(nxt, ra ?? 1e9);
  return [s, +e.toFixed(3), name, (i) => fn(i, s, e - s)];
});

export default makeCase({
  id: 'lm_case02', num: 2, title: 'THE CAMERA THAT KEPT ROLLING INTO THE BLUE HOLE',
  plate: [P('plate'), 'PHOTO: PETAR MILOSEVIC / CC BY-SA 4.0'],
  vo: SKEL.vo, raws: RAWS, shots, end: SKEL.end,
});
