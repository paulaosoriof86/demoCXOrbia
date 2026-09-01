import crypto from 'node:crypto';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const FIREBASE_PROJECT=process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||'cxorbia-backend-dev';
const AUTH_NAMESPACE='staff';
const ALLOWED_ROLES=new Set(['super','admin','ops','coordinador','cliente']);
const ENTITLEMENT_MODES=new Set(['TYA_COMPLETE','SPECIFIC_PROJECTS']);
const MAX_BODY_BYTES=64*1024;

function ensureAdmin(){
  if(!getApps().length) initializeApp({credential:applicationDefault(),projectId:FIREBASE_PROJECT});
  return {auth:getAuth(),db:getFirestore()};
}
function sendJson(res,status,value){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}
function bearer(req){
  const value=String(req.headers.authorization||'');
  const m=value.match(/^Bearer\s+(.+)$/i);
  return m?m[1].trim():'';
}
function sha256(value){return crypto.createHash('sha256').update(String(value),'utf8').digest('hex');}
function normalizeLogin(value){return String(value||'').trim().toLowerCase();}
function deriveProviderEmail(tenantId,visibleLogin){
  const normalized=normalizeLogin(visibleLogin);
  return `${sha256(`${tenantId}\0${AUTH_NAMESPACE}\0${normalized}`).slice(0,48)}@auth.cxorbia.invalid`;
}
function canonicalClaims({tenantId,role,projectIds}){
  return {authNamespace:AUTH_NAMESPACE,projectIds:[...new Set(projectIds.map(String))].sort(),role,tenantId};
}
function claimsDigest(claims){return sha256(JSON.stringify({authNamespace:claims.authNamespace,projectIds:claims.projectIds,role:claims.role,tenantId:claims.tenantId}));}
function uidFingerprint(uid){return sha256(`cxorbia-provider-uid-v1\0${uid}`);}
function sameSet(a,b){
  const aa=[...new Set((a||[]).map(String))].sort();
  const bb=[...new Set((b||[]).map(String))].sort();
  return aa.length===bb.length&&aa.every((v,i)=>v===bb[i]);
}
async function readJson(req){
  let size=0,raw='';
  for await(const chunk of req){
    size+=chunk.length;
    if(size>MAX_BODY_BYTES) throw Object.assign(new Error('body_too_large'),{statusCode:413});
    raw+=chunk.toString('utf8');
  }
  if(!raw.trim()) return {};
  try{return JSON.parse(raw);}catch{throw Object.assign(new Error('invalid_json'),{statusCode:400});}
}
async function authorize(req,tenantId){
  const raw=bearer(req);
  if(!raw) throw Object.assign(new Error('authorization_required'),{statusCode:401});
  const {auth}=ensureAdmin();
  let token;
  try{token=await auth.verifyIdToken(raw,true);}catch{throw Object.assign(new Error('invalid_authorization'),{statusCode:401});}
  if(String(token.tenantId||'')!==tenantId||String(token.authNamespace||'')!==AUTH_NAMESPACE) throw Object.assign(new Error('tenant_or_namespace_mismatch'),{statusCode:403});
  if(String(token.role||'')!=='super') throw Object.assign(new Error('user_admin_super_required'),{statusCode:403});
  return token;
}
async function canonicalProjectIds(db,tenantId){
  const snap=await db.collection('tenants').doc(tenantId).collection('projects').get();
  const ids=[];
  for(const doc of snap.docs){
    const data=doc.data()||{};
    if(data.deleted===true) continue;
    ids.push(doc.id);
  }
  ids.sort();
  if(!ids.length) throw Object.assign(new Error('canonical_project_inventory_empty'),{statusCode:409});
  return ids;
}
async function resolveEntitlement(db,tenantId,mode,requestedProjectIds){
  if(!ENTITLEMENT_MODES.has(mode)) throw Object.assign(new Error('entitlement_mode_required'),{statusCode:400});
  const canonical=await canonicalProjectIds(db,tenantId);
  if(mode==='TYA_COMPLETE') return {entitlementMode:mode,projectIds:canonical,canonicalProjectIds:canonical};
  const requested=[...new Set((requestedProjectIds||[]).map(String).filter(Boolean))].sort();
  if(!requested.length) throw Object.assign(new Error('specific_projects_required'),{statusCode:400});
  const allowed=new Set(canonical);
  const invalid=requested.filter(id=>!allowed.has(id));
  if(invalid.length) throw Object.assign(new Error('unknown_project_scope'),{statusCode:400,details:{invalidCount:invalid.length}});
  return {entitlementMode:mode,projectIds:requested,canonicalProjectIds:canonical};
}
function publicUser(uid,data,currentProjectIds){
  const projectIds=[...new Set((data.projectIds||[]).map(String))].sort();
  const entitlementMode=String(data.entitlementMode||'SPECIFIC_PROJECTS');
  const scopeReviewRequired=entitlementMode==='TYA_COMPLETE'&&!sameSet(projectIds,currentProjectIds);
  return {
    id:uid,
    displayName:data.displayName||'',
    visibleLogin:data.visibleLogin||'',
    contactEmail:data.contactEmail||'',
    role:data.role||'',
    entitlementMode,
    projectIds,
    active:data.active!==false,
    countries:Array.isArray(data.countries)?data.countries:[],
    clientId:data.clientId||null,
    personLabel:data.personLabel||null,
    scopeReviewRequired,
    scopeReviewReason:scopeReviewRequired?'TYA_COMPLETE_PROJECT_SET_CHANGED':null
  };
}
async function writeAudit(db,tenantId,{action,targetUid,callerUid,operationId,beforeDigest=null,afterDigest=null,metadata={}}){
  await db.collection('tenants').doc(tenantId).collection('auditLogs').doc(operationId).set({
    action,targetUid,callerUid,operationId,beforeDigest,afterDigest,metadata,createdAt:FieldValue.serverTimestamp()
  },{merge:false});
}
function operationId(req,tenantId,operation,targetStableKey,payload){
  const supplied=String(req.headers['idempotency-key']||'').trim();
  if(supplied) return sha256(`cxorbia-admin-op-v1\0${tenantId}\0${supplied}`);
  return sha256(`${tenantId}\0${operation}\0${targetStableKey}\0${sha256(JSON.stringify(payload))}`);
}
async function listUsers(req,res,tenantId,caller){
  const {db}=ensureAdmin();
  const [snap,currentProjects]=await Promise.all([
    db.collection('tenants').doc(tenantId).collection('users').get(),
    canonicalProjectIds(db,tenantId)
  ]);
  const users=snap.docs.map(d=>publicUser(d.id,d.data()||{},currentProjects)).sort((a,b)=>String(a.displayName||a.visibleLogin).localeCompare(String(b.displayName||b.visibleLogin)));
  return sendJson(res,200,{ok:true,tenantId,users,currentProjectIds:currentProjects,scopePolicy:{requiredOnCreate:true,editable:true,modes:['TYA_COMPLETE','SPECIFIC_PROJECTS'],wildcard:false},callerUid:caller.uid});
}
async function createUser(req,res,tenantId,caller){
  const body=await readJson(req);
  const visibleLogin=normalizeLogin(body.visibleLogin);
  const password=String(body.password||'');
  const role=String(body.role||'').trim().toLowerCase();
  const entitlementMode=String(body.entitlementMode||'').trim().toUpperCase();
  if(!visibleLogin) throw Object.assign(new Error('visible_login_required'),{statusCode:400});
  if(password.length<8) throw Object.assign(new Error('ephemeral_password_min_8'),{statusCode:400});
  if(!ALLOWED_ROLES.has(role)) throw Object.assign(new Error('invalid_role'),{statusCode:400});
  const {auth,db}=ensureAdmin();
  const scope=await resolveEntitlement(db,tenantId,entitlementMode,body.projectIds);
  const providerEmail=deriveProviderEmail(tenantId,visibleLogin);
  try{await auth.getUserByEmail(providerEmail);throw Object.assign(new Error('visible_login_collision'),{statusCode:409});}catch(error){if(error?.code!=='auth/user-not-found') throw error;}
  const payloadDigest=sha256(JSON.stringify({visibleLogin,role,entitlementMode,projectIds:scope.projectIds,displayName:body.displayName||'',contactEmail:body.contactEmail||''}));
  const opId=operationId(req,tenantId,'create',providerEmail,payloadDigest);
  const auditRef=db.collection('tenants').doc(tenantId).collection('auditLogs').doc(opId);
  const existingAudit=await auditRef.get();
  if(existingAudit.exists) return sendJson(res,200,{ok:true,idempotent:true,operationId:opId});
  let created=null;
  try{
    created=await auth.createUser({email:providerEmail,password,disabled:false,displayName:String(body.displayName||'').trim()||undefined});
    const claims=canonicalClaims({tenantId,role,projectIds:scope.projectIds});
    await auth.setCustomUserClaims(created.uid,claims);
    const now=FieldValue.serverTimestamp();
    const userDoc={
      tenantId,authNamespace:AUTH_NAMESPACE,visibleLogin,displayName:String(body.displayName||'').trim(),contactEmail:String(body.contactEmail||'').trim(),
      role,entitlementMode,projectIds:scope.projectIds,active:true,countries:Array.isArray(body.countries)?body.countries.map(String):[],
      clientId:body.clientId?String(body.clientId):null,personLabel:body.personLabel?String(body.personLabel):null,
      providerUidFingerprint:uidFingerprint(created.uid),claimsDigest:claimsDigest(claims),lastAdminActionId:opId,createdAt:now,updatedAt:now
    };
    await db.collection('tenants').doc(tenantId).collection('users').doc(created.uid).set(userDoc,{merge:false});
    await writeAudit(db,tenantId,{action:'USER_CREATE',targetUid:created.uid,callerUid:caller.uid,operationId:opId,afterDigest:userDoc.claimsDigest,metadata:{entitlementMode,projectCount:scope.projectIds.length}});
    const readback=await auth.getUser(created.uid);
    const docReadback=await db.collection('tenants').doc(tenantId).collection('users').doc(created.uid).get();
    if(readback.disabled||!docReadback.exists||String(docReadback.data()?.claimsDigest||'')!==userDoc.claimsDigest) throw new Error('create_readback_mismatch');
    return sendJson(res,201,{ok:true,id:created.uid,operationId:opId,entitlementMode,projectIds:scope.projectIds,claimsDigest:userDoc.claimsDigest});
  }catch(error){
    if(created?.uid){
      try{await auth.updateUser(created.uid,{disabled:true});}catch{}
      try{await db.collection('tenants').doc(tenantId).collection('users').doc(created.uid).set({active:false,compensatedCreateFailure:true,updatedAt:FieldValue.serverTimestamp()},{merge:true});}catch{}
    }
    throw error;
  }
}
async function updateScope(req,res,tenantId,uid,caller){
  const body=await readJson(req);
  const role=String(body.role||'').trim().toLowerCase();
  const entitlementMode=String(body.entitlementMode||'').trim().toUpperCase();
  if(!ALLOWED_ROLES.has(role)) throw Object.assign(new Error('invalid_role'),{statusCode:400});
  const {auth,db}=ensureAdmin();
  const ref=db.collection('tenants').doc(tenantId).collection('users').doc(uid);
  const beforeDoc=await ref.get();
  if(!beforeDoc.exists) throw Object.assign(new Error('user_not_found'),{statusCode:404});
  const beforeUser=await auth.getUser(uid);
  const previousClaims=beforeUser.customClaims||{};
  const scope=await resolveEntitlement(db,tenantId,entitlementMode,body.projectIds);
  const claims=canonicalClaims({tenantId,role,projectIds:scope.projectIds});
  const afterDigest=claimsDigest(claims);
  const beforeDigest=String(beforeDoc.data()?.claimsDigest||claimsDigest(canonicalClaims({tenantId,role:String(beforeDoc.data()?.role||''),projectIds:beforeDoc.data()?.projectIds||[]})));
  const opId=operationId(req,tenantId,'scope',uid,{role,entitlementMode,projectIds:scope.projectIds});
  const auditRef=db.collection('tenants').doc(tenantId).collection('auditLogs').doc(opId);
  if((await auditRef.get()).exists) return sendJson(res,200,{ok:true,idempotent:true,operationId:opId});
  try{
    await auth.setCustomUserClaims(uid,claims);
    await ref.update({role,entitlementMode,projectIds:scope.projectIds,claimsDigest:afterDigest,lastAdminActionId:opId,updatedAt:FieldValue.serverTimestamp()});
    await writeAudit(db,tenantId,{action:'USER_SCOPE_CHANGE',targetUid:uid,callerUid:caller.uid,operationId:opId,beforeDigest,afterDigest,metadata:{entitlementMode,projectCount:scope.projectIds.length}});
    const readback=await auth.getUser(uid);
    const readbackClaims=canonicalClaims({tenantId,role:String(readback.customClaims?.role||''),projectIds:readback.customClaims?.projectIds||[]});
    if(claimsDigest(readbackClaims)!==afterDigest) throw new Error('scope_readback_mismatch');
    return sendJson(res,200,{ok:true,id:uid,operationId:opId,role,entitlementMode,projectIds:scope.projectIds,claimsDigest:afterDigest});
  }catch(error){
    try{await auth.setCustomUserClaims(uid,previousClaims);}catch{}
    try{await ref.set(beforeDoc.data(),{merge:false});}catch{}
    throw error;
  }
}
async function updateProfile(req,res,tenantId,uid,caller){
  const body=await readJson(req);
  const {db}=ensureAdmin();
  const ref=db.collection('tenants').doc(tenantId).collection('users').doc(uid);
  const before=await ref.get();
  if(!before.exists) throw Object.assign(new Error('user_not_found'),{statusCode:404});
  const allowed={};
  for(const key of ['displayName','contactEmail','countries','clientId','personLabel']) if(Object.prototype.hasOwnProperty.call(body,key)) allowed[key]=key==='countries'?(Array.isArray(body[key])?body[key].map(String):[]):(body[key]==null?null:String(body[key]).trim());
  if(!Object.keys(allowed).length) throw Object.assign(new Error('no_editable_profile_fields'),{statusCode:400});
  const opId=operationId(req,tenantId,'profile',uid,allowed);
  const auditRef=db.collection('tenants').doc(tenantId).collection('auditLogs').doc(opId);
  if((await auditRef.get()).exists) return sendJson(res,200,{ok:true,idempotent:true,operationId:opId});
  await ref.update({...allowed,lastAdminActionId:opId,updatedAt:FieldValue.serverTimestamp()});
  await writeAudit(db,tenantId,{action:'USER_PROFILE_UPDATE',targetUid:uid,callerUid:caller.uid,operationId:opId,metadata:{fields:Object.keys(allowed).sort()}});
  const after=await ref.get();
  if(!after.exists) throw new Error('profile_readback_mismatch');
  return sendJson(res,200,{ok:true,id:uid,operationId:opId});
}
async function setActive(req,res,tenantId,uid,caller,active){
  const {auth,db}=ensureAdmin();
  const ref=db.collection('tenants').doc(tenantId).collection('users').doc(uid);
  const beforeDoc=await ref.get();
  if(!beforeDoc.exists) throw Object.assign(new Error('user_not_found'),{statusCode:404});
  const beforeAuth=await auth.getUser(uid);
  const opId=operationId(req,tenantId,active?'reactivate':'disable',uid,{active});
  const auditRef=db.collection('tenants').doc(tenantId).collection('auditLogs').doc(opId);
  if((await auditRef.get()).exists) return sendJson(res,200,{ok:true,idempotent:true,operationId:opId});
  try{
    await auth.updateUser(uid,{disabled:!active});
    await ref.update({active,lastAdminActionId:opId,updatedAt:FieldValue.serverTimestamp()});
    await writeAudit(db,tenantId,{action:active?'USER_REACTIVATE':'USER_DISABLE',targetUid:uid,callerUid:caller.uid,operationId:opId});
    const readback=await auth.getUser(uid);
    if(readback.disabled===active) throw new Error('active_state_readback_mismatch');
    return sendJson(res,200,{ok:true,id:uid,active,operationId:opId});
  }catch(error){
    try{await auth.updateUser(uid,{disabled:beforeAuth.disabled});}catch{}
    try{await ref.set(beforeDoc.data(),{merge:false});}catch{}
    throw error;
  }
}

function matchRoute(pathname){
  const m=String(pathname||'').match(/^\/(?:api\/)?v?1?\/?tenants\/([^/]+)\/users(?:\/([^/:]+)(?:\/(profile|scope))?|\/([^/:]+):(disable|reactivate))?\/?$/);
  if(!m) return null;
  return {tenantId:decodeURIComponent(m[1]),uid:decodeURIComponent(m[2]||m[4]||''),sub:m[3]||m[5]||''};
}
export function isLiveUserAdminPath(pathname){return Boolean(matchRoute(pathname));}

export async function maybeHandleLiveUserAdminRequest(req,res,url){
  const route=matchRoute(url.pathname);
  if(!route) return false;
  try{
    const caller=await authorize(req,route.tenantId);
    if(req.method==='GET'&&!route.uid) return await listUsers(req,res,route.tenantId,caller),true;
    if(req.method==='POST'&&!route.uid) return await createUser(req,res,route.tenantId,caller),true;
    if(req.method==='PATCH'&&route.uid&&route.sub==='profile') return await updateProfile(req,res,route.tenantId,route.uid,caller),true;
    if(req.method==='PATCH'&&route.uid&&route.sub==='scope') return await updateScope(req,res,route.tenantId,route.uid,caller),true;
    if(req.method==='POST'&&route.uid&&route.sub==='disable') return await setActive(req,res,route.tenantId,route.uid,caller,false),true;
    if(req.method==='POST'&&route.uid&&route.sub==='reactivate') return await setActive(req,res,route.tenantId,route.uid,caller,true),true;
    sendJson(res,405,{ok:false,error:'method_not_allowed'});
  }catch(error){
    console.error('[CX.user-admin] '+String(error?.message||error));
    sendJson(res,Number(error?.statusCode||500),{ok:false,error:String(error?.message||'user_admin_failed').slice(0,120),details:error?.details||undefined});
  }
  return true;
}
