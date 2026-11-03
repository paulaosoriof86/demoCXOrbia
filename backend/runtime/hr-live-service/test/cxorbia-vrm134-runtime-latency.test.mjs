import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const begin=source.indexOf('async function resolveHrAndProtectedPrincipal(');
const end=source.indexOf('\nfunction runtimeMeta(',begin);
assert.ok(begin>=0&&end>begin,'VRM-134 exact server owner helper required');
const makeHelper=(hr,auth)=>new Function('buildSnapshot','verifiedProtectedPrincipal',
  source.slice(begin,end)+'\nreturn resolveHrAndProtectedPrincipal;')(hr,auth);
const snapshotRequiredBegin=source.indexOf('function protectedSnapshotRequired(');
const snapshotRequiredEnd=source.indexOf('\nfunction runtimeMeta(',snapshotRequiredBegin);
assert.ok(snapshotRequiredBegin>=0&&snapshotRequiredEnd>snapshotRequiredBegin,'VRM-134 protected metadata fast path required');
const protectedSnapshotRequired=new Function(source.slice(snapshotRequiredBegin,snapshotRequiredEnd)+'\nreturn protectedSnapshotRequired;')();
const pairBegin=source.indexOf('async function runIndependentHrSourceReads(');
const pairEnd=source.indexOf('\nasync function refreshSnapshot(',pairBegin);
assert.ok(pairBegin>=0&&pairEnd>pairBegin,'VRM-134 exact source read pair helper required');
const runIndependentHrSourceReads=new Function(source.slice(pairBegin,pairEnd)+'\nreturn runIndependentHrSourceReads;')();

test('VRM-134 coalesces independent protected HR and principal reads without returning before both',async()=>{
  const starts=[];let releaseHr,releaseAuth;
  const hrP=new Promise(r=>releaseHr=r),authP=new Promise(r=>releaseAuth=r);
  const helper=makeHelper(()=>{starts.push('hr');return hrP;},()=>{starts.push('auth');return authP;});
  const pending=helper({headers:{authorization:'Bearer synthetic'}},{tenantId:'tya',projectId:'cinepolis'},false,true);
  assert.deepEqual(starts,['hr','auth'],'both independent operations start before first completion');
  releaseHr({revision:'revision-safe'});
  let complete=false;pending.then(()=>{complete=true;});
  await Promise.resolve();await Promise.resolve();
  assert.equal(complete,false,'HR alone must not authorize a protected response');
  releaseAuth({uid:'exact-uid',role:'shopper'});
  const value=await pending;
  assert.equal(value.current.revision,'revision-safe');
  assert.equal(value.principal.uid,'exact-uid');
  assert.equal(typeof value.timing.hrWaitMs,'number');
  assert.equal(typeof value.timing.principalVerifyMs,'number');
});
test('VRM-134 rejects protected request if principal check fails',async()=>{
  const helper=makeHelper(async()=>({revision:'fresh'}),async()=>{throw new Error('AUTH_FAILURE:MEMBERSHIP_DENIED');});
  await assert.rejects(helper({},{tenantId:'tya',projectId:'cinepolis'},false,true),/AUTH_FAILURE:MEMBERSHIP_DENIED/);
});
test('VRM-134 public HR read never calls protected identity and retains freshness route',async()=>{
  let calls=0;
  const helper=makeHelper(async({forceFresh})=>({revision:'current',forceFresh}),()=>{calls++;throw new Error('must not run');});
  const value=await helper({},{tenantId:'tya',projectId:'cinepolis'},true,false);
  assert.equal(value.current.forceFresh,true);
  assert.equal(value.principal,null);
  assert.equal(calls,0);
});
test('VRM-134 exposes non-sensitive source refresh stages and protected timing only to verified path',()=>{
  assert.match(source,/refreshStagesMs:lastRefreshStagesMs/);
  assert.match(source,/meta\.protectedTiming=\{\.\.\.timing,protectedStateMs:/);
  assert.match(source,/if\(protectedRequested\)return sendJson\(res,200,\{snapshot,_protected:protectedState,_runtime:/);
  assert.match(source,/if\(cache&&age<CACHE_MS\)return cache/);
  assert.match(source,/Expired data is never served as current/);
});
test('VRM-134 protected metadata read verifies identity and HR without repeating protected Firestore overlay',()=>{
  assert.equal(protectedSnapshotRequired('meta',true),false,'protected metadata needs no duplicate overlay');
  assert.equal(protectedSnapshotRequired('json',true),true,'full protected JSON still requires its overlay');
  assert.equal(protectedSnapshotRequired('js',true),true,'protected JavaScript output keeps prior semantics');
  assert.equal(protectedSnapshotRequired('meta',false),false,'public metadata never requests protected overlay');
  assert.match(source,/resolveHrAndProtectedPrincipal\(req,requestedScope,forceFresh,protectedRequested\)/,
    'protected meta still verifies Firebase principal and tenant/project membership');
  assert.match(source,/if\(protectedSnapshotRequired\(format,protectedRequested\)\)/,
    'only full protected representations expand Firestore collections');
  assert.match(source,/if\(protectedRequested\)meta\.protectedTiming=\{\.\.\.timing,protectedStateMs:0/,
    'verified meta exposes a traceable metadata-only timing');
  assert.ok(source.indexOf("if(format==='meta')")<source.indexOf('const json=(operational||protectedRequested)'),
    'metadata response must not serialize a full snapshot just to return revision');
});
test('VRM-134 registry identity and live HR read start concurrently, then both settle before validation',async()=>{
  const started=[];let releaseRegistry,releaseProvider;
  const registry=new Promise(resolve=>{releaseRegistry=resolve;});
  const provider=new Promise(resolve=>{releaseProvider=resolve;});
  let settled=false;
  const pending=runIndependentHrSourceReads((name,args)=>{
    started.push([name,args[0]]);
    return name==='registryIdentity'?registry:provider;
  }).then(()=>{settled=true;});
  assert.deepEqual(started.map(x=>x[0]),['registryIdentity','liveProviderRead']);
  assert.notEqual(started[0][1],started[1][1],'two independent process outputs');
  releaseRegistry();
  await Promise.resolve();await Promise.resolve();
  assert.equal(settled,false,'metadata first cannot skip live provider read');
  releaseProvider();
  await pending;
  assert.equal(settled,true);
  assert.ok(source.indexOf('await runIndependentHrSourceReads(timedNode)')<source.indexOf("await timedNode('tabRegistryGuard'"),
    'tab/registry guard must execute only after both source reads');
});
test('VRM-134 source read failure waits for the other process before cleanup',async()=>{
  let releaseProvider,settled=false;
  const provider=new Promise(resolve=>{releaseProvider=resolve;});
  const pending=runIndependentHrSourceReads(name=>name==='registryIdentity'
    ?Promise.reject(new Error('SOURCE_FAILURE:REGISTRY')):provider);
  pending.finally(()=>{settled=true;}).catch(()=>{});
  await Promise.resolve();await Promise.resolve();
  assert.equal(settled,false,'a failed source process must not race temp-file cleanup with the other');
  releaseProvider();
  await assert.rejects(pending,/SOURCE_FAILURE:REGISTRY/);
  assert.equal(settled,true);
});
