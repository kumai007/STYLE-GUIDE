// lm_case10 - "The streetlight on the median" (Nacharam, Hyderabad). NCH source is age-locked: NO raw, raws: [] (the 7 s raw window 83.22-90.22 is a "footage not shown" card).
// Table-driven via lm_lib.mjs. All times = part seconds. Notes: productions/last-moments/edit/notes/c10.md
import { makeCase, H } from './lm_lib.mjs';

const MAP = 'MAP: SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)';
const CC = {
  pin: 'PHOTO: PINAKPANI / CC BY 4.0', neck: 'PHOTO: IMAHESH / CC BY-SA 4.0', hyd: 'PHOTO: RANDHIRREDDY AT ENGLISH WIKIPEDIA / CC BY-SA 3.0',
  kol: 'PHOTO: KRITI DEEP / CC BY-SA 2.0', old: 'PHOTO: HABEEBU RAHMAN PP / CC BY-SA 3.0', traf: 'PHOTO: OLEG YUNAKOV / CC BY-SA 2.0', khi: 'PHOTO: KAVALI CHANDRAKANTH KCK / CC BY-SA 4.0', vill: 'PHOTO: ANUJARYA300 / CC BY-SA 4.0',
};
const SH = [];
const add = (a, b, name, fn) => SH.push([a, b, name, fn]);
const photo = (a, b, name, f, cr, o = {}, extra = () => []) => add(a, b, name, (i) => [...H.photo(i, `c10/${f}.jpg`, cr, o), ...extra()]);
const card = (a, b, name, bg, kick, lines, o = {}) => add(a, b, name, (i) => H.card(a + 0.3, H.bgP(i, `c10/${bg}.jpg`, o.bri ?? 0.5), kick, lines));

// ---- A: VO p01 6.0 - 82.87
add(5.5, 10.5, 'A01 map nacharam', (i) => H.map(i, 'c10/map_nach.jpg', MAP, [{ x: 960, y: 540, label: 'NACHARAM CROSSROADS', sub: 'HYDERABAD', at: 6.9 }]));
photo(10.5, 16.9, 'A02 road night', 'n_b', CC.pin);
photo(16.9, 21.5, 'A03 headlights', 'n_g', CC.pin);
add(21.5, 27.6, 'A04 map hyderabad', (i) => H.map(i, 'c10/map_hyd.jpg', MAP, [{ x: 882, y: 624, label: 'HYDERABAD', sub: 'TELANGANA', at: 21.8 }]));
photo(27.6, 33.4, 'A05 festival traffic', 'g_neck', CC.neck, { pos: '50% 40%' });
add(33.4, 40.4, 'A06 map route', (i) => H.map(i, 'c10/map_route.jpg', MAP, [
  { x: 809, y: 949, label: 'HABSIGUDA', at: 33.6 }, { x: 960, y: 748, label: 'NACHARAM', at: 35.0 }, { x: 1065, y: 137, label: 'KAPRA POND', at: 37.6 }]));
card(40.4, 47.0, 'A07 sathvik', 'b_traf', 'ACCORDING TO NEWSMETER', ['BAGUDAM SATHVIK, 23', 'SOFTWARE EMPLOYEE']);
card(47.0, 50.2, 'A08 age 25', 'n_c', 'ONE OTHER REPORT', ['GAVE HIS AGE AS 25']);
photo(50.2, 54.2, 'A09 early hours', 'n_f', CC.pin, {}, () => [H.date(51.4, 'TUESDAY, 2 SEPTEMBER 2025')]);
photo(54.2, 60.0, 'A10 two-wheeler', 'n_e', CC.pin);
add(60.0, 66.2, 'A11 nacharam xroads', (i) => H.map(i, 'c10/map_nach.jpg', MAP, [{ x: 960, y: 540, label: 'NACHARAM CROSSROADS', at: 60.3 }]));
card(66.2, 71.2, 'A12 shop camera', 'n_a', 'A SHOP SECURITY CAMERA', ['PHONE RECORDING OF ITS MONITOR']);
photo(71.2, 75.9, 'A13 pole median', 'n_h', CC.pin);
photo(75.9, 82.9, 'A14 road away', 'n_i', CC.pin);
// raw window 83.22-90.22 (no footage available): VO silent 82.87-90.72
card(82.9, 90.9, 'R1 footage not shown', 'n_j', 'CCTV, NACHARAM', ['FOOTAGE NOT SHOWN']);

// ---- B: VO p02 90.72 - 186.9
photo(90.9, 94.3, 'B01 idol lorry', 'g_khi', CC.khi);
card(94.3, 101.2, 'B02 shome', 'w_var', 'ACCORDING TO', ['PRATIMA SHOME', 'SUPERINTENDING ENGINEER, TGSPDCL']);
photo(101.2, 107.3, 'B03 cables streetlight', 'w_kol', CC.kol);
card(107.3, 112.7, 'B04 newsmeter cable', 'g_khi2', 'NEWSMETER REPORTED', ['THE IDOL TOP CAUGHT AN', 'INTERNET CABLE TIED TO THE POLE']);
photo(112.7, 117.6, 'B05 two poles', 'w_vill', CC.vill);
card(117.6, 122.0, 'B06 died', 'g_nim', '2 SEPTEMBER 2025', ['SATHVIK DIED AT THE SCENE']);
photo(122.0, 126.6, 'B07 witnesses', 'p_traf', CC.traf, { pos: '50% 92%' });
card(126.6, 132.6, 'B08 india today', 'b_two', 'BY THE END OF THE DAY', ['ALL OVER SOCIAL MEDIA', 'INDIA TODAY PICKED UP THE STORY']);
card(132.6, 136.0, 'B09 local channel', 'n_f', 'A LOCAL CHANNEL', ['POSTED THE MONITOR RECORDING']);
card(136.0, 142.8, 'B10 calendar', 'n_h', "THE RECORDER'S CALENDAR", ['SEPTEMBER 2025', 'THE 2ND LIT UP']);
card(142.8, 147.9, 'B11 rusted', 'w_coorg', 'OFFICIALS CONFIRMED', ['THE POLE WAS BADLY RUSTED']);
card(147.9, 153.9, 'B12 tgspdcl', 'n_i', 'THE POWER COMPANY', ['"FATAL NON-DEPARTMENTAL', 'ACCIDENT"']);
card(153.9, 158.2, 'B13 police', 'p_traf2', 'POLICE FINDING', ['RIDING ON THE WRONG', 'SIDE OF THE ROAD']);
card(158.2, 162.8, 'B14 not show', 'n_e', 'THE FOOTAGE', ['DOES NOT SHOW IT EITHER WAY']);
photo(162.8, 168.3, 'B15 neglect', 'w_old', CC.old);
card(168.3, 172.6, 'B16 case', 'n_g', 'NACHARAM POLICE', ['CASE REGISTERED', 'INVESTIGATION CONTINUING']);
card(172.6, 179.3, 'B17 no report', 'n_b', 'NO REPORT FOUND OF', ['AN ARREST, A CHARGE', 'OR COMPENSATION']);
card(179.3, 185.1, 'B18 ten died', 'g_khi', 'ACCORDING TO NEWSMETER', ['ABOUT 10 PEOPLE DIED', 'DURING THAT FESTIVAL']);
photo(185.1, 188.395, 'B19 end', 'g_hyd', CC.hyd);

export default makeCase({
  id: 'lm_case10', num: 10, title: 'THE STREETLIGHT ON THE MEDIAN',
  plate: ['c10/n_d.jpg', CC.pin],
  vo: [['vo/c10_p01.wav', 6.0], ['vo/c10_p02.wav', 90.72]],
  raws: [],
  shots: SH,
  end: 188.395,
});
