---
name: vl-product-map
description: Survey the product's as-built architecture against its as-intended direction and emit the diff — a divergence list where every entry cites both sides (issue #s, commit shas, file paths, section names) with an evidence class per claim. Use when the user says "product map", "as-built vs as-intended", "ground truth check", "survey the architecture", "is the vision still true", or a /vl-arch session needs the gap list before proposing direction.
codex-support: "shared-compatible"
codex-notes: "Read-only evidence survey; only caller-named issue comments are an exception."
codex-invocation: "$vl-product-map"
codex-prerequisites: "Repo sources, intended design and authenticated GitHub read access."
---

# Product map — as-built vs as-intended (any stack)

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

Use $vl-product-map when discovered, or explicitly read and apply this SKILL.md.
Slash examples below name companion skills; in Codex use their $vl-* invocation
or read/apply source. This does not activate another seat or expand authority.
The shared procedure and quality bar below apply unchanged.

> **Scope:** [/vl-arch](../vl-arch/SKILL.md)'s ground-truth instrument, **read-only** — it surveys and reports,
> never writes files, never files issues, never mutates the board. Companion to
> [/vl-history](../vl-history/SKILL.md) (one topic's timeline through time; this is the whole product
> at one instant) and [/vl-adr](../vl-adr/SKILL.md) (where findings that get decided are recorded).
> Owner / repo / project number / area labels come from this repo's
> `docs/project-tracking/GITHUB-PROJECTS.md` config block — that is all this skill reads from
> it. The procedure is stack-neutral.
>
> The survey unit is the **product board**. A product spanning several repos runs steps 2–4
> once per repo (each from its own config block) and merges the pair tables into one map — the
> `/vl-arch` seat is per board, not per repo (today all products are single-repo; this is the
> contract, not new machinery).

The valuable output is **not a diagram** — it is gap findings with receipts: each divergence
citing the as-built evidence (commit shas, issue #s, file paths) *and* the as-intended section
it contradicts or is absent from, every claim carrying its evidence class. "VISION doesn't know
about epic #N" beats any rendered map.

## 1. Timestamp the snapshot

A live board can move under a survey — in one real run a gap flipped to true mid-survey because
a PR merged. So first, pin what you surveyed:

- Record **date + time**, and the default branch **HEAD sha** (`git rev-parse --short HEAD`).
- Every claim in the output is "as of this snapshot". If you observe a source change mid-run
  (an issue closes, a file lands), re-check the affected claim and note that it moved.

## 2. Gather as-built (what actually exists)

- **Slice / area survey** — tree-list the code layout (slice or feature directories per the
  repo's conventions) and map directories to the repo's `area:*` labels from the config block.
- **What shipped** — recent merged history on the default branch: `git log --oneline -30`,
  plus `gh issue list --repo <owner>/<repo> --state closed --limit 30` for recently Done work.
- **Board reality** — open issues by area: `gh issue list --repo <owner>/<repo> --state open`.
- **Targeted reads** — for any claim you will make, read the artifact that would make it true
  (the route file, the nav, the config). A tree listing alone is "unverified"; a direct read
  is "verified".

## 3. Gather as-intended (what the docs and board promise)

- **`docs/VISION.md`** — founding intent, roles, current direction, non-goals. If it is absent,
  that is itself a finding. If its content has been authored on an issue but not yet merged,
  read it from that issue's authored comment and **say so in the output's sources line**.
- **`docs/specs/*`** — per-feature design intent.
- **`docs/DECISIONS.md`** — grep by surveyed area/topic (never load end-to-end); a decided ADR
  is intent with receipts. A shipped artifact that contradicts a decided entry (and no later
  entry supersedes it) is a divergence.
- **Open epics / roadmap items** — `gh issue list --repo <owner>/<repo> --label type:epic
  --state open` (plus any `Roadmap`-typed items on the board).
- **`README.md` promises** and any canon cross-references (files the canon or the docs say
  should exist).
- **Frozen exemption:** a file that self-declares as a frozen snapshot (e.g. a "frozen —
  historical record" header) is history, not intent — stale content inside it is **not** a
  finding. List it in the sources line as exempt rather than silently skipping it.

## 4. Match the pairs

Walk both directions and record every pairing attempt — the pair table is what makes "no
divergence" an honest checked claim instead of silence:

- For each **as-built slice/area** → the spec, VISION section, or epic that intends it.
- For each **as-intended item** (VISION claim, spec, open epic) → the shipped artifact that
  realizes it.

Unmatched or contradicting entries in either direction are divergences. The classic shapes:
a slice with no spec, a spec with no slice, an epic touching an area that does not exist, a
dead slice (built, but nothing on the board or in the docs owns it), a doc claim the
artifact contradicts, and an artifact contradicting a decided ADR.

## 5. Emit — map + divergence list

```markdown
# Product map — <owner>/<repo> @ <sha> · <YYYY-MM-DD HH:MM>

**As-built sources:** <tree paths, git log range, board queries run>
**As-intended sources:** <docs read; substitutions ("VISION read from #N authored comment —
file unmerged"); exemptions ("HANDOFF.md — self-declared frozen, exempt")>

## Matched pairs
| As-built | As-intended | Verdict |
|----------|-------------|---------|
| <slice/area (path)> | <spec / VISION § / epic #> | matched · built-no-intent · intended-no-build |

## Divergences
1. **<one-line gap>** — as-built: <evidence: path / sha / issue #> [verified|tested|unverified];
   as-intended: <doc § or epic # it contradicts or is missing from> [verified|tested|unverified].
```

- **Evidence class per claim** — `verified` (direct read this run), `tested` (executed and
  observed), `unverified` (inferred from a listing or a doc; label it, never assert it).
- **Zero divergences** → keep the matched-pairs table and state "no divergence across the
  N checked pairs" — the claim is the table, not the absence of a list.
- Deliver to **chat** always; when the caller names an owning issue, also post it as a comment:
  `gh issue comment <n> --repo <owner>/<repo> --body-file <map.md>` (body-file, not inline —
  the output is full of markdown).

## Consumer note — where findings go

This skill hands the list to the session that ran it; it files nothing itself. Findings route
per the architect conventions: a divergence that opens a real design fork → **2–3 options with
costs and a stated recommendation** (the operator decides); a call once decided → [/vl-adr](../vl-adr/SKILL.md);
work items → issues on the board (never a markdown tracker).

## Guardrails

- **Read-only, absolutely.** No file writes, no issue creation, no label or status changes.
  The optional issue comment (step 5, caller-named) is the single exception.
- **No receipts, no claim.** Anything not directly read or executed this run is labeled
  `unverified` — never asserted as fact.
- **Grep, don't load.** `docs/DECISIONS.md` and other append-only histories are searched by
  topic or issue #, never read end-to-end.
- **Wrong skill** for "what have we tried on #N" — that is [/vl-history](../vl-history/SKILL.md)'s
  timeline. This is a whole-product cross-section at one instant.

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
