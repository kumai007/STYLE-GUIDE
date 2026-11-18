"""Fix one narration line and re-record only that line (same Algrow voice), then copy it into the engine.

usage: python vo_fixline.py <production dir> <vo_id> "<exact old text>" "<new text>" [--engine-vo DIR] [--no-record]
Backs up vo_lines.csv (.pre<id>) and the old audio (narration/raw/_old<id>/). Builders write fact errors as
"VO_FIX: vo_NNN | old | new" in their notes; the main session runs this. coc2h-vol1 needed 7 such fixes after recording
(2026-11-17/18): check facts against the real pages BEFORE recording (docs/workflow/FAST_LONG_VIDEO.md)."""
import argparse, csv, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
VOICE = ['--provider', 'stealth', '--model', '2.0', '--temperature', '2.0', '--speaking-rate', '1.0',
         '--voice', 'default-pd4i7bs8z6-qjsqmqbjlxg__new-9fcmr']


def fix_text(rows, vid, old, new):
    """Replace old by new in row vid (exact text, once). Returns the new text; raises if not found."""
    r = [x for x in rows if x['id'] == vid]
    if not r: raise KeyError(vid)
    if r[0]['text'].count(old) != 1: raise ValueError(f'{vid}: old text found {r[0]["text"].count(old)} times (want 1)')
    r[0]['text'] = r[0]['text'].replace(old, new)
    return r[0]['text']


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('prod'); ap.add_argument('vid'); ap.add_argument('old'); ap.add_argument('new')
    ap.add_argument('--engine-vo'); ap.add_argument('--no-record', action='store_true'); a = ap.parse_args()
    csvp = os.path.join(a.prod, 'vo_lines.csv')
    rows = list(csv.DictReader(open(csvp, encoding='utf-8')))
    text = fix_text(rows, a.vid, a.old, a.new)
    shutil.copy2(csvp, csvp + '.pre' + a.vid)
    w = csv.DictWriter(open(csvp, 'w', newline='', encoding='utf-8'), fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    one = os.path.join(a.prod, a.vid + '.csv')
    w = csv.writer(open(one, 'w', newline='', encoding='utf-8')); w.writerow(['id', 'text']); w.writerow([a.vid, text])
    raw = os.path.join(a.prod, 'narration', 'raw'); bk = os.path.join(raw, '_old' + a.vid); os.makedirs(bk, exist_ok=True)
    for e in ('.wav', '.json', '.srt', '.words.json', '.mp3'):
        f = os.path.join(raw, a.vid + e)
        if os.path.exists(f): shutil.move(f, os.path.join(bk, a.vid + e))
    if a.no_record: print('text fixed, old audio moved; record', one); return
    tool = os.path.join(HERE, '..', 'algrow-voice', 'algrow_voice.py')
    subprocess.run([sys.executable, tool, *VOICE, 'batch', one, '-o', raw, '--workers', '1'], check=True, cwd=os.path.dirname(tool))
    if a.engine_vo: shutil.copy2(os.path.join(raw, a.vid + '.wav'), os.path.join(a.engine_vo, a.vid + '.wav'))
    print('re-recorded', a.vid)


if __name__ == '__main__':
    main()
