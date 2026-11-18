# HCE style ("evidence file", Winter Camping Encounters)

Use this only when the user picks HCE. Nocturn is the default. Templates: `graphics/templates/src/case/hce/` (shared chrome in
`Base.tsx`).

## Look
- Cards are evidence files laid over the case's own still or channel screenshot. They use halftone and paper texture,
  crop marks, prints, mono data blocks and one muted accent.
- Never use rings, boxed tags, or centred text on bare black.
- Red signal colour is #B5483D. Use amber only for fire or lantern light.
- Type: Roboto Condensed 600 for titles (56-72 px), body text at least 30 px, JetBrains Mono for data (at least 22 px).
  Text shadow: `0 2px 14px rgba(0,0,0,.75)`.
- Safe area: 96 px left and right, 64 px top. Keep everything below y = 920 free for captions.
- Maps have no lower third. They are centred, open already zoomed in with a slow push, and show the place in red with
  its name above it on a pointer.
- Audio-trace card: a red waveform only (no box, no text) on a darker plate, at most 3 s, measured from the real audio.

## Motion grammar (frames at 30 fps, eased with `motion.ts`)
- Card fade: 18-24 f, `ease.ui`. Type rise: 36-45 f, `ease.measured`. Marker: 24-30 f.
- Lines draw at their length / 450 px per second (minimum 36 f, maximum 90 f). Stagger: 15-24 f.
- Camera moves 1.00 to 1.04 (maps 1.06) on sine.
- Hold at least max(60 f, words x 0.33 s x 2).
- The key element lands 6 f before its word. The card starts 0.5-1.5 s ahead of the word.
- Minimum lengths: map 240 (ideally 300-420), audio trace 90 f at most, case card 135,
  channel plate 120.
