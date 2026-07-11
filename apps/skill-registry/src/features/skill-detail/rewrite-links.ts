// Feature slice: skill-detail. Skill bodies cross-reference siblings with
// repo-relative links (`../<slug>/SKILL.md`); on the site those should
// navigate to the sibling's detail page, not the raw file.

const SIBLING_SKILL_HREF = /href="\.\.\/([A-Za-z0-9_-]+)\/SKILL\.md"/g;

export function rewriteSkillLinks(html: string): string {
  return html.replace(SIBLING_SKILL_HREF, 'href="/skills/$1"');
}
