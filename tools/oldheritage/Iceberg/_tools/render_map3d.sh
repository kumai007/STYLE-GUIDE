#!/bin/bash
# render_map3d.sh <case.json> <out dir> <shot...> [--still <frame>]
# 3-D map shots with Three.js (Remotion), no Blender. Same case.json as the old blender_map.py.
# Output: <out dir>/<shot>.mp4 (1920x1080, 30 fps, crf 12), or <out dir>/<shot>_f<frame>.png with --still.
set -e
I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg; E=$I/_engine
cfg="$1"; out="$2"; shift 2; mkdir -p "$out"; out=$(cd "$out" && pwd)
[ -f "$cfg" ] || { echo "no case.json: $cfg"; exit 1; }
cdir=$(cd "$(dirname "$cfg")" && pwd); cname=$(basename "$cfg"); cfg="$cdir/$cname"
STILL=""; shots=()
while [ $# -gt 0 ]; do case "$1" in --still) STILL=$2; shift 2;; *) shots+=("$1"); shift;; esac; done
[ ${#shots[@]} -gt 0 ] || { echo "usage: render_map3d.sh <case.json> <out dir> <shot...> [--still <frame>]"; exit 1; }
# job public dir (hard-link tree via pubsync.sh): map -> the case.json folder, fonts -> engine fonts
P=$E/pubs/_MAP/$(echo "$cdir" | md5sum | cut -c1-8); mkdir -p "$P"
printf 'map\t%s\nfonts\t%s\n' "$cdir" "$E/public/fonts" > "$P/.src"; bash "$I/_tools/pubsync.sh" "$P"
[ "$cname" = "case.json" ] || cp -f "$cfg" "$P/map/case.json"
cd "$E"
for sh in "${shots[@]}"; do
  props="$P/props_$sh.json"
  python - "$cfg" "$sh" "$E/public/fonts" > "$props" <<'PY'
import json, os, sys
c = json.load(open(sys.argv[1], encoding="utf-8")); s = sys.argv[2]
if s not in c.get("shots", {}): sys.exit(f"shot {s} not in case.json (have: {', '.join(c.get('shots', {}))})")
f = os.path.basename(c.get("font") or ""); f = f if f and os.path.exists(os.path.join(sys.argv[3], f)) else "D-DIN-Bold.otf"
print(json.dumps({"dir": "map", "shot": s, "frames": int(c["shots"][s]["frames"]), "font": f}))
PY
  if [ -n "$STILL" ]; then
    ./node_modules/.bin/remotion still src/entries/MAP3D.tsx MAP3D "$out/${sh}_f$STILL.png" --props="$props" --public-dir="$P" \
      --frame=$((STILL - 1)) --gl=angle --log=error && echo "still $out/${sh}_f$STILL.png"
  else
    ./node_modules/.bin/remotion render src/entries/MAP3D.tsx MAP3D "$out/$sh.mp4" --props="$props" --public-dir="$P" \
      --gl=angle --crf=12 --concurrency=4 --log=error && echo "done $out/$sh.mp4"
  fi
done
