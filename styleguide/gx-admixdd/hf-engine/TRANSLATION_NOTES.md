# Translation notes: Remotion `engine/` -> HyperFrames `hf-engine/` (pilot case12)

## Kept 1:1
- Math: `random` (same seeded hash, no Math.random), `Easing.bezier` (verbatim), `interpolate` (clamp/extend/identity), `EASE`, `ease`,
  `drift`, `moveCss`. Same seed strings as the TSX (c12a, c12b, c12dm, dn/dx/... film seeds).
- Shot windows = `C12_SHOTS`: start = F(c) - floor(n/2); end = F(to) + ceil(next.n/2) when the next shot is not hard.
  (A first build used `+ next.n`: shots before dissolves ran 6 frames long, which also changed their move/push speed. Fixed.)
- Filters stay live in the page: `v6film` (chroma fringe + halation) on the shot container, `c12thr` (TH-r 4-level table), CSS filters
  (contrast/saturate/brightness/blur). No baking.

## Changed on purpose
- Video copies: Remotion renders the same `<OffthreadVideo>` many times (SL3 side panels, 9 smear bands). Here each copy is its own
  `<video>` timed only to the window it is shown in (static structure, nothing created per frame).
- `<Freeze>` past the last usable frame = an ffmpeg-extracted still `<img>` shown after `last`; the clip's audio stops at the hold
  (Remotion's Freeze also stops audio).
- Grain: Remotion made one `<filter>` per seed (frame % 113). Here one filter whose `feTurbulence seed` is set every frame. Same noise.
- Videos use `object-fit: contain` (OffthreadVideo letterboxes inside non-16:9 boxes such as the SL3 side panels; measured).
- Root `data-fps="60"`; runtime = paused GSAP proxy tween + `hf-seek` listener calling `GX.render(t)` (pure in t, seekable).

## V7Trans + audio (gx-core, 2026-11-16)
- `interpolate`: full numeric port (findRange, clamp/extend/identity/wrap, per-segment easing arrays, 1-point range). Remotion's
  multi-segment "extend right" loop only runs for `Easing.spring` with allowTail (`remotionShouldExtendRight`), never used by gx.
  Compared with remotion 4.0.532 `interpolate` on 14.6k inputs (linear / EASE / inOut(cubic), 2- and 4-point, clamp/extend): diff 0.
- GlitchIn: main copy = the shot itself (opacity `full`, translateX(split), hidden when full = 0); 8 band copies are separate
  subtrees whose media is timed only to [0, n) of the shot (`ctx.kids(node, [0, n])`), display toggled per frame; 3 tear lines,
  scanlines at 1 - p. Same seeds (`${seed}o/t/h/x/s${st}${k}`), steps held 2 f. Copies keep the child's audio setting (as Remotion;
  Case1/Intro clips are muted).
- PushIn / PushOut / DipOut: same eased interpolate calls; wrappers fall back to no style where the TSX returns bare children.
- SlabIn (Intro k 'slab'): RgbSlab seed 'si' over the body while f < 6; own device name (a case's own 'RgbSlab' cannot clash).
- Nesting = `<Trans>`: body -> PushOut/DipOut -> Dissolve/GlitchIn/PushIn. Windows: next shot extends the out side only if not hard/slab.
- Raw-sound envelopes (Case1 AU): Remotion `volume(f)` sampled per frame, collinear points dropped -> HF `data-automation` volume lane
  (t from clip start, linear between points) on an `<audio src=raw.mp4>`; `data-volume="1"`. Per-frame values are exact at the
  breakpoints; Remotion steps volume per frame, HF ramps linearly between them (difference < 1 frame of ramp).

## Check warnings accepted (0 errors)
- duplicate_media_discovery_risk: SL3 (3 copies) and SmearIn (9 bands) use the same src/start/duration on purpose.
- heavy overlay count (~50 timed media), vo5 slot 10.00 s vs 9.94 s media (slot shortened to the file, as in Remotion),
  craft line_unread on short raw captions (timings copied from the source), sparse-keyframe source clips (render unaffected).

## Verification (diff vs `productions/gx-dashcam20/build/pic/case12_pic.mp4`)
- Project mode (snapshots, 106 times): mean 0.920, min 0.790, 21 times < 0.90. After the window fix, re-diff of those 21 + 20 spot
  times: unchanged to 4 decimals.
- Every frame < 0.90 is night dashcam footage; the worst cells are near-black corners. Side by side they are identical by eye;
  corner mean RGB within ~1 level, low-pass mean abs diff < 1 level, no frame offset (offset 0 scores best). The loss is fine noise in
  near-black areas, where SSIM has almost no signal. Not a device error.
- Rendered video (2-s test render 84.9-86.9, `diff ref clip.mp4 --offset -84.9`, 7 times incl. the smear): mean 0.958, min 0.919.
  The same times in project mode scored 0.889-0.953: snapshot mode understates by ~0.03-0.04 on dark footage.
- Gate (mean >= 0.95, none < 0.90) is not reachable in project mode on this footage; it is met on the rendered clip except the first
  smear frame (85.0 = 0.919 > 0.90, pass). Verify the full gate on the farm render: `diff ref case12_render.mp4 --at <at.txt>`.
- `hyperframes check --json`: ok, 0 errors (warnings listed above, 10 info container_overflow = intended overscan).

## Render (local 2-s test, this laptop)
- `render --start 84.9 --end 86.9`: 120 frames 60 fps + audio, 387 s wall = 3.2 s/frame end to end (startup + media extraction
  included); capture ~1.0 s/frame per worker (2 chunks in parallel). BeginFrame capture failed on the probe and the chunk was
  retried in screenshot mode (slower). Open: find which layer forces screenshot mode (SVG filters / mix-blend suspected).
- Cause of the screenshot fallback (agent 4): hyperframes 0.9.56 requests BeginFrame only on Linux with the headless shell
  (`requestedCaptureMode = headlessShell && platform === "linux" ? "beginframe" : "screenshot"`). On Windows every chunk launches in
  screenshot mode; the chunked path then throws "probe selected screenshot capture" and retries (~20 s lost per chunk). Not caused by
  the composition. On the Linux farm BeginFrame is requested; check the farm log for "BeginFrame liveness probe failed" (content trigger).
- Per-layer cost, local screenshot mode, 84.9-85.4 (30 frames), `-q draft -w 1`, capture phase only:
  A base 32.7 s (1.09 s/frame) | B no root `filter:url(#v6film)` 28.4 s (0.95) | C no grain rect 40.3 s (1.34) | D neither 56.2 s (1.87). C and D ran while the laptop was busy (wall 639/1137 s): noise.
  Filters cost at most ~13 %; wall time (266-639 s) is dominated by startup + media extraction. Look kept as is; no engine change.

## case01 (gx-core, 2026-11-16)
- Build exit 0 (56 shots, 57 timed media, 7 raw-sound lanes); check ok, 0 errors.
- Diff vs `case1_pic_v2.mp4`, snapshot mode, 70 times (`verify/case01_at.txt`): mean 0.913, min 0.798 - local gate (0.92 / 0.85) not
  met yet. Glitch (0.92-0.94), dips (0.96-1.00) and dissolves match. Worst = R7 police cam (250, 257): the ffmpeg-exact source frame
  matches the reference; the snapshot shows a neighbouring frame of fast motion (sparse keyframes) - render-verify pending.
  Pages / road shots at 0.87-0.89 not inspected yet (see side notes gx-core.md).
