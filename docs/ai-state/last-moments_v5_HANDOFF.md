# last-moments v5 (owner 2026-11-19: "too much stock footage", "add more motion graphics")

## V5 MG READY (2026-11-19) - `styleguide/gx-admixdd/hf-engine/devices/lm_mg.mjs`
Case: `devices: [..., 'lm_c01a', 'lm_pro', 'lm_mg']` (Parallax mosaic needs MosImg from lm_c01a); fonts VCROSDMono + IBMPlexMono-500.
Full API = header comment of lm_mg.mjs. Short:
- `Parallax {src, pos, mos, s:[1.04,1.12], ry:[-3,3], rx:[1,-1], tx, z=140}` 2.5-D photo (sharp feathered photo in front of a blurred
  copy, eased orbit/push). Wrap in `Grade` like any photo. src relative to media root (e.g. 'c01a/x.jpg').
- `RouteMap {z12, z14, off, pins:[{x,y,label,time,at,side:'r'|'l'}], keys?, tilt=10, bend=.16}` MapC01 tiles + red route line
  pin->pin (segment ends at next pin's at), pins pop + pulse, VCR label + time line. keys optional (auto overview/push).
- `Timeline {nodes:[{date,label,at}], at=0, sp=560, ry=-16}` kids = backdrop (blurred graded photo). Camera dollies to each node as
  it lights at `at`; latest lit node red.
- `Counter {to, from=0, unit, label, at=10, dur=80, size=220, pos}` kids = backdrop. `import { counterTicks } from '../devices/lm_mg.mjs'`
  -> seconds for tick SFX (`counterTicks(t0_s, from, to, durFrames)`).
- `CCTVAnalyse {src, n, box:[x,y,w,h], zoom=1.6, at=16, zin=60, rect=[240,0,1440,1080], data:[[k,v]..], dpos='tr', tag, g}`
  freeze of a raw (still frame n @60), punch-in (clamped, picture fills frame), corner brackets lock + tag, VCR readout, scan sweep.
  Picture grade via g={sat,bri,con}; put an empty `n('Grade',{...})` after it for vignette/grain.
- `DocStack {docs:[{img,iw,ih,bands,src,date,at}], W=1380}` kids = backdrop. Article crops in a 3-D stack; camera flies to each
  card (arrives at doc.at, 42 f move -> whoosh at at-0.5 s), amber marker on bands. c01a_articles.json entries plug straight in.
SFX: click at each label/node/pin pop (`sfx('lm_click', t - 0.15)`), whoosh for camera moves, tick_soft for counter ticks.
- CCTVAnalyse also takes `o:[x,y]` = zoom focus override (default box centre; use box top when the box is near the frame top).
- Kit status: module imports + every render fn compiles (node). NOT yet built or seen in a frame: first real use = lm_case01a v5.

## Agent v5-A stopped at the context limit (2026-11-19) - case01a NOT edited yet. Next agent: steps 2-4 below.
STEP 2 (photos): Commons retry ran once (`build/commons_get.py`, picks = commons_picks2.tsv minus gareth_williams_grave) but was killed
by `timeout 400` while in 429 retries (python stdout buffered -> no log, 0 files in `productions/last-moments/assets/photos_v5/`).
A later plain API ping returned 200 for both Commons and Geograph -> run it again WITHOUT timeout/pipe, `python -I -u`, outdir
assets/photos_v5, meta assets/photos_v5/meta.json; then copy (<=3840 px jpg) to `media/last-moments/c01a/<name>.jpg`, add rows to
`assets/MEDIA_LOG.md` and credits to `PH` in the case. Need most: gchq_aerial, cheltenham_promenade, harrods_brompton_road,
holland_park_station(_b), alderney_street. If 429 again: Geograph (api.geograph.org.uk syndicator, CC BY-SA 2.0). Max ~10.
STOCK BASELINE (by shot s, part 185.85 s): foot() S14 4.80, S18 6.36, S19 4.79, S20 6.36, S22 3.46, S24 5.56, S34 4.56 + stock card
backdrops S12 5.86, S23 4.72 = 46.47 s = 25.0 %. Plan below leaves S14, S18, S19, S20 = 22.31 s = 12.0 %.
STEP 3 plan for cases/lm_case01a.mjs (backup first; devices add 'lm_mg'; VO word times from vo/cut/c01_p01*.words.json + part offset):
- Photos alternate plain `photo()` and new Parallax helper (Grade sat .42-.55 > Parallax {src:'c01a/x.jpg', mos} + Credit): par on
  S02, S07, S10, S13, S16, S21, S24, S32, S36, S38.
- S12 card: backdrop broll/nb_cctv_camera -> blurred gchq_aerial (bgP). S21 101.93-105.47 SIS tight -> par gchq_aerial + PlaceText
  GCHQ / CHELTENHAM (~103.3, "back to GCHQ"). S22 drone stock -> photo cheltenham_promenade + td '3 SEPTEMBER 2010' 106.40.
- S23 108.93-113.65 card -> Timeline nodes [11 AUG 2010 'HOME FROM THE US' at A(109.9)], [14 AUG 'HOLLAND PARK'], [15 AUG 'HANS
  CRESCENT'] over blurred real photo (harrods_night or holland_park_station). Remove CLICK 108.93+8/60 -> click 109.9.
- S24 regent stock -> par harrods_brompton_road (or brompton_road_knightsbridge + MOS) + PlaceText KNIGHTSBRIDGE at ~116.5.
- S25 -> Timeline again (node 0 at:-60 already lit), 14 AUG 'SATURDAY - A WET AFTERNOON' lights red at A(120.5), backdrop = blurred
  HPK freeze f150 (as now). Click 120.5 (replace 120.21-0.5).
- S30 138.98-144.60 HPK replay -> CCTVAnalyse {src:'HPK', n:104, box ~[900,360,210,380] (spot was at 1005,540; check on sheet),
  data CAM HOLLAND PARK / DATE 14 AUG 2010 / TIME 14:59, tag GARETH WILLIAMS, dpos 'tr'} + met('tl') + empty Grade; whoosh at
  punch-in mid, click at data pop (at + .7 zin + 26 f).
- S33 sloane -> Counter {to:20, unit:'DAYS', label:'UNTIL HE WAS DUE TO LEAVE LONDON', at:A(155.2), dur:80} on blurred sloane_street
  (14 Aug + 20 d = 3 Sep, VO "less than three weeks"). Ticks: counterTicks -> tick_soft (SFX row [0.321,-29.9,-29.9,-10.5,0.01],
  gain = tgtG - 8 - (-29.9) per tick).
- S34 wet pavement stock -> DocStack docs [ART.cctv at 10, ART.profile at 150] ("None of the reports we found"), backdrop blurred
  brompton_road_knightsbridge; whoosh at c+(150-21)/60-0.469; paper SFX at c.
- S35 map -> RouteMap pins HPK (1440,1047) 'HOLLAND PARK' '14 AUG - 14:59' at 24; HCR (1950,1212) 'HANS CRESCENT' '15 AUG - 14:27'
  at 137 (VO "went back to Knightsbridge" ~165.3); Pimlico Alderney St (2158,1388; computed from lat/lon, same offset as HCR)
  'PIMLICO' 'ALDERNEY ST - HIS FLAT' at 220; keys [[0,1800,1220,.9,18],[60,1700,1180,1.25,10],[284,1830,1240,1.4,8]]; clicks at
  each pin at+6 f; replace the 2 map whooshes with one at c+30/60-0.469.
- S36 Article3D cctv -> par brompton_road_knightsbridge (MOS) + PlaceText BROMPTON ROAD 168.3; drop ARTS [167.80..] entry.
- S39 HCR entry -> CCTVAnalyse {src:'HCR', n:0, box ~[1040,40,240,300] (spot was 1150,170), o:[1160,60], zoom 1.35, data CAM HANS
  CRESCENT / DATE 15 AUG 2010 / TIME 14:27:28, dpos 'tl'} + met('tr')? (box is top-right: move credit to 'br').
- Keep 1 LowerThird (S01). Never same device twice in a row (checked in plan above).
STEP 4: `node build.mjs lm_case01a` exit 0, check 0 errors, snapshot sheet -> productions/last-moments/edit/qa/lm_case01a_v5_sheet.jpg.

## Part B (lm_case01b v5, agent, 2026-11-19)
- Stock before: 188.7 / 309.0 s = 61 % (foot() shots; + 4 cards on blurred stock = 66 %). Script: scratchpad shotvo.py.
- Real material added: 3 pages c01b5 (C4 6 Sep 2010 appeal), c01b6 (C4 2 May 2012 verdict), c01b7 (The Week 26 Oct 2015 Karpichkov)
  -> media pages/c01b_art_c01b{5,6,7}.jpg + c01b_articles.json (assets.json backup .bak_v5b; c01b_articles.py backup .bak_v5).
  5 Geograph photos (CC BY-SA 2.0) in media photos/: geo_alderney_st, geo_pimlico_corner, geo_coroners_court, geo_coroners_engraving, geo_sis_bridge. MEDIA_LOG updated.
- Case rework DONE (backup cases/lm_case01b.mjs.bak_v4): devices + 'lm_c01a','lm_mg'; 67 rows. RouteMap B04 (Knightsbridge 15 AUG -> Pimlico
  flat, z14 px 2165.8,1387.9); Counter B05 7 DAYS, B34 400 ATTEMPTS, B38 3 MIN, B47 9 MEMORY STICKS (tick_soft ticks, M est. -31.5, off -8,
  ticks exempt from the 0.3 s SFX spacing); Timeline grows B07 23 AUG, B19 6 SEP 2010, B39 2 MAY 2012, B50 NOV 2013, B56 OCT 2015, B62 NOV 2023
  (click + whoosh each); Parallax B08 alderney, B15 engraving, B24 pimlico (Sebire), B33/B67 SIS bridge, B36 court, B65 Valley station;
  articles B22 C4 appeal, B43 C4 verdict, B57 The Week, B64 2024 (merged B63); replay split: B30 StampRing 132.70-139.20 + B30b CCTVAnalyse
  139.20-142.20 (HCR n 195, box 270,420,390,420); B69 DocStack RTE verdict (at 40) vs Guardian 2013 Met review (at 330). Cards on blurred
  real photos; quote B68 on blurred Valley church. Merged: B17+B18, B22+B23, B24+B25, B43+B44, B64+B63.
- Stock 188.7 s (61 %) -> 66.9 s (22 %). build exit 0, check 0 errors. Sheet productions/last-moments/edit/qa/lm_case01b_v5_sheet.jpg (38 changed shots).
- Open: B22 highlight covers 2 of 3 sentence lines (c01b_articles.py takes lines[:2]); B08 + B11 same Alderney photo look alike;
  Timeline used 6x (owner may want fewer); SFX mix not measured; not previewed in motion.
