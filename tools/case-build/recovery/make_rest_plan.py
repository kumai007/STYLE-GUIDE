# usage: make_rest_plan.py <tag prefix> : plan the frames still missing after run16 + fix1 as short sub-chunks (timeout 30 min/job at
# ~1.5 fps, HF plan cap 2 GiB). Writes rest_<n>.json run plans (<=240 chunks each) and manifest.json:
# {orig chunk id: [[tag, sub id], ...]} in time order, so splice can rebuild every chunks/<id>.ts byte for byte.
import json, os, subprocess, sys
P = os.path.dirname(os.path.abspath(__file__))
pre = sys.argv[1]
T1, T2 = 'coc2h-vol1-20261118-062036', 'coc2h-vol1-20261118-fix1'
HEAVY = {'coc_case03': 480, 'coc_case05': 480, 'coc_case19': 480, 'coc_case22': 480, 'coc_case26': 480}
DEF = 1080
ls = lambda t: set(subprocess.run(['rclone', 'lsf', f'gdrive:_cloud-jobs/_runs/{t}/chunks'], capture_output=True, text=True).stdout.split())
have1, have2 = ls(T1), ls(T2)
plan = json.load(open(os.path.join(P, 'plan.json'))); fmap = json.load(open(os.path.join(P, 'fix_map.json')))
fix = json.load(open(os.path.join(P, 'fix_plan.json')))['chunks']
hp = {}
def hpl(pt):
    if pt['dir'] not in hp: hp[pt['dir']] = json.load(open(os.path.join(P, pt['dir'], 'build', 'hf_plan.json')))
    return hp[pt['dir']]
need, man = [], {}
def add(oid, part, f0, f1):
    pt = plan['parts'][part]; h = hpl(pt); m = HEAVY.get(pt['name'], DEF)
    n = -(-(f1 - f0) // m); edges = [f0]
    for j in range(1, n):
        t = f0 + (f1 - f0) * j / n
        inner = [b for b in h['borders'] if edges[-1] < b < f1]
        edges.append(min(inner, key=lambda b: abs(b - t)) if inner else round(t))
    edges.append(f1)
    for a, b in zip(edges, edges[1:]):
        files = sorted({f for s in h['shots'] if s['f0'] < b and s['f1'] > a for f in s['files']})
        man[oid].append(['NEW', len(need)]); need.append(dict(part=part, f0=a, f1=b, files=files))
for c in plan['chunks']:
    oid = c['id']; man[oid] = []
    if f'{oid:04d}.ts' in have1: man[oid].append([T1, oid]); continue
    if str(oid) in fmap:
        for s in fmap[str(oid)]:
            if f'{s:04d}.ts' in have2: man[oid].append([T2, s])
            else: add(oid, fix[s]['part'], fix[s]['f0'], fix[s]['f1'])
        continue
    add(oid, c['part'], c['f0'], c['f1'])
K = 240; runs = [need[i:i + K] for i in range(0, len(need), K)]
for r, chunk_list in enumerate(runs):
    tag = f'{pre}{r + 1}'
    for j, c in enumerate(chunk_list): c['id'] = j
    fp = dict(plan); fp['tag'] = tag; fp['chunks'] = chunk_list
    json.dump(fp, open(os.path.join(P, f'rest_{r + 1}.json'), 'w'))
for oid, lst in man.items():
    for x in lst:
        if x[0] == 'NEW': g = x[1]; x[0] = f'{pre}{g // K + 1}'; x[1] = g % K
json.dump(man, open(os.path.join(P, 'manifest.json'), 'w'))
fr = sum(c['f1'] - c['f0'] for c in need)
print('have main', len(have1), 'have fix', len(have2), 'new sub-chunks', len(need), 'runs', len(runs), 'frames', fr, 'max', max(c['f1'] - c['f0'] for c in need))
