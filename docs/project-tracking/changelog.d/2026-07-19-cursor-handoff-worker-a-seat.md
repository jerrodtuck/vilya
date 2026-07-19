# /cursor-handoff: Worker A seat only (after worktree)

Rewrite `skills/cursor-handoff` so it is the **Worker A seat skill** —
invoked only after the worker window is already rooted at the Cursor
worktree (#253; corrects the three-step ritual framing from #247). Embeds
the Worker A contract (read kickoff; no re-`/start-feature`; crucible →
`/finish-feature`). Orchestrator seating and chip monitors stay on the
orchestrator path/card.

Site: `/orchestrator` Cursor path panel Step 3 is **In the worktree, run
`/cursor-handoff`** (Worker A card kept as paste fallback). Standing-orders
intro matches. Registry content mirror via `sync:skills`.
