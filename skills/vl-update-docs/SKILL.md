---
name: vl-update-docs
description: Route new work and doc changes — GitHub issues for live work; files only for design docs and history. Use when the user says "track this", "capture that bug/idea", "where does this go", "log a decision", "add a spec", or describes work that needs recording.
codex-support: "shared-compatible"
codex-notes: "Shared issue-versus-document routing; preserve file ownership."
codex-invocation: "$vl-update-docs"
codex-prerequisites: "Repo config and authorization for requested issue or document writes."
---

# Update Docs (any stack) — where does this go?

## Shared communication

Read and apply the full [vl-adhd writing policy](../vl-adhd/SKILL.md) and
[vl-present presentation contract](../vl-present/SKILL.md) at entry. On Codex use
`$vl-adhd` / `$vl-present` when discovered; on Claude Code or Cursor use their
supported `/vl-adhd` / `/vl-present` invocation, or explicitly read/apply these
resolved sources. Identify an unknown host before choosing syntax. Apply them to
all authored prose, including complete briefs, ADRs, specs and PR evidence.
Preserve facts, uncertainty, options/costs, permissions and stop/verification gates.
Explicit formats and fixed output contracts win; presentation grants no new authority.


## Codex invocation

Use $vl-update-docs when discovered, or explicitly read and apply this SKILL.md.
Slash examples below name companion skills; in Codex use their $vl-* invocation
or read/apply source. This does not activate another seat or expand authority.
The shared procedure and quality bar below apply unchanged.

> Tracking + this repo's ids/labels:
> `docs/project-tracking/GITHUB-PROJECTS.md`.
> Companions: [/vl-start-feature](../vl-start-feature/SKILL.md) · [/vl-finish-feature](../vl-finish-feature/SKILL.md).

**Routing skill** — invoke when something needs placing. It is **not** part of the happy path
(`/vl-start-feature` → crucible → `/vl-finish-feature` → `/vl-merge-pr`). Specs and changelog fragments on
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
| Design decision | `docs/DECISIONS.md` — reference from issue | run [/vl-adr](../vl-adr/SKILL.md) — it captures + mirrors |
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

**Issue body:** present-tense facts with evidence. Planned work is scope ("this issue adds X"),
never an existing artifact ("X exists" / "#N shipped Y"). When naming another issue's
deliverable, state that issue's **actual current status, checked at write time**. An
aspirational body is a false record the moment it is filed.

## Files that still go under `docs/`

| Velocity | Files | Dates |
|---|---|---|
| Slow-moving | `docs/specs/*.md`, `docs/design/*.md`, `docs/VISION.md` | On create: `Created: YYYY-MM-DD` + owning issue. On material revise: bump `Last updated: YYYY-MM-DD`. |
| Append-only | `changelog.d/YYYY-MM-DD-<slug>.md`, `DECISIONS.md` | Changelog: dated filename. Decisions: newest-at-top `## YYYY-MM-DD — Title`; entry shape owned by [/vl-adr](../vl-adr/SKILL.md). |

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
- Writing planned work as if already shipped, or claiming another issue shipped a deliverable
  without checking that issue's status at write time
- Editing `GITHUB-PROJECTS.md` “while here” on an unrelated feature branch
- Adding feature logic to the shared kernel, or coupling across product/feature boundaries
- Loading all of `DECISIONS.md` into context when a grep would do

## New-model recalibration

Apply this section only when the operator asks about a newly released model or a
routing recalibration. Route execution to the Vilya Codex orchestrator and require
it to read the full model routing and repair contract at `../vl-orch-codex/references/model-routing.md` in full.
This skill keeps its normal lane and grants no paid API, deployment or publication
authority.

Screen current independent benchmark evidence and official model capabilities and
pricing before running Vilya tests. Challenge the lowest applicable proven seat first.
Run only the smallest matched fixture needed to test what external data cannot show:
skill adherence, repair rate, accepted workflow cost or native Codex transfer. Promote
only after accepted evidence and focused native confirmation; ties, incomplete runs
and exhausted limits keep the incumbent.

The website is the evidence and policy surface, not a paid-execution control. Keep
credentials and launches operator-only. Publish the sanitized result, limitations and
routing change on `/evaluation`; update affected skills only when evidence changes the
route. This avoids repeating a full model tournament for every release.
