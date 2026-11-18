#!/bin/bash
# blender_run.sh <blender args...>  — owner 4 Nov: "leave enough RAM so my Mac doesn't lag".
# Only ONE Blender at a time across all agents (lock), capped at 2 threads, lowest priority.
L=/tmp/iceberg_blender.lock
while [ -e /tmp/iceberg_pause ] || ! mkdir $L 2>/dev/null; do sleep 10; done
trap "rmdir $L" EXIT
nice -n 20 /Applications/Blender.app/Contents/MacOS/Blender -t 6 "$@" --cycles-device CPU
