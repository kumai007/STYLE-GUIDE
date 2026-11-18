"""Capture a web page for the SHOT device (screenshot on a tilted plane) with headless Chrome, and record
the page-space boxes of phrases to highlight.
  capture_page.py <url> <case_dir> <name> [--phrase "text" ...] [--style select|red|black] [--height 1800] [--dark]
Writes <case>/shots/<name>.png (dpr 2, 1280 css px wide) and <name>.json (focus + highlights) for devices.gen_shot.
Sites that answer with a bot check are reported, never worked around."""
import json, subprocess, time, base64, sys, os, argparse, urllib.request, tempfile, shutil
import websocket
ap = argparse.ArgumentParser(); ap.add_argument("url"); ap.add_argument("case_dir"); ap.add_argument("name")
ap.add_argument("--phrase", action="append", default=[]); ap.add_argument("--style", default="select")
ap.add_argument("--height", type=int, default=1800); ap.add_argument("--width", type=int, default=1280); ap.add_argument("--mobile", action="store_true"); ap.add_argument("--dark", action="store_true"); ap.add_argument("--scroll", type=int, default=0)
ap.add_argument("--scroll-to", default="", help="scroll so this text sits ~220 css px from the top")
ap.add_argument("--js", default="", help="JS run after load (e.g. remove newsletter modals/overlays)")
ap.add_argument("--reject", default="", help="text of a cookie-banner button to click that DECLINES optional cookies, e.g. 'Reject All'")
a = ap.parse_args()
CH = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"); PORT = __import__("random").randint(9400, 9800); DPR = 2
prof = tempfile.mkdtemp(prefix="enc_cap_prof_")  # unique per run: parallel captures used to share (and delete) one profile
proc = subprocess.Popen([CH, "--headless=new", f"--remote-debugging-port={PORT}", f"--user-data-dir={prof}", "--remote-allow-origins=*", "--hide-scrollbars",
                         "--mute-audio", "--lang=en-GB", "--window-size=1280,1000", "about:blank"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
for _ in range(60):
    try: tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json")); break
    except Exception: time.sleep(0.5)
ws = websocket.create_connection([t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"], timeout=90, suppress_origin=True)
mid = [0]
def call(m, **p):
    mid[0] += 1; ws.send(json.dumps({"id": mid[0], "method": m, "params": p}))
    while True:
        r = json.loads(ws.recv())
        if r.get("id") == mid[0]: return r.get("result", r)
def ev(js): return call("Runtime.evaluate", expression=js, returnByValue=True, awaitPromise=True)["result"].get("value")
try:
    call("Emulation.setDeviceMetricsOverride", width=a.width, height=a.height, deviceScaleFactor=DPR, mobile=a.mobile)
    if a.mobile: call("Emulation.setUserAgentOverride", userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1")
    call("Emulation.setEmulatedMedia", features=[{"name": "prefers-color-scheme", "value": "dark" if a.dark else "light"}])
    call("Page.enable"); call("Page.navigate", url=a.url)
    for _ in range(40):
        time.sleep(1)
        if ev("document.readyState") == "complete": break
    time.sleep(3)
    title = ev("document.title") or ""; href = ev("location.href") or ""
    if any(k in (title + href).lower() for k in ("sorry", "captcha", "are you a robot", "access denied", "just a moment")):
        sys.exit(f"BOT CHECK at {href} ({title}) - not capturing")
    if a.js:
        ev(a.js); time.sleep(1.5)
    if a.reject:
        ev("""((t)=>{const b=[...document.querySelectorAll('button,a,input[type=button]')].find(e=>(e.innerText||e.value||'').trim()===t); if(b){b.click(); return 1} return 0})(%s)""" % json.dumps(a.reject)); time.sleep(2)
    ev("""(()=>{document.querySelectorAll('[id*=cookie],[class*=cookie],[id*=consent],[class*=consent],[class*=banner]').forEach(e=>{if(e.getBoundingClientRect().height<400)e.style.display='none'}); return 1})()""")
    if a.scroll_to:
        y = ev("""((q)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode()){if(n.textContent.includes(q)){const r=document.createRange();r.selectNodeContents(n);return r.getBoundingClientRect().top+window.scrollY}}return null})(%s)""" % json.dumps(a.scroll_to))
        if y is not None: a.scroll = max(0, int(y) - 220)
    ev(f"window.scrollTo(0,{a.scroll})"); time.sleep(1)
    boxes = []
    for ph in a.phrase:
        r = ev("""((q)=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT); let n; const N=[]; let all='';
            while(n=w.nextNode()){ const st=getComputedStyle(n.parentElement); if(st.display==='none'||st.visibility==='hidden') continue; N.push([n,all.length]); all+=n.textContent; }
            const norm=t=>t.replace(/\\s+/g,' '); const A=norm(all); const map=[]; {let j=0; for(let i=0;i<all.length;i++){ if(/\\s/.test(all[i]) && i>0 && /\\s/.test(all[i-1])) continue; map.push(i);} }
            const qi=A.indexOf(norm(q)); if(qi<0) return null; const s0=map[qi], s1=map[qi+norm(q).length-1]+1;
            const at=(pos)=>{ for(let k=N.length-1;k>=0;k--) if(N[k][1]<=pos) return [N[k][0], pos-N[k][1]]; return null; };
            const [sn,so]=at(s0), [en,eo]=at(s1-1); const r=document.createRange(); r.setStart(sn,so); r.setEnd(en,eo+1);
            { const b=r.getBoundingClientRect(); if(b.width<=0) return null;
              const L=[]; for(const q of r.getClientRects()){ if(q.width<2) continue; const l=L.find(z=>Math.abs(z[1]-q.top)<4); if(l){l[0]=Math.min(l[0],q.left);l[2]=Math.max(l[2],q.right);l[3]=Math.max(l[3],q.bottom);} else L.push([q.left,q.top,q.right,q.bottom]); }
              return {b:[b.left,b.top,b.right,b.bottom], lines:L};} return null})(%s)""" % json.dumps(ph))
        if r:
            sc = lambda q: [round(v * DPR, 1) for v in (q[0] - 2, q[1] - 1, q[2] + 2, q[3] + 1)]
            boxes.append({"phrase": ph, "box": sc(r["b"]), "lines": [sc(q) for q in r["lines"]], "chars": len(ph), "style": a.style, "t": 0.8 + 1.4 * len(boxes)})
        else: print("phrase not found:", ph)
    d = call("Page.captureScreenshot", format="png", clip={"x": 0, "y": a.scroll, "width": a.width, "height": a.height, "scale": 1})
    os.makedirs(os.path.join(a.case_dir, "shots"), exist_ok=True)
    out = os.path.join(a.case_dir, "shots", a.name + ".png"); open(out, "wb").write(base64.b64decode(d["data"]))
    focus = [(boxes[0]["box"][0] + boxes[0]["box"][2]) / 2, (boxes[0]["box"][1] + boxes[0]["box"][3]) / 2] if boxes else [1280 * DPR / 2, 500 * DPR]
    cfg = {"url": href, "title": title, "focus": focus, "highlights": boxes, "yaw": 18, "pitch": 10, "roll": -3, "zoom": 1.35, "w": a.width * DPR, "h": a.height * DPR}
    json.dump(cfg, open(os.path.join(a.case_dir, "shots", a.name + ".json"), "w", encoding="utf-8"), indent=1)
    print("saved", out, "|", title, "|", len(boxes), "highlights")
finally:
    ws.close(); proc.terminate(); time.sleep(1); shutil.rmtree(prof, ignore_errors=True)
