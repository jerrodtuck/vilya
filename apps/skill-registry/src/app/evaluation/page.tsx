import { EvaluationList, NoResults } from '@/features/evaluation/evaluation-view';
import { loadSnapshot } from '@/features/evaluation/load-snapshot';
import { SchemaProbeView } from '@/features/evaluation/schema-probe-view';
import { SchemaDiagnosticView } from '@/features/evaluation/schema-diagnostic-view';
import { RecalibrationPolicySummary } from '@/features/evaluation/recalibration-policy';
import type { Snapshot } from '@/features/evaluation/types';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'The Dev Loop — Evaluation' };
export default async function EvaluationPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const result = await loadSnapshot();
  return <><RecalibrationPolicySummary /><SchemaDiagnosticView /><SchemaProbeView />{result.status === 'ready' ? <EvaluationList snapshot={result.snapshot as Snapshot} query={await searchParams} /> : <NoResults invalid={result.status === 'invalid'} />}</>;
}
