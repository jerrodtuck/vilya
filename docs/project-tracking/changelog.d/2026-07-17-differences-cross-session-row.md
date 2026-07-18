# Differences page: cross-session communication / session management row

New row on `/differences` covering how each tool lets sessions talk to and
manage each other. Claude Code side: the `ccd_session_mgmt` MCP server —
`list_sessions`, `send_message` (permission-gated; allow
`mcp__ccd_session_mgmt__send_message`, typically at user level), and
`archive_session` plus the "Auto-archive on PR close" preference — all three
tools directly exercised 2026-07-17. Cursor side, phrased as documented
absence: the Cloud Agents API is pull-only (poll run-status or hold SSE;
webhooks "coming soon"), with no documented agent-initiated push,
session-enumeration, or archive API surfaced to conversations; `gh`-based
side channels are the nearest workaround. Note ties the row to the
model-selection asymmetry: dispatcher control going in vs worker voice
coming out.
