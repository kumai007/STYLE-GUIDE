# hook-intro (HookIntro) - HyperFrames port notes

Source: `graphics/templates/src/presets/hook/HookIntro.tsx` (comp `HookIntro`, 1920x1080 @ 60, opaque, silent).
Target: `compositions/hook-intro/hook-intro.html` (standalone doc, fps 60, one file).
Wrapper: `tools/hook-intro-render.mjs`. Port level: **Hosted-style Native**: text/layout are HTML with `data-var-text`;
all animation is one `renderAt(t)` function (hf-seek + a paused GSAP tween) mirroring the TSX math 1:1; videos are real `<video class="clip" muted>`.

## Variables (Remotion prop names/defaults kept; templates/props/hook-ps.json works unchanged)
clips (array of {src,label,aspect?}; src relative to `assets/hook-intro/`, e.g. `hook-ps/00.mp4`), kicker, title, accent, tag (string),
hook (array of words), hookAccent (number, index of red word), cta, ctaRest (string). No durationInFrames-style keys existed.
Length = (210 + 100*clips + 450) frames, computed from the clip count.
NOTE: TEMPLATES.md says "240 + 105 x clips + 390"; the source (HookIntro.tsx, newer) is 210/100/450. Equal only at 6 clips. Source followed.

## Render
`cd graphics/hyperframes && node tools/hook-intro-render.mjs ../templates/props/hook-ps.json out/hook-intro/hook-ps.mp4`
(wrapper = needed: 0.8.210 `--variables-file` and a variables path both fail "io.readFile is not a function", so JSON goes inline;
root `data-duration` is static, so the wrapper patches it into a temp copy `_render-tmp.html`, renders, deletes it. Direct
`render -c compositions/hook-intro/hook-intro.html --variables '<json>'` works for 6 clips, whose default length is 21 s.)
Output: h264, yuv420p, 60 fps, 1260 frames for hook-ps (7.2 MB, ~2.5 min at --workers 2). 4-clip test: 1060 frames, correct.

## Assets (copied, 11 MB)
`assets/hook-intro/hook-ps/NN.mp4` (7.1 MB, the 6 clips) + `NN.first.png` (frame 0, see below), `assets/hook-intro/fonts/{Helvetica-Bold,Bahnschrift}.ttf`.
New clip sets: put mp4 under `assets/hook-intro/<set>/` and a poster `NN.first.png` beside each:
`ffmpeg -i NN.mp4 -frames:v 1 NN.first.png`. Reason: Remotion holds each window on the clip's first frame while it waits far away
(Freeze); HF cannot freeze a `<video>`, so a poster `<img>` shows until playback starts, then the video (timed to start exactly then).

## Verification (Remotion render of hook-ps.json: png frames, bt709, crf 12 vs HF; render_diff.sh)
All 1260 frames: SSIM mean 0.9853, min 0.8198 (threshold 0.85 in render_diff default; eval tier T3 0.90 mean passes).
By section (mean/min): title card 0.9996/0.9995; montage 0.9705/0.8198; hook line 0.9982/0.9006; subscribe 0.9990/0.9985.
Video frame alignment checked by shifting HF against Remotion on frames 455-470 window crop: best SSIM at offset 0 (0.970; +-1 frame 0.96, +-2 0.94), so 30 fps clips seek frame-accurately in the 60 fps comp. 4:3 clips (00, 04, 05) are in range.
`hyperframes snapshot --against` was NOT used: snapshot/check take only a project dir (index.html), no `-c` / variables. Frames were compared via ffmpeg SSIM + look.sh sheets instead.

## What does not translate exactly
- **Camera motion blur** (Remotion `CameraMotionBlur`, 8 samples, 180 deg): not reproduced. HF `data-motion-blur="on"` (+events, shutter 180) was tried: it reports `movers=0` and changes nothing (3D-transformed windows not detected); reverted. This is the whole SSIM loss: lowest frames (0.82-0.93) are the fast fly-past of the last window (frames ~760-830) and the mid-step peaks. Geometry, fog, labels, timing match. Possible later fix: directional SVG blur per window.
- Fog `brightness()` filter replaced by a black overlay with opacity (1-fog) (mathematically identical) and the outline colour scaled the same way.
- Lint: render prints "Lint: 2 error(s)" (unlisted by --lint-verbose in my runs); render completes. Not investigated further.
- The `clips` / `hook` variables are typed "array", not in the documented type list; works (warning only, not --strict-variables).

## Left in Remotion
Nothing in this family. (The motion-blurred look remains slightly better in the Remotion render.)
