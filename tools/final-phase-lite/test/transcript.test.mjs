import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLine, summarize, describeTool, LITE_MARK } from "../lib/transcript.mjs";
import { buildMessage, clock } from "../lib/notes.mjs";
import { safeJoin } from "../lib/project.mjs";
import { claudeArgs, encodeProjectDir, readLimit } from "../lib/agents/claude.mjs";
import { partEvents } from "../lib/agents/opencode.mjs";
import { locate, parseDescription } from "../lib/locate.mjs";
import { mkdtemp, writeFile as writeF } from "node:fs/promises";
import os from "node:os";
import pathMod from "node:path";

const T = (s) => `2026-11-17T10:00:${String(s).padStart(2, "0")}.000Z`;
const line = (o) => JSON.stringify(o);

test("a typed prompt, a step, its result and the end of the turn", () => {
  const evs = [
    ...parseLine(line({ type: "user", timestamp: T(0), uuid: "u1", message: { role: "user", content: "make the title yellow" } })),
    ...parseLine(line({ type: "assistant", timestamp: T(2), uuid: "a1", message: { content: [{ type: "tool_use", id: "t1", name: "Bash", input: { command: "npx hyperframes lint", description: "Check the composition" } }] } })),
  ];
  assert.equal(evs[0].kind, "prompt");
  assert.equal(evs[0].text, "make the title yellow");
  assert.equal(evs[1].kind, "tool");
  assert.equal(evs[1].label, "Check the composition");
  assert.equal(evs[1].type, "run");

  let s = summarize(evs, Date.parse(T(5)));
  assert.equal(s.working, true);
  assert.equal(s.running.id, "t1");
  assert.equal(s.quietFor, 3000);

  evs.push(...parseLine(line({ type: "user", timestamp: T(6), message: { content: [{ type: "tool_result", tool_use_id: "t1", content: "0 errors" }] } })));
  evs.push(...parseLine(line({ type: "assistant", timestamp: T(8), uuid: "a2", message: { content: [{ type: "text", text: "Done, it's yellow now." }] } })));
  evs.push(...parseLine(line({ type: "system", subtype: "turn_duration", timestamp: T(8) })));
  s = summarize(evs, Date.parse(T(9)));
  assert.equal(s.working, false);
  assert.equal(s.running, null);
  assert.equal(evs.filter((e) => e.kind === "text")[0].text, "Done, it's yellow now.");
});

test("machine text, tool output and helpers are not shown as the user speaking", () => {
  assert.deepEqual(parseLine(line({ type: "user", timestamp: T(1), message: { content: "<command-name>/clear</command-name>" } })).map((e) => e.kind), ["tick"]);
  assert.deepEqual(parseLine(line({ type: "user", isMeta: true, timestamp: T(1), message: { content: "Caveat" } })).map((e) => e.kind), ["tick"]);
  assert.deepEqual(parseLine(line({ type: "assistant", isSidechain: true, timestamp: T(1), message: { content: [{ type: "text", text: "helper" }] } })).map((e) => e.kind), ["tick"]);
  assert.deepEqual(parseLine("not json"), []);
  assert.deepEqual(parseLine(line({ type: "api-request" })), []);
});

test("notes sent from the window are marked, and an interrupt ends the turn", () => {
  const [p] = parseLine(line({ type: "user", timestamp: T(1), message: { content: `${LITE_MARK}\nAt 0:31.2 …` } }));
  assert.equal(p.fromLite, true);
  const [i] = parseLine(line({ type: "user", timestamp: T(2), message: { content: [{ type: "text", text: "[Request interrupted by user]" }] } }));
  assert.equal(i.kind, "turn-end");
});

test("Claude's plan (TodoWrite) becomes a checklist", () => {
  const evs = parseLine(
    line({
      type: "assistant",
      timestamp: T(1),
      message: { content: [{ type: "tool_use", id: "t9", name: "TodoWrite", input: { todos: [{ content: "Cut", status: "completed", activeForm: "Cutting" }, { content: "Captions", status: "in_progress", activeForm: "Adding captions" }] } }] },
    }),
  );
  assert.equal(evs[0].kind, "todos");
  assert.deepEqual(evs[0].todos.map((t) => t.text), ["Cut", "Adding captions"]);
});

test("steps read like a person would say them; renders are spotted", () => {
  assert.equal(describeTool("Write", { file_path: "/a/b/index.html" }).label, "Writing index.html");
  assert.equal(describeTool("Read", { file_path: "x/frame.png" }).kind, "look");
  assert.equal(describeTool("Bash", { command: "npx hyperframes render --output renders/v.mp4" }).kind, "render");
  assert.equal(describeTool("Bash", { command: "ls" }).kind, "run");
  assert.equal(describeTool("Skill", { skill: "hyperframes" }).label, "Using the hyperframes skill");
});

test("a background step doesn't count as the step running now", () => {
  const evs = parseLine(line({ type: "assistant", timestamp: T(1), message: { content: [{ type: "tool_use", id: "b1", name: "Bash", input: { command: "sleep 100", run_in_background: true } }] } }));
  assert.equal(summarize(evs, Date.parse(T(3))).running, null);
});

test("the message Claude gets for notes", () => {
  const one = buildMessage([{ text: "make this bigger", time: 31.2, source: "live", entry: "index.html", picture: ".final-phase-lite/frames/n1.png" }]);
  assert.ok(one.startsWith(LITE_MARK));
  assert.match(one, /At 0:31\.2 \(31\.20 s\) in the live preview of index\.html/);
  assert.match(one, /frames\/n1\.png/);
  assert.match(one, /don't render the video to check a change/);
  const two = buildMessage([{ text: "a", time: null }, { text: "b", time: 2, source: "renders/v.mp4" }]);
  assert.match(two, /1\. The user wrote:\na/);
  assert.match(two, /2\. At 0:02\.0 \(2\.00 s\) in renders\/v\.mp4/);
  assert.equal(clock(65.25), "1:05.3");
});

test("files are only served from inside the project", () => {
  const root = "/tmp/proj";
  assert.equal(safeJoin(root, "a/b.mp4"), "/tmp/proj/a/b.mp4");
  assert.equal(safeJoin(root, "../etc/passwd"), null);
  assert.equal(safeJoin(root, "a/../../x"), null);
  assert.equal(encodeProjectDir("/Users/me/My Videos"), "-Users-me-My-Videos");
});

test("a session run from the window ends its turn on Claude's last message", () => {
  const evs = [
    ...parseLine(line({ type: "assistant", timestamp: T(1), message: { stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }] } })),
    ...parseLine(line({ type: "assistant", timestamp: T(2), message: { stop_reason: "end_turn", content: [{ type: "text", text: "Done." }] } })),
  ];
  assert.deepEqual(evs.map((e) => e.kind), ["thinking", "text", "turn-end"]);
  assert.equal(summarize(evs).working, false);
});

test("a message from the window shows as the notes in it", () => {
  const msg = buildMessage([{ text: "make this title yellow", time: 2, source: "live", entry: "index.html" }, { text: "and bigger", time: null }]);
  const [p] = parseLine(line({ type: "user", timestamp: T(1), message: { content: msg } }));
  assert.equal(p.text, "make this title yellow · and bigger");
});

test("Claude Code is run on its own login, refusing what it can't ask about, and forking terminal sessions", () => {
  const a = claudeArgs("abc", true);
  assert.ok(a.includes("-p") && a.includes("dontAsk"));
  assert.ok(!a.includes("--bare"));
  assert.deepEqual(a.slice(-3), ["--resume", "abc", "--fork-session"]);
  assert.ok(!claudeArgs("abc", false).includes("--fork-session"));
  assert.ok(!claudeArgs(null, true).includes("--resume"));
});

test("OpenCode: a step shows when it starts and again when it ends, with tokens and cost", () => {
  const seen = {};
  const row = (data, extra = {}) => ({ id: "prt_1", message_id: "msg_1", time_created: 1000, time_updated: 1500, data: JSON.stringify(data), ...extra });
  const running = partEvents(row({ type: "tool", tool: "bash", state: { status: "running", input: { command: "npx hyperframes lint", description: "Check the video" }, time: { start: 1100 } } }), "assistant", seen);
  assert.deepEqual(running.map((e) => e.kind), ["tool"]);
  assert.equal(running[0].label, "Check the video");
  assert.equal(running[0].ts, 1100);
  const done = partEvents(row({ type: "tool", tool: "bash", state: { status: "completed", input: { command: "x" }, output: "0 errors", time: { start: 1100, end: 1400 } } }), "assistant", seen);
  assert.deepEqual(done.map((e) => [e.kind, e.ok]), [["result", true]]);
  const edit = partEvents(row({ type: "tool", tool: "edit", state: { status: "error", input: { filePath: "/p/index.html" }, error: "no match" } }), "assistant", {});
  assert.deepEqual(edit.map((e) => e.kind), ["tool", "result"]);
  assert.equal(edit[0].label, "Changing index.html");
  assert.equal(edit[1].ok, false);
  const [u] = partEvents(row({ type: "step-finish", tokens: { input: 100, output: 20, reasoning: 5, cache: { read: 1000, write: 0 } }, cost: 0 }), "assistant", {});
  assert.deepEqual([u.kind, u.tokens, u.cost], ["usage", 1125, 0]);
  const [p] = partEvents(row({ type: "text", text: `"${buildMessage([{ text: "make it red", time: 1, source: "live", entry: "index.html" }])}"` }), "user", {});
  assert.deepEqual([p.kind, p.text, p.fromLite], ["prompt", "make it red", true]);
  assert.deepEqual(partEvents(row({ type: "text", text: "half way" }), "assistant", {}), []);
  assert.equal(partEvents(row({ type: "text", text: "Done.", time: { end: 2000 } }), "assistant", {})[0].kind, "text");
});

test("Claude: token counts, and the plan's limit", () => {
  const evs = parseLine(line({ type: "assistant", timestamp: T(1), message: { id: "m1", usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 100 }, content: [{ type: "text", text: "hi" }] } }));
  assert.deepEqual(evs.filter((e) => e.kind === "usage").map((e) => [e.id, e.tokens]), [["m1", 115]]);
  const l = readLimit({ rate_limit_info: { rateLimitType: "five_hour", utilization: 0.234, resetsAt: 1794913200, status: "allowed" } });
  assert.deepEqual([l.window, l.used, l.resetsAt], ["five_hour", 23, 1794913200000]);
  assert.equal(readLimit({}), null);
  // As Claude Code 2.1 prints it: the share sits under unifiedWindows.
  const real = readLimit({ type: "rate_limit_event", rate_limit_info: { status: "allowed", resetsAt: 1795388400, rateLimitType: "seven_day", unifiedWindows: { seven_day: { utilization: 0.1, resetsAt: 1795388400, status: "allowed" }, five_hour: { utilization: 0.42, resetsAt: 1794920000 } } } });
  assert.deepEqual([real.window, real.used, real.resetsAt], ["five_hour", 42, 1794920000000]);
});

test("a circled note tells the AI where, and what's inside the circle", () => {
  const msg = buildMessage([
    { text: "make this bigger", time: 2, source: "live", entry: "index.html", picture: ".final-phase-lite/frames/n9.jpg", region: { x: 600, y: 380, w: 720, h: 140, fw: 1920, fh: 1080 }, inside: ['<div#title> "My first video"'] },
  ]);
  assert.match(msg, /They circled what they mean: x 600 to 1320, y 380 to 520 of the 1920x1080 frame \(centre\)/);
  assert.match(msg, /Inside the circle, in the composition: <div#title> "My first video"\./);
  assert.match(msg, /with their circle drawn on it in orange/);
  const [p] = parseLine(line({ type: "user", timestamp: T(1), message: { content: msg } }));
  assert.equal(p.text, "make this bigger");
});

test("the circled element is found in the code: what makes it, styles it and moves it", async () => {
  const dir = await mkdtemp(pathMod.join(os.tmpdir(), "lite-"));
  await writeF(pathMod.join(dir, "index.html"), ['<style>', '  #ep { color: #fff; }', '  #epic { color: red; }', '</style>', '<div id="ep" class="clip">Episode 1</div>', '<script>tl.from("#ep", { opacity: 0 });</script>'].join("\n"));
  assert.deepEqual(parseDescription('<div#ep.clip> "Episode 1"'), { tag: "div", id: "ep", classes: ["clip"] });
  const found = await locate(dir, "index.html", ['<div#ep.clip> "Episode 1"']);
  assert.deepEqual(found.map((f) => f.line).sort(), [2, 5, 6]);
  assert.equal(found.find((f) => f.line === 5).text, '<div id="ep" class="clip">Episode 1</div>');
  const msg = buildMessage([{ text: "make this red", time: 2, source: "live", entry: "index.html", region: { x: 0, y: 0, w: 10, h: 10, fw: 1920, fh: 1080 }, code: found }]);
  assert.match(msg, /Where that is in the code \(start there\):\n- index\.html:\d+/);
});
