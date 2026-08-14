#!/usr/bin/env node
import fs from 'node:fs';
import http from 'node:http';
import crypto from 'node:crypto';
import admin from 'firebase-admin';

const VERSION='cxorbia-shopper-command-provider-v1';
const PROJECT=process.env.CXORBIA_EXPECTED_PROJECT||'cxorbia-backend-dev';
const REQUEST=process.env.CXORBIA_I3_REQUEST||'.github/cxorbia-firebase-requests/cxorbia-i3-shopper-persistence-exact-write-v1.json';
const PRIVATE_NEW=process.env.CXORBIA_I3_PRIVATE_NEW_CREDENTIAL||'.tmp/cxorbia-i3-private/new-shopper.json';
const PRIVATE_EXISTING=process.env.CXORBIA_I3_PRIVATE_EXISTING_CREDENTIALS||'.tmp/cxorbia-i3-private/existing-e2e.json';
const PORT=Number(process.env.CXORBIA_I3_COMMAND_PORT||4180);
const ALLOW_ORIGIN=String(process.env.CXORBIA_I3_ALLOW_LOCAL_ORIGIN||'');
const str=v=>String(v==null?'':v).trim();
const list=v=>Array.isArray(v)?v.map(str).filter(Boolean):[];
const uniq=v=>[...new Set(list(v))].sort();
const stable=value=>Array.isArray(value)?value.map(stable):(value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value);
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value)),'utf8').digest('hex');
const fp=(kind,value)=>sha(kind+'\0'+str(value)).slice(0,20);
const internalEmail=(login,tenantId)=>sha(`${tenantId}\0shopper\0${str(login).toLowerCase()}`).slice(0,48)+'@auth.cxorbia.invalid';
const visibleLogin=(profile,shopperId)=>{
  const token=v=>str(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'');
  const first=token(profile.firstName||str(profile.nombre).split(/\s+/)[0]);const last=token(profile.lastName||'');
  if(!first||!last)throw new Error('SHOPPER_LOGIN_SOURCE_INCOMPLETE');
  return `${first}.${last}.${sha(shopperId).slice(0,6)}`;
};
const canonicalClaims=(shopperId,tenantId,projectId)=>({authNamespace:'shopper',projectIds:[projectId],role:'shopper',shopperId,tenantId});
const claimsDigest=claims=>sha(canonicalClaims(claims.shopperId,claims.tenantId,uniq(claims.projectIds)[0]||''));
const uidFingerprint=uid=>sha('cxorbia-provider-uid-v1\0'+uid);
const clean=value=>Array.isArray(value)?value.map(clean):(value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([,v])=>v!==undefined&&typeof v!=='function').map(([k,v])=>[k,clean(v)])):value);
const nonEmptyObject=o=>Object.values(o||{}).some(v=>Array.isArray(v)?v.length>0:str(v)!=='');

function request(){
  if(!fs.existsSync(REQUEST))throw new Error('I3_REQUEST_MISSING');
  const r=JSON.parse(fs.readFileSync(REQUEST,'utf8'));
  if(r.schemaVersion!=='cxorbia.i3.shopper-persistence-exact-write.request.v1'||r.repository!=='paulaosoriof86/demoCXOrbia'||r.branch!=='docs-tya-v6-v71-audit'||Number(r.pullRequest)!==7)throw new Error('I3_REQUEST_LANE_INVALID');
  if(r.firebaseProjectId!==PROJECT||r.tenantId!=='tya'||r.projectId!=='cinepolis')throw new Error('I3_REQUEST_PROVIDER_TARGET_INVALID');
  if(r.enabled!==true||r.consumed!==false||r.authorizedBy!=='Paula'||r.allowedExecutions!==1||r.status!=='authorized_execute_once')throw new Error('I3_REQUEST_NOT_AUTHORIZED');
  const recovery=r.continuationMode==='historical_credential_recovery_resume';
  if(recovery&&(r.continuationOfRequestId!=='cxorbia-i3-shopper-persistence-20260814-01'||r.priorStopRetryCode!=='HOLD_SHOPPER_R109_U104_V1_D1_H0_S0_M616_L208_P194'))throw new Error('I3_RECOVERY_CONTINUATION_INVALID');
  const expectedAuthWrites=recovery?3:2;const expectedPasswordResets=recovery?1:0;
  if(r.authWritesMax!==expectedAuthWrites||r.firestoreWritesMax!==10||r.authDeletesMax!==1||r.stopRetry!==true)throw new Error('I3_REQUEST_BUDGET_INVALID');
  for(const k of ['hrWrites','rulesWrites','storageWrites','makeWrites','geminiCalls','paymentsWrites','deploys'])if(r[k]!==0)throw new Error('I3_UNSAFE_SCOPE_'+k);
  if(r.merge!==false||r.production!==false||r.fuzzyMatchingAllowed!==false||r.passwordResets!==expectedPasswordResets)throw new Error('I3_UNSAFE_POLICY');
  return r;
}
function init(){
  const credential=process.env.GOOGLE_APPLICATION_CREDENTIALS;if(!credential||!fs.existsSync(credential))throw new Error('I3_SERVICE_ACCOUNT_MISSING');
  const sa=JSON.parse(fs.readFileSync(credential,'utf8'));if(sa.project_id!==PROJECT)throw new Error('I3_SERVICE_ACCOUNT_PROJECT_MISMATCH');
  if(!admin.apps.length)admin.initializeApp({credential:admin.credential.cert(sa),projectId:PROJECT});
  return {auth:admin.auth(),db:admin.firestore()};
}
function membershipDoc(uid,claims){return {active:true,tenantId:claims.tenantId,role:'shopper',authNamespace:'shopper',shopperId:claims.shopperId,projectIds:uniq(claims.projectIds),providerUidFingerprint:uidFingerprint(uid),claimsDigest:claimsDigest(claims),membershipVersion:'cxorbia-shopper-membership-v1',updatedAt:admin.firestore.FieldValue.serverTimestamp()};}
function crosswalkDoc(uid,claims,profile){return {tenantId:claims.tenantId,shopperId:claims.shopperId,projectIds:uniq(claims.projectIds),authNamespace:'shopper',providerUidFingerprint:uidFingerprint(uid),internalEmailFingerprint:fp('internal-email',internalEmail(profile.user||'',claims.tenantId)),legacyShopperId:str(profile.legacyShopperId)||null,identityMode:'exact_technical_keys_only',fuzzyMatching:false,updatedAt:admin.firestore.FieldValue.serverTimestamp()};}
function claimsSemanticallyExact(c,shopperId,tenantId,projectId){return c?.tenantId===tenantId&&c?.role==='shopper'&&c?.authNamespace==='shopper'&&c?.shopperId===shopperId&&uniq(c?.projectIds).length===1&&uniq(c?.projectIds)[0]===projectId&&(!c?.projectId||c.projectId===projectId);}
async function exactActor(auth,db,token,tenantId,projectId){
  const decoded=await auth.verifyIdToken(token,true);const role=str(decoded.role);
  if(!['super','admin'].includes(role)||decoded.tenantId!==tenantId||str(decoded.authNamespace||'staff')!=='staff')throw new Error('I3_ACTOR_SCOPE_DENIED');
  if(role!=='super'&&!uniq(decoded.projectIds).includes(projectId))throw new Error('I3_ACTOR_PROJECT_DENIED');
  const snap=await db.collection('tenants').doc(tenantId).collection('users').doc(decoded.uid).get();
  if(!snap.exists)throw new Error('I3_ACTOR_MEMBERSHIP_MISSING');const m=snap.data()||{};
  if(m.active!==true||m.tenantId!==tenantId||str(m.role)!==role||str(m.authNamespace)!=='staff')throw new Error('I3_ACTOR_MEMBERSHIP_INVALID');
  if(role!=='super'&&!uniq(m.projectIds).includes(projectId))throw new Error('I3_ACTOR_MEMBERSHIP_PROJECT_DENIED');
  return {uid:decoded.uid,role};
}
async function receipt(db,r,command){
  const key=sha(`${r.requestId}\0${command.idempotencyKey}`).slice(0,40);const ref=db.collection('tenants').doc(r.tenantId).collection('commandReceipts').doc(key);const snap=await ref.get();
  const digest=sha(clean(command));if(!snap.exists)return {ref,key,digest,prior:null};const prior=snap.data()||{};
  if(prior.commandDigest!==digest)throw new Error('I3_IDEMPOTENCY_KEY_REUSED_DIFFERENT_PAYLOAD');return {ref,key,digest,prior};
}
function ack(command,entityId,extra={}){return {ok:true,status:'committed',committed:true,providerAck:true,successUiAllowed:true,localMutation:false,localStorageWrite:false,commandType:command.commandType,entityType:'shopper',entityId,tenantId:command.tenantId,projectId:command.projectId,idempotencyKey:command.idempotencyKey,...extra};}
async function createShopper(auth,db,r,command){
  if(command.expectedVersion!=='absent')throw new Error('I3_CREATE_EXPECTED_VERSION_INVALID');
  if(nonEmptyObject(command.payload?.protectedProfile))throw new Error('I3_PROTECTED_PROFILE_REQUIRES_ENCRYPTED_PROVIDER');
  const profile=clean(command.payload?.profile||{});if(!str(profile.firstName||profile.nombre)||!str(profile.lastName))throw new Error('I3_CREATE_PROFILE_INCOMPLETE');
  const shopperId='shp-i3-'+crypto.randomUUID();const login=visibleLogin(profile,shopperId);const email=internalEmail(login,r.tenantId);const uid='tya-sh-'+sha(`${r.tenantId}\0shopper\0${login}`).slice(0,24);const claims=canonicalClaims(shopperId,r.tenantId,r.projectId);
  const rec=await receipt(db,r,command);if(rec.prior?.status==='committed')return ack(command,rec.prior.entityId,{idempotentReplay:true});
  const profileRef=db.collection('tenants').doc(r.tenantId).collection('shoppers').doc(shopperId);const crossRef=db.collection('tenants').doc(r.tenantId).collection('shopperIdentityCrosswalk').doc(shopperId);const memberRef=db.collection('tenants').doc(r.tenantId).collection('users').doc(uid);
  if((await profileRef.get()).exists||(await crossRef.get()).exists||(await memberRef.get()).exists)throw new Error('I3_CREATE_FIRESTORE_COLLISION');
  for(const getter of [()=>auth.getUser(uid),()=>auth.getUserByEmail(email)]){try{await getter();throw new Error('I3_CREATE_AUTH_COLLISION');}catch(e){if(String(e.code||'')!=='auth/user-not-found')throw e;}}
  const password=crypto.randomBytes(24).toString('base64url')+'!Aa1';let created=false;
  try{
    await auth.createUser({uid,email,password,emailVerified:false,disabled:false});created=true;await auth.setCustomUserClaims(uid,claims);
    const p={id:shopperId,shopperId,tenantId:r.tenantId,projectIds:[r.projectId],firstName:str(profile.firstName),lastName:str(profile.lastName),nombre:str(profile.nombre)||`${str(profile.firstName)} ${str(profile.lastName)}`.trim(),whatsapp:str(profile.whatsapp),email:str(profile.email),pais:str(profile.pais||profile.country),country:str(profile.country||profile.pais),depto:str(profile.depto),ciudad:str(profile.ciudad),sexo:str(profile.sexo),edad:str(profile.edad),estado:str(profile.estado)||'Pendiente',sourceType:'platform',createdVia:'manual',user:login,perfilCompleto:false,version:1,testFixture:true,createdAt:admin.firestore.FieldValue.serverTimestamp(),updatedAt:admin.firestore.FieldValue.serverTimestamp()};
    const batch=db.batch();batch.set(profileRef,p);batch.set(memberRef,membershipDoc(uid,claims));batch.set(crossRef,crosswalkDoc(uid,claims,p));batch.set(rec.ref,{status:'committed',commandDigest:rec.digest,entityId:shopperId,commandType:command.commandType,providerAck:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()});await batch.commit();
    fs.mkdirSync(PRIVATE_NEW.split('/').slice(0,-1).join('/')||'.',{recursive:true});fs.writeFileSync(PRIVATE_NEW,JSON.stringify({schemaVersion:'cxorbia.i3.private-new-shopper.v1',login,password,shopperId,uid})+'\n',{encoding:'utf8',mode:0o600});
    return ack(command,shopperId,{visibleLogin:login,profileVersion:1});
  }catch(error){if(created){try{await auth.deleteUser(uid);}catch(_){}}throw error;}
}
async function updateShopper(auth,db,r,command){
  const shopperId=str(command.entityId||command.payload?.shopperId);if(!shopperId)throw new Error('I3_UPDATE_SHOPPER_ID_REQUIRED');if(nonEmptyObject(command.payload?.protectedPatch))throw new Error('I3_PROTECTED_PATCH_REQUIRES_ENCRYPTED_PROVIDER');
  const ref=db.collection('tenants').doc(r.tenantId).collection('shoppers').doc(shopperId);const snap=await ref.get();if(!snap.exists)throw new Error('I3_UPDATE_PROFILE_MISSING');const current=snap.data()||{};
  if(str(current.tenantId||r.tenantId)!==r.tenantId)throw new Error('I3_UPDATE_TENANT_MISMATCH');const currentVersion=Number(current.version||1);if(str(command.expectedVersion)!==str(currentVersion))throw new Error('I3_UPDATE_VERSION_CONFLICT');
  const cross=await db.collection('tenants').doc(r.tenantId).collection('shopperIdentityCrosswalk').doc(shopperId).get();if(!cross.exists||str(cross.data()?.shopperId)!==shopperId)throw new Error('I3_UPDATE_CROSSWALK_MISSING');
  const rec=await receipt(db,r,command);if(rec.prior?.status==='committed')return ack(command,shopperId,{idempotentReplay:true,profileVersion:rec.prior.profileVersion});
  const patch=clean(command.payload?.patch||{});delete patch.id;delete patch.shopperId;delete patch.tenantId;delete patch.user;delete patch.version;const nextVersion=currentVersion+1;
  const batch=db.batch();batch.set(ref,{...patch,version:nextVersion,updatedAt:admin.firestore.FieldValue.serverTimestamp()},{merge:true});batch.set(rec.ref,{status:'committed',commandDigest:rec.digest,entityId:shopperId,profileVersion:nextVersion,commandType:command.commandType,providerAck:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()});await batch.commit();return ack(command,shopperId,{profileVersion:nextVersion});
}
async function executeCommand(token,command){
  const r=request();if(command?.version!=='cxorbia-command-adapter-v1'||!['shopper.create','shopper.update'].includes(command?.commandType))throw new Error('I3_COMMAND_NOT_ALLOWED');if(command.tenantId!==r.tenantId||command.projectId!==r.projectId)throw new Error('I3_COMMAND_SCOPE_MISMATCH');
  const {auth,db}=init();await exactActor(auth,db,token,r.tenantId,r.projectId);return command.commandType==='shopper.create'?createShopper(auth,db,r,command):updateShopper(auth,db,r,command);
}
async function recoverHistoricalCredential(){
  const r=request();if(r.continuationMode!=='historical_credential_recovery_resume'||r.passwordResets!==1)throw new Error('I3_RECOVERY_NOT_AUTHORIZED');
  if(!fs.existsSync(PRIVATE_EXISTING))throw new Error('I3_HISTORICAL_PRIVATE_CREDENTIAL_MISSING');const envelope=JSON.parse(fs.readFileSync(PRIVATE_EXISTING,'utf8'));const h=envelope.shopper||{};
  if(!h.credentialRecoveryRequired||str(h.password)||!str(h.login)||!str(h.uid)||!str(h.shopperId||h.canonicalShopperId))throw new Error('I3_RECOVERY_CANDIDATE_INVALID');
  const shopperId=str(h.canonicalShopperId||h.shopperId);const {auth,db}=init();const byUid=await auth.getUser(str(h.uid));const byEmail=await auth.getUserByEmail(internalEmail(h.login,r.tenantId));
  if(byUid.uid!==byEmail.uid)throw new Error('I3_RECOVERY_UID_EMAIL_CONFLICT');const claimsBefore=clean(byUid.customClaims||{});if(!claimsSemanticallyExact(claimsBefore,shopperId,r.tenantId,r.projectId))throw new Error('I3_RECOVERY_CLAIMS_NOT_EXACT');
  const profileRef=db.collection('tenants').doc(r.tenantId).collection('shoppers').doc(shopperId);const memberRef=db.collection('tenants').doc(r.tenantId).collection('users').doc(byUid.uid);const crossRef=db.collection('tenants').doc(r.tenantId).collection('shopperIdentityCrosswalk').doc(shopperId);const historyRef=db.collection('tenants').doc(r.tenantId).collection('projects').doc(r.projectId).collection('visits');
  const [profileBefore,memberBefore,crossBefore,historyBefore]=await Promise.all([profileRef.get(),memberRef.get(),crossRef.get(),historyRef.where('shopperId','==',shopperId).get()]);if(!profileBefore.exists)throw new Error('I3_RECOVERY_PROFILE_MISSING');if(historyBefore.size<1)throw new Error('I3_RECOVERY_HISTORY_MISSING');
  if(memberBefore.exists){const m=memberBefore.data()||{};if(m.tenantId!==r.tenantId||m.role!=='shopper'||m.authNamespace!=='shopper'||m.shopperId!==shopperId)throw new Error('I3_RECOVERY_MEMBERSHIP_CONFLICT');}
  if(crossBefore.exists){const c=crossBefore.data()||{};if(c.tenantId!==r.tenantId||c.shopperId!==shopperId||c.providerUidFingerprint!==uidFingerprint(byUid.uid))throw new Error('I3_RECOVERY_CROSSWALK_CONFLICT');}
  const fingerprints={profile:sha(clean(profileBefore.data()||{})),membership:memberBefore.exists?sha(clean(memberBefore.data()||{})):null,crosswalk:crossBefore.exists?sha(clean(crossBefore.data()||{})):null,history:sha(historyBefore.docs.map(d=>({id:d.id,data:clean(d.data()||{})})))};
  const password=crypto.randomBytes(24).toString('base64url')+'!Aa1';await auth.updateUser(byUid.uid,{password});
  const [after,profileAfter,memberAfter,crossAfter,historyAfter]=await Promise.all([auth.getUser(byUid.uid),profileRef.get(),memberRef.get(),crossRef.get(),historyRef.where('shopperId','==',shopperId).get()]);
  if(after.uid!==byUid.uid||str(after.email).toLowerCase()!==str(byUid.email).toLowerCase()||sha(clean(after.customClaims||{}))!==sha(claimsBefore))throw new Error('I3_RECOVERY_AUTH_IDENTITY_DRIFT');
  if(!profileAfter.exists||sha(clean(profileAfter.data()||{}))!==fingerprints.profile)throw new Error('I3_RECOVERY_PROFILE_DRIFT');
  if(memberAfter.exists!==memberBefore.exists||(memberAfter.exists&&sha(clean(memberAfter.data()||{}))!==fingerprints.membership))throw new Error('I3_RECOVERY_MEMBERSHIP_DRIFT');
  if(crossAfter.exists!==crossBefore.exists||(crossAfter.exists&&sha(clean(crossAfter.data()||{}))!==fingerprints.crosswalk))throw new Error('I3_RECOVERY_CROSSWALK_DRIFT');
  if(historyAfter.size!==historyBefore.size||sha(historyAfter.docs.map(d=>({id:d.id,data:clean(d.data()||{})})))!==fingerprints.history)throw new Error('I3_RECOVERY_HISTORY_DRIFT');
  envelope.shopper={...h,password,credentialRecoveryRequired:false,credentialRecovered:true};fs.writeFileSync(PRIVATE_EXISTING,JSON.stringify(envelope,null,2)+'\n',{encoding:'utf8',mode:0o600});
  return {decision:'PASS_I3_HISTORICAL_EXACT_CREDENTIAL_RECOVERY',shopperIdFingerprint:fp('shopper',shopperId),uidFingerprint:fp('uid',byUid.uid),uidPreserved:true,claimsPreserved:true,profilePreserved:true,membershipPreserved:true,crosswalkPreserved:true,historyPreserved:true,historyCount:historyAfter.size,authWrites:1,passwordChanges:1,passwordResets:1,otherIdentitiesModified:0,fuzzyMatching:false,credentialsExposed:false};
}
async function reconcileHistorical(){
  const r=request();if(!fs.existsSync(PRIVATE_EXISTING))throw new Error('I3_HISTORICAL_PRIVATE_CREDENTIAL_MISSING');const envelope=JSON.parse(fs.readFileSync(PRIVATE_EXISTING,'utf8'));const h=envelope.shopper||{};if(!str(h.login)||!str(h.shopperId||h.canonicalShopperId))throw new Error('I3_HISTORICAL_PRIVATE_IDENTITY_INCOMPLETE');const shopperId=str(h.canonicalShopperId||h.shopperId);const {auth,db}=init();const user=await auth.getUserByEmail(internalEmail(h.login,r.tenantId));const claims=user.customClaims||{};
  if(!claimsSemanticallyExact(claims,shopperId,r.tenantId,r.projectId))throw new Error('I3_HISTORICAL_CLAIMS_NOT_EXACT');const profileRef=db.collection('tenants').doc(r.tenantId).collection('shoppers').doc(shopperId);const ps=await profileRef.get();if(!ps.exists)throw new Error('I3_HISTORICAL_PROFILE_MISSING');const profile={id:ps.id,...(ps.data()||{})};
  const memberRef=db.collection('tenants').doc(r.tenantId).collection('users').doc(user.uid);const crossRef=db.collection('tenants').doc(r.tenantId).collection('shopperIdentityCrosswalk').doc(shopperId);let writes=0;
  const ms=await memberRef.get();const desiredMembership=membershipDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId));if(ms.exists){const m=ms.data()||{};if(m.tenantId!==r.tenantId||m.role!=='shopper'||m.authNamespace!=='shopper'||m.shopperId!==shopperId)throw new Error('I3_HISTORICAL_MEMBERSHIP_CONFLICT');const needs=m.active!==true||JSON.stringify(uniq(m.projectIds))!==JSON.stringify([r.projectId])||str(m.providerUidFingerprint)!==uidFingerprint(user.uid)||str(m.claimsDigest)!==claimsDigest(canonicalClaims(shopperId,r.tenantId,r.projectId));if(needs){await memberRef.set(desiredMembership,{merge:true});writes++;}}else{await memberRef.set(desiredMembership);writes++;}
  const cs=await crossRef.get();const desiredCross=crosswalkDoc(user.uid,canonicalClaims(shopperId,r.tenantId,r.projectId),Object.assign({},profile,{user:profile.user||h.login}));if(cs.exists){const c=cs.data()||{};if(c.tenantId!==r.tenantId||c.shopperId!==shopperId||c.providerUidFingerprint!==uidFingerprint(user.uid))throw new Error('I3_HISTORICAL_CROSSWALK_CONFLICT');const needs=c.identityMode!=='exact_technical_keys_only'||c.fuzzyMatching!==false||JSON.stringify(uniq(c.projectIds))!==JSON.stringify([r.projectId]);if(needs){await crossRef.set(desiredCross,{merge:true});writes++;}}else{await crossRef.set(desiredCross);writes++;}
  return {decision:'PASS_I3_HISTORICAL_EXACT_RECONCILIATION',shopperIdFingerprint:fp('shopper',shopperId),uidFingerprint:fp('uid',user.uid),profile:true,claims:true,membership:true,crosswalk:true,authWrites:0,firestoreWrites:writes,passwordChanges:0,passwordResets:0,fuzzyMatching:false};
}
async function readbackNew(){
  const r=request();if(!fs.existsSync(PRIVATE_NEW))throw new Error('I3_NEW_PRIVATE_CREDENTIAL_MISSING');const p=JSON.parse(fs.readFileSync(PRIVATE_NEW,'utf8'));const {auth,db}=init();const user=await auth.getUser(p.uid);const claims=user.customClaims||{};if(!claimsSemanticallyExact(claims,p.shopperId,r.tenantId,r.projectId))throw new Error('I3_NEW_CLAIMS_READBACK_FAILED');
  const [profile,member,cross]=await Promise.all([db.collection('tenants').doc(r.tenantId).collection('shoppers').doc(p.shopperId).get(),db.collection('tenants').doc(r.tenantId).collection('users').doc(p.uid).get(),db.collection('tenants').doc(r.tenantId).collection('shopperIdentityCrosswalk').doc(p.shopperId).get()]);if(!profile.exists||!member.exists||!cross.exists)throw new Error('I3_NEW_FIRESTORE_READBACK_FAILED');
  return {decision:'PASS_I3_NEW_SHOPPER_PROVIDER_READBACK',shopperIdFingerprint:fp('shopper',p.shopperId),uidFingerprint:fp('uid',p.uid),profileVersion:Number(profile.data()?.version||0),claims:true,membership:true,crosswalk:true,passwordProvider:(user.providerData||[]).some(x=>x.providerId==='password'),credentialsExposed:false,tokensExposed:false};
}
function send(res,status,body){res.statusCode=status;res.setHeader('content-type','application/json; charset=utf-8');res.setHeader('cache-control','no-store');if(ALLOW_ORIGIN)res.setHeader('access-control-allow-origin',ALLOW_ORIGIN);res.end(JSON.stringify(body)+'\n');}
async function serve(){request();init();const server=http.createServer(async(req,res)=>{if(ALLOW_ORIGIN&&req.method==='OPTIONS'){res.statusCode=204;res.setHeader('access-control-allow-origin',ALLOW_ORIGIN);res.setHeader('access-control-allow-methods','POST,OPTIONS');res.setHeader('access-control-allow-headers','authorization,content-type,cache-control');return res.end();}if(req.method==='GET'&&req.url==='/health')return send(res,200,{ok:true,service:VERSION,project:PROJECT,providerWritesAuthorized:true,production:false});if(req.method!=='POST'||req.url!=='/v1/commands')return send(res,404,{ok:false,code:'NOT_FOUND'});try{const authz=str(req.headers.authorization);if(!authz.startsWith('Bearer '))throw new Error('I3_BEARER_REQUIRED');let raw='';for await(const c of req){raw+=c;if(raw.length>65536)throw new Error('I3_BODY_TOO_LARGE');}const result=await executeCommand(authz.slice(7),JSON.parse(raw));return send(res,200,result);}catch(e){return send(res,409,{ok:false,status:'blocked',committed:false,providerAck:false,successUiAllowed:false,localMutation:false,localStorageWrite:false,code:str(e?.message||e),providerWrites:0});}});server.listen(PORT,'127.0.0.1',()=>console.log(JSON.stringify({decision:'I3_COMMAND_PROVIDER_LISTENING',port:PORT,project:PROJECT})));}

const mode=process.argv[2]||'--serve';
if(mode==='--self-test'){request();console.log(JSON.stringify({decision:'PASS_I3_SHOPPER_COMMAND_PROVIDER_SOURCE',version:VERSION,fuzzyMatching:false,hrWrites:0,storageWrites:0,deploys:0,production:false}));}
else if(mode==='--recover-historical-credential')console.log(JSON.stringify(await recoverHistoricalCredential()));
else if(mode==='--reconcile-historical')console.log(JSON.stringify(await reconcileHistorical()));
else if(mode==='--readback-new')console.log(JSON.stringify(await readbackNew()));
else await serve();
