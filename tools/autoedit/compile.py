"""autoedit compiler: video.json + cases/*.json + VO words.json -> timeline.json (what engine/build.py renders).

python -X utf8 compile.py <edit dir> [--out timeline.json] [--words TAKE]
  <edit dir> holds video.json, cases/, keys.json. Writes <edit dir>/timeline.json (shots + events + audio plan).
  --words TAKE : print the numbered word list of one VO take (index, start s, word, sentence no.) and exit.
Frame logic is the gx-dashcam-s10 timeline builder (B3/B4) with word INDEX anchors instead of fuzzy phrases:
  cut = VO start + round((word start - cut_lead) * fps) + nudge_f; each beat runs to the next cut (the last to VO end
  + tail), so beats always fill the VO; ff beats slow to >= 0.5x then freeze to fill (resolve_ff); a VO after a raw
  starts raw_overlap_f early (VO over the raw tail); dips add dip[0]+dip[1] frames; title card = card_nf frames.
"""
import json, os, sys, wave, copy, glob

D = dict(fps=30, size=[1920, 1080], cut_lead=0.15, card_nf=84, dip=[8, 7], raw_overlap_f=30, default_push=0.015,
         end_nf=75, vo_dir='vo/raw', min_s=0.0)
SHOT_KEYS = {'w', 'say', 'nudge_f', 'src', 'in', 'out', 'fit', 'speed', 'head', 'push', 'cabin', 'zones_extra', 'haar',
             'xfade', 'tr', 'date', 'credit_case', 'zoom', 'tint', 'still', 'page', 'map', 'list', 'mode', 'crop', 'nf', 'note', 'x'}


class EditError(Exception): pass
MIN_FIT, CUT_PAD = 0.8, 0.1   # slowest auto-fit speed before the window grows; gap kept before a source cut


# ---------------------------------------------------------------- words
_W = {}


def load_words(vdir, take):
    """[(word, start, end, sentence_no)] from <vdir>/<take>.words.json (Whisper: segments[].words[] {w,start,end})."""
    if take not in _W:
        p = os.path.join(vdir, take + '.words.json')
        if not os.path.exists(p): raise EditError(f'no words file for VO take {take}: {p}')
        J = json.load(open(p, encoding='utf8')); out, sn = [], 0
        for s in J.get('segments', []):
            for w in s.get('words', []):
                t = w.get('w', w.get('word', '')).strip()
                out.append((t, float(w['start']), float(w['end']), sn))
                if t.endswith(('.', '?', '!', '…')): sn += 1
        _W[take] = (out, J.get('duration'))
    return _W[take][0]


def vo_dur(vdir, take):
    p = os.path.join(vdir, take + '.wav')
    if os.path.exists(p):
        with wave.open(p) as f: return f.getnframes() / f.getframerate()
    load_words(vdir, take); d = _W[take][1]
    if d is None: raise EditError(f'VO take {take}: no wav and no "duration" in words.json')
    return float(d)


def word_start(vdir, take, w):
    W = load_words(vdir, take)
    if isinstance(w, str) and w.startswith('s'):                       # "s3" = first word of sentence 3
        n = int(w[1:]); hit = [x for x in W if x[3] == n]
        if not hit: raise EditError(f'{take}: no sentence {n} (has {W[-1][3] + 1})')
        return hit[0][1]
    if not (0 <= int(w) < len(W)): raise EditError(f'{take}: word index {w} out of range 0..{len(W) - 1}')
    return W[int(w)][1]


# ---------------------------------------------------------------- builder (port of gx-dashcam-s10 TL)
class TL:
    def __init__(self, V, src_mode):
        self.V, self.SM = V, src_mode
        self.fps = V['fps']; self.shots, self.ev, self.f = [], [], 0
        self.last = None; self.pre = 0

    def fr(self, t): return int(round(t * self.fps))

    def next_cut(self, src, t):   # first source cut after t (or the source end)
        c = [x for x in self.V.get('_cuts', {}).get(src, []) if x > t + 0.05]
        return min(c) if c else self.V.get('_dur', {}).get(src, t)

    def prev_cut(self, src, t):
        c = [x for x in self.V.get('_cuts', {}).get(src, []) if x < t - 0.05]
        return max(c) if c else 0.0

    def resolve_ff(self, s):
        FPS = self.fps; nf = s['nf']; pre = s.get('pre', 0); head = s.get('head', 0)
        if s.get('end_at') is not None:
            lo = s['lo'] if s.get('lo') is not None else 0.0
            play_nf = nf - head
            if not s['speed'] and s['end_at'] - lo < play_nf / FPS * MIN_FIT:   # start earlier (after the previous cut) instead of slowing
                lo = min(lo, max(self.prev_cut(s['src'], s['end_at']) + CUT_PAD, s['end_at'] - play_nf / FPS))
            avail = s['end_at'] - lo
            sp = s['speed'] or max(0.5, min(1.0, avail / (play_nf / FPS)))
            if play_nf * sp / FPS > avail + 1e-6:
                sp = 0.5; play_nf = int(avail / sp * FPS); head = nf - play_nf
            s['a'] = s['end_at'] - play_nf * sp / FPS
        else:
            sp = s['speed'] or 1.0
            if s.get('win_end') is not None and not s['speed']:
                need = max(1, nf - head - pre) / FPS
                if s['win_end'] - s['a'] < need * MIN_FIT:   # too short: play more of the clip (to the next cut), never crawl at 0.5
                    s['win_end'] = max(s['win_end'], min(s['a'] + need, self.next_cut(s['src'], s['a']) - CUT_PAD))
                avail = s['win_end'] - s['a']
                sp = max(0.5, min(1.0, avail / need))
            if pre:
                back = pre * sp / FPS
                if s['a'] - back >= 0: s['a'] -= back
                else: head += pre
        s['speed'] = round(sp, 4); s['head'] = head; s['tail_lim'] = s.get('win_end')
        return s

    def add(self, d, nf, case):
        d = dict(d); d['f0'] = self.f; d['nf'] = nf
        if self.pre:
            d['f0'] -= self.pre; d['nf'] += self.pre; d['fade_in'] = self.pre; d['pre'] = self.pre; self.pre = 0
        d.setdefault('case', case)
        if d['kind'] in ('ff', 'still') and d.get('src'):
            d.update({k: v for k, v in self.SM.get(d['src'], dict(mode='cover', crop=None)).items() if k not in d and k != 'look'})
        if d['kind'] == 'ff': self.resolve_ff(d)
        self.shots.append(d); self.f = d['f0'] + d['nf']
        return d

    def vo(self, take, case, specs, anchors, tail=0, min_nf=0, ref=''):
        vdir = self.V['_vdir']; dur = vo_dur(vdir, take)
        vo_f = self.f - self.V['raw_overlap_f'] if self.last == 'raw' else self.f
        end = vo_f + self.fr(dur) + tail
        self.ev.append(dict(type='vo', take=take, f0=vo_f, nf=self.fr(dur), case=case))
        cuts = [vo_f + self.fr(word_start(vdir, take, w) - self.V['cut_lead']) + nd for w, nd in anchors[1:]]
        if min_nf:
            b = [self.f] + cuts + [end]
            for i in range(1, len(b) - 1):
                if b[i] - b[i - 1] < min_nf: b[i] = min(b[i - 1] + min_nf, b[i] + 9)
                if b[i + 1] - b[i] < min_nf: b[i] = max(b[i + 1] - min_nf, b[i] - 9)
            cuts = b[1:-1]
        bounds = [self.f] + cuts + [end]
        for i, spec in enumerate(specs):
            if bounds[i + 1] - self.f <= 0:
                raise EditError(f'{ref} beat {i}: anchor not after the previous beat (cut {bounds[i + 1]} <= {self.f})')
            self.add(dict(spec, name=f'{take}.{i}'), bounds[i + 1] - self.f, case)
        self.last = 'vo'

    def raw(self, name, case, src, a, b, captions=(), ev_extra=None, **kw):
        nf = self.fr(b - a); caps = []
        for c in captions:
            t0, t1, text = c[:3]; y = c[3] if len(c) > 3 else None
            f0, f1 = self.fr(t0), max(self.fr(t1), self.fr(t0) + self.fps)
            caps.append((f0, min(f1, nf), text, y))
        d = self.add(dict(kind='ff', src=src, a=a, end_at=None, win_end=None, lo=None, speed=1.0, raw=True,
                          captions=caps, name=name, **kw), nf, case)
        e = dict(type='raw', name=name, src=src, a=a, b=b, f0=d['f0'], nf=d['nf'], case=case, gain_db=kw.get('gain_db', 0.0))
        e.update(ev_extra or {}); self.ev.append(e); self.last = 'raw'

    def hold(self, name, case, specs, **ev):
        f0 = self.f
        for i, (nf, spec) in enumerate(specs): self.add(dict(spec, name=f'{name}.{i}'), nf, case)
        self.ev.append(dict(type='hold', name=name, f0=f0, nf=self.f - f0, case=case, **ev)); self.last = 'hold'

    def card(self, case, num, title, plate):
        d = self.add(dict(kind='card', name=f'card{num:02d}', num=num, title=title, plate=plate), self.V['card_nf'], case)
        self.ev.append(dict(type='card', name=d['name'], f0=d['f0'], nf=d['nf'], case=case)); self.last = 'card'

    def dip(self):
        dn, up = self.V['dip']; p = self.shots[-1]
        p['nf'] += dn; p['fade_out'] = dn
        if p['kind'] == 'ff': p['tail_lim'] = p.get('win_end')
        self.ev.append(dict(type='dip', f0=self.f, nf=dn + up, centre=self.f + dn))
        self.f += dn + up; self.pre = up; self.last = 'dip'

    def end(self, nf): self.add(dict(kind='end', name='end'), nf, None)


# ---------------------------------------------------------------- beat -> shot spec
def beat_spec(b, C, V, ref):
    unknown = set(b) - SHOT_KEYS
    if unknown: raise EditError(f'{ref}: unknown beat keys {sorted(unknown)}')
    x = dict(b.get('x') or {})                                         # rare engine pass-through (e.g. map_fallback)
    common = {k: b[k] for k in ('push', 'cabin', 'zones_extra', 'haar', 'credit_case', 'mode', 'crop') if k in b}
    if b.get('date'): common['date'] = True
    if b.get('xfade'): common['xfade'] = int(b['xfade'])
    if b.get('tint'): common['tint'] = b['tint']
    if b.get('page'):
        pg = b['page']; d = dict(kind='page', page=pg['id'], hl=pg.get('hl'))
        if pg.get('box'): d['box'] = pg['box']
    elif b.get('map'):
        m = b['map']
        if m.get('id'):                                                # {"id": "c01_lufkin"} -> assets.json + assets/maps/<id>
            if m['id'] not in V.get('_maps', {}): raise EditError(f"{ref}: map id {m['id']} not in assets.json")
            m = {**V['_maps'][m['id']], 'tiles': f"assets/maps/{m['id']}", **{k: v for k, v in m.items() if k != 'id'}}
        d = dict(kind='map', tiles=m['tiles'], lat=m['lat'], lon=m['lon'], label=m['label'],
                               zooms=tuple(m.get('zooms', (10, 14))))
    elif b.get('list'):
        d = dict(kind='list', names=[c['title'] for c in V['_cases'] if c.get('role', 'case') == 'case'],
                 plate=V.get('list_plate'))
    elif b.get('still') is not None:
        st = b['still']; d = dict(kind='still', src=b['src'], t=st.get('t'), fz=st.get('fz'), s=st.get('s', 1.0),
                                  cx=st.get('cx', 0.5), cy=st.get('cy', 0.5), drift=tuple(st.get('drift', (0.0, 0.0))))
        if st.get('s_end') is not None: d['s_end'] = st['s_end']
    else:
        if 'src' not in b: raise EditError(f'{ref}: beat needs src (or still/page/map/list)')
        if b.get('fit') == 'end':
            d = dict(kind='ff', src=b['src'], a=None, win_end=None, end_at=b['out'], lo=b.get('in'), speed=b.get('speed'))
        else:
            d = dict(kind='ff', src=b['src'], a=b['in'], win_end=b.get('out'), end_at=None, lo=None, speed=b.get('speed'))
        if b.get('head'): d['head'] = int(b['head'])
        if b.get('zoom'): d.update(s=b['zoom']['s'], cx=b['zoom'].get('cx', 0.5), cy=b['zoom'].get('cy', 0.5))
    d.update(common); d.update(x); d['ref'] = ref
    return d


def compile_edit(edir, allow_missing=False):
    V = dict(D); V.update(json.load(open(os.path.join(edir, 'video.json'), encoding='utf8')))
    media = V.get('media_root') or os.path.dirname(edir)
    if not os.path.isabs(media): media = os.path.normpath(os.path.join(edir, media))
    V['_vdir'] = os.path.join(media, V['vo_dir'])
    ap = os.path.join(edir, 'assets.json')                    # assets/prep_assets.py spec: map beats may give only {"id"}
    A = json.load(open(ap, encoding='utf8')) if os.path.exists(ap) else {}
    V['_maps'] = {f"{cid}_{m['id']}": m for cid, c in A.get('cases', A).items() for m in c.get('maps', [])}
    cases = []
    for cid in V['order']:
        p = os.path.join(edir, 'cases', cid + '.json')
        if allow_missing and not os.path.exists(p): continue   # lint while other case agents still write their files
        C = json.load(open(p, encoding='utf8')); C.setdefault('id', cid); cases.append(C)
    V['_cases'] = cases
    src_mode = {k: dict(v) for k, v in V.get('sources', {}).items()}
    for C in cases:
        for k, v in C.get('sources', {}).items():
            m = dict(src_mode.get(k, {})); m.update(mode=v.get('mode', 'cover'), crop=v.get('crop'))
            if v.get('look'): m['look'] = v['look']
            src_mode[k] = m                                            # case entry overrides video.json sources
    V['_cuts'], V['_dur'] = {}, {}
    for f in glob.glob(os.path.join(edir, 'cuts', '*.json')):
        d = json.load(open(f, encoding='utf8')); V['_cuts'][d.get('src') or os.path.basename(f)[:-5]] = d.get('cuts', [])
    import subprocess
    for src in src_mode:
        mp = os.path.join(media, 'sources', src + '.mp4')
        if os.path.exists(mp):
            try: V['_dur'][src] = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp],
                                                       capture_output=True, text=True).stdout.strip()) - 0.1
            except ValueError: pass
    T = TL(V, src_mode); credit, dates = {}, {}
    for n, C in enumerate(cases):
        role = C.get('role', 'case'); case = C.get('case') if role == 'case' else None
        if case: credit[case] = C.get('credit'); dates[case] = C.get('date')
        if n > 0: T.dip()
        if role == 'case' and C.get('card', True) is not False:
            T.card(case, int(''.join(ch for ch in case if ch.isdigit()) or n), C['title'], C['card'])
            T.shots[-1]['ref'] = f"{C['id']}:card"
        for fi, it in enumerate(C['flow']):
            ref = f"{C['id']}:f{fi}"
            if 'vo' in it:
                bs = it['beats']
                if not bs: raise EditError(f'{ref}: vo needs beats')
                specs = [beat_spec(b, C, V, f'{ref}:b{bi}') for bi, b in enumerate(bs)]
                anchors = [(b.get('w', 0), int(b.get('nudge_f', 0))) for b in bs]
                for bi, b in enumerate(bs[1:], 1):
                    if 'w' not in b: raise EditError(f'{ref}:b{bi}: beat needs w (word index of the cut)')
                T.vo(it['vo'], case, specs, anchors, tail=int(it.get('tail_f', 0)),
                     min_nf=T.fr(it.get('min_s', V['min_s'])), ref=ref)
                for b, s in zip(bs, T.shots[-len(bs):]):
                    if b.get('tr') == 'dip': s['_inplace_dip'] = True
            elif 'raw' in it:
                kw = {k: it[k] for k in ('cabin', 'haar', 'zones_extra', 'push') if k in it}
                if it.get('gain_db'): kw['gain_db'] = it['gain_db']
                ev = {k: it[k] for k in ('lufs', 'bed_db') if it.get(k) is not None}
                ev['bleeps'] = [list(x[:2]) for x in it.get('bleeps', [])]
                T.raw(it['raw'], case, it['src'], it['in'], it['out'], captions=it.get('captions', []), ev_extra=ev,
                      ref=ref, **kw)
            elif 'hold' in it:
                specs = []
                for bi, b in enumerate(it['beats']):
                    nf = int(b['nf']); bb = {k: v for k, v in b.items() if k != 'nf'}
                    specs.append((nf, beat_spec(bb, C, V, f'{ref}:b{bi}')))
                ev = {k: it[k] for k in ('audio', 'bed_db') if k in it}
                T.hold(it['hold'], case, specs, **ev)
            elif it.get('dip'):
                T.dip()
            else:
                raise EditError(f'{ref}: flow item needs vo, raw, hold or dip')
    # in-place dips (no time added), then end hold
    dn, up = V['dip']
    for a, b in zip(T.shots, T.shots[1:]):
        if a.pop('_inplace_dip', False): a['fade_out'] = dn; b['fade_in'] = up
    if T.shots and T.shots[-1].pop('_inplace_dip', False): pass
    T.end(int(V['end_nf']))
    for i, s in enumerate(T.shots):
        s['idx'] = i
        if s['kind'] in ('ff', 'still'):
            c = s.get('credit_case') or s.get('case')
            s['credit'] = credit.get(c) if c else None
            if s.get('date'): s['date'] = dates.get(s['case'])
            s.setdefault('push', V['default_push'])
    total = check(T.shots)
    # audio plan: music beds switch at the card of the case that names a new bed (first bed from frame 0)
    cardf = {e['case']: e['f0'] for e in T.ev if e['type'] == 'card'}
    beds = []
    for C in cases:
        m = C.get('music')
        if not m: continue
        f0 = 0 if not beds else cardf.get(C.get('case'), None)
        if f0 is None: raise EditError(f"{C['id']}: music change needs a title card")
        if beds: beds[-1]['f1'] = f0
        beds.append(dict(file=m['file'], f0=f0, f1=None, offset=m.get('offset', 0.0)))
    meta = dict(src_mode=src_mode, cases={C['case']: C['title'] for C in cases if C.get('role', 'case') == 'case'},
                credit=credit, date=dates, order=V['order'], target_s=V.get('target_s'))
    return dict(version=1, fps=V['fps'], w=V['size'][0], h=V['size'][1], frames=total, media_root=media,
                meta=meta, shots=T.shots, events=T.ev, audio=dict(beds=beds, sfx=V.get('sfx', {})))


def check(shots):
    f = 0
    for s in shots:
        if s['nf'] <= 0: raise EditError(f"{s.get('ref', s['name'])}: {s['nf']} frames")
        if not (s['f0'] == f or s.get('pre')): raise EditError(f"{s['name']}: f0 {s['f0']} != {f}")
        f = s['f0'] + s['nf']
    return f


def main(a):
    if not a: print(__doc__); return 2
    edir = os.path.abspath(a[0])
    if '--words' in a:
        V = dict(D); V.update(json.load(open(os.path.join(edir, 'video.json'), encoding='utf8')))
        media = V.get('media_root') or os.path.dirname(edir)
        if not os.path.isabs(media): media = os.path.normpath(os.path.join(edir, media))
        take = a[a.index('--words') + 1]
        for i, (w, s, e, sn) in enumerate(load_words(os.path.join(media, V['vo_dir']), take)):
            print(f'{i:4d} {s:8.2f}  s{sn:<3d} {w}')
        return 0
    out = a[a.index('--out') + 1] if '--out' in a else os.path.join(edir, 'timeline.json')
    try:
        J = compile_edit(edir)
    except (EditError, KeyError) as e:
        print('COMPILE FAIL:', e); return 1
    json.dump(J, open(out, 'w', encoding='utf8'), indent=0)
    n = J['frames']; print(f"compiled {len(J['shots'])} shots, {n} f = {n / J['fps']:.2f} s -> {out}")
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
