"""arrange.py PROD... [--dry]  - lays a video's claude clips out like video 1: columns of 12 in time order, to the
right of its video node (and of the owner's own clips), top-aligned with the video. Moves only x/y of that video's
claude clips (post.py's user-edit tracking ignores x/y). Refuses if the block would overlap other nodes: move the
video node somewhere clear on the board, then re-run. Also stores the new band in config.json for later posts."""
import argparse, json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from common import workdir, load_cfg, get_board, mutate, is_claude, band

ap = argparse.ArgumentParser(); ap.add_argument("prods", nargs="+"); ap.add_argument("--dry", action="store_true")
A = ap.parse_args(); bad = 0
for prod in A.prods:
    cfg = load_cfg(prod); VID = cfg["video_id"]; out = {}
    def apply(b):
        M = sorted([n for n in b["nodes"] if n["type"] == "clip" and n.get("parent") == VID and is_claude(n)], key=lambda n: n["sf_in"])
        L, hit = band(b, VID, len(M)); out.update(L=L, hit=hit, n=len(M))
        if hit or A.dry: return None
        moved = 0
        for i, n in enumerate(M):
            x, y = L["x0"] + (i // L["per"]) * L["colw"], L["y0"] + (i % L["per"]) * L["rowh"]
            if (n.get("x"), n.get("y")) != (x, y): n["x"], n["y"] = x, y; moved += 1
        out["moved"] = moved
        return moved or None
    _, b = mutate(cfg, apply)
    if out["hit"]:
        bad = 1; print(f"{prod}: NOT moved - block would overlap {len(out['hit'])} node(s), e.g. "
                       + ", ".join(f"{n['type']} {n.get('title','')[:30]!r} at ({n['x']},{n['y']})" for n in out["hit"][:3]))
        continue
    if not A.dry:
        cfg["layout"] = out["L"]; (workdir(prod) / "config.json").write_text(json.dumps(cfg, indent=1), encoding="utf-8")
    print(f"{prod}: {out['n']} clips, moved {out.get('moved', 0)}, block at ({out['L']['x0']},{out['L']['y0']})"
          + (" (dry run)" if A.dry else f", board rev {b['rev']}"))
sys.exit(bad)
