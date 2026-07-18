# Flows: architect + orchestrator cards require a stated recommendation at forks

Behavioral defect from the Product Architect card's first live run
(jerrodtuck/anduin#208): the session presented a clean options-with-costs fork
but stopped short of staking a recommendation — because the card told it to
("2–3 options with costs — the operator decides"). The house pattern elsewhere
(night-shift fork protocol, Cursor worker cards, the Consult "Force the fork"
prompt) is options **plus recommendation**. Both the Product Architect card's
guardrails clause and the Claude Code orchestrator card's fork clause (same
gap) now read **"2–3 options with costs and a stated recommendation (with its
reasoning) — the operator still decides."** Two-line edit in
`apps/skill-registry/src/features/flows/prompts.ts`; no skill files change.
