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

function firstNonEmpty(...values: string[]): string {
  for (const v of values) {
    if (v.trim() !== "") return v.trim();
  }
  return "";
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

function emptyStatusOptions(): StatusOptionIds {
  return {
    todo: "",
    inProgress: "",
    blocked: "",
    verifying: "",
    done: "",
  };
}

/** Apply a `Todo:` / `In Progress:` style line into status options. */
function applyStatusOptionLine(
  options: StatusOptionIds,
  nameRaw: string,
  id: string
): void {
  const name = nameRaw.trim().toLowerCase();
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

function parseStatusOptionLines(block: string): StatusOptionIds {
  const options = emptyStatusOptions();
  for (const line of block.split(/\r?\n/)) {
    const m = line.match(/^\s*([^:]+):\s*(\S+)\s*$/);
    if (!m) continue;
    applyStatusOptionLine(options, m[1], m[2].trim());
  }
  return options;
}

function parseStatusOptions(markdown: string): StatusOptionIds {
  const labeled = markdown.match(
    /Status option ids[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i
  );
  if (labeled) return parseStatusOptionLines(labeled[1]);

  // Anduin / Status-helper style: indented Todo/… under Status field.
  const helper = markdown.match(
    /Status field:\s*\S+[\s\S]*?```(?:text)?\s*([\s\S]*?)```/i
  );
  if (helper) return parseStatusOptionLines(helper[1]);

  // Bare Status helper block without the "Status option ids" label.
  const bare = markdown.match(
    /```(?:text)?\s*((?:[\s\S]*?\bTodo:\s*\S+[\s\S]*?))```/i
  );
  if (bare) return parseStatusOptionLines(bare[1]);

  return emptyStatusOptions();
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
  if (section) {
    const found = section[0].match(/`area:[^`]+`/g);
    if (found) return found.map((s) => s.replace(/`/g, ""));
  }

  // Labels table row: | **Area** | `area:x` · `area:y` |
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith("|")) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 2) continue;
    if (normalizeKey(cells[0]) !== "area") continue;
    const found = cells[1].match(/`area:[^`]+`/g);
    if (found) return found.map((s) => s.replace(/`/g, ""));
  }

  return [];
}

/** Prose / Status-helper fallbacks for product files that predate Repo config tables. */
function parseProseFallbacks(markdown: string): Partial<GithubProjectsConfig> {
  const ownerMatch = markdown.match(
    /\*\*Owner:\*\*\s*`([^`]+)`|\bOwner:\s*`([^`]+)`/i
  );
  const issuesRepo = markdown.match(
    /Issues live in\s*`([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)`/i
  );
  const createRepo = markdown.match(
    /gh issue create --repo\s+([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)/i
  );
  const projectNumber =
    markdown.match(/Project number:\s*`?(\d+)`?/i)?.[1] ??
    markdown.match(/\(project number\s+\*\*(\d+)\*\*\)/i)?.[1] ??
    markdown.match(/project number\s+\*\*(\d+)\*\*/i)?.[1] ??
    markdown.match(/gh project item-add\s+(\d+)\b/i)?.[1] ??
    "";
  const projectId =
    markdown.match(/Project id:\s*`?(PVT_[A-Za-z0-9]+)`?/i)?.[1] ?? "";
  const statusFieldId =
    markdown.match(/Status field(?:\s+id)?:\s*`?(PVTSSF_[A-Za-z0-9]+)`?/i)?.[1] ??
    "";
  const manualSmokeMatch = markdown.match(
    /\*\*Manual smoke:\*\*\s*(.+?)(?:\s*—|\s+-\s+how to launch|$)/im
  );
  const stackMatch = markdown.match(/\*\*Stack:\*\*\s*`([^`]+)`/i);
  const crucibleMatch = markdown.match(
    /\*\*Crucible variant:\*\*\s*`([^`]+)`/i
  );
  const testCommandMatch = markdown.match(
    /\*\*Test command:\*\*\s*(.+?)(?:\s*—|\s*$)/im
  );
  const defaultBranchMatch = markdown.match(
    /Default branch\s*[|:]\s*`([^`]+)`/i
  );

  const repo =
    issuesRepo?.[1] ??
    createRepo?.[1] ??
    "";
  const owner =
    ownerMatch?.[1] ??
    ownerMatch?.[2] ??
    (repo.includes("/") ? repo.split("/")[0] : "");

  return {
    owner,
    repo,
    projectNumber,
    projectId,
    statusFieldId,
    stack: stackMatch?.[1] ?? "",
    crucibleVariant: crucibleMatch?.[1] ?? "",
    testCommand: testCommandMatch?.[1]?.trim() ?? "",
    manualSmoke: manualSmokeMatch?.[1]?.trim() ?? "",
    defaultBranch: defaultBranchMatch?.[1] ?? "",
  };
}

/**
 * Extract Repo config (+ Models, status ids, native fields, area labels) from a
 * pasted GITHUB-PROJECTS.md. Empty / missing paste → empty config (new-repo path).
 * Prefer the Vilya Repo config table; fill gaps from prose / Status-helper layouts.
 */
export function parseConfig(markdown: string): GithubProjectsConfig {
  const text = markdown.trim();
  if (text === "") return emptyConfig();

  const repo = parseTableMap(text, /^##\s+Repo config\b.*$/im);
  const models = parseTableMap(text, /^###\s+Models\b.*$/im);
  const native = parseNativeFieldLines(text);
  const prose = parseProseFallbacks(text);

  return {
    owner: firstNonEmpty(get(repo, "owner"), prose.owner ?? ""),
    repo: firstNonEmpty(get(repo, "repo"), prose.repo ?? ""),
    projectNumber: firstNonEmpty(
      get(repo, "project number"),
      prose.projectNumber ?? ""
    ),
    projectId: firstNonEmpty(get(repo, "project id"), prose.projectId ?? ""),
    statusFieldId: firstNonEmpty(
      get(repo, "status field id"),
      prose.statusFieldId ?? ""
    ),
    stack: firstNonEmpty(get(repo, "stack"), prose.stack ?? ""),
    crucibleVariant: firstNonEmpty(
      get(repo, "crucible variant"),
      prose.crucibleVariant ?? ""
    ),
    testCommand: firstNonEmpty(
      get(repo, "test command"),
      prose.testCommand ?? ""
    ),
    manualSmoke: firstNonEmpty(
      get(repo, "manual smoke"),
      prose.manualSmoke ?? ""
    ),
    defaultBranch: firstNonEmpty(
      get(repo, "default branch"),
      prose.defaultBranch ?? ""
    ),
    planningModel: get(models, "planning model"),
    executionModel: get(models, "execution model"),
    statusOptions: parseStatusOptions(text),
    typeFieldLine: native.typeFieldLine,
    priorityFieldLine: native.priorityFieldLine,
    areaLabels: parseAreaLabels(text),
  };
}
