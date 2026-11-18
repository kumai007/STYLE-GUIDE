"""ONE task.sh run (GitHub machines, in parallel): Whisper word times for every VO take + scene-cut scan + face boxes
for every source. Nothing heavy runs on the laptop.

python -X utf8 prep_github.py <production rel> <edit rel> [--model small.en] [--only words,cuts,faces] [--dry]
  rel = relative to the root folder (render farm video) (e.g. productions/gx-dashcam-s11  productions/gx-dashcam-s11/edit).
Results come back to: <prod>/vo/raw/<take>.words.json, <edit>/cuts/<SRC>.json, <edit>/faces/<SRC>.json."""
import glob, json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
TASK = os.path.join(ROOT, 'tools', 'case-farm', 'task.sh')


def main(a):
    prod, edir = a[0].rstrip('/'), a[1].rstrip('/')
    model = a[a.index('--model') + 1] if '--model' in a else 'small.en'
    only = set((a[a.index('--only') + 1] if '--only' in a else 'words,cuts,faces').split(','))
    P = os.path.join(ROOT, prod); items = []
    if 'words' in only:
        for w in sorted(glob.glob(os.path.join(P, 'vo', 'raw', '*.wav'))):
            rel = os.path.relpath(w, ROOT).replace('\\', '/')
            items.append(dict(item=f'words|{rel}|{model}', weight=os.path.getsize(w) // 96000 + 1, needs=[rel]))
    for kind in ('cuts', 'faces'):
        if kind not in only: continue
        for s in sorted(glob.glob(os.path.join(P, 'sources', '*.mp4'))):
            rel = os.path.relpath(s, ROOT).replace('\\', '/')
            items.append(dict(item=f'{kind}|{rel}|{edir}', weight=os.path.getsize(s) // 2_000_000 + 1, needs=[rel]))
    if not items: print('nothing to do'); return 1
    os.makedirs(os.path.join(ROOT, edir), exist_ok=True)
    spec = os.path.join(ROOT, edir, '_prep_items.json'); json.dump(items, open(spec, 'w', encoding='utf8'), indent=0)
    ins = sorted({n for i in items for n in i['needs']}) + ['tools/autoedit/gh_worker.py']
    cmd = ['bash', TASK, 'autoedit-prep', '--cmd', 'python tools/autoedit/gh_worker.py {item}', '--items', spec,
           # cv2 pins = the set proven on GitHub (case11 encode test); unpinned opencv lacked CascadeClassifier (2026-11-16)
           # whisper pins = tools/case-farm/tasks/whisper.py PIP (unpinned faster-whisper broke on av: metadata_errors)
           '--pip', ('faster-whisper==1.0.3 ctranslate2==4.8.1 av==12.3.0 tokenizers==0.23.1 onnxruntime==1.28.0 '
                     'huggingface_hub==1.26.1 requests==2.34.2 ' if 'words' in only else '')
                    + 'numpy==2.5.3 opencv-python-headless==4.10.0.84 imageio-ffmpeg',
           '--in', *ins,
           '--out', f'{prod}/vo/raw', f'{edir}/cuts', f'{edir}/faces']
    print(f'{len(items)} items on up to {min(250, len(items))} machines')
    if '--dry' in a: print(' '.join(cmd)); return 0
    return subprocess.call(cmd, cwd=ROOT)


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
