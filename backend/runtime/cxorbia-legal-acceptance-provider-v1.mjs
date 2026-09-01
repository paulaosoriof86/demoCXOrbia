import crypto from 'node:crypto';

export const LEGAL_PROVIDER_VERSION='cxorbia-legal-acceptance-provider-v1';
export const LEGAL_COMMAND_TYPE='legal.acceptance.record';
export const LEGAL_ACCEPTANCE_METHOD='human_ui';
export const LEGAL_AUDIT_VERSION='cxorbia-legal-acceptance-audit-v1';
export const LEGAL_WRITE_GATE='PAULA_REVIEW_REQUIRED_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_PROVIDER_WRITE_AND_ADMIN_NEW_SHOPPER_RESUME';

const str=v=>String(v==null?'':v).trim();
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const arr=v=>Array.isArray(v)?v:[];
const sha256=v=>crypto.createHash('sha256').update(String(v),'utf8').digest('hex');
const uniq=v=>[...new Set(v)];

function fail(code,details={}){
  const e=new Error(code);
  e.code=code;
  e.details=details;
  throw e;
}

export function normalizeScope(input){
  const v=obj(input);
  const scope={tenantId:str(v.tenantId),scopeMode:str(v.scopeMode),projectId:str(v.projectId),role:str(v.role),authNamespace:str(v.authNamespace)};
  const errors=[];
  if(!scope.tenantId)errors.push('LEGAL_TENANT_REQUIRED');
  if(!['tenant','project'].includes(scope.scopeMode))errors.push('LEGAL_SCOPE_MODE_INVALID');
  if(scope.scopeMode==='project'&&!scope.projectId)errors.push('LEGAL_PROJECT_REQUIRED');
  if(scope.scopeMode==='tenant'&&scope.projectId)errors.push('LEGAL_TENANT_SCOPE_PROJECT_MUST_BE_EMPTY');
  if(!scope.role)errors.push('LEGAL_ROLE_REQUIRED');
  if(!scope.authNamespace)errors.push('LEGAL_AUTH_NAMESPACE_REQUIRED');
  return Object.freeze({...scope,projectId:scope.scopeMode==='project'?scope.projectId:null,ok:errors.length===0,errors:Object.freeze(errors)});
}

export function normalizeCurrent(input){
  const v=obj(input);
  const current={legalContentId:str(v.legalContentId),legalVersion:str(v.legalVersion),contentDigest:str(v.contentDigest).toLowerCase()};
  const errors=[];
  if(!current.legalContentId)errors.push('LEGAL_CONTENT_ID_REQUIRED');
  if(!current.legalVersion)errors.push('LEGAL_VERSION_REQUIRED');
  if(!/^[a-f0-9]{64}$/.test(current.contentDigest))errors.push('LEGAL_CONTENT_DIGEST_SHA256_REQUIRED');
  return Object.freeze({...current,ok:errors.length===0,errors:Object.freeze(errors)});
}

export function normalizeVerifiedActor(decoded){
  const d=obj(decoded);
  const role=str(d.role||d.cxRole||d.userRole);
  const authNamespace=str(d.authNamespace||(role==='shopper'?'shopper':'staff'));
  const projectIds=uniq(arr(d.projectIds||d.projects).map(str).filter(Boolean));
  return Object.freeze({uid:str(d.uid||d.sub),tenantId:str(d.tenantId),role,authNamespace,projectIds:Object.freeze(projectIds),authenticated:Boolean(str(d.uid||d.sub))});
}

export function receiptIdFor({scope,actorUid,current}){
  const s=normalizeScope(scope),c=normalizeCurrent(current),uid=str(actorUid);
  if(!s.ok)fail('LEGAL_RECEIPT_SCOPE_INVALID',{errors:s.errors});
  if(!c.ok)fail('LEGAL_RECEIPT_CURRENT_INVALID',{errors:c.errors});
  if(!uid)fail('LEGAL_RECEIPT_ACTOR_UID_REQUIRED');
  const marker=s.scopeMode==='project'?s.projectId:'__tenant__';
  return sha256([s.tenantId,s.scopeMode,marker,s.authNamespace,uid,s.role,c.legalContentId,c.legalVersion].join('|'));
}

export function validateWriteGate(input){
  const g=obj(input),errors=[];
  if(g.enabled!==true)errors.push('LEGAL_WRITE_GATE_DISABLED');
  if(g.consumed===true)errors.push('LEGAL_WRITE_GATE_CONSUMED');
  if(g.providerWriteAuthorized!==true)errors.push('LEGAL_PROVIDER_WRITE_NOT_AUTHORIZED');
  if(str(g.targetProject)!=='cxorbia-backend-dev')errors.push('LEGAL_TARGET_PROJECT_INVALID');
  if(str(g.commandType)!==LEGAL_COMMAND_TYPE)errors.push('LEGAL_GATE_COMMAND_INVALID');
  if(Number(g.allowedExecutions)!==1)errors.push('LEGAL_GATE_EXECUTION_BUDGET_INVALID');
  if(Number(g.legalAcceptanceWrites)!==1)errors.push('LEGAL_GATE_ACCEPTANCE_WRITE_BUDGET_INVALID');
  if(Number(g.firestoreWrites)!==1)errors.push('LEGAL_GATE_FIRESTORE_WRITE_BUDGET_INVALID');
  if(Number(g.authWrites)!==0)errors.push('LEGAL_GATE_AUTH_WRITE_FORBIDDEN');
  if(Number(g.passwordResets)!==0)errors.push('LEGAL_GATE_PASSWORD_RESET_FORBIDDEN');
  if(Number(g.historicalCredentialAccess)!==0)errors.push('LEGAL_GATE_HISTORICAL_CREDENTIAL_ACCESS_FORBIDDEN');
  if(Number(g.historicalReconciliationWrites)!==0)errors.push('LEGAL_GATE_HISTORICAL_RECONCILIATION_FORBIDDEN');
  if(Number(g.otherIdentityWrites)!==0)errors.push('LEGAL_GATE_OTHER_IDENTITY_WRITE_FORBIDDEN');
  if(Number(g.hrWrites)!==0||Number(g.rulesWrites)!==0||Number(g.storageWrites)!==0||Number(g.makeWrites)!==0||Number(g.geminiCalls)!==0||Number(g.paymentWrites)!==0)errors.push('LEGAL_GATE_PROHIBITED_PROVIDER_BUDGET_NONZERO');
  if(g.automaticAcceptance!==false)errors.push('LEGAL_GATE_AUTOMATIC_ACCEPTANCE_FORBIDDEN');
  if(g.humanAcceptanceRequired!==true)errors.push('LEGAL_GATE_HUMAN_ACCEPTANCE_REQUIRED');
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors)});
}

function exactActorScope(actor,scope){
  const errors=[];
  if(!actor.authenticated||!actor.uid)errors.push('LEGAL_VERIFIED_ACTOR_REQUIRED');
  if(actor.tenantId!==scope.tenantId)errors.push('LEGAL_ACTOR_TENANT_MISMATCH');
  if(actor.role!==scope.role)errors.push('LEGAL_ACTOR_ROLE_MISMATCH');
  if(actor.authNamespace!==scope.authNamespace)errors.push('LEGAL_ACTOR_NAMESPACE_MISMATCH');
  if(scope.scopeMode==='project'&&actor.role!=='super'&&!actor.projectIds.includes(scope.projectId))errors.push('LEGAL_ACTOR_PROJECT_MISMATCH');
  return errors;
}

function validateClientCommand(command){
  const c=obj(command),p=obj(c.payload),errors=[];
  if(str(c.commandType)!==LEGAL_COMMAND_TYPE)errors.push('LEGAL_COMMAND_TYPE_INVALID');
  if(str(c.entityType)!=='legalAcceptance')errors.push('LEGAL_ENTITY_TYPE_INVALID');
  if(p.humanConfirmed!==true)errors.push('LEGAL_HUMAN_CONFIRMATION_REQUIRED');
  if(str(p.acceptanceMethod)!==LEGAL_ACCEPTANCE_METHOD)errors.push('LEGAL_ACCEPTANCE_METHOD_INVALID');
  if('actorUid' in p||'uid' in p||'subjectUid' in p)errors.push('LEGAL_CLIENT_ACTOR_UID_FORBIDDEN');
  if('acceptedAt' in p||'serverAcceptedAt' in p)errors.push('LEGAL_CLIENT_ACCEPTED_AT_FORBIDDEN');
  if(!str(c.idempotencyKey))errors.push('LEGAL_IDEMPOTENCY_KEY_REQUIRED');
  const actorRole=str(c.actor?.role||c.role);
  return {ok:errors.length===0,errors,scopeInput:{tenantId:str(c.tenantId),scopeMode:str(p.scopeMode),projectId:str(c.projectId),role:actorRole,authNamespace:str(p.authNamespace)},current:normalizeCurrent({legalContentId:p.legalContentId,legalVersion:p.legalVersion,contentDigest:p.contentDigest}),command:c,payload:p};
}

function refFor(db,path){
  if(!db||typeof db.doc!=='function')fail('LEGAL_FIRESTORE_DEPENDENCY_INVALID');
  return db.doc(path);
}

function normalizeDocSnapshot(snap){
  if(!snap||snap.exists!==true||typeof snap.data!=='function')return null;
  return obj(snap.data());
}

function validateProviderCurrent(content,version,scope,current){
  const errors=[];
  if(!content||!version){errors.push('LEGAL_CURRENT_PROVIDER_DOCUMENT_MISSING');return errors;}
  if(str(content.legalContentId||current.legalContentId)!==current.legalContentId)errors.push('LEGAL_PROVIDER_CONTENT_ID_MISMATCH');
  if(str(content.currentVersion)!==current.legalVersion)errors.push('LEGAL_PROVIDER_CURRENT_VERSION_MISMATCH');
  if(str(content.currentDigest).toLowerCase()!==current.contentDigest)errors.push('LEGAL_PROVIDER_CURRENT_DIGEST_MISMATCH');
  if(str(version.legalVersion||current.legalVersion)!==current.legalVersion)errors.push('LEGAL_PROVIDER_VERSION_ID_MISMATCH');
  if(str(version.contentDigest).toLowerCase()!==current.contentDigest)errors.push('LEGAL_PROVIDER_VERSION_DIGEST_MISMATCH');
  if(version.active===false)errors.push('LEGAL_PROVIDER_VERSION_INACTIVE');
  const roles=arr(version.roleApplicability||content.roleApplicability).map(str).filter(Boolean);
  if(roles.length&&!roles.includes(scope.role))errors.push('LEGAL_ROLE_NOT_APPLICABLE');
  const mode=str(version.scopeMode||content.scopeMode||scope.scopeMode);
  if(mode!==scope.scopeMode)errors.push('LEGAL_PROVIDER_SCOPE_MODE_MISMATCH');
  const projects=arr(version.projectApplicability||content.projectApplicability).map(str).filter(Boolean);
  if(scope.scopeMode==='project'&&projects.length&&!projects.includes(scope.projectId))errors.push('LEGAL_PROJECT_NOT_APPLICABLE');
  return errors;
}

function makeReceipt({scope,current,actor,acceptedAt}){
  return Object.freeze({tenantId:scope.tenantId,scopeMode:scope.scopeMode,...(scope.scopeMode==='project'?{projectId:scope.projectId}:{}),authNamespace:scope.authNamespace,actorUid:actor.uid,role:scope.role,legalContentId:current.legalContentId,legalVersion:current.legalVersion,contentDigest:current.contentDigest,acceptedAt,acceptanceMethod:LEGAL_ACCEPTANCE_METHOD,source:'authenticated_product_ui',status:'accepted',auditVersion:LEGAL_AUDIT_VERSION,subjectExact:true});
}

function receiptMatchesExact(receipt,expected){
  const r=obj(receipt),e=obj(expected);
  const keys=['tenantId','scopeMode','authNamespace','actorUid','role','legalContentId','legalVersion','contentDigest','acceptanceMethod','source','status','auditVersion'];
  if(e.scopeMode==='project'&&str(r.projectId)!==str(e.projectId))return false;
  return keys.every(k=>str(r[k])===str(e[k]))&&r.subjectExact===true&&Boolean(r.acceptedAt);
}

export function createLegalAcceptanceProvider(deps={}){
  const verifyIdToken=deps.verifyIdToken;
  const db=deps.firestore;
  const serverTimestamp=deps.serverTimestamp;
  if(typeof verifyIdToken!=='function')fail('LEGAL_VERIFY_ID_TOKEN_DEPENDENCY_INVALID');
  if(!db||typeof db.doc!=='function'||typeof db.runTransaction!=='function')fail('LEGAL_FIRESTORE_DEPENDENCY_INVALID');
  if(typeof serverTimestamp!=='function')fail('LEGAL_SERVER_TIMESTAMP_DEPENDENCY_INVALID');

  async function verifiedActor(idToken){
    if(!str(idToken))fail('LEGAL_ID_TOKEN_REQUIRED');
    return normalizeVerifiedActor(await verifyIdToken(idToken));
  }

  async function authoritativeDocuments(scope,current,reader=db){
    const contentPath=`tenants/${scope.tenantId}/legalContents/${current.legalContentId}`;
    const versionPath=`${contentPath}/versions/${current.legalVersion}`;
    const [contentSnap,versionSnap]=await Promise.all([reader.get?reader.get(refFor(db,contentPath)):refFor(db,contentPath).get(),reader.get?reader.get(refFor(db,versionPath)):refFor(db,versionPath).get()]);
    return {content:normalizeDocSnapshot(contentSnap),version:normalizeDocSnapshot(versionSnap),contentPath,versionPath};
  }

  async function readModel({idToken,scope:scopeInput,current:currentInput}){
    const scope=normalizeScope(scopeInput),current=normalizeCurrent(currentInput);
    const reasons=[];
    if(!scope.ok)reasons.push(...scope.errors);
    if(!current.ok)reasons.push(...current.errors);
    if(reasons.length)return Object.freeze({authority:'provider',ready:false,ambiguous:false,subjectExact:false,pending:true,reasons:Object.freeze(uniq(reasons)),acceptance:null});
    const actor=await verifiedActor(idToken);
    reasons.push(...exactActorScope(actor,scope));
    if(reasons.length)return Object.freeze({authority:'provider',ready:false,ambiguous:false,subjectExact:false,pending:true,reasons:Object.freeze(uniq(reasons)),acceptance:null});
    const docs=await authoritativeDocuments(scope,current);
    reasons.push(...validateProviderCurrent(docs.content,docs.version,scope,current));
    const receiptId=receiptIdFor({scope,actorUid:actor.uid,current});
    const receiptPath=`tenants/${scope.tenantId}/legalAcceptances/${receiptId}`;
    const receipt=normalizeDocSnapshot(await refFor(db,receiptPath).get());
    const expected=makeReceipt({scope,current,actor,acceptedAt:receipt?.acceptedAt||null});
    if(!receipt||!receiptMatchesExact(receipt,expected))reasons.push('LEGAL_ACCEPTANCE_MISSING_OR_MISMATCHED');
    return Object.freeze({authority:'provider',ready:true,ambiguous:false,subjectExact:reasons.length===0,tenantId:scope.tenantId,scopeMode:scope.scopeMode,projectId:scope.projectId,role:scope.role,authNamespace:scope.authNamespace,legalContentId:current.legalContentId,legalVersion:current.legalVersion,contentDigest:current.contentDigest,pending:reasons.length>0,reasons:Object.freeze(uniq(reasons)),acceptance:receipt?Object.freeze({...receipt}):null});
  }

  async function record({idToken,command,gate}){
    const gateCheck=validateWriteGate(gate);
    if(!gateCheck.ok)fail('LEGAL_WRITE_GATE_INVALID',{errors:gateCheck.errors});
    const checked=validateClientCommand(command);
    if(!checked.ok)fail('LEGAL_ACCEPTANCE_COMMAND_INVALID',{errors:checked.errors});
    const current=checked.current;
    if(!current.ok)fail('LEGAL_ACCEPTANCE_CURRENT_INVALID',{errors:current.errors});
    const actor=await verifiedActor(idToken);
    const scope=normalizeScope({...checked.scopeInput,authNamespace:checked.scopeInput.authNamespace||actor.authNamespace});
    if(!scope.ok)fail('LEGAL_ACCEPTANCE_SCOPE_INVALID',{errors:scope.errors});
    const actorErrors=exactActorScope(actor,scope);
    if(actorErrors.length)fail('LEGAL_ACCEPTANCE_ACTOR_SCOPE_INVALID',{errors:actorErrors});
    const receiptId=receiptIdFor({scope,actorUid:actor.uid,current});
    const receiptPath=`tenants/${scope.tenantId}/legalAcceptances/${receiptId}`;
    let idempotent=false;
    let receiptResult=null;

    await db.runTransaction(async tx=>{
      const docs=await authoritativeDocuments(scope,current,tx);
      const currentErrors=validateProviderCurrent(docs.content,docs.version,scope,current);
      if(currentErrors.length)fail('LEGAL_PROVIDER_CURRENT_INVALID',{errors:currentErrors});
      const receiptRef=refFor(db,receiptPath);
      const existing=normalizeDocSnapshot(await tx.get(receiptRef));
      const acceptedAt=serverTimestamp();
      const expected=makeReceipt({scope,current,actor,acceptedAt});
      if(existing){
        if(!receiptMatchesExact(existing,{...expected,acceptedAt:existing.acceptedAt}))fail('LEGAL_ACCEPTANCE_RECEIPT_CONFLICT');
        idempotent=true;
        receiptResult={...existing};
        return;
      }
      tx.create(receiptRef,expected);
      receiptResult={...expected};
    });

    return Object.freeze({ok:true,committed:true,providerAck:true,status:'committed',acceptanceStatus:'accepted',idempotent,tenantId:scope.tenantId,scopeMode:scope.scopeMode,projectId:scope.projectId,legalContentId:current.legalContentId,legalVersion:current.legalVersion,acceptedAt:receiptResult?.acceptedAt||null,receiptFingerprint:sha256(receiptId).slice(0,24),subjectExact:true,rawPassword:false,rawToken:false,actorUidReturned:false});
  }

  return Object.freeze({version:LEGAL_PROVIDER_VERSION,readModel,record});
}

export function sourceOnlyStatus(){
  return Object.freeze({version:LEGAL_PROVIDER_VERSION,sourceOnly:true,activated:false,providerCredentialsLoaded:false,providerReadsExecuted:0,providerWritesExecuted:0,legalAcceptanceWritesExecuted:0,automaticAcceptance:false,humanAcceptanceOnly:true,exactIdentityOnly:true,fuzzyMatching:false,clientActorUidForbidden:true,clientAcceptedAtForbidden:true,historicalCredentialAccess:0,passwordResets:0,historicalReconciliationWrites:0,deploys:0,merge:false,production:false,nextGate:LEGAL_WRITE_GATE});
}
