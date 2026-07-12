// Feature slice: setup — paste → parse → regenerate GITHUB-PROJECTS.md (client leaf).
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  configChecklist,
  emptyConfig,
  mergeConfig,
  type GithubProjectsConfig,
} from "./github-projects-config";
import { generateFromTemplate } from "./github-projects-generate";
import { parseConfig } from "./github-projects-parse";

/** Checklist key → config override. Empty string means "no override". */
type FieldOverrides = Record<string, string>;

function overridesToPartial(overrides: FieldOverrides): Partial<GithubProjectsConfig> {
  const base = emptyConfig();
  const status = { ...base.statusOptions };
  let areaLabels = base.areaLabels;
  const scalar: Partial<GithubProjectsConfig> = {};

  for (const [key, raw] of Object.entries(overrides)) {
    const value = raw.trim();
    if (value === "") continue;

    switch (key) {
      case "owner":
      case "repo":
      case "projectNumber":
      case "projectId":
      case "statusFieldId":
      case "stack":
      case "crucibleVariant":
      case "testCommand":
      case "manualSmoke":
      case "defaultBranch":
      case "planningModel":
      case "executionModel":
      case "typeFieldLine":
      case "priorityFieldLine":
        scalar[key] = value;
        break;
      case "status.todo":
        status.todo = value;
        break;
      case "status.inProgress":
        status.inProgress = value;
        break;
      case "status.blocked":
        status.blocked = value;
        break;
      case "status.verifying":
        status.verifying = value;
        break;
      case "status.done":
        status.done = value;
        break;
      case "areaLabels":
        areaLabels = value
          .split(/[·,]/)
          .map((s) => s.trim())
          .filter(Boolean)
          .map((s) => (s.startsWith("area:") ? s : `area:${s}`));
        break;
      default:
        break;
    }
  }

  return {
    ...scalar,
    statusOptions: status,
    areaLabels,
  };
}

function CopyGenerated({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    if (!text || !navigator.clipboard?.writeText) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <button
      type="button"
      className={`copybtn${copied ? " done" : ""}`}
      onClick={copy}
      disabled={!text}
      style={{ position: "static" }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function GithubProjectsTool({
  templateMarkdown,
}: {
  templateMarkdown: string | null;
}) {
  const [paste, setPaste] = useState("");
  const [overrides, setOverrides] = useState<FieldOverrides>({});

  if (!templateMarkdown) {
    return (
      <div className="note">
        <b>Template unavailable.</b> Could not read the bundled{" "}
        <code>content/GITHUB-PROJECTS.md</code> (or{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>) from this
        runtime. Set <code>GITHUB_PROJECTS_TEMPLATE</code>, or rebuild so the
        sync script copies the canonical template into the app.
      </div>
    );
  }

  const parsed = parseConfig(paste);
  const merged = mergeConfig(parsed, overridesToPartial(overrides));
  const generated = generateFromTemplate(merged, templateMarkdown);
  const checklist = configChecklist(merged);
  const kept = checklist.filter((i) => i.status === "kept").length;
  const missing = checklist.filter((i) => i.status === "missing").length;
  const pasteActive = paste.trim() !== "";
  const liveHint = pasteActive
    ? missing > 0
      ? `Live — ${kept} kept · ${missing} missing. Type in the empty checklist rows.`
      : `Live — ${kept} kept · 0 missing. Copy or download below.`
    : "Paste a file and/or type missing values in the checklist — Generated updates live.";

  const setOverride =
    (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setOverrides((prev) => {
        if (value === "") {
          const next = { ...prev };
          delete next[key];
          return next;
        }
        return { ...prev, [key]: value };
      });
    };

  const download = () => {
    if (!generated) return;
    const blob = new Blob([generated], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GITHUB-PROJECTS.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gptool">
      <p className="muted" style={{ lineHeight: 1.55, marginTop: 0 }}>
        Paste a product repo&apos;s current file (or leave blank for a new
        repo). Values land in the checklist; anything still missing gets a
        text box right there. Both feed Vilya&apos;s latest template —
        Generated updates live. Copy or download; nothing is pushed to GitHub.
      </p>

      <label className="gplabel" htmlFor="gp-paste">
        Paste current <code>GITHUB-PROJECTS.md</code>
      </label>
      <textarea
        id="gp-paste"
        className="gptextarea"
        rows={10}
        value={paste}
        onChange={(e) => setPaste(e.target.value)}
        placeholder="Paste markdown here — or leave empty and fill missing checklist rows for a new repo"
        spellCheck={false}
      />
      <p
        className={`gplive${pasteActive || kept > 0 ? " active" : ""}`}
        aria-live="polite"
      >
        {liveHint}
      </p>

      <div className="gprow">
        <button
          type="button"
          className="setupbtn"
          onClick={() => {
            setPaste("");
            setOverrides({});
          }}
        >
          Clear
        </button>
      </div>

      <h3 className="gph3">
        Config checklist{" "}
        <span className="muted">
          ({kept} kept · {missing} missing)
        </span>
      </h3>
      <ul className="gpcheck">
        {checklist.map((item) => {
          const draft = overrides[item.key];
          const showInput = item.status === "missing" || draft !== undefined;
          return (
            <li key={item.key} className={item.status}>
              <span className="gpmark">
                {item.status === "kept" ? "✓" : "·"}
              </span>
              <span className="gplab">{item.label}</span>
              <span className="gpval">
                {showInput ? (
                  <input
                    className="gpinline"
                    value={draft ?? ""}
                    onChange={setOverride(item.key)}
                    placeholder="type value"
                    aria-label={item.label}
                    spellCheck={false}
                  />
                ) : (
                  item.value
                )}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="gprow" style={{ marginTop: 18 }}>
        <h3 className="gph3" style={{ margin: 0, flex: 1 }}>
          Generated file
        </h3>
        <CopyGenerated text={generated} />
        <button type="button" className="setupbtn" onClick={download}>
          Download
        </button>
      </div>
      <pre className="gpout">{generated}</pre>
    </div>
  );
}
