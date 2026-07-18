// Feature slice: setup — load the canonical GITHUB-PROJECTS.md (server I/O).
// The generator no longer fills this file; the tool offers it for download as
// the process canon that slim product configs point at.
import fs from "node:fs";
import path from "node:path";

/**
 * Resolve candidate template paths.
 * Prefer `content/GITHUB-PROJECTS.md` (ships with the app) over monorepo-relative
 * paths so Railway/Nixpacks does not depend on ../../docs existing at runtime.
 * `GITHUB_PROJECTS_TEMPLATE` still wins for local overrides.
 */
function candidatePaths(
  cwd: string,
  env: NodeJS.ProcessEnv | Record<string, string | undefined>
): string[] {
  const fromEnv = env.GITHUB_PROJECTS_TEMPLATE
    ? [path.resolve(cwd, env.GITHUB_PROJECTS_TEMPLATE)]
    : [];

  const bundled = path.join(cwd, "content", "GITHUB-PROJECTS.md");

  const fromSkills = env.SKILLS_DIR
    ? [
        path.join(
          path.dirname(path.resolve(cwd, env.SKILLS_DIR)),
          "docs",
          "project-tracking",
          "GITHUB-PROJECTS.md"
        ),
      ]
    : [];

  return [
    ...fromEnv,
    bundled,
    ...fromSkills,
    path.join(cwd, "../../docs/project-tracking/GITHUB-PROJECTS.md"),
  ];
}

/** Latest Vilya template body, or null if the file is not available at runtime. */
export function loadGithubProjectsTemplate(
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
