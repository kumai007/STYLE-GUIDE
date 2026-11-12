#!/usr/bin/env python
"""videos.json (Remotion) -> props/highlight/<ID>.json + assets/highlight/*.png, then prepare.py.
Run from graphics/hyperframes. Remotion project is read-only. Skips entries with lens>0 or grain>0."""
import json, os, shutil, sys
sys.path.insert(0, os.path.dirname(__file__))
from prepare import prepare
HF = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
T = os.path.abspath(os.path.join(HF, "..", "templates"))
vids = json.load(open(os.path.join(T, "src/presets/highlights/videos.json"), encoding="utf8"))
skipped, made = [], []
for id_, p in vids.items():
    o = p.get("overrides") or {}
    if (o.get("lens") or 0) > 0 or (o.get("grain") or 0) > 0:
        skipped.append(id_); continue
    name = os.path.basename(p["image"])
    dst = os.path.join(HF, "assets", "highlight", name)
    if not os.path.exists(dst):
        shutil.copyfile(os.path.join(T, "public", p["image"]), dst)
    if p.get("motionSeed") == "auto":
        p["motionSeed"] = p["image"]  # Remotion seeds "auto" from the image path string: pin it before remapping
    p["image"] = "assets/highlight/" + name
    p, mean = prepare(p)
    json.dump(p, open(os.path.join(HF, "props", "highlight", id_ + ".json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)
    made.append(id_)
print("made", len(made), "skipped", skipped)
