# /chip: REST-only monitor (≥120s) + dedup

Chip completion monitors are REST-only for Cursor and Claude: `pulls?head=` +
issue comments, cadence **≥120s**, with a dedup wake guard (seed last-seen PR
number / comment id; wake only on change). Ban `gh pr list` on the hot path —
it is GraphQL and burns the shared user bucket. `/chip` §3 is the recipe;
Differences, Setup, canon, and orchestrator standing orders stay aligned.
