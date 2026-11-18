// CASE 7 · c07 "The walkway full of students" (level 2). Indonesia Stock Exchange Tower 2, Jakarta, Monday 15 January 2018, 11:56.
// PEAK V5 rebuild: footage where it exists (ANTV phone-of-monitor c07_walk*/mon/lobby; The Star copy c07_star_*), a Blender piece for every
// line it can't show (scenes3d/build_c07.py -> public/cc1/3d/c07_*.mp4): the IDX twin towers, the lobby + mezzanine walkway with ~100
// faceless figures, the drop (EMPTY walkway: no people in it), the ambulances outside, the investigation scan.
// NO-CONTACT: nothing after Star 18.8 s (the walkway starts to drop ~19.5 s); "dropped into the lobby" = the empty 3D slab, then The Star's
// own dark monitor frame. Nobody died (73-77 hurt). ZERO FLASH: ANTV cuts at 27.653 / 32.032 / 57.975 s (windows start >= 0.2 s after);
// Star cuts 5.0 / 19.0 s (outside every window). The one page: CBS News/AP.
import React from "react";
import { at, type CasePlan, type CShot } from "../kit/case";
import { ChipLift_N2P } from "../../lib/templates/n2page/n2page";
import { tower, walkwaySection } from "../kit/code";

const LOB = { fileSec: 12.54 }, SW = { fileSec: 50.88 }, SD = { fileSec: 3.2 };
const k = (v: number) => [{ t: 0, v }];
const F = (s: number) => Math.round(s * 30);
const PAGE = { a: 578.81, b: 584.65 };
const R = (id: string, a: number, b: number, file: string, vo: string): CShot => ({ id, a, b, src: `cc1/3d/c07_${file}.mp4`, s0: 1.0, s1: 1.015, vo });
const X = "sfx_n2/real/";
/** Remotion code motion (owner 2026-10-26: Blender only for 2-3 key shots: walkway, drop, ambulances) */
const C = (id: string, a: number, b: number, node: React.ReactNode, vo: string): CShot => ({ id, a, b, node, vo });

export const C07: CasePlan = {
  id: "c07", title: "The walkway full of students",
  date: { date: "JANUARY 15, ", year: "2018", a: 540.6, b: 544.2, y: 318 }, // "It was Monday the 15th of January 2018, just before noon"
  shots: [
    { id: "S1", a: 532.24, b: 535.99, src: "c07_walk1.mp4", from: 0.2, s0: 1.0, s1: 1.04, vo: "'Most of the people in this footage were university students from Palembang,'" },
    C("S2", 535.99, 540.4, tower(F(540.4) - F(535.99), 10, 0, "TOWER 2", 40), "CODE: section of IDX Tower 2 builds floor by floor, the lobby lights on 'Exchange' | 'in South Sumatra, on a study tour of the Indonesia Stock Exchange in Jakarta.' (3D: the IDX twin towers at hazy noon, orbit; Tower 2's lobby lights on 'Exchange')"),
    { id: "S3", a: 540.4, b: 544.34, src: "c07_walk1.mp4", from: 4.0, s0: 1.04, s1: 1.08, vo: "'Monday the 15th of January 2018, just before noon' (date card)" },
    R("S4", 544.34, 551.77, "walkway", "'In the lobby of Tower Two there's a mezzanine walkway, a raised strip of floor with glass railings, and around a hundred of them were standing on it.' (3D: the edge lights on 'mezzanine', the glass glints on 'glass railings', ~100 faceless figures on 'hundred')"),
    { id: "S5", a: 551.77, b: 556.4, src: "c07_mon.mp4", from: 0.2, s0: 1.0, s1: 1.03, vo: "'The lobby's security camera recorded them, and someone later filmed its monitor on a phone.' (uncropped: the monitor)" },
    { id: "S6", a: 556.4, b: 561.47, src: "c07_lobby.mp4", from: 0.05, ramp: { keys: k(0.6), ...LOB }, s0: 1.0, s1: 1.04, vo: "'a second camera angle looking at the lobby floor below them'" },
    { id: "S7", a: 561.47, b: 565.91, src: "c07_star_w.mp4", from: 0, ramp: { keys: k(0.8), ...SW }, s0: 1.0, s1: 1.02, fx: 0.78, fy: 0.08, vo: "'The direct camera feed has its clock in the corner, and it reads 11:56' (punch to the clock on 'clock')",
      punches: [{ at: at(562.95, 561.47, 3), to: 1.6, len: 18 }] },
    { id: "S8", a: 565.91, b: 567.38, src: "c07_star_w.mp4", from: 4.0, ramp: { keys: k(0.7), ...SW }, s0: 1.4, s1: 1.44, fx: 0.55, fy: 0.35, vo: "'Stay on the walkway.' (tracked replay: framed on the walkway)" },
    { id: "S9", a: 567.38, b: 568.95, src: "c07_star_w.mp4", from: 10.5, ramp: { keys: k(0.6), ...SW }, s0: 1.1, s1: 1.13, fx: 0.55, fy: 0.4, vo: "'The whole walkway came away and' (ends at 17.44 s, before it drops)" },
    R("S10", 568.95, 571.12, "drop", "'dropped into the lobby with everyone on it.' (3D: the walkway, EMPTY, gives way and drops; nobody shown)"),
    { id: "S11", a: 571.12, b: 574.3, src: "c07_star_dark.mp4", from: 0.0, ramp: { keys: k(0.25), ...SD }, s0: 1.0, s1: 1.04, vo: "'In the first minutes nobody outside knew what had happened.' (the feed's dark monitor frame)" },
    R("S12", 574.3, 578.81, "ambul", "'Ambulances lined up outside the tower while staff and students were brought out.' (3D: a line of ambulances at the tower's drop-off, tracking move)"),
    { id: "PAGE", a: PAGE.a, b: PAGE.b, dev: "PageFocus_IC3", vo: "'Police counted seventy-three people hurt ... almost all of them students from that one study tour.' (CBS News / AP)",
      node: React.createElement(ChipLift_N2P, { dur: F(PAGE.b) - F(PAGE.a), src: "cc1/pages/c07_cbs.png", imgW: 2560, imgH: 4800, crop: [120, 1250, 1600, 1950], singleCam: true, driftX: 12,
        spans: [{ text: "most of the injured were college students from Palembang in Sumatra", lines: [[209.3, 1540, 1413.3, 1656]], at: 12, sweep: [20, 150] }] }) },
    { id: "S13", a: 584.65, b: 588.36, src: "c07_walk2.mp4", from: 8.0, s0: 1.0, s1: 1.04, vo: "'Nobody lost their life.'" },
    C("S14", 588.36, 592.91, walkwaySection(F(592.91) - F(588.36), F(591.76) - F(588.36) - 6), "CODE: walkway section, x-ray sweep, brackets + hangers light amber on 'walkway itself' | 'Police ruled out a bomb early on, and the investigation turned to the walkway itself.' (3D: under the intact walkway a scan sweeps its length; the brackets + hangers light on 'walkway itself')"),
  ],
  cuts: [
    { at: F(535.99), kind: "zoomHit", len: 10 },
    { at: F(544.34), kind: "blurDip", len: 12 },
    { at: F(568.95), kind: "glitch", len: 8 },
    { at: F(574.3), kind: "whip", len: 10 },
    { at: F(PAGE.a), kind: "blurDip", len: 12 }, { at: F(PAGE.b), kind: "blurDip", len: 12 },
    { at: F(588.36), kind: "blurDip", len: 12 },
  ],
  sfx: [
    { at: 535.99, file: X + "reverse_swell_3.wav", db: -26, prelap: 0.9, note: "zoom hit into the tower section" },
    { at: 539.1, file: "sfx_n2/sub_pulse_01.wav", db: -22, prelap: 0.05, note: "Tower 2's lobby lights ('Exchange')" },
    { at: 544.34, file: "sfx_n2/dissolve_01.wav", db: -28, prelap: 0.3, note: "into the lobby" },
    { at: 545.84, file: "sfx_n2/whoosh_02.wav", db: -30, prelap: 0.2, note: "the walkway edge lights ('mezzanine')" },
    { at: 548.44, file: X + "flashlight_click_2.wav", db: -22, prelap: 0.02, note: "the glass glints ('glass railings')" },
    { at: 549.89, file: X + "riser_5.wav", db: -32, prelap: 0.4, note: "the hundred figures appear ('hundred')" },
    { at: 562.95, file: "sfx_n2/title_hit_02.wav", db: -22, prelap: 0.05, note: "punch to the clock" },
    { at: 568.95, file: "sfx_n2/glitch_02.wav", db: -26, prelap: 0.0, note: "glitch into the drop ('dropped')" },
    { at: 569.68, file: X + "metal_clank_1.wav", db: -24, prelap: 0.02, note: "the empty slab hits the lobby floor" },
    { at: 569.68, file: X + "impact_2.wav", db: -19, prelap: 0.05, note: "the slab lands, low hit" },
    { at: 571.07, file: "sfx_n2/sub_pulse_01.wav", db: -20, prelap: 0.1, note: "the feed goes dark" },
    { at: 574.3, file: "sfx_n2/whoosh_03.wav", db: -28, prelap: 0.15, note: "whip to the ambulances" },
    { at: PAGE.a + 0.4, file: "sfx_n2/page_in_01.wav", db: -31, prelap: 0.3, note: "page in" },
    { at: 588.36, file: "sfx_n2/dissolve_02.wav", db: -28, prelap: 0.3, note: "under the walkway" },
    { at: 588.83, file: "sfx_n2/whoosh_02.wav", db: -31, prelap: 0.3, note: "the scan sweeps the walkway" },
    { at: 591.76, file: X + "metal_clank_2.wav", db: -27, prelap: 0.02, note: "the brackets light ('walkway itself')" },
  ],
  music: [{ name: "c07", file: "Music 9.mp3", a: 532.24, b: 592.91, ft: 60.0, fin: 0.3, fout: [592.41, 0.5], ref: [91, 124] }],
};
