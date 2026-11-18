# autoedit edit files

One edit folder per video (outside this public repo, e.g. `<production>/edit/`):
`video.json`, `cases/cNN.json` (one per part, written by one agent each), `keys.json` (blur keys, freeze stills,
page boxes, privacy flags), `cuts/<SRC>.json` + `faces/<SRC>.json` (from `prep_github.py`). `compile.py` turns
them into `timeline.json`; the engine renders only that. JSON schema of a case file: `edit_schema.json`.

## video.json
```json
{"title": "gx-dashcam-s11", "fps": 30, "size": [1920, 1080], "media_root": "<production folder>", "vo_dir": "vo/raw",
 "order": ["c00", "c01", "c02", "c03", "c04", "c05"], "target_s": [5100, 5700],
 "cut_lead": 0.15, "card_nf": 84, "dip": [8, 7], "raw_overlap_f": 30, "end_nf": 75, "default_push": 0.015,
 "sources": {"SPX": {"mode": "blurfill", "crop": [944, 704, 172, 8]}, "MF": {"mode": "cover", "crop": null, "look": "sky_mute"}},
 "list_plate": {"src": "RWG", "t": 18.0}, "sfx": {"card": "es_boom_low_hit.wav", "dip": "es_whoosh_soft.wav"},
 "lint": {"min_s": 3.0}}
```
Order = intro (`role: intro`), cases, outro (`role: outro`). Between parts the compiler adds a dip (8 f out, 7 f in);
every `role: case` part gets its title card (84 f) first. Music: a case file's `music` starts a new bed at that
case's card (the first one at frame 0); 6 s crossfades, levels auto (engine audio).

## cases/cNN.json
```json
{"id": "c01", "role": "case", "case": "C01", "title": "The 3 a.m. Uber Ride",
 "credit": "YOUTUBE: BRAXTON HARDRIVE", "date": "16 SEP 2018", "card": {"src": "UBER", "t": 10.0},
 "sources": {"UBER": {"mode": "cover", "crop": null}}, "music": {"file": "walk.mp3", "offset": 0.0},
 "flow": [
  {"vo": "c01_01", "beats": [
    {"src": "UBER", "in": 17.5, "head": 30, "cabin": true, "date": true},
    {"w": 14, "say": "one watched the road", "src": "UBER", "in": 6.5, "out": 16.8},
    {"w": 31, "say": "near route", "src": "UBER", "in": 28.9, "out": 43.9, "fit": "end"}]},
  {"raw": "C01-R2", "src": "UBER", "in": 43.9, "out": 59.9,
   "captions": [[0.8, 1.66, "What is that?"]], "bleeps": [[49.7, 50.1]]},
  {"hold": "C01-hold", "bed_db": -8, "beats": [{"nf": 150, "src": "UBER", "in": 46.5, "out": 49.0, "speed": 0.5}]}
 ]}
```
Flow items: `vo` (a VO take cut into beats), `raw` (source audio up, VO silent), `hold` (picture-only beats with
fixed `nf` frames), `dip` (extra dip inside a case).

### Beats (inside `vo` / `hold`)
| key | meaning |
|---|---|
| `w` | word index of the cut in the take (`compile.py <edit> --words <take>` prints the list); beat 0 has none. `"s3"` = start of sentence 3. Cut = 0.15 s before the word. |
| `say` | the words at `w` (lint checks the index) · `nudge_f` frames to shift the cut |
| `src` `in` `out` | footage source tag and window (s). Beat lasts until the next cut; plays 1x, slows to >= 0.5x to fit `out`, then freezes. `out` null = free run. |
| `fit: "end"` | footage ends exactly at `out` (use before a raw so the raw continues seamlessly); `in` = earliest frame |
| `speed` `head` | fixed speed; freeze frames at the head |
| framing | `mode` cover/blurfill, `crop` [w,h,x,y] (default from `sources`), `zoom` {s,cx,cy} punch-in, `push` (%/s, default 0.015) |
| `still` | freeze frame: {t or fz, s, cx, cy, drift [dx,dy], s_end (slow zoom)} |
| devices | `date` true (typed case date), `credit_case`, `page` {id, hl (highlight index in keys.pages) or null + box}, `map` {tiles, lat, lon, label, zooms}, `list` true (case list), `tint` "bw" |
| privacy | `cabin` (cabin zones), `zones_extra` [[cx,cy,rx,ry]], `haar` (face detect) |
| transition | `xfade` frames (crossfade from previous), `tr: "dip"` (in-place dip after this beat, no time added) |

Raws: `captions` [[t0, t1, text, (y)]] seconds from the raw's `in` (shown >= 1 s); `bleeps` [[a, b]] source seconds;
`lufs` own target (default -17); `bed_db` duck the music bed; `gain_db`; `cabin`/`haar`.

## keys.json
```json
{"stills": {"fz_title": 1335}, "pages": {"c02": {"size": [3840, 4266], "hl": [{"text": "...", "lines": [[x0,y0,x1,y1]]}]}},
 "blur": {"UBER": {"cabin_zones": [[cx,cy,rx,ry]], "cabin_scale": 0.85, "cabin_sigma": "cap", "runs": [[[t,x0,y0,x1,y1]]]},
          "RWG": {"runs": [], "haar_from": 58.0}, "MF": {"tables": [[[frame,cx,cy,w,h]]]}},
 "privacy": {"RWG": [[100.0, 104.0, "bystander faces"]]}}
```
`privacy` = windows the media log flags; lint fails any shown second there without blur cover.

## assets.json (pages + maps; `assets/prep_assets.py`)
```json
{"cases": {"c01": {
  "pages": [{"id": "news", "url": "https://...", "highlight": ["exact sentence as on the page", "..."], "blur_words": ["private name"]}],
  "maps":  [{"id": "lufkin", "lat": 31.3382, "lon": -94.7291, "label": "LUFKIN, TEXAS", "zooms": [6, 14]}]}}}
```
- ids: a-z 0-9 _ -; asset name = `<cid>_<id>` (e.g. `c01_news`). Optional page `wayback` = a fixed archive URL.
- `python -X utf8 tools/autoedit/assets/prep_assets.py <prod rel> <edit rel>`: one GitHub machine per page/map (all
  parallel). Pages: real capture only (live, else the Wayback copy; never typeset), 1920 css at 2x ->
  `assets/pages/<name>_page.png` (soft-blurred: faces, blur_words, image ads, other-story thumbnails),
  `_raw/<name>_raw.png`, `<name>_words.json` (word + line boxes, png px), `<name>_blurlog.json`; a sentence not found ->
  `<name>_text.txt` (page text, pick an exact sentence). Maps: EOX Sentinel-2 cloudless 2016 tiles -> `assets/maps/<name>/`.
- Then keys.json `pages.<name>` = {size, url, hl: [{text, lines}]} (hl index = order of `highlight`), check sheet
  `<edit>/qa/ASSETS_CHECK.jpg` (red = highlight boxes, yellow = blurred), run clock `<edit>/qa/assets_run.json`.
  `--post` redoes keys + sheet from disk.
- Beats: `"page": {"id": "c01_news", "hl": 0}`; `"map": {"id": "c01_lufkin"}` (lat/lon/label/zooms/tiles from
  assets.json; keys given in the beat override). Lint fails a page/map beat whose png, keys entry, highlight boxes or
  tiles at both zooms are missing, or a map shot without a fresh PC clip.
- Map clips (owner rule 2026-11-16: maps render on the PC, the farm only pastes them): after compile,
  `python -X utf8 tools/autoedit/assets/make_maps_pc.py <edit rel>` renders each map shot with the engine's own map code
  (`kit.map_eox`: eased push, pin, typed label, EOX credit) -> `assets/maps/clips/<cid>_<id>__<nf>f.mp4` (1920x1080,
  30 fps, CRF 14, no audio; frames = nf + the next ff shot's xfade) + sidecar `.json` {nf, frames, style, params}.
  Fresh clips are skipped; nf in the name + style hash (kit.map_eox and its helpers) + params force a remake.
  Fades/dips are applied by the engine on top of the clip. The engine plays the clip when it exists, else renders from
  tiles (`AUTOEDIT_MAP_TILES=1` forces tiles). stage_farm.py stages the clips and no tiles (exits with the command
  if a clip is missing/stale; `--tiles` = old way). `--check` compares 3 build.still frames per map: clip vs tiles.
- Change the map style = edit `kit.map_eox` (engine/kit.py; also via regen_engine), run make_maps_pc.py, re-stage, re-render.

## Derived files
`cuts/<SRC>.json` {"src", "cuts": [s...]} scene cuts; `faces/<SRC>.json` {"src", "fps", "boxes": [[t,x0,y0,x1,y1]...]}
(source-pixel boxes, every 0.5 s, for blur keys); `vo/raw/<take>.words.json` Whisper words + `duration`.

IMPORTANT (2026-11-16): `keys.json` blur.<SRC>.runs boxes are OUTPUT pixels (1920x1080, after the source's crop + cover/blurfill framing), at SOURCE seconds. Keys measured in source pixels must be mapped first (see productions/gx-dashcam-t10/build/make_edit.py `to_out`); unmapped ROM keys missed the plate and faces.
