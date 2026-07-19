---
name: vilya-crucible-blazor
description: Unusually strict, refactor-oriented code-quality review for .NET / Blazor projects — vertical-slice architecture, outcome-oriented SOLID, structural simplification, Blazor component-layer guidance. Use for PR review, "crucible", or when enforcing VSA on a Blazor/.NET repo. Install one crucible variant per repo, matched to its stack (sibling: vilya-crucible-nextjs).
---

# Crucible Code Quality Review — Blazor / .NET

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **Blazor / .NET instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for .NET* and *Blazor UI layer* — the examples in
the SOLID and structural-non-negotiables rules, and the brownfield clause's examples (the rules
are shared everywhere; the examples speak this stack's language). Siblings: `vilya-crucible-nextjs`,
`vilya-crucible-fastapi`, `vilya-crucible-django`, `vilya-crucible-ml`.

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

Judge SOLID by outcomes, not ceremony. Do **not** reward an interface-per-class or wrappers for
their own sake — that collides with the anti-wrapper rule. Real SOLID reduces reasons-to-change and
isolates what varies; fake SOLID just adds indirection.

- **SRP** — one reason to change. A unit doing orchestration *and* IO *and* mapping is the smell;
  split along the seam, keep the pieces in the slice.
- **OCP** — new cases arrive as new slices / policies / handlers, not new `switch` arms grafted
  onto a shared method.
- **LSP** — an implementation must be substitutable; a `NotSupportedException` override or a
  narrowing precondition is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (data access,
  external systems, transport), not everywhere. An interface with one implementation and no seam of
  change is not DIP — it's indirection. Abstract the boundary; call concrete types inside the slice.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~1k to over ~1k lines without a strong reason — decompose first.
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / identity abstractions** that add indirection without clarity are a smell.
6. **Cast / silent `catch`-and-default** papering over an unclear boundary is a smell.

---

## VSA for .NET — presumptive 🔴 blockers (stack-specific)

Blockers unless the author justifies clearly:

1. **Feature logic outside its slice** — a feature's logic belongs in its own vertical slice (one
   folder/module owning request → handler → data for that use case). Do not grow app-wide
   `Controllers/` / `Services/` / `Repositories/` layer-cake folders for a feature.
2. **Feature logic in the shared kernel** — shared / `BuildingBlocks`-style projects hold contracts,
   envelopes, and primitives only (events, publisher/port interfaces, shared value types). No
   ingest / filter / egress / business rules there.
3. **`ProjectReference` into a sibling product/app** — forbidden. Copy the pattern; extract a
   deliberate shared package later if duplication actually hurts.
4. **Cross-cutting concern welded into core logic** — messaging / IO / egress (MQTT, SSE, email,
   files) belongs behind a port or in its own slice, not as `if (mqtt)` inside domain/handler code.
5. **Ad-hoc branching** bolted onto an unrelated flow instead of a dedicated policy / handler / slice.

---

## Blazor UI layer — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions for the UI layer. Escalate one to 🔴 only when it hides a real
VSA/boundary break — then it's a blocker *on those grounds*, not on Blazor style:

- Business logic living in `.razor` markup or a fat `@code` block instead of a handler/service the
  component calls.
- A component reaching data access / `DbContext` / `HttpClient` directly instead of dispatching into
  the slice (mediator/handler).
- Oversized components — one `.razor` owning many responsibilities; consider child components or a
  code-behind (`.razor.cs`).
- Undisposed subscriptions / timers / `IDisposable` (`IAsyncDisposable`, event handlers) → leaks.
- `StateHasChanged` sprinkled to force renders, or heavy work in `OnParametersSet*` /
  `OnAfterRender*` that should be cached or moved out of the render path.
- `[Parameter]` hygiene: mutating parameters internally, missing `[EditorRequired]`, over-broad
  cascading values.
- Validation / `EditForm` concerns placed in markup rather than a model or validator.
- `async void` outside event handlers; not awaiting `InvokeAsync` when updating from a background thread.

---

## Brownfield clause — repos mid-migration to VSA

In a repo that did **not** start as VSA and is being migrated incrementally:

- The VSA blockers above apply to **new and modified features only**. Judge the diff, not the repo.
- **Pre-existing layered code is legacy, not a regression** — flag it 🟡 as a *migration candidate*
  ("this touched `Services/OrderService.cs`; when you next own this feature, pull it into an Orders
  slice"), never 🔴.
- The one hard rule that still bites: if the PR **grows** the legacy layer for a *new* feature
  (adds a new file under app-wide `Services/` for new work), that's a 🔴 — new work goes in a slice
  even while the old core is still layered.
- Migration itself should be tracked as an Epic + per-slice sub-issues, not smuggled into feature PRs.

---

## Primary review questions

- Is there a code-judo move that deletes a whole *category* of complexity?
- Does this belong in an existing slice, or does it genuinely need a new one?
- Did the shared kernel grow feature logic?
- Did a cross-cutting concern (egress / IO / messaging) tangle into core logic?
- Did a file cross ~1k lines without decomposition?
- Do repeated conditionals signal a missing model / policy?
- Is any "SOLID" here actually just indirection around a single implementation?
- Is logic sitting in `.razor` markup that belongs in a handler the component calls?

## Output order

1. 🔴 Structural regressions / VSA violations (new & modified code)
2. 🟠 Missed dramatic simplification
3. 🟠 Spaghetti / branching growth
4. 🔴/🟠 Boundary / type-contract problems
5. 🟠 File-size / decomposition
6. 🟡 Blazor UI-layer guidance
7. 🟡 Legacy migration candidates (brownfield repos)
8. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- a clear structural / VSA regression in new or modified code
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- project-coupling into a sibling product
- feature logic in the shared kernel
- a cross-cutting concern tangled into core logic with no clean boundary
- **new** feature logic added to the legacy layered core instead of a slice

Good phrases:

- `this belongs in the <Feature> slice, not a new Services folder`
- `the shared kernel should stay contracts/ports — move this into the slice`
- `no ProjectReference to <sibling product> — copy the pattern or extract a shared package later`
- `egress should consume the bus/port, not sit inside the handler`
- `this pushes the file past ~1k lines — decompose first`
- `code-judo: can these branches collapse behind one policy/port?`
- `this interface has one impl and no seam of change — call the concrete type inside the slice`
- `move this logic out of the .razor markup into a handler the component calls`
- `legacy layered code — not blocking, but a migration candidate when you next own this feature`
