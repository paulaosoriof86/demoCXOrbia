import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateVisitDateWindow} from '../../cxorbia-operational-command-provider-v1.mjs';
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
