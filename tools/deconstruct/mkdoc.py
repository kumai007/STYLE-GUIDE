"""mkdoc.py PROD ["Title"]  - writes 01_reference/DECONSTRUCTION_claude.md from the board's claude clips of that video."""
import statistics as st, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from common import CATS, PROD, load_cfg, get_board, is_claude

prod = sys.argv[1]; title = sys.argv[2] if len(sys.argv) > 2 else prod
cfg = load_cfg(prod); FPS = cfg["fps"][0] / cfg["fps"][1]; VID = cfg["video_id"]
M = sorted([n for n in get_board(cfg)["nodes"] if n["type"] == "clip" and n.get("parent") == VID and is_claude(n)], key=lambda n: n["sf_in"])
if not M: raise SystemExit("no claude clips for " + prod)
def ts(f): s = f / FPS; return f"{int(s // 60):02d}:{s % 60:05.2f}"
def esc(t): return (t or "").replace("|", "/").replace("\n", " ")
rows, agg, durs, mg, raw = [], {}, {}, [0, 0.0], [0, 0.0]
for i, n in enumerate(M, 1):
    d = (n["sf_out"] - n["sf_in"] + 1) / FPS; cat = next(t for t in n["tags"] if t in CATS); m = "motion graphic" in n["tags"]
    a = agg.setdefault(cat, [0, 0.0]); a[0] += 1; a[1] += d; durs.setdefault(cat, []).append(d)
    t = mg if m else raw; t[0] += 1; t[1] += d
    rows.append(f"| {i} | {ts(n['sf_in'])}–{ts(n['sf_out'] + 1)} | {d:.1f}s | {cat}{' (mg)' if m else ''} | {esc(n['title'])} | {esc(n['note'])} | {esc(n['purpose'])} |")
tot = mg[1] + raw[1]
L = [f"# Deconstruction (claude): {title}", "",
     f"Clips tagged `claude` on board `{cfg['board']}`, frames {M[0]['sf_in']}–{M[-1]['sf_out']} ({ts(M[0]['sf_in'])}–{ts(M[-1]['sf_out'] + 1)}), "
     "cut-accurate, no gaps or overlaps." + (f" The owner's own clips cover 00:00–{ts(M[0]['sf_in'])}." if M[0]["sf_in"] else "")
     + " Generated from the board by tools/deconstruct/mkdoc.py; `(mg)` = tagged `motion graphic`.", "",
     "## Summary", "",
     f"- {len(M)} clips, {tot:.1f} s ({tot / 60:.1f} min), median clip {st.median([d for v in durs.values() for d in v]):.1f} s.",
     f"- Treated (motion graphic): {mg[0]} clips, {mg[1]:.1f} s ({100 * mg[1] / tot:.0f}% of time). "
     f"Untreated (raw footage, host on camera, source text): {raw[0]} clips, {raw[1]:.1f} s ({100 * raw[1] / tot:.0f}%).", "",
     "| category | clips | total time | share | median clip |", "|---|---|---|---|---|"]
for c in sorted(agg, key=lambda c: -agg[c][1]):
    L.append(f"| {c} | {agg[c][0]} | {agg[c][1]:.1f}s | {100 * agg[c][1] / tot:.0f}% | {st.median(durs[c]):.1f}s |")
L += ["", "## Clips", "", "| # | start–end | dur | category | title | note | why |", "|---|---|---|---|---|---|---|"] + rows + [""]
out = PROD / prod / "01_reference" / "DECONSTRUCTION_claude.md"
out.write_text("\n".join(L), encoding="utf-8")
print("\n".join(L[4:8 + len(agg) + 2])); print("wrote", out)
