# Vilya

> *The Ring of Air — mightiest of the Three. The workflow that orchestrates every project.*

**Vilya is the Dev Loop system** — not a product like Anduin or NaryaCommand. It holds the
canonical skills, the registry/flows site, the prompts, and the tracking template that every
product repo copies. Built for **Claude Code + Cursor + Codex desktop**, with **per-stack crucible dialects**
across frontend (Next.js, .NET/Blazor) and backend/Python (FastAPI, Django, ML) repos.

**Daytime is primary.** You orchestrate with skills; the board is the shared state. Night-shift
runs that **same** chain unattended via GitHub Actions on each product repo.

```
vilya/
├── skills/                     # canonical source of truth — the SKILL.md skills
│   ├── start-feature/          # process: issue → worktree → setup (Plan → /planner)
│   ├── finish-feature/         # process: tests → crucible → PR → changelog
│   ├── merge-pr/               # process: triage → test → squash-merge
│   ├── chip/                   # dispatch: issue → background worker session → PR
│   ├── prune/                  # cleanup: merged worktrees + leftover branches
│   ├── update-docs/            # routing: where does this go? (not on the happy path)
│   ├── adr/                    # decisions: issue-first ADR → DECISIONS.md mirror
│   ├── history/                # recall: reconstruct what we tried
│   ├── crucible-blazor/        # review: strict VSA+SOLID+Blazor (manual-only)
│   ├── crucible-nextjs/        # review: same for feature-slice + server/client
│   ├── crucible-fastapi/       # review: same, FastAPI dialect
│   ├── crucible-django/        # review: same, Django dialect
│   ├── crucible-ml/            # review: same, Python ML/data dialect
│   ├── planner/                # autonomous: drain needs:plan → plan:ready (Fable)
│   └── night-shift/            # autonomous: daytime chain → opens PRs
├── apps/
│   └── skill-registry/         # Next.js (VSA) app — The Dev Loop site + registry
├── docs/project-tracking/      # GITHUB-PROJECTS.md — per-repo config + shared process
└── scripts/
    ├── install-skills.sh       # link skills → ~/.claude/skills (Cursor reads it too)
    └── install-skills.ps1      # (Windows: junctions, no admin)
```

See **HANDOFF.md** for the exact steps to bootstrap this in Claude Code. Live site:
**https://vilya.jerrodtuck.com** (Overview · Architect · Orchestrator · Skills · Setup · Night shift · Desktop differences).

## The model

- **Skills are user-level** — link once per machine (`scripts/install-skills.*`):
  each `~/.claude/skills/<name>` is a junction/symlink to the repo's
  `skills/<name>`, so skill merges are live on `git pull` with nothing to
  re-run. Cursor scans that directory as a compatibility root, so the same
  `SKILL.md` runs in both tools from one install. (A second install root in
  `~/.cursor/skills` would double-list skills in Cursor — `--include-cursor`
  exists only for old Cursor builds.)
- **Per-repo config is the only thing that varies** — each product you run the
  loop on gets its own `docs/project-tracking/GITHUB-PROJECTS.md` (board ids,
  shared-file rules, night-shift Actions topology).
- **Happy path:** `/start-feature` → implement → crucible → `/finish-feature` →
  `/merge-pr`. `/update-docs` is routing only.
- **The registry app** reads `skills/` as its source of truth (via `SKILLS_DIR`)
  and surfaces each skill's version history from git.

## Codex desktop

Add the Codex skill target with `pwsh scripts/install-skills.ps1 -IncludeCodex` or
`bash scripts/install-skills.sh --include-codex`: `$HOME/.agents/skills`, preserving
the Claude/Cursor default and explicit custom targets. Verify actual discovery and the
resolved source in the session, then use `$vl-orch-codex` or explicitly read/apply its
SKILL.md. Installation alone is not invocation evidence.

The Codex orch owns planning; no standing Planner seat is required. It records the accepted
plan and verification routing on the issue before dispatching implementation in a verified
isolated worktree. Subagent spawning alone is not isolation. Phase models are configurable:
resolve current planning/workhorse families from runtime capabilities, honor explicit operator
pins, and preserve configured defaults without authorized overrides. Both seat entries carry
trusted human authorization for messaging within the repo/product board.

Start with [Setup](https://vilya.jerrodtuck.com/setup?host=codex),
[Architect](https://vilya.jerrodtuck.com/architect?host=codex),
[Orch planning/chips/recovery](https://vilya.jerrodtuck.com/orch?host=codex) and
[Differences](https://vilya.jerrodtuck.com/differences?host=codex).
Per-skill applicability is in the registry and
[coverage audit](docs/design/codex-skill-coverage.md).
Codex CLI and a new unattended backend are deferred; existing night-shift eligibility stays
`plan:ready ∧ night-shift:ready`. The full desktop cycle and interruption recovery are
separate [#329 integration gates](https://github.com/jerrodtuck/vilya/issues/329).

## Deployment

The site + registry deploy to **Railway** as one service from the **repo root**
(the app reads `../../skills` and git history, so the service must not be
scoped to `apps/skill-registry`). Config-as-code: `railway.json` (build/start
commands, healthcheck), `nixpacks.toml` (adds `git` to the image), root
`package.json` (proxy scripts). Live at **https://vilya.jerrodtuck.com**.

## The name

Narya and Anduin are projects; **Vilya** is the ring that rules the process that
builds them. You are its bearer — the orchestrator. The skills are your
instruments; the board is the one shared state; the loop turns.
