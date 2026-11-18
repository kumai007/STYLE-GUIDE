"""autoedit engine: compiled-timeline loader (replaces the hand-written timeline.py of a production).

build.py / audio.py / farm_entry.py import this as `timeline`. No case-specific code: everything comes from
timeline.json (written by tools/autoedit/compile.py) and keys.json (blur keys, freeze stills, page boxes).

Where things are (first hit wins):
  timeline.json : env AUTOEDIT_TL | <this folder>/timeline.json
  keys.json     : env AUTOEDIT_KEYS | next to timeline.json
  media root P  : env AUTOEDIT_MEDIA | parent of this folder (farm part / production layout:
                  P/sources/<SRC>.mp4, P/vo/raw/<take>.wav, P/assets/{pages,maps,music,sfx})
"""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
TL_PATH = os.environ.get('AUTOEDIT_TL') or os.path.join(HERE, 'timeline.json')
EDIT_DIR = os.path.dirname(os.path.abspath(TL_PATH))
KEYS_PATH = os.environ.get('AUTOEDIT_KEYS') or os.path.join(EDIT_DIR, 'keys.json')
P = os.environ.get('AUTOEDIT_MEDIA') or os.path.dirname(HERE)

_J = None


def data():
    global _J
    if _J is None:
        _J = json.load(open(TL_PATH, encoding='utf8'))
    return _J


def _fix(s):
    """JSON lists back to the tuples the renderer indexes (all list-safe anyway)."""
    s = dict(s)
    s['captions'] = [tuple(c) for c in s.get('captions', [])]
    for k in ('drift', 'zooms', 'crop'):
        if isinstance(s.get(k), list): s[k] = tuple(s[k])
    return s


def timeline():
    return [_fix(s) for s in data()['shots']]


def events():
    return data()['events']


def meta():
    return data().get('meta', {})


def audio_plan():
    return data().get('audio', {})


FPS = 30


class _SrcMode(dict):
    def __missing__(self, k): return dict(mode='cover', crop=None)


def _src_mode():
    try: return _SrcMode(meta().get('src_mode', {}))
    except (OSError, ValueError): return _SrcMode()


SRC_MODE = _src_mode()


def check(shots):
    f = 0
    for s in shots:
        assert s['nf'] > 0, s['name']
        assert s['f0'] == f or s.get('pre'), (s['name'], s['f0'], f)
        f = s['f0'] + s['nf']
    return f
