#!/usr/bin/env node
// Final Phase Lite: a small window for the videos Claude Code edits. See what Claude is doing, watch the video
// without rendering it, pause anywhere and tell Claude what to change there.
//
//   node server.mjs [project folder] [--port 4848] [--no-open]
//
// It only listens on this computer (127.0.0.1) and only serves files from the project folder.
import http from "node:http";
import { createReadStream, realpathSync, watch } from "node:fs";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { summarize } from "./lib/transcript.mjs";
import {
  scanProject, compositionInfo, pinnedHyperframes, safeJoin, HIDDEN_WORK, VIDEO_EXT,
} from "./lib/project.mjs";
import * as claude from "./lib/agents/claude.mjs";
import * as oc from "./lib/agents/opencode.mjs";
import * as ollama from "./lib/agents/ollama.mjs";
import { buildMessage, loadNotes, saveNotes, savePicture, snapshotFrame, NOTES_DIR } from "./lib/notes.mjs";
import { locate } from "./lib/locate.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const NAME = "Final Phase Lite";
const VERSION = "0.1.0";

// ---- arguments ----
const argv = process.argv.slice(2);
const optIndex = argv.indexOf("--port");
const positional = argv.filter((a, i) => !a.startsWith("--") && (optIndex < 0 || i !== optIndex + 1));
// The folder's real path (no symlinks), as Claude Code and OpenCode record it.
const ROOT = (() => {
  const p = path.resolve(positional[0] ?? process.cwd());
  try {
    return realpathSync(p);
  } catch {
    return p;
  }
})();
const START_PORT = Number(optIndex >= 0 ? argv[optIndex + 1] : process.env.LITE_PORT ?? 4848) || 4848;
const OPEN_BROWSER = !argv.includes("--no-open");
const TOKEN = randomBytes(18).toString("hex");

try {
  if (!(await stat(ROOT)).isDirectory()) throw new Error();
} catch {
  console.error(`That folder doesn't exist: ${ROOT}`);
  process.exit(1);
}

// ---- live updates to the window (server-sent events) ----
const clients = new Set();
function broadcast(type, data) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}
setInterval(() => {
  for (const res of clients) res.write(": still here\n\n");
}, 20000).unref();

// ---- the project: compositions and videos ----
let project = { entries: [], entryInfo: {}, videos: [], hfVersion: null };
let scanTimer = null;
async function rescan() {
  const { entries, videos } = await scanProject(ROOT);
  const entryInfo = {};
  for (const e of entries) entryInfo[e] = await compositionInfo(path.join(ROOT, ...e.split("/")));
  // A video still being written (a render in progress) shows up once it has stopped growing.
  const now = Date.now();
  const settled = videos.filter((v) => now - v.mtime > 2500);
  if (settled.length < videos.length) {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => void rescan().then(() => broadcast("project", projectPayload())), 3000);
  }
  const hfVersion = entries[0] ? await pinnedHyperframes(path.join(ROOT, ...path.dirname(entries[0]).split("/").filter((s) => s !== "."))) : null;
  project = { entries, entryInfo, videos: settled, hfVersion };
  return project;
}
const projectPayload = () => ({ entries: project.entries, entryInfo: project.entryInfo, videos: project.videos });

// Whatever Claude saves shows up at once: the window reloads the live preview, and new renders appear.
let changed = new Set();
let changeTimer = null;
try {
  watch(ROOT, { recursive: true }, (_ev, file) => {
    if (!file) return;
    const rel = String(file).split(path.sep).join("/");
    if (HIDDEN_WORK.test(rel) || /(^|\/)renders?\/.*\.(png|jpe?g)$/i.test(rel)) return;
    changed.add(rel);
    clearTimeout(changeTimer);
    changeTimer = setTimeout(flushChanges, 600);
  });
} catch (e) {
  console.warn(`Couldn't watch the folder for changes (${e.message}). Use the reload button in the window.`);
}
async function flushChanges() {
  const files = [...changed];
  changed = new Set();
  if (files.some((f) => VIDEO_EXT.test(f) || f.endsWith("index.html"))) {
    await rescan();
    broadcast("project", projectPayload());
  }
  const code = files.filter((f) => !VIDEO_EXT.test(f));
  if (code.length) broadcast("files", { changed: code.slice(0, 40), at: Date.now() });
}

// ---- the AI session being watched: Claude Code or OpenCode ----
const AGENTS = { claude, opencode: oc };
const BIN = { claude: claude.findClaude(), opencode: oc.findOpenCode() };
const MAX_EVENTS = 1500;
const follow = { agent: null, id: null, follower: null, events: [], lastTs: null, title: "", model: null, pinned: false };

function takeEvents(evs) {
  const kept = [];
  for (const e of evs) {
    if (e.ts && (!follow.lastTs || e.ts > follow.lastTs)) follow.lastTs = e.ts;
    if (e.kind === "title") follow.title = e.text;
    if (e.kind !== "tick") kept.push(e);
  }
  if (kept.length) {
    follow.events.push(...kept);
    if (follow.events.length > MAX_EVENTS) follow.events.splice(0, follow.events.length - MAX_EVENTS);
  }
  return kept;
}

async function followSession(s, pinned = false) {
  Object.assign(follow, { agent: s?.agent ?? null, id: s?.id ?? null, follower: null, events: [], lastTs: null, title: s?.title ?? "", model: s?.model ?? null, pinned });
  if (s?.id) {
    const id = s.id;
    follow.follower = s.agent === "opencode" ? new oc.Follower(id) : new claude.Follower(ROOT, id);
    if (s.agent === "opencode" && !follow.model) follow.model = oc.sessionModel(id);
    const evs = await follow.follower.poll();
    if (follow.id === id) takeEvents(evs);
  }
  broadcast("session", sessionPayload());
}
const sessionPayload = () => ({
  agent: follow.agent, id: follow.id, title: follow.title, model: follow.model, pinned: follow.pinned, events: follow.events.slice(-600), lastTs: follow.lastTs,
});

async function tick() {
  if (!follow.follower) return;
  const id = follow.id;
  const before = follow.lastTs;
  const evs = await follow.follower.poll();
  if (id !== follow.id) return;
  const fresh = takeEvents(evs);
  if (fresh.length || follow.lastTs !== before) broadcast("events", { id, events: fresh, lastTs: follow.lastTs, title: follow.title });
  if (fresh.some((e) => e.kind === "turn-end")) void maybeSend();
}

/** Both AIs' sessions in this folder, newest first. */
async function listAllSessions(limit = 12) {
  const all = [...(await claude.listSessions(ROOT, limit)), ...oc.listSessions(ROOT, limit)];
  return all.sort((a, b) => b.mtime - a.mtime).slice(0, limit);
}
const keyOf = (s) => (s ? `${s.agent}:${s.id}` : null);
let lastNewest = null;
async function watchSessions() {
  // A new session in this folder (you started one in the terminal): watch it, unless you picked one yourself.
  const [newest] = await listAllSessions(1);
  if (newest && keyOf(newest) !== lastNewest) {
    const first = lastNewest === null;
    lastNewest = keyOf(newest);
    if (!follow.pinned && newest.id !== follow.id && (first || !run.active)) await followSession(newest);
    broadcast("sessions", await listAllSessions());
  }
}

// ---- which AI and model new messages use ----
const SETTINGS_FILE = path.join(ROOT, NOTES_DIR, "settings.json");
const settings = { agent: BIN.claude ? "claude" : BIN.opencode ? "opencode" : "claude", model: null };
try {
  const saved = JSON.parse(await readFile(SETTINGS_FILE, "utf8"));
  if (BIN[saved.agent]) settings.agent = saved.agent;
  if (typeof saved.model === "string") settings.model = saved.model;
} catch {}
let models = [];
// Ollama's models, handed to OpenCode for each run when OpenCode isn't set up for Ollama itself.
let ocEnv = {};
let localWarning = null;
if (BIN.opencode) {
  void (async () => {
    let list = await oc.listModels(BIN.opencode, ROOT);
    if (!list.some((m) => m.local)) {
      const pulled = await ollama.listModels();
      if (pulled?.length) {
        ocEnv = { OPENCODE_CONFIG_CONTENT: ollama.openCodeConfig(pulled) };
        list = await oc.listModels(BIN.opencode, ROOT, ocEnv);
      }
    }
    return list;
  })().then((list) => {
    models = list;
    if (!settings.model || !list.some((m) => m.id === settings.model)) {
      const last = oc.lastUsedModel();
      settings.model = (list.find((m) => m.id === last) ?? list.find((m) => m.free) ?? list[0])?.id ?? null;
    }
    broadcast("settings", settingsPayload());
  });
}
const settingsPayload = () => ({ ...settings, models, localWarning, agents: { claude: !!BIN.claude, opencode: !!BIN.opencode } });

/** After a local model has run: is Ollama giving it enough memory for OpenCode's instructions? */
async function checkLocalContext(model) {
  if (!model?.startsWith("ollama/")) return;
  const ctx = await ollama.loadedContext(model);
  const next = ctx && ctx < ollama.MIN_CONTEXT ? { model, context: ctx } : null;
  if (JSON.stringify(next) !== JSON.stringify(localWarning)) {
    localWarning = next;
    broadcast("settings", settingsPayload());
  }
}
const saveSettings = () => mkdir(path.dirname(SETTINGS_FILE), { recursive: true }).then(() => writeFile(SETTINGS_FILE, JSON.stringify({ agent: settings.agent, model: settings.model }))).catch(() => {});

// ---- sending notes ----
let notes = await loadNotes(ROOT);
for (const n of notes) if (n.status === "preparing" || n.status === "queued" || n.status === "sent") n.status = n.status === "sent" ? "unknown" : "queued";
const run = { active: null, last: null, limit: null };
const runPayload = () => ({
  active: run.active ? { agent: run.active.agent, sessionId: run.active.sessionId, startedAt: run.active.startedAt, noteIds: run.active.noteIds } : null,
  last: run.last,
  limit: run.limit,
  claude: !!BIN.claude || !!BIN.opencode,
});
const notesChanged = () => {
  void saveNotes(ROOT, notes).catch(() => {});
  broadcast("notes", notes);
};

function terminalBusy() {
  if (run.active || !follow.id) return false;
  const s = summarize(follow.events);
  // A session that went quiet for 15 minutes in the middle of a turn was most likely closed.
  return s.working && s.quietFor != null && s.quietFor < 15 * 60 * 1000;
}

let forceNext = false;
async function maybeSend() {
  if (run.active) return;
  const ready = notes.filter((n) => n.status === "queued");
  if (!ready.length) return;
  // A session goes on with the AI it started with; a new chat uses the one picked in the window.
  const agent = follow.id ? follow.agent : settings.agent;
  const bin = BIN[agent];
  if (!bin) {
    for (const n of ready) Object.assign(n, { status: "failed", error: `${AGENTS[agent]?.NAME ?? "That AI"} isn't installed on this computer (or isn't on the PATH).` });
    return notesChanged();
  }
  if (terminalBusy() && !forceNext) {
    broadcast("waiting", { reason: "terminal" });
    return;
  }
  forceNext = false;
  const resumeId = follow.id;
  // Sessions this window started are continued as they are; one from the terminal is continued as a copy.
  const own = new Set(notes.map((n) => n.sessionId).filter(Boolean));
  const fork = !!resumeId && !own.has(resumeId);
  const model = agent === "opencode" ? settings.model || follow.model : null;
  const prompt = buildMessage(ready);
  for (const n of ready) Object.assign(n, { status: "sent", sentAt: Date.now(), error: undefined, agent, model: model ?? undefined });
  const opts = {
    bin,
    cwd: ROOT,
    prompt,
    resumeId,
    fork,
    onSession: (id) => {
      if (!run.active) return;
      run.active.sessionId = id;
      for (const n of ready) n.sessionId = id;
      if (id !== follow.id) void followSession({ agent, id, model }, false);
      else broadcast("run", runPayload());
    },
    onLimit: (limit) => {
      run.limit = { ...limit, at: Date.now() };
      broadcast("run", runPayload());
    },
  };
  const lean = agent === "opencode" && !!models.find((m) => m.id === model)?.local;
  const r = agent === "opencode" ? oc.run({ ...opts, model, lean, extraEnv: ocEnv, title: ready[0].text.replace(/\s+/g, " ").slice(0, 60) }) : claude.run(opts);
  run.active = { agent, stop: r.stop, sessionId: resumeId, startedAt: Date.now(), noteIds: ready.map((n) => n.id) };
  run.last = null;
  broadcast("run", runPayload());
  notesChanged();
  const res = await r.done;
  for (const n of ready) Object.assign(n, { status: res.ok ? "done" : "failed", error: res.ok ? undefined : res.error, sessionId: res.sessionId ?? n.sessionId });
  // What it cost, kept on the last note of the batch.
  if (res.usage) ready[ready.length - 1].usage = { ...res.usage, agent, model: model ?? undefined, notes: ready.length };
  run.last = { ok: res.ok, error: res.error, at: Date.now() };
  run.active = null;
  if (lean) void checkLocalContext(model);
  await tick();
  // The run is over, so the turn is too, even if the log didn't say so.
  if (follow.id && follow.id === res.sessionId && summarize(follow.events).working) {
    const end = takeEvents([{ kind: "turn-end", ts: Date.now(), ok: res.ok }]);
    broadcast("events", { id: follow.id, events: end, lastTs: follow.lastTs, title: follow.title });
  }
  broadcast("run", runPayload());
  notesChanged();
  void maybeSend();
}

async function addNote(body) {
  const text = String(body.text ?? "").trim().slice(0, 4000);
  if (!text) return { error: "Write what should change." };
  const time = Number.isFinite(body.time) ? Math.max(0, body.time) : null;
  const source = typeof body.source === "string" ? body.source.slice(0, 300) : null;
  const entry = typeof body.entry === "string" ? body.entry.slice(0, 300) : null;
  const id = `n${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
  const note = { id, text, time, source, entry, createdAt: Date.now(), status: "preparing" };
  // What you circled: the box in the video's pixels, the strokes (to show them again), and on a live preview the
  // composition's elements inside it.
  const r = body.region;
  if (time != null && r && [r.x, r.y, r.w, r.h, r.fw, r.fh].every((v) => Number.isFinite(v))) {
    note.region = { x: r.x, y: r.y, w: r.w, h: r.h, fw: r.fw, fh: r.fh };
    if (Array.isArray(body.marks)) {
      note.marks = body.marks
        .slice(0, 12)
        .map((st) => (Array.isArray(st) ? st.slice(0, 600).filter((p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1])).map(([x, y]) => [x, y]) : []))
        .filter((st) => st.length > 1);
    }
    if (Array.isArray(body.inside)) note.inside = body.inside.filter((x) => typeof x === "string").slice(0, 8).map((x) => x.slice(0, 160));
    // And the exact lines in the code for what's inside, read now, before anything changes.
    if (note.inside?.length && source === "live" && entry && project.entries.includes(entry)) note.code = await locate(ROOT, entry, note.inside).catch(() => []);
  }
  notes.push(note);
  notesChanged();
  // The picture is taken now, before the AI changes anything, so it's what you saw. The window sends it when there's
  // a circle drawn on it (or for a video file); otherwise HyperFrames takes it here.
  if (time != null && body.picture) note.picture = await savePicture(ROOT, id, body.picture);
  if (time != null && !note.picture && source === "live" && entry) note.picture = await snapshotFrame(ROOT, entry, time, id, project.hfVersion);
  note.status = "queued";
  notesChanged();
  void maybeSend();
  return { note };
}

// ---- web server ----
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".m4v": "video/mp4",
  ".mov": "video/quicktime", ".webm": "video/webm", ".wav": "audio/wav", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".aac": "audio/aac",
  ".ogg": "audio/ogg", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".otf": "font/otf", ".txt": "text/plain; charset=utf-8",
  ".vtt": "text/vtt; charset=utf-8", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json", ".wasm": "application/wasm",
};
const typeOf = (f) => TYPES[path.extname(f).toLowerCase()] ?? "application/octet-stream";

let PORT = START_PORT;
const ORIGINS = () => [`http://127.0.0.1:${PORT}`, `http://localhost:${PORT}`];

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "content-type": type, "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readBody(req, limit = 12_000_000) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw new Error("too big");
    chunks.push(c);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function serveFile(req, res, file, { live = false } = {}) {
  const s = await stat(file).catch(() => null);
  if (!s || !s.isFile()) return send(res, 404, "Not found", "text/plain");
  const type = typeOf(file);
  if (live && type.startsWith("text/html")) {
    // As HyperFrames does: its runtime first, before the composition's own scripts register their timelines.
    const html = await readFile(file, "utf8");
    const tag = `<script src="/_lite/runtime.js"></script>`;
    const body = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (h) => h + tag) : tag + html;
    return send(res, 200, body, type);
  }
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range ?? "");
  const headers = { "content-type": type, "accept-ranges": "bytes", "cache-control": "no-cache", "x-content-type-options": "nosniff" };
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : Math.max(0, s.size - Number(range[2]));
    let end = range[1] && range[2] ? Number(range[2]) : s.size - 1;
    end = Math.min(end, s.size - 1);
    if (start > end || start >= s.size) {
      res.writeHead(416, { "content-range": `bytes */${s.size}` });
      return res.end();
    }
    res.writeHead(206, { ...headers, "content-range": `bytes ${start}-${end}/${s.size}`, "content-length": end - start + 1 });
    if (req.method === "HEAD") return res.end();
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, "content-length": s.size });
  if (req.method === "HEAD") return res.end();
  createReadStream(file).pipe(res);
}

async function handle(req, res) {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  // Only this computer's own address: stops other web pages from reaching it through a look-alike domain.
  const host = String(req.headers.host ?? "");
  if (host !== `127.0.0.1:${PORT}` && host !== `localhost:${PORT}`) return send(res, 403, "Forbidden", "text/plain");
  const p = url.pathname;

  if (p === "/ping") return send(res, 200, { name: NAME, root: ROOT });
  if (p === "/" || p === "/index.html") {
    const html = (await readFile(path.join(HERE, "public", "index.html"), "utf8")).replaceAll("%%TOKEN%%", TOKEN).replaceAll("%%NAME%%", NAME);
    return send(res, 200, html, "text/html; charset=utf-8");
  }
  if (["/app.js", "/style.css", "/moon.svg"].includes(p)) return serveFile(req, res, path.join(HERE, "public", p.slice(1)));
  // The window reads Claude's status with the same code the server uses.
  if (p === "/lib/transcript.mjs") return serveFile(req, res, path.join(HERE, "lib", "transcript.mjs"));
  if (p === "/_lite/runtime.js") return serveFile(req, res, path.join(HERE, "vendor", "hyperframes", "hyperframe.runtime.iife.js"));
  if (p.startsWith("/p/")) {
    let rel;
    try {
      rel = decodeURIComponent(p.slice(3));
    } catch {
      return send(res, 400, "Bad path", "text/plain");
    }
    const file = safeJoin(ROOT, rel);
    if (!file) return send(res, 403, "Forbidden", "text/plain");
    return serveFile(req, res, file, { live: url.searchParams.get("live") === "1" });
  }

  if (!p.startsWith("/api/")) return send(res, 404, "Not found", "text/plain");
  // Everything below needs the key this window was given, so no other web page can send Claude anything.
  if ((req.headers["x-lite-token"] ?? url.searchParams.get("t")) !== TOKEN) return send(res, 403, { error: "Open the window from the address the tool printed." });
  if (req.method === "POST" && req.headers.origin && !ORIGINS().includes(req.headers.origin)) return send(res, 403, { error: "Wrong origin." });

  if (p === "/api/events") {
    res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-store", connection: "keep-alive" });
    res.write("retry: 1500\n\n");
    clients.add(res);
    req.on("close", () => clients.delete(res));
    return;
  }
  if (p === "/api/state") {
    return send(res, 200, {
      name: NAME, version: VERSION, root: ROOT, folder: path.basename(ROOT), ...projectPayload(), sessions: await listAllSessions(),
      session: sessionPayload(), run: runPayload(), notes, settings: settingsPayload(),
    });
  }
  if (req.method !== "POST") return send(res, 405, { error: "Use POST." });
  const body = await readBody(req).catch(() => null);
  if (!body) return send(res, 400, { error: "That message couldn't be read." });

  if (p === "/api/note") return send(res, 200, await addNote(body));
  if (p === "/api/frame") {
    // The exact frame of a live preview, taken ahead of time while you circle and type.
    const time = Number(body.time);
    if (!project.entries.includes(body.entry) || !Number.isFinite(time)) return send(res, 400, { error: "No such frame." });
    const id = `f${Date.now().toString(36)}${randomBytes(2).toString("hex")}`;
    return send(res, 200, { picture: await snapshotFrame(ROOT, body.entry, Math.max(0, time), id, project.hfVersion) });
  }
  if (p === "/api/stop") {
    run.active?.stop();
    return send(res, 200, { ok: true });
  }
  if (p === "/api/send-now") {
    forceNext = true;
    void maybeSend();
    return send(res, 200, { ok: true });
  }
  if (p === "/api/cancel") {
    const n = notes.find((x) => x.id === body.id && (x.status === "queued" || x.status === "failed"));
    if (n) {
      notes = notes.filter((x) => x !== n);
      notesChanged();
    }
    return send(res, 200, { ok: !!n });
  }
  if (p === "/api/follow") {
    if (body.id === "auto") {
      const [newest] = await listAllSessions(1);
      await followSession(newest ?? null, false);
    } else if (body.id) {
      const s = (await listAllSessions(60)).find((x) => x.id === body.id && (!body.agent || x.agent === body.agent));
      if (!s) return send(res, 404, { error: "That session isn't in this folder." });
      await followSession(s, true);
    } else await followSession(null, true); // a new chat: the next message starts a new session
    return send(res, 200, { ok: true });
  }
  if (p === "/api/settings") {
    if (body.agent && BIN[body.agent]) settings.agent = body.agent;
    if (typeof body.model === "string" && models.some((m) => m.id === body.model)) settings.model = body.model;
    void saveSettings();
    broadcast("settings", settingsPayload());
    return send(res, 200, { ok: true });
  }
  return send(res, 404, { error: "Unknown." });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch((e) => {
    console.error(e);
    if (!res.headersSent) send(res, 500, { error: "Something went wrong." });
    else res.end();
  });
});

function listen(port) {
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", () => {
      server.off("error", reject);
      resolve(port);
    });
  });
}

// Already open for this folder? Then just show that window.
async function existing() {
  try {
    const info = JSON.parse(await readFile(path.join(ROOT, NOTES_DIR, "server.json"), "utf8"));
    const r = await fetch(`http://127.0.0.1:${info.port}/ping`, { signal: AbortSignal.timeout(800) });
    const j = await r.json();
    return j.root === ROOT ? info.port : null;
  } catch {
    return null;
  }
}

function openBrowser(url) {
  if (!OPEN_BROWSER) return;
  const [cmd, args] =
    process.platform === "darwin" ? ["open", [url]] : process.platform === "win32" ? ["cmd", ["/c", "start", "", url]] : ["xdg-open", [url]];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true, windowsHide: true }).unref();
  } catch {}
}

const already = await existing();
if (already) {
  const url = `http://127.0.0.1:${already}/`;
  console.log(`${NAME} is already open for this folder: ${url}`);
  openBrowser(url);
  process.exit(0);
}

await rescan();
for (let i = 0; i < 20; i++) {
  try {
    PORT = await listen(START_PORT + i);
    break;
  } catch (e) {
    if (e.code !== "EADDRINUSE" || i === 19) {
      console.error(`Couldn't open a port: ${e.message}`);
      process.exit(1);
    }
  }
}
await mkdir(path.join(ROOT, NOTES_DIR), { recursive: true });
await writeFile(path.join(ROOT, NOTES_DIR, ".gitignore"), "*\n").catch(() => {});
await writeFile(path.join(ROOT, NOTES_DIR, "server.json"), JSON.stringify({ port: PORT, pid: process.pid })).catch(() => {});

await watchSessions();
setInterval(() => void tick().catch(() => {}), 700).unref?.();
setInterval(() => void watchSessions().catch(() => {}), 2500).unref?.();
// Keep the process alive while the server runs.
setInterval(() => {}, 1 << 30);

const url = `http://127.0.0.1:${PORT}/`;
console.log(`${NAME} is open: ${url}`);
console.log(`Project: ${ROOT}`);
console.log(`AI: ${[BIN.claude && "Claude Code", BIN.opencode && "OpenCode"].filter(Boolean).join(" and ") || "none found (the window plays videos, but notes can't be sent)"}`);
openBrowser(url);

const shutdown = () => {
  run.active?.stop();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
