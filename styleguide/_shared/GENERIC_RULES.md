Applies to every style. A style's own rule book wins only where it says so explicitly. The owner SOP (`docs/workflow/SOP.md`) also applies to every style and wins over this file and every style rule book (see section H).

# Generic editing rules (all styles)

Craft rules taken from the Farrell guide (owner, 2026-11-12) so every video cuts, sounds and flows the same smooth, human way.
Look, fonts, colours, cards, structure and transition mix stay in each style's own guide. Ids = `styleguide/farrell/farrell.json`
(b- = rule book, r- = rule). Edit this file by hand; it is not generated.

## A. Shot length and cutting
1. **Minimum shot length.** A narration shot (B-roll, photo or graphic under the narration) is on screen alone, outside its transitions, for at least 3 s; every shot at least 2.5 s in total. Too-short beat: extend a neighbour or merge the beat, never squeeze in a quick extra shot. Under 3 s only where a style's rule book names the exception (e.g. an intro shock burst the refs prove). source: farrell b-621893eb, b-bbb5c5f7
2. **Overlay and its footage are one shot.** Plain footage between two overlays, or between an overlay and a shot change, is either 0 s or at least 3 s alone. source: farrell b-a60498f2
3. **Nothing still too long.** A non-raw shot where nothing happens changes within about 4-5 s; nothing static past about 7 s without a reason. Long holds only for raw clips the cut sheet asks for. source: farrell b-878931b8, r-3aa6a716
4. **Cut on the clause.** Cut at a sentence end or topic change, on the pause midpoint or a word boundary; never by feel or on a round number. Shot length is an output of the narration. source: farrell r-6e62f1cf, r-c77fdcc6
5. **Picture on the spoken noun.** The picture arrives on the noun it shows and never runs a shot ahead of the voice. source: farrell r-636a05ce, r-ab5bfa6d
6. **One scene, one clip.** Do not chop a continuous scene into short same-picture cuts; fill a removed cut by extending the neighbouring clip. source: farrell r-c5c33aaa, r-c6b67b39
7. **No stray bits at clip edges.** Never cross the source creator's own edit; never play a range with an internal cut; no 1-10 frame fragments of another shot (raw tails included); never a 1-frame black gap; overlap instead. source: farrell r-1c3e4639, r-a2989945, r-778bed62
8. **Check the whole range.** Check head, middle and tail of every picked range; re-check after any extension. source: farrell r-d510add7, r-7c3bb920
9. **No frozen fill.** Do not fill gaps with frozen frames; replay the source as motion. Freeze only for an examination beat the narration names. source: farrell r-d4b28ad3, r-6f003a55
10. **Pacing has a shape.** Open wide, tighten in the middle, open up for the payoff; slow and immersive, never rushed; cut only footage with no reason, then trim gently. source: farrell r-d037fbe2, r-6155ffd9

## B. Audio cutting
11. **Word edges.** Raw clips start and end on word edges (use word timings); never cut mid-speech or inside a word. source: farrell r-0fb25277, r-c0b33c85
12. **Raw clip fades.** Start raw audio 1.0 s before its picture cut (less if the source has no 1.0 s head), end it with the picture. Fade in 3.22 s, out 2.74 s; under 5.96 s scale both by (length / 5.96) x 0.98. source: farrell b-74652a17
13. **Nothing under the voice.** Under narration, raw audio is fully muted: strip it from the file (ffmpeg -an), muting the track is not enough. A raw picture may run about 1.25 s under the next narration with its audio ducked to -24 dB; the creator's voice is never audible under narration. Voice-over and clip speech never overlap. source: farrell b-f1e69c2f, r-3118329e, r-eb443b88, r-a474e0ed
14. **Let narration breathe.** Cut where the waveform rests. AI narration gaps: sentence ends 0.25-0.35 s, commas 0.15-0.20 s; never tighten more than about 15 %. Leave about 0.8 s after a disturbing line. source: farrell r-0aca5bc1, r-33e40f9e, r-c8d1f140
15. **Narration into a raw.** Narration cut points keep at least 120 ms lead and about 400 ms tail before a raw. source: farrell r-474eef5b
16. **Never digital silence.** Room tone or a bed under everything so silence never sounds like a dropout; the music bed ducks but is never dead (never below -50 dB for 1.2 s); a card is never digital silence. source: farrell r-6962e21f, r-a474e0ed, r-a603c795
17. **Clean sources.** Remove the source creators' background music; keep ambience and scares. source: farrell r-4b0c8dea
18. **Bake gain.** Narration and raw audio sit at 0 to -6 dB on the meter; bake the gain into the file, no clip gain or faders. A source peaking at 0 dB cannot be gained up: measure mean and peak and let the owner choose. source: farrell r-ea2c0f89, r-c0b74a9b
19. **Verify every take.** Transcribe the whole narration file and diff it against the script before building; a wrong take can share its opening words. source: farrell r-c96a5863

## C. Mix levels and loudness
20. **Level order, always.** Narration loudest; music clearly under it, about 13 dB (12-15 dB); SFX under the music. SFX never break the flow or mask narration or music. source: farrell b-912d4230
21. **SFX by class.** Booms and risers may sit about 3 dB under the music. Glitch, static, VHS, creak and other high or harsh SFX sit 9-12 dB under the music; low-pass harsh high-pitch SFX. source: farrell b-b7398067
22. **SFX under the voice.** SFX inside narration windows peak about -30 dBFS and at least 6-8 dB under the voice-over; louder only in gaps. An SFX 15-20 dB too loud is a rejected mix. Measure per-window peak/RMS before placing. source: farrell r-acb839a9, r-347acb49
23. **SFX are atmosphere.** Tie SFX to real events (transitions, reveals, scares); never invent them; look at the frames before placing a diegetic sound. Vary the scare, save the biggest hit for the act break and finale, leave one hand-off per case unscored. source: farrell r-d52b1bdc, r-4de17075, r-8fd6c45d, r-85638d74
24. **No repeats.** Every SFX clip is a different file, baked to its own level; no SFX file repeats inside a series. source: farrell r-e8017c25, r-979ce18e
25. **Score the hand-off.** A riser ends on the evidence entry and an impact starts on it; read the audio starts, not the video cuts. source: farrell r-47ecb239, r-746ccf49
26. **Music per video.** Different tracks each video; never the same (track, start) twice; adjacent cases never open on the same track; cues crossfade about 6 s. source: farrell b-762b7dc0, r-eb4fa3d3, r-a603c795
27. **Loudness.** Master to -16 LUFS integrated (master SOP). True peak <= -1.5 dBTP: retry the limiter with the ceiling 1 dB lower until it passes (AAC overshoot failed at -0.97). source: farrell b-762b7dc0

## D. Transition hygiene
28. **Never cut during a crossfade.** During a crossfade or dip both clips play continuous footage; no source cut inside the transition or its handles. Never cut to a new shot while a crossfade is still fading the previous clip. source: farrell b-39e69ef2
29. **Even dips.** A dip to black is an even eased curve: old clip fades down over half the dip, new clip up over the other half; never a drop to black in a few frames. source: farrell b-39e69ef2
30. **Overlays stay out of fades.** Stamps, captions and overlay motion appear and go only while the shot plays alone; a stamp ends at least 0.2 s before its shot ends. source: farrell b-39e69ef2, b-3e4d22be, b-700dadba
31. **Lengths and handles.** Dissolve/dip about 1.2 s, never 2.0 s; at 30 fps: whip 4-8 frames, dissolve 10-20, slow dissolve 30-45, fade to black 30-60. A clip under about 2.7 s takes one transition only; a plate needs about 0.6 s of handles on both sides. source: farrell r-d7ed212e, r-d7bbc4b7, r-777ab90d, r-20c56c28
32. **Judge inside.** Never judge a transition at its cut frame; sample inside it. Transition coverage is an output of the policy, never a target. source: farrell r-e01e45c8, r-cbe5c771

## E. Smoothness
33. **Eased motion.** Every animation eases in and out with no snap, jump or mid-move cut; cards never vanish in one frame. Default ease-in-out cubic about 1.0 s; landings ease-out quart about 1.1 s; never bounce, elastic or back easing. source: farrell b-344f0bdb, b-5b947820
34. **Readable on screen.** Text overlays stay at least 3.5 s including entry and exit (characters / 15 + 1 s). Captions start within 2 frames of the spoken line, last 5/6 s to 7 s, never hold over silence. source: farrell b-3e4d22be, b-74905d06
35. **Clean crops.** Zoom, enhance and replay crops exclude creator overlays (arrows, logos, burned text); check a still of the whole crop span. source: farrell b-83766af6, r-bc2ebba0

## F. QC and production
36. **Rule check first.** Before every render run `rulecheck.py <edl>` with no FAIL; scan sources for camera cuts (`srcscan.py`) before picking in-points; after render check every fade (`fadescan.py`, no frame-difference spike inside a fade). source: farrell b-bbb5c5f7, b-39e69ef2
37. **Independent visual QC.** Every section gets a separate-agent still-sheet QC of every graphic, caption, box and crop before the music pass. source: farrell b-8901e043
38. **Fix the cause everywhere.** A problem reported at a timestamp gets its exact cause found and fixed everywhere, not only there. source: farrell r-0e8314bc
39. **Section re-renders.** Re-render only changed sections and splice; the music pass writes the next version; one writer per output file; max 2 NVENC encodes per agent; check free disk first. source: farrell b-41f5565f, b-4cf67234, b-86b1b61a

## G. Feedback loop (learning curve)
40. **Owner notes become rules the same day.** Every owner note on a render goes into that style's json the same day as a rule-book entry or rule plus a Learnings entry (`model.apply_ops` + `model.save`); generic craft notes also go here. source: farrell b-be4e62b7
41. **The next build reads them.** Before each build read the style's rule book, its open Learnings, this file and `docs/workflow/case-video-ref/user-lessons.md`; after each render check it against every line, fix what fails, then deliver. A lesson broken again gets `(repeat N)` and is checked first next time. source: farrell b-be4e62b7

## H0. Master SOP v2.0 (2026-11-14, wins over everything below)
`docs/workflow/CAUGHT_ON_CAMERA_MASTER_SOP.md` = general rules for every style (all styles are caught-on-camera). It wins over section H, this file and every style rule book. The style guide still sets the look, except that the SOP section 2.4 ban list wins over any style look (owner 2026-11-14; see each rule book's top rule). Known clashes it settles:
- Loudness: -16 LUFS integrated, <= -1.5 dBTP.
- Music: bed >= 12 LU under the voice; FAIL within 3 LU for 0.4 s or within 8 LU for 3 s. Keep H's 15-25 dB target (it passes this gate). The bed never dies.

## H. Owner SOP overrides (2026-11-14)
Owner SOP: `docs/workflow/SOP.md` (newest owner rules, general, applies to every style and kit). Where it clashes with a line above, the SOP wins:
- #20 music: 15-25 dB under the voice (not 12-15), gentle ducking, track change at story turns, no swell right before words.
- #14 / WORKFLOW gap cut: the owner's voiceover runs at natural speed, never processed (no EQ, compressor, limiter); level only. Two-part VO joins with about 0.45 s silence. Add silence only for the subject's own voice or 2-3 big story turns.
- #21 / #30: glitch SFX, glitch, flash frames, VHS/CRT, stamps, rolling clocks are banned. No highlight sounds.
- #34: no captions that repeat the voiceover. Text only for places, dates, numbers, names, keywords; at least 3.5 s.
- #10: never sleepy. Intro changes every 1.5-4 s; body shots about 3-7 s; nothing under about 2.5 s.
