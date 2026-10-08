import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateVisitDateWindow,planVisitCancelDecision} from '../../cxorbia-operational-command-provider-v1.mjs';
const read=path=>fs.readFileSync(path,'utf8');
const visit={franjaCode:'WK',quincena:'QUINCENA 1',periodKey:'2026-10',disponibleDesde:'2026-10-01'};
const options={timezone:'America/Guatemala',nowDate:'2026-10-08'};
test('date guards reject Saturday for weekday visit and allow correct Friday',()=>{
  assert.throws(()=>validateVisitDateWindow(visit,'2026-10-10',options),/OPS_SCHEDULE_WEEKDAY_REQUIRED/);
  assert.equal(validateVisitDateWindow(visit,'2026-10-09',options),'2026-10-09');
});
test('date guards retain source month and quincena restrictions',()=>{
  assert.throws(()=>validateVisitDateWindow(visit,'2026-10-16',options),/OPS_SCHEDULE_QUINCENA_RANGE/);
  assert.throws(()=>validateVisitDateWindow(visit,'2026-11-09',options),/OPS_SCHEDULE_MONTH_MISMATCH/);
  assert.throws(()=>validateVisitDateWindow(visit,'2026-10-32',options),/OPS_SCHEDULE_DATE_REQUIRED/);
});
test('weekend-only branch is not globally restricted to weekdays',()=>{
  const wknd={...visit,franjaCode:'WKND'};
  assert.throws(()=>validateVisitDateWindow(wknd,'2026-10-09',options),/OPS_SCHEDULE_WEEKEND_REQUIRED/);
  assert.equal(validateVisitDateWindow(wknd,'2026-10-10',options),'2026-10-10');
});
test('B1 authenticated boot avoids forced fresh HR on each protected navigation',()=>{
  const s=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.doesNotMatch(s,/protectedState:'1',fresh:'1'/);
  assert.match(s,/protectedState:'1',ts:String\(Date\.now\(\)\)/);
});
test('B3 request projection is exact and never promotes HR-managed scheduled KPI',()=>{
  const s=read('app/adapters/tya-cumulative-read-model-v2.js');
  assert.match(s,/for\(const field of \['rescheduleRequest','cancelRequest'\]\)/);
  assert.match(s,/durableCanonical===canonical/);
});
test('B3 cancel requires reason and consent; no in-memory-only admin notification',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.match(s,/cxCancelReason/);
  assert.match(s,/El motivo es obligatorio/);
  assert.match(s,/requestVisitCancel\(v.id,\{ackAware:true,requestOnly:true,reason\}\)/);
  assert.doesNotMatch(s,/CX\.notif&&CX\.notif\.push\(\{to:'admin',tipo:'cancel'/);
});
test('B3 provider writes exact durable bulletin with request command receipt',()=>{
  const s=read('backend/runtime/cxorbia-operational-command-provider-v1.mjs');
  assert.match(s,/tx\.set\(r\.bulletins\.doc\(bulletinId\)/);
  assert.match(s,/OPS_RESCHEDULE_REASON_REQUIRED/);
  assert.match(s,/OPS_CANCEL_REASON_REQUIRED/);
});
test('B7 admin request queue is derived from exact visit requests',()=>{
  const s=read('app/modules/postulaciones.js');
  assert.match(s,/v\.rescheduleRequest\?\.status==='pending_review'/);
  assert.match(s,/v\.cancelRequest\?\.status==='pending_review'/);
});
test('B1 authorized HR singleflight overlaps Firestore with scoped identity and revision readback',()=>{
  const s=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');
  assert.match(s,/function scopedPrefetchKey\(scope,user\)/);
  assert.match(s,/primeHrPrefetch\(\);schedule\('backend_auth_ready_restored_session'\)/);
  assert.match(s,/const fetched=await consumeHrPrefetch\(scope\)/);
  assert.match(s,/Date\.now\(\)-result\.receivedAt<=10000/);
  assert.match(s,/counts:validateSnapshot\(snapshot,scope\)/);
});
test('B1 Mi Día does not invite duplicate reprogramming after durable pending request',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/pendingOperationalRequest/);
  assert.match(s,/pendiente de autorización/);
});
test('B3 checkin informational badge does not claim unconfirmed ACK',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.doesNotMatch(s,/>Guardado con ACK<\/span>/);
  assert.match(s,/latestCheckInEvidenceId/);
});

test('I3 B1 protected provider reads begin concurrently and remain scoped to the verified shopper',async()=>{
  const source=read('backend/runtime/hr-live-service/server.mjs');
  const begin=source.indexOf('async function protectedPlatformState(current,principal,scope,operational){');
  const end=source.indexOf('\nfunction shopperPolicy(snapshot){',begin);
  assert.ok(begin>0&&end>begin,'exact provider owner is present');
  const fnBody=source.slice(begin,end);
  assert.match(fnBody,/await Promise\.all\(\[\s*crosswalkRead,scopedReads,governanceReads,commercialRead,academyRead/);
  const waiting=new Map();
  const wait=(name)=>new Promise(resolve=>waiting.set(name,resolve));
  const ref=(parts=[])=>({
    collection(name){return ref([...parts,name]);},
    doc(id){return ref([...parts,id]);},
    where(field,op,value){assert.equal(field,'shopperId');assert.equal(op,'==');assert.equal(value,'shopper-test');return {get:()=>wait(parts.join('/')+':shopper')};},
    get(){return wait(parts.join('/'));}
  });
  const fn=new Function('operationalSnapshot','exactHrCrosswalk','commercialTenantState','academyTenantState',fnBody+'\nreturn protectedPlatformState;')(
    c=>structuredClone(c.snapshot),
    ()=>wait('crosswalk'),
    ()=>wait('commercial'),
    ()=>wait('academy')
  );
  const current={revision:'rev-test',snapshot:{visits:[],shoppers:[],posts:[]}};
  const principal={role:'shopper',shopperId:'shopper-test',db:{collection:name=>ref([name])}};
  const operation=fn(current,principal,{tenantId:'tenant-test',projectId:'project-test'},true);
  assert.equal(waiting.size,7,'four independent project reads + crosswalk + academy + commercial start before any response');
  const observed=[...waiting.keys()].sort();
  assert.ok(observed.some(x=>x.includes('projects/project-test/certifications:shopper')));
  assert.ok(observed.some(x=>x.includes('projects/project-test/reservations:shopper')));
  for(const [key,release] of waiting.entries()){
    if(key==='crosswalk')release(new Map());
    else if(key==='commercial')release({clients:[],accounts:[],contacts:[],opportunities:[],columns:[]});
    else if(key==='academy')release({courses:[],categories:[],audit:[]});
    else release({docs:[]});
  }
  const result=await operation;
  assert.equal(result.protectedState.sourceRevision,'rev-test');
  assert.equal(result.protectedState.certifications.length,0);
  assert.equal(result.protectedState.reservations.length,0);
  assert.equal(result.protectedState.crosswalkTokenCount,0);
  assert.equal(result.protectedState.identityAuthority,'hr_exact_crosswalk');
});

test('I3 B5 benefits newest first, detailed overview KPIs and explicit row detail access',()=>{
  const s=read('app/modules/beneficios.js');
  assert.match(s,/dateKey\(b\)\.localeCompare\(dateKey\(a\)\)/);
  assert.match(s,/const overviewDrills=/);
  assert.match(s,/data-ben-overview=/);
  assert.match(s,/cx-ben-row-action/);
  assert.match(s,/De la liquidación más reciente a la más antigua/);
});

test('B7 cancellation decision is atomic, HR-safe and retains request lineage',()=>{
  const original={id:'v1',shopperId:'shopper-1',estado:'asignada',agendada:'2026-10-09',version:4,
    canonicalFacets:{assigned:true,available:false},cancelRequest:{status:'pending_review',reason:'No puedo asistir',requestedByShopperId:'shopper-1',requestedAt:'t0'}};
  const opts={reason:'Revisado por coordinación',actorUid:'admin-1',at:'2026-10-08T21:00:00Z'};
  const approved=planVisitCancelDecision(original,{...opts,decision:'approved',sourceMode:'external'});
  assert.equal(approved.cancelRequest.status,'approved_pending_hr');
  assert.equal(approved.cancelRequest.requestedByShopperId,'shopper-1');
  assert.equal(approved.cancelRequest.reason,'No puedo asistir');
  assert.equal(approved.cancelRequest.decidedBy,'admin-1');
  assert.equal(approved.version,5);
  assert.equal(approved.estado,undefined,'external HR-managed state must not be overwritten');
  assert.equal(approved.shopperId,undefined,'external HR owner must remain assigned');
  const rejected=planVisitCancelDecision(original,{...opts,decision:'rejected',sourceMode:'external'});
  assert.equal(rejected.cancelRequest.status,'rejected');
  assert.equal(rejected.estado,undefined,'reject does not mutate visit state');
  const internal=planVisitCancelDecision(original,{...opts,decision:'approved',sourceMode:'internal'});
  assert.equal(internal.cancelRequest.status,'approved');
  assert.equal(internal.estado,'cancelada');
  assert.equal(internal.canonicalFacets.available,false);
  assert.equal(internal.canonicalFacets.cancelled,true);
  assert.throws(()=>planVisitCancelDecision(original,{...opts,decision:'invalid'}),/OPS_CANCEL_DECISION_INVALID/);
  assert.throws(()=>planVisitCancelDecision(original,{...opts,decision:'approved',reason:''}),/OPS_CANCEL_DECISION_REASON_REQUIRED/);
  assert.throws(()=>planVisitCancelDecision({...original,cancelRequest:{status:'approved'}},{...opts,decision:'approved'}),/OPS_CANCEL_REQUEST_NOT_PENDING/);
});
test('B7 exact owner UI offers both decisions with ACK and preserves external HR availability',()=>{
  const admin=read('app/modules/postulaciones.js'),shopper=read('app/modules/misvisitas.js'),backend=read('backend/runtime/cxorbia-operational-command-provider-v1.mjs');
  assert.match(admin,/data-cancel-review="approved"/);
  assert.match(admin,/data-cancel-review="rejected"/);
  assert.match(admin,/cxCancelAdminReason/);
  assert.match(admin,/requestVisitCancel\(id,\{ackAware:true,requestOnly:false,decision,reason\}\)/);
  assert.match(shopper,/cancelAwaitingHr/);
  assert.match(shopper,/pendiente de confirmación HR/);
  assert.match(backend,/OPS_CANCEL_EXTERNAL_HR_ACK_REQUIRED/);
  assert.match(backend,/OPS_CANCEL_STAFF_REQUEST_IMPERSONATION_DENIED/);
  assert.match(backend,/tx\.set\(r\.bulletins\.doc\(bulletinId\)/);
});

test('B5 historical payment authority propagates to active finance read model without inventing amounts or crossing tenant/project',()=>{
  const impl=read('app/adapters/tya-canonical-finance-read-model-v2.js');
  const historical={paymentConfirmed:true,paymentSourceRef:'recovery-lock:historical-cut:2025-12',historicalPaymentGroupId:'hist-frozen-2025'};
  function model(truth,opts={}){
    const CX={data:{tenantId:'tya',paymentHistorySnapshot:{sourceSafe:true,tenantId:'tya',projectId:'cinepolis'},
      paymentHistoryTruthForVisit:()=>truth,financialMatchForVisit:()=>opts.exact||null,__protectedVisits:[]},
      liq:{forProject:()=>[],label:()=>['Pendiente','a']}};
    const window={CX,CX_TYA_CUMULATIVE_READ_MODEL:{facets:v=>v.canonicalFacets||{}},
      CX_DEV_ENTRY_CANONICAL:{canonical:true,protectedRuntime:true,tenantId:'tya',projectId:'cinepolis'}};
    vm.runInNewContext(impl,{window,CX,URLSearchParams,location:{search:''}});
    const v={id:'qa-2025-12',visitId:'qa-2025-12',periodKey:opts.periodKey||'2025-12',
      projectId:opts.project||'cinepolis',pais:'GT',currency:'GTQ',honorario:60,realizada:'2025-12-12',
      canonicalFacets:{realized:opts.realized!==false,submitted:opts.realized!==false,paymentConfirmed:false,liquidationConfirmed:false}};
    const p={id:(opts.project||'cinepolis')+'-'+v.periodKey,periodKey:v.periodKey,
      parentProjectId:opts.project||'cinepolis',tenantId:opts.tenant||'tya'};
    return window.CX_TYA_CANONICAL_FINANCE_READ_MODEL.fromVisit(p,v);
  }
  const paid=model(historical);
  assert.equal(paid.paymentConfirmed,true);
  assert.equal(paid.paymentSourceRef,historical.paymentSourceRef);
  assert.equal(paid.historicalReconciliationConfirmed,true);
  assert.equal(paid.reviewRequired,true,'historically paid without exact financial amount remains in amount review');
  assert.equal(paid.operationalVisitStage,'submitida','payment confirmation does not rewrite HR operational progress');
  const missing=model(null);assert.equal(missing.paymentConfirmed,false,'no proof cannot produce paid state');
  assert.equal(model(historical,{project:'another-project'}).paymentConfirmed,false,'tenant/project isolation');
  assert.equal(model(historical,{tenant:'another-tenant'}).paymentConfirmed,false,'tenant isolation');
  const exact=model(historical,{exact:{financialSourceStatus:'reconciled_exact',honorario:60,total:200,moneda:'GTQ',paymentConfirmed:false}});
  assert.equal(exact.paymentConfirmed,true);
  assert.equal(exact.total,200,'exact accepted amount remains unchanged');
  assert.equal(exact.honorario,60);
  assert.equal(model(historical,{realized:false}),null,'not-realized visits do not become payable from historical evidence alone');
});
test('B2 active shopper Mi Perfil owner presents KPI overview before sensitive detail and preserves exact roles/actions',()=>{
  const src=read('app/adapters/tya-canonical-shopper-portal-v2.js');
  assert.match(src,/CX\.modules\.miperfil=render/);
  assert.match(src,/id="cxProfileSensitive"/);
  assert.ok(src.indexOf('📊 Desempeño')<src.indexOf('id="cxProfileSensitive"'));
  assert.match(src,/sensitive\.open=true/);
  for(const k of ['all','done','submitted','paid'])assert.match(src,new RegExp('data-profile-kpi="'+k+'"'));
  assert.match(src,/masked\(s\.dpi\|\|s\.documentId\)/);
  assert.match(src,/masked\(s\.ctaNum\)/);
  assert.match(src,/data-profile-visit-row/);
  assert.match(src,/data-profile-edit/);
  assert.match(src,/resolveSessionShopper\(data\)/);
  assert.match(src,/CX_RECONCILE_PROTECTED_AUTH_WITH_HR_AUTHORITY/);
});
