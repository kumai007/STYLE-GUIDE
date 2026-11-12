# case-cards port: HANDOFF (status: COMPLETE; all 11 ported + SSIM-verified; read "Session 3 log" at the bottom, STATUS-after-session-2 TODO is superseded)

Family: Remotion `templates/src/case/` -> `compositions/case-cards/<Id>.html`. Ids: NocturnCaseCard, NocturnChannelPlate,
NocturnCouple, NocturnStakes, NocturnLineup, NocturnVcr, HCE-ChannelPlate, HCE-Stakes, HCE-Couple, HCE-Lineup, HCE-AudioTrace.
(NocturnMap/PlaceMap: other agent. DateCard.tsx/Devices.tsx are NOT used by any of my 11 cards: skip.)

## Done (files)
- `compositions/case-cards/lib/cc.js`  global `CC`: bezier (verbatim Remotion bezier.js), ease.{enter,measured,ui,morph,exit,sine,clock},
  tween(f,at,to,easing) (= Remotion interpolate clamp+easing), mix, fade, typeOn, random (= Remotion random(string), verified from
  node_modules/remotion/dist/cjs/random.js), list/str/num, `CC.props(defaults)` (reads getVariables, accepts old `durationInFrames`),
  `CC.clock(id,fps,frames,render)` (GSAP tween on a getter/setter proxy; setter calls render(f), f snapped to 1e-6; registers timeline).
- `compositions/case-cards/lib/cc.css` (box-sizing rule, .af = AbsoluteFill, .fit = 1920x1080 clip box, html/body 1920x1080 transparent).
- `assets/case-cards/fonts/`: inter-latin-700-normal.woff2, vt323-latin-400-normal.woff2, vcr-osd-mono.ttf, roboto-variable.ttf,
  jetbrains-mono-400.ttf (copied from templates/public/fonts; families in source: "Nocturn Inter" 700, "VT323", "VCR OSD Mono",
  "HCE Roboto" (variable wght 100-900, stretch 75-100%, title cut uses font-stretch:75% + font-variation-settings 'wdth' 75), "HCE Mono").
- `compositions/case-cards/NocturnCaseCard.html` (Native markup + frame function) and `props/case-cards/case-1.json` ({"text":"Case One","frames":135}).
  Rendered OK (1920x1080, 30 fps, 135 frames, yuv420p mp4, 17 s). Looked at NO frames yet; NO Remotion render and NO SSIM yet.

## Architecture decision (use for all 11)
Standalone full-document composition (NOT `<template>`: render -c refuses template wrappers). Pattern = NocturnCaseCard.html:
`<html data-composition-variables='[...]'>`, gsap CDN script, `<link>` to lib/cc.css, inline @font-face with `assets/case-cards/fonts/...`
(root-relative paths work in standalone files, also the lib script/link paths), root div `data-composition-id=<Id>` with
data-duration/fps/width/height, real HTML elements with ids, then `CC.props({...Remotion defaults})`, a pure `render(f)` that
ports the Remotion math 1:1 and sets styles, and `CC.clock(<Id>, fps, frames, render)`. Remotion `Fit` is dropped (width/height
props other than 1920x1080 not supported; say so in notes). Per-frame things (Grain seed = frame%6, VCR flicker random(`fl-${f}`),
typewriter, hce Grain on twos) are done by setAttribute/style in render(f). SVG feTurbulence filters (grain/paper/haze) are kept as
SVG with a seed attribute updated per frame. Tiles/lists (Lineup) built from data.names/images in JS at load, not per frame.

## Facts learned (verified)
1. `render --variables-file X.json` FAILS ("io.readFile is not a function") in hyperframes 0.8.210 here; use `--variables '<json>'`
   (inline) instead. The lead's stated command `--variables-file` must change; case-video skill command needs the inline form.
2. Variable `frames` does NOT change length: root data-duration stays (rendered `frames:60` still gave 135 frames). Needs a wrapper:
   write `tools/hf-case-render.mjs <Id> <props.json> <out>` that copies the composition to a temp file inside compositions/case-cards/
   (or scratch) with data-duration=frames/fps patched, converts the props JSON to --variables, renders, deletes the temp. Untested:
   whether patching the DOM attr from script before clock() works (try `root.setAttribute('data-duration', frames/fps)` first, cheaper).
3. `render -c` prints "Lint: 1 error(s)" while `hyperframes lint <file>` says 0 errors: run `render ... --lint-verbose` and read the
   error line (the full render log is huge; grep -i "lint\|error" only). `check` has no -c flag.
4. Output shown by render is very verbose: always `| grep -E "rendered in|rror"`.
5. Source props: `props/case-1.json` = NocturnCaseCard; `we-couple-PD.json` = NocturnCouple/HCE-Couple (text "LOMAR & CHELSEY", frames 120,
   `image` data URI; check for image2); `kw-plate-{ANG,ARN,BEA,BRD,ERC,NWC,PDS,ROB}.json` = ChannelPlate (text, sub, 1920x1080, fps 30, frames 180,
   `image` data URI + imageWidth/imageHeight). `we-spirit-box.json`, `hook-ps.json`, `kw-bend/bournemouth/finland/loess.json`, `meteora-map.json`
   are NOT mine (highlights / hook / map). Data URIs: decode to `assets/case-cards/<name>.jpg|png` and make `props/case-cards/<name>.json`
   reference `assets/case-cards/<name>.jpg` (img src accepts both; keep data-URI support).
6. Opaque vs alpha: all cards are opaque (black/charcoal ground) -> mp4. Only NocturnVcr data.mode "label" and "rewind" are alpha
   overlays -> render `--format mov` for those (verify pix_fmt yuva444p10le with ffprobe); default mode "date" is opaque black.
7. HCE-AudioTrace: data.peaks (0-1 array, ~120 values) is already a PROP computed outside Remotion (cvw/audio_peaks.py); no runtime
   audio read exists, so no build step is needed beyond passing `data.peaks` as a variable (type object/array; default []). Nothing
   else reads audio at runtime in this family.
8. Remotion side: `cd templates && npx remotion render src/index.ts <Id> <out> --props=<file> --image-format=png --color-space=bt709 --concurrency=2`
   into `PROJECT/scratch/hf-port/case-cards/`. Registered default props are in src/case/Root.tsx (defaults: text, sub "", frames per
   composition; NocturnCaseCard 135, ChannelPlate 180, Couple 120, Stakes 150, Lineup 150, Vcr 100 (text "DECEMBER 2025", data.mode date),
   HCE-ChannelPlate 180, HCE-Stakes 150 ("Seven"/"of eight went out alone"), HCE-Couple 120 ("Philly & Keely"), HCE-Lineup 150
   (7 names, no images), HCE-AudioTrace 90 (peaks [])). Images are absent in defaults, so most defaults render with no picture
   (plate = charcoal + contours); also test each with a real still (use the decoded kw-plate / we-couple images).
9. Skill `case-video` call path not yet read; note in final notes which command changes (variables-file -> --variables, frames wrapper).

## Remaining work (in order; ~10 compositions)
Port NocturnChannelPlate (3D perspective 2200, rotateY -7, rotate -1.2deg via CSS `scale`/`rotate`/`transform` props as in source,
blur filter on parent), NocturnCouple, NocturnStakes (+Plate: image, forest multiply, charcoal dim, radial vignette, Grain 6 seeds,
handheld drift sines), NocturnLineup (3D grid, preserve-3d), NocturnVcr (3 modes, random flicker), HCE Base pieces (Plate, Halftone,
Paper, Vignette, CropMarks, Print, Rise, Heading, Grain on twos, Contours) shared in a `lib/hce.js` + hce Cards/Couple/Stakes/Lineup/
AudioTrace. Then: render Remotion originals, render HF (--workers 2), `render_diff.sh` SSIM per composition, `hyperframes snapshot
--at ... --against`, tier thresholds from eval.md (T2 0.95 / T3 0.90), fix divergences, convert props files, finish this notes file
(per template: source, level, variables, render command, SSIM mean/min, what did not translate), and note what stays in Remotion.
Likely sources of mismatch to inspect first: mix-blend-mode overlay grain/soft-light paper over feTurbulence, `-webkit-background-clip:text`
fill in HCE-Stakes (backgroundImage on text), clip-path insets in Rise/Wipe, perspective/preserve-3d in Lineup.

## Session 2 log
- DONE `tools/hf-case-render.mjs <Id> <out> [--props f] [--set k=v] [--workers N]`: works (tested NocturnCaseCard: 135/135 frames, yuv420p, no audio).
  Patches data-duration in temp copy `compositions/case-cards/_tmp_<Id>_<pid>.html` (deleted after), inline --variables, mov for NocturnVcr label/rewind.
  Windows gotcha: spawn via shell needs the JSON wrapped in "..." with inner quotes as \" (else "Invalid JSON in --variables").
  Lint "1 error" appears on every render -c; render is correct anyway (not a blocker).
- Remotion originals go to scratch/hf-port/case-cards/rm-<Id>.mp4; HF to hf-<Id>.mp4.
- NocturnCaseCard VERIFIED: SSIM mean 0.9995 min 0.9993 (T3 thr 0.90). Render: node tools/hf-case-render.mjs NocturnCaseCard out.mp4 --props props/case-cards/case-1.json
- Props decoded: props/case-cards/{kw-plate-*.json,we-couple-PD.json} reference assets/case-cards/*.jpg (data URIs -> files; script scratch/hf-port/case-cards/decode.cjs). Remotion side must keep using templates/props/*.json (data URIs).
- NocturnChannelPlate DONE+VERIFIED (kw-plate-ANG): SSIM mean 0.9949 min 0.9939. node tools/hf-case-render.mjs NocturnChannelPlate out.mp4 --props props/case-cards/kw-plate-ANG.json
- Helper: scratch/hf-port/case-cards/ssim.sh <Id> (rm-<Id>.mp4 vs hf-<Id>.mp4). Remotion: cd templates; npx remotion render src/index.ts <Id> ../../scratch/hf-port/case-cards/rm-<Id>.mp4 --props=props/X.json --image-format=png --color-space=bt709 --concurrency=2
- Wrapper now spawns node + npm's npx-cli.js directly (no shell): cmd mangled "&" in text props. 
- NocturnCouple DONE+VERIFIED (we-couple-PD, 2 portraits): SSIM mean 0.9964 min 0.9947. node tools/hf-case-render.mjs NocturnCouple out.mp4 --props props/case-cards/we-couple-PD.json
- Added lib/nocturn.js + lib/nocturn.css (palette, drift, grain(6 seeds), card()) shared by Stakes/Lineup.
- NocturnStakes DONE+VERIFIED (props/case-cards/stakes-example.json with a still): SSIM mean 0.9803 min 0.9787 (flat ~0.98 across frames: grain/filter texture differences only). Render: node tools/hf-case-render.mjs NocturnStakes out.mp4 --props props/case-cards/stakes-example.json
- Remotion-side props for stakes/lineup with data-URI stills: scratch/hf-port/case-cards/rm-stakes.json, rm-lineup.json. HF lineup example props: props/case-cards/lineup-example.json (images:[{src,w,h}], data:{names,at,dip}).
- NocturnLineup DONE+VERIFIED (7 tiles, lineup-example.json): SSIM mean 0.9959 min 0.9940. node tools/hf-case-render.mjs NocturnLineup out.mp4 --props props/case-cards/lineup-example.json
- NocturnVcr DONE+VERIFIED, 3 modes. date (mp4): SSIM mean 0.9998 min 0.9997. label/rewind (alpha mov, yuva444p12le from ProRes 4444, no audio): composited over grey 0x808080 and compared to Remotion prores 4444 alpha: mean ~1.000 each.
  Render: node tools/hf-case-render.mjs NocturnVcr out --set "text=DECEMBER 2025" --set 'data={"mode":"date"}'  (wrapper appends .mp4/.mov by mode; mode absent in data = label (source default); props with no data at all = date).
  Remotion alpha cmd: --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png.

## STATUS after session 2 (read this first)
VERIFIED (SSIM vs Remotion, 1920x1080 30 fps, same frame count; mean/min; T3 threshold 0.90, all pass): NocturnCaseCard 0.9995/0.9993;
NocturnChannelPlate 0.9949/0.9939; NocturnCouple 0.9964/0.9947; NocturnStakes 0.9803/0.9787; NocturnLineup 0.9959/0.9940;
NocturnVcr date 0.9998/0.9997, label+rewind (alpha) ~1.000. Level T3 (data-driven JS frame function, native HTML+CSS).
Lint note: every `render -c` prints "Lint: N error(s)" (N = 1-3, grows with file); renders are correct. Never ran --lint-verbose: cause unexplained, not a blocker.

TODO (nothing written): HCE-ChannelPlate, HCE-Stakes, HCE-Couple, HCE-Lineup, HCE-AudioTrace. Sources: templates/src/case/hce/{Base,Cards,Couple,Beats,New}.tsx
(Base 261 lines = shared pieces). Read this session: Base, Cards, Couple. NOT read: Beats.tsx (103; Stakes+Lineup), New.tsx (53; AudioTrace).
Plan: write lib/hce.js + lib/hce.css exposing CC.hce = {Grain on twos (seed k+11, k=floor(f/2)%6, baseFrequency 0.9, opacity 0.07 default, overlay),
Contours (3 fixed contour groups, contourPath formula in Base.tsx, stroke steel, opacity .08), Vignette(amount, radial 80% 75% from 45%), Plate (img cover, scale
(1.02+blur*0.004)*push, filter GRADE.doc "saturate(.55) brightness(.62) contrast(1.08)" or evidence, + Halftone svg pattern (size 6, r=.36*size, rotate 15, multiply, .16),
charcoal veil `flat`, bottom-left radial floor `dim`, Paper svg (soft-light .32; feTurbulence baseFrequency .65 oct 3 seed 5 + blotch .012 oct 2 seed 9, saturate 0), Vignette, Grain;
no image -> Contours), CropMarks(inset 54, L30 g10), Print (paper border B=max(10,w*.035), shadow, halftone .2 size 4, Paper .55, mono caption), Rise
(opacity min(1,p*1.25), translateY((1-p)*14), blur (1-p)*6 when p<.995), Heading (12px square + Title), Title (Roboto font-stretch 75% + font-variation-settings 'wdth' 75,
weight 600, letter-spacing .06em, uppercase), Tag, DataBlock, Wipe(clip-path inset(-20% (100*(1-p))% -20% 0))}.
Tokens: charcoal #0E1013, ink #15191E, slate #5D7085, steel #8E979F, paper #DCD7CB, amber #C1904E; motion fadeIn 0.7, reveal 1.3, stagger 0.6, pushPctPerSec 0.6, lead 0.2;
fonts "HCE Roboto" (assets/case-cards/fonts/roboto-variable.ttf, weight 100 900, stretch 75% 100%), "HCE Mono" (jetbrains-mono-400.ttf). useCard: fade(f,frames,max(min(fadeIn*fps,frames/3),1e-3)), p = tween 0..frames-1 ease.sine.
HCE-ChannelPlate = NocturnChannelPlate.html maths + blur 12->0 over 0.8 s ease.measured, img filter saturate(.7) contrast(1.05) brightness(.9), page bg #0E1013,
overlays: 0deg gradient rgba(14,16,19,.75)->0 at 26%, Paper .22, Vignette .4, CropMarks fade in 0.4-1.4 s ease.ui, mono 24px sub line (left 120, bottom 96, amber 10px square, letter-spacing .14em) when sub given, Grain .05.
HCE-Couple: Plate dim .6 flat .5 blur 14; Prints 500x620 (one image: 900x560), q1 (.1-1.0s) q2 (.5-1.4s) ease.enter, rot -1.5/1.2, captions from text split on "&"/" and ", heading (Heading 64) at left 130 bottom 96 with reveal 1.3 s from 1.0 s; whole thing scale 1+.04p. See Couple.tsx.
Remotion `plain()` wrapper restores browser defaults (no Tailwind preflight): use plain CSS, keep `* {box-sizing:border-box}`.
Per-component pattern: copy NocturnLineup.html / NocturnStakes.html (CC.props, DOM built once, render(f) sets styles, CC.clock). HCE props have the same names as Nocturn's (text, sub, frames, image(s), data{names,at,dip,peaks}).
After each: node tools/hf-case-render.mjs <Id> ../../scratch/hf-port/case-cards/hf-<Id>.mp4 --props props/case-cards/<x>.json ; Remotion original from templates/ into rm-<Id>.mp4 (data-URI props: scratch/hf-port/case-cards/rm-stakes.json, rm-lineup.json, templates/props/we-couple-PD.json, kw-plate-*.json); bash scratch/hf-port/case-cards/ssim.sh <Id>; record here.
HCE-AudioTrace: data.peaks passed as variable (type object, default []); test default [] and a fixed 120-value array. 

Unverified / limits: HCE-* (all five); no-image defaults of Stakes/Lineup/Couple not SSIM-compared (only tested with stills); width/height other than 1920x1080 unsupported (Remotion Fit dropped);
Stakes has ~0.98 (grain/filter texture), accepted. Props files made: case-1, kw-plate-{8}, we-couple-PD, stakes-example, lineup-example (props/case-cards/).

## case-video skill impact (skill NOT edited)
File: C:\Users\ayush\.claude\skills\case-video\references\templates.md (39 lines; line 3 names Remotion 4.0.529 + the templates README render commands; line 4 says length comes
from the `frames` prop and images are data URIs with image + imageWidth/imageHeight). SKILL.md line 16 (pointer to templates.md) and line 33 ("Cards from graphics/templates") too.
Commands to change at cutover: (1) render -> `node graphics/hyperframes/tools/hf-case-render.mjs <Id> <out> --props <file.json>` (or `--set k=v`; extension is added: .mp4, NocturnVcr label/rewind -> .mov ProRes 4444 alpha);
(2) `image` may be a path relative to graphics/hyperframes (assets/...) or a data URI; (3) NocturnVcr needs explicit data.mode (absent = label = alpha mov);
(4) never `render --variables-file` in 0.8.210 (broken); (5) composition location now graphics/hyperframes/compositions/case-cards/. Only grepped, did not read these files fully.

## Session 3 log (HCE)
- lib/hce.js written: CC.hce = {C,M,T,GRADE,FONT,useCard,grain(on twos, 6 filters, rect switches),contours,vignette,halftone,paper,cropMarks,plate,print,title,rise,heading}; builders return {html,set()}; injects the HCE @font-face itself.
- HCE-ChannelPlate DONE+VERIFIED (kw-plate-ANG + sub "SOURCE: YOUTUBE CHANNEL PAGE"): SSIM mean 0.9928 min 0.9918. node tools/hf-case-render.mjs HCE-ChannelPlate out.mp4 --props props/case-cards/kw-plate-ANG.json --set "sub=..." (Remotion props: scratch/hf-port/case-cards/rm-hce-plate.json)
- HCE-Couple DONE+VERIFIED (we-couple-PD, 2 prints + captions): SSIM mean 0.9894 min 0.9843. node tools/hf-case-render.mjs HCE-Couple out.mp4 --props props/case-cards/we-couple-PD.json (Remotion: templates/props/we-couple-PD.json)
- HCE-Stakes DONE+VERIFIED (stakes-example, background-clip:text fill works): SSIM mean 0.9900 min 0.9887. node tools/hf-case-render.mjs HCE-Stakes out.mp4 --props props/case-cards/stakes-example.json (Remotion: scratch/.../rm-stakes.json). data.accent (red rule) not rendered-tested.
- HCE-Lineup DONE+VERIFIED (lineup-example, 7 prints 4+3, perspective table, dip): SSIM mean 0.9903 min 0.9853. node tools/hf-case-render.mjs HCE-Lineup out.mp4 --props props/case-cards/lineup-example.json (Remotion: scratch/.../rm-lineup.json)
- HCE-AudioTrace DONE+VERIFIED: props/case-cards/audiotrace-example.json (120 synthetic peaks, no image; same file used by Remotion): SSIM mean 0.9926 min 0.9917. Default (peaks [] = flat line): 0.9934/0.9933.
  node tools/hf-case-render.mjs HCE-AudioTrace out.mp4 --props props/case-cards/audiotrace-example.json   (or --set 'data={"peaks":[...]}')
- HCE-Stakes no-prop default (no image, word in paper): 0.9929/0.9927.
- Wrapper needed no change for HCE ids (generic; all HCE are opaque -> mp4).
## STATUS after session 3
All 11 VERIFIED, level T3 (native HTML+CSS/SVG, data-driven render(f)), all opaque mp4 except NocturnVcr label/rewind. HCE results (mean/min):
ChannelPlate 0.9928/0.9918, Couple 0.9894/0.9843, Stakes 0.9900/0.9887, Lineup 0.9903/0.9853, AudioTrace 0.9926/0.9917.
Not tested: HCE-Stakes data.accent, HCE-Couple single image (landscape print) and no-image default, HCE-ChannelPlate without sub, HCE-Lineup with image/image2 instead of images,
width/height != 1920x1080 (Fit dropped). Lint "N errors" on render -c still unexplained/harmless. Scratch made this session: scratch/hf-port/case-cards/{rm,hf}-HCE-*.mp4, diff-HCE-*, rm-hce-plate.json.
