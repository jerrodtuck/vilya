# /vl-chip: title-match PR recipe for Claude chips

`/vl-chip` §3's REST monitor recipe now teaches **two** PR-detection recipes,
picked by dispatch path, not by host: Cursor daytime / night-shift branches
bake the issue number into `feat|fix|docs/<issue#>-*`, so `pulls?head=` finds
the PR; Claude `spawn_task` chips land on a random `claude/*` branch with no
issue number in it, so that filter silently never matches — they need
`pulls?state=open` filtered by title prefix `#<N> ` instead (titles are
reliably `#<N> <name>` per §2's `/vl-finish-feature` close-out). Issue-comment
monitoring is unchanged — always by issue number, for both paths.
`vl-orch-claude`'s own monitor guidance duplicated the broken `head=` recipe
for its `spawn_task` chips and is fixed the same way.
