// Feature slice: night-shift — operator-band copy (Setup / Run / Verify / Troubleshoot).
// Procedure text lives here so tests can lock the Verify + Troubleshoot contracts;
// the pipeline map stages in data.ts stay the theory ledger.

export type TroubleshootRow = {
  symptom: string;
  fix: string;
};

/** Checks that must pass before you trust a dispatch. Fails → Troubleshoot. */
export const VERIFY_CHECKS = [
  "Runner shows Online under the repo's Settings → Actions → Runners.",
  "Runner labels include every label in job runs-on (self-hosted, windows).",
  "Repo secret CLAUDE_CODE_OAUTH_TOKEN is set (from claude setup-token).",
  "Claude GitHub App is installed on the repo or org.",
  "A workflow_dispatch run leaves Queued then picks up (not stuck Queued forever).",
] as const;

/**
 * Bring-up walls promoted from the Failure map stage into a page-level table.
 * Failure stage on the map remains the visual ledger — do not delete it there.
 */
export const TROUBLESHOOT_ROWS: TroubleshootRow[] = [
  {
    symptom: "Job Queued forever",
    fix: "Label mismatch — runs-on must be a subset of the runner's labels. Edit labels or re-register.",
  },
  {
    symptom: "execvpe(/bin/bash) failed / WSL bash stub",
    fix: "Workflow must pin Git Bash (GITHUB_PATH + CLAUDE_CODE_GIT_BASH_PATH). Regenerated template includes the pin.",
  },
  {
    symptom: "OIDC / claude[bot] writes fail",
    fix: "Workflow needs id-token: write; Claude GitHub App must be installed on the repo or org.",
  },
  {
    symptom: "Windows CLI installer errors",
    fix: "Unsupported path — set path_to_claude_code_executable to a pre-installed claude.exe.",
  },
  {
    symptom: "Run aborts mid-feature (turn budget)",
    fix: "Guard with job timeout-minutes; keep --max-turns high (tight caps abort before push).",
  },
  {
    symptom: "Expired OAuth / mysterious auth failures overnight",
    fix: "Refresh with claude setup-token and update the repo secret. Shared-profile caveat: a long-lived run.cmd runner process uses ~/.claude on the box — a dead interactive session can break overnight even when the secret looks fine.",
  },
  {
    symptom: 'Session or branch "missing" in the daytime clone',
    fix: "Actions cwd is the runner _work checkout. Sessions and WIP branches live under _work, not your daytime path, until push.",
  },
];
