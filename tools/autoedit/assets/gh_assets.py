"""Runs ON a GitHub machine (task.sh item, one item = one asset). Spec: <edit>/assets.json (see tools/autoedit/schema.md).
  page|<cid>|<id>|<edit>|<prod>  -> <prod>/assets/pages/<cid>_<id>_page.png (blurred) + _raw/<cid>_<id>_raw.png (unblurred)
                                    + <cid>_<id>_words.json (word/line boxes, png px) + <cid>_<id>_blurlog.json
  map|<cid>|<id>|<lat>|<lon>|<z0>-<z1>|<prod> -> <prod>/assets/maps/<cid>_<id>/{z}_{x}_{y}.jpg + _meta.json
Pages: headless Chrome 1920 css wide at 2x, consent declined + overlays/ads hidden, lazy images loaded, scrolled to the
highlight. Blocked / captcha / sentence not found -> the Wayback copy. Never typesets a page: no capture = item fails.
Blur (soft gaussian, feathered): faces (haar, image regions only), every blur_word box, image ads, related/linked
story thumbnails. A blur box that would cover a highlight line is skipped (logged), except blur_words.
Maps: EOX Sentinel-2 cloudless 2016 (CC BY 4.0, "Sentinel-2 cloudless by EOX"), never Esri/OSM imagery; the 15x9
tile block kit.map_eox reads at every zoom z0..z1. Paths are relative to the run root (env FARM_ROOT, else cwd)."""
import datetime, json, math, os, re, subprocess, sys, time, urllib.parse, urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = os.environ.get('FARM_ROOT') or os.getcwd()
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', os.path.expanduser('~/farm-venv/pw-browsers'))   # inside the cached venv
SCALE, CSS_W, MAX_H = 2, 1920, 6000
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
EOX = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/GoogleMapsCompatible/{z}/{y}/{x}.jpg'
DECLINE = re.compile(r'(reject all|reject|decline|necessary only|only necessary|essential only|refuse|do not accept|no,? thanks)', re.I)
BLOCKED = re.compile(r'captcha|are you a robot|access denied|just a moment|attention required|verify you are human|'
                     r'press (&|and) hold|unusual traffic|request blocked|403 forbidden|enable javascript and cookies', re.I)

HIDE = """() => { for (const el of document.querySelectorAll('body *')) { const s = getComputedStyle(el);
  if (s.position === 'fixed' || s.position === 'sticky') el.style.setProperty('display','none','important'); }
  for (const el of document.querySelectorAll('[id*=consent i], [class*=consent i], [id*=cookie i], [class*=cookie i], [class*=newsletter i], [class*=modal i], [aria-modal=true], [role=dialog], [id*=onetrust i], [id^=sp_message i], [class*=paywall i], [class*=popup i], [class*=ad-slot i], [class*=adslot i], [class*=advert i], [id*=google_ads i], [class*=adsbygoogle i], ins.adsbygoogle, [id^=div-gpt i], [class*=dfp i], [class*=taboola i], [id*=taboola i], [class*=outbrain i], [id*=outbrain i], #wm-ipp-base, #wm-ipp, #donato'))
    el.style.setProperty('display','none','important');
  for (const f of document.querySelectorAll('iframe')) { if (!/youtube|player|vimeo/i.test(f.src||'')) f.style.setProperty('visibility','hidden','important'); }
  for (const e of [document.documentElement, document.body]) { e.style.setProperty('overflow','auto','important'); e.style.setProperty('position','static','important'); } }"""

# all matches of a phrase -> [{text, words:[{w,box}], lines:[box]}], boxes in css document coords (Range.getClientRects)
FIND = """([phr, all1]) => { const N = s => s.replace(/[\\u2018\\u2019]/g,"'").replace(/[\\u201c\\u201d]/g,'"').replace(/[\\u2013\\u2014]/g,'-').replace(/[\\u00a0\\s]/g,' ');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const nodes=[]; let all='';
  while (w.nextNode()) { const n=w.currentNode; const p=n.parentElement; if(!p||!p.offsetParent) continue; nodes.push([n, all.length]); all += N(n.textContent); }
  const low = all.toLowerCase(), q = N(phr).toLowerCase().trim(); if (!q) return [];
  const at = k => { for (let a=nodes.length-1;a>=0;a--) if (nodes[a][1]<=k) return [nodes[a][0], k-nodes[a][1]]; };
  const rects = (a,b) => { const r=document.createRange(); const s=at(a), e=at(b); r.setStart(s[0], Math.min(s[1], s[0].textContent.length)); r.setEnd(e[0], Math.min(e[1], e[0].textContent.length));
    return [...r.getClientRects()].filter(q=>q.width>1&&q.height>4).map(q=>[q.left+scrollX,q.top+scrollY,q.right+scrollX,q.bottom+scrollY]); };
  const out=[]; let i = low.indexOf(q);
  while (i >= 0 && out.length < 40) { const j=i+q.length, words=[], re=/\\S+/g, seg=all.slice(i,j); let m;
    while ((m=re.exec(seg))) { const rs = rects(i+m.index, i+m.index+m[0].length);
      if (rs.length) words.push({w:m[0], box:[Math.min(...rs.map(r=>r[0])),Math.min(...rs.map(r=>r[1])),Math.max(...rs.map(r=>r[2])),Math.max(...rs.map(r=>r[3]))]}); }
    const lines={}; for (const wd of words){ const k=Math.round(wd.box[1]/8); const L=lines[k]||[1e9,1e9,-1e9,-1e9];
      lines[k]=[Math.min(L[0],wd.box[0]),Math.min(L[1],wd.box[1]),Math.max(L[2],wd.box[2]),Math.max(L[3],wd.box[3])]; }
    if (words.length) out.push({text: all.slice(i,j), words, lines:Object.values(lines).sort((a,b)=>a[1]-b[1])});
    if (!all1) break; i = low.indexOf(q, j); }
  return out; }"""

# visible image-like regions; why != null -> blur the whole region (ad / thumbnail of another story)
IMGS = """() => { const out=[], here=location.href.split('#')[0];
  const REL=/related|recommend|more-stor|morestor|trending|popular|promo|sponsor|taboola|outbrain|newsletter|most-read|mostread|read-more|readmore|also-read|you-may|you-might|teaser|playlist|up-next|upnext|watch-next/i;
  const AD=/doubleclick|googlesyndication|adservice|amazon-adsystem|\\/ads?\\/|adnxs|criteo|taboola|outbrain|moatads/i;
  const els=new Set(document.querySelectorAll('img,picture,video,canvas,iframe'));
  for (const el of document.querySelectorAll('div,a,figure,span,section,header')) { const bg=getComputedStyle(el).backgroundImage; if (bg && bg.includes('url(')) els.add(el); }
  for (const el of els) { const r=el.getBoundingClientRect(); if (r.width<40||r.height<40) continue;
    const s=getComputedStyle(el); if (s.visibility==='hidden'||s.display==='none'||+s.opacity===0||!el.getClientRects().length) continue;
    if (el.tagName==='IMG' && el.closest('picture') && el.closest('picture')!==el) continue;
    const box=[r.left+scrollX, r.top+scrollY, r.right+scrollX, r.bottom+scrollY];
    const src=(el.currentSrc||el.src||'')+' '+(el.getAttribute('srcset')||'')+' '+(s.backgroundImage||''); let why=null;
    if (AD.test(src)) why='image ad';
    else if (r.width < 900) { let p=el;
      for (let d=0; p && d<8; d++, p=p.parentElement) { const c=(p.id||'')+' '+(typeof p.className==='string'?p.className:'')+' '+((p.getAttribute&&p.getAttribute('aria-label'))||'');
        const m=c.match(REL); if (m) { why='related/promo thumbnail ('+m[0].toLowerCase()+')'; break; } }
      if (!why) { const a=el.closest('a[href]'); if (a && r.width<700) { const h=a.href.split('#')[0];
        if (/^https?:/.test(h) && h!==here && !/\\.(jpe?g|png|webp|gif)(\\?|$)/i.test(h)) why='linked thumbnail (other story)'; } } }
    out.push({box, why, tag: el.tagName.toLowerCase()}); }
  return out; }"""


def J(p, d):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    json.dump(d, open(p, 'w', encoding='utf8'), indent=1, ensure_ascii=False)


def spec(edir, cid, kind, aid):
    A = json.load(open(os.path.join(ROOT, edir, 'assets.json'), encoding='utf8'))
    for it in (A.get('cases', A).get(cid) or {}).get(kind, []):
        if it['id'] == aid: return it
    raise SystemExit(f'{cid}/{kind}/{aid} not in {edir}/assets.json')


# ---------------------------------------------------------------- pages
def launch(p):
    args = ['--disable-blink-features=AutomationControlled', '--no-sandbox']
    try: return p.chromium.launch(channel='chrome', args=args)        # GitHub ubuntu image ships Google Chrome
    except Exception as e: print('no system chrome:', str(e)[:120])
    subprocess.run([sys.executable, '-m', 'playwright', 'install', 'chromium'], check=False)
    try: return p.chromium.launch(args=args)
    except Exception as e: print('bundled chromium needs deps:', str(e)[:120])
    subprocess.run(['sudo', '-E', sys.executable, '-m', 'playwright', 'install-deps', 'chromium'], check=False)
    return p.chromium.launch(args=args)


def wayback(url):
    try:
        q = 'https://archive.org/wayback/available?url=' + urllib.parse.quote(url, safe='')
        with urllib.request.urlopen(urllib.request.Request(q, headers={'User-Agent': 'page-capture/1.0'}), timeout=30) as r:
            snap = json.load(r).get('archived_snapshots', {}).get('closest', {})
        if snap.get('available') and snap.get('url'):
            return re.sub(r'(/web/\d{8,14})/', r'\1if_/', snap['url'].replace('http://', 'https://', 1), count=1)
    except Exception as e: print('wayback api:', str(e)[:100])
    return 'https://web.archive.org/web/2025if_/' + url


def try_url(b, u, phrases, blur_words):
    ctx = b.new_context(viewport={'width': CSS_W, 'height': 1080}, device_scale_factor=SCALE, locale='en-US', user_agent=UA)
    pg = ctx.new_page()
    try:
        resp = pg.goto(u, wait_until='domcontentloaded', timeout=60000); pg.wait_for_timeout(5000)
        for fr in pg.frames:                                              # consent banners: decline (also inside CMP iframes)
            try:
                btn = fr.get_by_role('button', name=DECLINE).first
                if btn.count() and btn.is_visible(): btn.click(timeout=2500); pg.wait_for_timeout(1200); break
            except Exception: pass
        title = pg.title(); body = pg.evaluate("() => (document.body && document.body.innerText || '').slice(0, 3000)")
        st = resp.status if resp else 0
        if st >= 400 or BLOCKED.search(title) or BLOCKED.search(body[:1500]) or len(body.strip()) < 300:
            return dict(ok=False, why=f'blocked/empty (http {st}, title {title[:60]!r})', ctx=ctx)
        hgt = pg.evaluate('document.documentElement.scrollHeight')
        for y in range(0, min(hgt, MAX_H * 2), 700): pg.evaluate(f'window.scrollTo(0,{y})'); pg.wait_for_timeout(200)
        pg.evaluate(HIDE)
        found = [pg.evaluate(FIND, [ph, False]) for ph in phrases]
        top = min([f[0]['lines'][0][1] for f in found if f] or [0])
        pg.evaluate(f'window.scrollTo(0,{max(0, top - 400)})'); pg.wait_for_timeout(2500)   # the highlight: lazy images settle
        pg.evaluate(HIDE); pg.wait_for_timeout(600)
        found = [pg.evaluate(FIND, [ph, False]) for ph in phrases]          # final layout
        bw = [(w, pg.evaluate(FIND, [w, True])) for w in blur_words]
        imgs = pg.evaluate(IMGS)
        return dict(ok=True, ctx=ctx, pg=pg, title=title, found=found, bw=bw, imgs=imgs, url=u, status=st,
                    nfound=sum(1 for f in found if f), body=body)
    except Exception as e:
        return dict(ok=False, why='error ' + str(e)[:160], ctx=ctx)


def soft_blur(arr, im, box, rad):
    from PIL import Image, ImageFilter
    import numpy as np
    H, W = arr.shape[:2]; x0, y0, x1, y1 = [int(round(v)) for v in box]
    x0, y0, x1, y1 = max(0, x0), max(0, y0), min(W, x1), min(H, y1)
    if x1 - x0 < 4 or y1 - y0 < 4: return
    m = max(8, rad); bx0, by0, bx1, by1 = max(0, x0 - 3 * m), max(0, y0 - 3 * m), min(W, x1 + 3 * m), min(H, y1 + 3 * m)
    bl = np.asarray(im.crop((bx0, by0, bx1, by1)).filter(ImageFilter.GaussianBlur(rad)), np.float32)
    mk = Image.new('L', (bx1 - bx0, by1 - by0), 0); mk.paste(255, (x0 - bx0, y0 - by0, x1 - bx0, y1 - by0))
    mk = np.asarray(mk.filter(ImageFilter.GaussianBlur(m * 0.6)), np.float32)[..., None] / 255
    arr[by0:by1, bx0:bx1] = arr[by0:by1, bx0:bx1] * (1 - mk) + bl * mk


def faces_in(gray, box):
    import cv2
    x0, y0, x1, y1 = [int(v) for v in box]; crop = gray[max(0, y0):y1, max(0, x0):x1]
    if crop.size == 0 or min(crop.shape) < 40: return []
    d = cv2.data.haarcascades; out = []
    for name, nb in (('haarcascade_frontalface_default.xml', 5), ('haarcascade_profileface.xml', 5)):
        for x, y, w, h in cv2.CascadeClassifier(d + name).detectMultiScale(crop, 1.1, nb, minSize=(22, 22)):
            p = 0.3 * max(w, h)
            out.append([x0 + x - p, y0 + y - p, x0 + x + w + p, y0 + y + h + p])
        flip = cv2.flip(crop, 1) if 'profile' in name else None             # profile cascade sees one side only
        if flip is not None:
            for x, y, w, h in cv2.CascadeClassifier(d + name).detectMultiScale(flip, 1.1, nb, minSize=(22, 22)):
                p = 0.3 * max(w, h); xr = crop.shape[1] - x - w
                out.append([x0 + xr - p, y0 + y - p, x0 + xr + w + p, y0 + y + h + p])
    return out


def inter(a, b): return min(a[2], b[2]) > max(a[0], b[0]) and min(a[3], b[3]) > max(a[1], b[1])


def page(cid, aid, edir, prod):
    from playwright.sync_api import sync_playwright
    import numpy as np, cv2
    from PIL import Image
    it = spec(edir, cid, 'pages', aid); name = f'{cid}_{aid}'
    phrases, blur_words = it.get('highlight') or [], it.get('blur_words') or []
    OUT = os.path.join(ROOT, prod, 'assets', 'pages'); tries = []
    with sync_playwright() as p:
        b = launch(p); best = None
        for u in [it['url'], it.get('wayback') or wayback(it['url'])]:
            r = try_url(b, u, phrases, blur_words)
            if not r['ok']: tries.append(f"{u[:90]}: {r['why']}"); r['ctx'].close(); continue
            tries.append(f"{u[:90]}: ok, {r['nfound']}/{len(phrases)} highlights found")
            if best is None or r['nfound'] > best['nfound']:
                if best: best['ctx'].close()
                best = r
            else: r['ctx'].close()
            if best['nfound'] == len(phrases): break
        if best is None:
            J(os.path.join(OUT, f'{name}_fail.json'), dict(url=it['url'], tries=tries))
            raise SystemExit(f'{name}: no capture (never typeset a fake page): {tries}')
        pg, found = best['pg'], best['found']
        sh = pg.evaluate('document.documentElement.scrollHeight')
        hl_lines = [l for f in found if f for l in f[0]['lines']]
        bottom = max([l[3] for l in hl_lines] or [1080]); top = min([l[1] for l in hl_lines] or [0])
        y0 = 0 if bottom + 700 <= MAX_H else max(0, int(top) - 1500)
        h = int(min(max(1080, bottom + 700 - y0), sh - y0, MAX_H))
        os.makedirs(os.path.join(OUT, '_raw'), exist_ok=True); raw = os.path.join(OUT, '_raw', f'{name}_raw.png')
        pg.screenshot(path=raw, full_page=True, clip={'x': 0, 'y': y0, 'width': CSS_W, 'height': h})
        title, url = best['title'], best['url']; imgs, bw = best['imgs'], best['bw']
        if not all(found):                                                   # lets the lead pick exact sentences
            open(os.path.join(OUT, f'{name}_text.txt'), 'w', encoding='utf8').write(pg.evaluate("() => document.body.innerText")[:20000])
        b.close()
    S = lambda bx: [round((v - (y0 if k % 2 else 0)) * SCALE) for k, v in enumerate(bx)]
    im = Image.open(raw).convert('RGB'); W, H = im.size; arr = np.asarray(im, np.float32).copy()
    gray = cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2GRAY)
    hl_px = [S(l) for l in hl_lines]; log, skipped = [], []
    regs = []                                                            # (box px, sigma, why, may cover highlight)
    for w, ms in bw:
        for m in ms:
            for l in m['lines']: regs.append(([*S(l)], 12, f'blur word {w!r}', True))
    for g in imgs:
        bx = S(g['box'])
        if bx[3] <= 0 or bx[1] >= H: continue
        if g['why']: regs.append((bx, 26, g['why'], False)); continue
        for f in faces_in(gray, bx): regs.append(([round(v) for v in f], max(10, min(30, int((f[2] - f[0]) / 6))), f"face in {g['tag']}", False))
    for bx, rad, why, force in regs:
        bx = [max(0, bx[0] - 3), max(0, bx[1] - 3), min(W, bx[2] + 3), min(H, bx[3] + 3)]
        if not force and any(inter(bx, l) for l in hl_px): skipped.append(dict(box=bx, why=why, note='overlaps highlight')); continue
        soft_blur(arr, im, bx, rad); log.append(dict(box=bx, sigma=rad, why=why))
    Image.fromarray(arr.clip(0, 255).astype(np.uint8)).save(os.path.join(OUT, f'{name}_page.png'), optimize=True)
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    J(os.path.join(OUT, f'{name}_words.json'), dict(
        url=url, source_url=it['url'], title=title, captured=f'{now} headless Chrome (Playwright), {CSS_W} css wide, scale {SCALE}',
        crop_top_css=y0, png_size=[W, H], units='png pixels (document coords - crop_top, x scale)', tries=tries,
        missing=[ph for ph, f in zip(phrases, found) if not f],
        highlights=[dict(text=f[0]['text'], query=ph, lines=[S(l) for l in f[0]['lines']],
                         words=[dict(w=x['w'], box=S(x['box'])) for x in f[0]['words']]) if f else dict(query=ph, text=None, lines=[], words=[])
                    for ph, f in zip(phrases, found)],
        blur_words=[dict(text=w, boxes=[S(l) for m in ms for l in m['lines']]) for w, ms in bw]))
    J(os.path.join(OUT, f'{name}_blurlog.json'), dict(page=name, url=url, method='soft gaussian, feathered edges', blurred=log, skipped=skipped,
                                                      not_found_blur_words=[w for w, ms in bw if not ms]))
    print(name, 'ok', url[:80], 'size', W, H, 'blurred', len(log), 'skipped', len(skipped), 'missing', sum(1 for f in found if not f))


# ---------------------------------------------------------------- maps
def merc(lat, lon, z):
    n = 256 * 2 ** z; s = math.sin(math.radians(lat))
    return (lon + 180) / 360 * n, (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n


def tile(a):
    d, z, x, y = a; p = os.path.join(d, f'{z}_{x}_{y}.jpg')
    if os.path.exists(p) and os.path.getsize(p) >= 500: return 1
    req = urllib.request.Request(EOX.format(z=z, x=x, y=y), headers={'User-Agent': 'map-tile-client/1.0'})
    for t in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as r: data = r.read()
            if len(data) < 500: raise ValueError('short tile')
            open(p, 'wb').write(data); return 1
        except Exception as e:
            err = e; time.sleep(1.5 * (t + 1))
    print('tile fail', z, x, y, str(err)[:80]); return 0


def mapjob(cid, aid, lat, lon, zr, prod):
    lat, lon = float(lat), float(lon); z0, z1 = [int(v) for v in zr.split('-')]
    d = os.path.join(ROOT, prod, 'assets', 'maps', f'{cid}_{aid}'); os.makedirs(d, exist_ok=True); jobs = []
    for z in range(max(1, z0 - 1), z1 + 1):                                # z0-1 = parent fill for kit._plate
        cx, cy = merc(lat, lon, z); tx, ty = int(cx // 256), int(cy // 256)
        for j in range(ty - 4, ty + 5):
            for i in range(tx - 7, tx + 8):                                 # = kit.map_eox's 15x9 plate
                if 0 <= j < 2 ** z: jobs.append((d, z, i % 2 ** z, j))
    jobs = list(dict.fromkeys(jobs))
    with ThreadPoolExecutor(16) as ex: ok = sum(ex.map(tile, jobs))     # 8 threads: 1870 tiles took 271 s (t10 run 1)
    J(os.path.join(d, '_meta.json'), dict(lat=lat, lon=lon, zooms=[z0, z1], tiles=ok, wanted=len(jobs),
                                          source='EOX Sentinel-2 cloudless 2016 (CC BY 4.0)', credit='Sentinel-2 cloudless by EOX'))
    print(cid, aid, 'tiles', ok, '/', len(jobs))
    if ok < 0.9 * len(jobs): raise SystemExit(f'{cid}_{aid}: only {ok}/{len(jobs)} tiles')


if __name__ == '__main__':
    f = sys.argv[1].split('|')
    if f[0] == 'page': page(*f[1:5])
    elif f[0] == 'map': mapjob(*f[1:7])
    else: raise SystemExit('unknown item ' + f[0])
