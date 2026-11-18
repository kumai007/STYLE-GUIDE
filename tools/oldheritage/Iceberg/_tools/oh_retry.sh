#!/bin/bash
# retries failed footage downloads every 30 min (YouTube bot check is temporary; no cookies, no bypass). Log footage/fetch.log
while true; do
  n=0; for d in C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg/{05,06,07,08,09,10}_*; do grep -q '^FAIL' $d/footage/fetch.log 2>/dev/null && n=1; done
  [ $n = 0 ] && break
  sleep 1800
  for d in C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg/{05,06,07,08,09,10}_*; do sed -i '/^FAIL/d' $d/footage/fetch.log; C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg/_tools/oh_fetch.sh $d >/dev/null 2>&1; done
done
