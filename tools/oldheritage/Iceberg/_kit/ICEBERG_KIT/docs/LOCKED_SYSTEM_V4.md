# LOCKED SYSTEM V4: the APPROVED algrow-2 channel style (owner: "ok this is good", 2026-10-26)

Approved build: `D:/404 Rendrer/Disasters2/build/disasters2_intro_c01_v4.mp4` (intro + case 1).
Code: `D:/404 Rendrer/Disasters2/remotion/src/d2/`:
- `v3/MainV3.tsx`: assembly;
- `intro/`: intro plan;
- `c01/`: case 1 plan + 3D;
- `ice/`, `maps/`, `pages/`.

Library: `D:/404 Rendrer/TemplateLibrary/src/templates/{iceberg,n2map,n2page,n2fx}`.
Grade: `Disasters2/grade/` (channel.cube + grade.py).
SFX: `Disasters2/sfx_n2/`. Mix: `build/mix_v3/mix_v3.py`.
COPY these patterns. Do not redesign. Do not invent new devices unless a case genuinely needs one, and if you do, derive it from a reference + add it to the library.

## The case recipe (every case)
1. **Entry card:** `EntryCard_AB` at the case's level depth (black → depth close-up drift → ice-cyan title glitch-type → glitch hand-off via `GlitchIn_AB`).
   - The FIRST case of a level gets the LevelCard dolly push into the EntryCard at the case start (`cont`). The LevelCard itself holds on the wide berg with NO push.
2. **Footage-led under the VO:** graded clips (`grade.py` → per-source LUT + channel.cube), eased linear push, `FilmLook_FX`, smooth sub-pixel motion. Cut on VO beats.
   - Replays/slow-mo only where the VO describes the moment.
   - The same source window ≤ 2× per case, reframed.
3. **Date card** once at the case start: typewriter, year in amber.
   - **Name tag:** tiny, only for a person on screen the first time they are named.
4. **Map** (`TerrainMap_N2M`, Blender night relief) only where the location matters to the story. At most ~1 per 3 cases (≈ 36 min render per map: budget them).
5. **Page** (`n2page`, Parallel Pipes chip-lift etc.) at most 1 per case, only to show a real fact, with smooth one-direction camera motion.
6. **3D reconstruction** (Fern-style, Blender EEVEE) only for 2–4 standout cases per video, where no footage shows the mechanism.
7. **Raws:** 2–8 s, only where the real clip sound IS the moment, subtitled from transcripts/. Never music over a silent "raw".
8. **Transitions:** `n2fx` (`Transitions_FX`): hard cut default; glitch/blurDip/whip as designed multi-frame effects.
9. **Sound:** sfx_n2 real recordings at documented gains; Music 8/9/10 with a bed change at each case and level; underwater bed under iceberg scenes; −16 LUFS, ≤ −1 dBTP.

## NEVER AGAIN: every owner correction so far (check your case against ALL of these BEFORE rendering)
**Iceberg**
- [ ] Never a bare berg without its chart where the VO talks about the iceberg/levels.
- [ ] No zoom/push before the case actually starts.
- [ ] The chart lives in the intro; level cards hold on the wide berg.

**Text**
- [ ] No text restating the VO.
- [ ] No caption boxes or lower-thirds slop.
- [ ] No glowing title over footage.
- [ ] No 24-tile wall.
- [ ] No handwritten fonts.
- [ ] No red look-here circles; no broadcaster highlight discs or circles from the source.

**Pages**
- [ ] Rare, readable (≥ 30 px), the active phrase fully undimmed, one-direction smooth camera with no jitter/twitch.
- [ ] Never two side-by-side photo panels; one image full-frame.

**Footage**
- [ ] No black/dark side bars: vertical clips sit on a BRIGHT blurred copy of themselves.
- [ ] No clip repeated across intro and case. No muddy night shots in hooks. No slow push-aways as the only motion in hooks.
- [ ] No blur on people who aren't hurt. Blur the faces of the injured/dead in every frame; mosaic injuries. No-contact rule: cut before human impact.
- [ ] No agency clips (Storyful, Newsflare, Jukin, ViralHog, Viral DRM, Reuters/AFP-credited); no TV-station b-roll with anchors (police/gov releases OK, bug cropped); no Esri imagery.

**Craft**
- [ ] No 1-frame glitches, tears, jumps or sudden zooms: `cutcheck.py` passes with 0 flags.
- [ ] Odd-fps sources use blended conversion (no stutter).
- [ ] Everything eased in/out; min-duration asserts pass; pacing linter passes (≥ 3 s footage between devices, ≤ 1 device / 10 s, holds ≥ 3 s).
- [ ] Colour graded, consistent.
- [ ] Real SFX only (no synthetic).
- [ ] VO gaps cut (no padding beats).
- [ ] VO sync verified.

## Efficiency rules (owner: "don't keep examining the same stuff")
- Read THIS file + the case's assets. Do NOT re-study references; the system already encodes them.
- One contact sheet per source (1 fps) to pick windows. Build. One still sheet (1 frame / 3 s) per case, looked at once. Fix, render once.
- Re-render only changed ranges and splice (ProRes/intra or frame-exact).
- No frame-reviewer agents. No repeated QA.
