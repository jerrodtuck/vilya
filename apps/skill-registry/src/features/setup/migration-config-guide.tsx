// Feature slice: setup — illustrative config teaching, not a migration runner.
export const MIGRATION_CONFIG_EXAMPLE = `## Repo config
| Key | Value | How to get it |
| --- | --- | --- |
| **Migration tool** | Drizzle — only if configured in this repo | Inspect the actual repo tooling and installed version. |
| **Migration command** | Pending — migration runner not implemented | Verify the existing reviewed application script before recording a command. |
| **Migration status** | Pending — link the owning runner/baseline issue here | Replace this text with the real owning issue and readiness/baseline evidence. |`;

export function MigrationConfigGuide() {
  return (
    <section aria-labelledby="migration-config-guide">
      <h3 id="migration-config-guide">Where migration settings belong</h3>
      <p>
        Open the <b>product repo&apos;s</b>{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>. Add <b>Migration tool</b>,{" "}
        <b>Migration command</b> and <b>Migration status</b> to its <b>Repo config</b>{" "}
        table near <b>Test command</b> / <b>Manual smoke</b>. They do not belong in
        Status option IDs, Area labels, user-global skills or copied process prose.
      </p>
      <p><b>Illustrative INCOMPLETE excerpt — not a complete product config.</b>{" "}
        Copy these three rows into the existing table; retain all other product settings.</p>
      <pre aria-label="Illustrative incomplete migration config Markdown">{MIGRATION_CONFIG_EXAMPLE}</pre>
      <p>
        Use the repo&apos;s actual migration tool; Next.js does not imply Drizzle.
        Record an exact existing, reviewed application script only after verifying
        the runner, necessary working directory and intended target. A suggested npm
        command is not an implemented runner. Keep an unimplemented runner pending;
        replace the status placeholder with the real owning runner/baseline issue,
        readiness and baseline constraints. This excerpt supplies no executable command
        or project readiness claim.
      </p>
      <p>
        In <b>Regenerate</b>, paste the existing config, edit these fields and save the
        generated config-only file to the product&apos;s{" "}
        <code>docs/project-tracking/GITHUB-PROJECTS.md</code>. Check the complete output
        before replacing the file. Blank means unknown. Only after verifying there is
        no application database, record <code>none — no application database</code>{" "}
        and explained <code>n/a — no application database</code> values.
      </p>
      <p>
        Read the single{" "}
        <a href="https://github.com/jerrodtuck/vilya/blob/master/docs/project-tracking/GITHUB-PROJECTS.md#database-migrations">database migration policy</a>{" "}
        for safety requirements. This teaching and review do not authorize database execution.
      </p>
    </section>
  );
}
