// #254: Planner standing-orders card carries /vilya-planner skill metadata.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SKILL_AFFORDANCE_LEAD,
  skillInvoke,
} from "../../shared/skills/skill-affordance";
import { SKILL_SLUGS } from "../../shared/skills/invokes";
import { PromptList } from "../../shared/ui/prompt-list";
import { PROMPTS } from "./prompts";

describe("planner prompt skill metadata (#254)", () => {
  it("standing-orders card maps to vilya-planner and renders the affordance", () => {
    const plan = PROMPTS.find((g) => g.node === "PLAN");
    expect(plan).toBeDefined();
    const card = plan!.items[0];
    expect(card.skill).toBe(SKILL_SLUGS.planner);

    const html = renderToStaticMarkup(<PromptList group={plan!} />);
    expect(html).toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain(skillInvoke(SKILL_SLUGS.planner));
    expect(html).toContain("Copy");
  });
});
