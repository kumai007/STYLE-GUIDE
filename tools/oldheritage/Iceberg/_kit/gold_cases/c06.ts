// CASE 6 · c06 "The escalator cleaner" (level 2). Cloud Nine mall, Changning, Shanghai, Saturday 1 August 2015, late evening.
// PEAK V5 GOLD CASE: every VO line SHOWS what it says. Real footage where it exists (SET News copy c06_set_*: inset cropped, framed >= 1.14
// so the corner bug is off-frame; CTi copy c06_cps_*), a Blender piece where it doesn't (scenes3d/build_c06.py -> public/cc1/3d/c06_*.mp4).
// ZERO FLASH: source cuts measured with tools/srccuts.py (RMoB_rVKm4U: 9.576 / 12.546 / 16.550 / 24.424 s; Cpsj: 27.508 / 45.359 s):
//   set_a in >= 0.42 (cut at 0.25), set_2nd >= 0.42 (0.246), set_far >= 0.12 (cut 0.124 before the clip), set_close >= 0.30 (0.124), cps_mop >= 1.0.
// NO-CONTACT: footage stops before his leg is pulled in (set_pre <= 2.1 + 1.23 s); the comb/mop pieces have no person; the leg piece is a
// faceless clay figure (clinical). No hospital-bed footage (injured face), no channel boxes.
import React from "react";
import type { CasePlan, CShot } from "../kit/case";
import { ChipLift_N2P } from "../../lib/templates/n2page/n2page";
import { legScan, mopJam, panelDrop, weekStrip } from "../kit/code";

const PRE = { fileSec: 16.45 }, FAR = { fileSec: 7.77 }, SND = { fileSec: 13.38 }, A = { fileSec: 29.36 }, CL = { fileSec: 15.75 }, MOP = { fileSec: 19.79 };
const k = (v: number) => [{ t: 0, v }];
const F = (s: number) => Math.round(s * 30);
const L = (abs: number, a: number) => F(abs) - F(a);
const PAGE = { a: 506.48, b: 511.16 };
const lf = (t: number) => F(t) - F(PAGE.a);
/** a Blender piece (its own camera move inside; only a hair of drift on top) */
const R = (id: string, a: number, b: number, file: string, vo: string): CShot => ({ id, a, b, src: `cc1/3d/c06_${file}.mp4`, s0: 1.0, s1: 1.015, vo });
const X = "sfx_n2/real/";
/** Remotion code motion (owner 2026-10-26: Blender only for 2-3 key shots: tower, comb, stop) */
const C = (id: string, a: number, b: number, node: React.ReactNode, vo: string): CShot => ({ id, a, b, node, vo });
const lo = (abs: number, a: number) => F(abs) - F(a);

export const C06: CasePlan = {
  id: "c06", title: "The escalator cleaner",
  date: { date: "AUGUST 1, ", year: "2015", a: 473.6, b: 477.2, y: 318 }, // "It was Saturday the 1st of August 2015"
  shots: [
    { id: "S1", a: 466.4, b: 469.04, src: "c06_set_a.mp4", from: 0.42, ramp: { keys: k(0.6), ...A }, s0: 1.14, s1: 1.19, vo: "'This one was filmed by a camera covering an escalator' (the CCTV itself)" },
    R("R1", 469.04, 473.46, "tower", "'inside Cloud Nine, a big shopping mall in the Changning district of Shanghai' (3D massing at night, orbit; the mall floor lights on 'mall')"),
    { id: "S3", a: 473.46, b: 478.62, src: "c06_set_far.mp4", from: 0.12, ramp: { keys: k(0.35), ...FAR }, s0: 1.14, s1: 1.2, vo: "'Saturday the 1st of August 2015, late in the evening, and the mall had closed' (the empty landing; date card)" },
    { id: "S4", a: 478.62, b: 484.07, src: "c06_set_close.mp4", from: 0.3, ramp: { keys: k(0.6), ...CL }, s0: 1.14, s1: 1.2, fx: 0.45, fy: 0.5,
      punches: [{ at: L(482.5, 478.62), to: 1.08, len: 20 }], vo: "'The man in the frame is a cleaner, surnamed Zhang ... mopping the steps while they're still moving.' (punch on 'mopping')" },
    { id: "S5", a: 484.07, b: 486.46, src: "c06_set_a.mp4", from: 2.0, ramp: { keys: [{ t: 0, v: 0.6 }, { t: 1.0, v: 0.25 }], ease: 0.5, ...A }, s0: 1.3, s1: 1.34, fx: 0.56, fy: 0.3,
      punches: [{ at: L(484.95, 484.07), to: 1.3, len: 24 }], vo: "'Look at the top of the escalator.' (tracked replay: slows to 0.25x, eased zoom into the top landing)" },
    R("R2", 486.46, 490.73, "comb", "'The comb plate, the metal strip at the top where the steps fold away, broke open' (3D: steps fold under the comb, x-ray into the pit, the plate cracks on 'broke' 489.86)"),
    { id: "S7", a: 490.73, b: 492.78, src: "c06_set_pre.mp4", from: 2.1, ramp: { keys: k(0.6), ...PRE }, s0: 1.3, s1: 1.36, fx: 0.5, fy: 0.3, vo: "'and his left leg was pulled into the gap.' (stops BEFORE he is pulled in: no-contact)" },
    R("R3", 492.78, 497.1, "stop", "'He managed to reach the emergency stop button and shut the escalator down himself.' (3D: the red stop button goes down on 'stop', the steps brake to a halt)"),
    { id: "S9", a: 497.1, b: 499.45, src: "c06_set_2nd.mp4", from: 0.8, ramp: { keys: k(0.8), ...SND }, s0: 1.3, s1: 1.36, fx: 0.4, fy: 0.5, vo: "'Notice the people running in from the side.'" },
    { id: "S10", a: 499.45, b: 502.17, src: "c06_cps_fire.mp4", s0: 1.0, s1: 1.05, vo: "'Firefighters spent about twenty minutes freeing him.' (the real rescue)" },
    C("R4", 502.17, 506.48, legScan(F(506.48) - F(502.17), lo(505.24, 502.17)), "CODE: blueprint faceless figure, x-ray sweep, left leg below the calf lights amber on 'calf' | 'He was taken to hospital, and doctors couldn't save his left leg below the calf.' (faceless clay figure; scan plane marks below the calf)"),
    { id: "PAGE", a: PAGE.a, b: PAGE.b, dev: "PageFocus_IC3", vo: "'The story spread fast in China, partly because of what had happened only days before.' (CNN: Zhang, the Cloud Nine cleaner)",
      node: React.createElement(ChipLift_N2P, { dur: F(PAGE.b) - F(PAGE.a), src: "cc1/pages/c06_cnn.png", imgW: 2560, imgH: 4800, crop: [560, 1900, 1800, 2700], singleCam: true, driftX: 12,
        spans: [{ text: "surnamed Zhang, was a cleaner at the Cloud Nine shopping mall in Shanghai", lines: [[662.8, 2190.1, 1693.5, 2306.1]], at: 12, sweep: [14, lf(509.6)] }] }) },
    C("R5", 511.16, 516.28, weekStrip(F(516.28) - F(511.16)), "CODE: DayStrip JUL 26 -> AUG 1 | 'NBC News counted it as the third escalator accident in China in a single week' (3D time ribbon JUL 26 -> AUG 1, three markers rise in order)"),
    C("R6", 516.28, 521.67, panelDrop(F(521.67) - F(516.28), lo(519.81, 516.28) - 4, "26 JUL 2015"), "CODE: escalator landing elevation, the cover plate drops into the pit on 'gave way' | 'days after a mother lost her life at a mall in Jingzhou when a panel gave way under her.' (3D: another landing, empty; the cover plate gives way)"),
    C("R7", 521.67, 525.62, mopJam(F(525.62) - F(521.67), lo(523.4, 521.67), lo(524.47, 521.67), { src: "cc1g/c06_set_close.mp4", from: 1.0 }), "CODE: comb section, x-ray: mop head lodged, crack on 'cracked' | 'Cloud Nine said Zhang's mop had lodged in the gap and cracked the comb plate' (3D cause chain: mop rides in, jams, the plate cracks on 'cracked')"),
    { id: "S14", a: 525.62, b: 528.27, src: "c06_cps_mop.mp4", from: 1.0, ramp: { keys: k(0.46), ...MOP }, s0: 1.0, s1: 1.06, fx: 0.4, fy: 0.5, vo: "'and it suspended cleaning of escalators while they were running.' (mopping a running escalator)" },
  ],
  cuts: [
    { at: F(469.04), kind: "zoomHit", len: 10 },
    { at: F(486.46), kind: "blurDip", len: 12 },
    { at: F(492.78), kind: "whip", len: 10 },
    { at: F(502.17), kind: "blurDip", len: 12 },
    { at: F(PAGE.a), kind: "blurDip", len: 12 }, { at: F(PAGE.b), kind: "blurDip", len: 12 },
    { at: F(516.28), kind: "whip", len: 12, dir: -1 },
    { at: F(521.67), kind: "glitch", len: 10 },
  ],
  sfx: [
    { at: 469.04, file: X + "reverse_swell_3.wav", db: -25, prelap: 0.9, note: "into the Cloud Nine massing (zoom hit)" },
    { at: 470.6, file: "sfx_n2/sub_pulse_01.wav", db: -20, prelap: 0.05, note: "the mall floor lights ('mall')" },
    { at: 484.95, file: "sfx_n2/whoosh_01.wav", db: -27, prelap: 0.2, note: "replay zoom to the top" },
    { at: 486.46, file: "sfx_n2/dissolve_01.wav", db: -27, prelap: 0.3, note: "into the comb reconstruction" },
    { at: 488.1, file: "sfx_n2/whoosh_02.wav", db: -30, prelap: 0.3, note: "x-ray: under the comb" },
    { at: 489.86, file: X + "metal_clank_1.wav", db: -26, prelap: 0.02, note: "the comb plate breaks open ('broke')" },
    { at: 489.86, file: X + "impact_3.wav", db: -21, prelap: 0.04, note: "the break, low hit" },
    { at: 492.78, file: "sfx_n2/whoosh_03.wav", db: -28, prelap: 0.15, note: "whip to the stop button" },
    { at: 494.25, file: X + "flashlight_click_2.wav", db: -14, prelap: 0.02, note: "the emergency stop goes down ('stop')" },
    { at: 495.3, file: X + "sub_drop_1.wav", db: -32, prelap: 0.1, note: "the steps brake to a halt ('shut down')" },
    { at: 504.2, file: "sfx_n2/dissolve_02.wav", db: -28, prelap: 0.3, note: "x-ray sweep across the figure" },
    { at: 505.24, file: "sfx_n2/sub_pulse_01.wav", db: -21, prelap: 0.05, note: "'below the calf' (the leg lights amber)" },
    { at: PAGE.a + 0.4, file: "sfx_n2/page_in_01.wav", db: -31, prelap: 0.3, note: "page in" },
    { at: 511.63, file: "sfx_n2/whoosh_02.wav", db: -29, prelap: 0.3, note: "the strip glides JUL 26 -> AUG 1" },
    { at: 513.83, file: X + "tape_click_2.wav", db: -20, prelap: 0.02, note: "AUG 1 lands (amber)" },
    { at: 516.28, file: "sfx_n2/whoosh_01.wav", db: -27, prelap: 0.15, note: "whip to Jingzhou" },
    { at: 519.68, file: X + "metal_clank_2.wav", db: -25, prelap: 0.02, note: "the panel gives way" },
    { at: 519.85, file: X + "impact_2.wav", db: -25, prelap: 0.05, note: "the plate drops into the pit" },
    { at: 521.67, file: "sfx_n2/glitch_02.wav", db: -30, prelap: 0.0, note: "glitch back to Cloud Nine" },
    { at: 523.4, file: X + "metal_clank_2.wav", db: -30, prelap: 0.02, note: "the mop jams in the comb ('lodged')" },
    { at: 524.47, file: X + "metal_clank_1.wav", db: -26, prelap: 0.02, note: "the plate cracks ('cracked')" },
    { at: 524.47, file: X + "impact_3.wav", db: -23, prelap: 0.04, note: "crack, low hit" },
  ],
  music: [{ name: "c06", file: "Music 10.mp3", a: 466.4, b: 528.27, ft: 30.0, fin: 0.3, fout: [527.77, 0.5], ref: [103, 170] }],
};
