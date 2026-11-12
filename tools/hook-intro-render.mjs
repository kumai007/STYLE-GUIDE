// Render the HookIntro port with a props JSON (the same file Remotion takes, e.g. templates/props/hook-ps.json).
// Why a wrapper: hyperframes 0.8.210 (1) cannot read --variables-file or a variables path ("io.readFile is not a function"), so JSON is passed inline, and
// (2) takes the render length from the root's static data-duration, which variables cannot change.
// So: read props, compute length = (210 + 100*clips + 450)/60 s, patch it into a temp copy, render, delete the copy.
// Usage: node tools/hook-intro-render.mjs <props.json> <out.mp4> [extra render flags...]   (run from graphics/hyperframes)
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
const [, , propsPath, outPath, ...extra] = process.argv;
if (!propsPath || !outPath) { console.error("usage: node tools/hook-intro-render.mjs <props.json> <out.mp4> [flags]"); process.exit(2); }
const props = JSON.parse(readFileSync(propsPath, "utf8"));
const n = (props.clips ?? []).length;
const secs = (210 + 100 * n + 450) / 60;
const src = "compositions/hook-intro/hook-intro.html", tmp = "compositions/hook-intro/_render-tmp.html";
const html = readFileSync(src, "utf8").replace(/(id="root"[^>]*data-duration=")[^"]*"/, `$1${secs}"`);
writeFileSync(tmp, html);
const q = (j) => `"${j.replace(/"/g, '\\"')}"`; // cmd.exe quoting for inline JSON
let r;
try {
  r = spawnSync("npx", ["--yes", "hyperframes@0.8.210", "render", "-c", tmp, "--variables", q(JSON.stringify(props)), "-o", outPath, "--workers", "2", "--quality", "high", ...extra], { stdio: "inherit", shell: true });
} finally { try { unlinkSync(tmp); } catch {} }
process.exit(r?.status ?? 1);
