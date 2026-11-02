import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {TextEncoder} from 'node:util';

const code = fs.readFileSync('app/modules/cert.js', 'utf8').split("\nCX.module('cert'")[0];
const period = '2026-10', project = 'cinepolis', cid = 'qa-d05-scope-test';
const id = `certbank-${project}-${period}-${cid}`;

function harness({role='admin', author='another-author', allowedRoles=[], targetAll=false, serverVersion=1}={}) {
  const questions = Array.from({length:15}, (_, index)=>({
    q:`Pregunta QA ${index + 1}`, ops:['A','B','C','D'], correcta:'A',
    exp:'Explicación QA', fuente:`Instructivo QA sección ${index + 1}`
  }));
  const original = {
    certificationId:cid, certificationName:'Banco exclusivo QA D05', estado:'pending_review',
    generadoPorUid:author, contentRevision:'initial-synthetic-revision', preguntas:questions,
    __resourceId:id, __resourceVersion:1, documentSource:{source_sha256:'synthetic-qa'}
  };
  const existing = {
    id, tenantId:'tya', projectId:project, periodId:period, resourceType:'certification_bank',
    tipo:'certification_bank', version:serverVersion, status:'active',
    visibleRoles:allowedRoles, targetAll, qaOnly:true, bank:{...original},
    createdAt:'2026-11-01T00:00:00Z', createdByUid:'another-author'
  };
  const observed = [];
  let emitted = 0;
  const CX = {
    BACKEND:{enabled:true}, data:{currentProjectId:project},
    session:{effectiveRole:()=>role},
    backendCertifications:{currentUid:()=> 'admin-qa-reviewer'},
    bus:{emit:()=>{emitted++;}},
    backendResources:{
      async saveMetadata(item,options){
        observed.push({item,options});
        if (options.expectedVersion !== undefined && existing.version !== options.expectedVersion)
          throw new Error('RESOURCE_EXPECTED_VERSION_CONFLICT');
        if (options.expectedVersion !== undefined) {
          // Firestore's updateCertificationDraft forbids access-field changes.
          assert.equal(Object.hasOwn(item,'visibleRoles'),false);
          assert.equal(Object.hasOwn(item,'targetAll'),false);
        }
        const committed = {...existing,...item,version:existing.version + 1};
        if(options.expectedVersion !== undefined){
          assert.deepEqual(committed.visibleRoles,allowedRoles);
          assert.equal(committed.targetAll,targetAll);
          assert.equal(committed.qaOnly,true);
        }
        return {providerAck:true,committed:true,item:committed,
          readback:{confirmed:true,source:'firestore-server',item:committed}};
      }
    }
  };
  vm.runInNewContext(code,{CX,crypto:webcrypto,TextEncoder});
  return {store:CX.certStore,original,observed,get emitted(){return emitted;}};
}

test('D05 versioned review preserves admin-only source scope while persisting v1 to v2',async()=>{
  const h=harness(),questions=h.original.preguntas.map(q=>({...q}));
  questions[0].q='Pregunta QA número 1 revisada por Admin';
  const outcome=await h.store.reviewDraft(period,h.original,questions,'authorized_admin');
  assert.equal(outcome.providerAck,true);
  assert.equal(outcome.item.version,2);
  assert.equal(outcome.item.bank.reviewVersion,2);
  assert.equal(outcome.item.bank.preguntas.length,15);
  assert.equal(outcome.item.bank.preguntas[0].q,questions[0].q);
  assert.equal(outcome.item.bank.reviewHistory.length,1);
  assert.equal(outcome.item.bank.reviewHistory[0].fromVersion,1);
  assert.equal(outcome.item.bank.reviewHistory[0].toVersion,2);
  assert.equal(h.observed.length,1);
  assert.equal(h.observed[0].options.expectedVersion,1);
  assert.equal(h.observed[0].options.requireReadback,true);
  assert.equal(h.emitted,1);
});

test('D05 rejects no-op review before any provider write',async()=>{
  const h=harness();
  await assert.rejects(h.store.reviewDraft(period,h.original,h.original.preguntas,'authorized_admin'),
    /CERT_REVIEW_NO_CHANGES/);
  assert.equal(h.observed.length,0);
});

test('D05 maker-checker refuses its own author even when changes exist',async()=>{
  const h=harness({author:'admin-qa-reviewer'}),revised=h.original.preguntas.map(q=>({...q}));
  revised[0].q+=' actualizada';
  await assert.rejects(h.store.reviewDraft(period,h.original,revised,'maker_checker'),
    /CERT_REVIEW_DISTINCT_REVIEWER_REQUIRED/);
  assert.equal(h.observed.length,0);
});

test('D05 rejects stale version without provider ACK or visibility changes',async()=>{
  const h=harness({serverVersion:2}),revised=h.original.preguntas.map(q=>({...q}));
  revised[0].q+=' actualizada';
  await assert.rejects(h.store.reviewDraft(period,h.original,revised,'authorized_admin'),
    /RESOURCE_EXPECTED_VERSION_CONFLICT/);
  assert.equal(h.observed.length,1);
  assert.equal(Object.hasOwn(h.observed[0].item,'visibleRoles'),false);
});

test('D05 review visibility bypass requires exact resource, version and readback',async()=>{
  const h=harness();
  await assert.rejects(h.store.save(period,h.original,cid,{
    preserveExistingVisibility:true,expectedResourceId:id,requireReadback:true
  }),/CERT_REVIEW_EXACT_VISIBILITY_SOURCE_REQUIRED/);
  await assert.rejects(h.store.save(period,h.original,cid,{
    preserveExistingVisibility:true,expectedResourceId:'another-bank',expectedVersion:1,requireReadback:true
  }),/CERT_REVIEW_RESOURCE_ID_MISMATCH/);
  assert.equal(h.observed.length,0);
});

test('D05 normal new-bank save retains original visibility defaults',async()=>{
  const h=harness(),data={certificationId:'fresh-qa',certificationName:'Banco nuevo de prueba',
    estado:'pending_review',preguntas:h.original.preguntas,contentRevision:'new-qa'};
  await h.store.save(period,data,'fresh-qa');
  assert.equal(h.observed.length,1);
  assert.equal(h.observed[0].item.visibleRoles.includes('shopper'),true);
  assert.equal(h.observed[0].item.targetAll,false);
});
