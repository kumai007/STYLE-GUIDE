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
