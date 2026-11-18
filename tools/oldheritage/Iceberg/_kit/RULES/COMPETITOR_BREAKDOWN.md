# Competitor breakdown: "Most Disturbing Flash Games" vs 5 reference docs

Measured 2026-11-02. Nothing in the project was edited. Scratch data (windows, scene scores, contact sheets, spectrograms) is in the session scratchpad.

## Method

| Source | Window A | Window B | Note |
|---|---|---|---|
| DYKG `dykg_lost_found_0730.mp4` (6:00 clip) | 0:00-3:00 | 3:00-6:00 | The file is only 6 min long, so A and B are back to back |
| Jorge `jorge_40more_0000.mp4` (6:00 clip) | 0:00-3:00 | 3:00-6:00 | Same as above |
| Visual Venture `vv_coldcases.mp4` (28:24) | 2:00-5:00 | 14:00-17:00 | |
| MagnatesMedia `magnates_rockefeller.mp4` (25:00, 360p) | 2:00-5:00 | 12:00-15:00 | |
| fern `Hunt for America's Smartest Killer` (28:09) | 2:00-5:00 | 14:00-17:00 | Window A includes the title sequence |
| **Ours** `s013_mix.mp4` / `s006_mix.mp4` | s013 0:00-3:00 | s006 0:00-3:00 | |

- **Cuts:** two detectors were used.
  - (a) A strict ffmpeg `scene` single-frame spike (>0.30, with calm frames on both sides). This catches hard cuts.
  - (b) A motion-robust detector at 10 fps: a 64-bin colour-histogram difference plus a pixel difference across a 1 s span, taking the local maximum. This catches every visual change: dissolves, fades, pushes into a new image and new elements arriving.
- **Treatments:** 1 fps contact sheets were reviewed by eye. 21 sheets were read (about 21 minutes of picture). The percentages are estimates by eye, accurate to about ±5 %.
- **Picture stats:** luma and saturation at 2 fps on 64x36 frames. A frame counts as "frozen" when the luma difference from the frame 0.5 s earlier is below 1.
- **Audio:**
  - ebur128 momentary loudness.
  - Level in the speech band versus speech pauses, using a 20 ms RMS envelope; a pause is a stretch at least 8 dB below the speech median lasting 0.6 s or more.
  - A 40 s spectrogram per channel, read by eye.
  - Automatic SFX onset counting was tried. It **did not separate SFX from speech**: accents at cuts landed at the same rate as at random times in every file. SFX statements below therefore come from the spectrograms and are qualitative.

---

## 1. Shot length

| Window | Hard cuts / 3 min (strict) | All visual changes / min (detector b) | Median s | p25-p75 s | Longest unchanged s |
|---|---|---|---|---|---|
| DYKG A / B | 20 / 25 | 16.3 / 14.0 | 2.8 / 3.4 | 1.5-5.5 / 1.7-6.3 | 13.9 / 13.7 |
| Jorge A / B | 22 / 11 | 13.3 / 17.3 | 2.7 / 2.8 | 2.0-6.8 / 1.9-5.0 | 18.3 / 11.0 |
| VV A / B | 33 / 37 | 16.3 / 17.7 | 2.8 / 2.7 | 1.9-4.5 / 1.5-4.4 | 12.2 / 11.2 |
| Magnates A / B | 4 / 4 (+9 dissolves) | 15.3 / 13.0 | 3.0 / 3.4 | 1.7-5.2 / 2.2-4.8 | 11.6 / 21.1 |
| fern A / B | 22 / 29 | 10.0 / 12.7 | 4.2 / 3.6 | 1.7-7.8 / 2.5-4.6 | 27.2 / 32.3 (slow 3-D camera) |
| **Ours s013** | **2** | 12.0 | 2.8 | 1.8-**6.0** | **24.1** |
| **Ours s006** | **0** | 7.7 | 3.5 | 1.7-**9.0** | **51.7** |

**What this shows:** our *median* rate of visual change is already in the reference range (2.7-3.5 s). The rough feel does not come from the median. It comes from three other places:

- **Long tails.** Our p75 is 6-9 s against 4.4-5.5 s for VV, Magnates and DYKG, and our longest unchanged stretch is 24-52 s against 11-14 s.
- **Almost no hard cuts.** We have 0-2 hard cuts per 3 min; DYKG, VV and fern have 20-37. See section 5.
- **Holds with nothing moving.** See section 7.

---

## 2. Treatment inventory (% of screen time, estimated from the 1 fps sheets)

| Treatment | DYKG | Jorge | VV | Magnates | fern | **Ours s013** | **Ours s006** |
|---|---|---|---|---|---|---|---|
| Raw gameplay / footage | 70 | 72 | 20 (news/interview) | 0 | 0 | **78** | **45** |
| Zoomed / cropped detail of footage | 3 | 0 | 0 | 0 | 0 | 8 | 0 |
| Footage with annotation | 8 (pixel captions, quotes) | 2 (game-name tag) | 5 (colour isolation, ticks) | 0 | 0 | 2 | 0 |
| Screenshot / article / web page | 5 | 12 | 10 (highlighter) | 0 | 4 (magnifier) | 8 | **20 (the same page 3x)** |
| Document as physical prop | 0 | 4 (magazine scans) | 3 (macro paper) | 10 | 2 | 0 | 0 |
| Photo of a person / object | 12 (cabinets, badge) | 0 | 8 (torn-paper timeline) | 15 (cut-outs) | 0 | 0 | 2 |
| Archival TV / interview | 6 | 0 | 0 | 0 | 0 | 0 | 0 |
| Face cam | 0 | 0 | 18 | 0 | 0 | 0 | 0 |
| 2D/3D motion graphic / infographic | 0 | 0 | 0 | 12 (charts, jars, cork board) | 0 | 0 | 5 (icon row) |
| Pictogram animation | 0 | 0 | 25 (neon) | 5 (white on grid) | 0 | 2 | 3 |
| Graded cinematic stills / 3-D scenes | 0 | 0 | 6 (stock recreation) | 45 | 85 | 0 | 0 |
| Map | 0 | 0 | 5 (drone + name) | 7 | 0 | 0 | 0 |
| Text / number / chapter card | 2 | 10 (number cards) | 3 | 3 | 9 (credits, typewriter) | 2 | **15 (title screen, letters)** |
| Near-black / low-information frame (luma < 20) | 1-4 | 12-19 | 11-26* | 5-9 | 5-12 | 11 | **60** |

\* VV's dark frames are *designed*: neon on black. Ours are unlit game frames.

**Takeaway.**

- The game channels (DYKG, Jorge) are also about 70 % raw footage, so being footage-heavy is fine.
- DYKG differs from us in how the footage is used:
  - Each gameplay shot is a different moment, cut hard every 2-6 s.
  - Footage sits inside a constant branded frame: a 4:3 pillarbox on a sprite wallpaper.
  - Real-world photos (cabinets, people, ID badges) break up the footage every 20-40 s.
- VV and Magnates bring in a *designed* insert (pictogram, icon pop, document prop, map) every 15-30 s.
- Ours has **one designed insert in s013's 3 minutes**: a pictogram at 2:02.

---

## 3. How they show "the thing being talked about"

| Channel | Device | Look | Motion | Rate |
|---|---|---|---|---|
| VV | Article highlight (`ref_vv_article_highlight.png`, 2:03) | Off-white page, serif text, yellow marker over the key sentence | Marker swipes L→R in ~0.4 s, slow push-in | ~1 per min |
| VV | Colour isolation (`ref_vv_colour_isolation.png`, 3:36) | Photo in B&W, the subject keeps its colour, hand-drawn green ✓ / red "?" | Ticks pop on the VO beat | ~0.5 per min |
| VV | Neon pictogram (`ref_vv_neon_pictogram.png`, 2:40) | Red/blue/magenta glowing outlines on black with a floor line | One element added per sentence, 3-5 s builds | 2-3 per min |
| VV | Torn-paper photo strip + gold year/title (`2003 THE SECOND MARRIAGE`) | Horizontal light-line across the frame | Line wipe in | Each chapter beat |
| Magnates | Icon pops (`ref_mag_icon_pops.png`, 2:25) | Orange line icons with bloom beside the subject | Scale-pop, one per noun in the VO | 3-4 events per min |
| Magnates | Document prop (`ref_mag_document_prop.png`, 2:17) | ID card / newspaper / letter with paper texture and 3-D tilt | Camera glides and lands on the name | ~1 per min |
| Magnates | Map | Orange-filled country on dark, dotted route lines | Line draws on, camera travels | Where geography is mentioned |
| fern | Magnifier callout (`ref_fern_document_zoom.png`, 15:14) | Grey page dimmed, one word lifted into a rounded lozenge | Scales up from its own position in ~0.5 s | 1 per document, held 2-3 s |
| DYKG | Pixel-font caption under footage ("ALSO KNOWN AS…", quotes) plus a "FOOTAGE BY" credit | — | Static, 3-5 s | ~2 per min |
| DYKG | Name super on archival (`ref_dykg_archival_super.png`) | — | — | — |
| **Ours** | Red ellipse + small grey caps label (`ref_ours_callout.png`, s013 1:04) | Thin line, low contrast, small | Fade only | **2 per 3 min** |

---

## 4. People and documents

| Channel | People | Documents |
|---|---|---|
| DYKG | Real photos and archival TV of the developers at full size inside the pillarbox, pixel-font name super; a GDC photo placed next to an old photo. A face repeats ≤2x per 3 min. | Website screenshot, scrolled vertically, 5-6 s |
| Jorge | None | Tweets, Variety / Kotaku pages and magazine scans, full frame with a slow zoom, 5-10 s each |
| VV | Interview clips with name lower-thirds; family photos as torn-paper strips with a year label; the host on face cam every 30-60 s | Highlighter on a white page; macro-lens shot of a printed figure ("$45,200.13") |
| Magnates | Cut-out portrait on a *different* background each time (fire, collage, columns, money storm) with a serif name in orange glow (`ref_mag_person_intro.png`); slow push. The same face appears 4x in 3 min, never on the same background. | Physical paper props |
| fern | Fully 3-D characters | Grey web page + magnifier |
| **Ours** | s006: one developer card (photo + name) at 0:27-0:29 and a wiki highlight | Newgrounds upload page **3x in 3 min** (0:03, 0:47, 0:52); in-game letter text on black ~8x |

---

## 5. Transitions

| Channel | Hard cut | Dissolve / fade | Motion transition (whip, push-through, slide, wipe) | Measured transition length |
|---|---|---|---|---|
| DYKG | ~90 % | ~8 % | ~2 % | 1 frame |
| Jorge | ~85 % | ~15 % (into and out of the black number cards) | 0 | 1 frame / ~0.5 s |
| VV | ~70 % | ~10 % (≤0.4 s) | ~20 % (light-line wipe, glitch into pictograms) | 0.3-0.5 s |
| Magnates | ~15 % | ~30 % | ~55 % (elements exit the frame, camera slides into the next still, whip) | 0.5-0.8 s, always with motion |
| fern | ~90 % | ~10 % (chapters only) | 0 | 1 frame |
| **Ours** | **~3 % (2 strict cuts in 6 min)** | **~97 % (crossfade or through black)** | 0 | **0.8-1.2 s with no motion** (`trans.png` strip: s013 0:02, 0:24; s006 0:26) |

---

## 6. Audio

| Window | Momentary loudness median (LUFS) | p95 | Bed level in VO pauses below speech (dB) | Pauses ≥0.6 s per min | Longest pause | Music character (spectrogram) |
|---|---|---|---|---|---|---|
| DYKG A / B | -18.1 / -18.0 | -14.8 | 9.9 / 10.1 | 10 / 11 | 1.3 s | Light chiptune / synth bed, always present, small game SFX |
| Jorge A / B | -21.5 / -18.9 | -16.9 | 15.6 / 13.7 | 20 / 13 | 8.7 s | Trailer audio is left playing between entries |
| VV A / B | -15.9 / -15.3 | -12.8 | 11.5 / 11.0 | 4 / 2 | 2.5 s | Dense continuous low-mid drone, never drops, risers into pictogram scenes |
| Magnates A / B | -12.8 / -12.8 | -10.1 | 11.6 / 13.5 | 12 / 10 | 7.2 s | Continuous bed with clear melodic synth lines (visible tonal stripes), music rises in pauses |
| fern A / B | -20.5 / -20.1 | -15.1 | 19.4 / 17.2 | 18 / 17 | 6.1 s | Sparse; music alone in 2-6 s "breaths" between lines |
| **Ours s013** | -17.0 | -12.8 | **15.6** | **18** | **2.5 s** | Faint bed under wall-to-wall VO, no music-only breaths |
| **Ours s006** | -17.3 | -13.0 | **14.9** | **20** | **2.7 s** | Same |

- Our bed sits 15-16 dB under the voice. The three channels closest to our density (DYKG, VV, Magnates) sit at **10-13.5 dB**, so our music is about 3-5 dB too quiet.
- We pause as often as fern (about 19 per minute) but **never let a pause become a music moment**. Our longest pause is 2.7 s; refs hold 4-9 s breaths 2-3 times per 3 min.
- Pulse: no reference has a strong beat (low-band autocorrelation ≤0.09). All five use beatless or slow (≈50-75 bpm) beds. Ours matches on this.
- SFX: not reliably countable automatically (see Method). From the spectrograms, VV and Magnates place broadband risers and whooshes at their motion transitions, while ours shows none distinct from the VO.

---

## 7. Variety

| Window | Distinct treatments in 3 min | Longest run of one treatment | % of 0.5 s frames frozen (no motion) | Repeated identical asset |
|---|---|---|---|---|
| DYKG | 7 | ~40 s gameplay, but cut every 2-6 s | 16-20 % | None |
| Jorge | 5 | ~45 s trailer, cut every 2-4 s | 14 % | None |
| VV | 11 | ~10 s | 1-3 % | Face cam (planned) |
| Magnates | 10 | ~12 s | 0-1 % | Portraits, but the background changes |
| fern | 4 | Whole video is 3-D, with constant camera moves | 3-6 % | None |
| **Ours s013** | 6 | **~70 s of gameplay (0:25-1:38) incl. 20 s single holds** | **35 %** | Same cell wide shot 4x |
| **Ours s006** | 9 | ~25 s near-black gameplay | 6 % (but **60 % near-black**) | **Title screen 7x, inventory grid 6x, upload page 3x** |

The images `ref_ours_problems.png` and `ref_ours_callout.png` show our issues.

---

## What ours must change (ranked by impact)

1. **Hard cuts are the default: at least 70 % of transitions are 1-frame cuts.** Crossfades only for a time jump or a section change, ≤0.4 s, at most 1 per minute. Fades through black only at case boundaries. Today we have 0-2 hard cuts in 3 min against 20-37 for DYKG, VV and fern.
2. **No still or frozen picture longer than 3 s:**
   - Under 5 % of 0.5 s samples may be frozen (we are at 35 %).
   - When the game itself doesn't move, add a push-in or drift (≥3 % scale per 4 s) or cut to another moment.
3. **Gameplay is cut from several moments:**
   - Median gameplay shot ≤3 s, and no single gameplay shot over 6 s unless something on screen changes.
   - Make the cut at least every 6 s and never sit on one 20 s room shot. This is DYKG's pattern: a different level or angle every 2-6 s.
4. **Shot-length tail:** p75 ≤ 5 s, longest unchanged stretch ≤ 12 s per 3-minute window (we measure p75 6-9 s and longest 24-52 s).
5. **No identical asset more than 2x in 3 minutes, and never twice within 30 s.** Title screens, inventory grids and upload pages count. When a page has to come back, show a different crop, highlight or framing (as Magnates re-backgrounds the same face).
6. **Near-black frames (luma < 20) ≤ 15 % of a window** (s006 is at 60 %).
   - Lift dark Flash games by about +25 % exposure, or put them on a lit textured backplate.
   - Darkness must be designed (neon on black) rather than unlit footage.
7. **A designed insert every 20-40 s (≥5 per 3 min):**
   - The insert is a document prop, a person card, an icon pop or a highlighter. Footage can stay at 60-75 % (as DYKG and Jorge).
   - **No treatment more than 2 times in a row**, and ≥7 distinct treatments per 3 min.
8. **Callout style rebuilt:**
   - **Shape and motion:** one bold shape (thick 6-8 px stroke or a lifted magnifier lozenge) in one accent colour that matches the grade, scaling up from its anchor in 0.4-0.5 s. The rest of the frame is dimmed by 40 %, and the callout is held 2-3 s.
   - **Rate:** at least 1 per minute. Today there are 2 in 3 min, each a thin red ellipse with a tiny grey label (`ref_ours_callout.png`).
9. **Documents become props, not flat screenshots:**
   - Paper or monitor texture, a 3-D tilt of 5-15°, and a camera glide that lands on the key line.
   - A yellow highlighter swipe (0.4 s) on the quoted sentence.
   - One per source mention; never the same page framing twice.
10. **Developer intros:**
    - **Card:** cut-out photo, name in the display font beside the face, a background unique to that case, 4-6 s, slow push.
    - **Re-use:** each later re-appearance uses a different background or crop.
    - **Name super:** add one whenever a real developer, uploader or forum user is named.
11. **Music bed sits 10-13 dB under the voice, not 15-16 dB.** Overall integrated level of about -14 to -16 LUFS (Magnates -12.8 momentary median, VV -15.5, ours -17).
12. **Music breaths:**
    - Let the VO stop for **4-7 s twice per 3 minutes** at reveals, with music and SFX up 4-6 dB in the gap. Our longest pause is 2.7 s.
    - Keep the other short TTS pauses ≤0.5 s, so the delivery doesn't feel stop-start (18-20 pauses per minute).
13. **SFX tied to motion:**
    - Every motion transition, callout pop and document-prop arrival gets a whoosh, riser or tick, 6-10 dB under the VO.
    - Hard cuts between gameplay moments use no SFX; let the game audio bleed through at -20 dB for texture, as DYKG does.
14. **One constant frame and grade for the whole video.** DYKG keeps a branded pillarbox and Magnates and fern keep one grade, while ours changes between bright cartoon footage (mean luma 68, saturation 30) and black-and-white Looming (mean luma 22, saturation 3). Add a shared grade or a frame (vignette, border, texture), so Flash games of very different looks read as one film.
15. **Pictogram scenes only when they carry an action** nobody filmed, built over 3-5 s with one element per sentence (VV). The single 3 s green pictogram at s013 2:02 is a token and should either be a full build or be removed.
