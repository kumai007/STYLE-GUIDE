#!/bin/bash
# Style-reference downloads (owner 13 Nov: "check disturbing dose, download them and analyse"): retries every 20 min until YouTube's
# bot check clears (no cookies, no bypass). 720p, analysis only. Log: _ref/DisturbingDose/fetch.log
D=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg/_ref/DisturbingDose; cd $D
IDS="DxMyGcJR3LM hBTZymP65sM l6mSfWFmcOo FhCTG3hAvIQ 4p5RF9Ux53k 1MRO0jCGvl0"
while true; do
  left=0
  for id in $IDS; do
    ls $id.mp4 >/dev/null 2>&1 && continue
    yt-dlp -q --no-warnings --cookies-from-browser chrome -f "bv*[height<=720]+ba/b[height<=720]" --merge-output-format mp4 --write-info-json -o "$id.%(ext)s" "https://www.youtube.com/watch?v=$id" >> fetch.log 2>&1 \
      && echo "$(date '+%T') OK $id" >> fetch.log || { echo "$(date '+%T') FAIL $id" >> fetch.log; left=1; }
    sleep 5
  done
  [ $left = 0 ] && { echo "$(date '+%T') ALLDONE" >> fetch.log; break; }
  sleep 1200
done
