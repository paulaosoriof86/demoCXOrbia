import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('B1 shopper rail resolves the exact canonical shopper before rendering identity',()=>{
  const s=read('app/core/router.js');
  assert.match(s,/resolveExactSessionShopper/);
  assert.match(s,/railDisplayName/);
  assert.match(s,/identity\.canonical/);
  assert.match(s,/role==='shopper'\?railDisplayName/);
});

test('B1 Mi Dia uses the same exact canonical identity owner for name and private shopper id',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/const exactSessionIdentity=/);
  assert.match(s,/resolveExactSessionShopper/);
  assert.match(s,/const sessionShopperId=/);
  assert.match(s,/const sessionShopperDisplayName=/);
  assert.doesNotMatch(s,/Hola, '\+CX\.session\.user\.name/);
  assert.match(s,/Hola, '\+\(_shopperDisplayName\.split/);
  assert.match(s,/Buen día, '\+\(CX\.session\.user\.name\.split/);
});

test('B1 Mi Dia reuses the accepted Mis Visitas visual language instead of a new frontend',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/cx-shopper-visit-card/);
  assert.match(s,/cx-visit-card-head/);
  assert.match(s,/cx-visit-kicker/);
  assert.match(s,/cx-visit-title/);
  assert.match(s,/cx-visit-payline/);
  assert.match(s,/cx-visit-actions/);
  assert.match(s,/cx-day-progress-card/);
});

test('B1 preserves active-period and exact-assignment filters',()=>{
  const s=read('app/modules/midia.js');
  assert.match(s,/recordPeriodId===String\(data\.currentPeriodId/);
  assert.match(s,/f\.assigned===true&&f\.realized!==true&&f\.cancelled!==true/);
});
