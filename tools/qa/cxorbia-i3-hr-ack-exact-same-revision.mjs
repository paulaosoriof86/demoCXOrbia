import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {validateTerminalHrObservation} from './cxorbia-i3-terminal-hr-observation.mjs';
const b14stable=v=>Array.isArray(v)?v.map(b14stable):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,b14stable(v[k])])):v;
const b14sha=v=>createHash('sha256').update(typeof v==='string'?v:JSON.stringify(b14stable(v))).digest('hex');
const b14str=v=>String(v??'').trim();
const B14_READ_SCOPES=['https://www.googleapis.com/auth/spreadsheets.readonly','https://www.googleapis.com/auth/drive.metadata.readonly'];
export async function b14PrincipalOf(client){
  if(typeof client?.getTargetPrincipal==='function')return b14str(await client.getTargetPrincipal());
  if(typeof client?.getServiceAccountEmail==='function')return b14str(await client.getServiceAccountEmail());
  return typeof client?.email==='string'?client.email:null;
}
export function b14DiagnosticError(error){
  const api=error?.response?.data?.error,safe=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(v)?v:null;
  return {httpStatus:Number(error?.response?.status)||null,apiStatus:safe(api?.status),reason:safe(api?.details?.find(x=>x?.reason)?.reason||api?.errors?.find(x=>x?.reason)?.reason),code:safe(error?.code)||safe(/^B14_[A-Z0-9_]+$/.test(String(error?.message||''))?error.message:null)};
}
export function b14RuntimeAuthority(runtime,expected){
  const containers=runtime?.spec?.containers||[],digest=b14str(runtime?.status?.imageDigest).match(/sha256:[a-f0-9]{64}$/)?.[0];
  if(runtime?.metadata?.name!==expected.revision||digest!==expected.digest)throw Error('B14_RUNTIME_REVISION_OR_DIGEST_DRIFT');
  if(containers.length!==1)throw Error('B14_READER_CONTAINER_UNRESOLVED');
  const env=(containers[0].env||[]),names=env.map(x=>x.name).sort();
  const secretRefs=env.filter(x=>x.valueFrom?.secretKeyRef).map(x=>({name:x.name,referenceHash:b14sha(JSON.stringify(x.valueFrom.secretKeyRef))}));
  return {revision:expected.revision,digest,principal:b14str(runtime.spec.serviceAccountName),envNames:names,secretRefs,
    credentialOverridePresent:names.includes('FIREBASE_SERVICE_ACCOUNT_JSON'),workbookOverridePresent:names.includes('CXORBIA_HR_LIVE_SHEET_ID')};
}
export function b14WorkbookFromReaders(readers,authority){
  if(authority.credentialOverridePresent)return {resolved:false,reason:'EFFECTIVE_READER_IDENTITY_UNRESOLVED'};
  if(authority.workbookOverridePresent)return {resolved:false,reason:'EFFECTIVE_WORKBOOK_OVERRIDE_UNRESOLVED'};
  const ids=readers.map(x=>x.match(/(?:const|let)\s+SHEET_ID\s*=\s*process\.env\.CXORBIA_HR_LIVE_SHEET_ID\s*\|\|\s*['"]([A-Za-z0-9_-]+)['"]/)?.[1]);
  if(ids.length!==2||ids.some(x=>!x)||new Set(ids).size!==1)return {resolved:false,reason:'SEALED_READER_WORKBOOK_DISAGREEMENT'};
  return {resolved:true,id:ids[0],idSha256:b14sha(ids[0]),authority:'EXACT_RUNTIME_READER_FALLBACK_ENV_OVERRIDE_ABSENT'};
}
export function b14CapabilityVerdict({principalVerified,file,sheets,sheetId}){
  const identity=principalVerified===true&&file?.id===sheetId&&sheets?.spreadsheetId===sheetId;
  const canEdit=identity&&typeof file?.capabilities?.canEdit==='boolean'?file.capabilities.canEdit:null;
  return {metadataIdentityVerified:identity,canEditObserved:canEdit,canModifyContentObserved:identity&&typeof file?.capabilities?.canModifyContent==='boolean'?file.capabilities.canModifyContent:null,
    accessConclusion:!identity?'PROBE_IDENTITY_OR_METADATA_INCOMPLETE':file.trashed===true?'WORKBOOK_TRASHED':canEdit===true?'METADATA_EDIT_CAPABILITY_OBSERVED':canEdit===false?'METADATA_EDIT_CAPABILITY_FALSE':'EDIT_CAPABILITY_UNRESOLVED',providerAck:false,writeCapabilityExecuted:false,b14Closed:false};
}
export function b14BindingProjection(row,sheetId,tenantId,projectId){
  const scope=row?.tenantId===tenantId&&(row.projectId===projectId||Array.isArray(row.projectIds)&&row.projectIds.includes(projectId));
  const book=b14str(row?.sheetId||row?.spreadsheetId);
  const refs=Object.fromEntries(['providerBindingId','mappingRef','secretRef','sourceRef'].map(k=>[k,{present:!!row?.[k],sha256:row?.[k]?b14sha(row[k]):null}]));
  return {scopeMatches:scope,enabled:typeof row?.enabled==='boolean'?row.enabled:null,hrWritesEnabled:typeof row?.hrWritesEnabled==='boolean'?row.hrWritesEnabled:null,
    workbookReferencePresent:!!book,workbookMatches:scope&&book&&sheetId?book===sheetId:null,refs};
}
export function b14ProjectSourceProjection(project,{parentPresenceComplete=true}={}){
  const fields=['mode','authority','providerType','readPolicy','writePolicy','providerBindingId','integrationSettingId','providerRef','mappingRef','secretRef'];
  const enums={mode:['internal','external'],authority:['platform','external_source'],providerType:['internal_firestore','google_sheets','excel_import','external_api','external_platform','custom_adapter'],readPolicy:['internal_live','external_live','external_snapshot_import'],writePolicy:['platform_only','external_read_only','bidirectional_gated']};
  const projectSource=project?.operationalSource||project?.routeSource||{},selected=project?.operationalSource?'operationalSource':project?.routeSource?'routeSource':'none';
  const guard=source=>({external:source?.mode==='external',externalLive:source?.readPolicy==='external_live',providerReferencePresent:!!b14str(source?.providerBindingId||source?.integrationSettingId||source?.providerRef),mappingReferencePresent:!!b14str(source?.mappingRef)});
  const good=x=>Object.values(guard(x)).every(Boolean),projectFields=source=>Object.fromEntries(fields.map(k=>[k,{present:source?.[k]!==undefined,valueHash:source?.[k]===undefined?null:b14sha(source[k]),...(enums[k]?{value:enums[k].includes(source?.[k])?source[k]:null}:{})}]));
  const chosen=['providerBindingId','integrationSettingId','providerRef'].find(k=>projectSource?.[k]),selectionComplete=parentPresenceComplete||fields.some(k=>project?.operationalSource?.[k]!==undefined);
  return {sourceSelected:selectionComplete?selected:'UNRESOLVED_PARENT_PRESENCE',selectionComplete,operationalSource:projectFields(project?.operationalSource),routeSource:projectFields(project?.routeSource),observedSourceConfigGuard:guard(projectSource),sourceConfigGuardPass:selectionComplete?good(projectSource):null,selectedReferenceKind:selectionComplete?chosen||null:null,selectedReferenceHash:selectionComplete&&chosen?b14sha(projectSource[chosen]):null,operationalSourceShadowsValidRoute:selectionComplete?selected==='operationalSource'&&!good(projectSource)&&good(project?.routeSource):null,scope:'PERSISTED_SOURCE_CONFIG_ONLY_NOT_AUTH_SESSION_OR_REMOTE_ACK'};
}
export function b14IntegrationCandidates(project){
  const selected=project?.operationalSource?'operationalSource':project?.routeSource?'routeSource':'none';
  return ['operationalSource','routeSource'].flatMap(source=>['providerBindingId','integrationSettingId','providerRef'].filter(kind=>b14str(project?.[source]?.[kind])).map(kind=>({source,kind,id:b14str(project[source][kind]),selected:source===selected,validId:/^[A-Za-z0-9_-]{1,200}$/.test(b14str(project[source][kind]))})));
}
export function b14LeaseReceiptPath(value,tenantId){
  const prefix='tenants/'+tenantId+'/commandReceipts/';
  return typeof value==='string'&&value.startsWith(prefix)&&/^hr-[a-f0-9]{64}$/.test(value.slice(prefix.length))?value:null;
}
export async function b14PredecessorReadOnly(tx,{receipt,receiptRef,tenantId,projectId,revision,db}){
  const proof=receipt?.predecessorReconciliation;
  if(!proof)return {present:false,scope:'NO_PREDECESSOR_PROOF_ON_THIS_RECEIPT',writes:0};
  const sha=v=>b14sha(JSON.stringify(b14stable(v))),hash=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
  const receiptPath=b14LeaseReceiptPath(proof.receiptPath,tenantId),out={present:true,schemaMatches:proof.schemaVersion==='cxorbia.hr-reconciliation-predecessor.v1',receiptPathHash:typeof proof.receiptPath==='string'?b14sha(proof.receiptPath):null,sourceRevision:hash(proof.sourceRevision)?proof.sourceRevision:null,journalSeal:hash(proof.journalSeal)?proof.journalSeal:null,journalComplete:proof.journalComplete===true,proofInResultMatches:sha(proof)===sha(receipt.result?.predecessorReconciliation||null),successorRevisionMatches:receipt.sourceRevision===revision,independentHistoricalReadback:false,scope:'READONLY_FULL_HISTORICAL_JOURNAL_SEAL_NOT_REMOTE_HR_ACK',writes:0};
  out.successorScopeMatches=!!b14LeaseReceiptPath(receiptRef?.path,tenantId)&&receiptRef.path!==receiptPath&&receipt.tenantId===tenantId&&receipt.projectId===projectId;const successorExpectedBinding={tenantId,projectId,sourceRevision:revision,actorUid:receipt.actorUid,idempotencyKey:receipt.idempotencyKey,commandType:'hr.snapshot.reconcile'};out.successorBindingMatches=out.successorScopeMatches&&typeof receipt.actorUid==='string'&&!!receipt.actorUid&&typeof receipt.idempotencyKey==='string'&&receipt.idempotencyKey.length>=16&&receipt.idempotencyKey.length<=200&&receiptRef.id==='hr-'+sha([projectId,receipt.idempotencyKey])&&receipt.digest===sha({actorUid:receipt.actorUid,scope:{tenantId,projectId},sourceRevision:revision,commandType:'hr.snapshot.reconcile'})&&receipt.result?.sourceRevision===revision&&receipt.result?.receiptPath===receiptRef.path&&sha(receipt.result?.receiptBinding||null)===sha(successorExpectedBinding);out.successorTerminalCommitted=out.successorBindingMatches&&['committed','committed_with_identity_review'].includes(receipt.status)&&receipt.result?.ok===true&&receipt.result?.committed===true&&receipt.result?.providerAck===true;
  if(!receiptPath||!out.schemaMatches||!out.journalSeal||!out.successorScopeMatches)return out;
  const ref=db.doc(receiptPath),[old,intents,effects,visits,shoppers]=await Promise.all([tx.get(ref),tx.get(ref.collection('intents')),tx.get(ref.collection('effects')),tx.get(ref.collection('stages').doc('visits')),tx.get(ref.collection('stages').doc('shoppers'))]);
  const row=old.data()||{},entries=q=>q.docs.map(d=>[d.id,d.data()]).sort(([a],[b])=>a.localeCompare(b)),journalSeal=sha({receipt:row,intents:entries(intents),effects:entries(effects),stages:{visits:visits.data()||null,shoppers:shoppers.data()||null}});
  const tally={auth:0,firestore:0};let knownOperations=true;
  for(const doc of effects.docs){const effect=doc.data();if(!Object.hasOwn(tally,effect.system)||!Array.isArray(effect.operations))knownOperations=false;else tally[effect.system]+=effect.operations.length;}
  const binding=old.exists&&row.status==='partial'&&row.tenantId===tenantId&&row.projectId===projectId&&row.sourceRevision===proof.sourceRevision&&row.sourceRevision!==revision&&row.digest===proof.receiptDigest&&row.attemptId===proof.attemptId&&typeof row.actorUid==='string'&&!!row.actorUid&&sha(row.actorUid)===proof.actorUidHash&&row.digest===sha({actorUid:row.actorUid,scope:{tenantId,projectId},sourceRevision:row.sourceRevision,commandType:'hr.snapshot.reconcile'})&&ref.id==='hr-'+sha([projectId,row.idempotencyKey]);
  const countsMatch=knownOperations&&intents.size===proof.intentCount&&effects.size===proof.effectCount&&tally.auth===proof.authWrites&&tally.firestore===proof.firestoreWrites&&tally.auth+tally.firestore===proof.confirmedProviderWrites;
  Object.assign(out,{oldReceiptExists:old.exists,oldReceiptStillPartial:row.status==='partial',historicalBindingMatches:binding,journalSealMatches:journalSeal===proof.journalSeal,countsMatch,intentsRead:intents.size,effectsRead:effects.size,confirmedProviderWrites:knownOperations?tally.auth+tally.firestore:null,authWrites:knownOperations?tally.auth:null,firestoreWrites:knownOperations?tally.firestore:null,independentHistoricalReadback:binding&&countsMatch&&journalSeal===proof.journalSeal&&out.proofInResultMatches&&out.successorRevisionMatches&&out.successorBindingMatches&&out.journalComplete});
  out.decision=out.independentHistoricalReadback?(out.successorTerminalCommitted?'PASS_VERIFIED_PREDECESSOR_HISTORY_AND_COMMITTED_SUCCESSOR':'VERIFIED_PREDECESSOR_HISTORY_SUCCESSOR_NOT_COMMITTED'):'HOLD_PREDECESSOR_READBACK_UNVERIFIED';
  return out;
}
export async function b14ReconciliationLeaseReadOnly(db,tenantId,projectId,revision){
  const state=v=>typeof v==='string'&&/^[A-Za-z0-9_:-]{1,160}$/.test(v)?v:null,counts=v=>Object.fromEntries(Object.entries(v||{}).filter(([,x])=>typeof x==='boolean'||typeof x==='number'&&Number.isFinite(x)));
  const lockRef=db.doc('tenants/'+tenantId+'/commandReceipts/hr-scope-'+b14sha(JSON.stringify(tenantId)));
  return db.runTransaction(async tx=>{
    const [lock]=await tx.getAll(lockRef,{fieldMask:['status','projectId','receiptPath','expiresAt','attemptId']});const l=lock.data()||{};
    const result={exists:lock.exists,status:state(l.status),projectMatches:l.projectId===projectId,expiresAt:Number.isFinite(l.expiresAt)?l.expiresAt:null,expired:Number.isFinite(l.expiresAt)?l.expiresAt<Date.now():null,updateTime:lock.updateTime?.toDate().toISOString()||null,receiptPathHash:l.receiptPath?b14sha(l.receiptPath):null,scope:'READONLY_METADATA_NOT_LEASE_RELEASE_OR_RETRY',writes:0};
    if(!lock.exists||l.projectId!==projectId)return result;
    const receiptPath=b14LeaseReceiptPath(l.receiptPath,tenantId);if(!receiptPath){result.receiptReference='INVALID_SCOPED_REFERENCE';return result;}
    const ref=db.doc(receiptPath),[doc]=await tx.getAll(ref,{fieldMask:['version','digest','actorUid','tenantId','projectId','sourceRevision','idempotencyKey','status','attemptId','startedAt','completedAt','updatedAt','error','predecessorReconciliation','result.predecessorReconciliation','result.ok','result.status','result.code','result.committed','result.providerAck','result.sourceRevision','result.receiptPath','result.receiptBinding','result.unresolvedEffects','result.unverifiedEffects','result.confirmedProviderWrites','result.providerWrites','result.applicationWritesThisAttempt','result.stages']}),row=doc.data()||{};
    const stages=await tx.getAll(ref.collection('stages').doc('visits'),ref.collection('stages').doc('shoppers'),{fieldMask:['status','sourceRevision','attemptId','completedAt','summary']});
    const intents=await tx.get(ref.collection('intents').select('status','stage','system','attemptId').limit(501));
    const effects=await tx.get(ref.collection('effects').select('stage','system','attemptId','readbackVerified','credentialAuthenticationPending').limit(501));
    const complete=intents.size<501&&effects.size<501,effectIds=new Set(effects.docs.map(x=>x.id));
    result.receipt={exists:doc.exists,updateTime:doc.updateTime?.toDate().toISOString()||null,status:state(row.status),tenantMatches:row.tenantId===tenantId,projectMatches:row.projectId===projectId,sourceRevision:row.sourceRevision||null,currentRevisionMatches:row.sourceRevision===revision,actorUidHash:row.actorUid?b14sha(row.actorUid):null,idempotencyKeyHash:row.idempotencyKey?b14sha(row.idempotencyKey):null,digestMatches:!!row.actorUid&&row.digest===b14sha(JSON.stringify(b14stable({actorUid:row.actorUid,scope:{tenantId,projectId},sourceRevision:row.sourceRevision,commandType:'hr.snapshot.reconcile'}))),leaseAttemptMatches:!!l.attemptId&&row.attemptId===l.attemptId,errorCode:state(row.result?.code),stageResults:Object.fromEntries(['visits','shoppers'].map(k=>[k,{...counts(row.result?.stages?.[k]),status:state(row.result?.stages?.[k]?.status),code:state(row.result?.stages?.[k]?.code)}])),result:counts(row.result),applicationWritesThisAttempt:counts(row.result?.applicationWritesThisAttempt),stages:stages.map((x,i)=>({name:['visits','shoppers'][i],exists:x.exists,status:state(x.data()?.status),sourceRevision:x.data()?.sourceRevision||null,summary:counts(x.data()?.summary)})),journal:{complete,intentsObserved:intents.size,effectsObserved:effects.size,unresolvedIntentsObserved:complete?intents.docs.filter(x=>!effectIds.has(x.id)&&!['no_effect','failed_before_write'].includes(x.data()?.status)).length:null,unverifiedEffectsObserved:effects.docs.filter(x=>x.data()?.readbackVerified!==true).length,credentialAuthenticationPending:effects.docs.some(x=>x.data()?.credentialAuthenticationPending===true)}};
    result.receipt.predecessorReconciliation=await b14PredecessorReadOnly(tx,{receipt:row,receiptRef:ref,tenantId,projectId,revision,db});
    result.activeNonCommittedLease=!!l.receiptPath&&l.status!=='committed';result.successorEligibility='ONLY_RUNTIME_FULL_TRANSACTION_VALIDATION_CAN_AUTHORIZE';result.resumeAgainstCurrentRevisionPossible=row.sourceRevision===revision&&row.tenantId===tenantId&&row.projectId===projectId;
    return result;
  },{readOnly:true});
}

// HR349 observation only. Never call reconcileSnapshot: it can consolidate
// identities before it reaches the failing crosswalk guard. This observer uses
// technical identity fields and emits hashes, not names, logins or credentials.
export function hrCrosswalkUidDiagnosis({tenantId,projectId,sourceIds,users,links,crosswalks,profiles,authUsers,providerUidFingerprint,stableShopperUid}){
  const s=b14str,a=v=>Array.isArray(v)?v:[],uniq=v=>[...new Set(a(v).map(s).filter(Boolean))],h=b14sha;
  const digest=v=>/^[a-f0-9]{64}$/.test(s(v))?s(v):null,invalidDigestHash=v=>s(v)&&!digest(v)?h(s(v)):null;
  const roles=['shopper','admin','super','cliente','client'],namespaces=['shopper','admin','super','cliente','client'],statuses=['active','inactive','superseded','pending','approved','confirmed','materialized'];
  const identityStates=['active','canonical','superseded_exact_alias','superseded','stable'],authorities=['provider_exact','tenant_adjudication','provider_auto_compatible','platform_created','migrated_exact','hr_external','stable_hr_shopper_id'];
  const modes=['stable_hr_shopper_id','exact_technical_keys_only','provider_exact_identity_link'];
  const enumValue=(v,values)=>values.includes(s(v))?s(v):null,enumHash=(v,values)=>s(v)&&!enumValue(v,values)?h(s(v)):null;
  const authExact=(u,id)=>{const c=u?.customClaims||{},role=s(c.role).toLowerCase();return(s(c.tenantId)===tenantId||uniq(c.tenants).includes(tenantId))&&s(c.shopperId)===id&&role==='shopper'&&s(c.authNamespace||(role==='shopper'?'shopper':'')).toLowerCase()==='shopper'&&uniq([...a(c.projectIds),c.projectId]).includes(projectId);};
  const memberExact=(m,id)=>m?.active===true&&s(m.tenantId)===tenantId&&s(m.shopperId)===id&&s(m.role)==='shopper'&&s(m.authNamespace)==='shopper'&&uniq(m.projectIds).includes(projectId);
  const authByUid=new Map(authUsers.map(u=>[u.uid,u])),byProfile=new Map(profiles.map(x=>[x.id,x])),byCross=new Map(crosswalks.map(x=>[x.id,x]));
  const direct=new Set(users.filter(x=>memberExact(x.data,s(x.data.shopperId))&&authByUid.get(x.id)?.disabled!==true&&authByUid.has(x.id)&&authExact(authByUid.get(x.id),s(x.data.shopperId))).map(x=>s(x.data.shopperId)));
  const technical=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId','sourceIdentityKey','sourceSubjectId'];
  const aliases=['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
  const flatten=v=>Array.isArray(v)?v.flatMap(flatten):v&&typeof v==='object'?Object.values(v).flatMap(flatten):s(v)?[s(v)]:[];
  const mapping=new Map(),suppressed=new Set(),linkEvidence=new Map();
  for(const doc of links){
    const l=doc.data,status=s(l.status||l.state).toLowerCase(),authority=s(l.authorityType||l.authority?.type).toLowerCase();
    const ref=s(l.authorityRef||l.authority?.evidenceRef||l.authority?.adjudicationId||l.authority?.providerRef||l.authority?.commandId||l.providerAckRef||l.adjudicationId||l.commandId||l.idempotencyKey||doc.id);
    const scope=s(l.projectScope||l.scope?.projectId||l.projectId||'*'),canonical=s(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId),system=s(l.sourceSystem||l.sourceNamespace||l.sourceType||l.sourceIdentity?.sourceSystem).toLowerCase();
    if(s(l.tenantId||l.scope?.tenantId)!==tenantId||!['active','confirmed','approved','materialized'].includes(status)||!['provider_exact','tenant_adjudication','provider_auto_compatible','platform_created','migrated_exact'].includes(authority)||!ref||l.periodKey||l.periodId||l.periodScope||(scope!=='*'&&scope.toLowerCase()!=='tenant'&&scope!==projectId)||!canonical||!system.includes('hr'))continue;
    const tokens=uniq([l,l.sourceIdentity,l.identity,l.crosswalk,l.profile,l.exactIdentityAnchors].filter(Boolean).flatMap(c=>[...technical,...aliases].flatMap(k=>flatten(c[k]))));
    for(const token of tokens){
      if(authority==='tenant_adjudication'&&token!==canonical&&direct.has(token)){suppressed.add(token);continue;}
      if(mapping.has(token)&&mapping.get(token)!==canonical)throw Error('SOURCE_FAILURE:HR_UID_DIAG_IDENTITY_LINK_CONFLICT');
      mapping.set(token,canonical);if(!linkEvidence.has(token))linkEvidence.set(token,[]);
      linkEvidence.get(token).push({pathHash:h(doc.path),authorityType:authority,authorityRefHash:h(ref),canonicalIdHash:h(canonical),updateTime:doc.updateTime});
    }
  }
  const membership=id=>{
    const found=users.filter(x=>s(x.data.shopperId)===id).sort((x,y)=>x.id.localeCompare(y.id));
    if(found.length>=8)return{unresolved:'MEMBERSHIP_QUERY_BOUND_REACHED',count:found.length};
    const viable=found.filter(x=>!['inactive','superseded'].includes(s(x.data.status).toLowerCase())&&s(x.data.identityState).toLowerCase()!=='superseded_exact_alias');
    const active=viable.filter(x=>x.data.active===true);
    if(active.length>1||(!active.length&&viable.length>1))return{unresolved:'MEMBERSHIP_DUPLICATE',count:found.length};
    return{doc:active[0]||viable[0]||(found.length===1?found[0]:null),count:found.length,selection:active.length?'ACTIVE':viable.length?'VIABLE':found.length===1?'SINGLE_FALLBACK':'NONE'};
  };
  const project=(u,id)=>{const c=u?.customClaims||{},m=users.find(x=>x.id===u?.uid);return{uidHash:u?.uid?h(u.uid):null,providerUidFingerprint:u?.uid?providerUidFingerprint(u.uid):null,disabled:u?u.disabled===true:null,authExact:!!u&&authExact(u,id),claimShopperIdHash:s(c.shopperId)?h(s(c.shopperId)):null,tenantMatches:s(c.tenantId)===tenantId||uniq(c.tenants).includes(tenantId),projectMatches:uniq([...a(c.projectIds),c.projectId]).includes(projectId),role:enumValue(c.role,roles),roleValueHash:enumHash(c.role,roles),authNamespace:enumValue(c.authNamespace,namespaces),authNamespaceValueHash:enumHash(c.authNamespace,namespaces),membershipPresent:!!m,membershipExact:!!m&&memberExact(m.data,id),membershipShopperIdHash:s(m?.data.shopperId)?h(s(m.data.shopperId)):null,membershipActive:m?.data.active===true,membershipStatus:enumValue(m?.data.status,statuses),membershipStatusValueHash:enumHash(m?.data.status,statuses),membershipIdentityState:enumValue(m?.data.identityState,identityStates),membershipIdentityStateValueHash:enumHash(m?.data.identityState,identityStates),membershipFingerprint:digest(m?.data.providerUidFingerprint),membershipFingerprintInvalidHash:invalidDigestHash(m?.data.providerUidFingerprint),membershipUpdateTime:m?.updateTime||null};};
  const conflicts=[],unresolved=[],exceptions=[];let checked=0,matched=0,absent=0;
  for(const sourceId of uniq(sourceIds).sort()){
    const canonical=mapping.get(sourceId)||sourceId,crossDoc=byCross.get(sourceId),cross=crossDoc?.data||{},profileDoc=byProfile.get(canonical),profile=profileDoc?.data||{};
    if(!crossDoc){absent++;continue;}
    const rawStoredFingerprint=s(cross.providerUidFingerprint);
    const base={sourceIdHash:h(sourceId),canonicalIdHash:h(canonical),sourceIsCanonical:sourceId===canonical,crossPathHash:h(crossDoc.path),crossUpdateTime:crossDoc.updateTime,linkEvidence:linkEvidence.get(sourceId)||[],storedUidFingerprint:digest(rawStoredFingerprint),storedUidFingerprintInvalidHash:invalidDigestHash(rawStoredFingerprint)};
    const scopeOk=s(cross.tenantId)===tenantId&&s(cross.sourceStableKey||sourceId)===sourceId;
    const selfAlias=sourceId!==canonical&&!!profileDoc&&scopeOk&&s(cross.shopperId)===sourceId&&s(cross.sourceType).toLowerCase()==='hr_external'&&['stable_hr_shopper_id','exact_technical_keys_only'].includes(s(cross.identityMode).toLowerCase());
    const staleAdjudication=suppressed.has(sourceId)&&sourceId===canonical&&scopeOk&&s(cross.shopperId)!==canonical&&s(cross.sourceType).toLowerCase()==='hr_external'&&s(cross.identityMode).toLowerCase()==='provider_exact_identity_link'&&s(cross.migrationAuthorityType).toLowerCase()==='tenant_adjudication';
    if(selfAlias||staleAdjudication){exceptions.push({...base,reason:selfAlias?'EXACT_ALIAS_SELF_MAP_EXCEPTION':'SUPPRESSED_TENANT_ADJUDICATION_EXCEPTION'});continue;}
    if(!scopeOk||s(cross.shopperId)!==canonical){unresolved.push({...base,reason:'CROSSWALK_SCOPE_PREDICATE'});continue;}
    const selection=membership(canonical);if(selection.unresolved){unresolved.push({...base,reason:selection.unresolved,membershipCount:selection.count});continue;}
    const authMatches=authUsers.filter(u=>authExact(u,canonical)),enabled=authMatches.filter(u=>u.disabled!==true);
    if(!selection.doc&&(enabled.length>1||!enabled.length&&authMatches.length)){unresolved.push({...base,reason:enabled.length>1?'AUTH_PRINCIPAL_AMBIGUOUS':'AUTH_PRINCIPAL_DISABLED',authCount:authMatches.length});continue;}
    const uid=selection.doc?.id||enabled[0]?.uid||stableShopperUid(tenantId,canonical),selected=authByUid.get(uid);
    checked++;if(!rawStoredFingerprint||rawStoredFingerprint===providerUidFingerprint(uid)){matched++;continue;}
    const oldOwners=authUsers.filter(u=>providerUidFingerprint(u.uid)===rawStoredFingerprint);
    const memberOwners=users.filter(x=>providerUidFingerprint(x.id)===rawStoredFingerprint);
    conflicts.push({...base,reason:'CURRENT_UID_CONFLICT_PREDICATE_MATCH',guardScopeMatches:true,exactAliasSelfMap:false,staleTenantAdjudicationCrosswalk:false,membershipSelection:selection.selection,uidSelectionBranch:selection.doc?'CANONICAL_MEMBERSHIP':enabled.length?'EXACT_RECOVERED_AUTH':'DETERMINISTIC_NEW_UID',selectedUidHash:h(uid),selectedUidFingerprint:providerUidFingerprint(uid),selectedAuth:project(selected,canonical),selectedMembershipPresent:!!selection.doc,selectedMembershipExact:!!selection.doc&&memberExact(selection.doc.data,canonical),selectedMembershipFingerprint:digest(selection.doc?.data.providerUidFingerprint),selectedMembershipFingerprintInvalidHash:invalidDigestHash(selection.doc?.data.providerUidFingerprint),selectedMembershipUpdateTime:selection.doc?.updateTime||null,storedFingerprintAuthOwners:oldOwners.map(u=>project(u,canonical)),storedFingerprintMembershipOwners:memberOwners.map(x=>({uidHash:h(x.id),shopperIdHash:s(x.data.shopperId)?h(s(x.data.shopperId)):null,tenantMatches:s(x.data.tenantId)===tenantId,projectMatches:uniq(x.data.projectIds).includes(projectId),active:x.data.active===true,status:enumValue(x.data.status,statuses),statusValueHash:enumHash(x.data.status,statuses),identityState:enumValue(x.data.identityState,identityStates),identityStateValueHash:enumHash(x.data.identityState,identityStates),providerUidFingerprint:digest(x.data.providerUidFingerprint),providerUidFingerprintInvalidHash:invalidDigestHash(x.data.providerUidFingerprint),updateTime:x.updateTime})),canonicalProfile:{exists:!!profileDoc,tenantMatches:s(profile.tenantId)===tenantId,projectMatches:uniq(profile.projectIds).includes(projectId),identityAuthority:enumValue(profile.identityAuthority,authorities),identityAuthorityValueHash:enumHash(profile.identityAuthority,authorities),identityAuthorityRefHash:s(profile.identityAuthorityRef)?h(s(profile.identityAuthorityRef)):null,providerUidFingerprint:digest(profile.providerUidFingerprint),providerUidFingerprintInvalidHash:invalidDigestHash(profile.providerUidFingerprint),superseded:!!s(profile.supersededByShopperId),sourceRevision:digest(profile.hrSourceRevision),sourceRevisionInvalidHash:invalidDigestHash(profile.hrSourceRevision),updateTime:profileDoc?.updateTime||null},crossIdentityMode:enumValue(cross.identityMode,modes),crossIdentityModeValueHash:enumHash(cross.identityMode,modes),crossAuthority:enumValue(cross.migrationAuthorityType,authorities),crossAuthorityValueHash:enumHash(cross.migrationAuthorityType,authorities),crossAuthorityRefHash:s(cross.migrationAuthorityRef)?h(s(cross.migrationAuthorityRef)):null});
  }
  return{schemaVersion:'cxorbia.i3.hr-crosswalk-uid-readonly.v1',scope:'TECHNICAL_UID_GUARD_OBSERVATION_NOT_IDENTITY_REPAIR_OR_FULL_RECONCILIATION',decision:conflicts.length?'OBSERVED_CURRENT_CROSSWALK_UID_PREDICATES':unresolved.length?'HOLD_UID_DIAG_UNRESOLVED':'NO_UID_CONFLICT_PREDICATE_OBSERVED',sourceIdentityCount:uniq(sourceIds).length,checked,matched,absent,conflicts,unresolved,exceptions,firestoreWrites:0,authWrites:0,hrWrites:0,providerCommandCalls:0,fullReconciliationClosed:false};
}

export async function hrCrosswalkUidReadOnly({db,auth,snapshot,tenantId,projectId,revision,sourceDir}){
  if(!sourceDir||snapshot.tenantId!==tenantId||snapshot.projectId!==projectId||snapshot.sourceSafe!==true||snapshot.imported!==false||snapshot._runtime?.revision!==revision||!/^[a-f0-9]{64}$/.test(revision||''))throw Error('SOURCE_FAILURE:HR_UID_DIAG_SOURCE');
  const owner='backend/runtime/cxorbia-shopper-command-provider-v1.mjs',module=await import(pathToFileURL(path.join(sourceDir,owner)).href);
  const {shoppers}=module.shoppersFromSnapshot(snapshot),sourceIds=shoppers.map(x=>x.shopperId),tenant=db.collection('tenants').doc(tenantId);
  const keys=['shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey','hrRowId','personId','profileId','shopperDocId','sourceIdentityKey','sourceSubjectId','exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases'];
  const masks={users:['shopperId','tenantId','active','status','identityState','role','authNamespace','projectIds','providerUidFingerprint'],
    shopperIdentityCrosswalk:['tenantId','shopperId','sourceStableKey','projectIds','providerUidFingerprint','sourceType','identityMode','migrationAuthorityType','migrationAuthorityRef'],
    shoppers:['tenantId','shopperId','projectIds','identityAuthority','identityAuthorityRef','status','identityState','supersededByShopperId','hrSourceRevision','providerUidFingerprint'],
    shopperIdentityLinks:[...new Set(['tenantId','status','state','authorityType','authority.type','authority.evidenceRef','authority.adjudicationId','authority.providerRef','authority.commandId','authorityRef','providerAckRef','adjudicationId','commandId','idempotencyKey','projectScope','scope.tenantId','scope.projectId','projectId','periodId','periodKey','periodScope','canonicalShopperId','canonicalId','shopperId','profileId','sourceSystem','sourceNamespace','sourceType','sourceIdentity.sourceSystem',...['','sourceIdentity.','identity.','crosswalk.','profile.','exactIdentityAnchors.'].flatMap(prefix=>keys.map(k=>prefix+k))])]};
  const stamp=t=>{if(!Number.isInteger(t?.seconds)||!Number.isInteger(t?.nanoseconds)||t.nanoseconds<0||t.nanoseconds>=1e9)throw Error('SOURCE_FAILURE:HR_UID_DIAG_UPDATE_TIME');return{seconds:t.seconds,nanoseconds:t.nanoseconds};};
  const readDocs=()=>db.runTransaction(async tx=>{
    const output={};for(const [name,mask]of Object.entries(masks)){
      const snap=await tx.get(tenant.collection(name).select(...mask));
      output[name]=snap.docs.map(doc=>({id:doc.id,path:doc.ref.path,updateTime:stamp(doc.updateTime),data:doc.data()})).sort((x,y)=>x.id.localeCompare(y.id));
    }return output;
  },{readOnly:true});
  const readAuth=async()=>{const found=[];let token;const tokens=new Set();do{
    const page=await auth.listUsers(1000,token);for(const u of page.users||[]){const c=u.customClaims||{};
      found.push({uid:u.uid,disabled:u.disabled===true,customClaims:Object.fromEntries(['tenantId','tenants','shopperId','role','authNamespace','projectIds','projectId'].filter(k=>c[k]!==undefined).map(k=>[k,c[k]]))});}
    token=page.pageToken;if(token&&tokens.has(token))throw Error('PROVIDER_FAILURE:HR_UID_DIAG_AUTH_PAGINATION');if(token)tokens.add(token);
  }while(token);return found.sort((x,y)=>x.uid.localeCompare(y.uid));};
  const before=await readDocs(),authBefore=await readAuth();
  const result=hrCrosswalkUidDiagnosis({tenantId,projectId,sourceIds,users:before.users,links:before.shopperIdentityLinks,crosswalks:before.shopperIdentityCrosswalk,profiles:before.shoppers,authUsers:authBefore,providerUidFingerprint:module.providerUidFingerprint,stableShopperUid:module.stableShopperUid});
  const after=await readDocs(),authAfter=await readAuth();
  if(b14sha(before)!==b14sha(after)||b14sha(authBefore)!==b14sha(authAfter))throw Error('PERSISTENCE_FAILURE:HR_UID_DIAG_IDENTITY_CHANGED_DURING_READ');
  return{...result,sourceRevision:revision,owner,ownerSourceScope:'ARCHIVED_OR_VERIFIED_CHECKED_OUT_CANDIDATE_PREDICATES_NOT_PRODUCT_EXECUTION',ownerSha256:b14sha(fs.readFileSync(path.join(sourceDir,owner),'utf8')),sourceIdSetSha256:b14sha(sourceIds.sort()),technicalDocumentsSha256:b14sha(before),authIdentityProjectionSha256:b14sha(authBefore),completeAuthPagination:true,independentReadStability:true,observedAt:new Date().toISOString()};
}

async function runB14CapabilityOnly(args){
  const [outDir,root,tenantId,projectId,runId]=args,e=process.env;
  if(!outDir||root!=='https://cxorbia-backend-dev.web.app'||e.PROJECT!=='cxorbia-backend-dev'||!tenantId||!projectId||!/^\d{8,}$/.test(runId||'')||!e.SOURCE_DIR||!e.OUT)throw Error('SOURCE_FAILURE:B14_SCOPE_GATE');
  fs.mkdirSync(outDir,{recursive:true});const read=f=>JSON.parse(fs.readFileSync(f,'utf8'));
  const d=read(e.CANDIDATE_DESCRIPTOR||'CXORBIA_I3_CANONICAL_CANDIDATE_DESCRIPTOR_2026-09-24.json'),productSourceSha=e.I3_CERTIFICATION_SOURCE_SHA,runtimeSourceSha=d.currentMaterialization?.sourceSha;
  const r={schemaVersion:'cxorbia.i3.b14.binding-capability-readonly.v1',decision:'HOLD',observationComplete:false,b14Closed:false,providerAck:false,productSourceSha,runtimeSourceSha,runtimeRevision:e.DEV_REVISION,runtimeDigest:e.RUNTIME_DIGEST,hostingVersion:e.HOSTING_VERSION_NAME,tenantId,projectId,runId,runAttempt:e.GITHUB_RUN_ATTEMPT||'1',hrRevisionBefore:e.CURRENT_LIVE_HR_REVISION,hrRevisionAfter:null,observedHrAccessMode:null,bindingToReaderMatch:'UNRESOLVED',runtimeBindingResolutionProven:false,safety:{hrWrites:0,firestoreWrites:0,authAdminWrites:0,iamPolicyWrites:0,secretPayloadReads:0,apiEnables:0,production:false}};
  const save=()=>fs.writeFileSync(path.join(outDir,'b14-capability.json'),JSON.stringify(r,null,2)+'\n');save();
  const requireHere=createRequire(import.meta.url),requireAdmin=createRequire(requireHere.resolve('firebase-admin/app'));
  const {GoogleAuth,Impersonated}=requireAdmin('google-auth-library'),{initializeApp,applicationDefault,deleteApp}=requireHere('firebase-admin/app'),{getFirestore}=requireHere('firebase-admin/firestore');
  const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();let app,db,cloudClient,projectBefore,integrationDocs=[],stage='SEALED_AUTHORITY',drift=null;
  const sourceFields=['mode','authority','providerType','readPolicy','writePolicy','providerBindingId','integrationSettingId','providerRef','mappingRef','secretRef'];
  const projectMask=['id','tenantId','projectId','version',...sourceFields.map(k=>'operationalSource.'+k),...sourceFields.map(k=>'routeSource.'+k),'hrSourceAdmin.providerBindingId','hrSourceAdmin.sourceRef','hrSourceAdmin.mappingRef','hrSourceAdmin.estado'];
  const integrationMask=['id','tenantId','projectId','projectIds','type','providerType','enabled','status','state','readPolicy','writePolicy','hrWritesEnabled','providerBindingId','mappingRef','secretRef','sourceRef','sheetId','spreadsheetId'];
  const endpoint=root+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&b14='+encodeURIComponent(runId);
  const getJson=async(client,url,params={})=>{const u=new URL(url);if(u.protocol!=='https:'||!['www.googleapis.com','sheets.googleapis.com','firebasehosting.googleapis.com'].includes(u.hostname))throw Error('B14_METADATA_ENDPOINT_NOT_ALLOWED');return (await client.request({method:'GET',url,params,headers:{'Cache-Control':'no-store'},timeout:20000,retry:false,maxRedirects:0})).data;};
  try{
    if(productSourceSha!==d.productSourceSha||!/^([a-f0-9]{40})$/.test(runtimeSourceSha||'')||!/^[a-f0-9]{64}$/.test(r.hrRevisionBefore||''))throw Error('B14_SOURCE_SCOPE_DRIFT');
    const raw=read(path.join(e.OUT,'hr-current-live.json')),snap=raw.snapshot||raw.data||raw;const hrRuntime=raw._runtime||snap._runtime;
    if(snap.tenantId!==tenantId||snap.projectId!==projectId||hrRuntime?.revision!==r.hrRevisionBefore||snap.sourceSafe!==true)throw Error('B14_HR_SCOPE_DRIFT');r.observedHrAccessMode=snap.source?.accessMode||null;
    const authority=b14RuntimeAuthority(read(path.join(e.OUT,'runtime-revision.json')),{revision:r.runtimeRevision,digest:r.runtimeDigest});
    r.runtimeAuthority={...authority,principal:undefined,principalSha256:authority.principal?b14sha(authority.principal):null};
    const files=['tools/hr-source/tya-build-live-hr-source-safe-r20.mjs','tools/hr-source/tya-live-provider-registry-identity-dev.mjs'];
    r.readerBlobs=files.map(file=>{const current=git('rev-parse',productSourceSha+':'+file),served=git('rev-parse',runtimeSourceSha+':'+file);if(current!==served)throw Error('B14_RUNTIME_READER_SOURCE_DRIFT');return {path:file,gitBlob:current,runtimeSourceMatchesProductReader:true};});
    const book=b14WorkbookFromReaders(files.map(f=>fs.readFileSync(path.join(e.SOURCE_DIR,f),'utf8')),authority);r.workbook={resolved:book.resolved,reason:book.reason||null,idSha256:book.idSha256||null,authority:book.authority||null};
    stage='PROJECT_BINDING_METADATA';app=initializeApp({projectId:e.PROJECT,credential:applicationDefault()},'i3-b14-'+runId);db=getFirestore(app);
    const projectRef=db.doc('tenants/'+tenantId+'/projects/'+projectId);[projectBefore]=await db.getAll(projectRef,{fieldMask:projectMask});if(!projectBefore.exists)throw Error('B14_PROJECT_MISSING');
    const pr=projectBefore.data();if(pr.tenantId!==tenantId||pr.projectId&&pr.projectId!==projectId)throw Error('B14_PROJECT_SCOPE_MISMATCH');
    const candidates=b14IntegrationCandidates(pr);
    r.project={version:pr.version??null,exists:true,updateTime:projectBefore.updateTime.toDate().toISOString(),...b14ProjectSourceProjection(pr,{parentPresenceComplete:false})};
    for(const candidate of candidates)candidate.selected=candidate.source===r.project.sourceSelected;
    r.reconciliationLease=await b14ReconciliationLeaseReadOnly(db,tenantId,projectId,r.hrRevisionBefore);
    const col=db.collection('tenants/'+tenantId+'/integrationSettings'),byId=new Map();
    r.explicitIntegrationCandidates=candidates.map(x=>({source:x.source,referenceKind:x.kind,idHash:b14sha(x.id),sourceSelected:x.selected,validId:x.validId,scope:'CANDIDATE_REFERENCE_NOT_PROVEN_RUNTIME_RESOLUTION'}));
    for(const id of [...new Set(candidates.filter(x=>x.validId).map(x=>x.id))]){const [doc]=await db.getAll(col.doc(id),{fieldMask:integrationMask});byId.set(doc.id,doc);}
    const discovery=await Promise.allSettled([col.where('projectId','==',projectId).select(...integrationMask).limit(26).get(),col.where('projectIds','array-contains',projectId).select(...integrationMask).limit(26).get()]);
    r.integrationDiscovery=discovery.map(x=>x.status==='fulfilled'?{ok:true,count:x.value.size,complete:x.value.size<26}:{ok:false,error:b14DiagnosticError(x.reason)});
    for(const x of discovery)if(x.status==='fulfilled')for(const doc of x.value.docs)byId.set(doc.id,doc);integrationDocs=[...byId.values()];
    r.integrationMetadata=integrationDocs.map(doc=>({idHash:b14sha(doc.id),exists:doc.exists,explicitlyReferenced:candidates.some(x=>x.id===doc.id),selectedSourceReference:candidates.some(x=>x.id===doc.id&&x.selected),referenceKinds:candidates.filter(x=>x.id===doc.id).map(x=>x.source+'.'+x.kind),updateTime:doc.updateTime?.toDate().toISOString()||null,...b14BindingProjection(doc.data()||{},book.id,tenantId,projectId)}));
    const matching=r.integrationMetadata.filter(x=>x.selectedSourceReference&&x.scopeMatches&&x.workbookMatches===true);if(matching.length===1)r.bindingToReaderMatch='CANDIDATE_METADATA_MATCH_ONLY_RUNTIME_RESOLUTION_NOT_PROVEN';else if(matching.length>1)r.bindingToReaderMatch='AMBIGUOUS_CANDIDATE_METADATA_HOLD';
    if(!book.resolved){r.accessConclusion=book.reason;r.observationComplete=true;return;}
    if(!authority.principal){r.accessConclusion='EFFECTIVE_READER_IDENTITY_UNRESOLVED';return;}
    stage='READER_AUTHORIZATION';cloudClient=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();const cloudPrincipal=await b14PrincipalOf(cloudClient);
    const adc=await new GoogleAuth({scopes:B14_READ_SCOPES}).getClient(),adcPrincipal=await b14PrincipalOf(adc);r.adcPrincipalSha256=cloudPrincipal?b14sha(cloudPrincipal):null;r.adcMatchesRuntime=adcPrincipal===authority.principal;r.usesImpersonation=!r.adcMatchesRuntime;
    const client=r.usesImpersonation?new Impersonated({sourceClient:cloudClient,targetPrincipal:authority.principal,targetScopes:B14_READ_SCOPES,lifetime:600}):adc;
    stage='ISSUE_EXACT_READER_TOKEN';await client.getAccessToken();r.readerTokenIssued=true;r.requestedScopes=B14_READ_SCOPES;
    stage='PROVIDER_METADATA';const requests=await Promise.allSettled([
      getJson(client,'https://www.googleapis.com/drive/v3/about',{fields:'user(permissionId,emailAddress)'}),
      getJson(client,'https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(book.id),{supportsAllDrives:true,fields:'id,mimeType,trashed,version,modifiedTime,capabilities(canEdit,canModifyContent),contentRestrictions(readOnly)'}),
      getJson(client,'https://sheets.googleapis.com/v4/spreadsheets/'+encodeURIComponent(book.id),{includeGridData:false,fields:'spreadsheetId,sheets(properties(sheetId,title),protectedRanges(protectedRangeId,range,warningOnly,requestingUserCanEdit,unprotectedRanges))'})]);
    const [about,file,sheets]=requests.map(x=>x.status==='fulfilled'?x.value:null);r.providerMetadataRequests=requests.map((x,i)=>x.status==='fulfilled'?{provider:['drive_identity','drive_file','sheets_structure'][i],ok:true}:{provider:['drive_identity','drive_file','sheets_structure'][i],ok:false,error:b14DiagnosticError(x.reason)});
    r.principalMatchesRuntime=about?.user?.emailAddress===authority.principal;
    r.observedHrReaderIdentityLinked=r.principalMatchesRuntime&&r.observedHrAccessMode==='sheets_api_service_account';
    Object.assign(r,b14CapabilityVerdict({principalVerified:r.principalMatchesRuntime,file,sheets,sheetId:book.id}));
    r.driveMetadata=file?{mimeType:file.mimeType,trashed:file.trashed===true,version:file.version||null,modifiedTime:file.modifiedTime||null,contentRestrictions:(file.contentRestrictions||[]).map(x=>({readOnly:x.readOnly===true}))}:null;
    r.sheetsMetadata=sheets?{sheetCount:sheets.sheets?.length||0,sheets:(sheets.sheets||[]).map(x=>({sheetId:x.properties?.sheetId,titleSha256:b14sha(x.properties?.title||''),protectedRanges:(x.protectedRanges||[]).map(v=>({id:v.protectedRangeId,range:v.range||null,warningOnly:v.warningOnly===true,requestingUserCanEdit:typeof v.requestingUserCanEdit==='boolean'?v.requestingUserCanEdit:null,unprotectedRanges:v.unprotectedRanges||[]}))}))}:null;
    r.observationComplete=true;
  }catch(error){r.error={stage,...b14DiagnosticError(error)};r.accessConclusion=stage==='ISSUE_EXACT_READER_TOKEN'?'PROBE_READER_IMPERSONATION_OR_TOKEN_UNAVAILABLE':'PROBE_INCOMPLETE';if(/DRIFT$|SCOPE_MISMATCH$/.test(error?.message||''))drift=error;}
  finally{
    try{
      if(projectBefore&&db){const docs=[projectBefore,...integrationDocs],after=await db.getAll(...docs.map(x=>x.ref),{fieldMask:['id']});if(after.some((x,i)=>x.exists!==docs[i].exists||(x.exists&&!x.updateTime.isEqual(docs[i].updateTime))))throw Error('B14_BINDING_CHANGED_DURING_PROBE');r.bindingUnchanged=true;}
      const metaResponse=await fetch(endpoint+'&after='+Date.now(),{headers:{'Cache-Control':'no-cache, no-store'},signal:AbortSignal.timeout(30000)});const meta=await metaResponse.json();validateTerminalHrObservation(meta);r.hrRevisionAfter=meta.revision;if(!metaResponse.ok||meta.revision!==r.hrRevisionBefore)throw Error('B14_HR_REVISION_DRIFT');
      const service=JSON.parse(execFileSync('gcloud',['run','services','describe',e.SERVICE,'--project',e.PROJECT,'--region',e.REGION,'--format=json(status.latestReadyRevisionName,status.traffic)'],{encoding:'utf8'}));const active=(service.status?.traffic||[]).filter(x=>Number(x.percent)>0);if(service.status?.latestReadyRevisionName!==r.runtimeRevision||!active.length||active.some(x=>x.revisionName!==r.runtimeRevision)||active.reduce((n,x)=>n+Number(x.percent),0)!==100)throw Error('B14_RUNTIME_TRAFFIC_DRIFT');r.runtimeUnchanged=true;
      if(!cloudClient)cloudClient=await new GoogleAuth({scopes:['https://www.googleapis.com/auth/cloud-platform']}).getClient();
      const hosting=await getJson(cloudClient,'https://firebasehosting.googleapis.com/v1beta1/sites/'+encodeURIComponent(e.HOSTING_SITE)+'/channels/live',{fields:'release(version(name))'});if(hosting.release?.version?.name!==r.hostingVersion)throw Error('B14_HOSTING_DRIFT');r.hostingUnchanged=true;
    }catch(error){r.stabilityError=b14DiagnosticError(error);drift=error;}
    if(app)await deleteApp(app).catch(()=>{});r.observationComplete=r.observationComplete&&!r.stabilityError;r.b14Closed=false;r.providerAck=false;save();console.log(JSON.stringify({decision:r.decision,observationComplete:r.observationComplete,accessConclusion:r.accessConclusion,bindingToReaderMatch:r.bindingToReaderMatch,b14Closed:false,providerAck:false,production:false}));
    if(drift)throw Error('PROVIDER_FAILURE:B14_DIAGNOSTIC_STABILITY_UNVERIFIED');
  }
}

async function runOriginalReadOnly(args){
const [outDir,root,tenantId,projectId,runId]=args;
if(!outDir||!root||!tenantId||!projectId||!runId)throw Error('HR_ACK_PREFLIGHT_ARGS_REQUIRED');
fs.mkdirSync(outDir,{recursive:true});
const origin=root.replace(/\/+$/,'');
const endpoint=origin+'/api/'+encodeURIComponent(tenantId)+'/'+encodeURIComponent(projectId)+'/hr-live?format=meta&phaseapreflight='+encodeURIComponent(runId);
const pinned=/^[0-9a-f]{64}$/;
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function read(n,attempt){
  const url=endpoint+'&read='+n+'&attempt='+attempt;
  let response;
  for(let retry=1;retry<=3;retry++){
    try{response=await fetch(url,{headers:{'Cache-Control':'no-cache, no-store'},signal:AbortSignal.timeout(30000)});if(response.ok)break;}catch(e){if(retry===3)throw e;}
    if(retry===3)throw Error('HR_META_HTTP_'+(response?.status||'UNKNOWN'));
    await sleep(1000);
  }
  const data=await response.json();
  fs.writeFileSync(path.join(outDir,'hr-meta-'+n+'.json'),JSON.stringify(data,null,2)+'\n');
  return data;
}
function validOptionalReconciliation(row,revision){
  if(row==null)return true;
  return row?.providerAck===true&&row?.tenantId===tenantId&&row?.projectId===projectId&&row?.sourceRevision===revision;
}
function safeMeta(meta,revision){
  const s=meta?.shopperReconciliation,v=meta?.visitReconciliation;
  return meta?.ok===true&&meta?.revisionStable===true&&meta?.sourceSafe===true&&
    meta?.revision===revision&&meta?.writes===false&&meta?.hrWrites===false&&
    meta?.imports===false&&meta?.production===false&&
    validOptionalReconciliation(s,revision)&&validOptionalReconciliation(v,revision);
}
let revision='',passed=false,attempts=0,last=null;
for(let attempt=1;attempt<=8;attempt++){
  const a=await read(1,attempt),b=await read(2,attempt);
  if(!revision){revision=a.revision;if(!pinned.test(String(revision||'')))throw Error('HR_REVISION_INVALID');}
  if(a.revision!==revision||b.revision!==revision)throw Error('HR_REVISION_CHANGED_DURING_ACK_PREFLIGHT');
  attempts=attempt;last=[a,b];
  if(safeMeta(a,revision)&&safeMeta(b,revision)){passed=true;break;}
  if(attempt!==8)await sleep(5000);
}
const diagnostics={decision:passed?'PASS_HR_EXACT_REVISION_READ_ONLY':'HOLD_HR_EXACT_REVISION_READ_ONLY',
  revision,attempts,shopperAck:last?.[0]?.shopperReconciliation?.providerAck===true,
  visitAck:last?.[0]?.visitReconciliation?.providerAck===true,
  shopperReconciliationObserved:last?.[0]?.shopperReconciliation!=null,
  visitReconciliationObserved:last?.[0]?.visitReconciliation!=null,
  reconciliationRequiredForRead:false,tenantId,projectId,
  production:false,scriptWrites:false,hrWrites:false};
fs.writeFileSync(path.join(outDir,'hr-ack-preflight.json'),JSON.stringify(diagnostics,null,2)+'\n');
console.log(JSON.stringify(diagnostics));
if(!passed)throw Error('HR_READ_ONLY_META_TIMEOUT_SAME_REVISION');

}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 if(process.env.CXORBIA_I3_QA_SCOPE==='B14_CAPABILITY_ONLY')await runB14CapabilityOnly(process.argv.slice(2));
 else await runOriginalReadOnly(process.argv.slice(2));
}
