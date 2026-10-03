import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { configChecklist, emptyConfig, mergeConfig } from "./github-projects-config";
import { usualFill } from "./github-projects-defaults";
import { generateSlim } from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";
import { GithubProjectsTool, overridesToPartial } from "./github-projects-tool";

const policyRows = (baseline: string, policy: string) => `## Repo config
| Key | Value | How to get it |
| --- | --- | --- |
| **Component baseline** | ${baseline} | library |
| **Custom component policy** | ${policy} | record |
`;

function policyChecklist(markdown: string) {
  return configChecklist(parseConfig(markdown)).filter((item) =>
    ["componentBaseline", "customComponentPolicy"].includes(item.key));
}

describe("component baseline config", () => {
  it("preserves baseline constraints and scoped approval records through regeneration", () => {
    const input = policyRows(
      "shadcn — vendored in `src/components/ui`; do not hand-edit",
      "operator approval required; approved set in [AGENTS.md](../AGENTS.md#approved-primitives)"
    );
    const parsed = parseConfig(input);
    const output = generateSlim(parsed);
    const roundTrip = parseConfig(output);
    expect(roundTrip.componentBaseline).toBe(parsed.componentBaseline);
    expect(roundTrip.customComponentPolicy).toBe(parsed.customComponentPolicy);
    expect(generateSlim(roundTrip)).toBe(output);
    expect(policyChecklist(output).map((item) => item.status)).toEqual(["kept", "kept"]);
  });

  it("accepts an explicit no-library/no-special-gate decision without treating it as missing", () => {
    const parsed = parseConfig(policyRows("`none`", "n/a — backend only; no special component gate"));
    expect(parsed.componentBaseline).toBe("none");
    const output = generateSlim(mergeConfig(parsed, usualFill(parsed)));
    expect(parseConfig(output).customComponentPolicy).toBe(parsed.customComponentPolicy);
    expect(policyChecklist(output).map((item) => item.status)).toEqual(["kept", "kept"]);
  });

  it.each(["", "## Repo config\n| **Stack** | nextjs | framework |", policyRows("", "")])(
    "keeps missing policy unknown through defaults and regeneration: %s", (input) => {
      const parsed = parseConfig(input);
      const merged = mergeConfig(parsed, usualFill(parsed));
      const output = generateSlim(merged);
      expect(parseConfig(output).componentBaseline).toBe("");
      expect(parseConfig(output).customComponentPolicy).toBe("");
      expect(policyChecklist(output).map((item) => item.status)).toEqual(["missing", "missing"]);
    });

  it("uses the actual form adapter to replace pasted policy without losing the other values", () => {
    const parsed = parseConfig(policyRows("old library", "old record"));
    const form = overridesToPartial({
      componentBaseline: "none",
      customComponentPolicy: "n/a — no special gate; normal review applies",
    });
    const output = generateSlim(mergeConfig(parsed, form));
    expect(parseConfig(output).componentBaseline).toBe("none");
    expect(parseConfig(output).customComponentPolicy).toBe(form.customComponentPolicy);
    expect(mergeConfig(parsed, overridesToPartial({ componentBaseline: "new library" }))
      .customComponentPolicy).toBe("old record");
  });

  it("clears pasted policy to unknown when its form input is emptied", () => {
    const parsed = parseConfig(policyRows("shadcn", "written approval required; AGENTS.md"));
    const cleared = mergeConfig(parsed, overridesToPartial({
      componentBaseline: "",
      customComponentPolicy: "   ",
    }));
    const output = generateSlim(mergeConfig(cleared, usualFill(cleared)));
    expect(parseConfig(output).componentBaseline).toBe("");
    expect(parseConfig(output).customComponentPolicy).toBe("");
    expect(policyChecklist(output).map((item) => item.status)).toEqual(["missing", "missing"]);
    expect(mergeConfig(parsed, overridesToPartial({})).componentBaseline).toBe("shadcn");
  });

  it("shows explicit editable policy fields and explains unknown values in the Setup form", () => {
    const html = renderToStaticMarkup(<GithubProjectsTool canonMarkdown={null} />);
    expect(html).toContain('aria-label="Component baseline"');
    expect(html).toContain('aria-label="Custom component policy"');
    expect(html).toContain("Blank means unknown");
    expect(html).toContain("authoritative");
    expect(emptyConfig().componentBaseline).toBe("");
  });
});
