import result from '@/features/evaluation/schema-probe-result.json';

export function GET(){
  return Response.json(result,{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Disposition':'attachment; filename="evaluation-357-schema-probe.json"'}});
}
