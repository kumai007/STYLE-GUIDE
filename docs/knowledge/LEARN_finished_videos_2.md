# Learnings: finished videos, part 2 (case notes not covered in part 1)

> **Status: notes, not rules.** Rank below the style rule book, SOPs and playbook; master SOP §2.4 bans override any
> device named here. Loudness: the SOP target (-16 LUFS, <= -1.5 dBTP) wins over any number below. Source paths
> `(src: ...)` are pre-deletion paths: look them up under `docs/knowledge/notes/<same path>` (PC only, not synced).

Not mined further (boilerplate/duplicates of learn_B): winter case1-7 notes (mute bug, TP, LUFS), nocturn restyle numbers are Nocturn-only (see Editing/Audio), gx10 handoff (= learn_B S10/T10 items).

## Owner feedback
- Owner OK'd cutting a comment card to its key sentence by rule (rule 6) instead of holding it longer; reading-time warnings (about 15 cps) are tolerated when the highlighted line carries the point (src: productions/winter-camping-encounters/05_render/case3_v1_notes.md, case2_v1_notes.md)
- Owner Winter+Van "not up to the mark" -> restyled to Nocturn: more motion graphics, SFX + music all through, approved grade chain; intro graphic must differ on every video (src: docs/ai-state/nocturn_restyle_handoff.md)
- Owner 2026-11-16 "Automate pages + maps": page capture + map clips became tools/autoedit/assets; owner then said map LOOK stays, speed it up only when a new map style comes (src: docs/ai-state/gx10-sample-handoff.md)
- Owner pre-approval pattern: "no storyboard wait, ask nothing, decide and record in handoff" -> every ambiguous call (dick vs ding, grout vs whistle) is muted/kept by rule and listed as an owner check in the notes (src: docs/ai-state/case6_render_handoff.md)

## Editing
- Never claim unseen: a brightened/replayed frame with no visible figure gets NO circle/box and the VO line must say so; if VO wav is already fixed, record "re-voice or keep" as an owner decision (src: docs/ai-state/case5_render_handoff.md, van_case7_handoff.md, van_case6_handoff.md)
- Source facts beat the VO/sheet date: camera OSD said 16-17/07/2026 while VO/stamp said August (inferred from upload); VO "Late in 2018" vs info.json 2017; log as owner flag, do not silently change a stamp (src: docs/ai-state/van_case4_handoff.md, van_case8_handoff.md)
- Cut-sheet visual claims can be wrong ("00:30 night parking lot" was a day truck bed; "cooking" not visible): look at stills for every cued visual before building the shot (src: docs/ai-state/van_case7_handoff.md, van_case9_handoff.md)
- Source that repeats (UBR clip loops from 49.5 s): unique footage only 0-47.5 s, never cut past it; scout every source for loops/cuts (scene + blackdetect) before planning (src: productions/gx-dashcam20/build/CASE08_HANDOFF.md, CASE13_HANDOFF.md)
- Raw end-edge: avoid third repeat of a raw already used as teaser/replay in another case (RAW-C10-05 trimmed to 119.6-131.95) (src: docs/ai-state/van_case10_handoff.md)
- Last shot of a case ends on a HARD cut in and out (0.05/0.03 s fades), no end dip, when the next case follows directly (src: productions/winter-camping-encounters/05_render/case6_v1_notes.md)
- Raw push capped at 15 % total; raw clips are not enhanced; freeze frames are silent (room tone only) (src: productions/winter-camping-encounters/05_render/case2_v1_notes.md, case6_v1_notes.md)
- Nocturn footage grade measured: YAVG 72-88, SAT 7.5-11, warm/red tint, lifted blacks; our Winter was YAVG 61 SAT 5.6 cool -> ffmpeg grade on footage only, never on captions/cards/pages (src: docs/ai-state/nocturn_restyle_handoff.md)
- Dull archive/CCTV footage grade targets for gx: sat 0.25-0.32 (accepted 0.16-0.28), p99 195-245, p1 2-15; re-run precut with higher S/curve top until numbers pass, then check by eye (src: productions/gx-dashcam20/build/CASE03_HANDOFF.md)
- Footage with burned stamp: crop to hide the vendor strip but keep one uncropped 3 s clip so the date stamp can still be shown as a device (src: productions/gx-dashcam20/build/CASE02_HANDOFF.md)
- Silent source (no speech): no bleeps/captions needed; check audio track level first (UBR audio track -91 dB) (src: CASE02_HANDOFF.md, CASE08_HANDOFF.md)

## Audio
- Nocturn mix numbers measured: music -30 under VO (-14.8 dB under), -24 free, drone -34 on cold open, SFX local bed -3 big / -10 light / -14 glitch LP 3.5 kHz, synth -8; every SFX below music (max -1.1 dB short-term); master -14 LUFS TP -1.8..-2.1; no wind; 0 silences >0.7 s at -45 dB (src: docs/ai-state/nocturn_restyle_handoff.md)
- Audio-only re-mux (no video re-encode) is the cheap fix for TP overshoot or a mute bug: `final_cN.py mux`; video stays bit-identical (src: productions/winter-camping-encounters/05_render/case6_v1_notes.md, docs/ai-state/van_case9_handoff.md)
- Second audio source offset found by video correlation (r 0.97): UBA t = UBR t + 3.40 s (plan said ~3); use for picture-less audio tracks (src: productions/gx-dashcam20/build/CASE08_HANDOFF.md)
- mp3 VO tail runs silent under the next raw; segment length = last word end (src: CASE12_HANDOFF.md)
- Pre-master case mix measured: -28.4 LUFS TP -5.1 (case03), mixes built from per-case cues.json via case_mix.py (src: CASE03_HANDOFF.md)
- Mute windows verified in mp4 audio: -51..-53 dB room tone vs -20..-35 around, or -240 dBFS when room tone also gated (src: docs/ai-state/case7_render_handoff.md, case6_v1_notes.md)
- Bleep check method: 50 ms scan of the baked clip, 1 kHz tone exactly over the word window, audio before/after dB-for-dB source; re-audio only with `reaudio <clip>` (video copied) (src: CASE12_HANDOFF.md)

## Captions + delivery
- Caption token for a mute must be "[__]" (no inner space): "[ __ ]" wrapped as "[" / "__ ]" at line break (src: docs/ai-state/van_case12_handoff.md)
- Cyrillic comment text rendered as tofu in the VCR font -> fallback font for non-Latin glyphs in draw_line/mixed_len (src: docs/ai-state/van_case11_handoff.md)
- Creator burned-in overlay ("INSTAGRAM STORY @...") collided with our caption box: move/narrow our captions above it; stamp end = min(start+5.6, next shot start - 0.2) so it never overlaps first caption (src: docs/ai-state/van_case7_handoff.md, van_case12_handoff.md)
- Raw edges: drop edge fragments, split caps >6.5 s / 90 chars, hand-correct ASR words (Doug->dog, Thurman->Thurmond, Jem->Gem) via FIX/CAPFIX lists; unclear loud speech captioned "[shouting - unclear]" on loud RMS bins (src: docs/ai-state/van_case6_handoff.md, van_case7_handoff.md, van_case5_handoff.md)
- Channel's own manual English CC (yt-dlp subs) is a better caption source for non-English/poor-ASR raw; downloading needs owner OK (src: docs/ai-state/van_case11_handoff.md)
- Source-line credit on first raw shot ("Sun Prairie Police release") and "Source: <outlet>" on every page shot (src: productions/gx-dashcam20/build/CASE03_HANDOFF.md, CASE13_HANDOFF.md)

## Licence + privacy
- Page blur must be ON from the first frame of a page cut: ease-in blur (0.1-0.5 s) left ads/portraits sharp 0.1-0.2 s at each page cut; blur k=1 from f0 (src: productions/gx-dashcam20/build/CASE02_HANDOFF.md)
- Page privacy list per case: ads (Instagram/WhatsApp/Telegram), author/foreman portraits, unrelated faces, popups; crop out portraits (never show suspect/victim photos) (src: CASE02_HANDOFF.md, CASE03_HANDOFF.md)
- Face-blur keys: re-measure on a gridded still; keys 0.5 s early missed a head that sat high beside the camera; second run missed because "face" was a sign; check every blurred clip at 1 fps sheet incl. people twisting round (src: CASE12_HANDOFF.md)
- Facebook login-wall posts cannot be fetched: quote via the news page that cites it, no dark-mode FB device (src: CASE13_HANDOFF.md)
- Restricted PDFs (cdc.gov 403/404): render slides from an alternate NIOSH URL; do not cite what cannot be shown (src: CASE03_HANDOFF.md)
- Minors in raw: always blur face; cut before impact/fall, no slow motion on the injury moment (Abyssal-01 cut sheet SCRUB notes) (src: case-work/abyssal-01/cutsheet.md)
- Never state unverified numbers from a spoken VO as fact on page (e.g. "adjourned to July 2026" not found -> not boxed); unfound phrase = no box (src: CASE02_HANDOFF.md)

## Pipeline + farm
- Two final_cN.py started at once (duplicate launch) wrote the same OUT: thousands of "Invalid NAL unit size"; fix = re-run only concat+mux, verify decode with 0 errors; guard: never two finals, watch for run_cN.sh dup (src: docs/ai-state/van_case2_handoff.md)
- Shared common.py points at the Winter W dir: copied van scripts must set W = dirname(__file__) after import or they overwrite Winter files (src: docs/ai-state/van_case3_handoff.md, van_case1_handoff.md)
- Picture runs +0.6 s behind EDL because asm includes the first shot's 18-frame in-handle ("expected 15659 vs END 15641"); fix = trim the in-handle of shot 0, not done (src: docs/ai-state/van_case9_handoff.md)
- Whisper on non-English/mixed audio: auto language gave garbage (az); force language (test ru/kk), condition_on_previous_text=False, fresh output file, rerun ALL windows; scan fps must match source (23.976 vs 29.97) (src: docs/ai-state/van_case11_handoff.md)
- Whisper beam-5 on CPU ran 3 h 45 min with no output: use small.en int8 greedy + VAD only on planned raw spans, 2nd pass with base.en beam5 for 2-pass caption check (src: CASE12_HANDOFF.md)
- Machine at 100 % CPU from parallel builders: a plain 16 s clip took ~5 min, blur clips ~20 min each (src: CASE12_HANDOFF.md)
- Disk rules by agent: stop line 10-15 GB free; remotion bundle needs a real (hardlink) copy pub_cNN (junction -> EPERM in remotion copyDir); bundle 0.1-0.2 GB per case; delete _bundle + pub after stills (src: CASE02_HANDOFF.md, CASE13_HANDOFF.md)
- Remotion render shard path: join check frames = Root frames (14568), spot frames at 1/10/90 % vs stills, then delete shard downloads (src: CASE13_HANDOFF.md)
- Wiki/long page screenshot caps at 7000 px: take extra slices at y offsets, boxes re-found identical, slice y = box y - slice top (src: CASE03_HANDOFF.md)
- Overpass 502 -> coordinates from Nominatim; EOX tiles z12-14 cached per case (src: CASE02_HANDOFF.md)
- farm-GPU rules: Pool(2) NVENC, 5 retries on NVENC errors in run_cN.sh, K=3 chunks in final (src: docs/ai-state/van_case5_handoff.md, case7_render_handoff.md)
- Case-agent handoff format that worked: numbered NEXT steps + STATUS lines with timestamps so a successor agent continues after context limit (src: productions/gx-dashcam20/build/CASE02_HANDOFF.md)

## Mistakes (root causes)
- Page blur eased in -> ads sharp at cut (above); blur boxes in wrong frame (in learn_B)
- Cut sheet wording trusted for "cooking"/"night lot"/"phone raise" with no frame check -> wrong picture claims (src: van_case7/9/8 handoffs)
- Stale compiled timeline.json after renaming music files made t10 audio fail twice; fix: stage_farm compiles first, lint checks music/sfx files exist (src: docs/ai-state/gx10-sample-handoff.md)
- mix_c3 mute bug copied into mix_c4 (np.ones envelope); copying a script copies its bugs: grep the sibling scripts when one is fixed (src: case3_v1_notes.md, case4_render_handoff.md)

## S10 SCRIPTS: keep/drop + why
- DROP kit.py, audio.py, farm_entry.py, build.py in productions/gx-dashcam-s10/build: every function name (kit 52 funcs, audio premix/master/measure, farm_entry shot_files/plan/chunk/audio) exists in tools/autoedit/engine/{kit,audio,farm_entry,build}.py, which was regenerated from s10 (regen_engine.py, "0 leftovers", stills identical).
- DROP timeline.py: only s10-specific helpers (fr,_num,_norm,words,onset,vo_dur,ff,still,resolve_ff,_tile_centre,inplace_dips) not in engine/timeline.py; these are the hand-timeline layer replaced by compile.py + edit_schema.json. Keep ONLY if someone wants to rebuild s10 byte-for-byte.
- DROP d_pages.py / d_maps.py: replaced by tools/autoedit/assets/gh_assets.py (Playwright capture + word boxes) and make_maps_pc.py.
- d_blur.py: hand-placed region list is project data; auto-blur lives in gh_assets.py. Drop unless the BLUR_LOG.md format is wanted (keep BLUR_LOG.md/AGE_CHECK.md as templates).
- Caveat: tools/autoedit/regen_engine.py takes "<best production>/build" as arg; if s10 is deleted, point it at another production before regenerating the engine.
