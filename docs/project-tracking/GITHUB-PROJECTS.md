# GitHub Projects — tracking model (template)

Repo-agnostic tracking model for a single .NET / C# product. **Copy this file into each repo** at
`docs/project-tracking/GITHUB-PROJECTS.md` and fill in the **Repo config** block below. Everything
under "Model" and "Process" is identical across every product; only the config block differs. The
`start-feature` / `finish-feature` / `update-docs` skills read their repo/project/label values from
here.

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

Sync the standard Type/Priority/Status labels into a new repo:

```bash
bash docs/project-tracking/scripts/sync-labels.sh <owner>/<repo>
```

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
  `gh pr merge <n> --squash --delete-branch`. The operator merges via `/merge-pr`; agents never do.

## Process

New work = GitHub issue, never a new markdown tracker file. Drive with `/start-feature` and
`/finish-feature`. One issue = one branch = one worktree (`feat|fix|docs/<issue#>-slug`).

## One-time repo setup

1. Create the Project (one per product); record its number + ids in the Repo config block above.
2. Sync labels into the repo; add your repo-specific `area:*` labels.
3. Record the Status field + option ids.
4. Project → ⋯ → **Workflows**: Auto-add (`is:issue`), Item added → Todo, Item closed → Done,
   PR merged → Done, Auto-add sub-issues, Item reopened → In Progress.
5. Recreate views: Current Work, Roadmap, Bugs, By area.

## Frozen

Do not invent `BUGS.md` / `ROADMAP.md` as live trackers — use the board.
