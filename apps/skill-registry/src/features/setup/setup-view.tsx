// Feature slice: setup — install + per-repo guide (server component).
import { GithubProjectsTool } from "./github-projects-tool";
import { loadGithubProjectsTemplate } from "./load-github-projects-template";
import { PlatformToggle } from "./platform-toggle";

const STEPS: { text: React.ReactNode; sub?: React.ReactNode }[] = [
  {
    text: (
      <>
        Add <code>docs/project-tracking/GITHUB-PROJECTS.md</code> to the repo
        and fill the <b>Repo config</b> block.
      </>
    ),
    sub: (
      <>
        owner · repo · project # · project id · status field + option ids ·
        stack · crucible variant · test command · default branch · your{" "}
        <code>area:*</code> labels — or use <b>Regenerate GITHUB-PROJECTS.md</b>{" "}
        below to fill the latest template from a paste / short form
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
        Add the two autonomy labels: <code>auto:ready</code> (safe for
        night-shift) and <code>needs:decision</code> (the loop sets this at a
        fork).
      </>
    ),
  },
];

const CHIP_STEPS: { text: React.ReactNode; sub?: React.ReactNode }[] = [
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
        There is no permission rule to add:{" "}
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
        <code>archive_session</code>); periodic <code>/prune --apply</code>{" "}
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
        folder or the local branch. Run <code>/prune</code>{" "}
        (dry-run) → <code>/prune --apply</code>{" "}
        after a merge batch, not per merge.
      </>
    ),
    sub: (
      <>
        The session-liveness gate makes this safe: live / non-archived
        sessions are skipped automatically.
      </>
    ),
  },
];

function Steps({
  steps,
}: {
  steps: { text: React.ReactNode; sub?: React.ReactNode }[];
}) {
  return (
    <div className="setupsteps">
      {steps.map((s, i) => (
        <div className="step" key={i}>
          <span className="n">{i + 1}</span>
          <span className="t">
            {s.text}
            {s.sub ? <small>{s.sub}</small> : null}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SetupView() {
  const templateMarkdown = loadGithubProjectsTemplate();

  return (
    <>
      <div className="eyebrow">Install once, add a config per repo</div>
      <h1>Setup</h1>
      <p className="lead">
        The model: skills live at the <b>user level</b> (installed once, shared
        across every project); the only thing each repo carries is one config
        file. That&apos;s what all the generalization work bought — skills with
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
            project #, ids, stack, labels, test command, crucible variant. The
            single seam.
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

      <h2>Per-repo setup (one-time)</h2>
      <Steps steps={STEPS} />

      <h2>Regenerate GITHUB-PROJECTS.md</h2>
      <GithubProjectsTool templateMarkdown={templateMarkdown} />

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
        <code>crucible-blazor</code>, test command <code>dotnet test</code>.
        Next.js repo → <code>crucible-nextjs</code>, test command{" "}
        <code>npm test &amp;&amp; npm run build</code>. Both go in the
        repo&apos;s config block.
      </div>

      <h2>Plan → execute (models)</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Not stored in <code>GITHUB-PROJECTS.md</code> — pickers differ across
        Cursor and Claude Code, and preferences change often.{" "}
        <code>/start-feature</code> plans first on your <b>planning model</b>,
        then asks you to switch to an <b>execution model</b> before coding
        (daytime). Skills cannot flip the picker. Cursor Plan mode / CLI{" "}
        <code>--mode=plan</code> are optional helpers, not the contract.
        Night-shift / Actions stay on one model for the whole unattended run
        (planning already locked via the issue + <code>auto:ready</code>).
      </p>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        <b>
          Claude Code — <code>opusplan</code> does not automate this.
        </b>{" "}
        We tried pairing it with env overrides (
        <code>ANTHROPIC_DEFAULT_OPUS_MODEL</code> /{" "}
        <code>ANTHROPIC_DEFAULT_SONNET_MODEL</code> in{" "}
        <code>.claude/settings.local.json</code>) to get a Fable plan → Sonnet
        execute split inside one session. It did not reliably drive plan→execute
        in our chip flow, so treat it as unproven — don&apos;t rely on it.
      </p>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        <b>You don&apos;t need it — the chip flow already is the split.</b>{" "}
        Model is read at <b>session startup</b> and fixed for that session, and
        the chip flow puts plan and execute in <b>different sessions</b>:
        planning happens orchestrator-side (<code>/start-feature</code> in the
        main clone, on whatever the operator picked via <code>/model</code> —
        e.g. Fable), and the chip is a fresh session that inherits its model
        from the <code>.claude/settings.local.json</code> copied into its
        worktree via <code>.worktreeinclude</code>. Set that file&apos;s{" "}
        <code>model</code> to your <b>execution model</b>:
      </p>
      <pre>{`{
  "model": "claude-sonnet-5"
}`}</pre>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Result: <b>Fable plans → Sonnet executes</b>, with no mid-session
        switch and no pause — the model boundary is the dispatch boundary. One
        manual step remains: the orchestrator&apos;s own session also starts on
        that file&apos;s model, so run <code>/model claude-fable-5</code> once
        per orchestrator session. The <code>/start-feature</code>{" "}
        stop-for-model-switch only applies to single-session work where one
        session both plans and implements.
      </p>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        <b>All of the above is Claude Code only.</b>{" "}
        <code>.claude/settings.local.json</code>, <code>/model</code>, and{" "}
        <code>.worktreeinclude</code> are Claude Code mechanisms — Cursor reads
        none of them. In <b>Cursor</b>, the IDE model is chosen per
        conversation in the chat&apos;s model dropdown (planning and execution
        alike), so the plan→execute switch there is the manual hand-switch{" "}
        <code>/start-feature</code> describes. Cursor has no repo-file-based
        model config — Cloud Agents take a <code>model.id</code> per dispatch
        in <code>POST /v1/agents</code>, falling back to your user default →
        team default → system default, all account-level. If you run both
        tools on one repo, set the model in each tool separately; neither
        inherits from the other.
      </p>

      <h2>Background sessions (chips) — one-time setup</h2>
      <p className="muted">
        One contract to know and two switches, set once, make the chip
        lifecycle run unattended (Claude Code Desktop only): completion
        reports land as issue comments, worktrees release on merge, and
        cleanup collapses to a quick periodic prune.
      </p>
      <Steps steps={CHIP_STEPS} />

      <h2>Shared files across worktrees</h2>
      <p className="muted" style={{ lineHeight: 1.55 }}>
        Product <code>GITHUB-PROJECTS.md</code> is <b>read-only on feature
        branches</b> unless the issue is about changing config. Specs carry{" "}
        <code>Created</code> / <code>Last updated</code> dates.{" "}
        <code>DECISIONS.md</code> is append-newest-at-top — grep to read, do not
        load end-to-end. Full table lives in that config file.
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
        review runs in brownfield mode. See <a href="/flows">Flows</a>.
      </div>
    </>
  );
}
