import sys, importlib
from common import FPS
edl = importlib.import_module(sys.argv[1]); H = edl.H
for s in edl.SHOTS:
    ins = (2*H - s["hh"] if s["tin"] != "cut" else 0) + (2*H - s["th"] if s["tout"] != "cut" else 0)
    solo = s["b"] - s["a"] - ins/FPS
    print(f'{s["id"]:>4} {s["kind"]:5} {s["a"]:8.3f}-{s["b"]:8.3f} len {s["b"]-s["a"]:5.2f} solo {solo:5.2f} hh {s["hh"]:2} th {s["th"]:2}{"  <3" if s["kind"] in ("src","photo","map","page") and solo < 2.99 else ""}')
for e in edl.EVENTS: print("event", e["keys"], e["t0"], e["t1"], round(e["t1"]-e["t0"], 2))
