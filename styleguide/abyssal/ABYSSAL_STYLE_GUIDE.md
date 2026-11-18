<!-- GENERATED from styleguide/abyssal/abyssal.json by styleguide/model.py. Do not edit by hand: edit at http://localhost:8769 -->
# Abyssal Detective Style Guide

Iceberg found-footage documentary style, learned from 14 Abyssal Detective videos (4 given, 5 latest, 5 most viewed). Rev 47, saved 2026-11-14T18:45:42.
Follow it top to bottom on every Abyssal edit. The rule book comes first and is never skipped. Study notes: productions/_abyssal-ref/ABYSSAL_STYLE_NOTES.md.

Numbers come from ffmpeg on the 14 refs unless marked (est.), which means read from contact sheets or captions. No board clips (ref board is off).

## Rule book (never break these)

1. **SOP 2.4 look ban**: SOP ban wins (owner 2026-11-14). Master SOP v2.0 (docs/workflow/CAUGHT_ON_CAMERA_MASTER_SOP.md) section 2.4 bans the algrow-2 iceberg look. Do NOT use: the berg level graphic, typewriter level cards, the cyan palette, ice-cyan glitch titles. The iceberg format may stay; its look must be redesigned from the refs. Every rule in this book that asks for them is overridden.
2. **Seven levels**: Every video is an iceberg with exactly 7 levels (format only). Each level opens with a black dip, about 1 s silence and a level card (new design from the refs, pending pilot): no berg graphic, no typewriter level card, no cyan (SOP 2.4 ban).
3. **Fixed opening**: Open in this order: warning card (2-3 s), VO hook over real raw footage (no raw audio in the intro, master SOP 7.1), the 'N cases' animated case list (new design from the refs, pending pilot) (7 s), teaser of intense-movement raw clips (each >= 3 s), first case by about 45 s. The intro is mostly real raw clips, not graphics. No Presents sting.
4. **Entry card set**: Every entry gets: entry title (new design from the refs, pending pilot), typed date with red cursor, name tag, source credit. No entry without a date. No cyan ice title (SOP 2.4 ban).
5. **Mono type only**: All small text is monospace caps. Level cards and entry titles use new fonts chosen from the refs: not typewriter, not glowing cyan caps (SOP 2.4 ban). No other fonts.
6. **Dark but readable**: Keep the dark, low-saturation look (vignette, grain, light tape texture) but never too dark: details inside the image must stay clearly visible; lift shadows rather than crush them. Colour only in tints, red alerts and circles and yellow highlights. No cyan (SOP 2.4 ban).
7. **Censor everything sensitive**: Mosaic faces, bodies and plates; black-box names; bleep swears; red asterisk words; blur every TV channel / media-group logo in footage; add 'VISUALS ALTERED FOR VISUAL SAFETY'. (owner 2026-11-12, v5)
8. **Calm date-first narration**: Narration is calm, flat, third person, past tense, and starts each story with the date.
9. **Hard cuts and dips only**: Transitions: hard cuts by default, dips to black between beats, a few short crossfades allowed (see crossfade rule). Glitch cuts (2-3 frames, no overlap) only rarely: intro and shock moments. (owner 2026-11-13, v6 render; replaces v4 hard-cuts-only)
10. **Quiet mix**: Master about -21 to -25 LUFS, intro 2-5 LU louder. A dark horror ambience bed runs under the voice, with good SFX on events, both from Epidemic Sound; raw audio on key clips. (owner 2026-11-12, v5)
11. **Patreon level eight**: End with the 'level eight on Patreon' plug and the black 'THANKS FOR WATCHING' card (unless the topic ends cold).
12. **Few kinds of motion**: Graphics move only by typing, left-to-right highlight wipes, red circles drawing on, rare 2-3 frame glitch cuts, dips through black, animated maps (MAP_SPEC) and two camera moves: the case list (slow eased zoom-in, no shake) and the case title card (very slow gentle shake + small eased zoom-in). Never camera shake on footage clips. Sound sits on those events.
13. **Clean audio cuts**: Narration: whole sentences, always. Cut AI fillers (yeah/ya/ia) out between words at the quietest point, never mute them into a silent hole. Pauses only at sentence ends (~0.4 s) and commas (~0.2 s), never mid-sentence. Every pause >= 0.15 s is true silence (80 ms word tail, 50 ms ramp in): AI voices leave low noise/garble there that reads as a leak. Never cut into the first word of a take: check where it really starts. Preview with a fixed gain, not loudnorm (it lifts the leaks). Verify: Whisper hears all script words, no fillers. Tool: productions/abyssal-01-theme-park-disasters/build/vo_v7.py. (owner 2026-11-13)
14. **Steady intro static**: The warning card sits on one steady, continuous, normal-pitched VHS/TV static bed (low-pass the harsh highs). No repeated bursts, pops or pitch jumps: it never disrupts the viewer's flow. Level per the refs (about -15 LUFS over the warning) unless it feels harsh; then lower it. (owner 2026-11-12, v2; Presents removed v3)
15. **Match the refs by eye**: Before building, study the reference intros frame by frame (warning, hook, N-cases list, title presentation, case card, date, name tag, glitch, safety note): their motion, easing and flow. Copy them as closely as possible; the intro motion graphics must match the refs (owner 2026-11-12, v2 did not). Owner overrides (warning length, no Presents, one case card) win over the refs.
16. **Faces fully covered**: Every victim face in every frame is fully covered: mosaic box larger than the whole face and hair edge, tracked through motion, on every photo of an article card too. QC every victim shot frame by frame (every ~0.5 s).
17. **Quiet glitch hits**: Glitch and static hits sit under the narration: 30 ms peak at most about the voice's p90 level (refs: 0 to +3 dB over voice p90, short-term at voice level). No hit jumps out. Only the intro static bed is louder.
18. **Static only on the warning card**: Moving static/noise lives only on the warning card. No constant moving static, noise bands, tracking lines or VHS-noise overlay on footage; footage keeps only a light, still tape look (soft chroma bleed, faint scanlines, grain). Overrides the old 'VHS over everything'. (owner 2026-11-12, v5)
19. **No overlapping frames**: Crossfades (6-12 f) are allowed in a few places: between calm shots inside a story beat or out of a map/graphic. Hard cuts stay the default; dips to black between beats. Never on the exact word cut, never with a glitch. (owner 2026-11-13, v6 render; overrides the v4 no-crossfade rule)
20. **Dark low-saturation glitch**: Glitch frames and censored shots stay dark and low saturation (SATAVG ~3-11, YAVG ~52-73). No colourful posterise; a full mosaic plus dark grade covers sensitive frames.
21. **Generic rules**: Follow styleguide/_shared/GENERIC_RULES.md (shot length >= 3 s, audio cutting, SFX/music levels, loudness, transition hygiene, smoothness, QC, feedback loop). This guide's own rule book wins only where it says so explicitly.
22. **Feedback loop**: Every owner note on a render goes into this guide the same day (rule book entry or rule, plus a Learnings entry, via model.apply_ops + model.save). The next build must read the rule book, the open Learnings and styleguide/_shared/GENERIC_RULES.md first; after each render check it against every line, fix what fails, then deliver.
23. **Picture follows narration**: Picture matches the narration word by word: one clip per sentence, the sentence covers its clip (cut on the sentence/clause start, the clip ends with the sentence), so the place, ride, person or thing appears when it is said. Every clip >= 3 s: merge short sentences rather than make short clips. Real footage; no generic filler; no website/headline graphics. Plan it per sentence in the storyboard from the final narration timings. (owner 2026-11-12 v5, 2026-11-13 v6 render)
24. **Short warning card**: The warning card holds 2-3 s in total (60-90 f at 30 fps), then hard-cuts or dips to black into the hook. Overrides the old 4-5 s rule and the 208 f ref measurement. (owner 2026-11-12, v4)
25. **No Presents text**: Never show 'PRESENTS' or 'ABYSSAL DETECTIVE PRESENTS' anywhere: there is no name to present. The warning card goes straight into the raw-audio hook. (owner 2026-11-12, v3)
26. **Iceberg graphic for the N-cases line**: The 'N cases/disasters' line gets the animated case list (new design from the refs, pending pilot), held 7 s: every case name sharp and readable, a clear slow eased zoom-in running the whole time the names show (no shake), light grain texture. No berg graphic (SOP 2.4 ban). No headline or website screenshots.
27. **Case title card like the refs**: Each case gets ONE title card: a title plate (new design from the refs, pending pilot) with a very slow gentle camera shake and a small eased zoom-in, textured text 'CASE 01' with the case name below it. No berg graphic, no cyan. No second card. Music plays under the title card. Then the case footage starts (hard cut or dip to black, no crossfade); the date is small text on the first footage shot.
28. **Storyboard approval first**: Before any render, build the storyboard as a private web page, show it to the owner and get approval. No render without an approved storyboard. (owner 2026-11-12, v3)
29. **Every clip at least 3 s**: Every clip is on screen at least 3 s (90 f at 30 fps), the warning card excepted (2-3 s). No montage, teaser, shock-burst or CCTV/dashcam exception. (owner 2026-11-12, v4)
30. **No web or headline graphics**: No website, article or headline screenshot motion graphics, except where the owner allows them for a video. Show the story with real footage, photos and the ref card set first. (owner 2026-11-12, v4; exception owner 2026-11-14 for abyssal-01)
31. **Raw clips in the intro**: Fill the intro with real raw footage with intense movement (news, phone, CCTV, archive of the actual cases) under the VO, not graphics. Graphics in the intro are only the warning card and the case list. No inverted, mirrored or posterised colour looks on clips at all, intro included; clips keep only the normal Abyssal grade.
32. **Free clips only**: Use free footage only. News and raw case footage is OK with an on-screen source credit. Never licensed, paid or watermarked stock. Fill gaps with Pexels or Pixabay clips. More motion graphics are welcome (maps, red circles, typed text). (owner 2026-11-12, v5)
33. **Animated maps for places**: Show places with proper animated maps built to productions/_abyssal-ref/MAP_SPEC.md (dark map, eased country-to-town push, glowing pin, typed label, drawn route line), or write the place name centred on screen, or use a drone/establishing shot with the name. (owner 2026-11-12, v5)
34. **Red circles, not X marks**: Mark things with a red circle or strong red highlight drawn on. Never white X marks. (owner 2026-11-12, v5)
35. **No frame leaks, centred graphics**: No 1-3 frame flash of another shot at any cut (check every cut frame by frame). Every graphic (documents, text cards, maps) is centred on the frame, never right of centre. (owner 2026-11-12, v5)
36. **Vary the motion graphics**: Vary the motion graphics inside one video: name tags, date stamps, place names, highlights/red circles and document callouts must not all use the same design and animation every time. Repeating a design across different videos is fine; within one video it must not feel repetitive. Study the refs for more MG types and when to use each. (owner 2026-11-12, storyboard v6)
37. New source span: before use, look at its first, middle and last frames. No news headline, caption, logo swirl or dissolve may show. If one shows, move the source in point past it (v7 r31 and r39).
38. Red circle on a moving person: check the tracked circle in a frame strip. If it slides off the person, place it by hand from keyframes read off the frames (v7 r31: tracker locked onto the slide pattern).
39. SFX level: never place SFX relative to the voice. Follow GENERIC C20-22: music ~13 dB under the VO, SFX under the music, SFX inside narration peak ~-30 dBFS and 6-8 dB under the VO. Booms/risers only on transitions or gaps (v7 SFX were too loud, owner 2026-11-13).
40. Intro: warning card leaves with a short glitch transition (6-8 f) plus a quiet low-passed glitch SFX.
41. Intro: on the case count line ('twenty-five of them') zoom-in transition to the case list, zoomed in so every case name reads, list slides up 3-4 s, then dip to black.
42. Intro: the narration is fast. Change the clip with each topic (one clip per idea), even inside a long sentence.
43. Intro: raw crowd screams under the ride clips, like the clip's own audio, quiet (about 18 dB under the VO).
44. Intro montage for list lines (gate / ticket office / ride check): dark grey panel; each card slides up to centre and fades in; the old card slides up and fades out.
45. Intro end: case list again, scroll to the top with a dip to black, highlight case 01 on its name, dip to black into the title card.
46. Card-slide montage: each clip has a red border; keep a clear gap between the leaving card and the arriving card. Background is black with a grey radial gradient (soft white highlight in the centre) and a vignette, for a horror feel; not a flat grey panel.
47. Audio: every audio cut is a crossfade (raw clip audio, music bed joins, SFX tails). Nothing starts or stops abruptly.
48. Music plays under the whole video, from the first frame to the last, with no gaps; beds join by crossfades.
49. Level ladder (owner 2026-11-13): narration 100 %, music 80 %, SFX 60 %. Narration is always on top, music under it, SFX under the music.
50. Card montage exit: the last red-border card morphs out: its border spreads to the frame edges while the clip zooms to full screen, then it crossfades into the next shot (case list zoomed onto case 01 with the highlight).
51. Mix level ladder, owner pick A: voice on top; music ~10 dB under the voice; SFX ~14 dB under the voice (replaces the 13 dB music rule for Abyssal).
52. Map animations play their full real length, retimed evenly to the clip slot. Never read a map past its real end (no padded last frame, no freeze).
53. Motion graphics move slowly with strong easing (smootherstep or ease-in-out quint). Entrances, exits, slides, zooms, morphs and wipes last at least 0.6-1.0 s (18-30 f). Typing at about 0.5-0.7 characters per frame. Nothing reads as fast forward.
54. Start of the video: the whole mix fades in over 1.5 s. Never start the audio at full level.
55. Every transition is 0.5 s (15 f). Crossfades 15 f, eased. Dip to black 15 f in all (8 f down, 7 f up, eased). Never 3-frame dips.
56. No leaked frames: a clip (and its crossfade tail) must end before any cut in its source. Scan every played source span, tail included, before the render; after the render run a leak scan.
57. Narration never gets a fade-in. Fade-ins go on raw clips only. Level the narration so quiet words do not sound like a fade-in.
58. Use a few more crossfades between shots (where the next shot has no graphic in its first 15 f).
59. Title and chapter music starts on the black frame of the dip to black, with a 2 s fade-in.
60. Every highlight graphic (red ring, document band or underline, case-list highlight) gets a smooth eased push-in zoom on the highlighted part, so the viewer can read it.
61. More easing on every move (MGs, zooms, card slides, crossfades): smootherstep or slower; nothing starts or stops hard.
62. Music after a title card: start it when the title card itself shows (CASE ONE text on screen), with a 2 s fade-in; not on the black frame before it.
63. Red-border card montage: every card clip must stay inside one source shot for its whole span (slide-in, hold, slide-out); a source cut inside a card is a frame leak. Check every card with the leak scan.
64. Renders: all segments on GitHub machines (max 18), laptop is backup only.
65. **Intro = refs (colour, pace, motion, SFX)**: Owner 2026-11-13 (v10): The intro must match the reference intros in colour grade, pacing, animations, transitions and above all SFX. Measure the ref intros (cuts, colour, SFX map) and our intro the same way before building. Show the owner still frames of the new intro before rendering it. Aim to beat the refs; never repeat an old mistake.
66. **Article graphics + 3D man**: Owner 2026-11-14 (abyssal-01): use article graphics and a 3D man. Article pages must look like the ref ARTICLE clips (2TAT 13:07, 7UjU 3:22), owner 2026-11-14: one real report of the incident per case, flat page full frame (key text ~62% wide, optional 3 deg tilt), lands by hard cut with no sound, drifts up ~14% of frame height in 1.5 s and eases to a hold, slow push-in 1.00->1.06 on the key line; amber marker band like ref 2d2735 (flat band hugging the line, ~2 px corners, slightly rough ink top/bottom, black ink shadow offset down-right that is thick at the moving pen edge; never pill/rounded ends) wipes LEFT TO RIGHT as one smooth pen stroke (sine ease over all lines, ~0.75 s per full line) from 1.6 s and stays; highlight at most 2 key lines (no drop caps, no headline), never a whole paragraph; no dimming of the page; riser into the highlight, low boom on it. Out: 5-frame crossfade into the footage with a small ACTUAL FOOTAGE label. Blur every face on page photos. Small SOURCE credit top-left; English line as subtitle for foreign pages. No floating 3D card. 3D man: dark low-poly figures for count and height beats, slow eased camera turn, no gore.

## 1. Overall aesthetic

Dark found-footage iceberg documentary. Seven levels, calm narrator, VHS/CRT texture, tiny mono type. Level cards, entry titles and the case list are a new design (no berg graphic, no typewriter level cards, no cyan: SOP 2.4 ban).

- **Iceberg format, 7 levels**: Build every video as an iceberg with exactly 7 levels (format only; the berg look is banned, SOP 2.4). Put about 3-4 entries in each level (19-32 in total). Make later levels longer and darker. 14 of 14 refs.
- **Length**: Aim for 45-65 min. The refs run 42.6-87.5 min; 12 of 14 are 43-67 min.
- **Found footage first**: Fill 60-80 % of the runtime with real found footage: CCTV, dashcam, phone, livestream, news, bodycam. Use screenshots and stills for the rest (est.).
- **VHS/CRT texture**: Put a heavy vignette, grain and light still CRT texture over footage, never so dark that details are lost. No moving static/noise overlay except on the warning card. (owner 2026-11-12, v5)
- **Host cutaways**: Cut to the host in a red-lit room with an evidence board every 3-6 min, at seams. Keep the host to about 4-10 % of runtime. 13 of 14 refs (not 2TAT).
- **Same kit every video**: Use the same card set in every video: warning card, animated case list, ONE case title card (slow gentle shake + eased zoom + textured reveal), typed date, name tag, source credit, animated maps. No Presents sting, no headline/web graphics.
- **Respect and safety**: Censor gore, bodies, faces of victims and minors. Add the small 'VISUALS ALTERED FOR VISUAL SAFETY' note on altered shots.
- **No on-screen sponsor**: No sponsor reads. The only plugs are subscribe (mid) and Patreon 'level eight' (end).
- **Styled storyboard frames, MG on most shots**: Every storyboard still is a real styled frame from the render engine (grade, MG, censor, push), never a raw source grab. Aim for one MG or highlight device on most body shots (ring, arrow, spotlight, red band, name tag, location label, red word, quote, date, map), varied, never the same device twice in a row. *(set by you)*

## 2. Mood and emotion

Cold, uneasy, slow dread that grows level by level. Never jokey.

- **Descend into dread**: Start mild at Level 1. Grow darker each level. Say it in the hook: 'begin with the mildly chilling and with each level descend into the truly horrifying'.
- **Ordinary then wrong**: Show the normal moment first. Then turn: 'However,' or 'what happened next was ...'. The dread comes from the calm before the turn.
- **Calm, not hype**: Keep tone neutral and factual. No shouting, no meme cuts, no jokes.
- **Uncanny glitches**: Use rare 2-3 frame glitch/RGB-split cuts when something feels wrong or a level changes; no static-noise overlay on footage. (owner 2026-11-12, v5)
- **Leave it open**: When the case has no answer, end the entry on the open question ('remains unsolved', 'to this day'). Do not explain it away.
- **Respect the victims**: Treat deaths with care. Censor, do not linger on gore, and state outcomes plainly.

## 3. Color palette

Near-monochrome dark footage. Accents: red alerts, yellow highlight, orange tags. No cyan.

- **Low saturation**: Keep footage muted. Measured saturation median is 3.1-10.8 (signalstats SATAVG). Desaturate bright clips toward that.
- **Dark mid luma**: Keep average luma dark-mid. Measured YAVG median is 52-73 out of 255.
- **Crushed blacks**: Crush the blacks. Let edges fall to black under the vignette.
- **Per-clip tints**: Tint single clips teal, red, sepia or yellow to mark mood or a flashback. One tint per clip.
- **Normal grade on sensitive clips**: Sensitive or stock footage keeps the normal dark Abyssal grade; cover faces with mosaic/blur. No inverted, mirrored or posterised colour looks on clips at all, intro included; clips keep only the normal Abyssal grade. (owner 2026-11-12, storyboard v6)
- **No cyan**: No cyan anywhere (SOP 2.4 ban). Title colour comes from the redesign.
- **Red for danger**: Use red for the date cursor block, money/stat numbers, censored words, arrows and circles.
- **Yellow for the key line**: Use yellow highlighter on the key phrase in an article. Use yellow for the second speaker in captions.
- **Orange or red name box**: Use an orange (or red) box with dark mono text for name tags in case videos.
- **Bright grade, no grain**: Grade: do not darken clips. No 0.92 dim, light vignette only (about 15 %). NO grain or noise layer on clips or cards: a fixed grain over a moving/pushing picture reads as moving static lines. Keep the v6 colour balance (owner 2026-11-13: 'rest colorgrade was good'). *(set by you)*
- **Body grade numbers**: Body grade: crushed blacks (p5 about 4), footage luma about 63, p95 about 190, saturation about 29%. Two thirds of footage is untinted; tints are red 15%, sepia 7%, teal 5%, B&W 5%. Red or sepia go mainly on photos.
- **Abyssal grade on every shot**: Every shot gets the Abyssal grade: black pin, low saturation (about 0.40), S-curve, heavy vignette (corners 0.12-0.31 of centre), tint per shot (none 66%, red 15%, sepia 7%, teal 5%, B&W 5%). Keep details visible. *(set by you)*
- **Grade finish**: Grade finish: local contrast for detail, cool shadows and slightly warm highlights, soft warm halation on bright areas, fine film grain. No black holds as shots; use a 0.5 s dip through black. *(set by you)*

## 4. Lighting

Footage is used as found. Graphics glow out of darkness.

- **Keep found light**: Do not relight or brighten found footage much. Keep night CCTV and dashcam dark.
- **Red host room**: Light the host room red and low, with the evidence board behind.
- **Vignette**: Use a strong vignette on every shot to pull the eye to the centre.

## 5. Camera angles

Angles come from the source: CCTV high angle, dashcam forward, phone POV.

- **Show the source angle**: Keep the real CCTV/dashcam/phone frame. Do not crop out timestamps or the camera's own overlay unless they reveal private data.
- **Vertical clips**: Centre vertical phone clips on a blurred or dark copy of the clip. Or show 2-3 as narrow side-by-side strips.
- **Host medium shot**: Frame the host in a static medium shot, chest up, evidence board behind.
- **Stills full frame**: Do not build article, web or headline screenshot graphics. (owner 2026-11-12, v4)

## 6. Camera movement

Little real movement. Slow digital zooms on stills; shake comes from the source.

- **Photos drift**: Photos always drift slowly (master SOP 7.4). Add typed text, a highlight wipe, a red circle or a colour change on them. The case list, the case title card and maps carry the bigger camera moves. — examples: [NAMETAG_BOX · 2TAT 0:38 (8.0 s)](media/f990578520ee4605.mp4), [PHOTO · 7UjU 2:36 (3.2 s)](media/7efa29ebff564dca.mp4)
- **No list scroll**: Do not scroll the case list; hold it 3.4-3.6 s with the text frozen in place (only the backdrop may drift slightly) and glitch out. A long page may scroll only if the inset photo must grow with it. — examples: [ICEBERG_LIST · 2TAT 0:18 (4.4 s)](media/0d0846e8daca49f2.mp4), [ICEBERG_LIST · C8Tv 0:23 (4.3 s)](media/d170d81df9e64a29.mp4)
- **Punch-in on the detail**: Zoom in on the key person or object in CCTV, then add a red arrow, circle or spotlight.
- **No fake shake**: Never add camera shake to footage clips. The only added shake is the very slow gentle shake on the case title card. (owner 2026-11-12, v5)
- **Static host**: Keep the host camera locked.
- **Freeze before impact**: Freeze or cut away just before the worst moment. Censor what follows.

## 7. Shot composition

Centred, dark-edged frames. Tiny mono text in fixed corners.

- **Fixed corners**: Put the date top-left (or big in the centre), the source credit bottom-left, the safety note bottom-right, the captions bottom-centre.
- **Centred titles**: Centre level cards and entry titles.
- **Blur fill**: Fill unused frame around vertical clips and small photos with a blurred copy of the same image.
- **Photo inset**: Show a person's photo as a small inset over a blurred copy of itself, or as white-bordered stills side by side with tiny caps names below.
- **Split screen**: Use vertical split panels to compare two or three clips or people.
- **Censor in frame**: Place mosaic blocks tight on faces, bodies and plates. Use black boxes on names in screenshots.
- **CRT window for old web**: Show old-internet pages inside a glowing CRT or old-Mac window.

## 8. Editing rhythm

Hard cuts, about 6-7 per min in the body; the intro is much faster.

- **Body pace**: Average shot length is 5.0-7.6 s (median ~6.0 s, about 10 cuts/min) in all 14 refs, measured with glitch bursts merged. Shots without glitches average 5.5-7.7 s.
- **Real shot length**: Hold most shots about 3-8 s; never under 3 s, no exceptions. Hold the first case of a video longer. (owner 2026-11-12, v4)
- **Fast intro**: Cut the first 2 min fastest: about 30-50 cuts in the first 120 s (median about 38).
- **Level 1 early**: Land 'Level 1' at 24-47 s. Do not let the intro run long.
- **Teaser montage**: Build the teaser just before the first case from real raw case clips, each >= 3 s (no 1-2 s shock clips). (owner 2026-11-12, v4)
- **Fast CCTV**: CCTV and dashcam incident runs also keep every shot >= 3 s (no fast-cut exception). (owner 2026-11-12, v4)
- **Hold screenshots**: No article-screenshot holds (no web/headline graphics); show real footage instead. (owner 2026-11-12, v4)
- **Level seam**: At each level change: about 1 s black, 0.7-1 s silence, then the Level card.
- **Level timing**: Space the levels so Level 2 starts at about 4-6 min, Level 4 at about 15-19 min, and Level 7 in the last 15-20 min.
- **Entry length**: Make each entry about 2 min: median 126 s (middle half 102-152 s, n=335), about 21 shots per entry. Deeper levels run longer: Level 1 ~109 s, Levels 6-7 ~135 s.
- **Entry count**: Use 16-32 entries per video (median ~22; one 87-min ref has 50). Videos run 43-67 min with 374-693 shots.
- **Glitch count**: Use glitch cuts often but short: 3-89 per video (median ~42), each 0.2-0.3 s, about 0.7% of screen time.
- **Case body pace**: Case body pace: refs cut about every 3 s (median per-ref ASL 3.6 s, pooled 2.6 s). Owner rule wins: every clip at least 3 s, so aim for 3-4 s clips with 6-7 s holds only on slow reveals.
- **Case body mix**: Case body mix: about 73% footage, 11% designed graphics, 7% photos, the rest host. About 4 graphic events per minute (normal range 2-10). The last shot of a case is footage (11 of 14).

## 9. Transitions

Hard cuts by default. Black dips at seams. Glitch bursts for shocks.

- **Hard cuts**: Use hard cuts for nearly every edit.
- **Black dip at levels**: Dip to black for about 1 s before each Level card.
- **Entry title motion**: Entry title motion (new design from the refs, pending pilot). Not a cyan glitch-scramble ice title (SOP 2.4 ban). Keep: after a short black, centred at about 43-50% height, one or two lines, 25-50% of frame width, hold 1.5-3.5 s, eased in and out. — examples: [ICE_TITLE · 2TAT 2:37 (5.7 s)](media/b70335c08de74e6d.mp4), [ICE_TITLE · 7UjU 2:04 (4.1 s)](media/370c2222f5aa4d8e.mp4)
- **Glitch sting**: Use a 2-3 frame glitch cut only for shock cuts; no static-noise bursts over footage (static lives on the warning card only). (owner 2026-11-12, v5)
- **Level card motion**: Start with 0.7-3.0 s of black, then fade the level card (new design from the refs, pending pilot) in over 3 frames from 20-40% brightness. Centre it at y 50% over the level backdrop (no berg graphic). Push it in over 1.2-2.5 s, then zoom through in 3 frames into the first entry title. — examples: [LEVEL_CARD · 2TAT 0:33 (4.8 s)](media/ab97eca10e7449f9.mp4), [LEVEL_CARD · 7UjU 0:33 (5.9 s)](media/1f79eb880f214b8b.mp4)
- **Soft dissolve rarely**: Between calm stills or state/place cards use a dip to black, never a dissolve. (owner 2026-11-12, v4)
- **No posterise flash**: Shock moments use a dip, a red circle or a short dark glitch cut, never a posterised/inverted flash. No inverted, mirrored or posterised colour looks on clips at all, intro included; clips keep only the normal Abyssal grade. (owner 2026-11-12, storyboard v6)
- **Only two wipes**: Use no spins or light leaks. Allowed exceptions: the 3-frame zoom-through from the level card into the first entry title, and the raven/silhouette wipe onto the Patreon card.
- **Body transition mix**: Case body transitions in the refs: dissolve about 50%, glitch tear about 25%, hard cut about 20%, dips almost never. With the owner rules: 0.5 s (15 f) dissolves are the main soft join, glitch tears 2-3 f, hard cuts on raws and reveals.
- **Eased MG motion**: Every MG moves with easing, never linear: push-in easeInOutSine over the clip; circles draw on 0.45 s easeOutCubic; arrows slide in 0.35 s easeOutBack; labels fade + slide 0.38 s easeOutCubic; red words scale 1.08 to 1 in 0.30 s easeOutExpo; all MG exit 0.25 s easeInCubic. *(set by you)*

## 10. Typography

Tiny monospace type for small text. Level cards and entry titles use new fonts from the refs (no typewriter, no glowing cyan).

- **Mono base**: Set dates, tags, credits, captions and list rows in a monospace font, caps.
- **Small**: Keep most text small. Only 'Level N' and big centre dates are large.
- **Level card type**: Level card type: a new font chosen from the refs. Not typewriter (SOP 2.4 ban).
- **Entry title type**: Entry title type: a new font and colour chosen from the refs, 1-2 lines, centred. Not wide-tracked glowing cyan caps (SOP 2.4 ban).
- **Typed-on**: Type dates and captions on letter by letter or word by word.
- **Red cursor**: End a typed date with a red block cursor on the last character.
- **Caption colours**: Captions for found audio: white for speaker 1, yellow for the reply. Bracket sounds: '[screaming]'.
- **Censored words**: Show censored words in red mono with asterisks ('M*rd*rs'), even in titles.
- **Highlights wipe**: Wipe every highlight band left to right, never pop it: about 3 words/s (one line in 1-3 s), starting 0.4-1.5 s after the cut. Yellow/amber for key text, red for danger words. Draw the band as an amber marker with a thin dark lower edge, text left readable on top. Alternative: a yellow double-arrow underline (about 35% frame wide) that steps down one line every ~2 s, matched to the spoken words. — examples: [SOCIAL · 7UjU 3:40 (8.0 s)](media/9f45efe99523405d.mp4), [HL_YELLOW · c43R 4:36 (8.0 s)](media/fd1858c738294a3d.mp4)
- **Typing speed**: Type dates, credits and quotes at 1-1.5 characters per frame at 10 fps. Swap caption lines hard, about 1.8 s each.
- **Case list: no highlight, CRT**: Case list card: no highlight on any case name (all the same white). Static CRT look on it: fixed scanlines, soft glow, small red/blue edge, curved screen with dark rounded corners. No noise, rolling bar or flicker. Slow eased zoom, no shake. *(set by you)*
- **Case list: CRT plus vignette**: The case list card gets a strong smooth vignette on top of the CRT look. The centre stays clean. The edges go about 55 % darker. *(set by you)*
- **Font matches**: Fonts (best installed match, by eye): date card Consolas Bold +5% tracking white with 1-2 px dark edge; name tag Lucida Console caps +8% tracking; captions Courier New Bold white with 1-2 px black edge. Case title and level card fonts come from the redesign: no cyan glow (SOP 2.4 ban).

## 11. Music and sound

Quiet master, low drone bed, raw clip audio on key moments, true silence at seams.

- **Quiet master**: Master around -21 to -25 LUFS integrated. Refs measure -20.2 to -27.6 LUFS (median about -22.5).
- **Louder intro**: Make the first 90 s about 2-5 LU louder than the body (refs: intro -18.5 to -22.8 LUFS).
- **Drone bed**: Run a low, dark ambient drone or music bed under all narration. Keep it well under the voice.
- **Raw audio on key clips**: Drop the narration and let raw clip audio play in the hook and at the key moment of each incident.
- **Silence at seams**: Leave about 1 s of true silence at each level change and 1-3 s at the very end.
- **Bleep swears**: Bleep swearing in raw audio.
- **Sound on events**: Put a high-band static tick (+24 to +35 dB above the bed, measured) on every glitch cut. Put a low boom (+17 to +24 dB) on full date cards, red numbers and the Patreon wipe. Put a high riser (+17 to +30 dB) into highlight wipes, arrows and spotlights. Leave captions, credits, safety notes, circles, splits and black boxes silent. — examples: [GLITCH · 2TAT 0:10 (2.5 s)](media/5a7c5491a2a0481a.mp4), [GLITCH · 7UjU 0:22 (2.5 s)](media/24fe06eaece64a84.mp4)
- **Low LRA**: Keep the loudness range moderate (refs 3.5-9.3 LU). No loud jump scares.
- **Narration on top**: Keep the narrator clear and steady above the bed at all times.
- **Body drone level**: Bed: a dark horror ambient music bed (K Background Music 8/9/10, one track per case, rotating, 0.8 s crossfade at case turns) about 11 LU under the voice, heard mainly in the pauses. It runs under the intro too (owner 2026-11-14, replaces 'never in the intro' from v13). Out under the title music; -6 dB under raw clip sound.
- **Card hits and raws**: Hits: the case title card and the date card each get one short low boom about 10-13 dB over the voice level. Raw clip sound 1-2 times per case, about 3-10 dB over the voice, entered and left by a dissolve or glitch.
- **Owner mix levels**: Owner mix 2026-11-13: narration 100%, music 80%, SFX 60%. SFX low but audible. Narration always on top. *(set by you)*

## 12. Storytelling

Fixed iceberg script: hook, 7 levels, calm date-first case stories, Patreon level eight.

- **Open**: Open with: warning card (2-3 s), VO hook over real raw footage (no raw audio in the intro, master SOP 7.1), animated case list for the N-cases line, teaser of raw clips (>= 3 s each), then the first case title card. No Presents sting.
- **Hook line**: Say the count and the frame: 'N <things>, seven levels... let's start at the tip of the iceberg'.
- **Host claim**: Optional: one first-person line of effort ('I've personally searched through countless videos...').
- **Entry order**: Each entry: level card when a level starts, spoken title, entry title card, typed date, name tag, then the story.
- **Date first**: Start each story with the date and place ('On June 30, 2014, in ...').
- **Story arc**: Date/place/person -> ordinary moment ('had no idea') -> 'However,' -> incident -> investigation -> legal outcome or open question.
- **Short past tense**: Write short, past-tense, third-person sentences. Use exact numbers and facts.
- **Mid CTA**: Before Level 4, add one short subscribe line ('subscribe and stay with us').
- **Mystery entries**: For mysteries add theories and a question hook ('Mystery solved? ...'), then leave it open.
- **Outro**: End with: 'tip of the iceberg' line, next-iceberg teaser, Patreon 'level eight' plug ('link in the description'), black card 'THANKS FOR WATCHING'.
- **Or stop cold**: For dark mystery topics you may stop on the last unresolved fact with no recap (3 of 14 refs).
- **Entry opener**: Open each entry on its entry title card (210 of 335 entries in the refs). Otherwise open on stock, archive footage or a photo, with the title said in voice-over.
- **Shot mix**: Fill screen time mostly with real footage: archive/documentary ~29%, stock ~18%, photos ~10%, host ~7% (0-14%; 5 of 14 refs have no host), CCTV ~5%, dashcam ~4%, phone ~3%. Cards and titles are under 5% in total.
- **Case opening order**: Case opening order: title card about 3 s, the date types on 3-5 s after the title starts, then footage; the name tag sits on the first photo or interview shot of the person, 0.2-1.5 s in, held 2-3 s.

## Motion graphics (which one, when)

Small fixed kit, all mono, dark and VHS-textured. Things move in only 4 ways: typing (1-1.5 characters per frame), left-to-right highlight wipes, 2-3 frame glitch cuts, and fades through black. Stills hold still. Sound sits on events: glitch ticks on cuts, low booms on dates, numbers and wipes, risers into highlights.

### Which graphic for which moment

Find what the narration is doing. Pick the first graphic that fits. "no" = does not fit Abyssal Detective, do not use it.

| Narration does | Graphic | Use it when | Why | Not when | Fits Abyssal Detective |
|---|---|---|---|---|---|
| Show the real page, post or document | Article screenshot | Proving a fact or outcome. | - | Do not show it small or without a highlight. Do not freeze it fully still. Owner v4: do not use in Abyssal edits (no website/headline graphics). | yes |
|  | Social/web screenshot | Internet cases. | - | Do not show real usernames of private people. Owner v4: do not use in Abyssal edits (no website/headline graphics). | - |
|  | CRT window | Old-internet mysteries. | - | Do not use for news articles. | - |
| Read a quote, comment or message | Raw-audio caption | Hook and any found audio. | - | Do not put a box behind it. | yes |
|  | Quote card | A person's words from a post or video. | - | Do not use over clean footage. | yes |
|  | 911 audio meter | Emergency calls and audio-only evidence. | - | Do not leave a still frame without motion. | - |
| Name a place or move to a new place | State/place card | Place-based icebergs. | - | Do not use maps instead. Owner v4: no crossfades or dissolves; enter by hard cut or dip to black. | adapt: no ice texture (SOP 2.4 ban); plain dark backdrop |
| Give a date or time | Typed date | First beat of every entry. | - | Do not show a date without the type-on. Do not use a serif or smooth font. | yes |
|  | Time jump | Skipping time inside a story. | - | Do not use a clock animation. | - |
| Introduce a person or account | Inset on blur | Single photo of a person or object. | - | Do not leave black bars. Owner v4: no crossfades or dissolves; enter by hard cut or dip to black. | yes |
|  | Name tag (plain) | Newer videos and interview subjects. | - | Do not mix both tag styles in one video. | adapt: monospace, not typewriter (SOP 2.4 ban) |
|  | Name tag (box) | First time a person appears in case videos. | - | Do not reuse for the same person twice. | - |
|  | Photo ID card | Two or more people in one case. | - | Do not tilt it or add 3D. Do not put several photos side by side. | - |
|  | Host cutaway badge | Mid CTA and host seams. | - | Do not cover the host's face. | - |
| Show a video in its context (platform, CCTV, phone, file) | Vertical clip fill | Phone, TikTok and livestream clips. | - | Do not stretch to fill. Owner v4: no crossfades or dissolves; enter by hard cut or dip to black. | yes |
| Point at a detail | Red marker | CCTV and screenshots. | - | Do not use more than one marker at a time. Do not draw a large ring on a small subject. | yes |
| Stress a number, fact or outcome | Red number | Stress an amount or count. | - | Do not use for dates. | adapt: bold red mono numbers, not typewriter (SOP 2.4 ban) |
| Compare or show many things | Split panels | Compare or show many. | - | Do not use more than 3 panels. Do not add a border between panels. | yes |
| Something breaks, goes wrong or feels uncanny | Posterise glitch frame | Shock moments and uncanny beats. | - | Never on clips, intro included. | no: posterised looks banned (rule b-0c2444ba) and cyan banned (SOP 2.4) |
| Credit, warn or disclose | Source credit | On found clips and photos. | - | Do not make it big. | yes |
|  | End card | Last frame. | - | Do not add end-screen clutter over it. | yes |
|  | Patreon Level 8 card | End block, right after the red 'LEVEL 8' teaser iceberg. | - | Do not use a thin font or drop the glow; keep the URL box red. | yes |
|  | Warning card | First seconds of every video. | - | Do not make it big or colourful. | - |
| Hide or censor something | Safety note | On every censored or altered shot. | - | Do not leave it off censored shots. Do not move or animate it. | yes |
|  | Mosaic censor | Victims, minors, gore, private data. | - | Do not use soft blur alone on gore. | - |
|  | Red censored word | Swears and violent words in text. | - | Do not print the word in full. | - |
| Move between shots | Glitch cut | Entry and title exits, shock cuts, into the end card. | - | Do not fade or dissolve. Do not hold the glitch past 3 frames. | - |

### What each graphic looks like

- **Article screenshot** (page-3d): Newspaper crop (90-100% width, zoomed on the headline, slight vignette) or white web page (about 64% wide, 45-85% seen). Lands by hard cut, 1-frame ghost or 5-frame crossfade, then drifts slowly upward (about 10-20% of frame height in 1-2 s, then eases to a hold); one case had a ~3 degree tilt. Motion = highlighter: orange or yellow band with rounded, dark-edged ends wipes LEFT TO RIGHT behind the key line, 10-15 frames per line (28 for a slow full line), starting about 1.1-3 s in (late on web pages, about 2.5 s). Out: crossfade into footage, often with a cyan tint and an 'ACTUAL FOOTAGE' label. Sound: none at the cut; a low boom (+24 dB) may sit on the highlight start. — examples: [ARTICLE · 2TAT 13:07 (8.0 s)](media/6c2def2ce01a4b5a.mp4), [ARTICLE · 7UjU 3:22 (5.3 s)](media/2d2735af590d4a0c.mp4)
- **Social/web screenshot** (comments): Reddit/forum crop full frame (white page, slow push-in ~10% over 2 s); web page shown full frame over dark footage; phone lock-screen alerts (white mono on black, digits turn red at +2-3 s); chat bubble ~22% w x 100% h centred on a giant blurred copy of its own text; channel card lower third (~55%, rounded dark box, drop shadow) slides up in 5 frames with the name typed on; page tilted ~5 degrees over colour. Reddit handles were left readable in one clip; blur or black-box private people's names. Static hold; motion = amber marker highlight with a thin black underline that sweeps left to right, line by line (seen mid-sweep at ~3 s and done on two lines by 5 s; ~25-30 frames per sweep from +1.0-2.6 s), typing or colour change. In: 2-frame white flash, 5-frame dissolve, or glitch + hard cut. Sound: low hit +8 to +12 dB at +0.1 s (3 of 6). — examples: [SOCIAL · 7UjU 3:40 (8.0 s)](media/9f45efe99523405d.mp4), [WEBPAGE · 7WeC 8:30 (8.0 s)](media/68c4f906500041ee.mp4)
- **CRT window** (page-3d): Page shown inside a glowing blue CRT or old-Mac window with bloom.
- **Raw-audio caption** (text-card): One line of small white Courier, mixed case, lower centre, 35-45% width, thin dark outline. Hard swap per line (0 frames), ~1.8 s per line, no fade. Yellow only for the second speaker or one emphasised phrase. '[Bracketed sounds]' in the same spot (y 93-96%), Title Case ('[Continues Walking]', '[Multiple Gunshots Noises]'), 28-38% width, 1.2-2.8 s, no box, with short gaps with no caption between them. Sound: none of its own (the clip audio plays). — examples: [BRACKET_SOUND · Yy4T 6:14 (8.0 s)](media/e585927c5ffe431b.mp4)
- **Quote card** (comments): Three looks: (a) white box (~79% wide, x 10-89%, y 36-65%, slight paper texture), black typewriter text, centred, over bright blurred footage; an orange highlight sweeps the first words; (b) small white typewriter text with no box straight on a heavily darkened shot (about 85% dimmed), lines 80-95% wide, centred, a new line added every ~2 s (y 35%, 58%, 68%); (c) white pixel caps, left-aligned. Text types ~1 character per frame (a long quote ~3.5 s) or blurred glitch characters resolve left to right over ~2 s. Often over red/yellow/blue posterised footage. Ends on a cut to black or the next shot. Sound: none (4 of 6). — examples: [QUOTE_CARD · 2TAT 4:08 (8.0 s)](media/b56d98280ea843e2.mp4), [QUOTE_CARD · 7WeC 3:39 (3.8 s)](media/c65860286345457b.mp4)
- **911 audio meter** (other): Audio level meter graphic with captions while a call plays.
- **State/place card** (title-card): 'STATE - TOPIC' in condensed caps over ice texture, soft dissolve, about 3 s (KTKZ). — examples: [MAP · c43R 7:04 (8.0 s)](media/f0ffde5470614278.mp4), [MAP · C8Tv 19:01 (8.0 s)](media/edc8d14052e24017.mp4)
- **Typed date** (text-card): White bitmap/VHS mono caps with a thin dark edge, no box, about 10% of frame tall, at y 48-55% (middle of the frame). Short dates are centred (x 26-73%); long dates start at x 7% and run to about 94%. Red block cursor (about 3% wide) after the last character while typing. Types on at 1-1.5 characters per frame at 10 fps ('SEPTEMBER 24, 2024' in 1.2 s), from the cut or +0.1 s. Sits over the shot as it is (the shot may be a bright collage), so keep the edge dark for contrast. Hold 0.5-1.3 s with the cursor blinking, then fade out over 5-8 frames as the next shot fades up. Over footage: small top-left, 15-25% width. Sound: as a full card, a low boom at the cut (+18 to +24 dB, 4 of 6); as an overlay, silent. — examples: [DATE_CARD · 2TAT 12:22 (8.0 s)](media/9140ca7d456647d1.mp4), [DATE_CARD · 7UjU 2:08 (5.0 s)](media/b0d7f0990e01400f.mp4)
- **Time jump** (text-card): Mono caption ('2 Years') or a blue 'UPLOADING ..' bar with a % counter that climbs ~1% per frame.
- **Inset on blur** (image): Portrait (3:4-4:5) photo or clip centred, over an enlarged, blurred, darkened copy of itself (colour tint such as pink or B&W grain option). Vertical phone clip: ~48% width (x 26-74%), full height, hard edges. Photo: 33-48% width. Framed-photo variant: ~37% w x 80% h with a hard drop shadow ~5 px right/down. Collage variant: a portrait (~28% w, y 14-80%) beside two clips in one strip (x 14-86%). Hard cut or 3-4 frame dissolve in; inset static, background drifts slowly. Typed date: white pixel caps, ~85% width, y 49%, typed one letter per frame with a red block cursor, held ~1.5 s then gone. Name tag: black typewriter on an orange box with thin outline, ~49% width, bottom centre (y 88-95%), shown after the date. Sound: optional high riser (+16 dB). — examples: [INSET_BLUR · 2TAT 2:06 (8.0 s)](media/8dceb2ecea454cff.mp4), [DATE_CARD · 7UjU 2:08 (5.0 s)](media/b0d7f0990e01400f.mp4)
- **Name tag (plain)** (text-card): Text with no box and a thin shadow, two looks. (a) Typewriter name, pale pink-white, bottom centre (x 26-74%, ~48% width, y 88-92%). (b) Small bold sans caps name ('CRYSTAL SHELDON') over a thin rule and a small mixed-case role line ('Exotic Animal Trainer'), lower right of centre (x 56-84%, ~28% width, y 83-92%). In: fade/type over 3-8 frames, usually late (+1.8-3.5 s); one clip already shows it at +1 s. Hold 1.0-2.5 s to the shot end. Out: hard cut or digital glitch. Sound: small high-band tick (6 of 6). — examples: [NAMETAG_PLAIN · 2TAT 32:23 (8.0 s)](media/315d68310490461d.mp4), [NAMETAG_PLAIN · 7WeC 29:33 (8.0 s)](media/e54c048f40364e7f.mp4)
- **Name tag (box)** (text-card): Solid orange (or red) box with black bold Courier text in mixed case, about 38% of frame width and ~10% tall, at y 79-94% (over the bottom of the face, or directly under a centred photo card and as wide as the card). Rough ragged edge, slight dark outline or shadow. In: a thin orange line grows, then the text reveals/types, 3-4 frames, at +0.2-1.2 s into the shot. Hold 1-3 s. Out: hard cut with the shot, or a hard drop-out while the shot keeps playing. Sound: at most a small glitch/static tick. — examples: [NAMETAG_BOX · 2TAT 0:38 (8.0 s)](media/f990578520ee4605.mp4), [NAMETAG_BOX · 7UjU 12:17 (3.3 s)](media/00a0d6a8478943a4.mp4)
- **Photo ID card** (image): One still at a time, centred: card ~36-38% of frame width x ~73-78% tall, thin white border (~1%), a hard black shadow on the right edge (~2%), over a giant blurred copy of the same image. The name sits under it in tiny white pixel caps (~3.5% tall, ~32% wide) or in an orange tag as wide as the card. Static hold ~1-3 s, then a hard cut to the next person's card. For two or more people, show their cards one after another, not side by side. — examples: [PHOTO · 7UjU 2:36 (3.2 s)](media/7efa29ebff564dca.mp4)
- **Host cutaway badge** (ui-typing): Small subscribe/channel badge bottom-left on host cutaways. — examples: [HOST · 2TAT 47:14 (8.0 s)](media/0f459343928e4791.mp4), [HOST · 7UjU 0:30 (4.3 s)](media/be24969b0aa44cf6.mp4)
- **Vertical clip fill** (raw-footage): 9:16 clip centred at 25-40% width and 70-100% of frame height, sides filled with an enlarged blurred copy (often near black with soft colour blobs; side flare/colour drift allowed). Hard cut, a 1-frame datamosh glitch, or a 3-frame dissolve; centre static or grows about 1% over 2 s. Sound: optional mild riser or low hit. — examples: [VERTICAL_FILL · 7WeC 3:10 (2.5 s)](media/70c042a98680475b.mp4), [VERTICAL_FILL · c43R 3:28 (8.0 s)](media/81b425839ad64638.mp4)
- **Red marker** (other): Highlight bar: red/crimson band (25-67% width, about 7% tall, rounded inked edges, dark text stays readable through it) wipes LEFT TO RIGHT behind the line, ~0.7 s per line, from 0.1-3.0 s after the cut; line by line on phone alerts. Arrow: flat/glossy red, 4-17% width, pops in over 1-3 frames 1.5-3.7 s after the cut (clip 2 shows it at about 5 s), pointing at the subject. Hand-drawn variant: red pen loop plus arrowhead, about 40% wide, line 2-3% of frame, on a zoomed shot. Circle: thin ring, no fill, white or red, sized to the subject (5-25%; as small as 5% on CCTV), present from the cut, may drift to follow a moving subject. Spotlight: soft disc 35-45% width, rest dimmed to near-black, 1-frame flash at the cut. All hold to the shot end. Sound: high-band riser +17 to +30 dB into highlights, arrows and spotlights; circles silent. — examples: [HL_RED · 7UjU 6:40 (5.4 s)](media/c3459f2ea8914674.mp4), [ARROW · 7WeC 35:36 (8.0 s)](media/133d50c9c64f42ba.mp4), [CIRCLE · 2TAT 1:38 (8.0 s)](media/ee59716cf7cd4209.mp4), [ARROW · c43R 2:12 (8.0 s)](media/7c88623cfcd247bf.mp4)
- **Red number** (text-card): Bold red typewriter/mono numbers ('65,000 texts', '£450', '$600,000'), centred at y 46-58%, no backing, often on a blurred phone or photo. Width follows the text: about 14% for a short figure, about 47% for a number plus a word. Fade/flicker in over 2 frames, ~2-5 s after the cut, held to the end of the shot. Sound: low boom (+17 to +20 dB) at the cut (3 of 6). — examples: [RED_NUMBER · 7WeC 8:49 (8.0 s)](media/7fe83f99671b432a.mp4), [RED_NUMBER · C8Tv 1:24 (8.0 s)](media/944834e420ec40f4.mp4)
- **Split panels** (layout): Hard 50/50 vertical split (seam at x 50%), no border or gap, two tall crops (each about 50% x 100%, near square). Hard cut or glitch in, static 3+ s. One side may grade to deep red (crimson, crushed blacks) over about 0.8-1 s while the other goes black and white and high contrast. An orange name strip may show for the first second. Out: red/blue block glitch tear for 2-3 frames, then hard cut. Sound: none (5 of 6). — examples: [SPLIT · 2TAT 46:02 (8.0 s)](media/dfdc896dc16a4b63.mp4), [SPLIT · 7UjU 1:45 (3.6 s)](media/a0753cd852f54a6a.mp4)
- **Posterise glitch frame** (glitch): Full-frame quantise to 3-6 flat colours (black, white, cyan, royal blue with a little green; or red/yellow/black/white/cyan), soft blobby edges, no grain, footage keeps moving. A slice/tile glitch leads in over 2-4 frames. It can hold 2+ s to the shot end, also as a backdrop behind a photo card, or flash as a 2-frame threshold glitch. Sound: high riser +17 to +30 dB when it starts on the cut. Owner 2026-11-12: do NOT use on clips (no inverted/mirrored/posterised looks anywhere); ref note only. — examples: [POSTERISE · 2TAT 3:42 (8.0 s)](media/9983d62c31a84fdb.mp4), [POSTERISE · 7WeC 35:44 (5.3 s)](media/7d7be93b379340ab.mp4)
- **Source credit** (text-card): Tiny white mono caps ('COURTESY: ...'), 8-15% width, top-right or bottom-left. Present from the cut, static for the whole shot, silent. Rarely typed on 1 character per frame. Variant seen: a dark-navy box with white bold sans caps 'NAME / OUTLET', about 32% wide and 5% tall, top-right (x 68-100%, y 7-12%), static while the picture zooms, gone at the next shot. That one may be part of the source clip. — examples: [CREDIT · KTKZ 8:06 (8.0 s)](media/be7bfc1c78a141c6.mp4)
- **End card** (title-card): 'THANKS FOR WATCHING' in white pixel mono caps, about 48% width (x 26-74%), text band y 10.5-15.5% from the top, centred, on pure black (faint TV static at most). Before it: a 3-frame colour glitch of the last shot. In: hard cut with grey text for 1-2 frames, white by +0.2 s (or 3-5 frame fade from black). One 1-frame scrambled-text glitch at ~+1.4 s. Otherwise the text sits perfectly still. Hold 4+ s (6-7 s seen). Sound: drop to near silence at the cut, a +17 dB static burst on the glitch frame. — examples: [END_CARD · 2TAT 47:43 (7.6 s)](media/f0c4c325dd1144c0.mp4), [END_CARD · 7UjU 47:43 (8.0 s)](media/9a278fee61dd4b04.mp4)
- **Patreon Level 8 card** (title-card): Dark grey cracked-stone frame with vignette. Bold rounded white sans with soft white glow and black drop shadow, all centred: 'Level 8 of every episode is now available' (2-98% width, y 44%), 'on' + a red box with an orange-yellow glowing edge holding the Patreon URL (box x 18-92%, y 54%), small '(link in the description)' (about 30% wide, y 85%). In: a 3D raven (or cyan-edged shark silhouette) flies across the red 'LEVEL 8' iceberg and wipes it off in 4-6 frames. Hold ~2-3 s. Out: fade down to black over about 1 s (8 frames at the end), 1 pink/blue glitch frame, hard cut. Sound: low hit +8 to +11 dB on the wipe, not on the cut. — examples: [PATREON · C8Tv 41:41 (3.5 s)](media/c9a46a2985ba4f9d.mp4), [PATREON · QV69 54:50 (7.7 s)](media/e10c0f42720c4c78.mp4)
- **Warning card** (title-card): Black VHS-noise frame. Bands of white dash-noise and grey horizontal smear scroll over the top and bottom edges. Grey-white pixel caps, no box: 'WARNING:' (~25% width, centred, y 44%) blurs in at +0.2 s, 'FLASH IMAGE SHOWN' (~58% width, y 56%) at +0.5 s. Text garbles for 1-2 frames at irregular moments. Hold 4-5 s in total (owner 2026-11-12 overrides the refs' 6.9 s), hard cut out into the raw-audio hook. No Presents text after it. Sound: no hit at the cut; a small high-band tick (+10 to +25 dB) as the text appears. Variant: 'VIEWERS DISCRETION IS ADVISED' + red WARNING over a small iceberg, 0.6 s blown static, 2 black frames, red 'FLASH WARNING' skull. — examples: [WARNING · 2TAT 0:00 (8.0 s)](media/f5a10a4bc9994151.mp4), [WARNING · 7UjU 0:00 (2.5 s)](media/869f30b6c4864e85.mp4)
- **Safety note** (text-card): 'VISUALS ALTERED FOR VISUAL SAFETY' in tiny bold white caps (about 2.5% of frame tall), bottom-right at the very edge: x 66-99%, y 96-98%. 30-34% of the video area's width, no box, over the footage with a soft dark vignette behind it. Present by +0.4 s, static for the whole shot, silent. When the video is an inset, keep it at the inset's bottom-right. — examples: [SAFETY_NOTE · uINK 1:46 (8.0 s)](media/a2db7a7911db4a3c.mp4)
- **Mosaic censor** (other): Square pixel blocks, cells ~3-4% of frame width, tight on faces (block ~18% wide for a child in a group photo, up to ~25-30% for a close face), bodies and plates. On a still it is present from the first frame, tracks the subject as the photo drifts, static to the end. On moving footage small blocks can start on the edges and a large block (~42% wide, ~75% tall) covers a window or body by ~3 s. Usually with the safety note. Variant: full-frame pixel ramp, 1 frame in, peak at ~0.7 s, eases to blur over ~1.5 s. Sound: low boom (+20 dB) only on heavy reveals (2 of 6); else none. — examples: [MOSAIC · 2TAT 28:52 (8.0 s)](media/998fed5bdb1a4b3b.mp4), [MOSAIC · 7UjU 0:07 (8.0 s)](media/7a75bec8c96b497a.mp4)
- **Red censored word** (text-card): Red bold word or phrase (asterisk censoring 'M*rd*rs'). Two looks. (a) Key phrase in red (about #E8262A) inside a white bold sans 2-line headline on a black band (~92% wide, x 4-96%, y 40-60%) with a tiny grey caps source tag above the first line; the red phrase ends the second line. (b) Bold red mono/slab caps with dark outline, lower left (x 5-63%, y 85-92%), letters scrambled for the first frames then resolving, gone by ~1.6 s. Fades in over 2-10 frames, placed 1.8-3.9 s after the cut. Sound: none. — examples: [RED_WORD · 2TAT 5:39 (7.7 s)](media/9d5434e55a944bb6.mp4), [RED_WORD · 7UjU 35:05 (2.5 s)](media/d7fec065e8fe4d23.mp4)
- **Glitch cut** (transition): 2-3 frames (0.2-0.3 s) between two shots: RGB-split scanline tear, blocky pixel corruption of the whole frame (cells ~4% wide, white/blue/black with magenta and green specks), black frame with white horizontal bars, colour smear, or a 1-frame blown white/cyan flash. Starts at the last frame of the old shot; hard cut to the new shot at +0.1-0.2 s, no fade. 3-89 per video (median ~42). Sound: high-band static spike +24 to +35 dB on the cut (5 of 6). — examples: [GLITCH · 2TAT 0:10 (2.5 s)](media/5a7c5491a2a0481a.mp4), [GLITCH · 7UjU 0:22 (2.5 s)](media/24fe06eaece64a84.mp4)

## Open learnings

- 2026-11-12: The warning card is small and grey, and the static sits at both top and bottom edges, not only the lower half.
- 2026-11-12: The title text fades from white to cyan across the line, and the entry ends by going to black.
- 2026-11-12: The typewriter name tag is wider (about 48%) and sits near the bottom (y 90%); the sans tag sits right of centre.
- 2026-11-12: The red phrase is bold sans inside a white headline on a black band (4-96% wide, y 40-60%); the lower-left red caps variant scrambles in and fades out within about 1.5 s.
- 2026-11-12: On a very dark shot the text needs no box; on bright footage it sits in a white box with a blur-to-sharp reveal.
- 2026-11-12: The inset can be full height at ~48% width for vertical video, or a multi-photo strip; the date types in pixel caps with a red block cursor and the name tag is a black typewriter on an orange box.
- 2026-11-12: Highlights are an amber marker band or a yellow double-arrow underline that moves one line at a time with the voice, not a pop-on box.
- 2026-11-12: The title is sized to the picture under it: about 52% of frame width over full-frame footage, about 37% (the width of the clip) over a vertical clip.
- 2026-11-12: A credit can also be a dark-navy box with white bold sans caps, about 32% wide, top-right. It may be burned into the source clip.
- 2026-11-12: Bracketed sound captions are Title Case, about 28-38% wide, at y 93-96%.
- 2026-11-12: Width depends on the text: about 14% for a short figure, about 47% for a number plus a word.
- 2026-11-12: The vertical clip is 25-40% wide; the sides can be nearly black with soft colour blobs.
- 2026-11-12: The text stays perfectly still for the whole hold; no static was visible in the sampled frames.
- 2026-11-12: The list is centred in two loose columns over the iceberg, and the deeper rows are blurred so it reads as a tease.
- 2026-11-12: The date may be centred or start at the left edge, can run nearly full width, and sits over the footage at mid-height with a red block cursor.
- 2026-11-12: The safety note sits right on the bottom edge, bold and small, and stays on while the shot plays.
- 2026-11-12: The page is not still: it scrolls slowly up, and the highlight starts about 2-3 s in on a scrolled web page.
- 2026-11-12: A circle can be a tiny ring that tracks a moving subject, and arrows can be hand-drawn pen loops with an arrowhead.
- 2026-11-12: The red grade turns the left panel crimson with crushed blacks while the right goes black and white, and the exit is a glitch tear.
- 2026-11-12: The URL box is red with an orange glow edge, all text is centred, and the card fades down after a hold of about 2-3 s.
- 2026-11-12: The black lead-in can run to about 1.5-2 s, and the title is white wide caps with cyan-tinted letters and glow.
- 2026-11-12: The Level card sits on the full iceberg picture, not on black. Only the lead-in and lead-out are black. The first ice title is white sans caps with a cyan glow, about 37% wide at y 45%, typed on with a glitchy letter scramble.
- 2026-11-12: Tag is wider than first noted (~38% of frame width, same width as a photo card when under one) and is ~10% tall. In clip 1 it dropped out about 2 s later while the same face stayed on screen, so it is not always held to the end of the shot.
- 2026-11-12: On a photo the mosaic is there from the first frame and tracks the faces. On moving footage it can grow into a large block (~42% of frame width) over a window or body. Face blocks are ~18% wide for children in a group photo.
- 2026-11-12: The highlight is an amber marker with a thin black underline that fills left to right line by line and stays. Page stays full frame with a gentle zoom. Usernames were not blurred in this clip.
- 2026-11-12: Photo cards are single, centred, ~38% wide, over a giant blurred copy of the same picture. Name is either an orange tag or tiny white pixel caps (~3.5% tall) under the card. A hard black shadow on the right edge is used.
- 2026-11-12: Posterise can hold for several seconds under a photo or on footage, not only a few frames. Edges are soft blobs. Slice or tile glitch leads in.
- 2026-11-12: A glitch cut can be pixel-block corruption of the whole frame, not only an RGB scanline tear. It comes at the very end of the old shot and the next shot starts clean.
- 2026-11-12: Warning length in 5 more refs: 2.4-7.0 s (newer logo open 2.4 s; two-card 4.0 s; old W card 7.0 s). Owner's 4-5 s matches the two-card 3PY5 open; out = hard cut, optional 1-frame white flash.
- 2026-11-12: Refs show the 'N cases, 7 levels' line over a static iceberg-list still: cut in on the number word (+0.1 s), 4.5 s hold, zero motion, hard cut out. Owner wants a headline montage instead: keep the cut-in on the number, add 1-1.5 s headlines with 3-5% linear push-ins and 12-15 f crossfades.
- 2026-11-12: First case card in refs: black dip 1.1-2.2 s, fade-in 0.5-1.0 s (linear, soft ease-out landing), hold 0.5-1.0 s, ease-out zoom-through 0.6-0.7 s to a title held ~3 s, then footage on the first spoken place (+-0.1 s). Q393 types 'Chapter 1: <name>' on ONE card (3.6 s) = model for 'CASE 01 + name'. B_hr types the date ON the footage. Card text appears <=0.3 s before it is spoken.
- 2026-11-12: Picture follows narration in refs: every concrete noun (place, person, object, date, document line) gets its own shot or label, cut within -0.4..+0.5 s of the word (median 0.0, worst +2 s). Names = tag on photo, places = tag on location shot, documents = article crop with the spoken line highlighted, dates typed in sync with the words.
- 2026-11-13: Owner 2026-11-13 (v13 intro): NO stock footage (Pexels or any free stock). Use only real event / place footage from the case sources.
- 2026-11-13: Owner 2026-11-13 (v13 intro): this video (theme park disasters) is NOT an iceberg video. Do not use iceberg pictures or an iceberg list here.
- 2026-11-13: Owner 2026-11-13 (v13 intro): no raw footage sound in the intro, and no background music or drone bed under it. Narration plus one SFX per cut only.
- 2026-11-13: Gap-fill study (case body, audio, grade, fonts) measured on all 14 refs. Where refs and owner notes clash (clips under 3 s, bed in the intro, stock footage, iceberg devices), the owner notes win.
- 2026-11-13: Storyboard v1 rejected: raw ungraded stills, too few motion graphics. Next builds: real styled frames, ref grade, many varied MG, side-by-side ref check before showing the owner.
- 2026-11-13: v2 notes: shot 35 was a black hold (remove black shots), shot 28 face not fully blurred (cover the whole face), grade needs more finish, MG need good easing, mix narration 100 / music 80 / SFX 60.
- 2026-11-13: Mix 100/80/60 means track sliders: each track keeps its normal level (drone about 14 dB under the voice), then music x0.8 (-1.9 dB) and SFX x0.6 (-4.4 dB). Not a percent of voice loudness.
- 2026-11-14: Owner said 'use articles graphics and 3d man'. This overrides 'No web or headline graphics' for abyssal-01. Add one real article card per case (3D perspective, highlight wipe) and a 3D man figure for scale beats.
