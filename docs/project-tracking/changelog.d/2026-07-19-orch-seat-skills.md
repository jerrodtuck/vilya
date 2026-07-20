### Added

- **`/vilya-orchestrator` + `/vilya-orchestrator-cursor` skills** — host-specific
  orchestrator seats so invoke matches the standing-orders cards. Claude card maps
  to `/vilya-orchestrator`; Cursor card maps to `/vilya-orchestrator-cursor`.
  `/vilya-chip` stays a separate dispatch action — never the orch kickoff. Copy
  remains fallback. Registry lists both under Process. Served copies via
  `sync:skills`. (#268, Refs #224)
