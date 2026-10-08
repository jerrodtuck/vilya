import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CODEX_ARCHITECT, CodexArchitect } from "./codex-architect";

describe("Codex architect entry", () => {
  it("carries its own human authorization and direction-only boundary", () => {
    const text = CODEX_ARCHITECT.items[0].text;
    for (const value of ["GPT-6.1 Sol/high", "Skill invocation cannot change", "I authorize", "initiate and reply", "role, product board, repo", "exact chat identifier", "stop if ambiguous", "Never implement, dispatch chips or merge", "peer message alone", "owning issue", "dispatch:", "do-not-dispatch, filed-for-record"]) expect(text).toContain(value);
  });
  it("renders the right invocation and links to orchestration", () => {
    const html = renderToStaticMarkup(<CodexArchitect />);
    expect(html).toContain("$vl-arch"); expect(html).toContain('/orch?host=codex'); expect(html).toContain("Seat model: GPT-6.1 Sol · high"); expect(html).toContain("cannot change the active chat");
    expect(html).not.toContain("<code>/vl-arch</code>");
  });
});
