// Style guide UI (one page per channel guide). All user and Claude text goes in through textContent, never innerHTML.
"use strict";
let G = null, TAB = "guide", POLL = null;
const $ = (s) => document.querySelector(s);

function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "on") for (const [ev, f] of Object.entries(v)) e.addEventListener(ev, f);
    else if (k === "text") e.textContent = v;
    else if (v !== false && v != null) e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of kids.flat()) if (c != null) e.append(c);
  return e;
}

function say(text, ms = 5000) {
  const m = $("#msg"); m.textContent = text; m.hidden = !text;
  clearTimeout(say.t); if (text && ms) say.t = setTimeout(() => (m.hidden = true), ms);
}

async function api(path, body) {
  const r = await fetch(path, body === undefined ? {} : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || r.statusText); e.code = r.status; throw e; }
  return j;
}

// Which channel this page edits (Farrell, Nocturn...). Old guide files have no meta and are Farrell.
const NAME = () => (G && G.meta && G.meta.name) || "Farrell";
function brand() {
  const n = NAME(); document.title = n.toUpperCase() + " Style Guide";
  const b = document.querySelector(".brand"); if (b && b.firstChild) b.firstChild.textContent = n.toUpperCase() + " ";
  const f = document.querySelector('label[for="ffit"], #ffit')?.closest("label"); if (f && f.firstChild) f.firstChild.textContent = "Fits " + n;
  const c = document.querySelector("#fclips > summary"); if (c) c.textContent = "Add a clip from the " + n + " board";
}

async function load() { G = await api("/api/guide"); brand(); render(); watchRun(); }

// Every edit: mutate a copy, save, re-render from the server's answer. A 409 means another tab saved first.
async function commit(mutate) {
  const g = structuredClone(G); mutate(g);
  try { G = await api("/api/guide", g); render(); say("Saved · " + NAME().toUpperCase() + "_STYLE_GUIDE.md updated", 1800); return true; }
  catch (e) { if (e.code === 409) { say("The guide changed elsewhere. Reloaded; please redo the edit."); await load(); } else say("Not saved: " + e.message, 0); return false; }
}

const newId = (p) => p + "-" + crypto.getRandomValues(new Uint32Array(1))[0].toString(16).padStart(8, "0");
const catOf = (g, id) => g.categories.find((c) => c.id === id);

// Click to edit. Enter (or leaving the field) saves, Esc cancels, Shift+Enter is a line break.
function editable(node, text, onSave, { multiline = false } = {}) {
  node.textContent = text;
  node.addEventListener("click", () => {
    if (node.isContentEditable) return;
    node.contentEditable = "true"; node.focus();
    let done = false;
    const end = (save) => {
      if (done) return; done = true; node.contentEditable = "false";
      const v = node.innerText.trim();
      if (save && v !== text) { if (!v && !multiline) { node.textContent = text; return say("Empty text not saved. Use × to delete."); } onSave(v); }
      else node.textContent = text;
    };
    node.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); end(true); }
      else if (e.key === "Escape") { e.preventDefault(); end(false); }
    };
    node.onblur = () => end(true);
  });
  return node;
}

// ------------------------------------------------------------------ views
function render() {
  $("#meta").textContent = `rev ${G.rev} · ${G.saved.replace("T", " ")}`;
  document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === TAB));
  const open = G.learnings.filter((l) => l.status === "open").length;
  document.querySelector('#tabs [data-tab="learnings"]').textContent = open ? `Learnings (${open})` : "Learnings";
  const v = $("#view"); v.replaceChildren(); $("#toc").replaceChildren();
  ({ guide: viewGuide, graphics: viewGraphics, rulebook: viewRulebook, learnings: viewLearnings, updates: viewUpdates })[TAB](v);
}

// One rule or rule-book entry: bold title, click-to-edit text, buttons, then its board clips and your screenshots/videos.
function ruleRow(it, side, onSave, edit) {
  const ex = [...(it.evidence || []).map(thumb), ...(it.media || []).map(mediaThumb)];
  const learn = ex.length ? el("button", { text: "Learn", title: "Claude looks at these examples and refines this rule (and related ones)", on: { click: () => learnFrom(it.id) } }) : null;
  return el("li", { class: "rule" },
    el("div", {}, it.title ? el("div", { class: "ti", text: it.title, title: "Edit title and examples", on: { click: edit } }) : null,
      editable(el("div", { class: "t" }), it.text, onSave)),
    el("div", { class: "side" }, side[0], el("button", { text: "✎", title: "Edit title, text and examples", on: { click: edit } }), learn, side.slice(1)),
    ex.length ? el("div", { class: "ev" }, ex) : null);
}

async function learnFrom(id) {
  try { await api("/api/learn", { id }); await load(); say("Claude is looking at the examples. It takes 1–3 minutes; the guide reloads when it is done.", 6000); }
  catch (e) { say("Learn did not start: " + e.message, 0); }
}

function viewGuide(v) {
  $("#toc").append(el("a", { href: "#rb-top", text: "Rule book", on: { click: (e) => { e.preventDefault(); setTab("rulebook"); } } }));
  G.categories.forEach((c, i) => {
    $("#toc").append(el("a", { href: "#" + c.id }, el("b", { text: String(i + 1).padStart(2, "0") }), c.name));
    const list = el("ul", { class: "rules" });
    for (const r of c.rules) {
      list.append(ruleRow(r, [
        el("span", { class: "tag" + (r.source === "user" ? " user" : ""), text: r.source === "user" ? "you" : "refs", title: r.source === "user" ? "Set by you" : "Learned from the references" }),
        el("button", { text: "×", title: "Delete rule", on: { click: () => confirm(`Delete this rule?\n\n${r.text}`) && commit((g) => { const cc = catOf(g, c.id); cc.rules = cc.rules.filter((x) => x.id !== r.id); }) } }),
      ], (t) => commit((g) => { catOf(g, c.id).rules.find((x) => x.id === r.id).text = t; }), () => openForm({ cat: c.id, item: r })));
    }
    v.append(el("div", { class: "cat", id: c.id },
      el("h2", {}, el("span", { class: "n", text: String(i + 1).padStart(2, "0") }), c.name),
      editable(el("p", { class: "summary" }), c.summary, (t) => commit((g) => { catOf(g, c.id).summary = t; }), { multiline: true }),
      list,
      el("button", { class: "add", text: "+ rule", on: { click: () => openForm({ cat: c.id }) } })));
  });
}

function thumb(e) {
  const img = el("img", { src: `/poster?clip=${encodeURIComponent(e.clip)}`, loading: "lazy", alt: "" });
  const box = el("div", { class: "thumb", title: "Play this clip" }, img, el("div", { text: e.label || e.clip }));
  img.onerror = () => img.replaceWith(el("div", { class: "ph", text: "clip not on board" }));
  box.onclick = () => play(e);
  return box;
}

function mediaThumb(m) {
  const src = `/media/${encodeURIComponent(m.file)}`;
  const pic = m.kind === "image" ? el("img", { src, loading: "lazy", alt: "" }) : el("video", { src: src + "#t=0.5", muted: true, preload: "metadata" });
  pic.onerror = () => pic.replaceWith(el("div", { class: "ph", text: "file missing" }));
  return el("div", { class: "thumb", title: m.kind === "image" ? "Open screenshot" : "Play video", on: { click: () => showMedia(m) } },
    pic, el("div", { text: (m.kind === "video" ? "▶ " : "") + (m.name || m.file) }));
}

// ------------------------------------------------------------------ motion graphics: what each looks like and when to use it
let GQ = "";
const gfxOf = (g, id) => (g.graphics || []).find((x) => x.id === id);
const words = (s) => s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);

// The "narration does X" groups, in order (same list as SITUATIONS in model.py).
const SITS = ["Show the real page, post or document", "Read a quote, comment or message", "Name a place or move to a new place",
  "Give a date or time", "Introduce a person or account", "Show a video in its context (platform, CCTV, phone, file)",
  "Point at a detail", "Stress a number, fact or outcome", "Compare or show many things", "Open a section or chapter",
  "Something breaks, goes wrong or feels uncanny", "Credit, warn or disclose", "Hide or censor something", "Move between shots"];
const fitRank = (x) => { const f = (x.fit || "").trim().toLowerCase(); return f === "yes" ? 0 : f.startsWith("adapt") ? 1 : f.startsWith("no") ? 2 : 3; };
const sitRank = (x) => { const i = SITS.indexOf(x.situation); return i < 0 ? SITS.length : i; };
const gfxOrder = (a, b) => sitRank(a) - sitRank(b) || fitRank(a) - fitRank(b) || (a.source !== "user") - (b.source !== "user");
const fitTag = (x) => { const r = fitRank(x); return r === 3 ? null :
  el("span", { class: "tag fit f" + r, text: ["fits", "adapt", "no fit"][r], title: "Fits " + NAME() + ": " + x.fit }); };

// How well a graphic fits a situation: query words found in "use it when" or the situation count double.
function gfxScore(x, q) {
  const use = [x.use, x.situation].join(" ").toLowerCase(), rest = [x.title, x.kind, x.text, x.why].join(" ").toLowerCase();
  return words(q).reduce((n, w) => n + (use.includes(w) ? 2 : 0) + (rest.includes(w) ? 1 : 0), 0);
}

function gfxField(x, key, label, empty) {
  return el("div", { class: "gf" }, el("span", { class: "gl", text: label }),
    editable(el("div", { class: "t" + (x[key] ? "" : " empty"), "data-empty": empty }), x[key] || "",
      (t) => commit((g) => { const y = gfxOf(g, x.id); if (t || key === "use") y[key] = t; else delete y[key]; }),
      { multiline: key !== "text" }));
}

function viewGraphics(v) {
  const gs = G.graphics || [];
  v.append(el("p", { class: "lead", id: "gfx-top", text: "Every motion graphic " + NAME() + " uses: how it looks and when to use it. Type what is happening in the edit to find the right one." }),
    editable(el("p", { class: "summary" }), G.graphics_summary || "", (t) => commit((g) => { g.graphics_summary = t; }), { multiline: true }));
  const q = el("input", { id: "gq", value: GQ, placeholder: "What is happening? e.g. narration names a city / reads a comment / says a year", autocomplete: "off" });
  const table = el("table", { class: "gwhen" }), list = el("ul", { class: "rules gfx" });
  const draw = () => {
    const order = gs.map((x, i) => ({ x, i, s: GQ ? gfxScore(x, GQ) : 0 }))
      .sort((a, b) => b.s - a.s || (GQ ? fitRank(a.x) - fitRank(b.x) : gfxOrder(a.x, b.x)) || a.i - b.i).filter((o) => !GQ || o.s > 0);
    const rows = []; let prev = null;
    for (const [k, { x }] of order.entries()) {
      const s = x.situation || "Other";
      if (!GQ && s !== prev) rows.push(el("tr", { class: "sit" }, el("td", { colspan: 4, text: "Narration: " + s })));
      prev = s;
      rows.push(el("tr", { class: (GQ && k === 0 ? "best " : "") + "f" + fitRank(x), on: { click: () => document.getElementById(x.id)?.scrollIntoView({ block: "start" }) } },
        el("td", { text: x.title }), el("td", { text: x.use || "—" }), el("td", { text: x.why || "—" }), el("td", {}, fitTag(x))));
    }
    table.replaceChildren(el("tr", {}, el("th", { text: "Graphic" }), el("th", { text: "Use it when" }), el("th", { text: "Why" }), el("th", { text: "Fits" })), ...rows);
    if (GQ && !order.length) table.append(el("tr", {}, el("td", { colspan: 4, class: "dim", text: "No graphic matches. Try other words, or add one with + graphic." })));
    list.replaceChildren(...order.map(({ x }) => gfxRow(x)));
  };
  q.addEventListener("input", () => { GQ = q.value.trim(); draw(); });
  draw();
  const toc = []; let ps = null;
  for (const x of [...gs].sort(gfxOrder)) {
    if ((x.situation || "Other") !== ps) toc.push(el("div", { class: "sh", text: (ps = x.situation || "Other") }));
    toc.push(el("a", { href: "#" + x.id, class: fitRank(x) === 2 ? "nofit" : null, text: x.title }));
  }
  $("#toc").append(...toc);
  v.append(q, table, list, el("button", { class: "add", text: "+ graphic", on: { click: () => openForm({ gfx: true }) } }));
  if (!gs.length) v.append(el("p", { class: "dim", text: "No motion graphics yet. Add one, or write a note below and press Update." }));
}

function gfxRow(x) {
  const ex = [...(x.evidence || []).map(thumb), ...(x.media || []).map(mediaThumb)];
  const edit = () => openForm({ gfx: true, item: x });
  return el("li", { class: "rule g", id: x.id },
    el("div", {}, el("div", { class: "ti", text: x.title, title: "Edit", on: { click: edit } }),
      x.situation ? el("div", { class: "dim sit1", text: "Narration: " + x.situation }) : null,
      gfxField(x, "use", "Use it when", "Click to say when to use it"),
      gfxField(x, "why", "Why", "Click to say what it does for the viewer"),
      gfxField(x, "avoid", "Not when", "Click to say when not to use it"),
      gfxField(x, "fit", "Fits " + NAME(), "yes / adapt: change / no: rule it breaks"),
      gfxField(x, "text", "Looks like", "")),
    el("div", { class: "side" },
      fitTag(x),
      x.kind ? el("span", { class: "tag", text: x.kind }) : null,
      el("span", { class: "tag" + (x.source === "user" ? " user" : ""), text: x.source === "user" ? "you" : "refs" }),
      el("button", { text: "✎", title: "Edit title, text, situations and examples", on: { click: edit } }),
      ex.length ? el("button", { text: "Learn", title: "Claude looks at these examples and refines this graphic", on: { click: () => learnFrom(x.id) } }) : null,
      el("button", { text: "×", title: "Delete graphic", on: { click: () => confirm(`Delete this graphic?\n\n${x.title}`) && commit((g) => { g.graphics = g.graphics.filter((y) => y.id !== x.id); }) } })),
    ex.length ? el("div", { class: "ev" }, ex) : null);
}

function viewRulebook(v) {
  v.append(el("p", { class: "lead", id: "rb-top", text: "Fixed rules. Every " + NAME() + " edit follows all of them, every time. Claude changes them only when your note asks." }));
  const ol = el("ol", { class: "rules" });
  for (const b of G.rulebook) {
    ol.append(ruleRow(b, [
      el("span", { class: "tag", text: b.since || "", title: "From: " + (b.from || "") }),
      el("button", { text: "×", title: "Delete", on: { click: () => confirm(`Remove from the rule book?\n\n${b.text}`) && commit((g) => { g.rulebook = g.rulebook.filter((x) => x.id !== b.id); }) } }),
    ], (t) => commit((g) => { g.rulebook.find((x) => x.id === b.id).text = t; }), () => openForm({ item: b })));
  }
  v.append(ol, el("button", { class: "add", text: "+ rule", on: { click: () => openForm({}) } }));
}

// ------------------------------------------------------------------ add / edit form (in the page, no browser prompt)
// F: what the open form edits. cat = category id (absent = rule book), item = existing rule (absent = new).
let F = null, CLIPS = null;
const GFX_FORM = ["use", "why", "avoid", "kind", "situation", "fit"];   // form inputs #fuse, #fwhy ...; "use" is never removed
const MAX_FILE = 1 << 30;

function openForm({ cat, item, gfx }) {
  F = { cat, gfx: !!gfx, id: item ? item.id : null, media: structuredClone(item?.media || []), evidence: structuredClone(item?.evidence || []), up: new Set() };
  $("#fhead").textContent = (item ? "Edit " : "New ") + (gfx ? "motion graphic" : cat ? "rule · " + catOf(G, cat).name : "rule book rule");
  $("#fgfx").hidden = !gfx; $("#ftextlbl").textContent = gfx ? "Looks like (how to build it)" : "What it is";
  for (const k of GFX_FORM) $("#f" + k).value = item?.[k] || "";
  if (!$("#fsits").children.length) $("#fsits").append(...SITS.map((t) => el("option", { value: t })));
  $("#ftitle").value = item?.title || ""; $("#ftext").value = item?.text || "";
  $("#fq").value = ""; $("#fclips").open = false; $("#fmsg").textContent = "";
  drawChips(); $("#form").showModal(); $("#ftitle").focus();
}

function closeForm() { if (F) for (const x of F.up) x.abort(); F = null; $("#form").close(); }

function drawChips() {
  const busy = F.up.size > 0, has = F.media.length + F.evidence.length > 0;
  const chip = (pic, name, drop) => el("div", { class: "chip" }, pic, el("span", { text: name }), el("button", { type: "button", text: "×", title: "Remove", on: { click: drop } }));
  $("#fchips").replaceChildren(
    ...F.evidence.map((e) => chip(el("img", { src: `/poster?clip=${encodeURIComponent(e.clip)}`, alt: "" }), "board · " + (e.label || e.clip),
      () => { F.evidence = F.evidence.filter((x) => x !== e); drawChips(); })),
    ...F.media.map((m) => chip(m.kind === "image" ? el("img", { src: `/media/${encodeURIComponent(m.file)}`, alt: "" })
      : el("video", { src: `/media/${encodeURIComponent(m.file)}#t=0.5`, muted: true, preload: "metadata" }), m.name || m.file,
      () => { F.media = F.media.filter((x) => x !== m); drawChips(); })),
    ...[...F.up].map((x) => el("div", { class: "chip up" }, el("div", { class: "ph", text: x.pct + "%" }), el("span", { text: x.name }),
      el("button", { type: "button", text: "×", title: "Stop upload", on: { click: () => { x.abort(); } } }))));
  $("#fsave").disabled = $("#flearn").disabled = busy;
  if (!has) $("#flearn").disabled = true;
  $("#flearn").title = has ? "Save, then Claude looks at the examples and refines the guide" : "Add a screenshot, video or board clip first";
  $("#fmsg").textContent = busy ? `Uploading ${F.up.size} file(s)…` : "";
}

function addFiles(files) {
  for (const file of files) {
    const ok = /^(image|video)\//.test(file.type) || /\.(png|jpe?g|webp|gif|mp4|mov|webm|m4v)$/i.test(file.name);
    if (!ok) { say(`${file.name}: only images and videos can be added.`); continue; }
    if (file.size > MAX_FILE) { say(`${file.name} is over 1 GB.`); continue; }
    const xhr = new XMLHttpRequest(), form = F;
    xhr.name = file.name || "pasted.png"; xhr.pct = 0;
    xhr.open("POST", "/api/media");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.setRequestHeader("X-Name", encodeURIComponent(xhr.name));
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) { xhr.pct = Math.round(100 * e.loaded / e.total); if (F === form) drawChips(); } };
    xhr.onloadend = () => {
      form.up.delete(xhr);
      let j = {}; try { j = JSON.parse(xhr.responseText); } catch (_) {}
      if (xhr.status === 200) form.media.push(j);
      else if (xhr.status) say(`${xhr.name}: ${j.error || "upload failed"}`, 0);
      if (F === form) drawChips();
    };
    F.up.add(xhr); xhr.send(file);
  }
  drawChips();
}

async function drawClipList() {
  if (!CLIPS) { $("#fclist").replaceChildren(el("div", { class: "dim", text: "Loading board clips…" }));
    try { CLIPS = await api("/api/clips"); } catch (e) { return $("#fclist").replaceChildren(el("div", { class: "dim", text: "Board not readable: " + e.message })); } }
  const words = $("#fq").value.toLowerCase().split(/\s+/).filter(Boolean);
  const hits = CLIPS.filter((c) => { const h = [c.label, c.note, c.prod, ...c.tags].join(" ").toLowerCase(); return words.every((w) => h.includes(w)); });
  $("#fclist").replaceChildren(...hits.slice(0, 60).map((c) => el("div", { class: "pick", title: c.note || c.label, on: { click: () => {
      if (!F.evidence.some((e) => e.clip === c.id)) F.evidence.push({ clip: c.id, prod: c.prod, src: c.src, sf_in: c.sf_in, sf_out: c.sf_out, label: c.label });
      drawChips(); } } },
    el("img", { src: `/poster?clip=${encodeURIComponent(c.id)}`, loading: "lazy", alt: "" }), el("span", { text: c.label }), el("span", { class: "dim", text: c.tags.filter((t) => t !== "claude").join(" ") }))),
    hits.length > 60 ? el("div", { class: "dim", text: `${hits.length - 60} more: type to narrow down` }) : null, hits.length ? null : el("div", { class: "dim", text: "No clip matches." }));
}

async function saveForm(learn) {
  if (!F || F.up.size) return;
  const title = $("#ftitle").value.trim(), text = $("#ftext").value.trim() || title;
  if (!text) { $("#fmsg").textContent = "Write a title or a description first."; return $("#ftitle").focus(); }
  if (F.gfx && !title) { $("#fmsg").textContent = "A motion graphic needs a title."; return $("#ftitle").focus(); }
  if (learn && !F.media.length && !F.evidence.length) return;
  const f = F, id = f.id || newId(f.gfx ? "g" : f.cat ? "r" : "b");
  const gx = Object.fromEntries(GFX_FORM.map((k) => [k, $("#f" + k).value.trim()]));
  const fill = (it) => { it.text = text;
    if (f.gfx) { it.use = gx.use; for (const k of GFX_FORM.slice(1)) { if (gx[k]) it[k] = gx[k]; else delete it[k]; } } if (title) it.title = title; else delete it.title; it.evidence = f.evidence; if (f.media.length) it.media = f.media; else delete it.media; return it; };
  const ok = await commit((g) => {
    const list = f.gfx ? (g.graphics = g.graphics || []) : f.cat ? catOf(g, f.cat).rules : g.rulebook, old = list.find((x) => x.id === id);
    if (old) fill(old);
    else list.push(fill(f.cat || f.gfx ? { id, source: "user" } : { id, since: new Date().toISOString().slice(0, 10), from: "user" }));
  });
  if (!ok) return;
  F = null; $("#form").close();
  if (learn) learnFrom(id);
}

function viewLearnings(v) {
  v.append(el("p", { class: "lead", text: "What each Update taught. Open ones are not rules yet: promote the good ones." }));
  const list = [...G.learnings].reverse();
  if (!list.length) v.append(el("p", { class: "dim", text: "No learnings yet. Write a note below and press Update." }));
  for (const l of list) {
    const row = el("div", { class: "row" }, el("span", { class: "st " + l.status, text: l.status === "open" ? "open" : "→ " + l.status }), el("span", { class: "dim", text: l.date }));
    if (l.status === "open") {
      const sel = el("select", {}, G.categories.map((c) => el("option", { value: c.id, text: c.name })));
      const go = (to) => api("/api/promote", { id: l.id, to, cat: sel.value }).then((g) => { G = g; render(); say("Promoted", 1500); }).catch((e) => say(e.message, 0));
      row.append(sel, el("button", { text: "→ Guide", on: { click: () => go("guide") } }), el("button", { text: "→ Rule book", on: { click: () => go("rulebook") } }),
        el("button", { text: "×", title: "Dismiss", on: { click: () => confirm("Delete this learning?") && commit((g) => { g.learnings = g.learnings.filter((x) => x.id !== l.id); }) } }));
    }
    v.append(el("div", { class: "card" }, el("div", { text: l.text }), l.note ? el("div", { class: "dim", text: "Your note: " + l.note }) : null, row));
  }
}

function viewUpdates(v) {
  v.append(el("p", { class: "lead", text: "Every Update run, newest first. Undo puts the guide back to how it was before that run (only the newest finished run)." }));
  const done = G.updates.filter((u) => u.status === "done"), last = done.length ? done[done.length - 1].id : null;
  if (!G.updates.length) v.append(el("p", { class: "dim", text: "No updates yet." }));
  for (const u of [...G.updates].reverse()) {
    const row = el("div", { class: "row" }, el("span", { class: "st " + u.status, text: u.status }), el("span", { class: "dim", text: u.date }));
    if (u.id === last) row.append(el("button", { text: "Undo", on: { click: () => confirm("Undo this update? Edits made after it are also rolled back.") &&
      api("/api/undo", { id: u.id }).then((g) => { G = g; render(); say("Undone", 1500); }).catch((e) => say(e.message, 0)) } }));
    v.append(el("div", { class: "card" }, el("div", { text: u.note }), u.summary ? el("div", { class: "dim", text: u.summary }) : null,
      u.error ? el("div", { class: "st failed", text: u.error }) : null,
      u.changes && u.changes.length ? el("ul", { class: "changes" }, u.changes.map((c) => el("li", { text: c }))) : null, row));
  }
}

function setTab(t) { TAB = t; try { localStorage.setItem("sg-tab", t); } catch (_) {} render(); scrollTo(0, 0); }

// ------------------------------------------------------------------ Update button
async function startUpdate() {
  const note = $("#note").value.trim(); if (!note) return say("Write a note first.");
  try { await api("/api/update", { note }); $("#note").value = ""; await load(); }
  catch (e) { say(e.message, 0); }
}

function watchRun() {
  const run = G.updates.find((u) => u.status === "running");
  $("#go").disabled = !!run;
  const last = G.updates[G.updates.length - 1];
  $("#run").textContent = run ? `Claude is updating the guide… (${run.note.slice(0, 80)})`
    : last ? `Last update ${last.date}: ${last.status}${last.status === "failed" ? " · " + last.error : last.summary ? " · " + last.summary : ""}` : "";
  clearTimeout(POLL);
  if (run) POLL = setTimeout(async () => { const u = await api(`/api/update?id=${run.id}`).catch(() => run);
    if (u.status !== "running") { await load(); say(u.status === "done" ? "Update done. See the Updates tab." : "Update failed: " + u.error, 0); } else watchRun(); }, 2000);
}

// ------------------------------------------------------------------ clip player (stops at sf_out by frame, not timeupdate)
let PL = null;
async function play(e) {
  let c; try { c = await api(`/api/clip?id=${encodeURIComponent(e.clip)}`); } catch (_) { return say("That clip is no longer on the board."); }
  const fps = c.fps[0] / c.fps[1], v = $("#vid"), tin = (c.sf_in + 0.5) / fps, tout = (c.sf_out + 0.5) / fps;
  PL = { tin, tout }; $("#plabel").textContent = `${e.label || c.title || c.id} · frames ${c.sf_in}–${c.sf_out}`;
  $("#pimg").hidden = true; v.hidden = false; v.controls = false; v.loop = false;
  $("#player").hidden = false;
  v.src = `/video?clip=${encodeURIComponent(c.id)}`;
  v.onloadedmetadata = () => { v.currentTime = tin; v.play().catch(() => {}); };
  const tick = (_, m) => { if (!PL || v.src === "") return;
    if (m.mediaTime + 0.5 / fps >= tout) v.currentTime = PL.tin;      // loop inside the clip, never past sf_out
    v.requestVideoFrameCallback(tick); };
  v.requestVideoFrameCallback(tick);
}
// Your own screenshot or video: shown whole, with normal controls.
function showMedia(m) {
  closePlayer(); const v = $("#vid"), src = `/media/${encodeURIComponent(m.file)}`;
  $("#plabel").textContent = m.name || m.file; $("#pimg").hidden = m.kind !== "image"; v.hidden = m.kind === "image";
  if (m.kind === "image") $("#pimg").src = src;
  else { v.onloadedmetadata = null; v.controls = true; v.loop = true; v.src = src; v.play().catch(() => {}); }
  $("#player").hidden = false;
}
function closePlayer() { PL = null; const v = $("#vid"); v.pause(); v.onloadedmetadata = null; v.removeAttribute("src"); v.load(); $("#pimg").removeAttribute("src"); $("#player").hidden = true; }

// ------------------------------------------------------------------ wiring
document.querySelectorAll("#tabs button").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
$("#go").addEventListener("click", startUpdate);
$("#note").addEventListener("keydown", (e) => { if (e.key === "Enter" && e.ctrlKey) startUpdate(); });
$("#pclose").addEventListener("click", closePlayer);
$("#player").addEventListener("click", (e) => { if (e.target.id === "player") closePlayer(); });
$("#pmute").addEventListener("click", () => { const v = $("#vid"); v.muted = !v.muted; $("#pmute").textContent = v.muted ? "Sound off" : "Sound on"; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#player").hidden) closePlayer(); });
$("#fcancel").addEventListener("click", closeForm);
$("#form").addEventListener("cancel", (e) => { e.preventDefault(); closeForm(); });
$("#fsave").addEventListener("click", () => saveForm(false));
$("#flearn").addEventListener("click", () => saveForm(true));
$("#fbrowse").addEventListener("click", () => $("#ffile").click());
$("#ffile").addEventListener("change", (e) => { addFiles([...e.target.files]); e.target.value = ""; });
$("#form").addEventListener("dragover", (e) => { e.preventDefault(); $("#fdrop").classList.add("over"); });
$("#form").addEventListener("dragleave", (e) => { if (e.target.id === "fdrop") $("#fdrop").classList.remove("over"); });
$("#form").addEventListener("drop", (e) => { e.preventDefault(); $("#fdrop").classList.remove("over"); addFiles([...e.dataTransfer.files]); });
$("#form").addEventListener("paste", (e) => { const fs = [...e.clipboardData.files]; if (fs.length) { e.preventDefault(); addFiles(fs); } });
$("#fclips").addEventListener("toggle", () => { if ($("#fclips").open) drawClipList(); });
$("#fq").addEventListener("input", () => drawClipList());
$("#fq").addEventListener("keydown", (e) => { if (e.key === "Enter") e.preventDefault(); });
try { const t = localStorage.getItem("sg-tab"); if (t) TAB = t; } catch (_) {}
load().catch((e) => say("Could not load the guide: " + e.message, 0));
