/**
 * Render a HyperFrames overlay to ProRes 4444 with alpha, for Premiere.
 * Drop-in for the Remotion wrapper graphics/templates/render-overlay.mjs (same CLI shape):
 *
 *   node tools/render-overlay.mjs --all                         # one of every overlay (smoke test)
 *   node tools/render-overlay.mjs CaseCard out/case-01.mov --props props/overlays/p-case.json
 *   node tools/render-overlay.mjs TitleCard out/t.mov --set title="The Missing Hours" --set kicker="Case File"
 *
 * Run from anywhere; relative --props / out paths resolve against the current directory.
 *
 * Why a wrapper rather than `hyperframes render` directly (both confirmed on 0.8.210):
 *  - `--variables-file` fails ("io.readFile is not a function") and a variable cannot change the
 *    composition length (root data-duration is read from the file). So the wrapper writes a temp
 *    copy of the composition next to the original (relative lib/ and assets/ paths keep working)
 *    with the merged props baked in as the variable defaults and data-duration set from
 *    `durationInFrames` (frames @30fps, same key the Remotion version used). The copy is deleted after.
 *  - Output is verified: alpha pix_fmt (yuva*), frame count == durationInFrames, and NO audio
 *    stream (a silent track clobbers narration in Premiere); one is stripped with ffmpeg if present.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = "hyperframes@0.8.210";
const FILES = {
  TitleCard: "title-card.html",
  CaseCard: "case-card.html",
  LowerThird: "lower-third.html",
  Emphasis: "emphasis.html",
  LocationStamp: "location-stamp.html",
};
const FPS = 30;

const argv = process.argv.slice(2);
const flagVals = (name) => argv.flatMap((a, i) => (a === `--${name}` ? [argv[i + 1]] : []));
const sets = Object.fromEntries(
  flagVals("set").map((s) => { const [k, ...r] = String(s ?? "").split("="); return [k, r.join("=")]; }),
);

const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { encoding: "utf8", shell: process.platform === "win32", ...opts });

function coerce(decl, value) {
  if (decl?.type === "number") return Number(value);
  if (decl?.type === "boolean") return value === true || value === "true";
  return value;
}

function render(id, out, props) {
  const file = FILES[id];
  if (!file) { console.error(`unknown composition ${id}; one of: ${Object.keys(FILES).join(", ")}`); return false; }
  const src = join(ROOT, "compositions", "overlays", file);
  let html = readFileSync(src, "utf8");

  const m = html.match(/data-composition-variables='([^']*)'/);
  const decls = JSON.parse(m[1]);
  const merged = {};
  for (const d of decls) {
    const v = props[d.id] !== undefined ? coerce(d, props[d.id]) : d.default;
    merged[d.id] = v;
    d.default = v;
  }
  const unknown = Object.keys(props).filter((k) => !(k in merged));
  if (unknown.length) console.warn(`warn ${id}: ignoring unknown props ${unknown.join(", ")}`);

  const frames = Math.round(Number(merged.durationInFrames));
  html = html.replace(m[0], `data-composition-variables='${JSON.stringify(decls).replace(/'/g, "&#39;")}'`);
  html = html.replace(
    /(data-composition-id="[^"]+"\s+data-start="0"\s+data-duration=")[^"]*(")/,
    `$1${frames / FPS}$2`,
  );

  const outAbs = resolve(out);
  mkdirSync(dirname(outAbs), { recursive: true });
  const tmp = join(ROOT, "compositions", "overlays", `.tmp-${process.pid}-${file}`);
  writeFileSync(tmp, html, "utf8");
  let r;
  try {
    r = sh("npx", ["--yes", CLI, "render", "-c", `compositions/overlays/.tmp-${process.pid}-${file}`,
      "--format", "mov", "--workers", "2", "--quiet", "-o", `"${outAbs}"`], { cwd: ROOT });
  } finally {
    rmSync(tmp, { force: true });
  }
  if (r.status !== 0) {
    console.error(`FAIL ${id}: render exited ${r.status}\n` + (r.stdout + r.stderr).split(/\r?\n/).slice(-12).join("\n"));
    return false;
  }

  const probe = (sel) => sh("ffprobe", ["-v", "error", "-select_streams", sel, "-show_entries",
    "stream=pix_fmt,width,height,nb_frames", "-of", "default=noprint_wrappers=1", `"${outAbs}"`]).stdout.trim();
  const kv = Object.fromEntries(probe("v:0").split(/\r?\n/).map((l) => l.split("=")));
  let audio = probe("a");
  if (audio) {
    const tmpOut = outAbs.replace(/\.mov$/i, "") + ".noaudio.mov";
    sh("ffmpeg", ["-hide_banner", "-v", "error", "-y", "-i", `"${outAbs}"`, "-an", "-c:v", "copy", `"${tmpOut}"`]);
    renameSync(tmpOut, outAbs);
    audio = probe("a");
    console.warn(`note ${id}: render carried an audio stream; stripped with -an`);
  }
  const hasAlpha = /^yuva/.test(kv.pix_fmt ?? "");
  const frameOk = Number(kv.nb_frames) === frames;
  const ok = hasAlpha && !audio && frameOk;
  console.log(
    `${ok ? "ok  " : "FAIL"} ${id.padEnd(14)} ${kv.width}x${kv.height} ${kv.nb_frames}f ${kv.pix_fmt}` +
    (audio ? "  <- HAS AUDIO STREAM" : "") + (hasAlpha ? "" : "  <- NO ALPHA CHANNEL") +
    (frameOk ? "" : `  <- expected ${frames} frames`),
  );
  return ok;
}

if (argv.includes("--all")) {
  const results = Object.keys(FILES).map((id) => render(id, join(ROOT, "out", "overlays", `_smoke-${id}.mov`), {}));
  process.exit(results.every(Boolean) ? 0 : 1);
}

const skip = new Set(["--props", "--set"]);
const [id, out] = argv.filter((a, i) => !a.startsWith("--") && !skip.has(argv[i - 1]));
if (!id || !out) {
  console.error("usage: node tools/render-overlay.mjs <Composition> <out.mov> [--props f.json] [--set k=v ...]");
  console.error(`compositions: ${Object.keys(FILES).join(", ")}`);
  process.exit(2);
}
const pf = flagVals("props")[0];
const fromFile = pf ? JSON.parse(readFileSync(resolve(pf), "utf8")) : {};
process.exit(render(id, out, { ...fromFile, ...sets }) ? 0 : 1);
