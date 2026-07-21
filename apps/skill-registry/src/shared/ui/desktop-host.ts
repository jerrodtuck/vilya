// Shared UI: Claude Code | Cursor desktop host id (?host=cc|cursor).
// Used by /differences and /orch so the query param stays one dialect.

export type DesktopHostId = "cc" | "cursor";

/** localStorage key — shared so /differences and /orch remember the same desktop. */
export const DESKTOP_HOST_STORAGE_KEY = "vilya-diff-host";

export function parseDesktopHost(value: string | null): DesktopHostId | null {
  if (value === "cc" || value === "claude") return "cc";
  if (value === "cursor" || value === "cur") return "cursor";
  return null;
}

export const DESKTOP_HOST_LABEL: Record<DesktopHostId, string> = {
  cc: "Claude Code",
  cursor: "Cursor",
};
