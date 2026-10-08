// Frozen diagnostic-only decision oracle from 94bc1ffbe948957c0eb595bbe777be96514ed86a.
const RESPONSE_KEYS = new Set(['id', 'object', 'created_at', 'completed_at', 'status', 'error', 'incomplete_details',
  'instructions', 'max_output_tokens', 'max_tool_calls', 'model', 'output', 'parallel_tool_calls', 'previous_response_id',
  'reasoning', 'store', 'temperature', 'text', 'tool_choice', 'tools', 'top_p', 'truncation', 'usage', 'user', 'metadata',
  'service_tier', 'safety_identifier', 'prompt_cache_key', 'prompt_cache_options', 'prompt_cache_retention',
  'background', 'conversation', 'top_logprobs', 'personality', 'access_programs', 'moderation', 'prompt', 'prompt_cache_diagnostics']);

const fail=()=>{throw Error('reference rejection');};const uint=value=>Number.isSafeInteger(value)&&value>=0;const record=value=>value&&typeof value==='object'&&!Array.isArray(value);
export function validateFinancialResponse(data, request, inputBound) {
  const usage = data?.usage;
  if (!record(data) || Object.keys(data).some(key => !RESPONSE_KEYS.has(key)) || !(['completed','incomplete'].includes(data.status)) || data.model !== request.model ||
      data.service_tier !== 'default' || ['moderation','prompt','prompt_cache_diagnostics'].some(key => data[key] != null) ||
      data.background === true || data.conversation != null || data.access_programs != null ||
      (data.tool_choice != null && data.tool_choice !== 'none') || data.parallel_tool_calls === true ||
      (data.text != null && (!record(data.text) || Object.keys(data.text).some(k=>!['format','verbosity'].includes(k)) || (data.text.verbosity != null && !['low','medium','high'].includes(data.text.verbosity)) || !record(data.text.format) || Object.keys(data.text.format).some(k=>k!=='type') || data.text.format.type !== 'text')) || data.error != null || (data.status==='completed'?data.incomplete_details!=null:!record(data.incomplete_details)||Object.keys(data.incomplete_details).join('|')!=='reason'||data.incomplete_details.reason!=='max_output_tokens') ||
      !Array.isArray(data.tools) || data.tools.length || data.previous_response_id != null ||
      !record(usage) || Object.keys(usage).some(key => !['input_tokens', 'output_tokens', 'total_tokens', 'input_tokens_details', 'output_tokens_details'].includes(key)) ||
      !record(usage.input_tokens_details) || !record(usage.output_tokens_details) ||
      Object.keys(usage.input_tokens_details).some(key => !['cached_tokens', 'cache_write_tokens'].includes(key)) ||
      Object.keys(usage.output_tokens_details).some(key => key !== 'reasoning_tokens')) fail();
  const counts = { input: usage.input_tokens, cachedInput: usage.input_tokens_details.cached_tokens,
    cacheWrite: usage.input_tokens_details.cache_write_tokens, output: usage.output_tokens,
    reasoning: usage.output_tokens_details.reasoning_tokens, fees: 0 };
  // No fees only in the fixed Standard, text-only/no-tools scope. Missing counters are invalid.
  if (Object.values(counts).some(value => !uint(value)) || !uint(usage.total_tokens) ||
      usage.total_tokens !== counts.input + counts.output || counts.input > inputBound ||
      counts.output > request.maxOutputTokens || counts.cachedInput + counts.cacheWrite > counts.input ||
      counts.reasoning > counts.output) fail();
  if (!Array.isArray(data.output)) fail();
  for(const item of data.output){
    if(!record(item)||!['reasoning','message'].includes(item.type))fail();
    if(item.type==='reasoning'){
      if(Object.keys(item).some(k=>!['id','type','summary','content','status','encrypted_content'].includes(k)))fail();
      for(const key of ['summary','content'])if(item[key]!=null&&(!Array.isArray(item[key])||item[key].some(c=>!record(c)||!['summary_text','reasoning_text'].includes(c.type)||Object.keys(c).some(k=>!['type','text'].includes(k)))))fail();
    }else{
      if(Object.keys(item).some(k=>!['id','type','role','status','content'].includes(k))||!Array.isArray(item.content))fail();
      for(const c of item.content){
        if(!record(c)||!['output_text','refusal'].includes(c.type)||Object.keys(c).some(k=>!(c.type==='refusal'?['type','refusal']:['type','text','annotations','logprobs']).includes(k)))fail();
        if(c.annotations!=null&&(!Array.isArray(c.annotations)||c.annotations.length)||c.logprobs!=null&&(!Array.isArray(c.logprobs)||c.logprobs.length))fail();
      }
    }
  }
  return counts;
}
