### Added

- **Version diff view** — compare any two committed versions of a skill side by
  side at `/skills/<slug>/diff/<from>/<to>`; each version-history row with a
  predecessor now carries a "compare" link. Zero-dependency LCS line diff,
  server-rendered (no client JS). (#1)

### Internal

- Test harness: vitest wired up (`npm test`), 10 unit tests on the diff engine —
  the configured `npm test && npm run build` gate is now real.
