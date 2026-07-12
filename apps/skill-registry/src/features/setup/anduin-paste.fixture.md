# GitHub Projects — Anduin tracking model

Same process as Narya Command ([naryacommand GITHUB-PROJECTS.md](https://github.com/jerrodtuck/naryacommand/blob/master/docs/project-tracking/GITHUB-PROJECTS.md)), scoped to **this product**.

## Architecture decisions

- **Owner:** `jerrodtuck` personal account owns Projects.
- **One Project per product.** Anduin has its own Project (not Project #3).
- **Labels drive the board;** Status is the one native field (Todo · In Progress · Blocked · Verifying · Done).
- **Issues live in `jerrodtuck/anduin`.**
- **Specs stay in-repo** under `docs/specs/`, linked from the issue.
- **`changelog.d/` is release notes**, orthogonal to the board.

## The Anduin project

- Board: https://github.com/users/jerrodtuck/projects/4 (project number **4**)
- Project id: `PVT_kwHOAYNJN84BdC4c`
- Spans: `anduin`
- **Manual smoke:** `dotnet run --project src/Anduin.App/Anduin.App.csproj` → `http://127.0.0.1:5088/health` (Valkey on `localhost:6379`; see [host-windows-dev.md](../ops/host-windows-dev.md)) — how to launch the app for a hands-on pre-merge test (`/merge-pr`). CygNet-fed checks (Point Cache, DDS) are `live-only` — those go through Verifying instead.

### Labels

| Signal | Values |
|--------|--------|
| **Type** | `type:bug` · `type:feature` · `type:epic` · `type:task` |
| **Priority** | `priority:critical` · `priority:high` · `priority:medium` · `priority:low` |
| **Area** | `area:live-points` · `area:transactions` · `area:egress-mqtt` · `area:egress-sse` · `area:subscriptions` · `area:commands` · `area:host` · `area:building-blocks` · `area:docs` · `area:installer` |
| **Status** | Todo · In Progress · Blocked · Verifying · Done |

### Status helper

```text
Project number:  4
Project id:      PVT_kwHOAYNJN84BdC4c
Status field:    PVTSSF_lAHOAYNJN84BdC4czhXnTSM
  Todo:          f75ad846
  In Progress:   47fc9ee4
  Blocked:       7e864448
  Verifying:     0fd3026c
  Done:          98236657
```

## Frozen

There is no legacy folder tracker to freeze. Do not invent `BUGS.md` / `ROADMAP.md` as live trackers — use the board.
