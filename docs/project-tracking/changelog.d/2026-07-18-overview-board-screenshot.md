# Overview board card: real GitHub board screenshot + coherent link story

The Overview's board card (`02 · board`) now shows **the real vilya board as
GitHub renders it** (#185): the operator-provided screenshot ships at
`public/board-example.png` and renders as an always-visible on-page figure
inside the card — `next/image` (sharp is available at runtime, so delivery is
optimized), responsive `width: 100%`, real alt text, and a short caption.
Staleness is operator-accepted: the figure's job is showing what the board
looks like in the GitHub interface, not today's item counts, so no
capture-date is carried.

The dangling **"see it light up on Orchestrator"** header link is gone — the
board never lit up anywhere; the orchestrator map lights flows. The header now
tells a coherent two-link story against the newer mover-map section (#171):
**"see who moves each column ↓"** (anchors to the mover map, new `#movers`
id + `scroll-margin-top` for the sticky nav) and **"the flows that drive it →
Orchestrator"**.

Kept prop-driven so non-Overview usages are untouched: `BoardStrip` gains
optional `moversHref` and `figure` props alongside the existing
`orchestratorHref`; the figure itself lives in the overview slice
(`features/overview/board-screenshot.tsx`). Architect and Orchestrator pages
render the strip bare, exactly as before.
