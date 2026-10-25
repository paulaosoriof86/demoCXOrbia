import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const backend=readFileSync(new URL('../../app/core/backend-bulletins.js',import.meta.url),'utf8');
const topbar=readFileSync(new URL('../../app/core/topbar.js',import.meta.url),'utf8');
const start=backend.indexOf('  function noticeHumanCopy(d){');
const end=backend.indexOf('  function normalize(doc, readSet){',start);
assert.ok(start>=0&&end>start);
const human=vm.runInNewContext('('+backend.slice(start,end).trim()+')');
test('R22 human messages remain unchanged',()=>{
  assert.equal(human({body:'Tu visita fue asignada. Lee los detalles.',entityType:'visit',type:'alert'}),'Tu visita fue asignada. Lee los detalles.');
});
test('R22 historical technical IDs never appear in human cancellation/reprogram messages',()=>{
  const cancel=human({body:'Decisión rechazada para visita hr_2026_oct_27. Revisa el estado en Mis Visitas.',entityType:'visit',type:'cancel'});
  const rep=human({body:'Solicitud registrada para visita hr_2026_oct_26 · 2026-10-17',entityType:'visit',type:'reprog'});
  assert.match(cancel,/no fue aprobada/);assert.match(rep,/reprogramación/);
  assert.doesNotMatch(cancel+rep,/hr_2026|oct_27|oct_26/);
});
test('R22 no invented approval for ambiguous source',()=>{
  const msg=human({body:'OPS_VISIT_UPDATE para visita hr_2026_oct_12',entityType:'visit',type:'cancel'});
  assert.match(msg,/actualización/);assert.doesNotMatch(msg,/aprobada|rechazada|OPS_|hr_2026/);
});
test('R22 source body is immutable; only presentation uses transformed text',()=>{
  assert.match(backend,/txt: d\.body \|\| d\.text \|\| ''/);
  assert.match(backend,/displayText: noticeHumanCopy\(d\)/);
  assert.match(topbar,/String\(n\?\.displayText\?\?n\?\.txt\?\?''\)/);
});
