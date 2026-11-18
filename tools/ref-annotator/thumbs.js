/* Thumbnail atlas for the WebGL board.
   64x36 jpgs from POST /api/thumbs are packed into 2048x2048 canvas pages (32 x 56 slots); each slot is a
   PIXI texture over its page. Mean colours (for the far-out dots) are kept separately and never evicted.
   Keys are strings made by thumbKey(): "v|<src>|<frame or empty>" or "img|<path>|<ver>". */
(function (root) {
  const TW = 64, TH = 36, PS = 2048, COLS = 32, ROWS = 56, PER = COLS * ROWS, MAXP = 8, BATCH = 256, FLIGHT = 2, RETRY = 5000;
  const have = new Map();     // key -> {tex, page}
  const colors = new Map();   // key -> 0xRRGGBB
  const missAt = new Map();   // key -> time of the last miss
  const busy = new Set();     // keys in flight
  const pages = [];           // {cv, ctx, source, keys: Set, next, used, dirty, tex0}
  const subs = [];
  let wanted = [], wantColors = false, queue = [], qColors = false, flying = 0, timer = 0;

  function body(key) {        // "v|a/b.mp4|123" -> {v, f}; "img|p|3" -> {img, ver}
    const i = key.indexOf("|"), j = key.lastIndexOf("|"), t = key.slice(0, i), mid = key.slice(i + 1, j), end = key.slice(j + 1);
    return t === "img" ? { img: mid, ver: +end || 0 } : { v: mid, f: end === "" ? null : +end };
  }
  const emit = (keys) => { if (keys.length) for (const f of subs) f(keys); };

  function newPage() {
    const cv = document.createElement("canvas"); cv.width = PS; cv.height = PS;
    const ctx = cv.getContext("2d");
    const source = new PIXI.CanvasSource({ resource: cv, autoGenerateMipmaps: false, scaleMode: "linear" });
    const p = { cv, ctx, source, keys: new Set(), next: 0, used: 0, dirty: false, index: pages.length };
    pages.push(p); return p;
  }
  // a page with a free slot; when all 8 are full the least recently wanted one is cleared and reused
  function freePage() {
    const cur = pages[pages.length - 1];
    if (cur && cur.next < PER) return cur;
    for (const p of pages) if (p.next < PER) return p;
    if (pages.length < MAXP) return newPage();
    let old = pages[0]; for (const p of pages) if (p.used < old.used) old = p;
    const gone = [...old.keys]; for (const k of gone) { const h = have.get(k); if (h) h.tex.destroy(false); have.delete(k); }
    old.keys.clear(); old.next = 0; old.ctx.clearRect(0, 0, PS, PS); old.dirty = true;
    emit(gone);
    return old;
  }
  function place(key, bmp) {
    const p = freePage(), s = p.next++, x = (s % COLS) * TW, y = Math.floor(s / COLS) * TH;
    p.ctx.drawImage(bmp, x, y, TW, TH); bmp.close && bmp.close();
    // inset by a pixel so linear filtering never samples the neighbouring thumb
    const tex = new PIXI.Texture({ source: p.source, frame: new PIXI.Rectangle(x + 1, y + 1, TW - 2, TH - 2) });
    p.keys.add(key); p.used = performance.now(); p.dirty = true;
    have.set(key, { tex, page: p.index });
  }

  async function send(keys, onlyColors) {
    flying++;
    for (const k of keys) busy.add(k);
    const done = [];
    try {
      const r = await fetch("/api/thumbs", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: keys.map(body), colors: onlyColors }) });
      if (!r.ok) throw new Error(`thumbs ${r.status}`);
      const buf = await r.arrayBuffer(), n = new DataView(buf).getUint32(0);
      const head = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, n)));
      const blob = new Blob([new Uint8Array(buf, 4 + n)], { type: "image/jpeg" });
      const bmps = await Promise.all(head.map((h) => h.len && !have.has(keys[h.k])
        ? createImageBitmap(blob.slice(h.off, h.off + h.len)).catch(() => null) : null));
      head.forEach((h, i) => {
        const key = keys[h.k]; if (key == null) return;
        if (h.miss) { missAt.set(key, performance.now()); return; }
        missAt.delete(key);
        if (h.c) colors.set(key, (h.c[0] << 16) | (h.c[1] << 8) | h.c[2]);
        if (bmps[i]) place(key, bmps[i]);
        done.push(key);
      });
    } catch (e) {
      const t = performance.now(); for (const k of keys) missAt.set(k, t);
      console.warn("thumbnails:", e.message);
    } finally {
      for (const k of keys) busy.delete(k);
      flying--; emit(done); pump();
    }
  }
  function pump() {
    while (flying < FLIGHT && queue.length) send(queue.splice(0, BATCH), qColors);
  }
  // the keys on screen now (replaces the previous wish); colours only when far out
  function want(keys, onlyColors) {
    wanted = keys; wantColors = !!onlyColors;
    const now = performance.now(), q = [];
    for (const k of keys) {
      const h = have.get(k);
      if (h) { pages[h.page].used = now; continue; }
      if (onlyColors && colors.has(k)) continue;
      if (busy.has(k)) continue;
      const m = missAt.get(k); if (m && now - m < RETRY) continue;
      q.push(k);
    }
    queue = q; qColors = wantColors; pump();
    clearTimeout(timer);
    if (keys.length) timer = setTimeout(() => want(wanted, wantColors), RETRY + 50);   // retry misses while still wanted
  }
  function get(key) {
    const h = have.get(key), c = colors.get(key);
    return h || c != null ? { tex: h ? h.tex : null, page: h ? h.page : -1, c: c == null ? null : c } : null;
  }
  function flush() { for (const p of pages) if (p.dirty) { p.dirty = false; p.source.update(); } }
  const pageSource = (i) => pages[i] && pages[i].source;
  const stats = () => ({ pages: pages.length, thumbs: have.size, colors: colors.size, flying, queued: queue.length });

  root.Thumbs = { want, get, flush, pageSource, stats, onLoad: (f) => subs.push(f), TW, TH };
})(typeof window !== "undefined" ? window : globalThis);
