"""Convert a hand-written production timeline (gx-dashcam-s10 style build/timeline.py + keys.json) into autoedit
edit files: video.json, cases/cNN.json, keys.json. Reads the production read-only (no bytecode written).

python -B -X utf8 convert_legacy.py <production dir> <out edit dir> [--audio legacy_audio.json]
--audio: {"music": {"c00": {"file", "offset"}, ...}, "sfx": {"card", "dip"}, "raw_lufs": {"C02-R2": -23},
          "raw_bed_db": {"C04-R1": -8}, "list_plate": {"src", "t"}, "page_box": {"c03": [[x0,y0,x1,y1]]}}
(things the legacy code hard-wired in build.py/audio.py instead of data)."""
import copy, importlib, json, os, sys

sys.dont_write_bytecode = True


def main(prod, out, audio_json=None):
    LA = json.load(open(audio_json, encoding='utf8')) if audio_json else {}
    bdir = os.path.join(prod, 'build'); sys.path.insert(0, bdir)
    TLM = importlib.import_module('timeline')
    raw_specs = {}
    orig_resolve = TLM.resolve_ff

    def spy(s):                                   # capture each ff spec before frame resolution
        raw_specs[(s['f0'], s.get('name'))] = copy.deepcopy(s); return orig_resolve(s)
    TLM.resolve_ff = spy
    shots = TLM.timeline(); ev = TLM.events(); FPS = TLM.FPS
    K = json.load(open(os.path.join(bdir, 'keys.json'), encoding='utf8'))

    def words(take):
        J = json.load(open(os.path.join(prod, 'vo', 'raw', take + '.words.json'), encoding='utf8'))
        return [(w['w'].strip(), float(w['start'])) for s in J['segments'] for w in s['words']]

    def beat(s):
        b = {}
        k = s['kind']
        if k == 'ff':
            r = raw_specs[(s['f0'], s['name'])]
            b['src'] = r['src']
            if r.get('end_at') is not None:
                b.update({'in': r.get('lo'), 'out': r['end_at'], 'fit': 'end'})
            else:
                b['in'] = r['a']
                if r.get('win_end') is not None: b['out'] = r['win_end']
            if r.get('speed'): b['speed'] = r['speed']
            if r.get('head'): b['head'] = r['head']
            if s.get('xfade'): b['xfade'] = s['xfade']
            if r.get('s', 1.0) != 1.0: b['zoom'] = {'s': r['s'], 'cx': r.get('cx', 0.5), 'cy': r.get('cy', 0.5)}
        if s.get('tint'): b['tint'] = s['tint']
        elif k == 'still':
            b['src'] = s['src']; st = {}
            if s.get('fz'): st['fz'] = s['fz']
            else: st['t'] = s['t']
            for kk, dv in (('s', 1.0), ('cx', 0.5), ('cy', 0.5)):
                if s.get(kk, dv) != dv: st[kk] = s[kk]
            if tuple(s.get('drift', (0, 0))) != (0.0, 0.0): st['drift'] = list(s['drift'])
            if s.get('s_end') is not None: st['s_end'] = s['s_end']
            b['still'] = st
        elif k == 'page':
            b['page'] = {'id': s['page'], 'hl': s['hl']}
            if s['hl'] is None: b['page']['box'] = LA['page_box'][s['page']]
        elif k == 'map':
            b['map'] = {kk: s[kk] for kk in ('tiles', 'lat', 'lon', 'label')}; b['map']['zooms'] = list(s.get('zooms', (10, 14)))
        elif k == 'list':
            b['list'] = True
        for kk in ('cabin', 'zones_extra', 'haar', 'credit_case'):
            if s.get(kk): b[kk] = s[kk]
        if s.get('date'): b['date'] = True
        if s.get('push', 0.015) != 0.015: b['push'] = s['push']
        if s.get('map_fallback'): b['x'] = {'map_fallback': True}
        return b

    # group shots by event
    by_name = {}
    for s in shots: by_name.setdefault(s['name'].rsplit('.', 1)[0] if '.' in s['name'] else s['name'], []).append(s)
    parts, cur = [], None
    for e in ev:
        if e['type'] == 'dip': continue
        if e['type'] == 'card' or cur is None or (cur['case'] is not None and e.get('case') is None):
            cur = {'case': e.get('case'), 'flow': [], 'card': None}; parts.append(cur)
        if e['type'] == 'card':
            c = next(s for s in shots if s['name'] == e['name']); cur['card'] = c['plate']; continue
        if e['type'] == 'vo':
            take = e['take']; ss = by_name[take]; W = words(take); bs = []
            for i, s in enumerate(ss):
                b = beat(s)
                if i > 0:
                    target = s['f0']
                    cand = [(abs(e['f0'] + round((st - TLM.CUT_LEAD) * FPS) - target), j) for j, (_, st) in enumerate(W)]
                    d, j = min(cand)
                    nd = target - (e['f0'] + round((W[j][1] - TLM.CUT_LEAD) * FPS))
                    b = {'w': j, 'say': W[j][0], **({'nudge_f': nd} if nd else {}), **b}
                if s.get('fade_out') and i < len(ss) - 1: b['tr'] = 'dip'
                bs.append(b)
            item = {'vo': take, 'beats': bs}
            last = ss[-1]; tail = last['f0'] + last['nf'] - (e['f0'] + e['nf'])
            if last.get('fade_out') and tail >= TLM.DIP_DOWN and i == len(ss) - 1: tail -= TLM.DIP_DOWN
            if tail: item['tail_f'] = tail
            cur['flow'].append(item)
        elif e['type'] == 'raw':
            s = next(x for x in shots if x['name'] == e['name'])
            it = {'raw': e['name'], 'src': e['src'], 'in': e['a'], 'out': e['b']}
            if s.get('captions'): it['captions'] = [[round(f0 / FPS, 3), round(f1 / FPS, 3), t] + ([y] if y is not None else [])
                                                   for f0, f1, t, y in s['captions']]
            bl = [b[:2] for b in K.get('bleeps', []) if (b[3] if len(b) > 3 else 'UBER') == e['src'] and b[0] < e['b'] and b[1] > e['a']]
            if bl: it['bleeps'] = bl
            for kk in ('cabin', 'haar', 'zones_extra'):
                if s.get(kk): it[kk] = s[kk]
            if e.get('gain_db'): it['gain_db'] = e['gain_db']
            if e['name'] in LA.get('raw_lufs', {}): it['lufs'] = LA['raw_lufs'][e['name']]
            if e['name'] in LA.get('raw_bed_db', {}): it['bed_db'] = LA['raw_bed_db'][e['name']]
            cur['flow'].append(it)
        elif e['type'] == 'hold':
            ss = by_name[e['name']]
            it = {'hold': e['name'], 'beats': [{'nf': s['nf'], **beat(s)} for s in ss]}
            for kk in ('audio', 'bed_db'):
                if kk in e: it[kk] = e[kk]
            cur['flow'].append(it)
    # min_s for the intro (legacy min_nf=60)
    os.makedirs(os.path.join(out, 'cases'), exist_ok=True)
    order = []
    for n, p in enumerate(parts):
        cid = f'c{n:02d}'; order.append(cid)
        if p['case']:
            c = p['case']
            C = {'id': cid, 'role': 'case', 'case': c, 'title': TLM.CASES[c], 'credit': TLM.CREDIT[c], 'date': TLM.DATE[c],
                 'card': p['card'], 'sources': {}}
        else:
            C = {'id': cid, 'role': 'intro' if n == 0 else 'outro'}
        used = {b.get('src') for it in p['flow'] for b in it.get('beats', [it])} - {None}
        if p['case']: C['sources'] = {s: {'mode': TLM.SRC_MODE[s]['mode'], 'crop': TLM.SRC_MODE[s]['crop'] and list(TLM.SRC_MODE[s]['crop'])}
                                      for s in sorted(used)}
        C['flow'] = p['flow']
        if cid in LA.get('music', {}): C['music'] = LA['music'][cid]
        json.dump(C, open(os.path.join(out, 'cases', cid + '.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    end = next(s for s in shots if s['kind'] == 'end')
    V = {'title': os.path.basename(prod), 'fps': FPS, 'size': [1920, 1080], 'media_root': prod, 'vo_dir': 'vo/raw',
         'order': order, 'cut_lead': TLM.CUT_LEAD, 'card_nf': TLM.CARD_NF, 'dip': [TLM.DIP_DOWN, TLM.DIP_UP],
         'end_nf': end['nf'], 'sources': {k: {'mode': v['mode'], 'crop': v['crop'] and list(v['crop']), **({'look': LA['src_look'][k]} if k in LA.get('src_look', {}) else {})} for k, v in TLM.SRC_MODE.items()},
         'list_plate': LA.get('list_plate'), 'sfx': LA.get('sfx', {}), 'target_s': LA.get('target_s')}
    json.dump(V, open(os.path.join(out, 'video.json'), 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    # keys: generic blur layout
    def uber(run): return [[t, cx - s * .5, cy - s * .62, cx + s * .5, cy + s * .62] for t, cx, cy, s in run]
    GK = {'stills': K.get('mf_stills', {}), 'pages': K.get('pages', {}),
          'blur': {'UBER': {'cabin_zones': K['uber_zones'], 'cabin_scale': 0.85, 'cabin_sigma': 'cap', 'runs': [uber(r) for r in K['uber_keys']]},
                   'RWG': {'runs': K['rwg_keys'], 'haar_from': 58.0},
                   'MF': {'tables': [K['mf_plate'], K['mf_window']]}},
          'privacy': LA.get('privacy', {})}
    json.dump(GK, open(os.path.join(out, 'keys.json'), 'w', encoding='utf8'), indent=0)
    n = shots[-1]['f0'] + shots[-1]['nf']
    print(f'converted {len(shots)} shots ({n} f) into {len(order)} edit files -> {out}')
    return n


if __name__ == '__main__':
    a = sys.argv[1:]
    main(a[0], a[1], a[a.index('--audio') + 1] if '--audio' in a else None)
