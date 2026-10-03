import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/planner", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import { PlannerView } from "./planner-view";

describe("Codex planning route", () => {
  it("routes to orch-owned planning without exposing a standing Planner entry", () => {
    current.host = "codex";
    const html = renderToStaticMarkup(<PlannerView />);
    expect(html).toContain("No standing Codex Planner seat is required");
    expect(html).toContain("/orch?host=codex");
    expect(html).toContain("plan:ready ∧ night-shift:ready");
    expect(html).not.toContain("Planner prompt library");
  });
  it.each(["cc", "cursor"])("preserves %s planning teaching", host => {
    current.host = host;
    const html = renderToStaticMarkup(<PlannerView />);
    expect(html).toContain("Planner prompt library");
    expect(html).not.toContain("Codex planning belongs to the orchestrator");
  });
});
