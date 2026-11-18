// TEMPLATE ONLY (2026-11-18): coc2h-vol1 data is deleted; PROD/media paths below are dead. Copy the structure into a new case.
// coc_intro - intro of the coc2h narrated caught-on-camera video, v4 (owner 2026-11-17: iceberg like Abyssal Detective, no raw at
// the start, footage-wall MG on "Twenty-eight moments", realistic texture, narration-precise, eased). 60 fps, 35.64 s.
// VO vo_001 at 0.30 (word onsets = VO time + 0.30, from productions/coc2h-vol1/narration/cut/vo_001.words.json); ends 34.74; +0.9 s.
// Every cut sits on a word onset or a pause. No two adjacent in-transitions or camera moves alike. v7: eased 3-D camera moves (see M).
// v8 (owner notes on v6, v8_stills/FEEDBACK_v6.md items 1-4, 11; v8_stills/INTRO_v8.md): wall camera = one continuous curved pan +
// overlapping zoom (no stop/creep/stop), softer 50 f tile entries, every tile seen >= 1 s; berg title = upper berg -> one long eased
// descent under the waterline -> title soft-fades in the sea over the skull (no title animation), slow zoom only; the DCP freeze
// print and the empty end dive are gone (title holds 3.6 s; the intro ends on the LAPD teaser dipping to black); mix VO-8 / VO-11.
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MED = path.resolve(process.env.GX_ENGINE_PUBLIC || path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'media'), 'coc2h');
const n = (d, p = {}, ...k) => ({ d, p, k });

const FULL = { DCP: [1920, 1080], SWFA: [1920, 1080], LSV: [1920, 1080], SN72: [1920, 1080], SOA: [1920, 1080], MIR: [1280, 720], LAPD: [854, 478], RING: [1082, 1080] };
const crop = (src) => (FULL[src] ? [0, 0, ...FULL[src], ...FULL[src]] : undefined);
const Ft = (p) => n('CFoot', { look: 'v4', cool: true, ...p, crop: p.crop || crop(p.src) });
const MPDC = [6, 0, 640, 480, 854, 480]; // MPD 4:3 picture inside the 854x480 file (badge pillar cut off)
// v7 (owner: "have 3d pan zoom smooth animations"): 3-D camera moves through Mv [scale, rotX, rotY, tx%, ty%], perspective 1800 px,
// rotation 3-5 deg easing to/through 0 while zooming 1.10-1.17 and panning 1-1.5 %; every move cover-checked (frame edge never shows).
// Ease alternates io (0.35,0,0.25,1) / sym (0.42,0,0.58,1); no two adjacent footage shots share a direction.
const M = {
  emerge: { a: [1.0, 0, 0, 0, 0], b: [1.13, 0, -3, 1.2, 0], ez: 'sym' }, // from the wall tile's flat framing (dissolve match)
  yawR: { a: [1.12, 0, -5, -1.5, 0], b: [1.17, 0, 1, 1.5, 0] },
  tiltUp: { a: [1.17, 4, 0, 0, 1.2], b: [1.10, -1, 0, 0, -1.2], ez: 'sym' },
  yawL: { a: [1.12, 0, 5, 1.5, 0], b: [1.17, 0, -1, -1.5, 0] },
  tiltDn: { a: [1.11, -4, 0, 0, -1.2], b: [1.17, 1, 0, 0, 1.2], ez: 'sym' },
  orbR: { a: [1.17, 3, -4, -1.2, 1.0], b: [1.11, 0, 1, 1.2, -0.6] },
  orbL: { a: [1.13, -3, 4, 1.2, -1.0], b: [1.17, 0, -1, -1.2, 0.6], ez: 'sym' },
};

// ---- mix v8b (owner on v6: "music way too loud ... narration, then the music, then SFX"; FEEDBACK_v6.md item 11; v7_stills/MIX.md):
// VO vo_001 = -27.2 LUFS I, -27.8 LUFS short-term median while talking (= ref). Music = ref -8 LU short-term (-35.8) under the
// whole intro (was -4.2); SFX = ref -11 LU (-38.8 LUFS I, gain from each file's measured I; was -7.4) and never above the music.
const MUS_T = -38.8, SFX_T = -41.8; // v9 owner 2026-11-17 "lower the music a little bit with SFX also": both -3 dB (music VO -11 LU, SFX VO -14 LU)
// v8b: [s, LUFS I, max momentary M]; gain = min(ref -11 LU by I, peak M <= music target -1 LU) so no hit ever pokes over the music
const SFX = { riser_1: [3.325, -22.6, -18.2], sting_1: [3.644, -27.6, -23.1], whoosh_1: [0.502, -23.1, -23.0], whoosh_2: [0.606, -28.3, -25.7], subhit_1: [2.06, -20.2, -16.2] };
const sfx = (name, at, id) => {
  const [d, L, M] = SFX[name], g = +Math.pow(10, Math.min(SFX_T - L, MUS_T - 1 - M) / 20).toFixed(4);
  return { src: name, id, file: `sfx/${name}.wav`, at, to: +(at + d - 0.02).toFixed(3), lane: [[0, 0], [0.02, g], [d - 0.1, g], [d - 0.03, 0]] };
};
// Music is levelled: lane gain every 0.5 s = target - the bed's own short-term loudness (ebur128 S, 3 s window centred, power-mean
// smoothed +-2 s), clamped -24..+12 dB (HyperFrames max gain +12 dB), so the bed sits at the target with no holes (basement dips to -48).
const stS = (f) => {
  const e = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', path.join(MED, f), '-af', 'ebur128', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 28 }).stderr;
  return [...e.matchAll(/t:\s*([\d.]+)\s+TARGET.*?S:\s*(-?(?:[\d.]+|inf|nan))/g)].map((m) => (Number.isFinite(+m[2]) ? +m[2] : -70)); // every 0.1 s; window ends at (i+1)/10
};
function musLane(file, trim, len, tgt, fin, fout, extra = []) {
  const S = stS(file), sAt = (m) => S[Math.max(29, Math.min(S.length - 1, Math.round(m * 10) + 14))]; // centred; first full window at 3 s
  const lvl = (m) => { let p = 0, k = 0; for (let d = -1; d <= 1.001; d += 0.5, k++) p += Math.pow(10, Math.max(sAt(m + d), -70) / 10); return 10 * Math.log10(p / k); };
  const env = (u) => Math.min(1, u / fin, fout ? (len - u) / fout : 1);
  const ts = new Set([0, fin, len - fout, len, ...extra.filter((u) => u > 0 && u < len)].map((u) => +u.toFixed(3)));
  for (let u = 0; u < len; u += 0.5) ts.add(+u.toFixed(3));
  return [...ts].sort((a, b) => a - b).map((u) => [u, +(Math.max(0, env(u)) * Math.pow(10, Math.max(-24, Math.min(12, tgt(u) - lvl(trim + u))) / 20)).toFixed(4)]);
}

// 28 distinct windows (16 live, 12 freezes = native frame). Safe picks: no person struck, no injured people; LSV >= 413 s only;
// private faces blurred (SOA angler, RING man). Row-major 7 x 4; MPD 20 (row 1, col 3) is the tile the camera dives into.
const R = [0, 170, 1082, 609, 1082, 1080]; // RING fisheye, 16:9 band
const TILES = [
  { src: 'SWFA', t: 85 }, { src: 'MIR', t: 0.5 }, { src: 'MPD', still: 2310, crop: MPDC }, { src: 'DCP', t: 3 },
  { src: 'RING', still: 718, crop: R, face: [[550, 302, 80, 95]] }, { src: 'SN72', t: 75 }, { src: 'LSV', still: 30000 },
  { src: 'LAPD', t: 2 }, { src: 'MPD2', t: 4, crop: [0, 0, 408, 340, 408, 340] }, { src: 'FBG', t: 1.5, crop: [0, 0, 640, 331, 640, 360] },
  { src: 'MPD', t: 20, crop: MPDC }, { src: 'SOA', still: 480, face: [[868, 420, 80, 100]] }, { src: 'DCP', t: 35 }, { src: 'MIR', still: 389 },
  { src: 'MPD', still: 3300, crop: MPDC }, { src: 'LSV', t: 413 }, { src: 'SN72', still: 3596 }, { src: 'SWFA', t: 113 },
  { src: 'MPD3', t: 1, crop: [0, 0, 352, 240, 352, 240] }, { src: 'FBG', still: 240, crop: [0, 0, 640, 331, 640, 360] }, { src: 'RING', still: 5084, crop: R, face: [[756, 367, 80, 95]] },
  { src: 'DCP', t: 20 }, { src: 'MIR', t: 5 }, { src: 'LAPD', still: 500 }, { src: 'MPD', t: 45, crop: MPDC },
  { src: 'SWFA', still: 3720 }, { src: 'MPD2', still: 121, crop: [0, 0, 408, 340, 408, 340] }, { src: 'LSV', t: 505 },
].map((q) => ({ ...q, crop: q.crop || crop(q.src) }));
// wall geometry: tiles 480x270, gap 40, odd rows +260 -> plane 3860 x 1200; MPD 20 tile centre = (2060, 445).
const wall = () => n('Wall', {
  cols: 7, rows: 4, tw: 480, th: 270, gap: 40, brick: 260, tiles: TILES,
  // v8: 50 f sym-eased tile entries every 3.5 f (all 28 in by 2.2 s); sim: every tile that shows is on screen >= 64 f (1.07 s)
  origin: [1250, 330], at0: 8, stag: 3.5, ent: 50, sweep: [60, 230],
  // v8 camera: ONE pan along a curve (1250,330) -> (2060,445) over 0-256 f (io ease) with overlapping log-zoom keys: pull back
  // 1.45 -> 0.56 by 170 f (2.83 s, "real footage"), dive 0.56 -> 4.0 into MPD 20 by 256 f ("church" 4.31). No dead stop, no creep.
  path: { P: [[1250, 330], [2050, 720], [2060, 445]], f: [0, 256], ez: [0.35, 0, 0.25, 1] },
  zoom: [[0, 1.45, [0.33, 0, 0.3, 1]], [170, 0.56, [0.5, 0, 0.62, 1]], [256, 4.0, [0.2, 0, 0.6, 1]], [268, 4.03]],
});
const BERG = { img: 'assets/media/berg.jpg', iw: 1920, ih: 4118, wl: 1191 };

export default {
  id: 'coc_intro',
  media: 'coc2h',
  end: 35.64,
  tseed: 'coci',
  plain: true,
  vo: { starts: [0.30], lens: [34.44], file: () => 'vo/vo_001.wav', tail: 0 },
  devices: ['shared', 'coc', 'coc_v3', 'coc_v4', 'coc_v9'],
  fonts: ['Archivo-var-latin.woff2', 'IBMPlexMono-500-latin.woff2'],
  shots: [
    // "Twenty-eight moments, two hours. I've put together real footage from a" -> dive into the church-hallway tile
    { name: 'I01 footage wall', c: 0, to: 4.31, k: 'hard', n: 0, el: () => wall() },
    // "church hallway at four in the morning," (tile video continues: same source time as the wall's MPD 20 tile, same cover framing)
    { name: 'I02 MPD hallway', c: 4.31, to: 6.63, k: 'dissolve', n: 18, el: () => Ft({ src: 'MPD', t: 20 + 250 / 60, crop: MPDC, mv: M.emerge }) },
    // "doorbell on a quiet street," (face blurred)
    { name: 'I03 RING', c: 6.63, to: 8.59, k: 'hard', n: 0, el: () => Ft({ src: 'RING', t: 56.5, mode: 'fit', mv: M.tiltUp, face: [[767, 372, 95, 110]] }) },
    // "helmet on a wet road,"
    { name: 'I04 DCP', c: 8.59, to: 10.20, k: 'dissolve', n: 24, el: () => Ft({ src: 'DCP', t: 3, mv: M.yawL }) },
    // "dashcam on a highway on-ramp" (cut out on the pause before "and")
    { name: 'I05 FBG', c: 10.20, to: 12.26, k: 'hard', n: 0, el: () => Ft({ src: 'FBG', t: 1.5, crop: [0, 0, 640, 331, 640, 360], mv: M.tiltDn, look: 'v4warm' }) },
    // "and a phone held up in a stadium." -> dip to black
    { name: 'I06 MIR', c: 12.26, to: 14.25, k: 'dissolve', n: 24, outK: 'dip', outN: 18, el: () => Ft({ src: 'MIR', t: 0.5, mv: M.orbR }) },
    {
      // "Every clip is real. Nobody's death is ever shown, and we stop each one before the worst of it, then tell you what happened
      // next." (7.50 s). v8: upper berg + waterline (0-36 f) -> one long sym-eased descent under the water to the skull (36-196 f,
      // 2.67 s) -> title soft-fades in the sea on "and we stop" (198-234 f), holds 3.6 s; the berg only zooms 1.00 -> 1.10 (constant, whole shot; x1.06 tilt wrap).
      name: 'I07 berg title', c: 14.25, to: 21.75, k: 'hard', n: 0,
      el: () => n('BergX', { ...BERG, cam: [[36, 1000, 1.0], [196, 2900, 1.0]], ez: [0.42, 0, 0.58, 1], zoom: [0, 450, 1.0, 1.10], dark: [1.0, 0.92],
        tilt: { a: [1.06, 4, 0, 0, 0], b: [1.06, 0.5, 0, 0, 0], t0: 36, t1: 196 }, fade: { in: [0, 22] } },
      n('BTitle', {
        soft: [198, 258], back: { top: 390, h: 300 },
        lines: [
          { t: 'MOST DISTURBING MOMENTS', size: 84, top: 462, color: '#D4D4D4', track: 0.04 },
          { t: 'CAUGHT ON CAMERA', size: 40, top: 578, color: '#E8E8E8', track: 0.34, weight: 600 },
        ],
        rule: { top: 562, w: 560 },
      })),
    },
    // "We'll start with the ones that made the news, a"
    { name: 'I09 SWFA', c: 21.75, to: 23.88, k: 'dissolve', n: 24, el: () => Ft({ src: 'SWFA', t: 113, mv: M.tiltUp }) },
    // "concert in Hong Kong" + place line
    { name: 'I10 MIR', c: 23.88, to: 25.46, k: 'hard', n: 0, el: () => [
      Ft({ src: 'MIR', t: 5, mv: M.orbL }),
      n('WTitle', { at: 6, gap: 6, fd: 14, left: 96, lines: [{ t: 'HONG KONG COLISEUM · 28 JULY 2022', size: 34, top: 900, track: 0.05 }] }),
    ] },
    // "and a sailboat off Venezuela,"
    { name: 'I11 SN72', c: 25.46, to: 27.36, k: 'dissolve', n: 24, el: () => Ft({ src: 'SN72', t: 106, mv: M.yawR }) },
    // "and as we go on, it gets stranger" (LSV 413+: no faces)
    { name: 'I12 LSV', c: 27.36, to: 29.50, k: 'hard', n: 0, el: () => Ft({ src: 'LSV', t: 413, mv: M.tiltDn }) },
    // "and quieter, until we end" (angler's face blurred)
    { name: 'I13 SOA', c: 29.50, to: 31.17, k: 'dissolve', n: 24, el: () => Ft({ src: 'SOA', t: 8, mv: M.orbR, face: [[868, 420, 90, 110]] }) },
    // "on a sound nobody has ever explained. Let's begin." v8: the empty berg dive is gone; the intro ends on this teaser (4.47 s),
    // dipping to black over the last 0.9 s after "begin" (case 1 opens on black)
    { name: 'I14 LAPD', c: 31.17, to: 35.64, k: 'hard', n: 0, outK: 'dip', outN: 54, el: () => Ft({ src: 'LAPD', t: 20, mv: M.yawL }) },
  ],
  overlays: [{ name: 'tex', at: 0, to: 35.64, el: () => ({ d: 'Tex', p: { fi: [8, 30], fo: [2108, 2136] }, k: [] }) },
    { name: 'abyss grade + soft crt (v9)', at: 0, to: 35.64, el: () => ({ d: 'AbyGrade', p: {}, k: [] }) }],
  audio: [
    { src: 'm8', id: 'mus_m8', file: 'music/music8.mp3', at: 0, to: 35.64, trim: 20, lane: musLane('music/music8.mp3', 20, 35.64, () => MUS_T, 0.25, 0.64) }, // v10 owner "dark ambient like in the previous videos": channel Music 8 from 20 s (K CHANNEL_STYLE 12: Music 8/9/10 only)
    sfx('subhit_1', 0.28, 'sfx_wall'), // low thud as the wall starts on "Twenty-eight"
    sfx('whoosh_2', 3.72, 'sfx_dive'), // dive into the hallway tile, lands on "church"
    sfx('riser_1', 10.93, 'sfx_riser'), // riser into the berg (upper berg), ends on the cut (14.25)
    sfx('whoosh_1', 15.25, 'sfx_under'), // camera passes the waterline (row 1191 at frame centre ~15.5)
    sfx('sting_1', 17.52, 'sfx_sting'), // title soft-fades in the sea ("and we stop")
  ],
};
