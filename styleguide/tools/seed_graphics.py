"""Add the starting Motion graphics list to farrell.json (once). Examples are board clips, copied frame-exact.

Run: python styleguide/tools/seed_graphics.py   (skips if the guide already has graphics; --force adds them again)
Facts come from the five Farrell references (style_guide.md section 7, MOTION_GRAPHICS_INVENTORY.md, board tag counts).
"""
import json, sys
from pathlib import Path
HERE = Path(__file__).resolve().parent; SG = HERE.parent; ROOT = SG.parent
sys.path.insert(0, str(SG))
import model as M
from server import clip_label

SUMMARY = ("Every built device shows a real artifact: a page, a date, a place, a URL, a comment. "
           "Devices enter on a hard cut (0 frames) and ride the shot's own slow linear push. "
           "Never: kinetic typography, burned captions or word pops, particles, light leaks, charts or counters, "
           "tracked graphics, 3D objects, invented infographics.")

# (title, kind, use, avoid, looks like, [board clip ids])
GFX = [
    ("Page plane", "page-3d",
     "The narration talks about a web page, article, blog, forum post, channel page or document, and the viewer should see it is real.",
     "The page is a video player you are about to play (use Video in its page). Do not use it for a stock photo.",
     "Screenshot of the real page on a 3D-angled plane. Edge depth-of-field blur and a vignette. Linear push-in +2.3..+7.3 %/s (typical +5), or tilt down -10..-17 %H/s to read a long page. Wide first, then a macro on the line that matters. Median 8.4 s (2.3-36.7 s).",
     ["c1a1b9405751430e", "c1a1b9caa44ac226", "c1a1b9cb071264e0", "c1a1b9d04bf512db"]),
    ("Line highlight", "page-3d",
     "The VO quotes or names one line, number or word that is visible on a page.",
     "The line is not read or named in the VO. Never more than one line at a time.",
     "Pale yellow box (#DCD896, multiply blend) over the read line. It grows from the line centre outward over 14 frames (power1.inOut), starting 0.25 s before the quoted words. Rides the page plane's push.",
     ["c1a1ac1beadd68cb", "c1a1b9cb0713635b", "c1a1b9cde6fecb6f", "c1a1b9d122c2b5a5"]),
    ("Video in its page", "page-3d",
     "You introduce a found video: show it playing inside its original platform page (YouTube, archive, forum) before you cut to it full screen.",
     "The video is already introduced. Then play it raw and full screen.",
     "The watch page on an angled plane with the video playing in its player. Linear push about +5.5 %/s toward the player or the view count. Vignette, soft edges.",
     ["c1a1b940575597e2", "c1a1b9ca0a6b10c3", "c1a1b9caa44b0f4f"]),
    ("Comment card", "comments",
     "The VO reads what users said, or shows that real people saw and reacted to the thing.",
     "Only one vague comment adds nothing. Do not invent or retype comments; show the real ones.",
     "One comment per shot: a real comment box on black, or sliding up over the blurred page it came from. A run of the same layout reads as a list. Hard cuts between comments. Slow scroll for a thread. Median 8.4 s.",
     ["c1a1b9d2feeb2751", "c1a1b9caa44bda5d", "c1a1b9cb07125400", "c1a1aca65f10f952"]),
    ("Year / chapter title", "title-card",
     "The VO says a year or date, the story jumps in time, or a new chapter starts.",
     "The date is already on the page being shown. Not for names of people (use Source label).",
     "Big gold or red serif word or year over a blurred freeze of the previous shot, or white monospace on a black bar. Fades or rises in, then rides the push. Median 2.7 s (1.6-8.4 s).",
     ["c1a1b9405756f6eb", "c1a1b9d04bf5a911", "c1a1b9ca0a6b2a18"]),
    ("Mono label over blur", "title-card",
     "You name the exact thing on screen: a file name, a video title, a username, or a translation of foreign text.",
     "The text is already readable and in English on the page.",
     "White monospace type on a black box rises in over a blurred copy of the page or thread. Can swap to the English translation in place.",
     ["c1a1b9cb0712e935", "c1a1b9cf4c36a04f", "c1a1b9cd621b8460"]),
    ("Source label / editor note", "other",
     "Credit a source, name a person in news footage, or disclose an edit (for example \"music replaced\").",
     "Do not use it as a caption for what the VO already says.",
     "Gold #cda75c lowercase humanist sans, bottom-left (left 1.2 %W, bottom 2.1 %H), 3.4 %H tall; editor note fades in 1.2 s ease-out. Source label #d09f61 at 75 % opacity, cuts in at 0 frames.",
     ["c1a1b94256d5d4c0"]),
    ("UI recreation / typing", "ui-typing",
     "The VO says how he searched for or found something: typing a URL, a search, a click, a translate.",
     "The search step is not part of the story. Then cut straight to the result.",
     "A recreated search bar or page (Wayback, YouTube, Google, Translate). Text types letter by letter; a cursor clicks. Dry keyboard or click foley only when the picture shows the action. Median 8.3 s.",
     ["c1a1b9405758e3b6", "c1a1b9caa44b8d2b", "c1a1b9cd8dac53e0"]),
    ("Map / place card", "map",
     "The VO names a real place, a route, a distance, or says how remote somewhere is.",
     "The place does not matter to the story. No invented route lines or pins that are not on a real map.",
     "Real Google Maps place card, coordinates panel, satellite or Street View, on a dark background or full frame. Slow push or slide. Median 8.2 s.",
     ["c1a1b9405750322e", "c1a1b9cd8dac1c61", "c1a1b9d122c3f87f"]),
    ("Split screen / grid / card row", "layout",
     "Compare two things side by side, or show all the people or videos at once.",
     "Only one thing matters. Keep to two to four panels or one row.",
     "Two clips side by side, photos as vertical panels, or a row of thumbnails or cards. Blurred edges, vignette, slow pan or push. Median 13.2 s.",
     ["c1a1b940575314ed", "c1a1b9cb0713d07b", "c1a1b9d26536c491", "c1a1b9caa44bc08f"]),
    ("Glitch / static", "glitch",
     "A chapter or tape break with no narration, a video starting up, or screens going dark.",
     "Never as a transition between normal shots. Rare: about 2 in a 40-minute film.",
     "Matrix rain, RGB tearing, VHS tracking static, test card or colour bars, as an overlay or a short burst. Median 3.8 s (0.8-7.7 s).",
     ["c1a1b9405755c56c", "c1a1b9d04bf511af", "c1a1b9d1339e23da"]),
    ("Photo push", "other",
     "The VO names a person or a place and you have a still photo of it.",
     "Never hold a still without a move.",
     "Full-frame photo with a vignette and a slow linear push-in (+2.3..+7.3 %/s). Optional: push in to one face while the others darken and blur. Old photos stay black and white.",
     ["c1a1b94057581844", "c1a1b9caa44bddcb", "c1a1b9cb071356e7"]),
    ("Quote card / read-out", "text-card",
     "A witness's or the source's own words are read out, and the viewer should read them too.",
     "The text is the source's own screen: then show it as it is (no card).",
     "The quoted text full screen in white serif over a dark blurred photo, or the post itself tilted. The VO reads it with a filtered voice and the music bed drops out.",
     ["c1a1b9d2feeb31b6", "c1a1b94256d30557", "c1a1b37eab98bc67"]),
]


def evidence(nodes, ids):
    out = []
    for cid in ids:
        n = nodes.get(cid)
        if not n: raise SystemExit(f"clip {cid} is not on the board")
        out.append({"clip": cid, "sf_in": n["sf_in"], "sf_out": n["sf_out"], "label": clip_label(n)})
    return out


def main():
    path = SG / "farrell" / "farrell.json"; g = M.load(path)
    if g.get("graphics") and "--force" not in sys.argv:
        print(f"skip: guide already has {len(g['graphics'])} graphics"); return
    board = json.loads((ROOT / "productions/_boards/farrell.json").read_text(encoding="utf-8"))
    nodes = {n["id"]: n for n in board["nodes"]}
    ops = [{"op": "set_graphics_summary", "text": SUMMARY}]
    for t, k, use, avoid, text, ids in GFX:
        ops.append({"op": "add_graphic", "title": t, "kind": k, "use": use, "avoid": avoid, "text": text, "evidence": evidence(nodes, ids)})
    g2, ch = M.apply_ops(g, ops)
    bk = M.save(g2, path, SG / "farrell" / "history", SG / "farrell" / "FARRELL_STYLE_GUIDE.md")
    print(f"added {len(GFX)} graphics, rev {g2['rev']}, backup history/{bk}")


if __name__ == "__main__":
    main()
