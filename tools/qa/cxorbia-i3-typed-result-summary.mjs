// Pure summaries of exact producer results; no provider calls or domain promotion.
// Consumer verifies the archive, exact producer attempt/job/window, and pins first.
import crypto from 'node:crypto';
import {readGoogleFinanceResult,readGoogleF3Result} from './cxorbia-i3-google-qa-execution.mjs';
import {publicA08ProvenanceDiagnostic,A08_PROVENANCE_TARGETS,A08_GT_CURRENT_PROVIDER_MODE,validA08GtPasswordScope,publicA08GtPasswordProof} from './cxorbia-i3-a08-exact-password-proof.mjs';
import {publicA08ClauseRefs} from './cxorbia-i3-scoped-clause-projection.mjs';

const boundedMode='BOUNDED_GT_ESCENARIO_L2';
const boundedDecision='PASS_F3_BOUNDED_GT_L2_ENDPOINT_REMOTE_AUDIT_PENDING';
const boundedCases=['explicit_reconcile_initial','client_response_body_loss_same_key_replay_journal_unchanged',
  'GT_escenario_write','same_key_changed_payload_rejected','stale_base_rejected',
  'GT_escenario_restore','old_committed_receipt_replay_does_not_rollback','explicit_reconcile_restored'];
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
    decisions:['PENDING','HOLD_F3_ISOLATED_ENDPOINT','HOLD_F3_QA_CLEANUP_UNVERIFIED','PASS_F3_ISOLATED_ENDPOINT_CHAIN_REMOTE_CLEANUP_PENDING',boundedDecision]
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
  const bindingExact=present&&seal.entry==='identity-live-readback.json'&&(transport.provider==='GOOGLE_CLOUD_SHELL'
    ?seal.resultUri===transport.resultUri&&seal.bundleSha256===transport.bundleSha256
    :String(seal.artifactId)===String(transport.artifactId)&&seal.artifactDigest===transport.artifactDigest);
  const bounded=typeof seal?.text==='string'&&Buffer.byteLength(seal.text)<=65536;
  let parsed=null;if(bounded){try{parsed=JSON.parse(seal.text);}catch{}}
  const parseable=!!parsed&&typeof parsed==='object'&&!Array.isArray(parsed);
  const fieldsExact=parseable&&['sourceSha','runtimeRevision','hostingVersion'].every(key=>typeof expected[key]==='string'&&expected[key]&&parsed[key]===expected[key]);
  const noDeployment=parseable&&parsed.production===false&&parsed.deploys===0;
  const readbackExact=parseable&&parsed.decision==='PASS_CURRENT_FINANCE_DEV_IDENTITY_READBACK'&&parsed.runtimeTrafficExact===true&&parsed.hostingBeforeAfterSame===true;
  return {entry:'identity-live-readback.json',present,bindingExact,parseable,jobSuccessful,fieldsExact:!!fieldsExact,noDeployment:!!noDeployment,readbackExact:!!readbackExact,
    sha256:bounded?hash(seal.text):null,verified:!!(jobSuccessful&&bindingExact&&fieldsExact&&noDeployment&&readbackExact),
    ...(safeTypedFailureCode(parsed?.error)?{failureCode:safeTypedFailureCode(parsed.error)}:{}),
    ...(Number.isInteger(parsed?.readbackExitCode)&&parsed.readbackExitCode>=0&&parsed.readbackExitCode<=255?{readbackExitCode:parsed.readbackExitCode}:{})};
}
function financeUiStage(value){
  return typeof value==='string'&&/^(?:PREFLIGHT|DEPENDENCIES|ADC_BASELINE|METADATA_RECEIPT|ADMIN_AUTHORITY|SESSION_[12]_(?:AUTH|PERIOD|MOVEMENTS|MOVEMENT_EXPORT|DASHBOARD|FINAL_READ)|FINAL_LEDGER|COMPLETE)$/.test(value)?value:null;
}
const diagnosticHash=value=>typeof value==='string'&&HASH.test(value)?value:null;
// Exact outputs of the producer's financeHrOwnerCode. Never copy ownerError,
// suffixes, identities, request URLs or arbitrary diagnostic properties.
function financeUiHrOwnerDiagnostic(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const codes=['HR_LIVE_DUPLICATE_OR_MISSING_VISIT_KEYS','HR_LIVE_DUPLICATE_PERIOD_KEYS','HR_LIVE_NETWORK_FAILURE','HR_LIVE_NONEMPTY_REQUIRED','HR_LIVE_REVISION_CHANGED_DURING_COMPOSITION','HR_LIVE_REVISION_PUBLICATION_MISMATCH','HR_LIVE_REVISION_READBACK_MISSING','HR_LIVE_REVISION_REQUIRED','HR_LIVE_SCOPE_MISMATCH','HR_LIVE_SOURCE_SAFE_REQUIRED','HR_LIVE_UNAVAILABLE','PROJECT_SCOPE_REQUIRED','CANONICAL_COMPOSER_V2_MISSING','CANONICAL_PERIOD_LOSS','CERTIFICATION_EVIDENCE_PROJECTOR_MISSING','BACKEND_REFRESH_ATOMIC_COMPOSITION_REQUIRED','BACKEND_REFRESH_READBACK_REVISION_MISMATCH','AUTH_FAILURE:PROTECTED_HR_PRINCIPAL_REQUIRED','AUTH_FAILURE:SESSION_GENERATION_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SESSION_NO_LONGER_AUTHORIZED','AUTH_FAILURE:PROTECTED_STATE_PRINCIPAL_CHANGED_DURING_COMPOSITION','AUTH_FAILURE:SHOPPER_PRINCIPAL_CLAIMS_MEMBERSHIP_MISMATCH','CANONICAL_DYNAMIC_COMPOSITION_INVARIANT','HR_LIVE_VISIT_PERIOD_MISSING','AUTH_FAILURE:SHOPPER_EXACT_HR_PROFILE_COUNTRY_PERIOD_REQUIRED','OTHER','NO_OWNER_ERROR'];
  const code=typeof value.ownerCode==='string'&&
    (codes.includes(value.ownerCode)||/^HR_LIVE_(REVISION_READBACK_)?HTTP_[1-5][0-9]{2}$/.test(value.ownerCode))?value.ownerCode:null;
  return {...booleans(value,['available','authorityPresent','applied','retryable','sourceReady','sourceBlocked','runtimeReady']),
    ...(value.bootstrap?{bootstrap:financeBootstrapDiagnostic(value.bootstrap)}:{}),
    ownerCode:code,ownerErrorSha256:diagnosticHash(value.ownerErrorSha256),
    authenticatedHrHttp:Array.isArray(value.authenticatedHrHttp)?value.authenticatedHrHttp.slice(-8).map(x=>
      Number.isInteger(x)&&(x===0||x>=100&&x<=599)?x:null):null};
}
function financeBootstrapDiagnostic(value){
  const codes=['NONE','PERMISSION_DENIED','UNAUTHENTICATED','UNAVAILABLE','FAILED_PRECONDITION','TIMEOUT','AUTH_SESSION_CHANGED','OTHER'];
  const readCodes=[...codes,'CACHE_ONLY','SERVER_OK'];
  return {...booleans(value,['lastStatePresent','sourceFirestore','authorizedStatePresent','actorMatches',
    'bootAuthorized','bootBackendReady','bootDependenciesReady','bootExhausted']),
    stateErrorCode:codes.includes(value.stateErrorCode)?value.stateErrorCode:null,
    ...(/^(?:[1-5][0-9]{2}|NETWORK_OR_TIMEOUT)$/.test(String(value.restProjectQuery||''))?{restProjectQuery:value.restProjectQuery}:{}),
    serverReads:Object.fromEntries(['projects','shoppers','periods','visits'].filter(key=>
      readCodes.includes(value.serverReads?.[key])).map(key=>[key,value.serverReads[key]]))};
}
// Retain failure evidence for the next iteration without copying PDF text,
// financial values, URLs, ciphertext, or arbitrary artifact paths. These are
// diagnostics, never owner receipts or a replacement for the complete proof.
function financeUiPrivatePdfReference(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.encrypted!==true||
    value.algorithm!=='RSA-OAEP-SHA256+AES-256-GCM'||
    typeof value.entry!=='string'||!/^private-session-[01]-(?:movements|dashboard)-pdf\.envelope\.json$/.test(value.entry)||
    !diagnosticHash(value.sha256)||!diagnosticHash(value.plainSha256))return null;
  return {entry:value.entry,sha256:value.sha256,plainSha256:value.plainSha256,encrypted:true,
    algorithm:'RSA-OAEP-SHA256+AES-256-GCM',referenceOnly:true};
}
function financeUiPdfDiagnostic(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const cells=Array.isArray(value.missingCells)?value.missingCells:[];
  return {...booleans(value,['matches','parsed','titleMatches','periodMatches','titleMatchesIgnoringWhitespace','periodMatchesIgnoringWhitespace']),
    ...counts(value,['bytes','pages','textCharacters','missingCellCount']),sha256:diagnosticHash(value.sha256),textSha256:diagnosticHash(value.textSha256),
    missingCells:cells.slice(0,64).map(cell=>({...counts(cell,['row','column','expectedCharacters']),
      expectedSha256:diagnosticHash(cell?.expectedSha256),matchesIgnoringWhitespace:bool(cell?.matchesIgnoringWhitespace)})),
    missingCellsTruncated:cells.length>64?true:bool(value.missingCellsTruncated),
    privateEvidence:financeUiPrivatePdfReference(value.privateEvidence),privateEvidenceError:safeTypedFailureCode(value.privateEvidenceError)};
}
function financeUiPartialExport(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return null;
  const bytes=part=>({...counts(part,['bytes','pages']),sha256:diagnosticHash(part?.sha256),...booleans(part,['parsed','contentMatches'])});
  return {decision:enumValue(value.decision,['PARTIAL_EXPORT_PROOF_PDF_PENDING']),rows:count(value.rows),semanticRowsSha256:diagnosticHash(value.semanticRowsSha256),
    preview:{sha256:diagnosticHash(value.preview?.sha256),contentMatches:bool(value.preview?.contentMatches)},xlsx:bytes(value.xlsx),
    nativePrintDom:{sha256:diagnosticHash(value.nativePrintDom?.sha256),contentMatches:bool(value.nativePrintDom?.contentMatches)},pdf:bytes(value.pdf)};
}

// F3 scope facts only: never retain raw journal, fixture values, identities,
// network payloads or URLs. External replay counts require a separate readback.
const f3Time=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)&&Number.isFinite(Date.parse(value))?value:null;
const f3Hash=(value,pattern=HASH)=>typeof value==='string'&&pattern.test(value)?value:null;
function f3ClientResponseLoss(value,transport){
  if(value===undefined)return null;
  const key=`f3-qa-${transport.runId}-${transport.runAttempt}-field-1`,wire=value?.transport||{},audit=value?.remoteAudit||{};
  const out={decision:enumValue(value?.decision,['REMOTE_COMMIT_OBSERVED_BEFORE_EXACT_REPLAY','PASS_CLIENT_RESPONSE_LOSS_JOURNAL_REPLAY_REMOTE_WRITE_AUDIT_PENDING']),
    eventId:f3Hash(value?.eventId,/^hfe-[a-f0-9]{64}$/),eventDigest:f3Hash(value?.eventDigest),providerExecutionId:f3Hash(value?.providerExecutionId,/^[a-f0-9]{32}$/),
    proofDigest:f3Hash(value?.proofDigest),...counts(value,['declaredOriginalRemoteWriteRequests','newJournalAttempts','newLocalCommandWrites']),
    remoteReplayWrites:null,remoteReplayWriteCountProven:false,remoteExecutionAuditRequired:true,
    independentSourceRevisionBeforeReplay:f3Hash(value?.independentSourceRevisionBeforeReplay),independentReadbackAt:f3Time(value?.independentReadbackAt),
    independentSourceRevisionAfterReplay:f3Hash(value?.independentSourceRevisionAfterReplay),replayStartedAt:f3Time(value?.replayStartedAt),replayFinishedAt:f3Time(value?.replayFinishedAt),
    transport:{faultBoundary:enumValue(wire.faultBoundary,['APPLICATION_HTTP_RESPONSE_BODY_TO_QA_CLIENT']),
      ...booleans(wire,['requestBodyFinished','responseHeadersObserved','semanticAckObserved','clientConnectionDestroyed']),bodyBytesConsumed:count(wire.bodyBytesConsumed),
      httpStatus:Number.isInteger(wire.httpStatus)&&wire.httpStatus>=100&&wire.httpStatus<=599?wire.httpStatus:null,
      commandDigest:f3Hash(wire.commandDigest),idempotencyKey:wire.idempotencyKey===key?key:null,startedAt:f3Time(wire.startedAt),cutAt:f3Time(wire.cutAt)},
    remoteAudit:{scenarioId:audit.scenarioId===10199316?10199316:null,eventId:f3Hash(audit.eventId,/^hfe-[a-f0-9]{64}$/),eventDigest:f3Hash(audit.eventDigest),
      initialProviderExecutionId:f3Hash(audit.initialProviderExecutionId,/^[a-f0-9]{32}$/),idempotencyKey:audit.idempotencyKey===key?key:null,
      requestStartedAt:f3Time(audit.requestStartedAt),replayStartedAt:f3Time(audit.replayStartedAt),replayFinishedAt:f3Time(audit.replayFinishedAt),
      requiredObservedThroughUtc:f3Time(audit.requiredObservedThroughUtc),readOnly:true,newScenarioRunRequired:false,writeCountStatus:'UNPROVEN_UNTIL_INDEPENDENT_EXECUTION_READBACK'}};
  if(out.decision==='PASS_CLIENT_RESPONSE_LOSS_JOURNAL_REPLAY_REMOTE_WRITE_AUDIT_PENDING'){
    const w=out.transport,a=out.remoteAudit,ordered=[a.requestStartedAt,w.startedAt,w.cutAt,out.independentReadbackAt,out.replayStartedAt,out.replayFinishedAt];
    need(out.eventId&&out.eventDigest&&out.providerExecutionId&&out.proofDigest&&out.declaredOriginalRemoteWriteRequests===1&&
      out.newJournalAttempts===0&&out.newLocalCommandWrites===0&&value.remoteReplayWrites===null&&value.remoteReplayWriteCountProven===false&&value.remoteExecutionAuditRequired===true&&
      out.independentSourceRevisionBeforeReplay&&out.independentSourceRevisionBeforeReplay===out.independentSourceRevisionAfterReplay&&
      w.faultBoundary&&w.requestBodyFinished===true&&w.responseHeadersObserved===true&&w.semanticAckObserved===false&&w.clientConnectionDestroyed===true&&
      w.bodyBytesConsumed===0&&w.httpStatus===200&&w.commandDigest&&w.idempotencyKey&&
      a.scenarioId===10199316&&a.eventId===out.eventId&&a.eventDigest===out.eventDigest&&a.initialProviderExecutionId===out.providerExecutionId&&a.idempotencyKey===key&&
      a.replayStartedAt===out.replayStartedAt&&a.replayFinishedAt===out.replayFinishedAt&&ordered.every(Boolean)&&ordered.every((v,i)=>i===0||Date.parse(v)>=Date.parse(ordered[i-1]))&&
      a.requiredObservedThroughUtc&&Date.parse(a.requiredObservedThroughUtc)===Date.parse(out.replayFinishedAt)+90000,'F3_CLIENT_RESPONSE_LOSS_SCOPE');
  }
  return out;
}
function f3BoundedTarget(raw,fixture,executionScope){
  const scope=raw.boundedScope,gt=fixture?.countries?.GT;
  need(executionScope?.mode===boundedMode&&executionScope.executionBudgetCredits===250&&executionScope.restorationReserveCredits===100&&executionScope.allocationCredits===350&&raw.executionMode===boundedMode&&gt&&scope&&
    fixture.tenantId==='tya'&&fixture.projectId==='f3-qa-20261124'&&fixture.periodId==='f3-qa-20261124-2026-11'&&
    scope.countryCode==='GT'&&scope.fieldKey==='escenario'&&scope.cell==='L2'&&scope.expectedPhysicalPatches===2&&
    ['visitId','worksheetName','worksheetFingerprint','hrRowId'].every(k=>scope[k]===gt[k]&&gt[k])&&
    scope.worksheetName==='CXR_B14_QA_GT_20261119'&&scope.hrRowId===scope.worksheetName+'!2'&&gt.headerValues?.[11]==='Tipo de Compra'&&
    !raw.shopperRoleProof,'F3_BOUNDED_CELL');
  return {tenantId:fixture.tenantId,projectId:fixture.projectId,periodId:fixture.periodId,countryCode:'GT',
    fieldKey:'escenario',cell:'L2',visitId:gt.visitId,hrRowId:gt.hrRowId,worksheetName:gt.worksheetName,worksheetFingerprint:gt.worksheetFingerprint};
}
export function validateF3BoundedSuccess(raw,transport,fixture,executionScope){
  const target=f3BoundedTarget(raw,fixture,executionScope),owner='f3-qa-'+transport.runId+'-'+transport.runAttempt;
  need(raw.decision===boundedDecision&&raw.state==='HOLD'&&raw.qaOwner===owner&&raw.syntheticOnly===true&&
    raw.productionWrites===0&&raw.operationalHrWrites===0&&raw.b14Closed===false&&raw.newModuleMatches===0&&
    raw.authentication==='FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY'&&raw.ordinaryPasswordAuthenticationProven===false&&
    raw.applicationAckProven===true&&raw.remoteValuesRestored===true&&raw.cleanup?.firestore===true&&raw.cleanup.auth===true&&
    raw.cleanup.remoteMake===false&&!raw.recoveryRequired&&!(raw.cleanupErrors||[]).length,'F3_BOUNDED_SAFETY');
  const stages=raw.cases?.map(c=>c.name)||[];
  need(stages.length===boundedCases.length&&boundedCases.every(name=>stages.filter(x=>x===name).length===1),'F3_BOUNDED_CASES');
  const scopeKeys=['countryCode','fieldKey','visitId','hrRowId','tenantId','projectId','periodId'];
  const values=['CXOrbia QA Escenario A','CXOrbia QA Escenario B','CXOrbia QA Escenario A'];
  const rows=raw.events,caseFor=name=>raw.cases.find(c=>c.name===name);
  need(Array.isArray(rows)&&rows.length===2,'F3_BOUNDED_EVENTS');
  const events=rows.map((r,i)=>{
    const event=r.event||{},delivery=r.delivery||{},c=caseFor(i?'GT_escenario_restore':'GT_escenario_write');
    const headKey=hash(JSON.stringify([target.tenantId,target.projectId,target.periodId,target.countryCode,target.visitId,target.fieldKey]));
    const key=owner+'-field-'+(i+1),eventId='hfe-'+hash(JSON.stringify([headKey,key]));
    need(r.eventId===eventId&&event.eventId===eventId&&r.remoteEventKey==='event:'+eventId&&r.remoteHeadKey===headKey&&
      event.idempotencyKey===key&&scopeKeys.every(k=>event[k]===target[k])&&event.actorUid===owner+'-admin'&&event.origin==='platform'&&
      event.before===values[i]&&event.after===values[i+1]&&r.countryCode===target.countryCode&&r.fieldKey===target.fieldKey&&
      f3Hash(r.eventDigest)&&event.eventDigest===r.eventDigest&&delivery.eventId===eventId&&delivery.eventDigest===r.eventDigest&&
      delivery.status==='committed'&&delivery.providerAck===true&&delivery.writeAckVerified===true&&delivery.readbackVerified===true&&
      f3Hash(r.providerExecutionId,/^[a-f0-9]{32}$/)&&delivery.providerExecutionId===r.providerExecutionId&&
      f3Hash(r.sourceRevisionBefore)&&f3Hash(r.sourceRevisionAfter)&&
      c.eventId===eventId&&c.ackVerified===true&&c.independentSourceReadback===true&&c.nonRecoveryAttempts===1,'F3_BOUNDED_EVENT_PROOF');
    return {action:i?'RESTORE':'CHANGE',eventId,eventDigest:r.eventDigest,providerExecutionId:r.providerExecutionId,
      sourceRevisionBefore:r.sourceRevisionBefore,sourceRevisionAfter:r.sourceRevisionAfter,applicationAck:true,independentReadback:true};
  });
  need(events[0].providerExecutionId!==events[1].providerExecutionId&&events[0].eventDigest!==events[1].eventDigest,'F3_BOUNDED_DISTINCT_WRITES');
  const loss=f3ClientResponseLoss(raw.clientResponseLoss,transport),rest=raw.remoteRestoreReadback,original=raw.remoteBaseline;
  need(loss?.decision==='PASS_CLIENT_RESPONSE_LOSS_JOURNAL_REPLAY_REMOTE_WRITE_AUDIT_PENDING'&&
    loss.eventId===events[0].eventId&&loss.eventDigest===events[0].eventDigest&&loss.providerExecutionId===events[0].providerExecutionId&&
    loss.independentSourceRevisionBeforeReplay===events[0].sourceRevisionAfter,'F3_BOUNDED_REPLAY');
  need(original?.rows?.length===2&&original.rows.some(r=>r.countryCode==='GT'&&r.visitId===target.visitId&&r.hrRowId===target.hrRowId&&
    r.periodId===target.periodId&&r.worksheetFingerprint===target.worksheetFingerprint&&r.values?.escenario===values[0])&&
    f3Hash(original.revision)&&rest?.decision==='PASS_F3_EXACT_REMOTE_BASELINE_READBACK'&&f3Hash(rest.sourceRevision)&&
    rest.visits===2&&rest.fields===8&&f3Time(rest.readAt),'F3_BOUNDED_RESTORATION');
  const calls=raw.remoteCommandAttempts||[],originalKey=owner+'-field-1';
  const sameKeyConflict=calls.some(a=>a.command?.idempotencyKey===originalKey&&a.command.payload?.patch?.escenario!==values[1]&&
    a.response?.ok===false&&a.response.code==='OPS_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');
  const stale=calls.some(a=>a.command?.idempotencyKey===owner+'-stale-base'&&a.response?.ok===false&&
    ['OPS_HR_FIELD_BASE_CONFLICT','OPS_HR_FIELD_SOURCE_REVISION_CONFLICT'].includes(a.response.code));
  const last=calls.at(-1);
  need(sameKeyConflict&&stale&&last?.command?.idempotencyKey===originalKey&&last.response?.idempotentReplay===true&&
    last.response.hrFieldEventIds?.length===1&&last.response.hrFieldEventIds[0]===events[0].eventId&&
    caseFor('old_committed_receipt_replay_does_not_rollback').currentEventId===events[1].eventId,'F3_BOUNDED_NEGATIVE_REPLAY');
  const pre=raw.makePreflight;
  need(pre?.controlSha===transport.controlSha&&pre.organizationId===4090072&&pre.scenarioId===10199316&&pre.dataStoreId===213856&&
    pre.writerExecutionInProgress===false&&pre.keys?.length===1&&pre.keys[0]==='757bfe4bd75b'&&pre.availableCredits>=350&&
    f3Time(pre.checkedAt)&&f3Hash(pre.sha256)&&raw.preCleanupSeal?.uri&&f3Hash(raw.preCleanupSeal.sha256),'F3_BOUNDED_PRECONDITIONS');
  return {target,events,baselineRevision:original.revision,restoredRevision:rest.sourceRevision,restoredFieldValueCount:rest.fields,
    observedCases:boundedCases,expectedLegitimatePatches:2,observedPhysicalPatches:null,replayPhysicalPatches:null,creditConsumption:null,
    completeIndependentMakeWindowRequired:true,remoteMakeCleanupPending:true,capacityReadAt:pre.checkedAt,creditsBefore:pre.availableCredits,
    preCleanupSeal:{uri:raw.preCleanupSeal.uri,sha256:raw.preCleanupSeal.sha256},
    unproven:['HN','other_fields','shopper_UI_and_availability','provider_response_loss','concurrent_external_edit','external_origin_echo',
      'historical_period','private_notes','ordinary_credentials_and_missing_shopper_upsert']};
}

function f3ShopperRole(value){
  if(value===undefined)return null;
  need(value?.schemaVersion==='cxorbia.f3.scoped-shopper-role-qa.v1','F3_SHOPPER_ROLE_SCHEMA');
  const limitations=['automatic_missing_shopper_upsert','ordinary_password_login','Admin_UI_assignment_button','postulation_lifecycle','positive_eligible_to_unavailable_transition_not_proven_for_both_countries'];
  const phases=(Array.isArray(value.phases)?value.phases:[]).slice(0,4).map(p=>({phase:enumValue(p.phase,['before','assigned']),sourceRevision:f3Hash(p.sourceRevision),
    countries:(Array.isArray(p.countries)?p.countries:[]).slice(0,4).map(c=>({country:enumValue(c.country,['GT','HN']),sourceRevision:f3Hash(c.sourceRevision),
      ...counts(c,['available','own','foreignVisitCount','duplicateVisitCount']),...booleans(c,['exactAvailableKeyset','exactOwnKeyset','passed','reloadVerified']),failureCode:safeTypedFailureCode(c.failure)}))}));
  const out={decision:enumValue(value.decision,['PENDING','HOLD_F3_QA_SHOPPER_ROLE','PASS_F3_QA_SHOPPER_ROLE_SCOPED']),
    authentication:enumValue(value.authentication,['FIREBASE_CUSTOM_TOKEN_QA_ONLY','FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY']),...booleans(value,['sameFixture','prepared','automaticUpsertProven','ordinaryPasswordProven','availabilityRemovalProven']),
    actorCount:length(value.actors),blockedOperationalRequests:count(value.blockedOperationalRequests),failureCount:length(value.failures),
    failureCodes:[...new Set((Array.isArray(value.failures)?value.failures:[]).map(safeTypedFailureCode).filter(Boolean))],phases,
    positiveAvailabilityTransitions:(Array.isArray(value.positiveAvailabilityTransitions)?value.positiveAvailabilityTransitions:[]).filter(c=>['GT','HN'].includes(c)),
    limitations:limitations.filter(x=>value.limitations?.includes(x)),cleanup:{...booleans(value.cleanup,['complete','preservedForRecovery']),
      authDeletedCount:length(value.cleanup?.authDeleted),authAbsentCount:length(value.cleanup?.authAbsent)}};
  if(out.decision==='PASS_F3_QA_SHOPPER_ROLE_SCOPED'){
    need(out.sameFixture===true&&out.prepared===true&&out.automaticUpsertProven===false&&out.ordinaryPasswordProven===false&&['FIREBASE_CUSTOM_TOKEN_QA_ONLY','FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY'].includes(out.authentication)&&
      out.actorCount===2&&out.blockedOperationalRequests===0&&out.failureCount===0&&phases.length===2&&
      ['before','assigned'].every(name=>phases.filter(p=>p.phase===name).length===1)&&phases.every(p=>p.sourceRevision&&p.countries.length===2&&
        ['GT','HN'].every(country=>p.countries.filter(c=>c.country===country).length===1)&&p.countries.every(c=>c.passed===true&&c.sourceRevision===p.sourceRevision&&
          c.exactAvailableKeyset===true&&c.exactOwnKeyset===true&&c.foreignVisitCount===0&&c.duplicateVisitCount===0&&
          (p.phase!=='assigned'||c.reloadVerified===true&&c.available===0&&c.own===1)))&&limitations.slice(0,4).every(x=>out.limitations.includes(x)),'F3_SHOPPER_ROLE_PASS_SCOPE');
    if(out.availabilityRemovalProven===true)need(out.positiveAvailabilityTransitions.length===2&&['GT','HN'].every(c=>out.positiveAvailabilityTransitions.includes(c))&&
      phases.find(p=>p.phase==='before').countries.every(c=>c.available>0),'F3_SHOPPER_ROLE_AVAILABILITY');
  }
  return out;
}

export function summarizeGoogleFinanceResult({uri,expectedIdentity},read){
  for(const key of ['runtimeRevision','runtimeDigest','hostingVersion'])need(typeof expectedIdentity?.[key]==='string'&&expectedIdentity[key].length>0,'GOOGLE_LIVE_PIN_'+key);
  const bundle=readGoogleFinanceResult(uri,expectedIdentity,read);
  return summarizeVerifiedResult({...bundle,expectedIdentity},true);
}
export function summarizeGoogleF3Result({uri,expectedIdentity},read,readArchive){
  for(const key of ['runtimeRevision','runtimeDigest','hostingVersion'])need(typeof expectedIdentity?.[key]==='string'&&expectedIdentity[key].length>0,'GOOGLE_LIVE_PIN_'+key);
  const bundle=readGoogleF3Result(uri,expectedIdentity,read,readArchive);
  return summarizeVerifiedResult({...bundle,expectedIdentity},true);
}
export function summarizeTypedResult(input){
  return summarizeVerifiedResult(input,false);
}
function summarizeVerifiedResult({resultText,transport,expectedIdentity={},identityReadback},google){
  need(typeof resultText==='string'&&Buffer.byteLength(resultText)<=2*1024*1024,'RESULT_SIZE');
  let raw;try{raw=JSON.parse(resultText);}catch{throw Error('MAPPING_FAILURE:TYPED_SUMMARY_INVALID_JSON');}
  const spec=TYPED_SUMMARY_SCHEMAS[raw?.schemaVersion];need(spec,'UNKNOWN_SCHEMA');
  need(spec.decisions.includes(raw.decision),'UNKNOWN_PRODUCER_DECISION');
  const t=transport||{};
  if(!google){
    need(!raw.externalExecution&&t.provider!=='GOOGLE_CLOUD_SHELL','GOOGLE_RESULT_REQUIRES_PROVIDER_VERIFICATION');
    for(const key of ['runId','runAttempt','jobId','artifactId'])need(/^[1-9][0-9]*$/.test(String(t[key]||'')),'TRANSPORT_'+key);
    need(t.jobName===spec.job&&['success','failure','cancelled','timed_out','action_required','neutral','stale'].includes(t.jobConclusion),'PRODUCER_JOB');
    need(SHA.test(String(t.controlHead||''))&&/^sha256:[a-f0-9]{64}$/.test(String(t.artifactDigest||''))&&t.verifiedArchiveDigest===t.artifactDigest,'TRANSPORT_DIGEST');
  }
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
      authentication:enumValue(raw.authentication,['FIREBASE_CUSTOM_TOKEN_QA_ONLY','FIREBASE_PASSWORD_SYNTHETIC_QA_ONLY']),
      ...booleans(raw,['applicationAckProven','remoteValuesRestored','recoveryRequired','notesPrivacyProven','ordinaryPasswordAuthenticationProven']),
      caseCount:length(raw.cases),eventCount:length(raw.events),remoteCommandAttemptCount:length(raw.remoteCommandAttempts),
      cleanup:{...booleans(raw.cleanup,['firestore','auth','remoteMake','authPreservedForRecovery']),errorCount:length(raw.cleanupErrors)},
      safety:counts(raw,['productionWrites','operationalHrWrites']),
      guarantees:booleans(raw.guarantees,['atomicHumanExcelCas','observedBaseGuard','remoteReceiptAndIndependentRead','uncertainWriteRetry']),
      remoteCleanupRequired:bool(raw.remoteCleanup?.required),
      clientResponseLoss:f3ClientResponseLoss(raw.clientResponseLoss,t),shopperRoleProof:f3ShopperRole(raw.shopperRoleProof),
      unproven:['application_client_response_loss_live_fault_injection','application_client_response_loss_remote_write_count','provider_response_loss_live_fault_injection','external_human_concurrent_edit_atomicity','historical_period_live_fixture','T&A_private_notes_live_fixture'].filter(x=>raw.unproven?.includes(x))
    };
    if(expectedIdentity.f3ExecutionScope||raw.executionMode===boundedMode||raw.decision===boundedDecision){
      need(google&&expectedIdentity.f3ExecutionScope?.mode===boundedMode&&raw.executionMode===boundedMode&&
        raw.decision!=='PASS_F3_ISOLATED_ENDPOINT_CHAIN_REMOTE_CLEANUP_PENDING'&&!raw.shopperRoleProof,'F3_BOUNDED_MODE_MISMATCH');
      const target=f3BoundedTarget(raw,expectedIdentity.f3Fixture,expectedIdentity.f3ExecutionScope);
      if(raw.decision===boundedDecision){
        need(t.jobConclusion==='success'&&t.evidenceEntries?.length===1&&t.evidenceEntries[0]==='receipt.json','F3_BOUNDED_NATIVE_OUTCOME');
        observations.boundedCell=validateF3BoundedSuccess(raw,t,expectedIdentity.f3Fixture,expectedIdentity.f3ExecutionScope);
      }else{
        observations.boundedCell={target,expectedLegitimatePatches:2,observedPhysicalPatches:null,creditConsumption:null,
          observedCaseNames:(raw.cases||[]).map(c=>c.name).filter(n=>boundedCases.includes(n)),completeIndependentMakeWindowRequired:true};
        observations.applicationAckProven=false;
      }
    }
  }else if(spec.kind==='A08_RESIDUAL'){
    need(raw.gate==='HOLD'&&raw.fullA08Certified===false&&raw.newDomainMatches===0,'A08_CREDIT_BOUNDARY');
    need(raw.safety?.production===false,'A08_DEV_SCOPE');
    const passwords=Array.isArray(raw.passwordProofs)?raw.passwordProofs:[],apis=Array.isArray(raw.apiProofs)?raw.apiProofs:[];
    const provenanceOnly=raw.scope?.executionMode==='PROVENANCE_ONLY';
    const gtOnly=raw.scope?.executionMode===A08_GT_CURRENT_PROVIDER_MODE;
    let gtPasswordVerified=false;
    const diagnostics=provenanceOnly?(Array.isArray(raw.provenanceDiagnostics)?raw.provenanceDiagnostics:[]).map(publicA08ProvenanceDiagnostic):[];
    if(provenanceOnly){
      need(passwords.length===0&&apis.length===0&&['loginAttempts','browserLaunches','customTokensUsed','providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys'].every(k=>raw.safety[k]===0),'A08_PROVENANCE_ZERO_ACTIONS');
      need(diagnostics.length<=2&&diagnostics.every(x=>x.caseId&&x.diagnosticOnly&&x.loginAttempts===0&&x.browserLaunches===0&&x.customTokensUsed===0&&x.historicalSameUidProof.recipeUsedForLogin===false)&&new Set(diagnostics.map(x=>x.caseId)).size===diagnostics.length,'A08_PROVENANCE_DIAGNOSTIC_SCOPE');
      if(raw.diagnosticComplete===true)need(diagnostics.length===2&&Object.keys(A08_PROVENANCE_TARGETS).every(id=>diagnostics.some(x=>x.caseId===id&&x.diagnosticComplete&&x.primaryReason))&&raw.sameArtifactAfter===true&&raw.finalChecks?.diagnosticComplete===true&&raw.finalChecks.requestedScopePass===false&&raw.finalChecks.pass===false&&raw.storageDiscovery?.executed===false,'A08_PROVENANCE_COMPLETENESS');
    }
    if(gtOnly){
      need(raw.scope.exceptionShopperIds?.length===1&&raw.scope.exceptionShopperIds[0]===A08_PROVENANCE_TARGETS.GT_EXCEPTION&&raw.scope.apiOperation===null&&raw.scope.storageOperation===null&&passwords.length<=1&&passwords.every(x=>x.shopperId===A08_PROVENANCE_TARGETS.GT_EXCEPTION)&&apis.length===0&&raw.storageDiscovery?.executed!==true&&raw.storageProof?.pass!==true,'A08_GT_PASSWORD_SCOPE');
      need(['customTokensUsed','hnLoginAttempts','legacyLoginAttempts','providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys'].every(k=>raw.safety[k]===0),'A08_GT_PASSWORD_UNEXPECTED_ACTION');
      if(raw.scopeDecision==='PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER'){
        need(identity.complete&&raw.decision==='HOLD_I3_A08_RESIDUAL_READONLY'&&raw.sameArtifactAfter===true&&raw.finalChecks?.seal===true&&raw.finalChecks.gtPassword===true&&raw.finalChecks.requestedScopePass===true&&raw.finalChecks.pass===false&&validA08GtPasswordScope(raw)&&failureCodes.length===0&&unclassifiedFailureCount===0,'A08_GT_PASSWORD_READBACK');
        gtPasswordVerified=t.jobConclusion==='success';
      }
      summaryDecision=gtPasswordVerified?'RECORDED_A08_GT_PASSWORD_CURRENT_PROVIDER':'RECORDED_A08_GT_PASSWORD_CURRENT_PROVIDER_INCOMPLETE';
    }
    observations={
      executionMode:enumValue(raw.scope?.executionMode,['PASSWORD_ONLY','PASSWORD_API_ONLY','PASSWORD_API_STORAGE','PROVENANCE_ONLY',A08_GT_CURRENT_PROVIDER_MODE]),
      scopeDecision:enumValue(raw.scopeDecision,['PASS_I3_A08_PASSWORD3_SCOPED_READONLY','PASS_I3_A08_PASSWORD3_API_SCOPED_READONLY','PASS_I3_A08_SCOPED_PASSWORD3_API_STORAGE_READONLY','PASS_I3_A08_GT_PASSWORD_CURRENT_PROVIDER','HOLD_I3_A08_REQUESTED_SCOPE_UNPROVEN']),
      passwordProofCount:length(raw.passwordProofs),passwordPassCount:gtOnly?(gtPasswordVerified?1:0):passwords.filter(x=>x?.pass===true).length,
      apiProofCount:length(raw.apiProofs),apiDenialPassCount:apis.filter(x=>x?.pass===true).length,
      apiStatusCounts:Object.fromEntries([200,401,403].map(status=>[status,apis.filter(x=>x?.httpStatus===status).length])),
      finalChecks:{...booleans(raw.finalChecks,['seal','passwords','apis','storage','requestedScopePass','pass']),...counts(raw.finalChecks,['expectedAssetCount','servedAssetCount'])},
      sameArtifactAfter:bool(raw.sameArtifactAfter),storageProof:booleans(raw.storageProof,['pass','objectStable']),
      storageDiscoveryExecuted:bool(raw.storageDiscovery?.executed),preservedEvidenceCount:length(raw.preservedEvidence),
      acceptedClauseRefs:publicA08ClauseRefs(raw,t),
      ...(provenanceOnly?{diagnosticComplete:bool(raw.diagnosticComplete),provenanceDiagnostics:diagnostics}:{}),
      ...(gtOnly?{gtPasswordVerified,gtPasswordProofs:passwords.map(x=>publicA08GtPasswordProof({...x,pass:gtPasswordVerified&&x.pass===true})),remainingExactCredentialCases:[...(gtPasswordVerified?[]:['GT_CURRENT_PROVIDER_CREDENTIAL_AND_HR_SESSION']),'LEGACY_ORIGINAL_CREDENTIAL_PROVENANCE'],hnReexecuted:false}:{}),
      safety:{...counts(raw.safety,['providerCommands','directAuthWrites','directFirestoreWrites','storageWrites','hrWrites','passwordChanges','passwordResets','fixtureCreates','builds','deploys']),
        ...(provenanceOnly||gtOnly?counts(raw.safety,['loginAttempts','browserLaunches','customTokensUsed']):{}),
        ...(gtOnly?counts(raw.safety,['hnLoginAttempts','legacyLoginAttempts']):{}),
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
      ...(raw.hrOwnerDiagnostic!==undefined?{hrOwnerDiagnostic:financeUiHrOwnerDiagnostic(raw.hrOwnerDiagnostic)}:{}),
      ...(['HTTP1_DIAGNOSTIC','CHROMIUM_DEFAULT'].includes(raw.browserTransport)?{browserTransport:raw.browserTransport}:{}),
      ...(raw.firestoreListen?{firestoreListen:{...counts(raw.firestoreListen,['requests','responses','failed']),
        statuses:Object.fromEntries(Object.entries(raw.firestoreListen.statuses||{}).filter(([k,v])=>/^[1-5][0-9]{2}$/.test(k)&&Number.isSafeInteger(v)&&v>=0)),
        errors:Object.fromEntries(Object.entries(raw.firestoreListen.errors||{}).filter(([k,v])=>/^(net::ERR_[A-Z0-9_]+|OTHER)$/.test(k)&&k.length<=64&&Number.isSafeInteger(v)&&v>=0))}}:{}),
      ...(raw.failurePdf!==undefined?{failurePdf:financeUiPdfDiagnostic(raw.failurePdf)}:{}),
      ...(raw.partialExportProof!==undefined?{partialExportProof:financeUiPartialExport(raw.partialExportProof)}:{}),
      ...(raw.networkFailure!==undefined?{networkFailure:safeTypedFailureCode(raw.networkFailure)}:{}),
      ...booleans(raw,['currentAdminClaimsVerified','browserServerReadVerified','committedMetadataReceiptVerified','firstAdvanceUnchanged','secondMetadataExact','sameCashPeriod','newSessionParity','financialDocumentsStable']),
      ...counts(raw,['independentAdminSessions','advanceCount','customTokenMints']),
      network:counts(raw.network,['automaticHrSuppressed','knownPresentationImagesBlocked','unexpectedDenied','allowedAuthRequests','routeControlFailures']),
      sessions:sessions.map(session=>({
        ...booleans(session,['newContextEmpty','exactCurrentAdminClaims','serverReadConfirmed','advancePairExact','firstAdvanceUnchanged','secondMetadataExact']),
        rowCount:count(session.rowCount),
        movementExport:{decision:enumValue(session.movementExport?.decision,['PASS_EXPORT_PARITY']),rows:count(session.movementExport?.rows),xlsx:booleans(session.movementExport?.xlsx,['parsed','contentMatches']),pdf:booleans(session.movementExport?.pdf,['parsed','contentMatches'])},
        dashboard:{decision:enumValue(session.dashboard?.decision,['PASS_EXPORT_PARITY','NOT_APPLICABLE_NO_ELIGIBLE_ROWS']),...booleans(session.dashboard,['realRows','emptyStateObserved','independentHrKpisCertified'])}
      })),
      safety:{...counts(raw,['authIdentityOrClaimsWrites','directFirestoreWrites','providerCommandsExecuted','financialMutationRequestsDispatched']),production:false}
    };
    if(raw.decision==='PASS_C09_C10_ADVANCE_UI_AND_EXPORT_SCOPE'){
      need(raw.hrOwnerDiagnostic===undefined&&raw.failurePdf===undefined&&raw.partialExportProof===undefined&&raw.networkFailure===undefined&&failureCodes.length===0&&unclassifiedFailureCount===0,'FINANCE_UI_CONTRADICTORY_PASS');
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
    provenance:google?{provider:t.provider,startUri:t.startUri,startGeneration:t.startGeneration,startSha256:t.startSha256,
      resultUri:t.resultUri,resultGeneration:t.resultGeneration,bundleSha256:t.bundleSha256,resultSha256:rawHash,
      entry:spec.entry,controlHead:t.controlHead,transportSha:t.transportSha,encryptedPdfEvidence:t.encryptedPdfEvidence,
      ...(spec.kind==='F3_ENDPOINT'?{archiveUri:t.archiveUri,archiveSha256:t.archiveSha256,archiveVerified:t.archiveVerified,evidenceEntries:t.evidenceEntries}:{})}: {runId:String(t.runId),runAttempt:String(t.runAttempt),jobId:String(t.jobId),controlHead:t.controlHead,
      artifactId:String(t.artifactId),artifactDigest:t.artifactDigest,entry:spec.entry,resultSha256:rawHash},
    identity,classification,failureCodes,unclassifiedFailureCount,observations,
    ownerSpecificReceipts:[],fullDomain:false,newDomainMatches:0,phaseAComplete:false,
    productActionsPerformedByConsumer:0,production:false,privateValuesStored:false
  };
}
