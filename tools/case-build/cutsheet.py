"""Parse a Markdown case cut sheet into job.json, and write the narration lines for algrow-voice.

Ported from the retired case_video_workflow (cvw/jobspec.py, parse_job + _flags), job framework removed.

Sheet format (case-video skill):
    ## INTRO                      narration paragraphs, no cues
    ## CASE 01 · NAME · place
    [TAG] <https://...>           the source for this tag (the tag -> URL map lives in the sheet itself)
    narration paragraph           one paragraph = one VO block (vo_001, vo_002, ...)
    ▶ RAW · [TAG] 12:03–12:19 · "verbatim quote" · ~16s · flags
    ## OUTRO

Usage:
    python cutsheet.py parse  SHEET.md [--vo VO.md] -o job.json   # --vo checks the script matches paragraph by paragraph
    python cutsheet.py vo-csv SHEET.md -o vo_lines.csv            # id,text for: algrow_voice.py batch vo_lines.csv
    python cutsheet.py summary SHEET.md                           # cases, sources, cue count, VO characters
"""
from __future__ import annotations
import argparse, csv, json, re, sys
from pathlib import Path

DASH = r"[–—-]"
TC = r"\d{1,2}(?::\d{2}){1,2}(?:\.\d+)?"
CUE_RE = re.compile(rf"^▶\s*RAW\s*·\s*\[(?P<tag>[A-Z0-9]+)\]\s*(?P<a>{TC})\s*{DASH}\s*(?P<b>{TC})\s*·\s*(?:[\"“](?P<q>.*?)[\"”]|\[visual:\s*(?P<vis>.*?)\](?=\s*(?:·|\(|$)))\s*(?:\((?P<qnote>[^)]*)\)\s*)?(?:·\s*~(?P<len>\d+(?:\.\d+)?)s)?\s*(?:·\s*(?P<notes>.*))?$")
CASE_RE = re.compile(r"^##\s*CASE\s+(?P<n>\d+)\s*·\s*(?P<name>[^·]+?)\s*(?:·\s*(?P<loc>.*))?$")
SRC_RE = re.compile(r"^\[(?P<tag>[A-Z0-9]+)\]\s*<?(?P<url>https?://[^>\s]+)>?\s*$")


class CutSheetError(ValueError):
    pass


def parse_timecode(s: str) -> float:
    total = 0.0
    for p in s.strip().split(":"): total = total * 60 + float(p)
    return total


_OUT_BOUND = re.compile(r"\b(?:end|out)(?:[- ]point|\s+clip)?\s+before\b", re.I)
_IN_BOUND = re.compile(r"\b(?:start|in[- ]point)\b[^.;]*?\bafter\b", re.I)
_OUT_AFTER = re.compile(r"\bout after\s+[\"“](?P<p>[^\"”]+)[\"”]", re.I)
_MUTE_SAY = re.compile(r"\bmute\s+[\"“](?P<p>[^\"”]+)[\"”]", re.I)
_WORD = lambda w: re.compile(rf"\b{w}\b", re.I)
_BLEEP, _MUTE, _COVER, _SCRUB = _WORD("bleep"), _WORD("mute"), _WORD("cover"), _WORD("scrub")


def flags(notes: str) -> dict:
    """Cue notes -> flags. hard_in/hard_out: hazard times the edge must stay inside. bleeps/mutes: times inside the
    cue. cover: raw audio over other footage. Notes that set nothing go to `review` so a human reads them."""
    f = {"hard_in": None, "hard_out": None, "bleeps": [], "mutes": [], "mute_words": [], "cover": False,
         "scrub": False, "out_after": None, "review": []}
    if not notes: return f
    for part in re.split(r"\s*[·;]\s*", notes):
        p = part.strip().lstrip("⚠").strip()
        if not p: continue
        up, used = p.upper(), False
        tcs = [parse_timecode(t) for t in re.findall(rf"(?<![\d:]){TC}", p)]
        if up.startswith("BLEEP") and tcs: f["bleeps"] += tcs; used = True
        elif tcs and _OUT_BOUND.search(p):
            f["hard_out"] = min(tcs + ([f["hard_out"]] if f["hard_out"] is not None else [])); used = True
        elif tcs and _IN_BOUND.search(p):
            f["hard_in"] = max(tcs + ([f["hard_in"]] if f["hard_in"] is not None else [])); used = True
        elif _BLEEP.search(p) and tcs: f["bleeps"] += tcs; used = True
        elif _MUTE.search(p) and tcs: f["mutes"] += tcs; used = True
        m = _OUT_AFTER.search(p)
        if m: f["out_after"] = m.group("p").strip(); used = True
        if _COVER.search(p): f["cover"] = used = True
        if _SCRUB.search(p): f["scrub"] = used = True
        say = [m.group("p").strip() for m in _MUTE_SAY.finditer(p)]
        if say: f["mute_words"] += say; used = True
        elif _MUTE.search(p) and not tcs: used = False
        if not used or up.startswith(("CAPTION", "AUDIO")): f["review"].append(p)
    return f


def _norm(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()


def parse(sheet_text: str, vo_text: str | None = None) -> dict:
    job = {"title": "", "sources": {}, "cases": [], "blocks": []}
    section, vo_n, cue_n = None, 0, 0
    for raw in sheet_text.splitlines():
        t = raw.strip()
        if not t or set(t) <= {"-"}: continue
        if t.startswith("# ") and not job["title"]: job["title"] = t[2:].strip(); continue
        if t.startswith("**"): continue                      # **EDITOR FLAGS.** / **CUT SHEET.** prose
        m = CASE_RE.match(t)
        if m:
            n = int(m.group("n")); section = f"case_{n:02d}"
            job["cases"].append({"id": section, "number": n, "name": m.group("name").strip(),
                                 "location": (m.group("loc") or "").strip(), "tags": []})
            continue
        if re.match(r"^##\s*OUTRO\b", t, re.I): section = "outro"; continue
        if re.match(r"^##\s*INTRO\b", t, re.I): section = "intro"; continue
        if t.startswith("#"): continue
        m = SRC_RE.match(t)
        if m:
            tag = m.group("tag")
            if section is None: raise CutSheetError(f"source [{tag}] outside a case")
            job["sources"][tag] = {"tag": tag, "url": m.group("url"), "case_id": section}
            if section in ("intro", "outro"): job.setdefault(f"{section}_tags", []).append(tag)  # intro/outro stings
            else: job["cases"][-1]["tags"].append(tag)
            continue
        if t.startswith("▶"):
            m = CUE_RE.match(t)
            if not m: raise CutSheetError(f"unparseable cue line: {t[:120]}")
            a, b = parse_timecode(m.group("a")), parse_timecode(m.group("b"))
            if b <= a: raise CutSheetError(f"cue end {m.group('b')} is not after start {m.group('a')}: {t[:80]}")
            cue_n += 1
            translated = "translat" in (m.group("qnote") or "").lower()
            job["blocks"].append({"kind": "raw", "id": f"cue_{cue_n:02d}", "case_id": section, "tag": m.group("tag"),
                                  "start": a, "end": b, "quote": (m.group("q") if m.group("q") is not None else m.group("vis")).strip(),
                                  "visual": m.group("q") is None, "translated": translated,
                                  "approx_seconds": float(m.group("len")) if m.group("len") else None,
                                  "notes": (m.group("notes") or "").strip(), "flags": flags(m.group("notes") or "")})
            continue
        if section is None: continue                         # preamble prose
        vo_n += 1
        job["blocks"].append({"kind": "vo", "id": f"vo_{vo_n:03d}", "case_id": section, "text": _norm(t)})
    for b in job["blocks"]:
        if b["kind"] == "raw" and b["tag"] not in job["sources"]:
            raise CutSheetError(f"{b['id']} uses [{b['tag']}] but no '[{b['tag']}] <url>' line declares it")
    for c in job["cases"]:
        if not c["tags"]: raise CutSheetError(f"CASE {c['number']:02d} ({c['name']}) has no [TAG] <url> source line")
    if vo_text is not None:
        vo = [_norm(p) for p in re.split(r"\n\s*\n", vo_text) if p.strip() and not p.lstrip().startswith("#")]
        sheet = [b["text"] for b in job["blocks"] if b["kind"] == "vo"]
        for i, (a, b) in enumerate(zip(sheet, vo), start=1):
            if a != b: raise CutSheetError(f"VO script differs from the sheet at paragraph {i}: sheet={a[:60]!r} vo={b[:60]!r}")
        if len(sheet) != len(vo): raise CutSheetError(f"VO script has {len(vo)} paragraphs, the sheet has {len(sheet)}")
    return job


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    sub = ap.add_subparsers(dest="cmd", required=True)
    p = sub.add_parser("parse"); p.add_argument("sheet"); p.add_argument("--vo"); p.add_argument("-o", "--out", required=True)
    v = sub.add_parser("vo-csv"); v.add_argument("sheet"); v.add_argument("-o", "--out", required=True)
    s = sub.add_parser("summary"); s.add_argument("sheet")
    a = ap.parse_args(argv)
    try:
        job = parse(Path(a.sheet).read_text(encoding="utf-8"),
                    Path(a.vo).read_text(encoding="utf-8") if getattr(a, "vo", None) else None)
    except CutSheetError as e:
        print(f"cut sheet error: {e}", file=sys.stderr); return 1
    vos = [b for b in job["blocks"] if b["kind"] == "vo"]
    cues = [b for b in job["blocks"] if b["kind"] == "raw"]
    if a.cmd == "parse":
        Path(a.out).write_text(json.dumps(job, indent=1, ensure_ascii=False), encoding="utf-8")
    elif a.cmd == "vo-csv":
        with open(a.out, "w", encoding="utf-8", newline="") as fh:
            w = csv.writer(fh); w.writerow(["id", "text"]); w.writerows([b["id"], b["text"]] for b in vos)
    print(f"{job['title'] or '(untitled)'}: {len(job['cases'])} cases, {len(job['sources'])} sources, "
          f"{len(cues)} raw cues ({sum(c['end'] - c['start'] for c in cues):.0f}s), {len(vos)} VO blocks "
          f"({sum(len(b['text']) for b in vos)} chars = Algrow cost)")
    if a.cmd == "summary":
        for c in job["cases"]:
            n = sum(1 for b in cues if b["case_id"] == c["id"])
            print(f"  CASE {c['number']:02d} {c['name']} [{', '.join(c['tags'])}] {n} cues")
        review = [(b["id"], r) for b in cues for r in b["flags"]["review"]]
        if review: print(f"  {len(review)} cue notes need a human read (flags.review), e.g. {review[0][0]}: {review[0][1][:80]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
