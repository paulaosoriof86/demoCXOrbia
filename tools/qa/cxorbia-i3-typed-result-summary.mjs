// Pure summaries of exact producer results; no provider calls or domain promotion.
// Consumer verifies the archive, exact producer attempt/job/window, and pins first.
import crypto from 'node:crypto';
import {publicA08ProvenanceDiagnostic,A08_PROVENANCE_TARGETS} from './cxorbia-i3-a08-exact-password-proof.mjs';
import {publicA08ClauseRefs} from './cxorbia-i3-scoped-clause-projection.mjs';

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
  'cxorbia.i3.d08-recovery-cleanup.v1':{
    kind:'D08_RECOVERY',job:'i3-run2382-academy-b7-isolated-dev-qa',artifactPrefix:'cxorbia-i3-run2382-academy-b7-synthetic',entry:'d08-recovery/result.json',requiresRun:true,
    decisions:['HOLD','PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP']
  },
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
  'cxorbia.i3.finance-core-ui-readonly.v1':{
    kind:'FINANCE_UI_READONLY',job:'i3-finance-focal-reproof',artifactPrefix:'cxorbia-i3-finance-focal',entry:'finance-ui-readonly.json',requiresRun:true,
    decisions:['HOLD_C09_C10_UI_READONLY','PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE']
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

function financeUiSeal({seal,transport,expected}){
  const present=!!seal,jobSuccessful=transport.jobConclusion==='success';
  const bindingExact=present&&seal.entry==='identity-live-readback.json'&&String(seal.artifactId)===String(transport.artifactId)&&seal.artifactDigest===transport.artifactDigest;
  const bounded=typeof seal?.text==='string'&&Buffer.byteLength(seal.text)<=65536;
  let parsed=null;if(bounded){try{parsed=JSON.parse(seal.text);}catch{}}
  const parseable=!!parsed&&typeof parsed==='object'&&!Array.isArray(parsed);
  const fieldsExact=parseable&&['sourceSha','runtimeRevision','hostingVersion'].every(key=>typeof expected[key]==='string'&&expected[key]&&parsed[key]===expected[key]);
  const noDeployment=parseable&&parsed.production===false&&parsed.deploys===0;
  const readbackExact=parseable&&parsed.decision==='PASS_CURRENT_FINANCE_DEV_IDENTITY_READBACK'&&parsed.runtimeTrafficExact===true&&parsed.hostingBeforeAfterSame===true;
  return {entry:'identity-live-readback.json',present,bindingExact,parseable,jobSuccessful,fieldsExact:!!fieldsExact,noDeployment:!!noDeployment,readbackExact:!!readbackExact,
    sha256:bounded?hash(seal.text):null,verified:!!(jobSuccessful&&bindingExact&&fieldsExact&&noDeployment&&readbackExact)};
}
function financeUiStage(value){
  return typeof value==='string'&&/^(?:PREFLIGHT|DEPENDENCIES|ADC_BASELINE|METADATA_RECEIPT|ADMIN_AUTHORITY|SESSION_[12]_(?:AUTH|PERIOD|MOVEMENTS|MOVEMENT_EXPORT|DASHBOARD|FINAL_READ)|FINAL_LEDGER|COMPLETE)$/.test(value)?value:null;
}

export function summarizeTypedResult({resultText,transport,expectedIdentity={},identityReadback}){
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
  let classification=failureCodes.length?failureCodes[0].split(':')[0]:declaredClass;
  let summaryDecision='RECORDED_TYPED_RESULT_HOLD';
  let observations;
  if(spec.kind==='D08_RECOVERY'){
    need(raw.state==='HOLD'&&raw.fullDomain===false&&raw.phaseAComplete===false&&raw.newDomainMatches===0,'D08_RECOVERY_CREDIT_BOUNDARY');
    need(raw.executionMode==='RECOVERY_ONLY'&&raw.production===false&&raw.productionWrites===0&&raw.hrWrites===0&&raw.fixtureCreates===0&&raw.providerCommands===0,'D08_RECOVERY_SCOPE');
    need(String(raw.fixtureRunId)==='45514816284'&&String(raw.fixtureRunAttempt)==='1'&&raw.originalJournalSha256==='f77b28264754da5011b40b25e19107c3091f34f7163108d24ba50ddd7e2446fc'&&raw.expectedDocuments===18&&raw.expectedAuthUsers===4,'D08_RECOVERY_TARGET');
    observations={fixtureRunId:String(raw.fixtureRunId),fixtureRunAttempt:String(raw.fixtureRunAttempt),originalJournalSha256:raw.originalJournalSha256,
      firestoreTransactionConfirmed:bool(raw.firestoreTransactionConfirmed),cleanup:{...booleans(raw.cleanup,['ok','exactKnownPathsOnly','ownershipTransaction']),...counts(raw.cleanup,['deletedDocuments','deletedAuth','remainingOwnedDocuments','remainingOwnedAuth'])},
      safety:{...counts(raw,['fixtureCreates','providerCommands','hrWrites','productionWrites']),production:false}};
    if(raw.decision==='PASS_I3_D08_RUN2783_EXACT_RECOVERY_CLEANUP')need(raw.firestoreTransactionConfirmed===true&&raw.cleanup?.ok===true&&raw.cleanup.exactKnownPathsOnly===true&&raw.cleanup.ownershipTransaction===true&&raw.cleanup.remainingOwnedDocuments===0&&raw.cleanup.remainingOwnedAuth===0&&[0,18].includes(raw.cleanup.deletedDocuments)&&Number.isInteger(raw.cleanup.deletedAuth)&&raw.cleanup.deletedAuth>=0&&raw.cleanup.deletedAuth<=4,'D08_RECOVERY_PASS_READBACK');
  }else if(spec.kind==='F3_RUN2782_RECOVERY'){
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
    const provenanceOnly=raw.scope?.executionMode==='PROVENANCE_ONLY';
    const diagnostics=provenanceOnly?(Array.isArray(raw.provenanceDiagnostics)?raw.provenanceDiagnostics:[]).map(publicA08ProvenanceDiagnostic):[];
    if(provenanceOnly){
      need(passwords.length===0&&apis.length===0&&['loginAttempts','browserLaunches','customTokensUsed','providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys'].every(k=>raw.safety[k]===0),'A08_PROVENANCE_ZERO_ACTIONS');
      need(diagnostics.length<=2&&diagnostics.every(x=>x.caseId&&x.diagnosticOnly&&x.loginAttempts===0&&x.browserLaunches===0&&x.customTokensUsed===0&&x.historicalSameUidProof.recipeUsedForLogin===false)&&new Set(diagnostics.map(x=>x.caseId)).size===diagnostics.length,'A08_PROVENANCE_DIAGNOSTIC_SCOPE');
      if(raw.diagnosticComplete===true)need(diagnostics.length===2&&Object.keys(A08_PROVENANCE_TARGETS).every(id=>diagnostics.some(x=>x.caseId===id&&x.diagnosticComplete&&x.primaryReason))&&raw.sameArtifactAfter===true&&raw.finalChecks?.diagnosticComplete===true&&raw.finalChecks.requestedScopePass===false&&raw.finalChecks.pass===false&&raw.storageDiscovery?.executed===false,'A08_PROVENANCE_COMPLETENESS');
    }
    observations={
      executionMode:enumValue(raw.scope?.executionMode,['PASSWORD_ONLY','PASSWORD_API_ONLY','PASSWORD_API_STORAGE','PROVENANCE_ONLY']),
      scopeDecision:enumValue(raw.scopeDecision,['PASS_I3_A08_PASSWORD3_SCOPED_READONLY','PASS_I3_A08_PASSWORD3_API_SCOPED_READONLY','PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY','HOLD_I3_A08_REQUESTED_SCOPE_UNPROVEN']),
      passwordProofCount:length(raw.passwordProofs),passwordPassCount:passwords.filter(x=>x?.pass===true).length,
      apiProofCount:length(raw.apiProofs),apiDenialPassCount:apis.filter(x=>x?.pass===true).length,
      apiStatusCounts:Object.fromEntries([200,401,403].map(status=>[status,apis.filter(x=>x?.httpStatus===status).length])),
      finalChecks:{...booleans(raw.finalChecks,['seal','passwords','apis','storage','requestedScopePass','pass']),...counts(raw.finalChecks,['expectedAssetCount','servedAssetCount'])},
      sameArtifactAfter:bool(raw.sameArtifactAfter),storageProof:booleans(raw.storageProof,['pass','objectStable']),
      storageDiscoveryExecuted:bool(raw.storageDiscovery?.executed),preservedEvidenceCount:length(raw.preservedEvidence),
      acceptedClauseRefs:publicA08ClauseRefs(raw,t),
      ...(provenanceOnly?{diagnosticComplete:bool(raw.diagnosticComplete),provenanceDiagnostics:diagnostics}:{}),
      safety:{...counts(raw.safety,['providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys']),
        ...(provenanceOnly?counts(raw.safety,['loginAttempts','browserLaunches','customTokensUsed']):{}),
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
  }else if(spec.kind==='FINANCE_UI_READONLY'){
    need(raw.production===false&&raw.privateDataExposed===false&&raw.fullDomain===false&&raw.newDomainMatches===0&&raw.phaseAComplete===false&&raw.state==='HOLD'&&raw.operationKind==='READ_ONLY_WITH_APP_MUTATIONS_BLOCKED','FINANCE_UI_SCOPE');
    need(raw.paymentsTested===false&&raw.benefitsRetested===false&&raw.dashboardIndependentHrKpisCertified===false&&raw.automaticHrReconciliationProven===false,'FINANCE_UI_CREDIT_BOUNDARY');
    const sessions=Array.isArray(raw.sessions)?raw.sessions:[];
    const seal=financeUiSeal({seal:identityReadback,transport:t,expected:expectedIdentity});
    observations={
      sameArtifactReadback:seal,effectiveDecision:'HOLD_C09_C10_UI_READONLY',
      stage:financeUiStage(raw.stage),failureStage:financeUiStage(raw.failureStage),sessionAttempted:count(raw.sessionAttempted),
      activeSessionProgress:booleans(raw.activeSessionProgress,['auth','period','serverRows','dom','advancePair','movementExport','dashboard','finalRead']),
      failureUi:{...booleans(raw.failureUi,['available','firebaseUserPresent','contextAuthenticated','authorityApplied','expectedProjectSelected','expectedPeriodSelected','projectionLoaded','projectionKeyMatches','movExportPresent','finExportPresent','reportPreviewPresent','printTablePresent']),
        route:enumValue(raw.failureUi?.route,['login','inicio','dashboard','movimientos','financiero','OTHER_OR_UNAVAILABLE']),role:enumValue(raw.failureUi?.role,['super','admin','OTHER_OR_UNAVAILABLE']),...counts(raw.failureUi,['movementRowCount','reportRowCount'])},
      ...booleans(raw,['currentAdminClaimsVerified','browserServerReadVerified','committedMetadataReceiptVerified','firstAdvanceUnchanged','secondMetadataExact','sameCashPeriod','newSessionParity','financialDocumentsStable']),
      ...counts(raw,['independentAdminSessions','advanceCount','customTokenMints']),
      network:counts(raw.network,['automaticHrSuppressed','unexpectedDenied','allowedAuthRequests','routeControlFailures']),
      sessions:sessions.map(session=>({
        ...booleans(session,['newContextEmpty','exactCurrentAdminClaims','serverReadConfirmed','advancePairExact','firstAdvanceUnchanged','secondMetadataExact']),
        rowCount:count(session.rowCount),
        movementExport:{decision:enumValue(session.movementExport?.decision,['PASS_EXPORT_PARITY']),rows:count(session.movementExport?.rows),xlsx:booleans(session.movementExport?.xlsx,['parsed','contentMatches']),pdf:booleans(session.movementExport?.pdf,['parsed','contentMatches'])},
        dashboard:{decision:enumValue(session.dashboard?.decision,['PASS_EXPORT_PARITY','NOT_APPLICABLE_NO_ELIGIBLE_ROWS']),...booleans(session.dashboard,['realRows','emptyStateObserved','independentHrKpisCertified'])}
      })),
      safety:{...counts(raw,['authIdentityOrClaimsWrites','directFirestoreWrites','providerCommandsExecuted','financialMutationRequestsDispatched']),production:false}
    };
    if(raw.decision==='PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE'){
      need(identity.complete&&raw.independentAdminSessions===2&&sessions.length===2&&raw.advanceCount===2&&raw.newSessionParity===true&&raw.financialDocumentsStable===true&&raw.committedMetadataReceiptVerified===true&&raw.firstAdvanceUnchanged===true&&raw.secondMetadataExact===true&&raw.sameCashPeriod===true,'FINANCE_UI_PASS_SCOPE');
      need(raw.providerCommandsExecuted===0&&raw.financialMutationRequestsDispatched===0&&raw.directFirestoreWrites===0&&raw.authIdentityOrClaimsWrites===0&&raw.network?.unexpectedDenied===0&&raw.network?.routeControlFailures===0,'FINANCE_UI_NO_MUTATION');
      need(sessions.every(session=>session.newContextEmpty===true&&session.exactCurrentAdminClaims===true&&session.serverReadConfirmed===true&&session.advancePairExact===true&&session.movementExport?.decision==='PASS_EXPORT_PARITY'&&session.movementExport?.xlsx?.parsed===true&&session.movementExport?.xlsx?.contentMatches===true&&session.movementExport?.pdf?.parsed===true&&session.movementExport?.pdf?.contentMatches===true),'FINANCE_UI_SESSIONS');
      need(sessions.every(session=>session.dashboard?.independentHrKpisCertified===false&&(session.dashboard.decision==='NOT_APPLICABLE_NO_ELIGIBLE_ROWS'&&session.dashboard.emptyStateObserved===true&&session.dashboard.realRows===false||session.dashboard.decision==='PASS_EXPORT_PARITY'&&session.dashboard.realRows===true&&session.dashboard.xlsx?.parsed===true&&session.dashboard.xlsx?.contentMatches===true&&session.dashboard.pdf?.parsed===true&&session.dashboard.pdf?.contentMatches===true)),'FINANCE_UI_DASHBOARD');
      observations.effectiveDecision=seal.verified?'PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE':'HOLD_C09_C10_SAME_ARTIFACT_UNCONFIRMED';
      summaryDecision=seal.verified?'RECORDED_FINANCE_UI_SCOPED_PASS':'RECORDED_FINANCE_UI_INCOMPLETE';
      if(!seal.verified){
        const code=seal.jobSuccessful?'RELEASE_COMPOSITION_FAILURE:C09_C10_SAME_ARTIFACT_UNCONFIRMED':'ENVIRONMENT_FAILURE:C09_C10_PRODUCER_NOT_SUCCESSFUL';
        failureCodes.push(code);classification||=code.split(':')[0];
      }
    }
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
    state:'HOLD',decision:summaryDecision,
    producer:{schemaVersion:raw.schemaVersion,decision:raw.decision,jobName:spec.job,jobConclusion:t.jobConclusion},
    provenance:{runId:String(t.runId),runAttempt:String(t.runAttempt),jobId:String(t.jobId),controlHead:t.controlHead,
      artifactId:String(t.artifactId),artifactDigest:t.artifactDigest,entry:spec.entry,resultSha256:rawHash},
    identity,classification,failureCodes,unclassifiedFailureCount,observations,
    ownerSpecificReceipts:[],fullDomain:false,newDomainMatches:0,phaseAComplete:false,
    productActionsPerformedByConsumer:0,production:false,privateValuesStored:false
  };
}
