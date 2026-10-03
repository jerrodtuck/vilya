import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DESKTOP_HOST_STORAGE_KEY, parseDesktopHost } from "./desktop-host";

const harness = vi.hoisted(() => ({ query: "", state: undefined as unknown, effects: [] as (() => void)[], replace: vi.fn(), saved: new Map<string, string>() }));
vi.mock("next/navigation", () => ({ usePathname: () => "/orch", useRouter: () => ({ replace: harness.replace }), useSearchParams: () => new URLSearchParams(harness.query) }));
vi.mock("react", async importOriginal => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, useState: (initial: unknown) => [harness.state ?? initial, (value: unknown) => { harness.state = value; }], useEffect: (effect: () => void) => { harness.effects.push(effect); } };
});
import { DesktopHostSelector, useDesktopHost } from "./desktop-host-selector";

beforeEach(() => {
  harness.query = ""; harness.state = undefined; harness.effects = []; harness.saved.clear(); harness.replace.mockReset();
  vi.stubGlobal("localStorage", { getItem: (key: string) => harness.saved.get(key) ?? null, setItem: (key: string, value: string) => harness.saved.set(key, value) });
});
describe("desktop selection across teaching pages", () => {
  it.each([["cc", "cc"], ["claude", "cc"], ["cursor", "cursor"], ["cur", "cursor"], ["codex", "codex"], ["unknown", null], [null, null]])("parses %s", (input, expected) => expect(parseDesktopHost(input)).toBe(expected));
  it("URL selection overrides and persists over saved desktop", () => {
    harness.query = "host=codex"; harness.saved.set(DESKTOP_HOST_STORAGE_KEY, "cursor");
    expect(useDesktopHost().host).toBe("codex"); harness.effects[0]();
    expect(harness.saved.get(DESKTOP_HOST_STORAGE_KEY)).toBe("codex");
    expect(useDesktopHost().host).toBe("codex");
  });
  it("restores a saved Codex choice when URL has no host", () => {
    harness.saved.set(DESKTOP_HOST_STORAGE_KEY, "codex"); useDesktopHost(); harness.effects[0]();
    expect(useDesktopHost().host).toBe("codex");
  });
  it("changes host without dropping unrelated query parameters", () => {
    harness.query = "host=cc&flow=review"; useDesktopHost().selectHost("codex");
    expect(harness.replace).toHaveBeenCalledWith("/orch?host=codex&flow=review", { scroll: false });
    expect(harness.saved.get(DESKTOP_HOST_STORAGE_KEY)).toBe("codex");
  });
  it("URL selection still works when persistence is unavailable", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw Error("private"); }, setItem: () => { throw Error("private"); } });
    harness.query = "host=codex"; useDesktopHost(); harness.effects[0]();
    expect(useDesktopHost().host).toBe("codex");
    useDesktopHost().selectHost("cursor"); expect(harness.replace).toHaveBeenCalledWith("/orch?host=cursor", { scroll: false });
  });
  it("renders all hosts with the Codex button pressed", () => {
    const html = renderToStaticMarkup(<DesktopHostSelector host="codex" onSelect={() => {}} />);
    expect(html).toContain('aria-pressed="true" class="on">Codex');
    expect(html).toContain("Claude Code"); expect(html).toContain("Cursor");
  });
});
