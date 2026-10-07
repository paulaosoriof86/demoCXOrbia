import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');

test('B1 Mi Dia emits distinct state-aware action intents',()=>{const s=read('app/modules/midia.js');assert.match(s,/data-visit-action="schedule"/);assert.match(s,/data-visit-action="instructive"/);assert.match(s,/data-visit-action="reschedule"/);assert.match(s,/CX_PENDING_SHOPPER_VISIT_ACTION/);assert.doesNotMatch(s,/data-cgo="misvisitas">📅 Agendar[\s\S]{0,250}data-cgo="misvisitas">📄 Instructivo/);});
test('B1 Mi Dia renders scheduled date and state-aware primary action',()=>{const s=read('app/modules/midia.js');assert.match(s,/const scheduledDate=/);assert.match(s,/vf\.scheduled[\s\S]{0,350}data-visit-action="reschedule"/);assert.match(s,/Agendada.*scheduledDate/);});
test('B1 Mi Dia certification uses durable and carryover authority',()=>{const s=read('app/modules/midia.js');assert.match(s,/backendCertifications\?\.durableCurrent/);assert.match(s,/backendCertifications\?\.carryoverDecision/);});
test('Mis Visitas loads resource authority before declaring instructive absent',()=>{const s=read('app/modules/misvisitas.js');assert.match(s,/await CX\.backendResources\.load\(resourceScope\)/);assert.match(s,/Confirmo que lo he leído/);assert.match(s,/recordResourceReadReceipt/);});
test('Mis Visitas no silently disables schedule prerequisites',()=>{const s=read('app/modules/misvisitas.js');assert.match(s,/aria-disabled="true" title="Completa instructivo y certificación antes de agendar"/);assert.match(s,/Completa primero el instructivo y la certificación requerida/);});
test('HR authority retry is bounded and reset storms cannot zero active retry counter',()=>{const s=read('app/adapters/tya-protected-auth-hr-authority-bridge-v2.js');assert.match(s,/BOOT_MAX_ATTEMPTS=30/);assert.match(s,/if\(reset===true\)\{bootForce=true;if\(!bootTimer&&!reconciling\)bootAttempt=0;/);assert.match(s,/No fue posible validar la fuente operacional en el tiempo esperado/);});
