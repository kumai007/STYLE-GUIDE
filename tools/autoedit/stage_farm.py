"""Stage a farm project for case-farm/farm.sh from an edit folder (hardlinks; no copies of media).

python -X utf8 stage_farm.py <production dir> <edit dir> <farm dir> [--tiles]
Map shots: stages assets/maps/clips/<map>__<nf>f.mp4 (assets/make_maps_pc.py) and no map tiles; exits with the
make_maps_pc.py command if a clip is missing/stale. --tiles = old fallback (stage all tiles, farm renders maps).
<farm dir>/project.json + part dir full/ = a production-shaped folder: build/ (engine *.py + timeline.json + keys.json
+ gamma.json + fonts), sources/, assets/, vo/raw/. farm.sh splits the part into chunks over the machines itself.
Removes stale files only inside <farm dir>/full."""
import json, os, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ENG = os.path.join(HERE, 'engine')


def link(src, dst):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.exists(dst):
        if os.stat(dst).st_ino == os.stat(src).st_ino: return
        os.remove(dst)
    try: os.link(src, dst)
    except OSError: shutil.copyfile(src, dst)


def main(prod, edir, farm):
    # Always recompile first: a stale timeline.json (case files edited after the last compile) once sent old music
    # names to the farm and only the audio job failed (2026-11-16 t10).
    import subprocess
    subprocess.run([sys.executable, '-X', 'utf8', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'compile.py'), edir], check=True)
    want = {}
    for f in os.listdir(ENG):
        if f.endswith('.py'): want['build/' + f] = os.path.join(ENG, f)
    for f in ('timeline.json', 'keys.json', 'gamma.json'):
        if os.path.exists(os.path.join(edir, f)): want['build/' + f] = os.path.join(edir, f)
    fonts = os.path.join(prod, 'build', 'fonts')
    for f in (os.listdir(fonts) if os.path.isdir(fonts) else []): want['build/fonts/' + f] = os.path.join(fonts, f)
    J = json.load(open(os.path.join(edir, 'timeline.json'), encoding='utf8'))
    for s in J['shots']:
        for src in filter(None, (s.get('src'), (s.get('plate') or {}).get('src'))): want[f'sources/{src}.mp4'] = os.path.join(prod, 'sources', src + '.mp4')
    for e in J['events']:
        if e['type'] == 'vo': want[f"vo/raw/{e['take']}.wav"] = os.path.join(prod, 'vo', 'raw', e['take'] + '.wav')
    # Map shots play PC-rendered clips (owner 2026-11-16): stage the clips, never the ~3,700 tiles. --tiles = old way.
    tiles = '--tiles' in sys.argv
    if not tiles:
        sys.path.insert(0, ENG); import mapclip
        S = J['shots']; style = mapclip.style_hash(); bad = []
        for s in S:
            if s['kind'] != 'map': continue
            why = mapclip.stale(prod, S, s, style)
            if why: bad.append(f"{s.get('ref') or s['name']}: {why}")
            else: want[mapclip.clip_rel(s)] = mapclip.clip_path(prod, s)
        if bad:
            sys.exit('stage_farm: map clips missing or stale:\n  ' + '\n  '.join(bad) +
                     f'\nrun: python -X utf8 tools/autoedit/assets/make_maps_pc.py {edir}  (then stage again)')
    for root, dirs, files in os.walk(os.path.join(prod, 'assets')):
        if not tiles: dirs[:] = [d for d in dirs if os.path.relpath(os.path.join(root, d), prod).replace('\\', '/') != 'assets/maps']
        for f in files:
            r = os.path.relpath(os.path.join(root, f), prod).replace('\\', '/'); want[r] = os.path.join(root, f)
    part = os.path.join(farm, 'full')
    for r, src in want.items(): link(src, os.path.join(part, *r.split('/')))
    for root, dirs, files in os.walk(part):
        dirs[:] = [d for d in dirs if d != '__pycache__']
        for f in files:
            r = os.path.relpath(os.path.join(root, f), part).replace('\\', '/')
            if r not in want: os.remove(os.path.join(root, f))
    json.dump({'title': J['meta'].get('title') or os.path.basename(prod), 'parts': [{'name': 'full', 'dir': 'full'}]},
              open(os.path.join(farm, 'project.json'), 'w', encoding='utf-8'))
    print(f'staged {len(want)} files -> {part}')


if __name__ == '__main__':
    main(*[os.path.abspath(x) for x in sys.argv[1:] if not x.startswith('--')][:3])
