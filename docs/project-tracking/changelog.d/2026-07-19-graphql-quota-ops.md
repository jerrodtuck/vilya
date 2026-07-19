# GraphQL quota hygiene for orchestrators

Codify shared-account GraphQL budget rules so Vilya + Anduin orchestrators stop
burning the user Projects bucket: board Status moves are best-effort (skip when
`graphql.remaining == 0`), never hot-poll `gh project item-list`, chip monitors
prefer REST `pulls?head=` (not `gh pr list`), and the main-clone
`cursor-agent-worker` is never killed as a leftover watch script. Standing
orders (Claude + Cursor), canon, `/chip`, and `/start-feature` carry the
doctrine; full monitor cadence/dedup remains #237.
