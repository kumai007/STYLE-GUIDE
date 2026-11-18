"use strict";
// common.js - helpers shared by draw.js, focus.js and app.js (loaded first).
const $ = (id) => document.getElementById(id);
const enc = encodeURIComponent;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function api(path, body) {
  const r = await fetch(path, body === undefined ? {} : {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok || j.error) throw new Error(j.error || `HTTP ${r.status}`);
  return j;
}
function tc(t) {
  if (t == null) return "—";
  const h = Math.floor(t / 3600), m = Math.floor(t / 60) % 60, s = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${s.toFixed(3).padStart(6, "0")}`;
}
function ts(t) {     // short: M:SS.mmm (H:MM:SS.mmm past an hour)
  if (t == null) return "—";
  return t >= 3600 ? tc(t) : `${Math.floor(t / 60)}:${(t % 60).toFixed(3).padStart(6, "0")}`;
}
function setStatus(msg, cls = "") { const s = $("status"); if (s) { s.textContent = msg; s.className = cls || "muted"; } }
const typing = () => { const a = document.activeElement;
  return !!a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT" || a.tagName === "SELECT" || a.isContentEditable); };
