"""autoedit rule checker (replaces review rounds; runs in about a second). Compiles first, then checks.

python -X utf8 lint.py <edit dir> [--case cNN]      exit 0 = PASS, 1 = fix list (per case file, beat refs cNN:fI:bJ)
Inputs: <edit dir>/video.json, cases/*.json, keys.json (blur + privacy flags), cuts/<SRC>.json ({"cuts": [s, ...]},
from prep_github.py; missing file = that check is skipped with a WARN), VO words (anchor text check).
Rules (video.json "lint" overrides the numbers): shot >= 3 s (intro >= 2 s; cards/end/hold freezes exempt), no source
cut inside a shot, no source window used twice inside the cases (intro teaser / outro recap exempt), <= 1 page and
<= 1 map per case, text devices (date/page/map/list) on screen >= 3.5 s, captions only on raws, every privacy-flagged
window that is shown has blur keys / haar / cabin, no banned devices, total length in target, no two cases with the
same opener, no device in more than 2 cases, beat `say` text matches the words at its index."""
import difflib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import compile as CP  # noqa: E402
sys.path.insert(0, os.path.join(HERE, 'engine'))
import mapclip as MC  # noqa: E402  (map clip freshness: assets/make_maps_pc.py)

R = dict(min_s=3.0, intro_min_s=2.0, text_min_s=3.5, max_pages=1, max_maps=1, max_device_cases=2, max_text_per_case=6,
         reuse_overlap_s=0.5, cut_margin_s=0.12,
         banned=['typewriter', 'tilt3d', 'tier_card', 'phone', 'berg', 'glitch', 'stamp', 'tape', 'vhs', 'case_card',
                 'red_seam', 'cyan', 'level_card'])


def used_range(s, fps):
    if s['kind'] == 'still': return (s['_t'], s['_t'])
    if s['kind'] != 'ff': return None
    play = max(0, s['nf'] - s.get('head', 0)) * s['speed'] / fps
    b = s['a'] + play
    if s.get('tail_lim') is not None: b = min(b, s['tail_lim'])
    return (s['a'], b)


def covered(K, s, t):
    B = K.get('blur', {}).get(s.get('src') or '', {})
    if s.get('cabin') or s.get('haar'): return True
    if B.get('haar_from') is not None and t >= B['haar_from']: return True
    for run in B.get('runs', []):
        if run[0][0] - 1e-6 <= t <= run[-1][0] + 1e-6: return True
    for tab in B.get('tables', []):
        if tab[0][0] - 0.5 <= t * 30 <= tab[-1][0] + 0.5: return True
    return False


def norm(w): return re.sub(r"[^a-z0-9']", '', w.lower())


def lint(edir, only=None):
    V = json.load(open(os.path.join(edir, 'video.json'), encoding='utf8'))
    R.update(V.get('lint', {}))
    fix, warn = {}, []

    def bad(ref, msg):
        fix.setdefault(ref.split(':')[0], []).append(f'{ref}: {msg}')
    try:
        J = CP.compile_edit(edir, allow_missing=True)
    except (CP.EditError, KeyError, ValueError) as e:
        print('FAIL compile:', e); return 1
    fps = J['fps']; S = J['shots']
    K = json.load(open(os.path.join(edir, 'keys.json'), encoding='utf8')) if os.path.exists(os.path.join(edir, 'keys.json')) else {}
    missing = [c for c in V['order'] if not os.path.exists(os.path.join(edir, 'cases', c + '.json'))]
    if missing: print('NOTE not written yet (skipped):', ' '.join(missing))
    cases = {cid: json.load(open(os.path.join(edir, 'cases', cid + '.json'), encoding='utf8')) for cid in V['order'] if cid not in missing}
    role = {cid: C.get('role', 'case') for cid, C in cases.items()}
    for s in S:
        s['_cid'] = (s.get('ref') or '').split(':')[0]
        if s['kind'] == 'still':
            s['_t'] = s['t'] if s.get('t') is not None else K.get('stills', {}).get(s.get('fz'), 0) / fps
    # 1 shot length
    for s in S:
        if s['kind'] in ('card', 'end') or not s.get('ref'): continue
        if '.hold' in s['name'] or s['name'].split('.')[0].endswith('-hold'): continue
        content = s['nf'] - s.get('pre', 0) - (s.get('fade_out', 0) if s is not S[-2] else 0)
        lim = R['intro_min_s'] if role.get(s['_cid']) == 'intro' else R['min_s']
        if content < round(lim * fps) - 1:
            bad(s['ref'], f"{s['kind']} {content / fps:.2f} s < {lim} s: move the next beat's w later or merge beats")
    # 2 source cuts
    cutdir = os.path.join(edir, 'cuts')
    for src in sorted({s.get('src') for s in S if s.get('src')}):
        p = os.path.join(cutdir, f'{src}.json')
        if not os.path.exists(p): warn.append(f'no cuts/{src}.json (run prep_github.py): cut-crossing not checked'); continue
        cuts = json.load(open(p, encoding='utf8'))['cuts']
        for s in S:
            if s.get('src') != src or s['kind'] != 'ff' or not s.get('ref'): continue
            a, b = used_range(s, fps)
            hit = [c for c in cuts if a + R['cut_margin_s'] < c < b - R['cut_margin_s']]
            if hit: bad(s['ref'], f'{src} {a:.2f}-{b:.2f} crosses source cut at {hit[0]:.2f}: end the beat (out) before it or start after it')
    # 3 window reuse (inside cases)
    seen = []
    for s in S:
        if role.get(s['_cid']) != 'case' or not s.get('src') or not s.get('ref'): continue
        if '-hold.' in s['name'] or (s['kind'] == 'ff' and s.get('speed', 1) <= 0.6): continue   # declared replays
        r = used_range(s, fps)
        if r is None: continue
        for o, ro in seen:
            if o['src'] != s['src']: continue
            ov = min(r[1], ro[1]) - max(r[0], ro[0])
            same_still = r[0] == r[1] and ro[0] == ro[1] and abs(r[0] - ro[0]) < R['reuse_overlap_s']
            if ov > R['reuse_overlap_s'] or same_still or (r[0] == r[1] and ro[0] < r[0] < ro[1]):
                bad(s['ref'], f"{s['src']} {r[0]:.2f}-{r[1]:.2f} reuses {o['ref']} ({ro[0]:.2f}-{ro[1]:.2f}): pick another window")
        seen.append((s, r))
    # 3b page/map assets exist (assets/prep_assets.py): page png + keys.pages entry + highlight boxes; map tiles per zoom
    media = V.get('media_root') or os.path.dirname(os.path.abspath(edir))
    if not os.path.isabs(media): media = os.path.normpath(os.path.join(edir, media))
    mc_style = MC.style_hash()
    for s in S:
        if not s.get('ref') or s['kind'] not in ('page', 'map'): continue
        if s['kind'] == 'page':
            n = s['page']; kp = K.get('pages', {}).get(n)
            if not os.path.exists(os.path.join(media, 'assets', 'pages', f'{n}_page.png')):
                bad(s['ref'], f'page {n}: no assets/pages/{n}_page.png (list it in assets.json, run assets/prep_assets.py)')
            elif not kp: bad(s['ref'], f'page {n}: no keys.json pages entry (run assets/prep_assets.py --post)')
            elif s.get('hl') is not None and (s['hl'] >= len(kp.get('hl', [])) or not kp['hl'][s['hl']].get('lines')):
                bad(s['ref'], f"page {n}: highlight {s['hl']} has no boxes (sentence not found on the page: fix assets.json highlight)")
            elif s.get('hl') is None and not s.get('box'): bad(s['ref'], f'page {n}: hl null needs a box')
        else:
            td = os.path.join(media, s['tiles']); z0, z1 = s.get('zooms', (10, 14))
            have = {f.split('_')[0] for f in os.listdir(td)} if os.path.isdir(td) else set()
            miss = [z for z in (z0, z1) if str(z) not in have]
            if miss: bad(s['ref'], f"map {s['tiles']}: no tiles at zoom {miss} (assets.json maps + assets/prep_assets.py)")
            else:                                                      # PC map clip (owner 2026-11-16): farm only pastes it
                why = MC.stale(media, S, s, mc_style)
                if why: bad(s['ref'], f"map {s['tiles']}: {why}: run python -X utf8 tools/autoedit/assets/make_maps_pc.py {edir}")
    # 4-6 per case devices, text holds, captions
    dev_cases, openers = {}, {}
    for cid, C in cases.items():
        mine = [s for s in S if s['_cid'] == cid]
        pages = [s for s in mine if s['kind'] == 'page']; maps = [s for s in mine if s['kind'] == 'map']
        if len(pages) > R['max_pages']: bad(pages[-1]['ref'], f'{len(pages)} pages in case (max {R["max_pages"]})')
        if len(maps) > R['max_maps']: bad(maps[-1]['ref'], f'{len(maps)} maps in case (max {R["max_maps"]})')
        texts = [s for s in mine if s['kind'] in ('page', 'map', 'list') or s.get('date')]
        if len(texts) > R['max_text_per_case']: bad(cid, f'{len(texts)} text devices (max {R["max_text_per_case"]})')
        for s in texts:
            if s['nf'] - s.get('pre', 0) < round(R['text_min_s'] * fps) - 1:
                bad(s['ref'], f"text device ({s['kind']}{' date' if s.get('date') else ''}) on screen {s['nf'] / fps:.2f} s < {R['text_min_s']} s")
        for s in mine:
            if s.get('captions') and not s.get('raw'): bad(s['ref'], 'captions only on raws')
        if role[cid] != 'case': continue
        devs = set()
        for s in mine:
            if s['kind'] in ('page', 'map', 'list'): devs.add(s['kind'])
            if s['kind'] == 'ff' and s.get('speed', 1) <= 0.6 and not s.get('raw'): devs.add('slow_replay')   # fit-to-VO stretch (0.6-1) is not a replay
            if s.get('s_end'): devs.add('freeze_zoom')
            if s.get('xfade'): devs.add('xfade')
            if s.get('tint'): devs.add('tint_' + str(s['tint']))
        for it in C['flow']:
            if 'hold' in it and any(b.get('speed', 1) < 0.95 or b.get('still') for b in it.get('beats', [])): devs.add('hold_replay')   # a normal-speed hold is a VO gap
        for d in devs: dev_cases.setdefault(d, []).append(cid)
        first = C['flow'][0]; fb = (first.get('beats') or [first])[0]
        sig = C.get('opener') or '+'.join([next(k for k in ('vo', 'raw', 'hold') if k in first),
                                           next((k for k in ('still', 'page', 'map', 'list') if fb.get(k) is not None), 'ff'),
                                           'zoom' if fb.get('zoom') else '', 'end' if fb.get('fit') == 'end' else '',
                                           str(fb.get('tint') or '')]).strip('+')
        openers.setdefault(sig, []).append(cid)
    for d, cs in dev_cases.items():
        if len(cs) > R['max_device_cases']: bad(cs[-1], f"device '{d}' used in {len(cs)} cases {cs} (max {R['max_device_cases']}): swap it in {cs[R['max_device_cases']:]}")
    for sig, cs in openers.items():
        if len(cs) > 1: bad(cs[-1], f"same opener '{sig}' as {cs[:-1]}: open differently (raw cold open, still, map, zoom...) or set a distinct 'opener' label")
    # 7 privacy
    for src, wins in K.get('privacy', {}).items():
        for a0, b0, *note in wins:
            for s in S:
                if s.get('src') != src or not s.get('ref'): continue
                r = used_range(s, fps)
                if not r or r[1] < a0 or r[0] > b0: continue
                t = max(a0, r[0])
                while t <= min(b0, r[1]) + 1e-6:
                    if not covered(K, s, t):
                        bad(s['ref'], f'{src} {t:.1f} s is privacy-flagged ({note[0] if note else "flag"}) with no blur key: add keys or haar=true'); break
                    t += 0.25
    # 8 banned devices (any key or string value of a beat)
    ban = set(R['banned'])
    for cid, C in cases.items():
        blob = json.dumps(C).lower()
        for b in ban:
            if re.search(r'"' + re.escape(b) + r'"', blob): bad(cid, f"banned device '{b}'")
    # 9 total length
    if V.get('target_s'):
        lo, hi = V['target_s']; tot = J['frames'] / fps
        if not lo <= tot <= hi: fix.setdefault('video', []).append(f'video: total {tot:.1f} s outside target {lo}-{hi} s')
    # 9b every music / sfx file exists (a wrong name only failed on the farm's audio job, 2026-11-16 t10)
    for cid, C in cases.items():
        mu = C.get('music')
        if isinstance(mu, dict) and mu.get('file') and not os.path.exists(os.path.join(J['media_root'], 'assets', 'music', mu['file'])):
            bad(cid, f"music file '{mu['file']}' not in assets/music: " + ', '.join(sorted(os.listdir(os.path.join(J['media_root'], 'assets', 'music')))))
    for k, f in (V.get('sfx') or {}).items():
        if not os.path.exists(os.path.join(J['media_root'], 'assets', 'sfx', f)):
            fix.setdefault('video', []).append(f"video: sfx '{k}' file '{f}' not in assets/sfx")
    # 10 anchor text
    vdir = os.path.join(J['media_root'], V.get('vo_dir', 'vo/raw'))
    for cid, C in cases.items():
        for fi, it in enumerate(C['flow']):
            for bi, b in enumerate(it.get('beats', []) if 'vo' in it else []):
                if 'say' in b and isinstance(b.get('w'), int):
                    W = CP.load_words(vdir, it['vo']); got = ' '.join(x[0] for x in W[b['w']:b['w'] + len(b['say'].split())])
                    if difflib.SequenceMatcher(None, norm(got), norm(b['say'])).ratio() < 0.7:
                        bad(f'{cid}:f{fi}:b{bi}', f"say '{b['say']}' but word {b['w']} is '{got}': fix w")
    if only: fix = {k: v for k, v in fix.items() if k == only}
    for w in warn: print('WARN', w)
    if not fix:
        print(f"PASS {len(S)} shots, {J['frames'] / fps:.1f} s"); return 0
    n = sum(len(v) for v in fix.values())
    print(f'FIX {n} issue(s):')
    for cid in sorted(fix):
        print(f'== {cid}')
        for m in fix[cid]: print('  ', m)
    return 1


if __name__ == '__main__':
    a = sys.argv[1:]
    sys.exit(lint(a[0], a[a.index('--case') + 1] if '--case' in a else None))
