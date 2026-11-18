"""Raw-cue captions -> SRT in sequence time.
usage: capsrt.py WORDS.json OUT.srt off:a:b [off:a:b ...]   (TL = src - off; only words starting in [a,b) source seconds)"""
import json, sys
words = json.load(open(sys.argv[1], encoding="utf-8")); out = sys.argv[2]
MAXC, MAXD, GAP = 42, 4.5, 0.5
def ts(t):
    ms = round(t * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"
cues = []
for spec in sys.argv[3:]:
    off, a, b = map(float, spec.split(":"))
    ws = [w for w in words if a - 0.15 <= w["s"] < b]
    cur = []
    for w in ws:
        txt = " ".join(x["w"] for x in cur + [w])
        if cur and (len(txt) > MAXC or w["s"] - cur[0]["s"] > MAXD or w["s"] - cur[-1]["e"] > GAP):
            cues.append((cur, off, b, a)); cur = []
        cur.append(w)
        if w["w"][-1:] in ".?!": cues.append((cur, off, b, a)); cur = []
    if cur: cues.append((cur, off, b, a))
rows = []
a_of = [q[3] for q in cues]
for i, (c, off, b, _a) in enumerate(cues):
    s = max(c[0]["s"], a_of[i]) - off; e = min(c[-1]["e"] + 0.15, b) - off
    if i + 1 < len(cues): e = min(e, cues[i + 1][0][0]["s"] - cues[i + 1][1] - 0.034)
    e = max(e, s + 0.8)
    if i + 1 < len(cues): e = min(e, cues[i + 1][0][0]["s"] - cues[i + 1][1] - 0.034)
    rows.append(f"{len(rows)+1}\n{ts(s)} --> {ts(e)}\n{' '.join(x['w'] for x in c).replace(' -', '-')}\n")
open(out, "w", encoding="utf-8").write("\n".join(rows))
print(len(rows), "cues"); print("\n".join(rows[:3])); print(rows[-1])
