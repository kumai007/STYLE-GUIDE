"""Print compact clip lists from a pp-multi output file of get_track_info calls."""
import json, re, sys
txt = open(sys.argv[1], encoding="utf-8").read()
for blk in re.split(r"^## ", txt, flags=re.M)[1:]:
    head, _, body = blk.partition("\n")
    try: d = json.loads(body)
    except Exception: print(head, body[:300]); continue
    if "clips" not in d: print(head, str(d)[:200]); continue
    print(f"{d['name']} ({d['clipCount']})")
    for c in d["clips"]:
        print(f"  {c.get('nodeId','')} {c['name'][:14]:14} {c['startSeconds']:9.4f}-{c['endSeconds']:9.4f}")
