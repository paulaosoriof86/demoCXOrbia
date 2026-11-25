// Pure summaries of exact producer results; no provider calls or domain promotion.
// Consumer verifies the archive, exact producer attempt/job/window, and pins first.
import crypto from 'node:crypto';

const HASH=/^[a-f0-9]{64}$/, SHA=/^[a-f0-9]{40}$/;
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const need=(ok,code)=>{if(!ok)throw Error('MAPPING_FAILURE:TYPED_SUMMARY_'+code);};
const bool=value=>typeof value==='boolean'?value:null;
const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;
const length=value=>Array.isArray(value)?value.length:null;
const booleans=(obj,keys)=>Object.fromEntries(keys.map(key=>[key,bool(obj?.[key])]));
const counts=(obj,keys)=>Object.fromEntries(keys.map(key=>[key,count(obj?.[key])]));
const enumValue=(value,allowed)=>allowed.includes(value)?value:null;
const classes=['SOURCE_FAILURE','MAPPING_FAILURE','PROVIDER_FAILURE','PERSISTENCE_FAILURE','AUTH_FAILURE','FUNCTIONAL_DEFECT','VISUAL_DEFECT','RELEASE_COMPOSITION_FAILURE','ENVIRONMENT_FAILURE'];
const errorPattern=new RegExp('^('+classes.join('|')+'):([A-Z][A-Z0-9_]{0,139})(?=:|$)');
// Only the structured category and first machine code survive. Never include
// error messages, identifiers, provider bodies or free-form suffixes.
export function safeTypedFailureCode(value){
  if(typeof value!=='string')return null;
  const match=value.match(errorPattern);
  return match?match[1]+':'+match[2]:null;
}

export const TYPED_SUMMARY_SCHEMAS=Object.freeze({
  'cxorbia.f3.run2782.exact-owned-recovery.v1':{
    kind:'F3_RUN2782_RECOVERY',job:'i3-b14-qa-provider-proof',artifactPrefix:'cxorbia-i3-b14-qa-provider',entry:'f3-run2782-recovery.json',requiresRun:true,
    decisions:['PENDING','HOLD_F3_RUN2782_RECOVERY_UNVERIFIED','PASS_F3_RUN2782_EXACT_OWNED_RECOVERY_ONLY']
  },
  'cxorbia.i3.f3.qa-endpoint.v1':{
    kind:'F3_ENDPOINT',job:'i3-b14-qa-provider-proof',artifactPrefix:'cxorbia-i3-b14-qa-provider',entry:'receipt.json',requiresRun:true,
    decisions:['PENDING','HOLD_F3_ISOLATED_ENDPOINT','HOLD_F3_QA_CLEANUP_UNVERIFIED','PASS_F3_ISOLATED_ENDPOINT_CHAIN_REMOTE_CLEANUP_PENDING']
  },
  'cxorbia.i3.a08.password3-api-storage.residual.readonly.v1':{
    kind:'A08_RESIDUAL',job:'i3-keeper-role-e2e-readonly',artifactPrefix:'cxorbia-i3-two-keepers-role-e2e-readonly',entry:'result.json',requiresRun:false,
    decisions:['HOLD_I3_A08_RESIDUAL_READONLY','HOLD_I3_A08_STORAGE_PENDING','PENDING_A08_FINAL_SAME_ARTIFACT_READBACK','PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY']
  },
  'cxorbia.i3.finance-advance-metadata-result.v1':{
    kind:'FINANCE_METADATA',job:'i3-finance-focal-reproof',artifactPrefix:'cxorbia-i3-finance-focal',entry:'finance-metadata.json',requiresRun:false,
    decisions:['HOLD_FINANCE_METADATA','PASS_FINANCE_METADATA_ALREADY_APPLIED','PASS_FINANCE_METADATA_SECOND_ADVANCE']
  },
  'cxorbia.i3.finance-residual-public.v1':{
    kind:'FINANCE_READONLY',job:'i3-finance-focal-reproof',artifactPrefix:'cxorbia-i3-finance-focal',entry:'finance-readonly.json',requiresRun:true,
    decisions:['PASS_FINANCE_READONLY_CURRENT_MANIFEST','HOLD_FINANCE_CONCURRENT_DOCUMENT_CHANGE']
  }
});

function observedIdentity(raw,expected){
  const checks={sourceSha:SHA,sourceTree:SHA,runtimeRevision:/^cxorbia-live-hr-dev-\d{5}-[a-z0-9]+$/,
    runtimeDigest:/^sha256:[a-f0-9]{64}$/,hostingVersion:/^sites\/cxorbia-backend-dev\/versions\/[a-z0-9]+$/};
  const observed={};
  for(const [key,pattern]of Object.entries(checks)){
    const value=raw[key];
    if(value===null||value===undefined){observed[key]=null;continue;}
    need(typeof value==='string'&&pattern.test(value),'IDENTITY_'+key);
    if(expected[key]!==undefined&&expected[key]!==null)need(value===expected[key],'PIN_'+key);
    observed[key]=value;
  }
  return {observed,complete:Object.values(observed).every(Boolean)};
}

export function summarizeTypedResult({resultText,transport,expectedIdentity={}}){
  need(typeof resultText==='string'&&Buffer.byteLength(resultText)<=2*1024*1024,'RESULT_SIZE');
  let raw;try{raw=JSON.parse(resultText);}catch{throw Error('MAPPING_FAILURE:TYPED_SUMMARY_INVALID_JSON');}
  const spec=TYPED_SUMMARY_SCHEMAS[raw?.schemaVersion];need(spec,'UNKNOWN_SCHEMA');
  need(spec.decisions.includes(raw.decision),'UNKNOWN_PRODUCER_DECISION');
  const t=transport||{};
  for(const key of ['runId','runAttempt','jobId','artifactId'])need(/^[1-9][0-9]*$/.test(String(t[key]||'')),'TRANSPORT_'+key);
  need(t.jobName===spec.job&&['success','failure','cancelled','timed_out','action_required','neutral','stale'].includes(t.jobConclusion),'PRODUCER_JOB');
  need(SHA.test(String(t.controlHead||''))&&/^sha256:[a-f0-9]{64}$/.test(String(t.artifactDigest||''))&&t.verifiedArchiveDigest===t.artifactDigest,'TRANSPORT_DIGEST');
  need(t.entry===spec.entry,'ARTIFACT_ENTRY');
  if(spec.requiresRun||raw.runId!==undefined)need(String(raw.runId)===String(t.runId),'RUN_ID');
  if(spec.requiresRun||raw.runAttempt!==undefined)need(String(raw.runAttempt)===String(t.runAttempt),'RUN_ATTEMPT');
  const rawHash=hash(resultText);if(t.resultSha256!==undefined)need(t.resultSha256===rawHash,'RAW_HASH');
  const identity=observedIdentity(raw,expectedIdentity);
  const rawErrors=[raw.failure,raw.error,...(Array.isArray(raw.cleanupErrors)?raw.cleanupErrors:[]),
    ...(Array.isArray(raw.errors)?raw.errors.map(x=>x?.code):[])];
  const failureCodes=[...new Set(rawErrors.map(safeTypedFailureCode).filter(Boolean))];
  const unclassifiedFailureCount=rawErrors.filter(x=>typeof x==='string'&&x.length>0&&!safeTypedFailureCode(x)).length;
  const declaredClass=classes.includes(raw.classification)?raw.classification:null;
  const classification=failureCodes.length?failureCodes[0].split(':')[0]:declaredClass;
  let observations;
  if(spec.kind==='F3_RUN2782_RECOVERY'){
    need(raw.state==='HOLD'&&raw.applicationAckProven===false&&raw.b14Closed===false&&raw.newModuleMatches===0,'F3_RECOVERY_CREDIT_BOUNDARY');
    need(raw.production===false&&raw.productionWrites===0&&raw.hrWrites===0&&(raw.remoteMakeWrites===undefined||raw.remoteMakeWrites===0),'F3_RECOVERY_DEV_SCOPE');
    need(String(raw.targetRunId)==='45493719666'&&String(raw.targetRunAttempt)==='1','F3_RECOVERY_TARGET');
    observations={
      applicationAckProven:false,b14Closed:false,...counts(raw,['firestoreDeletes','authDeletes']),
      cleanup:{...booleans(raw.cleanup,['firestore','auth']),remoteMake:enumValue(raw.cleanup?.remoteMake,['INDEPENDENT_ABSENCE_ALREADY_PROVEN_NO_DELETE'])},
      writerProbe:{decision:enumValue(raw.writerProbe?.decision,['PASS_F3_WRITER_INITIALIZE_LISTTOOLS_CONTRACT_ONLY','HOLD_F3_WRITER_TOOL_CONTRACT','HOLD_F3_WRITER_INITIALIZE_OR_LISTTOOLS_FAILED']),
        stage:enumValue(raw.writerProbe?.stage,['secret_access','initialize','list_tools','contract']),...booleans(raw.writerProbe,['contractExact','nextCursorPresent']),
        ...counts(raw.writerProbe,['providerWrites','callToolCount','toolCount']),httpStatus:Number.isInteger(raw.writerProbe?.httpStatus)&&raw.writerProbe.httpStatus>=100&&raw.writerProbe.httpStatus<=599?raw.writerProbe.httpStatus:null},
      safety:{...counts(raw,['hrWrites','remoteMakeWrites','productionWrites']),production:false}
    };
    if(raw.decision==='PASS_F3_RUN2782_EXACT_OWNED_RECOVERY_ONLY')need(raw.cleanup?.firestore===true&&raw.cleanup?.auth===true&&raw.firestoreDeletes===29&&raw.authDeletes===1,'F3_RECOVERY_PASS_READBACK');
  }else if(spec.kind==='F3_ENDPOINT'){
    need(raw.state==='HOLD'&&raw.syntheticOnly===true&&raw.b14Closed===false&&raw.newModuleMatches===0,'F3_CREDIT_BOUNDARY');
    need(raw.productionWrites===0&&raw.operationalHrWrites===0,'F3_DEV_SCOPE');
    observations={
      ...booleans(raw,['applicationAckProven','remoteValuesRestored','recoveryRequired','notesPrivacyProven','ordinaryPasswordAuthenticationProven']),
      caseCount:length(raw.cases),eventCount:length(raw.events),remoteCommandAttemptCount:length(raw.remoteCommandAttempts),
      cleanup:{...booleans(raw.cleanup,['firestore','auth','remoteMake','authPreservedForRecovery']),errorCount:length(raw.cleanupErrors)},
      safety:counts(raw,['productionWrites','operationalHrWrites']),
      guarantees:booleans(raw.guarantees,['atomicHumanExcelCas','observedBaseGuard','remoteReceiptAndIndependentRead','uncertainWriteRetry']),
      remoteCleanupRequired:bool(raw.remoteCleanup?.required),
      unproven:['provider_response_loss_live_fault_injection','external_human_concurrent_edit_atomicity','historical_period_live_fixture','T&A_private_notes_live_fixture'].filter(x=>raw.unproven?.includes(x))
    };
  }else if(spec.kind==='A08_RESIDUAL'){
    need(raw.gate==='HOLD'&&raw.fullA08Certified===false&&raw.newDomainMatches===0,'A08_CREDIT_BOUNDARY');
    need(raw.safety?.production===false,'A08_DEV_SCOPE');
    const passwords=Array.isArray(raw.passwordProofs)?raw.passwordProofs:[],apis=Array.isArray(raw.apiProofs)?raw.apiProofs:[];
    observations={
      executionMode:enumValue(raw.scope?.executionMode,['PASSWORD_ONLY','PASSWORD_API_ONLY','PASSWORD_API_STORAGE']),
      scopeDecision:enumValue(raw.scopeDecision,['PASS_I3_A08_PASSWORD3_SCOPED_READONLY','PASS_I3_A08_PASSWORD3_API_SCOPED_READONLY','PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY','HOLD_I3_A08_REQUESTED_SCOPE_UNPROVEN']),
      passwordProofCount:length(raw.passwordProofs),passwordPassCount:passwords.filter(x=>x?.pass===true).length,
      apiProofCount:length(raw.apiProofs),apiDenialPassCount:apis.filter(x=>x?.pass===true).length,
      apiStatusCounts:Object.fromEntries([200,401,403].map(status=>[status,apis.filter(x=>x?.httpStatus===status).length])),
      finalChecks:{...booleans(raw.finalChecks,['seal','passwords','apis','storage','requestedScopePass','pass']),...counts(raw.finalChecks,['expectedAssetCount','servedAssetCount'])},
      sameArtifactAfter:bool(raw.sameArtifactAfter),storageProof:booleans(raw.storageProof,['pass','objectStable']),
      storageDiscoveryExecuted:bool(raw.storageDiscovery?.executed),preservedEvidenceCount:length(raw.preservedEvidence),
      safety:{...counts(raw.safety,['providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys']),
        ...booleans(raw.safety,['production','credentialsExported','tokensExported','privateBytesExported','privatePathsExported'])}
    };
  }else if(spec.kind==='FINANCE_METADATA'){
    need(raw.production===false&&raw.privateDataExposed===false,'FINANCE_METADATA_SCOPE');
    observations={
      ...booleans(raw,['idempotentReplay','idempotentNoop','readbackExact','firstUnchanged','financialFactsUnchanged','sameLedgerTotal']),
      ...counts(raw,['providerCommandsExecuted','providerWrites','advanceCount','movementCount','newMovements','allocationOrPayoutWrites']),
      mutationOutcome:enumValue(raw.mutationOutcome,['REQUIRES_RECEIPT_READBACK','NO_COMMAND_DISPATCHED']),
      scopeSha256:HASH.test(String(raw.scopeSha256||''))?raw.scopeSha256:null,
      safety:{...counts(raw,['hrWrites','bankWrites','externalPaymentWrites','directFirestoreWrites','financialFactWrites']),production:bool(raw.production)}
    };
  }else{
    need(raw.production===false&&raw.privateDataExposed===false&&raw.newDomainMatches===0&&raw.phaseAComplete===false&&raw.operationKind==='READ_ONLY','FINANCE_READONLY_SCOPE');
    observations={
      ...booleans(raw,['completeRead','sameDocumentsStable','atomicSnapshotClaimed','freshExternalHrVerified']),
      providerCommandsExecuted:count(raw.providerCommandsExecuted),
      safety:{...counts(raw.writes,['firestore','auth','hr','finance','bank']),production:bool(raw.production)},
      encryptedEvidenceSha256:HASH.test(String(raw.encryptedEvidenceSha256||''))?raw.encryptedEvidenceSha256:null
    };
  }
  return {
    schemaVersion:'cxorbia.i3.typed-result-summary.v1',kind:spec.kind,
    state:'HOLD',decision:'RECORDED_TYPED_RESULT_HOLD',
    producer:{schemaVersion:raw.schemaVersion,decision:raw.decision,jobName:spec.job,jobConclusion:t.jobConclusion},
    provenance:{runId:String(t.runId),runAttempt:String(t.runAttempt),jobId:String(t.jobId),controlHead:t.controlHead,
      artifactId:String(t.artifactId),artifactDigest:t.artifactDigest,entry:spec.entry,resultSha256:rawHash},
    identity,classification,failureCodes,unclassifiedFailureCount,observations,
    ownerSpecificReceipts:[],fullDomain:false,newDomainMatches:0,phaseAComplete:false,
    productActionsPerformedByConsumer:0,production:false,privateValuesStored:false
  };
}
