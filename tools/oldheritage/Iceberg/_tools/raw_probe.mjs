// raw_probe.mjs <KEY> : prints JSON of every <OffthreadVideo>/<Video>/<Audio> the case's Comp mounts, with absolute master times.
// Used by raw_extend.py. Bundles _engine/src/cases/<KEY>.tsx with esbuild, swapping "remotion" for a mock whose <Sequence> always
// renders its children (so the whole timeline mounts once) and records absolute offsets. Pure functions (interpolate, Easing...)
// come from the real remotion.
import { build } from "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/_engine/node_modules/esbuild/lib/main.js";
import fs from "fs"; import path from "path"; import os from "os";
const KEY = process.argv[2];
const E = "C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/_engine";
const NM = E + "/node_modules";
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "rawprobe_"));
let caseFile = `${E}/src/cases/${KEY}.tsx`;
const entrySrc = fs.readFileSync(`${E}/src/entries/${KEY}.tsx`, "utf8");
const m = entrySrc.match(/from\s+"(\.\.\/[^"]+)"/);
if (m) caseFile = path.resolve(`${E}/src/entries`, m[1]) + (m[1].endsWith(".tsx") ? "" : ".tsx");
const mock = `
import * as R from "${NM}/remotion/dist/esm/index.mjs";
import React from "react";
export * from "${NM}/remotion/dist/esm/index.mjs";
export const registerRoot = () => {}; export const Composition = () => null; export const Still = () => null; export const Folder = (p) => p.children ?? null;
globalThis.__REC = [];
const Ctx = React.createContext({ off: 0, end: 1e9, chain: [] });
export const useCurrentFrame = () => 0;
export const useVideoConfig = () => ({ fps: 30, width: 1920, height: 1080, durationInFrames: 1e6, id: "x", defaultProps: {}, props: {} });
export const delayRender = () => 0; export const continueRender = () => {}; export const cancelRender = () => {};
export const staticFile = (s) => "/" + s.replace(/^\\//, "");
export const getInputProps = () => ({});
export const AbsoluteFill = ({ children }) => React.createElement(React.Fragment, null, children);
export const Img = () => null; export const IFrame = () => null;
export const Freeze = ({ frame, children }) => { const c = React.useContext(Ctx); return React.createElement(Ctx.Provider, { value: { ...c, freeze: frame } }, children); };
export const Sequence = ({ from = 0, durationInFrames = Infinity, children }) => {
  const c = React.useContext(Ctx); const off = c.off + from; const end = Math.min(c.end, off + durationInFrames);
  return React.createElement(Ctx.Provider, { value: { off, end, chain: [...c.chain, [off, end]], freeze: c.freeze } }, children);
};
export const Series = ({ children }) => children; Series.Sequence = Sequence;
export const Loop = ({ children }) => children;
const rec = (kind) => (p) => { const c = React.useContext(Ctx);
  let vol = p.volume; if (typeof vol === "function") { vol = [0, 6, 12, 30, 60].map((f) => { try { return vol(f); } catch { return null; } }); }
  globalThis.__REC.push({ kind, src: p.src, off: c.off, end: c.end, startFrom: p.startFrom ?? p.trimBefore ?? 0, rate: p.playbackRate ?? 1, muted: !!p.muted, freeze: c.freeze, vol, loop: !!p.loop });
  return null; };
export const OffthreadVideo = rec("video"); export const Video = rec("video"); export const Audio = rec("audio"); export const Html5Audio = rec("audio"); export const Html5Video = rec("video");
`;
fs.writeFileSync(tmp + "/mock.mjs", mock);
fs.writeFileSync(tmp + "/main.tsx", `import React from "react"; import { renderToStaticMarkup } from "react-dom/server";
import * as C from ${JSON.stringify(caseFile)};
const Comp = (C as any).Comp ?? (C as any).default ?? Object.values(C).find((v: any) => typeof v === "function");
let err = null; try { renderToStaticMarkup(React.createElement(Comp)); } catch (e) { err = String(e && e.stack || e).slice(0, 600); }
console.log(JSON.stringify({ case: ${JSON.stringify(caseFile)}, dur: (C as any).DUR ?? null, err, rec: (globalThis as any).__REC }));
`);
const plug = { name: "mockremotion", setup(b) {
  b.onResolve({ filter: /^remotion$/ }, () => ({ path: tmp + "/mock.mjs" }));
  // font gates render nothing until fonts load: open them
  b.onLoad({ filter: /core\/type\.tsx$/ }, (a) => ({ contents: fs.readFileSync(a.path, "utf8").replace("React.useState(libFontsReady)", "React.useState(true)"), loader: "tsx" }));
} };
await build({ entryPoints: [tmp + "/main.tsx"], bundle: true, platform: "node", format: "esm", outfile: tmp + "/out.mjs", plugins: [plug],
  nodePaths: [NM], logLevel: "error", jsx: "automatic", loader: { ".png": "empty", ".jpg": "empty", ".css": "empty", ".json": "json", ".glb": "empty" },
  define: { "process.env.NODE_ENV": '"production"' }, banner: { js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);" } });
await import(tmp + "/out.mjs");
