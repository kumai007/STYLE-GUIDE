import json, sys
src, dst, times = sys.argv[1], sys.argv[2], sys.argv[3:]
j = json.load(open(src, encoding="utf-8"))
raws = [b for b in j["blocks"] if b["kind"] == "raw" and b["case_id"] == "case_01"]
assert len(raws) == len(times), (len(raws), len(times))
for b, t in zip(raws, times):
    a, e = map(float, t.split("-"))
    print(b["id"], b["start"], b["end"], "->", a, e, f"({e-a:.2f}s)")
    b["start"], b["end"] = a, e
json.dump(j, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
