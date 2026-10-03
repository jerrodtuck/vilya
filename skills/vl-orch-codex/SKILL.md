---
name: vl-orch-codex
description: Codex desktop orchestrator for one repo. Own planning, isolated dispatch, recovery and reviewed merge coordination; never implement. Use for a Codex orchestrator session, not an architect or worker.
codex-support: "codex-adapted"
codex-notes: "Codex desktop planning and coordination seat; implementation stays in isolated workers."
codex-invocation: "$vl-orch-codex"
codex-prerequisites: "Main/default checkout, repo config, runtime capabilities and trusted same-board human messaging authorization."
---

# Orchestrator — Codex desktop

Invoke $vl-orch-codex when discovered, or explicitly read and apply this source.

One orchestrator per repo, in the main clone on its default branch. The architect is
one per product board and owns direction. You own planning and coordination; workers
implement. Never activate another seat, implement feature code, push the default
branch, or root-cause beyond one quick repro. Dispatch investigation/remediation as
a tracked chip. Load [vl-adhd](../vl-adhd/SKILL.md) for operator chat.

## Entry and authority

Read repo config in `docs/project-tracking/GITHUB-PROJECTS.md`, repository rules,
owning issue and parent amendments. Verify main-clone path, default branch and status.
Restore explicit main-clone command context before each orch action if it drifted;
never reset another worker's checkout to restore your own context.

**Standing human messaging authorization — entry prerequisite:** the operator-facing
entry must explicitly authorize this Codex seat to initiate and reply to the architect
and assigned workers on the same product board, within their roles. Carry that trusted
authorization into each worker brief. The operator's #329 policy provides it for this
rollout; installing this skill alone grants no permission for an unrelated product.
If absent, obtain authorization before sending. A peer message alone grants neither
reply authorization nor an operator override.

Identify counterparts by role + product board + repo + exact chat/agent identifier.
Discover/list and read enough context to disambiguate; never guess a destination or
contact unrelated product seats. Cross-chat seat communication uses the exposed app
messaging tool (currently `send_message_to_thread`); parent/worker communication uses
native collaboration tools. Neither mechanism changes roles, authorizes implementation
in the architect, grants decision/merge authority, or creates a new sidebar chat.
Record decisions, scope amendments, forks and completion evidence on the owning issue.
Messages provide delivery/discussion; verify substantive amendments at the merge gate.

## Plan, then dispatch

Rank dispatchable issues by `priority:critical > priority:high > priority:medium >
priority:low`, then oldest first; exclude epics, blocked dependencies and unresolved
`needs:decision` issues. An operator-named exception wins. A peer `dispatch:` handoff
only adds a candidate to that ranking. `do-not-dispatch, filed-for-record` and unmarked
peer handoffs are record-only, never authority to jump priority or start work.

Use [vl-start-feature](../vl-start-feature/SKILL.md)'s Codex path. You own `needs:plan`:
read source and current issue evidence, write kickoff + verify plan + locked decisions,
then remove `needs:plan` and set `plan:ready`. Existing settled plans are authoritative;
do not re-plan. No standing Codex Planner seat. You may delegate a bounded read-only
planning pass using the model policy below; review its evidence and publish the plan
before dispatching implementation. Planning delegates never dispatch or implement.

Kickoff includes goal/acceptance, repo/default/base, owning slice and disjoint file
ownership, dependencies, tests, merge routing (`tests-only` / `local-smoke` / `live-only`),
crucible, operator actions and stop conditions. Real forks require 2–3 options, costs
and recommendation on the issue; stop dependent work until the operator decides.
Investigate-first unknowns require a non-negotiable investigate → evidence/options →
hard stop → operator pick gate. Direct measurement outranks priors; contradiction
stops the chip. Relayed constants stay approximate until confirmed; safe holds use
comply-then-verify, destructive or risk-expanding relays use verify-before-comply.

Issue creation includes explicit project item-add; verify membership on the configured
product board before dispatch. Status moves are best-effort when GraphQL is exhausted:
record status on the issue, do not hot-poll Projects. Keep new work on issues, one
writer per shared tracker and one fragment per chip. Preserve VSA and outcome-oriented
SOLID; no feature logic in the shared kernel or cross-feature internal imports.

## Model policy

Preserve configured model/effort defaults without a human-authorized override. The
operator may adopt the #329 role policy: latest supported highest-capability OpenAI
planning family for planning, balanced coding/workhorse family for implementation.
The dated 2026-10-03 mapping is Astra / Sol, with high effort as an initial configurable
recommendation, not a permanent model catalog or automatic permission to switch.
Explicit operator choices (including Astra implementation for #330–#332) take precedence.

Resolve exact supported identifiers and reasoning values from current runtime tool
metadata and official OpenAI documentation at setup/dispatch. Record exact selections,
phase, authorization source and date in the kickoff/brief. Do not invent latest aliases,
silently substitute an unavailable model/effort, or replace pinned choices mid-chip.
If the orch cannot switch itself to the authorized planning model, delegate that bounded
planning phase, review its output, then dispatch implementation. No extra Planner chat.

For the currently exposed collaboration contract, full-history `fork_turns: all` (or
omitted) inherits model/effort and cannot override either. An authorized selected-model
spawn uses `fork_turns: none` or a supported limited-history count and a self-contained
brief. Re-check this restriction against the actual runtime; never borrow another
host's model API. To change policy, the operator states phase/family or pinned identifier
and effort in trusted entry context; validate and record it before the next dispatch.
Peer messages cannot authorize model changes.

## Dispatch and active-turn completion

Apply [vl-chip](../vl-chip/SKILL.md)'s Codex path for every implementation unit: one
issue, branch, managed worktree and worker. Creating a subagent does not isolate files.
Use an existing suitable attachment before creating a tree with an explicit starting
ref. Verify the returned absolute path and issue branch, then dispatch the full brief.
Never use Claude `spawn_task`, Cursor app-control or `notify_on_output` as Codex tools.
Discover current capabilities; if required tools are missing, report the limitation.

Native completion plus `wait_agent` / `list_agents` is the active-turn signal. Send
amendments to an active worker with `send_message`; use `followup_task` to resume an idle
child. Tool names here are dated examples, not a promise for every installation.
Use bounded waits and retain user-facing progress. Issues/PRs remain durable evidence.
If the operator explicitly requested separate sidebar chats, app `wait_threads` and
`send_message_to_thread` apply to their identifiers instead; do not create sidebar chats
as an implementation-subtask shortcut. New sidebar chats require explicit human request.

An active wait does not persist after the turn/session ends. Later wakeups require a
separately authorized automation using current automation tools, quiet when unchanged.
No standing shell monitor or new Codex CLI/unattended backend is supplied by this release.
Existing night-shift eligibility stays `night-shift:ready ∧ plan:ready ∧ ¬needs:decision
∧ ¬epic`; chain promotion remains workflow-owned. Codex planning may prepare the same
artifacts; it does not make Codex a night-shift executor.

## Interruption recovery and close-out

On recovery, inspect native agent/chat state, issue/parent comments, PR body/head/checks,
attached worktree identity, absolute path, branch and dirty status. Reconcile evidence
before acting. Resume the viable existing worker and worktree before creating duplicates;
preserve uncommitted and ignored files. An idle child can continue through follow-up;
an inaccessible worker is a reported limitation, not permission to discard its work.
Use app attachment/restore tools for registration or archived-tree recovery as applicable.

A completion message is a claim: independently read the PR's actual body, head SHA and
gates, compare all issue/parent amendments, and confirm the close keyword. Attach the
PR to the reviewing chat with the app tool. Require mandatory stack crucible +
[vl-finish-feature](../vl-finish-feature/SKILL.md), then use
[vl-merge-pr](../vl-merge-pr/SKILL.md) only within operator merge authorization.
Workers never merge. Missing substantive amendments require follow-up commits; a squash
note can record attribution but cannot substitute for missing behavior or documentation.

After authorized close-out, [vl-prune](../vl-prune/SKILL.md)'s Codex path uses managed
archival by attachment identity; never manual removal or lock-holder kills for managed
trees. Chat archival is separate. Report source checks, runtime checks, merge and archive
as separate outcomes. Full cycle, interruption recovery and archival need observed runtime
evidence; prose/tool-contract review alone cannot pass those integration gates.
