# Finish-feature asserts close keyword in created PR body

`/vl-finish-feature` now reads the created PR body back and fails loudly if the
merge-routing keyword (`Closes #<N>` / `Refs #<N>`) is missing. Completion reports
must state the keyword **observed** in that body, not the template. `/vl-merge-pr`
triage warns pre-merge when the body lacks clos*/fix*/resolv*/Refs. Chip, handoff,
orch seats, night-shift, and registry prompts taught the same contract. (Closes #317)
