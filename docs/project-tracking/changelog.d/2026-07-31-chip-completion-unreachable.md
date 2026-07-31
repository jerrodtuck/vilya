# Canon: chip completion turn is unreachable — merge-gate enforcement

Post-dispatch corrections, rulings, and stand-downs are **merge-gate enforcement
items**, never load-bearing chip messages. A chip's completion turn is unreachable
by design; send-to-chip after dispatch is best-effort only. At `/vl-merge-pr`:
verify substance reached the PR body / code / docs; if absent and the chip is
done, carry an attributed squash note or hold the merge.

Chip briefs (and `/vl-finish-feature` / `/vl-cursor-handoff`) require: *immediately
before opening the PR, re-read the owning issue for rulings or amendments posted
after dispatch, and fold them in* — the one delivery channel a finishing chip
reliably uses.

Surfaces: `/vl-merge-pr`, `/vl-orch-cursor`, `/vl-orch-claude`, `/vl-chip`,
`/vl-finish-feature`, `/vl-cursor-handoff`, and orch site prompt parity. Sibling
#310 (relayed constants/directives) stays separate. Receipt: anduin-analytics
2026-07-24/25 (amendment missed completion; ruling via re-read/squash note;
stand-down queued behind final turn).
