# Knowledge (all projects finalized; last-moments 2026-11-27)

Everything learned from every project done so far. Project media, builds and refs were deleted; this stays.
Read the LEARN files first (distilled, each bullet has its source). Open `notes/` only to check a source.
These are notes, not rules: style rule book, SOPs and playbook win; SOP §2.4 bans override any device named here.
`notes/` stays on the PC (excluded from the public sync: it holds scraped pages and third-party emails).

## Which file for which job
| Job | Read |
|---|---|
| Farrell / Nocturn / Abyssal video | `LEARN_style_studies.md` (your style's section only) + `LEARN_finished_videos*.md` |
| 2 h or long compilation, gx/coc engine, farm problems | `LEARN_coc2h_vol1.md` + `coc2h-vol1_TIMELINE.md` + `LEARN_last_moments.md` |
| Old Heritage / Iceberg video | `LEARN_old_heritage.md` |
| Audio, captions/.srt, licence, privacy, delivery | `LEARN_finished_videos*.md` |

Words: gx/coc = HyperFrames engine + its case files; OHF = Old Heritage Files; K = main knowledge base (CLAUDE.md);
farm = GitHub render machines (`tools/case-farm`); Final Phase Lite = the live preview (`tools/case-build/preview.sh`).

| File | What |
|---|---|
| `LEARN_style_studies.md` | Farrell / Nocturn / Abyssal ref studies: gaps not in the style rule books (audio measurements, pacing, labels). Note: SFX-scarcity finding conflicts with Farrell rule 55: ask owner before changing. |
| `LEARN_finished_videos.md` + `_2.md` | van, winter, gx-dashcam20/s10/t10, abyssal-01, all old handoffs: owner feedback, audio numbers, captions/srt method, licence/privacy, farm bugs + root causes, measured times. |
| `LEARN_coc2h_vol1.md` | 2 h compilation: loudness targets, devices, farm failures, speed, case templates. |
| `LEARN_last_moments.md` | last-moments (21 cases, 2 h 17, Abyssal look): owner rules, 20-case builder template, local GPU render, privacy QC on rendered frames, final-extras script. |
| `LEARN_old_heritage.md` | Old Heritage / Iceberg episodes: owner rejections, SFX/music dB, grading, kit vs dead tools. |
| `coc2h-vol1_TIMELINE.md` | Measured times of the 2 h video (base for `docs/workflow/FAST_LONG_VIDEO.md`). |
| `notes/` | Raw copy of every .md/.txt/.sh/.py note from the deleted folders (same paths as before). |

Kept code from projects: case templates `styleguide/gx-admixdd/hf-engine/cases/coc_{intro,case09,case05,case08,case25}.mjs`,
`tools/case-build/master_loudness.sh`, farm recovery kit `tools/case-build/recovery/`.
Not yet merged into the style rule books: do that per style when the owner next works in it (same-day feedback loop).
Open owner question: Farrell rule 55/63 (SFX on every cut, -13 LUFS) vs study (0.12 SFX/min) vs SOP -16 LUFS.
