# last-moments case 1 part A (lm_case01a) agent: handoff (2026-11-18)

Scratch (temp): `$TEMP/c01a/` (chk.py = check JSON summarizer: `python chk.py check.json [warn]`).

## STEP 0 DONE (lm_intro.mjs released to the design agent; this agent no longer edits it)
Owner note (lead): no flat plates / plain mono text on flat colour / flat grids / flat highlight boxes; every text sits on a
real footage/photo backdrop with grain, falloff, depth, eased 3-D camera moves; tags integrated with shadow + light.

## STEP 0 intro fixes
- lm.mjs Credit: 28 px, text #E8E4DC on a rgba(11,11,12,.55) chip (dim grey was unreadable on bright CCTV), new prop
  `place` 'tr'|'br'|'bl'|'tl'. GlitchCut: slice copies get unique id/url(#) suffixes (`_g<i>`).
- lm_intro: HPK credit 'tl' (CAM 1 stamp top-right, Holland Park/time bottom); WED gate origin '0% 0%' (timestamp whole),
  credit 'br'. Rebuilt; check ok, 0 errors, 23 warnings. Snapshots seen (HPK 4 s, WED 30.5 s, glitch 2.52 s): fine.
- Not changed: split P4 WED Kent still scale 1.22 origin 50% 0% (timestamp may be cut at the left).

## Next: Commons retry, VO clean, map, build lm_case01a

## Commons retry: DONE (0/10, HTTP 429 on every download; logged in assets/MEDIA_LOG.md)

## VO: DONE (`build/vo_clean.py`, part B's args version; output vo/cut/, hardlinked to media vo/c01a_p01a|p01b|p01c|p02.wav)
cuts (source s): p01a 0:0.44, 4.03:4.31, 26.32:26.52, 35.82:36.18 (fill 0.0,4.2,26.32,36.0); p01b 14.08:14.50 (fill 14.06);
p01c/p02 none. Lens: p01a 43.38, p01b 51.76, p01c 38.20, p02 42.78. I LUFS -28.9/-30.3/-29.2/-28.6, peaks -2.7/-3.2/-5.6/-1.9.
p01a 35.82:36.18 cut is inferred from RMS (Whisper times were off there): listen / Whisper-verify on GitHub.
Placement (part s): A=p01a at 0.50, B=p01b 43.80, C=p01c 95.57, HPK raw 133.95-138.98 (src 0-5.03, VO paused),
D=p02 139.30, HCR raw 182.10-185.85 (src 0-3.75). Part end 185.85 (~3:06).

## Media: DONE `build/c01a_media.py` -> media/last-moments/c01a/: photos (2560 px copies), B-roll hardlinks (src 'c01a/<name>'),
map_z12.jpg + map_z14.jpg (3840x2304 each, dark re-skin, EOX credit "SENTINEL-2 CLOUDLESS BY EOX (CC BY 4.0)"), map.json:
z14 frame px: hpk [1439.9,1047.3], hcr [1950.2,1212.0]; z12 image in the z14 frame = drawn at 4x (15360x9216) with its top-left at (-5376, -3072) (= z12 x0*4 - z14 x0, y0*4 - y0).
Map composites not yet looked at (check the re-skin in a still).
sfx/roomtone_lp.wav (8 s brown noise LP 700 Hz, -35.4 LUFS; raws: lay at ~-48 LUFS => gain -12.6 dB).
make_maps_pc.py NOT usable here (needs autoedit timeline/video.json): build the map as a live device instead (img layers + CSS camera).

## Shot plan (decided; part s; one text device at a time; Credit = small source label, not counted)
S01 0-4.16 HCR freeze t1.9 (speed .02) push; Credit MET 'tl'? (HCR stamps are left: use 'tr'); NameTag GARETH WILLIAMS at 1.54 (short hold)
S02 4.16-10.40 photo hans_crescent_harrods_side drift; PlaceTag HANS CRESCENT, KNIGHTSBRIDGE at 6.24; credit DANIEL X. O'NEIL / CC BY 2.0
S03 10.40-17.96 HCR t0 @0.5 (man walks); Credit MET
S04 17.96-24.64 HCR freeze end, zoom x2.2 to the bottom-left stamp; RedCircle on stamp 19.56; TypedDate 15 AUGUST 2010 at 21.54
S05 24.64-28.10 HCR freeze t3.70 (empty doorway) mono; Dip out 16 f at end
S06 28.10-32.62 valley_anglesey_station; PlaceTag VALLEY, ANGLESEY 28.2; credit NEIL THEASBY / CC BY-SA 2.0
S07 32.62-37.34 valley_anglesey_church; TypedDate 26 SEPTEMBER 1978 at 32.62; credit PETER WOOD / CC BY-SA 2.0
S08 37.34-43.80 bangor_university; RedCircle on main building ~42.6; credit TILMAN2007 / CC BY-SA 4.0
S09 43.80-49.78 c01a/snowdonia_a ILLUSTRATIVE (mono + label)
S10 49.78-54.22 manchester_university; PlaceTag UNIVERSITY OF MANCHESTER 49.9; CITYSUITESIMAGES / CC BY 2.0
S11 54.22-57.94 st_catharines_cambridge; Spotlight; JUKKA AMINOFF / CC BY-SA 4.0
S12 57.94-63.80 prestbury_village blurred dark backdrop; TypedDate 2001 at 58.08 (no GCHQ photo: Commons 429)
S13 63.80-68.74 prestbury_village sharp other crop; PlaceTag PRESTBURY, CHELTENHAM 66.26; MICHAEL DIBB / CC BY-SA 2.0
S14 68.74-73.54 c01a/cyclist_drone_road ILLUSTRATIVE
S15 73.54-77.40 c01a/london_rain_street_b; TypedDate SPRING 2009 at 74.22
S16 77.40-80.52 sis_building_vauxhall; PlaceTag SIS BUILDING, VAUXHALL 77.62; COLIN SMITH / CC BY-SA 2.0
S17 80.52-84.42 sis_building_vauxhall_b; Spotlight; RICHARD COOKE / CC BY-SA 2.0
S18 84.42-90.78 c01a/london_rain_street_a ILLUSTRATIVE
S19 90.78-95.57 c01a/rain_window_night (vertical, Vertical fw 608) ILLUSTRATIVE; TypedDate SUMMER 2010 at 90.98
S20 95.57-101.93 london_rain_street_b other span (t 30)
S21 101.93-105.47 sis_building_vauxhall tight crop; RedCircle
S22 105.47-108.93 prestbury other crop; TypedDate 3 SEPTEMBER 2010 at 106.40
S23 108.93-113.65 c01a/wet_pavement_night ILLUSTRATIVE; TypedDate 11 AUGUST 2010 at 109.0 (flew home from the US)
S24 113.65-119.21 c01a/regent_street_rain_night; PlaceTag WEST END, LONDON 115.67
S25 119.21-122.31 london_rain_street_a t 4; TypedDate SATURDAY 14 AUGUST 2010 at 120.21
S26 122.31-127.60 HPK freeze t0 (contain + fill, scale 1.04 origin bottom); Credit MET 'tl'; PlaceTag HOLLAND PARK STATION 124.81
S27 127.60-130.87 HPK freeze; Spotlight on the cone (x 724, y 922)
S28 130.87-133.95 HPK freeze zoom x2 at the stamp (1292,934); RedCircle 131.87
S29 133.95-138.98 HPK RAW 0-5.03 @1, VO paused, room tone, Credit MET 'tl'; riser ending 133.95, boom_low at 133.95
S30 138.98-144.60 HPK replay t1.5 @0.45 mono + Spotlight on the man (1005,540) ("five foot seven")
S31 144.60-150.02 HPK freeze t4.5 mono slow push
S32 150.02-154.40 c01a/regent_street_rain_night t 20 ILLUSTRATIVE; S33 154.40-158.50 london_rain_street_b t 50
S34 158.50-163.06 wet_pavement_night t 15 ("where he was heading on the Underground")
S35 163.06-167.80 MAP: z12->z14 eased push, pin HPK "HOLLAND PARK · 14 AUG" then pan to pin HCR, typed "KNIGHTSBRIDGE · 15 AUG" (no route line: not a journey)
S36 167.80-171.10 brompton_road_knightsbridge; PlaceTag BROMPTON ROAD 168.32; LEWIS CLARKE / CC BY-SA 2.0
S37 171.10-175.20 hans_crescent_geograph; TypedDate 14:27 at 172.06; LEWIS CLARKE / CC BY-SA 2.0
S38 175.20-178.42 hans_crescent_sign; ELL BROWN / CC BY-SA 2.0
S39 178.42-182.10 HCR freeze t0; Spotlight top-right (entry point)
S40 182.10-185.85 HCR RAW 0-3.75 @1, VO paused, room tone, Credit MET; boom_low at 182.10
Audio: music continues the intro title bed = dark_days from offset 5.07 at part 0 (no fade-in), crossfade ~6 s at ~105 to tarmac
from 61.1, ~160 back to dark_days from 0; musLane target VO-10 (~-39 LUFS), -6 dB under raws; ticks on TypedDates (-22 re VO
peak); SFX ~-14 re VO. Owner note (lead): every text on real backdrop, grain, falloff, 3-D perspective eased moves, tags with shadow.
Photo device (new, devices/lm_c01a.mjs): img cover, keyed drift scale 1.04->1.12 + small rotateY/perspective, Grade on top.

## Not done (next agent)
1. devices/lm_c01a.mjs: Photo (drift + perspective), MapC01 (two img layers + pins + typed label), Illus label. NameTag/PlaceTag
   need a `hold` prop + softer shadow (lm.mjs is shared: keep defaults).
2. cases/lm_case01a.mjs from lm_intro.mjs structure (vo starts [0.50,43.80,95.57,139.30], lens above, files vo/c01a_*.wav).
3. build, check, stills sheet edit/qa/lm_case01a_sheet.jpg (framesheet: `npx hyperframes@0.9.56 snapshot --at ... -o DIR`).
