import {guardLedgerOperation,consumeFreshInitialization} from './recovery.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { LIMITS, integer, exactKeys, validateConfig, maximumCost, actualCost } from './money.mjs';
const hash = value => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const id = value => { if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) throw Error('Invalid ID'); return value; };
const phaseBucket = phase => phase === 'review' || phase === 'repair' ? 'reviewRepair' : phase;
const phases = ['setup', 'final', 'planning', 'implementation', 'review', 'repair'];

export class BudgetLedger {
  constructor(file, config, { clock = Date.now } = {}) {
    validateConfig(config);
    this.file = path.resolve(file); this.config = structuredClone(config); this.clock = clock;
  }
  initializeRecovery(token){const recovery=consumeFreshInitialization(this.file,token);fs.mkdirSync(path.dirname(this.file),{recursive:true});return this.transaction(()=>({version:3,recovery,configHash:hash(this.config),lastTime:integer(this.clock(),'clock'),overheadStart:{setup:null,final:null},trialStart:null,blocked:false,pairs:[],trials:{},requests:[],preflights:[]}),true,true);}
  requestId(local){id(local);const state=this.read();return id((state.recovery?.namespace??'')+local);}
  initialize() {
    if (fs.existsSync(this.file)) throw Error('Ledger already exists; resume it');
    return this.transaction(() => ({ version: 2, configHash: hash(this.config), lastTime: integer(this.clock(), 'clock'),
      overheadStart: { setup: null, final: null }, trialStart: null, blocked: false, pairs: [], trials: {}, requests: [], preflights: [] }), true);
  }
  validate(state) {
    guardLedgerOperation(this.file,this.config.mode,{state});
    exactKeys(state, [...(state.version===3?['recovery']:[]),'version', 'configHash', 'lastTime', 'overheadStart', 'trialStart', 'blocked', 'pairs', 'trials', 'requests', 'preflights'], 'ledger');
    if (![2,3].includes(state.version) || state.configHash !== hash(this.config) || typeof state.blocked !== 'boolean' || !Array.isArray(state.pairs) ||
        !Array.isArray(state.requests) || !Array.isArray(state.preflights) || !state.trials || typeof state.trials !== 'object' || Array.isArray(state.trials)) throw Error('Ledger/config mismatch');
    integer(state.lastTime, 'lastTime');
    exactKeys(state.overheadStart, ['setup', 'final'], 'overhead starts');
    for (const value of Object.values(state.overheadStart)) if (value !== null) integer(value, 'overhead start');
    for (const key of ['trialStart']) if (state[key] !== null) integer(state[key], key);
    const trialIds = Object.keys(state.trials); if (trialIds.length > LIMITS.trials || state.pairs.length * 2 !== trialIds.length) throw Error('Invalid trial count');
    const seen = new Set();
    for (const pair of state.pairs) {
      exactKeys(pair, ['id', 'trials'], 'pair'); id(pair.id);
      if (seen.has(pair.id) || !Array.isArray(pair.trials) || pair.trials.length !== 2 || pair.trials[0] === pair.trials[1]) throw Error('Invalid pair'); seen.add(pair.id);
      for (const trial of pair.trials) { id(trial); if (!state.trials[trial]) throw Error('Missing paired trial'); }
    }
    if (new Set(state.pairs.flatMap(pair => pair.trials)).size !== trialIds.length) throw Error('Repeated paired trial');
    for (const [trialId, trial] of Object.entries(state.trials)) {
      id(trialId); exactKeys(trial, ['start', 'repairs', 'closed'], 'trial');
      if (trial.start !== null) integer(trial.start, 'start');
      if (typeof trial.closed !== 'boolean' || !trial.repairs || typeof trial.repairs !== 'object' || Array.isArray(trial.repairs)) throw Error('Invalid trial state');
      for (const [defect, repair] of Object.entries(trial.repairs)) {
        id(defect); exactKeys(repair, ['unsuccessful', 'active'], 'repair ledger');
        integer(repair.unsuccessful, 'repair count'); if (repair.unsuccessful > 2 || typeof repair.active !== 'boolean') throw Error('Invalid repair history');
      }
    }
    seen.clear(); let pending = 0;
    for (const request of state.requests) {
      exactKeys(request, ['id', 'trial', 'phase', 'model', 'effort', 'inputBound', 'outputBound', 'reservation', 'start', 'end', 'status', 'cost', 'usage', 'providerRequestId'], 'request');
      id(request.id);if(state.version===3&&!request.id.startsWith(state.recovery.namespace))throw Error('Recovery request namespace'); if (seen.has(request.id)) throw Error('Duplicate request'); seen.add(request.id);
      if (!phases.includes(request.phase) || !this.config.models[request.model] || !['low', 'medium', 'high', 'xhigh'].includes(request.effort)) throw Error('Invalid request metadata');
      if (request.trial !== null && !state.trials[request.trial]) throw Error('Unknown trial');
      if ((request.trial === null) !== ['setup', 'final'].includes(request.phase)) throw Error('Wrong request scope');
      for (const key of ['inputBound', 'outputBound', 'reservation', 'start']) integer(request[key], key);
      if(request.end!==null){integer(request.end,'request end');if(request.end<request.start)throw Error('Invalid request timing');}
      if(request.status!=='complete'&&request.end!==null)throw Error('Incomplete request has end');
      if (request.inputBound > this.config.bounds.maxInputTokens || request.outputBound > this.config.bounds.maxOutputTokens || request.outputBound < 1 ||
          request.reservation !== maximumCost(this.config.models[request.model], request.inputBound, request.outputBound)) throw Error('Invalid reservation');
      if (request.providerRequestId !== null && (typeof request.providerRequestId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(request.providerRequestId))) throw Error('Invalid provider ID');
      if (!['pending', 'unknown', 'complete'].includes(request.status)) throw Error('Invalid request status');
      if (request.status !== 'complete') {
        pending++; if (request.cost !== null || request.usage !== null) throw Error('Unreconciled request');
      } else {
        if (request.cost !== actualCost(this.config.models[request.model], request.usage) || request.cost > request.reservation ||
            request.usage.input > request.inputBound || request.usage.output > request.outputBound) throw Error('Invalid reconciliation');
      }
    }
    if (pending > 1 || (state.requests.some(r => r.status === 'unknown') && !state.blocked)) throw Error('Invalid in-flight state');
    if (state.preflights.length+(state.recovery?.carriedPreflightCount??0) > 64) throw Error('Preflight limit exceeded');
    const preflightIds = new Set(); let activePreflights = 0;
    for (const count of state.preflights) {
      exactKeys(count, ['id','requestId','trial','phase','payloadHash','model','effort','serviceTier','pricingDate','billingInterpretation','status','start','inputTokens','providerRequestId'], 'preflight');
      id(count.id); id(count.requestId);if(state.version===3&&!count.requestId.startsWith(state.recovery.namespace))throw Error('Recovery count namespace');
      if (preflightIds.has(count.id) || count.id !== `${count.requestId}_count` || !/^[a-f0-9]{64}$/.test(count.payloadHash) || !this.config.models[count.model] || !phases.includes(count.phase) || !['medium','high'].includes(count.effort) || count.serviceTier !== 'default' || count.pricingDate !== '2026-10-06' || count.billingInterpretation !== 'published-pricing-count-zero-2026-10-06') throw Error('Invalid preflight');
      preflightIds.add(count.id); integer(count.start, 'preflight time');
      if ((count.trial === null) !== ['setup','final'].includes(count.phase) || (count.trial !== null && !state.trials[count.trial])) throw Error('Invalid count scope');
      if (!['pending','unknown','complete'].includes(count.status)) throw Error('Invalid count status');
      if (count.status === 'complete') { integer(count.inputTokens,'exact input tokens',1); if (count.inputTokens > this.config.bounds.maxInputTokens) throw Error('Count bound exceeded'); }
      else { activePreflights++; if (count.inputTokens !== null || count.providerRequestId !== null) throw Error('Invalid pending count'); }
      if (count.providerRequestId !== null && !/^[A-Za-z0-9_-]{1,128}$/.test(count.providerRequestId)) throw Error('Invalid count provider ID');
    }
    if (activePreflights + pending > 1 || (state.preflights.some(p => p.status === 'unknown') && !state.blocked)) throw Error('Invalid shared in-flight state');
    this.checkBudgets(state);
  }
  charged(request) { return request.status === 'complete' ? request.cost : request.reservation; }
  sum(state, predicate = () => true) { return state.requests.filter(predicate).reduce((sum, request) => sum + this.charged(request), 0); }
  checkBudgets(state) {
    const carry=state.recovery?.carriedExposure??0;const overhead = (state.recovery?.carriedOverhead??0)+this.sum(state, r => r.trial === null);
    if (overhead > LIMITS.overhead || carry+this.sum(state) > LIMITS.total || carry+overhead + Object.keys(state.trials).length * LIMITS.trial > LIMITS.total) throw Error('Budget exhausted');
    for (const trial of Object.keys(state.trials)) {
      if (this.sum(state, r => r.trial === trial) > LIMITS.trial) throw Error('Trial budget exhausted');
      for (const [bucket, limit] of [['planning', LIMITS.planning], ['implementation', LIMITS.implementation], ['reviewRepair', LIMITS.reviewRepair]]) {
        if (this.sum(state, r => r.trial === trial && phaseBucket(r.phase) === bucket) > limit) throw Error('Phase budget exhausted');
      }
    }
  }
  read() {
    const envelope = JSON.parse(fs.readFileSync(this.file, 'utf8'));
    exactKeys(envelope, ['state', 'sha256'], 'envelope');
    if (envelope.sha256 !== hash(envelope.state)) throw Error('Ledger checksum mismatch');
    this.validate(envelope.state); return envelope.state;
  }
  write(state) {
    guardLedgerOperation(this.file,this.config.mode,{writing:true,state});
    this.validate(state);
    const temp = `${this.file}.next`; const fd = fs.openSync(temp, 'wx', 0o600);
    try { fs.writeFileSync(fd, JSON.stringify({ state, sha256: hash(state) }) + '\n'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temp, this.file);
    // Directory sync is not portable to Windows; file sync and same-volume rename are used.
  }
  transaction(change, initializing = false,recovered=false) {
    if(!recovered)guardLedgerOperation(this.file,this.config.mode,{initializing,writing:true});
    // A stale lock is never auto-cleared. Crash recovery requires inspecting retained state.
    const lock = `${this.file}.lock`; const lockFd = fs.openSync(lock, 'wx', 0o600);
    try {
      if (initializing && fs.existsSync(this.file)) throw Error('Ledger already exists');
      const state = initializing ? null : this.read();
      const now = integer(this.clock(), 'clock');
      if (state && now < state.lastTime) throw Error('Clock regressed; dispatch held');
      const result = change(state, now);
      const next = initializing ? result : state; next.lastTime = now; this.write(next); return result;
    } finally { fs.closeSync(lockFd); fs.unlinkSync(lock); }
  }
  ready(state) { if(this.config.mode==='live')guardLedgerOperation(this.file,this.config.mode,{writing:true,state});if (state.blocked || state.requests.some(r => r.status !== 'complete') || state.preflights.some(r => r.status !== 'complete')) throw Error('Unresolved reservation; dispatch held'); }
  pair(pairId, first, second) {
    return this.transaction((state) => {
      this.ready(state); id(pairId); id(first); id(second);
      if (first === second || state.pairs.some(p => p.id === pairId) || state.trials[first] || state.trials[second]) throw Error('Pair already allocated');
      if (Object.keys(state.trials).length + 2 > LIMITS.trials || (state.recovery?.carriedExposure??0)+(state.recovery?.carriedOverhead??0)+this.sum(state, r => r.trial === null) + (Object.keys(state.trials).length + 2) * LIMITS.trial > LIMITS.total) throw Error('Matched pair cannot fit');
      state.pairs.push({ id: pairId, trials: [first, second] });
      for (const trial of [first, second]) state.trials[trial] = { start: null, repairs: {}, closed: false };
    });
  }
  begin(trialId) {
    return this.transaction((state, now) => {
      this.ready(state); const trial = state.trials[trialId];
      if (!trial || trial.start !== null || Object.values(state.trials).some(t => t.start !== null && !t.closed)) throw Error('Trial cannot begin');
      if (state.trialStart !== null && now >= state.trialStart + LIMITS.dispatchMs) throw Error('Aggregate trial deadline');
      state.trialStart ??= now; trial.start = now;
    });
  }
  close(trialId) {
    return this.transaction(state => { const trial = state.trials[trialId]; if (!trial || trial.start === null) throw Error('Unknown trial'); trial.closed = true; });
  }
  reserve({ requestId, trial = null, phase, model, effort, inputBound, outputBound, defect = null }) {
    return this.transaction((state, now) => {
      this.ready(state); id(requestId);
      if (!phases.includes(phase) || !this.config.models[model] || !['low', 'medium', 'high', 'xhigh'].includes(effort)) throw Error('Unknown model/phase/effort');
      integer(inputBound, 'input bound'); integer(outputBound, 'output bound', 1);
      if (inputBound > this.config.bounds.maxInputTokens || outputBound > this.config.bounds.maxOutputTokens) throw Error('Token bound exceeded');
      if ((trial === null) !== ['setup', 'final'].includes(phase)) throw Error('Wrong phase scope');
      if (trial !== null) {
        const target = state.trials[trial];
        if (!target || target.start === null || target.closed || now >= target.start + LIMITS.trialMs || now >= state.trialStart + LIMITS.dispatchMs) throw Error('Trial unavailable/deadline');
        if (phase === 'repair') {
          id(defect); const repair = target.repairs[defect] ??= { unsuccessful: 0, active: false };
          if (repair.active || repair.unsuccessful >= 2) throw Error('Repair stop'); repair.active = true;
        }
      } else {
        state.overheadStart[phase] ??= now;
        if (now >= state.overheadStart[phase] + (phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs) || (phase === 'final' && state.trialStart !== null && now >= state.trialStart + LIMITS.dispatchMs + LIMITS.finalMs)) throw Error('Overhead deadline');
      }
      if (state.requests.some(r => r.id === requestId)) throw Error('Request already attempted');
      if (state.requests.filter(r => r.trial === trial && r.phase === phase).length >= this.config.bounds.maxRequestsPerPhase) throw Error('Request limit');
      if (this.config.mode === 'live') {
        const count = state.preflights.find(p => p.requestId === requestId);
        if (!count || count.status !== 'complete' || count.model !== model || count.effort !== effort || count.trial !== trial || count.phase !== phase || count.inputTokens !== inputBound) throw Error('Missing exact preflight');
      }
      const request = { id: requestId, trial, phase, model, effort, inputBound, outputBound,
        reservation: maximumCost(this.config.models[model], inputBound, outputBound), start: now, end: null, status: 'pending', cost: null, usage: null, providerRequestId: null };
      state.requests.push(request); this.checkBudgets(state); return structuredClone(request);
    });
  }
  reconcile(requestId, usage, metadata = null) {
    return this.transaction((state, now) => {
      const request = state.requests.find(r => r.id === requestId);
      if (!request || request.status !== 'pending') throw Error('Request cannot reconcile');
      const cost = actualCost(this.config.models[request.model], usage);
      if (cost > request.reservation || usage.input > request.inputBound || usage.output > request.outputBound) throw Error('Actual usage exceeds reservation');
      request.end = now; request.cost = cost; request.usage = structuredClone(usage); request.status = 'complete';
      if (metadata !== null) { exactKeys(metadata, ['providerRequestId'], 'provider metadata'); request.providerRequestId = metadata.providerRequestId; }
    });
  }
  hold(requestId) {
    return this.transaction(state => {
      const request = state.requests.find(r => r.id === requestId);
      if (!request || request.status !== 'pending') throw Error('Request cannot hold');
      request.status = 'unknown'; state.blocked = true;
    });
  }
  repairResult(trialId, defect, passed) {
    return this.transaction(state => {
      this.ready(state); const repair = state.trials[trialId]?.repairs[defect];
      if (!repair?.active || typeof passed !== 'boolean') throw Error('No active repair');
      repair.active = false; repair.unsuccessful = passed ? 0 : repair.unsuccessful + 1;
    });
  }
  beginPreflight(meta) {
    return this.transaction((state, now) => {
      this.ready(state); id(meta.requestId);
      if (state.preflights.length+(state.recovery?.carriedPreflightCount??0) >= 64 || state.preflights.some(p => p.requestId === meta.requestId) || state.requests.some(r => r.id === meta.requestId)) throw Error('Preflight limit/reuse');
      if (meta.trial !== null) {
        const trial = state.trials[meta.trial];
        if (!trial || trial.start === null || trial.closed || now >= trial.start + LIMITS.trialMs || now >= state.trialStart + LIMITS.dispatchMs) throw Error('Preflight trial deadline');
      } else {
        if (!['setup','final'].includes(meta.phase)) throw Error('Preflight scope');
        state.overheadStart[meta.phase] ??= now;
        if (now >= state.overheadStart[meta.phase] + (meta.phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs)) throw Error('Preflight overhead deadline');
      }
      const count = { ...meta, id: `${meta.requestId}_count`, status: 'pending', start: now, inputTokens: null, providerRequestId: null };
      state.preflights.push(count); const deadline = meta.trial !== null ? Math.min(state.trials[meta.trial].start + LIMITS.trialMs, state.trialStart + LIMITS.dispatchMs) : Math.min(state.overheadStart[meta.phase] + (meta.phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs), meta.phase === 'final' && state.trialStart !== null ? state.trialStart + LIMITS.dispatchMs + LIMITS.finalMs : Infinity); return { ...structuredClone(count), deadline };
    });
  }
  completePreflight(countId, result) {
    return this.transaction((state, now) => {
      const count = state.preflights.find(p => p.id === countId);
      const deadline = count?.trial !== null ? Math.min(state.trials[count?.trial]?.start + LIMITS.trialMs, state.trialStart + LIMITS.dispatchMs) : Math.min(state.overheadStart[count?.phase] + (count?.phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs), count?.phase === 'final' && state.trialStart !== null ? state.trialStart + LIMITS.dispatchMs + LIMITS.finalMs : Infinity);
      if (!count || count.status !== 'pending' || now >= count.start + 15000 || now >= deadline) throw Error('Preflight unresolved/deadline');
      exactKeys(result, ['inputTokens','providerRequestId'], 'count result');
      count.inputTokens = result.inputTokens; count.providerRequestId = result.providerRequestId; count.status = 'complete'; return true;
    });
  }
  holdPreflight(countId) {
    return this.transaction(state => {
      const count = state.preflights.find(p => p.id === countId); if (!count || count.status !== 'pending') throw Error('Preflight cannot hold');
      count.status = 'unknown'; state.blocked = true;
    });
  }
  deadline(trial, phase) {
    const state = this.read();
    if (trial !== null) return Math.min(state.trials[trial].start + LIMITS.trialMs, state.trialStart + LIMITS.dispatchMs);
    return Math.min(state.overheadStart[phase] + (phase === 'final' ? LIMITS.finalMs : LIMITS.overheadMs), phase === 'final' && state.trialStart !== null ? state.trialStart + LIMITS.dispatchMs + LIMITS.finalMs : Infinity);
  }
}
