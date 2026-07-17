# Chip skill: send_message completion reports (permission-gated ping diagnosed)

The chip skill's "unreliable completion ping" doctrine is replaced with the
diagnosed mechanics: model-initiated `mcp__ccd_session_mgmt__send_message`
reports were permission-gated in the unattended chip session (now allowed in
user-level `~/.claude/settings.json`), and harness end-pings never fire because
chip sessions idle rather than end. The skill now requires the orchestrator to
include its own session id in every brief (§1), requires chips to report
completion or blockage back via `send_message` (§2), and reframes §3 as
report-primary / poll-backup — polling `list_sessions` / `gh pr list` remains
the verification step before any merge. The Differences page's "Completion
notification reliability" row states the mechanism and the enabling permission
instead of "observed unreliable in practice". Operators must re-run
`scripts/install-skills.ps1` after merge (chip skill changed).
