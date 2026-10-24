# #395 — Docker hygiene for worker chips

Chips that use Docker now run one-off commands with `--rm`, label every container, volume and image
with `project=<repo-short>` and `chip=<branch>`, and reuse the project's shared dev image instead of
building a per-worktree copy (`/vl-chip` §2e). `/vl-finish-feature` §7a removes the branch's labelled
items before the completion report. `/vl-prune` lists and removes an eligible worktree's labelled and
orphaned per-worktree Docker items, skips other projects, running containers and shared caches,
reports sizes freed, and names the operator's `docker_data.vhdx` compaction step. The registry adds
the tested `classifyDockerItem` recipe.
