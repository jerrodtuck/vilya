---
name: vl-chip
description: >-
  Orchestrator dispatch — chip a self-contained unit of work off to a background session
  via the current host dispatch path (Claude spawn_task or Codex native collaboration).
  One chip = one branch = one worktree = one session. Use when the
  orchestrator says "chip #<N>", "chip this out", "dispatch a chip", or is fanning issues out
  to workers. The orchestrator stays on the default branch and never edits feature code; chips
  do the work and open their own PRs. Pairs with /vl-start-feature, /vl-merge-pr, /vl-prune.
codex-support: "codex-adapted"
codex-notes: "Codex dispatch uses explicit managed checkout isolation and native completion."
codex-invocation: "$vl-chip"
codex-prerequisites: "Codex orch seat, settled plan, managed-worktree and collaboration tools, trusted human messaging authorization."
---

# Chip (any stack)

## Shared communication

Read and apply the full [vl-adhd writing policy](../vl-adhd/SKILL.md) and
[vl-present presentation contract](../vl-present/SKILL.md) at entry. On Codex use
`$vl-adhd` / `$vl-present` when discovered; on Claude Code or Cursor use their
supported `/vl-adhd` / `/vl-present` invocation, or explicitly read/apply these
resolved sources. Identify an unknown host before choosing syntax. Apply them to
all authored prose, including complete briefs, ADRs, specs and PR evidence.
Preserve facts, uncertainty, options/costs, permissions and stop/verification gates.
Explicit formats and fixed output contracts win; presentation grants no new authority.


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

## Fresh issue-state gate — every dispatch path

Before building a brief, changing board state/membership, creating a checkout, or
spawning a worker, obtain a fresh successful read of the intended repository and
issue. Consume state and identity from the issue read already needed for this
attempt; extend the board-membership query rather than adding a duplicate request.
Normalize CLI/REST state casing and require **OPEN**, the exact issue number and
intended repository URL. CLOSED, absent/unknown/malformed state, wrong identity,
authentication failure or network failure means **stop before mutations**.

Queue filters, board Status, ready labels and operator priority overrides do not
replace this gate. Do not auto-reopen: intentionally resumed closed work requires
the operator to reopen it, or a new tracking issue. A successful current read may
be reused within the same uninterrupted attempt; re-read after a pause, handoff or
resume before continuing. Workers also verify issue state before implementation.

### Tested preflight recipe

The bundled [dispatch-preflight.mjs](scripts/dispatch-preflight.mjs) is read-only.
It requires Node.js 18+, Git and authenticated gh; verify availability first.

Install the **complete vl-chip folder**, including scripts: the Vilya installers
link whole skill directories for Claude, Cursor and Codex. Resolve the helper from
that installed skill root (or the canonical Vilya skills/vl-chip root), **not the
target product repository cwd**. The registry raw SKILL.md download is manifest-only
and does not include this helper; do not claim it is a complete executable install.
If only that manifest is available, obtain the complete trusted folder or use the
verified manual contract below; missing helper/tooling means stop unless equivalent
checks are performed and recorded. The generated registry bundle carries the script,
but that does not make it part of the raw manifest download.

From
the intended repository, resolve the installed skill's absolute script path and run:

```text
node <absolute-vl-chip>/scripts/dispatch-preflight.mjs issue <owner/repo> <number>
node <absolute-vl-chip>/scripts/dispatch-preflight.mjs base <owner/repo> <number> <brief-full-sha> <original-start-full-sha>
```

Run the issue command **instead of** the existing issue/board read. It requests
body/comments/labels/projectItems/state/number/url together, returns the accepted
issue data for the brief and board check, and exits nonzero on failure. Honor the
exit status; never continue a shell command chain after failure. An existing fresh
REST/CLI response can be checked directly against the contract above without an
extra request; REST uses html_url and CLI uses url. This recipe targets github.com;
other hosts require a verified identity adapter, never silent acceptance.

If Node/the script is unavailable, perform the same documented checks through the
host's available commands and record evidence, or stop; do not claim this recipe ran.
No new issue-state poller is introduced. New issue creation is necessarily before
that issue's read; immediately verify its returned identity and fresh OPEN state
before board membership/Status, worktree setup, brief or spawn.

Before implementation, resolve the brief base and record the actual original starting commit as full immutable SHAs. Check equality/ancestry against that original start, not a later worker HEAD. If the base is missing, diverged, history is incomplete or Git errors, stop and reconcile. For an ancestor base inspect full messages in brief-base..original-start, bounded to 256 commits; larger ranges stop for a scoped reconciliation. Exact local #N, owner/repo#N or matching GitHub issue URL references are possible duplicate signals: reconcile delivered substance, never assume shipped from a number alone. Do not match #690/#169 for #69 or another repo's reference. Resume with the recorded original start so worker commits are not misclassified as pre-existing shipped work.

Capture original-start with git rev-parse HEAD when the checkout is first assigned,
before any worker commit, and persist it in the brief/recovery record. A brief's
symbolic/short ref must resolve with git rev-parse --verify '<ref>^{commit}' first.
On recovery never guess a lost original-start from today's HEAD; stop and recover
its evidence. A hit or inconclusive check requires issue evidence and scope/base
reconciliation before implementation, not automatic reopening or duplicate work.

## Codex desktop dispatch

**Seat gate:** only `vl-orch-codex` may dispatch this Codex path. Architect, planner,
router and workers decline; invoking a dispatch skill never changes seat ownership.
Use `$vl-chip` or explicitly read/apply the source. Follow this section for Codex;
the `spawn_task` and monitor procedures below apply only to the other hosts.

1. Apply the fresh issue-state gate above before any board mutation, checkout or spawn.
   Read repo config and issue/parent bodies, comments, settled kickoff + verify plan.
   Verify membership on the **configured product board**, not merely any project.
   Add missing membership once with `gh project item-add`; quota-blocked Status moves
   are best-effort with issue evidence. Never dispatch untracked work, an epic,
   unresolved dependency/fork, or a record-only handoff. Apply
   [orch priority and model policy](../vl-orch-codex/SKILL.md).
2. Prepare or reuse the managed checkout via
   [vl-start-feature Codex path](../vl-start-feature/SKILL.md#codex-desktop-path).
   Explicit starting ref, base SHA, absolute checkout, issue branch and ignored setup
   must be verified before spawn. Subagents share the workspace: spawn alone is not
   isolation. Every worker shell/read/write must target its assigned checkout.
3. Read and apply the full [Codex routing and repair contract](../vl-orch-codex/references/model-routing.md)
   before selection, implementation, review, repair or resume; require every worker
   to load it from the resolved complete skill folder. Apply the [Codex phase policy](../vl-orch-codex/SKILL.md#model-policy): for the
   operator who adopted #357 on 2026-10-08, select the latest supported Sol/medium
   model for normal planning and implementation. Use Luna/low ONLY for enumerated
   mechanical work with objective verification and Sol/high for independent review.
   Astra/high (justified xhigh) is a bounded escalation only after a recorded Sol
   impasse or capability-specific failure on consequential design/security work. Route by
   uncertainty and consequence; small behavior changes are not Luna-eligible. Other
   operators keep configured defaults absent their own authorization. A scoped
   explicit override wins only in scope; prior #330–#332 Astra implementation pins
   are historical, not a standing change. Validate exact model/effort against
   current capabilities and record selection, phase, date, authorization source
   and override scope. Preserve active and resumed worker pins. Ambiguous or
   conflicting scope, or an unavailable combination, stops dispatch without
   aliases, substitution or a silent effort increase.
4. Discover the actual collaboration tools. The 2026-10-03 session exposed `spawn_agent`,
   `send_message`, `followup_task`, `wait_agent`, `list_agents`, `interrupt_agent`.
   Dispatch with the full brief below; use only authorized model/effort overrides.
   Full-history forks inherit and cannot override model/effort; selected-model
   delegation uses `fork_turns: none` or supported limited history. Missing capability
   or invalid explicit model is a reported stop, never silent substitution.
5. Track native completion/wait during the active turn and update In Progress where
   quota permits. Send changes to an active worker, follow up to resume an idle child.
   Record amendments on the issue regardless of delivery; enforce substance again
   before merge. Durable issue/PR evidence supports recovery if the turn is interrupted.
   Later wakeups require a separately authorized automation; no borrowed Claude Monitor
   or Cursor `notify_on_output`. Explicitly requested sidebar worker chats use app
   wait/message tools instead, with their exact chat IDs; never create one implicitly.

Before reporting an explicitly requested sidebar dispatch complete, follow
[Sidebar worker grouping](../vl-orch-codex/SKILL.md#sidebar-worker-grouping):
`list_threads` → reuse exact `<repo-short>-orch-working` or `create_sidebar_section`
→ `move_thread_to_sidebar_section` for every created chat → verify reuse/no duplicate,
project association and unrelated chats retained. Use `rename_sidebar_section` only
for an authorized rename of this repo-owned section. Preserve already-created worker
IDs and report grouping failure; no replacement chats. Grouping grants no chat-creation
or peer-message authority and provides no worktree isolation. Other hosts apply this
convention only through equivalent exposed tools, never borrowed Codex APIs. Carry
the amendment into the PR and verify it independently at the merge gate.

### Codex self-contained worker brief

Require the worker to read and apply the full [Codex routing and repair contract](../vl-orch-codex/references/model-routing.md)
before implementation, repair or resume, from the resolved canonical/installed complete
folder. Include its routing, eligibility, independent-review and repair-ledger rules in
the actual entry; a bare model pin or optional link does not deliver the contract.
Initial detection is not a repair attempt; at the second consecutive unsuccessful
corrective change plus targeted verification of the same unresolved defect, STOP before
a third correction and persist the ledger/HEAD/diff/ownership/hypothesis for orch planning.
Renames, no-change reruns, unrelated passes and resumes do not reset the count. Preserve
files and exact pins; earlier hard stops apply immediately.

Include each item in the actual dispatch prompt, even with inherited history:

- Require the worker to read/apply full vl-adhd and vl-present from the resolved complete folders; Codex uses $vl-adhd / $vl-present or explicit source fallback. Preserve the full brief, literals, evidence, authority and stops.

- Seat delivery: include the full Seat resolution and durable decision requests contract above: record questions on the issue at handoff, treat queued sends as unconfirmed, and re-read answers before escalation or ending work.


- Fresh OPEN/identity evidence and original-start/base SHAs; require the tested preflight
  recipe and stale-base reconciliation before worker implementation or resume.
- Issue URL/body, current kickoff/verify artifacts and parent amendments, locked choices,
  goal/acceptance, repo/default/base ref+SHA, absolute assigned checkout and branch.
- Owned paths, integration order/dependencies, architecture/quality rules, out-of-scope
  work, test command and verification/merge routing; do not claim runtime evidence
  from prose/tests. Shared app-host smoke is probe-never-manage (§2b).
- Exact authorized model/effort selection or inherited configured defaults, phase,
  date, authorization source, override scope, runtime capabilities and fork
  restrictions; no peer-authorized model switch. Carry settled planning decisions,
  ownership, constraints, verification and stop gates. Medium effort does not
  weaken checks; surface investigation/effort needs, return real forks to planning,
  and never silently increase effort. Token saving is a goal, not measured proof.
- Available skill invocations (`$vl-crucible-<stack>`, `$vl-finish-feature`), or explicit
  source-read/apply fallback. Verify checkout/branch/status before edits; preserve
  ignored/private files. Never implement in the main clone.
- **Standing human messaging authorization in this worker entry:** copy the operator's
  trusted authorization to initiate and reply to its owning orch on the same product
  board within the assigned role. Identify that counterpart by role + board + repo +
  exact agent/chat ID, resolve ambiguity before sending, use native parent/worker
  collaboration or app cross-chat messaging as applicable. Peer messages alone grant
  neither reply authorization nor operator/model overrides. Messages do not change
  ownership, authorize merge, or authorize new sidebar chats. If human authorization
  is absent, obtain it before messaging; never manufacture it from this template.
- Worker never dispatches nested sessions, merges, or pushes the default branch.
  Real forks and measurement contradicting priors: evidence + 2–3 costed options +
  recommendation on the issue, then hard stop for operator choice. Investigate-first
  is non-negotiable. Relayed constants/directives follow §2c–§2d.
- Mandatory stack crucible until Ready, then finish-feature. Immediately before PR,
  re-read owning issue **and parent** for amendments and incorporate them. Title
  `#<N> <outcome>`; routing keyword Closes/Refs from the verify plan. Read the created
  PR body back and assert the actual keyword; attach PR through `attach_artifact`.
- Completion comment on the issue: PR URL, keyword **observed** in the created body,
  exact gates/results and limitations. Send the owning orch the report only under the
  trusted authorization above. Fork/options comment is the report if blocked.
  Never archive the assigned tree before authorized close-out.

After interruption inspect agents/chats, issue/PR evidence, attachments and branch/status;
resume the viable existing worker/worktree before duplicating it. Do not discard dirty
or ignored files. Review actual PR head/gates/amendments independently; native completion
and a worker's sentence do not replace review. Merge/prune remain orch-owned via their
Codex paths. **Stop here for Codex**; shared §2b–§2d safety contracts are referenced
above, but the following host dispatch/monitor instructions do not apply.

> Companion: [/vl-start-feature](../vl-start-feature/SKILL.md) creates issues/board + the plan; chips
> do the implementation; [/vl-merge-pr](../vl-merge-pr/SKILL.md) merges reviewed chips; [/vl-prune](../vl-prune/SKILL.md)
> cleans the chip worktrees. Repo / owner / project / labels / **stack** / **crucible variant** /
> test command come from `docs/project-tracking/GITHUB-PROJECTS.md`.

## Seat check — read before § What a chip is

`/vl-chip` dispatch is **orchestrator-only**. If this session is seated as `/vl-arch`,
`/vl-plan`, `/vl-ask`, or any seat that is not `/vl-orch-cursor` / `/vl-orch-claude` / `$vl-orch-codex`, **decline**
— one line: "chip dispatch is orch-owned; run it from the `/vl-orch-cursor` / `/vl-orch-claude` / `$vl-orch-codex`
session" — and stop. Do not call `spawn_task` from here. This file's steps below do not
outrank the seat's Never list just because they're written down (the #306 failure: a
`/vl-arch` session ran orch-only skills because their body read like license to proceed).

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
  `gh issue view <n> --repo <owner>/<repo> --json projectItems,state,number,url --jq '{board: .projectItems, state: .state, number: .number, url: .url}'` — require fresh OPEN
  and exact identity first, then inspect `board` for the configured product board
  (not merely any project). If missing, add it: `gh project item-add <n> --owner <owner> --url
  https://github.com/<owner>/<repo>/issues/<n>` (owner/project number from `GITHUB-PROJECTS.md`).
  `item-add` on an issue already on the board is a no-op, so this catches the gap regardless of how
  the issue was created — do not skip the check just because the issue came from
  `/vl-start-feature` or `/vl-update-docs`.
- Read repo/owner/project/labels/**stack**/**crucible variant**/test command from
  `docs/project-tracking/GITHUB-PROJECTS.md`.
- At a **real design fork**, stop and give the operator **2–3 options with costs** in the task-appropriate presentation —
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
- **Issue bodies you author or amend** (follow-up issues, body edits — not completion comments):
  state **present-tense facts with evidence**. Planned work is scope ("this issue adds X"),
  never an existing artifact ("X exists" / "#N shipped Y"). When naming another issue's
  deliverable, state that issue's **actual current status, checked at write time**. An
  aspirational body is a false record the moment it is filed.

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

- Require the worker to read/apply full vl-adhd and vl-present from their resolved complete folders; identify host, use supported /vl-adhd / /vl-present on Claude Code/Cursor or explicit source fallback. Preserve the full brief, literals, evidence, authority and stops.

- Fresh OPEN/identity evidence and the tested preflight recipe above; record brief base
  and original-start SHAs, check the intervening range before implementation, and
  retain original-start on recovery so worker commits are excluded.

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
  **Ready**, it opens the PR **titled `#<N> <name>`** with the merge-routing keyword
  (`Closes #<N>` or `Refs #<N>`), plus the `changelog.d/` fragment + spec status. Finish-feature
  **reads the created PR body back** and asserts the keyword — fail loudly if absent; do not
  report success without that assert ([/vl-finish-feature](../vl-finish-feature/SKILL.md) §7).
- **Decision requests and delivery (#326)** — include the Seat resolution and durable decision requests contract above in every worker brief: persist the exact question on the owning issue at handoff, preserve host identity/authorization checks, treat queued sends as unconfirmed, and re-read issue answers before escalation or ending work. No ruling means dependent work stays stopped.
- **Pre-PR issue re-read (#313)** — **required in every brief**: *immediately before opening the
  PR, re-read the owning issue for rulings or amendments posted after your dispatch, and fold
  them in.* A chip's completion turn is unreachable by in-flight messaging; that re-read is the
  one delivery channel a finishing chip reliably uses. Post-dispatch corrections that miss the
  re-read are enforced at the merge gate ([/vl-merge-pr](../vl-merge-pr/SKILL.md)) — never by
  assuming a late message landed.
- **Completion report**: right after `/vl-finish-feature` opens the PR, post a concise
  **`gh issue comment` on the chip's issue** leading with PR #, the close keyword **observed**
  in the created PR body (after finish-feature's read-back — e.g. `observed: Closes #<N> in PR
  body`), and gate results. **Never** assert `Closes #<N>` / `Refs #<N>` from the brief or
  template alone. Stopping at a fork/blocker instead? The **options comment on the issue is the
  report**. `gh` is already allowed in chips, so the comment lands with no prompt, attended or
  not.
- **No chip-spawned sessions**: chips **never call `spawn_task`** (or any other session-spawning
  tool). A deferred idea, follow-up, or out-of-scope finding goes **on the issue as a comment** or
  as a **new labeled GitHub issue** — only the orchestrator decides whether and how to chip it.
- **Hard rules for the chip**: **never merge**; **never push to the default branch**; **never call
  `spawn_task`** or any session-spawning tool — deferred work goes on the issue, not into a new
  session; at a real design fork, **stop, comment 2–3 options on the issue, and wait** — do not
  guess; when the brief marks **Investigate-first / hard-stop**, that stop is **non-negotiable**
  (§2a) — never auto-pick because "the findings clearly favor X"; when smoking against a shared
  app host, **probe it, never manage it** (§2b) — no start-in-process, no kill, no restart; when
  this chip's **direct measurement** contradicts a brief-supplied prior finding, **STOP and raise
  it** (§2c) — never silently comply, even if the brief called that finding "binding"; when a
  **load-bearing constant** or **standing directive** arrives by relay, apply §2d — confirm
  constants before hardening them; comply-then-verify vs verify-before-comply for directives;
  record the evidence channel; **immediately before opening the PR, re-read the owning issue**
  for post-dispatch rulings / amendments and fold them in (#313).

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

## 2c. Brief prior findings are rebuttable by measurement

Any brief-supplied **prior finding** — a certificate, exclusion list, baseline, "known"
constraint, or other statement *about* an artifact — is **rebuttable by this chip's own direct
measurement** of that artifact. Direct measurement of the artifact outranks any statement about
it, whatever seat signed the statement.

**On contradiction: STOP.** Comment the conflict on the issue (what the brief said, what you
measured, and the evidence) and wait for the operator — **never** silently comply with the
brief's prior finding. A brief that marks a prior finding "binding" against measurement is a
**defect in the brief**, not permission to ignore the instrument.

Context order when weighing conflicting claims (teach alongside — not a separate issue):

`direct measurement > dated ruling > record prose > recency/salience`

Receipt (wording inspiration only): a chip measured five wells complete against an integrity
certificate exclusion list, then applied the exclusion because the brief marked it binding —
certificate was wrong; the instrument was right.

## 2d. Relayed constants and directives

**Load-bearing constants** (dates, cutoffs, thresholds, counts) that arrive by relay are
**approximations** until confirmed **operator-direct** or by **measurement**. A hedge ("to be
safe", "roughly", "I think") marks a value as a **non-constant** — do not harden it into a
load-bearing fact.

**Relayed standing directives** — the asymmetry is the point:

| Direction | When | Examples |
|-----------|------|----------|
| **Comply-then-verify** | Compliance is the safe/cheap direction | Protect data, hold dispatch, stop a push |
| **Verify-before-comply** | The relayed instruction is destructive or expands risk | History rewrites, deletions, publishing, permission changes |

When recording a fact or directive, name its **evidence channel** — `operator-direct`,
`measured`, or `relayed via <session>` — so the next reader knows its evidence class.

Receipt (wording inspiration only): a hedged cutoff hardened into a load-bearing constant
(+6.6d error); a confidentiality directive arrived via architect relay → comply-then-verify.

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
- Never silently comply when this chip's direct measurement contradicts a brief-supplied prior
  finding (§2c) — stop, raise the conflict on the issue; "binding" in the brief does not outrank
  the instrument.
- Never harden a hedged relayed value into a load-bearing constant, and never treat
  verify-before-comply as optional for destructive or risk-expanding relayed directives (§2d) —
  record the evidence channel (`operator-direct` · `measured` · `relayed via <session>`).
- Never open a PR without the **pre-PR issue re-read** (#313) — fold in post-dispatch rulings /
  amendments; a brief that omits that instruction is defective.
- Never write planned work as if it already exists when authoring or amending an issue body, and
  never claim another issue shipped a deliverable without checking that issue's status at write
  time.
- Chips **never self-merge**; the orchestrator reviews every chip before `/vl-merge-pr`.
- Work reaches a session **only via operator-reviewed orchestrator dispatch**. Chips never call
  `spawn_task`; a chip-authored brief is **never** a valid dispatch source — deferred ideas go on
  the issue or a new labeled issue for the orchestrator to triage.
- Report which chips are dispatched, which PRs are up, and what's still owed. A chip's completion
  comment is a claim, not proof — **verify it against the board and `gh` (PR state, gates) before
  any merge**.
