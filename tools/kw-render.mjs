#!/usr/bin/env node
// kw-render: works around `render --variables-file` ("io.readFile is not a function", 0.8.210)
// by passing the props JSON inline (stdin/--variables-file are broken too), quoted for cmd.exe. Format is chosen from the output extension.
// usage: node tools/kw-render.mjs <compositions/kw/x.html> <props.json> <out.mp4|out.mov> [extra render flags]
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
const [comp, props, out, ...extra] = process.argv.slice(2);
if (!comp || !props || !out) { console.error("usage: kw-render.mjs <comp.html> <props.json> <out> [flags]"); process.exit(2); }
const json = JSON.stringify(JSON.parse(readFileSync(props, "utf8")));
const fmt = out.toLowerCase().endsWith(".mov") ? "mov" : "mp4";
const args = ["--yes", "hyperframes@0.8.210", "render", "-c", comp, "--variables", `"${json.replace(/"/g, '\\"')}"`, "--format", fmt, "-w", "2", "--quiet", "-o", out, ...extra];
const r = spawnSync("npx", args, { stdio: "inherit", shell: true });
process.exit(r.status ?? 1);
