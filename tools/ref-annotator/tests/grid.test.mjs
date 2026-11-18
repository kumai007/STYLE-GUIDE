import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { Grid } = createRequire(import.meta.url)("../grid.js");

const rects = new Map();
const g = () => new Grid((id) => rects.get(id));
test("query returns only overlapping ids, across cells and negative coords", () => {
  rects.clear(); const G = g();
  rects.set("a", { x: 0, y: 0, w: 100, h: 100 }); rects.set("b", { x: 5000, y: 5000, w: 10, h: 10 });
  rects.set("c", { x: -3000, y: -10, w: 6000, h: 20 });
  for (const k of rects.keys()) G.insert(k);
  assert.deepEqual(G.query(50, 50, 60, 60).sort(), ["a"]);
  assert.deepEqual(G.query(-2900, -5, -2800, 5), ["c"]);
  assert.deepEqual(G.query(4990, 4990, 5001, 5001), ["b"]);
});
test("remove and re-insert after a move", () => {
  rects.clear(); const G = g(); rects.set("a", { x: 0, y: 0, w: 10, h: 10 }); G.insert("a");
  rects.set("a", { x: 9000, y: 0, w: 10, h: 10 }); G.insert("a");
  assert.deepEqual(G.query(0, 0, 20, 20), []); assert.deepEqual(G.query(9000, 0, 9005, 5), ["a"]);
  G.remove("a"); assert.deepEqual(G.query(9000, 0, 9005, 5), []);
});
test("huge rects go to the big set and are still found", () => {
  rects.clear(); const G = g(); rects.set("w", { x: -1e6, y: -1e6, w: 2e6, h: 2e6 }); G.insert("w");
  assert.deepEqual(G.query(10, 10, 11, 11), ["w"]); assert.equal(G.cells.size, 0);
});
test("count stops at limit; hit finds a point", () => {
  rects.clear(); const G = g();
  for (let i = 0; i < 1000; i++) { rects.set("n" + i, { x: (i % 40) * 50, y: Math.floor(i / 40) * 50, w: 40, h: 40 }); G.insert("n" + i); }
  assert.equal(G.count(0, 0, 1e5, 1e5, 451), 451);
  assert.deepEqual(G.hit(55, 5), ["n1"]); assert.deepEqual(G.hit(45, 5), []);
});
test("100k inserts + a screen query are fast", () => {
  rects.clear(); const G = g(); const t = performance.now();
  for (let i = 0; i < 100000; i++) { rects.set("n" + i, { x: (i % 300) * 360, y: Math.floor(i / 300) * 290, w: 320, h: 250 }); G.insert("n" + i); }
  const t1 = performance.now(); const q = G.query(0, 0, 1920, 1080); const t2 = performance.now();
  assert.ok(t1 - t < 400, `insert ${t1 - t} ms`); assert.ok(t2 - t1 < 2, `query ${t2 - t1} ms`); assert.ok(q.length > 0);
});
test("parts: a long diagonal link is filed only in the cells along its path", () => {
  rects.clear();
  const parts = new Map([["d", [{ x: 0, y: 0, w: 10000, h: 10 }, { x: 10000, y: 0, w: 10, h: 40000 }]]]);
  const G = new Grid((id) => rects.get(id), 2048, (id) => parts.get(id));
  rects.set("d", { x: 0, y: 0, w: 10010, h: 40000 }); G.insert("d");
  assert.ok(G.cells.size < 30, `cells ${G.cells.size}`);            // the bounding box would be 5 x 20 = 100 cells
  assert.deepEqual(G.query(5000, 0, 5001, 5), ["d"]);                // on the path
  assert.deepEqual(G.query(10005, 30000, 10006, 30001), ["d"]);
  assert.deepEqual(G.query(100, 30000, 101, 30001), []);            // inside the box, far from the path
  G.remove("d"); assert.equal(G.cells.size, 0);
});
// regression: a 1000-clip drop on a 100k board took ~19 ms because every link was taken out of and put back into
// all ~21 of its cells. Re-insert now only touches cells that changed, and must still leave nothing stale behind.
test("re-insert touches only changed cells and leaves no stale entries", () => {
  rects.clear(); const G = g();
  rects.set("w", { x: 100, y: 100, w: 5000, h: 40 }); G.insert("w");
  const before = G.where.get("w"), cellSet = G.cells.get(before[0]);
  rects.set("w", { x: 130, y: 100, w: 5000, h: 40 }); G.insert("w");      // small move: same cells
  assert.deepEqual(G.where.get("w"), before); assert.equal(G.cells.get(before[0]), cellSet);
  rects.set("w", { x: 9000, y: 9000, w: 5000, h: 40 }); G.insert("w");    // far move: old cells emptied
  for (const k of before) assert.ok(!G.cells.has(k) || !G.cells.get(k).has("w"));
  assert.deepEqual(G.query(200, 100, 300, 140), []); assert.deepEqual(G.query(9100, 9000, 9200, 9040), ["w"]);
  rects.set("w", { x: -1e7, y: 0, w: 2e7, h: 10 }); G.insert("w");         // too big for cells
  assert.ok(G.big.has("w")); assert.equal(G.cells.size, 0);
  rects.set("w", { x: 0, y: 0, w: 10, h: 10 }); G.insert("w");
  assert.ok(!G.big.has("w")); assert.deepEqual(G.query(0, 0, 5, 5), ["w"]);
  rects.delete("w"); G.insert("w"); assert.equal(G.cells.size, 0); assert.ok(!G.where.has("w"));
});
