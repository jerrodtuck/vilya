# Decisions

Append-only ADR log — newest at top, `## YYYY-MM-DD — Title`. Grep by topic or issue #; captured via /adr.

## 2026-07-18 — Crucible variants: narrow the shared-core claim to core prompt + severity contract; stack-adapt the straggler examples (#175)

**Decision:** Option A — adapt crucible-fastapi's and crucible-ml's SOLID / structural-non-negotiables **examples** to their own stacks (rules unchanged — the same move crucible-blazor and crucible-django already embody), adapt crucible-fastapi's brownfield examples to FastAPI flavor, and write all five variant headers to state the precise, hash-verifiable claim: **byte-identical core = the core prompt + the severity/reporting contract**; four stack-tuned pieces = the two stack sections, the SOLID/non-negotiables examples, and the brownfield clause's examples (decided by the operator, 2026-07-18).

**Options considered:**
1. **A — stack-adapt the stragglers; narrow the identity claim** — cost: touches method-block content in fastapi/ml (rules unchanged, examples re-flavored) ← chosen
2. B — neutralize: rewrite SOLID + non-negotiables in all five to stack-neutral, byte-identical text so the issue's dictated "three varying sections" header becomes true — cost: deletes blazor's and django's deliberate stack-tuned examples (built that way in their own PRs), touches all five method cores — largest blast radius, loses teaching value.
3. C — minimal: fastapi brownfield fix + follow-up issue for the fastapi/ml SOLID debris — cost: the header description stays false for fastapi/ml until the follow-up lands; the epic-closer truthfulness sweep ships knowingly incomplete.

**Why:** the fork comment's hash table (issue #175, 2026-07-18) showed the issue's premise was false: only the core prompt (`e91f1535`) and the severity/reporting contract (`707d8a67`) are byte-identical across the five shipped variants — SOLID and structural non-negotiables were already three-way stack-adapted, with fastapi and ml carrying unadapted **React** examples inside Python skills ("`as any`", "valid props", one-implementation *hooks*). A is the same fix class as the issue's own item 2, completes the truthfulness sweep in one pass, and every header claim it writes is verifiable by section-extraction hash. B and C rejected: B deletes deliberate stack-tuning, C ships a knowingly false header.

**Consequences:** every variant header's identity claim is hash-verifiable; the "shared method core" contract is now precisely defined as **core prompt + severity/reporting contract**; the byte-identity acceptance gate for crucible PRs covers exactly those two subsections; future variants must adapt the SOLID/non-negotiables examples and the brownfield examples on creation, never inherit another stack's text.

**Evidence:** #175 (fork comment with hash table, 2026-07-18 18:14; operator decision comment, 2026-07-18); orchestrator scope-sync comment on #175 widening item 1 to all five variants; parent epic #160; shipped variants at `83ec04f` (#166 crucible-nextjs, #170 crucible-ml, #173 crucible-django, #174 crucible-fastapi).

## 2026-07-18 — Architect cardinality: one architect per product board; one orchestrator per repo (#148)

**Decision:** One architect seat per **product board**, spanning that product's repos and no other product's; exactly one orchestrator per **repo**. The "one architect, all repos" rule shipped by the #132/#133/#135 copy is overruled (decided by the operator in the architect session, 2026-07-18).

**Options considered:**
1. One global architect across all products (the shipped copy) — cost: direction context is deep and product-local, and the architect's own working state (VISION, DECISIONS, specs, the board) is repo/board-local — the same state-locality argument that pins the orchestrator to one repo.
2. **One architect per product board, spanning that product's repos** — cost: a copy fix across the site plus this entry; preserves #132's original "spans multiple repos" intent (a product may span repos) while fixing the overreach ← chosen
3. Per-repo architect — cost: fragments direction within a product, the one thing the seat exists to keep whole.

**Why:** The original rule conflated process coherence across products (Vilya-the-system's job — canon + skills) with direction coherence (product-local). Live evidence: `architect-anduin` runs correctly as a separate product's seat. Partially supersedes `2026-07-18 — Architect flow epic (#132)`: its Fork C deliverables (home cardinality panel + Architect-page aside) shipped the overreaching copy this decision corrects.

**Consequences:** Site copy fix on the #148 branch (Architect aside, home cardinality diagram + lead, Product Architect card ¶1, cardinality sentence appended to both orchestrator role cards); VISION.md v2 (#142) already carries the corrected rule — v2 landed, not v1; this entry rides the fix branch per one-writer.

**Evidence:** #148 issue body (the ADR mirror, issue-first — recorded there by the operator before this append, so no re-mirror comment) and its two authored-copy comments; VISION v2 via PR #149 (`e609489`); overruled copy via PRs #138 (`ebc34f8`) / #139 (`ec4b10f`).

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
