# Home: "The board moves itself" — mover map, one human touch

New dedicated home section (#171, epic #169) making the system's sharpest
claim visible: **every Status transition has a named mover, and only one is
human.** Design fork resolved to option 1 (static annotated board strip) —
the section extends the `BoardStrip` visual pattern (`.board-cols` /
`.board-col-*` reused) into five columns carrying the **live board's column
descriptions verbatim** (Project #8 Status option descriptions, read via the
Projects GraphQL API), plus a seven-row mover ledger labeling each transition
**skill / automation / human** per the epic's mover map. The single human
transition — Verifying → Done, live smoke confirmed — carries the one
gold/accent badge on the page (`.mv-human`, `--adr` gold).

Vertical slice: domain data lives in
`features/overview/board-movers.ts` (`BOARD_COLUMNS`, `BOARD_TRANSITIONS`),
rendered by `features/overview/board-mover-map.tsx` (`BoardMoverMap`, server
component — no client JS). `overview-view.tsx` only gains the composition
line. Copy anchors per the issue: headline "You don't move the board. The
loop does.", sub-line naming the operator's single touch, links to `/setup`
("get this board") and `/orchestrator` (who dispatches).

Tests (`board-movers.test.ts`): five columns in board order, descriptions
byte-for-byte against the live board, exactly seven transitions with the
epic's mover classes, exactly one human move (Verifying → Done).
