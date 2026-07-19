// Feature slice: night-shift — Setup once / Run tonight step copy (JSX for links).
import Link from "next/link";
import type { OperatorStep } from "./operator-steps";

export const SETUP_ONCE_STEPS: OperatorStep[] = [
  {
    text: (
      <>
        Confirm the product repo is <b>private</b>, has skills installed, autonomy
        labels (<code>auto:ready</code>, <code>needs:decision</code>), and a filled{" "}
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
        path) and commit it to <code>.github/workflows/</code>.
      </>
    ),
    expect: (
      <>
        Expected: Actions lists the <code>night-shift</code> workflow; template
        pins Git Bash so WSL stubs do not steal <code>bash</code>.
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
        Label well-specified issues <code>auto:ready</code>. No label, no work.
      </>
    ),
    expect: (
      <>
        Expected: eligible issues only — skip <code>needs:decision</code> and{" "}
        <code>type:epic</code>.
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
        answer forks and drop <code>needs:decision</code> when you decide.
      </>
    ),
    expect: (
      <>
        Expected: PRs opened overnight stay unmerged until you review — night-shift
        never merges.
      </>
    ),
  },
];
