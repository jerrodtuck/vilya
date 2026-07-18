# Flows: Architect card label — works in Cursor too

Relabel the Product Architect standing-orders card on the Flows page
(#129, epic #122) from "Claude Code — Product Architect" to
"Claude Code + Cursor — Product Architect". The prompt was always
tool-agnostic — its toolset is gh, shared skills (/history lives in
~/.claude/skills, which Cursor scans as a compatibility root), and file
reads; no spawn_task, no Monitor, no send_message — but the old label
implied Claude-Code-only. The "+ Cursor" form keeps the sibling cards'
`<tool> — <role>` naming convention rather than a vaguer
"(either tool)" suffix. Label-only change; the card body needed no
neutralizing.
