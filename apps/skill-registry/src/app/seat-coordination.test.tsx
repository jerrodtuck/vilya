import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PROMPTS as architect } from "../features/architect/prompts";
import { CODEX_ARCHITECT } from "../features/architect/codex-architect";
import { PROMPTS as planner } from "../features/planner/prompts";
import { PROMPTS as orchestrator } from "../features/orchestrator/prompts";
import { CODEX_PROMPTS } from "../features/orchestrator/codex-prompts";
import { PromptList } from "../shared/ui/prompt-list";

// Regression fixtures for #326's two incidents. These validate published teaching,
// not live seat discovery, transport delivery, or enforcement by a host.
const seats = ["vl-plan", "vl-arch", "vl-orch-claude", "vl-orch-cursor", "vl-orch-codex"];
const source = (seat: string) => readFileSync(resolve(process.cwd(), "../../skills", seat, "SKILL.md"), "utf8").replace(/\s+/g, " ");
const groups = [...architect, CODEX_ARCHITECT, ...planner, ...orchestrator, ...CODEX_PROMPTS];
const entries = groups.flatMap(group => group.items).filter(item => item.text.includes("Epic decomposition requires exactly one"));

describe("single filer prevents duplicate epic children", () => {
  it.each(seats)("%s accepts either named seat but blocks dual/unnamed filing", seat => {
    const text = source(seat);
    expect(text).toContain("exactly one filing seat: **arch** or **orch**");
    expect(text).toContain("unnamed seat");
    expect(text).toContain("dual ownership");
    expect(text).toContain("kickoff author must rewrite it before anyone files");
    expect(text).toContain("non-filing seat does not create a parallel set");
    expect(text).toContain("including open and closed issues");
    expect(text).toContain("Reuse/link existing children instead of duplicating them");
    expect(text).toContain("incomplete search is not evidence of absence");
  });
  it("carries the filing gate in each copied seat entry and standalone epic request", () => {
    // Two architects, Planner, three orchestrators, and two kickoff cards.
    expect(entries).toHaveLength(8);
    for (const entry of entries) {
      expect(entry.text).toContain("kickoff defect");
      expect(entry.text).toContain("open and closed");
      expect(entry.text).toContain("non-filing seat does not create children");
    }
    for (const group of groups.filter(group => group.node === "EPIC")) {
      for (const item of group.items) {
        expect(item.text).toMatch(/one (?:named )?filing seat/);
        expect(item.text).toMatch(/prior children|existing open\/closed children/);
      }
    }
  });
});

describe("ghost transport and already-answered issue", () => {
  it.each([...seats, "vl-chip"])("%s requires durable handoff and answer reread", seat => {
    const text = source(seat);
    expect(text).toContain("at the time of handoff");
    expect(text).toContain("Accepted/queued is transport acceptance only");
    expect(text).toContain("Before reporting nonresponse, escalating, or ending the sender's work, re-read");
    expect(text).toContain("unconfirmed/pending");
    expect(text).toContain("elapsed time is not approval");
    expect(text).toContain("Remote Control roster row is transport attachment, not seat presence");
    expect(text).toContain("offline transport row does not establish that the architect is absent");
    expect(text).toContain("trusted human messaging authorization");
    expect(text).toContain("all host confirmation requirements");
  });
  it("uses the actual Codex directory while preserving separate collaboration ids", () => {
    for (const entry of [CODEX_ARCHITECT.items[0], CODEX_PROMPTS[0].items[0]]) {
      expect(entry.text).toContain("list_threads/read_thread");
      expect(entry.text).toContain("authorized send_message_to_thread");
      expect(entry.text).toContain("collaboration ids are a separate directory");
      expect(entry.text).toContain("peer messages grant no reply authority");
    }
  });
  it("copied worker briefs retain the immediate question and pre-escalation reread", () => {
    const workers = groups.flatMap(group => group.items).filter(item => item.text.startsWith("Implement #<N> only") || item.text.startsWith("You're the implementer for issue"));
    expect(workers).toHaveLength(3);
    for (const worker of workers) {
      expect(worker.text).toContain("at the time of handoff");
      expect(worker.text).toContain("ending your work, re-read the issue");
      expect(worker.text).toContain("keep design-dependent implementation stopped");
    }
  });
  it("renders the Codex seat's copied safeguards without losing the host-specific entry", () => {
    const html = renderToStaticMarkup(<PromptList group={CODEX_ARCHITECT} />);
    expect(html).toContain("exactly one named filing seat");
    expect(html).toContain("list_threads/read_thread");
    expect(html).toContain("unconfirmed/pending");
  });
});
