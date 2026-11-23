import { makeCase, H } from './lm_lib.mjs';
const S = JSON.parse((await import('node:fs')).readFileSync(new URL('../../../../productions/last-moments/edit/skel/c02.json', import.meta.url), 'utf8'));
// stub: fill each non-raw gap with 6 s LIP b-roll shots
const gaps = []; let t = 5.5;
for (const r of S.raws) { gaps.push([t, r.a]); t = r.b; } gaps.push([t, S.end]);
const shots = []; let k = 0;
for (const [a, b] of gaps) { let x = a; while (b - x > 0.01) { const y = b - x < 9 ? b : x + 6; const tt = (k * 7) % 70; shots.push([x, y, `T${k}`, (i) => H.clip(i, 'LIP', tt, { over: k === 1 ? [H.place(x + 1, 'DAHAB', 'EGYPT')] : [] })]); x = y; k++; } }
export default makeCase({ id: 'lm_test02', num: 2, title: S.name, plate: ['c02/_test_plate.jpg', 'PHOTO: TEST'], vo: S.vo, raws: S.raws, shots, end: S.end });
