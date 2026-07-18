---
name: crucible-nextjs
description: Unusually strict, refactor-oriented code-quality review for Next.js / React / TypeScript projects — vertical-slice (feature-folder) architecture, outcome-oriented SOLID, structural simplification, server/client-boundary and RSC guidance. Use for PR review, "crucible", or when enforcing feature-slice structure on a Next.js repo. Install one crucible variant per repo, matched to its stack (sibling: crucible-blazor).
---

# Crucible Code Quality Review — Next.js / React

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **Next.js / React instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for Next.js* and *React / RSC UI layer* — the
examples in the SOLID and structural-non-negotiables rules, and the brownfield clause's examples
(the rules are shared everywhere; the examples speak this stack's language). Siblings:
`crucible-blazor`, `crucible-fastapi`, `crucible-django`, `crucible-ml`.

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
