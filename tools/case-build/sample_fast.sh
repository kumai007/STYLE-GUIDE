#!/usr/bin/env bash
# One command from case code to a sample MP4: build every part, then one farm sample run.
#   bash tools/case-build/sample_fast.sh <farm project dir> <part,part,...>
# `hyperframes check` (~55 s per part, it opens a browser) runs at the same time as the farm, not before it.
# Its result prints at the end; a part with errors is marked CHECK_FAILED (fix it and run again).
# Prints the time of each step. Target: 10 min of video in under 5 min (docs/workflow/FAST_LONG_VIDEO.md).
set -euo pipefail
PROJ=${1:?farm project dir}; PARTS=${2:?part,part}
HERE=$(cd "$(dirname "$0")" && pwd); ROOT=$(cd "$HERE/../.." && pwd)
ENG="$ROOT/styleguide/gx-admixdd/hf-engine"
FARM="$(cd "$ROOT/../../.." && pwd)/tools/case-farm"            # worktree: .claude/worktrees/<name> -> GITHUB
[ -f "$FARM/farm.sh" ] || FARM="$(cd "$ROOT/.." && pwd)/tools/case-farm"
[ -f "$FARM/farm.sh" ] || FARM="$ROOT/tools/case-farm"
LOGS=$(mktemp -d); T0=$SECONDS; step() { echo "[$((SECONDS - T0))s] $*"; }
step "build: $PARTS"
cd "$ENG"
for p in ${PARTS//,/ }; do
  node build.mjs "$p" > "$LOGS/build_$p.log" 2>&1 || { echo "BUILD FAILED $p"; tail -5 "$LOGS/build_$p.log"; exit 1; }
done
CK=()
for p in ${PARTS//,/ }; do
  npx --yes hyperframes@0.9.56 check "parts/$p" > "$LOGS/check_$p.log" 2>&1 & CK+=($!)
done
step "farm sample (checks run at the same time)"
cd "$FARM"
FARM_NO_OPEN=1 bash farm.sh sample "$PROJ" "$PARTS"
step "farm done, waiting for checks"
i=0
for p in ${PARTS//,/ }; do
  RC=0; wait "${CK[$i]}" || RC=$?; i=$((i + 1))     # a crashed check (npx/network) is a failure, not "0 errors"
  E=$(grep -oE '^ *[0-9]+ error\(s\)' "$LOGS/check_$p.log" | awk '{s += $1} END {print s + 0}')
  if [ "$RC" = 0 ] && [ "$E" = 0 ]; then echo "CHECK_OK $p"
  else echo "CHECK_FAILED $p (exit $RC, $E errors): $LOGS/check_$p.log"; fi
done
step "DONE"
