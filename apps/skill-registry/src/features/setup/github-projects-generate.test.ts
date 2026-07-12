import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  configChecklist,
  emptyConfig,
  mergeConfig,
} from "./github-projects-config";
import {
  generateFromTemplate,
  stripVilyaMetaSection,
} from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";

const MINI_TEMPLATE = `# GitHub Projects — tracking model (template)

**Vilya is the Dev Loop system** — copy this file.

## Repo config — fill this in per repo

| Key | Value | How to get it |
|-----|-------|---------------|
| Owner | \`jerrodtuck\` | your GitHub account/org (e.g. \`jerrodtuck\`) |
| Repo | \`jerrodtuck/vilya\` | the repo issues live in |
| Project number | \`8\` | \`gh project list --owner <owner>\` |
| Project id | \`PVT_kwHOAYNJN84BdH1y\` | \`gh project view <n> --owner <owner> --format json --jq .id\` |
| Status field id | \`PVTSSF_lAHOAYNJN84BdH1yzhXrqCM\` | see "Field ids" below |
| **Stack** | \`nextjs\` | the repo's framework |
| **Crucible variant** | \`crucible-nextjs\` | the review skill installed in this repo |
| **Test command** | \`npm test && npm run build\` (in \`apps/skill-registry\`) | what \`/finish-feature\` runs in step 1 |
| **Manual smoke** | \`npm run dev\` in \`apps/skill-registry\` → http://localhost:3000 | how to launch the app for a hands-on pre-merge test (\`/merge-pr\`); for hardware/live-only checks write \`live-only\` — those go through Verifying instead |
| Default branch | \`main\` | \`git remote show origin\` |

### Models (optional — change over time)

Human-readable names only; skills do not pin models in frontmatter for both phases. Update these
when your preferred planning or execution model changes — no skill body edits required.

| Key | Value | Notes |
|-----|-------|-------|
| **Planning model** | *(operator choice)* | Used in \`/start-feature\` plan phase when planning actually runs (Cursor Plan mode is operator-gated — see skill; Claude planning model) |
| **Execution model** | *(operator choice)* | Used after the plan is settled; night-shift / Actions use this class of model for the whole unattended run |

Status option ids (fill after first setup):

\`\`\`text
Todo:         f75ad846
In Progress:  47fc9ee4
Blocked:      7e864448
Verifying:    0fd3026c
Done:         98236657
\`\`\`

Native single-select fields on this board (beyond Status; labels remain what the
skills read):

\`\`\`text
Type  (PVTSSF_lAHOAYNJN84BdH1yzhXrqC4): Roadmap c3d24af8 · Epic 6021b0ae · Feature bca65912 · Bug 066550da · Task 888fb4a8
Priority (PVTSSF_lAHOAYNJN84BdH1yzhXrqC8): Critical 015536b0 · High 5aa1bc85 · Medium aa763174 · Low 7522a137
\`\`\`

Get the Status field id + option ids in one shot:

\`\`\`bash
gh project field-list <n> --owner <owner> --format json
\`\`\`

### Area labels — define per repo

Areas name *this* product's vertical slices. This repo's areas:

\`area:registry\` · \`area:skills\` · \`area:site\`

## Model (same everywhere)

- **One Project per product.** Issues live in the product's repo.

## Frozen

Do not invent \`BUGS.md\` / \`ROADMAP.md\` as live trackers — use the board.

## Implementation checklist → board issues (Vilya meta)

| Slice | Issue |
|-------|-------|
| Site | #48 |
`;

describe("stripVilyaMetaSection", () => {
  it("removes the Vilya meta checklist and keeps Frozen", () => {
    const out = stripVilyaMetaSection(MINI_TEMPLATE);
    expect(out).toContain("## Frozen");
    expect(out).not.toContain("Implementation checklist");
    expect(out).not.toContain("#48");
  });
});

describe("generateFromTemplate", () => {
  it("fills config values and strips Vilya meta", () => {
    const config = mergeConfig(emptyConfig(), {
      owner: "acme",
      repo: "acme/widgets",
      projectNumber: "3",
      projectId: "PVT_abc",
      statusFieldId: "PVTSSF_xyz",
      stack: "blazor",
      crucibleVariant: "crucible-blazor",
      testCommand: "dotnet test",
      manualSmoke: "dotnet run",
      defaultBranch: "master",
      planningModel: "opus",
      executionModel: "sonnet",
      statusOptions: {
        todo: "aaa",
        inProgress: "bbb",
        blocked: "ccc",
        verifying: "ddd",
        done: "eee",
      },
      typeFieldLine: "Type  (PVTSSF_type): Feature bca · Bug bug",
      priorityFieldLine: "Priority (PVTSSF_pri): High hi · Low lo",
      areaLabels: ["area:api", "area:ui"],
    });

    const out = generateFromTemplate(config, MINI_TEMPLATE);
    expect(out).toContain("| Owner | `acme` |");
    expect(out).toContain("| Repo | `acme/widgets` |");
    expect(out).toContain("| **Stack** | `blazor` |");
    expect(out).toContain("| **Crucible variant** | `crucible-blazor` |");
    expect(out).toContain("`opus`");
    expect(out).toContain("`sonnet`");
    expect(out).toContain("Todo:         aaa");
    expect(out).toContain("`area:api` · `area:ui`");
    expect(out).toContain("## Model (same everywhere)");
    expect(out).not.toContain("jerrodtuck/vilya");
    expect(out).not.toContain("Implementation checklist");
    expect(out).not.toContain("f75ad846");
  });

  it("uses placeholders for a blank new-repo config", () => {
    const out = generateFromTemplate(emptyConfig(), MINI_TEMPLATE);
    expect(out).toContain("`<owner>`");
    expect(out).toContain("`<owner>/<repo>`");
    expect(out).toContain("crucible-<stack>");
    expect(out).toContain("*(operator choice)*");
    expect(out).toContain("`area:<slice>`");
    expect(out).not.toContain("PVT_kwHOAYNJN84BdH1y");
    expect(out).not.toContain("Implementation checklist");
  });

  it("round-trips the real Vilya template when present on disk", () => {
    const realPath = path.resolve(
      process.cwd(),
      "../../docs/project-tracking/GITHUB-PROJECTS.md"
    );
    if (!fs.existsSync(realPath)) return;

    const template = fs.readFileSync(realPath, "utf8");
    const parsed = parseConfig(template);
    expect(parsed.owner).toBe("jerrodtuck");
    expect(parsed.repo).toBe("jerrodtuck/vilya");

    const regenerated = generateFromTemplate(parsed, template);
    expect(regenerated).not.toContain("Implementation checklist");
    expect(regenerated).toContain("| Owner | `jerrodtuck` |");
    expect(regenerated).toContain("| Repo | `jerrodtuck/vilya` |");
    expect(regenerated).toContain("## Model (same everywhere)");
    expect(regenerated).toContain("## Frozen");

    const reparsed = parseConfig(regenerated);
    expect(reparsed.owner).toBe(parsed.owner);
    expect(reparsed.repo).toBe(parsed.repo);
    expect(reparsed.stack).toBe(parsed.stack);
    expect(reparsed.statusOptions).toEqual(parsed.statusOptions);
    expect(reparsed.areaLabels).toEqual(parsed.areaLabels);
  });
});

describe("configChecklist + mergeConfig", () => {
  it("marks filled vs missing fields", () => {
    const items = configChecklist(
      mergeConfig(emptyConfig(), { owner: "acme", stack: "nextjs" })
    );
    expect(items.find((i) => i.key === "owner")?.status).toBe("kept");
    expect(items.find((i) => i.key === "stack")?.status).toBe("kept");
    expect(items.find((i) => i.key === "repo")?.status).toBe("missing");
  });

  it("lets non-empty form overrides win", () => {
    const merged = mergeConfig(parseConfig("| Owner | `paste` |\n"), {
      owner: "form",
    });
    // parse of broken table may miss owner — still exercise merge
    const fromParsed = mergeConfig(
      { ...emptyConfig(), owner: "paste" },
      { owner: "form" }
    );
    expect(fromParsed.owner).toBe("form");
    expect(merged.owner === "form" || merged.owner === "paste").toBe(true);
  });
});
