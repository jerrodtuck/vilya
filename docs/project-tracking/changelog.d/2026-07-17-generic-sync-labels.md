The canon now carries the `sync-labels` script it references: a generic
`docs/project-tracking/scripts/sync-labels.sh` (plus a `sync-labels.ps1` parity twin) that
syncs the **standard set only** — `type:*`, `priority:*`, and the autonomy pair
(`auto:ready`, `needs:decision`) — idempotently via `gh label create --force`, with a
`--dry-run` echo mode. No area labels baked in: the script ends with a reminder to create
the repo's `area:*` labels from its config file. Canon text notes the standard-set scope at
the sync-labels command. Found during anduin-admin board setup, where anduin's per-repo copy
mislabeled the sibling repo with its baked-in backend areas. (#131)
