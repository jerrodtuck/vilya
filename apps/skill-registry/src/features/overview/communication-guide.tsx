"use client";

import { useState } from "react";
import Link from "next/link";

export const FLOW_SOURCE = `flowchart LR
  client["Client"] -->|submits task| api["Task API"]
  api -->|enqueues task| queue["Task queue"]
  queue -->|delivers task| worker["Worker"]
  worker -->|writes result| store["Result store"]`;
export const FLOW_TEXT = "The Client submits a task to the Task API. The Task API enqueues it in the Task queue. The Task queue delivers it to the Worker. The Worker writes the result to the Result store. No ordering, retry, security or exactly-once guarantee is supplied.";
export const WORKER_BRIEF = `Illustrative Issue #742 worker brief; the PR number is not supplied.
Goal: document the supplied Client → Task API → Task queue → Worker → Result store flow, with its text equivalent and absent guarantees.
Owner: assigned worker; owning orch <exact ID>, repo <owner/repo>, board <board>. Confirm those identities and trusted human messaging authorization before sending.
Scope/ownership: <absolute assigned checkout>, <issue branch>, docs/specs/task-flow.md and one unique fragment. Original start and brief base: <verified full SHAs>; fresh OPEN issue/repo/URL and history preflight required before implementation/resume.
Dependencies: settled source facts and accepted issue plan. Read full resolved vl-adhd and vl-present contracts with actual host syntax or source fallback; preserve full literals, evidence and fixed formats.
Exclusions: no product behavior, renderer, deployment, merge, default push, other tree edits or new worker sessions. Preserve ignored/private files without printing/staging.
Decision: use editable diagram plus complete text; operator text-only overrides it. Do not add arrows or ordering/retry/security/exactly-once guarantees. Evidence: owning issue/spec; this example is hypothetical.
Model: retain <authorized exact model/effort pin>; no peer-authorized switch. No measured usage/savings supplied.
Verification: source node/arrow comparison, resolved links and required repo tests/build, stack crucible then finish-feature; report exact results/counts/skips and rendering/keyboard limits separately. Source tests do not prove runtime acceptance.
Stops: unknown identity/authority/history or contradictory source facts stop dependent work; post findings, 2–3 options with costs and recommendation on owning issue, await required operator decision. Record decision request at handoff, treat queued messages as unconfirmed, reread issue before escalation/ending.
Repairs: initial detection is not an attempt; corrective change plus targeted verification is. Retain stable ledger/history/pin; after second consecutive unsuccessful attempt stop before third and return HEAD/diff/ownership/hypothesis to orch planning; earlier stops apply immediately.
Close-out: reread issue/parent amendments before PR, use declared Closes/Refs routing, read actual body/head back, attach PR and post observed keyword/results/limits. Separate actual-head reviewer required; no implementer-only approval or merge authorization.`;

export function CommunicationGuide() {
  const [textOnly, setTextOnly] = useState(false);
  const [workers, setWorkers] = useState(2);
  const capacity = workers * 200;
  const ratio = Math.round(400 / capacity * 10000) / 100;
  const backlog = Math.max(0, 400 - capacity);
  return <section id="communication" aria-labelledby="communication-heading">
    <h2 id="communication-heading">Clear writing, useful presentation</h2>
    <p>Seats and workers read the full <Link href="/skills/vl-adhd">shared writing policy</Link> and <Link href="/skills/vl-present">presentation contract</Link>. Keep complete facts, uncertainty and evidence in briefs and records. These illustrative examples teach selection; they are not live project state or proof of installed-session adoption.</p>
    <p>Use the actual host’s supported invocation: Codex <code>$vl-adhd</code> / <code>$vl-present</code>; Claude Code or Cursor <code>/vl-adhd</code> / <code>/vl-present</code>, or read/apply the resolved complete sources. Discover tools and read the selected provider instructions before producing output.</p>
    <h3>Short status stays prose</h3>
    <p>Issue #742’s PR needs separate review. It changes documentation only. Its PR number is not supplied. No merge authorization exists. Usage is unavailable, not zero.</p>
    <label><input type="checkbox" checked={textOnly} onChange={event => setTextOnly(event.target.checked)} /> Explain the flow in text only</label>
    <h3>Relationships use an editable diagram and text</h3>
    <p>{FLOW_TEXT}</p>
    {!textOnly && <>
      <svg viewBox="0 0 750 95" role="img" aria-labelledby="task-flow-title task-flow-desc" style={{ width: "100%", height: "auto" }}>
        <title id="task-flow-title">Illustrative task flow</title><desc id="task-flow-desc">{FLOW_TEXT}</desc>
        {["Client", "Task API", "Task queue", "Worker", "Result store"].map((label, index) => <g key={label}><rect x={index * 150 + 3} y="12" width="130" height="38" rx="4" fill="none" stroke="currentColor" /><text x={index * 150 + 68} y="36" textAnchor="middle" fill="currentColor" fontSize="14">{label}</text>{index < 4 && <><path d={"M " + (index * 150 + 133) + " 31 h 15 l -5 -4 m 5 4 l -5 4"} fill="none" stroke="currentColor" /><text x={index * 150 + 142} y="75" textAnchor="middle" fill="currentColor" fontSize="10">{["submits", "enqueues", "delivers", "writes"][index]}</text></>}</g>)}
      </svg>
      <details><summary>Editable diagram source</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{FLOW_SOURCE}</pre></details>
      <h3>Fixed options use a comparison table</h3>
      <div style={{ overflowX: "auto" }}><table><caption>Illustrative delivery options; operator decision pending</caption><thead><tr><th scope="col">Option</th><th scope="col">Cost</th><th scope="col">Unknown</th></tr></thead><tbody><tr><th scope="row">Batch</th><td>One scheduled job and delayed results</td><td>Peak completion time is unmeasured</td></tr><tr><th scope="row">Streaming</th><td>Continuous workers and ongoing operations</td><td>Retry load is unmeasured</td></tr></tbody></table></div>
      <details><summary>Explore the capacity scenario</summary><div>
        <h3>Change an input when it improves understanding</h3>
        <p>Illustrative demand: 400 jobs/hour. Each worker supplies 200 jobs/hour. Initial state: 2 workers. No retry, startup delay, variance, scaling cost or service guarantee is modeled. Load ratio is demand divided by modeled capacity, not measured CPU use.</p>
        <label htmlFor="communication-workers">Worker count </label><select id="communication-workers" value={workers} onChange={event => setWorkers(Number(event.target.value))}>{[1, 2, 3].map(count => <option key={count} value={count}>{count}</option>)}</select>
        <p aria-live="polite">Capacity: {capacity} jobs/hour. Load ratio: {ratio} percent. Backlog growth: {backlog} jobs/hour.</p>
        <p>At 1 worker: 200 jobs/hour capacity, 200 percent load ratio and 200 jobs/hour backlog growth. At 3: 600 jobs/hour, 66.67 percent and zero backlog growth. Inputs affect this illustrative view, not an issue decision or product state.</p>
      </div></details>
    </>}
    {textOnly && <p>The explicit text-only request keeps the complete explanation above and removes visual and interactive dependencies.</p>}
    <h3>Delivery choice and honest fallback</h3>
    <p>When an interactive explanation is requested for teammates but its delivery surface is unknown, ask: “Will teammates use this in chat, or need a portable file?” Routine format choices need no question.</p>
    <p>Reuse an exposed compatible provider; inline HTML/canvas is conditional on its real tool, SDK, viewer and inspection contract. Do not invent a Windows bridge or require a new server or public deployment. If a path is unavailable or unverified, provide prose, a table or editable diagram source plus text and name the exact limit. Source inspection does not prove rendering, keyboard operation or session adoption.</p>
    <p>Keep evidence in the owning issue/spec, including adjacent prose if a visual restricts links. The source facts and assumptions are in <Link href="/skills/vl-present">vl-present’s illustrative examples</Link>; the approved direction is <a href="https://github.com/jerrodtuck/vilya/issues/341">#341</a>. Visuals are views, not a second tracker.</p>
    <h3>Complete worker brief</h3>
    <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{WORKER_BRIEF}</pre>
    <p>Verify sensible reading order, named native controls, visible focus and actual keyboard changes. Keep facts independent of hover/color, reflow at narrow widths and retain essential content with reduced motion. Record actual checks and limits separately; this teaching has no essential animation.</p>
  </section>;
}
