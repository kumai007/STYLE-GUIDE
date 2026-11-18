"""Runs ON a GitHub machine (task.sh item). One item = one job:
  words|<prod>/vo/raw/<take>.wav|<model>   -> <prod>/vo/raw/<take>.words.json (faster-whisper, word times, + duration)
  cuts|<prod>/sources/<SRC>.mp4|<edit>     -> <edit>/cuts/<SRC>.json   {"src", "cuts": [s, ...]} (ffmpeg scene > 0.3)
  faces|<prod>/sources/<SRC>.mp4|<edit>    -> <edit>/faces/<SRC>.json  {"src", "step", "boxes": [[t,x0,y0,x1,y1]]}
  stills|<edit>|<cNN>|<prod>                    -> <edit>/qa/<cNN>_contact.jpg + <edit>/qa/<cNN>/<ref>.jpg (one per beat)
Paths are relative to the run root (env FARM_ROOT, else cwd). Sources are untrusted media: decoded only."""
import json, os, re, shutil, subprocess, sys, wave

ROOT = os.environ.get('FARM_ROOT') or os.getcwd()
HERE = os.path.dirname(os.path.abspath(__file__))


def ffmpeg():
    f = shutil.which('ffmpeg')
    if f: return f
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()


def J(p, d):
    os.makedirs(os.path.dirname(p), exist_ok=True); json.dump(d, open(p, 'w', encoding='utf8'), indent=0)


def words(wav, model='small.en'):
    from faster_whisper import WhisperModel
    m = WhisperModel(model or 'small.en', device='cpu', compute_type='int8')
    segs, info = m.transcribe(os.path.join(ROOT, wav), language='en', beam_size=5, word_timestamps=True, vad_filter=False)
    out = []
    for s in segs:
        out.append(dict(start=s.start, end=s.end, text=s.text,
                        words=[dict(w=w.word, start=round(w.start, 3), end=round(w.end, 3), p=round(w.probability, 3)) for w in s.words]))
    with wave.open(os.path.join(ROOT, wav)) as f: dur = f.getnframes() / f.getframerate()
    J(os.path.join(ROOT, wav[:-4] + '.words.json'), dict(device='cpu', model=model, duration=dur, segments=out))


def cuts(src, edir, thr=0.3):
    p = subprocess.run([ffmpeg(), '-hide_banner', '-nostats', '-i', os.path.join(ROOT, src), '-an', '-vf',
                        f"select='gt(scene,{thr})',showinfo", '-f', 'null', '-'], capture_output=True, text=True, errors='replace')
    ts = [round(float(x), 3) for x in re.findall(r'pts_time:([\d.]+)', p.stderr)]
    tag = os.path.splitext(os.path.basename(src))[0]
    J(os.path.join(ROOT, edir, 'cuts', tag + '.json'), dict(src=tag, threshold=thr, cuts=ts))


def faces(src, edir, step=0.5):
    import cv2
    cap = cv2.VideoCapture(os.path.join(ROOT, src)); fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    d = cv2.data.haarcascades
    C = [cv2.CascadeClassifier(d + 'haarcascade_frontalface_default.xml'), cv2.CascadeClassifier(d + 'haarcascade_profileface.xml')]
    out, k, every = [], 0, max(1, int(round(fps * step)))
    while True:
        ok = cap.grab()
        if not ok: break
        if k % every == 0:
            _, fr = cap.retrieve(); h, w = fr.shape[:2]; sc = 960 / w
            g = cv2.cvtColor(cv2.resize(fr, (960, int(h * sc))), cv2.COLOR_BGR2GRAY)
            for c in C:
                for x, y, bw, bh in c.detectMultiScale(g, 1.1, 4, minSize=(14, 14)):
                    out.append([round(k / fps, 2)] + [round(v / sc) for v in (x, y, x + bw, y + bh)])
        k += 1
    tag = os.path.splitext(os.path.basename(src))[0]
    J(os.path.join(ROOT, edir, 'faces', tag + '.json'), dict(src=tag, step=step, boxes=out))


def stills(edir, cid, prod):
    E = os.path.join(ROOT, edir); os.environ['AUTOEDIT_MEDIA'] = os.path.join(ROOT, prod)
    os.environ.setdefault('AUTOEDIT_TL', os.path.join(E, 'timeline.json'))
    sys.path.insert(0, os.path.join(HERE, 'engine'))
    import build as B
    from PIL import Image, ImageDraw
    S = [s for s in B.shots() if (s.get('ref') or '').startswith(cid + ':')]
    tw, th, cols = 480, 270, 6; rows = -(-len(S) // cols)
    sheet = Image.new('RGB', (cols * tw, rows * (th + 22)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
    os.makedirs(os.path.join(E, 'qa', cid), exist_ok=True)
    for n, s in enumerate(S):
        i = min(s['nf'] - 1, s.get('pre', 0) + (s['nf'] - s.get('pre', 0)) // 2)
        im = Image.fromarray(next(B.render_range(s, i, i + 1)))
        im.save(os.path.join(E, 'qa', cid, s['ref'].replace(':', '_') + '.jpg'), quality=88)
        x, y = (n % cols) * tw, (n // cols) * (th + 22)
        sheet.paste(im.resize((tw, th)), (x, y + 22)); t = (s['f0'] + i) / 30
        d.text((x + 4, y + 4), f"{s['ref']} {int(t // 60)}:{t % 60:05.2f} {s['kind']} {s.get('src') or ''} {s['nf'] / 30:.1f}s", fill=(240, 240, 240))
    sheet.save(os.path.join(E, 'qa', f'{cid}_contact.jpg'), quality=85)


if __name__ == '__main__':
    f = sys.argv[1].split('|')
    {'words': lambda: words(f[1], f[2] if len(f) > 2 else 'small.en'), 'cuts': lambda: cuts(f[1], f[2]),
     'faces': lambda: faces(f[1], f[2]), 'stills': lambda: stills(f[1], f[2], f[3])}[f[0]]()
