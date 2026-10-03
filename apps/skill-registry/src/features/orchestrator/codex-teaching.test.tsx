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
    for (const term of ["configured defaults", "Explicit operator pins", "Do not invent a latest alias", "full-history forks", "limited or no-history", "Astra planning / Sol implementation", "delegate only the planning stage"]) expect(text).toContain(term);
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
