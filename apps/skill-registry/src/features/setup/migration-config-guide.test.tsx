import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MigrationConfigGuide, MIGRATION_CONFIG_EXAMPLE } from "./migration-config-guide";
import { SetupView } from "./setup-view";
import { parseConfig } from "./github-projects-parse";
import { generateSlim } from "./github-projects-generate";
import { mergeConfig } from "./github-projects-config";
import { usualFill } from "./github-projects-defaults";
import { overridesToPartial } from "./github-projects-tool";

const fields = ["migrationTool", "migrationCommand", "migrationStatus"] as const;
const values = (markdown: string) => fields.map((key) => parseConfig(markdown)[key]);
const regenerate = (markdown: string) => {
  const config = parseConfig(markdown);
  return generateSlim(mergeConfig(config, usualFill(config)));
};

// Read the actual rendered pre, rather than a separately maintained fixture.
function renderedExample(html: string) {
  const match = html.match(/<pre aria-label="Illustrative incomplete migration config Markdown">([\s\S]*?)<\/pre>/);
  expect(match).not.toBeNull();
  return match![1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

describe("migration config teaching", () => {
  it("renders exact product path, table placement, non-defaults and canonical evidence link", () => {
    const html = renderToStaticMarkup(<MigrationConfigGuide />);
    expect(html).toContain("product repo&#x27;s");
    expect(html).toContain("docs/project-tracking/GITHUB-PROJECTS.md");
    expect(html).toContain("Repo config");
    expect(html).toContain("Test command");
    expect(html).toContain("Manual smoke");
    expect(html).toContain("Status option IDs, Area labels, user-global skills or copied process prose");
    expect(html).toContain("Illustrative INCOMPLETE excerpt");
    expect(html).toContain("retain all other product settings");
    expect(html).toContain("Next.js does not imply Drizzle");
    expect(html).toContain("necessary working directory and intended target");
    expect(html).toContain("Blank means unknown");
    expect(html).toContain("none — no application database");
    expect(html).toContain('href="https://github.com/jerrodtuck/vilya/blob/master/docs/project-tracking/GITHUB-PROJECTS.md#database-migrations"');
    expect(html).toContain("do not authorize database execution");
  });

  it("composes the guide next to the actual Regenerate tool in SetupView", () => {
    const html = renderToStaticMarkup(<SetupView />);
    expect(html.indexOf("Regenerate GITHUB-PROJECTS.md")).toBeLessThan(html.indexOf('id="migration-config-guide"'));
    expect(html).toContain('aria-label="Migration command"');
    expect(renderedExample(html)).toBe(MIGRATION_CONFIG_EXAMPLE);
    expect(html).toContain("generated config-only file to the product&#x27;s");
  });

  it("roundtrips the same rendered three-column table without inventing executable readiness", () => {
    const example = renderedExample(renderToStaticMarkup(<MigrationConfigGuide />));
    expect(example).toBe(MIGRATION_CONFIG_EXAMPLE);
    const rows = example.split("\n").filter((line) => line.startsWith("| **"));
    expect(rows).toHaveLength(3);
    expect(rows.every((row) => row.split("|").length === 5)).toBe(true);
    expect(values(example)).toEqual([
      "Drizzle — only if configured in this repo",
      "Pending — migration runner not implemented",
      "Pending — link the owning runner/baseline issue here",
    ]);
    const output = regenerate(example);
    expect(values(output)).toEqual(values(example));
    expect(regenerate(output)).toBe(output);
    expect(output).not.toContain("npm run db:migrate");
    expect(output).not.toMatch(/https:\/\/github.com\/[^\s]+\/issues\//);
  });

  it("retains complete supplied product identity and settings while editing the rendered rows", () => {
    const config = parseConfig(`## Repo config
| Key | Value | How to get it |
| --- | --- | --- |
| Owner | sample-owner | supplied |
| Repo | sample-owner/sample-product | supplied |
| Stack | nextjs | supplied |
| Test command | npm test | supplied |
| Component baseline | none | supplied |
| Custom component policy | n/a — no special gate | supplied |
`);
    const example = parseConfig(renderedExample(renderToStaticMarkup(<MigrationConfigGuide />)));
    const edited = mergeConfig(config, overridesToPartial(Object.fromEntries(fields.map((key) => [key, example[key]]))));
    const output = generateSlim(edited);
    expect(parseConfig(output)).toMatchObject({
      owner: config.owner, repo: config.repo, stack: config.stack,
      testCommand: config.testCommand, componentBaseline: config.componentBaseline,
      customComponentPolicy: config.customComponentPolicy,
      migrationTool: example.migrationTool, migrationCommand: example.migrationCommand,
      migrationStatus: example.migrationStatus,
    });
    expect(regenerate(output)).toBe(output);
  });
});
