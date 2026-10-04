import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getSkillRaw, loadSkill } from "./load-skills";

const canonicalPath = path.resolve(process.cwd(), "../../skills/vl-crucible-nextjs/SKILL.md");
const canonPath = path.resolve(process.cwd(), "../../docs/project-tracking/GITHUB-PROJECTS.md");

describe("delivered conditional migration review contract", () => {
  it("delivers the full canonical contract byte-identically through registry raw and parsed entry points", () => {
    const canonical = fs.readFileSync(canonicalPath, "utf8");
    expect(getSkillRaw("vl-crucible-nextjs")).toBe(canonical);
    const skill = loadSkill("vl-crucible-nextjs");
    expect(skill?.body).toContain("## Database/schema migrations — conditional review");
    expect(skill?.frontmatter["codex-invocation"]).toBe("$vl-crucible-nextjs");
    // These delivery assertions supplement semantic review; they do not run a reviewer or database.
    const section = skill!.body.split("## Database/schema migrations — conditional review")[1]
      .split("## Component baseline")[0];
    for (const field of ["Migration tool", "Migration command", "Migration status"]) expect(section).toContain(field);
    for (const boundary of ["Verified no application database", "Database present, unrelated UI/docs diff",
      "Relevant Drizzle change", "Relevant other-framework change",
      "Relevant change with missing, conflicting or pending settings/evidence"]) expect(section).toContain(boundary);
    expect(section).toContain("Missing optional migration fields do not globally block unrelated acceptance");
    expect(section).toContain("journal");
    expect(section).toContain("installed version");
    expect(section).toContain("immutable applied history");
    expect(section).toContain("Do not demand Drizzle artifacts");
    expect(section).toContain("affected gate unresolved and unready");
    expect(section).toContain("**Blockers** on affected acceptance");
    expect(section).toContain("Review neither executes");
    expect(section).toContain("nor grants database/production execution authority");
    const url = "https://github.com/jerrodtuck/vilya/blob/master/docs/project-tracking/GITHUB-PROJECTS.md#database-migrations";
    expect(section).toContain(url);
    expect(fs.readFileSync(canonPath, "utf8")).toMatch(/^### Database migrations\r?$/m);
  });
});
