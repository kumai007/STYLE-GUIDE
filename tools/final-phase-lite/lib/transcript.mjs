// Reads Claude Code's own session logs (~/.claude/projects/<folder>/<session>.jsonl) and turns each line into plain
// events the window can show: what you asked, what Claude said, each step it runs, its plan, and when a turn ends.
// The log format is Claude Code's, not ours, and not documented. Anything we don't recognise is skipped, so if it
// changes the window shows less, but nothing breaks.

export const LITE_MARK = "[Sent from Final Phase Lite]";

const clip = (s, n) => {
  s = String(s ?? "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
};
const base = (p) => String(p ?? "").split(/[\\/]/).pop();
const firstLine = (s) => String(s ?? "").split("\n").find((l) => l.trim()) ?? "";
const IMAGE = /\.(png|jpe?g|webp|gif)$/i;

/** One step, said the way a person would say it. */
export function describeTool(name, input = {}) {
  const i = input ?? {};
  switch (name) {
    case "Bash": {
      const cmd = String(i.command ?? "");
      const render = /\bhyperframes(@[\w.-]+)?\s+render\b|\brender\b.*\.(mp4|mov)|ffmpeg\b.*-c:v/.test(cmd);
      return { kind: render ? "render" : "run", label: clip(i.description || firstLine(cmd), 110), detail: clip(cmd, 400) };
    }
    case "Write":
      return { kind: "write", label: `Writing ${base(i.file_path)}`, detail: i.file_path };
    case "Edit":
    case "MultiEdit":
    case "NotebookEdit":
      return { kind: "write", label: `Changing ${base(i.file_path ?? i.notebook_path)}`, detail: i.file_path ?? i.notebook_path };
    case "Read":
      if (/final-phase-lite[\\/]frames[\\/]/.test(i.file_path ?? "")) return { kind: "look", label: "Looking at the frame you paused on", detail: i.file_path };
      return IMAGE.test(i.file_path ?? "")
        ? { kind: "look", label: `Looking at ${base(i.file_path)}`, detail: i.file_path }
        : { kind: "read", label: `Reading ${base(i.file_path)}`, detail: i.file_path };
    case "Glob":
    case "Grep":
      return { kind: "read", label: "Searching the project", detail: i.pattern };
    case "Skill":
      return { kind: "skill", label: `Using the ${i.skill ?? i.command ?? i.name ?? ""} skill`.replace(/\s+skill$/, " skill"), detail: i.args };
    case "Task":
    case "Agent":
      return { kind: "helper", label: `A helper is working on: ${clip(i.description ?? i.prompt, 80)}`, detail: clip(i.prompt, 400) };
    case "WebFetch":
      return { kind: "read", label: "Reading a web page", detail: i.url };
    case "WebSearch":
      return { kind: "read", label: `Searching the web for "${clip(i.query, 60)}"`, detail: i.query };
    case "TodoWrite":
      return { kind: "plan", label: "Updating the plan" };
    default:
      if (String(name).startsWith("mcp__")) return { kind: "run", label: `Using ${String(name).split("__")[1] ?? name}`, detail: String(name) };
      return { kind: "run", label: String(name ?? "A step"), detail: "" };
  }
}

function textOf(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.filter((b) => b?.type === "text" && b.text).map((b) => b.text).join("\n");
}

/** The notes inside a message this window sent, without the instructions around them. */
export function liteNoteText(text) {
  const lines = String(text).split("\n");
  const notes = [];
  for (let i = 0; i < lines.length - 1; i++) if (/wrote:\s*$/.test(lines[i]) && lines[i + 1].trim()) notes.push(lines[i + 1].trim());
  return notes.join(" · ") || "Your notes";
}

// Text Claude Code itself puts in the conversation (slash commands, reminders, interrupts), not something you typed.
const MACHINE = /^\s*<(command-|local-command|system-reminder|bash-|user-memory|task-notification)/;

/**
 * One line of a session log (or of `claude -p --output-format stream-json`, which uses the same message shapes)
 * to zero or more events. Each event has `kind` and, when the line has one, `ts` (ms).
 */
export function parseLine(line) {
  let e;
  try {
    e = JSON.parse(line);
  } catch {
    return [];
  }
  if (!e || typeof e !== "object") return [];
  const ts = e.timestamp ? Date.parse(e.timestamp) || undefined : undefined;
  const out = [];

  if (e.type === "ai-title" && e.aiTitle) return [{ kind: "title", text: clip(e.aiTitle, 80) }];
  if (e.type === "system" && e.subtype === "turn_duration") return [{ kind: "turn-end", ts }];
  if (e.type === "result") return [{ kind: "turn-end", ts, ok: e.subtype === "success" && !e.is_error }];
  if (e.type !== "assistant" && e.type !== "user") return ts ? [{ kind: "tick", ts }] : [];

  // A helper's own steps (a subagent): they only show that something is still happening.
  if (e.isSidechain) return ts ? [{ kind: "tick", ts }] : [];

  const content = e.message?.content;
  if (e.type === "user") {
    if (Array.isArray(content)) {
      for (const b of content) {
        if (b?.type === "tool_result") {
          const t = typeof b.content === "string" ? b.content : Array.isArray(b.content) ? b.content.map((c) => c?.text ?? "").join("\n") : "";
          out.push({ kind: "result", id: b.tool_use_id, ts, ok: !b.is_error, preview: clip(t, 300) });
        }
      }
      if (out.length) return out;
    }
    if (e.isMeta || e.isCompactSummary) return ts ? [{ kind: "tick", ts }] : [];
    const text = textOf(content);
    if (!text.trim() || MACHINE.test(text)) return ts ? [{ kind: "tick", ts }] : [];
    if (text.startsWith("[Request interrupted")) return [{ kind: "turn-end", ts, interrupted: true }];
    const fromLite = text.startsWith(LITE_MARK);
    return [{ kind: "prompt", id: e.uuid, ts, text: clip(fromLite ? liteNoteText(text) : text, 2000), fromLite }];
  }

  // assistant
  if (!Array.isArray(content)) return ts ? [{ kind: "tick", ts }] : [];
  for (const b of content) {
    if (b?.type === "text" && b.text?.trim()) out.push({ kind: "text", id: `${e.uuid ?? e.message?.id}:${out.length}`, ts, text: b.text.trim() });
    else if (b?.type === "thinking") out.push({ kind: "thinking", ts });
    else if (b?.type === "tool_use") {
      if (b.name === "TodoWrite" && Array.isArray(b.input?.todos)) {
        out.push({
          kind: "todos",
          ts,
          todos: b.input.todos.map((t) => ({ text: clip(t.status === "in_progress" ? t.activeForm || t.content : t.content, 120), status: t.status })),
        });
      }
      const d = describeTool(b.name, b.input);
      // `type` is what sort of step it is (run, write, render…), for its icon.
      out.push({ kind: "tool", id: b.id, ts, name: b.name, background: !!b.input?.run_in_background, type: d.kind, label: d.label, detail: d.detail });
    }
  }
  // What this answer cost in tokens. Each block of one message repeats the same numbers, so the window keeps one per id.
  const u = e.message?.usage;
  if (u && e.message?.id) {
    const tokens = (u.input_tokens ?? 0) + (u.output_tokens ?? 0) + (u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0);
    if (tokens) out.push({ kind: "usage", id: e.message.id, ts, tokens, cost: null });
  }
  // The last message of a turn. Sessions run from this window (claude -p) don't log a separate end-of-turn line.
  if (e.message?.stop_reason === "end_turn" && out.some((x) => x.kind === "text")) out.push({ kind: "turn-end", ts });
  return out.length ? out : ts ? [{ kind: "tick", ts }] : [];
}

/** Splits a chunk of a growing file into complete lines, keeping the unfinished end for next time. */
export function splitLines(carry, chunk) {
  const text = carry + chunk;
  const parts = text.split("\n");
  return { lines: parts.slice(0, -1).filter((l) => l.trim()), carry: parts[parts.length - 1] };
}

/**
 * Where Claude Code is at, from the events so far: working or not, the step running now, and how long since the
 * last sign of life. `now` is passed in so this stays a plain function.
 */
export function summarize(events, now = Date.now()) {
  let working = false;
  let turnStart;
  let last;
  const open = new Map();
  let todos = null;
  for (const ev of events) {
    if (ev.ts) last = ev.ts;
    if (ev.kind === "prompt") {
      working = true;
      turnStart = ev.ts;
      open.clear();
    } else if (ev.kind === "turn-end") {
      working = false;
      open.clear();
    } else if (ev.kind === "tool") {
      working = true;
      if (!ev.background) open.set(ev.id, ev);
    } else if (ev.kind === "result") open.delete(ev.id);
    else if (ev.kind === "todos") todos = ev.todos;
    else if (ev.kind === "text" || ev.kind === "thinking") working = true;
  }
  const running = [...open.values()].pop() ?? null;
  return { working, turnStart, last, running, todos, quietFor: last ? now - last : null };
}
