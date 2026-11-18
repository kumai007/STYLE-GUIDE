# Rule-book check of an EDL before rendering. Usage: python rulecheck.py edl5   (exit 1 if any FAIL)
# Checks: narration solo >= 3 s; B-roll/graphic total >= 2.5 s; comment on screen >= 3.5 s (warn under chars/15 + 1 s);
# comment enter (up 22 f, pan 24 f) / exit (18 f) / morph motion not inside any crossfade/dip; caption 5/6 s .. 7 s;
# overlay + its footage = one shot: plain footage next to an overlay is 0 s (handoff / xin / xout) or >= 3 s; threads show extended (no morph).
import sys, ast, importlib, re
from common import FPS
edl = importlib.import_module(sys.argv[1]); H = edl.H
EIN = {"up": 22 / FPS, "pan": 24 / FPS}; EOUT = 18 / FPS   # overlay enter / exit motion (final6)
CPS = 15.0              # reading speed for on-screen comment text (chars/s); subtitles allow up to ~20
fails = []
def bad(m): fails.append(m); print("FAIL", m)

# fade windows: boundary a of an incoming shot with a blend spans [a - hh, a + 2H - hh]
FADES = [(s["a"] - s["hh"] / FPS, s["a"] + (2 * H - s["hh"]) / FPS, s["id"]) for s in edl.SHOTS if s["tin"] != "cut"]

for s in edl.SHOTS:
    ins = (2 * H - s["hh"] if s["tin"] != "cut" else 0) + (2 * H - s["th"] if s["tout"] != "cut" else 0)
    solo, tot = s["b"] - s["a"] - ins / FPS, s["b"] - s["a"]
    if s["kind"] in ("src", "photo", "map", "page") and solo < 2.99: bad(f'shot {s["id"]} solo {solo:.2f} s < 3')
    if tot < 2.5: bad(f'shot {s["id"]} total {tot:.2f} s < 2.5')
    for (a, b, t) in s.get("caps", []):
        if not (5 / 6 - 1e-3 <= b - a <= (99 if s["id"] in getattr(edl, "ONSCREEN_CAPS", ()) else 7.0)): bad(f'caption {s["id"]} {a:.2f}-{b:.2f} len {b - a:.2f} s (5/6..7)')

# comment text: final4 TEXT overrides, else edl.CARDS[k]["t"]
src = open(sys.argv[2] if len(sys.argv) > 2 else "final4.py", encoding="utf-8").read()
TEXT = next((ast.literal_eval(n.value) for n in ast.parse(src).body
             if isinstance(n, ast.Assign) and getattr(n.targets[0], "id", "") == "TEXT"), {})
def chars(k): return len(re.sub(r"\s+", " ", TEXT.get(k) or edl.CARDS.get(k, {}).get("t", "")))

for e in edl.EVENTS:
    k, t0, t1 = e["keys"], e["t0"], e["t1"]
    n = sum(chars(x) for x in k)
    need = max(3.5, n / CPS + 1.0)
    # the narration reads the comments aloud, so reading time is a warning; 3.5 s is the hard floor
    if t1 - t0 < 3.5: bad(f'comment {k} on {t1 - t0:.2f} s < 3.5 s')
    elif t1 - t0 < need - 1e-3: print(f'warn comment {k} on {t1 - t0:.2f} s, reading time {need:.2f} s ({n} chars)')
    mo = ([] if e.get("xin") else [("enter", (t0, t0 + EIN[e["ent"]]))]) + ([] if e.get("xout") else [("exit", (t1 - EOUT, t1))])
    if len(k) == 2 and (e.get("morph") or 0) >= t0: bad(f'thread {k} grows at {e["morph"]:.2f}: show the extended thread from the start')
    if e.get("morph") and e["morph"] >= t0: mo.append(("morph", (e["morph"], e["morph"] + 20 / FPS)))
    for (w0, w1, sid) in FADES:
        for nm, (m0, m1) in mo:
            if m0 < w1 and w0 < m1: bad(f'comment {k} {nm} {m0:.2f}-{m1:.2f} inside fade into {sid} {w0:.2f}-{w1:.2f}')
# plain footage next to an overlay: 0 s or >= 3 s (owner review 4)
CH = [(s["a"], s["a"]) for s in edl.SHOTS if s["tin"] == "cut"] + [(w0, w1) for (w0, w1, _) in FADES] + [(edl.SHOTS[-1]["b"],) * 2]
EV = sorted(edl.EVENTS, key=lambda e: e["t0"])
def same(w, x): return x and abs(w[0] - x[0]) < 1.5 / FPS and abs(w[1] - x[1]) < 1.5 / FPS
for i, e in enumerate(EV):
    k, t0, t1 = e["keys"], e["t0"], e["t1"]
    pv, nx = (EV[i - 1] if i else None), (EV[i + 1] if i + 1 < len(EV) else None)
    if e.get("xin"):
        if not any(same(w, e["xin"]) for w in CH): bad(f'comment {k} xin {e["xin"]} is not a fade window')
    elif pv and pv["t1"] > t0:
        if pv["t1"] - t0 < 0.3: bad(f'comment {k} handoff overlap {pv["t1"] - t0:.2f} s < 0.3')
    else:
        last = max([w1 for (w0, w1) in CH if w1 <= t0 + 1e-3] + ([pv["t1"]] if pv else []))
        if t0 - last < 3 - 1e-3: bad(f'comment {k} enters {t0 - last:.2f} s after a change: plain footage < 3 s (handoff, xin, or move)')
    if e.get("xout"):
        if not any(same(w, e["xout"]) for w in CH): bad(f'comment {k} xout {e["xout"]} is not a fade window')
    elif nx and nx["t0"] < t1: pass
    else:
        nxt = min([w0 for (w0, w1) in CH if w0 >= t1 - 1e-3] + ([nx["t0"]] if nx else []))
        if nxt - t1 < 3 - 1e-3: bad(f'comment {k} leaves {nxt - t1:.2f} s before a change: plain footage < 3 s (handoff, xout, or move)')
print("rulecheck:", "OK" if not fails else f"{len(fails)} FAIL")
sys.exit(1 if fails else 0)
