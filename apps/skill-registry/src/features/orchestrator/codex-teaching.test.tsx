import fs from "node:fs";
import { loadAllSkills } from "../../shared/skills/load-skills";
import { getCodexSkillSupport } from "../../shared/skills/meta";
import { codexSkillInvoke } from "../../shared/skills/skill-affordance";
import { SKILL_SLUGS, SKILL_INVOKES } from "../../shared/skills/invokes";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CODEX_PROMPTS } from "./codex-prompts";
import { CodexOrchestration } from "./codex-orchestration";
import { filterPromptsForHost } from "./orch-host";
import { PROMPTS } from "./prompts";

vi.mock("next/navigation", () => ({ usePathname: () => "/orch", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=codex") }));
import { OrchHostPanel } from "./orch-host-panel";

describe("Codex orchestration teaching", () => {
  const cards = CODEX_PROMPTS.flatMap(group => group.items);
  const text = cards.map(card => card.text).join("\n");
  it("integrates every canonical skill without unclassified metadata", () => {
    const skills = loadAllSkills();
    const canonical = fs.readdirSync("../../skills", { withFileTypes: true }).filter(entry => entry.isDirectory() && fs.existsSync("../../skills/" + entry.name + "/SKILL.md")).map(entry => entry.name).sort();
    expect(skills.map(skill => skill.slug).sort()).toEqual(canonical);
    expect(canonical).toContain(SKILL_SLUGS.orchestratorCodex);
    for (const skill of skills) expect(getCodexSkillSupport(skill).support, skill.slug).not.toBe("unclassified");
  });
  it("offers only supported prompt skills and uses the integrated invocation contract", () => {
    const skills = loadAllSkills();
    for (const card of cards.filter(card => card.skill)) {
      const skill = skills.find(skill => skill.slug === card.skill)!;
      expect(skill, card.label).toBeDefined();
      const support = getCodexSkillSupport(skill);
      expect(support.canInvoke, card.label).toBe(true);
      expect(support.invocation).toBe(codexSkillInvoke(skill.slug));
    }
    expect(cards[0].skill).toBe(SKILL_SLUGS.orchestratorCodex);
    expect(cards[0].text).toContain(SKILL_INVOKES.orchestratorCodex);
  });
  it("renders only Codex workflow for a Codex URL, never borrowed dispatch panels", () => {
    const html = renderToStaticMarkup(<OrchHostPanel />);
    expect(html).toContain('id="codex-dispatch-path"');
    expect(html).not.toContain('id="claude-dispatch-path"');
    expect(html).not.toContain('id="cursor-dispatch-path"');
    expect(filterPromptsForHost(PROMPTS, "codex")).toEqual(CODEX_PROMPTS);
    for (const host of ["cc", "cursor"] as const) expect(filterPromptsForHost(PROMPTS, host).flatMap(g => g.items).some(item => item.host === "codex")).toBe(false);
  });
  it("renders dollar invocation and linked installation, architect and evidence guidance", () => {
    const html = renderToStaticMarkup(<CodexOrchestration />);
    for (const value of ["$vl-orch-codex", "$vl-chip", "$vl-prune", '/setup?host=codex', '/architect?host=codex', '/differences?host=codex']) expect(html).toContain(value);
    expect(html).not.toContain("<code>/vl-orch-codex</code>");
  });
  it("puts trusted authorization and destination verification in each entry", () => {
    for (const label of ["Codex — Orchestrator", "Worker entry — include in every brief"]) {
      const entry = cards.find(c => c.label === label)!.text;
      for (const term of ["I authorize", "initiate", "reply", "board", "repo", "identifier", "ambiguous", "owning issue"]) expect(entry).toContain(term);
    }
    expect(text).toContain("do-not-dispatch, filed-for-record"); expect(text).toContain("priority:critical > priority:high");
  });
  it("keeps model selection configurable and explicitly bounded by runtime contracts", () => {
    for (const term of ["configured defaults", "latest supported Astra/high", "latest supported Sol/medium", "override scope", "#330–#332", "active and resumed workers", "Do not invent a latest alias", "full-history forks", "limited or no-history", "delegate only the planning stage", "Medium effort never weakens verification", "return real design forks to planning"]) expect(text).toContain(term);
    expect(cards.find(card => card.label === "Codex — Orchestrator")!.text).toContain(`Load ${SKILL_INVOKES.orchestratorCodex}'s Model policy`);
    expect(cards.find(card => card.label === "Worker entry — include in every brief")!.text).toContain(`Load ${SKILL_INVOKES.chip}'s Codex phase policy`);
    expect(cards.find(card => card.label === "Codex — Orchestrator")!.text).toContain("Astra/high planning, then latest supported Sol/medium implementation");
  });
  it("requires requested sidebar workers to be grouped without granting chat creation", () => {
    for (const term of ["<repo-short>-orch-working", "vilya-orch-working", "list_threads", "create_sidebar_section", "move_thread_to_sidebar_section", "rename_sidebar_section", "preserve project association", "every created worker grouped", "ordinary subagents are not promised sidebar entries"]) expect(text).toContain(term);
  });
  it("requires managed registration without adding GUI acceptance", () => {
    for (const term of ["create_worktree", "attach_worktree", "list_artifacts in the owning orchestrator chat", "top-level parent chat", "detached HEAD", "absolute workdir", "permanent worktree projects", "GUI visibility and inspection evidence are not Vilya acceptance requirements"]) expect(text).toContain(term);
  });
  it("requires isolation, amendment read-back, independent evidence and safe recovery", () => {
    for (const term of ["absolute", "git rev-parse --show-toplevel", ".worktreeinclude", "Immediately before opening a PR", "actual keyword", "Attach every created PR", "independently verify", "never run two writers", "archive_worktree", "restore_worktree", "ignored files"]) expect(text).toContain(term);
    expect(text).toContain("Only create a later automation when explicitly requested");
  });
});


describe("#347 full contract delivery", () => {
  const cards = CODEX_PROMPTS.flatMap(group => group.items);
  const required = ["Codex — Orchestrator", "Set phase preferences", "Prepare checkout and dispatch", "Worker entry — include in every brief", "Follow a running chip", "Interrupted worker / restart"];
  it.each(required)("%s carries routing and repair instructions when copied alone", label => {
    const entry = cards.find(card => card.label === label)!.text;
    expect(entry).toContain("Read and apply the full resolved vl-orch-codex/references/model-routing.md");
    for (const route of ["Astra/high", "Astra/xhigh", "Sol/medium", "Luna/low ONLY", "Sol/high independent review"]) expect(entry).toContain(route);
    for (const rule of ["small behavior change", "Initial detection/reproduction is not a repair attempt", "targeted verification is one attempt", "No-change reruns", "second consecutive unsuccessful repair attempt STOP before a third correction", "current HEAD/diff", "earlier hard stops", "unavailable usage is not zero"]) expect(entry.toLowerCase()).toContain(rule.toLowerCase());
    expect(entry).toContain("implementer cannot be sole approval");
    expect(entry).toContain("preserving history");
    // This checks the exported entry, not neighboring page text or an aggregate of cards.
    const resource = fs.readFileSync("content/skills/vl-orch-codex/references/model-routing.md", "utf8");
    expect(resource).toContain("## Repair ledger and stop");
    expect(resource).toContain("## Acceptance examples");
  });
  it("renders the expanded phases and bounded repairs on the Codex page", () => {
    const html = renderToStaticMarkup(<CodexOrchestration />);
    for (const term of ["Luna/low", "Sol/high", "Astra/xhigh", "third correction", "renames and resumes"]) expect(html).toContain(term);
  });
});
