# Cardinality copy: architect scopes to product board, not all repos

The operator overruled the shipped "one architect, all repos" rule (#148,
2026-07-18): the corrected canon is **one architect per product board,
spanning that product's repos — never another product's; one orchestrator
per repo**. VISION.md v2 (#142) already carries the rule; this change makes
the site say the same thing everywhere.

**Architect page aside** (`features/architect/architect-view.tsx`) — the
"One architect, N repos" mode is now "One architect, one product board":
state is the *product's* board and direction docs, the seat spans that
product's repos with nothing to collide, and it does not span products —
what's shared across products is the process itself, the Dev Loop system's
job, not any seat's. The orchestrator mode is unchanged (its per-repo rule
was already right).

**Home** (`features/overview/`) — the cardinality panel heading, statement,
and diagram now show per-board scoping: the Architect node and its three
repo columns sit inside a dashed **PRODUCT BOARD** container, and the old
"more repos" ghost (which the architect edge fanned toward) is now a "MORE
PRODUCTS · own architect" ghost board the architect edge deliberately never
crosses. The overview lead now states the rule directly ("one architect seat
per product board, one orchestrator per repo") instead of "across every
product repo".

**Prompt cards** — the Product Architect standing-orders card
(`features/architect/prompts.ts`) got its authored paragraph-1 replacement
(operator text from #148): opener re-scoped from "for this repo" to "for
this product board" plus the seat-cardinality rule; Recall/Guardrails
paragraphs byte-identical (the file's "moved byte-identical" header note is
updated accordingly). Both orchestrator role cards
(`features/orchestrator/prompts.ts` — the spawn_task-chips variant and the
Cursor no-comms variant) gained the same authored sentence stating the
one-orchestrator-per-repo rule in session terms; worker/kickoff cards
untouched.

**DECISIONS.md** — the decision is appended as
`2026-07-18 — Architect cardinality: one architect per product board; one
orchestrator per repo (#148)`, partially superseding the #132 entry's Fork C
copy; the issue body is the ADR mirror (issue-first, so no re-mirror
comment).

Verified: 53/53 tests, clean build, post-build spacing scan 0 jammed
elements (all touched JSX prose uses the `{" "}` idiom per #141/#146); no
body h-scroll at 375px on `/`, `/architect`, `/orchestrator`; a stale-phrase
grep over `src/` and the prerendered HTML finds no remaining all-repos
cardinality copy.
