// CC1 CODE MOTION (owner 2026-10-26: "2-3 Blender shots per case, everything else Remotion code"): ready-made n2dev diagram nodes for the
// lines that have no footage. Each returns a full-frame node for a CShot (`node`), coordinates in 1920x1080, local frames.
import React from "react";
import { Cutaway_D, ExplodedPart_D, StructureSection_D } from "../../lib/templates/n2dev/diagram";
import { DayStrip_D } from "../../lib/templates/n2dev/info";
import type { Part } from "../../lib/templates/n2dev/diagram";

const R = (x: number, y: number, w: number, h: number) => `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`;
/** a stair profile descending to the left from (x, y): n steps of (w, h) */
const stairs = (x: number, y: number, n: number, w: number, h: number, base: number) => {
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) d += ` L${x - (i + 1) * w} ${y + i * h} L${x - (i + 1) * w} ${y + (i + 1) * h}`;
  return d + ` L${x - n * w} ${base} L${x} ${base} Z`;
};

/** a faceless clinical figure (front view); the hot part = his LEFT leg below the calf (screen right) */
export const legScan = (dur: number, hotAt: number) => {
  const shell = [
    "M908 230 a52 52 0 1 0 104 0 a52 52 0 1 0 -104 0 Z",
    "M892 300 L1028 300 L1048 560 L872 560 Z",
    "M890 306 L842 540 L862 546 L906 362 Z", "M1030 306 L1078 540 L1058 546 L1014 362 Z",
    "M872 562 L955 562 L946 960 L896 960 Z", "M965 562 L1048 562 L1026 960 L976 960 Z",
  ];
  const inner: Part[] = [
    { d: "M913 580 L921 950", fill: false, at: 40 }, { d: "M1006 580 L1000 950", fill: false, at: 44 },
    { d: "M940 800 L1060 800", fill: false, at: hotAt - 8 },
    { d: "M972 802 L1035 802 L1026 958 L977 958 Z", hot: true, at: hotAt },
  ];
  return <Cutaway_D dur={dur} shell={shell} inner={inner} sweepAt={30} sweepLen={44} />;
};

/** a week strip Jul 26 -> Aug 1 2015 (Jingzhou first, Shanghai the last day) */
export const weekStrip = (dur: number) => (
  <DayStrip_D dur={dur} from={0} to={6} at={14} len={70}
    days={[{ d: "26", sub: "JUL", mark: "JINGZHOU" }, { d: "27", sub: "JUL" }, { d: "28", sub: "JUL" }, { d: "29", sub: "JUL" }, { d: "30", sub: "JUL" }, { d: "31", sub: "JUL" }, { d: "1", sub: "AUG", mark: "SHANGHAI" }]} />
);

/** side elevation of an escalator's top landing; the access cover plate drops into the pit (`at` = the drop) */
export const panelDrop = (dur: number, at: number, title?: string) => {
  const parts: Part[] = [
    { d: R(1180, 492, 300, 300) }, // the machine pit
    { d: stairs(1100, 470, 9, 88, 46, 960) }, // the steps
    { d: "M240 820 L1100 390 L1200 390 L1200 400 L1100 400 L246 830 Z" }, // handrail
    { d: R(980, 470, 200, 22) }, { d: R(1480, 470, 260, 22) }, // landing floor either side
    { d: R(1180, 470, 300, 22), dy: 250, hot: true, label: "COVER PLATE", lp: [1330, 470, 1560, 380] },
  ];
  return <ExplodedPart_D dur={dur} parts={parts} at={at} len={22} title={title} />;
};

/** section through the comb at the top landing: x-ray reveals the mop head lodged in the gap, then the plate cracks (`crackAt`) */
export const mopJam = (dur: number, mopAt: number, crackAt: number, plate?: { src: string; from: number }) => {
  const shell = [
    stairs(860, 540, 6, 110, 40, 800),
    R(900, 500, 800, 40), // landing plate
    "M840 532 L900 500 L900 540 L846 540 Z", // the comb plate (teeth into the treads)
    R(900, 540, 700, 280), // the pit
  ];
  const inner: Part[] = [
    { d: "M860 600 L900 600 L900 780 L1540 780", fill: false, at: 20 }, // the step chain turning under
    { d: "M640 250 L828 498 L820 504 L632 256 Z", at: mopAt - 8 }, // the mop handle
    { d: "M826 500 L902 528 L894 556 L818 528 Z", at: mopAt, label: "MOP HEAD", lp: [860, 528, 640, 640] },
    { d: "M884 503 L874 516 L888 525 L877 539", fill: false, hot: true, at: crackAt, label: "COMB PLATE", lp: [884, 516, 1120, 400] },
  ];
  return <Cutaway_D dur={dur} shell={shell} inner={inner} sweepAt={12} sweepLen={32} src={plate?.src} from={plate?.from} dim={0.8} />;
};

/** the walkway section: slab, glass railing, the brackets + hangers that hold it to the wall (hot on `hotAt`) */
export const walkwaySection = (dur: number, hotAt: number) => {
  const shell = [
    R(300, 520, 1300, 46), // the walkway slab
    R(300, 380, 1300, 140), // glass railing
    R(1600, 160, 90, 800), // the lobby wall / core
    R(200, 900, 1520, 20), // lobby floor
  ];
  const inner: Part[] = [
    { d: R(1540, 500, 60, 90), hot: true, at: hotAt, label: "BRACKETS", lp: [1570, 545, 1300, 690] },
    { d: "M520 160 L520 520 M960 160 L960 520 M1380 160 L1380 520", fill: false, hot: true, at: hotAt + 6, label: "HANGERS", lp: [960, 300, 720, 230] },
  ];
  return <Cutaway_D dur={dur} shell={shell} inner={inner} sweepAt={14} sweepLen={46} />;
};

/** a building section with one floor lit */
export const tower = (dur: number, floors: number, hot: number, label?: string, at = 6) => <StructureSection_D dur={dur} floors={floors} hot={hot} label={label} at={at} />;

// ---------------------------------------------------------------- bespoke small motions (n2dev look)
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Glyph } from "../../lib/core/kits/glyphs";
import { EI, K, Plate, envIO, wide, cond } from "../../lib/templates/n2dev/kit";
const rnd = (n: number) => { const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

/** "thousands every year": bolt marks strike across a dark field one by one, then multiply (to ~`n`) from frame `burst`. No number. */
export const BoltField: React.FC<{ dur: number; burst: number; n?: number; src?: string; from?: number }> = ({ dur, burst, n = 260, src, from }) => {
  const f = useCurrentFrame(), o = envIO(f, dur, 10, 12);
  const z = 1 + 0.05 * EI.smooth(f / dur);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Plate src={src} from={from} dim={src ? 0.8 : undefined} blur={src ? 16 : undefined} />
      <AbsoluteFill style={{ transform: `scale3d(${z},${z},1)` }}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: n }, (_, i) => {
            const t0 = i < 6 ? 14 + i * 18 : burst + ((i - 6) / (n - 6)) ** 1.6 * Math.max(20, dur - burst - 30);
            const k = EI.cam((f - t0) / 10);
            if (k <= 0) return null;
            const x = 140 + rnd(i) * 1640, y = 140 + rnd(i + 999) * 800, s = i < 6 ? 54 : 22 + rnd(i + 7) * 14;
            const hot = Math.max(0, 1 - (f - t0) / 14);
            return <g key={i} transform={`translate(${x - s / 2} ${y - s / 2})`} opacity={k * (0.45 + 0.55 * hot)}><Glyph name="bolt" colour={hot > 0.2 ? K.ice : K.cyan} size={s} /></g>;
          })}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** two sources disagree on a number: each number lands on its word under its source name; the second dims the first (no verdict). */
export const TwoSources: React.FC<{ dur: number; a: { v: string; who: string; at: number }; b: { v: string; who: string; at: number } }> = ({ dur, a, b }) => {
  const f = useCurrentFrame(), o = envIO(f, dur, 10, 12);
  const one = (x: number, s: { v: string; who: string; at: number }, dimAt?: number) => {
    const k = EI.quick((f - s.at) / 18), d = dimAt ? EI.cam((f - dimAt) / 14) : 0;
    return (
      <div style={{ position: "absolute", left: x - 300, width: 600, top: 330, textAlign: "center", opacity: k * (1 - 0.45 * d), transform: `translateY(${(1 - k) * 30}px)` }}>
        <div style={{ ...cond(260, 800), color: K.ice }}>{s.v}</div>
        <div style={{ ...wide(26, 560, 100, 0.36), color: K.frost, marginTop: 18 }}>{s.who}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Plate />
      {one(640, a, b.at)}
      {one(1280, b)}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><line x1={960} y1={360} x2={960} y2={360 + 300 * EI.cam((f - b.at + 6) / 14)} stroke={K.cyanDim} strokeWidth={1.5} /></svg>
    </AbsoluteFill>
  );
};

/** a tiny drive-thru coffee hut in section: the x-ray reveals one person inside (faceless) and the camera at the service window, its view
 *  cone drawing out of the window (`camAt`) */
export const hutSection = (dur: number, inAt: number, camAt: number) => {
  const shell = [
    R(620, 380, 680, 460), "M580 380 L1340 380 L1300 300 L620 300 Z", R(1050, 500, 250, 180), "M1030 500 L1320 500 L1360 470 L1010 470 Z", R(300, 840, 1320, 6),
  ];
  const inner: Part[] = [
    { d: R(640, 640, 640, 20), at: inAt - 10 },
    { d: "M864 520 a36 36 0 1 0 72 0 a36 36 0 1 0 -72 0 Z M850 570 L950 570 L970 760 L830 760 Z", at: inAt },
    { d: R(1180, 516, 60, 34), hot: true, at: camAt, label: "CAM", lp: [1210, 516, 1380, 380] },
    { d: "M1240 533 L1600 450 M1240 533 L1600 650", fill: false, at: camAt + 10 },
  ];
  return <Cutaway_D dur={dur} shell={shell} inner={inner} sweepAt={inAt - 40} sweepLen={44} />;
};

/** a station platform in the middle of a freeway: section across the lanes, the platform lights between the traffic */
export const freewaySection: React.FC<{ dur: number }> = ({ dur }) => {
  const shell = [R(160, 600, 640, 26), R(1120, 600, 640, 26), R(860, 560, 200, 66), R(160, 626, 1600, 8)];
  const inner: Part[] = [
    { d: "M200 590 L260 590 L260 570 L330 570 L340 590 L380 590 L380 600 L200 600 Z M1500 590 L1560 590 L1560 570 L1630 570 L1640 590 L1680 590 L1680 600 L1500 600 Z", at: 40 },
    { d: R(860, 556, 200, 4), hot: true, at: 70, label: "PLATFORM", lp: [960, 556, 960, 420] },
    { d: "M820 640 L1100 640 M820 650 L1100 650", fill: false, at: 60 },
  ];
  return <Cutaway_D dur={dur} shell={shell} inner={inner} sweepAt={20} sweepLen={44} />;
};
