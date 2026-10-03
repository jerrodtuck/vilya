import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/differences", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import DifferencesPage, { metadata } from "./page";
import { ClaudeDispatchPath } from "../../features/orchestrator/claude-dispatch-path";
import { CursorDispatchPath } from "../../features/orchestrator/cursor-dispatch-path";
import { PlanExecuteSection } from "../../features/setup/plan-execute-section";

describe("Differences public desktop naming", () => {
  it.each(["cc", "cursor", "codex"])("aligns the title and banner for %s while preserving the historic ADR title", host => {
    current.host = host;
    expect(metadata.title).toBe("The Dev Loop — One board, three desktops");
    const html = renderToStaticMarkup(<DifferencesPage />);
    expect(html).toContain("One board · three desktops");
    expect(html).toContain("2026-07-20 — One board, two desktops");
  });
  it.each([ClaudeDispatchPath, CursorDispatchPath, PlanExecuteSection])("labels current incoming links for three desktops (%#)", Component => {
    const html = renderToStaticMarkup(<Component />);
    expect(html).toContain('href="/differences">Three desktops</a>');
    expect(html).not.toContain('href="/differences">Two desktops</a>');
  });
});
