import assert from 'node:assert/strict';
import {
  certificationRouteScope,
  certificationBankFingerprint,
  calculateCertificationAttempt,
  historicalCarryoverDecision,
  withDocumentId
} from '../certification-runtime.mjs';

assert.deepEqual(withDocumentId('recert-123',{providerAck:true}),{id:'recert-123',providerAck:true});
assert.throws(()=>withDocumentId('',{}),/PERSISTENCE_DOCUMENT_ID_REQUIRED/);

assert.deepEqual(
  certificationRouteScope('/api/tenants/tya/projects/cinepolis/certifications/attempt'),
  {tenantId:'tya',projectId:'cinepolis',action:'attempt'}
);

const bank={
  preguntas:[
    {q:'Q1',ops:['A','B'],correcta:'A',exp:'x'},
    {q:'Q2',ops:['C','D'],correcta:'D',exp:'y'}
  ],
  gate:80,
  contentRevision:'rev-exact',
  historicalEquivalenceKeys:['legacy-cert-1']
};

assert.equal(certificationBankFingerprint(bank),'rev-exact');

const passed=calculateCertificationAttempt(bank,['A','D']);
assert.equal(passed.score,100);
assert.equal(passed.pass,true);

const failed=calculateCertificationAttempt(bank,['A','C']);
assert.equal(failed.score,50);
assert.equal(failed.pass,false);

assert.throws(
  ()=>calculateCertificationAttempt(bank,['A']),
  /CERT_ANSWERS_INCOMPLETE/
);

const valid=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'legacy-cert-1'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1'
});
assert.equal(valid.state,'valid_reusable');
assert.equal(valid.eligibilityGranted,true);

const nonEquivalent=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'other'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1'
});
assert.equal(nonEquivalent.state,'non_equivalent');
assert.equal(nonEquivalent.eligibilityGranted,false);

const recert=historicalCarryoverDecision({
  records:[{projectId:'cinepolis',sourceLegacyStatus:'approved',sourceCertificationId:'legacy-cert-1'}],
  bank,
  projectId:'cinepolis',
  shopperId:'s1',
  recertifications:[{status:'active',scope:'all',createdAt:'2026-09-30T00:00:00Z'}]
});
assert.equal(recert.state,'recertification_required');
assert.equal(recert.eligibilityGranted,false);

console.log(JSON.stringify({
  decision:'PASS_PREI4_CERT_RES_CONTRACT',
  attemptScore:passed.score,
  carryover:valid.state,
  production:false
}));
