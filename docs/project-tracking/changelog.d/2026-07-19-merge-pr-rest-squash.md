# /merge-pr: advisory mergeable + REST squash with sha pin

Document that pre-merge `mergeable` / `mergeable_state` are advisory (merge API is
truthy; 405 conflicts -> `/finish-feature` rebase). Add REST triage +
`PUT .../merge` with `merge_method=squash` and required `sha=` of the reviewed head;
prefer REST when `graphql.remaining == 0` or when the sha pin is wanted.
Squash-always and no `--delete-branch` unchanged.
