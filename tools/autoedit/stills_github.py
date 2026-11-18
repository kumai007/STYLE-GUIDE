"""ONE task.sh run: one still per beat for every case, all cases in parallel on GitHub; contact sheets come back to
<edit>/qa/<cNN>_contact.jpg (+ <edit>/qa/<cNN>/<ref>.jpg). Compile first (timeline.json must be current).

python -X utf8 stills_github.py <production rel> <edit rel> [--cases c01,c03] [--dry]"""
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
TASK = os.path.join(ROOT, 'tools', 'case-farm', 'task.sh')


def needs(prod, shots):
    out = set()
    for s in shots:
        if s.get('src'): out.add(f"{prod}/sources/{s['src']}.mp4")
        if s.get('plate'): out.add(f"{prod}/sources/{s['plate']['src']}.mp4")
        if s['kind'] == 'page': out.add(f"{prod}/assets/pages/{s['page']}_page.png")
        if s['kind'] == 'map':                                         # PC map clip (make_maps_pc.py) else tiles
            clip = f"{prod}/assets/maps/clips/{os.path.basename(s['tiles'].rstrip('/'))}__{s['nf']}f.mp4"
            out.add(clip if os.path.exists(os.path.join(ROOT, clip)) else f"{prod}/{s['tiles']}")
    return sorted(out)


def main(a):
    prod, edir = a[0].rstrip('/'), a[1].rstrip('/')
    J = json.load(open(os.path.join(ROOT, edir, 'timeline.json'), encoding='utf8'))
    order = J['meta']['order']
    if '--cases' in a: order = a[a.index('--cases') + 1].split(',')
    items = []
    for cid in order:
        S = [s for s in J['shots'] if (s.get('ref') or '').startswith(cid + ':')]
        if S: items.append(dict(item=f'stills|{edir}|{cid}|{prod}', weight=len(S), needs=needs(prod, S)))
    spec = os.path.join(ROOT, edir, '_stills_items.json'); json.dump(items, open(spec, 'w', encoding='utf8'), indent=0)
    ins = sorted({n for i in items for n in i['needs']}) + [f'{edir}/timeline.json', f'{edir}/keys.json', f'{edir}/gamma.json',
                                                               f'{prod}/build/fonts', 'tools/autoedit']
    ins = [p for p in ins if os.path.exists(os.path.join(ROOT, p))]
    cmd = ['bash', TASK, 'autoedit-stills', '--cmd', 'python tools/autoedit/gh_worker.py {item}', '--items', spec,
           '--pip', 'numpy==2.5.3 opencv-python-headless==4.10.0.84 pillow imageio-ffmpeg',   # pins = farm/requirements.txt (unpinned cv2 lacked CascadeClassifier) '--in', *ins, '--out', f'{edir}/qa']
    print(f'{len(items)} cases -> {len(items)} machines')
    if '--dry' in a: print(' '.join(cmd)); return 0
    return subprocess.call(cmd, cwd=ROOT)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
