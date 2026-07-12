# Vilya

> *The Ring of Air — mightiest of the Three. The workflow that orchestrates every project.*

**Vilya is the Dev Loop system** — not a product like Anduin or NaryaCommand. It holds the
canonical skills, the registry/flows site, the prompts, and the tracking template that every
product repo copies. Built for **Claude Code + Cursor**, across **.NET/Blazor and Next.js**.

**Daytime is primary.** You orchestrate with skills; the board is the shared state. Night-shift
runs that **same** chain unattended via GitHub Actions on each product repo.

```
vilya/
├── skills/                     # canonical source of truth — the SKILL.md skills
│   ├── start-feature/          # process: issue → worktree → plan → consult
│   ├── finish-feature/         # process: tests → crucible → PR → changelog
│   ├── merge-pr/               # process: triage → test → squash-merge
│   ├── update-docs/            # routing: where does this go? (not on the happy path)
│   ├── history/                # recall: reconstruct what we tried
│   ├── crucible-blazor/        # review: strict VSA+SOLID+Blazor (manual-only)
│   ├── crucible-nextjs/        # review: same for feature-slice + server/client
│   └── night-shift/            # autonomous: daytime chain → opens PRs
├── apps/
│   └── skill-registry/         # Next.js (VSA) app — The Dev Loop site + registry
├── docs/project-tracking/      # GITHUB-PROJECTS.md — per-repo config + shared process
└── scripts/
    ├── install-skills.sh       # sync skills → ~/.claude/skills (Cursor reads it too)
    └── install-skills.ps1      # (Windows)
```

See **HANDOFF.md** for the exact steps to bootstrap this in Claude Code. Live site:
**https://vilya.jerrodtuck.com** (Overview · Flows · Skills · Setup · Night shift).

## The model

- **Skills are user-level** — install once (`scripts/install-skills.*`) to
  `~/.claude/skills`; Cursor scans that directory as a compatibility root, so
  the same `SKILL.md` runs in both tools from one install. (A second copy in
  `~/.cursor/skills` would double-list skills in Cursor — `--include-cursor`
  exists only for old Cursor builds.)
- **Per-repo config is the only thing that varies** — each product you run the
  loop on gets its own `docs/project-tracking/GITHUB-PROJECTS.md` (Models,
  shared-file rules, night-shift Actions topology).
- **Happy path:** `/start-feature` → implement → crucible → `/finish-feature` →
  `/merge-pr`. `/update-docs` is routing only.
- **The registry app** reads `skills/` as its source of truth (via `SKILLS_DIR`)
  and surfaces each skill's version history from git.

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
