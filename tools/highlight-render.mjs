// Usage: node tools/highlight-render.mjs <props.json> <out.mp4> [extra render args...]
// Run from graphics/hyperframes. Props should already be through compositions/highlight/lib/prepare.py.
// Passes the props INLINE (--variables-file is broken in 0.8.210), sets --fps, spawns without a shell
// (node + npx-cli.js, so the JSON argument is never re-quoted), then ffprobes the result.
// Length needs no patching: Highlight.html has no root data-duration; the timeline follows the variables.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const COMP = "compositions/highlight/Highlight.html";
const [propsPath, out, ...extra] = process.argv.slice(2);
if (!propsPath || !out) { console.error("usage: node tools/highlight-render.mjs <props.json> <out.mp4> [extra args]"); process.exit(2); }

const props = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const f = props.fps || 30;
const fps = Math.abs(f - 29.97) < 0.01 ? "30000/1001" : String(f);
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });

const npxCli = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
const args = [npxCli, "--yes", "hyperframes@0.8.210", "render", "-c", COMP,
  "--variables", JSON.stringify(props), "--fps", fps, "-o", out, "--workers", "2", ...extra];
const r = spawnSync(process.execPath, args, { stdio: "inherit", shell: false });
if (r.status !== 0) { console.error("render failed, exit", r.status); process.exit(r.status ?? 1); }

const p = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v:0",
  "-show_entries", "stream=nb_read_frames,width,height,r_frame_rate,pix_fmt", "-of", "json", out], { encoding: "utf8" });
try {
  const s = JSON.parse(p.stdout).streams[0];
  console.log(`probe: frames=${s.nb_read_frames} size=${s.width}x${s.height} fps=${s.r_frame_rate} pix_fmt=${s.pix_fmt}`);
} catch { console.error("ffprobe failed:", p.stderr); process.exit(1); }
