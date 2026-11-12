"""HyperFrames port (graphics/hyperframes/tools): same output document as the Remotion tool; default --out is props/place-map/<place>-map.json,
render with:  node tools/place-map-render.mjs props/place-map/<x>.json [--comp nocturn-map]   (see notes/place-map.md)
Original docstring: Props for the NocturnMap card (plain black outline map, slow zoom, region tinted red, place red + glow, VCR name).

Standalone port of case_video_workflow cvw/places.py (map_shape, no terrain relief). Stdlib only.
  python -I tools/make_map.py "Meteora" "Greece" [--theme horror|geo|atlas|news] [--sub TEXT] [--frames 180] [--out props/meteora.json]
then
  npx remotion render src/index.ts NocturnMap out/meteora.mov --props=props/meteora.json --codec=prores --prores-profile=4444
Geocodes with OpenStreetMap Nominatim (1 request/s, identifying User-Agent, cached in cache/places.json); outlines are
Natural Earth 1:10m (node_modules/world-atlas, else downloaded once to cache/). Framing = the country, or its state when
the country is wider/taller than REGION_MAX degrees. A place Nominatim doesn't know = no map card (use footage).
"""
from __future__ import annotations
import argparse, json, math, sys, time, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = "https://nominatim.openstreetmap.org/search"
AGENT = "case-graphics/1.0 (map cards)"
WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-10m.json"
REGION_MAX = 15.0
GAP = 1.1
W, H = 1920, 1080
PAD = 1.12
V1_AREA, V1_MIN, V1_MAX = 5.0, 1 / 4, 1 / 2   # last view: 5x the place outline, 1/4..1/2 of the first (deeper lost the coast)
V0_X, V0_PAN = 2.2, (0.10, -0.06)              # first view: 2.2x the last, offset so the zoom also pans onto the place (Ayush
                                               # 2026-10-25: start already zoomed in, never the far-out frame; slow pan + zoom)
CLIP = 0.3
TOL = 0.75
OUTLINE = 0.002


def _get(url: str, params: dict | None = None):
    if params: url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode("utf-8"))


class Geocoder:
    def __init__(self):
        self.path = ROOT / "cache" / "places.json"
        try: self.cache = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError): self.cache = {}
        self.last = 0.0

    def search(self, **params):
        key = json.dumps(params, sort_keys=True)
        if key not in self.cache:
            time.sleep(max(0.0, GAP - (time.time() - self.last)))
            hits = _get(API, {**params, "format": "jsonv2", "limit": 1, "addressdetails": 1, "accept-language": "en"})
            self.last = time.time()
            self.cache[key] = hits[0] if hits else None
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self.cache), encoding="utf-8")
        return self.cache[key]


def _bbox(hit):  # Nominatim boundingbox = [s, n, w, e] strings
    return [float(x) for x in hit["boundingbox"]]


def _span(b):
    return max(b[1] - b[0], b[3] - b[2])


def locate(place: str, region: str, geo: Geocoder):
    hq = {"q": f"{place}, {region}"} if place != region else None
    hit = geo.search(**hq) if hq else None
    if not hit:
        hq = {"q": region}; hit = geo.search(**hq)
    if not hit: return None
    a = hit.get("address") or {}
    country = a.get("country") or region
    fq = {"country": country, "featuretype": "country"}
    frame = geo.search(**fq)
    sub = country
    if frame and _span(_bbox(frame)) > REGION_MAX and a.get("state"):
        sq = {"state": a["state"], "country": country}
        state = geo.search(**sq)
        if state: frame, fq = state, sq
        sub = ", ".join(x for x in (a["state"], country) if x != place)
    return {"lat": float(hit["lat"]), "lon": float(hit["lon"]), "bbox": _bbox(frame or hit),
            "sub": "" if sub == place else sub, "find": {"place": hq, "frame": fq if frame else hq}}


def merc(lon, lat):
    lat = math.radians(max(-85.0, min(85.0, lat)))
    return (lon + 180.0) / 360.0, (1.0 - math.log(math.tan(lat) + 1.0 / math.cos(lat)) / math.pi) / 2.0


def topo_countries(topo):
    (sx, sy), (tx, ty) = topo["transform"]["scale"], topo["transform"]["translate"]
    arcs = []
    for arc in topo["arcs"]:
        x = y = 0; pts = []
        for dx, dy in arc:
            x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
        arcs.append(pts)

    def ring(ids):
        out = []
        for i in ids:
            pts = arcs[i] if i >= 0 else arcs[~i][::-1]
            out.extend(pts[1:] if out else pts)
        return out
    out = []
    for g in topo["objects"]["countries"]["geometries"]:
        polys = g.get("arcs") or []
        polys = [polys] if g["type"] == "Polygon" else polys if g["type"] == "MultiPolygon" else []
        out.append([[ring(r) for r in poly] for poly in polys])
    return out


def geo_polygons(g):
    if not g: return []
    if g.get("type") == "Polygon": return [g["coordinates"]]
    if g.get("type") == "MultiPolygon": return list(g["coordinates"])
    return []


class View:
    def __init__(self, bbox):
        (x0, y1), (x1, y0) = merc(bbox[2], bbox[0]), merc(bbox[3], bbox[1])
        span = max(x1 - x0, (y1 - y0) * W / H) * PAD
        self.k = W / span
        self.ox, self.oy = (x0 + x1) / 2 - span / 2, (y0 + y1) / 2 - span * H / W / 2

    def px(self, lon, lat):
        x, y = merc(lon, lat)
        return (x - self.ox) * self.k, (y - self.oy) * self.k


def ring_path(ring, view, tol):
    raw = [view.px(lon, lat) for lon, lat in ring]
    if len(raw) < 3: return ""
    xs, ys = [p[0] for p in raw], [p[1] for p in raw]
    if max(xs) < -CLIP * W or min(xs) > (1 + CLIP) * W or max(ys) < -CLIP * H or min(ys) > (1 + CLIP) * H: return ""
    if max(xs) - min(xs) < tol and max(ys) - min(ys) < tol: return ""
    pts = []
    for x, y in raw:
        x, y = min(max(x, -CLIP * W), (1 + CLIP) * W), min(max(y, -CLIP * H), (1 + CLIP) * H)
        if not pts or abs(x - pts[-1][0]) + abs(y - pts[-1][1]) >= tol: pts.append((x, y))
    if len(pts) < 3: return ""
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + "Z"


def polys_path(polys, view, tol):
    return "".join(ring_path(r, view, tol) for poly in polys for r in poly)


def v0(spot, w1):
    w0 = min(W, w1 * V0_X); h0 = w0 * H / W
    x = min(max(spot[0] - w0 / 2 + V0_PAN[0] * w0, 0), W - w0); y = min(max(spot[1] - h0 / 2 + V0_PAN[1] * h0, 0), H - h0)
    return [round(x, 2), round(y, 2), round(w0, 2), round(h0, 2)]


def shape_doc(loc, countries, frame, area):
    view = View(loc["bbox"])
    spot, aw = view.px(loc["lon"], loc["lat"]), 0.0
    if area:
        pts = [view.px(lon, lat) for poly in area for lon, lat in poly[0]]
        xs, ys = [p[0] for p in pts], [p[1] for p in pts]
        spot, aw = ((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2), max(max(xs) - min(xs), (max(ys) - min(ys)) * W / H)
    w1 = min(max(aw * V1_AREA, W * V1_MIN), W * V1_MAX)
    tol = TOL * w1 / W
    land = [d for d in (polys_path(c, view, tol) for c in countries) if d]
    return {"w": W, "h": H, "land": land, "region": polys_path(frame, view, tol), "area": polys_path(area, view, tol / 4),
            "spot": [round(spot[0], 2), round(spot[1], 2)], "v0": v0(spot, w1),
            "v1": [round(spot[0] - w1 / 2, 2), round(spot[1] - w1 * H / W / 2, 2), round(w1, 2), round(w1 * H / W, 2)]}


def world():
    for p in (ROOT / "node_modules" / "world-atlas" / "countries-10m.json", ROOT / "cache" / "world-10m.json",
              ROOT.parent / "templates" / "node_modules" / "world-atlas" / "countries-10m.json"):
        if p.exists(): return topo_countries(json.loads(p.read_text(encoding="utf-8")))
    topo = _get(WORLD_URL)
    p = ROOT / "cache" / "world-10m.json"; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(topo), encoding="utf-8")
    return topo_countries(topo)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("place"); ap.add_argument("region")
    ap.add_argument("--frames", type=int, default=180)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--out")
    ap.add_argument("--theme", default="horror", help="PlaceMap look: horror | geo | atlas | news (src/map/themes.ts)")
    ap.add_argument("--sub", default="", help="second line under the name")
    a = ap.parse_args()
    geo = Geocoder()
    loc = locate(a.place, a.region, geo)
    if not loc:
        sys.exit(f"Nominatim does not know {a.place!r}, {a.region!r}: no map card, show footage instead")
    find = loc["find"]
    frame = geo.search(**find["frame"], polygon_geojson=1, polygon_threshold=OUTLINE)
    own = find.get("place") and find["place"] != find["frame"]
    hit = geo.search(**find["place"], polygon_geojson=1, polygon_threshold=OUTLINE / 20) if own else None
    doc = shape_doc(loc, world(), geo_polygons((frame or {}).get("geojson")), geo_polygons((hit or {}).get("geojson")))
    label = ", ".join(p for p in (a.place, (loc["sub"] or "").split(",")[0].strip()) if p).upper()
    props = {"text": label, "sub": a.sub, "theme": a.theme, "width": W, "height": H, "fps": a.fps, "frames": a.frames, "map": doc}
    out = Path(a.out) if a.out else ROOT / "props" / "place-map" / (a.place.lower().replace(" ", "-") + "-map.json")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(props), encoding="utf-8")
    print(f"{label}: {len(doc['land'])} land paths, region {'yes' if doc['region'] else 'no'}, "
          f"area {'yes' if doc['area'] else 'point'} -> {out}")


if __name__ == "__main__":
    main()
