import { loadSnapshot } from '@/features/evaluation/load-snapshot';
export const dynamic = 'force-dynamic';
export async function GET() {
  const result = await loadSnapshot();
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (result.status !== 'ready') return Response.json({ code: 'results-unavailable' }, { status: result.status === 'invalid' ? 503 : 404, headers });
  return Response.json(result.snapshot, { headers: { ...headers, 'Content-Disposition': 'attachment; filename="evaluation-357-results.json"' } });
}
