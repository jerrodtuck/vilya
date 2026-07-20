// #254: graduated prompt cards surface run `/skill` before Copy.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SKILL_AFFORDANCE_LEAD, skillInvoke } from "../skills/skill-affordance";
import { PromptList } from "./prompt-list";
import type { PromptGroup } from "./flow-map-types";

describe("PromptList skill affordance (#254)", () => {
  it("renders apply-or-run for items with skill metadata", () => {
    const group: PromptGroup = {
      node: "ORCH",
      group: "test",
      c: "--orch",
      items: [
        {
          label: "Worker A",
          skill: "vilya-cursor-handoff",
          text: "paste fallback body",
        },
      ],
    };
    const html = renderToStaticMarkup(<PromptList group={group} />);
    expect(html).toContain("pskill");
    expect(html).toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain(skillInvoke("vilya-cursor-handoff"));
    expect(html).toContain("Copy");
    expect(html).toContain("paste fallback body");
  });

  it("stays paste-only when skill is omitted", () => {
    const group: PromptGroup = {
      node: "ORCH",
      group: "test",
      c: "--orch",
      items: [{ label: "Ungraduated", text: "paste only" }],
    };
    const html = renderToStaticMarkup(<PromptList group={group} />);
    expect(html).not.toContain("pskill");
    expect(html).not.toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain("Copy");
  });
});
