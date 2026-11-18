"""EDL -> batch_ops place ops. usage: edl.py EDL.json  (rows: [item, src_in, tl_start, tl_end, flags]; flags: e=edge end (no overrun), s=edge start (ceil snap))"""
import json, math, sys
FR = 30000 / 1001; F = 1 / FR
rows = json.load(open(sys.argv[1]))
ops = []
for item, src, a, b, fl, *rest in rows:
    fa = math.ceil(a * FR - 0.01) if "s" in fl else round(a * FR)
    ta = fa / FR; tb = round(b * FR) / FR
    ln = tb - ta
    out = src + ln + (F + 0.005 if "e" in fl else 4 * F)
    op = {"type": "place", "item_id": item, "in_seconds": round(src, 4), "out_seconds": round(out, 4), "track_index": rest[0] if rest else 0, "start_seconds": round(ta, 4), "audio_track_index": 3}
    ops.append(op)
print(json.dumps(ops))
