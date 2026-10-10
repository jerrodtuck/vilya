# One-time seat reminder (#365)

Read this contract when first seated or explicitly reseated. Give one short user-visible reminder naming the detected host, active seat, that host's skill/invocation, approved model and reasoning/effort where applicable, and the manual selection/setup step. Do not repeat it per turn, issue or helper invocation. Resuming the same seat preserves its reminder and exact active/resumed worker pin; an explicit reseating may give one fresh reminder. No new confirmation gate or compulsory model switch is added.

Resolve the host from current trusted session context, the active role from its entry, and model settings from the existing approved host/operator contract. A scoped explicit operator override wins only in scope. Preserve active/resumed worker pins, including historical issue-specific pins. Never replace another host's policy with Codex tiers. This reference delivers reminders, not a model catalog or new routing policy.

| Host / seat | Invocation and existing policy | Concrete manual step |
| --- | --- | --- |
| Codex desktop orchestrator | $vl-orch-codex; this operator's standing GPT-6.1 Sol / Medium reasoning | Select the approved model and reasoning in this chat's model controls. |
| Codex desktop architect | $vl-arch; this operator's standing GPT-6.1 Sol / High reasoning | Select the approved model and reasoning in this chat's model controls. |
| Codex bounded worker / review | Assigned self-contained vl-chip brief and exact phase model/effort pin | Use the assigned child pin; if manual setup is needed, select it in that worker chat's controls, never change the parent chat. |
| Cursor orchestrator | /vl-orch-cursor; approved Sonnet route unless scoped operator settings say otherwise | Select the approved model in this conversation's model dropdown. |
| Cursor architect | /vl-arch; resolve the operator's approved architect model | Select that model in this conversation's model dropdown; do not infer an architect model from the Planner. |
| Cursor Planner | /vl-plan; existing Fable policy where configured | Select the approved planning model in this conversation's model dropdown. |
| Cursor worker | Assigned Task/BoN brief, /vl-cursor-handoff for Worker A, or /vl-start-feature for Worker B; preserve assigned pin / approved Sonnet route | Use the worker conversation's model dropdown when exposed; Worker A first opens the assigned worktree with File → Open Folder or cursor <path>. Never switch the parent. |
| Claude Code orchestrator / chip | /vl-orch-claude for the seat; assigned /vl-chip brief for a chip; Sonnet via private .claude/settings.local.json inherited through .worktreeinclude | Check the existing local model setting and worktree inheritance. Missing/conflicting setup uses the existing setup gate; do not print secrets, rewrite private config or use orchestrator /model as the Planner. |
| Claude Code Planner | /vl-plan; existing Fable policy where configured | Start the Planner with claude --model fable or the verified equivalent selector. |
| Claude Code architect | /vl-arch; resolve the operator's approved architect model | Use the verified Claude Code model selector or startup --model setting for this seat. Do not assume an architect model or effort from the Planner/chip settings. |

Read the owning seat and [Codex routing contract](model-routing.md) for applicable authority and overrides. Claude/Cursor policies remain in their owning seat manifests and [start-feature](../../vl-start-feature/SKILL.md); product config does not store operator model choices. Fable/Sonnet names above describe existing policy, not a fabricated provider version or capability. Name reasoning/effort only when the host supports it and the approved setting is known.

If host, model, effort support or selector is unknown/unavailable, say exactly what is unknown and resolve only that missing choice using the existing setup/stop rules. Do not guess syntax, versions, effort or UI controls. Do not claim to have checked or changed a UI without an exposed capability and observed result. A manual reminder is not proof of current selection.

Examples (substitute a scoped override or assigned pin when applicable):

- “Codex orchestrator: use $vl-orch-codex. Use GPT-6.1 Sol with Medium reasoning; select it in this chat's model controls.”
- “Cursor orchestrator: use /vl-orch-cursor. Use the approved Sonnet model; select it in this conversation's model dropdown.”
- “Claude Code orchestrator: use /vl-orch-claude. Use the approved Sonnet setting in .claude/settings.local.json; check that chips inherit it through .worktreeinclude.”
- “Claude Code architect: use /vl-arch. Your approved architect model is unknown; resolve that setting and use the verified model selector for this seat.”
- “Codex worker: follow the assigned vl-chip brief at gpt-6.1-sol / medium. Keep this child pin; any manual selection belongs in the worker chat.”

Helpers and routers keep their fixed output and role boundaries. Reading this reference never activates a seat. Include the reminder contract in copied seat entries and worker briefs; do not prepend reminders to a router's fixed answer or helper's fixed return.
