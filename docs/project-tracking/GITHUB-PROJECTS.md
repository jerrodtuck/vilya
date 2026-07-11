# GitHub Projects — tracking model (template)

Repo-agnostic tracking model for a single .NET / C# product. **Copy this file into each repo** at
`docs/project-tracking/GITHUB-PROJECTS.md` and fill in the **Repo config** block below. Everything
under "Model" and "Process" is identical across every product; only the config block differs. The
`start-feature` / `finish-feature` / `update-docs` skills read their repo/project/label values from
here.

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | `<owner>` | your GitHub account/org (e.g. `jerrodtuck`) |
| Repo | `<owner>/<repo>` | the repo issues live in |
| Project number | `<n>` | `gh project list --owner <owner>` |
| Project id | `<PVT_...>` | `gh project view <n> --owner <owner> --format json --jq .id` |
| Status field id | `<PVTSSF_...>` | see "Field ids" below |
| **Stack** | `blazor` \| `nextjs` \| … | the repo's framework |
| **Crucible variant** | `crucible-blazor` \| `crucible-nextjs` | the review skill installed in this repo |
| **Test command** | `dotnet test` \| `npm test && npm run build` \| … | what `/finish-feature` runs in step 1 |
| Default branch | `master` or `main` | `git remote show origin` |

Status option ids (fill after first setup):

```text
Todo:         <id>
In Progress:  <id>
Blocked:      <id>
Verifying:    <id>
Done:         <id>
```

Get the Status field id + option ids in one shot:

```bash
gh project field-list <n> --owner <owner> --format json \
  --jq '.fields[] | select(.name=="Status") | {id, options: [.options[] | {name, id}]}'
```

### Area labels — define per repo

Areas name *this* product's vertical slices. Replace the examples with your repo's slices:

`area:<slice-a>` · `area:<slice-b>` · `area:docs` · `area:installer`

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

- Done-done at merge: `Closes #<issue>`
- Live retest owed: `Refs #<issue>` → move to Verifying after merge

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
