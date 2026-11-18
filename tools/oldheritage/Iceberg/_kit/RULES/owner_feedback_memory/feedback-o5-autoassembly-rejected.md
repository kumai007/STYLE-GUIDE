---
name: feedback-o5-autoassembly-rejected
description: "Owner 2026-11-01 rejected OUTLINES5 renders (Jellyfish, Ghosts in Wikipedia): auto-assembled from ~180 library templates = rough, mixed grades, random SS, \"just done to make it\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: e9f82c70-6bb4-4620-8172-8fd6e517cc75
  modified: 2026-10-31T19:46:38.169Z
---

Verdict on the first OUTLINES5 cases: "the most bs video I have seen". The cases were built by Director + editor agents + ~180 registered library templates.

What went wrong:
- **Not smooth:** cuts and motion felt rough.
- **Mixed colour grading:** templates brought their own tints (red, blue, green, teal) "where there's no need".
- **Bad placement:** the red-square callouts and the highlights looked bad.
- **Weak SS:** the screenshots were bad, and "you changed SS like 100 times… random SS have no meaning".
- **Not creative:** "just text", with no VV animation or clips where they would make it good.
- **Card and 3D sets:** the case-number card doesn't fit the horror/disturbing niche. The Blender desk ("book thing") is bad.

**Why:** variety by randomly mixing many templates from different reference videos reads as chaos, not editing. Quality comes from a small, coherent, polished set used deliberately, with one consistent grade per video, smooth camera, and meaning in every shot.

**How to apply:**
- Never mass-register library templates for production.
- Build each video's look from a few approved devices: FarrellSS v2 was the one SS the owner called good; also VV diagrams, real footage, and the approved lost-media engine look.
- Show the owner one case and get approval before scaling.
- Related: [[director-anti-template]], [[owner-quality-bar]], [[feedback-templates-from-refs]].

**Direction given after the rejection (2026-11-01):** Farrell + Visual Venture + fern + Nocturn style. The lost-media look was good, but fern was used where it wasn't needed. Each style has a job:
- **Nocturn:** the backbone. Real footage held long and dark, with one grade for the whole video.
- **Farrell:** screenshots only where a source proves the claim (FarrellSS v2).
- **Visual Venture:** animated diagrams for moments nobody filmed.
- **fern:** 3D only "to showcase a situation where there's nothing" or "to perfectly explain something".

Implementation:
- `plan_video --allow <palette> --merge`: a small per-video palette, and consecutive same-clip or same-page beats merged into held shots.
- `caseOpen`: the case opens on its own footage with a serif title, never a number card.
- Pilot palette (Jellyfish UAP): caseOpen, footageWindow, rawFullFrame, frameCompare, farrellSS, vvDiagram, depth25d, vvVVBlurFill, farGrindrPinBoard, unblur/focus date, quote over dim clip, route map.
