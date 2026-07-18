# /product-map v2 delta: DECISIONS.md as intent + product-board survey unit

Two additive changes to `skills/product-map/SKILL.md` carrying the
architect's v2-brief delta from #125 (posted after PR #151 opened; the
operator chose merge-as-is + follow-up, per #153):

- **`docs/DECISIONS.md` joins step 3's as-intended sources** — grep by
  surveyed area/topic (never load end-to-end); a decided ADR is intent
  with receipts, and a shipped artifact contradicting a decided,
  unsuperseded entry is a divergence. Step 4's classic divergence shapes
  gain the matching class: an artifact contradicting a decided ADR.
- **Scope note: the survey unit is the product board** — a product
  spanning several repos runs steps 2–4 once per repo (each from its own
  config block) and merges the pair tables into one map; the architect
  seat is per board, not per repo. Contract only, no new machinery — per
  the #148 cardinality ADR.

Served copy regenerated via `sync:skills`.
