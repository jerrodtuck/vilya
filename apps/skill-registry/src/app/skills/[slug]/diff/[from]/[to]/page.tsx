import { DiffView } from "@/features/version-diff/diff-view";

// Rendered on demand — hash pairs are unbounded, so no static params.
export const dynamic = "force-dynamic";

export default function DiffPage({
  params,
}: {
  params: { slug: string; from: string; to: string };
}) {
  return <DiffView slug={params.slug} from={params.from} to={params.to} />;
}
