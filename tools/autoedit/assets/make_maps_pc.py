"""Render every map shot of a compiled edit on the PC (owner rule 2026-11-16: maps are the one PC render; the farm only
pastes the finished clips, because the map style will keep changing).

python -X utf8 tools/autoedit/assets/make_maps_pc.py <edit dir> [--force] [--check]
  1. recompiles <edit>/timeline.json (compile.py)
  2. per map shot: the engine's own tile renderer (build._map_tiles = kit.map_eox, same frames as a farm tile render)
     -> <prod>/assets/maps/clips/<map>__<nf>f.mp4 (1920x1080, 30 fps, libx264 CRF 14, yuv420p, no audio)
     + sidecar .json {nf, frames, style, params}. Fresh clips (same nf, params, style hash) are skipped.
     Frames = nf + the next ff shot's xfade (the crossfade reads past nf). Fades/dips are NOT baked: the engine applies
     them on top of the clip exactly as on a tile render.
  Frames render in 24-frame segments on (cores - 2) processes, as lossless utvideo .mkv, then
  one x264 encode joins them; frame count is checked. 2026-11-16: serial was ~1.06 s/frame (481 s for 452 f).   --workers N  override the process count.
  --force  remake all clips.   --check  compare 3 build.still frames per map shot: clip vs tiles (PSNR, exit 1 if < 38 dB).
Change the map style = edit kit.map_eox (or its helpers), run this, re-stage, re-render."""
import json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__)); AE = os.path.dirname(HERE); ENG = os.path.join(AE, 'engine')
ENC = ['-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', '-an']
# Segments: lossless intra-only (utvideo, every frame a keyframe), re-encoded ONCE with ENC when joined. Joining x264
# segments with '-c copy' dropped/duplicated frames at the joins (2026-11-16: clip 1 frame off for ~130 f, count still
# right). Intra-only lossless segments cannot shift frames.
ENC_SEG = ['-c:v', 'utvideo', '-pix_fmt', 'gbrp', '-r', '30', '-an', '-threads', '1']


def media_root(edir):
    V = json.load(open(os.path.join(edir, 'video.json'), encoding='utf8'))
    m = V.get('media_root') or os.path.dirname(edir)
    return m if os.path.isabs(m) else os.path.normpath(os.path.join(edir, m))


def setup(edir):
    prod = media_root(edir)
    os.environ['AUTOEDIT_TL'] = os.path.join(edir, 'timeline.json')
    os.environ['AUTOEDIT_MEDIA'] = prod
    sys.path.insert(0, ENG)
    import build, kit, mapclip  # noqa: E402  (env must be set before import)
    return prod, build, kit, mapclip


SEG = 24          # frames per worker job; every map frame is independent (kit.map_eox(i, ...)), so segments run in parallel
_W = {}


def _init(edir):  # worker process: same env + engine import as the parent
    _W['prod'], _W['build'], _W['kit'], _ = setup(edir)
    _W['S'] = _W['build'].shots()


def _job(args):
    idx, a, b, seg = args
    s = _W['S'][idx]
    got = _W['kit'].write_frames(seg, _W['build']._map_tiles(s, a, b), enc=ENC_SEG)
    if got != b - a: raise RuntimeError(f'{seg}: wrote {got} of {b - a} frames')
    return seg


def _nframes(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                        'stream=nb_read_packets', '-of', 'csv=p=0', path], capture_output=True, text=True)
    return int(r.stdout.strip() or 0)


def join_segments(segs, tmp, frames, enc=ENC, copy=False):
    """Join segments (in order) into one clip with a single encode, check the frame count, then delete the segments
    and the list (only this run's own temp files). copy=True = the old '-c copy' join (kept only for the test)."""
    lst = tmp + '.segs.txt'
    with open(lst, 'w', encoding='utf-8') as f:
        for seg in segs: f.write("file '" + os.path.abspath(seg).replace('\\', '/') + "'\n")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst,
                    *(['-c', 'copy'] if copy else enc), tmp], check=True)
    got = _nframes(tmp)
    if got != frames: raise RuntimeError(f'{tmp}: joined {got} of {frames} frames')
    for p in list(segs) + [lst]: os.remove(p)


def make(edir, force=False, workers=None):
    import concurrent.futures as cf
    subprocess.run([sys.executable, '-X', 'utf8', os.path.join(AE, 'compile.py'), edir], check=True)
    prod, build, kit, mapclip = setup(edir)
    S = build.shots(); style = mapclip.style_hash(); n = 0; t_all = time.time(); todo = []
    for idx, s in enumerate(S):
        if s['kind'] != 'map': continue
        n += 1; why = mapclip.stale(prod, S, s, style)
        if why is None and not force:
            print(f"skip {mapclip.clip_rel(s)} (fresh)"); continue
        todo.append((idx, s, s['nf'] + mapclip.tail(S, s), why or 'forced'))
    workers = workers or max(1, (os.cpu_count() or 4) - 2)
    seg_n = max(6, min(SEG, -(-sum(t[2] for t in todo) // (workers * 3)))) if todo else SEG
    jobs, segs = [], {}
    for idx, s, frames, _ in todo:
        out = mapclip.clip_path(prod, s); os.makedirs(os.path.dirname(out), exist_ok=True)
        segs[idx] = []
        for k, a in enumerate(range(0, frames, seg_n)):
            seg = f'{out[:-4]}.seg{k:03d}.mkv'; segs[idx].append(seg); jobs.append((idx, a, min(frames, a + seg_n), seg))
    workers = workers or max(1, (os.cpu_count() or 4) - 2)
    for v in ('OMP_NUM_THREADS', 'OPENBLAS_NUM_THREADS', 'MKL_NUM_THREADS', 'NUMEXPR_NUM_THREADS'):
        os.environ.setdefault(v, '1')        # one math thread per process: N processes x N threads thrash the CPU
    if jobs:
        print(f'{len(todo)} clips, {len(jobs)} segments of <= {seg_n} f on {workers} processes')
        with cf.ProcessPoolExecutor(workers, initializer=_init, initargs=(edir,)) as ex:
            for _ in ex.map(_job, jobs): pass
    for idx, s, frames, why in todo:
        out = mapclip.clip_path(prod, s); tmp = out[:-4] + '.part.mp4'
        join_segments(segs[idx], tmp, frames)
        os.replace(tmp, out)
        json.dump(dict(nf=s['nf'], frames=frames, style=style, params=mapclip.params(s, frames)),
                  open(out + '.json', 'w', encoding='utf-8'), indent=1)
        print(f"made {mapclip.clip_rel(s)}: {frames} f  [{why}]")
    print(f'{n} map shots, {len(todo)} made, total {time.time() - t_all:.1f} s')


def check(edir):
    import numpy as np
    prod, build, kit, mapclip = setup(edir)
    worst = 99.0
    for s in build.shots():
        if s['kind'] != 'map': continue
        for i in (0, s['nf'] // 2, s['nf'] - 1):
            t = (s['f0'] + i) / kit.FPS
            os.environ['AUTOEDIT_MAP_TILES'] = '1'; a = build.still(t).astype(np.float32)
            os.environ.pop('AUTOEDIT_MAP_TILES'); b = build.still(t).astype(np.float32)
            mse = float(((a - b) ** 2).mean()); psnr = 99.0 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
            worst = min(worst, psnr)
            print(f"{s['name']} f{i} t={t:.3f}s: PSNR {psnr:.1f} dB, max abs diff {np.abs(a - b).max():.0f}")
    print('MATCH' if worst >= 38 else 'MISMATCH', f'(worst {worst:.1f} dB)')
    return worst >= 38


if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    ed = os.path.abspath(a[0])
    if '--check' in sys.argv: sys.exit(0 if check(ed) else 1)
    w = int(sys.argv[sys.argv.index('--workers') + 1]) if '--workers' in sys.argv else None
    make(ed, force='--force' in sys.argv, workers=w)
