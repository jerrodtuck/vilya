# Orchestrator card: monitors are the Monitor tool, never a background shell loop

Operator-confirmed incident (#176): a post-compaction orchestrator session
armed its dispatch monitors as plain background shell loops. The loops
detected every event — three PR opens and six report comments sat in the task
output file — but a background shell task only notifies on process exit, and
a `while true` watch loop never exits, so delivery was structurally
impossible; the pipeline sat silent until the operator noticed completed
chips by hand. The Claude Code orchestrator card's same-turn dispatch
sentence now pins the mechanism: arm the **Monitor tool** (each stdout line
streams to the session as a live event) — never a plain background shell
loop, which detects but can never notify. One-clause edit in
`apps/skill-registry/src/features/orchestrator/prompts.ts`; the Cursor
orchestrator card (no comms layer), architect card, and kickoff/worker cards
are byte-unchanged.
