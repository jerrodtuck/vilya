import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const current = vi.hoisted(() => ({ host: "codex" }));
vi.mock("next/navigation", () => ({ usePathname: () => "/setup", useRouter: () => ({ replace: vi.fn() }), useSearchParams: () => new URLSearchParams("host=" + current.host) }));
import { SetupView } from "./setup-view";

describe("setup copy-mode recipe follows the desktop", () => {
  it.each(["codex", "cc", "cursor"])("renders the correct destination on the full %s setup page", host => {
    current.host = host;
    const html = renderToStaticMarkup(<SetupView />);
    const root = host === "codex" ? "~/.agents/skills" : "~/.claude/skills";
    const wrong = host === "codex" ? "~/.claude/skills" : "~/.agents/skills";
    expect(html).toContain("curl -fLo " + root + "/&lt;name&gt;/SKILL.md --create-dirs");
    expect(html).not.toContain("curl -fLo " + wrong);
    expect(html).toContain("referenced scripts or other resources");
  });
});
