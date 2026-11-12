#!/usr/bin/env python
"""Deterministic build step for Highlight.html (replaces Remotion's runtime measurement).

Usage: python prepare.py <props.json> [out.json]   (default: rewrite in place)
Fills imageWidth, imageHeight, pageKind, pageColor exactly as Remotion's
HighlightTemplate.measurePage does: 64x64 downscale, kind = mean Rec.709 luma/255 < 0.45 -> dark,
pageColor = commonest border pixel with each channel round(v/4)*4 (clamped 255).
page "dark"/"light" is respected for pageKind (Remotion keeps the forced kind).
"""
import json, sys, os
from collections import Counter
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))

def find_image(p):
    cands = [p, os.path.join(ROOT, p), os.path.join(ROOT, "assets", "highlight", os.path.basename(p))]
    for c in cands:
        if os.path.isfile(c):
            return c
    raise SystemExit("prepare.py: image not found: %s" % p)

def js_round(x):  # Math.round: half up
    import math
    return int(math.floor(x + 0.5))

def measure(path):
    im = Image.open(path)
    w, h = im.size
    # canvas filters in premultiplied space, getImageData un-premultiplies
    small = im.convert("RGBA").convert("RGBa").resize((64, 64), Image.BOX).convert("RGBA")
    d = small.load()
    s = 0.0
    for y in range(64):
        for x in range(64):
            R, G, B, _ = d[x, y]
            s += 0.2126 * R + 0.7152 * G + 0.0722 * B
    mean = s / 4096 / 255
    cnt = Counter()
    for i in range(64):
        for x, y in ((i, 0), (i, 63), (0, i), (63, i)):
            R, G, B, _ = d[x, y]
            cnt[tuple(min(255, js_round(v / 4) * 4) for v in (R, G, B))] += 1
    top = max(cnt.items(), key=lambda kv: kv[1])[0]  # first-inserted wins ties, like Map sort stability
    color = "#%02x%02x%02x" % top
    return w, h, ("dark" if mean < 0.45 else "light"), color, mean

def prepare(props):
    path = find_image(props["image"])
    w, h, kind, color, mean = measure(path)
    props["imageWidth"], props["imageHeight"] = w, h
    props["pageKind"] = props["page"] if props.get("page") in ("dark", "light") else kind
    props["pageColor"] = color
    return props, mean

if __name__ == "__main__":
    src = sys.argv[1]
    dst = sys.argv[2] if len(sys.argv) > 2 else src
    props = json.load(open(src, encoding="utf8"))
    props, mean = prepare(props)
    json.dump(props, open(dst, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    print("%s: %dx%d luma=%.3f kind=%s color=%s" % (os.path.basename(dst), props["imageWidth"], props["imageHeight"], mean, props["pageKind"], props["pageColor"]))
