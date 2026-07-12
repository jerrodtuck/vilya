---
name: update-docs
description: Route new work and doc changes — GitHub issues for live work; files only for design docs and history. Use when the user says "track this", "capture that bug/idea", "where does this go", "log a decision", "add a spec", or describes work that needs recording.
---

# Update Docs (any stack) — where does this go?

> Tracking + this repo's ids/labels:
> `docs/project-tracking/GITHUB-PROJECTS.md`.
> Companions: [/start-feature](../start-feature/SKILL.md) · [/finish-feature](../finish-feature/SKILL.md).

**Routing skill** — invoke when something needs placing. It is **not** part of the happy path
(`/start-feature` → crucible → `/finish-feature` → `/merge-pr`). Specs and changelog fragments on
that path are written inline by start/finish; this skill is the **rulebook** for dates, velocity,
and mid-work capture.

## The one rule

**New WORK is a GitHub issue on this repo's Project — never a markdown tracker file.** Files are for
*design intent* (specs, decisions, VISION) and *append-only history* (`changelog.d/`). Capture, then
return to the current branch.

## Decision tree

| When this happens | It becomes | Then you |
|---|---|---|
| Bug surfaces mid-work | Bug issue — link to current issue | keep going |
| Roadmap enhancement / idea | Feature issue (sub-issue if under an epic) | keep going |
| Multi-stream initiative | Epic + sub-issues | start one sub-issue |
| Small chore | Task issue | keep going |
| Design decision | `docs/DECISIONS.md` — reference from issue | note it |
| Non-trivial design | `docs/specs/` or `docs/design/` — link from issue | write the doc |
| Current work finished | PR `Closes #<issue>` + `changelog.d/` fragment | merge → Done |

## Creating an issue

```bash
url=$(gh issue create --repo <owner>/<repo> \
  --title "<title>" --body "<context; if mid-work: 'Found while working #<n>'>" \
  --label type:bug --label priority:high --label area:<slice>)
gh project item-add <n> --owner <owner> --url "$url"
```

Owner, project number, and `area:*` labels: `docs/project-tracking/GITHUB-PROJECTS.md`.

## Files that still go under `docs/`

| Velocity | Files | Dates |
|---|---|---|
| Slow-moving | `docs/specs/*.md`, `docs/design/*.md`, `docs/VISION.md` | On create: `Created: YYYY-MM-DD` + owning issue. On material revise: bump `Last updated: YYYY-MM-DD`. |
| Append-only | `changelog.d/YYYY-MM-DD-<slug>.md`, `DECISIONS.md` | Changelog: dated filename. Decisions: newest-at-top `## YYYY-MM-DD — Title` (Choice / Why / Rejected / Follow-on). |

### Reading `DECISIONS.md`

**Do not** load the whole file by default. Grep/search for the topic or issue #, or read the header
plus the newest few entries for format. Prefer logging the decision on the **issue** first, then one
append on the owning branch (or at merge-boundary).

### Shared / collision-prone

| File | Rule |
|---|---|
| `docs/project-tracking/GITHUB-PROJECTS.md` | **Read-only on feature branches** unless the issue is about changing config |
| `docs/DECISIONS.md` | One writer preferred; issue-first then append |
| `changelog.d/*` | One fragment per PR — safe |

## Common mistakes

- Markdown file for new work instead of an issue
- Skipping `item-add` or labels
- Letting a surfaced bug derail the current branch
- Editing `CHANGELOG.md` on a feature branch
- Putting long design only in the issue body (use a spec)
- Editing `GITHUB-PROJECTS.md` “while here” on an unrelated feature branch
- Adding feature logic to the shared kernel, or coupling across product/feature boundaries
- Loading all of `DECISIONS.md` into context when a grep would do
