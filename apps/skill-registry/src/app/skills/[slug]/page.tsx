import { SkillView } from "@/features/skill-detail/skill-view";
import { getSkillSlugs } from "@/shared/skills/load-skills";

export function generateStaticParams() {
  return getSkillSlugs().map((slug) => ({ slug }));
}

export default function SkillPage({ params }: { params: { slug: string } }) {
  return <SkillView slug={params.slug} />;
}
