// Feature slice: setup — install + per-repo guide (server component).
import { BoardGuide } from "./board-guide";
import { GithubProjectsTool } from "./github-projects-tool";
import { loadGithubProjectsTemplate } from "./load-github-projects-template";
import { AUTONOMY_LABELS } from "./plan-execute-routing";
import { PlanExecuteSection } from "./plan-execute-section";
import { PlatformToggle } from "./platform-toggle";
import { Steps, type SetupStep } from "./setup-steps";

const [needsPlan, planReady, nightShiftReady, needsDecision] = AUTONOMY_LABELS;

const STEPS: SetupStep[] = [
  {
    text: (
      <>
        Add <code>docs/project-tracking/GITHUB-PROJECTS.md</code> to the repo —{" "}
        <b>config only</b>, plus a pointer to the process canon.
      </>
    ),
    sub: (
      <>
        owner · repo · project # · project id · status field + option ids ·
        stack · crucible variant · test command · default branch · your{" "}
        <code>area:*</code> labels — use <b>Regenerate GITHUB-PROJECTS.md</b>{" "}
        below (paste the old full copy or fill the short form; the output is
        the slim format). Process — chains, labels model, PR conventions,
        night-shift — is <b>not</b>{" "}
        copied per repo: it lives once, in Vilya&apos;s canonical file.
      </>
    ),
  },
  {
    text: (
      <>
        Create the <b>GitHub Project</b> (one per product) and enable its
        board.
      </>
    ),
  },
  {
    text: (
      <>
        Grab the id fields in one shot:
        <pre style={{ margin: "6px 0 0" }}>
          {`gh project field-list <n> --owner <owner> --format json \\
  --jq '.fields[] | select(.name=="Status") | {id, options: [.options[] | {name, id}]}'`}
        </pre>
      </>
    ),
  },
  {
    text: (
      <>
        <b>Sync labels</b> + add this repo&apos;s <code>area:*</code> slice
        labels.
      </>
    ),
  },
  {
    text: (
      <>
        Board <b>Workflows</b>: auto-add · Item added→Todo · closed→Done · PR
        merged→Done · auto-add sub-issues · reopened→In Progress.
      </>
    ),
  },
  {
    text: (
      <>
        Add the autonomy labels: <code>{needsPlan}</code> (enqueue for Planner),{" "}
        <code>{planReady}</code> (kickoff + verify plan on the issue),{" "}
        <code>{nightShiftReady}</code> (safe for unattended night-shift), and{" "}
        <code>{needsDecision}</code> (the loop sets this at a fork).
      </>
    ),
  },
];

const CHIP_STEPS: SetupStep[] = [
  {
    text: (
      <>
        <b>Know the report loop</b> — chip completion reports arrive as{" "}
        <b>issue comments</b> via <code>gh</code> (already allowed in chips —
        no prompt, attended or not), and the orchestrator picks them up with a{" "}
        <b>monitor armed in the same turn as the dispatch</b>.
      </>
    ),
    sub: (
      <>
        Mechanism differs by host: <b>Claude Code</b> arms the{" "}
        <b>Monitor tool</b>; <b>Cursor</b> arms a background shell with{" "}
        <code>notify_on_output</code> on <b>REST</b> (
        <code>pulls?head=</code> + issue comments at ≥120s, wake only on
        change — never <code>gh pr list</code> /{" "}
        <code>gh project item-list</code> / GraphQL on the hot path). The
        forbidden pattern is an <b>exit-only</b>
        {" "}
        background shell watch loop, not Cursor&apos;s notify watcher. There
        is no permission rule to add:{" "}
        <code>mcp__ccd_session_mgmt__send_message</code>{" "}
        <b>always prompts for confirmation by product contract</b> — an allow
        rule does not silence it (directly tested twice). It exists for
        attended cross-session handoffs, one approval click each — never an
        unattended report channel.
      </>
    ),
  },
  {
    text: (
      <>
        Enable <b>&quot;Auto-archive on PR close&quot;</b> (Claude Code
        Desktop settings) — when a session notices its PR closed, it archives,
        stopping the process and releasing its worktree hold. This is{" "}
        <b>best-effort</b>: it usually fires at PR close, but an idle session
        that never refreshes its PR state can be missed entirely. Archive
        stale finished sessions manually (or via{" "}
        <code>archive_session</code>); periodic <code>/vilya-prune --apply</code>{" "}
        remains the backstop that reconciles everything regardless.
      </>
    ),
    sub: (
      <>
        Timing property: archive fires at <b>PR close</b>, so pre-merge smoke
        run from the chip&apos;s worktree or session card is unaffected.
      </>
    ),
  },
  {
    text: (
      <>
        <b>Prune periodically</b> — auto-archive does not remove the worktree
        folder or the local branch. Run <code>/vilya-prune</code>{" "}
        (dry-run) → <code>/vilya-prune --apply</code>{" "}
        after a merge batch, not per merge.
      </>
    ),
    sub: (
      <>
        The session-liveness gate makes this safe: live / non-archived
        sessions are skipped automatically. On eligible rows,{" "}
        <code>--apply</code> also authorizes scoped kills of lock holders
        whose cmdline names that worktree (dry-run only previews).
      </>
    ),
  },
];

export function SetupView() {
  const canonMarkdown = loadGithubProjectsTemplate();

  return (
    <>
      <div className="eyebrow">Install once, add a config per repo</div>
      <h1>Setup</h1>
      <p className="lead">
        The model: skills live at the <b>user level</b>{" "}
        (installed once, shared across every project); the only thing each repo
        carries is one config file. That&apos;s what all the generalization
        work bought — skills with
        no hardcoded repo details can live anywhere and adapt at runtime.
      </p>

      <div className="split">
        <div className="lvl global">
          <h3>◆ User level — the skills</h3>
          <p>
            Every skill, installed once in your global skills dir. Same
            folder for every project. Update in one place.
          </p>
        </div>
        <div className="lvl repo">
          <h3>◆ Project level — the config</h3>
          <p>
            Each repo carries only{" "}
            <code>docs/project-tracking/GITHUB-PROJECTS.md</code> — owner,
            project #, ids, stack, labels, test command, crucible variant.
            Config only; process is canonical in Vilya. The single seam.
          </p>
        </div>
      </div>

      <h2>Install the skills — pick your tool</h2>
      <PlatformToggle />

      <div className="note">
        <b>One body, both tools, one install root — linked, not copied.</b>{" "}
        The frontmatter that matters is shared, and Cursor scans{" "}
        <code>~/.claude/skills</code> itself — so{" "}
        <code>scripts/install-skills.(sh|ps1)</code> links each{" "}
        <code>skills/&lt;name&gt;</code> (the source of truth) into that single
        directory as a junction/symlink, and both tools pick it up. Run it{" "}
        <b>once per machine</b> (again only if the repo moves on disk): the
        installed skill <i>is</i> the repo file, so skill merges are live on{" "}
        <code>git pull</code> — nothing to re-run. Existing copies from the old
        copy mode are migrated automatically. Installing to{" "}
        <code>~/.cursor/skills</code>{" "}
        as well would double-list every skill in Cursor&apos;s slash menu.
      </div>

      <BoardGuide />

      <h2>Per-repo setup (one-time)</h2>
      <Steps steps={STEPS} />

      <h2>Regenerate GITHUB-PROJECTS.md</h2>
      <GithubProjectsTool canonMarkdown={canonMarkdown} />

      <h2>Grab skills straight from this site</h2>
      <p className="muted">
        Every skill&apos;s canonical <code>SKILL.md</code> is served raw at{" "}
        <code>/skills/&lt;name&gt;/SKILL.md</code> — each skill&apos;s page has
        the download link and a ready-made one-liner. To pull one skill without
        cloning the repo:
      </p>
      <pre>{`curl -fLo ~/.claude/skills/<name>/SKILL.md --create-dirs https://vilya.jerrodtuck.com/skills/<name>/SKILL.md`}</pre>
      <p className="muted">
        One destination is enough — Cursor scans <code>~/.claude/skills</code>{" "}
        as a compatibility root, so both tools see it. This is the one{" "}
        <b>copy-mode exception</b>: a curl&apos;d file is a plain copy, not a
        link, so it only updates when you re-curl it (or clone the repo and run
        the install script, which migrates the copy to a link).
      </p>

      <h2>How skills find the config at runtime</h2>
      <p className="muted">
        Because skills are global, they don&apos;t use a relative path — they
        resolve the repo root, then read the config:
      </p>
      <pre>{`root=$(git rev-parse --show-toplevel)
cat "$root/docs/project-tracking/GITHUB-PROJECTS.md"`}</pre>

      <div className="note teal">
        <b>Pick your stack.</b> Blazor/.NET repo → install{" "}
        <code>vilya-crucible-blazor</code>, test command <code>dotnet test</code>.
        Next.js repo → <code>vilya-crucible-nextjs</code>, test command{" "}
        <code>npm test &amp;&amp; npm run build</code>. Python repo →{" "}
        <code>vilya-crucible-fastapi</code> / <code>vilya-crucible-django</code> /{" "}
        <code>vilya-crucible-ml</code>, test command <code>pytest</code>. Variant and
        test command both go in the repo&apos;s config block.
      </div>

      <PlanExecuteSection />

      <h2>Background sessions (chips) — one-time setup</h2>
      <p className="muted">
        One contract to know (completion reports as issue comments + a
        same-turn dispatch monitor) and two Claude Code Desktop switches
        (auto-archive, prune). Cursor uses the same report contract with a
        REST + <code>notify_on_output</code> watcher instead of the Monitor
        tool — see the first step. Worktrees release on merge; cleanup
        collapses to a quick periodic prune.
      </p>
      <Steps steps={CHIP_STEPS} />

      <h2>Shared files across worktrees</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Product <code>GITHUB-PROJECTS.md</code> is <b>read-only on feature
        branches</b> unless the issue is about changing config. Specs carry{" "}
        <code>Created</code> / <code>Last updated</code> dates.{" "}
        <code>DECISIONS.md</code>{" "}
        is append-newest-at-top — grep to read, do not load end-to-end. Full
        table lives in the process canon (Vilya&apos;s{" "}
        <code>GITHUB-PROJECTS.md</code>), not in product config files.
      </p>

      <div className="note" style={{ marginTop: 16 }}>
        Overnight runs: full per-repo checklist on{" "}
        <a href="/night-shift">Night shift</a> — Actions (canonical) or Claude
        Code Desktop routines; Bypass is set by the <b>launcher</b>, not the
        skill (and not a user-global default).
      </div>

      <div className="pagefoot">
        Not started with VSA? Don&apos;t rewrite — add the slice folder, route
        new work through slices, migrate the rest as an Epic. The Crucible
        review runs in brownfield mode. See <a href="/orch">Orch</a>.
      </div>
    </>
  );
}
