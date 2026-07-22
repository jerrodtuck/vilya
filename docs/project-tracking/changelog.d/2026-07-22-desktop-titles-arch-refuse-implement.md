# Desktop session titles + harden arch refuse-implement

- **Claude Code Desktop titles:** standing seats `/vl-orch-claude`, `/vl-arch`, `/vl-plan`
  set or remind the operator to title chats `<repo-short>-orch` / `-arch` / `-plan` so
  `mcp__ccd_session_mgmt` can find them across desktops. Host scope locked: Desktop UI only —
  not Claude Code CLI, not Cursor. `repo-short` from `gh repo view --json name -q .name`.
- **Cursor orch note only:** `/vl-orch-cursor` may use the same pattern for human scanning —
  no `ccd_session_mgmt`.
- **Refuse-implement (#306 gap):** `/vl-arch`, `/vl-plan`, `/vl-ask` decline plain-language
  implement / fix / edit asks with a one-line route to the owning orchestrator — Never + Honesty
  bar, same force as the #306 seat-check.
- **Site:** Differences cross-session row note mentions the Desktop title pattern (thin).

(#308)
