# usage: splice_all.py manifest.json pieces_dir chunks_dir plan.json : build chunks/<id>.ts from manifest pieces (pieces/<tag>/<sub>.ts)
# in time order (byte join of MPEG-TS on one clock); list every missing piece and exit 1 if any
import json, os, sys
man, pdir, cdir, plan = json.load(open(sys.argv[1])), sys.argv[2], sys.argv[3], json.load(open(sys.argv[4]))
os.makedirs(cdir, exist_ok=True)
miss = []
for oid, lst in man.items():
    src = [os.path.join(pdir, t, f'{s:04d}.ts') for t, s in lst]
    m = [x for x in src if not os.path.exists(x) or os.path.getsize(x) == 0]
    if m: miss += m; continue
    with open(os.path.join(cdir, f'{int(oid):04d}.ts'), 'wb') as o:
        for s in src:
            with open(s, 'rb') as i: o.write(i.read())
if miss: print('MISSING', len(miss)); [print(x) for x in miss[:40]]; sys.exit(1)
n = len([c for c in plan['chunks'] if os.path.getsize(os.path.join(cdir, f"{c['id']:04d}.ts")) > 0])
print('SPLICE_OK', n, 'of', len(plan['chunks']))
