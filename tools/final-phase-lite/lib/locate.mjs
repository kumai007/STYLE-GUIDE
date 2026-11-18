// Where a circled element lives in the composition's code: the line that makes it, the style rule that styles it,
// and the animation lines that move it. Handing this to the AI saves it the search, which matters most for small
// local models (a 9B model in Ollama): with the exact line, the edit is a one-line change.
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const CODE = /\.(html?|css|m?js)$/i;
const SKIP = /^(node_modules|renders?|\.git|\.hyperframes|\.final-phase-lite|assets|dist|build)$/i;

async function codeFiles(dir, depth = 2, out = []) {
  let list = [];
  try {
    list = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of list) {
    if (e.name.startsWith(".") && e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth > 0 && !SKIP.test(e.name)) await codeFiles(p, depth - 1, out);
    } else if (CODE.test(e.name)) {
      const s = await stat(p).catch(() => null);
      if (s && s.size < 2_000_000) out.push(p);
    }
  }
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** "<div#title.clip.big> …" to { id: "title", classes: ["clip", "big"] } (the window's own description format). */
export function parseDescription(d) {
  const m = /^<([a-z0-9-]+)(#[^.\s>]+)?((?:\.[^.\s>]+)*)>/i.exec(String(d));
  if (!m) return null;
  return { tag: m[1].toLowerCase(), id: m[2]?.slice(1) ?? null, classes: (m[3] ?? "").split(".").filter(Boolean) };
}

/**
 * The lines in the composition's files for each circled element, at most `max` in all.
 * Returns [{ file: "index.html", line: 20, text: '<div id="ep" …>' }].
 */
export async function locate(root, entryRel, inside, max = 8) {
  const entryDir = path.join(root, ...path.dirname(entryRel).split("/").filter((s) => s && s !== "."));
  const targets = inside.map(parseDescription).filter(Boolean);
  if (!targets.length) return [];
  const files = await codeFiles(entryDir);
  const texts = new Map();
  for (const f of files) texts.set(f, (await readFile(f, "utf8").catch(() => "")).split("\n"));
  const found = [];
  const seen = new Set();
  const add = (file, i, line) => {
    const key = `${file}:${i}`;
    if (seen.has(key) || found.length >= max) return;
    seen.add(key);
    found.push({ file: path.relative(root, file).split(path.sep).join("/"), line: i + 1, text: line.trim().slice(0, 160) });
  };
  for (const t of targets) {
    // An id is unique, so its lines say exactly where; a class is only used when there's no id.
    const patterns = t.id
      ? [new RegExp(`id\\s*=\\s*["']${escapeRe(t.id)}["']`), new RegExp(`#${escapeRe(t.id)}(?![\\w-])`)]
      : t.classes.filter((c) => c !== "clip").slice(0, 1).flatMap((c) => [new RegExp(`class\\s*=\\s*["'][^"']*\\b${escapeRe(c)}\\b`), new RegExp(`\\.${escapeRe(c)}(?![\\w-])`)]);
    for (const re of patterns)
      for (const [file, lines] of texts)
        lines.forEach((line, i) => {
          if (re.test(line)) add(file, i, line);
        });
  }
  return found;
}
