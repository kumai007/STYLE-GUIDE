// lm_case06 - KiXSTAr's last sign-off (Alameda County, California). Built with lm_lib; shot starts are anchored on narration words
// (T('c06_p01', 'phrase') = part second of the first word of that phrase), so the table follows the final narration cut.
// KIXB = KIX.mp4 first 48 s with the chat column blurred in the file and a bleep over ~35.4-36.0 s (lib has no bleep support).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeCase, H } from './lm_lib.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const SKEL = JSON.parse(fs.readFileSync(path.join(ROOT, 'productions', 'last-moments', 'edit', 'skel', 'c06.json'), 'utf8'));
const RAWS = SKEL.raws.map((r, j) => ({ tag: 'KIXB', a: r.a, b: r.b, t: r.t, mute: false, credit: j === 0 ? "FOOTAGE: KiXSTAr'S TWITCH STREAM" : undefined }));
const rawStarts = RAWS.map((r) => r.a).sort((x, y) => x - y);

// ---- narration word anchors
const norm = (s) => s.toLowerCase().replace(/-/g, '').replace(/[^a-z0-9' ]+/g, ' ').trim().split(/\s+/).filter(Boolean);
const WORDS = {};
for (const [id, p] of Object.entries(SKEL.words)) {
  const vs = SKEL.vo.find(([f]) => f.includes(id))[1];
  WORDS[id] = JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8')).words.map((w) => ({ k: norm(w.w).join(''), t: vs + w.start }));
}
const MISSING = [];
const T = (id, phrase, nth = 0) => {
  const q = norm(phrase).join(' ').split(' '), W = WORDS[id]; let hit = 0;
  for (let i = 0; i + q.length <= W.length; i++) {
    if (q.every((x, j) => W[i + j].k === x.replace(/[^a-z0-9]/g, ''))) { if (hit++ === nth) return +W[i].t.toFixed(3); }
  }
  MISSING.push(`${id} "${phrase}"`); return NaN;
};

const C = (s) => `PHOTO: ${s}`;
const CR = { stage: C('QUINNTROPY / CC BY-SA 4.0'), chp: C('NICK ARES / CC BY-SA 2.0'), beach: C('TBO47 / CC BY-SA 4.0') };
const MAPC = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const TW = "FOOTAGE: KiXSTAr'S TWITCH STREAM", ACE = 'FOOTAGE: KiXSTAr (YOUTUBE, "8 SECOND ACE")', MEM = 'FOOTAGE: KUDOS / UBISOFT';
const FN = { stage: 'siege_stage', chp: 'chp_charger', beach: 'alameda_beach' };
const P = (k) => `c06/${FN[k] || k}.jpg`;

const plan = [];
const S = (start, name, fn) => plan.push([start, name, fn]);
const bgf = (t) => (i) => H.bgV(i, 'KIXB', t);
const bga = (t) => (i) => H.bgV(i, 'KIXACE', t);
const bgp = (k) => (i) => H.bgP(i, P(k));
const card = (kick, lines, bg, credit) => (i, s) => H.card(s, bg(i), kick, lines, credit);
const fz = (t, o = {}) => (i) => H.frz(i, 'KIXB', t, { credit: TW, ...o });
const ph = (k, o = {}) => (i) => H.photo(i, P(k), CR[k], o);
const ace = (t, o = {}) => (i) => H.clip(i, 'KIXACE', t, { credit: ACE, ...o });
const mem = (t, o = {}) => (i) => H.clip(i, 'KIXMEM', t, { credit: MEM, ...o });
const a1 = 'c06_p01', a2 = 'c06_p02', a3 = 'c06_p03', a4 = 'c06_p04';

// ---- p01: before the first raw (5.5 -> RAWS[0].a)
S(5.5, 'S01 title to last image', fz(39.0));
S(T(a1, 'The last image'), 'S02 last image', (i, s) => H.frz(i, 'KIXB', 39.0, { credit: TW, over: [H.date(T(a1, 'Monday the 11th', 0), '11 OCTOBER 2021', { pos: 'bl' })] }));
S(T(a1, 'his chat is still scrolling'), 'S03 chat scrolling', fz(0.4));
S(T(a1, 'That Monday started'), 'S04 that monday', fz(5.0));
S(T(a1, 'Online, everyone knew'), 'S05 KiXSTAr name', (i) => H.frz(i, 'KIXB', 9.0, { credit: TW, over: [H.label(T(a1, 'Online, everyone knew') + 0.8, 'MICHAEL STOCKLEY', 'ONLINE: KiXSTAr')] }));
S(T(a1, 'He was born'), 'S06 born', card('BORN', ['9 MARCH 1997'], bgf(11.0)));
S(T(a1, 'by 2016'), 'S07 2016 pro', ace(1.0));
S(T(a1, 'won the North American title'), 'S08 titles', card('RAINBOW SIX PRO LEAGUE', ['NORTH AMERICAN CHAMPION', 'SEASONS 1 AND 2'], bga(9.0)));
S(T(a1, 'In 2017 he moved'), 'S09 caster', ph('stage', { pos: '50% 60%' }));
S(T(a1, 'By 2020'), 'S10 2020', card('ESPORTS AWARDS 2020', ['COLOUR CASTER OF THE YEAR'], bgp('stage')));
S(T(a1, 'He was nominated again'), 'S11 nominated', card('NOMINATED AGAIN', ['2021'], bga(12.0)));
S(T(a1, 'His long-time partner'), 'S12 INTERRO', fz(13.5, { over: [H.label(T(a1, 'Parker Mackay') + 0.2, 'PARKER MACKAY "INTERRO"', 'BROADCAST PARTNER')] }));
S(T(a1, 'Because of the pandemic'), 'S13 alameda map', (i, s) => H.map(i, P('map_alameda'), MAPC, [{ x: 960, y: 540, label: 'ALAMEDA, CALIFORNIA', at: s + 1.2 }]));
S(T(a1, 'casting matches'), 'S14 followers', card('TWITCH FOLLOWERS', ['MORE THAN 400,000'], bgp('beach')));
S(T(a1, 'On that Monday'), 'S15 three and a half hours', ace(8.0));
S(T(a1, 'He joked with chat'), 'S16 joked', fz(24.5));
S(T(a1, 'Then he sat back'), 'S17 sat back', fz(30.5));
S(T(a1, 'What we have is'), 'S18 his own broadcast', fz(1.2));
S(T(a1, 'His face is in the middle'), 'S19 layout', (i, s) => H.frz(i, 'KIXB', 4.0, { credit: TW, over: [H.spot(s + 6.0, 1000, 70, 170)] }));
S(T(a1, 'about to tell everyone'), 'S20 about to tell', fz(11.0));

// ---- p02: between raw 1 and raw 2
S(RAWS[0].b, 'S21 stallion', fz(14.0));
S(T(a2, 'In the chat column'), 'S22 chat arguing', card('CHAT', ['"WHY WAS THAT A BAD DECISION?"'], bgf(14.5)));
S(T(a2, 'Another viewer'), 'S23 drive stream', card('CHAT', ['"DRIVE STREAM"'], bgf(10.5)));
S(T(a2, 'Then he stops'), 'S24 what day', fz(12.5));

// ---- p03: between raw 2 and raw 3
S(RAWS[1].b, 'S25 chat sends off', card('CHAT', ['"ENJOY YOUR RIDE"'], bgf(26.0)));
S(T(a3, 'In the top corner'), 'S26 sponsor panel', (i, s) => H.frz(i, 'KIXB', 33.5, { credit: TW, over: [H.spot(s + 0.8, 250, 70, 190)] }));
S(T(a3, 'He says he had fun'), 'S27 fun anyway', fz(37.0));
S(T(a3, 'Then comes the goodbye'), 'S28 goodbye', fz(40.6));

// ---- p04: after raw 3
S(RAWS[2].b, 'S29 no stream', card('TUESDAY 12 OCTOBER 2021', ['NO STREAM'], bgf(40.6)));
S(T(a4, 'At 9:23'), 'S30 crash map', (i, s) => H.map(i, P('map_crash'), MAPC, [{ x: 960, y: 540, label: 'REDWOOD ROAD', sub: 'NEAR PINEHURST ROAD', at: s + 1.0 }]));
S(T(a4, 'the California Highway Patrol'), 'S31 CHP', ph('chp', { pos: '40% 60%' }));
S(T(a4, 'A single car'), 'S32 single car', card('SINGLE-VEHICLE CRASH', ['NO ONE ELSE HURT'], bgp('map_crash')));
S(T(a4, 'Castro Valley office'), 'S33 no cause', card('CHP CASTRO VALLEY', ['NO CAUSE HAS EVER BEEN PUBLISHED'], bgp('chp')));
S(T(a4, 'On the 13th of October'), 'S34 coroner', card('13 OCTOBER 2021', ['ALAMEDA COUNTY CORONER NAMES', 'MICHAEL STOCKLEY, 24'], bgf(5.0)));
S(T(a4, 'His family said'), 'S35 family', card('HIS FAMILY', ['"KEEP IT GOING, PAY IT FORWARD', 'AND KEEP LIFTING EACH OTHER UP"'], bgp('beach')));
S(T(a4, 'In place of flowers'), 'S36 food bank', card('IN PLACE OF FLOWERS', ['DONATIONS TO A FOOD BANK'], bgf(9.0)));
S(T(a4, 'Over the next two days'), 'S37 tributes', card('TRIBUTES', ['UPCOMER', 'INVEN GLOBAL', 'PC GAMER'], bga(10.0)));
S(T(a4, 'Rainbow Six Esports postponed'), 'S38 postponed', ph('stage', { pos: '50% 60%' }));
S(T(a4, 'Terro called him'), 'S39 interro quote', card('PARKER MACKAY "INTERRO"', ['"A BEST FRIEND AND BROTHER,', 'AS WELL AS A COLLEAGUE"'], bgf(13.5)));
S(T(a4, 'Hunter Cook'), 'S40 cooke quote', card('HUNTER COOKE, SIEGE.GG', ['"THERE WILL NEVER BE', 'ANOTHER KiXSTAr."'], bga(14.0)));
S(T(a4, 'On the 20th of October'), 'S41 tribute broadcast', card('20 OCTOBER 2021', ['UBISOFT LIVE TRIBUTE', '9 MARCH 1997 - 11 OCTOBER 2021'], bgf(31.0)));
S(T(a4, 'That tribute alone'), 'S42 470k', card('TRIBUTE ON YOUTUBE', ['ABOUT 470,000 VIEWS'], bga(6.0)));
S(T(a4, 'Years earlier'), 'S43 ace', ace(1.0, { s: [1.0, 1.04] }));
S(T(a4, 'Ubisoft put a memorial plaque'), 'S44 plaque', mem(34.0));
S(T(a4, 'Terro told the BBC'), 'S45 bbc', card('INTERRO TO THE BBC', ['A FITTING MEMORY'], bgf(17.0)));
S(T(a4, 'So there were no charges'), 'S46 no charges', card('NO CHARGES, NO COURT CASE', ['SINGLE-CAR CRASH'], bgp('map_crash')));
S(T(a4, 'Fans started clipping'), 'S47 clipping', fz(39.0));
S(T(a4, 'The earliest copy'), 'S48 earliest', card('EARLIEST COPY FOUND', ['13 OCTOBER 2021', 'TWENTY SECONDS LONG'], bgf(2.0)));
S(T(a4, 'off is still all over'), 'S49 million views', card('ONE FIFTY-SECOND COPY', ['MORE THAN 1,000,000 VIEWS'], bgf(40.6)));

// ---- resolve: a shot ends at the next row or the next raw; clamp starts (>= 3 s) and drop rows that cannot reach 3 s
const rows = []; let prev = -1;
if (MISSING.length) console.warn('c06 MISSING anchors: ' + MISSING.join(' | '));
for (const [s0, name, fn] of plan.filter((r) => Number.isFinite(r[0]))) {
  const s = Math.max(s0, prev < 0 ? s0 : prev + 3.0);
  const ra = rawStarts.find((a) => a > s + 0.01) ?? 1e9;
  if (ra - s < 3.0 && ra - s > 0.02 && prev >= 0 && !RAWS.some((r) => Math.abs(r.b - s) < 0.02)) { console.warn(`c06 drop ${name} (${(ra - s).toFixed(2)} s before raw)`); continue; }
  if (s >= SKEL.end - 2.5) { console.warn(`c06 drop ${name} (too late)`); continue; }
  rows.push([s, name, fn]); prev = s;
}
const shots = rows.map(([s, name, fn], k) => {
  const nxt = rows[k + 1]?.[0] ?? SKEL.end;
  const ra = rawStarts.find((a) => a > s + 0.01);
  const e = Math.min(nxt, ra ?? 1e9);
  return [s, +e.toFixed(3), name, (i) => fn(i, s, e - s)];
});

export default makeCase({
  id: 'lm_case06', num: 6, title: "KiXSTAr'S LAST SIGN-OFF",
  plate: [P('plate'), 'PHOTO: MARTIN MBUTHIA / CC BY-SA 4.0'],
  vo: SKEL.vo, raws: RAWS, shots, end: SKEL.end,
});
