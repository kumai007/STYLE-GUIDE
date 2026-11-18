// Claude Code: the `claude` program you installed and signed in to yourself, run in your project folder on your own
// subscription. This file never reads or stores your login. It starts the program, gives it your message, reads what
// it prints, and reads the session logs Claude Code keeps in ~/.claude/projects to show its steps.
import { spawn, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { open, readdir, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseLine, LITE_MARK, liteNoteText } from "../transcript.mjs";

const WIN = process.platform === "win32";
export const NAME = "Claude Code";

export const claudeHome = () => process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude");

/** Claude Code keeps a folder's sessions in ~/.claude/projects/<the path with every other character as "-">. */
export function encodeProjectDir(root) {
  return root.replace(/[^a-zA-Z0-9]/g, "-");
}
const sessionFile = (root, id) => path.join(claudeHome(), "projects", encodeProjectDir(root), `${id}.jsonl`);

/** Where `claude` is: on the PATH, or in the places its installer puts it. */
export function findClaude() {
  if (process.env.LITE_CLAUDE_BIN) return process.env.LITE_CLAUDE_BIN;
  try {
    const out = execFileSync(WIN ? "where" : "which", ["claude"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    const first = out.split(/\r?\n/).find((l) => l.trim());
    if (first) return first.trim();
  } catch {}
  const home = os.homedir();
  const guesses = WIN
    ? [path.join(home, ".local", "bin", "claude.exe"), path.join(process.env.APPDATA ?? "", "npm", "claude.cmd")]
    : [path.join(home, ".local", "bin", "claude"), path.join(home, ".claude", "local", "claude"), "/opt/homebrew/bin/claude", "/usr/local/bin/claude"];
  return guesses.find((p) => existsSync(p)) ?? null;
}

// Nobody is there to answer a permission question while it works from the window, so these are allowed and anything
// else is refused (Claude says so in its reply). Your own allow and deny rules in settings still apply.
export const ALLOWED_TOOLS = ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Skill"];

/**
 * `fork`: continue a session you started in the terminal as a copy, with everything said so far, so the terminal's
 * own conversation is left as it was.
 */
export function claudeArgs(resumeId, fork = false) {
  const args = ["-p", "--output-format", "stream-json", "--verbose", "--permission-mode", "dontAsk", "--allowedTools", ...ALLOWED_TOOLS];
  if (resumeId) args.push("--resume", resumeId);
  if (resumeId && fork) args.push("--fork-session");
  return args;
}

/** How much of your plan's limit is used, from the line Claude Code prints about it (not documented, so optional). */
export function readLimit(e) {
  const r = e?.rate_limit_info;
  if (!r) return null;
  // Each limit (5-hour, weekly…) has its own share used; show the fullest one.
  let pick = null;
  for (const [name, w] of Object.entries(r.unifiedWindows ?? {})) {
    if (typeof w?.utilization === "number" && (!pick || w.utilization > pick.utilization)) pick = { name, ...w };
  }
  let used = typeof r.utilization === "number" ? r.utilization : pick?.utilization ?? null;
  if (used != null && used <= 1) used *= 100;
  const at = pick?.resetsAt ?? r.resetsAt;
  const resets = typeof at === "number" ? (at < 1e12 ? at * 1000 : at) : at ? Date.parse(at) : null;
  return { window: pick?.name ?? r.rateLimitType ?? null, used: used == null ? null : Math.round(used), resetsAt: resets || null, status: pick?.status ?? r.status ?? null };
}

/**
 * Runs one message. Calls `onSession(id)` as soon as Claude Code says which session it is and `onLimit(limit)` when
 * it reports your plan's limit. Resolves when it ends with { ok, sessionId, error, usage }.
 */
export function run({ bin, cwd, prompt, resumeId, fork = false, onSession, onLimit }) {
  const child = spawn(bin, claudeArgs(resumeId, fork), {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
    shell: WIN && /\.(cmd|bat)$/i.test(bin),
    windowsHide: true,
    env: { ...process.env, FORCE_COLOR: "0" },
  });
  let sessionId = resumeId ?? null;
  let carry = "";
  let stderr = "";
  let result = null;
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    const parts = (carry + chunk).split("\n");
    carry = parts.pop() ?? "";
    for (const line of parts) {
      let e;
      try {
        e = JSON.parse(line);
      } catch {
        continue;
      }
      if (e.type === "system" && e.subtype === "init" && e.session_id) {
        sessionId = e.session_id;
        onSession?.(sessionId);
      }
      if (e.type === "rate_limit_event") {
        const l = readLimit(e);
        if (l) onLimit?.(l);
      }
      if (e.type === "result") {
        const u = e.usage ?? {};
        result = {
          ok: e.subtype === "success" && !e.is_error,
          text: e.result,
          sessionId: e.session_id ?? sessionId,
          usage: {
            tokens: (u.input_tokens ?? 0) + (u.output_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0),
            // What it would cost at API prices. On a Claude plan it's included in the subscription.
            cost: typeof e.total_cost_usd === "number" ? e.total_cost_usd : null,
            apiPrice: true,
          },
        };
      }
    }
  });
  child.stderr.setEncoding("utf8");
  child.stderr.on("data", (c) => (stderr = (stderr + c).slice(-4000)));
  child.stdin.on("error", () => {});
  child.stdin.end(prompt);

  let stopped = false;
  const done = new Promise((resolve) => {
    child.on("error", (err) => resolve({ ok: false, sessionId, error: `Couldn't start Claude Code: ${err.message}` }));
    child.on("close", (code) => {
      if (result) return resolve({ ok: result.ok, sessionId: result.sessionId, usage: result.usage, error: result.ok ? undefined : String(result.text ?? "Claude stopped with an error.") });
      if (stopped) return resolve({ ok: false, sessionId, error: "Stopped." });
      const msg = stderr.trim().split("\n").slice(-3).join(" ").slice(0, 400);
      resolve({ ok: false, sessionId, error: msg || `Claude Code ended unexpectedly (code ${code}).` });
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

// ---- session logs ----

async function readSlice(file, start, length) {
  const fh = await open(file, "r");
  try {
    const buf = Buffer.alloc(length);
    const { bytesRead } = await fh.read(buf, 0, length, start);
    return buf.subarray(0, bytesRead).toString("utf8");
  } finally {
    await fh.close();
  }
}

/** A name for a session: Claude Code's own title for it, or the first thing you asked. */
async function sessionTitle(file, size) {
  try {
    const tail = await readSlice(file, Math.max(0, size - 400000), Math.min(size, 400000));
    const titles = [...tail.matchAll(/"type":"ai-title","aiTitle":"((?:[^"\\]|\\.)*)"/g)];
    if (titles.length) return JSON.parse(`"${titles[titles.length - 1][1]}"`);
    const head = await readSlice(file, 0, Math.min(size, 400000));
    for (const line of head.split("\n")) {
      if (!line.includes('"type":"user"')) continue;
      try {
        const e = JSON.parse(line);
        const c = e.message?.content;
        const t = typeof c === "string" ? c : Array.isArray(c) ? c.find((b) => b?.type === "text")?.text : "";
        if (t && t.startsWith(LITE_MARK)) return liteNoteText(t).slice(0, 70);
        if (t && !t.trim().startsWith("<") && !e.isMeta) return t.replace(/\s+/g, " ").trim().slice(0, 70);
      } catch {}
    }
  } catch {}
  return "A session";
}

/** The sessions started in this folder, newest first. */
export async function listSessions(root, limit = 12) {
  const dir = path.join(claudeHome(), "projects", encodeProjectDir(root));
  const files = [];
  for (const name of await readdir(dir).catch(() => [])) {
    if (!name.endsWith(".jsonl")) continue;
    const s = await stat(path.join(dir, name)).catch(() => null);
    if (s && s.size > 0) files.push({ agent: "claude", id: name.slice(0, -6), file: path.join(dir, name), mtime: s.mtimeMs, size: s.size });
  }
  files.sort((a, b) => b.mtime - a.mtime);
  const top = files.slice(0, limit);
  for (const f of top) f.title = await sessionTitle(f.file, f.size);
  return top.map(({ agent, id, title, mtime }) => ({ agent, id, title, mtime }));
}

/** Reads one session's log as it grows. The first read starts a few MB from the end on very long sessions. */
export class Follower {
  constructor(root, id) {
    this.file = sessionFile(root, id);
    this.offset = -1;
    this.carry = Buffer.alloc(0);
  }
  async poll() {
    const s = await stat(this.file).catch(() => null);
    if (!s) return [];
    let dropFirst = false;
    if (this.offset < 0) {
      this.offset = Math.max(0, s.size - 4_000_000);
      dropFirst = this.offset > 0;
    }
    if (s.size < this.offset) this.offset = 0;
    if (s.size === this.offset) return [];
    const fh = await open(this.file, "r");
    const len = s.size - this.offset;
    const buf = Buffer.alloc(len);
    try {
      await fh.read(buf, 0, len, this.offset);
    } finally {
      await fh.close();
    }
    this.offset = s.size;
    let all = Buffer.concat([this.carry, buf]);
    if (dropFirst) all = all.subarray(all.indexOf(10) + 1);
    const cut = all.lastIndexOf(10);
    if (cut < 0) {
      this.carry = all;
      return [];
    }
    this.carry = all.subarray(cut + 1);
    const evs = [];
    for (const line of all.subarray(0, cut).toString("utf8").split("\n")) if (line.trim()) evs.push(...parseLine(line));
    return evs;
  }
}
