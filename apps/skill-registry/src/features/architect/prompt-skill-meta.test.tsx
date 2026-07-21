// #254 / #269: Architect standing-orders card carries /vilya-arch skill metadata.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SKILL_AFFORDANCE_LEAD,
  skillInvoke,
} from "../../shared/skills/skill-affordance";
import { SKILL_SLUGS } from "../../shared/skills/invokes";
import { PromptList } from "../../shared/ui/prompt-list";
import { PROMPTS } from "./prompts";

describe("architect prompt skill metadata (#269)", () => {
  it("standing-orders card maps to vilya-arch and renders the affordance", () => {
    const arch = PROMPTS.find((g) => g.node === "ARCH");
    expect(arch).toBeDefined();
    const card = arch!.items[0];
    expect(card.skill).toBe(SKILL_SLUGS.architect);

    const html = renderToStaticMarkup(<PromptList group={arch!} />);
    expect(html).toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain(skillInvoke(SKILL_SLUGS.architect));
    expect(html).toContain("Copy");
  });
});
