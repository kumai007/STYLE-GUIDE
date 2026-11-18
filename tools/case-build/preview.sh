#!/usr/bin/env bash
# Live preview of parts with Final Phase Lite: no render. Builds the parts, then opens the window on the gx engine.
#   bash tools/case-build/preview.sh <part,part,...> [--no-open] [--port N]
# Example (10-min sample): bash tools/case-build/preview.sh <intro_id>,<case1_id>   (hf-engine cases/<id>.mjs)
# The window plays parts/<id>/index.html live and reloads when a part is rebuilt. Notes sent from the window run
# Claude in hf-engine (rules: hf-engine/CLAUDE.md: change cases/<id>.mjs, then node build.mjs <id>; never parts/).
# Stop: Ctrl+C (notes stay in hf-engine/.final-phase-lite/). Final render after owner OK: bash tools/autoedit/run_all.sh <production> <edit> full.
set -euo pipefail
PARTS=${1:?part,part}; shift
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../.." && pwd)
ENG="$ROOT/styleguide/gx-admixdd/hf-engine"; FPL="$ROOT/tools/final-phase-lite/server.mjs"
[ -f "$FPL" ] || { echo "Final Phase Lite missing: $FPL"; exit 1; }
T0=$SECONDS; cd "$ENG"; LOGS=$(mktemp -d); trap 'rm -rf "$LOGS"' EXIT
for p in ${PARTS//,/ }; do
  [ -f "cases/$p.mjs" ] || { echo "no case file: cases/$p.mjs"; exit 1; }
  node build.mjs "$p" > "$LOGS/build_$p.log" 2>&1 || { echo "BUILD FAILED $p"; tail -5 "$LOGS/build_$p.log"; exit 1; }
  echo "[$((SECONDS - T0))s] built parts/$p"
done
echo "Pick the part in the window's 'Live:' list (parts/<id>)."
exec node "$FPL" "$ENG" "$@"
