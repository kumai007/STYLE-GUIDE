# last-moments QA pass (case01a + case01b), 2026-11-19
Scratch: %TEMP%/claude/.../scratchpad/qa (shots.txt, at.txt, sheet.py = grid from `snapshot --keep` stills, b1/ = round-1 stills).
Snapshot cmd: `npx hyperframes@0.9.56 snapshot parts/lm_case01b --at "<t,..>" --no-end --keep -o DIR --timeout 120000`.
## Progress
- [ ] case01b round-1 stills (70 shot mids + 4 articles start/mid/end + 9 LowerThirds + StampRing)
- [x] round-1 stills done (b1/, sheets sheetA/B, art1). Findings: articles full-bleed OK at start/mid/end (no backdrop); source tag
  sits over body text (all 4) -> make thin bar at bottom edge; articles bright Y158-185 -> darken page; B51 (Guardian 2013) shows a
  cropped mouth photo at top -> crop it off. nb_*: B14 bath drain flat grey, B18 fingerprint Y81, B22 cctv Y81 -> grade darker;
  B25 door / B36 documents / B67 coast now read dark+grey, OK.
- [x] fixes (backups in scratch qa/): lm_pro Article3D page brightness .95->.74 + stronger vignette, source tag = 30 px bar on the
  bottom edge, depth blur flips to the bottom when the key line is in the top 40 %; StampRing: stamps on the picture edge keep the
  ring around the text and lift the picture during the zoom (B30 ring cut the HCR digits); c01b_articles.py HP={'c01b3':.13} recrop
  (AP face photo out); case01b foot() takes con/vig, B14/B18/B22 graded darker. Both parts rebuilt exit 0.
- [x] round 2: articles Y120-143 (was 158-185), full-bleed start/mid/end OK in both parts (case01a S09/S15/S36 too), source bar
  clear of body text, B51 no face; B14 Y51 / B18 Y60 / B22 Y57; B30 ring encloses the digits (stamp box widened x222 w526).
  case01a: removed stale 'BACKDROP: ILLUSTRATIVE' Lbl (S09) and backdrop Credit (S36) that sat on the full-bleed page.
  Both rebuilt exit 0; check ok, 0 errors, 7 warnings each.
- Kept (look right now, dark mono): nb_door_night (B25), nb_wales_coast (B67, 'home in Wales'), nb_bathroom_dark (B14, darker; still
  a plain drain - swap if owner dislikes), nb_fingerprint_dust (B17 bg + B18).
- [x] B30 ring: rect widened to [150,0,1620,1080] so the ring's left end sits in the letterbox, not on the "2"; verified at 138 s.
  Final: lm_case01b rebuilt exit 0, check ok 0 errors / 7 warnings; lm_case01a same. Every stock file <= 2 uses in case01b.
- Sheets: productions/last-moments/edit/qa/lm_case01b_v3_sheet.jpg (70 shot mids, fixed shots re-snapped),
  qa/lm_case01a_articles_v3_sheet.jpg (S09/S15/S36 start/mid/end; labels removed after it was made: verified by crop).
- OPEN: B14 drain is still a weak picture for its line; B24 LowerThird overlaps the big STOP tape letters (busy); Martin Hewitt
  role strip ends before 'MET'; SFX mix not measured; full render not done.
