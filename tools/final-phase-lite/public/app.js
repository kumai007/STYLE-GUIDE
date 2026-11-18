// Final Phase Lite: the window. Plain JavaScript, no build step.
import { summarize } from "/lib/transcript.mjs";

const $ = (id) => document.getElementById(id);
const TOKEN = document.querySelector('meta[name="lite-token"]').content;

async function api(path, body) {
  const r = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { "x-lite-token": TOKEN, "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json().catch(() => ({ error: "No answer from the tool. Is it still running?" }));
}

// ---- icons (simple line icons) ----
const svg = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>`,
  back: svg('<path d="M15 6l-6 6 6 6"/>'),
  fwd: svg('<path d="M9 6l6 6-6 6"/>'),
  reload: svg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
  sound: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/>'),
  mute: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/>'),
  run: svg('<path d="M4 17l6-5-6-5"/><path d="M12 19h8"/>'),
  write: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  read: svg('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 13h6M9 17h6"/>'),
  look: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>'),
  skill: svg('<path d="M12 3l2.6 5.6L20 9.3l-4 4.1.9 5.6L12 16.4 7.1 19l.9-5.6-4-4.1 5.4-.7z"/>'),
  helper: svg('<circle cx="9" cy="8" r="3.5"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.7.8 2.8 2.6 3.2 5.2"/>'),
  plan: svg('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
  render: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 9.5v5l4.5-2.5z" fill="currentColor"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  wait: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
};

// ---- state ----
const S = {
  folder: "", entries: [], entryInfo: {}, videos: [], sessions: [],
  session: { id: null, title: "", events: [], lastTs: null, pinned: false },
  run: { active: null, last: null, claude: true },
  notes: [],
  source: null, // { type: "live", entry } or { type: "file", path }
  frame: null, video: null, ready: false,
  t: 0, dur: 0, fps: 30, w: 1920, h: 1080, playing: false, muted: false,
  scenes: [], clips: [],
  attach: true, waiting: false,
  expanded: new Set(),
  settings: { agent: "claude", model: null, models: [], agents: {} },
};

// ---- which AI ----
const AI_NAMES = { claude: "Claude", opencode: "OpenCode" };
const aiKey = () => S.session.agent ?? S.run.active?.agent ?? S.settings.agent ?? "claude";
const aiName = () => AI_NAMES[aiKey()] ?? "The AI";
const modelInfo = (id) => S.settings.models.find((m) => m.id === id);
function fmtTokens(n) {
  if (!n) return "0";
  if (n < 1000) return String(n);
  if (n < 1e6) return `${(n / 1000).toFixed(n < 10000 ? 1 : 0)}k`;
  return `${(n / 1e6).toFixed(2)}M`;
}
function fmtCost(c) {
  if (c == null) return "";
  if (c === 0) return "$0.00";
  if (c < 0.01) return "<$0.01";
  return `$${c.toFixed(2)}`;
}

// ---- helpers ----
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const encPath = (p) => p.split("/").map(encodeURIComponent).join("/");
function fmt(t) {
  if (!Number.isFinite(t)) t = 0;
  const m = Math.floor(t / 60);
  return `${m}:${(t - m * 60).toFixed(1).padStart(4, "0")}`;
}
function since(ms) {
  if (ms == null || ms < 0) ms = 0;
  const s = Math.floor(ms / 1000);
  if (s < 60) return `0:${String(s).padStart(2, "0")}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}:${String(s % 60).padStart(2, "0")}`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}
function ago(ms) {
  const s = Math.max(0, (Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(ms).toLocaleDateString();
}
const base = (p) => String(p).split("/").pop();
function toast(text, action, onAction, ms) {
  const el = $("toast");
  el.innerHTML = `<span>${esc(text)}</span>${action ? `<button>${esc(action)}</button>` : ""}`;
  el.classList.add("show");
  if (action) el.querySelector("button").onclick = () => (onAction(), el.classList.remove("show"));
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), ms ?? (action ? 9000 : 3500));
}
function flash(text) {
  const el = $("flash");
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(flash.timer);
  flash.timer = setTimeout(() => el.classList.remove("show"), 2200);
}

// ======================================================================
// The player: a HyperFrames composition played live from its files, or a video file
// ======================================================================
function control(action, extra = {}) {
  S.frame?.contentWindow?.postMessage({ source: "hf-parent", type: "control", action, ...extra }, "*");
}

function mountSource({ keepTime = true } = {}) {
  const v = $("viewer");
  v.querySelectorAll("iframe, video").forEach((n) => n.remove());
  S.frame = S.video = null;
  S.ready = false;
  S.playing = false;
  if (!keepTime) S.t = 0;
  // Where to be once the new page is ready (it starts at 0 and says so before it can seek).
  S.restoreT = S.t;
  if (!S.source) {
    $("empty").innerHTML = `<div><b>Nothing to play yet</b>When Claude makes a HyperFrames video or renders one in this folder, it shows up here by itself.</div>`;
    S.dur = 0;
    renderSources();
    renderTimeline();
    renderTransport();
    renderComposer();
    return;
  }
  $("empty").innerHTML = "";
  if (S.source.type === "live") {
    const info = S.entryInfo[S.source.entry] ?? {};
    S.w = info.width ?? 1920;
    S.h = info.height ?? 1080;
    S.dur = info.duration ?? S.dur;
    if (info.fps) S.fps = info.fps;
    const f = document.createElement("iframe");
    f.allow = "autoplay; fullscreen";
    f.title = "Live preview";
    f.src = `/p/${encPath(S.source.entry)}?live=1&v=${Date.now()}`;
    v.appendChild(f);
    S.frame = f;
    fit();
  } else {
    S.scenes = [];
    S.clips = [];
    const el = document.createElement("video");
    el.src = `/p/${encPath(S.source.path)}`;
    el.preload = "auto";
    el.playsInline = true;
    el.muted = S.muted;
    el.addEventListener("loadedmetadata", () => {
      S.dur = el.duration;
      S.w = el.videoWidth;
      S.h = el.videoHeight;
      fit();
      if (S.t) el.currentTime = Math.min(S.t, el.duration - 0.01);
      renderTimeline();
      renderTime();
    });
    el.addEventListener("play", () => ((S.playing = true), renderTransport(), renderComposer(), loop()));
    el.addEventListener("pause", () => ((S.playing = false), renderTransport(), renderComposer()));
    el.addEventListener("seeked", () => ((S.t = el.currentTime), renderPlayhead(), renderTime(), renderComposer()));
    v.appendChild(el);
    S.video = el;
  }
  renderSources();
  renderTimeline();
  renderTransport();
  renderComposer();
}

function loop() {
  if (!S.video || !S.playing) return;
  S.t = S.video.currentTime;
  renderPlayhead();
  renderTime();
  renderAtTag();
  requestAnimationFrame(loop);
}

function fit() {
  if (S.frame) {
    const box = $("viewer").getBoundingClientRect();
    const s = Math.min(box.width / S.w, box.height / S.h) || 1;
    S.frame.style.width = `${S.w}px`;
    S.frame.style.height = `${S.h}px`;
    S.frame.style.transform = `translate(${(box.width - S.w * s) / 2}px, ${(box.height - S.h * s) / 2}px) scale(${s})`;
  }
  layoutMarks();
}
new ResizeObserver(fit).observe($("viewer"));

window.addEventListener("message", (ev) => {
  if (!S.frame || ev.source !== S.frame.contentWindow) return;
  const d = ev.data;
  if (!d || d.source !== "hf-preview") return;
  if (d.type === "ready") {
    S.ready = true;
    const t = S.restoreT ?? S.t;
    control("set-muted", { muted: S.muted });
    control("seek", { timeSeconds: t });
    S.t = t;
    setTimeout(() => (S.restoreT = null), 400);
  } else if (d.type === "timeline") {
    if (d.durationSeconds > 0) S.dur = d.durationSeconds;
    if (d.fps > 0) S.fps = d.fps;
    S.scenes = Array.isArray(d.scenes) ? d.scenes : [];
    S.clips = Array.isArray(d.clips) ? d.clips : [];
    if (d.compositionWidth && d.compositionHeight && (d.compositionWidth !== S.w || d.compositionHeight !== S.h)) {
      S.w = d.compositionWidth;
      S.h = d.compositionHeight;
      fit();
    }
    renderTimeline();
    renderTime();
  } else if (d.type === "state") {
    if (typeof d.currentTime === "number" && !S.dragging && S.restoreT == null) S.t = d.currentTime;
    const was = S.playing;
    S.playing = !!d.isPlaying;
    renderPlayhead();
    renderTime();
    renderAtTag();
    if (was !== S.playing) {
      renderTransport();
      renderComposer();
    }
  } else if (d.type === "media-autoplay-blocked") {
    flash("Press play once more to hear the sound");
  }
});

function play() {
  clearMarks();
  if (S.video) {
    if (S.video.ended) S.video.currentTime = 0;
    void S.video.play();
  } else if (S.frame && S.ready) {
    if (S.dur && S.t >= S.dur - 0.05) control("seek", { timeSeconds: 0 });
    control("play");
  }
}
function pause() {
  if (S.video) S.video.pause();
  else if (S.frame) control("pause");
  S.playing = false;
  renderTransport();
  renderComposer();
}
function seek(t, mode = "commit") {
  t = Math.max(0, Math.min(S.dur || 0, t));
  // A circle belongs to the frame it was drawn on.
  if (S.marks.length && S.marksAt != null && Math.abs(t - S.marksAt) > 0.0005) clearMarks();
  S.t = t;
  if (S.video) S.video.currentTime = t;
  else if (S.frame) control("seek", { timeSeconds: t, seekMode: mode });
  renderPlayhead();
  renderTime();
  renderAtTag();
}
const step = (frames) => (pause(), seek(Math.round((S.t + frames / S.fps) * S.fps) / S.fps));

// Claude saved something: play the new version from the same moment.
let reloadTimer = null;
let lastReload = 0;
function onFilesChanged(files) {
  S.filesVersion++;
  if (!S.source || S.source.type !== "live") return;
  const dir = S.source.entry.includes("/") ? S.source.entry.slice(0, S.source.entry.lastIndexOf("/") + 1) : "";
  const mine = files.filter((f) => f.startsWith(dir) && !/\.(mp4|mov|webm|m4v)$/i.test(f));
  if (!mine.length) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    lastReload = Date.now();
    mountSource();
    flash(`Updated: ${mine.slice(0, 2).map(base).join(", ")}${mine.length > 2 ? ` and ${mine.length - 2} more` : ""}`);
  }, Math.max(250, 1200 - (Date.now() - lastReload)));
}


// ======================================================================
// Circling: draw on the paused frame to show exactly what you mean
// ======================================================================
const marksCanvas = document.createElement("canvas");
marksCanvas.id = "marks";
$("viewer").appendChild(marksCanvas);
const markTools = document.createElement("div");
markTools.id = "markTools";
markTools.className = "mark-tools";
$("viewer").appendChild(markTools);
Object.assign(S, { marks: [], marksAt: null, marksSent: false, filesVersion: 0 });
let stroke = null;

// Where the picture sits inside the viewer (it's letterboxed to keep its shape).
function pictureRect() {
  const box = $("viewer").getBoundingClientRect();
  const s = Math.min(box.width / S.w, box.height / S.h) || 1;
  return { x: (box.width - S.w * s) / 2, y: (box.height - S.h * s) / 2, w: S.w * s, h: S.h * s };
}
function layoutMarks() {
  const r = pictureRect();
  const dpr = window.devicePixelRatio || 1;
  Object.assign(marksCanvas.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
  marksCanvas.width = Math.max(1, Math.round(r.w * dpr));
  marksCanvas.height = Math.max(1, Math.round(r.h * dpr));
  drawMarks();
}
/** Draws circles (lists of [x, y] from 0 to 1 across the picture) at any size: on screen, and on the picture sent. */
function paintStrokes(ctx, strokes, w, h, dim = false) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const lw = Math.max(3, w * 0.0045);
  for (const pts of strokes) {
    if (pts.length < 2) continue;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * w, y * h) : ctx.moveTo(x * w, y * h)));
    ctx.setLineDash(dim ? [lw * 2.4, lw * 1.8] : []);
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = lw * 1.9;
    ctx.stroke();
    ctx.strokeStyle = dim ? "rgba(255,90,54,0.8)" : "#ff5a36";
    ctx.lineWidth = lw;
    ctx.stroke();
  }
  ctx.setLineDash([]);
}
function drawMarks() {
  const ctx = marksCanvas.getContext("2d");
  ctx.clearRect(0, 0, marksCanvas.width, marksCanvas.height);
  paintStrokes(ctx, stroke ? [...S.marks, stroke] : S.marks, marksCanvas.width, marksCanvas.height, S.marksSent);
  const v = $("viewer");
  v.classList.toggle("has-source", !!S.source && S.dur > 0);
  v.classList.toggle("can-draw", !!S.source && S.dur > 0 && !S.playing);
  renderMarkTools();
}
function renderMarkTools() {
  if (!S.source || !S.dur || S.playing) return void (markTools.innerHTML = "");
  markTools.innerHTML = S.marks.length
    ? `<span class="dotm"></span><span>${S.marksSent ? "Your circle, sent with the note" : "Circled. Now say what to change"}</span><button type="button" class="link" id="clearMarks">${S.marksSent ? "Hide" : "Clear"}</button>`
    : `<span>Draw on the picture to circle what you mean</span>`;
  $("clearMarks")?.addEventListener("click", clearMarks);
}
function clearMarks() {
  if (!S.marks.length && !stroke) return;
  S.marks = [];
  S.marksAt = null;
  S.marksSent = false;
  stroke = null;
  drawMarks();
  renderComposer();
}
function showMarks(marks, t) {
  S.marks = marks;
  S.marksAt = t;
  S.marksSent = true;
  drawMarks();
}
const toPoint = (e) => {
  const r = marksCanvas.getBoundingClientRect();
  const c = (v) => Math.round(Math.min(1, Math.max(0, v)) * 10000) / 10000;
  return [c((e.clientX - r.left) / r.width), c((e.clientY - r.top) / r.height)];
};
marksCanvas.addEventListener("pointerdown", (e) => {
  if (!S.source || !S.dur) return;
  if (S.playing) return pause(); // a click on the playing video pauses it
  if (S.marksSent) S.marks = [];
  S.marksSent = false;
  S.marksAt = S.t;
  stroke = [toPoint(e)];
  marksCanvas.setPointerCapture(e.pointerId);
  drawMarks();
});
marksCanvas.addEventListener("pointermove", (e) => {
  if (!stroke) return;
  if (stroke.length < 600) stroke.push(toPoint(e));
  drawMarks();
});
function endStroke() {
  if (!stroke) return;
  let s = stroke;
  stroke = null;
  // A click instead of a drag: a small circle around that spot.
  const [x0, y0] = s[0];
  const moved = s.some(([x, y]) => Math.abs(x - x0) * S.w > 6 || Math.abs(y - y0) * S.h > 6);
  if (!moved) {
    const r = 0.05;
    s = Array.from({ length: 41 }, (_, i) => [x0 + (r * S.h / S.w) * Math.cos((i / 40) * 2 * Math.PI), y0 + r * Math.sin((i / 40) * 2 * Math.PI)]);
  }
  S.marks.push(s);
  drawMarks();
  renderComposer();
  prefetchFrame();
  $("input").focus({ preventScroll: true });
}
marksCanvas.addEventListener("pointerup", endStroke);
marksCanvas.addEventListener("pointercancel", endStroke);

// The exact frame, as HyperFrames renders it, asked for as soon as you circle (it takes a few seconds).
const frameCache = new Map();
function prefetchFrame() {
  if (S.source?.type !== "live" || !S.dur) return null;
  const time = Math.round(S.t * 1000) / 1000;
  const key = `${S.source.entry}|${time}|${S.filesVersion}`;
  if (!frameCache.has(key)) frameCache.set(key, api("/api/frame", { entry: S.source.entry, time }).then((r) => r.picture ?? null).catch(() => null));
  return frameCache.get(key);
}
const loadImage = (src) =>
  new Promise((resolve) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => resolve(null);
    i.src = src;
  });
/** The frame you paused on with your circle drawn on it, as a JPEG data URL. */
async function composePicture() {
  let img = null;
  let w = 0;
  let h = 0;
  if (S.source.type === "file") {
    if (!S.video?.videoWidth) return null;
    img = S.video;
    w = S.video.videoWidth;
    h = S.video.videoHeight;
  } else {
    const p = await prefetchFrame();
    img = p ? await loadImage(`/p/${encPath(p)}`) : null;
    if (!img) return null;
    w = img.naturalWidth;
    h = img.naturalHeight;
  }
  const scale = Math.min(1, 1600 / w);
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, c.width, c.height);
  paintStrokes(ctx, S.marks, c.width, c.height);
  try {
    return c.toDataURL("image/jpeg", 0.88);
  } catch {
    return null;
  }
}
/** The circle's box in the video's own pixels. */
function marksBox() {
  if (!S.marks.length) return null;
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const st of S.marks) for (const [x, y] of st) (x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y));
  return { x: Math.round(x0 * S.w), y: Math.round(y0 * S.h), w: Math.round((x1 - x0) * S.w), h: Math.round((y1 - y0) * S.h), fw: S.w, fh: S.h };
}
/** What's inside the circle in a live preview: the composition's own elements, so the AI knows exactly which one. */
function insideCircle(box) {
  const doc = S.frame?.contentDocument;
  if (!doc || !box) return [];
  const hits = new Map();
  const area = (el) => {
    const r = el.getBoundingClientRect();
    return r.width * r.height;
  };
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      let els = [];
      try {
        els = doc.elementsFromPoint(box.x + (box.w * (i + 0.5)) / 5, box.y + (box.h * (j + 0.5)) / 5);
      } catch {}
      for (const el of els) {
        if (el === doc.documentElement || el === doc.body || area(el) > S.w * S.h * 0.85) continue;
        const cs = doc.defaultView.getComputedStyle(el);
        if (cs.visibility === "hidden" || Number(cs.opacity) === 0) continue;
        hits.set(el, (hits.get(el) ?? 0) + 1);
      }
    }
  const describe = (el) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
    const text = String(el.innerText ?? el.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 60);
    const src = el.getAttribute?.("src") ? ` src=${el.getAttribute("src").split("/").pop()}` : "";
    const comp = el.closest("[data-composition-id]")?.getAttribute("data-composition-id");
    return `<${el.tagName.toLowerCase()}${id}${cls}>${src}${text ? ` "${text}"` : ""}${comp && comp !== "main" ? ` (in ${comp})` : ""}`.slice(0, 160);
  };
  return [...new Set([...hits.entries()].sort((a, b) => b[1] - a[1] || area(a[0]) - area(b[0])).slice(0, 6).map(([el]) => describe(el)))];
}

// ======================================================================
// Rendering the screen
// ======================================================================
function renderSources() {
  const el = $("sources");
  const parts = [];
  if (S.entries.length) {
    const on = S.source?.type === "live";
    if (S.entries.length === 1) parts.push(`<button class="chip ${on ? "on" : ""}" data-live="${esc(S.entries[0])}">Live preview</button>`);
    else
      parts.push(
        `<label class="chip ${on ? "on" : ""}">Live: <select id="entryPick">${S.entries
          .map((e) => `<option value="${esc(e)}" ${on && S.source.entry === e ? "selected" : ""}>${esc(e.replace(/\/?index\.html$/, "") || "this folder")}</option>`)
          .join("")}</select></label>`,
      );
  }
  if (S.videos.length) {
    const on = S.source?.type === "file";
    parts.push(
      `<label class="chip ${on ? "on" : ""}">${on ? "" : "Renders: "}<select id="videoPick">${on ? "" : `<option value="">${S.videos.length} file${S.videos.length > 1 ? "s" : ""}</option>`}${S.videos
        .map((v) => `<option value="${esc(v.path)}" ${on && S.source.path === v.path ? "selected" : ""}>${esc(v.path)} · ${ago(v.mtime)}</option>`)
        .join("")}</select></label>`,
    );
  }
  el.innerHTML = parts.join("");
  el.querySelector("[data-live]")?.addEventListener("click", (e) => setSource({ type: "live", entry: e.currentTarget.dataset.live }));
  $("entryPick")?.addEventListener("change", (e) => setSource({ type: "live", entry: e.target.value }));
  $("videoPick")?.addEventListener("change", (e) => e.target.value && setSource({ type: "file", path: e.target.value }));
}

function setSource(src) {
  pause();
  S.source = src;
  S.t = 0;
  S.dur = 0;
  mountSource({ keepTime: false });
  renderChat();
}

function renderTransport() {
  drawMarks();
  $("playBtn").innerHTML = S.playing ? ICON.pause : ICON.play;
  $("muteBtn").innerHTML = S.muted ? ICON.mute : ICON.sound;
  renderTime();
}
function renderTime() {
  $("timeText").innerHTML = `${fmt(S.t)} <span>/ ${fmt(S.dur)}</span>`;
}
function pct(t) {
  return S.dur > 0 ? `${Math.max(0, Math.min(100, (t / S.dur) * 100))}%` : "0%";
}
function renderPlayhead() {
  $("playhead").style.left = pct(S.t);
  $("playhead").style.display = S.dur > 0 ? "block" : "none";
  document.querySelectorAll(".block[data-start]").forEach((b) => {
    const a = Number(b.dataset.start);
    b.classList.toggle("here", S.t >= a && S.t < a + Number(b.dataset.dur));
  });
}

function renderTimeline() {
  const dur = S.dur || 0;
  // Ruler
  const stepOptions = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
  const tick = stepOptions.find((s) => dur / s <= 12) ?? 600;
  let ruler = "";
  if (dur > 0) for (let t = 0; t < dur; t += tick) ruler += `<span style="left:${pct(t)}">${fmt(t).replace(/\.0$/, "")}</span>`;
  $("ruler").innerHTML = ruler;

  // Lanes: the scenes, then what's in them, as the composition itself describes it.
  const lanes = [];
  const block = (c, label) =>
    `<div class="block" data-start="${c.start}" data-dur="${c.duration}" style="left:${pct(c.start)};width:calc(${pct(c.duration)} - 2px)" title="${esc(label)} · ${fmt(c.start)}–${fmt(c.start + c.duration)}">${esc(label)}</div>`;
  if (S.source?.type === "live") {
    if (S.scenes.length) lanes.push(`<div class="lane scenes">${S.scenes.map((s) => block(s, s.label || s.id)).join("")}</div>`);
    const byTrack = new Map();
    for (const c of S.clips) {
      if (!(c.duration > 0)) continue;
      const k = c.track ?? 0;
      if (!byTrack.has(k)) byTrack.set(k, []);
      byTrack.get(k).push(c);
    }
    const tracks = [...byTrack.keys()].sort((a, b) => a - b).slice(0, S.scenes.length ? 3 : 4);
    for (const k of tracks) lanes.push(`<div class="lane">${byTrack.get(k).map((c) => block(c, c.label || c.id || c.tagName)).join("")}</div>`);
  } else if (S.source?.type === "file" && dur > 0) {
    lanes.push(`<div class="lane scenes">${block({ start: 0, duration: dur }, base(S.source.path))}</div>`);
  }
  $("lanes").innerHTML = lanes.join("");
  renderPins();
  renderPlayhead();
}

function sourceKey() {
  return S.source ? (S.source.type === "live" ? "live" : S.source.path) : null;
}
function renderPins() {
  const key = sourceKey();
  const pins = S.notes.filter((n) => n.time != null && n.source === key && (key !== "live" || n.entry === S.source.entry) && n.time <= (S.dur || 0) + 0.5);
  $("pins").innerHTML = pins
    .map((n) => `<div class="pin ${n.status === "done" ? "done" : n.status === "queued" || n.status === "preparing" ? "waiting" : ""}" data-note="${n.id}" style="left:${pct(n.time)}" title="${esc(fmt(n.time))}: ${esc(n.text)}"></div>`)
    .join("");
  $("pins").querySelectorAll(".pin").forEach((p) =>
    p.addEventListener("pointerdown", (e) => {
      e.stopPropagation();
      const n = S.notes.find((x) => x.id === p.dataset.note);
      if (n) {
        pause();
        seek(n.time);
        if (n.marks?.length) showMarks(n.marks, n.time);
        document.querySelector(`[data-msg="${n.id}"]`)?.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }),
  );
}

// Click or drag on the timeline to move through the video.
(() => {
  const tl = $("timeline");
  const at = (e) => {
    const r = tl.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * (S.dur || 0);
  };
  tl.addEventListener("pointerdown", (e) => {
    if (!S.dur) return;
    pause();
    S.dragging = true;
    tl.setPointerCapture(e.pointerId);
    seek(at(e), "drag");
  });
  tl.addEventListener("pointermove", (e) => {
    if (!S.dragging) return;
    seek(at(e), "drag");
  });
  const end = (e) => {
    if (!S.dragging) return;
    S.dragging = false;
    seek(at(e));
  };
  tl.addEventListener("pointerup", end);
  tl.addEventListener("pointercancel", end);
})();

// ---- what Claude is doing ----
const STUCK_MS = 3 * 60 * 1000;
function status() {
  const ev = S.session.events ?? [];
  const sum = summarize(ev, Date.now());
  const lastSign = Math.max(sum.last ?? 0, S.session.lastTs ?? 0) || null;
  const quiet = lastSign ? Date.now() - lastSign : null;
  const ours = !!S.run.active;
  if (!S.run.claude && !S.session.id) return { tone: "bad", what: "No AI found", sub: "Install Claude Code or OpenCode, then open this window again." };
  if (ours && !sum.working) return { tone: "work", what: `Starting ${aiName()}…`, clock: since(Date.now() - S.run.active.startedAt), sum };
  if (sum.working) {
    const turnClock = sum.turnStart ? since(Date.now() - sum.turnStart) : null;
    if (sum.running) {
      const t = sum.running;
      const runFor = Date.now() - (t.ts ?? Date.now());
      const out = { tone: "work", icon: t.type, what: t.type === "render" ? `Rendering: ${t.label}` : t.label, clock: since(runFor), sub: turnClock ? `Working for ${turnClock}` : "", sum };
      if (t.type !== "render" && quiet > 5 * 60 * 1000) Object.assign(out, { tone: "warn", sub: `This step has had no news for ${since(quiet)}. It may be stuck.`, stuck: true });
      else if (!ours && quiet > 45 * 1000 && ["write", "run", "render"].includes(t.type))
        out.sub = `${out.sub ? out.sub + ". " : ""}Taking a while? Check your terminal: ${aiName()} may be asking you something.`;
      return out;
    }
    const thinking = ev.length && ev[ev.length - 1].kind === "thinking";
    const out = { tone: "work", what: thinking ? "Thinking…" : "Working…", clock: turnClock, sub: "", sum };
    if (quiet > STUCK_MS) Object.assign(out, { tone: "warn", what: `No news from ${aiName()}`, sub: `Nothing new for ${since(quiet)}. It may be stuck.`, stuck: true });
    return out;
  }
  if (S.run.last && !S.run.last.ok && Date.now() - S.run.last.at < 30 * 60 * 1000)
    return { tone: "bad", what: `${aiName()} stopped`, sub: S.run.last.error || "It ended with an error.", sum };
  if (S.session.id) return { tone: "ok", what: "Waiting for you", sub: "Pause the video where something's wrong and say what to change.", sum };
  return { tone: "idle", what: "Nothing running", sub: "Send a message here, or start Claude Code or OpenCode in this folder in your terminal. This window follows it by itself.", sum };
}

function renderNow() {
  const s = status();
  const card = $("nowCard");
  card.className = `now ${s.tone === "warn" ? "warn" : s.tone === "bad" ? "bad" : ""}`;
  const dot = s.tone === "work" ? (s.icon ? `<span class="spin"></span>` : `<span class="dot work"></span>`) : `<span class="dot ${s.tone}"></span>`;
  card.innerHTML = `<div class="row">${dot}<div class="what">${esc(s.what)}</div>${s.clock ? `<span class="clock">${esc(s.clock)}</span>` : ""}</div>${s.sub ? `<div class="sub">${esc(s.sub)}</div>` : ""}${
    s.stuck && S.run.active ? `<div class="actions"><button class="btn" id="stuckStop">Stop it</button></div>` : ""
  }`;
  $("stuckStop")?.addEventListener("click", stopRun);
  const pill = $("statusPill");
  pill.innerHTML = `<span class="dot ${s.tone === "work" ? "work" : s.tone}"></span><b>${esc(s.tone === "work" ? `${aiName()} is working` : s.what)}</b>${s.clock && s.tone === "work" ? `<span>${esc(s.clock)}</span>` : ""}`;
  return s;
}

function renderTodos(sum) {
  const todos = sum?.todos;
  if (!todos?.length) return ($("todos").innerHTML = "");
  const done = todos.filter((t) => t.status === "completed").length;
  $("todos").innerHTML = `<div class="head"><span>${esc(aiName())}'s plan</span><span>${done} of ${todos.length} done</span></div><div class="bar"><i style="width:${(done / todos.length) * 100}%"></i></div><ul>${todos
    .map((t) => `<li class="${esc(t.status)}"><span class="box">${t.status === "completed" ? "✓" : t.status === "in_progress" ? "›" : "·"}</span><span>${esc(t.text)}</span></li>`)
    .join("")}</ul>`;
}

function renderSteps(sum) {
  const ev = S.session.events ?? [];
  const results = new Map();
  for (const e of ev) if (e.kind === "result") results.set(e.id, e);
  const items = [];
  for (const e of ev) {
    if (e.kind === "prompt") items.push({ turn: true, text: e.text, ts: e.ts });
    else if (e.kind === "tool" && e.name !== "TodoWrite") items.push(e);
  }
  const shown = items.slice(-140);
  const list = $("steps");
  const nearBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 60;
  if (!shown.length) {
    list.innerHTML = `<li class="turn">No steps yet</li>`;
    return;
  }
  const openId = sum?.running?.id;
  list.innerHTML = shown
    .map((e) => {
      if (e.turn) return `<li class="turn" title="${esc(e.text)}">${esc(e.text.length > 60 ? e.text.slice(0, 59) + "…" : e.text)}</li>`;
      const r = results.get(e.id);
      const open = !r && e.id === openId;
      const fail = r && !r.ok;
      const ic = open ? `<span class="spin"></span>` : fail ? ICON.x : r ? ICON[e.type] ?? ICON.run : ICON.wait;
      const dur = r && e.ts && r.ts ? (r.ts - e.ts >= 1000 ? since(r.ts - e.ts) : "") : open ? since(Date.now() - (e.ts ?? Date.now())) : "";
      return `<li class="${open ? "open" : ""} ${fail ? "fail" : ""} ${S.expanded.has(e.id) ? "expanded" : ""}" data-id="${esc(e.id)}" data-ts="${e.ts ?? ""}"><span class="ic">${ic}</span><span class="lbl">${esc(e.label)}</span><span class="dur">${esc(dur)}</span>${
        e.detail ? `<span class="detail">${esc(e.detail)}${fail && r.preview ? `\n\n${esc(r.preview)}` : ""}</span>` : ""
      }</li>`;
    })
    .join("");
  list.querySelectorAll("li[data-id]").forEach((li) =>
    li.addEventListener("click", () => {
      const id = li.dataset.id;
      S.expanded.has(id) ? S.expanded.delete(id) : S.expanded.add(id);
      li.classList.toggle("expanded");
    }),
  );
  if (nearBottom) list.scrollTop = list.scrollHeight;
}

function renderActivity() {
  $("activityTitle").textContent = `What ${aiName()} is doing`;
  const s = renderNow();
  renderTodos(s.sum);
  renderSteps(s.sum);
  renderUsage();
  renderComposer();
}

// ---- what it costs ----
function renderUsage() {
  const ev = S.session.events ?? [];
  let lastPrompt = -1;
  const latest = new Map();
  ev.forEach((e, i) => {
    if (e.kind === "prompt") lastPrompt = i;
    if (e.kind === "usage") latest.set(e.id, { e, i });
  });
  const total = { tokens: 0, cost: 0, known: false };
  const turn = { tokens: 0, cost: 0, known: false };
  for (const { e, i } of latest.values()) {
    for (const t of i > lastPrompt ? [total, turn] : [total]) {
      t.tokens += e.tokens ?? 0;
      if (typeof e.cost === "number") (t.cost += e.cost), (t.known = true);
    }
  }
  const el = $("usage");
  const agent = aiKey();
  const lim = S.run.limit;
  if (!total.tokens && !(agent === "claude" && lim)) return (el.innerHTML = "");
  const model = agent === "opencode" ? modelInfo(S.session.model ?? S.settings.model) : null;
  const money = (t) => (t.known ? ` · <span>${fmtCost(t.cost)}</span>` : "");
  const zero = (t) => (t.known && t.cost === 0 ? "zero" : "");
  let html = `<div class="head">What it costs</div>`;
  if (total.tokens) {
    html += `<div class="row"><span>This chat</span><b class="${zero(total)}">${fmtTokens(total.tokens)} tokens${money(total)}</b></div>`;
    if (turn.tokens && turn.tokens !== total.tokens) html += `<div class="row"><span>Last request</span><b class="${zero(turn)}">${fmtTokens(turn.tokens)} tokens${money(turn)}</b></div>`;
  }
  if (agent === "opencode") {
    const name = model?.name ?? S.session.model ?? S.settings.model ?? "";
    html += `<div class="note">${esc(name)}${model?.local ? ": runs on your computer, so this costs nothing." : model?.free ? ": a free model, so this costs nothing." : model ? `: $${model.input} in / $${model.output} out per million tokens.` : ""}</div>`;
  } else {
    if (lim?.used != null) {
      const label = { five_hour: "5-hour limit", seven_day: "weekly limit", seven_day_opus: "weekly limit" }[lim.window] ?? "plan limit";
      html += `<div class="row"><span>Claude ${esc(label)}</span><b>${lim.used}% used</b></div><div class="meter"><i class="${lim.used >= 80 ? "high" : ""}" style="width:${Math.min(100, lim.used)}%"></i></div>`;
      if (lim.resetsAt) html += `<div class="note">Resets ${new Date(lim.resetsAt).toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" })}.</div>`;
    }
    const api = S.notes.filter((n) => n.usage?.apiPrice && n.sessionId === S.session.id).reduce((a, n) => a + (n.usage.cost ?? 0), 0);
    html += `<div class="note">Included in your Claude plan${api ? `. At API prices, the notes from this window would have cost ${fmtCost(api)}` : ""}.</div>`;
  }
  el.innerHTML = html;
}

// ---- chat ----
function richText(t) {
  return esc(t)
    .split(/\n{2,}/)
    .map((p) => `<p>${p.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>").replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\n/g, "<br>")}</p>`)
    .join("");
}
const NOTE_STATE = {
  preparing: "Taking a picture of that frame…",
  queued: "Waiting: goes in as soon as the AI is free",
  sent: "With Claude",
  done: "Done",
  failed: "Didn't go through",
  unknown: "Sent",
};
function renderChat() {
  const box = $("messages");
  const nearBottom = S.chatToBottom || box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  S.chatToBottom = false;
  const sid = S.session.id;
  const items = [];
  for (const n of S.notes) {
    const mine = sid ? n.sessionId === sid || !n.sessionId : !n.sessionId;
    if (mine || n.status === "queued" || n.status === "preparing") items.push({ ts: n.createdAt, note: n });
  }
  for (const e of S.session.events ?? []) {
    if (e.kind === "text") items.push({ ts: e.ts ?? 0, text: e.text });
    else if (e.kind === "prompt" && !e.fromLite) items.push({ ts: e.ts ?? 0, terminal: e.text });
  }
  items.sort((a, b) => a.ts - b.ts);
  if (!items.length) {
    box.innerHTML = `<div class="chat-empty">Pause the video on the moment you want changed, then write it here, like<br><b>"make this title bigger"</b> or <b>"add a whoosh here"</b>.</div>`;
    return;
  }
  box.innerHTML = items
    .slice(-160)
    .map((it) => {
      if (it.text != null) return `<div class="msg claude"><div class="who">${esc(aiName())}</div>${richText(it.text.length > 3000 ? it.text.slice(0, 3000) + "…" : it.text)}</div>`;
      if (it.terminal != null) return `<div class="msg terminal"><div class="who">You, in the terminal</div>${esc(it.terminal.length > 600 ? it.terminal.slice(0, 600) + "…" : it.terminal)}</div>`;
      const n = it.note;
      const where = n.time != null ? `<span class="at" data-note="${n.id}" data-seek="${n.time}" data-src="${esc(n.source ?? "")}" data-entry="${esc(n.entry ?? "")}">${ICON.wait.replace("<svg", '<svg width="11" height="11"')} ${fmt(n.time)}${n.source && n.source !== "live" ? ` · ${esc(base(n.source))}` : ""}</span>` : "";
      const pic = n.picture ? `<img src="/p/${encPath(n.picture)}" alt="The frame you paused on" data-note="${n.id}" data-seek="${n.time}" data-src="${esc(n.source ?? "")}" data-entry="${esc(n.entry ?? "")}">` : "";
      const state = n.status === "failed" ? `Didn't go through: ${esc(n.error ?? "")}` : n.status === "sent" ? `With ${esc(AI_NAMES[n.agent] ?? aiName())}` : esc(NOTE_STATE[n.status] ?? "");
      const u = n.usage;
      const cost = u
        ? `<span class="cost">· ${fmtTokens(u.tokens)} tokens${u.cost != null ? ` · ${fmtCost(u.cost)}${u.apiPrice ? " at API prices" : ""}` : ""}${u.notes > 1 ? ` for ${u.notes} notes` : ""}</span>`
        : "";
      const icon = n.status === "done" ? ICON.check : n.status === "failed" ? ICON.x : n.status === "sent" ? `<span class="spin"></span>` : ICON.wait;
      const cancel = n.status === "queued" || n.status === "failed" ? ` <button class="link" data-cancel="${n.id}">Remove</button>` : "";
      const now = n.status === "queued" && S.waiting && !S.run.active ? ` <button class="link" data-sendnow="1">Send now</button>` : "";
      return `<div class="msg me ${n.status === "failed" ? "failed" : ""}" data-msg="${n.id}">${where}${pic}<div>${esc(n.text)}</div><div class="state"><span class="ic" style="width:13px;height:13px;display:inline-grid">${icon.replace("<svg", '<svg width="13" height="13"')}</span>${state}${cost}${cancel}${now}</div></div>`;
    })
    .join("");
  box.querySelectorAll("[data-seek]").forEach((el) =>
    el.addEventListener("click", () => {
      const src = el.dataset.src;
      const want = src === "live" ? { type: "live", entry: el.dataset.entry } : src ? { type: "file", path: src } : null;
      const t = Number(el.dataset.seek);
      const marks = S.notes.find((x) => x.id === el.dataset.note)?.marks;
      const circle = () => marks?.length && showMarks(marks, t);
      if (want && (want.type !== S.source?.type || (want.type === "live" ? want.entry !== S.source.entry : want.path !== S.source.path))) {
        if (want.type === "live" && !S.entries.includes(want.entry)) return;
        if (want.type === "file" && !S.videos.some((v) => v.path === want.path)) return;
        setSource(want);
        setTimeout(() => (seek(t), circle()), 600);
      } else {
        pause();
        seek(t);
        circle();
      }
    }),
  );
  box.querySelectorAll("[data-cancel]").forEach((b) => b.addEventListener("click", () => api("/api/cancel", { id: b.dataset.cancel })));
  box.querySelectorAll("[data-sendnow]").forEach((b) => b.addEventListener("click", () => api("/api/send-now", {})));
  if (nearBottom) {
    box.scrollTop = box.scrollHeight;
    // Pictures load after this; keep the newest message in view once they do.
    box.querySelectorAll("img").forEach((img) => img.complete || img.addEventListener("load", () => (box.scrollTop = box.scrollHeight), { once: true }));
  }
}

function renderAtTag() {
  const tag = document.querySelector("#atChip .tag.live-t");
  if (tag) tag.textContent = fmt(S.t);
}
function renderComposer() {
  const chip = $("atChip");
  if (S.source && S.dur > 0) {
    const where = S.source.type === "live" ? "the live preview" : base(S.source.path);
    chip.innerHTML = S.attach
      ? `<span class="tag live-t">${fmt(S.t)}</span><span class="where">${S.playing ? "pauses when you type" : S.marks.length && !S.marksSent ? "with your circle" : `on ${esc(where)}`}</span><span class="spacer"></span><button type="button" class="link" id="detach">Any moment</button>`
      : `<span class="tag off">Any moment</span><span class="spacer"></span><button type="button" class="link" id="attach">Use ${fmt(S.t)}</button>`;
    $("detach")?.addEventListener("click", () => ((S.attach = false), renderComposer()));
    $("attach")?.addEventListener("click", () => ((S.attach = true), renderComposer()));
  } else chip.innerHTML = "";
  const busy = !!S.run.active;
  $("stopBtn").classList.toggle("show", busy);
  $("sendBtn").textContent = busy || S.waiting ? "Add note" : "Send";
  let hint = "";
  if (!S.run.claude) hint = "No AI found on this computer (Claude Code or OpenCode).";
  else if (busy) hint = `${aiName()} is working. New notes go in as soon as it's done.`;
  else if (S.waiting) hint = `${aiName()} is busy in your terminal. Notes go in when it finishes.`;
  else if (!S.session.id) hint = `This starts a new ${aiName()} session in this folder.`;
  $("composerHint").textContent = hint;
}

function renderSessionPick() {
  const sel = $("sessionPick");
  const opts = S.sessions.map(
    (s) => `<option value="${esc(s.agent)}:${esc(s.id)}" ${s.id === S.session.id ? "selected" : ""}>${s.agent === "opencode" ? "OpenCode · " : ""}${esc(s.title.length > 46 ? s.title.slice(0, 45) + "…" : s.title)} · ${ago(s.mtime)}</option>`,
  );
  if (S.session.id && !S.sessions.some((s) => s.id === S.session.id)) opts.unshift(`<option value="${esc(S.session.agent)}:${esc(S.session.id)}" selected>${esc(S.session.title || "This session")}</option>`);
  if (!S.session.id) opts.unshift(`<option value="" selected>New chat</option>`);
  opts.push(`<option value="__new">+ New chat</option>`);
  sel.innerHTML = opts.join("");
}
$("sessionPick").addEventListener("change", (e) => {
  const v = e.target.value;
  if (v === "__new" || !v) return void api("/api/follow", { id: null });
  const i = v.indexOf(":");
  void api("/api/follow", { agent: v.slice(0, i), id: v.slice(i + 1) });
});
$("newChatBtn").addEventListener("click", () => api("/api/follow", { id: null }));

// ---- the AI and model picker ----
function renderAi() {
  const row = $("aiRow");
  const st = S.settings;
  const installed = Object.entries(st.agents ?? {}).filter(([, on]) => on).map(([k]) => k);
  if (!installed.length) return (row.innerHTML = `<label>No AI found: install Claude Code or OpenCode.</label>`);
  const locked = !!S.session.id; // a session goes on with the AI it started with
  const agent = locked ? S.session.agent : st.agent;
  const agentSel = `<select id="agentPick" ${locked || installed.length < 2 ? "disabled" : ""} title="${locked ? "This chat goes on with the AI it started with. Start a new chat to switch." : "Which AI gets your notes"}">${["claude", "opencode"]
    .filter((k) => installed.includes(k) || k === agent)
    .map((k) => `<option value="${k}" ${k === agent ? "selected" : ""}>${k === "claude" ? "Claude Code" : "OpenCode"}</option>`)
    .join("")}</select>`;
  let modelSel = "";
  let why = "";
  if (agent === "opencode") {
    const current = st.model ?? S.session.model;
    const list = st.models.length ? st.models : current ? [{ id: current, name: current }] : [];
    modelSel = `<select id="modelPick" title="The model OpenCode uses for your next note">${list
      .map((m) => `<option value="${esc(m.id)}" ${m.id === current ? "selected" : ""}>${esc(m.name)}${m.local ? " · on this computer" : m.free ? " · free" : m.input != null ? ` · $${m.input}/$${m.output}` : ""}${m.image ? " · sees pictures" : ""}</option>`)
      .join("")}</select>`;
    const m = modelInfo(current);
    if (m?.free) modelSel += `<span class="free">${m.local ? "LOCAL · FREE" : "FREE"}</span>`;
    const w = st.localWarning;
    if (m?.local && w?.model === m.id)
      why = `Ollama gives this model only ${w.context.toLocaleString()} tokens of memory, too few for its instructions. Open Ollama, Settings, and set Context length to 32k or more, then send again.`;
    else if (m?.local) why = "Runs on your computer: free and private, but slower. Circle what you mean: it tells the model the exact line to change.";
    else if (m && !m.image) why = "This model can't see pictures: it gets the exact second, not the frame.";
  }
  row.innerHTML = `<label>AI</label>${agentSel}${modelSel}${why ? `<span class="why">${esc(why)}</span>` : ""}`;
  $("agentPick")?.addEventListener("change", (e) => api("/api/settings", { agent: e.target.value }));
  $("modelPick")?.addEventListener("change", (e) => api("/api/settings", { model: e.target.value }));
}

// ---- sending ----
async function sendNote(text, { anyMoment = false } = {}) {
  text = text.trim();
  if (!text) return;
  if (S.playing) pause();
  const body = { text };
  const circled = !anyMoment && S.attach && S.marks.length > 0;
  if (!anyMoment && S.attach && S.source && S.dur > 0) {
    body.time = Math.round(S.t * 1000) / 1000;
    if (S.source.type === "live") Object.assign(body, { source: "live", entry: S.source.entry });
    else body.source = S.source.path;
    if (circled) {
      body.region = marksBox();
      body.marks = S.marks;
      if (S.source.type === "live") body.inside = insideCircle(body.region);
    }
    // With a circle, or from a video file, the picture is made here; a plain live frame is taken by the tool.
    if (circled || S.source.type === "file") {
      $("composerHint").textContent = "Taking the picture of that frame…";
      body.picture = await composePicture();
    }
  }
  S.chatToBottom = true;
  const r = await api("/api/note", body);
  if (r.error) toast(r.error);
  // The circle stays on the frame while the AI works, so you see the change land in it.
  else if (circled) showMarks(S.marks, S.marksAt);
  renderComposer();
}
$("composer").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = $("input").value;
  $("input").value = "";
  void sendNote(v);
});
$("input").addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    $("composer").requestSubmit();
  }
});
$("input").addEventListener("focus", () => S.playing && pause());
$("input").addEventListener("input", () => S.marks.length && !S.marksSent && prefetchFrame());
$("renderBtn").addEventListener("click", () => sendNote("Render the final video now.", { anyMoment: true }));
function stopRun() {
  void api("/api/stop", {});
}
$("stopBtn").addEventListener("click", stopRun);

// ---- transport buttons and keys ----
$("playBtn").addEventListener("click", () => (S.playing ? pause() : play()));
$("backBtn").innerHTML = ICON.back;
$("fwdBtn").innerHTML = ICON.fwd;
$("reloadBtn").innerHTML = ICON.reload;
$("backBtn").addEventListener("click", () => step(-1));
$("fwdBtn").addEventListener("click", () => step(1));
$("reloadBtn").addEventListener("click", () => mountSource());
$("muteBtn").addEventListener("click", () => {
  S.muted = !S.muted;
  if (S.video) S.video.muted = S.muted;
  control("set-muted", { muted: S.muted });
  renderTransport();
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest?.("textarea, input, select")) return;
  if (e.key === " ") {
    e.preventDefault();
    S.playing ? pause() : play();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    e.shiftKey ? (pause(), seek(S.t - 1)) : step(-1);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    e.shiftKey ? (pause(), seek(S.t + 1)) : step(1);
  }
});

// ======================================================================
// Start, and stay up to date
// ======================================================================
function applyProject(p) {
  const before = new Map(S.videos.map((v) => [v.path, v.mtime]));
  S.entries = p.entries ?? [];
  S.entryInfo = p.entryInfo ?? {};
  S.videos = p.videos ?? [];
  return S.videos.find((v) => !before.has(v.path) || before.get(v.path) < v.mtime);
}

async function load() {
  const st = await api("/api/state");
  if (st.error) {
    $("empty").innerHTML = `<div><b>Can't reach the tool</b>${esc(st.error)}</div>`;
    return;
  }
  S.folder = st.folder;
  $("folder").textContent = st.folder;
  $("folder").title = st.root;
  document.title = `${st.folder} · Final Phase Lite`;
  applyProject(st);
  S.sessions = st.sessions;
  S.session = st.session;
  S.run = st.run;
  S.notes = st.notes;
  S.settings = st.settings ?? S.settings;
  S.chatToBottom = true;
  if (!S.source || (S.source.type === "live" && !S.entries.includes(S.source.entry)) || (S.source.type === "file" && !S.videos.some((v) => v.path === S.source.path))) {
    S.source = S.entries.length ? { type: "live", entry: S.entries[0] } : S.videos.length ? { type: "file", path: S.videos[0].path } : null;
    mountSource({ keepTime: false });
  } else renderSources();
  renderSessionPick();
  renderAi();
  renderActivity();
  renderChat();
}

function connect() {
  const es = new EventSource(`/api/events?t=${TOKEN}`);
  let dropped = false;
  es.onerror = () => (dropped = true);
  es.onopen = () => dropped && ((dropped = false), void load());
  es.addEventListener("session", (m) => {
    S.session = JSON.parse(m.data);
    S.waiting = false;
    renderSessionPick();
    renderAi();
    renderActivity();
    renderChat();
  });
  es.addEventListener("events", (m) => {
    const d = JSON.parse(m.data);
    if (d.id !== S.session.id) return;
    S.session.events.push(...d.events);
    if (S.session.events.length > 1500) S.session.events.splice(0, S.session.events.length - 1500);
    S.session.lastTs = d.lastTs;
    if (d.title) S.session.title = d.title;
    if (d.events.some((e) => e.kind === "turn-end")) S.waiting = false;
    renderActivity();
    if (d.events.some((e) => e.kind === "text" || e.kind === "prompt")) renderChat();
  });
  es.addEventListener("sessions", (m) => {
    S.sessions = JSON.parse(m.data);
    renderSessionPick();
  });
  es.addEventListener("run", (m) => {
    S.run = JSON.parse(m.data);
    if (S.run.active) S.waiting = false;
    renderActivity();
  });
  es.addEventListener("notes", (m) => {
    S.notes = JSON.parse(m.data);
    renderChat();
    renderPins();
    renderUsage();
  });
  es.addEventListener("settings", (m) => {
    S.settings = JSON.parse(m.data);
    renderAi();
    renderActivity();
  });
  es.addEventListener("waiting", () => {
    S.waiting = true;
    renderComposer();
    renderChat();
  });
  es.addEventListener("project", (m) => {
    const fresh = applyProject(JSON.parse(m.data));
    renderSources();
    if (!S.source && (S.entries.length || S.videos.length)) {
      S.source = S.entries.length ? { type: "live", entry: S.entries[0] } : { type: "file", path: S.videos[0].path };
      mountSource({ keepTime: false });
    } else if (fresh && !(S.source?.type === "file" && S.source.path === fresh.path)) {
      toast(`New render: ${base(fresh.path)}`, "Watch it", () => setSource({ type: "file", path: fresh.path }), 30000);
    } else if (fresh && S.source?.type === "file" && S.source.path === fresh.path) {
      mountSource();
      flash("The render was updated");
    }
  });
  es.addEventListener("files", (m) => onFilesChanged(JSON.parse(m.data).changed));
}

renderTransport();
await load();
connect();
setInterval(() => {
  renderNow();
  document.querySelectorAll(".steps li.open").forEach((li) => {
    const d = li.querySelector(".dur");
    if (d && li.dataset.ts) d.textContent = since(Date.now() - Number(li.dataset.ts));
  });
}, 1000);
