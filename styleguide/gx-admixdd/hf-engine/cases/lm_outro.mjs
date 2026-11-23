// lm_outro - outro of "Most Disturbing Last Moment Footage Ever Recorded" (2026-11-23, lead). VO c99_p01 (24.8 s) at 0.8 s,
// then a 20 s end-screen hold (YouTube end-screen elements go on top). No title screen. Photos: Openverse / Flickr CC BY 2.0.
import { makeCase, H } from './lm_lib.mjs';

const V = 0.8; // VO start; word times below = V + words.json start
const CR = { wide: 'PHOTO: B. W. TOWNSEND / CC BY 2.0', far: 'PHOTO: U.S. MARSHALS SERVICE / CC BY 2.0', candle: 'PHOTO: KOMUNEWS / CC BY 2.0', crowd: 'PHOTO: B. W. TOWNSEND / CC BY 2.0' };
const shots = [
  [0, 7.2, 'O1 vigil wide', (i) => [H.photo(i, 'c99/vigil_wide.jpg', CR.wide, { bri: 0.7 }), H.dip(30, 0)]],
  [7.2, 12.2, 'O2 still open', (i) => H.card(V + 6.6, H.bgP(i, 'c99/vigil_far.jpg', 0.45), 'STILL OPEN', ['7 OF THESE 21 CASES', 'NO VERDICT OR FINAL FINDING'], CR.far)],
  [12.2, 18.6, 'O3 police', (i) => H.card(V + 11.5, H.bgP(i, 'c99/candle.jpg', 0.45), 'IF YOU KNOW SOMETHING', ['TELL THE POLICE FORCE', 'NAMED IN THAT CASE'], CR.candle)],
  [18.6, 46.0, 'O4 say their name + end screen', (i) => H.card(V + 21.2, H.bgP(i, 'c99/vigil_crowd.jpg', 0.4), '', ['SAY THEIR NAME'], CR.crowd)],
];
export default makeCase({ id: 'lm_outro', num: 99, title: null, plate: [null, null], vo: [['vo/c99_p01.wav', V]], raws: [], shots, end: 46.0, music: 0 });
