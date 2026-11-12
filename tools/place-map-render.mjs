#!/usr/bin/env node
// Render a place-map composition from a make_map.py props file, working around two hyperframes@0.8.210 limits:
// --variables-file is broken ("io.readFile is not a function") and variables cannot change the root data-duration.
// usage: node tools/place-map-render.mjs <props.json> [--comp place-map|nocturn-map] [--out out/place-map/x.mp4] [--workers 2] [--format mp4|mov]
// It writes a temp copy of the composition with data-duration = frames/fps, inlines {"mapSrc": <props>} (the composition
// reads the big map from the props file itself), renders, and deletes the temp copy.
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const a = process.argv.slice(2);
const opt = (k, d) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; };
const propsPath = a.find((x, i) => !x.startsWith("--") && !(i && a[i - 1].startsWith("--")));
if (!propsPath) { console.error("usage: place-map-render.mjs <props.json> [--comp ..] [--out ..] [--workers 2] [--format mp4|mov]"); process.exit(2); }
const props = JSON.parse(readFileSync(resolve(propsPath), "utf8"));
const comp = opt("--comp", "place-map"), workers = opt("--workers", "2"), format = opt("--format", "mp4");
const out = opt("--out", `out/place-map/${basename(propsPath, ".json")}.${format}`);
const frames = Number(props.frames ?? props.durationInFrames ?? 180), fps = Number(props.fps ?? 30);
const src = resolve(root, "compositions/place-map", comp + ".html");
const tmpRel = `compositions/place-map/_tmp-${process.pid}.html`;
let html = readFileSync(src, "utf8");
html = html.replace(/data-composition-id="[^"]+" data-start="0" data-duration="[^"]+"/, (m) => m.replace(/data-duration="[^"]+"/, `data-duration="${(frames / fps).toFixed(6)}"`));
writeFileSync(resolve(root, tmpRel), html);
const propsRel = relative(root, resolve(propsPath)).split("\\").join("/");
if (propsRel.startsWith("..")) { console.error("props file must live inside the hyperframes project (props/place-map/)"); rmSync(resolve(root, tmpRel)); process.exit(2); }
const args = ["--yes", "hyperframes@0.8.210", "render", "-c", tmpRel, "--variables", JSON.stringify(JSON.stringify({ mapSrc: propsRel })), "-o", out, "--workers", workers, "--format", format, "--quiet"];
const r = spawnSync("npx", args, { cwd: root, stdio: "inherit", shell: true });
rmSync(resolve(root, tmpRel), { force: true });
process.exit(r.status ?? 1);
