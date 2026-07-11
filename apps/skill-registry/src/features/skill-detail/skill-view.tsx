// Feature slice: skill-detail UI (server component).
import Link from "next/link";
import { marked } from "marked";
import { notFound } from "next/navigation";
import { getSkillDetail } from "./skill-detail";
import { stackOf, invocationOf } from "@/shared/skills/meta";

export function SkillView({ slug }: { slug: string }) {
  const detail = getSkillDetail(slug);
  if (!detail) notFound();
  const { skill, history } = detail;
  const fm = skill.frontmatter;
  const bodyHtml = marked.parse(skill.body, { async: false }) as string;
  const references = Array.isArray(fm.references) ? fm.references : [];

  return (
    <>
      <p className="crumb">
        <Link href="/">← Registry</Link>
      </p>
      <div className="eyebrow">{stackOf(skill.slug)}</div>
      <h1 className="mono">{fm.name ?? skill.slug}</h1>
      {fm.description ? <p className="lead">{fm.description}</p> : null}

      <div className="fmpanel">
        <div className="fmrow">
          <span className="k">invocation</span>
          <span className="v">{invocationOf(skill)}</span>
        </div>
        <div className="fmrow">
          <span className="k">disable-model-invocation</span>
          <span className="v">
            {fm["disable-model-invocation"] ? "true" : "—"}
          </span>
        </div>
        <div className="fmrow">
          <span className="k">source</span>
          <span className="v"><code>{skill.filePath}</code></span>
        </div>
        {references.length > 0 ? (
          <div className="fmrow">
            <span className="k">references</span>
            <span className="v chips">
              {references.map((r) => (
                <span key={r} className="chip">{r}</span>
              ))}
            </span>
          </div>
        ) : null}
      </div>

      <h2>Body</h2>
      <article className="md" dangerouslySetInnerHTML={{ __html: bodyHtml }} />

      <h2>Version history</h2>
      {history.length === 0 ? (
        <p className="muted">
          No git history yet — commit this skill to the repo and versions appear
          here automatically.
        </p>
      ) : (
        <ol className="history">
          {history.map((v) => (
            <li key={v.hash}>
              <code className="hash">{v.shortHash}</code>
              <span className="subj">{v.subject}</span>
              <span className="meta">
                {new Date(v.date).toLocaleDateString()} · {v.author}
              </span>
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
