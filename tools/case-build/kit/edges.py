import json, re, sys
from pathlib import Path
D = Path(sys.argv[1])
cues = [  # id, json, first phrase, last phrase
 ("J1","NWC_437","i've been up","crunch crunch"),
 ("J2","NWC_463","it's not like","hear you"),
 ("J3","NWC_545","i'm just going","sleep tonight"),
 ("J4","NWC_619","good morning","behind my head"),
 ("L1","EWB_657","i don't remember","at the house"),
 ("L2","EWB_926","oh man","it's moving"),
 ("L3","EWB_1226","i just heard","us walking"),
 ("L4","EWB_1829","do you see","it was again"),
 ("L5","EWB_2127","did you hear","my truck"),
 ("L6","EWB_3156","jakey","heard that"),
]
n = lambda s: re.sub(r"[^a-z' ]", "", s.lower())
for cid, f, a, b in cues:
    w = json.load(open(D / f"{f}.json")); t = [n(x["w"]) for x in w]
    def find(ph, last=False):
        p = ph.split(); idx = [i for i in range(len(t) - len(p) + 1) if t[i:i + len(p)] == p]
        return (idx[-1] + len(p) - 1) if last else idx[0]
    try: i, j = find(a), find(b, True)
    except IndexError: print(cid, "NOT FOUND", " ".join(t)); continue
    pv = w[i-1]["e"] if i else None; nx = w[j+1]["s"] if j + 1 < len(w) else None
    print(f"{cid}: prev_end {pv}  first {w[i]['w']}@{w[i]['s']}  last {w[j]['w']}@{w[j]['e']}  next {nx}")
