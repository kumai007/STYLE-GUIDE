"""Split a cut sheet into VO blocks (narration between RAW cues) and group them into TTS jobs.
usage: vo_blocks.py <cut sheet.md> <out.json>
Each job = one section (intro / case / outro); a short LEVEL section joins the case after it (TTS needs >= 200 chars)."""
import re, sys, json
secs, cur = [], None
for ln in open(sys.argv[1], encoding='utf-8'):
    ln = ln.rstrip('\n')
    m = re.match(r'##\s+(.+)', ln)
    if m:
        t = m.group(1); k = re.match(r'(INTRO|OUTRO|LEVEL \d+|CASE \d+)', t)
        cur = {'id': (k.group(1) if k else t).replace(' ', ''), 'title': t, 'blocks': []}; secs.append(cur); continue
    s = ln.strip()
    if not cur or not s or s.startswith(('▶', '[', '#', '---', '**', '>')): continue
    cur['blocks'].append(s)
jobs, carry = [], []
for sc in secs:
    if not sc['blocks']: continue
    items = [{'sec': sc['id'], 'n': i + 1, 'text': b} for i, b in enumerate(sc['blocks'])]
    if sc['id'].startswith('LEVEL') or sum(len(b) for b in sc['blocks']) < 200:
        carry += items; continue
    jobs.append({'job': sc['id'], 'items': carry + items}); carry = []
if carry: jobs[-1]['items'] += carry
json.dump(jobs, open(sys.argv[2], 'w'), indent=1, ensure_ascii=False)
w = sum(len(i['text'].split()) for j in jobs for i in j['items'])
print(len(jobs), 'jobs', sum(len(j['items']) for j in jobs), 'blocks', w, 'words')
