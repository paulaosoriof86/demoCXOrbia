import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const visitas = readFileSync(new URL('../../app/modules/visitas.js', import.meta.url), 'utf8');

const block = visitas.match(/const paymentContractBadge=\(rawState\)=>\{[\s\S]*?\n  \};/);
assert.ok(block, 'Visitas must render a human payment badge from its contract state');
const paymentContractBadge = runInNewContext(
  `(()=>{const ui={bdg:(label,style)=>({label,style})}; ${block[0]} return paymentContractBadge;})()`,
);

test('Admin visit detail keeps unpaid provider state visible but human-readable', () => {
  const actual = paymentContractBadge('pending_source_confirmation');
  assert.equal(actual.label, 'Pendiente de confirmación');
  assert.equal(actual.style, 'a');
  assert.match(visitas, /Pago \(contrato\)<\/div><div>\$\{paymentContractBadge\(vc\.paymentState\)\}/);
  assert.doesNotMatch(visitas, /ui\.bdg\(vc\.paymentState/);
});

test('Confirmed payment is the only green badge and unknown states fail closed', () => {
  assert.deepEqual({...paymentContractBadge('confirmado')}, {label:'Pago confirmado',style:'g'});
  assert.deepEqual({...paymentContractBadge('payment_confirmed')}, {label:'Pago confirmado',style:'g'});
  assert.deepEqual({...paymentContractBadge('pending_financial_source')}, {label:'Pendiente de fuente financiera',style:'a'});
  assert.deepEqual({...paymentContractBadge('novel_provider_enum')}, {label:'Pendiente de validación',style:'a'});
});
