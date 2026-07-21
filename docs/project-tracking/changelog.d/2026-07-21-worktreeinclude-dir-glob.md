# apply-worktreeinclude: expand `/**` to ignored files

- Trailing `/**` patterns (e.g. Anduin `lib/cygnet/**`) now expand to files under the tree and copy only gitignored ones. The directory itself is often not ignored (tracked README), so treating the dir as one path skipped the whole SDK drop.
