# GX-ADmixDD: BUILD SPEC (Remotion, 1920x1080, 30 fps)   status: PILOT 2026-11-14
> 2026-11-16: engine is now HyperFrames at `hf-engine/` (media in `hf-engine/media`); the Remotion `engine/` was removed (source archive in `Videos\CLAUDE\LEARNINGS`). Remotion names below = the original spec, ported 1:1.

Source of every number: CHANNEL_PROFILE.md (ref + timecode). f = frame at 30 fps, counted from the device start. H = 1080 px, W = 1920 px. "%H" = share of frame height.
Global rules: every move eased with a fast start and long settle; no springs, no bounce (SOP §7.6). Text lands on its word -0.3..+0.15 s (DDV median -0.2 s; ADD tags 0-0.3 s early). Designed plates never open empty (first element ≤ 8 f). Fonts loaded (`@remotion/google-fonts`) before any text measure.

## 1. Colour tokens
| token | hex | role |
|---|---|---|
| cyan | #45FDFC | title face, look-here rings, map pin + leader, glitch fringe |
| cyanRim | #BAFEFF | title inner rim / 1 px stroke |
| cyanGlow | rgba(69,253,252,0.60) | title glow (0 0 14px), ring glow |
| titleWhite | #F2F6FF | title 2nd tone (ADC two-tone variant), video title line 1 |
| label | #E8E8E8 | place label, date, HUD text |
| labelShadow | rgba(0,0,0,0.75) | 0 2px 3px under labels/subtitles |
| tagOrange | #FB9404 | name-tag box, map label box, callout label box |
| tagInk | #111111 | text on orange |
| cursor | #A51F20 | typed-date cursor block only |
| marker | #FFE600 | page highlight bar (multiply) |
| danger | #FF0A0A | red-mono flash / threshold red channel, never on people |
| black | #050607 | dips, card base (not pure 0: p1 luma 4-5) |
| bergTeal | #0E3A44 | fallback underwater tint for berg grade |
| subWhite | #F2F2F2 | raw subtitles |

## 2. Fonts (Google Fonts; closest matches to ref crops, by eye)
| role | family | weight / axes | size (font-size, %H) | target cap height | tracking | case |
|---|---|---|---|---|---|---|
| case number "No. 20" | Special Elite | 400 | 20.0% (216 px) | 14% H (ADI cap 14%) | +0.04em | mixed |
| case title | Archivo | wght 800, wdth 125 | 7.6% (82 px), shrink to fit ≤ 80% W, min 4.8% (52 px) | 5.4% H (ADD) | +0.12em | CAPS |
| video title (2 lines) | Archivo | wght 800, wdth 125 | 9.2% (99 px) | 6.5% H | +0.10em | CAPS, line gap 1.1 |
| place label (2 lines) | VT323 | 400 | 5.9% (64 px) | 3.5% H (ADD) | +0.06em | CAPS, line 2 in parentheses |
| date typed | VT323 | 400 | 11.0% (119 px) | 6.5% H (ADD 6-7%) | +0.08em | CAPS |
| name tag | Courier Prime | 700 | 4.4% (48 px) | ~2.8% H | +0.02em | Title Case |
| callout / map label | Courier Prime | 700 | 4.8% (52 px) map, 3.6% (39 px) footage callout | 4.0% / 2.9% H (DDT) | +0.08em | CAPS |
| raw subtitles | IBM Plex Mono | 500 | 3.7% (40 px) | ~2.6% H | 0 | sentence case |
Tune font-size so the measured cap height hits the target (cap ratios differ per face).

## 3. Easing tokens (CSS cubic-bezier, use with Remotion `Easing.bezier`)
| name | value | used for |
|---|---|---|
| settle | (0.16, 1, 0.30, 1) | graphics landing, tag grow, map pull-out |
| fadeUp | (0.30, 0.60, 0.40, 1) | berg fade from black (ADD: near-linear then plateau) |
| drift | (0.22, 1, 0.36, 1) | number rising 1.5% H (ADC G3) |
| dive | (0.50, 0, 0.20, 1) | push into berg 9 f (ADI ease-in-out, made asymmetric for SOP) |
| exitIn | (0.55, 0, 1, 0.45) | accelerating exits (number drop, page→footage dissolve ADC Ex1) |
| enterOut | (0, 0.55, 0.45, 1) | footage→page dissolve (ADC Ex2) |
| leader | (0.40, 0, 0.20, 1) | leader-line draw 16 f (DDT ease-in-out) |
| linear | linear | footage/photo/page pushes, wipes, marker sweep body |

## 4. Push tokens (linear unless said)
footage +1.2 %/s (pull-out variant -1.1 %/s, 1 in 6 shots) | photo/inset +0.4 %/s | page: pop +9% over 45 f `settle`, then +0.4 %/s | berg card +3.5 %/s | map hold +0.8 %/s.

## 5. Devices (recipes)

### D1. Case card "No. N" + title (adapted ADD case card + ADI level card)
| stage | frames | what | easing | SFX |
|---|---|---|---|---|
| 0 | f0 | hard cut from footage to `black` | cut | bed starts linear-dB fade -9 dB/s for 60 f (ADD G4) |
| 1 | f0-f35 | black hold 1.2 s | n/a | bed only, falling; VO silent |
| 2 | f36-f51 | berg still fades 0→1 (depth frame by rank, §6) + push starts +3.5 %/s | fadeUp | none |
| 3 | f36-f40 | "No. 20" (Special Elite, white #F2F2F2, shadow 0 3px 6px #000a) opacity 0→1, centre x 50%, y 51% | linear | sub hit on f36, peak ≤ VO -12 LU |
| 4 | f40-f61 | number drifts up 1.5% H, holds to f66 | drift | VO "Number twenty" starts f47 |
| 5 | f66-f75 | dive: berg scale 1.0→1.6 toward the depth target; number scale 1.0→1.5, opacity 1→0, motion blur 8 samples | dive / exitIn | MID whoosh 0.3 s at f64, bed dips -16 dB (ADI G2) |
| 6 | f77-f85 | title glyph-scramble decode: each letter cycles random A-Z0-9 for 3-5 f, settles left→right; scale 1.04→1.00; RGB fringe 3 px→1 px | linear (decode), settle (scale) | HF tick at f77 |
| 7 | f85-f142 | title hold 1.9 s, berg keeps +3.5 %/s; title cap 5.4% H at y 44% | linear | VO title words start f92 |
| 8 | f142-f148 | burst (D10a): 7 f threshold slab | n/a | HF digital burst 0.2 s on f142 |
| 9 | f149 | hard cut to first clip; bed back at pre-card -6 dB | cut | VO first story word f150 |
Title variants: A = all cyan (ADD); B = white + last word cyan (ADC t0034). Max 2-3 words per title.

### D2. Video title + dive (intro ~22-26 s)
f0 hard cut from the last teaser shot to the full berg (waterline at 45% H), berg +3.5 %/s. f4-f16 line 1 "20 MOST DISTURBING" (titleWhite) scramble decode (D1 stage 6 logic), f10-f22 line 2 "DASHCAM MOMENTS" (cyan) decode; centre y 40% / 49%. Hold to f96 (2.5 s after line 2). f96-f120 dive: camera tilts down through the waterline, scale 1.0→2.2, `dive`, title rides up and out with 10-sample motion blur. f120 cut to black → D1 for #20 starting at its stage 1 (black only 24 f here). SFX: whoosh into f0, sub sting (tier start) on f4, underwater muffle sweep f96-f120. VO reads the title over line 1.

### D3. Place label (ADD 2:28, t0149)
Bottom-left, x 3% W, baseline line 2 at y 90% H, 2 lines ("TULLAMARINE FREEWAY" / "(AUSTRALIA)"), VT323 label colour, 2 px RGB fringe (R -1 px, B +1 px).
f0-f6 pop: opacity 0→1 + 2 frames of horizontal scan jitter (±6 px) | f6-f36 type-crawl: last 3-5 chars appear 1 per 6 f | hold to f57 (1.9 s total) | f57-f62 fade 1→0 linear. Lands 0-0.3 s before the place word (ADD +0.02 s). SFX: none.

### D4. Typed date (ADD 7:50, t0470)
Centre x 50%, y 50%, VT323 6.5% H cap, label colour. One char per 3 f (0.1 s/letter); cursor block = `cursor` red rectangle 0.62em × 0.95em right of the last typed char, blinks off/on every 8 f after typing ends. Hold 45 f after the last char. Exit: 15 f blur 0→12 px + opacity 1→0, `exitIn`. Start 0.2 s before the VO date word. SFX: none (SOP labels silent).

### D5. Name tag (ADD 2:23, t0144; public/official people only)
Box `tagOrange`, height 7% H, padding 0 0.9em, bottom centre y 86-93% H, ragged edge: 2 px noise displacement on the box border; text Courier Prime 700 `tagInk`; drop shadow 0 4px 10px #0009.
f0-f16 grow: scaleX 0.2→1 + opacity 0→1, `settle` (fast first 6 f) | hold 75 f (2.5 s) | f91-f98 out: scale 1→0.9 + opacity →0, `exitIn`. In 0.3 s before the name word. SFX: none.

### D6. Raw subtitles
IBM Plex Mono 500, subWhite, shadow labelShadow + 0 0 2px #000, no box, centred, baseline y 92% H, max width 70% W, max 2 lines. Cut on/off with the speech (cue 0.1 s before the first syllable, hold to 0.2 s after); never split mid-phrase; translated lines ≥ 3.5 s. Swears: muted in audio and written "[ — ]".

### D7. Censorship
D7a mosaic (bodies/injuries): cells 40 px square (2.1% W), cell colour = average of source, hard edges, tracked per frame (keyframes ≤ 5 f apart), extends 10% past the subject box. On pages/plates: 24 px.
D7b face blur: Gaussian σ 18 px inside a tracked ellipse, edge feather 20% of ellipse width. Starts on the first frame the face is in shot, follows into replays and insets. No SFX.

### D8. Replay / freeze looks (ADD)
D8a threshold replay (ADD 27:10, t1630): luma threshold at 0.45 with a 3-step posterise: black / danger red / #FFF6D0 hot; only on vehicles, fire or objects (no people). Hard cut in, 2-4 s, hard cut out.
D8b B&W freeze (ADD 7:46): exact source frame, saturation 0, contrast +15%, push +1.5 %/s, hold 2-3 s; in by hard cut, out by 13 f dissolve.
D8c cyan duotone (our twist of ADD 2:20 red duotone, t0610): shadows #041A1E, highlights #45FDFC at 70% mix; hard cut in on the first word of the sentence, hold 3-5 s, exit 13 f dissolve `exitIn` (ADD 0.43 s).
SFX: freeze silent; D8a/D8c none (clip sound continues or bed).

### D9. Look-here
D9a spotlight (ADI 6:10, t0730): frame darkened to 10% luma (multiply #1A1A1A) except a soft circle radius 20% H, feather 35% of radius, tracking the subject; in 12 f `settle`, hold 3-10 s, out 12 f.
D9b solarize spot (ADD 4:43, t0290): 12 f cross-dissolve into a frozen frame where an ellipse (w 30% W) is solarized (invert luma above 0.5, map to cyan #45FDFC / #0A2BFF / #FFE600 three-tone); ellipse shrinks 9% over the hold (6-10 s, linear); hard cut out, next shot fades up 10 f.
D9c ring (DDV 0:41 timing, our look): ellipse stroke 5 px `cyan` + glow 10 px cyanGlow, draws on 6 f (stroke-dashoffset, `settle`) starting 0.2 s before the word, tracks the subject, grows 6% over 1.5-3 s, fades 6 f.
All silent.

### D10. Glitch burst
D10a card burst (ADD 2:10.27, t0130_burst): 7 f. f0-f1 horizontal slab bands (4-6 bands, 6-14% H tall, offset ±4-12% W), lower half blown to #FFFFFF, upper half black with scan-curl dither; cyan/blue fringe 6 px; f2-f3 title still ghosts through at 40%; f4-f6 thresholded white/black wave texture; f7 hard cut to clip.
D10b tape cut (ADC 22:14.67, 11 f): f0 dark frame with clipped colour strips; f1-f9 RGB-split (R +10 px, B -10 px) horizontal tearing with the old shot ghosted in the dark half; f10 one inverted-colour frame; next shot clean. Must sit inside a 0.6-1.1 s VO gap.
SFX: HF digital burst 0.15-0.25 s, peak ≤ VO -6 LU.

### D11. Dip to black
Before each case card: hard cut to `black` (no fade out), 36 f (D1). Before the title: 24 f. Inside cases no dips (ADD uses dissolves). Bed never < -50 dB (SOP: bed never dies), VO silent ≥ 1.6 s around the dip (ADI 1.6-2.4).

### D12. Map dive + callout cascade (DDT Map B 12:50, restyled)
Plate: NAIP/Sentinel-2 crop, graded sat 0.20, teal shadows, vignette 0.54. Pin = cyan dot 1.3% H with 8 px glow; route (optional) = 4 px cyan line drawn at 30% W/s.
| stage | frames | what | easing | SFX |
|---|---|---|---|---|
| 0 | f0 | hard cut in on the place sentence (+0.1 s after the word, DDT) at scale 1.43 (tight on target) | cut | none (SOP maps silent) |
| 1 | f0-f84 | pull-out 1.43→1.00 (DDT 1.00→0.70 expressed inverse), pin already on | settle | none |
| 2 | f84-f96 | leader line 3 px (0.3% H) cyan from pin to label anchor, 4 f draw | leader | none |
| 3 | f88-f93 | label box `tagOrange` + Courier Prime 700 caps (cap 4% H) wipes L→R 5 f | linear | none |
| 4 | f91-f96 | optional photo card (public place/vehicle only, no private faces): 1.2% H cyan outline, wipes L→R 5 f | linear | none |
| 5 | f94-f142 | map behind: blur 0→4 px + dim to corner/centre 0.42 | settle | none |
| 6 | f96-end | hold with +0.8 %/s push; total 6-8 s; hard cut out on the next sentence | linear | none |
Variant B: annotated aerial (ADD 36:10, t2170): white boxes with #111 Courier Prime labels and 2 px white arrows, each drawing in 8 f (`leader`), N arrow top-right.

### D13. Page highlight (DDT P1-P4 mechanics, ADD/ADC look)
Real screenshot at 2×, white paper, page column 50-60% W. f0 hard cut in with 1 flash frame (luma 252, ADD 3:27); f1-f45 pop +9% `settle` then +0.4 %/s. Surrounding paragraphs blurred 6 px (ADC), key paragraph sharp. Marker = flat `marker` rect, mix-blend-mode multiply, height = text line height (≥ 36 px, 4.0-4.3% H), no outline, no rounding; starts 0.4 s before the first read word, grows L→R at 0.15 W/s (DDT 0.14-0.19) linear, last 20 f `settle`; next line starts when the VO reaches it (ADC 1.3-3 s apart). Hold 4-8 s total; exit hard cut (white page) or 15 f `exitIn` dissolve (dark page). Blur private names/plates (D7a 24 px). Silent.

### D14. Callout + leader on footage/photo (DDT TUMOR 18:00)
Target dot cyan 1% H on the object (no people). f0-f16 leader 3 px cyan from dot up-left/right, `leader`; f16-f26 label `tagOrange` box 3.9% H with Courier Prime 700 caps cap 2.9% H, wipes L→R linear; group is parented to the shot (rides its push); hold 3-4 s; out 6 f fade. Lands after the VO names the object (DDT). Silent.

### D15. Framing helpers
D15a pillarbox blur-fill (ADI 0:07, t0007): vertical clip centred at native 32% W (or cropped to 53% W); sides = same clip blur 40 px + horizontal motion smear 40 px + brightness 0.45 + sat 1.2, sides drift ±2% W over 6 s. Never black bars (SOP).
D15b 3-panel split lens (ADD 19:10, t1150): centre panel = 4:3 clip, side panels = stretched edges dimmed to 0.35, 6 px black gutters.
D15c inset over self-blur (ADI 11:50): photo at 58% W with shadow 0 12px 40px #000c over its own blur (σ 30) tinted bergTeal 30%; +0.4 %/s.

### D16. Intro teaser (0-~22 s)
VO from f0. 0-10 s: 4-5 shots, 1.8-2.6 s each (ADI median 2.1 s), hard cuts, footage +1.2 %/s; no text. 10-22 s: 4-6 shots 1.5-3 s, max 2 in a look preset (D8a 0.5-0.7 s red-mono flash only on non-human shots, D9b solarize); one riser 1.5 s into the title cut (ADI 0:23.1 only riser in the film). No raw audio; bed at VO -14 LU. Last shot = strongest non-human peak.

### D17. Outro
Final VO over #1's aftermath, then cut to the berg skull-base frame, 3.5 s pull-up to the full berg (`settle`), then end-screen hold 20 s with +0.4 %/s drift, bed continuous, fade bed only in the last 2 s.

## 6. Berg depth frames (one berg still, 3840 px tall source recommended)
Card for rank n uses a crop whose centre y = lerp(tipY, baseY, (20 - n) / 19). #20-#14 crop above the waterline (sky + tip), #13-#8 crosses the waterline, #7-#1 underwater (dark skull base, extra grade: sat 0.35, luma mean 40-48 like ADD G1). D1 stage 5 dives toward the next deeper point (+4% of berg height).

## 7. Audio tokens
VO = reference 0 LU (Algrow take, uncompressed). Bed under VO -14 LU; under raws -17 LU; in dips -18 LU (never < -50 dB for ≥ 1.2 s). Raws VO -2..-4 LU, J-cut in at -10 dB under the VO end, 3-5 ms fades, raw end fade 0.15 s, next VO 0.5-0.8 s later. SFX peaks ≤ VO -6 LU (bursts) and ≤ VO -12 LU (low hits on "Number N"). Master -16 LUFS, ≤ -1.5 dBTP.
