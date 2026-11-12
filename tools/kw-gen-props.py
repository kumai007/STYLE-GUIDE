#!/usr/bin/env python3
"""Generate props/kw/<ID>.json for every KW FrameCircle / AudioWave composition by reading
the Remotion registrations (templates/src/Root.tsx). Adds durationInFrames (Remotion keeps it
on the Composition, HyperFrames needs it as a variable). Re-run if Root.tsx changes."""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parents[1]
src = (root.parent / "templates/src/Root.tsx").read_text(encoding="utf8")
pat = re.compile(r'<Composition id="(KW\d-[A-Za-z0-9]+)" component=\{(FrameCircle|AudioWave)\} durationInFrames=\{(\d+)\}[^>]*?defaultProps=\{\{(.*?)\}\} />', re.S)
out = root / "props/kw"; out.mkdir(parents=True, exist_ok=True)
n = {"FrameCircle": 0, "AudioWave": 0}
for cid, comp, dur, body in pat.findall(src):
    props = {}
    for k, v in re.findall(r'(\w+):\s*("[^"]*"|[-\d.]+)', body):
        props[k] = json.loads(v)
    props["durationInFrames"] = int(dur)
    if comp == "FrameCircle": props.setdefault("layer", "all")
    (out / f"{cid}.json").write_text(json.dumps(props) + "\n", encoding="utf8")
    n[comp] += 1
print(n)
