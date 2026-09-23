import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
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

test('PRE-I4 rules allow only targeted active project resources to shopper while writes remain operator-only',()=>{
  const src=read('firestore.rules');
  assert.match(src,/match \/resources\/\{resourceId\}/);
  assert.match(src,/projectAssigned\(resource\.data\.projectId\)/);
  assert.match(src,/role\(\) in resource\.data\.visibleRoles/);
  assert.match(src,/allow create, update, delete: if tenantAllowed\(tenantId\) && isOperator\(\)/);
});
