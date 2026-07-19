# Cursor orchestrator: REST + notify_on_output chip monitor

Cursor standing orders now arm a same-turn chip-completion watcher via
background shell + `notify_on_output` on REST (`gh pr list` + issue comments
~90s) — not `gh project item-list` / GraphQL. Claude keeps the Monitor tool;
the old "never a background shell loop" rule means never an **exit-only**
notifier. Differences, Setup, canon, and `/chip` teach both host mechanisms.
