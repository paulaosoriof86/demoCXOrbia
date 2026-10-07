import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');

test('VRM261 reservation zero eligibility is fail-closed in UI',()=>{
  const s=read('app/modules/reservas.js');
  assert.match(s,/id="rNew"[^\n]*sucs\.length[^\n]*disabled aria-disabled/);
  assert.match(s,/if\(!sucs\.length\).*No hay sucursales disponibles/);
  assert.match(s,/No hay sucursales ni visitas disponibles para reservar/);
});

test('VRM262 benefits receipt has an executable truthful download',()=>{
  const s=read('app/modules/beneficios.js');
  assert.match(s,/id="benDownloadReceipt"/);
  assert.match(s,/addEventListener\('click'/);
  assert.match(s,/cxorbia-beneficios-/);
  assert.match(s,/no sustituye comprobante bancario/);
  assert.match(s,/paymentSourceRef\|\|l\.reconciliationSourceRef/);
});

test('VRM263 support uses existing operational command provider and durable readback',()=>{
  const ui=read('app/modules/soporte.js'),adapter=read('app/adapters/cxorbia-command-adapter-v1.js'),boundary=read('app/adapters/cxorbia-cxdata-command-boundary-v1.js'),provider=read('backend/runtime/cxorbia-operational-command-provider-v1.mjs'),rules=read('firestore.rules');
  assert.match(ui,/CX\.data\?\.createSupportTicket/);
  assert.match(ui,/await this\.hydrate\(true\)/);
  assert.doesNotMatch(ui,/CX\.backendBulletins\.createSupportTicket/);
  assert.match(adapter,/allowed=new Set\([^\n]*support\.ticket\.create/);
  assert.match(boundary,/support\.ticket\.create/);
  assert.match(boundary,/support\.ticket\.update/);
  assert.match(provider,/'support\.ticket\.create'/);
  assert.match(provider,/'support\.ticket\.update'/);
  assert.match(provider,/r\.bulletins\.doc\(entityId\)/);
  assert.match(provider,/providerWrites\+\+;auditEntityType='supportTicket'/);
  assert.match(rules,/match \/bulletins\/\{bulletinId\}/);
  assert.match(rules,/canWriteBulletins\(\)/);
  assert.match(rules,/resource\.data\.get\('targetAll', false\) == true/);
  assert.doesNotMatch(rules,/resource\.data\.targetAll == true/);
  assert.doesNotMatch(rules,/return tenantAllowed\(tenantId\) && resource\.data\.status == 'active' && \(/);
});

test('VRM264 novedades read state is bulletinReads durable authority, not localStorage',()=>{
  const ui=read('app/modules/novedades.js'),bridge=read('app/core/backend-bulletins.js'),rules=read('firestore.rules');
  assert.doesNotMatch(ui,/cx_novedades_read/);
  assert.match(ui,/CX\.backendBulletins\?\.markRead/);
  assert.match(ui,/BULLETIN_READ_PROVIDER_ACK_REQUIRED/);
  assert.match(bridge,/bulletinReads/);
  assert.match(bridge,/BULLETIN_READ_DURABLE_READBACK_FAILED/);
  assert.match(bridge,/await c\.doc\(id\)\.set/);
  assert.match(bridge,/await c\.doc\(id\)\.get/);
  assert.match(rules,/match \/bulletinReads\/\{readId\}/);
  assert.match(rules,/request\.resource\.data\.userId == request\.auth\.uid/);
});
