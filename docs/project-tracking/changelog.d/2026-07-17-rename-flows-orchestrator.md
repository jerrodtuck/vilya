# Rename Flows → Orchestrator: route, nav, links

The orchestrator surface now says what it is (#134, epic #132 Fork A → option 2).
The route moved from `/flows` to `/orchestrator` with a permanent (308) redirect
in `next.config.mjs` so external links keep working; the nav label reads
**Orchestrator** in the same slot; the page h1 was already "You are the
orchestrator" and is unchanged.

The feature slice moved with it — `features/flows/` → `features/orchestrator/`,
`flows-view.tsx` → `orchestrator-view.tsx` (`OrchestratorView`). `FlowsMap` and
the data modules keep their names: #133 owns that refactor, and "flow" remains
the domain term for the map's selectable paths. All five internal-link files
were swept (overview, board-strip — prop renamed `flowsHref` →
`orchestratorHref` — night-shift view + agent map, setup), plus the layout
metadata description and the post-build scan's route comment.
