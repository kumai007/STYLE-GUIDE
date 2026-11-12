"""Satellite texture + outline for compositions/camping8/sat-map.html (pin-1 look: dark grey satellite, region outline, marker).
usage: python -I tools/sat_map_prep.py <name> <lat> <lon> <zoom> <tiles_w> <tiles_h> "<places.json key>" <out_dir>
Tiles: EOX Sentinel-2 cloudless 2016 (CC BY 4.0, credit drawn on screen), cached in the JapaneseTV tile cache.
Outline: the Nominatim polygon already cached in cache/places.json (the key is the JSON query string).
Writes <out_dir>/<name>.jpg and <name>.json {w,h,path (SVG d in texture px), cx, cy (place centre px), credit}."""
import json, math, os, sys, time, urllib.request
import numpy as np
from PIL import Image, ImageFilter

name, lat, lon, z, tw, th, key, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), sys.argv[7], sys.argv[8]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "..", "..", "editor-v5", "MASTER_TEMPLATES", "legacy", "EncountersEditor", "JapaneseTV", "assets", "tilecache")
os.makedirs(CACHE, exist_ok=True); os.makedirs(out, exist_ok=True)
n = 2 ** z
def merc(la, lo):
    lr = math.radians(la); return (lo + 180) / 360 * n, (1 - math.log(math.tan(lr) + 1 / math.cos(lr)) / math.pi) / 2 * n
fx, fy = merc(lat, lon); x0, y0 = int(fx) - tw // 2, int(fy) - th // 2
mos = Image.new("RGB", (256 * tw, 256 * th))
for ty in range(th):
    for tx in range(tw):
        p = os.path.join(CACHE, f"s2_{z}_{x0 + tx}_{y0 + ty}.png")
        for _ in range(4):
            if os.path.exists(p): break
            try:
                url = f"https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y0 + ty}/{x0 + tx}.jpg"
                req = urllib.request.Request(url, headers={"User-Agent": "map-card-render/1.0 (one-off video map; cached)"})
                open(p, "wb").write(urllib.request.urlopen(req, timeout=30).read()); time.sleep(0.12)
            except Exception as e: print("retry", e); time.sleep(2)
        try: mos.paste(Image.open(p).convert("RGB"), (256 * tx, 256 * ty))
        except Exception: pass
m = np.asarray(mos).astype(np.float32) / 255
lum = m @ np.float32([0.299, 0.587, 0.114])
rgb = lum[..., None] + (m - lum[..., None]) * 0.18          # nearly grey, a breath of the land colour
rgb = np.clip((rgb - 0.02) * 1.12, 0, 1) ** 1.25 * 0.72 * np.float32([0.95, 0.98, 1.03])
Image.fromarray((rgb * 255).astype(np.uint8)).filter(ImageFilter.UnsharpMask(1.2, 60, 2)).save(os.path.join(out, name + ".jpg"), quality=88)

places = json.load(open(os.path.join(ROOT, "cache", "places.json"), encoding="utf-8"))
hit = places[key]; hit = hit[0] if isinstance(hit, list) else hit
g = hit["geojson"]; polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
d = []
for poly in polys:
    for ring in poly[:1]:                                   # outer ring only
        pts = [merc(la, lo) for lo, la in ring]
        d.append("M" + " L".join(f"{(px - x0) * 256:.1f},{(py - y0) * 256:.1f}" for px, py in pts) + " Z")
json.dump({"w": 256 * tw, "h": 256 * th, "path": " ".join(d), "cx": (fx - x0) * 256, "cy": (fy - y0) * 256,
           "credit": "Sentinel-2 cloudless 2016 by EOX IT Services GmbH"}, open(os.path.join(out, name + ".json"), "w"), indent=0)
print(name, mos.size, "centre", round((fx - x0) * 256), round((fy - y0) * 256), "path pts", sum(len(p[0]) for p in polys))
