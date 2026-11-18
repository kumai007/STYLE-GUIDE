import json, sys
w = json.load(open(sys.argv[1])); 
for a, b in zip(sys.argv[2::2], sys.argv[3::2]):
    a, b = float(a), float(b); print(f"--- {a}-{b}")
    print(" ".join(f"{x['w']}[{x['s']:.2f}-{x['e']:.2f}]" for x in w if a <= x['s'] <= b))
