---
name: start-feature
description: Kick off a new feature or work stream on any repo's GitHub Projects board. Use when the user says "start on <feature/brief>", "pick up issue #N", "begin the <X> work", "work the next thing", or points at an issue. Sets up the issue, branch, and consult-first flow; pairs with /finish-feature.
---

# Start Feature (any stack)

> **Scope:** Internal dev-process skill for a VSA-structured .NET repo. Companion:
> [/finish-feature](../finish-feature/SKILL.md). Tracking model + this repo's project ids/labels:
> `docs/project-tracking/GITHUB-PROJECTS.md`.

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
- Ambiguous which issue → ask.
- Move to **In Progress** (or **Blocked** if kickoff is stuck on an external dependency).

## 2. Set up the worktree

1. Fetch the default branch (`git remote show origin` if unsure it's `master`/`main`); branch
   `feat/<issue#>-slug`, `fix/<issue#>-slug`, or `docs/<issue#>-slug`.
   `git config core.longpaths true` on Windows / a new worktree.
2. Non-trivial design → `docs/specs/<slug>.md` linked from the issue (design doc, not tracker).
3. Read the real architecture around the change — prefer the owning **vertical slice**. Do not
   invent layer-cake or dumping-ground folders (.NET `Controllers/`·`Services/`·`Repositories/`, or
   a flat `components/`·`utils/` in JS/TS) for a feature.

## 3. Consult at decision forks — before implementing

For scoped/complex work, surface 2–3 viable mechanisms, their costs, and silent breakages.
Recommend one. Trivial work → build.

## 4. Working rules

- **The issue is the shared state.** Progress in issue comments / PR body — not markdown trackers.
- **New defect mid-work** → new Bug issue, link it, keep going.
- **VSA non-negotiable:** feature logic lives in its slice; the shared kernel holds
  contracts/primitives only; no coupling across product or feature boundaries (in .NET, no
  `ProjectReference` into a sibling product; in JS/TS, no cross-feature internal imports).
- **Crucible is mandatory before finish:** after implementation and green tests, run the stack
  crucible skill (`/crucible-blazor` for .NET/Blazor, `/crucible-nextjs` for Next.js) — not a
  verbal "hold the bar." Apply 🔴/🟠 remediations until merge-readiness is `Ready` (or
  `Ready after blockers` with blockers fixed). Then [/finish-feature](../finish-feature/SKILL.md).

## 5. Verify plan up front

State how the feature will be verified: which test projects, and any live / integration smoke owed
against external systems (hardware, brokers, databases, third-party services). Then build.
Close path: **tests green → `/crucible-<stack>` → remediate → `/finish-feature`**.
