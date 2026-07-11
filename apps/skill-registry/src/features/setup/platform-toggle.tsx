// Feature slice: setup — Claude Code ⇄ Cursor install-path toggle (client leaf).
"use client";

import { useState } from "react";

export function PlatformToggle() {
  const [tool, setTool] = useState<"cc" | "cur">("cc");

  return (
    <>
      <div className="toggle" role="tablist">
        <button
          type="button"
          className={tool === "cc" ? "on" : ""}
          onClick={() => setTool("cc")}
        >
          Claude Code
        </button>
        <button
          type="button"
          className={tool === "cur" ? "on" : ""}
          onClick={() => setTool("cur")}
        >
          Cursor
        </button>
      </div>

      {tool === "cc" ? (
        <div className="pane on">
          <p>
            Run the sync script from the repo root — it installs every skill to
            your user-level directory:
          </p>
          <pre>{`pwsh scripts/install-skills.ps1        # Windows (or plain PowerShell)
bash scripts/install-skills.sh         # macOS / Linux / Git Bash`}</pre>
          <p>
            Skills land in <code>~/.claude/skills/&lt;skill-name&gt;/SKILL.md</code>{" "}
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
