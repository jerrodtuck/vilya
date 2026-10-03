import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Skill } from "../../shared/skills/types";
import { getCodexSkillSupport } from "../../shared/skills/meta";
vi.mock("@/shared/skills/invokes", () => import("../../shared/skills/invokes"));
vi.mock("@/shared/skills/meta", () => import("../../shared/skills/meta"));
vi.mock("@/shared/skills/skill-affordance", () => import("../../shared/skills/skill-affordance"));
const state = vi.hoisted(() => ({ skill: null as Skill | null, raw: "" }));
vi.mock("../../features/skill-detail/skill-detail", () => ({ getSkillDetail: () => ({ skill: state.skill, history: [
  { hash: "abc123", shortHash: "abc123", date: "2026-10-03", author: "Author", subject: "Keep history" },
  { hash: "def456", shortHash: "def456", date: "2026-10-02", author: "Author", subject: "Previous" },
] }) }));
vi.mock("../../features/registry/registry", () => ({ getGroupedSkills: () => ({ process: [state.skill], review: [], recall: [], autonomous: [] }) }));
vi.mock("@/shared/skills/load-skills", () => ({ getSkillRaw: () => state.raw }));
import { SkillView } from "../../features/skill-detail/skill-view";
import { RegistryList } from "../../features/registry/registry-list";
import { SkillsReference } from "../../features/registry/skills-reference";
import { GET } from "./[slug]/SKILL.md/route";

describe("Codex registry and skill detail", () => {
  it.each(["shared-compatible", "codex-adapted", "other-host-only", "unsupported-deferred", undefined])("renders source applicability %s with safe affordances", (support) => {
    state.skill = { slug: "vl-example", body: "Original body", filePath: "skills/vl-example/SKILL.md", frontmatter: {
      "codex-support": support as Skill["frontmatter"]["codex-support"], "codex-notes": "Measured host behavior.",
      "codex-prerequisites": "Board access required.", "codex-invocation": "$vl-example",
    } };
    const normalized = getCodexSkillSupport(state.skill);
    const detail = renderToStaticMarkup(<SkillView slug="vl-example" />);
    const registry = renderToStaticMarkup(<RegistryList />);
    expect(detail).toContain(normalized.label); expect(registry).toContain(normalized.label);
    expect(detail).toContain("Measured host behavior."); expect(detail).toContain("Board access required.");
    expect(detail.includes("<code>$vl-example</code>")).toBe(normalized.canInvoke);
    expect(detail).toContain("~/.agents/skills"); expect(detail).toContain("-IncludeCodex");
    expect(detail).toContain("/vl-example"); expect(detail).toContain("~/.claude/skills");
    expect(detail).toContain("/skills/vl-example/SKILL.md"); expect(detail).toContain("/diff/def456/abc123");
    expect(detail).toContain("Original body"); expect(detail).toContain("Keep history");
  });
  it("does not advertise the Codex-only seat as a Claude/Cursor command", () => {
    state.skill = { slug: "vl-orch-codex", body: "", filePath: "skills/vl-orch-codex/SKILL.md", frontmatter: {
      "codex-support": "codex-adapted", "codex-notes": "Native desktop seat.",
      "codex-prerequisites": "Board access.", "codex-invocation": "$vl-orch-codex",
    } };
    const html = renderToStaticMarkup(<SkillView slug="vl-orch-codex" />);
    expect(html).not.toContain("<code>/vl-orch-codex</code>");
    expect(html).toContain("<code>$vl-orch-codex</code>");
  });
  it("teaches additive roots and distinguishes metadata from host policy", () => {
    const html = renderToStaticMarkup(<SkillsReference />);
    for (const text of ["~/.claude/skills", "~/.agents/skills", "--include-codex", "--include-cursor", "not host-enforced policy", "agents/openai.yaml"]) expect(html).toContain(text);
    expect(html).not.toContain("Why Crucible");
  });
  it("returns raw skill content verbatim", async () => {
    state.raw = "---\r\ncodex-support: codex-adapted\r\n---\r\nRaw body\r\n";
    const response = await GET(new Request("http://localhost/skills/vl-example/SKILL.md"), { params: Promise.resolve({ slug: "vl-example" }) });
    expect(await response.text()).toBe(state.raw);
    expect(response.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
  });
});
