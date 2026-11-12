# Overlays + Glitch port (Remotion to HyperFrames 0.8.210)

Sources: `graphics/templates/src/presets/nocturnfx/{Root.tsx,overlays.tsx,style.ts,anim.ts}` (overlays), `graphics/templates/src/glitch/{GlitchNumber.tsx,Root.tsx}` (glitch).
Port level for everything: **Native** (no Remotion code hosted, no media). Each overlay is a pure function of the frame number, driven from a paused GSAP timeline `onUpdate`.

## Files

- `compositions/overlays/{title-card,case-card,lower-third,emphasis,location-stamp}.html`
- `compositions/overlays/lib/rm.js` (exact ports of Remotion `spring`, clamped `interpolate`, `envelope`, `enter`, `drift`, `rand`; `RM.mount`) and `lib/overlays.css` (fonts, tokens)
- `compositions/glitch/glitch-number.html`, `compositions/glitch/lib/gm.js` (Remotion `random()` mulberry32, `Easing.bezier`, perceptual-scale interpolate)
- `assets/overlays/` (gsap, Bebas Neue, Inter variable), `assets/glitch/` (gsap, Inter variable)
- `props/overlays/*.json` (20 example props copied from `templates/props/overlays/`), `props/glitch/{default,day}.json`
- `tools/render-overlay.mjs` (wrapper, see below)

## Overlay wrapper

```
node tools/render-overlay.mjs <TemplateId> <out.mov> [--props file.json] [--set key=value ...]
node tools/render-overlay.mjs --all          # smoke: renders all 5 to out/overlays/_smoke-<id>.mov
```
Ids: TitleCard, CaseCard, LowerThird, Emphasis, LocationStamp. Same CLI shape as the old `graphics/templates/render-overlay.mjs`.

Why a wrapper: in 0.8.210 `render --variables-file` fails ("io.readFile is not a function") and a variable cannot change render length (only root `data-duration` does). The wrapper merges the props over the declared defaults, writes a temp copy of the composition next to the original (`.tmp-<pid>-<file>`) with the merged values baked into `data-composition-variables` and the root `data-duration` set to `durationInFrames/30`, renders `render -c <tmp> --format mov --workers 2`, deletes the temp, then ffprobes: requires a `yuva*` pix_fmt, frame count equal to `durationInFrames`, and no audio stream (strips one if found). Exit 0 ok, 1 fail, 2 usage.
Output is ProRes 4444 `yuva444p12le`, 1920x1080, 30 fps, no audio (the Remotion original is also `yuva444p12le`).

## Overlay variables (all also take `durationInFrames`, number)

| Template | Variables (default) | Default frames |
|---|---|---|
| TitleCard | kicker "Case File", title "The Missing Hours", subtitle "What the timeline actually shows", accent color #C1121F, align enum center/left (center) | 90 |
| CaseCard | number "01", label "Case", title "Nobody Came Back", accent | 75 |
| LowerThird | name "Marcus Chen", role "Urban Explorer", accent | 105 |
| Emphasis | text "Three hours later", accent, y number 0.68 | 45 |
| LocationStamp | location "Ravenswood Asylum", date "11 NOV 2019", detail "02:14 AM", accent | 90 |

## Verification (overlays)

Method: Remotion original rendered `--codec=prores --prores-profile=4444 --image-format=png --pixel-format=yuva444p10le --color-space=bt709 --muted --concurrency=2`; HF via the wrapper (`--workers 2`); both composited over flat grey 0x555555 (alpha is not comparable by SSIM directly), then `render_diff.sh` (threshold 0.95). Every frame of every render is compared (stronger than sampled snapshots).

| Case | frames | SSIM mean | SSIM min |
|---|---|---|---|
| TitleCard default | 90 | 0.99999 | 0.99993 |
| TitleCard `{"kicker":"Case File","title":"A Much Longer Title Goes Here","subtitle":"","align":"left","durationInFrames":120,"accent":"#2b7fff"}` | 120 | 0.99999 | 0.99990 |
| CaseCard default | 75 | 0.99999 | 0.99998 |
| CaseCard props/p-case.json (150 f) | 150 | 0.99999 | 0.99997 |
| LowerThird default | 105 | 1.00000 | 0.99999 |
| LowerThird `{"name":"Dr. Elena Vasquez","role":"","accent":"#1fa36b","durationInFrames":70}` | 70 | 1.00000 | 0.99999 |
| Emphasis default | 45 | 0.99999 | 0.99993 |
| Emphasis props/p-e1.json (135 f) | 135 | 0.99999 | 0.99996 |
| LocationStamp default | 90 | 1.00000 | 0.99998 |
| LocationStamp `{"location":"Cold Spring Quarry","date":"3 MAR 2021","detail":"","durationInFrames":60}` | 60 | 1.00000 | 0.99998 |

`render-overlay.mjs --all` ran clean (all 5: right size/fps/frame count, yuva pix_fmt, no audio). Not run: the other 15 example props files (p-case-juan/lucas, p-e2, p-e3); they use the same code paths as the two CaseCard/Emphasis prop sets above.
No `snapshot --against` was run for the overlays: the per-frame SSIM over the whole clip covers every scene and both sides of every fade.

## Glitch (Glitch2025)

Source `GlitchNumber.tsx`. 1920x1080, 60 fps, 120 frames (2 s), opaque black, so **mp4** (h264 yuv420p). Fixed length, no wrapper needed.
Variables: `prefix` string "202", `from` string "5", `to` string "6".
Render:
```
npx --yes hyperframes@0.8.210 render -c compositions/glitch/glitch-number.html --workers 2 -o out/glitch/glitch.mp4
npx --yes hyperframes@0.8.210 render -c compositions/glitch/glitch-number.html --variables '{"prefix":"DAY ","from":"1","to":"2"}' --workers 2 -o out/glitch/day.mp4
```
Port notes: `random()` is Remotion's own string-hash mulberry32, so the glitch bursts land on the same frames with the same slice offsets. The 3 RGB channels x 10 clip-path slices are built by script at load (a deviation from hand-written markup; it is the same DOM Remotion produces). Fonts: Inter 900 with `font-variation-settings: "opsz" 14` (Remotion loads the Google static instance, which is the opsz 14 design; without this the variable font auto-picks opsz 32 and the glyph shapes differ, SSIM mean 0.983 instead of 0.997).

| Case | frames | SSIM mean | SSIM min | p05 |
|---|---|---|---|---|
| default (2025 to 2026) | 120 | 0.99722 | 0.97385 | 0.99099 |
| `{"prefix":"DAY ","from":"1","to":"2"}` | 120 | 0.99737 | 0.97356 | 0.99146 |

Both pass the 0.95 tier. Frames outside the bursts sit at about 0.998 to 1.0. The residual is in burst frames (worst: frames 71, 46, 73, 47): the feTurbulence noise layer (opacity 0.09*g) rasterises with a slightly different texture and brightness in HF's software renderer than in Remotion's ANGLE GL renderer (noise-only corner crop SSIM about 0.91 at frame 50; mean luma 7.2 vs 8.0 at frame 46). Not fixed: it is a renderer difference in a near-invisible layer, and removing or replacing the noise would change the look.
`snapshot --against rem_d.mp4` at 0.05, 0.75, 0.77, 0.92, 0.95, 1.08, 1.3, 1.4, 1.9 s (project copy in scratch) matched visually. Caveat: `--at` is an exact instant, so 1.08 s (frame 64.8) rounds to frame 65 here while the reference decoder picks frame 64, which is on the burst boundary; this is a snapshot sampling artifact, the full render matches frame for frame.

## What did not translate exactly

- Mono font: JetBrains Mono is not installed on this machine, so Remotion fell back to Consolas for the LocationStamp date line. The port declares `@font-face "NFX Mono" local("Consolas")` to reproduce the original render. On a machine without Consolas it falls back to Courier New. Ship a JetBrains Mono file if the intended look is wanted.
- Bebas Neue is declared at weight 400 only so Chromium faux-bolds weight 700 exactly as in Remotion (TitleCard). Do not "fix" this.
- `variable` values do not change render length in 0.8.210; always render overlays through `tools/render-overlay.mjs` when `durationInFrames` differs from the default.
- `hyperframes lint` reports a warning `subcomposition_linked_style_names_root_id` for `lib/overlays.css` (rule on `#root`). Harmless standalone; if embedding an overlay as a sub-composition, give the host 1920x1080 itself. `render -c` may print "Lint: 1 error" while `lint` reports 0 (known, unexplained).
- Glitch noise texture (above).
- Not machine-verified: overlays with props other than the sets in the table.

## Left in Remotion

- `graphics/templates/src/presets/analog/AnalogFX.tsx`: confirmed unregistered (not referenced from any `Root.tsx`; the only grep hit for "analog" in `src` is the file itself). Not ported. Nothing else in the overlays/glitch families was left behind.
- The original Remotion `render-overlay.mjs` and projects stay as the reference for diffing; nothing was modified there.
