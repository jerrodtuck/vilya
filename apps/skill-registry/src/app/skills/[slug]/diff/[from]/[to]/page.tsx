import { DiffView } from "@/features/version-diff/diff-view";

// Rendered on demand — hash pairs are unbounded, so no static params.
export const dynamic = "force-dynamic";

export default async function DiffPage({
  params,
}: {
  params: Promise<{ slug: string; from: string; to: string }>;
}) {
  const { slug, from, to } = await params;
  return <DiffView slug={slug} from={from} to={to} />;
}
