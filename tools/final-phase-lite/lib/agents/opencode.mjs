// OpenCode: the open-source coding agent, with its free models (no account, $0) or any model you've connected.
// This file runs the `opencode` program you installed (`opencode run`), and reads the steps, tokens and cost of its
// sessions from the database OpenCode keeps on your computer (~/.local/share/opencode/opencode.db), read-only.
// That database is OpenCode's own and not documented: anything unexpected is skipped, so the window shows less, but
// nothing breaks.
import { spawn, execFileSync, execFile } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describeTool, LITE_MARK, liteNoteText } from "../transcript.mjs";

const WIN = process.platform === "win32";
export const NAME = "OpenCode";

// Node's built-in SQLite (Node 22.5 and newer). Without it, OpenCode still works from the window, but its steps
// only show once each answer is done.
let sqlite = null;
try {
  sqlite = await import("node:sqlite");
} catch {}
export const canWatch = () => !!sqlite;

export function findOpenCode() {
  if (process.env.LITE_OPENCODE_BIN) return process.env.LITE_OPENCODE_BIN;
  try {
    const out = execFileSync(WIN ? "where" : "which", ["opencode"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const first = out.split(/\r?\n/).find((l) => l.trim());
    if (first) return first.trim();
  } catch {}
  const home = os.homedir();
  const guesses = WIN
    ? [path.join(home, ".opencode", "bin", "opencode.exe"), path.join(process.env.APPDATA ?? "", "npm", "opencode.cmd")]
    : [path.join(home, ".opencode", "bin", "opencode"), "/opt/homebrew/bin/opencode", "/usr/local/bin/opencode"];
  return guesses.find((p) => existsSync(p)) ?? null;
}

const dataDir = () => path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "opencode");
let db = null;
function getDb() {
  if (db) return db;
  const file = path.join(dataDir(), "opencode.db");
  if (!sqlite || !existsSync(file)) return null;
  try {
    db = new sqlite.DatabaseSync(file, { readOnly: true });
    return db;
  } catch {
    return null;
  }
}
function query(sql, ...args) {
  const d = getDb();
  if (!d) return [];
  try {
    return d.prepare(sql).all(...args);
  } catch {
    // The database moved on under us (or changed shape): open it again next time.
    try {
      d.close();
    } catch {}
    db = null;
    return [];
  }
}
const json = (s) => {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
};

// ---- models ----

/** Every model OpenCode can use here, free ones first, with their price and whether they can see pictures. */
export function listModels(bin, cwd, extraEnv = {}) {
  return new Promise((resolve) => {
    // Run in the project folder, so models set up in its own opencode.json are listed too.
    execFile(bin, ["models", "--verbose"], { cwd, env: { ...process.env, ...extraEnv }, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 60000, shell: WIN && /\.(cmd|bat)$/i.test(bin) }, (err, out) => {
      if (err && !out) return resolve([]);
      const models = [];
      // "provider/model" on its own line, then that model's details as JSON.
      const re = /^([\w.-]+\/[^\s{}]+)\s*$/gm;
      const heads = [...String(out).matchAll(re)];
      heads.forEach((m, i) => {
        const body = String(out).slice(m.index + m[0].length, heads[i + 1]?.index ?? undefined);
        const d = json(body.trim()) ?? {};
        const c = d.cost ?? {};
        const free = (c.input ?? 0) === 0 && (c.output ?? 0) === 0;
        // A model running on this computer (Ollama, LM Studio...): free, private, and usually small.
        const local = /^(ollama|lmstudio|llamacpp|llama\.cpp|local)\//i.test(m[1]) || /\/\/(localhost|127\.0\.0\.1)[:/]/.test(d.api?.url ?? "");
        models.push({ id: m[1], name: d.name ?? m[1], free: free || local, local, input: c.input ?? null, output: c.output ?? null, image: !!d.capabilities?.input?.image, tools: d.capabilities?.toolcall !== false, context: d.limit?.context ?? null });
      });
      models.sort((a, b) => Number(b.local) - Number(a.local) || Number(b.free) - Number(a.free) || Number(b.image) - Number(a.image) || a.name.localeCompare(b.name));
      resolve(models.filter((m) => m.tools));
    });
  });
}

// ---- sessions ----

const modelOf = (s) => {
  const m = json(s);
  return m?.providerID && m?.id ? `${m.providerID}/${m.id}` : null;
};
const titleOf = (t) => (String(t ?? "").startsWith(LITE_MARK) ? "Notes from the window" : t || "An OpenCode session");

/** The sessions started in this folder, newest first (helpers' own sessions left out). */
export function listSessions(root, limit = 12) {
  return query(
    "select id, title, model, time_updated from session where directory = ? and parent_id is null and time_archived is null order by time_updated desc limit ?",
    root,
    limit,
  ).map((r) => ({ agent: "opencode", id: r.id, title: titleOf(r.title), mtime: Number(r.time_updated), model: modelOf(r.model) }));
}

/** The model used most recently in OpenCode, in any folder: a good first choice. */
export function lastUsedModel() {
  return modelOf(query("select model from session where model is not null order by time_updated desc limit 1")[0]?.model);
}

export function sessionModel(id) {
  return modelOf(query("select model from session where id = ?", id)[0]?.model);
}

// OpenCode names its tools in lower case and calls a file `filePath`.
const TOOL_NAMES = {
  bash: "Bash", read: "Read", edit: "Edit", multiedit: "Edit", patch: "Edit", write: "Write", grep: "Grep", glob: "Glob", list: "Glob",
  skill: "Skill", task: "Task", todowrite: "TodoWrite", webfetch: "WebFetch", websearch: "WebSearch",
};
function describe(tool, input = {}) {
  const name = TOOL_NAMES[tool] ?? tool;
  const i = { ...input, file_path: input.filePath ?? input.file_path ?? input.path, skill: input.name ?? input.skill };
  return { name, ...describeTool(name, i) };
}
const clip = (s, n) => {
  s = String(s ?? "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};

/**
 * One stored part of a message to the window's events. `seen` remembers what was already said about this part (a
 * step is shown when it starts and again when it ends). Exported for the tests.
 */
export function partEvents(row, role, seen) {
  const d = json(row.data);
  if (!d) return [];
  const out = [];
  const ts = Number(row.time_created);
  if (d.type === "text") {
    if (role === "user" && !d.synthetic && !seen.prompt && d.text?.trim()) {
      seen.prompt = true;
      // `opencode run` keeps the message in quotes.
      const text = d.text.trim().replace(/^"([\s\S]*)"$/, "$1");
      const fromLite = text.startsWith(LITE_MARK);
      out.push({ kind: "prompt", id: row.message_id, ts, text: clip(fromLite ? liteNoteText(text) : text, 2000), fromLite });
    } else if (role === "assistant" && !seen.text && d.time?.end && d.text?.trim()) {
      seen.text = true;
      out.push({ kind: "text", id: row.id, ts: d.time.end, text: d.text.trim() });
    }
  } else if (d.type === "reasoning" && !seen.thinking) {
    seen.thinking = true;
    out.push({ kind: "thinking", ts });
  } else if (d.type === "tool") {
    const st = d.state ?? {};
    const status = st.status;
    if (!seen.tool && status && status !== "pending") {
      seen.tool = true;
      const t = describe(d.tool, st.input ?? {});
      if (t.name === "TodoWrite" && Array.isArray(st.input?.todos)) {
        out.push({ kind: "todos", ts, todos: st.input.todos.map((x) => ({ text: clip(x.content, 120), status: x.status })) });
      }
      out.push({ kind: "tool", id: row.id, ts: Number(st.time?.start) || ts, name: t.name, background: false, type: t.kind, label: st.title && d.tool === "bash" && !st.input?.description ? st.title : t.label, detail: t.detail });
    }
    if (!seen.result && (status === "completed" || status === "error")) {
      seen.result = true;
      out.push({ kind: "result", id: row.id, ts: Number(st.time?.end) || Number(row.time_updated), ok: status === "completed", preview: clip(st.error ?? st.output, 300) });
    }
  } else if (d.type === "step-finish" && !seen.usage) {
    seen.usage = true;
    const t = d.tokens ?? {};
    const tokens = (t.input ?? 0) + (t.output ?? 0) + (t.reasoning ?? 0) + (t.cache?.read ?? 0) + (t.cache?.write ?? 0);
    out.push({ kind: "usage", id: row.id, ts: Number(row.time_updated), tokens, cost: typeof d.cost === "number" ? d.cost : null });
  }
  return out;
}

/** Reads one OpenCode session as it changes. */
export class Follower {
  constructor(id) {
    this.id = id;
    this.since = 0;
    this.msgSince = 0;
    this.roles = new Map();
    this.seen = new Map();
    this.ended = new Set();
  }
  async poll() {
    const events = [];
    const msgs = query("select id, data, time_updated from message where session_id = ? and time_updated >= ? order by time_created, id", this.id, this.msgSince);
    const ends = [];
    for (const m of msgs) {
      this.msgSince = Math.max(this.msgSince, Number(m.time_updated));
      const d = json(m.data);
      if (!d) continue;
      this.roles.set(m.id, d.role);
      // The answer's last message: it finished for a reason other than calling a tool.
      if (d.role === "assistant" && d.time?.completed && (d.error || (d.finish && d.finish !== "tool-calls")) && !this.ended.has(m.id)) {
        this.ended.add(m.id);
        ends.push({ kind: "turn-end", ts: Number(d.time.completed), ok: !d.error });
      }
    }
    const parts = query("select id, message_id, data, time_created, time_updated from part where session_id = ? and time_updated >= ? order by time_created, id", this.id, this.since);
    let last = 0;
    for (const p of parts) {
      this.since = Math.max(this.since, Number(p.time_updated));
      last = Math.max(last, Number(p.time_updated));
      if (!this.seen.has(p.id)) this.seen.set(p.id, {});
      events.push(...partEvents(p, this.roles.get(p.message_id), this.seen.get(p.id)));
    }
    if (last) events.push({ kind: "tick", ts: last });
    return [...events, ...ends];
  }
}

// ---- running a message ----

/**
 * `lean`: for a small model on this computer. OpenCode normally lists every skill installed (Claude Code's too) in its
 * instructions, which can be 20,000+ tokens, more than a local model's memory; lean leaves those out.
 */
export function run({ bin, cwd, prompt, resumeId, fork = false, model, title, lean = false, extraEnv = {}, onSession }) {
  const args = ["run", "--format", "json", "--dir", cwd, "--auto"];
  if (model) args.push("-m", model);
  if (resumeId) args.push("--session", resumeId);
  if (resumeId && fork) args.push("--fork");
  if (!resumeId && title) args.push("--title", title);
  args.push(prompt);
  const env = { ...process.env, ...extraEnv, NO_COLOR: "1" };
  if (lean) Object.assign(env, { OPENCODE_DISABLE_EXTERNAL_SKILLS: "1", OPENCODE_DISABLE_CLAUDE_CODE_SKILLS: "1" });
  const child = spawn(bin, args, { cwd, stdio: ["ignore", "pipe", "pipe"], shell: WIN && /\.(cmd|bat)$/i.test(bin), windowsHide: true, env });
  let sessionId = null;
  let carry = "";
  let stderr = "";
  let error = null;
  const usage = { tokens: 0, cost: 0, apiPrice: false };
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    const lines = (carry + chunk).split("\n");
    carry = lines.pop() ?? "";
    for (const line of lines) {
      const e = json(line);
      if (!e) continue;
      if (e.sessionID && e.sessionID !== sessionId) {
        sessionId = e.sessionID;
        onSession?.(sessionId);
      }
      if (e.type === "step_finish" && e.part) {
        const t = e.part.tokens ?? {};
        usage.tokens += (t.input ?? 0) + (t.output ?? 0) + (t.reasoning ?? 0) + (t.cache?.read ?? 0) + (t.cache?.write ?? 0);
        if (typeof e.part.cost === "number") usage.cost += e.part.cost;
      }
      if (e.type === "error") error = e.error?.data?.message ?? e.error?.message ?? e.message ?? "OpenCode stopped with an error.";
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (c) => (stderr = (stderr + c).slice(-4000)));

  let stopped = false;
  const done = new Promise((resolve) => {
    child.on("error", (err) => resolve({ ok: false, sessionId, error: `Couldn't start OpenCode: ${err.message}` }));
    child.on("close", (code) => {
      if (stopped) return resolve({ ok: false, sessionId, usage, error: "Stopped." });
      if (code === 0 && !error) return resolve({ ok: true, sessionId, usage });
      const msg = error ?? (stderr.trim().split("\n").slice(-3).join(" ").slice(0, 400) || `OpenCode ended unexpectedly (code ${code}).`);
      resolve({ ok: false, sessionId, usage, error: String(msg) });
    });
  });
  function stop() {
    if (child.exitCode !== null) return;
    stopped = true;
    if (WIN) {
      try {
        execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
      } catch {}
    } else child.kill("SIGINT");
    setTimeout(() => child.exitCode === null && child.kill("SIGKILL"), 4000).unref();
  }
  return { done, stop };
}
