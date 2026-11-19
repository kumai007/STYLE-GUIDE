# last-moments v4 (owner notes 2026-11-19: cleaner text, fade not type, PlaceText, click SFX)

## V4 KIT READY (devices/lm_pro.mjs, 2026-11-19)
Backups of v3: scratchpad only (lm_pro.v3.bak.mjs). API (old params still work):
- `LowerThird {name, role, at=0, hold=200, pos='l'|'c'|'r', size=92, pin=false, y=118}` - CLEAN now: soft dark brush bar (low edge
  wobble, 3 short fingers, 16 % grain on the bar only), plain Bebas caps (no distress), role = Plex Mono 500 21 px on a small dark
  strip, -1 deg, clip wipe in 24 f power2.out, name +10 f, role +16 f, wipe off L->R 16 f after hold. Use 1-2x per case (key people).
- `TextFade {kick, lines:[..], at=8, pos='c'|'l'|'tl', size=78 (tl 56), hold=f|null, font='vcr'|'mono', x, y}` - non-title text:
  lines fade in 30 f eased + 8 px rise (6 f stagger), out 18 f (hold null = out ends at shot end). 'c'/'l' = card over soft scrim,
  'tl' = date top-left x100 y62 (Abyssal ref spot), no scrim. `TitleType {mode:'fade', ...}` = same as TextFade (pos from align).
- `TitleType` default (type-on + key ticks) = TITLE SCREENS ONLY (CASE 1 etc).
- `PlaceText {text, sub, at=0, hold=f|null, pos='bl'|'br'|'tl'|'tr' | x,y (top-left px), size=50, font='vcr'|'mono'}` - plain place
  name on the footage: VCR OSD Mono caps 50 px, soft shadow, no bar/box, optional Plex sub line (26 px); default bottom-left x96
  bottom 84; on contain raws pass x,y inside the picture (HPK S26: x 284, y 64, credit moved tr). Fade as TextFade (8 f stagger).
- Click SFX: `media/last-moments/sfx/lm_click.wav` (Epidemic "Camera, Digital SLR, Sony Alpha, Take Photo, Shutter Click Only",
  0.365 s, peak at 0.223 s). SFX table row `lm_click: [0.365, -70, -22.2, -1.0, 0.223]`; call `sfx('lm_click', t - 0.15)` at each
  TextFade/PlaceText start t (part s) -> 3 dB under music via the sfx() helper. Keep >= 0.3 s from other SFX starts. No lm_key ticks
  except on title screens.
- Case fonts needed: BebasNeue, IBMPlexMono-500, VCROSDMono (already in lm_case01a list).

## lm_case01a status
- DONE 2026-11-19 (v3 backup: scratchpad lm_case01a.v3.bak.mjs). LowerThird only S01 GARETH WILLIAMS (pos 'c', above the HCR stamp,
  brush SFX 1.54 kept). Places -> PlaceText: S02 Hans Crescent, S06 Valley (+44 f, click 0.48 s after the dip boom), S10 Manchester
  (no sub), S13 Prestbury, S16 SIS Building, S24 West End, S26 Holland Park (inside the picture top-left x284 y64; credit -> tr).
  Dates -> TextFade 'tl' (S07, S19, S22, S37); S25 date = TextFade 'l' card on its blurred backdrop; cards S12/S23 = TitleType
  mode 'fade'. 14 lm_click SFX (CLICKS list, start t-0.15); TYPED key stream + 6 brush SFX removed.
- Abyssal compare (refs o_nl9 47/51 s, uINKD 52/55 s, C8Tv 61 s, UC8R 241 s): dates moved from mid-left scrim card to top-left
  x100 y62 (ref spot); place text bottom-left x96 like ref pin tags, size 40->50 VCR (ref cap ~40); card kick 0.42->0.5 of 78 px
  (was unreadable); name tag centred like refs; tighter 3 px dark halo on place text for busy facades.
- Verify: build exit 0; check ok, 0 errors, 7 warnings. Sheet productions/last-moments/edit/qa/lm_case01a_v4_sheet.jpg (15 text
  shots). Full-size seen: LowerThird S01 (in + mid-wipe), PlaceText S02 + S26. Not done: audio listen of the clicks.

## Part B (lm_case01b v4, 2026-11-19)
- Cards 14 -> 4 (TitleType mode 'fade' + click): B13 key, B17 forensics, B35 two experts, B53 accident. 10 VO-repeat cards -> unblurred footage.
- One LowerThird: B40 FIONA WILCOX. Names -> PlaceText+sub+click: Sebire (tr, clear of STOP tape), Hewitt (full role as sub), Karpichkov, Sawers; Shepherd dropped (VO says it).
  Places PlaceText: Sloane St, Pimlico, 36 Alderney St (B08), Westminster Coroner's Court, Valley Anglesey (B66, date split to TextFade tl).
- All TypedDate -> TextFade tl + click; lm_key ticks/typing() removed. 19 clicks, 0 keys, 1 brush.
- Picture swaps: B14 drain -> nb_forensic_lab; B10 phone_sim, B11/B38 stopwatch (bri .75), B23 door, B25 regent, B26 key_hand, B27 code screen
  (LGC code entry), B32/B60 documents, B36 holdall, B47 SIS, B48 empty hallway, B49 usb, B63 forensic lab. Stock <= 2 uses (holdall 3rd = inactive fallback).
- build exit 0, check 0 errors. Sheet: productions/last-moments/edit/qa/lm_case01b_v4_sheet.jpg. Backup cases/lm_case01b.mjs.bak_v3.
- Part A lead fixes: S19 rain window cover full frame; S12 GCHQ card bg = blurred dark nb_cctv_camera (Commons 429); S22 3 SEPT 2010 =
  cyclist_drone_road 6.4; prestbury only on S13. build 0, check 0 errors; qa/lm_case01a_v4fix_sheet.jpg; backup lm_case01a.mjs.bak_v4fix.
- Open: SFX mix not measured; nb_cctv now 2 uses (A S12 + B B22).
