// node rc-render.mjs <cards.json> <out.mov> <frames>   (cards.json = {cards:[...], ...opts})
import { readFileSync } from "node:fs"; import { spawnSync } from "node:child_process"; import { dirname, join, resolve } from "node:path";
const [cj, out, frames] = process.argv.slice(2);
const root = "C:/Users/ayush/Videos/CLAUDE/PROJECT/graphics/hyperframes";
const o = JSON.parse(readFileSync(resolve(cj), "utf8"));
const vars = { accent: "#a30c1d", lead: 0.4, fps: 30000/1001, durationInFrames: Number(frames), ...o, cards: JSON.stringify(o.cards) };
const NPX = join(dirname(process.execPath), "node_modules/npm/bin/npx-cli.js");
const r = spawnSync(process.execPath, [NPX, "--yes", "hyperframes@0.8.210", "render", "-c", "props/camping8/RisingCommentsTr.html", "--fps", "30000/1001", "--workers", "2", "--format", "mov", "-o", resolve(out), "--variables", JSON.stringify(vars)], { cwd: root, encoding: "utf8", maxBuffer: 1<<28 });
const log = r.stdout + r.stderr; console.log(log.split("\n").filter(l=>/rendered in|rror|fail/i.test(l)).slice(0,6).join("\n"));
const p = spawnSync("ffprobe", ["-v","error","-count_frames","-show_entries","stream=codec_type,pix_fmt,nb_read_frames,avg_frame_rate","-of","csv=p=0",resolve(out)],{encoding:"utf8"}); console.log(p.stdout.trim());
process.exit(r.status);
