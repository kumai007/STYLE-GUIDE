# Scripters
match: outline, script, iceberg, most disturbing, internet mysteries, disturbing internet media, obscure, hours of, fall asleep to, 1990s internet, internet horrors, horrific information, disturbing posts, hispanic tv, google maps, caught on camera, zoo incidents, dashcam, theme park, before disasters, russian internet, hispanic internet, wayback, media oddities, fast food, amusement park

Learned from what Ekam approved and corrected. There are still no hand-edits: brain/diffs/ doesn't exist as of
2026-11-13 14:05, and all 19 approved outlines match the engine's text exactly. So every rule here comes from his
chat corrections, his approvals, his bulk-run briefs, his hand-run training (training/caught-on-camera/), or the
scripter's own notes where his corrections don't contradict them. Keep every rule here and add to it; don't drop any.
Raw-clip compilations ("caught on camera", dashcam, zoo, theme park, before disasters) and real-world incident
icebergs (fast food, amusement parks) also read brain/playbooks/caught-on-camera.md (its "THE DONE RULE" first).

## #0000 An outline is DONE or it isn't delivered (2026-11-13 09:43; overrides every "mark ready and say why")
"make sure every outline we do through the tool is always DONE like we have perfection no half cooked that would
ruin the channel". All 5 open outlines came back in one minute; not one for a wrong case or a bad clip. Four were
under the word floor or the title's count, three had an open line.
- **Gate:** `status --state done` passes before any reply. Never deliver "ready". Finish everything in the same
  run with helpers in the foreground; re-run the gate until it passes.
- **Word floor:** 23,000 × min/120 (5,750 for 30 min) AND the title's number of cases. If the facts don't carry it,
  add real depth from sources the outline already has, then real cases from MORE proven references. Never pad,
  never own research. The "lower the plan honestly" lines below are history.
- **Plan for THIS title's script length (2026-11-13 10:23–10:35).** 30-min titles have 6,000–8,000-word scripts
  ("see the script itself we doing rn is just 6k-8k words"), so the outline plans ~6,000 (≥5,750). 23k–25k+ plans
  are only for 2-hour+ titles. A 24,000-word re-plan was sent to all 6 thirty-minute titles after his question
  "u think we are making 24k word script for them" was read as an order; he stopped every lane within a minute.
  Before any re-plan: read job.json `length_min` (and `script_words` if set). If the order's numbers don't match
  ("script_words 24000, length_min 125" vs a job that says 30), confirm in one line before touching the outline.
  Report the plan in words against the gate, not in minutes at 140 wpm ("43 min vs the brief's 30" is a false
  alarm for a 6,000-word 30-min plan).
- **Case count = the title's number, up to ~2 over (2026-11-13 10:25).** Fast food went 20 → 28 to reach the floor
  and he cut it: "trim this outline from 28 to the best 20-22 cases. Keep the strongest and most proven ones (used
  by the most references, best facts, genuine clips first) and keep a sensible spread across the iceberg levels.
  Drop the thinnest cases and release each dropped case from the ledger … raising each target only as far as its
  verified facts honestly carry; add verified depth where a case gets more words, never padding." So: depth on
  the strongest cases FIRST (timeline, people named only where public, cause/investigation, official findings,
  aftermath, primary-source quotes, the footage beat by beat), then the FEWEST strongest extra reference cases.
  "Iceberg levels can hold more than 20" means 20–22, not 28. What worked: before-disasters added 2 GREEN exact
  clips from Abyssal's sibling icebergs (Festival, Outdoor) + a depth helper on the 8 richest entries (coroner
  hearings, compensation, court dates: ~850 real words) → 20 cases, 6,370. Fast food's trim raised the
  court-record cases (chili finger, Erdington, Newhaven) and landed 22 cases, 6,000.
- **Deliver .md, not .docx:** "no docx only mD i dont have docx". The deliverable is the outline/script as
  "<Title> - Outline.md" in ~/Downloads. Runner orders that still say "re-export the docx" predate this.
- **No open wording:** grep the outline for "check by hand", "check before use", "may carry", "not retrieved",
  "could be", "your call", "needs a crop", "to be verified", "TBD", "signed-in" before the gate (the gate refuses
  them anywhere, not just in footage tables: when a clip is swapped for safe visuals, also rewrite that case's
  Status and Handle-with-care lines). Close each by doing it (verify the channel yourself; download and
  analyse the audio and write "mute the original audio" if music was added; retrieve a missing record another way
  or swap that visual for another safe verified source; find a clean raw copy or, in an iceberg, safe stock/CC).
- **The reply never says "done" next to a list of fixable weak spots.** The amusement iceberg replied "marked done"
  with an un-retrieved OSHA record; it came back. Facts the sources truly disagree on stay labelled in the entry and
  out of narration; that's not an open item.
- Same method around it: reference-first, exact raw clips GREEN/AMBER, RED never, his exclusions, content filters,
  ledger claims, linkcheck with the channel rule waived for approved reference clips, re-export (.md for him).
- **Where the 6 thirty-minute outlines landed (all gate-passed 10:27, ALL APPROVED with no edits 2026-11-13
  14:05):** dashcam 20 cases/5,750; before disasters 20/6,370; amusement iceberg 20/6,030; incidents 25/5,890;
  zoo 12/5,750 (4 GREEN, 8 AMBER; circuses ruled "not a zoo"); fast food iceberg 22/6,000 (5 AMBER exact clips,
  17 safe-visual). This is the DONE rule paying off. Between 09:43 and 10:35 the batch went from 5 outlines sent
  back to 1 trim order, and then to 6 approvals. The shape to copy is in caught-on-camera.md, "The approved outline
  shape".
- **Audio is checked, not described (2026-11-13 14:05 review):** "audio not checked" is still in 9 notes of the
  approved zoo and fast food outlines, and the gate's phrase list missed it. Download every raw clip's audio and
  write what it has: "audio checked: swearing at 0:31 → bleep", "audio checked: added music → mute the original
  audio", "audio checked: clean".

## #000 Reference-first is THE method for every title (2026-11-13; overrides #0's top-ups and #00's "fewer is fine")
- "references i give we obv using there cases and the clip": the cases are the references' cases, and the footage
  is the exact clip they showed (fully raw, GREEN/AMBER). It is written into runner SCRIPT_COMMON,
  video-outline-builder SKILL.md section 0, the SOP and linkcheck.
- **No own research, ever, to fill a list:** "if u research on ur own theres a high chance the cases are fucked".
  Theme parks' 12-case list (3 reference + 9 own-research GREEN clips) was replaced 1.5 h later with "no own
  research". When short, find MORE reference videos (more niche compilations, icebergs, Shorts) and take their
  cases + clips. In #0 below, "own research only if the pool runs short" is history.
- **Too few is also a failure:** "3 cases can't make a video". Say the count and the minutes in one line as soon
  as a list falls below the slot, then widen the references. Don't park it at "ready" with an "honest" 6-minute
  plan.
- **References need real reach:** proven adjacent niche channels (Abyssal Detective / Abyssal Detective 2,
  Occult Inquisitor, Chilling Scares, Obscure Encounters, Detective Kinjaz, SIRIUS, MonoMania, and from his 09:43
  orders Chezzoid, Stories From John, MostAmazingTop10, Top Fives, Psychopoly). Not tiny or foreign-language
  channels: "a 100-view video proves nothing" because no licensing company bothers claiming it.
- **Reference videos get facts wrong** (6 errors in the amusement iceberg's references: ages, months, park names,
  coaster type, which hill). Verify every reference fact against a real source before it enters Summary, and note
  the correction in "What the source video adds".
- **One RED angle doesn't kill a multi-angle case:** list every upload/angle, check each for a clean original
  uploader, use only non-RED angles (Nizhnevartovsk bear, 2026-11-13).
- **Never say a reference "had no clips" without checking its frames** ("did u verify they had clips or they never
  had clips honestly"). Contact-sheet every case segment at 5 s steps before you say it.
- **Iceberg variant (fast food, amusement parks):** cases from the reference icebergs, ordered into levels like
  theirs. Each case gets the exact raw clip where one genuinely exists. Otherwise it gets safe visuals: stock,
  Commons/CC/public-domain photos (real files, credit copied), photos of the place, public records. Never agency
  photos or TV. Recipe: caught-on-camera.md "Iceberg variant".
- **Title changes** ("This title is now X (iceberg, 20 cases)") → rebuild to the new format in the same run:
  release every claim no longer used, claim the new ones, rewrite exclusions.md.
- **Ages:** check victims' ages where minors are possible (Krug Park 1930). A child at the centre → drop it, use a
  spare, and say so (fast food left out the 2-channel Arby's finger case). Children among the injured but not the
  subject (Green Plaza) → flag it and keep the visuals wide.
- **His lists are leads, not facts:** re-read the source behind every row. Green Plaza's "15-27" was the injured's
  ages, not the count (6). Two clip "titles" were description lines, and trims ran longer than listed.

## #00 caught-on-camera titles: his trained list IS the case list (rebuild order, 2026-11-12 21:25)
After the 15:03 pool rebuild kept only 2–6 competitor cases per title, he trained the method by hand
(training/caught-on-camera/BRIEF.md) and sent: "Rebuild this outline from training/caught-on-camera/<topic>.md,
Ekam's approved method". For these titles this overrides #0's milked test, #1's "any TV airing fails" and the
channel rule:
- Cases = exactly the MAIN LIST, in its order (most proven first). No own research; Backup unused. Fewer safe
  cases is fine: lower the word plan honestly, never pad. [2026-11-13: within limits. "3 cases can't make a
  video". A list too short for the slot → more reference videos (#000), never own research.] [2026-11-13 09:43:
  the slot = the done gate (5,750+ for 30 min) and the title's count; zoo 9 / before-disasters 18 were sent back
  to add exact-clip cases from more proven references (#0000).]
- Footage = exactly the list's clip links (the exact clip the reference video showed, frame-matched, earliest clean
  copy), tiered GREEN/AMBER (RED never). Note per clip: uploader · subs · date · tier and why · in/out timestamps;
  reference video + timestamp as "Reference only - not footage".
- Source videos must match the title exactly and come from the niche's long-running channels (Abyssal Detective,
  Chilling Scares, Obscure Encounters, Occult Inquisitor, SIRIUS…), not licensing list channels (BE AMAZED). Say in
  the outline which reference video each case came from (his 15:12 message to before-disasters and incidents).
- Rows the list marks DROPPED or pending are not cases (before-disasters: Mactan, Prinsloo, #10 Goûter, the Bytom
  slot → 18 cases).
- **His 21:51 answers (all 5 titles):**
  - The risk tiers win over linkcheck's old small-channel rule. Note "channel rule waived: approved AMBER/GREEN
    reference clip" on each such row; linkcheck passes when those are the only FAILs (no dead, private or
    agency-held links).
  - A list row found RED (Bronx: ViralHog caption; Shaoyang: Newsflare end card) → drop, `ledger release`, replace
    only with an exact-clip case from the same reference videos. If none passes, leave it out and lower the plan.
  - A list clip that isn't raw (Çöpler: TikTok logo + news captions; Chapecoense: REC Notícias logo) → find a
    logo-free copy of the exact clip first; drop + replace only if none exists.
  - A croppable bug or a username → keep with a crop/blur note (dashcam #6 LiveLeak, #11 Reddit handle).
  - Age-gated Hodge → keep, matched via YouTube's own thumbnails.
  - "Update the footage notes accordingly and re-export; no other changes" → exactly that scope.
- Frame-check every list clip end to end (last 3 s, corners, trims) before writing its footage note; the list was
  matched on the start only. Details: caught-on-camera.md "Checking the list's own clips".
- Full recipe, tiers, the linkcheck decision and per-topic lessons: brain/playbooks/caught-on-camera.md.

## #0 case rule: cases come FROM the competitor videos studied (his rebuild order to 5 titles, 2026-11-12 15:03)
"take the cases FROM the competitor videos you studied (refs/ transcripts, docs/references_index.md). They are the
source pool, not exclusions." Before that: "we had told you to take cases from … u had to take their cases they
used, the clips bcz that prolly non lincsed". scripters/SOP.md ("Never copy the reference video's cases") said the
opposite and every run followed it — his rule overrides the SOP.
- Inventory every case in the studied videos (reuse docs/parts inventories).
- Pick the strongest that are NOT milked: named in 3+ studied videos, or one video about it has 1M+ views, or 3+
  videos have 500k+. Max 3–4 cases from any one video.
- Skip his own channel's cases and cases another title claimed in the ledger. Verify each pool case exists (some
  refs are AI-invented).
- Own research ONLY if the pool runs short. Delivery says "N from competitors, M own research". [2026-11-13:
  overridden by #000, no own research. Widen the reference videos instead.]
- exclusions.md lists only milked cases, his channel and other titles. Release dropped cases with
  `script <job> ledger release "Case"`, claim new ones with `ledger add`.
- On a rebuild: keep the case count and word plan total; current cases that came from the pool and still pass stay.
  Re-export, run linkcheck, stop at the outline.
- Scope: ordered for the Old Heritage Files (caught-on-camera) batch and phrased as "my rule". Apply it to every new
  outline. The Channel 4 / new-channel icebergs below were approved earlier with own-research picks; their lane
  notes are now top-up lanes. Caught-on-camera titles now follow #00 instead.
- What the pool rule yielded under the strict gate (15:03 rebuild): dashcam 7 of 47 vetted pool cases passed (6
  used), before-disasters 2 of ~20 real before-clips, theme parks 3 of 52, incidents 3 of 85, zoo ~2 of 28. Killers:
  milked, agency-licensed (ViralHog/Storyful/Newsflare/Jukin), first copy from a newsroom, deaths on camera,
  creepy vlog clips with no record. When a rule leaves the pool this empty, tell him in one line with the numbers
  before filling it with own research: he answered "no way so less cases … i lwk sent u so perfect SS of videos"
  and retrained the method by hand.

## #1 footage rule: ZERO licensed clips (his brief + his correction ×5, 2026-11-12)
Brief: "raw links … not from any licensing agency but raw uploads from channels which are just uploaders of random
people with no link to agency … raw moments who faced it … only from yt links". Correction to all 5 Old Heritage
Files outlines: "pls replace clips which are from license companies pls make sure we dont have anything licnsed
comapnies stuff to safeguard us".
- Licensing company = ViralHog, Storyful, Jukin/JukinMedia, Newsflare, Caters, ViralPress, SWNS, Rumble (viral
  licensing), CollabDRM, AFP/Reuters/AP, any TV/news outlet.
- Gate EVERY footage row before it enters an entry: (1) `yt-dlp --print description` and reject on "licens",
  "for licensing / to use this video contact", agency names, "used with permission", news-wire wording;
  (2) search "<event> ViralHog / Storyful / Newsflare / Jukin / Rumble" — if the filmer licensed the clip anywhere,
  every re-upload of it fails too (Essendon, Yorba Linda, I-70 avalanche, shark cage, Braunsbach, Bondo's Hansen
  clip, Kilauea boat); (3) frame-check for TV bugs, anchors, lower-thirds, slideshows; (4) channel = the person
  who was there, or a tiny personal channel, never an aggregator re-uploading "unknown origin" footage.
- Doubt = replace. Never ship "check before use", "description reads like an agency caption", "a copyright claim
  is possible — your call". Swap to a clean copy → else swap in a spare case (image-led is only OK in page/archive
  icebergs, never in caught-on-camera titles). Note each row "licensing checked: description + agency search + frames".
- Delivery line: "Every clip checked for licensing: 0 agency/news clips (replaced N)". Zoo said "Mostly yes" and
  dashcam left Essendon as "your call"; he had to send the fix to all 5 titles.
- **The description proves nothing** ("did the description already had its been licensed or description had
  nothing"): all 4 licensed clips caught on 2026-11-12 had clean/empty descriptions. Trace the EARLIEST upload (a
  normal person, not an agency); search the agency SITES (newsflare.com, viralhog.com, Storyful, Jukin) and Google,
  not only YouTube; compare length, date and full frames, not thumbnails; reverse-image 2–3 frames. Any agency/wire
  (incl. ViralVideoUK, CCTV+, AP Archive, AFP) holding the same footage, or any TV airing, kills the clip — even the
  filmer's own upload on a 2-sub channel. Put this in the entry brief from the start, not a final sweep.
- Caught-on-camera titles: every case needs ≥1 clean raw clip; no image-led cases ("the cases all of them has
  footages"). linkcheck must end at 0 FAIL ("make sure everything passes"). Exception decided 2026-11-12 21:51:
  FAILs that are only the old channel rule on approved AMBER/GREEN list clips are waived and noted (see #00).
- **Risk tiers replace the all-or-nothing gate (his training, 2026-11-12 ~16:30).** RED never: agency-held or
  claimed, a TV station's own footage, or a big creator's own footage. AMBER fine: a civilian clip TV aired later with
  credit, a police/government release, or an untraceable repost no agency holds. GREEN: the filmer's own upload.
  The link itself must be fully raw (no TV upload, logo, watermark or compilation). "Any TV airing fails" and
  "uploader must provably be the filmer" above are history for caught-on-camera titles; agency = RED still stands.
- Agency-site search that worked: WebSearch `site:newsflare.com / site:viralhog.com / site:jukinmedia.com <event>`
  (Newsflare's own search also works through a reader proxy); storyful.com blocks crawlers, so search
  "Storyful + keywords" and its YouTube channels. Frame-compare against agency uploads: a JUKINMEDIA watermark
  shows up in pulled frames even when the description is clean.

## What he approved
Outlines (19 approved, none with content edits):
Bulk run "new-channel-1" (4):
- brain/docs_library/iceberg/script-the-disturbing-1990s-internet-mysteries-iceberg-explained__outline.md (17 cases, 5 levels — explicitly "outline approved")
- brain/docs_library/internet/script-disturbing-internet-media__outline.md (18 cases — explicitly "outline approved")
- brain/docs_library/internet/script-2-hours-of-increasingly-obscure-internet-mysteries__outline.md (20 cases, "descent" order)
- brain/docs_library/internet/script-2-hours-of-most-disturbing-internet-media-to-fall-asleep-to__outline.md (16 cases)
Bulk run "new-channel-2" (5, approved together 09:50 after one question about fiction cases):
- brain/docs_library/iceberg/script-horrors-from-the-hispanic-tv-iceberg__outline.md (30 cases, 4 levels, 29,800 planned; 23/30 in no competitor transcript; 4 fiction-led TV cases kept)
- brain/docs_library/compilation/script-2-hours-of-google-maps-strangest-anomalies__outline.md (30 cases, 28,800)
- brain/docs_library/internet/script-3-hour-of-the-most-disturbing-posts-on-the-internet__outline.md (25 cases, 29,200)
- brain/docs_library/compilation/script-2-hour-of-horrific-information__outline.md (18 cases, 29,400)
- brain/docs_library/internet/script-2-hour-of-internet-horrors__outline.md (18 cases, 28,800)
Bulk run "Channel 4" (4, all approved 2026-11-12 05:51, no edits; still in jobs/, not yet in docs_library):
- jobs/script-horrors-from-the-russian-internet-iceberg/docs/outline.md (12 cases, 4 levels, 48,200 planned; 4
  stated sub-75 exceptions; 6 image-led entries; big Russian-language videos named, English-only freshness)
- jobs/script-horrors-on-the-hispanic-internet-iceberg/docs/outline.md (18 cases, 48,100; all own research)
- jobs/script-anomalies-in-the-waybackmachine-iceberg/docs/outline.md (20 cases, 82–90, 49,000; archived page
  IS the evidence, before/after capture pairs)
- jobs/script-60-incredibly-obscure-media-oddities/docs/outline.md (60 cases, 49,000; 76–79 tier in Part 4 at
  550–650 words; archive.org full copies for pre-1990 films/broadcasts)
Bulk run "old-heritage-files" (6, all approved 2026-11-13 14:05 in one bulk action, no edits; the first approved
caught-on-camera and real-world-iceberg outlines, all 30-min, all passed the done gate first):
- brain/docs_library/compilation/script-the-most-disturbing-zoo-incidents-ever-caught-on-camera__outline.md (12 cases, 5,750, 4 GREEN / 8 AMBER)
- brain/docs_library/compilation/script-20-most-disturbing-dashcam-moments-ever-caught-on-camera__outline.md (20, 5,750)
- brain/docs_library/compilation/script-20-most-disturbing-videos-before-disasters-ever-caught-on-ca__outline.md (20, 6,370)
- brain/docs_library/compilation/script-25-most-disturbing-incidents-ever-caught-on-camera-that-will__outline.md (25, 5,890)
- brain/docs_library/iceberg/script-the-most-disturbing-fast-food-incidents-iceberg__outline.md (22, 6,000, 5 levels)
- brain/docs_library/iceberg/script-20-most-terrifying-theme-park-disasters-ever-recorded__outline.md (amusement iceberg, 20, 6,030)
Method sources: training/caught-on-camera/BRIEF.md + zoo.md, theme-parks.md, incidents.md, dashcam.md,
before-disasters.md, amusement-iceberg.md ("Ekam's approved method", 21:25 order). Read BRIEF.md + the closest list
before any caught-on-camera outline.
Read the closest approved outline before writing a new one and match its finish:
- iceberg → Hispanic TV or 1990s
- foreign-internet iceberg → Russian internet
- archive/page-led → Wayback
- 40+ case list → media oddities
- compilation → horrific information
- internet → disturbing posts
- caught-on-camera → zoo (a list plus top-ups) or incidents (25 cases, mostly GREEN)
- dashcam/Vol 2 → dashcam
- real-world iceberg → fast food or the amusement iceberg

Scripts (1, explicitly "script approved" 2026-11-11 09:55, after his 3 intro corrections + 1 line fix):
- brain/docs_library/internet/script-2-hours-of-most-disturbing-internet-media-to-fall-asleep-to__script.md
  (16 cases, 24,274 words). Read its INTRO and Case 01 before writing any script: a topic-level scene → a hard
  number → a turn → a tease of case 1 in 3 sentences → CTA; then case 1 opens on the artifact itself (Royal
  Decree 38 read out), plain explainers in-line ("a bit like a group text that only goes one way"), host lines
  sparing and dry ("It's hard to lose an argument when anyone who turns on you can be written off as a copy").
Scripts revised after his corrections, no further pushback yet (not approved): Hispanic TV intro (123 words),
disturbing-posts intro (146 words). Use them as intro shape examples.

## Outline layout (the approved standard — keep these fields, in this order)
Caught-on-camera and real-world icebergs use the approved variant: Method, Risk tiers and Footage note for writers
paragraphs; Clip (uploader) and Tier columns in the running order; tier and niche use in the quick facts. The full
field list is in caught-on-camera.md, "The approved outline shape" (6 approved 2026-11-13).
1. `# <Title>` then `## How the cases were chosen` with bold-labelled paragraphs:
   **Cold-open note** (≤250 words; topic-first per the INTRO rules below; don't name the overdone anchors in
   the intro) · **Pool** (how many competitor transcripts, how many cases inventoried, how many own-research
   lanes, how many transcripts were blocked) · **Earlier-videos exclusion** · **Ledger** (what siblings claimed
   and you dropped) · **Freshness rule** + what it cut (name non-English ≥1M videos explicitly, e.g. Totskoye
   2.13M Russian) · **Content filters** + what they cut · **Fiction / hoax cases** (by number; "none" if none) ·
   **Score bar** (iceberg) · **Per-source cap** · **Spread** (years, countries, story types; no two neighbours
   share a type) · **Levels** / **Order** · **Tone** · **Footage rule** · **Length** · **Footage note for writers**.
2. `## Running order` table: # | (Level) | Case | Year | Artifact | Target words | Part, with a Total row and
   per-part totals. Then **Links between cases**: one "A → B" bridge per transition.
3. Per case `### N. <Case> (<years>, <place/platform>, <people>) — ~N words` with: **Status / quick facts**
   (dates, numbers, biggest video found + views + search date) · **Source video** (or "none — own research") ·
   **Summary** (story prose, the beat pool) · **What the source video adds** (incl. myths to correct) · **Extra
   material for the script** (bulleted facts, each with [source]) · **Handle with care** (living/private people,
   what not to show/say) · footage table (Type | What it shows | Link | Note: channel · subs · last upload ·
   verified/checked-by-title) · **Sources**.

## Case picking
- **Hit the brief's case count, and don't overshoot it by more than ~2** (fast food 28 → "the best 20-22",
  2026-11-13; see #0000). If the rules leave you short, don't stop and ask. First widen the research
  yourself (pull more competitor transcripts, harvest more videos, add lanes), then fill the gap with the best
  slightly weaker cases and name them in the delivery note. [2026-11-13: "weaker cases" = weaker REFERENCE
  cases from more reference videos, never own-research lanes (#000).] His answer when the zoo title found 9 of 17 and sent an
  options card: "have more transcripts off more videos find more and after that get it done if not get little
  weaker cases to fill gap but best of best".
- ~~Own research beats competitor cases; inventory refs only for exclusions.~~ Overridden by the #0 case rule
  (2026-11-12). History: the approved icebergs/internet outlines were own-research picks, and generic refs are big
  pools ("disturbing internet media" ~620 cases in 19 refs, "horrific information" ~1,260, "Hispanic TV" ~550) —
  so the pool rarely runs short; filter it by the milked test instead of discarding it.
- Competitor refs can be AI-invented: 4 of 17 zoo refs (K8, XK, gn, og) had cases with no named zoo, vague places and too-neat details. Mark them unverified in the inventory and never pick a case you can't confirm elsewhere.
- Freshness rule used in every approved outline: a case is out if one video ABOUT it has ≥1M views, or ≥3 videos have ≥500k, or it's named in 3+ ref transcripts (any ref, for the "media" titles). For foreign cases count English videos only (US audience), but name big non-English videos in the Freshness paragraph. Record the biggest video + date in quick facts.
- Search the case AND its big explainers/debunkers before `ledger add`, because the ledger can't release claims. Pantry Ghost passed a 10-min search but Captain Disillusion's Short had 1.12M. Harvard morgue passed the scout but Caitlin Doughty had 1.11M. Tay had a 9.46M Internet Historian video. Check Internet Historian, Captain Disillusion, Caitlin Doughty and Shorts by name. Search the case's plain name (no topic suffix like "google maps") plus "documentary", and count long segments inside big videos. 5 of 30 Google Maps picks failed late to NatGeo/VICE/Yes Theory/Cheddar 1–6M videos.
- Cases in scripters/video-outline-builder/examples are Ekam's own used cases. Grep that folder before claiming (Enoshima cat, Hagex, PC Remote-Control Virus).
- Fresh lanes that worked: hacker/Usenet history, net art, court records (US DOJ/FOIA, sentencing remarks, indictments that quote the post), archive.org public-domain films (Prelinger/Wellcome/NARA; US gov DOL/Navy/OSHA/Signal Corps), period industrial poisonings, AI-chatbot incidents 2023–24, fringe figures' and participants' OWN small channels, malware payloads, non-English forums (Tianya, Baidu Tieba, Daum Agora, 2ch, Lurkmore, Yaplakal, French Twitter threads, Polish Wikipedia). Find the ORIGINAL thread on web.archive.org, not reposts.
- Lanes that came back empty: Reddit/4chan deep cuts for "disturbing posts" (Brew/Chilling Scares cover them), and non-English "creepy forum" lanes for generic "internet horrors" (Pikabu, Korea, SEA).
- Each lane yields only 1–3 cases at 80+. Plan ~14 lanes for 25 cases, and seed every lane with 2–4 NAMED leads from the start (unseeded Hispanic-TV country lanes scored 44–79).
- Pre-score candidates with a quick freshness search (`cli script search`) BEFORE commissioning full entries; about half of first-guess fresh cases land under 75. Over-claim ~25% spares and claim 2–3 spares with entries already written (Watson slotted straight in when Harvard failed).
- Score bar (iceberg): 85+ priority, 75–84 usable; a sub-75 exception must be stated and planned short (1990s outline kept one at 74 and said so).
- Content filters he approved: no deaths/suicides on camera, no minors at the centre, no sexual core, no animal cruelty, no story-less gore, no cases whose only footage is TV news/licensed broadcast. Real deaths are stated once, plainly, off camera.
- Be honest about fit: if picks are fresh but more "eerie" than "disturbing", say so in the delivery note (obscure-mysteries did; approved).
- Fiction-led cases (a real show or film whose story is made up): allowed in "horrors from TV/media" titles when
  the broadcast scared real viewers and had real fallout. He asked "did u chose any fake cases?", then pasted La
  cabina, then OK'd it: "oh so it scared people okay canbe considered horrors yes". For each one:
  - The entry's FIRST line says "fiction: a TV film/series, not a real event" and gives the real-world fallout
    that makes it horror (viewers frightened, complaints, bans, ads, replicas). Don't bury it at the end of
    quick facts.
  - Add a **Fiction / hoax cases** paragraph to "How the cases were chosen" that names every fiction-led, hoax,
    legend or unconfirmed case and gives its number.
  - Handle with care: "a TV film", never "footage"; short excerpts under VO; critics' readings stay critics'.
  - In non-TV titles ("disturbing posts", "horrific information") fiction isn't covered by this OK. Ask first.
- Topic-specific:
  - 1990s internet: shallow YouTube pool (~10 true 90s videos, ~25 milked anchors: Heaven's Gate, MPD, Blair Witch, Amy Boyer…). Fresh 80+ cases are page-led, so plan motion-graphic footage.
  - "Increasingly obscure": order from most-covered down to near-zero English coverage. Strongest unsolved case second-to-last, least-documented last.
  - "Disturbing posts": best lanes were last post before a killing (Simon Ng, Daphne Caruana Galizia), court records quoting posts, live-posted incidents (Salam Pax, Interdictor, Athar) and non-English blogs.
  - "Hispanic TV" (approved 30-case recipe: 4 levels, Mexico 10 / Spain 8 / Venezuela 4 / Argentina 3 + others,
    no two neighbours share country AND format, 1969–2026, formats from telenovelas to telethons, ads and state
    broadcasts). Its refs are dominated by live-news tragedies, which the no-news rule kills. Off-air VHS captures mostly sit on 10K–200K archive channels that fail the channel rule. Passing copies are 1–2-clip uploads from 2009–14 personal channels, so plan image-led entries for pulled telenovelas.
  - Google Maps: fresh 80+ cases were map errors with consequences (Isla Calero ICJ), Earth discoveries with papers (Kamil, Steppe/Acre geoglyphs), court records (Boring v. Google, Chatrie) and Cold War/Gulag sites. Mostly image-led: plan Earth/Street View screen recordings; build Maps links only from coordinates printed in Wikipedia/papers.
  - "Caught on camera" (zoo incidents, Old Heritage Files): ~120 leads over 10 lanes gave only 9 claim-safe cases; most incidents reach YouTube only as TV/agency clips (ViralPress, SWNS, Storyful) or VK/Telegram/TikTok reposts. Own-research zoo fills after ~600 searches were thin (no news record). Start from the competitor pool (#0); footage-first harvesting of small 2008–2016 personal channels is a top-up lane. Check what Vol 1 already used. [Since 21:25: use #00, the trained list; own-research lanes only feed the training list's Backup.]
  - Spanish (or other non-English) refs: pull transcripts with `thumbkit.scripters.transcript(id, lang='es')` serially, 3 s apart. Auto-translated English captions get 429'd first (17/20 failed).
  - Caught-on-camera family (dashcam, before-disasters, theme park, generic incidents): ~1 in 9 leads pass. Best
    lane = the person who was there uploading to their own tiny dormant channel (climber/helmet cams, webcams,
    residents). Full recipe and per-topic lanes in brain/playbooks/caught-on-camera.md. Since 2026-11-12 these
    lanes are top-ups only: start from the competitor pool (#0) and trace each pool case's clip to its filmer.
    Since 21:25 the case list is his trained list (#00); these lanes only feed a list's Backup section.
  - Foreign-internet icebergs (Russian, Hispanic internet): refs were paranormal clips, cartel gore and TV-news
    crimes, so the approved picks were own research (before the #0 rule; next time inventory the refs first and
    top up). Apply English-only freshness from round 1 — lanes wrongly cut cases on Russian views
    (Sobchak 5.5M). Best pool = famous-at-home / unknown-in-English, internet-native cases with court or official
    records (Father Sergiy, viper_ns, Primorye Partisans, Lista Tascón, Óscar Pérez's live posts, Rosenberg's
    posthumous video). Judge "English video" by the CHANNEL, not the title: the search CLI shows auto-translated
    English titles. Check English compilations that open with a pick (Fofo Márquez leads a 17.2M Crime Dynasty).
  - Wayback anomalies: refs (~600 names) are weird personal sites. 82–90 picks came where the archived page IS the
    evidence: scrubbed gov pages (TIA, Operation TIPS Feb→Oct→404), the 2600 hacked-pages mirror, doomsday
    homepages still counting after the date, frozen last-update sites of lost climbers, corporate "safety" pages
    before deaths. Give lanes the approved outlines' milked-anchor list up front (two lanes split on Amy Boyer).
  - 60-case lists: 17 seeded lanes gave 129 candidates, only 44 at 80+. Plan a 76–79 tier at 550–650 words from the
    start. Official archive channels (National Archives, BFI) fail the channel rule on YouTube — link their
    archive.org/catalogue copies. Scouts miss UFO/conspiracy networks (UFOTV 1.99M on Alternative 3).
  - Freshness for foreign events: also search native-language TV (Thai TV 1.7M Xe-Pian, Taiwanese TV 2.8M
    Kaohsiung, SCMP 2.46M Hualien) and US local news (WBRE 1.03M), news-animation (TomoNews 1.64M), commentary
    (Ray William Johnson 4.1M) and branded montages (AirlineGeeks 6.4M) — all killed picks late.

## Footage / links
- Priority: (1) the original artifact (live site, Wayback capture, post, original image, court opinion); (2) raw recordings by people in the case from channels <10K subs with no upload in 12 months; (3) in-house screen recordings. No explainers/docs/reactions/news/licensed radio-TV (Art Bell radio and made-for-TV films count as licensed) and no licensing-company clips (see #1 footage rule); competitor videos only as "Reference only — not footage". Caught-on-camera titles use the GREEN/AMBER/RED tiers
  of #00/#1 instead of the <10K / 12-month channel rule.
- The channel rule also catches "official" uploaders: org channels that still post (EFF-Austin) and the subject's own active/>10K channel (Nancy Lieder) fail. Best raw footage came from academics' and filmmakers' small archives (Kirschenbaum's Agrippa, STEIM, Jünker's Abian tapes).
- Passing the channel rule ≠ raw. News packages, outlet re-uploads (WIRED clip), reaction videos, photo slideshows and courtroom clips with a CNN "LIVE" bug are news material even on tiny channels. Grep the assembled outline for news/report/reaction/slideshow/LIVE rows before linkcheck (that caught 9 rows in Hispanic TV).
- Scout footage is wrong ~40% of the time: wrong film (Thule), TV docs posing as raw (Totskoye, Hebgen), the wrong person ("Michael Anderson interrogation RAW" was a different Florida teen). Entry writers check frames or captions against the case, not just the channel. Scouts' facts need checking too (wrong domain, wrong year, wrong "no conviction").
- Say how each clip was checked ("title checked, not watched" / "frames checked"). Image-only cases get "script as reading the record" notes and slightly lower targets.
- Strip the link from rejected footage rows and keep the reason as text; linkcheck still counts rows marked "FAILS / do not use".
- Always re-run linkcheck right before delivery; it caught 2 channels that had uploaded in Oct 2026. Remove failing rows rather than leaving them. Run it right after assembly while YouTube still answers, and keep the RSS last-upload date in every Note so the result survives a later block.
- Channel tool needs a channel URL (/@handle or /channel/UC…; get it with `yt-dlp --print channel_url`), not a watch URL; it reads last upload from the RSS feed (videos.xml?channel_id=).
- YouTube bot-blocks yt-dlp after ~15 pulls: pull all transcripts first in one call; use a per-job yt-dlp config (`player_client=tv_simply,mweb`); if blocked, read the channel RSS and re-run later instead of dropping footage rows. State in **Pool** how many transcripts were blocked.
- When web.archive.org is down, single captures fetched with curl often still load even when CDX/WebFetch fail.
- Sub-agents are denied NexLev/vidIQ/Algrow tools. Download the clip and read a frame grid (~20 frames, every 15 s)
  instead: it caught 6 wrong clips on before-disasters (news slideshow, Iceland lava labelled Goma) and 3 on theme
  parks (a phone filming a TV bulletin; a clip uploaded 2 days BEFORE the incident; one showing the fatal fall,
  which the content filter kills).
- Bot-blocked yt-dlp: a per-job XDG_CONFIG_HOME config rotating player_client (android_vr first, then others) in
  a serial retry loop every ~7 min recovered 9/10 (Russian) and 13/16 (Hispanic internet) transcripts.
- `cli script search` defaults to ≥10-min videos: pass `--min-min 0` when hunting raw clips.
- Linkcheck "CHECK" on hidden-sub single-video channels → check it yourself (channel page, other uploads, agency
  search) and write the result in the Note; don't pass "check those by hand" to him (dashcam and before-disasters
  replies did, 2026-11-12; the zoo outline still had one for Nehru on 2026-11-13 and was sent back). Linkcheck "?"
  rows are unreachable videos (oEmbed 401) → drop them.
- Audio: download every clip's audio and listen/analyse it. Added music → the note says "mute the original audio".
  "Audio may carry an added music bed: check before use" blocked dashcam's done (2026-11-13). "audio not checked"
  is the same gap in other words, even though it got through on zoo and fast food: write "audio checked: …".
- Public records (OSHA, inquiries, court rulings) not online → other archives or news citing the record; else drop
  that visual for another safe verified source. Never "not retrieved, check by hand" (Kings Island 1991: osha.gov
  blocks automated access, so it became a sourced text card from AP 1991 + the Enquirer via FOX19).
- Age-gated / signed-in-only clip: don't leave "set the cut on a signed-in account". Fix the OUT from YouTube's
  auto-thumbnails before the first frame that leaves the safe moment and write that timestamp (zoo, 2026-11-13).
- Hidden-sub or consent-walled channel: verify it from its tabs, other uploads' view counts, the RSS feed or
  yt-dlp, and write the verified fact in the Note (zoo Nehru, 2026-11-13).
- Linkcheck "video unavailable" can mean the owner disabled embedding (web_embedded client): re-check with yt-dlp
  `player_client=tv_simply,mweb` and run the channel tool by hand before dropping the clip; note it in the row.
- Caught-on-camera AMBER links on big or active channels (NJ.com 487k, local papers, police releases) FAIL the
  channel rule by design. Don't swap an approved list clip to please the tool. Write "channel rule waived:
  approved AMBER/GREEN reference clip" in each such row's note and report linkcheck as passing under his rule
  (his answer, 2026-11-12 21:51; see caught-on-camera.md).
- Before-disasters/zoo raw-copy hunts: search the event name in the local language with `ytsearch30:` and
  frame-compare; it found same-day logo-free reposts where the English search found only TV and TikTok copies.
- Reference-only links (docs, competitor videos) go in **Sources**, not the footage table, or outline_check fails.
- A reference transcript that 429s in thumbkit: `yt-dlp --cookies-from-browser chrome --write-auto-subs
  --sub-format json3 --skip-download <url>` got it at once (fast food, 2026-11-13).
- Ledger check fuzzy-matches aliases and person names: Cobra was blocked by "Accelerator", Blackpool Big Dipper
  by "Big One", Popeyes by "Kevin Davis" (an unrelated dashcam crash). Re-check without the alias and read the hit
  before calling a case TAKEN. Claim under a clearer name if needed. It also MISSES real collisions (Kaohsiung),
  so still grep sibling outlines. More false hits on the amusement iceberg ("Islands of Adventure", "Halloween"
  against his channel): claim under neutral, specific names (Dueling Dragons, Ocean Park).
- Iceberg-variant safe visuals: link the actual Commons file page (e.g. File:Wendys1405Monterey1.JPG) in Sources,
  with the author + licence copied. Newspaper photos (Daily Press) and unlicensed viral photos (4chan lettuce) are
  described, not shown.
- outline_check treats any running-order row containing the word "total" as the Total row ("Total Information
  Awareness" broke it) — reword case cells.

## Length / word targets
- Total = 23,000 × length_min/120 (150 min → 28,750–28,900; approved plans landed 28,800–29,800). Set per-case targets to hit it in the FIRST running-order table. The case count sets the average: 16–20 cases → ~1,400–2,100 (avg ~1,700–1,800); 25 cases → avg ~1,170; 30 cases → avg ~960–1,000, with the richest cases at 1,200–1,250. All of these were approved. Longest slots go to the cases with the richest verified material. Never pad; if a case can't fill its target, lower it and say so.
- 30-min clip/iceberg titles (2026-11-12/13): facts carried 3,900–5,900 words (fast food 4,330 at 170–270 a
  case; 10 theme-park reference cases 3,910; dashcam ~5,100). The done-gate wants 5,750 (23,000×30/120).
  ~~so these sit at "ready"~~ — overridden 2026-11-13 09:43 (#0000): 5,750 is the floor; add reference cases
  until the facts carry it. ~~Thin clip cases carry ~120–270 words, so plan ~25–30 cases for a 30-min clip/iceberg
  title from the start~~ — overridden 10:25 (fast food 28 → "the best 20-22"): plan the title's count (+≤2) of
  record-backed cases and get the words from depth (the amusement iceberg's 20 carried 6,030; before-disasters'
  20 carried 6,370 after a depth pass; fast food's 22 carried 6,000). Report the
  gap as words at the gate's number, not as minutes at a made-up wpm ("~31 min at 140 wpm" hid a 1,420-word gap).
- Script length by title: 30-min titles → 6,000–8,000-word scripts, outline ~6,000. 2-hour+ titles → 25,000
  (35,000 for 3-hour). Read job.json before planning; never re-plan a 30-min title to 24k (#0000).
- The word count is for the SCRIPT ("25k+ words was for script"); the outline only plans it as per-case targets in the table. Never run an expansion round to grow outline entries toward the total — he stopped one with "its just outline u don't have to do it for it" (~30 min wasted). When the checker + linkcheck + `status --state done` pass, mark done and tell him. (Growing the PLAN with more real cases to reach the gate is not an expansion round: that is what he ordered on 2026-11-13.)

## Script stage
**His briefs.** Each title's brief gives the script target, the scale factor, the style channels and the cold-open
cap. Use the brief's numbers, not a default:
- new-channel-1 (4 scripts): 25,000 words; Farrell McGuire for intro and structure, Chilling Scares
  Compilations for how it explains things.
- new-channel-2 (5 scripts): 25,000 words (35,000 for the 3-hour disturbing-posts, factor 1.20); redSIRIUS for
  intro and structure, Farrell McGuire for how it explains things.
- Channel 4 (4 scripts, 2026-11-12): 25,000 words from ~48–49k planned outlines (factor 0.51–0.52); redSIRIUS
  for intro and structure; Farrell McGuire AND NoxlyHorror for how it explains things, with an explicit ask:
  "make sure the are variations in terms of explaining stuff instead of same type of explanation templated style
  we have adjcant style that feels new but format stays same". No Noxly style file existed — write one into
  docs/script_work/style_noxly.md from 3+ real transcripts first.
- All: scale EVERY case's outline target by one factor so cases keep their proportions; cold open under 210
  words (<80 s).
Write the scaled targets into docs/script_work/TARGETS.md before writers start. Brief slice writers ~5% OVER
their scaled targets: they land 5–10% short on text-era cases, and the editors can only add ~200 words each from
verified beats. Exception: very short cases (~400–600 words, e.g. 60-case lists) — brief AT target; 10 writers on
60 oddities ran ~17% long (29.3k vs 25k).

**Order of work (each step blocks the next):**
1. VOICE/STYLE: read the reference style notes (scripters/channels/<channel>/style.md) AND the first ~300
   words of 3+ of each channel's real transcripts. Sibling titles overwrite the shared file, so copy it to the
   job's docs/script_work/style_<channel>.md and point writers at the copy.
2. **INTRO: topic first, built from the reference openings (his corrections: sleep-media ×3, all 4 new-channel-1
   scripts, Hispanic TV ×2, disturbing-posts ×2).**
   - Open on the TOPIC — what the whole video covers — never on a scene from case 1. Rejected twice in
     new-channel-2: Hispanic TV's RCTV-anthem scene ("we talk about siuis channel intro style for intro pls use
     it") and disturbing-posts' Simon Ng blog scene ("pls give intro intro" → "new intro, i mean starting as
     topic about what we are covering"). Quick check: if paragraph 1 has a case's date, place and person, rewrite.
   - Plain, full sentences a US viewer gets on one listen. The clipped redSIRIUS-style 71-word version ("Spanish-
     language TV, home to telenovelas…") got "very bad and not something undestable". Take the channel's MOVES,
     not its terseness.
   - Shape that stuck: what the topic is (and why the viewer has likely never seen it) → the kinds of cases and
     their range, one example from each end → a warning if real people died → title drop → "it only gets darker
     as we go" (iceberg/descent) → CTA. 120–190 words. Hispanic TV (123) and disturbing posts (146) follow it.
     The approved sleep-media intro (187) is the Farrell variant: a topic-level scene (a phone glowing in a dark
     room) → "500 hours a minute" → "But not everything that gets posted is meant to be watched and forgotten" →
     a 3-sentence tease of case 1 → CTA.
   - redSIRIUS style.md lists Shape C (open cold inside case one, title drop mid-scene). Don't use it for his
     channels; use Shape A (definition + title drop + darker as we go) or B (scale fact + title drop), written
     out in full sentences.
   - Don't invent an intro: "u have to take inspirations from the reference scripts instead of soley buidling one".
   - Never talk ABOUT the video. Both of these were rejected: "You don't need to stay awake for this one… let it
     play" and "Good evening. I'd like to be straight with you about what tonight is… none of it is a
     creepypasta" ("it does not come from farrell").
   - Case 1 stands on its own and doesn't repeat the intro's facts. When the intro no longer holds case 1's
     scene, case 1 must carry it (disturbing posts: case 1 now quotes Simon's whole post).
   - Write the intro/outro frame lines AFTER reading each case's real timeline, and give the fact checkers the
     frame claims as an explicit list (Google Maps reviewers caught "a map sent soldiers").
   - In the reply, name which reference opening the intro follows.
   - **The outline's "Cold-open note" doesn't override this.** The approved zoo and incidents outlines say "open
     cold on case 1's own footage/camera" (Toronto tiger yard; Whitewater hiker). Write those intros topic-first
     anyway. Case 1's footage can come right after the subscribe line. Future outlines write the Cold-open note
     topic-first, like dashcam ("Open on what the video covers…") and fast food ("open on what the video covers, not
     on a case scene"). For a Vol 2 of his own title, don't reuse Vol 1's opening line (dashcam).
   - 30-min caught-on-camera/iceberg scripts (none written yet): 6,000–8,000 words from a ~6,000 outline (factor
     ~1.0–1.3). Read job.json first. Never use 25k.
3. **CTA / subscribe line: different in every title of a batch** (grep siblings' docs/script.md AND
   docs/script_work/cfg.json for "subscrib" before finalizing; Russian and Wayback still collided on a "quick favor
   before we go under/start digging" shape on 2026-11-12; Hispanic internet used an identity line instead). "diff type of CTA for 5 of em, cant have same
   1:1 CTA like little different". All 9 scripts so far began "If you like these types of videos, please
   subscribe…" because scripters/script-skill/SKILL.md (Subscribe line) prescribes that opener. His correction
   overrides it: before writing, grep the siblings' subscribe lines and use a different structure, not just a
   different ending. The one he saw after the fix: "Before we head down, if you're the kind of person who stays up
   watching stuff like this, hit subscribe. It's the easiest way to help a channel this size keep digging up
   broadcasts nobody translated." Still one short paragraph, right after the intro.
4. In a batch, read the sibling scripts' intros first. No two titles share an intro template: "can u please fix
   the same intro of 4 of the script". All 4 had: "It's <date>" scene → "the internet used to be" paragraph →
   example at each end → title drop → same subscribe tail. Get the variety from different moves in the reference
   openings, never from shapes you made up.
5. **STRUCTURE.md, mandatory before any writer starts.** His correction: "each of the scripts have too similar
   structures making in generic". The sleep-media draft ran every case as grounding → background → straight
   chronology → legal/aftermath tail → "still online today", and 10/16 cases opened on a date. For each case pick
   ONE architecture from what's unique about it (told in real time / withheld reveal / cold open on the casualty /
   countdown / the debate for and against / lurking the thread live / label vs. the record / whodunit / second
   person "you're the user" / follow-the-infection), plus an opener type and an ending type.
   - No two neighbours share any of the three.
   - ≤3 date openers per script; ≤3 cases end on legal status, "still online" or a quote.
   - Writers get their cases' STRUCTURE lines verbatim. Varying first/last sentences alone does NOT fix this.
   - A second-person or decree frame must carry the whole case, not one sentence before falling back into
     biography (re-score flagged Didulo, Quiet and RayEl).
   - Put 2–3 host-reaction lines per case into STRUCTURE.md, each anchored to a specific fact. Asking writers for
     a rate leaves I-voice at ~3–4/1k (Google Maps, 6 writers), and editors that cut stock asides ("So who…?" ×26,
     "I can't get past" ×12) drop it further.
   - Re-check ending types after EVERY edit round: editors re-created 6 "nobody held to account" endings and 5
     "So…" recap closers in internet horrors.
6. Explainers list: one line per term (Usenet, remailer, FAQ, NetEase…) and the ONE case that explains it. The
   obscure-mysteries draft explained Usenet 3× and the remailer 2× because 4 slice writers each explained it.
   Give each explainer an explaining MOVE too, and vary them across the script (everyday analogy · plain one-line
   definition · show the artifact and read it · number first · what it looked like to the user on the day ·
   before/after). No two neighbouring cases use the same move; the format stays the same. (Channel 4 brief.)
   What worked on the Channel 4 scripts: a lead-explanation-move column in STRUCTURE.md (A–I: comparison, scale
   number, rewind, native word, read the document, picture this, two versions, step-by-step, US equivalent; 1–2
   per case, no neighbours sharing one). What still slipped, so put it in the writer brief up front:
   - The "So what/why…? + answer" explainer: 27 of 60 oddities cases used it even with a 12-move menu → max 1 per
     slice.
   - Announced explainers ("one bit of background", "let's count up", 28× "let's" in Russian internet) → ban
     announced lead-ins; just explain.
   - Self-answered question openers (27 left after editors cut "So") → cap per case.
7. Write: parallel slice writers (~5 cases each; 4–6 writers worked), each with TARGETS + INTRO + STRUCTURE +
   explainers + VOICE, briefed on the cadence band from the start (contractions ~18–30/1k per case, I-voice and
   host-judgment lines, questions). Top up short cases only with real logged material from the outline's
   sources, never padding. A case 10–17% short because "the material ran out" is acceptable to flag.
8. Run `cadence_check.py` on the FIRST assembled draft, not only at the end. Writers following the script skill
   alone produced I-voice ~0.5/1k, questions ~0.3/1k and six cases under the contraction band.
9. Reviews (story, style, facts A/B). Swap cases across tiers right after the story review (e.g. a quiet
   mailing-list mystery out of a "consequences" tier) and rebuild before the adversarial pass.
10. Editor pass **= his VO cadence skill** (scripters/vo-anti-ai-cadence/SKILL.md):
   - Edit like an editor, not a rewriter; keep the word count and the facts.
   - Run `python3 scripters/vo-anti-ai-cadence/cadence_check.py docs/script.md` and fix what it flags (per-case
     contraction band, host presence, triads, tics, phrase tells).
   - Do its eyeball passes (§1 structural tells, §7 first/last lines side by side).
   - It is the default, not an extra; he had to order it on all 4 scripts at once.
   - Split the editor by slice (2–3 parallel editors). Give each editor a hard per-case floor (target −10%) AND a
     net word floor for its slice up front; one editor over-cut Case 19 by 40%, and 3 editors took horrific
     information from 25k to 24.26k (under −3%).
   - Rule-heavy review rounds flatten the host voice. Re-check I-voice and questions after them, and look
     across slices for a shared added opener ("So how…" ×9).
11. Adversarial pass → clean-wording pass → word count within ±3% of the target → mark done.
   - Adversarial safety cuts (method detail, procedure tails, private people) took the 35k script ~800 words
     under. Restore cut beats from the r0/ snapshot, or top up from primary documents the outline already lists
     (court opinions, sentencing memos, appeal judgments): 585 real words in ~4 min, and the rescore liked them.
   - **Ad-safety sweep by hand before delivery**, because check.py and sens.py miss: suicide euphemisms ("ended
     their lives", "died by their own hand"), anatomical words (cervix), and weapon-handling detail ("cleared the
     jam and kept firing"). Grep for fired, shot, jammed, trigger, reloaded and rewrite to the outcome only.
   - The done-gate refuses the word "Wikipedia" in narration, even when it's part of the story; rephrase. On
     Wayback-topic titles the tools flag "wayback" as a research leak too: keep the name to the intro title drop
     and vary "a copy saved in March 2001 / the next snapshot".
   - Host-voice restoration: editors who CUT stock asides ("I don't think" ×16, "I find" ×9) drop I-voice to
     2–5/1k. Tell editors to REPLACE each stock aside with a fact-anchored line (from STRUCTURE.md), not just cut.
   - Reject reviewer-proposed host lines that invent narrator research ("I ran the numbers", "I went down the list
     twice", "by my reckoning") or place the narrator in the story ("the state we're in"). Plain fact-anchored
     judgments only.
   - **Legal/insinuation rescore after every host-voice round.** Added lines hinted guilt for never-charged people
     ("Eight days is a long time…" about a dead uncharged man; an unconvicted brother's motive; a named businessman
     with no qualifier). Frame lines overclaimed cause ("didn't survive what they published" for a custody killing)
     or scope (a Level line false for one of its cases; Russian Sleep Experiment isn't Runet) — check every level
     line case by case. Euphemism sweep also catches "he deleted himself" for an infosuicide case.
   - Reviewers/editors write findings to file progressively; an adversarial agent that writes only at the end lost
     everything on a restart.
   - Do the story review's running-order swap mechanically in the slice files before editors start (Wayback).

**Agents and restarts (script stage):**
- A session restart kills editor/writer sub-agents silently (no notification, ListAgents empty). When a
  notification is overdue, check file mtimes and ListAgents.
- Editors save per case and write a triage file FIRST. To resume, diff their output against the r0/ snapshot per
  case to see what survived, then continue from there; don't relaunch from scratch.
- If the agent ids still answer, SendMessage resumes them with context and saved edits intact (Hispanic TV,
  internet horrors: ~3 min each for the adversarial round). Same for outline entry writers: all 4 Channel 4
  outlines lost 8–12 writers to a restart and "finish only entry_NN" via SendMessage finished every one
  (~2–25 min). Do it immediately, without waiting for Ekam.

**Line-level voice (his corrections):**
- Simple, literal VO lines that a person would say out loud, with one idea per sentence. "The person holding it
  stopped really watching a while ago" = "this line too complicated prolly". It became "Whoever's holding it is
  half asleep, just letting the next video play".

**Recurring draft faults the reviewers caught (fix in the writer brief, not later):**
- Myth-correction tic: "it's often retold / most retellings say…" used 15× in one script. State the true version
  plainly; keep the correction move only where the correction IS the story.
- Same closing move across cases: 5 × "nobody's ever identified who", 5 × "the archived page still survives",
  8/20 last lines with "still". Same hedge shape ("That's X's account, and nobody's confirmed it") ~11×.
- Stock host asides and question openers repeated across slices: "So who…?" ×26, "I can't get past" ×12. Give
  writers fact-specific reactions per case instead.
- Frame lines (intro, tier lines, outro) that overclaim against the script's own numbers ("a few hundred
  thousand people" when case 1 cites 4M views; "we leave the English internet" when earlier tiers had Russian
  and Chinese cases; "a map sent soldiers"). Check every sweeping frame claim against the cases.
- Intro scene re-told word for word when its case arrives — call back to it instead (and now: keep case scenes
  out of the intro altogether).
- Using a person's name before introducing them; reveals before the scene where they happen.
- Voice drift between slices (one slice newsroom-log, one joke-heavy): the shared VOICE + STRUCTURE files are the fix.

## Running a batch (siblings run at the same time)
- **A correction that names the batch or a count ("for 5 of em", "4 of the script", "for new channel 2") applies
  to every title in the batch.** Fix all of them in the same turn and list each title. The Hispanic TV lane
  answered the CTA correction with "I only changed my own", and the posts intro was rewritten 1.5 h later still
  carrying the old CTA. If the lane can't edit siblings, it hands the fix to each sibling job itself; it never
  leaves it to him.
- A number next to "outline(s)/script(s)" counts TITLES. "none of the links of 5 of the outline are not from
  linsed companies right" meant all 5 Old Heritage Files outlines; the zoo lane read it as case #5, checked only
  its own title, and he resent the fix to all 5 jobs. A licensing/safety correction always covers the whole batch.
- Siblings with adjacent topics (incidents / dashcam / before-disasters) claim the same events within ~20 min
  (Kaohsiung, Mandra, Etna 2017, Yeysk, Kinabalu, Bondo, Seest, San Bruno). Run `ledger` check with aliases before
  writing even a scout card; let round-2 scouts ledger-add themselves at ≥72; start entry writers on locked cases
  while later lanes still scout.
- Claim on the ledger the moment a candidate scores ≥80 / a lane returns (siblings took ZetaTalk, Netochka Nezvanova, Sporgery, jodi.org, Serdar Argic, Bonsai Kitten within ~20 min). Re-run `ledger add` for every final pick right before writing the outline, and `ledger list` after dropping — entries can vanish when siblings rewrite claims_ledger.json.
- Paste the current ledger + exclusion list into every discovery agent's brief; run 5–6 parallel discovery lanes, ≤6 picks per lane.
- Sub-agents die on session restart: ≤2 cases per agent, ≤12 min scouting, write the part file early and append as they go. The lead checks for missing part files and re-dispatches or writes them itself — immediately, without waiting for Ekam.
- Dossier writers re-run freshness FIRST and stop with "FAILS FRESHNESS" if it fails (this worked on Harvard morgue).
- Temp files and style copies go under the job's docs/ (parts/, script_work/), never shared /tmp/<generic>.md or the shared channel style.md.

## Talking to him during a run (his corrections, 2026-11-11)
- Never stop and wait for a message ("send a message and I'll pick it up"). Resume on your own after any error or restart. He had to ask "is it done?" 5× and "why is it stopped? pls start". When the work is finished, mark it done: sleep-media sat on "working" after his approval until he wrote "its stalled pls make it done".
- Status = Yes/No first, then cases picked / entries written / checks passed / what's left / ETA, for the title he named. Plain English only. "any updates on outlines" got "in progress, can't give a solid ETA yet". Give a rough ETA from entries left × time per entry instead.
- "MAKE IT DONE" = mark done what exists now; never widen scope or switch to the full pipeline.
- "What % is done?" → one number from the stage list above (draft 40% · reviews 55% · editor/cadence 75% ·
  adversarial 85% · clean-wording 95% · done 100%), identical in the live lane and the scripter lane. On
  obscure-mysteries the live lane said "roughly 98%" and the scripter said "75%" for the same moment; he asked
  for status 3× in 25 min.
- When he sends a correction mid-run ("too similar structures", "same intro"), say in one line what you'll
  change and where it lands in the order of work, not just "passed to the scripter".
- When he quotes a line ("Re: …"), fix that exact line, then reply with the new line and anything else that changed
  with it. The sleep-media "too complicated" fix was answered this way, and he didn't push back. When he quotes an
  intro and says "give intro", write the topic-first intro straight away; the options card (A topic / B hook / C
  the old case scene) cost a round trip on disturbing posts.
- Short on cases → widen research and fill with the best weaker cases yourself (see Case picking); don't send an
  options card first.
- Delivery reply for an outline: "Done (gate passes): N cases, W words, linkcheck …" — and only after the gate
  passed. If you catch yourself writing "weak spots" or "check by hand" in the reply, go fix them first (#0000).
  Before-disasters still closed with a 6-item "Weak points" list (blur two boys' faces, mute library music,
  low-res copies, one-witness outcome); turn each into an instruction in the entry (e.g. "blur the two boys'
  faces", "mute the original audio") and leave only real source disagreements, labelled.
- **A question is not an order.** "u think we are making 24k word script for them" meant no. When a message would
  multiply the work (4× words, every title at once) and its numbers don't match job.json, confirm in one line
  first; a lane that starts a wrong re-plan burns the whole batch (6 lanes stopped, 2026-11-13 10:24).
- A yes/no safety question ("none of the links … are from licensed companies, right?") = "make it true". Fix every
  doubtful row across the batch first, then answer "Yes — all N links in all M outlines checked, X replaced".
  Never "Mostly yes" plus a list of doubts.
- **When his standing rule already decides it, act.** The Old Heritage Files audit (09:14) and the zoo follow-up
  (12:10) both ended "Should I go ahead / replace #5 and #10?"; he answered "replace" both times. "Any doubt =
  replace" and "every case needs footage" are standing orders — fix, then report.
- **Never end the turn while helpers run.** "I'll wait for the scouts" (09:29) → app restart → helpers dead →
  "any update" ×6, "Now?", "is it done" ×2 over ~4 h. The live lane answering "your message reached the scripter"
  is not a status; give the Yes/No + what's left + ETA.
- **One answer per question.** "ok now u have verified it perfectly?" got "Yes, it's done" and "No, not perfectly"
  12 seconds apart from two turns. Only the lane doing the work answers, once.
- **When his rules together defeat what he wants, say it.** The 15:03 rebuilds each reported "only 2–6 of 20 from
  the competitors, the rest own research" and filled the gap anyway; he then spent ~5 h retraining the method. Say
  the conflict first in one line ("the strict TV rule kills 80% of your source cases; allow civilian clips TV
  aired?"), then fix.
- A mid-run correction that arrives while a rebuild is going (15:12 "only take cases from references #…") is applied
  in that same run. Reply in one line with what changes, not "passed to the scripter".
- **"Where did the cases come from?"** → answer in one line with counts (competitors vs own research). If the method
  contradicts what he asked, say so and switch to his rule — don't defend the SOP for a paragraph.
- "Any fake cases?" → never a flat "No". List by name every fiction-led, hoax, legend or unconfirmed case, with how
  each is labelled. If he names the batch ("for new channel 2"), check all its titles before answering. On
  Hispanic TV the reply said "none of my 30 cases are made up" and left out the 4 fiction-led TV stories, so he had
  to find La cabina himself. The options card that followed (keep / swap one / swap all, with reserve scores) was
  the right move.
