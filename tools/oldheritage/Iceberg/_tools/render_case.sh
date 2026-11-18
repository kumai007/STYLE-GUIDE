#!/bin/bash
# render_case.sh <KEY> [allow windows a-b,a-b] [--still SEC out.png]
#   full: waits for the single render slot (owner: leave RAM free), renders, cut-checks, masters (-16 LUFS) and makes the phone copy:
#   build/CASEnn/out/<KEY>_raw.mp4, <KEY>.mp4 (master), <KEY>_phone.mp4
#   still: renders one frame (no slot) for checking.
KEY=$1; I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg; E=$I/_engine; cd $E
P=$E/pubs/$KEY; bash $I/_tools/pubsync.sh $KEY || exit 1  # refresh hard links (new graded media)
O=$(awk -F'\t' '$1=="case"{print $2}' $P/.src)/out; mkdir -p $O
R=./node_modules/.bin/remotion
if [ "$2" == "--still" ] || [ "$3" == "--still" ]; then
  [ "$2" == "--still" ] && { T=$3; OUT=$4; } || { T=$4; OUT=$5; }
  $R still src/entries/$KEY.tsx $KEY "$OUT" --public-dir=$P --frame=$(python3 -c "print(round($T*30))") --gl=angle --log=error; exit $?
fi
ALLOW=$2
L=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/scratch/render_slots; mkdir -p $L
while true; do [ -e /tmp/iceberg_pause ] && { sleep 15; continue; }; for s in 1 2 3; do if mkdir $L/s$s 2>/dev/null; then SLOT=$s; break 2; fi; done; sleep 15; done
trap "rmdir $L/s$SLOT" EXIT
ok=0; for try in 1 2 3; do $R render src/entries/$KEY.tsx $KEY $O/${KEY}_raw.mp4 --public-dir=$P --gl=angle --concurrency=8 --offthreadvideo-cache-size-in-bytes=1500000000 --crf=16 --log=error --timeout=900000 && { ok=1; break; }; while [ -e /tmp/iceberg_pause ]; do sleep 15; done; done; [ $ok = 1 ] || exit 1
rmdir $L/s$SLOT; trap - EXIT
python3 $I/_tools/cutcheck.py $O/${KEY}_raw.mp4 ${ALLOW:+--allow $ALLOW} | tail -8
ffmpeg -y -v error -i $O/${KEY}_raw.mp4 -c:v copy -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 44100 -c:a aac -b:a 256k $O/$KEY.mp4
ffmpeg -y -v error -i $O/$KEY.mp4 -vf scale=1280:-2 -c:v libx264 -b:v 1350k -maxrate 1600k -bufsize 3000k -preset medium -c:a aac -b:a 128k -ar 44100 $O/${KEY}_phone.mp4
ls -la $O/$KEY.mp4 $O/${KEY}_phone.mp4
