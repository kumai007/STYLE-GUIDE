"""Regenerate engine/ from a production's hand-tuned build dir (kit/build/audio/farm_entry), stripping the
case-specific bits so the engine reads only timeline.json + keys.json. Re-run whenever the source production's
renderer improves; every patch is an exact-text replace that fails loudly if the source changed shape.

python -B -X utf8 regen_engine.py <production>/build
Prints any leftover case-specific tokens (source tags / case ids) so they can be data-fied by hand."""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__)); E = os.path.join(HERE, 'engine')
FILES = ('kit.py', 'build.py', 'audio.py', 'farm_entry.py', 'farm_contract.py')


class Patch:
    def __init__(self, path): self.p = path; self.s = open(path, encoding='utf8').read()

    def rep(self, a, b):
        n = self.s.count(a)
        if n != 1: raise SystemExit(f'{os.path.basename(self.p)}: patch anchor found {n}x: {a[:70]!r}')
        self.s = self.s.replace(a, b)

    def cut(self, a, b, new=''):
        i, j = self.s.index(a), self.s.index(b); self.s = self.s[:i] + new + self.s[j:]

    def save(self): open(self.p, 'w', encoding='utf8', newline='\n').write(self.s)


BLUR = '''def _mf_box(table, t):
    fno = t * FPS; fs = [r[0] for r in table]
    if fno < fs[0] - 0.5 or fno > fs[-1] + 0.5: return None
    cx, cy, w, h = [float(np.interp(fno, fs, [r[j] for r in table])) for j in range(1, 5)]
    return (cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), max(6.0, h / 3)


def ellipse_box(z): cx, cy, rx, ry = z; return (cx - rx, cy - ry, cx + rx, cy + ry)


def blur_boxes(shot, src, t):
    """[(box, sigma)] for one source frame at src time t. keys.json blur.<SRC>:
    cabin_zones [[cx,cy,rx,ry]] (shots with cabin=true, + shot zones_extra; cabin_scale, cabin_sigma), runs [[[t,x0,y0,x1,y1],..]] (seconds,
    linear), tables [[[frame,cx,cy,w,h],..]] (30 fps frame numbers, sigma = h/3)."""
    out = []; B = BLUR.get(src or '', {}); k = B.get('cabin_scale', 1.0)
    if shot.get('cabin'):                       # cabin_scale trims zones; cabin_sigma 'cap' = glare-capped blur
        out += [(ellipse_box((z[0], z[1], z[2] * k, z[3] * k)), B.get('cabin_sigma'))
                for z in B.get('cabin_zones', []) + list(shot.get('zones_extra') or [])]
    for run in B.get('runs', []):
        b = _interp_box(run, t)
        if b: out.append((b, None))
    for tab in B.get('tables', []):
        r = _mf_box(tab, t)
        if r: out.append(r)
    return out


def wants_haar(shot):
    """Inline face blur: flagged shots + every shot of a source past its keys.json blur.<SRC>.haar_from (s)."""
    hf = BLUR.get(shot.get('src') or '', {}).get('haar_from')
    if shot.get('haar'): return True
    if hf is None or shot['kind'] not in ('ff', 'still'): return False
    return (shot.get('a') if shot['kind'] == 'ff' else still_t(shot)) >= hf


'''

SEGMENTS = '''def segments():
    """Audio plan rows from the compiled events (vo / raw / hold / card / dip) + list shots, in frame order."""
    rows = []
    for e in TLM.events():
        k = e['type']; f0 = e['f0']
        r = {'name': e.get('take') or e.get('name') or k, 'kind': k, 'f0': f0, 'f1': f0 + e['nf'], 'bed_db': e.get('bed_db')}
        if k == 'raw':
            r.update(id=e['name'], src=e['src'], w0=e['a'], w1=e['b'], lufs=e.get('lufs'), bleeps=e.get('bleeps', []))
        rows.append(r)
    for s in TLM.timeline():
        if s['kind'] == 'list': rows.append({'name': s['name'], 'kind': 'list', 'f0': s['f0'], 'f1': s['f0'] + s['nf'], 'bed_db': None})
    rows.sort(key=lambda r: r['f0'])
    return rows


'''


MAP_OLD = '''    elif kind == 'map':
        tiles = os.path.join(P, shot['tiles'])
        for i in range(i0, i1):
            yield kit.map_eox(i, nf, tiles, shot['lat'], shot['lon'], shot['label'], zooms=shot.get('zooms', (10, 14)))
'''
MAP_NEW = '''    elif kind == 'map':                                                  # PC clip (make_maps_pc.py) else tiles
        clip = mapclip.clip_path(P, shot)
        if os.path.exists(clip) and not os.environ.get('AUTOEDIT_MAP_TILES'): yield from mapclip.read(clip, i0, i1)
        else: yield from _map_tiles(shot, i0, i1)
'''
MAP_TILES = '''def _map_tiles(shot, i0, i1):
    """Map frames from cached EOX tiles (kit.map_eox); assets/make_maps_pc.py renders the PC map clips with this."""
    tiles = os.path.join(P, shot['tiles'])
    for i in range(i0, i1):
        yield kit.map_eox(i, shot['nf'], tiles, shot['lat'], shot['lon'], shot['label'], zooms=shot.get('zooms', (10, 14)))


'''
FE_OLD = "    elif k == 'page': out.add(f\"assets/pages/{s['page']}_page.png\")\n"
FE_NEW = FE_OLD + "    elif k == 'map': out.add(mapclip.clip_rel(s))                     # PC map clip (may be > 25 MB: not in the pack)\n"


def regen(src):
    os.makedirs(E, exist_ok=True)
    for f in FILES: shutil.copyfile(os.path.join(src, f), os.path.join(E, f))
    b = Patch(os.path.join(E, 'build.py'))
    b.s = re.sub(r'^"""[^\n]*', '"""autoedit engine picture renderer (generated by regen_engine.py from a production build.py).\n'
                 'Reads the compiled timeline.json + keys.json via timeline.py (no case-specific code).', b.s, count=1)
    b.rep("K = json.load(open(os.path.join(HERE, 'keys.json'), encoding='utf8'))",
          "K = json.load(open(TLM.KEYS_PATH, encoding='utf8')) if os.path.exists(TLM.KEYS_PATH) else {}\nBLUR = K.get('blur', {})")
    b.rep("GAMMA_FILE = os.path.join(HERE, 'gamma.json')",
          "GAMMA_FILE = os.environ.get('AUTOEDIT_GAMMA') or os.path.join(TLM.EDIT_DIR, 'gamma.json')")
    b.cut('def _uber_runs():', 'def has_blur(shot):', BLUR)
    b.rep("K['mf_stills'][shot['fz']]", "K['stills'][shot['fz']]")
    b.s = re.sub(r"C03_BOX = \[\[.*\n", '', b.s)
    b.rep("plate = _plate(dict(src='RWG', t=18.0))", "plate = _plate(shot['plate'])")
    b.rep("lines, start = C03_BOX, 10 ** 6", "lines, start = shot['box'], 10 ** 6       # push only, no marker")
    b.s = b.s.replace("    if shot.get('src') != 'MF':\n",
                      "    if (TLM.SRC_MODE.get(shot.get('src')) or {}).get('look') != 'sky_mute':   # per-source look (video.json sources)\n")
    b.cut('def rwg_strip(', "if __name__ == '__main__':")
    b.rep("    if 'rwg' in sys.argv: print(rwg_strip())\n", '')
    b.rep("os.path.join(P, 'qa', 'sheets', 'CONTACT_all.jpg')", "os.path.join(TLM.EDIT_DIR, 'qa', 'CONTACT_all.jpg')")
    b.rep(MAP_OLD, MAP_NEW)                                    # PC map clips (owner 2026-11-16; engine/mapclip.py)
    b.rep("import timeline as TLM  # noqa: E402\n", "import timeline as TLM  # noqa: E402\nimport mapclip  # noqa: E402\n")
    b.rep("def _core_other(shot, i0, i1):\n", MAP_TILES + "def _core_other(shot, i0, i1):\n")
    b.save()

    k = Patch(os.path.join(E, 'kit.py'))
    k.rep("F_TITLE = os.path.join(HERE, 'fonts', 'BebasNeue-Regular.ttf')\nF_MONO = os.path.join(HERE, 'fonts', 'JetBrainsMono-wght.ttf')",
          "_FONTS = next((d for d in (os.environ.get('AUTOEDIT_FONTS'), os.path.join(HERE, 'fonts'),\n"
          "                           os.path.join(os.environ.get('AUTOEDIT_MEDIA', ''), 'build', 'fonts')) if d and os.path.isdir(d)),\n"
          "              os.path.join(HERE, 'fonts'))   # fonts are not in the public repo: farm part build/fonts or env\n"
          "F_TITLE = os.path.join(_FONTS, 'BebasNeue-Regular.ttf')\nF_MONO = os.path.join(_FONTS, 'JetBrainsMono-wght.ttf')")
    k.save()

    fe = Patch(os.path.join(E, 'farm_entry.py'))
    fe.s = re.sub(r'^"""[^\n]*', '"""autoedit engine farm entry (farm contract v1; generated by regen_engine.py). Wraps build.py + audio.py.', fe.s, count=1)
    fe.rep("elif k == 'list': out.add(SRC('RWG'))", "elif k == 'list': out.add(SRC(s['plate']['src']))")
    fe.rep(FE_OLD, FE_NEW)
    fe.rep("import audio as AU\n", "import audio as AU\nimport mapclip\n")
    fe.save()

    a = Patch(os.path.join(E, 'audio.py'))
    a.rep("HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.dirname(HERE)",
          "HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)\n"
          "import timeline as TLM  # noqa: E402  (compiled timeline.json: events + audio plan)\nP = TLM.P")
    a.s = re.sub(r"RAW_LUFS_OVR = \{.*\n", '', a.s); a.s = re.sub(r"BED_DUCK_SEGS = .*\n", '', a.s)
    a.cut('def segments():', 'def total_frames(', SEGMENTS)
    a.rep("    return segs[-1]['f1']", "    return max(s['f1'] for s in segs)")
    a.rep("            sys.path.insert(0, HERE); from timeline import timeline; shots = timeline()", "            shots = TLM.timeline()")
    a.s = re.sub(r"    if NF != segs\[-1\]\['f1'\]:.*\n    keys = json.load\(.*\n", "    AP = TLM.audio_plan()\n", a.s)
    a.rep("        if any(s['name'].startswith(d) for d in BED_DUCK_SEGS): duck[s['f0']:s['f1']] = True",
          "        if s.get('bed_db'): duck[s['f0']:s['f1']] = np.minimum(duck[s['f0']:s['f1']], s['bed_db'])")
    a.rep("duck = np.zeros(NF, bool)", "duck = np.zeros(NF, np.float32)")
    a.rep("    bleeps = keys.get('bleeps', [])\n", '')
    a.s = re.sub(r"        tgt = RAW_LUFS_OVR\.get\(s\['id'\], RAW_LUFS\);(.*)\n        for b in bleeps:\n.*\n.*continue",
                 "        tgt = s['lufs'] if s.get('lufs') is not None else RAW_LUFS;\\1\n"
                 "        for b in s['bleeps']:                              # source seconds [a, b]\n"
                 "            if b[1] <= s['w0'] or b[0] >= s['w1']: continue", a.s)
    i = a.s.index("    beds = [('"); j = a.s.index("    xf = int(XFADE * SR)")
    a.s = a.s[:i] + ("    beds = [(b['file'], b['f0'], NF if b['f1'] is None else b['f1'], b.get('offset')) for b in AP['beds']]"
                     "   # video.json music\n") + a.s[j:]
    a.rep("gdb[duck] -= 8.0", "gdb += duck")
    a.s = re.sub(r"    for fn, starts, centre in \(\('es_[^']+', (\[c \+ 4 for c in cards\]), False\),\n\s+\('es_[^']+', ",
                 "    SX = AP.get('sfx', {})\n    for fn, starts, centre in ((SX.get('card'), \\1, False),\n"
                 "                               (SX.get('dip'), ", a.s)
    a.rep("        p = os.path.join(P, 'assets', 'sfx', fn)", "        if not fn: continue\n        p = os.path.join(P, 'assets', 'sfx', fn)")
    a.rep("    if min(lus) < 12:", "    if lus and min(lus) < 12:")
    a.s = re.sub(r'^"""[^\n]*', '"""autoedit engine audio (generated by regen_engine.py from a production audio.py).', a.s, count=1)
    a.s = re.sub(r'Audio timing = build/TIMELINE_PLAN\.md[^\n]*', 'Timing = compiled events in timeline.json; beds / SFX / raw levels = '
                 'its audio plan (video.json music, sfx; raw lufs, bed_db, bleeps).', a.s, count=1)
    a.s = a.s.replace('# C04 + outro: track end = video end', '# offset null: track end = video end')
    a.save()
    import ast
    for f in FILES: ast.parse(open(os.path.join(E, f), encoding='utf8').read())
    left = []
    for f in ('kit.py', 'build.py', 'audio.py', 'farm_entry.py'):
        for n, ln in enumerate(open(os.path.join(E, f), encoding='utf8'), 1):
            if re.search(r"'(UBER|RWG|MF|SPX)'|\bC0\d\b|keys\.json'\)|TIMELINE_PLAN|uber_|rwg_|mf_(plate|window|stills)", ln):
                left.append(f'{f}:{n}: {ln.strip()[:110]}')
    print(f'engine regenerated from {src}; leftover case-specific lines: {len(left)}')
    for x in left: print('  ', x)
    return left


if __name__ == '__main__':
    sys.exit(1 if regen(os.path.abspath(sys.argv[1])) else 0)
