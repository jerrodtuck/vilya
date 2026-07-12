// Copy the canonical monorepo template into the app so Railway/Nixpacks
// (and any non-monorepo start) can load it without ../../docs path luck.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(
  appRoot,
  "../../docs/project-tracking/GITHUB-PROJECTS.md"
);
const destDir = path.join(appRoot, "content");
const dest = path.join(destDir, "GITHUB-PROJECTS.md");

if (!fs.existsSync(source)) {
  if (fs.existsSync(dest)) {
    console.log(
      `sync-github-projects-template: source missing; keeping bundled ${path.relative(appRoot, dest)}`
    );
    process.exit(0);
  }
  console.error(
    `sync-github-projects-template: missing ${source} and no bundled copy at ${dest}`
  );
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log(
  `sync-github-projects-template: ${path.relative(appRoot, source)} → ${path.relative(appRoot, dest)}`
);
