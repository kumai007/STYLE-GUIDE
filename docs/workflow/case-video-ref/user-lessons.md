# User lessons (the correction log)

Every correction Ayush gives on a case video lands here, once, as a rule. **Read this file before writing any
storyboard, and check the storyboard against every line before showing it.** A lesson that was broken again gets
`(repeat N)` added, which marks it as the first thing to check next time.

Format: `- rule | why | instead of | check`

## Picture follows the narration
- Every shot has a reason in the clause it sits under; write the reason in the storyboard | he rejected "random" clips with no note | filling holes with whatever footage is handy | each storyboard row names the clause and the reason
- Cut raw footage with no story value ("nice pedal", pitching chatter, naps, scenery) | it kills the pace | keeping a raw clip because it is real footage | every raw clip in the storyboard has a "keep because" note
- Creator named → show the creator: their channel page (avatar = their photo), then their own face from their video | he asked for the creator's photo whenever they are named | a generic ID card or no picture | every first naming of a creator has a channel/face shot on that clause
- Place named → show the place: a real photo of it, or the creator's own footage of it, with a VCR location title | he asked to see the place | a map on every place | every named place has a picture on that clause
- ~~Map only when the sentence is long enough (about 8 s)~~ OVERRIDDEN 2026-11-10: every case gets a map on its place line, held into the next clause (rule book 29) | owner decision | dropping a map for length | every case has a map row
- Don't repeat one device back to back, and rotate the looks across the video | the repeated dark comment card looked boring | one template for everything of a kind | no device appears twice in a row in the storyboard
- No footage of a named place exists → show the creator's own footage of what happened there, never a stand-in from elsewhere | CAMPING-8 v2 C4 church | a generic stock place passed off as the real one | each place row names its source
- Clause too short for a map → still use the map and hold it into the next clause (rule book 29, 2026-11-10); the real place picture can sit alongside | CAMPING-8 v2 C6/C7, updated | dropping the map | map row notes the hold
- Helmet-cam / faceless creator → the channel avatar is the face; never invent a face | CAMPING-8 v2 C7 | skipping the face beat | face row says "avatar" when no face exists
- Creator sources with burned-in subtitles → sample several windows and pick clean ones before placing | CAMPING-8 v2 C8 | doubled captions under ours | sheet the cue range first
- Use the whole template library (freeze + box, slowed replay, push-in, article, description highlight, kinetic text, side-by-side) | he said "you have all the other templates" | two or three devices on repeat | count the devices per case

## Comments, quotes, written accounts
- A viewer comment read aloud is shown as the real comment page (dark mode) with a highlight wiping over the exact words, or as one comment box floating over the footage it is about | he asked for "like the YT comment page… highlight the text or a comment box floating" | a generic dark card | each comment line names look A/B/C
- A creator's written words ("he wrote", "her account") are shown as their description or post with the line highlighted as it is read | Nocturn reference 18:56 | narration over unrelated B-roll | each "wrote/said/account" clause has its text on screen
- A shown comment is the source, not a reconstruction: text verbatim in source order with "…" at cuts, likes/date from info.json (blank if unknown), "(edited)" kept, "· translated" on translations, a reply only under its real parent id with the real reply count | CAMPING-8 v2 audit found invented likes, a reversed excerpt, a reply under the wrong parent | made-up metadata | props built by code from info.json that asserts every excerpt, highlight, like, date, parent and count (`scratchpad gp/mkprops2.py` pattern)
- Match a reply by parent id, never by author + phrase alone: creators repeat themselves (4 Ken replies share 手形, 3 Nathan replies share one line) | CAMPING-8 v2 | wrong reply shown | `replies(parent)` lookup, exactly one hit
- Evidence-board marks never overclaim: ✓ only for what the footage shows, ✕ only for what it rules out, else ? | c4_06 first draft | a verdict the narration does not make | each mark matches a narration clause

## Cards and structure
- Every case title card uses the case 1 design ("CASE FILE 0N / 08", name, source line), smooth: no shake, soft eases, blur to sharp | he liked case 1's card and wanted all the same, smoother | different card styles per case | all 8 cards come from one parameterised composition
- End each case with a short teaser of the next case's own footage, not a map | builds curiosity | a map as the closing shot | each case's last row is a teaser

## Captions
- Raw-clip captions sit at the bottom in a solid black box | his screenshot | captions mid-frame or with a shadow/outline | sample one caption frame per case after the render
- Every case uses case 1's caption pipeline: SRT import + create_caption_track, then the black-box patch (spatch) keeping the SRT position | CAMPING-8 v2: DFXP-region captions sat higher/differently than C1 and he asked for C1's placement everywhere | DFXP with its own region/font | compare one cue position per case against C1 before delivery

## Sound
- Intro gets music and SFX | an intro without sound felt flat | a silent opening | intro rows list a sound
- SFX under narration sit well below the voice (peaks about −30 dBFS); louder only in gaps | SFX disturbed the narration | SFX at the same level everywhere | measure SFX peaks in narration windows
- Unbleeped profanity in raw audio gets bleeped; caption shows "[ __ ]" | owner decision 2026-11-10 (rule book 30) | leaving the word audible | storyboard lists each bleep with source time
- Transitions across the whole video, not only a few cuts | he asked for them | hard cuts everywhere | the storyboard states the transition policy
- Mix order: narration loudest, music clearly under it (about 12-15 dB), SFX under the music; impacts too | CAMPING-8 v2 intro: music and the sub boom competed with the VO | music and hits baked at "presence" level | per-window peak/RMS of the stem vs the VO file before placing
- A rebuilt intro gets transitions too: cross dissolves between shots, dips to black on exits into cards and the title | he asked for fade in, cross fade, dip to black after the v2d intro had only hard cuts | leaving a rebuilt section all hard cuts | list every intro cut with its transition in the storyboard

## Pacing and format
- A reference teaches craft (where effects, transitions, graphics and clips go), not format: keep our title cards, faces and structure | he said "not to follow its format… learn editing from that" | copying the reference's structure (no cards, no faces) | the storyboard keeps cards + faces whatever the reference does
- Pacing is slow and immersive, never rushed: hold shots, soft transitions, let raws play | "it should not feel very fast… make it smooth" | trimming hard to hit a number | median shot ≥ 6 s outside stutters; no trim that cuts a raw mid-thought
- Target length is what he states (CAMPING-8: ~35 min); cut only footage with no reason, then trim gently | he asked for ~35 min after a 31-min plan | over-trimming | total within ±1.5 min of the target
- Show creator faces for every case, minors included, when he says so | he asked for faces in all cases | skipping faces for minors on my own | every case has a face shot on the creator's first naming

## Process
- Reference video given → study it frame by frame against its narration before the storyboard; write what each device is for into `narration-picture.md` | he wants the edit built the way the reference places things | editing from a description | the storyboard cites the reference timecode for each borrowed device
- Storyboard first, build only after he approves | saved rule | building, then asking | approval is in the chat before any Premiere mutation
- Review cut: he watches it himself; no visual QC (no eye watch/review, no frame checks) unless he asks; only measure and fix audio levels, then wait for his changes before the final render | CAMPING-8 v2 | spending watch calls and turns on QC he will redo | the delivery message asks for his notes

## Look (CAMPING-8 v2e review, 2026-11-07)
- Case cards are a small amber letter-spaced VCR OSD Mono "CASE N" over one big off-white title, straight on the case's own dark footage; no panel, rule or scanlines (compositions/camping8/case-title.html) | his reference frame; the old case-card looked AI-made | boxed or scanline cards | the card matches his reference image
- ~~Grade raws and the intro toward Nocturn~~ OVERRIDDEN 2026-11-10 (owner): raw footage keeps its own colour (rule book 15); no Nocturn grade, Lumetri look, vignette or desaturation on raws; only the video-wide texture layer goes on top | owner decision on Winter Camping Encounters C1 | grading raws | no colour effect on any raw clip in the storyboard/EDL
- Every case gets a map on its place line, even when the clause is under 8 s; hold it into the next clause | he saw no maps in v2 | dropping maps under a length rule | every case has a map (rule book 29, confirmed 2026-11-10; overrides the ≥8 s map lines above)
- Articles are light 3D Wikipedia-style pages with DOF, blue links, a highlight on the line being read and a photo panel (Old Dynasty Files reference); real pages only, at least one per case | he saw no articles in v2 | dark pages, or none | every case has an article
