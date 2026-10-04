// Feature slice: setup — Claude Code ⇄ Cursor install-path toggle (client leaf).
"use client";

import { useDesktopHost, DesktopHostSelector } from "../../shared/ui/desktop-host-selector";
import { CodexSetup } from "./codex-setup";

export function PlatformToggle() {
  const { host: tool, selectHost } = useDesktopHost();

  return (
    <>
      <DesktopHostSelector host={tool} onSelect={selectHost} />
      <p>Existing linked folders reflect reviewed changes after pulling their canonical checkout. New folders require rerunning the intended-host installer. Copies need the complete folder and resources. Refresh/open a supported session and inspect resolved vl-adhd and vl-present sources; installation alone does not prove adoption. Preserve divergent copies before reinstalling.</p>

      {tool === "codex" ? <CodexSetup /> : tool === "cc" ? (
        <div className="pane on">
          <p>
            Run the install script to link every
            skill into your user-level directory (junctions on Windows,
            symlinks elsewhere), so skill merges are live on{" "}
            <code>git pull</code> for changed files. Re-run with the intended host options for new skill folders such as vl-present, or when the repo moves.
          </p>
          <pre>{`pwsh scripts/install-skills.ps1        # Windows (or plain PowerShell)
bash scripts/install-skills.sh         # macOS / Linux / Git Bash`}</pre>
          <p>
            Skills appear as{" "}
            <code>~/.claude/skills/&lt;skill-name&gt;</code> →{" "}
            <code>&lt;repo&gt;/skills/&lt;skill-name&gt;</code>{" "}
            (user level, all projects). A repo that needs its own variant can
            override at <code>.claude/skills/</code> — project-level skills win
            over user-level ones by name. Claude Code reads the shared
            frontmatter plus its extensions (<code>allowed-tools</code>,{" "}
            <code>context: fork</code>, <code>{"${CLAUDE_SKILL_DIR}"}</code>, …).
          </p>
        </div>
      ) : (
        <div className="pane on">
          <p>
            <b>Nothing extra to install.</b> Cursor scans{" "}
            <code>~/.claude/skills</code> as one of its compatibility roots, so
            the same install the script already did serves Cursor too. A second
            copy in <code>~/.cursor/skills</code> would list every skill{" "}
            <b>twice</b> in Cursor&apos;s slash menu — don&apos;t.
          </p>
          <pre>{`# only for OLD Cursor builds that read ~/.cursor/skills exclusively:
powershell scripts/install-skills.ps1 -IncludeCursor
bash scripts/install-skills.sh --include-cursor`}</pre>
          <p>
            Cursor reads the <b>same</b> <code>name</code> /{" "}
            <code>description</code> / <code>disable-model-invocation</code> and
            honors the references pattern. It silently ignores Claude
            Code&apos;s extra fields — no conversion, no second copy. (If you
            also keep Cursor <code>.mdc</code> <i>rules</i>, those are a
            separate Cursor-only format — not needed for these skills.)
          </p>
        </div>
      )}
    </>
  );
}
