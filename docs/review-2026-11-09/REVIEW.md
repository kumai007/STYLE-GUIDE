# Review: motion graphics and learnings from all Videos\CLAUDE folders (2026-11-09)

Every row has an ID (MA-12, LC-40 ...). Tell Claude the IDs to add, change or drop.
Status: NEW = not in the Farrell guide yet. CONFLICT = breaks a Farrell rule (reason given). IN GUIDE = the guide already has it. Sources were only read, never changed.

| Part | NEW | CONFLICT | IN GUIDE | Tool notes |
|---|---|---|---|---|
| MA Motion graphics A (editor-v5 templates, PROJECT/graphics) | 95 | 63 | 99 | 0 |
| MB Motion graphics B (learned anims, EncountersStudio, Farrell inventory) | 33 | 29 | 42 | 0 |
| LC Editing learnings C (EDITING_RULES, PLAYBOOK, EDITING_KNOWLEDGE, OWNER_TASTE) | 150 | 21 | 21 | 0 |
| LD Learnings D (memory files, CLAUDE.md lessons, tool notes) | 46 | 14 | 13 | 124 |


# MA: Motion graphics A (editor-v5 templates, PROJECT/graphics)


Path legend: `MT` = `C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES`; `PG` = `C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics`; `editor-v5\DOCS` is under `C:\Users\ayush\Videos\CLAUDE\PROJECT\`. Preview paths are absolute. "Looks" text comes from each catalogue's notes (timecodes removed), not from viewing the sheets. Most templates default to non-VCR fonts but fonts are props, so only an obvious font or look break is marked CONFLICT. `legacy/` has 4 top-level folders (404Rendrer, EncountersEditor, SCARY8, titlecut_fern); not itemised. Statuses are judged from the guide rule book (Motion graphics "Never" list, rules 1, 2, 3, 10).


### MASTER_TEMPLATES / src/hn / dd (Disturbing Dose)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-1 | CaveGlitch | CV glitch A , , ; glitch B | VO → raw hand-over: f0 +0.2 s after the last VO word (stakes word), the raw's sound starts on f0... | IN GUIDE: Glitch / static | MT\src\hn\dd\CaveGlitch.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_CaveGlitchA.jpg |
| MA-2 | ChannelPageBuild | CV (also | case opener: "When/On <date>, <uploader> …" — page builds, date lands on the spoken date words... | IN GUIDE: Page plane | MT\src\hn\dd\ChannelPageBuild.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_ChannelPageBuild.jpg |
| MA-3 | ClipCaptions | CV yellow chunk captions (all raws, ) + red editor notes , , , ; D2 white captions 54.7–67.7 | every raw with speech (never the VO); notes for what the viewer can't hear/see ("[moving... | CONFLICT: burned captions | MT\src\hn\dd\ClipCaptions.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_ClipCaptions.jpg |
| MA-4 | CurvedArrow | CV | the VO names the video / item on a page; the arrow draws onto it as the date fades | NEW | MT\src\hn\dd\CurvedArrow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_CurvedArrow.jpg |
| MA-5 | MysteryCarousel | D3 E7 ; D2 E5 | one case change per video, VO running straight through ("…just like our next clip") | NEW | MT\src\hn\dd\MysteryCarousel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_MysteryCarousel.jpg |
| MA-6 | PhotoNameBar | CV "Alex", (two tags); D2 name boxes | first mention of a person who has a portrait (uploader, victim's companion) | NEW | MT\src\hn\dd\PhotoNameBar.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_PhotoNameBar.jpg |
| MA-7 | RampFlash | CV (15/15 f), , , (23/16), one-way 9 f | into a new place/phase inside a case (diagram, aftermath), or raw → next case's white page | CONFLICT: white flash ramp (bright) | MT\src\hn\dd\RampFlash.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_RampFlash.jpg |
| MA-8 | RedWashCut | D1 "dangling over the Ohio River"; D1 bloom page entry | one-off accent on the scariest place/object line (never on a person) | NEW | MT\src\hn\dd\RedWashCut.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\dd_RedWashCut.jpg |
| MA-9 | Counters / readouts / gauges (14) | Big number, LED/segment readout, ring gauge, smoke or particle-dissolving number, rolling money or views | A figure is said and you want it shown big (any of 14 versions) | CONFLICT: counters, charts and particles are banned (Motion graphics: never charts or counters) | MT\src\hn\ farInfo/IconReadout, SegCounter, GaugeRing, LedFigure, StatSentence; farIsrael/RateFigure, Leaderboard; farGrindr/BalanceDrain, ViewsPop; horrors/LedNumeral; vvMore/VVScreenCounter; ddMore/DisintegrateNumber; dd/SmokeNumber; lemmino/NeonCount | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_SegCounter.jpg |

### MASTER_TEMPLATES / src/hn / ddMore (Disturbing Dose)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-10 | DatePlateCard | D1 C16 date card on black, ADAPTED: the black is the case footage blurred 26 px at brightness... | the case's dated first sentence ("On November 19th, 2017, …") when a beat of separation is wanted... | IN GUIDE: Year / chapter title | MT\src\hn\ddMore\DatePlateCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_DatePlateCard.jpg |
| MA-11 | DiagramPlate | CV (photo + white hand-drawn passage, black heavy label, mustard #A77F05 block arrow drawn in... | explaining a place's shape ("crawl into the tree cast, a tight hollowed-out entrance"); enter with... | CONFLICT: invented diagram | MT\src\hn\ddMore\DiagramPlate.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_DiagramPlate.jpg |
| MA-12 | FlipBoard | CV (title board: shrink into tile, tiles hinge down 1–8, tilt up to the drip title, tile 3... | the delayed title / promise line after case 1: "…the eight most disturbing caving moments" on the... | NEW | MT\src\hn\ddMore\FlipBoard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_FlipBoard.jpg |
| MA-13 | ProductPullOut | CV (white-out, product pops/spins in, cyan LCD counts up 0→98, turns red and counts down to... | once, for an object the VO names as failing ("the oxygen meter began going off") | CONFLICT? keyword "white flash / bright" in catalogue text (check): NEW | MT\src\hn\ddMore\ProductPullOut.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_ProductPullOut.jpg |
| MA-14 | ScanlineEndCard | D3 (11 f streak/flare glitch, next video's clip fades up LINEAR 25 f under 18 px sine... | the very end under the CTA "…watch this video next" | CONFLICT? keyword "end card / CTA" in catalogue text (check): NEW | MT\src\hn\ddMore\ScanlineEndCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_ScanlineEndCard.jpg |
| MA-15 | TileDrop | D3 (full-frame red tile drops over the last shot in 14 f, translucent "1" focuses in... | the hand-off from case 1 into the title device ("But this was only number one…"); pair with the... | CONFLICT: shape-reveal transition (rule 3) | MT\src\hn\ddMore\TileDrop.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_TileDrop.jpg |
| MA-16 | WarpCard | D3 E6 + (red #CF0609 12 px pincushioned card, glow, −1.8 %/s linear pull-out, two-tone place... | a news photo / aerial of the place on "Meanwhile…" (in by GlitchStreak, out by WhiteFlash); the D2... | CONFLICT: warp slide-in transition (rule 3) | MT\src\hn\ddMore\WarpCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\ddMore_WarpCard.jpg |

### MASTER_TEMPLATES / src/hn / horrors (Farrell (Horrors))

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-17 | AliasTile | Pixel/placeholder tile for an anonymous user or handle | An online alias or protected person is named | NEW | MT\src\hn\ farPeople/AliasTile; horrors/AliasTile | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_AliasTile.jpg |
| MA-18 | ArticleRed | DW WIRED paragraph; "$5,500" turns red #BA2D39 at on the word | the VO reads from a source article; the spoken figure / key word changes colour on the word | IN GUIDE: Page plane (+ Line highlight) | MT\src\hn\horrors\ArticleRed.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_ArticleRed.jpg |
| MA-19 | BroadcastDeath | GS (fade, analogue snow, streak frame, black, colour bars | "the broadcast was cut off"; a feed / livestream dies | IN GUIDE: Glitch / static | MT\src\hn\horrors\BroadcastDeath.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_BroadcastDeath.jpg |
| MA-20 | ExplainerPage | DW dark "What is oxycodone?" health page, tilted plane, drifting, 2 views | a hard term (drug, tool, law) is first named and needs a reference page | IN GUIDE: Page plane (+ Line highlight) | MT\src\hn\horrors\ExplainerPage.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_ExplainerPage.jpg |
| MA-21 | IconRow / PictoExplainer (pictogram rows) | Row of small icons that pop one per spoken noun, or icons explaining a scheme | The VO lists objects or explains a scheme | CONFLICT: invented infographic / pictograms | MT\src\hn\ farInfo/IconRow, PictoExplainer; horrors/IconRow | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_IconRow.jpg |
| MA-22 | NameLabel | DW (left), (right), (pair under two faces | a real person's name is spoken over their photo or footage; the label pops on the surname, ±0.1 s | IN GUIDE: Source label / editor note | MT\src\hn\horrors\NameLabel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_NameLabel.jpg |
| MA-23 | PhotoCardRise | GS : doctor photo card rises over the blurred, darkened clinic photo; lands 0.3 s before the... | introduce an official / doctor / witness after the place is shown; no name strap | IN GUIDE: Photo push | MT\src\hn\horrors\PhotoCardRise.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_PhotoCardRise.jpg |
| MA-24 | SourceCredit (credit tag) | Small credit line for borrowed footage or page | Borrowed clip or page plays and its source is credited | IN GUIDE: Source label / editor note | MT\src\hn\ farBroll/SourceCredit; horrors/SourceCredit | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_SourceCredit.jpg |
| MA-25 | StockClause | DW B/W 4:3 clause stock; stamps: year (DW "2022"), figure (DW "$400.000", +0.2 s), red coords... | backstory with no footage; one literal stock shot per clause, plus a year / figure / coordinates... | NEW | MT\src\hn\horrors\StockClause.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\horrors_StockClause.jpg |

### MASTER_TEMPLATES / src/hn / farBroll (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-26 | CurvedGallery | YT Tutorials (whips 0.33–0.5 s, holds 1.2–2.0 s, focus screen .59 W); FINDINGS_farrellB F13... | "thousands of these videos / listings / tutorials" — scale of a phenomenon | IN GUIDE: Split screen / grid / card row | MT\src\hn\farBroll\CurvedGallery.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_CurvedGallery.jpg |
| MA-27 | DeviceInsert | Grindr phone (x .349–.651, grey radial ground, locked 12–16 s, dissolves 0.9–1.4 s); SL... | an app screen / vertical clip / webcam still the story refers to, shown on its device | NEW | MT\src\hn\farBroll\DeviceInsert.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_DeviceInsertPhone.jpg |
| MA-28 | MonitorWall | CC (fade-up 1.1 s, push +1.3 %/s, pan −2.0 %W/s, tilt −0.6 %H/s, barrel k .18, OSD per feed | "the cameras", surveillance network, many feeds at once | IN GUIDE: Split screen / grid / card row | MT\src\hn\farBroll\MonitorWall.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_MonitorWall.jpg |
| MA-29 | ScreenZoom | Snowden (+154 % in 4.82 s, u^1.35, pan/tilt keep screen centred, hard cut to the capture); SL... | "…and on that screen" — move through the glass from a scene into the page/clip it shows | NEW | MT\src\hn\farBroll\ScreenZoom.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_ScreenZoom.jpg |
| MA-30 | StockMontage | farA §0.1/§3: CC // list, CC , GF-3 colour→B/W switch | a run of sentences / a spoken list; cut each shot on its noun's word time | NEW | MT\src\hn\farBroll\StockMontage.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_StockMontage.jpg |
| MA-31 | StockShot | GF Phoenix, CC western city (colour); GF house / light bar (teal B/W 4:3); GF dog walk (warm)... | any single stock picture for one sentence / noun; establisher, ordinary life, the scene | IN GUIDE: Photo push | MT\src\hn\farBroll\StockShot.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_StockShot.jpg |
| MA-32 | WindowFrame | GF , laptop hands, pills (x .125–.876); OnlyFans STUDY archive #010002; GF vertical | crime-grade stock / archive / vertical phone clip that must not fill 16:9 (never blur-fill) | NEW | MT\src\hn\farBroll\WindowFrame.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farBroll_WindowFrame.jpg |

### MASTER_TEMPLATES / src/hn / farCCTV (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-33 | BilingualStack | CC cyan EN headline over ZH headline | a foreign outlet's headline, given in English with the original underneath | IN GUIDE: Mono label over blur | MT\src\hn\farCCTV\BilingualStack.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_BilingualStack.jpg |
| MA-34 | CctvReframe | CC re-frame punch-ins; tints; double exposure | the incident clip itself; a key moment is reframed, never slowed | NEW | MT\src\hn\farCCTV\CctvReframe.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_CctvReframe.jpg |
| MA-35 | ClothTerm | CC "2015" → 雪亮工程 printed on the white flag + gloss | the name of a programme or term first appears, after its year | IN GUIDE: Mono label over blur | MT\src\hn\farCCTV\ClothTerm.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_ClothTerm.jpg |
| MA-36 | DetectBoxes | CC white machine-vision boxes on CCTV | AI / facial recognition / tracking is described | CONFLICT: tracked graphic (AI detect boxes) | MT\src\hn\farCCTV\DetectBoxes.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_DetectBoxes.jpg |
| MA-37 | FarGlitch | CC / / tear; / mosaic; chroma; rays; streak; white bars | A→B transitions (2–8 f), rotated so the same kind never runs 3× in a row | IN GUIDE: Glitch / static | MT\src\hn\farCCTV\FarGlitch.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_FarGlitch.jpg |
| MA-38 | GlowPlate | CC landmark photos as glowing CRT plates with caption bars, ray-bloom entry | listing named places or buildings during a place cold open | IN GUIDE: Mono label over blur | MT\src\hn\farCCTV\GlowPlate.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_GlowPlate.jpg |
| MA-39 | GlyphWall | CC red pixel camera wall, 1 blue frame first | "hundreds of thousands of cameras / devices / accounts" | CONFLICT: kinetic glyph wall (particles/typography) | MT\src\hn\farCCTV\GlyphWall.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_GlyphWall.jpg |
| MA-40 | LoginType | CC rebuilt CJK login on a CRT, "wu" + password dots typed | "he logged in with…", default credentials | IN GUIDE: UI recreation / typing | MT\src\hn\farCCTV\LoginType.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_LoginType.jpg |
| MA-41 | NoSignal | CC static → 无信号 No Signal → tear → blank → DVR blue | a feed is lost or cut; "channels of static" | IN GUIDE: Glitch / static | MT\src\hn\farCCTV\NoSignal.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_NoSignal.jpg |
| MA-42 | PriceTier | CC register → navy ¥ tier → red tier → flat reminder → camera count | the prices or tiers of an app or a black market; escalation shown by colour | CONFLICT: chart-like price tiers | MT\src\hn\farCCTV\PriceTier.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_PriceTier.jpg |
| MA-43 | QuoteLift (quote rises out of source) | Quoted paragraph lifts off the page onto dark footage | The VO reads a source quote word for word | IN GUIDE: Quote card / read-out | MT\src\hn\ farCCTV/QuoteLift; farGrindr/QuoteLift | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_QuoteLift.jpg |
| MA-44 | RecOverlay | CC light-streak whip → huge REC + blinking dot | "recorded", "the camera was rolling" | NEW | MT\src\hn\farCCTV\RecOverlay.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_RecOverlay.jpg |
| MA-45 | ScreenLogo | CC eye logo (red glitch + "OFFLINE" ghost); bilibili LED; QQ / Baidu Tieba; boot + spinner... | a company, app or status is named; the logo is shown as a macro of an LED screen | CONFLICT? keyword "3D / spin" in catalogue text (check): NEW | MT\src\hn\farCCTV\ScreenLogo.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_ScreenLogo.jpg |
| MA-46 | TranslateDim | CC 上帝之眼.apk → "The Eye of God" | the narrator gives the English meaning of on-screen foreign text | IN GUIDE: Mono label over blur | MT\src\hn\farCCTV\TranslateDim.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_TranslateDim.jpg |
| MA-47 | YearInScene | CC "2018" as light on burlap + phone; "2017" difference-blended over a held icon; / plain | a chapter opens on a year that is part of the picture | IN GUIDE: Year / chapter title | MT\src\hn\farCCTV\YearInScene.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farCCTV_YearInScene.jpg |

### MASTER_TEMPLATES / src/hn / farGrindr (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-48 | MaskTitle | GR "GR[mask]DR" | the video / platform title on the spoken name, fast push, hard cut to host | NEW | MT\src\hn\farGrindr\MaskTitle.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farGrindr_MaskTitle.jpg |
| MA-49 | OutlineFlight | GR ; Spain cyan → NL yellow; NL → USA red | chapter / case change, music only: hold old country, fly, new country glows in a new colour | IN GUIDE: Map / place card | MT\src\hn\farGrindr\OutlineFlight.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farGrindr_OutlineFlight.jpg |
| MA-50 | PinBoard | GR (two cases on cork + red string), (mugshot pops on), (green cutting mat, taped), (postcard... | "two different cases", "linked both homicides to him", community / suspect boards, a place as a... | NEW | MT\src\hn\farGrindr\PinBoard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farGrindr_PinBoard.jpg |
| MA-51 | PunchCard | GR "It wouldn't last **forever.**"; "He would *never*…" (red); italic build; over red... | the one fateful line after 0.5-2 s of silence; then dissolve into the consequence image | NEW | MT\src\hn\farGrindr\PunchCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farGrindr_PunchCard.jpg |
| MA-52 | StatusGlyphs | GR signal/wifi/battery; one bar pinging → nothing; call ringing out; pause over B/W | connection lost, the last ping, calls that stop, the narrator "pausing" the story | NEW | MT\src\hn\farGrindr\StatusGlyphs.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farGrindr_StatusGlyphs.jpg |

### MASTER_TEMPLATES / src/hn / farInfo (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-53 | DateSuper | Instagram Ads ("2018" + "Leeds, England"), Horrors DW (thin year stamp), GoFundMe ("March... | WHEN (+ WHERE) on the establishing shot, no card | IN GUIDE: Year / chapter title | MT\src\hn\farInfo\DateSuper.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_DateSuper.jpg |
| MA-54 | FocusDate | School Laptops ("NOVEMBER / 2009" | opening WHEN: footage fades up from black, the date blooms in out of focus and slowly sharpens... | IN GUIDE: Year / chapter title | MT\src\hn\farInfo\FocusDate.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_FocusDate.jpg |
| MA-55 | FootageNumber | CCTV ("20 meters deep" thin inside 4:3 CCTV), (red "34" over backlit silhouette, spot drops to... | the event's number written into the real footage; the person's age the instant the light dies | NEW | MT\src\hn\farInfo\FootageNumber.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_FootageNumber.jpg |
| MA-56 | IrisSpot | YouTube Tutorials | "on <date>, <person>…" — past photo in a soft iris after 1 s black, 2-frame flash, date with RGB... | CONFLICT? keyword "white flash / bright" in catalogue text (check): NEW | MT\src\hn\farInfo\IrisSpot.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_IrisSpot.jpg |
| MA-57 | NicknameRed | Instagram Ads | the killer's / suspect's nickname after a beat of silence, over his face in red mono | NEW | MT\src\hn\farInfo\NicknameRed.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_NicknameRed.jpg |
| MA-58 | PushLight | YouTube Tutorials ; Instagram Ads | chapter end: push into a lamp / light until full white (ease-in, 2.8 s), hard cut | CONFLICT: push into a lamp until full white (light leak / bright) | MT\src\hn\farInfo\PushLight.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_PushLight.jpg |
| MA-59 | WarningSlate | GoFundMe (⚠ on slate for "strangle"), (red ⚠ over blurred B/W), (date on slate | the unsayable act → a small pictogram; a bare date beat on the same slate | NEW | MT\src\hn\farInfo\WarningSlate.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farInfo_WarningSlate.jpg |

### MASTER_TEMPLATES / src/hn / farIsrael (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-60 | CaseBreak | IS Derry; sea; towers | boundary between two stories | IN GUIDE: Year / chapter title | MT\src\hn\farIsrael\CaseBreak.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_CaseBreak.jpg |
| MA-61 | CircleCallout | IS ring on leaked CCTV; eye bar | "look at this figure" in real footage; hiding a face | NEW | MT\src\hn\farIsrael\CircleCallout.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_CircleCallout.jpg |
| MA-62 | CrtBox | IS , , , inset, full colour | any archive / news / leaked clip | NEW | MT\src\hn\farIsrael\CrtBox.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_CrtBox.jpg |
| MA-63 | DataList | IS Compromised Data | "what was leaked" list | NEW | MT\src\hn\farIsrael\DataList.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_DataList.jpg |
| MA-64 | DateCard | IS white card; black | a bare date beat, ≈2 s after it is spoken | IN GUIDE: Year / chapter title | MT\src\hn\farIsrael\DateCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_DateCard.jpg |
| MA-65 | DeniedScreen | IS [ACCESS DENIED]; red console; admin login | the system refuses / flags / asks to log in | NEW | MT\src\hn\farIsrael\DeniedScreen.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_DeniedScreen.jpg |
| MA-66 | EmblemWord | IS laurel; IRAN; BLUE WOLF; HAMAS / | an organisation / concept / country first named | NEW | MT\src\hn\farIsrael\EmblemWord.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_EmblemWord.jpg |
| MA-67 | FringeLines | IS rgb lines; ghost serif; over sea | VO reads article lines | NEW | MT\src\hn\farIsrael\FringeLines.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_FringeLines.jpg |
| MA-68 | HoloScan | IS green hologram + caption | "the system models a person / building" | CONFLICT: 3D hologram object | MT\src\hn\farIsrael\HoloScan.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_HoloScan.jpg |
| MA-69 | NumberToSource | IS "50" -> AFP page | a number, then the article it came from | NEW | MT\src\hn\farIsrael\NumberToSource.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_NumberToSource.jpg |
| MA-70 | PixelGlyph | IS hourglass; trophy; lock bust | one abstract noun (time, prize, locked) | NEW | MT\src\hn\farIsrael\PixelGlyph.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_PixelGlyph.jpg |
| MA-71 | QuoteCard | IS beside face; statement; washed | a quote read verbatim; an outlet's denial | IN GUIDE: Quote card / read-out | MT\src\hn\farIsrael\QuoteCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_QuoteCard.jpg |
| MA-72 | SilhouetteGroup | IS trio; solo | unnamed people; focus on one of them | NEW | MT\src\hn\farIsrael\SilhouetteGroup.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_SilhouetteGroup.jpg |
| MA-73 | SourceSubs | IS Guardian yellow word-by-word; white italic; bilingual | foreign / hidden-cam speech under VO, keep the source's subs | IN GUIDE: Source label / editor note | MT\src\hn\farIsrael\SourceSubs.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_SourceSubs.jpg |
| MA-74 | TintSwap | IS 90 % blue -> 10 % red same shot | a good/bad pair of figures | NEW | MT\src\hn\farIsrael\TintSwap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farIsrael_TintSwap.jpg |

### MASTER_TEMPLATES / src/hn / farMore (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-75 | BrowserFlow | NK Chrome omnibox typing + suggestion dropdown (nk_281.0) → ChatGPT; NK Safari "Can't Find the... | "he typed it in…" — address bar types a query with autocomplete + a live dropdown, then a hard cut... | IN GUIDE: UI recreation / typing | MT\src\hn\farMore\BrowserFlow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_BrowserFlow.jpg |
| MA-76 | ChevronFlow | SL Gaggle severity flowchart (sl_888): green→yellow→orange→red chevrons, flag icons, labels +... | a borrowed severity / escalation flowchart, the camera panning toward the severe end | NEW | MT\src\hn\farMore\ChevronFlow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_ChevronFlow.jpg |
| MA-77 | KeywordReveal | SN "MAY 2013" (sn_1.6); NK ROOM 39 (nk_243.6), WannaCry (nk_2006.2), EternalBlue; SN THE FIVE... | a word/date/name that IS the shot — the footage blurs & darkens, the word writes itself L→R... | IN GUIDE: Mono label over blur | MT\src\hn\farMore\KeywordReveal.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_KeywordReveal.jpg |
| MA-78 | LeakViewer | SN GitHub dark repo "snowden-archive" → white TOP SECRET document (sn_repo / sn_pdf2 | "the document itself" — a leaked doc inside a dark file-host shell: breadcrumb + commit row, white... | IN GUIDE: Page plane | MT\src\hn\farMore\LeakViewer.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_LeakViewer.jpg |
| MA-79 | RansomWindow | NK recreated OS lock dialog over an infected desktop (nk_1936/1944/1964/1992 | "the message every victim saw" — a recreated lock/alert dialog with live countdowns when no clean... | NEW | MT\src\hn\farMore\RansomWindow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_RansomWindow.jpg |
| MA-80 | SlideDeck | SN PRISM Collection Dataflow slide on a dark ground (sn_prism | "the leaked slide" — a briefing slide shown as itself: classified banner top+bottom, logo row, seal... | NEW | MT\src\hn\farMore\SlideDeck.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_SlideDeck.jpg |
| MA-81 | SpreadMap | NK / dark world map, amber dots appear over time + "Day:N" clock (nk_2000/2010 | "it reached N computers in a day" — glowing dots light up across a near-black world map with a... | CONFLICT: invented glowing-dot map (no invented pins) | MT\src\hn\farMore\SpreadMap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_SpreadMap.jpg |
| MA-82 | TerminalLog | NK Kali window over a desktop (nk_2132/2140) + full-frame console (nk_2148/2156.5), red margin... | a command-line run shown on screen — output arrives in bursts and scrolls, a red note labels the... | NEW | MT\src\hn\farMore\TerminalLog.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farMore_TerminalLog.jpg |

### MASTER_TEMPLATES / src/hn / farPages (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-83 | FarrellPage | VARIATIONS PG1–PG12; GR (PG2), OF (PG3), IS (PG11), GR (PG9 | any "the article said…" read; pick plane per beat | IN GUIDE: Page plane | MT\src\hn\farPages\FarrellPage.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPages_FarrellPage.jpg |

### MASTER_TEMPLATES / src/hn / farPeople (Farrell McGuire)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-84 | AccountLadder | OnlyFans ; Grindr | person introduced by their account -> face -> name | NEW | MT\src\hn\farPeople\AccountLadder.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_AccountLadder.jpg |
| MA-85 | ChatBubbles | Grindr 3-D thread; flat thread | reading a chat aloud | NEW | MT\src\hn\farPeople\ChatBubbles.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_ChatBubbles.jpg |
| MA-86 | CountryOutline | Grindr Spain | "in <country>" | IN GUIDE: Map / place card | MT\src\hn\farPeople\CountryOutline.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_CountryOutline.jpg |
| MA-87 | CutoutPop | Google Maps jacket + shoe | listing the objects / clothing of a case | NEW | MT\src\hn\farPeople\CutoutPop.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_CutoutPop.jpg |
| MA-88 | FaceIdProfile | Israel's Internet | a system profiles / judges a person | NEW | MT\src\hn\farPeople\FaceIdProfile.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_FaceIdProfile.jpg |
| MA-89 | IMessage | OnlyFans card "who are you?"; OnlyFans phone | one quoted text message | NEW | MT\src\hn\farPeople\IMessage.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_IMessage.jpg |
| MA-90 | LogoMelt | Google Maps Yandex -> Google | "company A became / was replaced by B" | NEW | MT\src\hn\farPeople\LogoMelt.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_LogoMelt.jpg |
| MA-91 | MaskFill | School Laptops white silhouette; GoFundMe red body; GoFundMe two-tone | anonymous person / victim / suspect shape | NEW | MT\src\hn\farPeople\MaskFill.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_MaskFill.jpg |
| MA-92 | NameSuper (name lower third, 3 families) | Small name label over footage with optional photo | First mention of a person in the footage | IN GUIDE: Source label / editor note | MT\src\hn\ nocText/NameSuper; nexpo/NameSuper; farPeople/NameSuper | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_NameSuper.jpg |
| MA-93 | NamesOnPhoto | GoFundMe Faith couple; Swilley/Smith | two or more people named on one real photo | NEW | MT\src\hn\farPeople\NamesOnPhoto.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_NamesOnPhoto.jpg |
| MA-94 | PixelLetters | Israel's Internet "Sde Teiman" (LED-pixel letters in scene -> sepia satellite | a place / facility named, then seen from above | NEW | MT\src\hn\farPeople\PixelLetters.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_PixelLetters.jpg |
| MA-95 | PlaceInShot | Farrell Google Maps Kolyma -> Road of Bones; CCTV Shenzhen; GoFundMe Dallas; School Laptops | a place is first named; the locals' nickname reveal (flip) | IN GUIDE: Map / place card | MT\src\hn\farPeople\PlaceInShot.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_PlaceInShot.jpg |
| MA-96 | PortraitInset | OnlyFans slide-up over blurred shot; IS round headshot; GoFundMe photo + tag | "a journalist named X" over the running scene | IN GUIDE: Photo push | MT\src\hn\farPeople\PortraitInset.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_PortraitInset.jpg |
| MA-97 | RegionPin | Grindr "Bilbao" + flag circles | city within a region + its groups | IN GUIDE: Map / place card | MT\src\hn\farPeople\RegionPin.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_RegionPin.jpg |
| MA-98 | RouteMap | Route line drawn between places on a map | The VO describes a journey from A to B | IN GUIDE: Map / place card (check route is on a real map) | MT\src\hn\ farPeople/RouteMap; lemmino/RouteMap | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_RouteMap.jpg |
| MA-99 | ThresholdDuotone | YouTube Tutorials red, white; OnlyFans | menace / object of the crime as a stark print | NEW | MT\src\hn\farPeople\ThresholdDuotone.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_ThresholdDuotone.jpg |
| MA-100 | TypedName | Grindr ID card; Grindr name on photo; Instagram Ads | the key person's name, first time (heavy) | IN GUIDE: UI recreation / typing (name types in) | MT\src\hn\farPeople\TypedName.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_TypedName.jpg |
| MA-101 | UiCardLift | OnlyFans anonymous user card | "an anonymous account" | NEW | MT\src\hn\farPeople\UiCardLift.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\farPeople_UiCardLift.jpg |

### MASTER_TEMPLATES / src/hn / fern (Fern / Primal Space)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-102 | ArchiveTreatment | China B/W "China, 1982"; Korea softened news; CIA colour film | any archive photo / newsreel / news clip | NEW | MT\src\hn\fern\ArchiveTreatment.tsx; CATALOGUE.md | none |
| MA-103 | Cutaway | CIA 3:0x sub cutaway (cyan crew); Primal 1:1x wall | "inside, the crew…", showing what is hidden inside a hull / wall / house | CONFLICT: 3D cutaway object | MT\src\hn\fern\Cutaway.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_Cutaway.jpg |
| MA-104 | FilmLeaderFlash | China leader "3"; white film frame | hard switch from 3D/now into the archive past (dirty-film flash) | CONFLICT: flash (bright) hard switch | MT\src\hn\fern\FilmLeaderFlash.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_FilmLeaderFlash.jpg |
| MA-105 | FlatMap | CIA Hacked Russia hatch, / pins, route; Narco Subs route | "the base sat on the coast of…", places, routes, danger zones | IN GUIDE: Map / place card | MT\src\hn\fern\FlatMap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_FlatMap.jpg |
| MA-106 | GlitchBurst | South Korea | reveals, "something was wrong", jumping between faces/figures | IN GUIDE: Glitch / static | MT\src\hn\fern\GlitchBurst.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_GlitchBurst.jpg |
| MA-107 | GridWarRoom | CIA 4:2x (wall) / 4:3x (flat) cia_grid_a/b | planning / tracking a target square by square, "sector C3" | CONFLICT: invented tracking grid / infographic | MT\src\hn\fern\GridWarRoom.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_GridWarRoom.jpg |
| MA-108 | HudTag | Narco "Narco Submarine" | naming a thing on screen the first time | NEW | MT\src\hn\fern\HudTag.tsx; CATALOGUE.md | none |
| MA-109 | MethodCards | Poker Cheating | "there were three ways they did it…" (cards stay while shots cut under them) | NEW | MT\src\hn\fern\MethodCards.tsx; CATALOGUE.md | none |
| MA-110 | RedInkBurst | China (portrait, ink hits, neg, film card, streak wipe, stamp | the villain / responsible person is named; a dark reveal about a person | CONFLICT? keyword "wipe / slide" in catalogue text (check): NEW | MT\src\hn\fern\RedInkBurst.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_RedInkBurst.jpg |
| MA-111 | SpotlightPlinth | China pack on void; Narco hull + engraved $ + HUD label | introducing THE object (evidence, product, vehicle) | CONFLICT: 3D object on a plinth | MT\src\hn\fern\SpotlightPlinth.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_SpotlightPlinth.jpg |
| MA-112 | TerminalPanel | Narco chat; /// badge row | intercepted radio / transcript lines; listing candidates / incidents 1..n | NEW | MT\src\hn\fern\TerminalPanel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\fern_TerminalPanel.jpg |

### MASTER_TEMPLATES / src/hn / hnOpen (Intros & titles (all references))

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-113 | ChannelSting | LEMMiNO Kryptos (all 4 LEMMiNO); Nexpo Vol.15 "[NEXPO PRESENTS]"; Nexpo Audio "WELCOME BACK... | the channel's own ident: before the cold open (lemmino), right before the title (presents), after... | NEW | MT\src\hn\hnOpen\ChannelSting.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_ChannelSting.jpg |
| MA-114 | DisclaimerCard | Farrell GM (+9 more Farrell/Horrors, identical); VV TikTok (+Webpages, YouTubers); Nexpo Audio | frame 0 of the video, before any VO: compliance / viewer-discretion text, then a clean black beat | NEW | MT\src\hn\hnOpen\DisclaimerCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_DisclaimerCard.jpg |
| MA-115 | EndScreen | VV TikTok (same on Webpages, YouTubers | last 15-20 s: "next video" slot + host/clip window + subscribe card | CONFLICT: next-video end slot with host window (rule 10) | MT\src\hn\hnOpen\EndScreen.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_EndScreen.jpg |
| MA-116 | HookSlam | VV TikTok "FAR MORE DANGEROUS" | the hook's key phrase inside the cold-open montage; each word lights on its VO word | CONFLICT: kinetic word slams (Motion graphics: never kinetic typography) | MT\src\hn\hnOpen\HookSlam.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_HookSlam.jpg |
| MA-117 | NoticeList | Nexpo Reddit "BE AWARE: … symptoms …" | in-world viewer-discretion notice (what you will see / what is blurred) in the cold open | NEW | MT\src\hn\hnOpen\NoticeList.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_NoticeList.jpg |
| MA-118 | NumberGridTitle | DD "20 Most Disturbing Dashcam Moments (Vol. 1)" | list-video title AFTER case 1: clip shrinks into tile 1, numbered board flickers on, drippy title... | NEW | MT\src\hn\hnOpen\NumberGridTitle.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_NumberGridTitle.jpg |
| MA-119 | RatingSlate | Nexpo Vol.15 | very first card, the broadcast way to say "viewer discretion advised" (rating box + descriptors) | NEW | MT\src\hn\hnOpen\RatingSlate.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_RatingSlate.jpg |
| MA-120 | RedSun | Nexpo Audio = Reddit (same asset); outro moon over the end credits (Vol.15 / Audio last 25 s | analog-horror ident after the warning, before the first case; or the last image of the video | NEW | MT\src\hn\hnOpen\RedSun.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_RedSun.jpg |
| MA-121 | SmokeTitle | Nexpo Vol.15 "DISTURBING THINGS / FROM AROUND THE INTERNET" | the video title card after the hook montage (after a presents sting) | CONFLICT: smoke particles | MT\src\hn\hnOpen\SmokeTitle.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_SmokeTitle.jpg |
| MA-122 | WallTitle | VV TikTok "THE DARKEST CORNERS / OF TIKTOK" (YouTubers sibling | the video title said by the VO at the end of the hook, over the cases' clips | NEW | MT\src\hn\hnOpen\WallTitle.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnOpen_WallTitle.jpg |

### MASTER_TEMPLATES / src/hn / lemBygone (LEMMiNO)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-123 | LEMMiNO Bygone visuals (6: PlanetScale, OrbitDiagram, GlobeWrap, BarChart, NeonWave, RegionLabels) | Size compare, light-path diagram, globe wrap, bar chart, neon wave, zone labels on a photo | Compare sizes, explain sightlines, chart sightings per year | CONFLICT: charts and diagrams (invented infographic) | MT\src\hn\ lemBygone/PlanetScale, OrbitDiagram, GlobeWrap, BarChart, NeonWave, RegionLabels | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemBygone_BarChart.jpg |
| MA-124 | LEMMiNO Bygone misc (BrushReveal, BookStack, MissionTitle) | Brush-stroke reveal of an old sketch, stack of books, mission/case title | Period illustration, source books, naming an expedition | NEW | MT\src\hn\ lemBygone/BrushReveal, BookStack, MissionTitle | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemBygone_MissionTitle.jpg |
| MA-125 | LEMMiNO page/document set (DocScroll, PageSpread, HeadlineClipping, TranscriptPanel) | Scrolling forum posts or log entries, page spread, period headline clipping, transcript panel | A document, clipping or transcript is read | IN GUIDE: Page plane | MT\src\hn\ lemmino/DocScroll; lemBygone/PageSpread, HeadlineClipping, TranscriptPanel | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemBygone_HeadlineClipping.jpg |

### MASTER_TEMPLATES / src/hn / lemKennedy (LEMMiNO)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-126 | LEMMiNO Kennedy plans and charts (9) | Iso floor plans, floor stack, sight lines, witness tables, pie rows, measure bars, object stack | Show movement through a building, compare witness accounts | CONFLICT: invented infographics, charts | MT\src\hn\ lemKennedy/IsoFloorPlan, FloorStack, PlanPhotoPair, SightLine, DescriptionTable, AttributeCard, PieRow, MeasureBars, ObjectStack | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemKennedy_IsoFloorPlan.jpg |
| MA-127 | LEMMiNO Kennedy PhotoMarkup + LineupStage | Pointers/boxes on an archival photo; silhouette police line-up | Point at a detail in an old photo; identification line-up | NEW | MT\src\hn\ lemKennedy/PhotoMarkup, LineupStage | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemKennedy_PhotoMarkup.jpg |

### MASTER_TEMPLATES / src/hn / lemKryptos (LEMMiNO)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-128 | LEMMiNO Kryptos cipher set (13) | Cipher tables, keyed alphabet, frequency bars, morse decode, anagram, layered steps, depth words | Explain a code or decoding step by step | CONFLICT: charts and invented infographic (cipher visuals) | MT\src\hn\ lemKryptos/* (13 of 15) | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemKryptos_CipherTable.jpg |
| MA-129 | LEMMiNO Kryptos SectionWall + PhraseLift | Long transcript split into parts; chilling line rises out of the transcript with green glow | A long log is read, then the key line lifts out | NEW (green glow: restyle) | MT\src\hn\ lemKryptos/SectionWall, PhraseLift | none |

### MASTER_TEMPLATES / src/hn / lemStars (LEMMiNO)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-130 | LEMMiNO Stars set (8: IndexChips, GlowQuote, StarDossier, BitMatrix, HazardScale, TermChain, AcronymNeon, BandCompare) | Neon chips, neon quote, fact-sheet dossier, bit matrix, 1-10 hazard ladder, neon acronym, signal compare | Index of cases, term explainer, rating a threat | CONFLICT: neon / charts / invented infographic | MT\src\hn\ lemStars/* (8) | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemStars_StarDossier.jpg |

### MASTER_TEMPLATES / src/hn / lemmino (LEMMiNO)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-131 | LEMMiNO ChapterTitle + DateStamp | Chapter title or time stamp in glowing LEMMiNO type | Case/chapter divider or time over footage | IN GUIDE: Year / chapter title (restyle to VCR font) | MT\src\hn\ lemmino/ChapterTitle, DateStamp | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemmino_ChapterTitle.jpg |
| MA-132 | LEMMiNO people/timeline cards (GlowCard, Lineup, LinkCards, EventTimeline) | Glowing person cards, lineup, link lines between parties, event timeline | Introduce people or show who knew whom / what happened when | CONFLICT: neon glow and invented infographic | MT\src\hn\ lemmino/GlowCard, Lineup, LinkCards, EventTimeline | none |
| MA-133 | LEMMiNO QuoteCard | Glowing card with a statement, report or transcript | A statement or 911 transcript is read | IN GUIDE: Quote card / read-out | MT\src\hn\ lemmino/QuoteCard | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemmino_QuoteCard.jpg |
| MA-134 | LEMMiNO SatelliteFocus | Satellite map zooming to an exact spot | Establish where a case happened | IN GUIDE: Map / place card | MT\src\hn\ lemmino/SatelliteFocus | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\lemmino_SatelliteFocus.jpg |

### MASTER_TEMPLATES / src/hn / hnReplay (Look-closely toolkit (Nocturn-based))

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-135 | Replay variants (4: SlowReplay, FrameStep, VcrReplay, AdjustedReplay) | Same clip replayed slower, frame by frame, on VCR noise, or colour-adjusted | The VO says "look again" at a key moment | NEW | MT\src\hn\ hnReplay/SlowReplay, FrameStep, VcrReplay, AdjustedReplay | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_SlowReplay.jpg |
| MA-136 | EdgePointer | CCTV (solid #FE2500 block arrow, ≈300 px, 35° down-left, pops 1 f) + A5 (#F10000 arrow + caps... | point at a subject near the frame edge, or (offscreen) at something just out of shot | NEW | MT\src\hn\hnReplay\EdgePointer.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_EdgePointer.jpg |
| MA-137 | EnhanceReveal | R3 lift (EXPL ) + Bodycam (uploader's B16/C15 brightened clip) + 404 WatchZone feather | "if we brighten the dark corner…" → lift inside the zone first, then the before/after wipe proves... | CONFLICT? keyword "wipe / slide" in catalogue text (check): NEW | MT\src\hn\hnReplay\EnhanceReveal.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_EnhanceReveal.jpg |
| MA-138 | Loupe | R2 look (ring #E60C1A 4 px + 8 px glow, tracked) + R2 punch taken to an inset + 404 WatchZone... | "zoom in on the window / the left edge…" while the clip keeps playing | NEW | MT\src\hn\hnReplay\Loupe.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_Loupe.jpg |
| MA-139 | OpeningOutline | EXPL (R2 window outline, tracked) + grey freeze form | "look into the doorway / the window on the left" — a tracked quad (4 axis-aligned corners = the R2... | CONFLICT: tracked outline graphic | MT\src\hn\hnReplay\OpeningOutline.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_OpeningOutline.jpg |
| MA-140 | SpotGlow | EXPL (L1: frame mono, figure keeps colour + additive #3CFF8C glow, tracked, 10 s | "what appears to be a man can be seen standing by the side of the path" — held through the doubt... | NEW | MT\src\hn\hnReplay\SpotGlow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_SpotGlow.jpg |
| MA-141 | TrackBoxReplay | EXPL (R2: glitch → tracked red box → mono 1.3× freeze, grey box, STOP) → R3 | "if we zoom in and replay the footage, a dark figure can briefly be seen in the window" | CONFLICT: tracked box graphic | MT\src\hn\hnReplay\TrackBoxReplay.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_TrackBoxReplay.jpg |
| MA-142 | TwoAngle | LOST (NB8 form A 2-up, 2 f glitch) + 404 footage/AngleSync (D2 grow bezier 77 f) + R1 OSD tags | two cameras of one moment; "from the second angle…" (focus grows the side that shows it) | IN GUIDE: Split screen / grid / card row | MT\src\hn\hnReplay\TwoAngle.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\hnReplay_TwoAngle.jpg |

### MASTER_TEMPLATES / src/hn / nexpo (Nexpo)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-143 | CallWave | A , C , C | an audio-only case is played (911 call, radio, recording) | NEW | MT\src\hn\nexpo\CallWave.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_CallWave.jpg |
| MA-144 | ChapterCard | B / B / C / A | chapter opens, after a fade to black | IN GUIDE: Year / chapter title | MT\src\hn\nexpo\ChapterCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_ChapterCard.jpg |
| MA-145 | EndCredits | B , A | outro | NEW | MT\src\hn\nexpo\EndCredits.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_EndCredits.jpg |
| MA-146 | NoticeCard | A , A , C , A , B | content warning / skip time before a call; "condensed" notice; epilogue after the case; disclaimer | NEW | MT\src\hn\nexpo\NoticeCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_NoticeCard.jpg |
| MA-147 | PageTilt | B (4chan), A / B (Reddit), A (GeoCities | the source page is introduced / scrolled while narrated | IN GUIDE: Page plane | MT\src\hn\nexpo\PageTilt.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_PageTilt.jpg |
| MA-148 | PhotoNames | A , A , C , C , C | introducing the people / victims | NEW | MT\src\hn\nexpo\PhotoNames.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_PhotoNames.jpg |
| MA-149 | PostCard | B (Reddit), B (4chan | individual comments / replies are read | IN GUIDE: Comment card | MT\src\hn\nexpo\PostCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_PostCard.jpg |
| MA-150 | StoryReadout | B , C | the original post / description is read aloud | IN GUIDE: Quote card / read-out | MT\src\hn\nexpo\StoryReadout.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_StoryReadout.jpg |
| MA-151 | TimeSuper | A , A , A , B , B , B , B , A , C | "in Mabank, Texas…", "hours later…", a date / time stamp at the start of a scene | IN GUIDE: Year / chapter title | MT\src\hn\nexpo\TimeSuper.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nexpo_TimeSuper.jpg |

### MASTER_TEMPLATES / src/hn / nocEvidence (Nocturn)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-152 | AnalysisFreeze | RE4/RE5: Doorbell (red ring on orb, mono clip keeps playing), ; Psycho (mono freeze, white box... | VO explains what to look at over a mono freeze/slow-mo; hard cut +0.4–0.56 s after the last word... | NEW | MT\src\hn\nocEvidence\AnalysisFreeze.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_AnalysisFreeze.jpg |
| MA-153 | BranchBoard | B1: Expl ("Part of some kind of setup" → "Robbery?" / "Kidnapping?" | VO poses a premise and its alternatives; each word written as spoken | CONFLICT: invented infographic (words written onto a branching board) | MT\src\hn\nocEvidence\BranchBoard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_BranchBoard.jpg |
| MA-154 | CensorMarks | (no catalogue row) |  | NEW | MT\src\hn\nocEvidence\CensorMarks.tsx; CATALOGUE.md | none |
| MA-155 | CommentOverClip | C1: Expl (one dark YT comment over its own blurred clip, slides up with motion blur); (two... | viewer theory / doubt about the exact clip on screen | IN GUIDE: Comment card | MT\src\hn\nocEvidence\CommentOverClip.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_CommentOverClip.jpg |
| MA-156 | DreadWash | nA4: Forest (light page washes red over 1 s, streaks, snow burst → black | the sentence that turns a normal story dark; exit from a page | NEW | MT\src\hn\nocEvidence\DreadWash.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_DreadWash.jpg |
| MA-157 | EyeBar | D-CEN3: Lost (solid #000 bar on a full-frame victim photo; kept in the threshold scrapbook... | victim / minor photo introduced by name | NEW | MT\src\hn\nocEvidence\EyeBar.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_EyeBar.jpg |
| MA-158 | FreezeGlitch | RE6: Doorbell (triptych freeze → tear → play), (single); RE7: Police (punch-in freeze → RGB... | end of an explanation over frozen moment(s), glitch back into the playing clip | IN GUIDE: Glitch / static | MT\src\hn\nocEvidence\FreezeGlitch.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_FreezeGlitch.jpg |
| MA-159 | LinkMap | nA1: Forest (page zooms out into centre card of a red-line node graph | "people online started connecting it to…" — sources linked to one page | NEW | MT\src\hn\nocEvidence\LinkMap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_LinkMap.jpg |
| MA-160 | MessageRec | NB7/MR1 Viral (blue iOS bubble on navy LCD); MR3 Worst (grey bubbles, blurred word, tilt); MR2... | quoting the victim's / suspect's own message | IN GUIDE: Quote card / read-out | MT\src\hn\nocEvidence\MessageRec.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_MessageRec.jpg |
| MA-161 | MonoEcho | M1: Viral ("Storm De Beul" + 3-chip sentence list), , ; Final ; Psycho | name / sentence facts of a person: dip to black, mono slowed shot with trailing echo, VCR chips | NEW | MT\src\hn\nocEvidence\MonoEcho.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_MonoEcho.jpg |
| MA-162 | PaperFrame | B2: Expl (live footage in paper surround, white note inside); (note below on paper, tilt | a conclusion about the shot that is still playing | NEW | MT\src\hn\nocEvidence\PaperFrame.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_PaperFrame.jpg |
| MA-163 | RedFrameGrid | nA7: Doorbell cold open (red frame snaps, shrinks into numbered grid, push into a card, whip... | cold open / "N cases" overview, or jumping to case N | IN GUIDE: Split screen / grid / card row | MT\src\hn\nocEvidence\RedFrameGrid.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_RedFrameGrid.jpg |
| MA-164 | ScrapBoard | NB1 Expl (annotate: writing on shot → pull back, arrow, ellipse); NB2 Expl (pair + "Same... | frame-by-frame reasoning / recap of clues collected so far | NEW | MT\src\hn\nocEvidence\ScrapBoard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_ScrapBoard.jpg |
| MA-165 | ShotNote | B3: Expl (mono, "Someone else was inside the school" + arrow); (tilt on paper | the narrator states the conclusion straight on the footage | NEW | MT\src\hn\nocEvidence\ShotNote.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_ShotNote.jpg |
| MA-166 | SocialPost | NB11: Viral (white tweet card on blurred footage, text typed word by word, cut-in to tight crop | VO reads the subject's own post in first person | IN GUIDE: Comment card | MT\src\hn\nocEvidence\SocialPost.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_SocialPost.jpg |
| MA-167 | SplitCompare | NB8: Lost (hard 2-up); (one card on plum grain, second pops, name, full-bleed 2-up | "sketch vs suspect", same person / place side by side | IN GUIDE: Split screen / grid / card row | MT\src\hn\nocEvidence\SplitCompare.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocEvidence_SplitCompare.jpg |

### MASTER_TEMPLATES / src/hn / nocMotion (Nocturn)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-168 | CallWaveform | Bodycam | playing 911 / dispatch audio; caller white, dispatcher cyan captions | CONFLICT: waveform = invented infographic/counter | MT\src\hn\nocMotion\CallWaveform.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_CallWaveform.jpg |
| MA-169 | CaseChangeBlack | Bodycam | case change: black → grey haze → glowing serif date → blurred dissolve into the new case | IN GUIDE: Year / chapter title (with dip to black) | MT\src\hn\nocMotion\CaseChangeBlack.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_CaseChangeBlack.jpg |
| MA-170 | ClipGridColdOpen | Door (nA7 | cold open preview of every case; one card dives to full frame | IN GUIDE: Split screen / grid / card row | MT\src\hn\nocMotion\ClipGridColdOpen.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_ClipGridColdOpen.jpg |
| MA-171 | Dissolve | Bodycam (≈15 measured: 18 f … ≈40 f into a map | the default fade/crossfade between shots (24–30 f; 15–20 in b-roll flurries; ≈40 into maps) | IN GUIDE: crossfade transition (rule 3), not a graphic | MT\src\hn\nocMotion\Dissolve.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_Dissolve.jpg |
| MA-172 | EarthPlace | Expl (school tinted red), ; Urban (orbit); Forest (photo card pinned on aerial | first mention of a place ("…the abandoned Audubon school in Cleveland"); M1: "authorities... | IN GUIDE: Map / place card | MT\src\hn\nocMotion\EarthPlace.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_EarthPlace.jpg |
| MA-173 | FlashBloom | Bodycam | "FLASH" exposure bloom into an evidence page / photo | CONFLICT: bright white flash / bloom (rule 1 and light-leak ban) | MT\src\hn\nocMotion\FlashBloom.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_FlashBloom.jpg |
| MA-174 | GlitchCut | Bodycam impacts , , … ; datamosh | impact cut on a hit word / scare; datamosh into an article/clip | IN GUIDE: Glitch / static | MT\src\hn\nocMotion\GlitchCut.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_GlitchCut.jpg |
| MA-175 | NightMap | Bodycam (night, phone icons + focus icon + waveform), (day, floating card), (dark top-down... | "Calls started coming in from across the city…" — where reports came from; push to the one address | IN GUIDE: Map / place card | MT\src\hn\nocMotion\NightMap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_NightMap.jpg |
| MA-176 | RedFrameCarousel | Bodycam (teaser), , (case-to-case bridge | bridge line naming the next/remaining cases; one slot expands to full frame with raw audio | IN GUIDE: Split screen / grid / card row | MT\src\hn\nocMotion\RedFrameCarousel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_RedFrameCarousel.jpg |
| MA-177 | TitleChips | Viral (NB6 | the video's title spoken over the cold-open wall | NEW | MT\src\hn\nocMotion\TitleChips.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_TitleChips.jpg |
| MA-178 | VhsPlayInsert | Lost , , , (NB4 | "the tape begins…" — recovered/lost footage playback start | IN GUIDE: Glitch / static | MT\src\hn\nocMotion\VhsPlayInsert.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_VhsPlayInsert.jpg |
| MA-179 | VhsTapeBreak | Forest , (nA2/nA3 | time skip / case reset onto a VHS OSD card ("1 Day Later…", "NOVEMBER 2021") | IN GUIDE: Glitch / static | MT\src\hn\nocMotion\VhsTapeBreak.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_VhsTapeBreak.jpg |
| MA-180 | VideoWallTravel | Viral (NB5 | cold open: camera rides a wall of clips, then the whole wall + title chips | IN GUIDE: Split screen / grid / card row | MT\src\hn\nocMotion\VideoWallTravel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocMotion_VideoWallTravel.jpg |

### MASTER_TEMPLATES / src/hn / nocPages (Nocturn)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-181 | AboutCard | urban ; worst | naming the creator over their own footage (channel card + date) | IN GUIDE: Page plane | MT\src\hn\nocPages\AboutCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_AboutCard.jpg |
| MA-182 | ChannelHome | viral , ; final ; worst | introducing the creator / channel ("a small channel with 13K subscribers") | IN GUIDE: Page plane | MT\src\hn\nocPages\ChannelHome.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_ChannelHome.jpg |
| MA-183 | ChannelVideos | expl (scroll −6.65 %H/s); worst , (tilted | "he'd been posting for years…" — scrolling the uploads grid | IN GUIDE: Page plane | MT\src\hn\nocPages\ChannelVideos.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_ChannelVideos.jpg |
| MA-184 | CommentsBar | live ; door , ; forest ; expl , ; worst | reading a viewer comment aloud; bar wipes at reading pace (5 words/s) | IN GUIDE: Comment card | MT\src\hn\nocPages\CommentsBar.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_CommentsBar.jpg |
| MA-185 | DateToWatch | forest "JANUARY 2024"; psy , VCR "MARCH 2022" | opening a case: "In January 2024, <creator>…" date card then the watch page | IN GUIDE: Video in its page | MT\src\hn\nocPages\DateToWatch.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_DateToWatch.jpg |
| MA-186 | LivePage | shop | "during a livestream…" — viewers reacting in chat | IN GUIDE: Page plane | MT\src\hn\nocPages\LivePage.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_LivePage.jpg |
| MA-187 | PostMarker | worst , (FB, #E7BD41); shop , , ; door (dark Reddit, red bar | quoting a Facebook post/comment or a Reddit OP statement | IN GUIDE: Line highlight / Page plane | MT\src\hn\nocPages\PostMarker.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_PostMarker.jpg |
| MA-188 | TiltPost | shop | a victim's own status post ("3rd day without sleep…"), dread beat | IN GUIDE: Page plane | MT\src\hn\nocPages\TiltPost.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_TiltPost.jpg |
| MA-189 | Watch-page set (5 versions: WatchPush, Settle, ZoomIn, Reveal, Light) | Dark YouTube watch page on a tilted plane; push, settle, dive into player, pull back from footage, or old light page | The VO introduces a video and its uploader | IN GUIDE: Video in its page | MT\src\hn\ nocPages/WatchPush, WatchSettle, WatchZoomIn, WatchReveal, WatchLight | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocPages_WatchPush.jpg |

### MASTER_TEMPLATES / src/hn / nocText (Nocturn)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-190 | ArrowLabel | CCTV "VICTIMS SLEEPING"; Doorbell `*covered face*` leaders | point at something in a (frozen) shot — silent | NEW | MT\src\hn\nocText\ArrowLabel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_ArrowLabel.jpg |
| MA-191 | CensorSound | LOST (full frame, nocD_lost_23) and (4:3 inset, nocD_lost_844) — nocD D-CEN5 | an unshowable sound (gunshots, screams) over a σ≈40 blurred clip: "(g*ns**ts)" | NEW | MT\src\hn\nocText\CensorSound.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_CensorSound.jpg |
| MA-192 | CreditTag | Bodycam "YouTube: Quirk Zone" | while a third-party clip plays with its own audio | IN GUIDE: Source label / editor note | MT\src\hn\nocText\CreditTag.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_CreditTag.jpg |
| MA-193 | Date cards (5 versions: TypeDate, UnblurDate, GlowDate, VcrDate, EarlierCard) | Date typed, unblurred, glowing, or on VCR noise; "earlier" time-skip card | A case opens on a date or the story jumps in time | IN GUIDE: Year / chapter title | MT\src\hn\ nocText/TypeDate, UnblurDate, GlowDate, VcrDate, EarlierCard | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_TypeDate.jpg |
| MA-194 | ExcerptBlur | EX1 Live ; EX2 Live , , Bodycam ; EX3 list | VO reads a source sentence / theories list; `[[red clause]]` marks the key part | IN GUIDE: Quote card / read-out | MT\src\hn\nocText\ExcerptBlur.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_ExcerptBlur.jpg |
| MA-195 | KeyLabel | Police Bodycam "Possession", , stack | the one key word/term the VO lands on, over a dimmed freeze | IN GUIDE: Mono label over blur | MT\src\hn\nocText\KeyLabel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_KeyLabel.jpg |
| MA-196 | RawCaptions | Bodycam Seattle , , Steve Harvey (Times on black, colour per speaker); PSY VCR chips (nocD... | every captioned raw line; swears asterisked in the cue text ("F***ING") | CONFLICT: burned captions (Motion graphics: never burned captions) | MT\src\hn\nocText\RawCaptions.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_RawCaptions.jpg |
| MA-197 | SoundLabel | Forest `*Josh hears footsteps*` | a sound the viewer must notice in the raw | NEW | MT\src\hn\nocText\SoundLabel.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\nocText_SoundLabel.jpg |

### MASTER_TEMPLATES / src/hn / vv (Visual Venture)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-198 | VVBlurFill | TT (measured 509.0), , , ; YT ; WP | any vertical TikTok / Shorts clip, 2-5 s, with its creator credit and VV caption | NEW | MT\src\hn\vv\VVBlurFill.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vv_VVBlurFill.jpg |
| MA-199 | VVChapterBar | TT (measured), , , ; YT , , , ; WP | every chapter start (each 3.5-5 min), ~3.4 s, hard cut in/out | IN GUIDE: Year / chapter title | MT\src\hn\vv\VVChapterBar.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vv_VVChapterBar.jpg |
| MA-200 | VVRetroWindow | YT (measured), , , , , , ; TT , , ; WP | first time a person is named (within ~30 s of a chapter card), 3-4 s | NEW | MT\src\hn\vv\VVRetroWindow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vv_VVRetroWindow.jpg |
| MA-201 | VVSentenceFrames | WP (measured), YT , YT , WP | sentencing / fate of several people ("12 YEARS IN PRISON" -> whip -> "5 YEARS IN PRISON"); unknown... | CONFLICT: kinetic sentence frames | MT\src\hn\vv\VVSentenceFrames.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vv_VVSentenceFrames.jpg |
| MA-202 | VVTrackDot | YT (measured 515-520), , , , , ; WP | a person's route: climb, hike, drive, swim to a point of danger; dot = the person, red mark = where... | CONFLICT: tracked dot | MT\src\hn\vv\VVTrackDot.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vv_VVTrackDot.jpg |

### MASTER_TEMPLATES / src/hn / vvMore (Visual Venture)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-203 | VVDatamosh | TT (measured 8 f on twos), TT , TT , YT | cut between two borrowed clips / screenshot -> footage, mid-story (not chapter cards) | IN GUIDE: Glitch / static | MT\src\hn\vvMore\VVDatamosh.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVDatamosh.jpg |
| MA-204 | VVEndCard | TT (measured), YT , WP | the outro: "visual venture." brand card -> host shrinks top-right, panel + slot slide in, concrete... | CONFLICT: outro card with host shrinking (rule 10) | MT\src\hn\vvMore\VVEndCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVEndCard.jpg |
| MA-205 | VVNeonMap | TT (measured stepped push), WP , TT (ring), YT | "it spread across four states" / where it happened: neon outline map, lit regions, pictograms... | CONFLICT: white neon map (bright, invented outline) | MT\src\hn\vvMore\VVNeonMap.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVNeonMap.jpg |
| MA-206 | VVPhoneGlow | TT (measured, burst push), TT (measured, linear + punch-in), TT (red), YT , WP | "the video went viral / she posted it on TikTok": a feed clip on a phone floating on black, 2-6 s | CONFLICT: bright violet glow | MT\src\hn\vvMore\VVPhoneGlow.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVPhoneGlow.jpg |
| MA-207 | VVRetroWindowGX | YT (measured full-res), YT , , ; TT , ; WP | person intro (upgrade of vv/VVRetroWindow): glossy bevel + CRT bow + horizontal glitch streak on... | NEW | MT\src\hn\vvMore\VVRetroWindowGX.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVRetroWindowGX.jpg |
| MA-208 | VVYearCard | TT (measured), TT , , , ; YT , , ; WP | every time jump / chapter start ("2023 / BREAKING NEWS"), ~3.8 s | IN GUIDE: Year / chapter title | MT\src\hn\vvMore\VVYearCard.tsx; CATALOGUE.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\_sheets\vvMore_VVYearCard.jpg |

### graphics/ (Remotion + HyperFrames port)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-209 | Highlight (3 contexts: comment, website, document) | Yellow or red marker wipes over one line of a screenshot; dark pages use screen blend, light pages multiply | The VO quotes or names one line visible on a page | IN GUIDE: Line highlight (yellow #efc416 vs guide pale yellow; red marker on dark comment pages) | PG\graphics\TEMPLATES.md; hyperframes\compositions\highlight\Highlight.html; templates\src\presets | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\news_60.png |
| MA-210 | PlaceMap theme horror (= NocturnMap) | Black land, red place with glow, VCR name, slow log-zoom onto the place | The VO names a country/place | IN GUIDE: Map / place card | PG\graphics\TEMPLATES.md; hyperframes\compositions\place-map\place-map.html, nocturn-map.html; hyperframes\notes\place-map.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\place-map\meteora-horror.mp4 |
| MA-211 | PlaceMap themes geo / atlas / news | Blue sea + cream land + orange pin; sepia paper; light-grey infographic with red plate | Non-horror niches only | CONFLICT: bright/cute colours, sans font (rule 1, 2) | PG\graphics\TEMPLATES.md; hyperframes\notes\place-map.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\place-map\meteora-geo.mp4 |
| MA-212 | TitleCard (overlay) | Kicker, big title, subtitle, red accent #C1121F, centred or left | Title or chapter card over footage | IN GUIDE: Year / chapter title (default fonts Bebas Neue/Inter: swap to VCR OSD Mono) | PG\graphics\TEMPLATES.md; hyperframes\compositions\overlays\title-card.html; hyperframes\notes\overlays.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\overlays\_smoke-TitleCard.mov |
| MA-213 | CaseCard (overlay) | Case number, label and title card in horror/case look | Start of each case | IN GUIDE: Year / chapter title (font swap needed) | PG\hyperframes\compositions\overlays\case-card.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\overlays\_smoke-CaseCard.mov |
| MA-214 | LowerThird (overlay) | Name/role bar at the lower left | First mention of a person | IN GUIDE: Source label / editor note (font swap needed) | PG\hyperframes\compositions\overlays\lower-third.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\overlays\_smoke-LowerThird.mov |
| MA-215 | Emphasis (overlay) | Emphasis word/phrase card over footage | The VO stresses one phrase | CONFLICT: restates the VO as text (word-pop style) | PG\hyperframes\compositions\overlays\emphasis.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\overlays\_smoke-Emphasis.mov |
| MA-216 | LocationStamp (overlay) | Place name stamp over footage | The VO names where the footage is | NEW (close to Mono label over blur; font swap needed) | PG\hyperframes\compositions\overlays\location-stamp.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\overlays\_smoke-LocationStamp.mov |
| MA-217 | Glitch number (Glitch2025) | RGB-split glitch where the last digit flips from one value to the next | A date or day count changes (2025 to 2026, DAY 1 to 2) | NEW (counter-like: use only for a date flip) | PG\hyperframes\compositions\glitch\glitch-number.html; hyperframes\notes\overlays.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\glitch\glitch.mp4 |
| MA-218 | HookIntro (cold-open compilation) | Title card, then clip windows alternating left/right with names, hook line word by word, red "Subscribe." | Opening of a clip compilation | CONFLICT: word-by-word kinetic text, subscribe call, window montage; Farrell opens cold on raw footage | PG\graphics\TEMPLATES.md; hyperframes\compositions\hook-intro\hook-intro.html; hyperframes\notes\hook-intro.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\hook-intro\hook-ps.mp4 |
| MA-219 | RisingComments | Comment cards rising over the picture with drift | The VO reads real viewer comments | IN GUIDE: Comment card | PG\hyperframes\compositions\highlight-extra\RisingComments.html; hyperframes\notes\highlight-extra.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\highlight-extra\RisingComments.mov |
| MA-220 | HighlightsGrid | One-frame numbered grid over a long screenshot to pick highlight boxes | Editor tool while planning highlights (not shown in the video) | NEW (tool, not a shot) | PG\hyperframes\compositions\highlight-extra\HighlightsGrid.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\highlight-extra\HighlightsGrid.mp4 |
| MA-221 | KW frame-circle | Still of a figure with an animated ring drawn round it | The VO says "look at this figure/detail" | NEW (red ring on a detail; no matching row in guide Motion graphics table) | PG\hyperframes\compositions\kw\frame-circle.html; hyperframes\notes\kw.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\kw\KW1-FigureCircle.mov |
| MA-222 | KW audio-wave | Precomputed spectrum bars as an alpha overlay | Audio-only evidence (call, recording) plays | CONFLICT: invented infographic / audio visualiser (Motion graphics list) | PG\hyperframes\compositions\kw\audio-wave.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\kw\KW1-Wave1.mov |
| MA-223 | Case cards: NocturnCaseCard | Case N title card (Nocturn Inter / VT323 / VCR OSD Mono) | Start of a case | IN GUIDE: Year / chapter title | PG\hyperframes\compositions\case-cards\NocturnCaseCard.html; hyperframes\notes\case-cards.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\NocturnCaseCard.jpg |
| MA-224 | Case cards: NocturnChannelPlate + HCE-ChannelPlate | Channel/uploader plate with avatar and name | Introduce the channel or uploader | NEW (HCE uses Roboto: font swap) | PG\hyperframes\compositions\case-cards\NocturnChannelPlate.html, HCE-ChannelPlate.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\HCE-ChannelPlate.jpg |
| MA-225 | Case cards: NocturnCouple + HCE-Couple | Two-person intro plate (couple/pair) | Introduce two people in a case | NEW | PG\hyperframes\compositions\case-cards\NocturnCouple.html, HCE-Couple.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\NocturnCouple.jpg |
| MA-226 | Case cards: NocturnStakes + HCE-Stakes | Plate listing what is at stake | Set up the stakes before the footage | NEW | PG\hyperframes\compositions\case-cards\NocturnStakes.html, HCE-Stakes.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\HCE-Stakes.jpg |
| MA-227 | Case cards: NocturnLineup + HCE-Lineup | Row of people plates / line-up | Show several people at once | IN GUIDE: Split screen / grid / card row | PG\hyperframes\compositions\case-cards\NocturnLineup.html, HCE-Lineup.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\NocturnLineup.jpg |
| MA-228 | Case cards: NocturnVcr | VCR OSD label / rewind / date card (alpha mov) | A date or tape rewind beat | IN GUIDE: Year / chapter title (VCR font ok) | PG\hyperframes\compositions\case-cards\NocturnVcr.html | none |
| MA-229 | Case cards: HCE-AudioTrace | Evidence-file audio trace plate | Audio-only evidence | CONFLICT: audio visualiser / invented infographic | PG\hyperframes\compositions\case-cards\HCE-AudioTrace.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\templates\out\case\stills\HCE-AudioTrace.jpg |

### graphics/ (Remotion + HyperFrames port) - camping8 shots

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-230 | camping8: title cards (case-card, case-reveal, case-title, title-room, typed-date) | Case / title / typed-date cards (from file names only; not opened) | Case opening | IN GUIDE: Year / chapter title | PG\hyperframes\compositions\camping8\*.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\camping8\v2\case-reveal.mp4 |
| MA-231 | camping8: comment + highlight (comment-float, comment-page, grid-comment, desc-highlight) | Comment cards and a description-line highlight (from file names only; not opened) | The VO reads comments or a page line | IN GUIDE: Comment card / Line highlight | PG\hyperframes\compositions\camping8\*.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\camping8\v2\comment-c2-02.mp4 |
| MA-232 | camping8: photo and map (push-* x5, still-cue, sat-map, article-3d) | Slow push on a still, still with cue, satellite move, 3D-tilted article page (from file names only; not opened) | Photo, place or article beats | IN GUIDE: Photo push / Map / Page plane | PG\hyperframes\compositions\camping8\*.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\camping8\v2\push-window.mp4 |
| MA-233 | camping8: channel-plate, channel-v3, dossier, theories, side-by-side, ir-replay | Channel plate, dossier page, theories list, two clips side by side, infrared replay (from file names only; not opened) | Channel intro, case file, comparison | IN GUIDE: Split screen / grid (side-by-side); rest NEW | PG\hyperframes\compositions\camping8\*.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\camping8\v2\sbs-c3-09.mp4 |
| MA-234 | camping8: evidence-board | Evidence board of clues (from file names only; not opened) | The VO ties clues together | CONFLICT: invented infographic (board) | PG\hyperframes\compositions\camping8\*.html | C:\Users\ayush\Videos\CLAUDE\PROJECT\graphics\hyperframes\out\camping8\v2\evidence-board.mp4 |

### MASTER_TEMPLATES / src/templates (404 Waterpark library, 206 variants in 19 families; list in INDEX.md section 18)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-235 | 404 library: caseopener family (13) | Case opener: number + date/place on footage (CornerFade, CentreSettle, TypedStamp, ChapterRise...) | Start of each case | CONFLICT: Waterpark look (Nunito red-gradient numeral, Varela Round); not VCR font | MT\INDEX.md; MT\src\templates\caseopener\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\caseopener-CentreSettle.jpg |
| MA-236 | 404 library: labels family (11) | Text labels: WordRise, TypedTime, HudCallout, NameTag, VhsDate, SceneTitle, SpeakerCaptions | Name or time labels over footage | CONFLICT: Nunito/Varela fonts; SpeakerCaptions = burned captions (VhsDate close to Year title) | MT\INDEX.md; MT\src\templates\labels\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\labels-HudCallout.jpg |
| MA-237 | 404 library: lookhere family (10) | Freeze punch, tracked ring/arrow, watch zone, track trail | Point at a detail in the footage | CONFLICT: tracked graphics, white flash | MT\INDEX.md; MT\src\templates\lookhere\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\lookhere-CutMarkers.jpg |
| MA-238 | 404 library: footage family (10) | DashHold, CrtTv, PhonePanel, Replay, PipCam, Letterbox, AngleSync, RadioWave, FloatingClipCard | Frame a clip (TV, phone, pip) | NEW (CrtTv matches the CRT-frame composition rule; RadioWave = audio visual) | MT\INDEX.md; MT\src\templates\footage\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\footage-AngleSync.jpg |
| MA-239 | 404 library: map family (10) | SatelliteMapBox, CountryLocator, RouteMap, DotMap3D, PinDrop3D, FlightArc, MeasureOnSat | Place a story on a map | IN GUIDE: Map / place card (DotMap3D, PinDrop3D, FlightArc are CONFLICT: 3D/invented pins) | MT\INDEX.md; MT\src\templates\map\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\map-CountryLocator.jpg |
| MA-240 | 404 library: page family (18) | FlatPush, TiltedPrint, ScrollToParagraph, RisingMarker, VVPushHighlight, HeadlineCrop, TornClip, DocScan... | A page, article or document is read | IN GUIDE: Page plane (+ Line highlight) | MT\INDEX.md; MT\src\templates\page\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\page-ColumnSlide.jpg |
| MA-241 | 404 library: evidence family (11) | Corkboard, DeskSpread, StackFlyThrough, TiltedWall, SplitCompare, CitationSheet, CardWall | Show several documents or photos | NEW (Corkboard = invented board; SplitCompare = Split screen) | MT\INDEX.md; MT\src\templates\evidence\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\evidence-CitationSheet.jpg |
| MA-242 | 404 library: social family (5) | WatchPage, CommentStack, PostCard, PhonePost, CreatorCard | A video, comment or post is shown | IN GUIDE: Video in its page / Comment card | MT\INDEX.md; MT\src\templates\social\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\social-CommentStack.jpg |
| MA-243 | 404 library: photo family (13) | Polaroid, KenBurnsParallax, PortraitFile, FilmStrip, PushThroughFrame, ArchiveStill, TornPrint, PhotoStack | A photo of a person or place | IN GUIDE: Photo push | MT\INDEX.md; MT\src\templates\photo\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\photo-ArchiveStill.jpg |
| MA-244 | 404 library: stat family (18) | TwoTone, SegCounter, RollUp, CountUp, CompareBars, PriceTag, StuckClock, BigNumber | A number matters | CONFLICT: counters and charts banned | MT\INDEX.md; MT\src\templates\stat\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\stat-BigNumber.jpg |
| MA-245 | 404 library: toll family (9) | GridTurnRed, FillCounter, IconGrid, NameAgeRoll, MemorialLine | Casualty counts / victim lists | CONFLICT: counters and invented infographics | MT\INDEX.md; MT\src\templates\toll\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\toll-Arithmetic.jpg |
| MA-246 | 404 library: timeline family (8) | WorldCamera, YearScroll, RulerTicker, DayStrip, DateLine | Time passing / sequence of dates | CONFLICT: invented infographic timeline (YearScroll alone is close to Year title) | MT\INDEX.md; MT\src\templates\timeline\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\timeline-DayStrip.jpg |
| MA-247 | 404 library: diagram family (20) | BuildOnWords, IsoBlueprint, FloorPlan, Cutaway3D, MechanismLoop, ExplodedPart, MeasureOnPhoto | Explain how something works | CONFLICT: invented infographics, 3D objects | MT\INDEX.md; MT\src\templates\diagram\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\diagram-BuildOnWords.jpg |
| MA-248 | 404 library: neon family (10) | PullbackPop, GlyphSwapX, EquationRow, ChainReaction, IconPair, StateScene | Pictogram storytelling | CONFLICT: neon / bright / cute pictograms | MT\INDEX.md; MT\src\templates\neon\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\neon-ChainReaction.jpg |
| MA-249 | 404 library: title family (10) | TitleWall, ChapterCard, SlamCard, WordPops, KineticTitle, TypedDate, VideoWall, DateCard | Title or chapter | IN GUIDE: Year / chapter title (WordPops, KineticTitle, SlamCard are CONFLICT: kinetic type) | MT\INDEX.md; MT\src\templates\title\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\title-ChapterCard.jpg |
| MA-250 | 404 library: quote family (13) | WhiteBox, Typewriter, RedSentence, PageLift, QuoteOnPlate, StampVerdict, WitnessLine, PhraseSlam | A quote is read | IN GUIDE: Quote card / read-out (PhraseSlam, ShoutLines are CONFLICT: kinetic) | MT\INDEX.md; MT\src\templates\quote\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\quote-PageLift.jpg |
| MA-251 | 404 library: censor family (5) | TrackedBlur, Mosaic, CutAway, CensorCard, PosterCard | Hide gore or a face | NEW (TrackedBlur = tracked graphic) | MT\INDEX.md; MT\src\templates\censor\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\censor-CensorCard.jpg |
| MA-252 | 404 library: transition family (11) | WhiteFlash, GlitchStreak, SineDip, SliceGlitch, CrackSplit, DoubleFlashSkip, PushIntoLight | Between shots | CONFLICT: only cut, crossfade, dip to black, VHS, glitch allowed (SineDip ~ dip to black, GlitchStreak ~ glitch) | MT\INDEX.md; MT\src\templates\transition\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\transition-BlackBeat.jpg |
| MA-253 | 404 library: endscreen family (1) | Slot (next-video end screen) | End of video | CONFLICT: end-screen slot / subscribe style | MT\INDEX.md; MT\src\templates\endscreen\ | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\endscreen-Slot.jpg |

### editor-v5/DOCS/TEMPLATE_UPGRADES.md (ranked upgrades of 404 templates; ones not already above)

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-254 | Upgrade targets, tracked or flashing (WatchZone, RideTrace, TrackTrail, StuckClock, OsdLift, RadioWave, PlanReplay, DoubleFlashSkip, PushIntoLight) | Spotlight/trace that follows a subject, elapsed clock, audio waveform, top-down reconstruction, white-flash exits | Pointing at a moving detail; call audio; time skips | CONFLICT: tracked graphics, counters, audio visualiser, invented reconstruction, white flash | editor-v5\DOCS\TEMPLATE_UPGRADES.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\lookhere-WatchZone.jpg |
| MA-255 | Upgrade targets, matching the guide (VideoWall, AngleSync, HorizonCard, TornPrint) | Clip wall under a title; two angles in sync; dated chapter card on a torn photo | Title over montage; same moment from two cameras; chapter date | IN GUIDE: Split screen / grid / Year title (torn paper look may clash) | editor-v5\DOCS\TEMPLATE_UPGRADES.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\title-VideoWall.jpg |
| MA-256 | Upgrade targets, other (StepRamp, MeasureOnSat, MeasureOnPhoto, FloatingClipCard) | Stepped freeze ramp; distance bracket on a satellite or photo; small clip card floating over its own blur | Emphasise a fast event; give a size; introduce a found clip | NEW (bracket must sit on a real image) | editor-v5\DOCS\TEMPLATE_UPGRADES.md | C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\MASTER_TEMPLATES\legacy\404Rendrer\TemplateLibrary\_strips\footage-FloatingClipCard.jpg |

### editor-v5/DOCS/_DESIGN_SYSTEM_CHEATSHEET.md

| ID | Name | What it looks like | Use it when | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MA-257 | WM (Warrior Mind) case card | Forest plate, handwritten Caveat numeral, red hook, 4.5 s | Case opener in the Warrior Mind look | CONFLICT: handwritten font and forest plate (rule 1, 2) | editor-v5\DOCS\_DESIGN_SYSTEM_CHEATSHEET.md | none |


# MB: Motion graphics B (learned anims, EncountersStudio, Farrell inventory)


Sources read: anim (INDEX + element crops), remotion README/props, EncountersStudio overlays and MOTIONS.md, Farrell video 1 inventory, motion-design-studio. PROJECT\docs\seeing-motion.md is a how-to for measuring motion (eye.py), no graphics, so no rows. Anim preview = each folder's sheet.jpg (element.png is the cut-out). Status was checked against rules 1, 2, 3, 6, 7, 10 and the Never list. Fonts were judged by eye from crops; confirm before use.


## A. Learned animations (motion-graphics-templates\anim), measured from Nocturne/owner videos. One row per graphic, latest version first.

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-1 | Post card in vignette oval (noc01_post_push; v1 nocturne_post_push) | Social post cut out in a soft oval, yellow highlight on lines, slow push | VO reads a social post or comment | IN GUIDE: Page plane + Line highlight (yellow here, guide #DCD896) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_post_push\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_post_push\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_post_push\sheet.jpg |
| MB-2 | Page pan (noc12_page_pan) | Wide page of thumbnails and a round avatar, panning across | Show a page full of items | IN GUIDE: Page plane (pan) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc12_page_pan\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc12_page_pan\sheet.jpg |
| MB-3 | Excerpt highlight push (noc11_excerpt_push, noc11_excerpt_zoom_v2) | Article text, red box on key words, push or zoom in | VO quotes a phrase from an article | IN GUIDE: Line highlight (red box, guide says pale yellow) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc11_excerpt_push\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc11_excerpt_zoom_v2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc11_excerpt_push\sheet.jpg |
| MB-4 | Excerpt heading (noc11_ex1_heading_v3) | Big white/red words pulled from a page, rest faded | Pull one heading out of a page | NEW | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc11_ex1_heading_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc11_ex1_heading_v3\sheet.jpg |
| MB-5 | Highlight wipe (noc02_highlight_wipe) | Pink band wipes left to right over one italic text line | VO names or quotes one line | IN GUIDE: Line highlight (pink, not #DCD896) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_highlight_wipe\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_highlight_wipe\sheet.jpg |
| MB-6 | Quote sweep (noc01_quote_sweep_v2; v1 nocturne_quote_sweep) | One white serif quote line on dark, sweeping in | A witness's words are read out | IN GUIDE: Quote card / read-out | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_quote_sweep_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_quote_sweep\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_quote_sweep_v2\sheet.jpg |
| MB-7 | Channel card (noc03_channel_card, noc12_channel_card_v3) | Dark channel page with avatar and Subscribe button, slow move | VO introduces a channel | IN GUIDE: Page plane (channel page) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc03_channel_card\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc12_channel_card_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc03_channel_card\sheet.jpg |
| MB-8 | Dark channel plate (owner_channel_dark) | Cartoon ghost + creator avatar on a dark channel page, push | Same as channel card, dark look | IN GUIDE: Page plane (channel page) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_channel_dark\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_channel_dark\sheet.jpg |
| MB-9 | Tilted aerial card (noc02_tilted_card) | Aerial photo as a tilted 3D card | Show a place photo with depth | IN GUIDE: Photo push / Map / place card | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_tilted_card\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_tilted_card\sheet.jpg |
| MB-10 | Photo card (noc02_photo_card, noc10_photo_card_v3, noc10_photo_card2) | Still photo on a card, fade in and settle, slow push | VO names a person or place, you have a still | IN GUIDE: Photo push | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_photo_card\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_photo_card_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_photo_card2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_photo_card_v3\sheet.jpg |
| MB-11 | Date + place title (noc01_date_title_v2; v1 nocturne_date_title) | Two lines over footage: 'August 2nd, 2020' / 'Guadalajara, Mexico', white bold sans | A new date and place starts | CONFLICT (rule 2: font looks like bold sans, not VCR OSD Mono; re-set). Same job as Year / chapter title | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_date_title_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_date_title\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_date_title_v2\sheet.jpg |
| MB-12 | Date label, lower-left (noc02_date_label_v2) | Serif date and time ('April 30th, 8:50 PM') at lower left | Time stamp for an event | NEW (font must be VCR OSD Mono) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_date_label_v2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_date_label_v2\sheet.jpg |
| MB-13 | Evidence board (noc01_evidence_board_v2; v1 nocturne_evidence_board) | Photos pinned and joined by thin red lines, slow move | Link evidence items as one case | NEW | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_evidence_board_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_evidence_board\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_evidence_board_v2\sheet.jpg |
| MB-14 | Analysis board card + pan (noc01_board_card_v3, noc01_board_pan, nocturne_analysis_board) | Pale board sheet, cards scale in, camera pans across | Walk through a theory board | NEW (bright sheet: check rule 6 brightness 70-90) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_board_card_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_board_pan\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_analysis_board\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_board_card_v3\sheet.jpg |
| MB-15 | Face board pan (noc05_board_pan_v3; v1-v2) | B/W face cut-outs on paper board, curved arrow, handwritten note, long pan | Introduce several people | CONFLICT (rule 6 bright paper; rule 2 handwriting font) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_board_pan_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_board_pan_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_board_pan\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_board_pan_v3\sheet.jpg |
| MB-16 | Link board (noc06_link_board_v3) | Thick red rounded frame joining screenshot panels | Show how pages or accounts connect | NEW | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc06_link_board_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc06_link_board_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc06_link_board\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc06_link_board_v3\sheet.jpg |
| MB-17 | CCTV wall zoom (noc01_cctv_wall_zoom; v1 nocturne_cctv_wall_zoom) | Many camera feeds as a wall, zoom to one | Show surveillance or many feeds | NEW (guide limits grids to 2-4 panels) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_cctv_wall_zoom\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturne_cctv_wall_zoom\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc01_cctv_wall_zoom\sheet.jpg |
| MB-18 | Video wall (noc08_video_wall_v3) | Framed selfie-style video inside a dark wall, slow move | Show a found video among others | IN GUIDE: Split screen / grid / card row | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_video_wall_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_video_wall_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_video_wall\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_video_wall_v3\sheet.jpg |
| MB-19 | Grid tiles: pan / push / shrink / tile-in (noc09_grid_*) | Doorbell-cam style tiles with red edges that tile in, pan, push or shrink | Show many clips or faces at once | IN GUIDE: Split screen / grid (tile count above 4) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_grid_pan_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_grid_push_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_grid_shrink_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_grid_tile_in_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_grid_push_v2\sheet.jpg |
| MB-20 | Numbered case grid (noc10_case_grid, noc10_case_grid2_v3) | Six panels with red numbers 1-6 | Preview the list of cases | NEW (6 panels; guide says 2-4) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_case_grid\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_case_grid2_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_case_grid\sheet.jpg |
| MB-21 | Dark video list (noc08_dark_list_v2) | Two stacked video thumbnails with time stamps | Show a short list of videos | IN GUIDE: Split screen / grid / card row | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_dark_list_v2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_dark_list_v2\sheet.jpg |
| MB-22 | Inset clip (noc13_inset) | Video inset with white frame border over footage | Picture-in-picture of a second clip | NEW | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc13_inset\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc13_inset\sheet.jpg |
| MB-23 | Terrain map push (noc10_nepal_map_v2) | Mountain terrain map with trail line, slow pan | VO describes a remote place | IN GUIDE: Map / place card (route must be on a real map) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_nepal_map_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_nepal_map\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_nepal_map_v2\sheet.jpg |
| MB-24 | Runway/airport map (noc10_runway_map) | Dark aerial site map with an arrow along a runway | Show where something happened | IN GUIDE: Map / place card | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_runway_map\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc10_runway_map\sheet.jpg |
| MB-25 | Aerial 3D view (noc08_aerial_3d_v3) | Tilted aerial 3D of a building and road | Show a location from above | IN GUIDE: Map / place card (satellite) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_aerial_3d_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_aerial_3d_v3\sheet.jpg |
| MB-26 | Campsite map label (noc08_campsite_map_v3) | Pixel/VCR-style 'CAMPSITE' text over a map | Name a place on a map | IN GUIDE: Map / place card + Mono label | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_campsite_map_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_campsite_map_v3\sheet.jpg |
| MB-27 | Map push with route line (noc07_map_push_v3) | White vertical route line, two labelled dots, over a map | Show distance between two points | CONFLICT (guide: no invented route lines or pins off a real map) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc07_map_push_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc07_map_push_v3\sheet.jpg |
| MB-28 | Freeze label (noc07_freeze_label) | Frozen frame, white box round a spot, pixel text label | Freeze on a detail and name it | NEW (box must be static, not tracked) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc07_freeze_label\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc07_freeze_label\sheet.jpg |
| MB-29 | Outcome chip / stack (noc08_outcome_chip, noc08_outcome_stack_v3) | Pixel-font lines on dark chips, e.g. 'Lifetime Ban On Possessing Firearms' | State the outcome of a case | NEW (pixel font fits rule 2) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_outcome_chip\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_outcome_stack_v3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_outcome_stack_v3\sheet.jpg |
| MB-30 | PLAY OSD (noc08_play_osd_v2) | VCR 'PLAY >' on-screen display, 0.33 s | A found video starts like a tape | NEW (fits horror/VHS; near Glitch / static) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_play_osd_v2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_play_osd_v2\sheet.jpg |
| MB-31 | Typed quote (noc08_typed_quote_v2, noc08_typed_quote2) | Pixel-font line typed letter by letter | A written message is read out | NEW (guide allows typing only into real search boxes) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_typed_quote_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_typed_quote2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc08_typed_quote2\sheet.jpg |
| MB-32 | VCR CASE opener (noc05_vcr_opener_v3) | Black card with VCR 'CASE' text, tape look | Open a case or chapter | NEW (VCR font fits; static source: rule 7 needs a move) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_vcr_opener_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_vcr_opener\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc05_vcr_opener\sheet.jpg |
| MB-33 | Blur patch (noc04_blur_patch) | Blurred patch over part of the frame | Hide a face or text | NEW | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc04_blur_patch\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc04_blur_patch\sheet.jpg |
| MB-34 | Radar rings (noc02_radar_rings) | Red rings pulse out over a dark photo | Mark a spot in a still | NEW (borderline: not a real artifact) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_radar_rings\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_radar_rings\sheet.jpg |
| MB-35 | Phone icon over map (noc02_phone_icon_v3; v1-v2, icon2) | Big red phone handset over a map | VO says someone called | CONFLICT ('Never' list: invented infographic, not a real artifact) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_phone_icon_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_phone_icon_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_phone_icon\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_phone_icon2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_phone_icon_v3\sheet.jpg |
| MB-36 | Word stack (noc02_word_stack_v2, noc02_word_stack2) | Words stacking one after another in orange | VO lists words | CONFLICT (kinetic typography / word pops are never allowed) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_word_stack_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_word_stack2\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc02_word_stack_v2\sheet.jpg |
| MB-37 | Ring or box on a moving subject (noc09_ring_v3, ring_knife, ring_track_v2, noc09_red_box) | White/red ring or box that follows a person or object | Point at something in raw footage | CONFLICT (tracked graphics are never allowed) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_ring_v3\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_ring_knife\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_ring_track_v2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_red_box\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\noc09_ring_v3\sheet.jpg |
| MB-38 | Big red CASE number (nocturn_c1_case) | Huge red '01' with black outline, label and title | Number a case | CONFLICT (rule 2: display font, not VCR OSD Mono) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_case\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_case\sheet.jpg |
| MB-39 | Emphasis text (nocturn_c1_e1, e2, e3) | White outlined caps: 'OPENED FROM THE BOTTOM', '2:30 AM' | Punch a phrase on a beat | CONFLICT (burned captions / word pops; rule 2 font) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_e1\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_e2\ANIM.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_e3\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\nocturn_c1_e2\sheet.jpg |
| MB-40 | Glitch number (glitch_2025) | A '5' tears into a '6' with slices and RGB split, 2 s, on black | Chapter or tape break | IN GUIDE: Glitch / static (drop the digit gimmick) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\glitch_2025\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\glitch_2025\sheet.jpg |
| MB-41 | Title number + hook (c01_title) | Big white handwritten '1' with a red hook line | Open case 1 | CONFLICT (rule 2: Caveat handwriting; owner dropped it 2026-10-06) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\c01_title\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\c01_title\sheet.jpg |
| MB-42 | Night bridge map (owner_bridgemap) | Dark blue river band, bridge line draws in, marker dot | Explain a bridge location | CONFLICT (invented diagram, not a real map) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_bridgemap\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_bridgemap\sheet.jpg |
| MB-43 | Pencil bridge (owner_pencilbridge) | Pencil-style bridge drawing built stroke by stroke | Explain how a place looked | CONFLICT (invented hand drawing; owner said no pencil until told) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_pencilbridge\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_pencilbridge\sheet.jpg |
| MB-44 | Night quote card (owner_quotecard) | Big sans line 'Is that the thing we saw?' on dark gradient, slow push | Read out a question or quote | CONFLICT (rule 2: sans font; guide uses white serif) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_quotecard\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_quotecard\sheet.jpg |
| MB-45 | Rising comment cards (owner_rising_comments) | Two dark comment cards rise and stack, red highlight on key words | VO reads what users said | IN GUIDE: Comment card (guide: one per shot; stack is extra) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_rising_comments\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_rising_comments\sheet.jpg |
| MB-46 | WMP screenshot plate (owner_wmp_plate) | 3D-tilted page plate with highlights | VO talks about a page or video title | IN GUIDE: Page plane + Line highlight | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_wmp_plate\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\owner_wmp_plate\sheet.jpg |
| MB-47 | Roundtrip test (roundtrip) | Blank white test render | Pipeline test only, not a graphic | NEW (skip) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\roundtrip\ANIM.md | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\anim\roundtrip\sheet.jpg |

## B. Remotion devices (motion-graphics-templates\remotion; same files in EncountersStudio\tools\remotion). Preview = source image/video where one exists.

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-48 | MarkerHighlight (c01_watch.json) | Red box (#EA3047 dark) or yellow marker wipes over spoken phrases on a keystoned page | Highlight the clause the VO says | IN GUIDE: Line highlight on Page plane (colours differ from #DCD896) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\README.md; C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\src\MarkerHighlight.tsx | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\FLT\marker_watch.png |
| MB-49 | PagePush (c01_sstitle) | Flat page on near-black, small push, red band behind one word | Show a page title, mark one word | IN GUIDE: Page plane + Line highlight | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c01_sstitle.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\FLT\marker_watch.png |
| MB-50 | MapDive (c01_sat) | Three map tiles zoom in on a place; place plate and date | Place + date card | IN GUIDE: Map / place card (plate serif breaks rule 2) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c01_sat.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\wm7\sat14.png |
| MB-51 | ChannelPage (c02_page) | Dark channel page, pan to a tile, red box, zoom in, footage plays | Introduce a found video from its channel | IN GUIDE: Video in its page + Page plane (red box on tile is NEW) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c02_page.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\wm7\channel_dark.png |
| MB-52 | TagsPanel (c02_tags) | Dark video-info panel with title and #tags, red band behind one tag | Show a video's title and tags | IN GUIDE: Page plane + Line highlight | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c02_tags.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\wm7\c02_tags.mp4 |
| MB-53 | QuestionCard (c02_card) | Creator's own text crop over darkened footage, English translation fades in | Translate foreign on-screen text | IN GUIDE: Mono label over blur (translation); serif line breaks rule 2 | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c02_card.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\wm7\c02_card.mp4 |
| MB-54 | Glossary (c01_spit) | Flat cream dictionary card: word, definition, related words | Define a term the VO uses | CONFLICT (rule 2: Georgia serif; rule 6: bright cream card) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c01_spit.json | none |
| MB-55 | CentreLabel (c01_viewer) | 'Viewer discretion is advised' serif, centred, dark band | Warning before disturbing footage | CONFLICT (rule 2: serif; re-set in VCR OSD Mono) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c01_viewer.json | none |
| MB-56 | DateLabel (c02_date) | 'JUNE 2022' on a black plate, lower-left, slides in | Date stamp | NEW (serif; re-set in VCR OSD Mono) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c02_date.json | none |
| MB-57 | TitleCard (c01_title, c02_title) | Darkened footage, huge Caveat number and red hook line | Chapter title with hook | CONFLICT (rule 2: Caveat; dropped 2026-10-06) | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\props\wm7\c01_title.json | C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\motion-graphics-templates\remotion\public\wm7\c01_title.mp4 |

## C. EncountersStudio overlays.json

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-58 | Page overlay 'Subscribed' (shot VO.1.0) | One shot: page under footage, word 'Subscribed' tracked in Poppins | Case 1 channel page | CONFLICT (tracked text; Poppins, rule 2) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\cases\c01\edit\overlays\overlays.json | none |

## D. MOTIONS.md (refstudy\learnings; identical copy in automated-video-workflow\templates). Devices not already in A or B.

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-59 | TitleCard (kicker, title, rule, subtitle) | Kicker, big title, accent rule, subtitle spring in | Chapter title with subtitle | CONFLICT (rule 2: Bebas/Oswald/Impact) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 1 | none |
| MB-60 | LowerThird (name + role) | Accent bar, dark plate wipes out bottom-left with name and role | Name a person in footage | CONFLICT (rule 2 font; guide uses a plain gold Source label) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 1 | none |
| MB-61 | LocationStamp | Top-left stamp: place, date, detail | Place and date on a scene | NEW (font must be VCR OSD Mono) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 1 | none |
| MB-62 | Paper evidence board (h-paper) | Photo cards on grey paper, handwriting writes on, arrow and red ring draw on | Evidence board look | CONFLICT (rule 2 Caveat; rule 6 bright paper) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 2 | none |
| MB-63 | Seeded 3D sheet camera | Sheet is a plane panning through 3D: push-in, pull-back | Page or photo plate camera | IN GUIDE: Page plane move | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 2 | none |
| MB-64 | Highlight bar wipe + plate camera | Bar wipes on words; perspective plate, push 1.16 %/s | Read a comment or page line | IN GUIDE: Line highlight + Page plane | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 4 | none |
| MB-65 | Channel plate drift | Channel page crop drifts down into the video grid with no cut | Go from channel page to its videos | IN GUIDE: Page plane (channel page) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 4 | none |
| MB-66 | Archive photo plate | Old photo plate, slight tilt, push, vignette | Show an archive photo | IN GUIDE: Photo push | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 6 | none |
| MB-67 | FigureCard (one big number) | One huge number on dark ground, slow push | Stress one figure | CONFLICT (charts or counters are never allowed; rule 2 font) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 6 | none |
| MB-68 | Route map (trek-map) | Google-Earth terrain, white route line and dot, label cards, Montserrat HUD | Show a trek or road route | CONFLICT (rule 2: Montserrat; owner must approve) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 7 | none |
| MB-69 | CASE N card | Black card, white VCR OSD Mono 'CASE N', hard in/out | Open each case | NEW (VCR fits; static, add a move for rule 7) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8, 9 | none |
| MB-70 | Chapter card with kicker + rule | Black, kicker, big number, thin white rule, fades | Chapter break | NEW (check font) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-71 | VCR date card (full frame) | Black, centred white VCR date, rider line, faint scanlines | Jump in time | IN GUIDE: Year / chapter title (VCR variant) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-72 | VCR location title | Centred near bottom: place big, sub-line small | Name a place over footage | NEW (fits rule 2) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-73 | VCR year stamp | Bottom-left year with small rider line | Contrast two dates | NEW (fits rule 2) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-74 | Red warning card | Black, red box: 'WARNING / VIEWER DISCRETION IS ADVISED' | Warn before a disturbing section | NEW (check font) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-75 | Freeze-push with red circle | Last frame frozen, red circle on subject, slow push, then un-freezes | Point at a detail in raw footage | NEW (circle must be static) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-76 | Plate entrance (scale + fade) | Pages scale up and fade in at centre | Bring in a page | CONFLICT (guide: devices enter on a hard cut) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-77 | Date stamp slide-up | Lower-left date fades in and slides up | Date stamp | CONFLICT (hard-cut entry rule; font) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |
| MB-78 | Split-screen wipe | Side-by-side split wipe comparing two clips | Compare two clips | CONFLICT (rule 3: no wipes; a static split is IN GUIDE) | C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\MOTIONS.md sec 8 | none |

## E. Farrell video 1 inventory (MOTION_GRAPHICS_INVENTORY.md), listed for side-by-side review.

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-79 | G1 Fade up from black | Whole-frame fade up over 48 f into the first page | Open on an artifact | NEW (dip-to-black family) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\events_0-40.jpg |
| MB-80 | G2 Channel page plane | Page on a tilted plane, push or tilt down | Talk about a page | IN GUIDE: Page plane | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-81 | G3 Video in its page | Watch page tilted, found video plays in the player | Introduce a found video | IN GUIDE: Video in its page | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-82 | G4 Pale-yellow highlight | Yellow box blooms over the title line | VO quotes the line | IN GUIDE: Line highlight | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-83 | G5/G6 Gold note / source label | Small gold text bottom-left | Credit or disclose an edit | IN GUIDE: Source label / editor note | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-84 | G7 Isolated comment | One comment on black or blurred page, hard cuts between | VO reads what users said | IN GUIDE: Comment card | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices2.jpg |
| MB-85 | G8 Meme insert | Comic meme still, half a second | Comic aside | CONFLICT (rule 1: playful, not glitched or desaturated) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices2.jpg |
| MB-86 | G9 Source end card pushed in | Hoaxer's end card pushed in with vignette | Show a source's contact card | NEW (real artifact; Page plane move) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-87 | G12 Camera move on stills | Push, pull, tilt-down reads | Keep a still alive | IN GUIDE: Photo push / Page plane | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices.jpg |
| MB-88 | G14 Gold title / date | Big gold year or site over a blurred page | Year or date to explain | IN GUIDE: Year / chapter title | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\a_564.6.jpg |
| MB-89 | G15 Typed search | Search box typed into, cursor clicks result | Show how he searched | IN GUIDE: UI recreation / typing | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\a_650.0.jpg |
| MB-90 | G16 Map / place card | Google Maps place card, route, pins | Name a real place | IN GUIDE: Map / place card | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\a_296.0.jpg |
| MB-91 | G17 Split / photo grid | Two pages side by side, then a photo grid | Compare or show many | IN GUIDE: Split screen / grid / card row | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\b_1220.0.jpg |
| MB-92 | G18 Host on camera | Presenter with microphone breaks chapters | Chapter break | CONFLICT (rule 10: no real person on camera as host) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\sheets\devices2.jpg |
| MB-93 | G19 Glitch / matrix rain | Green matrix rain over a page; RGB tearing | Dark-side beat, rare | IN GUIDE: Glitch / static | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\a_512.0.jpg |
| MB-94 | G20 Retro terminal text | White monospace text on black ('THE TIME IS UP') | Quote old web text | NEW (full black card; near Mono label) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\b_441.5.jpg |
| MB-95 | G21 Card over its own blur | Blog post or cover centred on a blurred copy of itself | Isolate one artifact | NEW | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\c_884.0.jpg |
| MB-96 | G22 Row of video cards | Row of channel video cards, push with pan | Lay out a channel's videos | IN GUIDE: Split screen / grid / card row | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\d_2046.0.jpg |
| MB-97 | G23 Red error banner | Native 'This channel does not exist' banner | Show it is gone | NEW (real UI capture) | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\d_2154.0.jpg |
| MB-98 | G24 Calendar year square | Yellow-green square on a Wayback calendar (low confidence) | Point at a capture date | NEW | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\c_504.5.jpg |
| MB-99 | G25 Read-out | Quoted text on screen, filtered voice, bed out | Let the source speak | IN GUIDE: Quote card / read-out | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\MOTION_GRAPHICS_INVENTORY.md | C:\Users\ayush\Videos\CLAUDE\STYLE guide\productions\farrell-01-internet-archive\01_reference\mgi\dev_full\b_1100.0.jpg |

## F. motion-design-studio-main (SaaS/product motion, off-style; judged from folder names, CLAUDE.md and the empty PLAYBOOK.md only).

| ID | Name | What it looks like (1 short line) | Use it when (1 short line) | Status vs Farrell guide | Source path(s) | Preview |
|---|---|---|---|---|---|---|
| MB-100 | SaaS launch 10 s (projects\saas-launch-10s) | Product-launch animation with storyboard and sound | Product promo | CONFLICT (rule 1: bright SaaS mood; no narration over raw clips) | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\CLAUDE.md | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\saas-launch-10s\03-storyboard\storyboard-sheet.png |
| MB-101 | Animora studio (projects\animora-studio) | SaaS product motion study | Product promo | CONFLICT (rule 1; invented infographics) | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\animora-studio | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\animora-studio\02-references\analysis\sheet_0.jpg |
| MB-102 | Glass orb UI (projects\glass-orb-ui) | Glassy 3D orb UI animation | UI hero shot | CONFLICT ('never 3D objects'; rule 1) | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\glass-orb-ui | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\glass-orb-ui\03-storyboard\storyboard-sheet.png |
| MB-103 | Pin recreation (projects\pin-recreation) | Canvas re-skin of a SaaS explainer, logo pile and labels | Product explainer | NEW-off-style | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\pin-recreation\HANDOFF.md | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\pin-recreation\02-references\keyframes\f0066.png |
| MB-104 | Premiere connector 15 s (projects\premiere-connector-15s) | 15 s product spot with brief board | Product promo | NEW-off-style | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\premiere-connector-15s | C:\Users\ayush\Videos\CLAUDE\motion-design-studio-main\projects\premiere-connector-15s\01-brief\BOARD.png |


# LC: Editing learnings C (EDITING_RULES, PLAYBOOK, EDITING_KNOWLEDGE, OWNER_TASTE)


Sources are read-only. Status is judged against C:\Users\ayush\Videos\CLAUDE\STYLE guide\FARRELL_STYLE_GUIDE.md.

Source legend:

- ER = C:\Users\ayush\Videos\CLAUDE\EncountersStudio\refstudy\learnings\EDITING_RULES.md (r.N = rule number)
- PLAYBOOK = C:\Users\ayush\Videos\CLAUDE\EncountersStudio\PLAYBOOK.md (sN = section)
- EK = C:\Users\ayush\Videos\CLAUDE\automated-video-workflow\EDITING_KNOWLEDGE\ (path after EK)
- OT = C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\DOCS\OWNER_TASTE.md
- CS = C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\DOCS\CHANNEL_STYLE.md
- ICEBERG = C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\DOCS\ICEBERG_PLAYBOOK.md
- GX = C:\Users\ayush\Videos\CLAUDE\PROJECT\editor-v5\DOCS\GX_EDITORS.md

## Pacing and cuts

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-1 | Read the narration, then look at the footage, before choosing any shot. | NEW | ER r.1 |
| LC-2 | One scene, one clip: length is not the rule, one image per clip is; do not cut a continuous scene into many same-picture cuts. | NEW | ER r.2 |
| LC-3 | Dense, eventful narration wants tight cuts; long exposition with nothing to show gets fewer, longer holds, never cuts for no informational reason. | NEW | ER r.2 |
| LC-4 | Cut on the clause (midpoint of the pause), not by feel, and never shorter than about 2 s; shot length is an output of the narration. | NEW | ER r.3 |
| LC-5 | When a proper noun sits inside a clause, the picture arrives exactly on that noun. | NEW | ER r.4, r.35, r.53 |
| LC-6 | The picture must be the literal subject of its clause (right time of day, right register), one picture per list item. | NEW | ER r.5, r.6 |
| LC-7 | Search for the action the narration describes, not its noun; if a line cannot be shown, cover the destination, never a stand-in actor. | NEW | ER r.7, r.8 |
| LC-8 | A different time range of the same scene is not a different picture; vary the framing. | NEW | ER r.9 |
| LC-9 | Check head, middle and tail of a picked range; a pick that works at 4 s can straddle a cut at 8 s. | NEW | ER r.10, r.96 |
| LC-10 | Dark is not black: a dark but readable range can be the best material; lift it to judge it before discarding. | NEW | ER r.12 |
| LC-11 | A freeze is a choice, not a mechanism: repeat the moving footage instead of freezing, freeze only for an examination beat the narration names. | NEW | ER r.13 |
| LC-12 | A reveal mark (ring/box) needs a still camera; choose the calmest window. | NEW | ER r.15 |
| LC-13 | Fill from the case's own source between neighbouring evidence beats; stock last; raw footage 70%+ under narration. | NEW | ER r.14 |
| LC-14 | Derive the fill strategy from what the source is; a single-framing source is monotonous, so do not manufacture cuts to hide it. | NEW | ER r.76 |
| LC-15 | A still image inside a footage video stays short (a scanned clipping capped at 16 s). | NEW | ER r.79 |
| LC-16 | Slow a shot to hold the clause's state rather than cut to the wrong picture. | NEW | ER r.80 |
| LC-17 | A short source forces reuse: spread the windows, play repeats as motion, make the last raw the longest. | NEW | ER r.87 |
| LC-18 | Never shave a shot or leave a 1-frame black gap; overlap instead. | NEW | ER r.33 |
| LC-19 | Mean B-roll hold is about 6 s when the rules are followed; no shot under 2 s; single holds of 8-9 s are fine. | CONFLICT - Farrell averages about 1.4 s per shot inside a block, with a new picture every 1-3 s | ER r.34 |
| LC-20 | Pacing has a shape per section (open wide, tighten in the middle, open up for the payoff); held shots (2x median) are 57-72% of runtime. | NEW | ER r.103 |
| LC-21 | A graphic plate holds 3-4 s, hard max 5 s; a longer beat is two clips at different camera angles. | CONFLICT - Farrell page plane median 8.4 s, graphic blocks 8-11 s | ER r.37 |
| LC-22 | A repeated device in one case changes grammar the second time (plate, then card over footage), never the same shot twice in 20 s. | NEW | ER r.38 |
| LC-23 | Hold raw-footage moments long when they are the evidence; the held shots are the style. | IN GUIDE | ER r.103, r.118; Farrell section 8 |
| LC-24 | A burned-in instrument readout (thermal, CCTV, bodycam stamp) is allowed when it is the clause's subject; the camera's own flaws stay as proof. | NEW | ER r.78 |
| LC-25 | Phone-vertical clips get a blurred fill behind; old 4:3 archival keeps clean black bars. | NEW | ER r.76, r.97 |
| LC-26 | Check each source for creator cards, captions, end cards, re-uploader overlays and watermarks before picking ranges; re-scan after any extension. | NEW | ER r.70, r.96, r.128 |
| LC-27 | A crop that leaves a fragment of creator text is worse than none; anchor it so none shows. | NEW | ER r.101 |
| LC-28 | After any hand edit by the owner, re-derive the clause map from real positions; the owner's own placements also get checked. | NEW | ER r.73, r.74 |
| LC-29 | Check every raw out-edge against the word it ends on so a cut never lands inside a word. | NEW | ER r.133 |
| LC-30 | The median narration shot is 2.6-5 s, cut on word onsets so the picture shows exactly what is being said. | CONFLICT - Farrell averages about 1.4 s per shot inside a block | PLAYBOOK s3 |
| LC-31 | The last line of a paragraph that teases the next beat gets one or two teaser shots of that moment. | NEW | PLAYBOOK s3 |
| LC-32 | Never cut mid-speech in a raw; raw clips start and end on word edges (use word timings). | NEW | PLAYBOOK s3 |
| LC-33 | Never cross the source creator's own edit, and leave no stray 1-10 frame fragments of another shot (including raw tails). | NEW | PLAYBOOK s3 |
| LC-34 | Evidence beats: hold uncut, slow the replay, push in slowly; arrows or circles only when the target is certain (track it if it moves). | NEW | PLAYBOOK s3 |
| LC-35 | Jump-cut dead air inside a raw clip; extend raws at word boundaries to hit the target runtime. | NEW | PLAYBOOK s3 |
| LC-36 | Pack the case start: before the first raw, layer 5-8 real details (source page, date, channel, location, document or photo, teasers). | NEW | PLAYBOOK s2 |
| LC-37 | Preview stills of every new device against the reference still before rendering; fix size, position and timing. | NEW | PLAYBOOK s7 |
| LC-38 | When the user reports a problem at a timestamp, find the exact cause and fix it everywhere, not only there. | NEW | PLAYBOOK s8 |
| LC-39 | Narration cut points keep at least 120 ms lead and about 400 ms tail before a raw. | NEW | EK editing_rules/TRANSITIONS_AND_PACING.md; ER r.100 |
| LC-40 | Raws only 2-8 s, where the sound is the moment, with genuine clip sound and subtitles; footage sits under the voice-over. | CONFLICT - Farrell raw-footage blocks run 11-16 s and up to 27 s | OT s2 |
| LC-41 | Change the clip only when the sentence changes topic; footage minimum 4-5 s, graphics minimum 4 s; cut on a spoken channel, game or place name and hold past it. | CONFLICT - Farrell changes the picture every 1-3 s inside a block | OT s4 (2026-10-25) |
| LC-42 | Never play a source range containing an internal cut; when the source runs out use another angle of the same scene. | NEW | OT s4 (2026-10-25) |
| LC-43 | At most one designed device per 10-15 s of footage, with plain footage between devices. | CONFLICT - Farrell alternates graphic blocks of 8-11 s with raw blocks and uses devices constantly (45-80% of clips) | OT s2 (2026-10-20) |
| LC-44 | Every animation fully enters then holds readable: at least 1.5 s plus 0.3 s per word, total at least 3 s (pages 4-8 s, maps 3-5 s, name tag 2.1-2.9 s); entries 10+ frames. | NEW | OT s2 |
| LC-45 | Device repetition limits: series devices repeat every case; page treatments 3-4 uses each; everything else at most about 5 per video and never in consecutive cases. | NEW | OT s2; ICEBERG item 7 |
| LC-46 | When a repetitive device is removed, refill the spot with a new situation-fitting device if the narration explains, names, counts, dates, locates or compares something the footage does not show. | NEW | OT s2 |
| LC-47 | A designed plate never opens empty or sits still: first element lands within about 8 frames of the cut, sparse graphics drift at a visible rate. | NEW | OT s3 (Editor A) |
| LC-48 | Replays are real-time (no half-speed or frame doubling), with a crop or angle change, entered 0.2 s after the last word. | NEW | OT s3 (Editor B) |
| LC-49 | Footage keeps a constant linear push of +3-4.5 %/s (never eased), often with a slow lateral truck. | IN GUIDE | OT s3; CS s0; Farrell section 6 (linear push) |

## Transitions

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-50 | Dip to black where a montage hands over to a new section; cross dissolve inside the montage. | IN GUIDE | ER r.26; Farrell rule 9 |
| LC-51 | Dip only at section handovers, about one per 50 s, not at every raw boundary. | NEW | ER r.27 |
| LC-52 | Dissolve nearly every montage cut, including into and out of plates (0.5-0.8 s). | CONFLICT - Farrell says most edits are straight cuts (31 of 34) and to cut straight unless a job applies | ER r.32 |
| LC-53 | Dissolve the exits from evidence, hard-cut the entries into evidence so the riser lands; a clip under about 2.7 s takes one transition only. | NEW | ER r.89 |
| LC-54 | Dissolve and dip width is about 1.2 s (owner approved); never 2.0 s. | NEW | ER r.104 |
| LC-55 | A hard cut on the hook (cold open into first raw) is fine and needs no transition. | NEW | ER r.28 |
| LC-56 | Transitions never cross the creator's own cut; a plate needs material (handles) on both sides, about 0.6 s. | NEW | ER r.29 |
| LC-57 | Never judge a transition at its cut frame; sample inside it. | NEW | ER r.119 |
| LC-58 | Hard cut by default; at most 3 designed transitions per minute; never the same exit twice in a row, never one type 3 times in a row, at most one white flash per case. | IN GUIDE | OT s2; CS s10; GX; Farrell section 9 (cut straight unless a job applies) |
| LC-59 | Flashes, dips and blurs are for time skips and case changes only; a dip carries motion through the black (outgoing shot accelerates, incoming settles). | IN GUIDE | CS s10; OT s3; Farrell rule 9 |

## Audio and narration

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-60 | Raw audio starts before its picture (J-cut); owner envelope pre-lap 1.0 s, fade-in 3.22 s (reviewer once cut to 2.0 s), fade-out 2.74 s, constant on long raws. | CONFLICT - Farrell rule 8 uses 2.0 s pre-roll and 6.44 s fade-in scaled for short clips | ER r.30, r.64 |
| LC-61 | No creator audio under narration: B-roll over voice-over is picture only. | NEW | ER r.16 |
| LC-62 | When the beat is the raw clip, pre-lap its picture; do not cut away to the same scene; gaps under about 5 s are a head extension. | NEW | ER r.17 |
| LC-63 | Two raws after one prose block: the second gets no pre-roll. | NEW | ER r.31 |
| LC-64 | Narration that restates on-camera dialogue repeats the shot in mono (saturation 0); a recap run takes mono, colour returns on the line back to the present. | CONFLICT - Farrell keeps raw footage un-desaturated and only desaturates graphics | ER r.18, r.19 |
| LC-65 | Choose each raw on what is said in it: the soundbite that corroborates the paragraph; quoted dialogue beats a timestamp hint. | NEW | ER r.85, r.102 |
| LC-66 | A raw after every paragraph (minimum 8 s), and a video never ends on narration over black. | NEW | ER r.86 |
| LC-67 | Let narration breathe: cut where the waveform rests, keep narrator pauses (comma 0.2 s, sentence 0.35 s, paragraph 0.5 s); never tighten more than about 15%. | NEW | ER r.100 |
| LC-68 | Narration is only 56-72% of runtime; leave footage audio and silence, long speech gaps are the style, do not fill them. | NEW | ER r.118 |
| LC-69 | Verify every narration take by transcript against the script before building. | NEW | ER r.120 |
| LC-70 | A verdict, a prayer or a plea is never scored: pick the silent beat from the content. | NEW | ER r.63 |
| LC-71 | A source peaking at 0 dB cannot be brought up with gain; measure mean and peak and let the owner choose. | NEW | ER r.94 |
| LC-72 | A raw picture keeps running about 1.25 s under the next narration with its audio ducked to -24 dB, and the creator's voice is never audible under narration. | NEW | PLAYBOOK s3 |
| LC-73 | Tighten AI narration gaps: sentence ends 0.25-0.35 s, commas 0.15-0.20 s. | NEW | PLAYBOOK s4 |
| LC-74 | Remove the source creators' background music but keep ambience and scares. | NEW | PLAYBOOK s4 |
| LC-75 | Master at -16 LUFS integrated, -1.5 dBTP; level raw dialogue to within 3 LU of the narration. | CONFLICT - minor): Farrell masters to -17 LUFS | PLAYBOOK s4 |
| LC-76 | Each case starts with the narration (case number, date/place, then voice-over); the intro carries no raw audio; the video opens on the best case with real sound, never a silent-footage case. | CONFLICT - Farrell cold-opens on raw footage with source audio before narration | OT s2; ICEBERG |
| LC-77 | Voice-over and clip speech never overlap; the music bed ducks but is never dead (never below -50 dB for 1.2 s). | NEW | ICEBERG; CS s12 |
| LC-78 | Master -16 LUFS, peak -1 dBTP; linear-gain loudness rather than one-pass loudnorm. | CONFLICT - minor): Farrell masters to -17 LUFS | OT s2; GX |

## Music

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-79 | Music bed about -31 LUFS, 3-7 cues per case crossfaded 6 s; a chapter card is never digital silence. | NEW | ER r.66 |
| LC-80 | Score the audio starts (the J-cut entry) precisely, never randomly: risers end on the evidence entry, impacts start on it. | NEW | ER r.67 |
| LC-81 | Never add music or SFX unless asked; when asked, build it fully with sane static levels and no ducking. | NEW | ER r.62 |
| LC-82 | Narration sits about 14-15 dB over the music bed; the bed swells on climaxes and drops for 1-1.5 s before narration after a climax. | CONFLICT - Farrell keeps music 8 dB under narration as a flat dark bed | PLAYBOOK s4 |
| LC-83 | Never put music over a silent "raw"; use 1-2 bed sections from different parts of a track and never the same (track, start) twice; adjacent cases never open on the same track. | NEW | OT s2; CS s12 |

## SFX

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-84 | House SFX levels: impact -8, sub -5, riser -10, suck -14, vhs -18, texture -24 dB; hottest element about -8.5 dB peak. | NEW | ER r.65 |
| LC-85 | SFX are atmosphere, not punctuation: cluster them before a new section instead of punching every cut. | NEW | ER r.65 |
| LC-86 | Vary the scare: no two hand-offs get the same treatment; save the biggest hit for the act break and finale. | NEW | ER r.112 |
| LC-87 | Mark the exits too: the return from evidence to narration gets its own low air-suck sound. | NEW | ER r.113 |
| LC-88 | Layer sound: a sub only on the biggest beats, a seamless room tone, one register sound naming the medium (tape click, radio static). | NEW | ER r.114 |
| LC-89 | Never drop a diegetic sound effect blind; look at the frames first. | NEW | ER r.115 |
| LC-90 | No SFX file repeats inside a series; reviewers hear the reuse. | NEW | ER r.116 |
| LC-91 | A texture SFX is earned only when the narration names the sound. | NEW | ER r.117 |
| LC-92 | SFX stay restrained and tied to transitions (impacts on flashes, whooshes on slides, glitch hits). | NEW | PLAYBOOK s4 |
| LC-93 | SFX sit 6-8 dB under the voice-over; never invent SFX; rotate variants; look-here marks are silent. | NEW | GX; CS s7, s11 |
| LC-94 | Level SFX to the raw voice-over; an SFX set 15-20 dB too loud is a rejected mix. | NEW | CS s11; OT s5 |

## Color and grade

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-95 | Grade to measured targets pooled over every used range, never one frame; a landed grade is never carried to another case as a preset. | NEW | ER r.57 |
| LC-96 | Night footage gets a smaller lift; one global grade turns night into grey haze; lift per range, not per case or series. | NEW | ER r.58, r.129 |
| LC-97 | Evidence stays ungraded; only atmosphere B-roll takes the cold push. | IN GUIDE | ER r.60; Farrell: raw footage gets no added grade |
| LC-98 | Leave saturation high enough that a mono echo keeps its meaning. | NEW | ER r.59 |
| LC-99 | Measure every placed frame's mean luma; swap a near-black shot rather than rescuing it in the grade. | NEW | ER r.61 |
| LC-100 | Fill and grade only as much as asked; propose the rest rather than doing it. | NEW | ER r.93 |
| LC-101 | Measure darkness inside the picture area on vertical or pillarboxed footage, not the full frame. | NEW | ER r.57, r.130 |
| LC-102 | Read the black floor from the p10 percentile, not the darkest pixel; the hit found-footage channel carries a warm/magenta cast, not neutral. | CONFLICT - Farrell grade is a neutral tint at 14-19% saturation | ER r.57 (Nocturn note) |
| LC-103 | Every screenshot is captured in dark mode so a white page never flashes in a dark cut. | IN GUIDE | ER r.110; Farrell section 4 |
| LC-104 | Night footage is lifted until it reads; look is muted colour with reds kept, deep contrast, soft bloom, vignette and grain. | NEW | PLAYBOOK s5 |
| LC-105 | No added grain on raw footage in the reference channel's style (native crops); raws stay as the creator shot them. | IN GUIDE | EK editing_rules/GRADING.md; Farrell rule 6 (raw footage gets no added texture) |
| LC-106 | Never stack creative LUTs: at most one LUT per shot, blended by intensity; a missing LUT stops the plan and is never substituted. | NEW | EK editing_rules/GRADING.md |
| LC-107 | Warrior Mind LUT pick by pooled brightness: above 65 daylight, 28-65 main night warm, below 28 dark-footage lift; the near-black evidence LUT is chosen by hand only. | NEW | EK editing_rules/INFERRED_RULES.md; color_grading/color_profiles.json |
| LC-108 | A shot with mean luma under about 8 (8-bit) counts as near-black and is swapped, not graded. | NEW | EK editing_rules/GRADING.md |
| LC-109 | One grade cube on all footage except evidence; saturation is never boosted; pre-grade clips neutral with no grain. | IN GUIDE | OT s4; CS s13; GX; Farrell (raw footage gets no added look) |

## Text and captions

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-110 | Highlight the claim, not any phrase; the highlight lands on the spoken word and the wipe finishes inside the shot. | IN GUIDE | ER r.39, r.40; Farrell Line highlight |
| LC-111 | Draw and look at the highlight rectangle on the source before rendering; quote the comment in full and let the highlight pick the claim. | NEW | ER r.41, r.42 |
| LC-112 | Highlight blend follows the page: screen on dark, multiply on light; red on dark, yellow on light. | NEW | ER r.44, r.127 |
| LC-113 | Keep the 3-D tilt on pages (it stops a page reading as a screen recording); sharp text, no blur over text. | IN GUIDE | ER r.45, r.127; Farrell section 5 |
| LC-114 | An establishing shot gets a location stamp in VCR OSD Mono: place large, region small, uppercase, wide tracking, soft CRT bloom. | IN GUIDE | ER r.51; Farrell rule 2 |
| LC-115 | Spell proper nouns from the source's title or description, never from the transcript; list place names for caption casing. | NEW | ER r.52, r.132 |
| LC-116 | A title matches the shot under it and lands on the word that names the place. | NEW | ER r.53 |
| LC-117 | A title on a bright plate needs a scrim; move it off a chyron. | NEW | ER r.54 |
| LC-118 | Text safe area: 80 px from the sides, 100 px top/bottom at 1080p; headline at least 84 px, supporting at least 44 px. | NEW | ER r.55 |
| LC-119 | Use warm off-white ink, never pure white, one accent colour sparingly, and a heavy text shadow. | CONFLICT - Farrell uses white for file names, gold for names and dates, red for warnings | ER r.56 |
| LC-120 | Titles and overlays fade in and out, never pop; raw subtitles and small notes cut hard on and off. | NEW | ER r.36 |
| LC-121 | Delete caption fragments and captions that overhang the raw ("And.", half sentences). | NEW | ER r.111 |
| LC-122 | A black VCR OSD Mono "CASE N / place" card opens each case; no separate case title opener. | NEW | ER r.134 |
| LC-123 | Never show a creator's description when it holds personal or payment data. | NEW | ER r.131 |
| LC-124 | Captions are for creator speech only, never the narration; hand-fix every transcription error; bleep profanity with a dash in the caption. | NEW | PLAYBOOK s3 |
| LC-125 | Put a small "YouTube: channel" credit bottom-left on raw clips. | NEW | PLAYBOOK s3 |
| LC-126 | Never use kinetic, pop or bounce text, lower-thirds, location tags or captions of the narration. | CONFLICT - Farrell uses bottom-left source labels and location-style mono labels (it also bans kinetic text and burned captions) | PLAYBOOK s1 |
| LC-127 | A label's form follows its meaning (place = map or HUD callout, date = data row, person = anchored tag, number = counter); never the same lower-third twice in a row. | NEW | CS s2 |
| LC-128 | Text is always native editor text; never a static title card, the title is a wall of tiles that flip to clips on the words. | NEW | OT s2, s4 |
| LC-129 | Speaker-anchored captions on raws; name tag shown the first time a key person speaks or is named. | NEW | OT s2, s3 |

## Motion graphics use

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-130 | A graphic only when the footage cannot show the claim; text-on-screen share is a ceiling, not a quota. | IN GUIDE | ER r.23; Farrell Motion graphics table |
| LC-131 | "Do both": a spatial idea can take B-roll and the explaining graphic. | NEW | ER r.24 |
| LC-132 | A date, a place, a named channel each get their own graphic, automatically, unless the script withholds it. | IN GUIDE | ER r.21; Farrell Motion graphics table |
| LC-133 | Open a case on the channel page in a 3D pan when the first clause names the channel; the plate ends on the next noun, 4-8 s. | NEW | ER r.20 |
| LC-134 | Never use a stand-in for an unsourceable place or document; change the plan and say which beat changed. | NEW | ER r.25, r.81 |
| LC-135 | Never show another YouTube channel's page unless the narration names it; replace foreign-language documents and AI stills with real material. | NEW | ER r.98, r.99 |
| LC-136 | Pencil-on-paper explaining diagrams were liked then dropped permanently; infographic and VHS-look diagrams were rejected. | IN GUIDE | ER r.46; Farrell: no invented infographics |
| LC-137 | Nothing on a plate may flicker or boil; texture lives in geometry, not a filter; map dashes and labels must not crawl or snap. | NEW | ER r.47 |
| LC-138 | Not too much animation: labels ease in and stay put, no springy bounce, one ease over a whole move (no stop at each keyframe). | NEW | ER r.48, r.124 |
| LC-139 | An arrow tip lands short of the subject; the ring is parented to the shot; do not mark what the viewer cannot see. | NEW | ER r.49 |
| LC-140 | Look at a plate at 3-4x reduction; marks must survive small. | NEW | ER r.50 |
| LC-141 | A card push can clip its own text; keep push at or under 0.8 %/s or pad the page; check the last frame. | NEW | ER r.91 |
| LC-142 | A graphic used more than once in a case is one component with a state; only the annotation layer changes. | NEW | ER r.92 |
| LC-143 | Static framing unless the reference pushes; the push belongs to the reveal and the cards, one reveal per story. | CONFLICT - Farrell rule 7 says every graphic moves and push-ins dominate (the note itself says the reference decides) | ER r.90 |
| LC-144 | Archive photos get a gentler camera than screenshots; a plate whose own printed caption names the place is worth reframing for. | NEW | ER r.84 |
| LC-145 | A map dive opens already framing the place, then pushes in slowly; never open wide or zoom-bounce. | NEW | ER r.125 |
| LC-146 | A page device fills the whole frame and is centred at every frame. | IN GUIDE | ER r.126; Farrell rule 5 |
| LC-147 | A quote the viewer already heard lands whole (not typed on); only the words that carry the story light up. | NEW | ER r.107 |
| LC-148 | A single figure lands whole and its unit follows; never type a number on; only a real countdown gets the alarm colour. | NEW | ER r.108 |
| LC-149 | When there is no document (declared fiction), illustrate with a drawing that claims nothing. | NEW | ER r.109 |
| LC-150 | Pick the projection that shows the relation (plan, section, elevation); context marks go down light, the carrying mark pressed hard. | NEW | ER r.105, r.106 |
| LC-151 | Every on-screen device must be one the references actually use; never invent odometers, stamps, tuner readouts, tally marks or REC counters. | IN GUIDE | PLAYBOOK s1; Farrell Motion graphics intro |
| LC-152 | Study how each reference opens a case; one opening animation plus one odd device is not enough. | NEW | PLAYBOOK s1 |
| LC-153 | Give each case its own house style and opener; do not copy one case's devices into all of them, reuse only small utilities. | NEW | PLAYBOOK s2 |
| LC-154 | Use real material only (real watch page, channel page, Wikipedia, Google Earth); never point an arrow at an unverifiable place. | IN GUIDE | PLAYBOOK s2; Farrell: show evidence as the thing itself |
| LC-155 | Never use yellow highlighter, split screens, zoom punches on beats, or invented UI. | CONFLICT - Farrell uses a pale-yellow line highlight and split-screen layouts (its own references show them) | PLAYBOOK s1 |
| LC-156 | Pages are real captures, never re-typed; never show a competitor channel's page; about half the pages carry no highlight. | IN GUIDE | CS s4; Farrell Motion graphics intro |
| LC-157 | Maps use satellite plates only (no OSM patchwork), never zoomed past native resolution, and open already zoomed in near the place with the place highlighted from the start. | NEW | CS s5; OT s4 (2026-10-25) |
| LC-158 | Explainers (line-art, neon pictograms) only where the narration explains a mechanism, laid over dimmed blurred case footage and never on black. | NEW | ICEBERG; OT s3 |
| LC-159 | Look-here marks (rings, freezes, punches) are silent, and at most about 3 freeze-punches per video. | NEW | CS s7 |
| LC-160 | Red is never used on red or warm plates (white text, contrast 4.5:1 or better). | NEW | CS s0 |
| LC-161 | Pages enter in varied ways (cut, short flash, flash-streak, one white frame, fade, glitch) and the treatment rotates between full, card over blurred clip and tilted handheld. | NEW | CS s4; OT s3 |

## Structure and story

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-162 | Close the video on the thesis image, held as live footage not a freeze. | NEW | ER r.22 |
| LC-163 | End on the next case's picture when the narration turns to it (teaser). | NEW | ER r.88 |
| LC-164 | Verify the narration against footage before planning picture; search the case before illustrating it; use a different true document if the true one contradicts the beat. | NEW | ER r.81, r.82, r.83 |
| LC-165 | Open each case with a dense, layered opener; the intro is a teaser montage with every cut on a narration word. | NEW | PLAYBOOK s2 |
| LC-166 | Send the first one or two cases for approval before doing the rest. | NEW | PLAYBOOK s7 |
| LC-167 | A black VCR OSD Mono CASE card: "CASE N" about 130 px #EDEDED over the place at 49 px #BDBDBD, uppercase, 3.5 s total (black 0.4, fade in 0.5, hold, fade out 0.5, black 0.3). | NEW | EK editing_rules/CASE_STRUCTURE.md; ER r.134 |
| LC-168 | A case break goes through black: 0.5 s fade down, 0.4 s black, card, 0.5 s fade up. | CONFLICT - Farrell marks chapter changes with a VHS transition, dip to black only for a new date, place or period | EK editing_rules/CASE_STRUCTURE.md |
| LC-169 | No text on the intro or the outro. | CONFLICT - Farrell ends with a narrated sign-off with credits and opens on a title or label | EK editing_rules/CASE_STRUCTURE.md |

## Taste (likes / dislikes)

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-170 | Keep one channel style for every video; "something of your own" means better templates inside the style, never a new look. | NEW | OT s1; CS s0; ICEBERG s1 |
| LC-171 | Never put text on screen that just restates the narration; text only for case number, date/place, a name tag, a key stat and real page highlights (the owner was furious about a repeated context tag). | IN GUIDE | OT s2; ICEBERG item 5; Farrell Motion graphics intro (no burned captions) |
| LC-172 | Banned: TV frames and logos, headline strips or text on black, handwritten or dripping fonts, talking heads over 3 s, black side bars, postcard decoration, invented "AI-looking" devices. | CONFLICT - Farrell isolates a line or URL on black; the talking-head and invented-device bans match Farrell | OT s2; ICEBERG item 8 |
| LC-173 | Detail, do not decorate: devices that look machine-made are rejected. | IN GUIDE | OT s2; Farrell Motion graphics intro |
| LC-174 | Smoothness is a must: every move eased, every hand-over planned (J-cuts, cut on motion, no jumpy points, no repeated or frozen frames, graphics oversize then settle). | NEW | OT s1 |
| LC-175 | Fix everything, not only what the owner named; gate each case side by side against the references before he sees it. | NEW | OT s2 |
| LC-176 | Age-restriction rule: hook and title tiles never show a person struck, hurt or in danger, even blurred; show the event, end on the strongest non-human peak; cut before contact inside cases. | NEW | OT s2; ICEBERG item 9 |
| LC-177 | Blur injured or dead faces in every frame (including before the incident); never tint or ring people red. | NEW | OT s2; CS s9 |
| LC-178 | Licensing: no clips whose rights sit with agencies (Jukin, ViralHog, Storyful, Newsflare); no station-shot TV b-roll. | NEW | OT s2 |

## QC checks

| ID | Learning (1 sentence) | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LC-179 | Verify by looking: a frame at the midpoint of each new shot, tiled; verify the cut as well as the picks. | NEW | ER r.68, r.69 |
| LC-180 | Measure first, sheet second, watch last; a contact sheet proves a device exists, not that it is absent. | NEW | ER r.71 |
| LC-181 | A number from one reference is that video's quirk; use three or more same-format references and treat a range as a sanity check. | NEW | ER r.72, r.122 |
| LC-182 | Read the reference itself before building to it; a summary is not the study. | NEW | ER r.95 |
| LC-183 | A detector count is a floor; calibrate thresholds on the footage (black is the file floor + 6, not luma 10). | NEW | ER r.123 |
| LC-184 | Run a freeze audit on every used source range; sources can freeze by themselves. | NEW | ER r.121 |
| LC-185 | Gap checks must catch below one frame (0.005 s) so 1-frame black flashes are found. | NEW | ER r.33 |
| LC-186 | Settle motion claims with flow numbers: max frame-to-frame velocity change under about 0.7 px, no zero-velocity dips. | NEW | ER r.124 |
| LC-187 | Report which beat was changed and why, mark shots confirmed/generic/absent, and say what stays unverified. | NEW | ER r.75 |
| LC-188 | QC every case: black frames, freezes, silences, loudness, no creator speech under narration, and a frame sheet of the finished case. | NEW | PLAYBOOK s7 |
| LC-189 | Never claim something is done or verified unless it is. | NEW | PLAYBOOK s8 |
| LC-190 | Frame tolerance is plus or minus 1 frame; black check threshold 0.005 s; undecodable files and missing audio are critical, unplanned black and bad frames are repairable. | NEW | EK quality_control/qc_rules.json |
| LC-191 | Freeze of 2 s or more and silence of 1 s or more below -60 dB are flagged for human review; a narration range 90% silent counts as missing narration. | NEW | EK quality_control/qc_rules.json |
| LC-192 | Warn when an audio join jumps more than 18 dB, a source peaks at 0 dBFS, or the delivery pixel format is not yuv420p. | NEW | EK quality_control/qc_rules.json |


# LD: Learnings D (memory files, CLAUDE.md lessons, tool notes)


Base for relative paths: `C:\Users\ayush\Videos\CLAUDE`. `mem/` = `automated-video-workflow/raw-editor/learnings/memory/`. `RElearn/` = `automated-video-workflow/raw-editor/learnings/RElearn/`. Status is against the Farrell guide rev 20.

## Part 1. Editing learnings

### Pacing and cuts

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-1 | Cut B-roll only at a sentence end or when the narration changes topic, on the pause midpoint or the word boundary, never by feel or on a round number. | NEW | mem/cut-on-the-clause-not-by-feel.md |
| LD-2 | Change the picture on the spoken noun: each clause gets the literal picture of what it names, and the picture must not run a shot ahead of the voice. | NEW | mem/cut-the-picture-on-the-noun.md; mem/map-picture-to-clause-not-gap.md |
| LD-3 | One continuous scene is one clip: do not chop it into short cuts, and fill a removed cut by extending the neighbouring clip. | NEW (compatible with the guide's 1-3 s picture changes only if each change is a different picture) | mem/hold-the-shot-one-scene-one-clip.md |
| LD-4 | Pull the raw clip's head back so its picture runs ahead of its own audio when the narration is only describing what the raw clip is about to show. | NEW | mem/hold-the-shot-one-scene-one-clip.md |
| LD-5 | Do not fill narration gaps with frozen frames; replay the source as motion (a frozen talking face reads as a broadcast fault). | NEW (guide only says no still graphics and no photo without a move) | mem/freeze-is-a-choice-not-a-mechanism.md |
| LD-6 | Never leave black under narration; fill every gap from the case's own raw footage between the neighbouring evidence beats. | IN GUIDE (Editing rhythm: never narration over empty black) | mem/stealth-fill-the-black.md; mem/police-broll-method-is-series-specific.md |
| LD-7 | In vlog footage the face dominates, so the non-face seconds are the fill budget; raw footage may run out and leave unavoidable black. | NEW | mem/stealth-fill-the-black.md |
| LD-8 | Generic pacing: B-roll under narration changes every 2-4 s, nothing static past about 7 s without a reason, cut on motion, and about 90% of cuts are hard cuts. | IN GUIDE (hard cuts and 1-3 s changes); 7 s static limit and cut-on-motion are NEW | RElearn/editing/03-nle-concepts.md |
| LD-9 | Hold a B-roll beat for the time needed to read the picture; a plate or highlight runs 3-4 s, max 5 s, and a longer beat is split into two clips at different camera angles. | NEW | mem/highlight-the-claim-verify-visually.md |
| LD-10 | Use J/L cuts so dialogue and audio feel continuous (the next shot's audio starts early, or the current audio carries over). | IN GUIDE (rule 8 pre-roll of 2.0 s) | RElearn/editing/03-nle-concepts.md |

### Transitions

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-11 | Dissolve the exits out of raw evidence and hard-cut the entries into it, so the riser and impact land on the cut. | NEW | mem/premiere-transition-policy-exits-dip-entries-hard.md |
| LD-12 | The boundary between a B-roll montage and a raw clip is a dip to black of about 1-1.5 s, not a cross dissolve; dissolves stay inside the montage. | IN GUIDE (dip between sections, crossfade inside a montage); the montage-to-raw use is NEW | mem/hold-the-shot-one-scene-one-clip.md |
| LD-13 | Transition coverage percentage is an output of the policy, never a target to hit. | NEW | mem/premiere-transition-policy-exits-dip-entries-hard.md |
| LD-14 | Transition lengths that read right at 30 fps: whip 4-8 frames, dissolve 10-20, slow dissolve 30-45, fade to black 30-60; a transition that draws attention must be deliberate. | NEW (guide names the four transitions but gives no lengths) | RElearn/editing/03-nle-concepts.md |

### Audio and narration

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-15 | Clips placed over narration are picture only: strip their audio (ffmpeg -an or delete the clips); muting the track is not enough. | NEW | mem/broll-over-narration-carries-no-audio.md |
| LD-16 | Raw evidence audio enters 2.002 s before its picture and uses a 4-point envelope: -35 dB, 0 dB after 6.44 s, 0 dB until 2.74 s from the end, -30 dB at the end. | IN GUIDE (rule 8: 2.0 s pre-roll, 6.44 s fade-in, 2.74 s fade-out) | mem/premiere-evidence-audio-envelope.md |
| LD-17 | Raw-audio fade-ins were cut from 6.4 s to 2.0 s in the Warrior Mind master. | CONFLICT (guide rule 8 fades in over 6.44 s) | mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-18 | Match the level so narration and raw audio sit at 0 to -6 dB on the meter; bake the gain into the file and do not use clip gain or faders. | NEW (guide sets mastering at -17 LUFS, not per-clip meter peaks) | mem/premiere-normalise-by-baking-gain.md |
| LD-19 | Speech target is about -16 LUFS integrated with peaks at or below -1 dBTP; never a hard audio cut, use 3-10 frame fades. | CONFLICT (guide masters to -17 LUFS) | RElearn/editing/03-nle-concepts.md |
| LD-20 | Put room tone under everything so silence never sounds like a dropout; digital-silent chapter cards were heard as an audio jump cut and now get a bed under each. | NEW | RElearn/editing/03-nle-concepts.md; mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-21 | Chapter cards in a master are silent, exact-frame-count clips. | CONFLICT (the Warrior Mind fix gives every card a bed, see the previous row) | mem/premiere-master-assembly-and-chapter-cards.md |
| LD-22 | Verify every narration take by transcribing the whole file and diffing it against the script; a wrong take can share its opening words. | NEW | mem/verify-every-narration-take-by-transcript.md |
| LD-23 | Narration is pre-stripped of silence by the owner; skip any automatic silence-cut phase. | NEW | mem/phantom-plugin-cuts-narration.md |
| LD-24 | The voice is chosen per video; ask which voice, never assume the last one. | NEW | PROJECT/tools/algrow-voice/LEARNINGS.md |

### Music

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-25 | Never volunteer music or SFX: add them only when the owner asks by name; the mix is his. | CONFLICT (guide sets a music bed and VHS SFX as standing rules; the owner now asks by name) | mem/never-add-music-or-sfx.md |
| LD-26 | Use one music track per video, extended to length by cross-fading the track into itself, never two stitched tracks. | NEW | mem/music-one-bed-extended-not-two-stitched.md |
| LD-27 | Use 3-7 different music tracks per case, crossfaded over 6 s, because a single bed at -37 LUFS was inaudible. | CONFLICT (contradicts the one-bed row above; 2026-09-18 vs 2026-09-29, both Police/Warrior Mind) | mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-28 | Music sits 9-12 dB under speech; the case-1 bed ran at -16 dB with ambience at -24 dB. | CONFLICT (guide: music 8 dB under the narration) | RElearn/editing/03-nle-concepts.md; mem/premiere-case-one-horror-audio-pass.md |
| LD-29 | Keep music bass-heavy and dark: roughly 25 cues per video, centroid near 260 Hz, bed near -17.7 dBFS. | IN GUIDE (dark ambient bed, not a melody); cue count and numbers NEW | mem/wm-police-reviewer-fixes-2026-09-29.md |

### SFX

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-30 | Score the hand-off between a narration passage and an evidence block with a riser ending on the evidence entry and an impact starting on it; read the audio starts, not the video cuts. | NEW (guide SFX are VHS-transition SFX only) | mem/premiere-case-one-horror-audio-pass.md; mem/premiere-precise-riser-placement.md |
| LD-31 | Place risers where the script says 'watch closely' or 'listen', not randomly. | NEW | mem/premiere-precise-riser-placement.md |
| LD-32 | Vary the beats and escalate the impacts; a formulaic repeat was rejected, and the biggest impact goes on the act break and the final block. | NEW | mem/premiere-case-one-horror-audio-pass.md |
| LD-33 | Leave one hand-off per case unscored, chosen from what the block says (a legal verdict, a prayer, a plea, a line where silence is the answer). | NEW | mem/police-encounters-sound-pass.md |
| LD-34 | Every SFX clip is a different file (127 unique), each baked to its own level. | NEW (guide keeps each VHS transition's built-in SFX) | mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-35 | SFX sits 6-10 dB under speech unless the SFX is the moment. | IN GUIDE (VHS SFX kept short, under the narration) | RElearn/editing/03-nle-concepts.md |

### Color and grade

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-36 | Evidence footage stays ungraded; the treatment layer is thin overlays and framing on top of the cut. | IN GUIDE (raw footage gets no added texture, vignette or desaturation) | mem/grandmas-nightmares-style.md |
| LD-37 | Repeat a shot that echoes what the subject just said, but drain its colour (saturation 0, or about 35-60 for a softer echo) so it reads as a deliberate, uneasy echo. | CONFLICT (guide: raw footage gets no desaturation) | mem/desaturate-the-narration-echo.md |
| LD-38 | Fix dark night raw by lifting (exposure +1.9, shadows +45, blacks +5, contrast +10); blacks -10 crushes it and blacks +20 turns grey. | NEW | mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-39 | Treat measured look figures as targets, not directions, and pool every used source range before grading because one frame can invert the answer. | NEW | mem/grade-measure-pooled-never-one-frame.md |
| LD-40 | Grade after the cut is locked, in order exposure, white balance, contrast, saturation, creative look; match shots before making any look good. | NEW | RElearn/editing/03-nle-concepts.md |
| LD-41 | Take every captured screen (channel pages, comments, articles) in dark mode so a white page never flashes in a dark cut. | IN GUIDE (near-black grounds, dark grade) | mem/screenshots-in-dark-mode.md |
| LD-42 | Use a blurred enlarged fill behind a pillarboxed or letterboxed clip, with a frame-count guard. | NEW (guide uses blur only behind title cards) | skill aspect-fill; mem/premiere-blurred-fill-via-relink.md |

### Text and captions

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-43 | Put the place name on every wide or aerial establishing shot, large with the region small beneath, in VCR OSD Mono. | NEW (the VCR OSD Mono font itself is IN GUIDE, rule 2) | mem/location-title-vcr-font.md |
| LD-44 | A date, a place and a named channel each get their own graphic every time; skipping one to save a fetch is the mistake. | IN GUIDE (Year/chapter title, Map/place card, Page plane) | mem/graphics-pass-is-not-optional.md |
| LD-45 | A date gets its own full-frame shot, not a corner stamp. | IN GUIDE (Year/chapter title) | mem/cut-the-picture-on-the-noun.md |
| LD-46 | Captions get a solid black box behind the text, not a drop shadow or outline, and are made with Premiere's Text tool. | CONFLICT (guide: no burned captions or word pops; captions only in VCR OSD Mono) | PROJECT/CLAUDE.md (Learned rules) |
| LD-47 | Titles stay on screen at least 1.5 s plus 0.06 s per word, animate in over 8-15 frames, and are never cut on and off hard. | CONFLICT (guide: devices enter on a hard cut; title cards 2-4 s) | RElearn/editing/03-nle-concepts.md |
| LD-48 | Keep titles at least 80 px from the sides (title safe about 90%); one idea per card. | NEW | RElearn/editing/03-nle-concepts.md |

### Motion graphics use

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-49 | For camping and paranormal cases, motion graphics must be pencil-on-paper (h-paper) with no title nearby; clean vector infographics and an analog VHS plate were each rejected. | CONFLICT (guide builds page planes with VHS-style texture; this is specific to the camping cases) | mem/graphics-pencil-not-infographic.md |
| LD-50 | For the police/CCTV series use the red circle, block arrow and red title measured from the reference, not hand-drawn h-paper. | IN GUIDE (red circle and red title); block arrow NEW | mem/gn-reference-graphics-kit.md |
| LD-51 | Highlight only the actual claim in a comment, and verify each bar by drawing it on the real pixels before rendering. | IN GUIDE (Line highlight: only a line the VO names) | mem/highlight-the-claim-verify-visually.md |
| LD-52 | Highlight blend follows the page: screen on dark pages, multiply on light pages. | IN GUIDE (multiply on pale yellow); screen on dark is NEW | mem/comment-highlights-preset.md |
| LD-53 | Place a red reveal ring only in the calmest camera window: sweep inter-frame difference over the source, and difference two frames seconds apart to catch slow events. | NEW | mem/reveal-needs-a-still-camera.md |
| LD-54 | Open a case on a 3D-panned screenshot of the YouTube channel page when the first narration names the channel. | CONFLICT (guide opens cold on the most disturbing footage); the page plane itself is IN GUIDE | mem/open-a-case-on-its-channel.md |
| LD-55 | Use the full police-encounter treatment (stock, screenshots with pan, highlighted claims, text plates) only when the owner asks for it by name; the default is a regular edit from supplied raw footage. | IN GUIDE (narration over raw clips only); the heavy method belongs to a different series | mem/warrior-police-is-a-police-encounter-edit.md; mem/police-broll-method-is-series-specific.md |
| LD-56 | Use a 65% narration / 20% motion graphics / 15% stock ratio over narration sections only, never over raw footage. | CONFLICT (guide: narration over raw clips only, no stock mix) | PROJECT/CLAUDE.md (Learned rules) |
| LD-57 | Raw footage should be at least 70% of a case (Warrior Mind cases were 52-63% raw before the fix). | IN GUIDE (raw footage dominates) | mem/wm-police-reviewer-fixes-2026-09-29.md |
| LD-58 | Map animations use a smoothed route in one solid colour with no dashes, a camera on a smooth spline, and everything that moves with the map inside the 3D scene. | CONFLICT (guide: map cards are real Google Maps; no invented route lines) | RElearn/notes/15-map-animation.md; mem/map-animation-smooth-and-still.md |
| LD-59 | Overlay graphics go on a separate track with a transparent background. | NEW | PROJECT/CLAUDE.md (Learned rules) |

### Structure and story

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-60 | Build the picture to the script: if narration names a place or document you cannot source, change the beat instead of showing a lookalike, since an uncaptioned stand-in still reads as the named thing. | NEW | mem/unsourceable-place-change-the-plan.md |
| LD-61 | Cover the destination the narration names, never the walker, so the picture survives a re-record. | NEW | mem/case7-built-over-a-wrong-narration-line.md |
| LD-62 | Never fabricate a document about a real place or institution; say nothing on screen about a staged origin when the owner decides so. | NEW | mem/stealth-case3-is-fiction.md; mem/case-two-staged-skit.md |
| LD-63 | Show real comments and sources only; do not invent or retype them. | IN GUIDE (Comment card: do not invent or retype) | mem/youtube-comments-as-data-not-screenshots.md |
| LD-64 | Run the reference analysis first and never edit from a text description of a reference. | NEW (process rule) | PROJECT/CLAUDE.md (Learned rules) |

### Taste

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-65 | Thumbnails show no visible person, use a bodycam perspective, and keep the threat as an unseen or ghostly figure. | NEW (guide does not cover thumbnails) | Photoshop/CLAUDE.md (Learned rules) |
| LD-66 | Do not let a still shot sit on screen with no motion, reveal or graphic. | IN GUIDE (rule 7; photo push never held still) | RElearn/editing/03-nle-concepts.md |
| LD-67 | Centred framing reads as formal and confrontational; place subjects on thirds with headroom and look room. | CONFLICT (guide rule 5: compose to the centre) | RElearn/editing/03-nle-concepts.md |

### QC checks

| ID | Learning | Status vs Farrell guide | Source path(s) |
|---|---|---|---|
| LD-68 | Scan the whole source for burned-in title cards and letterboxed outros before choosing any fill range. | NEW | mem/source-carries-burned-in-cards.md |
| LD-69 | Measure the clean picture region of an inset CCTV news package per region before punching in. | NEW | mem/premiere-cctv-inset-borders.md |
| LD-70 | True black is the clip's own floor plus about 4 (floor 16 on limited range); a mean<12-15 test wrongly condemns dark night footage. | NEW | mem/dark-is-not-black-frame-tests.md |
| LD-71 | Measure luma on every fill frame; a contact sheet does not catch a shot that plays as black. | NEW | mem/measure-fill-frame-luma-not-just-the-sheet.md |
| LD-72 | Verify scratch audio tracks by clip count; a stray unmuted clip hid under the narration despite a blanket 'all 0' claim. | NEW | mem/police-encounters-sound-pass.md |
| LD-73 | Check each source folder holds the right video: the download order was not the case order (7 of 8 folders held the wrong video). | NEW | mem/stealth-camping-build.md |

## Part 2. Tool learnings (not for the style guide; kept for reference)

### Premiere

| ID | Learning | Source |
|---|---|---|
| LD-74 | Premiere active-sequence hazard: add_to_timeline hits whatever is active right then; pin by id first. | mem/premiere-active-sequence-hazard.md |
| LD-75 | Premiere CAN add tracks: new tracks insert at the TOP and shift every existing index down. | mem/premiere-cannot-add-tracks.md |
| LD-76 | set_clip_volume: FIXED; add_audio_keyframes/adjust_audio_levels still need dB-15. | mem/premiere-set-clip-volume-silences-clips.md |
| LD-77 | Premiere trim: trim always extends the TAIL; a head extension is trim-then-move. | mem/premiere-trim-noop-and-add-ripples.md |
| LD-78 | Premiere QE move/delete: moveToTrack takes a RELATIVE delta; delete via bin-park. | mem/premiere-qe-move-and-delete-broken.md |
| LD-79 | Git Bash apostrophe: copy to a clean temp name; quoting cannot fix it. | mem/gitbash-apostrophe-breaks-native-exe-paths.md |
| LD-80 | Premiere Lumetri: numeric grading works; .cube LUTs have no scripted route. | mem/premiere-lumetri-unreachable-bake-grades.md |
| LD-81 | Premiere MCP fixed fork: all 9 tools fixed and live-verified; the active server. | mem/premiere-mcp-fixed-fork.md |
| LD-82 | Premiere XML surgery: .prproj is gzipped XML; offline track-append works. UI automation is a dead end. | mem/premiere-tier2-xml-surgery.md |
| LD-83 | The Saver deploy copy: the panel runs from a copy in Adobe/CEP/extensions; editing the project folder does nothing. | mem/the-saver-deploy-copy.md |
| LD-84 | Transition delete: tx.remove(false,false) is the only working form. | mem/premiere-transition-delete-api.md |
| LD-85 | Placing rendered graphics: Remotion .mov carries SILENT audio that clobbers narration. | mem/premiere-placing-rendered-graphics.md |
| LD-86 | create_adjustment_layer hangs: grade via copy_effect_values instead. | mem/premiere-adjustment-layer-hangs-premiere.md |
| LD-87 | slip_edit is not seconds: it renders black; re-place instead. | mem/premiere-slip-edit-is-not-seconds.md |
| LD-88 | Overwrite-in-place false error: it "fails" but worked; check the nodeId. | mem/premiere-overwrite-same-slot-false-error.md |
| LD-89 | Move overshoot & still trim base: long moves land 2-4 frames late and lie; call twice. | mem/premiere-move-overshoot-and-still-trim-base.md |
| LD-90 | CASE card recipe: MCP cannot retype Essential Graphics text; render as PNG. | mem/premiere-case-card-recipe.md |
| LD-91 | Transitions need handles: tpad 0.6s cloned handles before placing. | mem/premiere-transitions-need-handles-both-sides.md |
| LD-92 | copy_effect_values skips names: silently drops Lumetri Sat/Contrast/Temp; set per clip. | mem/copy-effect-values-skips-ambiguous-names.md |
| LD-93 | Picture + leading audio: one add_to_timeline does both, anchored on the EARLIER in-point. | mem/premiere-place-av-anchors-on-earlier-in-point.md |
| LD-94 | Source usable bounds: contact-sheet head and tail before lengthening. | mem/premiere-source-usable-bounds-case-one.md |
| LD-95 | Audio-only placement false-errors: always "fails", always works. | mem/premiere-audio-only-placement-false-error.md |
| LD-96 | Scale to frame before placing: the flag only affects later placements and has no getter. | mem/premiere-scale-to-frame-before-placing.md |
| LD-97 | Place by nodeId: names collide project-wide; a stray setsar imports stretched. | mem/premiere-place-by-nodeid-and-setsar-last.md |
| LD-98 | EditRecording null edit: edit:null means that duration is unproducible; nudge it, don't retry. | mem/premiere-editrecording-null-edit.md |
| LD-99 | 4K one-pass export: export_sequence writes nothing; queue via AME with the patched 1-pass .epr. | mem/premiere-export-4k-one-pass.md |
| LD-100 | set_item_in_out is inclusive: float-fragile; aim half a frame past and read back. | mem/premiere-set-item-in-out-is-inclusive.md |
| LD-101 | Batch Premiere ops: batch_ops does 40 edits per call; parallelise reads, never mutations. | mem/premiere-batch-ops-and-round-trips.md |
| LD-102 | Overwriting a rendered file: a re-render to the same name silently swaps a placed clip. | mem/premiere-overwriting-a-rendered-file-changes-the-timeline.md |
| LD-103 | Transition duration ignored: always 2.002s; tpad+refresh_media gives handles retroactively. | mem/premiere-transition-duration-ignored.md |
| LD-104 | Audio keyframes are source-relative: a tail-placed clip's fades land outside it. | mem/premiere-audio-keyframes-are-source-relative.md |
| LD-105 | Active sequence flips on its own: re-pin before every read too. | mem/premiere-active-sequence-flips-on-its-own.md |
| LD-106 | create_sequence timebase: defaults to 4K/25fps; pass 29.97002997003. | mem/premiere-create-sequence-timebase.md |
| LD-107 | refresh_media ≠ reindex: same-path file swap leaves a stale index; relink to a NEW filename. | mem/premiere-refresh-media-does-not-rebuild-index.md |
| LD-108 | export_frame needs backslashes: forward slashes fail silently and abort the whole batch_ops run. | mem/premiere-export-frame-needs-backslash-paths.md |
| LD-109 | Contiguous beats need a freeze: a hole between consecutive slices of one take can't hold more of that take. | mem/premiere-contiguous-beats-freeze-trick.md |
| LD-110 | Blurred fill via relink: bake it with ffmpeg, relink; check Motion Scale reads 100 first. | mem/premiere-blurred-fill-via-relink.md |
| LD-111 | CEP cannot overlay the viewer: no Premiere API paints on the Program Monitor; Story Notes draws on a grabbed frame instead. | mem/cep-cannot-overlay-program-monitor.md |
| LD-112 | Exits vs risers: overwrite mode eats one; only the clip COUNT reveals it. | mem/premiere-exits-and-risers-need-separate-tracks.md |
| LD-113 | Gapless fill: nudge >half a frame AND overrun >3 frames on every shot, then re-assert. | mem/premiere-gapless-fill-nudge-and-overrun.md |
| LD-114 | Conform before placing: a 626x360 source sits at 33% size; bake 1920x1080 and relink. | mem/premiere-conform-source-to-frame-before-placing.md |
| LD-115 | Gap edges must be measured: a computed gap edge lands a frame off; read V1 with get_track_info. | mem/premiere-gap-edges-must-be-measured.md |
| LD-116 | export_frame lies at the cut: sampling ON the boundary makes a working transition look phantom. | mem/premiere-export-frame-at-cut-point-lies.md |
| LD-117 | Nested clip is a frame longer: chain the master off each clip's actual end, not computed offsets. | mem/premiere-nested-clip-is-one-frame-longer.md |
| LD-118 | batch_ops place params: start_seconds/track_index; wrong names land every clip at 0 and still report ok. | mem/premiere-batch-ops-place-param-names.md |
| LD-119 | Gap check hides 1-frame gaps: get_timeline_gaps' 0.04 default is wider than a frame; pass 0.005. | mem/premiere-gap-check-default-hides-one-frame-gaps.md |
| LD-120 | One file, two project items: picture and audio may be separate items; check sourceNodeId before relinking. | mem/one-file-can-be-two-project-items.md |
| LD-121 | Single-source case entries: filler and evidence share one file; derive entries from the raw-audio track, never from a spec. | mem/premiere-single-source-case-entries-from-audio.md |
| LD-122 | Place out = frame formula: a 30fps place lands floor(out*30)-1 frames; aim (N+1)/30+0.005. | mem/premiere-place-out-seconds-frame-formula.md |
| LD-123 | Imported-folder ids: import a folder is fine, but search ids by prefix; never compute them. | mem/premiere-imported-folder-ids-not-contiguous.md |
| LD-124 | Hard Limiter on master: fixes nested-mix clipping; params are 0-1 normalized, 0.99 = -0.2 dBTP. | mem/premiere-hard-limiter-on-master.md |
| LD-125 | Build a .prproj only with Premiere closed through the scripted pipeline; revise the owner's open project through the Premiere MCP after saving a .before-<what>.prproj copy, and never close or restart Premiere. | EncountersStudio/CLAUDE.md (Learned rules) |
| LD-126 | Premiere builds, exports and MCP revisions are allowed on the laptop A2000 GPU; everything else is pod-only. | EncountersStudio/CLAUDE.md (Learned rules) |
| LD-127 | Create captions and all on-screen text with Premiere's Text tool, not Motion Graphics templates. | PROJECT/CLAUDE.md (Learned rules) |
| LD-128 | Premiere MCP hard-won rules (condensed live-probed behaviour of the fixed fork); slip/slide/roll/ripple expressed in both tools. | RElearn/editing/02-premiere-mcp-hard-won.md; RElearn/editing/03-nle-concepts.md |
| LD-129 | Remotion to Premiere bridge: alpha ProRes in both directions, fps/frame math gotchas. | RElearn/editing/01-remotion-to-premiere.md |

### ffmpeg

| ID | Learning | Source |
|---|---|---|
| LD-130 | Pillarbox breaks measurement: a vertical source gives FALSE freeze/dark/mono; cropdetect, then measure inside the crop. | mem/pillarbox-breaks-video-measurement.md |
| LD-131 | ffmpeg drawtext font path: the drive colon ends the option; copy the font and pass it relative. | mem/ffmpeg-drawtext-windows-font-path.md |
| LD-132 | Bake SFX levels into files: one gained copy per palette item; kills the dB-15 trap and every clip-gain call. | mem/sfx-bake-levels-into-files.md |
| LD-133 | ffmpeg drops frames on VFR: headers still look right; count_frames both sides, never nb_frames. | mem/ffmpeg-silently-drops-frames-on-vfr.md |
| LD-134 | cropdetect one sample lies: sample inside the USED range; on dark footage trust the stable axis. | mem/cropdetect-sample-inside-the-used-range.md |
| LD-135 | Remotion bundled ffmpeg, adaptive silence detection and Mediabunny probing. | RElearn/notes/12-ffmpeg-silence.md |

### GPU/RunPod

| ID | Learning | Source |
|---|---|---|
| LD-136 | GPU first: every task runs on the pod GPU wherever a GPU path exists (NVDEC, CUDA filters, NVENC, Demucs, whisper), CPU only if the GPU path changes picture or sound; never accept 0% GPU on a heavy step without nvidia-smi. | EncountersStudio/CLAUDE.md (Learned rules) |
| LD-137 | Never use the laptop GPU (A2000) until told in chat, except Premiere builds/exports/MCP revisions and selected-clip revisions; 'use my GPU' in chat enables it for that task. | EncountersStudio/CLAUDE.md (Learned rules) |
| LD-138 | Cloud motion-graphics renders use GPU-only rendering and GPU storyboarding where possible, then deliver a viewable storyboard. | motion-design-studio-main/CLAUDE.md (Learned rules) |
| LD-139 | Run all heavy work on the RunPod pod by default; downloads, keys and Remotion stay on the laptop (cloud-first). | runpod-mcp/learnings/memory/cloud-first.md |
| LD-140 | Push every heavy pod step onto the L40S GPU (NVDEC, CUDA filters, NVENC, Demucs, whisper); CPU only where the GPU changes the picture. | runpod-mcp/learnings/memory/gpu-first.md |
| LD-141 | The heavy.lock hang came from a shot_qc multiprocessing Pool WinError 5 deadlock; the with_lock.sh watchdog prevents it. | runpod-mcp/learnings/memory/lock-watchdog.md |
| LD-142 | Never use the laptop GPU (A2000) at all until told in chat; wait for the pod instead. | runpod-mcp/learnings/memory/no-laptop-gpu.md |
| LD-143 | Run as many heavy pod jobs at once as the hardware handles without lowering quality; capacity measured once per hardware into cloud/capacity.json. | runpod-mcp/learnings/memory/pod-parallel.md |
| LD-144 | A zero-token minute-by-minute pod watcher (tools/cloud/pod_watch.py) is on; fixer agents are built but off. | runpod-mcp/learnings/memory/pod-watch.md |
| LD-145 | Run all commands yourself; never end a reply with a command for the owner to run. | runpod-mcp/learnings/memory/run-commands-myself.md |
| LD-146 | Video structure is intro, VCR card, cases, outro with plan.json first; step 4 also downloads every fetch[] asset and uploads it to the pod. | runpod-mcp/learnings/memory/running-order-plan-first.md |
| LD-147 | Studio runs on a RunPod volume (EU-NL-1) with an L40S pod; the gate failed once because raqm text layout broke; bootstrap and gate are done. | runpod-mcp/learnings/memory/runpod-cloud-setup.md |
| LD-148 | Goal: a 40-50 minute video built in about an hour; the bottleneck is the agent build loop, not the GPU. | runpod-mcp/learnings/memory/speed-goal.md |
| LD-149 | Minimum token use: context size is the bill, hooks enforce reads and size, agents are phase-split and fresh; contact sheets were 70% of tool output in the 2026-10-03 audit. | runpod-mcp/learnings/memory/token-hygiene.md |
| LD-150 | A 30-minute scheduled watchdog (tools/watchdog.py, task encounters-watchdog) with a safe-fix list; lessons in scout/watchdog/LESSONS.md. | runpod-mcp/learnings/memory/watchdog-agent.md |
| LD-151 | WM7 test 2 was built on the pod and delivered; animations redone in Remotion; all files deleted on the owner's word. | runpod-mcp/learnings/memory/wm7-test2.md |

### Voice

| ID | Learning | Source |
|---|---|---|
| LD-152 | Phantom transition: an unlisted Dip to Black can play the outgoing HANDLE; detect by frame means. | mem/premiere-phantom-transition-at-replacement.md |
| LD-153 | Conform narration mp3 to WAV: Premiere reads mp3s ~0.9% long. | mem/premiere-conform-narration-mp3-to-wav.md |
| LD-154 | Clause times, three time spaces: word timings are ORIG time, the timeline is SEQUENCE time. | mem/narration-clause-times-three-spaces.md |
| LD-155 | Placing raw clips clobbers narration: narration before add_tracks; audio-only needs audio_track_index. | mem/premiere-placing-raw-clips-clobbers-narration.md |
| LD-156 | faster-whisper CUDA: launch from PowerShell; Git Bash PATH and add_dll_directory both fail at encode(). | mem/faster-whisper-cuda-needs-powershell.md |
| LD-157 | Flatten narration to WAV: bounce the Phantom-chopped sequence to one WAV; select-all + remove_selected beats 400 nodeIds. | mem/premiere-flatten-narration-to-wav.md |
| LD-158 | Algrow is not OpenAI-compatible: use its own base URL constant https://api.algrow.online and never read ALGO_API_BASE_URL. | PROJECT/tools/algrow-voice/LEARNINGS.md (1) |
| LD-159 | An unknown voice id is accepted and only fails later, so resolve the voice through /api/voices/{provider} (exact id, then name) before submitting. | PROJECT/tools/algrow-voice/LEARNINGS.md (2) |
| LD-160 | Never send the API key to the CDN when downloading audio_url and transcript_url; never log the key or response bodies. | PROJECT/tools/algrow-voice/LEARNINGS.md (3-4) |
| LD-161 | Cut long scripts at sentence ends (3500 characters max per chunk), synthesise each, join into one 48 kHz mono WAV and shift each chunk's SRT times by the running duration. | PROJECT/tools/algrow-voice/LEARNINGS.md (5) |
| LD-162 | Retry connection errors, 429 and 5xx with exponential backoff honouring Retry-After (cap 60 s); fail 401/402/403 immediately. | PROJECT/tools/algrow-voice/LEARNINGS.md (6) |
| LD-163 | Use one requests.Session per thread when generating in parallel, and cache by (text, provider, model, voice). | PROJECT/tools/algrow-voice/LEARNINGS.md (7-8) |
| LD-164 | Jobs return a job_id; poll job-status every 2-3 s; completed gives an mp3 and a free word-level SRT; a 110-character line took 4.9 s. | PROJECT/tools/algrow-voice/LEARNINGS.md (API contract) |

### Assets

| ID | Learning | Source |
|---|---|---|
| LD-165 | Epidemic Sound MCP: account is LIVE via es-bridge/account-cli.mjs, not the MCP entry. | mem/epidemic-sound-mcp.md |
| LD-166 | Gemini image gen: *-image models are limit:0 on free tier; text models fine. | mem/gemini-image-gen-not-on-free-tier.md |
| LD-167 | yt-dlp: update first; never download in parallel, the bot check locks the IP. | mem/ytdlp-section-download-needs-hls-and-cookies.md |
| LD-168 | h-paper preset: Ayush's own paper/handwriting preset; edit in place, never rewrite whole files. | mem/hpaper-preset.md |
| LD-169 | Fetched assets go to Downloads: standing rule for the-assets output. | mem/fetched-assets-go-to-downloads.md |
| LD-170 | TikTok geo-blocked: every tiktok.com page 302s to /in/about from this IP; not an extractor bug. | mem/tiktok-geoblocked-from-this-ip.md |
| LD-171 | Cloudflare needs the Yreels profile: impersonation flags never work; the spotify-up Chrome profile clears it in 6s. | mem/cloudflare-needs-the-yreels-chrome-profile.md |
| LD-172 | Map animation: smooth & still: smoothed route, one colour, dot/labels in Cesium, camera on a pchip spline (per-segment easing = keyframe stops = shake). Skill: map-animation. | mem/map-animation-smooth-and-still.md |
| LD-173 | Gemini watch models: 2.5 retired (404), 3.x flash 503s under load; retry 3.6-flash on a 640px proxy at --fps 0.4. | mem/gemini-watch-model-availability.md |
| LD-174 | Thumbnails: edit the existing photo (ChatGPT for position and environment, Gemini to turn faces, blend the ghost in Photoshop) rather than generating from scratch. | Photoshop/CLAUDE.md (Learned rules) |

### Other

| ID | Learning | Source |
|---|---|---|
| LD-175 | spotify-up false alarms: the gdrive probe is stale and the 180s wait too short; neither failure is real. | mem/spotify-up-false-alarm-checks.md |
| LD-176 | RElearn Remotion KB: Remotion does graphics, Premiere keeps the cut. | mem/relearn-remotion-kb.md |
| LD-177 | RL-EDIT B-roll pass: RL-EDIT/PROCESS.md is the running method for filling black. | mem/rl-edit-broll-pass.md |
| LD-178 | Case 3's press is real: Armenia Colombia checks out on every name. | mem/case-three-press-is-real.md |
| LD-179 | Session handoff kit: .handoff/STATE.md is the baton; nightshift.ps1 resumes on limit reset. | mem/session-handoff-kit.md |
| LD-180 | Stealth cases 1-3 treatment: 38 shots placed; PROCESS.md pass 20 is the method. | mem/stealth-treatment-cases-1-3.md |
| LD-181 | Token advice that is wrong: screenshotting text, compacting for economy, switching model mid-session. | mem/token-advice-that-is-wrong.md |
| LD-182 | Stealth case 1 sound design: 9 tracks; add_tracks moved narration to index 5. | mem/stealth-case1-sound-design.md |
| LD-183 | Read-dedupe, shell-dedupe & peek: the Read hook missed shell cat; tools/peek/peek.py condenses before context. | mem/read-dedupe-and-size-hooks.md |
| LD-184 | Handoffs carry, not point: a baton that points at files costs ~30k tokens per pickup; paste the numbers, write what you saw as text. | mem/handoff-must-carry-not-point.md |
| LD-185 | Deleting a project: diff media against every .prproj; "exclusive" still includes shared libraries. Keep the method zip. | mem/deleting-a-project-audit-shared-media.md |
| LD-186 | WM Police sound pass: 139 clips, 6 cases; bake the level into the FILE, no clip-gain call at all. | mem/wm-police-sound-pass.md |
| LD-187 | Animation is HyperFrames (graphics/hyperframes), never Remotion (retired 2026-10-28); Remotion kept only to re-render old templates. | PROJECT/CLAUDE.md (Learned rules) |
| LD-188 | Remotion knowledge base (frames-not-time, interpolate/spring, Sequence/Series, captions, fonts, render flags, pitfalls) in 16 notes files. | RElearn/README.md; RElearn/notes/00-14 |
| LD-189 | Audio analysis is as important as visual analysis; the PVS audio department produces transcript, music analysis, SFX inventory, sync map and final audio QC report. | PROJECT/CLAUDE.md (Learned rules) |
| LD-190 | After exporting and checking a video, permanently delete the exported file to free disk; never mv a directory (a locked file half-moves it). | PROJECT/CLAUDE.md (Learned rules) |
| LD-191 | Run commands directly without asking permission first; cleanup only through tools/trash.py with a manifest, owner purges. | EncountersStudio/CLAUDE.md; Photoshop/CLAUDE.md |
| LD-192 | Cloud job regressions (gate scope, detached gate, Windows lock retry) and sync.py down resurrecting trashed files are documented in .claude/rules/cloud-jobs.md. | EncountersStudio/CLAUDE.md |
| LD-193 | Motion-design studio UI uses a dark Premiere-style theme with orange accents and Premiere-like timeline colours. | motion-design-studio-main/CLAUDE.md (Learned rules) |
| LD-194 | Loop and stop clip playback with requestVideoFrameCallback, not timeupdate, so a clip never shows frames of the next one; stored sf_in/sf_out are frame-exact. | STYLE guide/CLAUDE.md (Lessons, Learned rules) |
| LD-195 | Apply the same exact-frame cut and loop-edge handling to every reference clip (hover preview and big player). | STYLE guide/CLAUDE.md (Lessons, Learned rules) |
| LD-196 | run_claude must report the JSON result and a login hint; the 'claude exited 1' failure was an expired CLI login. | STYLE guide/CLAUDE.md (Lessons, Learned rules) |
| LD-197 | Ref board performance: cacheable ETag posters, cull to the view and lazy poster src, coalesce view changes per frame, WebGL (PixiJS) layer, particle buckets of 2048, grid insert diffs old/new cells, hit-test user links first, minimap built in 4 ms slices. | STYLE guide/CLAUDE.md (Lessons, Learned rules) |
