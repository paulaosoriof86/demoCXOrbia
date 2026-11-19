import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {shopperResourceProjection} from '../certification-runtime.mjs';
const root=fileURLToPath(new URL('../../../../',import.meta.url));
const read=p=>fs.readFileSync(root+p,'utf8');

test('PRE-I4 VRM-009 certification store has no localStorage operational truth',()=>{
  const src=read('app/modules/cert.js');
  assert.doesNotMatch(src,/localStorage/);
  assert.match(src,/backendResources\?\.saveMetadata/);
  assert.match(src,/providerAck===true/);
});

test('PRE-I4 VRM-019 connected resources do not seed static project resources',()=>{
  const src=read('app/modules/documentos.js');
  assert.match(src,/if\(this\.connected\(\)\)return CX\.backendResources/);
  assert.match(src,/No hay recursos reales publicados/);
  assert.doesNotMatch(src,/Video de inducción.*aqz-KE-bpKQ/);
});

test('PRE-I4 VRM-020 metadata requires durable ACK and binary upload fails closed without authorized Storage',()=>{
  const core=read('app/core/backend-resources.js'),docs=read('app/modules/documentos.js');
  assert.match(core,/providerAck:true/);
  assert.match(core,/lastIdempotencyKey/);
  assert.match(core,/RESOURCE_STORAGE_NOT_AUTHORIZED/);
  assert.match(core,/RESOURCE_DATA_URL_FORBIDDEN/);
  assert.doesNotMatch(docs,/readAsDataURL/);
  assert.doesNotMatch(docs,/CX\.docStore\._d/);
});

test('PRE-I4 VRM-022 historical certifications are preserved as pending evidence, never false carryover',()=>{
  const sandbox={window:{}};vm.createContext(sandbox);
  vm.runInContext(read('app/data/tya-certification-carryover-source-safe.js'),sandbox);
  const x=sandbox.window.CX_TYA_CERTIFICATION_CARRYOVER_SOURCE_SAFE;
  assert.equal(x.moduleTruthClassification,'APPROVED_NOT_COMPOSED');
  assert.equal(x.evidenceCandidateCount,42);
  assert.equal(x.canonicalShopperCount,16);
  assert.equal(x.certifications.length,0);
  assert.equal(x.carryoverConfirmed,0);
  assert.equal(x.eligibilityGranted,0);
  assert.equal(x.fuzzyMatching,false);
  assert.ok(x.evidenceCandidates.every(c=>c.status==='pending_review'&&c.reviewRequired===true&&c.carryoverConfirmed===false));
});

test('PRE-I4 canonical DEV entrypoint loads certification evidence and durable resources authority',()=>{
  const html=read('app/index-backend-dev.html');
  assert.match(html,/data\/tya-certification-carryover-source-safe\.js/);
  assert.match(html,/core\/backend-resources\.js/);
});

test('PRE-I4 VRM-297 rules deny direct Shopper resource reads and retain scoped operator authority',()=>{
  const src=read('firestore.rules');
  const block=src.match(/match \/resources\/\{resourceId\} \{([\s\S]*?)match \/auditLogs\/\{logId\}/)?.[1];
  assert.ok(block,'exact tenant resources rule block missing');
  assert.match(block,/allow read: if tenantAllowed\(tenantId\) && isOperator\(\);/);
  assert.doesNotMatch(block,/allow (?:get|list|read):[^;]*isShopperRole\(\)/);
  assert.match(block,/allow create: if tenantAllowed\(tenantId\) && isOperator\(\)/);
  assert.match(block,/allow update: if tenantAllowed\(tenantId\) && isOperator\(\)/);
  assert.match(block,/allow delete: if tenantAllowed\(tenantId\) && isOperator\(\)/);
});

test('PRE-I4 resource writes use async ACK handlers and content-derived idempotency',()=>{
  const docs=read('app/modules/documentos.js'),core=read('app/core/backend-resources.js'),cert=read('app/modules/cert.js');
  assert.match(docs,/#duS'\)\.addEventListener\('click',async\(\)=>/);
  assert.doesNotMatch(docs,/resource\.upload:'\+Date\.now/);
  assert.doesNotMatch(cert,/certbank\.save:'\+id\+'\+'\+Date\.now/);
  assert.match(core,/hash\(\[scope\.tenantId,scope\.projectId,scope\.periodId,clean\(item\)\]\)/);
});

test('PRE-I4 VRM-297 Shopper resource reads use authenticated sanitized server projection',()=>{
  const src=read('firestore.rules');
  const browser=read('app/core/backend-resources.js');
  const runtime=read('backend/runtime/hr-live-service/certification-runtime.mjs');
  assert.match(src,/allow read: if tenantAllowed\(tenantId\) && isOperator\(\);/);
  assert.match(browser,/if\(role\(\)==='shopper'\)\s*\{/);
  assert.match(browser,/CX\.backendCertifications\.loadShopperResources\(scope\.periodId\)/);
  assert.match(runtime,/AUTH_FAILURE:CERT_SHOPPER_PROJECTION_REQUIRED/);
  assert.match(runtime,/source:'verified_shopper_projection'/);
  const row={id:'bank',tenantId:'t',projectId:'p',periodId:'period',resourceType:'certification_bank',
    tipo:'certification_bank',status:'active',visibleRoles:['shopper'],bank:{estado:'published',
      preguntas:[{q:'Pregunta',ops:['Sí','No'],correcta:'Sí',exp:'Secreto',fuente:'Doc interno'}]}};
  const projected=shopperResourceProjection(row,{tenantId:'t',projectId:'p',periodId:'period'});
  assert.ok(projected,'published, project-scoped bank should be visible');
  assert.deepEqual(projected.bank.preguntas,[{q:'Pregunta',ops:['Sí','No']}]);
  assert.doesNotMatch(JSON.stringify(projected),/Secreto|correcta|fuente/);
  assert.equal(shopperResourceProjection({...row,projectId:'other'},{tenantId:'t',projectId:'p',periodId:'period'}),null);
  assert.equal(shopperResourceProjection({...row,bank:{...row.bank,estado:'draft'}},{tenantId:'t',projectId:'p',periodId:'period'}),null);
});

test('PRE-I4 VRM-029 browser resource query proves the same project status and role constraints required by Rules',()=>{
  const core=read('app/core/backend-resources.js');
  assert.match(core,/where\('projectId','==',scope\.projectId\)\.where\('status','==','active'\)/);
  assert.match(core,/where\('visibleRoles','array-contains',role\(\)\)/);
});
