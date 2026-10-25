import crypto from 'node:crypto';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import {
  createLegalAcceptanceProvider,
  LEGAL_COMMAND_TYPE
} from '../cxorbia-legal-acceptance-provider-v1.mjs';

const EXPECTED_PROJECT='cxorbia-backend-dev';
const MAX_BODY_BYTES=64*1024;
const WRITE_ENABLE_ENV='CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_ENABLED';
const WRITE_GATE_ENV='CXORBIA_I3_LEGAL_ACCEPTANCE_WRITE_GATE';
const EXPECTED_WRITE_GATE='PAULA_DEV_DEPLOY_FOR_I3_HUMAN_LEGAL_ACCEPTANCE_RUNTIME';

const str=value=>String(value==null?'':value).trim();
const arr=value=>Array.isArray(value)?value:[];
const sha256=value=>crypto.createHash('sha256').update(String(value),'utf8').digest('hex');

function fail(code,statusCode=400,details={}){
  const error=new Error(code);
  error.code=code;
  error.statusCode=statusCode;
  error.details=details;
  throw error;
}

function projectId(){
  return str(process.env.GOOGLE_CLOUD_PROJECT||process.env.GCLOUD_PROJECT||EXPECTED_PROJECT);
}

function ensureAdmin(){
  const project=projectId();
  if(project!==EXPECTED_PROJECT) fail('LEGAL_RUNTIME_TARGET_PROJECT_INVALID',503);
  if(!getApps().length) initializeApp({credential:applicationDefault(),projectId:project});
  return {auth:getAuth(),db:getFirestore(),project};
}

function bearer(req){
  const value=str(req.headers.authorization);
  const match=value.match(/^Bearer\s+(.+)$/i);
  return match?str(match[1]):'';
}

async function readJson(req){
  let size=0,raw='';
  for await(const chunk of req){
    size+=chunk.length;
    if(size>MAX_BODY_BYTES) fail('LEGAL_RUNTIME_BODY_TOO_LARGE',413);
    raw+=chunk.toString('utf8');
  }
  if(!raw.trim()) return {};
  try{return JSON.parse(raw);}catch{fail('LEGAL_RUNTIME_INVALID_JSON',400);}
}

function sendJson(res,status,value){
  res.statusCode=status;
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(value));
}

function publicError(error){
  const code=str(error?.code||error?.message||'LEGAL_RUNTIME_FAILED');
  const safe=/^LEGAL_[A-Z0-9_]+$/.test(code)?code:'LEGAL_RUNTIME_FAILED';
  return {ok:false,error:safe};
}

async function verifyActor(req,tenantId){
  const idToken=bearer(req);
  if(!idToken) fail('LEGAL_RUNTIME_AUTHORIZATION_REQUIRED',401);
  const {auth}=ensureAdmin();
  let decoded;
  try{decoded=await auth.verifyIdToken(idToken,true);}catch{fail('LEGAL_RUNTIME_INVALID_AUTHORIZATION',401);}
  const role=str(decoded.role||decoded.cxRole||decoded.userRole);
  const authNamespace=str(decoded.authNamespace||(role==='shopper'?'shopper':'staff'));
  if(str(decoded.tenantId)!==tenantId) fail('LEGAL_RUNTIME_TENANT_MISMATCH',403);
  if(!role||!authNamespace) fail('LEGAL_RUNTIME_ACTOR_SCOPE_INCOMPLETE',403);
  return {idToken,decoded,role,authNamespace};
}

function roleApplicable(role,roles){
  const exact=new Set(arr(roles).map(str).filter(Boolean));
  if(!exact.size) return true;
  if(exact.has(role)) return true;
  const aliases={super:'superadmin',ops:'operaciones',client:'cliente'};
  return Boolean(aliases[role]&&exact.has(aliases[role]));
}

async function resolveCurrentLegal(db,tenantId,role){
  const snap=await db.collection('tenants').doc(tenantId).collection('legalContents').get();
  const candidates=[];
  for(const doc of snap.docs){
    const data=doc.data()||{};
    if(data.active===false) continue;
    if(str(data.scopeMode||'tenant')!=='tenant') continue;
    if(!str(data.currentVersion)||!/^[a-f0-9]{64}$/.test(str(data.currentDigest).toLowerCase())) continue;
    if(!roleApplicable(role,data.roleApplicability)) continue;
    candidates.push({id:doc.id,data});
  }
  if(candidates.length!==1) fail('LEGAL_RUNTIME_CURRENT_CONTENT_AMBIGUOUS',409,{candidateCount:candidates.length});
  const selected=candidates[0];
  const versionRef=db.collection('tenants').doc(tenantId).collection('legalContents').doc(selected.id).collection('versions').doc(str(selected.data.currentVersion));
  const versionSnap=await versionRef.get();
  if(!versionSnap.exists) fail('LEGAL_RUNTIME_CURRENT_VERSION_MISSING',409);
  const version=versionSnap.data()||{};
  const digest=str(version.contentDigest).toLowerCase();
  if(digest!==str(selected.data.currentDigest).toLowerCase()) fail('LEGAL_RUNTIME_CURRENT_DIGEST_MISMATCH',409);
  if(version.active===false) fail('LEGAL_RUNTIME_CURRENT_VERSION_INACTIVE',409);
  if(!roleApplicable(role,version.roleApplicability||selected.data.roleApplicability)) fail('LEGAL_RUNTIME_ROLE_NOT_APPLICABLE',403);
  const renderedContent=String(version.renderedContent||'').replace(/\r\n?/g,'\n');
  if(!renderedContent.trim()) fail('LEGAL_RUNTIME_RENDERED_CONTENT_MISSING',409);
  if(sha256(renderedContent)!==digest) fail('LEGAL_RUNTIME_RENDERED_CONTENT_DIGEST_MISMATCH',409);
  if(/\{\{|\}\}|LEGAL_REVIEW_REQUIRED/.test(renderedContent)) fail('LEGAL_RUNTIME_UNSAFE_RENDERED_CONTENT',409);
  return {
    legalContentId:selected.id,
    legalVersion:str(selected.data.currentVersion),
    contentDigest:digest,
    scopeMode:'tenant',
    roleApplicability:arr(version.roleApplicability||selected.data.roleApplicability).map(str).filter(Boolean),
    counselStatus:str(version.counselStatus||selected.data.counselStatus)||null,
    interimGoLive:version.interimGoLive===true,
    renderedContent
  };
}

function providerFor(auth,db){
  return createLegalAcceptanceProvider({
    verifyIdToken:token=>auth.verifyIdToken(token,true),
    firestore:db,
    serverTimestamp:()=>FieldValue.serverTimestamp()
  });
}

function safeAcceptanceSnapshot(snapshot){
  const s=snapshot&&typeof snapshot==='object'?snapshot:{};
  const receipt=s.acceptance&&typeof s.acceptance==='object'?s.acceptance:null;
  return {
    authority:str(s.authority)||'provider',
    ready:s.ready===true,
    ambiguous:s.ambiguous===true,
    subjectExact:s.subjectExact===true,
    tenantId:str(s.tenantId)||null,
    scopeMode:str(s.scopeMode)||null,
    projectId:str(s.projectId)||null,
    role:str(s.role)||null,
    authNamespace:str(s.authNamespace)||null,
    legalContentId:str(s.legalContentId)||null,
    legalVersion:str(s.legalVersion)||null,
    contentDigest:str(s.contentDigest).toLowerCase()||null,
    pending:s.pending!==false,
    reasons:arr(s.reasons).map(str).filter(Boolean),
    acceptance:receipt?{
      status:str(receipt.status)||null,
      acceptanceMethod:str(receipt.acceptanceMethod)||null,
      subjectExact:receipt.subjectExact===true,
      tenantId:str(receipt.tenantId)||null,
      scopeMode:str(receipt.scopeMode)||null,
      projectId:str(receipt.projectId)||null,
      role:str(receipt.role)||null,
      authNamespace:str(receipt.authNamespace)||null,
      legalContentId:str(receipt.legalContentId)||null,
      legalVersion:str(receipt.legalVersion)||null,
      contentDigest:str(receipt.contentDigest).toLowerCase()||null,
      acceptedAt:receipt.acceptedAt||null
    }:null,
    actorUidReturned:false,
    rawToken:false
  };
}

async function currentResponse(req,res,tenantId){
  const actor=await verifyActor(req,tenantId);
  const {auth,db}=ensureAdmin();
  const current=await resolveCurrentLegal(db,tenantId,actor.role);
  const scope={tenantId,scopeMode:'tenant',projectId:null,role:actor.role,authNamespace:actor.authNamespace};
  const acceptanceRaw=await providerFor(auth,db).readModel({idToken:actor.idToken,scope,current});
  const acceptance=safeAcceptanceSnapshot(acceptanceRaw);
  return sendJson(res,200,{
    ok:true,
    authority:'provider',
    targetProject:EXPECTED_PROJECT,
    current:{
      legalContentId:current.legalContentId,
      legalVersion:current.legalVersion,
      contentDigest:current.contentDigest,
      scopeMode:current.scopeMode,
      counselStatus:current.counselStatus,
      interimGoLive:current.interimGoLive,
      renderedContent:current.renderedContent
    },
    acceptance,
    restrictedFieldsReturned:false,
    automaticAcceptance:false,
    humanAcceptanceRequired:true,
    actorUidReturned:false,
    rawToken:false
  });
}

function acceptanceWriteGate(){
  const enabled=process.env[WRITE_ENABLE_ENV]==='true'&&str(process.env[WRITE_GATE_ENV])===EXPECTED_WRITE_GATE;
  return {
    enabled,
    consumed:false,
    providerWriteAuthorized:enabled,
    targetProject:EXPECTED_PROJECT,
    commandType:LEGAL_COMMAND_TYPE,
    allowedExecutions:1,
    legalAcceptanceWrites:1,
    firestoreWrites:1,
    authWrites:0,
    passwordResets:0,
    historicalCredentialAccess:0,
    historicalReconciliationWrites:0,
    otherIdentityWrites:0,
    hrWrites:0,
    rulesWrites:0,
    storageWrites:0,
    makeWrites:0,
    geminiCalls:0,
    paymentWrites:0,
    automaticAcceptance:false,
    humanAcceptanceRequired:true
  };
}

async function recordAcceptance(req,res,tenantId){
  if(process.env[WRITE_ENABLE_ENV]!=='true'||str(process.env[WRITE_GATE_ENV])!==EXPECTED_WRITE_GATE){
    return sendJson(res,423,{ok:false,error:'LEGAL_RUNTIME_HUMAN_ACCEPTANCE_WRITE_GATE_DISABLED',automaticAcceptance:false,humanAcceptanceRequired:true});
  }
  const actor=await verifyActor(req,tenantId);
  const body=await readJson(req);
  const command=body&&typeof body==='object'?body.command:null;
  if(!command||str(command.commandType)!==LEGAL_COMMAND_TYPE) fail('LEGAL_RUNTIME_COMMAND_INVALID',400);
  if(command.payload?.humanConfirmed!==true) fail('LEGAL_RUNTIME_HUMAN_CONFIRMATION_REQUIRED',400);
  if(str(command.tenantId)!==tenantId) fail('LEGAL_RUNTIME_COMMAND_TENANT_MISMATCH',403);
  if(command.requireProject!==false||str(command.projectId)) fail('LEGAL_RUNTIME_COMMAND_SCOPE_INVALID',400);
  const {auth,db}=ensureAdmin();
  const current=await resolveCurrentLegal(db,tenantId,actor.role);
  if(str(command.payload?.legalContentId)!==current.legalContentId||str(command.payload?.legalVersion)!==current.legalVersion||str(command.payload?.contentDigest).toLowerCase()!==current.contentDigest){
    fail('LEGAL_RUNTIME_COMMAND_CURRENT_VERSION_MISMATCH',409);
  }
  const result=await providerFor(auth,db).record({idToken:actor.idToken,command,gate:acceptanceWriteGate()});
  return sendJson(res,200,{...result,automaticAcceptance:false,humanConfirmed:true,rawToken:false,actorUidReturned:false});
}

export function isLegalRuntimePath(pathname){
  return /^\/(?:api|v1)\/tenants\/[^/]+\/legal\/(?:current|commands)$/.test(String(pathname||''));
}

export async function maybeHandleLegalRuntimeRequest(req,res,url){
  const match=String(url.pathname||'').match(/^\/(?:api|v1)\/tenants\/([^/]+)\/legal\/(current|commands)$/);
  if(!match) return false;
  const tenantId=decodeURIComponent(match[1]);
  if(!tenantId||tenantId!=='tya') return sendJson(res,404,{ok:false,error:'LEGAL_RUNTIME_TENANT_NOT_AVAILABLE'}),true;
  try{
    if(match[2]==='current'){
      if(req.method!=='GET') return sendJson(res,405,{ok:false,error:'method_not_allowed'}),true;
      await currentResponse(req,res,tenantId);
      return true;
    }
    if(match[2]==='commands'){
      if(req.method!=='POST') return sendJson(res,405,{ok:false,error:'method_not_allowed'}),true;
      await recordAcceptance(req,res,tenantId);
      return true;
    }
    return false;
  }catch(error){
    const status=Number(error?.statusCode)||500;
    if(status>=500) console.error(`CXOrbia legal runtime failed: ${str(error?.code||error?.message||'unknown')}`);
    sendJson(res,status,publicError(error));
    return true;
  }
}

export function legalRuntimeSourceStatus(){
  return Object.freeze({
    targetProject:EXPECTED_PROJECT,
    providerAuthority:true,
    currentRead:true,
    humanAcceptanceEndpointPrepared:true,
    acceptanceWriteEnabledBySource:false,
    acceptanceWriteRequiresRuntimeEnvGate:true,
    expectedRuntimeGate:EXPECTED_WRITE_GATE,
    automaticAcceptance:false,
    humanAcceptanceRequired:true,
    clientActorUidForbidden:true,
    actorUidReturned:false,
    rawTokenReturned:false,
    localStorageAuthority:false,
    passwordResets:0,
    historicalCredentialAccess:0,
    historicalReconciliationWrites:0,
    deploys:0,
    production:false
  });
}
