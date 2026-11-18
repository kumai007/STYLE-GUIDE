// CC1 CASE KIT: the Disasters v4 case recipe (Disasters2/LOCKED_SYSTEM_V4.md) as data + one renderer, shared by every case of CCTV Vol 1
// (cases 1-8 = cases_a.ts, cases 9-25 + outro = cases_b.ts). A case is a PLAN (absolute seconds on the tight VO, public/cc1/vo.wav):
//   entry   EntryCard_AB at the case's level depth. The FIRST case of a level opens with the LevelCard_AB dolly push (32 f) flowing into the
//           EntryCard (`cont`); the level card itself (LevelPlan) holds on the wide berg with NO push.
//   shots   footage under the VO, gap-free from the entry's end to the case's end (graded files in public/cc1g, Shot_FX: eased linear push,
//           punches/impacts on VO words, ramps through *_x4 files, FilmLook_FX). A shot may carry `node` instead (map / page / 3D).
//   overs   devices over the footage (DateCard_IC3 once at the case start, NameTag only for a person on screen first named, ...).
//   subs    raw-sound subtitles (RawSub_N2) for kept raws; `raws` = the clip audio the mixer plays (timeline_tight raw slots).
//   cuts    designed transitions (n2fx); everything else is a hard cut. sfx / beds / music = mixer cues (tools/dump_cues.mjs -> build/mix).
// Lints run at import (no render can start with a broken case): cut lint (n2fx lintEdit), device pacing (b/rules lintPlan), shot spans,
// same-source-window <= 2x per case, ramps inside their x4 files, span = the timeline block.
import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { EntryCard_AB, LevelCard_AB, levelCardEnd } from "../../lib/templates/iceberg/abyss";
import { DateCard_IC3 } from "../../lib/templates/iceberg/cine";
import { FilmLook_FX, Shot_FX, rampSrc, type FxCut, type FxImpact, type FxPunch, type SpeedKey } from "../../lib/templates/n2fx/fx";
import { lintEdit, type LintShot } from "../../lib/templates/n2fx/cutlint";
import { RawSub_N2, type SubLine } from "../../lib/templates/n2/n2";
import { lintPlan, type DevSpec } from "../b/rules";
import { BLOCKS, block } from "../data/timeline";
import { entryFor } from "../data/levels";
import SRCCUTS from "../data/srccuts.json"; // tools/flash_audit.py (source cuts per graded clip, clip s; detected once, cached)

export const FPS = 30;
export const F = (s: number) => Math.round(s * FPS);
export const G = "cc1g/"; // graded clips (grade/grade.py)
export const OPENER = 3.8; // timeline opener slot (tools/runtime_tight.py)
export const PUSH_LEAD = 0.275; // first case of a level: the push starts this long before the block (Disasters v4: 62.0 vs 62.275)
export const ENTRY_LEAD = 0.17; // other cases: EntryCard_AB needs >= 119 f, the opener slot is 114 f -> start 5 f early
const PUSH_IN = 66, PUSH_LV = 98; // LevelCard_AB frames shown for the push (6 f wide, 14 f dolly, 12 f landing): its minimum

/** first case of each level (the push opens it) */
const FIRSTS = new Set(BLOCKS.filter((b, i) => b.kind === "case" && BLOCKS[i - 1]?.kind === "level_card").map((b) => b.id));
/** where a block's picture span starts on the timeline (cases start before their block: push / entry lead) */
export const spanStart = (id: string) => { const b = block(id); return b.kind !== "case" ? b.new_in : Math.round((b.new_in - (FIRSTS.has(id) ? PUSH_LEAD : ENTRY_LEAD)) * 1000) / 1000; };
/** the span of any block = [its start, the next block's start) */
export const span = (id: string): { a: number; b: number } => {
  const i = BLOCKS.findIndex((x) => x.id === id), nx = BLOCKS[i + 1];
  return { a: spanStart(id), b: nx ? spanStart(nx.id) : BLOCKS[i].new_out };
};
export const isFirst = (id: string) => FIRSTS.has(id);
/** case entry window: [span start, block start + opener] */
export const entryOf = (id: string) => ({ a: spanStart(id), b: Math.round((block(id).new_in + OPENER) * 1000) / 1000 });

export type CShot = {
  id: string; a: number; b: number; vo: string; // absolute s; vo = the words it covers / cuts on (documentation + review)
  src?: string; node?: React.ReactNode; // a graded file (G + name) or a device node (map / page / 3D)
  from?: number; ramp?: { keys: SpeedKey[]; ease?: number; fileSec: number }; still?: boolean; fill?: boolean;
  s0?: number; s1?: number; fx?: number; fy?: number; pan?: [number, number]; panY?: [number, number]; rot?: [number, number, number?, number?];
  punches?: FxPunch[]; impacts?: FxImpact[]; blurBand?: [number, number];
  dev?: string; // device kind when `node` is a designed device (map, page, recon): goes into the pacing lint
  srcSec?: [number, number]; // source window (for the window-reuse lint) when the file is not a plain cut
};
export type COver = { kind: string; a: number; b: number; node: React.ReactNode; words?: number };
export type CCue = { at: number; file: string; db: number; prelap: number; note?: string };
export type CBed = { a: number; b: number; fi: number; fo: number; note: string };
export type CMusic = { name: string; file: "Music 8.mp3" | "Music 9.mp3" | "Music 10.mp3"; a: number; b: number; ft: number; fin: number; fout?: [number, number]; drop?: [number, number, number]; ref: [number, number] };
export type CRaw = { id: string; a: number; b: number; src: string; srcIn: number; gainDb: number }; // clip audio for the mixer (source file + in)
export type CasePlan = {
  id: string; title: string; shots: CShot[]; overs?: COver[]; subs?: (SubLine & { abs: number })[]; cuts?: FxCut[];
  sfx: CCue[]; beds?: CBed[]; music?: CMusic[]; raws?: CRaw[]; date?: { date: string; year: string; a: number; b: number; y?: number };
};
export type LevelPlan = { id: string; level: number; card: { a: number; b: number }; shots: CShot[]; cuts?: FxCut[]; sfx: CCue[]; beds?: CBed[]; music?: CMusic[] };
/** what the timeline assembles: one entry per block (a/b = its picture span) */
export type CaseEntry = { id: string; a: number; b: number; Picture: React.FC; cuts: FxCut[]; sfx: CCue[]; beds: CBed[]; music: CMusic[]; raws: CRaw[]; subs: { abs: number; t: string; at: number; end: number }[] };

/** absolute second -> shot-local frame (for punches / impacts on a VO word) */
export const at = (abs: number, a: number, back = 0) => F(abs) - F(a) - back;

const At: React.FC<{ a: number; b: number; children: React.ReactNode }> = ({ a, b, children }) => (
  <Sequence from={F(a)} durationInFrames={Math.max(1, F(b) - F(a))} layout="none"><AbsoluteFill>{children}</AbsoluteFill></Sequence>
);
export const ShotView: React.FC<{ s: CShot }> = ({ s }) => {
  if (s.node) return <>{s.node}</>;
  return (
    <FilmLook_FX>
      <Shot_FX src={s.src!.startsWith("cc1/") ? s.src! : G + s.src!} n={F(s.b) - F(s.a)} from={s.from} ramp={s.ramp} still={s.still} fill={s.fill} s0={s.s0} s1={s.s1} fx={s.fx} fy={s.fy}
        pan={s.pan} panY={s.panY} rot={s.rot} punches={s.punches} impacts={s.impacts} blurBand={s.blurBand} />
    </FilmLook_FX>
  );
};
export const Shots: React.FC<{ shots: CShot[] }> = ({ shots }) => <>{shots.map((s) => <At key={s.id} a={s.a} b={s.b}><ShotView s={s} /></At>)}</>;

// ---------------------------------------------------------------- lints
/** cases not yet rebuilt under PEAK_V5: source-cut hits only warn (remove an id once its case is rebuilt) */
export const SRC_PENDING = new Set<string>([]);
/** clips whose detections are the camera's own low-fps frame steps, not edits (checked by eye once) */
const SRC_LOWFPS = new Set(["c02_q_j"]);
const srcRange = (s: CShot): [number, number] | null => {
  if (s.srcSec) return s.srcSec;
  if (!s.src || s.node) return null;
  const n = F(s.b) - F(s.a), from = s.from ?? 0;
  if (s.still) return [from, from + 0.04];
  return [from, from + (s.ramp ? rampSrc(n, s.ramp.keys, s.ramp.ease ?? 0.3) : n / FPS)];
};
const lintShots = (name: string, a: number, b: number, shots: CShot[], cuts: FxCut[], devs: DevSpec[]) => {
  const e: string[] = [];
  if (!shots.length) e.push("no shots");
  else {
    if (F(shots[0].a) !== F(a)) e.push(`first shot starts ${shots[0].a}, expected ${a}`);
    if (F(shots[shots.length - 1].b) !== F(b)) e.push(`last shot ends ${shots[shots.length - 1].b}, span ends ${b}`);
  }
  shots.forEach((s, i) => { if (i && F(s.a) !== F(shots[i - 1].b)) e.push(`${s.id} starts ${s.a}, ${shots[i - 1].id} ends ${shots[i - 1].b}`); });
  // same source window <= 2x per case (owner: reframe, never a third pass over the same seconds)
  const byFile: Record<string, { id: string; r: [number, number] }[]> = {};
  shots.forEach((s) => { const r = srcRange(s); if (r && s.src) (byFile[s.src] ??= []).push({ id: s.id, r }); });
  Object.entries(byFile).forEach(([f, L]) => {
    const pts = L.flatMap((x) => [x.r[0] + 1e-3, (x.r[0] + x.r[1]) / 2, x.r[1] - 1e-3]);
    pts.forEach((p) => { const k = L.filter((x) => p >= x.r[0] && p <= x.r[1]); if (k.length > 2) e.push(`${f}: source second ${p.toFixed(2)} used ${k.length}x (${k.map((x) => x.id).join(", ")}) > 2x`); });
  });
  const warn: string[] = [];
  // ramps: speeds 0.25-3.2 and the window inside the x4 file (n2fx asserts the same at render: fail here, before a render starts)
  shots.forEach((s) => {
    if (!s.ramp) return;
    s.ramp.keys.forEach((k) => { if (k.v < 0.25 - 1e-6 || k.v > 3.2) e.push(`${s.id}: ramp speed ${k.v} outside 0.25-3.2`); });
    const r = srcRange(s); if (r && r[1] * 4 > s.ramp.fileSec + 1e-3) e.push(`${s.id}: ramp runs to ${r[1].toFixed(3)} s, the x4 file holds ${(s.ramp.fileSec / 4).toFixed(3)} s`);
  });
  // ZERO FLASH (PEAK_V5): a window starts >= 3 f after any source-internal cut and never crosses one
  shots.forEach((s) => {
    const r = srcRange(s); if (!r || !s.src || s.src.startsWith("cc1/") || s.ramp) return; // ramps play the blended x4 file: the render gate checks those
    const c = (SRCCUTS as Record<string, { cuts: number[]; a: number }>)[s.src.replace(/\.mp4$/, "")];
    if (!c || SRC_LOWFPS.has(s.src.replace(/\.mp4$/, ""))) return;
    const o = s.srcSec ? c.a : 0; // srcSec (cases B) is in SOURCE seconds; the audit's cuts are clip seconds
    // a cut near either window edge leaves a < 0.7 s fragment = a flash; a cut well inside (>= 0.7 s both sides) is the same picture as two
    // shots split exactly at the source cut (each >= 21 f), so it is accepted as such.
    const w0 = r[0] - o, w1 = r[1] - o;
    const inside = c.cuts.filter((t) => t > w0 - 0.1 + 1e-3 && t < w1 - 0.017);
    const bad = [...inside.filter((t) => t < w0 + 0.7 || t > w1 - 0.7), ...inside.filter((t, i) => i > 0 && t - inside[i - 1] < 0.7)]; // edge fragments + bursts
    if (bad.length) (SRC_PENDING.has(name.split(" ")[0]) || (typeof process !== "undefined" && process.env?.SRC_LIST) ? warn : e).push(`${s.id}: ${s.src} window ${r[0].toFixed(2)}-${r[1].toFixed(2)} s meets a source cut at ${bad.join(", ")} s`);
  });
  if (warn.length && typeof process !== "undefined" && process.env?.SRC_WARN) console.warn(`SRC-CUT (pending rebuild) ${name}:\n - ` + warn.join("\n - "));
  if (e.length) throw new Error(`CASE LINT FAILED (${name}):\n - ` + [...new Set(e)].join("\n - "));
  const ls: LintShot[] = shots.map((s) => {
    const n = F(s.b) - F(s.a), from = s.from ?? 0;
    const r = srcRange(s);
    return { at: F(s.a), n, key: s.src ?? s.id, srcIn: r ? r[0] : from, srcOut: r ? r[1] : undefined, scaleIn: s.s0 ?? 1, scaleOut: s.s1 ?? s.s0 ?? 1, punches: s.punches, impacts: s.impacts };
  });
  lintEdit(name, ls, cuts.filter((c) => c.at >= F(a) && c.at < F(b)), F(b));
  lintPlan(name, devs);
};

// ---------------------------------------------------------------- a case
export const makeCase = (p: CasePlan): CaseEntry => {
  const sp = span(p.id), en = entryOf(p.id), bl = block(p.id), lv = bl.level!, e = entryFor(p.id), first = isFirst(p.id);
  if (bl.kind !== "case") throw new Error(`${p.id} is not a case block`);
  const pushEnd = F(en.a) + (PUSH_LV - PUSH_IN);
  const cuts: FxCut[] = [
    ...(first ? [{ at: F(en.a), kind: "glitch" as const, len: 8 }] : []), // level footage -> the berg (the push opens the case)
    { at: F(en.b), kind: "glitch", len: 8 }, // entry card -> footage (EntryCard_AB's own out-glitch rises into it)
    ...(p.cuts ?? []),
  ];
  const overs = [...(p.overs ?? [])];
  if (p.date) overs.push({ kind: "DateCard_IC3", a: p.date.a, b: p.date.b, node: <AbsoluteFill style={{ transform: `translateY(${p.date.y ?? 318}px)` }}><DateCard_IC3 dur={F(p.date.b) - F(p.date.a)} date={p.date.date} year={p.date.year} start={6} /></AbsoluteFill> });
  const devs: DevSpec[] = [
    { kind: "EntryCard_IC3", a: en.a, b: en.b },
    ...overs.map((o) => ({ kind: o.kind, a: o.a, b: o.b, words: o.words })),
    ...p.shots.filter((s) => s.dev).map((s) => ({ kind: s.dev!, a: s.a, b: s.b })),
  ];
  lintShots(`${p.id} ${p.title}`, en.b, sp.b, p.shots, cuts, devs);
  const Picture: React.FC = () => (
    <>
      {first ? (
        <>
          <Sequence from={F(en.a)} durationInFrames={PUSH_LV - PUSH_IN} layout="none">
            <Sequence from={-PUSH_IN} layout="none"><AbsoluteFill><LevelCard_AB dur={PUSH_LV} level={lv} label="" /></AbsoluteFill></Sequence>
          </Sequence>
          <Sequence from={pushEnd} durationInFrames={F(en.b) - pushEnd} layout="none">
            <AbsoluteFill><EntryCard_AB dur={F(en.b) - pushEnd} level={lv} lines={e.lines} seed={e.number} cont={levelCardEnd(PUSH_LV)} /></AbsoluteFill>
          </Sequence>
        </>
      ) : (
        <At a={en.a} b={en.b}><EntryCard_AB dur={F(en.b) - F(en.a)} level={lv} lines={e.lines} seed={e.number} /></At>
      )}
      <Shots shots={p.shots} />
      {overs.map((o, i) => <At key={`o${i}`} a={o.a} b={o.b}>{o.node}</At>)}
      {(p.subs ?? []).length > 0 && <Sequence from={0} layout="none"><RawSub_N2 lines={(p.subs ?? []).map((l) => ({ ...l, at: F(l.abs) + l.at, end: F(l.abs) + l.end }))} /></Sequence>}
    </>
  );
  // standard entry cues (Disasters v4 mix_v3.py gains): push dive + title lift + hand-off glitch; underwater bed under the berg
  const pushAt = (F(en.a) + (72 - PUSH_IN)) / FPS, titleAt = first ? (pushEnd + 8) / FPS : en.a + 33 / FPS;
  const sfx: CCue[] = [
    ...(first ? [{ at: pushAt, file: "sfx_n2/dive_02.wav", db: -5.0, prelap: 1.45, note: `${p.id}: level push-in (dolly ${pushAt.toFixed(2)})` }] : []),
    { at: titleAt, file: "sfx_n2/case_lift_01.wav", db: -6.7, prelap: 0.05, note: `${p.id}: entry title glitch-types in` },
    { at: en.b, file: "sfx_n2/glitch_03.wav", db: -28.0, prelap: 0.0, note: `${p.id}: entry card -> footage` },
    ...p.sfx,
  ];
  const beds: CBed[] = [{ a: en.a - 0.4, b: en.b + 0.25, fi: 0.4, fo: 0.25, note: `${p.id} entry card` }, ...(p.beds ?? [])];
  return { id: p.id, a: sp.a, b: sp.b, Picture, cuts, sfx, beds, music: p.music ?? [], raws: p.raws ?? [], subs: (p.subs ?? []).map((l) => ({ abs: l.abs, t: l.t, at: l.at, end: l.end })) };
};

// ---------------------------------------------------------------- a level block (levels 2-7; level 1 lives in the intro)
/** black 0.2 s -> LevelCard_AB on the wide berg (NO push: dur 210 / holdUntil 170, cut at the card's end) -> level-line footage */
export const makeLevel = (p: LevelPlan): CaseEntry => {
  const sp = span(p.id);
  if (F(p.card.a) !== F(sp.a)) throw new Error(`${p.id}: the level card must start the block (${sp.a})`);
  const cardN = F(p.card.b) - F(p.card.a);
  if (cardN < 98 || cardN > 170) throw new Error(`${p.id}: level card ${cardN} f outside 98-170 (holds on the wide berg, no push)`);
  const cuts: FxCut[] = [{ at: F(p.card.b), kind: "glitch", len: 10 }, ...(p.cuts ?? [])];
  lintShots(`${p.id} level`, p.card.b, sp.b, p.shots, cuts, []);
  const Picture: React.FC = () => (
    <>
      <At a={p.card.a} b={p.card.b}><LevelCard_AB dur={210} holdUntil={170} level={p.level} /></At>
      <Shots shots={p.shots} />
    </>
  );
  const sfx: CCue[] = [
    { at: p.card.a + 25 / FPS, file: "sfx_n2/title_hit_02.wav", db: -12.0, prelap: 0.19, note: `${p.id}: 'Level ${p.level}' fades up` },
    { at: p.card.b, file: "sfx_n2/glitch_02.wav", db: -30.0, prelap: 0.1, note: `${p.id}: level card -> footage` },
    ...p.sfx,
  ];
  return { id: p.id, a: sp.a, b: sp.b, Picture, cuts, sfx, beds: [{ a: p.card.a - 0.2, b: p.card.b + 0.25, fi: 0.3, fo: 0.8, note: `${p.id} level card` }, ...(p.beds ?? [])], music: p.music ?? [], raws: [], subs: [] };
};
