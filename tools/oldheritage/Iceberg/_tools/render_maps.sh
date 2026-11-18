#!/bin/bash
# render_maps.sh <case.json> <out dir> <shot...>: 3-D map shots. Now Three.js (render_map3d.sh), no Blender.
# Old Blender version: render_maps.sh.bak-blender + blender_map.py.
exec "$(dirname "$0")/render_map3d.sh" "$@"
