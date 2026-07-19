# Night-shift chain promote

**Created:** 2026-07-19  
**Last updated:** 2026-07-19  
**Owning issues:** [#214](https://github.com/jerrodtuck/vilya/issues/214) (epic), [#217](https://github.com/jerrodtuck/vilya/issues/217) (this spec + ADR), [#215](https://github.com/jerrodtuck/vilya/issues/215) (canon + template), [#216](https://github.com/jerrodtuck/vilya/issues/216) (skills + site)  
**Status:** ADR + this spec via #217; canon/template shipped in #215; skills/site teach prep remains #216

## Intent

Night-shift never merges, so a daisy-chain successor labeled only `night-shift:chain`
stays ineligible until something promotes it. Promotion is an **event-driven workflow**
on `issues: closed` that reads GitHub native **blocked-by** — not agent-side logic and
not a body-text dependency convention.

This spec is the durable story for the promote rule and prep ritual. Canon tables and
the reusable YAML live in #215; skill/site teaching is #216.

## Promote rule

On `issues: closed` (issue close, not PR timeline noise):

1. Find **dependents** — issues this closed issue is **blocking** (GraphQL `blocking` on
   the closed issue; each dependent lists it under native `blockedBy`).
2. For each **open** dependent, promote when **all** of:
   - every `blockedBy` blocker is `CLOSED`
   - labels include `night-shift:chain` and `plan:ready`
   - labels do **not** include `needs:decision` or `type:epic`
   - not already `night-shift:ready`
3. On promote: add `night-shift:ready`, remove `night-shift:chain`.

**Expectation:** **one chain link per merge cycle**, not a full path per overnight run.
Closing one blocker may promote at most the dependents that were waiting only on that
(and other already-closed) blockers.

## Ownership split

| Owner | Owns |
|-------|------|
| **Vilya** | Process canon (`GITHUB-PROJECTS.md` Chain promote), Autonomy label `night-shift:chain`, reusable template, this spec + ADR, skill/site teaching (#216) |
| **Product repos** (e.g. Anduin) | Live `.github/workflows/chain-promote.yml` copied from the template; backfill native blocked-by on that board's chains |

Night-shift skill stays **dumb**: eligibility read only (`night-shift:ready` ∧ `plan:ready`).
It does not promote chain successors.

## Workflow template

Copy from Vilya:

`docs/project-tracking/templates/chain-promote.yml`
→ product repo `.github/workflows/chain-promote.yml`

Template notes (secrets/permissions, GraphQL shape, skip reasons) live in the YAML
header comments. Default `GITHUB_TOKEN` with `permissions.issues: write` is enough —
no Claude OAuth token, no checkout.

Process canon cross-link: `docs/project-tracking/GITHUB-PROJECTS.md` (Night-shift →
Chain promote).

## Prep ritual (before an unattended chain)

Operator + orchestrator (daytime):

1. Wire **native blocked-by** edges on the board (UI or API) — do **not** invent
   body-text `Blocked-by:` conventions.
2. Label each waiting successor `night-shift:chain`.
3. Ensure each successor has `plan:ready` (Planner) before you expect promotion.
4. After a blocker closes/merges, the product-repo workflow promotes eligible
   dependents; night-shift then picks them up on a later run under the usual gate.

## Labels

| Label | Role in the chain |
|-------|-------------------|
| `night-shift:chain` | Waiting in a chain; not yet eligible. Dropped on promote. |
| `plan:ready` | Required for promote and for night-shift execute. |
| `night-shift:ready` | Applied by the workflow when the promote rule clears. |
| `needs:decision` | Blocks promote (and night-shift). |
| `type:epic` | Never promoted / never night-shifted. |

## Non-goals

- Night-shift merging.
- Prompt-only or agent-side chain promotion.
- Body-text `Blocked-by:` parsing.
- Auto-applying `night-shift:ready` without `plan:ready`.
- Planner-inside-Actions.

## Verify

- Merge routing: **tests-only** (docs)
- Facts match #214 ADR + #215 template / canon
- Links resolve; no edits to `GITHUB-PROJECTS.md` Autonomy on this branch (#217)
