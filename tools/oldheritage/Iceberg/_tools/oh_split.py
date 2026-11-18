"""script.md -> vo/text/<PIECE>.txt (INTRO, CASE01.., LEVEL1.. for iceberg level lines, OUTRO). Headings are not voiced."""
import re, sys, os
V = sys.argv[1]; out = os.path.join(V, "vo/text"); os.makedirs(out, exist_ok=True)
cur, buf, n = None, [], 0
def flush():
    if cur and "".join(buf).strip():
        open(os.path.join(out, cur + ".txt"), "w").write("\n\n".join(p.strip() for p in "\n".join(buf).split("\n\n") if p.strip()) + "\n")
for line in open(os.path.join(V, "script/script.md"), encoding="utf-8"):
    h = re.match(r"^#{2,3}\s+(.*)", line)
    if h:
        flush(); buf = []; t = h.group(1).upper()
        m = re.match(r"(CASE|LEVEL)\s*(\d+)", t)
        cur = (f"CASE{int(m.group(2)):02d}" if m.group(1) == "CASE" else f"LEVEL{m.group(2)}") if m else ("INTRO" if "INTRO" in t else "OUTRO" if "OUTRO" in t else None)
        continue
    if cur: buf.append(line.rstrip("\n"))
flush()
fs = sorted(os.listdir(out)); print(V, len(fs), "pieces;", ", ".join(f"{f[:-4]}:{len(open(os.path.join(out,f)).read().split())}" for f in fs[:4]), "…")
