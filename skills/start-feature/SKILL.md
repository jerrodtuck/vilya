---
name: start-feature
description: Kick off a new feature or work stream on any repo's GitHub Projects board. Use when the user says "start on <feature/brief>", "pick up issue #N", "begin the <X> work", "work the next thing", or points at an issue. Sets up the issue, branch, and consult-first flow; pairs with /finish-feature.
---

# Start Feature (any stack)

> **Scope:** Internal dev-process skill for a VSA-structured product repo. Companion:
> [/finish-feature](../finish-feature/SKILL.md). Tracking model + this repo's project ids/labels /
> optional Models: `docs/project-tracking/GITHUB-PROJECTS.md`.

All repo / project / label values come from this repo's `GITHUB-PROJECTS.md` **Repo config** block.
If the repo isn't already known, detect it:
`gh repo view --json nameWithOwner -q .nameWithOwner`.

## 1. Get the issue — it is the brief

- **Arguments name an issue #** → `gh issue view <n> --repo <owner>/<repo>`.
- **No issue yet** → create it, then add it to the board explicitly:
  ```bash
  url=$(gh issue create --repo <owner>/<repo> --title "<title>" --body "<context>" \
    --label type:feature --label priority:high --label area:<slice>)
  gh project item-add <n> --owner <owner> --url "$url"
  ```
  Use the owner, project number, and `area:*` labels from
  `docs/project-tracking/GITHUB-PROJECTS.md`.
  Defect → `type:bug`; feature → `type:feature`; multi-stream → `type:epic` with sub-issues.
- Extends an in-flight epic → link as **sub-issue** (`addSubIssue`).
- Ambiguous which issue → ask (unless invoked by [/night-shift](../night-shift/SKILL.md) —
  then skip and take a clearly eligible issue only).
- Move to **In Progress** (or **Blocked** if kickoff is stuck on an external dependency).

## 2. Set up the worktree

1. Fetch the default branch (`git remote show origin` if unsure it's `master`/`main`); branch
   `feat/<issue#>-slug`, `fix/<issue#>-slug`, or `docs/<issue#>-slug`.
   `git config core.longpaths true` on Windows / a new worktree.
   - Cursor daytime: `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-<slug>`
   - Prefer never coding in the main clone when a parallel stream exists.
2. Non-trivial design → `docs/specs/<slug>.md` linked from the issue (design doc, not tracker).
   Include **`Created: YYYY-MM-DD`** and the owning issue link in the spec body.
3. Read the real architecture around the change — prefer the owning **vertical slice**. Do not
   invent layer-cake or dumping-ground folders (.NET `Controllers/`·`Services/`·`Repositories/`, or
   a flat `components/`·`utils/` in JS/TS) for a feature.

## 3. Plan phase → then execute phase

Read optional **Planning model** / **Execution model** from `GITHUB-PROJECTS.md`.

**Cursor Plan mode is operator-gated.** Switching into Plan mode requires a human accept in the UI.
If nobody accepts, the agent **never entered** Plan mode — do not assume the switch succeeded, and
do not write as if Plan mode is active when it is not.

1. **Plan phase** — produce the verify plan (step 5) and any design-fork consult; write the kickoff
   comment on the issue; **do not implement yet.** How you run that phase:
   - **Cursor, operator accepts Plan mode:** stay in / switch to Plan mode (planning model if set).
   - **Cursor, unattended or accept unavailable (daytime fallback):** plan on the issue kickoff
     comment and/or in-chat **without** a mode switch. Stay on the execution model. Same artifacts;
     never pretend Plan mode ran.
   - **Claude:** use the planning model.
2. **Stop for model switch** (daytime) — only when a real Plan-mode session (or planning-model
   handoff) actually ran: tell the operator to switch to the execution model before coding.
   Skip the stop when (a) night-shift / Actions — planning is locked via the issue body and
   `auto:ready`, build on the execution-class model for the whole run; or (b) Cursor daytime
   fallback above — no mode switch happened, so proceed to execute after the kickoff plan is written.
3. **Execute phase** — implement only after the plan is settled.

## 4. Consult at decision forks — before implementing

For scoped/complex work, surface 2–3 viable mechanisms, their costs, and silent breakages.
Recommend one.

- **Daytime:** wait for the operator's call.
- **Unattended (night-shift):** do not wait — comment options + recommendation, label
  `needs:decision`, move to **Blocked**, and return control to night-shift for the next issue.

Trivial work → build.

## 5. Working rules

- **The issue is the shared state.** Progress in issue comments / PR body — not markdown trackers.
- **New defect mid-work** → new Bug issue (`/update-docs`), link it, keep going.
- Do **not** edit `docs/project-tracking/GITHUB-PROJECTS.md` on a feature branch unless this issue
  is about that config.
- **VSA non-negotiable:** feature logic lives in its slice; the shared kernel holds
  contracts/primitives only; no coupling across product or feature boundaries (in .NET, no
  `ProjectReference` into a sibling product; in JS/TS, no cross-feature internal imports).
- **Crucible is mandatory before finish:** after implementation and green tests, run the stack
  crucible skill (`/crucible-blazor` for .NET/Blazor, `/crucible-nextjs` for Next.js) — not a
  verbal "hold the bar." Apply 🔴/🟠 remediations until merge-readiness is `Ready` (or
  `Ready after blockers` with blockers fixed). Then [/finish-feature](../finish-feature/SKILL.md).

## 6. Verify plan up front — including merge routing

State how the feature will be verified, **on the issue** (kickoff comment), so finish and merge
read it instead of re-deciding:

- Which test projects / suites.
- **Merge routing** — one of:
  - `tests-only` — automated coverage is the whole story; PR will use `Closes #`.
  - `local-smoke` — a hands-on check is owed but runs locally (launch the app, drive the flow);
    done **pre-merge** via `/merge-pr`; PR still uses `Closes #`.
  - `live-only` — verification needs the live / deployed system (hardware, brokers, real CygNet);
    PR will use `Refs #` → **Verifying** → Done after live confirmation.

Then build (after the execute-phase switch in daytime). Close path: **tests green →
`/crucible-<stack>` → remediate → `/finish-feature` → operator merges via `/merge-pr`**.
