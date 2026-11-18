"""Run once after unzipping (and again if you move the folder):  python setup_paths.py
Rewrites the original Mac paths inside the tools/engine/docs to this machine's paths:
  /Users/ekam/Downloads/Iceberg  -> <this folder>/Iceberg
  /opt/homebrew/bin/blender      -> your Blender (found on PATH or in Program Files), override with --blender PATH
  /private/tmp/claude-501, /tmp/claude-501 -> <this folder>/scratch
Text files only (.sh .py .mjs .ts .tsx .md .json .txt .csv); binaries are never touched."""
import os, sys, shutil, glob, re
root = os.path.dirname(os.path.abspath(__file__)).replace("\\", "/")
ice = root + "/Iceberg"; scratch = root + "/scratch"; os.makedirs(scratch, exist_ok=True)
blender = None
if "--blender" in sys.argv: blender = sys.argv[sys.argv.index("--blender") + 1]
blender = blender or shutil.which("blender") or next(iter(sorted(glob.glob("C:/Program Files/Blender Foundation/Blender*/blender.exe"))), None) or "blender"
blender = blender.replace("\\", "/")
REP = [("/Users/ekam/Downloads/Iceberg", ice), ("/opt/homebrew/bin/blender", blender),
       ("/private/tmp/claude-501", scratch), ("/tmp/claude-501", scratch), ("/tmp/iceberg_render_slots", scratch + "/render_slots")]
n = 0
for dp, dn, fn in os.walk(ice):
    if "node_modules" in dp: continue
    for f in fn:
        if not f.endswith((".sh", ".py", ".mjs", ".ts", ".tsx", ".md", ".json", ".txt", ".csv")): continue
        p = os.path.join(dp, f)
        try: s = open(p, encoding="utf-8").read()
        except Exception: continue
        pat = re.compile("|".join(re.escape(a) for a, _ in REP)); m = dict(REP)
        t = pat.sub(lambda x: m[x.group(0)], s)  # one pass: a replaced path is never rewritten again
        if t != s: open(p, "w", encoding="utf-8", newline="\n").write(t); n += 1
# per-case public dirs are symlinks on the Mac; recreate them with newcase.sh when you build a case
print(f"updated {n} files; Iceberg root = {ice}; blender = {blender}; scratch = {scratch}")
