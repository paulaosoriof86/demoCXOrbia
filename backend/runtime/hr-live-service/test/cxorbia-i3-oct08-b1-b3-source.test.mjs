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
