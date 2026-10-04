import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { configChecklist, emptyConfig, mergeConfig } from "./github-projects-config";
import { suggestionFor, usualFill } from "./github-projects-defaults";
import { generateSlim } from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";
import { GithubProjectsTool, overridesToPartial } from "./github-projects-tool";

const migrationKeys = ["migrationTool", "migrationCommand", "migrationStatus"] as const;
const runnerIssue = "[narya-web #84](https://github.com/jerrodtuck/narya-web/issues/84)";
const pendingConfig = `## Repo config
| Key | Value | How to get it |
| --- | --- | --- |
| Repo | jerrodtuck/narya-web | identity |
| Stack | nextjs | framework |
| Migration tool | Drizzle Kit | tooling |
| Migration command | Pending — npm run db:migrate is not implemented | application |
| Migration status | Pending — journal, baseline and runner: ${runnerIssue} | follow-up |
`;

function regenerate(paste: string, overrides: Record<string, string> = {}) {
  const edited = mergeConfig(parseConfig(paste), overridesToPartial(overrides));
  return generateSlim(mergeConfig(edited, usualFill(edited)));
}

function migrationValues(markdown: string) {
  const config = parseConfig(markdown);
  return migrationKeys.map((key) => config[key]);
}

describe("migration config regeneration", () => {
  it("preserves the pending command and owning issue through repeat regeneration", () => {
    const output = regenerate(pendingConfig);
    expect(migrationValues(output)).toEqual(migrationValues(pendingConfig));
    expect(output).toContain(runnerIssue);
    expect(output).toContain("Pending — npm run db:migrate is not implemented");
    expect(regenerate(output)).toBe(output);
    expect(parseConfig(output).repo).toBe("jerrodtuck/narya-web");
  });

  it("uses form edits without losing untouched migration fields or repo identity", () => {
    const output = regenerate(pendingConfig, {
      migrationCommand: "npm run db:migrate -- --config=drizzle.staging.config.ts",
      migrationStatus: "Ready for staging; production baseline pending — " + runnerIssue,
    });
    expect(migrationValues(output)).toEqual([
      "Drizzle Kit",
      "npm run db:migrate -- --config=drizzle.staging.config.ts",
      "Ready for staging; production baseline pending — " + runnerIssue,
    ]);
    expect(parseConfig(output).repo).toBe("jerrodtuck/narya-web");
  });

  it("clears pasted values to unknown and does not resurrect them through defaults", () => {
    const output = regenerate(pendingConfig, {
      migrationTool: "",
      migrationCommand: "   ",
      migrationStatus: "",
    });
    expect(migrationValues(output)).toEqual(["", "", ""]);
    expect(configChecklist(parseConfig(output))
      .filter((item) => migrationKeys.some((key) => key === item.key))
      .map((item) => item.status)).toEqual(["missing", "missing", "missing"]);
    expect(regenerate(output)).toBe(output);
  });

  it.each(["", "nextjs", "blazor", "fastapi"])(
    "does not infer migration settings from a blank or legacy %s config", (stack) => {
      const output = regenerate(`## Repo config
| Stack | ${stack} | framework |`);
      expect(migrationValues(output)).toEqual(["", "", ""]);
      const config = { ...emptyConfig(), stack };
      expect(migrationKeys.map((key) => suggestionFor(key, config))).toEqual(["", "", ""]);
      expect(output).not.toContain("Drizzle");
      expect(output).not.toContain("npm run db:migrate");
    });

  it("preserves a non-Drizzle tool and explicit not-applicable settings", () => {
    const output = regenerate(pendingConfig, {
      migrationTool: "EF Core",
      migrationCommand: "dotnet ef database update --project Data",
      migrationStatus: "Ready — target selected explicitly",
    });
    expect(migrationValues(output)).toEqual([
      "EF Core", "dotnet ef database update --project Data", "Ready — target selected explicitly",
    ]);
    const noDatabase = regenerate(output, {
      migrationTool: "none — no application database",
      migrationCommand: "n/a — no application database",
      migrationStatus: "n/a — no application database",
    });
    expect(parseConfig(noDatabase).migrationTool).toBe("none — no application database");
    expect(parseConfig(noDatabase).migrationCommand).toBe("n/a — no application database");
  });

  it("renders named editable fields and links the single canonical policy", () => {
    const html = renderToStaticMarkup(<GithubProjectsTool canonMarkdown={null} />);
    for (const label of ["Migration tool", "Migration command", "Migration status"]) {
      expect(html).toContain(`aria-label="${label}"`);
    }
    expect(html).toContain("Migration fields are optional repo settings");
    expect(html).toContain("mark it pending");
    expect(html).toContain("GITHUB-PROJECTS.md#database-migrations");
  });
});
