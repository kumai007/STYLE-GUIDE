# Case-video templates (graphics/hyperframes)

Project: `C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes` (HyperFrames 0.8.210; Remotion retired 2026-10-28,
`graphics/templates` kept for legacy re-renders). Cards are `compositions/case-cards/<Id>.html`. Render from that folder:
`node tools/hf-case-render.mjs <Id> out/case-cards/<x>.mp4 --props props/case-cards/<x>.json` (or `--set k=v`). Never
call `hyperframes render --variables-file` (broken in 0.8.210). NocturnVcr needs an explicit `data.mode`: `label`/`rewind`
render alpha mov, everything else opaque mp4. `image` may be a path or a data URI. Maps: `node tools/place-map-render.mjs`
with props from `python -I tools/make_map.py` (both in graphics/hyperframes; see graphics/TEMPLATES.md).
Every composition is 1920x1080 @ 30 fps, and its length comes from the `frames` prop. Common props are
`text, sub, width, height, fps, frames`. Images are passed as data URIs: `image` + `imageWidth`/`imageHeight`,
`image2` + `image2Width`/`image2Height`, and `images[{src,w,h}]` for lineup tiles. `data.at` holds element times in
seconds, so timed card SFX can land on them.

Placing a card in Premiere:
- Import it, place **picture only** (HyperFrames renders carry no audio, but legacy Remotion `.mov`s have a silent track), and check its frame count first.
- Cards over footage are ProRes 4444 **with alpha: pass `--codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png`** (4444 alone is opaque; ffprobe pix_fmt must start `yuva`). Cards on black can be ProRes 422 or H.264.
- Its text (names, dates) is burned in. When the user needs to edit text, set it with Premiere's own text over a
  textless render (workspace rule).

## Nocturn (the default look for case videos)
| Composition | Default f | Use it when | Key props |
|---|---|---|---|
| NocturnCaseCard | 135 (4.5 s) | Every case opens with it. VCR OSD Mono 180 px, uppercase, white on true black, 190x6 rule above. Timing: 0.4 s black, 0.5 s fade in, hold, 0.5 s fade out, 0.3 s black. The same card every case. | `text: "Case One"` |
| NocturnChannelPlate | 180 | The clause that names the channel. It shows the channel page in dark mode as a 3D plate: perspective 2200, rotateY -7, rotateZ -1.2, push 1.02 to 1.10 on sine, drifting down, focusing in from a 16 px blur over 0.35 s, vignette 0.3. Capture the page 2880 px wide (memory *Screenshots in dark mode*). | `image`, `imageWidth`, `imageHeight` |
| PlaceMap / NocturnMap (= theme horror) | 180 (HCE 240-420) | The first time a place is named. `theme` by niche: horror (default) / geo / atlas / news, see graphics/TEMPLATES.md. A plain black outline map with a slow zoom to about 4x, the region tinted red, the place in red with a glow, and the name in VCR. Find the place from the script text, so a misheard name still works. | `map` from `python -I tools/make_map.py "<place>" "<region>"` |
| NocturnCouple | 120 | A named person or pair: face stills side by side, slow constant zoom, names below matched to the faces. One image gives one wider panel. | `text: "PHILLY & KEELY"`, `image`, `image2` |
| NocturnLineup | 150 | A line that counts people. Tiles in rows and columns (4 over 3) that ease in (0.7 s fade and settle from 1.12x, 2 degrees, no flash), with a gentle zoom and a dip to black. Never use a number card instead. | `images[]`, `data.names[]` |
| NocturnStakes | 150 | A stakes line such as "seven of eight went out alone", over the case's own frame. | `text`, `sub`, `image`, `data.accent` |

Typed dates, times and facts (VCR, bottom left, 0.06 s per character) and the REWIND label have no composition. Use
native Premiere text with the timing in rules.md section 8. So do the series title, chronology, readings,
POI rings, temperatures and diagrams: those cards were removed on 2026-10-20 at the user's request. Red audio-wave plates are retired (2026-10-19).

## HCE (Winter Camping "evidence file") - only when the user picks HCE
`HCE-ChannelPlate`, `HCE-Stakes`, `HCE-Couple`, `HCE-Lineup`, `HCE-AudioTrace` (90 f maximum; `data.peaks` measured
from the real audio). The look and timing are in `style-hce.md`.

## Map fallback
If Nominatim doesn't know the place, `make_map.py` exits and says so. Use a drone stock clip whose tags name the place
(one per place), or restructure the beat (memory *Unsourceable place*). Never fake the place.

## Older cards (other series)
CAMP-E used a 150 px VCR PNG card, 97 f (memory *CASE card recipe*). The police series uses the GN reference kit.
For case videos, use NocturnCaseCard.
