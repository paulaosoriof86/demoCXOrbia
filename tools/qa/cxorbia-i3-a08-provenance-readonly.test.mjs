// Pure diagnostics and VM-isolated runner checks. No credentials or providers.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {A08_PROVENANCE_TARGETS,assessCurrentProviderPasswordProof,diagnoseCurrentProviderPasswordProof,publicA08ProvenanceDiagnostic} from './cxorbia-i3-a08-exact-password-proof.mjs';
import {a08ServedInventory} from './cxorbia-i3-a08-current-artifact-pin.mjs';
import {finalDecision,validateA08ProvenanceChild,assertA08ExecutionResult} from '../../firebase/auth-dev-tools/cxorbia-i3-a08-residual-password-api-storage-readonly.mjs';
import {summarizeTypedResult} from './cxorbia-i3-typed-result-summary.mjs';
const digest=x=>crypto.createHash('sha256').update(x).digest('hex');
const sourceSha='a'.repeat(40);
function fixture(caseId='GT_EXCEPTION',legacy=false){
  const shopperId=A08_PROVENANCE_TARGETS[caseId],login='qa.existing';
  const uid=legacy?'tya-sh-'+digest('tya\0shopper\0'+login).slice(0,24):'qa-keeper';
  const fingerprint=digest('cxorbia-provider-uid-v1\0'+uid),ref='a'.repeat(40),linkId='irl_'+'b'.repeat(32),rule='tya-shopper-primer-nombre-primer-apellido-v2';
  const versions={credentialRuleVersion:rule,credentialSweepVersion:'cxorbia-durable-shopper-credential-sweep-v2',credentialPasswordProofVersion:'cxorbia-shopper-password-proof-v2',credentialPasswordRuleVersion:rule};
  const common={tenantId:'tya',shopperId,projectIds:['cinepolis'],visibleLogin:login,...versions};
  const member={...common,active:true,role:'shopper',authNamespace:'shopper',credentialState:'enrolled',providerUidFingerprint:fingerprint,identityConsolidatedAt:'2026-01-01'};
  const profile={...common,identityAuthority:'tenant_adjudication',identityAuthorityRef:ref,identityConsolidatedAt:'2026-01-01'};
  const authUser={uid,disabled:false,email:digest('tya\0shopper\0'+login).slice(0,48)+'@auth.cxorbia.invalid',customClaims:{tenantId:'tya',shopperId,projectIds:['cinepolis'],role:'shopper',authNamespace:'shopper'}};
  const cross={tenantId:'tya',shopperId,sourceStableKey:shopperId,providerUidFingerprint:fingerprint,identityAuthorityRef:ref};
  const receipt={status:'committed',commandType:'shopper.identity.adjudicate',providerAck:true,identityConsolidated:true,shopperId,keeperUidFingerprint:fingerprint,actorUid:'qa-super',commandDigest:'c'.repeat(64),identityLinkId:linkId};
  const link={identityLinkId:linkId,tenantId:'tya',projectScope:'cinepolis',status:'active',canonicalShopperId:shopperId,authorityType:'tenant_adjudication',authorityRef:ref,providerAck:true,humanConfirmed:true,fuzzyMatching:false};
  const expected={ok:true,ruleVersion:rule,login:'qa.current',password:'Qa123*'};
  const records=legacy?[{kind:'shopper',authNamespace:'shopper',normalizedLogin:login,passwordHashAlgorithm:'SHA256',passwordHashRounds:1,passwordHashHex:digest('Qa123*')}]:[];
  const input={shopperId,uid,member,profile,authUser,expected,cross,receipt,link};
  const readState={complete:true,stage:'COMPLETE',crossExists:true,receiptExists:true,linkExists:true,linkDocumentId:linkId};
  return {input,records,readState};
}
const diagnose=f=>diagnoseCurrentProviderPasswordProof(f.input,f.records,f.readState);
test('GT adjudication failure identifies the exact predicate without changing the gate',()=>{
  const f=fixture();f.input.receipt.providerAck=false;
  const before=structuredClone(f),d=diagnose(f);
  assert.equal(d.primaryReason,'CURRENT_PROVIDER_ADJUDICATION_RECEIPT_UNPROVEN');
  assert.deepEqual(d.failedChecks,['RECEIPT_PROVIDER_ACK']);assert.equal(d.checks.AUTH_LOGIN_EMAIL,true);
  assert.equal(d.diagnosticComplete,true);assert.equal(d.provenanceAllowed,false);assert.deepEqual(f,before);
  assert.equal(assessCurrentProviderPasswordProof(f.input).allowed,false);
});
test('a link body ID and its independently read document ID are diagnosed separately',()=>{
  const f=fixture();delete f.input.link.identityLinkId;const d=diagnose(f);
  assert.equal(d.checks.LINK_DOCUMENT_ID,true);assert.equal(d.checks.LINK_ID,false);
  assert.deepEqual(d.failedChecks,['LINK_ID']);assert.equal(d.provenanceAllowed,false);
});
test('diagnosis continues beyond first-name failure and exposes only same-UID recipe booleans',()=>{
  const f=fixture('LEGACY_EXCEPTION',true);f.input.expected={...f.input.expected,login:'changed.current',password:'Changed123*'};f.input.link.humanConfirmed=false;
  const d=diagnose(f);assert.equal(d.primaryReason,'CURRENT_PROVIDER_FIRST_NAME_AUTHORITY_CHANGED');
  assert.equal(d.checks.FIRST_NAME_AUTHORITY_MATCH,false);assert.equal(d.checks.LINK_HUMAN_CONFIRMED,false);
  assert.deepEqual(d.historicalSameUidProof,{recordCount:1,supportedSealCount:1,uniqueSupportedSeal:true,currentRuleRecipeMatches:false,keeperLoginRecipeMatches:true,recipeUsedForLogin:false});
  for(const secret of ['qa.existing','changed.current','Qa123*','Changed123*',f.input.uid,f.records[0].passwordHashHex])assert.equal(JSON.stringify(d).includes(secret),false);
  assert.equal(d.provenanceAllowed,false);assert.equal(d.loginAttempts,0);
});
test('historical credential proof cannot follow another UID or choose among duplicate seals',()=>{
  const f=fixture('LEGACY_EXCEPTION',true);f.records[0].normalizedLogin='qa.other';
  let d=diagnose(f);assert.equal(d.historicalSameUidProof.recordCount,0);assert.equal(d.historicalSameUidProof.keeperLoginRecipeMatches,null);
  const g=fixture('LEGACY_EXCEPTION',true);g.records.push({...g.records[0]});d=diagnose(g);
  assert.equal(d.historicalSameUidProof.supportedSealCount,2);assert.equal(d.historicalSameUidProof.uniqueSupportedSeal,false);assert.equal(d.historicalSameUidProof.keeperLoginRecipeMatches,null);
});
test('missing markers, absent receipt and unread fields remain distinguishable',()=>{
  const f=fixture();delete f.input.member.credentialPasswordProofVersion;f.input.receipt=null;f.input.link=null;f.readState.receiptExists=false;f.readState.linkExists=null;
  const d=diagnose(f);assert.equal(d.checks.MEMBER_PASSWORD_PROOF_VERSION,false);assert.equal(d.checks.RECEIPT_EXISTS,false);assert.equal(d.checks.LINK_EXISTS,null);assert.equal(d.checks.RECEIPT_PROVIDER_ACK,null);
  assert.equal(d.diagnosticComplete,true);
});
test('public diagnostic only emits allowlisted codes, booleans and counts',()=>{
  const row={...diagnose(fixture()),password:'DO_NOT_EXPORT_SECRET',uid:'DO_NOT_EXPORT_UID',checks:{AUTH_UID:true,DO_NOT_EXPORT_CHECK:'DO_NOT_EXPORT_VALUE'},historicalSameUidProof:{passwordHashHex:'DO_NOT_EXPORT_HASH'}};
  const out=publicA08ProvenanceDiagnostic(row);assert.doesNotMatch(JSON.stringify(out),/DO_NOT_EXPORT/);assert.deepEqual(out.failedChecks,[]);
});

// Run the real R20 source in an isolated VM with every I/O/provider replaced.
// Even the positive authority case must exit before selecting a credential,
// launching the browser, creating a token, or performing a write.
const vmHarness=String.raw`
import vm from 'node:vm';import fs from 'node:fs';import crypto from 'node:crypto';
const payload=JSON.parse(fs.readFileSync(0,'utf8')),f=payload.fixture,x=f.input,written=new Map(),reads=[];
let browserLaunches=0,providerWrites=0,customTokens=0,exitCode=null,error=null;
const context=vm.createContext({Buffer,URL,console:{log(){},error(){}},CX_SHOPPER_CREDENTIAL_RULE:{shopperCredentialRule:()=>x.expected}});
context.process={env:{R20_CREDENTIAL_AUTHORITY:'CURRENT_PROVIDER_VERIFIED_RULE_V1',R20_AUTHORIZED_TEST_SHOPPER_ID:payload.target||x.shopperId,R20_SOURCE_SHA:'a'.repeat(40),R20_SAFE_OUT:'/out',GOOGLE_APPLICATION_CREDENTIALS:'/qa-sa'},argv:['node','runner.mjs','--provenance-only'],execPath:'/mock-node',cwd:()=>'/qa',exit(code){exitCode=code;throw new Error('EXPECTED_EXIT');}};
const snapshot=(id,data)=>({id,exists:data!==null&&data!==undefined,data:()=>data});
function doc(name,id){return{get:async()=>{reads.push(name);if(payload.readFailure===name)throw Error('PRIVATE_PROVIDER_ERROR');
 const data=name==='shoppers'?x.profile:name==='shopperIdentityCrosswalk'?x.cross:name==='commandReceipts'?x.receipt:name==='shopperIdentityLinks'?x.link:null;
 return snapshot(id,data);}};}
const tenant={collection:name=>({doc:id=>doc(name,id),where:()=>({limit:()=>({get:async()=>{reads.push(name);return{size:1,docs:[snapshot(x.uid,x.member)]};}})})})};
const forbidden=()=>{providerWrites++;throw Error('UNEXPECTED_WRITE');};
const auth={getUser:async()=>{reads.push('Auth');return x.authUser;},createCustomToken(){customTokens++;throw Error('UNEXPECTED_TOKEN');},updateUser:forbidden,deleteUser:forbidden,setCustomUserClaims:forbidden};
const mockFs={mkdirSync(){},existsSync:()=>true,readFileSync:()=>JSON.stringify({project_id:'cxorbia-backend-dev',private_key:'SYNTHETIC_ONLY'}),writeFileSync:(p,t)=>written.set(p,t)};
const supplied={
 'node:fs':{default:mockFs},'node:crypto':{default:crypto},'node:child_process':{spawnSync(){browserLaunches++;throw Error('UNEXPECTED_BROWSER');}},
 'firebase-admin/app':{applicationDefault:()=>({}),initializeApp(){},getApps:()=>[]},'firebase-admin/auth':{getAuth:()=>auth},'firebase-admin/firestore':{getFirestore:()=>({collection:()=>({doc:()=>tenant})})},
 './cxorbia-c6-shopper-identity-canonical-plan.mjs':{decryptCredentialBundle:()=>({records:f.records}),internalEmail:()=>x.authUser.email},
 '../../app/core/shopper-credential-rule.js':{}
};
const cache=new Map();
async function linker(spec){
 if(cache.has(spec))return cache.get(spec);
 let mod;if(spec==='./cxorbia-i3-a08-exact-password-proof.mjs')mod=new vm.SourceTextModule(payload.helper,{context,identifier:'helper.mjs'});
 else{if(!Object.hasOwn(supplied,spec))throw Error('UNMOCKED_IMPORT:'+spec);const value=supplied[spec];mod=new vm.SyntheticModule(Object.keys(value),function(){for(const [k,v]of Object.entries(value))this.setExport(k,v);},{context});}
 cache.set(spec,mod);await mod.link(linker);return mod;
}
try{const mod=new vm.SourceTextModule(payload.runner,{context,identifier:'runner.mjs'});await mod.link(linker);await mod.evaluate();}catch(e){if(e.message!=='EXPECTED_EXIT')error=e.message;}
const receipt=written.has('/out/result.json')?JSON.parse(written.get('/out/result.json')):null;
console.log(JSON.stringify({exitCode,error,browserLaunches,providerWrites,customTokens,reads,receipt}));
`;
function runIsolated(f,extra={}){
  const runner=fs.readFileSync(new URL('./cxorbia-i3-r20-ordinary-password-single-readonly.mjs',import.meta.url),'utf8');
  const helper=fs.readFileSync(new URL('./cxorbia-i3-a08-exact-password-proof.mjs',import.meta.url),'utf8');
  return JSON.parse(execFileSync(process.execPath,['--experimental-vm-modules','--input-type=module','-e',vmHarness],{input:JSON.stringify({fixture:f,runner,helper,...extra}),encoding:'utf8',maxBuffer:1024*1024,stdio:['pipe','pipe','pipe']}));
}
for(const allowed of [true,false])test('real R20 provenance branch performs zero login/actions when gate '+(allowed?'allows':'holds'),()=>{
  const f=fixture();if(!allowed)f.input.receipt.providerAck=false;const r=runIsolated(f);
  assert.equal(r.error,null);assert.equal(r.exitCode,0);assert.equal(r.browserLaunches,0);assert.equal(r.providerWrites,0);assert.equal(r.customTokens,0);
  assert.equal(r.receipt.diagnosticComplete,true);assert.equal(r.receipt.selection.selected,false);
  assert.equal(r.receipt.attemptedAccounts,0);assert.equal(r.receipt.loginAttempts,0);assert.equal(r.receipt.provenanceDiagnostics[0].provenanceAllowed,allowed);
  assert.equal(validateA08ProvenanceChild(r.receipt,{caseId:'GT_EXCEPTION',shopperId:f.input.shopperId,sourceSha}).caseId,'GT_EXCEPTION');
});
test('real R20 excludes the already-proven HN before any provider read',()=>{
  const r=runIsolated(fixture(),{target:'shopper_hn_3b3c2f5cc1'});assert.match(r.error,/A08_PROVENANCE_TARGET_NOT_AUTHORIZED/);assert.deepEqual(r.reads,[]);assert.equal(r.browserLaunches,0);
});
test('real R20 provider read failure is recorded without raw provider error or browser',()=>{
  const r=runIsolated(fixture(),{readFailure:'commandReceipts'});assert.equal(r.error,null);assert.equal(r.exitCode,1);assert.equal(r.browserLaunches,0);
  assert.equal(r.receipt.diagnosticComplete,false);assert.equal(r.receipt.provenanceDiagnostics[0].readStage,'RECEIPT');assert.doesNotMatch(JSON.stringify(r.receipt),/PRIVATE_PROVIDER_ERROR/);
});

function sealedResult(){
  const inventory=a08ServedInventory(Object.fromEntries(Array.from({length:48},(_,i)=>['core/asset'+i+'.js','e'.repeat(64)])));
  const identity={sourceSha,sourceTree:'b'.repeat(40),runtimeRevision:'cxorbia-live-hr-dev-00391-qa1',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/abcdef'};
  const pin={...identity,firestoreRuleset:'f',receiptPath:'p',receiptGitBlob:'b',controlHead:'control',...inventory};
  const seal={...pin,decision:'PASS_I3_SAME_ARTIFACT_READONLY_PREFLIGHT',storageRuleset:'s',servedAssetsMatch:48};
  const before={...seal,phase:'before',servedAssetsFetchedThisPhase:48,assetReadbackMode:'CURRENT_HOSTING_FETCH'},after={...seal,phase:'after',servedAssetsFetchedThisPhase:0,assetReadbackMode:'REUSED_BEFORE_ON_IDENTICAL_FINALIZED_HOSTING_VERSION'};
  const a=fixture(),b=fixture('LEGACY_EXCEPTION',true);a.input.receipt.providerAck=false;b.input.expected.login='changed.current';
  const result={schemaVersion:'cxorbia.i3.a08.password3-api-storage.residual.readonly.v1',...identity,gate:'HOLD',decision:'HOLD_I3_A08_RESIDUAL_READONLY',fullA08Certified:false,newDomainMatches:0,
    scope:{executionMode:'PROVENANCE_ONLY'},scopeDecision:'HOLD_I3_A08_REQUESTED_SCOPE_UNPROVEN',passwordProofs:[],apiProofs:[],storageProof:{pass:false},storageDiscovery:{executed:false},errors:[],preservedEvidence:[],
    provenanceDiagnostics:[diagnose(a),diagnose(b)],safety:{production:false,loginAttempts:0,browserLaunches:0,customTokensUsed:0,providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,storageWrites:0,hrWrites:0,passwordChanges:0,passwordResets:0,fixtureCreates:0,builds:0,deploys:0}};
  result.finalChecks=finalDecision(result,before,after,pin);result.sameArtifactAfter=result.finalChecks.seal;result.diagnosticComplete=result.finalChecks.diagnosticComplete;
  return {result,pin,before,after,identity};
}
test('both HOLD diagnoses complete the diagnostic job without satisfying password scope',()=>{
  const f=sealedResult();assert.equal(f.result.diagnosticComplete,true);assert.equal(f.result.finalChecks.requestedScopePass,false);assert.equal(f.result.finalChecks.pass,false);assert.equal(assertA08ExecutionResult(f.result),true);
  f.result.provenanceDiagnostics[1].caseId='GT_EXCEPTION';assert.equal(finalDecision(f.result,f.before,f.after,f.pin).diagnosticComplete,false);
});
test('typed consumer recognizes diagnostic mode and preserves only safe predicate evidence',()=>{
  const f=sealedResult();f.result.provenanceDiagnostics[0].login='DO_NOT_EXPORT_LOGIN';f.result.provenanceDiagnostics[0].historicalSameUidProof.passwordHashHex='DO_NOT_EXPORT_HASH';
  const transport={runId:12345678,runAttempt:1,jobId:222,artifactId:333,jobName:'i3-keeper-role-e2e-readonly',jobConclusion:'success',controlHead:'d'.repeat(40),artifactDigest:'sha256:'+'e'.repeat(64),verifiedArchiveDigest:'sha256:'+'e'.repeat(64),entry:'result.json'};
  const out=summarizeTypedResult({resultText:JSON.stringify(f.result),transport,expectedIdentity:f.identity});
  assert.equal(out.kind,'A08_RESIDUAL');assert.equal(out.state,'HOLD');assert.equal(out.observations.executionMode,'PROVENANCE_ONLY');assert.equal(out.observations.diagnosticComplete,true);
  assert.deepEqual(out.observations.provenanceDiagnostics[0].failedChecks,['RECEIPT_PROVIDER_ACK']);assert.deepEqual(out.ownerSpecificReceipts,[]);assert.equal(out.newDomainMatches,0);assert.doesNotMatch(JSON.stringify(out),/DO_NOT_EXPORT/);
  f.result.safety.loginAttempts=1;assert.throws(()=>summarizeTypedResult({resultText:JSON.stringify(f.result),transport,expectedIdentity:f.identity}),/A08_PROVENANCE_ZERO_ACTIONS/);
});
test('a legacy PASSWORD_ONLY incomplete result still fails the moved workflow contract',()=>{
  const f=sealedResult();f.result.scope.executionMode='PASSWORD_ONLY';assert.throws(()=>assertA08ExecutionResult(f.result),/A08_PASSWORD_RESULT_INCOMPLETE/);
});
