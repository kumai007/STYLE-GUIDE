# GX-ADmixDD: CHANNEL PROFILE   (status: PILOT, 2026-11-14)

Order of rules: RULES_LOG.md (owner) > master SOP v2.0 §7 > this profile > refs. Owner lifted the §2.4 Abyssal ban for this channel (berg, typewriter cards, cyan, cyan glitch titles allowed). DD red #E30A10/#EF1015 system and DD fonts: out.
Ref short names: ADI = ad_incidents_iceberg, ADD = ad_dashcam_iceberg, ADC = ad_cctv_iceberg (all Abyssal Detective), DDV = dd_dashcam_v2, DDT = dd_texas_tower (Disturbing Dose). Timecodes are source m:ss or seconds. Tokens and frame recipes: BUILD_SPEC.md.

## References (what each one owns)
- ADD (55:31, dashcam iceberg) → base grammar: case card skeleton (black, berg fade, glyph-scramble title, burst), place label, typed date with cursor, orange name tag, replay looks (threshold, B&W freeze, duotone, solarize spot), 3-panel split lens, yellow marker sweep, card audio fade. Gate: refs/ad_dashcam_iceberg/gate/.
- ADI (47:46, incidents iceberg) → intro cut rate, push rates (measured %/s), level-card frame-step, pillarbox blur-fill, inset over self-blur, spotlight circle, block mosaic, SFX-at-cuts layer. Gate: refs/ad_incidents_iceberg/gate/.
- ADC (45:52, CCTV iceberg) → title particle build (7-10 f), two-tone title variant, 8-12 f glitch bursts, page blur-surround + line-wipe easing, linear page push, mix numbers (VO/bed/raw LU). Gate: refs/ad_cctv_iceberg/gate/.
- DDV (21:37, "20 Most Disturbing Dashcam Moments Vol. 2") → countdown format numbers (20 entries, 65 s mean), overlay-before-word lead (median -0.2 s), raws 3-17 s with VO paused, tracked ellipse look-here, map label. DD look NOT used.
- DDT (20:45, Texas Tower) → map dive + callout cascade (Map B 12:50), leader-line callout (TUMOR 18:00), flat multiply page highlight mechanics (P1-P4). DD look NOT used; restyled to Abyssal tokens.
- Gate copies for side-by-side checks: styleguide/gx-admixdd/gate/ (prefixed ADD_, ADI_, ADC_, DDV_, DDT_).

## Format
Countdown, 20 entries, #20 → #1 (most disturbing last). Not an iceberg, but the berg is kept as a DEPTH SCALE (see Title system).
Typical length: 26-32 min (DDV 21:37 at 65 s/case; ADD 126-151 s/case; we sit between: 60-110 s/case, top 5 = 90-120 s). Cases: 20.
Escalation (SOP §7.1): #20-#14 non-fatal, #13-#8 serious, #7-#1 worst; reorder only inside a tier. Opener case (#20) = a case with real sound.

## Look tokens (owner exception: Abyssal look allowed)
Accent + palette: title cyan #45FDFC (ADD gate t2076-t3134 median), rim #BAFEFF, glow #45FDFC @ 60%; title second tone white #F2F6FF; label off-white #E8E8E8 (ADD place label); name-tag orange #FB9404 with text #111111 (ADD t0144); cursor block #A51F20 (ADD t0470); page marker yellow #FFE600 (ADI/ADD); warning red #FF0A0A only for non-human danger beats (ADI 0:04). Red never on people (SOP §7.9): no red perp name (ADI 44:30 device dropped), red duotone only on shots with no visible person.
Fonts by role (Google Fonts, chosen to match ref crops; details BUILD_SPEC §2): number = Special Elite (typewriter slab, ADI/ADC "Level N") / titles = Archivo 800 at width 125 (wide heavy caps, ADD/ADC titles) / labels + date + HUD = VT323 (VHS pixel caps, ADD place label, date) / name tags + menu rows = Courier Prime Bold (ADD t0144, ADI t0014) / raw subtitles = IBM Plex Mono 500.
Grade (footage): HSV sat mean 0.30 (ADI 0.30, ADD 0.30, ADC 0.257); black point p1 luma 4-5 (ADI 5, ADD 4); white p99 235-242 (ADD 242; ADI 198 is too dim for dashcam daylight); mean luma 70-75 (ADI 69, ADD 74.5); vignette corner/centre luma 0.68 (ADD median; ADI host 0.47 too heavy for footage); cool teal shadows + warm highlights; grain 3-4% on night clips only. LUT: `gx_admixdd_teal.cube` (to be built in this folder; not made yet).
Look layer: 2 px RGB fringe on titles and pixel labels (ADD §8), VHS scan jitter only on place/date labels (ADD t0149). No VHS on footage.

## Grammar (measured)
Intro (0:00-~0:28): VO from frame 0 over real peak footage (SOP §7.1), no raw audio, no warning card on black (ADI 0:00-0:06.7 and ADD 0:00-0:04.6 warning plates are dropped: SOP bans text on empty black and silent title cards). Cut rate = ADI intro 24.4 cuts/min, median shot 2.1 s → 0-10 s has 4-5 cuts (shots 1.8-2.6 s), ≤1 graphic in the first 10 s (0 planned). 10-22 s: 4-6 more teaser shots 1.5-3 s (ADI 15.5-25), max 2 of them in an Abyssal look preset (threshold, red-mono 0.5-0.7 s, solarize; ADI 0:27, 0:29; ADC 0:17-0:27), clip of the worst non-human peak last. No index rows, no #numbers, no REC frames, no stutter montage.
Title system: title lands at ~22-26 s (ADD title at 34-42 s is too late for a 20-entry list). Berg = depth scale: one berg still per video; the title sits on the waterline of the full berg, then the camera dives under (ADD t0036 berg dive) into card #20. Each case card re-frames the same berg deeper as the rank falls: #20-#14 above water (snowy tip, ADD L1/L2 cards), #13-#8 waterline, #7-#1 underwater skull base (ADD L6/L7 cards, t2669). ADD already re-frames one still per card (G1: "same still, zoom/offset differs per card"), so the depth reading costs nothing and tells "deeper = worse" without any extra text. Variant B (only if berg is not wanted for a video): title over moving dashcam with de-focus fade-out (ADD 0:05-0:08, t0006).
Case open (30 fps, from ADD G2a ×5 + ADI G5 ×3, recipe D1 in BUILD_SPEC): hard cut to black f0 → black 36 f (1.2 s; ADD 1.17-1.43 s) → berg fades in f36-f51 (0.5 s; ADD 0.40-0.70) with "No. 20" typewriter on the same frames (ADI f8-f12) → number drifts up 1.5% H over 21 f ease-out (ADC G3) → push-to-berg f66-f75 (9 f, ease-in-out; ADI 7-9 f), number scales 1.5× and fades → title scramble-in f77-f85 (8 f; ADD 0.25 s, ADC 7-10 f) → title hold f85-f142 (1.9 s; ADD 1.35-2.1) → burst f142-f149 (7 f; ADD 6-8 f) → first clip f149 (4.97 s after the cut; ADD 4.2-5.0). VO: silent from 0.3 s before the cut, says "Number twenty" at f47 (open +0.37 s, ADI mean), title words at f92 (title text leads by 0.5 s, ADD 0.4-0.65), first story word f150 (burst start +0.27 s, ADD 0.16-0.31). Place label within the first 2-3 s of the clip on the place word; date typewriter only if the date matters (≤1/case).
Body: footage push = linear +1.2 %/s default (ADI 1.1-1.5 on CCTV), pull-out -1.1 %/s on 1 in 6 shots (ADI), never dead-still > 1.5 s (SOP §7.6; ADI had 12/18 static, we do not copy that). Photos/insets +0.4 %/s linear (ADI 0.3-0.5); pages land with a +8-10% ease-out pop over 1.5 s then +0.4 %/s (ADI 12:30, ADC G3). Cards push 3-4 %/s (ADD). Device cadence: 1 designed text element per 20-30 s outside openers (SOP §7.4); 1 look-here or replay per case; shot-to-shot = 12-14 f dissolve inside a case (ADD G2b), hard cut onto pages/tints. Footage share ≥ 84% (ADD 84%, ADI 78% + host; we have no host so footage takes the host share).
Raws: main 8-14 s, secondary 4-8 s, 2-3 per case (DDV 3-17 s, median ~6 s, VO paused; SOP §7.3 main 8-20 / secondary 4-10). Abyssal under-uses raws (ADD: clip sound never solo > 0.8 s); SOP wins, DDV numbers set the range. Raw level = VO -2 to -4 LU (DDV 0..-3 LU; ADC -4..-5 LU). Subtitles for any clip speech (BUILD_SPEC D5).
Look-here (silent, SOP §7.7): spotlight circle (ADI 4:10, 6:10; darken to ~10% luma, radius 20% H, 3-10 s), solarize spot ellipse (ADD 4:43, 10.5 s, shrinks 9%), cyan tracked ellipse ring (DDV 0:41 timing, our cyan), 3-panel split lens for 4:3/vertical (ADD 19:10). Max 2 look-here per case, ≥ 20 s apart; each lands 0-0.5 s before its word (DDV median -0.2 s).
Replays/freezes: replay of the key moment 1-2× per case in one look each: threshold posterise (ADD 27:10), B&W desaturate freeze (ADD 7:46), cyan duotone (our twist of ADD red duotone 2:20, 4.6 s hard-in, 0.43 s dissolve-out), slowed replay only if VO says "slowed" (SOP §7.2).
Pages: real captured pages only (SOP §7.5). Treatment = ADD/ADI white page, hard cut in with 1 flash frame, surrounding text blurred 6 px (ADC), key clause marker #FFE600 drawn as a flat multiply bar (DDT mechanics) at 0.15 W/s, line height 4.0-4.3% H, start within -0.4..+0.2 s of the first read word (ADD G3 -0.37 s); hold 4-8 s (SOP), ≤ 1 per case, ~half the pages without highlight.
Maps / explainers: ≤ 1 map per case and only where geography explains the event (SOP §7.2); ≤ 4 maps per video. Map = DDT Map B dive restyled: NAIP/Sentinel-2 satellite (never Esri/OSM), graded teal at sat 0.20, cyan #45FDFC pin + leader line, orange #FB9404 label box with Courier Prime Bold text, hard cut in, 2.8 s ease-out pull/dive, callout cascade 4-5 f per element, background dims to corner/centre 0.42 and 4 px blur, hold to 6-8 s (DDT held 14 s; SOP maps+pages ≤ 25% of a case). Annotated aerial with white callout boxes (ADD 36:10, t2170) = variant B. Callout on footage/photo = DDT TUMOR leader (16 f leader, 10 f label).
Transitions: inside a case 12-14 f dissolve (ADD) and hard cuts; card to clip = 7 f burst (ADD); tape-cut glitch burst 8-12 f footage to footage, ≤ 1 per case (ADC 1334 s, 11 f); dip to black only before each case card (ADD 1.2-1.4 s) and once before the title; white flash 1 frame max 2 per video (ADI 4.1 s). Rate ≤ 3 designed transitions/min (ADI glitches 3-4/min including cards; ADD bursts 1.4/min). Default = hard cut.
Outro + end screen: after #1, the berg pulls back up from the skull base to the full berg (reverse of the title dive, 3-4 s, ease-out) over the VO close; never black (SOP §7.1); 20 s end-screen hold on the full berg with a +0.4 %/s drift and bed under. ADD/ADC "THANKS FOR WATCHING" on black is dropped (text on black).

## Censorship (SOP §7.9 + refs)
Mosaic on injuries/bodies: square cells 40 px at 1080p (2.1% W, 3.7% H), averaged colour, tracked, feather 0 (ADI 3-5% W, ADD 12-16 px; 40 px sits inside the measured span and still reads as mosaic after YouTube compression). Faces of injured/dead people and children: Gaussian blur σ 18 px inside a tracked ellipse with 20% edge feather (ADI 8:10, ADC feathered ellipse). Plates/names/addresses on pages: 24 px mosaic. No black boxes, no full-frame mosaic (SOP: never full-frame cheap blur; ADI 31:10 full-frame mosaic is dropped). No bleeps (none in ADI/ADD/ADC); swears muted to bed (ADI G3). Cut before human contact.

## Sound
Voice: Algrow "new", model 2.0, expressiveness 2, speed 1 (RULES_LOG). Never re-voiced; split only at measured silence.
Music beds: dark drone/pad beds (energy 60-250 Hz like DDV/ADD), licence-clean, channel's own; change at each tier start (#20, #13, #7) and story turns; adjacent cases differ. Bed under VO = VO -14 LU (SOP gate ≥ 12 LU; refs sit at 8-12 LU, so we go lower on purpose). Bed alone in black dips: -18 LU vs VO (ADC black-beat drone swell is -10 LU; too loud for the SOP gate). Bed under raws ducks a further 3 LU (ADC G2: -36 vs -33), never dies.
Card audio (ADD G4 result 3): from the cut to black the bed fades linear in dB at -9 dB/s for 2.0 s, bottoms out as the title types, returns 6 dB lower under the first clip.
SFX set (real recordings, folder sfx/ to be chosen and measured): ~3 per min at cuts (ADI 3.05/min, ADC 2.9/min), 1 per 2.6 cuts. On: glitch bursts (HF digital burst 0.2 s), card push (MID whoosh 0.3 s, ADC 32.0-33.0), number land (soft sub hit ≤ VO -12 LU, SOP gate), tier start (wide sting, ADD 33.2/324.3 s), whoosh into the title. Silent (SOP §7.7): labels, name tags, rings/look-here, freezes, pages, highlights, maps (DDT sub thud on map callout is dropped). Never a designed hit on a crash.
Master: -16 LUFS integrated, ≤ -1.5 dBTP (SOP; refs -22.3/-25.2/-23.4 are not copied).

## Limits per case / video
| device | per case | per video | min gap |
|---|---|---|---|
| case card | 1 | 20 | n/a |
| place label | 1 | 20 | n/a |
| date typewriter | ≤ 1 | ≤ 12 | 60 s |
| name tag (public/official people only; SOP: no private names) | ≤ 1 | ≤ 6 | 60 s |
| look-here (spot, ellipse, solarize) | ≤ 2 | ≤ 24 | 20 s |
| replay look (threshold/freeze/duotone) | ≤ 2 | ≤ 24 | 15 s |
| page (4-8 s) | ≤ 1 | ≤ 8 | 90 s |
| map (6-8 s) | ≤ 1 | ≤ 4 | 3 min |
| callout/leader on footage | ≤ 1 | ≤ 6 | 60 s |
| raws | 2-3 | 40-60 | n/a |
| tape-cut glitch burst | ≤ 1 | ≤ 15 | 30 s |
| white flash frame | 0 | ≤ 2 | n/a |
| maps + pages | ≤ 25% of case time | | |

## Device bank
DEVICE_BANK.md (each: ref + timecode + numbers + our twist + used-in list; Abyssal-owned vs DD-allowed).

## Client rules for this channel (newest last, verbatim + date)
RULES_LOG.md

## Open (to settle at Intro + Case 1 review)
- Fonts are closest Google matches by eye from 1080p crops, not identified fonts.
- Warning card dropped by SOP; if the owner wants one, it must sit over footage as the single graphic of 0-10 s.
- Berg still: we need our own licence-clean berg photo (Commons CC / NOAA) with a tip, waterline and dark underwater base.
- LUT file and SFX folder not built yet.
