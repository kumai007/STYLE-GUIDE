# place-map family (Remotion PlaceMap / NocturnMap -> HyperFrames)

Level: **Native** (HTML + SVG + GSAP; the zoom/pan/fades are a pure function of time in `lib/place-map.js`, driven by one GSAP proxy tween's onUpdate and an `hf-seek` listener, with Remotion's `Easing.bezier` ported exactly).
Source: `templates/src/case/map/PlaceMap.tsx`, `themes.ts`, `src/case/nocturn/Map.tsx` (NocturnMap = `<PlaceMap theme="horror">`), `templates/tools/make_map.py`.

## Files
- `compositions/place-map/place-map.html` (id `place-map`, default theme `geo`, as the Remotion PlaceMap defaultProps)
- `compositions/place-map/nocturn-map.html` (id `nocturn-map`, default theme `horror`; thin alias: same markup + engine, only the default differs)
- `compositions/place-map/lib/place-map.js` (all four themes copied value-for-value, engine)
- `assets/place-map/fonts/`: `vcr-osd-mono.ttf`, `inter-latin-700-normal.woff2` (byte-identical copies of templates/public/fonts; "Nocturn Inter" = geo/news name, "VCR OSD Mono" = horror), `georgia.ttf` (atlas serif; Remotion used the system Georgia, this is the same system file copied; local use only).
- `tools/make_map.py`, `cache/places.json`, `tools/place-map-render.mjs`, `props/place-map/`.

## Variables (declared on `<html data-composition-variables>`)
text (string, Meteora), sub (string, Greece), theme (enum horror|geo|atlas|news; default geo / horror for the alias), frames (number, 180), fps (number, 30), mapSrc (string, ""). `map` (object) is accepted but not declared (not an editable type). Old keys `durationInFrames`, `data.theme` accepted; unknown theme -> horror as in themes.ts; width/height ignored (fixed 1920x1080).
Motion contract unchanged: log-zoom v0->v1 with centre following, ease.sine, no bounce; pulse only in horror (0.06), 0 on bright themes.

## Render (hyperframes@0.8.210 limits, confirmed)
1. `--variables-file` and `--variables <file>` fail: "io.readFile is not a function" (CLI passes undefined io). Inline JSON works but a map is ~400 KB (Windows argv limit), so variable `mapSrc` names a props file inside the project; the composition reads it with one synchronous local XHR. Doc keys are the base; a variable differing from its declared default wins.
2. Variables cannot change root `data-duration` (6 s = 180 f @30). `tools/place-map-render.mjs` patches a temp copy of the composition to frames/fps, renders, deletes the temp.

```
node tools/place-map-render.mjs props/place-map/meteora-geo.json [--comp place-map|nocturn-map] [--out out/place-map/x.mp4] [--format mp4|mov] [--workers 2]
```
Direct (180 frames only): `npx --yes hyperframes@0.8.210 render -c compositions/place-map/place-map.html --variables '{"mapSrc":"props/place-map/meteora-geo.json"}' -o out/place-map/x.mp4 --workers 2`
Opaque template (Remotion's Fit paints black, fades to black), so mp4 is the default; `--format mov` also works (ProRes 4444 yuva444p12le, verified) if a .mov is wanted. All outputs 1920x1080, 30 fps, 180 frames.

## Props pipeline
`python -I tools/make_map.py "Meteora" "Greece" --theme horror` -> `props/place-map/meteora-map.json` (same document as Remotion's; includes `theme`). Cached places need no network (cache copied; world-atlas read from templates/node_modules). Regenerated meteora map equals the old one except `v0`: the old `templates/props/meteora-map.json` predates the zoomed-in-start change (v0 = full frame); the current tool opens at 2.2x. Both verified.

## SSIM vs Remotion (png/bt709 Remotion render, render_diff.sh, 180 frames each)
| render | mean | min |
|---|---|---|
| geo (PlaceMap) | 0.9961 | 0.9946 |
| horror (PlaceMap) | 0.9981 | 0.9972 |
| atlas | 0.9952 | 0.9941 |
| news | 0.9978 | 0.9968 |
| nocturn-map vs NocturnMap (old props) | 0.9981 | 0.9972 |
| horror, regenerated props (new v0) | 0.9983 | 0.9975 |
Visual check of atlas and horror at t=3 s next to the originals: same framing, fonts, plates. Residual is Chromium version/antialiasing.

## Not exact / open
- Frame count != 180 changes motion timing correctly but needs the wrapper for file length.
- Atlas Georgia is a copied Windows font file (not redistributable); drop it and HF will fall back to local Georgia.
- `render -c` lint reported nothing in my runs; `hyperframes lint` 0/0 on place-map.html. Sync XHR for mapSrc is a deliberate workaround, remove once the CLI reads --variables-file.
- Left in Remotion: nothing else from this family.
