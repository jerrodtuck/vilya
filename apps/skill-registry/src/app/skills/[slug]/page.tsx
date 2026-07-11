import { SkillView } from "@/features/skill-detail/skill-view";
import { getSkillSlugs } from "@/shared/skills/load-skills";

export function generateStaticParams() {
  return getSkillSlugs().map((slug) => ({ slug }));
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <SkillView slug={slug} />;
}
