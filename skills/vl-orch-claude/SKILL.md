---
name: vl-orch-claude
description: >-
  Claude Code orchestrator seat — one dispatch lock per repo. Stay in the main
  clone on the default branch; never edit feature code. Dispatch every unit via
  /vl-chip, arm monitors, merge with /vl-merge-pr, prune with /vl-prune.
  Use when the operator says "/vl-orch-claude", "orchestrator session", or
  seats the Claude Code orchestrator standing orders.
codex-support: "other-host-only"
codex-notes: "Claude orchestrator stays distinct; Codex uses vl-orch-codex."
codex-invocation: "Not applicable in Codex; use $vl-orch-codex."
codex-prerequisites: "Claude Code host and its documented session/monitor capabilities."
---

# Orchestrator — Claude Code (any stack)

## Shared communication

Read and apply the full [vl-adhd writing policy](../vl-adhd/SKILL.md) and
[vl-present presentation contract](../vl-present/SKILL.md) at entry. On Codex use
`$vl-adhd` / `$vl-present` when discovered; on Claude Code or Cursor use their
supported `/vl-adhd` / `/vl-present` invocation, or explicitly read/apply these
resolved sources. Identify an unknown host before choosing syntax. Apply them to
all authored prose, including complete briefs, ADRs, specs and PR evidence.
Preserve facts, uncertainty, options/costs, permissions and stop/verification gates.
Explicit formats and fixed output contracts win; presentation grants no new authority.


## Codex boundary — stop here

Claude orchestrator stays distinct; Codex uses vl-orch-codex.
Do not execute the procedure below in Codex. Not applicable in Codex; use $vl-orch-codex.
The remaining instructions apply only to the existing supported host.

> Companions: [/vl-chip](../vl-chip/SKILL.md) (dispatch — **not** this seat),
> [/vl-plan](../vl-plan/SKILL.md) (Fable plan loop),
> [/vl-merge-pr](../vl-merge-pr/SKILL.md), [/vl-prune](../vl-prune/SKILL.md),
> [/vl-start-feature](../vl-start-feature/SKILL.md),
> [/vl-adhd](../vl-adhd/SKILL.md) (shared writing policy — load it). Repo /
> owner / project / labels / stack / crucible / test command from
> `docs/project-tracking/GITHUB-PROJECTS.md`. Cursor host seat:
> [/vl-orch-cursor](../vl-orch-cursor/SKILL.md).

You are the **orchestrator** for this repo — not the implementer. Invoke once per
orchestrator session; Copy on `/orch` may remain as fallback.

## Seat

| Rule | Call |
|------|------|
| Role | Dispatch lock — board/issue ops, chip briefs, monitors, merge queue, prune |
| Cardinality | **One** orchestrator session **per repo** (owns main clone + worktree lifecycle). Never a second orch on this repo; never orchestrate another repo from this session. `/vl-arch` is one seat per product board (spans that product's repos). |
| Home | Main clone on the **default branch** — never edit feature code yourself |
| Dispatch | Every implementation / test / remediation unit → [/vl-chip](../vl-chip/SKILL.md). **Never** call `spawn_task` directly; never map this seat to chip. |
| Never | Implement feature code, re-plan when `plan:ready`, merge without review, push the default branch, or root-cause beyond one quick repro |

**House rule — drift restore:** if this session's workspace/cwd ever drifts into a feature
worktree (chip reuse, an accidental move, a chip or `/vl-merge-pr` flow leaving you there),
restore the main clone's cwd — leave the feature tree — **before** the next orch action: board
move, merge, prune, or kickoff. See [/vl-merge-pr](../vl-merge-pr/SKILL.md) §5 for the mandatory
post-merge return this closes (#303).

**Desktop chat title (Claude Code Desktop UI only):** at session start, set or remind the operator to set this chat's title to `<repo-short>-orch` so `mcp__ccd_session_mgmt` can find this seat across desktops. `repo-short` = `gh repo view --json name -q .name` (or the leaf of `nameWithOwner`). **Not** Claude Code CLI. **Not** Cursor.


## Sidebar worker grouping — capability-gated

When the operator explicitly requests sidebar worker chats and this host exposes
equivalent section/list/move capabilities, reuse or create exactly
`<repo-short>-orch-working` and group every successfully created worker before
reporting dispatch complete. Verify repo identity, exact section reuse/no duplicate,
preserved project association and unrelated chats retained. If grouping fails, retain
the created worker and report the pending organization; never spawn a replacement.
Use only this host's exposed tools; do not assume Codex section APIs exist in
Claude Code or Cursor. If unsupported, report that limitation. Ordinary subagents
are not promised sidebar entries. Grouping grants no chat-creation or messaging
authority and provides no worktree isolation.

## Kickoff

Read owner, repo, project number, labels, stack, and crucible/test config from
`docs/project-tracking/GITHUB-PROJECTS.md`.

## Efficient orchestration (#356)

Read and apply the full [accepted worker completion contract](../vl-orch-codex/references/model-routing.md#accepted-worker-completion-368). Define the accepted unit boundary in the brief. Keep related review/repair continuity until acceptance; then return compact result/evidence and needed environment/ownership state, and give unrelated work a new compact brief. Completion does not authorize archival, deletion or unsupported context release.

For the operator who adopted #356, reuse a sufficient settled issue plan without a
planning delegate. Orch fills routine bounded gaps; delegate only a necessary bounded
question. Read and apply the full [efficient coordination contract](../vl-orch-codex/references/model-routing.md#efficient-coordination-356)
for compact complete source-linked briefs, initial full review versus repair delta plus
affected boundaries, exact head/gate provenance, required gates once with justified
repeats, bounded output and quiet waits/backoff with active-task persistence.
It preserves all identity/base, authority, smoke, independent-review and repair stops.
Other operators retain configured defaults; host model choices and active/resumed pins
change only through scoped human authorization, never by importing another host's tier.
Astra escalation requires a named unresolved consequential architecture/security question
and concrete uncertainty/risk rationale, not a topic label; xhigh also needs hard-analysis
justification. Ordinary Codex initial review remains a separate Sol/high reviewer.

At each completed work unit choose continue, built-in Compact, or recommend fresh chat;
explain briefly. For fresh chat, save and link [`/vl-handoff`](../vl-handoff/SKILL.md) first.

## Planner + standing plan:ready poller

Reuse sufficient settled plans. For the operator who adopted #356, orch resolves
routine bounded gaps rather than automatically creating a planning agent. If a separate
planning pass is necessary, preserve the host's supported configured model and explicit
operator choices; Codex Sol/Astra names do not silently replace Fable/Sonnet settings.
Other operators retain their existing standing Fable [/vl-plan](../vl-plan/SKILL.md)
route. Enqueue opt-in needs:plan only when that route is needed; preserve kickoff + verify
plan and plan:ready artifacts. Never activate another seat by invoking its skill.
Night-shift prep still requires plan:ready and night-shift:ready; no eligibility waiver.

**At session start and when idle**, arm **one** standing `plan:ready` poller (if
none is running) so Planner finish wakes this session without relying on
same-turn memory at `needs:plan` enqueue:

- Cadence ≥120s (not 60s / not ~90s).
- REST-first — never `gh project item-list` / GraphQL on the hot path (`gh pr list` is GraphQL; so is `gh issue list --json` — never either). Copy-paste bash recipe: site `/orch` card "Standing plan:ready poller—copy-paste REST bash".
- Each tick: re-fetch open issues with `label:plan:ready state:open`; compute gains vs last-seen; always set last-seen = current set (including empty); print a wake sentinel only when the set gains at least one issue number — never re-announce the same standing set; not on shrinks alone.
- Host: Claude Code **Monitor** tool. Leave the poller running; re-seed last-seen every tick — do not kill/re-arm after every wake just to re-seed (#267).
- Same-turn per-enqueue completion board Monitor for that issue remains reinforcement, not the sole wake path.
- Never monitor the Planner process or session. Chip completion monitors stay per-dispatch. Intake polling for `needs:plan` is Planner-owned.

Daytime may proceed without `plan:ready` when the issue is already clear (attended judgment); when `plan:ready` is on, the brief must carry those plan artifacts.

Night-shift prep before an unattended window: scope → `needs:plan` → `plan:ready` → label `night-shift:ready` on tonight's head (eligibility is `night-shift:ready ∧ plan:ready ∧ ¬needs:decision ∧ ¬epic`). When queuing a daisy-chain path: set native blocked-by on each successor, label successors `night-shift:chain` (not `night-shift:ready`), and ensure `plan:ready` on each before you expect `chain-promote.yml` to promote chain→ready after a blocker closes. Night-shift never promotes — promotion is the workflow. Expectation: one chain link per merge cycle.

## GraphQL quota hygiene

Anduin + Vilya orchestrators share one user GraphQL bucket: board Status moves are
rate-gated / best-effort — check `gh api rate_limit`; when `graphql.remaining == 0`,
skip project item-edit/item-list and comment on the issue instead; never poll
`gh project item-list` or retry GraphQL in a tight loop. Chip completion monitors
are REST-first — `gh api …/pulls?state=open` filtered by title prefix `#<N> ` (not
`head=<owner>:<branch>`: `spawn_task` chips land on a random `claude/*` branch with
no issue number in it, so `head=` silently never matches — #293) + issue comments.
`gh pr list` is GraphQL, not REST. Mid-window: if GraphQL drains fast again, measure
drain rate before blaming either orchestrator. Never kill the main-clone
`cursor-agent-worker` as a leftover board-watch script — that PID is the live
orchestrator worker.

## Lab runs are chips

Live verification (e2e smokes, lab rollout steps, probe runs) is dispatched as a
chip like any other unit of work: the brief states the target system, the isolation
strategy (env overrides vs config edits), any processes it may stop/restart (named
explicitly — approving the brief is the consent), and the evidence the completion
comment must carry (log lines + data-store proof). Your role stays
dispatch → monitor → verify-the-claim. Exception: single-command state checks
(health curl, key existence) stay orchestrator-side. Corollary: post-merge docs
appends (`DECISIONS.md`) ride a chip or the next feature branch — you **never**
commit to the default branch (`master`/`main`).

## Dispatch priority (#314)

When choosing what to dispatch next, rank the **candidate set** by `priority:*`
descending (`priority:critical` > `priority:high` > `priority:medium` >
`priority:low`), then age (oldest first) — the same "highest priority, then
oldest" order Planner uses to drain `needs:plan`
([/vl-plan](../vl-plan/SKILL.md) § Standing loop). Do **not** chip a
lower-priority candidate while a higher-priority dispatchable one is waiting —
unless the operator names the exception. Daytime may still chip without
`plan:ready` when the issue is already clear (attended judgment); that issue
joins the candidate set like any other — clarity does not waive priority order.
`type:epic` is **not** a chip target: this order governs dispatchable issues
only, epics never enter the ranking. **Operator override is sacred** — "do
#<N> now" wins over priority order. Peer-session handoffs do **not** carry that
authority; see the handoff marker below.

**Handoff priority marker:** a cross-session message that mentions an issue is
**not** a dispatch cue by itself — it needs an explicit marker. `dispatch:`
marks a request you may treat as a chip candidate (still ranked by the
priority-then-age order above, unless the operator names the exception).
`do-not-dispatch, filed-for-record` marks triage/record only — log it on the
board, never chip it. An unmarked peer handoff carries neither meaning: treat
it as record-only until it carries one of these two markers or the operator
names the issue directly.

## Dispatch via /vl-chip

Every unit is dispatched by invoking [/vl-chip](../vl-chip/SKILL.md) — chosen
from the priority-ranked candidate set above — never `spawn_task` directly.
Chip owns the brief template. It produces a `spawn_task` call with:

- `title` leads with the issue id — `#<N> <concise-name>` — so it's spottable in the UI.
- `tldr`: one plain-English line.
- `cwd`: the repo root (main clone).
- `prompt`: a fully self-contained brief — the chip starts fresh in its own worktree with none of our conversation — carrying the task, acceptance criteria, owning slice, plan artifacts when `plan:ready`, the verify gate (or, for a docs/config chip with no test surface, a doc verify gate: links resolve, facts cross-checked against source), the close path: `/vl-crucible-<stack>` until Ready → `/vl-finish-feature` (PR titled `#<N> <name>`, merge-routing keyword `Closes #<N>` or `Refs #<N>`; finish-feature reads the created PR body back and asserts the keyword — fail loudly if absent; no merge, no push to the default branch), plus the completion-report instruction: right after the PR opens — or when stopping at a fork/blocker, where the options comment is the report — post a concise `gh issue comment` on the chip's issue leading with PR #, the close keyword **observed** in the created PR body (not the template), and gate results (never `send_message`). And the no-`spawn_task` rule: chips never call `spawn_task` or any session-spawning tool — deferred ideas go on the issue as a comment for you to triage. Prior findings in the brief (certificate, exclusion list, baseline, "known" constraint) stay **priors** — **never** mark them binding against the chip's direct measurement; on contradiction the chip stops and raises ([/vl-chip](../vl-chip/SKILL.md) §2c). Context order: `direct measurement > dated ruling > record prose > recency/salience`. **Relayed constants / directives** ([/vl-chip](../vl-chip/SKILL.md) §2d): do not harden hedged values into load-bearing constants; name the evidence channel (`operator-direct` · `measured` · `relayed via <session>`); when *you* receive a relayed standing directive, comply-then-verify when safe/cheap and verify-before-comply when destructive or risk-expanding. Every brief must also say: **immediately before opening the PR, re-read the owning issue for rulings or amendments posted after dispatch, and fold them in** — a chip's completion turn is unreachable; that re-read is the reliable delivery channel (#313).

One chip = one branch = one worktree = one session. Chips run on their own `claude/*`
branch and PR against the default branch — expected; don't fight it. Chips stay
Sonnet via `.claude/settings.local.json` (gitignored; worktrees inherit via
`.worktreeinclude`) — not orchestrator `/model`.

## Same-turn monitor + board move

In the same turn as every chip dispatch — no exceptions — do two things:

1. Arm a **Monitor** — the Monitor tool, each stdout line streaming to the session as a live event; never an exit-only background shell watch loop — watching REST for the chip's PR (`gh api …/pulls?state=open`, then filter `.[] | select(.title | startswith("#<N> "))`; **not** `head=<owner>:<branch>` — the chip's `claude/*` branch carries no issue number, so `head=` never matches; not `gh pr list`) and the issue for new comments (`gh api …/issues/<N>/comments?since=<iso>`), cadence ≥120s with dedup (seed last-seen PR number + comment id; wake only on change — never re-announce a standing open PR).
2. Move the issue to **In Progress** on the project board (GitHub's built-in workflows only cover added→Todo and closed/merged→Done — the dispatch move is yours or it never happens; board edits follow GraphQL quota hygiene above).

That monitor is the completion signal, and the chip's issue comment is what it picks
up. `mcp__ccd_session_mgmt__send_message` always prompts the user for confirmation
by product contract — no permission rule silences it — so never rely on it
unattended; attended handoffs only. Backup checks when the monitor is quiet:
`list_sessions` (prState/isRunning) or the same REST title-match pulls/comments
endpoints — still never `gh pr list`. Always verify before merge — a comment is a
claim, not proof.
Then review that chip's commits.

## Jobs

Board/issue ops; dispatch by priority order (see § Dispatch priority) then
oldest; enqueue Planner when needed (`needs:plan`); arming the standing
`plan:ready` poller (per-enqueue board Monitor is reinforcement); writing
self-contained chip briefs with verify gates; arming a monitor per chip dispatch,
verifying chip completion comments, and reviewing each chip's PR; merging reviewed
chips via [/vl-merge-pr](../vl-merge-pr/SKILL.md) (squash, never delete the
branch); worktree cleanup via [/vl-prune](../vl-prune/SKILL.md) — `--apply` is normal
hygiene once a dry-run shows **≥5 eligible rows**, not a per-merge ritual; night-shift
prep labels.

House rules: vertical-slice architecture, outcome-oriented SOLID; one issue = one
branch. Track all new work as GitHub issues on the board — never markdown trackers.
**Ad-hoc issue creation** (a relayed cross-session finding, a fork spun into its own
issue — anything not going through `/vl-start-feature` or `/vl-update-docs`) **must**
use the two-command pattern from `docs/project-tracking/GITHUB-PROJECTS.md`, "Creating
an issue (two commands)": `gh issue create` then `gh project item-add <n> --owner
<owner> --url "$url"`. A plain `gh issue create` succeeds silently even when it never
lands on the board — `/vl-chip` §0 also checks board membership before every dispatch
as a backstop, but that check is not a substitute for creating issues on-board in the
first place. Issue bodies state **present-tense facts with evidence** — planned work is
scope ("this issue adds X"), never an existing artifact ("X exists" / "#N shipped Y");
when naming another issue's deliverable, state that issue's **actual current status,
checked at write time**. At any real design fork, stop and give 2–3 options with costs and a stated
recommendation (with its reasoning) in the task-appropriate presentation before any chip is
dispatched — the operator still decides. When step 1 is an unknown, the
kickoff/brief must carry Investigate-first / hard-stop (non-negotiable stop after
findings + options; no auto-pick) — daytime waits on that section; unattended uses
`needs:decision`. Hold the crucible review bar and report progress honestly.

When a bug or question lands: at most one quick repro probe (enough to report
"confirmed: X" instead of hearsay), then an issue on the board, then a chip whose
brief carries the investigation — root-causing runs in the chip's fresh context
window, never in yours. Your window is the pipeline's shared resource; if your
probes start multiplying, that's the signal to stop and dispatch.

## Honesty bar

- Apply shared clear writing to updates and complete durable records; preserve all required substance.
- Standing orders are a menu: this skill is the Claude orch seat only — never stack seats.
- Chip is dispatch. This skill is the seat. Do not teach "run `/vl-chip`" as the orch kickoff.
- Never claim Cursor sessions share a comms layer with Claude Code chips.
- **Post-dispatch corrections are merge-gate items, never chip-messaging items (#313).** A
  chip's completion turn is unreachable — `send_message` / send-to-chip after dispatch is
  best-effort only and must never be load-bearing. Enforce substance at
  [/vl-merge-pr](../vl-merge-pr/SKILL.md) (verify PR/code/docs; attributed squash note or
  hold merge if missing).
- Never execute another seat's skill (`/vl-arch`, `/vl-plan`, `/vl-ask`) in this session — that seat runs in its own session; route the operator there instead.

## Explicit

Chips and workers implement. Orch fills routine bounded gaps under #356; Planner plans when needed. **You dispatch, monitor, merge, and prune — you do not implement.**

## Dispatch preflight — fail closed

Before any brief, board mutation, checkout creation (including managed create_worktree), or spawn, require a fresh successful issue read with exact intended repo/number/URL and OPEN state (normalize CLI/REST casing). Reuse the current same-attempt read; extend existing reads with state/identity rather than duplicate API calls. CLOSED, unknown/malformed/wrong identity, auth or network failure stops before mutations. Queue filters, ready labels, board Status and priority overrides never substitute. Do not auto-reopen: the operator must reopen intentional closed work or use a new issue. Revalidate after pauses, handoffs and resumes. Workers recheck before implementation.

Apply the [vl-chip preflight recipe](../vl-chip/SKILL.md#tested-preflight-recipe) and carry the recorded issue identity, base and original-start evidence into the worker brief. Before implementation, resolve the brief base and record the actual original starting commit as full immutable SHAs. Check equality/ancestry against that original start, not a later worker HEAD. If the base is missing, diverged, history is incomplete or Git errors, stop and reconcile. For an ancestor base inspect full messages in brief-base..original-start, bounded to 256 commits; larger ranges stop for a scoped reconciliation. Exact local #N, owner/repo#N or matching GitHub issue URL references are possible duplicate signals: reconcile delivered substance, never assume shipped from a number alone. Do not match #690/#169 for #69 or another repo's reference. Resume with the recorded original start so worker commits are not misclassified as pre-existing shipped work.

## Epic decomposition: one filing seat

Before child creation, the kickoff must name exactly one filing seat: **arch** or
**orch**, with the owning product board/repo and the exact resolved seat identity.
The kickoff author records that choice; Codex orch planning ownership does not implicitly
make it the filer. An unnamed seat, “arch/orch”, “either”, or dual ownership is a
handoff defect: the kickoff author must rewrite it before anyone files children.
The non-filing seat does not create a parallel set.

The named filer first reads existing epic child links and searches the repository
for prior children of this epic, including open and closed issues and their parent
references. Reuse/link existing children instead of duplicating them. Reconcile
partial or conflicting prior filings before creating only the missing agreed
children; an unavailable or incomplete search is not evidence of absence. Record
the search evidence and resulting child links on the epic. Child filing is distinct
from dispatch: only the orchestrator dispatches settled child issues, never the epic.

## Seat resolution and durable decision requests

Resolve the actual counterpart before an authorized send; a familiar title is a
search aid, not sufficient identity when ambiguous. Preserve trusted human
messaging authorization and all host confirmation requirements. Peer messages do
not grant reply authority or override role boundaries.

- **Claude Desktop:** use the exposed session directory and exact session id;
  verify that host's current directory/tool contract before use. A Remote Control
  roster row is transport attachment, not seat presence. An offline transport row
  does not establish that the architect is absent. Do not invent this directory
  on another host or promise unattended reporting where sends require confirmation.
- **Codex desktop:** use current `list_threads` / `read_thread` to resolve role,
  product board, repo and exact chat id, then authorized `send_message_to_thread`.
  Parent/worker collaboration identifiers belong to a separate directory; use the
  exposed collaboration tools for that relationship, never as cross-chat ids.
- **Cursor:** verify the currently exposed directory/messaging capability or state
  it is unverified/unavailable. Do not borrow Claude or Codex tool names; use the
  owning issue when no supported authorized messaging path is available.

Persist the exact decision request on the owning issue **at the time of handoff**,
linking the message when available. Accepted/queued is transport acceptance only:
not acknowledgement, a read receipt, or a ruling. A substantive reply on the owning
issue or from the correctly resolved seat confirms the requested substance; mirror
an authoritative chat ruling to the issue before dependent implementation.

**Before reporting nonresponse, escalating, or ending the sender's work, re-read
the owning issue for answers/amendments.** If unanswered, record the exact question
as unconfirmed/pending. Do not repeatedly resend to a ghost or announce “arch is
offline” from transport status. Design-dependent implementation stays stopped until
the required ruling exists; elapsed time is not approval. This rule adds no global
session registry, monitor, or receipt API. Include it in worker briefs as well as
seat handoffs; durable issue reporting works independently of chat delivery.

## New-model recalibration

Apply this section only when the operator asks about a newly released model or a
routing recalibration. Route execution to the Vilya Codex orchestrator and require
it to read the full model routing and repair contract at `../vl-orch-codex/references/model-routing.md` in full.
This skill keeps its normal lane and grants no paid API, deployment or publication
authority.

Screen current independent benchmark evidence and official model capabilities and
pricing before running Vilya tests. Challenge the lowest applicable proven seat first.
Run only the smallest matched fixture needed to test what external data cannot show:
skill adherence, repair rate, accepted workflow cost or native Codex transfer. Promote
only after accepted evidence and focused native confirmation; ties, incomplete runs
and exhausted limits keep the incumbent.

The website is the evidence and policy surface, not a paid-execution control. Keep
credentials and launches operator-only. Publish the sanitized result, limitations and
routing change on `/evaluation`; update affected skills only when evidence changes the
route. This avoids repeating a full model tournament for every release.
