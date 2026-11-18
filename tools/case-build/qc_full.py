# usage: qc_full.py <master.mp4> <engine parts dir> <farm project dir> : full-video QC. (1) length vs parts, (2) first narration line of every part found where the parts say
# (FFT cross-correlation, 8 kHz), (3) black/freeze detect at 480p. Prints a short report; exit 1 on a sync error > 40 ms or bad length.
import json, os, re, subprocess, sys
import numpy as np
M, E, PRJ = sys.argv[1], sys.argv[2], sys.argv[3]
order = [p['name'] for p in json.load(open(os.path.join(PRJ, 'project.json')))['parts']]
def pcm(src, ss, t):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{max(ss, 0):.3f}', '-t', f'{t:.3f}', '-i', src, '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], capture_output=True)
    return np.frombuffer(r.stdout, np.float32)
off, rows, bad = 0.0, [], 0
for p in order:
    h = open(f'{E}/{p}/index.html', encoding='utf8').read()
    dur = float(re.search(r'data-duration="([0-9.]+)"', h).group(1))
    a = re.search(r'<audio[^>]*src="(assets/media/[^"]*vo_\d+\.wav)"[^>]*data-start="([0-9.]+)"', h)
    if a:
        vf, st = f'{E}/{p}/{a.group(1)}', float(a.group(2)); exp = off + st
        ms = re.search(r'data-media-start="([0-9.]+)"', a.group(0)); m0 = float(ms.group(1)) if ms else 0.0
        v = pcm(vf, m0 + 0.5, 4.0); w0 = max(0.0, exp + 0.5 - 1.5); m = pcm(M, w0, 7.0)
        if len(m) > len(v) > 0:
            n = len(m) + len(v); F = 1 << int(np.ceil(np.log2(n)))
            c = np.fft.irfft(np.fft.rfft(m, F) * np.conj(np.fft.rfft(v, F)), F)[:len(m) - len(v) + 1]
            got = w0 + int(np.argmax(c)) / 8000 - 0.5; d = (got - exp) * 1000
            rows.append((p, round(exp, 2), round(d, 1)));
            if abs(d) > 40: bad += 1
    off += dur
L = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', M], capture_output=True, text=True).stdout)
print(f'LENGTH master {L:.2f} s, parts {off:.2f} s, diff {L - off:+.2f} s')
for r in rows: print('SYNC', *r)
print('SYNC_BAD', bad, 'of', len(rows))
det = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', M, '-vf', 'fps=15,scale=480:-2,blackdetect=d=0.5:pix_th=0.06,freezedetect=n=0.002:d=3', '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
bl = re.findall(r'black_start:([0-9.]+) black_end:([0-9.]+)', det); fr = re.findall(r'freeze_start: ([0-9.]+)', det); fd = re.findall(r'freeze_duration: ([0-9.]+)', det)
print('BLACK', len(bl), [(round(float(a), 1), round(float(b) - float(a), 1)) for a, b in bl][:40])
print('FREEZE', len(fr), [(round(float(a), 1), round(float(d), 1)) for a, d in zip(fr, fd)][:40])
sys.exit(1 if bad or abs(L - off) > 1 else 0)
