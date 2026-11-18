#!/usr/bin/env bash
# map clips (PC) -> lint -> stills (GitHub) -> farm render (GitHub, picture + audio mix + master in farm_entry) -> QC. Git Bash on the PC.
#   bash tools/autoedit/run_all.sh <production rel> <edit rel> [sample <parts>|full] [--no-stills]
# rel = relative to the root folder (render farm video). Stops at the first failing step (lint fix list is printed).
set -euo pipefail
NOSTILLS=0; POS=()                     # --no-stills may stand anywhere (review 2026-11-18: it was read as MODE)
for x in "$@"; do if [ "$x" = --no-stills ]; then NOSTILLS=1; else POS+=("$x"); fi; done
PROD=${POS[0]:?production rel}; EDIT=${POS[1]:?edit rel}; MODE=${POS[2]:-full}; PARTS=${POS[3]:-}
[ "$MODE" = sample ] || [ "$MODE" = full ] || { echo "mode must be sample or full"; exit 1; }
A=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$A/../.." && pwd); cd "$ROOT"
WORK=${FARM_WORK:-$ROOT/case-work}; [ -n "${FARM_WORK:-}" ] || [ -d "$WORK" ] || [ ! -d "$ROOT/../case-work" ] || WORK=$(cd "$ROOT/.." && pwd)/case-work
T0=$SECONDS; step() { echo "[$((SECONDS - T0))s] $*"; }
step "0/5 map clips on the PC (owner 2026-11-16)"; python -X utf8 "$A/assets/make_maps_pc.py" "$EDIT"   # compiles; skips fresh clips
step "1/5 compile + lint"; python -X utf8 "$A/lint.py" "$EDIT"            # compiles timeline.json; exit 1 = fix list
if [ "$NOSTILLS" = 0 ]; then
  step "2/5 stills on GitHub (one machine per case)"; python -X utf8 "$A/stills_github.py" "$PROD" "$EDIT"
  echo "contact sheets: $EDIT/qa/*_contact.jpg  (check vs refs before the render)"
fi
FARM=$WORK/farm-$(basename "$PROD")
step "3/5 stage farm project $FARM"; python -X utf8 "$A/stage_farm.py" "$PROD" "$EDIT" "$FARM"
step "4/5 farm render ($MODE)"; FLOG=$(mktemp); trap 'rm -f "$FLOG"' EXIT
bash "$ROOT/tools/case-farm/farm.sh" "$MODE" "$FARM" ${PARTS:+"$PARTS"} | tee "$FLOG"
OUT=$(sed -n 's/^DONE: //p' "$FLOG" | tail -1 | tr -d '')    # the MP4 this run made (not just the newest file)
if [ "$MODE" = sample ] && [ -n "$OUT" ]; then
  step "5/5 QC $OUT"; python -X utf8 "$A/qc.py" "$OUT" "$EDIT/timeline.json"
else
  step "5/5 QC: full renders land on Drive; run: bash tools/case-farm/task.sh autoedit-qc --cmd 'python tools/autoedit/qc.py {item} $EDIT/timeline.json' --items <mp4 rel> --in <mp4 rel> tools/autoedit $EDIT/timeline.json --out $EDIT/qa"
fi
