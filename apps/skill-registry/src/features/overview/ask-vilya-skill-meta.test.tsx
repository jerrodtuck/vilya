// #254 / #278: Overview Ask Vilya card carries /vl-ask skill metadata.
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  SKILL_AFFORDANCE_LEAD,
  skillInvoke,
} from "../../shared/skills/skill-affordance";
import { SKILL_SLUGS } from "../../shared/skills/invokes";
import { PromptList } from "../../shared/ui/prompt-list";
import { ASK_VILYA } from "./ask-vilya";

describe("Ask Vilya prompt skill metadata (#278)", () => {
  it("Route me card maps to vl-ask and renders the affordance", () => {
    const card = ASK_VILYA.items[0];
    expect(card.skill).toBe(SKILL_SLUGS.askVilya);

    const html = renderToStaticMarkup(<PromptList group={ASK_VILYA} />);
    expect(html).toContain(SKILL_AFFORDANCE_LEAD);
    expect(html).toContain(skillInvoke(SKILL_SLUGS.askVilya));
    expect(html).toContain("Copy");
  });
});
