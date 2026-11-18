"""Stands in for `claude -p` in tests. Reads the prompt on stdin, answers per env FAKE_MODE."""
import json, os, sys, time
prompt = sys.stdin.read()
mode = os.environ.get("FAKE_MODE", "ok")
ans = {"summary": "Added a lighting rule.", "learning": "Keep faces half in shadow.",
       "ops": [{"op": "add_rule", "cat": "lighting", "text": "Faces half in shadow."}]}
if mode == "sleep":
    time.sleep(30)
if mode == "authfail":   # what the real CLI prints when its login has expired: exit 1, reason inside the JSON
    print(json.dumps({"type": "result", "subtype": "success", "duration_api_ms": 0, "total_cost_usd": 0, "is_error": True,
                      "result": "Failed to authenticate: OAuth session expired and could not be refreshed"}))
    sys.exit(1)
if mode == "learn":   # the learn prompt must list real image files (screenshots + video frames) and the item id
    import re
    imgs = re.findall(r"^- IMAGE: (.+?)  \(", prompt, re.M); item = re.search(r"^Item: (?:rule|rule book entry|motion graphic) (\S+)", prompt, re.M)
    if "LEARN FROM THIS EXAMPLE" not in prompt or len(imgs) < 2 or not all(os.path.isfile(p) for p in imgs) or not item:
        print(json.dumps({"type": "result", "is_error": False, "result": "bad learn prompt: " + repr(imgs)})); sys.exit(0)
    op = {"r": "edit_rule", "b": "edit_rulebook", "g": "edit_graphic"}[item.group(1)[0]]
    print(json.dumps({"type": "result", "is_error": False, "result": json.dumps(
        {"summary": f"Looked at {len(imgs)} images.", "learning": "The example shows crushed blacks.",
         "ops": [{"op": op, "id": item.group(1), "title": "Learned title", "text": "Learned text."}]})}))
    sys.exit(0)
text = {"ok": json.dumps(ans), "fenced": "Here you go:\n```json\n" + json.dumps(ans) + "\n```\nDone.",
        "junk": "I could not decide.", "badop": json.dumps({**ans, "ops": [{"op": "edit_rule", "id": "nope", "text": "x"}]}),
        "sleep": json.dumps(ans)}[mode]
if "NOTE FROM THE USER" not in prompt:
    text = "prompt missing the note"
print(json.dumps({"type": "result", "is_error": False, "result": text}))
