import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeA08Pin,a08ServedInventory,assertA08ServedInventory,assertA08AssetSeal} from './cxorbia-i3-a08-current-artifact-pin.mjs';
import {EXCEPTION_IDS,apiDenial,storageDenial,evidenceTuple,finalDecision,safeFailure}
  from '../../firebase/auth-dev-tools/cxorbia-i3-a08-residual-password-api-storage-readonly.mjs';

function pinFixture(count=47){
  const source='a'.repeat(40),tree='b'.repeat(40);
  const m={sourceSha:source,sourceTree:tree,runtimeRevision:'cxorbia-live-hr-dev-00386-82w',
    runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/5974006f029fb872',
    firestoreRuleset:'projects/cxorbia-backend-dev/rulesets/25cb3df2-fa16-4804-9124-38d0a8fac057',
    materializationReceiptPath:'docs/checkpoints/QA_CURRENT.json',sourceHostedExact:true,runtimeTrafficExact:true,
    productionUnchanged:true,verifiedServedAssetCount:count,hrRevision:'d'.repeat(64),firestoreRulesDeploys:0,storageRulesDeploys:0,hrWrites:0};
  const current={production:'DO_NOT_TOUCH',authorizationI4:false,productSourceSha:source,productTree:tree,productTreeAuthority:tree,currentMaterialization:{...m}};
  const descriptor={productSourceSha:source,productTreeAuthority:tree,currentMaterialization:{...m}};
  const receipt={source:{sha:source,tree},decision:'PASS_CURRENT_DEV',production:false,i4Authorized:false,
    materialization:{...m},verifiedServedAssetCount:count,
    servedSha256:Object.fromEntries(Array.from({length:count},(_,i)=>['core/asset'+i+'.js','e'.repeat(64)]))};
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
test('same artifact pin preserves explicit zero-rule-deploy and zero-HR-write evidence',()=>{
  for(const field of ['firestoreRulesDeploys','storageRulesDeploys','hrWrites']){
    const f=pinFixture();f.receipt.materialization[field]=1;
    assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/RECEIPT_UNEXPECTED_WRITE/);
    delete f.receipt.materialization[field];
    assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/RECEIPT_UNEXPECTED_WRITE/);
  }
});
test('contradictory source aliases and partial asset evidence cannot seal',()=>{
  const f=pinFixture();f.receipt.sourceSha='f'.repeat(40);
  assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/SOURCE_ALIAS_DESYNC/);
  delete f.receipt.sourceSha;delete f.receipt.servedSha256['core/asset40.js'];
  assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/EXACT_CURRENT_ASSET_INVENTORY_REQUIRED/);
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
  const f=pinFixture(),pin={...normalizeA08Pin(f.current,f.descriptor,f.receipt),controlHead:'1'.repeat(40),receiptGitBlob:'2'.repeat(40)};
  const base={...pin,decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',storageRuleset:'projects/cxorbia-backend-dev/rulesets/storage-fixture',servedAssetsMatch:47};
  return {pin,before:{...base,phase:'before',servedAssetsFetchedThisPhase:47,assetReadbackMode:'CURRENT_HOSTING_FETCH'},
    after:{...base,phase:'after',servedAssetsFetchedThisPhase:0,assetReadbackMode:'REUSED_BEFORE_ON_IDENTICAL_FINALIZED_HOSTING_VERSION'},
    result:{sourceSha:base.sourceSha,passwordProofs:EXCEPTION_IDS.map(shopperId=>({shopperId,pass:true})),
      apiProofs:Array.from({length:4},()=>({pass:true})),storageProof:{pass:true,objectStable:true},errors:[]}};
}
test('final proof needs three distinct exact passwords, Storage stability and same artifact after',()=>{
  const f=finalFixture();assert.equal(finalDecision(f.result,f.before,f.after,f.pin).pass,true);
  f.result.passwordProofs[2].shopperId=EXCEPTION_IDS[0];assert.equal(finalDecision(f.result,f.before,f.after,f.pin).pass,false);
  f.result.passwordProofs[2].shopperId=EXCEPTION_IDS[2];f.result.storageProof.objectStable=false;
  assert.equal(finalDecision(f.result,f.before,f.after,f.pin).pass,false);
  f.result.storageProof.objectStable=true;f.after.hostingVersion='changed';
  assert.equal(finalDecision(f.result,f.before,f.after,f.pin).pass,false);
});
test('missing existing Storage object preserves password/API results without a false PASS',()=>{
  const f=finalFixture();f.result.storageProof=null;
  f.result.errors.push({stage:'storage',code:'PROVIDER_FAILURE:A08_EXISTING_PRIVATE_STORAGE_OBJECT_UNAVAILABLE'});
  const outcome=finalDecision(f.result,f.before,f.after,f.pin);
  assert.equal(outcome.passwords,true);assert.equal(outcome.apis,true);assert.equal(outcome.pass,false);
});
test('unclassified errors cannot expose provider payload or credential material',()=>{
  assert.equal(safeFailure(Error('secret-token example private UID')),'ENVIRONMENT_FAILURE:A08_PROBE_FAILED');
  assert.equal(safeFailure(Error('AUTH_FAILURE:A08_SCOPE_MISMATCH extra private payload')),'AUTH_FAILURE:A08_SCOPE_MISMATCH');
});

test('the complete current 47-asset receipt is sealed without dropping historical or added assets',()=>{
  const f=pinFixture();const pin=normalizeA08Pin(f.current,f.descriptor,f.receipt);
  assert.equal(pin.verifiedServedAssetCount,47);assert.equal(Object.keys(pin.servedSha256).length,47);
  assert.deepEqual(pin.servedSha256,f.receipt.servedSha256);assert.match(pin.servedInventorySha256,/^[a-f0-9]{64}$/);
  const reversed=Object.fromEntries(Object.entries(pin.servedSha256).reverse());
  assert.equal(a08ServedInventory(reversed).servedInventorySha256,pin.servedInventorySha256);
  const historical=pinFixture(41);assert.equal(normalizeA08Pin(historical.current,historical.descriptor,historical.receipt).verifiedServedAssetCount,41);
});
test('canonical count disagreement, missing current asset and added current asset fail closed',()=>{
  for(const change of [f=>delete f.receipt.servedSha256['core/asset46.js'],f=>{f.receipt.servedSha256['core/extra.js']='f'.repeat(64);},f=>{f.descriptor.currentMaterialization.verifiedServedAssetCount=41;},f=>{f.receipt.materialization.verifiedServedAssetCount=41;}]){
    const f=pinFixture();change(f);assert.throws(()=>normalizeA08Pin(f.current,f.descriptor,f.receipt),/EXACT_CURRENT_ASSET_INVENTORY_REQUIRED/);
  }
});
test('same-count substitution, hash mismatch, missing and extra downloaded assets are rejected',()=>{
  const expected=pinFixture().receipt.servedSha256;
  const wrongHash={...expected,'core/asset46.js':'f'.repeat(64)};
  assert.throws(()=>assertA08ServedInventory(expected,wrongHash),/SERVED_ASSET_HASH_MISMATCH/);
  const missing={...expected};delete missing['core/asset46.js'];
  assert.throws(()=>assertA08ServedInventory(expected,missing),/SERVED_ASSET_SET_MISMATCH/);
  assert.throws(()=>assertA08ServedInventory(expected,{...expected,'core/extra.js':'e'.repeat(64)}),/SERVED_ASSET_SET_MISMATCH/);
  assert.throws(()=>assertA08ServedInventory(expected,{...missing,'core/substitution.js':'e'.repeat(64)}),/SERVED_ASSET_SET_MISMATCH/);
  assert.equal(assertA08ServedInventory(expected,{...expected}).verifiedServedAssetCount,47);
});
test('final seal needs all 47 path/hash pairs from the canonical pin, not only equal counts',()=>{
  for(const side of ['before','after'])for(const mutation of [s=>delete s.servedSha256['core/asset46.js'],s=>{s.servedSha256['core/extra.js']='e'.repeat(64);},s=>{s.servedSha256['core/asset46.js']='f'.repeat(64);},s=>{s.servedInventorySha256='f'.repeat(64);},s=>{s.servedAssetsMatch=41;}]){
    const f=finalFixture();f[side]=structuredClone(f[side]);mutation(f[side]);assert.equal(finalDecision(f.result,f.before,f.after,f.pin).seal,false);
  }
  const f=finalFixture();assertA08AssetSeal(f.pin,f.before);assertA08AssetSeal(f.pin,f.after);
  const result=finalDecision(f.result,f.before,f.after,f.pin);assert.equal(result.servedAssetCount,47);assert.equal(result.expectedAssetCount,47);
});
test('password-only preserves historical API credit without executing or recounting four denials',()=>{
  const f=finalFixture();f.result.scope={executionMode:'PASSWORD_ONLY'};f.result.apiProofs=[];f.result.storageProof=null;
  const decision=finalDecision(f.result,f.before,f.after,f.pin);assert.equal(decision.requestedScopePass,true);assert.equal(decision.apis,false);assert.equal(decision.pass,false);
});
