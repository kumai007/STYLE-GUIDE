// lm_intro - intro of "Most Disturbing Last Moment Footage Ever Recorded" (new channel; devices/lm.mjs). 60 fps, 61.11 s.
// Timeline = docs/ai-state/last-moments_build1_HANDOFF.md "Timeline for lm_intro" (agent 3 conveyor retime: P0 full frame first).
// VO c00.wav (cleaned, 47.45 s) at 2.70: part t = 2.70 + clean-VO word onset. Hard cuts; dips 16 down / 14 up; glitch only on the warning.
// Faces (owner rule 16, victims + private people): CGF both women tracked (keys in source s, src px 720x720), RAD clerk + woman.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'last-moments');
const n = (d, p = {}, ...k) => ({ d, p, k });

// ---- mix (handoff "STEP 4"): VO -28.5 LUFS I. Music = VO -10 (-38.5 short-term, levelled lane), -12 dB in dips; SFX = VO -14
// (-42.5 by I) capped at music -1 by max momentary (coc helper); glitch + tick by peak (glitch -14 dB re VO peak over the warning bed,
// tick -22 re VO peak); warning static bed = VO +3 LU; music/SFX fade in over 1.5 s from 0; VO never faded.
const VO_PK = -3.1, MUS_T = -38.5, SFX_T = -42.5;
const SFX = { boom_low: [3.5, -24.4, -20.7, -3.0], glitch_click: [0.53, -22.2, -21.1, -9.5], riser_dark: [5.91, -23.0, -16.7, -10.6], tick_soft: [0.32, -70, -120, -10.5], static_lp: [6, -32.4, -31.1, -20] };
const db = (x) => +Math.pow(10, x / 20).toFixed(4);
const sfx = (name, at, gdB, len) => {
  const [d0, L, M] = SFX[name], d = len ?? d0, g = db(gdB ?? Math.min(SFX_T - L, MUS_T - 1 - M));
  return { src: name, id: `sfx_${name}_${Math.round(at * 100)}`, file: `sfx/${name}.wav`, at, to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.02, g], [d - 0.1, g], [d - 0.03, 0]] };
};
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
// dips (part s): ledger out 53.04-53.31 / return in 53.31-53.54; return out 55.54-55.81 / card in 55.81-56.04. Music -12 dB, 0.1 s ramps.
const DIPS = [[53.04, 53.54], [55.54, 56.04]];
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
// conveyor (split shot starts 32.63; frame = round((t - 32.63) * 60)): entries 34.43=108, 36.13=210, 38.81=371, 40.57=476, 42.09=568; moves 36 f
const panel = (keys, c) => n('Panel', { keys, clip: c });
const split = () => G(0.62, n('Split2', {},
  panel([[0, 0, 1920], [108, 0, 1920], [144, 0, 960], [210, 0, 960], [246, -960, 960]], { src: 'LIP', t: 140, sw: 1620, sh: 1080 }),
  panel([[108, 1920, 960], [144, 960, 960], [210, 960, 960], [246, 0, 960], [371, 0, 960], [407, -960, 960]], { src: 'CGF', t: 9.0, sw: 720, sh: 720, mos: CG_B }),
  panel([[210, 1920, 960], [246, 960, 960], [371, 960, 960], [407, 0, 960], [476, 0, 960], [512, -960, 960]], { src: 'CRV', t: 351, sw: 1920, sh: 1080, pos: '40% 50%' }),
  panel([[371, 1920, 960], [407, 960, 960], [476, 960, 960], [512, 0, 960], [568, 0, 960], [604, -960, 960]], { src: 'RAD', t: 75, sw: 486, sh: 360, scale: 1.1, origin: '50% 100%', mos: RAD_F }),
  panel([[476, 1920, 960], [512, 960, 960], [568, 960, 960], [604, 0, 1920], [821, 0, 1920]], { src: 'WED', t: 84.02, speed: 0.67, sw: 1920, sh: 1080, scale: 1.22, origin: '50% 0%' }),
));

export default {
  id: 'lm_intro',
  media: 'last-moments',
  end: 61.11,
  plain: true,
  vo: { starts: [2.70], lens: [47.45], file: () => 'vo/c00.wav', tail: 0 },
  devices: ['shared', 'lm'],
  fonts: ['Anton-latin.woff2', 'Oswald-var-latin.woff2', 'BebasNeue-latin.woff2', 'IBMPlexMono-500-latin.woff2', 'IBMPlexMono-600-latin.woff2', 'IBMPlexMono-700-latin.woff2'],
  shots: [
    { name: 'L00 warning', c: 0, to: 2.60, k: 'hard', n: 0, el: () => n('GlitchCut', { n: 8, seed: 'lmw' }, n('Warning')) },
    // "Final footage .. ordinary video there is"
    { name: 'L01 HPK', c: 2.60, to: 8.52, k: 'hard', n: 0, el: () => clip({ src: 'HPK', t: 0, speed: 0.85, sw: 640, sh: 480, fit: 'contain', fill: true, scale: 1.04, origin: '50% 100%' }, 0.85, MET, 'tl') }, // credit top-left: CAM 1 stamp is top-right
    // "A dive, a stream sign-off, a vlog"
    { name: 'L02 LIP fins', c: 8.52, to: 11.66, k: 'hard', n: 0, el: () => clip({ src: 'LIP', t: 60, sw: 1620, sh: 1080 }, 0.60) },
    // "a walk past a shop doorway. Nobody filming .."
    { name: 'L03 HCR', c: 11.66, to: 16.92, k: 'hard', n: 0, el: () => clip({ src: 'HCR', t: 0, speed: 0.70, sw: 640, sh: 480, fit: 'contain', fill: true, scale: 1.04, origin: '50% 100%' }, 0.65, MET) },
    // "But in other ways .. internet"
    { name: 'L04 CGF', c: 16.92, to: 20.34, k: 'hard', n: 0, el: () => G(1.4, n('Vertical', { src: 'CGF', t: 19.5, sw: 720, sh: 720, mos: CG_A })) },
    // "because for every person .. last time anyone saw them"
    { name: 'L05 LIP blue', c: 20.34, to: 25.34, k: 'hard', n: 0, el: () => clip({ src: 'LIP', t: 174, sw: 1620, sh: 1080 }, 0.72) },
    // "Some .. filmed themselves. Some .. friend's phone caught"
    { name: 'L06 CRV', c: 25.34, to: 28.78, k: 'hard', n: 0, el: () => clip({ src: 'CRV', t: 195.5, sw: 1920, sh: 1080, scale: 1.08, origin: '80% 10%' }, 0.55) },
    // "and some .. security camera nobody was watching"
    { name: 'L07 WED gate', c: 28.78, to: 32.63, k: 'hard', n: 0, el: () => clip({ src: 'WED', t: 121.8, sw: 1920, sh: 1080, scale: 1.22, origin: '0% 0%' }, 0.75, WEDC, 'br') }, // origin top-left keeps the burned timestamp whole; credit bottom-right
    // "a dive into the Blue Hole, a fan line in Orlando, a cabin porch .., a hotel lobby .., a fuel station in Kent. Every clip stops .. next."
    { name: 'L08 split', c: 32.63, to: 46.31, k: 'hard', n: 0, el: () => split() },
    // "today" -> 21 cases
    { name: 'L09 ledger', c: 46.31, to: 53.31, k: 'hard', n: 0, el: () => [n('Ledger'), n('Dip', { outN: 16 })] },
    { name: 'L10 ledger return', c: 53.31, to: 55.81, k: 'hard', n: 0, el: () => [n('Ledger', { ret: true }), n('Dip', { inN: 14, outN: 16 })] },
    { name: 'L11 CASE 01', c: 55.81, to: 61.11, k: 'hard', n: 0, el: () => [n('CaseCard', { no: '01', name: ['THE CODEBREAKER WHO', 'WALKED OUT OF FRAME'], plate: { src: 'HCR', t: 1.5, speed: 0.25 } }), n('Dip', { inN: 14 })] },
  ],
  audio: [
    { src: 'static', id: 'bed_static', file: 'sfx/static_lp.wav', at: 0, to: 2.60, lane: [[0, 0], [1.5, db(-25.5 + 32.4)], [2.5, db(-25.5 + 32.4)], [2.6, 0]] },
    sfx('glitch_click', 2.47, VO_PK - 14 - SFX.glitch_click[3]),
    { src: 'mus_a', id: 'mus_intro', file: 'music/es_tarmac_radiation.mp3', at: 0, to: 61.11, lane: musLane('music/es_tarmac_radiation.mp3', 0, 61.11, dipT(MUS_T, 0), 1.5, 5.3, dipPts(0)) },
    { src: 'mus_b', id: 'mus_title', file: 'music/es_dark_days.mp3', at: 56.04, to: 61.11, lane: musLane('music/es_dark_days.mp3', 0, 5.07, () => MUS_T, 2, 0) },
    sfx('riser_dark', 40.40),
    sfx('tick_soft', 54.34, VO_PK - 22 - SFX.tick_soft[3]),
    sfx('boom_low', 56.04, SFX_T - SFX.boom_low[1]),
  ],
};
