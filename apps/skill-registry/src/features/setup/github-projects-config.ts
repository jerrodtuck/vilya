// Feature slice: setup — GITHUB-PROJECTS.md config shape + checklist helpers.

export interface StatusOptionIds {
  todo: string;
  inProgress: string;
  blocked: string;
  verifying: string;
  done: string;
}

/** Parsed / form-editable repo config extracted from a paste (or filled manually). */
export interface GithubProjectsConfig {
  owner: string;
  repo: string;
  projectNumber: string;
  projectId: string;
  statusFieldId: string;
  stack: string;
  crucibleVariant: string;
  testCommand: string;
  manualSmoke: string;
  defaultBranch: string;
  statusOptions: StatusOptionIds;
  /** Raw Type field line from the native-fields block (may be empty). */
  typeFieldLine: string;
  /** Raw Priority field line from the native-fields block (may be empty). */
  priorityFieldLine: string;
  areaLabels: string[];
}

export type ChecklistStatus = "kept" | "missing";

export interface ChecklistItem {
  key: string;
  label: string;
  status: ChecklistStatus;
  value: string;
}

export const EMPTY_STATUS_OPTIONS: StatusOptionIds = {
  todo: "",
  inProgress: "",
  blocked: "",
  verifying: "",
  done: "",
};

export function emptyConfig(): GithubProjectsConfig {
  return {
    owner: "",
    repo: "",
    projectNumber: "",
    projectId: "",
    statusFieldId: "",
    stack: "",
    crucibleVariant: "",
    testCommand: "",
    manualSmoke: "",
    defaultBranch: "",
    statusOptions: { ...EMPTY_STATUS_OPTIONS },
    typeFieldLine: "",
    priorityFieldLine: "",
    areaLabels: [],
  };
}

/** Merge paste-derived config with form overrides (non-empty form wins). */
export function mergeConfig(
  parsed: GithubProjectsConfig,
  overrides: Partial<GithubProjectsConfig>
): GithubProjectsConfig {
  const pick = (override: string | undefined, base: string): string =>
    override !== undefined && override.trim() !== "" ? override.trim() : base;

  const statusOverrides = overrides.statusOptions;
  return {
    owner: pick(overrides.owner, parsed.owner),
    repo: pick(overrides.repo, parsed.repo),
    projectNumber: pick(overrides.projectNumber, parsed.projectNumber),
    projectId: pick(overrides.projectId, parsed.projectId),
    statusFieldId: pick(overrides.statusFieldId, parsed.statusFieldId),
    stack: pick(overrides.stack, parsed.stack),
    crucibleVariant: pick(overrides.crucibleVariant, parsed.crucibleVariant),
    testCommand: pick(overrides.testCommand, parsed.testCommand),
    manualSmoke: pick(overrides.manualSmoke, parsed.manualSmoke),
    defaultBranch: pick(overrides.defaultBranch, parsed.defaultBranch),
    statusOptions: {
      todo: pick(statusOverrides?.todo, parsed.statusOptions.todo),
      inProgress: pick(
        statusOverrides?.inProgress,
        parsed.statusOptions.inProgress
      ),
      blocked: pick(statusOverrides?.blocked, parsed.statusOptions.blocked),
      verifying: pick(
        statusOverrides?.verifying,
        parsed.statusOptions.verifying
      ),
      done: pick(statusOverrides?.done, parsed.statusOptions.done),
    },
    typeFieldLine: pick(overrides.typeFieldLine, parsed.typeFieldLine),
    priorityFieldLine: pick(
      overrides.priorityFieldLine,
      parsed.priorityFieldLine
    ),
    areaLabels:
      overrides.areaLabels && overrides.areaLabels.length > 0
        ? overrides.areaLabels
        : parsed.areaLabels,
  };
}

function item(
  key: string,
  label: string,
  value: string
): ChecklistItem {
  const trimmed = value.trim();
  return {
    key,
    label,
    status: trimmed === "" ? "missing" : "kept",
    value: trimmed,
  };
}

/** Checklist of config values kept from paste/form vs still missing. */
export function configChecklist(config: GithubProjectsConfig): ChecklistItem[] {
  const so = config.statusOptions;
  return [
    item("owner", "Owner", config.owner),
    item("repo", "Repo", config.repo),
    item("projectNumber", "Project number", config.projectNumber),
    item("projectId", "Project id", config.projectId),
    item("statusFieldId", "Status field id", config.statusFieldId),
    item("stack", "Stack", config.stack),
    item("crucibleVariant", "Crucible variant", config.crucibleVariant),
    item("testCommand", "Test command", config.testCommand),
    item("manualSmoke", "Manual smoke", config.manualSmoke),
    item("defaultBranch", "Default branch", config.defaultBranch),
    item("status.todo", "Status · Todo", so.todo),
    item("status.inProgress", "Status · In Progress", so.inProgress),
    item("status.blocked", "Status · Blocked", so.blocked),
    item("status.verifying", "Status · Verifying", so.verifying),
    item("status.done", "Status · Done", so.done),
    item("typeFieldLine", "Type field line", config.typeFieldLine),
    item("priorityFieldLine", "Priority field line", config.priorityFieldLine),
    item(
      "areaLabels",
      "Area labels",
      config.areaLabels.length > 0 ? config.areaLabels.join(" · ") : ""
    ),
  ];
}
