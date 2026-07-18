// Feature slice: version-diff UI (server component). Side-by-side compare.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVersionDiff } from "./version-diff";
import type { SkillVersion } from "@/shared/skills/types";

export function DiffView({
  slug,
  from,
  to,
}: {
  slug: string;
  from: string;
  to: string;
}) {
  const diff = getVersionDiff(slug, from, to);
  if (!diff) notFound();
  const { skill, rows, stats } = diff;
  const name = skill.frontmatter.name ?? skill.slug;

  return (
    <>
      <p className="crumb">
        <Link href={`/skills/${skill.slug}`}>← {name}</Link>
      </p>
      <div className="eyebrow">version diff</div>
      <h1 className="mono">{name}</h1>
      <p className="lead">
        <span className="added">+{stats.added}</span>{" "}
        <span className="removed">−{stats.removed}</span> across{" "}
        {rows.length} aligned line{rows.length === 1 ? "" : "s"}.
      </p>

      <div className="diffcommits">
        <CommitCard label="from" v={diff.from} missing={diff.fromMissing} />
        <CommitCard label="to" v={diff.to} missing={diff.toMissing} />
      </div>

      {rows.length === 0 ? (
        <p className="muted">No changes between these two versions.</p>
      ) : (
        <div className="diffwrap">
          <table className="diff">
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className={r.kind}>
                  <td className="ln">{r.left?.lineNo ?? ""}</td>
                  <td className={`code ${r.left ? "" : "void"}`}>
                    {r.left?.text ?? ""}
                  </td>
                  <td className="ln">{r.right?.lineNo ?? ""}</td>
                  <td className={`code ${r.right ? "" : "void"}`}>
                    {r.right?.text ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CommitCard({
  label,
  v,
  missing,
}: {
  label: string;
  v: SkillVersion;
  missing: boolean;
}) {
  return (
    <div className="commitcard">
      <div className="k">{label}</div>
      <code className="hash">{v.shortHash}</code>
      <span className="subj">{v.subject}</span>
      <span className="meta">
        {new Date(v.date).toLocaleDateString()} · {v.author}
        {missing ? " · file not present at this commit" : ""}
      </span>
    </div>
  );
}
