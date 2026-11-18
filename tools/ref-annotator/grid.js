"use strict";
// grid.js - uniform spatial grid: which nodes / links overlap a world rect, without looping over all of them.
(function (root) {
  const OFF = 32768, BIG = 1024;
  const key = (i, j) => (i + OFF) * 65536 + (j + OFF);
  class Grid {
    // partsOf(id) (optional): smaller rects covering the item (e.g. pieces of a curve); it is filed only in their cells
    constructor(rectOf, cell = 2048, partsOf = null) { this.rectOf = rectOf; this.cell = cell; this.partsOf = partsOf; this.clear(); }
    clear() { this.cells = new Map(); this.where = new Map(); this.big = new Set(); }
    span(r) { const c = this.cell; return [Math.floor(r.x / c), Math.floor(r.y / c), Math.floor((r.x + r.w) / c), Math.floor((r.y + r.h) / c)]; }
    // re-filing only touches the cells that changed: a small move of a long link usually keeps all of them
    insert(id) {
      const r = this.rectOf(id); if (!r) { this.remove(id); return; }
      const [i0, j0, i1, j1] = this.span(r), boxCells = (i1 - i0 + 1) * (j1 - j0 + 1);
      const parts = boxCells > 4 && this.partsOf ? this.partsOf(id) : null;
      let ks;
      if (parts) {
        const u = new Set();
        for (const q of parts) { const [a, b, c, d] = this.span(q); for (let i = a; i <= c; i++) for (let j = b; j <= d; j++) u.add(key(i, j)); }
        ks = [...u];
      } else {
        ks = []; if (boxCells <= BIG) for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) ks.push(key(i, j));
      }
      if (!ks.length || ks.length > BIG) { this.remove(id); this.big.add(id); this.where.set(id, null); return; }
      const prev = this.where.get(id);
      if (!prev) { this.remove(id); for (const k of ks) this.add(k, id); this.where.set(id, ks); return; }
      const now = new Set(ks), was = new Set(prev);
      for (const k of prev) if (!now.has(k)) { const s = this.cells.get(k); if (s && s.delete(id) && !s.size) this.cells.delete(k); }
      for (const k of ks) if (!was.has(k)) this.add(k, id);
      this.where.set(id, ks);
    }
    add(k, id) { let s = this.cells.get(k); if (!s) this.cells.set(k, (s = new Set())); s.add(id);
    }
    remove(id) {
      if (!this.where.has(id)) return; const ks = this.where.get(id); this.where.delete(id);
      if (!ks) { this.big.delete(id); return; }
      for (const k of ks) { const s = this.cells.get(k); if (s && s.delete(id) && !s.size) this.cells.delete(k); }
    }
    // calls fn(id) once for every id whose rect overlaps [x0,x1]x[y0,y1]; fn returning true stops the walk
    each(x0, y0, x1, y1, fn) {
      const seen = new Set(), test = (id) => {
        if (seen.has(id)) return false; seen.add(id); const r = this.rectOf(id);
        return r && r.x < x1 && r.x + r.w > x0 && r.y < y1 && r.y + r.h > y0 ? fn(id) === true : false;
      };
      for (const id of this.big) if (test(id)) return;
      const [i0, j0, i1, j1] = this.span({ x: x0, y: y0, w: x1 - x0, h: y1 - y0 });
      if ((i1 - i0 + 1) * (j1 - j0 + 1) > this.cells.size) {   // rect covers more cells than exist: walk the cells instead
        for (const [k, s] of this.cells) {
          const i = Math.floor(k / 65536) - OFF, j = (k % 65536) - OFF;
          if (i < i0 || i > i1 || j < j0 || j > j1) continue;
          for (const id of s) if (test(id)) return;
        }
        return;
      }
      for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
        const s = this.cells.get(key(i, j)); if (s) for (const id of s) if (test(id)) return;
      }
    }
    query(x0, y0, x1, y1) { const out = []; this.each(x0, y0, x1, y1, (id) => { out.push(id); }); return out; }
    count(x0, y0, x1, y1, limit) { let n = 0; this.each(x0, y0, x1, y1, () => ++n >= limit); return n; }
    hit(x, y) { return this.query(x, y, x + 1e-6, y + 1e-6); }
  }
  root.Grid = Grid;
  if (typeof module !== "undefined") module.exports = { Grid };
})(typeof window !== "undefined" ? window : globalThis);
