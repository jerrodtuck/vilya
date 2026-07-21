---
name: vl-crucible-fastapi
description: Unusually strict, refactor-oriented code-quality review for FastAPI / Python projects — domain-package (bounded-context) architecture per fastapi-best-practices, outcome-oriented SOLID, structural simplification, async/blocking-IO and dependency-injection guidance. Use for PR review, "crucible", or when enforcing domain-package structure on a FastAPI repo. Install one crucible variant per repo, matched to its stack (siblings: vl-crucible-nextjs, vl-crucible-blazor).
---

# Crucible Code Quality Review — FastAPI / Python

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **FastAPI / Python instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for FastAPI* and *FastAPI layer* — the examples in
the SOLID and structural-non-negotiables rules, and the brownfield clause's examples (the rules
are shared everywhere; the examples speak this stack's language). Siblings: `vl-crucible-blazor`,
`vl-crucible-nextjs`, `vl-crucible-django`, `vl-crucible-ml`.

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

- **SRP** — one reason to change. A route doing validation *and* business logic *and* response
  shaping is the smell; split along the seam (schema, service, response model), keep the pieces in
  the domain package.
- **OCP** — new cases arrive as new services / dependencies / policies, not new `if/elif` arms
  grafted onto a shared function.
- **LSP** — a function/class must honor its contract; an override that raises on valid input or
  narrows an accepted type is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (data source,
  external APIs, transport), not everywhere. A class or Protocol with one implementation and no seam
  of change is not DIP — it's indirection. Abstract the boundary; call concrete code inside the domain.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~400 to over ~400 lines without a strong reason — decompose first.
   (When a domain's `service.py` or `router.py` grows, split it into a package by sub-domain.)
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / one-implementation classes** that add indirection without clarity are a smell.
6. **`cast()` / `type: ignore` / `Any` / silent `except`-and-default** papering over an unclear
   boundary is a smell.

---

## VSA for FastAPI — presumptive 🔴 blockers (stack-specific)

Blockers unless the author justifies clearly:

1. **Domain logic outside its package, or import flow against the grain** — imports run one way:
   `global src → domains → app entrypoint`. A domain owns `src/<domain>/` — `router.py` ·
   `schemas.py` · `service.py` · `models.py` · `dependencies.py` (growing `config.py` /
   `constants.py` / `exceptions.py` as needed — the fastapi-best-practices / Netflix Dispatch
   package shape). The entrypoint (`main.py` / app factory) stays **thin** — it builds the app and
   includes domain routers; domains never import from it. Do not grow app-wide `routers/` /
   `services/` / `crud/` layer-cake folders for domain logic.
   (Existing layer-cake in a brownfield repo: 🟡 migration candidate, not 🔴.)
   A generic **global `src/`** (custom pydantic base model, db setup, shared pagination primitives)
   is legitimate app-wide code — the dumping-ground rule applies to *domain-specific* logic only.
2. **Cross-domain imports** — one domain reaching into another's internals is forbidden. First
   resolution: **compose the two domains at the app/entrypoint level**; lift into the global `src/`
   only when the piece is genuinely domain-agnostic — premature lifting is its own smell. Where a
   cross-domain dependency is truly justified, import the other domain's explicit public module by
   name (`from src.auth import service as auth_service`), never its internals.
3. **Domain logic in the shared kernel** — the global `src/` holds framework-agnostic primitives,
   contracts (the custom pydantic base model), and pure utilities only. No domain business rules,
   no domain data access there.
4. **Untyped boundary** — data crossing the HTTP or domain boundary without a pydantic model.
   `schemas.py` owns the contract; validation belongs in the model (constrained types, enums,
   validators), not hand-rolled in routes. A bare dict or `Any` cast at a boundary is this stack's
   `as any`.
5. **Config/secret boundary break** — settings live in per-domain `BaseSettings`
   (pydantic-settings), not scattered `os.environ` / `os.getenv` reads; secrets, engines, and
   clients are never **constructed at import time** in a module a router drags in — build them
   behind `Depends` or the lifespan. This is a 🔴 security/operational boundary, not style.
6. **Cross-cutting concern welded into a route** — auth, logging, rate-limiting, external IO
   belongs in dependencies / middleware / exception handlers, not inlined into route or service bodies.
7. **Ad-hoc branching** bolted onto an unrelated flow instead of a dedicated policy / handler / domain.
8. **Boundary rules unenforced** — the no-cross-domain and unidirectional rules are lintable
   (import-linter `layers` / `independence` / `forbidden` contracts in `.importlinter`). A violation
   a contract would have caught is two findings: the violation, and 🟠 "add the boundary contracts
   to the repo".

---

## FastAPI layer — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions for the service layer. Escalate one to 🔴 only when it breaks the
config/security or type boundary (then it's a blocker *on those grounds*, not on FastAPI style):

- Business logic living in the route body instead of `service.py` — routes stay thin: validate via
  the schema, call the service, shape the response.
- **Blocking IO inside an `async def` route** (the waterfall analog) — a sync DB driver,
  `requests`, `time.sleep`, or file IO stalls the whole event loop. Go properly async, or declare
  the route `def` so it runs in the threadpool; CPU-bound work goes to a worker process / task
  queue — the GIL means threads don't help.
- Dependencies as module globals instead of `Depends` — request-scoped resources (session, current
  user, clients) are injected; chain dependencies to reuse validation and lean on per-request
  dependency caching instead of re-checking. Prefer async dependencies — sync ones cost a
  threadpool hop.
- Hand-rolled validation pydantic already does — reach for constrained types, enums, and
  validators; standardize serialization in a custom base model; raise `ValueError` inside a
  validator to surface a clean validation error to the client.
- **Response models undeclared** — every route declares its `response_model` (or typed return); no
  bare dicts across the HTTP boundary. Know that FastAPI re-validates whatever you return against it.
- **Ad-hoc external calls** — one configured client per external service (async,
  connection-pooled), with per-domain typed request modules; raw `httpx.get` / `requests` scattered
  through services is a finding. A sync-only third-party SDK runs via `run_in_threadpool`, not as
  an event-loop stall.
- **Per-route try/except carpet** — raise domain exceptions and register exception handlers; keep
  route bodies straight-line.
- `BackgroundTasks` for anything that must survive — it is in-process with no retries; real work
  goes to a task queue (Celery / Arq / RQ).
- REST hygiene that pays: consistent path-variable names so chained dependencies reuse across
  related routes; SQLAlchemy naming conventions set once on `MetaData` (lowercase_snake_case,
  singular tables, `_at` / `_date` suffixes).
- Type-checking and lint floor — mypy/pyright strict plus ruff on the repo; an `Any` cast or
  `# type: ignore` papering over an unclear boundary is the `as any` analog.
- Tests live in the domain (colocated with what they test), driven through an async client
  (`httpx.AsyncClient`) from day one, with `dependency_overrides` at the seams — not monkeypatched
  internals.

---

## Brownfield clause — repos mid-migration to domain packages

In a repo that did **not** start with domain packages (a flat `routers/` + `services/` + `crud/`
layer-cake, or everything hanging off one `main.py`) and is being migrated incrementally:

- The VSA blockers above apply to **new and modified features only**. Judge the diff, not the repo.
- **Pre-existing layer-cake code is legacy, not a regression** — flag it 🟡 as a *migration
  candidate* ("this touched `services/orders.py`; when you next own this, pull it into a
  `src/orders/` domain package"), never 🔴.
- The one hard rule that still bites: if the PR **grows** the legacy layer-cake for a *new*
  feature (adds a new file to app-wide `routers/` / `services/` / `crud/` for new work), that's a
  🔴 — new work goes in a domain package even while the old core is still layered.
- The config/secret boundary blocker (import-time construction, secrets outside `BaseSettings`) is
  **never** downgraded, brownfield or not.
- Migration itself should be tracked as an Epic + per-domain sub-issues, not smuggled into feature PRs.

---

## Primary review questions

- Is there a code-judo move that deletes a whole *category* of complexity?
- Does this belong in an existing domain package, or does it genuinely need a new one?
- Did a domain import another domain's internals?
- Did a secret / engine / client get constructed at import time in router-reachable code?
- Is there blocking IO inside an `async def` route?
- Is data crossing a boundary without a pydantic model?
- Did the global `src/` grow domain logic?
- Is any "abstraction" here just a one-implementation wrapper with no seam of change?

## Output order

1. 🔴 Config/secret & import-time boundary breaks
2. 🔴 Structural regressions / VSA violations (new & modified code)
3. 🟠 Missed dramatic simplification
4. 🟠 Spaghetti / branching growth
5. 🔴/🟠 Type-contract problems (`Any` casts, bare dicts at boundaries)
6. 🟠 File-size / decomposition
7. 🟡 FastAPI layer guidance
8. 🟡 Legacy migration candidates (brownfield repos)
9. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- a secret / engine / client constructed at import time in router-reachable code
- a clear structural / VSA regression in new or modified code
- a cross-domain internal import
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- domain logic in the shared kernel
- **new** domain logic added to the legacy layer-cake instead of a domain package

Good phrases:

- `this belongs in the <domain> package, not an app-wide services/`
- `don't import <domain>'s internals — compose the two domains at the app/entrypoint level (or lift a truly shared piece into the global src/)`
- `these boundary rules belong in lint (import-linter contracts) — add them so review stops catching this`
- `import-time construction: this builds the <engine/client> the moment the router imports — move it behind Depends or the lifespan`
- `raw os.environ read — this belongs in the domain's BaseSettings`
- `blocking IO in an async route — this stalls the event loop; go async or drop to def`
- `bare dict across the boundary — give it a schema and declare the response model`
- `code-judo: can these branches collapse behind one handler/policy?`
- `this wrapper has one impl and no seam of change — inline it inside the domain`
- `legacy layer-cake — not blocking, but a migration candidate when you next own this domain`
