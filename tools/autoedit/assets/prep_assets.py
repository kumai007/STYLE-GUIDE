"""ONE task.sh run: every page + map in <edit>/assets.json on its own GitHub machine (all parallel), results back to
<prod>/assets/pages/ and <prod>/assets/maps/, then keys.json `pages` entries + check sheet <edit>/qa/ASSETS_CHECK.jpg.

python -X utf8 tools/autoedit/assets/prep_assets.py <prod rel> <edit rel> [--only c01,c03] [--dry] [--post]
  --post = skip the GitHub run; only write keys.json + the check sheet from what is on disk.
Run log (start/end clock, seconds, exit code) -> <edit>/qa/assets_run.json."""
import datetime, glob, json, math, os, re, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
TASK = os.path.join(ROOT, 'tools', 'case-farm', 'task.sh')
# Pins: cv2 set = proven on GitHub (prep_github.py); playwright drives the runner's Google Chrome (falls back to its own
# chromium, installed into ~/farm-venv/pw-browsers = inside the cached venv).
PIP = 'numpy==2.5.3 opencv-python-headless==4.10.0.84 pillow==11.3.0 playwright==1.49.1'
ID = re.compile(r'^[a-z0-9][a-z0-9_-]{0,40}$')


def load(edir):
    A = json.load(open(os.path.join(ROOT, edir, 'assets.json'), encoding='utf8'))
    return A.get('cases', A)


def check(C):
    err = []
    for cid, c in C.items():
        if not re.match(r'^c\d\d$|^[a-z0-9_-]+$', cid): err.append(f'bad case id {cid}')
        for kind in ('pages', 'maps'):
            ids = [x.get('id', '') for x in c.get(kind, [])]
            if len(set(ids)) != len(ids): err.append(f'{cid}: duplicate {kind} ids')
            for x in c.get(kind, []):
                if not ID.match(x.get('id', '')): err.append(f'{cid}: bad id {x.get("id")!r} (a-z 0-9 _ -)')
        for pg in c.get('pages', []):
            if not re.match(r'^https?://', pg.get('url', '')): err.append(f"{cid}_{pg.get('id')}: url must be http(s)")
            if not pg.get('highlight'): err.append(f"{cid}_{pg.get('id')}: needs >= 1 highlight sentence (exact page text)")
        for m in c.get('maps', []):
            z = m.get('zooms', [6, 14])
            try: ok = -90 < float(m['lat']) < 90 and -180 <= float(m['lon']) <= 180 and 1 <= z[0] <= z[1] <= 16 and m.get('label')
            except (KeyError, TypeError, ValueError): ok = False
            if not ok: err.append(f"{cid}_{m.get('id')}: map needs lat, lon, label, zooms [lo, hi] within 1..16")
    return err


def items(C, edir, prod, only):
    out = []
    for cid, c in C.items():
        if only and cid not in only: continue
        for pg in c.get('pages', []):
            out.append(dict(item=f"page|{cid}|{pg['id']}|{edir}|{prod}", weight=90, needs=[f'{edir}/assets.json']))
        for m in c.get('maps', []):
            z = m.get('zooms', [6, 14])
            out.append(dict(item=f"map|{cid}|{m['id']}|{m['lat']}|{m['lon']}|{z[0]}-{z[1]}|{prod}", weight=90, needs=[]))
    return out


def post(C, edir, prod):
    """keys.json pages entries (merged, other keys kept) + report. Returns list of problems."""
    P, E = os.path.join(ROOT, prod), os.path.join(ROOT, edir); kp = os.path.join(E, 'keys.json')
    K = json.load(open(kp, encoding='utf8')) if os.path.exists(kp) else {}
    K.setdefault('pages', {}); probs = []
    for cid, c in C.items():
        for pg in c.get('pages', []):
            n = f"{cid}_{pg['id']}"; wj = os.path.join(P, 'assets', 'pages', f'{n}_words.json')
            if not os.path.exists(wj) or not os.path.exists(os.path.join(P, 'assets', 'pages', f'{n}_page.png')):
                probs.append(f'{n}: no page capture (see assets/pages/{n}_fail.json)'); continue
            W = json.load(open(wj, encoding='utf8'))
            K['pages'][n] = dict(size=W['png_size'], url=W['url'], hl=[dict(text=h['text'] or h['query'], lines=h['lines']) for h in W['highlights']])
            for h in W['highlights']:
                if not h['lines']: probs.append(f"{n}: highlight not on page: {h['query'][:70]!r} (page text: assets/pages/{n}_text.txt)")
            bl = json.load(open(os.path.join(P, 'assets', 'pages', f'{n}_blurlog.json'), encoding='utf8'))
            if bl.get('not_found_blur_words'): print(f"  {n}: blur words not on page (fine): {bl['not_found_blur_words']}")
            print(f"  page {n}: {W['png_size']} via {'wayback' if 'web.archive.org' in W['url'] else 'live'}; "
                  f"blurred {len(bl['blurred'])}, skipped {len(bl['skipped'])}")
        for m in c.get('maps', []):
            n = f"{cid}_{m['id']}"; d = os.path.join(P, 'assets', 'maps', n); z = m.get('zooms', [6, 14])
            have = {int(f.split('_')[0]) for f in os.listdir(d) if f.endswith('.jpg')} if os.path.isdir(d) else set()
            miss = [k for k in range(z[0], z[1] + 1) if k not in have]
            if miss: probs.append(f'{n}: no tiles at zooms {miss}')
            print(f'  map {n}: {len(glob.glob(os.path.join(d, "*.jpg")))} tiles, beat: "map": {{"id": "{n}"}} (or tiles assets/maps/{n})')
    json.dump(K, open(kp, 'w', encoding='utf8'), indent=1, ensure_ascii=False)
    return probs


def sheet(C, edir, prod):
    from PIL import Image, ImageDraw
    P = os.path.join(ROOT, prod); cells = []
    for cid, c in C.items():
        for pg in c.get('pages', []):
            n = f"{cid}_{pg['id']}"; p = os.path.join(P, 'assets', 'pages', f'{n}_page.png')
            if not os.path.exists(p): continue
            im = Image.open(p).convert('RGB'); W = json.load(open(os.path.join(P, 'assets', 'pages', f'{n}_words.json'), encoding='utf8'))
            bl = json.load(open(os.path.join(P, 'assets', 'pages', f'{n}_blurlog.json'), encoding='utf8'))
            d = ImageDraw.Draw(im)
            for b in bl['blurred']: d.rectangle(b['box'], outline=(255, 210, 0), width=6)
            for h in W['highlights']:
                for l in h['lines']: d.rectangle(l, outline=(255, 30, 30), width=8)
            ls = [l for h in W['highlights'] for l in h['lines']]
            cy = (min(l[1] for l in ls) + max(l[3] for l in ls)) / 2 if ls else im.height / 4
            y0 = int(max(0, min(im.height - 2160, cy - 1080)))
            cells.append((n + ' (page around highlight; red=highlight, yellow=blurred)', im.crop((0, y0, im.width, min(im.height, y0 + 2160))).resize((960, 540))))
            cells.append((n + f' (whole page {im.width}x{im.height})', fit(im, 960, 540)))
        for m in c.get('maps', []):
            n = f"{cid}_{m['id']}"; d = os.path.join(P, 'assets', 'maps', n); z = m.get('zooms', [6, 14])
            for zz in (z[0], z[1]):
                cells.append((f"{n} z{zz} {m.get('label', '')}", mosaic(d, zz, float(m['lat']), float(m['lon']))))
    if not cells: print('nothing for the sheet'); return
    cols = 2; rows = -(-len(cells) // cols); out = Image.new('RGB', (cols * 960, rows * 566), (18, 18, 18)); dr = ImageDraw.Draw(out)
    for k, (t, im) in enumerate(cells):
        x, y = (k % cols) * 960, (k // cols) * 566
        out.paste(im, (x, y + 26)); dr.text((x + 6, y + 6), t, fill=(240, 240, 240))
    q = os.path.join(ROOT, edir, 'qa'); os.makedirs(q, exist_ok=True)
    out.save(os.path.join(q, 'ASSETS_CHECK.jpg'), quality=85); print('sheet', os.path.join(edir, 'qa', 'ASSETS_CHECK.jpg'))


def fit(im, w, h):
    from PIL import Image
    s = min(w / im.width, h / im.height); t = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))))
    bg = Image.new('RGB', (w, h), (30, 30, 30)); bg.paste(t, ((w - t.width) // 2, (h - t.height) // 2)); return bg


def mosaic(d, z, lat, lon):
    from PIL import Image, ImageDraw
    n = 256 * 2 ** z; s = math.sin(math.radians(lat))
    cx, cy = (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    tx, ty = int(cx // 256), int(cy // 256); im = Image.new('RGB', (7 * 256, 5 * 256), (8, 8, 8))
    for j in range(5):
        for i in range(7):
            p = os.path.join(d, f'{z}_{(tx - 3 + i) % 2 ** z}_{ty - 2 + j}.jpg')
            if os.path.exists(p): im.paste(Image.open(p).convert('RGB'), (i * 256, j * 256))
    px, py = cx - (tx - 3) * 256, cy - (ty - 2) * 256; dr = ImageDraw.Draw(im)
    dr.ellipse((px - 10, py - 10, px + 10, py + 10), outline=(255, 40, 40), width=4)
    return im.crop((int(px - 896 * 0.75), int(py - 504 * 0.75), int(px + 896 * 0.75), int(py + 504 * 0.75))).resize((960, 540))


def main(a):
    prod, edir = a[0].rstrip('/'), a[1].rstrip('/')
    only = set(a[a.index('--only') + 1].split(',')) if '--only' in a else set()
    C = load(edir); err = check(C)
    if err: print('assets.json problems:\n  ' + '\n  '.join(err)); return 1
    rc = 0
    if '--post' not in a:
        its = items(C, edir, prod, only)
        if not its: print('nothing to do'); return 1
        spec = os.path.join(ROOT, edir, '_assets_items.json'); json.dump(its, open(spec, 'w', encoding='utf8'), indent=0)
        cmd = ['bash', TASK, 'autoedit-assets', '--cmd', 'python tools/autoedit/assets/gh_assets.py {item}', '--items', spec,
               '--pip', PIP, '--in', f'{edir}/assets.json', 'tools/autoedit/assets/gh_assets.py',
               '--out', f'{prod}/assets/pages', f'{prod}/assets/maps']
        print(f'{len(its)} items on {len(its)} machines')
        if '--dry' in a: print(' '.join(cmd)); return 0
        t0 = time.time(); start = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        rc = subprocess.call(cmd, cwd=ROOT)
        end = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'); sec = round(time.time() - t0)
        os.makedirs(os.path.join(ROOT, edir, 'qa'), exist_ok=True)
        json.dump(dict(start=start, end=end, seconds=sec, items=len(its), exit=rc),
                  open(os.path.join(ROOT, edir, 'qa', 'assets_run.json'), 'w', encoding='utf8'), indent=1)
        print(f'run {start} -> {end} = {sec} s, exit {rc}')
    probs = post(C, edir, prod); sheet(C, edir, prod)
    if probs: print('PROBLEMS:\n  ' + '\n  '.join(probs)); return 1
    return rc


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
