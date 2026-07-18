---
name: night-shift
description: Autonomous overnight loop — pick the next eligible board issue and drive the daytime chain (start-feature → implement → crucible → finish-feature) without a human, stopping at any real decision fork. Meant to be launched by GitHub Actions while you sleep. Opens PRs, never merges. Leaves a morning report.
---

# Night Shift — autonomous loop

You are running **unattended** (GitHub Actions / headless Claude; the operator is asleep). Your job:
move one or more **eligible** issues as far toward a mergeable PR as you honestly can, then leave a
clear morning report. You are **not** a second methodology — you run the **same daytime chain**.

Read the product repo's `docs/project-tracking/GITHUB-PROJECTS.md` for owner / repo / project /
labels / **stack** / **test command** / **crucible variant**.

## 0. Preflight — abort loudly, never silently

Before touching any issue, confirm you can actually do the work:

- `git`, `gh` (authenticated), and the repo are available; the repo's **test command** runs.
- If any of these is missing, **do not fake progress.** Post one report ("night shift could not
  start: <reason>") and stop. A no-op is fine; a fabricated "done" is not.

## 1. Pick ONE eligible issue

Eligible = **all** of:

- Labeled `auto:ready` (the operator's opt-in that this issue is safe to do unattended).
- Not labeled `needs:decision` and not an `type:epic`.
- Has a clear brief and acceptance in the issue body — enough to build without guessing.
- Priority set; take highest priority, then oldest.

No eligible issue → post "nothing eligible tonight" and stop. Take issues one at a time; loop back to
step 1 only if budget remains (see §6).

## 2. Run the daytime chain (do not re-teach setup)

For the chosen issue, invoke the skills — worktrees, branches, board Status, verify plan, and merge
routing are owned by `/start-feature`, not by this skill:

1. **`/start-feature #<n>`** — issue, worktree, branch, In Progress, verify plan on the issue.
2. **Implement** in the owning vertical slice (VSA + SOLID bar = daytime).
3. **`/crucible-<stack>`** from config (`crucible-blazor` | `crucible-nextjs`): apply top
   remediations, re-review until **Ready** — cap at **3 refactor rounds**, then stop and report.
4. **`/finish-feature`** — tests green, changelog fragment, open the PR.

**Unattended consult:** when a real design fork appears during start-feature or implementation, do
**not** wait for the operator. Comment options + your recommendation on the issue, label
`needs:decision`, move to **Blocked**, and take the next eligible issue. (Daytime interactive
consult still waits; only this unattended path skips the wait.)

## 3. Never merge — always leave a PR

- Open the PR (`Closes #<n>` if done-done, `Refs #<n>` → **Verifying** if a live retest is owed —
  read the issue's declared merge routing; never downgrade `live-only` to `Closes #`).
- **Never merge, never force-push a shared branch, never push to the default branch.** You open the
  PR; the operator merges in the morning (via `/merge-pr`).

## 4. Guardrails (hard limits)

- Touch only application code inside the slice. **No** secrets, CI/CD, infra, deploy scripts, or
  dependency-version bumps unless the issue is explicitly about that and labeled `auto:ready`.
- Do **not** edit `docs/project-tracking/GITHUB-PROJECTS.md` on a feature branch unless the issue is
  about that config.
- Scope cap: if the change balloons past a reasonable single-PR size, or the tests won't go green
  after honest effort, **stop, push the WIP branch, and report**.
- One issue = one branch = one PR. Don't batch unrelated changes.
- Bugs found mid-work → new linked Bug issue (`/update-docs`), don't derail the current one.

## 5. Morning report — the point of the whole thing

Wake the operator to a **review queue**. Post a digest (issue comments and/or a standing "Night
shift log" issue) covering, per issue:

- **PR opened** — link, test counts, readiness signal, anything deferred.
- **Needs your call** — the fork you stopped at + your recommendation.
- **Stuck** — what failed, where the WIP branch is, your best guess at the cause.
- **Skipped** — ineligible issues and why.

Plain, honest, skimmable. If nothing shipped, say so and why.

## 6. Budget

Default: up to **3 issues** per run, or stop earlier on a time/token budget. Prefer finishing one
issue cleanly over starting three messily.

## One-time setup this skill assumes

- Labels: `auto:ready`, `needs:decision`.
- GitHub Actions workflow on the **product** repo — the per-repo bits (workflow file, runner,
  `CLAUDE_CODE_OAUTH_TOKEN` secret) are noted in that repo's config-only `GITHUB-PROJECTS.md`;
  the process itself is canonical in Vilya's `docs/project-tracking/GITHUB-PROJECTS.md` and its
  workflow templates. Manual `workflow_dispatch` until schedule is proven.
- Repo access + `gh` auth available to the Actions job (`CLAUDE_CODE_OAUTH_TOKEN` + `GH_TOKEN`).
