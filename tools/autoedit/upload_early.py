"""Upload source clips to Drive while they download, so the farm render does not wait for them (owner 2026-11-16).

python -X utf8 upload_early.py <production dir> <farm dir> [--part full] [--once] [--dry]
Watches <production>/sources/*.mp4. A file is sent when its size is the same on 2 checks (5 s apart) and no
download temp file (.part/.ytdl/.tmp) sits next to it. It goes to the exact place farm.sh syncs it to:
gdrive:_cloud-jobs/<safe_name(farm dir)>/<part>/sources/<name>.mp4. rclone copyto keeps size + mod time, and
stage_farm hardlinks keep the same mod time, so farm.sh's later `rclone sync` skips these files.
Stops when <production>/sources/.downloads_done exists and every clip is sent (or after one pass with --once).
Log: <production>/upload_early.log. Never deletes anything.
"""
import concurrent.futures as cf, os, shutil, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'case-farm', 'farm'))
from planner import safe_name  # same name rule as farm/prep.py

TEMP_EXT = ('.part', '.ytdl', '.tmp', '.crdownload')


def rclone():
    exe = shutil.which('rclone')
    if exe: return exe
    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Microsoft', 'WinGet', 'Packages')
    for root, _, files in os.walk(base):
        if 'rclone.exe' in files: return os.path.join(root, 'rclone.exe')
    sys.exit('upload_early: rclone not found')


def ready(src, names):
    """Names of finished downloads: .mp4, no temp sibling."""
    out = []
    for f in names:
        if not f.lower().endswith('.mp4'): continue
        if any(n.startswith(f) and n.lower().endswith(TEMP_EXT) for n in names): continue
        out.append(f)
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) < 2: sys.exit(__doc__)
    prod, farm = (os.path.abspath(a) for a in args[:2])
    part = sys.argv[sys.argv.index('--part') + 1] if '--part' in sys.argv else 'full'
    once, dry = '--once' in sys.argv, '--dry' in sys.argv
    src = os.path.join(prod, 'sources')
    remote = f'gdrive:_cloud-jobs/{safe_name(os.path.basename(farm))}/{part}/sources'
    exe = rclone(); log = open(os.path.join(prod, 'upload_early.log'), 'a', encoding='utf-8')

    def say(m):
        line = f'{time.strftime("%H:%M:%S")} {m}'; print(line, flush=True); log.write(line + '\n'); log.flush()

    def send(f):
        t = time.time(); cmd = [exe, 'copyto', os.path.join(src, f), f'{remote}/{f}', '-q']
        if dry: return f, 0, 0.0
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode: say(f'FAIL {f}: {(r.stderr or "").strip()[-300:]}')
        return f, r.returncode, time.time() - t

    say(f'start -> {remote}' + (' (dry)' if dry else ''))
    sizes, done, busy, fails = {}, set(), {}, {}
    pool = cf.ThreadPoolExecutor(4)
    while True:
        names = os.listdir(src) if os.path.isdir(src) else []
        for f in ready(src, names):
            if f in done or f in busy: continue
            s = os.path.getsize(os.path.join(src, f))
            if sizes.get(f) == s and s > 0: busy[f] = pool.submit(send, f)
            sizes[f] = s
        for f, fut in list(busy.items()):
            if fut.done():
                _, rc, dt = fut.result(); del busy[f]
                if rc == 0: done.add(f); say(f'sent {f} {sizes[f] / 1e6:.0f} MB {dt:.0f} s')
                else:
                    fails[f] = fails.get(f, 0) + 1; sizes.pop(f, None)
                    if fails[f] >= 3: done.add(f); say(f'GAVE UP {f} after 3 tries (farm.sh will send it)')
        finished = os.path.exists(os.path.join(src, '.downloads_done')) or once
        left = [f for f in ready(src, names) if f not in done]
        if finished and not busy and not left: break
        time.sleep(5)
    pool.shutdown()
    bad = sorted(f for f in done if fails.get(f, 0) >= 3)
    say(f'done: {len(done) - len(bad)} sent, {len(bad)} failed')
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main()
