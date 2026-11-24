import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeA08Pin} from './cxorbia-i3-a08-current-artifact-pin.mjs';
import {EXCEPTION_IDS,apiDenial,storageDenial,evidenceTuple,finalDecision,safeFailure}
  from '../../firebase/auth-dev-tools/cxorbia-i3-a08-residual-password-api-storage-readonly.mjs';

function pinFixture(){
  const source='a'.repeat(40),tree='b'.repeat(40);
  const m={sourceSha:source,sourceTree:tree,runtimeRevision:'cxorbia-live-hr-dev-00386-82w',
    runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/5974006f029fb872',
    firestoreRuleset:'projects/cxorbia-backend-dev/rulesets/25cb3df2-fa16-4804-9124-38d0a8fac057',
    materializationReceiptPath:'docs/checkpoints/QA_CURRENT.json',sourceHostedExact:true,runtimeTrafficExact:true,
    productionUnchanged:true,verifiedServedAssetCount:41,hrRevision:'d'.repeat(64)};
  const current={production:'DO_NOT_TOUCH',authorizationI4:false,productSourceSha:source,productTree:tree,productTreeAuthority:tree,currentMaterialization:{...m}};
  const descriptor={productSourceSha:source,productTreeAuthority:tree,currentMaterialization:{...m}};
  const receipt={source:{sha:source,tree},decision:'PASS_CURRENT_DEV',production:false,i4Authorized:false,
    materialization:{...m},verifiedServedAssetCount:41,
    servedSha256:Object.fromEntries(Array.from({length:41},(_,i)=>['core/asset'+i+'.js','e'.repeat(64)]))};
  return {current,descriptor,receipt};
}
test('canonical current materialization is accepted without a RUN2640 or jobConclusion alias',()=>{
  const {current,descriptor,receipt}=pinFixture();
  const result=normalizeA08Pin(current,descriptor,receipt);
  assert.equal(result.decision,'PASS_A08_CURRENT_ARTIFACT_PIN');
  assert.equal(result.receiptPath,'docs/checkpoints/QA_CURRENT.json');
  assert.equal(result.fullDomain,false);
});
test('candidate source ahead of served materialization fails before any provider operation',()=>{
  const f=pinFixture();f.current.currentMaterialization.sourceSha='f'.repeat(40);
  assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/CURRENT_SOURCE_NOT_MATERIALIZED/);
});
test('contradictory source aliases and partial asset evidence cannot seal',()=>{
  const f=pinFixture();f.receipt.sourceSha='f'.repeat(40);
  assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/SOURCE_ALIAS_DESYNC/);
  delete f.receipt.sourceSha;delete f.receipt.servedSha256['core/asset40.js'];
  assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/EXACT_41_ASSETS_REQUIRED/);
});
test('API denial requires exact status and an error-only response',()=>{
  assert.equal(apiDenial(401,{ok:false,error:'authorization_required',details:null},true),true);
  assert.equal(apiDenial(403,{ok:false,error:'tenant_or_namespace_mismatch',details:null}),true);
  assert.equal(apiDenial(403,{ok:false,error:'user_admin_super_required',users:[{}]}),false);
  assert.equal(apiDenial(404,{ok:false,error:'not_found'}),false);
  assert.equal(apiDenial(503,{ok:false,error:'live_hr_read_failed'}),false);
});
test('Storage 404 is availability failure, never an ACL denial',()=>{
  assert.equal(storageDenial(403,{error:{code:403,message:'Permission denied.'}}),true);
  assert.equal(storageDenial(401,{error:{code:401,message:'Permission denied.'}},true),true);
  assert.equal(storageDenial(404,{error:{code:404,message:'Not found.'}}),false);
  assert.equal(storageDenial(403,{error:{code:403,message:'Permission denied.'},bytes:'private'}),false);
  assert.equal(storageDenial(200,{error:{code:403,message:'Permission denied.'}}),false);
});
test('only durable private evidence scope qualifies; shared PDF or traversal does not',()=>{
  const item={tenantId:'tya',projectId:'cinepolis',periodId:'cinepolis-2026-11',visitId:'visit-1',shopperId:'shopper-1',
    evidenceId:'e-1',storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-11/visits/visit-1/evidence/e-1/photo.png',
    checksum:'f'.repeat(64),mimeType:'image/png',size:42,providerAck:true};
  assert.ok(evidenceTuple(item,'e-1'));
  assert.equal(evidenceTuple({...item,storagePath:'tenants/tya/projects/cinepolis/periods/cinepolis-2026-11/resources/r-1/file.pdf'},'e-1'),null);
  assert.equal(evidenceTuple({...item,storagePath:item.storagePath.replace('photo.png','../photo.png')},'e-1'),null);
  assert.equal(evidenceTuple({...item,providerAck:false},'e-1'),null);
});
function finalFixture(){
  const base={decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),
    runtimeRevision:'runtime',runtimeDigest:'digest',hostingVersion:'hosting',firestoreRuleset:'f',storageRuleset:'s',receiptPath:'p',receiptGitBlob:'blob'};
  return {before:{...base,phase:'before',servedAssetsMatch:41},after:{...base,phase:'after',servedAssetsMatch:0},
    result:{sourceSha:base.sourceSha,passwordProofs:EXCEPTION_IDS.map(shopperId=>({shopperId,pass:true})),
      apiProofs:Array.from({length:4},()=>({pass:true})),storageProof:{pass:true,objectStable:true},errors:[]}};
}
test('final proof needs three distinct exact passwords, Storage stability and same artifact after',()=>{
  const f=finalFixture();assert.equal(finalDecision(f.result,f.before,f.after).pass,true);
  f.result.passwordProofs[2].shopperId=EXCEPTION_IDS[0];assert.equal(finalDecision(f.result,f.before,f.after).pass,false);
  f.result.passwordProofs[2].shopperId=EXCEPTION_IDS[2];f.result.storageProof.objectStable=false;
  assert.equal(finalDecision(f.result,f.before,f.after).pass,false);
  f.result.storageProof.objectStable=true;f.after.hostingVersion='changed';
  assert.equal(finalDecision(f.result,f.before,f.after).pass,false);
});
test('missing existing Storage object preserves password/API results without a false PASS',()=>{
  const f=finalFixture();f.result.storageProof=null;
  f.result.errors.push({stage:'storage',code:'PROVIDER_FAILURE:A08_EXISTING_PRIVATE_STORAGE_OBJECT_UNAVAILABLE'});
  const outcome=finalDecision(f.result,f.before,f.after);
  assert.equal(outcome.passwords,true);assert.equal(outcome.apis,true);assert.equal(outcome.pass,false);
});
test('unclassified errors cannot expose provider payload or credential material',()=>{
  assert.equal(safeFailure(Error('secret-token example private UID')),'ENVIRONMENT_FAILURE:A08_PROBE_FAILED');
  assert.equal(safeFailure(Error('AUTH_FAILURE:A08_SCOPE_MISMATCH extra private payload')),'AUTH_FAILURE:A08_SCOPE_MISMATCH');
});
