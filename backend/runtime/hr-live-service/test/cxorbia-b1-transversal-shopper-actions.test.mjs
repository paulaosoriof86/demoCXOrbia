import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('B1 Mi Dia emits distinct state-aware action intents',()=>{const s=read('app/modules/midia.js');assert.match(s,/data-visit-action="schedule"/);assert.match(s,/data-visit-action="instructive"/);assert.match(s,/data-visit-action="reschedule"/);assert.match(s,/CX_PENDING_SHOPPER_VISIT_ACTION/);assert.doesNotMatch(s,/data-cgo="misvisitas">📅 Agendar[\s\S]{0,250}data-cgo="misvisitas">📄 Instructivo/);});
test('B1 Mi Dia renders scheduled date and state-aware primary action',()=>{const s=read('app/modules/midia.js');assert.match(s,/const scheduledDate=/);assert.match(s,/const scheduleDisplayActive=!!vf\.scheduled\|\|platformPending/);assert.match(s,/const shopperActionButtons=nextVisit\?\(pendingOperationalRequest[\s\S]{0,420}:scheduleDisplayActive[\s\S]{0,125}data-visit-action="reschedule"/);assert.match(s,/pendiente de autorización/);assert.match(s,/Agendada.*scheduledDate/);});
test('B1 Mi Dia certification uses durable and carryover authority',()=>{const s=read('app/modules/midia.js');assert.match(s,/backendCertifications\?\.durableCurrent/);assert.match(s,/backendCertifications\?\.carryoverDecision/);});
test('Mis Visitas loads resource authority before declaring instructive absent',()=>{const s=read('app/modules/misvisitas.js');assert.match(s,/await CX\.backendResources\.load\(resourceScope\)/);assert.match(s,/Confirmo que lo he leído/);assert.match(s,/recordResourceReadReceipt/);});
test('Mis Visitas no silently disables schedule prerequisites',()=>{const s=read('app/modules/misvisitas.js');assert.match(s,/aria-disabled="true" title="Completa instructivo y certificación antes de agendar"/);assert.match(s,/Completa primero el instructivo y la certificación requerida/);});
test('HR authority retry is bounded and reset storms cannot zero active retry counter',()=>{const s=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');assert.match(s,/BOOT_MAX_ATTEMPTS=30/);assert.match(s,/if\(reset===true\)\{bootForce=true;if\(!bootTimer&&!reconciling\)bootAttempt=0;/);assert.match(s,/No fue posible validar la fuente operacional en el tiempo esperado/);});

test('B1 human retest: modal lifecycle and command progress are owned explicitly',()=>{
  const ui=read('app/core/ui.js'),router=read('app/core/router.js'),mv=read('app/modules/misvisitas.js');
  assert.match(ui,/closeAllModals\s*\(\)/);assert.match(ui,/opts\.replaceExisting===true/);
  assert.match(router,/CX\.ui\?\.closeAllModals\?\.\(\)/);
  assert.match(mv,/Guardando…/);assert.match(mv,/Actualizando información…/);
  assert.match(mv,/replaceExisting:true/);assert.match(mv,/dismissOnBackdrop:false/);
  assert.doesNotMatch(mv,/ui\.toast\('Visita agendada correctamente'/);
});
test('B1/B3 canonical schedule source retains HR authority and labels exact provider date separately',()=>{
  const m=read('app/adapters/tya-cumulative-read-model-v2.js'),mi=read('app/modules/midia.js'),mv=read('app/modules/misvisitas.js');
  assert.match(m,/out\.platformSchedulePendingHr=\{date:providerScheduleDate,status:'pending_hr'/);
  assert.match(m,/durableCanonical===canonical/);
  assert.match(mi,/Registrada · pendiente HR/);
  assert.match(mv,/pendingSchedule\(v\)/);
  assert.match(mv,/return !!facets\(v\)\.scheduled&&!!d&&today\(\)>=d/);
});
test('B1/B3 visual recovery protects approved marketplace and uses accessible shopper scale',()=>{
  const css=read('app/styles/layout.css');
  assert.match(css,/body\.role-shopper \.cx-visit-location\{font-size:14px/);
  assert.match(css,/body\.role-shopper \.cx-day-progress-step span\{font-size:13px/);
  assert.match(css,/\.cx-modal-premium-workflow\{width:min\(640px/);
});

test('B1 human regression: exact provider date survives HR status overwrite in a separate pending display field',()=>{
  const s=read('app/adapters/tya-cumulative-read-model-v2.js');
  assert.match(s,/providerScheduleExact=!conflict/);
  assert.ok(s.includes("!['cancelada','archivada','disponible'].includes(str(pv.estado||pv.status).toLowerCase())"));
  assert.match(s,/platformSchedulePendingHr=/);
});
test('B1/B3 instructive and reschedule dialogs use the recovered scoped premium modal',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.match(s,/ui.modal\('🔄 Solicitar reprogramación'/);
  assert.match(s,/premium:true,replaceExisting:true,dismissOnBackdrop:false,onMount:/);
  assert.match(s,/Recurso del proyecto/);
});
