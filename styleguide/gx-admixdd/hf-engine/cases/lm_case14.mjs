// lm_case14 - "Fourteen seconds at the mall door" (Caitlin Potts, Orchard Park Mall, Kelowna BC). Source RCMP = BC RCMP upload, 478x360, 10 fps, 13.9 s, silent CCTV.
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c14.md
import { makeCase, H, n } from './lm_lib.mjs';

const EOX = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const RC = 'FOOTAGE: BC RCMP';
// blur (source px 478x360): the exiting man with the white bag (7.6-12.1 s) + tiny passers-by outside the glass (0-4 s)
const MAN = [{ keys: [[7.6, 0, 0, 0, 0], [7.7, 395, 160, 83, 200], [8.0, 380, 130, 98, 230], [8.5, 325, 105, 100, 150], [9.0, 285, 70, 90, 130], [9.5, 235, 60, 85, 120],
  [10.0, 225, 45, 80, 110], [10.5, 205, 40, 70, 100], [11.0, 190, 30, 65, 90], [11.5, 180, 25, 60, 90], [12.0, 155, 15, 55, 80], [12.1, 0, 0, 0, 0]] },
{ keys: [[0, 60, 0, 170, 60], [4.0, 60, 0, 170, 60], [4.1, 0, 0, 0, 0]] }];
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
const still = (a, b, name, t, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.clip(i, 'RCMP', t, { speed: 0.02, mos: MAN, ...o }), ...extra()]);
const photo = (a, b, name, src, credit, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, credit, o), ...extra()]);
const map = (a, b, name, src, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, src, EOX, { bri: 0.8 }), ...extra()]);
// blurred backdrop from a (nearly) frozen RCMP frame: the source is only 13.9 s long, so never play it at 1x under a card
const bgv = (i, t, bri = 0.55) => n('Grade', { sat: 0.5, bri, con: 1.08 }, n('Cam', { s: [1.1, 1.18], ry: [-1, 1], tx: [-14, 14], css: 'filter:blur(14px)' }, n('LClip', { src: 'RCMP', t, speed: 0.02, sw: 478, sh: 360, fit: 'cover' })));
const cardV = (a, b, name, t, kick, lines) => add(a, b, name, (i) => H.card(a + 0.3, bgv(i, t), kick, lines));
const cardP = (a, b, name, src, kick, lines, credit) => add(a, b, name, (i) => H.card(a + 0.3, H.bgP(i, src), kick, lines, credit));

// ---- A: 5.5 - 82.995 (VO p01)
still(5.5, 9.9, 'A01 ceiling cam', 13.3, { mos: undefined });
still(9.9, 15.9, 'A02 tiled floor', 5.2, { credit: RC });
still(15.9, 19.3, 'A03 hooded jacket', 12.5);
still(19.3, 22.7, 'A04 phone', 12.9);
add(22.7, 27.3, 'A05 clock 1346', () => H.stamp(23.2, 'RCMP', 3.6, { x: 255, y: 150, w: 300, h: 50 }));
map(27.3, 31.8, 'A06 alberta', 'c14/map_alberta.jpg', () => [H.place(28.6, 'PIGEON LAKE', 'ALBERTA')]);
cardV(31.8, 35.7, 'A07 samson', 6.2, 'SAMSON CREE NATION', ['CAITLIN BRANDY POTTS', 'MOTHER OF A LITTLE BOY']);
cardP(35.7, 41.1, 'A08 priscilla', 'c14/map_calgary.jpg', 'HER MOTHER, PRISCILLA', ['"GOOFY, LOVING,', 'AND CARING"'], EOX);
map(41.1, 48.3, 'A09 enderby', 'c14/map_enderby.jpg', () => [H.date(41.6, 'EARLY 2016'), H.place(44.8, 'ENDERBY', 'NORTH OKANAGAN, BC')]);
add(48.3, 55.6, 'A10 valley', (i) => H.map(i, 'c14/map_okanagan.jpg', EOX, [
  { x: 817, y: 985, label: 'KELOWNA', at: 50.2 }, { x: 1036, y: 348, label: 'ARMSTRONG', at: 52.8 }, { x: 980, y: 80, label: 'SALMON ARM', at: 53.9 }, { x: 1077, y: 230, label: 'ENDERBY', at: 54.9 }]));
map(55.6, 62.6, 'A11 mall map', 'c14/map_mall.jpg', () => [H.date(55.8, 'SUNDAY 21 FEBRUARY 2016'), H.place(59.5, 'ORCHARD PARK MALL', 'KELOWNA')]);
cardV(62.6, 68.9, 'A12 clock vs police', 2.0, 'THE RCMP SAY SHE CAME IN AT', ['ABOUT 1:30 PM', 'CAMERA CLOCK: 13:46']);
map(68.9, 74.0, 'A13 hudsons bay', 'c14/map_mall.jpg', () => [H.place(69.2, 'HUDSON\'S BAY', 'ORCHARD PARK MALL')]);
cardV(74.0, 77.5, 'A14 fourteen s', 4.4, 'THE WHOLE RECORDING', ['14 SECONDS', 'NO SOUND']);
still(77.5, 82.995, 'A15 quiet doors', 4.9, { credit: RC });

// ---- B: 88.995 - 102.205 (VO p02)
add(88.995, 93.2, 'B01 97 exit', () => H.stamp(89.4, 'RCMP', 3.6, { x: 255, y: 105, w: 210, h: 50 }));
add(93.2, 96.5, 'B02 hb kelow', () => H.stamp(93.5, 'RCMP', 3.8, { x: 1500, y: 0, w: 190, h: 60 }));
still(96.5, 102.205, 'B03 man bag', 8.3);

// ---- C: 106.205 - 122.955 (VO p03)
cardV(106.205, 109.8, 'C01 what she wore', 3.0, 'THE RCMP LATER LISTED', ['WHAT SHE WAS WEARING']);
add(109.8, 115.1, 'C02 clothes', (i) => H.card(110.1, bgv(i, 5.0), 'THREE-QUARTER BLACK JACKET WITH A HOOD', ['LIGHT-COLOURED PANTS', 'BLACK WINTER BOOTS, A SCRUNCHIE']));
still(115.1, 119.1, 'C03 handbag', 12.9, { s: [1.0, 1.08] });
still(119.1, 122.955, 'C04 pocket', 10.6);

// ---- D: 126.955 - 332.645 (VO p04)
still(126.955, 131.8, 'D01 last frame', 13.7, {}, () => [H.date(127.7, 'MONDAY 22 FEBRUARY 2016')]);
cardP(131.8, 137.7, 'D02 kijiji', 'c14/map_calgary.jpg', 'SHE TOLD HER FAMILY', ['A RIDE TO CALGARY', 'FROM SOMEONE ON KIJIJI'], EOX);
map(137.7, 141.9, 'D03 reported', 'c14/map_vernon.jpg', () => [H.date(139.9, '1 MARCH 2016')]);
cardV(141.9, 147.3, 'D04 vernon', 7.0, 'REPORTED MISSING TO THE', ['VERNON NORTH OKANAGAN RCMP']);
cardV(147.3, 151.8, 'D05 april', 4.5, 'APRIL 2016', ['SOUTHEAST DISTRICT', 'MAJOR CRIME UNIT']);
map(151.8, 156.6, 'D06 splatsin', 'c14/map_enderby.jpg', () => [H.place(152.6, 'SPLATSIN COMMUNITY CENTRE', 'ENDERBY')]);
map(156.6, 161.0, 'D07 bridge', 'c14/map_bridge.jpg');
cardV(161.0, 164.1, 'D08 chiefs', 6.6, 'FIRST NATIONS CHIEFS CAME', ['SO DID HER MOTHER']);
cardV(164.1, 169.9, 'D09 belleau', 8.2, 'CHIEF CHARLENE BELLEAU, ESK\'ETEMC', ['"SOMEONE SAW SOMETHING', 'THAT DAY AND CAN HELP US"']);
cardP(169.9, 174.7, 'D10 phillip', 'c14/map_armstrong.jpg', 'GRAND CHIEF STEWART PHILLIP', ['THREE MONTHS ON', 'THE FAMILY WAS HURTING'], EOX);
cardV(174.7, 181.1, 'D11 mmiwg', 9.0, 'THE CHIEFS CALLED FOR MORE ON', ['MISSING AND MURDERED', 'INDIGENOUS WOMEN AND GIRLS']);
add(181.1, 186.9, 'D12 moskaluk', (i) => [...H.photo(i, 'c14/map_enderby.jpg', EOX, { bri: 0.8 }), H.label(181.9, 'CPL. DAN MOSKALUK', 'RCMP')]);
cardV(186.9, 194.3, 'D13 description', 11.2, 'POLICE DESCRIPTION, 2016', ['5 FT 3, BROWN EYES', 'LONG BLACK HAIR, BLONDE STREAKS']);
map(194.3, 197.4, 'D14 same area', 'c14/map_okanagan.jpg');
cardP(197.4, 202.7, 'D15 two more', 'c14/map_salmon.jpg', 'ALSO MISSING IN 2016', ['ASHLEY SIMPSON, APRIL', 'DEANNA WERTZ, 46, JULY'], EOX);
cardV(202.7, 206.1, 'D16 not connected', 5.6, 'THE RCMP SAID', ['THEY DID NOT BELIEVE', 'THE CASES WERE CONNECTED']);
still(206.1, 211.0, 'D17 year', 13.0, {}, () => [H.date(208.4, '26 APRIL 2017')]);
cardV(211.0, 217.0, 'D18 release', 3.4, 'THE RCMP RELEASED THE FOOTAGE', ['"TO PROVIDE A VISUAL REMINDER', 'TO THE PUBLIC OF CAITLIN\'S APPEARANCE"']);
still(217.0, 220.4, 'D19 wearing', 12.6);
map(220.4, 223.1, 'D20 linteau', 'c14/map_vernon.jpg', () => [H.label(220.8, 'STAFF SGT. ANNIE LINTEAU', 'RCMP')]);
cardV(223.1, 227.0, 'D21 homicide', 7.0, 'THE SAME DAY', ['"WE BELIEVE THIS IS', 'LIKELY A HOMICIDE"']);
cardP(227.0, 233.7, 'D22 not left', 'c14/map_alberta.jpg', 'INVESTIGATORS DID NOT BELIEVE', ['SHE HAD LEFT THE OKANAGAN', 'THE CALGARY RIDE: NEVER SUBSTANTIATED'], EOX);
cardV(233.7, 239.2, 'D23 130 contacts', 9.4, 'THE MAJOR CRIME UNIT', ['MORE THAN 130 CONTACTS', 'WITH HER FAMILY']);
map(239.2, 245.0, 'D24 2021', 'c14/map_mall.jpg', () => [H.date(240.4, 'FEBRUARY 2021')]);
cardV(245.0, 251.8, 'D25 25 tips', 5.0, 'SUPT. SANJAYA WIJAYAKOON', ['25 TIPS FROM THE PUBLIC', 'HUNDREDS OF LEADS FOLLOWED']);
cardV(251.8, 255.8, 'D26 committed', 6.2, 'ALTHOUGH CAITLIN HAS NOT BEEN FOUND', ['THE UNIT "REMAINS COMMITTED"']);
map(255.8, 259.4, 'D27 appeal', 'c14/map_bridge.jpg');
cardV(259.4, 263.0, 'D28 five years', 8.8, 'PRISCILLA POTTS, HER MOTHER', ['"THESE PAST 5 YEARS HAVE BEEN', 'THE HARDEST YEARS OF MY LIFE"']);
cardV(263.0, 267.9, 'D29 laid to rest', 10.2, 'PRISCILLA POTTS', ['"CAITLIN DESERVES TO BE LAID TO REST.', 'PLEASE HELP ME FIND MY DAUGHTER"']);
map(267.9, 271.2, 'D30 2023', 'c14/map_enderby.jpg', () => [H.date(268.1, 'JULY 2023')]);
map(271.2, 277.3, 'D31 shuswap bridge', 'c14/map_bridge.jpg', () => [H.place(272.0, 'SHUSWAP RIVER BRIDGE', 'ENDERBY')]);
cardV(277.3, 282.7, 'D32 brother', 11.8, 'HER YOUNGER BROTHER, JERIMIAH', ['THE FAMILY STILL GRIEVES', 'AND STILL WONDERS WHERE SHE IS']);
cardV(282.7, 286.0, 'D33 justice', 1.4, 'JODY LEON, SPLATSIN ADVOCATE', ['"CAITLIN DESERVES JUSTICE"']);
cardV(286.0, 289.7, 'D34 global news', 9.4, 'GLOBAL NEWS NOTED', ['HER CASE HAD FADED FROM THE HEADLINES']);
cardV(289.7, 295.2, 'D35 no new info', 6.0, 'THE RCMP, AFTERWARD', ['NO NEW INFORMATION', 'THE INVESTIGATION IS STILL OPEN']);
cardV(295.2, 300.1, 'D36 extensive', 4.0, 'THE RCMP', ['"AN EXTENSIVE SEARCH UTILIZING ALL', 'AVAILABLE POLICE RESOURCES"']);
map(300.1, 305.0, 'D37 tipline', 'c14/map_okanagan.jpg');
cardV(305.0, 311.8, 'D38 2026', 1.0, 'FEBRUARY 2026, TEN YEARS ON', ['STILL MISSING', 'THE RCMP APPEAL WENT OUT AGAIN']);
cardV(311.8, 315.3, 'D39 major crime', 7.0, 'SOUTHEAST DISTRICT MAJOR CRIME UNIT', ['1-877-987-8477']);
cardV(315.3, 321.0, 'D40 crime stoppers', 8.0, 'CRIME STOPPERS', ['1-800-222-8477']);
map(321.0, 327.0, 'D41 valley', 'c14/map_vernon.jpg');
add(327.0, 332.645, 'D42 end', (i) => [...H.card(327.3, bgv(i, 12.3), 'CAITLIN BRANDY POTTS', ['NEVER FOUND', 'NO ONE CHARGED']), H.dip(0, 40)]);

export default makeCase({
  id: 'lm_case14', num: 14, title: 'FOURTEEN SECONDS AT THE MALL DOOR',
  plate: ['c14/map_mall.jpg', EOX],
  vo: [['vo/c14_p01.wav', 6.0], ['vo/c14_p02.wav', 89.495], ['vo/c14_p03.wav', 106.705], ['vo/c14_p04.wav', 127.455]],
  raws: [
    { tag: 'RCMP', a: 82.995, b: 88.995, t: 0.0, speed: 0.5, mute: true, credit: RC, mos: MAN },
    { tag: 'RCMP', a: 102.205, b: 106.205, t: 7.7, speed: 0.5, mute: true, mos: MAN },
    { tag: 'RCMP', a: 122.955, b: 126.955, t: 10.6, speed: 0.5, mute: true, mos: MAN },
  ],
  shots: SH, end: 332.645,
});
