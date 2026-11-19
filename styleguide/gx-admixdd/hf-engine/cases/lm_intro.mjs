// lm_intro - intro of "Most Disturbing Last Moment Footage Ever Recorded" (new channel; devices/lm.mjs). 60 fps, 59.04 s (v3 2026-11-19).
// Timeline = docs/ai-state/last-moments_build1_HANDOFF.md "Timeline for lm_intro" (agent 3 conveyor retime: P0 full frame first).
// VO c00.wav (cleaned v3, 47.475 s, first word ramped) at 2.90: part t = 2.90 + clean-VO word onset. Hard cuts; dips 16 down / 14 up; glitch only on the warning.
// Faces (owner rule 16, victims + private people): CGF both women tracked (keys in source s, src px 720x720), RAD clerk + woman.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix (handoff "STEP 4"): VO -28.5 LUFS I. Music = VO -10 (-38.5 short-term, levelled lane), -12 dB in dips; music/SFX fade in
// over 1.5 s from 0; VO never faded. SFX v2 (owner 2026-11-19 "good SFX but a little lower than music"; docs/ai-state/last-moments_sfx_HANDOFF.md):
// one Epidemic family per device; each SFX max momentary = music target over its loud span - 3 dB (panel whooshes -4, typing stream -6,
// warning static bed I = music -2). Table = [dur s, I, max M (short files padded), true peak, peak-at s] by ffmpeg ebur128.
const VO_PK = -3.1, MUS_T = -38.5;
const SFX = { lm_boom: [4.183, -21.7, -17.7, -11.6, 0.176], lm_whoosh: [1.549, -19.3, -16.3, -2.4, 0.469], lm_key: [0.11, -70, -25.6, -4.6, 0.016],
  glitch_click: [0.53, -22.2, -21.1, -9.5, 0.05], riser_dark: [5.91, -23.0, -16.7, -10.6, -1], static_lp: [6, -32.4, -31.1, -20, 0] };
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
// gain from the music target min over the loud span (peak-at .. +1 s; risers: last 1.5 s), so dips never let an SFX poke above the bed
const sfx = (name, at, off = -3, len) => {
  const [d0, , M, , pk] = SFX[name], d = len ?? d0, tg = dipT(MUS_T, 0), a0 = pk < 0 ? at + d - 1.5 : at + Math.max(0, pk - 0.05);
  let m = 99; for (let u = 0; u <= (pk < 0 ? 1.5 : 1.0) + 1e-6; u += 0.05) m = Math.min(m, tg(a0 + u));
  const g = db(m + off - M), fo = name === 'lm_boom' ? 0.8 : 0.03;
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at: +at.toFixed(3), to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.015, g], [+(d - fo - 0.02).toFixed(3), g], [+(d - 0.03).toFixed(3), 0]] };
};
// conveyor panel moves (36 f): whoosh peak (0.469 s) on the move midpoint (+0.3 s) -> start = move start - 0.17 (C 476 skipped: riser starts there)
const MOVES = [[8.105, [95, 173, 282, 372]], [25.565, [110, 206, 320]], [32.855, [108, 210, 371, 568]]].flatMap(([c, fs]) => fs.map((f) => +(c + f / 60 - 0.17).toFixed(3)));
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70));
};
function musLane(file, trim, len, tgt, fin, fout, extra = []) {
  const S = stS(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))];
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  for (let u = 0; u < len; u += 0.5) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-24, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}
// dip (part s): ledger out 53.265-53.535 / title in 53.535-53.765. Music -12 dB, 0.1 s ramps.
const DIPS = [[53.265, 53.765]];
const dipT = (base, off) => (u) => { const t = u + off; let d = 0; for (const [a, b] of DIPS) d = Math.max(d, Math.min(1, (t - a + 0.1) / 0.1, (b + 0.1 - t) / 0.1)); return base - 12 * Math.max(0, d); };
const dipPts = (off) => DIPS.flatMap(([a, b]) => [a - 0.1, a, b, b + 0.1]).map((t) => t - off);

// ---- face tracks (source s, src px [x,y,w,h], >= 15 % bigger than face + hair)
const CG_A = [ // CGF 19.5-22.92 (left woman = victim, right = private fan)
  { keys: [[19.5, 95, 40, 170, 230], [19.88, 130, 50, 150, 220], [20.26, 115, 60, 145, 210], [20.64, 115, 50, 150, 200], [21.02, 175, 70, 150, 215], [21.4, 225, 90, 160, 200], [21.78, 215, 100, 150, 210], [22.16, 205, 90, 160, 200], [22.54, 205, 70, 160, 220], [22.92, 195, 90, 150, 220]] },
  { keys: [[19.5, 345, 80, 170, 230], [19.88, 345, 50, 170, 240], [20.26, 375, 70, 160, 240], [20.64, 395, 90, 160, 240], [21.02, 405, 90, 170, 240], [21.4, 425, 120, 170, 230], [21.78, 405, 120, 160, 240], [22.16, 385, 110, 170, 240], [22.54, 345, 120, 160, 230], [22.92, 325, 120, 170, 240]] },
];
const CG_B = [ // CGF 9.0-13.98 (split P1)
  { keys: [[9.0, 115, 80, 135, 190], [9.55, 135, 90, 135, 195], [10.1, 125, 90, 125, 190], [10.65, 75, 90, 145, 195], [11.2, 25, 110, 145, 195], [11.75, 0, 90, 110, 195], [12.3, 0, 90, 110, 195], [12.85, 25, 90, 145, 195], [13.4, 35, 100, 135, 185], [13.98, 95, 90, 145, 195]] },
  { keys: [[9.0, 455, 110, 170, 215], [9.55, 435, 130, 150, 195], [10.1, 445, 140, 160, 190], [10.65, 435, 140, 170, 190], [11.2, 475, 130, 170, 200], [11.75, 475, 150, 150, 200], [12.3, 485, 150, 160, 200], [12.85, 515, 150, 170, 200], [13.4, 495, 150, 170, 200], [13.98, 475, 130, 170, 220]] },
];
const RAD_F = [{ r: [72, 14, 68, 64] }, { r: [187, 14, 68, 76] }]; // RAD 486x360 clerk + woman (handoff boxes +15 %)

const MET = 'FOOTAGE: METROPOLITAN POLICE', WEDC = 'FOOTAGE: POLICE RELEASE (VIA DOCUMENTARY)';
// QA 1 (agent 3): footage YAVG was 68-118 -> per-shot brightness so footage sits ~55-65 (intro target 52-58 overall, cards darker)
const G = (bri, ...k) => n('Grade', { bri }, ...k);
const clip = (p, bri, credit, place) => G(bri, n('LClip', p), ...(credit ? [n('Credit', { text: credit, place })] : []));
// conveyors (frame = round((t - shot start) * 60); moves 36 f; every panel on screen >= 3 s). v3 (2026-11-19): word-precise picture.
const panel = (keys, c) => n('Panel', { keys, clip: c });
// A 8.105-17.145: dive 8.93 (full) | "a stream sign-off" 9.685=95 | "a vlog" 10.985=173 | "shop doorway" 12.80=282 | HCR full 14.30=372
const convA = () => G(0.62, n('Split2', {},
  panel([[0, 0, 1920], [95, 0, 1920], [131, 0, 960], [173, 0, 960], [209, -960, 960]], { src: 'LIP', t: 60, sw: 1620, sh: 1080 }),
  panel([[95, 1920, 960], [131, 960, 960], [173, 960, 960], [209, 0, 960], [282, 0, 960], [318, -960, 960]], { src: 'CGF', t: 19.5, speed: 0.9, sw: 720, sh: 720, mos: CG_A }),
  panel([[173, 1920, 960], [209, 960, 960], [282, 960, 960], [318, 0, 960], [372, 0, 960], [408, -960, 960]], { src: 'CRV', t: 195.5, speed: 0.85, sw: 1920, sh: 1080, scale: 1.35, origin: '55% 100%' }), // crop the head (no face) + CRAVE LIFE mark
  panel([[282, 1920, 960], [318, 960, 960], [372, 960, 960], [408, 0, 1920], [542, 0, 1920]], { src: 'HCR', t: 0, speed: 0.8, sw: 640, sh: 480 }),
), n('Credit', { text: MET, at: 414, hold: 62 }));
// (CRV 236 @0.4 = source 236-237.6 only: from ~238 the vlogger faces the lens = no-face rule)
// B 25.565-32.855: "filmed themselves" 0 (full) | "a friend's phone" 27.40=110 | "and some .. security camera" 29.005=206 | WED full 30.90=320
const convB = () => G(0.62, n('Split2', {},
  panel([[0, 0, 1920], [110, 0, 1920], [146, 0, 960], [206, 0, 960], [242, -960, 960]], { src: 'CRV', t: 236, speed: 0.4, sw: 1920, sh: 1080, scale: 1.08, origin: '80% 10%' }),
  panel([[110, 1920, 960], [146, 960, 960], [206, 960, 960], [242, 0, 960], [320, 0, 960], [356, -960, 960]], { src: 'CGF', t: 9.0, sw: 720, sh: 720, mos: CG_B }),
  panel([[206, 1920, 960], [242, 960, 960], [320, 960, 960], [356, 0, 1920], [437, 0, 1920]], { src: 'WED', t: 121.8, speed: 0.95, sw: 1920, sh: 1080, scale: 1.22, origin: '0% 0%' }),
), n('Credit', { text: WEDC, place: 'br', at: 246, hold: 125 }));
// C 32.855-46.535 (frame = round((t - 32.855) * 60)): entries 34.655=108, 36.355=210, 39.035=371, 40.795=476, 42.315=568
const split = () => G(0.62, n('Split2', {},
  panel([[0, 0, 1920], [108, 0, 1920], [144, 0, 960], [210, 0, 960], [246, -960, 960]], { src: 'LIP', t: 140, sw: 1620, sh: 1080 }),
  panel([[108, 1920, 960], [144, 960, 960], [210, 960, 960], [246, 0, 960], [371, 0, 960], [407, -960, 960]], { src: 'CGF', t: 19.5, speed: 0.68, sw: 720, sh: 720, mos: CG_A }), // CG_B is in conveyor B now
  panel([[210, 1920, 960], [246, 960, 960], [371, 960, 960], [407, 0, 960], [476, 0, 960], [512, -960, 960]], { src: 'CRV', t: 351, sw: 1920, sh: 1080, pos: '40% 50%' }),
  panel([[371, 1920, 960], [407, 960, 960], [476, 960, 960], [512, 0, 960], [568, 0, 960], [604, -960, 960]], { src: 'RAD', t: 75, sw: 486, sh: 360, scale: 1.1, origin: '50% 100%', mos: RAD_F }),
  panel([[476, 1920, 960], [512, 960, 960], [568, 960, 960], [604, 0, 1920], [821, 0, 1920]], { src: 'WED', t: 84.02, speed: 0.67, sw: 1920, sh: 1080, scale: 1.22, origin: '50% 0%' }),
));
// ---- title typing (TitleType): shot starts T0; char k of the title lands at frame fb + ceil((k + 1) / rate); a quiet key tick every 2nd char
const T0 = 53.535, END = 59.04, TY = { a: 'CASE 1', b: 'THE CODEBREAKER WHO WALKED OUT OF FRAME', fa: 24, fb: 62, rate: 0.3 };
const ticks = [];
for (const [txt, f0] of [[TY.a, TY.fa], [TY.b, TY.fb]]) for (let k = 0; k < txt.length; k += 2) {
  if (txt[k] === ' ' && k + 1 < txt.length) k += 1;
  // typewriter key (lm_key); stream of ~9 keys/s reads +5.6 dB over one key's padded M -> stream max M = music - 6
  const at = +(T0 + (f0 + Math.ceil((k + 1) / TY.rate)) / 60).toFixed(3), g = db(MUS_T - 6 - (SFX.lm_key[2] + 10 * Math.log10(0.4 * TY.rate * 30)));
  ticks.push({ src: 'lm_key', id: `tk_${Math.round(at * 1000)}`, file: 'sfx/lm_key.wav', at, to: +(at + 0.105).toFixed(3), lane: [[0, 0], [0.005, g], [0.08, g], [0.1, 0]] });
}

export default {
  id: 'lm_intro',
  media: 'last-moments',
  end: END,
  plain: true,
  vo: { starts: [2.90], lens: [47.475], file: () => 'vo/c00.wav', tail: 0 },
  devices: ['shared', 'lm', 'lm_v2'],
  fonts: ['Anton-latin.woff2', 'Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'IBMPlexMono-700-latin.woff2', 'VCROSDMono-latin.woff2'],
  shots: [
    { name: 'L00 warning', c: 0, to: 2.60, k: 'hard', n: 0, el: () => n('GlitchOut2', { n: 10, seed: 'lmw' }, n('Warning2')) },
    // "Final 3.085 footage .. In many ways it's the most ordinary video" (there 7.915)
    { name: 'L01 HPK', c: 2.60, to: 8.105, k: 'hard', n: 0, el: () => clip({ src: 'HPK', t: 0, speed: 0.9, sw: 640, sh: 480, fit: 'contain', fill: true, scale: 1.04, origin: '50% 100%' }, 0.85, MET, 'tl') }, // credit top-left: CAM 1 stamp is top-right
    // "there is: A dive 8.93, a stream sign-off 9.71, a vlog 11.02, a walk past a shop doorway 11.91-13.5. Nobody filming .. anything"
    { name: 'L02 conveyor A', c: 8.105, to: 17.145, k: 'hard', n: 0, el: () => convA() },
    // "But 17.17 in other ways .. every other clip on the internet"
    { name: 'L03 RAD', c: 17.145, to: 20.565, k: 'hard', n: 0, el: () => clip({ src: 'RAD', t: 75, sw: 486, sh: 360, fit: 'contain', fill: true, scale: 1.1, origin: '50% 100%', mos: RAD_F }, 0.62, 'FOOTAGE: KALAMAZOO COUNTY RELEASE', 'br') },
    // "because 20.59 for every person in this video, it's the last time anyone saw them"
    { name: 'L04 LIP blue', c: 20.565, to: 25.565, k: 'hard', n: 0, el: () => clip({ src: 'LIP', t: 174, sw: 1620, sh: 1080 }, 0.72) },
    // "Some 25.59 .. filmed themselves. Some 27.55 .. a friend's phone caught, and 29.03 some .. security camera 30.11 nobody was watching at the time"
    { name: 'L05 conveyor B', c: 25.565, to: 32.855, k: 'hard', n: 0, el: () => convB() },
    // "a dive into the Blue Hole, a fan line in Orlando, a cabin porch .., a hotel lobby .., a fuel station in Kent. Every clip stops .. next."
    { name: 'L06 conveyor C', c: 32.855, to: 46.535, k: 'hard', n: 0, el: () => split() },
    // "today 46.56" -> 21 cases (VO ends ~50.2); dip; ONE title screen (owner 2026-11-19: no zoom onto case 01, no second card)
    { name: 'L07 ledger', c: 46.535, to: T0, k: 'hard', n: 0, el: () => [n('Descent'), n('Dip', { outN: 16 })] },
    { name: 'L08 CASE 1 title', c: T0, to: END, k: 'hard', n: 0, el: () => [n('TitleType', { ...TY, plate: { src: 'HCR', t: 1.5, speed: 0.25 } }), n('Dip', { inN: 14 })] },
  ],
  audio: [
    // warning static bed (film/static texture only here): I = music -2 (SFX v2; was VO +3), drops 9 dB as the glitch hits (2.43), tails to 2.87
    { src: 'static', id: 'bed_static', file: 'sfx/static_lp.wav', at: 0, to: 2.90, lane: [[0, 0], [1.5, db(MUS_T - 2 + 32.4)], [2.40, db(MUS_T - 2 + 32.4)], [2.50, db(MUS_T - 11 + 32.4)], [2.87, 0]] },
    sfx('glitch_click', 2.42, -2), // warning exit hit: max M = music -2 (over the -9 dB bed)
    { src: 'mus_a', id: 'mus_intro', file: 'music/es_tarmac_radiation.mp3', at: 0, to: END, lane: musLane('music/es_tarmac_radiation.mp3', 0, END, dipT(MUS_T, 0), 1.5, 5.3, dipPts(0)) },
    { src: 'mus_b', id: 'mus_title', file: 'music/es_dark_days.mp3', at: T0 + 0.23, to: END, lane: musLane('music/es_dark_days.mp3', 0, +(END - T0 - 0.23).toFixed(3), () => MUS_T, 2, 0) },
    ...MOVES.map((t) => sfx('lm_whoosh', t, -4)), // panel slides (camera-move family)
    sfx('riser_dark', 40.625), // riser lands on the ledger cut 46.535
    sfx('lm_boom', 46.535 - 0.17), // boom peak on the ledger reveal
    sfx('lm_boom', T0 + 0.23), // title card hit (peak 53.94, music back from the dip)
    ...ticks.filter((t) => t.at >= T0 + 0.23 + 0.3), // no key inside 0.3 s of the title boom
  ],
};
