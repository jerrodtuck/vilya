# GitHub Projects — tracking model (canon)

**Vilya is the Dev Loop system** (skills, prompts/flows, registry site, this canon) — not a
product target. **This file is the single process canon.** Product repos do **not** copy it:
each carries a **config-only** `docs/project-tracking/GITHUB-PROJECTS.md` — its Repo config
block plus a pointer back here — generated with the site's Setup → Regenerate tool. Process
sections below live only in this file; skills read config from each repo's file and process
from their own SKILL.md.

Skills (`vl-start-feature` / `vl-finish-feature` / `vl-update-docs` /
`vl-night-shift` / `/vl-plan` / …) read owner, project, labels, stack, test command,
and crucible variant from here. **Model selections are per operator, never product config.**
This Vilya process canon records approved policy; downstream config-only files must not
copy phase choices. Claude Code: **Planner session = Fable** (`claude --model fable`); **orchestrator + chips =
Sonnet** via `model` in `.claude/settings.local.json` (gitignored; chips inherit it via
`.worktreeinclude`) — **not** orchestrator `/model` as the planner. **Cursor** — per-conversation
model dropdown, both phases; **night-shift** — the model is fixed by the launcher (workflow
file), one model for the whole run. Single-session daytime work still hand-switches per
`/vl-start-feature` when not using a Planner session.

## Codex desktop workflow (2026-10-03; #329 / #332)

Codex shares the board, architecture and quality contracts. Its orchestrator owns planning
and implementation coordination; no standing Codex Planner seat is required. It plans or
delegates a bounded planning stage, reviews the result, records kickoff + verify plan on the
issue, and preserves needs:plan → plan:ready. Claude Code/Cursor mechanics below stay scoped
to those hosts. Night-shift eligibility is unchanged: plan:ready ∧ night-shift:ready.
Codex CLI and a new Codex unattended backend are deferred.

### Install, invoke and select models

Add Codex links with `pwsh scripts/install-skills.ps1 -IncludeCodex` or
`bash scripts/install-skills.sh --include-codex`. Codex uses `$HOME/.agents/skills`;
the default `~/.claude/skills` and explicit custom-target precedence remain intact.
Check actual session discovery and the resolved source; installation alone is not evidence
of invocation. Read each skill's Codex applicability/prerequisites, then use the supported
`$vl-orch-codex` / `$vl-arch` invocation or explicitly read/apply its source.
The exhaustive classification lives in `docs/design/codex-skill-coverage.md` (#330).

Phase preferences are per operator, not product config. This operator adopted the #357
Sol-first route on 2026-10-08: latest supported Sol/medium for normal planning,
implementation and repair; Sol/high for difficult architecture and separate independent
review; Luna/low ONLY for explicitly enumerated mechanical operations with objective
verification; and Astra/high (justified xhigh) only after a recorded Sol impasse or
capability failure. Route by uncertainty and consequence, never line count; small behavior
changes are not Luna-eligible. The standing Codex orch starts on Sol/medium and the
standing Codex architect on Sol/high in the UI; invoking a skill cannot change its active
chat model or reasoning effort. Read and apply the full
[Codex routing and repair contract](../../skills/vl-orch-codex/references/model-routing.md)
before selecting phases, dispatching, repairing or resuming.
Issue #356 optimizes context without changing that route. Use bounded self-contained
briefs with exact source references instead of full conversation history. Reuse viable
workers for repair and preserve their ledgers. Initial review covers the full change;
repair review covers the delta plus affected boundaries and current amendments. Run each
required gate once at the applicable head, repeating only for affected changes, failure,
or unresolved risk. Batch independent reads, bound output and use quiet waits with backoff
without ending active work. Context experiments hold model, fixture, effort, gates and
rubric constant and record cache/input/output/reasoning counters, handoffs, repairs,
elapsed time, acceptance and cost per accepted change. Missing counters are unavailable.
At the end of a work unit choose `continue`, built-in Compact, or `recommend fresh chat`
and explain briefly. Before fresh chat, apply `$vl-handoff` to save the complete handoff
and ready-to-paste starter requiring live ownership, worker, lock and ledger
reconciliation. Invocation creates no sidebar chat and resets nothing.
Other operators retain configured defaults absent their own authorization. Record
exact model IDs, effort, phase, rationale, date, capability evidence, authorization source and override scope on the
issue and brief. Explicit choices win only within their scope: #330–#332 Astra
implementation pins were historical issue overrides, not a permanent default.
Preserve active and resumed worker pins. Conflicting or ambiguous scope and unavailable
combinations stop dependent dispatch. No invented latest alias, silent fallback or
unapproved effort increase.
A peer message does not authorize a switch. Change preferences by explicit operator
instruction naming phase, family or exact model, and effort; validate current reasoning and
context-fork constraints. Full-history subagent forks currently inherit model/effort; an
authorized override requires a permitted limited/no-history fork and self-contained brief.
If the orch cannot change its own model through an exposed tool, delegate planning to the
selected planning model, review/record its output, then dispatch implementation.
Give implementation the settled decisions, ownership, constraints, verification and
stop gates. Medium effort never weakens checks; surface further investigation or
effort needs and return real design forks to planning. Token reduction is a goal,
not measured savings or a quality guarantee. At the second consecutive unsuccessful
corrective change plus targeted verification of the same unresolved defect/gate,
stop before a third correction and return the stable ledger/HEAD/diff/ownership to
orch-owned planning. Initial detection is not a repair; reruns, renames, unrelated
passes or new workers/resumes/branches do not reset counts. Earlier hard stops apply.
Preserve files and exact pins; apply the full contract for resolution/revised-plan rules.
Independent review reads actual head/diff and meaningful gates; implementer self-report
cannot be sole approval. Keep lightweight issue/PR actual settings, attempt counts,
review findings and elapsed/usage evidence where available; unavailable usage is not zero.

### Trusted seat entry and durable amendments

Each architect, orch and worker entry must carry the human's standing authorization to
initiate and reply within its assigned repo/product board. Identify counterpart role,
board, repo and exact chat/agent ID using exposed list/read tools; stop if ambiguous.
Cross-chat seats use the available app messaging tool; parent/worker subagents use
collaboration message/follow-up tools. Discover capabilities rather than assume host parity.
Peer messages alone grant no authorization, operator decisions, merge rights, role changes
or permission to create a sidebar chat. Architect stays direction-only, orch coordinates,
workers implement. New sidebar chats require an explicit human request; ordinary delegation
uses subagents. Preserve `dispatch:`, `do-not-dispatch, filed-for-record` and record-only
unmarked handoffs. Rank candidates by priority descending then oldest; only an operator
exception overrides that order. Epics are not chip targets.

Post decisions, scope amendments and completion evidence on the owning issue; messaging
is delivery/discussion. Re-read owning issue and parent comments immediately before PR
creation and enforce substantive amendments again at independent PR/merge verification.
At contradictions or real forks, direct measurement outranks priors: post evidence, costed
options and recommendation, then stop dependent work for the operator.

### Requested sidebar worker grouping

When I explicitly request new sidebar worker chats, derive repo-short from the verified repository identity, then use list_threads to inspect sections and reuse the exact <repo-short>-orch-working section (vilya-orch-working for Vilya), or create_sidebar_section if absent. Move every successfully created worker with move_thread_to_sidebar_section before reporting dispatch complete. If same-name sections are ambiguous, stop before moving. Use rename_sidebar_section only for a verified repo-owned section within the operator’s requested rename; preserve project association, unrelated seats and other repos’ workers, and avoid duplicate sections. Retain each created chat identifier if grouping fails, report the failure and recover its grouping instead of creating a duplicate worker. Re-read list_threads to verify exact repo prefix, reuse/no duplicate, every created worker grouped and unrelated chats retained at the PR/merge gate. Grouping is organization only: it grants no new-chat permission, peer-message authority or checkout isolation; ordinary subagents are not promised sidebar entries. Other hosts use this convention only if their own exposed capabilities support it.

### Dispatch freshness and original-start evidence (#327)

Before any brief, board mutation, checkout creation (including managed create_worktree), or spawn, require a fresh successful issue read with exact intended repo/number/URL and OPEN state (normalize CLI/REST casing). Reuse the current same-attempt read; extend existing reads with state/identity rather than duplicate API calls. CLOSED, unknown/malformed/wrong identity, auth or network failure stops before mutations. Queue filters, ready labels, board Status and priority overrides never substitute. Do not auto-reopen: the operator must reopen intentional closed work or use a new issue. Revalidate after pauses, handoffs and resumes. Workers recheck before implementation.

Before implementation, resolve the brief base and record the actual original starting commit as full immutable SHAs. Check equality/ancestry against that original start, not a later worker HEAD. If the base is missing, diverged, history is incomplete or Git errors, stop and reconcile. For an ancestor base inspect full messages in brief-base..original-start, bounded to 256 commits; larger ranges stop for a scoped reconciliation. Exact local #N, owner/repo#N or matching GitHub issue URL references are possible duplicate signals: reconcile delivered substance, never assume shipped from a number alone. Do not match #690/#169 for #69 or another repo's reference. Resume with the recorded original start so worker commits are not misclassified as pre-existing shipped work.

The read-only, tested recipe is [vl-chip preflight](../../skills/vl-chip/SKILL.md#tested-preflight-recipe). It extends the existing issue read and retains configured-board membership checks; failures never authorize mutation. Newly created issues are checked immediately before board addition.

### Managed worktree lifecycle (2026-10-03 amendment)

Prefer the exposed create_worktree tool with the explicit intended ref. Wait for asynchronous creation/registration completion. If the checkout was created but registration failed, use attach_worktree on its returned workspace path; do not create a duplicate. Verify list_artifacts in the owning orchestrator chat records the attachment identity, absolute workspace path, branch and issue association. Subagent-created managed worktrees attach to the top-level parent chat. Managed creation may initially use detached HEAD: explicitly create/check out the assigned issue branch and verify it before writing. Supply the absolute workdir in every chip shell operation; never rely on shared session cwd. Never share a worktree between simultaneous independent chips.

Managed attachments, permanent worktree projects and sidebar chats are distinct. Ordinary subagent dispatch requires no separate sidebar chat or permanent worktree project; new sidebar chats require an explicit human request. Verify operational attachment and recovery state through exposed managed-worktree tools. GUI visibility and inspection evidence are not Vilya acceptance requirements.

### Isolation, verification and recovery

1. Inspect managed attachments and reuse a suitable checkout. If creating one, supply an
   explicit verified starting ref and wait for registration. One issue, branch and isolated
   worktree per chip; Codex branches default to `codex/` unless the operator specifies otherwise.
2. Subagents share a workspace. Supply the absolute worktree path and branch; require every
   command to target it and verify `git rev-parse --show-toplevel`, branch and status before writing.
   A spawn or new chat is not isolation. Never implement in the main clone.
3. Apply ignored-file prerequisites through the repo's setup hook or
   `scripts/apply-worktreeinclude`; preserve private setup without printing/staging it.
4. Include issue/current state, goal, ownership, constraints, locked decisions, checkout/ref,
   model policy, skills/tools, verification routing, amendment reread, completion and hard stops
   in a self-contained brief. Record worker/attachment IDs and move the issue In Progress.
5. Use native subagent wait/completion and follow-up during the active turn; explicitly
   requested chats use their exposed chat wait tools. Later automation wakeups require an
   explicit user request. Do not borrow Cursor notify_on_output or Claude Monitor.
6. Worker runs configured tests/build, stack crucible and finish-feature, opens/attaches its PR,
   reads back the actual Closes/Refs keyword dictated by verify routing, and comments exact
   gates/results and limitations on the issue. Orch independently verifies diff, evidence and
   amendments. Operator alone authorizes merge.
7. On interruption, read durable issue/PR state and inspect the original worker and attachment.
   Verify path, branch, HEAD, status and saved changes. Avoid concurrent writers; resume where
   possible, otherwise give a replacement a complete recovery brief. Never reset/recreate just
   because a turn ended. Ambiguous ownership is a hard stop.
8. After authorized close-out, inspect `list_artifacts` and archive with the exact managed
   identity through `archive_worktree`; preserve necessary ignored files separately. Respect
   primary/pinned/shared restrictions. `restore_worktree` restores a snapshot with detached
   HEAD; re-verify state. Verify attachment state after any chat archival; do not infer cleanup. Do not substitute generic deletion.

Teaching: site `/setup?host=codex`, `/architect?host=codex`, `/orch?host=codex`,
`/planner?host=codex`, `/differences?host=codex`. Official worktrees:
https://learn.chatgpt.com/docs/environments/git-worktrees; skills:
https://learn.chatgpt.com/docs/build-skills. Current exposed tool contracts support the above
capability distinctions; they do not prove a full Vilya cycle. Runtime acceptance, amendment
delivery, independent verification, interrupted recovery and managed archival remain #329's
separate integration gate. Cursor cross-seat messaging absence/parity is not inferred.

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | `jerrodtuck` | your GitHub account/org (e.g. `jerrodtuck`) |
| Repo | `jerrodtuck/vilya` | the repo issues live in |
| Project number | `8` | `gh project list --owner <owner>` |
| Project id | `PVT_kwHOAYNJN84BdH1y` | `gh project view <n> --owner <owner> --format json --jq .id` |
| Status field id | `PVTSSF_lAHOAYNJN84BdH1yzhXrqCM` | see "Field ids" below |
| **Stack** | `nextjs` | the repo's framework |
| **Crucible variant** | `vl-crucible-nextjs` | the review skill installed in this repo |
| **Test command** | `npm test && npm run build` (in `apps/skill-registry`) | what `/vl-finish-feature` runs in step 1 |
| **Manual smoke** | `npm run dev` in `apps/skill-registry` → http://localhost:3000 | how to launch the app for a hands-on pre-merge test (`/vl-merge-pr`); for hardware/live-only checks write `live-only` — those go through Verifying instead |
| **Component baseline** | `none` — no configured external component library | the repo's library/design system, location and constraints, or explicitly `none` |
| **Custom component policy** | `n/a` — no separate component-approval gate configured; normal architecture/review requirements apply | repo rule and authoritative approval record, or explicitly `n/a` with why no special gate applies |
| Default branch | `master` | `git remote show origin` |

Status option ids (fill after first setup):

```text
Todo:         f75ad846
In Progress:  47fc9ee4
Blocked:      7e864448
Verifying:    0fd3026c
Done:         98236657
```

Native single-select fields on this board (beyond Status; labels remain what the
skills read):

```text
Type  (PVTSSF_lAHOAYNJN84BdH1yzhXrqC4): Roadmap c3d24af8 · Epic 6021b0ae · Feature bca65912 · Bug 066550da · Task 888fb4a8
Priority (PVTSSF_lAHOAYNJN84BdH1yzhXrqC8): Critical 015536b0 · High 5aa1bc85 · Medium aa763174 · Low 7522a137
```

Get the Status field id + option ids in one shot:

```bash
gh project field-list <n> --owner <owner> --format json \
  --jq '.fields[] | select(.name=="Status") | {id, options: [.options[] | {name, id}]}'
```

### Area labels — define per repo

Areas name *this* product's vertical slices. This repo's areas:

`area:registry` · `area:skills` · `area:site` · `area:docs` · `area:installer`

## Model (same everywhere)

- **One Project per product.** Issues live in the product's repo.
- **Labels drive the board;** Status is the one native field (Todo · In Progress · Blocked ·
  Verifying · Done).
- **Specs stay in-repo** under `docs/specs/`, linked from the issue.
- **`changelog.d/` is release notes**, orthogonal to the board.

### Labels

| Signal | Values |
|--------|--------|
| **Type** | `type:bug` · `type:feature` · `type:epic` · `type:task` |
| **Priority** | `priority:critical` · `priority:high` · `priority:medium` · `priority:low` |
| **Area** | repo-specific — see Repo config |
| **Status** | Todo · In Progress · Blocked · Verifying · Done |
| **Autonomy** | `needs:plan` (enqueue for Planner) · `plan:ready` (kickoff + verify plan on issue) · `night-shift:chain` (waiting in a chain; not yet eligible) · `night-shift:ready` (safe for unattended night-shift) · `needs:decision` (loop stopped at a fork) |

Sync the standard Type/Priority/Autonomy labels into a new repo:

```bash
bash docs/project-tracking/scripts/sync-labels.sh <owner>/<repo>
```

The script syncs the **standard set only** (`type:*`, `priority:*`, `needs:plan`,
`plan:ready`, `night-shift:chain`, `night-shift:ready`, `needs:decision`); `area:*`
labels are repo-specific — create them from the repo's config file's Area labels section.

#### Migrating `auto:ready` → `night-shift:ready`

`auto:ready` is retired. Product repos that still have it should rename the label (GitHub
keeps issue associations on rename):

```bash
gh label edit auto:ready --repo <owner>/<repo> --name night-shift:ready \
  --description "Safe for night-shift to pick up autonomously"
```

Or run `sync-labels.sh` (creates `night-shift:ready`), then for each open issue still on the
old name: `gh issue edit <n> --repo <owner>/<repo> --add-label night-shift:ready
--remove-label auto:ready`, and delete `auto:ready`. Relabeling remotes (Anduin, etc.) is
operator follow-through after this canon lands — not part of the label-contract PR.

### Creating an issue (two commands)

```bash
url=$(gh issue create --repo <owner>/<repo> --title "…" --body "…" \
  --label type:feature --label priority:high --label area:<slice>)
gh project item-add <n> --owner <owner> --url "$url"
```

### Setting an issue's Status

```bash
PID=<PVT_...>          # Project id
SF=<PVTSSF_...>        # Status field id
OPT=<in-progress-id>   # option id from Repo config
item=$(gh project item-list <n> --owner <owner> --format json \
  --jq ".items[]|select(.content.number==N)|.id")
gh project item-edit --project-id "$PID" --id "$item" --field-id "$SF" --single-select-option-id "$OPT"
```

### Blocked & Verifying

- **Blocked** — cannot finish yet (external dependency).
- **Verifying** — merged but a live / integration retest is owed. PR uses `Refs #<issue>` (not
  `Closes #`) so merge does not auto-Done; close → Done only after live confirmation.

### PR close convention

- **Merge routing is declared on the issue at kickoff** (`/vl-start-feature` verify plan):
  `tests-only` · `local-smoke` (hands-on check pre-merge via `/vl-merge-pr`) · `live-only`
  (Verifying owed). Finish and merge read it — nobody re-decides at PR time.
- Done-done at merge (`tests-only` / `local-smoke`): `Closes #<issue>`
- Live retest owed (`live-only`): `Refs #<issue>` → move to Verifying after merge
- **Merge method: squash, always** — one issue = one commit on the default branch;
  `gh pr merge <n> --squash`. Remote branch removal is the repo's `delete_branch_on_merge`
  setting; local branch + worktree cleanup is `/vl-prune`'s job, never merge-time. The
  operator merges via `/vl-merge-pr`; agents never do.

## Process

### Daytime chain (primary)

New work = GitHub issue, never a new markdown tracker file. One issue = one branch = one worktree
(`feat|fix|docs/<issue#>-slug` for Claude/Cursor daytime **and** night-shift;
`claude/*` for Claude chips; Codex defaults to `codex/` per its desktop contract).
Night-shift reuses daytime branch names under `.claude/worktrees/` (often Actions `_work`) —
`/vl-prune` owns that pairing; do not expect `claude/*` for overnight trees.

```text
/vl-start-feature → implement → /vl-crucible-<stack> → remediate → /vl-finish-feature → /vl-merge-pr → Done
```

`/vl-update-docs` is a **routing** skill (manual / mid-work: “where does this go?”, log a
decision, capture a bug). It is **not** stepped by the happy path. Specs and changelog fragments
are written inline by `/vl-start-feature` and `/vl-finish-feature`.

### Chip chain (dispatched)

**Claude Code / Cursor path. Planner** is an anytime standing loop (one Fable session per repo). Enqueue with opt-in
`needs:plan`; Planner drains the queue → writes kickoff + verify plan on the issue →
`plan:ready`. The orchestrator owns a **standing `plan:ready` poller** (REST + host wake,
≥120s, wake on set gain; Cursor shells are mortal — re-arm when dead, #270) so Planner
finish wakes the seat without relying on same-turn enqueue memory. Same-turn per-enqueue
board Monitor for that issue remains best-practice reinforcement, not the sole wake path.
Never a process monitor on the Planner session. Planner intake for `needs:plan` stays
Planner-owned (#255). Daytime may chip without `plan:ready` when the issue is already
clear (attended judgment). **Host split (#271 / #281):** Claude Code chip-flow still
needs the standing Fable Planner; **Cursor daytime Planner is optional** — orch or
in-session plan may write the kickoff; enqueue Planner when you want the Fable drain /
night-shift prep. Night-shift eligibility still requires `plan:ready`.

**One board, host-specific machinery:** GitHub issues + Project Status + labels + verify-plan merge
routing are the shared contract across hosts; chip spawn, Planner seat, model split,
and cloud/local gates diverge by desktop. ADR:
`docs/DECISIONS.md` (`2026-07-20 — One board, two desktops`); teaching surface:
site `/differences`.

```text
[optional] needs:plan → Planner (Fable) → plan:ready
  → chip dispatch (spawn_task / Cursor worker, brief carries the issue, verify routing,
    crucible gate; orchestrator same turn: arms a host monitor + moves In Progress)
  → chip implements → /vl-crucible-<stack> → /vl-finish-feature (PR) → completion comment
    on the issue (gh); orchestrator monitor picks it up → operator /vl-merge-pr → auto-archive
    on PR close → periodic /vl-prune --apply
```

Chips never merge, never spawn sessions, and report via a **completion comment on the issue**
(`gh` — no prompt, attended or not); the orchestrator's dispatch monitor picks it up (loop
documented on the site's Setup page and in `/vl-chip`). When a verify plan smokes a **shared
long-lived app host** (e.g. a Blazor/Next.js dev instance another session may already own), the
chip **probes, never manages** it — no start-in-process, no kill, no restart; a down host is a
fail-fast Verification note with a named remedy, not a silent skip (full contract: `/vl-chip` §2b,
matching wording in `/vl-finish-feature` step 6). Dispatch carries **two same-turn
obligations**: arm the monitor and move the issue to **In Progress** on the board, since
GitHub's built-in workflows only cover added→Todo and closed/merged→Done. **Claude Code**
arms the **Monitor tool** — never an **exit-only** background shell watch loop (detects but
cannot notify while running). **Cursor** has no Monitor tool; the equivalent is a background
shell with **`notify_on_output`** on **REST** (`gh api …/pulls?head=<owner>:<branch>&state=open`
+ issue comments, cadence **≥120s**, wake only on change) — never `gh project item-list` /
GraphQL on the hot path (`gh pr list` is GraphQL). Full recipe: `/vl-chip` §3. The
orchestrator cards carry the standing-order wording.

**Cursor shell teardown (host limit):** long-running background shells are **mortal** — Cursor
may reclaim or tear them down quietly; an armed `notify_on_output` watcher is not proof it is
still alive. Teach **arm → assume mortal → re-arm** when the session notices death, after long
idle gaps, or when an expected signal is missing: one REST check, then re-arm if the shell is
gone. Do **not** arm-once-and-forget. Do **not** kill/re-arm after every successful drain just
to re-seed (re-seed `last-seen` every tick instead — #267). Same rule for chip-completion
monitors, standing orch `plan:ready` pollers, and Planner intake watchers on Cursor. Claude
Code's Monitor tool path stays host-specific — no false process-lifetime parity. ADR:
`docs/DECISIONS.md` (`2026-07-19 — Cursor tears down long-running monitor shells`, #270).

**GraphQL quota / board edits:** product orchestrators on the same GitHub user share **one**
GraphQL bucket. Board Status moves are **rate-gated / best-effort** — when
`graphql.remaining == 0`, skip `gh project item-edit` / hot `item-list` polls and comment on
the issue instead; never retry GraphQL in a tight loop. Prefer REST for chip completion
monitors. Mid-window drain: measure rate (ambient ~2/min vs hot loop) before blaming a
specific orchestrator. Do **not** kill the main-clone `cursor-agent-worker` as a leftover
board-watch script — that process is the live orchestrator worker.

### Database migrations

Each database-backed product records **Migration tool**, **Migration command** and
**Migration status** in its config-only file. These are repo decisions, not stack
defaults. Use the project's migration tool; this policy does not require Drizzle
for unrelated stacks. Blank means unknown. If an application command is not yet
implemented, mark it **pending** and link the owning follow-up issue. Do not present
a proposed `npm run db:migrate` command as working.

For Drizzle projects, generate SQL migrations with `drizzle-kit generate`; use
custom migrations for SQL that the schema generator does not express, including
functions, triggers and data changes. Commit the reviewed SQL and the journal,
snapshots and other migration metadata required by the repo's installed version.
Keep applied migration history immutable; make subsequent changes in a new
migration. See the official [generation and custom SQL documentation](https://orm.drizzle.team/docs/drizzle-kit-generate).

Apply committed migrations through the repo's configured, reviewed application
command, normally `npm run db:migrate`, backed by Drizzle's migration runner.
Verify that the script exists and selects the intended environment, host and
database before executing it. Keep credentials out of output and committed files.
**Production `drizzle-kit push` and ad hoc migration SQL are prohibited.** A missing
runner is work to track and complete, not permission to bypass migration history.
See the official [migration application documentation](https://orm.drizzle.team/docs/drizzle-kit-migrate).

For a database that already contains applied changes, first compare its actual
schema and migration state with the committed history. Use a reviewed,
version-compatible baseline procedure that records only verified applied changes
without replaying their SQL. Prove the baseline on a restored copy before using it
on production. Stop on a mismatch; do not guess journal entries or silently mark
unverified changes applied. Preserve tables, data, functions, triggers, constraints
and other database objects when establishing the baseline.

Migration tooling does not replace the deployment safety gates. Verify the target,
retain a restricted full backup and its integrity evidence, and prove restoration
before an authorized production upgrade. Test the upgrade on that restored state,
compare schema and data semantically, and verify that applying the same committed
history again is safe. Record the recovery plan and results on the owning issue/PR.
Production execution remains a separately authorized operation.

### Shared files / worktrees

| File | Parallel rule |
|------|----------------|
| This `GITHUB-PROJECTS.md` | **Read-only on feature branches** unless the issue is explicitly about changing config. Config edits prefer a docs/config issue and merge-boundary. |
| `docs/DECISIONS.md` | Append-only, newest at top, dated `## YYYY-MM-DD — Title`. Prefer the decision on the **issue** first; one file append on the owning branch. **Read:** grep/search by topic or issue # — do not load the whole file by default. |
| `docs/specs/*.md`, `docs/design/*.md`, `docs/VISION.md` | Slow-moving. On create: `Created: YYYY-MM-DD` + owning issue. On material revise: bump `Last updated: YYYY-MM-DD`. |
| `docs/project-tracking/changelog.d/YYYY-MM-DD-<slug>.md` | One fragment per PR — safe in parallel. Never edit assembled `CHANGELOG.md` on a feature branch. |

**Gitignored locals into worktrees:** list paths once in repo-root `.worktreeinclude`
(gitignore syntax; only ignored matches copy). Claude Code applies that file natively.
Cursor applies the **same list** via `scripts/apply-worktreeinclude.(ps1|sh)` from
`.cursor/worktrees.json`; after orch `git worktree add`, `/vl-start-feature` (and Cursor
orch) run that script — Cursor setup does not fire on bare git worktrees. Product repos
copy the shim from Vilya once, then only extend `.worktreeinclude` (e.g. `.env.local`).
Teaching: site Setup + `/differences`.

### Night-shift via GitHub Actions

Night-shift is **not** a second methodology. It runs the **same daytime chain** unattended on a
**product** repo (headless Claude Code via Actions). Vilya ships **one** generic workflow
template; each product repo copies it. Stack-specific commands are **not** forked into YAML —
the skill reads them from that product’s config-only `GITHUB-PROJECTS.md`.

Eligibility: labeled `night-shift:ready` and `plan:ready`, not `needs:decision`, not
`type:epic`. Opens PRs; **never merges**. Stricter than daytime — unattended does not skip
planning. Prep (operator + orchestrator): scope issues → run Planner (`needs:plan` →
`plan:ready`) → label `night-shift:ready` before the unattended window. At a real design
fork: comment options + recommendation, label `needs:decision`, Blocked, next issue.

**Chain promote (Option 3):** night-shift never merges, so a successor labeled only
`night-shift:chain` stays ineligible until something promotes it. Product repos copy
`docs/project-tracking/templates/chain-promote.yml` → `.github/workflows/chain-promote.yml`.
On `issues: closed`, that workflow finds dependents via the **REST issue-dependencies
API** (`GET …/dependencies/blocking` on the closed issue; each dependent's blockers via
`…/dependencies/blocked_by`) — **no GraphQL**. When **all** of a dependent's blockers are
closed, and the dependent has `night-shift:chain` ∧ `plan:ready`, not `needs:decision`,
not `type:epic`, it applies `night-shift:ready` (and drops `night-shift:chain`). The
`/vl-night-shift` stays **dumb** — eligibility read only; promotion is this workflow, not
agent-side. Expectation: **one chain link per merge cycle**, not a full path per overnight
run. Prep a chain: native blocked-by edges + `night-shift:chain` (+ `plan:ready`) on
successors; do not invent body-text `Blocked-by:` conventions. REST issue-dependencies
are on github.com (and GHE Cloud where available); not on GHES until those endpoints
exist there.

**Unlike chips:** night-shift PRs land **unreviewed** overnight (morning triage via
`/vl-merge-pr`). Chip PRs are reviewed as each chip opens. Branches stay
`feat|fix|docs/<issue#>-*`; after each PR, night-shift detaches its worktree so self-hosted
`_work` does not accumulate — leftovers still go through `/vl-prune` (including `_work`
checkouts on the runner box).

| Topology | What you configure |
|----------|-------------------|
| **Personal account** (current default) | Per product repo: `.github/workflows/night-shift.yml`, self-hosted runner **registered on that repo**, repo secret `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`). Same machine may be registered once per repo. |
| **Org later** (e.g. `jestrion`) | Org self-hosted runners + runner groups; workflows still per repo; optional org-level secret. **Claude Max/Pro stays personal** — the OAuth token still bills your subscription. **Personal GitHub Pro does not cover the org** — org Actions entitlements follow the org’s plan. |

Manual-only by default (`workflow_dispatch`). Uncomment `schedule:` only after a product run is
proven green. Portable templates:
`docs/project-tracking/templates/night-shift.yml` (live copy on this repo:
`.github/workflows/night-shift.yml`) and `docs/project-tracking/templates/chain-promote.yml`
(product repos copy for daisy-chain promotion; see Chain promote above). Generate a filled
night-shift YAML for a product repo at
https://vilya.jerrodtuck.com/night-shift#generate-workflow (repo name + `claude.exe` path).

#### What is generic vs what you fill in

| Concern | Where it lives |
|---------|----------------|
| Workflow shape (checkout, Git Bash pin, Claude action, Bypass, job `timeout-minutes`) | One YAML — copy the template |
| **Stack**, **Crucible variant**, **Test command**, **Manual smoke** | Product `docs/project-tracking/GITHUB-PROJECTS.md` (skills already read these) |
| `path_to_claude_code_executable` | Edit once in the copied workflow (per machine; `Get-Command claude`) |
| Machine toolchains (Node, .NET, CygNet SDK, …) | Already installed on the self-hosted box — **not** a second workflow file |

| Stack (config key) | Box must already have |
|--------------------|------------------------|
| `nextjs` | Node 20+, npm |
| `blazor` (incl. CygNet products) | .NET SDK; CygNet SDK + live access when the Test command / issue needs them |
| other | whatever that repo’s **Test command** requires |

#### Self-hosted runner bring-up (Windows)

Per **private** product repo, on the always-on box:

1. **Fill product config** — Repo config block has Stack, Crucible variant, Test command.
2. **Copy workflow** — from `docs/project-tracking/templates/night-shift.yml` →
   `.github/workflows/night-shift.yml`; set `path_to_claude_code_executable`.
3. **Register runner** — Settings → Actions → Runners → New self-hosted runner → Windows x64.
   Separate folder per repo; labels `self-hosted,windows` (per-repo registration scopes the box;
   no stack label required).
4. **Start listening** — Bring-up: `.\run.cmd` (keep terminal open). Always-on: `.\svc.cmd install`
   + `start` if present. Job waits forever if the listener is offline or `runs-on` asks for a
   missing label.
5. **Secret** — `claude setup-token` → `CLAUDE_CODE_OAUTH_TOKEN`.
6. **Bash** — the workflow prepends Git Bash via `GITHUB_PATH` and sets
   `CLAUDE_CODE_GIT_BASH_PATH`. Host PATH / WSL tweaks are unnecessary when that pin is present.
7. **Verify** — runner Idle/Online; `gh workflow run night-shift`; job leaves Queued.

## One-time repo setup

1. Create the Project (one per product); record its number + ids in the Repo config block above.
2. Sync labels into the repo; add your repo-specific `area:*` labels.
3. Record the Status field + option ids.
4. Project → ⋯ → **Workflows**: Auto-add (`is:issue`), Item added → Todo, Item closed → Done,
   PR merged → Done, Auto-add sub-issues, Item reopened → In Progress.
5. Recreate views: Current Work, Roadmap, Bugs, By area.
6. (Optional) Night-shift: add workflow + runner + `CLAUDE_CODE_OAUTH_TOKEN`; see Night-shift via
   GitHub Actions above. For daisy chains, also copy `chain-promote.yml` (`issues: write` on the
   default `GITHUB_TOKEN` is enough — no Claude secret).

## Frozen

Do not invent `BUGS.md` / `ROADMAP.md` as live trackers — use the board.

## Implementation checklist → board issues (Vilya meta)

Live work is on the board (do not grow a markdown backlog here):

| Slice | Issue |
|-------|-------|
| Site: `/night-shift` + nav + overview/setup/flows | #48 |
| Docs: `GITHUB-PROJECTS.md` direction sections | #49 |
| Skills: thin night-shift + unattended consult | #50 |
| Skills: plan→execute in start-feature + prompts | #51 |
| Skills: dating / DECISIONS read rules | #52 |
| Actions: slim workflow prompts + CygNet template | #53 |
| README purpose + install-skills | #54 |

These slices are implemented together in the night-shift direction PR; close with `Closes #48 #49 #50 #51 #52 #53 #54` (or individual PRs later).
