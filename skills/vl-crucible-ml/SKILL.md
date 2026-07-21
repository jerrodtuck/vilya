---
name: vl-crucible-ml
description: Unusually strict, refactor-oriented code-quality review for Python ML/data projects — src-layout slice packages, import-linter boundary contracts, the notebook-promotion rule, outcome-oriented SOLID, serving/training separation, data-provenance guidance. Use for PR review, "crucible", or when enforcing slice structure on a Python ML/data repo. Install one crucible variant per repo, matched to its stack (siblings: vl-crucible-nextjs, vl-crucible-blazor).
---

# Crucible Code Quality Review — Python ML / Data

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **Python ML / data instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for Python/ML* and *ML/data layer* — the examples
in the SOLID and structural-non-negotiables rules, and the brownfield clause's examples (the rules
are shared everywhere; the examples speak this stack's language). Siblings: `vl-crucible-blazor`,
`vl-crucible-nextjs`, `vl-crucible-fastapi`, `vl-crucible-django`.

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

- **SRP** — one reason to change. A module doing data loading *and* feature transformation *and*
  model IO is the smell; split along the seam, keep the pieces in the slice.
- **OCP** — new cases arrive as new slices / pipeline steps / strategies, not new `if/elif` arms
  grafted onto a shared function.
- **LSP** — a function/class must honor its contract; an override that raises on valid input or
  narrows an accepted type is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (data source,
  model backend, external services), not everywhere. A class or Protocol with one implementation and
  no seam of change is not DIP — it's indirection. Abstract the boundary; call concrete code inside
  the slice.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~400 to over ~400 lines without a strong reason — decompose first.
   (When a slice module grows, split it into a subpackage by pipeline step — never into a god
   `utils.py`.)
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / one-implementation classes** that add indirection without clarity are a smell.
6. **`cast()` / `type: ignore` / `Any` / silent `except`-and-default** papering over an unclear
   boundary is a smell.

---

## VSA for Python/ML — presumptive 🔴 blockers (stack-specific)

**No single named canon** has Bulletproof-React-level mindshare for Python ML/data — a finding, not
an omission. This dialect is a composition: **src-layout slice packages + import-linter contracts**
for the package, with **Cookiecutter Data Science's `data/` + `notebooks/` repo scaffold** grafted
on. (Kedro was considered and rejected — ceremony; it wants to own program structure and fights a
service shape.)

Blockers unless the author justifies clearly:

1. **Slice logic outside its slice, or import flow against the grain** — the package is
   `src/<package>/` with **one subpackage per slice** (a feature/domain owning its schemas, logic,
   and IO for that use case); imports run one way: `shared → slices → entrypoints`. Entrypoints
   (the serving app, CLI, and pipeline `main` modules) stay **thin** — wiring and composition
   only; slices never
   import from an entrypoint. Do not grow package-wide `utils/` / `helpers/` / `core/` dumping
   grounds for slice logic.
2. **Cross-slice imports** — one slice reaching into another's internals is forbidden. First
   resolution: **compose the two slices at the entrypoint level**; lift into `shared/` only when
   the piece is genuinely slice-agnostic — premature lifting is its own smell.
3. **Slice logic in the shared kernel** — `shared/` holds **contracts and envelope models only**
   (pydantic models, shared value types, pure primitives). No feature business rules, no data
   access for a slice there.
4. **The notebook-promotion rule** — notebooks are **leaf consumers**: they import from the
   package; package code never imports from a notebook (no `%run` chains, no notebook-execution
   shims on an import path). Anything a notebook proves gets **promoted into a slice before any
   service path touches it**. This is the "new work goes in a slice" analog — the rule ML projects
   die without.
5. **Training logic reachable from the serving path** — the serving import graph must not pull in
   training code or training-only dependencies. This is a 🔴 boundary, not style.
6. **Hand-edited generated stubs** — generated code (gRPC/protobuf stubs etc.) is **read-only
   vendored code in `shared/`**. A hand-edit to a generated file is a 🔴 — regenerate instead.
7. **Unvalidated boundary** — data crossing a slice, service, or process boundary as a raw `dict`
   / untyped payload where a **pydantic model** belongs. Validate at the boundary; pass typed
   objects inside.
8. **Boundary rules unenforced** — the one-way-flow and no-cross-slice rules are lintable
   (import-linter `layers` and `independence` contracts; `forbidden` for the serving→training
   edge). A violation a contract would have caught is two findings: the violation, and 🟠 "add the
   `.importlinter` contracts to the repo".

---

## ML/data layer — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions for the ML/data layer. Escalate one to 🔴 only when the
serving/training or data-provenance boundary actually breaks (then it's a blocker *on those
grounds*, not on style):

- **Config via pydantic-settings**, not `os.environ` reads scattered through the code — one typed
  settings model per concern, read at the entrypoint, passed down.
- **Seed / determinism declared where results are compared** — an experiment or eval whose numbers
  will be compared against another run states its seeds and determinism flags in one visible place,
  not implicitly.
- **Tensor/array `device` handling explicit at the boundary** — no hidden `.cuda()` / implicit
  device moves deep inside library code; the caller decides placement.
- **Data provenance** — raw data is **immutable** (`data/raw` is write-once); processed data is
  **reproducible from code** (a pipeline step regenerates it — never a hand-edited derived
  dataset). A break here escalates to 🔴.
- **Experiment artifacts out of the package tree** — checkpoints, run logs, tracker output
  (`mlflow`/`wandb` dirs) live outside `src/`, ignored by version control.
- **`Any` casts / `# type: ignore` / untyped `dict` payloads** papering over an unclear boundary
  (the `as any` analog) — mypy/pyright strictness is the floor, ruff the lint floor.
- **Ad-hoc external calls** — one configured client per external service (blob store, feature
  store, model registry), with per-slice typed request modules; raw clients constructed inline in
  slice code is a finding.
- Oversized modules — a god `utils.py` or one file owning many responsibilities; extract along the
  seams into the slice.
- Tests organized by slice (mirroring `src/<package>/<slice>/` under `tests/`), not by layer.

---

## Brownfield clause — the two lives of an ML repo

An ML repo has two lives: an **exploration phase** (notebooks, flat scripts, ad-hoc data pulls)
and a **service phase** (a package other systems depend on). The blockers above exist to keep
phase one's habits from poisoning phase two. In a repo that started as exploration and is being
migrated incrementally:

- The VSA blockers above apply to **new and modified code only**. Judge the diff, not the repo.
- **Exploration-era code is legacy, not a regression** — flag it 🟡 as a *migration candidate*
  ("this touched `scripts/train_v2.py`; when you next own this, pull it into a `training` slice"),
  never 🔴.
- The one hard rule that still bites: **new service-path work slices from day one**. If the PR
  grows the flat `scripts/` pile or a god `utils.py` for *new* service-path work, that's a 🔴 —
  even while the old exploration core is still flat.
- The serving/training boundary and data-provenance rules are **never** downgraded, brownfield or not.
- Migration itself should be tracked as an Epic + per-slice sub-issues, not smuggled into feature PRs.

---

## Primary review questions

- Is there a code-judo move that deletes a whole *category* of complexity?
- Does this belong in an existing slice, or does it genuinely need a new one?
- Did a slice import another slice's internals?
- Is training code (or a training-only dependency) reachable from the serving path?
- Did a notebook's proven logic get promoted into a slice, or is a notebook now on a service path?
- Is raw data being mutated, or processed data no longer reproducible from code?
- Did the shared kernel grow slice logic?
- Is a raw `dict` crossing a boundary that deserves a pydantic model?
- Is any "abstraction" here just a one-implementation wrapper with no seam of change?

## Output order

1. 🔴 Serving/training & data-provenance boundary breaks
2. 🔴 Structural regressions / VSA violations (incl. notebook-promotion breaks)
3. 🟠 Missed dramatic simplification
4. 🟠 Spaghetti / branching growth
5. 🔴/🟠 Type-contract problems (`Any` casts, unvalidated boundaries)
6. 🟠 File-size / decomposition
7. 🟡 ML/data layer guidance
8. 🟡 Legacy migration candidates (exploration-era code)
9. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- training logic reachable from the serving path
- a clear structural / VSA regression in new or modified code
- a cross-slice internal import
- package code importing from a notebook, or unpromoted notebook logic on a service path
- raw data mutated, or processed data not reproducible from code
- a hand-edited generated stub
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- slice logic in the shared kernel
- **new** service-path work added to the flat exploration pile instead of a slice

Good phrases:

- `this belongs in the <slice> subpackage, not a package-wide utils/`
- `don't import <slice>'s internals — compose the two slices at the entrypoint (or lift a truly shared contract into shared/)`
- `these boundary rules belong in import-linter (layers / independence contracts) — add them so review stops catching this`
- `the notebook proved it — promote it into the <slice> slice before the service path touches it`
- `notebooks are leaf consumers — package code never imports from a notebook`
- `training logic is reachable from the serving path — split the import graph and forbid the edge in import-linter`
- `this is generated code — regenerate the stub, don't hand-edit it`
- `this dict crossing the boundary deserves a pydantic model`
- `code-judo: can these branches collapse behind one handler/policy?`
- `exploration-era code — not blocking, but a migration candidate when you next own this slice`
