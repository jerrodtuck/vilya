# Model routing decision — issue 357

Created: 2026-10-08. Last updated: 2026-10-08.

## Decision

Use the latest supported GPT-6.1 Sol at medium effort for normal planning,
implementation and repair. Use Sol at high effort for independent review and
difficult bounded decisions. Use GPT-6 Astra only after Sol records a specific
unresolved consequential question or a capability-specific failure. Astra xhigh
requires a separate hard-analysis rationale.

Keep GPT-6 Luna limited to enumerated mechanical or high-volume tasks with objective
acceptance checks. It is not the default coding agent.

## Independent screen

Artificial Analysis reports:

- Sol High: Intelligence Index 50, estimated cost per task $0.32.
- Astra High: Intelligence Index 51, estimated cost per task $1.73.
- Astra Xhigh: Intelligence Index 52, estimated cost per task $2.31.
- Luna High: Intelligence Index 33 and Terminal-Bench 4.0 5%, compared with Sol
  High at 50 and 52%.

Sources:

- https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-astra-high
- https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-astra-xhigh
- https://artificialanalysis.ai/models/comparisons/gpt-6-1-sol-high-vs-gpt-6-luna-high
- https://developers.openai.com/api/docs/models/gpt-6.1-sol
- https://developers.openai.com/api/docs/models/gpt-6-astra

## Vilya probe

The minimum migration-planning probe compared a complete Sol plan with a flow that
added one bounded Astra consultation. Two fresh Sol plans completed for about $0.03
combined. Astra High consumed a 3,500-token output allowance entirely as reasoning,
returned no answer text, took 100 seconds and cost about $0.32. An earlier Astra
attempt exhausted a 1,200-token allowance without answer text.

The retained accounting has $0.43 of observed calls and a conservative $2 hold for
the first incomplete Astra call: $2.43 total accounted exposure. No retry loop ran.

The probe failed before Flow B or blind judgments completed, so it does not establish
accepted-quality superiority or the cheapest accepted route. It does show that
mandatory Astra consultation failed twice and added latency and cost without a usable
decision. Combined with the independent screen, Astra becomes a conditional escalation.

## Recalibration

For a new model, screen current independent intelligence, coding/agentic performance,
latency and price first. Challenge the lowest applicable proven seat. Run the
smallest matched Vilya fixture needed for skill adherence, repair rate or native
transfer. A full matrix is reserved for broad routing or acceptance-policy changes.
