import csv, json, re, sys, difflib
from pathlib import Path
csvp, txdir = sys.argv[1], Path(sys.argv[2])
norm = lambda t: re.sub(r"[^a-z0-9' ]", " ", t.lower().replace("-", " ")).split()
rows = list(csv.reader(open(csvp, encoding="utf-8")))
hdr = rows[0]; ti = [i for i, h in enumerate(hdr) if h.lower() in ("text", "script", "line")][0]
for i, r in enumerate(rows[1:], 1):
    name = f"vo_{i:03d}"
    a = norm(r[ti]); b = norm(" ".join(w["w"] for w in json.loads((txdir / f"{name}.json").read_text())))
    sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
    bad = [(op, " ".join(a[i1:i2]), " ".join(b[j1:j2])) for op, i1, i2, j1, j2 in sm.get_opcodes() if op != "equal"]
    print(f"{name}: script {len(a)}w heard {len(b)}w ratio {sm.ratio():.3f}", *[f"\n   {o}: '{x}' -> '{y}'" for o, x, y in bad])
