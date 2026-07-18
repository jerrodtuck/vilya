import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
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

const SLIM_SAMPLE = `# GitHub Projects — repo config

> **Config only.** Process — the daytime/chip chains, labels model, PR + merge
> conventions, night-shift — is canonical in Vilya:
> \`docs/project-tracking/GITHUB-PROJECTS.md\` in the \`jerrodtuck/vilya\` repo,
> described at https://vilya.jerrodtuck.com/setup. Skills read **config** from this
> file and process from their own \`SKILL.md\`. Do not add process prose here — it
> goes stale.

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | \`acme\` | your GitHub account/org |
| Repo | \`acme/widgets\` | the repo issues live in |
| Project number | \`3\` | \`gh project list\` |
| Project id | \`PVT_abc\` | \`gh project view\` |
| Status field id | \`PVTSSF_xyz\` | see Field ids |
| **Stack** | \`nextjs\` | the repo's framework |
| **Crucible variant** | \`crucible-nextjs\` | the review skill |
| **Test command** | \`npm test\` | what finish runs |
| **Manual smoke** | \`npm run dev\` → http://localhost:3000 | launch for smoke |
| Default branch | \`main\` | \`git remote show origin\` |

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

Get the Status field id + option ids in one shot:

\`\`\`bash
gh project field-list <n> --owner <owner> --format json \\
  --jq '.fields[] | select(.name=="Status") | {id, options: [.options[] | {name, id}]}'
\`\`\`

### Area labels — define per repo

Areas name *this* product's vertical slices. This repo's areas:

\`area:api\` · \`area:ui\`

### Night-shift (per-repo)

Only if this repo runs the overnight loop: \`.github/workflows/night-shift.yml\` lives
in this repo, a self-hosted runner is registered on this repo, and the repo secret
\`CLAUDE_CODE_OAUTH_TOKEN\` (\`claude setup-token\`) is set. Eligibility labels,
guardrails, and the loop itself are process — see the canon above.
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

  it("extracts repo config, status ids, native fields, and areas", () => {
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

  it("extracts full config from the slim config-only format", () => {
    const cfg = parseConfig(SLIM_SAMPLE);
    expect(cfg.owner).toBe("acme");
    expect(cfg.repo).toBe("acme/widgets");
    expect(cfg.projectNumber).toBe("3");
    expect(cfg.projectId).toBe("PVT_abc");
    expect(cfg.statusFieldId).toBe("PVTSSF_xyz");
    expect(cfg.stack).toBe("nextjs");
    expect(cfg.crucibleVariant).toBe("crucible-nextjs");
    expect(cfg.testCommand).toBe("npm test");
    expect(cfg.manualSmoke).toBe("`npm run dev` → http://localhost:3000");
    expect(cfg.defaultBranch).toBe("main");
    expect(cfg.statusOptions).toEqual({
      todo: "aaa",
      inProgress: "bbb",
      blocked: "ccc",
      verifying: "ddd",
      done: "eee",
    });
    expect(cfg.typeFieldLine).toContain("Type  (PVTSSF_type)");
    expect(cfg.priorityFieldLine).toContain("Priority (PVTSSF_pri)");
    // The night-shift note after Area labels must not leak into the labels.
    expect(cfg.areaLabels).toEqual(["area:api", "area:ui"]);
  });

  it("ignores a legacy Models section in paste", () => {
    const withLegacy = `${SAMPLE}

### Models (optional — change over time)

| Key | Value | Notes |
|-----|-------|-------|
| **Planning model** | \`opus\` | plan phase |
| **Execution model** | \`sonnet\` | execute phase |
`;
    const cfg = parseConfig(withLegacy);
    expect(cfg.owner).toBe("acme");
    expect(cfg.defaultBranch).toBe("master");
    expect(cfg).not.toHaveProperty("planningModel");
    expect(cfg).not.toHaveProperty("executionModel");
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

  it("extracts Anduin-style prose + Status helper + Labels table", () => {
    const anduin = fs.readFileSync(
      path.join(__dirname, "anduin-paste.fixture.md"),
      "utf8"
    );
    const cfg = parseConfig(anduin);
    expect(cfg.owner).toBe("jerrodtuck");
    expect(cfg.repo).toBe("jerrodtuck/anduin");
    expect(cfg.projectNumber).toBe("4");
    expect(cfg.projectId).toBe("PVT_kwHOAYNJN84BdC4c");
    expect(cfg.statusFieldId).toBe("PVTSSF_lAHOAYNJN84BdC4czhXnTSM");
    expect(cfg.manualSmoke).toContain("dotnet run --project src/Anduin.App");
    expect(cfg.statusOptions).toEqual({
      todo: "f75ad846",
      inProgress: "47fc9ee4",
      blocked: "7e864448",
      verifying: "0fd3026c",
      done: "98236657",
    });
    expect(cfg.areaLabels).toEqual([
      "area:live-points",
      "area:transactions",
      "area:egress-mqtt",
      "area:egress-sse",
      "area:subscriptions",
      "area:commands",
      "area:host",
      "area:building-blocks",
      "area:docs",
      "area:installer",
    ]);
    // Not present in Anduin-style files — stay blank for form overrides.
    expect(cfg.stack).toBe("");
    expect(cfg.crucibleVariant).toBe("");
    expect(cfg.testCommand).toBe("");
  });
});
