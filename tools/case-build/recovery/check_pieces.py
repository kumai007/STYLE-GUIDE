# usage: check_pieces.py : count video frames of every manifest piece (ffprobe) vs its plan; re-download bad ones from Drive; print summary
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
P = os.path.dirname(os.path.abspath(__file__))
L = 'C:/Users/ayush/Videos/CLAUDE/case-work/renders/coc2h-vol1_full_30p_preview/pieces'
T1, T2 = 'coc2h-vol1-20261118-062036', 'coc2h-vol1-20261118-fix1'
plans = {T1: json.load(open(P + '/plan.json')), T2: json.load(open(P + '/fix_plan.json'))}
for n in range(1, 6): plans[f'coc2h-vol1-20261118-rest{n}'] = json.load(open(P + f'/rest_{n}.json'))
man = json.load(open(P + '/manifest.json'))
items = [(t, s) for lst in man.values() for t, s in lst]
def frames(f):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries', 'stream=nb_read_packets',
                        '-of', 'csv=p=0', f], capture_output=True, text=True)
    try: return int(r.stdout.split()[0]), r.stderr.count('\n')
    except Exception: return -1, 99
def chk(ts):
    t, s = ts; c = plans[t]['chunks'][s]; want = c['f1'] - c['f0']; f = f'{L}/{t}/{s:04d}.ts'
    got, err = frames(f)
    return (t, s, want, got, err)
bad = []
with ThreadPoolExecutor(12) as ex:
    for t, s, want, got, err in ex.map(chk, items):
        if got != want or err: bad.append((t, s, want, got, err))
print('pieces', len(items), 'bad', len(bad))
for b in bad: print('BAD', *b)
if '--fix' in sys.argv:
    for t, s, *_ in bad:
        f = f'{L}/{t}/{s:04d}.ts'
        if os.path.exists(f): os.remove(f)
        subprocess.run(['rclone', 'copyto', f'gdrive:_cloud-jobs/_runs/{t}/chunks/{s:04d}.ts', f], check=True)
    print('redownloaded', len(bad))
