# last-moments case 1 PART B (lm_case01b) handoff (agent, 2026-11-18)
Scope: VO c01_p03 + c01_p04, replay of HCR, ending dip. Never edit lm.mjs / lm_intro.mjs / part A files; own devices in devices/lm_c01b.mjs.
## Done
- STEP 1 VO clean: new args script `productions/last-moments/build/vo_clean.py RAW WHISPER OUT --cuts a:b,.. --fill t,..`
  (copy of vo_intro_clean.py). p03 cuts (src s): 0:0.31 5.74:6.10 18.44:18.77 64.66:65.07 74.78:75.05 106.40:106.74
  115.86:116.31 130.72:131.19 (Yeah x7 + a garbled "He," at 116.0); "work, / weeks," whisper tokens = k-release, not repeats
  (dropped tokens only). p04 cut 13.20:13.56 (TTS ad-lib "He had" before "Two experts"). -> vo/cut/c01_p03.wav 132.86 s,
  c01_p04.wav 165.84 s (+ .words.json). Hardlinked as media/last-moments/vo/c01b_p03.wav, c01b_p04.wav.
- STEP 2 media: photos/*.jpg, broll/*.mp4 hardlinked into media/last-moments/{photos,broll}; page crop
  media/last-moments/pages/c01b_inquest_crop.jpg (page png crop 760,110-2240,1390 = 1480x1280; highlight 1 lines in crop px
  [239,942,968,44] [227,1002,314,44]); freeze still media/last-moments/stills/c01b_hcr_last.jpg (HCR @3.78).
## Plan (part s): p03 VO at 0; replay HCR 0-3.8 @0.5 at 132.70-140.30; freeze 140.30-141.80; p04 VO at 142.20; end ~309.0 (30 f dip).
- Page crop REDONE: c01b_inquest_crop.jpg = png crop (900,660)-(2150,1390) 1250x730 (Page sc 1.233 -> key line ~1190 px);
  bands crop px [99,388,968,52] (unnatural.. ) [87,448,314,52] (criminally mediated).
- HCR video = 3.767 s (226 f): replay src 0-3.75 @0.5 = 7.50 s. p04 VO at part 142.40 (shot change 142.20). End 309.0.
- Shot plan drafted in cases/lm_case01b.mjs (comments per shot = VO line).
- OWNER FEEDBACK (lead, mid-task): no flat black plates / plain mono text on flat colour / flat grids / flat yellow boxes. Every
  graphic on a real photo/footage backdrop with grain, vignette/light falloff, depth (blur layers, parallax), eased 3-D camera
  moves; text lit + shadowed. Quote card premium (real backdrop, lit type). -> own devices in devices/lm_c01b.mjs: Cam (3-D eased
  camera wrapper), Img, Win, Lbl, TCard, Tag (name/place lower third w/o box), PageC (page in 3-D on blurred photo, lit paper,
  textured marker), QuoteC. lm.mjs used only for Grade, _V, Credit, TypedDate, Dip, RedCircle.
- STEP 3 DONE (untested, not built yet): `hf-engine/devices/lm_c01b.mjs` (API block at top; renders use new Function -> toString
  works with build.mjs line 139). Case must list devices ['shared','lm','lm_c01b'] and fonts incl. SourceSerif4-var-latin.woff2,
  BebasNeue, Oswald, IBMPlexMono 500/600.
## Facts for the case file
- VO: vo:{starts:[0,142.40], lens:[132.86,165.84], file:(i)=>['vo/c01b_p03.wav','vo/c01b_p04.wav'][i], tail:0}. Loudness:
  p03 -28.8 LUFS I (pk -1.1), p04 -29.1 (pk -2.3) -> music lane target -38.8 (VO-10), SFX -42.8; music +6 dB swell 132.7-142.2
  (VO paused), -12 dB in the dip 132.43-132.93. Reuse lm_intro musLane/sfx/stS helpers (copy). Beds: es_dark_days 0-116
  (1.5 s fade-in), es_tarmac_radiation 110-226 (6 s xfade), es_dark_days again 220-309 (fade out 307.5-309). Riser_dark ends
  184.16 (at 178.25), boom_low at 184.16 (page band 1).
- Media src names: videos 'broll/<name>' (LClip/_V append .mp4), 'HCR','HPK'; images Img {src:'photos/x.jpg'} /
  'stills/c01b_hcr_last.jpg' / page 'pages/c01b_inquest_crop.jpg' (iw 1250 ih 730). B-roll durations: dark_empty_hallway 10.0,
  empty_hallway 9.3 (1080x1920), london_rain_street_a 7.1, _b 70.9, padlock_gate_chain 13.9, padlock_red_rail 6.7 (1080x1920),
  rain_window_night 31.4 (1080x1920), regent_street_rain_night 41.0, snowdonia_a 10.75, wet_pavement_night 37.4. HPK 5.03+, HCR 3.767.
- Every Pexels b-roll = Grade{mono:true} + Lbl 'ILLUSTRATIVE'. Photos need Credit 'PHOTO: <AUTHOR> / <LICENCE>' (authors:
  harrods_side Daniel X. O'Neil CC BY 2.0; hans_crescent_geograph, brompton_road, sloane_street Lewis Clarke CC BY-SA 2.0;
  sis_building_vauxhall Colin Smith; sis_b Richard Cooke; valley_church Peter Wood; westminster_coroners_court The wub CC BY-SA 4.0;
  all others CC BY-SA 2.0 per assets/photos/_commons_meta.json). Raw HPK/HCR: Credit 'FOOTAGE: METROPOLITAN POLICE'.
- Padlock positions (approx, verify): padlock_gate_chain lock ~ (980,600) at 2 s, (940,510) at 9 s (camera moves);
  padlock_red_rail red lock ~ 34 % x / 59 % y of the vertical frame.
## Shot plan (part s; p04 word t -> part = 142.40 + t). Footage = Grade(+mono) > Cam{s:[1,1.06],ry/tx drift} > _V or Img.
| s | shot | text device |
| 0-5.40 | photo hans_crescent_harrods_side | - |
| 5.40-10.00 | photo brompton_road_knightsbridge (pan) | - |
| 10.00-15.90 | photo sloane_street | Tag pin 'SLOANE STREET' role 'KNIGHTSBRIDGE, 2.30 PM' at 10.6 |
| 15.90-20.40 | still HCR last frame, dark, slow push (\"there's nothing\") | - |
| 20.40-24.00 | dark_empty_hallway 0-3.6 | Tag pin 'PIMLICO' role 'HIS FLAT' at 23.0 |
| 24.00-28.70 | rain_window_night (vertical: fg 608 wide + blurred copy) | - |
| 28.70-31.90 | photo sis_building_vauxhall | - |
| 31.90-36.00 | wet_pavement_night 2-6 | TypedDate '23 AUGUST 2010' at 32.4 |
| 36.00-41.00 | TCard kick '36 ALDERNEY STREET, PIMLICO' lines ['TOP-FLOOR FLAT','A GOVERNMENT FLAT'] on blurred london_rain_street_b | |
| 41.00-46.60 | dark_empty_hallway 4-9.6 slow | - |
| 46.60-50.10 | TCard kick 'ON THE BED' lines ['HIS PHONE','SEVERAL SIM CARDS'] on blurred empty_hallway | |
| 50.10-54.30 | empty_hallway (vertical) | - |
| 54.30-60.10 | padlock_gate_chain 0-5.8 | RedCircle on lock at 57.9 (verify position) |
| 60.10-63.80 | TCard kick 'INSIDE THE BAG' lines ['THE KEY TO THE PADLOCK'] on blurred padlock_gate_chain 8 | |
| 63.80-67.70 | dark_empty_hallway 0.5 (different push) | - |
| 67.70-73.40 | photo westminster_coroners_court | - |
| 73.40-78.40 | padlock_red_rail (vertical) | RedCircle on lock at 74.3 |
| 78.40-82.20 | TCard kick 'POST MORTEM / FORENSICS' lines ['NO FINGERPRINTS','NO GLOVES'] on blurred wet_pavement 20 | |
| 82.20-85.80 | rain_window_night 15-18.6 | - |
| 85.80-90.80 | london_rain_street_b 10-15 | TypedDate '6 SEPTEMBER 2010' at 86.4 |
| 90.80-94.20 | HPK raw 0-3.4 (contain + fill) | Credit Met |
| 94.20-97.70 | HCR raw 0-3.5 | Credit Met |
| 97.70-101.40 | london_rain_street_a 0-3.7 | - |
| 101.40-104.90 | TCard kick 'JUNE OR JULY 2010' lines ['A MAN AND A WOMAN','LET IN LATE ONE EVENING'] on blurred regent_street 5 | |
| 104.90-110.90 | london_rain_street_b 30-36 | Tag 'JACQUELINE SEBIRE' role 'DETECTIVE CHIEF INSPECTOR, MET' at 105.1 |
| 110.90-114.30 | wet_pavement_night 12-15.4 | - |
| 114.30-118.50 | TCard kick 'DNA ON HIS HAND' lines ['A FORENSIC SCIENTIST\'S'] on blurred dark_empty_hallway | |
| 118.50-123.40 | rain_window_night 22-26.9 | - |
| 123.40-128.40 | padlock_gate_chain 7-12 | - |
| 128.40-132.70 | photo hans_crescent_geograph, Dip outN 16 | - |
| 132.70-142.20 | REPLAY: Grade mono; Cam s[1,1.15] over whole shot; _V HCR trim 0 speed .5 contain on #0B0B0C-ish blurred HCR fill, Win[0,450] + Img still Win[450,570]; Lbl 'REPLAY' tl; Credit Met; Dip inN 14 | |
| 142.20-145.60 | photo westminster_coroners_court | Tag pin 'WESTMINSTER CORONER\'S COURT' role 'INQUEST, 2012' at 142.6 |
| 145.60-150.40 | TCard kick 'SIGNED BY THE FOREIGN SECRETARY' lines ['PUBLIC INTEREST','IMMUNITY CERTIFICATE'] on blurred sis_b | |
| 150.40-155.60 | photo sis_building_vauxhall_b | - |
| 155.60-160.40 | padlock_gate_chain 2-6.8 | - |
| 160.40-164.80 | TCard kick 'TWO EXPERTS' lines ['ABOUT 400 ATTEMPTS','NEITHER GOT IN'] on blurred padlock | |
| 164.80-170.40 | photo westminster (other crop) | Tag 'RICHARD SHEPHERD' role 'PATHOLOGIST' at 165.9 |
| 170.40-174.00 | empty_hallway | - |
| 174.00-177.40 | TCard kick 'CARBON DIOXIDE' lines ['TWO TO THREE MINUTES'] on blurred rain_window | |
| 177.40-180.40 | wet_pavement 25-28 | TypedDate '2 MAY 2012' at 177.9 |
| 180.40-183.60 | photo westminster | Tag 'FIONA WILCOX' role 'CORONER' at 180.6 |
| 183.60-189.80 | PageC img crop, bands [99,388,968,52,34] [87,448,314,52,78] (f0 = shot frames; unnatural at 184.16); backdrop blurred westminster photo Cam; Credit 'SOURCE: RTE NEWS, 2 MAY 2012' | |
| 189.80-194.00 | padlock_red_rail | - |
| 194.00-198.00 | rain_window_night 5-9 | - |
| 198.00-201.60 | london_rain_street_b 40-43.6 | - |
| 201.60-205.40 | TCard kick 'THE CORONER ON THE PRESS LEAKS' lines ['AN ATTEMPT TO','MANIPULATE THE MEDIA?'] on blurred regent | |
| 205.40-209.40 | photo sis_building_vauxhall_b | - |
| 209.40-213.60 | TCard kick 'AT HIS MI6 OFFICE' lines ['NINE MEMORY STICKS','NEVER PASSED ON'] on blurred sis | |
| 213.60-217.40 | photo sis_building_vauxhall | - |
| 217.40-220.60 | wet_pavement 30-33.2 | - |
| 220.60-224.60 | regent_street_rain_night 10-14 | TypedDate 'NOVEMBER 2013' at 221.0 |
| 224.60-228.60 | london_rain_street_a 3-7 | - |
| 228.60-233.60 | london_rain_street_b 50-55 | Tag 'MARTIN HEWITT' role 'DEPUTY ASSISTANT COMMISSIONER, MET' at 230.7 |
| 233.60-237.60 | TCard kick 'THE MET, 2013' lines ['LOCKED HIMSELF IN','BY ACCIDENT'] on blurred padlock | |
| 237.60-241.60 | photo valley_anglesey_church | - |
| 241.60-245.60 | photo sis_b (other crop) | - |
| 245.60-249.60 | wet_pavement 34-37.4 (cap at 37.4) | - |
| 249.60-254.60 | london_rain_street_b 60-65 | Tag 'BORIS KARPICHKOV' role 'FORMER KGB OFFICER' at 251.0 |
| 254.60-258.00 | dark_empty_hallway 6-9.4 | - |
| 258.00-261.60 | rain_window_night 26-29.6 | - |
| 261.60-265.40 | TCard kick 'HIS CLAIM ALONE' lines ['NO EVIDENCE','HAS EVER BACKED IT'] on blurred hallway | |
| 265.40-270.40 | regent_street_rain_night 20-25 | - |
| 270.40-275.00 | wet_pavement 2-6.6 | TypedDate 'NOVEMBER 2023' at 273.4 |
| 275.00-278.60 | TCard kick 'MET REVIEW, 2024' lines ['NO NEW DNA','NO ONE ELSE THERE'] on blurred regent | |
| 278.60-282.20 | padlock_red_rail 2-5.6 | - |
| 282.20-287.00 | snowdonia_a 0-4.8 | - |
| 287.00-291.60 | photo valley_anglesey_church | Tag pin 'VALLEY, ANGLESEY' role 'BURIED 26 SEPTEMBER 2010' at 287.3 |
| 291.60-295.40 | photo sis_building_vauxhall | Tag 'SIR JOHN SAWERS' role 'HEAD OF MI6' at 292.8 |
| 295.40-300.40 | QuoteC lines ['Free to run','in the mountains.'] attr 'HIS HEADSTONE, VALLEY' at word 'Free' (297.04 -> f 98) on snowdonia_a 5-10 (Cam push + blur 3, warm grade) | |
| 300.40-309.00 | HCR last still, very dark (bri .5), slow push 1.0->1.08; Dip outN 30 | - |
Check: all shots >= 3 s; no same text device back to back; one big text device at a time (Credit/Lbl small allowed).
## Next (agent after me)
1. Write cases/lm_case01b.mjs from this table (structure = lm_intro.mjs; id 'lm_case01b', media 'last-moments', end 309.0,
   plain true). 2. node build.mjs lm_case01b; check --json in parts/lm_case01b. 3. stills (1 per shot) ->
   productions/last-moments/edit/qa/lm_case01b_sheet.jpg (build/framesheet.py works on mp4 only; use the hyperframes snapshot
   cmd per lm_intro STEP 8), YAVG ~52-58, check RedCircle positions, TCard/PageC/QuoteC look. Max 2 fix rounds.
## Agent 2 progress (2026-11-18)
- STEP 1 DONE: cases/lm_case01b.mjs written (70 shots = table + B66 valley uses TypedDate, not Tag, to avoid Tag twice in a row;
  padlock files are *_illustrative.mp4; vertical clips full-frame cover; RedCircle in a twin Cam outside the mono grade).
- STEP 2 DONE: build exit 0, no media window problems; check 0 errors (11 warnings: dup media, small credit text, heavy overlays).
- STEP 3 QA round 1: photos bri .6/sat .3 (were Y100-119), per-source b-roll brightness map SB (night clips were Y6-27), card backdrops brighter, RedCircle positions refit from stills, page W1320. Pimlico Tag moved to B05 (word at 23.0 was 1 s before the cut). Scratch: scratchpad/c01b (times.txt, sheet.py).
- QA round 2 (final): faces: new media photos/c01b_brompton_mos.jpg (brompton, 3 pixelated boxes, 48 src px blocks); B29 now
  hans_crescent_sign (ELL BROWN / CC BY-SA 2.0; geograph photo = crowd of private faces); B66 credit bottom-right (clashed with
  the long TypedDate). Build exit 0, check 0 errors. Stills YAVG mean 57 (photos 54-75, night b-roll 31-63, cards 26-54, page 109).
  Sheet: productions/last-moments/edit/qa/lm_case01b_sheet.jpg (70 stills). Scratch stills: scratchpad/c01b/snapF.
- OPEN: harrods_side / sloane_street / sis photos not checked at full size for faces (small, distant); dark_empty_hallway still
  Y31-34 and B26 card Y26 (night clip, bri 3.0 max before noise); page B41 Y109 (white paper); mix not measured.
## Agent 3 (pro kit + case01b v2, 2026-11-19)
- LM_PRO READY (module loads; render check in progress, see below): `hf-engine/devices/lm_pro.mjs`. Case: devices [...,'lm_pro'];
  fonts BebasNeue, IBMPlexMono-600 (+ VCR OSD Mono file when the intro agent adds it; falls back to VT323 / ShareTechMono).
  - `LowerThird {name, role, at=0, hold=200, pos='l'|'c'|'r', size=92, pin=false, y=118}` ink brush bar + eroded Bebas caps + torn paper role strip. Drop-in for Tag.
  - `Article3D {img, iw, ih, bands:[[x,y,w,h,f0]], src, date, focus:[x,y], W=1480, H=820, rx=[11,2], ry=[-12,-2], s=[.9,1.1]}` wrapper, kids = backdrop. Bands in img px, max 2. Bake mosaics into img.
  - `StampRing {x,y,w,h, at=0, hold=1e9, rect=[0,0,1920,1080], zoom=1.3, dim=.55, zin=40}` wrapper, kids = footage; x,y,w,h = timestamp box in screen px; rect = picture area (contain letterbox). Ring clamped inside rect.
  - `TitleType {kick, lines:[..], at=8, size=78, cps=22, align='c'|'l'}` VCR typed card, same props as TCard; put over a backdrop.
- Ref look studied (latest5 f1): name tag = black brush blob + white distressed condensed caps bottom-centre; article = white crop,
  serif, yellow marker phrase by phrase on a posterized/dark backdrop; date = VCR type top-left with block cursor.

## Articles agent (2026-11-19)
- BLOCKED: no page captured. `prep_assets.py --only c01b2,c01b3,c01b4` fails at step 3/6: `gh workflow run task.yml` -> "HTTP 500: Failed to run workflow dispatch" (6 tries over ~8 min, also 1-case run; githubstatus all OK, workflow file unchanged since 11-16, API answers 422 for bad input, so GitHub-side 500). Not a page problem.
- Added to `productions/last-moments/edit/assets.json` (backup `assets.json.bak_20261119`), case ids c01b2/c01b3/c01b4, page id `art` (asset names `c01b2_art` ...), all Guardian (live pages load, no wall, sentences verified exact in page HTML):
  - c01b2 https://www.theguardian.com/world/2010/aug/25/british-spy-mi6-gareth-williams : "The body of Gareth Williams was stuffed in a holdall and dumped in his bath." (headline says "murdered"; 2010 claim)
  - c01b3 https://www.theguardian.com/uk-news/2013/nov/13/mi6-spy-dead-bag-locked-himself-gareth-williams : "Outlining the results of a three-year investigation on Wednesday, the Metropolitan police said Gareth Williams most likely died alone in his flat."
  - c01b4 https://www.theguardian.com/uk-news/2024/feb/05/no-new-dna-evidence-gareth-williams-likely-died-alone-forensic-review-finds : "No new DNA evidence was found and no further lines of inquiry were identified."
- Next: rerun the same prep command when GitHub dispatch works, then crop (steps c-e) -> pages/c01b_art_<id>.jpg + c01b_articles.json. Not done: crops, c01b_articles.json, MEDIA_LOG rows.

## Media agent (2026-11-19)
- 20 new Pexels clips `nb_*.mp4` (1920x1080 60fps h264, no audio, 8-20 s) in `assets/broll/` and hf-engine `media/last-moments/broll/`; metadata in `hf-engine/media/last-moments/c01b_new_media.json` (dur, yavg, author, licence, note); all logged in `assets/MEDIA_LOG.md`.
- Weak matches (see json notes): nb_door_night (daylight door, not night), nb_bathroom_dark (bright empty drain), nb_fingerprint_dust (ink fingerprinting, not powder), nb_wales_coast (sunny), nb_cctv_camera (pole cameras, bright), nb_stopwatch (pocket watch dial). Faces checked on one contact sheet: none identifiable.
- 7 `np_*` Commons photos NOT delivered: upload.wikimedia.org answered HTTP 429 to every request for 40+ min (IP throttle). Rerun `python -I -X utf8 productions/last-moments/build/commons_photos_np.py` from the folder root when it clears; it downloads, copies to both photo dirs and adds json entries (then check faces, add notes).
- Pexels search blocked scripted queries (HTTP 403) after ~15 searches; clips were chosen from page titles, only the contact sheet was viewed.
