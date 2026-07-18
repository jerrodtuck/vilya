# /update-docs velocity table points the DECISIONS entry shape at /adr

The velocity table in `skills/update-docs/SKILL.md` still described the
DECISIONS.md entry shape inline as "(Choice / Why / Rejected / Follow-on)"
while /adr owns the fuller template (Decision / Options / Why /
Consequences / Evidence) — two shape descriptions that could drift (#144,
deferred from #124's routing-line-only scope).

One-cell edit: the Append-only row keeps the newest-at-top
`## YYYY-MM-DD — Title` dating convention (that column's job) and replaces
the inline shape with "entry shape owned by /adr", using the same relative
link style as the decision-tree row above it. A sweep of the rest of the
skill found no other inline restatement; the mention in `skills/adr/SKILL.md`
is the owning template itself and stays. Registry content copy re-synced.
