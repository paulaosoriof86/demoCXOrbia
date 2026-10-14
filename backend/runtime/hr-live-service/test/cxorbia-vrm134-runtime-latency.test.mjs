import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync('backend/runtime/hr-live-service/server.mjs','utf8');
const begin=source.indexOf('async function resolveHrAndProtectedPrincipal(');
const end=source.indexOf('\nfunction runtimeMeta(',begin);
assert.ok(begin>=0&&end>begin,'VRM-134 exact server owner helper required');
const makeHelper=(hr,auth)=>new Function('buildSnapshot','verifiedProtectedPrincipal',
  source.slice(begin,end)+'\nreturn resolveHrAndProtectedPrincipal;')(hr,auth);

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
