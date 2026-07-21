---
name: vl-chip
description: >-
  Orchestrator dispatch — chip a self-contained unit of work off to a background session
  via the spawn_task tool (one chip = one branch = one worktree = one session). Use when the
  orchestrator says "chip #<N>", "chip this out", "dispatch a chip", or is fanning issues out
  to workers. The orchestrator stays on the default branch and never edits feature code; chips
  do the work and open their own PRs. Pairs with /vl-start-feature, /vl-merge-pr, /vl-prune.
---

# Chip (any stack)

> Companion: [/vl-start-feature](../vl-start-feature/SKILL.md) creates issues/board + the plan; chips
> do the implementation; [/vl-merge-pr](../vl-merge-pr/SKILL.md) merges reviewed chips; [/vl-prune](../vl-prune/SKILL.md)
> cleans the chip worktrees. Repo / owner / project / labels / **stack** / **crucible variant** /
> test command come from `docs/project-tracking/GITHUB-PROJECTS.md`.

## What a chip is

A **chip** is a background session dispatched via the **`spawn_task`** tool. It:

- runs in its **own git worktree** (`.claude/worktrees/<slug>`) on its **own `claude/*` branch**,
- carries **none** of the orchestrator's conversation — it starts **fresh**,
- does the work, opens **its own PR**, and **never merges**.

The orchestrator stays in the **main clone on the default branch** and **never edits feature code** —
everything ships through chips.

## 0. Before you chip

- There **must be a tracking issue** — create it via [/vl-start-feature](../vl-start-feature/SKILL.md)
  or [/vl-update-docs](../vl-update-docs/SKILL.md) first. **Never chip untracked work.**
- **Board-membership check (idempotent, single call — not a poll loop):** ad-hoc `gh issue create`
  succeeds even when the issue never lands on the board — it gives no signal that step 2 of
  `GITHUB-PROJECTS.md`'s "Creating an issue (two commands)" pattern was skipped. Before writing
  the brief, check once:
  `gh issue view <n> --repo <owner>/<repo> --json projectItems --jq '.projectItems'` — non-empty
  means it's on the board. If empty (`[]`), add it: `gh project item-add <n> --owner <owner> --url
  https://github.com/<owner>/<repo>/issues/<n>` (owner/project number from `GITHUB-PROJECTS.md`).
  `item-add` on an issue already on the board is a no-op, so this catches the gap regardless of how
  the issue was created — do not skip the check just because the issue came from
  `/vl-start-feature` or `/vl-update-docs`.
- Read repo/owner/project/labels/**stack**/**crucible variant**/test command from
  `docs/project-tracking/GITHUB-PROJECTS.md`.
- At a **real design fork**, stop and give the operator **2–3 options with costs** in plain chat —
  **before** any chip is dispatched.
- When the issue's step 1 is an **unknown** (SDK surface, third-party behavior), the kickoff must
  carry an **Investigate-first / hard-stop** section (see §2a) — copy that section into the brief
  verbatim so the chip cannot soften the stop.
- **Planner labels (daytime):** when the issue carries `plan:ready`, treat the kickoff comment +
  verify plan on the issue as the brief's authoritative plan artifacts — copy them into the
  self-contained `prompt`, do not re-plan. Daytime may still chip **without** `plan:ready` when
  the operator skipped Planner and the issue is already clear (attended judgment). Prefer
  enqueueing Planner (`needs:plan`) when scope, verify routing, or forks still need a planning
  pass — that path is orchestrator-owned; chips do not run `/vl-plan`. Investigate-first is **not**
  a substitute for Planner on ordinary `plan:ready` work.

## 1. Dispatch — the `spawn_task` call

| field | value |
|-------|-------|
| `title` | leads with the issue id: **`#<N> <concise-name>`** — shows in the UI and maps the chip to its issue |
| `tldr` | one plain-English line |
| `cwd` | the repo root (main clone) |
| `prompt` | a **fully self-contained brief** (see §2) |

**In the same turn as every dispatch — no exceptions — the orchestrator arms a monitor** watching
the chip's PR and the issue for new comments/state (§3), and moves Status to **In Progress**
when GraphQL budget allows (best-effort — skip the board edit when `graphql.remaining == 0`).
**Claude Code:** the **Monitor tool** (if it shells `gh`, same REST endpoints as Cursor — never
`gh pr list`). **Cursor:** a background shell with `notify_on_output` on **REST** (§3) — Cursor
has no Monitor tool; that watcher *is* the equivalent. The monitor *is* the completion signal; a
dispatch without one is a chip nobody is listening for.

## 2. The self-contained brief (the `prompt`)

The chip has **zero** shared context, so the brief must stand alone. Include:

- **Repo + path** and the default branch.
- **Issue #<N>** with its full goal + acceptance — do not make the chip re-derive it.
- **Plan artifacts** — if the issue is `plan:ready`, paste the kickoff + verify plan (and any
  locked fork decisions) from the issue into the brief so the chip does not invent a second plan.
  If the operator skipped Planner, the issue body + acceptance still stand; say so explicitly.
- **Owning vertical slice** to work in; don't invent layer-cake / dumping-ground folders.
- **Verify gate**: the repo's **Test command** + the routing (`tests-only` / `local-smoke` /
  `live-only`) read off the issue's verify plan. **No test surface** (docs/config-only chip)? Say
  so, declare routing `tests-only`, and substitute a **doc verify gate** — links resolve, facts
  cross-checked against source.
- **Crucible gate**: run the repo's `vl-crucible-<stack>` skill (looked up in `GITHUB-PROJECTS.md`,
  e.g. `vl-crucible-blazor` / `vl-crucible-nextjs`) and remediate until the signal reads **Ready** —
  **not optional**.
- **Shared-host smoke** (only when the verify gate smokes a running app host): the chip follows the
  probe-never-manage contract in §2b — probe, don't start/kill/restart; a config need discovered
  mid-smoke is a fork on the issue, not a restart.
- **Close-out**: **`/vl-finish-feature`** (not a hand-rolled PR) — after the crucible gate above reads
  **Ready**, it opens the PR **titled `#<N> <name>`** with **`Closes #<N>`**, plus the `changelog.d/`
  fragment + spec status.
- **Completion report**: right after `/vl-finish-feature` opens the PR, post a concise
  **`gh issue comment` on the chip's issue** — PR #, gate results. Stopping at a fork/blocker
  instead? The **options comment on the issue is the report**. `gh` is already allowed in chips,
  so the comment lands with no prompt, attended or not.
- **No chip-spawned sessions**: chips **never call `spawn_task`** (or any other session-spawning
  tool). A deferred idea, follow-up, or out-of-scope finding goes **on the issue as a comment** or
  as a **new labeled GitHub issue** — only the orchestrator decides whether and how to chip it.
- **Hard rules for the chip**: **never merge**; **never push to the default branch**; **never call
  `spawn_task`** or any session-spawning tool — deferred work goes on the issue, not into a new
  session; at a real design fork, **stop, comment 2–3 options on the issue, and wait** — do not
  guess; when the brief marks **Investigate-first / hard-stop**, that stop is **non-negotiable**
  (§2a) — never auto-pick because "the findings clearly favor X"; when smoking against a shared
  app host, **probe it, never manage it** (§2b) — no start-in-process, no kill, no restart.

## 2a. Investigate-first / hard-stop (fork-gate for unknowns)

When step 1 is an **unknown** — SDK surface, third-party behavior, unverified runtime fact — the
chip runs this sequence and **does not skip the stop**:

**investigate → post findings + 2–3 options with costs + recommendation on the issue → hard stop →
operator pick (issue comment or attended relay) → then implement.**

### How the gate is marked (teach the split)

| Mode | Marking | Duty after the options comment |
|------|---------|--------------------------------|
| **Daytime / attended** | Kickoff (and thus the chip brief) carries an explicit **Investigate-first / hard-stop** section naming the unknown and stating the stop is non-negotiable | **Stop.** Do **not** implement until the operator records the pick on the issue, or relays it attended (e.g. Cursor `send_message` / chat). Soft optional-wait wording is a defect in the brief — the section must say **hard stop**. |
| **Unattended / night-shift** | Label **`needs:decision`**, Status **Blocked** | Same options comment + recommendation; do **not** wait — take the next eligible issue (`/vl-night-shift`). |

Do **not** use this gate to replace Planner for ordinary `plan:ready` issues. A plan that already
locked the fork is execute work, not investigate-first. Mid-implementation design forks that are
**not** investigate-first still stop with options on the issue (daytime wait / night-shift
`needs:decision`) — same honesty bar, different marking.

### Non-negotiable

Recommendation on the issue is required; **auto-picking is forbidden**, including when findings
seem obvious. The options comment **is** the completion report for that stop (§2). The
orchestrator's REST monitor (§3) picks up that comment — do not invent a second channel.

## 2b. Shared app-host smoke — probe, never manage

Some verify plans need the chip to smoke a **running app instance**, not just run automated tests —
e.g. hitting a shared Blazor/Next.js host to confirm a change behaves. That host may be **shared**:
the operator, another chip, or the orchestrator may already own the running process, and the chip
has no way to know from inside its own worktree. Treat it as owned by someone else until proven
otherwise:

1. **Probe, never manage.** Check the repo-configured smoke endpoint (e.g. `GET /health` on the
   **Manual smoke** port from that repo's `GITHUB-PROJECTS.md`) before smoking. The chip never
   starts the host in-process, never kills it, never restarts it — "restart to pick up config" is
   forbidden even when a boot-time config gate makes it tempting. A config need discovered
   mid-smoke is a **fork**: stop, comment it on the issue, do not restart to force it in.
2. **Down = fail fast with a named remedy.** A host that doesn't answer the probe is not a silent
   skip and not a reason to self-start it. The PR's Verification section says **"smoke owed — host
   not up at `<port>`"** plus the one command an operator runs to bring it up. If — and only if —
   the repo ships a **start-only** bring-up script (detached start, mutex + PID file, no stop verb),
   the chip may call that script, since by construction it cannot interfere with an instance someone
   else owns.
3. **Name the code you smoked against.** When the host exposes build identity (e.g. `/health`
   returning the running commit SHA), record **"smoked against host @ `<commit>`"** in the PR's
   Verification section. A host stale relative to the default branch is a **flag in that section**,
   not a silently-accepted result.

Repo config (which port, which start-only script, if any) lives in that repo's
`GITHUB-PROJECTS.md`; this probe-never-manage contract is process and applies everywhere a chip
smokes a shared host. `/vl-finish-feature` step 6 carries the matching Verification-section wording.

## 3. After dispatch — the monitor is the signal

The orchestrator's **monitor — armed in the same turn as the dispatch, no exceptions** — is the
completion signal: watch the chip's PR and the issue for new comments/state over **REST only**.
The chip's `gh issue comment` (§2) is what the monitor picks up; no push channel is relied on.

### REST-only hot path (Cursor **and** Claude)

Poll with `gh api` (REST). **Never** shell `gh pr list` or `gh project item-list` on the monitor
hot path — both are GraphQL and burn the shared user bucket.

**PR detection has two recipes — pick by dispatch path, not by host** (#293). The `head=` filter
only works when the branch name embeds the issue number; it silently never matches otherwise:

| Dispatch path | Branch embeds issue #? | PR-detection recipe |
|---------------|-------------------------|----------------------|
| Cursor daytime / night-shift (`feat\|fix\|docs/<issue#>-*` — baked in at worktree creation) | Yes | `GET /repos/{owner}/{repo}/pulls?head={owner}:{branch}&state=open` |
| Claude chips (`spawn_task`, random `claude/<adjective>-<name>-<hash>` branch) | **No** | `GET /repos/{owner}/{repo}/pulls?state=open`, then filter: `.[] \| select(.title \| startswith("#<N> "))` — titles are reliably `#<N> <name>` per §2's close-out (`/vl-finish-feature`), so title is the real signal when the branch carries no issue number |

Issue-comment monitoring is **the same for both paths** — always by issue number, never by branch:

| Endpoint | Purpose |
|----------|---------|
| `GET /repos/{owner}/{repo}/issues/{n}/comments?since={iso}` | new issue comments (or list + compare ids) |

**Cadence:** **≥120s** between ticks (not 60s, not ~90s).

**Dedup guard** (required):

1. On arm, seed `last_pr_number` (empty if none), `last_comment_id`, and optionally `updated_at`.
2. Each tick, fetch this dispatch path's PR-detection recipe (table above) plus the issue-comments
   endpoint.
3. Print a **wake sentinel** (stdout line that matches Cursor `notify_on_output`, or that the
   Claude Monitor tool surfaces) **only when** the PR number appears/changes or a newer comment
   id arrives.
4. **Do not** re-announce a standing open PR every tick — silence is correct when nothing changed.
5. Stop the watcher after the merge batch for that chip set.

### Mechanism by host

| Host | How to arm | Do not |
|------|------------|--------|
| **Claude Code** | **Monitor tool** (each stdout line streams as a live event) on a loop that shells the **REST** recipe for the dispatch path above (≥120s, dedup) — `spawn_task` chips use the **title-match** PR recipe, never `head=`, since their branch carries no issue number. If the Monitor shells `gh`, use only those REST calls. | An **exit-only** background shell watch loop (detects in the output file but never notifies while running); `gh pr list`; `gh project item-list` / GraphQL hot polls; using the `head=` recipe on a Claude chip's random branch |
| **Cursor** | Background shell + **`notify_on_output`** (stdout match wakes the session) on the same **REST** recipe, **≥120s**, with the dedup guard above — Cursor daytime/night-shift branches embed the issue #, so `head=` is correct here. Cursor has **no** Monitor tool — this watcher *is* the equivalent. **Host limit:** those shells are **mortal** — Cursor may tear them down quietly. Teach **arm → assume mortal → re-arm** when the session notices death, after long gaps, or when an expected signal is missing: one REST check, then re-arm if the shell is gone. Do **not** arm-once-and-forget. Do **not** kill/re-arm after every successful drain just to re-seed (re-seed `last-seen` every tick — #267). | `gh pr list` (GraphQL); `gh project item-list` / GraphQL on the hot path (Projects GraphQL can exhaust the hourly budget in minutes); exit-only watch loops; assuming process-lifetime parity with Claude's Monitor tool |

Why not `send_message`: **`mcp__ccd_session_mgmt__send_message` always prompts the user for
confirmation by product contract** — no permission rule silences it (twice-tested) — so it can
never carry an unattended report. It remains fine for *attended* handoffs, one approval click
each. Harness end-pings don't fire either — a finished chip *idles* (`isRunning: false`), the
session never ends, so no end-notification is emitted.

Backup checks when the monitor is quiet, and always before merge (same REST — still never
`gh pr list`):

- Claude Code: `mcp__ccd_session_mgmt__list_sessions` (`prState` / `isRunning`), or REST
  `pulls?state=open` + title-match / issue comments
- Cursor: REST `pulls?head=` / issue comments (same side channel the watcher uses)

When the PR is up, **review the chip's commits** against the verify + crucible bar before merge.

## 4. Merge + cleanup (orchestrator-owned, separate skills)

- Merge reviewed chips with **[/vl-merge-pr](../vl-merge-pr/SKILL.md)** — squash; it does **not** delete
  the branch.
- Worktree + branch cleanup is **[/vl-prune](../vl-prune/SKILL.md)**, from the main clone after merge. If a
  chip worktree is locked (**Permission denied**), **close the chip session in the UI** to release
  it, then `/vl-prune --apply`.

## Honesty bar

- Never chip untracked work. Never chip past a real design fork without giving the operator options.
- Never chip past an **Investigate-first / hard-stop** gate — findings + options, then stop; no
  implement until the operator's pick is on the issue (or an attended relay).
- Never start, kill, or restart a shared app host to force a smoke through (§2b) — a down host is a
  fail-fast Verification note with a named remedy, never a silent self-managed fix.
- Chips **never self-merge**; the orchestrator reviews every chip before `/vl-merge-pr`.
- Work reaches a session **only via operator-reviewed orchestrator dispatch**. Chips never call
  `spawn_task`; a chip-authored brief is **never** a valid dispatch source — deferred ideas go on
  the issue or a new labeled issue for the orchestrator to triage.
- Report which chips are dispatched, which PRs are up, and what's still owed. A chip's completion
  comment is a claim, not proof — **verify it against the board and `gh` (PR state, gates) before
  any merge**.
