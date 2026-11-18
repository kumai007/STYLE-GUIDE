// The folder being edited: where its HyperFrames compositions and its videos are, and where Claude Code keeps the
// logs of the sessions started in it.
import { readdir, readFile, stat, open } from "node:fs/promises";
import path from "node:path";

export const VIDEO_EXT = /\.(mp4|mov|webm|m4v)$/i;
// Never looked into: dependencies, caches, and our own notes folder.
const SKIP = new Set(["node_modules", "__pycache__", "venv", "dist-electron"]);
export const HIDDEN_WORK = /(^|\/)(node_modules|\.git|\.final-phase-lite|\.hyperframes|\.thumbnails|\.transcode-cache|\.waveform-cache|__pycache__|\.venv|\.DS_Store)(\/|$)/;

export const toRel = (root, p) => path.relative(root, p).split(path.sep).join("/");

/** A path inside the project, or null if it would leave it. */
export function safeJoin(root, relPath) {
  const parts = String(relPath).split("/").filter((s) => s && s !== ".");
  if (parts.some((s) => s === "..")) return null;
  const p = path.resolve(root, ...parts);
  return p === root || p.startsWith(root + path.sep) ? p : null;
}

async function isComposition(file) {
  try {
    const fh = await open(file, "r");
    const buf = Buffer.alloc(40000);
    const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
    await fh.close();
    return /data-composition-id\s*=/.test(buf.subarray(0, bytesRead).toString("utf8"));
  } catch {
    return false;
  }
}

/** HyperFrames compositions (an index.html with a data-composition-id) and video files, a few folders deep. */
export async function scanProject(root, depth = 3) {
  const entries = [];
  const videos = [];
  async function walk(dir, d) {
    let list;
    try {
      list = await readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of list) {
      if (e.name.startsWith(".") || SKIP.has(e.name)) continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (d < depth) await walk(p, d + 1);
      } else if (e.name === "index.html") {
        if (await isComposition(p)) entries.push(toRel(root, p));
      } else if (VIDEO_EXT.test(e.name)) {
        const s = await stat(p).catch(() => null);
        if (s && s.size > 0) videos.push({ path: toRel(root, p), mtime: s.mtimeMs, size: s.size });
      }
    }
  }
  await walk(root, 0);
  entries.sort((a, b) => a.split("/").length - b.split("/").length || a.localeCompare(b));
  videos.sort((a, b) => b.mtime - a.mtime);
  return { entries, videos: videos.slice(0, 40) };
}

/** The size and frame rate a composition says it has, read from its root element. */
export async function compositionInfo(file) {
  const html = await readFile(file, "utf8").catch(() => "");
  const tag = html.match(/<[^>]*data-composition-id\s*=[^>]*>/)?.[0] ?? "";
  const num = (name) => Number(tag.match(new RegExp(`data-${name}\\s*=\\s*["']?([\\d.]+)`))?.[1]) || undefined;
  return { width: num("width") ?? 1920, height: num("height") ?? 1080, duration: num("duration"), fps: num("fps") };
}

/** The HyperFrames version a project pins in its package.json scripts (as `hyperframes init` writes them). */
export async function pinnedHyperframes(dir) {
  const pkg = await readFile(path.join(dir, "package.json"), "utf8").catch(() => "");
  return pkg.match(/hyperframes@(\d+\.\d+\.\d+)/)?.[1] ?? null;
}
