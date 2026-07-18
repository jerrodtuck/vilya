---
name: adr
description: Capture an architecture/product decision as a dated ADR — options with costs, the decision, consequences, evidence — appended newest-at-top to docs/DECISIONS.md and mirrored on the owning issue. Use when the user says "log a decision", "ADR", "record why we chose", "write up that decision", or a fork has just been decided and needs recording.
---

# ADR — decision capture (any stack)

> Routing companion: [/update-docs](../update-docs/SKILL.md) sends "log a decision" here.
> Owner / repo come from this repo's `docs/project-tracking/GITHUB-PROJECTS.md` config block —
> that is all this skill reads from it. The procedure is stack-neutral.

An ADR records **why with receipts, not just what**: the options that were on the table, what
each would have cost, which was chosen, and what follows — every claim carrying its evidence
(issue #s, commit shas, PR #s, dated prior entries). It lands twice, **issue-first**: as a
comment on the owning issue, then one append on the owning branch's `docs/DECISIONS.md`.

## 1. Gather the decision context

Collect all of this before writing; ask for whatever is missing rather than inventing it:

- **Owning issue #** — where the fork was raised or decided. The mirror comment goes there.
- **Options considered, each with its cost** — including the rejected ones. A record with one
  option is a description, not a decision.
- **The decision** — which option, who decided (the operator, unless stated otherwise), dated.
- **Consequences / follow-on** — what this commits us to; work it creates, unblocks, or forbids.
- **Evidence citations** — issue #s, commit shas, PR #s, dated DECISIONS entries backing each
  claim. Receipts per claim, not a bare narrative.
- **Precedent decisions** — grep `docs/DECISIONS.md` for the topic / issue #; if prior entries
  shaped this call, cite them by `YYYY-MM-DD — Title`.

## 2. Write the dated entry

Heading format is canon: `## YYYY-MM-DD — Title` (date = when the decision was made, not when
you're writing it up). Body covers the canon's Choice / Why / Rejected / Follow-on in this shape:

```markdown
## YYYY-MM-DD — <Title> (#<owning issue>)

**Decision:** <chosen option, one or two sentences> (decided by <who>, YYYY-MM-DD).

**Options considered:**
1. <option> — cost: <what it would have cost>
2. **<chosen option>** — cost: <what it costs> ← chosen
3. <option> — cost: <…>

**Why:** <the reasoning that picked the winner, citing evidence per claim>.

**Consequences:** <what follows — commitments, created/unblocked work, constraints>.

**Evidence:** #<issue> (fork comment), <sha>/<PR #>, prior entry `YYYY-MM-DD — Title` if any.
```

Multi-fork decisions (one issue resolving several forks at once) stay **one entry** — one
sub-list item per fork under **Options considered** / **Decision** — so the file reads one
decision event per heading.

## 3. Mirror on the owning issue (issue-first)

Post the entry as a comment on the owning issue **before** touching the file — the issue is the
primary record; the file is the greppable index:

```bash
gh issue comment <n> --repo <owner>/<repo> --body-file <entry.md>
```

Owner/repo from the `GITHUB-PROJECTS.md` config block. Use `--body-file` (or a heredoc), not an
inline quoted body — entries contain backticks and markdown.

## 4. Append to `docs/DECISIONS.md` — newest at top, never the whole file

On the **owning branch** (the issue's feature branch; never directly on the default branch):

- **File absent** → create it with this two-line header, then your entry:

  ```markdown
  # Decisions

  Append-only ADR log — newest at top, `## YYYY-MM-DD — Title`. Grep by topic or issue #; captured via /adr.
  ```

- **File present** → read **only the header and the first entry's heading** (the first ~10
  lines), then insert the new entry between the header and the previous newest entry — anchor
  the edit on that first `## ` heading. **Never load the whole file** to append; it is
  append-only history and grows without bound.

## Guardrails

- **Issue-first, one writer.** If you are not on the owning branch (e.g. capturing someone
  else's decision mid-work), post the issue comment now and leave the file append to the owning
  branch — don't create a collision to save a step.
- **Never rewrite or reorder existing entries.** Superseding a decision is a *new* entry citing
  the old one (`supersedes YYYY-MM-DD — Title`), not an edit.
- **No receipts, no claim.** Evidence you can't cite gets labeled (e.g. "untested as prose",
  "unverified") — never asserted as fact.
- **Wrong skill** for undecided forks — that's options-with-costs on the issue plus
  `needs:decision`; come back here once the operator decides.
