#!/usr/bin/env bash
# Hybrid case build: the cloud renders the shots (many machines at once), this laptop joins them.
# Run in Git Bash on the laptop:
#   bash .github/scripts/case-hybrid.sh "<case folder>" [job] [parts]
#     <case folder> = production folder (has build/, sources/, narration/). It is only READ, never changed.
#     job           = Drive folder name in gdrive:_cloud-jobs (default abyssal-01)
#     parts         = cloud machines for the shots, 1-20 (default 18)
#   Optional env: SCRIPT (default build_v4.py), OUTNAME (file the script writes in renders/),
#                 WORK (local work folder, default ~/Videos/CLAUDE/case-work)
# Output: $WORK/renders/<name>_hybrid_<date>_<time>.mp4
set -euo pipefail

CASE=$(cd "${1:?Give the case folder}" && pwd)
JOB=${2:-abyssal-01}
PARTS=${3:-18}
SCRIPT=${SCRIPT:-build_v4.py}
OUTNAME=${OUTNAME:-abyssal_intro_case01_v4.mp4}
WORK=${WORK:-$HOME/Videos/CLAUDE/case-work}
JW="$WORK/$JOB"                                   # local work copy of the case
REPO=$(cd "$(dirname "$0")/../.." && pwd)
FILTER="$REPO/.github/scripts/case-filter.txt"
RCLONE=$(command -v rclone || ls "$(cygpath "$LOCALAPPDATA")"/Microsoft/WinGet/Packages/Rclone.Rclone*/rclone-*/rclone.exe 2>/dev/null | head -1)
[ -n "$RCLONE" ] || { echo "rclone not found"; exit 1; }

T0=$SECONDS
step() { echo "[$((SECONDS - T0))s] $*"; }

# Safety: the work folder must be our own (marker file), and never the case folder itself.
mkdir -p "$JW"
JW=$(cd "$JW" && pwd)
[ "$JW" != "$CASE" ] || { echo "Work folder is the case folder. Stop."; exit 1; }
[ -f "$JW/.case-work" ] || [ -z "$(ls -A "$JW")" ] || { echo "$JW is not empty and not a work folder. Stop."; exit 1; }
touch "$JW/.case-work"

# 1. Send the current case files to Drive. Only changed files upload.
step "1/6 Send changed case files to Drive"
"$RCLONE" sync "$CASE" "gdrive:_cloud-jobs/$JOB" --filter-from "$FILTER" --transfers 8 -q

# 2. Start the cloud build in "laptop join" mode (the cloud only renders the shots).
step "2/6 Start cloud shots ($PARTS machines)"
URL=$(cd "$REPO" && gh workflow run case-build.yml --ref main -f job="$JOB" -f parts="$PARTS" \
      -f script="$SCRIPT" -f output="$OUTNAME" -f join=laptop 2>&1 | grep -o 'https://[^ ]*/runs/[0-9]*' || true)
[ -n "$URL" ] || { echo "Could not start the cloud run."; exit 1; }
RUN=${URL##*/}
TMP="gdrive:_cloud-jobs/_runs/$RUN"
trap '"$RCLONE" purge "$TMP" 2>/dev/null || true' EXIT   # always delete this run's temp shots in Drive
echo "    $URL"

# 3. While the cloud works: refresh the local work copy (old shots out first).
step "3/6 Refresh local work copy: $JW"
rm -rf "$JW/build/seg_v4"; rm -f "$JW"/build/aud/r??s_*.mp4 "$JW"/build/picture*
"$RCLONE" sync "$CASE" "$JW" --filter-from "$FILTER" -q
mkdir -p "$JW/renders"

# 4. Wait for the cloud shots.
step "4/6 Wait for cloud shots"
(cd "$REPO" && gh run watch "$RUN" --exit-status --interval 15 > /dev/null) || { echo "Cloud run failed: $URL"; exit 1; }

# 5. Download the shots.
#    Many machines upload at once, so Drive can make 2 folders with the same name. dedupe merges them first.
step "5/6 Download shots"
"$RCLONE" dedupe --dedupe-mode skip "gdrive:_cloud-jobs/_runs" -q
"$RCLONE" copy "$TMP/seg_v4" "$JW/build/seg_v4" --transfers 8 -q
"$RCLONE" copy "$TMP/aud" "$JW/build/aud" -q
echo "    shots: $(ls "$JW/build/seg_v4" | wc -l)"
#    Stop if a shot is missing (the timeline file lists every shot).
python -I - "$JW/build/timeline_v4.json" "$JW/build/seg_v4" <<'PY'
import json, os, sys
T = json.load(open(sys.argv[1], encoding='utf-8')); have = {f[:-4] for f in os.listdir(sys.argv[2])}
miss = [s['name'] for s in T if s['name'] not in have]
if miss: sys.exit(f'Missing shots: {miss}')
PY

# 6. Join picture + mix sound on the laptop. Full log: $JW/join.log
step "6/6 Join picture and mix sound (laptop)"
cd "$JW/build"
python -I -X utf8 "$SCRIPT" pic > "$JW/join.log" 2>&1 || { tail -30 "$JW/join.log"; exit 1; }
python -I -X utf8 "$SCRIPT" audio >> "$JW/join.log" 2>&1 || { tail -30 "$JW/join.log"; exit 1; }
mkdir -p "$WORK/renders"
FINAL="$WORK/renders/${OUTNAME%.mp4}_hybrid_$(date +%Y-%m-%d_%H-%M-%S).mp4"
mv "$JW/renders/$OUTNAME" "$FINAL"
rm -f "$JW"/build/picture*                       # 1 GB temp file, work copy only
ffprobe -v error -show_entries format=duration,size -of default=nw=1 "$FINAL"
step "DONE: $FINAL"
