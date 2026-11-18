#!/usr/bin/env bash
# Master loudness after the farm join (join.sh only limits true peak to -1.05 dBTP; it does NOT normalise loudness).
#   bash master_loudness.sh IN.mp4 [OUT.mp4]  -> -16 LUFS integrated (+-0.5), <= -1.5 dBTP. Video stream copied.
# One static gain for the whole part mix (VO/music/SFX balance untouched), then a true-peak limiter (peaks only).
set -euo pipefail
IN=${1:?input mp4}; OUT=${2:-${IN%.mp4}_m16.mp4}; TGT=-16; TPMAX=-1.5
meas() { ffmpeg -nostats -hide_banner -i "$1" -map 0:a:0 -af ebur128=peak=true -f null - 2>&1 | tr -d '\r' |
  awk '/Integrated loudness:/{f=1} f&&/ I:/{i=$2} /True peak:/{g=1} g&&/Peak:/{p=$2} END{print i, p}'; }
read -r I0 P0 < <(meas "$IN"); echo "in: I $I0 LUFS, TP $P0 dBTP"
G=$(python -c "print(round($TGT - ($I0), 2))"); LIM=0.79
for t in 1 2 3 4 5 6; do
  ffmpeg -v error -y -i "$IN" -map 0:v:0 -map 0:a:0 -c:v copy -af "volume=${G}dB,alimiter=limit=$LIM:level=disabled:attack=3:release=60,aresample=48000" \
    -c:a aac -b:a 256k -movflags +faststart "$OUT"
  read -r I1 P1 < <(meas "$OUT"); echo "try $t: gain ${G} dB limit $LIM -> I $I1, TP $P1"
  python -c "import sys; i,p=float(sys.argv[1]),float(sys.argv[2]); sys.exit(0 if p <= $TPMAX and abs(i-($TGT))<=0.5 else 1)" "$I1" "$P1" && { echo "OK $OUT"; exit 0; }
  python -c "import sys; sys.exit(0 if float(sys.argv[1]) <= $TPMAX else 1)" "$P1" || LIM=$(python -c "print(round($LIM*10**(-0.5/20),3))")
  G=$(python -c "print(round($G + ($TGT) - ($I1), 2))")
done
echo "CHECK loudness not reached: I $I1 TP $P1 (limiter is working hard: lower the music/SFX in the part mix instead)"; exit 1
