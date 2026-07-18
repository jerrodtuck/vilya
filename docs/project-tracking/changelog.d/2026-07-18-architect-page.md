# Architect page: flow map + prompt library

The Architect role now has its own first-class page at `/architect` (#133,
epic #132 Fork B → option 2), mirroring the orchestrator page's shape:
header → BoardStrip → interactive map → prompt library → aside slot. Nodes
and flows follow the epic's content model exactly — ARCH · RECALL · SURVEY ·
RESEARCH · FORK · ADR · SPEC · EPIC · HANDOFF, with six flows (Everything ·
Shape an epic · Make a call · Survey as-built vs intended · Deep research ·
Handoff). The aside slot carries an initial cardinality summary (one
architect, N repos; one orchestrator, one repo) per Fork C's decision — #135
fills it in further.

**Shared component, not a duplicate slice.** `features/orchestrator/flows-map.tsx`
was generalized into a props-driven `FlowMap` at `src/shared/ui/flow-map.tsx`
— nodes, flows, geometry, prompts, and the default drawer all come in as
props from the caller's own data modules. It's placed in `shared/ui`
alongside `BoardStrip`, the repo's existing home for cross-page chrome.
`PromptList` and `CopyButton` moved there too, since both pages need them
unchanged. The orchestrator page keeps working identically through its own
`features/orchestrator/data.ts` + `map-geometry.ts` + `prompts.ts` — only the
map/prompt-list/copy-button *rendering* moved, not their content.

**The Product Architect standing-orders card moved** — not copied — from the
orchestrator prompt library (`features/orchestrator/prompts.ts`) to the
architect page's own library (`features/architect/prompts.ts`), byte-identical.
The orchestrator library keeps its "pick one card" menu intro line for its
remaining cards.

**Nav**: "Architect" now sits immediately before "Orchestrator"
(`src/app/site-nav.tsx`); no other reordering (that's #135).

Along the way: fixed a real dev-mode React warning surfaced by the refactor
— a JSX element authored in a server component and handed across the RSC
boundary into a multi-child slot needs an explicit key even outside a
literal list, which `FlowMap`'s `aside` prop now carries.
