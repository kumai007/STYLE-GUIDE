#!/usr/bin/env python3
"""Load styleguide/farrell/seed.json into styleguide/farrell/farrell.json (and regenerate FARRELL_STYLE_GUIDE.md).

    python styleguide/tools/load_seed.py [--replace]

seed.json shape:
  {"categories": {"<cat id>": {"summary": "...", "rules": [{"text": "...", "source": "user|refs", "evidence": ["<clip id>", ...]}]}},
   "rulebook": ["...", ...]}
Evidence ids are looked up on the board for their frames and title; an unknown id stops the load.
It refuses to overwrite a guide that already has rules unless --replace (the old file still goes to history/).
"""
import argparse, json, sys
from pathlib import Path

SG = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(SG))
import model as M

ROOT = SG.parent
BOARD = ROOT / "productions" / "_boards" / "farrell.json"


def build(seed, nodes, base=None):
    """Return a guide built from seed; base keeps learnings and updates. Raises M.OpError on unknown clips or bad cats."""
    by = {n["id"]: n for n in nodes if "sf_in" in n}
    g = M.empty_guide()
    if base: g["learnings"], g["updates"] = base.get("learnings", []), base.get("updates", [])
    bad = set(seed.get("categories", {})) - set(M.CAT_IDS)
    if bad: raise M.OpError(f"unknown categories: {sorted(bad)}")
    for cid, c in seed.get("categories", {}).items():
        dst = M.cat(g, cid); dst["summary"] = c.get("summary", "")
        for r in c.get("rules", []):
            ev = []
            for e in r.get("evidence", []):
                n = by.get(e)
                if not n: raise M.OpError(f"{cid}: clip {e} is not on the board")
                ev.append({"clip": e, "sf_in": n["sf_in"], "sf_out": n["sf_out"], "label": f"v{n['src'][8:10]} · {n.get('title', '')}"[:60]})
            dst["rules"].append({"id": M.new_id("r"), "text": r["text"], "source": r.get("source", "refs"), "evidence": ev})
    g["rulebook"] = [{"id": M.new_id("b"), "text": t} for t in seed.get("rulebook", [])]
    return g


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--replace", action="store_true"); a = ap.parse_args()
    f = SG / "farrell" / "farrell.json"; cur = M.load(f) if f.exists() else None
    if cur and (cur["rulebook"] or any(c["rules"] for c in cur["categories"])) and not a.replace:
        sys.exit("farrell.json already has rules; pass --replace to overwrite (the old file is kept in history/)")
    seed = json.loads((SG / "farrell" / "seed.json").read_text(encoding="utf-8"))
    g = build(seed, json.loads(BOARD.read_text(encoding="utf-8"))["nodes"], cur)
    if cur: g["rev"] = cur["rev"]
    M.save(g, f, SG / "farrell" / "history", SG / "farrell" / "FARRELL_STYLE_GUIDE.md")
    n = sum(len(c["rules"]) for c in g["categories"])
    print(f"loaded: {n} rules, {len(g['rulebook'])} rule-book rules, rev {g['rev']}")


if __name__ == "__main__":
    main()
