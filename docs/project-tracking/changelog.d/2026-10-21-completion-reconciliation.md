# 2026-10-21 — Reconcile the authorized queue before finalizing

Adds one orchestrator completion check to the shared board-intake contract and links it from Codex, Cursor and Claude entries. After accepted work, reconcile authorized scope, active workers, the queue and amendments before finalization. Continue eligible ranked work; otherwise report actual dispositions and precise gates. A final message does not arm future intake or authorize held work.

Refs #384. This instruction repair adds no watcher, service, helper framework or recurring automation. Other-host adoption remains unverified.
