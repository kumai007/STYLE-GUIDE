# last-moments QA pass (case01a + case01b), 2026-11-19
Scratch: %TEMP%/claude/.../scratchpad/qa (shots.txt, at.txt, sheet.py = grid from `snapshot --keep` stills, b1/ = round-1 stills).
Snapshot cmd: `npx hyperframes@0.9.56 snapshot parts/lm_case01b --at "<t,..>" --no-end --keep -o DIR --timeout 120000`.
## Progress
- [ ] case01b round-1 stills (70 shot mids + 4 articles start/mid/end + 9 LowerThirds + StampRing)
- [x] round-1 stills done (b1/, sheets sheetA/B, art1). Findings: articles full-bleed OK at start/mid/end (no backdrop); source tag
  sits over body text (all 4) -> make thin bar at bottom edge; articles bright Y158-185 -> darken page; B51 (Guardian 2013) shows a
  cropped mouth photo at top -> crop it off. nb_*: B14 bath drain flat grey, B18 fingerprint Y81, B22 cctv Y81 -> grade darker;
  B25 door / B36 documents / B67 coast now read dark+grey, OK.
