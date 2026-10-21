---
name: vl-plan
description: Planner compatibility entry. Route Codex to vl-plan-codex, Claude Code to vl-plan-claude, and retain the Cursor Planner route.
codex-support: "codex-adapted"
codex-notes: "Compatibility entry routes to the distinct Codex Planner and one shared role contract."
codex-invocation: "$vl-plan"
codex-prerequisites: "Known host, complete vl-plan folder and the applicable host adapter."
---

# Planner compatibility entry

Resolve the actual host before tool or model assumptions.
Read and apply the full [shared Planner contract](references/planner-contract.md).
A missing shared resource or unknown host stops planning before readiness.

- Codex desktop: $vl-plan routes to [$vl-plan-codex](../vl-plan-codex/SKILL.md).
- Claude Code: /vl-plan routes to [/vl-plan-claude](../vl-plan-claude/SKILL.md).
- Cursor: /vl-plan retains the [existing Cursor route](references/cursor.md).

Read the complete applicable adapter. Do not execute another host's tools.
This compatibility entry does not create a new seat, chat, automation or authority.
One Planner per repo remains the lock. Preserve active pins and existing ownership.
Read the [seat reminder](../vl-orch-codex/references/seat-entry.md) and
[naming contract](../vl-handoff/references/seat-naming.md) at first seating/reseating.
