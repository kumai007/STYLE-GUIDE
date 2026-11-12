# highlight-extra: RisingComments + Highlights-Grid (HyperFrames port)

Both Level: Native (HTML + GSAP proxy clock, math ported 1:1; no Remotion). Self-contained: no dependency on highlight/lib.
Props live as variables; defaults = the Remotion defaults. `props/highlight-extra/*.json` hold the same values.

## RisingComments (`compositions/highlight-extra/RisingComments.html`)
- Reusable template: variables `cards` (JSON: author, avatar, segs[{t,hl}], at, hlAt, hlDur, optional height; empty height = measured via offsetHeight), accent, lead, fps, durationInFrames, colRight, colWidth, stackBottom, gap, drift.
- Alpha ProRes 4444 (HF mov = yuva444p12le, same as Remotion's). Length = durationInFrames/fps (200 @ 30000/1001 = 6.673 s).
- Render: `npx --yes hyperframes@0.8.210 render -c compositions/highlight-extra/RisingComments.html --fps 30000/1001 --workers 2 --format mov -o out/highlight-extra/RisingComments.mov` (add `--variables '<json>'` for other cards; pass JSON inline, `--variables-file` is broken).
- Font: Inter variable TTF (assets/highlight-extra/fonts) pinned to opsz 14. Without that pin text is narrower than Remotion's Google Inter and wraps differently (SSIM 0.968 -> 0.991).
- SSIM (both mov flattened on #506070, yuv420p, render_diff.sh): mean 0.991, min 0.986 (200/200 frames).
## HighlightsGrid (`HighlightsGrid.html`)
- Still picker, 1 frame (timeline 1/30 s). Variables: image (file name in assets/highlight-extra/), crop JSON, imageWidth/imageHeight (must be given; Remotion read them from the file).
- Render: `npx --yes hyperframes@0.8.210 render -c compositions/highlight-extra/HighlightsGrid.html --fps 30 --workers 2 -o out/highlight-extra/HighlightsGrid.mp4` (then `ffmpeg -i ... -frames:v 1 grid.png`). Labels are identical numbers.
- SSIM vs `remotion still` PNG (as 1-frame yuv420p mp4): 0.979. Residual: HF renders the "Courier New" labels a little bolder than Remotion; label text is not the thing you read, accepted.
## Assets
assets/highlight-extra/yt-comments.png (8.8 MB), fonts/inter-variable-opsz-wght.ttf (+OFL). Scratch: scratch/hf-port/highlight-extra/.
## Open
Lint: 0 errors, 0 warnings on both files.
