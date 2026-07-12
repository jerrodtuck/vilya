import { describe, expect, it } from "vitest";
import { emptyConfig } from "./github-projects-config";
import { normalizeValue, parseConfig } from "./github-projects-parse";

const SAMPLE = `# GitHub Projects — tracking model (template)

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | \`acme\` | your GitHub account/org |
| Repo | \`acme/widgets\` | the repo issues live in |
| Project number | \`3\` | \`gh project list\` |
| Project id | \`PVT_abc\` | \`gh project view\` |
| Status field id | \`PVTSSF_xyz\` | see Field ids |
| **Stack** | \`blazor\` | the repo's framework |
| **Crucible variant** | \`crucible-blazor\` | the review skill |
| **Test command** | \`dotnet test\` (in \`src/\`) | what finish runs |
| **Manual smoke** | \`dotnet run\` → http://localhost:5000 | launch for smoke |
| Default branch | \`master\` | \`git remote show origin\` |

### Models (optional — change over time)

| Key | Value | Notes |
|-----|-------|-------|
| **Planning model** | \`opus\` | plan phase |
| **Execution model** | \`sonnet\` | execute phase |

Status option ids (fill after first setup):

\`\`\`text
Todo:         aaa
In Progress:  bbb
Blocked:      ccc
Verifying:    ddd
Done:         eee
\`\`\`

Native single-select fields on this board (beyond Status; labels remain what the
skills read):

\`\`\`text
Type  (PVTSSF_type): Feature bca65912 · Bug 066550da
Priority (PVTSSF_pri): High 5aa1bc85 · Low 7522a137
\`\`\`

### Area labels — define per repo

Areas name *this* product's vertical slices. This repo's areas:

\`area:api\` · \`area:ui\` · \`area:docs\`

## Model (same everywhere)

- Shared process.
`;

describe("normalizeValue", () => {
  it("unwraps a single outer code span", () => {
    expect(normalizeValue("`jerrodtuck`")).toBe("jerrodtuck");
  });

  it("keeps trailing notes and inner backticks", () => {
    expect(normalizeValue("`dotnet test` (in `src/`)")).toBe(
      "`dotnet test` (in `src/`)"
    );
  });

  it("unwraps italic placeholders", () => {
    expect(normalizeValue("*(operator choice)*")).toBe("(operator choice)");
  });
});

describe("parseConfig", () => {
  it("returns empty config for blank paste", () => {
    expect(parseConfig("")).toEqual(emptyConfig());
    expect(parseConfig("   \n")).toEqual(emptyConfig());
  });

  it("extracts repo config, models, status ids, native fields, and areas", () => {
    const cfg = parseConfig(SAMPLE);
    expect(cfg.owner).toBe("acme");
    expect(cfg.repo).toBe("acme/widgets");
    expect(cfg.projectNumber).toBe("3");
    expect(cfg.projectId).toBe("PVT_abc");
    expect(cfg.statusFieldId).toBe("PVTSSF_xyz");
    expect(cfg.stack).toBe("blazor");
    expect(cfg.crucibleVariant).toBe("crucible-blazor");
    expect(cfg.testCommand).toBe("`dotnet test` (in `src/`)");
    expect(cfg.manualSmoke).toBe("`dotnet run` → http://localhost:5000");
    expect(cfg.defaultBranch).toBe("master");
    expect(cfg.planningModel).toBe("opus");
    expect(cfg.executionModel).toBe("sonnet");
    expect(cfg.statusOptions).toEqual({
      todo: "aaa",
      inProgress: "bbb",
      blocked: "ccc",
      verifying: "ddd",
      done: "eee",
    });
    expect(cfg.typeFieldLine).toContain("Type  (PVTSSF_type)");
    expect(cfg.priorityFieldLine).toContain("Priority (PVTSSF_pri)");
    expect(cfg.areaLabels).toEqual(["area:api", "area:ui", "area:docs"]);
  });

  it("tolerates missing optional sections", () => {
    const cfg = parseConfig(`## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | \`solo\` | org |
| Repo | \`solo/app\` | repo |
`);
    expect(cfg.owner).toBe("solo");
    expect(cfg.repo).toBe("solo/app");
    expect(cfg.stack).toBe("");
    expect(cfg.areaLabels).toEqual([]);
    expect(cfg.statusOptions.todo).toBe("");
  });
});
