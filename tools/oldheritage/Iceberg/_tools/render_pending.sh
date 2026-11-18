#!/bin/bash
# Renders every case whose code (cases/<KEY>.tsx) is newer than its master (out/<KEY>.mp4) and is not a stub. Loops until killed,
# so it keeps working without Claude. Log: _tools/render_pending.log.  Start: nohup _tools/render_pending.sh >/dev/null 2>&1 &
I=C:/Users/ayush/Videos/CLAUDE/STYLEG~1/tools/oldheritage/Iceberg
while true; do
  for f in $I/_engine/src/cases/*.tsx; do
    KEY=$(basename $f .tsx); grep -q "export const DUR = 90;" $f && continue
    P=$I/_engine/pubs/$KEY; [ -d $P ] || continue
    O=$(awk -F'\t' '$1=="case"{print $2}' $P/.src 2>/dev/null)/out; M=$O/$KEY.mp4
    [ -f $M ] && [ $M -nt $f ] && continue
    pgrep -f "entries/$KEY.tsx" >/dev/null && continue           # an agent is rendering it now
    [ $(( $(date +%s) - $(stat -c %Y $f) )) -lt 900 ] && continue # edited < 15 min ago: still being worked on
    echo "$(date '+%F %T') render $KEY" >> $I/_tools/render_pending.log
    $I/_tools/render_case.sh $KEY >> $I/_tools/render_pending.log 2>&1
  done
  sleep 120
done
