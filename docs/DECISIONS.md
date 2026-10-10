# Decisions

Append-only ADR log — newest at top, `## YYYY-MM-DD — Title`. Grep by topic or issue #; captured via /vl-adr.

## 2026-10-09 — General Python crucible with feature boundaries (#376)

**Decision:** Add `vl-crucible-python` as the general Python variant. Retain ML, FastAPI and Django variants for their specialized concerns. The operator approved this choice on 2026-10-09 in the Vilya architect chat.

**Options considered:**
1. Reuse the ML variant everywhere — lowest delivery cost, but imports notebook, training and data-science assumptions into unrelated Python projects.
2. **Add a general Python variant** — one additional skill and its delivery/routing checks; reuses the established review method. Chosen.
3. Extract a generic inheritance/composition system across all variants — larger migration and loading complexity without evidence that this gap requires it.

**Why:** The inspected master has three specialized Python variants and no generic one. Existing open/closed issue searches found their original #160 family and #175, not a general variant. Feature ownership and explicit import boundaries address this gap without introducing framework conventions.

**Consequences:** #376 defines the architecture and delivery scope. The new variant preserves the byte-identical core prompt and severity/reporting contract from [#175](https://github.com/jerrodtuck/vilya/issues/175), with general Python examples elsewhere. Entrypoints import slices; slices import shared primitives. Cross-slice internal imports and cycles are prohibited. Necessary public-contract collaboration requires justification. Packaging, validation and enforcement choices remain proportional to the project; specialized reviews remain selectable, one variant per repo. Existing brownfield rules apply.

Vilya orch owns planning, implementation and normal independent review. One bounded unit covers the skill and affected delivery/documentation. No new inheritance system, extra writing-audit agent, paid call or merge authorization.

**Evidence:** [#376](https://github.com/jerrodtuck/vilya/issues/376); inspected master `1b8e15f1b58fd2b419656c1f3dc79fc3c7454fce`; prior entry `2026-07-18 — Crucible variants: narrow the shared-core claim to core prompt + severity contract; stack-adapt the straggler examples (#175)`. [PyPA](https://packaging.python.org/en/latest/discussions/src-layout-vs-flat-layout/) supports packaging distinctions; [import-linter](https://import-linter.readthedocs.io/en/stable/contract_types/) documents boundary enforcement. The VSA policy is Vilya design intent; implementation and live adoption are unverified.

## 2026-10-09 — Interpret ASD-STE100 Issue 9 for Vilya planning (#373)

**Decision:** Apply the complete Issue 9 rules and dictionary to the planning prose already approved under #341. Use one short Vilya interpretation and consult the source where needed. The operator requested this architect interpretation on 2026-10-09. It clarifies [the full-STE decision](https://github.com/jerrodtuck/vilya/issues/341#issuecomment-6092397095) and [implementation authority](https://github.com/jerrodtuck/vilya/issues/341#issuecomment-6092446002).

**Options considered:**
1. Load all 434 pages into every planning session — cost: repeated context and irrelevant dictionary material, without proving correct use. Rejected.
2. Return to a small clarity subset — cost: fewer lookups, but discards the approved full-standard requirement. Rejected.
3. **One compact interpretation, complete rule coverage, dictionary lookup as needed** — cost: initial mapping and careful plan review. Chosen.

**Why:** The standard separates 53 rules from its reference dictionary. It permits software vocabulary under specified technical-term categories. It does not prescribe Markdown layout or Vilya authority. Sentence limits alone cannot establish correct meaning. Sources: general introduction ii/vii, rules 1.1–1.14 and 9.1–9.4, dictionary introduction 2-0-3–2-0-20.

**Interpretation:**
- **Scope and coverage:** Apply to planning notes, kickoffs, verification plans and worker instructions across Codex, Cursor and Claude. Classify passages by function: instructions are procedural; explanations are descriptive. Keep these in separate lists. Account for all 53 rules across sections 1–9 with source numbers and justified applicability. Identify the eight general recommendations separately. The compact reference supplements the source; it is not another subset. Other chat prose retains current clarity defaults.
- **Structure:** Instructions have at most 20 words per sentence and normally one action. Preserve the simultaneous-action exception. Put a necessary condition before the command. Descriptive sentences have at most 25 words. Paragraphs cover one topic and have at most six sentences. Notes give optional information. Required actions, limits and stops belong beside the action. Sources: sections 4–6.
- **Vocabulary:** Check meaning, part of speech, forms and dictionary help. Prefer approved vocabulary. Keep a small glossary in the shared reference for necessary project terms, with meaning, noun/verb function and source category. Software nouns can qualify under 1.5 category 19; computer-process verbs under 1.12 category 2. These lists give examples, not exhaustive vocabularies. Technical verbs still require context and cannot replace accurate approved wording merely for convenience. No blanket jargon exemption.
- **Meaning and authority:** Preserve actor, action, condition, sequence, quantity, obligation, permission and uncertainty. Do not blindly replace “should” with “must,” or “may” with “can.” Change sentence construction when necessary. Descriptive passive voice is permitted when the actor is unknown; do not invent one. A software agent needs a technical-noun meaning; the dictionary's AGENT entry describes a material. Sources: rules 1.2–1.3, 3.6, 9.1–9.2 and the AGENT/may/MUST/should entries.
- **Literals and counting:** Preserve identified code, commands, paths, IDs, UI labels, quotations and evidence exactly. Apply section 8 counts to surrounding prose. Parenthetical prose needs its own count. Do not hide new prose in code, quotation marks or long hyphenated groups. Sources: rules 1.5 category 10, 1.14, 2.2 and 8.1–8.7; broader nonprose protection comes from the prior Vilya ADR.
- **Risk:** Apply section 7 to actual dangerous or damaging operations. Preserve the condition, prevention action and consequence, using an accurate domain risk category. An ordinary approval or ownership gate is not automatically a safety warning. Style creates no new risk, approval or workflow stage.
- **Brevity:** State each requirement once where needed. Repeat terms or conditions when clarity or correct execution requires it. Retain connecting words, articles and complete sentences. Link unchanged contracts and require access; keep task-specific authority, stops and acceptance self-contained. No arbitrary document-length or bullet-count cap. Sources: rules 4.2–4.5, 6.2, 9.4 and the prior brevity decision.

**Consequences:** Orch implements one authoritative policy in `vl-adhd` and short references in applicable host planning instructions. Existing plan review checks applicable rules, vocabulary against consulted entries, technical-term meanings and semantic preservation. Record the edition and actual checks in existing evidence. Mechanical counts or model assertions do not prove conformance. Incomplete required checks leave conformance unverified and the plan not ready. Use the already-scoped bounded examples; add no writing agent, review stage, certification system or measurement service.

**Source and evidence:** Operator-supplied local `docs/specs/ASD-STE100_ISSUE9.pdf`: Issue 9, 2025-01-15, 434 pages, 3,316,157 bytes, SHA256 `d1f4ea9e7cd6e46b47aa9057209f99e78c0e9cfc4e27a5b07895b05c1a166431`. Reviewed the general introduction, complete Part 1 explanations/examples (physical PDF pages 45–128), complete dictionary introduction (131–148), and selected entries. Visually checked the title, word-selection flowchart and modal entries. The word list (149–434) remains a lookup reference, not an exhaustively reviewed corpus. Internal edition/publisher identification is verified; independent publisher-file hash equivalence and Vilya prose conformance are unverified. Rule/page labels above are the standard's own labels.

The copyright notice (physical page 2) and distribution statement (38) restrict reproduction/public distribution. Preserve the supplied untracked local file. Do not put the PDF, dictionary or extracted standard text in a public commit/site/export. Publish Vilya's own interpretation and rule references with [the publisher source](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf). Local reading resolves the source-access blocker; it does not complete implementation or compliance checks.

**Ownership/stops:** #373 remains orch-owned, jerrodtuck/vilya board 8. Mirror this exact entry and the prior ADR once on the owning implementation branch in `docs/DECISIONS.md`; preserve history. Orch settles the plan and coordinates the bounded Sol/medium implementation with separate Sol/high code review. No added agents, merge, paid test/purchase, deployment, cleanup or archive authority. Preserve routing, pins, repair counts, locks and spending holds. #356 stays completed; #35/#37 stay Blocked. Checkpoint: continue. Architecture direction, not architect worker dispatch.

## 2026-10-09 — Full ASD-STE100 for planning prose, with explicit brevity (#341)

**Decision:** Adopt full ASD-STE100 for natural-language planning prose across Codex, Cursor and Claude Code. Add explicit brevity requirements: include only the next work unit's needs, state each fact/requirement once, link unchanged contracts, and remove introductions/recaps/commentary that add no decision or instruction. The operator selected this stronger policy in architect chat 01a12350-9b44-70e1-9383-e1d5304cef83 on 2026-10-09 after rejecting reliance on repeated general requests for concise model output and asking to make the call an ADR.

This supersedes the STE-inspired-only choice in `2026-10-03 — Shared clear writing and automatic presentation (#341)` for planning prose. The shared presentation policy and other prose defaults remain intact. Do not reopen completed #342/#344 or rewrite historical decisions.

**Options considered:**
1. Keep the existing five-rule STE-inspired subset — cost: least checking overhead, but broad clarity guidance has not satisfied the operator's reading needs. Rejected for planning prose.
2. Tighten a short plan template without full STE — cost: smaller implementation and review burden; still leaves sentence/word choices to general model judgment. Rejected as the sole control.
3. **Full ASD-STE100 plus explicit brevity requirements** — cost: obtain/pin the official rules and dictionary, account for permitted technical terms, revise prose and check conformance/completeness. This can add authoring/review effort and does not establish token or subscription savings. Chosen.

**Why:** The current `vl-adhd` already covers kickoffs, briefs and verification records, and `vl-plan` already loads it. The gap is not another skill invocation; the operator wants stronger authoring constraints for verbose planning notes. Full STE combines writing rules with a controlled dictionary, while document scope/repetition need explicit additional constraints. These are policy choices, not demonstrated efficacy or savings. Precedent: https://github.com/jerrodtuck/vilya/issues/341#issuecomment-5974655990 ; current scope: `skills/vl-adhd/SKILL.md` and applicable seat planning contracts.

**Consequences and acceptance:**
- Apply to procedural/descriptive prose in planning notes, kickoffs, verification plans and worker task instructions. Reuse `vl-adhd` as the single authoritative policy; reference it from seat/worker/copied teaching instead of pasting the full standard into every brief. Keep each plan self-contained for its bounded unit and require reading necessary exact source contracts.
- Full compliance means checked against a pinned official edition's applicable rules and dictionary, including permitted technical nouns/verbs; model self-report or plausible prose is insufficient. Resolve and record the official edition/source before implementation relies on detailed normative rules. Do not invent a partial ruleset and label it full compliance.
- Retain exact code, commands, identifiers, paths, quotations and evidence literals as clearly identified nonprose artifacts. Preserve goal/acceptance, scope/ownership, dependencies, alternatives/costs when needed, uncertainty, authorization, verification, repair history and stop conditions. If a rewrite changes these facts or gates, it fails acceptance. Do not replace a complete plan with a summary or hide unresolved requirements behind links.
- Conformance and semantic completeness are part of the existing orch plan review before publishing a plan as ready; do not automatically create another review agent/stage. Record the edition and actual checks, and leave conformance unverified when checks are incomplete. A plan that requires this policy is not ready until the missing validation/source is resolved. Reuse existing sufficient checks and independent review; a checker alone cannot prove semantic preservation.
- Verify bounded real before/after planning examples for all three hosts, necessary technical vocabulary/literals, a condition/stop gate, an uncertain dependency and a self-contained worker brief. Source/generated/copied teaching parity remains required where affected. These are instruction/prose checks, not new model benchmarks or claims of live host adoption.

**Ownership and follow-on:** Vilya orch is the sole follow-up filer/planner/implementation coordinator for jerrodtuck/vilya board 8, verified chat 01a1234f-68d0-76a3-8c9f-043f089749db (`vilya-orch`). Search current #341 children and open/closed prior work before filing only the missing bounded follow-up. The present check found #342/#343/#344 completed, and no matching full-STE child; orch must reconcile any later amendments. Keep this work separate from the reviewed reminder/handoff/naming units. Mirror this exact dated ADR once into `docs/DECISIONS.md` on the owning implementation branch, newest at top; arch is on master and does not edit shared history there. Update a dated design-intent spec if needed and affected canonical/generated teaching through that branch.

**Evidence and limits:** Current canonical skill sources and prior ADR excerpts were read. Official indexed sources describe rules plus a controlled dictionary: https://www.asd-ste100.org/STE_faq.html and https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf . Direct fetches returned HTTP 403 in this architect session; the full official text/edition has not been inspected here, and no full-conformance audit was performed. Accessible complete authoritative text and a defensible check method are implementation dependencies, not an invitation to claim compliance from indexed excerpts. Effect on readability, accepted-work cost and subscription usage is untested.

**Authority/stops:** The operator authorized this ADR and prospective policy change, not default-branch implementation, a purchase/licence negotiation, model test, paid API call, model-policy change, merge, deployment, chat creation, cleanup or archival. Implementation remains Sol/medium with separate Sol/high actual-head review under current routing. Preserve active pins, repair counts, locks, financial holds/caps and the one continue/Compact/fresh-chat checkpoint. #356 stays completed; #35/#37 stay Blocked. dispatch: orch owns deduplicated implementation planning; this ADR is not an architect worker dispatch.

## 2026-10-08 — Standing Codex seats use explicit Sol models (#363)

**Decision:** The operator approved GPT-6.1 Sol/high for the standing Product Architect and GPT-6.1 Sol/medium for the standing Codex orchestrator. Operators select these settings in the Codex UI before invoking each skill because skill invocation cannot change the active chat model or reasoning effort. Bounded children may use other recorded phase settings; Astra remains an escalation after a recorded Sol impasse or capability failure. (decided by the operator, 2026-10-08).

**Options considered:**
1. Let each invoked skill switch its active chat automatically — cost: the current Codex desktop tool contract exposes no self-model mutation, so the instruction would promise unavailable behavior.
2. Keep the seat model implicit in the evaluation policy — cost: operators must infer setup and stale copied prompts can silently preserve superseded routing.
3. **Publish explicit standing-seat settings and dispatch correctly pinned children for other phases** — cost: one UI selection when seating or reseating each standing chat and explicit child pins. Chosen.

**Why:** The live operator check showed that invoking `$vl-orch-codex` did not change the active model. Official OpenAI Agents API documentation supports session updates for subsequent turns, but this desktop chat exposes no equivalent self-update tool. Issue #357 and merged PR #359 established Sol-first routing; #363 makes the desktop boundary and standing-seat choices explicit.

**Consequences:** The Architect page and `vl-arch` name Sol/high. The Codex Orch page, Setup, Planner, copied prompts and `vl-orch-codex` name Sol/medium. The canonical project template references the same #357 route. Historical Astra-first ADRs remain intact and are superseded by this entry for this operator. Existing project templates that copied the old policy require reconciliation; linked skills update from Vilya after pull and session refresh.

**Evidence:** Operator approval in this chat on 2026-10-08; issue #357 and PR #359; issue #363 and its [issue-first decision record](https://github.com/jerrodtuck/vilya/issues/363#issuecomment-6068335492); prior entry `2026-10-03 — Codex routing by phase, uncertainty and consequence (#347)`; [official session update boundary](https://developers.openai.com/api/docs/guides/agents-api/configuration).

## 2026-10-03 — Shared clear writing and automatic presentation (#341)

**Decision:** The operator approved evolving vl-adhd into a shared STE-inspired communication policy, with a companion visual capability. Seats select prose, tables, editable diagrams or interactive output according to the task; explicit operator direction overrides defaults. Ask only when a material usability/delivery choice cannot be inferred.

**Options considered:** Strict ASD-STE100 everywhere (cost: restrictive vocabulary and compliance verification); **STE-inspired clarity plus adaptive formats, chosen** (cost: explicit selection guidance and capability-aware examples); HTML for all substantial explanations (cost: generation/review/maintenance even when text suffices).

**Why:** Operator prefers the clarity subset and automatic task-guided visuals. STE includes rules and a controlled dictionary; appearance does not prove conformance. Keep full evidence and constraints in worker briefs, ADRs and verification records. This was cross-host design intent, not a tested recipe or a new Codex feature requirement.

**Consequences:** #342 owns writing policy, #343 owns companion visual procedures, #344 owns seat/site adoption. One authoritative policy, readable host fallbacks and no parallel tracker. Architect filed these once; orch alone owns later decomposition and implementation. No files were edited or implementation dispatched in the original decision.

**Original evidence:** Explicit operator approvals in the architect chat, 2026-10-03; [owning ADR](https://github.com/jerrodtuck/vilya/issues/341#issuecomment-5974655990); [official STE description](https://www.asd-ste100.org/faq.html); vl-adhd scope read in that planning session. Before/after acceptance examples were untested at decision time. Preserve that evidence limit.

**Implementation evidence, separate from design intent:** Merged #342/#343 contracts are adopted under [#344 settled plan](https://github.com/jerrodtuck/vilya/issues/344#issuecomment-5974738218) and [operator dispatch](https://github.com/jerrodtuck/vilya/issues/344#issuecomment-5975441367). Source, exported prompt, render, bundle and disposable-home installer checks validate delivery; they do not prove live session/model adoption, host-wide rendering or savings. Runtime results and precise limits are recorded on #344 and its PR.

## 2026-10-03 — Codex routing by phase, uncertainty and consequence (#347)

**Decision:** Operator approved latest supported Astra/high normal planning, Astra/xhigh justified hard planning, Sol/medium settled implementation, Luna/low ONLY bounded enumerated mechanical operations with objective verification, separate Sol/high independent review, and Astra/high or justified xhigh consequential design/security review. Preserve configurable capability-validated exact choices, scoped explicit overrides and active/resumed pins. This explicitly supersedes the earlier two-tier #329/#345 policy as the complete routing table and the historical high/high initial recommendation; historical records below remain intact. Other operators retain configured defaults without their own authorization.

**Options:** (1) Prior two-tier Astra/high → Sol/medium — cost: no mechanical eligibility or explicit review allocation; (2) **phase-aware tiers and bounded repairs, chosen** — cost: eligibility rules and durable exact-setting/repair bookkeeping; (3) automatic cheapest-first — cost: uncertainty and consequence shifted into rework.

**Why:** Operator wants reasoning budget invested in plans and lighter implementation. Complete plans, objective verification and independent review are the mechanism; model labels do not guarantee savings. Official model-selection guidance supports role allocation, not observed Vilya outcomes. No Vilya savings measurements are claimed.

**Consequences:** #347 owns Codex skill/entry/site teaching and bundled contract. Initial failure is detection, not repair. A repair is a corrective change plus targeted verification; failed/inconclusive checks are unsuccessful. At the second consecutive unsuccessful repair of the same unresolved defect/gate, stop before a third and return stable ledger, exact gate, changes, HEAD/diff, ownership and hypothesis to orch planning. Reruns, renames, unrelated passes, workers/resumes/branches do not reset counts. Meaningful targeted resolution closes an entry; regressions retain linked history. Revised allowances require explicit recorded authorized planning decisions. Earlier hard stops apply immediately. Keep full quality gates, independent review and operator merge authority. Capture lightweight actual phase/attempt/review/elapsed/usage evidence where available; missing usage is unavailable, not zero.

**Evidence:** [Operator-approved direction and ADR](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975011992), [settled implementation plan](https://github.com/jerrodtuck/vilya/issues/347#issuecomment-5975070688), [#329 budget clarification](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-5974775376), [official model-selection guidance](https://developers.openai.com/api/docs/guides/model-selection). Approved 2026-10-03; mirror on the owning feature branch. Source/packaging and teaching tests do not prove runtime routing, subscription savings or full #329 acceptance. Orch owns subsequent filing and dispatch; no new runtime router, telemetry or product-config model catalog.

## 2026-10-03 — Repo-owned component baselines and approval evidence (#328)

**Decision:** Add a cross-stack check of the repo's configured component baseline and custom-component policy at crucible review, per the architect's [full 2026-10-03 ruling](https://github.com/jerrodtuck/vilya/issues/328#issuecomment-5973370249). The product owns its library, constraints and approval policy; Vilya does not impose anduin-admin's approval-required rule on every repo.

**Options considered:**
1. Rely only on a chip-brief reminder — low teaching cost, but it does not enforce the check during review, which #328 identifies as the load-bearing point. Not sufficient.
2. Apply a universal library or custom-component ban — simple global wording, but it imports one product's policy into unrelated stacks, backend-only work and ordinary feature composition. Rejected by the architect ruling.
3. **Repo config plus actual-UI crucible checks** — costs two preserved config fields, inspection of the applicable catalog/version and traceable approval evidence where the repo requires it. Chosen; product-specific component lists remain in product records.

**Why:** #328 reports hand-rolled breadcrumb/skeleton primitives in a configured shadcn project because the review did not ask about baseline equivalents. The architect requires the common review habit while preserving product policy and stack applicability. The reported product audit is evidence for the request, not an independently rerun audit.

**Consequences:**
- `Component baseline` records the library/design system, location and constraints, or explicitly `none`. `Custom component policy` records the repo rule and authoritative approval record, or explicitly `n/a` with why no special gate applies. Blank/missing is unknown. `none` does not override another recorded repo policy; `n/a` does not waive ordinary review.
- Review actual UI/components/templates/dashboards, compare new/touched primitives with applicable library equivalents and flag duplication/policy violations under the existing severity contract with concrete refactors. A missing vendored primitive does not prove the library lacks it: check the applicable catalog/version or label that claim unverified. Backend-only/ML-only changes explicitly report no-UI applicability.
- Where approval is required, missing qualifying approval blocks the affected primitive. Cite explicit, attributable operator approval scoped to the repo/component or bounded approved set, recorded on the owning issue/PR or named repo record. Chat approval needs durable provenance. Agent proposals, vague claims, unsourced peer relays and a merge alone do not qualify; grandfathered sets qualify only in recorded scope.
- Distinguish baseline primitives from ordinary feature composition/wrappers; enforce a broader class only when the product records it. Material ambiguity is a bounded fork on the owning product issue, not a new global interpretation.
- Setup parsing/editing/regeneration preserves both fields, explicit none/n/a and unknown values. Check installation drift before updates; this implementation's preflight found canonical junctions with matching hashes for the existing inspected crucible entries. Their update path is canonical merge/pull; divergent copies elsewhere must be preserved and reconciled before reinstalling.

**Evidence:** [#328 issue and reported product examples](https://github.com/jerrodtuck/vilya/issues/328), [orch kickoff](https://github.com/jerrodtuck/vilya/issues/328#issuecomment-5973367521), [complete architect ruling](https://github.com/jerrodtuck/vilya/issues/328#issuecomment-5973370249), [implementation and verification receipt](https://github.com/jerrodtuck/vilya/issues/328#issuecomment-5973433181), PR #338. This records the bounded policy, not approval of any specific product component or a live product audit.

## 2026-10-03 — Single filing seat and durable seat handoffs (#326)

**Decision:** Retain exactly one named epic-child filing seat (`arch` or `orch`), and adopt host-specific seat resolution with issue-first decision requests and reply rereads, per the architect's [2026-10-03 ruling](https://github.com/jerrodtuck/vilya/issues/326#issuecomment-5973370071). The filing choice remains the [2026-08-01 lock](https://github.com/jerrodtuck/vilya/issues/326#issuecomment-5149229141).

**Options considered:**
1. Shared/implicit filing ownership — less kickoff detail, but the reported #326 incident produced duplicate child sets. Rejected; one named filer costs an explicit kickoff field and prior-child search.
2. Treat queued messages or Remote Control status as seat acknowledgement/presence — less durable recording, but the reported incidents include a ghost transport and an already-answered issue. Rejected; resolve the actual host directory, persist the request immediately, and reread the issue before escalation or ending work.
3. Add a global session registry or receipt API — extra machinery without an exposed cross-host contract. Rejected; use verified host capabilities and label unavailable capabilities unverified.

**Why:** Single ownership prevents competing child creation; durable issue questions and reply rereads distinguish unresolved decisions from transport uncertainty. The issue reports are historical evidence, not independently replayed incidents. Current Codex tool contracts support exact chat identity and authorized messages; they do not establish human read receipts. Claude directory behavior must be verified in its host, and Cursor capabilities remain verified or explicitly unverified.

**Consequences:** Update Planner decomposition, Architect, all three orch variants and worker handoffs. Unnamed/dual ownership stops filing until rewritten. Only the named filer searches open/closed prior children and reconciles existing links before creating missing children. Unanswered requests remain unconfirmed/pending; dependent implementation stops until the required ruling. Trusted human authorization and host confirmations still apply. No new registry, monitor or unattended-send promise. Source/render tests validate teaching; runtime message delivery is not claimed.

**Evidence:** [#326 kickoff](https://github.com/jerrodtuck/vilya/issues/326#issuecomment-5973367204), [filing lock](https://github.com/jerrodtuck/vilya/issues/326#issuecomment-5149229141), [host-specific amendment](https://github.com/jerrodtuck/vilya/issues/326#issuecomment-5973370071).

## 2026-10-03 — Approved Codex model operating policy — 2026-10-03

The operator requires the same role split as latest Fable planning followed by latest Sonnet implementation: use the current highest-capability OpenAI planning family for planning and the current balanced coding/workhorse family for spawned implementation chips. The functional OpenAI mapping recommended on 2026-10-03 is Astra for planning and Sol for implementation; this is a role mapping, not a claim of identical cross-vendor performance.

Current verified session availability: `gpt-6-astra` and `gpt-6.1-sol`. Recommended initial effort is high for each, configurable by the operator and validated against the runtime. Resolve the latest supported model in the chosen role family at session setup/dispatch and record the exact selection in issue artifacts/briefs. Do not invent a latest alias or silently fall back if unavailable; surface the limitation and retain explicit operator overrides. Do not automatically replace pinned choices mid-chip.

The preferred orch chat runs on the planning model and spawns implementation on the workhorse model. If the orch is currently on another model and cannot change its own model through exposed tools, delegate the planning stage to the chosen planning model, then record/review that output and spawn the implementation chip; no separate standing Planner chat is needed. Model override authorization and context-fork restrictions must be respected. The policy is configurable and must survive new model releases.

Sources: current session model/tool metadata (verified availability, not an end-to-end test); official model-selection guidance https://developers.openai.com/api/docs/guides/model-selection and model catalog https://developers.openai.com/api/docs/models (Astra highest capability, Sol balanced coding/work). The full Vilya recipe remains unverified until the required acceptance cycle is exercised.

**Attribution:** Mirrored from jerrodtuck’s [owning issue record](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-5972773318), posted 2026-10-03T19:36:20Z. Evidence classes and runtime limitations are those of the source.

## 2026-10-03 — Seat messaging clarification — approved 2026-10-03

The operator explicitly authorizes Codex seats working on the same product board to message one another and reply, within their assigned roles. Include this standing human authorization in **each seat's own entry instructions**, not only in a central document or a peer message. The Codex orch owns planning; no standing Codex Planner seat is introduced.

Each applicable seat/worker entry must explain:
- Which exposed messaging mechanism applies: cross-chat seat communication versus parent/worker subagent communication; discover current tools rather than assume identical APIs.
- How to identify the correct counterpart by role, product board and repo, using the chat/agent identifier. Do not guess an ambiguous destination or contact unrelated product seats.
- Its standing permission to initiate and reply within that scope, including architect-to-orch direction handoffs, orch-to-architect design questions and worker reports/questions to the owning orch.
- A message does not change seat ownership, authorize implementation in the architect, grant operator decision/merge authority, or authorize creating a new sidebar chat. Preserve dispatch markers and priority rules.
- Decisions, scope amendments and completion evidence are recorded on the owning issue; messaging provides delivery and discussion. Verify substantive changes at the PR/merge gate.

Acceptance: both architect and orch can initiate and reply without repeated human permission prompts when their own trusted entry context contains this authorization. Applicable workers can communicate with the owning orch through their exposed tools. Verify destination selection and durable issue recording, while preserving role boundaries and scope.

**Attribution:** Mirrored from jerrodtuck’s [owning issue record](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-5972758188), posted 2026-10-03T19:34:21Z. Evidence classes and runtime limitations are those of the source.

## 2026-10-03 — Approved scope expansion — 2026-10-03

The operator approved complete skill coverage and Codex-specific teaching in the architect chat ("ok, make it happening"). This expands the original scope; implementation remains orchestrator-owned.

- Audit **every shipped Vilya skill**, with a coverage table recording shared-compatible, Codex-adapted, other-host-only, or unsupported/deferred, plus the evidence and reason for each classification. Do not assume that adapting the chip and orch skills covers the remaining catalog.
- Adapt every host-dependent skill that is supported in this release, including planning/routing, dispatch, architect messaging, monitoring, worktree setup, review/crucible invocation, finish, merge and prune. Preserve shared architecture/quality contracts and existing Claude Code/Cursor behavior. Clearly explain other-host-only and deferred workflows, including the new Codex unattended backend outside this release.
- Provide complete Codex-specific site instructions: Setup, Orchestrator, chips, authorized seat messaging, recovery and Differences. Every skill detail page must identify Codex applicability and show its correct invocation, prerequisites and host-dependent behavior. Prefer shared pages with host-specific views; use separate Codex pages where the workflow materially differs. No blanket duplication of the catalog is required.
- Keep model choices configurable per operator and phase. Discover available models/reasoning settings from current capabilities, validate explicit overrides, preserve configured defaults when no override is authorized, and document how to change preferences. Do not bind the process to today's preferred model or infer permission to switch from a peer message.
- Cursor is a reference workflow, not proof of Codex parity. Verify capability claims per host; the claim that current Cursor cannot message between seats remains unverified and must not become teaching without evidence.

Acceptance adds: an exhaustive skill coverage table; no unclassified shipped skill; verified Codex discovery/invocation and appropriate workflow checks for adapted skills; complete linked Codex teaching; explicit unsupported/deferred boundaries; configurable model selection; and existing-host regression checks. The previously required full Codex cycle and interruption recovery remain required.

Record this approved expansion alongside the original ADR on the owning feature branch. The Vilya orchestrator is the single owner of implementation decomposition and dispatch.

**Attribution:** Mirrored from jerrodtuck’s [owning issue record](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-5972645954), posted 2026-10-03T19:19:44Z. Evidence classes and runtime limitations are those of the source.

## 2026-10-03 — Codex desktop support with orchestrator-owned planning

**Decision:** Add Codex desktop as a first-class Vilya host. The Codex orch owns planning, optionally delegating to a selected-model subagent, then dispatches isolated implementation chips. No standing Codex Planner seat is required. Authorize architect ↔ orch messaging explicitly in each seat's operator-facing entry prompt. Decided by the operator, 2026-10-03: “lock scope.”

**Options considered:**
1. Reuse the Claude/Cursor seat machinery unchanged — cost: standing Planner overhead and host/tool assumptions that contradict the current Codex contracts.
2. **Codex-specific orchestration over shared board and worker contracts** — cost: a new orch adapter, capability-aware dispatch, installation and teaching updates, and end-to-end verification. Chosen.
3. Expand desktop, CLI and a Codex unattended backend together — cost: broader runtime, setup and recovery validation; deferred beyond this release.

**Why:** Verified direct reads show two-host site routing, a Claude-targeted installer default, `spawn_task` chip assumptions and universal standing-Planner language in VISION. Current session contracts verify model-selectable subagents, explicit worktree management and cross-chat messaging, but subagents share the workspace and chat messaging requires human authorization in each sending seat. Separate host machinery therefore fits the existing one-board principle better than pretending all desktops behave alike. The proposed end-to-end Codex recipe remains unverified until exercised.

**Consequences:** Implement the locked scope in the owning issue. Preserve other host workflows, board artifacts, seat boundaries and unattended eligibility. Record decisions and amendments durably on issues; messages do not grant operator authority. Validate planning, isolated implementation, amendment delivery, PR evidence, interruption recovery and worktree archival. Mirror this entry on the owning feature branch, not directly on master.

**Evidence:** Operator instructions in this architect session (2026-10-03); source paths and current tool-contract evidence listed in the owning issue; official worktree documentation https://learn.chatgpt.com/docs/environments/git-worktrees; prior ADR `2026-07-20 — One board, two desktops` (#281/#280), Planner ADR (#203), seat boundaries (#306/#308). This supersedes the universal Planner requirement for Codex desktop only.

**Attribution:** Mirrored from jerrodtuck’s [owning issue record](https://github.com/jerrodtuck/vilya/issues/329#issuecomment-5968209218), posted 2026-10-03T10:20:21Z. Evidence classes and runtime limitations are those of the source.

## 2026-07-22 — Desktop session titles + harden arch refuse-implement (#308)

**Decision:** (A) Standing seats on **Claude Code Desktop UI** title chats `<repo-short>-orch` /
`<repo-short>-arch` / `<repo-short>-plan` (`repo-short` = `gh repo view --json name -q .name` or
the leaf of `nameWithOwner`) so `mcp__ccd_session_mgmt` can find the right seat across desktops.
Host scope is locked to Desktop UI — **not** Claude Code CLI, **not** Cursor. Cursor orch may use
the same pattern for human scanning only; there is no `ccd_session_mgmt` on Cursor.
(B) Direction seats (`/vl-arch`, `/vl-plan`, `/vl-ask`) decline plain-language implement asks
("implement", "fix that now", edit product or Vilya skill files, "write the code") with a one-line
route to the owning orchestrator — same rhetorical force as the #306 seat-check, different trigger.
(decided by operator, 2026-07-22).

**Options considered:**
1. Rely on the existing Never "Implement" line alone — cost: the #308 incident happened with that
   line already present; an urgent operator ask overrode it the same way a slash-skill body overrode
   Never in #306 — rejected as sole control
2. **Desktop title house rule on CC standing seats + explicit refuse-implement in Never + Honesty
   bar on direction seats (chosen)** — cost: short skill-text additions + optional Differences
   one-liner + registry sync — chosen
3. A hard tool gate that blocks file edits outside chip/orch sessions — cost: no reliable
   cross-host "which seat is this session" runtime signal today — rejected (revisit if the
   incident recurs after this ADR)

**Why:** Failure museum — a 2026-07-22 `/vl-arch` session edited product masters and Vilya skills
in place when the operator said to implement/fix (later reverted). #306 closed wrong slash-skill
execution; it did not close plain-language implement asks. Separately, standing Desktop seats need
stable chat titles so `ccd_session_mgmt` can target orch/arch/plan across desktops.

**Consequences:**
- `/vl-orch-claude`, `/vl-arch`, `/vl-plan` gain a Desktop chat-title house rule at Seat /
  session start (`<repo-short>-{orch,arch,plan}`).
- `/vl-orch-cursor` gains an optional human-scanning title note only — no `ccd_session_mgmt`.
- `/vl-arch`, `/vl-plan`, `/vl-ask` gain refuse-implement clauses in Never + Honesty bar.
- Differences cross-session row note mentions the Desktop title pattern (thin).
- `npm run sync:skills` mirrors skill changes into the registry content.

**Evidence:** #308 (this fix); #306 seat-boundary ADR; 2026-07-22 arch-session implement drift
(reverted).

## 2026-07-21 — Seat boundary: refuse other seats' skills invoked in the wrong session (#306)

**Decision:** A slash-invoked skill that belongs to a different seat than the one this session is
seated as must be **declined**, not executed. Two mechanisms, both required: (1) a **Seat check**
preamble near the top of the three orchestrator-only operator skills — `/vl-merge-pr`,
`/vl-prune`, `/vl-chip` — that tells a non-orch session (`/vl-arch`, `/vl-plan`, `/vl-ask`, or
any seat that is not `/vl-orch-cursor` / `/vl-orch-claude`) to decline with a one-line route and
stop before reading further; (2) an explicit refusal clause in the seat skills themselves —
`/vl-arch`, `/vl-plan`, `/vl-ask` — stating that another seat's skill invoked here is declined
with a one-line routing answer, and that **seat doctrine wins over the invoked skill's body**. The
two orchestrator seats (`/vl-orch-cursor`, `/vl-orch-claude`) get a one-line reinforcement only, since
they already own merge/prune/chip. (decided by operator, 2026-07-21).

**Options considered:**
1. Rely on the seat's own Never list only (status quo) — cost: the #306 incident happened with
   a Never list already in place; the invoked skill's own body reads like a green light and can
   outrank it in practice — rejected as sole control
2. **Seat-check preamble on the orch-only skills + explicit refusal clause on the seat skills
   (chosen)** — cost: one short section per touched skill; registry mirror sync — chosen
3. A hook/gate that blocks slash-invoking a skill outside its declared seat — cost: no reliable
   cross-host signal for "which seat is this session," skills are plain markdown with no runtime
   enforcement hook today — rejected (revisit if the incident recurs after this ADR)

**Why:** Failure museum — a CITranslator `/vl-arch` session ran `/vl-merge-pr 148` and
`/vl-prune --apply` because the invoked skills' own instructions read like license to proceed,
overriding the seat's earlier Never list. Belt-and-suspenders closes the gap from both ends: the
orch-only skill refuses to be read as a green light by a non-orch seat, and the seat itself refuses
to execute a skill that belongs to another seat.

**Consequences:**
- `/vl-merge-pr`, `/vl-prune`, `/vl-chip` gain a "Seat check" section near the top (after companions,
  before the first working section) naming the #306 failure explicitly.
- `/vl-arch`, `/vl-plan`, `/vl-ask` gain a refusal clause in their Never/Honesty-bar sections.
- `/vl-orch-cursor`, `/vl-orch-claude` gain a one-line honesty-bar reinforcement (not bloated —
  they already own merge/prune/chip).
- `npm run sync:skills` mirrors these into the registry content.
- Considered and left alone: `/vl-finish-feature` — it is chip-owned close-out, not an
  orch-only operator skill, so it does not get the seat-check preamble.

**Evidence:** #306 (this fix); CITranslator incident report (`/vl-arch` session ran
`/vl-merge-pr 148` and `/vl-prune --apply`); prior seat-doctrine ADR `2026-07-21 — Seats return to
main clone after merge (#303)`.

## 2026-07-21 — Seats return to main clone after merge (#303)

**Decision:** `/vl-merge-pr` and the two orch seats (`/vl-orch-cursor`, `/vl-orch-claude`) must
**return to the repo's main clone** immediately after a successful squash-merge, or whenever the
session's workspace/cwd has drifted into a feature worktree — before the turn ends, and before
any further board/merge/prune/kickoff action. Cursor uses `move_agent_to_root`
(cursor-app-control MCP); Claude Code leaves the feature worktree / re-opens the main clone's
cwd. The existing "don't `git worktree remove` the tree you're standing in" warning stays as
belt-and-suspenders, not the primary control. (decided by operator, 2026-07-21).

**Options considered:**
1. Keep the warn-only text (say so if you're stuck in the worktree) — cost: relies on the agent
   noticing and reporting; #301 showed a merge-pr/orch session can just stay put until the
   operator catches it ← rejected as primary
2. **Mandatory return step in `/vl-merge-pr` §5 + house rule in both orch seats (chosen)** —
   cost: one explicit step per merge, small skill-text addition ← chosen
3. Automate via a hook/gate that refuses further orch tool calls until cwd equals the main clone
   — cost: no reliable cross-host "current cwd" signal to gate on; overbuilt for a discipline
   gap ← rejected (revisit if drift recurs after this ADR)

**Why:** Failure museum — after the #301 squash-merge, the orch session stayed in the
`301-worktreeinclude-shim` feature worktree until the operator manually caught it and called it
out. The seats already warned against deleting the tree they stand in, but nothing told them to
actively leave it. Returning is now mandatory: check main-clone-ness the moment merge succeeds,
restore before the turn ends, and only then do board verification and hand `/vl-prune` off from
the main clone.

**Consequences:**
- `/vl-merge-pr` §5 renamed "Return to main clone, then board + prune handoff"; honesty bar
  gains a "merged ≠ returned" line.
- `/vl-orch-cursor` and `/vl-orch-claude` Seat sections gain an explicit drift-restore house rule
  citing the same failure mode.
- `npm run sync:skills` mirrors these into the registry content.
- No change to `/vl-prune`'s own "never remove the tree you stand in" gate — this ADR fixes the
  step *before* prune, not prune itself.

**Evidence:** #301 (`301-worktreeinclude-shim` squash-merge — orch session stayed put until the
operator caught it); #303 (this fix); `cursor-app-control` MCP `move_agent_to_root` tool.

## 2026-07-21 — `.worktreeinclude` is the shared list; Cursor applies via shim (#301)

**Decision:** Repo-root `.worktreeinclude` is the **single declarative list** of gitignored files to copy into new worktrees. Claude Code keeps native support. Cursor does **not** read that file natively — Vilya ships `scripts/apply-worktreeinclude.(ps1|sh)` plus `.cursor/worktrees.json`, and `/vl-start-feature` / Cursor orch run the same script after bare `git worktree add`. Copy only (no symlinks). (decided by operator, 2026-07-21).

**Options considered:**
1. Dual inventories (`.worktreeinclude` + hand-maintained copy commands in `worktrees.json`) — cost: drift ← rejected
2. Symlinks into worktrees — cost: Windows privileges; chip edits hit the main secrets file ← rejected
3. **One `.worktreeinclude` + Cursor/orch adapter (chosen)** — cost: small committed shim; products copy scripts once ← chosen
4. User-level global script as source of truth — cost: not portable with the repo ← rejected

**Why:** Operators already know Claude's include file. Cursor's `worktrees.json` is imperative only; orch daytime trees use `git worktree add` and never run Cursor setup. One list + one adapter covers both desktops without a second inventory.

**Consequences:**
- Ship adapter scripts + `.cursor/worktrees.json` in Vilya; teach Setup / `/differences`.
- `/vl-start-feature` and Cursor orch must run the adapter after creating a worktree.
- Product repos adopt by copying the shim files and extending `.worktreeinclude` (e.g. `.env.local`).

**Evidence:** Operator plan 2026-07-21; Claude worktrees docs (`.worktreeinclude`); Cursor worktrees docs (`worktrees.json`); `/differences` row on gitignored copy.

## 2026-07-21 — Operator-chat voice: `/vl-adhd`, seats load it (#295)

**Decision:** Ship one Vilya skill `/vl-adhd` (ADHD kept in the slug), adapted from [ayghri/i-have-adhd](https://github.com/ayghri/i-have-adhd) (MIT, credit upstream). Operator-facing chat from orch / arch / plan / merge-pr follows it; those seats load/apply the skill — the operator does not invoke it in the normal path. Chip briefs, ADRs, kickoffs, and PR Verification stay long-form. (decided by operator, 2026-07-21).

**Options considered:**
1. Install upstream `/i-have-adhd` only (invoke yourself each session) — cost: easy to forget; not in Vilya install-skills; seats still essay ← rejected
2. Host-only always-apply (Cursor rule + CLAUDE.md) — cost: not shipped by Vilya; Claude/Cursor drift ← rejected as primary
3. **One `/vl-adhd` skill + seat honesty bars load it (chosen)** — cost: one new skill + short citations in seat honesty bars; registry mirror ← chosen
4. Heavier "Operator channel" + separate smoke-card product — cost: overbuilt for the ask ← rejected

**Why:** Operator wants ADHD-friendly voice baked into Vilya when agents talk *to them* (smoke handoffs, orch/arch/plan replies). Invoke-only fails when seats forget. Audience split keeps chip/board artifacts useful. Slug may keep `adhd` — clarity over euphemism for this personal Dev Loop.

**Consequences:**
- Add `skills/vl-adhd/SKILL.md` (+ registry content mirror).
- Honesty bars: `/vl-orch-claude`, `/vl-orch-cursor`, `/vl-arch`, `/vl-plan`, `/vl-merge-pr` (± `/vl-ask`) cite load `/vl-adhd` for operator chat.
- Operator slash-invokes only as fallback if a host skipped the load.
- `docs/DECISIONS.md` append lands on the owning feature branch with the implementation PR.

**Evidence:** Architect session 2026-07-21; operator lock ("other skills run it"); upstream https://github.com/ayghri/i-have-adhd; VISION "Written once, run anywhere" / skills carry mechanics.

## 2026-07-20 — Skill prefix hard-cut: `vilya-*` → `vl-*` (#289 / #280)

**Decision:** Hard-cut rename every Dev Loop skill so folder name, frontmatter `name`, and slash invoke are `vl-<rest>` (e.g. `/vl-chip`, `/vl-orch-cursor`, `/vl-crucible-nextjs`). Front door shortens further: `vilya-ask-vilya` → `vl-ask` (drop the redundant product token in the slug; display copy may still say “Ask Vilya”). Keep the git repo `jerrodtuck/vilya` and the Dev Loop / Vilya site brand. No dual-name aliases. (decided by operator, 2026-07-20).

**Options considered:**
1. Dual install / alias both `vilya-*` and `vl-*` — cost: teaching drift; install ambiguity ← rejected
2. **Hard-cut `vilya-*` → `vl-*` + front door `vl-ask` (chosen)** — cost: one-time sweep of skills, registry mirrors, site, tests, canon; operators re-run `install-skills` and remove stale `~/.claude/skills/vilya-*` junctions ← chosen
3. Keep `vilya-ask-vilya` → `vl-ask-vilya` only — cost: redundant “vilya” in the shortest front-door slug ← rejected

**Why:** Operator wants a shorter skill namespace. Slash browse still clusters under `/vl`; two letters instead of five. Front door `vl-ask` is the cold-read slug; product brand stays elsewhere.

**Consequences:**
- Live teaching surfaces (`skills/`, registry content, site prompts/tests, `GITHUB-PROJECTS.md`, specs status lines) use only `vl-*` invokes.
- Historical `changelog.d/` and older ADR archaeology may keep `vilya-*` names.
- After merge, re-run `scripts/install-skills.(ps1|sh)` and delete leftover `~/.claude/skills/vilya-*` junctions (rename breaks old junction targets; install leaves unmatched entries untouched).

**Evidence:** #289 (locked scope 2026-07-20); epic #280; prior prefix ADR `2026-07-19 — Prefix all Dev Loop skills with vilya-` (#257); seat rename ADR `2026-07-20 — Seat skill rename: orch / arch / plan` (#283).

## 2026-07-20 — Prune gated Cursor probe worktrees (#287 / #280)

**Decision:** `/vilya-prune` **does** clean gated Cursor probe leftovers under `.cursor/worktrees/<repo>/` when the folder matches `*-probe-*` / `bon-probe-*` / `model-switch-probe-*` **or** the branch is `probe/*`, using the same closed-out + clean + not-cwd gates as normal rows. Dry-run labels them `eligible (probe)`; `--apply` removes them (including scoped lock-holder kills). It still does **not** prune arbitrary Best-of-N / Parallel pools. (decided by operator, 2026-07-20).

**Options considered:**
1. Keep the total BoN carve-out (never touch Parallel / BoN trees) — cost: dogfood `probe/*` / `*-probe-*` leftovers pile forever ← rejected
2. **Gated probe patterns only (chosen)** — cost: teach the pattern + keep non-gated pools skipped ← chosen
3. Prune every Cursor worktree under `.cursor/worktrees/<repo>/` that is closed-out — cost: silent deletion of live BoN runs ← rejected

**Why:** Probe trees do not self-clean; the prior skill text treated all BoN-adjacent pools as off-limits. A narrow folder/branch gate removes leftovers without widening to live Task/BoN pools.

**Consequences:** Update `/vilya-prune` §3a + honesty bar; registry skill mirror; Setup prune note; orch prune cards; testable `isCursorProbeCandidate`. Claude `.claude/worktrees` rules unchanged.

**Evidence:** #287 (locked design 2026-07-20); epic #280; prior carve-out in `/vilya-prune` “Why this exists”; `#227` `--apply` kill auth still applies to eligible probe rows.

## 2026-07-20 — Seat skill rename: orch / arch / plan (#283 / #280)

**Decision:** Hard-cut rename of the four standing seat skills so folder name, frontmatter `name`, and slash invoke match short symmetric slugs: `vilya-orchestrator` → `vilya-orch-claude`, `vilya-orchestrator-cursor` → `vilya-orch-cursor`, `vilya-architect` → `vilya-arch`, `vilya-planner` → `vilya-plan`. Keep the `vilya-` prefix. No dual-name aliases, no submenu. (decided by operator, 2026-07-20).

**Options considered:**
1. Dual install / alias both old and new invokes — cost: teaching drift; install ambiguity ← rejected
2. **Hard-cut four-seat rename (chosen)** — cost: one-time sweep of skills, registry mirrors, site, tests, canon; operators re-run `install-skills` so `~/.claude/skills` junctions track new folder names ← chosen
3. Drop `vilya-` prefix for even shorter names — cost: slash-browse collision / lost cluster ← rejected

**Why:** Seat skills should read at a glance under `/vilya`. `orchestrator` vs `orchestrator-cursor` was asymmetric; orch / arch / plan clusters the seats the operator actually seats.

**Consequences:**
- Live teaching surfaces (`skills/`, registry content, site prompts/tests, `GITHUB-PROJECTS.md`) use only the new slugs.
- Historical `changelog.d/` pre-rename fragments may keep old names.
- After merge, re-run `scripts/install-skills.(ps1|sh)` so `~/.claude/skills` junctions point at the new folders (rename breaks old junction targets).
- Chip / start-feature / crucible / merge / prune names unchanged (follow-on if wanted).

**Evidence:** Epic #280; head #283; operator lock 2026-07-20; prior `vilya-*` rename ADRs (#257/#260).

## 2026-07-20 — One board, two desktops (#281 / #280; absorbs #271 Option A)

**Decision:** Teach **one board contract, two desktop chip backends** — same outcomes
(issue → Status → verify plan → PR → merge → prune), different host mechanisms. Do
**not** force Claude Code seat parity onto Cursor (standing Planner, silent worktree
isolation). Evidence class on matrix rows stays `confirmed` / `unverified`; new
2026-07-20 probe rows are `confirmed` only where Support or direct probe locked them.

| Concern | Claude Code | Cursor |
|---------|-------------|--------|
| Board + labels + verify routing | Shared — only durable cross-session channel | Shared |
| Planner for chip-flow | **Required** standing Fable `/vilya-planner` (no reliable mid-session plan→execute model switch) | **Optional** daytime — orch or in-session plan writes kickoff; enqueue `needs:plan` for Fable drain / night-shift / hard forks (**#271 Option A**) |
| Chip spawn | `spawn_task` → own worktree | Task / `best-of-n-runner` with **explicit worktree-first** ask (or CLI `--worktree`); BoN does **not** auto-isolate (Support 2026-07-20) |
| Plan→execute model split | Planner session (Fable) ≠ chip session (Sonnet) | Optional: two Tasks on the **same** worktree (e.g. Grok → Composer); **same model for both is valid** (`resume` keeps prior model) |
| Cloud / remote | Not the primary desktop chip path | Cloud Task = Linux VM — portable stacks OK; **not** Anduin/CygNet (Windows SDK + local CygNet) |
| Completion wake | Monitor tool | Mortal `notify_on_output` + issue completion comment (#270) |

**Options considered:**
1. Force Cursor into CC seat parity (standing Planner + assume BoN isolates) — cost: ops pain (#267/#270); false teaching; Support contradicted isolation ← rejected
2. **One board / two desktops teaching + ADR/canon (chosen)** — cost: site + docs; Cursor orch BoN recipe remains follow-on ← chosen
3. Cursor-only rewrite that drops CC Planner — cost: breaks CC chip-flow ← rejected

**Why:** Probes + Cursor Support (orch session `ab4276d0-…`, 2026-07-20) locked BoN worktree-first and optional daytime Planner. Shared board contracts must not fork; divergent machinery must be taught explicitly so operators do not borrow the other host’s seats.

**Consequences:**
- Site `/differences` is the teaching surface (host toggle story-first; matrix second).
- Canon paragraph in `GITHUB-PROJECTS.md` points here + `/differences`.
- Absorbs **#271 Option A** — Cursor daytime Planner optional; orch still required; `/vilya-planner` not deleted; night-shift still needs `plan:ready`.
- Cursor orch skill deep-links here for BoN/cloud/model-split detail (recipe follow-ons under #280).
- Does **not** rename `vilya-*` skills; does **not** make Architect a standing orch child.

**Evidence:** Epic #280; head #281; #271 Option A lock; Cursor Support BoN worktree note 2026-07-20; probes BoN-fail → cloud OK → BoN OK with worktree ask → Grok→Composer two-chip OK; prior Planner ADRs (#203/#255/#261/#270).

## 2026-07-19 — Orchestrator standing plan:ready poller (amends #203)

**Decision:** The orchestrator session owns a **standing completion poller** for Planner output — REST + host wake (`notify_on_output` on Cursor; Monitor tool on Claude Code), cadence ≥120s, wake when an open issue **gains** `plan:ready` (dedup on issue set / label transition). Same-turn per-enqueue board Monitor remains best practice but is **no longer the sole wake path**. Never monitor the Planner process/session. (decided by operator, 2026-07-19; motivated by ops: Planner intake poller works; orchestrator repeatedly skipped per-enqueue arm).

**Options considered:**
1. Louder teaching only (“enqueue = label + monitor, no exceptions”) — cost: cheap; still fails under load.
2. **Standing orchestrator `plan:ready` poller (chosen)** — cost: second standing watcher on orchestrator; REST/quota hygiene; skill + standing-orders amend ← chosen
3. Operator nag / status quo per-enqueue only — cost: operator babysits the seat.

**Why:** Twin of Planner intake (#255): the seat that needs the signal owns a structural wake. `notify_on_output` only wakes the arming session; board remains the handoff. Per-enqueue arming is easy to skip because labeling feels complete; chip dispatch’s “no exceptions” hammer does not transfer. Ops evidence: Planner standing intake works; orchestrator forgets Planner completion monitors.

**Consequences:**
- Amend orchestrator standing orders (Claude + Cursor cards), canon Planner paragraph, `/chip` only if it teaches enqueue, site Orchestrator prompts/tests.
- Keep: never watch Planner process; chip completion monitors still per-dispatch; Planner intake stays Planner-owned (#255).
- Softens #203 “when you enqueue, arm a board Monitor” from sole mechanism → standing poller required; per-enqueue arm optional reinforcement.
- `DECISIONS.md` append on owning feature branch.
- Cursor standing poller teaching includes re-arm / liveness (#270) — not set-and-forget.

**Evidence:** Operator lock Product Architect session 2026-07-19; ops report same day; prior `2026-07-19 — Planner loop… (#203)`; `#255` Planner intake Monitor ADR; Cursor REST + `notify_on_output` recipe; `#270` shell teardown.

## 2026-07-19 — Cursor tears down long-running monitor shells (#270)

**Decision:** Treat Cursor's reclaim/teardown of long-running background shells as a
**named host limit**. Orchestrator chip monitors, standing `plan:ready` pollers, and
Planner intake watchers that use `notify_on_output` are **mortal**: arm → assume mortal →
**re-arm** when the session notices death, after long idle gaps, or when an expected
signal is missing (one REST check, then re-arm if the shell is gone). Do **not** teach
arm-once-and-forget. Preserve the #267 complement: re-seed `last-seen` every tick; do
**not** kill/re-arm after every successful drain. Claude Code's Monitor tool path stays
host-specific — no false process-lifetime parity. (locked ops finding + Planner soft
fork A, 2026-07-19).

**Options considered:**
1. **Short ADR + skill/prompt/canon teach (chosen)** — cost: one DECISIONS row + cross-skill
   wording; durable across seats ← chosen
2. Teaching-only, no `DECISIONS.md` row — cost: lower; issue body easier to lose

**Why:** Ops saw a chip monitor for #259 armed then dead ~2 min (PID recycled, no wake).
Seats were treating "armed" as "alive." Naming teardown + re-arm duty stops that without
thrashing monitors every drain (#267).

**Consequences:** Canon (`GITHUB-PROJECTS.md`), `planner-flow` teardown section, Cursor
orchestrator standing orders (`CURSOR_DISPATCH_MONITOR` / `PLANNER_ORCH_DOCTRINE`),
`/vilya-chip` §3 Cursor row, Planner intake complement, Differences monitor row. Does not
fix Cursor itself; does not change ≥120s REST / no GraphQL hot path.

**Evidence:** #270 (locked finding + kickoff); #259 (monitor died mid-chip); #267
(persist-across-drains complement); #261 (standing orch `plan:ready` poller); #255
(Planner intake); prior `2026-07-19 — Cursor REST chip monitor` teaching (#223/#237).

## 2026-07-19 — Planner intake poller persists across drains (amends #255)

**Decision:** The Planner **intake** poller is armed once (session start / idle empty queue) and **left running across drains**. Do **not** kill/re-arm after every issue to reset `last-seen`. Each tick: fetch open `needs:plan` → compute gains vs `last-seen` → **always set `last-seen = current set`** (including empty) → wake only on gain; never re-announce the same standing set. Removals re-seed via the assignment; no process restart. Same lifecycle on Cursor (`notify_on_output`) and Claude Code (Monitor tool). (decided by operator from Planner ops, 2026-07-19).

**Options considered:**
1. Kill/re-arm after every drain to reset `last-seen` — cost: Windows `exit_code=4294967295` noise; watcher can die quietly; missed wakes (observed: #261 sat on `needs:plan` with no `PLANNER_INTAKE_WAKE`) ← rejected
2. **Persist one poller; re-seed `last-seen` every tick (chosen)** — cost: trivial recipe clarity; matches gain-only wake without process churn ← chosen

**Why:** Ops on standing Planner (`jerrodtuck/vilya`, Cursor): intentional `Stop-Process` looked like poller failure; a later watcher died (~95s) with no wake while work waited on the board. REST ≥120s + gain-only sentinel shape stays; only lifecycle/seeding changes.

**Consequences:**
- Update `/vilya-planner` skill intake section, registry mirror, Planner site standing-orders card; clarify `#255` / spec if they imply re-arm-as-restart.
- Optional honesty: host “error” after intentional kill ≠ intake failure — prefer never killing.
- Unchanged: no process/completion self-watch; orchestrator owns `plan:ready` completion (#261); cadence/REST-only; no auto-dispatch on wake.
- Host shell teardown / re-arm-when-dead is a separate amend (#270).

**Evidence:** Planner session ops report 2026-07-19 (draft to architect); prior `#255` intake Monitor ADR; issue #261 missed wake until manual notice; issue #267.

## 2026-07-19 — Planner intake Monitor for needs:plan wake (amends #203)

**Decision:** The standing Planner session owns an **intake** board poller in its own session — REST + host wake (`notify_on_output` on Cursor; Monitor tool on Claude Code), cadence ≥120s, wake only when the open `needs:plan` set gains an issue. Soften “Planner never arms monitors” to: never arm **process/completion** monitors on yourself; **intake** for your own queue is required. Orchestrator still arms only the **completion** board Monitor (`plan:ready` / kickoff) when enqueueing. Reject sibling-chat ping and “Planner as orchestrator subagent” as the default. (decided by operator, 2026-07-19; Cursor intake loop **tested** in-session the same day).

**Options considered:**
1. Operator / orchestrator nudge when queue was empty — cost: operator babysits a role seat; contradicts founding “skills carry mechanics.”
2. **Planner-owned intake Monitor (chosen)** — cost: second watcher per repo; REST/quota hygiene; amend #203 skill/prompt/spec wording ← chosen
3. Planner as orchestrator subagent — cost: reopens #203 cardinality; Claude Code `spawn_task` still has no model pin; Planner liveness tied to orchestrator; Cursor-only asymmetry if adopted there first.

**Why:** `notify_on_output` only wakes the session that armed the shell — sessions still do not message each other; the board remains the handoff. Without an intake alarm, “idle in session” is asleep until pinged. Cursor test confirmed the intake loop wakes on new `needs:plan` without operator typing. Completion watches stay orchestrator-owned so Planner is not treated as a chip.

**Consequences:**
- Amend `/vilya-planner` skill, `docs/specs/planner-flow.md`, Planner site standing-orders card, and any “never arm monitors” copy that forbids intake.
- This ADR supersedes the #203 clause that implied Planner never arms any monitor / only idles until pinged; does **not** supersede standing Fable Planner, labels, or orchestrator completion Monitor.
- Follow-on work ships via board issues (skill/spec/site + `DECISIONS.md` file append on the owning branch) — not from the architect session.
- Claude Code: same doctrine via Monitor tool (host mechanism already in chip/orchestrator canon).

**Evidence:** Operator lock in Product Architect session 2026-07-19; Cursor intake poller tested same day (wake on `needs:plan` without ping); prior entry `2026-07-19 — Planner loop for anytime plan≠execute (#203)`; `docs/specs/planner-flow.md`; VISION roles / “Humans decide; skills carry mechanics.”

## 2026-07-19 — Prefix all Dev Loop skills with `vilya-` (#257)

**Decision:** Every skill that ships from `jerrodtuck/vilya/skills/` is renamed so its folder name, frontmatter `name`, and slash invoke are `vilya-<skill>` (e.g. `/vilya-chip`, `/vilya-planner`, `/vilya-cursor-handoff`, `/vilya-crucible-nextjs`). Site pages, prompts, canon, install scripts, and cross-skill links update in the same effort. No nested `/vilya ` + space submenu — hosts expose flat skill names; typing `/vilya` filters by prefix. (decided by operator, 2026-07-19).

**Options considered:**
1. **Prefix every Dev Loop skill `vilya-` (chosen)** — cost: large rename across skills, registry mirrors, site/tests, docs, install links; longer crucible names; one clean namespace beside unrelated user-level skills ← chosen
2. Prefix seat skills only — cost: inconsistent; generic names (`chip`, `history`) still collide
3. Status quo short names — cost: no brand/namespace in a shared `~/.claude/skills` / `~/.cursor/skills` root

**Why:** Operator wants a clear product boundary in a crowded personal skills install. Cursor/Claude skill UX is flat search by name — `vilya-` is the practical “namespace” (prefix filter), not a two-level command tree (confirmed: no `/vilya ` submenu; nested folders only organize disk, invoke name stays the leaf folder).

**Consequences:**
- Hard cut rename (no dual-invoke shim unless a host later documents aliases — unverified; do not promise).
- Epic covers skills + content mirrors + install scripts + **all teaching surfaces** (role pages, Setup, Differences, Overview, Ask Vilya, skill detail links).
- Operator re-runs install / refreshes symlinks after merge so user-level dirs match.
- Unrelated skills (Cloudflare, Railway, etc.) stay unprefixed.

**Evidence:** Operator lock in Product Architect session 2026-07-19; Cursor docs — skill name = folder containing `SKILL.md`, `/` search by name, nested category folders do not create slash namespaces; prior direction option (1) in same session. Children: #258 (skills + install), #259 (site/prompts), #260 (docs/canon).

## 2026-07-19 — Investigate-first hard-stop marking split (#239)

**Decision:** Canonize Anduin's investigate → findings + options on the issue → **hard stop** →
operator pick → implement pattern for execute-time unknowns. **Daytime / attended** marks the gate
with an explicit **Investigate-first / hard-stop** section in the kickoff (non-negotiable stop;
no auto-pick). **Unattended / night-shift** mid-run forks keep **`needs:decision`** + Blocked.
Does not replace Planner for ordinary `plan:ready` issues. (locked in #239 kickoff, 2026-07-19).

**Options considered:**
1. **`needs:decision` only** for every fork — cost: daytime boards look Blocked while the
   operator is live in chat; conflates unattended stop with attended wait.
2. **Kickoff section only** — cost: night-shift eligibility / chain-promote cannot see a prose
   section; unattended loops would wait forever or guess.
3. **Split (chosen):** daytime kickoff section + unattended `needs:decision` — cost: two marks
   to teach; clear per mode.

**Why:** Chips talk themselves into "findings clearly favor X" unless the stop is named
non-negotiable in the brief. Label `needs:decision` stays the machine-readable unattended brake;
the kickoff section is the daytime chip-brief brake.

**Consequences:** `/chip` §2a, `/start-feature` §4, `/planner` kickoff shape, night-shift
unattended consult, orchestrator/planner site cards. REST monitor recipe (#237) unchanged.

**Evidence:** #239 (issue + kickoff); Anduin #228 working pattern.

## 2026-07-19 — Night-shift chain promote via native blocked-by (#214)

**Decision:** Product repos run an event-driven `chain-promote` workflow on `issues: closed` that reads GitHub **native blocked-by**. When all blockers of a dependent are closed and the dependent carries `night-shift:chain` and `plan:ready` (and is not `needs:decision` / epic), apply `night-shift:ready` and drop `night-shift:chain`. Night-shift skill stays eligibility-only. Vilya owns canon + template; each product repo owns the live workflow + backfill. (decided by operator in architect session, 2026-07-19).

**Options considered:**
1. Prompt-only: night-shift promotes `night-shift:chain` successors at preflight — cost: 2am-only, agent judgment, misses daytime merges.
2. Promote workflow + body-text `Blocked-by:` convention — cost: deterministic but invented schema.
3. **Promote workflow + native blocked-by** — cost: GraphQL + backfill; real graph, board-visible ← chosen

**Why:** The stall is missing promotion after close/merge, not missing intelligence in the overnight agent. Native relationships beat prose; keeping night-shift dumb preserves "same daytime chain." `plan:ready` gate preserves Planner (#203).

**Consequences:** Canon label `night-shift:chain`; template `docs/project-tracking/templates/chain-promote.yml`; skill/site teach prep (blocked-by + chain label) via #216. Anduin (and other product boards) chip the live workflow + backfill separately. Expectation: one chain link per merge cycle. Spec: `docs/specs/chain-promote.md` (#217).

**Evidence:** #214 (ADR comment + locked rules, 2026-07-19); live stall (successor unlabeled after blocker merge); night-shift skill pick loop + never merges; #203 Planner eligibility (`night-shift:ready` ∧ `plan:ready`); #215 (canon + template); prior entry `2026-07-19 — Planner loop for anytime plan≠execute (#203)`.

## 2026-07-19 — `/prune --apply` implies scoped lock-holder kills (#227)

**Decision:** `/prune --apply` **implies** kill of lock-holder processes for **eligible** rows only — `--apply` is the authorization; no second operator ask. Dry-run previews `would kill PID … for <path>` and never kills. (decided by operator in architect session, 2026-07-19).

**Options considered:**
1. Status quo (always ask before kill) — cost: friction after every sticky Cursor `cursor-agent-worker` leftover
2. **`--apply` implies scoped kill on eligible rows** — cost: stronger consent semantics on one flag; must keep eligibility + path-scoped PID matching ← chosen
3. Second flag `--kill-locks` — cost: easy to forget; reintroduces two-step consent

**Why:** Operator already treated `/prune --accept` / apply intent as kill auth in practice; a sticky Cursor worker after merge is the motivating case. Eligibility gates + cmdline-must-name-this-worktree keep the blast radius narrow. A separate `--kill-locks` flag recreates the friction Option 2 removes.

**Consequences:** Rewrite `/prune` §5a + honesty bar; sync registry skill mirror, orchestrator prune/MERGE prompt cards, `/merge-pr` handoff, Setup prune note. Still forbidden: dry-run kills, killing processes that do not name the target path, machine-wide kills, skipping eligibility to force-delete.

**Evidence:** #227 (decision body + kickoff); prior doctrine in `2026-07-12-prune-agent-worker-lock` changelog (superseded for `--apply` only); Cursor sticky `cursor-agent-worker` after merge (motivating case).

## 2026-07-19 — Planner loop for anytime plan≠execute (#203)

**Decision:** Introduce an anytime **Planner** loop (one session per repo, launched on Fable) that turns `needs:plan` into `plan:ready` with kickoff + verify plan on the issue. Orchestrator + chips stay on Sonnet (`settings.local.json`). Daytime may chip without `plan:ready` when the issue is already clear. Night-shift requires `plan:ready` ∧ `night-shift:ready` (rename from `auto:ready`). Operator + orchestrator prep night-shift by running Planner before the unattended window. Orchestrator arms a **board Monitor** for `plan:ready` (and/or the plan kickoff comment) when enqueueing — not a process/session monitor on Planner. (decided by operator in architect session, 2026-07-19).

**Options considered:**
1. Keep #89 story (orchestrator `/model` Fable plans, chips Sonnet execute) — cost: orchestrator is not the real planner in practice; Fable spent on board ops; claim false on Claude Code chip flow.
2. Invert pairing (Fable chips, Sonnet orchestrator) — cost: every chip burns Fable API after promo window.
3. **Planner session + labels (`needs:plan` / `plan:ready`); rename `auto:ready` → `night-shift:ready`** — cost: major flow change (page, skills, canon, VISION) ← chosen
4. `spawn_task` plan-chips for Fable — cost: **rejected** — `spawn_task` has no model param; both chips inherit the file model.
5. Night-shift same soft skip as daytime — cost: unattended invents scope; rejected in favor of requiring `plan:ready` overnight.
6. Planner inside the night-shift Actions job — cost: one-model Actions; deferred.

**Why:** Plan≠execute needs a session whose model we can pin. On Claude Code that is a dedicated Planner session (`claude --model fable`), not `spawn_task` and not the thin orchestrator. Labels keep night-shift’s “safe unattended” signal separate from “has a plan.” Daytime keeps an attended escape hatch; night-shift does not. Board Monitor on the issue (not the Planner process) matches chip doctrine with a different completion signal.

**Consequences:** Full correct-flow epic #203 (spec, VISION, canon, sync-labels, `/planner` skill + page, orchestrator/chip/night-shift updates, Setup/Differences). Supersedes the #89 “chip flow already is the split / orchestrator plans” teaching. Product repos must migrate `auto:ready` → `night-shift:ready`. Docs land via #204; labels/skills/site via #205–#209.

**Evidence:** #203 (ADR comment + clarification on board Monitor / standing drain, 2026-07-19); #89 (prior claim); Differences/Setup copy (orchestrator-as-planner); chip skill (root-cause in chip, not orchestrator); Claude Code model-config / Differences note (`spawn_task` has no model param, tested 2026-07-17); VISION “no second methodology” (night-shift consumes daytime chain output); spec `docs/specs/planner-flow.md` via #204.

## 2026-07-18 — Crucible variants: narrow the shared-core claim to core prompt + severity contract; stack-adapt the straggler examples (#175)

**Decision:** Option A — adapt crucible-fastapi's and crucible-ml's SOLID / structural-non-negotiables **examples** to their own stacks (rules unchanged — the same move crucible-blazor and crucible-django already embody), adapt crucible-fastapi's brownfield examples to FastAPI flavor, and write all five variant headers to state the precise, hash-verifiable claim: **byte-identical core = the core prompt + the severity/reporting contract**; four stack-tuned pieces = the two stack sections, the SOLID/non-negotiables examples, and the brownfield clause's examples (decided by the operator, 2026-07-18).

**Options considered:**
1. **A — stack-adapt the stragglers; narrow the identity claim** — cost: touches method-block content in fastapi/ml (rules unchanged, examples re-flavored) ← chosen
2. B — neutralize: rewrite SOLID + non-negotiables in all five to stack-neutral, byte-identical text so the issue's dictated "three varying sections" header becomes true — cost: deletes blazor's and django's deliberate stack-tuned examples (built that way in their own PRs), touches all five method cores — largest blast radius, loses teaching value.
3. C — minimal: fastapi brownfield fix + follow-up issue for the fastapi/ml SOLID debris — cost: the header description stays false for fastapi/ml until the follow-up lands; the epic-closer truthfulness sweep ships knowingly incomplete.

**Why:** the fork comment's hash table (issue #175, 2026-07-18) showed the issue's premise was false: only the core prompt (`e91f1535`) and the severity/reporting contract (`707d8a67`) are byte-identical across the five shipped variants — SOLID and structural non-negotiables were already three-way stack-adapted, with fastapi and ml carrying unadapted **React** examples inside Python skills ("`as any`", "valid props", one-implementation *hooks*). A is the same fix class as the issue's own item 2, completes the truthfulness sweep in one pass, and every header claim it writes is verifiable by section-extraction hash. B and C rejected: B deletes deliberate stack-tuning, C ships a knowingly false header.

**Consequences:** every variant header's identity claim is hash-verifiable; the "shared method core" contract is now precisely defined as **core prompt + severity/reporting contract**; the byte-identity acceptance gate for crucible PRs covers exactly those two subsections; future variants must adapt the SOLID/non-negotiables examples and the brownfield examples on creation, never inherit another stack's text.

**Evidence:** #175 (fork comment with hash table, 2026-07-18 18:14; operator decision comment, 2026-07-18); orchestrator scope-sync comment on #175 widening item 1 to all five variants; parent epic #160; shipped variants at `83ec04f` (#166 crucible-nextjs, #170 crucible-ml, #173 crucible-django, #174 crucible-fastapi).

## 2026-07-18 — Tagline final form: generalized eyebrow, enumerate elsewhere (#164)

**Decision:** Option A — generalize the eyebrow to `SOLID · VSA · per-stack crucible reviews · Claude Code + Cursor` and move dialect enumeration to surfaces that scale: the Overview callout's tier sentence and the live /skills page (decided by the operator, 2026-07-18).

**Options considered:**
1. **Option A — generalized eyebrow, enumerate elsewhere** — cost: the eyebrow stops name-dropping Bulletproof React ← chosen
2. Option B — tiered enumeration in the eyebrow (`SOLID · Frontend: Next.js · Blazor · Backend: FastAPI · Django · ML · Claude Code + Cursor`) — cost: long now, longer with dialect six; drops the dialect names (Bulletproof, VSA) that #158 just added, or becomes two lines; every new crucible reopens the issue.
3. Option C — hybrid, one flagship pairing (`SOLID · VSA · crucible reviews from Bulletproof React to ML · Claude Code + Cursor`) — cost: "from X to Y" reads as marketing; picks favorites among dialects.

**Why:** At five dialects across two tiers (frontend: Next.js, Blazor · backend/Python: FastAPI, Django, ML) enumeration outgrew an eyebrow (#164 body). The Skills page already enumerates every crucible variant live from `skills/` — the truthful, zero-maintenance list — so the header doesn't have to. The #158 `site-tagline` shared-constant hoist is the enabling seam: one edit propagated the new eyebrow to both pages (proven in PR #178).

**Consequences:** The header is dialect-count-invariant — future crucible variants ship with **zero header edits**; enumeration lives only on surfaces that scale (the Overview callout's tier sentence linking /skills, and the live /skills page). Option B remains a one-line swap in `site-tagline.ts` if ever overruled. This entry is a backfill via #180: PR #178 merged before the /adr brief addition on #164 landed (same timing class as the #162/#163 amendments).

**Evidence:** #164 body (options + costs) and its decision comment (operator, 2026-07-18); shipped via PR #178 (`0b4c3b6`); enabling seam: #158 shared-constant hoist.

## 2026-07-18 — Architect cardinality: one architect per product board; one orchestrator per repo (#148)

**Decision:** One architect seat per **product board**, spanning that product's repos and no other product's; exactly one orchestrator per **repo**. The "one architect, all repos" rule shipped by the #132/#133/#135 copy is overruled (decided by the operator in the architect session, 2026-07-18).

**Options considered:**
1. One global architect across all products (the shipped copy) — cost: direction context is deep and product-local, and the architect's own working state (VISION, DECISIONS, specs, the board) is repo/board-local — the same state-locality argument that pins the orchestrator to one repo.
2. **One architect per product board, spanning that product's repos** — cost: a copy fix across the site plus this entry; preserves #132's original "spans multiple repos" intent (a product may span repos) while fixing the overreach ← chosen
3. Per-repo architect — cost: fragments direction within a product, the one thing the seat exists to keep whole.

**Why:** The original rule conflated process coherence across products (Vilya-the-system's job — canon + skills) with direction coherence (product-local). Live evidence: `architect-anduin` runs correctly as a separate product's seat. Partially supersedes `2026-07-18 — Architect flow epic (#132)`: its Fork C deliverables (home cardinality panel + Architect-page aside) shipped the overreaching copy this decision corrects.

**Consequences:** Site copy fix on the #148 branch (Architect aside, home cardinality diagram + lead, Product Architect card ¶1, cardinality sentence appended to both orchestrator role cards); VISION.md v2 (#142) already carries the corrected rule — v2 landed, not v1; this entry rides the fix branch per one-writer.

**Evidence:** #148 issue body (the ADR mirror, issue-first — recorded there by the operator before this append, so no re-mirror comment) and its two authored-copy comments; VISION v2 via PR #149 (`e609489`); overruled copy via PRs #138 (`ebc34f8`) / #139 (`ec4b10f`).

## 2026-07-18 — Architect flow epic (#132): orchestrator route, shared FlowMap, cardinality story, serial dispatch

**Decision:** All three fork recommendations approved as stated, plus a sequencing amendment: rename `/flows` → `/orchestrator` with a permanent redirect (Fork A → 2), generalize `FlowsMap` into a props-driven shared component (Fork B → 2), cardinality statement + diagram on home with the full why on the Architect page's aside (Fork C → 2), and dispatch the sub-issues serially **#134 → #133 → #135** (decided by the operator, 2026-07-18).

**Options considered:**
- **Fork A — orchestrator page URL:** (1) keep `/flows`, relabel nav only — cost: permanent URL/content mismatch; (2) **rename route to `/orchestrator` + permanent `/flows → /orchestrator` redirect — cost: one redirect entry + internal-link fixes ← chosen**; (3) `/flows` as a role index page — cost: an extra page nobody asked for, deeper URLs.
- **Fork B — Architect page map:** (1) duplicate the flows slice into `features/architect/` — cost: two hand-authored SVG geometries to maintain forever; (2) **generalize `FlowsMap` to take nodes/flows/geometry/prompts as props (one shared component, two data modules) — cost: one refactor touching the existing page ← chosen**; (3) static diagram — cost: cheapest, but breaks role-page parity.
- **Fork C — cardinality illustration placement:** (1) home only — cost: Architect page misses the full why; (2) **statement + small diagram on home, full explanation on the Architect page's aside slot — cost: two touch points ← chosen**; (3) Architect page only — cost: home fails to represent the new flow.
- **Sequencing:** the epic proposed "B and C independent of A"; amended to serial **#134 → #133 → #135** — cost: no parallel dispatch for this epic.

**Why:** A2 makes the URL say what the page is while external links keep working; the orchestrator's fact-check corrected the internal-link estimate from three files to **five** (`setup-view.tsx`, `shared/ui/board-strip.tsx`, `overview-view.tsx`, `night-shift-view.tsx`, `night-agent-map.tsx`). B2 rides an existing seam — `flows-map.tsx` already read everything from modules — so one refactor halves future maintenance versus two hand-authored geometries. C2 mirrors the orchestrator page's aside structure (same slot as orchestrator-modes), keeping the two role pages parallel. Serial sequencing: all three sub-issues touch `site-nav.tsx`, and #135's home cards need `/architect` (exists only after #133) and the renamed orchestrator route (settled by #134) — serial dispatch avoids three-way nav rebases.

**Consequences:** Shipped in the decided order as PRs #137 (`f8fc042`), #138 (`ebc34f8`), #139 (`ec4b10f`), all merged 2026-07-18; `/flows` now 308-redirects permanently. `FlowMap`/`PromptList`/`CopyButton` live in `shared/ui` — future role pages reuse them instead of duplicating. Post-merge visual smoke is owed (tracked in a dedicated Verifying issue), and a scan-widening follow-up was filed from #135's smoke (the whitespace-swallowing bug class extends beyond `</code>` to other inline tags).

**Evidence:** #132 body (fork options + costs, as-built survey 2026-07-17) and its decision comment (2026-07-18); epic-complete comment on #132 (PR outcomes, gate results); commits `f8fc042`/`ebc34f8`/`ec4b10f`. Precedent: the one-orchestrator-per-repo rationale behind Fork C rests on the documented cross-edit collision rule (canon `GITHUB-PROJECTS.md` shared-files table) — no dated prior entries existed; this is DECISIONS.md's first entry.
