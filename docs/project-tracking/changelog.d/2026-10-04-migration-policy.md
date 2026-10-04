# Committed migration policy and Setup settings

Vilya #352 adds the canonical database migration policy: committed Drizzle SQL and
version-appropriate metadata, a verified application command, and a reviewed
baseline for already-applied databases. Production push and ad hoc migration SQL
are prohibited; target, backup and restore verification remain required.

Setup → Regenerate preserves optional migration tool, command and status fields,
including pending follow-up links and explicit clearing. It does not infer Drizzle
from a framework or claim that a missing migration runner exists.
