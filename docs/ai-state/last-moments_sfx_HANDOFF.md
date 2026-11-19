# last-moments SFX v2 handoff (2026-11-19) - reuse for part B (lm_case01b) and later cases
Owner note: "Have good SFX also but a little lower than music." Ladder VO > music (VO -10) > SFX.
Done in `cases/lm_intro.mjs`, `cases/lm_case01a.mjs` (audio only). Backups of the pre-pass files: none in repo (scratch only).

## SFX set (media/last-moments/sfx/, 48 kHz s16 stereo, Epidemic Sound, trimmed + faded)
| file | Epidemic title | device family | dur | I | max M (short: padded) | TP | peak-at |
|---|---|---|---|---|---|---|---|
| lm_key.wav | Typewriter Vintage Tippo Keys Buttons 09 (one key, 0.06-0.17) | TitleType typing | 0.110 | - | -25.6 | -4.6 | 0.016 |
| lm_brush.wav | Brush Hand Held Sweep Hollow Wall Single Stroke 02 | LowerThird ink wipe | 0.775 | -19.8 | -17.5 | -3.1 | 0.030 |
| lm_paper.wav | Paper Friction Sheet Laminated Slide On Wooden Table | Article3D in (at the cut) | 0.785 | -19.9 | -19.6 | -2.9 | 0.039 |
| lm_settle.wav | Paper Impact Letter Drop On Table 02 | Article3D settle (+0.45 s) | 0.396 | - | -23.2 | -0.5 | 0.033 |
| lm_marker.wav | Marker Pen Scribble On Cardboard Sheet Short | Article3D marker band (f0, f0+26; start -0.03) | 0.525 | -14.4 | -14.2 | -3.0 | 0.139 |
| lm_whoosh.wav | Swooshes Whoosh Low Short 02 | StampRing punch-in, map push, conveyor panel moves (peak on move mid) | 1.549 | -19.3 | -16.3 | -2.4 | 0.469 |
| lm_boom.wav | Designed Boom Impact Dark Cinematic Low Hit | title card, dip ends, raw cuts, riser landings (peak on the cut: at = cut - 0.17) | 4.183 | -21.7 | -17.7 | -11.6 | 0.176 |
| lm_hum.wav | Ambience Room Tone Hotel Corridor Electrical Hum 01 (20-32 s) | CCTV room tone under raws | 12 | -32.7 | -31.4 | -19.0 | - |
| riser_dark.wav (old, kept) | - | riser into reveals / raws (loud at the end) | 5.91 | -23.0 | -16.7 | -10.6 | end |
| lm_glitch.wav (v3, 2026-11-19) | Designed, Impact, Processed Impact Distortion (id ce1efce9-1ca3-4d7b-9d20-ea5b9ff08808; trim 0.018-0.598, fade out 0.44-0.58) | warning GlitchOut2 exit (intro's ONE big hit) | 0.580 | -23.7 | -22.9 | -17.8 | 0.005 |
| static_lp.wav (old, kept); glitch_click.wav (old, no longer used by intro) | - | warning only | | -32.4 | -31.1 | | |
Old boom_low / tick_soft / roomtone_lp no longer used by intro/c01a (still on disk; case01b may use them).

## Level model (in the case files: `SFX` table + `sfx(name, at, off=-3, len)`)
- gain = min music target over the SFX loud span (peak-at -0.05 .. +1 s; riser: last 1.5 s) + off - max M. Uses `tgtG` (c01a: raws -6, dip -12)
  / `dipT(MUS_T,0)` (intro), so dips/raws pull SFX down automatically. off -3 default, conveyor whooshes -4, glitch -2.
- typing: key on every 2nd char (lm_pro TitleType: char j of line i at at + (tot_i+j+1)/cps, +4 gap per line), stream max M = music -6
  (one key padded M + 10log10(0.4*cps/2)). Intro (lm_v2 TitleType, 18 cps) uses its old tick schedule with lm_key.
- room tone (lm_hum) under raws at -48.2 LUFS I (raw music bed -45.2 minus 3). Warning static bed I = music -2 (was VO +3), -9 dB on the glitch.
- Lanes: 15 ms in, 30 ms out (booms: 0.8 s tail), `to` = at + dur - 0.02 (build rejects to > file length rounded to frames).
- Resulting max M: intro whoosh -42.5, boom/riser -41.5, glitch -40.5, key stream ~-44.5 (single key -50); c01a brush/paper/settle/marker/
  whoosh -42.2, booms -42.7 (dip) / -48.2 (raws), risers -48.2, hum -46.9, key stream ~-45 (single key -51.6).
- Rules applied: no two SFX starts within 0.3 s (intro: whoosh at C 476 dropped (riser starts), first title key dropped (title boom);
  c01a: S06 tag brush dropped (dip boom 28.30), S36 settle dropped (marker 0.22 s later)).

## Events
- intro: glitch 2.42; whooshes 11 (conveyor A 95/173/282/372, B 110/206/320, C 108/210/371/568 f, start = move - 0.17); riser 40.625;
  boom 46.365 (ledger) + 53.765 (title); 21 keys; static bed 0-2.9.
- c01a: brush 1.54 6.24 50.0 66.26 77.62 115.67 124.81; Article3D S09 43.80 (f0 70), S15 73.54 (f0 50), S36 167.80 (f0 40);
  typing 7 cards (67 keys); whoosh 19.42 (S04 stamp) 131.23 (S28 stamp) 163.42 + 165.51 (map pushes); boom 28.30, 133.78, 181.93 (3.9 s);
  risers 128.04, 176.19; hum on raws 133.95-138.98, 182.10-185.85.

## Checks (2026-11-19)
- `node build.mjs lm_intro` / `lm_case01a` exit 0; `npx hyperframes@0.9.56 check --json` ok true, 0 errors (intro 6 lint warnings, old).
- Loudness NOT measured (no cheap standalone sound job: farm sound jobs run inside a render). Estimates: I ~ VO +0.4 dB (intro ~-28.1,
  c01a ~-28.8 LUFS); TP typical <= VO peak (-3.1 / -1.9 dBTP); worst coincident VO+music+SFX peak sum c01a ~-0.3 dBTP -> master limiter
  or check after the first render.

## Part B (lm_case01b) recipe
Copy the `SFX` table, `sfx`, `typing`, `room` helpers from lm_case01a.mjs (needs that file's `tgtG`); one family per device as above.

## Warning glitch SFX v3 (owner 2026-11-19 "Good SFX, glitch SFX in the warning transition")
- Candidates (ES, 0.6-0.9 s): Processed Impact Distortion (chosen: hard onset, dense crunchy distortion, centroid ~2.5 kHz, no beep),
  Glitchy Impact Various 04 (darker ~1.4 kHz but 60 ms soft attack), Radio Interference Burst (bright ~4.5 kHz). Rejected UI glitch clicks/beeps.
- Level: max M = VO max M (c00 -20.7) - 7 = -27.7 (gain -4.8 dB; ~11 dB over music, louder than every other SFX). TP ~ -22.6 (crest of
  the file is ~5 dB, so a sample-peak 7 dB under the VO peak would sit ~5 dB OVER the VO's loudness; loudness match used instead).
- Sync (lm_intro audio, at 2.433 = GlitchOut2 f0 of shot 0-2.60): full on f0-2 pop, -6 dB on dark f3, full f4-8 (f5 pop), -8 dB on
  near-black f9, 0.8 at the cut 2.60, fade to 0 by 2.85 (VO 2.90). Static bed unchanged (-9 dB at 2.40-2.50).
- Other intro SFX unchanged: whooshes music-4, riser/booms music-3, key stream music-6 (title only), static bed I music-2 (bed, not a hit).
  Typewriter: TitleType (L08) is the only typing device in the intro (Warning2/Descent/Credit fade, no char reveal); keys still on.
- Checks: build exit 0; check ok, 0 errors (lint 6 warnings, old). Not listened / not rendered.
