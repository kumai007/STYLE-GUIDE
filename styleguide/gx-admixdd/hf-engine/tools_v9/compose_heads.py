"""v9 (owner 2026-11-17 "use real articles"): join each page's real headline capture (pages/head/<id>.png) above a trimmed
copy of its body capture (pages/<id>.png) -> pages/art/<id>.png + .json {dy, T, hh, hx0, hx1}. Same page x coords (both 2200 px
= 1100 CSS at 2x). Body rows above T (= highest key/line top used - 140) are cut; a light dashed rule marks the jump.
Body y -> art y: y + dy. Originals are never changed. usage: python compose_heads.py <case .mjs> <pages dir>"""
import json, os, re, sys
from PIL import Image, ImageDraw
case, P = sys.argv[1], sys.argv[2]
src = open(case, encoding='utf8').read()
LINES = json.loads(re.search(r'const LINES = (\{.*?\});\n', src).group(1))
pgo = {}
for m in re.finditer(r"src: '(P\w+)', pgo: \{ key: \[\d+, (\d+)", src): pgo.setdefault(m.group(1), []).append(int(m.group(2)))
os.makedirs(os.path.join(P, 'art'), exist_ok=True)
DIV = 44
for f in sorted(os.listdir(os.path.join(P, 'head'))):
    if not f.endswith('.png'): continue
    i = f[:-4]; bj = os.path.join(P, i + '.json')
    if not os.path.exists(bj): continue
    J = json.load(open(bj, encoding='utf8')); kb = J.get('key_bbox')
    tops = [kb[1]] if kb else []
    tops += [l[1] for l in LINES.get(i, [])] + pgo.get(i, [])
    if not tops: print(i, 'no key'); continue
    T = max(0, min(tops) - 140)
    body = Image.open(os.path.join(P, i + '.png')).convert('RGB'); head = Image.open(os.path.join(P, 'head', f)).convert('RGB')
    hj = json.load(open(os.path.join(P, 'head', i + '.json'), encoding='utf8'))
    hx = int(round(hj['clip_css'][0] * 2))
    # wide headline (> 1440 px) -> scale down so the card can show all of it next to the key lines
    if head.width > 1440: head = head.resize((1440, round(head.height * 1440 / head.width)), Image.LANCZOS)
    # cut on an empty row (no half text line): search up to 90 px up, then down, for a row with almost no ink
    g = body.convert('L')
    def blank(y):
        r = g.crop((0, y, W, y + 1)).getextrema(); return r[1] - r[0] < 28
    W = body.width
    for d0 in list(range(0, 91, 2)) + list(range(2, 61, 2)):
        y = T - d0 if d0 <= 90 and (T - d0) >= 0 and blank(T - d0) else None
        if y is not None: T = y; break
    hh = head.height
    dy = hh + DIV - T
    # page background colour = median of the body's top-left corner strip
    bg = body.crop((0, T, 40, T + 40)).resize((1, 1)).getpixel((0, 0))
    out = Image.new('RGB', (W, hh + DIV + body.height - T), bg)
    out.paste(head, (max(0, min(hx, W - head.width)), 0))
    out.paste(body.crop((0, T, W, body.height)), (0, hh + DIV))
    d = ImageDraw.Draw(out); y = hh + DIV // 2
    for x in range(hx, min(W, hx + head.width), 22): d.line([(x, y), (x + 10, y)], fill=(178, 178, 178), width=2)
    out.save(os.path.join(P, 'art', i + '.png'))
    json.dump({'dy': dy, 'T': T, 'hh': hh, 'hx0': hx, 'hx1': hx + head.width, 'size': list(out.size)}, open(os.path.join(P, 'art', i + '.json'), 'w'))
    print(i, 'T', T, 'hh', hh, 'dy', dy, out.size)
