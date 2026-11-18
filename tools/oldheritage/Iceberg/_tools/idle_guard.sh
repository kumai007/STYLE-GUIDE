#!/bin/bash
# idle_guard.sh — owner 4 Nov: "do the video but don't lag my Mac; I have to write, watch YT, do stuff".
# Every 3 s: if the owner is using the Mac (keyboard/mouse in the last 4 min) or a video/audio is playing, FREEZE all build work
# (SIGSTOP Blender, Remotion renders/stills, headless Chrome, ffmpeg) and hold new jobs via /tmp/iceberg_pause. When the Mac has
# been idle 4 min with nothing playing, resume. Stop the guard: touch /tmp/iceberg_guard_off.
P=/tmp/iceberg_pause; state=""
heavy() { { pgrep -x Blender; pgrep -f "remotion (render|still)"; pgrep -f chrome-headless; pgrep -x ffmpeg; } 2>/dev/null; }
while [ ! -e /tmp/iceberg_guard_off ]; do
  idle=$(ioreg -c IOHIDSystem | awk '/HIDIdleTime/ {print int($NF/1e9); exit}')
  media=$(pmset -g assertions | grep -E "PreventUserIdleDisplaySleep|PreventUserIdleSystemSleep" | grep -viE "powerd|claude|caffeinate" | grep -ciE "chrome|safari|firefox|arc|brave|coreaudiod|vlc|iina|music|spotify|quicktime|discord")
  if [ "${idle:-0}" -lt 240 ] || [ "${media:-0}" -gt 0 ]; then
    touch $P; for p in $(heavy); do kill -STOP $p 2>/dev/null; done; [ "$state" != busy ] && { echo "$(date +%T) owner active -> frozen"; state=busy; }
  else
    rm -f $P; for p in $(heavy); do kill -CONT $p 2>/dev/null; done; [ "$state" != idle ] && { echo "$(date +%T) owner away -> running"; state=idle; }
  fi
  sleep 3
done
rm -f $P; for p in $(heavy); do kill -CONT $p 2>/dev/null; done
