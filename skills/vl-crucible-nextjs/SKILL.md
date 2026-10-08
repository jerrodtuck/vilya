---
name: vl-crucible-nextjs
description: Unusually strict, refactor-oriented code-quality review for Next.js / React / TypeScript projects — vertical-slice (feature-folder) architecture, outcome-oriented SOLID, structural simplification, server/client-boundary and RSC guidance. Use for PR review, "crucible", or when enforcing feature-slice structure on a Next.js repo. Install one crucible variant per repo, matched to its stack (sibling: vl-crucible-blazor).
codex-support: "shared-compatible"
codex-notes: "Unchanged nextjs architecture, quality and remediation contract; read and apply directly."
codex-invocation: "$vl-crucible-nextjs"
codex-prerequisites: "Matching stack source/diff and test toolchain; review authority does not grant implementation or merge authority."
---

# Crucible Code Quality Review — Next.js / React

## Shared communication

Read and apply the full [vl-adhd writing policy](../vl-adhd/SKILL.md) and
[vl-present presentation contract](../vl-present/SKILL.md) at entry. On Codex use
`$vl-adhd` / `$vl-present` when discovered; on Claude Code or Cursor use their
supported `/vl-adhd` / `/vl-present` invocation, or explicitly read/apply these
resolved sources. Identify an unknown host before choosing syntax. Apply them to
all authored prose, including complete briefs, ADRs, specs and PR evidence.
Preserve facts, uncertainty, options/costs, permissions and stop/verification gates.
Explicit formats and fixed output contracts win; presentation grants no new authority.


## Codex invocation

Use $vl-crucible-nextjs when discovered, or explicitly read and apply this SKILL.md.
Slash examples below name companion skills; in Codex use their $vl-* invocation
or read/apply source. This does not activate another seat or expand authority.
The shared procedure and quality bar below apply unchanged.

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **Next.js / React instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for Next.js* and *React / RSC UI layer* — the
examples in the SOLID and structural-non-negotiables rules, and the brownfield clause's examples
(the rules are shared everywhere; the examples speak this stack's language). Siblings:
`vl-crucible-blazor`, `vl-crucible-fastapi`, `vl-crucible-django`, `vl-crucible-ml`.

**Method lineage:** the crucible method is inspired by Cursor's "thermonuclear code review" prompt.

---

## The crucible method (shared across every stack variant)

### Core prompt

> Deep code-quality audit of the current branch's changes.
> Rethink structure to improve quality without changing behavior.
> Improve abstractions and modularity; reduce spaghetti; improve succinctness.
> Prefer deleting complexity over rearranging it. **For every problem, propose the refactor.**

### How to report — severity, then the refactor

Do not emit a verdict. Emit **findings**, each tagged by severity and each carrying a concrete fix:

- 🔴 **Blocker** — structural / VSA regression, or a boundary / type-contract break. Merge waits.
- 🟠 **Should-fix** — a visible dramatic simplification was missed, or spaghetti / branching grew.
- 🟡 **Consider** — UI-layer guidance, modularity, legibility. Non-blocking; author's call.

Each finding carries: **where** (file:line) · **the smell** · **why it costs later** · **the
refactor** (the code-judo move — ideally deleting a branch/helper/mode rather than relocating it).

Close with a **merge-readiness signal** — `Ready` · `Ready after blockers` · `Needs rework` — and
the **top 1–3 refactors by leverage** (biggest complexity delete first). The deliverable is the
*direction of the refactor*, not a stamp.

### SOLID — outcome-oriented (reinforces VSA, does not fight it)

Judge SOLID by outcomes, not ceremony. Do **not** reward wrappers or one-implementation abstractions
for their own sake — that collides with the anti-wrapper rule. Real SOLID reduces reasons-to-change
and isolates what varies; fake SOLID just adds indirection.

- **SRP** — one reason to change. A module doing data-fetching *and* rendering *and* mapping is the
  smell; split along the seam, keep the pieces in the feature slice.
- **OCP** — new cases arrive as new slices / handlers / strategies, not new `switch` arms grafted
  onto a shared function.
- **LSP** — a component/function must honor its contract; a variant that throws on valid props or
  narrows an accepted type is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (data source,
  external APIs, transport), not everywhere. A hook or interface with one implementation and no seam
  of change is not DIP — it's indirection. Abstract the boundary; call concrete code inside the slice.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~400 to over ~400 lines without a strong reason — decompose first.
   (React files bloat faster; the line is lower than a C# file's ~1k.)
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / one-implementation hooks** that add indirection without clarity are a smell.
6. **`as any` / `as unknown as` / silent `catch`-and-default** papering over an unclear boundary is a smell.

---

## VSA for Next.js — presumptive 🔴 blockers (stack-specific)

Blockers unless the author justifies clearly:

1. **Feature logic outside its slice, or import flow against the grain** — imports run one way:
   `shared → features → app`. A feature owns `features/<slice>/` (UI, server actions / route
   handlers, data access). `app/` stays **thin** — routing concerns only (`page` / `layout` /
   `loading` / `error`) composing from features; features never import from `app/`. Do not grow
   app-wide `components/` / `services/` / `utils/` dumping grounds for feature logic.
   (Existing route-group colocation in a brownfield repo: 🟡 migration candidate, not 🔴.)
   A generic **design-system layer** (`components/ui`, shadcn-style primitives) is legitimate
   app-wide code — the dumping-ground rule applies to *feature-specific* components only.
2. **Cross-feature imports** — one feature reaching into another's internals is forbidden. First
   resolution: **compose the two features at the app/route level**; lift into `shared`/`lib` only
   when the piece is genuinely feature-agnostic — premature lifting is its own smell. Prefer
   **direct file imports policed by lint boundaries** over barrel `index.ts` files (barrels cost
   tree-shaking, especially in Next.js).
3. **Feature logic in the shared kernel** — `shared/` / `lib/` holds framework-agnostic primitives,
   contracts, and pure utilities only. No feature business rules, no data fetching for a feature there.
4. **Server/client boundary break** — server-only code (secrets, DB clients, `server-only` modules,
   `process.env` secrets) imported into a client component. This is a 🔴 security boundary, not style.
5. **Cross-cutting concern welded into a component** — auth, logging, rate-limiting, external IO
   belongs in middleware / a server action / a dedicated module, not inlined into JSX or a handler.
6. **Ad-hoc branching** bolted onto an unrelated flow instead of a dedicated policy / handler / slice.
7. **Boundary rules unenforced** — the no-cross-feature and unidirectional rules are lintable
   (`import/no-restricted-paths`; `enforce-module-boundaries` in Nx). A violation a lint rule
   would have caught is two findings: the violation, and 🟠 "add the boundary rules to the repo".

---

## React / RSC UI layer — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions for the UI layer. Escalate one to 🔴 only when it breaks the
server/client or data boundary (then it's a blocker *on those grounds*, not on React style):

- Business logic living in JSX or a fat component body instead of a hook / server action / handler
  the component calls.
- A client component fetching data directly (in `useEffect`) that should be a **server component**
  or **server action** — creating request waterfalls or leaking data access to the client.
- `"use client"` pushed too high in the tree (over-clienting) — pull it down to the leaf that needs
  interactivity so the rest stays RSC.
- `useEffect` used for derived state or data fetching that belongs in render / a server component.
- Oversized components — one file owning many responsibilities; extract children or hooks.
- Prop drilling or over-broad Context where a composition or a colocated slice would do.
- Missing effect cleanup (subscriptions, timers, listeners) → leaks.
- `useMemo` / `useCallback` cargo-culted without a measured re-render problem (the identity-abstraction
  analog); or unstable inline objects/functions causing real re-render churn.
- Missing/`index`-based `key` props on lists; uncontrolled→controlled input flips.
- Validation placed ad hoc in components rather than a schema (e.g. a shared Zod model) at the boundary.
- **State in the wrong bucket** — classify: component / app (Context, Zustand) / server-cache
  (React Query, SWR) / form / URL. Legitimately-client-side data belongs in a query library —
  never a manual `useEffect`+`useState` cache; filters, tabs, and pagination belong in **URL
  state**, not component state.
- **Ad-hoc API calls** — one configured client in `lib/`, per-feature `api/` modules declaring
  typed requests. Raw `fetch` scattered in components is a finding; where the repo ships a
  generated typed client (e.g. OpenAPI→TS), raw `fetch` against its endpoints is 🟠.
- **Missing error/loading boundaries** — routes lacking `error.tsx` / `loading.tsx` / Suspense
  at reasonable granularity; API layer lacking a shared error interceptor.
- Tests live in the feature (colocated with what they test), not a parallel `__tests__/` tree mirror.

---

## Brownfield clause — repos mid-migration to feature slices

In a repo that did **not** start sliced (flat `components/`+`pages/`, or Pages Router being moved to
App Router) and is being migrated incrementally:

- The VSA blockers above apply to **new and modified features only**. Judge the diff, not the repo.
- **Pre-existing flat/legacy code is legacy, not a regression** — flag it 🟡 as a *migration
  candidate* ("this touched `components/OrderTable.tsx`; when you next own this, pull it into an
  `orders` feature"), never 🔴.
- The one hard rule that still bites: if the PR **grows** the legacy dumping ground for a *new*
  feature (adds a new file to app-wide `components/` / `services/` for new work), that's a 🔴 —
  new work goes in a slice even while the old core is still flat.
- The server/client boundary blocker (secrets to the client) is **never** downgraded, brownfield or not.
- Migration itself should be tracked as an Epic + per-slice sub-issues, not smuggled into feature PRs.

---

## Database/schema migrations — conditional review

Limit this review to touched schema, migration/history and database-affecting
deployment paths. Record applicability and evidence; Next.js does not imply Drizzle.
Read **Migration tool**, **Migration command** and **Migration status** from the
product's `docs/project-tracking/GITHUB-PROJECTS.md`. Inspect its actual repo policy,
scripts, installed framework version, relevant schema/history and owning issue evidence.
Blank means unknown; a proposed command is not a verified runner.

- **Verified no application database:** report not applicable with the evidence.
  Explicit `none` / explained `n/a` records that decision; do not infer it from blanks.
- **Database present, unrelated UI/docs diff:** explain why no database-affecting path
  changed. Missing optional migration fields do not globally block unrelated acceptance.
- **Relevant Drizzle change:** require committed generated/custom SQL and the journal,
  snapshots and other metadata required by the installed version. Verify the configured
  application runner and preserve immutable applied history; subsequent changes belong
  in a new migration, not a rewrite of applied SQL or metadata.
- **Relevant other-framework change:** inspect that configured framework's conventions,
  required artifacts/history and actual runner. Do not demand Drizzle artifacts or an ORM
  replacement. Apply the repo's existing safety policy to the affected change.
- **Relevant change with missing, conflicting or pending settings/evidence:** keep the
  affected gate unresolved and unready. Inspect actual sources and the real owning
  runner/baseline follow-up; never invent `none`, a runner or readiness to pass review.

Read the existing [database migration policy](https://github.com/jerrodtuck/vilya/blob/master/docs/project-tracking/GITHUB-PROJECTS.md#database-migrations)
and applicable product evidence for baseline, target, backup integrity, restoration,
restored-state upgrade/reapplication checks and recovery. Do not duplicate or relax
those procedures. Unsafe history bypass, missing required artifacts, changed applied
history, production push/ad hoc migration SQL, or unsatisfied applicable baseline,
target/backup/restore safety proof are **Blockers** on affected acceptance. Name the
concrete fix: add the missing reviewed artifacts/runner/evidence, restore immutable
history and use a new migration, or complete the owning baseline/safety follow-up.
Report findings under the existing severity/refactor shape. Review neither executes
migrations nor grants database/production execution authority.

---
## Component baseline — review the repo policy

Apply this check to actual UI: components, rendered templates, dashboards and their
primitives. For backend-only or ML-only changes, report **not applicable — no UI
changed**; do not impose a UI library or approval gate on unrelated code.

1. Read **Component baseline** and **Custom component policy** in the repo's
   `docs/project-tracking/GITHUB-PROJECTS.md`, then the referenced local rules and
   approval records. Blank/missing means **unknown**, not `none` or `n/a`: report the
   missing config and resolve it before accepting affected custom primitives.
   Explicit `none` means no configured library, not permission to ignore another
   recorded repo policy. Explicit `n/a` must explain why no special approval gate
   applies; ordinary architecture and quality review still apply.
2. Inspect the configured library/design system, location and constraints. Compare
   new or touched custom primitives with its available equivalents before accepting
   them. Absence from the checkout is not proof the library lacks a primitive:
   check the applicable catalog/version, or label that claim unverified. Flag
   duplication and policy violations under the existing severity contract, with a
   concrete refactor to the baseline primitive or a scoped policy resolution.
3. Distinguish **baseline primitives** from **feature composition/wrappers**. Follow
   the repo's declared boundary; ordinary feature composition is not automatically
   a prohibited custom primitive. Enforce a broader ban only when recorded by that
   repo. A materially ambiguous boundary is a bounded fork on the owning product
   issue, not permission to invent a global rule.
4. Where the repo requires operator approval, **missing qualifying approval blocks
   the affected custom primitive**. Cite explicit, attributable operator approval
   scoped to the repo/component or bounded approved set, durably recorded on the
   owning issue/PR or named repo record (for example `AGENTS.md` / `CLAUDE.md`).
   Human chat approval needs a durable record with provenance before acceptance.
   An agent proposal, vague “approved” claim, peer relay without source or a merge
   alone is not approval. Grandfathered sets qualify only within recorded scope.
   Vilya does not impose approval on repos whose policy does not require it.

Report applicability, config/approval evidence and the concrete refactor with the
findings. A chip-brief reminder supplements this review; it never replaces it.
**Acceptance case:** in a repo configured for shadcn, hand-rolled `breadcrumb.tsx`
and `skeleton.tsx` must trigger an equivalent-primitive check. If the applicable
catalog provides them, flag duplication; under a recorded approval-required policy,
unapproved replacements block. For a no-UI change with explicit `none` / explained
`n/a`, report the UI check not applicable while retaining normal review.

---

## Primary review questions

- Is there a code-judo move that deletes a whole *category* of complexity?
- Does this belong in an existing feature slice, or does it genuinely need a new one?
- Did a feature import another feature's internals?
- Did server-only code (secrets, DB) cross into a client component?
- Is this `"use client"` wider than it needs to be?
- Is data being fetched on the client when it could be an RSC / server action?
- Did the shared kernel grow feature logic?
- Is any "abstraction" here just a one-implementation hook with no seam of change?

## Output order

1. 🔴 Server/client boundary & security breaks
2. 🔴 Structural regressions / VSA violations (new & modified code)
3. 🟠 Missed dramatic simplification
4. 🟠 Spaghetti / branching growth
5. 🔴/🟠 Type-contract problems (`as any`, unsafe casts)
6. 🟠 File-size / decomposition
7. 🟡 React / RSC UI-layer guidance
8. 🟡 Legacy migration candidates (brownfield repos)
9. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- server-only code reachable from a client component (secrets/DB leak)
- a clear structural / VSA regression in new or modified code
- a cross-feature internal import
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- feature logic in the shared kernel
- **new** feature logic added to the legacy flat core instead of a slice

Good phrases:

- `this belongs in the <feature> slice, not app-wide components/`
- `don't import <feature>'s internals — compose the two features at the route level (or lift a truly shared piece into shared/)`
- `these boundary rules belong in lint (import/no-restricted-paths) — add them so review stops catching this`
- `server-only: this leaks <secret/DB> into a client component — move it to a server action`
- `"use client" is too high — push it to the leaf that needs it and keep the rest RSC`
- `this useEffect fetch should be a server component — it's creating a waterfall`
- `code-judo: can these branches collapse behind one handler/policy?`
- `this hook has one impl and no seam of change — inline it inside the slice`
- `legacy flat code — not blocking, but a migration candidate when you next own this feature`

## New-model recalibration

Apply this section only when the operator asks about a newly released model or a
routing recalibration. Route execution to the Vilya Codex orchestrator and require
it to read the full model routing and repair contract at `../vl-orch-codex/references/model-routing.md` in full.
This skill keeps its normal lane and grants no paid API, deployment or publication
authority.

Screen current independent benchmark evidence and official model capabilities and
pricing before running Vilya tests. Challenge the lowest applicable proven seat first.
Run only the smallest matched fixture needed to test what external data cannot show:
skill adherence, repair rate, accepted workflow cost or native Codex transfer. Promote
only after accepted evidence and focused native confirmation; ties, incomplete runs
and exhausted limits keep the incumbent.

The website is the evidence and policy surface, not a paid-execution control. Keep
credentials and launches operator-only. Publish the sanitized result, limitations and
routing change on `/evaluation`; update affected skills only when evidence changes the
route. This avoids repeating a full model tournament for every release.
