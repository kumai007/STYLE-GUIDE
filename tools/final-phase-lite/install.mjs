#!/usr/bin/env node
// Sets up Final Phase Lite: checks this computer, then adds the `final-phase-lite` skill to Claude Code so that
// "open Final Phase Lite" works in any folder. It changes nothing else.
//
//   node install.mjs            install (or update)
//   node install.mjs --remove   take the skill out again
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findClaude, claudeHome } from "./lib/agents/claude.mjs";
import { findOpenCode, canWatch } from "./lib/agents/opencode.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.join(claudeHome(), "skills", "final-phase-lite");
const WIN = process.platform === "win32";

if (process.argv.includes("--remove")) {
  await rm(SKILL_DIR, { recursive: true, force: true });
  console.log("Removed the final-phase-lite skill from Claude Code. This folder is untouched; delete it if you like.");
  process.exit(0);
}

function version(cmd, args = ["--version"], all = false) {
  try {
    const out = execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], shell: WIN }).trim();
    return all ? out : out.split(/\r?\n/)[0];
  } catch {
    return null;
  }
}

const checks = [];
const node = Number(process.versions.node.split(".")[0]);
checks.push({ name: "Node", ok: node >= 20, found: `v${process.versions.node}`, why: "runs the window", fix: "Install Node 20 or newer from https://nodejs.org" });

const claude = findClaude();
const claudeVersion = claude ? version(claude) : null;
checks.push({ name: "Claude Code", ok: !!claude, found: claudeVersion ?? claude, why: "does the editing, on your own subscription", fix: "Install Claude Code: https://claude.com/claude-code (or use OpenCode instead)" });

const opencode = findOpenCode();
checks.push({
  name: "OpenCode",
  ok: !!opencode,
  optional: true,
  found: opencode ? `${version(opencode) ?? "installed"}${canWatch() ? "" : ", steps show once each answer is done (Node 22.5+ shows them live)"}` : null,
  why: "an alternative to Claude Code, with free models (edit for $0)",
  fix: WIN ? "npm install -g opencode-ai" : "curl -fsSL https://opencode.ai/install | bash",
});
if (!claude && opencode) checks[1].optional = true;

// When the Ollama app isn't open, `ollama --version` says so before the version.
const ollamaOut = version("ollama", ["--version"], true);
const ollamaVersion = ollamaOut?.match(/version is\s*(\S+)/i)?.[1] ?? ollamaOut?.split(/\r?\n/).find((l) => !/^warning/i.test(l));
checks.push({
  name: "Ollama",
  ok: !!ollamaOut,
  optional: true,
  found: ollamaOut ? `${ollamaVersion ?? "installed"}${/could not connect/i.test(ollamaOut) ? ", not running: open the Ollama app before you use it" : ""}` : null,
  why: "runs models on this computer, free and private (used through OpenCode). Set its Context length to 32k or more",
  fix: "https://ollama.com/download, then: ollama pull qwen3.5:9b",
});

const ffmpeg = version("ffmpeg", ["-version"]);
checks.push({
  name: "FFmpeg",
  ok: !!ffmpeg,
  optional: true,
  found: ffmpeg?.match(/ffmpeg version (\d[\d.]*)/)?.[1] ?? ffmpeg?.slice(0, 30),
  why: "turns the video into an .mp4 when you render (not needed to watch or send notes)",
  fix: WIN ? "winget install Gyan.FFmpeg" : process.platform === "darwin" ? "brew install ffmpeg" : "sudo apt install ffmpeg",
});

const npx = version(WIN ? "npx.cmd" : "npx");
checks.push({ name: "npx", ok: !!npx, found: npx, why: "takes the picture of the frame you paused on (HyperFrames)", fix: "It comes with Node; reinstall Node from https://nodejs.org" });

// The skill, pointing at this folder.
let skillOk = false;
if (node >= 20) {
  const template = await readFile(path.join(HERE, "skill", "SKILL.md"), "utf8");
  await mkdir(SKILL_DIR, { recursive: true });
  await writeFile(path.join(SKILL_DIR, "SKILL.md"), template.replaceAll("{{DIR}}", HERE.split(path.sep).join("/")));
  skillOk = existsSync(path.join(SKILL_DIR, "SKILL.md"));
}

console.log("\nFinal Phase Lite: setup\n");
for (const c of checks) {
  const mark = c.ok ? "OK " : c.optional ? "-- " : "NO ";
  console.log(`${mark} ${c.name}${c.found ? ` (${c.found})` : ""}: ${c.why}`);
  if (!c.ok) console.log(`    To add it: ${c.fix}`);
}
console.log(`${skillOk ? "OK " : "NO "} Skill: ${skillOk ? `added to Claude Code (${SKILL_DIR})` : "not added (Node is too old)"}`);

const blocking = checks.filter((c) => !c.ok && !c.optional);
console.log(
  blocking.length
    ? `\nAlmost there: install ${blocking.map((c) => c.name).join(" and ")}, then run this again.`
    : `\nReady. Open Claude Code in any folder where you make a video and say: open Final Phase Lite\nOr start it yourself: node "${path.join(HERE, "server.mjs")}" <your video folder>`,
);
process.exit(blocking.length ? 1 : 0);
