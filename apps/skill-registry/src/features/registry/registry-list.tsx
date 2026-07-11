// Feature slice: registry UI (server component).
import Link from "next/link";
import { getGroupedSkills } from "./registry";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  stackOf,
  invocationOf,
} from "@/shared/skills/meta";

export function RegistryList() {
  const groups = getGroupedSkills();
  const total = CATEGORY_ORDER.reduce((n, c) => n + groups[c].length, 0);

  return (
    <>
      <div className="eyebrow">Git-native · the repo is the store</div>
      <h1>Skill Registry</h1>
      <p className="lead">
        {total} skills, read straight from their <code>SKILL.md</code> files.
        Every version is a git commit; edits happen in your editor and flow
        through the loop. Click any skill for its frontmatter, body, and history.
      </p>

      {CATEGORY_ORDER.map((cat) =>
        groups[cat].length === 0 ? null : (
          <section key={cat}>
            <h2>{CATEGORY_LABELS[cat]}</h2>
            <div className="cards">
              {groups[cat].map((skill) => (
                <Link
                  key={skill.slug}
                  className="card"
                  href={`/skills/${skill.slug}`}
                >
                  <div className="card-head">
                    <span className="nm">{skill.frontmatter.name ?? skill.slug}</span>
                    <span className="badge">{stackOf(skill.slug)}</span>
                  </div>
                  <p className="desc">{skill.frontmatter.description}</p>
                  <div className="metarow">
                    <span className="tag">{invocationOf(skill)}</span>
                    {skill.frontmatter["disable-model-invocation"] ? (
                      <span className="tag manual">disable-model-invocation</span>
                    ) : null}
                    {Array.isArray(skill.frontmatter.references) &&
                    skill.frontmatter.references.length > 0 ? (
                      <span className="tag">
                        {skill.frontmatter.references.length} references
                      </span>
                    ) : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )
      )}
    </>
  );
}
