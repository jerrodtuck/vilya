# Vision — Vilya, the Dev Loop

**Created:** 2026-07-18
**Last updated:** 2026-07-19
**Owning issue:** [#142](https://github.com/jerrodtuck/vilya/issues/142)

> **Boundary.** This document carries intent — what the system is for and why it is
> shaped this way. Process — how the loop actually runs (lanes, labels, board ids,
> merge rules) — lives in `docs/project-tracking/GITHUB-PROJECTS.md` (the canon) and
> each skill's `SKILL.md`. If a sentence tells you what to do next, it belongs there,
> not here.

## Founding intent

One person, bearing a fleet of agent sessions, shipping multiple products — without
the process living in anyone's head. Vilya is the Dev Loop **system**: the canonical
skills, the prompt library, the flows site, and the tracking canon. It is not a
product. Products (Anduin, NaryaCommand, and whatever comes next) carry only a
config block; everything else they get by pointing here.

Three commitments define the system:

- **Humans decide; skills carry mechanics.** Issue scoping, design-fork calls, and
  merge authority stay with the operator. Branch naming, board status, PR bodies,
  changelogs are mechanical and belong to skills. Every real fork stops for the
  operator with 2–3 costed options and a stated recommendation.
- **The board is the only shared state.** Every role, session, and overnight run
  reports into the GitHub Projects board. Nothing coordinates through chat history
  or a session's memory; a fresh session with zero context can pick up any handoff
  from the board alone. That rule has a scar: status, changelogs, and roadmaps
  once lived in text-file trackers. One stream was fine; parallel agent sessions
  stomped the same files. Live coordination moved to the board so sessions stop
  racing through markdown — docs stay append-only history and design intent
  (`changelog.d/`, specs, `DECISIONS.md`), not a parallel status dashboard.
- **Written once, run anywhere.** One `SKILL.md` standard runs in both Claude Code
  and Cursor from one user-level install; one canon holds the process; the only
  per-repo variation is a single config file.

## Roles

Seats split into **direction** and **loops**. Each has a hard output boundary.

**Direction**

- **Operator** (human) — decides at forks, owns smoke, holds sole merge authority.
- **Architect** — direction and architecture. Output is issues, ADRs, and specs;
  never implements, never dispatches, never merges.

**Loops** (standing sessions that move work on the board)

- **Planner** — anytime plan loop. One session per repo, launched on Fable. Drains
  `needs:plan`, writes kickoff + verify plan on the issue, marks `plan:ready`.
  Never implements, dispatches, or merges. Detail: `docs/specs/planner-flow.md`.
- **Orchestrator** — dispatch. Watches the board, chips work out, arms monitors,
  runs the merge flow the operator authorizes. Never edits feature code itself.
- **Night-shift** — the same daytime chain, unattended. Opens PRs, stops at real
  forks, never merges. Consumes issues that already carry `plan:ready` ∧
  `night-shift:ready` — it does not invent scope overnight.

**Workers**

- **Chips** — implementation. One chip = one issue = one branch = one worktree =
  one session; each ends in a PR, never a merge.

**Cardinality.** One architect per **product board**; one orchestrator and one
Planner session per **repo**. The architect's working state is the product's board
and its repo-local direction artifacts — VISION, DECISIONS, specs — so the seat
scopes to the product; and since a product may span several repos, its one
architect spans those repos, with nothing to collide (no branches, no worktrees, no
merge state). It does not span products: direction context is deep and
product-local, and what *is* shared across products — the process itself — is
Vilya-the-system's job, not a global seat's. Exactly one orchestrator per repo: the
orchestrator *is* the repo's dispatch lock, sitting on the main clone's default
branch and owning worktree lifecycle, monitors, and the merge queue — all
repo-local state, so it neither forks within a repo nor spans two. Exactly one
Planner per repo for the same locality reason: planning quality needs a pinned
model session that owns that repo's `needs:plan` queue, not a chip and not the
thin orchestrator.

## Current direction (2026-07-19)

- **Multi-repo products on the config-only contract** — each product repo carries a
  generated, config-only `GITHUB-PROJECTS.md`; process sections live in vilya alone.
- **Planner makes plan≠execute real.** A standing Fable Planner session plans onto
  the board; Sonnet orchestrator + chips execute. Daytime may chip without
  `plan:ready` when the issue is already clear; night-shift requires both
  `plan:ready` and `night-shift:ready`. This supersedes the older “orchestrator
  `/model` is the planner / chip flow already splits models” teaching (#89 altitude).
- **The site is the teaching surface** (vilya.jerrodtuck.com): role-first — home
  routes to Architect before Orchestrator; each role gets a first-class page with an
  interactive map and its prompt library (Planner page lands with epic #203).
- **Prompts are the proving ground.** Recipes stabilize as prompt cards first and
  graduate into skills (`/vl-chip` did; Ask Vilya is the next candidate).
- **Decisions leave receipts.** Decided forks become ADRs — issue-first, mirrored to
  the append-only `DECISIONS.md` via `/vl-adr` — options, costs, the call, consequences.
- **Night-shift stays conservative.** Actions per product repo, manual-first until a
  run is proven green, PRs only — merge authority never leaves the operator. It runs
  the daytime chain's *output*, including plans the Planner already wrote.

## Non-goals

- Vilya never becomes a product, and product code never lives here.
- No markdown trackers — live work exists only on the board.
- No auto-merge, in any mode, ever.
- No second methodology for night-shift — it runs the daytime chain or nothing.
- No per-repo skill copies — skills are user-level links, merged live on pull.
- No stacked role cards — one session, one seat. And no global architect: each
  product board has its own.
