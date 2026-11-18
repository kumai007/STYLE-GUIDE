# Case video rules

These are the user's learned rules from 6 delivered case videos (source: `case_video_workflow/docs/learnings/RULES.md`,
the master prompt from 2026-10-19, and Video-QA and Encounter Studio). The numbers are his. Where a workspace rule
differs, the workspace rule wins, and the entry says so.

## 1. Structure and assembly
1. The intro comes first and uses **raw cue footage only**: the loudest or most intense moments of each case's cues, in
   case order. No title card goes before it. No shot appears twice across the intro and outro.
2. After the intro narration ends, the **series title** (Premiere's own text in the Stakes look, modest size; there is no series-title card) holds 4 s
   with no sound, then dips into Case One.
3. Each case gets a **CASE N card** on true black: 4.5 s (135 f), dipped to black on both sides. Then the case plays.
   An outro closes the film.
4. Every case has the same card: the same type, style and length, labelled "CASE ONE", "CASE TWO" and so on.
   Never restyle it and never add a sub line.
5. Open each case on its **channel**: the clause that names the channel shows the channel page (templates.md
   ChannelPlate). Any beat that falls on that clause moves to the next clause.
6. The first raw cue lands 10-27 s into a case.
7. In the first 10 s of the film, the picture is moving and lit, has at least 4 cuts and at most 1 graphic.
8. A case's last shot fades fully to black over 1.2-1.8 s, followed by 0.4 s of black.
9. Run the same edge-clipping and narration checks on **every** case, not only the first one.

## 2. Shot length (no ultra-short clips)
1. No footage shot is **shorter than 4-5 s** outside the intro and outro montage (Ayush 2026-10-25, memory
   shot-length-continuity-rules); graphics (date, channel page, game, map) at least **4 s**. Shorter only where the
   narration itself ends (block end, raw cue or card follows). A shot carried across a cut counts once.
2. A sentence still on the same topic keeps the same clip; a short sentence shares its neighbour's shot.
3. **No maximum**: hold while the topic and the shot stay good. (Replaces the old 2 / 9 / 6 s pacing.)
4. **A sentence end that changes topic is a cut**; one on the same topic continues the clip. Don't cut on a clause inside a sentence, unless it is a topic change or a proper
   noun (workspace *Cut on the clause* / *Cut the picture on the noun*). Stock never carries into the next sentence.
5. If a clause has no clear picture match, the shot carries on (*Hold the shot*). Never play a source range that
   contains an internal cut; when the source runs out mid-topic, take another angle of the same scene.
6. Rhythm: shots get shorter into the climax and longer in the aftermath.
7. **Measured, not eyeballed** (Winter Encounters, 2026-10-22): a `batch_ops` place lands **one frame short**, so every
   generated out is `in + length + F + 0.005` (F = 1/fps) or the next piece opens on a 1-frame sliver. Overwriting V1
   deletes that cut's Dip to Black: count transitions before/after and re-add. Loop `precision/audit.py` until
   SHORT 0 / GAP 0 / OFFCUT 0 (`tools/case-build/precision/README.md`). A cut hidden under a full-frame V3 graphic is
   not a visible cut; a cut on a comma clause is legal.

## 3. Narration precision (picture = the words)
1. The footage shows what the clause says, starting **on** the word: the heater appears on "heater", never before.
2. **Nothing is shown twice** in the whole job:
   - keep 5 s clear on either side of a used span;
   - never reuse anything from the same source shot (cut to cut, up to 30 s either side);
   - use a stock clip once per job.
3. Skip the first 15 s of a long (120 s or more) creator video. That is the logo and subscribe intro.
4. A B-roll window starts 0.15 s after a source shot change and ends clear of the next one. Clip edges stay 1 s away
   from source shot changes. A clip must not flash 1-3 frames of another picture at its head or tail.
5. Never show creator on-screen text: subscribe intros, pinned tags, burned-in captions, PiP titles. This applies even
   inside a rewind run-back.
6. Avoid spans of repeated frames. Prefer B-roll without faces.
7. A **cover** (raw audio over other footage from the same source) never shows a talking face, because it reads as out
   of sync.
8. Use generic stock only for generic words. Never show a competitor channel, newsreel or TV footage, or a source
   that has confessed to being fake. A teaser never spoils a payoff.
9. Stills and pages hold at least 1 s + words/3, and drift at least 0.16 %/s (a Nocturn push is 0.4-0.9 %/s).
10. A case's mean brightness (luma) sits at 64-91. A vertical column is at least 0.47 of the frame width; the bars
    are filled by `aspect-fill`.
11. Show one device at a time. Avoid clutter, but don't go raw-only either. Anchor every text to something said or
    visible.
12. **Graphics are narration-precise too.** A graphic or label starts on its word (at most 0.35 s before it, never after),
    or on the start of the clause that introduces it ("the host of <channel>" -> channel plate). A full-frame graphic
    ENDS inside the narration pause before the next clause, never mid-word: find the pause from the narration WAV
    (50 ms RMS), not from the word SRT, whose word ends are the next word's start. A date card holds until the
    year is fully spoken.
13. When the file is shorter than the span, bake `NAME-hold.mp4` (`precision/hold.py`): hold the last settled frame
    BEFORE any fade-out (date cards and maps fade out over their tail; never freeze a faded frame), import it as a
    new item. Never cover the shortfall with a sliver of footage. A case's first plate starts exactly on the case
    dip: no black gap after the dip.

## 4. Raw cue edges
1. An edge may pass the sheet's in or out point by **at most 3 s**, and only to finish a quote that is being spoken.
   It never passes a hazard.
2. A hard hazard edge (the sheet's `out before T`) lands on the nearest word boundary within 1.5 s, on the cue's side.
3. The in point sits 0.2-0.5 s before the first word. The tail runs 0.3-0.8 s after the last word. Raw cues never end
   abruptly: keep the room tone.
4. Trim a cue's wordless black or warning-card head and tail. A card nobody speaks over goes to black. Black left
   inside a cue stays black, with its own sound and captions. Don't use a red audio-wave plate there (user,
   2026-10-19).
5. Transcription: language "en", whisper words clamped to 3 s at most. For a missing quote, retry with VAD, 15 s of
   context, then large-v3. Never use a prompt.

## 5. Raw audio
1. A cue that follows narration **pre-rolls its sound 1 s** under the VO tail (user: "should be one second"). Never
   pre-roll over a hazard, a bleep second or a swear, and never after a card or another cue. *This replaces
   raw-editor's 2.002 s default for case videos.*
2. Level shape: -35 dB, rising to full by the first word (over up to 6.44 s), then falling to -30 dB (over up to
   2.74 s). Short cues scale both ramps by x0.98. The Premiere keyframes are **-50 / -15 / -45** because of the dB-15
   offset (`raw-editor` Phase 5b).
3. Strip the music from raw cues and keep the voices and SFX (vocal stem / Demucs). Bake the result into the file and
   relink.
4. VO to raw gap: 0.5-0.8 s. The next VO word comes 0.5-0.8 s after the raw cue ends.
5. Raw speech sits within +/-2 LU of the narration.

## 6. Bleeps and mutes
1. A sheet `BLEEP T` covers the sheet's whole second plus the word that time names.
2. Bleep every strong swear heard inside a cut, as a whole word, even when the sheet missed it.
3. The caption shows "—" in place of a bleeped word.
4. `mute "phrase"` mutes every occurrence of that phrase. Mute brand names.

## 7. Captions (raw cues only)
1. Captions go **on raw cues only**: over the whole raw clip, including black and cards inside it. Never over
   narration.
2. Style: Times 40 px, white (not #038BFF), a tight black box, bottom edge at y = 0.9405 of the frame. Use capitals
   only at sentence starts. Build them on Premiere's captions track or with native text (workspace rule), not MOGRTs.
3. Line breaks come at a sentence end, a 0.6 s pause, 42 characters or 3.6 s. Use at most 2 lines.
4. Each caption goes out 0.4 s after the voice stops and 0.04 s before the next one starts. It comes in within 2 f of
   the voice.
5. Use CTC-aligned word times, not whisper's own times.
6. Speaker colours, when they are needed: see `audio-and-captions`.

## 8. Text and cards
1. **Never put text on black over narration.** Every narrated clause shows footage, stock or the channel plate.
2. **Typed facts:** dates, clock times, "number N", counted amounts, and orientation facts such as "Night 2" type in
   bottom left in VCR OSD Mono. Typing runs at 0.06 s per character with a cursor, then holds 2.5 s, over moving
   footage (never a frozen frame). One line at a time, each line whole inside one clip.
3. **Place:** the first time a place is named, show a black map card (NocturnMap). If no map works, use a drone stock
   clip tagged with that place, one per place.
4. **Named people:** show their face stills side by side (NocturnCouple) with a slow constant zoom and the names below,
   each name matched to its face. Take each still at least 1 s away from a shot change. A named pair skips the third,
   bigger face (the creator filming).
5. **Counted people:** a line that counts people gets a face lineup (NocturnLineup, 4 over 3), never a number card.
6. **"Rewind":** the footage runs backwards at 4x for up to 3.9 s under a VCR "REWIND" label, ends on the in point,
   then plays forward.
7. Explainer cards animate (chronology flip cells, blood moon, gap arc). Never use static, comparison, table,
   two-column or slide-like cards ("this is not a PPT").
8. Beat cards come only from what the footage or narration shows. Put a POI ring only on a frame you have checked is
   lit. The ring is on screen 12 f before the event.
9. Every card's motion is eased with `graphics/templates/src/case/motion.ts`: arrivals ease out, exits ease in, pushes run on
   sine, typing is linear. Animations take 2-12 f to arrive, with no overshoot.
10. **Make no style of your own.** Looks come only from the user (Nocturn, HCE, and his named kits).
11. Text is at least 28 px, inside the safe area (x 96-1824, y 54-1026), with contrast of at least 4.5:1.
    A title holds for at least max(1.0 s, 0.66 s x words).
12. Flashes: at most 0.4 per minute, never at a raw boundary, and at most 3 luma flashes per 24 f.
13. Dread: no bright insert between "something is wrong" and the event. The VO line before a raw cue tells the viewer
    what to watch.

## 9. Transitions
1. **Workspace policy wins** (`transitions-pass`): Cross Dissolve between filler shots, a hard cut into evidence, Dip to
   Black out of it, and a dip on the final cut. The source pipeline also dipped into about half of the narration to
   raw entries (the user liked them on 2026-10-16). Use that only if he asks.
2. Dips to black fade out **and** back in around every CASE card. Card black lasts 0.4-0.8 s. The first word comes
   about 0.45 s after the picture returns.
3. A transition needs a lit, unfrozen handle inside the source on both sides; otherwise use a hard cut (memory
   *Transitions need handles*). Premiere's duration is always 2.002 s.

## 10. Audio (only when he asks for music or SFX by name)
1. **Bed:** Epidemic Sound "dark ambient horror drone atmosphere", beat-free, no drums. It runs unbroken through each
   whole case (narration, cards, raw cues), at -32 LUFS in the cases and -27 LUFS in the intro. Extend one bed; never
   stitch two together.
2. **SFX** peak at -26 dBFS. In the intro: a deep boom on every other montage shot, and a riser that ends on the
   intro's last frame, at -18 dBFS. Card SFX are timed to the elements under the VO: a shutter per tile, a tick per
   mark, a boom on the accent. (The intro booms and riser were never checked in a real render.)
3. **Master:** -14 LUFS (narration + raw). The bed and SFX keep their own levels. True peak about -1 to -1.5 dBTP.
   Each clip is capped at -1 dBFS. Voice sits at least 10 LU over the music.
4. **Dead air** means under -50 dB for 1.2 s or more outside a planned silence. Put 3-5 ms fades on audio cuts.
   Listen for clicks and pops: nothing detects them automatically.
5. M-013 "no Epidemic" does not apply: he licenses Epidemic.
6. **Proven method** (Winter Encounters, `precision/music.py`, `precision/sfx.py`), levels baked into the files, no clip gain:
   - Levels are RELATIVE to the mix as it stands: if narration + raw measure X LUFS (not -14), set the bed to
     -32 + (X + 14) and scale SFX peaks the same way, so lifting the master later carries every ratio.
   - One bed per case, extended by an 8 s equal-power cross-fade into itself. Ducked to silence under every raw cue:
     down over 0.8 s ending at the cue's audio start, back over 2 s after it; spans under 4 s apart merge. Normalise
     on the AUDIBLE part only, or a bed whose loud passages sit under the ducks comes out 3 dB quiet.
   - Subtle SFX: a riser that ENDS on each raw cue's picture entry, an impact that PEAKS on it, and a whoosh that
     peaks on each graphic's first frame (not stock, not inside the intro, not within 2.5 s of the last whoosh or 1 s of
     a cue entry; labels 3 dB under). Nothing is cued on narration words. Risers, impacts and whooshes each get their
     own track, because they overlap and overwrite would eat one.
   - Verify in a range render by least-squares fitting each file into the mix (`precision/sfxchk2.py`): gain about
     1.0 means present at plan level. A correlation score fails under narration; the fit does not.

## 11. Speed and frame rate
1. Slow-mo runs at 0.25-0.5x with frame blending. A freeze lands on the exact frame and is a choice (memory *Freeze is
   a choice*).
2. Never conform with `fps=`. Bring 25 fps to the sequence rate with framerate blending. For 59.94/60 fps, drop every
   other frame. Check every conform with `tools/case-qc/qc_fps.py`.
