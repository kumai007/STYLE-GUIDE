"""Join the 4 helper lists into one review .md and one self-contained .html (thumbnails embedded)."""
import base64, html, io, re, subprocess, sys
from pathlib import Path
from PIL import Image

SCR = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
PARTS = [("MA", "mg_A.md", "Motion graphics A (editor-v5 templates, PROJECT/graphics)"),
         ("MB", "mg_B.md", "Motion graphics B (learned anims, EncountersStudio, Farrell inventory)"),
         ("LC", "learn_C.md", "Editing learnings C (EDITING_RULES, PLAYBOOK, EDITING_KNOWLEDGE, OWNER_TASTE)"),
         ("LD", "learn_D.md", "Learnings D (memory files, CLAUDE.md lessons, tool notes)")]
IMG = re.compile(r"[A-Za-z]:\\[^|;]*?\.(?:jpg|jpeg|png|gif|webp|mp4|mov|webm)", re.I)
cache = {}

def thumb(p):
    if p in cache:
        return cache[p]
    f = Path(p)
    src = None
    try:
        if not f.exists():
            raise FileNotFoundError
        if f.suffix.lower() in (".mp4", ".mov", ".webm"):
            r = subprocess.run(["ffmpeg", "-v", "error", "-ss", "0.5", "-i", str(f), "-frames:v", "1",
                                "-vf", "scale=320:-2", "-f", "image2pipe", "-vcodec", "mjpeg", "-"],
                               capture_output=True, timeout=60)
            im = Image.open(io.BytesIO(r.stdout))
        else:
            im = Image.open(f)
            im.seek(0)
        im = im.convert("RGB")
        im.thumbnail((320, 320))
        b = io.BytesIO()
        im.save(b, "JPEG", quality=70)
        src = "data:image/jpeg;base64," + base64.b64encode(b.getvalue()).decode()
    except Exception:
        src = None
    cache[p] = src
    return src

def inline(t):
    t = html.escape(t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    return re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", t)

def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]

md_out, body, counts = [], [], {}
for pre, fn, title in PARTS:
    n = 0
    md_out.append(f"\n\n# {pre}: {title}\n")
    body.append(f'<h2 id="{pre}">{pre}: {html.escape(title)}</h2>')
    in_table = False
    for line in (SCR / fn).read_text(encoding="utf-8").splitlines():
        if line.startswith("# "):
            continue  # helper's own title
        if line.startswith("|"):
            cs = cells(line)
            if set("".join(cs)) <= set("-: "):
                md_out.append(line)
                continue
            if not in_table:  # header row
                in_table = True
                hdr = cs
                md_out.append(line.replace("| # |", "| ID |", 1))
                body.append("<table><tr>" + "".join(f"<th>{html.escape(c)}</th>" for c in hdr) + "</tr>")
                continue
            n += 1
            rid = f"{pre}-{n}"
            cs[0] = rid
            md_out.append("| " + " | ".join(cs) + " |")
            st = next((c for c, h in zip(cs, hdr) if h.lower().startswith("status")), "")
            key = "CONFLICT" if "CONFLICT" in st else "NEW" if "NEW" in st else "IN GUIDE" if "IN GUIDE" in st else "TOOL"
            counts.setdefault(pre, {}).setdefault(key, 0)
            counts[pre][key] += 1
            tds = []
            for c, h in zip(cs, hdr):
                if h.lower().startswith("preview"):
                    m = IMG.search(c)
                    s = thumb(m.group(0)) if m else None
                    tds.append(f'<td class="pv">' + (f'<img loading="lazy" src="{s}" title="{html.escape(m.group(0))}">' if s else html.escape(c)) + "</td>")
                elif h.lower().startswith("source"):
                    tds.append(f'<td class="src">{inline(c)}</td>')
                elif c == rid:
                    tds.append(f'<td class="id"><label><input type=checkbox class=k value="{rid}"> {rid}</label></td>')
                else:
                    tds.append(f"<td>{inline(c)}</td>")
            body.append(f'<tr data-s="{key}">' + "".join(tds) + "</tr>")
        else:
            if in_table:
                body.append("</table>")
                in_table = False
            md_out.append(line)
            s = line.strip()
            if s.startswith("#"):
                lvl = min(6, s.count("#", 0, s.find(" ")) + 1)
                body.append(f"<h{lvl}>{inline(s.lstrip('#').strip())}</h{lvl}>")
            elif s:
                body.append(f"<p>{inline(s.lstrip('-* '))}</p>")
    if in_table:
        body.append("</table>")

summary = ["| Part | NEW | CONFLICT | IN GUIDE | Tool notes |", "|---|---|---|---|---|"]
for pre, _, title in PARTS:
    c = counts.get(pre, {})
    summary.append(f"| {pre} {title} | {c.get('NEW',0)} | {c.get('CONFLICT',0)} | {c.get('IN GUIDE',0)} | {c.get('TOOL',0)} |")
head = ("# Review: motion graphics and learnings from all Videos\\CLAUDE folders (2026-11-09)\n\n"
        "Every row has an ID (MA-12, LC-40 ...). Tell Claude the IDs to add, change or drop.\n"
        "Status: NEW = not in the Farrell guide yet. CONFLICT = breaks a Farrell rule (reason given). "
        "IN GUIDE = the guide already has it. Sources were only read, never changed.\n\n" + "\n".join(summary))
(OUT / "REVIEW.md").write_text(head + "\n" + "\n".join(md_out) + "\n", encoding="utf-8")

css = """
:root{--bg:#111;--fg:#ddd;--mut:#888;--line:#333;--new:#2e7d32;--con:#c62828;--in:#455a64;--tool:#5d4037}
body{background:var(--bg);color:var(--fg);font:14px/1.45 system-ui,sans-serif;margin:0 16px 80px}
h1{font-size:20px}h2{margin-top:40px;border-bottom:1px solid var(--line)}h3{margin-top:24px}
table{border-collapse:collapse;width:100%;margin:8px 0}td,th{border:1px solid var(--line);padding:4px 6px;vertical-align:top;text-align:left}
th{background:#1c1c1c}td.id{font-weight:700;white-space:nowrap}
td.src{font-size:11px;color:var(--mut);word-break:break-all;max-width:220px}td.pv img{width:200px;display:block}
tr[data-s=NEW] td.id{color:#81c784}tr[data-s=CONFLICT] td.id{color:#ef5350}tr[data-s="IN GUIDE"] td.id{color:#90a4ae}
code{color:#ffcc80}#bar{position:sticky;top:0;background:var(--bg);padding:8px 0;z-index:2;display:flex;gap:6px;flex-wrap:wrap;align-items:center}
button{background:#222;color:var(--fg);border:1px solid var(--line);padding:4px 10px;cursor:pointer}button.on{border-color:#fff}
input{background:#222;color:var(--fg);border:1px solid var(--line);padding:4px 8px;flex:1;min-width:140px}
.hide{display:none}tr.kept{background:#1b2e1b}td.id input{transform:scale(1.4);margin-right:6px}"""
js = """
let f='ALL',q='';const rows=[...document.querySelectorAll('tr[data-s]')];const ks=[...document.querySelectorAll('input.k')];
const KEY='farrell-review-keep';let keep=new Set();try{keep=new Set(JSON.parse(localStorage.getItem(KEY)||'[]'))}catch(e){}
ks.forEach(k=>{k.checked=keep.has(k.value);k.closest('tr').classList.toggle('kept',k.checked);k.onchange=()=>{k.checked?keep.add(k.value):keep.delete(k.value);k.closest('tr').classList.toggle('kept',k.checked);save();}});
function save(){try{localStorage.setItem(KEY,JSON.stringify([...keep]))}catch(e){}document.getElementById('n').textContent=keep.size;}
function picks(){return 'Keep: '+ks.filter(k=>keep.has(k.value)).map(k=>k.value).join(', ');}
document.getElementById('cp').onclick=()=>{const t=picks(),o=document.getElementById('out');o.value=t;o.style.display='block';o.select();try{navigator.clipboard.writeText(t)}catch(e){}document.getElementById('cp').textContent='Copied';setTimeout(()=>document.getElementById('cp').textContent='Copy kept IDs',1500);};
save();
function go(){rows.forEach(r=>r.classList.toggle('hide',(f=='KEPT'?!r.classList.contains('kept'):(f!='ALL'&&r.dataset.s!=f))||(q&&!r.textContent.toLowerCase().includes(q))));}
document.querySelectorAll('#bar button[data-f]').forEach(b=>b.onclick=()=>{f=b.dataset.f;document.querySelectorAll('#bar button[data-f]').forEach(x=>x.classList.toggle('on',x==b));go();});
document.getElementById('q').oninput=e=>{q=e.target.value.toLowerCase();go();};"""
sumhtml = "<table><tr><th>Part</th><th>NEW</th><th>CONFLICT</th><th>IN GUIDE</th><th>Tool notes</th></tr>" + "".join(
    f'<tr><td><a href="#{p}" style="color:#9cf">{p}</a> {html.escape(t)}</td><td>{counts.get(p,{}).get("NEW",0)}</td><td>{counts.get(p,{}).get("CONFLICT",0)}</td><td>{counts.get(p,{}).get("IN GUIDE",0)}</td><td>{counts.get(p,{}).get("TOOL",0)}</td></tr>'
    for p, _, t in PARTS) + "</table>"
page = (f"<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>"
        f"<title>Farrell Review List</title><style>{css}</style>"
        "<div id=bar><button data-f=ALL class=on>All</button><button data-f=NEW>NEW</button><button data-f=CONFLICT>CONFLICT</button>"
        "<button data-f='IN GUIDE'>IN GUIDE</button><button data-f=TOOL>Tool notes</button><button data-f=KEPT>Kept</button><input id=q placeholder='Search (e.g. map, date, VHS)'>"
        "<b>Kept: <span id=n>0</span></b><button id=cp style='border-color:#81c784'>Copy kept IDs</button>"
        "<textarea id=out style='display:none;width:100%;height:60px;background:#222;color:#ddd'></textarea></div>"
        "<h1>Review: motion graphics and learnings (2026-11-09)</h1>"
        "<p>Every row has an ID (MA-12, LC-40 ...). Tell Claude the IDs to add, change or drop. NEW = not in the guide yet. "
        "CONFLICT = breaks a Farrell rule (reason given). IN GUIDE = already there. Sources were only read.</p>"
        + sumhtml + "\n".join(body) + f"<script>{js}</script>")
(OUT / "review.html").write_text(page, encoding="utf-8")
miss = sum(1 for v in cache.values() if v is None)
print("rows", {k: sum(v.values()) for k, v in counts.items()}, counts)
print("previews", len(cache), "missing/unreadable", miss)
print("html MB", round((OUT / "review.html").stat().st_size / 1e6, 2))
