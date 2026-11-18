"""Make farm part folders for every built HyperFrames part and write project.json in video order.

usage: python farm_parts.py <farm project dir> <engine parts dir> <ref part dir name> <part,part,...>
Each part gets build/farm_entry.py + farm_contract.py (copied from the ref part, never overwritten) and build/hf_farm.json
{"src": <engine part>, "border_s": 0.25, "window_media": true} (window_media on by default: long sources hit PLAN_TOO_LARGE).
Missing parts (no index.html) are listed and left out."""
import json, os, shutil, sys


def setup(prj, eng, ref, order):
    rb = os.path.join(prj, ref, 'build'); parts, missing = [], []
    for p in order:
        if not os.path.exists(os.path.join(eng, p, 'index.html')): missing.append(p); continue
        b = os.path.join(prj, p, 'build'); os.makedirs(b, exist_ok=True)
        for f in ('farm_entry.py', 'farm_contract.py'):
            if not os.path.exists(os.path.join(b, f)): shutil.copy2(os.path.join(rb, f), os.path.join(b, f))
        hf = os.path.join(b, 'hf_farm.json')
        if not os.path.exists(hf): json.dump({'src': os.path.join(eng, p).replace(os.sep, '/'), 'border_s': 0.25, 'window_media': True}, open(hf, 'w'))
        parts.append({'name': p, 'dir': p})
    json.dump({'parts': parts}, open(os.path.join(prj, 'project.json'), 'w'))
    return parts, missing


if __name__ == '__main__':
    parts, missing = setup(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(','))
    print('parts', len(parts), 'missing', missing); print(','.join(x['name'] for x in parts))
