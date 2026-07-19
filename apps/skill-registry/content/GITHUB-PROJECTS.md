# GitHub Projects — tracking model (canon)

**Vilya is the Dev Loop system** (skills, prompts/flows, registry site, this canon) — not a
product target. **This file is the single process canon.** Product repos do **not** copy it:
each carries a **config-only** `docs/project-tracking/GITHUB-PROJECTS.md` — its Repo config
block plus a pointer back here — generated with the site's Setup → Regenerate tool. Process
sections below live only in this file; skills read config from each repo's file and process
from their own SKILL.md.

Skills (`start-feature` / `finish-feature` / `update-docs` / `night-shift` / …) read owner, project,
labels, stack, test command, and crucible variant from here. Planning vs execution **models** are
per-operator, never stored in this file, and set per tool: **Claude Code** — `model` in
`.claude/settings.local.json` (gitignored; chips inherit it via `.worktreeinclude`) is the execution
model, `/model` in the orchestrator session is the planning model; **Cursor** — per-conversation
model dropdown, both phases; **night-shift** — the model is fixed by the launcher (workflow file),
one model for the whole run. Single-session daytime work still hand-switches per `/start-feature`.

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | `jerrodtuck` | your GitHub account/org (e.g. `jerrodtuck`) |
| Repo | `jerrodtuck/vilya` | the repo issues live in |
| Project number | `8` | `gh project list --owner <owner>` |
| Project id | `PVT_kwHOAYNJN84BdH1y` | `gh project view <n> --owner <owner> --format json --jq .id` |
| Status field id | `PVTSSF_lAHOAYNJN84BdH1yzhXrqCM` | see "Field ids" below |
| **Stack** | `nextjs` | the repo's framework |
| **Crucible variant** | `crucible-nextjs` | the review skill installed in this repo |
| **Test command** | `npm test && npm run build` (in `apps/skill-registry`) | what `/finish-feature` runs in step 1 |
| **Manual smoke** | `npm run dev` in `apps/skill-registry` → http://localhost:3000 | how to launch the app for a hands-on pre-merge test (`/merge-pr`); for hardware/live-only checks write `live-only` — those go through Verifying instead |
| Default branch | `main` | `git remote show origin` |

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
| **Autonomy** | `auto:ready` (safe for night-shift) · `needs:decision` (loop stopped at a fork) |

Sync the standard Type/Priority/Status labels into a new repo:

```bash
bash docs/project-tracking/scripts/sync-labels.sh <owner>/<repo>
```

The script syncs the **standard set only** (`type:*`, `priority:*`, `auto:ready`,
`needs:decision`); `area:*` labels are repo-specific — create them from the repo's config
file's Area labels section.

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

- **Merge routing is declared on the issue at kickoff** (`/start-feature` verify plan):
  `tests-only` · `local-smoke` (hands-on check pre-merge via `/merge-pr`) · `live-only`
  (Verifying owed). Finish and merge read it — nobody re-decides at PR time.
- Done-done at merge (`tests-only` / `local-smoke`): `Closes #<issue>`
- Live retest owed (`live-only`): `Refs #<issue>` → move to Verifying after merge
- **Merge method: squash, always** — one issue = one commit on the default branch;
  `gh pr merge <n> --squash`. Remote branch removal is the repo's `delete_branch_on_merge`
  setting; local branch + worktree cleanup is `/prune`'s job, never merge-time. The operator
  merges via `/merge-pr`; agents never do.

## Process

### Daytime chain (primary)

New work = GitHub issue, never a new markdown tracker file. One issue = one branch = one worktree
(`feat|fix|docs/<issue#>-slug` for single-session daytime work; `claude/*` for chips).

```text
/start-feature → implement → /crucible-<stack> → remediate → /finish-feature → /merge-pr → Done
```

`/update-docs` is a **routing** skill (manual / mid-work: “where does this go?”, log a decision,
capture a bug). It is **not** stepped by the happy path. Specs and changelog fragments are written
inline by `/start-feature` and `/finish-feature`.

### Chip chain (dispatched)

```text
/start-feature (plan, orchestrator) → chip dispatch (spawn_task, brief carries the issue, verify
routing, crucible gate; orchestrator same turn: arms a Monitor-tool monitor + moves the issue to
In Progress) → chip implements → /crucible-<stack> → /finish-feature (PR) → completion comment
on the issue (gh); orchestrator monitor picks it up → operator /merge-pr → auto-archive on PR
close → periodic /prune --apply
```

Chips never merge, never spawn sessions, and report via a **completion comment on the issue**
(`gh` — no prompt, attended or not); the orchestrator's dispatch monitor picks it up (loop
documented on the site's Setup page and in `/chip`). Dispatch carries **two same-turn
obligations**: arm the monitor — the **Monitor tool**, never a background shell loop, which
detects but cannot notify — and move the issue to **In Progress** on the board, since GitHub's
built-in workflows only cover added→Todo and closed/merged→Done. The orchestrator cards carry
the full wording.

### Shared files / worktrees

| File | Parallel rule |
|------|----------------|
| This `GITHUB-PROJECTS.md` | **Read-only on feature branches** unless the issue is explicitly about changing config. Config edits prefer a docs/config issue and merge-boundary. |
| `docs/DECISIONS.md` | Append-only, newest at top, dated `## YYYY-MM-DD — Title`. Prefer the decision on the **issue** first; one file append on the owning branch. **Read:** grep/search by topic or issue # — do not load the whole file by default. |
| `docs/specs/*.md`, `docs/design/*.md`, `docs/VISION.md` | Slow-moving. On create: `Created: YYYY-MM-DD` + owning issue. On material revise: bump `Last updated: YYYY-MM-DD`. |
| `docs/project-tracking/changelog.d/YYYY-MM-DD-<slug>.md` | One fragment per PR — safe in parallel. Never edit assembled `CHANGELOG.md` on a feature branch. |

### Night-shift via GitHub Actions

Night-shift is **not** a second methodology. It runs the **same daytime chain** unattended on a
**product** repo (headless Claude Code via Actions). Vilya ships **one** generic workflow
template; each product repo copies it. Stack-specific commands are **not** forked into YAML —
the skill reads them from that product’s config-only `GITHUB-PROJECTS.md`.

Eligibility: labeled `auto:ready`, not `needs:decision`, not `type:epic`. Opens PRs; **never
merges**. At a real design fork: comment options + recommendation, label `needs:decision`, Blocked,
next issue.

| Topology | What you configure |
|----------|-------------------|
| **Personal account** (current default) | Per product repo: `.github/workflows/night-shift.yml`, self-hosted runner **registered on that repo**, repo secret `CLAUDE_CODE_OAUTH_TOKEN` (`claude setup-token`). Same machine may be registered once per repo. |
| **Org later** (e.g. `jestrion`) | Org self-hosted runners + runner groups; workflows still per repo; optional org-level secret. **Claude Max/Pro stays personal** — the OAuth token still bills your subscription. **Personal GitHub Pro does not cover the org** — org Actions entitlements follow the org’s plan. |

Manual-only by default (`workflow_dispatch`). Uncomment `schedule:` only after a product run is
proven green. Portable template:
`docs/project-tracking/templates/night-shift.yml` (live copy on this repo:
`.github/workflows/night-shift.yml`). Generate a filled YAML for a product repo at
https://vilya.jerrodtuck.com/night-shift#generate-workflow (repo name + `claude.exe` path).

#### What is generic vs what you fill in

| Concern | Where it lives |
|---------|----------------|
| Workflow shape (checkout, Git Bash pin, Claude action, Bypass, max-turns) | One YAML — copy the template |
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
   GitHub Actions above.

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