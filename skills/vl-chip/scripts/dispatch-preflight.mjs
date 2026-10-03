import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const fail = (message) => { throw new Error(message); };
function identity(repo, number) {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || !/^[1-9]\d*$/.test(String(number))) fail("Invalid intended repo/issue");
  return { repo: repo.toLowerCase(), number: Number(number) };
}

// Accept a successful current CLI/REST issue read; labels and board state never substitute.
export function requireOpen(issue, repo, number) {
  const intended = identity(repo, number);
  if (!issue || typeof issue !== "object" || issue.pull_request) fail("Expected an issue response");
  const url = issue.html_url ?? issue.url;
  let parsed;
  try { parsed = new URL(url); } catch { fail("Missing issue identity URL"); }
  if (parsed.protocol !== "https:" || parsed.hostname !== "github.com" || parsed.port || parsed.username || parsed.password ||
      parsed.pathname.toLowerCase() !== `/${intended.repo}/issues/${intended.number}` ||
      parsed.search || parsed.hash || issue.number !== intended.number) fail("Wrong issue identity");
  if (typeof issue.state !== "string" || issue.state.toUpperCase() !== "OPEN") fail("Issue is not confirmed OPEN");
  return issue;
}

export function referencesIssue(message, repo, number) {
  const intended = identity(repo, number);
  // Consume entire URLs and qualified references first; their #N fragments must
  // never be reinterpreted as local references to this repository.
  const tokens = message.match(/https?:\/\/[^\s<>"'`]+|(?<![\w./-])(?:[\w.-]+\/)?[\w.-]+#\d+\b|(?<![\w/#.-])#\d+\b/g) ?? [];
  return tokens.some(token => {
    if (token.startsWith("http")) {
      let url;
      try { url = new URL(token.replace(/[),.;\]]+$/, "")); } catch { return false; }
      return url.protocol === "https:" && url.hostname === "github.com" && !url.port && !url.username && !url.password &&
        url.pathname.toLowerCase() === `/${intended.repo}/issues/${intended.number}`;
    }
    if (token.startsWith("#")) return token === `#${intended.number}`;
    return token.toLowerCase() === `${intended.repo}#${intended.number}`;
  });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", maxBuffer: 4 * 1024 * 1024, windowsHide: true });
  if (result.error || result.status !== 0) fail(`${command} preflight read failed`);
  return result.stdout.trim();
}

export function checkBase(repo, number, brief, originalStart, cwd = process.cwd()) {
  identity(repo, number);
  // Require recorded immutable commits: never substitute today's HEAD on recovery.
  for (const sha of [brief, originalStart]) if (!/^(?:[a-f\d]{40}|[a-f\d]{64})$/i.test(sha ?? "")) fail("Record full brief and original-start commit IDs first");
  if (run("git", ["rev-parse", "--is-shallow-repository"], cwd) !== "false") fail("Incomplete history: reconcile before implementation");
  const base = run("git", ["rev-parse", "--verify", `${brief}^{commit}`], cwd);
  const start = run("git", ["rev-parse", "--verify", `${originalStart}^{commit}`], cwd);
  if (base === start) return { relation: "equal", base, originalStart: start, reviewed: 0 };
  const ancestry = spawnSync("git", ["merge-base", "--is-ancestor", base, start], { cwd, encoding: "utf8", windowsHide: true });
  if (ancestry.error || ![0, 1].includes(ancestry.status)) fail("Ancestry lookup failed");
  if (ancestry.status === 1) fail("Brief base is not an ancestor of original start: reconcile divergence");
  const range = `${base}..${start}`;
  const commits = run("git", ["rev-list", "--max-count=257", range], cwd).split("\n").filter(Boolean);
  if (commits.length > 256) fail("Intervening range exceeds 256 commits: bounded review incomplete");
  const messages = run("git", ["log", "--format=%B%x00", range], cwd);
  if (referencesIssue(messages, repo, number)) fail("Exact issue reference in intervening commits: possible duplicate; reconcile substance before implementation");
  return { relation: "ancestor", base, originalStart: start, reviewed: commits.length };
}

export function readIssue(repo, number, cwd = process.cwd(), read = run) {
  identity(repo, number);
  // This replaces the existing brief/board read; it is not an additional request.
  const json = read("gh", ["issue", "view", String(number), "--repo", repo, "--json", "body,comments,labels,projectItems,state,number,url"], cwd);
  let issue;
  try { issue = JSON.parse(json); } catch { fail("Malformed issue response"); }
  return requireOpen(issue, repo, number);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const [mode, repo, number, brief, originalStart] = process.argv.slice(2);
    const result = mode === "issue" ? readIssue(repo, number) : mode === "base" ? checkBase(repo, number, brief, originalStart) : fail("Use issue <owner/repo> <number> or base <owner/repo> <number> <brief-sha> <original-start-sha>");
    process.stdout.write(JSON.stringify(result) + "\n");
  } catch (error) {
    process.stderr.write(`STOP: ${error.message}\n`);
    process.exitCode = 1;
  }
}
