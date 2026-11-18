"""Make productions/_boards/stress.json: a board with ~100,000 clips for testing the board at scale.

It reads farrell.json (read only) and reuses its 5 videos and clip ranges, so thumbnails exist.
The board starts with "sync": false, so the server never mirrors it into annotations.json.
Stress clips have no "file": deleting one can never delete a real cut clip.

    python tests/make_stress_board.py [--count 100000] [--name stress]
"""
import argparse, json, random, sys, time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BOARDS = ROOT / "productions" / "_boards"
COLS, CW, CH, VX = 100, 360, 290, 40_000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--count", type=int, default=100_000)
    ap.add_argument("--name", default="stress")
    a = ap.parse_args()
    if a.name == "farrell" or not a.name.replace("-", "").replace("_", "").isalnum():
        sys.exit("refusing: pick another board name")
    src = json.loads((BOARDS / "farrell.json").read_text(encoding="utf-8"))
    vids = [n for n in src["nodes"] if n["type"] == "video"]
    ranges = {v["id"]: [n for n in src["nodes"] if n["type"] == "clip" and n["parent"] == v["id"]] for v in vids}
    rnd = random.Random(7); now = time.strftime("%Y-%m-%dT%H:%M:%S")
    nodes, edges, per = [], [], -(-a.count // len(vids))
    clip_pos = []
    for vi, v in enumerate(vids):
        vx = vi * VX
        nodes.append(dict(v, x=vx, y=0))
        rs = ranges[v["id"]]
        for k in range(min(per, a.count - vi * per)):
            r = rs[k % len(rs)]; cid = f"cs{vi}x{k:06d}"
            col, row = k % COLS, k // COLS
            nodes.append({"id": cid, "type": "clip", "parent": v["id"], "src": r["src"], "fps": r.get("fps") or v.get("fps"),
                          "sf_in": r["sf_in"], "sf_out": r["sf_out"], "pf_in": r.get("pf_in", r["sf_in"]), "pf_out": r.get("pf_out", r["sf_out"]),
                          "status": "ready", "x": vx + 520 + col * CW, "y": row * CH, "tags": list(r.get("tags") or []),
                          "note": "", "purpose": "", "title": f"stress {vi}.{k}", "created": now, "updated": now})
            edges.append({"id": f"es{vi}x{k:06d}", "from": v["id"], "to": cid, "kind": "derived"})
            clip_pos.append((cid, vi, col, row))
    by = {(vi, col, row): cid for cid, vi, col, row in clip_pos}
    for i in range(min(1000, len(clip_pos))):
        cid, vi, col, row = rnd.choice(clip_pos)
        to = by.get((vi, min(col + 1, COLS - 1), row + rnd.randint(0, 3)))
        if to and to != cid:
            edges.append({"id": f"eu{i:05d}", "from": cid, "to": to, "kind": "user", "label": ""})
    b = {"sync": False, "name": a.name, "version": 2, "rev": 1, "saved": now,
         "view": {"x": 400, "y": 300, "z": 0.004}, "nodes": nodes, "edges": edges}
    out = BOARDS / f"{a.name}.json"
    out.write_text(json.dumps(b, ensure_ascii=False), encoding="utf-8")
    print(f"{out.name}: {len(nodes)} nodes, {len(edges)} links, {out.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
