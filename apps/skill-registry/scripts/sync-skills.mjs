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

const slugs = fs
  .readdirSync(source, { withFileTypes: true })
  .filter(
    (d) => d.isDirectory() && fs.existsSync(path.join(source, d.name, "SKILL.md"))
  )
  .map((d) => d.name)
  .sort();

// Reject links before replacing the bundle: resources must stay inside the source tree.
// This avoids copying private external files or following cycles during recursive copy.
function checkTree(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`sync-skills: linked resource is not portable: ${file}`);
    if (entry.isDirectory()) checkTree(file);
    else if (!entry.isFile()) throw new Error(`sync-skills: unsupported resource: ${file}`);
  }
}
for (const slug of slugs) checkTree(path.join(source, slug));
// Do not traverse a redirected content directory or bundle root during replacement.
for (const directory of [path.dirname(dest), dest]) {
  if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) {
    throw new Error(`sync-skills: refusing linked destination: ${directory}`);
  }
}
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const slug of slugs) {
  fs.cpSync(path.join(source, slug), path.join(dest, slug), { recursive: true });
}

console.log(
  `sync-skills: ${path.relative(appRoot, source)} → ${path.relative(appRoot, dest)} (${slugs.length} skills: ${slugs.join(", ")})`
);
