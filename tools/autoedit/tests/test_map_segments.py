"""Regression (2026-11-16): joining parallel map segments with '-c copy' shifted frames by one for ~130 f while the
frame count stayed right. Each test frame carries its index as grey level; after split + join every frame must still
carry its own index.   python -X utf8 tools/autoedit/tests/test_map_segments.py"""
import os, subprocess, sys, tempfile
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets'))
import make_maps_pc as m

W, H, N, SEG = 320, 180, 60, 11


OLD = '--old' in sys.argv   # old way (x264 segments + '-c copy' join): must FAIL; proves the test sees the bug
SEG_ENC = (['-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', '30', '-an', '-threads', '1']
           if OLD else m.ENC_SEG)


def write(path, i0, i1):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '30',
                          '-i', '-', *SEG_ENC, path], stdin=subprocess.PIPE)
    for i in range(i0, i1):           # moving detail (so x264 uses B-frames) + a 64 px block whose grey level = index
        fr = (np.random.default_rng(i).random((H, W, 3)) * 255).astype(np.uint8); fr[:64, :64] = i * 4
        p.stdin.write(fr.tobytes())
    p.stdin.close(); assert p.wait() == 0


def main():
    d = tempfile.mkdtemp(prefix='mapseg_'); segs = []
    for k, a in enumerate(range(0, N, SEG)):
        s = os.path.join(d, f'c.seg{k:03d}.' + ('mp4' if OLD else 'mkv')); write(s, a, min(N, a + SEG)); segs.append(s)
    out = os.path.join(d, 'c.part.mp4'); m.join_segments(segs, out, N, copy=OLD)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', out, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
    got = [int(round(f[8:56, 8:56].mean() / 4)) for f in fr]
    os.remove(out); os.rmdir(d)
    bad = [(i, g) for i, g in enumerate(got) if g != i]
    assert len(got) == N and not bad, f'frames shifted: {bad[:5]} (n={len(got)})'
    print(f'PASS {N} frames, {len(segs)} segments, every frame in place')


if __name__ == '__main__':
    main()
