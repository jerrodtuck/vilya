# Component baseline checks and repo config

- Crucible variants now compare touched UI primitives with the configured library and enforce the repo's own recorded custom-component policy. Backend/ML-only work is explicitly not applicable; feature composition is distinguished from primitives.
- Setup preserves editable Component baseline and Custom component policy rows, including explicit none / explained n/a. Missing rows remain unknown rather than gaining an invented default.
- Approval evidence must be attributable, scoped and durable when the repo requires approval. Product-specific approved sets remain in their own repo/issue records.
- Installation preflight found the existing crucible entries in the inspected Claude/Codex roots were junctions to the canonical checkout with matching hashes, not newer plain copies. After merge, pull that checkout to update those links. Other machines: compare hashes and preserve divergent local copies before running scripts/install-skills; use the appropriate explicit target/host option. No installed skills were changed by this feature branch.

Closes #328.
