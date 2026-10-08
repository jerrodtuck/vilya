import { notFound } from 'next/navigation';
import { NoResults, TrialDetail } from '@/features/evaluation/evaluation-view';
import { findRun } from '@/features/evaluation/evidence.mjs';
import { loadSnapshot } from '@/features/evaluation/load-snapshot';
import type { Run } from '@/features/evaluation/types';
export const dynamic = 'force-dynamic';
export default async function TrialPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  if (!/^(api|native)_(behavior|instruction|migration)_[12]_[AB]$/.test(runId)) notFound();
  const result = await loadSnapshot();
  if (result.status === 'invalid') return <NoResults invalid />;
  if (result.status === 'missing') notFound();
  const run = findRun(result.snapshot, runId) as Run | null;
  if (!run) notFound();
  return <TrialDetail run={run} generatedAt={result.snapshot.generatedAt} />;
}
