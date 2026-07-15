// Copy the canonical monorepo skills/ tree into the app so Railway/Nixpacks
// (and any non-monorepo start) can load them without ../../skills path luck.
// Mirrors sync-github-projects-template.mjs — same reason, same shape.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(appRoot, "../../skills");
const dest = path.join(appRoot, "content", "skills");

if (!fs.existsSync(source)) {
  if (fs.existsSync(dest)) {
    console.log(
      `sync-skills: source missing; keeping bundled ${path.relative(appRoot, dest)}`
    );
    process.exit(0);
  }
  console.error(`sync-skills: missing ${source} and no bundled copy at ${dest}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

const slugs = fs
  .readdirSync(source, { withFileTypes: true })
  .filter(
    (d) => d.isDirectory() && fs.existsSync(path.join(source, d.name, "SKILL.md"))
  )
  .map((d) => d.name)
  .sort();

for (const slug of slugs) {
  fs.mkdirSync(path.join(dest, slug), { recursive: true });
  fs.copyFileSync(
    path.join(source, slug, "SKILL.md"),
    path.join(dest, slug, "SKILL.md")
  );
}

console.log(
  `sync-skills: ${path.relative(appRoot, source)} → ${path.relative(appRoot, dest)} (${slugs.length} skills: ${slugs.join(", ")})`
);
