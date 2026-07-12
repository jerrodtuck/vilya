// Feature slice: setup — pure parse of pasted GITHUB-PROJECTS.md → config.

import {
  emptyConfig,
  type GithubProjectsConfig,
  type StatusOptionIds,
} from "./github-projects-config";

/** Normalize a markdown table key cell (`**Stack**` → `stack`). */
function normalizeKey(raw: string): string {
  return raw
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Value cell: unwrap a single outer `...` wrap when the whole cell is one code
 * span; keep trailing notes and inner backticks otherwise. Unwrap *(italic)*.
 */
export function normalizeValue(raw: string): string {
  let v = raw.trim();
  const italic = v.match(/^\*(.+)\*$/);
  if (italic) v = italic[1].trim();

  if (v.startsWith("`") && v.endsWith("`") && v.indexOf("`", 1) === v.length - 1) {
    return v.slice(1, -1);
  }
  return v;
}

function parseTableMap(markdown: string, headingPattern: RegExp): Map<string, string> {
  const map = new Map<string, string>();
  const heading = markdown.match(headingPattern);
  if (!heading || heading.index === undefined) return map;

  const after = markdown.slice(heading.index + heading[0].length);
  const nextHeading = after.search(/\n##[\s#]/);
  const section = nextHeading === -1 ? after : after.slice(0, nextHeading);

  for (const line of section.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    const key = normalizeKey(cells[0]);
    if (
      key === "" ||
      key === "key" ||
      /^-+$/.test(key) ||
      cells.every((c) => /^[-:\s]+$/.test(c))
    ) {
      continue;
    }
    map.set(key, normalizeValue(cells[1]));
  }
  return map;
}

function get(map: Map<string, string>, ...aliases: string[]): string {
  for (const a of aliases) {
    const v = map.get(a);
    if (v !== undefined && v !== "") return v;
  }
  return "";
}

function parseStatusOptions(markdown: string): StatusOptionIds {
  const options: StatusOptionIds = {
    todo: "",
    inProgress: "",
    blocked: "",
    verifying: "",
    done: "",
  };
  const block = markdown.match(
    /Status option ids[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i
  );
  if (!block) return options;

  for (const line of block[1].split(/\r?\n/)) {
    const m = line.match(/^([^:]+):\s*(\S+)\s*$/);
    if (!m) continue;
    const name = m[1].trim().toLowerCase();
    const id = m[2].trim();
    switch (name) {
      case "todo":
        options.todo = id;
        break;
      case "in progress":
        options.inProgress = id;
        break;
      case "blocked":
        options.blocked = id;
        break;
      case "verifying":
        options.verifying = id;
        break;
      case "done":
        options.done = id;
        break;
      default:
        break;
    }
  }
  return options;
}

function parseNativeFieldLines(markdown: string): {
  typeFieldLine: string;
  priorityFieldLine: string;
} {
  const block = markdown.match(
    /Native single-select fields[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i
  );
  if (!block) return { typeFieldLine: "", priorityFieldLine: "" };

  let typeFieldLine = "";
  let priorityFieldLine = "";
  for (const line of block[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (/^Type\b/i.test(trimmed)) typeFieldLine = trimmed;
    if (/^Priority\b/i.test(trimmed)) priorityFieldLine = trimmed;
  }
  return { typeFieldLine, priorityFieldLine };
}

function parseAreaLabels(markdown: string): string[] {
  const section = markdown.match(
    /### Area labels[\s\S]*?(?=\n## |\n### |\n$)/i
  );
  if (!section) return [];

  const found = section[0].match(/`area:[^`]+`/g);
  if (!found) return [];
  return found.map((s) => s.replace(/`/g, ""));
}

/**
 * Extract Repo config (+ Models, status ids, native fields, area labels) from a
 * pasted GITHUB-PROJECTS.md. Empty / missing paste → empty config (new-repo path).
 */
export function parseConfig(markdown: string): GithubProjectsConfig {
  const text = markdown.trim();
  if (text === "") return emptyConfig();

  const repo = parseTableMap(
    text,
    /^##\s+Repo config\b.*$/im
  );
  const models = parseTableMap(
    text,
    /^###\s+Models\b.*$/im
  );
  const native = parseNativeFieldLines(text);

  return {
    owner: get(repo, "owner"),
    repo: get(repo, "repo"),
    projectNumber: get(repo, "project number"),
    projectId: get(repo, "project id"),
    statusFieldId: get(repo, "status field id"),
    stack: get(repo, "stack"),
    crucibleVariant: get(repo, "crucible variant"),
    testCommand: get(repo, "test command"),
    manualSmoke: get(repo, "manual smoke"),
    defaultBranch: get(repo, "default branch"),
    planningModel: get(models, "planning model"),
    executionModel: get(models, "execution model"),
    statusOptions: parseStatusOptions(text),
    typeFieldLine: native.typeFieldLine,
    priorityFieldLine: native.priorityFieldLine,
    areaLabels: parseAreaLabels(text),
  };
}
