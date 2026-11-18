"""Old Heritage Files outlines -> footage link list.
usage: python3 _tools/oh_links.py <video dir>   -> <video>/footage/LINKS.csv (case, row, type, url, label, note)
Reads research/outline.md: each case is a '### N. ...' heading; its footage table rows are the lines starting with '|' that hold a
link and are not 'Reference only'."""
import re, sys, csv, os

V = sys.argv[1]
txt = open(os.path.join(V, "research/outline.md"), encoding="utf-8").read()
rows, case = [], None
for line in txt.splitlines():
    m = re.match(r"^###\s+(\d+)\.\s", line)
    if m:
        case = int(m.group(1)); k = 0; continue
    if case is None or not line.startswith("|") or "Reference only" in line or "---" in line[:8]:
        continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    links = re.findall(r"\[([^\]]*)\]\((https?://[^)\s]+)\)", line)
    md = {u for _, u in links}
    links += [("", u.rstrip(".,;")) for u in re.findall(r"(?<!\()(https?://[^\s|)<>]+)", line) if u.rstrip(".,;") not in md]
    if not links:
        continue
    for label, url in links:
        k += 1
        rows.append([case, k, cells[0] if cells else "", url, label, cells[-1] if len(cells) > 3 else ""])
with open(os.path.join(V, "footage/LINKS.csv"), "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f); w.writerow(["case", "row", "type", "url", "label", "note"]); w.writerows(rows)
print(f"{V}: {len(rows)} links over {len({r[0] for r in rows})} cases")
