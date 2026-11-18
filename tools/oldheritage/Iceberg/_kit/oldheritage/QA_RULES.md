# QA_RULES.md: automated QA checklist for a rendered video

The source of truth is `Video-QA-System/` (README, MISTAKES.md M-001…M-109, `tools/qc_*.py`) plus `Smoothness_Guide/2_SMOOTHNESS_CHECKLIST.md`, `_shared_tools/music_gate.py` / `microcut.py` (described in `OWNER_TASTE.md`) and the LG100 post-mortem (`SESSION_LEARNINGS.md`). Companion doc: `EDIT_RULES.md`.

**Conventions**
- `V` = the rendered file. `VO` = the unprocessed VO stem, time-aligned to V (needed for §A2).
- Exit non-zero on any FAIL.
- Thresholds are for 1920×1080 / 30 fps / −16 LUFS deliveries.
- **Order.** Run §A on every final and every preview sent to the owner. Run §B on new or risky sections only (the owner banned exhaustive per-case QA: `fb_no_exhaustive_qa`). Run §C, the human-eye gate, before the owner sees anything.
- **Frame numbers.** Any frame number quoted in a report must be re-grabbed seek-safe. Sheet stamps can be up to 15 f off (M-087).

---

## A. Hard gates (automated, every final; any FAIL blocks delivery)

### A1. Container / stream sanity (M-001, M-035, M-044, M-045)
```bash
ffprobe -v error -show_entries stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,pix_fmt,sample_rate,channels,bit_rate:format=duration,bit_rate -of json V
```
FAIL if:
- **Video stream:**
  - `r_frame_rate` ≠ `avg_frame_rate` (VFR);
  - fps ≠ 30/1 (or the declared delivery fps, e.g. 60 for an owner-requested 4K60);
  - the size is not 1920×1080, or 3840×2160 when 4K was requested. A phone part (< 1080 p) is labelled as the final (OWN L5283).
- **Audio stream:**
  - it is missing;
  - it is not 48 kHz;
  - |audio duration − video duration| > 1 frame.
- **Duration:** |duration − planned timeline| > 0.5 s.
- **Frame count:** the count is wrong:
  ```bash
  ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames V
  ```
  It must equal round(duration × fps).
- **Bitrate:** a 1080p30 final below about 8 Mbps. The approved LG100 final was about 12.4 Mbps.

### A2. Music never over VO: `music_gate` (`fb_music_never_over_vo`, CHAT L28116)
Algorithm:
1. Locate VO inside the mix (cross-correlate; `--off` is the offset).
2. Bed = mix − VO. The bed includes music, booms, swells, drones and raws.
3. Measure K-weighted BS.1770 in 100 ms blocks.
4. Narration level S = integrated LUFS of VO over speech.

FAIL when any of these holds:
- bed **momentary (0.4 s) > S − 3 LU**;
- bed **short-term (3 s) > S − 8 LU**;
- **while VO is active**, bed short-term > VO short-term − 12 LU.

WARN at limits 2 LU tighter.

Auto-fix (`--fix`):
- Duck the bed only, to S−6 momentary, S−10 short-term and VO−15, with a 0.25 s hold and about 1.2 s release.
- Re-master to −16 LUFS with `alimiter=limit=0.84:attack=1:release=80:asc=1:level=disabled:latency=1`.
- Re-check. It must report FAIL 0.

Notes:
- On caught-on-camera videos, gate the music with raws MUTED, then add the raws back (V35 lesson).
- **music_gate passes on silence.** A2 never replaces A3.

### A3. Silence / missing VO (the LG100 shipped-silent bug, `SESSION_LEARNINGS.md`)
```bash
ffmpeg -hide_banner -i V -af silencedetect=n=-50dB:d=4 -f null - 2>&1 | grep silence_
```
Run this on the **final file itself**:
- **Hard FAIL:** any silence ≥ 4 s.
- **Dead air (M-030):** with `n=-50dB:d=1.2`, FAIL on any hit that is not a declared deliberate drop.
- **Slot dropout (M-070):** compute a 50 ms RMS envelope. FAIL on any stretch < −38 dBFS for ≥ 0.5 s that is not a declared pause.
- **Missing VO:** the VO-active fraction per 60 s window (speech-band RMS > −35 dBFS, or a Whisper word count > 0) drops to 0 inside a narrated section. This catches "VO missing after case 2".
- **Process rule:** assemble scripts must exit on missing or empty audio segments (file absent, size 0, or all-zero samples). Never pad.

### A4. Loudness (CS §12, SG §2, M-049)
```bash
ffmpeg -hide_banner -i V -af ebur128=peak=true -f null - 2>&1 | tail -12
```
FAIL if:
- integrated loudness is outside −16 ± 0.5 LUFS;
- true peak > −1.0 dBTP (target ≤ −1.5);
- LRA > 15 LU (WARN > 11).

### A5. Clicks at edits (SG §2, M-039)
- Take a 48 kHz mono numpy pass.
- Flag sample-to-sample jumps > 0.25 FS that are not preceded by a ≥ 3 ms ramp.
- Also flag zero-crossing discontinuities at every cut timestamp from the EDL.
- FAIL on any undeclared click.

### A6. Flash / stray inserts / source-internal cuts: `microcut` (PEAK_V5, M-003)
- **Per-frame scene score:**
  ```bash
  ffmpeg -i V -vf "scale=320:180,select='gt(scene,0.3)',metadata=print" -an -f null -
  ```
  Or use mean |diff| on 320×180 gray.
- **Stray insert:** FAIL on any cut pair < 6 frames apart where frame[k−1] ≈ frame[k+n] (NCC > 0.8). That is a 1–5-frame foreign flash.
- **Designed glitches:** they must be declared, and each state must last ≥ 6 f.
- **Source preflight:** run scene-detect on every source window, including dissolve handles, at plan time. FAIL if a cut falls < 3 f before the window starts, or inside its first or last 0.7 s.
- **Target:** 0 flags.

### A7. Stutter / dups / cadence / judder (M-002, M-047, M-055, M-075, M-109)
- **Duplicate:** mean |diff| < 0.08 (8-bit, 320×180) between consecutive frames inside a moving shot.
  - FAIL on a periodic repeat or drop (every N frames, N = 4–6). That is an fps-conform cadence.
  - FAIL on any undeclared freeze or dead hold of identical frames ≥ 0.5 s.
- **Keyframe pulse:** per-frame mean diff at `f % GOP == 0` vs the others, on shots with median diff < 1.
  - FAIL if the ratio is > 2× on the master but not on the raw render.
- **Judder on pushes/zooms:** phase-correlate consecutive frames on page/graphic shots. FAIL if dy/dx noise > ±0.3 px around the smooth trend. Target ±0.02 px (`fb_hia_v2_notes`).
- **Source prep:** every prepped clip duration equals its source window ±1 frame. All sources are H.264 CFR 30 with GOP ≤ 15 (`OT 2026-11-06`).

### A8. Dead holds / motion (M-020, M-071)
- For every still, page, map or graphic range, estimate the affine motion between frames 1 s apart (ORB + `estimateAffinePartial2D`).
- FAIL if scale < 0.16 %/s AND shift < 0.1 % W/s for ≥ 1.5 s.
- Grain does not count as motion.

### A9. Black frames / black bars / text on black (M-031, M-073, M-095, SG)
- **Black frames:**
  ```bash
  ffmpeg -i V -vf blackdetect=d=0.5:pix_th=0.04 -an -f null -
  ```
  FAIL on undeclared black ≥ 0.5 s. Declared case-break blacks follow the channel spec (Nocturn 0.7–3.3 s, Encounters about 0.4 s).
- **Black side bars:** sample every 0.25 s. FAIL if the outer 40 px (or 1/8 W) of both sides has luma < 6–20 while the centre is > 25–100, for ≥ 1 s.
- **Text on black:** FAIL if the mean luma under every caption or label bbox is < 15/255.

### A10. Grade band (M-008, M-025, `fb_farrell_grade_no_sfx`)
Compute per shot:
- centre-luma p1 / p50 / p99.9;
- mean chroma;
- Lab a*/b* of the mids;
- corner/centre luma ratio;
- mean saturation.

Bands:
- **404 Thread (DD band, `config/grade_ref_dashcam.json`):** Yc_p1 16–53, Yc_p50 41–136, Yc_p99.9 179–234, Cc_mean 3.1–17.8, a_mid −2.7…8.1, b_mid −9.5…15.8.
- **Farrell genre:** mean saturation 0.34–0.44, corner/centre luma 0.18–0.53, mean luma about 0.30.
  - FAIL on HIA-v1-like values: sat 0.24, corner ratio 0.10 (too grey, heavy vignette).
- **Pink warning (M-025):** > 0.5 % of the frame is bright, saturated pixels in the magenta hue band.
- **Grade pop at device in/out on the same camera (M-099, M-078):** a step of > 3 luma codes or > 4 codes in any RGB channel.

### A11. Watermarks / burned captions / logos (M-014, M-015, M-048, M-089, M-090)
- Look for static-edge persistence in the corners and lower band across ≥ 2 s of moving footage. Persistent edges where the centre changes = a logo or bug.
- Look for caption-band (y 0.75–0.95 H) bright-outlined-stroke pixel counts that pop in mid-window.
- FAIL on any hit inside a played window. Pull 1:1 crops of every removed-logo area to check for letter ghosts.
- Also cover the inner edges of pillarboxed vertical panels.

### A12. Sync (SL, OT §2)
- Run Whisper (faster-whisper small.en) on the final audio.
- At ≥ 4 checkpoints per 30 min (case cards, named-thing callouts), check that the picture event frame lies within ±0.1 s of the word onset.
- Case card text must match the case being narrated.
- FAIL on a > 0.15 s offset (text/device on the word +0.0–0.15 s, M-023), or on any picture/VO drift (stale-bundle bug).

### A13. VO integrity (OWN L4586, `project_lg100`, M-032, M-041)
Transcribe the final and FAIL if:
- spoken "Case N" / case titles are present, on channels where they were cut (LG100);
- intro words don't match the scripted intro exactly;
- there are dropped sentences: a zero-duration word run, or a script-vs-transcript diff > 2 words per sentence;
- a VO block head or tail contains a fragment of a neighbouring sentence or raw speech;
- a banned ad-unfriendly word appears ("hang him", "killed her", "her body", "suicide"…);
- the sidecar srt contains spaced digits like "2 0 2 4" (M-098).

### A14. Music library / licensing (M-013, `fb_no_agency_licensed_clips`)
- **Music:** read every bed file's tags (`ffprobe -show_format`). FAIL on `copyright=Epidemic Sound`, ISRC `SE5Q5…`, or an `ES_` filename, unless the owner explicitly supplied that track.
- **Sources:** grep every source's `info.json` (title + description) for: `licensing@|Jukin|ViralHog|Storyful|Newsflare|Caters|Viral DRM|Spectee|TMX|WONDER VIDEO|to use this video`. FAIL if any hit is in the EDL.

### A15. Plan lint (rules in code, `OT 2026-10-25`: "make the CODE perfect with rules set in it")
Run this on the beat plan before rendering. FAIL if:
- **Device spacing:** a device is < its min duration (entry + readable hold ≥ 1.5 s + 0.3 s/word, total ≥ 3 s, + exit); there is < 3 s of footage between devices; more than 1 device starts per 10 s; overlapping devices.
- **Text density:** more than 1 text element per 20–30 s outside openers; text overlays per case over budget (LG100: ≤ 2 labels per case; ≤ 1 highlight per page shot).
- **Repetition:**
  - the same variant appears in consecutive cases;
  - a non-series variant is used > 5× per video (page treatments 3–4×, motion-graphic styles 3–4×);
  - the same exit transition appears twice in a row;
  - more than 3 designed transitions per minute;
  - > 1 white flash per case.
- **Footage reuse:** a footage window overlaps another window of the same source by > 0.5 s, or an image is a near-duplicate (≤ 10/64 phash bits) of one used earlier, in this video or the last 3 videos (M-018, M-091).
- **Ramps:** a speed ramp is outside 0.25–3.2×, or a ramp runs past its source.
- **Exits:** `out + exitDur > durationInFrames`, meaning the device never exits (M-107).
- **Raws:** a raw is outside 2–8 s on a 404 compilation, or a raw window is extended past a scene cut or end card.

---

## B. Semi-automated checks (tool makes the sheet, an agent or human judges); new or risky sections only

| # | Check | How | Fail when |
|---|---|---|---|
| B1 | Pacing / shot length | Cut list from A6. Report the median, p25/p75, min and max per section. | **Farrell / LG100 / HIA:** median < 4 s, any shot < 2.5 s, or > 10–12 s without a change. **404:** median outside about 3–6 s, or the intro is a montage (> 9 picture changes or shots < 2.5 s). **Nocturn / WM:** median outside 4–7 s. Lost Games v5 at a 2.7 s median was "too fast"; 4.4 s was right. |
| B2 | First 10 s hook (M-037) | 1 fps sheet of 0–10 s | Fewer than 4 cuts, no moving moment, more than 1 graphic, or a still + text. |
| B3 | Censorship (M-016/17/81/86) | 4 fps sheet (every frame on gore windows) of each declared sensitive window, including every reuse of that source and every PiP/card made from it | Any unblurred victim face, unmosaicked injury, full-frame blur, or blur on an uninjured bystander. Any person being struck in the intro or title wall (age restriction). |
| B4 | Text legibility / placement (M-024/58/59/60/84/88/103) | 1:1 settled frame plus last frame of every text device | Contrast < 4.5:1. Text clipped, overlapping, outside title-safe, or drifting off frame during the hold. Bottom or side lower-thirds on Farrell channels. Red on red; blue highlight on blue. |
| B5 | Highlight registration (M-074) | 1:1 crop of each highlight | Box cuts the first or last letter, covers only half the phrase, touches the next line, or is invisible. More than 1 per page shot. |
| B6 | Device vs reference (M-010, `fb_ref_side_by_side_gate`) | `compare_refs.py`: our settled frame plus a 6-frame entrance strip next to the cited reference frame | The device has no cited reference; font, weight or motion is visibly off; or counts are off against the reference (device kinds, longest designed beat ≤ 7 s, transitions per minute about 3, footage share, genuine raw sound). |
| B7 | Overlay meaning (M-006/11/105) | Sheet at 0.5 fps | Any text that restates the VO, a slogan over unrelated footage, or a card repeating the footage behind it. |
| B8 | Raw hand-overs (SG §2, M-054) | Listen plus waveform at each VO↔raw edge | Raw in-point not 0.2–0.5 s before its first word. Tail not 0.3–0.8 s with about 0.15 s fade. Next VO not 0.5–0.8 s later. VO and raw speech overlap. A black gap at the hand-over. Creator music under a raw. |
| B9 | Subtitles (M-015, M-108) | Sheet over every raw with speech | Non-English raw without English subs. Captions chunked mid-sentence, or popped with no fade. A cue outliving its segment. |
| B10 | Facts / dates (M-028, M-092) | On-screen text list vs script and sources; typed times vs OSD clock and daylight | Any mismatch. |
| B11 | Smoothness strip (M-064/65/66/72) | 10 fps strips across every whip, blur move and draw-on | Stepped motion-blur ghosts, an outline that never completes, vignette banding into rings on white pages. |

---

## C. Human / lead gate (before the owner sees anything; M-029)
1. Every §A gate PASS on the exact file being sent. Log the results in `reviews/<video>/REVIEW_LOG.md`.
2. Side-by-side sheet: refs vs ours for the intro, the title and each new device; plus our last approved output on that channel.
3. Listen once to every VO↔raw edge and every SFX event (the owner forgives picture problems before sound problems).
4. Preview package:
   - full mix;
   - phone h264 ≤ 29 MB, parts labelled;
   - a working full-quality link;
   - a note of any spliced test audio and of any open owner decisions.
5. The final ships only with music_gate FAIL 0, silencedetect clean, microcut 0, −16 LUFS / ≤ −1.5 dBTP, sync ≤ 0.1 s at checkpoints, and no watermark or censor flags.

### Owner-flagged failures that this checklist must catch (regression list)
| Failure | Source | Check that catches it |
|---|---|---|
| Final silent after case 2 | LG100 | A3 |
| Music louder than narration (5k-like comment) | HIA | A2 |
| 2-frame stranger face / glitch at transitions | Japanese TV, CCTV1, LOSTYT | A6 |
| Laggy zooms | HIA v2 | A7 judder |
| 24 fps composition | Waterpark | A1 |
| Grey, crushed grade | HIA v1 | A10 |
| ContextTag 217× | AP | A15 + B7 |
| Blue highlight | LG100 v2 | B4 / B5 |
| Raw not muted in intro | V25 | A13 + B8 |
| 0.28 s black at raw→VO | V35 | A9 + B8 |
| Low-quality phone part taken as the final | LG100 | A1 |
