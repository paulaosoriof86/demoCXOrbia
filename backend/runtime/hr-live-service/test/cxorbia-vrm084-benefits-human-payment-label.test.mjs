import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source=fs.readFileSync(new URL('../../../../app/modules/beneficios.js',import.meta.url),'utf8');

test('VRM-084 shopper benefits never renders internal payment state as UI text',()=>{
  assert.match(source,/pending_source_confirmation','preview','pending','pendiente','pending_payment'\]\.includes\(key\)\)return \['Pendiente de confirmación','a'\]/);
  assert.doesNotMatch(source,/ui\.bdg\(vc\.paymentState/);
  assert.match(source,/Estado de pago/);
});

test('VRM-084 payment human label remains fail-closed for unknown technical states',()=>{
  assert.match(source,/return \['Pendiente de validación','a'\]/);
  assert.match(source,/\['confirmado','confirmed','paid','pagada'\]\.includes\(key\)\)return \['Pago confirmado','g'\]/);
});
