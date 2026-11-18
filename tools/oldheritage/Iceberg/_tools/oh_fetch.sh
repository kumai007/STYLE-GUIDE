#!/bin/bash
# oh_fetch.sh <video dir>... : downloads every link in footage/LINKS.csv into footage/cNN/ (YouTube ≤1080p + info.json via yt-dlp,
# Wikimedia Commons files via Special:FilePath, other pages saved as .html for capture). Skips what exists. Log: footage/fetch.log
for V in "$@"; do
  python3 - "$V" <<'PY' | while IFS=$'\t' read -r C URL; do
import csv,sys
for r in csv.DictReader(open(sys.argv[1]+"/footage/LINKS.csv")): print(f"{int(r['case']):02d}\t{r['url']}")
PY
    D="$V/footage/c$C"; mkdir -p "$D"; L="$V/footage/fetch.log"
    if [[ "$URL" == *youtube.com* || "$URL" == *youtu.be* ]]; then
      ID=$(echo "$URL" | sed -E 's/.*(v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11}).*/\2/')
      ls "$D"/$ID.* 2>/dev/null | grep -q -v json && continue
      yt-dlp -q --no-warnings --cookies-from-browser chrome -f "bv*[height<=1080]+ba/b[height<=1080]/b" --merge-output-format mp4 --write-info-json -o "$D/$ID.%(ext)s" "https://www.youtube.com/watch?v=$ID" >> "$L" 2>&1 && echo "OK $C $ID" >> "$L" || echo "FAIL $C $URL" >> "$L"
      sleep 15
    elif [[ "$URL" == *commons.wikimedia.org/wiki/File:* ]]; then
      F=$(python3 -c "import sys,urllib.parse as u;print(u.unquote(sys.argv[1].split('File:',1)[1].split('#')[0].split('?')[0]))" "$URL")
      [ -f "$D/$F" ] && continue
      curl -sL -A "OldHeritageFiles/1.0 (research)" -o "$D/$F" "https://commons.wikimedia.org/wiki/Special:FilePath/$(python3 -c "import sys,urllib.parse as u;print(u.quote(sys.argv[1]))" "$F")" && echo "OK $C $F" >> "$L" || echo "FAIL $C $URL" >> "$L"
      sleep 1
    else
      N=$(echo "$URL" | md5sum | cut -c1-8).html; [ -f "$D/$N" ] && continue
      curl -sL -A "Mozilla/5.0" -o "$D/$N" "$URL" && echo "PAGE $C $URL -> $N" >> "$L" || echo "FAIL $C $URL" >> "$L"
    fi
  done
done
echo ALLDONE
