import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const inplace=fs.readFileSync('app/adapters/tya-live-source-inplace-apply.js','utf8'),bridge=fs.readFileSync('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8'),c6=fs.readFileSync('app/adapters/tya-c6-unified-human-runtime-v1.js','utf8'),watcher=fs.readFileSync('app/adapters/tya-live-source-refresh-watch-v2.js','utf8');
test('A05 builds HR candidate without publishing CX.data',()=>{const s=inplace.indexOf('function buildSnapshotCandidate('),e=inplace.indexOf('function publishSnapshotCandidate(',s);assert.ok(s>=0&&e>s);assert.doesNotMatch(inplace.slice(s,e),/CX\.data\.(projects|shoppers|_visitas|_posts|currentProjectId|currentPeriodId)\s*=/);assert.match(inplace,/CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE=buildSnapshotCandidate/);assert.match(inplace,/Object\.assign\(CX\.data,next\)/);});
test('A05 reconcile validates session and revision before publish',()=>{const s=bridge.indexOf('async function reconcile('),e=bridge.indexOf('function schedule(',s),body=bridge.slice(s,e);assert.match(body,/sessionGenerationStamp\(c,scope\)/);assert.match(body,/CX_TYA_BUILD_LIVE_SNAPSHOT_CANDIDATE/);assert.doesNotMatch(body,/CX_TYA_APPLY_LIVE_SNAPSHOT\(/);assert.ok(body.indexOf('await verifyHrRevision')<body.indexOf('publishComposition(candidate)'));assert.match(body,/assertSessionGeneration\(sessionStamp\)/);assert.match(bridge,/HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION/);});
test('A05 publication precedes authority-ready events',()=>{const s=bridge.indexOf('function publishComposition('),e=bridge.indexOf('async function reconcile(',s),body=bridge.slice(s,e);assert.ok(body.indexOf('CX_TYA_PUBLISH_LIVE_SNAPSHOT_CANDIDATE')<body.indexOf('window.CX_PROTECTED_AUTH_HR_AUTHORITY=')&&body.indexOf('window.CX_PROTECTED_AUTH_HR_AUTHORITY=')<body.indexOf("cx:protected-auth-hr-authority-ready"));assert.match(body,/suppressEvents:true/);assert.match(body,/HR_LIVE_REVISION_PUBLICATION_MISMATCH/);});
test('A05 backend refresh awaits atomic composition readback',()=>{assert.match(bridge,/let composed=await reconcile\('backend_refresh_dynamic'\)/);assert.match(bridge,/BACKEND_REFRESH_ATOMIC_COMPOSITION_REQUIRED/);assert.match(bridge,/BACKEND_REFRESH_READBACK_REVISION_MISMATCH/);assert.doesNotMatch(bridge,/schedule\('backend_refresh_dynamic',true\);return s;/);});
test('A05 human gate and watcher require same-revision atomic authority',()=>{assert.match(c6,/authority\?\.atomicPublication===true/);assert.match(c6,/authorityRevision===sourceRevision/);assert.match(watcher,/authority\.atomicPublication===true/);assert.match(watcher,/authorityRevision===dataRevision/);assert.match(watcher,/CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE\?\.\('live_watcher_revision_change',true\)/);});
import vm from 'node:vm';
function bootSchedulerHarness({isAuthorized=true,dependenciesReady=true}={}){
  const start=bridge.indexOf('function schedule(reason,reset)'),end=bridge.indexOf('\nfunction bind()',start);
  assert.ok(start>=0&&end>start);
  const pending=new Map();let serial=0,ready=false,calls=0;
  const sandbox={
    window:{dispatchEvent(){}},CX:{dataSource:{}},
    context:()=>({}),resolveScope:()=>({}),authorized:()=>isAuthorized,
    backendReady:()=>ready,depsReady:()=>dependenciesReady,operationalSource:()=>({mode:'external'}),
    Date,CustomEvent:class{constructor(type){this.type=type;}},
    setTimeout(fn,delay){const id=++serial;pending.set(id,{fn,delay});return id;},
    clearTimeout(id){pending.delete(id);},
    async reconcile(){calls++;sandbox.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true,at:new Date().toISOString()};return{ok:true};}
  };
  vm.runInNewContext("let bootTimer=null,bootAttempt=0,bootForce=false,bootReason='',reconciling=false;const BOOT_MAX_ATTEMPTS=180;\n"+bridge.slice(start,end)+"\nthis.invoke=schedule;this.setReconciling=value=>{reconciling=value;};",sandbox);
  return{
    invoke:sandbox.invoke,setReconciling:sandbox.setReconciling,
    setReady(value){ready=value;},calls:()=>calls,ids:()=>[...pending.keys()],delays:()=>[...pending.values()].map(t=>t.delay),
    setApplied(){sandbox.window.CX_PROTECTED_AUTH_HR_AUTHORITY={applied:true,at:new Date().toISOString()};},
    async runNext(){const entry=pending.entries().next().value;assert.ok(entry,'pending callback required');pending.delete(entry[0]);await entry[1].fn();}
  };
}
test('VRM134 ready event wakes the pending 325ms readiness poll immediately',async()=>{
  const h=bootSchedulerHarness();h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();
  assert.deepEqual(h.delays(),[325]);h.setReady(true);h.invoke('backend_ready_firestore_dynamic',true);
  assert.deepEqual(h.delays(),[0]);await h.runNext();assert.equal(h.calls(),1);assert.deepEqual(h.delays(),[]);
});
test('VRM134 ready event wakes the capped 2000ms readiness poll immediately',async()=>{
  const h=bootSchedulerHarness();h.invoke('script_ready_authenticated_context_restore',true);
  for(let i=0;i<24;i++)await h.runNext();
  assert.deepEqual(h.delays(),[2000]);h.setReady(true);h.invoke('backend_ready_firestore_dynamic',true);
  assert.deepEqual(h.delays(),[0]);await h.runNext();assert.equal(h.calls(),1);
});
test('VRM134 duplicate ready events retain one immediate callback and one reconciliation',async()=>{
  const h=bootSchedulerHarness();h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();h.setReady(true);
  h.invoke('backend_ready_firestore_dynamic',true);h.invoke('backend_ready_dynamic');
  assert.deepEqual(h.delays(),[0]);await h.runNext();assert.equal(h.calls(),1);assert.deepEqual(h.delays(),[]);
});
test('VRM134 passive focus does not replace a pending readiness timer',async()=>{
  const h=bootSchedulerHarness();h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();const ids=h.ids();
  h.invoke('window_focus_restored_session');assert.deepEqual(h.ids(),ids);assert.deepEqual(h.delays(),[325]);assert.equal(h.calls(),0);
});
test('VRM134 active reconciliation is not interrupted or overlapped',async()=>{
  const h=bootSchedulerHarness();h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();const ids=h.ids();
  h.setReconciling(true);h.setReady(true);h.invoke('backend_ready_firestore_dynamic',true);
  assert.deepEqual(h.ids(),ids);assert.equal(h.calls(),0);
});
test('VRM134 waking a poll does not bypass principal authorization',async()=>{
  const h=bootSchedulerHarness({isAuthorized:false});h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();
  h.setReady(true);h.invoke('backend_ready_firestore_dynamic',true);await h.runNext();
  assert.equal(h.calls(),0);assert.equal(h.delays().length,1);assert.ok(h.delays()[0]>0);
});
test('VRM134 waking a poll does not bypass dependency readiness',async()=>{
  const h=bootSchedulerHarness({dependenciesReady:false});h.invoke('script_ready_authenticated_context_restore',true);await h.runNext();
  h.setReady(true);h.invoke('backend_ready_firestore_dynamic',true);await h.runNext();assert.equal(h.calls(),0);
});
test('VRM134 a fresh applied authority still ignores passive readiness echoes',()=>{
  const h=bootSchedulerHarness();h.setReady(true);h.setApplied();h.invoke('backend_ready_firestore_dynamic',true);
  assert.deepEqual(h.delays(),[]);assert.equal(h.calls(),0);
});
