// Synthetic artifact contracts only. No provider calls or production evidence.
import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeTypedResult,TYPED_SUMMARY_SCHEMAS,safeTypedFailureCode} from './cxorbia-i3-typed-result-summary.mjs';
const identity={sourceSha:'a'.repeat(40),sourceTree:'b'.repeat(40),runtimeRevision:'cxorbia-live-hr-dev-00399-qa1',runtimeDigest:'sha256:'+'c'.repeat(64),hostingVersion:'sites/cxorbia-backend-dev/versions/abcdef1234'};
export function typedSummaryFixture(kind='F3_ENDPOINT'){
  const schema=Object.keys(TYPED_SUMMARY_SCHEMAS).find(key=>TYPED_SUMMARY_SCHEMAS[key].kind===kind),spec=TYPED_SUMMARY_SCHEMAS[schema];
  const transport={runId:12345678,runAttempt:1,jobId:222,artifactId:333,jobName:spec.job,jobConclusion:'failure',controlHead:'d'.repeat(40),artifactDigest:'sha256:'+'e'.repeat(64),verifiedArchiveDigest:'sha256:'+'e'.repeat(64),entry:spec.entry};
  let raw;
  if(kind==='F3_ENDPOINT')raw={schemaVersion:schema,state:'HOLD',decision:'HOLD_F3_ISOLATED_ENDPOINT',runId:'12345678',runAttempt:'1',...identity,syntheticOnly:true,b14Closed:false,newModuleMatches:0,productionWrites:0,operationalHrWrites:0,
    applicationAckProven:false,remoteValuesRestored:false,recoveryRequired:true,notesPrivacyProven:false,ordinaryPasswordAuthenticationProven:false,
    cases:[{name:'internal-case',privateValue:'DO_NOT_STORE_PERSON'}],events:[{eventId:'DO_NOT_STORE_EVENT'}],remoteCommandAttempts:[{command:{private:'DO_NOT_STORE_COMMAND'}}],
    cleanup:{firestore:false,auth:false,remoteMake:false,authPreservedForRecovery:true},remoteCleanup:{required:true,eventKeys:['DO_NOT_STORE_KEY']},
    failure:'PERSISTENCE_FAILURE:F3_QA_LOCK_OWNER:DO_NOT_STORE_ERROR_SUFFIX',cleanupErrors:['PERSISTENCE_FAILURE:F3_QA_REMOTE_RESTORE_REQUIRED'],
    guarantees:{atomicHumanExcelCas:false,observedBaseGuard:true,remoteReceiptAndIndependentRead:true,uncertainWriteRetry:false},unproven:['historical_period_live_fixture']};
  else if(kind==='A08_RESIDUAL')raw={schemaVersion:schema,gate:'HOLD',decision:'HOLD_I3_A08_STORAGE_PENDING',fullA08Certified:false,newDomainMatches:0,...identity,
    scope:{executionMode:'PASSWORD_ONLY',exceptionShopperIds:['DO_NOT_STORE_SHOPPER']},scopeDecision:'PASS_I3_A08_PASSWORD3_SCOPED_READONLY',
    passwordProofs:[{shopperId:'DO_NOT_STORE_SHOPPER',pass:true},{shopperId:'DO_NOT_STORE_OTHER',pass:true},{shopperId:'DO_NOT_STORE_THIRD',pass:true}],apiProofs:[],
    finalChecks:{seal:true,passwords:true,apis:false,storage:false,requestedScopePass:true,pass:false,expectedAssetCount:48,servedAssetCount:48},sameArtifactAfter:true,storageDiscovery:{executed:false,privatePath:'DO_NOT_STORE_PATH'},
    errors:[],preservedEvidence:[{private:'DO_NOT_STORE_EVIDENCE'}],safety:{production:false,providerCommands:0,directAuthWrites:0,directFirestoreWrites:0,storageWrites:0,hrWrites:0,passwordChanges:0,passwordResets:0,fixtureCreates:0,builds:0,deploys:0,credentialsExported:false,tokensExported:false,privateBytesExported:false,privatePathsExported:false}};
  else if(kind==='FINANCE_METADATA')raw={schemaVersion:schema,decision:'HOLD_FINANCE_METADATA',sourceSha:identity.sourceSha,sourceTree:identity.sourceTree,production:false,privateDataExposed:false,
    error:'PROVIDER_FAILURE:FINANCE_METADATA_CONFIGURE_REQUIRES_HR',providerCommandsExecuted:0,mutationOutcome:'NO_COMMAND_DISPATCHED',scopeSha256:'f'.repeat(64),
    hrWrites:0,bankWrites:0,externalPaymentWrites:0,directFirestoreWrites:0,financialFactWrites:0,newMovements:0,advanceTotal:123456.78,movement:{name:'DO_NOT_STORE_FINANCE_PERSON',bankAccount:'DO_NOT_STORE_BANK'}};
  else raw={schemaVersion:schema,decision:'PASS_FINANCE_READONLY_CURRENT_MANIFEST',operationKind:'READ_ONLY',runId:'12345678',runAttempt:'1',sourceSha:identity.sourceSha,sourceTree:identity.sourceTree,production:false,privateDataExposed:false,newDomainMatches:0,phaseAComplete:false,
    completeRead:true,sameDocumentsStable:true,atomicSnapshotClaimed:false,freshExternalHrVerified:false,providerCommandsExecuted:0,writes:{firestore:0,auth:0,hr:0,finance:0,bank:0},encryptedEvidenceSha256:'f'.repeat(64),
    identityPreflight:{shopperName:'DO_NOT_STORE_FINANCE_NAME'},encryptedEvidence:'DO_NOT_STORE_PRIVATE_FILE'};
  return {raw,transport,summarize:(r=raw,t=transport)=>summarizeTypedResult({resultText:JSON.stringify(r),transport:t,expectedIdentity:identity})};
}
for(const kind of ['F3_ENDPOINT','A08_RESIDUAL','FINANCE_METADATA','FINANCE_READONLY'])test(kind+' is durably recordable without any domain promotion or private fields',()=>{
  const f=typedSummaryFixture(kind),out=f.summarize();
  assert.equal(out.kind,kind);assert.equal(out.state,'HOLD');assert.equal(out.newDomainMatches,0);assert.equal(out.phaseAComplete,false);assert.equal(out.fullDomain,false);assert.deepEqual(out.ownerSpecificReceipts,[]);
  assert.equal(out.productActionsPerformedByConsumer,0);assert.equal(out.privateValuesStored,false);assert.doesNotMatch(JSON.stringify(out),/DO_NOT_STORE|123456\.78/);
  assert.equal(out.provenance.runId,'12345678');assert.match(out.provenance.resultSha256,/^[a-f0-9]{64}$/);
});
test('F3 failure retains exact classification, cleanup and recovery requirement',()=>{
  const out=typedSummaryFixture().summarize();assert.equal(out.classification,'PERSISTENCE_FAILURE');
  assert.deepEqual(out.failureCodes,['PERSISTENCE_FAILURE:F3_QA_LOCK_OWNER','PERSISTENCE_FAILURE:F3_QA_REMOTE_RESTORE_REQUIRED']);
  assert.equal(out.observations.recoveryRequired,true);assert.equal(out.observations.cleanup.authPreservedForRecovery,true);assert.equal(out.producer.jobConclusion,'failure');
});
test('F3 partial PASS still retains HOLD and does not close B14 or Make cleanup',()=>{
  const f=typedSummaryFixture();f.raw.decision='PASS_F3_ISOLATED_ENDPOINT_CHAIN_REMOTE_CLEANUP_PENDING';f.raw.applicationAckProven=true;f.raw.remoteValuesRestored=true;f.raw.cleanup={firestore:true,auth:true,remoteMake:false};delete f.raw.failure;delete f.raw.cleanupErrors;
  const out=f.summarize();assert.equal(out.state,'HOLD');assert.equal(out.observations.applicationAckProven,true);assert.equal(out.observations.cleanup.remoteMake,false);assert.deepEqual(out.ownerSpecificReceipts,[]);
});
test('A08 three password passes are preserved while storage remains unproved',()=>{
  const out=typedSummaryFixture('A08_RESIDUAL').summarize();assert.equal(out.observations.passwordPassCount,3);assert.equal(out.observations.apiProofCount,0);assert.equal(out.observations.finalChecks.requestedScopePass,true);assert.equal(out.observations.finalChecks.storage,false);assert.equal(out.state,'HOLD');
});
test('finance failure before dispatch remains no command dispatched',()=>{
  const out=typedSummaryFixture('FINANCE_METADATA').summarize();assert.equal(out.classification,'PROVIDER_FAILURE');assert.equal(out.observations.providerCommandsExecuted,0);assert.equal(out.observations.mutationOutcome,'NO_COMMAND_DISPATCHED');assert.equal(out.observations.readbackExact,null);
});
test('finance already-applied/noop is not mislabeled as replay or new write',()=>{
  const f=typedSummaryFixture('FINANCE_METADATA');Object.assign(f.raw,{decision:'PASS_FINANCE_METADATA_ALREADY_APPLIED',idempotentNoop:true,idempotentReplay:false,providerWrites:0,readbackExact:true});delete f.raw.error;
  const out=f.summarize();assert.equal(out.observations.idempotentNoop,true);assert.equal(out.observations.idempotentReplay,false);assert.equal(out.observations.providerWrites,0);assert.equal(out.newDomainMatches,0);
});
test('absent fields remain unknown, not false proof',()=>{
  const f=typedSummaryFixture();delete f.raw.remoteValuesRestored;delete f.raw.remoteCommandAttempts;
  const out=f.summarize();assert.equal(out.observations.remoteValuesRestored,null);assert.equal(out.observations.remoteCommandAttemptCount,null);
});
test('unclassified free-form error is counted without persisting its contents',()=>{
  const f=typedSummaryFixture();f.raw.failure='DO_NOT_STORE unstructured message person@example.test';f.raw.cleanupErrors=[];
  const out=f.summarize();assert.equal(out.classification,null);assert.equal(out.unclassifiedFailureCount,1);assert.deepEqual(out.failureCodes,[]);assert.doesNotMatch(JSON.stringify(out),/DO_NOT_STORE|example/);
});
for(const [label,mutate]of [
  ['wrong run',f=>f.raw.runId='999'],['wrong attempt',f=>f.raw.runAttempt='2'],['wrong producer job',f=>f.transport.jobName='other'],
  ['wrong artifact digest',f=>f.transport.verifiedArchiveDigest='sha256:'+'1'.repeat(64)],['wrong entry',f=>f.transport.entry='private.json'],
  ['wrong source pin',f=>f.raw.sourceSha='1'.repeat(40)],['unknown schema',f=>f.raw.schemaVersion='unrecognized'],
  ['unknown producer decision',f=>f.raw.decision='DO_NOT_STORE_USER_DECISION'],['unsupported domain credit',f=>f.raw.b14Closed=true],['production scope',f=>f.raw.productionWrites=1]
])test('rejects '+label,()=>{const f=typedSummaryFixture();mutate(f);assert.throws(()=>f.summarize(),/MAPPING_FAILURE:TYPED_SUMMARY_/);});
test('machine failure codes do not preserve arbitrary suffixes or free text',()=>{
  assert.equal(safeTypedFailureCode('AUTH_FAILURE:A08_EXACT_ORDINARY_PASSWORD_UNPROVEN:private'),'AUTH_FAILURE:A08_EXACT_ORDINARY_PASSWORD_UNPROVEN');
  assert.equal(safeTypedFailureCode('email@example.test failed'),null);
});
function recoveryFixture(){
  const f=typedSummaryFixture();
  f.raw={schemaVersion:'cxorbia.f3.run2782.exact-owned-recovery.v1',state:'HOLD',decision:'PASS_F3_RUN2782_EXACT_OWNED_RECOVERY_ONLY',runId:'12345678',runAttempt:'1',targetRunId:'45493719666',targetRunAttempt:'1',...identity,
    production:false,productionWrites:0,hrWrites:0,remoteMakeWrites:0,applicationAckProven:false,b14Closed:false,newModuleMatches:0,firestoreDeletes:29,authDeletes:1,
    cleanup:{firestore:true,auth:true,remoteMake:'INDEPENDENT_ABSENCE_ALREADY_PROVEN_NO_DELETE'},
    writerProbe:{decision:'HOLD_F3_WRITER_INITIALIZE_OR_LISTTOOLS_FAILED',stage:'initialize',httpStatus:401,providerWrites:0,callToolCount:0,secret:'DO_NOT_STORE_SECRET'},
    before:{documents:[{data:{value:'DO_NOT_STORE_ROW'}}],auth:{uid:'DO_NOT_STORE_AUTH'}}};
  f.transport.entry='f3-run2782-recovery.json';
  f.summarize=()=>summarizeTypedResult({resultText:JSON.stringify(f.raw),transport:f.transport,expectedIdentity:identity});return f;
}
test('exact F3 recovery records cleanup and connection diagnosis without promoting endpoint proof',()=>{
  const out=recoveryFixture().summarize();assert.equal(out.kind,'F3_RUN2782_RECOVERY');assert.equal(out.state,'HOLD');assert.equal(out.observations.firestoreDeletes,29);assert.equal(out.observations.writerProbe.httpStatus,401);assert.equal(out.newDomainMatches,0);assert.deepEqual(out.ownerSpecificReceipts,[]);assert.doesNotMatch(JSON.stringify(out),/DO_NOT_STORE/);
});
test('held F3 recovery retains unknown cleanup without claiming absence',()=>{
  const f=recoveryFixture();f.raw.decision='HOLD_F3_RUN2782_RECOVERY_UNVERIFIED';delete f.raw.cleanup;f.raw.firestoreDeletes=0;f.raw.authDeletes=0;
  assert.equal(f.summarize().observations.cleanup.firestore,null);
});
for(const [name,change]of [
 ['wrong recovered run',f=>f.raw.targetRunId='45493719667'],['unproved cleanup PASS',f=>f.raw.cleanup.auth=false],
 ['endpoint credit',f=>f.raw.applicationAckProven=true],['remote write',f=>f.raw.remoteMakeWrites=1]
])test('F3 recovery rejects '+name,()=>{const f=recoveryFixture();change(f);assert.throws(()=>f.summarize(),/MAPPING_FAILURE:TYPED_SUMMARY_/);});
