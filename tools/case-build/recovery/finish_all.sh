#!/bin/bash
# EXAMPLE ONLY (coc2h-vol1 recovery, 2026-11-18): hard-coded run ids, tags and paths. Copy, adapt, then remove the exit.
echo "EXAMPLE script: copy and adapt it first (see header)"; exit 2
# wait for the rest runs, download all pieces (run16, fix1, rest1, rest2), splice to plan chunks, join, master loudness
P=${P:?set P=<case-work farm project dir>}   # template from coc2h-vol1 (2026-11-18)
ML="$(cd "$(dirname "$0")/.." && pwd)/master_loudness.sh"
D=C:/Users/ayush/Videos/CLAUDE/case-work/renders
L=$D/coc2h-vol1_full_30p_preview
for run in 44230128043 44230180045; do
  while true; do
    s=$(gh run view $run -R DeZAYU/case-farm --json status -q .status 2>/dev/null)
    [ "$s" = completed ] && break; sleep 60
  done
  echo "run $run completed: $(gh run view $run -R DeZAYU/case-farm --json conclusion -q .conclusion)"
done
for t in coc2h-vol1-20261118-062036 coc2h-vol1-20261118-fix1 coc2h-vol1-20261118-rest1 coc2h-vol1-20261118-rest2 coc2h-vol1-20261118-rest3 coc2h-vol1-20261118-rest4 coc2h-vol1-20261118-rest5; do
  mkdir -p $L/pieces/$t
  find $L/pieces/$t -name "*.partial" -delete
  rclone copy gdrive:_cloud-jobs/_runs/$t/chunks $L/pieces/$t --transfers 16 --size-only
done
rclone copy gdrive:_cloud-jobs/_runs/coc2h-vol1-20261118-062036/audio $L/audio --transfers 8 --size-only
cp $P/plan.json $L/plan.json
rm -rf $L/chunks
python -I $P/splice_all.py $P/manifest.json $L/pieces $L/chunks $P/plan.json || { echo SPLICE_FAILED; exit 1; }
F=$D/coc2h-vol1_full_30p_farm_$(date +%Y-%m-%d_%H-%M-%S).mp4
bash C:/Users/ayush/Videos/CLAUDE/GITHUB/tools/case-farm/farm/join.sh $L/plan.json $L $F || { echo JOIN_FAILED; exit 1; }
echo "JOINED $F"
cd $D && bash "$ML" $F
echo "FINISH_OK"
date +%s > $P/full_end.txt
