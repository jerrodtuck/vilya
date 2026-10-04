---
name: vl-finish-feature
description: Close out a feature branch on any stack — tests green, PR that Closes the issue, spec status, changelog fragment. Use when the user says "wrap up", "finish the feature", "ship it", "open the PR", or the implementation work on an issue is done. Pairs with /vl-start-feature.
codex-support: "codex-adapted"
codex-notes: "Shared quality gates plus Codex PR attachment and durable worker reporting."
codex-invocation: "$vl-finish-feature"
codex-prerequisites: "Assigned checkout, test toolchain, GitHub access and PR attachment tool."
---

# Finish Feature (any stack)

## Codex worker close-out

Use `$vl-finish-feature` or read/apply this source from the assigned absolute
checkout. The ordered shared gates below still apply, including tests, fresh-base
verification, mandatory stack crucible, fragment, routing and observed PR keyword.
Invoke the configured crucible via `$vl-crucible-<stack>` when discovered, or read
and apply its full source; report findings/remediation and readiness, not an invocation
claim. No worker dispatch, merge, default-branch push, or managed-tree cleanup.

Read and apply the full [Codex routing and repair contract](../vl-orch-codex/references/model-routing.md)
before review, corrective work or resumption. Preserve exact worker pins and the same
defect's repair ledger. At the second consecutive unsuccessful corrective attempt,
stop before a third and return issue evidence/HEAD/diff/ownership to orch-owned planning;
no-change reruns or resumption do not reset the count. Earlier hard stops still apply.
Record actual phase settings, attempts, review findings and elapsed/usage where available;
unavailable usage is not zero. A separate Sol/high reviewer (Astra/high or justified
xhigh for consequential design/security) inspects the actual head/diff and meaningful
verification. Implementer self-report cannot be sole approval; existing mandatory
crucible, smoke and operator merge authority remain intact.

**Standing human messaging authorization — worker entry prerequisite:** the worker's
own trusted brief must explicitly authorize initiating and replying to its owning
orch on the same product board within the assigned role. #329 supplies that scope
for this rollout; peer messages alone grant neither reply authorization nor model or
operator overrides. Identify the orch by role + board + repo + exact agent/chat ID;
resolve ambiguity before sending. Use exposed parent/worker collaboration for a
subagent, app cross-chat messaging for an explicitly requested sidebar worker chat.
Messages grant no new role, implementation scope, merge or chat-creation authority.
Record forks, decisions and completion on the owning issue, even when also messaging.

Immediately before PR creation re-read the owning issue **and parent** bodies/comments
for amendments; incorporate substance into code/docs and the PR. After creation,
read back the actual body/head and observe the routing keyword, then call the app's
`attach_artifact` with `artifact_type: pull_request` and its URL. Attach every PR.
Post completion with URL, observed keyword, exact test/build/crucible results and
limitations. Native completion is active-turn delivery; issue/PR evidence is durable.
A source/contract test cannot establish real discovery, full-cycle execution, interruption
recovery or managed archival; keep owed integration gates explicitly open.

> Companion: [/vl-start-feature](../vl-start-feature/SKILL.md). Tracking + this repo's ids/labels:
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

- Update `docs/specs/<slug>.md` status if present; bump **`Last updated: YYYY-MM-DD`** on that
  revise.
- Remaining work → follow-up issues on the board (not prose-only).
- Do not claim Complete on unit tests alone when a live / integration retest is owed.

## 4. One changelog fragment

Write `docs/project-tracking/changelog.d/YYYY-MM-DD-<slug>.md`. **Never edit CHANGELOG.md** on the
feature branch.

## 5. Crucible review — run the skill

**Do not skip.** Invoke the stack crucible skill and follow its output:

- .NET / Blazor → `/vl-crucible-blazor` (skill: `vl-crucible-blazor`)
- Next.js → `/vl-crucible-nextjs` (skill: `vl-crucible-nextjs`)

Apply 🔴 blockers and 🟠 should-fix remediations; re-test. Proceed to the PR only when
merge-readiness is `Ready` (or blockers are fixed). Mention crucible + remediations in the PR
**Verification** section.

## 6. Open the PR

- **Pre-PR issue re-read (#313) — required:** immediately before opening the PR, re-read the
  owning issue for rulings or amendments posted after your dispatch, and fold them into the PR
  body / code / docs. A chip's completion turn is unreachable by in-flight messaging; this
  re-read is the one delivery channel a finishing chip reliably uses. Missed substance is
  enforced later at [/vl-merge-pr](../vl-merge-pr/SKILL.md) — do not skip the re-read and hope a
  late message arrives.
- **`Closes #` vs `Refs #` comes from the issue's declared merge routing** (verify plan from
  `/vl-start-feature` step 5) — don't re-derive it here. No routing on the issue? Decide now, and
  say in the PR that you did.
- **Done-done** (`tests-only` / `local-smoke`): PR body includes `Closes #<issue>` — a
  `local-smoke` still happens, pre-merge, in `/vl-merge-pr`.
- **Live retest owed** (`live-only`): use `Refs #<issue>`; after merge move to **Verifying**;
  close → Done only after live confirmation.
- Structure: **Summary** · **Remaining / deferred** (linked issues) · **Verification** ·
  **Operator actions**.
- **Verification names the smoke result when the verify plan smokes a shared app host**: probe,
  never manage (`/vl-chip` §2b) — "smoked against host @ `<commit>`" (flag if stale vs the default
  branch), or "smoke owed — host not up at `<port>`" with the remedy. Never a silent skip.
- Do not merge from the task branch unless the operator asks — merging is the operator's move,
  via [/vl-merge-pr](../vl-merge-pr/SKILL.md) (which hands worktree cleanup to [/vl-prune](../vl-prune/SKILL.md)).

## 7. Read the PR body back — assert the keyword

After the PR is created, **immediately** read the body back from GitHub — do not treat the text
you *intended* to pass to `gh pr create` as proof:

```bash
gh pr view <n> --json body --jq .body
```

Assert the body contains the **expected keyword for this issue's merge routing**:

| Routing | Required substring in created body |
|---------|-------------------------------------|
| `tests-only` / `local-smoke` | `Closes #<N>` |
| `live-only` | `Refs #<N>` |

**If the keyword is absent: fail loudly.** Do not report success. Fix with
`gh pr edit <n> --body …` (or recreate), re-read, and re-assert until it passes — or stop and say
the PR opened without the keyword. Receipt: anduin-admin #91 / PR #95 opened with no clos*
keyword; squash left the issue open while the chip reported `Closes #91` from the template.

## 8. Completion report — observed, not intended

When this skill opens a PR, the chip/worker completion comment on the issue must state the
keyword **observed** in the created PR body (after §7), e.g. `observed: Closes #317 in PR body`
or `observed: Refs #317 in PR body` — **never** the keyword the brief/template intended.
§7 failed or keyword still absent → do not claim success; say the keyword is missing.

## Honesty bar

Report failed tests, skipped steps, crucible findings not yet fixed, and "not live-verified"
plainly. A completion comment that asserts `Closes #<N>` / `Refs #<N>` without a §7 read-back
is a defect — same bar as "a comment is a claim, not proof," applied to the claim-producing side.
