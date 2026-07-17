// Post-build regression scan for #96: Turbopack/SWC drops the leading space of
// a JSXText segment that contains an HTML entity, so `</code>` can render
// jammed against the next word even when the source line has a space (#88).
// The bug only exists in Turbopack-compiled output, so we scan the prerendered
// HTML in .next/server/app rather than re-rendering components in a test.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const htmlRoot = path.join(appRoot, ".next", "server", "app");

// /, /setup, /flows, /differences, /night-shift, /skills, 10× /skills/<name>.
// Fewer scanned files than this means routes silently stopped prerendering —
// fail rather than shrink coverage.
const MIN_PAGES = 16;

const JAMMED = /<\/code>(?=[A-Za-z0-9(])/g;
const CONTEXT = 60;

if (!fs.existsSync(htmlRoot)) {
  console.error(
    `scan-code-spacing: missing ${path.relative(appRoot, htmlRoot)} — run after \`next build\``
  );
  process.exit(1);
}

const htmlFiles = fs
  .readdirSync(htmlRoot, { recursive: true })
  .filter((f) => f.endsWith(".html"))
  .map((f) => path.join(htmlRoot, f));

const hits = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(JAMMED)) {
    const start = Math.max(0, match.index - CONTEXT);
    const snippet = html
      .slice(start, match.index + "</code>".length + CONTEXT)
      .replace(/\s+/g, " ");
    hits.push({ file: path.relative(appRoot, file), snippet });
  }
}

if (hits.length > 0) {
  console.error(
    `scan-code-spacing: ${hits.length} inline <code> span(s) jammed against the next word:`
  );
  for (const { file, snippet } of hits) {
    console.error(`  ${file}\n    …${snippet}…`);
  }
  console.error(
    'scan-code-spacing: fix with an explicit {" "} after the <code> element (see #88/#96).'
  );
  process.exit(1);
}

if (htmlFiles.length < MIN_PAGES) {
  console.error(
    `scan-code-spacing: only ${htmlFiles.length} prerendered page(s) found, expected at least ${MIN_PAGES} — did routes stop prerendering?`
  );
  process.exit(1);
}

console.log(
  `scan-code-spacing: ${htmlFiles.length} prerendered pages scanned, 0 jammed <code> spans`
);
