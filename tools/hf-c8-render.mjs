#!/usr/bin/env node
// hf-c8-render.mjs <comp> <out.mp4> [--dur S] [--props file.json] [--set k=v]... [--workers N] [--keep-tmp]
// Renders a compositions/camping8 composition. Patches every data-duration equal to the root's into a temp copy
// (variables cannot change render length in 0.8.210; --variables-file is broken, so variables go inline).
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const NPX = join(dirname(process.execPath), "node_modules/npm/bin/npx-cli.js");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const a = process.argv.slice(2);
if (a.length < 2) { console.error("usage: hf-c8-render.mjs <comp> <out> [--dur S] [--props f] [--set k=v]"); process.exit(2); }
const [id, outArg] = a; const out = resolve(outArg);
let props = {}, workers = "2", keep = false, dur = null;
for (let i = 2; i < a.length; i++) {
  if (a[i] === "--props") props = { ...props, ...JSON.parse(readFileSync(resolve(a[++i]), "utf8")) };
  else if (a[i] === "--set") { const [k, ...v] = a[++i].split("="); let val = v.join("="); try { val = JSON.parse(val); } catch {} props[k] = val; }
  else if (a[i] === "--dur") dur = Number(a[++i]);
  else if (a[i] === "--workers") workers = a[++i];
  else if (a[i] === "--keep-tmp") keep = true;
  else { console.error("unknown arg " + a[i]); process.exit(2); }
}
const src = join(root, "compositions/camping8", id + ".html");
if (!existsSync(src)) { console.error("no composition " + src); process.exit(2); }
let html = readFileSync(src, "utf8");
const m = html.match(/data-composition-id="[^"]+"[^>]*?data-duration="([^"]+)"[^>]*?data-fps="(\d+)"/);
const fps = Number(m[2]), d0 = m[1];
if (dur) { const D = (Math.round(dur * fps) / fps).toFixed(6); html = html.split(`data-duration="${d0}"`).join(`data-duration="${D}"`); dur = Number(D); } else dur = Number(d0);
const frames = Math.round(dur * fps);
const tmp = join(root, "compositions/camping8", `_tmp_${id}_${process.pid}.html`);
writeFileSync(tmp, html);
const fmt = /\.mov$/i.test(out) ? "mov" : "mp4";
const args = [NPX, "--yes", "hyperframes@0.8.210", "render", "-c", tmp, "-o", out, "--format", fmt, "--workers", workers, "--quiet"];
if (Object.keys(props).length) args.push("--variables", JSON.stringify(props));
console.log(`[c8] ${id} ${dur}s frames=${frames} -> ${out}`);
const r = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
if (!keep) try { unlinkSync(tmp); } catch {}
const log = (r.stdout || "") + (r.stderr || "");
if (r.status !== 0 || !existsSync(out)) { console.error("render failed (exit " + r.status + ")\n" + log.split("\n").slice(-15).join("\n")); process.exit(1); }
const p = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=width,height,pix_fmt,nb_read_frames", "-of", "csv=p=0", out], { encoding: "utf8" });
const [w, h, pf, n] = p.stdout.trim().split(",");
const ok = Number(n) === frames;
console.log(`[c8] verify ${w}x${h} ${pf} frames=${n}/${frames} ${ok ? "OK" : "MISMATCH"}`);
process.exit(ok ? 0 : 1);
