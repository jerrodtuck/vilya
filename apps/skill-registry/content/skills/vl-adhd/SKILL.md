---
name: vl-adhd
description: >-
  Shared clear-writing policy for supported Vilya seats and authored prose.
  Apply full ASD-STE100 Issue 9 to planning prose and the existing clarity defaults
  to operator updates, ADRs, specs and PR evidence. Preserve technical facts, uncertainty,
  permissions and fixed output contracts. Seats load it; direct invocation
  is a fallback when a host skipped the load.
codex-support: "shared-compatible"
codex-notes: "Shared clear writing for operator updates and complete durable records; facts and authority remain intact."
codex-invocation: "$vl-adhd"
codex-prerequisites: "Readable skill and current seat context."
---

# Shared clear writing (any stack)

Seats apply this policy at entry. Use `$vl-adhd` in Codex when discovered, or read
this source. Other hosts use supported `/vl-adhd` or the source fallback.
Loading this policy does not activate a seat or expand authority.

> Credit: adapted from [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd)
> (MIT, © Ayoub Ghriss) for the Dev Loop.

## Scope and precedence

Apply this policy to all authored prose: operator updates, explanations, worker
briefs, kickoffs, ADRs, specs and PR verification records. An ADR is an architecture
decision record. Higher-priority instructions and explicit output contracts outrank
style defaults. Keep the [vl-ask fixed answer](../vl-ask/SKILL.md#answer-format).
Explicit operator tone, depth or format preferences override style defaults.

Preserve facts, uncertainty, permissions, role boundaries and verification gates.
This policy creates no new confirmation requirement, agent, review stage or service.
The [vl-present contract](../vl-present/SKILL.md) owns presentation choices.

## Full STE for planning prose (#373)

Planning notes, kickoffs, verification plans and worker instructions use full
ASD-STE100 Issue 9, dated 2025-01-15. Consult relevant sections of the
[complete rule reference](references/ste-planning.md) and pinned dictionary as needed.
Reuse verified interpretations and terms while their wording, meaning and context
remain applicable. Recheck changes. Do not reload the full map or glossary for every plan.

Separate instructions from explanations. Instructions use at most 20 words per sentence.
Give one action per sentence, except for actions that occur at the same time.
Put a necessary condition first, then a comma, then the command.
Descriptions use at most 25 words per sentence. Each paragraph has one topic and
at most six sentences. Notes contain optional information, not actions, limits or stops.

Include only what the next bounded unit needs. State each fact or requirement once
where needed. Repeat terms or conditions when correct execution requires them.
Link unchanged contracts and require access. Keep task-specific authority, stops and
acceptance self-contained. Remove empty introductions and recaps. Retain complete
sentences, connecting words and articles. There is no document-length or bullet-count cap.

## Clarity defaults for other prose

Other prose retains the earlier STE-inspired defaults. Give short, complete sentences,
known actors, consistent terms, concrete actions and explained necessary jargon.
Do not impose planning limits on every chat update or rewrite historical decisions.
Prose appearance alone does not prove conformance or certification.

## Complete records and review

Lead updates with the outcome, action or blocker. State observed results and remaining
uncertainty. Preserve the goal, scope, ownership, exclusions, dependencies and acceptance.
Retain options, costs, rationale, permission evidence, repair history and stop conditions.
Keep code, commands, identifiers, paths, UI labels, quotations and evidence exactly.
Report skipped checks and limits. Usage unavailable is not zero.

Do the [source, dictionary and meaning checks](references/ste-planning.md#existing-plan-review)
within the existing plan review. Check all applicable rules and preserve actor, action,
condition, order, quantity, obligation, permission and uncertainty. Human semantic review is
required. If necessary source access or checks are missing, stop before a readiness
or conformance claim.

Give a short receipt of actual checks with links to reusable evidence. Expand only for
an exception, failed check or unresolved question. Do not attach recurring rule checklists,
per-word tables, glossary dumps or semantic matrices. The
[examples and preservation matrices](references/clear-writing-examples.md) are delivery
acceptance evidence, not a recurring plan template. Counts and packaging tests cannot
prove meaning, certified conformance, live host adoption or savings.

## New-model recalibration

Apply this section only when the operator asks about a newly released model or a
routing recalibration. Route execution to the Vilya Codex orchestrator and require
it to read the full model routing and repair contract at `../vl-orch-codex/references/model-routing.md` in full.
This skill keeps its normal lane and grants no paid API, deployment or publication
authority.

Screen current independent benchmark evidence and official model capabilities and
pricing before running Vilya tests. Challenge the lowest applicable proven seat first.
Run only the smallest matched fixture needed to test what external data cannot show:
skill adherence, repair rate, accepted workflow cost or native Codex transfer. Promote
only after accepted evidence and focused native confirmation; ties, incomplete runs
and exhausted limits keep the incumbent.

The website is the evidence and policy surface, not a paid-execution control. Keep
credentials and launches operator-only. Publish the sanitized result, limitations and
routing change on `/evaluation`; update affected skills only when evidence changes the
route. This avoids repeating a full model tournament for every release.
