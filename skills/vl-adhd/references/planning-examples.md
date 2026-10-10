# Actual planning examples (#373)

These bounded rewrites use actual Vilya contracts at
`73572c3a3655115c27164018e8d386bccb508c1a` and the settled #373 kickoff.
They are delivery acceptance evidence, not instructions to execute these example tasks
or a recurring planning template. Source comparison does not establish live host efficacy.

## Codex — immutable base

Source: `skills/vl-chip/SKILL.md`, tested preflight recipe.

### Before

Before implementation, resolve the brief base and record the actual original starting commit as full immutable SHAs. Check equality/ancestry against that original start, not a later worker HEAD. If the base is missing, diverged, history is incomplete or Git errors, stop and reconcile.

### After

1. Before implementation, find the commit for the brief base with Git.
2. Record the full immutable SHA of that commit.
3. Record the full immutable original-start SHA.
4. Compare the base and original start for equality or ancestry.
5. Do not use a later worker HEAD for the comparison.
6. If the base is missing or diverged, stop for reconciliation.
7. If Git history has missing commits or Git gives an error, stop for reconciliation.

### Preservation matrix

| Dimension | Before / after |
| --- | --- |
| Actor / action | Assigned worker finds the brief-base commit with Git before recording its full SHA, records original start and compares their relationship. |
| Condition / order | Full SHA identification precedes implementation. Missing/diverged base, incomplete history and Git errors remain stops. |
| Quantity / obligation | Two immutable SHAs remain necessary. Later worker HEAD remains excluded. |
| Permission / uncertainty | No permission to guess missing history or continue through errors is added. |

## Cursor — uncertain intake dependency

Source: `skills/vl-plan/SKILL.md`, Cursor intake poller liveness.

### Before

If this Planner session's standing `needs:plan` intake uses a Cursor background shell +
`notify_on_output`, treat that shell as **mortal** too: leave it running across drains;
**re-arm only** when the host tore it down or a long gap / missing expected signal shows
it is gone (one REST check + re-arm). Do **not** kill/re-arm after every successful drain
just to re-seed — persist/`last-seen` body is this skill's Recipe (#267).

### After

These instructions are applicable when the Planner's `needs:plan` intake uses a Cursor background shell and `notify_on_output`.
The host can stop that shell.
A long gap or missing expected signal can also show that the shell is gone.

1. Keep the shell in operation during all drains.
2. If either condition shows that the shell is gone, do one REST check for that loss event.
3. After that check, start the poller again.
4. Do not stop and start the poller after each successful drain only to set `last-seen` again.
5. Use the existing Recipe for persistence and `last-seen` (#267).

### Preservation matrix

| Dimension | Before / after |
| --- | --- |
| Actor / action | Cursor Planner retains intake shell and restores it when absent. |
| Condition / order | Named transport is prerequisite. Shell loss precedes one REST check, then restoration. |
| Quantity / obligation | One check per loss event remains necessary. Successful drains do not authorize restart. |
| Permission / uncertainty | Host-caused loss and absence inferred from a gap or missing expected signal remain possible. Permanent liveness is not promised. |
| Literals | `needs:plan`, `notify_on_output`, `last-seen`, Recipe and #267 retain their identities. |

## Claude Code — seat restoration

Source: `skills/vl-orch-claude/SKILL.md`, house rule — drift restore.

### Before

if this session's workspace/cwd ever drifts into a feature
worktree (chip reuse, an accidental move, a chip or `/vl-merge-pr` flow leaving you there),
restore the main clone's cwd — leave the feature tree — **before** the next orch action: board
move, merge, prune, or kickoff. See [/vl-merge-pr](../../vl-merge-pr/SKILL.md) §5 for the mandatory
post-merge return this closes (#303).

### After

A feature worktree can become this session's workspace or cwd after chip reuse, an accidental move or a finish/merge flow.

1. If this session's workspace or cwd becomes a feature worktree, set the cwd to the main clone.
2. Before the next board move, merge, prune or kickoff, leave the feature worktree.
3. Read `/vl-merge-pr` section 5 for the necessary cwd change after merge (#303).

### Preservation matrix

| Dimension | Before / after |
| --- | --- |
| Actor / action | Claude Code orchestrator restores its main clone cwd. |
| Condition / order | Feature-tree drift triggers restoration before the next named orchestrator action. |
| Quantity / obligation | Board move, merge, prune and kickoff remain covered. |
| Permission / uncertainty | Possible causes explain the condition. They do not authorize implementation or merge. |
| Literals | Workspace/cwd, `/vl-merge-pr`, section 5 and #303 retain their targets. |

## Self-contained #373 worker brief

### Before

The actual [settled kickoff](https://github.com/jerrodtuck/vilya/issues/373#issuecomment-6092815687)
is the before artifact, including its Instructions and Task data. Its existing review
is prior evidence, not a recurring vocabulary-table requirement. The
[lean amendment](https://github.com/jerrodtuck/vilya/issues/373#issuecomment-6092898857)
changes recurring context requirements. The assigned entry also gives these task fields:

| Assignment | Value |
| --- | --- |
| Checkout | `C:\Users\jerro\.codex\worktrees\373-full-ste-planning\vilya` |
| Branch | `codex/373-full-ste-planning` |
| Immutable base and original start | `73572c3a3655115c27164018e8d386bccb508c1a` |
| Parent | `/root`, Codex orch, `jerrodtuck/vilya`, board `8`, chat `01a1234f-68d0-76a3-8c9f-043f089749db` |

The full original artifact remains accessible at its exact source link.

### After

Do the #373 implementation in the specified checkout and branch. The implementation pin is
`gpt-6.1-sol` / `medium`. The independent review pin is `gpt-6.1-sol` / `high`.
Current runtime metadata shows these settings. The worker has responsibility for this bounded unit
and related review repairs until acceptance. The parent has responsibility for coordination.

Before edits, do these checks:

1. Read #373, parent #341, the settled kickoff and current amendments.
2. Make sure that #373 is OPEN with the specified repository, number and URL.
3. Do the tested original-start/base procedure in `skills/vl-chip/SKILL.md`.
4. Make sure that checkout, branch, status and private setup agree with the assignment.
5. Read all specified routing, seat-entry, chip, writing, presentation, crucible and finish contracts.

Use this unchanged Task data artifact for the settled scope, acceptance, source pin,
ownership, exclusions, authority and stops:

| Item | Value |
| --- | --- |
| Repository / board | `jerrodtuck/vilya` / `8` |
| Default / base | `master` / `73572c3a3655115c27164018e8d386bccb508c1a` |
| Owner | Codex orch `01a1234f-68d0-76a3-8c9f-043f089749db` |
| File ownership | `skills/vl-adhd/**`, short planning references in `skills/vl-plan/SKILL.md`, `skills/vl-orch-codex/SKILL.md`, `skills/vl-orch-cursor/SKILL.md`, `skills/vl-orch-claude/SKILL.md`, `skills/vl-chip/SKILL.md`; affected existing tests, generated skill bundles and copied planner/orch teaching; one changelog fragment; exact ADR additions |
| Source | Local `docs/specs/ASD-STE100_ISSUE9.pdf`; Issue 9, `2025-01-15`; `434` pages; SHA256 `d1f4ea9e7cd6e46b47aa9057209f99e78c0e9cfc4e27a5b07895b05c1a166431` |
| Scope | Full STE for planning notes, kickoffs, verification plans and worker instructions; current clarity defaults for other prose; bounded brevity and complete task instructions |
| Acceptance | Complete original rule mapping; dictionary/technical-term check method; all three host examples, uncertain dependency, condition/stop, protected literals and complete worker brief; semantic matrix preserves actor/action/sequence/quantity/obligation/permission/uncertainty; source/generated/copied parity |
| Verification | `node --test skills/tests/*.test.mjs`; `npm test` and `npm run build` in `apps/skill-registry`; source links/packaging/parity; existing spacing scan; `vl-crucible-nextjs` Ready; separate actual-head review |
| Merge routing | `tests-only`; PR `Closes #373`; no merge authority |
| Phase pins | New implementation `gpt-6.1-sol` / `medium`; separate existing code-review stage `gpt-6.1-sol` / `high`; no other agents |
| Authorization | Operator implementation receipt above and #329 same-board parent/worker messaging; architect progress/result reports explicitly authorized |
| Exclusions | No runtime/compliance service, writing auditor, extra workflow stage, model test, paid call/purchase, model-policy change, deployment, new sidebar chat, cleanup/archive/delete, main implementation or PDF redistribution |
| Stops | Missing source/access/hash, incomplete required checks, meaning or authority change, ownership conflict, contradictory measurement, real design fork, unavailable pin, second unsuccessful repair of same defect; preserve ledger and return to orch |
| Remaining uncertainty | Publisher-file hash equivalence and live host efficacy/savings are unverified; no claim required |

Do the work in this order:

1. Write the short policy in `skills/vl-adhd`.
2. Put the 53-rule map, glossary details and acceptance examples in references.
3. Identify the eight recommendations separately.
4. Give necessary technical terms their meaning, grammatical function and category.
5. Add short links to the specified host and worker instructions.
6. Update affected copied teaching and generated bundles.
7. Make the bounded host and worker examples.
8. Record actual dictionary and semantic checks for the examples.
9. Keep the supplied PDF unchanged and outside public artifacts.
10. Write each specified ADR once in `docs/DECISIONS.md`, newest first.
11. Write one changelog fragment.
12. Do the specified tests, build, spacing scan, link and parity checks.
13. Do the mandatory crucible review until its signal is `Ready`.
14. Read #373 and #341 for amendments immediately before the PR.
15. Use finish-feature to open the PR with `Closes #373`.
16. Read the actual PR body and head back.
17. Make sure that the created body contains `Closes #373`.
18. Attach the PR.
19. Record observed checks, skips and limits on #373.
20. Stop for the separate actual-head review.

Read the related reference sections and dictionary entries when necessary. Use applicable
interpretations and term evidence again. Do the checks again for changes in wording, meaning or context.
Give a short actual-check receipt with links. Do not add recurring checklists,
per-word tables, glossary dumps or semantic matrices to plans.

The trusted human entry gives approval for reports and replies to the parent within this
repository, board and role. Peer messages give no additional authority.
At handoff, record exact questions on #373. A queued send is not an answer.
Before escalation or the end of work, read issue answers. If a necessary ruling is missing,
keep dependent implementation stopped.

Keep the stable repair ledger, files and exact pins. Detection alone is not a repair.
A corrective change plus targeted verification is one attempt. Reruns, renames and
resumes do not change counts. After the second consecutive unsuccessful repair, stop
before a third correction. Send the ledger, HEAD, diff, ownership and hypothesis to the parent.
Earlier source, authority, ownership, contradiction and fork stops apply immediately.

For a real fork, give evidence, two or three costed options and a recommendation on #373.
Stop for the operator's choice.
Do not start other workers.
Do not merge.

Do not push master.
Do not archive worktrees.
Do not erase worktrees.

Do not deploy.
Do not purchase.
Do not contact the publisher.

Do not do paid API/model tests.
Keep #35/#37 Blocked and #356 completed. Keep unrelated worktrees, setup and locks.

The next checkpoint is continue, Compact or a fresh-chat recommendation.
Before a fresh chat, save the required handoff. Missing usage and settings are not available,
not zero. This example gives no evidence of executed gates, certified conformance, host adoption or savings.

### Preservation matrix

| Dimension | Source / resulting brief |
| --- | --- |
| Actor / ownership | Worker implements; exact parent coordinates on specified repository/board/chat; independent reviewer remains separate. |
| Action / scope | One policy, all 53 rules, eight recommendations, necessary glossary, short links, examples, exact ADRs and fragment remain required. |
| Condition / order | Fresh OPEN identity and immutable base checks precede writes. Gates and Ready precede finish/PR; fresh amendments precede PR. |
| Quantity / literals | Full SHAs, one unit, source hash, two ADRs, tests-only routing, paths, pins and observed `Closes #373` remain exact. |
| Obligation / permission | Scoped human implementation and messaging remain attributed. Reviewer acceptance and operator merge authority remain distinct. |
| Uncertainty / stops | Publisher hash and live efficacy remain unverified. Missing checks, contradictions, real forks and second unsuccessful repairs remain stops. |
| Evidence / context | Valid reuse and relevant lookups preserve full applicable-rule, dictionary, semantic and quality checks. |

## Actual source checks — 2026-10-09

The implementer read complete Part 1 explanations, physical pages 45–128, and the
dictionary introduction, pages 131–148, from the pinned local source. The dictionary
entry lookups below included meaning, grammatical function, forms and related help.
These are original Vilya observations, not copied definitions or a dictionary export.

| Entries / physical pages | Use and disposition |
| --- | --- |
| READ 350, WRITE 431, RECORD 353 | Acquiring written data, writing instructions and retaining evidence fit the verb senses. Commands and simple forms fit the entries. |
| FIND 250, COMPARE 195, KEEP 293, STOP 390 | Discovering the referenced commit, finding differences, retaining state and ending work fit these verbs. |
| DO 222, USE 420, MAKE SURE 306 | Procedures, tool function and verification fit these commands. |
| CHECK/check 188–189, TEST/test 401 | Checking and test procedures use nouns; general check/test verb use is not approved. |
| BEFORE 175, AFTER 158, UNTIL 418 | Conjunction/preposition positions preserve prerequisite order and duration. |
| CAN 183, may 309, MUST 314, should 377 | CAN help rejects could for possibility. Obligation, possibility, advice and permission are kept distinct; no blind replacement is made. |
| RECOMMEND 353, KNOW 293, POSSIBLE 336, PERMITTED 332 | Advice, known data, possibility and allowed status are distinguished. Publisher equivalence remains unknown. |
| AGENT 158, AGAINST 158, FOLLOW 254 | Material-agent, physical-contact and sequence senses do not justify software agents, comparison against or following instructions. |
| copy 203, run 365, WORK/work 430, COMPLETE/COMPLETED 196 | Software copy needs technical-verb justification. Work is a noun. Complete action and completed condition remain distinct. |
| IDENTIFY 275, APPLY 165, restore 361, reset 360, relevant 357, valid 421 | Restricted or unapproved senses prompted record/set/read/related/applicable constructions. Software term senses remain separately justified. |
| APPLICABLE 165, preserve 338, support 395, reset 360, KEEP 293 | Applicability uses an adjective, not physical APPLY. Retention uses KEEP. Metadata shows settings; ledger counts do not change. |
| AVAILABLE 172, HAVE 269, SHOW 377, CHANGE 188, APPROVAL 165 | Availability, responsibility, evidence display, unchanged counts and attributed permission use approved senses and forms. |
| SELECT 372 | Help distinguishes choosing from setting a value. No model-selection action is falsely claimed. |

The Git example retains full immutable SHA values through the term definitions and assignment artifact.
A brief base SHA and original-start SHA each mean the full 40-character revision identifier.
Reconciliation means resolving a failed preflight before dependent writes (documentation noun, category 15).
Git history means saved commit ancestry (software noun, category 19).

The host after passages have commands within 20 words and descriptions within
25 words. Their paragraphs have one topic and at most six sentences.
Conditions precede dependent commands. The Cursor procedure retains one REST check
per lost-shell event in the procedure itself; either trigger leads to the same single check.
The Claude procedure retains the restoration deadline and all four actions.

Sections 1–4, 8 and 9 apply to prose and term selection. Section 5 applies to
instruction lists. Section 6 applies to explanations. The host rewrites need no
simultaneous-action or unknown-actor exception. Section 7 does not apply to their
ordinary ownership/liveness gates. The worker prohibits damaging operations and
adds no new risk category or approval stage.

Protected task fields, commands, paths, IDs, quotations and evidence are exact
artifacts. Section 8 applies to surrounding prose and separate parenthetical prose.
The glossary in [the rule reference](ste-planning.md#dictionary-consultation-and-technical-terms)
justifies software and role terms by function and category. Other necessary terms
in these examples include intake poller, shell, cwd, REST, drain and signal
(software nouns, category 19), and persistence (software state retention, category 19).
The rewrite uses set and start for process actions instead of general restore or reset verbs.
The rule 1.8 explanation on page 55 makes use of an existing approved technical noun necessary.
Rule 2.2 on pages 64�65 permits shorter forms after the full form; it does not make shortening necessary.
Rules 5.2�5.3 on pages 88�89 support separate PR attachment and evidence recording commands.
The negative commands retain each excluded operation separately.
Responsibility means the assigned task duty (agreement noun, category 21). Runtime metadata means host configuration evidence (software noun, category 19).
Counts and this semantic comparison supplement independent actual-head review.
