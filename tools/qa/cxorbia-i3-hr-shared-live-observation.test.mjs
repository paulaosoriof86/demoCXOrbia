import assert from 'node:assert/strict';
import test from 'node:test';
import { EventEmitter } from 'node:events';
import { compareShared, runSharedHrAcceptance } from './cxorbia-i3-hr-shared-live-observation.mjs';

const src = '9117f6ebeb165093805d1c2b69c54e534e317cf4';
const scope = { mode: 'MANUAL_FRESH_TWO_SHARED_PRESENTATIONS', sourceSha: src, pairedRunId: '12345678-eeee-4000-bbbb-987654321012', maxManualReads: 1, maxSharedChecks: 2 };
const origin = 'https://cxorbia-backend-dev.web.app', revision = 'a'.repeat(64), generation = 'b'.repeat(64);
const stamp = Date.now(), single = { revision, generation, current:true, origin:'runtime_excel_online_original', fresh:true, format:'json', published:true, start:stamp-1, received:stamp+1, sourceReadAt:new Date(stamp).toISOString() };
const shared = { revision, durableGeneration:generation, current:false, origin:'durable_internal_snapshot', sync:'due', format:'meta', scopeMode:'rolling_window', freshnessState:'last_confirmed', sourceReadAt:single.sourceReadAt };
const ok = [{ ok:true, revision }, { ok:true, revision }];
test('two protected presentations reuse exactly the same confirmed observation', () => {
  assert.equal(compareShared(single, [[shared], [shared]], ok).sharedDurableResponseCount, 2);
});
for (const [caseName, change] of [
  ['second external read', {current:true}], ['fallback marked failed',{sharedRefreshFailed:true}],
  ['election still pending',{sharedRefreshPending:true}], ['new generation',{durableGeneration:'1'.repeat(64)}],
  ['unmatched revision',{revision:'2'.repeat(64)}], ['stale time',{sourceReadAt:new Date(stamp-1000).toISOString()}],
  ['demanded history',{periodParam:'external-2025-01'}], ['new publication',{published:true}],
  ['unlabeled saved view',{freshnessState:'current_external_read'}]
]) test(caseName, () => { assert.throws(() => compareShared(single, [[shared], [{...shared,...change}]], ok)); });
test('egress from one tab twice cannot be credited as two sessions', () => {
  assert.throws(() => compareShared(single, [[shared,shared], []], ok));
  assert.throws(() => compareShared(single, [[shared],[shared]], [ok[0],{ok:true,skipped:true}]));
});

function fixture({ secondMode = 'rolling_window', extraFresh = false, hideBadge = false, auxiliaryExternal = false, delegated = false } = {}) {
  const projectId='cinepolis', tenantId='tya', runId='123456789', period=projectId+'-2026-11';
  const browser={}, wire={ readAt:0, responses:0, blocked:0, clicks:0 }, snapshots=[];
  function pageFor(session, mode) {
    const page=new EventEmitter(), context={ browser:()=>browser };
    let waitingForPublication = false;
    page.waitForFunction=async (_predicate, expected) => {
      assert.equal(expected,revision); assert.ok(waitingForPublication); waitingForPublication=false;
    };
    page.context=()=>context;
    page.url=()=>origin+'/index-backend-dev.html';
    page.route=async (matcher, handler)=>{ page.handler=handler; };
    page.unroute=async()=>{ delete page.handler; };
    async function fetchScoped(format, flags, actual) {
      const uri=origin+'/api/tenants/'+tenantId+'/projects/'+projectId+'/hr-live?protectedState=1&readModel=1&format='+format+flags;
      const req={ url:()=>uri,method:()=>'GET',headerValue:async()=>'Bearer synthetic-test-marker' };
      page.emit('request',req);
      await page.handler({
        request:()=>req, abort:async()=>{ wire.blocked++; }, fallback:async()=>{
          wire.responses++;
          if(actual)wire.readAt=Date.now();
          const meta={tenantId,projectId,runtimeRead:true,sourceSafe:true,production:false,hrWrites:false,operationalWrites:false,imports:false,
            revision,sourceReadAt:new Date(wire.readAt).toISOString(),externalReadCurrent:actual,cacheOrigin:actual?'runtime_excel_online_original':'durable_internal_snapshot',
            readModelWriteAck:actual?{published:true,generation}:null,durableReadModel:!actual?{generation}:null,
            hrFreshness:{state:actual?'current_external_read':'last_confirmed'},readScope:{mode:'rolling_window',currentPeriodId:period,periodIds:[period]}};
          const mock={ request:()=>req, url:()=>uri, status:()=>200, json:async()=>actual?{_runtime:meta}:meta, headers:()=>({}) };
          page.emit('response',mock);
        }
      });
    }
    page.__d08NativeEvaluate=async callback=>{
      const source=String(callback);
      if(source.includes('app = window.CX'))return { uid:'qa_d08_'+runId+'_1_admin', sameActor:true,role:'admin',authenticated:true,tenant:tenantId,project:projectId,authorizedProject:true,bound:true,applied:true,atomic:true,revision:waitingForPublication?generation:revision,authorityRevision:waitingForPublication?generation:revision,scopeMode:mode,selectedPeriod:period,requestedPeriod:null, freshness:'last_confirmed', sourceReadAt:new Date(wire.readAt).toISOString(), sourceMarker:'hr-last-confirmed', visibleCanonicalBadge:!hideBadge, sourceBadge:'HR · última sincronización 26/11/2026 15:00:00' };
      if(source.includes('router.nav')){ assert.equal(session,0); return; }
      if(source.includes('CX_TYA_CHECK_LIVE_SOURCE')) { await fetchScoped('meta','&sync=due',false);waitingForPublication=delegated&&session===1;return { ok:true,revision,delegated:waitingForPublication }; }
      throw Error('unexpected evaluation');
    };
    page.locator=id=>{
      assert.equal(id,'#vRefreshHR');
      return {waitFor:async()=>{},isEnabled:async()=>true,click:async()=>{wire.clicks++;await fetchScoped('json','&fresh=1',true);if(extraFresh)await fetchScoped('json','&fresh=1',true);await fetchScoped('meta','',auxiliaryExternal);}};
    };
    page.getByText=text=>{ assert.equal(text,'HR viva actualizada');return {waitFor:async()=>{}}; };
    return page;
  }
  return { wire,snapshots, options:{ runId,tenantId,projectId,first:pageFor(0,'rolling_window'),second:pageFor(1,secondMode),scope,sealedSource:src,save:r=>snapshots.push(structuredClone(r))} };
}
test('entry point clicks original button once, invokes each watcher once, and emits a separate partial receipt',async()=>{
  const f=fixture(), r=await runSharedHrAcceptance(f.options);
  assert.deepEqual(f.wire,{readAt:f.wire.readAt,responses:4,blocked:0,clicks:1});
  assert.equal(r.application.status,'PASS_MANUAL_AND_TWO_SHARED_DURABLE_PRESENTATIONS');assert.equal(r.decision,'HOLD');
  assert.equal(r.make.measuredCredits,null);assert.equal(r.coldStart.status,'PENDING_NATIVE_INSTANCE_CORRELATION');
  assert.equal(r.requests.operationalPostAttempts,0);assert.equal(r.requests.sharedDue,2);
  assert.equal(f.snapshots.length,3);assert.ok(!JSON.stringify(r).includes('Bearer'));assert.ok(!JSON.stringify(r).includes('qa_d08_'));
  assert.equal(f.options.first.listenerCount('response'),0);assert.equal(f.options.second.listenerCount('request'),0);
});
test('request pin and independent page contexts are checked before any egress',async()=>{
  for (const options of [o=>({...o,scope:{...scope,sourceSha:'b'.repeat(40)}}),o=>({...o,second:o.first}),o=>({...o,scope:{...scope,maxManualReads:2}})]) {
    const f=fixture(), r=await runSharedHrAcceptance(options(f.options)); assert.equal(r.application.status,'HOLD'); assert.equal(f.wire.clicks,0);
  }
});
test('explicit history is preserved without a forced read',async()=>{
  const f=fixture({secondMode:'explicit_period'}), r=await runSharedHrAcceptance(f.options);
  assert.equal(r.application.cause,'MAPPING_FAILURE:HR_ROLLING_PRESENTATIONS_REQUIRED');assert.equal(f.wire.responses,0);
});
test('a browser retry cannot exceed the external reading budget or create a PASS',async()=>{
  const f=fixture({extraFresh:true}), r=await runSharedHrAcceptance(f.options);
  assert.equal(r.application.status,'HOLD');assert.equal(r.requests.blockedOutOfScope,1);assert.equal(r.requests.manualFresh,1);
  assert.equal(f.wire.responses,4);assert.equal(f.wire.clicks,1);
});

test('the UI must visibly date its last confirmation in both sessions',async()=>{
  const f=fixture({hideBadge:true}), r=await runSharedHrAcceptance(f.options);
  assert.equal(r.application.cause,'VISUAL_DEFECT:HR_LAST_CONFIRMED_BADGE');
});
test('a separate strict proof is not credited when an extra external read was observed',async()=>{
  const f=fixture({auxiliaryExternal:true}), r=await runSharedHrAcceptance(f.options);
  assert.equal(r.application.cause,'PROVIDER_FAILURE:HR_AUXILIARY_EXTERNAL_READ');
});

test('the observer waits for delegated publication before checking the second session',async()=>{
  const f=fixture({delegated:true}), r=await runSharedHrAcceptance(f.options);
  assert.equal(r.application.status,'PASS_MANUAL_AND_TWO_SHARED_DURABLE_PRESENTATIONS');
  assert.equal(r.proof.appliedSessionRevisions.length,2);
  assert.equal(f.wire.clicks,1);assert.equal(r.requests.sharedDue,2);
});
