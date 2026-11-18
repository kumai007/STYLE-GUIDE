"""Plan one Encounters case end to end: cue edges, baked raw audio, captions, timeline, B-roll picks, graphics windows.
usage: python -I case_plan.py VIDEO_DIR CASE_ID [--stage cues|layout|all] [--force]
  VIDEO_DIR = RL-EDIT/juan-stealth etc.  Writes VIDEO_DIR/build/<case>/plan.json (+ audio/cNN_rawK.wav, graphics/cNN_captions.srt).

Inputs: job.json (cutsheet.py), narration/tight/vo_NNN_t.wav + .cuts.json and narration/cut/vo_NNN.words.json (Phantom-tight
VO), qa/tx/<TAG>.json (whisper words of the source), qa/measure/<TAG>.json (eye.py measure shots), build/<case>/graphics.json
(hand-written: which nouns get a map / plate / stamp; optional).

Rules carried from C01 (memory juan-lucas-encounters-build, shot-length-continuity-rules, Ayush's trims 2026-10-25):
  * card 0-4.5 s, first VO word 0.45 s after it; raw picture starts on the VO end with 1 s of its sound under the VO tail;
    next VO word 0.65 s after the raw ends; VO after VO +0.30 s.
  * raw audio baked to ~-21.5 LUFS (C01 measured -21.0..-23.7), alimiter 0.75, 1 s fade in under the VO, 0.12 s out;
    bleeps = 1 kHz tone over the word, '****' in the captions.
  * a graphic starts ON its noun and ends 1 frame after the next clause's first word starts; footage takes the rest.
  * footage shots 4-5 s minimum, cut only on a sentence (topic) boundary, never across a measured source cut.
"""
import json, math, re, subprocess, sys, wave
from pathlib import Path
import numpy as np

FR = 1001 / 30000
TARGET_LUFS, LIMIT = -21.5, 0.75
CARD_S, AFTER_CARD, PREROLL, VO_GAP, PARA_GAP, CASE_TAIL = 4.5, 0.45, 1.0, 0.65, 0.30, 0.40
MIN_SHOT, GOOD_SHOT, MAX_SHOT = 4.0, 5.5, 11.0
STRONG = re.compile(r"^(fuck\w*|motherfuck\w*|shit\w*|bullshit|bitch\w*|asshole\w*|cunt\w*|dick\w*|bastard\w*|goddamn\w*|"
                    r"piss\w*|wank\w*|twat\w*|bollocks|prick\w*|cock\w*|slut\w*|whore\w*|fag\w*|nigg\w*|retard\w*)$", re.I)
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())


def mmss(t):
    p = [float(x) for x in t.split(":")]
    return p[0] * 3600 + p[1] * 60 + p[2] if len(p) == 3 else p[0] * 60 + p[1]


def wav_s(p):
    with wave.open(str(p)) as w: return w.getnframes() / w.getframerate()


# ---------------------------------------------------------------- cue edges
def sent_starts(W):
    """indices of words that begin a phrase: after . ? ! or a gap > 0.6 s."""
    return [i for i in range(len(W)) if i == 0 or re.search(r"[.?!]$", W[i - 1]["w"]) or W[i]["s"] - W[i - 1]["e"] > 0.6]


def find_phrase(W, phrase, near, span=30):
    toks = [norm(x) for x in phrase.split() if norm(x)]
    best = None
    for i, w in enumerate(W):
        if abs(w["s"] - near) > span: continue
        if all(i + k < len(W) and norm(W[i + k]["w"]) == t for k, t in enumerate(toks)):
            if best is None or abs(w["s"] - near) < abs(W[best]["s"] - near): best = i
    if best is None and len(toks) >= 3:  # whisper often mishears the leading pronoun ("he" -> "you"): match the rest
        k = find_phrase(W, " ".join(toks[1:]), near, span)
        if k: best = k - 1
    return best


def cue_edges(b, W):
    """sheet start/end -> word-snapped in/out honouring hard_in/hard_out and the review notes."""
    S, E, fl = b["start"], b["end"], b["flags"]
    lo = fl["hard_in"] if fl["hard_in"] is not None else -1e9
    hi = fl["hard_out"] if fl["hard_out"] is not None else 1e9
    if fl["hard_in"] is not None and fl["hard_in"] < S - 0.01: lo = fl["hard_in"] + 0.5
    if fl["hard_out"] is not None and fl["hard_out"] > E + 0.01: hi = fl["hard_out"] - 0.3
    start_on = out_after = None
    for r in fl["review"]:
        m = re.search(r"in the gap around\s+~?(\d+:\d\d(?::\d\d)?)[^\d]+(\d+:\d\d(?::\d\d)?)", r, re.I)
        if m: S, E = mmss(m.group(1)), mmss(m.group(2)); lo, hi = S - 0.2, E + 0.3   # the reviewer moved the cue
        for m in re.finditer(r"(?:out by|cut before|end(?:s)? before)\s+~?(\d+:\d\d(?::\d\d)?)", r, re.I): hi = min(hi, mmss(m.group(1)) - 0.25)
        m = re.search(r"start(?: at)?\s+~?(\d+:\d\d(?::\d\d)?)", r, re.I)
        if m: lo = max(lo, mmss(m.group(1)) - 0.2)
        m = re.search(r"start on [\"“](.+?)[\"”]", r, re.I)
        if m: start_on = m.group(1)
        m = re.search(r"out right after [\"“](.+?)[\"”]", r, re.I)
        if m: out_after = m.group(1)
    if fl.get("out_after"): out_after = fl["out_after"]
    note = []
    inside = [w for w in W if S - 4 <= w["s"] <= E + 4]
    if not inside: return max(S, lo), min(E, hi), ["no transcript words near the cue: sheet times kept"]
    # in
    i_in = None
    if start_on and (k := find_phrase(W, start_on, S, 40)) is not None: i_in = k; note.append(f"in on '{start_on}'")
    if i_in is None:
        cand = [i for i in sent_starts(W) if S - 2.5 <= W[i]["s"] <= S + 1.5 and W[i]["s"] >= lo]
        if cand: i_in = min(cand, key=lambda i: abs(W[i]["s"] - S))
        else:
            nx = [i for i, w in enumerate(W) if w["s"] >= max(S - 0.3, lo)]
            i_in = nx[0] if nx else None
    t_in = S if i_in is None else max(W[i_in]["s"] - 0.15, (W[i_in - 1]["e"] + 0.03) if i_in else 0, lo)
    if i_in is not None and W[i_in]["s"] - S > 3: t_in = max(S, lo); note.append("first word >3 s after sheet in: sheet in kept")
    # out
    i_out = None
    if out_after and (k := find_phrase(W, out_after, E, 25)) is not None:
        i_out = k + len(out_after.split()) - 1; note.append(f"out after '{out_after}'")
    if i_out is None:
        ends = [i for i in range(len(W)) if (re.search(r"[.?!]$", W[i]["w"]) or (i + 1 < len(W) and W[i + 1]["s"] - W[i]["e"] > 0.6))
                and E - 2.5 <= W[i]["e"] <= E + 1.5 and W[i]["e"] <= hi]
        if ends: i_out = min(ends, key=lambda i: abs(W[i]["e"] - E))
        else:
            pv = [i for i, w in enumerate(W) if w["e"] <= min(E + 0.3, hi) and w["s"] >= t_in]
            i_out = pv[-1] if pv else None
    t_out = E if i_out is None else W[i_out]["e"] + 0.25
    if i_out is not None and i_out + 1 < len(W): t_out = min(t_out, W[i_out + 1]["s"] - 0.05)
    t_out = min(t_out, hi)
    if t_out - t_in < 4: t_in, t_out = max(S, lo), min(E, hi); note.append("snapped cue <4 s: sheet times kept")
    return round(t_in, 3), round(t_out, 3), note


def bleep_spans(b, W, t_in, t_out):
    sp = []
    for bt in b["flags"]["bleeps"]:
        near = [w for w in W if abs(w["s"] - bt) <= 2.5 and STRONG.match(norm(w["w"]))]
        if near: w = min(near, key=lambda w: abs(w["s"] - bt)); sp.append((w["s"] - 0.04, w["e"] + 0.04, "flag"))
        else: sp.append((bt - 0.25, bt + 0.35, "flag-untimed"))
    for w in W:                                           # strong words the sheet missed
        if t_in <= w["s"] < t_out and STRONG.match(norm(w["w"])) and not any(a - 0.1 <= w["s"] <= c + 0.1 for a, c, _ in sp):
            sp.append((w["s"] - 0.04, w["e"] + 0.04, "auto:" + norm(w["w"])))
    return sorted((round(a, 3), round(c, 3), k) for a, c, k in sp if c > t_in and a < t_out)


def loudness(src, a, b):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", str(src), "-vn",
                        "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", r)
    return float(m[-1]) if m else -30.0


def bake(src, a_in, t_out, pre, spans, out_wav):
    L = t_out - a_in
    gain = max(-10.0, min(20.0, TARGET_LUFS - loudness(src, a_in + pre, t_out)))
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-ss", f"{a_in:.4f}", "-t", f"{L:.4f}", "-i", str(src), "-vn",
                          "-ac", "2", "-ar", "48000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).reshape(-1, 2).copy() * (10 ** (gain / 20))
    n = len(x); t = np.arange(n) / 48000
    for a, c, _ in spans:
        i0, i1 = max(0, int((a - a_in) * 48000)), min(n, int((c - a_in) * 48000))
        if i1 <= i0: continue
        r = min(240, (i1 - i0) // 2); env = np.ones(i1 - i0); env[:r] = np.linspace(1, 0, r); env[-r:] = np.linspace(0, 1, r)
        x[i0:i1] *= env[:, None]
        tone = 0.25 * np.sin(2 * np.pi * 1000 * t[i0:i1]) * (1 - env)
        x[i0:i1] += tone[:, None]
    fi = int((pre if pre > 0 else 0.03) * 48000); x[:fi] *= np.linspace(0, 1, fi)[:, None]
    fo = int(0.12 * 48000); x[-fo:] *= np.linspace(1, 0, fo)[:, None]
    p = subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-f", "f32le", "-ar", "48000", "-ac", "2", "-i", "-",
                        "-af", f"alimiter=limit={LIMIT}:level=0", "-c:a", "pcm_s16le", str(out_wav)], input=x.astype(np.float32).tobytes())
    assert p.returncode == 0, out_wav
    return round(gain, 2)


# ---------------------------------------------------------------- narration words (tight time)
def vo_words(V, vid):
    w = json.load(open(V / "narration/cut" / f"{vid}.words.json", encoding="utf-8"))["words"]
    cuts = json.load(open(V / "narration/tight" / f"{vid}_t.cuts.json"))["cuts"]
    tt = lambda t: t - sum(min(b, t) - a for a, b in cuts if a < t)
    return [{"w": x["w"], "s": round(tt(x["start"]), 3), "e": round(tt(x["end"]), 3)} for x in w]


def clauses(words):
    """sentence list [(i0, i1)] and clause starts (index of first word after , ; : . ? ! —)."""
    sents, s0 = [], 0
    for i, w in enumerate(words):
        if re.search(r"[.?!][\"”']?$", w["w"]) or i == len(words) - 1: sents.append((s0, i)); s0 = i + 1
    cl = [0] + [i + 1 for i, w in enumerate(words[:-1]) if re.search(r"[,;:.?!—–][\"”']?$", w["w"])]
    return sents, cl


def main():
    V, case = Path(sys.argv[1]), sys.argv[2]
    stage = sys.argv[sys.argv.index("--stage") + 1] if "--stage" in sys.argv else "all"
    force = "--force" in sys.argv
    job = json.load(open(V / "job.json", encoding="utf-8"))
    cmeta = next((c for c in job["cases"] if c["id"] == case), {"id": case, "number": 0, "name": case.upper(), "tags": []})
    num = cmeta["number"]; P = f"c{num:02d}" if num else case
    B = V / "build" / case; B.mkdir(parents=True, exist_ok=True)
    blocks = [b for b in job["blocks"] if b["case_id"] == case]
    plan_p = B / "plan.json"
    plan = json.load(open(plan_p)) if plan_p.exists() and not force else {}
    plan.update({"case": case, "number": num, "name": cmeta["name"], "prefix": P})
    TX = {}
    def tx(tag):
        if tag not in TX: TX[tag] = json.load(open(V / "qa/tx" / f"{tag}.json", encoding="utf-8"))
        return TX[tag]

    # ---- stage cues: edges, bleeps, bake, captions
    if stage in ("cues", "all") and ("cues" not in plan or force):
        cues, k = [], 0
        prev_kind = "card" if num else None
        for b in blocks:
            if b["kind"] != "raw": prev_kind = "vo"; continue
            k += 1; W = tx(b["tag"]); src = V / "sources" / f"{b['tag']}.mp4"
            t_in, t_out, note = cue_edges(b, W)
            hz = [x for x in b["flags"]["bleeps"] + ([b["flags"]["hard_in"]] if b["flags"]["hard_in"] else []) if t_in - PREROLL <= x <= t_in]
            pre = PREROLL if prev_kind == "vo" and not hz and t_in >= PREROLL else 0.0
            spans = bleep_spans(b, W, t_in, t_out)
            wav = V / "audio" / f"{P}_raw{k}.wav"; wav.parent.mkdir(exist_ok=True)
            gain = bake(src, t_in - pre, t_out, pre, spans, wav)
            cues.append({"id": b["id"], "k": k, "tag": b["tag"], "sheet": [b["start"], b["end"]], "in": t_in, "out": t_out, "pre": pre,
                         "wav": str(wav), "gain_db": gain, "bleeps": spans, "cover": b["flags"]["cover"], "quote": b["quote"],
                         "note": note, "review": b["flags"]["review"],
                         "text": " ".join(w["w"] for w in W if t_in <= w["s"] < t_out)})
            prev_kind = "raw"
            print(f"{b['id']} {b['tag']} sheet {b['start']:.1f}-{b['end']:.1f} -> {t_in:.2f}-{t_out:.2f} ({t_out - t_in:.1f}s) pre {pre} gain {gain:+.1f} bleeps {len(spans)} {'; '.join(note)}")
        plan["cues"] = cues
        json.dump(plan, open(plan_p, "w"), indent=1)

    # ---- stage layout: timeline items + B-roll + graphics
    if stage in ("layout", "all"):
        import case_layout
        case_layout.layout(V, case, plan, blocks, vo_words, clauses, tx)
        json.dump(plan, open(plan_p, "w"), indent=1)


if __name__ == "__main__":
    sys.path.insert(0, str(Path(__file__).parent)); main()
