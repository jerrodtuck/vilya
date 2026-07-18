# Setup page: auto-archive is best-effort

Correct the "Background sessions (chips)" auto-archive step on the Setup
page: a session archives when it *notices* its PR closed, so the mechanism
is best-effort — it usually fires at PR close, but an idle session that
never refreshes its PR state can be missed entirely (observed 2026-07-17:
the #106 chip's session sat non-archived after merge while #104's and
#107's archived). Stale finished sessions get archived manually or via
`archive_session`; periodic `/prune --apply` remains the backstop that
reconciles everything regardless. The smoke-timing note is unchanged.
