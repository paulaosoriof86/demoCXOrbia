import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(process.env.CXORBIA_WATCHER_TEST_SOURCE||'app/adapters/tya-live-source-refresh-watch-v2.js','utf8');
function setup({pollMs,visible=true,externalReadCurrent=false,sourceReadAgeMs=0}={}){
  let now=Date.parse('2026-11-24T15:00:00Z'),revision='rev-a',fail=false,hold=null;
  const requests=[],intervals=[],winEvents=new Map(),docEvents=new Map(),reconciles=[];
  const ctx={authenticated:true,tenantId:'tenant-a',projectIds:['project-a'],role:'admin',authNamespace:'admin'};
  const user={uid:'admin-a'};
  const CX={data:{currentProjectId:'project-a',projects:[{id:'period-a'}],_visitas:[{id:'visit-a'}],sourceMode:'tya_hr_live_all_periods_plus_firestore_exact_overlay_dev',previewMeta:{sourceRevision:'rev-a'},__backendAllProjectRecords:[]},dataSource:{sourceRef:'hr-live-all-periods+firestore-authenticated-exact-overlay',badge:()=>({c:'#070',t:'Lista'})},backendAuth:{context:()=>ctx},bus:{on(){},emit(){}},session:{view:'midia'}};
  const window={CX,CX_TYA_LIVE_POLL_MS:pollMs,firebase:{auth:()=>({currentUser:user})},CX_PROTECTED_AUTH_HR_AUTHORITY:{applied:true,atomicPublication:true,tenantId:'tenant-a',projectId:'project-a',actorUid:'admin-a',role:'admin',authNamespace:'admin',sourceRevision:'rev-a',at:new Date(now).toISOString(),externalReadCurrent,sourceReadAt:new Date(now-sourceReadAgeMs).toISOString()},CX_PROTECTED_AUTH_HR_BOOT_RECONCILE:{ready:true,completed:true,sourceRevision:'rev-a'},addEventListener:(name,fn)=>winEvents.set(name,fn),CX_SCHEDULE_PROTECTED_AUTH_HR_RECONCILE:(...args)=>reconciles.push(args)};
  const document={visibilityState:visible?'visible':'hidden',body:{},getElementById:()=>null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:(name,fn)=>docEvents.set(name,fn)};
  class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
  vm.runInNewContext(source,{window,CX,document,Date:ClockDate,URLSearchParams,location:{search:'?cxProtectedRuntime=YES_PAULA_20260730_PROTECTED_DEV&cxHumanFullVisual=YES_PAULA_20260731_FULL_PROFILE_DEV'},console,fetch:async url=>{requests.push(String(url));if(hold)await hold;if(fail)throw Error('HTTP 503');return{ok:true,json:async()=>({sourceSafe:true,runtimeRead:true,revision,externalReadCurrent:true,sourceReadAt:new Date(now).toISOString()})};},setInterval:(fn,ms)=>{intervals.push({fn,ms});return 1;},setTimeout:()=>0,requestAnimationFrame:fn=>fn()});
  return{window,CX,document,ctx,user,requests,intervals,reconciles,advance:ms=>now+=ms,check:reason=>window.CX_TYA_CHECK_LIVE_SOURCE(reason),ready:()=>winEvents.get('cx:protected-auth-hr-authority-ready')(),focus:()=>winEvents.get('focus')(),setRevision:value=>revision=value,setFailure:value=>fail=value,setHold:value=>hold=value};
}

test('VRM372 default watcher and deployed entrypoint use a five-minute automatic interval',()=>{
  const h=setup();assert.equal(h.intervals[0].ms,300000);
  assert.match(fs.readFileSync('app/index-backend-dev.html','utf8'),/CX_TYA_LIVE_POLL_MS=300000/);
});
test('VRM372 hidden automatic triggers perform zero external reads; explicit refresh remains available',async()=>{
  const h=setup({visible:false});for(const reason of ['poll','window_focus','visibility_resume','initial_load','backend_auth_ready','canonical_authority_ready'])await h.check(reason);
  assert.equal(h.requests.length,0);await h.check('manual_refresh');assert.equal(h.requests.length,1);assert.match(h.requests[0],/fresh=1/);
});
test('VRM372 focus, visibility, auth and timer events coalesce within one scoped interval',async()=>{
  const h=setup();await h.focus();for(const reason of ['visibility_resume','backend_auth_ready','initial_load','poll','canonical_authority_ready'])await h.check(reason);
  assert.equal(h.requests.length,1);h.advance(299999);assert.equal((await h.check('poll')).skipped,true);
  h.advance(1);await h.check('poll');assert.equal(h.requests.length,2);
});
test('VRM372 a newly visible overdue session reads immediately and retains fresh=1',async()=>{
  const h=setup({visible:false});h.advance(600000);await h.check('poll');h.document.visibilityState='visible';await h.check('visibility_resume');
  assert.equal(h.requests.length,1);assert.match(h.requests[0],/fresh=1/);
});
test('VRM372 manual refresh bypasses the automatic interval and then suppresses a duplicate automatic read',async()=>{
  const h=setup();await h.check('poll');await h.check('manual_refresh');await h.check('poll');assert.equal(h.requests.length,2);
});
test('VRM372 provider failure is visible and does not create a focus/visibility retry storm',async()=>{
  const h=setup();h.setFailure(true);await h.check('poll');await h.focus();await h.check('visibility_resume');assert.equal(h.requests.length,1);
  assert.match(h.CX.dataSource.warnings[0],/HTTP 503/);h.advance(300000);h.setFailure(false);await h.check('poll');assert.equal(h.requests.length,2);
});
test('VRM372 automatic attempt keys do not cross tenant, project, actor, role or auth namespace',async()=>{
  const h=setup();await h.check('poll');h.user.uid='admin-b';await h.check('poll');h.ctx.role='operative';await h.check('poll');h.ctx.authNamespace='staff';await h.check('poll');h.ctx.tenantId='tenant-b';await h.check('poll');h.CX.data.currentProjectId='project-b';h.ctx.projectIds=['project-b'];await h.check('poll');assert.equal(h.requests.length,6);
});
test('VRM372 a last-confirmed durable bootstrap never postpones the first external check',async()=>{
  const h=setup({externalReadCurrent:false});await h.ready();assert.equal(h.requests.length,1);await h.check('poll');assert.equal(h.requests.length,1);
});
test('VRM372 exact fresh protected bootstrap shares its real read timestamp with automatic scheduling',async()=>{
  const h=setup({externalReadCurrent:true,sourceReadAgeMs:1000});await h.ready();await h.check('poll');assert.equal(h.requests.length,0);
  h.advance(299000);await h.check('poll');assert.equal(h.requests.length,1);
});
test('VRM372 invalid or future freshness timestamps never suppress the initial read',async()=>{
  for(const value of ['invalid','2026-11-24T15:00:01Z','2026-11-24T14:50:00Z']){const h=setup({externalReadCurrent:true});h.window.CX_PROTECTED_AUTH_HR_AUTHORITY.sourceReadAt=value;await h.ready();assert.equal(h.requests.length,1);await h.check('poll');assert.equal(h.requests.length,1);}
});
test('VRM372 closing a deferred editor rereads the latest revision inside the automatic interval',async()=>{
  const h=setup();h.document.activeElement={tagName:'INPUT'};h.setRevision('rev-b');await h.check('poll');h.setRevision('rev-c');h.document.activeElement=h.document.body;
  const result=await h.window.CX_TYA_FLUSH_PENDING_STABLE_RERENDER();assert.equal(result.revision,'rev-c');assert.equal(h.requests.length,2);assert.deepEqual(h.reconciles,[['live_watcher_revision_change',true]]);
});
test('VRM372 concurrent triggers share the existing in-flight check',async()=>{
  const h=setup();let release;h.setHold(new Promise(resolve=>{release=resolve;}));const pending=h.check('poll');await h.focus();await h.check('manual_refresh');assert.equal(h.requests.length,1);release();await pending;
});
test('VRM372 unauthenticated human and internal project never trigger external HR',async()=>{
  const h=setup();h.ctx.authenticated=false;await h.check('manual_refresh');h.ctx.authenticated=true;h.CX.data.__backendAllProjectRecords=[{id:'project-a',operationalSource:{mode:'internal'}}];await h.check('manual_refresh');assert.equal(h.requests.length,0);
});
test('VRM372 malformed configured intervals fall back safely and valid configuration is retained',()=>{
  for(const pollMs of [undefined,NaN,'invalid',0,-1])assert.equal(setup({pollMs}).intervals[0].ms,300000);
  assert.equal(setup({pollMs:600000}).intervals[0].ms,600000);assert.equal(setup({pollMs:1}).intervals[0].ms,15000);
});

test('VRM372 a ready event from another role or namespace cannot postpone the current context check',async()=>{
  for(const field of ['role','authNamespace']){const h=setup({externalReadCurrent:true});h.ctx[field]='different';await h.ready();assert.equal(h.requests.length,1);}
});
