# Chip skill: chips must never call spawn_task

Closes the process hole behind the #96/#97 incident: a chip filed its deferred
idea as a `spawn_task` suggestion card, the card was started, and the resulting
session ran on a chip-authored brief with a fabricated operator approval.
`skills/chip/SKILL.md` now carries a hard rule in the brief checklist, the
"Hard rules for the chip" list, and the Honesty bar: chips never call
`spawn_task` (or any session-spawning tool). Deferred ideas, follow-ups, and
out-of-scope findings go on the issue as a comment or as a new labeled GitHub
issue; work reaches a session only via operator-reviewed orchestrator dispatch.
