# Recognizable seat and task names

At first seating or reseating, verify the actual owner/repo and current role from
repo config and current seat evidence. Resolve repo-short with
`gh repo view --json name -q .name` in the verified checkout, or the verified
`nameWithOwner` leaf. Do not guess from an old title or activate another role.
Preserve an explicit human title preference, including a retained source preference.
Otherwise use `<repo-short>-arch` or `<repo-short>-orch` for those seats.
Other applicable seats use their actual role. Task/worker visible titles use
`<repo-short>-<issue#>-<short-task>` where supported; keep branch/worktree names
unchanged. A native child task name is not proof of a sidebar chat or rename capability.

Apply naming once at entry or verified handoff, not every turn. A title is a
navigation aid, never ownership, liveness, lock or archival authority. Keep actual
source/successor IDs as identity after rename. No standing Codex Planner, new chat,
-active status suffix, bulk rename, registry or status monitor is required.

## Host capability and readback

- **Codex desktop:** when exposed, use `set_thread_title` for the exact verified
  chat ID (omit ID only for the calling chat). Read that exact ID back through
  `list_threads` / `read_thread` and compare the observed title with the requested
  title. Tool acceptance alone is not success. This runtime's own-chat rename and
  readback were observed for vilya-orch and vilya-arch on 2026-10-09 in
  [#329](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-6092252068).
  That evidence does not establish another host or an inaccessible prior source.
- **Claude Desktop:** existing seat-title guidance uses its verified session
  directory to resolve exact identity. A directory is not a rename API. Inspect
  the currently exposed title mechanism and readback before automatic rename;
  otherwise use the manual fallback. Do not invent a session-management method.
- **Claude CLI and Cursor:** automatic visible-title rename/readback is unverified
  here. Inspect the actual host capability; use it only if supported and verified.
  Do not borrow Codex tools or invent a CLI flag, UI control or Windows bridge.

If automatic rename, cross-chat access or readback is unavailable/unverified, give
one exact manual instruction with resolved values: “In <host>, rename source chat
<ID>, currently <observed-title>, to <desired-title>; rename successor chat <ID>,
currently <observed-title>, to <desired-title>. Keep the source unarchived if needed
or safety is unknown. Verify both exact IDs and titles afterward.” At first entry,
include only this chat. Say rename is pending/unverified until actual readback;
if the host has no visible-title control, report that limitation and retain the
exact identity/title mapping on the owning issue. An unknown successor ID stays
pending; do not choose another chat by matching title.

## Verified handoff title transfer

Record exact source host/ID/observed title and intended successor title in the
[complete handoff](../SKILL.md). The receiver reads it and current issue/parent
amendments, then reconciles live ownership, workers, locks, active pins, repair
ledger, worktrees/setup and authority **before taking the canonical title**.
Unresolved ownership conflicts STOP takeover and dependent dispatch; a title
change cannot resolve them. Verify the successor's exact ID and role first.

After that reconciliation, rename only the verified source/successor IDs in scope.
For a retained source, use `<repo-short>-<seat>-previous-<short-chat-ID>` unless
an explicit human preference applies. Derive short-chat-ID from that exact source
ID and extend it only if needed to distinguish these chats. Read both exact IDs
back; if either rename/readback fails, record partial/pending names and the exact
manual fallback, never claim complete transfer. An inaccessible source remains
unchanged and unverified. No bulk title search or unrelated rename.

Naming is independent of archive safety. Preserve the handoff's verdict, evidence
and action. Keep the source unarchived whenever a needed associated checkout might
be deleted or preservation/safety is unverified. Names grant no archive/delete,
branch move, lock release or ownership-transfer authority.

## Instruction acceptance cases (not live title/lifecycle proof)

| Scenario | Required disposition |
| --- | --- |
| First seat has verified repo/role and no override | Resolve canonical name once; supported exact-ID rename plus observed readback, else exact manual fallback |
| Human selected a custom title | Preserve the explicit preference for the applicable source/successor; do not overwrite it with canonical or previous naming |
| Handoff title matches but live ownership conflicts | STOP takeover/dispatch before canonical naming; reconcile owners, workers, locks, pins, ledger, trees and authority |
| Verified retained source and reconciled successor | Rename only the two verified IDs; source previous-short-ID, successor intended title; read back both |
| Source inaccessible or rename/readback unavailable | No guessed chat or success claim; exact manual mapping/pending ID and observed limitations |
| Source still owns needed managed environment or safety unknown | Keep source unarchived and retain archive-safety verdict regardless of title result |
