# farrell-build

ffmpeg + Python kit that rendered the CAMPING-8 3-6 min Farrell samples (v2-v6). No Premiere.
Copied from the session scratchpad on 2026-11-09. `common.py` `W` still points at that scratchpad (work files, asm, renders' temp); set it to a new work folder before reuse.

Build order (latest = v6):
1. `edl6.py` - edit list (imports edl5 -> edl4 -> edl3; shots, captions, comment events; `xin`/`xout` = comment fades with the shot crossfade).
2. `python rulecheck.py edl6 final6.py` - rule-book check; must print `rulecheck: OK` (exit 0).
3. `python srcscan.py edl6 <shot id> 2.5` - source camera cuts + clean in-points, before changing a shot's `ss`.
4. `python seg4.py` then `python seg4.py asm` - segments + crossfade/dip assembly (`asm4.mp4`).
5. `python final6.py` - overlays, captions, mix -> `renders/CAMPING-8_3-6min_farrell_v6.mp4`. Test frames: `python final6.py frames f1,f2 <dir>`.
6. QC: `segscan.py`, `fadescan.py` (no BAD inside fades except overlay motion), `solo.py edl6`.

Tests: `python -m unittest discover -s tests` (from this folder). `tests/test_rulecheck.py` runs `rulecheck.py` on small fake EDLs, one broken rule each, plus `edl6`. When you add or change a rule in `rulecheck.py`, add a test that fails without it.

Rules: `styleguide/farrell/farrell.json` (rule book). Never write to source mp4s or into PROJECT.
