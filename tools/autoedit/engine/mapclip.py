"""PC-rendered map clips (owner rule 2026-11-16): map animations render on the PC (assets/make_maps_pc.py), the farm
only plays the finished clips. The map style changes often, so the PC owns it.

Clip:    <media>/assets/maps/clips/<map>__<nf>f.mp4   (<map> = basename of the shot's tiles dir, e.g. c01_lufkin)
Sidecar: same path + .json = {nf, frames, style, params}. frames = nf + tail (the next ff shot's xfade reads past nf).
style = hash of kit.map_eox + every helper it uses + the constants / font name it reads (path-independent): edit kit.map_eox -> all clips stale.
The engine plays a clip whenever the mp4 exists (no hash check on the farm); stage_farm.py / lint.py check freshness."""
import hashlib, inspect, json, os, subprocess
import numpy as np

import kit

CLIP_DIR = 'assets/maps/clips'
_STYLE_FUNCS = ('map_eox', '_plate', '_merc', 'smootherstep', 'smootherstep_arr', 'clamp', 'lerp', 'quint_out', 'over',
                'text_rgba', 'font', '_cursor_block', 'source_credit', 'vignette', 'u8')


def style_hash():
    h = hashlib.sha1()
    for n in _STYLE_FUNCS: h.update(inspect.getsource(getattr(kit, n)).encode('utf8'))
    h.update(repr((kit.W, kit.H, kit.FPS, kit.RED, kit.OFFWHITE, os.path.basename(kit.F_MONO))).encode('utf8'))
    return h.hexdigest()[:16]


def map_name(shot): return os.path.basename(shot['tiles'].rstrip('/\\'))


def clip_rel(shot): return f"{CLIP_DIR}/{map_name(shot)}__{shot['nf']}f.mp4"


def clip_path(media, shot): return os.path.join(media, *clip_rel(shot).split('/'))


def tail(shots, shot):
    """Frames past nf the next shot's crossfade reads from this shot (build.render_range)."""
    i = shot['idx'] + 1
    nxt = shots[i] if i < len(shots) else None
    return int(nxt.get('xfade', 0) or 0) if nxt and nxt['kind'] == 'ff' else 0


def params(shot, frames):
    return dict(map=map_name(shot), lat=shot['lat'], lon=shot['lon'], label=shot['label'],
                zooms=list(shot.get('zooms', (10, 14))), nf=shot['nf'], frames=frames)


def stale(media, shots, shot, style=None):
    """None when the clip is fresh, else the reason (missing / timing / style / params)."""
    p = clip_path(media, shot); sc = p + '.json'
    if not os.path.exists(p) or not os.path.exists(sc): return f'no clip {clip_rel(shot)}'
    try: S = json.load(open(sc, encoding='utf8'))
    except ValueError: return f'bad sidecar {clip_rel(shot)}.json'
    want = params(shot, shot['nf'] + tail(shots, shot))
    if S.get('style') != (style or style_hash()): return f'clip {clip_rel(shot)} has an old map style'
    if S.get('params') != want: return f'clip {clip_rel(shot)} params changed (label/lat/lon/zooms/xfade tail)'
    return None


def read(path, i0, i1):
    """Frames [i0, i1) of a clip, RGB uint8 1920x1080, frame-exact (decode from 0, skip). Past the end: last frame."""
    n = kit.W * kit.H * 3
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-an', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
                         stdout=subprocess.PIPE)
    last = None
    try:
        for i in range(i1):
            b = p.stdout.read(n)
            if len(b) == n: last = np.frombuffer(b, np.uint8).reshape(kit.H, kit.W, 3)
            if last is None: raise RuntimeError(f'map clip unreadable: {path}')
            if i >= i0: yield last
    finally:
        p.kill(); p.wait()
