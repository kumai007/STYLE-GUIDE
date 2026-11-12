# Remotion → HyperFrames port (2026-10-28)

Source: `graphics/templates` (legacy Remotion). Method: skill `hyperframes:remotion-to-hyperframes`.
Every template below is **Native** (HTML + CSS/SVG + GSAP): every element, variable and prop is editable in Studio.
Verified = per-frame SSIM against a Remotion render (png + bt709), mean / min over every frame. Detail per family in `notes/<family>.md`.

| Family | Compositions | SSIM mean / min | Render | Not translated |
| --- | --- | --- | --- | --- |
| hook-intro | `hook-intro` | 0.9853 / 0.8198 (1260 f) | `node tools/hook-intro-render.mjs <props> <out.mp4>` | CameraMotionBlur on montage windows (all of the loss; HF `data-motion-blur` did nothing) |
| place-map | `place-map`, `nocturn-map` | 0.9952–0.9983 / ≥0.9941, 4 themes | `node tools/place-map-render.mjs <props> [--comp nocturn-map] [--format mov]` | map geometry passed as `mapSrc` file (too big for argv) |
| highlight | `Highlight` (+23 per-video props) | 0.9971–0.9991 / ≥0.9946, 4 checked | `node tools/highlight-render.mjs <props> <out>` | lens, grain (no per-video entry uses them); 19 props unrendered |
| highlight-extra | `RisingComments`, `HighlightsGrid` | 0.991 / 0.986; grid 0.979 (1 f) | `npx … render -c compositions/highlight-extra/<id>.html --fps …` | grid labels slightly bolder |
| kw | `frame-circle`, `audio-wave` (+44 props) | 0.985–1.000, 10 checked | `node tools/kw-render.mjs <comp.html> <props> <out>` | wave generator (`wave_env.py`) was deleted 2026-10-24; 34 props unrendered |
| overlays | `TitleCard`, `CaseCard`, `LowerThird`, `Emphasis`, `LocationStamp` | ≥0.99999 / ≥0.9999 | `node tools/render-overlay.mjs <Id> <out.mov> [--props f] [--set k=v]` | — (alpha mov, no audio stream) |
| glitch | `glitch-number` | 0.9972 / 0.9739 | `npx … render -c compositions/glitch/glitch-number.html --variables '{…}'` | feTurbulence noise differs slightly in burst frames |
| case-cards | 6 Nocturn* | 0.9803–0.9998 / ≥0.9787 | `node tools/hf-case-render.mjs <Id> <out> --props <f>` | Remotion `Fit` dropped: 1920x1080 only |
| case-cards | 5 HCE-* (shared `lib/hce.js`) | 0.9894–0.9934 / ≥0.9843 | same wrapper | AudioTrace checked only with made-up peaks; some prop variants untested (`notes/case-cards.md`) |

Not ported (stay Remotion, re-render only): HPaper/Pencil*, per-video one-offs (Case5-*, Case6-*, Case8-*, S-Case*), `AnalogFX.tsx` (never registered), `editor-v5/MASTER_TEMPLATES`.

## HyperFrames 0.8.210 facts found during the port

- `render --variables-file`, `--variables <path>` and `--variables -` all fail (`io.readFile is not a function`). Pass JSON inline; the wrappers spawn node + `npx-cli.js` with `shell:false` so cmd does not mangle quotes and `&`.
- Variables do not change a static root `data-duration`. Wrappers patch a temp copy. (kw writes `data-duration` from a variable in its init script and that renders the right length — untested elsewhere.) A root with no `data-duration` takes the GSAP timeline length.
- fps comes only from `--fps`. A `-c` file must be a full HTML document.
- `render -c` prints "Lint: N error(s)" while `hyperframes lint` reports 0; renders are correct.
- HF cannot freeze a `<video>`: hold frames need poster PNGs (`NN.first.png`).
- Inter variable font needs `font-variation-settings: "opsz" 14` to wrap and weigh like Remotion (0.968 → 0.991).
- Remotion `motionSeed:"auto"` seeds from the image path string: keep the original path as the seed when assets move.
- `render_diff.sh` needs a relative output dir on Windows (the drive colon breaks the ffmpeg filter).
- GSAP is vendored at `assets/vendor/gsap-3.14.2.min.js` (byte-identical to the jsdelivr file); no composition loads it from a CDN, so renders work offline.
