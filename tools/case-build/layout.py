"""Lay a parsed cut sheet onto a sequence timeline and write the Premiere placement calls for pp-multi.

Inputs: job.json (cutsheet.py parse), the gap-cut narration dir (vo_gapcut.py: vo_NNN.wav + .cut.json), the sources
dir (fetch_sources.py: fetch.json), and optionally the project item ids (saved output of get_bin_contents /
search_project_items, raw JSON or pp-multi text; items are matched by mediaPath, never by name).

Timing rules (case-video references/rules.md):
  * CASE card slot 4.5 s (NocturnCaseCard, 135 f) before every case; --case-tail 0.4 s black before it.
  * Series title 4 s silent after the intro narration.
  * First word ~0.45 s after a card / title (--after-card).
  * Raw cue after narration: picture starts as the VO clip ends; its SOUND pre-rolls 1 s under the VO tail
    (--preroll), except after a card, a title or another cue, or when a bleep / hard_in falls in that second.
  * Next VO word 0.5-0.8 s after a raw cue ends (--vo-gap 0.65). VO after VO: --para-gap 0.30 s on top of the
    gap-cut head/tail.
  * Cue in/out are the SHEET times; scrub each cue against its transcript before trusting them (rules.md 4).

Tracks (defaults): raw picture V1 (track_index 0) with its sound on A1 (audio_track_index 0); narration on A2
(audio_track_index 1). Cards go on V2 picture-only later. VO spans in timeline.json are the B-roll holes.

Usage:
    python layout.py job.json --vo-dir VO_GAPCUT --src-dir SOURCES -o timeline.json
           [--ids bin.json] [--calls calls.json] [--cases 1-2] [--seq-fps 29.97002997003]
Then: node tools/pp-call/pp-multi.mjs @calls.json --max 1500   (from PROJECT; the batches are sequential)
"""
from __future__ import annotations
import argparse, json, math, re, sys, wave
from pathlib import Path

CARD_S, TITLE_S = 4.5, 4.0
MAX_OPS = 39                                  # batch_ops limit is 40; raw cues use 3 ops each
OUT_NUDGE = 0.005                             # memory: place out = in + dur + 0.005 (read back after the first batch)


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as w: return w.getnframes() / w.getframerate()


def load_ids(paths: list) -> dict:
    """mediaPath (normalised) -> nodeId from any saved tool output containing item objects."""
    ids = {}
    for p in paths:
        text = Path(p).read_text(encoding="utf-8", errors="replace")
        for m in re.finditer(r"\{[^{}]*\"nodeId\"[^{}]*\}", text):
            try: d = json.loads(m.group(0))
            except ValueError: continue
            if d.get("mediaPath"): ids[norm(d["mediaPath"])] = str(d["nodeId"])
    return ids


def norm(p: str) -> str:
    return str(p).replace("\\", "/").lower()


def case_filter(spec: str | None, job: dict) -> set:
    if not spec: return {c["id"] for c in job["cases"]} | {"intro", "outro"}
    nums = set()
    for part in spec.split(","):
        a, _, b = part.partition("-"); nums.update(range(int(a), int(b or a) + 1))
    keep = {c["id"] for c in job["cases"] if c["number"] in nums}
    if job["cases"] and job["cases"][-1]["id"] in keep: keep.add("outro")
    return keep


def build(job: dict, vo_dir: Path, src_dir: Path, a) -> dict:
    man = json.loads((src_dir / "fetch.json").read_text(encoding="utf-8")) if (src_dir / "fetch.json").exists() else {}
    keep = case_filter(a.cases, job)
    T = 1001 / 30000 if abs(a.seq_fps - 29.97002997003) < 1e-6 else 1 / a.seq_fps
    order = ["intro"] + [c["id"] for c in job["cases"]] + ["outro"]
    cases = {c["id"]: c for c in job["cases"]}
    t, prev, items, warn = 0.0, None, [], []
    for sec in order:
        if sec not in keep: continue
        blocks = [b for b in job["blocks"] if b["case_id"] == sec]
        if sec in cases:
            if prev is not None: t += a.case_tail
            items.append({"kind": "card", "id": f"card_{cases[sec]['number']:02d}", "case_id": sec,
                          "text": f"Case {cases[sec]['number']}", "start": round(t, 3), "end": round(t + a.card_s, 3)})
            t += a.card_s; prev = "card"
        for b in blocks:
            if b["kind"] == "vo":
                wav = vo_dir / f"{b['id']}.wav"
                if not wav.exists(): warn.append(f"{b['id']}: missing {wav}"); continue
                cut = vo_dir / f"{b['id']}.cut.json"
                lead = json.loads(cut.read_text()).get("first_word_s", a.head) if cut.exists() else a.head
                dur = wav_seconds(wav)
                start = {"raw": t + a.vo_gap - lead, "card": t + a.after_card - lead, "title": t + a.after_card - lead,
                         "vo": t + a.para_gap}.get(prev, t)
                start = max(start, t - lead if prev == "raw" else t)
                items.append({"kind": "vo", "id": b["id"], "case_id": sec, "file": str(wav.resolve()),
                              "in": 0.0, "out": round(dur, 3), "start": round(start, 3), "end": round(start + dur, 3),
                              "broll_hole": True})
                t = start + dur; prev = "vo"
            else:
                src = man.get(f"{b['tag']}.mp4") or next((v for k, v in man.items() if v.get("tag") == b["tag"]
                        and v.get("source_offset", 0) <= b["start"] and b["end"] <= v.get("source_offset", 0) + (v.get("duration") or 0)), None)
                if not src or src.get("status") not in ("ok", "present"):
                    warn.append(f"{b['id']}: no downloaded source for [{b['tag']}]"); src = src or {}
                off = src.get("source_offset", 0.0); fps = src.get("fps") or 30.0
                v_in, v_out = b["start"] - off, b["end"] - off
                hz = [x for x in b["flags"]["bleeps"] + ([b["flags"]["hard_in"]] if b["flags"]["hard_in"] else [])
                      if b["start"] - a.preroll <= x <= b["start"]]
                pre = a.preroll if prev == "vo" and not hz and v_in >= a.preroll else 0.0
                v_snap = math.floor(v_in * fps + 1e-6) / fps
                a_in = v_snap - pre
                pic = t
                items.append({"kind": "raw", "id": b["id"], "case_id": sec, "tag": b["tag"], "file": src.get("path"),
                              "src_fps": fps, "v_in": round(v_snap, 4), "v_out": round(v_out, 4), "a_in": round(a_in, 4),
                              "a_out": round(v_out, 4), "audio_start": round(pic - pre, 3), "start": round(pic, 3),
                              "end": round(pic + (v_out - v_snap), 3), "preroll": pre, "quote": b["quote"],
                              "flags": b["flags"], "scrub": "sheet times - scrub against the transcript"})
                if prev == "vo" and not pre: warn.append(f"{b['id']}: no pre-roll (hazard in the second before, or in < 1 s)")
                t = pic + (v_out - v_snap); prev = "raw"
        if sec == "intro" and prev is not None and a.title_s > 0:
            items.append({"kind": "title", "id": "series_title", "start": round(t, 3), "end": round(t + a.title_s, 3),
                          "note": "Premiere text, Stakes look, no sound"})
            t += a.title_s; prev = "title"
    return {"title": job.get("title"), "seq_fps": a.seq_fps, "frame_s": T, "duration": round(t, 3),
            "tracks": {"raw_video": a.raw_v, "raw_audio": a.raw_a, "narration_audio": a.vo_a},
            "items": items, "warnings": warn}


def calls(tl: dict, ids: dict, a) -> tuple:
    out, missing, ops_vo, ops_raw = [], [], [], []
    def nid(path):
        n = ids.get(norm(path or ""))
        if not n: missing.append(path)
        return n
    for it in tl["items"]:
        if it["kind"] == "vo" and (n := nid(it["file"])):
            ops_vo.append({"type": "place", "item_id": n, "in_seconds": 0, "out_seconds": round(it["out"] + OUT_NUDGE, 4),
                           "start_seconds": it["start"], "audio_track_index": a.vo_a})
        elif it["kind"] == "raw" and (n := nid(it["file"])):
            ops_raw += [{"type": "set_item_in_out", "item_id": n, "in_seconds": it["v_in"], "out_seconds": round(it["v_out"] + OUT_NUDGE, 4), "media_type": 1},
                        {"type": "set_item_in_out", "item_id": n, "in_seconds": it["a_in"], "out_seconds": round(it["a_out"] + OUT_NUDGE, 4), "media_type": 2},
                        {"type": "add_to_timeline", "item_id": n, "start_seconds": it["audio_start"],
                         "track_index": a.raw_v, "audio_track_index": a.raw_a}]
    if a.sequence_id: out.append({"tool": "set_active_sequence", "args": {"sequence_id": a.sequence_id}})
    for i in range(0, len(ops_vo), MAX_OPS):     # audio-only places always false-error: stop_on_error false, read back
        out.append({"tool": "batch_ops", "args": {"operations": ops_vo[i:i + MAX_OPS], "stop_on_error": False}})
    if a.sequence_id: out.append({"tool": "set_active_sequence", "args": {"sequence_id": a.sequence_id}})
    for i in range(0, len(ops_raw), MAX_OPS):
        out.append({"tool": "batch_ops", "args": {"operations": ops_raw[i:i + MAX_OPS]}})
    out.append({"tool": "get_track_info", "args": {"track_type": "audio", "track_index": a.vo_a}})
    out.append({"tool": "get_track_info", "args": {"track_type": "video", "track_index": a.raw_v}})
    return out, sorted(set(m for m in missing if m))


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="Cut sheet -> timeline.json (+ pp-multi placement calls)")
    ap.add_argument("job"); ap.add_argument("--vo-dir", required=True); ap.add_argument("--src-dir", required=True)
    ap.add_argument("-o", "--out", required=True); ap.add_argument("--ids", nargs="*", default=[])
    ap.add_argument("--calls", help="write pp-multi calls here (needs --ids)"); ap.add_argument("--sequence-id")
    ap.add_argument("--cases", help="e.g. 1-2 (review pass: first cases only; the intro is built last)")
    ap.add_argument("--seq-fps", type=float, default=29.97002997003)
    ap.add_argument("--preroll", type=float, default=1.0); ap.add_argument("--vo-gap", type=float, default=0.65)
    ap.add_argument("--para-gap", type=float, default=0.30); ap.add_argument("--after-card", type=float, default=0.45)
    ap.add_argument("--case-tail", type=float, default=0.40); ap.add_argument("--head", type=float, default=0.10)
    ap.add_argument("--raw-v", type=int, default=0); ap.add_argument("--raw-a", type=int, default=0)
    ap.add_argument("--vo-a", type=int, default=1)
    ap.add_argument("--card-s", type=float, default=CARD_S); ap.add_argument("--title-s", type=float, default=TITLE_S, help="0 = no series-title slot")
    a = ap.parse_args(argv)
    job = json.loads(Path(a.job).read_text(encoding="utf-8"))
    tl = build(job, Path(a.vo_dir), Path(a.src_dir), a)
    Path(a.out).write_text(json.dumps(tl, indent=1, ensure_ascii=False), encoding="utf-8")
    kinds = {k: sum(1 for i in tl["items"] if i["kind"] == k) for k in ("card", "vo", "raw", "title")}
    print(f"timeline {tl['duration']:.1f}s: {kinds}; {len(tl['warnings'])} warning(s) -> {a.out}")
    for w in tl["warnings"][:10]: print("  warn:", w)
    if a.calls:
        cl, missing = calls(tl, load_ids(a.ids), a)
        Path(a.calls).write_text(json.dumps(cl, indent=1), encoding="utf-8")
        print(f"{len(cl)} pp-multi calls -> {a.calls}" + (f"; {len(missing)} file(s) have no nodeId (import them first): {missing[:3]}" if missing else ""))
        if missing: return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
