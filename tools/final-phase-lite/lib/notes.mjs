// Your notes: what you typed, the moment you paused on, and a picture of that exact frame. They're kept in
// <project>/.final-phase-lite/ so they survive closing the window.
import { spawn } from "node:child_process";
import { mkdir, readFile, rename, writeFile, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { LITE_MARK } from "./transcript.mjs";

export const NOTES_DIR = ".final-phase-lite";

export function clock(seconds) {
  if (seconds == null || !Number.isFinite(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}

/** The message Claude gets for one or more notes. */
export function buildMessage(notes, { viewing } = {}) {
  const lines = [LITE_MARK];
  const one = notes.length === 1;
  notes.forEach((n, i) => {
    const head = one ? "" : `${i + 1}. `;
    if (n.time != null) {
      const where = n.source === "live" ? `the live preview of ${n.entry}` : n.source;
      lines.push(`${head}At ${clock(n.time)} (${n.time.toFixed(2)} s) in ${where}, the user paused and wrote:`);
    } else lines.push(`${head}The user wrote:`);
    lines.push(n.text.trim());
    if (n.region) {
      const { x, y, w, h, fw, fh } = n.region;
      const cx = (x + w / 2) / fw;
      const cy = (y + h / 2) / fh;
      const where = `${cy < 0.33 ? "top" : cy > 0.66 ? "bottom" : "middle"} ${cx < 0.33 ? "left" : cx > 0.66 ? "right" : "centre"}`.replace("middle centre", "centre");
      lines.push(`They circled what they mean: x ${x} to ${x + w}, y ${y} to ${y + h} of the ${fw}x${fh} frame (${where}). "This" or "here" means what's in that circle.`);
      if (n.inside?.length) lines.push(`Inside the circle, in the composition: ${n.inside.join("; ")}.`);
      if (n.code?.length) lines.push("Where that is in the code (start there):", ...n.code.map((c) => `- ${c.file}:${c.line}  ${c.text}`));
    }
    if (n.picture) lines.push(`A picture of that exact frame${n.region ? ", with their circle drawn on it in orange," : ""}: ${n.picture} (look at it before changing anything).`);
    else if (n.time != null && n.source === "live") lines.push(`(No picture came out. To see that moment, run: npx hyperframes snapshot --at ${n.time.toFixed(2)})`);
    if (!one) lines.push("");
  });
  lines.push(
    "",
    "The user is watching in Final Phase Lite. It plays the HyperFrames composition straight from its files and reloads by itself whenever you save, so don't render the video to check a change. Render only when the user asks for it." +
      (viewing ? ` (They're looking at: ${viewing}.)` : ""),
  );
  return lines.join("\n").replace(/\n{3,}/g, "\n\n");
}

export async function loadNotes(root) {
  try {
    return JSON.parse(await readFile(path.join(root, NOTES_DIR, "notes.json"), "utf8"));
  } catch {
    return [];
  }
}

export async function saveNotes(root, notes) {
  const dir = path.join(root, NOTES_DIR);
  await mkdir(dir, { recursive: true });
  // Keep the folder out of git without touching the project's own .gitignore.
  await writeFile(path.join(dir, ".gitignore"), "*\n").catch(() => {});
  await writeFile(path.join(dir, "notes.json"), JSON.stringify(notes.slice(-300), null, 1));
}

/** A picture the window took of a video file's frame (a data: URL), saved as a PNG. */
export async function savePicture(root, id, dataUrl) {
  const m = /^data:image\/(png|jpeg);base64,(.+)$/.exec(String(dataUrl ?? ""));
  if (!m) return null;
  const dir = path.join(root, NOTES_DIR, "frames");
  await mkdir(dir, { recursive: true });
  const name = `${id}.${m[1] === "jpeg" ? "jpg" : "png"}`;
  await writeFile(path.join(dir, name), Buffer.from(m[2], "base64"));
  return `${NOTES_DIR}/frames/${name}`;
}

/**
 * The exact frame of a HyperFrames composition, taken the way HyperFrames itself does (`hyperframes snapshot`), so
 * it's what the render will show. Takes a few seconds. Resolves to the picture's path in the project, or null.
 */
export async function snapshotFrame(root, entryRel, time, id, version) {
  const entryDir = path.join(root, ...path.dirname(entryRel).split("/").filter((s) => s !== "."));
  const tmp = path.join(root, NOTES_DIR, "frames", `tmp-${id}`);
  await mkdir(tmp, { recursive: true });
  const pkg = version ? `hyperframes@${version}` : "hyperframes";
  const args = ["--yes", pkg, "snapshot", entryDir, "--at", time.toFixed(3), "--no-end", "--keep", "-o", tmp];
  const ok = await new Promise((resolve) => {
    const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", args, { cwd: entryDir, stdio: "ignore", shell: process.platform === "win32", windowsHide: true });
    const timer = setTimeout(() => {
      child.kill();
      resolve(false);
    }, 120000);
    child.on("error", () => (clearTimeout(timer), resolve(false)));
    child.on("close", (code) => (clearTimeout(timer), resolve(code === 0)));
  });
  try {
    const png = (await readdir(tmp)).find((f) => f.endsWith(".png"));
    if (!ok || !png) return null;
    const dest = path.join(root, NOTES_DIR, "frames", `${id}.png`);
    await rename(path.join(tmp, png), dest);
    return `${NOTES_DIR}/frames/${id}.png`;
  } catch {
    return null;
  } finally {
    await rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
