#!/usr/bin/env python3
"""Find claude clips on the Farrell board to use as rule evidence. Read-only.

    python styleguide/tools/find_clips.py WORD [WORD ...] [--tag TAG] [--prod 03] [-n 8]

Prints one line per clip: id, video, frames, seconds, tags, title. Every WORD must appear in the title, note or tags.
"""
import argparse, json
from pathlib import Path

BOARD = Path(__file__).resolve().parents[2] / "productions" / "_boards" / "farrell.json"


def search(nodes, words=(), tag=None, prod=None):
    out = []
    for n in nodes:
        if "sf_in" not in n or "claude" not in n.get("tags", []): continue
        if tag and tag not in n["tags"]: continue
        if prod and not n.get("src", "").startswith(f"farrell-{prod}"): continue
        hay = " ".join([n.get("title", ""), n.get("note", ""), " ".join(n["tags"])]).lower()
        if all(w.lower() in hay for w in words): out.append(n)
    return out


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("words", nargs="*"); ap.add_argument("--tag"); ap.add_argument("--prod")
    ap.add_argument("-n", type=int, default=8); a = ap.parse_args()
    nodes = json.loads(BOARD.read_text(encoding="utf-8"))["nodes"]
    hits = search(nodes, a.words, a.tag, a.prod)
    for n in hits[:a.n]:
        fps = n["fps"][0] / n["fps"][1] if isinstance(n.get("fps"), list) else 29.97
        tags = ",".join(t for t in n["tags"] if t != "claude")
        print(f'{n["id"]}  v{n["src"][8:10]}  {n["sf_in"]}-{n["sf_out"]}  {(n["sf_out"] - n["sf_in"] + 1) / fps:5.1f}s  [{tags}]  {n.get("title", "")[:70]}')
    print(f"({len(hits)} matches)")


if __name__ == "__main__":
    main()
