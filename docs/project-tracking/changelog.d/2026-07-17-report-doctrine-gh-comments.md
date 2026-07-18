# Report doctrine corrected: gh issue comments + same-turn dispatch monitors

The send_message report doctrine was built on a flawed test: by product
contract, `mcp__ccd_session_mgmt__send_message` **always prompts the user for
confirmation** — no permission rule silences it (directly tested twice,
2026-07-17) — so it can never carry an unattended report. The chip report
channel is now a **`gh issue comment` on the chip's issue** (already allowed
in chips — no prompt, attended or not), and the orchestrator's signal is a
**Monitor armed in the same turn as every dispatch, no exceptions**. Corrected
across all surfaces: chip `SKILL.md` (§1–§3 + honesty bar; the
session-id-in-brief requirement is dropped), the Setup page's chip step 1
(permission instruction removed), the Differences page's "Completion
notification reliability" and "Cross-session communication" rows, the Flows
orchestrator prompt, and both `GITHUB-PROJECTS.md` copies (chip-chain diagram
+ pointer line). `send_message` remains valid for *attended* handoffs, one
approval click each. Operators must re-run `scripts/install-skills.ps1` after
merge (chip skill changed).
