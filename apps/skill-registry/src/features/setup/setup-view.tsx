// Feature slice: setup — install + per-repo guide (server component).
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
        <code>area:*</code> labels
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

export function SetupView() {
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
            All seven skills, installed once in your global skills dir. Same
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
        <b>One body, both tools.</b> Because the frontmatter that matters is
        shared, the same <code>SKILL.md</code> is what you install in both
        places. The repo&apos;s <code>scripts/install-skills.(sh|ps1)</code>{" "}
        sync script keeps <code>~/.claude/skills</code> and{" "}
        <code>~/.cursor/skills</code> pointed at one source —{" "}
        <code>skills/</code> in this repo.
      </div>

      <h2>Per-repo setup (one-time)</h2>
      <div className="setupsteps">
        {STEPS.map((s, i) => (
          <div className="step" key={i}>
            <span className="n">{i + 1}</span>
            <span className="t">
              {s.text}
              {s.sub ? <small>{s.sub}</small> : null}
            </span>
          </div>
        ))}
      </div>

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

      <div className="pagefoot">
        Not started with VSA? Don&apos;t rewrite — add the slice folder, route
        new work through slices, migrate the rest as an Epic. The Crucible
        review runs in brownfield mode. See <a href="/flows">Flows</a>.
      </div>
    </>
  );
}
