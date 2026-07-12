// Feature slice: setup — paste → parse → regenerate GITHUB-PROJECTS.md (client leaf).
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  configChecklist,
  emptyConfig,
  mergeConfig,
  type GithubProjectsConfig,
} from "./github-projects-config";
import {
  STACK_PRESETS,
  suggestionFor,
  usualFill,
} from "./github-projects-defaults";
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
  const withOverrides = mergeConfig(parsed, overridesToPartial(overrides));
  const merged = mergeConfig(withOverrides, usualFill(withOverrides));
  const generated = generateFromTemplate(merged, templateMarkdown);
  const checklist = configChecklist(merged);
  const kept = checklist.filter((i) => i.status === "kept").length;
  const missing = checklist.filter((i) => i.status === "missing").length;
  const pasteActive = paste.trim() !== "";
  const liveHint = pasteActive
    ? missing > 0
      ? `Live — ${kept} kept · ${missing} missing. Empty rows accept a value or a suggestion.`
      : `Live — ${kept} kept · 0 missing. Copy or download below.`
    : "Paste a file and/or fill missing checklist rows — usual Status ids and stack→crucible apply automatically.";

  const setOverrideValue = (key: string, value: string) => {
    setOverrides((prev) => {
      if (value === "") {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const setOverride =
    (key: string) => (e: ChangeEvent<HTMLInputElement>) => {
      setOverrideValue(key, e.target.value);
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
        repo). Missing checklist rows get a text box; Status option ids and
        crucible (from stack) use the usual shared board defaults. Suggestions
        on other gaps are one click. Generated updates live — nothing is pushed
        to GitHub.
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
          const suggestion = suggestionFor(item.key, merged);
          const showInput = item.status === "missing" || draft !== undefined;
          const showStackPicks = item.key === "stack" && showInput;
          const showSuggest =
            showInput &&
            suggestion !== "" &&
            (draft ?? "") !== suggestion &&
            item.status === "missing";

          return (
            <li key={item.key} className={item.status}>
              <span className="gpmark">
                {item.status === "kept" ? "✓" : "·"}
              </span>
              <span className="gplab">{item.label}</span>
              <span className="gpval">
                {showInput ? (
                  <span className="gpedit">
                    <input
                      className="gpinline"
                      value={draft ?? ""}
                      onChange={setOverride(item.key)}
                      placeholder={suggestion || "type value"}
                      list={showStackPicks ? "gp-stack-presets" : undefined}
                      aria-label={item.label}
                      spellCheck={false}
                    />
                    {showStackPicks ? (
                      <span className="gpsugs">
                        {STACK_PRESETS.map((p) => (
                          <button
                            key={p.stack}
                            type="button"
                            className="gpsug"
                            onClick={() => setOverrideValue("stack", p.stack)}
                          >
                            {p.stack}
                          </button>
                        ))}
                      </span>
                    ) : null}
                    {showSuggest ? (
                      <button
                        type="button"
                        className="gpsug"
                        onClick={() => setOverrideValue(item.key, suggestion)}
                      >
                        use {suggestion.length > 42
                          ? `${suggestion.slice(0, 40)}…`
                          : suggestion}
                      </button>
                    ) : null}
                  </span>
                ) : (
                  item.value
                )}
              </span>
            </li>
          );
        })}
      </ul>
      <datalist id="gp-stack-presets">
        {STACK_PRESETS.map((p) => (
          <option key={p.stack} value={p.stack} />
        ))}
      </datalist>

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
