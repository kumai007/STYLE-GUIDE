"""Cut one TTS job (mp3 + word srt) into its VO blocks at the pauses between them.
usage: vo_split.py <blocks.json> <job id> <job.mp3> <job.srt> <out dir>
Block boundary = word position from the text, snapped to the middle of the nearest real pause."""
import re, sys, json, subprocess
bj, job, mp3, srt, out = sys.argv[1:6]
items = next(j for j in json.load(open(bj)) if j['job'] == job)['items']
an = lambda s: re.sub(r'[^0-9a-z]', '', s.lower())
T = lambda h, m, s, ms: int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000
W = [(T(*a[:4]), T(*a[4:8]), an(a[8])) for a in re.findall(r'(\d+):(\d+):(\d+),(\d+) --> (\d+):(\d+):(\d+),(\d+)\s*\n(.+)', open(srt, encoding='utf-8').read())]
dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]))
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', mp3, '-af', 'silencedetect=n=-38dB:d=0.18', '-f', 'null', '-'], capture_output=True, text=True).stderr
ss = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', log)]; se = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', log)]
gaps = list(zip(ss, se))
# block boundary: map its char position in the text onto the srt words (difflib on alnum chars), then snap to a pause within 0.4 s
import difflib
txt = ''.join(an(i['text']) for i in items); st = ''; owner = []
for k, w in enumerate(W): st += w[2]; owner += [k] * len(w[2])
sm = difflib.SequenceMatcher(None, txt, st, autojunk=False); mp = {}
for bl in sm.get_matching_blocks():
    for d in range(bl.size): mp[bl.a + d] = bl.b + d
cuts, acc = [0.0], 0
for it in items[:-1]:
    acc += len(an(it['text'])); p = acc - 1
    while p > 0 and p not in mp: p -= 1
    k = owner[mp[p]] if p in mp else 0
    t = (W[k][1] + (W[k + 1][0] if k + 1 < len(W) else W[k][1])) / 2
    near = [g for g in gaps if g[1] >= W[k][1] - 0.05 and g[0] <= (W[k + 1][0] if k + 1 < len(W) else dur) + 0.05]
    cuts.append((near[0][0] + near[0][1]) / 2 if near else t)
cuts.append(dur); res = []
for i, it in enumerate(items):
    name = f"{out}/{it['sec']}_{it['n']:02d}.wav"
    a, b = cuts[i], cuts[i + 1]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', mp3, '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,afade=t=in:d=0.03,areverse,afade=t=in:d=0.02', '-ar', '48000', '-ac', '1', name], check=True)
    res.append((name.split('/')[-1], round(b - a, 2), it['text'][:50]))
for r in res: print(*r, sep='  |  ')
