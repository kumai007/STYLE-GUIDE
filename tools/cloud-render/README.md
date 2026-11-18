# cloud-render: GitHub mirror sync only

Renders run on `tools/case-farm/` (repo `DeZAYU/case-farm`). The old render scripts here (`farm.py`, `cloud_render.py`,
`remotion_farm.py`, repo `DeZAYU/render-farm`) are retired and deleted (2026-11-18; copies are in the Drive backup
`AI/zip render knowledge/STYLE_guide_backup_2026-11-18.zip`).

## sync_farm.py
- Windows task `RenderFarmSync` runs it every 15 min: copies the text/code of this folder (`CLAUDE.md`, `docs/`,
  `styleguide/`, `tools/`; no media, no file > 1 MB, no `.env`, no `case-farm`, no junctions) into the clone `guide/`,
  scans for keys (any hit = nothing is pushed), then commits and pushes to PUBLIC `kumai007/STYLE-GUIDE`.
- Test run without changes: `python -I -X utf8 tools/cloud-render/sync_farm.py --dry`. Log: `tools/cloud-render/.farm_sync.log`.
- Tests: `python -I -m pytest -q tools/cloud-render/test_sync_farm.py`.
- Turn off: `schtasks /Change /TN RenderFarmSync /DISABLE` (or `/Delete ... /F`).
