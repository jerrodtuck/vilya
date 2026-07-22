# Seat boundary: refuse other seats' skills invoked in the wrong session

- **Seat-check preamble:** `/vl-merge-pr`, `/vl-prune`, `/vl-chip` — the three orchestrator-only
  operator skills — each gain a "Seat check" section near the top. A session seated as
  `/vl-arch`, `/vl-plan`, `/vl-ask`, or any seat that is not `/vl-orch-cursor` / `/vl-orch-claude`
  must decline with a one-line route to the orchestrator session and stop, instead of executing
  the skill body.
- **Explicit refusal in the seat skills:** `/vl-arch`, `/vl-plan`, `/vl-ask` each gain a clause
  stating that another seat's skill slash-invoked in this session is declined with a one-line
  routing answer, not executed — seat doctrine wins over the invoked skill's body.
- **Light reinforcement:** `/vl-orch-cursor` and `/vl-orch-claude` each gain one honesty-bar line
  covering the reverse direction (declining `/vl-arch` / `/vl-plan` / `/vl-ask` if invoked from an
  orch session), without duplicating merge/prune/chip ownership they already state.
- **Failure closed:** a CITranslator `/vl-arch` session ran `/vl-merge-pr 148` and
  `/vl-prune --apply` because the invoked skills' own instructions overrode the seat's earlier
  Never list. This closes that gap from both ends.

(#306)