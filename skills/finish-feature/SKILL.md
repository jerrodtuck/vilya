---
name: finish-feature
description: Close out a feature branch on any stack — tests green, PR that Closes the issue, spec status, changelog fragment. Use when the user says "wrap up", "finish the feature", "ship it", "open the PR", or the implementation work on an issue is done. Pairs with /start-feature.
---

# Finish Feature (any stack)

> Companion: [/start-feature](../start-feature/SKILL.md). Tracking + this repo's ids/labels:
> `docs/project-tracking/GITHUB-PROJECTS.md`.

Run in order. Repo / test command / label values come from this repo's `GITHUB-PROJECTS.md` config
block. Nothing here is stack-specific — it drives .NET, Next.js, or any repo with a test command.

## 1. Suites green — state the counts

Run this repo's **Test command** from the `GITHUB-PROJECTS.md` config block — for example:

```bash
dotnet test                    # Blazor / .NET repo
npm test && npm run build      # Next.js repo (typecheck/build counts too)
```

Report exact counts (and a clean typecheck/build where that's the gate). Name any pre-existing
failures with evidence. Failing tests / build = not finished.

## 2. Rebase onto the fresh default branch

`git fetch origin` and rebase (or merge) onto `origin/<default-branch>`. Re-verify build/tests if it
moved.

## 3. Spec + issue reflect shipped vs remaining

- Update `docs/specs/<slug>.md` status if present.
- Remaining work → follow-up issues on the board (not prose-only).
- Do not claim Complete on unit tests alone when a live / integration retest is owed.

## 4. One changelog fragment

Write `docs/project-tracking/changelog.d/YYYY-MM-DD-<slug>.md`. **Never edit CHANGELOG.md** on the
feature branch.

## 5. Crucible review — run the skill

**Do not skip.** Invoke the stack crucible skill and follow its output:

- .NET / Blazor → `/crucible-blazor` (skill: `crucible-blazor`)
- Next.js → `/crucible-nextjs` (skill: `crucible-nextjs`)

Apply 🔴 blockers and 🟠 should-fix remediations; re-test. Proceed to the PR only when
merge-readiness is `Ready` (or blockers are fixed). Mention crucible + remediations in the PR
**Verification** section.

## 6. Open the PR

- **Done-done:** PR body includes `Closes #<issue>`.
- **Live retest owed:** use `Refs #<issue>`; after merge move to **Verifying**; close → Done only
  after live confirmation.
- Structure: **Summary** · **Remaining / deferred** (linked issues) · **Verification** ·
  **Operator actions**.
- Do not merge from the task branch unless the operator asks.

## Honesty bar

Report failed tests, skipped steps, crucible findings not yet fixed, and "not live-verified" plainly.
