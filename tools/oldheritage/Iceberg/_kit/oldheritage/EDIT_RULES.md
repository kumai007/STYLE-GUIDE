# EDIT_RULES.md: Ekam's video-editing rules for an automated editor agent

Sources (all under `scratchpad/brain/` or `scratchpad/chatexp/`) are cited inline in short form:
- `OT` = `404_Rendrer/OWNER_TASTE.md`
- `CS` = `404_Rendrer/CHANNEL_STYLE.md`
- `PEAK` = `PEAK_V5.md`
- `TU` = `TEMPLATE_UPGRADES.md`
- `SL` = `CLAUDE_HANDOVER/SESSION_LEARNINGS.md`
- `SG` = `Smoothness_Guide/1_SMOOTHNESS_GUIDE.md` (and `2_…CHECKLIST`)
- `M-xxx` = `Video-QA-System/MISTAKES.md`
- `fb_*` / `ref_*` = `claude_memory/feedback_*.md` / `reference_*.md`
- `OWN Lnnnn` = `chatexp/00_OWNER_MESSAGES_ONLY.md` line
- `CHAT Lnnnn` = `chatexp/01_MAIN_CHAT_readable.md` line

Precedence: zero-tolerance rules (§1) override channel identity (§2), which overrides workflow convenience (§3). Within a channel, the most recent owner ruling wins. Older rules carry a `SUPERSEDED` note where the owner reversed them.

---

## 1. ZERO-TOLERANCE RULES (a violation means reject, fix and re-render before anyone sees it)

### 1.1 Audio
1. **Music is never louder than the VO, not even for 0.4 s.** A viewer comment with 5k likes said the music "gets insanely loud, even louder than your narration". The owner's order: "make next videos never get this issue" (OWN L2959, `fb_music_never_over_vo`).
   - Every final mix, ads and intros included, must pass `music_gate.py` with **FAIL 0** before it ships. Thresholds are in QA_RULES §A2.
   - Case-card booms on "Case N", music swells and lifts are the usual offenders.
2. **The VO is never missing or silent.** The LG100 final shipped silent from about 3:30 to the end: assemble.py looked for `aseg/003.wav`, padded the missing file with zeros, and music_gate passed on the silence (SL, CHAT L71045, OWN L5281 "WTF, where is the voiceover?").
   - Assemble scripts must exit on missing or empty audio; never pad with zeros.
   - Run `silencedetect n=-50dB:d=4` on the FINAL file.
3. **Raw audio under the VO is muted or ducked; the intro has NO raw audio.** Intro teasers play muted under the music (OWN L4578, `fb_intro_script_only`, SL).
4. **Music library.** Use only cleared beds: Music 8/9/10. Music 1–7 and `ES_*` carry Epidemic Sound tags and are banned (`CS §12`, M-013, `fb_detail_not_decorate`).
   - The owner later asked for "new Epidemic tracks" for LOSTYT (OWN L1421). Treat new music as owner-supplied only: if the owner hands over a folder, use it after the tag scan; otherwise use M8/9/10.
5. **SFX are minimal, real and measured.** No synthesized ffmpeg "bs" SFX (`OT 2026-10-25`), no Mixkit/stock whooshes, shutter or ring-swish sounds (M-009).
   - SFX only on structure points: title, case card, a true peak moment.
   - Rings, pages, maps and labels are silent (`CS §11`).
   - Farrell-genre videos run at or near zero SFX. On HIA the owner said "Remove ALL SFX", with no ambience either (`fb_farrell_grade_no_sfx`, OWN L1520).
   - LG100 brief: "appropriate" SFX on important moments only, never repetitive (OWN L4635–4637).
6. **Master: −16 LUFS integrated, true peak ≤ −1.5 dBTP** (−1.0 hard limit), 3–5 ms fades on every audio cut.
   - Never boost a clip past −1 dBFS (`SG §2`, M-049).
   - Use linear-gain loudness; a one-pass loudnorm shifts the VO tail (`OT §2`).
7. **No dead air.** The bed never drops below −50 dB for ≥ 1.2 s (M-030). There is no ≥ 0.5 s stretch below −38 dBFS inside a raw slot (M-070).
   - Act breaks are about 1.5 s with the bed kept low, never 4–7 s of silence.
   - No 3–4 s gap after the intro (OWN L4594).
8. **No creator music under raws.** Keep the speaker's voice stem (Demucs) under our own bed (M-033).
9. **VO cuts are clean.** Nothing is cut mid-word, and no fragment of the next sentence or the raw speaker leaks in (M-032).
   - Snap cuts to real quiet runs. Use 20 ms raised-cosine crossfades.
   - Whisper-verify every join (LG100 `cut_titles.py` / `verify_joins.py`, CHAT L62900+).
10. **Never invent or borrow VO lines.** The intro VO is ONLY the scripted intro line: "this is the ONLY DAMN INTRO" (OWN L4586, `fb_intro_script_only`).
    - Don't re-voice case counts ("twenty five" stays "twenty five").
    - Never print a case count on screen when cases were dropped (`OT 2026-10-26`).
11. **Spoken case numbers and titles are removed** when the owner generates the case titles separately, as on LG100 (`project_lg100`, CHAT L62900). They must never be heard.
12. **Mute ad-unfriendly words** in the VO and keep them off screen: "hang him", "killed her", "her body", "suicide", and similar (M-041).

### 1.2 Footage and rights
13. **No agency-licensed clips.** That means ViralHog, Jukin, Storyful, Newsflare, Caters, Viral DRM, Spectee/TMX, WONDER VIDEO and similar, even when it is the filmer's own upload (`fb_no_agency_licensed_clips`, `OT §2`).
    - Scan each clip's `info.json` title and description for those names plus `licensing@` and "to use this video". Quarantine hits to `sources/_AVOID_licensed/`.
    - **Allowed:** the owner's Drive clips, police/government dashcam posted by TV stations (logo cropped, no anchors), and non-agency reposts.
    - **Banned:** TV-station-shot b-roll.
14. **No watermarks, logos, bugs, burned-in subtitles, creator captions or source lower-thirds anywhere** (OWN L130, M-014/15/48/89/90).
    - Crop, blur or delogo, then check the 1:1 crops for letter ghosts.
    - On LG100 the in-game dialogue box at the bottom of the Sonic footage counted as "bottom text" and was rejected.
15. **Never show a competitor channel's** page or footage (M-038). Never download a reference channel's footage into an edit (`ref_snook_yt_style`).
16. **Never cross a source's own scene cut.** Start each window ≥ 3 f after a source cut, and keep the first and last 0.7 s of the window clean (`PEAK`, `OT 2026-10-26`, M-003).
    - A 1–12-frame foreign flash is "the #1 recurring failure" (CHAT L974–999). `microcut.py` must report 0 flags.
17. **Normalize every source to H.264, 30 fps CFR, GOP 15** before editing. AV1/VP9 and 24/25/29.97 fps sources caused the "glitch frame" and judder (`OT 2026-11-06`).
    - 25 fps → `framerate=fps=30`.
    - 60 fps → `select=not(mod(n,2)),setpts=N/30/TB`.
    - Never `-vf fps=` (M-002, M-055).
18. **Clip speed is true speed.** Freezes are the exact frame. Slow-mo is 0.25–0.5× with frame blending, never frame doubling or `minterpolate` (it warps CCTV) (`CS §0`, M-047, `OT V35`).
19. **Never pad runtime with filler.** No slowed "REPLAY" recaps, no static stills, no talking heads, no end cards. To lengthen a video, extend the raw clips from their own source, up to +18 s each and stopping at a scene cut (`fb_lengthen_with_raw`, OWN L3962).
20. **Non-English raw speech always gets English subtitles**, in short timed phrases (OWN L4568, M-015).
    - Non-English pages get an on-screen English translation (`fb_d25_new_channel_identity`).

### 1.3 Safety and censorship (YouTube age-restriction)
21. **The intro hook and title-wall tiles never show a person being struck, hurt or in danger**, even blurred. Show the event (vehicle, blast, weather, structure) (`OT §2`).
    - Inside cases, cut before contact or use a designed beat (M-093).
22. **Blur victim, injured and dead faces in EVERY frame of every window**, including before the incident. Mosaic injuries and bodies with 48 px blocks.
    - Track the subject across the whole source, so reused windows stay covered (M-017, M-081, M-086).
    - Never use a full-frame cheap blur (M-016).
    - Don't blur uninjured people: "Blur ruins it" (`OT 2026-10-26`).
23. **Never tint people red**, which reads as blood (M-102). No red-on-red. No red X or death styling on survivors (M-104). No laughing face under a death stat (M-019).

### 1.4 On-screen text (the most repeated correction)
24. **Never put text on screen that restates the narration.** The AP ContextTag was used 217× and the owner called it "fuckass claude slop template" (`OT §2`, M-105). Text is allowed only for:
    - the case opener (number, date, place);
    - a name tag the first time a key person is named;
    - a stat that matters;
    - real page or screenshot highlights.
    - Outside openers, use at most about 1 designed text element per 20–30 s. Count the text overlays per case before rendering.
25. **No generic AI-template typography.** Banned:
    - mono kickers, hairline UI bars, micro captions, glyph-decode text, letter-spacing or blur animation on type;
    - keyword wash cards;
    - "Claude-drafted" lower-thirds or headline strips (M-012, OWN L1391, L4640, `OT 2026-11-05`).
    - Animate type only with transforms and masks.
26. **No bottom or side lower-third captions** for documentary channels: "the text you've placed at the bottom on the side is terrible" (OWN L4661, L4687). Name tags go in-frame, Farrell-style (§2.3).
27. **Never text on empty black.** The plate luma under any caption must be ≥ 15/255 (M-031, `SG`). Use a lit freeze, a blurred dimmed plate, or the map.
28. **Highlights:**
    - Colour is RED with a slight glow. Use yellow only where red doesn't suit the page. Never blue, and never a highlight in the same hue as the text ("blue highlight over blue text… just wrong", OWN L4685).
    - Cover the WHOLE phrase across lines, with boxes from OCR (`phrase_box.py`), never guessed (OWN L1556, M-074).
    - Must be visible: on light pages use pale red `rgb(255,166,160)` multiply; frame the text big, at a view of at most about 1300 capture px wide (`fb_hia_v2_notes`).
    - **At most 1 highlight per page shot**, and about half of all pages carry none (OWN L4711, CHAT LG100 `Mark slice(0,1)`, `SG`).
29. **Banned fonts:** handwritten, drip, Creepster, Caveat case cards. In the 404 channel, also Montserrat, Archivo, Instrument Sans, JetBrains Mono and D-DIN (`CS §0`, `OT V35`).
30. **Text lands on the spoken word, +0.0–0.15 s** (M-023). Every text device fully enters, then holds for ≥ 1.5 s + 0.3 s per word, and at least 3 s total (`OT §2`).
31. **Every fact on screen is verified** against the script or a source page (M-028). Name-tag subs are specific human lines ("the man behind asdfmovie"), never generic ("YOUTUBE CHANNEL") (`OT 2026-11-06`).

### 1.5 Picture quality and smoothness
32. **Zero glitch, flash, lag or stutter frames.** Covers stray inserts, 1-frame glitches, judder on zooms, seams at splices, keyframe pulse, and repeated or frozen frames (OWN L934, L1554, L3883; M-003/47/78/109).
    - A designed glitch counts only if it lasts ≥ 6 frames per state (`PEAK`).
33. **Everything moves and everything is eased.**
    - Footage: constant LINEAR push, about +2–4.5 %/s by channel.
    - Graphics: oversize → settle, fast start and long settle; no symmetric ease-in-out and no bouncy springs.
    - No page or still is ever dead: drift ≥ 0.16 %/s, measured as real motion, not grain (`CS §0`, `SG`, M-020, M-071).
    - Pages use one continuous `translate3d/rotate/scale` transform, never per-frame pixel offsets inside a 3D layer (that gave ±1 px judder) (`fb_hia_v2_notes`).
34. **Grade is restrained and measured.** No heavy vignette ("faded corners way too much", OWN L1520). No red texture overuse (OWN L170). No grain, chromatic aberration, VHS, light leaks or letterbox (`CS §14`).
    - Grade the footage layer only, never the master over overlays (M-082).
    - No global hue push; fire must not turn pink (M-025).
35. **No black side bars.** Vertical clips go on their own blurred fill, lifted to L ≥ 20 on dark spans (M-073, M-095).
36. **Never change the fps** (30 fps, 1920×1080 base) (M-001).
37. **Delivery quality is never low.**
    - The owner asked for "4k highest bitrate" and "render 4k 60fps highest bitrate" on some videos (OWN L1421, L2961).
    - Remote previews are the only downscaled outputs: phone h264 ≤ 30 MB.
    - "why is the video quality so low?" (OWN L5283) came from 640 px phone parts being taken for the final, so always state which file is the full-quality master.

### 1.6 Editing behaviour
38. **Never repeat devices like a template.** "Don't rely on the same templates for everything" (OWN L128). A motion-graphic style is used "only 3–4 times in the entire video" (OWN L190).
    - Series devices (case opener, title, end card) repeat every case; that is the channel style.
    - Page treatments: about 12 variants, 3–4 uses each.
    - Explainer skeletons: at most about 5 per video.
    - Everything else: at most about 5 per video and **never in consecutive cases** (`OT §2`).
    - Never split the palette per video (M-051).
    - Don't reuse a previous project's animation styles on a new channel (OWN L4613).
39. **Never invent devices.** Every device is a real, measured device from a cited reference video (video + timecode), rebuilt with a LITTLE twist: "Why are you creating things randomly instead of following the references?" (OWN L1554, `fb_detail_not_decorate`, M-012). "Detail, don't decorate."
40. **Every overlay names or points at something on screen, or something being said.** No slogan text over unrelated footage (M-006). No card that repeats the footage behind it (M-011).
41. **Show what the VO says, every line**: real footage of it, or a built visual for it. Never generic filler (`PEAK addendum`, OWN L4629 "the audience should always understand").
42. **On revisions, PATCH the approved version; never rebuild or swap systems.** "Bro, you messed it up again. I didn't ask you to cut out or remove everything" (OWN L210).
    - Fix only what was named, plus anything else broken ("fix everything, not only what I told you", `OT §2`), and keep everything else frame-identical.
    - Keep the previous final as `_prev`. Splice changed shots only; never redo renders that can be spliced.
43. **Best/scariest case goes first** (Case 1), whatever the cut-sheet order. The top cases are the first 4–5 (OWN L4578–4590).
44. **Don't start editing before the owner says go** (OWN L11, L1492, L2977). Analysis and reference study come first.

---

## 2. CHANNEL STYLE IDENTITIES (measurable targets)

Common base: 1920×1080, 30 fps. Exports use h264 (x264 CRF 12–14, or AMF cqp 16/18 with equal I/P QP; see M-109) and AAC 320k. Master −16 LUFS / ≤ −1.5 dBTP.

### 2.1 404 Thread: "Caught on Camera" compilations (Waterpark lock) (`CS`, `OT §1–2`, `SL`)
**Identity:** ONE style forever, the Waterpark render.
- It blends Disturbing Dose (base, grade, rhythm), Nocturn (detailing, hand-overs), Visual Venture (motion) and Farrell (info-animation).
- "Something of your own" means more and better templates INSIDE this style, never a new palette. The INSTRUMENT (orange OSD) and MIDWAY (magenta LED) looks were rejected.

**Palette:**
- Accent red `#E30A10`; DD label red `#F22522`; HUD red `#EF020C` / `#FF1A1A`; white `#FDFDFD`.
- Dark plate `rgba(8,0,0,.78)`.
- Page highlight yellow `#F5B800` / `#D5DE10`, soft `#F4D086`.
- No other accent colour.

**Fonts:**
- Varela Round + round stroke (0.076×cap) for date/place/word labels.
- Nunito 900 for the case number, always footed "1", never "01".
- Bebas Neue 150 px for titles.
- Oswald 200 for sub-lines.
- Inter 700/800 for HUD, stats and maps; Inter 300 for name tags.
- VCR OSD Mono for VhsDate only.

**Case opener:** narration starts at once. Number + date + place take about 1.5 s with `case_number_hit` (0 dB, first visible frame), then the VO. No raw cold opens.
- Rotate 5 variants, never the same twice in a row: CornerFade, CentreSettle, TypedStamp, ChapterRise, FlashSlam.
- Glyph: 168 px at (0.869 W, 0.190 H).

**Pacing:**
- Reference median shot about 3.2–3.4 s. Pace on meaning; never a stopwatch rule ("you ruined the pacing because of the rules").
- Pages 4–8 s (≥ 1 s + words/3); maps 3–5 s; name tags 2.1–2.9 s.
- At most 1 designed device per 10–15 s, with ≥ 3 s of footage between devices. Longest designed beat ≤ 7 s.
- Footage about 45 % / designed beats about 55 %.
- Raws only 2–8 s, and only where the sound IS the moment, with genuine clip sound and subtitles.

**Transitions:** hard cut by default, about 3 designed transitions per minute at most.
- Measured set only: BlurDip 13/1/14 f, SineDip, GlitchStreak 9 f, BlurFlash, FlashStreak.
- Never the same exit twice in a row; at most 1 white flash per case.

**Motion:**
- Footage: linear push +4–4.5 %/s.
- Plates: drift +0.8–1.4 %/s.
- `EZ.quick` = bezier(.31,0,0,.957); punch = bezier(.25,0,.15,1).
- At most about 3 freeze-punches per video.

**Grade:** `grade.cube` (33³) with a neutral band, chroma ×0.90. Vignette g(r) = 1 − 0.77·((r − .38)/.62)^1.1, with corners at .23–.28, on footage only.

**SFX table:** levels are relative to the VO (`CS §11`).
- case_number_hit −0.4, sub_boom +7.6, white_flash_hit −3.5, glitch −19.8, dip_whoosh −22.9.
- Rotate the variants.

**Music:** bed = VO LUFS − 12 LU. Duck to −6 dB under raws.
- Drops to 0 on the worst line or on tolls.
- 1–2 beds per case; adjacent cases never open on the same track.

**Titles:** the DD-style title wall: curved numbered tiles, pull-back from ×7.7, tiles flip to clips on the spoken words, dive into tile 1. Never a static card.

**Voice:** Algrow Stealth "Obscure Collab", 2.0 / temp 2.0 / rate 1.05.

**Runtime:** 50+ min.

### 2.2 Farrell-genre documentaries (LOSTYT, HIA, Japanese TV) (`fb_farrell_not_encounters`, `fb_farrell_grade_no_sfx`, `fb_hia_v2_notes`, `OT 2026-11-05/06`)
**Benchmark:** Farrell McGuire, with VV motion and Brew image/card presentation. Use Brew for presentation only, NEVER its cartoon or character animation (OWN L1488).

**Pacing:** slow, cinematic, no quick cuts.
- Farrell measures about 6.5 changes/min with a median shot of about 6–7 s; holds of 4–12 s; nothing under 3.5 s; no shot over about 10 s.
- Graphics stay ≥ 5 s; text holds ≥ 2.5 s. No more than 2 page shots in a row.
- Dissolves of 13–28 f (about 18–22 f typical).

**Grade:** natural, rich colour.
- Farrell measures saturation 0.34–0.44, corner/centre luma 0.18–0.53, mean luma about 0.30.
- Look2: sat 1.07, gentle S-curve, vignette 0.34 at the far corners only.
- Pages and photos are BRIGHT and fill the frame. A dark or blank graphic under the grade reads as black, so always give cards and panels an image.

**Sound:** VO + music. SFX near nil; any SFX must be high-quality booms on structure only.

**Footage:** mostly non-news b-roll, photos, documents, maps and reconstructions. News footage appears only as evidence.

**Text:**
- Case title: VCR OSD Mono in a black rounded panel over the blurred source page, sliding up once and holding (Farrell "STATION922.MKV").
- On-screen words: bold sans, silver face, dark halo, focus-in.
- LOSTYT approved: D-DIN Condensed name + VCR mono labels + Instrument Serif titles, soft mask wipe. LOSTYT v3 name tag = pointer callout: ring on the person, leader line, D-DIN name + Instrument Serif italic line, ≥ 2.5 s.

**Highlights:** red glow over the full phrase. Banned: VCR labels like "ROLLING STONE · 2015", source captions on page shots, and Encounters devices or SFX.

### 2.3 LG100: "100 Strange Cases of Lost Games" (other channel) (`project_lg100`, `OT 2026-11-09`, CHAT L59079–71358)
**Brief:** its own identity, NOT 404 Thread. Farrell/VV/Brew quality; slow, clean, smooth; every game explained; valid gameplay footage.

**"The Lost Registry" identity was REJECTED (v1)** as "can be 10x better". Never reuse:
- mint `#7FE7D9` / amber dates, Archivo wide, JetBrains Mono glyph-decode text;
- mint-rule lower-left tags, ring + leader callouts, the stroke-drawn "100" title, the CASE 001 outline card;
- the text-wall intro of 100 titles.

**v2 was REJECTED:** Montserrat 800/900 letter-rise titles ("overdone"), white bottom-left name cards ("terrible"), blue text-selection highlight + I-beam cursor.

**v3 is the approved system** ("follow this same flow", CHAT L66169). Farrell 1:1:
- `Lbl`: plain white Arial in the frame, no box, sub at size×0.43, 14 f fade. At most 2 labels per case.
- `Panel`: series title and case titles in VCR OSD Mono, in a black rounded panel that slides up once and holds.
- `Big`: big figures in VCR or red neon.
- `Mark`: red `rgb(255,92,86)`; multiply on light pages, screen on dark (`dk`), outline (`box`) on coloured banners. At most 1 per page shot.
- Lens `Ring` + plain label.

**Grade:** saturate 0.94, vignette 0.5. v1's sat 1.06 + grain 0.042 was rejected.

**Timing:**
- Dissolves 22 f; edge fades 8 in / 12 out.
- Case card 0–3.45 s; case VO starts at local 3.615 s.
- Shots 2.5–7 s, cut on clause boundaries. At least 2 motion-graphic shots per case; each source range used once per case.

**Mix:**
- VO master −25 LUFS raw, gain applied.
- Beds M8/9/10 rotating at −16.5 dB, ducked 4.5 dB under speech, lifted 5 dB in the title gap.
- Bed about 27 LU under the voice on average, never closer than 14 LU.
- Then `loudnorm I=-16:TP=-1.5:LRA=11` and `music_gate --fix`.

**VO:** all 100 spoken "Case N, Title" removed. Owner also wants Blender/3D motion used (OWN L4588–4722).

### 2.4 Warrior Mind: paranormal compilations (V35 / V25) (`OT 2026-11-07…09`, OWN L2971–4598)
**Base:** Nocturn (clarity: every visual explains the narration) + VV explainers + Farrell weighing devices. V25: Brew glow + smooth zooms, and slightly SLOWER than Nocturn.

**Nocturn measures:** narration shots with a median of 4–7 s. Bed 10–20 LU under the VO, fully dropping out for the key raw. Case-break blacks of 0.7–3.3 s with a boom. No whooshes (`ref_nocturn_study`).

**Hand-overs (v3 fix):**
- Nocturn dissolves: 0.3 s soft cut into or between raws, 0.6 s raw→VO, 0.8 s between VO shots, 1.5 s fade-up out of the card.
- No 0.28 s black gaps at raw→VO.
- Each raw wav normalized on its own: speech at VO−2 LU, ambience at VO−7 LU, highpass 70 Hz.
- A continuous room-tone "air" track under raw groups.
- Bed ducked with a cosine ramp over 0.6 s, never a stepped duck.

**Text:**
- Case card: Farrell VCR panel over the case's blurred footage. Never Caveat or handwritten.
- Terms: Farrell silver sans focus-in.
- Lists: typewriter theories board.
- Creator/watch page with one red highlight bar.
- New music per case (Music 1/8/9/10 loudness-matched).
- Animations must differ from V35 and must not repeat.

**Runtime:** 2 h+ ("2hrs+ minimum", OWN L3958). Reach it by extending raws only.

**Renders:** max quality (x264 crf 12, slow; final AMF qp 14/16). V25 BGM is slightly louder than V35 but still passes the gate.

**VO:** owner-recorded, or Algrow gx_horror Stealth 2.0 rate 1.18 for patches.

### 2.5 Encounters (Juan Van Camping, Jean Verdell, WM police) (`fb_encounters_edit_rules`, `Encounters_KEEP/.../CHANNEL_STYLE.md`)
**Structure:** title card → VO/raw alternation → next-case teaser.
- The intro is raw moments under the VO with fades; the VO starts on frame 1; only the final ~2 s stab plays its own audio.

**Gaps:** VO starts about 0.2 s after the title card. About 0.4 s of black between cases. Raw speech 0.2–0.5 s in, < 0.9 s of air out. Run `gap_audit.py`.

**Pacing:** reference median shot 3.2–3.4 s; pages 7–9 s; satellite dive 4–6 s. No single framing over about 30 s; talking heads trimmed to about 30–35 s.

**Jean Verdell brand:**
- Number card: Georgia Bold numeral 330 px `#F2F1EE`; hook in Times New Roman Italic 72 px `#C9A86A`, lower case.
- Bodycam Times captions on black boxes.
- NK flash into pages; dissolve into maps.
- No light leaks. Satellite maps only (Sentinel-2 EOX, zoom ≤ 14, 3 levels about 2 zooms apart).

**Never:** photo cards, fast-forward icons, stutter montages, Encounters templates in a Farrell documentary.

### 2.6 Iceberg / algrow 2 "ABYSS" (Disasters Vol 2, CCTV Vol 1/2) (`ICEBERG_KIT/docs/NEW_CHANNEL_STYLE.md`, `PEAK`, `OT 2026-10-25/26`)
**Signature:** ONE photoreal Blender iceberg, CHARTED (level bars + case names), never a bare berg.
- It is a depth metaphor: the camera is lower each level (tip → waterline → underwater).
- The chart shows once, in the intro. Reference: Abyssal Detective.

**Level card:** black → wide berg → "Level N" in typewriter → push-in. Don't push into the berg before the case starts; the push lands on the entry title.

**Entry card:** a cyan glitch title on the berg at its depth, then a ≥ 6 f designed glitch cut to footage.

**Palette:** ice `#F2F8FB`, frost `#A9D8EC`, abyss `#020814`; amber `#FFB23F` is the only accent. No 404 reds, no title wall, no red circles.

**Fonts:** Special Elite (typewriter) + Syncopate (wide glow caps) in v3. The v1 Archivo + JetBrains Mono were for this channel only.

**Grade:** ColdGrade: sat 0.80, contrast 1.07, teal-navy soft-light 38 %, vignette 0.42. Footage linear push +2.2 %/s.

**PEAK V5 bar (the approved CCTV1 c06/c07 recipe):**
- 2–3 short Blender shots per case (place / mechanism / aftermath, 3–5 s, EEVEE).
- Remotion code motion for every other line.
- Never more than about 15 s without designed motion.
- Source-cut-safe windows, microcut 0, full mix −16 LUFS.

**Maps:** horror/true-crime style (LEMMiNO, Fern, DD, Abyssal), satellite or night relief. Never OSM patchwork; never Esri; never zoom past native resolution.

**Pages:** used rarely ("who reads screenshots"). Chip-lift page (lit phrase = undimmed copy; no stale dim). Motion must be perfectly smooth.

### 2.7 Disturbing25 (another channel) (`fb_d25_new_channel_identity`)
**Identity:** typewriter (Courier Prime Bold, ink-roughened) + "evidence board" (dark grunge board, B&W stills in thin white borders, slow camera hover). Case opener "01 / 25".

**Rules:** translate foreign highlights; no silent held stills as padding.

---

## 3. WORKFLOW GATES

1. **Brief → analysis → GO.**
   - Collect the script, VO, outline or cut sheet, reference Drive folders and "one detailed prompt".
   - Study the references END TO END; "judging from the first minute counts as slop" (M-052). Study the reference's structure: what the devices mean and how the camera moves.
   - Don't edit until the owner says go (OWN L11, L1492). Don't ask for what's already been given ("u have farell mcguire… drive link alr", OWN L2983). Apply the documented playbook rules yourself (`OT 2026-10-26`).
2. **Style frames first on a new channel or identity:** stills plus a 25 s motion test, before any case build (`OT 2026-10-25`).
3. **GATE 1: Intro + Case 1 only, fully finished, full mix** (OWN L122, L4646, `fb_progress_updates`).
   - Don't start Case 2 until notes arrive.
   - The gate can extend to Intro + Case 1 + Case 2; LG100 did (CHAT L64636).
   - Expect several rounds; "can be 10x better" is the default first verdict on a safe draft.
4. **Self-verification before sending** (M-029, `fb_ref_side_by_side_gate`, OWN L4576, L4592):
   - Build a side-by-side sheet: refs vs ours per beat, plus our channel frames.
   - Count device kinds, longest designed beat, transitions/min, footage share and genuine raw sound against the reference.
   - Technical QA passing ≠ good.
   - Compare against the last APPROVED output of that channel (e.g. V35 as the bar for V25).
5. **Previews:**
   - Always the full mix (VO + raws + music + SFX), never VO-only.
   - Phone h264 ≤ 29–30 MB, plus a full-quality LAN/HTTP link ("give me real link server thing", OWN L5289). Label the parts clearly. Say when test-clip audio is spliced (M-039).
   - For long builds: "i will js check 2-3 cases… keep going". Send the first 2–3 finished cases, keep building and apply the feedback everywhere (`OT 2026-10-26`).
6. **Status:** short lists (done / rendering / building + ETA + case counts). Answer "how much time left" and "how many cases rendered" directly.
   - Use multiple agents and 100 % of the machine when asked, but at most 2–3 heavy renders in parallel (RAM).
7. **Autonomy:** when the owner is away ("don't ask for any kind of permission coz I am not here"), make the decisions and log VERIFY items. Don't block.
8. **QA cost:** don't run exhaustive per-case QA ("checking same thing 100 times is wasting usage", `fb_no_exhaustive_qa`).
   - Put the rules in code (plan linters, render-time asserts) and spot-check stills only where something is new or risky.
   - Run the automated gates of QA_RULES §A on every final.
9. **Full video:** only after explicit "edit the entire video". Follow the approved section's flow exactly.
10. **Delivery:**
    - Final master + chapters (+ srt).
    - Pre-delivery: QA_RULES §A all PASS, especially music_gate FAIL 0, silencedetect clean on the FINAL file, microcut 0, and VO↔picture sync checked at ≥ 4 word checkpoints.
11. **Housekeeping:**
    - Work on D:, never C:; set TEMP to D:.
    - Keep sources, templates, references, cookies files and the brain.
    - List junk for the owner and get explicit confirmation before permanent deletion.
