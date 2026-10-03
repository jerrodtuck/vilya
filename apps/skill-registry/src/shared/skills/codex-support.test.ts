import { describe, expect, it } from "vitest";
import { getCodexSkillSupport, invocationOf } from "./meta";
import { codexSkillInvoke, skillInvoke } from "./skill-affordance";
import { SKILL_INVOKES, SKILL_SLUGS, STANDING_SESSION_SLUGS, AUTONOMOUS_SLUGS } from "./invokes";
import { parseFrontmatter } from "./frontmatter";
import type { Skill } from "./types";

const fixture = (fields: Record<string, unknown> = {}): Skill => ({
  slug: "vl-example", body: "", filePath: "skills/vl-example/SKILL.md",
  frontmatter: { ...parseFrontmatter(`---
codex-support: shared-compatible
codex-notes: Shared behavior.
codex-invocation: $vl-example
codex-prerequisites: Git access.
---`).data, ...fields },
});
describe("Codex source metadata", () => {
  it.each(["shared-compatible", "codex-adapted"])("allows complete %s metadata", (support) => {
    expect(getCodexSkillSupport(fixture({ "codex-support": support }))).toEqual({
      support, label: support === "shared-compatible" ? "Shared-compatible" : "Codex-adapted",
      notes: "Shared behavior.", invocation: "$vl-example", prerequisites: "Git access.", canInvoke: true,
    });
  });
  it.each(["other-host-only", "unsupported-deferred"])("never offers a command for %s", (support) => {
    expect(getCodexSkillSupport(fixture({ "codex-support": support }))).toMatchObject({
      support, notes: "Shared behavior.", prerequisites: "Git access.", invocation: null, canInvoke: false,
    });
  });
  for (const key of ["codex-support", "codex-notes", "codex-invocation", "codex-prerequisites"]) {
    it.each([undefined, "", "   ", true, ["value"], { value: "x" }])("rejects incomplete " + key + "=%j", (value) => {
      expect(getCodexSkillSupport(fixture({ [key]: value }))).toMatchObject({ support: "unclassified", invocation: null, canInvoke: false });
    });
  }
  it.each(["unknown", "toString", "__proto__"])("rejects unknown classification %s", (value) => {
    expect(getCodexSkillSupport(fixture({ "codex-support": value })).support).toBe("unclassified");
  });
  it.each(["/vl-example", "$vl-other", "$vl-example-extra"])("rejects incorrect invocation %s", (value) => {
    expect(getCodexSkillSupport(fixture({ "codex-invocation": value })).canInvoke).toBe(false);
  });
  it("does not infer Codex policy from Claude flags", () => {
    expect(getCodexSkillSupport(fixture({ "disable-model-invocation": true })).canInvoke).toBe(true);
  });
  it("retains fields after an empty block while withholding compatibility", () => {
    const frontmatter = parseFrontmatter("---\ncodex-support: shared-compatible\ncodex-notes: |\ncodex-invocation: $vl-example\ncodex-prerequisites: Board access.\n---").data;
    expect(getCodexSkillSupport({ ...fixture(), frontmatter })).toMatchObject({
      support: "unclassified", prerequisites: "Board access.", canInvoke: false,
    });
  });
  it.each([">", "|"])("consumes block strings %s", (marker) => {
    const frontmatter = parseFrontmatter(`---
codex-support: codex-adapted
codex-notes: ${marker}
  Current desktop tools.
  Preserve role boundaries.
codex-invocation: $vl-example <issue>
codex-prerequisites: ${marker}
  Git access.
  Authorized operator.
---`).data;
    expect(getCodexSkillSupport({ ...fixture(), frontmatter })).toMatchObject({ canInvoke: true, invocation: "$vl-example <issue>" });
  });
  it("registers a standing Codex seat without changing unattended eligibility or slash commands", () => {
    expect(SKILL_INVOKES.orchestratorCodex).toBe("$vl-orch-codex");
    expect(codexSkillInvoke(SKILL_SLUGS.orchestratorCodex)).toBe("$vl-orch-codex");
    expect(skillInvoke("vl-chip")).toBe("/vl-chip");
    expect(SKILL_INVOKES.orchestratorCursor).toBe("/vl-orch-cursor");
    expect(STANDING_SESSION_SLUGS.has(SKILL_SLUGS.orchestratorCodex)).toBe(true);
    expect(AUTONOMOUS_SLUGS.has(SKILL_SLUGS.orchestratorCodex)).toBe(false);
    expect(invocationOf({ ...fixture(), slug: SKILL_SLUGS.orchestratorCodex })).toBe("standing session");
  });
});
