"""Join a run of VO blocks into a listening preview: 0.9 s where footage goes, 1.8 s at a level/section change, -16 LUFS.
usage: vo_preview.py <blocks.json> <blocks dir> <out.mp3> <JOB> [JOB ...]"""
import sys, json, subprocess
bj, bdir, out, jobs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
order = [i for j in json.load(open(bj)) if j['job'] in jobs for i in j['items']]
args, n = [], 0
for k, i in enumerate(order):
    if k:
        gap = 1.8 if order[k - 1]['sec'] != i['sec'] else 0.9
        args += ['-f', 'lavfi', '-t', str(gap), '-i', 'anullsrc=r=48000:cl=mono']; n += 1
    args += ['-i', f"{bdir}/{i['sec']}_{i['n']:02d}.wav"]; n += 1
fl = ''.join(f'[{x}:a]' for x in range(n)) + f'concat=n={n}:v=0:a=1,loudnorm=I=-16:TP=-1.5:LRA=7[o]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *args, '-filter_complex', fl, '-map', '[o]', '-ar', '48000', '-b:a', '192k', out], check=True)
