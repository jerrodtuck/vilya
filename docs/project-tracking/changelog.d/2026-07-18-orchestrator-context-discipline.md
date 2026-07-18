# Orchestrator cards: capture-and-dispatch discipline

Both orchestrator standing-orders cards (#156) — the Claude Code
spawn_task-chips variant and the Cursor no-comms variant — now teach the
context-window discipline in the portable layer, where it survives project
and IDE boundaries. When a bug or question lands: at most one quick repro
probe (to report "confirmed: X" instead of hearsay), then an issue on the
board, then a chip whose brief carries the investigation — root-causing
runs in the chip's fresh context window, never the orchestrator's. The
orchestrator's window is the pipeline's shared resource; multiplying
probes are the signal to stop and dispatch.

Incident behind it: a reported site bug pulled an orchestrator session
into 11+ minutes of live root-cause investigation while a merge-ready PR
sat untriaged. Text adapted to each card's voice; architect and
kickoff/worker cards untouched.
