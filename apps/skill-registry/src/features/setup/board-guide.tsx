// Feature slice: setup — "The board" guided section (#172, server component).
// Guided version of the canon's One-time repo setup: it links back for the
// full command sequence and covers what the canon assumes — level,
// dependencies, automations. Mover-map framing is ground truth in epic #169.
import {
  BOARD_AUTOMATIONS,
  BOARD_LEVELS,
  CANON_SETUP_URL,
  PROJECT_CREATE_COMMAND,
  PROJECT_SCOPE_COMMAND,
} from "./board-guide-data";
import { Steps, type SetupStep } from "./setup-steps";

const DEPENDENCY_STEPS: SetupStep[] = [
  {
    text: (
      <>
        Install the <b>gh CLI</b> — <code>winget install GitHub.cli</code>{" "}
        (Windows) / <code>brew install gh</code> (macOS) — then{" "}
        <code>gh auth login</code>.
      </>
    ),
  },
  {
    text: (
      <>
        <b>
          <code>{PROJECT_SCOPE_COMMAND}</code>
        </b>{" "}
        — the step everyone misses; see the note below.
      </>
    ),
  },
  {
    text: <>Nothing else.</>,
    sub: (
      <>
        <code>gh project</code> subcommands wrap the Projects v2 GraphQL API,
        so there is no separate GraphQL tooling to install (
        <code>gh api graphql</code>{" "}
        exists for exotic ops only), and jq is not
        required — the canon&apos;s commands use gh&apos;s built-in{" "}
        <code>--jq</code>.
      </>
    ),
  },
];

export function BoardGuide() {
  const user = BOARD_LEVELS.find((l) => l.id === "user")!;
  const org = BOARD_LEVELS.find((l) => l.id === "org")!;

  return (
    <>
      <h2 id="the-board">The board</h2>
      <p className="muted">
        The whole loop rides on a <b>GitHub Projects</b>{" "}
        board. This is the guided version of the canon&apos;s{" "}
        <a href={CANON_SETUP_URL}>One-time repo setup</a> — the canon keeps the
        full command sequence; this page covers the three things it assumes:
        what level the board lives at, what to install, and which automations
        to switch on.
      </p>

      <h3 className="gph3">Where the board lives — user or org, never a repo</h3>
      <p className="muted">
        Projects v2 lives on a <b>user</b> or an <b>organization</b>{" "}
        — never on a repository. GitHub&apos;s docs put it as work tracked{" "}
        <i>&quot;at the user or organization level&quot;</i>; repos{" "}
        <i>link</i>{" "}
        to a project rather than owning one (repo-owned classic projects are
        retired). So the only real question is which of the two owners:
      </p>
      <div className="split">
        <div className="lvl global">
          <h3>◆ {user.name} — current default, recommended solo</h3>
          <p>
            <code>{PROJECT_CREATE_COMMAND}</code>{" "}
            — matches the canon&apos;s
            personal-account topology: runners, OAuth token, and billing all
            personal.
          </p>
          {user.costs.map((c) => (
            <p key={c}>· {c}</p>
          ))}
        </div>
        <div className="lvl repo">
          <h3>◆ {org.name} — when an org materializes</h3>
          <p>
            Projects owned by the org (e.g. a future jestrion), with org-wide
            visibility and permissions.
          </p>
          {org.costs.map((c) => (
            <p key={c}>· {c}</p>
          ))}
        </div>
      </div>
      <div className="note teal">
        This guide documents the fork; it doesn&apos;t decide it. And the fork
        is about <b>who owns the board</b>, not how many boards —{" "}
        <b>one board per product</b> either way (canon, Model section).
      </div>

      <h3 className="gph3">Dependencies — gh CLI, and nothing else</h3>
      <Steps steps={DEPENDENCY_STEPS} />
      <div className="note">
        <b>
          The step everyone misses: <code>{PROJECT_SCOPE_COMMAND}</code>
        </b>{" "}
        — the <code>project</code> scope is <b>not</b>{" "}
        granted by a plain <code>gh auth login</code>, and every{" "}
        <code>gh project</code> command needs it. Until you run it, your first{" "}
        <code>gh project view</code> fails with a missing-scope error.
      </div>

      <h3 className="gph3">Board automations — half the mover map</h3>
      <p className="muted">
        UI path: open the project → <b>⋯</b> (top right) → <b>Workflows</b> →
        pick a workflow → <b>Edit</b> → set its filter or Status target →{" "}
        <b>Save and turn on</b>. Six switches (◆ = a mover-map transition):
      </p>
      <div className="setupsteps">
        {BOARD_AUTOMATIONS.map((a) => (
          <div className="step" key={a.workflow}>
            <span className="n">{a.moverMap ? "◆" : "·"}</span>
            <span className="t">
              <b>{a.workflow}</b> — {a.setting}
            </span>
          </div>
        ))}
      </div>
      <p className="muted">
        These switches are <b>half the mover map</b>{" "}
        — every Status move the loop doesn&apos;t make with a skill, it makes
        with one of these
        automations. The full map — seven transitions, each with a named
        mover, exactly one of them human — is featured on the{" "}
        <a href="/#mover-map">home page</a>.
      </p>
      <p className="muted">
        Board created, scope granted, automations on — the per-repo steps
        below finish the job: labels, ids, and the repo&apos;s config block.
      </p>
    </>
  );
}
