// Feature slice: setup — load canonical GITHUB-PROJECTS.md template (server I/O).
import fs from "node:fs";
import path from "node:path";

function candidatePaths(): string[] {
  const cwd = process.cwd();
  const fromEnv = process.env.GITHUB_PROJECTS_TEMPLATE
    ? [path.resolve(cwd, process.env.GITHUB_PROJECTS_TEMPLATE)]
    : [];

  const fromSkills = process.env.SKILLS_DIR
    ? [
        path.join(
          path.dirname(path.resolve(cwd, process.env.SKILLS_DIR)),
          "docs",
          "project-tracking",
          "GITHUB-PROJECTS.md"
        ),
      ]
    : [];

  return [
    ...fromEnv,
    ...fromSkills,
    path.join(cwd, "../../docs/project-tracking/GITHUB-PROJECTS.md"),
    path.join(cwd, "content/GITHUB-PROJECTS.md"),
  ];
}

/** Latest Vilya template body, or null if the file is not available at runtime. */
export function loadGithubProjectsTemplate(): string | null {
  for (const filePath of candidatePaths()) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf8");
    }
  }
  return null;
}
