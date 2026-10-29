import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../../app/modules/finanzas.js',import.meta.url),'utf8');
const start=source.indexOf('function cxFinanceReviewState(');
const end=source.indexOf('function cxFinanceLiquidationEligibility(',start);
assert.ok(start>0&&end>start,'financial status owner not found');
const review=vm.runInNewContext(source.slice(start,end)+'\ncxFinanceReviewState;');

test('B8 distinguishes known operational amounts from externally reconciled payable amounts',()=>{
  const r=review({total:205,moneda:'Q',financialSourceStatus:'pending_financial_source'},[]);
  assert.match(r.obligation,/operativo/i);
  assert.match(r.obligation,/pendiente|sin confirmar/i);
  assert.equal(r.paid,false);
  assert.equal(r.exact,false);
  const missing=review({total:null,moneda:'Q',financialSourceStatus:'pending_financial_source'},['monto total']);
  assert.match(missing.obligation,/pendiente/i);
  assert.doesNotMatch(missing.obligation,/operativo conocido/i);
});

test('B8 never displays internal shopper codes or AI-provider implementation labels in ordinary Finance UI',()=>{
  assert.doesNotMatch(source,/\$\{l\.shopperCode\|\|''\}/);
  assert.doesNotMatch(source,/Gemini no conectado/);
  assert.doesNotMatch(source,/Análisis crítico determinístico/);
});

test('B8 reconciled source and authenticated payment are not inferred from provisional amount',()=>{
  const r=review({total:205,moneda:'Q',financialSourceStatus:'reconciled_exact',
    paymentConfirmed:true,externalPaymentConfirmed:false,paymentSourceRef:''},[]);
  assert.equal(r.exact,true);
  assert.equal(r.paid,false);
  assert.match(r.payment,/Sin pago confirmado/);
});
