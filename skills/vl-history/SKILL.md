---
name: vl-history
description: Reconstruct the full history of an issue, feature, or topic — what we've tried, in order, and what happened each time. Use when the user asks "what did we do last on X", "what have we tried on <issue/topic>", "history of #N", "previous attempts", "catch me up on <area>", or points at an issue and wants the backstory.
---

# History — what have we done on this?

> **Scope:** Internal dev-process skill, **read-only** — it reconstructs and reports, never writes.
> Companion to [/vl-start-feature](../vl-start-feature/SKILL.md) · [/vl-finish-feature](../vl-finish-feature/SKILL.md) ·
> [/vl-update-docs](../vl-update-docs/SKILL.md).
> Repo / owner / project live in this repo's
> `docs/project-tracking/GITHUB-PROJECTS.md` config block.

The board, the PRs, and any in-repo history (specs, decisions, changelog, frozen legacy trackers)
each hold a piece of the story. This skill stitches them into one chronological answer. Run the `gh`
queries against `<owner>/<repo>` from the config — and against sibling repos when the topic spans them.

## 1. Resolve the target

- **Arg is an issue number** (`#N` / `N`) → start there.
- **Arg is a topic / keyword / area** → find the relevant issues first, across open *and* closed:
  `gh issue list --repo <owner>/<repo> --state all --search "<keywords>"`. Also grep the repo's
  history: `docs/specs/`, `docs/DECISIONS.md`, `docs/project-tracking/changelog.d/`, and any
  **frozen legacy trackers the repo happens to keep** (`BUGS.md`, `BUGS-ARCHIVE.md`, `bugs/`) — only
  if they exist; many repos have none.
- **Cross-project** → run the `gh` queries against each relevant repo.
- Ambiguous which issue → list the top candidates and ask (or cover the best 2–3).

## 2. Gather the sources (breadth-first; the timeline is the spine)

For each target issue:

1. **Timeline** — the backbone. `gh api repos/<owner>/<repo>/issues/<n>/timeline` shows labels,
   `project_v2_item_status_changed` (Todo→In Progress→…→Done), reopens, `cross-referenced` (related
   issues/PRs), and `closed`/merge-commit references. **Each linked PR is an attempt.**
2. **Body + comments** — `gh issue view <n> --repo <owner>/<repo> --comments`. The original report,
   provenance ids, and any decision notes.
3. **Related / linked issues** — cross-referenced issues from the timeline; parent/sub-issues; and
   same-area issues (`gh issue list --repo <owner>/<repo> --search "<area/keywords>" --state all`).
4. **The PRs (the actual attempts)** — for each linked PR:
   `gh pr view <pr> --repo <owner>/<repo> --json title,mergedAt,body,files` plus its release note
   (grep `docs/project-tracking/changelog.d/` for the slug / PR number).
5. **Decisions & reversals** — grep `docs/DECISIONS.md` for the topic (rationale, removed features,
   "superseded by"). **Do not** read the whole file end-to-end; search by topic or issue #.
6. **Pre-migration forensics (only if applicable)** — if the repo kept legacy trackers before its
   GitHub-Projects migration and the issue traces to a legacy id (`BUG-…`, `fb_…`), grep those and
   note the origin. Repos with no legacy trackers skip this.
7. **Code trail (optional)** — `git log --grep "#<n>"` for the commits.

## 3. Synthesize — a skimmable "what we tried"

Lead with the answer, not the raw dump:

- **The arc** — one line: where this started, where it stands now (open / done / superseded /
  fixed-pending-live-retest).
- **Attempts, in order** (say whether newest- or oldest-first) — each is: *date · what was tried
  (PR # + one line) · outcome* (merged & verified / reverted / superseded / still pending live
  retest). Pull "what happened" from PR bodies + changelog fragments + issue comments, not guesswork.
- **Decisions / reversals** — any DECISIONS rows or "we changed approach because …" turns.
- **Open threads** — what's still not done (open sub-issues, fixed-pending items, filed follow-ups).
- **Sources** — link the issues/PRs so the user can drill in.

## Guardrails

- **Don't fabricate.** If a PR body / changelog fragment is thin, say "PR #X — details sparse" rather
  than inventing an outcome. Distinguish "merged" from "merged and live-verified."
- **Wrong skill for "what shipped lately across all projects"** (a recency sweep, not one topic) —
  that's a cross-repo digest; say so and point there instead.
- Keep it a recall aid: tight, chronological, linked. The user is re-orienting, not reading a report.
