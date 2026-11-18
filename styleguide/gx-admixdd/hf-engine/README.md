# gx hf-engine: the gx case engine on HyperFrames (no Remotion)

One standalone HyperFrames project per part (`parts/<part>/`), generated from a shot table plus device modules.
Pilot: `case12` (port of `engine/src/Case12.tsx`). **2026-11-16: the old Remotion `engine/` was removed from this PC.** Its text source
(`S/styleguide/gx-admixdd/engine/src/...`) is in `Videos\CLAUDE\LEARNINGS\remotion_source_2026-11-16.zip` (see its README); all media moved
to `hf-engine/media/<dir>` (the default media root; `GX_ENGINE_PUBLIC` still overrides). The Remotion pic references
(`productions/gx-dashcam20/build/pic`) were deleted too: verify new ports against `finals/gx-dashcam20/gx_dashcam20_FULL_share.mp4`.

## Layout
- `lib/gx.js` - exact ports of the Remotion math (random, Easing.bezier, interpolate, ease, drift, moveCss) + the per-frame runtime.
- `devices/shared.mjs` - devices every case uses (Clip, Move, Frame, Foot, Ins, Raw, RawCaps, FadeOut, Vignette, Film) + V7Trans
  (Dissolve, GlitchIn, PushIn, PushOut, DipOut) + RgbSlab / SlabIn.
- `devices/<case>.mjs` - the case's own devices (`c12.mjs`: SL3, TitleCOb, ThrR, SmearIn).
- `cases/<part>.mjs` - the shot table (1:1 from the TSX) + VO + fonts.
- `build.mjs` - writes `parts/<part>/index.html`, `hyperframes.json`, `meta.json`, `assets/` (fonts, freeze stills, `media` junction).
- `fonts/` - the woff2 files @remotion/google-fonts loaded (latin).

## How it works
- Static HTML: every element and every `<video class="clip">` is written once with a stable id. Copies a device needs (SL3 side panels,
  smear bands) are separate videos, each timed only to the window it is shown in. Structure never changes per frame.
- Video timing = Remotion's: `data-start = (shotStart + w0)/60`, `data-media-start = (round(trim*60) + w0*speed)/60`,
  `data-playback-rate = speed`. `vol > 0` -> `data-has-audio="true" data-volume`, else `muted`. Raws = volume 1, BED = 0.063.
- Runtime: one paused GSAP timeline (proxy tween, `onUpdate`) + an `hf-seek` listener call `GX.render(t)`. It hides shots outside
  `[data-s, data-e)` (frames) and calls each device's `render(el, f, p, GX, S)` with the shot-local frame `f`. Pure in t, seekable.
- Shot windows = `Case*.tsx` C*_SHOTS: start = F(c) - floor(n/2); end = F(to) + ceil(next.n/2) when the next shot is not a hard cut.

## Device contract
```js
export const Name = {
  name: 'Name',
  html: (p, ctx, node) => '<div ...>',               // static markup; ctx.dev('Name', p) marks the element the runtime renders
  render: function (el, f, p, G, S) { ... },          // optional; serialised with toString(): use ONLY its args, no imports/closures
};
export default [Name, ...];
```
ctx: `win` [w0,w1) local frames, `dur` (shot s), `node(n, win?)`, `kids(node, win?)`, `video({src,trim,speed,vol,maxFrame})`,
`still(src, sourceFrame)` (ffmpeg-extracted at build), `id()`, `dev(name, p)`, `esc(text)`. Node = `{ d: 'Device', p: {...}, k: [kids] }` or `{ raw: html }`.

## Port another part (e.g. case13)
1. Read `engine/src/Case13.tsx` + its devices file (extract them from the LEARNINGS zip into a scratch folder). Copy the shot table into `cases/case13.mjs` (same shape as `case12.mjs`:
   `id, media, end, vo, devices, fonts, shots[{name,c,to,k,n,el}], overlays[]`). Copy names, trims, props 1:1.
2. Port each device the case uses that is not in `shared.mjs` into `devices/c13.mjs` (copy CSS strings and seeds exactly; random seeds
   must be the same strings). Anything that needs copies (glitch bands, panels) = extra timed videos via `ctx.kids(node, win)`.
   Transitions (V7Trans, in `shared.mjs`, chosen by `build.mjs`): shot `k` = hard | dissolve | glitch | push | dip | slab (Intro: hard +
   6-f RgbSlab). Out-transitions: `dipOut: n` (Case1 style), or `outK`/`outN` per shot, or `outFromNext: true` on the case (Intro rule:
   outK = next shot's k). Glitch seed = `CASE.tseed` ?? `c<N>t` for caseNN ?? `tr`, + shot index (same as the TSX).
   Raw-sound tracks: `audio: [{src, at, trim, to, g, up, down}]` (Case1 AU) -> `<audio>` with a `data-automation` volume lane.
   `ctx.video` also takes `fit`/`pos`/`style` (object-fit cover etc.). `GX_ENGINE_PUBLIC` env overrides the media root (scratch copies).
3. Build: `node build.mjs case13` (exit 2 = a video window runs past its clip; fix trim/hold).
4. Check (in `parts/case13`): `npx hyperframes@0.9.56 check --json` - fix every error.
5. Verify against the Remotion render, ~60-100 times (every shot mid, both sides of each cut, dissolve mids, titles, captions, devices):
   `npx hyperframes@0.9.56 diff "<root>/productions/gx-dashcam20/build/pic/case13_pic.mp4" . --at <t1,t2,...> --worst 6 --min-mean 0.95 --json --out <dir>`
   Look at the worst PNGs, fix, re-diff the worst times. Gate: mean >= 0.95, no frame < 0.90.
6. Local test render only a few seconds: `npx hyperframes@0.9.56 render --start A --end B`. Full renders run on the farm, never locally.

## Commands (case12)
```
node build.mjs case12
cd parts/case12 && npx hyperframes@0.9.56 check --json
npx hyperframes@0.9.56 diff "<ref>/case12_pic.mp4" . --at 1.0,46.0,85.2 --json
```
Scores and open issues: `TRANSLATION_NOTES.md`.
