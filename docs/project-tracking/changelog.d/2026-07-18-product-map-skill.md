# /product-map skill: as-built vs as-intended architecture diff

New user-level skill `skills/product-map/SKILL.md` (#125, epic #122; the
epic's last, deliberately usage-shaped instrument): the architect's
ground-truth survey. Read-only and stack-neutral — reads only owner/repo/
project/area labels from the repo's `GITHUB-PROJECTS.md` config block. The
procedure encodes what the two captured usage examples (anduin#208, the
#142 VISION survey) proved valuable: pin a snapshot (timestamp + HEAD sha,
because a live board can move under a survey), gather as-built (slice/area
tree, shipped history, board state, targeted reads) and as-intended
(VISION — with an explicit substitution note when reading from an issue's
authored comment, specs, open epics, README promises, minus self-declared
frozen files, which are exempt and listed as such), then emit **gap
findings with receipts**: a matched-pairs table so "no divergence" is a
checked claim, and a divergence list where every entry cites both sides
with an evidence class per claim (verified / tested / unverified). Output
goes to chat, optionally mirrored to a caller-named owning issue. Findings
route per architect conventions — forks → options+costs+recommendation,
decided calls → `/adr`, work items → the board.

Registry: `product-map` joins `history` under **Recall**; the Architect
page's "Ground truth check" prompt card now routes to the skill (prompt
graduates to skill, per the `/chip` precedent). Skill is live on `git
pull` via the user-level junction; served copies regenerated via
`sync:skills`.

**Demonstration in the PR body:** the skill's own procedure run on vilya
at f4151e0 — 11 matched pairs, 4 divergences, each cited on both sides,
two carrying unfiled portions surfaced for triage.
