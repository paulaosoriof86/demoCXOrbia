import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../../../',import.meta.url));

function projector(){
  const context={console};context.globalThis=context;
  vm.runInNewContext(fs.readFileSync(root+'app/adapters/tya-certification-evidence-projection-v1.js','utf8'),context,{filename:'tya-certification-evidence-projection-v1.js'});
  return context.CX_TYA_CERTIFICATION_EVIDENCE_PROJECTION;
}

test('VRM-036 exact historical certification evidence is projected without granting current certification or eligibility',()=>{
  const api=projector();
  const out=api.project({
    shoppers:[
      {id:'canonical-a',shopperId:'canonical-a',legacyLiveShopperIds:['legacy-a'],certified:false,certificationPresented:false},
      {id:'canonical-b',shopperId:'canonical-b',exactAliases:['legacy-b']}
    ],
    identityMap:{'legacy-a':'canonical-a'},
    evidenceCandidates:[
      {candidateId:'e1',shopperId:'legacy-a',projectId:'cinepolis',certificationId:'cinepolis-main',sourceCertificationId:'legacy-a::cert1',sourceLegacyStatus:'approved',sourceScore:93,eligibilityGranted:true,carryoverConfirmed:true},
      {candidateId:'e2',shopperId:'legacy-b',projectId:'cinepolis',certificationId:'cinepolis-main',sourceCertificationId:'legacy-b::cert2',sourceLegacyStatus:'failed',sourceScore:53}
    ]
  });
  assert.equal(out.matchedRecords,2);
  assert.equal(out.matchedShoppers,2);
  assert.equal(out.eligibilityGranted,0);
  const a=out.shoppers.find(x=>x.id==='canonical-a');
  assert.equal(a.certificationEvidenceCount,1);
  assert.equal(a.certificationEvidenceApprovedLegacy,1);
  assert.equal(a.certificationEvidenceRecords[0].eligibilityGranted,false);
  assert.equal(a.certificationEvidenceRecords[0].carryoverConfirmed,false);
  assert.equal(a.certified,false);
  assert.equal(a.certificationPresented,false);
});

test('VRM-036 ambiguous or unmatched technical anchors stay review-only and never attach to a shopper',()=>{
  const api=projector();
  const out=api.project({
    shoppers:[
      {id:'a',legacyLiveShopperIds:['shared']},
      {id:'b',legacyLiveShopperIds:['shared']}
    ],
    identityMap:{},
    evidenceCandidates:[
      {candidateId:'amb',shopperId:'shared',sourceLegacyStatus:'approved'},
      {candidateId:'none',shopperId:'missing',sourceLegacyStatus:'approved'}
    ]
  });
  assert.equal(out.matchedRecords,0);
  assert.equal(out.reviewRequiredRecords,2);
  assert.equal(out.shoppers[0].certificationEvidenceCount,0);
  assert.equal(out.shoppers[1].certificationEvidenceCount,0);
  assert.deepEqual([...out.reviewQueue.map(x=>x.reason)].sort(),['ambiguous_exact_technical_anchor','no_exact_technical_anchor']);
});

test('VRM-036 runtime wiring exposes historical evidence separately from current certification',()=>{
  const bridge=fs.readFileSync(root+'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8');
  const c6=fs.readFileSync(root+'app/adapters/tya-c6-domain-consistency-bridge.js','utf8');
  const cert=fs.readFileSync(root+'app/modules/cert.js','utf8');
  assert.match(bridge,/CX_TYA_CERTIFICATION_EVIDENCE_PROJECTION/);
  assert.match(bridge,/certificationEligibilityGranted:0/);
  assert.match(c6,/historicalEvidenceStatus/);
  assert.match(c6,/eligibilityGranted:!!s\.certified/);
  assert.match(cert,/no habilita la certificación vigente ni la elegibilidad para ejecutar visitas/);
});


test('VRM-036 protected authenticated profile is an exact evidence owner without entering the HR operational population',()=>{
  const api=projector();
  const operational=api.project({
    shoppers:[{id:'shopper_gt_other',shopperId:'shopper_gt_other'}],
    identityMap:{},
    evidenceCandidates:[{candidateId:'paula-cert',shopperId:'s3',sourceLegacyStatus:'approved',sourceScore:93}]
  });
  const protectedProfiles=api.project({
    shoppers:[{id:'s3',shopperId:'s3',nombre:'Perfil protegido'}],
    identityMap:{},
    evidenceCandidates:[{candidateId:'paula-cert',shopperId:'s3',sourceLegacyStatus:'approved',sourceScore:93}]
  });
  assert.equal(operational.matchedRecords,0);
  assert.equal(protectedProfiles.matchedRecords,1);
  assert.equal(protectedProfiles.shoppers[0].certificationEvidenceCount,1);
  assert.equal(protectedProfiles.shoppers[0].certificationEvidenceRecords[0].eligibilityGranted,false);
  assert.equal(operational.shoppers.some(s=>s.id==='s3'),false);
});

test('VRM-036 certification module prefers exact protected session profile for historical evidence',()=>{
  const cert=fs.readFileSync(root+'app/modules/cert.js','utf8');
  const bridge=fs.readFileSync(root+'app/adapters/tya-protected-auth-hr-authority-bridge-v2.js','utf8');
  assert.match(cert,/const protectedProfile=data\.__sessionShopperProfile/);
  assert.match(bridge,/protectedCertProjection=certProjector\.project/);
  assert.match(bridge,/profile=sessionProfile\(projectedState,c,result\)/);
});
