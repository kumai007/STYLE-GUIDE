"""Farm build-script contract v1. A copy of this file sits next to each part's build/farm_entry.py.
farm_entry.py:  plan | chunk F0 F1 OUT.ts [--framemd5 PATH] | audio OUT.wav
prep.py checks that every copy equals the repo version (MD5)."""
import contextlib, hashlib, json, os, sys

VERSION = 1


def chunk_enc(enc, f0, fps):
    """The part's final ENC args + MPEG-TS output whose timestamps start at frame F0.
    Chunks of a part then form one continuous TS stream when their bytes are joined in order.
    (Raw H.264 has no timestamps: the join lost the B-frame delay frames.)
    The +10 s keeps every chunk's first DTS above 0, so the TS muxer shifts no chunk on its own.
    Env FARM_TS_BASE = frames of all earlier parts (set by the farm), so times also run on across parts:
    a jump back at each part border left an uneven step in a 27-part join.
    Env FARM_PREVIEW=1 (sample runs) swaps ENC for a small 960x540 preview encode."""
    a = list(enc)
    if os.environ.get('FARM_PREVIEW') == '1':   # sample runs: a small, fast preview (960x540), not the final quality
        a = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '27', '-pix_fmt', 'yuv420p', '-vf', 'scale=960:-2']
    if '-c:v' not in a or a[a.index('-c:v') + 1] != 'libx264':
        raise ValueError('ENC must use -c:v libx264')
    base = os.environ.get('FARM_TS_BASE', '0')
    if not base.isdigit(): raise ValueError('FARM_TS_BASE must be a frame count')
    return a + ['-output_ts_offset', f'{10 + (int(base) + f0) / fps:.6f}', '-f', 'mpegts']


def _rel_ok(p):
    return isinstance(p, str) and p and not p.startswith(('/', '\\')) and ':' not in p and '..' not in p.replace('\\', '/').split('/')


def validate_plan(p):
    for k in ('fps', 'w', 'h', 'frames', 'borders', 'shots'):
        if k not in p: raise ValueError(f'plan: missing {k}')
    fr, b = p['frames'], p['borders']
    if not isinstance(fr, int) or fr <= 0: raise ValueError('plan: frames must be > 0')
    if not b or b[0] != 0 or b != sorted(set(b)) or b[-1] >= fr: raise ValueError('plan: borders must be sorted, unique, start at 0, < frames')
    f = 0
    for s in p['shots']:
        if s['f0'] != f or s['f1'] <= s['f0']: raise ValueError(f'plan: shots must cover frames in order (at {f})')
        if not all(_rel_ok(x) for x in s['files']): raise ValueError(f'plan: bad file path in shot at {f}')
        f = s['f1']
    if f != fr: raise ValueError(f'plan: shots end at {f}, frames = {fr}')
    return p


def check_range(f0, f1, p):
    b = set(p['borders'])
    if not (0 <= f0 < f1 <= p['frames']): raise ValueError(f'range {f0}..{f1} outside 0..{p["frames"]}')
    if f0 not in b: raise ValueError(f'F0={f0} is not a border')
    if f1 != p['frames'] and f1 not in b: raise ValueError(f'F1={f1} is not a border or the end')


class FrameMD5:
    """One line per raw frame: '<index> <md5>'. Used by the same-frames test."""
    def __init__(self, path):
        self.f = open(path, 'w', encoding='ascii') if path else None; self.i = 0

    def add(self, buf):
        if self.f: self.f.write(f'{self.i} {hashlib.md5(buf).hexdigest()}\n')
        self.i += 1

    def close(self):
        if self.f: self.f.close()


def main(argv, plan_fn, chunk_fn, audio_fn):
    try:
        if argv[:1] == ['plan']:
            with contextlib.redirect_stdout(sys.stderr): p = validate_plan(plan_fn())
            print(json.dumps(p)); return 0
        if argv[:1] == ['chunk'] and len(argv) in (4, 6):
            f0, f1, out = int(argv[1]), int(argv[2]), argv[3]
            md5 = argv[5] if len(argv) == 6 and argv[4] == '--framemd5' else None
            if len(argv) == 6 and md5 is None: raise ValueError('unknown option ' + argv[4])
            check_range(f0, f1, validate_plan(plan_fn()))
            chunk_fn(f0, f1, out, md5); return 0
        if argv[:1] == ['audio'] and len(argv) == 2:
            audio_fn(argv[1]); return 0
    except ValueError as e:
        print('farm_contract:', e, file=sys.stderr); return 2
    print(__doc__, file=sys.stderr); return 2
