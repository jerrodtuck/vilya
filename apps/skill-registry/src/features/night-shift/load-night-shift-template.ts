// Feature slice: night-shift — load portable workflow template (server I/O).
import fs from "node:fs";
import path from "node:path";

function candidatePaths(
  cwd: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined>
): string[] {
  const fromEnv = env.NIGHT_SHIFT_TEMPLATE
    ? [path.resolve(cwd, env.NIGHT_SHIFT_TEMPLATE)]
    : [];

  return [
    ...fromEnv,
    path.join(cwd, "content", "night-shift.yml"),
    path.join(cwd, "../../docs/project-tracking/templates/night-shift.yml"),
  ];
}

/** Portable night-shift.yml body with __MARKERS__, or null if unavailable. */
export function loadNightShiftTemplate(
  cwd: string = process.cwd(),
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env
): string | null {
  for (const filePath of candidatePaths(cwd, env)) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }
  return null;
}
