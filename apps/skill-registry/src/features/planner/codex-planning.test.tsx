import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/planner", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import { PlannerView } from "./planner-view";

describe("Codex planning route", () => {
  it("exposes the separate Codex Planner entry and settled-plan handoff", () => {
    current.host = "codex";
    const html = renderToStaticMarkup(<PlannerView />);
    expect(html).toContain("Separate Codex Planner");
    expect(html).toContain("$vl-plan-codex");
    expect(html).toContain("without replanning");
    expect(html).toContain("/orch?host=codex");
    expect(html).toContain("plan:ready ∧ night-shift:ready");
    expect(html).not.toContain("Planner prompt library");
    for (const term of ["Sol/medium", "Sol/high", "Luna/low", "recorded Sol impasse", "cannot change the active chat", "references/model-routing.md", "second consecutive unsuccessful repair", "Renamed gates do not reset counts"]) expect(html).toContain(term);
  });
  it.each(["cc", "cursor"])("preserves %s planning teaching", host => {
    current.host = host;
    const html = renderToStaticMarkup(<PlannerView />);
    expect(html).toContain("Planner prompt library");
    expect(html).not.toContain("Codex planning belongs to the orchestrator");
  });
});
