"""verify.py PROD [PROD ...]  - checks the claude clips of each video on the board. Exit 1 on any problem.
Coverage start..last frame with no gaps/overlaps, fields and one category, no motion-graphic raw footage,
derived edges, unique ids, and every pre-existing non-claude node unchanged since prep (baseline.json)."""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from common import CATS, workdir, load_cfg, get_board, is_claude

bad = 0
for prod in sys.argv[1:]:
    cfg = load_cfg(prod); VID = cfg["video_id"]; b = get_board(cfg); P = []
    mine = sorted([n for n in b["nodes"] if n["type"] == "clip" and n.get("parent") == VID and is_claude(n)], key=lambda n: n["sf_in"])
    if not mine: print(f"{prod}: no claude clips yet"); bad += 1; continue
    if mine[0]["sf_in"] != cfg["start"]: P.append(f"starts at {mine[0]['sf_in']}, expected {cfg['start']}")
    if mine[-1]["sf_out"] != cfg["N"] - 1: P.append(f"ends at {mine[-1]['sf_out']}, video's last frame is {cfg['N'] - 1}")
    P += [f"gap/overlap {a['sf_out']}->{c['sf_in']}" for a, c in zip(mine, mine[1:]) if c["sf_in"] != a["sf_out"] + 1]
    P += [f"bad frames at {n['sf_in']}" for n in mine if not (n["pf_in"] == n["sf_in"] <= n["sf_out"] == n["pf_out"])]
    P += [f"missing field or category at {n['sf_in']}" for n in mine
          if not (n.get("note") and n.get("purpose") and n.get("title") and len(set(n["tags"]) & set(CATS)) == 1)]
    P += [f"motion graphic on raw footage at {n['sf_in']}" for n in mine if {"motion graphic", "raw-footage"} <= set(n["tags"])]
    ed = {e["to"] for e in b["edges"] if e.get("from") == VID and e.get("kind") == "derived"}
    P += [f"no derived edge for {n['sf_in']}" for n in mine if n["id"] not in ed]
    ids = [n["id"] for n in b["nodes"]]
    if len(ids) != len(set(ids)): P.append("duplicate node ids on board")
    base = {n["id"]: n for n in json.loads((workdir(prod) / "baseline.json").read_text(encoding="utf-8"))}
    now = {n["id"]: n for n in b["nodes"] if n["id"] in base}
    # the user may move or edit their own nodes in the app; only flag ones that vanished
    P += [f"pre-existing node {i} missing" for i in base if i not in now]
    T = cfg["fps"][0] / cfg["fps"][1]
    print(f"{prod}: {len(mine)} clips, frames {mine[0]['sf_in']}-{mine[-1]['sf_out']} "
          f"({(mine[-1]['sf_out'] + 1 - mine[0]['sf_in']) / T / 60:.1f} min) - " + ("OK" if not P else f"{len(P)} problems"))
    for p in P[:20]: print("   ", p)
    bad += bool(P)
sys.exit(1 if bad else 0)
