---
name: vl-crucible-django
description: Unusually strict, refactor-oriented code-quality review for Django / Python projects — vertical-slice (apps-as-slices) architecture per the HackSoft Django Styleguide, outcome-oriented SOLID, structural simplification, services/selectors and Django layer guidance. Use for PR review, "crucible", or when enforcing app-slice + services/selectors structure on a Django repo. Install one crucible variant per repo, matched to its stack (siblings: vl-crucible-nextjs, vl-crucible-blazor).
codex-support: "shared-compatible"
codex-notes: "Unchanged django architecture, quality and remediation contract; read and apply directly."
codex-invocation: "$vl-crucible-django"
codex-prerequisites: "Matching stack source/diff and test toolchain; review authority does not grant implementation or merge authority."
---

# Crucible Code Quality Review — Django / Python

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

Use $vl-crucible-django when discovered, or explicitly read and apply this SKILL.md.
Slash examples below name companion skills; in Codex use their $vl-* invocation
or read/apply source. This does not activate another seat or expand authority.
The shared procedure and quality bar below apply unchanged.

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **Django / Python instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for Django* and *Django layer* — the examples in
the SOLID and structural-non-negotiables rules, and the brownfield clause's examples (the rules
are shared everywhere; the examples speak this stack's language). Siblings: `vl-crucible-blazor`,
`vl-crucible-nextjs`, `vl-crucible-fastapi`, `vl-crucible-ml`. The dialect canon here is the **HackSoft
Django Styleguide** (apps as slices; services/selectors as the business-logic layers).

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

- **SRP** — one reason to change. A view doing object-fetching *and* business logic *and*
  serialization is the smell; split along the seam (selector, service, serializer), keep the pieces
  in the app.
- **OCP** — new cases arrive as new services / selectors / policies, not new `if/elif` arms grafted
  onto a shared function.
- **LSP** — a function/class must honor its contract; an override that raises on valid input or
  narrows an accepted type is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (data source,
  external APIs, transport), not everywhere. A class or Protocol with one implementation and no seam
  of change is not DIP — it's indirection. Abstract the boundary; call concrete code inside the app.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~400 to over ~400 lines without a strong reason — decompose first.
   (HackSoft: when `services.py` grows, split it into a `services/` package by sub-domain.)
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / one-implementation classes** that add indirection without clarity are a smell.
6. **`cast()` / `type: ignore` / `Any` / silent `except`-and-default** papering over an unclear
   boundary is a smell.

---

## VSA for Django — presumptive 🔴 blockers (stack-specific)

Blockers unless the author justifies clearly (canon: HackSoft Django Styleguide):

1. **Feature logic outside its app, or a god-app** — apps are the slices: one app per domain,
   owning its models, services, selectors, APIs/views, and tests. Do not grow a `core/` / `common/`
   / `utils/` god-app holding feature logic — shared apps hold framework-agnostic primitives,
   contracts, and pure utilities only, never a domain's business rules or its data access.
2. **Business logic outside services (writes) / selectors (reads)** — per the canon, business logic
   lives in services, selectors, and (sparingly) model properties / `clean`. Business logic in
   APIs/views, serializers, forms, model `save`, custom managers/querysets, template tags, or
   signals is the dumping-ground analog. Model properties and `clean` are for **simple,
   non-relational** derivation/validation only — anything spanning relations, fetching data, or
   risking N+1 when serialized is a selector.
3. **Cross-app internal imports / import flow against the grain** — one app reaching into another's
   internals (models, private helpers) is forbidden. First resolution: **call the other app's
   service/selector, or compose the two apps in the caller**; lift into a shared app only when the
   piece is genuinely domain-agnostic — premature lifting is its own smell. Imports run one way:
   `shared → domain apps → config/urls`; domain apps never import from `config`.
4. **ORM queries outside selectors/services** — raw querysets in views, serializers, templates, or
   management commands grow the spaghetti. Views stay interface; selectors own the pull, services
   own the push.
5. **Cross-cutting concern welded into a view or model** — auth, logging, rate-limiting, external
   IO belongs in middleware / a service / a task, not inlined into a view body or model method.
6. **Ad-hoc branching** bolted onto an unrelated flow instead of a dedicated policy / service / app.
7. **Boundary rules unenforced** — the no-cross-app and unidirectional rules are lintable
   (import-linter `layers` / `independence` / `forbidden` contracts in `.importlinter`). A violation
   a contract would have caught is two findings: the violation, and 🟠 "add the boundary contracts
   to the repo".

---

## Django layer — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions for the Django layer. Escalate one to 🔴 only when it breaks a
security or boundary line — secrets in templates / client-bound context, validation dropped at the
boundary — (then it's a blocker *on those grounds*, not on Django style):

- Business logic living in a fat view / `ViewSet` body instead of a service or selector the view
  calls. Canon shape: APIs stay simple (one API per operation, plain `APIView`), views do object
  fetching at most, then delegate.
- **N+1 queries** — `select_related` / `prefetch_related` belong **in the selector**, not patched
  at call sites; a model property spanning relations that serializes into N+1 should become a
  selector. Complex query optimization for one API can live in a dedicated serializer function.
- **Validation at the boundary, services transport-ignorant** — input validation in a nested
  `InputSerializer` / form at the API edge; output through an `OutputSerializer` (prefer plain
  `Serializer`; reuse serializers as little as possible). Services take keyword-only, type-annotated
  arguments and never touch `request` / transport. Model-level rules: prefer DB constraints when
  expressible; `clean` for simple non-relational checks, with `full_clean()` called in the service
  before save.
- **Migrations discipline** — never edit an applied migration; add a new one. Data migrations stay
  separate from schema migrations. A squash or a backwards-incompatible migration deserves its own
  PR, not a ride-along.
- **Signals as a last resort** — per the canon, signals are for connecting things that should *not*
  know about each other (and cache invalidation) — never for structuring the domain. A signal
  between two apps that already know each other should be an explicit service call.
- **Settings env-layered** — `config/django/{base,local,production,test}.py` with per-integration
  modules under `config/settings/`; everything imported in `base.py`, production differences via
  environment variables (`config/env.py`), not scattered `settings.X` feature flags. Secrets come
  from the environment only — a secret in a template or client-bound context is 🔴.
- **Type-contract discipline** — mypy/pyright with `django-stubs` as the bar; `cast()` /
  `type: ignore` / `Any` papering over an unclear boundary is the `as any` analog (🔴/🟠 when it
  hides a boundary contract). ruff is the lint floor.
- **Ad-hoc external calls** — one configured client per external service, with per-domain typed
  request modules; raw `requests` / `httpx` calls scattered through services is a finding. Calls to
  third parties that can fail or block belong in a task (Celery), which itself calls a service.
- Naming that preserves greppability — `<entity>_<action>` services (`user_create`), selectors
  (`user_list`), `<Entity><Action>Api`; consistency beats taste.
- Tests mirror the layers — `app/tests/{models,services,selectors}/` with factories; test the
  service's behavior, not the ORM.

---

## Brownfield clause — repos mid-migration to services/selectors

In a repo that did **not** start with the services/selectors split (fat views or `ModelViewSet`
classes with inline logic, a grown `core/` god-app) and is being migrated incrementally:

- The VSA blockers above apply to **new and modified features only**. Judge the diff, not the repo.
- **Pre-existing fat views are legacy, not a regression** — flag them 🟡 as *migration candidates*
  ("this touched the fat view in `orders/views.py`; when you next own this flow, pull the logic
  into `orders/services.py`"), never 🔴.
- The one hard rule that still bites: if the PR **grows** the legacy pattern for a *new* feature
  (new business logic inlined into a view/serializer/signal, or new feature files added to the
  god-app), that's a 🔴 — new work goes through services/selectors even while the old core is fat.
- The secrets boundary blocker (secrets into templates / client-bound context) is **never**
  downgraded, brownfield or not.
- Migration itself should be tracked as an Epic + per-app sub-issues, not smuggled into feature PRs.

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
- Does this belong in an existing app, or does it genuinely need a new one?
- Did an app import another app's internals instead of calling its service/selector?
- Did business logic land in a view / serializer / form / signal instead of a service or selector?
- Is there an ORM query outside a selector/service?
- Did a secret or server-only setting leak into a template / client-bound context?
- Did the shared/god-app grow feature logic?
- Is any "abstraction" here just a one-implementation class with no seam of change?

## Output order

1. 🔴 Secrets / boundary & security breaks
2. 🔴 Structural regressions / VSA violations (new & modified code)
3. 🟠 Missed dramatic simplification
4. 🟠 Spaghetti / branching growth
5. 🔴/🟠 Type-contract problems (`Any` casts, `type: ignore`)
6. 🟠 File-size / decomposition
7. 🟡 Django layer guidance
8. 🟡 Legacy migration candidates (brownfield repos)
9. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- a secret or server-only setting reachable from a template / client-bound context
- a clear structural / VSA regression in new or modified code
- a cross-app internal import
- new business logic in a view / serializer / form / signal instead of a service or selector
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- feature logic in the shared/god-app
- **new** feature logic added to the legacy fat-view core instead of a service

Good phrases:

- `this belongs in <app>/services.py (or selectors.py), not the view`
- `don't import <app>'s internals — call its service/selector, or compose the two apps in the caller`
- `these boundary rules belong in lint (import-linter contracts) — add them so review stops catching this`
- `this queryset belongs in a selector — views stay interface, selectors own the pull`
- `N+1: put the select_related/prefetch_related in the selector, not at the call site`
- `validate at the boundary (InputSerializer/form) and keep the service transport-ignorant`
- `don't edit an applied migration — add a new one, and split data from schema`
- `this signal should be an explicit service call — signals are for things that shouldn't know each other`
- `code-judo: can these branches collapse behind one service/policy?`
- `legacy fat view — not blocking, but a migration candidate when you next own this flow`

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
