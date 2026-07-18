# Setup: "The board" guided section — level, dependencies, automations

The Setup page gains **The board** (#172, epic #169): the guided version of
the canon's One-time repo setup, linking back to
`GITHUB-PROJECTS.md#one-time-repo-setup` rather than duplicating its command
sequence.

**Level fork documented, not decided** — Projects v2 lives on a **user or an
organization, never on a repo** (verified against current GitHub docs, which
phrase it as work tracked "at the user or organization level"; repos link to
projects, classic repo projects are retired). Both owners presented with
costs, reusing the `.split`/`.lvl` card idiom: user level (current default,
recommended solo, `gh project create --owner <user>`; migration cost: an org
move recreates the project, field/option ids change, every repo config block
regenerates) and org level (org-wide visibility; org Actions entitlements
follow the org's plan). One board per product either way.

**Dependencies** — gh CLI only, with the step everyone misses called out in
an amber note: `gh auth refresh -s project` (the `project` scope is not
granted by default; every `gh project` command needs it). Explicitly: no
separate GraphQL tooling (`gh project` wraps the API), no jq (gh's built-in
`--jq`).

**Board automations with UI paths** — the six Workflows switches, the four
mover-map transitions (Auto-add `is:issue` · Item added → Todo · Item
reopened → In Progress · PR merged → Done) marked ◆ and framed as half the
mover map, linking to the home feature at `/#mover-map` (#171 builds that
section; the anchor is the coordination point).

Mechanics: new slice files `board-guide.tsx` + `board-guide-data.ts` (+ data
test in the `night-shift/data.test.ts` style); `Steps` extracted from
`setup-view.tsx` into `setup-steps.tsx` so both sections share it. All new
prose follows the `{" "}` inline-tag spacing idiom; post-build scan clean.
