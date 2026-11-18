# REVERSE ENGINEERING: iceberg format (Abyssal Detective) → algrow-2 channel

**Scope.** This document is iceberg-only, as the owner asked on 2026-10-25. Farrell, Nocturn and VV were not re-measured; their existing specs are reused (see the last section).

**Sources measured:**
- `refs/abyssal/3PY5gA_hqMI` (CCTV Iceberg Vol 4, 1080p60, 48:33);
- `refs/abyssal/6V85EMFPrmY` (Explosion Disasters Iceberg, 55:31);
- the earlier full study `Waterpark/study/abyssal_chinese_iceberg/STUDY.md` (Chinese Incidents, 74 min).

**Sheets:** `Disasters2/refs/abyssal_v4/`:
- `intro_2fps`, `ex_intro_2fps`;
- `chart_10fps`, `level_10fps`, `v4_L2_10fps`;
- `ov_15s` (one frame every 15 s, whole video);
- full-res `f_13.5.jpg` (chart) and `f_34.6.jpg` (entry title).

Our build is `remotion/src/d2/Main2.tsx` with the plan in `plan_v2.ts`. The templates are `TemplateLibrary/src/templates/iceberg` and `templates/n2`.

## 1. The chart (V4 0:12.0–15.0 · Explosion 0:15.5–17.5 · Chinese 0:13.1–16.3)

**Measured in Abyssal:**
- **When it appears:** shown **once**, in the intro, on the first narrated line ("26 incidents, 7 levels"). In both new videos the 15-s overview never shows the chart again.
- **Entry and exit:**
  - Entry is a 0.1 s horizontal tear.
  - It is **static** for 2.0–3.2 s.
  - It leaves on a 0.4 s tear or dissolve into footage.
- **Layout:**
  - 7 bands.
  - Full-width **white bars ≈12 px** at y .13 / .27 / .42 / .565 / .715 / .85. The second bar sits on the waterline.
  - The berg photo fills the frame: the tip sits in band 1 and the water darkens to black by band 5.
- **Names:**
  - Courier-Prime-Bold-class slab mono, white with a dark soft shadow, cap ≈ .024 H (26 px).
  - Two columns centred at about x .40 and x .63, with rows at about 30 % and 70 % of each band and left/right staggered. There are 3–4 names per band.
  - **About half are pixelated or blurred** as a teaser.

**Ours:** `PLATE_CHART` + `IcebergChart_IC`.
- **Plate (no stretching):**
  - The Blender berg is **re-rendered for 16:9** (`art/src/build_iceberg.py --chart`, `comp.py --chart`) at 3840×2160, so the ×2 pushes stay sharp.
  - The body geometry was made shorter and wider rather than squashing the image, so the facets keep their true scale.
  - The berg spans x .26–.71, with the keel at y .95. It is the hero; v1 was 1.75× squashed and dim.
- **Bars:** at .165 / .30 (waterline) / .44 / .58 / .72 / .86, metallic, 11 px (owner reference).
- **Names:**
  - Archivo ExtraCondensed 800 caps at **58 px** (cap ≈ 41 px, 1.6× Abyssal; the owner asked for large names).
  - Columns at x .29 / .71 with the row stagger. A long name auto-shrinks so it never overlaps or runs off.
  - Levels 4–7 are **frosted** (blur 7 px), our version of Abyssal's pixelation.
- **Other bands:** dimmed to about 60 % only, so the berg is never hidden.
- **Adapted:** we hard-cut in through the channel ripple (DepthCut) and **build** the chart in 1.4 s. Bars draw out from the centre at a 3 f stagger, and the names rise 12 f per level at a 4 f stagger.
- **Iceberg idea:** on "every level after that sits a little deeper" (37.6 s) the camera **glides down** (EI.cam, 2.2 s, ×1.16). This is the owner's "the video travels down it".

## 2. Level descent (V4 L1 0:30.0–33.3, L2 8:26.9–8:30.4; Chinese E1)

**Measured in Abyssal, step by step:**

| step | time | what happens |
|---|---|---|
| 1 | from footage | **hard cut to black 1.0 s**, with digital silence |
| 2 | 0.5 s | **fade-up** onto the skull-berg photo with "Level N" (Courier bold, white, cap ≈ .10 H, x .07–.93) |
| 3 | 1.0–1.17 s | **hold**, with a handheld drift of 8–29 px/s |
| 4 | 0.3–0.4 s | **zoom-through**: the text scales ×(1 + 2.2u²) with blur and fade, while the background cross-zooms into the snow cap |
| 5 | ≈ 0.9 s | **landing**, ease-out |

**Sound:** the LF boom swells from +0.2 s and peaks +0.5 s after the zoom starts (+3.2 dB re VO).

**Ours (the LEVEL beat):** the same clock, but **on our chart**, so the descent is literal.

| step | Abyssal | ours |
|---|---|---|
| move | black 1.0 s + fade-up 0.5 s | the camera **sinks** to band N (36 f, EI.cam) with vertical motion blur from its real velocity |
| text | "Level N" | the "LEVEL / 01 / CLOSE CALLS" lockup fades in 14 f |
| hold | 1.0–1.17 s | 34 f (1.13 s) |
| zoom-through | 0.3–0.4 s | 12 f, ×(1 + 2.2u²) |
| landing | ≈ 0.9 s ease-out | ease-out 27 f, ×1.3, **capped so every name of the band stays inside the frame with a 6 % margin**; the band's names wake |
| boom | LF boom, peak +0.5 s after the zoom starts | `sfx_n2/dive_01` (anchor = descent start, −5.0 dB file gain = +3.2 re VO) |
| glide | — | `dissolve_01` on the fly-through, at −33 dB |

**Asserts:** `rules_ic.BEAT_MIN.level` = 107 f.

## 3. Entry / case title (V4 0:33.3 "A REGULAR NIGHT OUT", 8:30.9 "THE 20-SECOND FAILURE", 18:15 "THE CONFRONTATION")

**Measured in Abyssal:**
- **Look:** the title builds from shards in about 0.3 s on a snow-cap crop. Extended bold sans caps, **cyan #7FE8F5 with glow**, 2 lines centred at y .31–.47, cap ≈ .07 H.
- **Hold and exit:** holds **2.5–2.9 s**. Exit is a 3–5 f glitch tear; on plain entries it is a 9 f block glitch plus a **7 f white flash** (luma 94 → 192) into the first story shot.
- **Number:** none on screen.

**Ours (the CASE beat):** the name is taken **off the chart itself**, which is the owner's "case-name lift".
- The band name is marked (amber bar, 12 f). The camera eases onto it (30 f, ≤ ×1.6). The name **lifts** to the centre title (EI.quick 30 f, up to 128 px) while the chart defocuses 9 px and dims 45 %.
- Then the kicker "LEVEL 01 / CASE 01" (mono) and the amber rule land.
- It holds ≥ 2.3 s (BEAT_MIN.case 127 f).
- Exit is a **7 f cold-white flash** (#E8F8FF, peak on the cut) with `whoosh_03` (−16.3 re VO).
- The lift SFX is `case_lift_01`, set 4 dB under the kit gain because the VO runs under it.

## 4. Date shot (Chinese E2, measured at 0:42.33–45.03)

**Measured in Abyssal:**
- The first story shot is sharp for 0.3 s, then blurs over 0.25 s (≈25 px).
- The VCR date is typed at ≈18 char/s with a red block cursor.
- The text fades 0.85 s while the background **un-blurs in 0.3 s**, then the shot simply continues.

**Ours (`DateType_N2` over `OpenBlur`):**
- **Timing:** sharp 9 f, blur 8 f to 22 px (−30 % brightness), and un-blur over the last 9 f while the text fades over 18 f.
- **Look:** the date is Archivo 76 px, the place is tracked caps, the coordinates are mono, and the caret is amber.
- **Placement:**
  - Case 1's date is spoken only 12 s later, so the opener (a 1-s VO gap) carries **when + where**. This is Farrell rule 7: open each case with WHEN/WHERE on the first shot.
  - Nothing else in the case repeats them.

## 5. Pages and pacing (Abyssal + DD information style)

**Measured:**
- **Abyssal page (E5):** a flat white excerpt **rises** (1.3 s ease-out), with the marker wiping WITH the spoken phrase. It holds 6–9.5 s.
- **Abyssal rule:** long holds only on a clip that *is* the event. Explanatory b-roll turns over every 3–6 s. Information comes from pages, the date and a place label; **no maps, no counters, no 3-D** (Chinese study §E8).
- **DD:** satellite maps, but pages and labels are silent and text is rare.

**Ours:**
- **Page 1:** `PageRise_N2` rise, KTVU, marks on "a single-engine Grumman American AA-1," and on "clipping a powerline" (on "clipped").
- **Page 2:** a **different** entry, `PageRise_N2 motion="burst"`, the VV §6 velocity push (×1.28 per 2 f to a peak at +1.05 s, then τ 1.45 s, ≈ ×1.18 total). It marks "blocked all four lanes" on "shut" and "notified the FAA" on "FAA".
- **Map:** `SonarMap_N2` in its two-stage form, with **no text**.
  - The pin lands on the crash spot.
  - On "Cobb County International Airport" the frame widens and an amber dashed line draws from the runway centreline to the pin. KTVU says the plane came down half a mile out of the airport.
  - The map is the DD satellite device and carries real information (why the plane was so low) without restating the VO.
- **Removed vs v1:** red circles, the tracked ring, the name tag (the VO names the pilot), the title wall and silent beats.

**Pacing linter (`plan_v2.ts`, which throws at bundle time):**
- ≥ 3 s of footage between devices;
- ≤ 1 device per 10 s;
- text ≤ 1 per 20 s;
- per-device min/max durations.

The linter caught page 1 at 4.3 s (it needs ≥ 5.5 s); it was fixed to 5.5 s.

## 6. Sound (Chinese §G + sfx_n2/SFX.md; real recordings only)

**Abyssal:**
- the bed is ≈ 20–25 dB under the VO;
- an underwater hum runs under the chart;
- the level boom is +3.2 dB re VO;
- static crackle on tears;
- no SFX on pages.

**Ours:**
- **Bed:** Music bed ≈ 17 dB under the VO, lifted ×1.6 in the title/level VO gap, restarted at the case (Abyssal restarts the bed per entry).
- **Hum:** `bed_underwater_01` under both chart spans (−30.2 dB, 0.5 s pre-lap, ducked to 35 % under the footage window).
- **Title:** `pre_swell` cut dead plus `title_hit` on the title (VV chapter recipe).
- **Pages:** `page_in` at −31 dB.
- **Master:** −16 LUFS / ≤ −1 dBTP (linear gain + alimiter).

## 7. Farrell / Nocturn / VV (existing studies, not re-measured)

- **Footage:**
  - every footage move is a LINEAR push of 1–3 %/shot (Smoothness 4.3);
  - the picture lands on the noun it names (Smoothness 3);
  - B-roll turns over every 2–6 s;
  - hard cut is the default; designed transitions are ≤ 3 per minute (two DepthCuts around the chart + one cold flash).
- **Sources narrower than 16:9** (CCTV 4:3, vertical phones, the Morbi strip): centred on a blurred, darkened copy of themselves, which is Abyssal's intro treatment. Black side bars are banned for this owner.
- **Faces of victims:** softened (blur band over the Morbi deck).
- **Kept as evidence:** source timestamps, the dashcam OSD and the "COURTESY" line (Farrell rule 2). Station bugs are cropped.
- **Easing:** VV "quick start, long settle" (EI.quick) for graphic entries; EI.cam for camera glides; nothing springs.

## v3 reference study (2026-10-26, owner change list): Fern, ParallelPipes, LEMMiNO
Sheets: 48 evenly spaced frames per video (Fern x2), ParallelPipes 1:00-3:00 at 1 frame / 2.5 s. LEMMiNO (D.B. Cooper, CbUjuwhQPKs) had not downloaded (googlevideo timeouts in `refs/lemmino/dl_*.log`): not studied yet.

**Fern** (Smartest Killer, Japan's Chernobyl):
- Everything is a lit 3D scene, low-key, with one motivated light source; documents are physical objects (a newspaper macro with shallow DOF, a corkboard, a typewriter) shot by a slow dolly camera, never flat screenshots.
- Maps are dark 3D aerials of the real site with floating labels/numbers and one coloured ring (the 20 km zone), not UI maps.
- Dates and times are diegetic cards: an LCD clock reading "MARCH 12, 2011 / 7:11 AM"; chapters are typewriter text on a desk.
- Colour: desaturated teal-green shadows, warm practicals, heavy vignette, grain.
- Adopted: the 3D map flyover (Blender, real NAIP aerial on relief, depth falloff to black, a light-beam pin, the plane's path drawn in 3D with altitude drop lines, labels tracked from the Blender camera); the page as a tilted physical sheet on black with a shadow; DreadGrade_IC3 on all footage.

**ParallelPipes** (Wikipedia's Strangest Pages), best treatments:
1. **Phrase isolation:** the key phrase is cut out of the page as a white strip on black, at macro size (fills the width), with a slow lateral pan.
2. **Title isolation:** the page title box alone on black, then cut to the page.
3. **Zoom-out to the whole page** (tiny, readable as a "real page") and then a push into the paragraph.
4. **Image isolation:** a figure lifted out of the page, centred on black in its own frame.
5. **Plain title card:** the subject name in serif on black between treatments.
6. Hard cuts on the VO beats; each treatment lasts 1.5-3 s; no highlighter pens, no boxes.
- Adopted in PageFocus_IC3: the sheet enters tilted (Fern), the first passage is lit with the rest dimmed, then the camera flies into the second passage and the page goes to black around it (treatment 1). The dim is computed every frame from the active span only, which fixes the v2 stale-dim bug. Pages stay rare: one per case at most.
