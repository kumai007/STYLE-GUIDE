# Disturbing Dose: case transition and detailing, measured (13 Nov 2026)

Sources (analysis only, never reused): `DxMyGcJR3LM` "8 Most Horrific Natural Disasters Caught on Dashcam" (720p 29.97, the owner's
screenshot comes from this one), `hBTZymP65sM` / `l6mSfWFmcOo` / `FhCTG3hAvIQ` "20 Most Disturbing Dashcam Moments" Vol. 3/2/1,
`4p5RF9Ux53k` (caving), `1MRO0jCGvl0` (Texas Tower). Times are mm:ss.ss in the source. Pixel numbers are at 1280×720 with the
1080p equivalent in brackets. Key frames are in `frames/`.

## 1. The case transition (the "glitch → big red number" change)

Measured frame by frame on DxMyGcJR3LM 1:10.37 (case 1 → case 2, wildfire → Tainan tornado). Cases 3–8 checked against it
(2:32.9, 5:49.8, 7:22, 9:41, 10:33).

| t from glitch start | frames @29.97 | what happens |
| --- | --- | --- |
| 0.000–0.067 | 2 | **Outgoing frame breaks up.** Datamosh on the last fire frame: 8–16 px [12–24] macroblocks smear, block rows slide sideways and the truck is duplicated 2–3 times horizontally (echo), a few flat/pixelated blocks. Frame diff jumps 18.6 (normal 2–7). `frames/T2_01_datamosh_outgoing.png` |
| 0.067 | 1 | **Hard cut** to the incoming footage (frame diff 63). Saturation drops from 54 to 7 on our 0–255 max–min measure (the tornado clip is grey anyway; colour clips like case 7's jungle keep ~60–70 % of their colour). |
| 0.067–0.30 | 6–7 | **Incoming footage through the mosh.** Old-picture blocks dragged along the new motion, horizontal block-row streaks, fine 8×8 "DCT dot" texture inside blocks, grey/white flat blocks. Mostly resolved after 6 frames, completely by 8. `T2_02_datamosh_incoming.png` |
| 0.13–0.50 | 9–11 | **The number assembles through the blocks**: first visible 0.13 s after the glitch start as scattered semi-transparent red blocks and sliced pieces, 35 % → 100 % opacity, the red bloom comes up with it. Solid and sharp at 0.43–0.50 s. `T2_03_number_block_reveal.png`, `T2_04_number_resolving.png` |
| 0.50–1.77 | 38 | **Hold**, rock steady (centroid moves < 1 px), footage runs underneath at normal speed. `T2_05_number_hold.png` |
| 1.77–2.10 | 10 | **Out**: opacity eases down to ~35 % (red mask pixel count 8 700 → 340 in 10 frames). |
| 2.10–2.40 | 9 | a pale pink ghost lingers and fades to 0, bloom with it. `T2_06_number_fade_out.png` |
| ~2.9 | | the white location / date line types on ("Tainan City, **Taiwan**", "August 10, **2020**": white bold sans, last word red). |

Total: glitch 0.30 s, number on screen ≈ 2.25 s, transition to clean footage ≈ 2.4 s. The VO is silent through it (0.3–0.7 s gap
before the cut, restarts 0.1–0.15 s after it with the place / date).

**The number**
- Font: rounded geometric bold sans (Arial Rounded MT Bold / VAG Rounded class: round terminals, even stroke). Weight: bold/black.
- Size: glyph height 145 px of 720 [218 of 1080] = **20 % of frame height**; the "2" is 108 px [162] wide.
- Position, centre layout (cases 2, 5, 7): glyph box x 600–707, y 265–409 → centre **(655, 340) [(982, 510)] = 51 % / 47 %**,
  a touch right of and above centre. Corner layout (cases 3, 4, 6, 8): top-right, centre ≈ (1074, 171) [(1611, 256)], same size,
  with the red bloom pushed out of the top-right corner like a light leak and the date line starting at once
  (`T3_corner_number_with_date.png`; that case also has a picture-in-picture of the cabin cam bottom-right).
- Colour: face pure red RGB (255, 20–30, 20–30); max red pixels (255, 109, 119) on the highlight rim.
- Gloss/bevel: soft, not chrome: a lighter rim on the upper-left edges, a slightly darker inner edge lower-right, a soft dark drop
  shadow (~4–7 px [6–10] down-right) and a red outer glow. Reads as a glossy sticker, not as 3-D extruded type.
- Glow / bloom: a broad red screen-blend bloom round the number, roughly a 350×300 px [520×450] ellipse, that tints the footage
  pink-red (dark trees go dark red, grey sky pink). Footage under it: slightly desaturated, vignette, fine grain, chromatic fringe
  at the frame edges.
- No scale or position animation; it builds in through the glitch and fades out in place.
- The skull logo bug bottom-right is his channel mark (not copied).

**Sound** (Demucs split of 6 s round the cuts at 1:10.37 and 2:32.85)
- On the cut: a short **sub hit**: drums stem jumps from −45 to −22 dB, 89 % of its energy at 20–120 Hz, ~0.25 s then decays,
  plus a little digital crackle (8–16 kHz).
- Music bed (bass stem) changes at the case: at 2:32.85 the old bed's bass falls from −35 to −70 dB within 0.1 s (new track).
- VO: silent 0.3–0.7 s before the cut, back 0.1–0.15 s after it (reads the place/date). The raw's own sound (wind) starts on the cut.

**Other transitions in his videos (not the owner's pick):** Vol. 1 uses a fast zoom-blur into the next case with the number
centred; Vol. 3 opens cases from a red 3-D tile wall of numbered thumbnails (camera flies to the tile, it fills the frame, number
top-right). Inside cases: white light-leak flashes and short datamosh hits between the article page and footage.

## 2. Detailing during the stories

Measured on DxMyGcJR3LM case 2 (1:10–2:33, 83 s), hBTZymP65sM case 2 (0:46–1:37) and samples of the others.

- **Footage is the case.** Case 2: ~60 of 83 s is the dashcam itself, played long (the tornado approach runs ~25 s nearly uncut),
  then a replay of the key moment. Shots change every 2–4 s only inside page/photo stretches.
- **Place/date line** right after the number: white heavy sans (Inter/Helvetica Bold class), ~28 px [42] tall, centred lower
  third, typed word by word, the last word (country / year) in red. ~2.5 s.
- **Callouts on footage:**
  - red curved arc / circle drawn on with a stroke-on round the subject (Vol. 3 1:12, the car about to drop) `D_red_circle.png`
  - a long thin red arrow sliding in from the frame edge to the object (case 2 2:00–2:04) `D_red_arrow.png`
  - tiny red tick marks / pointers on distant objects (case 2 1:14–1:17, debris flying)
  - red-box name tags on people ("Brooke.P", 2:35+), white text on red, small
- **Freeze/zoom/replay:** the hit moment is replayed (slow, pushed in) after the real-time run; crops into the dashcam picture with
  slight blur round the edge; picture-in-picture for a second camera.
- **Captions on key facts:** white bold sans with the key phrase in red ("Officials stated that **the woman** sustained no serious
  injuries....") bottom centre over the footage `D_caption_redword.png`.
- **Screenshots:** real article pages in dark mode or paper-white, tilted slightly in 3-D, slow scroll/push, depth-of-field blur at
  the top/bottom, the quoted words get a **red highlight box that wipes on word by word** with a glow `D_article_highlight.png`;
  chromatic aberration on the edges; entered/exited with a datamosh hit or a white flash.
- **Explaining:** the VO sets up what to watch ("keep your eye on…"), the raw plays with its own sound, then he comes back with the
  outcome (injuries, damage figures) shown as a highlighted article line or a red-word caption.
- **Rhythm:** VO ↔ raw alternation every ~10–25 s; raws with their real sound at the incident; VO never over the climax sound.
- **Music:** dark ambient/cinematic bed, bass-heavy, continuous under VO and raws, changes per case.
- **Grade:** footage lightly desaturated, cool/neutral, strong vignette, fine grain, slight edge chromatic aberration; the only
  saturated colour is the red graphics.

## 3. What we built from this (Iceberg channel, our own design, no logo/footage copied)
`_engine/src/dev/CaseNumberTransition.tsx` (+ `entries/CaseT.tsx`), assets `_engine/public/case_t/`, per-case clips by
`_tools/make_transitions.py <DC|IN>`, inserted by `_tools/assemble.sh`. Demo: `_ref/CaseTransition_demo.mp4`.
