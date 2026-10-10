import { expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { SetupView } from "./setup-view";
import { getSkillSlugs, loadSkill } from "../../shared/skills/load-skills";
import { categorize, getCodexSkillSupport, stackOf } from "../../shared/skills/meta";
import { codexSkillInvoke, skillInvoke } from "../../shared/skills/skill-affordance";

it("discovers the general Python bundle with valid host invocation and retains specialized variants", () => {
  const variants = ["vl-crucible-python", "vl-crucible-fastapi", "vl-crucible-django", "vl-crucible-ml"];
  for (const slug of variants) expect(getSkillSlugs()).toContain(slug);
  const skill = loadSkill("vl-crucible-python")!;
  expect(skill.frontmatter.name).toBe(skill.slug);
  expect(categorize(skill.slug)).toBe("review");
  expect(stackOf(skill.slug)).toBe("General Python");
  expect(getCodexSkillSupport(skill)).toMatchObject({ support: "shared-compatible", canInvoke: true, invocation: "$vl-crucible-python" });
  expect(skillInvoke(skill.slug)).toBe("/vl-crucible-python");
  expect(codexSkillInvoke(skill.slug)).toBe("$vl-crucible-python");
  expect(fs.readFileSync(path.resolve("content/skills", skill.slug, "SKILL.md"))).toEqual(
    fs.readFileSync(path.resolve("../../skills", skill.slug, "SKILL.md")));
});

it("renders general and specialized Python choices with one variant per repository", () => {
  const html = renderToStaticMarkup(<SetupView />);
  expect(html).toContain("General Python packages, CLI tools, automation and jobs");
  for (const slug of ["python", "fastapi", "django", "ml"]) expect(html).toContain("<code>vl-crucible-" + slug + "</code>");
  expect(html).toContain("Select one variant per repo.");
  expect(html).toContain("actual test command");
});
