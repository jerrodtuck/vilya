# Home: role-first restructure + cardinality illustration

Home now teaches the role split explicitly (#135, epic #132 §3, Fork C →
option 2). Nav order (Overview · Architect · Orchestrator · …) was already
correct from #133/#134 — verified, no change needed. Card order now reads
**Architect → Orchestrator → Skills → Setup → Night shift**, with a new
Architect card ("Open the architect map →" → `/architect`) leading the grid.
The lead paragraph now names both roles instead of just "the orchestrator".

**Role strip** above the daytime chain — `Architect (direction: issues · ADRs
· specs) → Orchestrator (dispatch: chips · board · merges) → the chain` —
using the site's existing pill-and-arrow idiom (`.chipstrip`/`.lchip`), with
a two-line `.rolechip` variant so each role carries its blurb.

**Cardinality illustration (Fork C → option 2)** — a short statement plus a
static SVG diagram: one Architect node fanning out over three repo columns
(plus a faded "more repos" column signaling *N*), each running its own
Orchestrator → chips → PRs. New `features/overview/cardinality-diagram.tsx`
(`CardinalityDiagram`) keeps `overview-view.tsx` a clean page composition —
mirrors the existing `BoardStrip` split of a self-contained chrome piece out
of the page. The diagram reuses the flow map's node/edge visual idiom
(`.nbox`/`.ntitle`/`.nrole`/`.elabel`/`.edge`) without pulling in `FlowMap`
itself, since nothing here is interactive. Its own `.card-diagram` scroll
container (new CSS, `globals.css`) keeps it from ever forcing body
horizontal scroll on narrow viewports — verified no `document.body`
h-overflow at 375px on both `/` and `/architect`.

Per Fork C, home's version stays short; the full why (state-collision +
coherence arguments) was extended on the Architect page's aside
(`features/architect/architect-view.tsx`), the same slot the orchestrator
page uses for its "Orchestrator modes" panel.

**Bug found and fixed along the way**: an inline `<i>` tag with plain text on
either side rendered with its trailing space silently dropped in two spots on
the Architect aside (`<i>is</i>the`, `<i>across</i>products`) — not a source
whitespace mistake (confirmed byte-for-byte), but the same class of jammed-
span issue the post-build scan already guards against for `<code>`. Fixed
with the repo's established `{" "}` idiom; the scan itself only checks
`<code>` spans so this one had to be caught by hand.
