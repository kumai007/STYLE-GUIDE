#!/bin/bash
# EXAMPLE ONLY (coc2h-vol1 recovery, 2026-11-18): hard-coded run ids, tags and paths. Copy, adapt, then remove the exit.
echo "EXAMPLE script: copy and adapt it first (see header)"; exit 2
# splice + join + master loudness from the already downloaded pieces
P=${P:?set P=<case-work farm project dir>}   # template from coc2h-vol1 (2026-11-18)
ML="$(cd "$(dirname "$0")/.." && pwd)/master_loudness.sh"
D=C:/Users/ayush/Videos/CLAUDE/case-work/renders
L=$D/coc2h-vol1_full_30p_preview
rm -rf $L/chunks
python -I $P/splice_all.py $P/manifest.json $L/pieces $L/chunks $P/plan.json || { echo SPLICE_FAILED; exit 1; }
rm -f $D/coc2h-vol1_full_30p_farm_*.mp4
F=$D/coc2h-vol1_full_30p_farm_$(date +%Y-%m-%d_%H-%M-%S).mp4
bash C:/Users/ayush/Videos/CLAUDE/GITHUB/tools/case-farm/farm/join.sh $L/plan.json $L $F || { echo JOIN_FAILED; exit 1; }
echo "JOINED $F"
cd $D && bash "$ML" $F
echo "FINISH_OK"
date +%s > $P/full_end.txt
