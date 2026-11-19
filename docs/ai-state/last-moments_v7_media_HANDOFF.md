# last-moments v7 - case 1 "no repeated photo/stock" pass (2026-11-19) - DONE (see v6 handoff "v7 done")

Goal (lead brief): every photo / stock clip in case 1 (lm_case01a + lm_case01b) in only ONE visible shot. Keep timing, overlays,
SFX; prefer MG / new real free photos over stock; stock share must not rise (01a 12 %, 01b 25 %). Do not touch text devices,
rings, articles, mix, intro. Done = both builds exit 0, `npx hyperframes check parts/<id>` 0 errors, repeat scan clean,
snapshots of every changed shot viewed, short "v7" section appended to last-moments_v6_HANDOFF.md, report to lead.

## State
- Backups made: hf-engine/cases/lm_case01a.mjs.bak_v7, lm_case01b.mjs.bak_v7 (= current files, unedited).
- Tools (productions/last-moments/build/, run from repo root, hf-engine = styleguide/gx-admixdd/hf-engine):
  - `node productions/last-moments/build/repeat_scan.mjs <abs hf-engine> lm_intro lm_case01a lm_case01b` - tree walk of every
    shot (Img/MosImg/Parallax/_V/plate), names unified across c01a/ photos/ broll/ (alias c01b_brompton_mos = brompton);
    marks bgs under Article3D/Article3H/DocStack as hidden. Baseline: 20 visible repeats (list below).
  - `python productions/last-moments/build/shot_narration.py <repo root> S21,B00,...` - VO words under each shot.
  - `python -I productions/last-moments/build/geo_search.py search <outdir> <tag> "<text>" [pages]` - Geograph syndicator
    (`text=` param; `q=` fails on one-word place names) -> <tag>.json + contact sheet <tag>.jpg (id, title, author, date under
    each thumb). Only CC BY-SA / BY kept. Photo page https://www.geograph.org.uk/photo/<id> lists unstamped image URLs
    s0.geograph.org.uk/geophotos/..../<id>_<hash>.jpg (640) and ..._1024x1024.jpg when larger exists - take the largest.
    geograph.org.uk/of/ search answers 403; syndicator works.
  - Sheets already made (scratch, may be gone): gchq hpa nsy harrods sis pimlico hans horse fco valley ynys holy city alder.
- Faces: 01b photo()/par() have no mosaic param - pick photos without close private faces (or add MosImg like 01a MOS).
- DocStack and Article3D kids are never shown (lm_mg doc): S15 + S34 + B69 bgs can simply be dropped.

## Baseline repeats (first use kept unless noted) and the decided replacement
01a: S15 sis_b hidden bg -> drop. S34 brompton hidden bg -> drop.
- S21 gchq_aerial (S12 card bg first) -> NEW Geograph 7297260 "Main entrance, GCHQ Cheltenham" (Roger Cornfoot 2022), par + same place text.
- S32 harrods_night (repeat of intro L08 CASE 1 title plate) -> NEW Geograph "Holland Park Avenue" photo (sheet hpa; VO "It shows a man
  going about his life, a week before anyone thought to look for him").
- S33 Counter bg sloane_street -> blurred map: bgP(i, 'map_z12', ...) (VO "due to leave London for good"); keeps sharp B02 Sloane St.
01b (later uses of 01a items + internal):
- B00 harrods_side -> NEW Geograph 2114592 "London: Westminster - New Scotland Yard" (Lewis Clarke 2010-10-14) (VO "The Met have always called that...").
- B01 c01b_brompton_mos (= S36 photo) -> NEW Harrods/Knightsbridge photo (sheet harrods; or Geograph 7112861 "Harrods lit up for the night", Ruth Sharville).
- B06 sis_building_vauxhall -> NEW Geograph 7761856 "Vauxhall Cross - SIS Building" (Colin Smith 2024).
- B07 Timeline bg hans_crescent_geograph -> blurred map_z14 (bgP path is photos/, use n('Img',{src:'c01a/map_z14.jpg'}) in a blurred Cam).
- B11 geo_pimlico_corner (B05 bg first) -> existing UNUSED c01a/alderney_street.jpg (Chris Whippet, geograph 4336113, PH already in 01a).
- B13 card bg pimlico -> NEW Pimlico street photo (sheet pimlico/alder), blurred.
- B19 brompton -> NEW Geograph 878385 "New Scotland Yard, SW1" (Phillip Perry 2008) (6 Sep 2010 Met appeal).
- B24 pimlico Sebire (9.4 s par + label) -> NEW Pimlico photo (sheet pimlico/alder).
- B26 nb_forensic_lab (stock) -> tcard(bg, 'FORENSICS', ['A TRACE OF DNA', 'ON HIS HAND']) on a new blurred photo (stock share down).
- B29 hans_crescent_sign -> NEW Hans Crescent photo (sheet hans), keep Dip outN 16.
- B32 coroners_engraving -> NEW Foreign Office photo (sheet fco) (VO "The Foreign Secretary had signed a PII certificate").
- B34, B38 counter bgs westminster_coroners_court -> NEW Horseferry Road photos (sheet horse), blurred.
- B35 card bg sis_b -> NEW SIS photo 5686604 "The Tower" or 7163426 Vauxhall Bridge (N Chadwick), blurred.
- B17 card bg geo_coroners_court -> NEW blurred photo; B36 par geo_coroners_court -> NEW photo; KEEP B40 Wilcox (coroner) sharp.
- B39 Timeline bg engraving -> NEW blurred photo (Horseferry Rd / Westminster).
- B42 pad_gate (stock) -> unused stock nb_bathroom_dark (VO "put the bag in the bath and locked it"; stock->stock, share same).
- B46 westminster_coroners_court -> NEW photo (NSY 5238683 or Horseferry Rd) (VO "criticised counter terrorism officers").
- B47 counter bg SIS -> NEW Geograph 7736205 "MI6 Headquarters at Vauxhall" (Marathon 2024), blurred.
- B48 sis_b -> NEW Geograph 5197509 "The MI6 Building, Vauxhall" (pam fray 2016, night).
- B50 hans_crescent_geograph (date NOV 2013, "the Met came to the opposite view") -> NEW Geograph 5252075 "New Scotland Yard Sign" (Paul Farmer 2017, night).
- B52 SIS Hewitt (DAC, Met) -> NEW Geograph 6269380 "City of Westminster: New Scotland Yard" (Lewis Clarke 2019).
- B53 card bg geo_alderney_st -> NEW blurred Pimlico photo (sheet alder).
- B54 valley church ("family rejected that") -> NEW Valley photo, e.g. 549875 "Valley Hotel" (James Allan 2007).
- B56 sis_b (date OCT 2015 "Other theories") -> NEW Vauxhall/Thames photo (sheet sis, e.g. 7163426).
- B59 nb_code_screen (stock, "Russian money flows") -> NEW City of London photo (sheet city), par.
- B62 Timeline bg pimlico -> NEW blurred photo (NSY 5560371 or Pimlico).
- B65 valley station ("buried at Ynys Wen cemetery in Valley") -> NEW Valley photo (Ynys Wen search found only a Treorchy hit; use 6618548 "Tidal waters near Valley", Gordon Hatton 2020, or another from sheet valley).
- B66 valley church (date + VALLEY, ANGLESEY place) -> NEW Valley photo (6618604 "Shingle beach, Valley", Gordon Hatton 2020).
- B67 geo_sis_bridge (Sawers came to the service) -> NEW Valley/Anglesey photo or SIS 7163426.
- B68 quote headstone bg valley church -> NEW Geograph 2606671 "Holyhead Mountain from the Anglesey Coastal Path" (Mat Fascione) ("Free to run in the mountains").
Each NEW asset: copy to hf-engine media/last-moments/photos/ (01b) or c01a/ (01a), add PH credit "AUTHOR / CC BY-SA 2.0",
log row in productions/last-moments/assets/MEDIA_LOG.md (geograph URL, author, licence). Check each full image for faces before use.

## Next action
Fetch the picks above (largest unstamped size), view each, edit the two shot tables, build, check, repeat scan, snapshot changed
shots (`npx hyperframes snapshot parts/<id> -o <scratch> --no-end --at t1,...`), append v7 to last-moments_v6_HANDOFF.md, report.
Also mention to lead: article repeats remain (01b B69 DocStack reuses INQ page of B41 and c01b3 of B51) - out of scope (articles approved).

## Progress agent 2 (2026-11-19 18:30) - media fetched + copied, case edits next
Lead overrides: keep S32 harrods_night; intro L08 plate -> c01a/thames_night.jpg (6075934 "River Thames at Night", Christine Matthews) + Credit.
Keep S21 GCHQ sharp; S12 card bg -> c01a/gchq_entrance.jpg (7297260 Roger Cornfoot). B69 DocStack -> tcard on blurred city_belfast_night.
All Geograph CC BY-SA 2.0, copied to media/last-moments/photos/<name>.jpg (sources+meta: scratch geo/meta.json; fetch script geo_fetch.py):
B00 nsy_broadway 2114592 Lewis Clarke (MOS faces) | B01 harrods_lit_night 7112861 Ruth Sharville | B06 mi6_hq_vauxhall 7736205 Marathon |
B07 bg c01a/map_z14 | B11 alderney_street (copy of c01a, 4336113 Chris Whippet) | B13 bg pimlico_gardens 4714182 PAUL FARMER |
B17 bg coroners_court_kg 742151 Kevin Gordon | B19 nsy_westminster 6269380 Lewis Clarke | B24 pimlico_station 5303842 N Chadwick |
B26 tcard DNA on nsy_sw1 878385 Phillip Perry | B29 hans_crescent_mm 5431651 Malc McDonald (MOS) | B32 king_charles_street 2380566 Colin Smith |
B34 bg horseferry_courthouse 3324475 Shazz | B35 bg vauxhall_bridge_nc 7163426 N Chadwick | B36 coroners_door 4895264 Christine Matthews |
B38 bg horseferry_junction 3584126 Basher Eyre | B39 bg coroners_door_b 4895267 Christine Matthews | B42 stock nb_bathroom_dark (Pexels) |
B46 coroners_sign 4895271 Christine Matthews | B47 bg vauxhall_tower 5686604 N Chadwick | B48 mi6_river 5197509 pam fray |
B50 nsy_sign_night 5252075 PAUL FARMER | B52 nsy_embankment 5238683 PAUL FARMER (MOS) | B53 bg pimlico_lupus_st 3277508 PAUL FARMER |
B54 traeth_cymyran 4975535 Jeff Buck | B56 city_tower_dusk 7049025 Marathon | B59 city_night 8209337 Rob Farrow | B62 bg nsy_curtis_green 5560371 Peter McDermott |
B65 valley_tidal 6618548 Gordon Hatton | B66 valley_shingle 6618604 Gordon Hatton | B67 valley_hotel 549875 James Allan | B68 holyhead_mountain 2606671 Mat Fascione |
B69 bg city_belfast_night 4973656 DS Pugh. 01a: S15/S34 bgs dropped, S33 bg bgP map_z12.
MOS boxes (cover px): nsy_broadway [[0,745,85,100],[275,740,90,95],[930,790,90,90],[1690,805,105,85],[1805,795,115,95]];
nsy_embankment [[56,757,122,112],[131,739,337,94],[1725,776,195,169],[581,673,47,47]]; hans_crescent_mm [[165,855,90,75],[324,810,210,75]].
