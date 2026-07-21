// Feature slice: setup — usual defaults shared across copied GitHub Projects.
import type { GithubProjectsConfig, StatusOptionIds } from "./github-projects-config";

/**
 * Status option ids from the standard Todo/In Progress/Blocked/Verifying/Done
 * field. Stable across Projects copied from the same template (Anduin, Narya,
 * Vilya, …).
 */
export const USUAL_STATUS_OPTIONS: StatusOptionIds = {
  todo: "f75ad846",
  inProgress: "47fc9ee4",
  blocked: "7e864448",
  verifying: "0fd3026c",
  done: "98236657",
};

/** Type single-select option ids (field id still per-project). */
export const USUAL_TYPE_OPTIONS =
  "Roadmap c3d24af8 · Epic 6021b0ae · Feature bca65912 · Bug 066550da · Task 888fb4a8";

/** Priority single-select option ids (field id still per-project). */
export const USUAL_PRIORITY_OPTIONS =
  "Critical 015536b0 · High 5aa1bc85 · Medium aa763174 · Low 7522a137";

export interface StackPreset {
  stack: string;
  crucibleVariant: string;
  testCommand: string;
  defaultBranch: string;
}

/** Stack → crucible / smoke heuristics for the fill-in checklist. */
export const STACK_PRESETS: readonly StackPreset[] = [
  {
    stack: "nextjs",
    crucibleVariant: "vl-crucible-nextjs",
    testCommand: "npm test && npm run build",
    defaultBranch: "master",
  },
  {
    stack: "blazor",
    crucibleVariant: "vl-crucible-blazor",
    testCommand: "dotnet test",
    defaultBranch: "master",
  },
  {
    stack: "wpf-blazor-hybrid",
    crucibleVariant: "vl-crucible-blazor",
    testCommand: "dotnet test",
    defaultBranch: "master",
  },
];

export function normalizeStack(stack: string): string {
  return stack.trim().toLowerCase();
}

export function presetForStack(stack: string): StackPreset | undefined {
  const key = normalizeStack(stack);
  if (key === "") return undefined;
  return STACK_PRESETS.find((p) => p.stack === key);
}

export function usualTypeFieldLine(fieldId = "PVTSSF_..."): string {
  return `Type  (${fieldId}): ${USUAL_TYPE_OPTIONS}`;
}

export function usualPriorityFieldLine(fieldId = "PVTSSF_..."): string {
  return `Priority (${fieldId}): ${USUAL_PRIORITY_OPTIONS}`;
}

/**
 * Fill gaps with the usual shared board values and stack-derived crucible.
 * Does not invent test commands or project-specific field ids.
 */
export function usualFill(
  config: GithubProjectsConfig
): Partial<GithubProjectsConfig> {
  const so = config.statusOptions;
  const preset = presetForStack(config.stack);

  return {
    statusOptions: {
      todo: so.todo || USUAL_STATUS_OPTIONS.todo,
      inProgress: so.inProgress || USUAL_STATUS_OPTIONS.inProgress,
      blocked: so.blocked || USUAL_STATUS_OPTIONS.blocked,
      verifying: so.verifying || USUAL_STATUS_OPTIONS.verifying,
      done: so.done || USUAL_STATUS_OPTIONS.done,
    },
    crucibleVariant:
      config.crucibleVariant.trim() !== ""
        ? config.crucibleVariant
        : (preset?.crucibleVariant ?? ""),
  };
}

/** Placeholder / one-click suggestion for a missing checklist key. */
export function suggestionFor(
  key: string,
  config: GithubProjectsConfig
): string {
  const preset = presetForStack(config.stack);
  switch (key) {
    case "status.todo":
      return USUAL_STATUS_OPTIONS.todo;
    case "status.inProgress":
      return USUAL_STATUS_OPTIONS.inProgress;
    case "status.blocked":
      return USUAL_STATUS_OPTIONS.blocked;
    case "status.verifying":
      return USUAL_STATUS_OPTIONS.verifying;
    case "status.done":
      return USUAL_STATUS_OPTIONS.done;
    case "crucibleVariant":
      return preset?.crucibleVariant ?? "";
    case "testCommand":
      return preset?.testCommand ?? "";
    case "defaultBranch":
      return preset?.defaultBranch ?? "";
    case "stack":
      return "";
    case "typeFieldLine":
      return usualTypeFieldLine();
    case "priorityFieldLine":
      return usualPriorityFieldLine();
    default:
      return "";
  }
}
