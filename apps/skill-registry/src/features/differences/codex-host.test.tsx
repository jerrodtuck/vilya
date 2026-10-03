import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/differences", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import { HostPanel } from "./host-panel";
import { HOST_FLOWS, HOST_LABEL, SHARED_BOARD } from "./host-story";

describe("Codex differences host view", () => {
  it("has a complete flow against the same board contract", () => {
    expect(Object.keys(HOST_LABEL).sort()).toEqual(["cc", "codex", "cursor"]);
    for (const host of ["cc", "cursor", "codex"] as const) expect(HOST_FLOWS[host].steps.map(s => s.board).sort()).toEqual(SHARED_BOARD.map(s => s.id).sort());
  });
  it("shows Codex evidence, linked lifecycle guidance and explicit runtime limitations", () => {
    current.host = "codex";
    const html = renderToStaticMarkup(<HostPanel />);
    for (const value of ["Codex happy path", "Spawning is not isolation", "#329", "/setup?host=codex", "/orch?host=codex", "not a passed Vilya runtime cycle"]) expect(html).toContain(value);
    expect(html).not.toContain("BoN without a worktree ask");
  });
  it.each(["cc", "cursor"])("preserves the %s matrix/path", host => {
    current.host = host;
    const html = renderToStaticMarkup(<HostPanel />);
    expect(html).toContain(HOST_LABEL[host as "cc" | "cursor"] + " happy path");
    expect(html).not.toContain("Codex evidence and limits");
  });
});
