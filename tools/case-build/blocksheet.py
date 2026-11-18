"""Convert a block-style cut sheet (### RAW-C1-01 / **SOURCE:** / **TIMESTAMP:** ...) into the
cutsheet.py line format, then write job.json (with block refs) + blocks.json + vo_lines.csv.

Usage:
    python -I blocksheet.py SHEET.txt --vo VO_ONLY.txt -o productions/<video>
Writes: <out>/cutsheet_lines.md, job.json, blocks.json (every block with all fields), vo_lines.csv (id = block ref).
Exit 1 on any mismatch (unknown source, bad timestamp, VO text not found in the VO-only script).
"""
from __future__ import annotations
import argparse, csv, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import cutsheet  # noqa: E402

HEAD = re.compile(r"^###\s+(?P<ref>[A-Z]+(?:-[A-Z0-9]+)?-\d+)\s*(?P<extra>.*)$")
SEC = re.compile(r"^##\s+(?P<name>.+)$")
FIELD = re.compile(r"^\*\*(?P<k>[A-Z /]+):\*\*\s*(?P<v>.*)$")
URL = re.compile(r"https?://www\.youtube\.com/watch\?v=[\w-]+")
TC = cutsheet.TC
RANGE = re.compile(rf"(?P<a>{TC})\s*[–—-]\s*(?P<b>{TC})\+?(?:\s*\((?P<note>[^)]*)\))?")


def norm(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


def read_blocks(text: str):
    sections, blocks, cur, key = [], [], None, None
    for line in text.splitlines():
        s = line.rstrip()
        m = HEAD.match(s.strip())
        if m:
            cur = {"ref": m.group("ref"), "extra": m.group("extra").strip(), "section": sections[-1] if sections else "",
                   "fields": {}}
            blocks.append(cur); key = None; continue
        m = SEC.match(s.strip())
        if m and not s.startswith("###"):
            sections.append(m.group("name").strip()); cur = None; continue
        if s.strip().startswith("# "): cur = None; continue
        if cur is None: continue
        m = FIELD.match(s.strip())
        if m:
            key = m.group("k").strip(); cur["fields"][key] = m.group("v").strip(); continue
        if s.strip() and key and s.strip() != "---":
            cur["fields"][key] = (cur["fields"][key] + " " + s.strip()).strip()
    return sections, blocks


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("sheet"); ap.add_argument("--vo", required=True); ap.add_argument("-o", "--out", required=True)
    a = ap.parse_args(argv)
    text = Path(a.sheet).read_text(encoding="utf-8")
    vo_only = norm(Path(a.vo).read_text(encoding="utf-8"))
    sections, blocks = read_blocks(text)
    errors = []

    # tags: one per YouTube video, named from the channel
    tags, url_tag = {}, {}
    def tag_for(url, src):
        if url in url_tag: return url_tag[url]
        base = re.sub(r"[^A-Z0-9]", "", re.sub(r"\(.*?\)|—.*", "", src).upper())[:10] or "SRC"
        t, n = base, 2
        while t in tags: t, n = f"{base}{n}", n + 1
        tags[t] = url; url_tag[url] = t; return t

    for b in blocks:
        src = b["fields"].get("SOURCE", "")
        m = URL.search(src)
        if m: b["url"] = m.group(0); b["tag"] = tag_for(m.group(0), src)

    # case sections -> number/name, case of each tag = first case that uses it in a RAW block of that case
    def case_no(sec):
        m = re.match(r"CASE\s+(\d+)\s*[—–-]\s*(.+)", sec)
        return (int(m.group(1)), m.group(2).strip()) if m else (None, None)

    tag_case = {}
    for b in blocks:
        n, _ = case_no(b["section"])
        rc = re.match(r"RAW-C(\d+)-", b["ref"])  # a block named for another case (e.g. a hard-cut opener) is a teaser
        if rc and n and int(rc.group(1)) != n: continue
        if b["ref"].startswith("RAW") and b.get("tag") and n and b["tag"] not in tag_case and "teaser" not in b["extra"]:
            tag_case[b["tag"]] = n
    for t in tags:
        if t not in tag_case: errors.append(f"source [{t}] is never used by a RAW block inside a case")

    out_lines, vo_rows = ["# " + norm(text.splitlines()[0].lstrip("# ")), ""], []
    cur_sec = None
    for b in blocks:
        if b["section"] != cur_sec:
            cur_sec = b["section"]; n, name = case_no(cur_sec)
            if n:
                out_lines += ["", f"## CASE {n:02d} · {name}"]
                out_lines += [f"[{t}] <{u}>" for t, u in tags.items() if tag_case.get(t) == n]
            elif not any(l.startswith("## CASE") for l in out_lines):
                out_lines += ["", "## INTRO"]
        f, ref = b["fields"], b["ref"]
        if "VO" in f:
            t = norm(f["VO"])
            if t not in vo_only: errors.append(f"{ref}: VO text not found in the VO-only script")
            b["vo_text"] = t; out_lines.append(t); vo_rows.append([ref, t])
        if ref.startswith("RAW"):
            ts = f.get("TIMESTAMP", "")
            ranges = list(RANGE.finditer(ts))
            if not ranges or "tag" not in b: errors.append(f"{ref}: no timestamp or source URL"); continue
            b["ranges"] = []
            quote = norm(f.get("START ON", "")).replace('"', "'")
            music_out = "MUSIC OUT" in f.get("KEEP ORIGINAL AUDIO", "")
            for r in ranges:
                use = re.search(r"~\s*(\d+)\s*sec", r.group("note") or "")
                start, end = cutsheet.parse_timecode(r.group("a")), cutsheet.parse_timecode(r.group("b"))
                b["ranges"].append({"start": start, "end": end, "use_s": int(use.group(1)) if use else None})
                notes = " · ".join(x for x in [f"ref {ref}", "MUSIC OUT" if music_out else "",
                                               "subs" if f.get("SUBTITLES", "").startswith("Yes") else ""] if x)
                ln = f"▶ RAW · [{b['tag']}] {r.group('a')}–{r.group('b')} · \"{quote}\""
                if use: ln += f" · ~{use.group(1)}s"
                out_lines.append(ln + " · " + notes)
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    (out / "cutsheet_lines.md").write_text("\n".join(out_lines) + "\n", encoding="utf-8")
    try:
        job = cutsheet.parse("\n".join(out_lines))
    except cutsheet.CutSheetError as e:
        errors.append(f"cutsheet.py: {e}"); job = None
    if errors:
        print("\n".join("ERROR " + e for e in errors), file=sys.stderr); return 1
    vo_iter = iter(r[0] for r in vo_rows)
    for blk in job["blocks"]:
        if blk["kind"] == "vo": blk["ref"] = next(vo_iter)
        else: blk["ref"] = re.search(r"ref (\S+)", blk["notes"]).group(1)
    (out / "job.json").write_text(json.dumps(job, indent=1, ensure_ascii=False), encoding="utf-8")
    (out / "blocks.json").write_text(json.dumps({"tags": tags, "blocks": blocks}, indent=1, ensure_ascii=False), encoding="utf-8")
    with open(out / "vo_lines.csv", "w", encoding="utf-8", newline="") as fh:
        w = csv.writer(fh); w.writerow(["id", "text"]); w.writerows(vo_rows)
    cues = [b for b in job["blocks"] if b["kind"] == "raw"]
    print(f"{len(job['cases'])} cases, {len(tags)} sources {list(tags)}, {len(cues)} raw cues, "
          f"{len(vo_rows)} VO blocks, {sum(len(r[1].split()) for r in vo_rows)} words, "
          f"{sum(len(r[1]) for r in vo_rows)} chars")
    return 0


if __name__ == "__main__":
    sys.exit(main())
