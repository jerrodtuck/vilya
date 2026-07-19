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

- Labeled `night-shift:ready` (operator opt-in: safe to execute unattended).
- Labeled `plan:ready` (kickoff + verify plan already on the issue — unattended does not skip planning).
- Not labeled `needs:decision` and not an `type:epic`.
- Has a clear brief and acceptance in the issue body — enough to build without guessing.
- Priority set; take highest priority, then oldest.

**Do not promote successors.** Issues labeled only `night-shift:chain` are **not** eligible —
leave them alone. Promotion (`night-shift:chain` → `night-shift:ready` when native blocked-by
blockers close) is owned by the product repo's `chain-promote.yml` workflow (portable template:
`docs/project-tracking/templates/chain-promote.yml`), not by this skill and not by overnight
prompt logic. One chain link per merge cycle is the expected cadence.

No eligible issue → post "nothing eligible tonight" and stop. Take issues one at a time; loop back to
step 1 only if budget remains (see §6).

## 2. Run the daytime chain (do not re-teach setup)

For the chosen issue, invoke the skills — worktrees, branches, board Status, verify plan, and merge
routing are owned by `/start-feature`, not by this skill:

1. **`/start-feature #<n>`** — issue, worktree, branch, In Progress, verify plan on the issue.
   Branches are **daytime-style** `feat|fix|docs/<issue#>-slug` under `.claude/worktrees/`
   (Actions `_work` checkout). **Not** chip `claude/*` branches — `/prune` expects that pairing.
2. **Implement** in the owning vertical slice (VSA + SOLID bar = daytime).
3. **`/crucible-<stack>`** from config (`crucible-blazor` | `crucible-nextjs`): apply top
   remediations, re-review until **Ready** — cap at **3 refactor rounds**, then stop and report.
4. **`/finish-feature`** — tests green, changelog fragment, open the PR.
5. **Detach the worktree** before the next issue — from the Actions checkout root (not inside the
   feature tree): `git worktree remove <path>` and `git branch -D <local branch>`. Leave the
   **remote** branch + open PR alone. Self-hosted `_work` persists between runs; do not leave
   trees piled up for morning `/prune` unless remove fails (then report the path).

**Unattended consult:** when a real design fork appears during start-feature or implementation —
including an **Investigate-first / hard-stop** unknown (SDK surface, third-party behavior) — do
**not** wait for the operator. Comment options + your recommendation on the issue, label
`needs:decision`, move to **Blocked**, and take the next eligible issue. Do **not** auto-pick
because findings look obvious. (Daytime interactive consult still waits on the kickoff's
investigate-first section; only this unattended path uses `needs:decision` instead of waiting —
see [/chip](../chip/SKILL.md) §2a.)

## 3. Never merge — always leave a PR

- Open the PR (`Closes #<n>` if done-done, `Refs #<n>` → **Verifying** if a live retest is owed —
  read the issue's declared merge routing; never downgrade `live-only` to `Closes #`).
- **Never merge, never force-push a shared branch, never push to the default branch.** You open the
  PR; the operator merges in the morning (via `/merge-pr`).
- **Morning review queue, not chip-style as-they-open review.** Chip PRs are reviewed when each
  chip finishes; night-shift PRs land **unreviewed overnight**. The morning report is the triage
  list — operator `/merge-pr` (or reject) after waking. Do not assume anyone watched the run.

## 4. Guardrails (hard limits)

- Touch only application code inside the slice. **No** secrets, CI/CD, infra, deploy scripts, or
  dependency-version bumps unless the issue is explicitly about that and labeled
  `night-shift:ready` (and still meets §1 eligibility, including `plan:ready`).
- Do **not** edit `docs/project-tracking/GITHUB-PROJECTS.md` on a feature branch unless the issue is
  about that config.
- Scope cap: if the change balloons past a reasonable single-PR size, or the tests won't go green
  after honest effort, **stop, push the WIP branch, and report**.
- One issue = one branch = one PR. Don't batch unrelated changes.
- Bugs found mid-work → new linked Bug issue (`/update-docs`), don't derail the current one.

## 5. Morning report — the point of the whole thing

Wake the operator to a **review queue** (these PRs have not been human-reviewed yet — unlike
chips). Post a digest (issue comments and/or a standing "Night shift log" issue) covering, per
issue:

- **PR opened** — link, test counts, readiness signal, anything deferred.
- **Needs your call** — the fork you stopped at + your recommendation.
- **Stuck** — what failed, where the WIP branch is, your best guess at the cause.
- **Skipped** — ineligible issues and why.
- **Cleanup** — any worktree you could not detach (path under `_work`).

Plain, honest, skimmable. If nothing shipped, say so and why.

## 6. Budget

Default: up to **3 issues** per run, or stop earlier on a time/token budget. Prefer finishing one
issue cleanly over starting three messily.

## One-time setup this skill assumes

- Labels: `night-shift:ready`, `plan:ready`, `night-shift:chain`, `needs:decision` (plus Planner
  enqueue `needs:plan` used in daytime prep — not required on the issue at pick time if
  `plan:ready` is already on).
- Prep ritual (operator + orchestrator, before the unattended window): scope issues → Planner
  (`needs:plan` → `plan:ready`) → label `night-shift:ready` on the head of tonight's path.
  For a daisy chain: set native **blocked-by** edges, label successors `night-shift:chain`, and
  ensure each successor already has `plan:ready` before you expect `chain-promote.yml` to flip
  them to `night-shift:ready` after a blocker closes.
- GitHub Actions workflows on the **product** repo — `night-shift.yml` (this loop) and, for
  chains, `chain-promote.yml` (promotion only). Per-repo bits (runner, `CLAUDE_CODE_OAUTH_TOKEN`)
  are noted in that repo's config-only `GITHUB-PROJECTS.md`; process canon lives in Vilya's
  `docs/project-tracking/GITHUB-PROJECTS.md` and its workflow templates. Manual
  `workflow_dispatch` until schedule is proven.
- Repo access + `gh` auth available to the Actions job (`CLAUDE_CODE_OAUTH_TOKEN` + `GH_TOKEN`).
