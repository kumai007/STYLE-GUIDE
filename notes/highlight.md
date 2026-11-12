# highlight family: HyperFrames port (STATUS: Highlight template DONE + verified; RisingComments/Grid not mine)

## Done
- `compositions/highlight/lib/highlight-engine.js`: port of contexts/resolve/framing/motion/Highlights/Plate/HighlightBar maths (seeded mulberry32 random, bezier easings, resolveLength).
- `compositions/highlight/Highlight.html` (general template, Level: Native). Variables: image, context, page, motionSeed, fps, durationInFrames, durationInSeconds, imageWidth, imageHeight, pageKind, pageColor, highlights, crop, overrides. Arrays/objects pass through `--variables` inline (declared as string in Studio since no object type exists).
- `tools/highlight-render.mjs <props.json> <out.mp4>`: inline-variables wrapper (untested; quoting of JSON through cmd may need adjusting).
- Asset: `assets/highlight/yt-comments.png` is 1920x7877, a long page: imageHeight MUST be baked into props.
- Smoke render OK: default comment props with crop -> 135 frames, 1920x1080, yuv420p, 30/1 (matches calculateMetadata: last wipe 2.665 s -> max(3,..)+1.5 = 4.5 s). Frame at 2.5 s looks right (red bar over "you did the right thing!").
- Scratch leftovers (safe to delete): `out/highlight/_t.mp4`, `props/highlight/_t.json`.

## Confirmed CLI facts (0.8.210)
- `--variables-file` FAILS ("io.readFile is not a function"): use inline `--variables '<json>'`.
- No root `data-duration` => length = timeline length, so props DO set length (proxy tween of frames/fps). A script-set data-duration is ignored. No length wrapper needed.
- fps comes only from CLI `--fps` (30000/1001 ok).

## TODO
1. `lib/prepare.py` (PIL): bake imageWidth/imageHeight, pageKind (mean luma/255 < 0.45 on a 64x64 downscale => dark), pageColor (mode of border pixels, channel round(v/4)*4) into props.
2. Copy every image referenced by videos.json from `templates/public/highlights/` to `assets/highlight/`; convert the 28 `videos.json` entries to `props/highlight/<ID>.json` (+ `Highlight.json`).
3. Render Remotion references into scratch/hf-port/highlight/ (CommentHighlights, NewsHighlights, one more; Highlight website + comment) and SSIM against HF (`render_diff.sh`); check mask, 3D, bar widths.
4. Port RisingComments (alpha MOV, 30000/1001, 200 frames; spec in Remotion `RisingComments.tsx`) and optionally Highlights-Grid (Still). Lens/grain stay in Remotion (lens>0 / grain>0 not implemented in HF).
5. Run `npx hyperframes check` / lint; add the SSIM table here.

No SSIM measured yet; nothing verified against Remotion.

## Progress (resumed session)
- Step 1 DONE: `tools/highlight-render.mjs` rewritten (node + npx-cli.js, shell:false, inline --variables, --fps, ffprobe print). Tested on prepared _t props: 135 frames, 1920x1080, 30/1, yuv420p.
- Step 2 DONE: `compositions/highlight/lib/prepare.py <props.json> [out]` (Pillow; 64x64 BOX downscale, luma<0.45 dark, border mode round(v/4)*4). yt-comments -> 1920x7877 dark #101010.
- Step 3 DONE: `compositions/highlight/lib/convert_videos.py`: 23 entries in videos.json (not 28) -> `props/highlight/<ID>.json` (image remapped to assets/highlight/<name>, prepared). No entry used lens>0/grain>0: none skipped. assets/highlight = 80 MB.
- Workflow: `python compositions/highlight/lib/prepare.py props/highlight/X.json` then `node tools/highlight-render.mjs props/highlight/X.json out/highlight/X.mp4` from graphics/hyperframes.
- FINDING: Remotion `motionSeed:"auto"` seeds from the image path STRING, so remapping the image path changes the camera. convert_videos.py now pins motionSeed to the original `highlights/<name>.png` (first SSIM run, before the fix: CommentHighlights mean 0.853 / min 0.835).
- SSIM helpers (scratch): `scratch/hf-port/highlight/ssim.sh <ID>` (relative outdir: ffmpeg filter option breaks on a drive colon), `run_hf.sh <IDs>`. Gate used: mean >= 0.90 (eval.md T3 data-driven threshold).

## Verification (SSIM vs Remotion, mp4 bt709/yuv420p both sides, gate >= 0.90)
| ID | frames | mean | min |
|---|---|---|---|
| CommentHighlights (comment, 30fps) | 195 | 0.9991 | 0.9989 |
| NewsHighlights (website, light) | 150 | 0.9973 | 0.9967 |
| S-Case4-Channel (website, dark, 29.97) | 205 | 0.9971 | 0.9946 |
| CommentHighlights-Reference (comment, overrides) | 240 | 0.9977 | 0.9964 |
- Frame counts, size, fps identical to Remotion. `hyperframes lint compositions/highlight/Highlight.html`: 0 errors, 0 warnings.
- Step 5 done: `_t.mp4` and `_t.json` deleted. Only 4 of 23 props verified; the other 19 are converted+prepared but not rendered.
- Not implemented (not used by any entry): lens>0, grain>0.
- Remaining TODO outside this task: RisingComments, Highlights-Grid.
