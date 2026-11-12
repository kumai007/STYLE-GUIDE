#!/usr/bin/env node
// hf-case-render.mjs <compositionId> <out> [--props file.json] [--set k=v]... [--workers N] [--keep-tmp]
// Renders a case-cards composition with props. Why a wrapper: HyperFrames 0.8.210 cannot take --variables-file
// ("io.readFile is not a function") and variables do not change render length, so this patches data-duration in a temp copy.
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const NPX = join(dirname(process.execPath), "node_modules/npm/bin/npx-cli.js"); // no shell: cmd mangles quotes and & in JSON
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const a = process.argv.slice(2);
if (a.length < 2) { console.error("usage: hf-case-render.mjs <compositionId> <out> [--props file] [--set k=v] [--workers N]"); process.exit(2); }
const [id, outArg] = a;
const out = resolve(outArg);
let props = {}, workers = "2", keep = false;
for (let i = 2; i < a.length; i++) {
  if (a[i] === "--props") props = { ...props, ...JSON.parse(readFileSync(resolve(a[++i]), "utf8")) };
  else if (a[i] === "--set") { const [k, ...v] = a[++i].split("="); let val = v.join("="); try { val = JSON.parse(val); } catch {} props[k] = val; }
  else if (a[i] === "--workers") workers = a[++i];
  else if (a[i] === "--keep-tmp") keep = true;
  else { console.error("unknown arg " + a[i]); process.exit(2); }
}
const src = join(root, "compositions/case-cards", id + ".html");
if (!existsSync(src)) { console.error("no composition " + src); process.exit(2); }
let html = readFileSync(src, "utf8");
const fps = Number((html.match(/data-composition-id="[^"]+"[^>]*?data-fps="(\d+)"/) || [])[1] || 30);
const defFrames = (html.match(/"id":"frames"[^}]*"default":(\d+)/) || [])[1];
const frames = Math.round(Number(props.frames ?? props.durationInFrames ?? defFrames));
if (!frames) { console.error("cannot determine frame count"); process.exit(2); }
props.frames = frames;
// patch the root data-duration (the element carrying data-composition-id)
const dur = (frames / fps).toFixed(6);
html = html.replace(/(data-composition-id="[^"]+"[^>]*?data-duration=")[^"]*(")/, `$1${dur}$2`);
const tmp = join(root, "compositions/case-cards", `_tmp_${id}_${process.pid}.html`);
writeFileSync(tmp, html);
// alpha modes: only NocturnVcr label / rewind
const dobj = props.data === undefined ? { mode: "date" } : (typeof props.data === "string" ? (() => { try { return JSON.parse(props.data); } catch { return {}; } })() : props.data);
const mode = dobj.mode ?? "label";
const alpha = id === "NocturnVcr" && (mode === "label" || mode === "rewind");
const fmt = alpha ? "mov" : "mp4";
const outPath = out.replace(/\.(mp4|mov)$/i, "") + "." + fmt;
const args = [NPX, "--yes", "hyperframes@0.8.210", "render", "-c", tmp, "-o", outPath, "--format", fmt, "--workers", workers, "--variables", JSON.stringify(props)];
console.log(`[hf-case] ${id} frames=${frames} fps=${fps} format=${fmt} -> ${outPath}`);
const r = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", maxBuffer: 1 << 28 });
if (!keep) try { unlinkSync(tmp); } catch {}
const log = (r.stdout || "") + (r.stderr || "");
const keepLines = log.split("\n").filter((l) => /rendered in|rror|Lint|fail|Cannot|ENOENT/i.test(l)).slice(0, 12);
console.log(keepLines.join("\n"));
if (r.status !== 0 || !existsSync(outPath)) { console.error("render failed (exit " + r.status + ")\n" + log.split("\n").slice(-15).join("\n")); process.exit(1); }
// verify with ffprobe
const p = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,codec_name,pix_fmt,width,height,nb_read_frames,avg_frame_rate", "-of", "json", outPath], { encoding: "utf8" });
const st = JSON.parse(p.stdout).streams;
const v = st.find((s) => s.codec_type === "video"), au = st.find((s) => s.codec_type === "audio");
const ok = Number(v.nb_read_frames) === frames && (!alpha || (/a/.test(v.pix_fmt) && !au));
console.log(`[hf-case] verify: ${v.width}x${v.height} ${v.pix_fmt} frames=${v.nb_read_frames}/${frames} fps=${v.avg_frame_rate} audio=${au ? "YES" : "none"} ${ok ? "OK" : "MISMATCH"}`);
process.exit(ok ? 0 : 1);
