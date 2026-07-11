---
name: night-shift
description: Autonomous overnight loop — pick the next eligible board issue and drive it start → implement → crucible review → refactor → PR without a human, stopping at any real decision fork. Meant to be launched by a scheduled task while you sleep. Opens PRs, never merges. Leaves a morning report.
---

# Night Shift — autonomous loop

You are running **unattended** (a scheduled task fired this session; the operator is asleep). Your
job: move one or more **eligible** issues from the board as far toward a mergeable PR as you honestly
can, then leave a clear report for the morning. You are the whole loop tonight — but a cautious one.

Read the repo's `docs/project-tracking/GITHUB-PROJECTS.md` config block for owner / repo / project /
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
step 1 only if budget remains (see §7).

## 2. Run the loop (the same one you run by day)

1. Move the issue to **In Progress**. Branch `feat|fix/<issue#>-slug`.
2. Read the owning **slice**. Build the change there — VSA + SOLID bar applies exactly as in daytime.
3. **crucible review** (`<crucible variant>`): apply the top refactors, re-review, loop until
   the signal reads **Ready** — cap at **3 refactor rounds**, then stop and report where it stands.
4. Run the repo's **test command**. Green (and clean build/typecheck where that's the gate) is
   required to open a PR as ready.
5. **finish-feature**: write the `changelog.d/` fragment, open the PR.

## 3. The hard stop — decision forks

If a **real design fork** appears (2–3 mechanisms with materially different, hard-to-reverse
tradeoffs), **do not guess.**

- Post the options + your recommendation as an issue comment.
- Label the issue `needs:decision`, move it to **Blocked**, and move on to the next eligible issue.

Guessing on a reversible detail is fine; guessing on architecture, data shape, public contracts, or
anything you'd normally consult on is not.

## 4. Never merge — always leave a PR

- Open the PR (`Closes #<n>` if done-done, `Refs #<n>` → **Verifying** if a live retest is owed —
  read the issue's declared merge routing; never downgrade `live-only` to `Closes #`).
- **Never merge, never force-push a shared branch, never push to the default branch.** You open the
  PR; the operator merges in the morning after review (via `/merge-pr`).

## 5. Guardrails (hard limits)

- Touch only application code inside the slice. **No** secrets, CI/CD, infra, deploy scripts, or
  dependency-version bumps unless the issue is explicitly about that and labeled `auto:ready`.
- Scope cap: if the change balloons past a reasonable single-PR size, or the tests won't go green
  after honest effort, **stop, push the WIP branch, and report** — don't grind or hack around it.
- One issue = one branch = one PR. Don't batch unrelated changes.
- Bugs found mid-work → new linked Bug issue (`/update-docs`), don't derail the current one.

## 6. Morning report — the point of the whole thing

You wake the operator to a **review queue**, not a mystery. Post a single digest (issue comment on
each worked issue, and/or a short comment on a standing "Night shift log" issue) covering, per issue:

- ✅ **PR opened** — link, test counts, readiness signal, anything deferred.
- 🟡 **Needs your call** — the fork you stopped at + your recommendation.
- 🔴 **Stuck** — what failed, where the WIP branch is, your best guess at the cause.
- ⏭️ **Skipped** — ineligible issues and why.

Plain, honest, skimmable. If nothing shipped, say so and why.

## 7. Budget

Default: up to **3 issues** per run, or stop earlier on a time/token budget. Prefer finishing one
issue cleanly over starting three messily.

## One-time setup this skill assumes

- Two labels on the board: `auto:ready` (operator marks an issue safe for unattended work) and
  `needs:decision` (the loop sets this when it hits a fork).
- A scheduled task that launches this skill nightly (see the orchestrator canvas "Night shift" flow).
- Repo access + `gh` auth available to the scheduled session (a scoped token, or a GitHub-side runner).
