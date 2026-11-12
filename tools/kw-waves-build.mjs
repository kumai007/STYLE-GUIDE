#!/usr/bin/env node
// kw-waves-build: bundle the per-frame spectra the Remotion AudioWave reads at runtime
// (templates/public/kw/waves/*.json = {fps, frames, bands[frame][64]}, precomputed off each clip's
// real audio) into ONE script, assets/kw/waves/all.js -> window.KW_WAVES[<name>] = {fps,frames,bands}.
// The composition reads it synchronously, so nothing is fetched or computed at seek time.
// usage: node tools/kw-waves-build.mjs [srcDir] [outFile]
import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(process.argv[2] ?? resolve(here, "../../templates/public/kw/waves"));
const out = resolve(process.argv[3] ?? resolve(here, "../assets/kw/waves/all.js"));
const all = {};
for (const f of readdirSync(src).filter((f) => f.endsWith(".json")).sort()) {
  const w = JSON.parse(readFileSync(resolve(src, f), "utf8"));
  if (!Array.isArray(w.bands) || w.bands.length !== w.frames) throw new Error(`${f}: bands/frames mismatch`);
  all[basename(f, ".json")] = { fps: w.fps, frames: w.frames, bands: w.bands };
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, "window.KW_WAVES=" + JSON.stringify(all) + ";\n");
console.log(`${Object.keys(all).length} waves -> ${out} (${(statSync(out).size / 1048576).toFixed(2)} MB)`);
