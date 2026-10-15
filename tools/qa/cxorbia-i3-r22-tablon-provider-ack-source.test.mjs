import {readFileSync} from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
const file=readFileSync(new URL('../../app/modules/tablon.js',import.meta.url),'utf8');
test('Tablon does not report date confirmed on local notification only',()=>{
 assert.doesNotMatch(file,/ui\.toast\('Fecha confirmada · equipo notificado'/);
 assert.doesNotMatch(file,/CX\.notif\.push\(\{to:'admin',tipo:'confirmada'/);
});
test('Tablon proposes dates only in the exact provider-backed visit owner',()=>{
 assert.match(file,/beginVisitAction\(b\.dataset\.prop,'reschedule'\)/);
 assert.match(file,/exact\.nav!=='misvisitas'\|\|!exact\.visitId/);
 assert.match(file,/CX\.router\.nav\('misvisitas'\)/);
});
test('Tablon confirms only via the exact visit, never via notice alone',()=>{
 assert.match(file,/beginVisitAction\(b\.dataset\.conf,'schedule'\)/);
 assert.match(file,/returnView:'tablon'/);
 assert.doesNotMatch(file,/ui\.toast\('Propuesta enviada · pendiente de autorización'/);
});
test('Tablon action requires shopper role and remote read ack cannot claim date confirmation',()=>{
 assert.match(file,/role!=='shopper'\|\|!notice/);
 assert.match(file,/notice\.source==='firestore'&&ack\?\.providerAck!==true/);
 assert.match(file,/La fecha todavía no se ha modificado/);
});
