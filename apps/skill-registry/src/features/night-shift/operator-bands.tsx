// Feature slice: night-shift — Setup once / Run tonight step copy (JSX for links).
import Link from "next/link";
import type { OperatorStep } from "./operator-steps";

export const SETUP_ONCE_STEPS: OperatorStep[] = [
  {
    text: (
      <>
        Confirm the product repo is <b>private</b>, has skills installed, autonomy
        labels (<code>night-shift:ready</code>, <code>plan:ready</code>,{" "}
        <code>night-shift:chain</code>, <code>needs:decision</code>), and a filled{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>.
      </>
    ),
    expect: (
      <>
        Expected: <Link href="/setup">Setup</Link> already done for this product —
        night-shift only adds the overnight runner path.
      </>
    ),
  },
  {
    text: (
      <>
        Register a self-hosted runner on this repo: separate folder, labels{" "}
        <code>self-hosted</code> + <code>windows</code>. Bring-up with{" "}
        <code>.\run.cmd</code> (foreground); always-on via <code>.\svc.cmd</code>{" "}
        when that script exists.
      </>
    ),
    expect: (
      <>
        Expected: Settings → Actions → Runners shows the box <b>Online</b> with
        those labels.
      </>
    ),
  },
  {
    text: (
      <>
        Generate <code>night-shift.yml</code> below (repo + <code>claude.exe</code>{" "}
        path) and commit it to <code>.github/workflows/</code>. For daisy chains,
        also copy{" "}
        <code>docs/project-tracking/templates/chain-promote.yml</code> →{" "}
        <code>.github/workflows/chain-promote.yml</code> (default{" "}
        <code>GITHUB_TOKEN</code> + <code>issues: write</code> is enough — no Claude
        secret).
      </>
    ),
    expect: (
      <>
        Expected: Actions lists <code>night-shift</code> (and{" "}
        <code>chain-promote</code> when you run chains); night-shift template pins
        Git Bash so WSL stubs do not steal <code>bash</code>.
      </>
    ),
  },
  {
    text: (
      <>
        Add repo secret <code>CLAUDE_CODE_OAUTH_TOKEN</code> from{" "}
        <code>claude setup-token</code> (Max/Pro). Install the{" "}
        <b>Claude GitHub App</b> on the repo or org.
      </>
    ),
    expect: (
      <>
        Expected: secret present; App installation visible — OIDC can mint{" "}
        <code>claude[bot]</code> write tokens (<code>id-token: write</code> is
        already in the template).
      </>
    ),
  },
  {
    text: (
      <>
        Keep <b>Bypass permissions</b> only in the overnight launcher — not in
        your interactive user defaults.
      </>
    ),
    expect: (
      <>
        Expected: daytime sessions still prompt; the Actions job uses{" "}
        <code>--permission-mode bypassPermissions</code> unattended.
      </>
    ),
  },
];

export const RUN_TONIGHT_STEPS: OperatorStep[] = [
  {
    text: (
      <>
        Prep tonight&apos;s head: <code>plan:ready</code> then{" "}
        <code>night-shift:ready</code>. Both labels required — no labels, no work.
        For a path, see <a href="#daisy-chains">Daisy chains</a> — successors stay
        on <code>night-shift:chain</code>, not <code>night-shift:ready</code>.
      </>
    ),
    expect: (
      <>
        Expected: eligible issues only —{" "}
        <code>night-shift:ready</code> ∧ <code>plan:ready</code>; skip{" "}
        <code>needs:decision</code> and <code>type:epic</code>. Chain waiters are
        not eligible until <code>chain-promote</code> flips them.
      </>
    ),
  },
  {
    text: (
      <>
        Start Mode A: <b>Actions → night-shift → Run workflow</b>, or{" "}
        <code>gh workflow run night-shift</code>. Cron in the template stays
        commented until you uncomment it on the default branch.
      </>
    ),
    expect: (
      <>
        Expected: run appears Queued, then the Online runner picks it up. Stuck
        Queued → <a href="#troubleshoot">Troubleshoot</a>.
      </>
    ),
  },
  {
    text: (
      <>
        Morning: triage the report; merge Ready PRs with <code>/merge-pr</code>;
        answer forks and drop <code>needs:decision</code> when you decide. Closing
        a blocker lets <code>chain-promote</code> ready the next link for the
        following night.
      </>
    ),
    expect: (
      <>
        Expected: PRs opened overnight stay unmerged until you review — night-shift
        never merges and never promotes successors.
      </>
    ),
  },
];

/** Short teach: chain prep → merge → promote → next night (Option 3). */
export const DAISY_CHAIN_STEPS: OperatorStep[] = [
  {
    text: (
      <>
        <b>Prep</b> — set native <b>blocked-by</b> on each successor; label them{" "}
        <code>night-shift:chain</code>; ensure <code>plan:ready</code>
        {" "}
        before you expect promote→ready. Only tonight&apos;s head gets{" "}
        <code>night-shift:ready</code>.
      </>
    ),
    expect: (
      <>
        Expected: successors wait on <code>night-shift:chain</code>; night-shift
        will not pick them. No body-text <code>Blocked-by:</code> convention.
      </>
    ),
  },
  {
    text: (
      <>
        <b>Merge</b> — after the overnight PR is Ready, squash-merge via{" "}
        <code>/merge-pr</code> (closes the issue). Night-shift never merges.
      </>
    ),
    expect: (
      <>
        Expected: closing the blocker fires <code>issues: closed</code> for{" "}
        <code>chain-promote.yml</code>.
      </>
    ),
  },
  {
    text: (
      <>
        <b>Promote → next night</b> — <code>chain-promote</code> flips eligible
        dependents (<code>night-shift:chain</code> ∧ <code>plan:ready</code>, all
        blockers closed) to <code>night-shift:ready</code>. One link per merge
        cycle.
      </>
    ),
    expect: (
      <>
        Expected: the next issue is eligible for the following unattended window —
        the skill stayed dumb; the workflow owned promotion.
      </>
    ),
  },
];
