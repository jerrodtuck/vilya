// Copy portable night-shift.yml into the app so Railway/Nixpacks can load it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(
  appRoot,
  "../../docs/project-tracking/templates/night-shift.yml"
);
const destDir = path.join(appRoot, "content");
const dest = path.join(destDir, "night-shift.yml");

if (!fs.existsSync(source)) {
  if (fs.existsSync(dest)) {
    console.log(
      `sync-night-shift-template: source missing; keeping bundled ${path.relative(appRoot, dest)}`
    );
    process.exit(0);
  }
  console.error(
    `sync-night-shift-template: missing ${source} and no bundled copy at ${dest}`
  );
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(source, dest);
console.log(
  `sync-night-shift-template: ${path.relative(appRoot, source)} → ${path.relative(appRoot, dest)}`
);
