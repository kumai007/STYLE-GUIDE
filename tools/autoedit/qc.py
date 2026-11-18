"""QC report for a finished render (run on a GitHub machine via task.sh, or locally on a short sample):
duration + frame count vs timeline.json, black runs (blackdetect), flash frames (big luma jumps), loudness + true peak.
python -X utf8 qc.py <video.mp4> <timeline.json> [--out report.json]   exit 1 if any check fails."""
import json, re, shutil, subprocess, sys


def ff():
    return shutil.which('ffmpeg') or __import__('imageio_ffmpeg').get_ffmpeg_exe()


def main(a):
    mp4, tl = a[0], json.load(open(a[1], encoding='utf8')); fps = tl['fps']; want = tl['frames']
    e = subprocess.run([ff(), '-hide_banner', '-nostats', '-i', mp4, '-vf',
                        'blackdetect=d=0.5:pix_th=0.06,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-',
                        '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True, errors='replace')
    y = [float(v) for v in re.findall(r'lavfi\.signalstats\.YAVG=([\d.]+)', e.stdout)]
    blacks = [(float(a), float(b)) for a, b in re.findall(r'black_start:([\d.]+) black_end:([\d.]+)', e.stderr)]
    dips = {round(ev['centre'] / fps, 1) for ev in tl['events'] if ev['type'] == 'dip'}
    blacks_bad = [b for b in blacks if not any(abs((b[0] + b[1]) / 2 - d) < 1.0 for d in dips) and b[1] < want / fps - 3]
    flash = [round(i / fps, 2) for i in range(1, len(y) - 1) if y[i] - y[i - 1] > 60 and y[i] - y[i + 1] > 60]
    s = e.stderr[e.stderr.rfind('Summary:'):]
    L = float(re.search(r'I:\s+(-?[\d.]+) LUFS', s).group(1)); tp = float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', s).group(1))
    R = dict(frames=len(y), want=want, duration_s=round(len(y) / fps, 3), black_runs=blacks_bad, flash_frames=flash[:50],
             LUFS=L, TP=tp)
    R['fail'] = [k for k, bad in (('frames', len(y) != want), ('black', bool(blacks_bad)), ('flash', bool(flash)),
                                  ('loudness', abs(L + 16) > 0.5), ('true_peak', tp > -1.0)) if bad]
    out = a[a.index('--out') + 1] if '--out' in a else mp4 + '.qc.json'
    json.dump(R, open(out, 'w', encoding='utf8'), indent=1)
    print('QC', 'PASS' if not R['fail'] else 'FAIL ' + ','.join(R['fail']), json.dumps({k: R[k] for k in ('frames', 'want', 'LUFS', 'TP')}))
    return 1 if R['fail'] else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
