# ref-annotator (ref board)

An infinite board for picking apart reference videos. Every main video is a node; marking
In/Out makes a **clip** node, linked by a line to the video it came from. A clip is only an
in/out range on the source: no file is cut, so changing it is instant. Opening it plays the
source with the timeline zoomed to that range. Clips can be marked again, without limit, and screenshots become
image nodes you can draw on. Each node carries a note, a "why it's used", and tags. Claude
reads all of it in Phase 1 of the `professional-video-studio` skill (`pvs.py notes <slug>`).

## Start

Double-click `ref-annotator.cmd`, or run:

```
python tools/ref-annotator/serve.py            # opens http://localhost:8765
python tools/ref-annotator/serve.py --no-browser --port 8765
```

Stop it with Ctrl+C in its window. It needs `ffmpeg`/`ffprobe` on PATH. It runs in Chrome or Edge,
with no installs, no build step and no internet.

## Using it

| Board | |
|---|---|
| Scroll / two-finger swipe | pan |
| Space+drag, middle-drag, or the hand tool (H) | pan |
| Ctrl+wheel or pinch | zoom at the cursor (0.2%–800%; 5%–800% without WebGL) |
| Shift+1 / Shift+2 | fit everything / fit the selection |
| Click, Shift+click, drag on empty space | select, add to selection, box-select |
| Hover a clip | shows its picture (it does not play) |
| Drag a node | move it (lines follow) |
| Drag from the ● on a node's right edge (or the C tool) | make your own link to any node; label it in the side panel |
| Double-click or Enter | open the node |
| Delete | remove (asks; it can also move the clip/frame files to `annotations/trash/`) |
| Ctrl+Z / Ctrl+Shift+Z | undo / redo |
| 1–9 | toggle a preset tag on the selection |
| `+ Board`, the board menu, `+ Add video…` | new board, switch board, add any reference source |

| Player (video or clip open) | |
|---|---|
| Space | play / pause |
| ← / → | one frame back / forward |
| Shift+← / → | one second back / forward |
| I then O (or Enter) | make a clip of In..Out (a range on the source, no file), which appears as a new node |
| Open a clip: drag either end of the blue **this clip** bar | change its own in/out; the striped area past each end is the rest of the source, shown live as you drag. − zooms out as far as the whole video, Fit zooms back to the clip |
| Drag either end of a clip bar | move that clip's in or out point (longer or shorter); the frame is shown as you drag |
| [ · ] | set the in / out point to the playhead: of the selected clip bar, or else of the open clip (park the playhead outside it to extend, inside to shorten) |
| M | point note at this frame |
| S | screenshot node of this frame |
| 1–9 | tags on the node shown in the side panel |
| Timeline | coloured bars are the clips/points/shots made here; click one to jump. −/+/Fit zoom it |
| Esc | back to the board |

| Drawing (open a screenshot, or pause any video) | |
|---|---|
| P pen · G highlighter (see-through) · A arrow · B box · E circle · T text · R ruler | |
| V | pick a drawing: drag moves it, Delete removes it, a colour swatch recolours it |
| Shift while dragging a ruler/arrow | lock it to horizontal/vertical |

The ruler shows its length as a % of the frame: `3.4% H` (height) when it's mostly vertical,
`% W` when mostly horizontal. Drawing on a paused video frame puts the drawing on that frame's
screenshot node, and creates the node if there isn't one yet.

The side panel shows the selected node's title, note, why it's used, tags (presets plus your
own custom tags, which are remembered), its times in the original source and inside its parent,
what it was made from, what was made from it, and your links. For a clip it also has **In / out** boxes
(source frames): type new numbers and press Enter or Apply to extend or shorten it. Only the numbers
change, and Ctrl+Z undoes it. Playing a clip loops its range; points and screenshots can only be made
inside it. Shortcuts never fire while you're
typing; Esc leaves the text box. Everything autosaves.

## Where things are saved

| What | Where |
|---|---|
| Boards | `productions/_boards/<board>.json` (atomic write + `.bak`) |
| Clips | only in the board json (a range on the source). `.../annotations/clips/` holds cut files from before clips became ranges; nothing new is written there |
| Screenshots | `.../annotations/frames/<id>.jpg`, plus `<id>.png` with the drawings burned in |
| Thumbnails | `.../annotations/posters/` (regenerated freely; a clip's is the source frame at its middle) |
| Deleted files | `.../annotations/trash/` (moved, never deleted) |
| Notes for Claude | `.../annotations/annotations.json`, rewritten from every board on each save |
| Custom tags | `tools/ref-annotator/custom_tags.json` |

Drawings are stored as vectors in frame-normalised 0–1 coordinates (`shapes` on the shot node),
so they stay editable; the png is only an export. The default board `farrell` holds the five
Farrell sources in a column, so threads grow to the right without colliding. Drag nodes anywhere.

### Frame accuracy

Every clip is a range on the **original source**, never on another clip, so a clip of a clip
loses nothing and its times map exactly. A clip covers source frames `sf_in..sf_out` inclusive;
clip frame `k` is source frame `sf_in + k`. A screenshot taken inside a clip is grabbed from the source
frame it maps to. `t_out` is the end of the last frame, `(frame_out + 1) / fps`.

### Schema (board json)

`{version, name, view:{x,y,z}, nodes:[...], edges:[...]}`. Node fields:

- all nodes: `id, type: video|clip|shot|point, x, y, src` (source mp4), `parent, fps:[num,den], title, note, purpose, tags`;
- clip: `sf_in, sf_out` (source frames), `pf_in, pf_out` (frames in the parent), `status`.
  New clips have no `file`. Older clips may still name a cut mp4 (`file`, `cut`); changing their
  in/out drops that field, since the file no longer matches (the file itself is kept). A re-trim refuses if a clip/point/shot made inside it would fall outside the new range.
- shot: `sf, pf, image, flat, size, shapes:[{k, p:[[x,y]...], c, w}]`;
- point: `sf, pf`.

Edge fields: `{id, from, to, kind: derived|user, label}`. `annotations.json` marks add `kind`,
`chain` (the parent list up to the main video), source `t_in/t_out/frame_in/frame_out`, `local_*`,
and `drawings` (one-line summaries).

## Server API (127.0.0.1 only)

GET `/api/videos`, `/api/boards`, `/api/board?b=`, `/api/rev?b=`, `/api/tags`, `/api/job?id=`, `/api/info?v=`,
`/video?v=` (Range/206), `/poster?v=`, `/img?p=`. POST `/api/board?b=`, `/api/board/patch?b=` (only what
changed; boards over 3000 nodes), `/api/thumbs` (64×36 jpgs and mean colours for many clips in one reply),
`/api/cut`, `/api/grab`, `/api/flat`, `/api/trash`, `/api/tags`. A bad patch gets 400. Every path parameter must resolve inside `productions/`
(videos only as `<slug>/01_reference/source/*.mp4` or a cut clip, images only under
`annotations/frames|posters`).
ffmpeg runs with an argument list, never a shell. Old marks from the first version (a flat
`annotations.json`) are migrated into the board once; the original is kept as
`annotations.premigration.json`.

## Design notes

- **Camera = one transform.** As in tldraw, the board is a camera `{x, y, z}` over page space.
  Screen→page is `(screen − offset) / z`, and zoom keeps the page point under the cursor fixed.
  One CSS `translate() scale()` on a world layer moves every node and the SVG edge layer
  together, so panning never re-lays-out the DOM.
- **Wheel = pan, Ctrl/⌘+wheel or pinch = zoom.** Whimsical and Cratis treat a plain wheel or
  two-finger swipe as pan, and ctrl/⌘+wheel as zoom toward the pointer. Browsers report a
  trackpad pinch as a ctrl+wheel, so one handler covers both. Zoom steps are exponential in the
  wheel delta (clamped) so mice and trackpads feel the same. Space-drag and middle-drag pan, as
  in Figma and FigJam.
- **Nodes, handles, bezier edges, minimap, fit view.** React Flow's model: nodes with in/out
  handles, bezier edges between them, drag from a handle to connect, a minimap, a scaling
  dotted background, and fit-view. Figma's Shift+1 / Shift+2 are used for fit-all and
  fit-selection. Box-select on empty-space drag is like React Flow's `selectionOnDrag`.
- **Cheap at scale.** Only the opened video decodes; other nodes show a small
  poster jpg. Below 30% zoom, nodes drop their text (level of detail).
  Only nodes and links on screen (plus half a screen each side) are drawn; a poster loads only
  when its node is first drawn, and none load below 10% zoom. Below 30% zoom link labels are
  skipped too. Posters are cached for a day (ETag), so a reload re-downloads nothing. A drag
  moves only the links it touches; pan/zoom redraws at most once per frame.
- **Big boards (tested at 100,000 clips).** Cards are drawn with WebGL (PixiJS 8, `vendor/pixi.min.js`,
  served locally) by `scene.js`: zoomed out they are tiny 64×36 pictures from a thumbnail atlas
  (`thumbs.js`, 2048² pages, cached under `annotations/thumbs/`), further out coloured dots. Zoomed in,
  up to 450 real DOM cards are laid over the GL layer for text and editing. `grid.js` is a spatial grid
  for "what is here" (clicks, culling, links); long links are filed by pieces of their curve, and a
  move only touches grid cells that changed. Particles live in buckets of 2048, so moving clips
  re-uploads only their buckets. The minimap on a big board is rebuilt in ~4 ms slices between frames.
  Boards over 3000 nodes save patches and keep undo steps of only what changed.
  `?nogl=1` forces the old DOM board; without WebGL, boards over 3000 nodes open read-only.
  Make a disposable test board: `python tests/make_stress_board.py [--count 100000] [--name stress]`
  (writes `productions/_boards/<name>.json` with `"sync": false`; delete it when done).
- **Derived vs. your own links.** Lines made by cutting carry the in/out time and go with the
  node. Your links are dashed, purple and labelled, and you can delete them on their own.

Sources:
- tldraw camera docs: https://tldraw.dev/sdk-features/camera
- Whimsical, infinite canvas navigation: https://whimsical.com/learn/get-started/infinite-canvas
- Cratis canvas pan & zoom: https://www.cratis.io/components/canvas/pan-and-zoom/
- React Flow (xyflow) changelog, `selectionOnDrag`, MiniMap/Controls/Background:
  https://github.com/xyflow/xyflow/blob/45fb34cc7bc1e8fc23a7a4dd40f27e8d250536b6/packages/reactflow/CHANGELOG.md

## Files

`serve.py` (server), `index.html`, `app.css`, `common.js` (helpers), `draw.js` (drawing tools),
`focus.js` (player + screenshot viewer), `app.js` (board), `grid.js` (spatial grid), `scene.js` (WebGL layer),
`thumbs.js` (thumbnail atlas), `vendor/pixi.min.js` (PixiJS 8.22.0, MIT), `ref-annotator.cmd` (launcher).

Tests: `cd tools/ref-annotator && python -m unittest discover -s tests` (needs ffmpeg) and
`node --test tests/grid.test.mjs`.
