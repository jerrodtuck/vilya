import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/setup", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import { PROMPTS as ARCH } from "../architect/prompts";
import { CODEX_ARCHITECT } from "../architect/codex-architect";
import { PROMPTS as PLAN } from "../planner/prompts";
import { PROMPTS as ORCH } from "../orchestrator/prompts";
import { CODEX_PROMPTS } from "../orchestrator/codex-prompts";
import { ASK_VILYA } from "./ask-vilya";
import { CommunicationGuide, FLOW_SOURCE, FLOW_TEXT, WORKER_BRIEF } from "./communication-guide";
import { OverviewView } from "./overview-view";
import { SetupView } from "../setup/setup-view";

const inventory = [
  ["architect", ARCH], ["Codex architect", [CODEX_ARCHITECT]],
  ["planner", PLAN], ["other-host orch and workers", ORCH],
  ["Codex orch and worker", CODEX_PROMPTS], ["fixed Ask", [ASK_VILYA]],
] as const;
describe("shared communication adoption on actual exported entries", () => {
  it.each(inventory)("accounts for every %s card with both full sources", (_name, groups) => {
    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) for (const card of group.items) {
      expect(card.text, card.label).toContain("vl-adhd");
      expect(card.text, card.label).toContain("vl-present");
      expect(card.text, card.label).toMatch(/read.and.apply|read\/apply/i);
      if (!card.text.startsWith("#!/") && !card.text.startsWith("# Agent:")) {
        expect(card.text).toContain("full");
        expect(card.text).toContain("fixed output contracts");
        if (card.host === "codex") { expect(card.text).toContain("$vl-adhd"); expect(card.text).toContain("$vl-present"); }
        else { expect(card.text).toContain("Identify the actual host"); expect(card.text).toContain("/vl-present"); }
      }
    }
  });
  it("keeps Ask's exact output and independent worker ownership/stops", () => {
    const ask = ASK_VILYA.items[0].text;
    expect(ask).toContain("Answer in exactly this format: lane · the exact next prompt or command to paste · one line of why, with a canon citation");
    expect(ask).toContain("no visual, heading or extra line");
    const codexWorker = CODEX_PROMPTS.flatMap(g => g.items).find(card => card.label.startsWith("Worker entry"))!.text;
    for (const phrase of ["absolute assigned worktree", "original starting commit", "Closes", "preserve this worker's exact", "before a third", "parent comments", "peer messages alone"]) expect(codexWorker).toContain(phrase);
    const cursorWorker = ORCH.flatMap(g => g.items).find(card => card.label.includes("worker kickoff A"))!;
    expect(cursorWorker.text).toContain("vl-present"); expect(cursorWorker.text).toContain("worktree");
  });
});
describe("rendered teaching preserves facts and precise evidence limits", () => {
  it("renders actual overview tagline, source-linked guide and initial scenario", () => {
    const html = renderToStaticMarkup(<OverviewView />);
    expect(html).toContain("SOLID · VSA · per-stack crucible reviews · Claude Code + Cursor + Codex");
    for (const text of ["/skills/vl-adhd", "/skills/vl-present", "Issue #742", "PR number is not supplied", "No merge authorization", "400 jobs/hour", "200 jobs/hour", "name the exact limit", "Complete worker brief"]) expect(html).toContain(text);
    expect(html).not.toContain("PR #742");
    expect(html).toContain('id="communication-workers"'); expect(html).toContain('<option value="2" selected="">2</option>');
    expect(html).toContain("Capacity: 400 jobs/hour. Load ratio: 100 percent. Backlog growth: 0 jobs/hour.");
    expect(html.toLowerCase()).toContain("source inspection does not prove");
  });
  it("retains editable source topology and a complete evidence-preserving brief", () => {
    expect(FLOW_SOURCE.match(/-->/g)).toHaveLength(4);
    expect(FLOW_SOURCE).toContain('api["Task API"]');
    expect(FLOW_SOURCE).not.toMatch(/api.*-->.*store/);
    expect(FLOW_TEXT).toContain("No ordering, retry, security or exactly-once guarantee");
    for (const fact of ["Goal:", "Owner:", "Scope/ownership:", "Dependencies:", "Exclusions:", "Decision:", "Model:", "Verification:", "Stops:", "Repairs:", "Close-out:", "second consecutive unsuccessful", "2–3 options with costs", "PR number is not supplied", "Source tests do not prove runtime acceptance"]) expect(WORKER_BRIEF).toContain(fact);
    const html = renderToStaticMarkup(<CommunicationGuide />);
    expect(html).toContain('role="img"'); expect(html).toContain("task-flow-desc");
    expect(html).toContain("Explain the flow in text only"); expect(html).toContain("Will teammates use this in chat, or need a portable file?");
  });
  it.each(["codex", "cc", "cursor"])("renders whole-folder update and separate adoption guidance for %s", host => {
    current.host = host;
    const html = renderToStaticMarkup(<SetupView />);
    for (const fact of ["New folders require rerunning", "complete folder", "resolved vl-adhd and vl-present", "manifest-only", "session adoption"]) expect(html).toContain(fact);
    if (host === "codex") {expect(html).toContain("-IncludeCodex");expect(html).toContain("$vl-present");}
  });
});
