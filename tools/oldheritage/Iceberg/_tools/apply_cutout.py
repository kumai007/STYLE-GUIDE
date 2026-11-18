#!/usr/bin/env python3
"""apply_cutout.py <KEY> "a-b,a-b" "note"  -- wraps a case's Comp in lib/core/cutOut (drops raw windows, original timeline seconds).
Idempotent: re-running replaces the cut list. 3 Nov 2026 raw audit (raws only at incident moments)."""
import re, sys
key, wins, note = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else ""
p = f"C:/Users/ayush/Videos/CLAUDE/STYLE guide/tools/oldheritage/Iceberg/_engine/src/cases/{key}.tsx"
s = open(p).read()
cuts = "[" + ", ".join(f"[{a}, {b}]" for a, b in (w.split("-") for w in wins.split(","))) + "]"
if "cutOut(CompFull" not in s:
    s = re.sub(r"^export const DUR\b", "const DUR", s, count=1, flags=re.M)
    s, n = re.subn(r"^export const Comp\b", "const CompFull", s, count=1, flags=re.M)
    assert n == 1, "no 'export const Comp'"
    s = s.replace('import React from "react";', 'import React from "react";\nimport { cutOut } from "../lib/core/cutOut";', 1)
    s += f"\n// RAW AUDIT 3 Nov 2026 (owner: raws only at incident moments): {note}\nconst _cut = cutOut(CompFull, DUR, {cuts});\nexport const Comp = _cut.Comp;\nconst DUR_OUT = _cut.DUR;\nexport {{ DUR_OUT as DUR }};\n"
else:
    s = re.sub(r"cutOut\(CompFull, DUR, \[.*\]\);", f"cutOut(CompFull, DUR, {cuts});", s)
open(p, "w").write(s)
print(key, "cuts", cuts)
