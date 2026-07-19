---
name: merge-pr
description: >-
  Operator-side PR merge flow — triage an open PR, confirm operator-owned smoke when
  owed, squash-merge, confirm the board moved, hand off worktree/branch cleanup to
  /prune. Use when the user says "merge PR #N", "review and merge", "process the
  review queue", or the morning after /night-shift leaves PRs. Pairs with
  /finish-feature and /prune.
---

# Merge PR (any stack)

> Companion: [/finish-feature](../finish-feature/SKILL.md) opens PRs; [/night-shift](../night-shift/SKILL.md)
> leaves them overnight **unreviewed** (morning batch — not chip as-they-open review);
> [/prune](../prune/SKILL.md) cleans Cursor + Claude (chip `claude/*` and night-shift
> `feat|fix|docs/*`) worktrees after squash. This skill is the operator's side of the
> handshake — **nothing merges without it**. Repo / test command / default branch come from
> this repo's `docs/project-tracking/GITHUB-PROJECTS.md` config block.

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
gh pr view <n> --repo <owner>/<repo> --json title,body,isDraft,mergeable,mergeStateStatus,statusCheckRollup,headRefName,headRefOid
gh pr diff <n> --repo <owner>/<repo> --name-only     # full diff only if the file list warrants it
```

Capture `headRefOid` (reviewed head). Pre-merge `mergeable` / `mergeStateStatus` (REST:
`mergeable_state`) — including **clean** — are **advisory**; see §3. Read the body's
**Verification** (exact test counts + crucible merge-readiness signal) and **Operator
actions** sections. Then pick the depth:

- **Merge on review alone** — CI green, crucible signal `Ready`, small or mechanical diff, no
  operator actions owed.
- **Local checkout owed** — checks red/absent for the touched path, Operator actions ask for it,
  a night-shift PR touching anything beyond its slice, or the diff smells.
- **Manual test owed** — the issue's verify plan declared `local-smoke`, or a UI/behavioral
  change has thin automated coverage. The routing was decided at kickoff (`/start-feature`
  step 5) — read it off the issue; re-derive only if it's missing, and say so. Where it runs:
  - Runnable **locally from the branch** (launch the app, click the affected flow) → do it
    **pre-merge** (step 2); the PR keeps `Closes #` and merges done-done.
  - Only against the **live / deployed system** (hardware, brokers, a real CygNet, production
    data) → don't fake it locally. Merge with `Refs #`, move the issue to **Verifying**, and
    close it after the live confirmation. That's what the state is for.

## 2. Smoke + checkout (when owed)

### Default — operator-owned smoke

Daytime flow: the **operator** already smoked in the feature worktree (Explorer, local
`dotnet` / `npm run dev`, click-path from the issue). Before merge:

1. Confirm with the operator that smoke already happened (or that routing is `tests-only` /
   merge-on-review and no smoke is owed).
2. **Do not** launch the app, prep a throwaway worktree for clicking, or drive a browser
   unless they explicitly ask.

### Optional — agent-prepped smoke (only when asked)

Use when the operator requests it (unfamiliar night-shift PR, `local-smoke` they have not
run yet, "set me up"):

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

**Manual smoke prep:** launch the app from that same worktree using the **Manual smoke**
entry in `GITHUB-PROJECTS.md`, then hand the operator the click-path — which screen, which
action, what correct looks like — derived from the issue's verify plan and the PR's
Verification section. The agent preps the environment and the checklist; **the operator does
the clicking.** Hold the merge until they call it good.

Throwaway `../pr-<n>` trees are removed in this step when you created them. The **feature**
worktree from `/start-feature` is **not** deleted here — that is [/prune](../prune/SKILL.md).

## 3. Conflicts / stale branch — mergeable is advisory

Pre-merge `mergeable` / `mergeable_state` (GraphQL `mergeStateStatus`) — including **clean** —
are **advisory**. A neighbor PR can land after triage; GitHub may still show clean until the
merge call returns **405** / "Pull Request is not mergeable" / has conflicts. The **merge API
response** is the truthy check — do not trust a stale clean.

Send back through `/finish-feature` step 2 (rebase + re-verify on the feature branch), then
re-triage here, when:

- triage shows `CONFLICTING` / dirty, **or**
- the default branch moved under a PR whose tests matter, **or**
- the merge attempt (CLI or REST) fails with conflicts / 405.

Do not resolve conflicts inside the merge step.

## 4. Merge

Squash-always (§0). Merge only with checks green — or say which check you're waiving and why.
**Do not pass `--delete-branch`.** Remote tip removal is `delete_branch_on_merge` (§0); local
branch **and** worktree are `/prune` (§5). That split stops merge-pr from deleting a branch
still checked out in a chip worktree (the "Permission denied" leftover that looks like
merge-pr is pruning).

### 4a. When to use REST (§4c)

```bash
gh api rate_limit --jq '.resources.graphql.remaining'
```

Use §4c when **either**:

- `graphql.remaining == 0` (or `gh pr merge` fails on a GraphQL / API rate error) — prefer REST
  even if `gh pr merge` might still attempt GraphQL; or
- you want the **`sha=` pin** (merges exactly the reviewed head) — REST is the preferred path
  for that upgrade, quota healthy or not.

Companion quota doctrine: board Status edits are best-effort when GraphQL is dead
(`GITHUB-PROJECTS.md` / #233).

### 4b. Default — `gh pr merge` (GraphQL available, pin not required)

```bash
gh pr merge <n> --repo <owner>/<repo> --squash
```

Squash commit title = PR title `(#n)`; body = PR body, so `Closes #issue` auto-closes on merge.
If this returns conflicts / 405 → §3 (not a force-merge).

### 4c. REST squash path (quota outage or sha pin)

Triage via REST, then `PUT .../merge` with **required** `sha=` of that reviewed head. If the
tip moved after review, the API rejects instead of squash-merging an unreviewed SHA. (`gh api
--jq` only — no extra `jq` binary.)

**Triage (advisory fields + reviewed head):**

```bash
gh api repos/<owner>/<repo>/pulls/<n> \
  --jq '{title, mergeable, mergeable_state, sha: .head.sha, headRefName: .head.ref}'
```

**Merge (squash + sha pin):**

```bash
SHA=$(gh api repos/<owner>/<repo>/pulls/<n> --jq .head.sha)
TITLE=$(gh api repos/<owner>/<repo>/pulls/<n> --jq .title)
# commit_message = full PR body (Closes # rides with it); pass via --input when the body
# has newlines that break -f on your shell
gh api -X PUT repos/<owner>/<repo>/pulls/<n>/merge \
  -f merge_method=squash \
  -f "commit_title=${TITLE} (#<n>)" \
  -f "commit_message=$(gh api repos/<owner>/<repo>/pulls/<n> --jq .body)" \
  -f "sha=${SHA}"
```

- `merge_method=squash` only — same policy as §0 / §4b.
- **`sha=` is required** on this path (use the `SHA` captured from the tip you reviewed).
- On 405 / conflicts → §3 (`/finish-feature` rebase), not a retry without rebase.

## 5. Board + prune handoff

- `Closes #` PR → the board workflow auto-moves the issue to **Done**. Verify it actually moved.
- `Refs #` PR (live retest owed) → move the issue to **Verifying** yourself; it reaches Done only
  after live confirmation.
- **Cleanup is a handoff, not an in-place delete:** tell the operator to run `/prune` (dry-run)
  then `/prune --apply` from the **main clone** (and, after a night-shift batch, from the
  Actions `_work` checkout if trees remain). If this session's cwd is inside the feature
  worktree just merged, say so explicitly — do not attempt `git worktree remove` on the tree
  you are standing in. Cursor Archive / Claude delete do **not** replace `/prune` for
  `%USERPROFILE%\.cursor\worktrees\<repo>\<issue#>-*` or `.claude/worktrees/` paths. If prune
  hits Permission denied on an eligible row, see [/prune](../prune/SKILL.md) §5a —
  leftover `cursor-agent-worker` may hold `--worker-dir`; `/prune --apply` kills matching
  PIDs (no second ask) and re-removes.

## Honesty bar

Never merge over red checks silently. Name any verification you skipped ("merged on review alone,
no local run"). Distinguish **merged** from **merged and live-verified** — that's what Verifying
is for. Distinguish **merged** from **pruned** — leftover worktrees after squash are expected
until `/prune --apply`.
