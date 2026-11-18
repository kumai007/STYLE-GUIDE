# PEAK V5: replaces the budgets in ROADMAP_ALGROW2 / LOCKED_SYSTEM_V4 (owner, 2026-10-26)

**Owner:**
- "2 previews show and both of em is fucked up"
- "its not peak its not animations, 3d motions, the best output that can be done"
- "frame glitch when u did transition from one clip to next"

The approved Case 1 v4 (Disasters2 `src/d2/c01` + `scenes3d/`) is the MINIMUM bar for EVERY case. The old "3D only 2–4 per video / map 1 per 3 cases" budgets are CANCELLED.

## Every case must have
1. **At least 1 Blender 3D scene** (Fern-style reconstruction, EEVEE 1080p, a moving camera, 4–10 s), placed where the VO explains:
   - the place (mall, bridge, street, factory, etc.), or
   - the mechanism (how it failed: comb plate, wheel, structure, wave).
   - Build it from simple, clean, lit geometry like `Disasters2/scenes3d` (c01). Never a cartoon, never a still.
2. **At least 1 more designed motion beat**, one of:
   - a Blender night-terrain map flyover (`n2map`);
   - a 3D diagram of the mechanism;
   - a tracked replay zoom/speed ramp on the key moment (only where the VO describes it);
   - a 2.5D parallax of a real photo.
3. **Footage is the backbone, but never more than about 15 s without designed motion.** Use:
   - eased punch-ins on VO beats;
   - replays with tracked zoom;
   - smooth sub-pixel push/drift on every shot.
4. **Entry card + date card + everything else in LOCKED_SYSTEM_V4** (the NEVER-AGAIN list still applies).

## Zero flash frames (the cause of the glitch in both previews)
- The news-copy sources carry the previous shot's tail and their own internal cuts. A window at `from: 0`, or one that crosses a source cut, gives 2–12-frame flashes.
- **BEFORE planning a shot:** detect the source's own cuts and start each window at least 3 frames AFTER a source cut. The window must not cross a source cut.
- **AFTER the chunk render:** `python "D:/404 Rendrer/_shared_tools/microcut.py" <chunk.mov>` must report 0 flags.
  - A designed glitch/strobe counts only if it lives in `n2fx` and lasts ≥ 6 frames per state.
  - Otherwise remove it.
- **Already-rendered chunks with flags (fix + re-render, splice where possible):**
  - CCTV1: c03, c05, c06, c08, c09, c18, intro (the 8.8–11.7 s 2-frame alternation: if it's a designed strobe, replace it with a ≥ 6-frame glitch).
  - CCTV2: c09–c12.
  - Disasters2: c03–c06.

## Previews to the owner
- ALWAYS the full mix: real raw audio, SFX, music, VO. Never VO-only.
- Phone h264 ≤ 29 MB.
- Send the lead ("main") the path; main sends it to the owner.

## Render
- Everything heavy goes through `bash "D:/404 Rendrer/_shared_tools/render_slot.sh" <cmd>` (2 slots machine-wide).
- Blender EEVEE scenes: aim for ≤ 20 min per scene; reuse a scene kit across similar cases (a mall, a road, a bridge, water).

## Owner addendum (2026-10-26): "every single thing is its own entertaining piece, a $1 million documentary"
1. **Show what the VO says, every line.** Each VO sentence gets a visual that SHOWS that exact thing:
   - real footage of it, if it exists;
   - otherwise a 3D/motion piece built for it (place, object, mechanism, number, timeline, cause).
   - Never generic filler, never a held shot that ignores the line.
2. **3D animation IS the motion.** Where the footage can't show it, animate it in Blender (camera moves, the mechanism acting out, the location built up). Not a still, not a slow push on a photo.
3. **Every beat is crafted:** its own camera move, its own SFX, timed to the VO words (word-anchored), eased in/out, so it feels like a $1M documentary (Fern/LEMMiNO level), never a template slideshow.

## Example menu: VO line type → crafted visual (use these, mix them, don't repeat the same one back to back)
| VO says | Build |
|---|---|
| A place/city ("in Changning, Shanghai") | Blender night-terrain flyover from country to district to building, with a glowing pin that drops and a thin route line drawing in |
| The building/site | 3D massing model of the building (clean grey + rim light), camera orbits; the floor/area of the incident lights up from inside |
| A mechanism ("the comb plate broke open") | 3D cutaway of the machine: the steps fold under the comb plate, the plate cracks, a slow-mo + x-ray section; stop before any human contact |
| A cause chain ("mop lodged → plate cracked → gap opened") | 3 linked 3D beats, the camera travelling from one to the next on one move (no cuts) |
| A vehicle event (wheel off, bus off a bridge, drift) | 3D road/bridge set, the vehicle as a clean low-poly model, the trajectory drawn as a light trail, the camera chasing it |
| Water/wave/flood/tsunami | Blender ocean/fluid sim over terrain, the water level rising against a scale ruler, the camera underwater → surface |
| Height/distance ("fell 10 metres", "300 m away") | 3D scale: a human silhouette next to the drop/building, a measure line drawing in, the camera tilting down the height |
| Time ("within 20 minutes", "two days earlier") | 3D clock/timeline ribbon flying past the camera, events as glowing markers along it |
| Numbers (deaths, injured, cost) | Number counter carved in 3D type, lit dark, the camera pushing through it (not text over footage) |
| Speed ("doing 120 km/h") | A speedometer needle built in 3D, or motion-blur streaks along the 3D road with a speed readout on the vehicle |
| Weather/time of day ("late evening, raining") | The 3D location relit: a sun-to-dusk time-lapse, rain particles, wet reflections |
| What the camera saw ("look at the top of the escalator") | A tracked replay: freeze, smooth zoom into the region, a soft vignette, play on in slow-mo (no circles) |
| A person ("a cleaner, surnamed Zhang, 35") | A faceless 3D figure in his work pose in the 3D set + a tiny name tag; never an invented face |
| A rule/law/investigation ("the mall suspended cleaning") | 3D document/page floating in dark space, the camera gliding over the real line (chip-lift), paper physics |
| A comparison ("third accident in one week") | 3D map of China with 3 pins dropping in date order, a line connecting them |
| An aftermath ("the escalator was closed") | 3D set with tape/barrier models, empty, dimmed lights, the camera slowly retreating |
| Backstory ("built in 2005, inspected last month") | 3D model assembling itself (construction), a date ribbon, then aging/dirt shaders creeping in |
| Sound cue ("listen to the radio here") | Real raw clip + an animated waveform in a 3D radio/bodycam housing, the subtitle typed |

## Non-Blender devices from the references (on disk; adapt in the channel look: ice-cyan accent, typewriter mono)
Fern device frames: `D:/titlecut/refs/docs3d/teardown/fern/devices/NN_*.png`. Library: `TemplateLibrary/CATALOGUE.md`.
| From | Device | Use when the VO says |
|---|---|---|
| Fern 01–03 | HUD bracket label: corner brackets snap around an object/person/place in the footage, a thin leader line, the label types in | it names a thing in the shot ("the comb plate", "the emergency stop") |
| Fern 12 | Dimension bracket: a measure line draws along an object with the value | a size/height/gap ("a 5 cm gap") |
| Fern 13 | Data box pinned to a moving object (tracked) | a fact about that object (model, age, load) |
| Fern 14 / 42 | Radio transcript HUD / waveform box: a live waveform + typed transcript lines | radio, 911 call, dispatcher audio |
| Fern 18 | Date engraved into the scene (on a wall/floor in perspective) | the date card, an alternative to a black card |
| Fern 20 | Document magnifier lens gliding over a real page | quoting a report/article line |
| Fern 23 / 29 | Flashback: an old-photo frame + archive film grade | backstory, "years earlier" |
| Fern 24 | Object morphs into a map icon, the camera pulls out to the map | going from the incident to where it is |
| Fern 25 | Radar rings over the sea/map | search/rescue, a ship, a missing person at sea |
| Fern 27 / 38 | Glitch wireframe hit / datamosh transition (≥ 6 f, designed) | a hard turn in the story |
| Fern 31 / 32 | CRT/old-desktop window treatment with a name tag on the window | online posts, forum, old internet |
| Fern 34 / 35 | Yellow highlighter sweep on article text | the key sentence of a news story |
| Fern 47 | Boxed film inset floating over a dark plate | showing a 2nd angle while keeping the context |
| Parallel Pipes | Chip-lift page: the real screenshot, the camera glides one direction, the active line lifts on a chip, the rest dims and then undims | any web/news/report text |
| LEMMiNO | Slow archival push + clean thin sans captions bottom-left (source, date) | real photos/documents; quiet, premium beats |
| LEMMiNO | Minimal line map: thin white coastlines on black, the place name in spaced caps, a slow drift | a calm place reveal between intense beats |
| Abyssal | Typed date with the year in colour; tiny name tag bottom-left | every case start; the first named person |
| Disturbing Dose | Freeze-punch + tracked replay with a slow zoom (no circles) | "look at…", "watch his left hand" |
| DD / VV | Speaker captions boxed beside the speaker | raw clips with talking |
| Visual Venture | Tilted print photo settling with a soft shadow, parallax layers (KenBurnsParallax) | a single real photo of a person/place |
| Farrell | Info-animation: clean icons + numbers building on the words (BuildOnWords, CountUp, IconGrid toll) | counts, money, victims (dignified) |
| Nocturn | Slow eased push + low drone + light film grain on the hold | tense pauses before a reveal |
| Library `timeline` | YearScroll / RulerTicker / DayStrip | "two days earlier", a sequence of events |
| Library `diagram` | MechanismLoop, StructureSection, ExplodedPart, ScaleCompare | how it failed (2D, when 3D is overkill) |
| Library `stat` | RollUp / RecedeNumber / ClockSweep | numbers, durations ("20 minutes") |
| Library `social` | PostCard / CommentStack / WatchPage | viral posts, comments, where the clip was first uploaded |
Rules: real footage first; ≥ 3 s footage between devices; never the same device twice in a row; every device eased, word-anchored, with its own SFX.

## OWNER 2026-10-26 (overrides the above): "2-3 is fine; use code under Remotion to make motions, not everything is Blender"
- At most 2-3 Blender shots per case, and only for the key mechanism/place. Short (3-5 s), light scenes (<= 15 s/frame, <= 4 GB RAM; test 1 frame first).
- All other motion: Remotion code (n2dev devices, animated SVG/CSS diagrams, counters, line maps, tracked replays, parallax).
- Terrain maps only if <= 15 s/frame; else LineMap_D / MapPull_D.
- Finish case by case. No helper sub-agents. Credit-frugal.

## 2026-10-26: APPROVED "awesom case, make peak cases like this give all of em fast"
- CCTV1 c06 + c07 v5 (build/preview/cctv1_c0{6,7}_v5_phone.mp4) are the GOLD standard for all 3 videos.
- The recipe: 3 short Blender shots (place / mechanism / aftermath) + Remotion code motion (n2dev Cutaway, DayStrip, ExplodedPart, etc.) for the other lines; source-cut-safe windows; microcut 0; full mix -16 LUFS.
