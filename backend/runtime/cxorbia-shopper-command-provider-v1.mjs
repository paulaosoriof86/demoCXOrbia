#!/usr/bin/env node
/* CXOrbia Recovery — durable shopper identity provider v1.
   Importing this module performs zero writes. Writes are possible only through an
   explicitly enabled provider policy and injected Firebase Admin Auth + Firestore.
   HR is read-only: this provider never writes to HR or any external source.
*/
import crypto from 'node:crypto';

export const VERSION='cxorbia-shopper-command-provider-v1';
export const COMMAND_TYPES=Object.freeze(['shopper.create','shopper.credential.reset']);
export const OPERATOR_ROLES=Object.freeze(['super','admin']);

const str=v=>String(v==null?'':v).trim();
const arr=v=>Array.isArray(v)?v:[];
const uniq=v=>[...new Set(arr(v).map(str).filter(Boolean))].sort();
const now=()=>new Date().toISOString();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const sameArray=(a,b)=>JSON.stringify(uniq(a))===JSON.stringify(uniq(b));
const receiptId=command=>sha(`${command.tenantId}\0${command.projectId}\0${command.periodId||''}\0${command.idempotencyKey}`).slice(0,40);
const RAW_SECRET_KEY=/^(?:password|pass|newpassword|temporarypassword|credential|credentialvalue|secret|token|resettoken)$/i;

export const providerUidFingerprint=uid=>sha(`cxorbia-provider-uid-v1\0${str(uid)}`);
export const stableShopperUid=(tenantId,shopperId)=>`cx-sh-${sha(`${str(tenantId)}\0shopper\0${str(shopperId)}`).slice(0,28)}`;
const internalEmail=(tenantId,shopperId)=>`${sha(`${str(tenantId)}\0shopper\0${str(shopperId)}`).slice(0,48)}@auth.cxorbia.invalid`;
const canonicalClaims=(shopperId,tenantId,projectIds)=>({authNamespace:'shopper',projectIds:uniq(projectIds),role:'shopper',shopperId:str(shopperId),tenantId:str(tenantId)});
const claimsDigest=claims=>sha(canonicalClaims(claims?.shopperId,claims?.tenantId,claims?.projectIds));

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
function generateCredential(){
  return `${crypto.randomBytes(24).toString('base64url')}!aA1`;
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
  return {ok:errors.length===0,errors};
}

async function exactActor(auth,db,token,command){
  const decoded=await auth.verifyIdToken(token,true);
  const role=str(decoded.role),namespace=str(decoded.authNamespace||'staff');
  if(str(decoded.tenantId)!==str(command.tenantId)||!OPERATOR_ROLES.includes(role)||namespace!=='staff')throw new Error('SHOPPER_ACTOR_SCOPE_DENIED');
  if(role!=='super'&&!uniq(decoded.projectIds).includes(str(command.projectId)))throw new Error('SHOPPER_ACTOR_PROJECT_DENIED');
  const member=await db.collection('tenants').doc(command.tenantId).collection('users').doc(decoded.uid).get();
  if(!member.exists)throw new Error('SHOPPER_ACTOR_MEMBERSHIP_MISSING');
  const m=member.data()||{};
  if(m.active!==true||str(m.tenantId)!==str(command.tenantId)||str(m.role)!==role||str(m.authNamespace)!=='staff')throw new Error('SHOPPER_ACTOR_MEMBERSHIP_INVALID');
  if(role!=='super'&&!uniq(m.projectIds).includes(str(command.projectId)))throw new Error('SHOPPER_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  return {uid:decoded.uid,role};
}

function stableShopperId(command){
  const payload=command?.payload||{},profile=payload.profile||{};
  return str(command?.entityId||payload.shopperId||payload.hrShopperId||profile.shopperId||profile.id||profile.legacyShopperId);
}
function sourceCandidate(row,scope){
  const shopperId=str(row?.shopperId||row?.id);
  if(!shopperId)return null;
  return clean({
    shopperId,
    tenantId:scope.tenantId,
    projectId:scope.projectId,
    shopperCode:str(row?.shopperCode),
    pais:str(row?.pais||row?.country),
    country:str(row?.country||row?.pais),
    sourceSafe:row?.sourceSafe===true,
    piiProtected:row?.piiProtected===true,
    nombre:str(row?.nombre||row?.shopper),
    sourceTab:str(row?.sourceTab),
    hrRowId:str(row?.hrRowId)
  });
}
export function shoppersFromSnapshot(snapshot={}){
  if(snapshot?.sourceSafe!==true||snapshot?.imported===true||Number(snapshot?.firestoreWrites||0)!==0)throw new Error('SHOPPER_HR_SNAPSHOT_UNSAFE');
  const scope=projectScope(snapshot);
  if(!scope.tenantId||!scope.projectId)throw new Error('SHOPPER_HR_SCOPE_MISSING');
  const byId=new Map();
  const ingest=row=>{
    const c=sourceCandidate(row,scope);if(!c)return;
    const prior=byId.get(c.shopperId)||{};
    byId.set(c.shopperId,{...prior,...Object.fromEntries(Object.entries(c).filter(([,v])=>v!==''&&v!==false)),sourceSafe:prior.sourceSafe===true||c.sourceSafe===true,piiProtected:prior.piiProtected===true||c.piiProtected===true});
  };
  for(const shopper of arr(snapshot.shoppers))ingest(shopper);
  for(const visit of arr(snapshot.visits))if(str(visit?.shopperId))ingest(visit);
  return {scope,shoppers:[...byId.values()].sort((a,b)=>a.shopperId.localeCompare(b.shopperId))};
}

function hrProfilePatch(candidate,projectIds,sourceRevision){
  const protectedName=/^shopper protegido$/i.test(str(candidate.nombre));
  const hrManaged=clean({
    shopperCode:candidate.shopperCode||null,
    pais:candidate.pais||candidate.country||null,
    country:candidate.country||candidate.pais||null,
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
  if(candidate.nombre&&!protectedName)out.nombre=candidate.nombre;
  return out;
}

async function membershipMatches(users,shopperId){
  const snap=await users.where('shopperId','==',shopperId).limit(2).get();
  if(snap.size>1)throw new Error('SHOPPER_MEMBERSHIP_DUPLICATE_IDENTITY');
  return snap.size===1?snap.docs[0]:null;
}
async function safeAuthByUid(auth,uid){try{return await auth.getUser(uid);}catch(error){if(authNotFound(error))return null;throw error;}}
async function safeAuthByEmail(auth,email){try{return await auth.getUserByEmail(email);}catch(error){if(authNotFound(error))return null;throw error;}}
function assertAuthIdentity(user,tenantId,shopperId){
  const c=user?.customClaims||{};
  if(str(c.tenantId)&&str(c.tenantId)!==tenantId)throw new Error('SHOPPER_AUTH_TENANT_CONFLICT');
  if(str(c.shopperId)&&str(c.shopperId)!==shopperId)throw new Error('SHOPPER_AUTH_IDENTITY_CONFLICT');
  if(str(c.role)&&str(c.role)!=='shopper')throw new Error('SHOPPER_AUTH_ROLE_CONFLICT');
  if(str(c.authNamespace)&&str(c.authNamespace)!=='shopper')throw new Error('SHOPPER_AUTH_NAMESPACE_CONFLICT');
}

async function durableUpsert({auth,db,policy,candidate,sourceRevision}){
  const tenantId=str(candidate.tenantId),projectId=str(candidate.projectId),shopperId=str(candidate.shopperId);
  if(!tenantId||!projectId||!shopperId||!str(sourceRevision))throw new Error('SHOPPER_DURABLE_KEYS_REQUIRED');
  if(!scopeAllowed(policy,tenantId,projectId))throw new Error('SHOPPER_PROVIDER_SCOPE_DENIED');
  const tenant=db.collection('tenants').doc(tenantId),users=tenant.collection('users');
  const profileRef=tenant.collection('shoppers').doc(shopperId),crossRef=tenant.collection('shopperIdentityCrosswalk').doc(shopperId);
  const existingMemberDoc=await membershipMatches(users,shopperId);
  const [crossBefore,profileBefore]=await Promise.all([crossRef.get(),profileRef.get()]);
  const existingMember=existingMemberDoc?.data?.()||{};
  const existingCross=crossBefore.exists?crossBefore.data()||{}:{};
  const existingProfile=profileBefore.exists?profileBefore.data()||{}:{};
  const uid=existingMemberDoc?.id||stableShopperUid(tenantId,shopperId);
  const memberRef=users.doc(uid);
  if(crossBefore.exists){
    const c=existingCross;
    if(str(c.tenantId)!==tenantId||str(c.shopperId)!==shopperId)throw new Error('SHOPPER_CROSSWALK_SCOPE_CONFLICT');
    if(str(c.providerUidFingerprint)&&str(c.providerUidFingerprint)!==providerUidFingerprint(uid))throw new Error('SHOPPER_CROSSWALK_UID_CONFLICT');
  }
  const email=internalEmail(tenantId,shopperId);
  let user=await safeAuthByUid(auth,uid),authCreated=false;
  if(!user){
    if(existingMemberDoc||crossBefore.exists)throw new Error('SHOPPER_DURABLE_IDENTITY_AUTH_MISSING');
    const byEmail=await safeAuthByEmail(auth,email);
    if(byEmail&&byEmail.uid!==uid)throw new Error('SHOPPER_AUTH_EMAIL_CONFLICT');
    user=byEmail||await auth.createUser({uid,email,disabled:false});
    authCreated=!byEmail;
  }
  assertAuthIdentity(user,tenantId,shopperId);
  const currentClaims=user.customClaims||{},projectIds=uniq([...(currentClaims.projectIds||[]),...(existingMember.projectIds||[]),...(existingCross.projectIds||[]),...(existingProfile.projectIds||[]),projectId]);
  const claims=canonicalClaims(shopperId,tenantId,projectIds);
  if(claimsDigest(currentClaims)!==claimsDigest(claims))await auth.setCustomUserClaims(uid,claims);

  try{
    const outcome=await db.runTransaction(async tx=>{
      const [profileSnap,memberSnap,crossSnap]=await Promise.all([tx.get(profileRef),tx.get(memberRef),tx.get(crossRef)]);
      const profile=profileSnap.exists?profileSnap.data()||{}:{};
      const member=memberSnap.exists?memberSnap.data()||{}:{};
      const cross=crossSnap.exists?crossSnap.data()||{}:{};
      if(profileSnap.exists&&(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId))throw new Error('SHOPPER_PROFILE_SCOPE_CONFLICT');
      if(memberSnap.exists&&(str(member.tenantId)!==tenantId||str(member.shopperId)!==shopperId||str(member.role)!=='shopper'||str(member.authNamespace)!=='shopper'))throw new Error('SHOPPER_MEMBERSHIP_CONFLICT');
      if(crossSnap.exists&&(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==providerUidFingerprint(uid)))throw new Error('SHOPPER_CROSSWALK_CONFLICT');
      const unionProjects=uniq([...(profile.projectIds||[]),...(member.projectIds||[]),...(cross.projectIds||[]),...projectIds,projectId]);
      const alreadyCurrent=profileSnap.exists&&memberSnap.exists&&crossSnap.exists&&str(profile.hrSourceRevision)===sourceRevision&&sameArray(profile.projectIds,unionProjects)&&sameArray(member.projectIds,unionProjects)&&sameArray(cross.projectIds,unionProjects)&&str(member.providerUidFingerprint)===providerUidFingerprint(uid)&&str(cross.providerUidFingerprint)===providerUidFingerprint(uid);
      if(alreadyCurrent)return {providerWrites:0,idempotentReplay:true,projectIds:unionProjects};
      const profilePatch=hrProfilePatch(candidate,unionProjects,sourceRevision);
      const membership={active:true,tenantId,role:'shopper',authNamespace:'shopper',shopperId,projectIds:unionProjects,providerUidFingerprint:providerUidFingerprint(uid),claimsDigest:claimsDigest(canonicalClaims(shopperId,tenantId,unionProjects)),membershipVersion:'cxorbia-shopper-membership-v1',updatedAt:now()};
      const crosswalk={tenantId,shopperId,projectIds:unionProjects,authNamespace:'shopper',providerUidFingerprint:providerUidFingerprint(uid),sourceStableKey:shopperId,identityMode:'stable_hr_shopper_id',fuzzyMatching:false,sourceType:'hr_external',updatedAt:now()};
      tx.set(profileRef,profilePatch,{merge:true});
      tx.set(memberRef,membership,{merge:true});
      tx.set(crossRef,crosswalk,{merge:true});
      return {providerWrites:3,idempotentReplay:false,projectIds:unionProjects};
    });
    return {shopperId,uid,authCreated,...outcome};
  }catch(error){
    // Auth may already have been created or claims updated. No success ACK is returned.
    // Stable uid + conflict checks make the next identical attempt complete safely.
    throw error;
  }
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
  const [profileSnap,crossSnap,user]=await Promise.all([profileRef.get(),crossRef.get(),safeAuthByUid(auth,uid)]);
  if(!profileSnap.exists)throw new Error('SHOPPER_CREDENTIAL_PROFILE_MISSING');
  if(!crossSnap.exists)throw new Error('SHOPPER_CREDENTIAL_CROSSWALK_MISSING');
  if(!user)throw new Error('SHOPPER_CREDENTIAL_AUTH_MISSING');
  const profile=profileSnap.data()||{},cross=crossSnap.data()||{};
  if(str(profile.tenantId||tenantId)!==tenantId||str(profile.shopperId||shopperId)!==shopperId||!uniq(profile.projectIds).includes(projectId))throw new Error('SHOPPER_CREDENTIAL_PROFILE_SCOPE_CONFLICT');
  if(str(cross.tenantId)!==tenantId||str(cross.shopperId)!==shopperId||str(cross.providerUidFingerprint)!==providerUidFingerprint(uid)||!uniq(cross.projectIds).includes(projectId))throw new Error('SHOPPER_CREDENTIAL_CROSSWALK_CONFLICT');
  assertAuthIdentity(user,tenantId,shopperId);
  if(str(user.email).toLowerCase()!==internalEmail(tenantId,shopperId).toLowerCase())throw new Error('SHOPPER_CREDENTIAL_LOGIN_MAPPING_CONFLICT');
  return {uid,user,memberRef:users.doc(uid)};
}

export function createShopperCommandProvider({auth,db,policy}={}){
  const pv=validateProviderPolicy(policy);if(!pv.ok)throw new Error('SHOPPER_PROVIDER_POLICY_INVALID:'+pv.errors.join(','));
  if(!auth?.getUser||!auth?.createUser||!auth?.setCustomUserClaims||!auth?.updateUser||!db?.collection||!db?.runTransaction)throw new Error('SHOPPER_PROVIDER_DEPENDENCIES_MISSING');
  return Object.freeze({
    version:VERSION,
    async reconcileSnapshot(snapshot,{sourceRevision}={}){
      const {scope,shoppers}=shoppersFromSnapshot(snapshot);
      if(!scopeAllowed(policy,scope.tenantId,scope.projectId))throw new Error('SHOPPER_RECONCILIATION_SCOPE_DENIED');
      if(!str(sourceRevision))throw new Error('SHOPPER_RECONCILIATION_REVISION_REQUIRED');
      let created=0,replayed=0,writes=0;
      for(const source of shoppers){
        const result=await durableUpsert({auth,db,policy,candidate:source,sourceRevision});
        if(result.authCreated)created++;
        if(result.idempotentReplay)replayed++;
        writes+=Number(result.providerWrites||0);
      }
      return {ok:true,status:'committed',providerAck:true,sourceRevision,tenantId:scope.tenantId,projectId:scope.projectId,shopperCount:shoppers.length,authCreated:created,idempotentReplays:replayed,providerWrites:writes,hrWrites:0,externalWrites:0,fuzzyMatching:false};
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
          if(p.status==='committed')return ack(command,p.shopperId,{idempotentReplay:true,providerWrites:0,credentialState:p.credentialState||null,credentialIssued:false,uidFingerprint:p.uidFingerprint||null});
        }
        if(command.commandType==='shopper.credential.reset'){
          const identity=await durableCredentialIdentity({auth,db,command,shopperId});
          const password=generateCredential();
          await auth.updateUser(identity.uid,{password,disabled:false});
          const readback=await auth.getUser(identity.uid);
          assertAuthIdentity(readback,str(command.tenantId),shopperId);
          if(str(readback.email).toLowerCase()!==internalEmail(command.tenantId,shopperId).toLowerCase())throw new Error('SHOPPER_CREDENTIAL_READBACK_MAPPING_MISMATCH');
          const issuedAt=now(),uidFingerprint=providerUidFingerprint(identity.uid);
          await identity.memberRef.set({credentialState:'enrolled',credentialVersion:'cxorbia-shopper-credential-v1',lastCredentialResetAt:issuedAt,lastCredentialActionId:receiptId(command),updatedAt:issuedAt},{merge:true});
          await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,credentialState:'enrolled',credentialVersion:'cxorbia-shopper-credential-v1',uidFingerprint,updatedAt:issuedAt},{merge:false});
          return ack(command,shopperId,{uidFingerprint,idempotentReplay:false,providerWrites:2,credentialState:'enrolled',credentialIssued:true,credential:{login:shopperId,password,namespace:'shopper',oneTimeDisclosure:true,persist:false}});
        }
        const profile=command.payload?.profile||command.payload||{};
        const candidate={...sourceCandidate({...profile,shopperId},{tenantId:command.tenantId,projectId:command.projectId}),shopperId,tenantId:command.tenantId,projectId:command.projectId};
        const sourceRevision=str(command.payload?.sourceRevision||command.payload?.hrSourceRevision||`command:${command.idempotencyKey}`);
        const result=await durableUpsert({auth,db,policy,candidate,sourceRevision});
        await receipt.set({status:'committed',commandDigest:digest,shopperId,commandType:command.commandType,providerAck:true,actorUid:actor.uid,updatedAt:now()},{merge:false});
        return ack(command,shopperId,{uidFingerprint:providerUidFingerprint(result.uid),idempotentReplay:result.idempotentReplay,providerWrites:Number(result.providerWrites||0)+1});
      }catch(error){return blocked(command,str(error?.message||error));}
    },
    status(){return {version:VERSION,enabled:true,allowedTenantIds:uniq(policy.allowedTenantIds),allowedProjectIds:uniq(policy.allowedProjectIds),hrWrites:false,externalWrites:false,fuzzyMatching:false,stableIdentity:true,credentialEnrollment:true};}
  });
}

export default {VERSION,COMMAND_TYPES,OPERATOR_ROLES,providerUidFingerprint,stableShopperUid,shoppersFromSnapshot,validateProviderPolicy,createShopperCommandProvider};
