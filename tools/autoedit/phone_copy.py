"""Phone copy <= 29 MiB of a render (two-pass x264, size-targeted). Runs on a GitHub machine via task.sh:
bash tools/case-farm/task.sh phone --cmd "python tools/autoedit/phone_copy.py {item}" --items <mp4 rel> --in <mp4 rel> tools/autoedit/phone_copy.py --out <dir rel>
Writes <same folder>/<name>_phone.mp4."""
import os, subprocess, sys
src = sys.argv[1]; root = os.environ.get('FARM_ROOT', '.')
p = src if os.path.isabs(src) else os.path.join(root, src)
out = p[:-4] + '_phone.mp4'
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], capture_output=True, text=True).stdout)
total_kbps = 29 * 1024 * 1024 * 8 / 1000 / dur * 0.96
v = max(150, int(total_kbps - 64))
base = ['ffmpeg', '-y', '-v', 'error', '-i', p, '-vf', 'scale=854:-2', '-c:v', 'libx264', '-preset', 'slow', '-b:v', f'{v}k', '-pix_fmt', 'yuv420p']
log = os.path.join(os.path.dirname(out), 'phone2pass')
subprocess.run(base + ['-pass', '1', '-passlogfile', log, '-an', '-f', 'mp4', os.devnull], check=True)
subprocess.run(base + ['-pass', '2', '-passlogfile', log, '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', out], check=True)
for f in os.listdir(os.path.dirname(out)):
    if f.startswith('phone2pass'): os.remove(os.path.join(os.path.dirname(out), f))
print('phone', out, round(os.path.getsize(out) / 1048576, 1), 'MiB', v, 'kbps video')
