/**
 * #395 — Docker rows for `/vl-prune` on an eligible worktree.
 * Classification only; worktree eligibility (gates 1–6) and the docker CLI calls stay agent-side.
 */

export type DockerItemKind = "container" | "volume" | "image";

export type DockerItem = {
  kind: DockerItemKind;
  /** Container name, volume name, or image `repository[:tag]` */
  name: string;
  labels?: Record<string, string>;
  /** Containers only: true while the container runs */
  running?: boolean;
};

export type DockerPruneTarget = {
  /** Repo short name (leaf of nameWithOwner) */
  repo: string;
  /** Leaf folder of the eligible worktree */
  worktreeFolder: string;
  /** Branch of the eligible worktree (the chip's `chip=` label value) */
  branch?: string;
  /** Leaf folders of the main clone and every other worktree, for name disambiguation */
  otherFolders?: string[];
};

export type DockerVerdict =
  | "eligible (chip label)"
  | "eligible (orphan)"
  | "skip (other project)"
  | "skip (shared)"
  | "skip (running)"
  | "not ours";

const CHIP_LABEL = "chip";
const PROJECT_LABEL = "project";
const SHARED_LABEL = "shared";
const COMPOSE_PROJECT_LABEL = "com.docker.compose.project";

/** Compose's default project name for a folder: lowercase, `[a-z0-9_-]` only, no leading `-`/`_`. */
export function composeProjectName(folder: string): string {
  return folder
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/^[-_]+/, "");
}

/** Parse `docker … --format '{{.Labels}}'` output (`k=v,k2=v2`). */
export function parseDockerLabels(raw: string): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const eq = pair.indexOf("=");
    if (eq <= 0) continue;
    labels[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
  }
  return labels;
}

function stripRefsHeads(branch: string): string {
  return branch.trim().replace(/^refs\/heads\//, "");
}

/** Image repository leaf without registry path or tag; other kinds unchanged. */
function baseName(item: DockerItem): string {
  if (item.kind !== "image") return item.name;
  const leaf = item.name.split("/").pop() ?? "";
  const colon = leaf.indexOf(":");
  return colon === -1 ? leaf : leaf.slice(0, colon);
}

/** Compose names: image/container `<project>-<service>…`, volume `<project>_<name>`. */
function nameHasProjectPrefix(item: DockerItem, project: string): boolean {
  if (!project) return false;
  const separator = item.kind === "volume" ? "_" : "-";
  const name = baseName(item);
  return name.startsWith(project + separator) && name.length > project.length + 1;
}

/**
 * True when the item's name belongs to this worktree's Compose project and to no
 * longer folder name that shares the prefix (`foo` must not claim `foo-bar_venv`).
 */
function isOrphanNameMatch(item: DockerItem, target: DockerPruneTarget): boolean {
  const own = composeProjectName(target.worktreeFolder);
  if (!nameHasProjectPrefix(item, own)) return false;
  return !(target.otherFolders ?? [])
    .map(composeProjectName)
    .some((other) => other.length > own.length && nameHasProjectPrefix(item, other));
}

type MatchReason = Extract<DockerVerdict, "eligible (chip label)" | "eligible (orphan)" | "not ours">;

function matchReason(item: DockerItem, target: DockerPruneTarget): MatchReason {
  const labels = item.labels ?? {};
  const chip = labels[CHIP_LABEL]?.trim();
  if (chip) {
    const keys = [target.worktreeFolder, target.branch ? stripRefsHeads(target.branch) : ""];
    return keys.includes(stripRefsHeads(chip)) ? "eligible (chip label)" : "not ours";
  }
  // Orphans need the per-worktree default name; a Compose label alone would also
  // claim explicitly named shared volumes/images that the worktree's Compose created.
  if (!isOrphanNameMatch(item, target)) return "not ours";
  const composeProject = labels[COMPOSE_PROJECT_LABEL];
  return composeProject === undefined || composeProject === composeProjectName(target.worktreeFolder)
    ? "eligible (orphan)"
    : "not ours";
}

/**
 * Docker verdict for one item against one eligible worktree. Only rows that are not
 * `not ours` appear in the dry-run; only `eligible (…)` rows are removed on `--apply`.
 */
export function classifyDockerItem(item: DockerItem, target: DockerPruneTarget): DockerVerdict {
  const reason = matchReason(item, target);
  if (reason === "not ours") return reason;
  const labels = item.labels ?? {};
  const project = labels[PROJECT_LABEL]?.trim();
  if (project && project.toLowerCase() !== target.repo.toLowerCase()) return "skip (other project)";
  if (labels[SHARED_LABEL]?.trim().toLowerCase() === "true") return "skip (shared)";
  if (item.kind === "container" && item.running) return "skip (running)";
  return reason;
}
