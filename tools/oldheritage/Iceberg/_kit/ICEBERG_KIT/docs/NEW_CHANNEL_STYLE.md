# NEW CHANNEL STYLE: algrow 2 ("ABYSS" identity)
Applies to the three algrow-2 videos: Disasters Vol 2, CCTV Vol 1 and CCTV Vol 2. Written 2026-10-25, PHASE 1, after the owner rejected v1.

This is a **new channel**. Nothing from the 404/Waterpark look is reused: no red family, no Varela/Nunito/Bebas, no title wall, no red look-here circles and no synthesized SFX.

Proven **motion measurements** from the studies are reused on purpose; the owner allowed this. Every device below names the reference it comes from (video + timecode) and how ours goes further.

Proof of the look:
- Style frames: `style_frames/sheet.jpg`, plus 12 stills at 1080p.
- Motion test: `style_frames/motion_test_phone.mp4` (25.0 s, 3.8 MB) and `motion_test_1080p.mp4`.

Code (library first, then synced to the project):
- `TemplateLibrary/src/templates/iceberg/` = family **IC**:
  - `IcebergChart_IC.tsx`, the chart;
  - `ic.ts`, the tokens, plate layout and name layout;
  - `rules_ic.ts`, the asserts;
  - `d2_levels.ts`, this video's data.
- `TemplateLibrary/src/templates/n2/n2.tsx` = family **N2** (channel devices).

## 1. The idea
The niche stays **disturbing**: dark, tense and premium.

- **The video sinks down one iceberg.** The chart is the channel's signature and its title. There is no separate title card or title wall.
- **Light becomes dark.** The sky and the tip are grey storm light. Below the surface the water goes light blue, then navy, then near-black abyss. Each level is literally deeper and darker.
- **One warm accent in a cold world:** *beacon amber*. It appears only where the viewer's eye must go: the active case marker, the caret, the sonar ping, the highlighter, the rule under a title.

## 2. Look
| token | value | use |
|---|---|---|
| ice | `#F2F8FB` | names, titles |
| frost | `#A9D8EC` | secondary labels (place line, roles, kicker) |
| surface | `#7FD3F2` | waterline glow, cold light |
| deep / abyss | `#0B3768` / `#020814` | water, map duotone, chart backdrop |
| **amber (the only accent)** | `#FFB23F` (`#E8952A` deep) | marker bar, caret, sonar ping, highlighter, rule |

The orange `#FF5A1F` and the 404 reds are deliberately **not** used: the orange was the rejected Dashcam "INSTRUMENT" look.

**Type** (variable fonts already on disk; no handwritten faces):
- **Archivo** at wdth 62 / wght 800, ExtraCondensed caps, for chart names, titles and dates. It is a condensed grotesk like the reference's Impact-class face, but cleaner and more premium.
- **Archivo** at wdth 100 / wght 560, tracked +0.28 em, for labels: level name, place line, roles.
- **JetBrains Mono** 500 for data only: the level/case kicker, coordinates, speaker tags.
- None of these is in the 404 style; all three were banned there, which keeps the two channels apart.

**Footage grade (`ColdGrade`):**
- saturation 0.80, contrast 1.07, brightness 0.96;
- teal-navy soft-light at 38 %;
- 6 % lifted shadows;
- a soft vignette at 0.42.

Footage always gets a **linear** push of +2.2 %/s (never eased). Pages and maps are not graded; they carry their own treatment.

**Texture:** marine-snow particles in screen space with camera parallax (chart only), plus the depth darkening baked into the plate. There is no grain, VHS, light leak or glitch-everything.

**Iceberg art (default plate):**
- **Source:** the Blender render from `Disasters2/art`: translucent ice, caustics and god rays. It is 100 % original, with no stock image and no watermark.
- **Adapter:** `TemplateLibrary/tools/plate_from_tall.py` turns the tall 1920×5400 render into a 4800×2700 16:9 chart plate. That gives 2.5× camera headroom, so dives never upscale.
- **Layout:** in `public/ic/berg_blender.json`, waterline at 13.1 %.
- **Fallback:** a procedural crystalline plate (`tools/iceberg_art.py`, layout `PLATE_PROC`).

## 3. Iceberg chart system (`IcebergChart_IC`, data-driven)
**Data:**
- `levels` = 7 levels, generated from `cases_map.json`;
- 24 cases, with old c01 dropped and Houston last in Level 7, per the HANDOFF owner decisions;
- `beats` = `reveal` | `level` | `case`.

**Layout:**
- 7 bands split by **metallic bars**. The first bar *is* the water surface, drawn as a glowing waterline.
- Names are single-line ExtraCondensed caps:
  - two columns either side of the berg's axis, rows staggered ±28 px;
  - an odd last name is centred;
  - the sky band's two names flank the tip at staggered heights, as in the owner's reference.
- A screen-space **depth gauge** (ticks 01–07 plus an amber pointer) appears only when the camera is zoomed.

| beat | what happens | timing (30 fps) | from |
|---|---|---|---|
| **reveal** (intro) | Camera starts close on the tip with the title lockup ("VIDEOS BEFORE / DISASTERS", amber rule, "VOLUME 2"). It pulls back to the full chart. Once the title has cleared, the bars draw out from the centre per level and the names rise in per level and per name. | tip hold 18 f, pull 96 f (EI.cam); title in 6 f, out 44 f; bars from 62 f, +8 f per level, 36 f each; names from 76 f, +9 f per level, +2.4 f per name, 21 f each | `refs/iceberg/ICEBERG_MOTION.md` §1 (bars 0.26 s/level × 1.2 s; items 0.30 s/level + 0.08 s, 0.7 s); owner reference image |
| **level N** | Camera **sinks** to band N (36 f) with **vertical motion blur from the real camera speed**. Other bands dim to 38 %. The "LEVEL / 01 / rule / CLOSE CALLS" lockup lands (scrim behind it), holds 34 f (1.13 s readable), then **flies through**: ×(1 + 2.2u²), blur 14u², fade, over 12 f. The camera lands +17 % on the band (ease-out, 27 f), and the band's names wake up. | 107 f minimum before the next beat | Abyssal Detective iceberg 0:36.55–0:39.50 (level text 1.17 s hold, 0.40 s zoom-through, background ×4 landing with ease-out by +0.9 s); ICEBERG_MOTION §1 (×(1 + 2.2u²) fly-through, 45 % dim) |
| **case** | An amber marker bar grows beside the name (12 f). The camera eases onto it (30 f). Then the **name lifts off its band** and becomes the case title: a screen-space twin from the exact same pixel position (EI.quick, 30 f). The chart defocuses 9 px and darkens 45 %, the slot keeps a 16 % ghost, the mono kicker "LEVEL 01 / CASE 01" lands, then an amber rule. Holds ≥ 2.3 s. The hand-off to footage is a DepthCut. | 127 f minimum (lift lands + 2.3 s hold); a case beat must be the last beat | Abyssal 3:35.65–3:41 (title 2.3–2.8 s hold); owner: "each level the camera descends… that band's case names highlight" |

**Better than the references:**
- Abyssal shows the chart **once**, static, and uses separate photo cards per level. ICEBERG_MOTION uses a flat photo with Courier text.
- Ours is one living chart: a real camera that sinks with motion blur, live type, a depth gauge and parallax particles.
- The **case title is the chart name itself lifting off the berg**, so every case start visibly comes out of the iceberg. No title card was invented.

## 4. Channel devices (`n2.tsx`; each asserts its own minimum length)
| device | look + motion | when | from (video @ timecode) | ours is better because |
|---|---|---|---|---|
| **DateType_N2** (date + place) | Left lockup: Archivo date 76 px; tracked place line in frost; mono coordinates. **Typed on the spoken words** (word timestamps), with a thin amber caret that blinks 0.5 s once typing is done. A soft corner shade gives contrast (no box). Fades 18 f. | Case start (series device) | Abyssal 0:42.62–0:45.03 (typed as spoken ≈18 char/s, cursor blink, 0.85 s fade) | Readable typographic lockup instead of a VCR gimmick; real coordinates add authority; it can span a cut (map → footage, as in the test) |
| **PageRise_N2** | Real page excerpt rises from below (39 f ease-out, scale 0.9→1), then drifts −0.2 % H/s. **Line focus**: the rest of the page is veiled. The amber highlighter wipes across the phrase while it is spoken. Background: the case footage, blurred and dark. | A report line the VO depends on, 4–8 s | Abyssal 19:50.6–20:00.4 (rise 1.3 s, marker with the words); VV cold cases 9:43 `page_slide_highlight_583.0.jpg` (line focus) | Combines both references; no browser chrome, no cursor; the page is never on flat black |
| **SonarMap_N2** | Public-domain NAIP / Sentinel-2 imagery in the channel's navy duotone. Log snap-zoom (24 f, EI.quick), then +1.2 %/s drift. The **pin is a sonar ping**: amber core plus 3 rings, one every 0.9 s. Place + coords on a hairline leader, no plate. | A precise place the footage doesn't show, 3–5 s | VV 8:05.6 `map_pin_485.6.jpg` (desaturated satellite + pin); DD1 E10 pin/leader | The ping belongs to the depth identity; there is no red dot or box |
| **RawSub_N2** | Archivo 48 px white with a deep shadow, centred bottom, per phrase with a 3 f fade. A mono amber speaker tag; "· TRANSLATED" when Whisper translated the line. Light bottom gradient, no box. | Every raw with real clip speech | Nocturn raw captions (`FINDINGS_nocturnA`), Abyssal §I11 | Cleaner than Abyssal's VCR-on-black-bars; translations are flagged honestly |
| **NameTag_N2** | An amber rule grows (10 f); the name slides out of it (EI.quick 14 f); the role in frost. 2.1–2.9 s total. | First mention of a key person only | VV 0:54.6 `name_typeon_54.6.jpg`; OWNER_TASTE name tag 2.1–2.9 s | No plate or box; one accent |
| **DepthCut_N2** (+ `DepthCutWrap`) | 14 f water-refraction ripple (feTurbulence displacement, peak on the cut) with a cold light lift. | Chart → footage, page → footage, section turns; ≤ 3/min. Hard cut is the default everywhere else. | Smoothness_Guide §5 exposure-flash spec (ramp, peak on the cut, decay); Abyssal glitch-tear role at clip entries | Same function as DD/Abyssal flashes and glitches, but in the channel's own material (water) |
| **Shot / ColdGrade** | Linear push +2.2 %/s, focus point, blurred cover fill for vertical clips (no black bars). | All footage | DD (linear push), Abyssal §I8 (blur fill) | |

**Not in this channel:**
- red look-here circles (owner: "useless");
- a title wall or "24 tiles";
- caption boxes, lower-third plates, headline strips;
- text on black;
- any text that restates the VO.

**Emphasis on footage** comes from the cut itself: a punch-in replay at 1×, or the chart marker. If a look-here is ever needed, it will be a cold vignette WatchZone, never a ring.

## 5. Transitions
| use | transition |
|---|---|
| default | **hard cut** |
| chart → first shot of a case | **DepthCut** |
| case end → chart | the next case beat on the chart |
| level changes | the **sink** |
| inside a case | hard cuts; at most 3 designed transitions per minute |
| page / map | enter on a cut; the device carries its own entry |

There are no crossfades between footage shots.

## 6. SFX palette: real recordings only
The kit is `Disasters2/sfx_n2/`, built by the SFX agent. Provenance and anchors are in `sfx_build.json`: Pixabay (catalogued source URLs in `WM_NEXT/remotion/public/wm/sfx2/catalog.json`), Mixkit (free licence), and one CC0 Freesound bed. Nothing is synthesized; layers are only trimmed, filtered and stacked.

Placement:
- `start = anchor frame − anchor_s × 30`;
- the files sit at −20 LUFS-M;
- the motion-test volumes below were set by ear against the VO and land at −16 LUFS integrated / −1.4 dBTP.

| event | file (anchor) | volume |
|---|---|---|
| chart reveal / title | `title_hit_02` (0.24 s) on the title landing | 0.42 |
| chart bed | `bed_underwater_01` loop, only while the chart is on screen; out with the DepthCut | 0.22 |
| level sink | `dive_01` (1.45 s) anchored on the camera's arrival | 0.62 |
| level fly-through | `case_lift_02` (0.05 s) on the fly-through start (Abyssal: low boom ≈0.5 s after the zoom starts) | 0.50 |
| name lift | `dissolve_01` air woosh (0.64 s) peaking mid-lift | 0.42 |
| DepthCut | `pre_swell_02` (0.99 s) ending dead on the cut | 0.40 |
| map | `whoosh_03` on the snap, `sub_pulse_01` on the ping landing | 0.30 / 0.38 |

Silent on purpose: typing, name tags, subtitles and highlighter wipes. The references keep these inaudible (Abyssal §G-d).

## 7. Text rules (in code where possible)
**Text that may appear on screen:**
- the chart (names, level lockup);
- the case title lifted from the chart;
- date/place typed on the spoken words;
- a name tag at a key person's first mention;
- real page highlights;
- raw subtitles;
- a number only when it matters.

**Limits:**
- At most one designed text element per 20 s outside the series devices.
- NEVER text that restates the VO. NO red circles.
- `rules_ic.ts` `assertN2` / `assertIC` throw at render if a device is shorter than entry + readable hold + exit, or longer than its maximum. The style-frame render caught a 2.8 s name tag (needs ≥ 89 f) on the first pass.

## 8. Pacing
- **Footage-led.** Footage plays under the VO.
- **Raws:** 2–8 s, only where the real sound is the moment (owner).
- **VO gaps are cut.** The chart beats play UNDER the narration, never in silent slots:
  - reveal under "Twenty four more videos, seven levels down…";
  - level under the level line;
  - case under the first case sentence.
  The only non-VO picture time is the raws.
- **Devices:** at most 1 per 10–15 s; ≥ 3 s of footage between them; entries ≥ 10 f, hold ≥ 3 s (pages 4–8 s, maps 3–5 s).
- The tight timeline and clip picks are being built by the timeline agent (`picks/CLIP_PICKS.md`, `vo/timeline_tight.json`).

## 9. Motion test (what the owner sees)
`style_frames/motion_test_phone.mp4`, 25.0 s, cut from the real final VO on word edges:

| time | what happens |
|---|---|
| 0.0 | Tip + title |
| 0.5 | "Twenty four more videos, seven levels down." The chart builds. |
| 3.95 | "Every level after that sits a little deeper." Full chart. |
| 6.3 | Level 1 sink + LEVEL 01 lockup, under "Everyone in this first level walked away". |
| 9.9 | Case 1 marked; its name lifts into the title, under "A dashcam is rolling…". |
| 14.1 | DepthCut into the dashcam on "there's a small white shape in the sky". |
| 17.8 | Sonar map of Cobb Parkway while the place types. |
| 21.3 | Back on the dashcam; the date types on "Thursday the 7th of April 2022". |

VO sync was checked by cross-correlation at 3 points: a constant 5 ms (AAC priming).

## 10. Open for the owner
1. **Iceberg art:**
   - The berg is widened ×1.75 to fill the 16:9 chart like the reference.
   - The tall Blender render could instead drive a *vertical-scroll* chart (no full 16:9 view).
   - The 16:9 version was chosen because the owner's reference shows the whole chart at once.
2. **Chart names:** the cut-sheet titles ("THE PLANE IN THE MEDIAN"…), in the reference's style. They could be shorter if the owner prefers.
3. **Style-frame footage:** frame 12 (name tag) uses the 11Alive aerial, station b-roll that is still an open owner decision. It is for the look only.
