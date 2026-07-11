// Raw skill source: GET /skills/<slug>/SKILL.md returns the file verbatim.
// This is what `curl` and install tooling consume, and what the skill bodies'
// relative cross-links (`../<slug>/SKILL.md`) resolve to.
import { getSkillRaw } from "@/shared/skills/load-skills";

export function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const raw = getSkillRaw(params.slug);
  if (raw === null) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(raw, {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
