---
name: vl-adhd
description: >-
  Shared clear-writing policy for supported Vilya seats and authored prose.
  Use an STE-inspired subset for concise operator updates and complete worker
  briefs, ADRs, specs and PR evidence. Preserve technical facts, uncertainty,
  permissions and fixed output contracts. Seats load it; direct invocation
  is a fallback when a host skipped the load.
codex-support: "shared-compatible"
codex-notes: "Shared clear writing for operator updates and complete durable records; facts and authority remain intact."
codex-invocation: "$vl-adhd"
codex-prerequisites: "Readable skill and current seat context."
---

# Shared clear writing (any stack)

## Invocation and credit

Seats read and apply this policy at session start. The operator does not need
an extra invocation. Use `$vl-adhd` in Codex when discovered, or explicitly read
and apply this source. `/vl-adhd` remains the supported-host fallback if a host
skipped the load. Loading this policy does not activate a seat or expand authority.

> Credit: adapted from [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)
> (MIT, © Ayoub Ghriss) for the Dev Loop. Not a seat — a shared writing policy
> other seats load. Cited by: [/vl-orch-claude](../vl-orch-claude/SKILL.md),
> [/vl-orch-cursor](../vl-orch-cursor/SKILL.md), [/vl-arch](../vl-arch/SKILL.md),
> [/vl-plan](../vl-plan/SKILL.md), [/vl-merge-pr](../vl-merge-pr/SKILL.md),
> [/vl-ask](../vl-ask/SKILL.md).

## Scope and precedence

Apply one policy to all authored prose: operator updates, explanations, worker
briefs, kickoffs, ADRs, specs, decision requests and PR verification records.
An ADR is an architecture decision record. Clarity changes how you explain the
work; it does not remove the evidence a fresh worker or reviewer needs.

Higher-priority instructions and explicit output contracts outrank these style
defaults. Keep the [vl-ask fixed lane · prompt · why shape](../vl-ask/SKILL.md#answer-format).
Explicit operator tone, depth or format preferences override style defaults.
They do not change facts, permissions, role boundaries or verification gates.
This writing policy creates no new confirmation requirement. Follow the task's
existing authority and stop conditions when asking for decisions or approval.

Visual selection and production procedures belong to the companion work in
[#343](https://github.com/jerrodtuck/vilya/issues/343). Seat/site adoption belongs
to [#344](https://github.com/jerrodtuck/vilya/issues/344). This policy does not
require a visual artifact, a writing linter or a new workflow.

## Five STE-inspired rules

This is a chosen subset inspired by Simplified Technical English (STE).
It is not full ASD-STE100 compliance, percentage compliance, controlled-vocabulary
certification or an STE score. The standard combines writing rules and a controlled
dictionary; prose appearance alone does not prove conformance. The
[official FAQ](https://www.asd-ste100.org/STE_faq.html) informed the approved plan:
its indexed official-domain text established that distinction, while the direct
fetch returned HTTP 403. Do not claim a complete standard audit from that evidence.

| Rule | Apply it without losing meaning |
| --- | --- |
| Short, complete sentences | Give each sentence a clear purpose. Split dense prose where conditions and references remain clear. Do not impose a word limit or cut a required condition. |
| Active voice | Name the actor and action when known: “The reviewer checks the PR head.” Preserve unknown ownership rather than inventing an actor. |
| Consistent terms | Use the same name for the same concept. Keep exact domain terms, identifiers and quoted language. Define a changed or overloaded term before using it. |
| Concrete instructions | State the action, target, condition and expected result. Preserve order and dependencies. Replace vague advice with observable steps when the task supplies them. |
| Defined necessary jargon | Explain an unfamiliar necessary term at first use for this audience. Keep technical terms that carry meaning; do not replace them with an inaccurate everyday word. |

## Concise updates and complete records

Lead operator updates with the answer, outcome, action or blocker. Add the current
state and the evidence needed to assess it. Name an open next step when it helps,
without inventing a duration. State what passed, what failed and what remains
unknown. Use matter-of-fact language about errors and fixes. Avoid an empty opener
or closing offer that adds no information.

Use numbered steps for an actual sequence. Use prose or bullets for parallel facts.
Choose headings when they help the reader navigate; a fixed task format may require
them. There is no five-item cap, one-topic restriction, mandatory heading pattern,
blanket ban on hedging or requirement for an estimated time. Keep meaningful words
such as “might,” “unverified” and “assumed” when they describe real uncertainty.

Durable records remain complete. Rewrite dense wording and group related facts;
do not replace a self-contained worker brief with a chat summary. Preserve:

- Goal, scope, owner, file ownership, exclusions and dependencies.
- Preconditions, authorization, role boundaries, stop gates and operator decisions.
- Options and costs, chosen decision, rationale, approval provenance and evidence.
- Exact commands, identifiers, URLs, quotes, numbers and necessary technical terms.
- Verification steps, observed results and counts, skipped checks and evidence limits.
- Open questions, uncertainty, remaining work and required handoffs.

The same honesty bar applies to a short update and a full record. A test result is
not proof of a broader runtime claim. Do not remove a qualifier because it makes
an answer longer. Do not change a permission or soften a hard stop while rewording.
Existing repair and escalation rules govern failures; style does not replace them.

## Review before sending

Check whether the reader can identify the outcome or requested action. Check that
sentences have clear actors where known, terms stay consistent and necessary jargon
has an audience-appropriate explanation. Compare against the source for missing
constraints, conditions, ownership, literals, authorization, stops and evidence.

For status, worker-brief or decision rewrites, read the
[hypothetical before/after examples and preservation matrices](references/clear-writing-examples.md).
Use them to compare substance, not as fixed templates. Human semantic review is
required for completeness and readability. Literal, link and packaging tests can
catch lost protected text; they cannot prove semantic equivalence, writing quality
or STE compliance.
