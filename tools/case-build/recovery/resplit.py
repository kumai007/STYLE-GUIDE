# usage: resplit.py <src tag> <ids comma> <new tag> <max frames> : re-plan failed pieces of a rest run as smaller pieces in a new run
# plan (rest_<new suffix>.json) and swap them in manifest.json (time order kept)
import json, os, sys
P = os.path.dirname(os.path.abspath(__file__))
st, ids, nt, mx = sys.argv[1], [int(x) for x in sys.argv[2].split(',')], sys.argv[3], int(sys.argv[4])
src = json.load(open(os.path.join(P, f"rest_{st.split('rest')[-1]}.json")))
man = json.load(open(os.path.join(P, 'manifest.json')))
out, rep = [], {}
for i in ids:
    c = src['chunks'][i]; pt = src['parts'][c['part']]
    h = json.load(open(os.path.join(P, pt['dir'], 'build', 'hf_plan.json')))
    n = -(-(c['f1'] - c['f0']) // mx); e = [c['f0']] + [round(c['f0'] + (c['f1'] - c['f0']) * j / n) for j in range(1, n)] + [c['f1']]
    rep[i] = []
    for a, b in zip(e, e[1:]):
        files = sorted({f for s in h['shots'] if s['f0'] < b and s['f1'] > a for f in s['files']})
        rep[i].append([nt, len(out)]); out.append(dict(id=len(out), part=c['part'], f0=a, f1=b, files=files))
fp = dict(src); fp['tag'] = nt; fp['chunks'] = out
json.dump(fp, open(os.path.join(P, f"rest_{nt.split('rest')[-1]}.json"), 'w'))
n = 0
for oid, lst in man.items():
    new = []
    for t, s in lst:
        if t == st and s in rep: new += rep[s]; n += 1
        else: new.append([t, s])
    man[oid] = new
json.dump(man, open(os.path.join(P, 'manifest.json'), 'w'))
print('pieces', len(out), 'replaced', n, [(x['f0'], x['f1']) for x in out])
