# Decisions

Append-only ADR log — newest at top, `## YYYY-MM-DD — Title`. Grep by topic or issue #; captured via /adr.

## 2026-07-18 — Architect flow epic (#132): orchestrator route, shared FlowMap, cardinality story, serial dispatch

**Decision:** All three fork recommendations approved as stated, plus a sequencing amendment: rename `/flows` → `/orchestrator` with a permanent redirect (Fork A → 2), generalize `FlowsMap` into a props-driven shared component (Fork B → 2), cardinality statement + diagram on home with the full why on the Architect page's aside (Fork C → 2), and dispatch the sub-issues serially **#134 → #133 → #135** (decided by the operator, 2026-07-18).

**Options considered:**
- **Fork A — orchestrator page URL:** (1) keep `/flows`, relabel nav only — cost: permanent URL/content mismatch; (2) **rename route to `/orchestrator` + permanent `/flows → /orchestrator` redirect — cost: one redirect entry + internal-link fixes ← chosen**; (3) `/flows` as a role index page — cost: an extra page nobody asked for, deeper URLs.
- **Fork B — Architect page map:** (1) duplicate the flows slice into `features/architect/` — cost: two hand-authored SVG geometries to maintain forever; (2) **generalize `FlowsMap` to take nodes/flows/geometry/prompts as props (one shared component, two data modules) — cost: one refactor touching the existing page ← chosen**; (3) static diagram — cost: cheapest, but breaks role-page parity.
- **Fork C — cardinality illustration placement:** (1) home only — cost: Architect page misses the full why; (2) **statement + small diagram on home, full explanation on the Architect page's aside slot — cost: two touch points ← chosen**; (3) Architect page only — cost: home fails to represent the new flow.
- **Sequencing:** the epic proposed "B and C independent of A"; amended to serial **#134 → #133 → #135** — cost: no parallel dispatch for this epic.

**Why:** A2 makes the URL say what the page is while external links keep working; the orchestrator's fact-check corrected the internal-link estimate from three files to **five** (`setup-view.tsx`, `shared/ui/board-strip.tsx`, `overview-view.tsx`, `night-shift-view.tsx`, `night-agent-map.tsx`). B2 rides an existing seam — `flows-map.tsx` already read everything from modules — so one refactor halves future maintenance versus two hand-authored geometries. C2 mirrors the orchestrator page's aside structure (same slot as orchestrator-modes), keeping the two role pages parallel. Serial sequencing: all three sub-issues touch `site-nav.tsx`, and #135's home cards need `/architect` (exists only after #133) and the renamed orchestrator route (settled by #134) — serial dispatch avoids three-way nav rebases.

**Consequences:** Shipped in the decided order as PRs #137 (`f8fc042`), #138 (`ebc34f8`), #139 (`ec4b10f`), all merged 2026-07-18; `/flows` now 308-redirects permanently. `FlowMap`/`PromptList`/`CopyButton` live in `shared/ui` — future role pages reuse them instead of duplicating. Post-merge visual smoke is owed (tracked in a dedicated Verifying issue), and a scan-widening follow-up was filed from #135's smoke (the whitespace-swallowing bug class extends beyond `</code>` to other inline tags).

**Evidence:** #132 body (fork options + costs, as-built survey 2026-07-17) and its decision comment (2026-07-18); epic-complete comment on #132 (PR outcomes, gate results); commits `f8fc042`/`ebc34f8`/`ec4b10f`. Precedent: the one-orchestrator-per-repo rationale behind Fork C rests on the documented cross-edit collision rule (canon `GITHUB-PROJECTS.md` shared-files table) — no dated prior entries existed; this is DECISIONS.md's first entry.
