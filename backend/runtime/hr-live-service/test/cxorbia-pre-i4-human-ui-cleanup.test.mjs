import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');

test('PRE-I4 VRM-007 shopper human lane does not expose technical persistence vocabulary',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.doesNotMatch(s,/No hay un <code>shopperId<\/code>/);
  assert.doesNotMatch(s,/ACK real del backend/);
  assert.doesNotMatch(s,/Storage pendiente/);
  assert.doesNotMatch(s,/gate de escrituras cerrado/);
});

test('PRE-I4 VRM-017 finance normal table hides raw IDs and enums behind expandable trace',()=>{
  const s=read('app/modules/finanzas.js');
  assert.doesNotMatch(s,/<th>visitId<\/th>/);
  assert.doesNotMatch(s,/<th>hrRowId<\/th>/);
  assert.doesNotMatch(s,/<th>financialSourceStatus<\/th>/);
  assert.match(s,/Trazabilidad/);
  assert.match(s,/<details>/);
  assert.match(s,/Pendiente de conciliación/);
});

test('PRE-I4 VRM-008 router integrates browser history without duplicating history on rerender',()=>{
  const s=read('app/core/router.js');
  assert.match(s,/history\.pushState/);
  assert.match(s,/history\.replaceState/);
  assert.match(s,/addEventListener\('popstate'/);
  assert.match(s,/nav\(CX\.session\.view,\{history:false\}\)/);
});

test('PRE-I4 VRM-008 mobile topbar preserves current identity and role',()=>{
  const html=read('app/index-backend-dev.html'),css=read('app/styles/layout.css'),router=read('app/core/router.js');
  assert.match(html,/id="tbRoleIdentity"/);
  assert.match(css,/\.tb-role-id/);
  assert.match(router,/tbRoleIdentity/);
});

test('PRE-I4 VRM-024 normal human lane hides technical data badge and source diagnostics',()=>{
  const html=read('app/index-backend-dev.html'),router=read('app/core/router.js');
  assert.match(html,/id="tbDataBadge" style="display:none"/);
  assert.match(router,/hasTechAccess/);
  assert.doesNotMatch(html,/Preview backend DEV<\/div>/);
});

test('PRE-I4 normal admin copy avoids ACK Storage Firestore and localStorage implementation terms',()=>{
  for(const p of ['app/modules/shoppers.js','app/modules/postulaciones.js','app/modules/documentos.js']){
    const s=read(p);
    assert.doesNotMatch(s,/no hubo ACK remoto|después del ACK remoto|Storage no está autorizado\/configurado|No se guarda la contraseña en Firestore, HR ni localStorage/);
  }
});

test('PRE-I4 VRM-027 shopper surfaces approved assignment conflicts without inventing a confirmed visit',()=>{
  const s=read('app/modules/misvisitas.js');
  assert.match(s,/conflict_review_required/);
  assert.match(s,/data-app-state/);
  assert.match(s,/Aprobación en revisión/);
  assert.match(s,/asignación vigente en Hoja de Ruta no coincide/);
  assert.doesNotMatch(s,/otro shopper asignado/i);
});

test('PRE-I4 VRM-027 admin keeps approval state but marks unresolved HR assignment conflict',()=>{
  const s=read('app/modules/postulaciones.js');
  assert.match(s,/data-post-sync/);
  assert.match(s,/conflict_review_required/);
  assert.match(s,/REQUIERE REVISIÓN/);
  assert.match(s,/asignación vigente en Hoja de Ruta no coincide/);
  assert.match(s,/Aprobada · asignación en revisión/);
});

