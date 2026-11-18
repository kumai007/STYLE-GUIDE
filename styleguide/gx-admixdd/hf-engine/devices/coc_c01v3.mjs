// coc_c01v3.mjs - case-1 v3 wrappers (owned by the case-1 agent). They only resolve real freeze frames through ctx.still (the case
// table cannot call ctx) and hand off to the coc_v3 devices. No render fns, no colours of their own.
import { Board, FzPrint } from './coc_v3.mjs';

/** SBoard: coc_v3 Board whose prints may name a footage freeze `still: [src, nativeFrame]` instead of an `img` path. */
export const SBoard = {
  name: 'SBoard',
  html: (p, ctx) => Board.html({ ...p, prints: p.prints.map((q) => (q.still ? { ...q, img: ctx.still(q.still[0], q.still[1]), seed: q.seed || q.still.join('_') } : q)) }, ctx),
};

/** SFz: coc_v3 FzPrint. p = { src, n (native freeze frame), sw, sh, at (f), rot, video (a CFoot node that plays until the freeze) }. */
export const SFz = {
  name: 'SFz',
  html: (p, ctx) => FzPrint.html({ still: ctx.still(p.src, p.n), sw: p.sw, sh: p.sh, at: p.at, rot: p.rot, video: p.video ? ctx.node(p.video) : '' }, ctx),
};

export default [SBoard, SFz];
