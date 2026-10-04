#!/usr/bin/env node
/* CXOrbia Recovery — durable shopper identity provider v1.
   Importing this module performs zero writes. Writes are possible only through an
   explicitly enabled provider policy and injected Firebase Admin Auth + Firestore.
   HR is read-only: this provider never writes to HR or any external source.
*/
import crypto from 'node:crypto';
import ShopperCredentialRule from '../../app/core/shopper-credential-rule.js';

export const VERSION='cxorbia-shopper-command-provider-v1';
export const COMMAND_TYPES=Object.freeze(['shopper.create','shopper.update','shopper.credential.reset','shopper.identity.adjudicate']);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);
export const CREDENTIAL_RULE_VERSION=ShopperCredentialRule.CREDENTIAL_RULE_VERSION;
export const DURABLE_CREDENTIAL_SWEEP_VERSION=ShopperCredentialRule.DURABLE_CREDENTIAL_SWEEP_VERSION;
export const CREDENTIAL_PASSWORD_PROOF_VERSION=ShopperCredentialRule.CREDENTIAL_PASSWORD_PROOF_VERSION;
export const shopperCredentialRule=ShopperCredentialRule.shopperCredentialRule;
const ACTIVE_IDENTITY_LINK_STATES=new Set(['active','confirmed','approved','materialized']);
const TRUSTED_IDENTITY_AUTHORITIES=new Set(['provider_exact','tenant_adjudication','platform_created','migrated_exact']);

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const sameArray=(a,b)=>JSON.stringify(uniq(a))===JSON.stringify(uniq(b));
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId||''}\0${command.idempotencyKey}`).slice(0,40);
const platformIdentitySourceKey=(tenantId,shopperId)=>`platform:${str(tenantId)}:${str(shopperId)}`;
const platformIdentityLinkId=(tenantId,sourceIdentityKey,shopperId)=>`irl_${sha(`${str(tenantId)}\0platform\0*\0${str(sourceIdentityKey)}\0${str(shopperId)}`).slice(0,32)}`;
const RAW_SECRET_KEY=/^(?:password|pass|newpassword|temporarypassword|credential|credentialvalue|secret|token|resettoken)$/i;
const PUBLIC_PROFILE_FIELDS=Object.freeze(['firstName','lastName','nombre','email','whatsapp','phone','pais','country','depto','ciudad','sexo','edad','estado','sourceRef','sourceType','perfilCompleto','honorarioPref','createdVia']);
const PROTECTED_PROFILE_FIELDS=Object.freeze(['dpi','documentId','banco','ctaTipo','ctaNum','ctaTitular','ctaMoneda','cuentaPago','ndaStatus']);
const HR_MANAGED_PROFILE_FIELDS=Object.freeze(['nombre','firstName','lastName','pais','country','shopperCode']);
const SELF_MANAGED_PUBLIC_FIELDS=Object.freeze(['email','whatsapp','phone','depto','ciudad','sexo','edad']);
const SELF_MANAGED_PROTECTED_FIELDS=Object.freeze(['dpi','documentId','banco','ctaTipo','ctaNum','ctaTitular','ctaMoneda','cuentaPago','ndaStatus']);

export const providerUidFingerprint=uid=>sha(`cxorbia-provider-uid-v1\0${str(uid)}`);
export const stableShopperUid=(tenantId,shopperId)=>`cx-sh-${sha(`${str(tenantId)}\0shopper\0${str(shopperId)}`).slice(0,28)}`;
const internalEmail=(tenantId,visibleLogin)=>`${sha(`${str(tenantId)}\0shopper\0${str(visibleLogin).toLowerCase()}`).slice(0,48)}@auth.cxorbia.invalid`;
const canonicalClaims=(shopperId,tenantId,projectIds)=>({authNamespace:'shopper',projectIds:uniq(projectIds),role:'shopper',shopperId:str(shopperId),tenantId:str(tenantId)});
const claimsDigest=claims=>sha(canonicalClaims(claims?.shopperId,claims?.tenantId,claims?.projectIds));
const pick=(input,keys)=>Object.fromEntries(keys.filter(key=>input&&input[key]!==undefined).map(key=>[key,input[key]]));
const publicProfile=input=>clean(pick(input||{},PUBLIC_PROFILE_FIELDS));
const protectedProfile=input=>clean(pick(input||{},PROTECTED_PROFILE_FIELDS));
const IDENTITY_TECHNICAL_KEYS=Object.freeze([
  'shopperId','legacyShopperId','legacyId','externalShopperId','externalId','sourceId','sourceKey',
  'hrRowId','personId','profileId','shopperDocId','sourceIdentityKey','sourceSubjectId'
]);
const IDENTITY_ALIAS_KEYS=Object.freeze(['exactAliases','identityAliases','aliases','sourceAliases','sourceIdentityAliases']);
const flattenTechnical=value=>{
  const out=[];
  const walk=v=>{
    if(v==null)return;
    if(Array.isArray(v)){v.forEach(walk);return;}
    if(typeof v==='object'){Object.values(v).forEach(walk);return;}
    const token=str(v);if(token)out.push(token);
  };
  walk(value);return out;
};
const identityLinkTokens=link=>uniq([
  link,link?.sourceIdentity,link?.identity,link?.crosswalk,link?.profile,link?.exactIdentityAnchors
].filter(Boolean).flatMap(container=>[
  ...IDENTITY_TECHNICAL_KEYS.flatMap(key=>flattenTechnical(container[key])),
  ...IDENTITY_ALIAS_KEYS.flatMap(key=>flattenTechnical(container[key]))
]));

async function exactShopperIdentityMap(db,tenantId,projectId,{directActiveShopperIds=new Set(),suppressedTenantAdjudications=new Set()}={}){
  const links=db.collection('tenants').doc(tenantId).collection('shopperIdentityLinks');
  if(typeof links.get!=='function')return new Map();
  const snap=await links.get();
  const map=new Map();
  for(const doc of arr(snap?.docs)){
    const link=doc.data()||{},status=str(link.status||link.state).toLowerCase();
    const authority=str(link.authorityType||link.authority?.type).toLowerCase();
    const authorityRef=str(link.authorityRef||link.authority?.evidenceRef||link.authority?.adjudicationId||link.authority?.providerRef||link.authority?.commandId||link.providerAckRef||link.adjudicationId||link.commandId||link.idempotencyKey||doc.id);
    const scope=str(link.projectScope||link.scope?.projectId||link.projectId||'*');
    const canonicalShopperId=str(link.canonicalShopperId||link.canonicalId||link.shopperId||link.profileId);
    const sourceSystem=str(link.sourceSystem||link.sourceNamespace||link.sourceType||link.sourceIdentity?.sourceSystem).toLowerCase();
    if(str(link.tenantId||link.scope?.tenantId)!==tenantId)continue;
    if(!ACTIVE_IDENTITY_LINK_STATES.has(status)||!TRUSTED_IDENTITY_AUTHORITIES.has(authority)||!authorityRef)continue;
    if(link.periodKey||link.periodId||link.periodScope)continue;
    if(scope!=='*'&&scope.toLowerCase()!=='tenant'&&scope!==projectId)continue;
    if(!canonicalShopperId||!sourceSystem.includes('hr'))continue;
    for(const token of identityLinkTokens(link)){
      /* VRM-168: a historical tenant adjudication cannot silently replace a currently
         active exact HR/Auth principal. Provider-exact links retain their stronger
         technical merge semantics; tenant adjudication remains usable when no exact
         active source principal exists. */
      if(authority==='tenant_adjudication'&&token!==canonicalShopperId&&directActiveShopperIds.has(token)){
        suppressedTenantAdjudications.add(token);
        continue;
      }
      const prior=map.get(token);
      if(prior&&prior!==canonicalShopperId)throw new Error('SHOPPER_IDENTITY_LINK_CONFLICT');
      map.set(token,canonicalShopperId);
    }
  }
  return map;
}

function blocked(command,code,extra={}){
  return {ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,providerWrites:0,tenantId:command?.tenantId||null,projectId:command?.projectId||null,periodId:command?.periodId||null,commandType:command?.commandType||null,entityId:command?.entityId||null,code,...extra};
}
function ack(command,shopperId,extra={}){
  return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,tenantId:command.tenantId,projectId:command.projectId,periodId:command.periodId||null,commandType:command.commandType,entityType:'shopper',entityId:shopperId,idempotencyKey:command.idempotencyKey,...extra};
}
function authNotFound(error){return str(error?.code)==='auth/user-not-found';}
function projectScope(snapshot){
  return {
    tenantId:str(snapshot?.tenantId||snapshot?.tenantConfig?.tenantId),
    projectId:str(snapshot?.projectId||snapshot?.projectConfig?.projectId)
  };
}
function containsRawSecret(value,depth=0){
  if(depth>8||value==null)return false;
  if(Array.isArray(value))return value.some(v=>containsRawSecret(v,depth+1));
  if(typeof value!=='object')return false;
  return Object.entries(value).some(([key,v])=>(RAW_SECRET_KEY.test(String(key))&&v!=null&&String(v)!=='')||containsRawSecret(v,depth+1));
}
export function validateProviderPolicy(policy={}){
  const errors=[];
  if(policy.schemaVersion!=='cxorbia.shopper-command-provider-policy.v1')errors.push('SHOPPER_POLICY_SCHEMA_INVALID');
  if(policy.enabled!==true)errors.push('SHOPPER_POLICY_DISABLED');
  if(!uniq(policy.allowedTenantIds).length)errors.push('SHOPPER_POLICY_TENANTS_REQUIRED');
  if(policy.hrWrites!==false||policy.externalWrites!==false||policy.fuzzyMatching!==false)errors.push('SHOPPER_POLICY_EXTERNAL_SIDE_EFFECTS_INVALID');
  return {ok:errors.length===0,errors};
}
function scopeAllowed(policy,tenantId,projectId){
  const tenants=new Set(uniq(policy.allowedTenantIds));
  const projects=new Set(uniq(policy.allowedProjectIds));
  return tenants.has(str(tenantId))&&(!projects.size||projects.has(str(projectId)));
}
function validateCommand(command={}){
  const errors=[];
  if(command.version!=='cxorbia-command-adapter-v1')errors.push('SHOPPER_COMMAND_VERSION_INVALID');
  if(!COMMAND_TYPES.includes(command.commandType))errors.push('SHOPPER_COMMAND_TYPE_INVALID');
  if(!str(command.tenantId)||!str(command.projectId)||!str(command.periodId))errors.push('SHOPPER_COMMAND_SCOPE_REQUIRED');
  if(!str(command.idempotencyKey))errors.push('SHOPPER_IDEMPOTENCY_REQUIRED');
  if(command.authorization?.providerEnforcementRequired!==true)errors.push('SHOPPER_PROVIDER_ENFORCEMENT_REQUIRED');
  if(command.commandType==='shopper.credential.reset'&&containsRawSecret(command.payload||{}))errors.push('SHOPPER_CREDENTIAL_SECRET_IN_COMMAND_PAYLOAD');
  if(command.commandType==='shopper.identity.adjudicate'){
    const canonical=str(command.entityId||command.payload?.canonicalShopperId),aliases=uniq(command.payload?.aliasShopperIds||command.payload?.exactAliases||[]).filter(x=>x!==canonical);
    if(!canonical)errors.push('SHOPPER_IDENTITY_CANONICAL_REQUIRED');
    if(!aliases.length)errors.push('SHOPPER_IDENTITY_ALIASES_REQUIRED');
    if(command.payload?.humanConfirmed!==true)errors.push('SHOPPER_IDENTITY_HUMAN_CONFIRMATION_REQUIRED');
  }
  return {ok:errors.length===0,errors};
}

async function exactActor(auth,db,token,command){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(str(decoded.tenantId)!==str(command.tenantId))throw new Error('SHOPPER_ACTOR_SCOPE_DENIED');
  const targetShopper=str(command.entityId||command.payload?.shopperId);
  const shopperSelfUpdate=command.commandType==='shopper.update'&&role==='shopper'&&namespace==='shopper';
  const staffOperator=OPERATOR_ROLES.includes(role)&&namespace==='staff';
  if(!staffOperator&&!shopperSelfUpdate)throw new Error('SHOPPER_ACTOR_SCOPE_DENIED');
  let canonicalSelfTarget=targetShopper;
  if(shopperSelfUpdate){
    if(str(command.authorization?.permission)!=='shopper.self.update')throw new Error('SHOPPER_SELF_UPDATE_PERMISSION_REQUIRED');
    const decodedShopper=str(decoded.shopperId);
    if(!targetShopper||!decodedShopper)throw new Error('SHOPPER_SELF_UPDATE_SCOPE_DENIED');
    if(decodedShopper!==targetShopper){
      const crossSnap=await db.collection('tenants').doc(command.tenantId).collection('shopperIdentityCrosswalk').doc(decodedShopper).get();
      const cross=crossSnap.exists?(crossSnap.data()||{}):{};
      canonicalSelfTarget=str(cross.shopperId||cross.canonicalShopperId);
      if(canonicalSelfTarget!==targetShopper)throw new Error('SHOPPER_SELF_UPDATE_SCOPE_DENIED');
    }
  }else if(str(command.authorization?.permission)==='shopper.self.update'){
    throw new Error('SHOPPER_SELF_UPDATE_STAFF_PERMISSION_INVALID');
  }
  if(role!=='super'&&!uniq(decoded.projectIds).includes(str(command.projectId)))throw new Error('SHOPPER_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(command.tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('SHOPPER_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(shopperSelfUpdate){
    const memberShopper=str(m.shopperId);
    if(m.active!==true||str(m.tenantId)!==str(command.tenantId)||str(m.role)!=='shopper'||str(m.authNamespace)!=='shopper'||memberShopper!==str(decoded.shopperId))throw new Error('SHOPPER_SELF_UPDATE_MEMBERSHIP_INVALID');
  }else if(m.active!==true||str(m.tenantId)!==str(command.tenantId)||str(m.role)!==role||str(m.authNamespace)!=='staff'){
    throw new Error('SHOPPER_ACTOR_MEMBERSHIP_INVALID');
  }
  if(role!=='super'&&!uniq(m.projectIds).includes(str(command.projectId)))throw new Error('SHOPPER_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  return {uid:decoded.uid,role,shopperId:shopperSelfUpdate?str(decoded.shopperId):null,canonicalShopperId:shopperSelfUpdate?canonicalSelfTarget:null,selfScoped:shopperSelfUpdate};
}

function stableShopperId(command){
  const payload=command?.payload||{},profile=payload.profile||{};
  const explicit=str(command?.entityId||payload.shopperId||payload.hrShopperId||profile.shopperId||profile.id||profile.legacyShopperId);
  if(explicit)return explicit;
  if(command?.commandType==='shopper.create'&&str(command?.tenantId)&&str(command?.projectId)&&str(command?.idempotencyKey)){
    return `shopper_manual_${sha(`${command.tenantId}\0${command.projectId}\0${command.idempotencyKey}`).slice(0,24)}`;
  }
  return '';
}
function technicalIdentityLabel(value,shopperId=''){
  const s=str(value),sid=str(shopperId);
  if(!s)return false;
  return /^shopper protegido$/i.test(s)||/^shopper_(?:gt|hn|sv|ni)_[a-z0-9]+$/i.test(s)||/^shp[-_][a-z0-9]+$/i.test(s)||(sid&&s===sid);
}
function credentialIdentityName(identityByShopperId,shopperId){
  const source=identityByShopperId instanceof Map?identityByShopperId.get(shopperId):identityByShopperId?.[shopperId];
  const name=str(source?.displayName||source?.nombre||source);
  return technicalIdentityLabel(name,shopperId)?'':name;
}
function sourceCandidate(row,scope,identityByShopperId){
  const shopperId=str(row?.shopperId||row?.id);
  if(!shopperId)return null;
  const source=identityByShopperId instanceof Map?identityByShopperId.get(shopperId):identityByShopperId?.[shopperId]||{};
  const rowName=str(row?.nombre||row?.shopper);
  const protectedName=technicalIdentityLabel(rowName,shopperId);
  const credentialName=protectedName?credentialIdentityName(identityByShopperId,shopperId):'';
  const phone=str(row?.whatsapp||row?.phone||row?.telefono||source?.whatsapp||source?.phone||source?.telefono);
  const email=str(row?.email||row?.mail||row?.correo||source?.email||source?.mail).toLowerCase();
  return clean({
    shopperId,
    tenantId:scope.tenantId,
    projectId:scope.projectId,
    shopperCode:str(row?.shopperCode),
    pais:str(row?.pais||row?.country||source?.country),
    country:str(row?.country||row?.pais||source?.country),
    sourceSafe:row?.sourceSafe===true,
    piiProtected:row?.piiProtected===true,
    nombre:credentialName||(protectedName?'':rowName)||(!technicalIdentityLabel(source?.displayName,shopperId)?str(source?.displayName):''),
    firstName:str(row?.firstName),
    lastName:str(row?.lastName||row?.apellido),
    whatsapp:phone,
    phone,
    email,
    sourceTab:str(row?.sourceTab),
    hrRowId:str(row?.hrRowId)
  });
}
export function shoppersFromSnapshot(snapshot={},options={}){
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('SHOPPER_HR_SNAPSHOT_UNSAFE');
  const scope=projectScope(snapshot);
  if(!scope.tenantId||!scope.projectId)throw new Error('SHOPPER_HR_SCOPE_MISSING');
  const byId=new Map();
  const ingest=row=>{
    const c=sourceCandidate(row,scope,options.identityByShopperId);if(!c)return;
    const prior=byId.get(c.shopperId)||{};
    byId.set(c.shopperId,{...prior,...Object.fromEntries(Object.entries(c).filter(([,v])=>v!==''&&v!==false)),sourceSafe:prior.sourceSafe===true||c.sourceSafe===true,piiProtected:prior.piiProtected===true||c.piiProtected===true});
  };
  for(const shopper of arr(snapshot.shoppers))ingest(shopper);
  for(const visit of arr(snapshot.visits))if(str(visit?.shopperId))ingest(visit);
  return {scope,shoppers:[...byId.values()].sort((a,b)=>a.shopperId.localeCompare(b.shopperId))};
}

function hrProfilePatch(candidate,projectIds,sourceRevision){
  const protectedName=technicalIdentityLabel(candidate.nombre,candidate.shopperId);
  const hrManaged=clean({
    shopperCode:candidate.shopperCode||null,
    pais:candidate.pais||candidate.country||null,
    country:candidate.country||candidate.pais||null,
    whatsapp:candidate.whatsapp||candidate.phone||null,
    phone:candidate.phone||candidate.whatsapp||null,
    email:candidate.email||null,
    sourceSafe:candidate.sourceSafe===true,
    piiProtected:candidate.piiProtected===true,
    sourceTab:candidate.sourceTab||null,
    hrRowId:candidate.hrRowId||null
  });
  const out={
    id:candidate.shopperId,
    shopperId:candidate.shopperId,
    tenantId:candidate.tenantId,
    projectIds:uniq(projectIds),
    sourceType:'hr_external',
    hrManaged,
    hrSourceRevision:sourceRevision,
    lastHrSyncedAt:now(),
    updatedAt:now()
  };
  if(candidate.shopperCode)out.shopperCode=candidate.shopperCode;
  if(candidate.pais||candidate.country){out.pais=candidate.pais||candidate.country;out.country=candidate.country||candidate.pais;}
  if(candidate.whatsapp||candidate.phone){out.whatsapp=candidate.whatsapp||candidate.phone;out.phone=candidate.phone||candidate.whatsapp;}
  if(candidate.email)out.email=candidate.email;
  if(candidate.nombre&&!protectedName)out.nombre=candidate.nombre;
  if(candidate.sourceShopperId&&candidate.sourceShopperId!==candidate.shopperId){
    out.sourceShopperIds=uniq([candidate.sourceShopperId]);
    out.exactAliases=uniq([candidate.sourceShopperId]);
  }
  return out;
}

async function membershipMatches(users,shopperId){
  const snap=await users.where('shopperId','==',shopperId).limit(8).get(),docs=arr(snap?.docs);
  const active=docs.filter(doc=>{const m=doc.data()||{},status=str(m.status).toLowerCase(),state=str(m.identityState).toLowerCase();return m.active===true&&!['inactive','superseded'].includes(status)&&state!=='superseded_exact_alias';});
  if(active.length>1)throw new Error('SHOPPER_MEMBERSHIP_DUPLICATE_IDENTITY');
  if(active.length===1)return active[0];
  const viable=docs.filter(doc=>{const m=doc.data()||{},status=str(m.status).toLowerCase(),state=str(m.identityState).toLowerCase();return !['inactive','superseded'].includes(status)&&state!=='superseded_exact_alias';});
  if(viable.length>1)throw new Error('SHOPPER_MEMBERSHIP_DUPLICATE_IDENTITY');
  return viable.length===1?viable[0]:(docs.length===1?docs[0]:null);
}
async function safeAuthByUid(auth,uid){try{return await auth.getUser(uid);}catch(error){if(authNotFound(error))return null;throw error;}}
async function safeAuthByEmail(auth,email){try{return await auth.getUserByEmail(email);}catch(error){if(authNotFound(error))return null;throw error;}}
function authPrincipalMatches(user,tenantId,shopperId,projectId){
  const c=user?.customClaims||{},role=str(c.role).toLowerCase(),namespace=str(c.authNamespace||(role==='shopper'?'shopper':'')).toLowerCase();
  const tenantMatch=str(c.tenantId)===tenantId||uniq(c.tenants).includes(tenantId);
  const projects=uniq([...(arr(c.projectIds)),c.projectId]);
  return tenantMatch&&str(c.shopperId)===shopperId&&role==='shopper'&&namespace==='shopper'&&projects.includes(projectId);
}
async function listAllAuthUsers(auth){
  if(!auth?.listUsers)throw new Error('SHOPPER_AUTH_IDENTITY_LOOKUP_UNAVAILABLE');
  const users=[];let pageToken;
  do{
    const page=await auth.listUsers(1000,pageToken);
    users.push(...arr(page?.users));
    pageToken=page?.pageToken;
  }while(pageToken);
  return users;
}
function selectExistingShopperAuthPrincipal(authUsers,tenantId,shopperId,projectId){
  const matches=arr(authUsers).filter(user=>authPrincipalMatches(user,tenantId,shopperId,projectId));
  const enabled=matches.filter(user=>user?.disabled!==true);
  if(enabled.length>1)throw new Error('SHOPPER_AUTH_PRINCIPAL_AMBIGUOUS');
  if(enabled.length===1)return enabled[0];
  if(matches.length)throw new Error('SHOPPER_AUTH_PRINCIPAL_DISABLED');
  return null;
}
async function existingShopperAuthPrincipal(auth,tenantId,shopperId,projectId,authUsers){
  const users=authUsers||await listAllAuthUsers(auth);
  return selectExistingShopperAuthPrincipal(users,tenantId,shopperId,projectId);
}
function assertAuthIdentity(user,tenantId,shopperId){
  const c=user?.customClaims||{};
  if(str(c.tenantId)&&str(c.tenantId)!==tenantId)throw new Error('SHOPPER_AUTH_TENANT_CONFLICT');
  if(str(c.shopperId)&&str(c.shopperId)!==shopperId)throw new Error('SHOPPER_AUTH_IDENTITY_CONFLICT');
  if(str(c.role)&&str(c.role)!=='shopper')throw new Error('SHOPPER_AUTH_ROLE_CONFLICT');
  if(str(c.authNamespace)&&str(c.authNamespace)!=='shopper')throw new Error('SHOPPER_AUTH_NAMESPACE_CONFLICT');
}

function exactAuthShopperHolder(user,tenantId){
  const claims=user?.customClaims||{},role=str(claims.role).toLowerCase(),namespace=str(claims.authNamespace||(role==='shopper'?'shopper':'')).toLowerCase();
  const tenantMatch=str(claims.tenantId)===tenantId||uniq(claims.tenants).includes(tenantId);
  return user?.disabled!==true&&tenantMatch&&role==='shopper'&&namespace==='shopper'&&!!str(claims.shopperId);
}
function deterministicCollisionLogin(baseLogin,tenantId,shopperId,length){
  return `${str(baseLogin).toLowerCase()}.${sha(`${str(tenantId)}\0${str(shopperId)}`).slice(0,length)}`;
}
function approvedCollisionLogin(baseLogin,tenantId,shopperId,visibleLogin){
  const login=str(visibleLogin).toLowerCase(),base=str(baseLogin).toLowerCase();
  if(!login||!base)return false;
  if(login===base)return true;
  return [4,6,8].some(length=>login===deterministicCollisionLogin(base,tenantId,shopperId,length));
}
async function resolveVisibleLogin({auth,tenantId,shopperId,uid,baseLogin,currentLogin,currentEmail,forceSuffix=false,untrustedBaseHolder=false}){
  const base=str(baseLogin).toLowerCase(),current=str(currentLogin).toLowerCase();
  if(!base)throw new Error('SHOPPER_CREDENTIAL_NAME_INCOMPLETE');
  if(untrustedBaseHolder)throw new Error('SHOPPER_VISIBLE_LOGIN_OCCUPANT_UNTRUSTED');
  if(current&&approvedCollisionLogin(base,tenantId,shopperId,current)&&str(currentEmail).toLowerCase()===internalEmail(tenantId,current).toLowerCase()){
    if(!forceSuffix||current!==base)return current;
  }
  if(!forceSuffix){
    const baseEmail=internalEmail(tenantId,base),holder=await safeAuthByEmail(auth,baseEmail);
    if(!holder||holder.uid===uid)return base;
    if(!exactAuthShopperHolder(holder,tenantId))throw new Error('SHOPPER_VISIBLE_LOGIN_OCCUPANT_UNTRUSTED');
  }
  for(const length of [4,6,8]){
    const login=deterministicCollisionLogin(base,tenantId,shopperId,length);
    const holder=await safeAuthByEmail(auth,internalEmail(tenantId,login));
    if(!holder||holder.uid===uid)return login;
  }
  throw new Error('SHOPPER_VISIBLE_LOGIN_SUFFIX_COLLISION');
}
function exactShopperMembership(member,tenantId,shopperId,projectId){
  return member?.active===true&&str(member.tenantId)===tenantId&&str(member.shopperId)===shopperId&&str(member.role)==='shopper'&&str(member.authNamespace)==='shopper'&&uniq(member.projectIds).includes(projectId);
}
async function activeExactShopperPrincipalIds({db,tenantId,projectId,authUsers}){
  const usersRef=db.collection('tenants').doc(tenantId).collection('users');
  const snap=await usersRef.get(),authByUid=new Map(arr(authUsers).map(user=>[str(user?.uid),user])),ids=new Set();
  for(const doc of arr(snap?.docs)){
    const member=doc.data()||{},shopperId=str(member.shopperId),user=authByUid.get(doc.id)||null;
    if(!shopperId||!exactShopperMembership(member,tenantId,shopperId,projectId))continue;
    if(!user||user.disabled===true||!authPrincipalMatches(user,tenantId,shopperId,projectId))continue;
    ids.add(shopperId);
  }
  return ids;
}
async function snapshotExactAliasPolicies({db,tenantId,projectId,shoppers,exactIdentityMap,authUsers}){
  const groups=new Map(),policies=new Map(),users=db.collection('tenants').doc(tenantId).collection('users');
  for(const source of shoppers){
    const sourceShopperId=str(source.shopperId),canonicalShopperId=str(exactIdentityMap.get(sourceShopperId)||sourceShopperId);
    if(!sourceShopperId||!canonicalShopperId||sourceShopperId===canonicalShopperId)continue;
    if(!groups.has(canonicalShopperId))groups.set(canonicalShopperId,new Set());
    groups.get(canonicalShopperId).add(sourceShopperId);
  }
  const authByUid=new Map(arr(authUsers).map(user=>[str(user?.uid),user]));
  for(const [canonicalShopperId,sourceSet] of groups){
    const sourceIds=[...sourceSet].sort();
    const canonicalMemberDoc=await membershipMatches(users,canonicalShopperId);
    const canonicalAuthMatches=arr(authUsers).filter(user=>authPrincipalMatches(user,tenantId,canonicalShopperId,projectId)&&user?.disabled!==true);
    if(canonicalAuthMatches.length>1)throw new Error('SHOPPER_EXACT_ALIAS_CANONICAL_AUTH_AMBIGUOUS');
    if(canonicalMemberDoc){
      const member=canonicalMemberDoc.data()||{},user=authByUid.get(canonicalMemberDoc.id)||null;
      if(!exactShopperMembership(member,tenantId,canonicalShopperId,projectId)||!user||user.disabled===true||!authPrincipalMatches(user,tenantId,canonicalShopperId,projectId))throw new Error('SHOPPER_EXACT_ALIAS_CANONICAL_PRINCIPAL_UNSAFE');
      for(const sourceShopperId of sourceIds)policies.set(sourceShopperId,{mode:'CANONICAL_KEEPER',canonicalShopperId,keeperUid:canonicalMemberDoc.id});
      continue;
    }
    if(canonicalAuthMatches.length)throw new Error('SHOPPER_EXACT_ALIAS_CANONICAL_PRINCIPAL_INCOMPLETE');
    const aliasPrincipals=[];
    for(const sourceShopperId of sourceIds){
      const memberDoc=await membershipMatches(users,sourceShopperId);
      if(!memberDoc)continue;
      const member=memberDoc.data()||{},user=authByUid.get(memberDoc.id)||null;
      if(!exactShopperMembership(member,tenantId,sourceShopperId,projectId)||!user||user.disabled===true||!authPrincipalMatches(user,tenantId,sourceShopperId,projectId))throw new Error('SHOPPER_EXACT_ALIAS_PRINCIPAL_UNSAFE');
      const visibleLogin=str(member.visibleLogin).toLowerCase(),credentialRuleVersion=str(member.credentialRuleVersion);
      const credentialBearing=!!visibleLogin||!!credentialRuleVersion||str(member.credentialState).toLowerCase()==='enrolled';
      aliasPrincipals.push({sourceShopperId,uid:memberDoc.id,credentialBearing});
    }
    if(!aliasPrincipals.length){
      for(const sourceShopperId of sourceIds)policies.set(sourceShopperId,{mode:'CREATE_CANONICAL',canonicalShopperId});
      continue;
    }
    const credentialBearing=aliasPrincipals.filter(item=>item.credentialBearing);
    if(credentialBearing.length>1)throw new Error('SHOPPER_EXACT_ALIAS_MULTIPLE_CREDENTIAL_BEARING_PRINCIPALS');
    const keeper=(credentialBearing[0]||[...aliasPrincipals].sort((a,b)=>a.sourceShopperId.localeCompare(b.sourceShopperId))[0]);
    for(const sourceShopperId of sourceIds)policies.set(sourceShopperId,{
      mode:sourceShopperId===keeper.sourceShopperId?'ALIAS_KEEPER':'ALIAS_RETIRE_AFTER_KEEPER',
      canonicalShopperId,keeperSourceShopperId:keeper.sourceShopperId,keeperUid:keeper.uid
    });
  }
  return policies;
}

function snapshotCollisionPolicies({shoppers,exactIdentityMap,authUsers,tenantId}){
  const groups=new Map(),policies=new Map();
  for(const source of shoppers){
    const credential=shopperCredentialRule(source);if(!credential.ok)continue;
    const canonicalShopperId=exactIdentityMap.get(source.shopperId)||source.shopperId;
    if(!groups.has(credential.login))groups.set(credential.login,new Set());
    groups.get(credential.login).add(canonicalShopperId);
  }
  for(const [baseLogin,ids] of groups){
    if(ids.size<2)continue;
    const baseEmail=internalEmail(tenantId,baseLogin);
    const holder=arr(authUsers).find(user=>user?.disabled!==true&&str(user?.email).toLowerCase()===baseEmail.toLowerCase())||null;
    if(holder&&!exactAuthShopperHolder(holder,tenantId)){
      for(const shopperId of ids)policies.set(shopperId,{baseLogin,forceSuffix:true,untrustedBaseHolder:true});
      continue;
    }
    const keeperShopperId=holder?str(holder.customClaims?.shopperId):'';
    for(const shopperId of ids){
      policies.set(shopperId,{baseLogin,forceSuffix:!holder||keeperShopperId!==shopperId,untrustedBaseHolder:false,keeperShopperId:keeperShopperId||null});
    }
  }
  return policies;
}

async function durableUpsert({auth,db,policy,candidate,sourceRevision,authUsers,collisionPolicy=null,aliasPolicy=null,repairStaleTenantAdjudicationCrosswalk=false}){
  const tenantId=str(candidate.tenantId),projectId=str(candidate.projectId),shopperId=str(candidate.shopperId),sourceShopperId=str(candidate.sourceShopperId||candidate.shopperId);
  if(!tenantId||!projectId||!shopperId||!sourceShopperId||!str(sourceRevision))throw new Error('SHOPPER_DURABLE_KEYS_REQUIRED');
  if(!scopeAllowed(policy,tenantId,projectId))throw new Error('SHOPPER_PROVIDER_SCOPE_DENIED');
  const tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users');
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(sourceShopperId);
  const canonicalMemberDoc=await membershipMatches(users,shopperId);
  const [crossBefore,profileBefore]=await Promise.all([crossRef.get(),profileRef.get()]);
  const existingCross=crossBefore.exists?crossBefore.data()||{}:{};
  const existingProfile=profileBefore.exists?profileBefore.data()||{}:{};
  const staleTenantAdjudicationCrosswalk=
    repairStaleTenantAdjudicationCrosswalk===true&&sourceShopperId===shopperId&&crossBefore.exists&&
    str(existingCross.tenantId)===tenantId&&str(existingCross.sourceStableKey||sourceShopperId)===sourceShopperId&&
    str(existingCross.shopperId)!==shopperId&&str(existingCross.sourceType).toLowerCase()==='hr_external'&&
    str(existingCross.identityMode).toLowerCase()==='provider_exact_identity_link'&&
    str(existingCross.migrationAuthorityType).toLowerCase()==='tenant_adjudication';
  let exactAliasSelfMap=false;
  if(crossBefore.exists){
    const crossTenantOk=str(existingCross.tenantId)===tenantId;
    const crossSourceOk=str(existingCross.sourceStableKey||sourceShopperId)===sourceShopperId;
    const crossIdentityMode=str(existingCross.identityMode).toLowerCase();
    exactAliasSelfMap=
      sourceShopperId!==shopperId&&profileBefore.exists&&crossTenantOk&&crossSourceOk&&
      str(existingCross.shopperId)===sourceShopperId&&str(existingCross.sourceType).toLowerCase()==='hr_external'&&
      ['stable_hr_shopper_id','exact_technical_keys_only'].includes(crossIdentityMode);
  }
  const aliasMemberDoc=exactAliasSelfMap?await membershipMatches(users,sourceShopperId):null;
  const recoveredPrincipal=canonicalMemberDoc?null:await existingShopperAuthPrincipal(auth,tenantId,shopperId,projectId,authUsers);
  const aliasUser=aliasMemberDoc?await safeAuthByUid(auth,aliasMemberDoc.id):null;
  const canonicalUser=canonicalMemberDoc?await safeAuthByUid(auth,canonicalMemberDoc.id):recoveredPrincipal;
  const dualPrincipalRetirement=!!(exactAliasSelfMap&&canonicalMemberDoc&&aliasMemberDoc&&canonicalMemberDoc.id!==aliasMemberDoc.id);
  if(dualPrincipalRetirement){
    const canonicalMember=canonicalMemberDoc.data()||{},aliasMember=aliasMemberDoc.data()||{};
    if(!exactShopperMembership(canonicalMember,tenantId,shopperId,projectId)||!canonicalUser||canonicalUser.disabled===true||!authPrincipalMatches(canonicalUser,tenantId,shopperId,projectId))throw new Error('SHOPPER_EXACT_ALIAS_CANONICAL_PRINCIPAL_UNSAFE');
    if(!exactShopperMembership(aliasMember,tenantId,sourceShopperId,projectId)||!aliasUser||aliasUser.disabled===true||!authPrincipalMatches(aliasUser,tenantId,sourceShopperId,projectId))throw new Error('SHOPPER_EXACT_ALIAS_PRINCIPAL_UNSAFE');
  }
  if(!canonicalMemberDoc&&!recoveredPrincipal&&aliasMemberDoc&&aliasPolicy?.mode==='ALIAS_RETIRE_AFTER_KEEPER')throw new Error('SHOPPER_EXACT_ALIAS_KEEPER_PENDING');
  const aliasPrincipalMigration=!canonicalMemberDoc&&!recoveredPrincipal&&!!aliasMemberDoc&&!!aliasUser&&authPrincipalMatches(aliasUser,tenantId,sourceShopperId,projectId)&&aliasPolicy?.mode!=='ALIAS_RETIRE_AFTER_KEEPER';
  const existingMemberDoc=canonicalMemberDoc||(aliasPrincipalMigration?aliasMemberDoc:null);
  const existingMember=existingMemberDoc?.data?.()||{};
  const uid=canonicalMemberDoc?.id||recoveredPrincipal?.uid||(aliasPrincipalMigration?aliasMemberDoc.id:null)||stableShopperUid(tenantId,shopperId);
  const memberRef=users.doc(uid),aliasMemberRef=dualPrincipalRetirement?users.doc(aliasMemberDoc.id):null;
  let user=aliasPrincipalMigration?aliasUser:(canonicalUser||await safeAuthByUid(auth,uid)),authCreated=false,credentialNormalized=false,aliasAuthRetired=false;
  const exactExistingMember=!!existingMemberDoc&&existingMember.active===true&&str(existingMember.tenantId)===tenantId&&str(existingMember.shopperId)===(aliasPrincipalMigration?sourceShopperId:shopperId)&&str(existingMember.role)==='shopper'&&str(existingMember.authNamespace)==='shopper'&&uniq(existingMember.projectIds).includes(projectId);
  const exactExistingPrincipal=exactExistingMember&&!!user&&authPrincipalMatches(user,tenantId,aliasPrincipalMigration?sourceShopperId:shopperId,projectId);

  const candidateName=technicalIdentityLabel(candidate.nombre,candidate.shopperId)?'':str(candidate.nombre);
  const credential=shopperCredentialRule({
    ...existingProfile,...candidate,
    nombre:candidateName||str(existingProfile.nombre),
    firstName:str(candidate.firstName||existingProfile.firstName),
    lastName:str(candidate.lastName||existingProfile.lastName||existingProfile.apellido)
  });
  if(!credential.ok&&!exactExistingPrincipal)throw new Error(credential.reason);

  if(crossBefore.exists){
    const crossTenantOk=str(existingCross.tenantId)===tenantId;
    const crossSourceOk=str(existingCross.sourceStableKey||sourceShopperId)===sourceShopperId;
    if(!exactAliasSelfMap&&!staleTenantAdjudicationCrosswalk&&(!crossTenantOk||str(existingCross.shopperId)!==shopperId||!crossSourceOk))throw new Error('SHOPPER_CROSSWALK_SCOPE_CONFLICT');
    if(!exactAliasSelfMap&&!staleTenantAdjudicationCrosswalk&&str(existingCross.providerUidFingerprint)&&str(existingCross.providerUidFingerprint)!==providerUidFingerprint(uid))throw new Error('SHOPPER_CROSSWALK_UID_CONFLICT');
  }

  let visibleLogin=str(existingMember.visibleLogin||existingProfile.visibleLogin||existingProfile.username||existingProfile.user).toLowerCase();
  let email=visibleLogin?internalEmail(tenantId,visibleLogin):str(user?.email).toLowerCase();
  if(credential.ok){
    visibleLogin=await resolveVisibleLogin({
      auth,tenantId,shopperId,uid,baseLogin:credential.login,
      currentLogin:visibleLogin,currentEmail:str(user?.email),
      forceSuffix:collisionPolicy?.forceSuffix===true,
      untrustedBaseHolder:collisionPolicy?.untrustedBaseHolder===true
    });
    email=internalEmail(tenantId,visibleLogin);
  }

  if(!user){
    if(existingMemberDoc||(!exactAliasSelfMap&&crossBefore.exists)||recoveredPrincipal)throw new Error('SHOPPER_DURABLE_IDENTITY_AUTH_MISSING');
    if(!credential.ok)throw new Error(credential.reason);
    const byEmail=await safeAuthByEmail(auth,email);
    if(byEmail&&byEmail.uid!==uid)throw new Error('SHOPPER_AUTH_EMAIL_CONFLICT');
    if(byEmail)user=byEmail;
    else{
      user=await auth.createUser({uid,email,password:credential.password,disabled:false});
      authCreated=true;
      credentialNormalized=true;
    }
  }
  assertAuthIdentity(user,tenantId,aliasPrincipalMigration?sourceShopperId:shopperId);

  if(credential.ok){
    const currentRule=str(existingMember.credentialRuleVersion||existingProfile.credentialRuleVersion);
    const currentLogin=str(existingMember.visibleLogin||existingProfile.visibleLogin||existingProfile.username||existingProfile.user).toLowerCase();
    const emailMatch=str(user.email).toLowerCase()===email.toLowerCase();
    if(!authCreated&&(currentRule!==CREDENTIAL_RULE_VERSION||currentLogin!==visibleLogin||!emailMatch)){
      if(!auth?.updateUser)throw new Error('SHOPPER_CREDENTIAL_AUTH_UPDATE_UNAVAILABLE');
      user=await auth.updateUser(uid,{email,password:credential.password,disabled:false});
      credentialNormalized=true;
    }
  }

  const currentClaims=user.customClaims||{},projectIds=uniq([...(currentClaims.projectIds||[]),...(existingMember.projectIds||[]),...(existingCross.projectIds||[]),...(existingProfile.projectIds||[]),...(dualPrincipalRetirement?(aliasMemberDoc.data()?.projectIds||[]):[]),projectId]);
  const claims=canonicalClaims(shopperId,tenantId,projectIds);
  if(claimsDigest(currentClaims)!==claimsDigest(claims))await auth.setCustomUserClaims(uid,claims);
  if(dualPrincipalRetirement){
    if(!auth?.updateUser)throw new Error('SHOPPER_EXACT_ALIAS_AUTH_RETIRE_UNAVAILABLE');
    const retired=await auth.updateUser(aliasMemberDoc.id,{disabled:true});
    if(retired?.disabled!==true)throw new Error('SHOPPER_EXACT_ALIAS_AUTH_RETIRE_FAILED');
    aliasAuthRetired=true;
  }

  const outcome=await db.runTransaction(async tx=>{
    const [profileSnap,memberSnap,crossSnap]=await Promise.all([tx.get(profileRef),tx.get(memberRef),tx.get(crossRef)]);
    const aliasMemberSnap=dualPrincipalRetirement?await tx.get(aliasMemberRef):null;
    const profile=profileSnap.exists?profileSnap.data()||{}:{};
    const member=memberSnap.exists?memberSnap.data()||{}:{};
    const cross=crossSnap.exists?crossSnap.data()||{}:{};
    const aliasMember=aliasMemberSnap?.exists?aliasMemberSnap.data()||{}:{};
    if(profileSnap.exists&&(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId))throw new Error('SHOPPER_PROFILE_SCOPE_CONFLICT');
    if(memberSnap.exists&&(str(member.tenantId)!==tenantId||![shopperId,...(aliasPrincipalMigration?[sourceShopperId]:[])].includes(str(member.shopperId))||str(member.role)!=='shopper'||str(member.authNamespace)!=='shopper'))throw new Error('SHOPPER_MEMBERSHIP_CONFLICT');
    if(dualPrincipalRetirement&&(!aliasMemberSnap?.exists||!exactShopperMembership(aliasMember,tenantId,sourceShopperId,projectId)))throw new Error('SHOPPER_EXACT_ALIAS_RETIRE_READBACK_CONFLICT');
    const txCrossTenantOk=str(cross.tenantId)===tenantId;
    const txCrossSourceOk=str(cross.sourceStableKey||sourceShopperId)===sourceShopperId;
    const txCrossMode=str(cross.identityMode).toLowerCase();
    const txExactAliasSelfMap=crossSnap.exists&&sourceShopperId!==shopperId&&profileSnap.exists&&txCrossTenantOk&&txCrossSourceOk&&str(cross.shopperId)===sourceShopperId&&str(cross.sourceType).toLowerCase()==='hr_external'&&['stable_hr_shopper_id','exact_technical_keys_only'].includes(txCrossMode);
    const txStaleTenantAdjudicationCrosswalk=
      repairStaleTenantAdjudicationCrosswalk===true&&sourceShopperId===shopperId&&crossSnap.exists&&txCrossTenantOk&&txCrossSourceOk&&
      str(cross.shopperId)!==shopperId&&str(cross.sourceType).toLowerCase()==='hr_external'&&
      txCrossMode==='provider_exact_identity_link'&&str(cross.migrationAuthorityType).toLowerCase()==='tenant_adjudication';
    if(crossSnap.exists&&!txExactAliasSelfMap&&!txStaleTenantAdjudicationCrosswalk&&(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==providerUidFingerprint(uid)))throw new Error('SHOPPER_CROSSWALK_CONFLICT');
    const unionProjects=uniq([...(profile.projectIds||[]),...(member.projectIds||[]),...(cross.projectIds||[]),...projectIds,projectId]);
    const credentialCurrent=!credential.ok||(str(member.credentialRuleVersion)===CREDENTIAL_RULE_VERSION&&str(member.visibleLogin).toLowerCase()===visibleLogin&&str(member.credentialSweepVersion)===DURABLE_CREDENTIAL_SWEEP_VERSION&&str(member.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION&&str(member.credentialPasswordRuleVersion)===CREDENTIAL_RULE_VERSION&&str(profile.credentialRuleVersion)===CREDENTIAL_RULE_VERSION&&str(profile.username||profile.user||profile.visibleLogin).toLowerCase()===visibleLogin&&str(profile.credentialSweepVersion)===DURABLE_CREDENTIAL_SWEEP_VERSION&&str(profile.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION&&str(profile.credentialPasswordRuleVersion)===CREDENTIAL_RULE_VERSION);
    const crossCurrent=crossSnap.exists&&!txExactAliasSelfMap&&str(cross.shopperId)===shopperId&&str(cross.providerUidFingerprint)===providerUidFingerprint(uid);
    /* PRE-I4 cumulative anti-regression: same HR revision is not sufficient for idempotent replay
       when an exact tenant-adjudicated alias has already polluted the canonical display name.
       The current durable identity fields are part of the idempotency predicate so a stale alias
       is repaired once, then subsequent same-revision replays become true no-ops. */
    const tenantAdjudicatedAlias=
      sourceShopperId!==shopperId&&
      str(profile.identityAuthority).toLowerCase()==='tenant_adjudication'&&
      !!str(profile.identityAuthorityRef);
    const adjudicatedFirst=str(profile.firstName);
    const adjudicatedLast=str(profile.lastName||profile.apellido);
    const adjudicatedName=str([adjudicatedFirst,adjudicatedLast].filter(Boolean).join(' ')||profile.nombre);
    const adjudicatedIdentityCurrent=!tenantAdjudicatedAlias||!adjudicatedName||str(profile.nombre)===adjudicatedName;
    const alreadyCurrent=profileSnap.exists&&memberSnap.exists&&crossCurrent&&str(profile.hrSourceRevision)===sourceRevision&&sameArray(profile.projectIds,unionProjects)&&sameArray(member.projectIds,unionProjects)&&sameArray(cross.projectIds,unionProjects)&&str(member.providerUidFingerprint)===providerUidFingerprint(uid)&&credentialCurrent&&adjudicatedIdentityCurrent;
    if(alreadyCurrent)return {providerWrites:credentialNormalized?1:0,idempotentReplay:!credentialNormalized,projectIds:unionProjects,credentialNormalized,credentialRuleApplied:credential.ok,aliasMigrated:false};
    const profilePatch=hrProfilePatch(candidate,unionProjects,sourceRevision);
    profilePatch.sourceShopperIds=uniq([...(profile.sourceShopperIds||[]),...(profilePatch.sourceShopperIds||[])]);
    profilePatch.exactAliases=uniq([...(profile.exactAliases||[]),...(profilePatch.exactAliases||[])]);
    const selfManagedFields=uniq(profile.selfManagedFields||[]);
    selfManagedFields.forEach(key=>{if(Object.prototype.hasOwnProperty.call(profile,key))delete profilePatch[key];});
    if(credential.ok){
      profilePatch.firstName=credential.firstName;
      profilePatch.lastName=credential.lastName;
      profilePatch.visibleLogin=visibleLogin;
      profilePatch.username=visibleLogin;
      profilePatch.user=visibleLogin;
      profilePatch.credentialRuleVersion=CREDENTIAL_RULE_VERSION;
      profilePatch.credentialSweepVersion=DURABLE_CREDENTIAL_SWEEP_VERSION;
      profilePatch.credentialPasswordProofVersion=CREDENTIAL_PASSWORD_PROOF_VERSION;
      profilePatch.credentialPasswordRuleVersion=CREDENTIAL_RULE_VERSION;
      if(visibleLogin!==credential.login)profilePatch.credentialDisambiguationPolicy='deterministic_technical_suffix';
    }
    /* PRE-I4 ADMIN-003 — exact tenant adjudication outranks an HR alias display name.
       HR continues to own operational fields, but an exact alias (sourceShopperId != canonical)
       must never rewrite the canonical person's adjudicated human name. This prevents a fresh HR
       reconciliation from turning canonical Milton back into the historical invalid Mishael label. */
    if(tenantAdjudicatedAlias){
      if(adjudicatedFirst)profilePatch.firstName=adjudicatedFirst;
      if(adjudicatedLast)profilePatch.lastName=adjudicatedLast;
      if(adjudicatedName&&!technicalIdentityLabel(adjudicatedName,shopperId))profilePatch.nombre=adjudicatedName;
    }
    const membership={active:true,tenantId,role:'shopper',authNamespace:'shopper',shopperId,projectIds:unionProjects,providerUidFingerprint:providerUidFingerprint(uid),claimsDigest:claimsDigest(canonicalClaims(shopperId,tenantId,unionProjects)),membershipVersion:'cxorbia-shopper-membership-v1',...(credential.ok?{visibleLogin,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialState:'enrolled',credentialSweepVersion:DURABLE_CREDENTIAL_SWEEP_VERSION,credentialPasswordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,credentialPasswordRuleVersion:CREDENTIAL_RULE_VERSION,...(visibleLogin!==credential.login?{credentialDisambiguationPolicy:'deterministic_technical_suffix'}:{})}:{}),updatedAt:now()};
    const crosswalk={tenantId,shopperId,projectIds:unionProjects,authNamespace:'shopper',providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:sourceShopperId,identityMode:sourceShopperId===shopperId?'stable_hr_shopper_id':'provider_exact_identity_link',fuzzyMatching:false,sourceType:'hr_external',updatedAt:now()};
    if(txStaleTenantAdjudicationCrosswalk)Object.assign(crosswalk,{
      migrationAuthorityType:null,migrationAuthorityRef:null,migratedFromShopperId:null,
      identityRepairAuthority:'live_hr_exact_active_principal'
    });
    tx.set(profileRef,profilePatch,{merge:true});
    tx.set(memberRef,membership,{merge:true});
    tx.set(crossRef,crosswalk,{merge:true});
    if(dualPrincipalRetirement)tx.set(aliasMemberRef,{
      active:false,status:'superseded',identityState:'superseded_exact_alias',
      supersededByShopperId:shopperId,supersededByUidFingerprint:providerUidFingerprint(uid),
      supersededAt:now(),updatedAt:now()
    },{merge:true});
    return {providerWrites:3+(credentialNormalized?1:0)+(dualPrincipalRetirement?2:0),idempotentReplay:false,projectIds:unionProjects,credentialNormalized,credentialRuleApplied:credential.ok,aliasMigrated:txExactAliasSelfMap,aliasPrincipalRetired:dualPrincipalRetirement,aliasAuthRetired,staleTenantAdjudicationCrosswalkRepaired:txStaleTenantAdjudicationCrosswalk};
  });
  return {shopperId,sourceShopperId,uid,authCreated,visibleLogin:visibleLogin||null,aliasPrincipalMigrated:aliasPrincipalMigration,...outcome};
}

async function persistManualProfile({db,command,shopperId,uid,projectIds}){
  const tenantId=str(command.tenantId),projectId=str(command.projectId),tenant=db.collection('tenants').doc(tenantId);
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(shopperId);
  const sourceIdentityKey=platformIdentitySourceKey(tenantId,shopperId);
  const identityLinkId=platformIdentityLinkId(tenantId,sourceIdentityKey,shopperId);
  const linkRef=tenant.collection('shopperIdentityLinks').doc(identityLinkId);
  const raw=command.payload?.profile||{};
  const pub=publicProfile(raw),prot=protectedProfile(command.payload?.protectedProfile||raw);
  const nombre=str(pub.nombre||[pub.firstName,pub.lastName].filter(Boolean).join(' '));
  const credential=shopperCredentialRule({...pub,nombre});
  const patch=clean({...pub,...prot,id:shopperId,shopperId,tenantId,projectIds:uniq(projectIds),sourceType:'platform',sourceIdentityKey,createdVia:str(pub.createdVia||raw.via||'manual')||'manual',code:str(raw.code||shopperId),hrSourceRevision:null,lastHrSyncedAt:null,updatedAt:now()});
  if(nombre)patch.nombre=nombre;
  if(credential.ok){patch.firstName=credential.firstName;patch.lastName=credential.lastName;patch.visibleLogin=credential.login;patch.username=credential.login;patch.user=credential.login;patch.credentialRuleVersion=CREDENTIAL_RULE_VERSION;}
  const authorityRef=receiptId(command),uidFingerprint=providerUidFingerprint(uid),stamp=now();
  const identityLink={
    identityLinkId,tenantId,canonicalShopperId:shopperId,sourceSystem:'platform',projectScope:'*',
    sourceIdentityKey,sourceAliases:[sourceIdentityKey,shopperId],status:'active',
    authorityType:'platform_created',authorityRef,periodIndependent:true,providerAck:true,
    providerUidFingerprint:uidFingerprint,sourceSafe:true,createdBy:'shopper.create',updatedAt:stamp
  };
  await db.runTransaction(async tx=>{
    const [profileSnap,crossSnap,linkSnap]=await Promise.all([tx.get(profileRef),tx.get(crossRef),tx.get(linkRef)]);
    if(!profileSnap.exists||!crossSnap.exists)throw new Error('SHOPPER_MANUAL_DURABLE_IDENTITY_INCOMPLETE');
    const profile=profileSnap.data()||{},cross=crossSnap.data()||{},link=linkSnap.exists?(linkSnap.data()||{}):null;
    if(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId)throw new Error('SHOPPER_PROFILE_SCOPE_CONFLICT');
    if(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==uidFingerprint)throw new Error('SHOPPER_CROSSWALK_CONFLICT');
    if(link&&(
      str(link.tenantId)!==tenantId||
      str(link.canonicalShopperId)!==shopperId||
      str(link.sourceSystem).toLowerCase()!=='platform'||
      str(link.sourceIdentityKey)!==sourceIdentityKey||
      str(link.authorityType).toLowerCase()!=='platform_created'||
      str(link.authorityRef)!==authorityRef||
      link.periodIndependent!==true||
      str(link.providerUidFingerprint)!==uidFingerprint
    ))throw new Error('SHOPPER_PLATFORM_IDENTITY_LINK_CONFLICT');
    tx.set(profileRef,patch,{merge:true});
    tx.set(crossRef,{sourceType:'platform',identityMode:'stable_platform_shopper_id',updatedAt:stamp},{merge:true});
    tx.set(linkRef,link?{...identityLink,createdAt:link.createdAt||stamp}: {...identityLink,createdAt:stamp},{merge:true});
  });
  return {providerWrites:3,identityLinkId,sourceIdentityKey,platformCreatedAuthority:true};
}

function changedHrManagedFields(existing,patch){
  if(str(existing?.sourceType)!=='hr_external')return [];
  return HR_MANAGED_PROFILE_FIELDS.filter(key=>patch[key]!==undefined&&str(patch[key])!==str(existing?.[key]));
}
const ADJUDICATION_OWNER_FIELDS=Object.freeze([
  'shopperId','assignedShopperId','assignedToShopperId','auditorId','profileId','applicantShopperId',
  'ownerShopperId','targetShopperId','beneficiaryShopperId','liquidationShopperId','reservationShopperId'
]);
const ADJUDICATION_OWNER_ARRAY_FIELDS=Object.freeze(['shopperIds','candidateShopperIds']);
const ADJUDICATION_DOMAIN_COLLECTIONS=Object.freeze([
  ['tenant','paymentReconciliations'],['tenant','reviewQueue'],
  ['project','certifications'],['project','liquidations'],['project','postulations'],['project','reservations'],['project','visits']
]);
const ADJUDICATION_PROFILE_IDENTITY_FIELDS=new Set([
  'id','shopperId','canonicalShopperId','tenantId','sourceType','hrSourceRevision','lastHrSyncedAt','hrManaged',
  'sourceIdentityKey','identityState','supersededByShopperId','supersededAt','providerUidFingerprint',
  'sourceShopperIds','exactAliases','identityAliases','aliases','legacyLiveShopperIds','canonicalLegacyIds'
]);
const emptyProfileValue=v=>v==null||v===''||(Array.isArray(v)&&v.length===0);
function adjudicationProfilePatch(canonical,aliases,keeperMember,authorityRef,canonicalShopperId,aliasIds,projectIds){
  const patch={};
  for(const alias of aliases){
    for(const [key,value] of Object.entries(alias||{})){
      if(ADJUDICATION_PROFILE_IDENTITY_FIELDS.has(key)||HR_MANAGED_PROFILE_FIELDS.includes(key))continue;
      if(Array.isArray(value)){
        if(!value.length)continue;
        if(Array.isArray(canonical?.[key]))patch[key]=uniq([...(patch[key]||canonical[key]),...value]);
        else if(emptyProfileValue(canonical?.[key])&&!patch[key])patch[key]=clean(value);
      }else if(emptyProfileValue(canonical?.[key])&&emptyProfileValue(patch[key])&&!emptyProfileValue(value))patch[key]=clean(value);
    }
  }
  const keeperLogin=str(keeperMember?.visibleLogin).toLowerCase();
  if(keeperLogin){patch.visibleLogin=keeperLogin;patch.username=keeperLogin;patch.user=keeperLogin;}
  for(const key of ['credentialState','credentialVersion','credentialRuleVersion','credentialSweepVersion','credentialPasswordProofVersion','credentialPasswordRuleVersion']){
    const value=keeperMember?.[key];if(value!==undefined&&value!==null&&value!=='')patch[key]=value;
  }
  patch.id=canonicalShopperId;patch.shopperId=canonicalShopperId;patch.tenantId=str(canonical?.tenantId);patch.projectIds=uniq(projectIds);
  patch.sourceShopperIds=uniq([...(canonical?.sourceShopperIds||[]),...aliasIds]);
  patch.exactAliases=uniq([...(canonical?.exactAliases||[]),...aliasIds]);
  patch.legacyLiveShopperIds=uniq([...(canonical?.legacyLiveShopperIds||[]),...aliasIds]);
  patch.identityAuthority='tenant_adjudication';patch.identityAuthorityRef=authorityRef;patch.identityConsolidatedAt=now();patch.updatedAt=now();
  return clean(patch);
}
async function adjudicationMembershipDocs(users,shopperId){
  const snap=await users.where('shopperId','==',shopperId).limit(8).get();
  return arr(snap?.docs);
}
function adjudicationStrongCredentialProof(member,profile){
  return str(member?.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION||
    str(profile?.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION;
}
function adjudicationOwnerPatch(data,aliases,canonicalShopperId){
  const aliasSet=new Set(aliases),patch={};
  for(const key of ADJUDICATION_OWNER_FIELDS)if(aliasSet.has(str(data?.[key])))patch[key]=canonicalShopperId;
  for(const key of ADJUDICATION_OWNER_ARRAY_FIELDS){
    if(!Array.isArray(data?.[key]))continue;
    const next=uniq(data[key].map(v=>aliasSet.has(str(v))?canonicalShopperId:v));
    if(JSON.stringify(next)!==JSON.stringify(uniq(data[key])))patch[key]=next;
  }
  return patch;
}
async function adjudicationDomainPlan(tenant,projectId,aliases,canonicalShopperId,{preserveHistoricalVisitRows=false,authoritativeVisitIds=[]}={}){
  const plan=[],visitAllow=new Set(uniq(authoritativeVisitIds));
  if(preserveHistoricalVisitRows===true&&!visitAllow.size)throw new Error('SHOPPER_IDENTITY_AUTHORITATIVE_VISIT_IDS_REQUIRED');
  for(const [scope,name] of ADJUDICATION_DOMAIN_COLLECTIONS){
    const col=scope==='tenant'?tenant.collection(name):tenant.collection('projects').doc(projectId).collection(name);
    const snap=await col.get();
    for(const doc of arr(snap?.docs)){
      if(name==='visits'&&preserveHistoricalVisitRows===true&&!visitAllow.has(doc.id))continue;
      const patch=adjudicationOwnerPatch(doc.data()||{},aliases,canonicalShopperId);
      if(Object.keys(patch).length)plan.push({scope,name,ref:col.doc(doc.id),patch});
    }
  }
  return plan;
}
async function durableIdentityAdjudication({auth,db,command,actor,canonicalShopperId}){
  if(!OPERATOR_ROLES.includes(str(actor?.role))||actor?.selfScoped===true)throw new Error('SHOPPER_IDENTITY_ADJUDICATION_OPERATOR_REQUIRED');
  const tenantId=str(command.tenantId),projectId=str(command.projectId),tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users');
  const aliases=uniq(command.payload?.aliasShopperIds||command.payload?.exactAliases||[]).filter(x=>x&&x!==canonicalShopperId);
  if(!aliases.length)throw new Error('SHOPPER_IDENTITY_ALIASES_REQUIRED');
  const canonicalRef=tenant.collection('shoppers').doc(canonicalShopperId),canonicalSnap=await canonicalRef.get();
  const profileRefs=aliases.map(id=>tenant.collection('shoppers').doc(id)),crossRefs=aliases.map(id=>tenant.collection('shopperIdentityCrosswalk').doc(id));
  const profileSnaps=await Promise.all(profileRefs.map(ref=>ref.get())),crossSnaps=await Promise.all(crossRefs.map(ref=>ref.get()));
  aliases.forEach((id,index)=>{if(!profileSnaps[index].exists&&!crossSnaps[index].exists)throw new Error('SHOPPER_IDENTITY_ALIAS_UNKNOWN:'+id);});
  const aliasProfiles=profileSnaps.map(s=>s.exists?(s.data()||{}):{});
  let canonical=canonicalSnap.exists?(canonicalSnap.data()||{}):null;
  let canonicalProfileRecovered=false,canonicalProfileRecoveredFromAliasId='',canonicalRecoveryAuthorityRef='',canonicalRecoverySeed={};
  if(!canonicalSnap.exists){
    const linkSnap=await tenant.collection('shopperIdentityLinks').get();
    const trustedRecoveryLinks=arr(linkSnap?.docs).map(doc=>({id:doc.id,data:doc.data()||{}})).filter(({data:l})=>{
      const status=str(l.status||l.state).toLowerCase(),authority=str(l.authorityType||l.authority?.type).toLowerCase();
      const scope=str(l.projectScope||l.scope?.projectId||l.projectId||'*'),target=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId);
      const authorityRef=str(l.authorityRef||l.authority?.evidenceRef||l.authority?.adjudicationId||l.authority?.providerRef||l.authority?.commandId||l.providerAckRef||l.adjudicationId||l.commandId||l.idempotencyKey);
      const tokens=identityLinkTokens(l);
      return str(l.tenantId||l.scope?.tenantId)===tenantId&&target===canonicalShopperId&&ACTIVE_IDENTITY_LINK_STATES.has(status)&&TRUSTED_IDENTITY_AUTHORITIES.has(authority)&&authority!=='platform_created'&&!!authorityRef&&!(l.periodKey||l.periodId||l.periodScope)&&(scope==='*'||scope.toLowerCase()==='tenant'||scope===projectId)&&aliases.every(id=>tokens.includes(id));
    });
    if(trustedRecoveryLinks.length!==1)throw new Error('SHOPPER_IDENTITY_CANONICAL_PROFILE_MISSING');
    const viable=aliases.map((id,i)=>({id,profile:aliasProfiles[i],exists:profileSnaps[i].exists})).filter(x=>x.exists);
    if(viable.length!==1)throw new Error('SHOPPER_IDENTITY_CANONICAL_RECOVERY_PROFILE_AMBIGUOUS');
    const source=clean({...viable[0].profile});
    for(const key of ['id','shopperId','canonicalShopperId','identityState','supersededByShopperId','supersededAt','providerUidFingerprint','identityAuthority','identityAuthorityRef'])delete source[key];
    canonicalRecoverySeed=clean({...source,id:canonicalShopperId,shopperId:canonicalShopperId,tenantId,projectIds:uniq([projectId,...arr(source.projectIds)]),sourceShopperIds:uniq([...(arr(source.sourceShopperIds)),...aliases]),exactAliases:uniq([...(arr(source.exactAliases)),...aliases])});
    canonical=canonicalRecoverySeed;
    canonicalProfileRecovered=true;
    canonicalProfileRecoveredFromAliasId=viable[0].id;
    const trusted=trustedRecoveryLinks[0].data;
    canonicalRecoveryAuthorityRef=str(trusted.authorityRef||trusted.authority?.evidenceRef||trusted.authority?.adjudicationId||trusted.authority?.providerRef||trusted.authority?.commandId||trusted.providerAckRef||trusted.adjudicationId||trusted.commandId||trusted.idempotencyKey);
  }
  if(str(canonical?.tenantId||tenantId)!==tenantId)throw new Error('SHOPPER_IDENTITY_CANONICAL_TENANT_CONFLICT');
  const identityIds=[canonicalShopperId,...aliases];
  const identitySet=new Set(identityIds);
  const existing=await exactShopperIdentityMap(db,tenantId,projectId);
  /* VRM-185: an explicit Admin human adjudication may supersede an older exact
     adjudication only inside the exact same identity set being confirmed now.
     A mapping to any identity outside that set remains a hard conflict. */
  aliases.forEach(id=>{
    const prior=existing.get(id);
    if(prior&&prior!==canonicalShopperId&&!identitySet.has(prior))throw new Error('SHOPPER_IDENTITY_ALIAS_CONFLICT:'+id);
  });
  const aliasProfiles=profileSnaps.map(s=>s.exists?(s.data()||{}):{});
  const profilesById=new Map([[canonicalShopperId,canonical],...aliases.map((id,i)=>[id,aliasProfiles[i]])]);
  const principalRows=[];
  for(const identityId of identityIds){
    const docs=await adjudicationMembershipDocs(users,identityId),activeDocs=docs.filter(doc=>{
      const m=doc.data()||{};return m.active===true&&str(m.tenantId)===tenantId&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper'&&uniq(m.projectIds).includes(projectId);
    });
    if(activeDocs.length>1)throw new Error('SHOPPER_IDENTITY_MULTIPLE_ACTIVE_MEMBERSHIPS:'+identityId);
    if(!activeDocs.length)continue;
    const doc=activeDocs[0],member=doc.data()||{},user=await safeAuthByUid(auth,doc.id);
    if(!user||user.disabled===true||!authPrincipalMatches(user,tenantId,identityId,projectId))throw new Error('SHOPPER_IDENTITY_ACTIVE_PRINCIPAL_UNSAFE:'+identityId);
    principalRows.push({identityId,doc,ref:users.doc(doc.id),member,user,profile:profilesById.get(identityId)||{},strongProof:adjudicationStrongCredentialProof(member,profilesById.get(identityId)||{})});
  }
  const strong=principalRows.filter(x=>x.strongProof);
  let keeper=null;
  if(strong.length>1){
    const canonicalCredential=shopperCredentialRule(canonical);
    const desiredLogin=canonicalCredential?.ok?str(canonicalCredential.login).toLowerCase():'';
    const canonicalLoginStrong=desiredLogin?strong.filter(x=>str(x.member?.visibleLogin||x.profile?.visibleLogin||x.profile?.username||x.profile?.user).toLowerCase()===desiredLogin):[];
    if(canonicalLoginStrong.length!==1)throw new Error('SHOPPER_IDENTITY_MULTIPLE_PASSWORD_PROOF_PRINCIPALS');
    keeper=canonicalLoginStrong[0];
  }else if(strong.length===1)keeper=strong[0];
  else{
    if(principalRows.length>1)throw new Error('SHOPPER_IDENTITY_KEEPER_AMBIGUOUS');
    keeper=principalRows[0]||null;
  }
  const linkId='irl_'+sha([tenantId,projectId,canonicalShopperId,...aliases].join('\0')).slice(0,32),linkRef=tenant.collection('shopperIdentityLinks').doc(linkId);
  const stamp=now(),authorityRef=receiptId(command),link={
    schemaVersion:'cxorbia.shopper-identity-link.v1',identityLinkId:linkId,tenantId,projectScope:projectId,periodIndependent:true,
    canonicalShopperId,sourceSystem:'hr_external',sourceIdentityKey:aliases[0],exactAliases:aliases,sourceAliases:aliases,
    status:'active',state:'active',authorityType:'tenant_adjudication',authorityRef,adjudicationId:authorityRef,
    humanConfirmed:true,sourceSafe:true,fuzzyMatching:false,actorUidFingerprint:providerUidFingerprint(actor.uid),
    reason:str(command.payload?.reason||'admin_confirmed_same_human'),createdAt:stamp,updatedAt:stamp
  };
  if(!keeper){
    await linkRef.set(link,{merge:true});
    return {identityLinkId:linkId,canonicalShopperId,exactAliases:aliases,providerWrites:1,authorityType:'tenant_adjudication',identityConsolidated:false,retiredPrincipalCount:0,domainWrites:{}};
  }
  const unionProjects=uniq([projectId,...principalRows.flatMap(x=>arr(x.member.projectIds)),...arr(canonical.projectIds),...aliasProfiles.flatMap(x=>arr(x.projectIds))]);
  const canonicalPatch=clean({...canonicalRecoverySeed,...adjudicationProfilePatch(canonical,aliasProfiles,keeper.member,authorityRef,canonicalShopperId,aliases,unionProjects)});
  canonicalPatch.tenantId=tenantId;
  if(canonicalProfileRecovered){canonicalPatch.identityRecoveryAuthority='trusted_exact_identity_link';canonicalPatch.identityRecoveryAuthorityRef=canonicalRecoveryAuthorityRef;canonicalPatch.identityRecoveredFromShopperId=canonicalProfileRecoveredFromAliasId;canonicalPatch.identityRecoveredAt=stamp;}
  const keeperClaims=canonicalClaims(canonicalShopperId,tenantId,unionProjects),keeperUid=keeper.doc.id,keeperFingerprint=providerUidFingerprint(keeperUid);
  const otherPrincipals=principalRows.filter(x=>x.doc.id!==keeperUid);
  const canonicalCrossRef=tenant.collection('shopperIdentityCrosswalk').doc(canonicalShopperId);
  const domainOptions={preserveHistoricalVisitRows:command.payload?.preserveHistoricalVisitRows===true,authoritativeVisitIds:uniq(command.payload?.authoritativeVisitIds||[])};
  const domainPlan=await adjudicationDomainPlan(tenant,projectId,aliases,canonicalShopperId,domainOptions);
  if(domainPlan.length>380)throw new Error('SHOPPER_IDENTITY_DOMAIN_WRITE_BUDGET_EXCEEDED');
  const allLinks=await tenant.collection('shopperIdentityLinks').get(),staleLinkDocs=arr(allLinks?.docs).filter(doc=>{
    if(doc.id===linkId)return false;
    const l=doc.data()||{},status=str(l.status||l.state).toLowerCase(),authority=str(l.authorityType||l.authority?.type).toLowerCase(),target=str(l.canonicalShopperId||l.canonicalId||l.shopperId||l.profileId);
    return ACTIVE_IDENTITY_LINK_STATES.has(status)&&authority==='tenant_adjudication'&&aliases.includes(target)&&identityLinkTokens(l).includes(canonicalShopperId);
  });
  const existingNewLink=await linkRef.get();
  if(existingNewLink.exists){
    const prior=existingNewLink.data()||{};
    if(str(prior.tenantId)!==tenantId||str(prior.canonicalShopperId)!==canonicalShopperId||str(prior.authorityRef)!==authorityRef)throw new Error('SHOPPER_IDENTITY_ADJUDICATION_LINK_CONFLICT');
  }
  const authBefore=principalRows.map(x=>({uid:x.user.uid,disabled:x.user.disabled===true,claims:x.user.customClaims||{}})),authChanged=[];
  try{
    if(claimsDigest(keeper.user.customClaims||{})!==claimsDigest(keeperClaims)){await auth.setCustomUserClaims(keeperUid,keeperClaims);authChanged.push(keeperUid);}
    for(const row of otherPrincipals){if(row.user.disabled!==true){await auth.updateUser(row.user.uid,{disabled:true});authChanged.push(row.user.uid);}}
    await db.runTransaction(async tx=>{
      const readRefs=[canonicalRef,...profileRefs,keeper.ref,...otherPrincipals.map(x=>x.ref),canonicalCrossRef,...crossRefs,...staleLinkDocs.map(d=>tenant.collection('shopperIdentityLinks').doc(d.id)),...domainPlan.map(x=>x.ref)];
      const reads=await Promise.all(readRefs.map(ref=>tx.get(ref)));
      if(!reads[0].exists&&!canonicalProfileRecovered)throw new Error('SHOPPER_IDENTITY_CANONICAL_PROFILE_MISSING_DURING_COMMIT');
      if(reads[0].exists&&canonicalProfileRecovered)throw new Error('SHOPPER_IDENTITY_CANONICAL_PROFILE_APPEARED_DURING_RECOVERY');
      let offset=1;
      for(let i=0;i<profileRefs.length;i++,offset++)if(!reads[offset].exists&&!crossSnaps[i].exists)throw new Error('SHOPPER_IDENTITY_ALIAS_DISAPPEARED:'+aliases[i]);
      const keeperMemberSnap=reads[offset++];
      if(!keeperMemberSnap.exists||keeperMemberSnap.data()?.active!==true)throw new Error('SHOPPER_IDENTITY_KEEPER_MEMBERSHIP_CHANGED');
      for(let i=0;i<otherPrincipals.length;i++,offset++){const snap=reads[offset];if(!snap.exists||snap.data()?.active!==true)throw new Error('SHOPPER_IDENTITY_RETIRE_MEMBERSHIP_CHANGED');}
      tx.set(canonicalRef,canonicalPatch,{merge:true});
      profileRefs.forEach((ref,i)=>tx.set(ref,{identityState:'superseded_exact_alias',supersededByShopperId:canonicalShopperId,supersededAt:stamp,updatedAt:stamp},{merge:true}));
      tx.set(keeper.ref,{active:true,status:'active',tenantId,role:'shopper',authNamespace:'shopper',shopperId:canonicalShopperId,projectIds:unionProjects,providerUidFingerprint:keeperFingerprint,claimsDigest:claimsDigest(keeperClaims),identityConsolidatedFrom:uniq([keeper.identityId,...aliases]),identityConsolidatedAt:stamp,updatedAt:stamp},{merge:true});
      otherPrincipals.forEach(row=>tx.set(row.ref,{active:false,status:'superseded',identityState:'superseded_exact_alias',supersededByShopperId:canonicalShopperId,supersededByUidFingerprint:keeperFingerprint,supersededAt:stamp,updatedAt:stamp},{merge:true}));
      tx.set(canonicalCrossRef,{tenantId,shopperId:canonicalShopperId,projectIds:unionProjects,authNamespace:'shopper',providerUidFingerprint:keeperFingerprint,sourceStableKey:canonicalShopperId,identityMode:'stable_hr_shopper_id',sourceType:'hr_external',fuzzyMatching:false,migrationAuthorityType:null,migrationAuthorityRef:null,migratedFromShopperId:null,identityAuthority:'tenant_adjudication',identityAuthorityRef:authorityRef,updatedAt:stamp},{merge:true});
      crossRefs.forEach((ref,i)=>tx.set(ref,{tenantId,shopperId:canonicalShopperId,canonicalShopperId,projectIds:unionProjects,authNamespace:'shopper',providerUidFingerprint:keeperFingerprint,sourceStableKey:aliases[i],identityMode:'provider_exact_identity_link',sourceType:str((crossSnaps[i].data()||{}).sourceType||'hr_external'),fuzzyMatching:false,migrationAuthorityType:'tenant_adjudication',migrationAuthorityRef:authorityRef,migratedFromShopperId:aliases[i],updatedAt:stamp},{merge:true}));
      tx.set(linkRef,existingNewLink.exists?{...link,createdAt:(existingNewLink.data()||{}).createdAt||stamp}:link,{merge:true});
      staleLinkDocs.forEach(doc=>tx.set(tenant.collection('shopperIdentityLinks').doc(doc.id),{status:'superseded',state:'superseded',supersededByIdentityLinkId:linkId,supersededAt:stamp,updatedAt:stamp},{merge:true}));
      domainPlan.forEach(item=>tx.set(item.ref,{...item.patch,identityConsolidatedAt:stamp},{merge:true}));
    });
  }catch(error){
    const rollbackErrors=[];
    for(const before of authBefore){
      try{await auth.setCustomUserClaims(before.uid,before.claims);if((await auth.getUser(before.uid)).disabled!==before.disabled)await auth.updateUser(before.uid,{disabled:before.disabled});}catch(rollback){rollbackErrors.push(str(rollback?.message||rollback));}
    }
    if(rollbackErrors.length)throw new Error('SHOPPER_IDENTITY_AUTH_ROLLBACK_FAILED:'+rollbackErrors.join('|'));
    throw error;
  }
  const [keeperRead,...retiredReads]=await Promise.all([auth.getUser(keeperUid),...otherPrincipals.map(x=>auth.getUser(x.user.uid))]);
  if(keeperRead.disabled===true||!authPrincipalMatches(keeperRead,tenantId,canonicalShopperId,projectId))throw new Error('SHOPPER_IDENTITY_KEEPER_READBACK_MISMATCH');
  if(retiredReads.some(u=>u.disabled!==true))throw new Error('SHOPPER_IDENTITY_RETIRED_AUTH_READBACK_MISMATCH');
  const activeCanonical=(await adjudicationMembershipDocs(users,canonicalShopperId)).filter(doc=>(doc.data()||{}).active===true);
  if(activeCanonical.length!==1||activeCanonical[0].id!==keeperUid)throw new Error('SHOPPER_IDENTITY_CANONICAL_MEMBERSHIP_READBACK_MISMATCH');
  for(const alias of aliases){const activeAlias=(await adjudicationMembershipDocs(users,alias)).filter(doc=>(doc.data()||{}).active===true);if(activeAlias.length)throw new Error('SHOPPER_IDENTITY_ALIAS_MEMBERSHIP_REMAINS:'+alias);}
  const domainResidual=await adjudicationDomainPlan(tenant,projectId,aliases,canonicalShopperId,domainOptions);
  if(domainResidual.length)throw new Error('SHOPPER_IDENTITY_DOMAIN_READBACK_RESIDUAL:'+domainResidual.length);
  const canonicalProfileRead=await canonicalRef.get();
  if(!canonicalProfileRead.exists||str((canonicalProfileRead.data()||{}).shopperId)!==canonicalShopperId)throw new Error('SHOPPER_IDENTITY_CANONICAL_PROFILE_READBACK_MISMATCH');
  const canonicalCross=await canonicalCrossRef.get();
  if(!canonicalCross.exists||str((canonicalCross.data()||{}).shopperId)!==canonicalShopperId||str((canonicalCross.data()||{}).providerUidFingerprint)!==keeperFingerprint)throw new Error('SHOPPER_IDENTITY_CANONICAL_CROSSWALK_READBACK_MISMATCH');
  for(let i=0;i<crossRefs.length;i++){const cross=await crossRefs[i].get();if(!cross.exists||str((cross.data()||{}).shopperId)!==canonicalShopperId||str((cross.data()||{}).providerUidFingerprint)!==keeperFingerprint)throw new Error('SHOPPER_IDENTITY_ALIAS_CROSSWALK_READBACK_MISMATCH:'+aliases[i]);}
  const domainWrites=domainPlan.reduce((o,x)=>(o[x.name]=(o[x.name]||0)+1,o),{});
  return {identityLinkId:linkId,canonicalShopperId,exactAliases:aliases,providerWrites:1+domainPlan.length+profileRefs.length+crossRefs.length+otherPrincipals.length+4,authorityType:'tenant_adjudication',identityConsolidated:true,canonicalProfileRecovered,canonicalProfileRecoveredFromAliasId:canonicalProfileRecovered?canonicalProfileRecoveredFromAliasId:null,canonicalRecoveryAuthorityRef:canonicalProfileRecovered?canonicalRecoveryAuthorityRef:null,keeperUidFingerprint:keeperFingerprint,retiredPrincipalCount:otherPrincipals.length,domainWrites,historicalVisitRowsPreserved:domainOptions.preserveHistoricalVisitRows===true,authoritativeVisitCount:domainOptions.authoritativeVisitIds.length,hrWrites:0,externalWrites:0};
}
async function durableProfileUpdate({auth,db,command,shopperId,actor}){
  const tenantId=str(command.tenantId),projectId=str(command.projectId),tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users');
  const selfScoped=actor?.selfScoped===true;
  const memberDoc=selfScoped?await users.doc(actor.uid).get():await membershipMatches(users,shopperId);
  if(!memberDoc||memberDoc.exists===false)throw new Error('SHOPPER_UPDATE_MEMBERSHIP_MISSING');
  const uid=memberDoc.id,member=memberDoc.data()||{};
  if(member.active!==true||str(member.tenantId)!==tenantId||str(member.role)!=='shopper'||str(member.authNamespace)!=='shopper')throw new Error('SHOPPER_UPDATE_MEMBERSHIP_INVALID');
  if(selfScoped&&str(actor.canonicalShopperId)!==shopperId)throw new Error('SHOPPER_SELF_UPDATE_CANONICAL_TARGET_INVALID');
  if(!selfScoped&&str(member.shopperId)!==shopperId)throw new Error('SHOPPER_UPDATE_MEMBERSHIP_INVALID');
  if(!uniq(member.projectIds).includes(projectId))throw new Error('SHOPPER_UPDATE_PROJECT_SCOPE_DENIED');
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(shopperId);
  const actorCrossRef=selfScoped?tenant.collection('shopperIdentityCrosswalk').doc(str(member.shopperId)):crossRef;
  const [profileSnap,crossSnap,actorCrossSnap,user]=await Promise.all([profileRef.get(),crossRef.get(),actorCrossRef.get(),safeAuthByUid(auth,uid)]);
  if(!profileSnap.exists)throw new Error('SHOPPER_UPDATE_PROFILE_MISSING');
  if(!crossSnap.exists&&!actorCrossSnap.exists)throw new Error('SHOPPER_UPDATE_CROSSWALK_MISSING');
  if(!user)throw new Error('SHOPPER_UPDATE_AUTH_MISSING');
  const profile=profileSnap.data()||{},cross=crossSnap.exists?(crossSnap.data()||{}):{},actorCross=actorCrossSnap.exists?(actorCrossSnap.data()||{}):{};
  if(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId||!uniq(profile.projectIds).includes(projectId))throw new Error('SHOPPER_UPDATE_PROFILE_SCOPE_CONFLICT');
  if(selfScoped){
    const linked=str(actorCross.shopperId||actorCross.canonicalShopperId);
    if(linked!==shopperId||str(actorCross.tenantId)!==tenantId||str(actorCross.providerUidFingerprint)!==providerUidFingerprint(uid)||!uniq(actorCross.projectIds).includes(projectId))throw new Error('SHOPPER_UPDATE_CROSSWALK_CONFLICT');
  }else if(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==providerUidFingerprint(uid)||!uniq(cross.projectIds).includes(projectId))throw new Error('SHOPPER_UPDATE_CROSSWALK_CONFLICT');
  assertAuthIdentity(user,tenantId,shopperId);
  const rawPub=publicProfile(command.payload?.patch||{}),rawProt=protectedProfile(command.payload?.protectedPatch||{});
  if(selfScoped){
    const denied=[...Object.keys(rawPub).filter(key=>!SELF_MANAGED_PUBLIC_FIELDS.includes(key)),...Object.keys(rawProt).filter(key=>!SELF_MANAGED_PROTECTED_FIELDS.includes(key))];
    if(denied.length)throw new Error('SHOPPER_SELF_MANAGED_FIELD_DENIED:'+denied.sort().join(','));
  }
  const pub=selfScoped?pick(rawPub,SELF_MANAGED_PUBLIC_FIELDS):rawPub;
  const prot=selfScoped?pick(rawProt,SELF_MANAGED_PROTECTED_FIELDS):rawProt;
  const changed=changedHrManagedFields(profile,pub);
  if(changed.length)throw new Error(`SHOPPER_HR_MANAGED_FIELDS_IMMUTABLE:${changed.join(',')}`);
  const merged={...profile,...pub,...prot};
  const patch=clean({...pub,...prot,updatedAt:now()});
  if(selfScoped){
    patch.selfManagedFields=uniq([...(profile.selfManagedFields||[]),...Object.keys(pub),...Object.keys(prot)]);
    patch.selfManagedUpdatedAt=now();
  }
  if(str(profile.sourceType)!=='hr_external'&&(pub.firstName!==undefined||pub.lastName!==undefined||pub.nombre!==undefined)){
    patch.nombre=str(pub.nombre||[merged.firstName,merged.lastName].filter(Boolean).join(' '))||profile.nombre;
  }
  const finalProfile={...merged,...patch,nombre:patch.nombre||merged.nombre};
  const credential=shopperCredentialRule(finalProfile);
  if(!credential.ok)throw new Error(credential.reason);
  const expectedEmail=internalEmail(tenantId,credential.login);
  const loginChanged=str(profile.visibleLogin||profile.username||profile.user).toLowerCase()!==credential.login||
    str(member.visibleLogin).toLowerCase()!==credential.login||
    str(profile.credentialRuleVersion)!==CREDENTIAL_RULE_VERSION||
    str(member.credentialRuleVersion)!==CREDENTIAL_RULE_VERSION||
    str(user.email).toLowerCase()!==expectedEmail.toLowerCase();
  if(loginChanged){
    if(!auth?.updateUser)throw new Error('SHOPPER_CREDENTIAL_AUTH_UPDATE_UNAVAILABLE');
    const collision=await safeAuthByEmail(auth,expectedEmail);
    if(collision&&collision.uid!==uid)throw new Error('SHOPPER_VISIBLE_LOGIN_COLLISION');
    await auth.updateUser(uid,{email:expectedEmail,password:credential.password,disabled:false});
  }
  patch.firstName=credential.firstName;
  patch.lastName=credential.lastName;
  patch.visibleLogin=credential.login;
  patch.username=credential.login;
  patch.user=credential.login;
  patch.credentialRuleVersion=CREDENTIAL_RULE_VERSION;
  await Promise.all([
    profileRef.set(patch,{merge:true}),
    users.doc(uid).set({visibleLogin:credential.login,credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialState:'enrolled',updatedAt:now()},{merge:true})
  ]);
  return {uid,providerWrites:loginChanged?3:2,profileUpdated:true,credentialNormalized:loginChanged,visibleLogin:credential.login};
}

async function durableCredentialIdentity({auth,db,command,shopperId}){
  const tenantId=str(command.tenantId),projectId=str(command.projectId);
  const tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users');
  const memberDoc=await membershipMatches(users,shopperId);
  if(!memberDoc)throw new Error('SHOPPER_CREDENTIAL_MEMBERSHIP_MISSING');
  const uid=memberDoc.id,member=memberDoc.data()||{};
  if(member.active!==true||str(member.tenantId)!==tenantId||str(member.shopperId)!==shopperId||str(member.role)!=='shopper'||str(member.authNamespace)!=='shopper')throw new Error('SHOPPER_CREDENTIAL_MEMBERSHIP_INVALID');
  if(!uniq(member.projectIds).includes(projectId))throw new Error('SHOPPER_CREDENTIAL_PROJECT_SCOPE_DENIED');
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(shopperId);
  const [profileSnap,crossSnap]=await Promise.all([profileRef.get(),crossRef.get()]);
  if(!profileSnap.exists)throw new Error('SHOPPER_CREDENTIAL_PROFILE_MISSING');
  if(!crossSnap.exists)throw new Error('SHOPPER_CREDENTIAL_CROSSWALK_MISSING');
  const profile=profileSnap.data()||{},cross=crossSnap.data()||{};
  if(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId||!uniq(profile.projectIds).includes(projectId))throw new Error('SHOPPER_CREDENTIAL_PROFILE_SCOPE_CONFLICT');
  if(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==providerUidFingerprint(uid)||!uniq(cross.projectIds).includes(projectId))throw new Error('SHOPPER_CREDENTIAL_CROSSWALK_CONFLICT');
  const credential=shopperCredentialRule(profile);
  if(!credential.ok)throw new Error(credential.reason);
  const email=internalEmail(tenantId,credential.login);
  let user=await safeAuthByUid(auth,uid),authCreated=false;
  const byEmail=await safeAuthByEmail(auth,email);
  if(byEmail&&byEmail.uid!==uid)throw new Error('SHOPPER_CREDENTIAL_EMAIL_CONFLICT');
  if(!user){
    user=byEmail||await auth.createUser({uid,email,password:credential.password,disabled:false});
    authCreated=!byEmail;
    await auth.setCustomUserClaims(uid,canonicalClaims(shopperId,tenantId,member.projectIds));
    user=await auth.getUser(uid);
  }
  assertAuthIdentity(user,tenantId,shopperId);
  return {uid,user,email,authCreated,credential,memberRef:users.doc(uid)};
}

async function normalizeDurableShopperCredentials({auth,db,tenantId}={}){
  tenantId=str(tenantId);
  if(!tenantId)throw new Error('SHOPPER_DURABLE_CREDENTIAL_TENANT_REQUIRED');
  if(!auth?.getUser||!auth?.getUserByEmail||!auth?.updateUser||!auth?.setCustomUserClaims)throw new Error('SHOPPER_DURABLE_CREDENTIAL_AUTH_UNAVAILABLE');
  const tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users'),profilesRef=tenant.collection('shoppers');
  const [memberSnap,profileSnap]=await Promise.all([users.get(),profilesRef.get()]);
  const members=arr(memberSnap?.docs).map(d=>({id:d.id,...(d.data()||{})}))
    .filter(m=>m.active===true&&str(m.role)==='shopper'&&str(m.authNamespace)==='shopper')
    .sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const profiles=arr(profileSnap?.docs).map(d=>({id:d.id,...(d.data()||{})}));
  const profileById=new Map(),duplicateProfiles=new Set();
  for(const profile of profiles){
    const shopperId=str(profile.shopperId||profile.id);
    if(!shopperId)continue;
    if(profileById.has(shopperId))duplicateProfiles.add(shopperId);
    else profileById.set(shopperId,profile);
  }
  const memberCountByShopper=new Map();
  for(const member of members){
    const shopperId=str(member.shopperId);
    if(shopperId)memberCountByShopper.set(shopperId,(memberCountByShopper.get(shopperId)||0)+1);
  }
  const reviewQueue=[],review=(member,reason,credential=null)=>{
    reviewQueue.push({
      uidFingerprint:member?.id?providerUidFingerprint(member.id):null,
      shopperId:str(member?.shopperId)||null,
      reason,
      credentialFingerprint:credential?.ok?sha(`${tenantId}\0${credential.login}`).slice(0,24):null,
      requiresHumanAdjudication:true
    });
  };
  let eligible=0,normalized=0,idempotentReplays=0,authWrites=0,firestoreWrites=0,claimsWrites=0;
  for(const member of members){
    const shopperId=str(member.shopperId);
    if(!shopperId){review(member,'SHOPPER_DURABLE_MEMBERSHIP_IDENTITY_MISSING');continue;}
    if((memberCountByShopper.get(shopperId)||0)!==1){review(member,'SHOPPER_MEMBERSHIP_DUPLICATE_IDENTITY');continue;}
    if(duplicateProfiles.has(shopperId)){review(member,'SHOPPER_PROFILE_DUPLICATE_IDENTITY');continue;}
    const profile=profileById.get(shopperId);
    if(!profile){review(member,'SHOPPER_DURABLE_PROFILE_MISSING');continue;}
    if(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||profile.id)!==shopperId){review(member,'SHOPPER_PROFILE_SCOPE_CONFLICT');continue;}
    const credential=shopperCredentialRule(profile);
    if(!credential.ok){review(member,credential.reason,credential);continue;}
    let user=await safeAuthByUid(auth,member.id);
    if(!user){review(member,'SHOPPER_DURABLE_IDENTITY_AUTH_MISSING',credential);continue;}
    try{assertAuthIdentity(user,tenantId,shopperId);}catch(error){review(member,str(error?.message||error),credential);continue;}
    let visibleLogin;
    try{
      visibleLogin=await resolveVisibleLogin({
        auth,tenantId,shopperId,uid:member.id,baseLogin:credential.login,
        currentLogin:str(member.visibleLogin||profile.visibleLogin||profile.username||profile.user),
        currentEmail:str(user.email)
      });
    }catch(error){review(member,str(error?.message||error).split(':')[0],credential);continue;}
    const email=internalEmail(tenantId,visibleLogin),byEmail=await safeAuthByEmail(auth,email);
    if(byEmail&&byEmail.uid!==member.id){review(member,'SHOPPER_VISIBLE_LOGIN_COLLISION',credential);continue;}
    const projectIds=uniq([...(member.projectIds||[]),...(profile.projectIds||[]),...(user.customClaims?.projectIds||[])]);
    const claims=canonicalClaims(shopperId,tenantId,projectIds);
    const passwordProofCurrent=str(member.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION&&str(member.credentialPasswordRuleVersion)===CREDENTIAL_RULE_VERSION;
    const profilePasswordProofCurrent=str(profile.credentialPasswordProofVersion)===CREDENTIAL_PASSWORD_PROOF_VERSION&&str(profile.credentialPasswordRuleVersion)===CREDENTIAL_RULE_VERSION;
    const memberCurrent=str(member.visibleLogin).toLowerCase()===visibleLogin&&str(member.credentialRuleVersion)===CREDENTIAL_RULE_VERSION&&str(member.credentialSweepVersion)===DURABLE_CREDENTIAL_SWEEP_VERSION&&passwordProofCurrent;
    const profileCurrent=str(profile.username||profile.user||profile.visibleLogin).toLowerCase()===visibleLogin&&str(profile.credentialRuleVersion)===CREDENTIAL_RULE_VERSION&&str(profile.credentialSweepVersion)===DURABLE_CREDENTIAL_SWEEP_VERSION&&profilePasswordProofCurrent;
    const authCurrent=str(user.email).toLowerCase()===email.toLowerCase()&&user.disabled!==true;
    const claimsCurrent=claimsDigest(user.customClaims||{})===claimsDigest(claims);
    eligible++;
    if(memberCurrent&&profileCurrent&&authCurrent&&claimsCurrent){idempotentReplays++;continue;}
    user=await auth.updateUser(member.id,{email,password:credential.password,disabled:false});authWrites++;
    if(!claimsCurrent){await auth.setCustomUserClaims(member.id,claims);claimsWrites++;}
    const memberRef=users.doc(member.id),profileRef=profilesRef.doc(profile.id||shopperId);
    await db.runTransaction(async tx=>{
      const [memberNowSnap,profileNowSnap]=await Promise.all([tx.get(memberRef),tx.get(profileRef)]);
      if(!memberNowSnap.exists||!profileNowSnap.exists)throw new Error('SHOPPER_DURABLE_CREDENTIAL_READBACK_MISSING');
      const memberNow=memberNowSnap.data()||{},profileNow=profileNowSnap.data()||{};
      if(str(memberNow.tenantId)!==tenantId||str(memberNow.shopperId)!==shopperId||str(memberNow.role)!=='shopper'||str(memberNow.authNamespace)!=='shopper')throw new Error('SHOPPER_MEMBERSHIP_CONFLICT');
      if(str(profileNow.tenantId||tenantId)!==tenantId||str(profileNow.shopperId||profileNowSnap.id)!==shopperId)throw new Error('SHOPPER_PROFILE_SCOPE_CONFLICT');
      const stamp=now();
      tx.set(memberRef,{
        visibleLogin,credentialRuleVersion:CREDENTIAL_RULE_VERSION,
        credentialState:'enrolled',credentialSweepVersion:DURABLE_CREDENTIAL_SWEEP_VERSION,
        credentialPasswordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,credentialPasswordRuleVersion:CREDENTIAL_RULE_VERSION,
        providerUidFingerprint:providerUidFingerprint(member.id),
        ...(visibleLogin!==credential.login?{credentialDisambiguationPolicy:'deterministic_technical_suffix'}:{}),
        updatedAt:stamp
      },{merge:true});
      tx.set(profileRef,{
        firstName:credential.firstName,lastName:credential.lastName,
        visibleLogin,username:visibleLogin,user:visibleLogin,
        credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialSweepVersion:DURABLE_CREDENTIAL_SWEEP_VERSION,
        credentialPasswordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,credentialPasswordRuleVersion:CREDENTIAL_RULE_VERSION,
        ...(visibleLogin!==credential.login?{credentialDisambiguationPolicy:'deterministic_technical_suffix'}:{}),
        updatedAt:stamp
      },{merge:true});
    });
    firestoreWrites+=2;normalized++;
  }
  return {
    ok:true,status:reviewQueue.length?'committed_with_identity_review':'committed',
    tenantId,activeShopperMemberships:members.length,eligibleShopperCount:eligible,
    normalizedShopperCount:normalized,idempotentReplays,
    identityReviewRequired:reviewQueue.length>0,identityReviewCount:reviewQueue.length,identityReviewQueue:reviewQueue,
    credentialRuleVersion:CREDENTIAL_RULE_VERSION,credentialSweepVersion:DURABLE_CREDENTIAL_SWEEP_VERSION,
    authWrites,claimsWrites,firestoreWrites,plaintextPersisted:false
  };
}

export function createShopperCommandProvider({auth,db,policy}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('SHOPPER_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.getUser||!auth?.createUser||!auth?.setCustomUserClaims||!db?.collection||!db?.runTransaction)throw new Error('SHOPPER_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async normalizeDurableCredentials({tenantId}={}){
      return normalizeDurableShopperCredentials({auth,db,tenantId});
    },
    async reconcileSnapshot(snapshot,{sourceRevision,identityByShopperId}={}){
      const {scope,shoppers}=shoppersFromSnapshot(snapshot,{identityByShopperId});
      if(!scopeAllowed(policy,scope.tenantId,scope.projectId))throw new Error('SHOPPER_RECONCILIATION_SCOPE_DENIED');
      if(!str(sourceRevision))throw new Error('SHOPPER_RECONCILIATION_REVISION_REQUIRED');
      const authUsers=shoppers.length?await listAllAuthUsers(auth):[];
      const directActiveShopperIds=await activeExactShopperPrincipalIds({db,tenantId:scope.tenantId,projectId:scope.projectId,authUsers});
      const suppressedTenantAdjudications=new Set();
      const exactIdentityMap=await exactShopperIdentityMap(db,scope.tenantId,scope.projectId,{directActiveShopperIds,suppressedTenantAdjudications});
      const collisionPolicies=snapshotCollisionPolicies({shoppers,exactIdentityMap,authUsers,tenantId:scope.tenantId});
      const aliasPolicies=await snapshotExactAliasPolicies({db,tenantId:scope.tenantId,projectId:scope.projectId,shoppers,exactIdentityMap,authUsers});
      const orderedShoppers=[...shoppers].sort((a,b)=>{
        const ca=str(exactIdentityMap.get(a.shopperId)||a.shopperId),cb=str(exactIdentityMap.get(b.shopperId)||b.shopperId);
        if(ca!==cb)return ca.localeCompare(cb);
        const pa=aliasPolicies.get(a.shopperId),pb=aliasPolicies.get(b.shopperId);
        const priority=p=>p?.mode==='ALIAS_KEEPER'?0:p?.mode==='ALIAS_RETIRE_AFTER_KEEPER'?2:1;
        return priority(pa)-priority(pb)||str(a.shopperId).localeCompare(str(b.shopperId));
      });
      let created=0,replayed=0,writes=0,credentialNormalized=0,credentialRuleMissing=0,aliasMigrated=0,aliasPrincipalsRetired=0,staleTenantAdjudicationRepairs=0;
      const identityReviewQueue=[],identityMigrationQueue=[];
      const reviewableCredentialCollisions=new Set([
        'SHOPPER_VISIBLE_LOGIN_COLLISION','SHOPPER_AUTH_EMAIL_CONFLICT','SHOPPER_CREDENTIAL_NAME_INCOMPLETE',
        'SHOPPER_VISIBLE_LOGIN_OCCUPANT_UNTRUSTED','SHOPPER_VISIBLE_LOGIN_SUFFIX_COLLISION'
      ]);
      for(const source of orderedShoppers){
        const canonicalShopperId=exactIdentityMap.get(source.shopperId)||source.shopperId;
        let result;
        try{
          result=await durableUpsert({auth,db,policy,candidate:{...source,sourceShopperId:source.shopperId,shopperId:canonicalShopperId},sourceRevision,authUsers,collisionPolicy:collisionPolicies.get(canonicalShopperId)||null,aliasPolicy:aliasPolicies.get(source.shopperId)||null,repairStaleTenantAdjudicationCrosswalk:suppressedTenantAdjudications.has(source.shopperId)});
        }catch(error){
          const reason=str(error?.message||error).split(':')[0];
          if(!reviewableCredentialCollisions.has(reason))throw error;
          const credential=shopperCredentialRule(source);
          identityReviewQueue.push({
            sourceShopperId:source.shopperId,
            canonicalShopperId,
            country:str(source.country||source.pais),
            reason,
            credentialFingerprint:credential.ok?sha(`${scope.tenantId}\0${credential.login}`).slice(0,24):null,
            requiresHumanAdjudication:true
          });
          continue;
        }
        if(result.authCreated)created++;
        if(result.idempotentReplay)replayed++;
        if(result.credentialNormalized)credentialNormalized++;
        if(result.aliasMigrated)aliasMigrated++;
        if(result.aliasPrincipalRetired)aliasPrincipalsRetired++;
        if(result.staleTenantAdjudicationCrosswalkRepaired)staleTenantAdjudicationRepairs++;
        if(!result.visibleLogin)credentialRuleMissing++;
        writes+=Number(result.providerWrites||0);
      }
      return {
        ok:true,
        status:(identityReviewQueue.length||identityMigrationQueue.length)?'committed_with_identity_review':'committed',
        providerAck:true,
        sourceRevision,tenantId:scope.tenantId,projectId:scope.projectId,
        shopperCount:shoppers.length,
        reconciledShopperCount:shoppers.length-identityReviewQueue.length-identityMigrationQueue.length,
        identityReviewRequired:identityReviewQueue.length>0,
        identityReviewCount:identityReviewQueue.length,
        identityReviewQueue,
        identityMigrationRequired:identityMigrationQueue.length>0,
        identityMigrationCount:identityMigrationQueue.length,
        identityMigrationQueue,
        aliasMigrated,aliasPrincipalsRetired,
        tenantAdjudicationSuppressed:suppressedTenantAdjudications.size,staleTenantAdjudicationRepairs,
        authCreated:created,idempotentReplays:replayed,credentialNormalized,credentialRuleMissing,
        credentialRuleVersion:CREDENTIAL_RULE_VERSION,passwordProofVersion:CREDENTIAL_PASSWORD_PROOF_VERSION,providerWrites:writes,hrWrites:0,externalWrites:0,fuzzyMatching:false
      };
    },
    async execute(token,command={}){
      const cv=validateCommand(command);if(!cv.ok)return blocked(command,'SHOPPER_COMMAND_INVALID',{errors:cv.errors});
      if(!scopeAllowed(policy,command.tenantId,command.projectId))return blocked(command,'SHOPPER_COMMAND_SCOPE_DENIED');
      let actor;try{actor=await exactActor(auth,db,token,command);}catch(error){return blocked(command,str(error?.message||error));}
      const shopperId=stableShopperId(command);if(!shopperId)return blocked(command,'SHOPPER_STABLE_ID_REQUIRED');
      const tenant=db.collection('tenants').doc(command.tenantId),receipt=tenant.collection('commandReceipts').doc(receiptId(command)),digest=sha(clean(command));
      try{
        const prior=await receipt.get();
        if(prior.exists){
          const p=prior.data()||{};
          if(p.commandDigest!==digest)throw new Error('SHOPPER_IDEMPOTENCY_REUSE_DIFFERENT_PAYLOAD');
          if(p.status==='committed')return ack(command,p.shopperId,{idempotentReplay:true,providerWrites:0,credentialState:p.credentialState||null,credentialIssued:false,uidFingerprint:p.uidFingerprint||null,profileUpdated:p.profileUpdated===true});
        }
        if(command.commandType==='shopper.identity.adjudicate'){
          const result=await durableIdentityAdjudication({auth,db,command,actor,canonicalShopperId:shopperId});
          await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,identityLinkId:result.identityLinkId,identityConsolidated:result.identityConsolidated===true,canonicalProfileRecovered:result.canonicalProfileRecovered===true,canonicalProfileRecoveredFromAliasId:result.canonicalProfileRecoveredFromAliasId||null,canonicalRecoveryAuthorityRef:result.canonicalRecoveryAuthorityRef||null,keeperUidFingerprint:result.keeperUidFingerprint||null,retiredPrincipalCount:Number(result.retiredPrincipalCount||0),domainWrites:result.domainWrites||{},updatedAt:now()},{merge:false});
          return ack(command,shopperId,{idempotentReplay:false,providerWrites:result.providerWrites+1,identityAdjudicated:true,identityConsolidated:result.identityConsolidated===true,canonicalProfileRecovered:result.canonicalProfileRecovered===true,canonicalProfileRecoveredFromAliasId:result.canonicalProfileRecoveredFromAliasId||null,canonicalRecoveryAuthorityRef:result.canonicalRecoveryAuthorityRef||null,keeperUidFingerprint:result.keeperUidFingerprint||null,retiredPrincipalCount:Number(result.retiredPrincipalCount||0),domainWrites:result.domainWrites||{},historicalVisitRowsPreserved:result.historicalVisitRowsPreserved===true,authoritativeVisitCount:Number(result.authoritativeVisitCount||0),hrWrites:Number(result.hrWrites||0),externalWrites:Number(result.externalWrites||0),identityLinkId:result.identityLinkId,canonicalShopperId:result.canonicalShopperId,exactAliases:result.exactAliases,authorityType:result.authorityType});
        }
        if(command.commandType==='shopper.credential.reset'){
          if(!auth?.updateUser)throw new Error('SHOPPER_CREDENTIAL_AUTH_UPDATE_UNAVAILABLE');
          const identity=await durableCredentialIdentity({auth,db,command,shopperId});
          const password=identity.credential.password;
          await auth.updateUser(identity.uid,{email:identity.email,password,disabled:false});
          const readback=await auth.getUser(identity.uid);
          assertAuthIdentity(readback,str(command.tenantId),shopperId);
          if(str(readback.email).toLowerCase()!==identity.email.toLowerCase())throw new Error('SHOPPER_CREDENTIAL_READBACK_MAPPING_MISMATCH');
          const issuedAt=now(),uidFingerprint=providerUidFingerprint(identity.uid);
          await identity.memberRef.set({credentialState:'enrolled',credentialVersion:CREDENTIAL_RULE_VERSION,credentialRuleVersion:CREDENTIAL_RULE_VERSION,visibleLogin:identity.credential.login,lastCredentialResetAt:issuedAt,lastCredentialActionId:receiptId(command),updatedAt:issuedAt},{merge:true});
          await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,credentialState:'enrolled',credentialVersion:CREDENTIAL_RULE_VERSION,credentialRuleVersion:CREDENTIAL_RULE_VERSION,visibleLogin:identity.credential.login,uidFingerprint,authCreated:identity.authCreated===true,updatedAt:issuedAt},{merge:false});
          return ack(command,shopperId,{uidFingerprint,idempotentReplay:false,providerWrites:2,credentialState:'enrolled',credentialIssued:true,authCreated:identity.authCreated===true,credential:{login:identity.credential.login,password,namespace:'shopper',oneTimeDisclosure:false,deterministicRule:true,ruleVersion:CREDENTIAL_RULE_VERSION,persist:false}});
        }
        if(command.commandType==='shopper.update'){
          if(actor.selfScoped===true&&shopperId!==actor.canonicalShopperId)throw new Error('SHOPPER_SELF_UPDATE_SCOPE_DENIED');
          const result=await durableProfileUpdate({auth,db,command,shopperId,actor});
          await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,profileUpdated:true,selfScoped:actor.selfScoped===true,updatedAt:now()},{merge:false});
          return ack(command,shopperId,{uidFingerprint:providerUidFingerprint(result.uid),idempotentReplay:false,providerWrites:Number(result.providerWrites||0)+1,profileUpdated:true,selfScoped:actor.selfScoped===true});
        }
        const profile=command.payload?.profile||command.payload||{};
        const nombre=str(profile.nombre||[profile.firstName,profile.lastName].filter(Boolean).join(' '));
        const candidate={...sourceCandidate({...profile,nombre,shopperId},{tenantId:command.tenantId,projectId:command.projectId}),shopperId,tenantId:command.tenantId,projectId:command.projectId};
        const sourceRevision=str(command.payload?.sourceRevision||command.payload?.hrSourceRevision||`command:${command.idempotencyKey}`);
        const result=await durableUpsert({auth,db,policy,candidate,sourceRevision});
        const manual=await persistManualProfile({db,command,shopperId,uid:result.uid,projectIds:result.projectIds||[command.projectId]});
        await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,updatedAt:now()},{merge:false});
        return ack(command,shopperId,{uidFingerprint:providerUidFingerprint(result.uid),idempotentReplay:result.idempotentReplay,providerWrites:Number(result.providerWrites||0)+Number(manual.providerWrites||0)+1,profileUpdated:true,identityLinkId:manual.identityLinkId,sourceIdentityKey:manual.sourceIdentityKey,platformCreatedAuthority:manual.platformCreatedAuthority===true});
      }catch(error){return blocked(command,str(error?.message||error));}
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:uniq(policy.allowedTenantIds),allowedProjectIds:uniq(policy.allowedProjectIds),hrWrites:false,externalWrites:false,fuzzyMatching:false,stableIdentity:true,profileMutation:true,identityAdjudication:true,credentialEnrollment:true,credentialRepair:true,credentialRuleVersion:CREDENTIAL_RULE_VERSION,shopperSelfProfileUpdate:true};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,CREDENTIAL_RULE_VERSION,DURABLE_CREDENTIAL_SWEEP_VERSION,shopperCredentialRule,providerUidFingerprint,stableShopperUid,shoppersFromSnapshot,validateProviderPolicy,createShopperCommandProvider};
