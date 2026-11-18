# Thumbnail Design Rules — 404ThreadMedia

These rules come from the Creative Producer SOP (4 Nov 2026), the WhatsApp chat with Neha and Vihaan, the Mohit sample chat, the two Discord exports (Ekam/Vihaan/Wyze and Wyze/DEZAYU) and the 36 studied channel thumbnails (AbyssalObserver, BizarreBub, noxlyhorror).
Measurements are at 1280×720 and were taken with `thumbkit.analyze` on the approved references (see `references/index.md`).
Each rule is meant to change what gets built. Where a rule came from a specific failure, that failure is noted next to it.

---

## 1. Global non-negotiables
1. **Decode the format before you search.** Write down the viewer promise and the indispensable relationships: subject, threat or clue, setting, gaze, negative space, text, and colour hierarchy. A reference shows composition and psychology. It does not give permission to copy.
2. **Never copy 1:1.** Mohit was told: "background looks exact same like the reference, we don't copy 1:1". Wyze: "exact same nahi bannani hoti, reference diya hai to". Keep the *design language*. Change the actual image.
3. **Never lift a finished thumbnail** from the reference creator or a direct competitor, even with the text removed.
4. **The image must deliver the text's promise.** "This one the image doesn't match the text" and "looks like that's a normal human" were both rejections. Before polishing, check that the image alone sells the hook word (NOT A HUMAN → visibly uncanny or dead face; DEATH → visible wreck or fire).
5. **Real over generated.** Do not generate the main subject (car, person, figure), the background or the text with AI. AI may only *alter* real images (angle, extension, small additions), and the result must look real. "Do not generate everything completely with AI" — Shayan.
6. **Raw footage beats stock.** Ekam: "u can't find best peaks in stock areas u have to actually get bodycam etc like RAW peak … keep searching then similar images". The peak image comes from real bodycam/dashcam/CCTV/news footage found through many searches and similar-image chains, never from stock or CC libraries.
7. **People are never built, only found.** Ekam: "u can't really have a police made from scratch. You either need a base image with perfect police and add the ghost to it, or add police to a road and ghost." Every human in the frame (cop, witness, victim) must come from ONE real, sharp source where they are already the right pose, angle and lighting. Two allowed builds:
   - **A. Base has the person:** a real frame/photo that already contains the perfect cop/witness. Add the figure or ghost to it. *(Preferred.)*
   - **B. Person cutout + plate:** a real road/location plate plus a cutout of a real, full-body, sharp person whose pose and light match the plate, plus the figure.
8. **No visible boxes behind text.** Ekam: "why this black square even exists?" Legibility comes from the text's own soft glow (and, if needed, a gentle scene-wide darkening). A darkening box behind text is allowed only if its edges are invisible: feather ≥ 0.06, or it extends past the frame edge. A hard-edged dark rectangle reads as pasted.

   Never upscale a tiny crop of a person more than 2× (Real-ESRGAN invents mush). Never assemble or Generative-Fill a person's body or face. If no good person source exists, report that rather than fake one.
6. **Fresh over overused.** "Most overused image" is a rejection on its own. Run the overuse check (§6.5) before showing any candidate.
7. **No fabricated evidence.** A composite must not be presented as genuine footage. Do not invent incidents or provenance. Flag rights as unknown rather than assume they are fine.
8. **Quality survives export.** "Quality bekar nahi hogai?" was a rejection. Work at ≥1920×1080. Export a 1280×720 PNG (or JPG q≥92) with no double compression. Check the export file itself, not the canvas.
9. **Remove every embedded arrow, circle, logo, watermark and stray text** from sources ("no need for circle or arrow").
10. **Speed matters.** Expect about 30–60 min per thumbnail once the image is found. "12 ghante me 1 thumbnail" got a designer replaced. Send progress previews early; don't disappear and then send a zip.

## 2. Workflow rules (SOP §7 + Vihaan's practice)
- Use a single thread. Confirm the brief (topic, reference, exact text, deadline) in one reply.
- **Approval checkpoint 1 — the image.** Send a shortlist of 3–5 candidates (or the single best image placed into a quick 16:9 mock) *before* polishing. "Before making final thumb I confirm with him." Leads often can't judge a raw image, so help them visualise it with a rough placement.
- **Approval checkpoint 2 — the near-final.** Send the preferred option clearly marked, plus at most one meaningful alternative. Never send near-identical variants without saying what changed ("2 variations bheje toh hai" / "dono same he hai").
- Revisions are a checklist. Apply exactly what was asked and keep everything that was already approved.
- Send PNG files directly, not zips ("zip me kyu, ase he bhejdeta").

## 3. Format specs

### F1 — Disturbing image left + 3-line text right ("Iceberg / Moments" — AbyssalObserver, Abyssal Detective)
Used for: Disturbing Dashcam, Camcorder Moments, "This Is Not A Human", "Most Disturbing X Iceberg".

| Element | Spec (measured from approved refs) |
|---|---|
| Image zone | Left ~55–60% of frame. The focal subject (face or wreck) sits on the left third line (x ≈ 0.20–0.40). Close-up preferred: a **face visible and large** ("we need the face visible"; Neha: "closeup of face like in ref"). |
| Text block | x ≈ 0.48–0.98 (Neha) / 0.57–1.00 (Vihaan), y ≈ 0.23–0.78. **Centred alignment** in the right column. Exactly 2–3 lines. |
| Cap height | 80–100 px at 720p (11–14% of frame height). Lines are usually equal. Neha's DEATH line is 1.3× bigger, which is acceptable when the red word is last and short. |
| Line gap | 0.28–0.45 × cap height (23–43 px). Tight stack. |
| Font | Heavy rounded geometric sans (rounded terminals, double-storey a). Closest open fonts: Nunito Black / Rubik Black / Arial Rounded Bold. Run `fontmatch` on each new reference. Use Title Case ("Moments Before DEATH") or ALL CAPS ("THIS IS NOT A HUMAN"), following the reference. |
| Colours | White #FFFFFF fill. **One** hook word in red (#ED1E2E to #FC0000). The red word is the emotional payload (DEATH, NOT, FINAL, HUMAN). Never two red words in different lines unless the reference does it. |
| Text treatment | Thin black stroke (~4–6 px at 720p, 0.04–0.06 em) plus a soft black outer glow/shadow (radius ~0.2–0.3 em, 70–85% opacity). The text sits on a dark area, so the glow does most of the separation. No bevels, no gradients, no 3D. |
| Darkening | Right side gradient to near-black. Column luma drops from ~0.55 at x=0.45 to ~0.25 by x≥0.60 and stays ≤0.3 under the text. Use a linear gradient from x≈0.40 (0% opacity) to x≈0.70 (85–95%). The image must still be faintly visible behind the text, not a flat black box. |
| Grade | Punchy and gritty: black point clipped (8–23% pixels <2%), contrast std ≈0.29–0.32, crisp high-pass "crunch" (amount 0.3–0.5), visible grain/noise (σ≈0.005–0.013), optional VHS scan streaks for camcorder/night themes. Temperature follows the story: cool blue for ice/snow (b*≈−14), red/orange push for fire/blood, desaturated storm-grey for wrecks. |
| Psychology | One real, disturbing human moment, plus a 3-word verdict that makes the viewer doubt or fear what they see. |
| Variable | The subject, setting, colour temperature, which word is red, and Title Case vs CAPS. |
| Essential | Left image / right text split, right-side darkness, centred 3-line stack, one red word, the heavy rounded font, and real (non-AI) imagery. |

### F2 — Raw CCTV + fixed tagline ("don't watch alone." — BizarreBub)
| Element | Spec |
|---|---|
| Image | One **authentic, ungraded** CCTV, doorbell, baby-monitor, bodycam or phone frame. Keep the timestamp OSD and the camera brand ("ring", "blink") overlays. They are the authenticity signal. Never make it cinematic. |
| Text | `{don't} watch alone.` with lowercase "don't" in red (#E8141B) and "watch alone." in white. Regular-to-medium weight, neutral grotesk (Arial/Helvetica-like), **no heavy stroke**: a soft black shadow/glow only. Cap height ≈ 4–5% of frame height. Placed right of centre, at the vertical middle, 1 line, x ≈ 0.45–0.98. |
| Darkening | A local soft dark patch behind the text (radial, 40–60%), not a full side gradient. |
| Grade | Almost none. Light contrast, and a slight sharpen if the frame is soft. Do not add grain beyond what the camera already has. |
| Psychology | "This is real security footage of something wrong". The anomaly (child alone at night, a figure in a doorway) has to be readable on mobile. |

### F3 — Archival / poster collage (noxlyhorror)
| Element | Spec |
|---|---|
| Image | Period-authentic photos, newspaper scans, posters (WANTED/MISSING/ID cards), game cartridges or console UI. Faces of real victims or suspects get **pixelated** or a black bar. |
| Text | Condensed heavy grotesk (Anton / Oswald Bold / Archivo Black) in black on paper, or white with black shadow on photo. Poster mockups use bilingual (Korean/Japanese) fine print. |
| Texture | Print/paper texture, slight blur, halftone, low saturation, vignette, film grain. |
| Psychology | A documentary dossier, "this really happened in Japan or Korea". |

### F4 — Encounter composite (cop/witness + torch + scary figure)
From Mohit's sample brief and the DEZAYU sessions.
| Element | Spec |
|---|---|
| Plates | A **real background** extracted from YouTube footage or photos ("search certain keywords … extract those backgrounds"), slightly dark but not pitch-black ("thoda dark, pura dark nahi"). A real police officer or witness photo. A real scary figure (or the one supplied by the lead). |
| Geometry | One perspective for everyone. The figure's scale must fit the floor plane and depth, with a contact shadow and no floating. Place the figure near a rule-of-thirds intersection *next to* the subject ("isske pass pass dekhliyo"). |
| Gaze | The human's face is turned toward the scary figure, or looks back over their shoulder for "behind you" concepts ("inka face scary figure ki taraf hoga"). For an *unaware* encounter the person must NOT be staring at the threat (SOP). |
| Light | If a torch or flashlight is used, the beam must originate at the torch, hit the figure with a believable falloff, and not be overpowering ("reduce the torch light falling little bit"). Ambient light on the figure must match the scene. When the scene is already lit, a torch is unnecessary. |
| Figure treatment | Slightly brighter or whiter than its surroundings so it reads on mobile ("scary figure ko thoda safed bana de, chamka de"). Soften or blur the face a little so it reads as uncanny rather than a sharp pasted cutout. Fix odd hands. |
| Text | Usually added by the lead ("text mai laga duga, tu image karde"). Leave clear negative space for it. If asked, use F1 typography, smaller ("text thoda chota karo"). |
| Reject | AI-generated background, an AI look on the figure, a 1:1 copy of the reference background, mismatched lighting, AI-looking snow or rain (real particle overlays beat generated ones: "isme snow AI lagrahi hai, isme asli lagrahi hai"). |

### F5 — Van / window / corridor encounter
| Element | Spec |
|---|---|
| Scene | A natural interior (van, car, corridor) with the person inside and a believable disturbing figure outside the window or down the corridor (SOP "It Wouldn't Leave"). The person, window frame and figure share one perspective. |
| Camera | **Correct lens bend** ("image bend ho rkhi hai") by straightening verticals with `lens_correct`/`perspective`. For corridors, use a slightly downward angle, keep the corridor not too wide, and put the ghost in the centre vanishing area and clearly visible. |
| Figure | Sized by its depth in the scene and lit by the window or corridor light. It must look like it belongs to the glass or reflection plane when outside a window. |

## 4. Text rules (all formats)
- Text is rendered by the typography engine, **never by an image model**. Keep it editable (live type in PSD).
- Preserve exact wording and capitalisation when the brief gives text. When suggesting text, use 2–4 words that complement the title (do not repeat it). Example: the title "Most Disturbing Camcorder Moments" pairs with "THIS IS NOT A HUMAN", not "DISTURBING CAMCORDER".
- One accent colour, on one word or phrase.
- Minimum legibility: at the 246×138 px (mobile suggested) preview, cap height must be ≥ 9 px. The text block must stay clear of the bottom-right **duration badge zone** (x > 0.86, y > 0.84).
- No soft or blurry text. Render at ≥1920 width with supersampling. Do not upscale rasterised text.
- Don't let a cramped stroke merge counters (e, a, o). The stroke should be ≤ 0.07 em.

## 5. AI usage rules
**Allowed:** outpainting a real photo to 16:9 when the extension is low-structure (snow, sky, wall, ground); changing a subject's angle or orientation; cleaning artefacts; removing watermarks and arrows; small additions; making a face paler or more corpse-like; upscaling and denoising a blurry find ("Blur hai kafi" → "ai se theek hosakti hai").

**Forbidden:** generating the whole scene, background, vehicle, main person or text. Also forbidden: waxy or plastic skin, warped hands, changed facial identity, mismatched shadows, "stock-image" cleanliness, AI weather particles, and synthetic imagery presented as real footage.

**Check after every AI step:** compare against the untouched source at 100% zoom on the face, hands, edges and texture. Reinject grain or noise so the AI region matches the camera's texture. If it looks AI, revert to the real pixels and solve it with masking or grading instead.

## 6. Image-research playbook (Vihaan's method + SOP §7B)
1. **Look and name** (1–2 min): describe the reference image in words, e.g. "weird disturbing human-like dummy, in a cave, winter clothes, camcorder angle". Generate keyword families: subject ("human", "mummified human"), situation ("stuck in cave", "frozen in ice", "died in ice mountains"), medium ("camcorder", "dashcam", "CCTV", "footage").
2. **Reverse-search the reference** with Google Lens (Visual matches), Bing and Yandex. If nothing comes up, move on.
3. **Similar-image search via an LLM** with the reference attached. Results are often wrong-angle or stock, so treat them as leads only.
4. **Keyword chains.** Search Google Images and YouTube with each family. Open the "related" chips under good results. **Re-read the reference for clues** (Vihaan's breakthrough came from noticing the winter clothing: cave → ice → "man died in ice mountains"). Combine medium + situation ("camcorder cave stuck").
5. **Overuse check.** Reverse-search each candidate. If it appears in many big-channel thumbnails or is the top Lens hit, reject it or keep it only as a fallback. YouTube sources should be older (3–4+ years) or low-view (< ~100k) videos. Reddit, local news and small uploads are good.
6. **Lens chain.** Take the best near-miss → Lens → similar results → repeat 2–3 hops.
7. **Frame-grab from source videos.** Scrub YouTube or archival videos (yt-dlp + ffmpeg) for the frame with the best face, angle and composition. This is often fresher than stills.
8. **Shortlist 3–5** with source URL, creator, date, resolution, rights status and one sentence on fit. Reject early for: overused, wrong orientation, poor focus, impossible geometry, visible artefacts, too stock or unreal, face not visible, or needing a major AI reconstruction.
9. **Mock the best one** quickly into the format and get approval before polishing.
10. If none is good enough after an honest search, say so and propose the best available. The fallback is to make the strongest real image scarier with grading and retouching (paler face, darker eyes, contrast), not to generate a new one.

## 7. Grading & finishing defaults
- Start from the source's own light. Match the cutouts to the plate (temperature, black level, saturation) before any stylistic grade.
- Typical F1 stack: denoise or upscale if needed → curves (crush blacks ~0.04, lift mids slightly) → local contrast 0.3–0.5 → story temperature → selective saturation on the hook colour (blood, fire, jacket) → high-pass crunch 0.3–0.5 → right-side darkness → vignette 0.3–0.5 → grain 0.03–0.05 → (camcorder/night) scanlines.
- "Make it scarier": desaturate and cool the face, lift its whites slightly, darken the eye sockets, add contrast, and darken the surroundings while keeping the face the brightest element.
- Brightness: the focal subject should be the brightest, most saturated non-text element ("bightness aur scary figure chamka de").

## 8. QA reject list (reject before showing the lead)
| Check | Reject if |
|---|---|
| Concept fit | The image doesn't communicate the text promise or format (a "normal human" under NOT A HUMAN). |
| Originality | It is a near replica of the reference, or uses a competitor's finished image. |
| Freshness | The image is the top reverse-search hit or widely used. |
| Authenticity | It shows AI artefacts (waxy skin, warped hands, AI snow, smeared extension), or is a composite that could pass as real evidence without being intended as such. |
| Clarity | The face, focal clue or text is blurry or pixelated. There is a quality drop after export. |
| Geometry | Wrong gaze direction, floating figure, inconsistent scale or perspective, lens bend left in, or shadows pointing the wrong way. |
| Light | The torch or light source doesn't match its origin, the figure is lit differently from the scene, or the light is overpowering. |
| Typography | Wrong font or style versus the reference, more than one accent colour, an overlapping duration badge, stroke merging counters, or cap height < 9 px at 246 px wide. |
| Mobile | At 168 px and 246 px wide the story isn't readable in under 1 s, or the focal point is lost. |
| Hygiene | Leftover arrows, circles, watermarks, logos or stray text. Wrong size (not 16:9 1280×720). |


## 9. Brand/platform topics and YouTube UI (added 2026-11-11 after the Internet Archive job)
- "Horrors on <platform>" thumbnails = the platform's REAL logo (official file, faithful) + a REAL raw disturbing
  photo or footage frame, VHS/grain grade; or the real logo corrupted into a face. Never a hand-drawn logo,
  never a substitute mascot, never cartoon/clip-art. (Rejected: Bonzi Buddy for "Internet Archive"; a pillar
  logo rebuilt from rectangles with red dot eyes.)
- Never render a duration badge, progress bar or any YouTube UI — those on reference screenshots belong to
  YouTube. QA check `no_fake_duration_badge` fails it.
- When the user names the topic or says "remove this", that is fixed in the very next version, first.
- PRO DETAILING for brand topics (the real "Horrors on the Internet Archive" / LiveLeak thumbs): the logo is NOT a
  sticker — `cli brandlogo JOB --src <official logo>` knocks out the plate, turns dark/grey parts off-white,
  keeps the brand accent colour, adds bloom. Place it BIG across the top third (60-85% width), over a black fade
  (gradient black→0 from the top to ~0.55) so the photo's top edge never shows a seam; the photo fills the lower
  60% with faces fully visible; then VHS grime (chromatic aberration, scanline jitter, colour grain, crunch).
  Approved example: jobs/horrors-on-internet-archive-iceberg v017.
