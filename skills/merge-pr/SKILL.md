---
name: merge-pr
description: Operator-side PR merge flow — triage an open PR, fast-checkout and test when warranted, squash-merge, confirm the board moved, clean up branches/worktrees. Use when the user says "merge PR #N", "review and merge", "process the review queue", or the morning after /night-shift leaves PRs. Pairs with /finish-feature.
---

# Merge PR (any stack)

> Companion: [/finish-feature](../finish-feature/SKILL.md) opens PRs; [/night-shift](../night-shift/SKILL.md)
> leaves them overnight. This skill is the operator's side of the handshake — **nothing merges
> without it**. Repo / test command / default branch come from this repo's
> `docs/project-tracking/GITHUB-PROJECTS.md` config block.

## 0. Policy — squash, always

One issue = one branch = one PR = **one commit on the default branch**. Squash-merge every PR:

- The default branch's history reads like the changelog — one commit per issue, `(#PR)` suffix,
  and the PR body (with its `Closes #issue`) rides into the commit message.
- Branch WIP commits ("fix typo", "crucible remediations", agent checkpoints) are noise; the PR
  preserves them if you ever need the archaeology.
- Revert = revert one commit.

A **merge commit** is justified only when the branch's commit-by-commit history is itself the
deliverable — which this model avoids by design (epics fan out into per-sub-issue PRs). Never
rebase-merge: it multiplies commits on the default branch without adding the PR back-reference.

One-time repo setting (do once per repo, then `gh pr merge --squash` is the only path):

```bash
gh api -X PATCH repos/<owner>/<repo> \
  -F allow_squash_merge=true -F allow_merge_commit=false -F allow_rebase_merge=false \
  -F delete_branch_on_merge=true \
  -f squash_merge_commit_title=PR_TITLE -f squash_merge_commit_message=PR_BODY
```

## 1. Triage before you checkout

Most PRs from this loop don't need a local checkout — the PR body already carries the evidence.

```bash
gh pr view <n> --repo <owner>/<repo> --json title,body,isDraft,mergeable,statusCheckRollup,headRefName
gh pr diff <n> --repo <owner>/<repo> --name-only     # full diff only if the file list warrants it
```

Read the body's **Verification** (exact test counts + crucible merge-readiness signal) and
**Operator actions** sections. Then pick the depth:

- **Merge on review alone** — CI green, crucible signal `Ready`, small or mechanical diff, no
  operator actions owed.
- **Local checkout owed** — checks red/absent for the touched path, Operator actions ask for it,
  a night-shift PR touching anything beyond its slice, or the diff smells.
- **Manual test owed** — the issue's verify plan declared `local-smoke`, or a UI/behavioral
  change has thin automated coverage. The routing was decided at kickoff (`/start-feature`
  step 5) — read it off the issue; re-derive only if it's missing, and say so. Where it runs:
  - Runnable **locally from the branch** (launch the app, click the affected flow) → do it
    **pre-merge** in the checkout below; the PR keeps `Closes #` and merges done-done.
  - Only against the **live / deployed system** (hardware, brokers, a real CygNet, production
    data) → don't fake it locally. Merge with `Refs #`, move the issue to **Verifying**, and
    close it after the live confirmation. That's what the state is for.

## 2. Fast checkout + test (when owed)

Fastest when your main clone is clean:

```bash
gh pr checkout <n>            # then run the repo's Test command
```

**Isolated (default in the one-issue-one-worktree model)** — a throwaway worktree leaves every
in-flight branch untouched, and `pull/<n>/head` works even for fork PRs:

```bash
git fetch origin pull/<n>/head:pr-<n>
git worktree add ../pr-<n> pr-<n>
# install deps first if the stack needs it — a fresh worktree has none
# (`npm ci` for Node; `dotnet test` restores automatically)
# then run the Test command from GITHUB-PROJECTS.md inside ../pr-<n>
git worktree remove ../pr-<n> && git branch -D pr-<n>
```

Report exact counts, same bar as `/finish-feature` step 1.

**Manual smoke (pre-merge):** launch the app from that same worktree using the **Manual smoke**
entry in `GITHUB-PROJECTS.md`, then hand the operator the click-path — which screen, which
action, what correct looks like — derived from the issue's verify plan and the PR's Verification
section. The agent preps the environment and the checklist; **the operator does the clicking.**
Hold the merge until they call it good.

## 3. Conflicts / stale branch

If `mergeable` is `CONFLICTING` or the default branch moved under a PR whose tests matter: don't
resolve inside the merge step. Send it back through `/finish-feature` step 2 (rebase + re-verify
on the feature branch), then re-triage here.

## 4. Merge

```bash
gh pr merge <n> --repo <owner>/<repo> --squash --delete-branch
```

- Squash commit title = PR title `(#n)`; body = PR body, so `Closes #issue` auto-closes on merge.
- Merge only with checks green — or say explicitly which check you're waiving and why.
- Running /merge-pr from the PR branch's **own worktree**? `--delete-branch` conflicts with the
  active checkout — merge with `--squash` alone and delete the remote branch separately
  (`git push origin --delete <branch>`); the local worktree/branch cleanup happens per step 5
  once you're off the branch.

## 5. Board + cleanup

- `Closes #` PR → the board workflow auto-moves the issue to **Done**. Verify it actually moved.
- `Refs #` PR (live retest owed) → move the issue to **Verifying** yourself; it reaches Done only
  after live confirmation.
- Local hygiene: remove the feature worktree, delete the local branch, `git fetch --prune`.

## Honesty bar

Never merge over red checks silently. Name any verification you skipped ("merged on review alone,
no local run"). Distinguish **merged** from **merged and live-verified** — that's what Verifying
is for.
