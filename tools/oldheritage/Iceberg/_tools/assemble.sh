#!/bin/bash
# assemble.sh <VID>  -> <video>/build/<VID>_FULL.mp4 + <VID>_FULL_phone.mp4 (≤ 30 MB)
# Order: intro 00, cases 01..30 (WP: level pieces L1..L5 before 01/07/13/18/25; any case with out/<VID>nn_T.mp4 = its case-number
# transition from _tools/make_transitions.py, played right before it), outro 99; missing pieces are listed and skipped.
# Pieces differ in timebase (render_case: 1/15360, raw_extend splices: 1/90000), which breaks a straight stream-copy concat,
# so each piece's video is remuxed to timescale 15360 and its audio decoded to 48 kHz WAV; video is concatenated by copy,
# audio is concatenated as PCM, loudness-normalised once (-16 LUFS, TP -1.5) and encoded once.
I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg
case $1 in TOR) D=$I/03_Tornado;; ND) D=$I/01_Natural_Disasters;; TP) D=$I/02_Theme_Park;; WP) D=$I/04_Workplace;; DC) D=$I/05_Dashcam;; BD) D=$I/06_Before_Disasters;; IN) D=$I/07_Incidents;; ZO) D=$I/08_Zoo;; AM) D=$I/09_Amusement_Iceberg;; FF) D=$I/10_Fast_Food_Iceberg;; *) echo "usage: assemble.sh TOR|ND|TP|WP"; exit 1;; esac
W=$D/build/assemble_tmp; rm -rf $W; mkdir -p $W
VL=$W/v.txt; AL=$W/a.txt; : > $VL; : > $AL; tot=0; np=0
# WP only: the level pieces build/LEVELk/out/WPLk.mp4 go right before cases 01, 07, 13, 18, 25 (keys L1..L5)
PIECES=""
for n in 00 $(seq -w 1 30) 99; do
  if [ "$1" == "WP" ]; then case $n in 01) PIECES="$PIECES L1";; 07) PIECES="$PIECES L2";; 13) PIECES="$PIECES L3";; 18) PIECES="$PIECES L4";; 25) PIECES="$PIECES L5";; esac; fi
  # case-number transition (_tools/make_transitions.py): build/CASEnn/out/<VID>nn_T.mp4 goes right before the case (DC, IN)
  case $n in 00|99) ;; *) [ -f $D/build/CASE$n/out/$1${n}_T.mp4 ] && PIECES="$PIECES T$n";; esac
  PIECES="$PIECES $n"
done
for n in $PIECES; do
  case $n in L*) f=$D/build/LEVEL${n#L}/out/$1$n.mp4; dd=$D/build/LEVEL${n#L};;
    T*) f=$D/build/CASE${n#T}/out/$1${n#T}_T.mp4; dd=$D/build/CASE${n#T}; [ -f $D/build/CASE${n#T}/out/$1${n#T}.mp4 ] || continue;;  # no transition without its case
    *) f=$D/build/CASE$n/out/$1$n.mp4; dd=$D/build/CASE$n;; esac
  if [ ! -f $f ]; then [ -d $dd ] && echo "MISSING $1$n"; continue; fi
  # exact video length (frames / fps), so each piece's audio is cut to its picture and nothing drifts across pieces
  d=$(ffprobe -v error -select_streams v:0 -count_packets -show_entries stream=nb_read_packets,r_frame_rate -of csv=p=0 $f | python3 -c "import sys; r,n=[x for x in sys.stdin.read().strip().split(',') if x][:2]; a,b=r.split('/'); print(int(n)*int(b)/int(a))")
  # guard: an empty length would make apad run forever (it once filled the disk)
  python3 -c "import sys; sys.exit(0 if float('${d:-0}') > 1 else 1)" || { echo "BAD LENGTH for $f"; exit 1; }
  ffmpeg -v error -y -i $f -map 0:v:0 -c copy -video_track_timescale 15360 $W/v$n.mp4 || exit 1
  ffmpeg -v error -y -i $f -map 0:a:0 -ac 2 -ar 48000 -af "aresample=async=1:first_pts=0,apad=whole_dur=$d" -t $d -c:a pcm_s24le $W/a$n.wav || exit 1
  echo "file '$W/v$n.mp4'" >> $VL; echo "file '$W/a$n.wav'" >> $AL
  tot=$(python3 -c "print($tot+$d)"); np=$((np+1))
done
O=$D/build/$1_FULL.mp4
ffmpeg -v error -y -f concat -safe 0 -i $VL -c copy $W/video.mp4 || exit 1
ffmpeg -v error -y -f concat -safe 0 -i $AL -af "loudnorm=I=-16:TP=-1.5:LRA=11" -ar 48000 -c:a aac -b:a 256k $W/audio.m4a || exit 1
ffmpeg -v error -y -i $W/video.mp4 -i $W/audio.m4a -map 0:v -map 1:a -c copy -movflags +faststart $O || exit 1
got=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $O)
echo "pieces $tot s -> full $got s: $O"
gv=$(ffprobe -v error -select_streams v:0 -show_entries stream=duration -of csv=p=0 $O | tr -d ',')
ga=$(ffprobe -v error -select_streams a:0 -show_entries stream=duration -of csv=p=0 $O | tr -d ',')
echo "video $gv s, audio $ga s ($np pieces)"
python3 -c "import sys; sys.exit(0 if abs($gv-$tot) < 0.5 and abs($ga-$gv) < 0.1 else 1)" || { echo "LENGTH MISMATCH"; exit 1; }
# phone copy: 540p, bitrate sized for ≤ 30 MB
vb=$(python3 -c "print(max(150, int(29*8*1024/$got - 64)))")
ffmpeg -v error -y -i $O -vf scale=-2:540 -c:v libx264 -preset medium -b:v ${vb}k -maxrate $((vb*2))k -bufsize $((vb*4))k \
  -c:a aac -b:a 64k -movflags +faststart ${O%.mp4}_phone.mp4 && ls -la $O ${O%.mp4}_phone.mp4
rm -rf $W
