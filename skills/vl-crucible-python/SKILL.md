---
name: vl-crucible-python
description: Unusually strict, refactor-oriented code-quality review for general Python packages, CLI tools, automation and jobs — feature/use-case packages, explicit import boundaries, typed contracts and outcome-oriented SOLID. Use for PR review or "crucible" on general Python. Select one variant per repo; FastAPI, Django and ML retain their specialized variants.
codex-support: "shared-compatible"
codex-notes: "General Python architecture, quality and remediation contract; read and apply directly."
codex-invocation: "$vl-crucible-python"
codex-prerequisites: "Matching stack source/diff and test toolchain; review authority does not grant implementation or merge authority."
---

# Crucible Code Quality Review — General Python

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

Use $vl-crucible-python when discovered, or explicitly read and apply this SKILL.md.
Slash examples below name companion skills; in Codex use their $vl-* invocation
or read/apply source. This does not activate another seat or expand authority.
The shared procedure and quality bar below apply unchanged.

Strict, **refactor-oriented** review of the current branch's changes. **Not a pass/fail gate** —
every finding names a concrete refactor. Be **ambitious** about structure: hunt for code-judo moves
that preserve behavior while making the implementation dramatically simpler.

This is the **general Python instance** of the crucible method. Across all variants the
**byte-identical core** is the core prompt and the severity/reporting contract. Four pieces are
**stack-tuned**: the two stack sections — *VSA for general Python* and *Python execution and IO* — the examples
in the SOLID and structural-non-negotiables rules, and the brownfield clause's examples (the rules
are shared everywhere; the examples speak this stack's language). Siblings: `vl-crucible-blazor`,
`vl-crucible-nextjs`, `vl-crucible-fastapi`, `vl-crucible-django`, `vl-crucible-ml`.

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

- **SRP** — one reason to change. A module parsing CLI options *and* applying business rules *and*
  writing reports is the smell; split along the seam, keep feature behavior in its slice.
- **OCP** — new cases arrive as new slices / handlers / strategies, not new `if/elif` arms
  grafted onto a shared function.
- **LSP** — a function/class must honor its contract; an override that raises on valid input or
  narrows an accepted type is the flag.
- **ISP / DIP** — depend on abstractions **at the boundaries that actually vary** (file source,
  external service, clock), not everywhere. A class or Protocol with one implementation and
  no seam of change is not DIP — it's indirection. Abstract the boundary; call concrete code inside
  the slice.

### Structural non-negotiables (shared rules, stack-tuned examples)

0. Prefer the solution that makes the code feel inevitable — delete whole branches/helpers/modes.
1. Don't push a file from under ~400 to over ~400 lines without a strong reason — decompose first.
   (Split a growing slice module by use case, never into a package-wide god `utils.py`.)
2. No random spaghetti growth — special cases earn their own abstraction.
3. Bias toward cleaning the design, not accepting "it works."
4. Prefer direct, boring code over magic.
5. **Thin wrappers / one-implementation classes** that add indirection without clarity are a smell.
6. **`cast()` / `type: ignore` / `Any` / silent `except`-and-default** papering over an unclear
   boundary is a smell.

---

## Selection and proportionality

Use this variant for general packages, CLI tools, automation and jobs. Use
`vl-crucible-fastapi`, `vl-crucible-django` or `vl-crucible-ml` for those specialized projects.
Select **one variant per repo**; do not stack reviews or inherit another variant's scaffolding.

Prefer `src/<package>/` for packaged applications. [PyPA's layout discussion](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/)
explains packaging/import differences; a `src` folder does not prove VSA. These feature boundaries
are Vilya design intent, not a claimed Python standard. For a small single-purpose script, keep
clear responsibilities and boundaries without manufacturing packages or extra layers.

## VSA for general Python — presumptive 🔴 blockers (stack-specific)

Blockers unless the author justifies clearly:

1. **Feature logic outside its slice, or reversed import flow** — each feature/use-case package
   owns its types/contracts, logic, IO and tests. Entrypoints import features; features import
   shared primitives. Features never import entrypoints. Shared code imports neither features
   nor entrypoints. Keep CLI, `__main__`, scheduler and job entrypoints thin: parsing, wiring and
   composition only. Do not grow package-wide `utils/` / `helpers/` / `core/` dumping grounds.
2. **Cross-feature internal imports or dependency cycles** — prohibit both. Compose features at
   an entrypoint by default. Necessary collaboration through an **explicit public contract** is
   allowed with justification: name its owner, supported interface and dependency direction;
   keep the graph acyclic. A public re-export of private implementation does not justify access.
   Lift code into shared only when it is genuinely feature-agnostic.
3. **Feature logic in shared** — shared holds pure primitives, value types and reusable contracts,
   not feature business rules or feature-specific IO. Feature contracts remain feature-owned;
   move one only when its shared ownership is justified.
4. **Unvalidated untrusted input** — validate CLI values, files, environment/config, process and
   external-service payloads at their actual trust boundaries. Pass typed objects internally.
   Type hints and dataclasses describe contracts but do not themselves validate runtime input.
   Choose explicit checks, dataclasses, type hints, Protocols or a validation library as appropriate;
   no mandatory Pydantic, framework, ORM/service layer or ML scaffold.
5. **Import-time execution or hidden resource ownership** — importing library code must not start
   jobs, perform external IO, mutate files or initialize live clients. Put execution behind an
   explicit entrypoint (including the `if __name__ == "__main__"` guard where appropriate).
   Make ownership and cleanup of files, clients, transactions and tasks explicit. Escalate observed
   data loss, leaks or boundary breaks; do not invent a failure from style alone.
6. **Hand-edited generated code** — generated clients/stubs are generator-owned. Regenerate from
   the authoritative source; keep handwritten adapters in the owning feature. Place generated
   artifacts according to actual ownership, not automatically in shared.
7. **Applicable boundaries unenforced** — use [import-linter contracts](https://import-linter.readthedocs.io/en/stable/contract_types/)
   or an existing equivalent. Use layers/forbidden for direction, protected/forbidden for private
   internals, and acyclic-siblings for feature cycles where applicable. Independence is appropriate
   only for features that must have **no** collaboration; do not blanket-ban justified public
   contracts. Check actual import paths, indirect edges and declared exceptions. A real violation
   is 🔴; missing automated enforcement alone is 🟠, not proof of a violation. When both exist,
   report the violation and the missing enforcement separately with concrete fixes.

### Boundary examples — review the imports, not the folder names

Permitted composition in `src/tool/cli.py` (an entrypoint):

```python
from tool.exporting.api import export_report
from tool.reporting.api import build_report

# The entrypoint wires two feature-owned public interfaces.
export_report(build_report())
```

Prohibited inside `src/tool/exporting/runner.py` (a feature):

```python
from tool.reporting._storage import load_rows  # another feature's internal IO
```

Refactor the second example by composing at the entrypoint. If collaboration is necessary,
use a justified `tool.reporting.api` contract instead; preserve its owner and acyclic direction.
A blanket independence contract would wrongly ban this permitted exception.

---

## Python execution and IO — guidance, not blockers (stack-specific)

Non-blocking 🟡 review questions. Escalate to 🔴 only for an actual security, data/resource or
contract break, not for a preferred library:

- **Configuration** — read environment/config at the boundary, validate once, pass typed settings
  to consumers; avoid scattered environment reads and secret-bearing logs.
- **Errors** — catch expected exceptions at the responsible boundary, preserve useful context,
  and map failures to explicit CLI exit codes or job outcomes. Do not hide failure with broad
  `except Exception: pass` or success-shaped defaults. Retries need bounded policy and safe effects.
- **Resources and concurrency** — use context managers or explicit cleanup; the creator or caller
  owns lifetime. Check cancellation and timeouts for actual concurrent work. Do not require async
  code or a task queue when synchronous execution meets the use case.
- **External IO** — keep feature-specific IO in that feature with typed requests/results.
  Pass configured clients at the boundary where useful; avoid repeated hidden client creation.
- **Packaging** — verify declared dependencies, supported Python versions and actual entrypoints.
  Exercise the installed package/CLI where affected; cwd import success is not packaging proof.
- **Types and lint** — apply the repo's mypy/pyright and ruff or equivalent checks. Investigate
  `Any`, casts and ignores that conceal unclear contracts; do not add abstractions to satisfy style.
- **Tests** — feature-owned behavior tests may be colocated or mirrored under `tests/<feature>/`.
  Cover affected boundary validation, IO failures and CLI/job outcomes; avoid testing private internals.
- **Generated artifacts** — verify generator/source provenance and reproducibility where affected;
  avoid editing generated output to conceal a broken generator.

---

## Brownfield clause — repos mid-migration to feature packages

In a repo that did **not** start sliced (flat scripts, a growing `main.py`, or app-wide
`services/` + `utils/`) and is being migrated incrementally:

- The VSA blockers above apply to **new and modified features only**. Judge the diff, not the repo.
- **Pre-existing flat/legacy code is legacy, not a regression** — flag it 🟡 as a *migration
  candidate* ("this touched `utils/reports.py`; when you next own this flow, move it into the
  `reporting` feature"), never 🔴 merely for its existing structure.
- The one hard rule that still bites: growing a legacy dumping ground for a **new** feature is
  🔴 — new feature work belongs in its slice even while the old core is flat. A small
  single-purpose script does not need artificial packages or a wholesale reorganization.
- Actual security, data/resource and type-contract breaks are **never** downgraded, brownfield or not.
- Track broader migration as an Epic + per-feature sub-issues, not a ride-along feature rewrite.

---

## Component baseline — review the repo policy

Apply this check to actual UI: components, rendered templates, dashboards and their
primitives. For library-only or CLI/job-only changes, report **not applicable — no UI
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
- Does this belong in an existing feature/use-case package?
- Does an entrypoint compose features, or does one feature reach into another's internals?
- Is necessary public-contract collaboration justified and acyclic?
- Did shared code grow feature logic, IO or reverse imports?
- Is untrusted input validated at the actual boundary, with typed objects inside?
- Does import execute a job or hide resource ownership?
- Are error, configuration and generated-code responsibilities explicit?
- Is any abstraction a one-implementation wrapper with no seam of change?

## Output order

1. 🔴 Security, data/resource and import boundary breaks
2. 🔴 Structural regressions / VSA violations (new & modified features)
3. 🟠 Missed dramatic simplification
4. 🟠 Spaghetti / branching growth
5. 🔴/🟠 Type-contract problems (unsafe casts, unvalidated input)
6. 🟠 File-size / decomposition and missing boundary enforcement
7. 🟡 Python execution and IO guidance
8. 🟡 Legacy migration candidates (brownfield repos)
9. **Merge-readiness signal + top refactors by leverage**

## The bar (refactor lens, not a rubber stamp)

Correct behavior is not enough. Withhold `Ready` while any of these stand:

- an actual security, data/resource or type-contract break
- a clear structural / VSA regression in new or modified features
- a cross-feature internal import, reverse import or dependency cycle
- unjustified public-contract collaboration
- a hand-edited generated artifact
- an obvious missed simplification on a visible path
- an unjustified file-size explosion
- feature logic or feature-specific IO in shared
- **new** feature work added to a legacy dumping ground instead of a slice

Good phrases:

- `compose these features at the entrypoint; keep private IO in its owning feature`
- `justify this public contract and enforce its acyclic dependency direction`
- `missing enforcement is a separate should-fix; show the actual violating import`
- `validate this file payload at ingestion; pass a typed object inside`
- `import should define behavior; move job execution into the explicit entrypoint`
- `regenerate this client from its source; keep the adapter in the feature`
- `code-judo: can these branches collapse behind one handler/policy?`
- `legacy flat code — migration candidate when you next own this feature`

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
